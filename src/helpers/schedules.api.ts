import type {
  ApiDoctorScheduleSlot,
  ApiScheduleException,
  CreateScheduleExceptionInput,
  ScheduleSlotInput,
} from '@/common/types/schedule';
import type { PaginatedResult } from '@/common/types/pagination';
import { apiFetch } from '@/helpers/api-fetch';

export const fetchDoctorSchedule = (
  accessToken: string,
  doctorProfileId: string,
  signal?: AbortSignal,
): Promise<ApiDoctorScheduleSlot[]> =>
  apiFetch<ApiDoctorScheduleSlot[]>(accessToken, `/api/schedules/doctor/${doctorProfileId}`, {
    signal,
  });

export const replaceDoctorSchedule = (
  accessToken: string,
  doctorProfileId: string,
  slots: ScheduleSlotInput[],
): Promise<ApiDoctorScheduleSlot[]> =>
  apiFetch<ApiDoctorScheduleSlot[]>(accessToken, `/api/schedules/doctor/${doctorProfileId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slots),
  });

export const fetchScheduleExceptions = (
  accessToken: string,
  doctorProfileId: string,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiScheduleException>> =>
  apiFetch<PaginatedResult<ApiScheduleException>>(
    accessToken,
    `/api/schedules/doctor/${doctorProfileId}/exceptions?limit=200`,
    { signal },
  );

export const createScheduleException = (
  accessToken: string,
  doctorProfileId: string,
  payload: CreateScheduleExceptionInput,
): Promise<ApiScheduleException> =>
  apiFetch<ApiScheduleException>(
    accessToken,
    `/api/schedules/doctor/${doctorProfileId}/exceptions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

export const deleteScheduleException = (accessToken: string, id: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/schedules/exceptions/${id}`, { method: 'DELETE' });
