'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStaffMember } from '@/helpers/staff.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken, selectCurrentUser } from '@/store/slices/auth/selectors';

export const MY_DOCTOR_PROFILE_QUERY_KEY = 'my-doctor-profile';

/** Resolves the logged-in doctor's own staff record — there's no dedicated "/me" endpoint,
 *  so this just fetches the staff record for the current user's own id. */
export const useMyDoctorProfile = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const currentUser = useAppSelector(selectCurrentUser);

  const query = useQuery({
    queryKey: [MY_DOCTOR_PROFILE_QUERY_KEY, currentUser?.id],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchStaffMember(accessToken, currentUser?.id as string, signal);
    },
    enabled: Boolean(accessToken) && Boolean(currentUser?.id),
  });

  return {
    staffMember: query.data ?? null,
    doctorProfileId: query.data?.doctorProfile?.id ?? null,
    branchId: query.data?.doctorProfile?.branchId ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
  };
};
