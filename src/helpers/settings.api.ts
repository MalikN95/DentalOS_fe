import type {
  BranchSettings,
  ClinicSettings,
  CreateBranchPayload,
  UpdateClinicPayload,
} from '@/common/types/settings';
import type { PaginatedResult } from '@/common/types/pagination';
import { apiFetch } from '@/helpers/api-fetch';

type LogoUploadResponse = {
  uploadUrl: string;
  key: string;
};

export const fetchClinicSettings = (accessToken: string): Promise<ClinicSettings> =>
  apiFetch<ClinicSettings>(accessToken, '/api/clinic');

export const updateClinicSettings = (
  accessToken: string,
  payload: UpdateClinicPayload,
): Promise<ClinicSettings> =>
  apiFetch<ClinicSettings>(accessToken, '/api/clinic', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const requestClinicLogoUpload = (
  accessToken: string,
  contentType: string,
): Promise<LogoUploadResponse> =>
  apiFetch<LogoUploadResponse>(accessToken, '/api/clinic/logo-upload', {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  });

export const uploadFileToPresignedUrl = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (response.ok === false) {
    throw new Error('Не удалось загрузить логотип');
  }
};

export const fetchBranches = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<BranchSettings[]> =>
  apiFetch<PaginatedResult<BranchSettings>>(accessToken, '/api/branches?page=1&limit=200', {
    signal,
  }).then((result) => result.items);

export const createBranch = (
  accessToken: string,
  payload: CreateBranchPayload,
): Promise<BranchSettings> =>
  apiFetch<BranchSettings>(accessToken, '/api/branches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteBranch = (accessToken: string, branchId: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/branches/${branchId}`, {
    method: 'DELETE',
  });
