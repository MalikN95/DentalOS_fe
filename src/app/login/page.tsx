'use client';

import { useState } from 'react';
import { MOCK_CLINIC_NAME } from '@/common/mocks/auth.mock';
import { EyeIcon, EyeOffIcon, ToothIcon } from '@/components/icons/icons';
import { Alert, Button, TextField } from '@/components/ui';
import { useClinicSubdomain } from '@/hooks/useClinicSubdomain';
import { useLoginForm } from '@/hooks/useLoginForm';
import styles from './page.module.css';

const LoginPage = () => {
  const { form, onSubmit, serverError } = useLoginForm();
  const clinicSubdomain = useClinicSubdomain();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>
            <ToothIcon size={24} />
          </span>
          {MOCK_CLINIC_NAME}
        </div>
        <p className={styles.subtitle}>Войдите в кабинет клиники</p>

        {serverError ? <Alert color="danger">{serverError}</Alert> : null}

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            placeholder="you@clinic.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            iconRight={
              <button
                type="button"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                className={styles.eyeButton}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
            {...register('password')}
          />
          <Button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Входим...' : 'Войти'}
          </Button>
        </form>

        <p className={styles.hintCard}>
          Клиника определяется из URL: <strong>{clinicSubdomain}</strong>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
