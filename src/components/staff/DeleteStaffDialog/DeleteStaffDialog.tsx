'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { StaffMember } from '@/common/types/staff';
import { Alert, Button, Modal } from '@/components/ui';
import styles from './DeleteStaffDialog.module.css';

type DeleteStaffDialogProps = {
  member: StaffMember;
  isDeleting?: boolean;
  errorMessage?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onConfirm?: () => void;
  onClose?: () => void;
};

export const DeleteStaffDialog = ({
  member,
  isDeleting = false,
  errorMessage = null,
  className,
  style,
  onConfirm,
  onClose,
}: DeleteStaffDialogProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t.staff.remove.title}
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
            {isDeleting ? t.staff.remove.deleting : t.common.delete}
          </Button>
        </>
      }
    >
      <p className={styles.text}>
        {format(t.staff.remove.text, {
          name: `${member.lastName} ${member.firstName}`,
        })}
      </p>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
    </Modal>
  );
};
