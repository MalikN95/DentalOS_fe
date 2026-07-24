'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { Alert, Button, Modal } from '@/components/ui';
import styles from './SaveSettingsModal.module.css';

type SaveSettingsModalProps = {
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  savingLabel: string;
  isSaving?: boolean;
  errorMessage?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onConfirm?: () => void;
  onClose?: () => void;
};

export const SaveSettingsModal = ({
  title,
  text,
  confirmLabel,
  cancelLabel,
  savingLabel,
  isSaving = false,
  errorMessage = null,
  className,
  style,
  onConfirm,
  onClose,
}: SaveSettingsModalProps) => {
  const { t: dict } = useTranslation();

  return (
    <Modal
      title={title}
      size="sm"
      isLocked={isSaving}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      className={className}
      style={style}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" disabled={isSaving} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="button" disabled={isSaving} onClick={onConfirm}>
            {isSaving ? savingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      <p className={styles.text}>{text}</p>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
    </Modal>
  );
};
