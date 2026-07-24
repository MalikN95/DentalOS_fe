'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_CLINIC_NAME } from '@/common/mocks/auth.mock';
import { EyeIcon, EyeOffIcon, ToothIcon } from '@/components/icons/icons';
import { Alert, Button, TextField } from '@/components/ui';
import { useClinicSubdomain } from '@/hooks/useClinicSubdomain';
import { useLoginForm } from '@/hooks/useLoginForm';
import styles from './page.module.css';

const LoginPage = () => {
  const { t } = useTranslation();
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
        <p className={styles.subtitle}>{t.login.subtitle}</p>

        {serverError ? <Alert color="danger">{serverError}</Alert> : null}

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <TextField
            label={t.login.email}
            type="email"
            placeholder={t.login.emailPlaceholder}
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label={t.login.password}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            iconRight={
              <button
                type="button"
                aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
                className={styles.eyeButton}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
            {...register('password')}
          />
          <Button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? t.login.signingIn : t.login.signIn}
          </Button>
        </form>

        <p className={styles.hintCard}>
          {t.login.clinicFromUrl} <strong>{clinicSubdomain}</strong>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
