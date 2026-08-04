'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { PlatformClinicSummary } from '@/common/types/platform-admin';
import { CheckIcon, EditIcon, TrashIcon, XCircleIcon } from '@/components/icons/icons';
import { Badge } from '@/components/ui';
import { formatDate } from '@/helpers/date';
import styles from './ClinicsTable.module.css';

type ClinicsTableProps = {
  clinics: PlatformClinicSummary[];
  isLoading?: boolean;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onRowClick?: (clinic: PlatformClinicSummary) => void;
  onEdit?: (clinic: PlatformClinicSummary) => void;
  onToggleActive?: (clinic: PlatformClinicSummary) => void;
  onDelete?: (clinic: PlatformClinicSummary) => void;
};

type ClinicRowActionsProps = {
  clinic: PlatformClinicSummary;
  editLabel: string;
  blockLabel: string;
  unblockLabel: string;
  deleteLabel: string;
  onEdit?: (clinic: PlatformClinicSummary) => void;
  onToggleActive?: (clinic: PlatformClinicSummary) => void;
  onDelete?: (clinic: PlatformClinicSummary) => void;
};

const ClinicRowActions = ({
  clinic,
  editLabel,
  blockLabel,
  unblockLabel,
  deleteLabel,
  onEdit,
  onToggleActive,
  onDelete,
}: ClinicRowActionsProps) => (
  <div className={styles.actions}>
    <button
      type="button"
      className={styles.actionButton}
      title={editLabel}
      aria-label={editLabel}
      onClick={() => onEdit?.(clinic)}
    >
      <EditIcon size={15} />
    </button>
    <button
      type="button"
      className={styles.actionButton}
      title={clinic.isActive ? blockLabel : unblockLabel}
      aria-label={clinic.isActive ? blockLabel : unblockLabel}
      onClick={() => onToggleActive?.(clinic)}
    >
      {clinic.isActive ? <XCircleIcon size={15} /> : <CheckIcon size={15} />}
    </button>
    <button
      type="button"
      className={`${styles.actionButton} ${styles.actionButtonDanger}`}
      title={deleteLabel}
      aria-label={deleteLabel}
      onClick={() => onDelete?.(clinic)}
    >
      <TrashIcon size={15} />
    </button>
  </div>
);

export const ClinicsTable = ({
  clinics,
  isLoading = false,
  footer,
  className,
  style,
  onRowClick,
  onEdit,
  onToggleActive,
  onDelete,
}: ClinicsTableProps) => {
  const { t } = useTranslation();

  const actionLabels = {
    edit: t.admin.actionEdit,
    block: t.admin.actionBlock,
    unblock: t.admin.actionUnblock,
    delete: t.admin.actionDelete,
  };

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.admin.colClinic}</th>
              <th>{t.admin.colContact}</th>
              <th>{t.admin.colStatus}</th>
              <th>{t.admin.colDoctors}</th>
              <th>{t.admin.colPatients}</th>
              <th>{t.admin.colCreated}</th>
              <th className={styles.actionsHead}>{t.admin.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={7}>
                  {t.admin.loading}
                </td>
              </tr>
            ) : null}

            {!isLoading && clinics.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={7}>
                  {t.admin.clinicsEmpty}
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? clinics.map((clinic) => (
                  <tr key={clinic.id}>
                    <td>
                      <span className={styles.clinic}>
                        <button
                          type="button"
                          className={styles.clinicName}
                          onClick={() => onRowClick?.(clinic)}
                        >
                          {clinic.name}
                        </button>
                        <span className={styles.clinicSlug}>/{clinic.slug}</span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.contact}>
                        <span>{clinic.phone ?? t.common.dash}</span>
                        <span>{clinic.email ?? t.common.dash}</span>
                      </span>
                    </td>
                    <td>
                      <Badge color={clinic.isActive ? 'success' : 'gray'}>
                        {clinic.isActive ? t.common.active : t.admin.statusBlocked}
                      </Badge>
                    </td>
                    <td>{clinic.doctorsCount}</td>
                    <td>{clinic.patientsCount}</td>
                    <td>{formatDate(clinic.createdAt)}</td>
                    <td>
                      <ClinicRowActions
                        clinic={clinic}
                        editLabel={actionLabels.edit}
                        blockLabel={actionLabels.block}
                        unblockLabel={actionLabels.unblock}
                        deleteLabel={actionLabels.delete}
                        onEdit={onEdit}
                        onToggleActive={onToggleActive}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList}>
        {isLoading ? <div className={styles.mobileStateBlock}>{t.admin.loading}</div> : null}
        {!isLoading && clinics.length === 0 ? (
          <div className={styles.mobileStateBlock}>{t.admin.clinicsEmpty}</div>
        ) : null}

        {!isLoading
          ? clinics.map((clinic) => (
              <div key={clinic.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHead}>
                  <span className={styles.clinic}>
                    <button
                      type="button"
                      className={styles.clinicName}
                      onClick={() => onRowClick?.(clinic)}
                    >
                      {clinic.name}
                    </button>
                    <span className={styles.clinicSlug}>/{clinic.slug}</span>
                  </span>
                  <Badge color={clinic.isActive ? 'success' : 'gray'}>
                    {clinic.isActive ? t.common.active : t.admin.statusBlocked}
                  </Badge>
                </div>

                <div className={styles.mobileMeta}>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.admin.colDoctors}</span>
                    <span className={styles.mobileMetaValue}>{clinic.doctorsCount}</span>
                  </div>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.admin.colPatients}</span>
                    <span className={styles.mobileMetaValue}>{clinic.patientsCount}</span>
                  </div>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.admin.colCreated}</span>
                    <span className={styles.mobileMetaValue}>{formatDate(clinic.createdAt)}</span>
                  </div>
                </div>

                <ClinicRowActions
                  clinic={clinic}
                  editLabel={actionLabels.edit}
                  blockLabel={actionLabels.block}
                  unblockLabel={actionLabels.unblock}
                  deleteLabel={actionLabels.delete}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                />
              </div>
            ))
          : null}
      </div>
      {footer ?? null}
    </div>
  );
};
