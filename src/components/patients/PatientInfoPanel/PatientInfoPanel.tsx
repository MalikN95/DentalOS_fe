'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import { EditIcon } from '@/components/icons/icons';
import { PatientTagsField } from '@/components/patients/PatientTagsField/PatientTagsField';
import { Badge } from '@/components/ui';
import { formatDate } from '@/helpers/date';
import styles from './PatientInfoPanel.module.css';

type PatientInfoPanelProps = {
  patient: Patient;
  /** Hide the name+status header, e.g. when it's already shown elsewhere (modal title). */
  hideHeader?: boolean;
  /** Render without the card border/padding, e.g. when already inside a modal/card. */
  bordered?: boolean;
  /** Shows an edit button next to the name, e.g. on the patient's own profile page. */
  onEdit?: () => void;
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

export const PatientInfoPanel = ({
  patient,
  hideHeader = false,
  bordered = true,
  onEdit,
  className,
  style,
}: PatientInfoPanelProps) => {
  const { t } = useTranslation();
  const { dash } = t.common;
  const cardClassName = bordered ? styles.card : styles.cardPlain;

  return (
    <aside className={`${cardClassName} ${className ?? ''}`} style={style}>
      {hideHeader ? null : (
        <div className={styles.header}>
          <div className={styles.nameRow}>
            <span className={styles.name}>
              {patient.lastName} {patient.firstName}
            </span>
            {onEdit ? (
              <button
                type="button"
                className={styles.editButton}
                title={t.common.edit}
                aria-label={t.common.edit}
                onClick={onEdit}
              >
                <EditIcon size={15} />
              </button>
            ) : null}
          </div>
          <Badge color={patient.isActive ? 'success' : 'gray'}>
            {patient.isActive ? t.common.active : t.common.inactive}
          </Badge>
        </div>
      )}

      <div className={styles.body}>
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
                value={
                  patient.insurance.validUntil ? formatDate(patient.insurance.validUntil) : dash
                }
              />
            </div>
          ) : (
            <span className={styles.muted}>{t.patientInfo.insuranceNone}</span>
          )}
        </div>

        <PatientTagsField patient={patient} />

        {patient.comments ? (
          <div className={styles.block}>
            <span className={styles.blockLabel}>{t.patientInfo.comment}</span>
            <p className={styles.comment}>{patient.comments}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
