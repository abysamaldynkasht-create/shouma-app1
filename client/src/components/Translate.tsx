import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TranslateProps {
  text?: string;
  children?: React.ReactNode;
  fallback?: string;
  className?: string;
  as?: React.ElementType;
}

export function Translate({ text, children, fallback, className, as: Component = "span" }: TranslateProps) {
  const { language, translateText } = useLanguage();
  
  const originalText = text || (typeof children === "string" ? children : "");
  const [translated, setTranslated] = useState(fallback || originalText);

  useEffect(() => {
    if (!originalText) {
      setTranslated("");
      return;
    }
    if (language === "ar") {
      setTranslated(originalText);
      return;
    }

    let isMounted = true;
    translateText(originalText, language)
      .then((res) => {
        if (isMounted) {
          setTranslated(res);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslated(fallback || originalText);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [originalText, language, translateText, fallback]);

  if (!text && typeof children !== "string") {
    return <Component className={className}>{children}</Component>;
  }

  return <Component className={className}>{translated}</Component>;
}
