import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tourGuides } from "@/lib/tour-guides";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  UserCheck, 
  ArrowLeft,
  ArrowRight,
  MapPin,
  Star,
  Search,
  Phone,
  MessageCircle,
  Languages,
  Clock,
  Bell,
  X,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Map,
  FileText,
  User,
  Mail
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import misfatAbriyyinHeroImg from "@/assets/misfat-abriyyin.png";

const SPEC_KEYS = ['all', 'historicalCultural', 'adventureNature', 'desert', 'photography', 'marine', 'family'] as const;
const CITY_KEYS = ['all', 'muscat', 'nizwa', 'salalah', 'musandam', 'sohar'] as const;

type SpecKey = typeof SPEC_KEYS[number];
type CityKey = typeof CITY_KEYS[number];

const specEnToKey: Record<string, SpecKey> = {
  'Historical & Cultural Tours': 'historicalCultural',
  'Adventure & Nature Tours': 'adventureNature',
  'Desert Safari Tours': 'desert',
  'Photography Tours': 'photography',
  'Marine & Diving Tours': 'marine',
  'Family & Group Tours': 'family',
};

const cityToKey: Record<string, CityKey> = {
  'مسقط': 'muscat',
  'نزوى': 'nizwa',
  'صلالة': 'salalah',
  'مسندم': 'musandam',
  'صحار': 'sohar',
};

export default function TourGuidesPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const username = localStorage.getItem('shouma-username') || "";

  // Dynamic States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecKey, setSelectedSpecKey] = useState<SpecKey>('all');
  const [selectedCityKey, setSelectedCityKey] = useState<CityKey>('all');
  
  // Trip request form modal states
  const [bookingGuideId, setBookingGuideId] = useState<number | null>(null);
  const [fullName, setFullName] = useState(username);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [groupSize, setGroupSize] = useState("1");
  const [hours, setHours] = useState("4");
  const [tripDate, setTripDate] = useState("");
  const [destination, setDestination] = useState("");
  const [details, setDetails] = useState("");

  // Notification panel visibility
  const [showNotifications, setShowNotifications] = useState(false);

  // 1. Fetch live guide availability map
  const { data: availabilityMap } = useQuery<Record<number, boolean>>({
    queryKey: ["/api/tour-guides/availability"],
    queryFn: async () => {
      const resp = await fetch("/api/tour-guides/availability");
      if (!resp.ok) throw new Error("Failed to load guide availabilities");
      return resp.json();
    }
  });

  // 2. Fetch all tour requests history to show user notifications / status
  const { data: allRequests, isLoading: isRequestsLoading } = useQuery<any[]>({
    queryKey: ["/api/tour-requests"],
    queryFn: async () => {
      const resp = await fetch("/api/tour-requests");
      if (!resp.ok) throw new Error("Failed to load requests");
      return resp.json();
    }
  });

  // Filter requests that belong to this visitor
  const userRequests = allRequests?.filter(
    (req) => req.userName.trim().toLowerCase() === username.trim().toLowerCase()
  ) || [];

  // Consider "unread" or active notifications as those that were accepted or rejected recently
  const activeNotifications = userRequests.filter(req => req.status !== "pending");

  // Mutation to book trip
  const bookTripMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const resp = await fetch("/api/tour-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      if (!resp.ok) throw new Error("Failed to register request");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tour-requests"] });
      setBookingGuideId(null);
      // Reset form fields
      setPhone("");
      setEmail("");
      setGroupSize("1");
      setHours("4");
      setTripDate("");
      setDestination("");
      setDetails("");
      
      toast({
        title: "تم إرسال طلبك بنجاح",
        description: "تم استلام طلب الرحلة السياحية الخاص بك وإرساله للمرشد لتتم مراجعته وقبوله.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "فشل إرسال طلب الرحلة، يرجى ملء البيانات وإعادة المحاولة.",
        variant: "destructive"
      });
    }
  });

  // Fetch dynamic tour guides list from the DB
  const { data: dbGuides } = useQuery<any[]>({
    queryKey: ["/api/local-tour-guides"],
    queryFn: async () => {
      const resp = await fetch("/api/local-tour-guides");
      if (!resp.ok) throw new Error("Failed to load tour guides");
      return resp.json();
    }
  });

  const displayGuides = dbGuides && dbGuides.length > 0 ? dbGuides.map((g: any) => ({
    id: g.id,
    name: g.name,
    nameAr: g.name_ar || g.nameAr || g.name,
    specialization: g.specialization,
    specializationAr: g.specialization_ar || g.specializationAr || g.specialization,
    languages: g.languages || [],
    experience: g.experience,
    city: g.city,
    description: g.description,
    image: g.image_url || g.imageUrl || g.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
    phone: g.phone,
    whatsapp: g.whatsapp,
    rating: typeof g.rating === 'string' ? parseFloat(g.rating) : (g.rating || 4.8),
    reviewsCount: g.reviews_count || g.reviewsCount || 12,
    pricePerDay: g.price_per_day || g.pricePerDay || 45,
    services: g.services || [],
    availability: g.availability !== false
  })) : tourGuides;

  const getGuideLiveAvailability = (guideId: number) => {
    return availabilityMap?.[guideId] ?? true;
  };

  const filteredGuides = displayGuides.filter((guide: any) => {
    const matchesSearch = (guide.nameAr || '').includes(searchQuery) || 
                          (guide.name || '').includes(searchQuery) ||
                          (guide.description || '').includes(searchQuery) ||
                          (guide.specializationAr || '').includes(searchQuery);
    const guideSpecKey = specEnToKey[guide.specialization] || 'all';
    const guideCityKey = cityToKey[guide.city] || 'all';
    const matchesSpec = selectedSpecKey === 'all' || guideSpecKey === selectedSpecKey;
    const matchesCity = selectedCityKey === 'all' || guideCityKey === selectedCityKey;
    return matchesSearch && matchesSpec && matchesCity;
  });

  const selectedGuideObj = displayGuides.find(g => g.id === bookingGuideId);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingGuideId) return;

    if (!fullName || !phone || !tripDate || !destination || !details) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، تاريخ الرحلة، الوجهة، وتفاصيل الرحلة)",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      guideId: bookingGuideId,
      userName: fullName,
      email: email || "no-email@shouma.com",
      phone,
      groupSize: parseInt(groupSize, 10),
      hours: parseInt(hours, 10),
      tripDate,
      destination,
      details,
      status: "pending"
    };

    bookTripMutation.mutate(payload);
  };

  const handleWhatsAppContact = (guidePhone: string, guideName: string) => {
    const cleanPhone = guidePhone.replace(/[^\d+]/g, '');
    const message = encodeURIComponent(`مرحباً ${guideName}، أنا تواصلت معك عبر تطبيق شومة بخصوص طلبي لرحلة سياحية المقبول.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => setLocation("/home")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              <span className="text-sm font-medium">{t('back')}</span>
            </button>

            {/* Central App Header Info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                <UserCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('tourGuides')}</span>
            </div>

            {/* Actions: Guide Panel, Notification Center, Theme, Lang */}
            <div className="flex items-center gap-2">

              {/* Real-time Notifications Bell Widget */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative hover:bg-slate-150/60 transition-colors"
                >
                  <Bell className="w-5 h-5 text-foreground" />
                  {activeNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center p-0 rounded-full text-[10px] border-2 border-background font-black animate-bounce">
                      {activeNotifications.length}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[100] p-4 text-right`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">حالة طلبات الرحلات الخاصة بك</h4>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto py-2 divide-y divide-slate-100 dark:divide-slate-800">
                      {userRequests.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">
                          لا توجد أي طلبات مرسلة من جانبك حالياً.
                        </div>
                      ) : (
                        userRequests.map((req) => {
                          const guideInfo = tourGuides.find(g => g.id === req.guideId);
                          return (
                            <div key={req.id} className="py-3 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-805 dark:text-white">{guideInfo?.nameAr || `مرشد #${req.guideId}`}</span>
                                <span className="text-[10px] text-slate-400">{req.tripDate}</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-1">المكان: {req.destination}</p>
                              
                              <div className="flex items-center justify-between gap-2 mt-2">
                                <span className="text-xs">
                                  الحالة:{" "}
                                  {req.status === "pending" && (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 shadow-none font-bold text-[10px]">قيد الانتظار</Badge>
                                  )}
                                  {req.status === "accepted" && (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 shadow-none font-bold text-[10px]">مقبول من المرشد</Badge>
                                  )}
                                  {req.status === "rejected" && (
                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 shadow-none font-bold text-[10px]">تم الاعتذار</Badge>
                                  )}
                                </span>

                                {req.status === "accepted" && guideInfo && (
                                  <Button
                                    size="xs"
                                    onClick={() => handleWhatsAppContact(guideInfo.whatsapp, guideInfo.nameAr)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold h-7 px-2.5 rounded-lg flex items-center gap-1"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    تواصل مع المرشد
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[28vh] sm:h-[35vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${misfatAbriyyinHeroImg}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg" data-testid="text-page-title">
            {t('tourGuidesTitle')}
          </h1>
          <p className="text-sm sm:text-base text-white/90 max-w-2xl mb-4 drop-shadow" data-testid="text-page-subtitle">
            {t('tourGuidesSubtitle')}
          </p>
        </div>
      </section>

      {/* Interactive Filters Area */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input
                data-testid="input-search"
                type="search"
                placeholder={t('searchGuide')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`h-11 shadow-sm border-slate-200/80 dark:border-slate-800 ${isRTL ? 'pr-5 pl-12 text-right' : 'pl-5 pr-12 text-left'}`}
              />
              <Search className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {SPEC_KEYS.map((specKey) => (
                  <Button
                    key={specKey}
                    data-testid={`button-spec-${specKey}`}
                    variant={selectedSpecKey === specKey ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpecKey(specKey)}
                    className="whitespace-nowrap rounded-lg"
                  >
                    {t(specKey)}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {CITY_KEYS.map((cityKey) => (
                  <Button
                    key={cityKey}
                    data-testid={`button-city-${cityKey}`}
                    variant={selectedCityKey === cityKey ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCityKey(cityKey)}
                    className="whitespace-nowrap rounded-lg text-xs"
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t(cityKey)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Listing Grid */}
      <main className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground" data-testid="text-results-count">
              {filteredGuides.length} {t('guideCount')}
            </h2>
          </div>

          {filteredGuides.length === 0 ? (
            <div className="text-center py-16 bg-card/40 border border-dashed rounded-3xl p-6">
              <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-bold text-foreground mb-1">{t('noResults')}</h3>
              <p className="text-muted-foreground text-sm">{t('tryDifferentSearch')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => {
                const liveAvailable = getGuideLiveAvailability(guide.id);
                return (
                  <Card 
                    key={guide.id}
                    data-testid={`card-guide-${guide.id}`}
                    className="overflow-hidden bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={guide.image}
                          alt={guide.nameAr}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
                          <Badge 
                            variant={liveAvailable ? "default" : "secondary"} 
                            className={liveAvailable ? "bg-green-600 text-white font-bold px-2.5 py-0.5" : "bg-neutral-500 text-white font-bold px-2.5 py-0.5"}
                          >
                            {liveAvailable ? t('available') : "أنا غير متوفر حالياً"}
                          </Badge>
                        </div>
                        <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{guide.rating}</span>
                          <span className="text-[10px] text-white/75">({guide.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Info Details */}
                      <CardContent className="p-5 text-right">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-foreground leading-tight" data-testid={`text-guide-name-${guide.id}`}>
                            {guide.nameAr}
                          </h3>
                          <p className="text-xs text-primary font-bold mt-0.5">{guide.specializationAr}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{guide.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{guide.experience} سنوات خبرة</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                          <Languages className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">المستند اللغوي: {guide.languages.join(" • ")}</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                          {guide.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-5">
                          {guide.services.slice(0, 12).map((service) => (
                            <Badge key={service} variant="outline" className="text-[10px] py-0 px-2 text-slate-500 dark:text-slate-300">
                              {service}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-4 text-xs font-medium">
                          <span className="text-slate-400">التكلفة اليومية التقديرية</span>
                          <span className="text-lg font-black text-primary">{guide.pricePerDay} ريال عماني</span>
                        </div>
                      </CardContent>
                    </div>

                    {/* Booking/Trigger Button - ONLY SINGLE ACTION BUTTON COMPLIANT TO THE LITERAL USER INSTRUCTION: "إزالة زر واتساب ومراسلة واستبدالهما بطلب رحلة" */}
                    <div className="p-5 pt-0">
                      {liveAvailable ? (
                        <Button 
                          data-testid={`button-request-trip-${guide.id}`}
                          onClick={() => {
                            setBookingGuideId(guide.id);
                          }}
                          className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          طلب رحلة جديدة
                        </Button>
                      ) : (
                        <Button 
                          disabled
                          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold h-11 rounded-xl cursor-not-allowed"
                        >
                          المرشد غير متاح حالياً
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* TRIP BOOKING REQUEST MODAL */}
      {bookingGuideId !== null && selectedGuideObj && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-right animate-scale-up">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                  <img src={selectedGuideObj.image} alt={selectedGuideObj.nameAr} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">تقديم طلب لرحلة سياحية</h3>
                  <p className="text-xs text-primary font-medium mt-0.5">مع المرشد: {selectedGuideObj.nameAr}</p>
                </div>
              </div>
              <button 
                onClick={() => setBookingGuideId(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Field 1: Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-start">
                  <User className="w-3.5 h-3.5" />
                  <span>الاسم الكامل للعميل *</span>
                </label>
                <Input 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="اكتب اسمك الكامل الثلاثي"
                  className="h-10 border-slate-200 dark:border-slate-800 text-right focus:placeholder-transparent text-sm rounded-xl"
                />
              </div>

              {/* Grid: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-start">
                    <Mail className="w-3.5 h-3.5" />
                    <span>البريد الإلكتروني (اختياري)</span>
                  </label>
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@shouma.com"
                    className="h-10 border-slate-200 dark:border-slate-800 select-all focus:placeholder-transparent text-sm rounded-xl text-left font-mono"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-start">
                    <Phone className="w-3.5 h-3.5" />
                    <span>رقم الهاتف للتواصل *</span>
                  </label>
                  <Input 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+968 91234567"
                    className="h-10 border-slate-200 dark:border-slate-800 text-left focus:placeholder-transparent text-sm rounded-xl"
                  />
                </div>
              </div>

              {/* Grid: Persons Count & Hours count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-start">
                    <Users className="w-3.5 h-3.5" />
                    <span>عدد الأشخاص *</span>
                  </label>
                  <Input 
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                    className="h-10 border-slate-200 dark:border-slate-800 text-right text-sm rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-start">
                    <Clock className="w-3.5 h-3.5" />
                    <span>عدد الساعات المطلوبة *</span>
                  </label>
                  <Input 
                    required
                    type="number"
                    min="1"
                    max="48"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="h-10 border-slate-200 dark:border-slate-800 text-right text-sm rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Grid: Trip Date & Destination Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-start">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاريخ الرحلة السياحية *</span>
                  </label>
                  <Input 
                    required
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    className="h-10 border-slate-200 dark:border-slate-800 text-right text-sm rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-start">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>الوجهة أو المكان المطلوب *</span>
                  </label>
                  <Input 
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="مثال: الجبل الأخضر، رمال الشرقية"
                    className="h-10 border-slate-200 dark:border-slate-800 text-right focus:placeholder-transparent text-sm rounded-xl"
                  />
                </div>
              </div>

              {/* Textarea: Request Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-start">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>تفاصيل ومسار الرحلة السياحية *</span>
                </label>
                <textarea
                  required
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="برجاء كتابة تفاصيل مسارك ومخططك للرحلة أو متطلباتك الخاصة ليرد عليها المرشد."
                  rows={3}
                  className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3 py-2 text-right text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
              </div>

              {/* Action Buttons inside request modal */}
              <div className="pt-4 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/60">
                <Button
                  type="submit"
                  disabled={bookTripMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                >
                  {bookTripMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري إرسال طلبك...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      إرسال الطلب للمرشد
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setBookingGuideId(null)}
                  variant="outline"
                  className="border-slate-200 dark:border-slate-800 font-bold h-11 px-5 rounded-xl hover:bg-slate-50"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="py-8 px-4 border-t border-border mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-400">
            {t('copyright')} © {new Date().getFullYear()} {t('appName')}
          </p>
        </div>
      </footer>
    </div>
  );
}
