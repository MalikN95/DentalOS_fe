'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { DashboardIcon, CalendarIcon, LogoutIcon, MessageIcon, Logo } from '@/components/icons/icons';
import { logoutRequest } from '@/helpers/auth-bridge';
import { usePortalAuthGuard } from '@/hooks/usePortalAuthGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/auth/auth.slice';
import { selectAccessToken, selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './PatientPortalShell.module.css';

type PatientPortalShellProps = {
  children: React.ReactNode;
};

export const PatientPortalShell = ({ children }: PatientPortalShellProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthorized } = usePortalAuthGuard();
  const accessToken = useAppSelector(selectAccessToken);
  const user = useAppSelector(selectCurrentUser);

  const navItems = [
    { id: 'home', href: '/patient', label: t.patientPortal.navHome, icon: DashboardIcon },
    {
      id: 'appointments',
      href: '/patient/appointments',
      label: t.patientPortal.navAppointments,
      icon: CalendarIcon,
    },
    {
      id: 'messages',
      href: '/patient/messages',
      label: t.patientPortal.navMessages,
      icon: MessageIcon,
    },
  ];

  const handleLogout = () => {
    logoutRequest(accessToken).catch(() => undefined);
    dispatch(logout());
    router.push(user?.clinicSlug ? `/portal/${user.clinicSlug}` : '/');
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Logo height={20} />
          <button
            type="button"
            className={styles.logoutButton}
            aria-label={t.patientPortal.logout}
            onClick={handleLogout}
          >
            <LogoutIcon size={18} />
          </button>
        </header>

        <main className={styles.content}>{children}</main>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive =
            item.href === '/patient' ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
