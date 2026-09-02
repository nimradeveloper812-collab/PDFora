import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, LANGUAGES } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pdfora-lang');
      if (stored && ['en', 'ur', 'es', 'ar'].includes(stored)) return stored;
    }
    return 'en';
  });

  const setLang = (code) => {
    if (['en', 'ur', 'es', 'ar'].includes(code)) {
      setLangState(code);
      localStorage.setItem('pdfora-lang', code);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    if (lang === 'ur' || lang === 'ar') {
      root.setAttribute('dir', 'rtl');
    } else {
      root.setAttribute('dir', 'ltr');
    }
  }, [lang]);

  const t = (key) => {
    if (!key) return '';
    const lookupKey = typeof key === 'object' ? key.id : key;
    return TRANSLATIONS[lang]?.[lookupKey] || TRANSLATIONS['en']?.[lookupKey] || (typeof key === 'object' ? key.name : key);
  };

  const currentLanguageObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, currentLanguageObj, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
