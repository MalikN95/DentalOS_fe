'use client';

import { useEffect, useState } from 'react';

export type FloatingPanelPosition = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

type UseFloatingPanelPositionOptions = {
  gap?: number;
  minHeight?: number;
  maxHeight?: number;
};

const computePosition = (
  trigger: HTMLElement,
  gap: number,
  minHeight: number,
  maxHeight: number,
): FloatingPanelPosition => {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - gap;
  const spaceAbove = rect.top - gap;
  const openUpward = spaceBelow < minHeight && spaceAbove > spaceBelow;
  const available = openUpward ? spaceAbove : spaceBelow;

  return {
    left: rect.left,
    width: rect.width,
    maxHeight: Math.max(minHeight, Math.min(maxHeight, available)),
    top: openUpward ? undefined : rect.bottom + gap,
    bottom: openUpward ? window.innerHeight - rect.top + gap : undefined,
  };
};

/**
 * Tracks a floating panel's `position: fixed` coordinates, anchored to
 * `triggerRef`, for as long as `isOpen`. Flips above the trigger when there
 * isn't enough room below, and recomputes on resize/scroll so the panel stays
 * anchored even while a scrollable ancestor (e.g. a modal body) moves under
 * it. Pair with `createPortal(..., document.body)` so the panel can never be
 * clipped by that ancestor's overflow.
 */
export const useFloatingPanelPosition = (
  triggerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  { gap = 4, minHeight = 200, maxHeight = 360 }: UseFloatingPanelPositionOptions = {},
): FloatingPanelPosition | null => {
  const [position, setPosition] = useState<FloatingPanelPosition | null>(null);

  useEffect(() => {
    // The panel only ever renders while isOpen, so stale coordinates left
    // over from the last time it was open are harmless — no need to reset.
    if (!isOpen) return undefined;

    const update = () => {
      if (triggerRef.current) {
        setPosition(computePosition(triggerRef.current, gap, minHeight, maxHeight));
      }
    };

    update();

    window.addEventListener('resize', update);
    // capture: scroll events don't bubble, but a capturing listener still sees
    // scrolls on any nested scrollable ancestor (e.g. a modal's scroll body).
    window.addEventListener('scroll', update, true);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [isOpen, triggerRef, gap, minHeight, maxHeight]);

  return position;
};
