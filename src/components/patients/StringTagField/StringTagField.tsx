'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from '@/common/locale/LocaleProvider';
import { CheckIcon, PlusIcon } from '@/components/icons/icons';
import { deriveTagHue, tagBackground, tagForeground } from '@/helpers/tag-color';
import { useFloatingPanelPosition } from '@/hooks/useFloatingPanelPosition';
import styles from './StringTagField.module.css';

const MAX_VISIBLE = 3;

type StringTagFieldProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options: string[];
  label: string;
  emptyLabel: string;
  addLabel: string;
  searchPlaceholder: string;
  /** Template containing `{name}`, e.g. 'Create "{name}"'. */
  createLabelTemplate: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const Pill = ({ value, onRemove }: { value: string; onRemove?: () => void }) => {
  const hue = deriveTagHue(value);
  const pillStyle: React.CSSProperties = {
    background: tagBackground(hue),
    color: tagForeground(hue),
  };

  return (
    <span className={styles.pill} style={pillStyle}>
      <span className={styles.pillLabel}>{value}</span>
      {onRemove ? (
        <button
          type="button"
          className={styles.removeButton}
          aria-label={value}
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

export const StringTagField = ({
  value,
  onChange,
  options,
  label,
  emptyLabel,
  addLabel,
  searchPlaceholder,
  createLabelTemplate,
  disabled = false,
  className,
  style,
}: StringTagFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const morePopoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [query, setQuery] = useState('');
  const popoverPosition = useFloatingPanelPosition(addButtonRef, isOpen);
  const morePopoverPosition = useFloatingPanelPosition(moreButtonRef, isMoreOpen, {
    minHeight: 40,
  });

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
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMoreOpen]);

  const selected = new Set(value);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter(
    (option) => !normalizedQuery || option.toLowerCase().includes(normalizedQuery),
  );
  const hasExactMatch = options.some((option) => option.toLowerCase() === normalizedQuery);

  const handleToggle = (option: string) => {
    if (selected.has(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleRemove = (item: string) => {
    onChange(value.filter((existing) => existing !== item));
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name || selected.has(name)) return;

    onChange([...value, name]);
    setQuery('');
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style} ref={containerRef}>
      <span className={styles.label}>{label}</span>

      <div className={styles.pills}>
        {value.length === 0 ? <span className={styles.muted}>{emptyLabel}</span> : null}

        {visible.map((item) => (
          <Pill
            key={item}
            value={item}
            onRemove={disabled ? undefined : () => handleRemove(item)}
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
              {overflow.map((item) => (
                <Pill
                  key={item}
                  value={item}
                  onRemove={disabled ? undefined : () => handleRemove(item)}
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
                onChange={(event) => setQuery(event.target.value)}
              />

              <div className={styles.options}>
                {filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={styles.option}
                    onClick={() => handleToggle(option)}
                  >
                    <Pill value={option} />
                    {selected.has(option) ? (
                      <CheckIcon size={14} className={styles.checkIcon} />
                    ) : null}
                  </button>
                ))}
              </div>

              {query.trim() && !hasExactMatch ? (
                <button type="button" className={styles.createOption} onClick={handleCreate}>
                  {format(createLabelTemplate, { name: query.trim() })}
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
