'use client';

import { useId } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import styles from './Pagination.module.css';

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  rowsPerPageOptions?: number[];
  /** Hide the "rows per page" selector, e.g. inside a compact card widget. */
  showRowsPerPage?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
};

const DEFAULT_OPTIONS = [10, 20, 50, 100, 200];

export const Pagination = ({
  page,
  limit,
  total,
  rowsPerPageOptions = DEFAULT_OPTIONS,
  showRowsPerPage = true,
  className,
  style,
  onPageChange,
  onLimitChange,
}: PaginationProps) => {
  const { t } = useTranslation();
  const selectId = useId();
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const handlePrev = () => onPageChange?.(Math.max(1, page - 1));
  const handleNext = () => onPageChange?.(Math.min(totalPages, page + 1));

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <div className={styles.rows}>
        {showRowsPerPage ? (
          <label className={styles.rowsLabel} htmlFor={selectId}>
            <span className={styles.label}>{t.pagination.rowsPerPage}</span>
            <select
              id={selectId}
              className={styles.select}
              value={limit}
              onChange={(event) => onLimitChange?.(Number(event.target.value))}
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <span className={styles.range}>
          {from}–{to} {t.pagination.of} {total}
        </span>
      </div>

      {totalPages > 1 ? (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.pageButton}
            disabled={page <= 1}
            onClick={handlePrev}
          >
            {t.pagination.prev}
          </button>
          <span className={styles.pageInfo}>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            disabled={page >= totalPages}
            onClick={handleNext}
          >
            {t.pagination.next}
          </button>
        </div>
      ) : null}
    </div>
  );
};
