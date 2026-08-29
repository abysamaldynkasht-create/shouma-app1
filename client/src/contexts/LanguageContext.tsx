import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Language, languages, translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  direction: "rtl" | "ltr";
  currentLanguageInfo: typeof languages[0];
  translateText: (text: string, targetLang?: Language) => Promise<string>;
  translateBatch: (texts: string[], targetLang?: Language) => Promise<string[]>;
  translateObject: <T>(obj: T, targetLang?: Language) => Promise<T>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shouma-language") as Language;
      if (saved && languages.some((l) => l.code === saved)) {
        return saved;
      }
    }
    return "ar";
  });

  const currentLanguageInfo = languages.find((l) => l.code === language) || languages[0];
  const isRTL = currentLanguageInfo.direction === "rtl";
  const direction = currentLanguageInfo.direction;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = direction;
    }
  }, [language, direction]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("shouma-language", newLang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations["ar"];
    if (langDict && key in langDict) {
      return langDict[key];
    }
    const arDict = translations["ar"];
    if (arDict && key in arDict) {
      return arDict[key];
    }
    return fallback || key;
  };

  const translateText = async (text: string, _targetLang?: Language): Promise<string> => {
    return text;
  };

  const translateBatch = async (texts: string[], _targetLang?: Language): Promise<string[]> => {
    return texts;
  };

  const translateObject = async <T,>(obj: T, _targetLang?: Language): Promise<T> => {
    return obj;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        direction,
        currentLanguageInfo,
        translateText,
        translateBatch,
        translateObject,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
