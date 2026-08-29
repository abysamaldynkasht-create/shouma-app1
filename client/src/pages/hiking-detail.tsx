import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";
import { hikingTrips, getDifficultyAr, getDifficultyColor } from "@/lib/hiking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Calendar,
  X,
  CreditCard,
  Loader2,
  CheckCircle2,
  Lock
} from "lucide-react";
import { SiPaypal, SiApplepay, SiVisa, SiMastercard } from "react-icons/si";
import { useLanguage } from "@/contexts/LanguageContext";
import { Translate } from "@/components/Translate";


interface Gateway {
  id: number;
  gateway_name: string;
  is_active: boolean;
  details: string;
}

export default function HikingDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { formatPrice } = useCurrency();
  
  // Core dynamic list
  const [dbTrips, setDbTrips] = useState<any[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(false);

  // Modal / Checkout state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"booking_form" | "payment_card" | "paying" | "success">("booking_form");
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    attendees: "1",
    date: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: ""
  });

  useEffect(() => {
    // Fetch trips
    fetch("/api/hiking-trips")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbTrips(data);
        }
      })
      .catch(err => console.error("Error fetching hiking trips:", err));

    // Fetch active gateways
    setLoadingGateways(true);
    fetch("/api/hiking-payments")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGateways(data);
          if (data.length > 0) {
            setSelectedGateway(data[0].gateway_name);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingGateways(false));
  }, []);

  const combinedTrips = (() => {
    const dbNames = new Set(dbTrips.map(t => (t.name_ar || t.nameAr || "").trim()));
    const normalizedStatic = hikingTrips.filter(s => !dbNames.has((s.nameAr || "").trim()));
    
    return [
      ...dbTrips.map(t => ({
        id: String(t.id),
        name: t.name || t.name_ar,
        nameAr: t.name_ar || t.nameAr || t.name,
        name_ar: t.name_ar,
        description: t.description || "",
        location: t.location || "",
        region: t.region || "الداخلية",
        image: t.image || "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800",
        difficulty: t.difficulty || "easy",
        duration: t.duration || "يوم واحد",
        distance: t.distance || "5 كم",
        price: Number(t.price) || 30,
        phone: t.phone || "+968 9123 4567",
        rating: t.rating || "4.8",
        includes: Array.isArray(t.includes) ? t.includes : []
      })),
      ...normalizedStatic.map(s => ({
        id: String(s.id),
        name: s.name,
        nameAr: s.nameAr,
        name_ar: s.nameAr,
        description: s.description,
        location: s.location,
        region: s.region,
        image: s.image,
        difficulty: s.difficulty,
        duration: s.duration,
        distance: s.distance,
        price: s.price,
        phone: s.phone,
        rating: "4.8",
        includes: s.includes
      }))
    ];
  })();

  const trip = combinedTrips.find((t) => t.id === params.id);

  const getRelatedTrips = () => {
    if (!trip) return [];
    return combinedTrips
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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStep("paying");
    
    try {
      const payload = {
        tripId: parseInt(trip.id, 10),
        tripName: trip.nameAr,
        fullName: bookingForm.fullName,
        phone: bookingForm.phone,
        email: bookingForm.email,
        attendees: parseInt(bookingForm.attendees, 10) || 1,
        bookingDate: bookingForm.date,
        paidAmount: trip.price * Number(bookingForm.attendees || 1),
        paymentGateway: selectedGateway || "البطاقة الائتمانية",
        cardNumber: bookingForm.cardNumber,
        cardExpiry: bookingForm.cardExpiry,
        cardCvv: bookingForm.cardCvv,
        cardName: bookingForm.cardName
      };

      const response = await fetch("/api/hiking-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setPaymentStep("success");
      } else {
        alert(data.message || "حدث خطأ أثناء معالجة بيانات الحجز. يرجى المحاولة مرة أخرى.");
        setPaymentStep("payment_card");
      }
    } catch (err) {
      console.error(err);
      alert("عذراً، تعذر الاتصال بالخادم لإجراء عملية الحجز.");
      setPaymentStep("payment_card");
    }
  };

  const closePaymentModal = () => {
    setIsPaymentOpen(false);
    setPaymentStep("booking_form");
    setBookingForm({
      fullName: "",
      phone: "",
      email: "",
      attendees: "1",
      date: "",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: ""
    });
  };

  // Helper formatting for credit card inputs
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
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
              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
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
        <div className="absolute bottom-6 right-0 left-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Badge className={`mb-3 ${getDifficultyColor(trip.difficulty)} text-sm px-3 py-1`}>
              <Translate text={getDifficultyAr(trip.difficulty)} />
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              <Translate text={trip.nameAr} />
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span className="text-base font-medium"><Translate text={trip.location} /></span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4"><Translate text="تفاصيل المغامرة" /></h2>
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                <Translate text={trip.description} />
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="bg-emerald-500/5 border-emerald-500/10">
                <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2">
                  <Clock className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs text-muted-foreground"><Translate text="المدة" /></span>
                  <span className="font-bold text-sm text-foreground"><Translate text={trip.duration} /></span>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/5 border-emerald-500/10">
                <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2">
                  <Ruler className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs text-muted-foreground"><Translate text="المسافة" /></span>
                  <span className="font-bold text-sm text-foreground"><Translate text={trip.distance} /></span>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/5 border-emerald-500/10">
                <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2">
                  <Users className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs text-muted-foreground"><Translate text="المجموعة" /></span>
                  <span className="font-bold text-sm text-foreground"><Translate text="مختلط / عائلات" /></span>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/5 border-emerald-500/10">
                <CardContent className="p-4 flex flex-col items-center text-center justify-center space-y-2">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs text-muted-foreground"><Translate text="التوفر" /></span>
                  <span className="font-bold text-sm text-foreground"><Translate text="طوال العام" /></span>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-4"><Translate text="ماذا تشمل المغامرة؟" /></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(trip.includes || []).map((incl: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 bg-muted/40 p-3 rounded-lg border border-border">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground"><Translate text={incl} /></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-emerald-500/20 shadow-xl overflow-hidden">
              <div className="bg-emerald-600 text-white p-6 text-center">
                <span className="text-sm text-emerald-100">سعر الفرد</span>
                <div className="text-3xl font-bold">{formatPrice(trip.price)}</div>
              </div>
              <CardContent className="p-6 space-y-6">
                
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">التقييم</p>
                    <p className="font-medium">{trip.rating} / 5</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المدة</p>
                    <p className="font-medium">{trip.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">للحجز والاستفسار</p>
                    <a 
                      href={`tel:${trip.phone}`} 
                      className="font-medium text-primary hover:underline"
                      dir="ltr"
                    >
                      {trip.phone}
                    </a>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white" 
                  onClick={() => setIsPaymentOpen(true)}
                >
                  <CreditCard className="w-5 h-5 ml-2" />
                  احجز الآن ودفع آمن
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
                      <span className="font-bold text-primary">{formatPrice(related.price)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-border mt-12 bg-muted/20">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} شومة</p>
        </div>
      </footer>

      {/* --- PAYMENT POP_UP MODAL WITH CREDIT CARD METHOD --- */}
      <Dialog open={isPaymentOpen} onOpenChange={(open) => { if (!open) closePaymentModal(); }}>
        <DialogContent className="sm:max-w-lg dir-rtl font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-foreground flex items-center justify-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              إتمـام الحجز والدفـع الآمن
            </DialogTitle>
          </DialogHeader>

          {/* STEP 1: BOOKING FORM */}
          {paymentStep === "booking_form" && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setPaymentStep("payment_card");
              }} 
              className="space-y-5 text-right"
            >
              <p className="text-xs text-muted-foreground text-center">احجز رحلتك فوراً باستخدام قنوات الدفع المشفرة الآمنة</p>
              
              {/* Trip Info Quick review */}
              <div className="bg-muted/40 p-4 rounded-xl flex justify-between items-center border border-border">
                <div className="text-right">
                  <h4 className="font-bold text-foreground text-sm">{trip.nameAr}</h4>
                  <span className="text-xs text-muted-foreground">{trip.location}</span>
                </div>
                <div className="text-left">
                  <span className="text-xs text-muted-foreground block">سعر التذكرة</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatPrice(trip.price)} / شخص
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="hFullName" className="text-xs text-muted-foreground">الاسم الكامل للمشترك</Label>
                <Input 
                  id="hFullName"
                  placeholder="مثال: عبدالله الحارثي" 
                  value={bookingForm.fullName} 
                  onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
                  className="bg-background border-border text-foreground text-right h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="hPhone" className="text-xs text-muted-foreground">رقم الهاتف</Label>
                  <Input 
                    id="hPhone"
                    placeholder="968xxxxxx" 
                    type="tel"
                    value={bookingForm.phone} 
                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    className="bg-background border-border text-foreground text-right font-mono h-10"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hEmail" className="text-xs text-muted-foreground">البريد الإلكتروني</Label>
                  <Input 
                    id="hEmail"
                    placeholder="example@domain.com" 
                    type="email"
                    value={bookingForm.email} 
                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                    className="bg-background border-border text-foreground text-right font-mono h-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="hAttendees" className="text-xs text-muted-foreground">عدد المغامرين</Label>
                  <select 
                    id="hAttendees"
                    value={bookingForm.attendees} 
                    onChange={(e) => setBookingForm({...bookingForm, attendees: e.target.value})}
                    className="w-full bg-background border border-border p-2 rounded-md text-sm text-foreground h-10"
                  >
                    <option value="1">1 فرد</option>
                    <option value="2">2 فردين</option>
                    <option value="3">3 أفراد</option>
                    <option value="4">4 أفراد</option>
                    <option value="5">5 أفراد</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hDate" className="text-xs text-muted-foreground">تاريخ الرحلة المفضل</Label>
                  <Input 
                    id="hDate"
                    type="date"
                    value={bookingForm.date} 
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    className="bg-background border-border text-foreground h-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer mt-2 text-center">
                المتابعة لاختيار وسيلة الدفع ({formatPrice(trip.price * Number(bookingForm.attendees || 1))})
              </Button>
            </form>
          )}

          {/* STEP 2: CREDIT CARD & GATEWAY DETAILS */}
          {paymentStep === "payment_card" && (
            <form onSubmit={handleBookingSubmit} className="space-y-5 text-right">
              
              {/* Trip Info Quick review */}
              <div className="bg-muted/40 p-4 rounded-xl flex justify-between items-center border border-border">
                <div className="text-right">
                  <h4 className="font-bold text-foreground text-sm">{trip.nameAr}</h4>
                  <span className="text-xs text-muted-foreground">عدد المشتركين: {bookingForm.attendees}</span>
                </div>
                <div className="text-left">
                  <span className="text-xs text-muted-foreground block">إجمالي المبلغ</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                    {formatPrice(trip.price * Number(bookingForm.attendees || 1))}
                  </span>
                </div>
              </div>

              {/* Gateway Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">طريقة الدفع وقناة السداد</Label>
                {gateways.length === 0 ? (
                  // Default elegant grid cards if admin has not configured any custom gateways yet
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedGateway("البطاقة الائتمانية")}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                        selectedGateway === "البطاقة الائتمانية" || !selectedGateway
                          ? "border-emerald-600 bg-emerald-500/5 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-400/5 dark:text-emerald-400"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs font-semibold">بطاقة دفع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGateway("PayPal")}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                        selectedGateway === "PayPal"
                          ? "border-emerald-600 bg-emerald-500/5 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-400/5 dark:text-emerald-400"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <SiPaypal className="w-5 h-5 text-[#003087] dark:text-blue-400" />
                      <span className="text-xs font-semibold">PayPal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedGateway("Apple Pay")}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                        selectedGateway === "Apple Pay"
                          ? "border-emerald-600 bg-emerald-500/5 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-400/5 dark:text-emerald-400"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <SiApplepay className="w-5 h-5" />
                      <span className="text-xs font-semibold">Apple Pay</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {gateways.map((g) => {
                      let detailText = g.details;
                      try {
                        if (g.details && g.details.startsWith("{") && g.details.endsWith("}")) {
                          const parsed = JSON.parse(g.details);
                          if (parsed && parsed.text !== undefined) {
                            detailText = parsed.text;
                          }
                        }
                      } catch (e) {
                        //plain text fallback
                      }
                      return (
                        <div 
                          key={g.id} 
                          onClick={() => setSelectedGateway(g.gateway_name)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            selectedGateway === g.gateway_name 
                              ? "bg-emerald-500/5 border-emerald-500" 
                              : "bg-muted/30 border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedGateway === g.gateway_name ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground'}`}>
                            {selectedGateway === g.gateway_name && <span className="w-1.5 h-1.5 rounded-full bg-background" />}
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-foreground block">{g.gateway_name}</span>
                            <span className="text-[10px] text-muted-foreground">{detailText}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DYNAMIC VIEW BASED ON ACTIVE GATEWAY */}
              {(selectedGateway === "PayPal" || selectedGateway.toLowerCase().includes("paypal")) ? (
                <div className="text-center py-5 bg-muted/20 rounded-xl border border-dashed border-border">
                  <div className="w-14 h-14 rounded-full bg-[#003087]/10 flex items-center justify-center mx-auto mb-3">
                    <SiPaypal className="w-7 h-7 text-[#003087]" />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">المتابعة عبر PayPal</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">سيتم ربطك ببوابة باي بال العالمية لإتمام المعاملة فوراً وبأمان كامل</p>
                </div>
              ) : (selectedGateway === "Apple Pay" || selectedGateway.toLowerCase().includes("apple")) ? (
                <div className="text-center py-5 bg-muted/20 rounded-xl border border-dashed border-border font-sans">
                  <div className="w-14 h-14 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-3">
                    <SiApplepay className="w-9 h-9 text-foreground" />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1 font-bold">الدفع بـ Apple Pay</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">استخدم الحساب المدون وبصمتك لتأكيد التحويل مباشرة</p>
                </div>
              ) : (
                /* CREDIT CARD DETAILED METHOD */
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2 text-foreground">
                    <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold">بيانات بطاقة الائتمان (Visa / MasterCard)</span>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="hCardNo" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">رقم البطاقة</Label>
                    <div className="relative">
                      <Input 
                        id="hCardNo"
                        placeholder="4000 1234 5678 9010" 
                        maxLength={19}
                        value={bookingForm.cardNumber} 
                        onChange={(e) => setBookingForm({...bookingForm, cardNumber: formatCardNumber(e.target.value)})}
                        className="bg-background border-border text-foreground font-mono tracking-widest pl-10 text-right h-10"
                        required
                      />
                      <CreditCard className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="hCardExpiry" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground font-sans">تاريخ الانتهاء</Label>
                      <Input 
                        id="hCardExpiry"
                        placeholder="12/28" 
                        maxLength={5}
                        value={bookingForm.cardExpiry} 
                        onChange={(e) => setBookingForm({...bookingForm, cardExpiry: formatExpiry(e.target.value)})}
                        className="bg-background border-border text-foreground font-mono text-center h-10"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="hCardCvv" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">رمز الأمان (CVV)</Label>
                      <Input 
                        id="hCardCvv"
                        placeholder="***" 
                        maxLength={3}
                        type="password"
                        value={bookingForm.cardCvv} 
                        onChange={(e) => setBookingForm({...bookingForm, cardCvv: e.target.value})}
                        className="bg-background border-border text-foreground font-mono text-center h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="hCardHolder" className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">اسم صاحب البطاقة</Label>
                    <Input 
                      id="hCardHolder"
                      placeholder="ABDALLAH AL HARTHY" 
                      value={bookingForm.cardName} 
                      onChange={(e) => setBookingForm({...bookingForm, cardName: e.target.value.toUpperCase()})}
                      className="bg-background border-border text-foreground font-mono text-right h-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  onClick={() => setPaymentStep("booking_form")}
                  className="w-1/3 h-11 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs cursor-pointer border border-border"
                >
                  رجوع لتعديل البيانات
                </Button>
                <Button 
                  type="submit" 
                  className="w-2/3 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  تأكيـد ودفع الحساب
                </Button>
              </div>

              <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 leading-relaxed bg-muted/20 py-2 px-3 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>جميع قنوات شومة باي مشفرة بالكامل طبقاً لأعلى مواصفات السداد الائتماني PCI العالمي</span>
              </p>
            </form>
          )}

          {/* STEP 3: LOADER / PROCESSING */}
          {paymentStep === "paying" && (
            <div className="p-12 text-center flex flex-col justify-center items-center space-y-4">
              <Loader2 className="w-14 h-14 animate-spin text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-1">
                <h4 className="font-bold text-base text-foreground">جارٍ معالجة تفاصيل السداد والمطابقة...</h4>
                <p className="text-xs text-muted-foreground">يرجى الانتظار، نتواصل مع بوابة الخصم المباشر للحجز التلقائي</p>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS STATE */}
          {paymentStep === "success" && (
            <div className="py-6 text-center flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-foreground">تم الدفع وتأكيد السداد بنجاح!</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  تهانينا يا <strong className="text-emerald-600 dark:text-emerald-400">{bookingForm.fullName || "مغامر شومة"}</strong>! تم تسجيل حجزك فوراً في: 
                  <span className="block font-bold text-foreground mt-1">"{trip.nameAr}"</span>
                </p>
              </div>

              {/* Booking receipt details card */}
              <div className="bg-muted/40 border border-border p-4 rounded-xl w-full text-right text-xs space-y-2 text-muted-foreground">
                <div className="flex justify-between border-b border-border pb-2 mb-1 text-foreground font-bold">
                  <span>تفاصيل الحجز والسداد</span>
                  <span>المعطيات</span>
                </div>
                <div className="flex justify-between">
                  <span>رقم المعاملة:</span>
                  <span className="font-mono text-foreground font-semibold">SHM-TXN-{Math.floor(Math.random() * 90000) + 10000}</span>
                </div>
                <div className="flex justify-between">
                  <span>عدد المغامرين:</span>
                  <span className="text-foreground font-bold">{bookingForm.attendees} فرد</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ المغامرة:</span>
                  <span className="text-foreground font-bold">{bookingForm.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>المبلغ المدفوع:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPrice(trip.price * Number(bookingForm.attendees || 1))}</span>
                </div>
                <div className="flex justify-between">
                  <span>بوابة الدفع المستخدمة:</span>
                  <span className="text-foreground">{selectedGateway || "البطاقة الائتمانية"}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                سيتواصل معك منسق الرحلة عبر واتساب قريباً على رقم الهاتف لجمع التفاصيل ومشاركتك بموقع الانطلاق.
              </p>

              <Button onClick={closePaymentModal} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11">
                إغلاق والعودة للتفاصيل
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
  );
}
