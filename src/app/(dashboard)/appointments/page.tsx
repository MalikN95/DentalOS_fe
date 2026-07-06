import { MOCK_APPOINTMENTS } from '@/common/mocks/dashboard.mock';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable/AppointmentsTable';

const AppointmentsPage = () => <AppointmentsTable appointments={MOCK_APPOINTMENTS} />;

export default AppointmentsPage;
