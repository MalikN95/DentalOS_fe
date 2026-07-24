'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { StaffFilter, StaffMember, StaffRole } from '@/common/types/staff';
import { STAFF_ROLES } from '@/common/types/staff';
import { SearchIcon } from '@/components/icons/icons';
import { DeleteStaffDialog } from '@/components/staff/DeleteStaffDialog/DeleteStaffDialog';
import { StaffFormModal } from '@/components/staff/StaffFormModal/StaffFormModal';
import { StaffTable } from '@/components/staff/StaffTable/StaffTable';
import { Button, Pagination, TextField } from '@/components/ui';
import { useDeleteStaff } from '@/hooks/useDeleteStaff';
import { STAFF_QUERY_KEY, useStaff } from '@/hooks/useStaff';
import styles from './StaffPageContent.module.css';

const FILTER_VALUES: StaffFilter[] = ['all', 'active', 'inactive'];

export const StaffPageContent = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    query,
    staff,
    total,
    page,
    limit,
    filter,
    role,
    searchInput,
    setSearchInput,
    setPage,
    setLimit,
    setFilter,
    setRole,
  } = useStaff();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<StaffMember | null>(null);

  const filterLabels: Record<StaffFilter, string> = {
    all: t.staff.filterAll,
    active: t.staff.filterActive,
    inactive: t.staff.filterInactive,
  };

  const invalidateStaff = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] }).catch(() => undefined);
  }, [queryClient]);

  const deleteMutation = useDeleteStaff({
    onSuccess: () => {
      invalidateStaff();
      setDeletingMember(null);
    },
  });

  const handleConfirmDelete = useCallback(() => {
    if (deletingMember) {
      deleteMutation.mutate(deletingMember.id);
    }
  }, [deletingMember, deleteMutation]);

  const handleRoleSelect = (value: string) => {
    setRole(value === '' ? null : (value as StaffRole));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.staff.title}</h1>
          <p className={styles.subtitle}>
            {t.staff.total}: {total}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>{t.staff.newEmployee}</Button>
      </div>

      <div className={styles.toolbar}>
        <TextField
          className={styles.search}
          placeholder={t.staff.searchPlaceholder}
          iconLeft={<SearchIcon size={18} />}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <div className={styles.controls}>
          <select
            className={styles.roleSelect}
            aria-label={t.staff.roleFilter}
            value={role ?? ''}
            onChange={(event) => handleRoleSelect(event.target.value)}
          >
            <option value="">{t.staff.roleFilterAll}</option>
            {STAFF_ROLES.map((value) => (
              <option key={value} value={value}>
                {t.roles[value]}
              </option>
            ))}
          </select>

          <div className={styles.filters}>
            {FILTER_VALUES.map((value) => (
              <Button
                key={value}
                variant={filter === value ? 'solid' : 'soft'}
                color={filter === value ? 'primary' : 'gray'}
                onClick={() => setFilter(value)}
              >
                {filterLabels[value]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <StaffTable
        staff={staff}
        isLoading={query.isLoading}
        errorMessage={query.error?.message ?? null}
        onEdit={setEditingMember}
        onDelete={setDeletingMember}
        footer={
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        }
      />

      {isCreateOpen ? (
        <StaffFormModal onClose={() => setIsCreateOpen(false)} onSuccess={invalidateStaff} />
      ) : null}

      {editingMember ? (
        <StaffFormModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSuccess={invalidateStaff}
        />
      ) : null}

      {deletingMember ? (
        <DeleteStaffDialog
          member={deletingMember}
          isDeleting={deleteMutation.isPending}
          errorMessage={deleteMutation.error?.message ?? null}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingMember(null)}
        />
      ) : null}
    </div>
  );
};
