import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Compass,
  MapPin,
  Clock,
  Trash2,
  ExternalLink,
  Hotel,
  Car,
  Mountain,
  AlertCircle,
  Briefcase,
  Search,
  User,
  Phone,
  Mail,
  CheckCircle,
  Loader2,
  Save,
  Navigation
} from "lucide-react";

export default function MyBookingsPage() {
  const [, setLocation] = useLocation();
  const { isRTL, language, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const username = localStorage.getItem("shouma-username") || "guest";

  const [activeTab, setActiveTab] = useState<"itineraries" | "bookings">("itineraries");
  const [bookingFilter, setBookingFilter] = useState<"all" | "hotels" | "hiking" | "cars">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);

  // Load Saved Itineraries from LocalStorage
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem("shouma_saved_itineraries");
      if (savedRaw) {
        setSavedItineraries(JSON.parse(savedRaw));
      }
    } catch (e) {
      console.error("Error loading saved itineraries:", e);
    }
  }, []);

  // Fetch Hotel Bookings
  const { data: hotelBookings = [], isLoading: loadingHotels } = useQuery<any[]>({
    queryKey: ["/api/hotel-bookings"],
    queryFn: async () => {
      const res = await fetch("/api/hotel-bookings");
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch Hiking Bookings
  const { data: hikingBookings = [], isLoading: loadingHiking } = useQuery<any[]>({
    queryKey: ["/api/hiking-bookings"],
    queryFn: async () => {
      const res = await fetch("/api/hiking-bookings");
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch Car Bookings
  const { data: carBookings = [], isLoading: loadingCars } = useQuery<any[]>({
    queryKey: ["/api/car-bookings"],
    queryFn: async () => {
      const res = await fetch("/api/car-bookings");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const isLoading = loadingHotels || loadingHiking || loadingCars;

  // Filter Saved Itineraries
  const filteredItineraries = (Array.isArray(savedItineraries) ? savedItineraries : []).filter((it: any) => {
    if (!searchQuery) return true;
    const title = it.title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter Bookings matching user details
  const filteredBookings = (() => {
    let list: any[] = [];

    // Add Hotel Bookings
    (Array.isArray(hotelBookings) ? hotelBookings : []).forEach((b: any) => {
      list.push({
        ...b,
        type: "hotel",
        date: b.bookingDate || b.createdAt || "2026-07-17",
        name: b.hotelName || "فندق شريك شومة",
        title: b.roomName || "جناح فندقي متميز",
        amount: b.totalPrice || b.paidAmount || 0,
        status: b.status || "confirmed"
      });
    });

    // Add Hiking Bookings
    (Array.isArray(hikingBookings) ? hikingBookings : []).forEach((b: any) => {
      list.push({
        ...b,
        type: "hiking",
        date: b.bookingDate || b.createdAt || "2026-07-17",
        name: b.tripName || "مغامرة هايكنج جبلية",
        title: `${b.attendees || 1} مشارك ومكتشف محلي`,
        amount: b.paidAmount || 0,
        status: b.status || "confirmed"
      });
    });

    // Add Car Bookings
    (Array.isArray(carBookings) ? carBookings : []).forEach((b: any) => {
      list.push({
        ...b,
        type: "car",
        date: b.createdAt || "2026-07-17",
        name: b.carName || "سيارة دفع رباعي مجهزة",
        title: `${b.days || 1} أيام تأجير مريح`,
        amount: b.totalPrice || 0,
        status: b.status || "confirmed"
      });
    });

    // 1. Filter by category
    if (bookingFilter !== "all") {
      list = list.filter((b) => b.type === bookingFilter);
    }

    // 2. Filter by username or email (to make it personalized to logged-in user, but if guest, show all)
    if (username !== "guest" && username !== "admin" && username !== "superadmin") {
      list = list.filter((b) => {
        const uLower = username.toLowerCase();
        const bName = (b.fullName || "").toLowerCase();
        const bEmail = (b.email || "").toLowerCase();
        return bName.includes(uLower) || bEmail.includes(uLower);
      });
    }

    // 3. Filter by search query input
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) => {
        return (
          (b.name || "").toLowerCase().includes(q) ||
          (b.fullName || "").toLowerCase().includes(q) ||
          (b.phone || "").toLowerCase().includes(q) ||
          (b.email || "").toLowerCase().includes(q)
        );
      });
    }

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  // Handle load itinerary
  const handleLoadItinerary = (it: any) => {
    localStorage.setItem("shouma_active_itinerary", JSON.stringify(it));
    toast({
      title: isRTL ? "تم تفعيل الجدول" : "Itinerary Activated",
      description: isRTL 
        ? `تم تعيين "${it.title}" كجدول رحلتك النشط الآن.`
        : `"${it.title}" is now set as your active itinerary.`,
    });
    // Create query params if answers exist to preview
    const params = new URLSearchParams({
      id: it.id || "saved",
      loaded: "true"
    });
    setLocation(`/itinerary?${params.toString()}`);
  };

  // Handle delete saved itinerary
  const handleDeleteItinerary = (id: string, title: string) => {
    if (window.confirm(isRTL ? `هل أنت متأكد من حذف الجدول "${title}"؟` : `Delete itinerary "${title}"?`)) {
      try {
        const updated = savedItineraries.filter((it: any) => it.id !== id);
        setSavedItineraries(updated);
        localStorage.setItem("shouma_saved_itineraries", JSON.stringify(updated));
        toast({
          title: isRTL ? "تم الحذف" : "Deleted Successfully",
          description: isRTL ? "تم إزالة الجدول من مفضلتك المحفوظة." : "Itinerary removed from saved memory.",
          variant: "destructive"
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Decorative Oman national ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />

      {/* Header bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              className="rounded-full hover:bg-accent/80"
              title={t('backToHome')}
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                {t('myBookingsTitle')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('myBookingsDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-full text-xs border border-emerald-500/20">
              <User className="w-3.5 h-3.5" />
              <span>{isRTL ? "المستخدم:" : "User:"} {username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Toggle Tabs */}
        <div className="flex border-b border-border mb-8 gap-4 justify-center sm:justify-start">
          <button
            onClick={() => {
              setActiveTab("itineraries");
              setSearchQuery("");
            }}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "itineraries"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass className="w-4 h-4" />
            {t('savedItineraries')}
            <span className="ml-1 bg-accent/80 text-muted-foreground text-xs px-2 py-0.5 rounded-full font-bold">
              {savedItineraries.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("bookings");
              setSearchQuery("");
            }}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "bookings"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4" />
            {t('activeBookings')}
            <span className="ml-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
              {filteredBookings.length}
            </span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 w-full">
          {/* Booking categories toggles (only visible if on Bookings tab) */}
          {activeTab === "bookings" ? (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
              <Button
                variant={bookingFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setBookingFilter("all")}
                className={`rounded-full px-4 text-xs font-bold ${
                  bookingFilter === "all" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
              >
                {t('all')}
              </Button>
              <Button
                variant={bookingFilter === "hotels" ? "default" : "outline"}
                size="sm"
                onClick={() => setBookingFilter("hotels")}
                className={`rounded-full px-4 text-xs font-bold flex items-center gap-1 ${
                  bookingFilter === "hotels" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
              >
                <Hotel className="w-3.5 h-3.5" />
                {t('hotels')}
              </Button>
              <Button
                variant={bookingFilter === "hiking" ? "default" : "outline"}
                size="sm"
                onClick={() => setBookingFilter("hiking")}
                className={`rounded-full px-4 text-xs font-bold flex items-center gap-1 ${
                  bookingFilter === "hiking" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
              >
                <Mountain className="w-3.5 h-3.5" />
                {t('hiking')}
              </Button>
              <Button
                variant={bookingFilter === "cars" ? "default" : "outline"}
                size="sm"
                onClick={() => setBookingFilter("cars")}
                className={`rounded-full px-4 text-xs font-bold flex items-center gap-1 ${
                  bookingFilter === "cars" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                {t('taxis')}
              </Button>
            </div>
          ) : (
            <div className="text-sm font-medium text-muted-foreground w-full md:w-auto text-start">
              {t('myBookingsDesc')}
            </div>
          )}

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} w-4 h-4 text-muted-foreground`} />
            <input
              type="text"
              placeholder={
                activeTab === "itineraries"
                  ? (isRTL ? "ابحث عن اسم الجدول..." : "Search itinerary title...")
                  : (isRTL ? "بحث بالاسم، البريد أو الهاتف..." : "Search name, email, phone...")
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-10 ${isRTL ? "pr-4 pl-10" : "pl-4 pr-10"} rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500`}
            />
          </div>
        </div>

        {/* CONTENT TAB 1: SAVED ITINERARIES */}
        {activeTab === "itineraries" && (
          <div className="space-y-4">
            {filteredItineraries.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
                <Compass className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {isRTL ? "لا توجد جداول محفوظة" : "No Saved Itineraries"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
                  {isRTL 
                    ? "أجب على بعض الأسئلة البسيطة في شومتك وسيقوم النظام الذكي بإنشاء جدول رحلات متكامل لك لتتمكن من حفظه هنا!" 
                    : "Plan your trip using Shoumatak smart questionnaire and save it to access it anytime!"}
                </p>
                <Button
                  onClick={() => setLocation("/shoumatak")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-6"
                >
                  {isRTL ? "ابدأ تخطيط رحلتك الآن" : "Start Planning Now"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItineraries.map((it: any) => (
                  <div
                    key={it.id || it.savedAt}
                    className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-lg text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{it.duration} {isRTL ? "أيام" : "Days"}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {isRTL ? "حُفظ في:" : "Saved on:"} {it.savedAt ? new Date(it.savedAt).toLocaleDateString(language === "ar" ? "ar-OM" : "en-US") : "2026-07-17"}
                        </span>
                      </div>

                      <h3 className="text-md font-bold text-foreground text-start">
                        {it.title || (isRTL ? "مخطط سياحي مخصص" : "Custom Smart Itinerary")}
                      </h3>

                      {Array.isArray(it.days) && it.days.length > 0 && (
                        <p className="text-xs text-muted-foreground text-start line-clamp-2 leading-relaxed">
                          {isRTL 
                            ? `يحتوي هذا الجدول على ${it.days.length} أيام من الأنشطة المنظمة بعناية لزيارة معالم ومحافظات عُمان الرائعة.`
                            : `This itinerary contains ${it.days.length} days of perfectly crafted schedules exploring tourist spots in Oman.`}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItinerary(it.id, it.title)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isRTL ? "حذف" : "Delete"}
                      </Button>

                      <Button
                        onClick={() => handleLoadItinerary(it)}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-xs px-4 flex items-center gap-1.5 shadow-sm"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        {isRTL ? "عرض وتنشيط الجدول" : "View & Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENT TAB 2: USER RESERVATIONS */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "جاري تحميل حجوزاتك السياحية من بوابة شومة..." : "Retrieving your bookings..."}
                </p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border bg-card/50">
                <Calendar className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {isRTL ? "لا توجد حجوزات نشطة" : "No Active Bookings"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
                  {isRTL 
                    ? "لم يتم العثور على أي حجوزات فنادق أو مغامرات جبلية أو سيارات تابعة لهذا الحساب حالياً."
                    : "No hotel rooms, mountain treks, or car rentals recorded for your user profile currently."}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    onClick={() => setLocation("/hotels")}
                    variant="outline"
                    className="font-bold rounded-xl text-xs border-border"
                  >
                    {isRTL ? "استعرض الفنادق" : "Explore Hotels"}
                  </Button>
                  <Button
                    onClick={() => setLocation("/hiking")}
                    variant="outline"
                    className="font-bold rounded-xl text-xs border-border"
                  >
                    {isRTL ? "مغامرات الهايكنج" : "Hiking Trips"}
                  </Button>
                  <Button
                    onClick={() => setLocation("/taxis")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-5"
                  >
                    {isRTL ? "استئجار سيارة" : "Rent Car"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Guest Warning */}
                {username === "guest" && (
                  <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-2xl flex gap-3 items-start text-start">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold">
                        {isRTL ? "تنبيه حساب الزائر النشط" : "Guest Account Indicator"}
                      </p>
                      <p className="mt-1">
                        {isRTL 
                          ? "أنت تتصفح حالياً كحساب زائر، يتم عرض كافة الحجوزات الأخيرة المسجلة بالنظام لسهولة التتبع التجريبي. لحماية بياناتك يرجى تسجيل حساب فريد." 
                          : "You are currently logged in as a guest. All system-wide test bookings are shown for preview. Create a private user account to isolate your reservations."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bookings List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b: any, index: number) => {
                    const icon = b.type === "hotel" ? <Hotel className="w-4 h-4 text-sky-500" /> :
                                 b.type === "hiking" ? <Mountain className="w-4 h-4 text-emerald-500" /> :
                                 <Car className="w-4 h-4 text-amber-500" />;

                    const typeText = b.type === "hotel" ? (isRTL ? "حجز فندقي" : "Hotel Room") :
                                     b.type === "hiking" ? (isRTL ? "رحلة مغامرة" : "Hiking Tour") :
                                     (isRTL ? "تأجير سيارة" : "Car Rental");

                    return (
                      <div
                        key={b.id || index}
                        className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-start"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                                {icon}
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground block">{typeText}</span>
                                <span className="text-xs font-bold text-foreground block">{b.name}</span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold rounded-lg text-[10px] flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {isRTL ? "مؤكد" : "Confirmed"}
                            </span>
                          </div>

                          <div className="space-y-1.5 bg-accent/30 p-3 rounded-xl border border-border/40">
                            <div className="flex items-center justify-between text-xs font-medium text-foreground">
                              <span>{isRTL ? "تفصيل الحجز:" : "Detail:"}</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{b.title}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                              <span>{isRTL ? "الاسم المسجل:" : "Guest Name:"}</span>
                              <span className="font-bold text-foreground">{b.fullName || b.fullName}</span>
                            </div>
                            {b.phone && (
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>{isRTL ? "الهاتف:" : "Phone:"}</span>
                                <span className="font-mono">{b.phone}</span>
                              </div>
                            )}
                            {b.email && (
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>{isRTL ? "البريد الإلكتروني:" : "Email:"}</span>
                                <span className="font-mono truncate max-w-[180px]">{b.email}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
                              <span>{isRTL ? "طريقة الدفع:" : "Payment:"}</span>
                              <span className="font-medium text-purple-700 dark:text-purple-300">{b.paymentGateway || "بوابة ثواني العمانية (Thawani Pay)"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-muted-foreground block">{isRTL ? "تاريخ المعاملة" : "Transaction Date"}</span>
                            <span className="font-mono font-bold text-foreground block text-[11px]">
                              {new Date(b.date).toLocaleDateString(language === "ar" ? "ar-OM" : "en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-muted-foreground block text-xs">{isRTL ? "المبلغ المدفوع" : "Amount Paid"}</span>
                            <span className="text-md font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                              {formatPrice(Number(b.amount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 mt-12 border-t border-border bg-card/20">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-muted-foreground leading-relaxed">
          <p className="mb-2">
            {isRTL 
              ? "حقوق الطبع والنشر © 2026 شومة السياحية. جميع الحجوزات والمعاملات خاضعة للشروط وسياسات الخصوصية المعمول بها بوزارة التراث والسياحة العمانية." 
              : "Copyright © 2026 Shouma Tourism. All reservations and transactions comply with the rules set by the Ministry of Heritage and Tourism, Oman."}
          </p>
          <p>{isRTL ? "تم التأمين والتطوير بواسطة شومة تكنولوجي" : "Secured & Powered by Shouma Technology"}</p>
        </div>
      </footer>
    </div>
  );
}
