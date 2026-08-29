import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  ArrowRight,
  ShieldCheck,
  Key,
  ExternalLink,
  Sparkles,
  MapPin,
  CheckCircle2,
  Zap,
  Clock,
  Compass,
  ArrowUpRight,
  Layers,
  HelpCircle
} from "lucide-react";
import mutrahSouqHeroImg from "@/assets/mutrah-fort.png";

export default function TaxisPage() {
  const [, setLocation] = useLocation();
  const [partnerConfig, setPartnerConfig] = useState({
    apiKey: "ajarni_live_sk_9823418872",
    bookingUrl: "https://ajarni.om",
    webhookUrl: "https://ajarni.om/api/v1/shouma-referral",
    status: "active"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/ajarni/stats");
        if (res.ok) {
          const data = await res.json();
          setPartnerConfig({
            apiKey: data.apiKey || "ajarni_live_sk_9823418872",
            bookingUrl: data.bookingUrl || "https://ajarni.om",
            webhookUrl: data.webhookUrl || "https://ajarni.om/api/v1/shouma-referral",
            status: data.status || "active"
          });
        }
      } catch (e) {
        console.warn("Failed to load partner API config:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleGoToPartner = async (carType?: string) => {
    setIsRedirecting(true);
    try {
      await fetch("/api/ajarni/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userLocation: "منصة شومة السياحية", 
          carName: carType ? `طلب ${carType} عبر الربط المباشر` : "انتقال مباشر لمنصة التأجير المعتمدة" 
        })
      });
    } catch (e) {
      console.error("Tracking error:", e);
    }
    
    // Open partner booking URL linked via the provided API
    const targetUrl = partnerConfig.bookingUrl || "https://ajarni.om";
    window.open(targetUrl, "_blank");
    setIsRedirecting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => setLocation("/home")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm font-medium">رجوع للرئيسية</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">تأجير السيارات في عُمان</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[36vh] sm:h-[42vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${mutrahSouqHeroImg}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/30" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg" data-testid="text-page-title">
            تأجير السيارات عبر المنصة الشريكة الرسمية
          </h1>
          <p className="text-sm sm:text-base text-white/90 max-w-2xl drop-shadow" data-testid="text-page-subtitle">
            خدمة تأجير المركبات في سلطنة عُمان مربوطة مباشرة مع المنصة المعتمدة لتوفير أفضل الخيارات والأسعار فورياً وبأعلى معايير الأمان
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto -mt-10 relative z-10 space-y-8">
        
        {/* Main Gateway Card */}
        <Card className="border-primary/20 shadow-xl bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-primary to-teal-700 p-6 sm:p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>الربط الرقمي المعتمد</span>
                </div>
                <p className="text-sm text-white/90 max-w-xl">
                  يتم توجيهك فوراً إلى منصة الشريك المربوطة بمفتاح API لاختيار نوع السيارة، المدة، ونقطة الاستلام بأسعار وعقود إلكترونية موثقة.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button
                  size="lg"
                  onClick={() => handleGoToPartner()}
                  disabled={isRedirecting}
                  className="bg-white text-emerald-900 hover:bg-white/90 font-bold shadow-lg text-base h-14 px-8 gap-2 group whitespace-nowrap"
                  data-testid="button-open-car-portal"
                >
                  <span>الانتقال لمنصة حجز السيارات</span>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
                <span className="text-[11px] text-white/80 text-center">
                  يفتح في نافذة جديدة مع التحويل المباشر
                </span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>مزايا خدمة تأجير السيارات المربوطة بـ شومة:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">أسطول متكامل ومتنوع</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    سيارات دفع رباعي للطرق الوعرة والجبلية، سيارات اقتصادية داخل المدن، وسيارات فارهة وعائلية.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">تغطية لكافة محافظات عُمان</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    استلام وتسليم سلس في مطار مسقط الدولي، مطار صلالة، مطار صحار، ومختلف المحافظات والفنادق.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">تأكيد وحجز فوري عبر API</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    ارتباط مباشر وسريع يضمن توفر المركبة والأسعار المحدثة لحظة بلحظة دون أي وسيط أو تأخير.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">عقود رسمية وتأمين شامل</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    عقود إلكترونية موثقة خاضعة لكافة الأنظمة المعتمدة مع خيارات تأمين شامل ودعم فني على مدار الساعة.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Category Launchers */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3 font-medium">
                اختر الفئة المطلوبة للانتقال مباشرة لخيارات الحجز:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-center gap-1.5 border-border hover:border-primary hover:bg-primary/5"
                  onClick={() => handleGoToPartner("دفع رباعي (4x4)")}
                >
                  <Car className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold">دفع رباعي 4x4</span>
                  <span className="text-[10px] text-muted-foreground">للجبال والوديان</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-center gap-1.5 border-border hover:border-primary hover:bg-primary/5"
                  onClick={() => handleGoToPartner("سيارات اقتصادية")}
                >
                  <Car className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">اقتصادية</span>
                  <span className="text-[10px] text-muted-foreground">لتنقل يومي موفر</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-center gap-1.5 border-border hover:border-primary hover:bg-primary/5"
                  onClick={() => handleGoToPartner("سيارات عائلية / فان")}
                >
                  <Car className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold">عائلية / فان</span>
                  <span className="text-[10px] text-muted-foreground">للمجموعات والعائلات</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-center gap-1.5 border-border hover:border-primary hover:bg-primary/5"
                  onClick={() => handleGoToPartner("سيارات فاخرة")}
                >
                  <Car className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-bold">فاخرة ومميزة</span>
                  <span className="text-[10px] text-muted-foreground">لتجربة VIP راقية</span>
                </Button>
              </div>
            </div>

            {/* API Info footer note */}
            <div className="p-3.5 rounded-lg bg-muted/60 text-muted-foreground text-xs flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <span>الربط المباشر نشط بمفتاح واجهة برمجة التطبيقات API المعتمد</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-auto p-0 text-primary hover:underline gap-1"
                onClick={() => handleGoToPartner()}
              >
                <span>فتح صفحة الحجز</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            تتم عمليات تأجير المركبات عبر المنظومة الشريكة المعتمدة بسلطنة عُمان والمربوطة بـ منصة شومة السياحية.
          </p>
          <p className="text-xs text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()} شومة
          </p>
        </div>
      </footer>
    </div>
  );
}
