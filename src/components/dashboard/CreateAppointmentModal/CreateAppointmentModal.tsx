'use client';

import { useId } from 'react';
import type {
  AppointmentFormBranch,
  AppointmentFormDoctor,
  AppointmentFormPatient,
  AppointmentFormService,
} from '@/common/types/appointment-form';
import { Alert, Button, TextField } from '@/components/ui';
import { useCreateAppointmentForm } from '@/hooks/useCreateAppointmentForm';
import styles from './CreateAppointmentModal.module.css';

type CreateAppointmentModalProps = {
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
  onClose,
  onSuccess,
  className,
  style,
}: CreateAppointmentModalProps) => {
  const { form, optionsQuery, filteredDoctors, mutation, resetDoctorSelection } =
    useCreateAppointmentForm({
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

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  const handleFormSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  const branches = optionsQuery.data?.branches ?? [];
  const patients = optionsQuery.data?.patients ?? [];
  const services = optionsQuery.data?.services ?? [];
  const isOptionsLoading = optionsQuery.isLoading;
  const optionsError = optionsQuery.error?.message ?? null;
  const submitError = mutation.error?.message ?? null;

  return (
    <div
      className={`${styles.overlay} ${className ?? ''}`}
      style={style}
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-appointment-title"
      >
        <div className={styles.header}>
          <span id="create-appointment-title" className={styles.title}>
            Новая запись
          </span>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Закрыть"
            onClick={handleCloseClick}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className={styles.body}>
            {optionsError ? <Alert color="danger">{optionsError}</Alert> : null}
            {submitError ? <Alert color="danger">{submitError}</Alert> : null}

            {isOptionsLoading ? (
              <span className={styles.state}>Загрузка справочников...</span>
            ) : null}

            {!isOptionsLoading ? (
              <>
                <SelectField label="Филиал" error={errors.branchId?.message}>
                  {(fieldId) => (
                    <select
                      id={fieldId}
                      className={`${styles.select} ${errors.branchId ? styles.selectError : ''}`}
                      name={branchField.name}
                      ref={branchField.ref}
                      onBlur={branchField.onBlur}
                      onChange={(event) => {
                        branchField.onChange(event);
                        resetDoctorSelection();
                      }}
                    >
                      <option value="">Выберите филиал</option>
                      {branches.map((branch: AppointmentFormBranch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  )}
                </SelectField>

                <SelectField label="Пациент" error={errors.patientId?.message}>
                  {(fieldId) => (
                    <select
                      id={fieldId}
                      className={`${styles.select} ${errors.patientId ? styles.selectError : ''}`}
                      {...register('patientId')}
                    >
                      <option value="">Выберите пациента</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {formatPatientLabel(patient)}
                        </option>
                      ))}
                    </select>
                  )}
                </SelectField>

                <SelectField label="Услуга" error={errors.serviceId?.message}>
                  {(fieldId) => (
                    <select
                      id={fieldId}
                      className={`${styles.select} ${errors.serviceId ? styles.selectError : ''}`}
                      {...register('serviceId')}
                    >
                      <option value="">Выберите услугу</option>
                      {services.map((service: AppointmentFormService) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  )}
                </SelectField>

                <SelectField label="Врач" error={errors.doctorProfileId?.message}>
                  {(fieldId) => (
                    <select
                      id={fieldId}
                      className={`${styles.select} ${errors.doctorProfileId ? styles.selectError : ''}`}
                      {...register('doctorProfileId')}
                    >
                      <option value="">Выберите врача</option>
                      {filteredDoctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {formatDoctorLabel(doctor)}
                        </option>
                      ))}
                    </select>
                  )}
                </SelectField>

                <TextField
                  label="Дата и время"
                  type="datetime-local"
                  error={errors.startsAt?.message}
                  {...register('startsAt')}
                />

                <SelectField label="Комментарий">
                  {(fieldId) => (
                    <textarea
                      id={fieldId}
                      className={styles.textarea}
                      placeholder="Необязательно"
                      {...register('comment')}
                    />
                  )}
                </SelectField>
              </>
            ) : null}
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="soft" color="gray" onClick={handleCloseClick}>
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isOptionsLoading || Boolean(optionsError)}
            >
              {isSubmitting ? 'Сохраняем...' : 'Создать запись'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
