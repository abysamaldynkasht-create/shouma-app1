import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { restaurants } from "@/lib/restaurants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RestaurantReview } from "@shared/schema";
import { 
  UtensilsCrossed, 
  ArrowRight,
  ArrowLeft,
  MapPin,
  Star,
  Share2,
  Heart,
  ExternalLink,
  Check,
  Wallet,
  User,
  Send,
  Loader2
} from "lucide-react";

export default function RestaurantDetailPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<RestaurantReview[]>({
    queryKey: ['/api/restaurants', params.id, 'reviews'],
    enabled: !!params.id,
  });

  const addReviewMutation = useMutation({
    mutationFn: async (data: { userName: string; rating: number; comment: string }) => {
      const response = await apiRequest('POST', `/api/restaurants/${params.id}/reviews`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants', params.id, 'reviews'] });
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      toast({
        title: t('reviewSuccess'),
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: t('reviewError'),
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewName.length >= 2 && reviewComment.length >= 5) {
      addReviewMutation.mutate({
        userName: reviewName,
        rating: reviewRating,
        comment: reviewComment,
      });
    }
  };
  
  const restaurant = restaurants.find((r) => r.id === params.id);

  const getPriceRangeLabel = (range: string) => {
    const labels: Record<string, string> = {
      budget: t('priceBudget'),
      moderate: t('priceModerate'),
      expensive: t('priceExpensive'),
      luxury: t('priceLuxury'),
    };
    return labels[range] || range;
  };

  const getRelatedRestaurants = () => {
    if (!restaurant) return [];
    return restaurants
      .filter((r) => r.id !== restaurant.id && r.cuisine === restaurant.cuisine)
      .slice(0, 3);
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t('restaurantNotFound')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('restaurantNotFoundDesc')}
            </p>
            <Button onClick={() => setLocation("/restaurants")}>
              <BackArrow className="w-4 h-4 ml-2" />
              {t('backToRestaurants')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relatedRestaurants = getRelatedRestaurants();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/restaurants")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BackArrow className="w-5 h-5" />
              <span className="text-sm font-medium">{t('back')}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('restaurantDetails')}</span>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <Button variant="ghost" size="icon" data-testid="button-share">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-favorite">
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-[50vh] overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.nameAr}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 mb-3">
              {restaurant.cuisine}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg" data-testid="text-restaurant-title">
              {restaurant.nameAr}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{restaurant.city}، {restaurant.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-about-title">
                {t('aboutRestaurant')}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg" data-testid="text-restaurant-description">
                {restaurant.description}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t('features')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {restaurant.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-reviews-title">
                {t('customerReviews')} ({reviews.length})
              </h2>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{t('writeReview')}</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('yourName')}</label>
                      <div className="relative">
                        <Input
                          data-testid="input-review-name"
                          type="text"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder={t('yourName')}
                          className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                          minLength={2}
                          required
                        />
                        <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('yourRating')}</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            data-testid={`button-star-${star}`}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= (hoveredStar || reviewRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('yourComment')}</label>
                      <Textarea
                        data-testid="input-review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={t('yourComment')}
                        rows={3}
                        minLength={5}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      data-testid="button-submit-review"
                      disabled={addReviewMutation.isPending || reviewName.length < 2 || reviewComment.length < 5}
                      className="w-full"
                    >
                      {addReviewMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t('submitReview')}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground mt-2">{t('loadingReviews')}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-card rounded-lg border border-border">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{t('noReviews')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} data-testid={`card-review-${review.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{review.userName}</p>
                              <p className="text-sm text-muted-foreground">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">{t('quickInfo')}</h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('location')}</p>
                    <p className="font-medium">{restaurant.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('cuisineType')}</p>
                    <p className="font-medium">{restaurant.cuisine}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('priceLevel')}</p>
                    <p className="font-medium">{getPriceRangeLabel(restaurant.priceRange)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('rating')}</p>
                    <p className="font-medium">{restaurant.rating} / 5</p>
                  </div>
                </div>

                {restaurant.mapUrl && (
                  <Button 
                    className="w-full h-12" 
                    data-testid="button-location-restaurant"
                    onClick={() => window.open(restaurant.mapUrl!, '_blank')}
                  >
                    <MapPin className="w-5 h-5 ml-2" />
                    {t('viewLocation')}
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {relatedRestaurants.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {t('similarRestaurants')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedRestaurants.map((related) => (
                <Card 
                  key={related.id}
                  data-testid={`card-related-${related.id}`}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setLocation(`/restaurants/${related.id}`)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{related.nameAr}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{related.city}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            {t('copyright')} © {new Date().getFullYear()} {t('appName')}
          </p>
        </div>
      </footer>
    </div>
  );
}
