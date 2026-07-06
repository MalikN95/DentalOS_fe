import type {
  AppointmentFormOptions,
  CreateAppointmentPayload,
} from '@/common/types/appointment-form';
import type { ApiAppointment, Appointment } from '@/common/types/appointment';
import type { PaginatedResult } from '@/common/types/pagination';
import { apiFetch } from '@/helpers/api-fetch';
import { mapApiAppointmentToRow } from '@/helpers/appointments.mapper';
import { getTodayIsoRange } from '@/helpers/date';

type FetchTodayAppointmentsParams = {
  accessToken: string;
  signal?: AbortSignal;
};

const LIST_QUERY = 'page=1&limit=200';

export const fetchTodayAppointments = async ({
  accessToken,
  signal,
}: FetchTodayAppointmentsParams): Promise<Appointment[]> => {
  const { from, to } = getTodayIsoRange();
  const query = new URLSearchParams({ from, to });
  const data = await apiFetch<ApiAppointment[]>(
    accessToken,
    `/api/appointments?${query.toString()}`,
    { signal },
  );

  return data.map(mapApiAppointmentToRow);
};

export const fetchAppointmentFormOptions = async (
  accessToken: string,
  signal?: AbortSignal,
): Promise<AppointmentFormOptions> => {
  const [patients, doctors, services, branches] = await Promise.all([
    apiFetch<PaginatedResult<AppointmentFormOptions['patients'][number]>>(
      accessToken,
      `/api/patients?${LIST_QUERY}&isActive=true`,
      { signal },
    ),
    apiFetch<PaginatedResult<AppointmentFormOptions['doctors'][number]>>(
      accessToken,
      `/api/doctors?${LIST_QUERY}`,
      { signal },
    ),
    apiFetch<PaginatedResult<AppointmentFormOptions['services'][number]>>(
      accessToken,
      `/api/services?${LIST_QUERY}`,
      { signal },
    ),
    apiFetch<PaginatedResult<AppointmentFormOptions['branches'][number]>>(
      accessToken,
      `/api/branches?${LIST_QUERY}`,
      { signal },
    ),
  ]);

  return {
    patients: patients.items,
    doctors: doctors.items,
    services: services.items,
    branches: branches.items,
  };
};

export const createAppointment = async (
  accessToken: string,
  payload: CreateAppointmentPayload,
): Promise<Appointment> => {
  const data = await apiFetch<ApiAppointment>(accessToken, '/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapApiAppointmentToRow(data);
};
