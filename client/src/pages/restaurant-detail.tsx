import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { restaurants } from "@/lib/restaurants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Translate } from "@/components/Translate";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  UtensilsCrossed, 
  ArrowRight, 
  ArrowLeft,
  MapPin, 
  Star, 
  Share2, 
  Heart, 
  Phone, 
  Check, 
  Clock, 
  Navigation,
  Sparkles
} from "lucide-react";

export default function RestaurantDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { t, isRTL } = useLanguage();
  const [isSaved, setIsSaved] = useState(false);
  const [dbRestaurant, setDbRestaurant] = useState<any | null>(null);

  useEffect(() => {
    if (params.id && params.id.startsWith("db-")) {
      const realId = params.id.replace("db-", "");
      fetch(`/api/catalog/restaurants/${realId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setDbRestaurant(data);
        })
        .catch(() => {});
    }
  }, [params.id]);

  const staticRest = restaurants.find((r) => r.id === params.id);
  const restaurant = dbRestaurant ? {
    id: "db-" + dbRestaurant.id,
    name: dbRestaurant.name,
    nameAr: dbRestaurant.name_ar || dbRestaurant.nameAr || dbRestaurant.name,
    description: dbRestaurant.description_ar || dbRestaurant.description || "",
    city: dbRestaurant.city || "سلطنة عمان",
    region: dbRestaurant.region || "عمان",
    image: dbRestaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    cuisine: dbRestaurant.cuisine || "مأكولات متنوعة",
    priceRange: dbRestaurant.price_range || "moderate",
    rating: dbRestaurant.rating || 4.8,
    features: ["جلسات عائلية", "مذاق أصيل", "خدمة سريعة", "موقف سيارات"],
    mapUrl: dbRestaurant.map_url || null,
    phone: dbRestaurant.phone || "+968 2400 0000"
  } : staticRest;

  const getRelatedRestaurants = () => {
    if (!restaurant) return [];
    return restaurants
      .filter((r) => r.id !== restaurant.id)
      .slice(0, 3);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant?.nameAr || "مطعم في عُمان",
          text: restaurant?.description || "",
          url: window.location.href,
        });
      } catch {
        // Share cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isRTL ? "تم نسخ الرابط بنجاح" : "Link copied to clipboard");
    }
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              المطعم غير موجود
            </h2>
            <p className="text-muted-foreground mb-6">
              لم نتمكن من العثور على هذا المطعم في دليل شومة.
            </p>
            <Button onClick={() => setLocation("/restaurants")}>
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة لقائمة المطاعم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const related = getRelatedRestaurants();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => setLocation("/restaurants")}
              className="gap-2"
              data-testid="button-back"
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{isRTL ? "المطاعم والمقاهي" : "Restaurants & Cafes"}</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSaved(!isSaved)}
                data-testid="button-save"
                className={isSaved ? "text-destructive" : ""}
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              </Button>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] max-h-[450px]">
        <img
          src={restaurant.image}
          alt={restaurant.nameAr}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-primary text-primary-foreground font-bold">
              <Translate text={restaurant.cuisine} />
            </Badge>
            <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
              {restaurant.priceRange === "budget" ? "اقتصادي $" : restaurant.priceRange === "moderate" ? "متوسط $$" : "فاخر $$$"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
            {restaurant.nameAr}
          </h1>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{restaurant.city}، {restaurant.region}</span>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card p-6 rounded-2xl border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">
                عن المطعم والمأكولات
              </h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                {restaurant.description}
              </p>
            </section>

            {restaurant.features && restaurant.features.length > 0 && (
              <section className="bg-card p-6 rounded-2xl border border-border">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>المميزات والخدمات</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {restaurant.features.map((feature: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded-xl bg-accent/40 text-xs font-semibold text-foreground"
                    >
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{restaurant.rating} / 5</span>
                  </div>
                  <span className="text-xs text-muted-foreground">تقييم الزوار</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">الموقع</p>
                      <p className="font-medium">{restaurant.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">نوع المطبخ</p>
                      <p className="font-medium">{restaurant.cuisine}</p>
                    </div>
                  </div>
                </div>

                {restaurant.mapUrl && (
                  <a
                    href={restaurant.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>الاتجاهات على خرائط جوجل</span>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Related Restaurants */}
        {related.length > 0 && (
          <section className="mt-14 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              مطاعم ومقاهي أخرى مقترحة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Card
                  key={rel.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setLocation(`/restaurants/${rel.id}`)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.nameAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                      {rel.nameAr}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {rel.city} • {rel.cuisine}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
