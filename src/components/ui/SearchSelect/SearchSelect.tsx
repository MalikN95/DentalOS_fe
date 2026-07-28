'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/common/locale/LocaleProvider';
import styles from './SearchSelect.module.css';

export type SearchSelectOption = { value: string; label: string };

type SearchSelectProps = {
  label?: string;
  value: string;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  maxVisible?: number;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
};

const PANEL_GAP = 4;
const PANEL_MAX_HEIGHT = 280;
const PANEL_MIN_HEIGHT = 160;

type PanelPosition = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

// Fixed + portaled to <body> so the panel can never be clipped by a modal's
// (or any other ancestor's) overflow:hidden/auto — and sized to whichever side
// of the trigger actually has room, instead of a height that assumes a tall page.
const computePanelPosition = (trigger: HTMLElement): PanelPosition => {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP;
  const spaceAbove = rect.top - PANEL_GAP;
  const openUpward = spaceBelow < PANEL_MIN_HEIGHT && spaceAbove > spaceBelow;
  const available = openUpward ? spaceAbove : spaceBelow;

  return {
    left: rect.left,
    width: rect.width,
    maxHeight: Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_MAX_HEIGHT, available)),
    top: openUpward ? undefined : rect.bottom + PANEL_GAP,
    bottom: openUpward ? window.innerHeight - rect.top + PANEL_GAP : undefined,
  };
};

export const SearchSelect = ({
  label,
  value,
  options,
  placeholder = 'Выберите значение',
  searchPlaceholder = 'Поиск...',
  error,
  disabled = false,
  maxVisible = 60,
  className,
  style,
  onChange,
}: SearchSelectProps) => {
  const { t } = useTranslation();
  const labelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    inputRef.current?.focus();

    const updatePosition = () => {
      if (triggerRef.current) {
        setPanelPosition(computePanelPosition(triggerRef.current));
      }
    };

    updatePosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = containerRef.current?.contains(target) ?? false;
      const isInsidePanel = panelRef.current?.contains(target) ?? false;

      if (!isInsideTrigger && !isInsidePanel) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updatePosition);
    // capture: scroll events don't bubble, but a capturing listener still sees
    // scrolls on any nested scrollable ancestor (e.g. a modal's scroll body).
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = options
    .filter(
      (option) =>
        !normalizedQuery ||
        option.label.toLowerCase().includes(normalizedQuery) ||
        option.value.toLowerCase().includes(normalizedQuery),
    )
    .slice(0, maxVisible);

  const handleSelect = (nextValue: string) => {
    onChange?.(nextValue);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      {label ? (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      ) : null}

      <div ref={containerRef} className={styles.control}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.trigger} ${error ? styles.triggerError : ''}`}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? labelId : undefined}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedLabel ? styles.valueText : styles.placeholder}>
            {selectedLabel || placeholder}
          </span>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>⌄</span>
        </button>

        {open && panelPosition
          ? createPortal(
              <div
                ref={panelRef}
                className={styles.panel}
                style={{
                  left: panelPosition.left,
                  width: panelPosition.width,
                  maxHeight: panelPosition.maxHeight,
                  top: panelPosition.top,
                  bottom: panelPosition.bottom,
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.search}
                  placeholder={searchPlaceholder}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleKeyDown}
                  value={query}
                />
                <ul
                  className={styles.list}
                  role="listbox"
                  aria-labelledby={label ? labelId : undefined}
                >
                  {filtered.length === 0 ? (
                    <li className={styles.empty}>{t.common.nothingFound}</li>
                  ) : (
                    filtered.map((option) => (
                      <li key={option.value}>
                        <button
                          type="button"
                          className={`${styles.option} ${
                            option.value === value ? styles.optionActive : ''
                          }`}
                          onClick={() => handleSelect(option.value)}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
};
