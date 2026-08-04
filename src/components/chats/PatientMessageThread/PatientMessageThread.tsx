'use client';

import type { ApiPatientMessage } from '@/common/types/chat';
import { ChevronLeftIcon, MailIcon, PhoneIcon } from '@/components/icons/icons';
import { format } from '@/common/locale/LocaleProvider';
import { formatDate, formatTime, isSameDay } from '@/helpers/date';
import styles from './PatientMessageThread.module.css';

type PatientMessageThreadProps = {
  patientName: string;
  messages: ApiPatientMessage[];
  isLoading: boolean;
  errorMessage: string | null;
  emptyLabel: string;
  sentByTemplate: string;
  automaticLabel: string;
  /** Shown as a back chevron on mobile, next to the title — returns to the conversation list. */
  onBack?: () => void;
  backLabel?: string;
  className?: string;
};

const formatMessageTime = (isoDate: string): string =>
  isSameDay(new Date(isoDate), new Date()) ? formatTime(isoDate) : formatDate(isoDate);

export const PatientMessageThread = ({
  patientName,
  messages,
  isLoading,
  errorMessage,
  emptyLabel,
  sentByTemplate,
  automaticLabel,
  onBack,
  backLabel,
  className,
}: PatientMessageThreadProps) => (
  <div className={`${styles.thread} ${className ?? ''}`}>
    <div className={styles.header}>
      {onBack ? (
        <button
          type="button"
          className={styles.backButton}
          aria-label={backLabel}
          title={backLabel}
          onClick={onBack}
        >
          <ChevronLeftIcon size={18} />
        </button>
      ) : null}
      <span className={styles.title}>{patientName}</span>
    </div>

    <div className={styles.messages}>
      {errorMessage ? <span className={styles.error}>{errorMessage}</span> : null}

      {!isLoading && messages.length === 0 && !errorMessage ? (
        <span className={styles.empty}>{emptyLabel}</span>
      ) : null}

      {messages.map((message) => (
        <div key={message.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.channel}>
              {message.channel === 'email' ? <MailIcon size={14} /> : <PhoneIcon size={14} />}
            </span>
            {message.subject ? <span className={styles.subject}>{message.subject}</span> : null}
            <span className={styles.time}>{formatMessageTime(message.createdAt)}</span>
          </div>
          <p className={styles.body}>{message.body}</p>
          <span className={styles.sentBy}>
            {message.sentBy
              ? format(sentByTemplate, {
                  name: `${message.sentBy.firstName} ${message.sentBy.lastName}`,
                })
              : automaticLabel}
          </span>
        </div>
      ))}
    </div>
  </div>
);
