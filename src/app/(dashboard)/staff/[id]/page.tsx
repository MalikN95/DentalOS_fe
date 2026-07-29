import { StaffDetailContent } from '@/app/(dashboard)/staff/[id]/StaffDetailContent';

type StaffDetailPageProps = {
  params: Promise<{ id: string }>;
};

const StaffDetailPage = async ({ params }: StaffDetailPageProps) => {
  const { id } = await params;

  return <StaffDetailContent staffId={id} />;
};

export default StaffDetailPage;
