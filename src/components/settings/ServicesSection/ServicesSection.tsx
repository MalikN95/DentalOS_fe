'use client';

import { useCallback, useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiService } from '@/common/types/service';
import { Alert, Badge, Button, Pagination, TextField } from '@/components/ui';
import { ServiceEditorModal } from '@/components/settings/ServiceEditorModal/ServiceEditorModal';
import { formatMoney } from '@/helpers/appointment-status';
import { useClinic } from '@/hooks/useClinic';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useServices } from '@/hooks/useServices';
import styles from './ServicesSection.module.css';

export const ServicesSection = () => {
  const { t: dict } = useTranslation();
  const t = dict.services;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editorService, setEditorService] = useState<ApiService | null>(null);
  const {
    services,
    total,
    page,
    limit,
    searchInput,
    setSearchInput,
    setPage,
    setLimit,
    query,
    deleteMutation,
  } = useServices();
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';
  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  const { isLoading } = query;
  const listError = query.error?.message ?? null;
  const deleteError = deleteMutation.error?.message ?? null;

  const handleDelete = useCallback(
    (service: ApiService) => {
      // eslint-disable-next-line no-alert -- simple delete confirmation
      const confirmed = window.confirm(format(t.confirmDelete, { name: service.name }));

      if (!confirmed) {
        return;
      }

      deleteMutation.mutate(service.id);
    },
    [deleteMutation, t],
  );

  const handleCloseEditor = useCallback(() => {
    setIsCreateOpen(false);
    setEditorService(null);
  }, []);

  return (
    <>
      <section className={styles.card}>
        <div className={styles.header}>
          <p className={styles.description}>{t.description}</p>
          <Button variant="soft" onClick={() => setIsCreateOpen(true)}>
            {t.add}
          </Button>
        </div>

        <TextField
          className={styles.search}
          placeholder={t.searchPlaceholder}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

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
                <th>{t.colCategory}</th>
                <th>{t.colPrice}</th>
                <th>{t.colDuration}</th>
                <th>{t.colOnlineBooking}</th>
                <th>{t.colStatus}</th>
                <th className={styles.actionsHead}>{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className={styles.stateCell} colSpan={7}>
                    {t.loading}
                  </td>
                </tr>
              ) : null}

              {!isLoading && services.length === 0 ? (
                <tr>
                  <td className={styles.stateCell} colSpan={7}>
                    {t.empty}
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? services.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.category?.name ?? dict.common.dash}</td>
                      <td>{formatMoney(service.price, currency)}</td>
                      <td>{format(t.durationMinutesShort, { minutes: service.durationMinutes })}</td>
                      <td>
                        <Badge color={service.acceptsOnlineBooking ? 'success' : 'gray'}>
                          {service.acceptsOnlineBooking ? t.yes : t.no}
                        </Badge>
                      </td>
                      <td>
                        <Badge color={service.isActive ? 'success' : 'gray'}>
                          {service.isActive ? dict.common.active : dict.common.inactive}
                        </Badge>
                      </td>
                      <td className={styles.actionsCell}>
                        <Button
                          type="button"
                          variant="soft"
                          color="gray"
                          onClick={() => setEditorService(service)}
                        >
                          {dict.common.edit}
                        </Button>
                        <Button
                          type="button"
                          variant="soft"
                          color="gray"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(service)}
                        >
                          {dict.common.delete}
                        </Button>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={limit} total={total} onPageChange={setPage} onLimitChange={setLimit} />
      </section>

      {isCreateOpen ? <ServiceEditorModal onClose={handleCloseEditor} /> : null}
      {editorService ? (
        <ServiceEditorModal service={editorService} onClose={handleCloseEditor} />
      ) : null}
    </>
  );
};
