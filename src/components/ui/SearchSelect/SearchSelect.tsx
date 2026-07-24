'use client';

import { useEffect, useId, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    inputRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

        {open ? (
          <div className={styles.panel}>
            <input
              ref={inputRef}
              type="text"
              className={styles.search}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
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
                      role="option"
                      aria-selected={option.value === value}
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
          </div>
        ) : null}
      </div>

      {error ? <span className={styles.errorText}>{error}</span> : null}
    </div>
  );
};
