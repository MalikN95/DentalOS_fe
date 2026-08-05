'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { MyProfile } from '@/helpers/profile.api';
import {
  fetchMyProfile,
  MY_PROFILE_QUERY_KEY,
  requestAvatarUpload,
  updateMyProfile,
} from '@/helpers/profile.api';
import { uploadFileToPresignedUrl } from '@/helpers/settings.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile as updateProfileInStore } from '@/store/slices/auth/auth.slice';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const profileFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Укажите имя').max(120),
  lastName: z.string().trim().min(1, 'Укажите фамилию').max(120),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const mapProfileToFormValues = (profile: MyProfile): ProfileFormValues => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
});

export const useProfileSettings = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: () => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchMyProfile(accessToken);
    },
    enabled: Boolean(accessToken),
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { firstName: '', lastName: '' },
  });

  useEffect(() => {
    if (profileQuery.data) {
      form.reset(mapProfileToFormValues(profileQuery.data));
    }
  }, [profileQuery.data, form]);

  // Keeps TopNav etc. in sync the moment a save succeeds, without waiting on
  // a refetch or a full page reload.
  const applyToStore = (profile: MyProfile) => {
    queryClient.setQueryData(MY_PROFILE_QUERY_KEY, profile);
    dispatch(
      updateProfileInStore({
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
      }),
    );
  };

  const updateMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return updateMyProfile(accessToken, {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      });
    },
    onSuccess: (profile) => {
      applyToStore(profile);
      form.reset(mapProfileToFormValues(profile));
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const { uploadUrl, key } = await requestAvatarUpload(accessToken, file.type);
      await uploadFileToPresignedUrl(uploadUrl, file, 'Не удалось загрузить фото');
      return updateMyProfile(accessToken, { avatarKey: key });
    },
    onSuccess: applyToStore,
  });

  const onSubmit = form.handleSubmit((values) => {
    updateMutation.mutate(values);
  });

  return {
    profileQuery,
    form,
    updateMutation,
    avatarMutation,
    onSubmit,
  };
};
