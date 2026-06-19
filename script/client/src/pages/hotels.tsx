import { useState } from "react";
import { useLocation } from "wouter";
import { hotels } from "@/lib/hotels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  Building2, 
  ArrowRight,
  ArrowLeft,
  MapPin,
  Star,
  Search,
  Wifi,
  Waves,
  UtensilsCrossed
} from "lucide-react";
import sixSensesHeroImg from "@/assets/six-senses-hotel.png";

const regionKeys = ["all", "muscat", "dakhiliyah", "dhofar", "northSharqiyah"] as const;
const regionArabicMap: Record<string, string> = {
  "all": "الكل",
  "muscat": "مسقط",
  "dakhiliyah": "الداخلية",
  "dhofar": "ظفار",
  "northSharqiyah": "شمال الشرقية"
};

export default function HotelsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const { t, language, isRTL } = useLanguage();

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch = hotel.nameAr.includes(searchQuery) || 
                          hotel.description.includes(searchQuery) ||
                          hotel.city.includes(searchQuery);
    const arabicRegion = regionArabicMap[selectedRegion];
    const matchesRegion = selectedRegion === "all" || hotel.region === arabicRegion;
    return matchesSearch && matchesRegion;
  });

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
    ));
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

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
              <BackArrow className="w-5 h-5" />
              <span className="text-sm font-medium">{t('back')}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('hotels')}</span>
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
            backgroundImage: `url('${sixSensesHeroImg}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg" data-testid="text-page-title">
            {t('bestHotelsInOman')}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mb-6 drop-shadow" data-testid="text-page-subtitle">
            {t('hotelsPageSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                data-testid="input-search"
                type="search"
                placeholder={t('searchHotel')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-12 ${isRTL ? 'pr-5 pl-12' : 'pl-5 pr-12'}`}
              />
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'left-4' : 'right-4'}`} />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {regionKeys.map((regionKey) => (
                <Button
                  key={regionKey}
                  data-testid={`button-region-${regionKey}`}
                  variant={selectedRegion === regionKey ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRegion(regionKey)}
                  className="whitespace-nowrap"
                >
                  {t(`region_${regionKey}`)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-results-count">
              {filteredHotels.length} {t('hotel')}
            </h2>
          </div>

          {filteredHotels.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('noResults')}</h3>
              <p className="text-muted-foreground">{t('tryDifferentSearch')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHotels.map((hotel) => (
                <Card 
                  key={hotel.id}
                  data-testid={`card-hotel-${hotel.id}`}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setLocation(`/hotels/${hotel.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={hotel.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className={`absolute top-3 flex gap-0.5 ${isRTL ? 'right-3' : 'left-3'}`}>
                      {renderStars(hotel.stars)}
                    </div>
                    <div className={`absolute top-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-sm ${isRTL ? 'left-3' : 'right-3'}`}>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{hotel.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-foreground mb-2" data-testid={`text-hotel-name-${hotel.id}`}>
                      {hotel.nameAr}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.city}، {hotel.region}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {hotel.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {hotel.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">{t('perNight')}</span>
                      <span className="text-lg font-bold text-primary">{hotel.pricePerNight} {t('omr')}</span>
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
