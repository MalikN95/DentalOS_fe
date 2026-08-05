'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchMyProfile, MY_PROFILE_QUERY_KEY } from '@/helpers/profile.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/auth/auth.slice';
import { selectAccessToken } from '@/store/slices/auth/selectors';

// Login only decodes the JWT (id/clinicId/role) and guesses a display name
// from the email — this fetches the real firstName/lastName/avatarUrl once
// per session and patches them into the store, so TopNav etc. show the
// actual profile instead of the login-time placeholder.
export const useSyncProfileFromServer = (): void => {
  const accessToken = useAppSelector(selectAccessToken);
  const dispatch = useAppDispatch();

  const { data } = useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: () => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchMyProfile(accessToken);
    },
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data) {
      dispatch(
        updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          avatarUrl: data.avatarUrl,
        }),
      );
    }
  }, [data, dispatch]);
};
