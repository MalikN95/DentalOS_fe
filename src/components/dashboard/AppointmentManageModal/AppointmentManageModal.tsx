'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Appointment, AppointmentStatus } from '@/common/types/appointment';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CloseIcon, ExpandIcon } from '@/components/icons/icons';
import { Badge, Button, Modal } from '@/components/ui';
import { AppointmentManagePanel } from '@/components/dashboard/AppointmentManagePanel/AppointmentManagePanel';
import { appointmentStatusColor } from '@/helpers/appointment-status';
import styles from './AppointmentManageModal.module.css';

// Matches the .dialogClosing animation duration below.
const CLOSE_ANIMATION_MS = 160;

type AppointmentManageModalProps = {
  appointment: Appointment;
  className?: string;
  style?: React.CSSProperties;
  onClose: () => void;
  onChanged?: () => void;
};

export const AppointmentManageModal = ({
  appointment,
  className,
  style,
  onClose,
  onChanged,
}: AppointmentManageModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.appointments;
  const router = useRouter();
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [isClosing, setIsClosing] = useState(false);

  // Keeps the dialog mounted for one animation frame so its closing keyframes
  // can actually play, instead of the parent unmounting it instantly.
  const handleRequestClose = useCallback(() => {
    if (isClosing) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onClose();
      return;
    }
    setIsClosing(true);
    window.setTimeout(onClose, CLOSE_ANIMATION_MS);
  }, [isClosing, onClose]);

  const handleViewDetails = () => {
    router.push(`/appointments/${appointment.id}`);
    onClose();
  };

  // Only "pending" has a long label ("Ожидает подтверждения"); everywhere
  // else the short variant is identical to the full one.
  const statusLabelShort = status === 'pending' ? t.pendingShort : dict.appointmentStatus[status];

  const title = (
    <span className={styles.title}>
      <span className={styles.titleMain}>
        {t.manageTitle}
        <Badge color={appointmentStatusColor[status]}>
          <span className={styles.statusLabelFull}>{dict.appointmentStatus[status]}</span>
          <span className={styles.statusLabelShort}>{statusLabelShort}</span>
        </Badge>
        <Button
          type="button"
          variant="soft"
          color="primary"
          size="sm"
          iconLeft={<ExpandIcon size={14} />}
          onClick={handleViewDetails}
        >
          {t.viewDetails}
        </Button>
      </span>
      <Button
        type="button"
        variant="soft"
        color="gray"
        size="sm"
        className={styles.closeButton}
        ariaLabel={dict.common.close}
        iconLeft={<CloseIcon size={14} />}
        onClick={handleRequestClose}
      >
        <span className={styles.closeLabel}>{dict.common.close}</span>
      </Button>
    </span>
  );

  return (
    <Modal
      title={title}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      showCloseButton={false}
      className={`${isClosing ? styles.dialogClosing : ''} ${className ?? ''}`}
      style={style}
      onClose={handleRequestClose}
    >
      <AppointmentManagePanel
        appointment={appointment}
        onChanged={onChanged}
        onStatusChange={setStatus}
      />
    </Modal>
  );
};
