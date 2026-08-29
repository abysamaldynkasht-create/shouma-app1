import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages, type Language } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          data-testid="button-language-switcher"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-background/80 backdrop-blur border-border/60 hover:bg-muted/80 rounded-full shadow-xs transition-all"
        >
          <Globe className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-foreground">{currentLang?.flag || language.toUpperCase()}</span>
          <span className="hidden sm:inline-block text-[11px] text-muted-foreground">{currentLang?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            data-testid={`button-lang-${lang.code}`}
            onClick={() => {
              setLanguage(lang.code as Language);
              setOpen(false);
            }}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded">{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </div>
            {language === lang.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
