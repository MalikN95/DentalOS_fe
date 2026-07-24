'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { en } from './dictionaries/en';
import { ky } from './dictionaries/ky';
import { ru, type Dictionary } from './dictionaries/ru';

export type Language = 'ru' | 'en' | 'ky';

const dictionaries: Record<Language, Dictionary> = { ru, en, ky };
const STORAGE_KEY = 'dentalos.lang';

const isLanguage = (value: string | null): value is Language =>
  value === 'ru' || value === 'en' || value === 'ky';

const readInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'ru';
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLanguage(stored) ? stored : 'ru';
};

type LocaleContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: React.ReactNode;
};

export const LocaleProvider = ({ children }: LocaleProviderProps) => {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language, setLanguage],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useTranslation = (): LocaleContextValue => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }
  return context;
};

/** Interpolates `{name}`-style placeholders in a locale string. */
export const format = (template: string, vars: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
