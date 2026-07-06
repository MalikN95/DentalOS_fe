'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MOCK_ACCESS_TOKEN, MOCK_USER } from '@/common/mocks/auth.mock';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/auth/auth.slice';

const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const MOCK_REQUEST_DELAY_MS = 600;

export const useLoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    // Mock auth: replace with POST /api/auth/login when API is wired
    await new Promise((resolve) => {
      setTimeout(resolve, MOCK_REQUEST_DELAY_MS);
    });

    if (values.email !== MOCK_USER.email) {
      setServerError('Неверный email или пароль. Попробуйте admin@smile.clinic');
      return;
    }

    dispatch(setCredentials({ user: MOCK_USER, accessToken: MOCK_ACCESS_TOKEN }));
    router.push('/');
  });

  return { form, onSubmit, serverError };
};
