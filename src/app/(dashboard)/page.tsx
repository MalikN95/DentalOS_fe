import { MOCK_APPOINTMENTS, MOCK_SCHEDULE, MOCK_STATS } from '@/common/mocks/dashboard.mock';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable/AppointmentsTable';
import { ScheduleList } from '@/components/dashboard/ScheduleList/ScheduleList';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import styles from './page.module.css';

const DashboardPage = () => (
  <>
    <div className={styles.stats}>
      {MOCK_STATS.map((stat) => (
        <StatCard
          key={stat.id}
          label={stat.label}
          value={stat.value}
          change={stat.change}
          changeLabel={stat.changeLabel}
        />
      ))}
    </div>

    <div className={styles.grid}>
      <AppointmentsTable appointments={MOCK_APPOINTMENTS} />
      <ScheduleList slots={MOCK_SCHEDULE} />
    </div>
  </>
);

export default DashboardPage;
