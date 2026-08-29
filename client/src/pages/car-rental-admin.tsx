import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Car, 
  Mail, 
  Lock, 
  ArrowRight, 
  Key, 
  CheckCircle2, 
  LogOut, 
  TrendingUp, 
  ExternalLink,
  Users,
  Building,
  RefreshCw,
  Globe,
  Activity,
  ShieldCheck,
  Eye,
  EyeOff,
  SlidersHorizontal,
  DollarSign,
  Copy,
  Check
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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

interface AjarniLog {
  id: string;
  user: string;
  action: string;
  car: string;
  status: string;
  time: string;
}

export default function CarRentalAdminPage() {
  const [, setLocation] = useLocation();
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("shouma_cars_auth") === "true";
  });
  const [email, setEmail] = useState("cars@shouma.com");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Ajarni API Configuration & Analytics State
  const [apiKey, setApiKey] = useState("ajarni_live_sk_9823418872");
  const [bookingUrl, setBookingUrl] = useState("https://ajarni.om");
  const [webhookUrl, setWebhookUrl] = useState("https://ajarni.om/api/v1/shouma-referral");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [totalVisits, setTotalVisits] = useState(148);
  const [totalRentals, setTotalRentals] = useState(42);
  const [totalRevenueOMR, setTotalRevenueOMR] = useState(1680);
  const [recentLogs, setRecentLogs] = useState<AjarniLog[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch Stats from Server
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch("/api/ajarni/stats");
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey || "ajarni_live_sk_9823418872");
        setBookingUrl(data.bookingUrl || "https://ajarni.om");
        setWebhookUrl(data.webhookUrl || "https://ajarni.om/api/v1/shouma-referral");
        setTotalVisits(data.totalVisits ?? 148);
        setTotalRentals(data.totalRentals ?? 42);
        setTotalRevenueOMR(data.totalRevenueOMR ?? 1680);
        if (Array.isArray(data.recentLogs)) {
          setRecentLogs(data.recentLogs);
        }
      }
    } catch (e) {
      console.error("Error fetching Ajarni stats:", e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      const interval = setInterval(fetchStats, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg("");

    setTimeout(() => {
      if (email === "cars@shouma.com" && (password === "cars123" || password === "1234" || password === "admin")) {
        sessionStorage.setItem("shouma_cars_auth", "true");
        setIsAuthenticated(true);
      } else {
        setErrorMsg("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
      setIsLoggingIn(false);
    }, 600);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("shouma_cars_auth");
    setIsAuthenticated(false);
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch("/api/ajarni/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, bookingUrl, webhookUrl, status: "active" })
      });
      if (res.ok) {
        toast({
          title: "تم حفظ الإعدادات ومفتاح API",
          description: "تم تحديث إعدادات الربط المباشر ورابط الحجز بنجاح."
        });
      }
    } catch (e) {
      toast({
        title: "خطأ في الحفظ",
        description: "تعذر حفظ الإعدادات، يرجى المحاولة لاحقاً.",
        variant: "destructive"
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulateClick = async () => {
    try {
      const res = await fetch("/api/ajarni/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userLocation: "مسقط", carName: "تويوتا لاندكروزر" })
      });
      if (res.ok) {
        toast({
          title: "تم تسجيل تحويل جديد إلى أجرني (+1)",
          description: "تمت إضافة محاكاة خروج عميل إلى تطبيق أجرني."
        });
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateRental = async () => {
    try {
      const res = await fetch("/api/ajarni/track-rental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userLocation: "صلالة", carName: "نيسان باترول", amount: 50 })
      });
      if (res.ok) {
        toast({
          title: "تم تأكيد عقد استئجار (+1)",
          description: "تم استلام تأكيد حجز مكتمل عبر واجهة أجرني API."
        });
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetStats = async () => {
    if (!window.confirm("هل أنت أكتد من إعادة ضبط جميع الإحصائيات إلى الصفر؟")) return;
    try {
      await fetch("/api/ajarni/reset", { method: "POST" });
      toast({ title: "تم إعادة الضبط", description: "تم صفير الإحصائيات بنجاح." });
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const conversionRate = totalVisits > 0 
    ? ((totalRentals / totalVisits) * 100).toFixed(1) 
    : "0.0";

  // Recharts Dataset
  const chartData = useMemo(() => [
    { name: "الأحد", visits: Math.round(totalVisits * 0.12), rentals: Math.round(totalRentals * 0.1) },
    { name: "الإثنين", visits: Math.round(totalVisits * 0.15), rentals: Math.round(totalRentals * 0.14) },
    { name: "الثلاثاء", visits: Math.round(totalVisits * 0.18), rentals: Math.round(totalRentals * 0.18) },
    { name: "الأربعاء", visits: Math.round(totalVisits * 0.22), rentals: Math.round(totalRentals * 0.2) },
    { name: "الخميس", visits: Math.round(totalVisits * 0.28), rentals: Math.round(totalRentals * 0.25) },
    { name: "الجمعة", visits: Math.round(totalVisits * 0.35), rentals: Math.round(totalRentals * 0.32) },
    { name: "السبت", visits: totalVisits, rentals: totalRentals },
  ], [totalVisits, totalRentals]);

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 max-w-7xl mx-auto px-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/home")} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Button>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
            <Key className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">
            لوحة تحكم ربط أجرني (Ajarni API)
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            إدارة مفتاح واجهة برمجة التطبيقات ومتابعة إحصائيات المحالين والمستأجرين
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="border-border shadow-xl">
            <CardContent className="pt-6 space-y-6">
              {errorMsg && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">البريد الإلكتروني المسؤول</label>
                  <div className="relative">
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-10"
                      placeholder="cars@shouma.com"
                    />
                    <Mail className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">كلمة المرور</label>
                  <div className="relative">
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      placeholder="••••••••"
                    />
                    <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">تلميح تجريبي: كلمة المرور هي <code className="bg-muted px-1 rounded">1234</code> أو <code className="bg-muted px-1 rounded">cars123</code></p>
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isLoggingIn}>
                  {isLoggingIn ? "جاري التحقق..." : "تسجيل الدخول للوحة أجرني"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-foreground">إحصائيات وربط تطبيق أجرني</h1>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold text-xs">
                    <ShieldCheck className="w-3 h-3 ml-1" />
                    API متصل
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">تأجير السيارات الذكي عبر واجهة برمجة التطبيقات API</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={fetchStats} disabled={isLoadingStats} className="gap-1">
                <RefreshCw className={`w-4 h-4 ${isLoadingStats ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">تحديث</span>
              </Button>
              <LanguageSwitcher />
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 gap-1">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* API Integration Settings Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">مفتاح API الخاص بتطبيق أجرني (Ajarni Integration Key)</CardTitle>
                  <CardDescription>
                    ربط خدمات تأجير السيارات المباشرة بين منصة شومة وتطبيق أجرني الرسمي
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-sm px-3 py-1">
                الحالة: متصل وجاهز للربط
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">مفتاح واجهة برمجة التطبيقات (API Key)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="font-mono text-sm pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button variant="outline" onClick={handleCopyKey} className="gap-1">
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? "تم النسخ" : "نسخ"}</span>
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">رابط صفحة الحجز الرسمية (Booking Partner URL)</label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={bookingUrl}
                    onChange={(e) => setBookingUrl(e.target.value)}
                    className="font-mono text-sm flex-1"
                    placeholder="https://ajarni.om"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    title="فتح الرابط" 
                    onClick={() => window.open(bookingUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">رابط تحويل الإحالات (Referral Webhook)</label>
                <Input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="font-mono text-sm"
                  placeholder="https://ajarni.om/api/v1/shouma-referral"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
              <p className="text-xs text-muted-foreground">
                يتم تمرير مفتاح API لتشغيل واجهة الشريك، وعند ضغط المستخدم على قسم تأجير السيارات يتم نقله مباشرة إلى صفحة الحجز المربوطة بمفتاح API وتسجيل الإحالة تلقائياً.
              </p>
              <Button onClick={handleSaveConfig} disabled={isSavingConfig} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSavingConfig ? "جاري الحفظ..." : "حفظ مفتاح API والإعدادات"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Key Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">الذين ذهبوا إليهم (المحالين)</span>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-foreground mb-1">
                {totalVisits}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span>عدد المستخدمين الذين انتقلوا لتطبيق أجرني</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">الذين استأجروا (الحجوزات المكتملة)</span>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 mb-1">
                {totalRentals}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>عقود تأجير مؤكدة عبر أجرني API</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">نسبة التحويل (Conversion Rate)</span>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-purple-600 mb-1">
                {conversionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                نسبة المستأجرين الفعلية من إجمالي الزوار
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">إجمالي حجم التأجير المقدر</span>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-amber-600 mb-1">
                {totalRevenueOMR} <span className="text-sm font-normal text-muted-foreground">ر.ع</span>
              </div>
              <p className="text-xs text-muted-foreground">
                إجمالي المبيعات الممررة عبر منصة أجرني
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live Simulator & Quick Actions */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  أدوات الاختبار والمحاكاة المباشرة
                </CardTitle>
                <CardDescription>
                  يمكنك محاكاة خروج عميل واستكمال حجز للاختبار والمتابعة الفورية
                </CardDescription>
              </div>

              <Button variant="ghost" size="sm" onClick={handleResetStats} className="text-destructive hover:bg-destructive/10 text-xs">
                تصفير الإحصائيات
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleSimulateClick} variant="outline" className="gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-50">
                <Users className="w-4 h-4" />
                <span>محاكاة خروج زائر إلى أجرني (+1 زيارة)</span>
              </Button>

              <Button onClick={handleSimulateRental} variant="outline" className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50">
                <CheckCircle2 className="w-4 h-4" />
                <span>محاكاة إتمام حجز ناجح عبر أجرني (+1 مستأجر)</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visual Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">مخطط حركة التحويلات والعقود الزمنية</CardTitle>
            <CardDescription>
              مقارنة بين عدد الزوار الذين ذهبوا إلى تطبيق أجرني وعدد الذين أتموا عملية الاستئجار
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRentals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="visits" name="الذين ذهبوا إليهم" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisits)" />
                  <Area type="monotone" dataKey="rentals" name="الذين استأجروا" stroke="#10b981" fillOpacity={1} fill="url(#colorRentals)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Logs Feed */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>سجل الحركات والإحالات المباشرة (Ajarni API Activity Feed)</span>
              <Badge variant="outline" className="font-normal text-xs">
                {recentLogs.length} حركة مسجلة
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                لا توجد حركات تسجيل حالياً. استخدم محاكاة الاختبار أعلاه.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                      <th className="p-3">المستخدم / المصدر</th>
                      <th className="p-3">نوع الحركة</th>
                      <th className="p-3">السيارة المطلوبة</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">التوقيت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log) => {
                      const isRental = log.action.includes("حجز") || log.status.includes("مكتمل");
                      return (
                        <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3 font-medium text-foreground">{log.user}</td>
                          <td className="p-3 text-muted-foreground">{log.action}</td>
                          <td className="p-3">{log.car}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={isRental ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}>
                              {log.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">{log.time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
