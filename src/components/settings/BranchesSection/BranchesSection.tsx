'use client';

import { useCallback, useState } from 'react';
import type { BranchSettings } from '@/common/types/settings';
import { Alert, Badge, Button } from '@/components/ui';
import { CreateBranchModal } from '@/components/settings/CreateBranchModal/CreateBranchModal';
import { useBranchSettings } from '@/hooks/useBranchSettings';
import styles from './BranchesSection.module.css';

const formatCoordinates = (branch: BranchSettings): string | null => {
  if (branch.latitude && branch.longitude) {
    return `${branch.latitude}, ${branch.longitude}`;
  }

  return null;
};

export const BranchesSection = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { branchesQuery, createForm, createMutation, deleteMutation, resetCreateForm } =
    useBranchSettings();

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
      const confirmed = window.confirm(`Удалить филиал «${branch.name}»?`);

      if (!confirmed) {
        return;
      }

      deleteMutation.mutate(branch.id);
    },
    [deleteMutation],
  );

  return (
    <>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Филиалы</h2>
            <p className={styles.description}>Добавляйте и управляйте филиалами клиники.</p>
          </div>
          <Button variant="soft" onClick={handleOpenCreateModal}>
            + Добавить филиал
          </Button>
        </div>

        {listError ? <Alert color="danger">{listError}</Alert> : null}
        {deleteError ? <Alert color="danger">{deleteError}</Alert> : null}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Адрес</th>
              <th>Телефон</th>
              <th>Статус</th>
              <th className={styles.actionsCell}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={5}>
                  Загрузка филиалов...
                </td>
              </tr>
            ) : null}

            {!isLoading && branches.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={5}>
                  Филиалов пока нет
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
                      <td>{branch.phone ?? '—'}</td>
                      <td>
                        <Badge color={branch.isActive ? 'success' : 'gray'}>
                          {branch.isActive ? 'Активен' : 'Неактивен'}
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
                          Удалить
                        </Button>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
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
