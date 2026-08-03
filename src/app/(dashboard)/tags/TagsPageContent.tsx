'use client';

import { useMemo, useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import { SearchIcon, TagIcon } from '@/components/icons/icons';
import { TagCard } from '@/components/tags/TagCard/TagCard';
import { Alert, Button, EmptyState, TextField } from '@/components/ui';
import { usePatientTagCatalog } from '@/hooks/usePatientTagCatalog';
import styles from './TagsPageContent.module.css';

export const TagsPageContent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [newTagId, setNewTagId] = useState<string | null>(null);

  const { tags, isLoading, errorMessage, createMutation, updateMutation, deleteMutation } =
    usePatientTagCatalog();

  const filteredTags = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, search]);

  const handleAdd = () => {
    createMutation.mutate(
      { name: t.tags.namePlaceholder, color: Math.floor(Math.random() * 360) },
      { onSuccess: (created) => setNewTagId(created.id) },
    );
  };

  const handleDelete = (id: string, name: string) => {
    // eslint-disable-next-line no-alert -- simple delete confirmation
    const confirmed = window.confirm(format(t.tags.confirmDelete, { name }));
    if (!confirmed) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{t.tags.title}</h1>

        <TextField
          className={styles.search}
          size="sm"
          placeholder={t.tags.searchPlaceholder}
          iconLeft={<SearchIcon size={16} />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <p className={styles.description}>{t.tags.description}</p>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
      {deleteMutation.error ? <Alert color="danger">{deleteMutation.error.message}</Alert> : null}
      {createMutation.error ? <Alert color="danger">{createMutation.error.message}</Alert> : null}

      <div className={styles.toolbar}>
        <Button
          iconLeft={<TagIcon size={16} />}
          disabled={createMutation.isPending}
          onClick={handleAdd}
        >
          {t.tags.add}
        </Button>
      </div>

      {isLoading ? <p className={styles.state}>{t.tags.loading}</p> : null}

      {!isLoading && filteredTags.length === 0 ? (
        <EmptyState title={t.tags.empty} icon={<TagIcon size={28} />} />
      ) : null}

      {!isLoading && filteredTags.length > 0 ? (
        <div className={styles.grid}>
          {filteredTags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              autoFocusName={tag.id === newTagId}
              isSaving={updateMutation.isPending}
              isDeleting={deleteMutation.isPending}
              onRename={(name) => updateMutation.mutate({ id: tag.id, payload: { name } })}
              onRecolor={(color) => updateMutation.mutate({ id: tag.id, payload: { color } })}
              onDelete={() => handleDelete(tag.id, tag.name)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
