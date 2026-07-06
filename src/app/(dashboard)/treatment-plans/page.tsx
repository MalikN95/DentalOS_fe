import { ToothIcon } from '@/components/icons/icons';
import { EmptyState } from '@/components/ui';

const TreatmentPlansPage = () => (
  <EmptyState
    icon={<ToothIcon size={28} />}
    title="Планы лечения"
    description="Раздел в разработке: здесь будут планы лечения в виде диаграмм на React Flow."
  />
);

export default TreatmentPlansPage;
