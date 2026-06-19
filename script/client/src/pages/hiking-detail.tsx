import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { hikingTrips, getDifficultyAr, getDifficultyColor } from "@/lib/hiking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mountain, 
  ArrowRight,
  MapPin,
  Star,
  Share2,
  Heart,
  Phone,
  Check,
  Clock,
  Ruler,
  Users,
  Calendar
} from "lucide-react";

export default function HikingDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  
  const trip = hikingTrips.find((t) => t.id === params.id);

  const getRelatedTrips = () => {
    if (!trip) return [];
    return hikingTrips
      .filter((t) => t.id !== trip.id && (t.region === trip.region || t.difficulty === trip.difficulty))
      .slice(0, 3);
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Mountain className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              الرحلة غير موجودة
            </h2>
            <p className="text-muted-foreground mb-6">
              لم نتمكن من العثور على هذه الرحلة.
            </p>
            <Button onClick={() => setLocation("/hiking")}>
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرحلات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relatedTrips = getRelatedTrips();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => setLocation("/hiking")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm font-medium">رجوع</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">تفاصيل الرحلة</span>
            </div>

            <div className="flex items-center gap-2">
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
          src={trip.image}
          alt={trip.nameAr}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Badge className={`mb-3 ${getDifficultyColor(trip.difficulty)}`}>
              {getDifficultyAr(trip.difficulty)}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg" data-testid="text-trip-title">
              {trip.nameAr}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{trip.location}، {trip.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{trip.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-about-title">
                عن الرحلة
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg" data-testid="text-trip-description">
                {trip.description}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                تفاصيل الرحلة
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-card rounded-lg border border-border text-center">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">المدة</p>
                  <p className="font-semibold">{trip.duration}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border text-center">
                  <Ruler className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">المسافة</p>
                  <p className="font-semibold">{trip.distance}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border text-center">
                  <Mountain className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">المستوى</p>
                  <p className="font-semibold">{getDifficultyAr(trip.difficulty)}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-border text-center">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">الموقع</p>
                  <p className="font-semibold">{trip.region}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                الباقة تشمل
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {trip.includes.map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-1">سعر الباقة للشخص</p>
                  <p className="text-3xl font-bold text-primary">{trip.price} ر.ع</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الموقع</p>
                    <p className="font-medium">{trip.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">التقييم</p>
                    <p className="font-medium">{trip.rating} / 5</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المدة</p>
                    <p className="font-medium">{trip.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">للحجز والاستفسار</p>
                    <a 
                      href={`tel:${trip.phone}`} 
                      className="font-medium text-primary hover:underline"
                      dir="ltr"
                      data-testid="link-trip-phone"
                    >
                      {trip.phone}
                    </a>
                  </div>
                </div>

                <Button 
                  className="w-full h-12" 
                  data-testid="button-book-now"
                  onClick={() => window.open(`tel:${trip.phone}`, '_self')}
                >
                  <Phone className="w-5 h-5 ml-2" />
                  احجز الآن
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedTrips.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              رحلات مشابهة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTrips.map((related) => (
                <Card 
                  key={related.id}
                  data-testid={`card-related-${related.id}`}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(`/hiking/${related.id}`)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className={`absolute top-2 right-2 ${getDifficultyColor(related.difficulty)}`}>
                      {getDifficultyAr(related.difficulty)}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{related.nameAr}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{related.location}</span>
                      </div>
                      <span className="font-bold text-primary">{related.price} ر.ع</span>
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
          <p className="text-sm text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()} شومة
          </p>
        </div>
      </footer>
    </div>
  );
}
