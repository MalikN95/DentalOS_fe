'use client';

import { useState } from 'react';
import { StarIcon } from '@/components/icons/icons';
import styles from './StarRatingInput.module.css';

const RATING_MAX = 5;

type StarRatingInputProps = {
  rating: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Omit to render a read-only display (e.g. an already-left review). */
  onChange?: (rating: number) => void;
};

export const StarRatingInput = ({
  rating,
  size = 22,
  className,
  style,
  onChange,
}: StarRatingInputProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const isInteractive = Boolean(onChange);
  const displayRating = isInteractive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div
      className={`${styles.stars} ${className ?? ''}`}
      style={style}
      role={isInteractive ? 'radiogroup' : undefined}
      aria-label={`${rating}/${RATING_MAX}`}
      onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
    >
      {Array.from({ length: RATING_MAX }, (_, index) => {
        const value = index + 1;
        const filled = value <= displayRating;

        if (!isInteractive) {
          return (
            <StarIcon
              key={value}
              size={size}
              filled={filled}
              className={filled ? styles.starFilled : styles.starEmpty}
            />
          );
        }

        return (
          <button
            key={value}
            type="button"
            className={styles.starButton}
            aria-label={`${value}/${RATING_MAX}`}
            onMouseEnter={() => setHoverRating(value)}
            onClick={() => onChange?.(value)}
          >
            <StarIcon size={size} filled={filled} className={filled ? styles.starFilled : styles.starEmpty} />
          </button>
        );
      })}
    </div>
  );
};
