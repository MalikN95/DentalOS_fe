'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Visit } from '@/common/types/visit';
import { Badge } from '@/components/ui';
import { appointmentStatusColor, formatMoney } from '@/helpers/appointment-status';
import { formatDate, formatTime } from '@/helpers/date';
import styles from './VisitCard.module.css';

type VisitCardProps = {
  visit: Visit;
  className?: string;
  style?: React.CSSProperties;
};

const ClinicalRow = ({ label, value }: { label: string; value: string | null }) => (
  <div className={styles.clinicalRow}>
    <span className={styles.clinicalLabel}>{label}</span>
    <span className={styles.clinicalValue}>{value?.trim() ? value : '—'}</span>
  </div>
);

export const VisitCard = ({ visit, className, style }: VisitCardProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { record } = visit;

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className={styles.datetime}>
          <span className={styles.date}>{formatDate(visit.startsAt)}</span>
          <span className={styles.time}>{formatTime(visit.startsAt)}</span>
        </span>
        <span className={styles.meta}>
          <span className={styles.service}>{visit.serviceName}</span>
          <span className={styles.sub}>
            {visit.doctorName}
            {visit.cabinetName ? ` · ${visit.cabinetName}` : ''}
          </span>
        </span>
        <span className={styles.right}>
          <span className={styles.price}>{formatMoney(visit.price)}</span>
          <Badge color={appointmentStatusColor[visit.status]}>
            {t.appointmentStatus[visit.status]}
          </Badge>
          <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}>⌄</span>
        </span>
      </button>

      {expanded ? (
        <div className={styles.body}>
          {record ? (
            <div className={styles.clinical}>
              <ClinicalRow label={t.visits.complaints} value={record.complaints} />
              <ClinicalRow label={t.visits.examination} value={record.examination} />
              <ClinicalRow label={t.visits.diagnosis} value={record.diagnosis} />
              <ClinicalRow label={t.visits.treatment} value={record.treatment} />
              <ClinicalRow label={t.visits.prescriptions} value={record.prescriptions} />
              <ClinicalRow label={t.visits.recommendations} value={record.recommendations} />
              {record.notes ? <ClinicalRow label={t.visits.notes} value={record.notes} /> : null}
            </div>
          ) : (
            <span className={styles.empty}>{t.visits.noRecord}</span>
          )}
          {visit.comment ? (
            <div className={styles.commentRow}>
              <span className={styles.clinicalLabel}>{t.visits.visitComment}</span>
              <span className={styles.clinicalValue}>{visit.comment}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
