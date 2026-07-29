'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CalendarIcon, EditIcon, FileTextIcon } from '@/components/icons/icons';
import { DoctorScheduleSection } from '@/components/staff/DoctorScheduleSection/DoctorScheduleSection';
import { StaffFormModal } from '@/components/staff/StaffFormModal/StaffFormModal';
import { Alert, Badge } from '@/components/ui';
import { STAFF_QUERY_KEY } from '@/hooks/useStaff';
import { STAFF_MEMBER_QUERY_KEY, useStaffMember } from '@/hooks/useStaffMember';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './StaffDetailContent.module.css';

type StaffDetailContentProps = {
  staffId: string;
};

export const StaffDetailContent = ({ staffId }: StaffDetailContentProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(selectCurrentUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { member, isLoading, errorMessage } = useStaffMember(staffId);

  const canManageStaff = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  const handleUpdated = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: [STAFF_MEMBER_QUERY_KEY, staffId] })
      .catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] }).catch(() => undefined);
  }, [queryClient, staffId]);

  return (
    <div className={styles.page}>
      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
      {isLoading ? <span className={styles.state}>{t.staff.loading}</span> : null}

      {!isLoading && member ? (
        <>
          <div className={styles.row}>
            <section className={styles.card}>
              <div className={styles.identity}>
                <span className={styles.avatar} aria-hidden="true">
                  {member.lastName.charAt(0)}
                  {member.firstName.charAt(0)}
                </span>
                <div className={styles.nameBlock}>
                  <span className={styles.name}>
                    {member.lastName} {member.firstName}
                  </span>
                  <div className={styles.badges}>
                    <Badge color={member.role === 'doctor' ? 'primary' : 'gray'}>
                      {t.roles[member.role]}
                    </Badge>
                    <Badge color={member.isActive ? 'success' : 'gray'}>
                      {member.isActive ? t.common.active : t.common.inactive}
                    </Badge>
                  </div>
                </div>
                {canManageStaff ? (
                  <button
                    type="button"
                    className={styles.editButton}
                    title={t.common.edit}
                    aria-label={t.common.edit}
                    onClick={() => setIsEditOpen(true)}
                  >
                    <EditIcon size={15} />
                  </button>
                ) : null}
              </div>

              <div className={styles.rows}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{t.staffDetail.email}</span>
                  <span className={styles.infoValue}>{member.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{t.staffDetail.phone}</span>
                  <span className={styles.infoValue}>{member.phone ?? t.common.dash}</span>
                </div>
                {member.doctorProfile ? (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>{t.staffDetail.branch}</span>
                    <span className={styles.infoValue}>
                      {member.doctorProfile.branchName ?? t.common.dash}
                    </span>
                  </div>
                ) : null}
              </div>
            </section>

            {member.doctorProfile ? (
              <section className={styles.card}>
                <div className={styles.header}>
                  <span className={styles.headerIcon}>
                    <FileTextIcon size={13} />
                  </span>
                  <h2 className={styles.heading}>{t.staff.form.doctorProfile}</h2>
                </div>

                <div className={styles.rows}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>{t.staff.form.experienceYears}</span>
                    <span className={styles.infoValue}>
                      {member.doctorProfile.experienceYears}
                    </span>
                  </div>
                </div>

                <div className={styles.block}>
                  <span className={styles.blockLabel}>{t.staff.form.specializations}</span>
                  {member.doctorProfile.specializations.length ? (
                    <div className={styles.tags}>
                      {member.doctorProfile.specializations.map((item) => (
                        <span key={item} className={styles.tag}>
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.muted}>{t.common.dash}</span>
                  )}
                </div>

                <div className={styles.block}>
                  <span className={styles.blockLabel}>{t.staff.form.education}</span>
                  {member.doctorProfile.education.length ? (
                    <div className={styles.tags}>
                      {member.doctorProfile.education.map((item) => (
                        <span key={item} className={styles.tag}>
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.muted}>{t.common.dash}</span>
                  )}
                </div>

                {member.doctorProfile.description ? (
                  <div className={styles.block}>
                    <span className={styles.blockLabel}>{t.staff.form.description}</span>
                    <p className={styles.description}>{member.doctorProfile.description}</p>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>

          {member.doctorProfile ? (
            <section className={styles.card}>
              <div className={styles.header}>
                <span className={styles.headerIcon}>
                  <CalendarIcon size={13} />
                </span>
                <h2 className={styles.heading}>{t.doctorSchedule.title}</h2>
              </div>
              <DoctorScheduleSection
                doctorProfileId={member.doctorProfile.id}
                branchId={member.doctorProfile.branchId}
                readOnly={!canManageStaff}
              />
            </section>
          ) : null}
        </>
      ) : null}

      {isEditOpen && member ? (
        <StaffFormModal
          member={member}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handleUpdated}
        />
      ) : null}
    </div>
  );
};
