import { SuperAdminShell } from '@/components/layout/SuperAdminShell/SuperAdminShell';

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => <SuperAdminShell>{children}</SuperAdminShell>;

export default AdminLayout;
