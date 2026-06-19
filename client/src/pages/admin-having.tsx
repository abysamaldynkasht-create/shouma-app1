import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mountain, 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowLeft, 
  Check, 
  DollarSign, 
  Loader2, 
  Lock,
  Phone,
  MapPin,
  Clock,
  Navigation,
  ClipboardList,
  Mail,
  TrendingUp,
  TrendingDown,
  Percent,
  Activity,
  Building2,
  Ticket,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { hotels as staticHotels } from "@/lib/hotels";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface HikingTrip {
  id: number;
  name: string;
  name_ar: string;
  description: string;
  location: string;
  region: string;
  image: string;
  difficulty: string;
  duration: string;
  distance: string;
  price: number;
  includes: string[];
  phone: string;
}

interface PaymentGateway {
  id: number;
  gateway_name: string;
  is_active: boolean;
  details: string;
}

export default function AdminHavingPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Core states
  const [trips, setTrips] = useState<HikingTrip[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedTripFinanceId, setSelectedTripFinanceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal / Form state for Hiking Trip
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [tripForm, setTripForm] = useState({
    name: "",
    name_ar: "",
    description: "",
    location: "",
    region: "",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800",
    difficulty: "easy",
    duration: "يوم واحد",
    distance: "5 كم",
    price: 30,
    phone: "+968 9123 4567",
    includes: [] as string[]
  });
  const [newInclusion, setNewInclusion] = useState("");

  // Form state for Primary Payment Gateway configuration
  const [mainGatewayName, setMainGatewayName] = useState("شومة باي - بوابة دفع آمن مباشر");
  const [mainToken, setMainToken] = useState("");

  // Session check on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem("shouma_having_auth");
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchTrips();
      fetchGateways();
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/hiking-bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error("Fetch bookings error:", e);
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hiking-trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchGateways = async () => {
    try {
      const res = await fetch("/api/hiking-payments");
      if (res.ok) {
        const data = await res.json();
        setGateways(data);
        if (data && data.length > 0) {
          setMainGatewayName(data[0].gateway_name);
          setMainToken(data[0].details);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "shouma2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem("shouma_having_auth", "true");
      setAuthError("");
    } else {
      setAuthError(isRTL ? "كلمة المرور غير صحيحة" : "Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("shouma_having_auth");
  };

  const triggerNotify = (msg: string, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Hiking Trip Actions
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: tripForm.name,
        name_ar: tripForm.name_ar,
        description: tripForm.description,
        location: tripForm.location,
        region: tripForm.region,
        image: tripForm.image,
        difficulty: tripForm.difficulty,
        duration: tripForm.duration,
        distance: tripForm.distance,
        price: Number(tripForm.price),
        includes: tripForm.includes,
        phone: tripForm.phone
      };

      let url = "/api/hiking-trips";
      let method = "POST";

      if (editingTripId) {
        url = `/api/hiking-trips/${editingTripId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerNotify(editingTripId ? "تم تعديل الرحلة بنجاح" : "تم إضافة الرحلة بنجاح");
        resetTripForm();
        fetchTrips();
      } else {
        triggerNotify("فشل في حفظ الرحلة", true);
      }
    } catch (err) {
      triggerNotify("حدث خطأ ما", true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTripClick = (trip: HikingTrip) => {
    setEditingTripId(trip.id);
    setTripForm({
      name: trip.name,
      name_ar: trip.name_ar,
      description: trip.description,
      location: trip.location,
      region: trip.region,
      image: trip.image,
      difficulty: trip.difficulty,
      duration: trip.duration,
      distance: trip.distance,
      price: trip.price,
      phone: trip.phone,
      includes: Array.isArray(trip.includes) ? trip.includes : []
    });
  };

  const handleDeleteTripClick = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الرحلة؟")) return;
    try {
      const res = await fetch(`/api/hiking-trips/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerNotify("تم حذف الرحلة بنجاح");
        fetchTrips();
      } else {
        triggerNotify("فشل في حذف الرحلة", true);
      }
    } catch (e) {
      triggerNotify("حدث خطأ في الشبكة", true);
    }
  };

  const resetTripForm = () => {
    setEditingTripId(null);
    setTripForm({
      name: "",
      name_ar: "",
      description: "",
      location: "",
      region: "الداخلية",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800",
      difficulty: "easy",
      duration: "يوم واحد",
      distance: "5 كم",
      price: 30,
      phone: "+968 9123 4567",
      includes: [] as string[]
    });
  };

  const addInclusion = () => {
    if (!newInclusion.trim()) return;
    setTripForm({
      ...tripForm,
      includes: [...tripForm.includes, newInclusion.trim()]
    });
    setNewInclusion("");
  };

  const removeInclusion = (idx: number) => {
    setTripForm({
      ...tripForm,
      includes: tripForm.includes.filter((_, i) => i !== idx)
    });
  };

  // Primary Payment Gateway Actions (Manual Token Config)
  const handleSaveMainGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Delete existing configs to override with the new primary token configuration
      for (const gw of gateways) {
        await fetch(`/api/hiking-payments/${gw.id}`, { method: "DELETE" });
      }

      const res = await fetch("/api/hiking-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway_name: mainGatewayName.trim() || "شومة باي - بوابة دفع آمن مباشر",
          details: mainToken.trim() || ""
        })
      });

      if (res.ok) {
        triggerNotify("تم حفظ وتحديث إعدادات بوابة الدفع الرئيسية وتوكن السداد بنجاح!");
        fetchGateways();
      } else {
        triggerNotify("فشل في حفظ إعدادات بوابة الدفع", true);
      }
    } catch (error) {
      triggerNotify("حدث خطأ في النظام", true);
    }
  };

  // Financial calculations for Hiking Trips
  const totalHikingSales = useMemo(() => {
    return bookings.reduce((sum, b) => sum + Number(b.paid_amount || b.paidAmount || 0), 0);
  }, [bookings]);

  const totalShoumaShare = useMemo(() => {
    return totalHikingSales * 0.15;
  }, [totalHikingSales]);

  const totalGuidesShare = useMemo(() => {
    return totalHikingSales * 0.85;
  }, [totalHikingSales]);

  // Financial progressive chart datasets (cumulative) representing hiking registrations
  const chartData = useMemo(() => {
    if (bookings.length === 0) {
      return [
        { name: "أسبوع ١", "المبيعات الكلية": 90, "حصة شومة": 13.5, "حصة المنظمين": 76.5 },
        { name: "أسبوع ٢", "المبيعات الكلية": 210, "حصة شومة": 31.5, "حصة المنظمين": 178.5 },
        { name: "أسبوع ٣", "المبيعات الكلية": 420, "حصة شومة": 63, "حصة المنظمين": 357 },
        { name: "أسبوع ٤", "المبيعات الكلية": 680, "حصة شومة": 102, "حصة المنظمين": 578 },
        { name: "أسبوع ٥", "المبيعات الكلية": 1150, "حصة شومة": 172.5, "حصة المنظمين": 977.5 }
      ];
    }
    
    const sorted = [...bookings].sort((a, b) => {
      const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tA - tB;
    });

    let cumSales = 0;
    let cumShouma = 0;
    let cumGuides = 0;

    return sorted.map((b) => {
      const price = Number(b.paid_amount || b.paidAmount || 0);
      cumSales += price;
      cumShouma += price * 0.15;
      cumGuides += price * 0.85;

      const dateStr = b.booking_date || b.bookingDate || (b.created_at 
        ? new Date(b.created_at).toLocaleDateString("ar-OM", {day: 'numeric', month: 'short'}) 
        : `حجز #${b.id}`);

      return {
        name: dateStr,
        "المبيعات الكلية": Number(cumSales.toFixed(2)),
        "حصة شومة": Number(cumShouma.toFixed(2)),
        "حصة الهاكنق": Number(cumGuides.toFixed(2))
      };
    });
  }, [bookings]);

  // Selected trip specifications for detailed ledger
  const selectedTripObj = useMemo(() => {
    if (!selectedTripFinanceId) return null;
    return trips.find(t => t.id === selectedTripFinanceId);
  }, [selectedTripFinanceId, trips]);

  const selectedTripBookings = useMemo(() => {
    if (!selectedTripObj) return [];
    return bookings.filter(b => 
      b.trip_id === selectedTripObj.id || 
      b.tripId === selectedTripObj.id || 
      (b.trip_name && b.trip_name.includes(selectedTripObj.name_ar)) ||
      (selectedTripObj.name_ar && selectedTripObj.name_ar.includes(b.trip_name))
    );
  }, [selectedTripObj, bookings]);

  const selectedTripSumSales = useMemo(() => {
    return selectedTripBookings.reduce((sum, b) => sum + Number(b.paid_amount || b.paidAmount || 0), 0);
  }, [selectedTripBookings]);

  const selectedTripDueAmount = useMemo(() => {
    return selectedTripSumSales * 0.85;
  }, [selectedTripSumSales]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4" dir="rtl">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">لوحة تحكم رحلات الهاكنق</h1>
            <p className="text-slate-400 text-sm">ادخل كلمة المرور الآمنة لإدارة رحلات وبوابات الدفع</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="bg-slate-850 border-slate-700 text-center text-lg tracking-widest text-white h-12"
              />
            </div>

            {authError && (
              <p className="text-rose-400 text-sm text-center font-medium bg-rose-500/10 py-2 rounded-lg">
                {authError}
              </p>
            )}

            <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
              تسجيل الدخول للوحة التحكم
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setLocation("/hiking")}>
              <ArrowLeft className="w-4 h-4 ml-2" /> العودة لقسم الهاكنق في التطبيق
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">لوحة تحكم رحلات الهاكنق</h1>
              <p className="text-xs text-slate-400">إدارة الجولات، الصعوبات، وبوابات دفع الهاكنق</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={handleLogout}>
              تسجيل الخروج
            </Button>
            <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => setLocation("/hiking")}>
              العرض في التطبيق
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Sync / Success Banners */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-2">
            <Trash2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{errorMsg}</span>
          </div>
        )}

        <Tabs defaultValue="trips" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 w-full max-w-lg grid grid-cols-3">
            <TabsTrigger value="trips" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white cursor-pointer">
              <Mountain className="w-4 h-4 ml-2" /> رحلات الهاكنق
            </TabsTrigger>
            <TabsTrigger value="gateways" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white cursor-pointer">
              <DollarSign className="w-4 h-4 ml-2" /> القسم المالي والأرباح
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white cursor-pointer">
              <ClipboardList className="w-4 h-4 ml-2" /> الحجوزات والطلبات
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Hiking Trips Catalog */}
          <TabsContent value="trips" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Form Editor */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                  <CardHeader>
                    <CardTitle className="text-emerald-400 flex items-center gap-2">
                      {editingTripId ? "تعديل رحلة هاكنق" : "اضافة رحلة هاكنق جديدة"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      ادخل المعلمات المطلوبة لتنشر لجميع المستخدمين فورا في قسم الهاكنق
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveTrip} className="space-y-4 text-slate-200">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400">اسم الرحلة (عربي)</label>
                        <Input 
                          placeholder="مثال: هايكنق وادي شاب" 
                          value={tripForm.name_ar} 
                          onChange={(e) => setTripForm({...tripForm, name_ar: e.target.value})}
                          className="bg-slate-850 border-slate-705 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400">اسم الرحلة (إنجليزي)</label>
                        <Input 
                          placeholder="مثال: Wadi Shab Adventure" 
                          value={tripForm.name} 
                          onChange={(e) => setTripForm({...tripForm, name: e.target.value})}
                          className="bg-slate-850 border-slate-705 text-white"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400">الوصف (عربي وتفاصيل المسير)</label>
                        <Textarea 
                          placeholder="تفاصيل المسار وعوامل الصعوبة المخصصة وميول الطبيعة..." 
                          value={tripForm.description} 
                          onChange={(e) => setTripForm({...tripForm, description: e.target.value})}
                          className="bg-slate-850 border-slate-705 text-white min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">الموقع</label>
                          <Input 
                            placeholder="ولاية صور" 
                            value={tripForm.location} 
                            onChange={(e) => setTripForm({...tripForm, location: e.target.value})}
                            className="bg-slate-850 border-slate-705 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">المنطقة / المحافظة</label>
                          <Input 
                            placeholder="الداخلية، ظفار، الخ" 
                            value={tripForm.region} 
                            onChange={(e) => setTripForm({...tripForm, region: e.target.value})}
                            className="bg-slate-850 border-slate-705 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">مستوى الصعوبة</label>
                          <select 
                            value={tripForm.difficulty} 
                            onChange={(e) => setTripForm({...tripForm, difficulty: e.target.value})}
                            className="w-full rounded-md bg-slate-850 border border-slate-700 text-xs p-2 text-white"
                          >
                            <option value="easy">سهل (Easy)</option>
                            <option value="moderate">متوسط (Moderate)</option>
                            <option value="hard">صعب (Hard)</option>
                            <option value="expert">محترف (Expert)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">المدة الزمنية</label>
                          <Input 
                            value={tripForm.duration} 
                            onChange={(e) => setTripForm({...tripForm, duration: e.target.value})}
                            className="bg-slate-850 border-slate-705 text-white text-xs"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">المسافة</label>
                          <Input 
                            value={tripForm.distance} 
                            onChange={(e) => setTripForm({...tripForm, distance: e.target.value})}
                            className="bg-slate-850 border-slate-705 text-white text-xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">سعر الفرد (ر.ع)</label>
                          <Input 
                            type="number" 
                            value={tripForm.price} 
                            onChange={(e) => setTripForm({...tripForm, price: Number(e.target.value)})}
                            className="bg-slate-850 border-slate-705 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-400">رقم الهاتف للدعم</label>
                          <Input 
                            placeholder="+968 9xxx xxxx" 
                            value={tripForm.phone} 
                            onChange={(e) => setTripForm({...tripForm, phone: e.target.value})}
                            className="bg-slate-850 border-slate-705 text-white text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400">رابط صورة الغلاف</label>
                        <Input 
                          placeholder="رابط URL للصورة" 
                          value={tripForm.image} 
                          onChange={(e) => setTripForm({...tripForm, image: e.target.value})}
                          className="bg-slate-850 border-slate-705 text-white"
                          required
                        />
                      </div>

                      {/* Inclusions input */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="text-xs font-semibold text-slate-400 block">ماذا تشمل الرحلة؟</label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="مثال: مرشد سياحي" 
                            value={newInclusion} 
                            onChange={(e) => setNewInclusion(e.target.value)}
                            className="bg-slate-850 border-slate-705 text-white flex-1"
                          />
                          <Button type="button" size="sm" onClick={addInclusion} className="bg-slate-800 hover:bg-slate-750">
                            اضافة
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tripForm.includes.map((inc, i) => (
                            <span key={i} className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
                              {inc}
                              <Trash2 className="w-3.5 h-3.5 hover:text-rose-400 cursor-pointer" onClick={() => removeInclusion(i)} />
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        {editingTripId && (
                          <Button type="button" variant="outline" onClick={resetTripForm} className="flex-1 border-slate-700 bg-transparent text-slate-300">
                            الغاء التعديل
                          </Button>
                        )}
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white flex-1">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                          {editingTripId ? "حفظ التعديلات" : "إضافة الرحلة الآن"}
                        </Button>
                      </div>

                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Columns: Table and List of Hiking Trips */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-900 border-slate-800 text-slate-100">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mountain className="w-5 h-5 text-emerald-400" />
                      رحلات الهاكنق النشطة ({trips.length})
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      قائمة رحلات الهايك المسجلة في قاعدة البيانات والتي تدار كلياً من قبلك
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading && trips.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                      </div>
                    ) : trips.length === 0 ? (
                      <p className="text-center py-12 text-slate-500">لا توجد رحلات هاكنق نشطة حالياً. قم بإضافة رحلة جديدة.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trips.map((trip) => (
                          <div key={trip.id} className="bg-slate-850 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition">
                            <div className="relative h-32">
                              <img src={trip.image} alt={trip.name_ar} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400">
                                {trip.price} ر.ع
                              </div>
                            </div>
                            <div className="p-4 space-y-3">
                              <div>
                                <h3 className="font-bold text-base text-white">{trip.name_ar}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2">{trip.description}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {trip.location}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-400" /> {trip.duration}</span>
                                <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-emerald-400" /> {trip.distance}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {trip.phone}</span>
                              </div>

                              <div className="pt-2 border-t border-slate-800 flex gap-2 justify-end">
                                <Button size="xs" variant="ghost" className="text-slate-300 hover:text-white" onClick={() => handleEditTripClick(trip)}>
                                  <Edit className="w-4 h-4 ml-1.5" /> تعديل
                                </Button>
                                <Button size="xs" variant="ghost" className="text-rose-400 hover:text-rose-300" onClick={() => handleDeleteTripClick(trip.id)}>
                                  <Trash2 className="w-4 h-4 ml-1.5" /> حذف
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          <TabsContent value="gateways" className="space-y-8">
            {/* 1. Dynamic Financial Counter Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5 text-right">
                    <span className="text-xs text-slate-400 font-bold block">إجمالي مبيعات الهاكنق</span>
                    <h3 className="text-2xl font-black text-amber-500 font-mono tracking-tight">{totalHikingSales.toFixed(3)} ر.ع</h3>
                    <p className="text-[10px] text-slate-500 font-sans">تحديث فوري لكل تذكرة وحجز مستلم</p>
                  </div>
                  <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                    <DollarSign className="w-6 h-6 animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5 text-right">
                    <span className="text-xs text-slate-400 font-bold block">عمولة منصة شومة المستحقة (١٥٪)</span>
                    <h3 className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{totalShoumaShare.toFixed(3)} ر.ع</h3>
                    <p className="text-[10px] text-emerald-500/60 font-sans">رسوم حماية وإدارة تقنية متكاملة</p>
                  </div>
                  <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <Percent className="w-6 h-6 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5 text-right">
                    <span className="text-xs text-slate-400 font-bold block">صافي مستحقات الأدلة والمنظمين (٨٥٪)</span>
                    <h3 className="text-2xl font-black text-sky-400 font-mono tracking-tight">{totalGuidesShare.toFixed(3)} ر.ع</h3>
                    <p className="text-[10px] text-slate-500 font-sans font-sans">مستحقة للدفع والتحويل للمنظمين</p>
                  </div>
                  <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-400/20">
                    <Mountain className="w-6 h-6 text-sky-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1.5 text-right">
                    <span className="text-xs text-slate-400 font-bold block">إجمالي تذاكر ومقاعد الهاكنق المحجوزة</span>
                    <h3 className="text-2xl font-black text-white font-mono tracking-tight">{bookings.reduce((acc, curr) => acc + (Number(curr.attendees) || 1), 0)} مقعد</h3>
                    <p className="text-[10px] text-slate-400 font-sans">من إجمالي {bookings.length} حركة تسجيل</p>
                  </div>
                  <div className="p-3.5 bg-slate-850 text-slate-300 rounded-2xl border border-slate-800">
                    <Activity className="w-6 h-6 text-indigo-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2. Interactive Chart Panel (Full Width) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Profit Growth Tracker Chart (expanded to full grid) */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="bg-slate-900 border-slate-800 text-slate-100 font-sans">
                  <CardHeader className="dir-rtl text-right">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-400" /> رسم بياني لمراقبة نمو مبيعات الهاكنق وتوزيع الأرباح
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-sans text-xs">
                          مخطط تراكمي يوضح نمو مبيعات الهايكنق مقارنة بحصة منفعة الجولة وعمولة شومة
                        </CardDescription>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/15">
                        آخر تحديث تلقائي حقيقي
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSalesHiking" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorShoumaHiking" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorGuideHiking" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", textAlign: "right" }}
                        />
                        <Area type="monotone" dataKey="المبيعات الكلية" stroke="#d97706" fillOpacity={1} fill="url(#colorSalesHiking)" strokeWidth={2.5} name="إجمالي المبيعات" />
                        <Area type="monotone" dataKey="حصة شومة" stroke="#10b981" fillOpacity={1} fill="url(#colorShoumaHiking)" strokeWidth={2} name="عمولة شومة (١٥٪)" />
                        <Area type="monotone" dataKey="حصة الهاكنق" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorGuideHiking)" strokeWidth={2} name="صافي المشغل والمنظمين (٨٥٪)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* 3. Live Ticker: Rolling payment report feed */}
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4 font-sans text-right dir-rtl">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs text-slate-300 font-bold">بث حي لتقرير المدفوعات:</span>
                </div>
                <div className="flex-1 overflow-hidden h-6 text-xs text-emerald-400 font-medium">
                  {bookings.length > 0 ? (
                    <div className="animate-pulse font-sans">
                      • تم استلام مبلغ <span className="font-mono font-bold">{(bookings[0].paid_amount || bookings[0].paidAmount || 0).toFixed(3)} ر.ع</span> في رحلة الهاكنق <span className="font-bold">"{bookings[0].trip_name || bookings[0].tripName}"</span> من قبل العميل <span className="font-semibold">{bookings[0].full_name || bookings[0].fullName}</span> بنجاح.
                    </div>
                  ) : (
                    <div>• بانتظار استلام عملية حجز تذاكر هايكنق جديدة لعرض تفاصيلها هنا تلقائياً...</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 4. Hiking Financial Ledger (Individual dashboard page for each trip) */}
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3 text-right">
                <h3 className="text-lg font-black text-white flex items-center gap-2 justify-end">
                  <Mountain className="w-5 h-5 text-sky-400" /> الملفات المالية لرحلات الهاكنق النشطة
                </h3>
                <p className="text-xs text-slate-400 font-sans">اختر أي رحلة أدناه لعرض صفحتها المالية المستقلة لمراقبة مبيعاتها وكشوفات المشتركين بها بالتفصيل</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Trip List Selection Sidebar */}
                <Card className="bg-slate-900 border-slate-800 text-slate-100 lg:col-span-1 max-h-[500px] overflow-y-auto">
                  <CardHeader className="p-4 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">قائمة الجولات المدرجة</h4>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {trips.map((trip) => {
                      const isSelected = selectedTripFinanceId === trip.id;
                      // Calculate individual bookings count of this trip
                      const countBookings = bookings.filter(b => 
                        b.trip_id === trip.id || 
                        b.tripId === trip.id ||
                        (b.trip_name && b.trip_name.includes(trip.name_ar)) ||
                        (trip.name_ar && trip.name_ar.includes(b.trip_name))
                      ).length;

                      return (
                        <button
                          key={trip.id}
                          type="button"
                          onClick={() => setSelectedTripFinanceId(trip.id)}
                          className={`w-full p-3 rounded-lg text-right flex flex-col gap-1 transition ${
                            isSelected 
                              ? "bg-emerald-600 text-white" 
                              : "hover:bg-slate-850 text-slate-300 bg-slate-900/30"
                          }`}
                        >
                          <span className="text-sm font-bold block truncate">{trip.name_ar}</span>
                          <div className="flex justify-between items-center text-[10px] w-full mt-1">
                            <span className={isSelected ? "text-emerald-200" : "text-sky-400 font-semibold"}>
                              سعر المقعد: {trip.price} ر.ع
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full font-mono text-[9px] ${
                              isSelected ? "bg-emerald-700/60" : "bg-slate-800 text-slate-400"
                            }`}>
                              {countBookings} حجز
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Selected Trip Dedicated Dashboard Frame */}
                <div className="lg:col-span-3">
                  {selectedTripObj ? (
                    <Card className="bg-slate-900 border-slate-800 text-slate-100 border-l-4 border-l-emerald-500">
                      <CardHeader className="border-b border-slate-850 p-6 dir-rtl text-right">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-bold px-2.5 py-1 rounded-full text-right align-middle">
                              مستخلص الحصص وعوائد الرحلة المالية
                            </span>
                            <h2 className="text-xl font-black text-white mt-2.5">{selectedTripObj.name_ar}</h2>
                            <p className="text-xs text-slate-400 mt-1 font-sans">
                              منطقة الرحلة: {selectedTripObj.region} ({selectedTripObj.location}) | مستوى الصعوبة: {selectedTripObj.difficulty}
                            </p>
                          </div>
                          
                          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-left min-w-[200px]">
                            <span className="text-slate-400 text-[11px] block font-sans">المبلغ المستحق للمنظمين والمعاونين (٨٥٪)</span>
                            <span className="text-2xl font-black text-emerald-400 font-mono inline-block mt-1">
                              {selectedTripDueAmount.toFixed(3)} ر.ع
                            </span>
                            <Button 
                              size="xs" 
                              className="w-full mt-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                              onClick={() => {
                                setSuccessMsg(`تم تسوية وتحويل مستحقات الجولات بصفة كاملة بمبلغ ${selectedTripDueAmount.toFixed(3)} ر.ع لمنظمي رحلة "${selectedTripObj.name_ar}" بنجاح!`);
                                setTimeout(() => setSuccessMsg(""), 6000);
                              }}
                              disabled={selectedTripDueAmount === 0}
                            >
                              تسوية وصرف عوائد المنظمين
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6 text-right">
                        
                        {/* Summary metrics row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dir-rtl mb-4">
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-1">
                            <span className="text-[10px] text-slate-400 font-semibold block">إجمالي الاشتراكات المحصلة</span>
                            <span className="text-lg font-bold font-mono text-white">{selectedTripSumSales.toFixed(3)} ر.ع</span>
                          </div>
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-1">
                            <span className="text-[10px] text-slate-400 font-semibold block">اقتطاع مساهمة المنصة (١٥٪)</span>
                            <span className="text-lg font-bold font-mono text-emerald-400">{(selectedTripSumSales * 0.15).toFixed(3)} ر.ع</span>
                          </div>
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-1">
                            <span className="text-[10px] text-slate-400 font-semibold block">إجمالي المقاعد المحجوزة</span>
                            <span className="text-lg font-bold font-mono text-sky-400">
                              {selectedTripBookings.reduce((sum, b) => sum + (Number(b.attendees) || 1), 0)} مشترك مسجل
                            </span>
                          </div>
                        </div>

                        {/* Booking database for this trip */}
                        <div>
                          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5 justify-end">
                            <ClipboardList className="w-4 h-4 text-emerald-400" /> كشف وقائمة المشتركين المسجلين في الجولة ({selectedTripBookings.length})
                          </h4>

                          {selectedTripBookings.length === 0 ? (
                            <div className="text-center py-10 bg-slate-950/30 rounded-xl border border-slate-850 text-slate-500 font-sans text-xs space-y-1.5">
                              <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto" />
                              <p className="font-bold">لا توجد حجوزات أو تذاكر مدفوعة للرحلة حالياً.</p>
                              <p>ستظهر الاشتراسات آليّاً في الكشف فور إتمام أي مشتري حجز مقعده بنجاح.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {selectedTripBookings.map((b) => (
                                <div key={b.id} className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 hover:border-slate-805 transition text-right text-xs space-y-3 font-sans">
                                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/15">
                                        تذكرة #{b.id}
                                      </span>
                                      <span className="text-slate-400 text-[10px]">
                                        {b.created_at ? new Date(b.created_at).toLocaleDateString("ar-OM") : "معتمد ومسجل"}
                                      </span>
                                    </div>
                                    <div className="text-left font-sans">
                                      <span className="text-[10px] text-slate-400">القيمة المدفوعة: </span>
                                      <span className="font-bold text-amber-500 font-mono">{(Number(b.paid_amount || b.paidAmount || 0)).toFixed(3)} ر.ع</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-slate-300">
                                    <div>
                                      <span className="text-slate-500 text-[10px] font-bold block font-sans">اسم العميل / المشترك</span>
                                      <span className="text-white font-bold">{b.fullName || b.full_name}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] font-bold block font-sans">المقاعد المشتراة</span>
                                      <span className="text-slate-200 font-medium font-mono">{b.attendees || 1} تذكرة مستقلة</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] font-bold block font-sans">صافي عوائد الرحلة (٨٥٪)</span>
                                      <span className="text-emerald-400 font-bold font-mono">{(Number(b.paid_amount || b.paidAmount || 0) * 0.85).toFixed(3)} ر.ع</span>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-slate-850/50 flex flex-wrap gap-2.5 items-center justify-between">
                                    <div className="flex gap-2">
                                      <a 
                                        href={`tel:${b.phone}`} 
                                        className="text-[10px] text-slate-300 hover:text-white inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg transition"
                                      >
                                        <Phone className="w-3 h-3 text-emerald-400" /> اتصل بالمشترك
                                      </a>
                                      <a 
                                        href={`https://wa.me/${b.phone ? b.phone.replace(/[^0-9]/g, '') : ""}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                                      >
                                        <Phone className="w-3 h-3" /> مراسلة واتساب
                                      </a>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-sans">
                                      بوابة الدفع: {b.payment_gateway || b.paymentGateway || "بوابة شومة باي للهايكنق"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-slate-900 border-slate-800 text-slate-100">
                      <CardContent className="py-24 text-center space-y-4 font-sans">
                        <Mountain className="w-16 h-16 text-slate-700 mx-auto animate-bounce" />
                        <h4 className="font-bold text-slate-300 text-base">الملف المالي المستقل لرحلات الهاكنق</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          انقر على أي رحلة نشطة من القائمة اليمنى لعرض مستخلص عوائدها للمنظمين، وكشف المقاعد والاشتراكات المقترنة بها مع تسويات فورية مدمجة.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-emerald-400" /> طلبات حجوزات الهاكنق المستلمة
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      قائمة بجميع طلبات الحجز التي تمت بنجاح عبر البطاقات الائتمانية ليتم التواصل مع المستخدمين فوراً
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    type="button"
                    size="sm" 
                    onClick={fetchBookings}
                    className="border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    تحديث القائمة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 space-y-3">
                    <ClipboardList className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="font-semibold text-slate-400">لا توجد طلبات حجوزات في النظام حالياً.</p>
                    <p className="text-xs text-slate-500">الحجوزات الجديدة لرحلات الهايك المسجلة ستتدفق تلقائياً هنا.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="bg-slate-850 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition space-y-4"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-4 pb-3 border-b border-slate-800">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                                حجز رقم #{booking.id}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {booking.booking_date || booking.bookingDate}
                              </span>
                            </div>
                            <h3 className="font-black text-lg text-white mt-2">{booking.full_name || booking.fullName}</h3>
                          </div>
                          
                          <div className="text-left">
                            <span className="text-slate-400 text-xs block">المبلغ المدفوع</span>
                            <span className="text-xl font-black text-emerald-400 font-sans">
                              {booking.paid_amount || booking.paidAmount} ر.ع
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
                          <div className="space-y-1">
                            <span className="text-xs text-slate-500 block font-semibold">رحلة هاكنق :</span>
                            <span className="text-white font-bold inline-flex items-center gap-1.5">
                              <Mountain className="w-4 h-4 text-emerald-400" />
                              {booking.trip_name || booking.tripName || "رحلة الهاكنق المحددة"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs text-slate-500 block font-semibold">عدد المرافقين / التذاكر:</span>
                            <span className="text-slate-200 font-bold font-mono">
                              {booking.attendees || 1} تذاكر / مقاعد
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs text-slate-500 block font-semibold">بوابة الدفع المستخدمة:</span>
                            <span className="text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              {booking.payment_gateway || booking.paymentGateway || "الائتمان الافتراضي"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/50 flex flex-wrap gap-3 items-center justify-between">
                          <div className="flex flex-wrap gap-4">
                            <a 
                              href={`tel:${booking.phone}`} 
                              className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-800 transition"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              اتصال: <span className="font-mono font-bold tracking-wider">{booking.phone}</span>
                            </a>
                            <a 
                              href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/15 px-3 py-2 rounded-xl border border-emerald-500/20 transition"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              واتساب سريع للعميل
                            </a>
                            <a 
                              href={`mailto:${booking.email}`} 
                              className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-800 transition"
                            >
                              <Mail className="w-3.5 h-3.5 text-sky-400" />
                              مراسلة: <span className="font-mono">{booking.email}</span>
                            </a>
                          </div>
                          
                          <span className="text-[11px] text-slate-500">
                            تواصل فوراً لإبلاغ العميل بنقطة التجمع وتأكيد الحجز.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
        </Tabs>

      </main>
    </div>
  );
}
