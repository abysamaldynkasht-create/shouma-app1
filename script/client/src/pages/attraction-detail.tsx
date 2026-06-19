import { useLocation, useParams } from "wouter";
import { attractions, getAttractionImage } from "@/lib/attractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  ArrowLeft,
  MapPin,
  Star,
  Share2,
  Heart,
  Navigation,
  Building2,
  Tag,
  Globe
} from "lucide-react";
import logoUrl from "@assets/شومة_1768320219408.jpg";
import { VoiceGuide } from "@/components/VoiceGuide";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages } from "@/lib/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AttractionDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { language, setLanguage, t, direction } = useLanguage();
  
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;
  
  const attraction = attractions.find((a) => a.id === params.id);

  const getRelatedAttractions = () => {
    if (!attraction) return [];
    return attractions
      .filter((a) => a.id !== attraction.id && a.wilayat === attraction.wilayat)
      .slice(0, 3);
  };

  if (!attraction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4" dir={direction}>
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t('placeNotFound')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('placeNotFoundDesc')}
            </p>
            <Button onClick={() => setLocation("/attractions")}>
              <BackArrow className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t('backToAttractions')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relatedAttractions = getRelatedAttractions();

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/attractions")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BackArrow className="w-5 h-5" />
              <span className="text-sm font-medium">{t('back')}</span>
            </button>

            <div className="flex items-center gap-2">
              <img 
                src={logoUrl} 
                alt={t('appName')} 
                className="w-8 h-8 rounded-full object-cover mix-blend-multiply dark:mix-blend-screen dark:invert"
              />
              <span className="text-lg font-bold">{t('placeDetails')}</span>
            </div>

            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                <SelectTrigger className="w-auto gap-2" data-testid="select-language">
                  <Globe className="w-4 h-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="font-medium">{lang.flag}</span>
                      <span className="mx-2">{lang.nativeName}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" data-testid="button-share">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-favorite">
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-[50vh] overflow-hidden">
        <img
          src={getAttractionImage(attraction.image)}
          alt={attraction.nameAr}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                {attraction.category}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg" data-testid="text-attraction-title">
              {attraction.nameAr}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{attraction.wilayat}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{attraction.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground" data-testid="text-about-title">
                  {t('aboutPlace')}
                </h2>
                <VoiceGuide 
                  text={attraction.description}
                  attractionName={attraction.nameAr}
                  location={`${attraction.wilayat}، ${attraction.governorate}`}
                />
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg" data-testid="text-attraction-description">
                {language === 'ar' || language === 'fa' 
                  ? attraction.description 
                  : language === 'fr' 
                    ? (attraction.descriptionFr || attraction.descriptionEn || attraction.description)
                    : language === 'tr'
                      ? (attraction.descriptionTr || attraction.descriptionEn || attraction.description)
                      : (attraction.descriptionEn || attraction.description)}
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">{t('quickInfo')}</h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('governorate')}</p>
                    <p className="font-medium">{attraction.governorate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('wilayat')}</p>
                    <p className="font-medium">{attraction.wilayat}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('category')}</p>
                    <p className="font-medium">{attraction.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('rating')}</p>
                    <p className="font-medium">{attraction.rating} / 5</p>
                  </div>
                </div>

                {attraction.mapUrl && (
                  <a 
                    href={attraction.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="button-get-directions"
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                    {t('getDirections')}
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedAttractions.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {t('nearbyInSameWilayat')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedAttractions.map((related) => (
                <Card 
                  key={related.id}
                  data-testid={`card-related-${related.id}`}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(`/attractions/${related.id}`)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={getAttractionImage(related.image)}
                      alt={related.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{related.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-foreground mb-1 line-clamp-1">{related.nameAr}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{related.wilayat}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logoUrl} alt={t('appName')} className="w-6 h-6 rounded-full object-cover mix-blend-multiply dark:mix-blend-screen dark:invert" />
            <span className="font-semibold">{t('appName')}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('copyright')} © {new Date().getFullYear()} {t('appName')}
          </p>
        </div>
      </footer>
    </div>
  );
}
