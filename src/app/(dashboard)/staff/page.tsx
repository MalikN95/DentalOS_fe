import { StaffIcon } from '@/components/icons/icons';
import { EmptyState } from '@/components/ui';

const StaffPage = () => (
  <EmptyState
    icon={<StaffIcon size={28} />}
    title="Сотрудники"
    description="Раздел в разработке: здесь будет список врачей и персонала с ролями и расписанием."
  />
);

export default StaffPage;
