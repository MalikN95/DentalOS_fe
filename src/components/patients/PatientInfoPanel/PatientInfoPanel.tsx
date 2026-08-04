'use client';

import { useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import { EditIcon, EyeIcon, EyeOffIcon } from '@/components/icons/icons';
import { PatientTagsField } from '@/components/patients/PatientTagsField/PatientTagsField';
import { Badge, PatientAvatar } from '@/components/ui';
import { formatDate } from '@/helpers/date';
import {
  NOTIFICATION_CHANNEL_COLOR,
  type NotificationChannelKey,
} from '@/helpers/notification-channel';
import { deriveTagHue, tagBackground, tagForeground } from '@/helpers/tag-color';
import styles from './PatientInfoPanel.module.css';

// `push` is read-only here — it's only ever granted from the patient's own
// browser on the booking widget, never editable from this staff-facing card.
const PATIENT_NOTIFICATION_CHANNELS: {
  key: Extract<NotificationChannelKey, 'email' | 'whatsapp' | 'push'>;
  label: 'notifyEmail' | 'notifyWhatsapp' | 'notifyPush';
}[] = [
  { key: 'email', label: 'notifyEmail' },
  { key: 'whatsapp', label: 'notifyWhatsapp' },
  { key: 'push', label: 'notifyPush' },
];

type PatientInfoPanelProps = {
  patient: Patient;
  /** Hide the name+status header, e.g. when it's already shown elsewhere (modal title). */
  hideHeader?: boolean;
  /** Render without the card border/padding, e.g. when already inside a modal/card. */
  bordered?: boolean;
  /** Dev/QA only — see DevLoginCodeRow. Omitted/null renders nothing. */
  devLoginCode?: string | null;
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

// Dev/QA only — `code` is null in any real deployment (backend never
// persists a plaintext code once WhatsApp is actually configured), so this
// row renders nothing there.
const DevLoginCodeRow = ({ code }: { code: string }) => {
  const { t } = useTranslation();
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className={styles.row}>
      <span className={styles.rowLabel} title={t.patientInfo.loginCodeHint}>
        {t.patientInfo.loginCode}
      </span>
      <span className={`${styles.rowValue} ${styles.codeRowValue}`}>
        <span className={styles.codeText}>{isRevealed ? code : '••••••'}</span>
        <button
          type="button"
          className={styles.revealButton}
          aria-label={isRevealed ? t.patientInfo.hideLoginCode : t.patientInfo.showLoginCode}
          onClick={() => setIsRevealed((revealed) => !revealed)}
        >
          {isRevealed ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
        </button>
      </span>
    </div>
  );
};

const TagList = ({ label, items }: { label: string; items: string[] }) => (
  <div className={styles.block}>
    <span className={styles.blockLabel}>{label}</span>
    {items.length > 0 ? (
      <div className={styles.tags}>
        {items.map((item) => {
          const hue = deriveTagHue(item);
          return (
            <span
              key={item}
              className={styles.tag}
              style={{ background: tagBackground(hue), color: tagForeground(hue) }}
            >
              {item}
            </span>
          );
        })}
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
  devLoginCode,
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
          <div className={styles.topRow}>
            <PatientAvatar
              name={`${patient.firstName} ${patient.lastName}`}
              hasWarning={patient.allergies.length > 0}
              warningLabel={format(t.patientInfo.hasAllergiesWarning, {
                list: patient.allergies.join(', '),
              })}
            />
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
          {devLoginCode ? <DevLoginCodeRow code={devLoginCode} /> : null}
        </div>

        <TagList label={t.patientInfo.allergies} items={patient.allergies} />
        <TagList label={t.patientInfo.chronic} items={patient.chronicDiseases} />

        <div className={styles.block}>
          <span className={styles.blockLabel}>{t.patientInfo.notifications}</span>
          <div className={styles.tags}>
            {PATIENT_NOTIFICATION_CHANNELS.map(({ key, label }) => {
              const enabled = patient.notificationPreferences[key];
              return (
                <Badge
                  key={key}
                  color={enabled ? NOTIFICATION_CHANNEL_COLOR[key] : 'gray'}
                  className={enabled ? undefined : styles.notificationDisabled}
                >
                  {t.patientInfo[label]}
                </Badge>
              );
            })}
          </div>
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
