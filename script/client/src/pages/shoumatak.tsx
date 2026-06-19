import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { governorates, type QuestionnaireData } from "@shared/schema";
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  Wallet,
  Users,
  Heart,
  Home,
  UtensilsCrossed,
  Sparkles,
  Check,
  MapPin,
  Camera,
  Mountain,
  ShoppingBag,
  Palmtree,
  Waves,
  Tent,
  Activity,
  Leaf,
  Edit,
  Hotel,
  Building2
} from "lucide-react";

interface Question {
  id: keyof QuestionnaireData | "welcome" | "review";
  titleKey: string;
  subtitleKey: string;
  type: "single" | "multiple" | "number" | "welcome" | "governorates" | "review";
  options?: { value: string; labelKey: string; icon?: React.ReactNode }[];
  min?: number;
  max?: number;
}

const questions: Question[] = [
  {
    id: "welcome",
    titleKey: "welcomeToShoumatak",
    subtitleKey: "shoumatakIntro",
    type: "welcome",
  },
  {
    id: "governorates",
    titleKey: "governoratesQuestion",
    subtitleKey: "governoratesSubtitle",
    type: "governorates",
  },
  {
    id: "duration",
    titleKey: "tripDuration",
    subtitleKey: "tripDurationSubtitle",
    type: "number",
    min: 1,
    max: 30,
  },
  {
    id: "budget",
    titleKey: "budget",
    subtitleKey: "budgetSubtitle",
    type: "single",
    options: [
      { value: "low", labelKey: "budgetLow", icon: <Wallet className="w-6 h-6" /> },
      { value: "medium", labelKey: "budgetMedium", icon: <Wallet className="w-6 h-6" /> },
      { value: "high", labelKey: "budgetHigh", icon: <Wallet className="w-6 h-6" /> },
      { value: "luxury", labelKey: "budgetLuxury", icon: <Sparkles className="w-6 h-6" /> },
    ],
  },
  {
    id: "groupSize",
    titleKey: "groupSize",
    subtitleKey: "groupSizeSubtitle",
    type: "number",
    min: 1,
    max: 20,
  },
  {
    id: "interests",
    titleKey: "interests",
    subtitleKey: "interestsSubtitle",
    type: "multiple",
    options: [
      { value: "culture", labelKey: "interestCulture", icon: <Mountain className="w-5 h-5" /> },
      { value: "nature", labelKey: "interestNature", icon: <Palmtree className="w-5 h-5" /> },
      { value: "adventure", labelKey: "interestAdventure", icon: <Activity className="w-5 h-5" /> },
      { value: "relaxation", labelKey: "interestRelaxation", icon: <Leaf className="w-5 h-5" /> },
      { value: "shopping", labelKey: "interestShopping", icon: <ShoppingBag className="w-5 h-5" /> },
      { value: "food", labelKey: "interestFood", icon: <UtensilsCrossed className="w-5 h-5" /> },
    ],
  },
  {
    id: "accommodation",
    titleKey: "accommodation",
    subtitleKey: "accommodationSubtitle",
    type: "single",
    options: [
      { value: "hotel", labelKey: "hotelType", icon: <Home className="w-6 h-6" /> },
      { value: "resort", labelKey: "resortType", icon: <Sparkles className="w-6 h-6" /> },
      { value: "apartment", labelKey: "apartmentType", icon: <Home className="w-6 h-6" /> },
      { value: "hostel", labelKey: "hostelType", icon: <Home className="w-6 h-6" /> },
    ],
  },
  {
    id: "hotelPreference",
    titleKey: "hotelPreference",
    subtitleKey: "hotelPreferenceSubtitle",
    type: "single",
    options: [
      { value: "single", labelKey: "singleHotel", icon: <Hotel className="w-6 h-6" /> },
      { value: "multiple", labelKey: "multipleHotels", icon: <Building2 className="w-6 h-6" /> },
    ],
  },
  {
    id: "mealPreference",
    titleKey: "meals",
    subtitleKey: "mealsSubtitle",
    type: "single",
    options: [
      { value: "local", labelKey: "mealLocal", icon: <UtensilsCrossed className="w-6 h-6" /> },
      { value: "international", labelKey: "mealInternational", icon: <UtensilsCrossed className="w-6 h-6" /> },
      { value: "mixed", labelKey: "mealMixed", icon: <Heart className="w-6 h-6" /> },
    ],
  },
  {
    id: "preferredActivities",
    titleKey: "activitiesQuestion",
    subtitleKey: "activitiesSubtitle",
    type: "multiple",
    options: [
      { value: "sightseeing", labelKey: "activitySightseeing", icon: <MapPin className="w-5 h-5" /> },
      { value: "photography", labelKey: "activityPhotography", icon: <Camera className="w-5 h-5" /> },
      { value: "swimming", labelKey: "activitySwimming", icon: <Waves className="w-5 h-5" /> },
      { value: "camping", labelKey: "activityCamping", icon: <Tent className="w-5 h-5" /> },
      { value: "sports", labelKey: "activitySports", icon: <Activity className="w-5 h-5" /> },
      { value: "wellness", labelKey: "activityWellness", icon: <Leaf className="w-5 h-5" /> },
    ],
  },
  {
    id: "review",
    titleKey: "reviewAnswers",
    subtitleKey: "reviewAnswersSubtitle",
    type: "review",
  },
];

export default function ShoumatakPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [answers, setAnswers] = useState<Partial<QuestionnaireData> & { governorates?: string[] }>({
    duration: 3,
    groupSize: 2,
    interests: [],
    preferredActivities: [],
    governorates: [],
  });

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep) / (questions.length - 1)) * 100;

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;

  const animateTransition = (callback: () => void) => {
    setIsAnimating(true);
    setTimeout(() => {
      callback();
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      animateTransition(() => setCurrentStep(currentStep + 1));
    } else {
      const params = new URLSearchParams({
        duration: String(answers.duration || 3),
        budget: answers.budget || "medium",
        groupSize: String(answers.groupSize || 2),
        interests: (answers.interests || []).join(","),
        accommodation: answers.accommodation || "hotel",
        hotelPreference: answers.hotelPreference || "single",
        mealPreference: answers.mealPreference || "mixed",
        preferredActivities: (answers.preferredActivities || []).join(","),
        governorates: (answers.governorates || []).join(","),
      });
      setLocation(`/itinerary?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition(() => setCurrentStep(currentStep - 1));
    } else {
      setLocation("/home");
    }
  };

  const handleSingleSelect = (value: string) => {
    const key = currentQuestion.id as keyof QuestionnaireData;
    setAnswers({ ...answers, [key]: value });
  };

  const handleMultipleSelect = (value: string) => {
    const key = currentQuestion.id as keyof QuestionnaireData;
    const current = (answers[key] as string[]) || [];
    if (current.includes(value)) {
      setAnswers({ ...answers, [key]: current.filter((v) => v !== value) });
    } else {
      setAnswers({ ...answers, [key]: [...current, value] });
    }
  };

  const handleGovernorateSelect = (id: string) => {
    const current = answers.governorates || [];
    if (current.includes(id)) {
      setAnswers({ ...answers, governorates: current.filter((g) => g !== id) });
    } else {
      setAnswers({ ...answers, governorates: [...current, id] });
    }
  };

  const handleNumberChange = (delta: number) => {
    const key = currentQuestion.id as "duration" | "groupSize";
    const current = answers[key] || 1;
    const min = currentQuestion.min || 1;
    const max = currentQuestion.max || 30;
    const newValue = Math.max(min, Math.min(max, current + delta));
    setAnswers({ ...answers, [key]: newValue });
  };

  const jumpToStep = (stepIndex: number) => {
    animateTransition(() => setCurrentStep(stepIndex));
  };

  const isNextDisabled = () => {
    if (currentQuestion.type === "welcome" || currentQuestion.type === "review") return false;
    if (currentQuestion.type === "governorates") {
      return !answers.governorates || answers.governorates.length === 0;
    }
    if (currentQuestion.type === "single") {
      const key = currentQuestion.id as keyof QuestionnaireData;
      return !answers[key];
    }
    if (currentQuestion.type === "multiple") {
      const key = currentQuestion.id as keyof QuestionnaireData;
      const arr = answers[key] as string[] | undefined;
      return !arr || arr.length === 0;
    }
    return false;
  };

  const getBudgetLabel = (value: string) => {
    const labels: Record<string, string> = {
      low: t('budgetLow'),
      medium: t('budgetMedium'),
      high: t('budgetHigh'),
      luxury: t('budgetLuxury'),
    };
    return labels[value] || value;
  };

  const getAccommodationLabel = (value: string) => {
    const labels: Record<string, string> = {
      hotel: t('hotelType'),
      resort: t('resortType'),
      apartment: t('apartmentType'),
      hostel: t('hostelType'),
    };
    return labels[value] || value;
  };

  const getHotelPreferenceLabel = (value: string) => {
    const labels: Record<string, string> = {
      single: t('singleHotel'),
      multiple: t('multipleHotels'),
    };
    return labels[value] || value;
  };

  const getMealLabel = (value: string) => {
    const labels: Record<string, string> = {
      local: t('mealLocal'),
      international: t('mealInternational'),
      mixed: t('mealMixed'),
    };
    return labels[value] || value;
  };

  const getInterestLabel = (value: string) => {
    const labels: Record<string, string> = {
      culture: t('interestCulture'),
      nature: t('interestNature'),
      adventure: t('interestAdventure'),
      relaxation: t('interestRelaxation'),
      shopping: t('interestShopping'),
      food: t('interestFood'),
    };
    return labels[value] || value;
  };

  const getActivityLabel = (value: string) => {
    const labels: Record<string, string> = {
      sightseeing: t('activitySightseeing'),
      photography: t('activityPhotography'),
      swimming: t('activitySwimming'),
      camping: t('activityCamping'),
      sports: t('activitySports'),
      wellness: t('activityWellness'),
    };
    return labels[value] || value;
  };

  const getGovernorateName = (id: string) => {
    const gov = governorates.find(g => g.id === id);
    return gov ? (language === 'ar' || language === 'fa' ? gov.nameAr : gov.nameEn) : id;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back-header"
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BackArrow className="w-5 h-5" />
              <span className="text-sm font-medium">{t('back')}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('shoumatak')}</span>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {currentStep > 0 && currentQuestion.type !== "review" && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm text-muted-foreground font-medium">
              {currentStep}/{questions.length - 1}
            </span>
          </div>
        </div>
      )}

      <main className={`max-w-4xl mx-auto px-4 py-12 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-center mb-12">
          {currentQuestion.type === "welcome" && (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          )}
          {currentQuestion.type === "review" && (
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-8">
              <Check className="w-12 h-12 text-green-500" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-question-title">
            {t(currentQuestion.titleKey)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t(currentQuestion.subtitleKey)}
          </p>
        </div>

        {currentQuestion.type === "governorates" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {governorates.map((gov) => {
              const isSelected = (answers.governorates || []).includes(gov.id);
              return (
                <button
                  key={gov.id}
                  data-testid={`option-gov-${gov.id}`}
                  onClick={() => handleGovernorateSelect(gov.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <MapPin className={`w-5 h-5 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium block ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {language === 'ar' || language === 'fa' ? gov.nameAr : gov.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === "single" && currentQuestion.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {currentQuestion.options.map((option) => {
              const key = currentQuestion.id as keyof QuestionnaireData;
              const isSelected = answers[key] === option.value;
              return (
                <button
                  key={option.value}
                  data-testid={`option-${option.value}`}
                  onClick={() => handleSingleSelect(option.value)}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-center ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  {option.icon && (
                    <div className={`mb-3 flex justify-center ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                      {option.icon}
                    </div>
                  )}
                  <span className={`text-lg font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {t(option.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === "multiple" && currentQuestion.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {currentQuestion.options.map((option) => {
              const key = currentQuestion.id as keyof QuestionnaireData;
              const arr = (answers[key] as string[]) || [];
              const isSelected = arr.includes(option.value);
              return (
                <button
                  key={option.value}
                  data-testid={`option-${option.value}`}
                  onClick={() => handleMultipleSelect(option.value)}
                  className={`relative p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {isSelected ? <Check className="w-5 h-5" /> : option.icon}
                  </div>
                  <span className={`text-base font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {t(option.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === "number" && (
          <Card className="max-w-sm mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-6">
                <Button
                  data-testid="button-decrease"
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 rounded-full text-xl"
                  onClick={() => handleNumberChange(-1)}
                >
                  -
                </Button>
                <div className="text-center">
                  <span className="text-5xl font-bold text-primary">
                    {answers[currentQuestion.id as "duration" | "groupSize"] || 1}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentQuestion.id === "duration" ? t('days') : t('travelers')}
                  </p>
                </div>
                <Button
                  data-testid="button-increase"
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 rounded-full text-xl"
                  onClick={() => handleNumberChange(1)}
                >
                  +
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentQuestion.type === "review" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(1)}>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('governoratesQuestion')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                        {(answers.governorates || []).slice(0, 3).map((gov) => (
                          <Badge key={gov} variant="secondary" className="text-xs">{getGovernorateName(gov)}</Badge>
                        ))}
                        {(answers.governorates || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{(answers.governorates || []).length - 3}</Badge>
                        )}
                      </div>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(2)}>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('tripDuration')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{answers.duration} {t('days')}</Badge>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(3)}>
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('budget')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getBudgetLabel(answers.budget || 'medium')}</Badge>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(4)}>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('groupSize')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{answers.groupSize} {t('travelers')}</Badge>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(5)}>
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('interests')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                        {(answers.interests || []).slice(0, 2).map((i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{getInterestLabel(i)}</Badge>
                        ))}
                        {(answers.interests || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{(answers.interests || []).length - 2}</Badge>
                        )}
                      </div>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(6)}>
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('accommodation')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getAccommodationLabel(answers.accommodation || 'hotel')}</Badge>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(7)}>
                    <div className="flex items-center gap-3">
                      <Hotel className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('hotelPreference')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getHotelPreferenceLabel(answers.hotelPreference || 'single')}</Badge>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(8)}>
                    <div className="flex items-center gap-3">
                      <UtensilsCrossed className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('meals')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getMealLabel(answers.mealPreference || 'mixed')}</Badge>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => jumpToStep(9)}>
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('activitiesQuestion')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                        {(answers.preferredActivities || []).slice(0, 2).map((a) => (
                          <Badge key={a} variant="secondary" className="text-xs">{getActivityLabel(a)}</Badge>
                        ))}
                        {(answers.preferredActivities || []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{(answers.preferredActivities || []).length - 2}</Badge>
                        )}
                      </div>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-12">
          <Button
            data-testid="button-back"
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="h-14 px-8 rounded-full"
          >
            <BackArrow className="w-5 h-5" />
            <span className="mx-2">{t('previous')}</span>
          </Button>
          <Button
            data-testid="button-next"
            size="lg"
            onClick={handleNext}
            disabled={isNextDisabled()}
            className="h-14 px-8 rounded-full"
          >
            {currentStep === questions.length - 1 ? (
              <>
                <span className="mx-2">{t('generateItinerary')}</span>
                <Sparkles className="w-5 h-5" />
              </>
            ) : currentStep === 0 ? (
              <>
                <span className="mx-2">{t('startPlanning')}</span>
                <NextArrow className="w-5 h-5" />
              </>
            ) : (
              <>
                <span className="mx-2">{t('next')}</span>
                <NextArrow className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
