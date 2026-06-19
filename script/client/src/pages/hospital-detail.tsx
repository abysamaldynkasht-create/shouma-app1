import { useLocation, useParams } from "wouter";
import { hospitals, getTypeColor } from "@/lib/hospitals";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hospital, 
  ArrowRight,
  MapPin,
  Star,
  Share2,
  Heart,
  Phone,
  Check,
  Clock,
  AlertCircle,
  Navigation
} from "lucide-react";

export default function HospitalDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  
  const hospital = hospitals.find((h) => h.id === params.id);

  const getRelatedHospitals = () => {
    if (!hospital) return [];
    return hospitals
      .filter((h) => h.id !== hospital.id && (h.region === hospital.region || h.type === hospital.type))
      .slice(0, 3);
  };

  if (!hospital) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Hospital className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              المستشفى غير موجود
            </h2>
            <p className="text-muted-foreground mb-6">
              لم نتمكن من العثور على هذا المستشفى.
            </p>
            <Button onClick={() => setLocation("/hospitals")}>
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للمستشفيات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relatedHospitals = getRelatedHospitals();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => setLocation("/hospitals")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm font-medium">رجوع</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">تفاصيل المستشفى</span>
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
          src={hospital.image}
          alt={hospital.nameAr}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getTypeColor(hospital.type)}>
                {hospital.typeAr}
              </Badge>
              {hospital.isGovernment && (
                <Badge className="bg-blue-600 text-white">حكومي</Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg" data-testid="text-hospital-title">
              {hospital.nameAr}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{hospital.location}، {hospital.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{hospital.rating}</span>
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
                عن المستشفى
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg" data-testid="text-hospital-description">
                {hospital.description}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                الخدمات المتوفرة
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {hospital.services.map((service) => (
                  <div key={service} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center pb-4 border-b border-border">
                  <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center mx-auto mb-3">
                    <Hospital className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold">{hospital.nameAr}</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الموقع</p>
                    <p className="font-medium">{hospital.location}</p>
                    {hospital.address && (
                      <p className="text-sm text-muted-foreground" dir="ltr">{hospital.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ساعات العمل</p>
                    <p className="font-medium">{hospital.workingHours}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <a 
                      href={`tel:${hospital.phone}`} 
                      className="font-medium text-primary hover:underline"
                      dir="ltr"
                      data-testid="link-hospital-phone"
                    >
                      {hospital.phone}
                    </a>
                  </div>
                </div>

                {hospital.emergencyPhone && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">طوارئ</p>
                      <a 
                        href={`tel:${hospital.emergencyPhone}`} 
                        className="font-bold text-red-600 dark:text-red-400 hover:underline text-lg"
                        dir="ltr"
                        data-testid="link-emergency-phone"
                      >
                        {hospital.emergencyPhone}
                      </a>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full h-12" 
                  data-testid="button-call-now"
                  onClick={() => window.open(`tel:${hospital.phone}`, '_self')}
                >
                  <Phone className="w-5 h-5 ml-2" />
                  اتصل الآن
                </Button>

                {hospital.mapUrl && (
                  <Button 
                    variant="outline"
                    className="w-full h-12" 
                    data-testid="button-view-map"
                    onClick={() => window.open(hospital.mapUrl, '_blank')}
                  >
                    <Navigation className="w-5 h-5 ml-2" />
                    الموقع في جوجل ماب
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedHospitals.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              مستشفيات أخرى قريبة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedHospitals.map((related) => (
                <Card 
                  key={related.id}
                  data-testid={`card-related-${related.id}`}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(`/hospitals/${related.id}`)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className={`absolute top-2 right-2 ${getTypeColor(related.type)}`}>
                      {related.typeAr}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{related.nameAr}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{related.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{related.rating}</span>
                      </div>
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
