import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, Settings, MapPin, ClipboardList, Send, Check, X, 
  MapPinOff, Landmark, Compass, HelpCircle, Phone, Clock, Plus, Trash2, Users,
  Film, Image, UploadCloud, Copy, FileVideo
} from 'lucide-react';
import { GuideApplication, OfficeConfig, TripBooking, SupportTicket } from '../types';
import { INITIAL_APPLICATIONS, INITIAL_SUPPORT_TICKETS, INITIAL_TRIPS, DEFAULT_OFFICE } from '../initialData';

interface AdminPanelProps {
  onBackToLogin: () => void;
}

export default function AdminPanel({ onBackToLogin }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState('');

  // Admin section: 'applications' | 'guides' | 'announcements' | 'catalog' | 'office' | 'trips' | 'support' | 'media'
  const [adminSection, setAdminSection] = useState<'applications' | 'guides' | 'announcements' | 'catalog' | 'office' | 'trips' | 'support' | 'media'>('applications');

  // Local lists synced with localStorage or DB
  const [applications, setApplications] = useState<GuideApplication[]>([]);
  const [office, setOffice] = useState<OfficeConfig>(DEFAULT_OFFICE);
  const [trips, setTrips] = useState<TripBooking[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  // DB Guides and Announcements state
  const [guides, setGuides] = useState<any[]>([]);
  const [guideSuccess, setGuideSuccess] = useState(false);
  const [gName, setGName] = useState('');
  const [gNameAr, setGNameAr] = useState('');
  const [gSpec, setGSpec] = useState('Historical & Cultural Tours');
  const [gSpecAr, setGSpecAr] = useState('جولات تاريخية وثقافية');
  const [gCity, setGCity] = useState('مسقط');
  const [gExp, setGExp] = useState('5');
  const [gDesc, setGDesc] = useState('');
  const [gPhone, setGPhone] = useState('');
  const [gPrice, setGPrice] = useState('50');
  const [gImageUrl, setGImageUrl] = useState('/src/assets/guide-ahmed.png');

  // Announcement pop-up states
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annSuccess, setAnnSuccess] = useState(false);

  // Dynamic Catalog Addition States
  const [catalogType, setCatalogType] = useState<'attractions' | 'hotels' | 'restaurants'>('attractions');
  
  // Custom Dynamic Catalogs Lists
  const [customAttractions, setCustomAttractions] = useState<any[]>([]);
  const [customHotels, setCustomHotels] = useState<any[]>([]);
  const [customRestaurants, setCustomRestaurants] = useState<any[]>([]);
  const [catSuccess, setCatSuccess] = useState(false);

  // Catalog item creation states
  const [catName, setCatName] = useState('');
  const [catNameAr, setCatNameAr] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catCity, setCatCity] = useState('مسقط');
  const [catRegion, setCatRegion] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catPhone, setCatPhone] = useState('');
  const [catRating, setCatRating] = useState('4.8');
  const [catPrice, setCatPrice] = useState('45');
  const [catCuisine, setCatCuisine] = useState('عماني تقليدي');
  const [catGov, setCatGov] = useState('مسقط');
  const [catGovId, setCatGovId] = useState('muscat');
  const [catWilayat, setCatWilayat] = useState('مطرح');
  const [catCategory, setCatCategory] = useState('tourist');

  // Media Store States
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaSuccess, setMediaSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Trip Creator state
  const [newTourist, setNewTourist] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDuration, setNewDuration] = useState('يوم كامل');
  const [newPrice, setNewPrice] = useState('٥٠ ر.ع');
  const [newNotes, setNewNotes] = useState('');
  const [tripSuccess, setTripSuccess] = useState(false);

  // Ticket reply states
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  // Synchronize state from server (PostgreSQL database) on mount
  useEffect(() => {
    // 1. Fetch applications
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApplications(data);
          localStorage.setItem('shouma_applications', JSON.stringify(data));
        } else {
          loadAppsFromLocalFallback();
        }
      })
      .catch(() => loadAppsFromLocalFallback());

    // 2. Fetch office config
    fetch('/api/office')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setOffice(data);
          localStorage.setItem('shouma_office_config', JSON.stringify(data));
        } else {
          loadOfficeFromLocalFallback();
        }
      })
      .catch(() => loadOfficeFromLocalFallback());

    // 3. Fetch trips
    fetch('/api/trips')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTrips(data);
          localStorage.setItem('shouma_trips', JSON.stringify(data));
        } else {
          loadTripsFromLocalFallback();
        }
      })
      .catch(() => loadTripsFromLocalFallback());

    // 4. Fetch support tickets
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSupportTickets(data);
          localStorage.setItem('shouma_support_tickets', JSON.stringify(data));
        } else {
          loadTicketsFromLocalFallback();
        }
      })
      .catch(() => loadTicketsFromLocalFallback());

    // Fallbacks
    function loadAppsFromLocalFallback() {
      const saved = localStorage.getItem('shouma_applications');
      if (saved) {
        try { setApplications(JSON.parse(saved)); } catch (e) { setApplications(INITIAL_APPLICATIONS); }
      } else {
        setApplications(INITIAL_APPLICATIONS);
      }
    }

    function loadOfficeFromLocalFallback() {
      const saved = localStorage.getItem('shouma_office_config');
      if (saved) {
        try { setOffice(JSON.parse(saved)); } catch (e) { setOffice(DEFAULT_OFFICE); }
      } else {
        setOffice(DEFAULT_OFFICE);
      }
    }

    function loadTripsFromLocalFallback() {
      const saved = localStorage.getItem('shouma_trips');
      if (saved) {
        try { setTrips(JSON.parse(saved)); } catch (e) { setTrips(INITIAL_TRIPS); }
      } else {
        setTrips(INITIAL_TRIPS);
      }
    }

    function loadTicketsFromLocalFallback() {
      const saved = localStorage.getItem('shouma_support_tickets');
      if (saved) {
        try { setSupportTickets(JSON.parse(saved)); } catch (e) { setSupportTickets(INITIAL_SUPPORT_TICKETS); }
      } else {
        setSupportTickets(INITIAL_SUPPORT_TICKETS);
      }
    }

    // 5. Fetch dynamic tour guides
    fetch('/api/local-tour-guides')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGuides(data);
      })
      .catch(err => console.error("Error fetching db guides:", err));

    // 6. Fetch latest announcement
    fetch('/api/announcements/latest')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setAnnTitle(data.title);
          setAnnMessage(data.message);
        }
      })
      .catch(err => console.error("Error fetching announcement:", err));

    // 7. Fetch custom catalog categories
    fetch('/api/catalog/attractions').then(r => r.json()).then(d => { if (Array.isArray(d)) setCustomAttractions(d); });
    fetch('/api/catalog/hotels').then(r => r.json()).then(d => { if (Array.isArray(d)) setCustomHotels(d); });
    fetch('/api/catalog/restaurants').then(r => r.json()).then(d => { if (Array.isArray(d)) setCustomRestaurants(d); });

    // 8. Fetch media storage assets
    fetch('/api/media-assets')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMediaAssets(d); })
      .catch(e => console.error("Error loading media-assets:", e));
  }, []);

  const refreshMedia = () => {
    fetch('/api/media-assets')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMediaAssets(d); })
      .catch(e => console.error("Error refreshing media-assets:", e));
  };

  // Password submission handler
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'shouma2026') {
      setIsAuthenticated(true);
      setPassError('');
    } else {
      setPassError('⚠️ كلمة المرور خاطئة، يرجى المحاولة مرة أخرى.');
    }
  };

  // --- ADMIN HANDLERS FOR NEW SECTIONS ---
  const handleCreateGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName || !gNameAr || !gPhone) return;

    const payload = {
      name: gName,
      nameAr: gNameAr,
      specialization: gSpec,
      specializationAr: gSpecAr,
      languages: ['العربية', 'الإنجليزية'],
      experience: parseInt(gExp, 10) || 5,
      city: gCity,
      description: gDesc || 'مرشد سياحي مؤهل ومستبشر لمصاحبة الزوار لمواقع سلطنة عمان الأثرية والحديثة.',
      imageUrl: gImageUrl, // Dynamic uploaded avatar / image path
      phone: gPhone,
      whatsapp: gPhone.replace(/[^\d+]/g, ''),
      rating: '4.8',
      reviewsCount: 12,
      pricePerDay: parseInt(gPrice, 10) || 50,
      services: ['متاحف وقلاع', 'جولات الأسواق العارضة', 'التصوير والمغامرات'],
      availability: true
    };

    fetch('/api/local-tour-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(created => {
        setGuides(prev => [created, ...prev]);
        setGName('');
        setGNameAr('');
        setGPhone('');
        setGDesc('');
        setGuideSuccess(true);
        setTimeout(() => setGuideSuccess(false), 3000);
      })
      .catch(err => console.error(err));
  };

  const handleDeleteGuide = (id: number) => {
    fetch(`/api/local-tour-guides/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setGuides(prev => prev.filter(g => g.id !== id));
      })
      .catch(err => console.error(err));
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;

    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: annTitle,
        message: annMessage,
        isActive: true
      })
    })
      .then(res => res.json())
      .then(() => {
        setAnnSuccess(true);
        setTimeout(() => setAnnSuccess(false), 3000);
      })
      .catch(err => console.error(err));
  };

  const handleCreateCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catNameAr) return;

    let url = `/api/catalog/${catalogType}`;
    let payload: any = {};

    if (catalogType === 'attractions') {
      payload = {
        name: catName,
        nameAr: catNameAr,
        description: catDesc || 'معلم سياحي رائع في عُمان الطيبة.',
        governorate: catGov,
        governorateId: catGovId,
        wilayat: catWilayat,
        category: catCategory,
        image: catImage || 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&q=80&w=600',
        mapUrl: 'https://maps.google.com',
        rating: catRating
      };
    } else if (catalogType === 'hotels') {
      payload = {
        name: catName,
        nameAr: catNameAr,
        description: catDesc || 'إقامة فاخرة ومريحة لزوار عُمان.',
        city: catCity,
        region: catRegion || 'المركز الرفيع',
        image: catImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
        rating: parseFloat(catRating) || 4.8,
        pricePerNight: parseInt(catPrice, 10) || 60,
        stars: 4,
        phone: catPhone || '+96890000000',
        mapUrl: 'https://maps.google.com'
      };
    } else if (catalogType === 'restaurants') {
      payload = {
        name: catName,
        nameAr: catNameAr,
        description: catDesc || 'مأكولات عُمانية لذيذة وتجربة رائعة.',
        city: catCity,
        region: catRegion || 'الشهباء',
        image: catImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
        cuisine: catCuisine,
        priceRange: 'moderate',
        rating: parseFloat(catRating) || 4.7,
        features: ['عوائل', 'جلسات خارجية', 'مواقف متوفرة'],
        mapUrl: 'https://maps.google.com'
      };
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(created => {
        if (catalogType === 'attractions') {
          setCustomAttractions(prev => [created, ...prev]);
        } else if (catalogType === 'hotels') {
          setCustomHotels(prev => [created, ...prev]);
        } else if (catalogType === 'restaurants') {
          setCustomRestaurants(prev => [created, ...prev]);
        }
        
        // Reset
        setCatName('');
        setCatNameAr('');
        setCatDesc('');
        setCatImage('');
        setCatPhone('');
        setCatRegion('');
        
        setCatSuccess(true);
        setTimeout(() => setCatSuccess(false), 3000);
      })
      .catch(err => console.error(err));
  };

  const handleDeleteCatalogItem = (type: 'attractions' | 'hotels' | 'restaurants', id: number) => {
    fetch(`/api/catalog/${type}/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        if (type === 'attractions') {
          setCustomAttractions(prev => prev.filter(item => item.id !== id));
        } else if (type === 'hotels') {
          setCustomHotels(prev => prev.filter(item => item.id !== id));
        } else if (type === 'restaurants') {
          setCustomRestaurants(prev => prev.filter(item => item.id !== id));
        }
      })
      .catch(err => console.error(err));
  };

  // Applications Actions
  const handleAppStatusChange = (id: string, newStatus: 'approved' | 'rejected') => {
    fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(updatedApp => {
        const updated = applications.map(app => app.id === id ? updatedApp : app);
        setApplications(updated);
        localStorage.setItem('shouma_applications', JSON.stringify(updated));
      })
      .catch(err => {
        console.error("Failed to update status on server, falling back to local state:", err);
        const updated = applications.map(app => app.id === id ? { ...app, status: newStatus } : app);
        setApplications(updated);
        localStorage.setItem('shouma_applications', JSON.stringify(updated));
      });
  };

  const handleDeleteApp = (id: string) => {
    fetch(`/api/applications/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        const updated = applications.filter(app => app.id !== id);
        setApplications(updated);
        localStorage.setItem('shouma_applications', JSON.stringify(updated));
      })
      .catch(err => {
        console.error("Failed to delete application on server, falling back to local state:", err);
        const updated = applications.filter(app => app.id !== id);
        setApplications(updated);
        localStorage.setItem('shouma_applications', JSON.stringify(updated));
      });
  };

  // Office Config Actions
  const handleOfficeFieldChange = (field: keyof OfficeConfig, value: string) => {
    const updated = { ...office, [field]: value };
    setOffice(updated);
    localStorage.setItem('shouma_office_config', JSON.stringify(updated));

    // Save configuration directly to full stack server API
    fetch('/api/office', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
      .then(res => res.json())
      .catch(err => console.error("Error setting office configuration", err));
  };

  // Create Mock Trip
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourist || !newDestination || !newDate) return;

    const tripBody = {
      touristName: newTourist,
      destination: newDestination,
      date: newDate,
      duration: newDuration,
      price: newPrice,
      notes: newNotes,
    };

    fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripBody)
    })
      .then(res => res.json())
      .then(newTrip => {
        const updated = [newTrip, ...trips];
        setTrips(updated);
        localStorage.setItem('shouma_trips', JSON.stringify(updated));

        // Reset fields
        setNewTourist('');
        setNewDestination('');
        setNewDate('');
        setNewNotes('');
        setTripSuccess(true);
        setTimeout(() => setTripSuccess(false), 3000);
      })
      .catch(err => {
        console.error("Failed to create trip on server, falling back to local state:", err);
        const localTrip = { ...tripBody, id: 'trip-' + Date.now(), status: 'assigned' as const };
        const updated = [localTrip, ...trips];
        setTrips(updated);
        localStorage.setItem('shouma_trips', JSON.stringify(updated));

        // Reset fields
        setNewTourist('');
        setNewDestination('');
        setNewDate('');
        setNewNotes('');
        setTripSuccess(true);
        setTimeout(() => setTripSuccess(false), 3000);
      });
  };

  // Delete Trip
  const handleDeleteTrip = (id: string) => {
    fetch(`/api/trips/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        const updated = trips.filter(t => t.id !== id);
        setTrips(updated);
        localStorage.setItem('shouma_trips', JSON.stringify(updated));
      })
      .catch(err => {
        console.error("Failed to delete trip on server, falling back to local state:", err);
        const updated = trips.filter(t => t.id !== id);
        setTrips(updated);
        localStorage.setItem('shouma_trips', JSON.stringify(updated));
      });
  };

  // Support Reply submission
  const handleSupportReply = (id: string) => {
    const replyText = replyTexts[id];
    if (!replyText || !replyText.trim()) return;

    fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'answered', reply: replyText })
    })
      .then(res => res.json())
      .then(updatedTicket => {
        const updated = supportTickets.map(ticket => ticket.id === id ? updatedTicket : ticket);
        setSupportTickets(updated);
        localStorage.setItem('shouma_support_tickets', JSON.stringify(updated));
        setReplyTexts(prev => ({ ...prev, [id]: '' }));
      })
      .catch(err => {
        console.error("Failed to submit support reply to server:", err);
        const updated = supportTickets.map(ticket => {
          if (ticket.id === id) {
            return {
              ...ticket,
              status: 'answered' as const,
              reply: replyText
            };
          }
          return ticket;
        });
        setSupportTickets(updated);
        localStorage.setItem('shouma_support_tickets', JSON.stringify(updated));
        setReplyTexts(prev => ({ ...prev, [id]: '' }));
      });
  };

  {/* AUTHENTICATION GATE */}
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 font-sans dir-rtl">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full filter blur-3xl" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center mx-auto mb-4 text-amber-500">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">لوحة الإدارة والمشرفين</h2>
            <p className="text-slate-400 text-xs mt-1">يتطلب استعراض طلبات تفعيل المرشدين كلمة المرور الإدارية لشومة</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">كلمة المرور الإدارية</label>
              <input
                id="admin-password-input"
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="أدخل كلمة المرور هنا..."
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-700 focus:outline-none focus:border-amber-500/50 text-center text-sm font-mono tracking-widest"
              />
            </div>

            {passError && (
              <p className="text-xs text-red-400 text-center font-semibold mt-2">{passError}</p>
            )}

            <button
              id="btn-admin-auth-submit"
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              فتح لوحة الإدارة
            </button>
          </form>

          <button
            id="btn-admin-back-login"
            onClick={onBackToLogin}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-300 mt-6 block underline"
          >
            الرجوع إلى صفحة الدخول الرئيسية
          </button>
        </div>
      </div>
    );
  }

  {/* FULLY AUTHENTICATED PANEL */}
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans dir-rtl">
      
      {/* Admin Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            <div>
              <h1 className="text-lg font-bold text-white">لوحة شومة الإدارية المتكاملة</h1>
              <span className="text-[10px] text-amber-500 font-mono">وضع الحماية نشط • shouma2026</span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-2xl">
            <button
              id="sect-apps"
              onClick={() => setAdminSection('applications')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                adminSection === 'applications' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>طلبات التقديم ({applications.length})</span>
            </button>
            <button
              id="sect-guides"
              onClick={() => setAdminSection('guides')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                adminSection === 'guides' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>المرشدين السياحيين ({guides.length})</span>
            </button>
            <button
              id="sect-announcements"
              onClick={() => setAdminSection('announcements')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                adminSection === 'announcements' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>إعلانات المنبثقة</span>
            </button>
            <button
              id="sect-catalog"
              onClick={() => setAdminSection('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                adminSection === 'catalog' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>إضافة معالم/فنادق/مطاعم</span>
            </button>
            <button
              id="sect-office"
              onClick={() => setAdminSection('office')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                adminSection === 'office' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>موقع المكتب</span>
            </button>
            <button
              id="sect-trips"
              onClick={() => setAdminSection('trips')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                adminSection === 'trips' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>تخصيص الرحلات</span>
            </button>
            <button
              id="sect-support"
              onClick={() => setAdminSection('support')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                adminSection === 'support' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>الدعم الفني ({supportTickets.filter(t=>t.status==='open').length})</span>
            </button>
            <button
              id="sect-media"
              onClick={() => setAdminSection('media')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-dashed ${
                adminSection === 'media' ? 'bg-amber-500 text-slate-950 border-amber-600' : 'text-slate-400 hover:text-slate-200 border-slate-700/60'
              }`}
            >
              <Film className="w-4 h-4 text-amber-500" />
              <span>معرض وسائط التخزين</span>
            </button>
          </nav>

          <button
            id="btn-admin-logout"
            onClick={onBackToLogin}
            className="px-4 py-1.5 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded-xl text-xs transition-all cursor-pointer"
          >
            خروج من الإدارة
          </button>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6">
        
        {/* SECTION 1: APPLICATIONS */}
        {adminSection === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-2">إدارة طلبات مرشدي السياحة الجدد</h2>

            {applications.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                <MapPinOff className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">لم يرسل أي مرشح طلب تقديم حتى الآن.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{app.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            app.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            'bg-red-500/10 text-red-500 border border-red-500/30'
                          }`}>
                            {app.status === 'pending' ? 'قيد الانتظار' :
                             app.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block mt-1">المعرّف: {app.id} • تم التقديم: {new Date(app.submittedAt).toLocaleString('ar-OM')}</span>
                      </div>

                      {/* Control actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`btn-approve-app-${app.id}`}
                          onClick={() => handleAppStatusChange(app.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>قبول وتفعيل</span>
                        </button>
                        <button
                          id={`btn-reject-app-${app.id}`}
                          onClick={() => handleAppStatusChange(app.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </button>
                        <button
                          id={`btn-delete-app-${app.id}`}
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                          title="حذف الطلب نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                      <div>
                        <span className="text-slate-500 text-[10px] block">العمر</span>
                        <strong className="text-slate-200 mt-0.5 block">{app.age} عاماً</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-mono">رقم الهاتف</span>
                        <strong className="text-slate-200 mt-0.5 block font-mono">{app.phone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">البريد الإلكتروني</span>
                        <strong className="text-slate-200 mt-0.5 block">{app.email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block font-semibold text-amber-400">المحافظة والجنسية</span>
                        <strong className="text-slate-200 mt-0.5 block">{app.nationality} • {app.governorate}</strong>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-500 block">اللغات المتوفرة:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {app.languages.map((l, i) => (
                            <span key={i} className="text-xs bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">{l}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block">التوصيف الذاتي والخبرات:</span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-850/80 mt-1">{app.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION: DYNAMIC TOUR GUIDES */}
        {adminSection === 'guides' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create guide form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit text-right">
              <h3 className="text-lg font-bold text-white mb-2">إضافة مرشد سياحي جديد</h3>
              <p className="text-xs text-slate-400 mb-5">أدخل تفاصيل المرشد ورقم هاتفه ليظهر فوراً للزوار والسياح في التطبيق.</p>

              {guideSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs text-center font-bold">
                  🎉 تم إضافة المرشد ونشره في التطبيق بنجاح!
                </div>
              )}

              <form onSubmit={handleCreateGuide} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل (بالعربية)</label>
                  <input
                    type="text"
                    required
                    value={gNameAr}
                    onChange={(e) => setGNameAr(e.target.value)}
                    placeholder="مثال: أحمد الحارثي"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم Full Name (بالإنجليزية)</label>
                  <input
                    type="text"
                    required
                    value={gName}
                    onChange={(e) => setGName(e.target.value)}
                    placeholder="Example: Ahmed Al-Harthy"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">رقم الهاتف النشط</label>
                    <input
                      type="text"
                      required
                      value={gPhone}
                      onChange={(e) => setGPhone(e.target.value)}
                      placeholder="+96894567890"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">أتعاب الجولة اليومية ($)</label>
                    <input
                      type="number"
                      value={gPrice}
                      onChange={(e) => setGPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">المدينة</label>
                    <select
                      value={gCity}
                      onChange={(e) => setGCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="مسقط">مسقط</option>
                      <option value="نزوى">نزوى</option>
                      <option value="صلالة">صلالة</option>
                      <option value="صور">صور</option>
                      <option value="البريمي">البريمي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">سنوات الخبرة</label>
                    <input
                      type="number"
                      value={gExp}
                      onChange={(e) => setGExp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">التخصص بالعربية</label>
                  <input
                    type="text"
                    value={gSpecAr}
                    onChange={(e) => setGSpecAr(e.target.value)}
                    placeholder="جولات أثرية، جبال وهايكنج..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">التخصص بالإنجليزية</label>
                  <input
                    type="text"
                    value={gSpec}
                    onChange={(e) => setGSpec(e.target.value)}
                    placeholder="Historical, Hiking & Camping..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">نبذة وتعريف قصير</label>
                  <textarea
                    rows={3}
                    value={gDesc}
                    onChange={(e) => setGDesc(e.target.value)}
                    placeholder="قصته، شغفه، المواقع المفضلة لديه بالعربية..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">صورة المرشد (الرمزية أو الشخصية)</label>
                    <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer bg-slate-950 px-2 py-0.5 border border-slate-800 rounded-lg">
                      <span>رفع مباشر 📁</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            try {
                              const base64Data = reader.result as string;
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  filename: file.name,
                                  fileType: 'image',
                                  mimeType: file.type,
                                  size: file.size,
                                  base64Data
                                })
                              });
                              if (res.ok) {
                                const savedAsset = await res.json();
                                setGImageUrl(savedAsset.url);
                                alert('تم رفع الصورة بنجاح وتعبئة الرابط تلقائياً!');
                              } else {
                                alert('حدث خطأ أثناء الرفع بالمرشد.');
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={gImageUrl}
                    onChange={(e) => setGImageUrl(e.target.value)}
                    placeholder="/src/assets/guide-ahmed.png أو رابط ويب..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ ونشر المرشد</span>
                </button>
              </form>
            </div>

            {/* List and manage guides */}
            <div className="lg:col-span-2 space-y-4 text-right">
              <h3 className="text-lg font-bold text-white">المرشدين المتوفرين بالمنصة</h3>
              
              {guides.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">لا يتوفر مرشدين مسجلين في قاعدة البيانات حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guides.map((g) => (
                    <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full filter blur-xl" />
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white text-base">{g.name_ar || g.nameAr || g.name}</h4>
                          <span className="text-[10px] bg-slate-950 border border-slate-800 text-amber-500 px-2 py-0.5 rounded-full font-mono">
                            ID: {g.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mb-1 font-semibold">{g.specialization_ar || g.specializationAr || g.specialization}</p>
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{g.description}</p>
                        
                        <div className="p-2 bg-slate-950/40 rounded-xl border border-slate-850 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">رقم الهاتف والواتساب:</span>
                            <span className="text-slate-200 font-mono" dir="ltr">{g.phone}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">المدينة وعقود الخبرة:</span>
                            <span className="text-slate-200">{g.city} • {g.experience} سنوات</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4 pt-3 border-t border-slate-850">
                        <button
                          onClick={() => handleDeleteGuide(g.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>إزالة المرشد نهائياً</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION: ANNOUNCEMENTS MANAGER */}
        {adminSection === 'announcements' && (
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-right">
            <div>
              <h2 className="text-xl font-bold text-white pb-2 border-b border-slate-800">إطلاق وتعديل الإعلان المنبثق</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">اكتب الإشعار، التعليمات، أو تحديثات السير والطقس الحالية. تظهر كإعلام ترحيبي منبثق فوري للمستخدم عند قيامه بفتح التطبيق في المرة القادمة.</p>
            </div>

            {annSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs text-center font-bold">
                🎉 تم تفعيل ونشر الإشعار المنبثق بنجاح في عموم التطبيق!
              </div>
            )}

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">عنوان الإعلان المنبثق</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="مثال: مرحباً بكم في تطبيق شومة الرفيق السياحي!"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رسالة وتفاصيل الإعلان (تدعم السطور المتعددة)</label>
                <textarea
                  rows={6}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="مثال: يسعدنا ترحيبكم في النسخة المحدثة 2026! يمكنك الآن كبس زر طلب رحلة لعقد جولة مباشرة رفقة أفضل المرشدين السياحيين المعتمين في السلطنة."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right leading-relaxed focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>حفظ ونشر التحديث الفوري</span>
              </button>
            </form>
          </div>
        )}

        {/* SECTION: MANAGE DYNAMIC CATALOG ITEMS */}
        {adminSection === 'catalog' && (
          <div className="space-y-6 text-right">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">إضافة وإدارة محتوى التطبيق</h2>
                <p className="text-xs text-slate-400">يمكنك هنا إضافة وتعمير بقية الأماكن والمعالم والفنادق والمطاعم مباشرة في التطبيق.</p>
              </div>

              {/* Selector */}
              <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-2xl gap-1">
                <button
                  onClick={() => setCatalogType('attractions')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    catalogType === 'attractions' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  معلم سياحي
                </button>
                <button
                  onClick={() => setCatalogType('hotels')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    catalogType === 'hotels' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  فندق / إقامة
                </button>
                <button
                  onClick={() => setCatalogType('restaurants')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    catalogType === 'restaurants' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  مطعم / مقهى
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add form */}
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit">
                <h3 className="text-lg font-bold text-white mb-2">إضافة {catalogType === 'attractions' ? 'معلم سياحي' : catalogType === 'hotels' ? 'مكان إقامة' : 'مطعم'} جديد</h3>
                
                {catSuccess && (
                  <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs text-center font-bold animate-pulse">
                    🎉 تم حفظ العنصر ونشره في التطبيق بنجاح!
                  </div>
                )}

                <form onSubmit={handleCreateCatalogItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل بالعربية</label>
                    <input
                      type="text"
                      required
                      value={catNameAr}
                      onChange={(e) => setCatNameAr(e.target.value)}
                      placeholder="مثال: قلعة نزوى التاريخية"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل بالإنجليزية</label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="Example: Nizwa Fort"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">المدينة</label>
                      <input
                        type="text"
                        value={catCity}
                        onChange={(e) => setCatCity(e.target.value)}
                        placeholder="مسقط / الداخلية"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">معدل التقييم</label>
                      <input
                        type="text"
                        value={catRating}
                        onChange={(e) => setCatRating(e.target.value)}
                        placeholder="4.8"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {catalogType === 'attractions' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">المحافظة (الرمز)</label>
                        <select
                          value={catGovId}
                          onChange={(e) => setCatGovId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left focus:outline-none"
                        >
                          <option value="muscat">Muscat</option>
                          <option value="dhofar">Dhofar</option>
                          <option value="dakhiliyah">Dakhiliyah</option>
                          <option value="sharqiyah">Sharqiyah</option>
                          <option value="batinah">Batinah</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">الولاية / المنطقة</label>
                        <input
                          type="text"
                          value={catWilayat}
                          onChange={(e) => setCatWilayat(e.target.value)}
                          placeholder="مطرح / بهلاء"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {catalogType === 'hotels' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">سعر الليلة الرسمية ($)</label>
                        <input
                          type="number"
                          value={catPrice}
                          onChange={(e) => setCatPrice(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">الهاتف المرجعي</label>
                        <input
                          type="text"
                          value={catPhone}
                          onChange={(e) => setCatPhone(e.target.value)}
                          placeholder="+968 9123 4567"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {catalogType === 'restaurants' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع المطبخ / الأكلات المقدمة</label>
                      <input
                        type="text"
                        value={catCuisine}
                        onChange={(e) => setCatCuisine(e.target.value)}
                        placeholder="أكلات شعبية عمانية ومضغوط"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">التوصيف والتعريف</label>
                    <textarea
                      rows={3}
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      placeholder="موجز تفصيلي عن مواعيد العمل والمميزات بالعربية..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-right focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-300">رابط الغلاف أو الفيديو (URL)</label>
                      <label className="text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer bg-slate-950 px-2 py-0.5 border border-slate-800 rounded-lg">
                        <span>رفع مباشر 📁</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                              try {
                                const base64Data = reader.result as string;
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    filename: file.name,
                                    fileType: file.type.startsWith('video') ? 'video' : 'image',
                                    mimeType: file.type,
                                    size: file.size,
                                    base64Data
                                  })
                                });
                                if (res.ok) {
                                  const savedAsset = await res.json();
                                  setCatImage(savedAsset.url);
                                  alert('تم رفع الملف بنجاح وتعيين الرابط تلقائياً!');
                                } else {
                                  alert('حدث خطأ أثناء الرفع بالمرشد.');
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      placeholder="/assets/uploads/image.jpg أو رابط ويب..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs text-left font-mono focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>حفظ ونشر العنصر</span>
                  </button>
                </form>
              </div>

              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-white">العناصر المضافة بواسطة المشرفين</h3>

                {catalogType === 'attractions' && (
                  customAttractions.length === 0 ? (
                    <p className="text-slate-500 text-xs p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">لم تقم بإضافة أي معالم مخصصة حتى الان.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customAttractions.map((item) => (
                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-white text-sm">{item.nameAr || item.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                            <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded-full mt-2 inline-block">
                              {item.wilayat} • تقييم {item.rating}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteCatalogItem('attractions', item.id)}
                            className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {catalogType === 'hotels' && (
                  customHotels.length === 0 ? (
                    <p className="text-slate-500 text-xs p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">لم تقم بإضافة أي أماكن إقامة مخصصة حتى الان.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customHotels.map((item) => (
                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-white text-sm">{item.nameAr || item.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                            <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-405 px-2 py-0.5 rounded-full mt-2 inline-block">
                              {item.city} • {item.pricePerNight || item.price_per_night} $/ليلة
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteCatalogItem('hotels', item.id)}
                            className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {catalogType === 'restaurants' && (
                  customRestaurants.length === 0 ? (
                    <p className="text-slate-500 text-xs p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">لم تقم بإضافة أي مطاعم مخصصة حتى الان.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customRestaurants.map((item) => (
                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-white text-sm">{item.nameAr || item.name}</h4>
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                            <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-400 px-2 py-0.5 rounded-full mt-2 inline-block">
                              الملة: {item.cuisine} • تقييم {item.rating}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteCatalogItem('restaurants', item.id)}
                            className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: OFFICE CONFIGURATION */}
        {adminSection === 'office' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white pb-3 border-b border-slate-800">إعادة موقع مكتب شومة</h2>
            <p className="text-xs text-slate-400">تظهر هذه البيانات مباشرة للمرشحين المقبولين أو الجدد كعنوان مرجعي بعد إتمام إرسال الطلبات بنجاح.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اسم المكتب</label>
                <input
                  id="office-name-input"
                  type="text"
                  value={office.name}
                  onChange={(e) => handleOfficeFieldChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">العنوان التفصيلي</label>
                <textarea
                  id="office-address-input"
                  rows={2}
                  value={office.address}
                  onChange={(e) => handleOfficeFieldChange('address', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">رقم هاتف المكتب</label>
                  <input
                    id="office-phone-input"
                    type="text"
                    value={office.phone}
                    onChange={(e) => handleOfficeFieldChange('phone', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">ساعات العمل الرسمية</label>
                  <input
                    id="office-hours-input"
                    type="text"
                    value={office.workingHours}
                    onChange={(e) => handleOfficeFieldChange('workingHours', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رابط تضمين خريطة جوجل (Google Maps Embed Link)</label>
                <p className="text-[10px] text-slate-500 mb-2">قيمة المعلم src فقط الموجودة داخل كود المشاركة (iframe).</p>
                <input
                  id="office-map-input"
                  type="text"
                  value={office.mapEmbedUrl}
                  onChange={(e) => handleOfficeFieldChange('mapEmbedUrl', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-[10px]"
                />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-xs text-emerald-300">
                🔒 يتم تدوين وتحديث البيانات بمجرد الكتابة وحفظها تلقائياً على خوادم الاستعراض.
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: TRIP ALLOCATIONS */}
        {adminSection === 'trips' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Trip Form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit">
              <h2 className="text-lg font-bold text-white mb-2">تخصيص وإسناد رحلة لمرشد</h2>
              <p className="text-xs text-slate-400 mb-5">أرسل عرض عمل جديد. سيظهر فوراً في تبويب "طلبات" وبإمكان المرشد الاستجابة بالقبول أو الرفض.</p>

              {tripSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs text-center font-bold">
                  تم إسناد وإرسال الطلب بنجاح!
                </div>
              )}

              <form onSubmit={handleCreateTrip} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم السائح أو المجموعة</label>
                  <input
                    id="new-trip-tourist"
                    type="text"
                    required
                    value={newTourist}
                    onChange={(e) => setNewTourist(e.target.value)}
                    placeholder="مثال: جون هانكوك وعائلته"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-250 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الوجهة والمسار</label>
                  <input
                    id="new-trip-destination"
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="مثال: هايكنج جبل شمس"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-250 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">تاريخ الانطلاق</label>
                    <input
                      id="new-trip-date"
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-250 text-xs font-sans text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">أتعاب الجولة (ر.ع)</label>
                    <input
                      id="new-trip-price"
                      type="text"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="مثال: ٦٥ ر.ع"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-250 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">التعليمات أو الملاحظات</label>
                  <textarea
                    id="new-trip-notes"
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="اكتب متطلبات العميل للتسهيل على المرشد (اختياري)..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-250 text-xs"
                  />
                </div>

                <button
                  id="btn-create-trip"
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>أرسل الطلب للمرشدين</span>
                </button>
              </form>
            </div>

            {/* Trips List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-white">الرحلات الحالية بالمنصة وحالتها</h2>

              {trips.length === 0 ? (
                <div className="p-10 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <Compass className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs">لا توجد رحلات مخصصة أو مدرجة في الوقت الحالي.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <div key={trip.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1 text-right" dir="rtl">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-white">{trip.touristName}</strong>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            trip.status === 'assigned' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            trip.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {trip.status === 'assigned' ? 'بانتظار الموافقة' :
                             trip.status === 'accepted' ? 'تم قبولها' :
                             trip.status === 'declined' ? 'مرفوضة من المرشد' : 'مكتملة'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {trip.destination} • 📅 {trip.date} • {trip.duration}
                        </p>
                        <p className="text-slate-400 text-[10px] font-mono mb-1">الأجر المقدر: {trip.price}</p>
                        {trip.badges && Array.isArray(trip.badges) && trip.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {trip.badges.map((b: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center gap-1 text-[9px] font-sans font-bold bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded text-amber-500">
                                ✦ {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        id={`btn-delete-trip-${trip.id}`}
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-xl transition-all cursor-pointer mr-auto"
                        title="حذف الجولة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: SUPPORT TICKETS */}
        {adminSection === 'support' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-2">الاستماع والرد على شكاوى المرشدين</h2>

            {supportTickets.length === 0 ? (
              <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">لا يوجد بلاغات أو تذاكر دعم فني مفتوحة.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{ticket.subject}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.status === 'open' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                          }`}>
                            {ticket.status === 'open' ? 'تنتظر الرد الإداري' : 'تم الرد'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          المرشد: {ticket.guideName} ({ticket.email}) • تم الإرسال: {new Date(ticket.createdAt).toLocaleDateString('ar-OM')}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed leading-normal bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 mb-4 font-sans">
                      {ticket.message}
                    </p>

                    {/* Reply input/or display */}
                    <div className="space-y-2">
                      {ticket.reply ? (
                        <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 text-xs">
                          <p className="text-amber-400 font-bold mb-1 block text-[10px]">الرد الحالي الخاص بك:</p>
                          <p className="text-slate-300 leading-normal">{ticket.reply}</p>
                        </div>
                      ) : null}

                      <div className="flex gap-2 mt-2">
                        <input
                          id={`reply-input-${ticket.id}`}
                          type="text"
                          value={replyTexts[ticket.id] || ''}
                          onChange={(e) => setReplyTexts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder={ticket.reply ? 'تحديث أو تعديل الرد...' : 'اكتب الرد الرسمي والدقيق هنا...'}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                        />
                        <button
                          id={`btn-reply-submit-${ticket.id}`}
                          onClick={() => handleSupportReply(ticket.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Send className="w-3.5 h-3.5 transform rotate-180" />
                          <span>إرسال الرد</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: MEDIA GALLERY & SECURE STORAGE */}
        {adminSection === 'media' && (
          <div className="space-y-6 text-right" dir="rtl">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Film className="w-5 h-5 text-amber-500" />
                    معرض الصور والفيديوهات (ذاكرة التخزين السحابية)
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    استخدم هذا القسم لرفع الصور والفيديوهات وربطها بمفتاح واجهة برمجة التخزين المخصص. يمكنك نسخ روابطها لمختلف المعالم والخدمات.
                  </p>
                </div>
                <div className="bg-slate-950/90 border border-slate-850 rounded-xl px-4 py-2 flex items-center gap-2 max-w-sm ml-auto md:ml-0 text-left" dir="ltr">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-slate-500 block font-sans">Storage API Activation Token:</span>
                    <code className="text-xs text-amber-400 font-mono break-all font-semibold">fr8RgP443tUZInXLjnaWIl54eo0</code>
                  </div>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-slate-950 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all relative text-center flex flex-col items-center justify-center min-h-[220px]">
                    <UploadCloud className="w-10 h-10 text-slate-500 mb-3 animate-pulse" />
                    <h4 className="text-xs font-bold text-slate-200 mb-1">اسحب وأفلت الملفات هنا</h4>
                    <p className="text-[10px] text-slate-500 mb-4 font-sans">يدعم الصور والفيديوهات (PNG, JPG, MP4)</p>
                    
                    <label className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 focus:ring-2 focus:ring-amber-500/40 font-sans">
                      <span>اختر ملفاً لرفعه 📷</span>
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setIsUploading(true);
                          const reader = new FileReader();
                          reader.onload = async () => {
                            try {
                              const base64Data = reader.result as string;
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  filename: file.name,
                                  fileType: file.type.startsWith('video') ? 'video' : 'image',
                                  mimeType: file.type,
                                  size: file.size,
                                  base64Data
                                })
                              });
                              if (res.ok) {
                                setMediaSuccess(true);
                                refreshMedia();
                                setTimeout(() => setMediaSuccess(false), 3000);
                              } else {
                                alert('فشل رفع الملف، الرجاء المحاولة مرة أخرى.');
                              }
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setIsUploading(false);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    {isUploading && (
                      <div className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                        <span className="text-[11px] text-amber-500 font-sans font-semibold">جاري التشفير والرفع لمفتاح التخزين...</span>
                      </div>
                    )}
                  </div>

                  {mediaSuccess && (
                     <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-[11px] text-emerald-400 flex items-center justify-center gap-1.5 animate-bounce">
                       <Check className="w-3.5 h-3.5 text-emerald-500" />
                       <span>تم الرفع والتأمين بالرمز fr8RgP443t...!</span>
                     </div>
                  )}
                </div>

                {/* Media assets grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-350">أحدث الملفات بقاعدة بيانات التخزين ({mediaAssets.length})</h3>
                    <button 
                      onClick={refreshMedia}
                      className="text-[10px] text-amber-500 hover:text-amber-400 font-bold transition-all"
                    >
                      تحديث المعرض ↻
                    </button>
                  </div>

                  {mediaAssets.length === 0 ? (
                    <div className="p-12 text-center bg-slate-950/50 border border-slate-855 rounded-2xl">
                      <Image className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs">لا يوجد ملفات مرفوعة حالياً. ابدأ بالرفع المباشر أعلاه.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pl-2 scrollbar-thin">
                      {mediaAssets.map((asset) => (
                        <div key={asset.id} className="bg-slate-950 border border-slate-850 rounded-xl p-2 relative group hover:border-slate-800 transition-all flex flex-col justify-between">
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-850">
                            {asset.fileType === 'video' ? (
                              <div className="relative w-full h-full">
                                <video src={asset.url} className="w-full h-full object-cover" muted loop preload="metadata" />
                                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center pointer-events-none">
                                  <FileVideo className="w-6 h-6 text-amber-500" />
                                </div>
                              </div>
                            ) : (
                              <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-[10px] text-slate-300 truncate font-mono font-medium text-left" title={asset.filename}>
                              {asset.filename}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">
                                {asset.fileType || 'image'}
                              </span>
                              <span className="text-[7px] text-slate-500 font-mono">
                                {Math.round(asset.size / 102.4) / 10} KB
                              </span>
                            </div>
                            
                            <div className="flex gap-1 pt-1.5 mt-1 border-t border-slate-900">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(asset.url);
                                  setCopiedId(asset.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="flex-1 py-1 px-1 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 rounded text-[9px] font-sans font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border border-slate-850/60"
                              >
                                {copiedId === asset.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-500 animate-ping" />
                                    <span className="text-emerald-400">تم النسخ!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5 text-amber-500" />
                                    <span>نسخ الرابط</span>
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={async () => {
                                  if (confirm('هل أنت متأكد من حذف هذا الملف نهائياً من ذاكرة التخزين؟')) {
                                    await fetch(`/api/media-assets/${asset.id}`, { method: 'DELETE' });
                                    refreshMedia();
                                  }
                                }}
                                className="p-1 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                                title="حذف"
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
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-600">
        <p>© 2026 شومة للسياحة والرحلات والاستكشاف • لوحة حماية الإدارة الكاملة</p>
      </footer>
    </div>
  );
}
