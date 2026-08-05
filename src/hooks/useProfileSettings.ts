'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { MyProfile } from '@/helpers/profile.api';
import {
  confirmEmailChange,
  fetchMyProfile,
  MY_PROFILE_QUERY_KEY,
  requestAvatarUpload,
  requestEmailChange,
  updateMyProfile,
} from '@/helpers/profile.api';
import { uploadFileToPresignedUrl } from '@/helpers/settings.api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile as updateProfileInStore } from '@/store/slices/auth/auth.slice';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const CODE_PATTERN = /^\d{4}$/u;
const RESEND_COOLDOWN_SECONDS = 60;

const profileFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Укажите имя').max(120),
  lastName: z.string().trim().min(1, 'Укажите фамилию').max(120),
  email: z.email('Введите корректный email'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const mapProfileToFormValues = (profile: MyProfile): ProfileFormValues => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
});

export const useProfileSettings = () => {
  const { t } = useTranslation();
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
    defaultValues: { firstName: '', lastName: '', email: '' },
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
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      }),
    );
  };

  // Name change is immediate (PATCH /auth/me). Email never is — it always
  // goes through the OTP request/confirm pair below, so the "Save" button
  // triggers whichever of the two the form actually needs.
  const updateMutation = useMutation({
    mutationFn: (values: Pick<ProfileFormValues, 'firstName' | 'lastName'>) => {
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

  // --- Email change (OTP-verified) ---
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    },
    [],
  );

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((seconds) => {
        if (seconds <= 1 && cooldownTimer.current) clearInterval(cooldownTimer.current);
        return Math.max(0, seconds - 1);
      });
    }, 1000);
  };

  const requestEmailChangeMutation = useMutation({
    mutationFn: (newEmail: string) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return requestEmailChange(accessToken, newEmail);
    },
    onSuccess: (_, newEmail) => {
      setPendingEmail(newEmail);
      setCode('');
      setEmailChangeError(null);
      setIsEmailModalOpen(true);
      startCooldown();
    },
    onError: (error) => {
      form.setError('email', { message: error.message });
    },
  });

  const confirmEmailChangeMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return confirmEmailChange(accessToken, pendingEmail, code.trim());
    },
    onSuccess: (profile) => {
      applyToStore(profile);
      form.reset(mapProfileToFormValues(profile));
      setIsEmailModalOpen(false);
      setCode('');
    },
    onError: (error) => {
      setEmailChangeError(error.message);
    },
  });

  const confirmCode = () => {
    if (!CODE_PATTERN.test(code.trim())) {
      setEmailChangeError(t.account.invalidCode);
      return;
    }

    setEmailChangeError(null);
    confirmEmailChangeMutation.mutate();
  };

  const resendCode = () => {
    if (resendCooldown > 0 || !pendingEmail) return;
    requestEmailChangeMutation.mutate(pendingEmail);
  };

  const closeEmailModal = () => {
    if (confirmEmailChangeMutation.isPending) return;
    setIsEmailModalOpen(false);
    setEmailChangeError(null);
    // Revert the form's email field — the change never actually applied.
    if (profileQuery.data) {
      form.setValue('email', profileQuery.data.email);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const profile = profileQuery.data;
    if (!profile) return;

    const nameChanged =
      values.firstName.trim() !== profile.firstName || values.lastName.trim() !== profile.lastName;
    const emailChanged = values.email.trim() !== profile.email;

    if (nameChanged) {
      updateMutation.mutate({ firstName: values.firstName, lastName: values.lastName });
    }

    if (emailChanged) {
      requestEmailChangeMutation.mutate(values.email.trim());
    }
  });

  return {
    profileQuery,
    form,
    updateMutation,
    avatarMutation,
    onSubmit,
    emailChange: {
      isModalOpen: isEmailModalOpen,
      pendingEmail,
      code,
      setCode,
      error: emailChangeError,
      resendCooldown,
      isRequesting: requestEmailChangeMutation.isPending,
      isConfirming: confirmEmailChangeMutation.isPending,
      confirm: confirmCode,
      resend: resendCode,
      close: closeEmailModal,
    },
  };
};
