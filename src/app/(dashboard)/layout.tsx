import { DashboardShell } from '@/components/layout/DashboardShell/DashboardShell';

const DashboardLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => <DashboardShell>{children}</DashboardShell>;

export default DashboardLayout;
