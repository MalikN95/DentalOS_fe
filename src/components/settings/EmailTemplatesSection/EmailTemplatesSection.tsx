'use client';

import { useCallback, useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { EmailTemplate } from '@/common/types/email-template';
import { Alert, Button, PlaceholderText } from '@/components/ui';
import { EmailTemplateEditorModal } from '@/components/settings/EmailTemplateEditorModal/EmailTemplateEditorModal';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import styles from './EmailTemplatesSection.module.css';

export const EmailTemplatesSection = () => {
  const { t: dict } = useTranslation();
  const t = dict.emailTemplates;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editorTemplate, setEditorTemplate] = useState<EmailTemplate | null>(null);
  const { templatesQuery, deleteMutation } = useEmailTemplates();
  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  const { data: templates = [], isLoading, error: templatesError } = templatesQuery;
  const listError = templatesError?.message ?? null;
  const deleteError = deleteMutation.error?.message ?? null;

  const handleDelete = useCallback(
    (template: EmailTemplate) => {
      // eslint-disable-next-line no-alert -- simple delete confirmation
      const confirmed = window.confirm(format(t.confirmDelete, { name: template.name }));

      if (!confirmed) {
        return;
      }

      deleteMutation.mutate(template.id);
    },
    [deleteMutation, t],
  );

  const handleCloseEditor = useCallback(() => {
    setIsCreateOpen(false);
    setEditorTemplate(null);
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
                <th>{t.colSubject}</th>
                <th className={styles.actionsHead}>{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className={styles.stateCell} colSpan={3}>
                    {t.loading}
                  </td>
                </tr>
              ) : null}

              {!isLoading && templates.length === 0 ? (
                <tr>
                  <td className={styles.stateCell} colSpan={3}>
                    {t.empty}
                  </td>
                </tr>
              ) : null}

              {!isLoading
                ? templates.map((template) => (
                    <tr key={template.id}>
                      <td>{template.name}</td>
                      <td className={styles.subjectCell}>
                        <PlaceholderText text={template.subject} placeholderLabels={t.placeholders} />
                      </td>
                      <td className={styles.actionsCell}>
                        <Button
                          type="button"
                          variant="soft"
                          color="gray"
                          onClick={() => setEditorTemplate(template)}
                        >
                          {dict.common.edit}
                        </Button>
                        <Button
                          type="button"
                          variant="soft"
                          color="gray"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(template)}
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
      </section>

      {isCreateOpen ? <EmailTemplateEditorModal onClose={handleCloseEditor} /> : null}
      {editorTemplate ? (
        <EmailTemplateEditorModal template={editorTemplate} onClose={handleCloseEditor} />
      ) : null}
    </>
  );
};
