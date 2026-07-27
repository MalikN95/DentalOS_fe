import { AppointmentDetailContent } from '@/app/(dashboard)/appointments/[id]/AppointmentDetailContent';

type AppointmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

const AppointmentDetailPage = async ({ params }: AppointmentDetailPageProps) => {
  const { id } = await params;

  return <AppointmentDetailContent appointmentId={id} />;
};

export default AppointmentDetailPage;
