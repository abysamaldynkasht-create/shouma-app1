import { useState } from "react";
import { useLocation } from "wouter";
import { tourGuides } from "@/lib/tour-guides";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UserCheck, 
  ArrowLeft,
  ArrowRight,
  MapPin,
  Star,
  Search,
  Phone,
  MessageCircle,
  Languages,
  Clock
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import misfatAbriyyinHeroImg from "@/assets/misfat-abriyyin.png";


const SPEC_KEYS = ['all', 'historicalCultural', 'adventureNature', 'desert', 'photography', 'marine', 'family'] as const;
const CITY_KEYS = ['all', 'muscat', 'nizwa', 'salalah', 'musandam', 'sohar'] as const;

type SpecKey = typeof SPEC_KEYS[number];
type CityKey = typeof CITY_KEYS[number];

const specEnToKey: Record<string, SpecKey> = {
  'Historical & Cultural Tours': 'historicalCultural',
  'Adventure & Nature Tours': 'adventureNature',
  'Desert Safari Tours': 'desert',
  'Photography Tours': 'photography',
  'Marine & Diving Tours': 'marine',
  'Family & Group Tours': 'family',
};

const cityToKey: Record<string, CityKey> = {
  'مسقط': 'muscat',
  'نزوى': 'nizwa',
  'صلالة': 'salalah',
  'مسندم': 'musandam',
  'صحار': 'sohar',
};

export default function TourGuidesPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecKey, setSelectedSpecKey] = useState<SpecKey>('all');
  const [selectedCityKey, setSelectedCityKey] = useState<CityKey>('all');

  const filteredGuides = tourGuides.filter((guide) => {
    const matchesSearch = guide.nameAr.includes(searchQuery) || 
                          guide.name.includes(searchQuery) ||
                          guide.description.includes(searchQuery) ||
                          guide.specializationAr.includes(searchQuery);
    const guideSpecKey = specEnToKey[guide.specialization] || 'all';
    const guideCityKey = cityToKey[guide.city] || 'all';
    const matchesSpec = selectedSpecKey === 'all' || guideSpecKey === selectedSpecKey;
    const matchesCity = selectedCityKey === 'all' || guideCityKey === selectedCityKey;
    return matchesSearch && matchesSpec && matchesCity;
  });

  const handleWhatsApp = (whatsapp: string, name: string) => {
    const message = encodeURIComponent(`مرحباً ${name}، أريد الاستفسار عن خدمات الإرشاد السياحي`);
    window.open(`https://wa.me/${whatsapp.replace(/\s/g, '')}?text=${message}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => setLocation("/home")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              <span className="text-sm font-medium">{t('back')}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('tourGuides')}</span>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-[40vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${misfatAbriyyinHeroImg}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg" data-testid="text-page-title">
            {t('tourGuidesTitle')}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mb-6 drop-shadow" data-testid="text-page-subtitle">
            {t('tourGuidesSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input
                data-testid="input-search"
                type="search"
                placeholder={t('searchGuide')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-12 ${isRTL ? 'pr-5 pl-12' : 'pl-5 pr-12'}`}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {SPEC_KEYS.map((specKey) => (
                  <Button
                    key={specKey}
                    data-testid={`button-spec-${specKey}`}
                    variant={selectedSpecKey === specKey ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpecKey(specKey)}
                    className="whitespace-nowrap"
                  >
                    {t(specKey)}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {CITY_KEYS.map((cityKey) => (
                  <Button
                    key={cityKey}
                    data-testid={`button-city-${cityKey}`}
                    variant={selectedCityKey === cityKey ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCityKey(cityKey)}
                    className="whitespace-nowrap"
                  >
                    <MapPin className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t(cityKey)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-results-count">
              {filteredGuides.length} {t('guideCount')}
            </h2>
          </div>

          {filteredGuides.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('noResults')}</h3>
              <p className="text-muted-foreground">{t('tryDifferentSearch')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <Card 
                  key={guide.id}
                  data-testid={`card-guide-${guide.id}`}
                  className="overflow-hidden group"
                >
                  <div className="relative">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={guide.image}
                        alt={guide.nameAr}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={guide.availability ? "default" : "secondary"} 
                        className={guide.availability ? "bg-green-600" : "bg-gray-500"}
                      >
                        {guide.availability ? t('available') : t('unavailable')}
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{guide.rating}</span>
                      <span className="text-xs text-white/70">({guide.reviewsCount})</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground" data-testid={`text-guide-name-${guide.id}`}>
                          {guide.nameAr}
                        </h3>
                        <p className="text-sm text-primary font-medium">{guide.specializationAr}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{guide.city}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{guide.experience} سنوات</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <Languages className="w-4 h-4" />
                      <span>{guide.languages.join(" • ")}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {guide.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {guide.services.slice(0, 3).map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border mb-4">
                      <span className="text-sm text-muted-foreground">{t('perDay')}</span>
                      <span className="text-lg font-bold text-primary">{guide.pricePerDay} OMR</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        data-testid={`button-call-${guide.id}`}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCall(guide.phone)}
                      >
                        <Phone className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {t('call')}
                      </Button>
                      <Button 
                        data-testid={`button-whatsapp-${guide.id}`}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleWhatsApp(guide.whatsapp, guide.nameAr)}
                      >
                        <MessageCircle className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {t('whatsapp')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            {t('copyright')} © {new Date().getFullYear()} {t('appName')}
          </p>
        </div>
      </footer>
    </div>
  );
}
