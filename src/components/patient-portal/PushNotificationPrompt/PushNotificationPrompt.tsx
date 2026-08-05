'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { Button } from '@/components/ui';
import styles from './PushNotificationPrompt.module.css';

type PushNotificationPromptProps = {
  className?: string;
  style?: React.CSSProperties;
  onEnable?: () => void;
};

export const PushNotificationPrompt = ({
  className,
  style,
  onEnable,
}: PushNotificationPromptProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <span className={styles.title}>{t.patientPortal.enablePushTitle}</span>
      <p className={styles.text}>{t.patientPortal.enablePushText}</p>
      <Button className={styles.button} onClick={() => onEnable?.()}>
        {t.patientPortal.enablePushCta}
      </Button>
    </div>
  );
};
