import { useState } from "react";
import { useLocation } from "wouter";
import { restaurants } from "@/lib/restaurants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  UtensilsCrossed, 
  ArrowRight,
  ArrowLeft,
  MapPin,
  Star,
  Search
} from "lucide-react";
import baitAlmadghootHeroImg from "@/assets/bait-almadghoot.png";

export default function RestaurantsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const { t, isRTL } = useLanguage();

  const cuisines = [
    { key: "all", label: t('all') },
    { key: "omani", label: "عُماني تقليدي" },
    { key: "seafood", label: "مأكولات بحرية" },
    { key: "arabic", label: "عربي متنوع" },
    { key: "modern", label: "عُماني معاصر" },
  ];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.nameAr.includes(searchQuery) || 
                          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          restaurant.description.includes(searchQuery) ||
                          restaurant.city.includes(searchQuery);
    const matchesCuisine = selectedCuisine === "all" || 
                           (selectedCuisine === "omani" && restaurant.cuisine.includes("عُماني")) ||
                           (selectedCuisine === "seafood" && restaurant.cuisine.includes("بحرية")) ||
                           (selectedCuisine === "arabic" && restaurant.cuisine.includes("عربي")) ||
                           (selectedCuisine === "modern" && restaurant.cuisine.includes("معاصر"));
    return matchesSearch && matchesCuisine;
  });

  const getPriceRangeLabel = (range: string) => {
    const labels: Record<string, string> = {
      budget: t('priceBudget'),
      moderate: t('priceModerate'),
      expensive: t('priceExpensive'),
      luxury: t('priceLuxury'),
    };
    return labels[range] || range;
  };

  const getPriceRangeSymbol = (range: string) => {
    const symbols: Record<string, string> = {
      budget: "﷼",
      moderate: "﷼﷼",
      expensive: "﷼﷼﷼",
      luxury: "﷼﷼﷼﷼",
    };
    return symbols[range] || range;
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
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('restaurants')}</span>
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
            backgroundImage: `url('${baitAlmadghootHeroImg}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg" data-testid="text-page-title">
            {t('bestRestaurants')}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mb-6 drop-shadow" data-testid="text-page-subtitle">
            {t('discoverRestaurants')}
          </p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                data-testid="input-search"
                type="text"
                placeholder={t('searchRestaurant')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pr-12 text-base"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {cuisines.map((cuisine) => (
                <Button
                  key={cuisine.key}
                  data-testid={`button-cuisine-${cuisine.key}`}
                  variant={selectedCuisine === cuisine.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCuisine(cuisine.key)}
                  className="h-12"
                >
                  {cuisine.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">
            {filteredRestaurants.length} {t('restaurantCount')}
          </p>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('noResults')}</h3>
            <p className="text-muted-foreground">{t('tryDifferentSearch')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                data-testid={`card-restaurant-${restaurant.id}`}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setLocation(`/restaurants/${restaurant.id}`)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.nameAr}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-foreground backdrop-blur-sm">
                      {restaurant.cuisine}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-black/60 text-white">
                      {getPriceRangeSymbol(restaurant.priceRange)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {restaurant.nameAr}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{restaurant.city}، {restaurant.region}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{restaurant.rating}</span>
                    </div>
                    <Badge variant="outline">{getPriceRangeLabel(restaurant.priceRange)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
