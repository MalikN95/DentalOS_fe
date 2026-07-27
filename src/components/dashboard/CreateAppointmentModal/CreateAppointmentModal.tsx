'use client';

import { useId } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type {
  AppointmentFormBranch,
  AppointmentFormDoctor,
  AppointmentFormPatient,
  AppointmentFormService,
} from '@/common/types/appointment-form';
import { Alert, Button, Modal, TextField } from '@/components/ui';
import { useCreateAppointmentForm } from '@/hooks/useCreateAppointmentForm';
import styles from './CreateAppointmentModal.module.css';

type CreateAppointmentModalProps = {
  /** Pre-selects and locks the patient, e.g. when opened from their profile. */
  initialPatientId?: string;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

type SelectFieldProps = {
  label: string;
  error?: string;
  children: (fieldId: string) => React.ReactNode;
};

const SelectField = ({ label, error, children }: SelectFieldProps) => {
  const fieldId = useId();

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      {children(fieldId)}
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </div>
  );
};

const formatPatientLabel = (patient: AppointmentFormPatient): string => {
  const name = `${patient.firstName} ${patient.lastName}`.trim();
  return patient.phone ? `${name} · ${patient.phone}` : name;
};

const formatDoctorLabel = (doctor: AppointmentFormDoctor): string =>
  `${doctor.user.firstName} ${doctor.user.lastName}`.trim();

export const CreateAppointmentModal = ({
  initialPatientId,
  onClose,
  onSuccess,
  className,
  style,
}: CreateAppointmentModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.appointments;
  const { form, optionsQuery, filteredDoctors, mutation, resetDoctorSelection } =
    useCreateAppointmentForm({
      initialPatientId,
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const branchField = register('branchId');

  const handleCloseClick = () => {
    onClose();
  };

  const handleFormSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  const handleBranchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Modal's onSubmit replays autofill by re-dispatching `change` on every
    // filled control, including this one with its value unchanged — only
    // clear the doctor when the branch itself actually changed.
    const previousBranchId = form.getValues('branchId');
    branchField.onChange(event);

    if (event.target.value !== previousBranchId) {
      resetDoctorSelection();
    }
  };

  const branches = optionsQuery.data?.branches ?? [];
  const patients = optionsQuery.data?.patients ?? [];
  const services = optionsQuery.data?.services ?? [];
  const lockedPatient = initialPatientId
    ? patients.find((patient) => patient.id === initialPatientId)
    : undefined;
  const isOptionsLoading = optionsQuery.isLoading;
  const optionsError = optionsQuery.error?.message ?? null;
  const submitError = mutation.error?.message ?? null;

  return (
    <Modal
      title={t.modalTitle}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      className={className}
      style={style}
      onClose={handleCloseClick}
      onSubmit={handleFormSubmit}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={handleCloseClick}>
            {dict.settings.cancel}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isOptionsLoading || Boolean(optionsError)}
          >
            {isSubmitting ? dict.common.saving : t.create}
          </Button>
        </>
      }
    >
      {optionsError ? <Alert color="danger">{optionsError}</Alert> : null}
      {submitError ? <Alert color="danger">{submitError}</Alert> : null}

      {isOptionsLoading ? <span className={styles.state}>{t.loadingOptions}</span> : null}

      {!isOptionsLoading ? (
        <>
          <SelectField label={t.branch} error={errors.branchId?.message}>
            {(fieldId) => (
              <select
                id={fieldId}
                className={`${styles.select} ${errors.branchId ? styles.selectError : ''}`}
                name={branchField.name}
                ref={branchField.ref}
                onBlur={branchField.onBlur}
                onChange={handleBranchChange}
              >
                <option value="">{t.selectBranch}</option>
                {branches.map((branch: AppointmentFormBranch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            )}
          </SelectField>

          {initialPatientId ? (
            <div className={styles.field}>
              <span className={styles.label}>{t.patient}</span>
              <div className={styles.staticValue}>
                {lockedPatient ? formatPatientLabel(lockedPatient) : '…'}
              </div>
            </div>
          ) : (
            <SelectField label={t.patient} error={errors.patientId?.message}>
              {(fieldId) => (
                <select
                  id={fieldId}
                  className={`${styles.select} ${errors.patientId ? styles.selectError : ''}`}
                  {...register('patientId')}
                >
                  <option value="">{t.selectPatient}</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {formatPatientLabel(patient)}
                    </option>
                  ))}
                </select>
              )}
            </SelectField>
          )}

          <SelectField label={t.service} error={errors.serviceId?.message}>
            {(fieldId) => (
              <select
                id={fieldId}
                className={`${styles.select} ${errors.serviceId ? styles.selectError : ''}`}
                {...register('serviceId')}
              >
                <option value="">{t.selectService}</option>
                {services.map((service: AppointmentFormService) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            )}
          </SelectField>

          <SelectField label={t.doctor} error={errors.doctorProfileId?.message}>
            {(fieldId) => (
              <select
                id={fieldId}
                className={`${styles.select} ${errors.doctorProfileId ? styles.selectError : ''}`}
                {...register('doctorProfileId')}
              >
                <option value="">{t.selectDoctor}</option>
                {filteredDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {formatDoctorLabel(doctor)}
                  </option>
                ))}
              </select>
            )}
          </SelectField>

          <TextField
            label={t.dateTime}
            type="datetime-local"
            error={errors.startsAt?.message}
            {...register('startsAt')}
          />

          <SelectField label={t.comment}>
            {(fieldId) => (
              <textarea
                id={fieldId}
                className={styles.textarea}
                placeholder={t.commentPlaceholder}
                {...register('comment')}
              />
            )}
          </SelectField>
        </>
      ) : null}
    </Modal>
  );
};
