'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiServiceOption } from '@/common/types/service';
import { CheckIcon, PlusIcon } from '@/components/icons/icons';
import { deriveTagHue, tagBackground, tagForeground } from '@/helpers/tag-color';
import { useCreateServiceOption } from '@/hooks/useCreateServiceOption';
import { useFloatingPanelPosition } from '@/hooks/useFloatingPanelPosition';
import styles from './DoctorServicesField.module.css';

const MAX_VISIBLE = 3;

type DoctorServicesFieldProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options: ApiServiceOption[];
  label: string;
  emptyLabel: string;
  addLabel: string;
  searchPlaceholder: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const ServicePill = ({ name, onRemove }: { name: string; onRemove?: () => void }) => {
  const hue = deriveTagHue(name);
  const pillStyle: React.CSSProperties = {
    background: tagBackground(hue),
    color: tagForeground(hue),
  };

  return (
    <span className={styles.pill} style={pillStyle}>
      <span className={styles.pillLabel}>{name}</span>
      {onRemove ? (
        <button
          type="button"
          className={styles.removeButton}
          aria-label={name}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
};

export const DoctorServicesField = ({
  value,
  onChange,
  options,
  label,
  emptyLabel,
  addLabel,
  searchPlaceholder,
  disabled = false,
  className,
  style,
}: DoctorServicesFieldProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const containerRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const morePopoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const createMutation = useCreateServiceOption();
  const popoverPosition = useFloatingPanelPosition(addButtonRef, isOpen);
  const morePopoverPosition = useFloatingPanelPosition(moreButtonRef, isMoreOpen, {
    minHeight: 40,
  });

  const optionsById = new Map(options.map((service) => [service.id, service]));
  const nameFor = (id: string) => optionsById.get(id)?.name ?? id;

  const visible = value.slice(0, MAX_VISIBLE);
  const overflow = value.slice(MAX_VISIBLE);

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
        setQuery('');
        setIsCreating(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMoreOpen]);

  const selected = new Set(value);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter(
    (service) => !normalizedQuery || service.name.toLowerCase().includes(normalizedQuery),
  );
  const hasExactMatch = options.some(
    (service) => service.name.trim().toLowerCase() === normalizedQuery,
  );

  const handleToggle = (id: string) => {
    if (selected.has(id)) {
      onChange(value.filter((existing) => existing !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((existing) => existing !== id));
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setNewPrice('');
    setNewDuration('30');
  };

  const handleConfirmCreate = () => {
    const name = query.trim();
    if (!name || !newPrice.trim() || !newDuration.trim()) return;

    createMutation.mutate(
      { name, price: newPrice.trim(), durationMinutes: Number(newDuration) },
      {
        onSuccess: (service) => {
          onChange([...value, service.id]);
          setQuery('');
          setIsCreating(false);
        },
      },
    );
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style} ref={containerRef}>
      <span className={styles.label}>{label}</span>

      <div className={styles.pills}>
        {value.length === 0 ? <span className={styles.muted}>{emptyLabel}</span> : null}

        {visible.map((id) => (
          <ServicePill
            key={id}
            name={nameFor(id)}
            onRemove={disabled ? undefined : () => handleRemove(id)}
          />
        ))}

        {overflow.length > 0 ? (
          <button
            ref={moreButtonRef}
            type="button"
            className={styles.moreButton}
            onClick={() => setIsMoreOpen((prev) => !prev)}
          >
            •••
          </button>
        ) : null}

        {disabled ? null : (
          <button
            ref={addButtonRef}
            type="button"
            className={styles.addButton}
            title={addLabel}
            aria-label={addLabel}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <PlusIcon size={13} />
          </button>
        )}
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
              {overflow.map((id) => (
                <ServicePill
                  key={id}
                  name={nameFor(id)}
                  onRemove={disabled ? undefined : () => handleRemove(id)}
                />
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
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setIsCreating(false);
                }}
              />

              <div className={styles.options}>
                {filteredOptions.length === 0 ? (
                  <p className={styles.empty}>{dict.common.nothingFound}</p>
                ) : (
                  filteredOptions.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      className={styles.option}
                      onClick={() => handleToggle(service.id)}
                    >
                      <span className={styles.optionName}>{service.name}</span>
                      {selected.has(service.id) ? (
                        <CheckIcon size={14} className={styles.checkIcon} />
                      ) : null}
                    </button>
                  ))
                )}
              </div>

              {query.trim() && !hasExactMatch && !isCreating ? (
                <button type="button" className={styles.createOption} onClick={handleOpenCreate}>
                  {format(t.createServiceOption, { name: query.trim() })}
                </button>
              ) : null}

              {query.trim() && !hasExactMatch && isCreating ? (
                <div className={styles.createForm}>
                  <span className={styles.createFormTitle}>
                    {format(t.createServiceOption, { name: query.trim() })}
                  </span>
                  <div className={styles.createFormRow}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={styles.createFormInput}
                      placeholder={t.priceLabel}
                      value={newPrice}
                      onChange={(event) => setNewPrice(event.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className={styles.createFormInput}
                      placeholder={t.newServiceDuration}
                      value={newDuration}
                      onChange={(event) => setNewDuration(event.target.value)}
                    />
                  </div>

                  {createMutation.error ? (
                    <p className={styles.createFormError}>{createMutation.error.message}</p>
                  ) : null}

                  <div className={styles.createFormActions}>
                    <button
                      type="button"
                      className={styles.createFormCancel}
                      onClick={() => setIsCreating(false)}
                    >
                      {dict.common.cancel}
                    </button>
                    <button
                      type="button"
                      className={styles.createFormSubmit}
                      disabled={
                        !newPrice.trim() || !newDuration.trim() || createMutation.isPending
                      }
                      onClick={handleConfirmCreate}
                    >
                      {createMutation.isPending ? dict.common.saving : t.createServiceSubmit}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
