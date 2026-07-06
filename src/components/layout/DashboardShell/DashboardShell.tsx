'use client';

import { usePathname, useRouter } from 'next/navigation';
import { getNavItemByPathname, NAV_ITEMS } from '@/common/constants/navigation';
import { MOCK_CLINIC_NAME, MOCK_USER } from '@/common/mocks/auth.mock';
import { Header } from '@/components/layout/Header/Header';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/auth/auth.slice';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './DashboardShell.module.css';

type DashboardShellProps = {
  children: React.ReactNode;
};

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  doctor: 'Врач',
  receptionist: 'Регистратор',
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  // Mock fallback until real auth is wired to the API
  const user = useAppSelector(selectCurrentUser) ?? MOCK_USER;

  const activeItem = getNavItemByPathname(pathname);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className={styles.shell}>
      <Sidebar
        items={NAV_ITEMS}
        activeId={activeItem.id}
        clinicName={MOCK_CLINIC_NAME}
        onLogout={handleLogout}
      />
      <div className={styles.main}>
        <Header
          title={activeItem.label}
          userName={`${user.firstName} ${user.lastName}`}
          userRole={roleLabels[user.role] ?? user.role}
          notificationsCount={3}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};
