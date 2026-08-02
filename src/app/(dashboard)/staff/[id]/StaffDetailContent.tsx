'use client';

import { useCallback, useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWatch } from 'react-hook-form';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { STAFF_ROLES } from '@/common/types/staff';
import { CalendarIcon, EditIcon, FileTextIcon } from '@/components/icons/icons';
import { StringTagField } from '@/components/patients/StringTagField/StringTagField';
import { ReviewsCard } from '@/components/reviews/ReviewsCard/ReviewsCard';
import { DoctorScheduleSection } from '@/components/staff/DoctorScheduleSection/DoctorScheduleSection';
import { DoctorServicesField } from '@/components/staff/DoctorServicesField/DoctorServicesField';
import { Alert, Badge, Button, SwitchToggle, TextField } from '@/components/ui';
import {
  NOTIFICATION_CHANNEL_COLOR,
  type NotificationChannelKey,
} from '@/helpers/notification-channel';
import { deriveTagHue, tagBackground, tagForeground } from '@/helpers/tag-color';
import { useBranchOptions } from '@/hooks/useBranchOptions';
import { useServiceOptions } from '@/hooks/useServiceOptions';
import { useSpecializationsCatalog } from '@/hooks/useSpecializationsCatalog';
import { STAFF_QUERY_KEY } from '@/hooks/useStaff';
import { STAFF_MEMBER_QUERY_KEY, useStaffMember } from '@/hooks/useStaffMember';
import { useStaffForm } from '@/hooks/useStaffForm';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './StaffDetailContent.module.css';

type StaffDetailContentProps = {
  staffId: string;
};

const NOTIFICATION_CHANNELS: { key: NotificationChannelKey; label: 'notifyEmail' | 'notifyWhatsapp' | 'notifyPush' | 'notifyInApp' }[] = [
  { key: 'email', label: 'notifyEmail' },
  { key: 'whatsapp', label: 'notifyWhatsapp' },
  { key: 'push', label: 'notifyPush' },
  { key: 'inApp', label: 'notifyInApp' },
];

export const StaffDetailContent = ({ staffId }: StaffDetailContentProps) => {
  'use no memo';

  const { t: dict } = useTranslation();
  const t = dict.staff.form;
  const roleFieldId = useId();
  const branchFieldId = useId();
  const descriptionFieldId = useId();
  const reviewRatingFieldId = useId();
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(selectCurrentUser);
  const [isEditing, setIsEditing] = useState(false);
  const { member, isLoading, errorMessage } = useStaffMember(staffId);
  const { branches } = useBranchOptions();
  const { options: specializationOptions } = useSpecializationsCatalog();
  const { services: serviceOptions } = useServiceOptions();

  const canManageStaff = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const doctorProfile = member?.doctorProfile ?? null;

  const handleUpdated = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: [STAFF_MEMBER_QUERY_KEY, staffId] })
      .catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] }).catch(() => undefined);
  }, [queryClient, staffId]);

  const { form, mutation } = useStaffForm({
    member,
    onSuccess: () => {
      handleUpdated();
      setIsEditing(false);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = form;

  const selectedRole = useWatch({ control, name: 'role' });
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

  const handleCancel = () => {
    mutation.reset();
    resetForm();
    setIsEditing(false);
  };

  const handleActiveChange = (checked: boolean) => {
    setValue('isActive', checked);
  };

  const isDoctor = selectedRole === 'doctor';
  const canReceiveReviewAlerts = selectedRole === 'owner' || selectedRole === 'admin';
  const memberReceivesReviewAlerts = member?.role === 'owner' || member?.role === 'admin';
  const submitError = mutation.error?.message ?? null;
  const showDoctorSection = Boolean(doctorProfile) || (isEditing && isDoctor);

  return (
    <div className={styles.page}>
      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
      {isLoading ? <span className={styles.state}>{dict.staff.loading}</span> : null}

      {!isLoading && member ? (
        <>
          <form onSubmit={handleFormSubmit}>
            <div className={styles.row}>
              <section className={styles.card}>
                <div className={styles.identity}>
                  <span className={styles.avatar} aria-hidden="true">
                    {member.lastName.charAt(0)}
                    {member.firstName.charAt(0)}
                  </span>
                  {isEditing ? (
                    <div className={styles.nameFields}>
                      <TextField
                        label={t.lastName}
                        error={errors.lastName?.message}
                        {...register('lastName')}
                      />
                      <TextField
                        label={t.firstName}
                        error={errors.firstName?.message}
                        {...register('firstName')}
                      />
                    </div>
                  ) : (
                    <div className={styles.nameBlock}>
                      <span className={styles.name}>
                        {member.lastName} {member.firstName}
                      </span>
                      <div className={styles.badges}>
                        <Badge color={member.role === 'doctor' ? 'primary' : 'gray'}>
                          {dict.roles[member.role]}
                        </Badge>
                        <Badge color={member.isActive ? 'success' : 'gray'}>
                          {member.isActive ? dict.common.active : dict.common.inactive}
                        </Badge>
                      </div>
                    </div>
                  )}
                  {canManageStaff && !isEditing ? (
                    <button
                      type="button"
                      className={styles.editButton}
                      title={dict.common.edit}
                      aria-label={dict.common.edit}
                      onClick={() => setIsEditing(true)}
                    >
                      <EditIcon size={15} />
                    </button>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className={styles.fieldsGrid}>
                    <TextField
                      label={t.email}
                      type="email"
                      autoComplete="off"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <TextField
                      label={t.phone}
                      placeholder="+79001234567"
                      error={errors.phone?.message}
                      {...register('phone')}
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
                      placeholder={t.passwordKeep}
                      hint={t.passwordKeep}
                      error={errors.password?.message}
                      {...register('password')}
                    />
                  </div>
                ) : (
                  <div className={styles.rows}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>{dict.staffDetail.email}</span>
                      <span className={styles.infoValue}>{member.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>{dict.staffDetail.phone}</span>
                      <span className={styles.infoValue}>{member.phone ?? dict.common.dash}</span>
                    </div>
                    {doctorProfile ? (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{dict.staffDetail.branch}</span>
                        <span className={styles.infoValue}>
                          {doctorProfile.branchName ?? dict.common.dash}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}

                {isEditing ? (
                  <SwitchToggle
                    checked={isActive}
                    label={t.active}
                    onChange={handleActiveChange}
                  />
                ) : null}

                {isEditing ? (
                  <div className={styles.block}>
                    <span className={styles.blockLabel}>{t.notifications}</span>
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
                  </div>
                ) : null}

                {isEditing && canReceiveReviewAlerts ? (
                  <label className={styles.field} htmlFor={reviewRatingFieldId}>
                    <span className={styles.label}>{t.reviewAlertMaxRating}</span>
                    <select
                      id={reviewRatingFieldId}
                      className={styles.select}
                      value={reviewAlertMaxRating}
                      onChange={(event) =>
                        setValue('reviewAlertMaxRating', Number(event.target.value))
                      }
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

                {!isEditing && member ? (
                  <div className={styles.block}>
                    <span className={styles.blockLabel}>{t.notifications}</span>
                    <div className={styles.tags}>
                      {NOTIFICATION_CHANNELS.map(({ key, label }) => {
                        const enabled = member.notificationPreferences[key];
                        return (
                          <Badge
                            key={key}
                            color={enabled ? NOTIFICATION_CHANNEL_COLOR[key] : 'gray'}
                            className={enabled ? undefined : styles.notificationDisabled}
                          >
                            {t[label]}
                          </Badge>
                        );
                      })}
                    </div>
                    {memberReceivesReviewAlerts ? (
                      <span className={styles.muted}>
                        {t.reviewAlertMaxRating}: {member.notificationPreferences.reviewAlertMaxRating}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </section>

              {showDoctorSection ? (
                <section className={styles.card}>
                  <div className={styles.header}>
                    <span className={styles.headerIcon}>
                      <FileTextIcon size={13} />
                    </span>
                    <h2 className={styles.heading}>{t.doctorProfile}</h2>
                    {!isEditing && doctorProfile ? (
                      <Badge color={doctorProfile.acceptsOnlineBooking ? 'success' : 'gray'}>
                        {doctorProfile.acceptsOnlineBooking
                          ? t.acceptsOnlineBooking
                          : t.acceptsOnlineBookingOff}
                      </Badge>
                    ) : null}
                  </div>

                  {isEditing ? (
                    <>
                      <div className={styles.fieldsGrid}>
                        <label className={styles.field} htmlFor={branchFieldId}>
                          <span className={styles.label}>{t.branch}</span>
                          <select
                            id={branchFieldId}
                            className={styles.select}
                            {...register('branchId')}
                          >
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
                        <span className={styles.onlineBookingHint}>
                          {t.acceptsOnlineBookingHint}
                        </span>
                      </div>
                    </>
                  ) : null}

                  {!isEditing && doctorProfile ? (
                    <>
                      <div className={styles.rows}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>{t.experienceYears}</span>
                          <span className={styles.infoValue}>
                            {doctorProfile.experienceYears}
                          </span>
                        </div>
                      </div>

                      <div className={styles.block}>
                        <span className={styles.blockLabel}>{t.specializations}</span>
                        {doctorProfile.specializations.length ? (
                          <div className={styles.tags}>
                            {doctorProfile.specializations.map((item) => {
                              const hue = deriveTagHue(item);
                              return (
                                <span
                                  key={item}
                                  className={styles.tag}
                                  style={{
                                    background: tagBackground(hue),
                                    color: tagForeground(hue),
                                  }}
                                >
                                  {item}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className={styles.muted}>{dict.common.dash}</span>
                        )}
                      </div>

                      <div className={styles.block}>
                        <span className={styles.blockLabel}>{t.education}</span>
                        {doctorProfile.education.length ? (
                          <div className={styles.tags}>
                            {doctorProfile.education.map((item) => (
                              <span key={item} className={styles.tag}>
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.muted}>{dict.common.dash}</span>
                        )}
                      </div>

                      <div className={styles.block}>
                        <span className={styles.blockLabel}>{t.services}</span>
                        {doctorProfile.services.length ? (
                          <div className={styles.tags}>
                            {doctorProfile.services.map((service) => {
                              const hue = deriveTagHue(service.name);
                              return (
                                <span
                                  key={service.id}
                                  className={styles.tag}
                                  style={{
                                    background: tagBackground(hue),
                                    color: tagForeground(hue),
                                  }}
                                >
                                  {service.name}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className={styles.muted}>{dict.common.dash}</span>
                        )}
                      </div>

                      {doctorProfile.description ? (
                        <div className={styles.block}>
                          <span className={styles.blockLabel}>{t.description}</span>
                          <p className={styles.description}>{doctorProfile.description}</p>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </section>
              ) : null}
            </div>

            {isEditing ? (
              <div className={styles.actions}>
                {submitError ? <Alert color="danger">{submitError}</Alert> : null}
                <div className={styles.actionButtons}>
                  <Button
                    type="button"
                    variant="soft"
                    color="gray"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    {dict.common.cancel}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? dict.common.saving : dict.common.save}
                  </Button>
                </div>
              </div>
            ) : null}
          </form>

          {doctorProfile ? (
            <section className={styles.card}>
              <div className={styles.header}>
                <span className={styles.headerIcon}>
                  <CalendarIcon size={13} />
                </span>
                <h2 className={styles.heading}>{dict.doctorSchedule.title}</h2>
              </div>
              <DoctorScheduleSection
                doctorProfileId={doctorProfile.id}
                branchId={doctorProfile.branchId}
                readOnly={!canManageStaff}
              />
            </section>
          ) : null}

          {doctorProfile ? <ReviewsCard doctorProfileId={doctorProfile.id} /> : null}
        </>
      ) : null}
    </div>
  );
};
