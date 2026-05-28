import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import shoumaNewLogo from "@assets/image_1772569182491.png";

function OmaniLandscapeSVG() {
  return (
    <svg
      viewBox="0 0 1200 800"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="30%" stopColor="#2d1b4e" />
          <stop offset="60%" stopColor="#5c3d2e" />
          <stop offset="80%" stopColor="#c4703f" />
          <stop offset="100%" stopColor="#e8a87c" />
        </linearGradient>
        <linearGradient id="sandGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#b8895a" />
        </linearGradient>
        <linearGradient id="fortGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B7355" />
          <stop offset="100%" stopColor="#6B5B45" />
        </linearGradient>
        <linearGradient id="towerGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9B8365" />
          <stop offset="100%" stopColor="#7B6B55" />
        </linearGradient>
        <linearGradient id="mountainGradient1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a4535" />
          <stop offset="100%" stopColor="#3d2e22" />
        </linearGradient>
        <linearGradient id="mountainGradient2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b5540" />
          <stop offset="100%" stopColor="#4a3828" />
        </linearGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e7" stopOpacity="1" />
          <stop offset="40%" stopColor="#ffe4b5" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffe4b5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="1200" height="800" fill="url(#skyGradient)" />

      {[
        { cx: 150, cy: 80, r: 1.5, o: 0.7 }, { cx: 300, cy: 50, r: 1, o: 0.8 }, { cx: 450, cy: 120, r: 1.8, o: 0.65 },
        { cx: 600, cy: 40, r: 1.2, o: 0.9 }, { cx: 750, cy: 90, r: 1, o: 0.75 }, { cx: 900, cy: 60, r: 1.5, o: 0.85 },
        { cx: 1050, cy: 100, r: 1, o: 0.7 }, { cx: 200, cy: 150, r: 0.8, o: 0.6 }, { cx: 500, cy: 70, r: 1.3, o: 0.8 },
        { cx: 800, cy: 130, r: 0.9, o: 0.75 }, { cx: 1100, cy: 45, r: 1.4, o: 0.9 }, { cx: 350, cy: 160, r: 0.7, o: 0.65 },
        { cx: 700, cy: 30, r: 1.1, o: 0.85 }, { cx: 950, cy: 140, r: 0.8, o: 0.7 }, { cx: 100, cy: 200, r: 1, o: 0.8 },
        { cx: 550, cy: 180, r: 0.6, o: 0.6 }, { cx: 1000, cy: 170, r: 0.9, o: 0.75 }, { cx: 250, cy: 220, r: 0.7, o: 0.65 },
        { cx: 650, cy: 110, r: 1.2, o: 0.8 }, { cx: 850, cy: 190, r: 0.5, o: 0.7 },
      ].map((star, i) => (
        <circle key={i} cx={star.cx} cy={star.cy} r={star.r} fill="white" opacity={star.o}>
          <animate attributeName="opacity" values={`${0.4 + i * 0.02};${0.8 + i * 0.01};${0.4 + i * 0.02}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}

      <circle cx="950" cy="120" r="60" fill="url(#moonGlow)" />
      <circle cx="950" cy="120" r="30" fill="#fff8e7" opacity="0.9" />
      <circle cx="940" cy="115" r="25" fill="#ffe8c8" opacity="0.3" />

      <path d="M0 500 L100 380 L200 420 L350 340 L450 390 L500 350 L600 430 L700 370 L800 400 L900 320 L1000 380 L1100 350 L1200 410 L1200 800 L0 800Z" fill="url(#mountainGradient1)" opacity="0.7" />
      <path d="M0 520 L150 440 L250 470 L400 400 L500 450 L650 380 L750 430 L900 390 L1000 440 L1100 400 L1200 460 L1200 800 L0 800Z" fill="url(#mountainGradient2)" opacity="0.8" />

      <rect x="180" y="430" width="120" height="120" fill="url(#fortGradient)" rx="2" />
      <rect x="175" y="420" width="130" height="15" fill="#7B6B55" rx="1" />
      {[180, 195, 210, 225, 240, 255, 270, 285].map((x, i) => (
        <rect key={`b1-${i}`} x={x} y="412" width="8" height="12" fill="url(#fortGradient)" rx="1" />
      ))}
      <rect x="155" y="380" width="35" height="170" fill="url(#towerGradient)" rx="2" />
      <polygon points="172.5,355 145,385 200,385" fill="#9B8365" />
      {[155, 165, 175, 185].map((x, i) => (
        <rect key={`bt1-${i}`} x={x} y="372" width="6" height="10" fill="url(#towerGradient)" rx="1" />
      ))}
      <rect x="290" y="390" width="35" height="160" fill="url(#towerGradient)" rx="2" />
      <polygon points="307.5,365 280,395 335,395" fill="#9B8365" />
      {[290, 300, 310, 320].map((x, i) => (
        <rect key={`bt2-${i}`} x={x} y="382" width="6" height="10" fill="url(#towerGradient)" rx="1" />
      ))}
      <rect x="220" y="470" width="30" height="80" fill="#5a4a3a" rx="4" />
      <rect x="220" y="465" width="30" height="8" fill="#6B5B45" rx="2" />
      {[195, 260].map((x, i) => (
        <rect key={`w1-${i}`} x={x} y="460" width="18" height="22" fill="#4a3a2a" rx="2" />
      ))}
      {[195, 260].map((x, i) => (
        <rect key={`wa1-${i}`} x={x} y="455" width="18" height="6" fill="#6B5B45" rx="1" />
      ))}

      <rect x="750" y="440" width="160" height="110" fill="url(#fortGradient)" rx="2" />
      <rect x="745" y="430" width="170" height="15" fill="#7B6B55" rx="1" />
      {[748, 763, 778, 793, 808, 823, 838, 853, 868, 883, 898].map((x, i) => (
        <rect key={`b2-${i}`} x={x} y="422" width="8" height="12" fill="url(#fortGradient)" rx="1" />
      ))}
      <rect x="730" y="400" width="40" height="150" fill="url(#towerGradient)" rx="2" />
      <polygon points="750,370 720,405 780,405" fill="#9B8365" />
      <circle cx="750" cy="385" r="4" fill="#ffe4b5" opacity="0.3" />
      <rect x="895" y="410" width="40" height="140" fill="url(#towerGradient)" rx="2" />
      <polygon points="915,380 885,415 945,415" fill="#9B8365" />
      <circle cx="915" cy="395" r="4" fill="#ffe4b5" opacity="0.3" />
      <rect x="810" y="470" width="35" height="80" fill="#5a4a3a" rx="5" />
      <rect x="810" y="465" width="35" height="8" fill="#6B5B45" rx="2" />
      {[770, 870].map((x, i) => (
        <rect key={`w2-${i}`} x={x} y="465" width="20" height="25" fill="#4a3a2a" rx="2" />
      ))}

      <g transform="translate(500, 480)">
        <rect x="0" y="0" width="25" height="70" fill="url(#towerGradient)" rx="2" />
        <polygon points="12.5,-20 -5,5 30,5" fill="#9B8365" />
        <circle cx="12.5" cy="-5" r="5" fill="#ffe4b5" opacity="0.4" />
        <rect x="7" y="40" width="12" height="30" fill="#5a4a3a" rx="3" />
      </g>

      <g transform="translate(1050, 460)">
        <rect x="0" y="0" width="80" height="90" fill="url(#fortGradient)" rx="2" />
        <rect x="-5" y="-8" width="90" height="12" fill="#7B6B55" rx="1" />
        {[-3, 12, 27, 42, 57, 72].map((x, i) => (
          <rect key={`b3-${i}`} x={x} y={-15} width="7" height="10" fill="url(#fortGradient)" rx="1" />
        ))}
        <rect x="25" y="40" width="30" height="50" fill="#5a4a3a" rx="4" />
      </g>

      <path d="M0 550 Q200 530 400 555 Q600 570 800 545 Q1000 530 1200 555 L1200 800 L0 800Z" fill="url(#sandGradient)" />
      <path d="M0 580 Q300 565 600 585 Q900 595 1200 575 L1200 800 L0 800Z" fill="#c49b6a" opacity="0.5" />

      {[80, 420, 620, 1000].map((x, i) => (
        <g key={`palm-${i}`} transform={`translate(${x}, ${545 + i * 5})`}>
          <rect x="-2" y="-60" width="4" height="60" fill="#5a4020" rx="2" />
          <ellipse cx="0" cy="-60" rx="25" ry="8" fill="#2d5a1e" opacity="0.8" transform="rotate(-20)" />
          <ellipse cx="0" cy="-60" rx="25" ry="8" fill="#3a6b28" opacity="0.7" transform="rotate(15)" />
          <ellipse cx="0" cy="-62" rx="22" ry="7" fill="#2d5a1e" opacity="0.6" transform="rotate(-50)" />
          <ellipse cx="0" cy="-58" rx="20" ry="6" fill="#3a7030" opacity="0.7" transform="rotate(45)" />
        </g>
      ))}

      <path d="M0 620 Q100 615 200 625 Q400 640 600 620 Q800 610 1000 630 Q1100 635 1200 625 L1200 800 L0 800Z" fill="#b8895a" opacity="0.4" />

      <text x="600" y="700" textAnchor="middle" fill="#fff8e7" opacity="0.08" fontSize="120" fontFamily="serif" fontWeight="bold">
        عُمان
      </text>
    </svg>
  );
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validateForm = () => {
    const result = insertUserSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: { username?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "username") {
          fieldErrors.username = t('usernameRequired');
        }
        if (err.path[0] === "password") {
          fieldErrors.password = t('passwordRequired');
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: (data: { id: string; username: string }) => {
      localStorage.setItem('shouma-username', data.username);
      toast({
        title: isLogin ? t('loginSuccess') : t('registerSuccess'),
        description: t('welcomeMessage'),
      });
      setLocation("/home");
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message || t('tryAgain'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
        <ThemeToggle variant="icon-only" />
        <LanguageSwitcher />
      </div>

      <div className="absolute inset-0">
        <OmaniLandscapeSVG />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={shoumaNewLogo} 
              alt="شومة - Shouma"
              className="w-56 h-auto mx-auto mb-4 drop-shadow-2xl"
              data-testid="logo-login"
            />
            <p className="text-amber-100/90 text-lg drop-shadow-md" data-testid="text-tagline">
              {t('homeSubtitle')}
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8" data-testid="card-login">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white" data-testid="text-form-title">
                {isLogin ? t('welcomeBack') : t('createNewAccount')}
              </h2>
              <p className="text-amber-100/70 mt-1 text-sm" data-testid="text-form-subtitle">
                {isLogin ? t('loginSubtitle') : t('registerSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-amber-100/90">
                  {t('username')}
                </Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  type="text"
                  placeholder={t('username')}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/60 focus:ring-amber-400/30 ${errors.username ? "border-red-400" : ""}`}
                />
                {errors.username && (
                  <p className="text-sm text-red-300" data-testid="error-username">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-amber-100/90">
                  {t('password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    data-testid="input-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('password')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-amber-400/60 focus:ring-amber-400/30 ${isRTL ? 'pl-12' : 'pr-12'} ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    data-testid="button-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-300" data-testid="error-password">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                data-testid="button-submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-0 shadow-lg shadow-amber-900/30 transition-all duration-300"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending
                  ? t('loading')
                  : isLogin ? t('login') : t('register')
                }
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  data-testid="button-toggle-mode"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-sm text-amber-200/80 hover:text-amber-100 transition-colors font-medium"
                >
                  {isLogin
                    ? `${t('noAccount')} ${t('createAccount')}`
                    : `${t('haveAccount')} ${t('loginHere')}`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
