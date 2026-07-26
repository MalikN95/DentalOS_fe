'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dentalos.sidebar.collapsed';

const readInitialCollapsed = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
};

export const useSidebarCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(readInitialCollapsed);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return { isCollapsed, toggle };
};
