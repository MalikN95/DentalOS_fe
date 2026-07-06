import { SettingsIcon } from '@/components/icons/icons';
import { EmptyState } from '@/components/ui';

const SettingsPage = () => (
  <EmptyState
    icon={<SettingsIcon size={28} />}
    title="Настройки"
    description="Раздел в разработке: настройки клиники, филиалы, кабинеты и оборудование."
  />
);

export default SettingsPage;
