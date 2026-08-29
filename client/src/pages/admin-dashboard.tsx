import React, { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Compass,
  Accessibility,
  Flame,
  Activity,
  UploadCloud,
  Loader2,
  Lock,
  Eye,
  Star,
  ExternalLink,
  Map,
  Sparkles
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("attractions");
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // 1. ATTRACTIONS STATE
  const [attrName, setAttrName] = useState("");
  const [attrNameAr, setAttrNameAr] = useState("");
  const [attrDesc, setAttrDesc] = useState("");
  const [attrGov, setAttrGov] = useState("الداخلية");
  const [attrGovId, setAttrGovId] = useState("dakhiliyah");
  const [attrWilayat, setAttrWilayat] = useState("");
  const [attrCategory, setAttrCategory] = useState("nature");
  const [attrImage, setAttrImage] = useState("");
  const [attrMapUrl, setAttrMapUrl] = useState("");
  const [attrRating, setAttrRating] = useState("4.8");
  const [attrTags, setAttrTags] = useState("");

  // 2. DROB SHOUMA STATE
  const [drobName, setDrobName] = useState("");
  const [drobNameEn, setDrobNameEn] = useState("");
  const [drobDesc, setDrobDesc] = useState("");
  const [drobDescEn, setDrobDescEn] = useState("");
  const [drobLocation, setDrobLocation] = useState("");
  const [drobLocationEn, setDrobLocationEn] = useState("");
  const [drobGov, setDrobGov] = useState("الداخلية");
  const [drobGovEn, setDrobGovEn] = useState("Dakhiliyah");
  const [drobImage, setDrobImage] = useState("");
  const [drobRating, setDrobRating] = useState(4.8);
  const [drobMapUrl, setDrobMapUrl] = useState("");

  // 3. HIMAM SHOUMA STATE
  const [himamName, setHimamName] = useState("");
  const [himamNameEn, setHimamNameEn] = useState("");
  const [himamDesc, setHimamDesc] = useState("");
  const [himamDescEn, setHimamDescEn] = useState("");
  const [himamLocation, setHimamLocation] = useState("");
  const [himamLocationEn, setHimamLocationEn] = useState("");
  const [himamCategory, setHimamCategory] = useState("wheelchair");
  const [himamFeatures, setHimamFeatures] = useState("");
  const [himamFeaturesEn, setHimamFeaturesEn] = useState("");
  const [himamRating, setHimamRating] = useState(4.8);
  const [himamPhone, setHimamPhone] = useState("");
  const [himamMapUrl, setHimamMapUrl] = useState("");
  const [himamFullyAccessible, setHimamFullyAccessible] = useState(true);

  // 4. ACTIVITIES STATE
  const [actName, setActName] = useState("");
  const [actNameAr, setActNameAr] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actDescAr, setActDescAr] = useState("");
  const [actLocation, setActLocation] = useState("");
  const [actRegion, setActRegion] = useState("محافظة مسقط");
  const [actDuration, setActDuration] = useState("1-2 ساعة");
  const [actPrice, setActPrice] = useState("10 ر.ع");
  const [actImage, setActImage] = useState("");
  const [actRating, setActRating] = useState(4.8);
  const [actIncludes, setActIncludes] = useState("");
  const [actProvider, setActProvider] = useState("مكتب شومة للسياحة");
  const [actPhone, setActPhone] = useState("");
  const [actMapUrl, setActMapUrl] = useState("");

  // 5. SEASONS STATE (Reuses activities table)
  const [seaName, setSeaName] = useState("");
  const [seaNameAr, setSeaNameAr] = useState("");
  const [seaDesc, setSeaDesc] = useState("");
  const [seaDescAr, setSeaDescAr] = useState("");
  const [seaLocation, setSeaLocation] = useState("");
  const [seaRegion, setSeaRegion] = useState("محافظة ظفار");
  const [seaDuration, setSeaDuration] = useState("يونيو - سبتمبر");
  const [seaPrice, setSeaPrice] = useState("موسم سنوي");
  const [seaImage, setSeaImage] = useState("");
  const [seaRating, setSeaRating] = useState(4.9);
  const [seaIncludes, setSeaIncludes] = useState("");
  const [seaProvider, setSeaProvider] = useState("مكتب شومة للسياحة");
  const [seaPhone, setSeaPhone] = useState("");
  const [seaMapUrl, setSeaMapUrl] = useState("");

  // Queries for listing current items
  const { data: attractionsList = [], refetch: refetchAttractions } = useQuery<any[]>({
    queryKey: ["/api/catalog/attractions"],
    queryFn: async () => {
      const r = await fetch("/api/catalog/attractions");
      return r.ok ? r.json() : [];
    }
  });

  const { data: drobList = [], refetch: refetchDrob } = useQuery<any[]>({
    queryKey: ["/api/drob-shouma"],
    queryFn: async () => {
      const r = await fetch("/api/drob-shouma");
      return r.ok ? r.json() : [];
    }
  });

  const { data: himamList = [], refetch: refetchHimam } = useQuery<any[]>({
    queryKey: ["/api/himam-shouma"],
    queryFn: async () => {
      const r = await fetch("/api/himam-shouma");
      return r.ok ? r.json() : [];
    }
  });

  const { data: activitiesList = [], refetch: refetchActivities } = useQuery<any[]>({
    queryKey: ["/api/catalog/activities"],
    queryFn: async () => {
      const r = await fetch("/api/catalog/activities");
      return r.ok ? r.json() : [];
    }
  });

  // Separate activities into actual activities and seasons (based on price value or custom flag if we want)
  const isSeasonItem = (act: any) => {
    const prc = String(act.price || "").toLowerCase();
    const dur = String(act.duration || "").toLowerCase();
    return prc.includes("موسم") || prc.includes("season") || dur.includes("سبتمبر") || dur.includes("september") || prc.includes("مجاني");
  };

  const dbSeasonsList = activitiesList.filter(isSeasonItem);
  const dbOnlyActivitiesList = activitiesList.filter(a => !isSeasonItem(a));

  // Handle password submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "shouma2026") {
      setIsAuthenticated(true);
      toast({
        title: isRTL ? "تم تسجيل الدخول" : "Logged In Successfully",
        description: isRTL ? "مرحباً بك في لوحة تحكم شومة" : "Welcome to Shouma Control Dashboard",
      });
    } else {
      toast({
        title: isRTL ? "رمز مرور خاطئ" : "Invalid Password",
        description: isRTL ? "يرجى إدخال رمز المرور الصحيح" : "Please check your credentials and try again",
        variant: "destructive"
      });
    }
  };

  // Generic Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, stateSetter: (val: string) => void, fieldId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(fieldId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        stateSetter(data.url);
        toast({
          title: isRTL ? "تم رفع الصورة بنجاح!" : "Image Uploaded Successfully!",
          description: isRTL ? "رابط الصورة جاهز ومحفوظ" : "Image URL successfully registered."
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast({
        title: isRTL ? "خطأ في الرفع" : "Upload Error",
        description: isRTL ? "فشل رفع الصورة للخادم" : "Could not upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(null);
    }
  };

  // Submissions Mutators
  const createMutation = (url: string, refetchFn: () => void, successMsgAr: string, successMsgEn: string) => {
    return useMutation({
      mutationFn: async (payload: any) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Creation failed");
        return res.json();
      },
      onSuccess: () => {
        refetchFn();
        toast({
          title: isRTL ? "تم بنجاح" : "Success",
          description: isRTL ? successMsgAr : successMsgEn,
        });
      },
      onError: () => {
        toast({
          title: isRTL ? "خطأ" : "Error",
          description: isRTL ? "فشل حفظ البيانات بالخادم" : "Failed to persist data.",
          variant: "destructive"
        });
      }
    });
  };

  const deleteMutation = (url: string, refetchFn: () => void, deletedMsgAr: string) => {
    return useMutation({
      mutationFn: async (id: number) => {
        const res = await fetch(`${url}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        return true;
      },
      onSuccess: () => {
        refetchFn();
        toast({
          title: isRTL ? "تم الحذف" : "Deleted",
          description: deletedMsgAr,
        });
      }
    });
  };

  // Mutators Setup
  const attrMut = createMutation("/api/catalog/attractions", refetchAttractions, "تم إضافة المكان السياحي بنجاح", "Attraction added successfully");
  const attrDel = deleteMutation("/api/catalog/attractions", refetchAttractions, "تم حذف المكان السياحي بنجاح");

  const drobMut = createMutation("/api/drob-shouma", refetchDrob, "تم إضافة مسار دروب شومة بنجاح", "Drob Shouma path added successfully");
  const drobDel = deleteMutation("/api/drob-shouma", refetchDrob, "تم حذف المسار بنجاح");

  const himamMut = createMutation("/api/himam-shouma", refetchHimam, "تم إضافة موقع همم شومة بنجاح", "Himam Shouma place added successfully");
  const himamDel = deleteMutation("/api/himam-shouma", refetchHimam, "تم حذف الموقع بنجاح");

  const actMut = createMutation("/api/catalog/activities", refetchActivities, "تم إضافة النشاط بنجاح", "Activity added successfully");
  const actDel = deleteMutation("/api/catalog/activities", refetchActivities, "تم حذف النشاط بنجاح");

  // Submissions Forms
  const handleAttrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrNameAr) {
      toast({ title: "يرجى تعبئة الاسم بالعربية", variant: "destructive" });
      return;
    }
    attrMut.mutate({
      name: attrName || "", // Optional, translated under the hood if omitted
      nameAr: attrNameAr,
      description: attrDesc,
      governorate: attrGov,
      governorateId: attrGovId,
      wilayat: attrWilayat || "غير محدد",
      category: attrCategory,
      image: attrImage || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
      mapUrl: attrMapUrl,
      rating: attrRating,
      tags: attrTags ? attrTags.split(",").map(t => t.trim()) : []
    }, {
      onSuccess: () => {
        setAttrName(""); setAttrNameAr(""); setAttrDesc(""); setAttrWilayat(""); setAttrImage(""); setAttrMapUrl(""); setAttrTags("");
      }
    });
  };

  const handleDrobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drobName) {
      toast({ title: "يرجى تعبئة اسم المسار بالعربية", variant: "destructive" });
      return;
    }
    drobMut.mutate({
      name: drobName,
      description: drobDesc,
      location: drobLocation,
      governorate: drobGov,
      image: drobImage || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
      rating: drobRating,
      map_url: drobMapUrl
    }, {
      onSuccess: () => {
        setDrobName(""); setDrobNameEn(""); setDrobDesc(""); setDrobDescEn(""); setDrobLocation(""); setDrobLocationEn(""); setDrobImage(""); setDrobMapUrl("");
      }
    });
  };

  const handleHimamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!himamName) {
      toast({ title: "يرجى تعبئة اسم الموقع بالعربية", variant: "destructive" });
      return;
    }
    himamMut.mutate({
      name: himamName,
      description: himamDesc,
      location: himamLocation,
      category: himamCategory,
      features: himamFeatures ? himamFeatures.split(",").map(f => f.trim()) : [],
      rating: himamRating,
      phone: himamPhone,
      map_url: himamMapUrl,
      fully_accessible: himamFullyAccessible
    }, {
      onSuccess: () => {
        setHimamName(""); setHimamNameEn(""); setHimamDesc(""); setHimamDescEn(""); setHimamLocation(""); setHimamLocationEn(""); setHimamFeatures(""); setHimamFeaturesEn(""); setHimamPhone(""); setHimamMapUrl("");
      }
    });
  };

  const handleActSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actNameAr || !actName) {
      toast({ title: "يرجى تعبئة الأسماء المطلوبة", variant: "destructive" });
      return;
    }
    actMut.mutate({
      name: actName,
      nameAr: actNameAr,
      description: actDesc,
      descriptionAr: actDescAr,
      location: actLocation,
      region: actRegion,
      duration: actDuration,
      price: actPrice,
      image: actImage || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
      rating: actRating,
      includes: actIncludes ? actIncludes.split(",").map(x => x.trim()) : [],
      provider: actProvider,
      phone: actPhone,
      mapUrl: actMapUrl
    }, {
      onSuccess: () => {
        setActName(""); setActNameAr(""); setActDesc(""); setActDescAr(""); setActLocation(""); setActImage(""); setActIncludes(""); setActPhone(""); setActMapUrl("");
      }
    });
  };

  const handleSeasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seaNameAr || !seaName) {
      toast({ title: "يرجى تعبئة الأسماء المطلوبة", variant: "destructive" });
      return;
    }
    // Saved inside the activities list with season attributes
    actMut.mutate({
      name: seaName,
      nameAr: seaNameAr,
      description: seaDesc,
      descriptionAr: seaDescAr,
      location: seaLocation,
      region: seaRegion,
      duration: seaDuration,
      price: seaPrice || "موسم سنوي",
      image: seaImage || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
      rating: seaRating,
      includes: seaIncludes ? seaIncludes.split(",").map(x => x.trim()) : [],
      provider: seaProvider,
      phone: seaPhone,
      mapUrl: seaMapUrl
    }, {
      onSuccess: () => {
        setSeaName(""); setSeaNameAr(""); setSeaDesc(""); setSeaDescAr(""); setSeaLocation(""); setSeaImage(""); setSeaIncludes(""); setSeaPhone(""); setSeaMapUrl("");
      }
    });
  };

  // Back arrow configuration
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans" dir={isRTL ? "rtl" : "ltr"}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none" />
        
        <Card className="w-full max-w-md bg-slate-900/80 border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-amber-600 absolute top-0 left-0" />
          <CardHeader className="text-center pt-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mx-auto mb-4 text-amber-500 animate-pulse">
              <Shield className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-100 tracking-tight">
              {isRTL ? "بوابة الإشراف والتحكم" : "Administrative Control Portal"}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              {isRTL ? "يرجى إدخال رمز المرور السري للوصول للوحة التحكم" : "Please input the passcode to authenticate session"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    type="password"
                    placeholder={isRTL ? "رمز المرور السري (shouma2026)" : "Secret passcode (shouma2026)"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="bg-slate-950/80 border-slate-800 focus:border-amber-500/50 pr-10 text-center font-mono text-slate-200"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all h-11">
                {isRTL ? "تسجيل الدخول الآمن" : "Authenticate Session"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLocation("/home")}
                className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                {isRTL ? "العودة للرئيسية" : "Back to Home"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Dynamic Background Flare */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Decorative top strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100"
            >
              <BackArrow className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span>لوحة التحكم وتغذية محتوى شومة</span>
              </h1>
              <p className="text-xs text-slate-400">إدارة وإدراج المواقع، المسارات، الأنشطة والفعاليات في قواعد البيانات</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Badge variant="outline" className="border-amber-500/30 text-amber-500 font-mono text-xs bg-amber-500/5">
              AD-ROOT@ONLINE
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation tabs */}
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-900/90 border border-slate-800/80 p-1.5 rounded-2xl h-auto">
            <TabsTrigger value="attractions" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all">
              <Compass className="w-4 h-4 ml-1.5 shrink-0" />
              الأماكن السياحية ({attractionsList.length})
            </TabsTrigger>
            <TabsTrigger value="drob" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all">
              <Map className="w-4 h-4 ml-1.5 shrink-0" />
              دروب شومة ({drobList.length})
            </TabsTrigger>
            <TabsTrigger value="himam" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all">
              <Accessibility className="w-4 h-4 ml-1.5 shrink-0" />
              همم شومة ({himamList.length})
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all">
              <Activity className="w-4 h-4 ml-1.5 shrink-0" />
              الأنشطة ({dbOnlyActivitiesList.length})
            </TabsTrigger>
            <TabsTrigger value="seasons" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all">
              <Calendar className="w-4 h-4 ml-1.5 shrink-0" />
              المواسم السياحية ({dbSeasonsList.length})
            </TabsTrigger>
          </TabsList>

          {/* ==================== 1. ATTRACTIONS TAB ==================== */}
          <TabsContent value="attractions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form card */}
              <Card className="lg:col-span-5 bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-500" />
                    إضافة مكان ومعلم سياحي جديد
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">أدخل تفاصيل المعلم السياحي ليتم عرضه وتصفحه ديناميكياً من الزوار</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAttrSubmit} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <Label htmlFor="attr_ar" className="text-slate-300 font-bold">الاسم بالعربية *</Label>
                      <Input id="attr_ar" value={attrNameAr} onChange={e => setAttrNameAr(e.target.value)} placeholder="مثال: جبل شمس" className="bg-slate-950 border-slate-800" required />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="attr_desc" className="text-slate-300 font-bold">الوصف والتفاصيل</Label>
                      <Textarea id="attr_desc" value={attrDesc} onChange={e => setAttrDesc(e.target.value)} placeholder="اكتب تفاصيل المعلم السياحي وتاريخه وميزاته..." rows={3} className="bg-slate-950 border-slate-800 resize-none leading-relaxed" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="attr_gov" className="text-slate-300 font-bold">المحافظة</Label>
                        <select
                          id="attr_gov"
                          value={attrGov}
                          onChange={e => {
                            setAttrGov(e.target.value);
                            // Auto map id
                            const govMap: Record<string, string> = {
                              "الداخلية": "dakhiliyah",
                              "ظفار": "dhofar",
                              "مسقط": "muscat",
                              "الشرقية": "sharqiyah",
                              "الباطنة": "batinah",
                              "مسندم": "musandam",
                              "الظاهرة": "dhahirah"
                            };
                            if (govMap[e.target.value]) setAttrGovId(govMap[e.target.value]);
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                        >
                          {["الداخلية", "ظفار", "مسقط", "الشرقية", "الباطنة", "مسندم", "الظاهرة"].map((g, i) => (
                            <option key={i} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="attr_wilayat" className="text-slate-300 font-bold">الولاية</Label>
                        <Input id="attr_wilayat" value={attrWilayat} onChange={e => setAttrWilayat(e.target.value)} placeholder="مثال: الحمراء" className="bg-slate-950 border-slate-800" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="attr_cat" className="text-slate-300 font-bold">الفئة الرئيسية</Label>
                        <select id="attr_cat" value={attrCategory} onChange={e => setAttrCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none">
                          <option value="nature">طبيعة ومناظر خلابة</option>
                          <option value="heritage">تراث وحصون وقرى</option>
                          <option value="markets">أسواق تقليدية ومولات</option>
                          <option value="entertainment">ترفيه وفعاليات ومقاهي</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="attr_rating" className="text-slate-300 font-bold">تقييم المكان</Label>
                        <Input id="attr_rating" value={attrRating} onChange={e => setAttrRating(e.target.value)} placeholder="4.8" className="bg-slate-950 border-slate-800" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="attr_image" className="text-slate-300 font-bold">رابط الصورة الرئيسية</Label>
                        <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                          {isUploading === "attr" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          رفع من الجهاز
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setAttrImage, "attr")} disabled={isUploading !== null} />
                        </label>
                      </div>
                      <Input id="attr_image" value={attrImage} onChange={e => setAttrImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="bg-slate-950 border-slate-800 text-[11px] font-mono" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label htmlFor="attr_map" className="text-slate-300 font-bold">رابط خريطة جوجل</Label>
                        <Input id="attr_map" value={attrMapUrl} onChange={e => setAttrMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." className="bg-slate-950 border-slate-800 font-mono text-[11px]" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="attr_tags" className="text-slate-300 font-bold">العلامات والدلالات (مفصولة بفاصلة ,)</Label>
                      <Input id="attr_tags" value={attrTags} onChange={e => setAttrTags(e.target.value)} placeholder="تخييم, جبال, شروق الشمس, مغامرة" className="bg-slate-950 border-slate-800" />
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-10 mt-2" disabled={attrMut.isPending}>
                      {attrMut.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                      إدراج المكان السياحي بقاعدة البيانات
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* List Card */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">الأماكن السياحية المضافة حالياً ({attractionsList.length})</h3>
                {attractionsList.length === 0 ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
                    لا تتوفر أي معالم مضافة بالخادم حالياً. أضف أول معلم بالمجاورة!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-1">
                    {attractionsList.map((attr) => (
                      <Card key={attr.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col justify-between">
                        <div>
                          <img src={attr.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400"} alt={attr.name_ar} className="h-32 w-full object-cover" />
                          <div className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-white text-sm">{attr.name_ar}</h4>
                              <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-[10px]">{attr.category === "nature" ? "طبيعة" : attr.category === "heritage" ? "تراث" : "ترفيه"}</Badge>
                            </div>
                            <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{attr.description}</p>
                            <div className="flex gap-2 text-slate-500 text-[10px] items-center">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              <span>{attr.governorate} - {attr.wilayat}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 pt-0 border-t border-slate-800/40 flex justify-between items-center bg-slate-950/40">
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">⭐ {attr.rating || '4.8'}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg" onClick={() => { if (confirm("هل أنت متأكد من الحذف؟")) attrDel.mutate(attr.id); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ==================== 2. DROB SHOUMA TAB ==================== */}
          <TabsContent value="drob" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-5 bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                    <Map className="w-5 h-5 text-amber-500" />
                    إضافة مسار ووجهة فريدة في "دروب شومة"
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">دروب شومة هي الجواهر والمغامرات الاستكشافية المخفية في جبال وسهول عُمان</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDrobSubmit} className="space-y-4 text-xs">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-amber-500 text-[11px] leading-relaxed flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                      <span>النظام يكتفي باللغة العربية وسيترجم الاسم، الوصف، الموقع والمحافظة تلقائياً للزوار الأجانب باستخدام ذكاء شومة الاصطناعي ✨</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="drob_ar" className="text-slate-300 font-bold">الاسم بالعربية *</Label>
                      <Input id="drob_ar" value={drobName} onChange={e => setDrobName(e.target.value)} placeholder="مثال: بحيرة زكت السرية" className="bg-slate-950 border-slate-800" required />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="drob_desc_ar" className="text-slate-300 font-bold">الوصف بالعربية</Label>
                      <Textarea id="drob_desc_ar" value={drobDesc} onChange={e => setDrobDesc(e.target.value)} placeholder="وصف المسار والمغامرة والصعوبة بالعربي..." rows={2} className="bg-slate-950 border-slate-800 resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="drob_loc_ar" className="text-slate-300 font-bold">الموقع (بالعربي)</Label>
                        <Input id="drob_loc_ar" value={drobLocation} onChange={e => setDrobLocation(e.target.value)} placeholder="ولاية المضيبي" className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="drob_gov_ar" className="text-slate-300 font-bold">المحافظة (بالعربي)</Label>
                        <Input id="drob_gov_ar" value={drobGov} onChange={e => setDrobGov(e.target.value)} placeholder="شمال الشرقية" className="bg-slate-950 border-slate-800" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="drob_image" className="text-slate-300 font-bold">رابط الصورة الرئيسية للمسار</Label>
                        <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                          {isUploading === "drob" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          رفع من الجهاز
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setDrobImage, "drob")} disabled={isUploading !== null} />
                        </label>
                      </div>
                      <Input id="drob_image" value={drobImage} onChange={e => setDrobImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="bg-slate-950 border-slate-800 font-mono text-[11px]" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="drob_rating" className="text-slate-300 font-bold">التقييم الجماهيري</Label>
                        <Input id="drob_rating" type="number" step="0.1" value={drobRating} onChange={e => setDrobRating(parseFloat(e.target.value) || 4.8)} className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="drob_map" className="text-slate-300 font-bold">رابط خريطة الإحداثيات</Label>
                        <Input id="drob_map" value={drobMapUrl} onChange={e => setDrobMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." className="bg-slate-950 border-slate-800 font-mono text-[11px]" />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-10 mt-2" disabled={drobMut.isPending}>
                      {drobMut.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                      إدراج المسار في دروب شومة
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* List Card */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">مسارات دروب شومة الحالية في قاعدة البيانات ({drobList.length})</h3>
                {drobList.length === 0 ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
                    لا تتوفر أي مسارات مضافة في دروب شومة حالياً.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-1">
                    {drobList.map((gem) => (
                      <Card key={gem.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col justify-between">
                        <div>
                          <img src={gem.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400"} alt={gem.name} className="h-32 w-full object-cover" />
                          <div className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-white text-sm">{gem.name}</h4>
                              <span className="text-[10px] text-slate-400">{gem.name_en}</span>
                            </div>
                            <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{gem.description}</p>
                            <div className="flex gap-2 text-slate-500 text-[10px] items-center">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              <span>{gem.governorate} - {gem.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 pt-0 border-t border-slate-800/40 flex justify-between items-center bg-slate-950/40">
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">⭐ {gem.rating || '4.8'}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg" onClick={() => { if (confirm("هل أنت متأكد من حذف هذا المسار؟")) drobDel.mutate(gem.id); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ==================== 3. HIMAM SHOUMA TAB ==================== */}
          <TabsContent value="himam" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-5 bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                    <Accessibility className="w-5 h-5 text-amber-500" />
                    إضافة موقع ميسر لذوي الهمم "همم شومة"
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">مواقع ومعالم مهيأة وميسرة بالكامل لتسهيل السياحة الآمنة لذوي الاحتياجات الخاصة وأصحاب الهمم</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleHimamSubmit} className="space-y-4 text-xs">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-amber-500 text-[11px] leading-relaxed flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                      <span>النظام يكتفي باللغة العربية وسيترجم الاسم، الوصف، الموقع والميزات تلقائياً للزوار الأجانب باستخدام ذكاء شومة الاصطناعي ✨</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="himam_ar" className="text-slate-300 font-bold">الاسم بالعربية *</Label>
                      <Input id="himam_ar" value={himamName} onChange={e => setHimamName(e.target.value)} placeholder="مثال: متنزه القرم الطبيعي" className="bg-slate-950 border-slate-800" required />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="himam_desc_ar" className="text-slate-300 font-bold">التيسير والتهيئة (بالعربي)</Label>
                      <Textarea id="himam_desc_ar" value={himamDesc} onChange={e => setHimamDesc(e.target.value)} placeholder="مثال: ممرات مستوية مناسبة ومواقف سيارات ودورات مياه مهيأة..." rows={2} className="bg-slate-950 border-slate-800 resize-none" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="himam_loc_ar" className="text-slate-300 font-bold">الموقع بالعربية</Label>
                      <Input id="himam_loc_ar" value={himamLocation} onChange={e => setHimamLocation(e.target.value)} placeholder="مسقط، القرم" className="bg-slate-950 border-slate-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="himam_cat" className="text-slate-300 font-bold">التصنيف الميسر</Label>
                        <select id="himam_cat" value={himamCategory} onChange={e => setHimamCategory(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none">
                          <option value="wheelchair">مهيأ للكراسي المتحركة</option>
                          <option value="entrances">مداخل ميسرة ومستوية</option>
                          <option value="restrooms">دورات مياه مخصصة</option>
                          <option value="support">خدمات ومرافق دعم شاملة</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="himam_rating" className="text-slate-300 font-bold">تقييم الملاءمة</Label>
                        <Input id="himam_rating" type="number" step="0.1" value={himamRating} onChange={e => setHimamRating(parseFloat(e.target.value) || 4.9)} className="bg-slate-950 border-slate-800" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="himam_features_ar" className="text-slate-300 font-bold">الميزات المهيأة بالعربية (مفصولة بفاصلة ,)</Label>
                      <Input id="himam_features_ar" value={himamFeatures} onChange={e => setHimamFeatures(e.target.value)} placeholder="ممرات مستوية, مواقف مخصصة, كراسي متحركة, لافتات برايل" className="bg-slate-950 border-slate-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="himam_phone" className="text-slate-300 font-bold">رقم التواصل</Label>
                        <Input id="himam_phone" value={himamPhone} onChange={e => setHimamPhone(e.target.value)} placeholder="+968 2456 7890" className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="himam_map" className="text-slate-300 font-bold">رابط الموقع على قوقل</Label>
                        <Input id="himam_map" value={himamMapUrl} onChange={e => setHimamMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." className="bg-slate-950 border-slate-800 font-mono text-[11px]" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse py-1">
                      <Switch id="himam_full" checked={himamFullyAccessible} onCheckedChange={setHimamFullyAccessible} />
                      <Label htmlFor="himam_full" className="text-slate-300 font-bold">ميسر بالكامل ومضمون 100%</Label>
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-10 mt-1" disabled={himamMut.isPending}>
                      {himamMut.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                      إدراج الموقع الميسر لذوي الهمم
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* List Card */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">الأماكن الحالية لذوي الهمم في قاعدة البيانات ({himamList.length})</h3>
                {himamList.length === 0 ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
                    لا تتوفر أي مواقع مضافة لذوي الهمم حالياً بالخادم.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-1">
                    {himamList.map((place) => (
                      <Card key={place.id} className="bg-slate-900 border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white text-sm">{place.name}</h4>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] bg-emerald-500/5">
                              {place.category === 'wheelchair' ? 'كراسي متحركة' : place.category === 'entrances' ? 'مداخل مستوية' : 'خدمات شاملة'}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{place.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(place.features) ? place.features : []).slice(0, 3).map((f: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-slate-950 text-slate-400 text-[9px] font-sans">{f}</Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 text-slate-500 text-[10px] items-center pt-1 border-t border-slate-800/20">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span>{place.location}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/30">
                          <span className="text-[10px] text-amber-500 font-bold">⭐ {place.rating || '4.9'}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg" onClick={() => { if (confirm("هل أنت متأكد من حذف هذا الموقع؟")) himamDel.mutate(place.id); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ==================== 4. ACTIVITIES TAB ==================== */}
          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-5 bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-500" />
                    إضافة نشاط أو فعالية مغامرات جديدة
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">أضف كتالوج الألعاب والتجارب السياحية والمغامرات كالخيول والجمال والهايكينج وغيرها</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleActSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="act_ar" className="text-slate-300 font-bold">الاسم بالعربية *</Label>
                        <Input id="act_ar" value={actNameAr} onChange={e => setActNameAr(e.target.value)} placeholder="مثال: ركوب الخيل في شاطئ السيب" className="bg-slate-950 border-slate-800" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="act_en" className="text-slate-300 font-bold">الاسم بالإنجليزية *</Label>
                        <Input id="act_en" value={actName} onChange={e => setActName(e.target.value)} placeholder="e.g. Horse Riding on Beach" className="bg-slate-950 border-slate-800 text-left font-mono" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="act_desc_ar" className="text-slate-300 font-bold">الوصف بالعربية</Label>
                        <Textarea id="act_desc_ar" value={actDescAr} onChange={e => setActDescAr(e.target.value)} placeholder="اكتب تفاصيل ومسار الرحلة والنشاط بالعربية..." rows={2} className="bg-slate-950 border-slate-800 resize-none" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="act_desc_en" className="text-slate-300 font-bold">الوصف بالإنجليزية</Label>
                        <Textarea id="act_desc_en" value={actDesc} onChange={e => setActDesc(e.target.value)} placeholder="English description..." rows={2} className="bg-slate-950 border-slate-800 resize-none text-left" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="act_loc" className="text-slate-300 font-bold">الموقع التفصيلي (بالعربي)</Label>
                        <Input id="act_loc" value={actLocation} onChange={e => setActLocation(e.target.value)} placeholder="مثال: شاطئ السيب" className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="act_reg" className="text-slate-300 font-bold">المحافظة</Label>
                        <select id="act_reg" value={actRegion} onChange={e => setActRegion(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none">
                          {['محافظة مسقط', 'محافظة ظفار', 'محافظة الداخلية', 'محافظة شمال الشرقية', 'محافظة جنوب الشرقية', 'محافظة مسندم', 'محافظة الظاهرة'].map((r, i) => (
                            <option key={i} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="act_dur" className="text-slate-300 font-bold">المدة المقترحة</Label>
                        <Input id="act_dur" value={actDuration} onChange={e => setActDuration(e.target.value)} placeholder="1 ساعة" className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="act_prc" className="text-slate-300 font-bold">السعر المقدر</Label>
                        <Input id="act_prc" value={actPrice} onChange={e => setActPrice(e.target.value)} placeholder="10 ر.ع" className="bg-slate-950 border-slate-800" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="act_image" className="text-slate-300 font-bold">رابط الصورة الرئيسية</Label>
                        <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                          {isUploading === "act" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          رفع من الجهاز
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setActImage, "act")} disabled={isUploading !== null} />
                        </label>
                      </div>
                      <Input id="act_image" value={actImage} onChange={e => setActImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="bg-slate-950 border-slate-800 font-mono text-[11px]" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="act_inc" className="text-slate-300 font-bold">ما تشمله التجربة (مفصول بفاصلة ,)</Label>
                      <Input id="act_inc" value={actIncludes} onChange={e => setActIncludes(e.target.value)} placeholder="مدرب محترف, خوذة أمان, مشروب بارد" className="bg-slate-950 border-slate-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="act_prov" className="text-slate-300 font-bold">مقدم الخدمة</Label>
                        <Input id="act_prov" value={actProvider} onChange={e => setActProvider(e.target.value)} placeholder="إسطبلات الخيل بالسيب" className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="act_phone" className="text-slate-300 font-bold">رقم تواصل مقدم الخدمة</Label>
                        <Input id="act_phone" value={actPhone} onChange={e => setActPhone(e.target.value)} placeholder="+968 9123 4567" className="bg-slate-950 border-slate-800" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="act_map" className="text-slate-300 font-bold">رابط خريطة قوقل لوجهة التجربة</Label>
                      <Input id="act_map" value={actMapUrl} onChange={e => setActMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." className="bg-slate-950 border-slate-800 font-mono text-[11px]" />
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-10 mt-2" disabled={actMut.isPending}>
                      {actMut.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                      إدراج التجربة والنشاط الجديد
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* List Card */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">الأنشطة الحالية المضافة بقاعدة البيانات ({dbOnlyActivitiesList.length})</h3>
                {dbOnlyActivitiesList.length === 0 ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
                    لا تتوفر أي أنشطة ديناميكية مضافة حالياً.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-1">
                    {dbOnlyActivitiesList.map((act) => (
                      <Card key={act.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col justify-between">
                        <div>
                          <img src={act.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400"} alt={act.name_ar} className="h-32 w-full object-cover" />
                          <div className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-white text-sm">{act.name_ar || act.name}</h4>
                              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 text-[10px] font-mono">{act.price}</Badge>
                            </div>
                            <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{act.description_ar || act.description}</p>
                            <div className="flex gap-2 text-slate-500 text-[10px] items-center">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              <span>{act.region} - {act.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 pt-0 border-t border-slate-800/40 flex justify-between items-center bg-slate-950/40">
                          <span className="text-[10px] text-amber-500 font-bold">⏱️ {act.duration}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg" onClick={() => { if (confirm("هل أنت متأكد من حذف هذا النشاط؟")) actDel.mutate(act.id); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ==================== 5. SEASONS TAB ==================== */}
          <TabsContent value="seasons" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-5 bg-slate-900/80 border-slate-800 backdrop-blur-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    إضافة مهرجان وموسم سياحي جديد
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">مواسم عُمان الرائعة مثل خريف ظفار، مهرجانات مسقط السنوية، والربيع وغيرها من المواسم الاستثنائية</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSeasonSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_ar" className="text-slate-300 font-bold">اسم الموسم بالعربية *</Label>
                        <Input id="sea_ar" value={seaNameAr} onChange={e => setSeaNameAr(e.target.value)} placeholder="مثال: موسم خريف ظفار السنوي" className="bg-slate-950 border-slate-800" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_en" className="text-slate-300 font-bold">الاسم بالإنجليزي *</Label>
                        <Input id="sea_en" value={seaName} onChange={e => setSeaName(e.target.value)} placeholder="e.g. Khareef Dhofar Season" className="bg-slate-950 border-slate-800 text-left font-mono" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_desc_ar" className="text-slate-300 font-bold">وصف الموسم بالعربية</Label>
                        <Textarea id="sea_desc_ar" value={seaDescAr} onChange={e => setSeaDescAr(e.target.value)} placeholder="وصف للأجواء، الفعاليات، المميزات بالتفصيل..." rows={3} className="bg-slate-950 border-slate-800 resize-none leading-relaxed" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_desc_en" className="text-slate-300 font-bold">الوصف بالإنجليزي</Label>
                        <Textarea id="sea_desc_en" value={seaDesc} onChange={e => setSeaDesc(e.target.value)} placeholder="English description..." rows={3} className="bg-slate-950 border-slate-800 resize-none text-left" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_loc" className="text-slate-300 font-bold">الموقع الرئيسي للموسم</Label>
                        <Input id="sea_loc" value={seaLocation} onChange={e => setSeaLocation(e.target.value)} placeholder="صلالة، محافظة ظفار" className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_reg" className="text-slate-300 font-bold">المحافظة</Label>
                        <select id="sea_reg" value={seaRegion} onChange={e => setSeaRegion(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none">
                          {['محافظة ظفار', 'محافظة مسقط', 'محافظة الداخلية', 'محافظة جنوب الشرقية', 'محافظة شمال الشرقية', 'محافظة مسندم', 'محافظة الظاهرة'].map((r, i) => (
                            <option key={i} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_dur" className="text-slate-300 font-bold">فترة الموسم السنوي</Label>
                        <Input id="sea_dur" value={seaDuration} onChange={e => setSeaDuration(e.target.value)} placeholder="مثال: يونيو - سبتمبر" className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_prc" className="text-slate-300 font-bold">التكلفة / تذكرة الدخول</Label>
                        <Input id="sea_prc" value={seaPrice} onChange={e => setSeaPrice(e.target.value)} placeholder="موسم سنوي أو دخول مجاني" className="bg-slate-950 border-slate-800" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="sea_image" className="text-slate-300 font-bold">رابط صورة الموسم الجمالية</Label>
                        <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                          {isUploading === "sea" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          رفع من الجهاز
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setSeaImage, "sea")} disabled={isUploading !== null} />
                        </label>
                      </div>
                      <Input id="sea_image" value={seaImage} onChange={e => setSeaImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="bg-slate-950 border-slate-800 font-mono text-[11px]" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sea_inc" className="text-slate-300 font-bold">الفعاليات المشمولة بالموسم (مفصولة بفاصلة ,)</Label>
                      <Input id="sea_inc" value={seaIncludes} onChange={e => setSeaIncludes(e.target.value)} placeholder="طبيعة خضراء, أمطار ورذاذ خفيف, فعاليات ثقافية, شلالات" className="bg-slate-950 border-slate-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_prov" className="text-slate-300 font-bold">المشرف / الجهة المنظمة</Label>
                        <Input id="sea_prov" value={seaProvider} onChange={e => setSeaProvider(e.target.value)} placeholder="بلدية ظفار" className="bg-slate-950 border-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="sea_phone" className="text-slate-300 font-bold">رقم تواصل الاستفسار</Label>
                        <Input id="sea_phone" value={seaPhone} onChange={e => setSeaPhone(e.target.value)} placeholder="+968 2323 2323" className="bg-slate-950 border-slate-800" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="sea_map" className="text-slate-300 font-bold">رابط الموقع الجغرافي للفعاليات</Label>
                      <Input id="sea_map" value={seaMapUrl} onChange={e => setSeaMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." className="bg-slate-950 border-slate-800 font-mono text-[11px]" />
                    </div>

                    <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-10 mt-2" disabled={actMut.isPending}>
                      {actMut.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                      إدراج الموسم السياحي الجديد
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* List Card */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">المواسم والمهرجانات الحالية بقاعدة البيانات ({dbSeasonsList.length})</h3>
                {dbSeasonsList.length === 0 ? (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
                    لا تتوفر أي مواسم أو مهرجانات مضافة حالياً.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-1">
                    {dbSeasonsList.map((sea) => (
                      <Card key={sea.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col justify-between">
                        <div>
                          <img src={sea.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400"} alt={sea.name_ar} className="h-32 w-full object-cover" />
                          <div className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-white text-sm">{sea.name_ar || sea.name}</h4>
                              <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px] bg-amber-500/5">{sea.price}</Badge>
                            </div>
                            <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{sea.description_ar || sea.description}</p>
                            <div className="flex gap-2 text-slate-500 text-[10px] items-center">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" />
                              <span>{sea.region} - {sea.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 pt-0 border-t border-slate-800/40 flex justify-between items-center bg-slate-950/40">
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">🗓️ {sea.duration}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg" onClick={() => { if (confirm("هل أنت متأكد من حذف هذا الموسم؟")) actDel.mutate(sea.id); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
