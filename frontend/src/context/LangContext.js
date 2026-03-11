'use client';
// src/context/LangContext.js
// Global EN / NE language toggle.
// Usage in any component:
//   const { t } = useLang();
//   t({ en: 'Shop', ne: 'किनमेल' })

import { createContext, useContext, useState, useCallback } from 'react';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ne'); // default Nepali

  const toggleLang = useCallback(() => {
    setLang(l => l === 'ne' ? 'en' : 'ne');
  }, []);

  // t({ en: '...', ne: '...' }) — returns the right string for current lang
  const t = useCallback((obj) => {
    if (typeof obj === 'string') return obj;
    return obj[lang] ?? obj.en ?? '';
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}