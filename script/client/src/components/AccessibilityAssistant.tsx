import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accessibility,
  X,
  ZoomIn,
  ZoomOut,
  Eye,
  Type,
  MousePointer2,
  Volume2,
  RotateCcw,
  Sun,
  Moon,
  Contrast,
} from "lucide-react";

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  darkMode: boolean;
  largePointer: boolean;
  highlightLinks: boolean;
  reduceMotion: boolean;
  textSpacing: boolean;
  readableFont: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  darkMode: false,
  largePointer: false,
  highlightLinks: false,
  reduceMotion: false,
  textSpacing: false,
  readableFont: false,
};

export default function AccessibilityAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("accessibility-settings");
    const parsed = saved ? JSON.parse(saved) : defaultSettings;
    const themeSaved = localStorage.getItem("shouma-theme");
    if (themeSaved) {
      parsed.darkMode = themeSaved === "dark";
    }
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  useEffect(() => {
    applySettings(settings);
  }, []);

  const applySettings = (s: AccessibilitySettings) => {
    const root = document.documentElement;
    
    root.style.fontSize = `${s.fontSize}%`;

    if (s.darkMode) {
      root.classList.add("dark");
      localStorage.setItem("shouma-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("shouma-theme", "light");
    }
    
    if (s.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    if (s.largePointer) {
      root.classList.add("large-pointer");
    } else {
      root.classList.remove("large-pointer");
    }

    if (s.highlightLinks) {
      root.classList.add("highlight-links");
    } else {
      root.classList.remove("highlight-links");
    }

    if (s.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    if (s.textSpacing) {
      root.classList.add("text-spacing");
    } else {
      root.classList.remove("text-spacing");
    }

    if (s.readableFont) {
      root.classList.add("readable-font");
    } else {
      root.classList.remove("readable-font");
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const increaseFontSize = () => {
    if (settings.fontSize < 150) {
      updateSetting("fontSize", settings.fontSize + 10);
    }
  };

  const decreaseFontSize = () => {
    if (settings.fontSize > 80) {
      updateSetting("fontSize", settings.fontSize - 10);
    }
  };

  return (
    <>
      <button
        data-testid="button-accessibility-toggle"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="فتح مساعد الوصول"
      >
        <Accessibility className="w-7 h-7" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <Card className="relative w-full max-w-md max-h-[90vh] overflow-y-auto z-10">
            <CardHeader className="sticky top-0 bg-card z-10 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Accessibility className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle data-testid="text-accessibility-title">مساعد ذوي الاحتياجات الخاصة</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-accessibility"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  حجم الخط
                </h3>
                <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decreaseFontSize}
                    disabled={settings.fontSize <= 80}
                    data-testid="button-decrease-font"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold" data-testid="text-font-size">
                      {settings.fontSize}%
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={increaseFontSize}
                    disabled={settings.fontSize >= 150}
                    data-testid="button-increase-font"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </Button>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  خيارات العرض
                </h3>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {settings.darkMode ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
                    <Label htmlFor="dark-mode" className="font-medium cursor-pointer">
                      {settings.darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
                    </Label>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting("darkMode", checked)}
                    data-testid="switch-dark-mode"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Contrast className="w-5 h-5 text-muted-foreground" />
                    <Label htmlFor="high-contrast" className="font-medium cursor-pointer">
                      تباين عالي
                    </Label>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                    data-testid="switch-high-contrast"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MousePointer2 className="w-5 h-5 text-muted-foreground" />
                    <Label htmlFor="large-pointer" className="font-medium cursor-pointer">
                      مؤشر كبير
                    </Label>
                  </div>
                  <Switch
                    id="large-pointer"
                    checked={settings.largePointer}
                    onCheckedChange={(checked) => updateSetting("largePointer", checked)}
                    data-testid="switch-large-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-muted-foreground" />
                    <Label htmlFor="highlight-links" className="font-medium cursor-pointer">
                      تمييز الروابط
                    </Label>
                  </div>
                  <Switch
                    id="highlight-links"
                    checked={settings.highlightLinks}
                    onCheckedChange={(checked) => updateSetting("highlightLinks", checked)}
                    data-testid="switch-highlight-links"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  خيارات النص
                </h3>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-muted-foreground" />
                    <Label htmlFor="text-spacing" className="font-medium cursor-pointer">
                      تباعد النص
                    </Label>
                  </div>
                  <Switch
                    id="text-spacing"
                    checked={settings.textSpacing}
                    onCheckedChange={(checked) => updateSetting("textSpacing", checked)}
                    data-testid="switch-text-spacing"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Type className="w-5 h-5 text-muted-foreground" />
                    <Label htmlFor="readable-font" className="font-medium cursor-pointer">
                      خط قابل للقراءة
                    </Label>
                  </div>
                  <Switch
                    id="readable-font"
                    checked={settings.readableFont}
                    onCheckedChange={(checked) => updateSetting("readableFont", checked)}
                    data-testid="switch-readable-font"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-muted-foreground" />
                    <Label htmlFor="reduce-motion" className="font-medium cursor-pointer">
                      تقليل الحركة
                    </Label>
                  </div>
                  <Switch
                    id="reduce-motion"
                    checked={settings.reduceMotion}
                    onCheckedChange={(checked) => updateSetting("reduceMotion", checked)}
                    data-testid="switch-reduce-motion"
                  />
                </div>
              </section>

              <Button
                variant="outline"
                className="w-full"
                onClick={resetSettings}
                data-testid="button-reset-accessibility"
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة الإعدادات الافتراضية
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                يتم حفظ إعداداتك تلقائياً
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
