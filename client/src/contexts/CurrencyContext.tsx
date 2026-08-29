import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "./LanguageContext";

export type Currency = "OMR" | "USD" | "AED";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInOMR: number | string | undefined | null) => number;
  formatPrice: (priceInOMR: number | string | undefined | null) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CONVERSION_RATES: Record<Currency, number> = {
  OMR: 1,
  USD: 2.60,
  AED: 9.54,
};

export const CURRENCY_SYMBOLS: Record<Currency, { ar: string; en: string }> = {
  OMR: { ar: "ر.ع", en: "OMR" },
  USD: { ar: "$", en: "USD" },
  AED: { ar: "د.إ", en: "AED" },
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // Check username to load settings
  const username = typeof window !== "undefined" ? localStorage.getItem("shouma-username") || "guest" : "guest";

  // Local state for instant UI update/fallback
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("shouma-currency") as Currency;
      if (cached === "OMR" || cached === "USD" || cached === "AED") {
        return cached;
      }
    }
    return "OMR";
  });

  // Fetch settings from server
  const { data: userPrefs } = useQuery<any>({
    queryKey: ["/api/user-settings"],
    queryFn: async () => {
      const resp = await fetch("/api/user-settings", {
        headers: { "x-username": encodeURIComponent(username) },
      });
      if (!resp.ok) throw new Error("Failed to load user settings");
      return resp.json();
    },
    enabled: !!username,
  });

  // Sync state when server preferences load/change
  useEffect(() => {
    if (userPrefs?.currency) {
      const serverCurrency = userPrefs.currency as Currency;
      if (serverCurrency === "OMR" || serverCurrency === "USD" || serverCurrency === "AED") {
        setCurrencyState(serverCurrency);
        localStorage.setItem("shouma-currency", serverCurrency);
      }
    }
  }, [userPrefs]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== "undefined") {
      localStorage.setItem("shouma-currency", newCurrency);
    }
  };

  const getCurrencySymbol = () => {
    const symbols = CURRENCY_SYMBOLS[currency];
    return isArabic ? symbols.ar : symbols.en;
  };

  const convertPrice = (priceInOMR: number | string | undefined | null): number => {
    if (priceInOMR === undefined || priceInOMR === null) return 0;
    const numericPrice = typeof priceInOMR === "string" ? parseFloat(priceInOMR) : priceInOMR;
    if (isNaN(numericPrice)) return 0;
    
    const rate = CONVERSION_RATES[currency] || 1;
    return numericPrice * rate;
  };

  const formatPrice = (priceInOMR: number | string | undefined | null): string => {
    const converted = convertPrice(priceInOMR);
    const symbol = getCurrencySymbol();
    
    // Round to 2 decimal places for USD, 2 decimal places for AED, and 3 decimal places for OMR
    const decimals = currency === "OMR" ? 3 : 2;
    const formattedNum = converted.toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    return `${formattedNum} ${symbol}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
