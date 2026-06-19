import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MapPin, Phone, Clock, FileText, Globe, User, Send, ChevronLeft, ArrowRight } from 'lucide-react';
import { GuideApplication, OfficeConfig } from '../types';
import { DEFAULT_OFFICE } from '../initialData';

interface ApplyFormProps {
  onBackToLogin: () => void;
}

const GOVERNORATES = [
  'مسقط', 'ظفار', 'مسندم', 'البريمي', 'الداخلية', 'شمال الباطنة', 'جنوب الباطنة', 'جنوب الشرقية', 'شمال الشرقية', 'الظاهرة', 'الوسطى'
];

const POPULAR_LANGUAGES = [
  'العربية', 'الإنجليزية', 'الفرنسية', 'الألمانية', 'الإيطالية', 'الروسية', 'الصينية', 'اليابانية', 'الهندية'
];

export default function ApplyForm({ onBackToLogin }: ApplyFormProps) {
  // Form Fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('عماني');
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['العربية']);
  const [description, setDescription] = useState('');

  // Statuses
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [office, setOffice] = useState<OfficeConfig>(DEFAULT_OFFICE);
  const [errorMsg, setErrorMsg] = useState('');

  // Load registered office details
  useEffect(() => {
    fetch('/api/office')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setOffice(data);
        }
      })
      .catch(err => {
        console.error("Error fetching office config from server", err);
        const savedOffice = localStorage.getItem('shouma_office_config');
        if (savedOffice) {
          try {
            setOffice(JSON.parse(savedOffice));
          } catch (e) {
            console.error("Error parsing office config", e);
          }
        }
      });
  }, []);

  const handleLangToggle = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !age || !phone || !email || !description) {
      setErrorMsg('الرجاء ملء جميع الحقول المطلوبة.');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
      setErrorMsg('الرجاء إدخال عمر صالح بين 18 و 70 عاماً.');
      return;
    }

    const appBody = {
      name,
      age: ageNum,
      phone,
      email,
      nationality,
      governorate,
      languages: selectedLanguages,
      description,
      status: 'pending'
    };

    // Send to server API to insert directly into PostgreSQL
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appBody)
    })
      .then(res => res.json())
      .then(data => {
        const existingAppsJson = localStorage.getItem('shouma_applications') || '[]';
        let existingApps: GuideApplication[] = [];
        try { existingApps = JSON.parse(existingAppsJson); } catch (e) {}
        existingApps.unshift(data);
        localStorage.setItem('shouma_applications', JSON.stringify(existingApps));
        setIsSubmitted(true);
      })
      .catch(err => {
        console.error("Error submitting application to server", err);
        // Direct local fallback
        const localApp = { ...appBody, id: 'app-' + Date.now(), submittedAt: new Date().toISOString() };
        const existingAppsJson = localStorage.getItem('shouma_applications') || '[]';
        let existingApps: GuideApplication[] = [];
        try { existingApps = JSON.parse(existingAppsJson); } catch (e) {}
        existingApps.unshift(localApp as any);
        localStorage.setItem('shouma_applications', JSON.stringify(existingApps));
        setIsSubmitted(true);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="apply-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-905 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-10"
              style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)' }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                    انضم كمرشد سياحي لدى شومة
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    املأ البيانات التالية ليرى فريقنا مهاراتك وينسق معك المقابلة الشخصية.
                  </p>
                </div>
                <button
                  id="btn-back-to-login"
                  type="button"
                  onClick={onBackToLogin}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all"
                >
                  <ArrowRight className="w-4 h-4 ml-1" />
                  الرجوع لتسجيل الدخول
                </button>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 text-red-200 rounded-xl text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">الاسم الكامل <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        id="applicant-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="الاسم الثلاثي والقبيلة كما في الهوية"
                        className="w-full pr-11 pl-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Age field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">العمر <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <CalendarIcon className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        id="applicant-age"
                        type="number"
                        required
                        min="18"
                        max="70"
                        value={age}
                        disabled={false}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="مثال: 25"
                        className="w-full pr-11 pl-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">رقم الهاتف <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Phone className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        id="applicant-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="رقم الواتساب الفعال (مثال: +968 91234567)"
                        className="w-full pr-11 pl-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Email address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">البريد الإلكتروني <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Globe className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        id="applicant-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pr-11 pl-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">الجنسية <span className="text-red-400">*</span></label>
                    <input
                      id="applicant-nationality"
                      type="text"
                      required
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="عماني، يمني، مصري... إلخ"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Governorate */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">المحافظة <span className="text-red-400">*</span></label>
                    <select
                      id="applicant-governorate"
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      {GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov} className="bg-slate-950">
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Available Languages */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">اللغات المتوفرة لديك (اختر ما تتقنه):</label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_LANGUAGES.map((lang) => {
                      const selected = selectedLanguages.includes(lang);
                      return (
                        <button
                          id={`lang-${lang}`}
                          key={lang}
                          type="button"
                          onClick={() => handleLangToggle(lang)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                            selected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Self Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">لوصف نفسك <span className="text-red-400">*</span></label>
                  <p className="text-xs text-slate-400 mb-2">تحدث عن خبرتك السياحية، حبك للمناطق، ولماذا ترغب بالعمل مع شومة.</p>
                  <textarea
                    id="applicant-description"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="أنا شغوف جداً باكتشاف الطبيعة ومرافقة السياح..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <motion.button
                    id="btn-submit-application"
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-bold text-slate-950 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-5 h-5 transform rotate-180" />
                    <span>إرسال طلب الانضمام إلى عائلة شومة</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* SUCCESS RESPONSE SCREEN */
            <motion.div
              key="apply-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-slate-900/75 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center"
            >
              {/* Big Green Accent Checkmark */}
              <motion.div
                initial={{ transform: 'scale(0)' }}
                animate={{ transform: 'scale(1)' }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                className="w-24 h-24 bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-8"
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-400" />
              </motion.div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                تم ارسال الطلب بنجاح 
              </h1>
              
              <p className="text-xl text-slate-300 font-medium max-w-xl mx-auto mb-8 leading-relaxed">
                سيتم الربد عليك في اقرب وقت
              </p>

              {/* Office Location Custom Widget */}
              <div className="w-full max-w-2xl bg-slate-950/80 border border-slate-800 rounded-2xl p-6 mb-8 text-right font-sans">
                <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold text-lg border-b border-slate-800 pb-3">
                  <MapPin className="w-5 h-5" />
                  <span>موقع المكتب للتواصل وزيارتنا:</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{office.name}</h3>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{office.address}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 mb-5">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl">
                    <Phone className="w-4 h-4 text-amber-500" />
                    <span>الهاتف: {office.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-2 rounded-xl">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>ساعات العمل: {office.workingHours}</span>
                  </div>
                </div>

                {/* Google Maps Embed iframe if URL exists */}
                {office.mapEmbedUrl && (
                  <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                    <iframe
                      src={office.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="موقع مكتب شومة"
                    />
                  </div>
                )}
              </div>

              {/* Honored sentence */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-black text-amber-400 mb-8 animate-pulse text-center"
              >
                سنتشرف برؤيتكم في مكتبنا ✨
              </motion.div>

              <button
                id="btn-return-login"
                onClick={onBackToLogin}
                className="px-8 py-3.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold rounded-2xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 ml-1" />
                العودة إلى الصفحة الرئيسية
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Custom simple Calendar icon component to avoid importing missing icon
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
