import guideAhmedImg from "@/assets/guide-ahmed.png";
import guideFatimaImg from "@/assets/guide-fatima.png";
import guideKhalidImg from "@/assets/guide-khalid.png";
import guideMariamImg from "@/assets/guide-mariam.png";
import guideSaidImg from "@/assets/guide-said.png";
import guideYusufImg from "@/assets/guide-yusuf.png";

export interface TourGuide {
  id: number;
  name: string;
  nameAr: string;
  specialization: string;
  specializationAr: string;
  languages: string[];
  experience: number;
  city: string;
  description: string;
  image: string;
  phone: string;
  whatsapp: string;
  rating: number;
  reviewsCount: number;
  pricePerDay: number;
  services: string[];
  availability: boolean;
}

export const tourGuides: TourGuide[] = [
  {
    id: 1,
    name: "Ahmed Al-Balushi",
    nameAr: "أحمد البلوشي",
    specialization: "Historical & Cultural Tours",
    specializationAr: "جولات تاريخية وثقافية",
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
    experience: 12,
    city: "مسقط",
    description: "مرشد سياحي محترف متخصص في التاريخ العُماني والمواقع الأثرية. خبرة واسعة في تنظيم الجولات للمجموعات والأفراد مع معرفة عميقة بالتراث العُماني.",
    image: guideAhmedImg,
    phone: "+968 9123 4567",
    whatsapp: "+96891234567",
    rating: 4.9,
    reviewsCount: 156,
    pricePerDay: 50,
    services: ["جولات القلاع والحصون", "الأسواق التقليدية", "المتاحف", "جولات المدينة القديمة"],
    availability: true,
  },
  {
    id: 2,
    name: "Fatima Al-Habsi",
    nameAr: "فاطمة الحبسي",
    specialization: "Adventure & Nature Tours",
    specializationAr: "جولات المغامرة والطبيعة",
    languages: ["العربية", "الإنجليزية"],
    experience: 8,
    city: "نزوى",
    description: "مرشدة متخصصة في رحلات المغامرة والهايكنج في الجبال العُمانية. خبيرة في مسارات الجبل الأخضر وجبل شمس مع اهتمام خاص بالسلامة.",
    image: guideFatimaImg,
    phone: "+968 9234 5678",
    whatsapp: "+96892345678",
    rating: 4.8,
    reviewsCount: 98,
    pricePerDay: 45,
    services: ["رحلات الهايكنج", "التخييم", "مشاهدة النجوم", "جولات الوديان"],
    availability: true,
  },
  {
    id: 3,
    name: "Khalid Al-Rashdi",
    nameAr: "خالد الراشدي",
    specialization: "Desert Safari Tours",
    specializationAr: "رحلات الصحراء السفاري",
    languages: ["العربية", "الإنجليزية", "الألمانية"],
    experience: 15,
    city: "صلالة",
    description: "خبير في رحلات الصحراء والسفاري مع معرفة واسعة بصحراء الربع الخالي ورمال وهيبة. متخصص في تنظيم رحلات التخييم الصحراوي الفاخرة.",
    image: guideKhalidImg,
    phone: "+968 9345 6789",
    whatsapp: "+96893456789",
    rating: 4.9,
    reviewsCount: 203,
    pricePerDay: 60,
    services: ["سفاري الصحراء", "التخييم البدوي", "ركوب الجمال", "جولات الكثبان الرملية"],
    availability: true,
  },
  {
    id: 4,
    name: "Mariam Al-Lawati",
    nameAr: "مريم اللواتي",
    specialization: "Photography Tours",
    specializationAr: "جولات التصوير الفوتوغرافي",
    languages: ["العربية", "الإنجليزية", "الإيطالية"],
    experience: 6,
    city: "مسقط",
    description: "مرشدة متخصصة في جولات التصوير الفوتوغرافي، تساعدك في اكتشاف أفضل المواقع والأوقات لالتقاط صور مذهلة لعُمان.",
    image: guideMariamImg,
    phone: "+968 9456 7890",
    whatsapp: "+96894567890",
    rating: 4.7,
    reviewsCount: 67,
    pricePerDay: 55,
    services: ["جولات شروق الشمس", "جولات غروب الشمس", "تصوير المناظر الطبيعية", "تصوير الحياة البرية"],
    availability: false,
  },
  {
    id: 5,
    name: "Said Al-Kindi",
    nameAr: "سعيد الكندي",
    specialization: "Marine & Diving Tours",
    specializationAr: "جولات بحرية والغوص",
    languages: ["العربية", "الإنجليزية"],
    experience: 10,
    city: "مسندم",
    description: "مرشد بحري محترف ومدرب غوص معتمد. خبرة واسعة في تنظيم رحلات مشاهدة الدلافين والغوص في مياه مسندم الصافية.",
    image: guideSaidImg,
    phone: "+968 9567 8901",
    whatsapp: "+96895678901",
    rating: 4.8,
    reviewsCount: 124,
    pricePerDay: 70,
    services: ["رحلات الغوص", "مشاهدة الدلافين", "الصيد", "جولات القوارب"],
    availability: true,
  },
  {
    id: 6,
    name: "Yusuf Al-Farsi",
    nameAr: "يوسف الفارسي",
    specialization: "Family & Group Tours",
    specializationAr: "جولات عائلية ومجموعات",
    languages: ["العربية", "الإنجليزية", "الهندية"],
    experience: 9,
    city: "صحار",
    description: "متخصص في تنظيم الجولات العائلية والمجموعات الكبيرة. يوفر تجربة سياحية ممتعة وآمنة للجميع مع مراعاة احتياجات الأطفال وكبار السن.",
    image: guideYusufImg,
    phone: "+968 9678 9012",
    whatsapp: "+96896789012",
    rating: 4.6,
    reviewsCount: 89,
    pricePerDay: 40,
    services: ["جولات عائلية", "رحلات مدرسية", "جولات الشركات", "حفلات خاصة"],
    availability: true,
  },
];
