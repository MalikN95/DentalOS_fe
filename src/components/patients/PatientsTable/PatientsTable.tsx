'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import type { PatientTag } from '@/common/types/patient-tag';
import {
  CalendarIcon,
  FileTextIcon,
  InfoIcon,
  MailIcon,
  MessageIcon,
  WalletIcon,
} from '@/components/icons/icons';
import { TagPill } from '@/components/patients/TagPill/TagPill';
import { Alert, Badge } from '@/components/ui';
import { formatDate } from '@/helpers/date';
import { useDragScroll } from '@/hooks/useDragScroll';
import styles from './PatientsTable.module.css';

const MAX_VISIBLE_TAGS = 2;

const TagsCell = ({ tags }: { tags: PatientTag[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const visible = tags.slice(0, MAX_VISIBLE_TAGS);
  const overflow = tags.slice(MAX_VISIBLE_TAGS);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={styles.tagsCell} ref={containerRef}>
      {visible.map((tag) => (
        <TagPill key={tag.id} tag={tag} />
      ))}

      {overflow.length > 0 ? (
        <>
          <button
            type="button"
            className={styles.tagsMoreButton}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            •••
          </button>
          {isOpen ? (
            <div className={styles.tagsPopover}>
              {overflow.map((tag) => (
                <TagPill key={tag.id} tag={tag} />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

type PatientsTableProps = {
  patients: Patient[];
  isLoading?: boolean;
  errorMessage?: string | null;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onRowClick?: (patient: Patient) => void;
  onAddAppointment?: (patient: Patient) => void;
  onSendSms?: (patient: Patient) => void;
  onSendEmail?: (patient: Patient) => void;
  onTreatmentPlan?: (patient: Patient) => void;
  onRecordPayment?: (patient: Patient) => void;
};

type ActionLabels = {
  addAppointment: string;
  sendSms: string;
  sendEmail: string;
  sendEmailNoEmail: string;
  treatmentPlan: string;
  recordPayment: string;
};

type PatientRowActionsProps = {
  patient: Patient;
  labels: ActionLabels;
  onAddAppointment?: (patient: Patient) => void;
  onSendSms?: (patient: Patient) => void;
  onSendEmail?: (patient: Patient) => void;
  onTreatmentPlan?: (patient: Patient) => void;
  onRecordPayment?: (patient: Patient) => void;
};

const ACTION_ICON_ORDER = [
  { Icon: CalendarIcon, key: 'addAppointment' as const },
  { Icon: MessageIcon, key: 'sendSms' as const },
  { Icon: MailIcon, key: 'sendEmail' as const },
  { Icon: FileTextIcon, key: 'treatmentPlan' as const },
  { Icon: WalletIcon, key: 'recordPayment' as const },
];

const ActionsHeader = ({ label, labels }: { label: string; labels: ActionLabels }) => (
  <span className={styles.actionsHeadLabel}>
    {label}
    <button type="button" className={styles.helpTrigger}>
      <InfoIcon size={13} />
      <span className={styles.helpTooltip} role="tooltip">
        {ACTION_ICON_ORDER.map(({ Icon, key }) => (
          <span key={key} className={styles.helpRow}>
            <Icon size={14} />
            {labels[key]}
          </span>
        ))}
      </span>
    </button>
  </span>
);

const PatientRowActions = ({
  patient,
  labels,
  onAddAppointment,
  onSendSms,
  onSendEmail,
  onTreatmentPlan,
  onRecordPayment,
}: PatientRowActionsProps) => (
  <div className={styles.actions}>
    <button
      type="button"
      className={styles.actionButton}
      title={labels.addAppointment}
      aria-label={labels.addAppointment}
      onClick={() => onAddAppointment?.(patient)}
    >
      <CalendarIcon size={16} />
    </button>
    <button
      type="button"
      className={styles.actionButton}
      title={labels.sendSms}
      aria-label={labels.sendSms}
      onClick={() => onSendSms?.(patient)}
    >
      <MessageIcon size={16} />
    </button>
    <button
      type="button"
      className={styles.actionButton}
      title={patient.email ? labels.sendEmail : labels.sendEmailNoEmail}
      aria-label={patient.email ? labels.sendEmail : labels.sendEmailNoEmail}
      disabled={!patient.email}
      onClick={() => onSendEmail?.(patient)}
    >
      <MailIcon size={16} />
    </button>
    <button
      type="button"
      className={styles.actionButton}
      title={labels.treatmentPlan}
      aria-label={labels.treatmentPlan}
      onClick={() => onTreatmentPlan?.(patient)}
    >
      <FileTextIcon size={16} />
    </button>
    <button
      type="button"
      className={styles.actionButton}
      title={labels.recordPayment}
      aria-label={labels.recordPayment}
      onClick={() => onRecordPayment?.(patient)}
    >
      <WalletIcon size={16} />
    </button>
  </div>
);

export const PatientsTable = ({
  patients,
  isLoading = false,
  errorMessage = null,
  footer,
  className,
  style,
  onRowClick,
  onAddAppointment,
  onSendSms,
  onSendEmail,
  onTreatmentPlan,
  onRecordPayment,
}: PatientsTableProps) => {
  const { t } = useTranslation();
  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  const actionLabels = {
    addAppointment: t.patients.actionAddAppointment,
    sendSms: t.patients.actionSendSms,
    sendEmail: t.patients.actionSendEmail,
    sendEmailNoEmail: t.patients.actionSendEmailNoEmail,
    treatmentPlan: t.patients.actionTreatmentPlan,
    recordPayment: t.patients.actionRecordPayment,
  };

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
              <th>{t.patients.colTags}</th>
              <th className={styles.actionsHead}>
                <ActionsHeader label={t.patients.colActions} labels={actionLabels} />
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={7}>
                  {t.patients.loading}
                </td>
              </tr>
            ) : null}

            {!isLoading && patients.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={7}>
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
                      <TagsCell tags={patient.tags} />
                    </td>
                    <td>
                      <PatientRowActions
                        patient={patient}
                        labels={actionLabels}
                        onAddAppointment={onAddAppointment}
                        onSendSms={onSendSms}
                        onSendEmail={onSendEmail}
                        onTreatmentPlan={onTreatmentPlan}
                        onRecordPayment={onRecordPayment}
                      />
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

                {patient.tags.length > 0 ? <TagsCell tags={patient.tags} /> : null}

                <PatientRowActions
                  patient={patient}
                  labels={actionLabels}
                  onAddAppointment={onAddAppointment}
                  onSendSms={onSendSms}
                  onSendEmail={onSendEmail}
                  onTreatmentPlan={onTreatmentPlan}
                  onRecordPayment={onRecordPayment}
                />
              </div>
            ))
          : null}
      </div>
      {footer ?? null}
    </div>
  );
};
