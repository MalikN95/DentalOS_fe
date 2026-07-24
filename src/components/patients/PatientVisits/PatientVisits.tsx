'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Visit } from '@/common/types/visit';
import { Button } from '@/components/ui';
import { VisitCard } from '@/components/patients/VisitCard/VisitCard';
import styles from './PatientVisits.module.css';

type PatientVisitsProps = {
  upcoming: Visit[];
  past: Visit[];
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onAddClick?: () => void;
};

type SectionProps = {
  title: string;
  visits: Visit[];
  isLoading: boolean;
  loadingText: string;
  emptyText: string;
};

const VisitsSection = ({ title, visits, isLoading, loadingText, emptyText }: SectionProps) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    {isLoading ? <span className={styles.state}>{loadingText}</span> : null}
    {!isLoading && visits.length === 0 ? <span className={styles.state}>{emptyText}</span> : null}
    {!isLoading && visits.length > 0 ? (
      <div className={styles.list}>
        {visits.map((visit) => (
          <VisitCard key={visit.id} visit={visit} />
        ))}
      </div>
    ) : null}
  </section>
);

export const PatientVisits = ({
  upcoming,
  past,
  isLoading = false,
  className,
  style,
  onAddClick,
}: PatientVisitsProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>{t.visits.heading}</h2>
        <Button onClick={onAddClick}>{t.visits.newAppointment}</Button>
      </div>

      <VisitsSection
        title={t.visits.upcoming}
        visits={upcoming}
        isLoading={isLoading}
        loadingText={t.common.loading}
        emptyText={t.visits.noUpcoming}
      />
      <VisitsSection
        title={t.visits.history}
        visits={past}
        isLoading={isLoading}
        loadingText={t.common.loading}
        emptyText={t.visits.noPast}
      />
    </div>
  );
};
