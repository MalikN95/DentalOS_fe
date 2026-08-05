'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import { Alert, Button, Modal, TextField } from '@/components/ui';
import styles from './EmailChangeModal.module.css';

type EmailChangeModalProps = {
  email: string;
  code: string;
  error: string | null;
  resendCooldown: number;
  isConfirming: boolean;
  isResending: boolean;
  onCodeChange: (value: string) => void;
  onConfirm: () => void;
  onResend: () => void;
  onClose: () => void;
};

export const EmailChangeModal = ({
  email,
  code,
  error,
  resendCooldown,
  isConfirming,
  isResending,
  onCodeChange,
  onConfirm,
  onResend,
  onClose,
}: EmailChangeModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.account;

  return (
    <Modal
      title={t.changeEmailTitle}
      closeLabel={dict.common.close}
      isLocked={isConfirming}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm();
      }}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" disabled={isConfirming} onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={isConfirming}>
            {isConfirming ? t.confirming : t.confirmCode}
          </Button>
        </>
      }
    >
      <p className={styles.description}>{format(t.changeEmailDescription, { email })}</p>

      {error ? <Alert color="danger">{error}</Alert> : null}

      <TextField
        label={t.codeLabel}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={4}
        placeholder={t.codePlaceholder}
        value={code}
        disabled={isConfirming}
        onChange={(event) => onCodeChange(event.target.value)}
        autoFocus
      />

      <button
        type="button"
        className={styles.linkButton}
        disabled={resendCooldown > 0 || isResending}
        onClick={onResend}
      >
        {resendCooldown > 0 ? `${t.resendCodeIn} ${resendCooldown}s` : t.resendCode}
      </button>
    </Modal>
  );
};
