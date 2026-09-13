import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations, languages, type Language } from "./translations";

export const DEFAULT_LANGUAGE: Language = "ar";
export const LANGUAGE_STORAGE_KEY = "shouma-language";

export function getSavedLanguage(): Language {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved && languages.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
  }
  return DEFAULT_LANGUAGE;
}

export function applyDocumentLanguage(lang: Language): void {
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
    const isRtl = lang === "ar" || lang === "fa";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors in restricted context
    }
  }
}

const initialLang = getSavedLanguage();

// Build resource bundles for all supported languages
const resources: Record<string, { translation: Record<string, string> }> = {};
for (const langKey of Object.keys(translations)) {
  resources[langKey] = {
    translation: translations[langKey as keyof typeof translations] || {},
  };
}

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLang,
      fallbackLng: DEFAULT_LANGUAGE,
      interpolation: {
        escapeValue: false, // React already safeguards against XSS
      },
      react: {
        useSuspense: false,
      },
    });

  // Keep DOM attribute synchronized on language changes
  i18n.on("languageChanged", (lng) => {
    applyDocumentLanguage(lng as Language);
  });
}

// Ensure initial DOM state is set right away
applyDocumentLanguage(initialLang);

export default i18n;
