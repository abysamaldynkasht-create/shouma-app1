import jebelAkhdarImg from "@/assets/jebel-akhdar.png";
import wadiDarbatImg from "@/assets/wadi-darbat.png";
import camelRidingImg from "@/assets/activity-camel-riding.png";
import horseRidingImg from "@/assets/horse-riding-seeb.png";

export interface ActivityBranch {
  nameAr?: string;
  nameEn?: string;
  name?: string;
  locationAr?: string;
  locationEn?: string;
  mapUrl?: string;
  phone?: string;
  [key: string]: any;
}

export interface Activity {
  id: string;
  titleAr?: string;
  titleEn?: string;
  nameAr: string;
  nameEn: string;
  name?: string;
  governorate?: string;
  locationAr?: string;
  locationEn?: string;
  location?: string;
  category?: string;
  durationAr?: string;
  durationEn?: string;
  duration?: string;
  priceOMR?: number;
  price?: number | string;
  rating: number;
  image: string;
  descriptionAr: string;
  descriptionEn: string;
  description?: string;
  descriptionFr?: string;
  descriptionTr?: string;
  mapUrl?: string;
  branches?: ActivityBranch[];
  region?: string;
  provider?: string;
  phone?: string;
  includes?: string[];
}

export const activities: Activity[] = [
  {
    id: "camel-safari-wahiba",
    titleAr: "جولة سفاري الإبل في رمال الشرقية",
    titleEn: "Wahiba Sands Camel Safari",
    nameAr: "سفاري الإبل في صحراء آل وهيبة",
    nameEn: "Desert Camel Safari in Wahiba",
    governorate: "شمال الشرقية",
    locationAr: "رمال آل وهيبة، بدية",
    locationEn: "Wahiba Sands, Bidiya",
    category: "مغامرات صحراوية",
    durationAr: "3 ساعات",
    durationEn: "3 Hours",
    priceOMR: 25,
    rating: 4.8,
    image: camelRidingImg,
    descriptionAr: "تجربة سفاري ركوب الهجن العمانية ومشاهدة الغروب بين الكثبان الرملية الذهبية.",
    descriptionEn: "Experience riding Omani camels and watching the sunset over golden sand dunes."
  },
  {
    id: "hiking-jebel-akhdar",
    titleAr: "مسار المشي الجبلي في الجبل الأخضر",
    titleEn: "Jebel Akhdar Hiking Trail",
    nameAr: "مسار القرى التراثية والجبل الأخضر",
    nameEn: "Heritage Villages Hike in Jebel Akhdar",
    governorate: "الداخلية",
    locationAr: "الجبل الأخضر، ولاية نزوى",
    locationEn: "Jebel Akhdar, Nizwa",
    category: "رياضة ومغامرة",
    durationAr: "4 ساعات",
    durationEn: "4 Hours",
    priceOMR: 15,
    rating: 4.9,
    image: jebelAkhdarImg,
    descriptionAr: "استكشاف المدرجات الزراعية وقرى الجبل القديمة ومزارع الورد والمشمش.",
    descriptionEn: "Explore agricultural terraces, ancient mountain villages, rose and apricot farms."
  },
  {
    id: "kayaking-wadi-darbat",
    titleAr: "قوارب وتجديف وادي دربات",
    titleEn: "Wadi Darbat Kayaking & Boating",
    nameAr: "رحلة التجديف في بحيرة وادي دربات",
    nameEn: "Kayaking Trip at Wadi Darbat Lake",
    governorate: "ظفار",
    locationAr: "وادي دربات، طاقة",
    locationEn: "Wadi Darbat, Taqah",
    category: "أنشطة مائية",
    durationAr: "ساعة واحدة",
    durationEn: "1 Hour",
    priceOMR: 10,
    rating: 4.7,
    image: wadiDarbatImg,
    descriptionAr: "تجديف بالقوارب الكاياك بين الشلالات والخضرة الساحرة في فصل الخريف والمواسم الماطرة.",
    descriptionEn: "Kayaking among waterfalls and lush greenery during Khareef and rainy seasons."
  },
  {
    id: "horse-riding-seeb",
    titleAr: "ركوب الخيل على شاطئ السيب",
    titleEn: "Beach Horse Riding in Seeb",
    nameAr: "ركوب الخيل العربي على شاطئ البحر",
    nameEn: "Arabian Horse Riding on the Beach",
    governorate: "مسقط",
    locationAr: "شاطئ السيب، مسقط",
    locationEn: "Seeb Beach, Muscat",
    category: "ترفيه عائلي",
    durationAr: "ساعتان",
    durationEn: "2 Hours",
    priceOMR: 20,
    rating: 4.6,
    image: horseRidingImg,
    descriptionAr: "تجربة ركوب الخيول العربية الأصيلة على شاطئ البحر عند شروق الشمس أو الغروب.",
    descriptionEn: "Ride purebred Arabian horses along the sandy shoreline during sunrise or sunset."
  }
];
