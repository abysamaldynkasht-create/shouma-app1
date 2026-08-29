import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Tv, 
  Image as ImageIcon, 
  Layout, 
  ExternalLink,
  Save,
  Loader2,
  RefreshCw,
  Eye,
  Megaphone
} from "lucide-react";

export default function MarkAdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  // Authentication State
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem("shouma_marketing_auth") === "true";
  });
  const [email, setEmail] = useState("marketing@shouma.com");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!email || !password) {
      setAuthError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/portal-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalType: "marketing", email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthorized(true);
        sessionStorage.setItem("shouma_marketing_auth", "true");
        setAuthError("");
      } else {
        setAuthError(data.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }
    } catch (err) {
      setAuthError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"ads" | "splash">("ads");
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [isCreatingAd, setIsCreatingAd] = useState(false);

  // New/Editing Ad Form States
  const [adForm, setAdForm] = useState({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    image_url: "",
    link: "",
    is_active: true
  });

  // Splash Screen Config Form States
  const [splashForm, setSplashForm] = useState({
    title: "",
    title_ar: "",
    subtitle: "",
    subtitle_ar: "",
    background_type: "landscape", // 'landscape' | 'image'
    background_image: ""
  });

  // Load active and inactive ads
  const { data: ads = [], isLoading: loadingAds } = useQuery<any[]>({
    queryKey: ["/api/marketing-ads/all"],
    queryFn: async () => {
      const res = await fetch("/api/marketing-ads/all");
      if (!res.ok) throw new Error("Failed to load all ads");
      return res.json();
    }
  });

  // Load splash config
  const { data: splashConfig, isLoading: loadingSplash } = useQuery<any>({
    queryKey: ["/api/splash-config"],
    queryFn: async () => {
      const res = await fetch("/api/splash-config");
      if (!res.ok) throw new Error("Failed to load splash config");
      const data = await res.json();
      // Initialize form with fetched data
      setSplashForm({
        title: data.title || "Welcome to Shouma",
        title_ar: data.title_ar || "مرحباً بكم في شومة",
        subtitle: data.subtitle || "Your smart integrated tour guide in the Sultanate of Oman",
        subtitle_ar: data.subtitle_ar || "دليلك السياحي الذكي المتكامل في سلطنة عُمان",
        background_type: data.background_type || "landscape",
        background_image: data.background_image || ""
      });
      return data;
    }
  });

  // Create Ad Mutation
  const createAdMutation = useMutation({
    mutationFn: async (newAd: typeof adForm) => {
      const res = await apiRequest("POST", "/api/marketing-ads", newAd);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تمت إضافة الإعلان بنجاح" : "Advertisement added successfully",
        description: isRTL ? "سيظهر الإعلان في شريط الواجهة الرئيسية تلقائياً." : "The ad will display on the home screen carousel.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-ads/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-ads"] });
      setIsCreatingAd(false);
      resetAdForm();
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: isRTL ? "حدث خطأ أثناء الإضافة" : "Failed to add advertisement",
        description: err.message || "Please check your parameters.",
      });
    }
  });

  // Update Ad Mutation
  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof adForm }) => {
      const res = await apiRequest("PUT", `/api/marketing-ads/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم تحديث الإعلان" : "Advertisement updated",
        description: isRTL ? "تم حفظ التعديلات ونشرها بنجاح." : "Your changes have been saved and applied successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-ads/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-ads"] });
      setEditingAd(null);
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل التحديث" : "Update failed",
        description: err.message,
      });
    }
  });

  // Delete Ad Mutation
  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/marketing-ads/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم حذف الإعلان" : "Advertisement deleted",
        description: isRTL ? "تمت إزالة الإعلان الترويجي نهائياً." : "The promotional ad has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-ads/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-ads"] });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل الحذف" : "Deletion failed",
        description: err.message,
      });
    }
  });

  // Update Splash Config Mutation
  const saveSplashMutation = useMutation({
    mutationFn: async (data: typeof splashForm) => {
      const res = await apiRequest("POST", "/api/splash-config", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم تحديث شاشة الترحيب" : "Splash config saved",
        description: isRTL ? "سيشاهد المستخدمون المظهر الجديد عند تسجيل الدخول." : "Users will see the updated styling on the login screen.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/splash-config"] });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل الحفظ" : "Failed to save layout",
        description: err.message,
      });
    }
  });

  const resetAdForm = () => {
    setAdForm({
      title: "",
      title_ar: "",
      description: "",
      description_ar: "",
      image_url: "",
      link: "",
      is_active: true
    });
  };

  const handleEditAdClick = (ad: any) => {
    setEditingAd(ad);
    setAdForm({
      title: ad.title,
      title_ar: ad.title_ar,
      description: ad.description,
      description_ar: ad.description_ar,
      image_url: ad.image_url,
      link: ad.link || "",
      is_active: ad.is_active
    });
    setIsCreatingAd(false);
  };

  const handleCreateAdClick = () => {
    resetAdForm();
    setIsCreatingAd(true);
    setEditingAd(null);
  };

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAd) {
      updateAdMutation.mutate({ id: editingAd.id, data: adForm });
    } else {
      createAdMutation.mutate(adForm);
    }
  };

  const handleSplashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSplashMutation.mutate(splashForm);
  };

  // Recommended high-resolution beautiful Oman landscape photos for fast copy-pasting
  const recommendedBackgrounds = [
    {
      name: isRTL ? "رملة بدية الذهبية" : "Bidiya Golden Sands",
      url: "https://images.unsplash.com/photo-1542332213-9b5a5a3fda35?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: isRTL ? "جامع السلطان قابوس" : "Sultan Qaboos Mosque",
      url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: isRTL ? "مياه وادي شاب الخلابة" : "Emerald Wadi Shab",
      url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: isRTL ? "جبال الجبل الأخضر" : "Jebel Akhdar Terraces",
      url: "https://images.unsplash.com/photo-1602970471249-166ee50f7572?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans" dir={isRTL ? "rtl" : "ltr"}>
        <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />
          
          <div className="flex flex-col items-center text-center mt-4">
            <div className="p-4 bg-slate-800 rounded-full text-amber-400 mb-4 border border-slate-700">
              <Megaphone className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black text-white">لوحة التسويق والإعلانات والتطبيقات</h1>
            <p className="text-slate-400 text-xs mt-2">أدخل البريد الإلكتروني وكلمة المرور المضافة من المدير عبر لوحة التحكم الكبرى</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 text-right">
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marketing@shouma.com"
                className="w-full bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 transition-colors text-right dir-ltr"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••••"
                className="w-full bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 transition-colors text-center text-lg tracking-wider"
                required
              />
            </div>

            {authError && (
              <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-amber-500/20"
            >
              {isLoggingIn ? "جاري التحقق..." : "تسجيل الدخول للوحة التسويق"}
            </button>
          </form>

          <button onClick={() => setLocation("/home")} className="w-full mt-4 text-slate-500 hover:text-slate-300 text-xs text-center">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200" dir={isRTL ? "rtl" : "ltr"}>
      {/* Premium Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              className="hover:bg-slate-800 text-slate-400 hover:text-white transition-all rounded-full"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                  {isRTL ? "منصة شومة للمؤثرات والترويج" : "Shouma Marketing & Promotions Panel"}
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRTL 
                  ? "إدارة الإعلانات الممررة تلقائياً والتحكم في شاشة الترحيب والدخول" 
                  : "Manage scrolling spotlight ads and configure splash welcome screen layouts"
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/home")}
              className="hidden sm:inline-flex border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-950/20 text-amber-400 font-bold"
            >
              {isRTL ? "زيارة الواجهة العامة" : "View Public Site"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-8 p-1 bg-slate-900/50 rounded-xl max-w-md">
          <button
            onClick={() => {
              setActiveTab("ads");
              setEditingAd(null);
              setIsCreatingAd(false);
            }}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              activeTab === "ads"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Tv className="w-4 h-4" />
            {isRTL ? "إعلانات البانر الممررة" : "Scrolling Promo Ads"}
          </button>
          
          <button
            onClick={() => {
              setActiveTab("splash");
              setEditingAd(null);
              setIsCreatingAd(false);
            }}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
              activeTab === "splash"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layout className="w-4 h-4" />
            {isRTL ? "شاشة ترحيب الدخول" : "Splash Screen UI"}
          </button>
        </div>

        {/* Tab CONTENT: ADS MANAGER */}
        {activeTab === "ads" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ads List on Left / Main */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white">
                      {isRTL ? "قائمة الحملات الترويجية النشطة" : "Active Spotlight Campaigns"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {isRTL 
                        ? "هذه الإعلانات تظهر تلقائياً في شريط الصفحة الرئيسية للمستخدم" 
                        : "These advertisements rotate dynamically on the main landing slider"
                      }
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleCreateAdClick}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {isRTL ? "إعلان جديد" : "New Ad"}
                  </Button>
                </div>

                {loadingAds ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-sm text-slate-400">{isRTL ? "جاري تحميل قائمة الإعلانات..." : "Loading ad campaigns..."}</p>
                  </div>
                ) : ads.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl">
                    <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-300">{isRTL ? "لا توجد إعلانات حالياً" : "No advertisements configured"}</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {isRTL 
                        ? "قم بإضافة إعلانك الأول للبدء في عرضه لزوار المنصة." 
                        : "Add your first promotional slider to kickstart interactive marketing display."
                      }
                    </p>
                    <Button
                      onClick={handleCreateAdClick}
                      variant="outline"
                      className="mt-4 border-amber-500/20 text-amber-400"
                    >
                      {isRTL ? "إنشاء إعلانك الأول" : "Create First Ad"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ads.map((ad) => (
                      <div 
                        key={ad.id} 
                        className={`border rounded-xl p-4 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                          editingAd?.id === ad.id ? "border-amber-500 bg-amber-500/5 shadow-md" : "border-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <img 
                            src={ad.image_url} 
                            alt={ad.title} 
                            className="w-16 h-16 sm:w-20 sm:h-14 object-cover rounded-lg border border-slate-800 bg-slate-900"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542332213-9b5a5a3fda35?auto=format&fit=crop&w=300&q=80";
                            }}
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm sm:text-base">
                                {isRTL ? ad.title_ar : ad.title}
                              </h4>
                              {ad.is_active ? (
                                <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold rounded-full">
                                  {isRTL ? "نشط" : "Active"}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-500 text-[10px] font-bold rounded-full">
                                  {isRTL ? "متوقف" : "Draft"}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-md">
                              {isRTL ? ad.description_ar : ad.description}
                            </p>
                            {ad.link && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                                <ExternalLink className="w-2.5 h-2.5" />
                                {ad.link}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAdClick(ad)}
                            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg h-9 w-9"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(isRTL ? "هل أنت متأكد من حذف هذا الإعلان نهائياً؟" : "Are you sure you want to delete this ad?")) {
                                deleteAdMutation.mutate(ad.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg h-9 w-9"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Create/Edit Editor Form on Right */}
            <div className="lg:col-span-1">
              {isCreatingAd || editingAd ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-28 space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <Edit3 className="w-4.5 h-4.5 text-amber-500" />
                      {editingAd 
                        ? (isRTL ? "تعديل الإعلان الترويجي" : "Edit Ad Campaign") 
                        : (isRTL ? "إضافة إعلان جديد" : "Create Ad Spotlight")
                      }
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {isRTL ? "أدخل تفاصيل الإعلان بالعربية والإنجليزية" : "Provide bilingual fields and beautiful image URL"}
                    </p>
                  </div>

                  <form onSubmit={handleAdSubmit} className="space-y-4">
                    {/* EN Title */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">{isRTL ? "العنوان بالإنجليزية" : "English Title"}</Label>
                      <Input
                        value={adForm.title}
                        onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                        placeholder="e.g. Magical Desert Safari"
                        className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl"
                        required
                      />
                    </div>

                    {/* AR Title */}
                    <div className="space-y-1.5" dir="rtl">
                      <Label className="text-xs text-slate-400">{isRTL ? "العنوان بالعربية" : "Arabic Title"}</Label>
                      <Input
                        value={adForm.title_ar}
                        onChange={(e) => setAdForm({ ...adForm, title_ar: e.target.value })}
                        placeholder="مثال: سحر رمال بدية الذهبية"
                        className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl"
                        required
                      />
                    </div>

                    {/* EN Description */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">{isRTL ? "الوصف بالإنجليزية" : "English Description"}</Label>
                      <Textarea
                        value={adForm.description}
                        onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                        placeholder="Provide details about dates, special promos, packages"
                        className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl resize-none h-20"
                        required
                      />
                    </div>

                    {/* AR Description */}
                    <div className="space-y-1.5" dir="rtl">
                      <Label className="text-xs text-slate-400">{isRTL ? "الوصف بالعربية" : "Arabic Description"}</Label>
                      <Textarea
                        value={adForm.description_ar}
                        onChange={(e) => setAdForm({ ...adForm, description_ar: e.target.value })}
                        placeholder="تفاصيل التواريخ والخصومات والفعاليات"
                        className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl resize-none h-20"
                        required
                      />
                    </div>

                    {/* Image URL */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400 flex items-center justify-between">
                        <span>{isRTL ? "رابط الصورة" : "Image URL"}</span>
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      </Label>
                      <Input
                        value={adForm.image_url}
                        onChange={(e) => setAdForm({ ...adForm, image_url: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl text-xs font-mono"
                        required
                      />
                    </div>

                    {/* Link */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">{isRTL ? "وجهة النقر (رابط)" : "Click Action Link"}</Label>
                      <Input
                        value={adForm.link}
                        onChange={(e) => setAdForm({ ...adForm, link: e.target.value })}
                        placeholder="e.g. /hiking or custom website url"
                        className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl text-xs"
                      />
                    </div>

                    {/* Active Checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox"
                        id="ad_is_active"
                        checked={adForm.is_active}
                        onChange={(e) => setAdForm({ ...adForm, is_active: e.target.checked })}
                        className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/20 h-4 w-4"
                      />
                      <Label htmlFor="ad_is_active" className="text-xs font-medium cursor-pointer text-slate-300">
                        {isRTL ? "نشط ومتاح للعرض فوراً" : "Active and display live instantly"}
                      </Label>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingAd(null);
                          setIsCreatingAd(false);
                        }}
                        className="flex-1 hover:bg-slate-800 text-slate-300 rounded-xl"
                      >
                        {isRTL ? "إلغاء" : "Cancel"}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createAdMutation.isPending || updateAdMutation.isPending}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                      >
                        {createAdMutation.isPending || updateAdMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {isRTL ? "حفظ الإعلان" : "Save Ad"}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center py-12">
                  <Tv className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="font-bold text-white text-sm">{isRTL ? "محرر الترويج الذكي" : "Spotlight Editor"}</h4>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                    {isRTL 
                      ? "اضغط على أي إعلان لتعديل تفاصيله، أو أنشئ إعلاناً جديداً للتحكم في معروض البانر." 
                      : "Click any banner card to update its parameters, or create a brand new campaign to publish instantly."
                    }
                  </p>
                  <Button
                    onClick={handleCreateAdClick}
                    variant="outline"
                    className="mt-4 border-amber-500/20 text-amber-400 hover:bg-amber-950/20"
                  >
                    <Plus className="w-4 h-4" />
                    {isRTL ? "إنشاء إعلان ترويجي" : "Create New Ad"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab CONTENT: SPLASH CONFIG */}
        {activeTab === "splash" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor Config Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <Layout className="w-5 h-5 text-amber-500" />
                    {isRTL ? "مخصص شاشة الترحيب والدخول" : "Splash Screen Customize"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRTL 
                      ? "قم بتخصيص العناوين وصور الخلفية التي يشاهدها المستخدمون عند تسجيل الدخول" 
                      : "Configure custom headings, taglines, and immersive landscapes displayed on signup"
                    }
                  </p>
                </div>

                <form onSubmit={handleSplashSubmit} className="space-y-5 mt-6">
                  {/* AR Title */}
                  <div className="space-y-1.5" dir="rtl">
                    <Label className="text-xs text-slate-400">{isRTL ? "العنوان الرئيسي (عربي)" : "Welcome Title (AR)"}</Label>
                    <Input
                      value={splashForm.title_ar}
                      onChange={(e) => setSplashForm({ ...splashForm, title_ar: e.target.value })}
                      placeholder="مثال: مرحباً بكم في شومة"
                      className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl"
                      required
                    />
                  </div>

                  {/* EN Title */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">{isRTL ? "العنوان الرئيسي (إنجليزي)" : "Welcome Title (EN)"}</Label>
                    <Input
                      value={splashForm.title}
                      onChange={(e) => setSplashForm({ ...splashForm, title: e.target.value })}
                      placeholder="e.g. Welcome to Shouma"
                      className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl"
                      required
                    />
                  </div>

                  {/* AR Subtitle/Tagline */}
                  <div className="space-y-1.5" dir="rtl">
                    <Label className="text-xs text-slate-400">{isRTL ? "العنوان الفرعي / السطر الترويجي (عربي)" : "Tagline (AR)"}</Label>
                    <Input
                      value={splashForm.subtitle_ar}
                      onChange={(e) => setSplashForm({ ...splashForm, subtitle_ar: e.target.value })}
                      placeholder="مثال: دليلك السياحي الذكي المتكامل في سلطنة عُمان"
                      className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl"
                      required
                    />
                  </div>

                  {/* EN Subtitle/Tagline */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-400">{isRTL ? "العنوان الفرعي / السطر الترويجي (إنجليزي)" : "Tagline (EN)"}</Label>
                    <Input
                      value={splashForm.subtitle}
                      onChange={(e) => setSplashForm({ ...splashForm, subtitle: e.target.value })}
                      placeholder="e.g. Your smart integrated tour guide in Oman"
                      className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl"
                      required
                    />
                  </div>

                  {/* Background Type */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400">{isRTL ? "نوع الخلفية" : "Background Style"}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSplashForm({ ...splashForm, background_type: "landscape" })}
                        className={`py-3 px-4 border rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                          splashForm.background_type === "landscape"
                            ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Layout className="w-4 h-4" />
                        {isRTL ? "طبيعة عمانية متحركة" : "Animated Omani SVG"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSplashForm({ ...splashForm, background_type: "image" })}
                        className={`py-3 px-4 border rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                          splashForm.background_type === "image"
                            ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        {isRTL ? "صورة مخصصة عالية الجودة" : "Custom Quality Photo"}
                      </button>
                    </div>
                  </div>

                  {/* Custom Background Image Link */}
                  {splashForm.background_type === "image" && (
                    <div className="space-y-1.5 animate-fade-in">
                      <Label className="text-xs text-slate-400">{isRTL ? "رابط الصورة الخلفية" : "Custom Background Photo URL"}</Label>
                      <Input
                        value={splashForm.background_image}
                        onChange={(e) => setSplashForm({ ...splashForm, background_image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="bg-slate-950 border-slate-800 focus:border-amber-500 rounded-xl text-xs font-mono"
                        required
                      />

                      {/* Presets suggestions */}
                      <div className="pt-2">
                        <Label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">
                          {isRTL ? "مناظر طبيعية مقترحة للنسخ السريع" : "Recommended high-res landscape presets"}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {recommendedBackgrounds.map((preset) => (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => setSplashForm({ ...splashForm, background_image: preset.url })}
                              className="text-[10px] text-left p-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 truncate text-slate-400 block hover:text-white"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={saveSplashMutation.isPending}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    {saveSplashMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isRTL ? "حفظ التغييرات ونشر المظهر" : "Save and Publish Welcome Screen"}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Live Mock Screen Preview on Right */}
            <div className="lg:col-span-7 flex flex-col justify-start">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-28 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4.5 h-4.5 text-amber-400" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                      {isRTL ? "معاينة تفاعلية فورية لشاشة الدخول" : "Live Login Screen Preview"}
                    </h3>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full font-bold">
                    {isRTL ? "محاكاة الهاتف" : "Phone Emulator"}
                  </span>
                </div>

                {/* Simulated Login Screen Viewport */}
                <div className="relative border-4 border-slate-850 rounded-3xl h-[460px] overflow-hidden bg-slate-950 shadow-2xl flex flex-col justify-end p-6 select-none">
                  {/* Background element */}
                  <div className="absolute inset-0 z-0">
                    {splashForm.background_type === "image" && splashForm.background_image ? (
                      <div 
                        className="w-full h-full bg-cover bg-center transition-all duration-700"
                        style={{ backgroundImage: `url(${splashForm.background_image})` }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-black flex items-end justify-center">
                        {/* Static SVG outline of Omani Mountains mockup */}
                        <svg className="w-full h-32 text-amber-500/20 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
                          <path d="M0,224L120,202.7C240,181,480,139,720,138.7C960,139,1200,181,1320,202.7L1440,224L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
                        </svg>
                      </div>
                    )}
                    {/* Shadow masking */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  </div>

                  {/* Fake status bar */}
                  <div className="absolute top-2 left-0 right-0 px-4 flex justify-between text-[10px] text-white/50 font-mono z-10">
                    <span>10:42 OMR</span>
                    <span>5G 📶🔋</span>
                  </div>

                  {/* Brand and Tagline Display */}
                  <div className="relative z-10 text-center mb-6">
                    <div className="w-16 h-16 bg-amber-500/10 backdrop-blur border border-amber-500/20 rounded-full mx-auto flex items-center justify-center mb-3 text-amber-400 font-bold text-xl">
                      ش
                    </div>
                    <p className="text-amber-100 font-medium text-xs max-w-xs mx-auto drop-shadow-md">
                      {isRTL ? splashForm.subtitle_ar : splashForm.subtitle}
                    </p>
                  </div>

                  {/* Fake Login Card Form Layout */}
                  <div className="relative z-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="text-center">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {isRTL ? splashForm.title_ar : splashForm.title}
                      </h4>
                      <p className="text-[9px] text-amber-200/50 mt-0.5">
                        {isRTL ? "الرجاء إدخال بيانات الدخول" : "Please log in to continue"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="h-6 rounded bg-white/5 border border-white/10 w-full" />
                      <div className="h-6 rounded bg-white/5 border border-white/10 w-full" />
                    </div>

                    <div className="h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-[10px] cursor-not-allowed">
                      {isRTL ? "تسجيل الدخول" : "LOG IN"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
