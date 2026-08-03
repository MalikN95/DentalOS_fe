'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { PatientTag } from '@/common/types/patient-tag';
import { EditIcon, RefreshIcon, TrashIcon } from '@/components/icons/icons';
import { TAG_HUE_PRESETS, tagBackground, tagForeground, tagHue } from '@/helpers/tag-color';
import styles from './TagCard.module.css';

type TagCardProps = {
  tag: PatientTag;
  onRename: (name: string) => void;
  onRecolor: (hue: number) => void;
  onDelete: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
  /** Opens the card straight into name-editing — used right after creation. */
  autoFocusName?: boolean;
};

export const TagCard = ({
  tag,
  onRename,
  onRecolor,
  onDelete,
  isSaving,
  isDeleting,
  autoFocusName,
}: TagCardProps) => {
  const { t } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(Boolean(autoFocusName));
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [name, setName] = useState(tag.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const hue = tagHue(tag);

  useEffect(() => {
    if (!isEditingName) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditingName]);

  const commitName = () => {
    const trimmed = name.trim();
    setIsEditingName(false);
    if (trimmed && trimmed !== tag.name) {
      onRename(trimmed);
    } else {
      setName(tag.name);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <button
          type="button"
          className={styles.swatchButton}
          title={t.tags.pickColor}
          aria-label={t.tags.pickColor}
          onClick={() => setIsPaletteOpen((prev) => !prev)}
        >
          <span className={styles.swatch} style={{ background: tagBackground(hue) }} />
        </button>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            title={t.tags.rename}
            aria-label={t.tags.rename}
            onClick={() => {
              setName(tag.name);
              setIsEditingName(true);
            }}
          >
            <EditIcon size={14} />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            title={t.tags.delete}
            aria-label={t.tags.delete}
            disabled={isDeleting}
            onClick={onDelete}
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {isPaletteOpen ? (
        <div className={styles.palette}>
          {TAG_HUE_PRESETS.map((presetHue) => (
            <button
              key={presetHue}
              type="button"
              className={styles.paletteSwatch}
              style={{ background: tagBackground(presetHue) }}
              aria-label={t.tags.pickColor}
              onClick={() => {
                onRecolor(presetHue);
                setIsPaletteOpen(false);
              }}
            />
          ))}
          <button
            type="button"
            className={styles.rerollButton}
            title={t.tags.rerollColor}
            aria-label={t.tags.rerollColor}
            onClick={() => {
              onRecolor(Math.floor(Math.random() * 360));
              setIsPaletteOpen(false);
            }}
          >
            <RefreshIcon size={13} />
          </button>
        </div>
      ) : null}

      {isEditingName ? (
        <input
          ref={inputRef}
          className={styles.nameInput}
          value={name}
          disabled={isSaving}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitName();
            if (event.key === 'Escape') {
              setName(tag.name);
              setIsEditingName(false);
            }
          }}
        />
      ) : (
        <span className={styles.name} style={{ color: tagForeground(hue) }}>
          {tag.name}
        </span>
      )}
    </div>
  );
};
