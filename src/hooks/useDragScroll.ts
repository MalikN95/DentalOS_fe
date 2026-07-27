'use client';

import { useCallback, useRef, useState } from 'react';

const DRAG_THRESHOLD_PX = 6;

type DragScrollHandlers<T> = {
  onPointerDown: React.PointerEventHandler<T>;
  onPointerMove: React.PointerEventHandler<T>;
  onPointerUp: React.PointerEventHandler<T>;
  onPointerLeave: React.PointerEventHandler<T>;
  onPointerCancel: React.PointerEventHandler<T>;
  onClickCapture: React.MouseEventHandler<T>;
};

/**
 * Lets a horizontally-scrollable container (a wide table, a card row, ...)
 * be panned by click-and-drag or touch-drag, not just via the scrollbar.
 * Spread `handlers` onto the scrollable element and attach `ref` to it.
 */
export const useDragScroll = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const gesture = useRef({
    isPointerDown: false,
    wasDragging: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback<React.PointerEventHandler<T>>((event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const el = ref.current;
    if (!el) return;

    gesture.current.isPointerDown = true;
    gesture.current.wasDragging = false;
    gesture.current.startX = event.clientX;
    gesture.current.scrollLeft = el.scrollLeft;
  }, []);

  const onPointerMove = useCallback<React.PointerEventHandler<T>>((event) => {
    const el = ref.current;
    const state = gesture.current;
    if (!el || !state.isPointerDown) return;

    const delta = event.clientX - state.startX;

    if (!state.wasDragging && Math.abs(delta) > DRAG_THRESHOLD_PX) {
      state.wasDragging = true;
      setIsDragging(true);
      el.setPointerCapture(event.pointerId);
    }

    if (state.wasDragging) {
      el.scrollLeft = state.scrollLeft - delta;
    }
  }, []);

  const endGesture = useCallback<React.PointerEventHandler<T>>((event) => {
    const el = ref.current;
    const state = gesture.current;

    if (state.wasDragging && el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }

    state.isPointerDown = false;
    setIsDragging(false);
  }, []);

  // Swallow the click that follows a real drag so row links/buttons don't
  // fire just because the user was panning the table.
  const onClickCapture = useCallback<React.MouseEventHandler<T>>((event) => {
    if (gesture.current.wasDragging) {
      event.preventDefault();
      event.stopPropagation();
      gesture.current.wasDragging = false;
    }
  }, []);

  const handlers: DragScrollHandlers<T> = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endGesture,
    onPointerLeave: endGesture,
    onPointerCancel: endGesture,
    onClickCapture,
  };

  return { ref, isDragging, handlers };
};
