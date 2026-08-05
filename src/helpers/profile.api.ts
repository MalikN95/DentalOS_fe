import { apiFetch } from '@/helpers/api-fetch';

export const MY_PROFILE_QUERY_KEY = ['profile', 'me'] as const;

export type MyProfile = {
  id: string;
  clinicId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
};

// Email is deliberately NOT here — changing it always goes through
// requestEmailChange/confirmEmailChange (OTP-verified) below, never a blind PATCH.
export type UpdateMyProfilePayload = {
  firstName?: string;
  lastName?: string;
  avatarKey?: string;
};

type AvatarUploadResponse = {
  uploadUrl: string;
  key: string;
};

export const fetchMyProfile = (accessToken: string): Promise<MyProfile> =>
  apiFetch<MyProfile>(accessToken, '/api/auth/me');

export const updateMyProfile = (
  accessToken: string,
  payload: UpdateMyProfilePayload,
): Promise<MyProfile> =>
  apiFetch<MyProfile>(accessToken, '/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const requestAvatarUpload = (
  accessToken: string,
  contentType: string,
): Promise<AvatarUploadResponse> =>
  apiFetch<AvatarUploadResponse>(accessToken, '/api/auth/me/avatar-upload', {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  });

// Step 1: mails a 4-digit code to newEmail — nothing changes yet.
export const requestEmailChange = (accessToken: string, newEmail: string): Promise<void> =>
  apiFetch<void>(accessToken, '/api/auth/me/email-change/request', {
    method: 'POST',
    body: JSON.stringify({ newEmail }),
  });

// Step 2: applies the change once the mailed code is confirmed.
export const confirmEmailChange = (
  accessToken: string,
  newEmail: string,
  code: string,
): Promise<MyProfile> =>
  apiFetch<MyProfile>(accessToken, '/api/auth/me/email-change/confirm', {
    method: 'POST',
    body: JSON.stringify({ newEmail, code }),
  });
