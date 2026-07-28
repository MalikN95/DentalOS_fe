'use client';

import type { PatientTag } from '@/common/types/patient-tag';
import { tagBackground, tagForeground, tagHue } from '@/helpers/tag-color';
import styles from './TagPill.module.css';

type TagPillProps = {
  tag: PatientTag;
  /** Shows a small × button that calls onRemove. */
  onRemove?: () => void;
  /** Makes the whole pill clickable, e.g. to open a color picker. */
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const TagPill = ({ tag, onRemove, onClick, className, style }: TagPillProps) => {
  const hue = tagHue(tag);
  const pillStyle: React.CSSProperties = {
    ...style,
    background: tagBackground(hue),
    color: tagForeground(hue),
  };

  const content = (
    <>
      <span className={styles.label}>{tag.name}</span>
      {onRemove ? (
        <button
          type="button"
          className={styles.removeButton}
          aria-label={tag.name}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          ×
        </button>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.pill} ${styles.pillButton} ${className ?? ''}`}
        style={pillStyle}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={`${styles.pill} ${className ?? ''}`} style={pillStyle}>
      {content}
    </span>
  );
};
