import { useState, useCallback, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { governorates as allGovernorates } from "@shared/schema";
import { attractions as clientAttractions } from "@/lib/attractions";
import { hotels as clientHotels } from "@/lib/hotels";
import { restaurants as clientRestaurants } from "@/lib/restaurants";
import { activities as clientActivities } from "@/lib/activities";
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
  Save,
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

const dayTitleTranslations: Record<string, Record<string, string>> = {
  "استكشاف مسقط": { en: "Exploring Muscat", fr: "Explorer Mascate", es: "Explorando Mascate", tr: "Maskat'ı Keşfetmek", zh: "探索马斯喀特", ja: "マスカット探索" },
  "جمال العاصمة": { en: "Beauty of the Capital", fr: "Beauté de la Capitale", es: "Belleza de la Capital", tr: "Başkentin Güzelliği", zh: "首都之美", ja: "首都の美" },
  "يوم في مسقط": { en: "A Day in Muscat", fr: "Une Journée à Mascate", es: "Un Día en Mascate", tr: "Maskat'ta Bir Gün", zh: "马斯喀特的一天", ja: "マスカットでの一日" },
  "تراث الداخلية": { en: "Heritage of Ad Dakhiliyah", fr: "Patrimoine d'Ad Dakhiliyah", es: "Patrimonio de Ad Dakhiliyah", tr: "Ad Dakhiliyah Mirası", zh: "内政部遗产", ja: "ダヒリヤの遺産" },
  "قلاع ووديان": { en: "Forts and Wadis", fr: "Forts et Wadis", es: "Fuertes y Wadis", tr: "Kaleler ve Vadiler", zh: "城堡与山谷", ja: "砦とワディ" },
  "يوم في نزوى": { en: "A Day in Nizwa", fr: "Une Journée à Nizwa", es: "Un Día en Nizwa", tr: "Nizwa'da Bir Gün", zh: "尼兹瓦的一天", ja: "ニズワでの一日" },
  "سحر ظفار": { en: "Charm of Dhofar", fr: "Charme du Dhofar", es: "Encanto de Dhofar", tr: "Dhofar Cazibesi", zh: "佐法尔的魅力", ja: "ドファールの魅力" },
  "خريف صلالة": { en: "Salalah Khareef Season", fr: "Saison de Khareef Salalah", es: "Temporada de Khareef Salalah", tr: "Salalah Khareef Sezonu", zh: "塞拉莱秋天季", ja: "サラーラのハリーフ" },
  "طبيعة ظفار": { en: "Nature of Dhofar", fr: "Nature du Dhofar", es: "Naturaleza de Dhofar", tr: "Dhofar Doğası", zh: "佐法尔的自然", ja: "ドファールの自然" },
  "جمال مسندم": { en: "Beauty of Musandam", fr: "Beauté de Musandam", es: "Belleza de Musandam", tr: "Musandam Güzelliği", zh: "穆桑代姆之美", ja: "ムサンダムの美" },
  "أفيورد العرب": { en: "Fjord of the Arabs", fr: "Fjord des Arabes", es: "Fiordo de los Árabes", tr: "Arapların Fiyordu", zh: "阿拉伯的峡湾", ja: "アラビアのフィヨルド" },
  "بحر مسندم": { en: "Sea of Musandam", fr: "Mer de Musandam", es: "Mar de Musandam", tr: "Musandam Denizi", zh: "穆桑代姆之海", ja: "ムサンダムの海" },
  "ساحل الباطنة": { en: "Al Batinah Coast", fr: "Côte d'Al Batinah", es: "Costa de Al Batinah", tr: "Al Batinah Sahili", zh: "巴提奈海岸", ja: "バティナ海岸" },
  "تاريخ صحار": { en: "History of Sohar", fr: "Histoire de Sohar", es: "Historia de Sohar", tr: "Sohar Tarihi", zh: "苏哈尔历史", ja: "ソハールの歴史" },
  "وديان جنوب الباطنة": { en: "Wadis of South Al Batinah", fr: "Wadis du Sud d'Al Batinah", es: "Wadis de Al Batinah Sur", tr: "Güney Al Batinah Vadileri", zh: "南巴提奈山谷", ja: "南バティナのワディ" },
  "ينابيع وطبيعة": { en: "Springs and Nature", fr: "Sources et Nature", es: "Manantiales y Naturaleza", tr: "Pınarlar ve Doğa", zh: "温泉与自然", ja: "温泉と自然" },
  "صحراء الشرقية": { en: "Ash Sharqiyah Desert", fr: "Désert d'Ash Sharqiyah", es: "Desierto de Ash Sharqiyah", tr: "Ash Sharqiyah Çölü", zh: "东部沙漠", ja: "シャルキーヤ沙漠" },
  "رمال وهيبة": { en: "Wahiba Sands", fr: "Wahiba Sands", es: "Wahiba Sands", tr: "Wahiba Sands", zh: "瓦希巴沙丘", ja: "ワヒバ沙漠" },
  "سواحل الشرقية": { en: "Ash Sharqiyah Coasts", fr: "Côtes d'Ash Sharqiyah", es: "Costas de Ash Sharqiyah", tr: "Ash Sharqiyah Sahilleri", zh: "东部海岸", ja: "シャルキーヤ海岸" },
  "وديان وأودية": { en: "Valleys and Wadis", fr: "Vallées et Wadis", es: "Valles y Wadis", tr: "Vadiler ve Kanyonlar", zh: "山谷与峡谷", ja: "渓谷とワディ" },
  "تراث البريمي": { en: "Heritage of Al Buraimi", fr: "Patrimoine d'Al Buraimi", es: "Patrimonio de Al Buraimi", tr: "Al Buraimi Mirası", zh: "布赖米遗产", ja: "ブライミの遺産" },
  "يوم في البريمي": { en: "A Day in Al Buraimi", fr: "Une Journée à Al Buraimi", es: "Un Día en Al Buraimi", tr: "Al Buraimi'de Bir Gün", zh: "布赖米的一天", ja: "ブライミでの一日" },
  "تراث الظاهرة": { en: "Heritage of Ad Dhahirah", fr: "Patrimoine d'Ad Dhahirah", es: "Patrimonio de Ad Dhahirah", tr: "Ad Dhahirah Mirası", zh: "扎希拉遗产", ja: "ザヒラの遺産" },
  "يوم في عبري": { en: "A Day in Ibri", fr: "Une Journée à Ibri", es: "Un Día en Ibri", tr: "Ibri'de Bir Gün", zh: "伊卜里的一天", ja: "イブリでの一日" },
  "طبيعة الوسطى": { en: "Nature of Al Wusta", fr: "Nature d'Al Wusta", es: "Naturaleza de Al Wusta", tr: "Al Wusta Doğası", zh: "中部自然", ja: "ウスタの自然" },
  "جزيرة مصيرة": { en: "Masirah Island", fr: "Île de Masirah", es: "Isla de Masirah", tr: "Masirah Adası", zh: "马西拉岛", ja: "マシーラ島" },
  "الوصول والاستكشاف": { en: "Arrival and Exploration", fr: "Arrivée et Exploration", es: "Llegada y Exploración", tr: "Varış ve Keşif", zh: "抵达与探索", ja: "到着と探索" },
  "يوم المعالم التاريخية": { en: "Historic Landmarks Day", fr: "Journée des Monuments Historiques", es: "Día de Monumentos Históricos", tr: "Tarihi Eserler Günü", zh: "历史遗迹之日", ja: "歴史的ランドマークの日" },
  "مغامرة في الطبيعة": { en: "Nature Adventure", fr: "Aventure en Nature", es: "Aventura en la Naturaleza", tr: "Doğa Macerası", zh: "自然冒险", ja: "自然のアドベンチャー" },
  "التسوق والترفيه": { en: "Shopping and Entertainment", fr: "Shopping et Divertissement", es: "Compras y Entretenimiento", tr: "Alışveriş ve Eğlence", zh: "购物与娱乐", ja: "ショッピングと娯楽" },
  "الثقافة والفنون": { en: "Culture and Arts", fr: "Culture et Arts", es: "Cultura y Artes", tr: "Kültür ve Sanat", zh: "文化与艺术", ja: "文化と芸術" },
  "الاسترخاء والتجديد": { en: "Relaxation and Rejuvenation", fr: "Relaxation et Ressourcement", es: "Relajación y Rejuvenecimiento", tr: "Rahatlama ve Yenilenme", zh: "放松与恢复", ja: "リラクゼーションとリフレッシュ" },
  "الوداع والمغادرة": { en: "Farewell and Departure", fr: "Adieu et Départ", es: "Despedida y Salida", tr: "Veda ve Ayrılış", zh: "告别与离境", ja: "別れと出発" },
};

const attractionTranslations: Record<string, Record<string, string>> = {
  "1": { en: "Al Qurum Beach", fr: "Plage d'Al Qurum", es: "Playa de Al Qurum", tr: "Al Qurum Plajı", zh: "古鲁姆海滩", ja: "クルムビーチ" },
  "2": { en: "Mutrah Souq", fr: "Souk de Mutrah", es: "Zoco de Mutrah", tr: "Mutrah Çarşısı", zh: "马特拉集市", ja: "マトラスーク" },
  "3": { en: "Wadi Al Khoud", fr: "Wadi Al Khoud", es: "Wadi Al Khoud", tr: "Wadi Al Khoud", zh: "阿尔胡德山谷", ja: "ワディ・アル・ホウド" },
  "4": { en: "Al Qurum Natural Park", fr: "Parc Naturel d'Al Qurum", es: "Parque Natural de Al Qurum", tr: "Al Qurum Doğal Parkı", zh: "古鲁姆自然公园", ja: "クルム自然公園" },
  "5": { en: "Mutrah Fort", fr: "Fort de Mutrah", es: "Fuerte de Mutrah", tr: "Mutrah Kalesi", zh: "马特拉城堡", ja: "マトラフォート" },
  "1034": { en: "Royal Opera House", fr: "Opéra Royal", es: "Ópera Real", tr: "Kraliyet Opera Binası", zh: "皇家歌剧院", ja: "ロイヤルオペラハウス" },
  "1032": { en: "Bousher Heights Park", fr: "Parc des Hauteurs de Bousher", es: "Parque Alturas de Bousher", tr: "Bousher Tepeleri Parkı", zh: "布歇高地公园", ja: "ブッシャーハイツ公園" },
  "1033": { en: "Palm Garden", fr: "Jardin des Palmiers", es: "Jardín de Palmeras", tr: "Palmiye Bahçesi", zh: "棕榈园", ja: "パームガーデン" },
  "1037": { en: "Muscat Grand Mall", fr: "Muscat Grand Mall", es: "Muscat Grand Mall", tr: "Muscat Grand Mall", zh: "马斯喀特大商场", ja: "マスカットグランドモール" },
  "6": { en: "Jebel Akhdar", fr: "Jebel Akhdar", es: "Jebel Akhdar", tr: "Jebel Akhdar", zh: "绿山", ja: "ジェベル・アフダル" },
  "7": { en: "Nizwa Fort", fr: "Fort de Nizwa", es: "Fuerte de Nizwa", tr: "Nizwa Kalesi", zh: "Nizwa城堡", ja: "ニズワフォート" },
  "8": { en: "Wadi Al Ghul", fr: "Wadi Al Ghul", es: "Wadi Al Ghul", tr: "Wadi Al Ghul", zh: "古尔山谷", ja: "ワディ・アル・グール" },
  "9": { en: "Nizwa Traditional Souq", fr: "Souk Traditionnel de Nizwa", es: "Zoco Tradicional de Nizwa", tr: "Nizwa Geleneksel Çarşısı", zh: "尼兹瓦传统集市", ja: "ニズワ伝統スーク" },
  "10": { en: "Falaj Daris Park", fr: "Parc de Falaj Daris", es: "Parque de Falaj Daris", tr: "Falaj Daris Parkı", zh: "法拉杰达里斯公园", ja: "ファラジ・ダリス公園" },
  "34": { en: "Misfat Al Abriyyin", fr: "Misfat Al Abriyyin", es: "Misfat Al Abriyyin", tr: "Misfat Al Abriyyin", zh: "米斯法特阿布里因", ja: "ミスファット・アル・アブリーン" },
  "35": { en: "Jebel Shams", fr: "Jebel Shams", es: "Jebel Shams", tr: "Jebel Shams", zh: "太阳山", ja: "ジェベル・シャムス" },
  "36": { en: "Wadi Bani Khalid", fr: "Wadi Bani Khalid", es: "Wadi Bani Khalid", tr: "Wadi Bani Khalid", zh: "巴尼哈立德山谷", ja: "ワディ・バニ・ハリード" },
  "37": { en: "Wadi Shab", fr: "Wadi Shab", es: "Wadi Shab", tr: "Wadi Shab", zh: "沙布山谷", ja: "ワディ・シャブ" },
  "39": { en: "Ras Al Hadd (Turtle Reserve)", fr: "Ras Al Hadd (Réserve de Tortues)", es: "Ras Al Hadd (Reserva de Tortugas)", tr: "Ras Al Hadd (Kaplumbağa Koruma Alanı)", zh: "哈德角（海龟保护区）", ja: "ラス・アル・ハド（ウミガメ保護区）" },
  "40": { en: "Sur Castle", fr: "Château de Sur", es: "Castillo de Sur", tr: "Sur Kalesi", zh: "苏尔城堡", ja: "スール城" },
  "43": { en: "Wahiba Sands", fr: "Désert de Wahiba", es: "Desierto de Wahiba", tr: "Wahiba Çölü", zh: "瓦希巴沙丘", ja: "ワヒバ砂漠" },
  "44": { en: "Wadi Bani Awf", fr: "Wadi Bani Awf", es: "Wadi Bani Awf", tr: "Wadi Bani Awf", zh: "巴尼亚夫山谷", ja: "ワディ・バニ・アウフ" },
  "45": { en: "Jabreen Castle", fr: "Château de Jabreen", es: "Castillo de Jabreen", tr: "Jabreen Kalesi", zh: "贾布林城堡", ja: "ジャبリーン城" },
  "14": { en: "Sohar Fort", fr: "Fort de Sohar", es: "Fuerte de Sohar", tr: "Sohar Kalesi", zh: "苏哈尔城堡", ja: "ソハールフォート" },
  "13": { en: "Ain Al Kasfa", fr: "Ain Al Kasfa", es: "Ain Al Kasfa", tr: "Ain Al Kasfa", zh: "卡斯法温泉", ja: "アイン・アル・カスファ" },
  "15": { en: "Al Buraimi Coast", fr: "Côte d'Al Buraimi", es: "Costa de Al Buraimi", tr: "Al Buraimi Sahili", zh: "布赖米海岸", ja: "布赖米海岸" },
  "16": { en: "Al Khandaq Fort", fr: "Fort d'Al Khandaq", es: "Fuerte de Al Khandaq", tr: "Al Khandaq Kalesi", zh: "汉达克城堡", ja: "ハンダクフォート" },
  "19": { en: "Ayn Razat", fr: "Ayn Razat", es: "Ayn Razat", tr: "Ayn Razat", zh: "拉扎特泉", ja: "アイン・ラザット" },
  "20": { en: "Marneef Cave", fr: "Grotte de Marneef", es: "Cueva de Marneef", tr: "Marneef Mağarası", zh: "马尔尼夫洞穴", ja: "マルニーف洞窟" },
  "22": { en: "Wadi Darbat Waterfalls", fr: "Cascades de Wadi Darbat", es: "Cascadas de Wadi Darbat", tr: "Wadi Darbat Şelaleleri", zh: "达尔巴特山谷瀑布", ja: "ワディ・ダルバートの滝" },
  "24": { en: "Wadi Dawkah (Frankincense Land)", fr: "Wadi Dawkah (Terre de l'Encens)", es: "Wadi Dawkah (Tierra del Incienso)", tr: "Wadi Dawkah (Günlük Ağacı Diyarı)", zh: "道卡山谷（乳香之地）", ja: "ワディ・ダウカ（乳香の地）" },
  "25": { en: "Al Mughsail Beach", fr: "Plage d'Al Mughsail", es: "Playa de Al Mughsail", tr: "Al Mughsail Plajı", zh: "穆格赛尔海滩", ja: "マグセイルビーチ" }
};

const hotelTranslations: Record<string, Record<string, string>> = {
  "1": { en: "Six Senses Zighy Bay", fr: "Six Senses Zighy Bay", es: "Six Senses Zighy Bay", tr: "Six Senses Zighy Bay", zh: "第六感杰格希湾", ja: "シックスセンシズ ジギーベイ" },
  "2": { en: "Thousand Nights Camp", fr: "Camp des Mille et Une Nuits", es: "Campamento de las Mil y Una Noches", tr: "Binbir Gece Kampı", zh: "一千零一夜营地", ja: "サウザンドナイツキャンプ" },
  "3": { en: "Dana Beach Resort", fr: "Dana Beach Resort", es: "Dana Beach Resort", tr: "Dana Beach Resort", zh: "达纳海滩度假村", ja: "ダナビーチリゾート" },
  "4": { en: "Al Nebras Hotel", fr: "Hôtel Al Nebras", es: "Hotel Al Nebras", tr: "Al Nebras Otel", zh: "阿尔内布拉斯酒店", ja: "アルネブラスホテル" },
  "5": { en: "Avani Muscat Hotel", fr: "Hôtel Avani Muscat", es: "Hotel Avani Muscat", tr: "Avani Muscat Otel", zh: "阿瓦尼马斯喀特酒店", ja: "アバニマスカットホテル" },
  "6": { en: "Ihya Lodge", fr: "Ihya Lodge", es: "Ihya Lodge", tr: "Ihya Lodge", zh: "伊亚旅馆", ja: "イヒヤロッジ" },
  "7": { en: "Crowne Plaza Duqm", fr: "Crowne Plaza Duqm", es: "Crowne Plaza Duqm", tr: "Crowne Plaza Duqm", zh: "杜库姆皇冠假日酒店", ja: "クラウンプラザ ドゥクム" },
  "8": { en: "Alsalam Grand Resort", fr: "Alsalam Grand Resort", es: "Alsalam Grand Resort", tr: "Alsalam Grand Resort", zh: "阿萨拉姆大度假村", ja: "アルサرامグランドリゾート" }
};

const getLocalizedItem = (itemId: string | undefined, type: string) => {
  if (!itemId) return null;
  if (type === "attraction") {
    return clientAttractions.find(a => a.id === itemId);
  }
  if (type === "hotel") {
    return clientHotels.find(h => h.id === itemId);
  }
  if (type === "restaurant") {
    return clientRestaurants.find(r => r.id === itemId);
  }
  if (type === "activity") {
    return clientActivities.find(a => a.id === itemId);
  }
  return null;
};

const getLocalizedNameByArabicName = (nameAr: string, lang: string) => {
  if (lang === "ar" || lang === "fa") return nameAr;
  const cleanName = nameAr.trim();
  for (const [id, value] of Object.entries(attractionTranslations)) {
    const attraction = clientAttractions.find(a => a.id === id);
    if (attraction && (attraction.nameAr === cleanName || attraction.name === cleanName)) {
      return value[lang] || value["en"] || cleanName;
    }
  }
  for (const [id, value] of Object.entries(hotelTranslations)) {
    const hotel = clientHotels.find(h => h.id === id);
    if (hotel && (hotel.nameAr === cleanName || hotel.name === cleanName)) {
      return value[lang] || value["en"] || cleanName;
    }
  }
  const restaurant = clientRestaurants.find(r => r.nameAr === cleanName || r.name === cleanName);
  if (restaurant) {
    return restaurant.name || cleanName;
  }
  const activity = clientActivities.find(a => a.nameAr === cleanName || a.name === cleanName);
  if (activity) {
    return activity.name || cleanName;
  }
  return cleanName;
};

const getLocalizedItemName = (itemId: string | undefined, type: string, lang: string, defaultName: string) => {
  if (!itemId) return defaultName;
  if (lang === "ar" || lang === "fa") {
    const clientItem = getLocalizedItem(itemId, type);
    return clientItem ? (clientItem.nameAr || clientItem.name) : defaultName;
  }
  if (type === "attraction" && attractionTranslations[itemId]) {
    return attractionTranslations[itemId][lang] || attractionTranslations[itemId]["en"] || defaultName;
  }
  if (type === "hotel" && hotelTranslations[itemId]) {
    return hotelTranslations[itemId][lang] || hotelTranslations[itemId]["en"] || defaultName;
  }
  const clientItem = getLocalizedItem(itemId, type);
  if (clientItem) {
    if (type === "restaurant") {
      return clientItem.name || defaultName;
    }
    if (type === "activity") {
      return clientItem.name || defaultName;
    }
  }
  return defaultName;
};

const getLocalizedRegionName = (regionAr: string, lang: string) => {
  const clean = regionAr.trim();
  const regions: Record<string, Record<string, string>> = {
    "محافظة مسقط": { en: "Muscat Governorate", fr: "Gouvernorat de Mascate", es: "Gobernación de Mascate", tr: "Maskat Valiliği", zh: "马斯喀特省", ja: "マスカット県" },
    "محافظة الداخلية": { en: "Ad Dakhiliyah Governorate", fr: "Gouvernorat d'Ad Dakhiliyah", es: "Gobernación de Ad Dakhiliyah", tr: "Ad Dakhiliyah Valiliği", zh: "内政省", ja: "ダヒリヤ県" },
    "محافظة الوسطى": { en: "Al Wusta Governorate", fr: "Gouvernorat d'Al Wusta", es: "Gobernación de Al Wusta", tr: "Al Wusta Valiliği", zh: "中部省", ja: "ウスタ県" },
    "محافظة ظفار": { en: "Dhofar Governorate", fr: "Gouvernorat du Dhofar", es: "Gobernación de Dhofar", tr: "Dhofar Valiliği", zh: "佐法尔省", ja: "ドファール県" },
    "محافظة شمال الباطنة": { en: "North Al Batinah Governorate", fr: "Gouvernorat d'Al Batinah Nord", es: "Gobernación de Al Batinah Norte", tr: "Kuzey Al Batinah Valiliği", zh: "北巴提奈省", ja: "北バティナ県" },
    "محافظة جنوب الباطنة": { en: "South Al Batinah Governorate", fr: "Gouvernorat d'Al Batinah Sud", es: "Gobernación de Al Batinah Sur", tr: "Güney Al Batinah Valiliği", zh: "南巴提奈省", ja: "南バティナ県" },
    "محافظة شمال الشرقية": { en: "North Ash Sharqiyah Governorate", fr: "Gouvernorat d'Ash Sharqiyah Nord", es: "Gobernación de Ash Sharqiyah Norte", tr: "Kuzey Ash Sharqiyah Valiliği", zh: "北 الشرقية 省", ja: "北シャルキーヤ県" },
    "محافظة جنوب الشرقية": { en: "South Ash Sharqiyah Governorate", fr: "Gouvernorat d'Ash Sharqiyah Sud", es: "Gobernación de Ash Sharqiyah Sur", tr: "Güney Ash Sharqiyah Valiliği", zh: "南 الشرقية 省", ja: "南シャルキーヤ県" },
    "محافظة الظاهرة": { en: "Ad Dhahirah Governorate", fr: "Gouvernorat d'Ad Dhahirah", es: "Gobernación de Ad Dhahirah", tr: "Ad Dhahirah Valiliği", zh: "扎希拉省", ja: "ザヒラ県" },
    "محافظة مسندم": { en: "Musandam Governorate", fr: "Gouvernorat de Musandam", es: "Gobernación de Musandam", tr: "Musandam Valiliği", zh: "穆桑代姆省", ja: "موسندم県" },
    "محافظة البريمي": { en: "Al Buraimi Governorate", fr: "Gouvernorat d'Al Buraimi", es: "Gobernación de Al Buraimi", tr: "Al Buraimi Valiliği", zh: "布赖米省", ja: "ブライミ県" },
    "ولاية دبا": { en: "Dibba Wilayat", fr: "Wilayat de Dibba", es: "Wilayat de Dibba", tr: "Dibba Bölgesi", zh: "迪巴州", ja: "ディバ" },
    "ولاية الرستاق": { en: "Rustaq Wilayat", fr: "Wilayat de Rustaq", es: "Wilayat de Rustaq", tr: "Rustaq Bölgesi", zh: "鲁斯塔克州", ja: "ルスタク" },
    "ولاية السيب": { en: "Seeb Wilayat", fr: "Wilayat de Seeb", es: "Wilayat de Seeb", tr: "Seeb Bölgesi", zh: "塞卜州", ja: "シーブ" },
    "ولاية البريمي": { en: "Al Buraimi Wilayat", fr: "Wilayat d'Al Buraimi", es: "Wilayat d'Al Buraimi", tr: "Al Buraimi Bölgesi", zh: "布赖米州", ja: "ブライミ" }
  };
  return regions[clean]?.[lang] || null;
};

const getLocalizedActivityName = (activity: ItineraryActivity, lang: string) => {
  if (lang === "ar" || lang === "fa") {
    return activity.activity;
  }
  const text = activity.activity;
  if (text === "إفطار في الفندق" || text.includes("إفطار")) {
    const bMap: Record<string, string> = { en: "Breakfast at the Hotel", fr: "Petit-déjeuner à l'hôtel", es: "Desayuno en el hotel", tr: "Otelde Kahvaltı", zh: "在酒店享用早餐", ja: "ホテルでの朝食" };
    return bMap[lang] || "Breakfast at the Hotel";
  }
  if (text === "غداء") {
    const lMap: Record<string, string> = { en: "Lunch", fr: "Déjeuner", es: "Almuerzo", tr: "Öğle Yemeği", zh: "午餐", ja: "ランチ" };
    return lMap[lang] || "Lunch";
  }
  if (text === "عشاء") {
    const dMap: Record<string, string> = { en: "Dinner", fr: "Dîner", es: "Cena", tr: "Akşam Yemeği", zh: "晚餐", ja: "ディナー" };
    return dMap[lang] || "Dinner";
  }
  if (text === "العودة للفندق" || text.includes("العودة")) {
    const rMap: Record<string, string> = { en: "Return to the Hotel", fr: "Retour à l'hôtel", es: "Regreso al hotel", tr: "Otele Dönüş", zh: "返回酒店", ja: "ホテルへ戻る" };
    return rMap[lang] || "Return to the Hotel";
  }
  const clientItem = getLocalizedItem(activity.itemId, activity.type);
  if (clientItem) {
    let nameEn = clientItem.name;
    const localizedItemName = getLocalizedItemName(activity.itemId, activity.type, lang, nameEn || clientItem.nameAr || clientItem.name || "");
    if (text.startsWith("زيارة ")) {
      const vMap: Record<string, string> = { en: "Visit", fr: "Visite de", es: "Visita a", tr: "Ziyaret:", zh: "游览", ja: "訪問:" };
      const prefix = vMap[lang] || "Visit";
      return `${prefix} ${localizedItemName}`;
    }
    if (text.startsWith("استكشاف ")) {
      const eMap: Record<string, string> = { en: "Explore", fr: "Explorer", es: "Explorar", tr: "Keşfet:", zh: "探索", ja: "探索:" };
      const prefix = eMap[lang] || "Explore";
      return `${prefix} ${localizedItemName}`;
    }
    return localizedItemName;
  }
  return activity.activity;
};

const getLocalizedLocation = (activity: ItineraryActivity, lang: string) => {
  if (lang === "ar" || lang === "fa") {
    return activity.location;
  }
  const mapped = getLocalizedRegionName(activity.location, lang);
  if (mapped) return mapped;
  if (activity.location.includes("،")) {
    const parts = activity.location.split("،").map(p => p.trim());
    const localizedParts = parts.map(p => getLocalizedRegionName(p, lang) || getLocalizedNameByArabicName(p, lang) || p);
    return localizedParts.join(", ");
  }
  return getLocalizedNameByArabicName(activity.location, lang) || activity.location;
};

const getLocalizedDescription = (activity: ItineraryActivity, lang: string) => {
  if (lang === "ar" || lang === "fa") {
    return activity.description || "";
  }
  const desc = activity.description || "";
  if (desc.includes("كم من الفندق")) {
    const match = desc.match(/(\d+)\s*كم من الفندق/);
    if (match) {
      const km = match[1];
      const translations: Record<string, string> = {
        en: `${km} km from the hotel`,
        fr: `${km} km de l'hôtel`,
        es: `${km} km del hotel`,
        tr: `Otelden ${km} km`,
        zh: `距酒店 ${km} 公里`,
        ja: `ホテルから ${km} km`
      };
      return translations[lang] || `${km} km from the hotel`;
    }
  }
  if (desc.includes("نشاط مميز")) {
    const match = desc.match(/(\d+)\s*كم/);
    if (match) {
      const km = match[1];
      const translations: Record<string, string> = {
        en: `Special activity - ${km} km`,
        fr: `Activité spéciale - ${km} km`,
        es: `Actividad especial - ${km} km`,
        tr: `Özel aktivite - ${km} km`,
        zh: `特色活动 - ${km} 公里`,
        ja: `特別アクティビティ - ${km} km`
      };
      return translations[lang] || `Special activity - ${km} km`;
    }
  }
  if (desc.includes("دقيقة")) {
    const match = desc.match(/(\d+)\s*كم من\s+(.+?)\s*\(~(\d+)\s*دقيقة\)/);
    if (match) {
      const km = match[1];
      const oldNameAr = match[2];
      const mins = match[3];
      const localizedOldName = getLocalizedNameByArabicName(oldNameAr, lang);
      const translations: Record<string, string> = {
        en: `${km} km from ${localizedOldName} (~${mins} mins)`,
        fr: `${km} km de ${localizedOldName} (~${mins} min)`,
        es: `${km} km de ${localizedOldName} (~${mins} min)`,
        tr: `${localizedOldName} konumundan ${km} km (~${mins} dk)`,
        zh: `距 ${localizedOldName} ${km} 公里 (~${mins} 分钟)`,
        ja: `${localizedOldName} から ${km} km (~${mins} 分)`
      };
      return translations[lang] || `${km} km from ${localizedOldName} (~${mins} mins)`;
    }
  }
  if (desc.includes("كم من")) {
    const match = desc.match(/(\d+)\s*كم من\s+(.+)/);
    if (match) {
      const km = match[1];
      const oldNameAr = match[2];
      const localizedOldName = getLocalizedNameByArabicName(oldNameAr, lang);
      const translations: Record<string, string> = {
        en: `${km} km from ${localizedOldName}`,
        fr: `${km} km de ${localizedOldName}`,
        es: `${km} km de ${localizedOldName}`,
        tr: `${localizedOldName} konumundan ${km} km`,
        zh: `距 ${localizedOldName} ${km} 公里`,
        ja: `${localizedOldName} から ${km} km`
      };
      return translations[lang] || `${km} km from ${localizedOldName}`;
    }
  }
  const mappedRegion = getLocalizedRegionName(desc, lang);
  if (mappedRegion) {
    return mappedRegion;
  }
  const clientItem = getLocalizedItem(activity.itemId, activity.type);
  if (clientItem) {
    if (lang === 'fr') {
      return clientItem.descriptionFr || clientItem.descriptionEn || clientItem.description || desc;
    } else if (lang === 'tr') {
      return clientItem.descriptionTr || clientItem.descriptionEn || clientItem.description || desc;
    } else {
      return clientItem.descriptionEn || clientItem.description || desc;
    }
  }
  return desc;
};

const getLocalizedDayTitle = (title: string, lang: string) => {
  if (lang === "ar" || lang === "fa") return title;
  return dayTitleTranslations[title]?.[lang] || dayTitleTranslations[title]?.["en"] || title;
};

const itineraryPageTranslations: Record<string, Record<string, string>> = {
  saveSuccess: {
    ar: "تم الحفظ بنجاح",
    fa: "با موفقیت ذخیره شد",
    en: "Saved successfully",
    fr: "Enregistré avec succès",
    es: "Guardado con éxito",
    tr: "Başarıyla kaydedildi",
    zh: "保存成功",
    ja: "正常に保存されました"
  },
  saveSuccessDesc: {
    ar: 'تم حفظ الجدول "{title}" في الذاكرة بنجاح.',
    fa: 'برنامه "{title}" با موفقیت در حافظه ذخیره شد.',
    en: 'The itinerary "{title}" has been successfully saved to memory.',
    fr: 'L\'itinéraire "{title}" a été enregistré avec succès.',
    es: 'El itinerario "{title}" se ha guardado con éxito.',
    tr: '"{title}" seyahat planı başarıyla kaydedildi.',
    zh: '行程 "{title}" 已成功保存。',
    ja: '旅程 "{title}" が正常に保存されました。'
  },
  saveError: {
    ar: "خطأ في الحفظ",
    fa: "خطا در ذخیره‌سازی",
    en: "Error saving",
    fr: "Erreur d'enregistrement",
    es: "Error al guardar",
    tr: "Kaydetme hatası",
    zh: "保存错误",
    ja: "保存エラー"
  },
  saveErrorDesc: {
    ar: "تعذر حفظ الجدول.",
    fa: "ذخیره برنامه ممکن نشد.",
    en: "Could not save the itinerary.",
    fr: "Impossible d'enregistrer l'itinéraire.",
    es: "No se pudo guardar el itinerario.",
    tr: "Seyahat planı kaydedilemedi.",
    zh: "无法保存行程。",
    ja: "旅程を保存できませんでした。"
  },
  loadSuccess: {
    ar: "تم تحميل الجدول",
    fa: "برنامه بارگذاری شد",
    en: "Itinerary loaded",
    fr: "Itinéraire chargé",
    es: "Itinerario cargado",
    tr: "Program Yüklendi",
    zh: "行程已加载",
    ja: "旅程が読み込まれました"
  },
  loadSuccessDesc: {
    ar: 'تم عرض الجدول "{title}" بنجاح.',
    fa: 'برنامه "{title}" با موفقیت نمایش داده شد.',
    en: 'The itinerary "{title}" is now loaded.',
    fr: 'L\'itinéraire "{title}" est maintenant chargé.',
    es: 'El itinerario "{title}" se ha cargado correctamente.',
    tr: '"{title}" programı yüklendi.',
    zh: '行程 "{title}" 现已加载。',
    ja: '旅程 "{title}" が読み込まれました。'
  },
  deleteSuccess: {
    ar: "تم الحذف",
    fa: "حذف شد",
    en: "Deleted",
    fr: "Supprimé",
    es: "Eliminado",
    tr: "Silindi",
    zh: "已删除",
    ja: "削除されました"
  },
  deleteSuccessDesc: {
    ar: "تم حذف الجدول من الذاكرة.",
    fa: "برنامه از حافظه حذف شد.",
    en: "Itinerary deleted from memory.",
    fr: "Itinéraire supprimé de la mémoire.",
    es: "Itinerario eliminado de la memoria.",
    tr: "Seyahat planı hafızadan silindi.",
    zh: "行程已从内存中删除。",
    ja: "旅程がメモリから削除されました。"
  },
  itineraryMemory: {
    ar: "ذاكرة الجداول السياحية",
    fa: "حافظه برنامه‌ها",
    en: "Itinerary Memory",
    fr: "Mémoire d'itinéraire",
    es: "Memoria de itinerario",
    tr: "Yolculuk Hafızası",
    zh: "行程记忆",
    ja: "旅程の記憶"
  },
  saveCurrentItinerary: {
    ar: "حفظ الجدول الحالي",
    fa: "ذخیره برنامه فعلی",
    en: "Save Current Itinerary",
    fr: "Enregistrer l'itinéraire actuel",
    es: "Guardar itinerario actual",
    tr: "Mevcut Programı Kaydet",
    zh: "保存当前行程",
    ja: "現在の旅程を保存"
  },
  saveDescription: {
    ar: "سيتم حفظ هذا الجدول السياحي مع كافة تفاصيله لتتمكن من تصفحه أو تعديله لاحقاً.",
    fa: "این برنامه با تمامی جزئیات ذخیره می‌شود تا بعداً بتوانید آن را مرور یا ویرایش کنید.",
    en: "This itinerary and all its activities will be saved so you can browse or edit it later.",
    fr: "Cet itinéraire et toutes ses activités seront sauvegardés afin que vous puissiez les consulter ou les modifier plus tard.",
    es: "Este itinerario y todas sus actividades se guardarán para que pueda consultarlo o editarlo más tarde.",
    tr: "Bu seyahat planı ve tüm aktiviteleri daha sonra göz atabilmeniz veya düzenleyebilmeniz için kaydedilecektir.",
    zh: "此行程及其所有活动将被保存，以便您以后浏览或编辑。",
    ja: "この旅程とそのすべてのアクティビティは保存され、後で閲覧または編集できます。"
  },
  enterItineraryName: {
    ar: "أدخل اسماً للجدول...",
    fa: "نام برنامه را وارد کنید...",
    en: "Enter itinerary name...",
    fr: "Entrez le nom de l'itinéraire...",
    es: "Ingrese el nombre del itinerario...",
    tr: "Seyahat planı adı girin...",
    zh: "输入行程名称...",
    ja: "旅程の名前を入力..."
  },
  save: {
    ar: "حفظ",
    fa: "ذخیره",
    en: "Save",
    fr: "Enregistrer",
    es: "Guardar",
    tr: "Kaydet",
    zh: "保存",
    ja: "保存"
  },
  previouslySavedItineraries: {
    ar: "الجداول المحفوظة سابقاً",
    fa: "برنامه‌های ذخیره شده قبلی",
    en: "Previously Saved Itineraries",
    fr: "Itinéraires précédemment enregistrés",
    es: "Itinerarios guardados anteriormente",
    tr: "Önceden Kaydedilmiş Programlar",
    zh: "以前保存的行程",
    ja: "以前保存された旅程"
  },
  noSavedItineraries: {
    ar: "لا توجد جداول محفوظة في الذاكرة حتى الآن.",
    fa: "هنوز هیچ برنامه‌ای در حافظه ذخیره نشده است.",
    en: "No saved itineraries in memory yet.",
    fr: "Aucun itinéraire enregistré pour le moment.",
    es: "Aún no hay itinerarios guardados en la memoria.",
    tr: "Henüz hafızada kayıtlı seyahat planı yok.",
    zh: "内存中还没有保存的行程。",
    ja: "メモリに保存された旅程はまだありません。"
  },
  daysCount: {
    ar: "أيام",
    fa: "روز",
    en: "days",
    fr: "jours",
    es: "días",
    tr: "gün",
    zh: "天",
    ja: "日"
  },
  fallbackTitle: {
    ar: "جدول سياحي",
    fa: "برنامه سفر",
    en: "Itinerary",
    fr: "Itinéraire",
    es: "Itinerario",
    tr: "Seyahat Programı",
    zh: "行程",
    ja: "旅程"
  }
};

const getLocalText = (key: string, lang: string, variables?: Record<string, string>) => {
  const translations = itineraryPageTranslations[key];
  if (!translations) return "";
  let text = translations[lang] || translations["en"] || "";
  if (variables) {
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replaceAll(`{${k}}`, v);
    });
  }
  return text;
};

export default function ItineraryPage() {
  const [, setLocation] = useLocation();
  const { t, isRTL, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const searchString = useSearch();

  const getAccommodationTypeLabel = (type: string) => {
    const labels: Record<string, { ar: string, en: string }> = {
      hotel: { ar: "فندق", en: "Hotel" },
      resort: { ar: "منتجع", en: "Resort" },
      apartment: { ar: "شقة فندقية", en: "Hotel Apartment" },
      hostel: { ar: "نزل أو مخيم", en: "Inn/Lodge/Camp" }
    };
    const choice = labels[type] || labels.hotel;
    return language === "ar" || language === "fa" ? choice.ar : choice.en;
  };

  const getLocalizedItineraryTitle = () => {
    if (!itinerary) return "";
    if (language === "ar" || language === "fa") {
      return itinerary.title;
    }
    const budgetLabels: Record<string, Record<string, string>> = {
      low: {
        en: "Special Budget Trip",
        fr: "Voyage à budget spécial",
        es: "Viaje con presupuesto especial",
        tr: "Özel Bütçeli Seyahat",
        zh: "特惠预算之旅",
        ja: "特別予算旅行",
      },
      medium: {
        en: "Balanced & Comfortable Trip",
        fr: "Voyage équilibré & confortable",
        es: "Viaje equilibrado y cómodo",
        tr: "Dengeli ve Konforlu Seyahat",
        zh: "均衡舒适之旅",
        ja: "バランスの取れた快適な旅行",
      },
      high: {
        en: "Premium Luxury Trip",
        fr: "Voyage de luxe de premier choix",
        es: "Viaje de lujo premium",
        tr: "Seçkin Lüks Seyahat",
        zh: "优质奢华之旅",
        ja: "プレミアム贅沢旅行",
      },
      luxury: {
        en: "Exceptional Luxury Trip",
        fr: "Voyage de luxe exceptionnel",
        es: "Viaje de lujo excepcional",
        tr: "Olağanüstü Lüks Seyahat",
        zh: "至尊奢华之旅",
        ja: "格別な贅沢旅行",
      }
    };
    const labels = budgetLabels[itinerary.budget];
    if (labels) {
      return labels[language] || labels["en"] || itinerary.title;
    }
    return itinerary.title;
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const fullUrl = searchString ? `/api/itinerary?${searchString}` : "/api/itinerary";
  
  const { data: fetchedItinerary, isLoading, error } = useQuery<Itinerary>({
    queryKey: [fullUrl],
    enabled: !!searchString,
  });

  const [editedItinerary, setEditedItinerary] = useState<Itinerary | null>(() => {
    try {
      const active = localStorage.getItem("shouma_active_itinerary");
      return active ? JSON.parse(active) : null;
    } catch {
      return null;
    }
  });

  // When a new itinerary is fetched via query parameter generation, store it as the active one
  useEffect(() => {
    if (fetchedItinerary && searchString) {
      setEditedItinerary(fetchedItinerary);
      localStorage.setItem("shouma_active_itinerary", JSON.stringify(fetchedItinerary));
    }
  }, [fetchedItinerary, searchString]);

  // When the itinerary is modified (edited, items replaced, etc.), persist it in localStorage
  useEffect(() => {
    if (editedItinerary) {
      localStorage.setItem("shouma_active_itinerary", JSON.stringify(editedItinerary));
    }
  }, [editedItinerary]);
  const [editMode, setEditMode] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<{ dayIndex: number; activityIndex: number } | null>(null);
  const [addTarget, setAddTarget] = useState<{ dayIndex: number; afterIndex: number } | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { toast } = useToast();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [savedItineraries, setSavedItineraries] = useState<any[]>([]);

  const loadSavedItineraries = () => {
    try {
      const saved = localStorage.getItem("shouma_saved_itineraries");
      if (saved) {
        setSavedItineraries(JSON.parse(saved));
      } else {
        setSavedItineraries([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSavedItineraries();
  }, []);

  const handleSave = () => {
    if (!itinerary) return;
    try {
      const titleToSave = customTitle.trim() || itinerary.title || getLocalText("fallbackTitle", language);
      const savedRaw = localStorage.getItem("shouma_saved_itineraries");
      const list = savedRaw ? JSON.parse(savedRaw) : [];
      
      const newItinerary = {
        id: Date.now().toString(),
        title: titleToSave,
        duration: itinerary.duration,
        budget: itinerary.budget,
        governorates: itinerary.governorates,
        days: itinerary.days,
        budgetSummary: itinerary.budgetSummary,
        savedAt: new Date().toISOString()
      };
      
      list.push(newItinerary);
      localStorage.setItem("shouma_saved_itineraries", JSON.stringify(list));
      setSavedItineraries(list);
      
      toast({
        title: getLocalText("saveSuccess", language),
        description: getLocalText("saveSuccessDesc", language, { title: titleToSave }),
      });
      setIsSaveModalOpen(false);
    } catch (e) {
      console.error(e);
      toast({
        title: getLocalText("saveError", language),
        description: getLocalText("saveErrorDesc", language),
        variant: "destructive"
      });
    }
  };

  const handleLoadSaved = (savedItem: any) => {
    setEditedItinerary(savedItem);
    setIsSaveModalOpen(false);
    toast({
      title: getLocalText("loadSuccess", language),
      description: getLocalText("loadSuccessDesc", language, { title: savedItem.title }),
    });
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const savedRaw = localStorage.getItem("shouma_saved_itineraries");
      if (!savedRaw) return;
      const list = JSON.parse(savedRaw);
      const filtered = list.filter((item: any) => item.id !== id);
      localStorage.setItem("shouma_saved_itineraries", JSON.stringify(filtered));
      setSavedItineraries(filtered);
      toast({
        title: getLocalText("deleteSuccess", language),
        description: getLocalText("deleteSuccessDesc", language),
      });
    } catch (e) {
      console.error(e);
    }
  };

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
                variant="ghost"
                size="icon"
                onClick={() => {
                  loadSavedItineraries();
                  setCustomTitle(itinerary.title || "");
                  setIsSaveModalOpen(true);
                }}
                className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50"
                title={getLocalText("itineraryMemory", language)}
              >
                <Save className="w-5 h-5 text-primary" />
                {savedItineraries.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </Button>
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
            {getLocalizedItineraryTitle()}
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
              {itinerary.governorates?.map((gov) => (
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
        {itinerary.noMatchingAccommodation && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl text-center font-medium text-sm flex items-center justify-center gap-2" dir={isRTL ? "rtl" : "ltr"}>
            <span className="text-lg">⚠️</span>
            <span>
              {language === "ar" || language === "fa" 
                ? `تنبيه: هذه المنطقة لا يوجد بها خيارك المفضل للسكن (${getAccommodationTypeLabel(itinerary.requestedAccommodation || "")})، لذا تم اقتراح بديل مناسب.`
                : `Notice: This area does not have your preferred accommodation type (${getAccommodationTypeLabel(itinerary.requestedAccommodation || "")}), so a suitable alternative was suggested.`
              }
            </span>
          </div>
        )}

        {editMode && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
            <p className="text-sm text-primary font-medium">{t('editModeHint')}</p>
          </div>
        )}

        <div className="space-y-8">
          {itinerary.days?.map((day, dayIndex) => (
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
              language={language}
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
                <BudgetRow icon={<Building2 className="w-4 h-4" />} label={t('hotelsCost')} value={itinerary.budgetSummary.hotels} />
                <BudgetRow icon={<UtensilsCrossed className="w-4 h-4" />} label={t('restaurantsCost')} value={itinerary.budgetSummary.restaurants} />
                <BudgetRow icon={<MapPin className="w-4 h-4" />} label={t('attractionsCost')} value={itinerary.budgetSummary.attractions} />
                <BudgetRow icon={<Sparkles className="w-4 h-4" />} label={t('activitiesCost')} value={itinerary.budgetSummary.activities} />
                <BudgetRow icon={<Car className="w-4 h-4" />} label={t('transportCost')} value={itinerary.budgetSummary.transport} />
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{t('totalCost')}</span>
                <span data-testid="text-total-cost" className="text-2xl font-bold text-primary">
                  {formatPrice(itinerary.budgetSummary.total)}
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
                        {formatPrice(s.estimatedCost)}
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
                        {formatPrice(s.estimatedCost)}
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

      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Save className="w-5 h-5 text-primary" />
              {getLocalText("itineraryMemory", language)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Save Current Itinerary Form */}
            <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/15">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                {getLocalText("saveCurrentItinerary", language)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getLocalText("saveDescription", language)}
              </p>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={getLocalText("enterItineraryName", language)}
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  dir="auto"
                />
                <Button onClick={handleSave} className="shrink-0">
                  <Save className="w-4 h-4 mr-2" />
                  {getLocalText("save", language)}
                </Button>
              </div>
            </div>

            {/* Saved Itineraries List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {getLocalText("previouslySavedItineraries", language)}
              </h3>
              {savedItineraries.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-xl">
                  {getLocalText("noSavedItineraries", language)}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {savedItineraries.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadSaved(item)}
                      className="group cursor-pointer p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/40 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                          <span>{item.duration} {getLocalText("daysCount", language)}</span>
                          <span>•</span>
                          <span>{new Date(item.savedAt).toLocaleDateString(language, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 opacity-60 hover:opacity-100 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DayCard({ 
  day, dayIndex, t, editMode, onItemClick, onReplace, onDelete, onAdd, language 
}: { 
  day: ItineraryDay; 
  dayIndex: number;
  t: (key: string) => string; 
  editMode: boolean;
  onItemClick: (type: string, id: string) => void;
  onReplace: (dayIndex: number, activityIndex: number) => void;
  onDelete: (dayIndex: number, activityIndex: number) => void;
  onAdd: (dayIndex: number, afterIndex: number) => void;
  language: string;
}) {
  const { formatPrice } = useCurrency();
  return (
    <Card data-testid={`card-day-${day.day}`} className="overflow-hidden">
      <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{day.day}</span>
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{getLocalizedDayTitle(day.title, language)}</CardTitle>
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
          {day.activities?.map((activity, index) => (
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
                    {getLocalizedActivityName(activity, language)}
                  </h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {getLocalizedLocation(activity, language)}
                  </p>
                  {activity.estimatedCost !== undefined && activity.estimatedCost > 0 && (
                    <Badge variant="outline" className="mt-1 text-xs w-fit border-primary/30 text-primary">
                      {formatPrice(activity.estimatedCost)}
                    </Badge>
                  )}
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {getLocalizedDescription(activity, language)}
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

function BudgetRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  const { formatPrice } = useCurrency();
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="font-semibold text-foreground">{formatPrice(value)}</p>
      </div>
    </div>
  );
}
