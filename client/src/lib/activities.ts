import activityCamelRidingImg from "@/assets/activity-camel-riding.png";
import horseRidingSeebImg from "@/assets/horse-riding-seeb.png";
import khareefDhofarImg from "@/assets/khareef-dhofar.png";
import muscatNightsImg from "@/assets/muscat-nights.png";
import potteryNizwaImg from "@/assets/pottery-nizwa.png";
import musandamZiplineImg from "@/assets/khasab-zipline.jpg";
import jabalShamsSunriseImg from "@assets/image_1772602468877.png";
import rosePickingImg from "@assets/image_1772603622726.png";
import actionPointImg from "@assets/image_1772606155245.png";

export interface ActivityBranch {
  name: string;
  nameAr: string;
  mapUrl: string;
}

export interface Activity {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  location: string;
  region: string;
  duration: string;
  price: string;
  image: string;
  rating: number;
  includes: string[];
  provider?: string;
  phone?: string;
  mapUrl?: string;
  branches?: ActivityBranch[];
}

export const activities: Activity[] = [
  {
    id: "camel-riding-bidiya",
    name: "Camel Riding in Bidiya Sands",
    nameAr: "ركوب الجمال في رمال بدية",
    description: "Experience the traditional Omani way of desert travel with a memorable camel ride through the stunning Bidiya sand dunes.",
    descriptionAr: "استمتع بتجربة السفر العماني التقليدي في الصحراء مع رحلة لا تُنسى على ظهر الجمال عبر كثبان رمال بدية الخلابة.",
    location: "بدية، محافظة شمال الشرقية",
    region: "محافظة شمال الشرقية",
    duration: "1-2 ساعة",
    price: "15-25 ر.ع",
    image: activityCamelRidingImg,
    rating: 4.8,
    includes: ["ركوب الجمال", "مرشد محلي", "صور تذكارية"],
    mapUrl: "https://maps.app.goo.gl/JQkZ43c6Nvps8wjo9",
  },
  {
    id: "horse-riding-seeb",
    name: "Horse Riding on Seeb Beach",
    nameAr: "ركوب الخيل على شاطئ السيب",
    description: "Enjoy a scenic horseback ride along the beautiful Seeb beach. Perfect for beginners and experienced riders alike.",
    descriptionAr: "استمتع بركوب الخيل على طول شاطئ السيب الجميل. مناسب للمبتدئين والفرسان ذوي الخبرة.",
    location: "السيب، محافظة مسقط",
    region: "محافظة مسقط",
    duration: "1 ساعة",
    price: "10-20 ر.ع",
    image: horseRidingSeebImg,
    rating: 4.7,
    includes: ["ركوب الخيل", "مدرب محترف", "معدات السلامة"],
    phone: "9781 7171",
    mapUrl: "https://maps.app.goo.gl/7PJ69Jbr1Mfu2cn38",
  },
  {
    id: "khareef-dhofar",
    name: "Khareef Dhofar Season",
    nameAr: "موسم خريف ظفار",
    description: "Khareef Dhofar is one of the most beautiful tourist seasons in the Sultanate of Oman, occurring annually from late June to early September. During this period, Dhofar Governorate transforms into a rare natural painting, where fog and green color cover the mountains and plains, and temperatures drop compared to other areas of the Sultanate. The season features light rain and continuous drizzle, moderate and refreshing weather, natural waterfalls and seasonal springs, and various cultural and tourist events in Salalah and surrounding areas. Khareef Dhofar attracts visitors from inside and outside the Sultanate to enjoy nature, fresh air, and heritage experiences.",
    descriptionAr: "يُعد موسم خريف ظفار من أجمل المواسم السياحية في سلطنة عُمان، ويأتي سنويًا من نهاية يونيو إلى بداية سبتمبر. خلال هذه الفترة تتحول محافظة ظفار إلى لوحة طبيعية نادرة، حيث يكسو الضباب واللون الأخضر الجبال والسهول، وتنخفض درجات الحرارة مقارنة ببقية مناطق السلطنة. يتميّز الخريف بأمطار خفيفة ورذاذ مستمر، أجواء معتدلة ومنعشة، شلالات طبيعية وعيون ماء موسمية، فعاليات ثقافية وسياحية متنوعة في صلالة والمناطق المحيطة. ويجذب موسم خريف ظفار الزوار من داخل السلطنة وخارجها للاستمتاع بالطبيعة، والهواء النقي، والتجارب التراثية، مما يجعله واحدًا من أهم المواسم السياحية في المنطقة.",
    location: "صلالة، محافظة ظفار",
    region: "محافظة ظفار",
    duration: "يونيو - سبتمبر",
    price: "موسم سنوي",
    image: khareefDhofarImg,
    rating: 4.9,
    includes: ["طبيعة خضراء", "أمطار خفيفة", "شلالات طبيعية", "فعاليات ثقافية", "أجواء معتدلة"],
    mapUrl: "https://maps.app.goo.gl/NcYLwNDFoyS6c1319",
  },
  {
    id: "muscat-nights",
    name: "Muscat Nights Festival",
    nameAr: "مهرجان ليالي مسقط",
    description: "Muscat Nights is one of the largest and most popular annual festivals in the Sultanate of Oman. It features entertainment shows, cultural activities, traditional crafts, food courts, games, and family-friendly events. The festival takes place at multiple locations across Muscat with various branches offering unique experiences.",
    descriptionAr: "ليالي مسقط هو أحد أكبر وأشهر المهرجانات السنوية في سلطنة عُمان. يتضمن عروضاً ترفيهية وأنشطة ثقافية وحرف تقليدية ومناطق للأطعمة وألعاب وفعاليات عائلية متنوعة. يُقام المهرجان في مواقع متعددة في مسقط مع فروع مختلفة تقدم تجارب فريدة.",
    location: "مواقع متعددة، محافظة مسقط",
    region: "محافظة مسقط",
    duration: "يناير - فبراير",
    price: "دخول مجاني",
    image: muscatNightsImg,
    rating: 4.8,
    includes: ["عروض ترفيهية", "أنشطة ثقافية", "حرف تقليدية", "مناطق طعام", "ألعاب للأطفال"],
    branches: [
      { name: "Qurum Natural Park", nameAr: "فرع متنزه القرم الطبيعي", mapUrl: "https://maps.app.goo.gl/D72Fu6tEnpsD35aE7" },
      { name: "Royal Opera House", nameAr: "فرع دار الأوبرا السلطانية", mapUrl: "https://maps.app.goo.gl/bQckzMTczwfawfSQ7" },
      { name: "Wadi Al Khoud", nameAr: "فرع وادي الخوض", mapUrl: "https://maps.app.goo.gl/3Zbn8LnwCetre5Ue7" },
      { name: "Sur Al Hadid", nameAr: "فرع سور الحديد", mapUrl: "https://maps.app.goo.gl/qPP7U14noVcZvH3C6" },
      { name: "Quriyat", nameAr: "فرع قريات", mapUrl: "https://maps.app.goo.gl/PjULcAecnnjDDDQP9" },
      { name: "Al Amarat Park", nameAr: "فرع متنزه العامرات", mapUrl: "https://maps.app.goo.gl/Kbr31kLwSWUVoTEFA" },
      { name: "Oman Automobile Association", nameAr: "فرع الجمعية العمانية للسيارات", mapUrl: "https://maps.app.goo.gl/xSnmAPjdGaTK1un6A" },
    ],
  },
  {
    id: "pottery-nizwa",
    name: "Pottery Making in Nizwa",
    nameAr: "صناعة الفخار في نزوى",
    description: "Experience the ancient art of pottery making in Nizwa, one of Oman's most historic cities. Learn traditional techniques from local artisans and create your own pottery pieces. This hands-on activity offers a unique glimpse into Omani heritage and craftsmanship.",
    descriptionAr: "استمتع بتجربة فن صناعة الفخار العريق في نزوى، إحدى أعرق المدن العُمانية. تعلّم التقنيات التقليدية من الحرفيين المحليين وصنع قطع الفخار الخاصة بك. هذا النشاط العملي يوفر لمحة فريدة عن التراث والحرف اليدوية العُمانية.",
    location: "نزوى، محافظة الداخلية",
    region: "محافظة الداخلية",
    duration: "2-3 ساعات",
    price: "1-5 ر.ع",
    image: potteryNizwaImg,
    rating: 4.7,
    includes: ["تعليم صناعة الفخار", "المواد الخام", "قطعة تذكارية", "مرشد محلي"],
    mapUrl: "https://maps.app.goo.gl/vBGZoVLbdZRFiC8U7",
  },
  {
    id: "musandam-zipline",
    name: "Musandam Zip Line",
    nameAr: "زيب لاين مسندم",
    description: "The longest over-water free-flight zipline in the world, Guinness World Record holder. The journey spans 1,800 meters, launching from Jebel Fit and passing over the crystal-clear waters of the Strait of Hormuz to reach Atana Khasab Hotel. Speeds reach up to 80 km/h, giving you a true flying sensation over the sea. Operated by Oman Adventures.",
    descriptionAr: "هو أطول مسار انزلاق حر فوق الماء في العالم، وحاصل على رقم قياسي من موسوعة غينيس. تمتد الرحلة لمسافة 1,800 متر، حيث تنطلق من جبل فِت وتمر فوق مياه مضيق هرمز الصافية لتصل إلى فندق أتانا خصب. السرعة تصل إلى 80 كم/ساعة، مما يمنحك شعوراً بالطيران الفعلي فوق البحر. مركز مغامرات عمان.",
    location: "خصب، محافظة مسندم",
    region: "محافظة مسندم",
    duration: "8:30 ص - 4 م يومياً",
    price: "18-25 ر.ع",
    image: musandamZiplineImg,
    rating: 4.9,
    includes: [
      "تذكرة فردية: 18 ر.ع",
      "جولة مزدوجة: 25 ر.ع",
      "مجموعة 10-25: 17 ر.ع/شخص",
      "أكثر من 25: 16 ر.ع/شخص",
      "منصة المشاهدة: 6 ر.ع",
      "خصم 10% لنزلاء فندق أتانا خصب"
    ],
    provider: "مركز مغامرات عمان",
    mapUrl: "https://maps.app.goo.gl/EggGrkij2dtfLx7TA",
  },
  {
    id: "jabal-shams-sunrise",
    name: "Sunrise at Jebel Shams Summit",
    nameAr: "شروق الشمس في قمة جبل شمس",
    description: "Watch a breathtaking sunrise from the highest peak in Oman and the Arabian Gulf, Jebel Shams (over 3,000m). An unforgettable experience overlooking Wadi An Nakhr (Oman's Grand Canyon) as the first rays of light paint the mountains.",
    descriptionAr: "شاهد شروق الشمس الخلاب من أعلى قمة في سلطنة عُمان والخليج العربي، جبل شمس (أكثر من 3,000 متر). تجربة لا تُنسى تُطل على وادي النخر (غراند كانيون عُمان) مع أولى أشعة الضوء التي تُلوّن الجبال.",
    location: "جبل شمس، ولاية الحمراء، محافظة الداخلية",
    region: "محافظة الداخلية",
    duration: "2-3 ساعات (يُنصح بالوصول قبل الفجر)",
    price: "مجاني",
    image: jabalShamsSunriseImg,
    rating: 4.9,
    includes: ["مشاهدة شروق الشمس", "إطلالة على وادي النخر", "مسارات مشي جبلية", "تصوير فوتوغرافي"],
    mapUrl: "https://maps.app.goo.gl/9WcLFuJgGZMbqWmD9",
  },
  {
    id: "rose-picking-jabal-akhdar",
    name: "Rose Picking in Al Jabal Al Akhdar",
    nameAr: "قطف الورود في الجبل الأخضر",
    description: "Join local farmers in the traditional art of picking Damask roses on Al Jabal Al Akhdar during the blooming season (April-May). Learn about the centuries-old process of rose distillation to produce authentic Omani rosewater. Some private farms may charge a small fee or require a purchase.",
    descriptionAr: "شارك المزارعين المحليين في فن قطف الورد الدمشقي التقليدي على الجبل الأخضر خلال موسم الإزهار (أبريل - مايو). تعرّف على عملية تقطير الورد العريقة لإنتاج ماء الورد العُماني الأصيل. بعض المزارع الخاصة قد تطلب رسوماً رمزية أو تشترط الشراء.",
    location: "الجبل الأخضر، محافظة الداخلية",
    region: "محافظة الداخلية",
    duration: "2-4 ساعات",
    price: "مجاني (رسوم رمزية في بعض المزارع)",
    image: rosePickingImg,
    rating: 4.8,
    includes: ["قطف الورد يدوياً", "مشاهدة تقطير ماء الورد", "تذوق ماء الورد الطازج", "شراء منتجات الورد المحلية"],
    mapUrl: "https://maps.app.goo.gl/Mr2WNUGqrKiANERw6",
  },
  {
    id: "shooting-action-point",
    name: "Shooting at Action Point - Oman Shooting Club",
    nameAr: "الرماية في أكشن بوينت - نادي عُمان للرماية",
    description: "Experience professional shooting at Action Point within Active Oman Center at the Oman Automobile Association in Airport Heights. Choose from multiple packages: Trigger Reward (45 OMR), Shooter's Delight (45 OMR), Power Bundle (50 OMR), or Ultimate Deal (70 OMR) covering pistols, rifles, and shotguns. Open daily 9 AM - 11 PM.",
    descriptionAr: "استمتع بتجربة رماية احترافية في أكشن بوينت ضمن مركز أكتيف عُمان بمقر الجمعية العُمانية للسيارات في مرتفعات المطار. اختر من عدة باقات: مكافأة الزناد (45 ر.ع)، متعة الرماة (45 ر.ع)، حزمة الطاقة (50 ر.ع)، أو الصفقة النهائية (70 ر.ع) تشمل المسدسات والبنادق والشوزن. مفتوح يومياً 9:00 ص - 11:00 م.",
    location: "مرتفعات المطار، ولاية السيب، محافظة مسقط",
    region: "محافظة مسقط",
    duration: "1-2 ساعة",
    price: "45-70 ر.ع",
    image: actionPointImg,
    rating: 4.7,
    includes: ["معدات السلامة", "إشراف مدربين محترفين", "ذخيرة حسب الباقة", "أسلحة متنوعة (مسدس، بندقية، شوزن)"],
    mapUrl: "https://maps.app.goo.gl/Gj39JJ67Z7T4rKAA8",
  },
];
