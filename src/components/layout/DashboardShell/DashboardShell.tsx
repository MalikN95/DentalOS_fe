'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { Dictionary } from '@/common/locale/dictionaries/ru';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { getNavItemByPathname, NAV_ITEMS } from '@/common/constants/navigation';
import type { StaffRole } from '@/common/types/staff';
import { MOCK_CLINIC_NAME, MOCK_USER } from '@/common/mocks/auth.mock';
import { Header } from '@/components/layout/Header/Header';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { logoutRequest } from '@/helpers/auth-bridge';
import { useClinic } from '@/hooks/useClinic';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
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
  const { isCollapsed, toggle: toggleSidebar } = useSidebarCollapse();

  const activeItem = getNavItemByPathname(pathname);
  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user.role as StaffRole),
  ).map((item) => ({
    id: item.id,
    href: item.href,
    icon: item.icon,
    badgeCount: item.id === 'appointments' ? todayAppointments?.length : item.badgeCount,
    label: t.nav[item.labelKey],
  }));
  const roleKey = user.role as keyof Dictionary['roles'];
  const userRole = t.roles[roleKey] ?? user.role;

  const handleLogout = () => {
    // Fire-and-forget: the request already carries the current token.
    logoutRequest(accessToken).catch(() => undefined);
    dispatch(logout());
    router.push('/login');
  };

  // Block dashboard rendering for unauthenticated users (redirect handled by the guard).
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        items={items}
        activeId={activeItem.id}
        clinicName={clinic?.name ?? MOCK_CLINIC_NAME}
        logoUrl={clinic?.logoUrl}
        logoutLabel={t.nav.logout}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebar}
        collapseLabel={t.nav.collapseSidebar}
        expandLabel={t.nav.expandSidebar}
        onLogout={handleLogout}
      />
      <div className={styles.main}>
        <Header
          title={t.nav[activeItem.labelKey]}
          userName={`${user.firstName} ${user.lastName}`}
          userRole={userRole}
          notificationsLabel={t.header.notifications}
          notificationsCount={3}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};
