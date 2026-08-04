import { AdminClinicDetailContent } from '@/app/(admin)/admin/clinics/[id]/AdminClinicDetailContent';

type AdminClinicDetailPageProps = {
  params: Promise<{ id: string }>;
};

const AdminClinicDetailPage = async ({ params }: AdminClinicDetailPageProps) => {
  const { id } = await params;

  return <AdminClinicDetailContent clinicId={id} />;
};

export default AdminClinicDetailPage;
