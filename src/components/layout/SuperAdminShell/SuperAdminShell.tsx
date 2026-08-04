'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { SuperAdminTopNav } from '@/components/layout/SuperAdminTopNav/SuperAdminTopNav';
import { logoutRequest } from '@/helpers/auth-bridge';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/auth/auth.slice';
import { selectAccessToken, selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './SuperAdminShell.module.css';

type SuperAdminShellProps = {
  children: React.ReactNode;
};

export const SuperAdminShell = ({ children }: SuperAdminShellProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isAuthenticated } = useRequireAuth();
  const user = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);

  const isSuperAdmin = user?.role === 'super_admin';
  const activeId = pathname.startsWith('/admin/clinics') ? 'clinics' : 'stats';

  const items = [
    { id: 'stats', href: '/admin', label: t.admin.navStats },
    { id: 'clinics', href: '/admin/clinics', label: t.admin.navClinics },
  ];

  useDocumentTitle(`${activeId === 'clinics' ? t.admin.navClinics : t.admin.navStats} — ${t.admin.title}`);

  // A regular clinic user has no business here — send them back to their own
  // dashboard instead of rendering a page whose data hooks expect no clinicId.
  useEffect(() => {
    if (isAuthenticated && user && !isSuperAdmin) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, isSuperAdmin, router]);

  const handleLogout = () => {
    logoutRequest(accessToken).catch(() => undefined);
    dispatch(logout());
    router.push('/login');
  };

  if (!isAuthenticated || !user || !isSuperAdmin) {
    return null;
  }

  return (
    <div className={styles.shell}>
      <SuperAdminTopNav
        items={items}
        activeId={activeId}
        title={t.admin.title}
        userName={`${user.firstName} ${user.lastName}`.trim() || user.email}
        userRole={t.roles.super_admin}
        logoutLabel={t.nav.logout}
        onLogout={handleLogout}
      />
      <main className={styles.content}>{children}</main>
    </div>
  );
};
