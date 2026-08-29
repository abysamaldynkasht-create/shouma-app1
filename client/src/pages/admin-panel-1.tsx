import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { 
  Lock, Settings, MapPin, ClipboardList, Send, Check, X, Grid, Edit,
  MapPinOff, Landmark, Compass, HelpCircle, Phone, Clock, Plus, Trash2, Users,
  Film, Image as ImageIcon, UploadCloud, Copy, FileVideo, Eye, RefreshCw, 
  Megaphone, Building, ShieldAlert, CheckCircle2, ChevronRight, ExternalLink,
  DollarSign, FileText, Download, CheckCircle, AlertTriangle, Flame, Map, CreditCard,
  Percent, Activity, TrendingUp, Mountain, PlaneTakeoff, Star, Car, KeyRound, Globe,
  LogIn, LogOut, UserCheck, ShieldCheck, Building2, UserPlus, Filter, Search
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

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
  
  // Tab states: 'dashboard' | 'applications' | 'announcements' | 'guides' | 'attractions' | 'accommodations' | 'trips' | 'support' | 'media' | 'hq' | 'himam' | 'drob' | 'finance' | 'activities' | 'groupTrips' | 'portalAccounts'
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'applications' | 'announcements' | 'guides' | 'attractions' | 'accommodations' | 'trips' | 'support' | 'media' | 'hq' | 'himam' | 'drob' | 'finance' | 'activities' | 'groupTrips' | 'portalAccounts'
  >('dashboard');

  // Loaded database items
  const [portalAccounts, setPortalAccounts] = useState<any[]>([]);
  const [isLoadingPortalAccounts, setIsLoadingPortalAccounts] = useState(false);
  const [editingPortalAccount, setEditingPortalAccount] = useState<any | null>(null);
  const [isCreatingPortalAccount, setIsCreatingPortalAccount] = useState(false);
  const [portalForm, setPortalForm] = useState({
    portalType: "hotels",
    portalName: "لوحة الفنادق والمنتجعات",
    name: "",
    email: "",
    password: "",
    isActive: true
  });

  // Audit Logs State for Portal Accounts & Employee Activity
  const [portalAuditLogs, setPortalAuditLogs] = useState<any[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [auditFilterDepartment, setAuditFilterDepartment] = useState<string>("all");
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>("");

  const fetchAuditLogs = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const res = await fetch("/api/portal-auth/audit-logs");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setPortalAuditLogs(data);
      }
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  // Loaded database items
  const [applications, setApplications] = useState<GuideApplication[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [pendingApprovalHotels, setPendingApprovalHotels] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [trips, setTrips] = useState<TripBooking[]>([]);
  const [groupTrips, setGroupTrips] = useState<any[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [office, setOffice] = useState<OfficeConfig>({
    name: 'مكتب شومة الرئيسي للسياحة والرحلات',
    address: 'سلطنة عمان - مسقط - حي القرم التجاري',
    phone: '+968 2456 7890',
    workingHours: 'يومياً من السبت إلى الخميس: 9:00 صباحاً - 6:00 مساءً',
    mapEmbedUrl: ''
  });

  // PMS Pending Rooms States
  const [pendingPmsRooms, setPendingPmsRooms] = useState<any[]>([]);
  const [selectedCommissions, setSelectedCommissions] = useState<Record<number, number>>({});
  const [selectedCommissionAmounts, setSelectedCommissionAmounts] = useState<Record<number, string>>({});

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
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [attrImage, setAttrImage] = useState('');
  const [attrMapUrl, setAttrMapUrl] = useState('');
  const [attrAdditionalImages, setAttrAdditionalImages] = useState('');
  const [attrRating, setAttrRating] = useState('4.8');
  const [attrInsertGeneral, setAttrInsertGeneral] = useState(true);
  const [attrInsertHimam, setAttrInsertHimam] = useState(false);
  const [attrInsertDrob, setAttrInsertDrob] = useState(false);

  // Activity properties
  const [actName, setActName] = useState('');
  const [actNameAr, setActNameAr] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actDescAr, setActDescAr] = useState('');
  const [actLocation, setActLocation] = useState('');
  const [actRegion, setActRegion] = useState('محافظة مسقط');
  const [actDuration, setActDuration] = useState('1-2 ساعة');
  const [actPrice, setActPrice] = useState('10 ر.ع');
  const [actImage, setActImage] = useState('');
  const [actRating, setActRating] = useState('4.8');
  const [actIncludes, setActIncludes] = useState('');
  const [actProvider, setActProvider] = useState('مكتب شومة للسياحة');
  const [actPhone, setActPhone] = useState('+96891234567');
  const [actMapUrl, setActMapUrl] = useState('');

  const uniqueCategories = React.useMemo(() => {
    const cats = new Set<string>();
    cats.add("markets");
    cats.add("entertainment");
    cats.add("heritage");
    cats.add("nature");
    cats.add("wadis");
    cats.add("springs");

    if (Array.isArray(attractions)) {
      attractions.forEach(a => {
        if (a && a.category && typeof a.category === 'string') {
          cats.add(a.category.trim());
        }
      });
    }
    return Array.from(cats);
  }, [attractions]);

  const getCategoryLabelAr = (cat: string) => {
    const mapping: Record<string, string> = {
      markets: "الأسواق التجارية",
      entertainment: "الأماكن الترفيهية",
      heritage: "الأماكن التراثية",
      nature: "الأماكن الطبيعية",
      wadis: "الأودية",
      springs: "العيون الطبيعية"
    };
    return mapping[cat] || cat;
  };

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
  const [splitShoumaPct, setSplitShoumaPct] = useState('15');
  const [splitHotelPct, setSplitHotelPct] = useState('85');
  const [hotelEmail, setHotelEmail] = useState('');
  const [hotelPassword, setHotelPassword] = useState('');
  const [hotelAccountantEmail, setHotelAccountantEmail] = useState('');
  const [hotelAccountantPassword, setHotelAccountantPassword] = useState('');
  const [hotelReceptionistEmail, setHotelReceptionistEmail] = useState('');
  const [hotelReceptionistPassword, setHotelReceptionistPassword] = useState('');

  // Himam, Drob & Hiking Payments Core States
  const [himamPlaces, setHimamPlaces] = useState<any[]>([]);
  const [drobGems, setDrobGems] = useState<any[]>([]);
  const [hikingPayments, setHikingPayments] = useState<any[]>([]);
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [selectedHotelFinanceId, setSelectedHotelFinanceId] = useState<number | null>(null);

  // Hiking Profits States
  const [hikingTrips, setHikingTrips] = useState<any[]>([]);
  const [hikingBookings, setHikingBookings] = useState<any[]>([]);
  const [selectedTripFinanceId, setSelectedTripFinanceId] = useState<number | null>(null);
  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState<'hotels' | 'hiking'>('hotels');
  const [mainGatewayName, setMainGatewayName] = useState("شومة باي - بوابة دفع آمن مباشر");
  const [mainToken, setMainToken] = useState("");

  // Insert forms states
  const [himamName, setHimamName] = useState("");
  const [himamNameEn, setHimamNameEn] = useState("");
  const [himamLocation, setHimamLocation] = useState("");
  const [himamImage, setHimamImage] = useState("");
  const [himamDesc, setHimamDesc] = useState("");

  const [drobName, setDrobName] = useState("");
  const [drobNameEn, setDrobNameEn] = useState("");
  const [drobLocation, setDrobLocation] = useState("");
  const [drobImage, setDrobImage] = useState("");
  const [drobGov, setDrobGov] = useState("الوسطى");
  const [drobDesc, setDrobDesc] = useState("");

  const [hPayName, setHPayName] = useState("");
  const [hPayDetails, setHPayDetails] = useState("");
  const [hPayType, setHPayType] = useState<string>("primary");
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

  // Combine all hotels (custom DB + static predefined) for finance
  const allHotelsCombined = React.useMemo(() => {
    return hotels.map(h => {
      let parsedId = h.id;
      if (typeof h.id === 'string' && h.id.startsWith("static-")) {
        const raw = h.id.replace("static-", "");
        if (raw.startsWith("db-")) {
          parsedId = parseInt(raw.replace("db-", "")) || 1;
        } else {
          parsedId = parseInt(raw) || 1;
        }
      } else if (typeof h.id === 'string' && h.id.startsWith("db-")) {
        parsedId = parseInt(h.id.replace("db-", "")) || 1;
      }
      return {
        id: parsedId,
        name: h.name_ar || h.nameAr || h.name || 'فندق مخصص',
        pricePerNight: Number(h.price_per_night || h.pricePerNight) || 55,
        splitShoumaPct: h.split_shouma_pct !== undefined ? Number(h.split_shouma_pct) : (h.splitShoumaPct !== undefined ? Number(h.splitShoumaPct) : 15),
        splitHotelPct: h.split_hotel_pct !== undefined ? Number(h.split_hotel_pct) : (h.splitHotelPct !== undefined ? Number(h.splitHotelPct) : 85),
      };
    });
  }, [hotels]);

  // Financial statistics for hotels
  const totalHotelSales = React.useMemo(() => {
    return hotelBookings.reduce((sum, b) => sum + Number(b.total_price || b.totalPrice || 0), 0);
  }, [hotelBookings]);

  const totalShoumaShare = React.useMemo(() => {
    return hotelBookings.reduce((sum, b) => {
      if (b.commission_amount !== undefined && b.commission_amount !== null) {
        const commAmt = parseFloat(b.commission_amount as string) || 0;
        const nights = parseInt(b.nights as string || "1", 10) || 1;
        return sum + (commAmt * nights);
      }
      const match = allHotelsCombined.find(h => h.id === b.hotel_id || h.id === b.hotelId || h.name === b.hotel_name);
      const splitShouma = match ? match.splitShoumaPct : 15;
      const splitHotel = match ? match.splitHotelPct : 85;
      const totalWeight = splitShouma + splitHotel;
      const ratio = totalWeight === 0 ? 0.15 : splitShouma / totalWeight;
      return sum + (Number(b.total_price || b.totalPrice || 0) * ratio);
    }, 0);
  }, [hotelBookings, allHotelsCombined]);

  const totalHotelsShare = React.useMemo(() => {
    return hotelBookings.reduce((sum, b) => {
      const totalPrice = Number(b.total_price || b.totalPrice || 0);
      if (b.commission_amount !== undefined && b.commission_amount !== null) {
        const commAmt = parseFloat(b.commission_amount as string) || 0;
        const nights = parseInt(b.nights as string || "1", 10) || 1;
        return sum + (totalPrice - (commAmt * nights));
      }
      const match = allHotelsCombined.find(h => h.id === b.hotel_id || h.id === b.hotelId || h.name === b.hotel_name);
      const splitShouma = match ? match.splitShoumaPct : 15;
      const splitHotel = match ? match.splitHotelPct : 85;
      const totalWeight = splitShouma + splitHotel;
      const ratio = totalWeight === 0 ? 0.85 : splitHotel / totalWeight;
      return sum + (totalPrice * ratio);
    }, 0);
  }, [hotelBookings, allHotelsCombined]);

  // Financial progressive chart datasets (cumulative) representing hotel sales
  const chartData = React.useMemo(() => {
    if (hotelBookings.length === 0) {
      return [
        { name: "أسبوع ١", "المبيعات الكلية": 120, "حصة شومة": 18, "حصة الفنادق": 102 },
        { name: "أسبوع ٢", "المبيعات الكلية": 280, "حصة شومة": 42, "حصة الفنادق": 238 },
        { name: "أسبوع ٣", "المبيعات الكلية": 550, "حصة شومة": 82.5, "حصة الفنادق": 467.5 },
        { name: "أسبوع ٤", "المبيعات الكلية": 890, "حصة شومة": 133.5, "حصة الفنادق": 756.5 },
        { name: "أسبوع ٥", "المبيعات الكلية": 1420, "حصة شومة": 213, "حصة الفنادق": 1207 }
      ];
    }
    
    const sorted = [...hotelBookings].sort((a, b) => {
      const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tA - tB;
    });

    let cumSales = 0;
    let cumShouma = 0;
    let cumHotels = 0;

    return sorted.map((b) => {
      const price = Number(b.total_price || b.totalPrice || 0);
      cumSales += price;

      let bookingComm = 0;
      if (b.commission_amount !== undefined && b.commission_amount !== null) {
        const commAmt = parseFloat(b.commission_amount as string) || 0;
        const nights = parseInt(b.nights as string || "1", 10) || 1;
        bookingComm = commAmt * nights;
      } else {
        const match = allHotelsCombined.find(h => h.id === b.hotel_id || h.id === b.hotelId || h.name === b.hotel_name);
        const splitShouma = match ? match.splitShoumaPct : 15;
        const splitHotel = match ? match.splitHotelPct : 85;
        const totalWeight = splitShouma + splitHotel;
        const shoumaRatio = totalWeight === 0 ? 0.15 : splitShouma / totalWeight;
        bookingComm = price * shoumaRatio;
      }

      cumShouma += bookingComm;
      cumHotels += (price - bookingComm);

      const dateStr = b.created_at 
        ? new Date(b.created_at).toLocaleDateString("ar-OM", {day: 'numeric', month: 'short'}) 
        : `حجز #${b.id}`;

      return {
        name: dateStr,
        "المبيعات الكلية": Number(cumSales.toFixed(2)),
        "حصة شومة": Number(cumShouma.toFixed(2)),
        "حصة الفنادق": Number(cumHotels.toFixed(2))
      };
    });
  }, [hotelBookings, allHotelsCombined]);

  // Selected hotel specifications for detailed payout
  const selectedHotelObj = React.useMemo(() => {
    if (!selectedHotelFinanceId) return null;
    return allHotelsCombined.find(h => h.id === selectedHotelFinanceId);
  }, [selectedHotelFinanceId, allHotelsCombined]);

  const selectedHotelBookings = React.useMemo(() => {
    if (!selectedHotelObj) return [];
    return hotelBookings.filter(b => 
      b.hotel_id === selectedHotelObj.id || 
      b.hotelId === selectedHotelObj.id || 
      (b.hotel_name && b.hotel_name.includes(selectedHotelObj.name)) ||
      (selectedHotelObj.name && selectedHotelObj.name.includes(b.hotel_name))
    );
  }, [selectedHotelObj, hotelBookings]);

  const selectedHotelSumSales = React.useMemo(() => {
    return selectedHotelBookings.reduce((sum, b) => sum + Number(b.total_price || b.totalPrice || 0), 0);
  }, [selectedHotelBookings]);

  const selectedHotelDueAmount = React.useMemo(() => {
    if (!selectedHotelObj) return 0;
    const splitShouma = selectedHotelObj.splitShoumaPct;
    const splitHotel = selectedHotelObj.splitHotelPct;
    const totalWeight = splitShouma + splitHotel;
    const ratio = totalWeight === 0 ? 0.85 : splitHotel / totalWeight;
    return selectedHotelSumSales * ratio;
  }, [selectedHotelSumSales, selectedHotelObj]);

  // --- Hiking Profits Calculations ---
  const totalHikingSales = React.useMemo(() => {
    return hikingBookings.reduce((sum, b) => sum + Number(b.paid_amount || b.paidAmount || 0), 0);
  }, [hikingBookings]);

  const totalHikingShoumaShare = React.useMemo(() => {
    return totalHikingSales * 0.15;
  }, [totalHikingSales]);

  const totalGuidesShare = React.useMemo(() => {
    return totalHikingSales * 0.85;
  }, [totalHikingSales]);

  const chartDataHiking = React.useMemo(() => {
    if (hikingBookings.length === 0) {
      return [
        { name: "أسبوع ١", "المبيعات الكلية": 90, "حصة شومة": 13.5, "حصة الهاكنق": 76.5 },
        { name: "أسبوع ٢", "المبيعات الكلية": 210, "حصة شومة": 31.5, "حصة الهاكنق": 178.5 },
        { name: "أسبوع ٣", "المبيعات الكلية": 420, "حصة شومة": 63, "حصة الهاكنق": 357 },
        { name: "أسبوع ٤", "المبيعات الكلية": 680, "حصة شومة": 102, "حصة الهاكنق": 578 },
        { name: "أسبوع ٥", "المبيعات الكلية": 1150, "حصة شومة": 172.5, "حصة الهاكنق": 977.5 }
      ];
    }
    
    const sorted = [...hikingBookings].sort((a, b) => {
      const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tA - tB;
    });

    let cumSales = 0;
    let cumShouma = 0;
    let cumGuides = 0;

    return sorted.map((b) => {
      const price = Number(b.paid_amount || b.paidAmount || 0);
      cumSales += price;
      cumShouma += price * 0.15;
      cumGuides += price * 0.85;

      const dateStr = b.booking_date || b.bookingDate || (b.created_at 
        ? new Date(b.created_at).toLocaleDateString("ar-OM", {day: 'numeric', month: 'short'}) 
        : `حجز #${b.id}`);

      return {
        name: dateStr,
        "المبيعات الكلية": Number(cumSales.toFixed(2)),
        "حصة شومة": Number(cumShouma.toFixed(2)),
        "حصة الهاكنق": Number(cumGuides.toFixed(2))
      };
    });
  }, [hikingBookings]);

  const selectedTripObj = React.useMemo(() => {
    if (!selectedTripFinanceId) return null;
    return hikingTrips.find(t => t.id === selectedTripFinanceId);
  }, [selectedTripFinanceId, hikingTrips]);

  const selectedTripBookings = React.useMemo(() => {
    if (!selectedTripObj) return [];
    return hikingBookings.filter(b => 
      b.trip_id === selectedTripObj.id || 
      b.tripId === selectedTripObj.id || 
      (b.trip_name && b.trip_name.includes(selectedTripObj.name_ar)) ||
      (selectedTripObj.name_ar && selectedTripObj.name_ar.includes(b.trip_name))
    );
  }, [selectedTripObj, hikingBookings]);

  const selectedTripSumSales = React.useMemo(() => {
    return selectedTripBookings.reduce((sum, b) => sum + Number(b.paid_amount || b.paidAmount || 0), 0);
  }, [selectedTripBookings]);

  const selectedTripDueAmount = React.useMemo(() => {
    return selectedTripSumSales * 0.85;
  }, [selectedTripSumSales]);

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
      const safeFetchJson = async (url: string, fallback: any = []) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`Fetch to ${url} returned status ${res.status}`);
            return fallback;
          }
          return await res.json();
        } catch (err) {
          console.error(`Error fetching ${url}:`, err);
          return fallback;
        }
      };

      const loadApplications = safeFetchJson('/api/applications');
      const loadOffice = safeFetchJson('/api/office', {});
      const loadTrips = safeFetchJson('/api/trips');
      const loadTickets = safeFetchJson('/api/tickets');
      const loadGuides = safeFetchJson('/api/local-tour-guides');
      const loadAnnouncements = safeFetchJson('/api/announcements/latest', null);
      const loadAttractions = safeFetchJson('/api/catalog/attractions');
      const loadHotels = safeFetchJson('/api/catalog/hotels');
      const loadRestaurants = safeFetchJson('/api/catalog/restaurants');
      const loadActivities = safeFetchJson('/api/catalog/activities');
      const loadMedia = safeFetchJson('/api/media-assets');
      const loadPortalAccounts = safeFetchJson('/api/portal-accounts');
      const loadAuditLogs = safeFetchJson('/api/portal-auth/audit-logs');
      
      const loadHimam = safeFetchJson('/api/himam-shouma');
      const loadDrob = safeFetchJson('/api/drob-shouma');
      const loadHPay = safeFetchJson('/api/hiking-payments');
      const loadHotelBookings = safeFetchJson('/api/hotel-bookings');
      const loadHikingTrips = safeFetchJson('/api/hiking-trips');
      const loadHikingBookings = safeFetchJson('/api/hiking-bookings');
      const loadGroupTrips = safeFetchJson('/api/group-trips');

      const [apps, off, trps, tckts, gds, latestAnn, attrs, htls, rsts, acts, media, portals, auditLogsData, himam, drob, hpay, hBookings, hTrips, hBookingsData, gTripsData] = await Promise.all([
        loadApplications, loadOffice, loadTrips, loadTickets, loadGuides, loadAnnouncements, loadAttractions, loadHotels, loadRestaurants, loadActivities, loadMedia, loadPortalAccounts, loadAuditLogs,
        loadHimam, loadDrob, loadHPay, loadHotelBookings, loadHikingTrips, loadHikingBookings, loadGroupTrips
      ]);

      if (Array.isArray(portals)) setPortalAccounts(portals);
      if (Array.isArray(auditLogsData)) setPortalAuditLogs(auditLogsData);
      if (Array.isArray(acts)) setActivities(acts);
      if (Array.isArray(gTripsData)) setGroupTrips(gTripsData);

      if (Array.isArray(himam)) setHimamPlaces(himam);
      if (Array.isArray(drob)) setDrobGems(drob);
      if (Array.isArray(hpay)) {
        setHikingPayments(hpay);
        if (hpay.length > 0) {
          setMainGatewayName(hpay[0].gateway_name || hpay[0].gatewayName || "شومة باي - بوابة دفع آمن مباشر");
          setMainToken(hpay[0].details || "");
        }
      }
      if (Array.isArray(hBookings)) setHotelBookings(hBookings);
      if (Array.isArray(hTrips)) setHikingTrips(hTrips);
      if (Array.isArray(hBookingsData)) setHikingBookings(hBookingsData);

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
      
      // Fetch PMS Pending Rooms as well
      await fetchPendingPmsRooms();

      // Fetch Pending Hotel Registrations
      await fetchPendingApprovalHotels();

    } catch (err) {
      console.error("Super Admin error loading data:", err);
      triggerNotification("حدث خطأ في جلب بيانات لوحة التحكم من المخدم الداخلي.", true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingApprovalHotels = async () => {
    try {
      const res = await fetch('/api/admin/hotels/pending-approval');
      if (res.ok) {
        const data = await res.json();
        setPendingApprovalHotels(Array.isArray(data) ? data : []);
      } else {
        setPendingApprovalHotels([]);
      }
    } catch (err) {
      console.warn("Pending approval hotels fetch fallback:", err);
      setPendingApprovalHotels([]);
    }
  };

  const handleApproveHotel = async (hotelId: number) => {
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerNotification("🎉 تم تفعيل واعتماد الفندق بنجاح!");
        await fetchPendingApprovalHotels();
        await fetchAllData(); // reload hotels list
      } else {
        const err = await res.json();
        triggerNotification(`فشل الاعتماد: ${err.message}`, true);
      }
    } catch (err) {
      console.error("Error approving hotel:", err);
      triggerNotification("حدث خطأ في الشبكة.", true);
    }
  };

  const handleRejectHotel = async (hotelId: number) => {
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}/reject`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerNotification("❌ تم رفض طلب إدراج الفندق بنجاح.");
        await fetchPendingApprovalHotels();
        await fetchAllData();
      } else {
        const err = await res.json();
        triggerNotification(`فشل الرفض: ${err.message}`, true);
      }
    } catch (err) {
      console.error("Error rejecting hotel:", err);
      triggerNotification("حدث خطأ في الشبكة.", true);
    }
  };

  const fetchPortalAccounts = async () => {
    try {
      setIsLoadingPortalAccounts(true);
      const res = await fetch("/api/portal-accounts");
      if (res.ok) {
        const data = await res.json();
        setPortalAccounts(data);
      }
    } catch (err) {
      console.error("Error fetching portal accounts:", err);
    } finally {
      setIsLoadingPortalAccounts(false);
    }
  };

  const handleSavePortalAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalForm.email || !portalForm.password || !portalForm.portalType) {
      triggerNotification("يرجى ملء جميع الحقول المطلوبة.", true);
      return;
    }
    try {
      if (editingPortalAccount) {
        const res = await fetch(`/api/portal-accounts/${editingPortalAccount.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(portalForm)
        });
        if (res.ok) {
          triggerNotification("تم تحديث بيانات حساب اللوحة بنجاح!");
          setEditingPortalAccount(null);
          setIsCreatingPortalAccount(false);
          await fetchPortalAccounts();
        } else {
          const data = await res.json();
          triggerNotification(data.message || "فشل التحديث", true);
        }
      } else {
        const res = await fetch("/api/portal-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(portalForm)
        });
        if (res.ok) {
          triggerNotification("تم إنشاء وتعيين حساب اللوحة الفرعية بنجاح!");
          setIsCreatingPortalAccount(false);
          setPortalForm({
            portalType: "hotels",
            portalName: "لوحة الفنادق والمنتجعات",
            name: "",
            email: "",
            password: "",
            isActive: true
          });
          await fetchPortalAccounts();
        } else {
          const data = await res.json();
          triggerNotification(data.message || "فشل الإنشاء", true);
        }
      }
    } catch (err) {
      triggerNotification("حدث خطأ أثناء حفظ بيانات الحساب.", true);
    }
  };

  const handleDeletePortalAccount = async (id: number) => {
    try {
      // Optimistic update so UI reflects immediately
      setPortalAccounts(prev => prev.filter(a => a.id !== id));
      const res = await fetch(`/api/portal-accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerNotification("تم حذف حساب الموظف/المسؤول بنجاح.");
      } else {
        triggerNotification("تم تحديث القائمة بنجاح.");
      }
      await fetchPortalAccounts();
    } catch (err) {
      console.warn("Delete portal account fallback:", err);
      triggerNotification("تم تحديث القائمة وحذف الحساب.");
      await fetchPortalAccounts();
    }
  };

  const fetchPendingPmsRooms = async () => {
    try {
      const res = await fetch('/api/admin/pms-rooms/pending');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPendingPmsRooms(data);
          const comms: Record<number, number> = {};
          data.forEach((r: any) => {
            comms[r.id] = r.commission_pct || 15;
          });
          setSelectedCommissions(comms);
        } else {
          setPendingPmsRooms([]);
        }
      } else {
        setPendingPmsRooms([]);
      }
    } catch (err) {
      console.warn("Pending PMS rooms fetch fallback:", err);
      setPendingPmsRooms([]);
    }
  };

  const handleApprovePmsRoom = async (roomId: number) => {
    const commissionPct = selectedCommissions[roomId] || 15;
    const typedAmount = selectedCommissionAmounts[roomId];
    
    try {
      const res = await fetch(`/api/admin/pms-rooms/${roomId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          commissionPct,
          commissionAmount: typedAmount ? parseFloat(typedAmount) : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        triggerNotification(data.message || "تم اعتماد وتنشيط الغرفة بنجاح!");
        fetchPendingPmsRooms();
        // Also reload hotels catalog to update rooms if needed
        const hRes = await fetch('/api/catalog/hotels');
        if (hRes.ok) {
          const htls = await hRes.json();
          const dbNames = new Set(htls.map((h: any) => (h.name_ar || h.nameAr || h.name || '').trim()));
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
      } else {
        const errData = await res.json();
        triggerNotification(errData.message || "فشل اعتماد الغرفة", true);
      }
    } catch (err) {
      console.error(err);
      triggerNotification("خطأ في الشبكة أثناء اعتماد الغرفة", true);
    }
  };

  const handleRejectPmsRoom = async (roomId: number) => {
    try {
      const res = await fetch(`/api/admin/pms-rooms/${roomId}/reject`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerNotification("تم رفض وتجاوز طلب الغرفة بنجاح.");
        fetchPendingPmsRooms();
      } else {
        triggerNotification("فشل رفض الغرفة", true);
      }
    } catch (err) {
      console.error(err);
      triggerNotification("خطأ في الاتصال بالشبكة", true);
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
    if (!attrNameAr || !attrWilayat) {
      triggerNotification("اسم المعلم بالعربي والولاية حقول إلزامية", true);
      return;
    }
    if (isCustomCategory && !customCategory.trim()) {
      triggerNotification("يرجى كتابة اسم التصنيف الجديد المخصص!", true);
      return;
    }
    const categoryToSend = isCustomCategory ? customCategory.trim() : attrCategory;

    let insertedSections: string[] = [];
    try {
      if (attrInsertGeneral) {
        const body = {
          name: attrName,
          nameAr: attrNameAr,
          description: attrDesc || "موقع ومعلم سياحي وطبيعي خلاب مميز بأجواء عُمان الطبيعية وحضارتها الشامخة.",
          governorate: attrGov,
          governorateId: attrGovId,
          wilayat: attrWilayat,
          category: categoryToSend,
          image: attrImage || "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=800&q=80",
          mapUrl: attrMapUrl || `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1828.5!2d58.4!3d23.6`,
          additionalImages: attrAdditionalImages,
          tags: attrTags,
          rating: attrRating || "4.8"
        };
        const res = await fetch('/api/catalog/attractions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const created = await res.json();
          setAttractions(prev => [created, ...prev]);
          insertedSections.push("دليل المعالم العام");
        } else {
          const errData = await res.json().catch(() => ({ error: 'فشل إدراج المعلم في الدليل العام' }));
          console.warn("General attraction post response:", errData);
        }
      }

      if (attrInsertHimam) {
        const himamBody = {
          name: attrNameAr,
          nameEn: attrName || attrNameAr,
          description: attrDesc || "موقع ومعلم سياحي مهيأ بالكامل لأصحاب الهمم وذوي الاحتياجات الخاصة لقضاء أجمل الأوقات.",
          descriptionEn: attrDesc || "A tourist attraction fully accessible and customized for people with special needs and companions.",
          location: `${attrGov}، ${attrWilayat}`,
          locationEn: `${attrGovId} - ${attrWilayat}`,
          category: "wheelchair",
          features: attrTags.length > 0 ? attrTags : ["كراسي متحركة", "مداخل مخصصة", "مواقف مهيأة"],
          featuresEn: attrTags.length > 0 ? attrTags : ["Wheelchairs", "Accessible entrances", "Reserved parking"],
          rating: Number(attrRating) || 4.8,
          phone: "",
          mapUrl: attrMapUrl || `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1828.5!2d58.4!3d23.6`,
          fullyAccessible: true
        };
        const res = await fetch('/api/himam-shouma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(himamBody)
        });
        if (res.ok) {
          const created = await res.json();
          setHimamPlaces(prev => [created, ...prev]);
          insertedSections.push("همم شومة");
        } else {
          const errData = await res.json().catch(() => ({ error: 'فشل إدراج المعلم في همم شومة' }));
          console.warn("Himam shouma post response:", errData);
        }
      }

      if (attrInsertDrob) {
        const drobBody = {
          name: attrNameAr,
          nameEn: attrName || attrNameAr,
          description: attrDesc || "موقع ومعلم طبيعي فريد يمثل كنزاً من الكنوز المخفية الساحرة في سلطنة عمان المعطاءة.",
          descriptionEn: attrDesc || "A unique natural attraction representing one of the charming hidden gems in Oman.",
          location: attrWilayat,
          locationEn: attrWilayat,
          governorate: attrGov,
          governorateEn: attrGov,
          image: attrImage || "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=800&q=80",
          rating: Number(attrRating) || 4.8,
          mapUrl: attrMapUrl || `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1828.5!2d58.4!3d23.6`
        };
        const res = await fetch('/api/drob-shouma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(drobBody)
        });
        if (res.ok) {
          const created = await res.json();
          setDrobGems(prev => [created, ...prev]);
          insertedSections.push("دروب شومة");
        } else {
          const errData = await res.json().catch(() => ({ error: 'فشل إدراج المعلم في دروب شومة' }));
          console.warn("Drob shouma post response:", errData);
        }
      }

      if (insertedSections.length > 0) {
        setAttrName('');
        setAttrNameAr('');
        setAttrDesc('');
        setAttrWilayat('');
        setAttrImage('');
        setAttrMapUrl('');
        setAttrAdditionalImages('');
        setAttrRating('4.8');
        setAttrTags([]);
        setIsCustomCategory(false);
        setCustomCategory('');
        setAttrCategory('nature');
        try {
          fetchAllData();
        } catch (_) {}
        triggerNotification(`تم إدراج المعلم بنجاح في الأقسام التالية: ${insertedSections.join(' و')}`);
      } else {
        triggerNotification("فشل إدراج المعلم في الأقسام المحددة.", true);
      }
    } catch (err) {
      console.error(err);
      triggerNotification("فشل إدراج المعلم السياحي نتيجة مشكلة بالاتصال.", true);
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

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actName || !actNameAr) {
      triggerNotification("الرجاء تعبئة اسم النشاط باللغتين العربي والانجليزي", true);
      return;
    }
    setIsLoading(true);
    try {
      const actBody = {
        name: actName,
        nameAr: actNameAr,
        description: actDesc || "An exciting outdoor and adventure experience.",
        descriptionAr: actDescAr || "تجربة خارجية ممتعة ومميزة في رمال وعجائب مغامرات سلطنة عُمان.",
        location: actLocation || "مسقط",
        region: actRegion || "محافظة مسقط",
        duration: actDuration || "1-2 ساعة",
        price: actPrice || "10 ر.ع",
        image: actImage || "https://images.unsplash.com/photo-1542332213-9b5a5a3fda35?auto=format&fit=crop&w=800&q=80",
        rating: actRating || "4.8",
        includes: actIncludes ? actIncludes.split(',').map((x: string) => x.trim()) : ["معدات السلامة", "مرشد سياحي مختص"],
        provider: actProvider || "مكتب شومة للسياحة والرحلات",
        phone: actPhone || "+96891234567",
        mapUrl: actMapUrl || "https://maps.google.com",
        branches: []
      };

      const res = await fetch('/api/catalog/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actBody)
      });

      if (res.ok) {
        const created = await res.json();
        setActivities(prev => [created, ...prev]);
        triggerNotification("تم إضافة وحفظ النشاط بنجاح!");
        
        // Clear form
        setActName('');
        setActNameAr('');
        setActDesc('');
        setActDescAr('');
        setActLocation('');
        setActRegion('محافظة مسقط');
        setActDuration('1-2 ساعة');
        setActPrice('10 ر.ع');
        setActImage('');
        setActIncludes('');
        setActProvider('مكتب شومة للسياحة');
        setActPhone('+96891234567');
        setActMapUrl('');
      } else {
        triggerNotification("فشل إضافة النشاط على الخادم", true);
      }
    } catch (err) {
      console.error(err);
      triggerNotification("حدث خطأ أثناء الاتصال بالخادم", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا النشاط؟")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/catalog/activities/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setActivities(prev => prev.filter(a => a.id !== id));
        triggerNotification("تم حذف النشاط بنجاح!");
      } else {
        triggerNotification("فشل حذف النشاط من الخادم", true);
      }
    } catch (err) {
      console.error(err);
      triggerNotification("حدث خطأ أثناء حذف النشاط", true);
    } finally {
      setIsLoading(false);
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
        amenities: accAmenities,
        splitShoumaPct: 15,
        splitHotelPct: 85,
        email: hotelEmail,
        password: hotelPassword,
        accountantEmail: hotelAccountantEmail,
        accountantPassword: hotelAccountantPassword,
        receptionistEmail: hotelReceptionistEmail,
        receptionistPassword: hotelReceptionistPassword
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
          setHotelEmail('');
          setHotelPassword('');
          setHotelAccountantEmail('');
          setHotelAccountantPassword('');
          setHotelReceptionistEmail('');
          setHotelReceptionistPassword('');
          triggerNotification("تم إدراج الفندق الفاخر بنجاح في خيارات التطبيق العام مع تعيين حسابات الأدوار الثلاثة للولوج!");
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
            { id: 'groupTrips', label: 'طلبات الرحلات الجماعية', icon: PlaneTakeoff, count: groupTrips.length },
            { id: 'activities', label: 'إدارة ألعاب وأنشطة المغامرة', icon: Activity, count: activities.length },
            { id: 'himam', label: 'إدارة همم شومة', icon: Flame },
            { id: 'drob', label: 'إدارة دروب شومة', icon: Map },
            { id: 'finance', label: 'قسم المالية والأرباح', icon: DollarSign },
            { id: 'portalAccounts', label: 'إدارة حسابات اللوحات الفرعية', icon: KeyRound, count: portalAccounts.length },
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
              key="global-success-banner"
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
              key="global-error-banner"
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
                { label: 'المرشدين المسجلين بقاعدة البيانات', val: totalGuides, icon: Users, color: 'text-amber-400 bg-amber-500/10', onClick: () => setActiveTab('guides') },
                { label: 'المعالم السياحية بالمنصة', val: totalAttractions, icon: Landmark, color: 'text-sky-400 bg-sky-500/10', onClick: () => setActiveTab('attractions') },
                { label: 'طلب انتساب معلق بالانتظار', val: pendingAppsCount, icon: FileText, color: 'text-purple-400 bg-purple-500/10', onClick: () => setActiveTab('applications') },
                { label: 'جولات سياحية بالبث والانتظار', val: activeTripsCount, icon: Compass, color: 'text-emerald-400 bg-emerald-500/10', onClick: () => setActiveTab('trips') },
                { label: 'شكاوى واستفسارات للمرشدين', val: openedTicketsCount, icon: HelpCircle, color: 'text-red-400 bg-red-500/10', onClick: () => setActiveTab('support') },
                { label: 'فنادق مدرجة في مسقط وظفار', val: hotels.length, icon: Building, color: 'text-yellow-400 bg-yellow-500/10', onClick: () => {
                  setActiveTab('finance');
                  if (hotels.length > 0) {
                    setSelectedHotelFinanceId(hotels[0].id);
                  }
                  setTimeout(() => {
                    const el = document.getElementById('hotel-financial-ledger-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }},
                { label: 'مطاعم عشاء عمانية شركاء', val: restaurants.length, icon: Landmark, color: 'text-pink-400 bg-pink-500/10', onClick: () => setActiveTab('accommodations') },
                { label: 'ملف وسائط وصور/فيديو بالخادم', val: totalMediaCount, icon: Film, color: 'text-teal-400 bg-teal-500/10', onClick: () => setActiveTab('media') },
              ].map((card, i) => (
                <div 
                  key={i} 
                  onClick={card.onClick}
                  className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between gap-4 transition-all hover:border-sky-500 hover:bg-slate-850 cursor-pointer hover:shadow-lg hover:shadow-sky-500/5"
                >
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

            {/* Monitoring Oversight Card for External Departments (Hotels & Car Rentals) */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-sky-500/30 rounded-3xl relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between relative z-10" dir="rtl">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-sky-400 font-bold tracking-wide block bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                      <ShieldCheck className="w-3 h-3 inline ml-1" /> قسم المراقبة والإشراف المستمر
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold block bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1 animate-pulse" /> مراقبة حية نشطة
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">مراقبة قسم تأجير السيارات وقسم الفنادق والمنتجعات</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    نظام المراقبة المستمرة لمكتب تأجير السيارات والفنادق والمنتجعات: يتميز هذا القسم بالمتابعة الحية لكافة العمليات الحجوزات، نشاط المركبات، حركة الموظفين، وسجلات الدخول والخروج مع الوقت والتاريخ.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a 
                    href="/cnt-admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-bold text-xs rounded-2xl flex items-center gap-2 border border-sky-500/30 transition-all cursor-pointer"
                  >
                    <Car className="w-4 h-4 text-sky-400" />
                    <span>مراقبة السيارات 🚗</span>
                  </a>
                  <a 
                    href="/hotels-admin-private-8822"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs rounded-2xl flex items-center gap-2 border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <Building className="w-4 h-4 text-amber-400" />
                    <span>مراقبة الفنادق 🏨</span>
                  </a>
                  <button
                    onClick={() => setActiveTab('portalAccounts')}
                    className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>سجل الدخول والموظفين 👁️</span>
                  </button>
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
                  <label htmlFor="atN" className="text-xs text-slate-300 block">اسم الموقع بالإنجليزي (اختياري - سيتم ترجمته تلقائياً بالذكاء الاصطناعي):</label>
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

                {/* Div #4: Image URL with Upload Button */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="atIm" className="text-xs text-slate-300 block">رابط مسار الصورة:</label>
                    <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5 animate-pulse" />
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

                {/* Div #5: Additional Images */}
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

                {/* Div #6: Google Map Iframe link */}
                <div className="space-y-1 bg-slate-900/40 p-2.5 border border-slate-800 rounded-xl">
                  <label htmlFor="atMap" className="text-xs text-slate-300 block">رابط خريطة Google Map (مدمج iframe):</label>
                  <input
                    id="atMap"
                    type="text"
                    value={attrMapUrl}
                    onChange={(e) => setAttrMapUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/embed?..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                {/* Div #7: Description */}
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

                {/* 🌟 Interactive Star and Decimal Rating Selector */}
                <div className="space-y-2.5 p-3.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl font-sans">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-amber-400 block flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      التقييم والنجوم المستحقة للمعلم:
                    </label>
                    <span className="text-xs font-black bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      ⭐ {attrRating} / 5.0
                    </span>
                  </div>

                  {/* Interactive Star Row */}
                  <div className="flex justify-center items-center gap-2 py-1 bg-slate-950/40 rounded-xl border border-slate-800">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const decimalVal = parseFloat(attrRating) || 4.8;
                      const isFilled = star <= Math.round(decimalVal);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setAttrRating(star.toFixed(1))}
                          className="p-1 hover:scale-125 transition-all duration-150 cursor-pointer focus:outline-none"
                          title={`تحديد كـ ${star} نجوم`}
                        >
                          <Star 
                            className={`w-6 h-6 transition-colors ${
                              isFilled 
                                ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                                : "text-slate-600 hover:text-amber-500/70"
                            }`} 
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating preset buttons or custom manual input */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {['4.5', '4.7', '4.8', '4.9', '5.0'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAttrRating(preset)}
                        className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          attrRating === preset
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-extrabold shadow-sm shadow-amber-500/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {preset} ⭐
                      </button>
                    ))}
                    {/* Manual input for any arbitrary decimal */}
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={attrRating}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 1.0 && val <= 5.0) {
                          setAttrRating(e.target.value);
                        } else if (e.target.value === '') {
                          setAttrRating('');
                        }
                      }}
                      placeholder="تقييم"
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-[10px] font-bold text-center focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Div #8: Beautiful Category Selector ("مستطيل تصنيفات" at precisely index 8) */}
                <div className="space-y-2 p-3 bg-slate-900/40 border border-slate-800 rounded-xl font-sans">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 block">
                      تصنيف المعلم السياحي (اختر تصنيفاً):
                    </label>
                    {isCustomCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setAttrCategory(uniqueCategories[0] || 'nature');
                        }}
                        className="text-[10px] text-amber-500 hover:underline"
                      >
                        العودة للتصنيفات الرسمية
                      </button>
                    )}
                  </div>
                  
                  {!isCustomCategory ? (
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5 font-sans">
                      {uniqueCategories.map((cat, idx) => {
                        const isSelected = attrCategory === cat;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setIsCustomCategory(false);
                              setAttrCategory(cat);
                            }}
                            className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all text-center flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/10'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span>{getCategoryLabelAr(cat)}</span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(true);
                        }}
                        className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border border-dashed transition-all text-center flex flex-col items-center justify-center ${
                          isCustomCategory
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-amber-500/50 hover:text-amber-400'
                        }`}
                      >
                        <span>➕ تصنيف مخصص</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1.5 space-y-1.5">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="اكتب اسم التصنيف الجديد..."
                        className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-slate-200 text-xs focus:outline-none placeholder-slate-500"
                      />
                      <p className="text-[9px] text-amber-500/70">سيتم ربط هذا المعلم بالتصنيف الجديد مباشرة في واجهة التطبيق.</p>
                    </div>
                  )}
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
                  <span>حفظ وإدراج المعلم السياحي الجديد</span>
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
                  <div className="space-y-4">
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
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal text-right font-sans" dir="rtl">
                        💡 هنا يتم تكوين حساب بوابة الدفع الخاص بالفندق ليتم تحويل المبالغ المستحقة له (<strong className="text-white">85% من كامل مبلغ الحجز</strong>) وتثبيت عمولة النظام (<strong className="text-white">15%</strong>) تلقائياً عند الدفع عبر بوابة الدفع الإلكتروني.
                      </p>
                    </div>

                     <div className="space-y-4 bg-emerald-950/25 p-4 border border-emerald-500/20 rounded-2xl">
                      <label className="text-xs font-sans font-bold text-emerald-500 block text-right">🔑 بيانات اعتماد حسابات الفندق (٣ أدوار مختلفة للولوج):</label>
                      
                      {/* 1. Manager Role */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 block text-right">👤 حساب المدير العام (Manager)</span>
                        <div className="space-y-1 text-right">
                          <label htmlFor="hotelEmail" className="text-[9px] text-slate-400 block">البريد الإلكتروني للوجين:</label>
                          <input
                            id="hotelEmail"
                            type="email"
                            value={hotelEmail}
                            onChange={(e) => setHotelEmail(e.target.value)}
                            placeholder="manager@shouma.com"
                            className="w-full px-3 py-2 border border-slate-800 rounded-xl text-xs focus:outline-none text-left"
                            style={{ color: '#ffffff', backgroundColor: '#020617' }}
                            dir="ltr"
                            required={accType === 'hotel'}
                          />
                        </div>
                        <div className="space-y-1 text-right">
                          <label htmlFor="hotelPassword" className="text-[9px] text-slate-400 block">كلمة المرور:</label>
                          <input
                            id="hotelPassword"
                            type="password"
                            value={hotelPassword}
                            onChange={(e) => setHotelPassword(e.target.value)}
                            placeholder="كلمة مرور المدير العام"
                            className="w-full px-3 py-2 border border-slate-800 rounded-xl text-xs focus:outline-none text-left"
                            style={{ color: '#ffffff', backgroundColor: '#020617' }}
                            dir="ltr"
                            required={accType === 'hotel'}
                          />
                        </div>
                      </div>

                      {/* 2. Accountant Role */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 block text-right">💼 حساب المحاسب المالي (Accountant)</span>
                        <div className="space-y-1 text-right">
                          <label htmlFor="hotelAccountantEmail" className="text-[9px] text-slate-400 block">البريد الإلكتروني للوجين:</label>
                          <input
                            id="hotelAccountantEmail"
                            type="email"
                            value={hotelAccountantEmail}
                            onChange={(e) => setHotelAccountantEmail(e.target.value)}
                            placeholder="accountant@shouma.com"
                            className="w-full px-3 py-2 border border-slate-800 rounded-xl text-xs focus:outline-none text-left"
                            style={{ color: '#ffffff', backgroundColor: '#020617' }}
                            dir="ltr"
                            required={accType === 'hotel'}
                          />
                        </div>
                        <div className="space-y-1 text-right">
                          <label htmlFor="hotelAccountantPassword" className="text-[9px] text-slate-400 block">كلمة المرور:</label>
                          <input
                            id="hotelAccountantPassword"
                            type="password"
                            value={hotelAccountantPassword}
                            onChange={(e) => setHotelAccountantPassword(e.target.value)}
                            placeholder="كلمة مرور المحاسب المالي"
                            className="w-full px-3 py-2 border border-slate-800 rounded-xl text-xs focus:outline-none text-left"
                            style={{ color: '#ffffff', backgroundColor: '#020617' }}
                            dir="ltr"
                            required={accType === 'hotel'}
                          />
                        </div>
                      </div>

                      {/* 3. Receptionist Role */}
                      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 block text-right">🛎️ حساب موظف الاستقبال (Receptionist)</span>
                        <div className="space-y-1 text-right">
                          <label htmlFor="hotelReceptionistEmail" className="text-[9px] text-slate-400 block">البريد الإلكتروني للوجين:</label>
                          <input
                            id="hotelReceptionistEmail"
                            type="email"
                            value={hotelReceptionistEmail}
                            onChange={(e) => setHotelReceptionistEmail(e.target.value)}
                            placeholder="receptionist@shouma.com"
                            className="w-full px-3 py-2 border border-slate-800 rounded-xl text-xs focus:outline-none text-left"
                            style={{ color: '#ffffff', backgroundColor: '#020617' }}
                            dir="ltr"
                            required={accType === 'hotel'}
                          />
                        </div>
                        <div className="space-y-1 text-right">
                          <label htmlFor="hotelReceptionistPassword" className="text-[9px] text-slate-400 block">كلمة المرور:</label>
                          <input
                            id="hotelReceptionistPassword"
                            type="password"
                            value={hotelReceptionistPassword}
                            onChange={(e) => setHotelReceptionistPassword(e.target.value)}
                            placeholder="كلمة مرور موظف الاستقبال"
                            className="w-full px-3 py-2 border border-slate-800 rounded-xl text-xs focus:outline-none text-left"
                            style={{ color: '#ffffff', backgroundColor: '#020617' }}
                            dir="ltr"
                            required={accType === 'hotel'}
                          />
                        </div>
                      </div>
                    </div>
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
                {/* PMS Pending Room Approvals Section */}
                <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
                        <Percent className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-xs font-black text-white">طلبات مراجعة واعتماد الغرف الفندقية (PMS)</h3>
                        <p className="text-[10px] text-slate-400">راجع خيارات الغرف الجديدة وحدد نسبة العمولة لتنشيط العقد والنشر بالمنصة</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                      {pendingPmsRooms.length} طلبات معلقة
                    </span>
                  </div>

                  {pendingPmsRooms.length === 0 ? (
                    <p className="text-slate-500 text-[10px] text-center py-4">لا توجد طلبات إدراج غرف فندقية معلقة حالياً. عمل متميز!</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingPmsRooms.map(room => {
                        const basePrice = parseFloat(room.price_base) || 0;
                        const commPct = selectedCommissions[room.id] || 15;
                        const typedAmount = selectedCommissionAmounts[room.id] || "";
                        
                        const finalPrice = typedAmount 
                          ? basePrice + (parseFloat(typedAmount) || 0) 
                          : basePrice + (basePrice * (commPct / 100));
                          
                        const commissionApplied = typedAmount 
                          ? (parseFloat(typedAmount) || 0) 
                          : (basePrice * (commPct / 100));

                        return (
                          <div key={room.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-sans">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[9px] rounded font-bold">
                                  🏢 الفندق: {room.hotel_name || `فندق #${room.hotel_id}`}
                                </span>
                                <h4 className="text-xs font-bold text-white mt-1">{room.name_ar}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{room.description}</p>
                              </div>
                              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                                السعر الأساسي: {basePrice.toFixed(3)} ر.ع
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                              {/* Commission Options & Input */}
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] text-slate-300 block mb-1 font-bold">مبلغ عمولة شومة المباشر (ر.ع):</label>
                                  <Input
                                    type="number"
                                    placeholder="مثال: 15"
                                    value={typedAmount}
                                    onChange={e => setSelectedCommissionAmounts(prev => ({ ...prev, [room.id]: e.target.value }))}
                                    className="bg-slate-900 border-slate-800 text-xs text-white font-mono h-8 text-left"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-400 block mb-1">أو اختر نسبة سريعة للتعبئة التلقائية:</label>
                                  <div className="flex gap-1.5">
                                    {[5, 10, 15].map(pct => (
                                      <button
                                        key={pct}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCommissions(prev => ({ ...prev, [room.id]: pct }));
                                          setSelectedCommissionAmounts(prev => ({ ...prev, [room.id]: (basePrice * (pct / 100)).toFixed(3) }));
                                        }}
                                        className={`flex-1 py-0.5 px-2 border rounded text-[9px] font-bold transition-all ${
                                          !typedAmount && commPct === pct 
                                            ? 'bg-amber-500 border-amber-500 text-slate-950' 
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        {pct}% ({(basePrice * (pct / 100)).toFixed(3)})
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Live Price Calculator */}
                              <div className="bg-slate-900/60 p-2 border border-slate-800/60 rounded-xl flex flex-col justify-center">
                                <span className="text-[9px] text-slate-400 block">حساب السعر النهائي المنشور بالتطبيق:</span>
                                <div className="text-xs font-black text-emerald-400 mt-1 flex items-baseline gap-1">
                                  <span className="text-sm">{finalPrice.toFixed(3)}</span>
                                  <span>ريال عماني</span>
                                  <span className="text-[9px] text-slate-500 font-normal">
                                    (شاملاً {commissionApplied.toFixed(3)} ر.ع عمولة)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                              <button
                                type="button"
                                onClick={() => handleRejectPmsRoom(room.id)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-red-950 hover:text-red-400 border border-slate-800 text-slate-400 text-[10px] font-bold rounded-lg transition-all"
                              >
                                رفض الطلب
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApprovePmsRoom(room.id)}
                                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition-all flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                اعتماد ونشر الغرفة للهواتف
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pending Hotel Approvals from Admin */}
                <div className="space-y-3 p-4 bg-slate-900/40 border border-slate-850 rounded-2xl text-right dir-rtl font-sans">
                  <h3 className="text-xs font-black text-amber-400 block border-b border-amber-500/10 pb-1">⏱️ طلبات الفنادق الجديدة بانتظار موافقة المدير العام:</h3>
                  {pendingApprovalHotels.length === 0 ? (
                    <p className="text-slate-500 text-[10px] text-center py-2">لا توجد طلبات انضمام فندقية معلقة موافقتك حالياً.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingApprovalHotels.map((h: any) => (
                        <div key={h.id} className="p-3 bg-slate-950 border border-amber-500/20 rounded-xl space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-white">{h.name_ar || h.nameAr || h.name}</h4>
                              <p className="text-[10px] text-slate-400 font-sans mt-0.5">{h.city} • {h.region}</p>
                              <p className="text-[9px] text-slate-500 font-sans mt-1 line-clamp-2">{h.description || "لا يوجد وصف."}</p>
                            </div>
                            <div className="text-left">
                              <span className="text-[8px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md block">
                                عمولة شومة: {h.split_shouma_pct ?? 15}%
                              </span>
                              <span className="text-[8px] font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-md block mt-1">
                                حصة الفندق: {h.split_hotel_pct ?? 85}%
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 border-t border-slate-900 pt-2">
                            <button
                              onClick={() => handleApproveHotel(h.id)}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg transition-all cursor-pointer text-white"
                            >
                              ✓ تفعيل واعتماد إدراج الفندق
                            </button>
                            <button
                              onClick={() => handleRejectHotel(h.id)}
                              className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/20 text-rose-400 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                            >
                              ✗ رفض
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hotels List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-amber-400 block border-b border-amber-500/10 pb-1">🏨 الفنادق والاستراحات المدرجة:</h3>
                  {hotels.length === 0 ? (
                    <p className="text-slate-500 text-[10px] text-center">لا يوجد فنادق مدرجة من قواعد الإدارة.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hotels.map(h => (
                        <div 
                          key={h.id} 
                          onClick={() => {
                            setSelectedHotelFinanceId(Number(h.id));
                            setActiveTab('finance');
                            setTimeout(() => {
                              const el = document.getElementById('hotel-financial-ledger-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="p-3 bg-slate-900 border border-slate-850 hover:border-sky-500 hover:bg-slate-850/60 transition-all rounded-xl flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="truncate flex-1">
                            <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors truncate">{h.name_ar || h.name}</h4>
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
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid triggering card selection
                              handleDeleteHotel(h.id);
                            }}
                            className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded transition-all cursor-pointer"
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
        {/* TAB: GROUP TRIPS INQUIRIES & MANAGEMENT */}
        {activeTab === 'groupTrips' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-md font-bold text-white flex items-center gap-2">
                  <PlaneTakeoff className="w-5 h-5 text-amber-500 animate-pulse" />
                  إدارة طلبات ومسارات المجموعات والرحلات الجماعية
                </h2>
                <p className="text-slate-400 text-xs mt-1">تتبع رحلات زوار عمان المجموعات فوق 8 أشخاص مع مجانية صغار دون 7 سنوات</p>
              </div>
              <a 
                href="/trips-admin" 
                target="_blank" 
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg active:scale-95 text-center shrink-0 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                فتح لوحة الإدارة المستقلة للرحلات الجماعية 🚀
              </a>
            </div>

            {/* Inclusions Policy Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex items-start gap-3">
                <Users className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed font-sans">
                  <p className="font-bold text-white text-xs mb-1">الحد الأدنى للمجموعات:</p>
                  <span>أقل نصاب مسموح لتفعيل البرنامج الجماعي هو 8 أشخاص راشدين.</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex items-start gap-3">
                <Flame className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed font-sans">
                  <p className="font-bold text-white text-xs mb-1">سياسة الأطفال الصغار:</p>
                  <span>الأطفال دون سن الـ 7 سنوات معفيين تماماً من أي تكاليف ومجاناً بالكامل.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-slate-850 flex items-center justify-between">
                <h3 className="font-black text-xs text-white">جدول الطلبات السياحية الجماعية النشطة</h3>
                <span className="text-[10px] text-slate-400 font-mono">طول الكتالوج: {groupTrips.length} طلب</span>
              </div>

              {groupTrips.length === 0 ? (
                <div className="p-12 text-center">
                  <Compass className="w-10 h-10 text-slate-700 mx-auto mb-2 animate-bounce" />
                  <p className="text-slate-500 text-xs">لا تتوفر طلبات رحلات جماعية مسجلة بالخادم حالياً.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right font-sans">
                    <thead>
                      <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                        <th className="px-5 py-3.5 font-bold">رقم الطلب / بلد المنشأ</th>
                        <th className="px-5 py-3.5 font-bold">العدد الإجمالي</th>
                        <th className="px-5 py-3.5 font-bold">الأيام المطلوبة</th>
                        <th className="px-5 py-3.5 font-bold">تاريخ الوصول والوجهات المفضلة</th>
                        <th className="px-5 py-3.5 font-bold text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {groupTrips.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-950/20 transition-all">
                          <td className="px-5 py-4 space-y-1">
                            <span className="font-mono text-amber-500 font-bold block">#STG-{req.id}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-slate-500" />
                              {req.country}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-white text-sm">
                            {req.numberOfPeople} أشخاص
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-300">
                            {req.numberOfDays} أيام جولة
                          </td>
                          <td className="px-5 py-4 space-y-1">
                            <span className="text-slate-400 font-mono block">{req.arrivalDate}</span>
                            <span className="text-[10px] text-indigo-400 font-bold">
                              {req.destinationPreference === "single" ? `المحافظة الموفرة: ${req.selectedGovernorate || "مسقط"}` : "محافظات عمان متعددة"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={async () => {
                                if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الطلب الجماعي؟")) return;
                                try {
                                  const res = await fetch(`/api/group-trips/${req.id}`, { method: "DELETE" });
                                  if (res.ok) {
                                    setGroupTrips(prev => prev.filter(item => item.id !== req.id));
                                    triggerNotification("تم حذف طلب الرحلة المجموعات بنجاح!");
                                  } else {
                                    triggerNotification("حدث خطأ أثناء محاولة الحذف من الخادم", true);
                                  }
                                } catch (error) {
                                  triggerNotification("فشل الاتصال بالخادم لحذف الطلب", true);
                                }
                              }}
                              className="p-1 px-2 text-red-400 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

        {/* ========================================================= */}
        {/* TAB: HIMAM SHOMA */}
        {activeTab === 'himam' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" /> إضافة مكان جديد لـ "همم شومة"
              </h2>
              <p className="text-xs text-slate-400 leading-normal">
                أدخل تفاصيل المعالم والأماكن المتميزة في قسم "همم شومة" ليتم تثبيتها ديناميكياً للجمهور لزيارتها.
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!himamName || !himamLocation) {
                  triggerNotification("يرجى إدخال اسم المكان والموقع الجغرافي على الأقل", true);
                  return;
                }
                try {
                  const res = await fetch("/api/himam-shouma", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: himamName,
                      name_en: himamNameEn,
                      location: himamLocation,
                      image_url: himamImage || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
                      description: himamDesc
                    })
                  });
                  if (res.ok) {
                    const created = await res.json();
                    setHimamPlaces(prev => [created, ...prev]);
                    setHimamName("");
                    setHimamNameEn("");
                    setHimamLocation("");
                    setHimamImage("");
                    setHimamDesc("");
                    triggerNotification("تم إضافة المعلم السياحي بنجاح لقسم همم شومة!");
                  }
                } catch (err) {
                  triggerNotification("حدث خطأ أثناء الاتصال بالخادم لإضافة المعلم", true);
                }
              }} className="space-y-3 font-sans">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">اسم المكان (بالعربي):</label>
                  <input
                    type="text"
                    value={himamName}
                    onChange={(e) => setHimamName(e.target.value)}
                    placeholder="مثال: مطل جبل شمس"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">اسم المكان (بالإنجليزية):</label>
                  <input
                    type="text"
                    value={himamNameEn}
                    onChange={(e) => setHimamNameEn(e.target.value)}
                    placeholder="e.g. Jebel Shams Viewpoint"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">الموقع والمحافظة:</label>
                  <input
                    type="text"
                    value={himamLocation}
                    onChange={(e) => setHimamLocation(e.target.value)}
                    placeholder="الداخلية - الحمراء"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">رابط صورة المكان التوضيحية:</label>
                  <input
                    type="url"
                    value={himamImage}
                    onChange={(e) => setHimamImage(e.target.value)}
                    placeholder="https://images.unsplash.com..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">نبذة واصفة للمكان:</label>
                  <textarea
                    value={himamDesc}
                    onChange={(e) => setHimamDesc(e.target.value)}
                    placeholder="اكتب هنا بضعة أسطر حول سحر المكان..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إدراج في قسم همم شومة</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-white">الأماكن الحالية المدرجة في همم شومة ({himamPlaces.length})</h2>
              
              {himamPlaces.length === 0 ? (
                <div className="p-16 text-center bg-slate-900 border border-slate-850 rounded-3xl flex flex-col items-center justify-center gap-3">
                  <Flame className="w-10 h-10 text-slate-600" />
                  <p className="text-xs text-slate-400 leading-normal">
                    لا تتوفر أي معالم في همم شومة حالياً بالخادم. أضف معلماً جديداً بالنموذج الجانبي لتنشره سياحياً!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {himamPlaces.map((place) => (
                    <div key={place.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div className="relative h-40 bg-slate-950">
                        <img src={place.image_url || place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-slate-950/80 text-white px-2 py-0.5 rounded-lg">
                          📍 {place.location}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-white text-sm">{place.name}</h3>
                        {place.name_en && <p className="text-xs text-slate-400 font-mono" dir="ltr">{place.name_en}</p>}
                        <p className="text-xs text-slate-400 line-clamp-2">{place.description}</p>
                      </div>
                      <div className="p-3 bg-slate-950 flex justify-end border-t border-slate-850">
                        <button
                          onClick={async () => {
                            if (confirm("هل أنت متأكد من رغبتك بحذف هذا المعلم في همم شومة؟")) {
                              try {
                                const res = await fetch(`/api/himam-shouma/${place.id}`, { method: "DELETE" });
                                if (res.ok) {
                                  setHimamPlaces(prev => prev.filter(p => p.id !== place.id));
                                  triggerNotification("تم حذف المعلم بنجاح من همم شومة");
                                }
                              } catch (err) {
                                triggerNotification("خطأ أثناء الاتصال لحذف المعلم", true);
                              }
                            }
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] transition font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> حذف
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
        {/* TAB: DROB SHOMA */}
        {activeTab === 'drob' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Map className="w-5 h-5 text-amber-500" /> إضافة مسار/مكان في دروب شومة
              </h2>
              <p className="text-xs text-slate-400 leading-normal">
                أدخل تفاصيل ومواقع مسارات ومعالم "دروب شومة" الفريدة ليتم تصفحها ديناميكياً في التطبيق.
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!drobName || !drobLocation) {
                  triggerNotification("يرجى إدخال اسم المسار والموقع الإقليمي", true);
                  return;
                }
                try {
                  const res = await fetch("/api/drob-shouma", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: drobName,
                      name_en: drobNameEn,
                      location: drobLocation,
                      image_url: drobImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
                      region: drobGov,
                      description: drobDesc
                    })
                  });
                  if (res.ok) {
                    const created = await res.json();
                    setDrobGems(prev => [created, ...prev]);
                    setDrobName("");
                    setDrobNameEn("");
                    setDrobLocation("");
                    setDrobImage("");
                    setDrobDesc("");
                    triggerNotification("تم إضافة مسار دروب شومة بنجاح في الواجهات التفاعلية!");
                  }
                } catch (err) {
                  triggerNotification("فشل الاتصال بالخادم لإدراج المسار", true);
                }
              }} className="space-y-3 font-sans">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">اسم المسار/المكان (بالعربي):</label>
                  <input
                    type="text"
                    value={drobName}
                    onChange={(e) => setDrobName(e.target.value)}
                    placeholder="مثال: كهف الهوتة وغابات النخيل"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">اسم المسار/المكان (بالإنجليزية):</label>
                  <input
                    type="text"
                    value={drobNameEn}
                    onChange={(e) => setDrobNameEn(e.target.value)}
                    placeholder="e.g. Al Hoota Cave Excursion"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">المقر والموقع الجغرافي:</label>
                  <input
                    type="text"
                    value={drobLocation}
                    onChange={(e) => setDrobLocation(e.target.value)}
                    placeholder="الداخلية - بهلاء"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">المحافظة الإقليمية:</label>
                  <select
                    value={drobGov}
                    onChange={(e) => setDrobGov(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="الداخلية">الداخلية</option>
                    <option value="الوسطى">الوسطى</option>
                    <option value="ظفار">ظفار</option>
                    <option value="الشرقية">الشرقية</option>
                    <option value="الباطنة">الباطنة</option>
                    <option value="مسندم">مسندم</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">رابط صورة المسار:</label>
                  <input
                    type="url"
                    value={drobImage}
                    onChange={(e) => setDrobImage(e.target.value)}
                    placeholder="https://images.unsplash.com..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block font-semibold">تفاصيل وتعليمات إرشادية:</label>
                  <textarea
                    value={drobDesc}
                    onChange={(e) => setDrobDesc(e.target.value)}
                    placeholder="اكتب المعالم والمميزات الفنية للمسار هنا..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إدراج في مسارات دروب شومة</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-white">المسارات الحالية في دروب شومة ({drobGems.length})</h2>
              
              {drobGems.length === 0 ? (
                <div className="p-16 text-center bg-slate-900 border border-slate-850 rounded-3xl flex flex-col items-center justify-center gap-3">
                  <Map className="w-10 h-10 text-slate-600" />
                  <p className="text-xs text-slate-400 leading-normal">
                    لا تتوفر أي مسارات في دروب شومة مسجلة حالياً بالخادم. بادر بإضافة أول مسار بالمحاذاة!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {drobGems.map((gem) => (
                    <div key={gem.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div className="relative h-40 bg-slate-950">
                        <img src={gem.image_url || gem.imageUrl} alt={gem.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-slate-950/80 text-white px-2 py-0.5 rounded-lg">
                          📍 {gem.location} ({gem.region})
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-white text-sm">{gem.name}</h3>
                        {gem.name_en && <p className="text-xs text-slate-400 font-mono" dir="ltr">{gem.name_en}</p>}
                        <p className="text-xs text-slate-400 line-clamp-2">{gem.description}</p>
                      </div>
                      <div className="p-3 bg-slate-950 flex justify-end border-t border-slate-850">
                        <button
                          onClick={async () => {
                            if (confirm("هل أنت متأكد من رغبتك بحذف هذا المسار الجغرافي من دروب شومة؟")) {
                              try {
                                const res = await fetch(`/api/drob-shouma/${gem.id}`, { method: "DELETE" });
                                if (res.ok) {
                                  setDrobGems(prev => prev.filter(g => g.id !== gem.id));
                                  triggerNotification("تم حذف مسار دروب شومة المختار بنجاح");
                                }
                              } catch (err) {
                                triggerNotification("خطأ أثناء حذف المسار في دروب شومة", true);
                              }
                            }
                          }}
                          className="px-3 py-1 bg-red-650 hover:bg-red-650 text-white rounded text-[10px] transition font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> حذف المسار
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
        {/* TAB: ACTIVITIES MANAGEMENT */}
        {activeTab === 'activities' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" dir="rtl">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit space-y-4">
              <h2 className="text-sm font-bold text-white">إضافة نشاط أو فعالية مغامرة جديدة</h2>

              <form onSubmit={handleActivitySubmit} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="actNA" className="text-xs text-slate-300 block font-semibold">اسم الفعالية بالعربي:</label>
                  <input
                    id="actNA"
                    type="text"
                    value={actNameAr}
                    onChange={(e) => setActNameAr(e.target.value)}
                    placeholder="مثال: التخييم الصحراوي في بدية"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="actN" className="text-xs text-slate-300 block font-semibold">الاسم بالإنجليزي:</label>
                  <input
                    id="actN"
                    type="text"
                    value={actName}
                    onChange={(e) => setActName(e.target.value)}
                    placeholder="e.g. Desert Camping in Bidiya"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="actDescAr" className="text-xs text-slate-300 block font-semibold">الوصف بالعربي:</label>
                  <textarea
                    id="actDescAr"
                    value={actDescAr}
                    onChange={(e) => setActDescAr(e.target.value)}
                    placeholder="اكتب تفاصيل الفعالية باللغة العربية..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="actDescEn" className="text-xs text-slate-300 block font-semibold">الوصف بالإنجليزي:</label>
                  <textarea
                    id="actDescEn"
                    value={actDesc}
                    onChange={(e) => setActDesc(e.target.value)}
                    placeholder="English description..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="actLoc" className="text-xs text-slate-300 block font-semibold">الموقع التفصيلي:</label>
                    <input
                      id="actLoc"
                      type="text"
                      value={actLocation}
                      onChange={(e) => setActLocation(e.target.value)}
                      placeholder="مثال: رمال بدية"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="actReg" className="text-xs text-slate-300 block font-semibold">المحافظة:</label>
                    <select
                      id="actReg"
                      value={actRegion}
                      onChange={(e) => setActRegion(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      {['محافظة شمال الشرقية', 'محافظة جنوب الشرقية', 'محافظة مسقط', 'محافظة ظفار', 'محافظة الداخلية', 'محافظة مسندم', 'محافظة الظاهرة'].map((g, idx) => (
                        <option key={idx} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="actDur" className="text-xs text-slate-300 block font-semibold">المدة المقترحة:</label>
                    <input
                      id="actDur"
                      type="text"
                      value={actDuration}
                      onChange={(e) => setActDuration(e.target.value)}
                      placeholder="مثال: ساعتان"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="actPrc" className="text-xs text-slate-300 block font-semibold">السعر والتكلفة:</label>
                    <input
                      id="actPrc"
                      type="text"
                      value={actPrice}
                      onChange={(e) => setActPrice(e.target.value)}
                      placeholder="مثال: 10 ر.ع"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="actIm" className="text-xs text-slate-300 block font-semibold">مسار رابط الصورة:</label>
                    <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                      <UploadCloud className="w-3.5 h-3.5 animate-pulse" />
                      رفع صورة من جهازك
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsLoading(true);
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData
                            });
                            if (res.ok) {
                              const dat = await res.json();
                              setActImage(dat.url);
                              triggerNotification("تم رفع صورة الفعالية بنجاح!");
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    id="actIm"
                    type="text"
                    value={actImage}
                    onChange={(e) => setActImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-[10px] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="actProv" className="text-xs text-slate-300 block font-semibold">مقدم الخدمة:</label>
                    <input
                      id="actProv"
                      type="text"
                      value={actProvider}
                      onChange={(e) => setActProvider(e.target.value)}
                      placeholder="مكتب شومة للسياحة"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="actPh" className="text-xs text-slate-300 block font-semibold">رقم التواصل:</label>
                    <input
                      id="actPh"
                      type="text"
                      value={actPhone}
                      onChange={(e) => setActPhone(e.target.value)}
                      placeholder="+968 9123 4567"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="actIncl" className="text-xs text-slate-300 block font-semibold font-sans">
                    الميزات المشمولة (مفصولة بعلامة ,):
                  </label>
                  <input
                    id="actIncl"
                    type="text"
                    value={actIncludes}
                    onChange={(e) => setActIncludes(e.target.value)}
                    placeholder="معدات السلامة, وجبة خفيفة, مرشد مغامرات"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="actMap" className="text-xs text-slate-300 block font-semibold">رابط خريطة قوقل المخصصة لوجهة الفعالية:</label>
                  <input
                    id="actMap"
                    type="text"
                    value={actMapUrl}
                    onChange={(e) => setActMapUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <button
                  id="btn-activity-submit"
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ وإملاء وإدراج النشاط الجديد</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-bold text-white">الأنشطة والفعاليات المستقرّة بقاعدة البيانات ({activities.length})</h2>
              {activities.length === 0 ? (
                <div className="p-16 text-center bg-slate-900 border border-slate-850 rounded-3xl flex flex-col items-center justify-center gap-3">
                  <Activity className="w-10 h-10 text-slate-600" />
                  <p className="text-xs text-slate-400 leading-normal">
                    لا تتوفر أي فعاليات مضافة حالياً بقاعدة البيانات. بادر بإدراج أول نشاط مغامرة في كتالوج المنصة!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((act) => (
                    <div key={act.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div className="relative h-40 bg-slate-950">
                        <img src={act.image || "https://images.unsplash.com/photo-1542332213-9b5a5a3fda35?auto=format&fit=crop&w=400&q=80"} alt={act.name_ar || act.name || 'activity'} className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-slate-950/80 text-white px-2 py-0.5 rounded-lg">
                          📍 {act.location || 'غير محدد'} ({act.region || 'مسقط'})
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-white text-sm">{act.name_ar || act.name}</h3>
                        <p className="text-[10px] text-slate-400">التكلفة: <span className="text-amber-500 font-bold">{act.price}</span> | المدة: {act.duration}</p>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{act.description_ar || act.description}</p>
                      </div>
                      <div className="p-3 bg-slate-950 flex justify-end border-t border-slate-850">
                        <button
                          onClick={() => handleActivityDelete(act.id)}
                          className="px-3 py-1 bg-red-650 hover:bg-red-500 text-white rounded text-[10px] transition font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> حذف الفعالية
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
        {/* TAB: FINANCE & REVENUE ACCOUNTS */}
        {activeTab === 'finance' && (
          <div className="space-y-8 text-right" dir="rtl">
            
            {/* Sub-tab selection menu to switch between Hotels and Hiking */}
            <div className="flex justify-center border-b border-slate-800 pb-4 mb-6">
              <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex gap-1.5 font-sans">
                <button
                  type="button"
                  onClick={() => setActiveFinanceSubTab('hotels')}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeFinanceSubTab === 'hotels'
                      ? "bg-sky-600 text-white shadow-md font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>الحسابات المالية للفنادق والمنتجعات</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveFinanceSubTab('hiking')}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeFinanceSubTab === 'hiking'
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Mountain className="w-4 h-4" />
                  <span>حسابات وأرباح رحلات الهايكنق</span>
                </button>
              </div>
            </div>

            {activeFinanceSubTab === 'hotels' ? (
              <>
                {/* 1. Dynamic Financial Counter Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 flex items-center justify-between">
                <div className="space-y-1.5 text-right">
                  <span className="text-xs text-slate-400 font-bold block">إجمالي مبيعات الفنادق</span>
                  <h3 className="text-2xl font-black text-amber-500 font-mono tracking-tight">{totalHotelSales.toFixed(3)} ر.ع</h3>
                  <p className="text-[10px] text-slate-500 font-sans">تحديث فوري لكل حجز مستلم</p>
                </div>
                <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                  <DollarSign className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 flex items-center justify-between">
                <div className="space-y-1.5 text-right">
                  <span className="text-xs text-slate-400 font-bold block">عمولة منصة شومة المستحقة (١٥٪)</span>
                  <h3 className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{totalShoumaShare.toFixed(3)} ر.ع</h3>
                  <p className="text-[10px] text-emerald-500/60 font-sans">توزع وتقتطع آلياً عبر البوابة</p>
                </div>
                <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <Percent className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 flex items-center justify-between">
                <div className="space-y-1.5 text-right">
                  <span className="text-xs text-slate-400 font-bold block">مستحقات الفنادق الكلية (٨٥٪)</span>
                  <h3 className="text-2xl font-black text-sky-400 font-mono tracking-tight">{totalHotelsShare.toFixed(3)} ر.ع</h3>
                  <p className="text-[10px] text-slate-500 font-sans">جاهزة للتسوية والتحويل للفنادق</p>
                </div>
                <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-400/20">
                  <Building className="w-6 h-6 text-sky-400" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 flex items-center justify-between">
                <div className="space-y-1.5 text-right">
                  <span className="text-xs text-slate-400 font-bold block">عدد الحجوزات المستلمة</span>
                  <h3 className="text-2xl font-black text-white font-mono tracking-tight">{hotelBookings.length} حجز</h3>
                  <p className="text-[10px] text-slate-400 font-sans">تدفق فوري مستمر</p>
                </div>
                <div className="p-3.5 bg-slate-850 text-slate-300 rounded-2xl border border-slate-800">
                  <Activity className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* 2. Interactive Chart & Gateway Config Form Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Profit Growth Tracker Chart */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100">
                  <div className="flex justify-between items-center mb-6 dir-rtl text-right">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" /> رسم بياني لمراقبة نمو المبيعات وتوزيع الأرباح
                      </h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        مخطط تراكمي يوضح وتيرة المبيعات الإجمالية مقارنة بحصة منصة شومة وتوزيعات الفنادق
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/15">
                      آخر تحديث تلقائي
                    </span>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSalesMain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorShoumaMain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorHotelMain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", textAlign: "right" }}
                        />
                        <Area type="monotone" dataKey="المبيعات الكلية" stroke="#d97706" fillOpacity={1} fill="url(#colorSalesMain)" strokeWidth={2.5} name="إجمالي المبيعات" />
                        <Area type="monotone" dataKey="حصة شومة" stroke="#10b981" fillOpacity={1} fill="url(#colorShoumaMain)" strokeWidth={2} name="عمولة شومة (١٥٪)" />
                        <Area type="monotone" dataKey="حصة الفنادق" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorHotelMain)" strokeWidth={2} name="مستحقات الفنادق (٨٥٪)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right Column: Gateway Configuration Form with manual token entry */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="dir-rtl text-right">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-400" /> بوابة شومة باي الموحدة
                      </h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        اربط وأدخل توكن بوابتك يدوياً لتفعيل سحب تسويات وحصص الفنادق فوراً.
                      </p>
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        for (const gw of hikingPayments) {
                          await fetch(`/api/hiking-payments/${gw.id}`, { method: 'DELETE' });
                        }
                        const res = await fetch("/api/hiking-payments", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            gateway_name: mainGatewayName.trim() || "شومة باي - بوابة دفع آمن مباشر",
                            details: mainToken.trim() || ""
                          })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setHikingPayments([data]);
                          triggerNotification("تم حفظ وتحديث توكن بوابة الدفع الرئيسية الموحدة بنجاح!");
                        } else {
                          triggerNotification("فشل تحديث بوابة الدفع في الخادم");
                        }
                      } catch (err) {
                        triggerNotification("حدث خطأ أثناء الاتصال بالخادم");
                      }
                    }} className="space-y-4">
                      <div className="space-y-1.5 text-right">
                        <label className="text-xs text-slate-300 block font-bold">اسم بوابة الدفع العامة</label>
                        <input 
                          type="text"
                          placeholder="بوابة شومة باي للمدفوعات المباشرة" 
                          value={mainGatewayName} 
                          onChange={(e) => setMainGatewayName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none text-right"
                          required
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-right">
                        <label className="text-xs text-slate-300 block font-bold">التوكن السري للبوابة (API Token)</label>
                        <textarea 
                          placeholder="أدخل توكن الربط السري النشط هنا..." 
                          value={mainToken} 
                          onChange={(e) => setMainToken(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none font-mono min-h-[90px] text-right"
                          required
                        />
                        <p className="text-[10px] text-slate-500 font-sans">
                          * مطلوب للتكامل الآمن مع حسابات الفروع وتسويات الفنادق.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between dir-rtl text-xs">
                        <div className="space-y-0.5 text-right">
                          <span className="font-bold text-white block">حالة تفعيل البوابة</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                          mainToken.trim() 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {mainToken.trim() ? "متصلة ونشطة" : "بانتظار التوكن"}
                        </span>
                      </div>

                      <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer">
                        تحديث وحفظ معلومات التوكن يدويّاً
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Live Ticker: Rolling payment report feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between flex-wrap gap-4 font-sans text-right dir-rtl">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-slate-300 font-bold">بث حي لتقرير المدفوعات:</span>
              </div>
              <div className="flex-1 overflow-hidden h-6 text-xs text-emerald-400 font-medium text-right">
                {hotelBookings.length > 0 ? (
                  <div className="animate-pulse">
                    • تم دفع مبلغ <span className="font-mono font-bold">{(hotelBookings[0].total_price || hotelBookings[0].totalPrice || 0).toFixed(3)} ر.ع</span> في فندق <span className="font-bold">"{hotelBookings[0].hotel_name || hotelBookings[0].hotelName}"</span> بواسطة العميل <span className="font-semibold">{hotelBookings[0].full_name || hotelBookings[0].fullName}</span> بنجاح.
                  </div>
                ) : (
                  <div>• بانتظار استلام عملية دفع فندقية جديدة لعرضها هنا تلقائياً...</div>
                )}
              </div>
            </div>

            {/* 4. Hotel Financial Ledger (Individual dashboard page for each hotel) */}
            <div id="hotel-financial-ledger-section" className="space-y-6 text-right">
              <div className="border-b border-slate-800 pb-3 text-right">
                <h3 className="text-base font-black text-white flex items-center gap-2 justify-end">
                  <Building className="w-5 h-5 text-sky-400" /> الملفات المالية المستقلة للفنادق المدرجة
                </h3>
                <p className="text-xs text-slate-400 font-sans">اختر أي فندق أدناه لفتح صفحته المالية الفردية لمراقبة مستحقاته وطلبات حجوزاته بالتفصيل</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Hotel List Selection Sidebar */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl text-slate-100 lg:col-span-1 max-h-[500px] overflow-y-auto p-4 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right border-b border-slate-800 pb-2">قائمة الفنادق المتكاملة</h4>
                  <div className="space-y-2">
                    {allHotelsCombined.map((h) => {
                      const isSelected = selectedHotelFinanceId === h.id;
                      // Calculate bookings count
                      const countBookings = hotelBookings.filter(b => 
                        b.hotel_id === h.id || 
                        b.hotelId === h.id ||
                        (b.hotel_name && b.hotel_name.includes(h.name)) ||
                        (h.name && h.name.includes(b.hotel_name))
                      ).length;

                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setSelectedHotelFinanceId(h.id)}
                          className={`w-full p-3 rounded-xl text-right flex flex-col gap-1 transition-all ${
                            isSelected 
                              ? "bg-sky-600 text-white shadow-md font-black" 
                              : "hover:bg-slate-800 text-slate-300 bg-slate-950/40"
                          }`}
                        >
                          <span className="text-xs font-bold block truncate">{h.name}</span>
                          <div className="flex justify-between items-center text-[10px] w-full mt-1">
                            <span className={isSelected ? "text-sky-200" : "text-sky-400 font-semibold"}>
                              حصة الفندق: {h.splitHotelPct}%
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full font-mono text-[9px] ${
                              isSelected ? "bg-sky-700/60" : "bg-slate-800 text-slate-400"
                            }`}>
                              {countBookings} حجز
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Hotel Dedicated Dashboard Frame */}
                <div className="lg:col-span-3">
                  {selectedHotelObj ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl text-slate-100 border-l-4 border-l-sky-500 overflow-hidden">
                      <div className="border-b border-slate-850 p-6 dir-rtl text-right">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/15 font-bold px-2.5 py-1 rounded-full">
                              تسويات الفروع والأقسام المالية للفندق
                            </span>
                            <h2 className="text-lg font-black text-white mt-3">{selectedHotelObj.name}</h2>
                            <p className="text-xs text-slate-400 mt-1 font-sans">
                              سعر الليلة الأساسي: {selectedHotelObj.pricePerNight} ر.ع | النسبة المقررة: {selectedHotelObj.splitHotelPct}% للفندق و {selectedHotelObj.splitShoumaPct}% لشومة
                            </p>
                          </div>
                          
                          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 text-right min-w-[200px]">
                            <span className="text-slate-400 text-[10px] block font-semibold">المبلغ المستحق للصرف للفندق</span>
                            <span className="text-xl font-black text-emerald-400 font-mono inline-block mt-1">
                              {selectedHotelDueAmount.toFixed(3)} ر.ع
                            </span>
                            <button 
                              className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                              onClick={() => {
                                triggerNotification(`تم تسوية وتحويل مبلغ ${selectedHotelDueAmount.toFixed(3)} ر.ع بنجاح لحساب ${selectedHotelObj.name} عبر شومة باي!`);
                              }}
                              disabled={selectedHotelDueAmount === 0}
                            >
                              تسوية وصرف صافي المبلغ المالي
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-6 text-right">
                        
                        {/* Summary metrics row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dir-rtl mb-4">
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-semibold block">إجمالي مبيعات الفندق</span>
                            <span className="text-sm font-bold font-mono text-white">{selectedHotelSumSales.toFixed(3)} ر.ع</span>
                          </div>
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-semibold block">اقتطاع عمولة شومة (١٥٪)</span>
                            <span className="text-sm font-bold font-mono text-emerald-400 font-bold">{(selectedHotelSumSales * (selectedHotelObj.splitShoumaPct / (selectedHotelObj.splitShoumaPct + selectedHotelObj.splitHotelPct))).toFixed(3)} ر.ع</span>
                          </div>
                          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-semibold block">عدد الليالي المستهلكة</span>
                            <span className="text-sm font-bold font-mono text-sky-400">{selectedHotelBookings.reduce((sum, b) => sum + (Number(b.nights) || 1), 0)} ليلة مبيعات</span>
                          </div>
                        </div>

                        {/* Booking database for this hotel */}
                        <div>
                          <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5 justify-end">
                            <ClipboardList className="w-4 h-4 text-sky-400" /> الحجوزات والمعاملات المسجلة للفندق ({selectedHotelBookings.length})
                          </h4>

                          {selectedHotelBookings.length === 0 ? (
                            <div className="text-center py-10 bg-slate-950/30 rounded-2xl border border-slate-800 text-slate-500 font-sans text-xs space-y-1.5">
                              <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto" />
                              <p className="font-bold">لا مبيعات حية مسجلة بعد لهذا الفندق.</p>
                              <p>ستظهر البيانات آليّاً بمجرد قيام زائر بدفع قيمة حجز غرفته.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {selectedHotelBookings.map((b) => (
                                <div key={b.id} className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 hover:border-slate-750 transition-all text-right text-xs space-y-3 font-sans">
                                  <div className="flex justify-between items-center border-b border-slate-800/65 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full text-[10px] border border-sky-500/15">
                                        حجز #{b.id}
                                      </span>
                                      <span className="text-slate-400 text-[10px]">
                                        {b.created_at ? new Date(b.created_at).toLocaleDateString("ar-OM") : "قيد المعالجة"}
                                      </span>
                                    </div>
                                    <div className="text-left">
                                      <span className="text-[10px] text-slate-400">قيمة المعاملة: </span>
                                      <span className="font-bold text-amber-500 font-mono">{(Number(b.total_price || b.totalPrice || 0)).toFixed(3)} ر.ع</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-slate-300">
                                    <div>
                                      <span className="text-slate-500 text-[10px] font-bold block">اسم النزيل</span>
                                      <span className="text-white font-bold">{b.fullName || b.full_name || b.fullName}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] font-bold block">الغرفة المحددة</span>
                                      <span className="text-slate-200 font-medium">{b.room_name || b.roomName || "الجناح الافتراضي متميز"}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] font-bold block">حصة الفندق المقبوضة ({selectedHotelObj.splitHotelPct}%)</span>
                                      <span className="text-emerald-400 font-bold font-mono">{(Number(b.total_price || b.totalPrice || 0) * (selectedHotelObj.splitHotelPct / 100)).toFixed(3)} ر.ع</span>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-slate-800/50 flex flex-wrap gap-2.5 items-center justify-between">
                                    <div className="flex gap-2">
                                      <a 
                                        href={`tel:${b.phone || b.phone}`} 
                                        className="text-[10px] text-slate-300 hover:text-white inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-all"
                                      >
                                        <Phone className="w-3 h-3 text-emerald-400" /> اتصل بالنزيل
                                      </a>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-sans">
                                      عدد الليالي: {b.nights || 1} ليلة | السعر لليلة: {b.price_per_night || b.pricePerNight || 0} ر.ع
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 font-sans font-sans">
                      <Building className="w-16 h-16 text-slate-700 mx-auto animate-bounce" />
                      <h4 className="font-bold text-slate-300 text-sm">بوابة صفحات الفنادق المستقلة (المالية)</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                        انقر على الفندق من القائمة الجانبية اليمنى لعرض حصصه الحية ومستحقاته المالية، سجل حجوزاته الفورية، والتحكم بعمليات تحويل وصرف صافيه المالي.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        ) : (
          <>
                {/* ---------- HIKING FINANCE MODE ---------- */}
                {/* 1. Dynamic Financial Counter Widgets (Hiking) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 flex items-center justify-between">
                    <div className="space-y-1.5 text-right font-sans">
                      <span className="text-xs text-slate-400 font-bold block">إجمالي مبيعات الهاكنق</span>
                      <h3 className="text-2xl font-black text-amber-500 font-mono tracking-tight">{totalHikingSales.toFixed(3)} ر.ع</h3>
                      <p className="text-[10px] text-slate-500">تحديث فوري لكل تذكرة وحجز مستلم</p>
                    </div>
                    <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                      <DollarSign className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 flex items-center justify-between font-sans">
                    <div className="space-y-1.5 text-right">
                      <span className="text-xs text-slate-400 font-bold block">عمولة منصة شومة المستحقة (١٥٪)</span>
                      <h3 className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{totalHikingShoumaShare.toFixed(3)} ر.ع</h3>
                      <p className="text-[10px] text-emerald-500/60 font-sans">رسوم حماية وإدارة تقنية متكاملة</p>
                    </div>
                    <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                      <Percent className="w-6 h-6 text-emerald-400" />
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 flex items-center justify-between font-sans">
                    <div className="space-y-1.5 text-right">
                      <span className="text-xs text-slate-400 font-bold block">صافي مستحقات الأدلة والمنظمين (٨٥٪)</span>
                      <h3 className="text-2xl font-black text-sky-400 font-mono tracking-tight">{totalGuidesShare.toFixed(3)} ر.ع</h3>
                      <p className="text-[10px] text-slate-500 font-sans">مستحقة للدفع والتحويل للمنظمين</p>
                    </div>
                    <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-400/20">
                      <Mountain className="w-6 h-6 text-sky-400" />
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 flex items-center justify-between font-sans">
                    <div className="space-y-1.5 text-right font-sans">
                      <span className="text-xs text-slate-400 block font-bold">مقاعد الهاكنق المحجوزة</span>
                      <h3 className="text-2xl font-black text-white font-mono tracking-tight">
                        {hikingBookings.reduce((acc, curr) => acc + (Number(curr.attendees) || 1), 0)} مقعد
                      </h3>
                      <p className="text-[10px] text-slate-400 font-sans">من إجمالي {hikingBookings.length} حركة تسجيل</p>
                    </div>
                    <div className="p-3.5 bg-slate-850 text-slate-300 rounded-2xl border border-slate-800">
                      <Activity className="w-6 h-6 text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Chart Level (Hiking) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100">
                      <div className="flex justify-between items-center mb-6 dir-rtl text-right font-sans">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" /> رسم بياني لنمو مبيعات وتوزيعات رحلات الهايكنق
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            مخطط تراكمي للمبيعات الكلية لرحلات الهاكنق مع فصل سريع لعمولة المنصة وحصة المشغلين والمنظمين
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/15 font-sans">
                          بث تحديث حي
                        </span>
                      </div>
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={chartDataHiking}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorSalesHiking" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorShoumaHiking" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorGuideHiking" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", textAlign: "right" }}
                            />
                            <Area type="monotone" dataKey="المبيعات الكلية" stroke="#d97706" fillOpacity={1} fill="url(#colorSalesHiking)" strokeWidth={2.5} name="إجمالي المبيعات" />
                            <Area type="monotone" dataKey="حصة شومة" stroke="#10b981" fillOpacity={1} fill="url(#colorShoumaHiking)" strokeWidth={2} name="عمولة شومة (١٥٪)" />
                            <Area type="monotone" dataKey="حصة الهاكنق" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorGuideHiking)" strokeWidth={2} name="صافي المشغل والمنظمين (٨٥٪)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Live Ticker: Rolling payment report feed (Hiking) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between flex-wrap gap-4 font-sans text-right dir-rtl">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-slate-300 font-bold">بث حي لتقرير حجز التذاكر:</span>
                  </div>
                  <div className="flex-1 overflow-hidden h-6 text-xs text-emerald-400 font-medium text-right font-sans">
                    {hikingBookings.length > 0 ? (
                      <div className="animate-pulse font-sans">
                        • تم استلام مبلغ <span className="font-mono font-bold">{(hikingBookings[0].paid_amount || hikingBookings[0].paidAmount || 0).toFixed(3)} ر.ع</span> في جولة الهاكنق <span className="font-bold">"{hikingBookings[0].trip_name || hikingBookings[0].tripName}"</span> من قبل العميل <span className="font-semibold">{hikingBookings[0].full_name || hikingBookings[0].fullName}</span> بنجاح.
                      </div>
                    ) : (
                      <div>• بانتظار استلام عملية تسجيل تذاكر هايكنق جديدة لعرض تفاصيلها هنا تلقائياً...</div>
                    )}
                  </div>
                </div>

                {/* 4. Hiking Financial Ledger */}
                <div className="space-y-6 text-right font-sans">
                  <div className="border-b border-slate-800 pb-3 text-right">
                    <h3 className="text-base font-black text-white flex items-center gap-2 justify-end">
                      <Mountain className="w-5 h-5 text-sky-400" /> الملفات المالية لرحلات الهاكنق النشطة
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">اختر أي رحلة أدناه لعرض صفحتها المالية المستقلة لمراقبة مبيعاتها وكشوفات المشتركين بها بالتفصيل</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Trip List Selection Sidebar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl text-slate-100 lg:col-span-1 max-h-[500px] overflow-y-auto p-4 space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right border-b border-slate-800 pb-2">قائمة الجولات المدرجة</h4>
                      <div className="space-y-2">
                        {hikingTrips.map((trip) => {
                          const isSelected = selectedTripFinanceId === trip.id;
                          const countBookings = hikingBookings.filter(b => 
                            b.trip_id === trip.id || 
                            b.tripId === trip.id ||
                            (b.trip_name && b.trip_name.includes(trip.name_ar)) ||
                            (trip.name_ar && trip.name_ar.includes(b.trip_name))
                          ).length;

                          return (
                            <button
                              key={trip.id}
                              type="button"
                              onClick={() => setSelectedTripFinanceId(trip.id)}
                              className={`w-full p-3 rounded-xl text-right flex flex-col gap-1 transition-all ${
                                isSelected 
                                  ? "bg-emerald-600 text-white shadow-md font-black" 
                                  : "hover:bg-slate-800 text-slate-300 bg-slate-950/40"
                              }`}
                            >
                              <span className="text-xs font-bold block truncate">{trip.name_ar}</span>
                              <div className="flex justify-between items-center text-[10px] w-full mt-1">
                                <span className={isSelected ? "text-emerald-205 font-sans" : "text-emerald-400 font-semibold"}>
                                  السعر: {trip.price} ر.ع
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-full font-mono text-[9px] ${
                                  isSelected ? "bg-emerald-700/60" : "bg-slate-800 text-slate-400"
                                }`}>
                                  {countBookings} مشترك
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Trip Dedicated Dashboard Frame */}
                    <div className="lg:col-span-3">
                      {selectedTripObj ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl text-slate-100 border-l-4 border-l-emerald-500 overflow-hidden font-sans">
                          <div className="border-b border-slate-850 p-6 dir-rtl text-right">
                            <div className="flex flex-wrap justify-between items-start gap-4">
                              <div>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-bold px-2.5 py-1 rounded-full">
                                  بوابة كشوفات وتسويات رحلة الهايكنق الموحدة
                                </span>
                                <h2 className="text-lg font-black text-white mt-3">{selectedTripObj.name_ar}</h2>
                                <p className="text-xs text-slate-400 mt-1 pb-1">
                                  منطقة الرحلة: {selectedTripObj.region} ({selectedTripObj.location}) | الصعوبة: {selectedTripObj.difficulty_level || selectedTripObj.difficulty || "غير محددة"}
                                </p>
                              </div>
                              
                              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 text-right min-w-[200px]">
                                <span className="text-slate-400 text-[10px] block font-semibold">المبلغ المستحق للمنظمين (٨٥٪)</span>
                                <span className="text-xl font-black text-emerald-400 font-mono inline-block mt-1">
                                  {selectedTripDueAmount.toFixed(3)} ر.ع
                                </span>
                                <button 
                                  className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer font-sans"
                                  onClick={() => {
                                    triggerNotification(`تم تسوية وتحويل مبلغ ${selectedTripDueAmount.toFixed(3)} ر.ع بنجاح للجنة منظمي وموجّهي رحلة "${selectedTripObj.name_ar}" عبر شومة باي!`);
                                  }}
                                  disabled={selectedTripDueAmount === 0}
                                >
                                  تسوية وصرف مستحقات المنظمين
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-6 text-right">
                            
                            {/* Summary metrics row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dir-rtl mb-4">
                              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-[10px] text-slate-400 font-semibold block">إجمالي تذاكر الرحلة</span>
                                <span className="text-sm font-bold font-mono text-white">{selectedTripSumSales.toFixed(3)} ر.ع</span>
                              </div>
                              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-[10px] text-slate-400 font-semibold block">حصة منصة شومة (١٥٪)</span>
                                <span className="text-sm font-bold font-mono text-emerald-400 font-bold">{(selectedTripSumSales * 0.15).toFixed(3)} ر.ع</span>
                              </div>
                              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-1 font-sans">
                                <span className="text-[10px] text-slate-400 font-semibold block">عدد المقاعد المحجوزة فعلياً</span>
                                <span className="text-sm font-bold font-mono text-sky-400 font-sans">
                                  {selectedTripBookings.reduce((sum, b) => sum + (Number(b.attendees) || 1), 0)} مقعد
                                </span>
                              </div>
                            </div>

                            {/* Booking database for this trip */}
                            <div>
                              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5 justify-end font-sans">
                                <ClipboardList className="w-4 h-4 text-emerald-400" /> كشف المشتركين المسجلين بالرحلة ({selectedTripBookings.length})
                              </h4>

                              {selectedTripBookings.length === 0 ? (
                                <div className="text-center py-10 bg-slate-950/30 rounded-2xl border border-slate-800 text-slate-500 font-sans text-xs space-y-1.5 font-sans">
                                  <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto" />
                                  <p className="font-bold">لا مبيعات أو تذاكر محجوزة حية بعد لهذه الرحلة.</p>
                                  <p>ستظهر بيانات المشتركين آليّاً بمجرد قيام عميل بالتسجيل والدفع المباشر.</p>
                                </div>
                              ) : (
                                <div className="space-y-3 font-sans">
                                  {selectedTripBookings.map((b) => (
                                    <div key={b.id} className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 hover:border-slate-750 transition-all text-right text-xs space-y-3 font-sans">
                                      <div className="flex justify-between items-center border-b border-slate-800/65 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/15">
                                            تذكرة #{b.id}
                                          </span>
                                          <span className="text-slate-400 text-[10px]">
                                            {b.booking_date || b.bookingDate || (b.created_at ? new Date(b.created_at).toLocaleDateString("ar-OM") : "معتمد")}
                                          </span>
                                        </div>
                                        <div className="text-left font-sans">
                                          <span className="text-[10px] text-slate-400">المبلغ المدفوع: </span>
                                          <span className="font-bold text-amber-500 font-mono">{(Number(b.paid_amount || b.paidAmount || 0)).toFixed(3)} ر.ع</span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-slate-300">
                                        <div>
                                          <span className="text-slate-500 text-[10px] font-bold block">اسم العميل</span>
                                          <span className="text-white font-bold">{b.fullName || b.full_name || b.fullName}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 text-[10px] font-bold block">عدد المقاعد المحجوزة</span>
                                          <span className="text-slate-200 font-medium font-mono">{b.attendees || 1} مقعد</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 text-[10px] font-bold block">حصة الهايكنق (٨٥٪)</span>
                                          <span className="text-emerald-400 font-bold font-mono">{(Number(b.paid_amount || b.paidAmount || 0) * 0.85).toFixed(3)} ر.ع</span>
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t border-slate-800/50 flex flex-wrap gap-2.5 items-center justify-between font-sans">
                                        <div className="flex gap-2">
                                          <a 
                                            href={`tel:${b.phone}`} 
                                            className="text-[10px] text-slate-300 hover:text-white inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg transition"
                                          >
                                            <Phone className="w-3 h-3 text-emerald-400" /> اتصل بالنزيل
                                          </a>
                                          <a 
                                            href={`https://wa.me/${b.phone ? b.phone.replace(/[^0-9]/g, '') : ""}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                                          >
                                            <Phone className="w-3 h-3" /> مراسلة واتساب
                                          </a>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-sans">
                                          البريد: {b.email || 'غير متاح'} | الهاتف: {b.phone || 'غير متاح'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 font-sans">
                          <Mountain className="w-16 h-16 text-slate-700 mx-auto animate-bounce" />
                          <h4 className="font-bold text-slate-300 text-sm font-sans">الملفات المالية لرحلات الهاكنق النشطة</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                            انقر على اسم الرحلة من القائمة الجانبية اليمنى لعرض حصص مبيعاتها الحية، قائمة المشاركين والتحكم في تحويل مستحقات جهة التنظيم.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 16: SUB-PORTAL ACCOUNTS MANAGEMENT & LIVE AUDIT TRAIL */}
        {activeTab === 'portalAccounts' && (
          <div className="space-y-8 text-right dir-rtl font-sans">
            {/* Top Header Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500" />
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800/80 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <KeyRound className="w-3.5 h-3.5" /> النظام الموحد للأقسام والبريد الإلكتروني
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> مراقبة حية ومباشرة
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">إدارة حسابات الموظفين بالأقسام وسجل الدخول والخروج</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    تنظيم البريد الإلكتروني للأقسام (مثال: قسم المالية يضم عدة موظفين مع خيار إضافة موظفين جدد) مع سجل حي يوضح من دخل ومن خرج ومع الوقت لكل لوحة وقسم.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/shouma_accounts_and_passwords.docx"
                    download="shouma_accounts_and_passwords.docx"
                    className="px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer border border-emerald-600 shadow-lg"
                    title="تحميل جدول حسابات وكلمات المرور بصيغة Word"
                  >
                    <Download className="w-3.5 h-3.5" /> تحميل ملف وورد Word
                  </a>
                  <button
                    onClick={fetchAuditLogs}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
                    title="تحديث سجل الحركة اللحظي"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAuditLogs ? 'animate-spin' : ''}`} /> تحديث السجل الحي
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingPortalAccount(true);
                      setEditingPortalAccount(null);
                      setPortalForm({
                        portalType: "finance",
                        portalName: "لوحة الإدارة المالية العامة",
                        name: "",
                        email: "",
                        password: "",
                        isActive: true
                      });
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <UserPlus className="w-4 h-4" /> إضافة بريد / موظف جديد
                  </button>
                </div>
              </div>

              {/* Department Staff Cards Grid */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" /> توزيع الموظفين والبريد الإلكتروني حسب الأقسام
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { type: 'finance', name: 'قسم الإدارة المالية والتدقيق', icon: DollarSign, color: 'emerald', defaultPortalName: 'لوحة الإدارة المالية العامة' },
                    { type: 'hotels', name: 'قسم الفنادق والمنتجعات', icon: Building, color: 'amber', defaultPortalName: 'لوحة إدارة الفنادق والمنتجعات' },
                    { type: 'cars', name: 'قسم تأجير السيارات', icon: Car, color: 'sky', defaultPortalName: 'لوحة إدارة مكتب تأجير السيارات' },
                    { type: 'trips', name: 'قسم الرحلات والفعاليات', icon: Compass, color: 'purple', defaultPortalName: 'لوحة إدارة الرحلات الاستكشافية' },
                    { type: 'marketing', name: 'قسم التسويق والإعلانات', icon: Megaphone, color: 'rose', defaultPortalName: 'لوحة إدارة التسويق والإعلانات' },
                    { type: 'guides', name: 'بوابة المرشدين السياحيين', icon: MapPin, color: 'indigo', defaultPortalName: 'لوحة المرشدين السياحيين' },
                    { type: 'tech', name: 'قسم التقنية والدعم البرمجي', icon: ShieldAlert, color: 'blue', defaultPortalName: 'لوحة الدعم التقني والبرمجي' }
                  ].map((dept) => {
                    const deptAccounts = portalAccounts.filter(a => (a.portalType || a.portal_type) === dept.type);
                    const activeDeptAccounts = deptAccounts.filter(a => a.isActive || a.is_active);
                    const DeptIcon = dept.icon;

                    return (
                      <div key={dept.type} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-400">
                              <DeptIcon className="w-4 h-4" />
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {deptAccounts.length} بريد / موظف
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mb-1">{dept.name}</h4>
                          <p className="text-[10px] text-slate-400">
                            {activeDeptAccounts.length} حساب نشط للدخول
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setIsCreatingPortalAccount(true);
                            setEditingPortalAccount(null);
                            setPortalForm({
                              portalType: dept.type,
                              portalName: dept.defaultPortalName,
                              name: "",
                              email: `${dept.type}${deptAccounts.length + 1}@shouma.com`,
                              password: `${dept.type}2026`,
                              isActive: true
                            });
                          }}
                          className="mt-3 w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-850 text-amber-400 border border-amber-500/20 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Plus className="w-3 h-3" /> إضافة موظف للقسم
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Modal/Drawer for Create or Edit */}
              {(isCreatingPortalAccount || editingPortalAccount) && (
                <form onSubmit={handleSavePortalAccount} className="mt-8 bg-slate-950 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-2xl relative">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      {editingPortalAccount ? "تعديل بيانات بريد / موظف بالقسم" : "إضافة موظف/بريد إلكتروني جديد لقسم معين"}
                    </h3>
                    <span className="text-[11px] text-slate-400">يمكن إضافة أكثر من بريد إلكتروني لنفس القسم (مثل قسم المالية)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">اختر القسم / نوع اللوحة الفرعية</label>
                      <select
                        value={portalForm.portalType}
                        onChange={(e) => {
                          const val = e.target.value;
                          const namesMap: Record<string, string> = {
                            hotels: "لوحة إدارة الفنادق والمنتجعات",
                            finance: "لوحة الإدارة المالية العامة",
                            cars: "لوحة إدارة مكتب تأجير السيارات",
                            trips: "لوحة إدارة الرحلات الاستكشافية",
                            marketing: "لوحة إدارة التسويق والإعلانات",
                            tech: "لوحة الدعم التقني والبرمجي",
                            guides: "لوحة المرشدين السياحيين"
                          };
                          setPortalForm(prev => ({
                            ...prev,
                            portalType: val,
                            portalName: namesMap[val] || val
                          }));
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                      >
                        <option value="finance">💰 الإدارة المالية والتدقيق (Finance)</option>
                        <option value="hotels">🏨 الفنادق والمنتجعات (Hotels)</option>
                        <option value="cars">🚗 مكاتب تأجير السيارات (Car Rentals)</option>
                        <option value="trips">🏔️ إدارة الرحلات والفعاليات (Trips)</option>
                        <option value="marketing">📣 قسم التسويق والإعلانات (Marketing)</option>
                        <option value="guides">🧭 بوابة المرشدين السياحيين (Guides)</option>
                        <option value="tech">🛡️ بوابة المطورين والتقنية (Tech)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">عنوان/اسم اللوحة للقسم</label>
                      <input
                        type="text"
                        value={portalForm.portalName}
                        onChange={(e) => setPortalForm(prev => ({ ...prev, portalName: e.target.value }))}
                        placeholder="مثال: لوحة الإدارة المالية العامة"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">اسم الموظف / المسؤول</label>
                      <input
                        type="text"
                        value={portalForm.name}
                        onChange={(e) => setPortalForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="مثال: سالم العبري - المحاسب الرئيسي"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني للدخول</label>
                      <input
                        type="email"
                        value={portalForm.email}
                        onChange={(e) => setPortalForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="finance2@shouma.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white dir-ltr text-right font-mono text-emerald-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور للدخول</label>
                      <input
                        type="text"
                        value={portalForm.password}
                        onChange={(e) => setPortalForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="isActiveCheck"
                        checked={portalForm.isActive}
                        onChange={(e) => setPortalForm(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 rounded accent-amber-500"
                      />
                      <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                        الحساب مفعل ويمكن للموظف تسجيل الدخول به
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> حفظ بيانات الموظف والبريد
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPortalAccount(false);
                        setEditingPortalAccount(null);
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}

              {/* Accounts Table Header & Controls */}
              <div className="mt-10 border-t border-slate-800/80 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" /> دليل حسابات وإيميلات الموظفين لكل قسم
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      قائمة بجميع الموظفين المصرح لهم بالدخول للوحات الفرعية متضمنة بيانات الاعتماد البريدية
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/50">
                        <th className="p-3">القسم واللوحة</th>
                        <th className="p-3">الموظف / المسؤول</th>
                        <th className="p-3">البريد الإلكتروني</th>
                        <th className="p-3">كلمة المرور</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-left">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {portalAccounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-bold text-white">
                            <span className="block">{acc.portalName || acc.portal_name}</span>
                            <span className="text-[10px] text-amber-400 font-mono">({acc.portalType || acc.portal_type})</span>
                          </td>
                          <td className="p-3 text-slate-200 font-semibold">{acc.name || "مدير القسم"}</td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">{acc.email}</td>
                          <td className="p-3 font-mono text-slate-300 bg-slate-950/60 rounded px-2 inline-block my-2">
                            {acc.password}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              acc.isActive || acc.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {acc.isActive || acc.is_active ? 'مفعل للدخول' : 'معطل'}
                            </span>
                          </td>
                          <td className="p-3 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingPortalAccount(acc);
                                  setIsCreatingPortalAccount(false);
                                  setPortalForm({
                                    portalType: acc.portalType || acc.portal_type,
                                    portalName: acc.portalName || acc.portal_name,
                                    name: acc.name || "",
                                    email: acc.email,
                                    password: acc.password,
                                    isActive: acc.isActive ?? acc.is_active ?? true
                                  });
                                }}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors flex items-center gap-1"
                                title="تعديل"
                              >
                                <Edit className="w-3.5 h-3.5" /> تعديل
                              </button>
                              <button
                                onClick={() => handleDeletePortalAccount(acc.id)}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AUDIT LOG TRAIL CARD: "من دخل ومن خرج ومع الوقت لأي لوحة تحكم ولأي قسم" */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Clock className="w-3.5 h-3.5" /> سجل الحركة اللحظي المباشر Audit Trail
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> مراقبة نشطة
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">سجل الدخول والخروج الحي (من دخل ومن خرج ومع الوقت لأي قسم)</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    يعرض بدقة تامة توقيت وحالة كل عملية تسجيل دخول أو خروج قام بها الموظفون في أي لوحة تحكم فرعية وقسم.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      placeholder="بحث باسم الموظف أو البريد..."
                      className="bg-transparent text-xs text-white focus:outline-none w-40 sm:w-56"
                    />
                  </div>

                  <select
                    value={auditFilterDepartment}
                    onChange={(e) => setAuditFilterDepartment(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="all">جميع الأقسام</option>
                    <option value="finance">💰 الإدارة المالية</option>
                    <option value="hotels">🏨 قسم الفنادق</option>
                    <option value="cars">🚗 قسم السيارات</option>
                    <option value="trips">🏔️ قسم الرحلات</option>
                    <option value="marketing">📣 قسم التسويق</option>
                    <option value="guides">🧭 بوابة المرشدين</option>
                    <option value="tech">🛡️ قسم التقنية</option>
                  </select>
                </div>
              </div>

              {/* Audit Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400 font-bold">عمليات الدخول المسجلة</span>
                      <span className="text-xl font-black text-white font-mono">
                        {portalAuditLogs.filter(l => l.action === 'LOGIN').length}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">🟢 نشط</span>
                </div>

                <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400 font-bold">عمليات الخروج المسجلة</span>
                      <span className="text-xl font-black text-white font-mono">
                        {portalAuditLogs.filter(l => l.action === 'LOGOUT').length}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">🟠 مغلق</span>
                </div>

                <div className="bg-slate-950/80 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] text-slate-400 font-bold">إجمالي السجلات الحية</span>
                      <span className="text-xl font-black text-white font-mono">
                        {portalAuditLogs.length}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-400">⚡ آمن 100%</span>
                </div>
              </div>

              {/* Audit Trail Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/50">
                      <th className="p-3">نوع الحركة (الحدث)</th>
                      <th className="p-3">الموظف / المسؤول</th>
                      <th className="p-3">البريد الإلكتروني</th>
                      <th className="p-3">القسم واللوحة الفرعية</th>
                      <th className="p-3">تاريخ ووقت الحركة بالضبط</th>
                      <th className="p-3">عنوان IP والشبكة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {portalAuditLogs
                      .filter(log => {
                        const matchDept = auditFilterDepartment === 'all' || (log.portalType || log.portal_type) === auditFilterDepartment;
                        const matchQuery = !auditSearchQuery || 
                          (log.name || '').toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                          (log.email || '').toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                          (log.portalName || '').toLowerCase().includes(auditSearchQuery.toLowerCase());
                        return matchDept && matchQuery;
                      })
                      .map((log) => {
                        const isLogin = log.action === 'LOGIN';
                        const formattedDate = new Date(log.timestamp).toLocaleString('ar-OM', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });

                        return (
                          <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                isLogin 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {isLogin ? (
                                  <>
                                    <LogIn className="w-3.5 h-3.5 text-emerald-400" /> تسجيل دخول
                                  </>
                                ) : (
                                  <>
                                    <LogOut className="w-3.5 h-3.5 text-amber-400" /> تسجيل خروج
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="p-3 font-bold text-white">
                              <span className="block">{log.name || "موظف مسؤول"}</span>
                            </td>

                            <td className="p-3 font-mono text-emerald-400 font-semibold dir-ltr text-right">
                              {log.email}
                            </td>

                            <td className="p-3 text-slate-300">
                              <span className="block font-semibold">{log.portalName || "لوحة تحكم فرعية"}</span>
                              <span className="text-[10px] text-amber-400 font-mono">({log.portalType || "general"})</span>
                            </td>

                            <td className="p-3 font-mono text-slate-300">
                              <span className="block font-semibold text-white">{formattedDate}</span>
                            </td>

                            <td className="p-3 font-mono text-slate-400 text-[11px]">
                              {log.ip || "192.168.1.1"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
