import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Navigation, MapPin, Star, Loader2, ExternalLink, Map, List, Filter } from "lucide-react";
import { attractions } from "@/lib/attractions";
import type { Attraction } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThemeToggle from "@/components/ThemeToggle";

interface NearbyAttraction extends Attraction {
  distance: number;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const governorates = [
  { id: "all", nameAr: "جميع المحافظات", name: "All Governorates" },
  { id: "muscat", nameAr: "محافظة مسقط", name: "Muscat" },
  { id: "dakhiliyah", nameAr: "محافظة الداخلية", name: "Ad Dakhiliyah" },
  { id: "dhofar", nameAr: "محافظة ظفار", name: "Dhofar" },
  { id: "sharqiyah-north", nameAr: "محافظة شمال الشرقية", name: "North Ash Sharqiyah" },
  { id: "sharqiyah-south", nameAr: "محافظة جنوب الشرقية", name: "South Ash Sharqiyah" },
  { id: "batinah-north", nameAr: "محافظة شمال الباطنة", name: "North Al Batinah" },
  { id: "batinah-south", nameAr: "محافظة جنوب الباطنة", name: "South Al Batinah" },
  { id: "wusta", nameAr: "محافظة الوسطى", name: "Al Wusta" },
  { id: "dhahirah", nameAr: "محافظة الظاهرة", name: "Ad Dhahirah" },
  { id: "buraymi", nameAr: "محافظة البريمي", name: "Al Buraymi" },
  { id: "musandam", nameAr: "محافظة مسندم", name: "Musandam" },
];

const distanceOptions = [
  { id: "all", value: 9999, labelAr: "الكل", label: "All" },
  { id: "5", value: 5, labelAr: "5 كم", label: "5 km" },
  { id: "10", value: 10, labelAr: "10 كم", label: "10 km" },
  { id: "25", value: 25, labelAr: "25 كم", label: "25 km" },
  { id: "50", value: 50, labelAr: "50 كم", label: "50 km" },
  { id: "100", value: 100, labelAr: "100 كم", label: "100 km" },
];

export default function NearbyPlacesPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [allNearbyAttractions, setAllNearbyAttractions] = useState<NearbyAttraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<NearbyAttraction[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<string>("all");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const requestLocation = () => {
    setLocationStatus("loading");
    
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus("success");
        
        const attractionsWithCoords = attractions.filter(a => a.lat && a.lng);
        const withDistances: NearbyAttraction[] = attractionsWithCoords.map(attraction => ({
          ...attraction,
          distance: calculateDistance(latitude, longitude, attraction.lat!, attraction.lng!)
        }));
        
        withDistances.sort((a, b) => a.distance - b.distance);
        setAllNearbyAttractions(withDistances);
        setFilteredAttractions(withDistances);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationStatus("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    let filtered = [...allNearbyAttractions];
    
    if (selectedDistance !== "all") {
      const maxDistance = distanceOptions.find(d => d.id === selectedDistance)?.value || 9999;
      filtered = filtered.filter(a => a.distance <= maxDistance);
    }
    
    if (selectedGovernorate !== "all") {
      const gov = governorates.find(g => g.id === selectedGovernorate);
      if (gov) {
        filtered = filtered.filter(a => 
          a.governorate === gov.nameAr || 
          a.governorate?.includes(gov.nameAr.replace("محافظة ", ""))
        );
      }
    }
    
    setFilteredAttractions(filtered);
  }, [selectedDistance, selectedGovernorate, allNearbyAttractions]);

  const openInGoogleMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const openMapView = () => {
    if (!userLocation) return;
    const markers = filteredAttractions.slice(0, 10).map(a => `${a.lat},${a.lng}`).join('|');
    const url = `https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}`;
    window.open(url, '_blank');
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-back"
              onClick={() => setLocation("/home")}
            >
              <BackArrow className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">
                {t('nearbyPlacesTitle')}
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-page-subtitle">
                {t('nearbyPlacesSubtitle')}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {locationStatus === "idle" || locationStatus === "loading" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2" data-testid="text-searching">
              {t('searchingLocation')}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {t('locationRequired')}
            </p>
          </div>
        ) : locationStatus === "error" ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Navigation className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2" data-testid="text-error">
              {t('locationError')}
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {t('locationRequired')}
            </p>
            <Button onClick={requestLocation} data-testid="button-retry">
              {t('enableLocation')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">{t('filterResults')}</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{t('distance')}</label>
                  <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                    <SelectTrigger data-testid="select-distance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {distanceOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {isRTL ? option.labelAr : option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">{t('governorate')}</label>
                  <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                    <SelectTrigger data-testid="select-governorate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {governorates.map(gov => (
                        <SelectItem key={gov.id} value={gov.id}>
                          {isRTL ? gov.nameAr : gov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 flex items-end gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    data-testid="button-view-list"
                  >
                    <List className="w-4 h-4" />
                    <span className={isRTL ? 'mr-2' : 'ml-2'}>{t('listView')}</span>
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setViewMode("map");
                      openMapView();
                    }}
                    data-testid="button-view-map"
                  >
                    <Map className="w-4 h-4" />
                    <span className={isRTL ? 'mr-2' : 'ml-2'}>{t('mapView')}</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="w-4 h-4" />
                <span data-testid="text-results-count">
                  {filteredAttractions.length} {t('attractionCount')}
                </span>
              </div>
              {userLocation && (
                <div className="text-xs text-muted-foreground">
                  {t('yourLocation')}: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              )}
            </div>

            {filteredAttractions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <MapPin className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2" data-testid="text-no-results">
                  {t('noNearbyPlaces')}
                </h2>
                <p className="text-muted-foreground">{t('tryDifferentFilter')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAttractions.map((attraction) => (
                  <Card 
                    key={attraction.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                    data-testid={`card-attraction-${attraction.id}`}
                  >
                    <div className="aspect-video relative bg-muted">
                      {attraction.image ? (
                        <img 
                          src={attraction.image} 
                          alt={attraction.nameAr}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <MapPin className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium`}>
                        {attraction.distance.toFixed(1)} {t('km')}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1" data-testid={`text-attraction-name-${attraction.id}`}>
                        {attraction.nameAr}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {attraction.description}
                      </p>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-muted-foreground">{attraction.wilayat}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{attraction.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setLocation(`/attractions/${attraction.id}`)}
                          data-testid={`button-details-${attraction.id}`}
                        >
                          {t('viewDetails')}
                        </Button>
                        {attraction.lat && attraction.lng && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openInGoogleMaps(attraction.lat!, attraction.lng!, attraction.nameAr)}
                            data-testid={`button-navigate-${attraction.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className={isRTL ? 'mr-1' : 'ml-1'}>{t('navigate')}</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
