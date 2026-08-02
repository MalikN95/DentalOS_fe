import type {
  ApiChatMessage,
  ApiConversationSummary,
  ApiPatientMessage,
  ListPaginationParams,
} from '@/common/types/chat';
import type { PaginatedResult } from '@/common/types/pagination';
import { apiFetch } from '@/helpers/api-fetch';

const buildPaginationQuery = ({ page, limit }: ListPaginationParams): string =>
  new URLSearchParams({ page: String(page), limit: String(limit) }).toString();

export const fetchTeamChatMessages = (
  accessToken: string,
  params: ListPaginationParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiChatMessage>> =>
  apiFetch<PaginatedResult<ApiChatMessage>>(
    accessToken,
    `/api/chat/messages?${buildPaginationQuery(params)}`,
    { signal },
  );

export const sendTeamChatMessage = (
  accessToken: string,
  body: string,
): Promise<ApiChatMessage> =>
  apiFetch<ApiChatMessage>(accessToken, '/api/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const fetchPatientConversations = (
  accessToken: string,
  params: ListPaginationParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiConversationSummary>> =>
  apiFetch<PaginatedResult<ApiConversationSummary>>(
    accessToken,
    `/api/chat/patient-messages/conversations?${buildPaginationQuery(params)}`,
    { signal },
  );

export const fetchPatientMessages = (
  accessToken: string,
  patientId: string,
  params: ListPaginationParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiPatientMessage>> =>
  apiFetch<PaginatedResult<ApiPatientMessage>>(
    accessToken,
    `/api/chat/patient-messages?patientId=${patientId}&${buildPaginationQuery(params)}`,
    { signal },
  );
