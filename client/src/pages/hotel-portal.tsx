import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Calendar, 
  LogOut, 
  Search,
  User,
  Star,
  DollarSign,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface HotelBooking {
  id: number;
  hotelId: number;
  hotel_id?: number;
  hotelName: string;
  roomName: string;
  fullName: string;
  phone: string;
  email: string;
  nights: number;
  pricePerNight: number;
  totalPrice: number | string;
  paymentGateway: string;
  createdAt?: string;
  created_at?: string;
}

export default function HotelPortalPage() {
  const [, setLocation] = useLocation();
  const { isRTL, t } = useLanguage();
  const { toast } = useToast();

  const [hotel, setHotel] = useState<any | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check storage on load
  useEffect(() => {
    const stored = localStorage.getItem("shouma_logged_hotel");
    if (stored) {
      try {
        setHotel(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("shouma_logged_hotel");
      }
    }
  }, []);

  // Fetch bookings whenever hotel state is populated
  useEffect(() => {
    if (hotel) {
      fetchHotelBookings(hotel.id);
    }
  }, [hotel]);

  const fetchHotelBookings = async (hotelId: number) => {
    setIsLoadingBookings(true);
    try {
      const res = await fetch(`/api/hotels/${hotelId}/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        toast({
          title: "خطأ في التزامن",
          description: "تعذر تحميل قائمة الحجوزات الخاصة بفندقكم.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/hotels/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
        localStorage.setItem("shouma_logged_hotel", JSON.stringify(data.hotel));
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً بك في لوحة تحكم ${data.hotel.nameAr || data.hotel.name}`,
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("حدث خطأ ما أثناء الاتصال بالخادم الرئيسي.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("shouma_logged_hotel");
    setHotel(null);
    setBookings([]);
    setEmail("");
    setPassword("");
    toast({
      description: "تم تسجيل خروج حساب الفندق بنجاح."
    });
  };

  // Filter bookings based on query
  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      (b.fullName || "").toLowerCase().includes(q) ||
      (b.phone || "").toLowerCase().includes(q) ||
      (b.email || "").toLowerCase().includes(q) ||
      (b.roomName || "").toLowerCase().includes(q)
    );
  });

  const aggregateRevenue = bookings.reduce((sum, b) => {
    const val = typeof b.totalPrice === 'string' ? parseFloat(b.totalPrice) : b.totalPrice;
    return sum + (val || 0);
  }, 0);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden font-sans">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none" />

        <header className="max-w-7xl w-full mx-auto flex justify-between items-center z-10 py-2">
          <Button 
            variant="ghost" 
            className="text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-xl px-4 py-2"
            onClick={() => setLocation("/hotels")}
          >
            <ArrowRight className="w-4 h-4 ml-1.5" />
            <span>العودة للفنادق</span>
          </Button>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-10 z-10">
          <Card className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-md shadow-2xl p-6 md:p-8 dir-rtl text-right">
            <div className="text-center space-y-3 mb-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Building2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white font-sans">
                بوابة أصحاب الفنادق
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                سجل الدخول لإدارة حجوزات عملائك، وتتبع مبيعات غرفتك وتسويات الحساب البنكي المباشر.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive/25 text-destructive rounded-xl p-3 text-xs font-bold text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="space-y-1.5 text-right">
                <Label htmlFor="login-email" className="text-xs font-bold text-slate-300">
                  البريد الإلكتروني للفندق
                </Label>
                <div className="relative">
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hotel@shouma.com"
                    required
                    className="w-full border-slate-800 rounded-xl pl-3 pr-10 text-xs text-left placeholder:text-slate-600"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <Label htmlFor="login-password" className="text-xs font-bold text-slate-300">
                  كلمة المرور السرية
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border-slate-800 rounded-xl pl-3 pr-10 text-xs text-left placeholder:text-slate-600"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-all pointer-events-auto mt-2"
              >
                {isLoggingIn ? "جاري التحقق من بياناتك..." : "تسجيل الدخول الآمن"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/60 text-center">
              <span className="text-[10px] text-slate-500">
                💡 يتم إنشاء حساب الفندق من قبل مسؤولي شومة في بوابة التحكم الرئيسية.
              </span>
            </div>
          </Card>
        </main>

        <footer className="py-4 text-center z-10 text-[11px] text-slate-600 border-t border-slate-900">
          منصة شومة باي للمدفوعات الفورية والتسوية الفندقية المباشرة © 2026
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Portal Header */}
      <header className="z-10 bg-slate-900/80 border-b border-slate-800/60 sticky top-0 backdrop-blur-md px-4 md:px-8 py-3 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 dir-rtl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div className="text-right">
              <h1 className="text-base font-black text-white">{hotel.nameAr}</h1>
              <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                متصل وبوابة التسويات نشطة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="px-3.5 h-9 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 z-10 dir-rtl text-right">
        {/* Hotel Details Meta Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/55 border-slate-800/80 rounded-2xl md:col-span-3">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] py-0.5 px-2.5">
                    {hotel.stars} نجوم
                  </Badge>
                  <span className="text-slate-400 text-xs">|</span>
                  <div className="flex items-center text-amber-500 gap-0.5 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{hotel.rating} / 5</span>
                  </div>
                </div>
                <h2 className="text-xl font-extrabold text-white">{hotel.nameAr}</h2>
                <p className="text-xs text-slate-400 max-w-2xl">{hotel.description}</p>
                
                <div className="flex flex-wrap gap-4 pt-1.5 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{hotel.region}، سلطنة عمان</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{hotel.phone || "+968 2444 5555"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{hotel.email}</span>
                  </div>
                </div>
              </div>

              {hotel.image && (
                <img 
                  src={hotel.image} 
                  alt={hotel.nameAr} 
                  className="w-full md:w-36 h-24 object-cover rounded-xl border border-slate-800 shadow"
                  referrerPolicy="no-referrer"
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/10 rounded-2xl text-right p-5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-sans font-medium">مبيعات الغرف / العوائد الإجمالية:</p>
              <h3 className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {aggregateRevenue.toFixed(3)} <span className="text-xs text-emerald-500 font-sans">ر.ع</span>
              </h3>
            </div>
            <div className="border-t border-slate-800 pt-2.5 mt-3 text-[10px] text-slate-500 leading-normal font-sans">
              ⚙️ بوابة شومة تستقطع تسوية فورية بنسبة <strong className="text-emerald-500">85% للفندق</strong> و <strong className="text-slate-400">15% عمولة</strong>.
            </div>
          </Card>
        </div>

        {/* Bookings Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                قائمة كشوف الحجوزات المستلمة
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                هنا تظهر كافة الحجوزات التي قام العملاء بدفع قيمتها بالكامل عبر التطبيق.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الهاتف، أو الجناح..."
                className="w-full bg-slate-900 border-slate-800 text-xs rounded-xl pr-9 pl-3 text-right"
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {isLoadingBookings ? (
            <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-3xl">
              <div className="animate-pulse space-y-2">
                <div className="inline-block w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                <p className="text-xs text-slate-400">جاري تحميل كشوف الحجوزات والمدفوعات من الخادم...</p>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <Card className="bg-slate-900/30 border-slate-800 rounded-3xl text-center py-12">
              <CardContent className="space-y-3">
                <div className="w-12 h-12 bg-slate-850 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">لا توجد حجوزات متوفرة</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {searchQuery ? "عذراً، لم تظهر أي حجوزات تطابق معيار بحثك الحالي." : "لم يتم تسجيل أي طلب حجز أو عملية دفع مباشرة تابعة لفندقكم بعد."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookings.map((booking) => {
                const totalVal = typeof booking.totalPrice === 'string' ? parseFloat(booking.totalPrice) : booking.totalPrice;
                return (
                  <Card 
                    key={booking.id} 
                    className="bg-slate-900/50 border-slate-800 rounded-2xl hover:border-slate-700/60 transition-all font-sans relative overflow-hidden"
                  >
                    {/* Top ambient highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    
                    <CardHeader className="p-4 pb-2 text-right">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] py-0 px-2 font-mono">
                          حجز مدفوع #{booking.id}
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('ar-OM') : "تاريخ فوري"}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-bold text-white mt-2 leading-snug">
                        {booking.roomName || "جناح ريفي متميز"}
                      </CardTitle>
                      <CardDescription className="text-[10px] text-slate-400 leading-normal">
                        صنف الإقامة: {booking.hotelName}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 space-y-3 text-right">
                      {/* Guest details block */}
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-400 font-sans">النزيل:</span>
                          <strong className="text-slate-200 font-semibold">{booking.fullName}</strong>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-400 font-sans">الهاتف:</span>
                          <strong className="text-slate-200">{booking.phone}</strong>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-400 font-sans">الإيميل:</span>
                          <span className="text-slate-300 break-all">{booking.email}</span>
                        </div>
                      </div>

                      {/* Financial info block */}
                      <div className="flex items-center justify-between text-xs bg-slate-900 py-1.5 px-2 rounded-lg border border-slate-800/60">
                        <div>
                          <span className="text-slate-400">الإقامة: </span>
                          <strong className="text-amber-500 font-mono">{booking.nights} ليالٍ</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">السعر/الليلة: </span>
                          <strong className="text-slate-200 font-mono">{booking.pricePerNight} ر.ع</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{booking.paymentGateway || "شومة باي"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 ml-1">إجمالي المدفوع:</span>
                          <strong className="text-sm font-black text-emerald-400 font-mono">{(totalVal || 0).toFixed(3)} ر.ع</strong>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 mt-12 text-center text-xs text-slate-600 border-t border-slate-900/80 bg-slate-950">
        بوابة أصحاب الفنادق الذكية لشومة للتسويات والمدفوعات الفورية © 2026
      </footer>
    </div>
  );
}
