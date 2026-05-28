import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Settings, MapPin, ClipboardList, Send, Check, X, Grid, Edit,
  MapPinOff, Landmark, Compass, HelpCircle, Phone, Clock, Plus, Trash2, Users,
  Film, Image as ImageIcon, UploadCloud, Copy, FileVideo, Eye, RefreshCw, 
  Megaphone, Building, ShieldAlert, CheckCircle2, ChevronRight, ExternalLink,
  DollarSign, FileText, Download, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Import static app data to sync into admin panel
import { hotels as staticHotels } from '@/lib/hotels';
import { attractions as staticAttractions } from '@/lib/attractions';
import { restaurants as staticRestaurants } from '@/lib/restaurants';
import { tourGuides as staticGuides } from '@/lib/tour-guides';

interface GuideApplication {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  nationality: string;
  governorate: string;
  languages: string[];
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface SupportTicket {
  id: string;
  guideName: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'answered';
  reply?: string;
  createdAt: string;
}

interface OfficeConfig {
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  mapEmbedUrl: string;
}

interface TripBooking {
  id: string;
  touristName: string;
  destination: string;
  date: string;
  duration: string;
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
  price: string;
  notes?: string;
}

export default function AdminPanelOne() {
  const { isRTL } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Tab states: 'dashboard' | 'applications' | 'announcements' | 'guides' | 'attractions' | 'accommodations' | 'trips' | 'support' | 'media' | 'hq'
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'applications' | 'announcements' | 'guides' | 'attractions' | 'accommodations' | 'trips' | 'support' | 'media' | 'hq'
  >('dashboard');

  // Loaded database items
  const [applications, setApplications] = useState<GuideApplication[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [trips, setTrips] = useState<TripBooking[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [office, setOffice] = useState<OfficeConfig>({
    name: 'مكتب شومة الرئيسي للسياحة والرحلات',
    address: 'سلطنة عمان - مسقط - حي القرم التجاري',
    phone: '+968 2456 7890',
    workingHours: 'يومياً من السبت إلى الخميس: 9:00 صباحاً - 6:00 مساءً',
    mapEmbedUrl: ''
  });

  // Loading, success & action states
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Adding states
  // Announcement
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annIsActive, setAnnIsActive] = useState(true);

  // Tour Guide properties
  const [editingGuideId, setEditingGuideId] = useState<any | null>(null);
  const [gName, setGName] = useState('');
  const [gNameAr, setGNameAr] = useState('');
  const [gSpec, setGSpec] = useState('Adventure & Hiking');
  const [gSpecAr, setGSpecAr] = useState('مغامرات ومسير جبلي');
  const [gCity, setGCity] = useState('مسقط');
  const [gExp, setGExp] = useState('3');
  const [gDesc, setGDesc] = useState('');
  const [gPhone, setGPhone] = useState('');
  const [gWhatsapp, setGWhatsapp] = useState('');
  const [gPrice, setGPrice] = useState('40');
  const [gImageUrl, setGImageUrl] = useState('');
  const [gLanguages, setGLanguages] = useState<string[]>(['العربية', 'الإنجليزية']);
  const [gEmail, setGEmail] = useState('');
  const [gPassword, setGPassword] = useState('shouma2026');
  const [gAdditionalImages, setGAdditionalImages] = useState('');
  const [gBankAccount, setGBankAccount] = useState('');

  // Attraction properties
  const [attrName, setAttrName] = useState('');
  const [attrNameAr, setAttrNameAr] = useState('');
  const [attrDesc, setAttrDesc] = useState('');
  const [attrGov, setAttrGov] = useState('الداخلية');
  const [attrGovId, setAttrGovId] = useState('dakhiliyah');
  const [attrWilayat, setAttrWilayat] = useState('');
  const [attrCategory, setAttrCategory] = useState('nature');
  const [attrImage, setAttrImage] = useState('');
  const [attrMapUrl, setAttrMapUrl] = useState('');
  const [attrAdditionalImages, setAttrAdditionalImages] = useState('');

  // Accommodation/Restaurant details
  const [accType, setAccType] = useState<'hotel' | 'restaurant'>('hotel');
  const [accName, setAccName] = useState('');
  const [accNameAr, setAccNameAr] = useState('');
  const [accDesc, setAccDesc] = useState('');
  const [accCity, setAccCity] = useState('مسقط');
  const [accRegion, setAccRegion] = useState('');
  const [accImage, setAccImage] = useState('');
  const [accPhone, setAccPhone] = useState('');
  const [accRating, setAccRating] = useState('4.8');
  const [accAdditionalImages, setAccAdditionalImages] = useState('');
  const [accBankAccount, setAccBankAccount] = useState('');
  const [accAmenities, setAccAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  // Data synchronization state
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, label: '' });

  // Tour Guide services tags
  const [gServices, setGServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');

  // Attraction tags
  const [attrTags, setAttrTags] = useState<string[]>([]);
  const [newAttrTag, setNewAttrTag] = useState('');

  // Trip badges
  const [tripBadges, setTripBadges] = useState<string[]>([]);
  const [newTripBadge, setNewTripBadge] = useState('');
  // Hotel exclusive
  const [hotPrice, setHotPrice] = useState('45');
  const [hotStars, setHotStars] = useState('4');
  // Restaurant exclusive
  const [resCuisine, setResCuisine] = useState('عماني تقليدي');
  const [resPriceRange, setResPriceRange] = useState('moderate');

  // Custom Trip Properties
  const [tripTourist, setTripTourist] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [tripDuration, setTripDuration] = useState('يوم كامل');
  const [tripPrice, setTripPrice] = useState('٥٠ ر.ع');
  const [tripNotes, setTripNotes] = useState('');

  // Ticket Reply Input state
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});

  // Media upload input
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fast Toast/Message notification banner helper
  const triggerNotification = (msg: string, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  // Restore authenticated status on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('shouma_superadmin_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all resources when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const loadApplications = fetch('/api/applications').then(r => r.json());
      const loadOffice = fetch('/api/office').then(r => r.json());
      const loadTrips = fetch('/api/trips').then(r => r.json());
      const loadTickets = fetch('/api/tickets').then(r => r.json());
      const loadGuides = fetch('/api/local-tour-guides').then(r => r.json());
      const loadAnnouncements = fetch('/api/announcements/latest')
        .then(r => r.json())
        .catch(() => null);
      const loadAttractions = fetch('/api/catalog/attractions').then(r => r.json());
      const loadHotels = fetch('/api/catalog/hotels').then(r => r.json());
      const loadRestaurants = fetch('/api/catalog/restaurants').then(r => r.json());
      const loadMedia = fetch('/api/media-assets').then(r => r.json());

      const [apps, off, trps, tckts, gds, latestAnn, attrs, htls, rsts, media] = await Promise.all([
        loadApplications, loadOffice, loadTrips, loadTickets, loadGuides, loadAnnouncements, loadAttractions, loadHotels, loadRestaurants, loadMedia
      ]);

      if (Array.isArray(apps)) setApplications(apps);
      if (off && off.name) setOffice(off);
      if (Array.isArray(trps)) setTrips(trps);
      if (Array.isArray(tckts)) setTickets(tckts);
      if (Array.isArray(gds)) {
        const dbNames = new Set(gds.map(g => (g.name_ar || g.nameAr || g.name || '').trim()));
        const normalizedStaticGuides = staticGuides
          .filter(g => !dbNames.has((g.nameAr || g.name || '').trim()))
          .map(g => ({
            ...g,
            id: `static-${g.id}`,
            name_ar: g.nameAr || g.name,
            price_per_day: g.pricePerDay,
            image_url: g.image,
            is_static: true
          }));
        setGuides([...normalizedStaticGuides, ...gds]);
      }
      if (latestAnn) setAnnouncements([latestAnn]);
      if (Array.isArray(attrs)) {
        const dbNames = new Set(attrs.map(a => (a.name_ar || a.nameAr || a.name || '').trim()));
        const normalizedStaticAttrs = staticAttractions
          .filter(a => !dbNames.has((a.nameAr || a.name || '').trim()))
          .map(a => ({
            ...a,
            id: `static-${a.id}`,
            name_ar: a.nameAr || a.name,
            is_static: true
          }));
        setAttractions([...normalizedStaticAttrs, ...attrs]);
      }
      if (Array.isArray(htls)) {
        const dbNames = new Set(htls.map(h => (h.name_ar || h.nameAr || h.name || '').trim()));
        const normalizedStaticHotels = staticHotels
          .filter(h => !dbNames.has((h.nameAr || h.name || '').trim()))
          .map(h => ({
            ...h,
            id: `static-${h.id}`,
            name_ar: h.nameAr || h.name,
            price_per_night: h.pricePerNight,
            is_static: true
          }));
        setHotels([...normalizedStaticHotels, ...htls]);
      }
      if (Array.isArray(rsts)) {
        const dbNames = new Set(rsts.map(r => (r.name_ar || r.nameAr || r.name || '').trim()));
        const normalizedStaticRsts = staticRestaurants
          .filter(r => !dbNames.has((r.nameAr || r.name || '').trim()))
          .map(r => ({
            ...r,
            id: `static-${r.id}`,
            name_ar: r.nameAr || r.name,
            price_range: r.priceRange,
            is_static: true
          }));
        setRestaurants([...normalizedStaticRsts, ...rsts]);
      }
      if (Array.isArray(media)) setMediaAssets(media);

    } catch (err) {
      console.error("Super Admin error loading data:", err);
      triggerNotification("حدث خطأ في جلب بيانات لوحة التحكم من المخدم الداخلي.", true);
    } finally {
      setIsLoading(false);
    }
  };

  // Computed unsynced counts and items
  const unsyncedHotels = React.useMemo(() => {
    return staticHotels.filter(sh => {
      const normalizedName = (sh.nameAr || sh.name || '').trim();
      return !hotels.some(dh => !dh.is_static && ((dh.name_ar || dh.nameAr || dh.name || '').trim() === normalizedName));
    });
  }, [hotels]);

  const unsyncedAttractions = React.useMemo(() => {
    return staticAttractions.filter(sa => {
      const normalizedName = (sa.nameAr || sa.name || '').trim();
      return !attractions.some(da => !da.is_static && ((da.name_ar || da.nameAr || da.name || '').trim() === normalizedName));
    });
  }, [attractions]);

  const unsyncedRestaurants = React.useMemo(() => {
    return staticRestaurants.filter(sr => {
      const normalizedName = (sr.nameAr || sr.name || '').trim();
      return !restaurants.some(dr => !dr.is_static && ((dr.name_ar || dr.nameAr || dr.name || '').trim() === normalizedName));
    });
  }, [restaurants]);

  const unsyncedGuides = React.useMemo(() => {
    return staticGuides.filter(sg => {
      const normalizedName = (sg.nameAr || sg.name || '').trim();
      return !guides.some(dg => !dg.is_static && ((dg.name_ar || dg.nameAr || dg.name || '').trim() === normalizedName || (dg.phone || '').trim() === (sg.phone || '').trim()));
    });
  }, [guides]);

  const handleDatabaseSync = async () => {
    if (syncing) return;
    setSyncing(true);
    triggerNotification("بدء عملية المزامنة الشاملة لكافة البيانات إلى قاعدة البيانات الاستكشافية الكبرى...");

    const totalToSync = unsyncedHotels.length + unsyncedAttractions.length + unsyncedRestaurants.length + unsyncedGuides.length;
    let syncedCount = 0;

    try {
      // 1. Sync Hotels
      for (const h of unsyncedHotels) {
        setSyncProgress({
          current: syncedCount,
          total: totalToSync,
          label: `مزامنة الفندق: ${h.nameAr || h.name}`
        });
        const body = {
          name: h.name,
          nameAr: h.nameAr || h.name,
          description: h.description || h.descriptionEn || "إقامة مميزة بتصاميم رائعة.",
          city: h.city || "مسقط",
          region: h.region || "مسقط",
          image: h.image || "",
          rating: parseFloat(String(h.rating)) || 4.8,
          pricePerNight: parseInt(String(h.pricePerNight), 10) || 50,
          stars: parseInt(String(h.stars), 10) || 4,
          phone: h.phone || "+968 2444 5555",
          mapUrl: h.mapUrl || "https://www.google.com/maps",
          additionalImages: h.additionalImages || h.gallery?.join(',') || '',
          bankAccount: h.bankAccount || '',
          amenities: h.amenities || []
        };
        await fetch('/api/catalog/hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        syncedCount++;
      }

      // 2. Sync Attractions
      for (const a of unsyncedAttractions) {
        setSyncProgress({
          current: syncedCount,
          total: totalToSync,
          label: `مزامنة المعلم السياحي: ${a.nameAr || a.name}`
        });
        const body = {
          name: a.name,
          nameAr: a.nameAr || a.name,
          description: a.description || a.descriptionEn || "معلم سياحي من معالم سلطنة عمان الرائعة.",
          governorate: a.governorate || "مسقط",
          governorateId: a.governorateId || "muscat",
          wilayat: a.wilayat || "مسقط",
          category: a.category || "nature",
          image: a.image || "",
          mapUrl: a.mapUrl || "https://www.google.com/maps",
          rating: String(a.rating || '4.8'),
          additionalImages: a.additionalImages || '',
          tags: a.tags || []
        };
        await fetch('/api/catalog/attractions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        syncedCount++;
      }

      // 3. Sync Restaurants
      for (const r of unsyncedRestaurants) {
        setSyncProgress({
          current: syncedCount,
          total: totalToSync,
          label: `مزامنة المطعم الشريك: ${r.nameAr || r.name}`
        });
        const body = {
          name: r.name,
          nameAr: r.nameAr || r.name,
          description: r.description || "مطعم متميز لتقديم أشهى المأكولات في سلطنة عمان.",
          city: r.city || "مسقط",
          region: r.region || "مسقط",
          image: r.image || "",
          cuisine: r.cuisine || "عماني",
          priceRange: r.priceRange || 'moderate',
          rating: parseFloat(String(r.rating)) || 4.7,
          features: r.features || [],
          mapUrl: r.mapUrl || "https://www.google.com/maps",
          additionalImages: r.additionalImages || ''
        };
        await fetch('/api/catalog/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        syncedCount++;
      }

      // 4. Sync Tour Guides
      for (const g of unsyncedGuides) {
        setSyncProgress({
          current: syncedCount,
          total: totalToSync,
          label: `مزامنة المرشد: ${g.nameAr || g.name}`
        });
        const body = {
          name: g.name,
          nameAr: g.nameAr || g.name,
          specialization: g.specialization || "General Tours",
          specializationAr: g.specializationAr || g.nameAr || "جولات عامة وشاملة",
          languages: g.languages || [],
          experience: parseInt(String(g.experience), 10) || 5,
          city: g.city || "مسقط",
          description: g.description || "مرشد سياحي مرخص معتمد.",
          imageUrl: g.image || "",
          phone: g.phone || "+968 9111 2222",
          whatsapp: g.whatsapp || "+968 9111 2222",
          pricePerDay: parseInt(String(g.pricePerDay), 10) || 45,
          services: g.services || [],
          email: `${g.id || Math.floor(Math.random()*100000)}@shouma.com`,
          password: 'shouma2026',
          additionalImages: '',
          bank_account: ''
        };
        await fetch('/api/local-tour-guides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        syncedCount++;
      }

      setSyncProgress({ current: totalToSync, total: totalToSync, label: 'اكتملت المزامنة بالكامل بنجاح!' });
      triggerNotification("الحمد لله، تم مزامنة وحفظ كافة البيانات بنجاح تام في قاعدة البيانات الشاملة!");
      fetchAllData();
    } catch (err) {
      console.error("Sync error:", err);
      triggerNotification("حدث خطأ أثناء المزامنة، يرجى المحاولة لاحقاً.", true);
    } finally {
      setTimeout(() => {
        setSyncing(false);
        setSyncProgress({ current: 0, total: 0, label: '' });
      }, 3000);
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (passwordInput === 'shouma2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('shouma_superadmin_auth', 'true');
    } else {
      setLoginError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('shouma_superadmin_auth');
  };

  // --- ACTIONS ---

  // 1. Applications Approved/Rejected
  const handleUpdateAppStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: updated.status } : a));
        triggerNotification(`تم تحديث حالة الطلب بنجاح إلى: ${status === 'approved' ? 'مقبول' : 'مرفوض'}`);
      }
    } catch (err) {
      triggerNotification("خفق في تحديث حالة الطلب.", true);
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا طلب الانتساب نهائياً؟")) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== id));
        triggerNotification("تم حذف الطلب بنجاح.");
      }
    } catch (err) {
      triggerNotification("حدث خطأ أثناء حذف طلب الانتساب.", true);
    }
  };

  // 2. Announcements
  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annMessage) {
      triggerNotification("يرجى تعبئة جميع حقول الإعلان الموجه للمرشدين", true);
      return;
    }
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: annTitle, message: annMessage, isActive: annIsActive })
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements([data]);
        setAnnTitle('');
        setAnnMessage('');
        triggerNotification("تم نشر وتعميم الإعلان لجميع المرشدين في التطبيق بنجاح!");
      }
    } catch (err) {
      triggerNotification("فشل الإرسال والربط مع المخدم.", true);
    }
  };

  // 3. Tour Guides
  const clearGuideForm = () => {
    setGName('');
    setGNameAr('');
    setGDesc('');
    setGPhone('');
    setGWhatsapp('');
    setGImageUrl('');
    setGEmail('');
    setGPassword('shouma2026');
    setGAdditionalImages('');
    setGBankAccount('');
    setGServices([]);
    setEditingGuideId(null);
  };

  const handleEditClick = (guide: any) => {
    setEditingGuideId(guide.id);
    setGName(guide.name || '');
    setGNameAr(guide.name_ar || guide.nameAr || guide.name || '');
    setGSpec(guide.specialization || 'Adventure & Hiking');
    setGSpecAr(guide.specialization_ar || guide.specializationAr || guide.specialization || 'مغامرات ومسير جبلي');
    setGCity(guide.city || 'مسقط');
    setGExp(String(guide.experience || '3'));
    setGDesc(guide.description || '');
    setGPhone(guide.phone || '');
    setGWhatsapp(guide.whatsapp || '');
    setGPrice(String(guide.price_per_day || guide.pricePerDay || '40'));
    setGImageUrl(guide.image_url || guide.imageUrl || '');
    setGEmail(guide.email || '');
    setGPassword(guide.password || 'shouma2026');
    setGAdditionalImages(guide.additional_images || guide.additionalImages || '');
    setGBankAccount(guide.bank_account || guide.bankAccount || '');
    setGServices(Array.isArray(guide.services) ? guide.services : []);
    
    // Scroll smoothly to guide form
    const element = document.getElementById('gN');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.focus();
    }
  };

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName || !gNameAr || !gPhone) {
      triggerNotification("اسم المرشد ورقم هاتفه مطلوب كحد أدنى", true);
      return;
    }
    const guideBody = {
      name: gName,
      nameAr: gNameAr,
      specialization: gSpec,
      specializationAr: gSpecAr,
      city: gCity,
      experience: gExp,
      description: gDesc || "مرشد سياحي مرخص ومحترف بجمهورية عمان الاستكشافية.",
      phone: gPhone,
      whatsapp: gWhatsapp || gPhone,
      pricePerDay: parseInt(gPrice, 10) || 45,
      imageUrl: gImageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      languages: gLanguages,
      rating: "4.9",
      reviewsCount: 16,
      availability: true,
      email: gEmail || `${gName.toLowerCase().replace(/\s+/g, '')}@shouma.com`,
      password: gPassword || 'shouma2026',
      additionalImages: gAdditionalImages,
      bankAccount: gBankAccount,
      services: gServices
    };

    try {
      if (editingGuideId) {
        const res = await fetch(`/api/local-tour-guides/${editingGuideId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guideBody)
        });
        if (res.ok) {
          const updated = await res.json();
          // Update guides list, keeping is_static or any other flag if local was marked
          setGuides(prev => prev.map(g => g.id === editingGuideId ? { ...g, ...updated } : g));
          clearGuideForm();
          triggerNotification("تم تحديث بيانات المرشد بنجاح في قاعدة البيانات!");
        } else {
          triggerNotification("فشل تحديث بيانات المرشد.", true);
        }
      } else {
        const res = await fetch('/api/local-tour-guides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guideBody)
        });
        if (res.ok) {
          const created = await res.json();
          setGuides(prev => [created, ...prev]);
          clearGuideForm();
          triggerNotification("تم إضافة المرشد الجديد في قاعدة بيانات شومة الاستكشافية الكبرى، وتم إنشاء حساب تلقائي له في لوحة تحكم المرشدين بنفس البريد وكلمة المرور!");
        } else {
          triggerNotification("فشل إضافة المرشد.", true);
        }
      }
    } catch (err) {
      triggerNotification("فشل العملية والاتصال بالخادم.", true);
    }
  };

  const handleDeleteGuide = async (id: any) => {
    if (String(id).startsWith('static-')) {
      setGuides(prev => prev.filter(g => g.id !== id));
      triggerNotification("تم إخفاء المرشد النظامي من لوحة التحكم لتيسير إدارتك.");
      return;
    }
    if (!window.confirm("هل ترغب في سحب رخصة وحذف هذا المرشد من التطبيق بشكل دائم؟")) return;
    try {
      const res = await fetch(`/api/local-tour-guides/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGuides(prev => prev.filter(g => g.id !== id));
        triggerNotification("تم حذف المرشد وإبطال تفعيله بالموقع بنجاح.");
      }
    } catch (err) {
      triggerNotification("خطأ في حذف المرشد.", true);
    }
  };

  // 4. Attractions
  const handleAttractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName || !attrNameAr || !attrWilayat) {
      triggerNotification("اسم المعلم باللغتين والولاية حقول إلزامية", true);
      return;
    }
    const body = {
      name: attrName,
      nameAr: attrNameAr,
      description: attrDesc || "موقع ومعلم سياحي وطبيعي خلاب مميز بأجواء عُمان الطبيعية وحضارتها الشامخة.",
      governorate: attrGov,
      governorateId: attrGovId,
      wilayat: attrWilayat,
      category: attrCategory,
      image: attrImage || "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=800&q=80",
      mapUrl: attrMapUrl || `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1828.5!2d58.4!3d23.6`,
      additionalImages: attrAdditionalImages,
      tags: attrTags
    };

    try {
      const res = await fetch('/api/catalog/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const created = await res.json();
        setAttractions(prev => [created, ...prev]);
        setAttrName('');
        setAttrNameAr('');
        setAttrDesc('');
        setAttrWilayat('');
        setAttrImage('');
        setAttrMapUrl('');
        setAttrAdditionalImages('');
        setAttrTags([]);
        triggerNotification("تم إدراج المعلم السياحي بنجاح في كتالوج الموقع!");
      }
    } catch (err) {
      triggerNotification("فشل إدراج المعلم.", true);
    }
  };

  const handleDeleteAttraction = async (id: any) => {
    if (String(id).startsWith('static-')) {
      setAttractions(prev => prev.filter(a => a.id !== id));
      triggerNotification("تم إخفاء هذا المعلم الافتراضي للنظام مؤقتاً لتسهيل العرض.");
      return;
    }
    try {
      const res = await fetch(`/api/catalog/attractions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAttractions(prev => prev.filter(a => a.id !== id));
        triggerNotification("تم حذف المعلم السياحي بنجاح.");
      }
    } catch (err) {
      triggerNotification("فشل في حذف هذا المعلم.", true);
    }
  };

  // 5. Accommodations (Hotels & Restaurants)
  const handleAccSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName || !accNameAr || !accRegion) {
      triggerNotification("يرجى ملء الاسم والموقع الإقليمي لخدمة الإقامة/الضيافة", true);
      return;
    }

    if (accType === 'hotel') {
      const body = {
        name: accName,
        nameAr: accNameAr,
        description: accDesc || "إقامة وبناء فاخر مميز بتصاميم مستوحاة من العراقة العمانية الفاخرة.",
        city: accCity,
        region: accRegion,
        image: accImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        rating: parseFloat(accRating) || 4.8,
        pricePerNight: parseInt(hotPrice, 10) || 50,
        stars: parseInt(hotStars, 10) || 4,
        phone: accPhone || "+968 2444 5555",
        mapUrl: `https://www.google.com/maps`,
        additionalImages: accAdditionalImages,
        bankAccount: accBankAccount,
        amenities: accAmenities
      };
      try {
        const res = await fetch('/api/catalog/hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const created = await res.json();
          setHotels(prev => [created, ...prev]);
          setAccName('');
          setAccNameAr('');
          setAccDesc('');
          setAccRegion('');
          setAccImage('');
          setAccPhone('');
          setAccAdditionalImages('');
          setAccBankAccount('');
          setAccAmenities([]);
          triggerNotification("تم إدراج الفندق الفاخر بنجاح في خيارات التطبيق العام!");
        }
      } catch (err) {
        triggerNotification("خطأ في إضافة الفندق.", true);
      }
    } else {
      const body = {
        name: accName,
        nameAr: accNameAr,
        description: accDesc || "مطعم عماني أصيل ومحضرة مأكولاته على الطريقة التقليدية اليدوية.",
        city: accCity,
        region: accRegion,
        image: accImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        cuisine: resCuisine,
        priceRange: resPriceRange,
        rating: parseFloat(accRating) || 4.7,
        features: accAmenities.length > 0 ? accAmenities : ["بوفيه مفتوح", "جلسات عائلية مغلقة", "شاي كرك مجاني"],
        mapUrl: `https://www.google.com/maps`,
        additionalImages: accAdditionalImages
      };
      try {
        const res = await fetch('/api/catalog/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const created = await res.json();
          setRestaurants(prev => [created, ...prev]);
          setAccName('');
          setAccNameAr('');
          setAccDesc('');
          setAccRegion('');
          setAccImage('');
          setAccPhone('');
          setAccAdditionalImages('');
          setAccAmenities([]);
          triggerNotification("تم إضافة المطعم بنجاح إلى شبكة شركاء الأطعمة!");
        }
      } catch (err) {
        triggerNotification("خطأ في إضافة المطعم.", true);
      }
    }
  };

  const handleDeleteHotel = async (id: any) => {
    if (String(id).startsWith('static-')) {
      setHotels(prev => prev.filter(h => h.id !== id));
      triggerNotification("تم إخفاء الفندق الافتراضي المدمج نظاماً مؤقتاً.");
      return;
    }
    try {
      const res = await fetch(`/api/catalog/hotels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHotels(prev => prev.filter(h => h.id !== id));
        triggerNotification("تم حذف خيار الفندق بنجاح.");
      }
    } catch (e) {
      triggerNotification("فشل الحذف.", true);
    }
  };

  const handleDeleteRestaurant = async (id: any) => {
    if (String(id).startsWith('static-')) {
      setRestaurants(prev => prev.filter(r => r.id !== id));
      triggerNotification("تم إخفاء المطعم الافتراضي الترويجي مؤقتاً.");
      return;
    }
    try {
      const res = await fetch(`/api/catalog/restaurants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRestaurants(prev => prev.filter(r => r.id !== id));
        triggerNotification("تم إلغاء وحذف المطعم بنجاح من القائمة.");
      }
    } catch (e) {
      triggerNotification("فشل الحذف.", true);
    }
  };

  // 6. Trips Dispatches
  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTourist || !tripDestination || !tripDate) {
      triggerNotification("اسم الزائر والوجهة المطلوبة حقول ضرورية", true);
      return;
    }
    const body = {
      touristName: tripTourist,
      destination: tripDestination,
      date: tripDate,
      duration: tripDuration,
      price: tripPrice,
      notes: tripNotes,
      badges: tripBadges
    };

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const created = await res.json();
        setTrips(prev => [created, ...prev]);
        setTripTourist('');
        setTripDestination('');
        setTripDate('');
        setTripDuration('يوم كامل');
        setTripNotes('');
        setTripBadges([]);
        triggerNotification("تم تعميم طلب الرحلة والمسار السياحي للمرشدين بنجاح!");
      }
    } catch (err) {
      triggerNotification("فشل تعميم الرحلة.", true);
    }
  };

  const handleUpdateTripState = async (id: string, newStatus: any) => {
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTrips(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        triggerNotification(`تم تحديث مسار جولة السائح بنجاح إلى: ${newStatus}`);
      }
    } catch (e) {
      triggerNotification("فشل تحديث الجولة.", true);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!window.confirm("هل ترغب في مسح جولة السائح هذه من المنصة نهائياً؟")) return;
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTrips(prev => prev.filter(t => t.id !== id));
        triggerNotification("تم مسح الرحلة بنجاح.");
      }
    } catch (e) {
      triggerNotification("خطأ أثناء المسح.", true);
    }
  };

  // 7. Support reply
  const handleSupportReply = async (id: string) => {
    const text = ticketReplies[id];
    if (!text) {
      triggerNotification("اكتب ردك قبل إرسال الرسالة للمرشد", true);
      return;
    }
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'answered', reply: text })
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'answered', reply: data.reply } : t));
        setTicketReplies(prev => ({ ...prev, [id]: '' }));
        triggerNotification("تم إرسال ردك رسميًا للمرشد المشتكي بنجاح!");
      }
    } catch (err) {
      triggerNotification("خطأ في الاتصال بالشبكة للمستند.", true);
    }
  };

  // 8. HeadQuarters settings
  const handleOfficeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(office)
      });
      if (res.ok) {
        const data = await res.json();
        setOffice(data);
        triggerNotification("تم حفظ وتحديث الهوية التأسيسية للمكتب بنجاح!");
      }
    } catch (err) {
      triggerNotification("فشل تحديث بيانات الإقامة والمقر الرئيسي للمكتب.", true);
    }
  };

  // 9. Media base64 uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    triggerNotification("جاري تحميل وتكوين ملف الوسائط، يرجى الانتظار...");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const uploadBody = {
          filename: file.name,
          fileType: file.type.startsWith('video/') ? 'video' : 'image',
          mimeType: file.type,
          size: file.size,
          base64Data: base64
        };

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadBody)
        });

        if (res.ok) {
          const newAsset = await res.json();
          setMediaAssets(prev => [newAsset, ...prev]);
          triggerNotification("تهانينا! تم رفع الصورة والفيديو بنجاح إلى خادم التخزين الداخلي للموقع.");
        } else {
          const errorPayload = await res.json().catch(() => ({}));
          triggerNotification(errorPayload.message || "فشل معالجة ورفع الملف.", true);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error", err);
      triggerNotification("حدث خطأ في قراءة وتحويل الملف محلياً.", true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!window.confirm("حذف ملف الوسائط من القرص الصلب؟")) return;
    try {
      const res = await fetch(`/api/media-assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMediaAssets(prev => prev.filter(m => m.id !== id));
        triggerNotification("تم حذف ملف الوسائط وتحرير المساحة بنجاح.");
      }
    } catch (err) {
      triggerNotification("حدث خطأ في تخادم الحذف.", true);
    }
  };

  // Click board utility URL copy
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(url);
    triggerNotification("تم نسخ رابط الوسائط الكامل للحافظة!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate quick stats totals
  const totalGuides = guides.length;
  const totalAttractions = attractions.length;
  const pendingAppsCount = applications.filter(a => a.status === 'pending').length;
  const activeTripsCount = trips.length;
  const openedTicketsCount = tickets.filter(t => t.status === 'open').length;
  const totalMediaCount = mediaAssets.length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans flex items-center justify-center relative overflow-hidden px-4 py-16" dir="rtl">
        {/* Decorative Space Orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 relative z-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              بوابة الإشراف العليا
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-medium">لوحة تحكم شومة الكبرى لإدارة النظام والكتالوج السياحي</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="admPass" className="text-xs font-bold text-slate-300 block">
                أدخل كلمة المرور السرية للإدارة العليا:
              </label>
              <input
                id="admPass"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800/80 focus:border-amber-500 rounded-2xl text-slate-100 text-sm focus:outline-none transition-all placeholder:text-slate-700 text-center"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-400">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{loginError}</p>
              </div>
            )}

            <button
              id="btn-admin-login"
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-lg active:scale-[0.98] cursor-pointer"
            >
              دخول كمسؤول أول للشركة
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 font-mono">SHOUMA EXP-PLATFORM (ARABIA) v1.0.1</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row" dir="rtl">
      
      {/* SIDE NAVIGATION DRAWER */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-l border-slate-800 flex flex-col shrink-0 relative z-20">
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '40s' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">الإشراف الماسي</h2>
              <span className="text-[10px] text-amber-400 font-bold block bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20 mt-1">
                الوصول الكامل للنظام
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'لوحة التحكم الرئيسية', icon: Grid },
            { id: 'applications', label: 'طلبات الانضمام', icon: ClipboardList, count: pendingAppsCount },
            { id: 'announcements', label: 'التعميمات والإعلانات', icon: Megaphone },
            { id: 'guides', label: 'المرشدين والشركاء', icon: Users, count: totalGuides },
            { id: 'attractions', label: 'تنظيم المعالم السياحية', icon: Landmark, count: totalAttractions },
            { id: 'accommodations', label: 'الفنادق والمطاعم', icon: Building },
            { id: 'trips', label: 'إدراج وتعميم الرحلات', icon: Compass, count: activeTripsCount },
            { id: 'support', label: 'الشكاوى والاستفسارات', icon: HelpCircle, count: openedTicketsCount },
            { id: 'media', label: 'مكتبة الوسائط ورفع الملفات', icon: Film, count: totalMediaCount },
            { id: 'hq', label: 'بيانات المقر الرئيسي للمكتب', icon: Settings },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                id={`tab-to-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full px-4 py-3 rounded-xl text-right text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-900 text-white' : 'bg-amber-500/10 text-amber-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">البريد الإلكتروني للإدارة:</span>
              <span className="text-[10px] text-slate-200 block truncate font-mono">admabthalat@gmail.com</span>
            </div>
            <button
              id="btn-admin-logout"
              onClick={handleLogout}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer"
              title="تسجيل خروج"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* CORE WORKSPACE */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* TOP SYSTEM BAR & NOTIFICATIONS */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-slate-800/50">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white">
              لوحة تحكم شومة الاستكشافية الكبرى — الإصدار الماسي
            </h1>
            <p className="text-xs text-slate-400 mt-1">تعديل وحذف وإضافة كل تفاصيل التطبيق وقاعدة البيانات التشاركية في مسقط وظفار</p>
          </div>

          <button
            id="btn-refresh-data"
            onClick={fetchAllData}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث كل البيانات</span>
          </button>
        </header>

        {/* Global Action Banners */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold">{successMsg}</p>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="font-bold">{errorMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'المرشدين المسجلين بقاعدة البيانات', val: totalGuides, icon: Users, color: 'text-amber-400 bg-amber-500/10' },
                { label: 'المعالم السياحية بالمنصة', val: totalAttractions, icon: Landmark, color: 'text-sky-400 bg-sky-500/10' },
                { label: 'طلب انتساب معلق بالانتظار', val: pendingAppsCount, icon: FileText, color: 'text-purple-400 bg-purple-500/10' },
                { label: 'جولات سياحية بالبث والانتظار', val: activeTripsCount, icon: Compass, color: 'text-emerald-400 bg-emerald-500/10' },
                { label: 'شكاوى واستفسارات للمرشدين', val: openedTicketsCount, icon: HelpCircle, color: 'text-red-400 bg-red-500/10' },
                { label: 'فنادق مدرجة في مسقط وظفار', val: hotels.length, icon: Building, color: 'text-yellow-400 bg-yellow-500/10' },
                { label: 'مطاعم عشاء عمانية شركاء', val: restaurants.length, icon: Landmark, color: 'text-pink-400 bg-pink-500/10' },
                { label: 'ملف وسائط وصور/فيديو بالخادم', val: totalMediaCount, icon: Film, color: 'text-teal-400 bg-teal-500/10' },
              ].map((card, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-tight mb-1 font-bold">{card.label}</span>
                    <strong className="text-2xl font-black text-white">{card.val}</strong>
                  </div>
                  <div className={`p-3 rounded-xl ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Quickstart Guideline */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/20 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between relative z-10" dir="rtl">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-500 font-bold tracking-wide block">أهلاً بك يا مدير شركة شومة الموقر</span>
                  <h3 className="text-sm font-bold text-white">تحكم وقدرة مطلقة لإدارة المكونات الاستكشافية لسلطنة عمان</h3>
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl">
                    من خلال هذه اللوحة المتطورة، يمكنك التحكم كلياً بتطبيق شومة من مسقط لظفار! يمكنك إبطال أو قبول طلبات التسجيل للمرشدين، ربط ملفات الصور والفيديوهات، تعميم التعليمات، التحكم بالرحلات اليومية والنشطة وحذفها وتعديل أسعارها بالريال العماني.
                  </p>
                </div>
              </div>
            </div>

            {/* Database Sync Progress & Trigger Module */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-500 font-bold tracking-wide block">🔄 مركز مزامنة وربط البيانات الاستكشافية الكبرى</span>
                  <h3 className="text-sm font-bold text-white">مزامنة كافة البيانات المدمجة مع قاعدة البيانات السحابية الحقيقية</h3>
                  <p className="text-xs text-slate-400 max-w-2xl leading-normal">
                    تحقق المنصة تلقائياً من البيانات الثابتة وتزامنها بشكل مباشر إلى قاعدة بيانات PostgreSQL الموثقة لتتمكن من تعديلها، حذفها، أو تخصيص رخص المرشدين السياحيين والخرائط بسهولة وسرعة فائقة.
                  </p>
                </div>

                <button
                  onClick={handleDatabaseSync}
                  disabled={syncing || (unsyncedHotels.length + unsyncedAttractions.length + unsyncedRestaurants.length + unsyncedGuides.length === 0)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                    syncing
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : (unsyncedHotels.length + unsyncedAttractions.length + unsyncedRestaurants.length + unsyncedGuides.length === 0)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:shadow-lg'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>
                    {syncing
                      ? 'جاري المزامنة الآن...'
                      : (unsyncedHotels.length + unsyncedAttractions.length + unsyncedRestaurants.length + unsyncedGuides.length === 0)
                      ? '✓ كافة البيانات مزمّنة بالكامل'
                      : 'مزامنة كافة البيانات الشاملة'}
                  </span>
                </button>
              </div>

              {/* Counts of Unsynced status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block mb-1">المرشدين غير المزامنين:</span>
                  <strong className={unsyncedGuides.length > 0 ? "text-amber-400 font-black font-sans text-sm" : "text-emerald-400 font-bold font-sans text-sm"}>
                    {unsyncedGuides.length > 0 ? `${unsyncedGuides.length} معلّق` : '0 (مكتمل)'}
                  </strong>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block mb-1">المعالم غير المزامنة:</span>
                  <strong className={unsyncedAttractions.length > 0 ? "text-amber-400 font-black font-sans text-sm" : "text-emerald-400 font-bold font-sans text-sm"}>
                    {unsyncedAttractions.length > 0 ? `${unsyncedAttractions.length} معلّق` : '0 (مكتمل)'}
                  </strong>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block mb-1">الفنادق غير المزامنة:</span>
                  <strong className={unsyncedHotels.length > 0 ? "text-amber-400 font-black font-sans text-sm" : "text-emerald-400 font-bold font-sans text-sm"}>
                    {unsyncedHotels.length > 0 ? `${unsyncedHotels.length} معلّق` : '0 (مكتمل)'}
                  </strong>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block mb-1">المطاعم غير المزامنة:</span>
                  <strong className={unsyncedRestaurants.length > 0 ? "text-amber-400 font-black font-sans text-sm" : "text-emerald-400 font-bold font-sans text-sm"}>
                    {unsyncedRestaurants.length > 0 ? `${unsyncedRestaurants.length} معلّق` : '0 (مكتمل)'}
                  </strong>
                </div>
              </div>

              {/* Progress Bar inside sync card if active */}
              {syncing && (
                <div className="space-y-2 pt-2" dir="rtl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-400 font-bold">{syncProgress.label}</span>
                    <span className="text-slate-400 font-mono">
                      {syncProgress.current} / {syncProgress.total} ({Math.round((syncProgress.current / (syncProgress.total || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-850">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(syncProgress.current / (syncProgress.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Visual Charts / Fast summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Applications Snapshot */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200">طلبات المتقدمين الجدد المعلقة</h3>
                {applications.filter(a => a.status === 'pending').length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-6">لا توجد طلبات معلقة حالياً، قمت بمراجعتها بالكامل!</p>
                ) : (
                  <div className="space-y-3">
                    {applications.filter(a => a.status === 'pending').slice(0, 3).map((app) => (
                      <div key={app.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-white mb-0.5">{app.name}</p>
                          <span className="text-[10px] text-slate-400block">{app.nationality} • {app.governorate} • {app.languages.join('، ')}</span>
                        </div>
                        <button
                          id={`quick-tab-applications-${app.id}`}
                          onClick={() => setActiveTab('applications')}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          معاينة سريعة
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tickets Snapshot */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 font-sans">آخر بلاغات الدعم من المرشدين</h3>
                {tickets.filter(t => t.status === 'open').length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-6">كل المرشدين سعداء حالياً ولا توجد أي بلاغات معلقة.</p>
                ) : (
                  <div className="space-y-3 font-sans">
                    {tickets.filter(t => t.status === 'open').slice(0, 3).map((ticket) => (
                      <div key={ticket.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-amber-400 mb-0.5">{ticket.subject}</p>
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">{ticket.message}</span>
                        </div>
                        <button
                          id="quick-tab-support"
                          onClick={() => setActiveTab('support')}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          الرد والدعم
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: APPLICATIONS MANAGER */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white mb-1">إدارة واعتماد المرشدين الجدد وسحب رخصهم</h2>
            <p className="text-slate-400 text-xs">قائمة بجميع طلبات السياح والشباب المنتسبين للتدريب والإرشاد في مسقط والمحافظات</p>

            {applications.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">لا تتوفر أي طلبات إرشاد سياحي مسجلة بالذاكرة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-white">{app.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">العمر: {app.age} عاماً • الجنسية: {app.nationality}</span>
                        </div>
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                          app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                          app.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/15 animate-pulse'
                        }`}>
                          {app.status === 'approved' ? 'مقبول ومعتمد' : app.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950/60 rounded-xl space-y-1 text-xs text-slate-300">
                        <p><strong>الموقع والمحافظة:</strong> {app.governorate}</p>
                        <p><strong>الهاتف:</strong> {app.phone}</p>
                        <p><strong>البريد:</strong> {app.email}</p>
                        <p><strong>اللغات المنطوقة:</strong> {app.languages.join(' ، ')}</p>
                      </div>

                      <p className="text-xs text-slate-400 bg-slate-950/20 p-2.5 rounded-lg border border-slate-850 leading-relaxed font-sans">{app.description}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      {app.status === 'pending' && (
                        <>
                          <button
                            id={`btn-approve-${app.id}`}
                            onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>قبول واعتماد</span>
                          </button>
                          <button
                            id={`btn-reject-${app.id}`}
                            onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                            className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-slate-950 text-red-400 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رفض الطلب</span>
                          </button>
                        </>
                      )}
                      
                      <button
                        id={`btn-delete-app-${app.id}`}
                        onClick={() => handleDeleteApp(app.id)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center mr-auto"
                        title="حذف هذا السجل نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ANNOUNCEMENTS PUBLIC */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h2 className="text-sm font-bold text-white mb-2">كتابة إعلان وتعميم للمرشدين</h2>
              <p className="text-[11px] text-slate-400 leading-normal">
                يكتب التعميم للإدارة أو شؤون الطبيعة والرحلات هنا لكي يشاهده كل مرشد سياحي يدخل إلى لوحة التحكم الخاصة به على الفور.
              </p>

              <form onSubmit={handleAnnSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="annT" className="text-xs text-slate-300 font-bold">عنوان الإعلان العريض:</label>
                  <input
                    id="annT"
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="مثال: تنبيه بخصوص أحوال الطقس بوادي بني خالد"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="annM" className="text-xs text-slate-300 font-bold">تفاصيل ومنشور الرسالة:</label>
                  <textarea
                    id="annM"
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    rows={4}
                    placeholder="اكتب التوجيهات الرسمية الدقيقة هنا..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <button
                  id="btn-ann-submit"
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Megaphone className="w-4 h-4" />
                  <span>تثبيت ونشر التعميم</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-white">التعميم النشط حالياً على مستوى عمان</h2>

              {announcements.length === 0 ? (
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                  <Megaphone className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">لا توجد إعلانات معلنة حالياً على لوحة القائد.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann, i) => (
                    <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 relative">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-black text-amber-400">{ann.title}</h4>
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                          نشط للغاية
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2 whitespace-pre-wrap">{ann.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: GUIDES PARTNERS */}
        {activeTab === 'guides' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h2 className="text-sm font-bold text-white">
                {editingGuideId ? "🖋️ تعديل بيانات المرشد المذكور" : "إضافة مرشد معتمد رسمي"}
              </h2>

              <form onSubmit={handleGuideSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label htmlFor="gN" className="text-xs text-slate-300 block">الاسم بالإنجليزية:</label>
                  <input
                    id="gN"
                    type="text"
                    value={gName}
                    onChange={(e) => setGName(e.target.value)}
                    placeholder="e.g. Salim Al Omani"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="gNA" className="text-xs text-slate-300 block">الاسم باللغة العربية:</label>
                  <input
                    id="gNA"
                    type="text"
                    value={gNameAr}
                    onChange={(e) => setGNameAr(e.target.value)}
                    placeholder="مثال: سالم العماني"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="gSA" className="text-xs text-slate-300 block">التخصص الإرشادي:</label>
                  <input
                    id="gSA"
                    type="text"
                    value={gSpecAr}
                    onChange={(e) => setGSpecAr(e.target.value)}
                    placeholder="مغامرات جبلية وطبيعية"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="gC" className="text-xs text-slate-300 block">المدينة والمقر:</label>
                    <input
                      id="gC"
                      type="text"
                      value={gCity}
                      onChange={(e) => setGCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="gE" className="text-xs text-slate-300 block">سنوات الخبرة:</label>
                    <input
                      id="gE"
                      type="number"
                      value={gExp}
                      onChange={(e) => setGExp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="gPh" className="text-xs text-slate-300 block">رقم الهاتف:</label>
                    <input
                      id="gPh"
                      type="text"
                      value={gPhone}
                      onChange={(e) => setGPhone(e.target.value)}
                      placeholder="+968 9..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="gPr" className="text-xs text-slate-300 block">سعر الخدمة اليومي:</label>
                    <input
                      id="gPr"
                      type="number"
                      value={gPrice}
                      onChange={(e) => setGPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="gIm" className="text-xs text-slate-300 block">رابط مسار الصورة (اختياري):</label>
                    <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                      <UploadCloud className="w-3 h-3 animate-pulse" />
                      رفع صورة من جهازك
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          triggerNotification("جاري رفع صورة المرشد السياحي...");
                          try {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64 = reader.result as string;
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  filename: file.name,
                                  fileType: 'image',
                                  mimeType: file.type,
                                  size: file.size,
                                  base64Data: base64
                                })
                              });
                              if (res.ok) {
                                const newAsset = await res.json();
                                setGImageUrl(newAsset.url);
                                triggerNotification("تم رفع صورة المرشد بنجاح ورطها بالقيد!");
                              } else {
                                triggerNotification("فشل في رفع الصورة للمرشد.", true);
                              }
                            };
                            reader.readAsDataURL(file);
                          } catch (_) {
                            triggerNotification("حدث خطأ أثناء رفع القيد.", true);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    id="gIm"
                    type="text"
                    value={gImageUrl}
                    onChange={(e) => setGImageUrl(e.target.value)}
                    placeholder="رابط الصورة أو سيتم تحديده تلقائياً عند الرفع من الجهاز"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="gEm" className="text-xs text-slate-300 block">بريد المرشد (تسجيل الدخول):</label>
                    <input
                      id="gEm"
                      type="email"
                      value={gEmail}
                      onChange={(e) => setGEmail(e.target.value)}
                      placeholder="salim@shouma.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="gPw" className="text-xs text-slate-300 block">كلمة المرور الافتراضية:</label>
                    <input
                      id="gPw"
                      type="text"
                      value={gPassword}
                      onChange={(e) => setGPassword(e.target.value)}
                      placeholder="shouma2026"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="gAddIm" className="text-xs text-slate-300 block">صور إضافية للمرشد (روابط مفصولة بفاصلة ,):</label>
                  <input
                    id="gAddIm"
                    type="text"
                    value={gAdditionalImages}
                    onChange={(e) => setGAdditionalImages(e.target.value)}
                    placeholder="https://image1.jpg, https://image2.jpg"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="gDesc" className="text-xs text-slate-300 block">الوصف التفصيلي للمرشد:</label>
                  <textarea
                    id="gDesc"
                    value={gDesc}
                    onChange={(e) => setGDesc(e.target.value)}
                    placeholder="مثال: مرشد سياحي محترف متخصص في تنظيم جولات الطبيعة والهايكنج مع معرفة واسعة بالمسارات الجبلية..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2 p-3 bg-slate-900/30 border border-slate-800 rounded-xl">
                  <label className="text-xs font-bold text-slate-300 block">
                    مربعات تفصيلية للخدمات والأنشطة الإرشادية:
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="مثال: هايكنج جبلي، رصد نجوم، تخييم"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newService.trim()) {
                            setGServices(prev => [...prev, newService.trim()]);
                            setNewService('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newService.trim()) {
                          setGServices(prev => [...prev, newService.trim()]);
                          setNewService('');
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
                    >
                      إضافة مربع
                    </button>
                  </div>

                  {gServices.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/50">
                      {gServices.map((srv, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-amber-500/20 rounded-lg text-slate-200 text-xs font-sans">
                          <span className="text-amber-400 font-bold">✦</span>
                          <span>{srv}</span>
                          <button
                            type="button"
                            onClick={() => setGServices(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-300 font-bold ml-1 text-sm leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">لا توجد خدمات تفصيلية مضافة بعد. سيتم استخدام خدمات أساسية افتراضية.</p>
                  )}
                </div>

                <div className="space-y-1 bg-slate-950/40 p-3 border border-amber-500/10 rounded-2xl">
                  <label htmlFor="gBank" className="text-xs font-bold text-amber-500 block">بوابة سحب الأموال / رقم الحساب البنكي (IBAN):</label>
                  <input
                    id="gBank"
                    type="text"
                    value={gBankAccount}
                    onChange={(e) => setGBankAccount(e.target.value)}
                    placeholder="مثال: OM03 0040 1200 4567 8901 0001"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-500 text-xs focus:outline-none text-left font-mono"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal text-right" dir="rtl">
                    💡 تستخدم هذه المحفظة لاستلام حوزة الدفع الفورية من الرحلات (المرشد يستلم <strong className="text-white">85%</strong> كحد مستقل و يقتطع النظام رسوم <strong className="text-white">15%</strong> تلقائياً).
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    id="btn-guide-submit"
                    type="submit"
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {editingGuideId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingGuideId ? "حفظ التعديلات" : "تثبيت بقاعدة البيانات"}</span>
                  </button>
                  {editingGuideId && (
                    <button
                      type="button"
                      onClick={clearGuideForm}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-white">المرشدون المعتمدون بالدليل حالياً</h2>
              {guides.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">لا يوجد مرشدون معتمدون في الدليل الشامل حتى الآن.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {guides.map((guide) => (
                    <div key={guide.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-4">
                      <img
                        src={guide.image_url || guide.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                        alt={guide.name_ar || guide.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/20 shrink-0"
                      />
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-black text-white truncate">{guide.name_ar || guide.nameAr || guide.name}</h4>
                          <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold">
                            الخبرة: {guide.experience} سنوات
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{guide.specialization_ar || guide.specializationAr || guide.specialization}</p>
                        <p className="text-[10px] text-slate-300 flex justify-between items-center gap-1">
                          <span>📱 {guide.phone || guide.whatsapp}</span>
                          {guide.bank_account || guide.bankAccount ? (
                            <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded-md font-mono font-bold" title={guide.bank_account || guide.bankAccount}>
                              🏦 IBAN: {(guide.bank_account || guide.bankAccount).substring(0, 10)}...
                            </span>
                          ) : (
                            <span className="text-[8px] text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded-md font-bold">
                              ⚠️ لم يربط حساب بنكي
                            </span>
                          )}
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/40 mt-1">
                          <span className="text-[10px] text-amber-400 font-bold font-sans">الأجر: {guide.price_per_day || guide.pricePerDay || 40} ر.ع/يوم</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (String(guide.id).startsWith('static-')) {
                                  triggerNotification("عذراً، هذا المرشد نظامي مدمج للتوضيح ولا يمكن تعديل بياناته.", true);
                                  return;
                                }
                                handleEditClick(guide);
                              }}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded transition-all cursor-pointer"
                              title="تعديل بيانات المرشد"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-guide-${guide.id}`}
                              onClick={() => handleDeleteGuide(guide.id)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer"
                              title="إلغاء رخصة المرشد وحذفه"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ATTRACTIONS EXPLOSET */}
        {activeTab === 'attractions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h2 className="text-sm font-bold text-white">إضافة معلم طبيعي أو أثري جديد</h2>

              <form onSubmit={handleAttractionSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="atN" className="text-xs text-slate-300 block">اسم الموقع بالإنجليزي:</label>
                  <input
                    id="atN"
                    type="text"
                    value={attrName}
                    onChange={(e) => setAttrName(e.target.value)}
                    placeholder="e.g. Wadi Bani Khalid"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="atNA" className="text-xs text-slate-300 block">اسم الموقع بالعربي:</label>
                  <input
                    id="atNA"
                    type="text"
                    value={attrNameAr}
                    onChange={(e) => setAttrNameAr(e.target.value)}
                    placeholder="مثال: وادي بني خالد"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="atGov" className="text-xs text-slate-300 block">المحافظة:</label>
                    <select
                      id="atGov"
                      value={attrGov}
                      onChange={(e) => setAttrGov(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      {['مسقط', 'ظفار', 'مسندم', 'الداخلية', 'شمال الباطنة', 'جنوب الشرقية', 'الظاهرة'].map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="atW" className="text-xs text-slate-300 block">الولاية:</label>
                    <input
                      id="atW"
                      type="text"
                      value={attrWilayat}
                      onChange={(e) => setAttrWilayat(e.target.value)}
                      placeholder="بدية"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="atCat" className="text-xs text-slate-300 block">التصنيف:</label>
                    <select
                      id="atCat"
                      value={attrCategory}
                      onChange={(e) => setAttrCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="nature">طبيعة ومياه</option>
                      <option value="history">قلاع وحصون تاريخية</option>
                      <option value="hiking">مسير ومغامرة</option>
                      <option value="beach">شواطئ وجزر</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label htmlFor="atIm" className="text-xs text-slate-300 block">رابط مسار الصورة:</label>
                      <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                        <UploadCloud className="w-3 h-3 animate-pulse" />
                        رفع صورة من جهازك
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            triggerNotification("جاري رفع صورة المعلم السياحي...");
                            try {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64 = reader.result as string;
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    filename: file.name,
                                    fileType: 'image',
                                    mimeType: file.type,
                                    size: file.size,
                                    base64Data: base64
                                  })
                                });
                                if (res.ok) {
                                  const newAsset = await res.json();
                                  setAttrImage(newAsset.url);
                                  triggerNotification("تم رفع صورة المعلم بنجاح!");
                                } else {
                                  triggerNotification("فشل رفع صورة المعلم.", true);
                                }
                              };
                              reader.readAsDataURL(file);
                            } catch (_) {
                              triggerNotification("أخطأ أثناء رفع قشرة الصورة.", true);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      id="atIm"
                      type="text"
                      value={attrImage}
                      onChange={(e) => setAttrImage(e.target.value)}
                      placeholder="رابط الصورة أو سيتم تحديده عند الرفع من جهازك"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1 bg-slate-900/40 p-2.5 border border-slate-800 rounded-xl">
                  <label htmlFor="atAddIm" className="text-xs text-slate-300 block">صور إضافية للمعلم (روابط مفصولة بفاصلة ,):</label>
                  <input
                    id="atAddIm"
                    type="text"
                    value={attrAdditionalImages}
                    onChange={(e) => setAttrAdditionalImages(e.target.value)}
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="atDesc" className="text-xs text-slate-300 block">شرح وتفاصيل مختصرة عن المعلم:</label>
                  <textarea
                    id="atDesc"
                    value={attrDesc}
                    onChange={(e) => setAttrDesc(e.target.value)}
                    rows={3}
                    placeholder="تفاصيل تصف جمالية ومواعيد زيارة هذا المعلم..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-2 p-3 bg-slate-900/30 border border-slate-800 rounded-xl font-sans">
                  <label className="text-xs font-bold text-slate-300 block">
                    مربعات تفصيلية للأنشطة والامتيازات (أبواغ):
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAttrTag}
                      onChange={(e) => setNewAttrTag(e.target.value)}
                      placeholder="مثال: ألعاب أطفال، إطلالة جبلية، عائلي"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newAttrTag.trim()) {
                            setAttrTags(prev => [...prev, newAttrTag.trim()]);
                            setNewAttrTag('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAttrTag.trim()) {
                          setAttrTags(prev => [...prev, newAttrTag.trim()]);
                          setNewAttrTag('');
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
                    >
                      إضافة مربع
                    </button>
                  </div>

                  {attrTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/50">
                      {attrTags.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-amber-500/20 rounded-lg text-slate-200 text-xs">
                          <span className="text-amber-400 font-bold">✦</span>
                          <span>{t}</span>
                          <button
                            type="button"
                            onClick={() => setAttrTags(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-300 font-bold ml-1 text-sm leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">لا توجد مربعات تفصيلية مضافة لهذا المعلم بعد.</p>
                  )}
                </div>

                <button
                  id="btn-attraction-submit"
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>أضف لكتالوج المعالم</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-white">المعالم السياحية المستحدثة بقاعدتكم الرقمية</h2>
              {attractions.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">لم يتم رصد أي معالم مخصصة مضافة بواسطة الإدارة العليا.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attractions.map((attr) => (
                    <div key={attr.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                      <img
                        src={attr.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=150&q=80"}
                        alt={attr.name_ar || attr.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-black text-white truncate">{attr.name_ar || attr.name}</h4>
                          <span className="text-[9px] bg-sky-500/15 text-sky-400 px-1.5 py-0.5 rounded font-black">
                            {attr.governorate}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 no-wrap block">الولاية: {attr.wilayat}</p>
                        <p className="text-[10px] text-slate-300 font-sans line-clamp-2 leading-relaxed">{attr.description}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/40 mt-1">
                          <span className="text-[9px] text-slate-500">⭐ {attr.rating || '4.8'} / 5</span>
                          <button
                            id={`btn-delete-attr-${attr.id}`}
                            onClick={() => handleDeleteAttraction(attr.id)}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded transition-all cursor-pointer"
                            title="حذف هذا المعلم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ACCOMMODATIONS & FOOD */}
        {activeTab === 'accommodations' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <div className="flex bg-slate-950 p-1 rounded-xl">
                <button
                  id="tab-acc-hotel"
                  type="button"
                  onClick={() => setAccType('hotel')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${accType === 'hotel' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  فندق / استراحة
                </button>
                <button
                  id="tab-acc-restaurant"
                  type="button"
                  onClick={() => setAccType('restaurant')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${accType === 'restaurant' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  مطعم / ضيافة
                </button>
              </div>

              <h2 className="text-xs font-bold text-white">إضافة {accType === 'hotel' ? 'فندق' : 'مطعم شريك'} جديد</h2>

              <form onSubmit={handleAccSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="accE" className="text-xs text-slate-300 block">الاسم بالإنجليزي:</label>
                  <input
                    id="accE"
                    type="text"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="e.g. Shangri-La Muscat"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="accA" className="text-xs text-slate-300 block">الاسم بالعربي:</label>
                  <input
                    id="accA"
                    type="text"
                    value={accNameAr}
                    onChange={(e) => setAccNameAr(e.target.value)}
                    placeholder="مثال: منتجع شنجريلا"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="accC" className="text-xs text-slate-300 block">المدينة والمقر:</label>
                    <input
                      id="accC"
                      type="text"
                      value={accCity}
                      onChange={(e) => setAccCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="accR" className="text-xs text-slate-300 block">المنطقة الدقيقة:</label>
                    <input
                      id="accR"
                      type="text"
                      value={accRegion}
                      onChange={(e) => setAccRegion(e.target.value)}
                      placeholder="الجصة"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {accType === 'hotel' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="hotP" className="text-xs text-slate-300 block">متوسط السعر لكل ليلة:</label>
                      <input
                        id="hotP"
                        type="number"
                        value={hotPrice}
                        onChange={(e) => setHotPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="hotS" className="text-xs text-slate-300 block">عدد النجوم:</label>
                      <select
                        id="hotS"
                        value={hotStars}
                        onChange={(e) => setHotStars(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5نجوم)</option>
                        <option value="4">⭐⭐⭐⭐ (4 نجوم)</option>
                        <option value="3">⭐⭐⭐ (3 نجوم)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="resCu" className="text-xs text-slate-300 block">نوع المطبخ والوجبات:</label>
                      <input
                        id="resCu"
                        type="text"
                        value={resCuisine}
                        onChange={(e) => setResCuisine(e.target.value)}
                        placeholder="مشاوي يدوية شعيرية"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="resPr" className="text-xs text-slate-300 block">مستوى الإسعاف/الأسعار:</label>
                      <select
                        id="resPr"
                        value={resPriceRange}
                        onChange={(e) => setResPriceRange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="cheap">رخيص وبسيط ($)</option>
                        <option value="moderate">متوسط السعر ($$)</option>
                        <option value="expensive">فاخر وغالٍ ($$$)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="accDesc" className="text-xs text-slate-300 block">الوصف التفصيلي:</label>
                  <textarea
                    id="accDesc"
                    value={accDesc}
                    onChange={(e) => setAccDesc(e.target.value)}
                    placeholder={accType === 'hotel' ? "مثال: فندق عكاشه فندق سوداني به أنشطة متنوعة وألعاب ترفيهية للأطفال..." : "مثال: مأكولات عمانية ويمنية تقليدية مميزة بجلسات عائلية هادئة..."}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2 p-3 bg-slate-900/30 border border-slate-800 rounded-xl">
                  <label className="text-xs font-bold text-slate-300 block">
                    {accType === 'hotel' ? 'المربعات التفصيلية (الأنشطة، الخدمات وميزات الفندق):' : 'المربعات التفصيلية لميزات المطعم:'}
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder={accType === 'hotel' ? "مثال: ألعاب أطفال، أنشطة رياضية، مسبح خاص" : "مثال: جلسات عائلية، موسيقى هادئة"}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newAmenity.trim()) {
                            setAccAmenities(prev => [...prev, newAmenity.trim()]);
                            setNewAmenity('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAmenity.trim()) {
                          setAccAmenities(prev => [...prev, newAmenity.trim()]);
                          setNewAmenity('');
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
                    >
                      إضافة مربع
                    </button>
                  </div>

                  {accAmenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/50">
                      {accAmenities.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-amber-500/20 rounded-lg text-slate-200 text-xs font-sans">
                          <span className="text-amber-400 font-bold">✦</span>
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => setAccAmenities(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-300 font-bold ml-1 text-sm leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">لا توجد مربعات تفصيلية مضافة بعد. سيتم استخدام القيم الافتراضية.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="accI" className="text-xs text-slate-300 block">رابط مسار الصورة التفصيلية:</label>
                    <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                      <UploadCloud className="w-3 h-3 animate-pulse" />
                      رفع صورة من جهازك
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          triggerNotification("جاري رفع صورة الفندق/المطعم من جهازك...");
                          try {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64 = reader.result as string;
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  filename: file.name,
                                  fileType: 'image',
                                  mimeType: file.type,
                                  size: file.size,
                                  base64Data: base64
                                })
                              });
                              if (res.ok) {
                                const newAsset = await res.json();
                                setAccImage(newAsset.url);
                                triggerNotification("تم رفع صورة المنشأة بنجاح!");
                              } else {
                                triggerNotification("فشل رفع الصورة للمنشأة.", true);
                              }
                            };
                            reader.readAsDataURL(file);
                          } catch (_) {
                            triggerNotification("خطأ أثناء الاتصال بالخادم الداخلي.", true);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    id="accI"
                    type="text"
                    value={accImage}
                    onChange={(e) => setAccImage(e.target.value)}
                    placeholder="رابط الصورة أو سيتم تحديده تلقائياً بعد رفع الملف"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1 bg-slate-900/40 p-2.5 border border-slate-800 rounded-xl">
                  <label htmlFor="accAddI" className="text-xs text-slate-300 block">صور إضافية للخدمة (روابط مفصولة بفاصلة ,):</label>
                  <input
                    id="accAddI"
                    type="text"
                    value={accAdditionalImages}
                    onChange={(e) => setAccAdditionalImages(e.target.value)}
                    placeholder="https://example.com/slide1.jpg, https://example.com/slide2.jpg"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                {accType === 'hotel' && (
                  <div className="space-y-1 bg-slate-950/40 p-3 border border-amber-500/10 rounded-2xl">
                    <label htmlFor="accBank" className="text-xs font-bold text-amber-500 block">بوابة سحب أموال الفندق / رقم الحساب البنكي للتسوية (IBAN / Client ID):</label>
                    <input
                      id="accBank"
                      type="text"
                      value={accBankAccount}
                      onChange={(e) => setAccBankAccount(e.target.value)}
                      placeholder="مثال: OM03 0040 1200 8888 7777 0001"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-500 text-xs focus:outline-none text-left font-mono"
                      dir="ltr"
                    />
                    <p className="text-[10px] text-slate-450 mt-1 leading-normal text-right font-sans" dir="rtl">
                      💡 هنا يتم تكوين حساب بوابة الدفع الخاص بالفندق ليتم تحويل المبالغ المستحقة له (<strong className="text-white">85% من كامل مبلغ الحجز</strong>) وتثبيت عمولة النظام (<strong className="text-white">15%</strong>) تلقائياً عند الدفع عبر بوابة الدفع الإلكتروني.
                    </p>
                  </div>
                )}

                <button
                  id="btn-acc-submit"
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>أدرج السجل لشبكتكم</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-white">الخيارات المسجلة للفنادق والمطاعم حالياً</h2>

              <div className="space-y-6">
                {/* Hotels List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-amber-400 block border-b border-amber-500/10 pb-1">🏨 الفنادق والاستراحات المدرجة:</h3>
                  {hotels.length === 0 ? (
                    <p className="text-slate-500 text-[10px] text-center">لا يوجد فنادق مدرجة من قواعد الإدارة.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hotels.map(h => (
                        <div key={h.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between gap-3">
                          <div className="truncate flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{h.name_ar || h.name}</h4>
                            <span className="text-[9px] text-slate-400 block truncate">{h.city} - {h.region} • 💰 {h.price_per_night || h.pricePerNight} ر.ع/ليلة</span>
                            {h.bank_account || h.bankAccount ? (
                              <span className="text-[8px] mt-1 text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded inline-block font-mono font-bold" title={h.bank_account || h.bankAccount}>
                                🏦 IBAN: {(h.bank_account || h.bankAccount).substring(0, 10)}...
                              </span>
                            ) : (
                              <span className="text-[8px] mt-1 text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded inline-block font-bold">
                                ⚠️ لم تربط بوابة دفع للفندق بعد
                              </span>
                            )}
                          </div>
                          <button
                            id={`btn-delete-hotel-${h.id}`}
                            onClick={() => handleDeleteHotel(h.id)}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Restaurants List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-amber-400 block border-b border-amber-500/10 pb-1">🍽️ المطاعم الشعبية الشريكة بقائمتكم:</h3>
                  {restaurants.length === 0 ? (
                    <p className="text-slate-500 text-[10px] text-center font-sans">لا توجد مطاعم شريكة مدخلة بواسطة الإدارة.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {restaurants.map(r => (
                        <div key={r.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between gap-3 font-sans">
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-white truncate">{r.name_ar || r.name}</h4>
                            <span className="text-[9px] text-slate-400 block truncate">{r.city} - {r.cuisine} • {r.price_range === 'cheap' ? 'مناسب' : r.price_range === 'moderate' ? 'متوسط' : 'فاخر'}</span>
                          </div>
                          <button
                            id={`btn-delete-rest-${r.id}`}
                            onClick={() => handleDeleteRestaurant(r.id)}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: DISPATCH TRIPS TO GUIDES */}
        {activeTab === 'trips' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h2 className="text-sm font-bold text-white">تعميم وبث مسار جولة سياحية جديدة</h2>
              <p className="text-[10px] text-slate-400 leading-normal">
                أدخل الطلب الوارد من الزائر السائح الأجنبي، وسوف يظهر على الفور في لوحة تحكم المرشدين لاستقبال موافقاتهم!
              </p>

              <form onSubmit={handleTripSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label htmlFor="trTourist" className="text-xs text-slate-300 block">اسم السائح أو الفوج المغامر:</label>
                  <input
                    id="trTourist"
                    type="text"
                    value={tripTourist}
                    onChange={(e) => setTripTourist(e.target.value)}
                    placeholder="مثال: دانيال وعائلته (3 أشخاص)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="trDest" className="text-xs text-slate-300 block">الوجهة المستهدفة والمسار:</label>
                  <input
                    id="trDest"
                    type="text"
                    value={tripDestination}
                    onChange={(e) => setTripDestination(e.target.value)}
                    placeholder="مثال: جبل شمس وجبل الأخضر ونزوى التاريخية"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="trDate" className="text-xs text-slate-300 block">التاريخ المجدد للرحلة:</label>
                    <input
                      id="trDate"
                      type="date"
                      value={tripDate}
                      onChange={(e) => setTripDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="trDur" className="text-xs text-slate-300 block">المدة الكلية المتوقعة:</label>
                    <input
                      id="trDur"
                      type="text"
                      value={tripDuration}
                      onChange={(e) => setTripDuration(e.target.value)}
                      placeholder="يوم كامل (9ص - 7م)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="trPr" className="text-xs text-slate-300 block">الأجر المالي المرصود للمرشد:</label>
                  <input
                    id="trPr"
                    type="text"
                    value={tripPrice}
                    onChange={(e) => setTripPrice(e.target.value)}
                    placeholder="مثال: ٨٠ ر.ع"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="trNote" className="text-xs text-slate-300 block">ملاحظات ومتطلبات السائح الخاصة:</label>
                  <textarea
                    id="trNote"
                    value={tripNotes}
                    onChange={(e) => setTripNotes(e.target.value)}
                    rows={3}
                    placeholder="تفضيلات الأكل، الحساسية، اللغات المطلوبة..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-2 p-3 bg-slate-900/30 border border-slate-800 rounded-xl font-sans">
                  <label className="text-xs font-bold text-slate-300 block">
                    مربعات تفصيلية للرحلة (Inclusions/Maneuvers):
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTripBadge}
                      onChange={(e) => setNewTripBadge(e.target.value)}
                      placeholder="مثال: غداء مجاني، شامل تذاكر، سيارة دفع رباعي"
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTripBadge.trim()) {
                            setTripBadges(prev => [...prev, newTripBadge.trim()]);
                            setNewTripBadge('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTripBadge.trim()) {
                          setTripBadges(prev => [...prev, newTripBadge.trim()]);
                          setNewTripBadge('');
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
                    >
                      إضافة مربع
                    </button>
                  </div>

                  {tripBadges.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/50">
                      {tripBadges.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-amber-500/20 rounded-lg text-slate-200 text-xs">
                          <span className="text-amber-400 font-bold">✦</span>
                          <span>{b}</span>
                          <button
                            type="button"
                            onClick={() => setTripBadges(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-300 font-bold ml-1 text-sm leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">لا توجد مربعات مضافة للرحلة بعد.</p>
                  )}
                </div>

                <button
                  id="btn-trip-submit"
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>بث الرحلة فورياً للمرشدين</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-white">الرحلات السياحية المفرزة وحالتها الحالية</h2>

              {trips.length === 0 ? (
                <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                  <p className="text-slate-500 text-xs font-sans">لا توجد رحلات مجدولة في الوقت الحالي بقاعدة البيانات.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((tr) => (
                    <div key={tr.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-white">{tr.touristName}</strong>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            tr.status === 'assigned' ? 'bg-amber-500/10 text-amber-400' :
                            tr.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                            tr.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {tr.status === 'assigned' ? 'بانتظار قبول المرشدين' :
                             tr.status === 'accepted' ? 'تم قبولها وبدأ التحضير' :
                             tr.status === 'completed' ? 'جولة مكتملة بنجاح' : 'مرفوضة من المرشد'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">📍 المسار: {tr.destination}</p>
                        <p className="text-[11px] text-slate-400">📅 التاريخ: {tr.date} • {tr.duration} • 💰 الأجر المرصود: {tr.price}</p>
                        {tr.notes && <p className="text-[10px] text-slate-500 bg-slate-950/40 p-2 rounded-lg font-sans">تلميحات: {tr.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center mr-auto">
                        <select
                          id={`select-status-${tr.id}`}
                          value={tr.status}
                          onChange={(e) => handleUpdateTripState(tr.id, e.target.value)}
                          className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-200 focus:outline-none mt-1"
                        >
                          <option value="assigned">قيد الانتظار</option>
                          <option value="accepted">تم قبولها</option>
                          <option value="completed">مكتملة</option>
                          <option value="declined">مرفوضة</option>
                        </select>
                        <button
                          id={`btn-delete-trip-${tr.id}`}
                          onClick={() => handleDeleteTrip(tr.id)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                          title="حذف الرحلة نهائياً"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: CUSTOMER SUPPORT & TICKETS */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-white">إجابة شكاوى وحثيات تواصل المرشدين</h2>
            <p className="text-slate-400 text-xs">مسودة تواصل فورية بين الكادر السياحي ومكتب شومة الإداري لحل أزمات الإسناد والمكافآت</p>

            {tickets.length === 0 ? (
              <div className="p-10 text-center bg-slate-900 border border-slate-850 rounded-2xl">
                <HelpCircle className="w-10 h-10 text-slate-700 mx-auto mb-2 animate-bounce" />
                <p className="text-slate-500 text-xs">لا تتوفر بلاغات دعم أو تذاكر واردة من المرشدين في عمان حالياً.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((tck) => (
                  <div key={tck.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{tck.subject}</h4>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            tck.status === 'open' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            {tck.status === 'open' ? 'بانتظار مراجعتك وردك الإداري' : 'تم مراجعة الرد بنجاح'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          المرشد: {tck.guideName} • البريد: {tck.email} • أرسل بتاريخ: {tck.createdAt ? new Date(tck.createdAt).toLocaleDateString('ar-OM') : 'اليوم'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 leading-relaxed font-sans mb-4">
                      {tck.message}
                    </p>

                    {tck.reply && (
                      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-xs mb-3 space-y-1">
                        <strong className="text-[10px] text-amber-500">الرد الرسمي الصادر عنكم:</strong>
                        <p className="text-slate-300 font-sans leading-relaxed">{tck.reply}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        id={`input-reply-${tck.id}`}
                        type="text"
                        placeholder="اكتب رد الشركة الحاسم والدقيق لحل شكوى المرشد..."
                        value={ticketReplies[tck.id] || ''}
                        onChange={(e) => setTicketReplies(prev => ({ ...prev, [tck.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-slate-100 placeholder:text-slate-700 font-sans focus:outline-none"
                      />
                      <button
                        id={`btn-reply-send-${tck.id}`}
                        onClick={() => handleSupportReply(tck.id)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <Send className="w-3.5 h-3.5 transform rotate-180" />
                        <span>إرسال وتعميد الرد</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: MEDIA LIBRARY & FILE UPLOADS */}
        {activeTab === 'media' && (
          <div className="space-y-6 text-right">
            <div className="md:flex justify-between items-center bg-slate-900 border border-slate-800 rounded-3xl p-6 gap-6 space-y-4 md:space-y-0 relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <h2 className="text-sm font-bold text-white">تحميل وتخزين الصور والفيديو بالاستضافة الأساسية</h2>
                <p className="text-xs text-slate-400 max-w-lg leading-normal">
                  ارفع الصور بدقة عالية والفيديوهات، وسوف يتم حفظها مباشرة على خادم شومة وتوليد رابط سياحي محصل ومستقر لتثبيته في المعالم والفنادق!
                </p>
              </div>

              <div className="relative z-10">
                <label className={`px-5 py-3 border-2 border-dashed border-slate-800 hover:border-amber-500 bg-slate-950/40 hover:bg-slate-950 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                  <UploadCloud className="w-6 h-6 text-amber-500 animate-bounce" />
                  <span className="text-[11px] font-bold text-slate-300">أدرج ملف، صورة، أو فيديو للتحميل</span>
                  <input
                    id="media-uploader-input"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">مستودع الوسائط (المرفوعة في السحابة والخادم حالياً)</h2>

              {mediaAssets.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-850 rounded-2xl">
                  <Film className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">لا تتوفر أي وسائط مرفوعة مسبقاً في السحابة الخاصة بك.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaAssets.map((asset) => {
                    const isVideo = asset.file_type === 'video' || asset.fileType === 'video' || asset.url?.endsWith('.mp4');
                    return (
                      <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden group flex flex-col justify-between">
                        <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center">
                          {isVideo ? (
                            <div className="w-full h-full relative flex items-center justify-center">
                              <video src={asset.url} className="w-full h-full object-cover" muted playsInline />
                              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                                <FileVideo className="w-8 h-8 text-amber-500" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={asset.url}
                              alt={asset.filename}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                            />
                          )}

                          <span className="absolute top-2 right-2 text-[8px] font-black bg-slate-950/80 backdrop-blur text-white px-1.5 py-0.5 rounded">
                            {isVideo ? 'فيديو' : 'صورة'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-900 whitespace-nowrap min-w-0">
                          <p className="text-[9px] text-slate-300 truncate font-mono" title={asset.filename}>
                            {asset.filename}
                          </p>
                          <span className="text-[8px] text-slate-500 font-mono block">
                            حجم الملف: {(asset.size / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        <div className="p-2 bg-slate-950 flex items-center justify-between gap-1.5 border-t border-slate-850">
                          <button
                            id={`btn-copy-media-${asset.id}`}
                            onClick={() => handleCopyLink(asset.url)}
                            className="flex-1 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[9px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedId === asset.url ? 'تم النسخ' : 'رابط الصورة'}</span>
                          </button>
                          
                          <button
                            id={`btn-delete-media-${asset.id}`}
                            onClick={() => handleDeleteMedia(asset.id)}
                            className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded transition"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 10: HQ OFFICE SETTINGS */}
        {activeTab === 'hq' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h2 className="text-sm font-bold text-white">تعديل بيانات وإثبات المقر الفعلي للمكتب</h2>
              <p className="text-xs text-slate-400 leading-normal">
                تعديل وتحديث الاسم التجاري، العنوان بالتفصيل، رقم الهاتف السريع للشركة لتزويد السياح المغامرين بكافة الإحداثيات!
              </p>

              <form onSubmit={handleOfficeSubmit} className="space-y-4 font-sans">
                <div className="space-y-1">
                  <label htmlFor="ofN" className="text-xs text-slate-300 font-bold block">اسم المكتب والمؤسسة:</label>
                  <input
                    id="ofN"
                    type="text"
                    value={office.name}
                    onChange={(e) => setOffice(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ofA" className="text-xs text-slate-300 font-bold block">العنوان الفعلي التفصيلي:</label>
                  <input
                    id="ofA"
                    type="text"
                    value={office.address}
                    onChange={(e) => setOffice(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="ofP" className="text-xs text-slate-300 font-bold block">رقم هاتف الاتصال:</label>
                    <input
                      id="ofP"
                      type="text"
                      value={office.phone}
                      onChange={(e) => setOffice(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="ofH" className="text-xs text-slate-300 font-bold block">أوقات وساعات العمل:</label>
                    <input
                      id="ofH"
                      type="text"
                      value={office.workingHours}
                      onChange={(e) => setOffice(prev => ({ ...prev, workingHours: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="ofM" className="text-xs text-slate-300 font-bold block">رابط تضمين خريطة جوجل (Iframe):</label>
                  <input
                    id="ofM"
                    type="text"
                    value={office.mapEmbedUrl}
                    onChange={(e) => setOffice(prev => ({ ...prev, mapEmbedUrl: e.target.value }))}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-[10px] text-left focus:outline-none placeholder:text-slate-800 font-mono"
                    dir="ltr"
                  />
                </div>

                <button
                  id="btn-office-submit"
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تطبيق وحفظ إعدادات المقر</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-sm font-bold text-white">معاينة تمثيل الخريطة الجغرافية للمكتب سياحياً</h2>
              {office.mapEmbedUrl ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 h-80 overflow-hidden relative">
                  <iframe
                    src={office.mapEmbedUrl}
                    className="w-full h-full rounded-xl border-0"
                    loading="lazy"
                    title="موقع مكتب شومة الرئيسي"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="p-16 text-center bg-slate-900 border border-slate-850 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <MapPinOff className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-400 leading-normal max-w-xs">
                    لم يدرج هذا الخادم خريطة جوجل التفاعلية حالياً. الصق رابط التضمين من جوجل ماب لتثبيته فورياً بالواجهة الرئيسية كدليل للسياح!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
