import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MapPin, ArrowLeft } from 'lucide-react';

interface GlowTextProps {
  programmerName: string;
  onContinue: () => void;
}

export default function GlowText({ programmerName, onContinue }: GlowTextProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4 select-none dir-rtl">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_60%)] animate-pulse" />
      
      {/* Floating Sparkles In Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              y: [0, Math.random() * -50 - 20],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes textGlow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(245, 158, 11, 0.7), 0 0 40px rgba(245, 158, 11, 0.4), 0 0 80px rgba(249, 115, 22, 0.3);
            filter: hue-rotate(0deg);
          }
          50% {
            text-shadow: 0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(249, 115, 22, 0.6), 0 0 100px rgba(245, 158, 11, 0.4);
            filter: hue-rotate(15deg);
          }
        }
        @keyframes shimmerBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glowing-title {
          animation: textGlow 3s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(to right, #f59e0b, #ef4444, #ec4899, #6366f1, #3b82f6, #f59e0b);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerBg 6s linear infinite;
        }
      `}} />

      {/* Main Glassmorphic Welcomer Card */}
      <motion.div 
        id="welcome-card"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className="relative z-10 max-w-2xl w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl shadow-amber-500/5 text-center flex flex-col items-center"
      >
        {/* Animated Badge Container */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-8 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>بوابة المرشدين السياحيين المعتمدين</span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        </motion.div>

        {/* Large Glistening Sentence */}
        <div className="space-y-6 mb-12">
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.95, 1.05, 1] }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-normal"
          >
            مرحباً بك <span className="shimmer-text glowing-title inline-block px-1 font-extrabold">{programmerName}</span> 
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl text-slate-300 font-medium leading-relaxed"
          >
            في لوحة تحكم مرشدين <span className="text-amber-500 font-bold border-b-2 border-amber-500/30 pb-1">شومة</span>
          </motion.div>
        </div>

        {/* Pulsating Press to Continue Button */}
        <motion.button
          id="btn-continue-dashboard"
          onClick={onContinue}
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(245,158,11,0.4)' }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            delay: 0.6,
            y: { type: 'spring', stiffness: 100 },
          }}
          className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-10 py-5 text-lg font-bold text-slate-950 shadow-xl shadow-amber-500/20 transition-all duration-300"
        >
          {/* Internal Shimmer Highlight */}
          <div className="absolute inset-0 w-1/2 bg-white/25 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1s_ease-in-out_infinite]" 
               style={{
                 backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
               }}
          />
          <div className="flex items-center justify-center gap-3">
            <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
            <span>اضغط للمتابعة والدخول</span>
          </div>
        </motion.button>

        {/* Brand footer */}
        <div className="mt-8 text-slate-500 text-xs font-mono flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-500/60" />
          <span>Shouma Guides Admin Panel v2.0</span>
        </div>
      </motion.div>
    </div>
  );
}
