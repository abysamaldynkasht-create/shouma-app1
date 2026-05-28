import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { tourGuides } from "@/lib/tour-guides";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Mail, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function GuideDashboardPage() {
  const [, setLocation] = useLocation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for selected guide ID (1-6) - default to 1 (Ahmed)
  const [selectedGuideId, setSelectedGuideId] = useState<number>(1);

  // Get current selected guide info
  const currentGuide = tourGuides.find(g => g.id === selectedGuideId);

  // 1. Fetch guide availability
  const { data: availabilityMap, isLoading: isAvailabilityLoading } = useQuery<Record<number, boolean>>({
    queryKey: ["/api/tour-guides/availability"],
    queryFn: async () => {
      const resp = await fetch("/api/tour-guides/availability");
      if (!resp.ok) throw new Error("Failed to load guide availabilities");
      return resp.json();
    }
  });

  // 2. Fetch requests for the selected guide
  const { data: requests, isLoading: isRequestsLoading } = useQuery<any[]>({
    queryKey: ["/api/tour-requests", { guideId: selectedGuideId }],
    queryFn: async () => {
      const resp = await fetch(`/api/tour-requests?guideId=${selectedGuideId}`);
      if (!resp.ok) throw new Error("Failed to load requests");
      return resp.json();
    }
  });

  // 3. Mutation to toggle availability
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, availability }: { id: number; availability: boolean }) => {
      const resp = await fetch(`/api/tour-guides/${id}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });
      if (!resp.ok) throw new Error("Failed to update availability");
      return resp.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tour-guides/availability"] });
      toast({
        title: "تم تحديث حالة التوفر",
        description: data.availability ? "أنت متاح الآن لاستقبال طلبات الرحلات" : "أنت غير متاح حالياً لاستقبال الطلبات",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة التوفر، يرجى المحاولة لاحقاً",
        variant: "destructive",
      });
    },
  });

  // 4. Mutation to update request status (accept / reject)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: "accepted" | "rejected" }) => {
      const resp = await fetch(`/api/tour-requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!resp.ok) throw new Error("Failed to update status");
      return resp.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tour-requests", { guideId: selectedGuideId }] });
      toast({
        title: data.status === "accepted" ? "تم قبول طلب الرحلة" : "تم رفض الطلب",
        description: data.status === "accepted" ? "تم قبول الطلب وتسجيل الرحلة بنجاح" : "تم رفض الطلب بنجاح",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الطلب",
        variant: "destructive",
      });
    },
  });

  const isAvailable = availabilityMap?.[selectedGuideId] ?? currentGuide?.availability ?? true;

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const acceptedRequests = requests?.filter(r => r.status === "accepted") || [];
  const rejectedRequests = requests?.filter(r => r.status === "rejected") || [];

  const handleToggleAvailability = () => {
    toggleAvailabilityMutation.mutate({ id: selectedGuideId, availability: !isAvailable });
  };

  const handleUpdateStatus = (requestId: number, status: "accepted" | "rejected") => {
    updateStatusMutation.mutate({ requestId, status });
  };

  const openWhatsApp = (phone: string, userName: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const message = encodeURIComponent(`مرحباً ${userName}، أنا المرشد السياحي ${currentGuide?.nameAr}. لقد قمت بقبول طلب رحلتك عبر تطبيق شومة وتواصلت معك لبدء التنسيق.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans" dir="rtl">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              onClick={() => setLocation("/tour-guides")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors text-right"
            >
              <ArrowRight className="w-5 h-5 ml-1" />
              <span className="text-sm font-medium">الرجوع لتطبيق شومة</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <UserCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">لوحة تحكم المرشدين السياحيين</span>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Selector Banner */}
        <div className="bg-gradient-to-l from-primary/10 via-background to-background border border-primary/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">تخصيص لوحة التحكم والتحقق</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">اختر حساب المرشد السياحي الذي تود إدارة طلباته والتحكم في توفره</p>
            </div>
          </div>
          
          <div className="w-full md:w-auto min-w-[240px]">
            <select
              value={selectedGuideId}
              onChange={(e) => setSelectedGuideId(parseInt(e.target.value, 10))}
              className="w-full h-11 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none shadow-sm cursor-pointer"
            >
              {tourGuides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nameAr} - {g.city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Guide Status section */}
        {currentGuide && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="h-2 w-full bg-primary" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                    <img src={currentGuide.image} alt={currentGuide.nameAr} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">{currentGuide.nameAr}</h3>
                    <p className="text-sm text-primary font-medium mt-0.5">{currentGuide.specializationAr}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{currentGuide.city}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">حالة التوفر الحالية:</span>
                    <Badge 
                      variant={isAvailable ? "default" : "secondary"}
                      className={isAvailable ? "bg-green-600 hover:bg-green-700 text-white" : "bg-slate-500 text-white"}
                    >
                      {isAvailable ? "متوفر حالياً" : "غير متوفر"}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    عندما تكون حالتك "غير متوفر"، سيتم كتابة "المرشد غير متاح حالياً" للمستخدم في التطبيق ويتم منع إرسال أي طلبات رحلة جديدة إليك.
                  </p>

                  <Button
                    onClick={handleToggleAvailability}
                    disabled={toggleAvailabilityMutation.isPending || isAvailabilityLoading}
                    className={`w-full py-2.5 h-auto font-bold rounded-xl flex items-center justify-center gap-2 transition-transform duration-200 active:scale-95 shadow-sm ${
                      isAvailable 
                        ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-green-600" />
                        اجعلني "غير متوفر"
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        تفعيل التوفر (متاح للطلبات)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick stats on bookings */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-6 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm text-slate-500 dark:text-slate-400">الطلبات الجديدة قيد التقييم</h4>
                  <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">{pendingRequests.length}</p>
                </div>
                <p className="text-xs text-amber-500 dark:text-amber-400/80 mt-4 font-medium">بحاجة لرد منك (قبول أو رفض)</p>
              </Card>

              <Card className="p-6 bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-905/40 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm text-slate-500 dark:text-slate-400">الرحلات النشطة المقبولة</h4>
                  <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2">{acceptedRequests.length}</p>
                </div>
                <p className="text-xs text-green-500 dark:text-green-400/80 mt-4 font-medium">يمكنك التواصل مع العملاء مباشرة</p>
              </Card>

              <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-4">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm text-slate-500 dark:text-slate-400">الطلبات المرفوضة</h4>
                  <p className="text-3xl font-black text-slate-600 dark:text-slate-400 mt-2">{rejectedRequests.length}</p>
                </div>
                <p className="text-xs text-slate-400 mt-4">سجل الطلبات المعتذرة</p>
              </Card>
            </div>
          </div>
        )}

        {/* Requests Management Section */}
        <div className="space-y-10">
          
          {/* 1. New Requests Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              الطلبات الجديدة (قيد الانتظار)
            </h3>

            {isRequestsLoading ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-400">
                جاري تحميل الطلبات الجديدة...
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800 dark:text-white">لا توجد طلبات معلقة حالياً</h4>
                <p className="text-sm text-slate-400 mt-1">عندما يقوم العميل بطلب رحلة، ستظهر تفاصيله هنا مباشرة لتقوم بقبولها أو رفضها.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingRequests.map((req) => (
                  <Card key={req.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Request Header */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium">طلب #{req.id}</span>
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">قيد الانتظار</Badge>
                      </div>

                      {/* Request Body */}
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                            {req.userName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{req.userName}</h4>
                            <p className="text-xs text-slate-400">{req.email}</p>
                          </div>
                        </div>

                        {/* Request Grid metadata */}
                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/55">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-slate-400">تاريخ الرحلة</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{req.tripDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-slate-400">الوجهة المطلوبة</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{req.destination}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-slate-400">عدد الأشخاص</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{req.groupSize} أشخاص</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-slate-400">عدد الساعات</p>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{req.hours} ساعة</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact info info list */}
                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 px-1">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>رقم الهاتف: <strong className="font-semibold text-slate-800 dark:text-slate-200">{req.phone}</strong></span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-2">
                          <p className="text-xs text-slate-400 font-bold mb-1">تفاصيل الرحلة والبرنامج:</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg leading-relaxed">{req.details || 'لا توجد تفاصيل إضافية مكتوبة.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
                      <Button
                        onClick={() => handleUpdateStatus(req.id, "accepted")}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-10 rounded-xl"
                      >
                        <CheckCircle2 className="w-4 h-4 ml-1.5" />
                        قبول الطلب
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(req.id, "rejected")}
                        disabled={updateStatusMutation.isPending}
                        variant="outline"
                        className="flex-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 border-slate-200 dark:border-slate-800 font-bold h-10 rounded-xl"
                      >
                        <XCircle className="w-4 h-4 ml-1.5" />
                        رفض الطلب
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* 2. Accepted Trips Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-930 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
              الرحلات المقبولة والنشطة
            </h3>

            {acceptedRequests.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-400 text-sm">
                لا توجد رحلات مقبولة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {acceptedRequests.map((req) => (
                  <Card key={req.id} className="border-green-100 dark:border-green-950/50 bg-green-50/10 dark:bg-green-950/5 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-750 dark:text-green-300 flex items-center justify-center font-bold">
                            {req.userName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-905 dark:text-white text-base">{req.userName}</h4>
                            <p className="text-xs text-slate-400">{req.email}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-600 text-white hover:bg-green-600">تم قبولها</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div>
                          <span className="text-slate-400">التاريخ:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{req.tripDate}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">الوجهة:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{req.destination}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">المجموع:</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{req.groupSize} أشخاص ({req.hours} ساعة)</p>
                        </div>
                        <div>
                          <span className="text-slate-400">الهاتف:</span>
                          <p className="font-bold text-slate-850 dark:text-slate-200 mt-0.5">{req.phone}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-350 line-clamp-2 italic bg-white/40 dark:bg-slate-900/20 p-2.5 rounded border border-slate-100/60 dark:border-slate-800">
                        "{req.details || 'لا توجد تفاصيل إضافية مكتوبة.'}"
                      </p>

                      <Button
                        onClick={() => openWhatsApp(req.phone, req.userName)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-md shadow-green-500/10 active:scale-95 transition-transform"
                      >
                        <Phone className="w-4 h-4" />
                        تواصل مع العميل (واتساب مباشر)
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* 3. Rejected Trips Section for reference */}
          {rejectedRequests.length > 0 && (
            <section className="opacity-70">
              <h3 className="text-base font-bold text-slate-500 mb-3">سجل الطلبات المرفوضة</h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50 shadow-sm">
                {rejectedRequests.map((req) => (
                  <div key={req.id} className="p-4 flex items-center justify-between text-sm flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400 font-bold">#{req.id}</div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{req.userName}</div>
                        <div className="text-xs text-slate-400">{req.tripDate} • {req.destination}</div>
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-red-150 hover:bg-red-150 text-red-700 dark:text-red-300 shadow-none border-0">تم الاعتذار</Badge>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
