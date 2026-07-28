'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CheckIcon, ChevronDownIcon, TagIcon } from '@/components/icons/icons';
import { TagPill } from '@/components/patients/TagPill/TagPill';
import { usePatientTagCatalog } from '@/hooks/usePatientTagCatalog';
import styles from './PatientTagFilter.module.css';

type PatientTagFilterProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
};

export const PatientTagFilter = ({ selectedIds, onChange, className }: PatientTagFilterProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { tags } = usePatientTagCatalog();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${selectedIds.length > 0 ? styles.triggerActive : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <TagIcon size={16} />
        <span>
          {t.patients.tagsFilterLabel}
          {selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
        </span>
        <ChevronDownIcon size={14} className={isOpen ? styles.chevronOpen : ''} />
      </button>

      {isOpen ? (
        <div className={styles.popover}>
          {tags.length === 0 ? (
            <span className={styles.empty}>{t.patientInfo.noTags}</span>
          ) : (
            tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={styles.option}
                onClick={() => toggle(tag.id)}
              >
                <TagPill tag={tag} />
                {selectedIds.includes(tag.id) ? (
                  <CheckIcon size={14} className={styles.checkIcon} />
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};
