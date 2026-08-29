import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { categories } from "@/lib/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Building2, 
  UtensilsCrossed, 
  Mountain, 
  Car, 
  Sparkles,
  LogOut,
  Hospital,
  UserCheck,
  Navigation,
  Compass,
  Gem,
  Map,
  Users,
  Accessibility,
  Code2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Shield,
  Calendar,
  Moon,
  Sun,
  Coins,
  Bell,
  Save,
  Check,
  Loader2,
  Briefcase
} from "lucide-react";
import shoumaLogo from "@/assets/shouma-logo.png";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle, { useTheme } from "@/components/ThemeToggle";

// Import Oman-specific images for categories
import nizwaFortImg from "@/assets/nizwa-souq.png";
import sixSensesHotelImg from "@/assets/six-senses-hotel.png";
import baitAlmadghootImg from "@/assets/bait-almadghoot.png";
import jebelAkhdarImg from "@/assets/jebel-akhdar.png";
import mutrahSouqImg from "@/assets/mutrah-fort.png";
import qurmBeachImg from "@/assets/qurum-beach.png";
import misfatAbriyyinImg from "@/assets/misfat-abriyyin.png";
import wadiDarbatImg from "@/assets/wadi-darbat.png";
import mughsailBeachImg from "@/assets/mughsail-beach.png";
import muscatNightsImg from "@/assets/muscat-nights.png";
const injazEventImg = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";

const iconMap: Record<string, React.ReactNode> = {
  MapPin: <MapPin className="w-8 h-8" />,
  Building2: <Building2 className="w-8 h-8" />,
  UtensilsCrossed: <UtensilsCrossed className="w-8 h-8" />,
  Mountain: <Mountain className="w-8 h-8" />,
  Car: <Car className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
  Hospital: <Hospital className="w-8 h-8" />,
  UserCheck: <UserCheck className="w-8 h-8" />,
  Navigation: <Navigation className="w-8 h-8" />,
  Compass: <Compass className="w-8 h-8" />,
  Gem: <Gem className="w-8 h-8" />,
  Map: <Map className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  Accessibility: <Accessibility className="w-8 h-8" />,
};

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const username = localStorage.getItem('shouma-username');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isDark, toggle: toggleTheme } = useTheme();

  // User Preferences State and Queries
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<{
    currency: "OMR" | "USD" | "AED";
    gpsEnabled: boolean;
    distanceUnit: "km" | "mi";
    bookingNotifications: boolean;
    promoNotifications: boolean;
  } | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);

  // Fetch User Settings
  const { data: userPrefs, refetch: refetchPrefs } = useQuery<any>({
    queryKey: ["/api/user-settings"],
    queryFn: async () => {
      const uName = localStorage.getItem('shouma-username') || 'guest';
      const resp = await fetch("/api/user-settings", {
        headers: {
          "x-username": encodeURIComponent(uName),
        }
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch settings");
      }
      return resp.json();
    }
  });

  // Keep local preferences state in sync when loaded or when modal is opened
  useEffect(() => {
    if (userPrefs) {
      setLocalPrefs({
        currency: userPrefs.currency as "OMR" | "USD" | "AED",
        gpsEnabled: userPrefs.gpsEnabled,
        distanceUnit: userPrefs.distanceUnit as "km" | "mi",
        bookingNotifications: userPrefs.bookingNotifications,
        promoNotifications: userPrefs.promoNotifications,
      });
    }
  }, [userPrefs, isPrefsOpen]);

  const handleSavePrefs = async () => {
    if (!localPrefs) return;
    setIsSavingPrefs(true);
    setPrefsSuccess(false);
    try {
      const uName = localStorage.getItem('shouma-username') || 'guest';
      const resp = await fetch("/api/user-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-username": encodeURIComponent(uName),
        },
        body: JSON.stringify(localPrefs),
      });

      if (resp.ok) {
        await refetchPrefs();
        setPrefsSuccess(true);
        setTimeout(() => {
          setPrefsSuccess(false);
          setIsPrefsOpen(false);
        }, 1500);
      } else {
        console.error("Failed to save user preferences");
      }
    } catch (err) {
      console.error("Error saving user preferences:", err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Fetch the latest active announcement compiled by administrators
  const { data: latestAnn } = useQuery<any>({
    queryKey: ["/api/announcements/latest"],
    queryFn: async () => {
      const resp = await fetch("/api/announcements/latest");
      if (!resp.ok) return null;
      return resp.json();
    }
  });

  // Fetch active marketing ads
  const { data: ads = [] } = useQuery<any[]>({
    queryKey: ["/api/marketing-ads"],
    queryFn: async () => {
      const resp = await fetch("/api/marketing-ads");
      if (!resp.ok) return [];
      return resp.json();
    }
  });

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads]);

  const handleNextAd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (ads.length > 0) {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }
  };

  const handlePrevAd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (ads.length > 0) {
      setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
    }
  };

  const [announcement, setAnnouncement] = useState<any | null>(null);
  const [hasActiveItinerary, setHasActiveItinerary] = useState(false);

  useEffect(() => {
    try {
      const active = localStorage.getItem("shouma_active_itinerary");
      const saved = localStorage.getItem("shouma_saved_itineraries");
      const hasSaved = saved ? JSON.parse(saved).length > 0 : false;
      if (active || hasSaved) {
        setHasActiveItinerary(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (latestAnn && latestAnn.id) {
      const hasSeen = sessionStorage.getItem(`seen-announcement-${latestAnn.id}`);
      if (!hasSeen) {
        setAnnouncement(latestAnn);
      }
    }
  }, [latestAnn]);

  const handleDismissAnnouncement = () => {
    if (announcement) {
      sessionStorage.setItem(`seen-announcement-${announcement.id}`, "true");
      setAnnouncement(null);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === "shoumatak") {
      setLocation("/shoumatak");
    } else if (categoryId === "attractions") {
      setLocation("/attractions");
    } else if (categoryId === "hotels") {
      setLocation("/hotels");
    } else if (categoryId === "restaurants") {
      setLocation("/restaurants");
    } else if (categoryId === "taxis") {
      setLocation("/taxis");
    } else if (categoryId === "hiking") {
      setLocation("/hiking");
    } else if (categoryId === "hospitals") {
      setLocation("/hospitals");
    } else if (categoryId === "tour-guides") {
      setLocation("/tour-guides");
    } else if (categoryId === "nearby") {
      setLocation("/nearby");
    } else if (categoryId === "activities") {
      setLocation("/activities");
    } else if (categoryId === "hidden-gems") {
      setLocation("/hidden-gems");
    } else if (categoryId === "offline-map") {
      setLocation("/offline-map");
    } else if (categoryId === "group-trips") {
      setLocation("/group-trips");
    } else if (categoryId === "himam-shouma") {
      setLocation("/himam-shouma");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shouma-username');
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={shoumaLogo} 
                alt="شومة" 
                className="h-11 w-auto object-contain drop-shadow-sm rounded-md"
                data-testid="logo-icon"
              />
              {username && (
                <span className="text-foreground font-medium text-lg" data-testid="text-welcome-user">
                  {t('hello')} {username}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              {/* My Bookings & Itineraries button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/my-bookings")}
                className="relative text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all duration-300"
                title={isRTL ? "حقيبتي: حجوزاتي وجداولي المحفوظة" : "My Bookings & Saved Itineraries"}
                data-testid="button-my-bookings"
              >
                <Briefcase className="w-5 h-5 hover:scale-110 transition-transform duration-300" />
              </Button>

              {/* Settings button redirects to dedicated page */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/settings")}
                className="relative text-muted-foreground hover:text-foreground transition-all duration-300"
                title={isRTL ? "الإعدادات والتفضيلات" : "Settings & Preferences"}
                data-testid="button-settings"
              >
                <Settings className="w-5 h-5 hover:rotate-45 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${misfatAbriyyinImg}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg" data-testid="text-welcome">
            {t('welcomeToShouma')}
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-8 drop-shadow" data-testid="text-subtitle">
            {t('homeSubtitle')}
          </p>
          
          <Button 
            data-testid="button-start-journey"
            onClick={() => setLocation("/shoumatak")}
            className="mt-6 h-12 px-8 text-base font-semibold rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all"
          >
            <Sparkles className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('startJourney')}
          </Button>
        </div>
      </section>

      {/* Dynamic Scrolling and Interactive Ads Carousel */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-900/10 via-slate-800/5 to-amber-900/10 select-none">
        <div className="max-w-7xl mx-auto relative group/carousel">
          {ads.length === 0 ? (
            // Fallback default ad if empty
            <a
              href="https://maps.app.goo.gl/2SFBSzDjqRn9sY216"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="banner-featured-event"
              className="w-full block group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative h-48 sm:h-64 md:h-72">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${injazEventImg}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className={`absolute inset-0 flex flex-col justify-center p-6 sm:p-8 md:p-10 ${isRTL ? 'text-right items-end' : 'text-left items-start'}`}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">
                    {isRTL ? 'معرض الشركات الطلابية - إنجاز عُمان' : 'Student Companies Exhibition - Injaz Oman'}
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm max-w-md">
                    {isRTL ? '٥ - ٧ مارس | مركز المعارض' : 'March 5-7 | Exhibition Centre'}
                  </p>
                </div>
              </div>
            </a>
          ) : (
            <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <AnimatePresence mode="wait">
                {ads.map((ad, idx) => {
                  if (idx !== currentAdIndex) return null;
                  
                  // Check if the link is external or internal
                  const isExternal = ad.link?.startsWith("http");
                  const ContainerTag = ad.link ? "a" : "div";
                  const containerProps = ad.link ? {
                    href: ad.link,
                    target: isExternal ? "_blank" : undefined,
                    rel: isExternal ? "noopener noreferrer" : undefined,
                  } : {};

                  return (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <ContainerTag
                        {...containerProps}
                        className="w-full block relative overflow-hidden h-56 sm:h-64 md:h-80 cursor-pointer group"
                      >
                        {/* Background Image */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                          style={{ backgroundImage: `url('${ad.image_url}')` }}
                        />
                        {/* Shading overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 md:bg-gradient-to-r md:from-black/95 md:via-black/55 md:to-transparent" />
                        
                        {/* Live/Ad Tag */}
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                          <span className="px-3 py-1 bg-amber-500/90 text-white text-[10px] sm:text-xs font-black tracking-wide rounded-full shadow-lg animate-pulse">
                            {isRTL ? "ترويج" : "PROMOTED"}
                          </span>
                        </div>

                        {/* Content */}
                        <div className={`absolute inset-0 flex flex-col justify-center p-6 sm:p-10 md:p-12 z-10 ${isRTL ? 'text-right items-end' : 'text-left items-start'}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                            <span className="text-amber-400 text-xs sm:text-sm font-black uppercase tracking-wider">
                              {isRTL ? "مستجدات شومة" : "Shouma Spotlight"}
                            </span>
                          </div>

                          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 leading-tight drop-shadow-md font-sans">
                            {isRTL ? ad.title_ar : ad.title}
                          </h2>

                          <p className="text-white/85 text-xs sm:text-sm md:text-base max-w-xl mb-4 leading-relaxed font-sans drop-shadow">
                            {isRTL ? ad.description_ar : ad.description}
                          </p>

                          {ad.link && (
                            <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-full border border-white/10">
                              {isRTL ? "اكتشف المزيد الآن" : "Explore More Now"}
                              <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                            </span>
                          )}
                        </div>
                      </ContainerTag>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Navigation Arrows */}
              {ads.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevAd}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105 border border-white/10"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextAd}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105 border border-white/10"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Indicator Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                    {ads.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentAdIndex(dotIdx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          dotIdx === currentAdIndex 
                            ? "bg-amber-400 w-6" 
                            : "bg-white/45 hover:bg-white/70"
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-services-title">
              {t('discoverServices')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-services-subtitle">
              {t('servicesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                data-testid={`card-category-${category.id}`}
                onClick={() => handleCategoryClick(category.id)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${getCategoryImage(category.id)}')`,
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color}`} />
                
                <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white`}>
                  {iconMap[category.icon]}
                </div>

                <div className={`absolute bottom-0 right-0 left-0 p-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg" data-testid={`text-category-title-${category.id}`}>
                    {getCategoryTitle(category.id, t)}
                  </h3>
                  <p className="text-white/90 text-sm drop-shadow" data-testid={`text-category-desc-${category.id}`}>
                    {getCategoryDesc(category.id, t)}
                  </p>
                </div>

                {category.id === "shoumatak" && (
                  <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full`}>
                    <span className="text-xs font-medium text-white" data-testid="badge-featured">{t('featured')}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-shoumatak-title">
            {t('shoumatakTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-shoumatak-desc">
            {t('shoumatakDesc')}
          </p>
          <Button 
            data-testid="button-try-shoumatak"
            onClick={() => setLocation("/shoumatak")}
            size="lg"
            className="h-14 px-10 text-lg font-semibold rounded-full"
          >
            {t('tryShoumatak')}
            <Sparkles className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Button>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={shoumaLogo} 
              alt="شومة" 
              className="h-10 w-auto object-contain drop-shadow-sm rounded-md"
            />
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-copyright">
            {t('copyright')} © {new Date().getFullYear()} {t('appName')}
          </p>
        </div>
      </footer>

      {/* ANNOUNCEMENT POPUP OVERLAY */}
      {announcement && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-right p-6 animate-scale-up relative">
            <button 
              onClick={handleDismissAnnouncement}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 ml-8">
              {announcement.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
              {announcement.message}
            </p>
            <div className="flex justify-end">
              <Button 
                onClick={handleDismissAnnouncement}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-2xl text-base shadow-lg shadow-primary/10"
              >
                حسناً، فهمت
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryImage(id: string): string {
  const images: Record<string, string> = {
    attractions: nizwaFortImg,
    hotels: sixSensesHotelImg,
    restaurants: baitAlmadghootImg,
    hiking: jebelAkhdarImg,
    taxis: mutrahSouqImg,
    hospitals: qurmBeachImg,
    "tour-guides": misfatAbriyyinImg,
    shoumatak: wadiDarbatImg,
    nearby: mughsailBeachImg,
    activities: jebelAkhdarImg,
    "hidden-gems": misfatAbriyyinImg,
    "offline-map": muscatNightsImg,
    "himam-shouma": qurmBeachImg,
  };
  return images[id] || images.attractions;
}

function getCategoryTitle(id: string, t: (key: string) => string): string {
  const titles: Record<string, string> = {
    attractions: t('attractions'),
    hotels: t('hotels'),
    restaurants: t('restaurants'),
    hiking: t('hiking'),
    taxis: t('taxis'),
    hospitals: t('hospitals'),
    "tour-guides": t('tourGuides'),
    shoumatak: t('shoumatak'),
    nearby: t('nearbyPlaces'),
    activities: t('activities'),
    "hidden-gems": t('hiddenGems'),
    "offline-map": t('offlineMap'),
    "himam-shouma": t('himamShouma'),
  };
  return titles[id] || id;
}

function getCategoryDesc(id: string, t: (key: string) => string): string {
  const descs: Record<string, string> = {
    attractions: t('attractionsDesc'),
    hotels: t('hotelsDesc'),
    restaurants: t('restaurantsDesc'),
    hiking: t('hikingDesc'),
    taxis: t('taxisDesc'),
    hospitals: t('hospitalsDesc'),
    "tour-guides": t('tourGuidesDesc'),
    shoumatak: t('shoumatakDescShort'),
    nearby: t('nearbyPlacesDesc'),
    activities: t('activitiesDesc'),
    "hidden-gems": t('hiddenGemsDesc'),
    "offline-map": t('offlineMapDescShort'),
    "himam-shouma": t('himamShoumaDesc'),
  };
  return descs[id] || '';
}
