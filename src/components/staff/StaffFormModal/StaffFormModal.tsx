'use client';

import { useId } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { StaffMember } from '@/common/types/staff';
import { STAFF_ROLES } from '@/common/types/staff';
import { StringTagField } from '@/components/patients/StringTagField/StringTagField';
import { DoctorScheduleSection } from '@/components/staff/DoctorScheduleSection/DoctorScheduleSection';
import { DoctorServicesField } from '@/components/staff/DoctorServicesField/DoctorServicesField';
import { Alert, Button, Modal, PhoneField, SwitchToggle, TextField } from '@/components/ui';
import { useBranchOptions } from '@/hooks/useBranchOptions';
import { useServiceOptions } from '@/hooks/useServiceOptions';
import { useSpecializationsCatalog } from '@/hooks/useSpecializationsCatalog';
import { useStaffForm } from '@/hooks/useStaffForm';
import styles from './StaffFormModal.module.css';

type StaffFormModalProps = {
  member?: StaffMember | null;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const StaffFormModal = ({
  member,
  onClose,
  onSuccess,
  className,
  style,
}: StaffFormModalProps) => {
  'use no memo';

  const { t: dict } = useTranslation();
  const t = dict.staff.form;
  const roleFieldId = useId();
  const branchFieldId = useId();
  const descriptionFieldId = useId();
  const reviewRatingFieldId = useId();
  const { branches } = useBranchOptions();
  const { options: specializationOptions } = useSpecializationsCatalog();
  const { services: serviceOptions } = useServiceOptions();

  const { form, mutation, isEditMode } = useStaffForm({
    member,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const selectedRole = useWatch({ control, name: 'role' });
  const branchId = useWatch({ control, name: 'branchId' });
  const isActive = useWatch({ control, name: 'isActive' });
  const acceptsOnlineBooking = useWatch({ control, name: 'acceptsOnlineBooking' });
  const specializations = useWatch({ control, name: 'specializations' });
  const serviceIds = useWatch({ control, name: 'serviceIds' });
  const notifyEmail = useWatch({ control, name: 'notifyEmail' });
  const notifyWhatsapp = useWatch({ control, name: 'notifyWhatsapp' });
  const notifyPush = useWatch({ control, name: 'notifyPush' });
  const notifyInApp = useWatch({ control, name: 'notifyInApp' });
  const reviewAlertMaxRating = useWatch({ control, name: 'reviewAlertMaxRating' });

  const handleFormSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  const handleActiveChange = (checked: boolean) => {
    setValue('isActive', checked);
  };

  const isDoctor = selectedRole === 'doctor';
  const canReceiveReviewAlerts = selectedRole === 'owner' || selectedRole === 'admin';
  const submitError = mutation.error?.message ?? null;
  const submitIdleLabel = isEditMode ? t.save : t.create;

  return (
    <Modal
      title={isEditMode ? t.editTitle : t.createTitle}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      className={className}
      style={style}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={onClose}>
            {dict.settings.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? dict.common.saving : submitIdleLabel}
          </Button>
        </>
      }
    >
      {submitError ? <Alert color="danger">{submitError}</Alert> : null}

      <div className={styles.grid}>
        <TextField label={t.lastName} error={errors.lastName?.message} {...register('lastName')} />
        <TextField
          label={t.firstName}
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextField
          label={t.email}
          type="email"
          placeholder="doctor@clinic.local"
          autoComplete="off"
          error={errors.email?.message}
          {...register('email')}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <PhoneField
              label={t.phone}
              error={fieldState.error?.message}
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <label className={styles.field} htmlFor={roleFieldId}>
          <span className={styles.label}>{t.role}</span>
          <select id={roleFieldId} className={styles.select} {...register('role')}>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {dict.roles[role]}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label={t.password}
          type="password"
          autoComplete="new-password"
          placeholder={isEditMode ? t.passwordKeep : t.passwordPlaceholder}
          hint={isEditMode ? t.passwordKeep : t.passwordHint}
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      {isDoctor ? (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t.doctorProfile}</legend>
          <div className={styles.grid}>
            <label className={styles.field} htmlFor={branchFieldId}>
              <span className={styles.label}>{t.branch}</span>
              <select id={branchFieldId} className={styles.select} {...register('branchId')}>
                <option value="">{t.branchNotSet}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
            <TextField
              label={t.experienceYears}
              inputMode="numeric"
              error={errors.experienceYears?.message}
              {...register('experienceYears')}
            />
          </div>

          <StringTagField
            label={t.specializations}
            value={specializations}
            onChange={(next) => setValue('specializations', next)}
            options={specializationOptions}
            emptyLabel={t.specializationsEmpty}
            addLabel={t.specializationsAdd}
            searchPlaceholder={t.specializationsSearchPlaceholder}
            createLabelTemplate={t.createTagTemplate}
          />
          <TextField
            label={t.education}
            placeholder={t.educationPlaceholder}
            {...register('education')}
          />

          <DoctorServicesField
            label={t.services}
            value={serviceIds}
            onChange={(next) => setValue('serviceIds', next)}
            options={serviceOptions}
            emptyLabel={t.servicesEmpty}
            addLabel={t.servicesAdd}
            searchPlaceholder={t.servicesSearchPlaceholder}
          />

          <label className={styles.field} htmlFor={descriptionFieldId}>
            <span className={styles.label}>{t.description}</span>
            <textarea
              id={descriptionFieldId}
              className={styles.textarea}
              placeholder={t.descriptionPlaceholder}
              {...register('description')}
            />
          </label>

          <div className={styles.onlineBooking}>
            <SwitchToggle
              checked={acceptsOnlineBooking}
              label={t.acceptsOnlineBooking}
              onChange={(checked) => setValue('acceptsOnlineBooking', checked)}
            />
            <span className={styles.onlineBookingHint}>{t.acceptsOnlineBookingHint}</span>

            <TextField
              className={styles.maxAdvanceBookingDaysField}
              label={t.maxAdvanceBookingDays}
              hint={t.maxAdvanceBookingDaysHint}
              placeholder={t.maxAdvanceBookingDaysPlaceholder}
              inputMode="numeric"
              error={errors.maxAdvanceBookingDays?.message}
              {...register('maxAdvanceBookingDays')}
            />
          </div>
        </fieldset>
      ) : null}

      {isDoctor && member?.doctorProfile ? (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{dict.doctorSchedule.title}</legend>
          <DoctorScheduleSection
            doctorProfileId={member.doctorProfile.id}
            branchId={branchId || null}
          />
        </fieldset>
      ) : null}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{t.notifications}</legend>
        <div className={styles.notificationToggles}>
          <SwitchToggle
            checked={notifyEmail}
            label={t.notifyEmail}
            onChange={(checked) => setValue('notifyEmail', checked)}
          />
          <SwitchToggle
            checked={notifyWhatsapp}
            label={t.notifyWhatsapp}
            onChange={(checked) => setValue('notifyWhatsapp', checked)}
          />
          <SwitchToggle
            checked={notifyPush}
            label={t.notifyPush}
            onChange={(checked) => setValue('notifyPush', checked)}
          />
          <SwitchToggle
            checked={notifyInApp}
            label={t.notifyInApp}
            onChange={(checked) => setValue('notifyInApp', checked)}
          />
        </div>

        {canReceiveReviewAlerts ? (
          <label className={styles.field} htmlFor={reviewRatingFieldId}>
            <span className={styles.label}>{t.reviewAlertMaxRating}</span>
            <select
              id={reviewRatingFieldId}
              className={styles.select}
              value={reviewAlertMaxRating}
              onChange={(event) => setValue('reviewAlertMaxRating', Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
            <span className={styles.hint}>{t.reviewAlertMaxRatingHint}</span>
          </label>
        ) : null}
      </fieldset>

      <SwitchToggle checked={isActive} label={t.active} onChange={handleActiveChange} />
    </Modal>
  );
};
