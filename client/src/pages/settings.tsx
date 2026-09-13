import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages, type Language } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Settings,
  Coins,
  MapPin,
  Navigation,
  Bell,
  Sun,
  Moon,
  Type,
  Contrast,
  MousePointer2,
  Bookmark,
  Eye,
  Info,
  Save,
  Check,
  Loader2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  LogOut,
  Briefcase,
  Compass,
  Globe
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

const defaultAccessibility: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  darkMode: false,
  largePointer: false,
  highlightLinks: false,
  reduceMotion: false,
  textSpacing: false,
  readableFont: false,
};

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const username = localStorage.getItem("shouma-username") || "guest";

  // --- 1. ACCESSIBILITY SETTINGS (Local Storage) ---
  const [accessPrefs, setAccessPrefs] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("accessibility-settings");
    const parsed = saved ? JSON.parse(saved) : defaultAccessibility;
    // Keep in sync with theme state
    parsed.darkMode = localStorage.getItem("shouma-theme") === "dark";
    return parsed;
  });

  // Apply accessibility settings to HTML element
  const applyAccessibility = (s: AccessibilitySettings) => {
    const root = document.documentElement;
    root.style.fontSize = `${s.fontSize}%`;

    // Apply high contrast
    if (s.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Apply large pointer
    if (s.largePointer) {
      root.classList.add("large-pointer");
    } else {
      root.classList.remove("large-pointer");
    }

    // Apply highlight links
    if (s.highlightLinks) {
      root.classList.add("highlight-links");
    } else {
      root.classList.remove("highlight-links");
    }

    // Apply reduce motion
    if (s.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Apply text spacing
    if (s.textSpacing) {
      root.classList.add("text-spacing");
    } else {
      root.classList.remove("text-spacing");
    }

    // Apply readable font
    if (s.readableFont) {
      root.classList.add("readable-font");
    } else {
      root.classList.remove("readable-font");
    }
  };

  // Keep theme synced with accessPrefs
  useEffect(() => {
    const root = document.documentElement;
    if (accessPrefs.darkMode) {
      root.classList.add("dark");
      localStorage.setItem("shouma-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("shouma-theme", "light");
    }
  }, [accessPrefs.darkMode]);

  // Apply instantly on mount/update
  useEffect(() => {
    applyAccessibility(accessPrefs);
    localStorage.setItem("accessibility-settings", JSON.stringify(accessPrefs));
  }, [accessPrefs]);

  // --- 2. BACKEND APP PREFERENCES ---
  const [localPrefs, setLocalPrefs] = useState<{
    currency: "OMR" | "USD" | "AED";
    gpsEnabled: boolean;
    distanceUnit: "km" | "mi";
    bookingNotifications: boolean;
    promoNotifications: boolean;
  }>({
    currency: "OMR",
    gpsEnabled: true,
    distanceUnit: "km",
    bookingNotifications: true,
    promoNotifications: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  // Fetch from Server
  const { data: userPrefs, isLoading: isLoadingPrefs } = useQuery<any>({
    queryKey: ["/api/user-settings"],
    queryFn: async () => {
      const resp = await fetch("/api/user-settings", {
        headers: { "x-username": encodeURIComponent(username) },
      });
      if (!resp.ok) throw new Error("Failed to load user settings");
      return resp.json();
    },
  });

  // Sync state when preferences are loaded
  useEffect(() => {
    if (userPrefs) {
      setLocalPrefs({
        currency: (userPrefs.currency as "OMR" | "USD" | "AED") || "OMR",
        gpsEnabled: userPrefs.gpsEnabled ?? true,
        distanceUnit: (userPrefs.distanceUnit as "km" | "mi") || "km",
        bookingNotifications: userPrefs.bookingNotifications ?? true,
        promoNotifications: userPrefs.promoNotifications ?? true,
      });
    }
  }, [userPrefs]);

  // Handle Save
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setIsSaveSuccess(false);

    try {
      const resp = await fetch("/api/user-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-username": encodeURIComponent(username),
        },
        body: JSON.stringify(localPrefs),
      });

      if (!resp.ok) throw new Error("Failed to save backend preferences");

      localStorage.setItem("shouma-currency", localPrefs.currency);
      await queryClient.invalidateQueries({ queryKey: ["/api/user-settings"] });
      
      setIsSaveSuccess(true);
      toast({
        title: isRTL ? "تم الحفظ بنجاح" : "Saved Successfully",
        description: isRTL 
          ? "تم تحديث كافة تفضيلات التطبيق والوصول."
          : "All app and accessibility preferences updated successfully.",
        variant: "default",
      });

      setTimeout(() => {
        setIsSaveSuccess(false);
      }, 2000);

    } catch (err) {
      console.error("Error saving preferences:", err);
      toast({
        title: isRTL ? "خطأ في الحفظ" : "Error Saving",
        description: isRTL 
          ? "حدث عطل أثناء تحديث الإعدادات. يرجى المحاولة لاحقاً."
          : "An error occurred while updating settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateAccess = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setAccessPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("shouma-username");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Decorative Oman National Colors Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />

      {/* Header Bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              className="rounded-full hover:bg-accent/80"
              title={isRTL ? "الرجوع للرئيسية" : "Back to Home"}
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary animate-spin-slow" />
                {isRTL ? "تفضيلات وإعدادات التطبيق" : "App Preferences & Settings"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {isRTL 
                  ? "قم بتخصيص تجربتك السياحية بالكامل في سلطنة عمان" 
                  : "Personalize your absolute touring experience in Oman"}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={isSaving || isLoadingPrefs}
            className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 px-4 shadow-md transition-all active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaveSuccess 
              ? (isRTL ? "تم الحفظ!" : "Saved!") 
              : isSaving 
              ? (isRTL ? "جاري الحفظ..." : "Saving...") 
              : (isRTL ? "حفظ التغييرات" : "Save Changes")}
          </Button>
        </div>
      </header>

      {/* Main Settings Panel */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoadingPrefs ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              {isRTL ? "جاري تحميل تفضيلاتك..." : "Loading your preferences..."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* LEFT COLUMN: Travel Preferences & System Settings */}
            <div className="space-y-6">
              
              {/* Section 1: Appearance & Night Mode */}
              <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                <h2 className="text-md font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                  {accessPrefs.darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  {isRTL ? "المظهر والسمات" : "Appearance & Theme"}
                </h2>
                
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground block">
                      {isRTL ? "الوضع الليلي الداكن" : "Dark Night Theme"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "تحويل ألوان التطبيق لدرجات مريحة للعين ليلاً" 
                        : "Toggle ambient dark colors perfect for nighttime reading"}
                    </span>
                  </div>
                  <button
                    onClick={() => updateAccess("darkMode", !accessPrefs.darkMode)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      accessPrefs.darkMode ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        accessPrefs.darkMode ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Section 2: Regional Travel Options */}
              <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-5">
                <h2 className="text-md font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                  <Coins className="w-4 h-4 text-primary" />
                  {isRTL ? "خيارات السفر والإقليمية" : "Regional Travel Preferences"}
                </h2>

                {/* Language preference */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    {isRTL ? "لغة واجهة التطبيق" : "Application Language"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as Language);
                          toast({
                            title: lang.code === "ar" ? "تم تغيير اللغة" : "Language Changed",
                            description: `${lang.flag} ${lang.nativeName}`,
                          });
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                          language === lang.code
                            ? "bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary/30"
                            : "border-input bg-background text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        }`}
                      >
                        <span className="text-sm">{lang.flag}</span>
                        <span className="truncate max-w-full">{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency preference */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-primary" />
                    {isRTL ? "العملة المفضلة" : "Preferred Currency"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["OMR", "USD", "AED"] as const).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setLocalPrefs({ ...localPrefs, currency: curr })}
                        className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                          localPrefs.currency === curr
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "border-input bg-background text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        }`}
                      >
                        <span>{curr}</span>
                        <span className="text-[10px] font-normal opacity-80">
                          {curr === "OMR" 
                            ? (isRTL ? "ريال عماني" : "Omani Rial") 
                            : curr === "USD" 
                            ? (isRTL ? "دولار أمريكي" : "US Dollar") 
                            : (isRTL ? "درهم إماراتي" : "UAE Dirham")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPS Settings toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground block">
                      {isRTL ? "تحديد الموقع الذكي (GPS)" : "Smart GPS Location"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "عرض أقرب المعالم السياحية والأماكن المحيطة بك بدقة" 
                        : "Allow coordinate triggers for tailoring nearby recommendations"}
                    </span>
                  </div>
                  <button
                    onClick={() => setLocalPrefs({ ...localPrefs, gpsEnabled: !localPrefs.gpsEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      localPrefs.gpsEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        localPrefs.gpsEnabled ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Distance metrics */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-primary" />
                    {isRTL ? "وحدة قياس المسافة" : "Distance Unit"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["km", "mi"] as const).map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setLocalPrefs({ ...localPrefs, distanceUnit: unit })}
                        className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all ${
                          localPrefs.distanceUnit === unit
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-input bg-background text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        }`}
                      >
                        {unit === "km" 
                          ? (isRTL ? "كيلومتر (كم)" : "Kilometers (km)") 
                          : (isRTL ? "ميل (ميل)" : "Miles (mi)")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Notification Toggles */}
              <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                <h2 className="text-md font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                  <Bell className="w-4 h-4 text-primary" />
                  {isRTL ? "إعدادات التنبيهات والإشعارات" : "Alert & Notification Settings"}
                </h2>

                {/* Trip Alerts toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground block">
                      {isRTL ? "إشعارات الحجوزات والرحلات" : "Booking & Trip Alerts"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "تحديثات حالة الفنادق، جولات المرشدين وسيارات الأجرة" 
                        : "Live alerts about taxi drivers, hotel bookings and excursions"}
                    </span>
                  </div>
                  <button
                    onClick={() => setLocalPrefs({ ...localPrefs, bookingNotifications: !localPrefs.bookingNotifications })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      localPrefs.bookingNotifications ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        localPrefs.bookingNotifications ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Promotional Deals toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground block">
                      {isRTL ? "العروض الترويجية والخصومات" : "Promotional Deals"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "تلقي عروض ترويجية وخصومات حصرية للأماكن السياحية" 
                        : "Receive campaigns, discount codes, and special hidden features"}
                    </span>
                  </div>
                  <button
                    onClick={() => setLocalPrefs({ ...localPrefs, promoNotifications: !localPrefs.promoNotifications })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      localPrefs.promoNotifications ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        localPrefs.promoNotifications ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Accessibility Options */}
            <div className="space-y-6">
              
              {/* Section 4: Accessibility and Assisted Reading */}
              <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-5">
                <div className="pb-2 border-b border-border flex items-center justify-between">
                  <h2 className="text-md font-bold text-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    {isRTL ? "مساعد الوصول وتسهيل القراءة" : "Accessibility & Ease of Reading"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAccessPrefs(defaultAccessibility)}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground h-7 px-2"
                  >
                    {isRTL ? "إعادة تعيين" : "Reset"}
                  </Button>
                </div>

                {/* Font Size Incrementor */}
                <div className="space-y-2 p-3 rounded-xl border border-border/60 bg-accent/10">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    {isRTL ? "حجم خط النصوص" : "Text Font Size"}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? "تكبير أو تصغير الخطوط لتناسب نظرك بسهولة" 
                      : "Dynamically scale readability and size of all viewport labels"}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (accessPrefs.fontSize > 80) updateAccess("fontSize", accessPrefs.fontSize - 10);
                      }}
                      disabled={accessPrefs.fontSize <= 80}
                      className="w-10 h-10 rounded-lg hover:bg-background border-border/80"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center font-bold font-sans text-md text-foreground">
                      {accessPrefs.fontSize}%
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (accessPrefs.fontSize < 150) updateAccess("fontSize", accessPrefs.fontSize + 10);
                      }}
                      disabled={accessPrefs.fontSize >= 150}
                      className="w-10 h-10 rounded-lg hover:bg-background border-border/80"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Contrast className="w-4 h-4 text-primary" />
                      {isRTL ? "التباين العالي للألوان" : "High Contrast"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "زيادة وضوح النصوص والخلفيات للتسهيل البصري" 
                        : "Enhance visual distinction between text characters and cards"}
                    </span>
                  </div>
                  <button
                    onClick={() => updateAccess("highContrast", !accessPrefs.highContrast)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      accessPrefs.highContrast ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        accessPrefs.highContrast ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Large Pointer */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <MousePointer2 className="w-4 h-4 text-primary" />
                      {isRTL ? "مؤشر كبير مخصص" : "Large Touch Pointer"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "تكبير حجم مؤشر الماوس لتسهيل التصفح والاختيار" 
                        : "Increase pointer footprint across controls"}
                    </span>
                  </div>
                  <button
                    onClick={() => updateAccess("largePointer", !accessPrefs.largePointer)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      accessPrefs.largePointer ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        accessPrefs.largePointer ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Highlight Links */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground block">
                      {isRTL ? "تمييز الروابط والأزرار" : "Highlight Links & Anchors"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "وضع خطوط تحت الروابط لجعلها ظاهرة تماماً" 
                        : "Explicit underline styles on interactive nodes"}
                    </span>
                  </div>
                  <button
                    onClick={() => updateAccess("highlightLinks", !accessPrefs.highlightLinks)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      accessPrefs.highlightLinks ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        accessPrefs.highlightLinks ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Text Spacing */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground block">
                      {isRTL ? "تباعد نصوص إضافي" : "Generous Text Spacing"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "إضافة فراغات مريحة بين الكلمات والأسطر" 
                        : "Apply broader letter-spacing & line-height configurations"}
                    </span>
                  </div>
                  <button
                    onClick={() => updateAccess("textSpacing", !accessPrefs.textSpacing)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      accessPrefs.textSpacing ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        accessPrefs.textSpacing ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Readable Font */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground block">
                      {isRTL ? "خط سهل القراءة" : "Readable Sans Serif Font"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "تغيير خطوط الواجهة لخطوط مبسطة وسهلة الفهم" 
                        : "Fallback to highly legible baseline typographic families"}
                    </span>
                  </div>
                  <button
                    onClick={() => updateAccess("readableFont", !accessPrefs.readableFont)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      accessPrefs.readableFont ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        accessPrefs.readableFont ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Reduce Motion */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-accent/10">
                  <div className="flex-1 text-start pr-2 pl-2">
                    <span className="text-sm font-semibold text-foreground block">
                      {isRTL ? "تقليل حركات التنقل" : "Reduce Navigation Motion"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5 leading-tight">
                      {isRTL 
                        ? "الحد من التأثيرات الحركية والتنقلات السريعة" 
                        : "Deactivate intensive transitions, layout flows, and scale spring loads"}
                    </span>
                  </div>
                  <button
                    onClick={() => updateAccess("reduceMotion", !accessPrefs.reduceMotion)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      accessPrefs.reduceMotion ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        accessPrefs.reduceMotion ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Travel Hub Shortcut Banner */}
        <div className="mt-8 p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 text-start">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-md font-bold text-foreground">
                {isRTL ? "حقيبتي: حجوزاتي وجداولي السياحية" : "My Travel Hub: Bookings & Itineraries"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                {isRTL 
                  ? "الوصول السريع إلى كافة الجداول السياحية والمسارات التي قمت بحفظها وتخطيطها باستخدام شومتك، بالإضافة إلى تتبع حجوزاتك النشطة للفنادق، مغامرات الهايكنج، وتأجير السيارات."
                  : "Quickly access all planned tourist itineraries saved using Shoumatak, and easily track your active hotel bookings, hiking tour tickets, and car rentals."}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setLocation("/my-bookings")}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-6 py-2 h-10 shadow-md whitespace-nowrap"
          >
            {isRTL ? "عرض حجوزاتي وجداولي المحفوظة" : "View My Hub"}
          </Button>
        </div>

        {/* Informative Help Alert */}
        <div className="mt-8 p-4 rounded-xl border border-border bg-accent/20 flex gap-3 items-start">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-start">
            <h4 className="text-xs font-bold text-foreground">
              {isRTL ? "كيف يتم تطبيق هذه الإعدادات؟" : "How are these settings synced?"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isRTL 
                ? "يتم تطبيق التفضيلات العامة وإعدادات مساعد الوصول فورياً في المتصفح وتخزينها محلياً، في حين تُحفظ إعدادات العملة والمسافة والإشعارات بشكل دائم في حسابك لتظل متوفرة عبر أي جهاز تدخل منه."
                : "Accessibility features apply instantly and store locally inside your current browser context. Booking metrics, GPS recommendations, and push notification configurations sync dynamically to your database account for multi-device support."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="ghost"
              onClick={() => setLocation("/home")}
              className="text-muted-foreground hover:text-foreground font-semibold"
            >
              {isRTL ? "إلغاء والعودة" : "Cancel & Return"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2 font-semibold text-xs py-2 px-3 h-9 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 rounded-xl transition-colors duration-250"
            >
              <LogOut className="w-3.5 h-3.5" />
              {isRTL ? "تسجيل الخروج" : "Logout"}
            </Button>
          </div>
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving || isLoadingPrefs}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg transition-all active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            {isRTL ? "حفظ كافة التغييرات" : "Save All Settings"}
          </Button>
        </div>
      </main>
    </div>
  );
}
