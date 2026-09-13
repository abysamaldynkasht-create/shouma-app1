import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Headphones, Sparkles, Volume2, Loader2, Bot, BookOpen, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceGuideProps {
  textAr?: string;
  textEn?: string;
  titleAr?: string;
  titleEn?: string;
  text?: string;
  attractionName?: string;
  location?: string;
  compact?: boolean;
}

type GuidePhase = 'idle' | 'reading_details' | 'generating_ai' | 'reading_ai';

export function VoiceGuide({ textAr, textEn, titleAr, titleEn, text, attractionName, location, compact }: VoiceGuideProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [phase, setPhase] = useState<GuidePhase>('idle');
  const [aiScript, setAiScript] = useState<string | null>(null);
  const [currentSpokenText, setCurrentSpokenText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedText, setExpandedText] = useState(false);

  const phaseRef = useRef<GuidePhase>('idle');
  phaseRef.current = phase;

  const originalDetailText = isAr
    ? (textAr || text || titleAr || attractionName || '')
    : (textEn || text || titleEn || attractionName || '');

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Helper to pick appropriate speech synthesis voice
  const speakText = (textToSpeak: string, onDone: () => void): boolean => {
    if (!('speechSynthesis' in window)) return false;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isAr ? 'ar-OM' : 'en-US';
    utterance.rate = 0.95; // Clear and measured pace
    utterance.pitch = 1.0;

    // Try to find native Arabic voice if available
    const voices = window.speechSynthesis.getVoices();
    if (isAr) {
      const arVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arVoice) utterance.voice = arVoice;
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri')));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onend = () => {
      onDone();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error or cancelled:", e);
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        onDone();
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;
  };

  // Stop everything
  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPhase('idle');
    setCurrentSpokenText('');
  };

  // Step 2: Fetch AI narration and read it
  const startAiNarrativePhase = async () => {
    setPhase('generating_ai');
    setErrorMsg(null);

    try {
      // If we already fetched AI script for this place, reuse it
      let script = aiScript;
      if (!script) {
        const res = await fetch('/api/voice-guide-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: originalDetailText,
            attractionName: attractionName || titleAr || titleEn,
            location: location || 'سلطنة عمان',
            language: language || 'ar'
          })
        });

        if (res.ok) {
          const data = await res.json();
          script = data.script || null;
          if (script) setAiScript(script);
        }
      }

      if (phaseRef.current === 'idle') return; // User stopped while waiting

      if (script) {
        setPhase('reading_ai');
        setCurrentSpokenText(script);

        speakText(script, () => {
          setPhase('idle');
          setCurrentSpokenText('');
        });
      } else {
        // AI script not available, wrap up gracefully
        setPhase('idle');
        setCurrentSpokenText('');
      }
    } catch (err: any) {
      console.warn("AI Guide expansion error:", err);
      setPhase('idle');
      setCurrentSpokenText('');
    }
  };

  // Step 1: Start full sequence -> Details first, then AI addition
  const handleStartTour = () => {
    if (!('speechSynthesis' in window)) {
      alert(isAr ? 'القراءة الصوتية غير مدعومة في هذا المتصفح' : 'Text-to-speech is not supported in this browser');
      return;
    }

    setErrorMsg(null);
    setPhase('reading_details');
    setCurrentSpokenText(originalDetailText);

    // Initial greeting / transition preamble text if appropriate
    const preamble = isAr 
      ? `مرحباً بك في ${attractionName || 'هذه الوجهة'}. إليك التفاصيل الأساسية: ${originalDetailText}`
      : `Welcome to ${attractionName || 'this destination'}. Here are the main details: ${originalDetailText}`;

    speakText(preamble, () => {
      // Step 1 complete! Now seamlessly trigger Step 2 (AI Enrichment)
      startAiNarrativePhase();
    });
  };

  const isRunning = phase !== 'idle';

  if (compact) {
    return (
      <div className="relative inline-flex items-center gap-2">
        {isRunning ? (
          <button
            onClick={handleStop}
            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
            title={isAr ? 'إيقاف المرشد الصوتي' : 'Stop Audio Guide'}
            data-testid="button-voice-guide-compact-stop"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{isAr ? 'إيقاف المرشد' : 'Stop Guide'}</span>
          </button>
        ) : (
          <button
            onClick={handleStartTour}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-amber-500/20"
            title={isAr ? 'تشغيل المرشد الصوتي التفاعلي' : 'Play Interactive Voice Guide'}
            data-testid="button-voice-guide-compact-start"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{isAr ? 'المرشد الصوتي' : 'Voice Guide'}</span>
            <Sparkles className="w-3 h-3 text-slate-900" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 border border-slate-800/80 shadow-xl rounded-2xl p-4 sm:p-5 my-4 transition-all" data-testid="voice-guide-container">
      {/* Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl shrink-0">
            <Headphones className="w-5 h-5" />
            {isRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                {isAr ? 'المرشد الصوتي الذكي' : 'Smart AI Voice Guide'}
              </h4>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {isAr ? 'قارئ نصوص + ذكاء اصطناعي' : 'Text Reader + AI Narrative'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'يقوم بقراءة تفاصيل المكان أولاً، ثم يضيف الذكاء الاصطناعي أسراراً وتفاصيل تاريخية إضافية'
                : 'Reads location details first, then AI enriches with deeper stories and historical insights'}
            </p>
          </div>
        </div>

        {/* Playback action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {isRunning ? (
            <button
              onClick={handleStop}
              className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md bg-rose-500 hover:bg-rose-600 text-white"
              data-testid="button-voice-guide-stop"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              {isAr ? 'إيقاف المرشد' : 'Stop Guide'}
            </button>
          ) : (
            <button
              onClick={handleStartTour}
              className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
              data-testid="button-voice-guide-start"
            >
              <Play className="w-4 h-4 fill-current" />
              {isAr ? 'بدء المرشد الصوتي' : 'Start Tour Guide'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80">
        {/* Step 1: Text Reader */}
        <div 
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${
            phase === 'reading_details'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
              : phase === 'generating_ai' || phase === 'reading_ai'
              ? 'bg-slate-800/40 border-slate-700/50 text-slate-400'
              : 'bg-slate-800/20 border-slate-800 text-slate-400'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${phase === 'reading_details' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">{isAr ? 'المرحلة 1: قراءة تفاصيل المكان' : 'Phase 1: Reading Details'}</span>
              {phase === 'reading_details' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 animate-pulse">
                  {isAr ? 'جارٍ القراءة...' : 'Reading...'}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 block truncate">
              {isAr ? 'قراءة البيانات المكتوبة عن المكان' : 'Basic destination overview'}
            </span>
          </div>
        </div>

        {/* Step 2: AI Expansion */}
        <div 
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${
            phase === 'generating_ai' || phase === 'reading_ai'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
              : 'bg-slate-800/20 border-slate-800 text-slate-400'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${phase === 'generating_ai' || phase === 'reading_ai' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
            {phase === 'generating_ai' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">{isAr ? 'المرحلة 2: إثراء الذكاء الاصطناعي' : 'Phase 2: AI Enrichment'}</span>
              {phase === 'generating_ai' ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 animate-pulse">
                  {isAr ? 'إعداد السرد...' : 'Synthesizing...'}
                </span>
              ) : phase === 'reading_ai' ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 animate-pulse">
                  {isAr ? 'جارٍ السرد الصوتي...' : 'Narrating...'}
                </span>
              ) : null}
            </div>
            <span className="text-[11px] text-slate-400 block truncate">
              {isAr ? 'حقائق تاريخية وأسرار وقصص حصرية' : 'History, local secrets & tips'}
            </span>
          </div>
        </div>
      </div>

      {/* Currently spoken live feedback */}
      {isRunning && currentSpokenText && (
        <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              {phase === 'reading_details' 
                ? (isAr ? 'يتم الآن قراءة نصوص المكان:' : 'Now reading place description:') 
                : (isAr ? 'سرد الذكاء الاصطناعي المباشر:' : 'Live AI Tour Guide Narration:')}
            </span>
            <button
              onClick={() => setExpandedText(!expandedText)}
              className="text-[10px] text-slate-400 hover:text-slate-200 underline"
            >
              {expandedText ? (isAr ? 'طي النص' : 'Collapse') : (isAr ? 'عرض النص كاملاً' : 'Expand full script')}
            </button>
          </div>
          <p className={`text-xs text-slate-300 leading-relaxed ${expandedText ? '' : 'line-clamp-2'}`}>
            {currentSpokenText}
          </p>
        </div>
      )}

      {/* Direct AI trigger button if user wants to jump directly to AI insights */}
      {!isRunning && aiScript && (
        <div className="mt-3 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs">
          <span className="text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? 'تم توليد سرد الذكاء الاصطناعي الإضافي وجاهز للاستماع' : 'AI additional narrative is ready'}
          </span>
          <button
            onClick={() => {
              setPhase('reading_ai');
              setCurrentSpokenText(aiScript);
              speakText(aiScript, () => {
                setPhase('idle');
                setCurrentSpokenText('');
              });
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] transition-all flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" />
            {isAr ? 'سرد الذكاء الاصطناعي فقط' : 'Play AI script only'}
          </button>
        </div>
      )}
    </div>
  );
}
