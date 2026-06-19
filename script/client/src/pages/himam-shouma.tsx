import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Accessibility,
  MapPin,
  Phone,
  CheckCircle2,
  ParkingCircle,
  Eye,
  Ear,
  HandMetal,
  Bus,
  UserPlus,
  Ticket,
  Star,
  ExternalLink,
  Bath,
  DoorOpen,
  HeartHandshake
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface AccessiblePlace {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  location: string;
  locationEn: string;
  category: 'wheelchair' | 'restrooms' | 'entrances' | 'support';
  features: string[];
  featuresEn: string[];
  rating: number;
  phone?: string;
  mapUrl?: string;
  fullyAccessible: boolean;
}

const accessiblePlaces: AccessiblePlace[] = [
  {
    id: "1",
    name: "المتحف الوطني العماني",
    nameEn: "National Museum of Oman",
    description: "متحف مهيأ بالكامل لأصحاب الهمم مع مصاعد، منحدرات، كراسي متحركة مجانية، ولافتات بطريقة برايل. يوفر جولات بلغة الإشارة عند الطلب.",
    descriptionEn: "Fully accessible museum with elevators, ramps, free wheelchairs, and Braille signage. Sign language tours available upon request.",
    location: "مسقط، قرم",
    locationEn: "Muscat, Qurum",
    category: "wheelchair",
    features: ["كراسي متحركة مجانية", "مصاعد", "منحدرات", "لافتات برايل", "جولات بلغة الإشارة", "دخول مجاني للمرافق"],
    featuresEn: ["Free wheelchairs", "Elevators", "Ramps", "Braille signage", "Sign language tours", "Free entry for companions"],
    rating: 5.0,
    phone: "+968 2401 8700",
    mapUrl: "https://share.google/w1qoVzACJItpeC0x7",
    fullyAccessible: true
  },
  {
    id: "2",
    name: "جامع السلطان قابوس الأكبر",
    nameEn: "Sultan Qaboos Grand Mosque",
    description: "مهيأ بالكامل مع مداخل واسعة بدون درج، أرضيات ملساء، دورات مياه مخصصة، ومواقف سيارات لذوي الاحتياجات الخاصة.",
    descriptionEn: "Fully accessible with wide step-free entrances, smooth floors, designated restrooms, and reserved parking for people with special needs.",
    location: "مسقط، بوشر",
    locationEn: "Muscat, Bawshar",
    category: "entrances",
    features: ["مداخل بدون درج", "أرضيات ملساء", "دورات مياه مخصصة", "مواقف سيارات مخصصة", "كراسي متحركة"],
    featuresEn: ["Step-free entrances", "Smooth floors", "Designated restrooms", "Reserved parking", "Wheelchairs"],
    rating: 5.0,
    phone: "+968 2450 5100",
    mapUrl: "https://share.google/HsHWETNMNrzudAsiw",
    fullyAccessible: true
  },
  {
    id: "3",
    name: "دار الأوبرا السلطانية",
    nameEn: "Royal Opera House Muscat",
    description: "مرافق مهيأة بالكامل تشمل مقاعد مخصصة، مصاعد، دورات مياه مهيأة، ونظام سمعي مساعد للمسرح.",
    descriptionEn: "Fully equipped facilities including designated seating, elevators, accessible restrooms, and assistive hearing system for the theater.",
    location: "مسقط، الخوير",
    locationEn: "Muscat, Al Khuwair",
    category: "support",
    features: ["مقاعد مخصصة", "مصاعد", "نظام سمعي مساعد", "دورات مياه مهيأة", "مواقف مخصصة"],
    featuresEn: ["Designated seating", "Elevators", "Assistive hearing system", "Accessible restrooms", "Reserved parking"],
    rating: 4.9,
    phone: "+968 2240 3300",
    mapUrl: "https://maps.app.goo.gl/VDdQwqu3VM1hpNGP6",
    fullyAccessible: true
  },
  {
    id: "4",
    name: "متنزه القرم الطبيعي",
    nameEn: "Qurum Natural Park",
    description: "ممرات مستوية مناسبة للكراسي المتحركة، مقاعد استراحة متعددة، ودورات مياه مهيأة. بيئة طبيعية هادئة مناسبة لجميع الزوار.",
    descriptionEn: "Level pathways suitable for wheelchairs, multiple rest benches, and accessible restrooms. A calm natural environment suitable for all visitors.",
    location: "مسقط، القرم",
    locationEn: "Muscat, Qurum",
    category: "wheelchair",
    features: ["ممرات مستوية", "مقاعد استراحة", "دورات مياه مهيأة", "إضاءة جيدة", "مواقف قريبة"],
    featuresEn: ["Level pathways", "Rest benches", "Accessible restrooms", "Good lighting", "Nearby parking"],
    rating: 4.7,
    mapUrl: "https://maps.app.goo.gl/8DDfZ75uhL6NbTGa8",
    fullyAccessible: true
  },
  {
    id: "5",
    name: "مركز عمان للمؤتمرات والمعارض",
    nameEn: "Oman Convention & Exhibition Centre",
    description: "مرافق حديثة مهيأة بالكامل مع مصاعد بنظام برايل، منحدرات واسعة، دورات مياه مخصصة، وخدمة مرافقين عند الطلب.",
    descriptionEn: "Modern fully accessible facilities with Braille elevators, wide ramps, designated restrooms, and companion assistance upon request.",
    location: "مسقط، بوشر",
    locationEn: "Muscat, Bawshar",
    category: "support",
    features: ["مصاعد بنظام برايل", "منحدرات واسعة", "خدمة مرافقين", "دورات مياه مخصصة", "مواقف سيارات مخصصة"],
    featuresEn: ["Braille elevators", "Wide ramps", "Companion service", "Designated restrooms", "Reserved parking"],
    rating: 4.8,
    phone: "+968 2402 3000",
    mapUrl: "https://share.google/PoTo0U6WRy2YKUKUk",
    fullyAccessible: true
  },
  {
    id: "6",
    name: "سيتي سنتر مسقط",
    nameEn: "City Centre Muscat",
    description: "مركز تجاري مهيأ بالكامل مع كراسي متحركة مجانية، مصاعد متعددة، دورات مياه في كل طابق، ومواقف سيارات مخصصة بالقرب من المداخل.",
    descriptionEn: "Fully accessible mall with free wheelchairs, multiple elevators, restrooms on every floor, and designated parking near entrances.",
    location: "مسقط، القرم",
    locationEn: "Muscat, Qurum",
    category: "restrooms",
    features: ["كراسي متحركة مجانية", "مصاعد متعددة", "دورات مياه كل طابق", "مواقف قريبة من المدخل", "أرضيات مستوية"],
    featuresEn: ["Free wheelchairs", "Multiple elevators", "Restrooms every floor", "Parking near entrance", "Level floors"],
    rating: 4.6,
    phone: "+968 2455 8888",
    mapUrl: "https://share.google/v8tS74f1z5sf59A0d",
    fullyAccessible: true
  },
  {
    id: "7",
    name: "متحف بيت الزبير",
    nameEn: "Bait Al Zubair Museum",
    description: "متحف تراثي مع منحدرات لجميع المعارض، دليل صوتي متاح، ودخول مجاني لأصحاب الهمم والمرافقين.",
    descriptionEn: "Heritage museum with ramps to all exhibits, audio guide available, and free entry for people of determination and their companions.",
    location: "مسقط القديمة",
    locationEn: "Old Muscat",
    category: "entrances",
    features: ["منحدرات لجميع المعارض", "دليل صوتي", "دخول مجاني", "مرافق مجاني", "أرضيات مستوية"],
    featuresEn: ["Ramps to all exhibits", "Audio guide", "Free entry", "Free companion", "Level floors"],
    rating: 4.5,
    phone: "+968 2208 4700",
    mapUrl: "https://maps.app.goo.gl/qLTmX4NpjzUDkege6",
    fullyAccessible: false
  },
];

const serviceCategories = [
  { id: 'wheelchair', icon: Accessibility, colorClass: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  { id: 'restrooms', icon: Bath, colorClass: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
  { id: 'entrances', icon: DoorOpen, colorClass: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  { id: 'support', icon: HeartHandshake, colorClass: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
];

function getFeatureIcon(feature: string) {
  const lower = feature.toLowerCase();
  if (lower.includes('كرسي') || lower.includes('wheelchair')) return <Accessibility className="w-3.5 h-3.5" />;
  if (lower.includes('مواقف') || lower.includes('parking')) return <ParkingCircle className="w-3.5 h-3.5" />;
  if (lower.includes('برايل') || lower.includes('braille')) return <Eye className="w-3.5 h-3.5" />;
  if (lower.includes('سمعي') || lower.includes('hearing') || lower.includes('صوتي') || lower.includes('audio')) return <Ear className="w-3.5 h-3.5" />;
  if (lower.includes('إشارة') || lower.includes('sign')) return <HandMetal className="w-3.5 h-3.5" />;
  if (lower.includes('نقل') || lower.includes('transport')) return <Bus className="w-3.5 h-3.5" />;
  if (lower.includes('مرافق') || lower.includes('companion')) return <UserPlus className="w-3.5 h-3.5" />;
  if (lower.includes('مجاني') || lower.includes('free')) return <Ticket className="w-3.5 h-3.5" />;
  return <CheckCircle2 className="w-3.5 h-3.5" />;
}

export default function HimamShoumaPage() {
  const [, setLocation] = useLocation();
  const { t, language, isRTL } = useLanguage();
  const isArabicLike = isRTL;

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      wheelchair: t('wheelchairAccessible'),
      restrooms: t('accessibleRestrooms'),
      entrances: t('easyEntrances'),
      support: t('supportServices'),
    };
    return labels[cat] || cat;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-sky-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/home")}
              className="p-2 hover:bg-sky-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              data-testid="button-back"
            >
              <BackArrow className="w-5 h-5 text-sky-700 dark:text-sky-400" />
            </button>
            <div className="flex items-center gap-2">
              <Accessibility className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <h1 className="text-xl font-bold text-sky-800 dark:text-sky-300" style={{ fontFamily: 'Cairo, sans-serif' }} data-testid="text-page-title">
                همم شومة
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-sky-800 dark:from-sky-800 dark:to-sky-950 py-12 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white" />
          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-4 border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-white" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Accessibility className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Cairo, sans-serif' }} data-testid="text-hero-title">
            همم شومة
          </h2>
          <p className="text-sky-100 text-lg max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            {t('himamShoumaSubtitle')}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-testid="grid-service-categories">
          {serviceCategories.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl ${sc.colorClass} border border-current/10 transition-transform hover:scale-105`}
                data-testid={`card-service-${sc.id}`}
              >
                <Icon className="w-8 h-8" />
                <span className="text-sm font-semibold text-center" style={{ fontFamily: isArabicLike ? 'Cairo, sans-serif' : 'inherit' }}>
                  {getCategoryLabel(sc.id)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="grid-accessible-places">
          {accessiblePlaces.map((place) => (
            <Card
              key={place.id}
              className="overflow-hidden border-sky-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300"
              data-testid={`card-place-${place.id}`}
            >
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-700 dark:to-sky-800 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: isArabicLike ? 'Cairo, sans-serif' : 'inherit' }}>
                        {isArabicLike ? place.name : place.nameEn}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sky-100 text-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{isArabicLike ? place.location : place.locationEn}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge
                        className={`text-xs ${place.fullyAccessible
                          ? 'bg-green-500/20 text-green-100 border-green-400/30'
                          : 'bg-amber-500/20 text-amber-100 border-amber-400/30'
                        }`}
                        data-testid={`badge-accessibility-${place.id}`}
                      >
                        {place.fullyAccessible ? t('fullyAccessible') : t('partiallyAccessible')}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span className="text-sm font-semibold text-white">{place.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: isArabicLike ? 'Cairo, sans-serif' : 'inherit' }}>
                    {isArabicLike ? place.description : place.descriptionEn}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(isArabicLike ? place.features : place.featuresEn).map((feature, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700 gap-1"
                      >
                        {getFeatureIcon(feature)}
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-sky-50 dark:border-gray-800">
                    {place.phone && (
                      <a
                        href={`tel:${place.phone}`}
                        className="flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors"
                        data-testid={`link-phone-${place.id}`}
                      >
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{place.phone}</span>
                      </a>
                    )}
                    {place.mapUrl && (
                      <a
                        href={place.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors"
                        data-testid={`link-map-${place.id}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>{isArabicLike ? 'الخريطة' : 'Map'}</span>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="bg-sky-50 dark:bg-gray-900 border-t border-sky-100 dark:border-gray-800 py-6 px-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Accessibility className="w-5 h-5 text-sky-500" />
            <span className="text-sky-700 dark:text-sky-400 font-semibold" style={{ fontFamily: 'Cairo, sans-serif' }}>همم شومة</span>
          </div>
          <p className="text-sm text-sky-500 dark:text-sky-600" style={{ fontFamily: isArabicLike ? 'Cairo, sans-serif' : 'inherit' }}>
            {isArabicLike
              ? 'نسعى لجعل عُمان وجهة سياحية شاملة ومتاحة للجميع'
              : 'We strive to make Oman an inclusive and accessible destination for all'
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
