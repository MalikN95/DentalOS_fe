'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Dictionary } from '@/common/locale/dictionaries/ru';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { getNavItemByPathname, NAV_ITEMS } from '@/common/constants/navigation';
import type { StaffRole } from '@/common/types/staff';
import { MOCK_CLINIC_NAME, MOCK_USER } from '@/common/mocks/auth.mock';
import { TopNav } from '@/components/layout/TopNav/TopNav';
import { logoutRequest } from '@/helpers/auth-bridge';
import { useClinic } from '@/hooks/useClinic';
import { useMobileNav } from '@/hooks/useMobileNav';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useTodayAppointments } from '@/hooks/useTodayAppointments';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/auth/auth.slice';
import { selectAccessToken, selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './DashboardShell.module.css';

type DashboardShellProps = {
  children: React.ReactNode;
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isAuthenticated } = useRequireAuth();
  // Mock fallback until real auth is wired to the API
  const user = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const accessToken = useAppSelector(selectAccessToken);
  const { data: todayAppointments } = useTodayAppointments();
  const { data: clinic } = useClinic();
  const { isOpen: isMobileNavOpen, toggle: toggleMobileNav, close: closeMobileNav } = useMobileNav();

  // Close the mobile nav panel whenever the route changes.
  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  const activeItem = getNavItemByPathname(pathname);
  const accessibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user.role as StaffRole),
  );
  const items = accessibleNavItems.map((item) => ({
    id: item.id,
    href: item.href,
    icon: item.icon,
    badgeCount: item.id === 'appointments' ? todayAppointments?.length : item.badgeCount,
    label: t.nav[item.labelKey],
  }));
  const roleKey = user.role as keyof Dictionary['roles'];
  const userRole = t.roles[roleKey] ?? user.role;

  const isRoleBlocked = Boolean(
    activeItem.roles && !activeItem.roles.includes(user.role as StaffRole),
  );
  const fallbackHref = accessibleNavItems[0]?.href ?? '/login';

  // The nav only hides links the role can't use — a direct URL still has to
  // be turned away, so redirect to the first section this role can reach.
  useEffect(() => {
    if (isRoleBlocked) {
      router.replace(fallbackHref);
    }
  }, [isRoleBlocked, fallbackHref, router]);

  const handleLogout = () => {
    // Fire-and-forget: the request already carries the current token.
    logoutRequest(accessToken).catch(() => undefined);
    dispatch(logout());
    router.push('/login');
  };

  const handleSearchSubmit = (value: string) => {
    router.push(`/patients?search=${encodeURIComponent(value)}`);
    closeMobileNav();
  };

  // Block rendering for unauthenticated users or a role-blocked route
  // (redirects are handled by the effects above).
  if (!isAuthenticated || isRoleBlocked) {
    return null;
  }

  return (
    <div className={styles.shell}>
      <TopNav
        items={items}
        activeId={activeItem.id}
        clinicName={clinic?.name ?? MOCK_CLINIC_NAME}
        logoUrl={clinic?.logoUrl}
        newPatientHref="/patients?new=1"
        newPatientLabel={t.patients.newPatient}
        searchPlaceholder={t.header.searchPatient}
        onSearchSubmit={handleSearchSubmit}
        userName={`${user.firstName} ${user.lastName}`}
        userRole={userRole}
        logoutLabel={t.nav.logout}
        onLogout={handleLogout}
        isMobileOpen={isMobileNavOpen}
        onToggleMobile={toggleMobileNav}
        onCloseMobile={closeMobileNav}
        openMenuLabel={t.nav.openMenu}
        closeMenuLabel={t.nav.closeMenu}
      />
      <main className={styles.content}>{children}</main>
    </div>
  );
};
