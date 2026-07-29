import type { ApiDoctorScheduleSlot, ScheduleSlotInput } from '@/common/types/schedule';
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
