import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle({ variant = "default" }: { variant?: "default" | "ghost" | "icon-only" }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("shouma-theme");
    if (saved) return saved === "dark";
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("shouma-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const saved = localStorage.getItem("shouma-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => setIsDark((prev) => !prev);

  if (variant === "icon-only") {
    return (
      <button
        onClick={toggle}
        data-testid="button-theme-toggle"
        className="w-10 h-10 rounded-full flex items-center justify-center text-amber-100 hover:text-white hover:bg-white/10 transition-colors"
        aria-label={isDark ? "Light mode" : "Dark mode"}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      data-testid="button-theme-toggle"
      className="text-muted-foreground hover:text-foreground"
      aria-label={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("shouma-theme") === "dark";
  });

  const toggle = () => {
    const newVal = !isDark;
    setIsDark(newVal);
    const root = document.documentElement;
    if (newVal) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("shouma-theme", newVal ? "dark" : "light");
  };

  return { isDark, toggle };
}
