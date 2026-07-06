import { PatientsIcon } from '@/components/icons/icons';
import { EmptyState } from '@/components/ui';

const PatientsPage = () => (
  <EmptyState
    icon={<PatientsIcon size={28} />}
    title="Пациенты"
    description="Раздел в разработке: здесь будет список пациентов с поиском, фильтрами и карточками."
  />
);

export default PatientsPage;
