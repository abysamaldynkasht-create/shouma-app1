import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import i18n, { applyDocumentLanguage, getSavedLanguage } from "@/lib/i18n";
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

// In-memory translation cache to avoid duplicate API requests
const translationMemoryCache = new Map<string, string>();

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t: i18nTranslate, i18n: i18nInstance } = useTranslation();
  const [language, setLanguageState] = useState<Language>(() => {
    return (i18n.language as Language) || getSavedLanguage();
  });

  const currentLanguageInfo = languages.find((l) => l.code === language) || languages[0];
  const isRTL = currentLanguageInfo.direction === "rtl";
  const direction = currentLanguageInfo.direction;

  // Keep state in sync if i18n language changes externally
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const validLang = (languages.some((l) => l.code === lng) ? lng : "ar") as Language;
      setLanguageState(validLang);
      applyDocumentLanguage(validLang);
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language, direction]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    applyDocumentLanguage(newLang);
    if (i18n.language !== newLang) {
      i18n.changeLanguage(newLang);
    }
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    // 1. Try i18next first
    if (i18nInstance.exists(key)) {
      return i18nTranslate(key);
    }

    // 2. Direct dictionary lookup for current language
    const currentDict = translations[language];
    if (currentDict && key in currentDict) {
      return currentDict[key];
    }

    // 3. Fallback to Arabic dictionary
    const arDict = translations["ar"];
    if (arDict && key in arDict) {
      return arDict[key];
    }

    // 4. Fallback to English dictionary
    const enDict = translations["en"];
    if (enDict && key in enDict) {
      return enDict[key];
    }

    return fallback || key;
  }, [language, i18nInstance, i18nTranslate]);

  const translateText = useCallback(async (text: string, targetLang?: Language): Promise<string> => {
    const lang = targetLang || language;
    if (!text || text.trim() === "" || lang === "ar") {
      return text;
    }

    // Check if key exists in predefined translations dictionary
    const dict = translations[lang];
    if (dict && text in dict) {
      return dict[text];
    }

    const cacheKey = `${lang}:${text.trim()}`;
    if (translationMemoryCache.has(cacheKey)) {
      return translationMemoryCache.get(cacheKey)!;
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), targetLang: lang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          translationMemoryCache.set(cacheKey, data.translatedText);
          return data.translatedText;
        }
      }
    } catch (err) {
      console.warn("Dynamic text translation error:", err);
    }
    return text;
  }, [language]);

  const translateBatch = useCallback(async (texts: string[], targetLang?: Language): Promise<string[]> => {
    const lang = targetLang || language;
    if (!texts || texts.length === 0 || lang === "ar") {
      return texts;
    }

    const results = new Array<string>(texts.length);
    const missingIndices: number[] = [];
    const missingTexts: string[] = [];

    texts.forEach((txt, idx) => {
      if (!txt || txt.trim() === "") {
        results[idx] = txt;
        return;
      }
      const cacheKey = `${lang}:${txt.trim()}`;
      if (translationMemoryCache.has(cacheKey)) {
        results[idx] = translationMemoryCache.get(cacheKey)!;
      } else {
        missingIndices.push(idx);
        missingTexts.push(txt.trim());
      }
    });

    if (missingTexts.length === 0) {
      return results;
    }

    try {
      const res = await fetch("/api/translate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: missingTexts, targetLang: lang }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.translatedTexts)) {
          data.translatedTexts.forEach((translated: string, i: number) => {
            const originalIndex = missingIndices[i];
            const originalText = missingTexts[i];
            const cacheKey = `${lang}:${originalText}`;
            translationMemoryCache.set(cacheKey, translated || originalText);
            results[originalIndex] = translated || originalText;
          });
          return results;
        }
      }
    } catch (err) {
      console.warn("Batch translation error:", err);
    }

    // Fallback: fill remaining with original texts
    missingIndices.forEach((origIdx, i) => {
      results[origIdx] = missingTexts[i];
    });

    return results;
  }, [language]);

  const translateObject = useCallback(async <T,>(obj: T, targetLang?: Language): Promise<T> => {
    const lang = targetLang || language;
    if (!obj || lang === "ar") return obj;

    if (Array.isArray(obj)) {
      const translatedItems = await Promise.all(
        obj.map((item) => translateObject(item, lang))
      );
      return translatedItems as unknown as T;
    }

    if (typeof obj === "object" && obj !== null) {
      const copy: any = { ...obj };
      const translatableKeys = [
        "name", "name_ar", "title", "title_ar", "description", "description_ar", 
        "location", "location_ar", "city", "region", "wilayat", "governorate", 
        "category", "cuisine", "comment", "activity"
      ];
      
      const keysToTranslate = Object.keys(copy).filter(
        (k) => translatableKeys.includes(k) && typeof copy[k] === "string" && copy[k].trim() !== ""
      );

      if (keysToTranslate.length > 0) {
        const textsToTranslate = keysToTranslate.map((k) => copy[k]);
        const translatedTexts = await translateBatch(textsToTranslate, lang);
        keysToTranslate.forEach((k, idx) => {
          if (translatedTexts[idx]) {
            copy[k] = translatedTexts[idx];
          }
        });
      }

      return copy as T;
    }

    if (typeof obj === "string") {
      const translated = await translateText(obj, lang);
      return translated as unknown as T;
    }

    return obj;
  }, [language, translateBatch, translateText]);

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
