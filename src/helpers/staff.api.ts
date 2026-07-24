import type { PaginatedResult } from '@/common/types/pagination';
import type {
  CreateStaffPayload,
  ListStaffParams,
  StaffMember,
  UpdateStaffPayload,
} from '@/common/types/staff';
import { apiFetch } from '@/helpers/api-fetch';

const buildListQuery = ({ page, limit, search, role, isActive }: ListStaffParams): string => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  const trimmed = search?.trim();
  if (trimmed) {
    params.set('search', trimmed);
  }

  if (role) {
    params.set('role', role);
  }

  if (typeof isActive === 'boolean') {
    params.set('isActive', String(isActive));
  }

  return params.toString();
};

export const fetchStaff = (
  accessToken: string,
  params: ListStaffParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<StaffMember>> =>
  apiFetch<PaginatedResult<StaffMember>>(accessToken, `/api/staff?${buildListQuery(params)}`, {
    signal,
  });

export const createStaff = (
  accessToken: string,
  payload: CreateStaffPayload,
): Promise<StaffMember> =>
  apiFetch<StaffMember>(accessToken, '/api/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateStaff = (
  accessToken: string,
  id: string,
  payload: UpdateStaffPayload,
): Promise<StaffMember> =>
  apiFetch<StaffMember>(accessToken, `/api/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteStaff = (accessToken: string, id: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/staff/${id}`, { method: 'DELETE' });
