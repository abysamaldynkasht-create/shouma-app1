import React from 'react';
import { Map, Download, WifiOff, MapPin, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OfflineMapPage() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-6 pb-24 dir-rtl">
      {/* Header */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => setLocation('/home')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-800"
          >
            <ArrowRight className="w-4 h-4" />
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              {isAr ? 'بدون إنترنت' : 'Offline Mode'}
            </span>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-sky-500/10 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl w-fit text-amber-400">
            <Map className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isAr ? 'خرائط سلطنة عمان التفاعلية - بدون اتصال' : 'Oman Offline Interactive Maps'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {isAr
              ? 'تتيح لك هذه الخدمة تصفح وتنزيل الخرائط السياحية، المسارات الجبلية، والمواقع الأثرية في سلطنة عمان لضمان استكشاف آمن ومستمر حتى في المناطق الخالية من التغطية.'
              : 'Download tourist maps, hiking trails, and historical sites across Oman for seamless navigation without internet connectivity.'}
          </p>
        </div>

        {/* Downloadable Maps List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'muscat', title: isAr ? 'خريطة محافظة مسقط والمطاعم' : 'Muscat & Restaurants Map', size: '45 MB', spots: '120+' },
            { id: 'dhofar', title: isAr ? 'خريطة محافظة ظفار والعيون المائية' : 'Dhofar & Springs Map', size: '68 MB', spots: '180+' },
            { id: 'jabal', title: isAr ? 'مسارات الجبل الأخضر وجبل شمس' : 'Jabal Akhdar & Shams Trails', size: '32 MB', spots: '45+' },
            { id: 'sharqiyah', title: isAr ? 'خريطة رمال الشرقية ووادي بني خالد' : 'Sharqiyah Sands & Wadis', size: '50 MB', spots: '90+' },
          ].map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{item.spots} {isAr ? 'موقع سياحي' : 'Places'}</span>
                  <span>•</span>
                  <span>{item.size}</span>
                </div>
              </div>

              <button
                onClick={() => alert(isAr ? 'جاري التحضير لتنزيل الخريطة...' : 'Preparing map download...')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                {isAr ? 'تنزيل' : 'Download'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
