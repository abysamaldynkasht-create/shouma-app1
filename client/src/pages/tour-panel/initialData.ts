import { GuideApplication, SupportTicket, TripBooking, OfficeConfig } from './types';

export const INITIAL_APPLICATIONS: GuideApplication[] = [
  {
    id: 'app-1',
    name: 'سالم بن ناصر العامري',
    age: 29,
    phone: '+968 9123 4567',
    email: 'salim.alamri@shouma.om',
    nationality: 'عماني',
    governorate: 'مسقط',
    languages: ['العربية', 'الإنجليزية'],
    description: 'مرشد سياحي معتمد متخصص في المواقع التراثية والمسارات الجبلية.',
    status: 'approved',
    submittedAt: '2025-01-15',
  },
  {
    id: 'app-2',
    name: 'مريم بنت عبدالله البلوشية',
    age: 26,
    phone: '+968 9876 5432',
    email: 'maryam.balushi@shouma.om',
    nationality: 'عمانية',
    governorate: 'الداخلية',
    languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
    description: 'شغوفة بسرد تاريخ القلاع والحصون في نزوى وبهلاء وسوق نزوى.',
    status: 'pending',
    submittedAt: '2025-02-10',
  }
];

export const INITIAL_TRIPS: TripBooking[] = [
  {
    id: 'trip-101',
    touristName: 'سارة جونسون (Sarah Johnson)',
    destination: 'جبل الأخضر ومسفاة العبريين',
    date: '2025-03-15',
    duration: 'يوم كامل (8 ساعات)',
    status: 'assigned',
    price: '65 ر.ع',
    notes: 'العميل يفضل جولة مشي خفيفة والتقاط صور للطبيعة.',
  },
  {
    id: 'trip-102',
    touristName: 'محمد الكعبي',
    destination: 'وادي دربات وشاطئ المغسيل (صلالة)',
    date: '2025-03-20',
    duration: 'نصف يوم (4 ساعات)',
    status: 'accepted',
    price: '45 ر.ع',
    notes: 'عائلة مكونة من 4 أشخاص بحاجة لمرشد خبير بالطرق والينابيع.',
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-1',
    guideName: 'أحمد الحارثي',
    email: 'ahmed@example.com',
    subject: 'تحديث بيانات الحساب البنكي',
    message: 'أرغب في تحديث رقم حسابي ببنك مسقط لاستلام مستحقات الجولات مباشرة.',
    status: 'answered',
    reply: 'تم اعتماد وتحديث الحساب البنكي بنجاح في سجلات المالية.',
    createdAt: '2025-02-01',
  },
  {
    id: 'ticket-2',
    guideName: 'فاطمة الكندية',
    email: 'fatima@example.com',
    subject: 'طلب تصريح لدخول محمية جبل سمحان',
    message: 'لدي وفد سياحي الأسبوع القادم ونحتاج تنسيق تصريح دخول المحمية.',
    status: 'open',
    createdAt: '2025-02-18',
  }
];

export const DEFAULT_OFFICE: OfficeConfig = {
  name: 'المكتب الرئيسي - منصة شومة السياحية',
  address: 'مجمع العريمي بوليفارد، الخوض، مسقط، سلطنة عُمان',
  phone: '+968 2400 0000',
  workingHours: 'من الأحد إلى الخميس: 8:00 صباحاً - 5:00 مساءً',
  mapEmbedUrl: 'https://maps.google.com/?q=Muscat,Oman',
};
