'use client';

import { useLayoutEffect, useRef, useState } from 'react';

type OverflowReserve = {
  /** Width (px) always reserved for trailing content shown regardless of overflow, e.g. an "add" button. */
  trailing?: number;
  /** Width (px) reserved for the "show more" indicator, added only when not everything fits. */
  more?: number;
  /** Gap (px) between each item — must match the row's CSS `gap`. */
  gap?: number;
};

/**
 * Measures `count` same-row items (via `measureRef`) against `containerRef`'s
 * available width and returns how many fit before overflowing, leaving room
 * for a trailing control (`reserve.trailing`) and, only when the full set
 * doesn't fit, a "+N more" indicator (`reserve.more`). Recalculates on
 * container resize and whenever `count` changes.
 */
export const useOverflowCount = (
  containerRef: React.RefObject<HTMLElement | null>,
  count: number,
  { trailing = 0, more = 0, gap = 0 }: OverflowReserve = {},
) => {
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(count);

  const measureRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const recalculate = () => {
      if (count === 0) {
        setVisibleCount(0);
        return;
      }

      const available = container.clientWidth;
      const widths = itemRefs.current.slice(0, count).map((el) => el?.offsetWidth ?? 0);

      const totalWidth = widths.reduce((sum, width) => sum + width + gap, 0) + trailing;
      if (totalWidth <= available) {
        setVisibleCount(count);
        return;
      }

      let used = trailing + more + gap;
      const fitsIndex = widths.findIndex((width) => {
        const next = used + width + gap;
        if (next > available) return true;
        used = next;
        return false;
      });
      setVisibleCount(fitsIndex === -1 ? widths.length : fitsIndex);
    };

    recalculate();

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, count, trailing, more, gap]);

  return { measureRef, visibleCount };
};
