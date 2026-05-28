import { useLocation } from "wouter";
import { categories } from "@/lib/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
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
  Accessibility
} from "lucide-react";
import shoumaLogo from "@assets/شومة_1768320219408.jpg";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

// Import Oman-specific images for categories
import nizwaFortImg from "@/assets/nizwa-fort.png";
import sixSensesHotelImg from "@/assets/six-senses-hotel.png";
import baitAlmadghootImg from "@/assets/bait-almadghoot.png";
import jebelAkhdarImg from "@/assets/jebel-akhdar.png";
import mutrahSouqImg from "@/assets/mutrah-souq.png";
import qurmBeachImg from "@/assets/qurum-beach.png";
import misfatAbriyyinImg from "@/assets/misfat-abriyyin.png";
import wadiDarbatImg from "@/assets/wadi-darbat.png";
import mughsailBeachImg from "@/assets/mughsail-beach.png";
import muscatNightsImg from "@/assets/muscat-nights.png";
import injazEventImg from "@assets/image_1772574646292.png";

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
                className="h-12 w-auto mix-blend-multiply dark:mix-blend-screen dark:invert"
                data-testid="logo-icon"
              />
              {username && (
                <span className="text-foreground font-medium text-lg" data-testid="text-welcome-user">
                  {t('hello')} {username}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button 
                variant="ghost" 
                size="icon"
                data-testid="button-logout"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-5 h-5" />
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

      {/* Featured Event Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-amber-900/20">
        <div className="max-w-7xl mx-auto">
          <a
            href="https://maps.app.goo.gl/2SFBSzDjqRn9sY216"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="banner-featured-event"
            className="w-full block group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1"
          >
            <div className="relative h-48 sm:h-64 md:h-72">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${injazEventImg}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              
              {/* Animated sparkles effect */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="px-3 py-1.5 bg-amber-500/90 backdrop-blur-sm rounded-full text-white text-sm font-bold animate-pulse">
                  {t('nowOpen') || 'الآن'}
                </span>
              </div>
              
              <div className={`absolute inset-0 flex flex-col justify-center p-6 sm:p-8 md:p-10 ${isRTL ? 'text-right items-end' : 'text-left items-start'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-sm sm:text-base font-semibold">
                    {t('featuredEvent') || 'الحدث المميز'}
                  </span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {t('featuredEventTitle') || 'معرض الشركات الطلابية - إنجاز عُمان'}
                </h2>
                
                <p className="text-white/90 text-sm sm:text-base max-w-md mb-4 drop-shadow">
                  {t('featuredEventDesc') || '٥ - ٧ مارس | ٧:٣٠ مساءً - ١٢:٠٠ صباحاً'}
                </p>
                
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {t('featuredEventLocation') || 'مركز عُمان للمعارض والمؤتمرات'}
                  </span>
                </div>
              </div>
            </div>
          </a>
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
              className="h-10 w-auto mix-blend-multiply dark:mix-blend-screen dark:invert"
            />
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-copyright">
            {t('copyright')} © {new Date().getFullYear()} {t('appName')}
          </p>
        </div>
      </footer>
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
