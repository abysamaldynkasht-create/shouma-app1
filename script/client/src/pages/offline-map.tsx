import { useState } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, MapPin, Wifi, WifiOff, X, Star, ExternalLink } from "lucide-react";
import { attractions } from "@/lib/attractions";
import shoumaLogo from "@assets/شومة_1768320219408.jpg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

interface GovernorateRegion {
  id: string;
  nameAr: string;
  nameEn: string;
  path: string;
  labelX: number;
  labelY: number;
  color: string;
}

const governorateRegions: GovernorateRegion[] = [
  {
    id: "musandam",
    nameAr: "مسندم",
    nameEn: "Musandam",
    path: "M 340 15 L 365 10 L 385 25 L 390 50 L 380 75 L 370 90 L 355 85 L 345 65 L 335 45 Z",
    labelX: 362,
    labelY: 50,
    color: "#C4956A"
  },
  {
    id: "buraimi",
    nameAr: "البريمي",
    nameEn: "Al Buraimi",
    path: "M 240 85 L 270 75 L 295 80 L 310 95 L 305 120 L 285 130 L 260 125 L 245 110 Z",
    labelX: 275,
    labelY: 102,
    color: "#D4A574"
  },
  {
    id: "north_batinah",
    nameAr: "شمال الباطنة",
    nameEn: "North Al Batinah",
    path: "M 295 80 L 335 45 L 355 85 L 370 90 L 385 110 L 395 130 L 380 145 L 350 140 L 320 135 L 305 120 Z",
    labelX: 345,
    labelY: 110,
    color: "#B8845E"
  },
  {
    id: "south_batinah",
    nameAr: "جنوب الباطنة",
    nameEn: "South Al Batinah",
    path: "M 305 120 L 320 135 L 350 140 L 380 145 L 390 165 L 380 185 L 355 190 L 330 180 L 310 165 L 300 145 Z",
    labelX: 345,
    labelY: 160,
    color: "#C9A07A"
  },
  {
    id: "muscat",
    nameAr: "مسقط",
    nameEn: "Muscat",
    path: "M 380 145 L 395 130 L 415 140 L 425 160 L 420 180 L 400 190 L 390 175 L 390 165 Z",
    labelX: 405,
    labelY: 162,
    color: "#A67B5B"
  },
  {
    id: "dakhiliyah",
    nameAr: "الداخلية",
    nameEn: "Ad Dakhiliyah",
    path: "M 245 110 L 260 125 L 285 130 L 305 120 L 300 145 L 310 165 L 330 180 L 355 190 L 380 185 L 390 175 L 400 190 L 380 210 L 350 230 L 310 240 L 280 230 L 260 210 L 245 185 L 235 155 L 240 130 Z",
    labelX: 310,
    labelY: 185,
    color: "#D4B896"
  },
  {
    id: "north_sharqiyah",
    nameAr: "شمال الشرقية",
    nameEn: "North Ash Sharqiyah",
    path: "M 380 185 L 400 190 L 420 180 L 440 195 L 445 220 L 430 245 L 405 250 L 380 240 L 350 230 L 380 210 Z",
    labelX: 405,
    labelY: 220,
    color: "#BF9B7A"
  },
  {
    id: "south_sharqiyah",
    nameAr: "جنوب الشرقية",
    nameEn: "South Ash Sharqiyah",
    path: "M 350 230 L 380 240 L 405 250 L 430 245 L 445 270 L 440 300 L 420 330 L 390 340 L 360 320 L 340 290 L 310 260 L 310 240 Z",
    labelX: 380,
    labelY: 285,
    color: "#C4956A"
  },
  {
    id: "dhahirah",
    nameAr: "الظاهرة",
    nameEn: "Ad Dhahirah",
    path: "M 190 120 L 240 85 L 245 110 L 240 130 L 235 155 L 220 160 L 200 150 L 190 135 Z",
    labelX: 218,
    labelY: 130,
    color: "#D4A574"
  },
  {
    id: "wusta",
    nameAr: "الوسطى",
    nameEn: "Al Wusta",
    path: "M 190 135 L 200 150 L 220 160 L 235 155 L 245 185 L 260 210 L 280 230 L 310 240 L 310 260 L 340 290 L 360 320 L 340 360 L 300 400 L 260 410 L 220 390 L 195 350 L 180 300 L 175 250 L 180 200 Z",
    labelX: 255,
    labelY: 310,
    color: "#E8D5B5"
  },
  {
    id: "dhofar",
    nameAr: "ظفار",
    nameEn: "Dhofar",
    path: "M 30 380 L 80 350 L 130 340 L 180 330 L 195 350 L 220 390 L 260 410 L 300 400 L 340 360 L 360 380 L 350 410 L 320 440 L 280 460 L 230 470 L 170 465 L 110 450 L 60 430 L 30 410 Z",
    labelX: 195,
    labelY: 415,
    color: "#8B7355"
  }
];

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLng = 51.5;
  const maxLng = 60.0;
  const minLat = 16.5;
  const maxLat = 26.7;

  const x = ((lng - minLng) / (maxLng - minLng)) * 450 + 10;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 480 + 10;
  return { x, y };
}

export default function OfflineMapPage() {
  const [, setLocation] = useLocation();
  const { t, language, isRTL } = useLanguage();
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [hoveredGovernorate, setHoveredGovernorate] = useState<string | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);

  const filteredAttractions = selectedGovernorate
    ? attractions.filter(a => a.governorateId === selectedGovernorate)
    : [];

  const attractionsWithCoords = attractions.filter(a => a.lat && a.lng);

  const selectedGov = governorateRegions.find(g => g.id === selectedGovernorate);
  const selectedAttr = attractions.find(a => a.id === selectedAttraction);

  const getGovernorateAttractionCount = (govId: string) => {
    return attractions.filter(a => a.governorateId === govId).length;
  };

  const getGovName = (gov: GovernorateRegion) => {
    if (language === 'ar' || language === 'fa') return gov.nameAr;
    return gov.nameEn;
  };

  const getAttrName = (attr: typeof attractions[0]) => {
    if (language === 'ar' || language === 'fa') return attr.nameAr;
    return attr.name;
  };

  const getAttrDesc = (attr: typeof attractions[0]) => {
    if (language === 'en') return attr.descriptionEn || attr.description;
    if (language === 'fr') return attr.descriptionFr || attr.descriptionEn || attr.description;
    if (language === 'tr') return attr.descriptionTr || attr.descriptionEn || attr.description;
    return attr.description;
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <div className="flex items-center gap-2">
              <img src={shoumaLogo} alt="شومة" className="h-10 w-auto mix-blend-multiply dark:mix-blend-screen dark:invert" />
              <h1 className="text-lg font-bold text-foreground" data-testid="text-page-title">
                {t('offlineMap')}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/home")}
              data-testid="button-back"
            >
              {t('back')}
              {isRTL ? <ArrowLeft className="w-4 h-4 mr-1" /> : <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <WifiOff className="w-4 h-4 text-green-700 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400" data-testid="text-offline-badge">
              {t('worksOffline')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-offline-desc">
            {t('offlineMapDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-4 overflow-visible">
              <div className="relative">
                <svg
                  viewBox="0 0 470 490"
                  className="w-full h-auto"
                  data-testid="svg-oman-map"
                  style={{ maxHeight: '70vh' }}
                >
                  <defs>
                    <filter id="shadow" x="-2%" y="-2%" width="104%" height="104%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#00000020" />
                    </filter>
                    <radialGradient id="sea" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="#e8f4f8" />
                      <stop offset="100%" stopColor="#d0e8f0" />
                    </radialGradient>
                  </defs>

                  <rect x="0" y="0" width="470" height="490" fill="url(#sea)" rx="8" />

                  <text x="430" y="30" fontSize="10" fill="#7faab8" fontWeight="500" textAnchor="end">
                    {language === 'ar' || language === 'fa' ? 'بحر عمان' : 'Sea of Oman'}
                  </text>
                  <text x="450" y="350" fontSize="10" fill="#7faab8" fontWeight="500" textAnchor="end">
                    {language === 'ar' || language === 'fa' ? 'بحر العرب' : 'Arabian Sea'}
                  </text>

                  {governorateRegions.map((gov) => {
                    const isSelected = selectedGovernorate === gov.id;
                    const isHovered = hoveredGovernorate === gov.id;
                    const count = getGovernorateAttractionCount(gov.id);
                    return (
                      <g key={gov.id}>
                        <path
                          d={gov.path}
                          fill={isSelected ? '#b45309' : isHovered ? '#d4a574' : gov.color}
                          stroke={isSelected ? '#92400e' : '#a08060'}
                          strokeWidth={isSelected ? 2.5 : 1}
                          opacity={isSelected ? 1 : isHovered ? 0.95 : 0.85}
                          className="cursor-pointer transition-all duration-200"
                          onClick={() => {
                            setSelectedGovernorate(gov.id === selectedGovernorate ? null : gov.id);
                            setSelectedAttraction(null);
                          }}
                          onMouseEnter={() => setHoveredGovernorate(gov.id)}
                          onMouseLeave={() => setHoveredGovernorate(null)}
                          filter="url(#shadow)"
                          data-testid={`region-${gov.id}`}
                        />
                        <text
                          x={gov.labelX}
                          y={gov.labelY}
                          fontSize={isSelected || isHovered ? 9 : 7.5}
                          fill={isSelected ? '#fff' : '#3d2b1f'}
                          fontWeight={isSelected ? 700 : 600}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="pointer-events-none select-none"
                          style={{ fontFamily: language === 'ar' || language === 'fa' ? 'Cairo, sans-serif' : 'Montserrat, sans-serif' }}
                        >
                          {getGovName(gov)}
                        </text>
                        {count > 0 && (
                          <g className="pointer-events-none">
                            <circle cx={gov.labelX + 20} cy={gov.labelY - 10} r="8" fill="#b45309" opacity="0.9" />
                            <text
                              x={gov.labelX + 20}
                              y={gov.labelY - 10}
                              fontSize="7"
                              fill="white"
                              fontWeight="700"
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              {count}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {attractionsWithCoords.map((attr) => {
                    const pos = latLngToSvg(attr.lat!, attr.lng!);
                    const isAttrSelected = selectedAttraction === attr.id;
                    return (
                      <g
                        key={attr.id}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAttraction(attr.id === selectedAttraction ? null : attr.id);
                          setSelectedGovernorate(attr.governorateId);
                        }}
                        data-testid={`marker-${attr.id}`}
                      >
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isAttrSelected ? 5 : 3}
                          fill={isAttrSelected ? '#dc2626' : '#b45309'}
                          stroke="white"
                          strokeWidth={1.5}
                          opacity={0.9}
                        />
                        {isAttrSelected && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="9"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="1"
                            opacity="0.5"
                          />
                        )}
                      </g>
                    );
                  })}

                  <text x="235" y="485" fontSize="8" fill="#999" textAnchor="middle">
                    {language === 'ar' || language === 'fa' ? 'سلطنة عمان - خريطة بدون إنترنت' : 'Sultanate of Oman - Offline Map'}
                  </text>
                </svg>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            {selectedAttr ? (
              <Card className="p-4" data-testid="panel-attraction-detail">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <h3 className="font-bold text-lg text-foreground" data-testid="text-selected-attraction-name">
                    {getAttrName(selectedAttr)}
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedAttraction(null)}
                    data-testid="button-close-attraction"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="rounded-lg overflow-hidden mb-3">
                  <img
                    src={selectedAttr.image}
                    alt={getAttrName(selectedAttr)}
                    className="w-full h-40 object-cover"
                    data-testid="img-attraction"
                  />
                </div>

                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="secondary" data-testid="badge-governorate">
                    <MapPin className="w-3 h-3" />
                    <span className="mx-1">{selectedAttr.governorate}</span>
                  </Badge>
                  {selectedAttr.rating && (
                    <Badge variant="secondary" data-testid="badge-rating">
                      <Star className="w-3 h-3" />
                      <span className="mx-1">{selectedAttr.rating}</span>
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3 leading-relaxed" data-testid="text-attraction-desc">
                  {getAttrDesc(selectedAttr)}
                </p>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => setLocation(`/attractions/${selectedAttr.id}`)}
                    data-testid="button-view-details"
                  >
                    {t('viewDetails')}
                  </Button>
                  {selectedAttr.mapUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(selectedAttr.mapUrl!, '_blank')}
                      data-testid="button-open-google-maps"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className={isRTL ? 'mr-1' : 'ml-1'}>Google Maps</span>
                    </Button>
                  )}
                </div>
              </Card>
            ) : selectedGov ? (
              <Card className="p-4" data-testid="panel-governorate-detail">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <h3 className="font-bold text-lg text-foreground" data-testid="text-selected-gov-name">
                    {getGovName(selectedGov)}
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedGovernorate(null)}
                    data-testid="button-close-gov"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {filteredAttractions.length} {t('attractionsInGovernorate')}
                </p>
                <div className="space-y-2 max-h-[55vh] overflow-y-auto">
                  {filteredAttractions.map((attr) => (
                    <button
                      key={attr.id}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover-elevate text-start"
                      onClick={() => setSelectedAttraction(attr.id)}
                      data-testid={`list-attraction-${attr.id}`}
                    >
                      <img
                        src={attr.image}
                        alt={getAttrName(attr)}
                        className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{getAttrName(attr)}</p>
                        <p className="text-xs text-muted-foreground truncate">{attr.wilayat}</p>
                        {attr.rating && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs text-muted-foreground">{attr.rating}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-4" data-testid="panel-instructions">
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2" data-testid="text-instructions-title">
                    {t('offlineMapInstructions')}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('offlineMapInstructionsDesc')}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">{t('governoratesLabel')}</h4>
                  {governorateRegions.map((gov) => {
                    const count = getGovernorateAttractionCount(gov.id);
                    return (
                      <button
                        key={gov.id}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover-elevate"
                        onClick={() => {
                          setSelectedGovernorate(gov.id);
                          setSelectedAttraction(null);
                        }}
                        data-testid={`list-gov-${gov.id}`}
                      >
                        <span className="font-medium text-sm text-foreground">{getGovName(gov)}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
