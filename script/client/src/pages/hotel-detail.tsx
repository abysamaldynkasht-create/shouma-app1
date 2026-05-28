import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { hotels } from "@/lib/hotels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PaymentModal from "@/components/PaymentModal";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import type { RoomOption, HotelReview } from "@shared/schema";
import { 
  Building2, 
  ArrowRight,
  ArrowLeft,
  MapPin,
  Star,
  Share2,
  Heart,
  CreditCard,
  Check,
  Wifi,
  Car,
  UtensilsCrossed,
  Waves,
  Phone,
  Users,
  Bed,
  Navigation,
  MessageSquare,
  User,
  Send
} from "lucide-react";

export default function HotelDetailPage() {
  const [, setLocation] = useLocation();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [reviews, setReviews] = useState<HotelReview[]>([]);
  const [newReview, setNewReview] = useState({ userName: "", rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const params = useParams<{ id: string }>();
  const { t, language, isRTL } = useLanguage();
  
  const hotel = hotels.find((h) => h.id === params.id);
  
  useEffect(() => {
    if (hotel?.reviews) {
      setReviews(hotel.reviews);
    }
  }, [hotel]);

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  const getRelatedHotels = () => {
    if (!hotel) return [];
    return hotels
      .filter((h) => h.id !== hotel.id && h.region === hotel.region)
      .slice(0, 3);
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t('hotelNotFound')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('hotelNotFoundDesc')}
            </p>
            <Button onClick={() => setLocation("/hotels")}>
              <BackArrow className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('backToHotels')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const relatedHotels = getRelatedHotels();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => window.history.length > 1 ? window.history.back() : setLocation("/hotels")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BackArrow className="w-5 h-5" />
              <span className="text-sm font-medium">{t('back')}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">{t('hotelDetails')}</span>
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
          src={hotel.image}
          alt={hotel.nameAr}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        <div className={`absolute bottom-0 ${isRTL ? 'right-0 left-0' : 'left-0 right-0'} p-6 sm:p-8`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-1 mb-3">
              {renderStars(hotel.stars)}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg" data-testid="text-hotel-title">
              {hotel.nameAr}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{hotel.city}، {hotel.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{hotel.rating}</span>
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
                {t('aboutHotel')}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg" data-testid="text-hotel-description">
                {language === 'ar' || language === 'fa' 
                  ? hotel.description 
                  : language === 'fr' 
                    ? (hotel.descriptionFr || hotel.descriptionEn || hotel.description)
                    : language === 'tr'
                      ? (hotel.descriptionTr || hotel.descriptionEn || hotel.description)
                      : (hotel.descriptionEn || hotel.description)}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t('facilitiesAndServices')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {hotel.roomOptions && hotel.roomOptions.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {t('roomOptions')}
                </h2>
                <div className="space-y-4">
                  {hotel.roomOptions.map((room) => (
                    <Card 
                      key={room.id} 
                      className={`overflow-hidden cursor-pointer transition-all ${
                        selectedRoom?.id === room.id 
                          ? "ring-2 ring-primary border-primary" 
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedRoom(room)}
                      data-testid={`card-room-${room.id}`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {room.image && (
                          <div className="md:w-1/3 aspect-video md:aspect-auto">
                            <img 
                              src={room.image} 
                              alt={room.nameAr} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className={`p-5 ${room.image ? 'md:w-2/3' : 'w-full'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Bed className="w-5 h-5 text-primary" />
                              <h3 className="font-bold text-lg">{room.nameAr}</h3>
                              {selectedRoom?.id === room.id && (
                                <Badge className="bg-primary text-primary-foreground">{t('selected')}</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{room.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{t('upToGuests').replace('{count}', String(room.maxGuests))}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {room.amenities.slice(0, 4).map((amenity) => (
                                <Badge key={amenity} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {room.amenities.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{room.amenities.length - 4} {t('more')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className={`${isRTL ? 'text-left sm:text-right' : 'text-right sm:text-left'}`}>
                            <p className="text-2xl font-bold text-primary">{room.pricePerNight} {t('omr')}</p>
                            <p className="text-sm text-muted-foreground">{t('perNight')}</p>
                            <Button 
                              className="mt-3"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoom(room);
                                setPaymentOpen(true);
                              }}
                              data-testid={`button-book-room-${room.id}`}
                            >
                              {t('book')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {hotel.gallery.length > 1 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {t('photoGallery')}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {hotel.gallery.map((img, index) => (
                    <div key={index} className="aspect-video rounded-xl overflow-hidden">
                      <img src={img} alt={`${hotel.nameAr} ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('reviewsAndComments')}
                  </h2>
                  <Badge variant="secondary">{reviews.length}</Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  data-testid="button-add-review"
                >
                  {showReviewForm ? t('cancel') : t('addReview')}
                </Button>
              </div>

              {showReviewForm && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">{t('addReview')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('yourName')}</label>
                        <Input
                          data-testid="input-review-name"
                          placeholder={t('enterYourName')}
                          value={newReview.userName}
                          onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('rating')}</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="p-1"
                              data-testid={`button-star-${star}`}
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= newReview.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
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
                          placeholder={t('shareYourExperience')}
                          rows={4}
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          if (newReview.userName && newReview.comment) {
                            const review: HotelReview = {
                              id: Date.now().toString(),
                              userName: newReview.userName,
                              rating: newReview.rating,
                              comment: newReview.comment,
                              date: new Date().toLocaleDateString(language === 'ar' ? "ar-OM" : "en-US"),
                            };
                            setReviews([review, ...reviews]);
                            setNewReview({ userName: "", rating: 5, comment: "" });
                            setShowReviewForm(false);
                          }
                        }}
                        data-testid="button-submit-review"
                      >
                        <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('submitReview')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{t('noReviewsYet')}</h3>
                    <p className="text-muted-foreground mb-4">{t('beFirstToReview')}</p>
                    <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                      {t('addFirstReview')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} data-testid={`card-review-${review.id}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold">{review.userName}</h4>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex gap-0.5 mb-3">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
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
                <div className="text-center pb-4 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-1">{t('priceStartsFrom')}</p>
                  <p className="text-3xl font-bold text-primary">{hotel.pricePerNight} {t('omr')}</p>
                  <p className="text-xs text-muted-foreground">{t('perNight')}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('location')}</p>
                    <p className="font-medium">{hotel.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('rating')}</p>
                    <p className="font-medium">{hotel.rating} / 5</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('classification')}</p>
                    <div className="flex gap-0.5">
                      {renderStars(hotel.stars)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('forBookingAndInquiry')}</p>
                    <a 
                      href={`tel:${hotel.phone}`} 
                      className="font-medium text-primary hover:underline"
                      dir="ltr"
                      data-testid="link-hotel-phone"
                    >
                      {hotel.phone}
                    </a>
                  </div>
                </div>

                {hotel.mapUrl && (
                  <a
                    href={hotel.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                    data-testid="link-hotel-map"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">{t('viewOnMap')}</p>
                      <p className="text-xs text-muted-foreground">{t('openInGoogleMaps')}</p>
                    </div>
                  </a>
                )}

                {hotel.roomOptions && hotel.roomOptions.length > 0 ? (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t('selectRoomTypeAbove')}</p>
                    {selectedRoom && (
                      <Button 
                        className="w-full h-12" 
                        data-testid="button-book-now"
                        onClick={() => setPaymentOpen(true)}
                      >
                        <CreditCard className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('bookRoom').replace('{room}', selectedRoom.nameAr)}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button 
                    className="w-full h-12" 
                    data-testid="button-book-now"
                    onClick={() => setPaymentOpen(true)}
                  >
                    <CreditCard className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('book')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <PaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          hotelName={selectedRoom ? `${hotel.nameAr} - ${selectedRoom.nameAr}` : hotel.nameAr}
          pricePerNight={selectedRoom ? selectedRoom.pricePerNight : hotel.pricePerNight}
          nights={1}
        />

        {relatedHotels.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {t('similarHotels')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedHotels.map((related) => (
                <Card 
                  key={related.id}
                  data-testid={`card-related-${related.id}`}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setLocation(`/hotels/${related.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className={`absolute top-3 flex gap-0.5 ${isRTL ? 'right-3' : 'left-3'}`}>
                      {Array.from({ length: related.stars }, (_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {related.nameAr}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{related.city}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">{t('perNight')}</span>
                      <span className="font-bold text-primary">{related.pricePerNight} {t('omr')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
