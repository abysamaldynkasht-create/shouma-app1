import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Headphones } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceGuideProps {
  textAr?: string;
  textEn?: string;
  titleAr?: string;
  titleEn?: string;
  text?: string;
  attractionName?: string;
  location?: string;
}

export function VoiceGuide({ textAr, textEn, titleAr, titleEn, text, attractionName }: VoiceGuideProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isPlaying, setIsPlaying] = useState(false);

  const textToRead = isAr 
    ? (textAr || text || titleAr || attractionName) 
    : (textEn || text || titleEn || attractionName);

  const handleTogglePlay = () => {
    if (!('speechSynthesis' in window)) {
      alert(isAr ? 'القراءة الصوتية غير مدعومة في متصفحك' : 'Text to speech is not supported in your browser');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      if (!textToRead) return;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = isAr ? 'ar-OM' : 'en-US';
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 my-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
          <Headphones className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">
            {isAr ? 'المرشد الصوتي التفاعلي' : 'Interactive Voice Guide'}
          </h4>
          <p className="text-xs text-slate-400">
            {isAr ? 'استمع إلى الوصف والمعلومات التاريخية' : 'Listen to historical description and facts'}
          </p>
        </div>
      </div>

      <button
        onClick={handleTogglePlay}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
          isPlaying
            ? 'bg-rose-500 hover:bg-rose-600 text-white'
            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
        }`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4" />
            {isAr ? 'إيقاف' : 'Pause'}
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            {isAr ? 'تشغيل' : 'Listen'}
          </>
        )}
      </button>
    </div>
  );
}
