import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Shield, Database, RefreshCw, Cpu, Activity, Server, FileText } from "lucide-react";

export default function DeveloperPortalPage() {
  const [, setLocation] = useLocation();
  const { isRTL } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auth state
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem("shouma_tech_auth") === "true";
  });
  const [email, setEmail] = useState("tech@shouma.com");
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
        body: JSON.stringify({ portalType: "tech", email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthorized(true);
        sessionStorage.setItem("shouma_tech_auth", "true");
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

  const handleResetDemo = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans">
        <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500" />
          
          <div className="flex flex-col items-center text-center mt-4">
            <div className="p-4 bg-slate-800 rounded-full text-emerald-400 mb-4 border border-slate-700">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">بوابة المطورين والدعم التقني</h1>
            <p className="text-slate-400 text-xs mt-2">أدخل البريد الإلكتروني وكلمة المرور المضافة من المدير عبر لوحة التحكم الكبرى</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 text-right">
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tech@shouma.com"
                className="w-full bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors text-right dir-ltr"
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
                className="w-full bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors text-center text-lg tracking-wider"
                required
              />
            </div>

            {authError && (
              <p className="text-rose-400 text-xs text-center bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-950/20"
            >
              {isLoggingIn ? "جاري التحقق..." : "دخول بوابة التقنية"}
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Decorative Top Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md py-4 px-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/home")}
              className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                {isRTL ? "بوابة المطورين التقنية" : "Developer & Tech Portal"}
              </h1>
              <p className="text-xs text-slate-400">
                {isRTL ? "مراقبة الأنظمة ومحاكاة عمليات التشغيل والتحقق" : "System monitoring and operational validation control hub"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Status Banner */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 animate-pulse">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-emerald-400">
                {isRTL ? "جميع خوادم شوما تعمل بكفاءة" : "All Shouma Systems Operational"}
              </h3>
              <p className="text-xs text-slate-400">
                {isRTL ? "خادم الويب والاتصالات وقاعدة البيانات تعمل بشكل كامل" : "Active core node, database storage, and messaging gateways online"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemo}
            disabled={isRefreshing}
            className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRTL ? "تحديث الحالة" : "Refresh Status"}
          </Button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                <Database className="w-5 h-5" />
                {isRTL ? "تخزين البيانات وحالتها" : "Database & Storage Node"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isRTL ? "مراقبة جداول قاعدة البيانات والاتصالات النشطة" : "Active relational schema status and connection diagnostics"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 font-mono text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">Database Engine:</span>
                  <span className="text-emerald-400">PostgreSQL</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">SSL Status:</span>
                  <span className="text-emerald-400">Enabled</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">Pooled Connections:</span>
                  <span className="text-amber-400">Active</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Autocommit:</span>
                  <span className="text-emerald-400">True</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                <Server className="w-5 h-5" />
                {isRTL ? "بوابة اتصالات الرسائل والتحقق" : "Verification & SMS Gateways"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isRTL ? "حالة بوابات الرسائل القصيرة والبريد الإلكتروني للتحقق OTP" : "OTP SMS & Email delivery channels metrics"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 font-mono text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">SMS Gateway:</span>
                  <span className="text-emerald-400">Active (Firebase SMS)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">Email Gateway:</span>
                  <span className="text-emerald-400">Active (SMTP)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">Delivery Success Rate:</span>
                  <span className="text-emerald-400">99.8%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Current OTP Queue:</span>
                  <span className="text-slate-400">0 pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operational Metrics */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
              <Activity className="w-5 h-5" />
              {isRTL ? "إحصائيات الاتصال ونشاط الخادم" : "Server Operations & Performance"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 font-mono text-xs text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-500 block mb-1">CPU Usage</span>
                <span className="text-emerald-400 text-lg font-bold">12.4%</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-500 block mb-1">Memory Allocation</span>
                <span className="text-emerald-400 text-lg font-bold">148 MB</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-500 block mb-1">Response Time (AVG)</span>
                <span className="text-emerald-400 text-lg font-bold">42ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
