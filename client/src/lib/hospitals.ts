import hospitalRoyalImg from "@/assets/hospital-royal.png";
import hospitalKhoulaImg from "@/assets/hospital-khoula.png";
import hospitalSquImg from "@/assets/hospital-squ.png";
import hospitalOmanIntImg from "@/assets/hospital-oman-international.png";
import hospitalBadrSamaaImg from "@/assets/hospital-badr-samaa.png";

export interface HospitalItem {
  id: string;
  name: string;
  nameAr: string;
  type: "hospital" | "health_center" | "clinic" | "pharmacy";
  typeAr?: string;
  isGovernment?: boolean;
  region: string;
  location: string;
  address: string;
  rating: number;
  reviews: number;
  phone: string;
  emergencyPhone?: string;
  image: string;
  description: string;
  descriptionAr: string;
  services: string[];
  hours: string;
  workingHours?: string;
  emergencyServices: boolean;
  insurance: string[];
  mapUrl?: string;
  lat: number;
  lng: number;
}

export const hospitals: HospitalItem[] = [
  {
    id: "royal-hospital",
    name: "Royal Hospital",
    nameAr: "المستشفى السلطاني",
    type: "hospital",
    typeAr: "مستشفى تخصصي مرجعي",
    isGovernment: true,
    region: "مسقط",
    location: "بوشر، مسقط",
    address: "شارع المستشفى السلطاني، بوشر، مسقط",
    rating: 4.8,
    reviews: 1420,
    phone: "+968 2459 9000",
    emergencyPhone: "9999",
    image: hospitalRoyalImg,
    description: "One of the largest tertiary healthcare institutions in Oman, providing advanced medical services.",
    descriptionAr: "أحد أكبر وأحدث الصروح الطبية التخصصية في سلطنة عُمان، يقدّم خدمات الرعاية الصحية التخصصية الشاملة.",
    services: ["طوارئ 24 ساعة", "جراحة القلب", "الأورام", "العناية المركزة", "طب الأطفال", "المختبرات والتحاليل"],
    hours: "24 ساعة (طوال أيام الأسبوع)",
    workingHours: "طوارئ 24 ساعة / العيادات 7:30 ص - 2:30 م",
    emergencyServices: true,
    insurance: ["وزارة الصحة", "تأمين عمان", "الوطنية للتأمين", "ديمان", "غلوب ميد"],
    mapUrl: "https://maps.google.com/?q=Royal+Hospital+Muscat",
    lat: 23.5859,
    lng: 58.3829,
  },
  {
    id: "khoula-hospital",
    name: "Khoula Hospital",
    nameAr: "مستشفى خولة",
    type: "hospital",
    typeAr: "مستشفى مرجعي للحوادث والجراحة",
    isGovernment: true,
    region: "مسقط",
    location: "ميناء الفحل، مطرح",
    address: "شارع النهضة، مطرح، مسقط",
    rating: 4.7,
    reviews: 980,
    phone: "+968 2456 0455",
    emergencyPhone: "9999",
    image: hospitalKhoulaImg,
    description: "The primary national center for orthopedics, trauma, reconstructive and neurosurgery in Oman.",
    descriptionAr: "المركز الوطني المرجعي الأول لجراحة العظام والحوادث والإصابات وجراحة الأعصاب والتجميل.",
    services: ["طوارئ الحوادث والإصابات", "جراحة العظام والمفاصل", "جراحة الأعصاب", "جراحة التجميل والحروق", "العلاج الطبيعي"],
    hours: "24 ساعة (طوال أيام الأسبوع)",
    workingHours: "طوارئ 24 ساعة / العيادات 7:30 ص - 2:30 م",
    emergencyServices: true,
    insurance: ["وزارة الصحة", "تأمين عمان", "أكسا", "بوبا الدولية"],
    mapUrl: "https://maps.google.com/?q=Khoula+Hospital+Muscat",
    lat: 23.6145,
    lng: 58.5284,
  },
  {
    id: "squ-hospital",
    name: "SQU Hospital",
    nameAr: "مستشفى جامعة السلطان قابوس",
    type: "hospital",
    typeAr: "مستشفى جامعي تعليمي",
    isGovernment: true,
    region: "مسقط",
    location: "الخوض، السيب",
    address: "حرم جامعة السلطان قابوس، الخوض",
    rating: 4.9,
    reviews: 1250,
    phone: "+968 2414 1111",
    emergencyPhone: "9999",
    image: hospitalSquImg,
    description: "Academic medical center delivering cutting-edge patient care and clinical research.",
    descriptionAr: "مركز طبي جامعي وأكاديمي متكامل يقدم رعاية صحية عالية المستوى مع أحدث التقنيات الطبية.",
    services: ["الطوارئ الجامعية", "أمراض الدم وزراعة النخاع", "طب الأسرة والمجتمع", "الأشعة التشخيصية", "الصيدلية المركزية"],
    hours: "24 ساعة (طوال أيام الأسبوع)",
    workingHours: "طوارئ 24 ساعة / العيادات 8:00 ص - 3:00 م",
    emergencyServices: true,
    insurance: ["وزارة الصحة", "تأمين عمان", "متلايف", "ميدنت"],
    mapUrl: "https://maps.google.com/?q=Sultan+Qaboos+University+Hospital",
    lat: 23.5905,
    lng: 58.1712,
  },
  {
    id: "oman-intl-hospital",
    name: "Oman International Hospital",
    nameAr: "مستشفى عمان الدولي",
    type: "hospital",
    typeAr: "مستشفى دولي خاص",
    isGovernment: false,
    region: "مسقط",
    location: "العذيبة، مسقط",
    address: "شارع 18 نوفمبر، العذيبة، مسقط",
    rating: 4.9,
    reviews: 640,
    phone: "+968 2490 3000",
    emergencyPhone: "+968 2490 3111",
    image: hospitalOmanIntImg,
    description: "Leading private international hospital offering world-class medical expertise and VIP care.",
    descriptionAr: "مستشفى خاص فاخر يقدم خدمات طبية بمعايير عالمية مع نخبة من الاستشاريين الدوليين وخدمة VIP.",
    services: ["طوارئ خاصة VIP", "مركز المرأة والطفل", "جراحة اليوم الواحد", "العيادات التخصصية", "فحوصات شاملة"],
    hours: "24 ساعة (طوال أيام الأسبوع)",
    workingHours: "طوارئ 24 ساعة / العيادات 8:00 ص - 9:00 م",
    emergencyServices: true,
    insurance: ["بوبا", "نكست كير", "ديمان", "غلوب ميد", "سيغنا الدولية", "تأمين عمان"],
    mapUrl: "https://maps.google.com/?q=Oman+International+Hospital",
    lat: 23.5936,
    lng: 58.3752,
  },
  {
    id: "badr-al-samaa",
    name: "Badr Al Samaa Hospital",
    nameAr: "مستشفى بدر السماء",
    type: "hospital",
    typeAr: "مستشفى عام خاص",
    isGovernment: false,
    region: "مسقط",
    location: "الخوير، مسقط",
    address: "شارع المها، الخوير، مسقط",
    rating: 4.6,
    reviews: 890,
    phone: "+968 2448 8322",
    emergencyPhone: "+968 2448 8322",
    image: hospitalBadrSamaaImg,
    description: "One of the largest private healthcare networks in the Sultanate with accessible multi-specialty care.",
    descriptionAr: "إحدى كبرى شبكات المستشفيات الخاصة في السلطنة وتقدم خدمات طبية متعددة التخصصات بأسعار مناسبة.",
    services: ["طوارئ 24/7", "عيادة الأسنان", "أمراض القلب", "النساء والتوليد", "الباطنية", "فحوصات التأشيرات والإقامة"],
    hours: "24 ساعة (طوال أيام الأسبوع)",
    workingHours: "طوارئ 24 ساعة / العيادات 8:00 ص - 11:00 م",
    emergencyServices: true,
    insurance: ["جميع شركات التأمين المعتمدة بالسلطنة", "نكست كير", "غلوب ميد", "ديمان"],
    mapUrl: "https://maps.google.com/?q=Badr+Al+Samaa+Hospital+Al+Khuwair",
    lat: 23.5978,
    lng: 58.4239,
  }
];

export function getTypeAr(type: string): string {
  switch (type) {
    case "hospital":
      return "مستشفى عام / تخصصي";
    case "health_center":
      return "مركز صحي";
    case "clinic":
      return "عيادة تخصصية";
    case "pharmacy":
      return "صيدلية";
    default:
      return "منشأة صحية";
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case "hospital":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "health_center":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "clinic":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "pharmacy":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}
