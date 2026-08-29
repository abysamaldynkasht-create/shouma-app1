import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (programmerName: string) => void;
  onApplyClick: () => void;
  onAdminClick: () => void;
}

export default function Login({ onLoginSuccess, onApplyClick, onAdminClick }: LoginProps) {
  const [email, setEmail] = useState('hamadalhabsi208@gmail.com');
  const [password, setPassword] = useState('shouma2026');
  const [programmerName, setProgrammerName] = useState('حمد الحبسي');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      setLoading(false);
      return;
    }

    try {
      // Check against portal accounts
      const portalRes = await fetch('/api/portal-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalType: 'guides', email, password })
      });
      if (portalRes.ok) {
        const pData = await portalRes.json();
        if (pData.success) {
          sessionStorage.setItem('shouma_guide_id', '1');
          onLoginSuccess(pData.account.name || 'مدير بوابة المرشدين');
          setLoading(false);
          return;
        }
      }

      // Fetch current db guides
      const resp = await fetch('/api/local-tour-guides');
      let guides: any[] = [];
      if (resp.ok) {
        guides = await resp.json();
      }

      // Check if there is a match in db
      const matched = guides.find((g: any) => 
        (g.email && g.email.trim().toLowerCase() === email.trim().toLowerCase()) ||
        (g.phone && g.phone.replace(/[\s+]/g, '') === email.replace(/[\s+]/g, ''))
      );

      if (matched) {
        const expectedPassword = matched.password || 'shouma2026';
        if (password === expectedPassword || password === matched.phone) {
          // Store guide ID so dashboard and application reference him
          sessionStorage.setItem('shouma_guide_id', matched.id.toString());
          onLoginSuccess(matched.name_ar || matched.nameAr || matched.name || programmerName);
          setLoading(false);
          return;
        } else {
          setError('كلمة المرور المدخلة غير صحيحة لهذا المرشد');
          setLoading(false);
          return;
        }
      }

      // Fallback for static demo account
      if (email.trim().toLowerCase() === 'hamadalhabsi208@gmail.com' && password === 'shouma2026') {
        sessionStorage.setItem('shouma_guide_id', '1'); // Fallback demo ID
        onLoginSuccess(programmerName || 'حمد الحبسي');
        setLoading(false);
        return;
      }

      setError('عذراً، لم نجد أي مرشد سياحي مسجل بهذا البريد أو الهاتف في النظام');
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء فحص الحسابات، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden dir-rtl">
      {/* Background Graphic Illustration resembling a beautiful desert oasis / castle sunset */}
      <div 
         className="absolute inset-0 bg-cover bg-center select-none"
         style={{
           backgroundImage: 'linear-gradient(to bottom, rgba(30, 16, 50, 0.85) 0%, rgba(13, 15, 30, 0.95) 100%)',
         }}
      />

      {/* Stylized vector sun/mountains in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-purple-500/0 rounded-full blur-[80px]" />

      {/* Styled Castles/Desert vector peaks at the bottom */}
      <div className="absolute bottom-0 inset-x-0 h-40 opacity-20 pointer-events-none bg-repeat-x bg-bottom flex items-end justify-center gap-1">
        {[...Array(6)].map((_, idx) => (
          <div 
            key={idx} 
            className="w-24 bg-gradient-to-t from-slate-900 to-amber-900/40 rounded-t-3xl border-t border-slate-700/30"
            style={{ height: `${50 + (idx % 3) * 35}px` }}
          />
        ))}
      </div>

      {/* Custom Header Floating Logo */}
      <div className="absolute top-8 text-center flex flex-col items-center">
        <motion.div 
          onDoubleClick={onAdminClick}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl font-black text-amber-500 tracking-wider drop-shadow-lg font-mono flex items-center gap-2 cursor-pointer select-none"
          title="shouma"
        >
          <span>Shouma</span>
        </motion.div>
        <span className="text-sm font-medium text-slate-300 mt-2 tracking-wide font-sans text-center max-w-[280px] sm:max-w-none">دليلك الشامل لاكتشاف أجمل الوجهات السياحية والتجارب الفريدة</span>
      </div>

      {/* Login Card Container */}
      <motion.div 
        id="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative z-10 w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col justify-between"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            مرحباً بعودتك
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            سجل دخولك لاستكشاف عُمان ومرافقة المغامرين
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/15 border border-red-500/30 text-red-200 rounded-xl text-xs flex items-center gap-1.5">
            <span className="text-sm">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {/* Custom Programmer Name Field for greeting customizability */}
          <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-2xl mb-4">
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>اسم المبرمج (لعرضه في جملة الترحيب اللامعة):</span>
            </div>
            <input
              id="programmer-name-input"
              type="text"
              value={programmerName}
              onChange={(e) => setProgrammerName(e.target.value)}
              placeholder="اكتب اسم المبرمج هنا..."
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-amber-300 placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500/50 transition-all font-medium animate-pulse"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">اسم المستخدم أو البريد الإلكتروني</label>
            <input
              id="username-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hamadalhabsi208@gmail.com"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex justify-between">
              <span>كلمة المرور</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-4 pl-12 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-amber-500 transition-colors z-20 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-login-submit"
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 rounded-2xl font-bold tracking-wide transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              تسجيل الدخول
            </button>
          </div>
        </form>

        {/* Applying Option & Switch Action */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col gap-3">
          <button
            id="btn-nav-apply"
            type="button"
            onClick={onApplyClick}
            className="w-full py-3 bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700/50 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-500" />
            <span>التقديم ك مرشد سياحي لدى shouma</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
