import { createContext, useContext, useState, type ReactNode } from 'react';
import i18n from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'hi';

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = (i18n.language as Language) || 'en';
    return stored === 'hi' ? 'hi' : 'en';
  });

  const { t: translate } = useTranslation();

  const setLang = (l: Language) => {
    setLangState(l);
    i18n.changeLanguage(l);
    localStorage.setItem('agrinova-lang', l);
  };

  const t = (key: string) => translate(key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
