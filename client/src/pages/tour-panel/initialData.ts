import { GuideApplication, SupportTicket, OfficeConfig, TripBooking } from './types';

export const INITIAL_APPLICATIONS: GuideApplication[] = [
  {
    id: 'app-1',
    name: 'سالم بن عبدالله الكندي',
    age: 28,
    phone: '+968 99123456',
    email: 'salim.kindi@gmail.com',
    nationality: 'عماني',
    governorate: 'الداخلية (نزوى)',
    languages: ['العربية', 'الإنجليزية'],
    description: 'مرشد سياحي مرخص بخبرة تزيد عن 4 كسنوات في جبال عمان وحصونها التاريخية. شغوف بنقل مغامرات وديان عمان للسياح.',
    status: 'pending',
    submittedAt: '2026-05-19T08:30:00Z',
  },
  {
    id: 'app-2',
    name: 'مريم بنت علي الشعيبية',
    age: 25,
    phone: '+968 95887766',
    email: 'maryam.sh@outlook.com',
    nationality: 'عمانية',
    governorate: 'مسقط',
    languages: ['العربية', 'الإنجليزية', 'الألمانية'],
    description: 'متخصصة في السياحة البيئية والشاطئية. أحب تعريف الزوار بثقافتنا كعمانيين وحسن الضيافة العمانية الأصيلة.',
    status: 'approved',
    submittedAt: '2026-05-18T14:15:00Z',
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-1',
    guideName: 'مريم بنت علي الشعيبية',
    email: 'maryam.sh@outlook.com',
    subject: 'طلب شارة مرشد جديدة',
    message: 'مرحباً إدارة شومة الموقرة، أرغب في تقديم طلب للحصول على شارة معدنية جديدة تحمل هويتي السياحية لوضعها أثناء الرحلات القادمة.',
    status: 'answered',
    reply: 'مرحباً مريم، شارتك جاهزة بالفعل! يمكنك استلامها من مكتبنا الرئيسي بالقرم أو سيتم شحنها إليك مع مندوب الرحلة القادمة.',
    createdAt: '2026-05-19T10:00:00Z',
  },
  {
    id: 'ticket-2',
    guideName: 'حمد الحبسي',
    email: 'hamadalhabsi208@gmail.com',
    subject: 'مساعدة في مستندات تفعيل الحساب',
    message: 'السلام عليكم، أود التأكد من تفعيل حسابي كمرشد سياحي حتى أبدأ في استقبال طلبات الرحلات بنجاح.',
    status: 'open',
    createdAt: '2026-05-20T11:20:00Z',
  }
];

export const DEFAULT_OFFICE: OfficeConfig = {
  name: 'مكتب شومة الرئيسي للسياحة والرحلات',
  address: 'سلطنة عمان - مسقط - حي القرم التجاري - بناية شومة، الطابق الأول، مكتب ١٠٤ مقابل حديقة القرم الطبيعية',
  phone: '+968 2456 7890',
  workingHours: 'يومياً من السبت إلى الخميس: 9:00 صباحاً - 6:00 مساءً (الجمعة مغلق)',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.9634732152014!2d58.47271031358934!3d23.6056586326177!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e92019779df3b69%3A0xc3f587d559ab5f9d!2z2KfZhNmC2LHZhQ!5e0!3m2!1sar!2som!4v1716223800000!5m2!1sar!2som'
};

export const INITIAL_TRIPS: TripBooking[] = [
  {
    id: 'trip-1',
    touristName: 'جون سميث وعائلته (٤ أشخاص)',
    destination: 'وادي بني خالد ورمال وهيبة',
    date: '2026-05-25',
    duration: 'يوم كامل (7:00 ص - 8:00 م)',
    status: 'assigned',
    price: '٨٠ ر.ع',
    notes: 'الزوار مهتمون جداً بالتصوير الفوتوغرافي وتجربة المأكولات العمانية التقليدية وقت الغداء.',
  },
  {
    id: 'trip-2',
    touristName: 'سارة لوران (شخصين)',
    destination: 'جولة معالم مسقط التاريخية (جامع السلطان قابوس الأكبر - سوق مطرح - قصر العلم)',
    date: '2026-05-28',
    duration: 'نصف يوم (8:00 ص - 1:00 م)',
    status: 'accepted',
    price: '٤٥ ر.ع',
    notes: 'تحتاج السائحة إلى شرح مفصل باللغة الإنجليزية وعن العادات والتقاليد العمانية.',
  }
];
