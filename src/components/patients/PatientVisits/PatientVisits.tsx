'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Visit } from '@/common/types/visit';
import { CalendarIcon } from '@/components/icons/icons';
import { Button, Pagination } from '@/components/ui';
import { VisitCard } from '@/components/patients/VisitCard/VisitCard';
import styles from './PatientVisits.module.css';

const HISTORY_LIMIT = 5;

type PatientVisitsProps = {
  upcoming: Visit[];
  past: Visit[];
  isLoading?: boolean;
  onAddAppointment?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

type SectionProps = {
  title: string;
  visits: Visit[];
  isLoading: boolean;
  loadingText: string;
  emptyText: string;
  footer?: React.ReactNode;
};

const VisitsSection = ({
  title,
  visits,
  isLoading,
  loadingText,
  emptyText,
  footer,
}: SectionProps) => (
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
    {!isLoading && visits.length > 0 ? footer : null}
  </section>
);

export const PatientVisits = ({
  upcoming,
  past,
  isLoading = false,
  onAddAppointment,
  className,
  style,
}: PatientVisitsProps) => {
  const { t } = useTranslation();
  const [historyPage, setHistoryPage] = useState(1);

  const historyPageItems = past.slice(
    (historyPage - 1) * HISTORY_LIMIT,
    historyPage * HISTORY_LIMIT,
  );

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <div className={styles.toolbar}>
        <div className={styles.headingRow}>
          <span className={styles.headerIcon}>
            <CalendarIcon size={18} />
          </span>
          <h2 className={styles.heading}>{t.visits.heading}</h2>
        </div>

        {onAddAppointment ? (
          <Button variant="soft" className={styles.addButton} onClick={onAddAppointment}>
            {t.visits.newAppointment}
          </Button>
        ) : null}
      </div>

      <div className={styles.body}>
        <VisitsSection
          title={t.visits.upcoming}
          visits={upcoming}
          isLoading={isLoading}
          loadingText={t.common.loading}
          emptyText={t.visits.noUpcoming}
        />
        <VisitsSection
          title={t.visits.history}
          visits={historyPageItems}
          isLoading={isLoading}
          loadingText={t.common.loading}
          emptyText={t.visits.noPast}
          footer={
            <Pagination
              page={historyPage}
              limit={HISTORY_LIMIT}
              total={past.length}
              showRowsPerPage={false}
              onPageChange={setHistoryPage}
            />
          }
        />
      </div>
    </div>
  );
};
