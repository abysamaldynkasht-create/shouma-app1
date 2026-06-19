import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Language, languages, translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  direction: 'rtl' | 'ltr';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shouma-language') as Language;
      return saved && translations[saved] ? saved : 'ar';
    }
    return 'ar';
  });

  const currentLang = languages.find(l => l.code === language) || languages[0];
  const direction = currentLang.direction;
  const isRTL = direction === 'rtl';

  useEffect(() => {
    localStorage.setItem('shouma-language', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    if (isRTL) {
      document.body.style.fontFamily = "'Cairo', sans-serif";
    } else {
      document.body.style.fontFamily = "'Montserrat', 'Cairo', sans-serif";
    }
  }, [language, direction, isRTL]);

  const setLanguage = (lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['ar']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, direction, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
