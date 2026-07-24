'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const EDGE_THRESHOLD = 1;
const SCROLL_STEP_RATIO = 0.8;

type ScrollShadowState = {
  isScrollable: boolean;
  canScrollUp: boolean;
  canScrollDown: boolean;
};

type UseScrollShadowResult = ScrollShadowState & {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  scrollDown: () => void;
};

const INITIAL_STATE: ScrollShadowState = {
  isScrollable: false,
  canScrollUp: false,
  canScrollDown: false,
};

/**
 * Tracks vertical overflow of a scroll container so callers can render
 * edge shadows / a "scroll for more" affordance.
 * Attach `scrollRef` to the scrollable element and `contentRef` to its inner
 * wrapper so content growth (dynamic fields, async data) is detected too.
 */
export const useScrollShadow = (): UseScrollShadowResult => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<ScrollShadowState>(INITIAL_STATE);

  const sync = useCallback(() => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = node;
    const isScrollable = scrollHeight - clientHeight > EDGE_THRESHOLD;

    setState((previous) => {
      const next: ScrollShadowState = {
        isScrollable,
        canScrollUp: isScrollable && scrollTop > EDGE_THRESHOLD,
        canScrollDown: isScrollable && scrollTop + clientHeight < scrollHeight - EDGE_THRESHOLD,
      };

      const isEqual =
        previous.isScrollable === next.isScrollable &&
        previous.canScrollUp === next.canScrollUp &&
        previous.canScrollDown === next.canScrollDown;

      return isEqual ? previous : next;
    });
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    const content = contentRef.current;
    const observer = new ResizeObserver(sync);

    if (node) {
      sync();
      node.addEventListener('scroll', sync, { passive: true });
      observer.observe(node);
    }

    if (content) {
      observer.observe(content);
    }

    return () => {
      node?.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollDown = useCallback(() => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    node.scrollBy({ top: node.clientHeight * SCROLL_STEP_RATIO, behavior: 'smooth' });
  }, []);

  return { scrollRef, contentRef, scrollDown, ...state };
};
