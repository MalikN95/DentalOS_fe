'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import { Alert, Button, Modal } from '@/components/ui';
import styles from './DeletePatientDialog.module.css';

type DeletePatientDialogProps = {
  patient: Patient;
  isDeleting?: boolean;
  errorMessage?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onConfirm?: () => void;
  onClose?: () => void;
};

export const DeletePatientDialog = ({
  patient,
  isDeleting = false,
  errorMessage = null,
  className,
  style,
  onConfirm,
  onClose,
}: DeletePatientDialogProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t.patients.remove.title}
      size="sm"
      isLocked={isDeleting}
      closeLabel={t.common.close}
      scrollHintLabel={t.common.scrollForMore}
      className={className}
      style={style}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" disabled={isDeleting} onClick={onClose}>
            {t.settings.cancel}
          </Button>
          <Button type="button" color="danger" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting ? t.patients.remove.deleting : t.common.delete}
          </Button>
        </>
      }
    >
      <p className={styles.text}>
        {format(t.patients.remove.text, {
          name: `${patient.lastName} ${patient.firstName}`,
        })}
      </p>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
    </Modal>
  );
};
