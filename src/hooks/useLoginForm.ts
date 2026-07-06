'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { API_URL } from '@/common/constants/env';
import { buildRequestHeaders } from '@/helpers/build-request-headers';
import { decodeJwtPayload } from '@/helpers/jwt';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/auth/auth.slice';

const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
};

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

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: buildRequestHeaders(null),
        body: JSON.stringify(values),
      });

      if (response.ok === false) {
        const errorBody = (await response.json().catch(() => null)) as {
          message?: string | string[];
        } | null;
        const message = Array.isArray(errorBody?.message)
          ? errorBody.message.join(', ')
          : errorBody?.message;

        setServerError(message ?? 'Неверный email или пароль');
        return;
      }

      const data = (await response.json()) as LoginResponse;

      if (data.mfaRequired) {
        setServerError('Для этого аккаунта включена MFA. Поддержка MFA на фронте скоро.');
        return;
      }

      if (!data.accessToken) {
        setServerError('Сервер не вернул access token');
        return;
      }

      const payload = decodeJwtPayload(data.accessToken);
      const emailLocalPart = values.email.split('@')[0] ?? 'User';

      dispatch(
        setCredentials({
          accessToken: data.accessToken,
          user: {
            id: payload.sub,
            clinicId: payload.clinicId,
            email: values.email,
            firstName: emailLocalPart,
            lastName: '',
            role: payload.role,
          },
        }),
      );

      router.push('/');
    } catch {
      setServerError('Не удалось подключиться к серверу. Проверьте, что backend запущен.');
    }
  });

  return { form, onSubmit, serverError };
};
