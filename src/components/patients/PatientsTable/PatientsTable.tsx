'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import { Alert, Badge, Button } from '@/components/ui';
import { formatDate } from '@/helpers/date';
import { useDragScroll } from '@/hooks/useDragScroll';
import styles from './PatientsTable.module.css';

type PatientsTableProps = {
  patients: Patient[];
  isLoading?: boolean;
  errorMessage?: string | null;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onRowClick?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
};

export const PatientsTable = ({
  patients,
  isLoading = false,
  errorMessage = null,
  footer,
  className,
  style,
  onRowClick,
  onEdit,
  onDelete,
}: PatientsTableProps) => {
  const { t } = useTranslation();
  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      {errorMessage ? (
        <div className={styles.stateWrap}>
          <Alert color="danger">{errorMessage}</Alert>
        </div>
      ) : null}

      <div
        ref={tableWrapRef}
        className={`${styles.tableWrap} ${isTableDragging ? styles.dragging : ''}`}
        {...dragScrollHandlers}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.patients.colPatient}</th>
              <th>{t.patients.colBirthDate}</th>
              <th>{t.patients.colGender}</th>
              <th>{t.patients.colEmail}</th>
              <th>{t.patients.colStatus}</th>
              <th className={styles.actionsHead}>{t.patients.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={6}>
                  {t.patients.loading}
                </td>
              </tr>
            ) : null}

            {!isLoading && patients.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={6}>
                  {t.patients.empty}
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className={styles.patient}>
                        <button
                          type="button"
                          className={styles.patientName}
                          onClick={() => onRowClick?.(patient)}
                        >
                          {patient.lastName} {patient.firstName}
                        </button>
                        <span className={styles.patientPhone}>{patient.phone}</span>
                      </span>
                    </td>
                    <td>{patient.birthDate ? formatDate(patient.birthDate) : t.common.dash}</td>
                    <td>{patient.gender ? t.gender[patient.gender] : t.common.dash}</td>
                    <td>{patient.email ?? t.common.dash}</td>
                    <td>
                      <Badge color={patient.isActive ? 'success' : 'gray'}>
                        {patient.isActive ? t.common.active : t.common.inactive}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button variant="soft" color="gray" onClick={() => onEdit?.(patient)}>
                          {t.common.edit}
                        </Button>
                        <Button variant="soft" color="danger" onClick={() => onDelete?.(patient)}>
                          {t.common.delete}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList}>
        {isLoading ? <div className={styles.mobileStateBlock}>{t.patients.loading}</div> : null}
        {!isLoading && patients.length === 0 ? (
          <div className={styles.mobileStateBlock}>{t.patients.empty}</div>
        ) : null}

        {!isLoading
          ? patients.map((patient) => (
              <div key={patient.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHead}>
                  <span className={styles.patient}>
                    <button
                      type="button"
                      className={styles.patientName}
                      onClick={() => onRowClick?.(patient)}
                    >
                      {patient.lastName} {patient.firstName}
                    </button>
                    <span className={styles.patientPhone}>{patient.phone}</span>
                  </span>
                  <Badge color={patient.isActive ? 'success' : 'gray'}>
                    {patient.isActive ? t.common.active : t.common.inactive}
                  </Badge>
                </div>

                <div className={styles.mobileMeta}>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.patients.colBirthDate}</span>
                    <span className={styles.mobileMetaValue}>
                      {patient.birthDate ? formatDate(patient.birthDate) : t.common.dash}
                    </span>
                  </div>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.patients.colGender}</span>
                    <span className={styles.mobileMetaValue}>
                      {patient.gender ? t.gender[patient.gender] : t.common.dash}
                    </span>
                  </div>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.patients.colEmail}</span>
                    <span className={styles.mobileMetaValue}>{patient.email ?? t.common.dash}</span>
                  </div>
                </div>

                <div className={styles.mobileActions}>
                  <Button variant="soft" color="gray" onClick={() => onEdit?.(patient)}>
                    {t.common.edit}
                  </Button>
                  <Button variant="soft" color="danger" onClick={() => onDelete?.(patient)}>
                    {t.common.delete}
                  </Button>
                </div>
              </div>
            ))
          : null}
      </div>
      {footer ?? null}
    </div>
  );
};
