'use client';

import { useEffect, useRef, useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import type { PatientTag } from '@/common/types/patient-tag';
import { CheckIcon, PlusIcon, RefreshIcon } from '@/components/icons/icons';
import { TagPill } from '@/components/patients/TagPill/TagPill';
import { TAG_HUE_PRESETS, randomTagHue, tagBackground } from '@/helpers/tag-color';
import { useAssignPatientTag } from '@/hooks/useAssignPatientTag';
import { usePatientTagCatalog } from '@/hooks/usePatientTagCatalog';
import styles from './PatientTagsField.module.css';

type PatientTagsFieldProps = {
  patient: Patient;
};

export const PatientTagsField = ({ patient }: PatientTagsFieldProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [colorEditId, setColorEditId] = useState<string | null>(null);

  const { tags: catalog, createMutation, updateMutation } = usePatientTagCatalog();
  const { addMutation, removeMutation } = useAssignPatientTag(patient.id);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setColorEditId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const assignedIds = new Set(patient.tags.map((tag) => tag.id));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCatalog = catalog.filter(
    (tag) => !normalizedQuery || tag.name.toLowerCase().includes(normalizedQuery),
  );
  const hasExactMatch = catalog.some((tag) => tag.name.toLowerCase() === normalizedQuery);

  const handleToggle = (tag: PatientTag) => {
    if (assignedIds.has(tag.id)) {
      removeMutation.mutate(tag.id);
    } else {
      addMutation.mutate(tag.id);
    }
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;

    createMutation.mutate(
      { name },
      {
        onSuccess: (created) => {
          addMutation.mutate(created.id);
          setQuery('');
        },
      },
    );
  };

  const handleReroll = (tag: PatientTag) => {
    updateMutation.mutate({ id: tag.id, payload: { color: randomTagHue() } });
  };

  const handlePickColor = (tag: PatientTag, hue: number) => {
    updateMutation.mutate({ id: tag.id, payload: { color: hue } });
    setColorEditId(null);
  };

  return (
    <div className={styles.block} ref={containerRef}>
      <span className={styles.blockLabel}>{t.patientInfo.tags}</span>

      <div className={styles.pills}>
        {patient.tags.length === 0 ? (
          <span className={styles.muted}>{t.patientInfo.noTags}</span>
        ) : (
          patient.tags.map((tag) => (
            <TagPill key={tag.id} tag={tag} onRemove={() => removeMutation.mutate(tag.id)} />
          ))
        )}

        <button
          type="button"
          className={styles.addButton}
          title={t.patientInfo.addTag}
          aria-label={t.patientInfo.addTag}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <PlusIcon size={13} />
        </button>
      </div>

      {isOpen ? (
        <div className={styles.popover}>
          <input
            type="text"
            className={styles.search}
            placeholder={t.patientInfo.searchOrCreateTag}
            value={query}
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className={styles.options}>
            {filteredCatalog.map((tag) => (
              <div key={tag.id} className={styles.optionRow}>
                <button type="button" className={styles.option} onClick={() => handleToggle(tag)}>
                  <TagPill tag={tag} />
                  {assignedIds.has(tag.id) ? (
                    <CheckIcon size={14} className={styles.checkIcon} />
                  ) : null}
                </button>
                <button
                  type="button"
                  className={styles.rerollButton}
                  title={t.patientInfo.rerollColor}
                  aria-label={t.patientInfo.rerollColor}
                  onClick={() => handleReroll(tag)}
                >
                  <RefreshIcon size={13} />
                </button>
                <button
                  type="button"
                  className={styles.colorSwatchButton}
                  title={t.patientInfo.pickColor}
                  aria-label={t.patientInfo.pickColor}
                  onClick={() => setColorEditId((current) => (current === tag.id ? null : tag.id))}
                >
                  <span
                    className={styles.colorSwatch}
                    style={{ background: tagBackground(tag.color ?? 0) }}
                  />
                </button>

                {colorEditId === tag.id ? (
                  <div className={styles.palette}>
                    {TAG_HUE_PRESETS.map((hue) => (
                      <button
                        key={hue}
                        type="button"
                        className={styles.paletteSwatch}
                        style={{ background: tagBackground(hue) }}
                        aria-label={t.patientInfo.pickColor}
                        onClick={() => handlePickColor(tag, hue)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {query.trim() && !hasExactMatch ? (
            <button type="button" className={styles.createOption} onClick={handleCreate}>
              {format(t.patientInfo.createTag, { name: query.trim() })}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
