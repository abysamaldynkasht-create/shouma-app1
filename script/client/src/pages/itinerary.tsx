import { useState, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { governorates as allGovernorates } from "@shared/schema";
import { 
  Compass, 
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  UtensilsCrossed,
  Building2,
  Car,
  Clock,
  Home,
  Sparkles,
  Wallet,
  Pencil,
  Replace,
  Trash2,
  Plus,
  X,
  Check,
  Navigation,
  Loader2,
} from "lucide-react";
import type { Itinerary, ItineraryDay, ItineraryActivity } from "@shared/schema";

interface Suggestion {
  id: string;
  name: string;
  location: string;
  category?: string;
  governorateId?: string;
  lat: number;
  lng: number;
  estimatedCost?: number;
  distance?: number;
}

const activityIcons: Record<string, React.ReactNode> = {
  attraction: <MapPin className="w-4 h-4" />,
  restaurant: <UtensilsCrossed className="w-4 h-4" />,
  hotel: <Building2 className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
  activity: <Sparkles className="w-4 h-4" />,
};

const activityColors: Record<string, string> = {
  attraction: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  restaurant: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  hotel: "bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400",
  transport: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  activity: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function ItineraryPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL, language } = useLanguage();
  const searchString = useSearch();

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const fullUrl = searchString ? `/api/itinerary?${searchString}` : "/api/itinerary";
  
  const { data: fetchedItinerary, isLoading, error } = useQuery<Itinerary>({
    queryKey: [fullUrl],
  });

  const [editedItinerary, setEditedItinerary] = useState<Itinerary | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<{ dayIndex: number; activityIndex: number } | null>(null);
  const [addTarget, setAddTarget] = useState<{ dayIndex: number; afterIndex: number } | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const itinerary = editedItinerary || fetchedItinerary;

  const initEditMode = useCallback(() => {
    if (fetchedItinerary && !editedItinerary) {
      setEditedItinerary(JSON.parse(JSON.stringify(fetchedItinerary)));
    }
    setEditMode(true);
  }, [fetchedItinerary, editedItinerary]);

  const fetchSuggestions = async (type: string, excludeIds: string[], governorateId?: string, category?: string) => {
    setLoadingSuggestions(true);
    try {
      const params = new URLSearchParams({ type, exclude: excludeIds.join(",") });
      if (governorateId) params.set("governorateId", governorateId);
      if (category) params.set("category", category);
      const res = await fetch(`/api/itinerary/suggestions?${params}`);
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const recalcBudget = (itin: Itinerary): Itinerary => {
    let hotels = 0, restaurants = 0, attractions = 0, activitiesCost = 0, transport = 0;
    for (const day of itin.days) {
      for (const act of day.activities) {
        const cost = act.estimatedCost || 0;
        if (act.type === "hotel" && cost > 0) hotels += cost;
        else if (act.type === "restaurant") restaurants += cost;
        else if (act.type === "attraction") attractions += cost;
        else if (act.type === "activity") activitiesCost += cost;
      }
    }
    transport = itin.budgetSummary?.transport || 0;
    return {
      ...itin,
      budgetSummary: {
        hotels,
        restaurants,
        attractions,
        activities: activitiesCost,
        transport,
        total: hotels + restaurants + attractions + activitiesCost + transport,
      },
    };
  };

  const handleReplace = (dayIndex: number, activityIndex: number) => {
    if (!editedItinerary) return;
    const activity = editedItinerary.days[dayIndex].activities[activityIndex];
    const usedIds = editedItinerary.days.flatMap(d => d.activities.filter(a => a.itemId && a.type === activity.type).map(a => a.itemId!));
    const govs = editedItinerary.governorates;
    setReplaceTarget({ dayIndex, activityIndex });
    fetchSuggestions(activity.type, usedIds, govs.length === 1 ? govs[0] : undefined, activity.category);
  };

  const confirmReplace = (suggestion: Suggestion) => {
    if (!replaceTarget || !editedItinerary) return;
    const updated = { ...editedItinerary, days: [...editedItinerary.days] };
    const day = { ...updated.days[replaceTarget.dayIndex] };
    const activities = [...day.activities];
    const oldActivity = activities[replaceTarget.activityIndex];
    activities[replaceTarget.activityIndex] = {
      ...oldActivity,
      activity: suggestion.name,
      location: suggestion.location,
      itemId: suggestion.id,
      estimatedCost: suggestion.estimatedCost ?? oldActivity.estimatedCost,
      category: suggestion.category ?? oldActivity.category,
    };
    day.activities = activities;
    updated.days[replaceTarget.dayIndex] = day;
    setEditedItinerary(recalcBudget(updated));
    setReplaceTarget(null);
    setSuggestions([]);
  };

  const handleDelete = (dayIndex: number, activityIndex: number) => {
    if (!editedItinerary) return;
    const updated = { ...editedItinerary, days: [...editedItinerary.days] };
    const day = { ...updated.days[dayIndex] };
    const activities = [...day.activities];
    activities.splice(activityIndex, 1);
    day.activities = recalculateTimes(activities);
    updated.days[dayIndex] = day;
    setEditedItinerary(recalcBudget(updated));
  };

  const handleAddPlace = (dayIndex: number, afterIndex: number) => {
    if (!editedItinerary) return;
    const usedIds = editedItinerary.days.flatMap(d => d.activities.filter(a => a.itemId).map(a => a.itemId!));
    const govs = editedItinerary.governorates;
    setAddTarget({ dayIndex, afterIndex });
    fetchSuggestions("attraction", usedIds, govs.length === 1 ? govs[0] : undefined);
  };

  const confirmAdd = (suggestion: Suggestion) => {
    if (!addTarget || !editedItinerary) return;
    const updated = { ...editedItinerary, days: [...editedItinerary.days] };
    const day = { ...updated.days[addTarget.dayIndex] };
    const activities = [...day.activities];
    const newActivity: ItineraryActivity = {
      time: "12:00",
      activity: suggestion.name,
      location: suggestion.location,
      type: "attraction",
      itemId: suggestion.id,
      estimatedCost: suggestion.estimatedCost || 0,
      category: suggestion.category,
    };
    activities.splice(addTarget.afterIndex + 1, 0, newActivity);
    day.activities = recalculateTimes(activities);
    updated.days[addTarget.dayIndex] = day;
    setEditedItinerary(recalcBudget(updated));
    setAddTarget(null);
    setSuggestions([]);
  };

  const recalculateTimes = (activities: ItineraryActivity[]): ItineraryActivity[] => {
    const timeSlots = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
    return activities.map((a, i) => ({
      ...a,
      time: i < timeSlots.length ? timeSlots[i] : `${21 + (i - timeSlots.length)}:00`,
    }));
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

  const getGovernorateName = (id: string) => {
    const gov = allGovernorates.find(g => g.id === id);
    return gov ? (language === 'ar' || language === 'fa' ? gov.nameAr : gov.nameEn) : id;
  };

  const handleItemClick = (type: string, id: string) => {
    if (editMode) return;
    const routes: Record<string, string> = {
      attraction: `/attractions/${id}`,
      restaurant: `/restaurants/${id}`,
      hotel: `/hotels/${id}`,
    };
    if (routes[type]) {
      setLocation(routes[type]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <button
                onClick={() => setLocation("/shoumatak")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <BackArrow className="w-5 h-5" />
                <span className="text-sm font-medium">{t('back')}</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Compass className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">{t('yourItinerary')}</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <Skeleton className="w-64 h-10 mx-auto mb-4" />
            <Skeleton className="w-48 h-6 mx-auto" />
            <p className="text-muted-foreground mt-4">{t('creatingItinerary')}</p>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="w-40 h-8" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex gap-4">
                      <Skeleton className="w-16 h-6" />
                      <Skeleton className="flex-1 h-6" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t('error')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('tryAgain')}
            </p>
            <Button onClick={() => setLocation("/shoumatak")}>
              <BackArrow className="w-4 h-4" />
              <span className="mx-2">{t('back')}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => setLocation("/shoumatak")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BackArrow className="w-5 h-5" />
              <span className="text-sm font-medium">{t('back')}</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('yourItinerary')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button
                data-testid="button-home"
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/home")}
              >
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('itineraryReady')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {itinerary.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{itinerary.duration} {t('days')}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span>{getBudgetLabel(itinerary.budget)}</span>
            </div>
          </div>
          {itinerary.governorates && itinerary.governorates.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {itinerary.governorates.map((gov) => (
                <Badge key={gov} variant="secondary" className="text-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  {getGovernorateName(gov)}
                </Badge>
              ))}
            </div>
          )}
          <Button
            data-testid="button-edit-itinerary"
            variant={editMode ? "default" : "outline"}
            size="lg"
            onClick={() => {
              if (editMode) {
                setEditMode(false);
              } else {
                initEditMode();
              }
            }}
            className="h-12 px-6 rounded-full"
          >
            {editMode ? (
              <>
                <Check className="w-5 h-5" />
                <span className="mx-2">{t('finishEditing')}</span>
              </>
            ) : (
              <>
                <Pencil className="w-5 h-5" />
                <span className="mx-2">{t('editItinerary')}</span>
              </>
            )}
          </Button>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {editMode && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
            <p className="text-sm text-primary font-medium">{t('editModeHint')}</p>
          </div>
        )}

        <div className="space-y-8">
          {itinerary.days.map((day, dayIndex) => (
            <DayCard
              key={day.day}
              day={day}
              dayIndex={dayIndex}
              t={t}
              editMode={editMode}
              onItemClick={handleItemClick}
              onReplace={handleReplace}
              onDelete={handleDelete}
              onAdd={handleAddPlace}
            />
          ))}
        </div>

        {itinerary.budgetSummary && (
          <Card data-testid="card-budget-summary" className="mt-10 overflow-hidden border-primary/20">
            <CardHeader className="bg-gradient-to-l from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                {t('estimatedBudget')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <BudgetRow icon={<Building2 className="w-4 h-4" />} label={t('hotelsCost')} value={itinerary.budgetSummary.hotels} currency={t('omrCurrency')} />
                <BudgetRow icon={<UtensilsCrossed className="w-4 h-4" />} label={t('restaurantsCost')} value={itinerary.budgetSummary.restaurants} currency={t('omrCurrency')} />
                <BudgetRow icon={<MapPin className="w-4 h-4" />} label={t('attractionsCost')} value={itinerary.budgetSummary.attractions} currency={t('omrCurrency')} />
                <BudgetRow icon={<Sparkles className="w-4 h-4" />} label={t('activitiesCost')} value={itinerary.budgetSummary.activities} currency={t('omrCurrency')} />
                <BudgetRow icon={<Car className="w-4 h-4" />} label={t('transportCost')} value={itinerary.budgetSummary.transport} currency={t('omrCurrency')} />
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{t('totalCost')}</span>
                <span data-testid="text-total-cost" className="text-2xl font-bold text-primary">
                  {itinerary.budgetSummary.total} {t('omrCurrency')}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <Button
            data-testid="button-new-plan"
            variant="outline"
            size="lg"
            onClick={() => setLocation("/shoumatak")}
            className="h-12 px-6 rounded-full"
          >
            <BackArrow className="w-5 h-5" />
            <span className="mx-2">{t('startNewTrip')}</span>
          </Button>
          <Button
            data-testid="button-home-footer"
            size="lg"
            onClick={() => setLocation("/home")}
            className="h-12 px-6 rounded-full"
          >
            <Home className="w-5 h-5" />
            <span className="mx-2">{t('backToHome')}</span>
          </Button>
        </div>
      </main>

      <Dialog open={replaceTarget !== null} onOpenChange={() => { setReplaceTarget(null); setSuggestions([]); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Replace className="w-5 h-5 text-primary" />
              {t('replacePlaceTitle')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">{t('replacePlaceDesc')}</p>
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('noSuggestions')}</p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  data-testid={`suggestion-replace-${s.id}`}
                  onClick={() => confirmReplace(s)}
                  className="w-full text-start p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.location}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.estimatedCost !== undefined && s.estimatedCost > 0 && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        {s.estimatedCost} {t('omrCurrency')}
                      </Badge>
                    )}
                    {s.distance !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        <Navigation className="w-3 h-3 mr-1" />
                        {s.distance} {t('km')}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addTarget !== null} onOpenChange={() => { setAddTarget(null); setSuggestions([]); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              {t('addPlaceTitle')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">{t('addPlaceDesc')}</p>
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('noSuggestions')}</p>
          ) : (
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  data-testid={`suggestion-add-${s.id}`}
                  onClick={() => confirmAdd(s)}
                  className="w-full text-start p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.location}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.estimatedCost !== undefined && s.estimatedCost > 0 && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        {s.estimatedCost} {t('omrCurrency')}
                      </Badge>
                    )}
                    {s.distance !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        <Navigation className="w-3 h-3 mr-1" />
                        {s.distance} {t('km')}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DayCard({ 
  day, dayIndex, t, editMode, onItemClick, onReplace, onDelete, onAdd 
}: { 
  day: ItineraryDay; 
  dayIndex: number;
  t: (key: string) => string; 
  editMode: boolean;
  onItemClick: (type: string, id: string) => void;
  onReplace: (dayIndex: number, activityIndex: number) => void;
  onDelete: (dayIndex: number, activityIndex: number) => void;
  onAdd: (dayIndex: number, afterIndex: number) => void;
}) {
  return (
    <Card data-testid={`card-day-${day.day}`} className="overflow-hidden">
      <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{day.day}</span>
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{day.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('dayNumber')} {day.day}</p>
          </div>
          {editMode && (
            <Button
              data-testid={`button-add-place-day-${day.day}`}
              variant="outline"
              size="sm"
              onClick={() => onAdd(dayIndex, day.activities.length - 1)}
              className="shrink-0 gap-1 text-primary border-primary/30 hover:bg-primary/10"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('addPlace')}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {day.activities.map((activity, index) => (
            <div key={index}>
              <div 
                data-testid={`activity-${day.day}-${index}`}
                className={`flex gap-4 items-start group relative ${!editMode && activity.itemId ? 'cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors' : ''} ${editMode ? '-mx-2 px-2 py-2 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all' : ''}`}
                onClick={() => !editMode && activity.itemId && onItemClick(activity.type, activity.itemId)}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activityColors[activity.type]}`}>
                    {activityIcons[activity.type]}
                  </div>
                  {index < day.activities.length - 1 && (
                    <div className="w-0.5 h-12 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span>{activity.time}</span>
                  </div>
                  <h4 className={`font-semibold mb-1 ${!editMode && activity.itemId ? 'text-primary hover:underline' : 'text-foreground'}`}>
                    {activity.activity}
                  </h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activity.location}
                  </p>
                  {activity.estimatedCost !== undefined && activity.estimatedCost > 0 && (
                    <Badge variant="outline" className="mt-1 text-xs w-fit border-primary/30 text-primary">
                      {activity.estimatedCost} {t('omrCurrency')}
                    </Badge>
                  )}
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {activity.description}
                    </p>
                  )}
                </div>
                {editMode && activity.type !== "transport" && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      data-testid={`button-replace-${day.day}-${index}`}
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-primary hover:bg-primary/10"
                      onClick={(e) => { e.stopPropagation(); onReplace(dayIndex, index); }}
                      title={t('replacePlace')}
                    >
                      <Replace className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`button-delete-${day.day}-${index}`}
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); onDelete(dayIndex, index); }}
                      title={t('deletePlace')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`button-add-after-${day.day}-${index}`}
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                      onClick={(e) => { e.stopPropagation(); onAdd(dayIndex, index); }}
                      title={t('addPlace')}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetRow({ icon, label, value, currency }: { icon: React.ReactNode; label: string; value: number; currency: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="font-semibold text-foreground">{value} {currency}</p>
      </div>
    </div>
  );
}
