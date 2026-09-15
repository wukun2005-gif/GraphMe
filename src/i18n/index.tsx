import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

export type Language = 'zh-CN' | 'en';

type TranslationMap = Record<string, string | string[] | { q: string; a: string }[]>;

const translations: Record<Language, TranslationMap> = {
  'zh-CN': zhCN,
  'en': en,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tList: (key: string) => string[];
  tQA: () => { q: string; a: string; refs?: string[] }[];
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'graphme-language';

export const LANGUAGE_CHANGE_EVENT = 'graphme-language-change';

export function readStoredLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh-CN') return saved;
  } catch { /* ignore */ }
  return 'zh-CN';
}

function getNestedValue(obj: any, path: string): string | undefined {
  // First try flat key (e.g. "demo.step.intro1" as a single key)
  if (obj && typeof obj[path] === 'string') return obj[path];
  // Then try nested path (e.g. "demo" -> "step" -> "intro1")
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function getNestedList(obj: any, path: string): string[] | null {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return null;
    current = current[key];
  }
  return Array.isArray(current) ? current : null;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return key in params ? String(params[key]) : `{{${key}}}`;
  });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* ignore */ }
    document.documentElement.lang = language;
  }, [language]);

  const broadcastLanguage = useCallback((lang: Language) => {
    try {
      window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: lang }));
    } catch { /* ignore */ }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    broadcastLanguage(lang);
  }, [broadcastLanguage]);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const next = prev === 'zh-CN' ? 'en' : 'zh-CN';
      broadcastLanguage(next);
      return next;
    });
  }, [broadcastLanguage]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language];
    const value = getNestedValue(dict, key);
    if (value === undefined) {
      // Fallback to zh-CN
      const fallback = getNestedValue(translations['zh-CN'], key);
      if (fallback === undefined) return key;
      return params ? interpolate(fallback, params) : fallback;
    }
    return params ? interpolate(value, params) : value;
  }, [language]);

  const tList = useCallback((key: string): string[] => {
    const dict = translations[language];
    const value = getNestedList(dict, key);
    if (value) return value;
    const fallback = getNestedList(translations['zh-CN'], key);
    return fallback ?? [];
  }, [language]);

  const tQA = useCallback(() => {
    const dict = translations[language];
    const qaValue = (dict as any)?.chat?.qa;
    if (Array.isArray(qaValue)) {
      return qaValue.map((item: any, i: number) => ({
        q: item.q,
        a: item.a,
        refs: ['mem_007', 'mem_015', 'mem_012', 'mem_020', 'insight_001', 'mem_003', 'mem_025', 'insight_004', 'mem_031', 'insight_008', 'mem_020', 'mem_035', 'mem_007'][i * 2] ? undefined : undefined,
      }));
    }
    // Fallback to zh-CN
    const fallback = (translations['zh-CN'] as any)?.chat?.qa;
    if (Array.isArray(fallback)) {
      return fallback.map((item: any) => ({
        q: item.q,
        a: item.a,
        refs: undefined,
      }));
    }
    return [];
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t,
    tList,
    tQA,
  }), [language, setLanguage, toggleLanguage, t, tList, tQA]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// Re-export types
export type { I18nContextType };
