'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import type { PatientTag } from '@/common/types/patient-tag';
import { CheckIcon, PlusIcon, RefreshIcon } from '@/components/icons/icons';
import { TagPill } from '@/components/patients/TagPill/TagPill';
import { TAG_HUE_PRESETS, randomTagHue, tagBackground } from '@/helpers/tag-color';
import { useAssignPatientTag } from '@/hooks/useAssignPatientTag';
import { useFloatingPanelPosition } from '@/hooks/useFloatingPanelPosition';
import { useOverflowCount } from '@/hooks/useOverflowCount';
import { usePatientTagCatalog } from '@/hooks/usePatientTagCatalog';
import styles from './PatientTagsField.module.css';

// Must match .pills' CSS `gap` and the .addButton/.moreButton widths.
const TAGS_GAP = 6;
const ADD_BUTTON_WIDTH = 22;
const MORE_BUTTON_WIDTH = 22;

type PatientTagsFieldProps = {
  patient: Patient;
};

export const PatientTagsField = ({ patient }: PatientTagsFieldProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const morePopoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [colorEditId, setColorEditId] = useState<string | null>(null);

  const { tags: catalog, createMutation, updateMutation } = usePatientTagCatalog();
  const { addMutation, removeMutation } = useAssignPatientTag(patient.id);
  const popoverPosition = useFloatingPanelPosition(addButtonRef, isOpen);
  const morePopoverPosition = useFloatingPanelPosition(moreButtonRef, isMoreOpen, {
    minHeight: 40,
  });
  const { measureRef, visibleCount } = useOverflowCount(pillsRef, patient.tags.length, {
    trailing: ADD_BUTTON_WIDTH,
    more: MORE_BUTTON_WIDTH,
    gap: TAGS_GAP,
  });

  const visibleTags = patient.tags.slice(0, visibleCount);
  const overflowTags = patient.tags.slice(visibleCount);

  useEffect(() => {
    if (!isOpen && !isMoreOpen) return undefined;

    if (isOpen) {
      searchInputRef.current?.focus();
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target) ?? false;
      const isInsidePopover = popoverRef.current?.contains(target) ?? false;
      const isInsideMorePopover = morePopoverRef.current?.contains(target) ?? false;

      if (!isInsideContainer && !isInsidePopover && !isInsideMorePopover) {
        setIsOpen(false);
        setIsMoreOpen(false);
        setColorEditId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMoreOpen]);

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

      <div className={styles.measurer} aria-hidden="true">
        {patient.tags.map((tag, index) => (
          <span key={tag.id} ref={measureRef(index)} className={styles.measureItem}>
            <TagPill tag={tag} onRemove={() => removeMutation.mutate(tag.id)} />
          </span>
        ))}
      </div>

      <div className={styles.pills} ref={pillsRef}>
        {patient.tags.length === 0 ? (
          <span className={styles.muted}>{t.patientInfo.noTags}</span>
        ) : (
          visibleTags.map((tag) => (
            <TagPill key={tag.id} tag={tag} onRemove={() => removeMutation.mutate(tag.id)} />
          ))
        )}

        {overflowTags.length > 0 ? (
          <button
            ref={moreButtonRef}
            type="button"
            className={styles.moreButton}
            onClick={() => setIsMoreOpen((prev) => !prev)}
          >
            •••
          </button>
        ) : null}

        <button
          ref={addButtonRef}
          type="button"
          className={styles.addButton}
          title={t.patientInfo.addTag}
          aria-label={t.patientInfo.addTag}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <PlusIcon size={13} />
        </button>
      </div>

      {isMoreOpen && morePopoverPosition
        ? createPortal(
            <div
              ref={morePopoverRef}
              className={styles.morePopover}
              style={{
                left: morePopoverPosition.left,
                top: morePopoverPosition.top,
                bottom: morePopoverPosition.bottom,
              }}
            >
              {overflowTags.map((tag) => (
                <TagPill key={tag.id} tag={tag} onRemove={() => removeMutation.mutate(tag.id)} />
              ))}
            </div>,
            document.body,
          )
        : null}

      {isOpen && popoverPosition
        ? createPortal(
            <div
              ref={popoverRef}
              className={styles.popover}
              style={{
                left: popoverPosition.left,
                maxHeight: popoverPosition.maxHeight,
                top: popoverPosition.top,
                bottom: popoverPosition.bottom,
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                className={styles.search}
                placeholder={t.patientInfo.searchOrCreateTag}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              <div className={styles.options}>
                {filteredCatalog.map((tag) => (
                  <div key={tag.id} className={styles.optionRow}>
                    <button
                      type="button"
                      className={styles.option}
                      onClick={() => handleToggle(tag)}
                    >
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
                      onClick={() =>
                        setColorEditId((current) => (current === tag.id ? null : tag.id))
                      }
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
