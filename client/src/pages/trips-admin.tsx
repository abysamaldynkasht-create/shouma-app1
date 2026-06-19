import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Users, 
  Calendar, 
  Globe, 
  MapPin, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  PlaneTakeoff, 
  Heart, 
  Compass, 
  ShieldCheck, 
  Info,
  Clock,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/شومة_1768320219408.jpg";

interface GroupTripRequest {
  id: number;
  numberOfPeople: number;
  numberOfDays: number;
  preferences: string[];
  country: string;
  arrivalDate: string;
  destinationPreference: string;
  selectedGovernorate: string | null;
  createdAt: string;
}

const preferenceTagsAr: Record<string, string> = {
  "adventures": "مغامرات واستكشاف",
  "exploration": "جولات ثقافية",
  "heritage": "تراث وتاريخ",
  "nature": "طبيعة وجبال",
  "entertainment": "ترفيه وفعاليات",
  "custom": "تخصيص مخصص",
};

export default function TripsAdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [requests, setRequests] = useState<GroupTripRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Adding Planned Trip State
  const [tripName, setTripName] = useState("");
  const [tripNameAr, setTripNameAr] = useState("");
  const [tripDesc, setTripDesc] = useState("");
  const [tripLoc, setTripLoc] = useState("");
  const [tripRegion, setTripRegion] = useState("");
  const [tripImg, setTripImg] = useState("");
  const [tripPrice, setTripPrice] = useState("");
  const [tripDur, setTripDur] = useState("");
  const [tripDist, setTripDist] = useState("");
  const [tripPhone, setTripPhone] = useState("+968 9000 0000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authenticate admin check
  const [authPassword, setAuthPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check local storage authorization if exists
    const isAuthed = localStorage.getItem("trips_admin_authorized") === "true";
    if (isAuthed) {
      setIsAuthorized(true);
    }
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === "shouma2026" || authPassword === "admin123") {
      setIsAuthorized(true);
      localStorage.setItem("trips_admin_authorized", "true");
      toast({
        title: "تم التحقق بنجاح",
        description: "مرحباً بك في لوحة تحكم الرحلات المتقدمة.",
      });
    } else {
      toast({
        title: "رمز غير صحيح",
        description: "الرجاء إدخال الرمز الصحيح للوجين الإشراف.",
        variant: "destructive",
      });
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/group-trips");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadRequests();
    }
  }, [isAuthorized]);

  const handleDeleteRequest = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب للرحلة الجماعية؟")) return;

    try {
      const res = await fetch(`/api/group-trips/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRequests(prev => prev.filter(req => req.id !== id));
        toast({
          title: "تم الحذف",
          description: "تم حذف طلب الرحلة بنجاح من النظام.",
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "فشل الحذف",
        description: "حدث خطأ أثناء محاولة حذف الطلب.",
        variant: "destructive",
      });
    }
  };

  const handleAddPlannedTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName || !tripNameAr || !tripLoc || !tripPrice) {
      toast({
        title: "حقول ناقصة",
        description: "يرجى تعبئة الحقول الأساسية المطلوبة.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: tripName,
        nameAr: tripNameAr,
        description: tripDesc || "تحديث قريباً من قبل المشرفين",
        location: tripLoc,
        region: tripRegion || "عُمان",
        image: tripImg || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80",
        gallery: [tripImg || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80"],
        difficulty: "moderate",
        duration: tripDur || "يوم كامل",
        distance: tripDist || "12 km",
        price: tripPrice,
        includes: ["مرشد سياحي معتمد", "النقل المريح والوقود", "أحدث أدوات السلامة والأمان", "الأطفال دون سن الـ 7 سنوات مجاناً!"],
        phone: tripPhone,
        rating: "4.9"
      };

      const res = await fetch("/api/hiking-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "تمت الإضافة بنجاح! 🎉",
          description: "تم نشر مسار الرحلة الجماعية بنجاح في الكتالوج السياحي.",
        });
        // Clear Form
        setTripName("");
        setTripNameAr("");
        setTripDesc("");
        setTripLoc("");
        setTripRegion("");
        setTripImg("");
        setTripPrice("");
        setTripDur("");
        setTripDist("");
      } else {
        throw new Error("Save error");
      }
    } catch (error) {
      toast({
        title: "خطأ بالخادم",
        description: "فشل إضافة وحفظ الرحلة الجديدة على الخادم.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-right dir-rtl">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <img src={logoImage} alt="شومة" className="h-16 mx-auto rounded-full border border-amber-500/20" />
            <h2 className="text-xl font-black text-white">لوحة تحكم الرحلات الجماعية</h2>
            <p className="text-xs text-slate-400">يرجى إدخال رمز المرور الآمن للوصول والتعديل الفوري</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">رمز الإشراف الخاص بك:</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-slate-950 border-slate-800 rounded-xl text-center text-white"
                style={{ color: '#ffffff', backgroundColor: '#020617' }}
                required
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all">
              تصفح لوحة التحكم والتحقق
            </Button>
          </form>

          <Button variant="ghost" onClick={() => setLocation("/home")} className="w-full text-slate-400 hover:text-white text-xs">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans text-right dir-rtl" style={{ direction: 'rtl' }}>
      {/* Header section */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="شومة" className="h-10 w-auto rounded-full border border-amber-500/10" />
            <div>
              <h1 className="text-md font-black text-amber-400 flex items-center gap-1.5">
                <PlaneTakeoff className="w-5 h-5" />
                تحكم وبث الرحلات الجماعية والهاكينق
              </h1>
              <p className="text-[10px] text-slate-400">لوحة الإشراف والتنظيم الفوري للوفود</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button size="xs" variant="outline" className="text-xs bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700" onClick={() => setLocation("/home")}>
              زيارة موقع شومة
            </Button>
            <Button size="xs" variant="destructive" className="text-xs cursor-pointer" onClick={() => {
              localStorage.removeItem("trips_admin_authorized");
              setIsAuthorized(false);
            }}>
              خروج آمن
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 text-right">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">طلبات المجموعات</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white">{requests.length} طلبات</div>
              <p className="text-[10px] text-slate-400 mt-1">طلبات قادمة للتسجيل والتفاوض</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-right">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">الحد الأدنى للعدد</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-amber-500">8 أشخاص</div>
              <p className="text-[10px] text-slate-400 mt-1">مفروض كتصديق على نموذج الحجز</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-right">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">فئة الصغار والأطفال</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-emerald-400">مجاناً كلياً</div>
              <p className="text-[10px] text-slate-400 mt-1">لكل الأطفال دون سن 7 سنوات</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-right">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">حالة شبكة الحجز</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white">متصلة وآمنة</div>
              <p className="text-[10px] text-emerald-500 mt-1 font-bold">● خادم شومة الرئيسي قيد التشغيل</p>
            </CardContent>
          </Card>
        </div>

        {/* Warning and Guidance section on rules */}
        <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300 leading-relaxed font-sans space-y-1">
            <p className="font-bold">⚠️ قواعد وضوابط الحجوزات الجماعية لشومة السياحية الكبرى:</p>
            <p>1. تم ضبط نظام نموذج تسجيل العميل على منع إنشاء أو رفع أي طلب للرحلات الجماعية يقل قوامه عن <strong>8 أشخاص</strong> كراشدين مسافرين.</p>
            <p>2. تم تعديل واجهات حجز العملاء لتذكير العميل بأن <strong>الأطفال دون سن الـ 7 سنوات مجاناً بالكامل</strong>، ولا يعاملون ماليًا ولا يُحتسبون من كوتا الحد الأدنى الـ 8.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Right column: Manage Submissions / Requests List */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-md font-bold text-white">طلبات عروض تفصيل الرحلات الجماعية من زوار الموقع</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">تظهر هنا المدخلات التي قام العملاء بتعبئتها في المسارات الجماعية المخصصة</CardDescription>
                  </div>
                  <Button size="xs" className="text-xs bg-slate-800 text-slate-100 hover:bg-slate-700" onClick={loadRequests}>تحديث الطلبات</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-12 text-center text-xs text-slate-400">جاري تحميل طلبات الوفود...</div>
                ) : requests.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-400">لا توجد طلبات رحلات جماعية حالياً</p>
                    <p className="text-xs text-slate-500">سوف تظهر الطلبات وحركات الحجز فور تقديمها بالصفحة الرئيسية للعملاء.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right font-sans">
                      <thead>
                        <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                          <th className="px-4 py-3 font-bold">العميل / البلد</th>
                          <th className="px-4 py-3 font-bold">العدد والأيام</th>
                          <th className="px-4 py-3 font-bold">تاريخ الوصول والوجهة</th>
                          <th className="px-4 py-3 font-bold">تفضيلات المغامرات</th>
                          <th className="px-4 py-3 font-bold text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {requests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-950/20 transition-colors">
                            <td className="px-4 py-4 space-y-1">
                              <span className="font-bold text-amber-400 block">{req.country || "طلب مجهول"}</span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Globe className="w-3 h-3 text-slate-500" />
                                {req.country}
                              </span>
                            </td>
                            <td className="px-4 py-4 space-y-1">
                              <span className="font-bold text-white block">{req.numberOfPeople} أشخاص</span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {req.numberOfDays} أيام جولة تفصيلية
                              </span>
                            </td>
                            <td className="px-4 py-4 space-y-1">
                              <span className="font-mono text-slate-300 block">{req.arrivalDate}</span>
                              <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {req.destinationPreference === "single" ? `محافظة: ${req.selectedGovernorate || "مسقط"}` : "محافظات متعددة وشاملة"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(req.preferences) && req.preferences.map((p, idx) => (
                                  <span key={idx} className="bg-slate-950 px-2 py-0.5 border border-slate-800 text-slate-300 rounded text-[9px]">
                                    {preferenceTagsAr[p] || p}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button 
                                onClick={() => handleDeleteRequest(req.id)}
                                className="p-1 px-2.5 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 hover:bg-red-900/30 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Left column: Add/Publish upcoming scheduled excursions */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-md font-bold text-white flex items-center gap-1.5 text-amber-500">
                  <Plus className="w-5 h-5 text-amber-400 animate-pulse" />
                  إنشاء وبث مسار رحلة جماعية جديدة
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">
                  أضف عروض رحلات هاكينق أو جولات جماعية مجدولة ليتم تسويقها في الموقع الإلكتروني لمجموعات 8+ أشخاص.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPlannedTripSubmit} className="space-y-4">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">اسم الرحلة الجماعية (بالعربية):</label>
                    <Input
                      placeholder="مثال: مغامرة جبل شمس الجماعية الشاملة"
                      value={tripNameAr}
                      onChange={(e) => setTripNameAr(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                      style={{ color: '#ffffff', backgroundColor: '#020617' }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">اسم الرحلة (بالإلنجليزية):</label>
                    <Input
                      placeholder="e.g. Jebel Shams Group Explorer"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white text-left"
                      dir="ltr"
                      style={{ color: '#ffffff', backgroundColor: '#020617' }}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">السعر للشخص (ر.ع):</label>
                      <Input
                        type="number"
                        placeholder="مثال: 45"
                        value={tripPrice}
                        onChange={(e) => setTripPrice(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        style={{ color: '#ffffff', backgroundColor: '#020617' }}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">المنطقة والولاية:</label>
                      <Input
                        placeholder="مثال: الحمراء - الداخلية"
                        value={tripLoc}
                        onChange={(e) => setTripLoc(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        style={{ color: '#ffffff', backgroundColor: '#020617' }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">المدة المقدرة:</label>
                      <Input
                        placeholder="مثال: 12 ساعة غداء وسكن"
                        value={tripDur}
                        onChange={(e) => setTripDur(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        style={{ color: '#ffffff', backgroundColor: '#020617' }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">المسافة كليو متر:</label>
                      <Input
                        placeholder="مثال: 8 كم"
                        value={tripDist}
                        onChange={(e) => setTripDist(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        style={{ color: '#ffffff', backgroundColor: '#020617' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">رابط صورة المعلم (المسار):</label>
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={tripImg}
                      onChange={(e) => setTripImg(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white text-left"
                      dir="ltr"
                      style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">الوصف والتفاصيل للمغامرين:</label>
                    <textarea
                      placeholder="وصف تفصيلي للأنشطة والمسار الصخري والصعود للقمة..."
                      value={tripDesc}
                      onChange={(e) => setTripDesc(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none"
                      style={{ color: '#ffffff', backgroundColor: '#020617' }}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs py-2 transition-all">
                    {isSubmitting ? "جاري البث والنشر على الخادم..." : "نشر المسار للعملاء 🚀"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>

      </main>
    </div>
  );
}
