'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_CLINIC_NAME } from '@/common/mocks/auth.mock';
import {
  CalendarIcon,
  ChartIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  Logo,
  MailIcon,
  PatientsIcon,
  ShieldIcon,
} from '@/components/icons/icons';
import { Alert, Button, TextField } from '@/components/ui';
import { useClinicSubdomain } from '@/hooks/useClinicSubdomain';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/auth/selectors';
import styles from './page.module.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const { form, onSubmit, serverError } = useLoginForm();
  const clinicSubdomain = useClinicSubdomain();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  if (isAuthenticated) {
    return null;
  }

  const features = [
    { Icon: CalendarIcon, text: t.login.featureSchedule },
    { Icon: PatientsIcon, text: t.login.featurePatients },
    { Icon: ChartIcon, text: t.login.featureAnalytics },
  ];

  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.brand}>
          <span className={styles.glowOne} aria-hidden="true" />
          <span className={styles.glowTwo} aria-hidden="true" />
          <span className={styles.grid} aria-hidden="true" />

          <div className={styles.brandTop}>
            <Logo height={24} />
            <span className={styles.brandName}>{MOCK_CLINIC_NAME}</span>
          </div>

          <div className={styles.brandBody}>
            <h2 className={styles.brandTagline}>{t.login.tagline}</h2>
            <p className={styles.brandText}>{t.login.taglineText}</p>

            <ul className={styles.features}>
              {features.map(({ Icon, text }) => (
                <li key={text} className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Icon size={18} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className={styles.brandFooter}>
            <ShieldIcon size={16} />
            {t.login.secureNote}
          </p>
        </aside>

        <section className={styles.panel}>
          <div className={styles.mobileLogo}>
            <span className={styles.mobileLogoMark}>
              <Logo height={20} />
            </span>
            {MOCK_CLINIC_NAME}
          </div>

          <header className={styles.header}>
            <h1 className={styles.title}>{t.login.title}</h1>
            <p className={styles.subtitle}>{t.login.subtitle}</p>
          </header>

          {serverError ? <Alert color="danger">{serverError}</Alert> : null}

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <TextField
              label={t.login.email}
              type="email"
              placeholder={t.login.emailPlaceholder}
              autoComplete="email"
              error={errors.email?.message}
              iconLeft={<MailIcon />}
              {...register('email')}
            />
            <TextField
              label={t.login.password}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              iconLeft={<LockIcon />}
              iconRight={
                <button
                  type="button"
                  aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
                  className={styles.eyeButton}
                  onClick={togglePassword}
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

          <p className={styles.hint}>
            {t.login.clinicFromUrl} <strong className={styles.hintValue}>{clinicSubdomain}</strong>
          </p>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
