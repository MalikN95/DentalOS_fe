'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { StaffMember } from '@/common/types/staff';
import { Alert, Badge, Button } from '@/components/ui';
import { useDragScroll } from '@/hooks/useDragScroll';
import styles from './StaffTable.module.css';

type StaffTableProps = {
  staff: StaffMember[];
  isLoading?: boolean;
  errorMessage?: string | null;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onEdit?: (member: StaffMember) => void;
  onDelete?: (member: StaffMember) => void;
};

export const StaffTable = ({
  staff,
  isLoading = false,
  errorMessage = null,
  footer,
  className,
  style,
  onEdit,
  onDelete,
}: StaffTableProps) => {
  const { t } = useTranslation();
  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      {errorMessage ? (
        <div className={styles.stateWrap}>
          <Alert color="danger">{errorMessage}</Alert>
        </div>
      ) : null}

      <div
        ref={tableWrapRef}
        className={`${styles.tableWrap} ${isTableDragging ? styles.dragging : ''}`}
        {...dragScrollHandlers}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.staff.colEmployee}</th>
              <th>{t.staff.colRole}</th>
              <th>{t.staff.colContacts}</th>
              <th>{t.staff.colSpecializations}</th>
              <th>{t.staff.colBranch}</th>
              <th>{t.staff.colStatus}</th>
              <th className={styles.actionsHead}>{t.staff.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={7}>
                  {t.staff.loading}
                </td>
              </tr>
            ) : null}

            {!isLoading && staff.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={7}>
                  {t.staff.empty}
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? staff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span className={styles.employee}>
                        <span className={styles.avatar} aria-hidden="true">
                          {member.lastName.charAt(0)}
                          {member.firstName.charAt(0)}
                        </span>
                        <span className={styles.employeeName}>
                          <span className={styles.fullName}>
                            {member.lastName} {member.firstName}
                          </span>
                          {member.doctorProfile ? (
                            <span className={styles.experience}>
                              {t.staff.experienceShort}: {member.doctorProfile.experienceYears}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </td>
                    <td>
                      <Badge color={member.role === 'doctor' ? 'primary' : 'gray'}>
                        {t.roles[member.role]}
                      </Badge>
                    </td>
                    <td>
                      <span className={styles.contacts}>
                        <span>{member.email}</span>
                        <span className={styles.phone}>{member.phone ?? t.common.dash}</span>
                      </span>
                    </td>
                    <td className={styles.wrapCell}>
                      {member.doctorProfile?.specializations.length
                        ? member.doctorProfile.specializations.join(', ')
                        : t.common.dash}
                    </td>
                    <td>{member.doctorProfile?.branchName ?? t.common.dash}</td>
                    <td>
                      <Badge color={member.isActive ? 'success' : 'gray'}>
                        {member.isActive ? t.common.active : t.common.inactive}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button variant="soft" color="gray" onClick={() => onEdit?.(member)}>
                          {t.common.edit}
                        </Button>
                        <Button variant="soft" color="danger" onClick={() => onDelete?.(member)}>
                          {t.common.delete}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList}>
        {isLoading ? <div className={styles.mobileStateBlock}>{t.staff.loading}</div> : null}
        {!isLoading && staff.length === 0 ? (
          <div className={styles.mobileStateBlock}>{t.staff.empty}</div>
        ) : null}

        {!isLoading
          ? staff.map((member) => (
              <div key={member.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHead}>
                  <span className={styles.employee}>
                    <span className={styles.avatar} aria-hidden="true">
                      {member.lastName.charAt(0)}
                      {member.firstName.charAt(0)}
                    </span>
                    <span className={styles.employeeName}>
                      <span className={styles.fullName}>
                        {member.lastName} {member.firstName}
                      </span>
                      {member.doctorProfile ? (
                        <span className={styles.experience}>
                          {t.staff.experienceShort}: {member.doctorProfile.experienceYears}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <Badge color={member.isActive ? 'success' : 'gray'}>
                    {member.isActive ? t.common.active : t.common.inactive}
                  </Badge>
                </div>

                <div className={styles.mobileMeta}>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.staff.colRole}</span>
                    <span className={styles.mobileMetaValue}>
                      <Badge color={member.role === 'doctor' ? 'primary' : 'gray'}>
                        {t.roles[member.role]}
                      </Badge>
                    </span>
                  </div>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.staff.colContacts}</span>
                    <span className={styles.mobileMetaValue}>
                      {member.email}
                      <br />
                      {member.phone ?? t.common.dash}
                    </span>
                  </div>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.staff.colSpecializations}</span>
                    <span className={styles.mobileMetaValue}>
                      {member.doctorProfile?.specializations.length
                        ? member.doctorProfile.specializations.join(', ')
                        : t.common.dash}
                    </span>
                  </div>
                  <div className={styles.mobileMetaItem}>
                    <span className={styles.mobileMetaLabel}>{t.staff.colBranch}</span>
                    <span className={styles.mobileMetaValue}>
                      {member.doctorProfile?.branchName ?? t.common.dash}
                    </span>
                  </div>
                </div>

                <div className={styles.mobileActions}>
                  <Button variant="soft" color="gray" onClick={() => onEdit?.(member)}>
                    {t.common.edit}
                  </Button>
                  <Button variant="soft" color="danger" onClick={() => onDelete?.(member)}>
                    {t.common.delete}
                  </Button>
                </div>
              </div>
            ))
          : null}
      </div>
      {footer ?? null}
    </div>
  );
};
