import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, MapPin, Gem, Star, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

import finsBeachImg from "@/assets/fins-beach.png";
import jabalSamhanImg from "@/assets/jabal-samhan.png";
import biladSaytImg from "@/assets/bilad-sayt.png";
import zakaitLakeImg from "@/assets/zakait-lake.png";
import wadiJiziDamImg from "@/assets/wadi-jizi-dam.png";
import hajirLakeImg from "@/assets/hajir-lake.png";

interface HiddenGem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  location: string;
  locationEn: string;
  governorate: string;
  governorateEn: string;
  image: string;
  rating: number;
  mapUrl?: string;
}

const hiddenGems: HiddenGem[] = [
  {
    id: "1",
    name: "قرية بلد سيت",
    nameEn: "Bilad Sayt Village",
    description: "قرية جبلية تقليدية معزولة تقع في أعالي جبال الحجر. تتميز بمدرجاتها الزراعية الخضراء وبيوتها الحجرية القديمة والهواء النقي.",
    descriptionEn: "An isolated traditional mountain village in the Hajar Mountains. Known for its green agricultural terraces, old stone houses, and fresh air.",
    location: "ولاية الحمراء",
    locationEn: "Al Hamra",
    governorate: "dakhiliyah",
    governorateEn: "Dakhiliyah",
    image: biladSaytImg,
    rating: 4.9,
    mapUrl: "https://maps.app.goo.gl/YnskwhUiTqFWzyLY9"
  },
  {
    id: "2",
    name: "شاطئ فنس",
    nameEn: "Fins Beach",
    description: "شاطئ رملي أبيض هادئ يقع بين مسقط وصور. مياهه الصافية ورماله الناعمة تجعله ملاذاً مثالياً للهروب من صخب المدينة.",
    descriptionEn: "A quiet white sandy beach between Muscat and Sur. Its clear waters and soft sand make it a perfect escape from city life.",
    location: "ولاية قريات",
    locationEn: "Quriyat",
    governorate: "sharqiyah",
    governorateEn: "South Sharqiyah",
    image: finsBeachImg,
    rating: 4.7,
    mapUrl: "https://maps.app.goo.gl/nCfxh94LsUvPDH3v9"
  },
  {
    id: "4",
    name: "جبل سمحان",
    nameEn: "Jabal Samhan",
    description: "محمية طبيعية في ظفار تضم النمر العربي النادر. تتميز بمناظرها الخلابة من على ارتفاع 2000 متر فوق سطح البحر.",
    descriptionEn: "A nature reserve in Dhofar home to the rare Arabian leopard. Features breathtaking views from 2000 meters above sea level.",
    location: "ولاية مرباط",
    locationEn: "Mirbat",
    governorate: "dhofar",
    governorateEn: "Dhofar",
    image: jabalSamhanImg,
    rating: 4.8,
    mapUrl: "https://maps.app.goo.gl/fJMtvythxoefsD6dA"
  },
  {
    id: "5",
    name: "بحيرة زكت المخفية",
    nameEn: "Zakait Hidden Lake",
    description: "بحيرة مخفية من اكتشاف فريق شومة تقع في ولاية المضيبي",
    descriptionEn: "A hidden lake discovered by the Shouma team, located in Al Mudaybi.",
    location: "ولاية المضيبي",
    locationEn: "Al Mudaybi",
    governorate: "sharqiyah",
    governorateEn: "North Sharqiyah",
    image: zakaitLakeImg,
    rating: 4.8,
    mapUrl: "https://maps.app.goo.gl/egCd5Bw7Ln1uuehA9?g_st=ic"
  },
  {
    id: "6",
    name: "سد وادي الجزي",
    nameEn: "Wadi Al Jizi Dam",
    description: "سد وادي الجزي بحيرة جميلة في ولاية صحار، لا توجد العديد من الخدمات القريبة والطريق غير معبد للوصول إلى البحيرة",
    descriptionEn: "Wadi Al Jizi Dam is a beautiful lake in Sohar. There are few nearby services and the road is unpaved to reach the lake.",
    location: "ولاية صحار",
    locationEn: "Sohar",
    governorate: "batinah",
    governorateEn: "North Batinah",
    image: wadiJiziDamImg,
    rating: 4.5,
    mapUrl: "https://maps.app.goo.gl/UyXdEPKBLDkNqogr5?g_st=ic"
  },
  {
    id: "7",
    name: "بحيرة الهجير",
    nameEn: "Al Hajir Lake",
    description: "تقع بحيرة (برك) الهجير ضمن مسار وادي الهجير في ولاية العوابي بسلطنة عُمان، وهي منطقة مغامرات صعبة تمتد لـ 6 كم وتستغرق حوالي 8 ساعات للمسير. وتتميز بوجود برك مائية عديدة، ويُنصح بزيارتها في فصل الصيف نظراً لبرودة مياهها. تشمل مغامرة الوادي 4 نزلات (نزول) يبلغ طول أطولها 40 متراً",
    descriptionEn: "Al Hajir Lake (pools) is located along the Wadi Al Hajir trail in Al Awabi, Oman. It's a challenging adventure area spanning 6 km, taking about 8 hours to hike. Known for its numerous water pools, it's best visited in summer due to the cold water. The adventure includes 4 descents, with the longest being 40 meters.",
    location: "ولاية العوابي",
    locationEn: "Al Awabi",
    governorate: "batinah",
    governorateEn: "South Batinah",
    image: hajirLakeImg,
    rating: 4.9,
    mapUrl: "https://maps.app.goo.gl/YKNnjvEEWMbGsnAWA"
  }
];

export default function HiddenGemsPage() {
  const [, setLocation] = useLocation();
  const { t, language, isRTL } = useLanguage();

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const getLocalizedText = (ar: string, en: string) => {
    if (language === 'ar' || language === 'fa') return ar;
    return en;
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/home")}
              className="gap-2"
              data-testid="button-back"
            >
              <BackArrow className="w-4 h-4" />
              {t('back')}
            </Button>
            <h1 className="text-xl font-bold text-foreground">{t('hiddenGems')}</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Gem className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('discoverHiddenGems')}</h2>
          <p className="text-muted-foreground">{t('hiddenGemsDesc')}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hiddenGems.map((gem) => (
            <Card 
              key={gem.id} 
              className="overflow-hidden hover-elevate"
              data-testid={`card-hidden-gem-${gem.id}`}
            >
              {gem.image ? (
                <div 
                  className="aspect-video bg-cover bg-center"
                  style={{ backgroundImage: `url('${gem.image}')` }}
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-rose-600/80 to-rose-800/90 flex items-center justify-center">
                  <Gem className="w-16 h-16 text-white/80" />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {getLocalizedText(gem.name, gem.nameEn)}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{getLocalizedText(gem.location, gem.locationEn)}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{gem.rating}</span>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                  {getLocalizedText(gem.description, gem.descriptionEn)}
                </p>
                {gem.mapUrl && (
                  <a
                    href={gem.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                    data-testid={`link-map-${gem.id}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('viewOnMap')}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
