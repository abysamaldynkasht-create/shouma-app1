import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Compass, MapPin, Star, Clock, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { activities } from "@/lib/activities";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";

export default function ActivitiesPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/home")}
                data-testid="button-back"
              >
                <BackArrow className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">
                {t('activities')}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Compass className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-no-activities">
              {t('noActivitiesYet')}
            </h2>
            <p className="text-muted-foreground text-center max-w-md" data-testid="text-coming-soon">
              {t('activitiesComingSoon')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
                data-testid={`card-activity-${activity.id}`}
              >
                <div className="aspect-video relative">
                  <img
                    src={activity.image}
                    alt={isRTL ? activity.nameAr : activity.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{activity.rating}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {isRTL ? activity.nameAr : activity.name}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{activity.duration}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {isRTL ? activity.descriptionAr : activity.description}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-lg font-bold text-primary">{activity.price}</span>
                    {activity.mapUrl && !activity.branches && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(activity.mapUrl, '_blank')}
                        data-testid={`button-map-${activity.id}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className={isRTL ? 'mr-2' : 'ml-2'}>{t('viewOnMap')}</span>
                      </Button>
                    )}
                  </div>
                  {activity.branches && activity.branches.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-semibold text-foreground mb-2">{isRTL ? 'الفروع:' : 'Branches:'}</p>
                      <div className="flex flex-wrap gap-2">
                        {activity.branches.map((branch, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(branch.mapUrl, '_blank')}
                            data-testid={`button-branch-${activity.id}-${idx}`}
                            className="text-xs"
                          >
                            <MapPin className="w-3 h-3" />
                            <span className={isRTL ? 'mr-1' : 'ml-1'}>{isRTL ? branch.nameAr : branch.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
