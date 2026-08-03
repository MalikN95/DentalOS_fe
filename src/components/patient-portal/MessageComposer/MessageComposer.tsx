'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { Button } from '@/components/ui';
import styles from './MessageComposer.module.css';

type MessageComposerProps = {
  value: string;
  isSending?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange: (value: string) => void;
  onSend?: () => void;
};

export const MessageComposer = ({
  value,
  isSending = false,
  className,
  style,
  onChange,
  onSend,
}: MessageComposerProps) => {
  const { t } = useTranslation();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend?.();
    }
  };

  return (
    <div className={`${styles.composer} ${className ?? ''}`} style={style}>
      <textarea
        className={styles.textarea}
        rows={1}
        placeholder={t.patientPortal.messagePlaceholder}
        value={value}
        disabled={isSending}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button disabled={isSending || value.trim().length === 0} onClick={() => onSend?.()}>
        {t.patientPortal.send}
      </Button>
    </div>
  );
};
