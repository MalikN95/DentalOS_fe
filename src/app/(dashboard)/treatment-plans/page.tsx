import { TreatmentPlansPageContent } from '@/app/(dashboard)/treatment-plans/TreatmentPlansPageContent';

type TreatmentPlansPageProps = {
  searchParams: Promise<{ patientId?: string }>;
};

const TreatmentPlansPage = async ({ searchParams }: TreatmentPlansPageProps) => {
  const { patientId } = await searchParams;

  return <TreatmentPlansPageContent initialPatientId={patientId ?? null} />;
};

export default TreatmentPlansPage;
