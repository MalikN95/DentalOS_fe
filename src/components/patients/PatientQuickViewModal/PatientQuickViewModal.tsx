'use client';

import { useRouter } from 'next/navigation';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import { Alert, Badge, Button, Modal, PatientAvatar } from '@/components/ui';
import { usePatient } from '@/hooks/usePatient';
import { PatientInfoPanel } from '@/components/patients/PatientInfoPanel/PatientInfoPanel';
import styles from './PatientQuickViewModal.module.css';

type PatientQuickViewModalProps = {
  patientId: string;
  className?: string;
  style?: React.CSSProperties;
  onClose: () => void;
};

export const PatientQuickViewModal = ({
  patientId,
  className,
  style,
  onClose,
}: PatientQuickViewModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { patient, isLoading, errorMessage } = usePatient(patientId);

  const handleViewDetails = () => {
    router.push(`/patients/${patientId}`);
    onClose();
  };

  const title = patient ? (
    <span className={styles.title}>
      <PatientAvatar
        size="sm"
        name={`${patient.firstName} ${patient.lastName}`}
        hasWarning={patient.allergies.length > 0}
        warningLabel={format(t.patientInfo.hasAllergiesWarning, {
          list: patient.allergies.join(', '),
        })}
      />
      {patient.lastName} {patient.firstName}
      <Badge color={patient.isActive ? 'success' : 'gray'}>
        {patient.isActive ? t.common.active : t.common.inactive}
      </Badge>
    </span>
  ) : (
    t.patients.title
  );

  return (
    <Modal
      title={title}
      size="sm"
      closeLabel={t.common.close}
      scrollHintLabel={t.common.scrollForMore}
      className={className}
      style={style}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={onClose}>
            {t.common.close}
          </Button>
          <Button type="button" disabled={!patient} onClick={handleViewDetails}>
            {t.patients.viewDetails}
          </Button>
        </>
      }
    >
      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
      {isLoading ? <p className={styles.state}>{t.common.loading}</p> : null}
      {patient ? <PatientInfoPanel patient={patient} hideHeader bordered={false} /> : null}
    </Modal>
  );
};
