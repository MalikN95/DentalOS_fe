'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/common/locale/LocaleProvider';
import {
  DashboardIcon,
  CalendarIcon,
  ChevronLeftIcon,
  LogoutIcon,
  MessageIcon,
  PlusIcon,
} from '@/components/icons/icons';
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
      id: 'book',
      href: '/patient/book',
      label: t.patientPortal.bookNav,
      icon: PlusIcon,
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

  const activeNavItem = navItems.find((item) =>
    item.href === '/patient' ? pathname === item.href : pathname.startsWith(item.href),
  );
  const pageTitle = activeNavItem?.label ?? '';
  // The composer on /patient/messages is pinned to the bottom itself — the
  // floating nav would sit on top of it and eat half the screen otherwise.
  const hideNav = pathname.startsWith('/patient/messages');

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerTitleRow}>
            {hideNav ? (
              <button
                type="button"
                className={styles.backButton}
                aria-label={t.patientPortal.bookBackButton}
                onClick={() => router.push('/patient')}
              >
                <ChevronLeftIcon size={18} />
              </button>
            ) : null}
            <span className={styles.pageTitle}>{pageTitle}</span>
          </div>
          <button
            type="button"
            className={styles.logoutButton}
            aria-label={t.patientPortal.logout}
            onClick={handleLogout}
          >
            <LogoutIcon size={18} />
          </button>
        </header>

        <main className={`${styles.content} ${hideNav ? styles.contentNoNav : ''}`}>
          {children}
        </main>
      </div>

      {hideNav ? null : (
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
                <Icon size={18} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};
