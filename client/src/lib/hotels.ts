import sixSensesHotelImg from "@/assets/six-senses-hotel.png";
import alsalamGrandResortImg from "@/assets/alsalam-grand-resort.png";
import crownePlazaDuqmImg from "@/assets/crowne-plaza-duqm.png";
import alNebrasHotelImg from "@/assets/al-nebras-hotel.png";
import ihyaLodgeImg from "@/assets/ihya-lodge.png";

export interface Hotel {
  id: string;
  nameAr: string;
  nameEn: string;
  name?: string;
  governorate: string;
  city?: string;
  region?: string;
  locationAr: string;
  locationEn: string;
  location?: string;
  rating: number;
  stars?: number;
  pricePerNight: number;
  image: string;
  descriptionAr: string;
  descriptionEn: string;
  description?: string;
  descriptionFr?: string;
  descriptionTr?: string;
  amenities: string[];
  phone?: string;
  mapUrl?: string;
  roomOptions?: any[];
  gallery?: any[];
  additionalImages?: string[];
  splitShoumaPct?: number;
  splitHotelPct?: number;
  rooms?: any[];
  reviews?: any[];
  bankAccount?: string;
}

export const hotels: Hotel[] = [
  {
    id: "six-senses-zighy-bay",
    nameAr: "منتجع سيكس سينسيز خليج زغي",
    nameEn: "Six Senses Zighy Bay",
    governorate: "مسندم",
    locationAr: "دبا، محافظة مسندم",
    locationEn: "Dibba, Musandam Governorate",
    rating: 4.9,
    pricePerNight: 350,
    image: sixSensesHotelImg,
    descriptionAr: "منتجع فاخر يقع على شبه جزيرة مسندم بين الجبال الشاهقة والشواطئ الرملية الممتدة.",
    descriptionEn: "Luxury resort located on Musandam Peninsula set between dramatic mountains and a sandy beach.",
    amenities: ["مسبح خاص", "واي فاي مجاني", "مركز إسبا", "إطلالة بحرية", "مطاعم فاخرة"],
    rooms: [
      { id: "v1", nameAr: "فيلا شاطئية مع مسبح خاص", priceOMR: 350, capacity: "2 بالغين", image: sixSensesHotelImg },
      { id: "v2", nameAr: "جناح ملكي مطل على الخليج", priceOMR: 500, capacity: "4 بالغين", image: sixSensesHotelImg }
    ]
  },
  {
    id: "al-salam-grand-resort",
    nameAr: "منتجع السلام جراند البريمي",
    nameEn: "Al Salam Grand Resort",
    governorate: "البريمي",
    locationAr: "ولاية البريمي",
    locationEn: "Al Buraimi Wilayat",
    rating: 4.7,
    pricePerNight: 65,
    image: alsalamGrandResortImg,
    descriptionAr: "منتجع راقٍ يوفر غرفاً فسيحة وأنشطة ترفيهية متكاملة للعائلات والزوار في محافظة البريمي.",
    descriptionEn: "Upmarket resort with spacious rooms and complete leisure activities in Al Buraimi.",
    amenities: ["مسبح عائلي", "حدائق غناء", "مطعم دولي", "خدمة الغرف", "موقف سيارات"],
    rooms: [
      { id: "r1", nameAr: "غرفة ديلوكس مزدوجة", priceOMR: 65, capacity: "2 بالغين", image: alsalamGrandResortImg }
    ]
  },
  {
    id: "crowne-plaza-duqm",
    nameAr: "فندق كراون بلازا الدقم",
    nameEn: "Crowne Plaza Duqm",
    governorate: "الوسطى",
    locationAr: "الدقم، محافظة الوسطى",
    locationEn: "Duqm, Al Wusta Governorate",
    rating: 4.6,
    pricePerNight: 80,
    image: crownePlazaDuqmImg,
    descriptionAr: "فندق 5 نجوم مطل على بحر العرب بمدينة الدقم، يتميز بمرافقه الحديثة وموقعه الاستراتيجي.",
    descriptionEn: "5-star hotel facing the Arabian Sea in Duqm, featuring modern amenities and strategic location.",
    amenities: ["مسبح لا متناهي", "مركز لياقة", "شاطئ خاص", "مركز أعمال"],
    rooms: [
      { id: "cp1", nameAr: "غرفة مطلة على البحر", priceOMR: 80, capacity: "2 بالغين", image: crownePlazaDuqmImg }
    ]
  },
  {
    id: "al-nebras-hotel",
    nameAr: "فندق النبراس عبري",
    nameEn: "Al Nebras Hotel Ibri",
    governorate: "الظاهرة",
    locationAr: "عبري، محافظة الظاهرة",
    locationEn: "Ibri, Ad Dhahirah Governorate",
    rating: 4.3,
    pricePerNight: 35,
    image: alNebrasHotelImg,
    descriptionAr: "فندق مريح يقع في قلب مدينة عبري بأسعار مناسبة وخيارات إقامة ممتازة.",
    descriptionEn: "Comfortable hotel in the heart of Ibri offering great value and quality stay.",
    amenities: ["واي فاي مجاني", "مطعم", "مواقف مجانية", "تكييف ممتاز"],
    rooms: [
      { id: "an1", nameAr: "غرفة قياسية", priceOMR: 35, capacity: "2 بالغين", image: alNebrasHotelImg }
    ]
  },
  {
    id: "ihya-lodge",
    nameAr: "نزل إحياء التراثي",
    nameEn: "Ihya Heritage Lodge",
    governorate: "الداخلية",
    locationAr: "مسفاة العبريين، ولاية الحمراء",
    locationEn: "Misfat Al Abriyyin, Al Hamra",
    rating: 4.8,
    pricePerNight: 45,
    image: ihyaLodgeImg,
    descriptionAr: "تجربة إقامة عمانية اصيلة في قلب قري مسفاة العبريين التراثية بين البساتين والأفلاج.",
    descriptionEn: "Authentic Omani heritage stay in Misfat Al Abriyyin amidst lush palm groves and falaj channels.",
    amenities: ["إفطار تقليدي", "إطلالة جبلية", "جلسات عمانية", "واي فاي"],
    rooms: [
      { id: "ih1", nameAr: "غرفة تراثية مطلة على الواحة", priceOMR: 45, capacity: "2 بالغين", image: ihyaLodgeImg }
    ]
  }
];
