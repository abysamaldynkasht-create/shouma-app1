import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function useAutoTranslate() {
  const { language, translateText, translateBatch, translateObject } = useLanguage();

  const useTranslatedText = (originalText: string) => {
    const [translated, setTranslated] = useState(originalText);

    useEffect(() => {
      if (!originalText || language === "ar") {
        setTranslated(originalText);
        return;
      }
      let active = true;
      translateText(originalText, language).then((res) => {
        if (active) setTranslated(res);
      });
      return () => {
        active = false;
      };
    }, [originalText, language]);

    return translated;
  };

  const translateList = useCallback(async <T extends Record<string, any>>(
    items: T[],
    fields: (keyof T)[]
  ): Promise<T[]> => {
    if (!items || items.length === 0 || language === "ar") return items;

    const allTexts: string[] = [];
    const itemFieldMap: { itemIndex: number; fieldKey: keyof T; textIndex: number }[] = [];

    items.forEach((item, itemIdx) => {
      fields.forEach((fieldKey) => {
        const val = item[fieldKey];
        if (typeof val === "string" && val.trim() !== "") {
          const textIdx = allTexts.length;
          allTexts.push(val);
          itemFieldMap.push({ itemIndex: itemIdx, fieldKey, textIndex: textIdx });
        }
      });
    });

    if (allTexts.length === 0) return items;

    const translatedTexts = await translateBatch(allTexts, language);

    const newItems = items.map(item => ({ ...item }));
    itemFieldMap.forEach(({ itemIndex, fieldKey, textIndex }) => {
      if (translatedTexts[textIndex]) {
        newItems[itemIndex][fieldKey] = translatedTexts[textIndex] as any;
      }
    });

    return newItems;
  }, [language, translateBatch]);

  return {
    language,
    useTranslatedText,
    translateList,
    translateText,
    translateBatch,
    translateObject,
  };
}
