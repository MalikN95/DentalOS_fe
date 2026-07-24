import { PatientDetailContent } from '@/app/(dashboard)/patients/[id]/PatientDetailContent';

type PatientDetailPageProps = {
  params: Promise<{ id: string }>;
};

const PatientDetailPage = async ({ params }: PatientDetailPageProps) => {
  const { id } = await params;

  return <PatientDetailContent patientId={id} />;
};

export default PatientDetailPage;
