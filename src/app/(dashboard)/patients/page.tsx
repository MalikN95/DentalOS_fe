import { Suspense } from 'react';
import { PatientsPageContent } from '@/app/(dashboard)/patients/PatientsPageContent';

const PatientsPage = () => (
  <Suspense>
    <PatientsPageContent />
  </Suspense>
);

export default PatientsPage;
