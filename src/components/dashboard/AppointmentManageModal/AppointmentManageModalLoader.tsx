'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { Alert, Modal } from '@/components/ui';
import { useAppointment } from '@/hooks/useAppointment';
import { AppointmentManageModal } from './AppointmentManageModal';

type AppointmentManageModalLoaderProps = {
  appointmentId: string;
  onClose: () => void;
  onChanged?: () => void;
};

/**
 * Opens AppointmentManageModal from just an appointment id — for places
 * (e.g. the invoices table) that only have the id, not the full row object.
 */
export const AppointmentManageModalLoader = ({
  appointmentId,
  onClose,
  onChanged,
}: AppointmentManageModalLoaderProps) => {
  const { t: dict } = useTranslation();
  const t = dict.appointments;
  const { appointment, isLoading, errorMessage } = useAppointment(appointmentId);

  if (isLoading || !appointment) {
    return (
      <Modal title={t.manageTitle} closeLabel={dict.common.close} onClose={onClose}>
        {errorMessage ? (
          <Alert color="danger">{errorMessage}</Alert>
        ) : (
          <p>{isLoading ? t.loadingCard : t.notFound}</p>
        )}
      </Modal>
    );
  }

  return <AppointmentManageModal appointment={appointment} onClose={onClose} onChanged={onChanged} />;
};
