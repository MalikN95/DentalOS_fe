'use client';

import { useCallback, useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { BranchSettings } from '@/common/types/settings';
import { Alert, Badge, Button } from '@/components/ui';
import { CreateBranchModal } from '@/components/settings/CreateBranchModal/CreateBranchModal';
import { useBranchSettings } from '@/hooks/useBranchSettings';
import { useDragScroll } from '@/hooks/useDragScroll';
import styles from './BranchesSection.module.css';

const formatCoordinates = (branch: BranchSettings): string | null => {
  if (branch.latitude && branch.longitude) {
    return `${branch.latitude}, ${branch.longitude}`;
  }

  return null;
};

export const BranchesSection = () => {
  const { t: dict } = useTranslation();
  const t = dict.branches;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { branchesQuery, createForm, createMutation, deleteMutation, resetCreateForm } =
    useBranchSettings();
  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    resetCreateForm();
  }, [resetCreateForm]);

  const handleCreateSubmit = createForm.handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        resetCreateForm();
      },
    });
  });

  const { data: branches = [], isLoading, error: branchesError } = branchesQuery;
  const listError = branchesError?.message ?? null;
  const deleteError = deleteMutation.error?.message ?? null;

  const handleDeleteBranch = useCallback(
    (branch: BranchSettings) => {
      // eslint-disable-next-line no-alert -- simple delete confirmation
      const confirmed = window.confirm(format(t.confirmDelete, { name: branch.name }));

      if (!confirmed) {
        return;
      }

      deleteMutation.mutate(branch.id);
    },
    [deleteMutation, t],
  );

  return (
    <>
      <section className={styles.card}>
        <div className={styles.header}>
          <p className={styles.description}>{t.description}</p>
          <Button variant="soft" onClick={handleOpenCreateModal}>
            {t.add}
          </Button>
        </div>

        {listError ? <Alert color="danger">{listError}</Alert> : null}
        {deleteError ? <Alert color="danger">{deleteError}</Alert> : null}

        <div
          ref={tableWrapRef}
          className={`${styles.tableWrap} ${isTableDragging ? styles.dragging : ''}`}
          {...dragScrollHandlers}
        >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.colName}</th>
              <th>{t.colAddress}</th>
              <th>{t.colPhone}</th>
              <th>{t.colStatus}</th>
              <th className={styles.actionsCell}>{t.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={5}>
                  {t.loading}
                </td>
              </tr>
            ) : null}

            {!isLoading && branches.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={5}>
                  {t.empty}
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? branches.map((branch) => {
                  const coordinates = formatCoordinates(branch);

                  return (
                    <tr key={branch.id}>
                      <td>{branch.name}</td>
                      <td>
                        {branch.address}
                        {coordinates ? (
                          <span className={styles.secondaryText}>{coordinates}</span>
                        ) : null}
                      </td>
                      <td>{branch.phone ?? dict.common.dash}</td>
                      <td>
                        <Badge color={branch.isActive ? 'success' : 'gray'}>
                          {branch.isActive ? dict.common.active : dict.common.inactive}
                        </Badge>
                      </td>
                      <td className={styles.actionsCell}>
                        <Button
                          type="button"
                          variant="soft"
                          color="gray"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDeleteBranch(branch)}
                        >
                          {dict.common.delete}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        </div>
      </section>

      {isCreateModalOpen ? (
        <CreateBranchModal
          createForm={createForm}
          createMutation={createMutation}
          onCreateSubmit={handleCreateSubmit}
          onClose={handleCloseCreateModal}
        />
      ) : null}
    </>
  );
};
