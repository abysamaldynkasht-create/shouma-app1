import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { attractions, governorates, wilayatsByGovernorate, getAttractionImage } from "@/lib/attractions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowRight,
  ArrowLeft,
  MapPin,
  Star,
  Search,
  Map,
  Building2,
  Navigation,
  Globe
} from "lucide-react";
import logoUrl from "@assets/شومة_1768320219408.jpg";
import mutrahSouqHeroImg from "@/assets/mutrah-souq.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { languages } from "@/lib/translations";

export default function AttractionsPage() {
  const [, setLocation] = useLocation();
  const { language, setLanguage, t, direction } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("all");
  const [selectedWilayat, setSelectedWilayat] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const availableWilayats = useMemo(() => {
    if (selectedGovernorate === "all") return [];
    return wilayatsByGovernorate[selectedGovernorate] || [];
  }, [selectedGovernorate]);

  const categories = useMemo(() => {
    const cats = new Set(attractions.map(a => a.category));
    return Array.from(cats).sort();
  }, []);

  const filteredAttractions = useMemo(() => {
    return attractions.filter((attraction) => {
      const matchesSearch = attraction.nameAr.includes(searchQuery) || 
                            attraction.description.includes(searchQuery) ||
                            attraction.wilayat.includes(searchQuery) ||
                            attraction.governorate.includes(searchQuery);
      const matchesGovernorate = selectedGovernorate === "all" || attraction.governorateId === selectedGovernorate;
      const matchesWilayat = selectedWilayat === "all" || attraction.wilayat === selectedWilayat;
      const matchesCategory = selectedCategory === "all" || attraction.category === selectedCategory;
      return matchesSearch && matchesGovernorate && matchesWilayat && matchesCategory;
    });
  }, [searchQuery, selectedGovernorate, selectedWilayat, selectedCategory]);

  const handleGovernorateChange = (value: string) => {
    setSelectedGovernorate(value);
    setSelectedWilayat("all");
  };

  return (
    <div className="min-h-screen bg-background" dir={direction}>
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
              <img 
                src={logoUrl} 
                alt={t('appName')} 
                className="w-8 h-8 rounded-full object-cover mix-blend-multiply dark:mix-blend-screen dark:invert"
              />
              <span className="text-lg font-bold">{t('attractions')}</span>
            </div>

            <div className="flex items-center gap-2">
            <ThemeToggle />
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
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-[40vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${mutrahSouqHeroImg}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg" data-testid="text-page-title">
            {t('discoverBestPlaces')}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mb-4 drop-shadow" data-testid="text-page-subtitle">
            {t('moreThanPlaces')} {attractions.length} {t('placesIn')} {governorates.length} {t('governorates')}
          </p>
        </div>
      </section>

      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="relative">
            <Input
              data-testid="input-search"
              type="search"
              placeholder={t('searchAttraction')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-12 ${direction === 'rtl' ? 'pr-5 pl-12' : 'pl-5 pr-12'}`}
            />
            <Search className={`absolute ${direction === 'rtl' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {t('governorate')}
              </label>
              <Select value={selectedGovernorate} onValueChange={handleGovernorateChange}>
                <SelectTrigger data-testid="select-governorate">
                  <SelectValue placeholder={t('selectGovernorate')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allGovernorates')}</SelectItem>
                  {governorates.map((gov) => (
                    <SelectItem key={gov.id} value={gov.id}>
                      {gov.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('wilayat')}
              </label>
              <Select 
                value={selectedWilayat} 
                onValueChange={setSelectedWilayat}
                disabled={selectedGovernorate === "all"}
              >
                <SelectTrigger data-testid="select-wilayat">
                  <SelectValue placeholder={t('selectWilayat')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allWilayats')}</SelectItem>
                  {availableWilayats.map((wilayatItem, index) => (
                    <SelectItem key={`${wilayatItem}-${index}`} value={wilayatItem}>
                      {wilayatItem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Map className="w-4 h-4" />
                {t('category')}
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.map((cat, index) => (
                    <SelectItem key={`${cat}-${index}`} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(selectedGovernorate !== "all" || selectedCategory !== "all" || searchQuery) && (
            <div className="flex flex-wrap gap-2">
              {selectedGovernorate !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {governorates.find(g => g.id === selectedGovernorate)?.nameAr}
                  <button 
                    data-testid="button-clear-governorate"
                    onClick={() => handleGovernorateChange("all")}
                    className={`${direction === 'rtl' ? 'mr-1' : 'ml-1'} hover:text-destructive`}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedWilayat !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedWilayat}
                  <button 
                    data-testid="button-clear-wilayat"
                    onClick={() => setSelectedWilayat("all")}
                    className={`${direction === 'rtl' ? 'mr-1' : 'ml-1'} hover:text-destructive`}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedCategory}
                  <button 
                    data-testid="button-clear-category"
                    onClick={() => setSelectedCategory("all")}
                    className={`${direction === 'rtl' ? 'mr-1' : 'ml-1'} hover:text-destructive`}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t('searchFor')} {searchQuery}
                  <button 
                    data-testid="button-clear-search"
                    onClick={() => setSearchQuery("")}
                    className={`${direction === 'rtl' ? 'mr-1' : 'ml-1'} hover:text-destructive`}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-results-count">
              {filteredAttractions.length} {t('attractionCount')}
            </h2>
          </div>

          {filteredAttractions.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('noResults')}</h3>
              <p className="text-muted-foreground">{t('changeFilters')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAttractions.map((attraction) => (
                <Card 
                  key={attraction.id}
                  data-testid={`card-attraction-${attraction.id}`}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setLocation(`/attractions/${attraction.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getAttractionImage(attraction.image)}
                      alt={attraction.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-foreground text-xs">
                        {attraction.category}
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{attraction.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1" data-testid={`text-attraction-name-${attraction.id}`}>
                      {attraction.nameAr}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{attraction.wilayat}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {attraction.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {attraction.governorate}
                      </Badge>
                      <Button
                        size="sm"
                        data-testid={`button-map-${attraction.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (attraction.mapUrl) {
                            const newWindow = window.open(attraction.mapUrl, '_blank', 'noopener,noreferrer');
                            if (newWindow) newWindow.opener = null;
                          }
                        }}
                        className="gap-1"
                      >
                        <Navigation className="w-4 h-4" />
                        {t('mapButton')}
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
