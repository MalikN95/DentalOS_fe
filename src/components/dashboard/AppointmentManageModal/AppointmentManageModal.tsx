'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Appointment, AppointmentStatus } from '@/common/types/appointment';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CloseIcon, ExpandIcon } from '@/components/icons/icons';
import { Badge, Button, Modal } from '@/components/ui';
import { AppointmentManagePanel } from '@/components/dashboard/AppointmentManagePanel/AppointmentManagePanel';
import { appointmentStatusColor } from '@/helpers/appointment-status';
import styles from './AppointmentManageModal.module.css';

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

  const handleViewDetails = () => {
    router.push(`/appointments/${appointment.id}`);
    onClose();
  };

  const title = (
    <span className={styles.title}>
      <span className={styles.titleMain}>
        {t.manageTitle}
        <Badge color={appointmentStatusColor[status]}>{dict.appointmentStatus[status]}</Badge>
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
        iconLeft={<CloseIcon size={14} />}
        onClick={onClose}
      >
        {dict.common.close}
      </Button>
    </span>
  );

  return (
    <Modal
      title={title}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      showCloseButton={false}
      className={className}
      style={style}
      onClose={onClose}
    >
      <AppointmentManagePanel
        appointment={appointment}
        onChanged={onChanged}
        onStatusChange={setStatus}
      />
    </Modal>
  );
};
