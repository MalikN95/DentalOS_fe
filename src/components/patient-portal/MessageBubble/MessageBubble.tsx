import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiPatientMessage } from '@/common/types/chat';
import { formatDate, formatTime } from '@/helpers/date';
import styles from './MessageBubble.module.css';

type MessageBubbleProps = {
  message: ApiPatientMessage;
  className?: string;
  style?: React.CSSProperties;
};

export const MessageBubble = ({ message, className, style }: MessageBubbleProps) => {
  const { t } = useTranslation();
  const isOwn = message.direction === 'inbound';

  return (
    <div
      className={`${styles.row} ${isOwn ? styles.rowOwn : ''} ${className ?? ''}`}
      style={style}
    >
      <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : ''}`}>
        {message.subject ? <span className={styles.subject}>{message.subject}</span> : null}
        <span className={styles.body}>{message.body}</span>
        <span className={styles.meta}>
          {isOwn ? t.patientPortal.you : t.patientPortal.fromClinic} ·{' '}
          {formatDate(message.createdAt)} {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};
