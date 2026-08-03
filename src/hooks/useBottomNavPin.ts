'use client';

import { useCallback, useState } from 'react';

const STORAGE_KEY = 'dentalos.bottomNavPinned';

const readInitialPinned = (): boolean => {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === '1';
};

// Pinned = bottom nav always expanded. Unpinned = it collapses to a thin
// handle and only expands on hover/click. Persisted so the choice survives
// a reload.
export const useBottomNavPin = () => {
  const [isPinned, setIsPinned] = useState<boolean>(readInitialPinned);

  const togglePinned = useCallback(() => {
    setIsPinned((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      }
      return next;
    });
  }, []);

  return { isPinned, togglePinned };
};
