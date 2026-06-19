import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { governorates } from "@shared/schema";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Calendar,
  Globe,
  CheckCircle2,
  Send,
  Loader2,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/شومة_1768320219408.jpg";

const preferenceKeys = [
  "prefAdventures",
  "prefExploration",
  "prefHeritage",
  "prefNature",
  "prefEntertainment",
  "prefCustom",
] as const;

const preferenceValues = [
  "adventures",
  "exploration",
  "heritage",
  "nature",
  "entertainment",
  "custom",
];

const countries = [
  "Oman", "UAE", "Saudi Arabia", "Kuwait", "Bahrain", "Qatar",
  "Egypt", "Jordan", "Lebanon", "Iraq", "Morocco", "Tunisia",
  "Turkey", "Iran", "India", "Pakistan", "Bangladesh",
  "United Kingdom", "United States", "Canada", "Germany", "France",
  "Spain", "Italy", "Netherlands", "Australia", "Japan", "China",
  "South Korea", "Malaysia", "Indonesia", "Thailand", "Philippines",
  "Russia", "Brazil", "Mexico", "South Africa", "Kenya", "Nigeria",
];

const countriesAr: Record<string, string> = {
  "Oman": "عُمان", "UAE": "الإمارات", "Saudi Arabia": "السعودية",
  "Kuwait": "الكويت", "Bahrain": "البحرين", "Qatar": "قطر",
  "Egypt": "مصر", "Jordan": "الأردن", "Lebanon": "لبنان",
  "Iraq": "العراق", "Morocco": "المغرب", "Tunisia": "تونس",
  "Turkey": "تركيا", "Iran": "إيران", "India": "الهند",
  "Pakistan": "باكستان", "Bangladesh": "بنغلاديش",
  "United Kingdom": "المملكة المتحدة", "United States": "الولايات المتحدة",
  "Canada": "كندا", "Germany": "ألمانيا", "France": "فرنسا",
  "Spain": "إسبانيا", "Italy": "إيطاليا", "Netherlands": "هولندا",
  "Australia": "أستراليا", "Japan": "اليابان", "China": "الصين",
  "South Korea": "كوريا الجنوبية", "Malaysia": "ماليزيا",
  "Indonesia": "إندونيسيا", "Thailand": "تايلاند",
  "Philippines": "الفلبين", "Russia": "روسيا", "Brazil": "البرازيل",
  "Mexico": "المكسيك", "South Africa": "جنوب أفريقيا",
  "Kenya": "كينيا", "Nigeria": "نيجيريا",
};

const formSchema = z.object({
  numberOfPeople: z.coerce.number().min(1, "minPeople"),
  numberOfDays: z.coerce.number().min(1, "minDays"),
  preferences: z.array(z.string()).min(1, "fieldRequired"),
  country: z.string().min(1, "fieldRequired"),
  arrivalDate: z.string().min(1, "fieldRequired"),
  destinationPreference: z.string().min(1, "fieldRequired"),
  selectedGovernorate: z.string().optional(),
}).refine((data) => {
  if (data.destinationPreference === "single" && !data.selectedGovernorate) {
    return false;
  }
  return true;
}, {
  message: "fieldRequired",
  path: ["selectedGovernorate"],
});

type FormValues = z.infer<typeof formSchema>;

export default function GroupTripsPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfPeople: undefined as unknown as number,
      numberOfDays: undefined as unknown as number,
      preferences: [],
      country: "",
      arrivalDate: "",
      destinationPreference: "",
      selectedGovernorate: "",
    },
  });

  const destinationPref = form.watch("destinationPreference");

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        selectedGovernorate: data.destinationPreference === "single" ? data.selectedGovernorate : null,
      };
      const res = await apiRequest("POST", "/api/group-trips", payload);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("tryAgain"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const togglePreference = (pref: string) => {
    const current = form.getValues("preferences");
    const updated = current.includes(pref)
      ? current.filter((p) => p !== pref)
      : [...current, pref];
    form.setValue("preferences", updated, { shouldValidate: true });
  };

  const getCountryDisplay = (c: string) => {
    if (isRTL || language === "ar" || language === "fa") {
      return countriesAr[c] || c;
    }
    return c;
  };

  const getGovernorateName = (gov: typeof governorates[number]) => {
    if (language === "ar" || language === "fa") {
      return gov.nameAr;
    }
    return gov.nameEn;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground" data-testid="text-request-submitted">
              {t("requestSubmitted")}
            </h2>
            <p className="text-muted-foreground text-sm" data-testid="text-request-desc">
              {t("requestSubmittedDesc")}
            </p>
            <Button
              data-testid="button-back-home"
              onClick={() => setLocation("/home")}
              className="mt-4"
            >
              {t("backToHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => setLocation("/home")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BackArrow className="w-5 h-5" />
              <span className="text-sm font-medium">{t("back")}</span>
            </button>

            <div className="flex items-center gap-2">
              <img
                src={logoImage}
                alt="شومة"
                className="w-8 h-8 rounded-full object-cover mix-blend-multiply dark:mix-blend-screen dark:invert"
              />
              <h1 className="text-lg font-bold text-foreground" data-testid="text-header-title">
                {t("groupTrips")}
              </h1>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-page-title">
            {t("groupTrips")}
          </h2>
          <p className="text-muted-foreground text-sm" data-testid="text-page-subtitle">
            {t("groupTripsSubtitle")}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-5">
                <FormField
                  control={form.control}
                  name="numberOfPeople"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {t("numberOfPeople")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-number-of-people"
                          type="number"
                          min="1"
                          max="500"
                          placeholder="1"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.numberOfPeople && t(form.formState.errors.numberOfPeople.message || "fieldRequired")}</FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {t("numberOfDays")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-number-of-days"
                          type="number"
                          min="1"
                          max="90"
                          placeholder="1"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.numberOfDays && t(form.formState.errors.numberOfDays.message || "fieldRequired")}</FormMessage>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <FormField
                  control={form.control}
                  name="preferences"
                  render={() => (
                    <FormItem>
                      <FormLabel>{t("tripPreferences")}</FormLabel>
                      <p className="text-xs text-muted-foreground" data-testid="text-preferences-hint">
                        {t("selectPreferences")}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        {preferenceKeys.map((key, index) => {
                          const value = preferenceValues[index];
                          const isSelected = form.watch("preferences").includes(value);
                          return (
                            <button
                              key={value}
                              type="button"
                              data-testid={`button-pref-${value}`}
                              onClick={() => togglePreference(value)}
                              className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors toggle-elevate ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 toggle-elevated"
                                  : "bg-background border-border text-foreground"
                              }`}
                            >
                              {t(key)}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage>{form.formState.errors.preferences && t(form.formState.errors.preferences.message || "fieldRequired")}</FormMessage>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-5">
                <FormField
                  control={form.control}
                  name="destinationPreference"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {t("destinationPreference")}
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        {t("selectOneOption")}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          data-testid="button-dest-single"
                          onClick={() => {
                            form.setValue("destinationPreference", "single", { shouldValidate: true });
                          }}
                          className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors toggle-elevate ${
                            destinationPref === "single"
                              ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 toggle-elevated"
                              : "bg-background border-border text-foreground"
                          }`}
                        >
                          {t("singleGovernorate")}
                        </button>
                        <button
                          type="button"
                          data-testid="button-dest-multiple"
                          onClick={() => {
                            form.setValue("destinationPreference", "multiple", { shouldValidate: true });
                            form.setValue("selectedGovernorate", "", { shouldValidate: false });
                          }}
                          className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors toggle-elevate ${
                            destinationPref === "multiple"
                              ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 toggle-elevated"
                              : "bg-background border-border text-foreground"
                          }`}
                        >
                          {t("multipleGovernorates")}
                        </button>
                      </div>
                      <FormMessage>{form.formState.errors.destinationPreference && t(form.formState.errors.destinationPreference.message || "fieldRequired")}</FormMessage>
                    </FormItem>
                  )}
                />

                {destinationPref === "single" && (
                  <FormField
                    control={form.control}
                    name="selectedGovernorate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {t("selectGovernorate")}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-governorate">
                              <SelectValue placeholder={t("selectGovernorate")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {governorates.map((gov) => (
                              <SelectItem key={gov.id} value={gov.id} data-testid={`option-gov-${gov.id}`}>
                                {getGovernorateName(gov)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage>{form.formState.errors.selectedGovernorate && t(form.formState.errors.selectedGovernorate.message || "fieldRequired")}</FormMessage>
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-5">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        {t("countryOfOrigin")}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder={t("selectCountry")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c} value={c} data-testid={`option-country-${c}`}>
                              {getCountryDisplay(c)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage>{form.formState.errors.country && t(form.formState.errors.country.message || "fieldRequired")}</FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arrivalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {t("arrivalDate")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-arrival-date"
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.arrivalDate && t(form.formState.errors.arrivalDate.message || "fieldRequired")}</FormMessage>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              data-testid="button-submit-request"
              type="submit"
              className="w-full"
              size="lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className={isRTL ? "mr-2" : "ml-2"}>{t("submitRequest")}</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
