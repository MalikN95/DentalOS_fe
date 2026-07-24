'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import { Badge } from '@/components/ui';
import { formatDate } from '@/helpers/date';
import styles from './PatientInfoPanel.module.css';

type PatientInfoPanelProps = {
  patient: Patient;
  className?: string;
  style?: React.CSSProperties;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.row}>
    <span className={styles.rowLabel}>{label}</span>
    <span className={styles.rowValue}>{value}</span>
  </div>
);

const TagList = ({ label, items }: { label: string; items: string[] }) => (
  <div className={styles.block}>
    <span className={styles.blockLabel}>{label}</span>
    {items.length > 0 ? (
      <div className={styles.tags}>
        {items.map((item) => (
          <span key={item} className={styles.tag}>
            {item}
          </span>
        ))}
      </div>
    ) : (
      <span className={styles.muted}>—</span>
    )}
  </div>
);

export const PatientInfoPanel = ({ patient, className, style }: PatientInfoPanelProps) => {
  const { t } = useTranslation();
  const { dash } = t.common;

  return (
    <aside className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.header}>
        <span className={styles.name}>
          {patient.lastName} {patient.firstName}
        </span>
        <Badge color={patient.isActive ? 'success' : 'gray'}>
          {patient.isActive ? t.common.active : t.common.inactive}
        </Badge>
      </div>

      <div className={styles.rows}>
        <Row label={t.patientInfo.phone} value={patient.phone} />
        <Row label={t.patientInfo.email} value={patient.email ?? dash} />
        <Row
          label={t.patientInfo.birthDate}
          value={patient.birthDate ? formatDate(patient.birthDate) : dash}
        />
        <Row
          label={t.patientInfo.gender}
          value={patient.gender ? t.gender[patient.gender] : dash}
        />
      </div>

      <TagList label={t.patientInfo.allergies} items={patient.allergies} />
      <TagList label={t.patientInfo.chronic} items={patient.chronicDiseases} />

      <div className={styles.block}>
        <span className={styles.blockLabel}>{t.patientInfo.insurance}</span>
        {patient.insurance ? (
          <div className={styles.rows}>
            <Row label={t.patientInfo.company} value={patient.insurance.company} />
            <Row label={t.patientInfo.policy} value={patient.insurance.policyNumber} />
            <Row
              label={t.patientInfo.validUntil}
              value={patient.insurance.validUntil ? formatDate(patient.insurance.validUntil) : dash}
            />
          </div>
        ) : (
          <span className={styles.muted}>{t.patientInfo.insuranceNone}</span>
        )}
      </div>

      {patient.comments ? (
        <div className={styles.block}>
          <span className={styles.blockLabel}>{t.patientInfo.comment}</span>
          <p className={styles.comment}>{patient.comments}</p>
        </div>
      ) : null}
    </aside>
  );
};
