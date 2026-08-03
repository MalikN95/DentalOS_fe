import { PatientPortalShell } from '@/components/patient-portal/PatientPortalShell/PatientPortalShell';

const PatientPortalLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => <PatientPortalShell>{children}</PatientPortalShell>;

export default PatientPortalLayout;
