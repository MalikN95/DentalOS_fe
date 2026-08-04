import type {
  CancellationsAnalytics,
  DoctorLoadItem,
  PatientDemographics,
  RepeatVisitsAnalytics,
  RevenueAnalytics,
  TopServiceItem,
} from '@/common/types/analytics';
import { apiFetch } from '@/helpers/api-fetch';

type FetchRevenueParams = {
  accessToken: string;
  from: string;
  to: string;
  signal?: AbortSignal;
};

export const fetchRevenue = ({
  accessToken,
  from,
  to,
  signal,
}: FetchRevenueParams): Promise<RevenueAnalytics> => {
  const query = new URLSearchParams({ from, to });
  return apiFetch<RevenueAnalytics>(accessToken, `/api/analytics/revenue?${query.toString()}`, {
    signal,
  });
};

type FetchPeriodAnalyticsParams = {
  accessToken: string;
  from: string;
  to: string;
  signal?: AbortSignal;
};

export const fetchDoctorsLoad = ({
  accessToken,
  from,
  to,
  signal,
}: FetchPeriodAnalyticsParams): Promise<DoctorLoadItem[]> => {
  const query = new URLSearchParams({ from, to });
  return apiFetch<DoctorLoadItem[]>(
    accessToken,
    `/api/analytics/doctors-load?${query.toString()}`,
    { signal },
  );
};

export const fetchTopServices = ({
  accessToken,
  from,
  to,
  signal,
}: FetchPeriodAnalyticsParams): Promise<TopServiceItem[]> => {
  const query = new URLSearchParams({ from, to });
  return apiFetch<TopServiceItem[]>(
    accessToken,
    `/api/analytics/top-services?${query.toString()}`,
    { signal },
  );
};

export const fetchCancellations = ({
  accessToken,
  from,
  to,
  signal,
}: FetchPeriodAnalyticsParams): Promise<CancellationsAnalytics> => {
  const query = new URLSearchParams({ from, to });
  return apiFetch<CancellationsAnalytics>(
    accessToken,
    `/api/analytics/cancellations?${query.toString()}`,
    { signal },
  );
};

export const fetchRepeatVisits = ({
  accessToken,
  from,
  to,
  signal,
}: FetchPeriodAnalyticsParams): Promise<RepeatVisitsAnalytics> => {
  const query = new URLSearchParams({ from, to });
  return apiFetch<RepeatVisitsAnalytics>(
    accessToken,
    `/api/analytics/repeat-visits?${query.toString()}`,
    { signal },
  );
};

type FetchPatientDemographicsParams = {
  accessToken: string;
  signal?: AbortSignal;
};

export const fetchPatientDemographics = ({
  accessToken,
  signal,
}: FetchPatientDemographicsParams): Promise<PatientDemographics> =>
  apiFetch<PatientDemographics>(accessToken, '/api/analytics/patients', { signal });
