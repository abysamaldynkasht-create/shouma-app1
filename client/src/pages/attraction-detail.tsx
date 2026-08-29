import { useState, useEffect, useMemo } from "react";
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
import logoUrl from "@/assets/shouma-logo.png";
import { VoiceGuide } from "@/components/VoiceGuide";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages } from "@/lib/translations";
import { Translate } from "@/components/Translate";
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
  const [dbAttractions, setDbAttractions] = useState<any[]>([]);
  
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    fetch('/api/catalog/attractions')
      .then(async r => {
        if (!r.ok) return [];
        const contentType = r.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return r.json();
        }
        const text = await r.text();
        if (text.trim().startsWith("<")) {
          console.warn("Received HTML instead of JSON for attractions catalog.");
          return [];
        }
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
          setDbAttractions(data);
        }
      })
      .catch(err => console.error("Error fetching db attractions", err));
  }, []);

  const combinedAttractions = useMemo(() => {
    const formatted = dbAttractions.map(item => ({
      id: "db-" + item.id.toString(),
      name: item.name || '',
      nameAr: item.name_ar || item.nameAr || item.name || '',
      description: item.description || '',
      descriptionEn: item.description_en || item.descriptionEn || '',
      governorate: item.governorate || '',
      governorateId: item.governorate_id || item.governorateId || 'muscat',
      wilayat: item.wilayat || '',
      category: item.category || '',
      image: item.image || '',
      mapUrl: item.map_url || item.mapUrl || '',
      rating: parseFloat(item.rating) || 4.5,
      additionalImages: item.additional_images || item.additionalImages || '',
      tags: item.tags || []
    }));
    return [...attractions, ...formatted];
  }, [dbAttractions]);
  
  const attraction = combinedAttractions.find((a) => a.id === params.id);
  
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (attraction) {
      setActiveImage(getAttractionImage(attraction.image));
    }
  }, [attraction]);

  const allImages = useMemo(() => {
    if (!attraction) return [];
    const mainImg = getAttractionImage(attraction.image);
    const extraString = attraction.additionalImages || "";
    if (!extraString) return [mainImg];
    
    const extras = extraString
      .split(',')
      .map((url: string) => url.trim())
      .filter((url: string) => url.length > 0);
      
    return [mainImg, ...extras];
  }, [attraction]);

  const getRelatedAttractions = () => {
    if (!attraction) return [];
    return combinedAttractions
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
                className="h-9 w-auto object-contain rounded-md drop-shadow-sm"
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
          src={activeImage || getAttractionImage(attraction.image)}
          alt={attraction.nameAr}
          className="w-full h-full object-cover transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                <Translate text={attraction.category} />
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg" data-testid="text-attraction-title">
              <Translate text={attraction.nameAr} fallback={attraction.name} />
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>
                  <Translate text={attraction.wilayat} />
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{attraction.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Photo Gallery Thumbnails */}
      {allImages.length > 1 && (
        <div className="bg-slate-900 border-b border-slate-800 py-3">
          <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <span className="text-xs text-amber-500 font-bold whitespace-nowrap ml-2">معرض الصور:</span>
            {allImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                  activeImage === imgUrl ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20' : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="📸" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

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
                {language === 'ar' ? (
                  attraction.description
                ) : language === 'en' && attraction.descriptionEn ? (
                  attraction.descriptionEn
                ) : language === 'fr' && (attraction as any).descriptionFr ? (
                  (attraction as any).descriptionFr
                ) : language === 'tr' && (attraction as any).descriptionTr ? (
                  (attraction as any).descriptionTr
                ) : (
                  <Translate text={attraction.description} fallback={attraction.descriptionEn || attraction.description} />
                )}
              </p>
            </section>

            {/* Detailed Squares / Tags Section */}
            {(() => {
              const tags = Array.isArray(attraction.tags) 
                ? attraction.tags 
                : (typeof attraction.tags === 'string' && attraction.tags 
                    ? attraction.tags.split(',').map((x: string) => x.trim()).filter(Boolean) 
                    : []);
              
              if (tags.length === 0) return null;

              return (
                <section className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    {language === 'ar' ? 'الميزات والأنشطة المتوفرة بالمعلم:' : 'Available Features & Activities:'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tags.map((tag: string, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2.5 p-3.5 bg-background border border-border/80 rounded-xl hover:border-amber-500/30 hover:shadow-sm transition-all"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <span className="text-amber-500 font-bold text-xs">✦</span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold tracking-wide text-foreground">{tag}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}
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

                {(() => {
                  const mapUrl = attraction.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((attraction.nameAr || attraction.name || '') + ' Oman')}`;
                  return (
                    <a 
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="button-get-directions"
                      className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Navigation className="w-5 h-5" />
                      {t('getDirections')}
                    </a>
                  );
                })()}
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
            <img src={logoUrl} alt={t('appName')} className="h-7 w-auto object-contain rounded-md" />
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
