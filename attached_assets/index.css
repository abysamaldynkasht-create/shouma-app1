import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Compass, FileSpreadsheet, User, HeartHandshake, LogOut, Check, X, 
  Send, UserCheck, ShieldCheck, MapPin, Sparkles, MessageSquare, AlertCircle, Phone, Calendar,
  CreditCard, Landmark, Loader2
} from 'lucide-react';
import { TripBooking, SupportTicket, GuideApplication } from '../types';
import { INITIAL_TRIPS, INITIAL_SUPPORT_TICKETS } from '../initialData';

interface DashboardProps {
  programmerName: string;
  onLogout: () => void;
}

export default function Dashboard({ programmerName, onLogout }: DashboardProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'home' | 'trips' | 'account' | 'support'>('home');

  // Status (متوفر الان او لا)
  const [isAvailable, setIsAvailable] = useState(() => {
    const saved = localStorage.getItem('shouma_guide_available');
    return saved ? JSON.parse(saved) : true;
  });

  // Trip bookings local state
  const [trips, setTrips] = useState<TripBooking[]>(() => {
    const saved = localStorage.getItem('shouma_trips');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_TRIPS; }
    }
    return INITIAL_TRIPS;
  });

  // Support Tickets local state
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('shouma_support_tickets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_SUPPORT_TICKETS; }
    }
    return INITIAL_SUPPORT_TICKETS;
  });

  // New Ticket Fields
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Bank Muscat Linkage States
  const [isBankLinked, setIsBankLinked] = useState(() => {
    return localStorage.getItem('shouma_bank_linked') === 'true';
  });
  const [bankAccountName, setBankAccountName] = useState(() => {
    return localStorage.getItem('shouma_bank_acc_name') || '';
  });
  const [bankAccountNumber, setBankAccountNumber] = useState(() => {
    return localStorage.getItem('shouma_bank_acc_num') || '';
  });
  const [bankCivilID, setBankCivilID] = useState(() => {
    return localStorage.getItem('shouma_bank_civil_id') || '';
  });
  const [isLinkingFormOpen, setIsLinkingFormOpen] = useState(false);
  const [isLinkingLoading, setIsLinkingLoading] = useState(false);
  const [bankLinkError, setBankLinkError] = useState('');

  const handleLinkBank = (e: React.FormEvent) => {
    e.preventDefault();
    setBankLinkError('');
    if (!bankAccountName.trim() || !bankAccountNumber.trim() || !bankCivilID.trim()) {
      setBankLinkError('يرجى ملء جميع الحقول المطلوبة لتكتمل عملية الربط.');
      return;
    }
    // Simple verification
    if (bankAccountNumber.trim().length < 8) {
      setBankLinkError('تنبيه: يجب أن يحتوي رقم الحساب على 8 خانات رقمية على الأقل.');
      return;
    }

    setIsLinkingLoading(true);
    setTimeout(() => {
      setIsBankLinked(true);
      setIsLinkingLoading(false);
      setIsLinkingFormOpen(false);
      localStorage.setItem('shouma_bank_linked', 'true');
      localStorage.setItem('shouma_bank_acc_name', bankAccountName);
      localStorage.setItem('shouma_bank_acc_num', bankAccountNumber);
      localStorage.setItem('shouma_bank_civil_id', bankCivilID);
    }, 1500);
  };

  const handleUnlinkBank = () => {
    if (confirm('هل أنت متأكد من رغبتك في إلغاء ربط حساب بنك مسقط؟')) {
      setIsBankLinked(false);
      setBankAccountName('');
      setBankAccountNumber('');
      setBankCivilID('');
      localStorage.removeItem('shouma_bank_linked');
      localStorage.removeItem('shouma_bank_acc_name');
      localStorage.removeItem('shouma_bank_acc_num');
      localStorage.removeItem('shouma_bank_civil_id');
    }
  };

  // Sync state to localStorage on modify
  useEffect(() => {
    localStorage.setItem('shouma_guide_available', JSON.stringify(isAvailable));
  }, [isAvailable]);

  // Load state changes from server (PostgreSQL) and poll every 8 seconds for real updates
  useEffect(() => {
    const fetchFreshData = () => {
      // Fetch fresh trips
      fetch('/api/trips')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTrips(data);
            localStorage.setItem('shouma_trips', JSON.stringify(data));
          }
        })
        .catch(err => console.error("Error polling trips from server", err));

      // Fetch fresh tickets
      fetch('/api/tickets')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSupportTickets(data);
            localStorage.setItem('shouma_support_tickets', JSON.stringify(data));
          }
        })
        .catch(err => console.error("Error polling tickets from server", err));
    };

    // Initial fetch
    fetchFreshData();

    // Setup interval
    const interval = setInterval(fetchFreshData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Accept a Trip offer
  const handleAcceptTrip = (id: string) => {
    fetch(`/api/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" })
    })
      .then(res => res.json())
      .then(updatedTrip => {
        const updated = trips.map(t => t.id === id ? updatedTrip : t);
        setTrips(updated);
        localStorage.setItem('shouma_trips', JSON.stringify(updated));
      })
      .catch(err => {
        console.error("Failed to accept trip on server:", err);
        const updated = trips.map(t => t.id === id ? { ...t, status: 'accepted' as const } : t);
        setTrips(updated);
        localStorage.setItem('shouma_trips', JSON.stringify(updated));
      });
  };

  // Decline a Trip offer
  const handleDeclineTrip = (id: string) => {
    fetch(`/api/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "declined" })
    })
      .then(res => res.json())
      .then(updatedTrip => {
        const updated = trips.map(t => t.id === id ? updatedTrip : t);
        setTrips(updated);
        localStorage.setItem('shouma_trips', JSON.stringify(updated));
      })
      .catch(err => {
        console.error("Failed to decline trip on server:", err);
        const updated = trips.map(t => t.id === id ? { ...t, status: 'declined' as const } : t);
        setTrips(updated);
        localStorage.setItem('shouma_trips', JSON.stringify(updated));
      });
  };

  // Submit support ticket
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const ticketBody = {
      guideName: programmerName,
      email: 'hamadalhabsi208@gmail.com',
      subject: ticketSubject,
      message: ticketMessage
    };

    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketBody)
    })
      .then(res => res.json())
      .then(newTicket => {
        const updated = [newTicket, ...supportTickets];
        setSupportTickets(updated);
        localStorage.setItem('shouma_support_tickets', JSON.stringify(updated));
        setTicketSubject('');
        setTicketMessage('');
        setTicketSuccess(true);
        setTimeout(() => setTicketSuccess(false), 3000);
      })
      .catch(err => {
        console.error("Failed to submit ticket to server:", err);
        const localTicket = {
          ...ticketBody,
          id: 'ticket-' + Date.now(),
          status: 'open' as const,
          createdAt: new Date().toISOString()
        };
        const updated = [localTicket, ...supportTickets];
        setSupportTickets(updated);
        localStorage.setItem('shouma_support_tickets', JSON.stringify(updated));
        setTicketSubject('');
        setTicketMessage('');
        setTicketSuccess(true);
        setTimeout(() => setTicketSuccess(false), 3000);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans dir-rtl">
      {/* GLOW BAR AT TOP */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 w-full" />

      {/* NAVIGATION HEADER */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo & Welcome Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-slate-950 text-xl font-mono shadow-md shadow-amber-500/10">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-white tracking-wide">مرشدي شومة</h1>
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full text-amber-400 font-bold">لوحة المرشد</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">مرحباً بك، <span className="text-slate-200 font-bold">{programmerName}</span></p>
            </div>
          </div>

          {/* Tab buttons */}
          <nav className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-2xl">
            <button
              id="tab-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>
            <button
              id="tab-trips"
              onClick={() => setActiveTab('trips')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'trips'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>طلبات</span>
              {trips.filter(t => t.status === 'assigned').length > 0 && (
                <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
            <button
              id="tab-account"
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>الحساب</span>
            </button>
            <button
              id="tab-support"
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>فريق الدعم</span>
            </button>
          </nav>

          {/* Logout button */}
          <button
            id="btn-logout"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT BODY */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: الرئيسية */}
          {activeTab === 'home' && (
            <motion.div
              key="tab-home-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* STATUS CARD (متوفر الان او لا) */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">إمكانية التواجد للرحلات</h2>
                    <p className="text-slate-400 text-sm max-w-md">
                      قم بتفعيل زر التواجد لتبدأ شومة بتمرير طلبات السياح وإليك وجدولات الرحلات الفعالة فوراً.
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 min-w-[240px]">
                    <span className="text-xs text-slate-400 font-bold">حالة التواجد الحالية:</span>
                    
                    {/* Available toggle switch component */}
                    <div className="flex items-center gap-4">
                      <span className={`text-md font-bold transition-all ${
                        !isAvailable ? 'text-red-400 scale-105 font-black' : 'text-slate-500 text-sm'
                      }`}>غير متاح</span>
                      
                      <button
                        id="btn-toggle-availability"
                        type="button"
                        onClick={() => setIsAvailable(!isAvailable)}
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative cursor-pointer ${
                          isAvailable ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <motion.div 
                          className="w-6 h-6 bg-white rounded-full shadow-md"
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          style={{
                            float: isAvailable ? 'left' : 'right'
                          }}
                        />
                      </button>

                      <span className={`text-md font-bold transition-all ${
                        isAvailable ? 'text-emerald-400 scale-105 font-black' : 'text-slate-500 text-sm'
                      }`}>متوفر الآن</span>
                    </div>

                    <div className="mt-3 text-[11px] text-center font-bold">
                      {isAvailable ? (
                        <span className="text-emerald-400/85">🟢 جاهز لاستقبال اتصالات مبيعات شومة والرحلات المباشرة</span>
                      ) : (
                        <span className="text-red-400/85">🔴 لن تظهر في قائمة التخصيص السريع للسياح حالياً</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STATS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold">الرحلات النشطة اليوم</span>
                  <div className="text-2xl font-black text-amber-500 mt-1">1 رحلة</div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">تبقى عليها 4 ساعات</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold">الطلبات قيد الانتظار</span>
                  <div className="text-2xl font-black text-white mt-1">
                    {trips.filter(t => t.status === 'assigned').length} طلبات
                  </div>
                  <span className="text-[10px] text-amber-500 font-medium mt-1 block">تحتاج إلى موافقة أو رفض</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold">إجمالي الأرباح المستلمة</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">١٢٥ ر.ع</div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">تخصم الأتعاب نهاية كل أسبوع</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-bold">تقييم المغامرين لك</span>
                  <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
                    <span>4.9</span>
                    <span className="text-sm">★ ★ ★ ★ ★</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">من أصل ٢٢ سائح دولي</span>
                </div>
              </div>

              {/* WELCOME INSTRUCTIONS */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>تلميحات وإرشادات مهمة للمرشدين السیاحيين:</span>
                </h3>
                <ul className="space-y-3.5 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">١.</span>
                    <span>احرص على رفع جاهزيتك وتواجدك عند الساعة الثامنة صباحاً للرحلات الصباحية المفاجئة في مسقط والداخلية.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">٢.</span>
                    <span>عند قبول طلب الرحلة المخصصة، سيتواصل معك المنسق الإداري لإرسال اللوازم الغذائية وعدة الإسعافات وتصاريح دخول المناطق.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">٣.</span>
                    <span>تأكد من متابعة تحديثات لوحة التحكم وتحديث حالة طلبات الرحلات في علامة تبويب "طلبات" بالسرعة الممكنة لتجنب الإلغاء.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* TAB 2: طلبات */}
          {activeTab === 'trips' && (
            <motion.div
              key="tab-trips-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">طلبات الرحلات المعروضة</h2>
                  <p className="text-slate-400 text-xs mt-1">مرحباً يا {programmerName}. راجع جولات السياح المخصصة لك واقبل ما يناسب وقتك.</p>
                </div>
              </div>

              {trips.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                  <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">لا يوجد جولات مخصصة لك حالياً.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trips.map((trip) => (
                    <div 
                      key={trip.id}
                      className={`border rounded-2xl p-5 bg-slate-900/90 relative ${
                        trip.status === 'assigned' 
                          ? 'border-amber-500/50 shadow-lg shadow-amber-500/[0.02]' 
                          : trip.status === 'accepted' 
                          ? 'border-emerald-500/30' 
                          : 'border-slate-800 opacity-75'
                      }`}
                    >
                      {/* Trip Banner Header */}
                      <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-xs text-slate-400 font-bold">السائح المستضيف:</span>
                          <h4 className="text-md font-bold text-white mt-1">{trip.touristName}</h4>
                        </div>
                        <div>
                          {trip.status === 'assigned' && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-full font-bold">مطلوب الرد</span>
                          )}
                          {trip.status === 'accepted' && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full font-bold">مقبولة</span>
                          )}
                          {trip.status === 'declined' && (
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-1 rounded-full font-bold">مرفوضة</span>
                          )}
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="space-y-2.5 text-xs text-slate-300 md:text-sm mb-5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                          <span><strong>الوجهة والمسار:</strong> {trip.destination}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                          <span><strong>تاريخ الانطلاق:</strong> {trip.date} ({trip.duration})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-md ml-0.5 mt-0.5 text-amber-500 font-bold shrink-0">💰</span>
                          <span><strong>الأتعاب المقترحة لك:</strong> <strong className="text-emerald-400">{trip.price}</strong> (سعر مقطوع شاملاً الوقود والطعام)</span>
                        </div>
                        {trip.notes && (
                          <div className="bg-slate-950/60 p-2.5 rounded-lg text-slate-400 leading-relaxed border border-slate-800 text-[11px] mt-2">
                            <strong>ملاحظات العميل:</strong> {trip.notes}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {trip.status === 'assigned' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          <button
                            id={`btn-accept-trip-${trip.id}`}
                            onClick={() => handleAcceptTrip(trip.id)}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>قبول الجولة وتأكيد الحضور</span>
                          </button>
                          <button
                            id={`btn-decline-trip-${trip.id}`}
                            onClick={() => handleDeclineTrip(trip.id)}
                            className="py-2 px-3 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>اعتذار</span>
                          </button>
                        </div>
                      )}

                      {trip.status === 'accepted' && (
                        <div className="p-3 bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>لقد قبلت هذه الجولة بنجاح! سيتم إخطار السائح، ورقم هاتفه للتنسيق هو +968 9331 4321</span>
                        </div>
                      )}

                      {trip.status === 'declined' && (
                        <div className="p-3 bg-red-500/5 text-red-400 border border-red-500/20 rounded-xl text-xs flex items-center gap-1.5">
                          <X className="w-4 h-4" />
                          <span>لقد اعتذرت عن هذه الجولة. سيتم إعادة تعيين مرشد آخر من مرشدي شومة.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: الحساب */}
          {activeTab === 'account' && (
            <motion.div
              key="tab-account-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8"
            >
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-1 mb-4 shadow-xl">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-amber-400 text-3xl font-mono">
                    {programmerName[0]}
                  </div>
                </div>
                
                <h3 className="text-xl font-extrabold text-white flex items-center gap-1.5">
                  <span>{programmerName}</span>
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                </h3>
                <p className="text-slate-400 text-xs mt-1">المرشد الفضي المعتمد لدى شومة • رقم العضوية SH-905</p>
              </div>

              {/* Profile Bio Details */}
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-800/50">
                  <div>
                    <span className="text-xs text-slate-500 block">البريد الإلكتروني</span>
                    <strong className="text-slate-200 mt-1 block">hamadalhabsi208@gmail.com</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">رقم الهاتف الفعال</span>
                    <strong className="text-slate-200 mt-1 block">+968 9522 3344</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-800/50">
                  <div>
                    <span className="text-xs text-slate-500 block">اللغات المعمدة بالملف</span>
                    <strong className="text-slate-200 mt-1 block">العربية، الإنجليزية</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">تاريخ التسجيل بالمنصة</span>
                    <strong className="text-slate-200 mt-1 block">20 مايو 2026</strong>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block mb-1">النبذة التعريفية المسجلة</span>
                  <p className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed text-xs">
                    مرشد سياحي مرخص من وزارة التراث والسياحة بسلطنة عمان. خبير بالأنشطة الجبلية المتقدمة مثل هايكنج جبل شمس، واستكشاف وديان الرستاق وجنوب الشرقية. أتمتع بلياقة فائقة وحسن التعامل مع الزوار الأجانب.
                  </p>
                </div>

                {/* Verification badge */}
                <div className="bg-amber-500/5 border border-amber-500/20 px-4 py-3 rounded-xl flex items-center gap-2 text-xs text-amber-300 leading-relaxed font-semibold">
                  <span>🎖️</span>
                  <span>شارة المرشد الفعال: تمنح شقة من فئة 4 نجوم للمغامرين وخصومات على قطع التخييم من شركاء صيانة شومة.</span>
                </div>

                {/* Bank Muscat Integration Section */}
                <div className="mt-6 pt-6 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-red-500" />
                      <span>ربط حساب بنك مسقط (Bank Muscat)</span>
                    </h4>
                    {isBankLinked && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        نشط ويستقبل الدفعات
                      </span>
                    )}
                  </div>

                  {isBankLinked ? (
                    /* Linked Card Mode */
                    <div className="space-y-4">
                      <div className="relative overflow-hidden bg-gradient-to-br from-[#800A25] via-[#a81434] to-[#4c0514] border border-[#a81434]/40 rounded-2xl p-5 text-white shadow-xl">
                        {/* Background subtle geometric glow */}
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute left-6 top-6 opacity-10">
                          <Landmark className="w-24 h-24" />
                        </div>

                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] text-red-200/80 tracking-widest uppercase font-mono">Bataqah Al-Shamilah</span>
                            <h5 className="text-sm font-bold text-amber-300/90 mt-0.5">بنك مسقط • Bank Muscat</h5>
                          </div>
                          <span className="text-xs bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md font-bold text-[10px] leading-relaxed select-none">
                            SHOUMA VIP
                          </span>
                        </div>

                        {/* Card Number / Account Mask */}
                        <div className="mb-6 font-mono tracking-widest text-lg font-bold text-red-50 flex items-center gap-2">
                          <span>0423</span>
                          <span>••••</span>
                          <span>••••</span>
                          <span>{bankAccountNumber.slice(-4) || '9081'}</span>
                        </div>

                        {/* Card Footer Detail */}
                        <div className="flex justify-between items-end text-xs">
                          <div>
                            <span className="text-[9px] text-red-200/60 block mb-0.5">اسم المستفيد</span>
                            <span className="font-bold tracking-wide">{bankAccountName || programmerName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-red-200/60 block mb-0.5">رقم البطاقة الشخصية</span>
                            <span className="font-mono">{bankCivilID || '98765432'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info & Unlink Action */}
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span className="text-[11px] text-slate-400 text-center sm:text-right leading-relaxed">
                          مستحقات جولاتك السياحية وتبرعات العملاء يتم تحويلها تلقائياً بالريال العماني (OMR) إلى هذا الحساب خلال ٢٤ ساعة.
                        </span>
                        <button
                          type="button"
                          onClick={handleUnlinkBank}
                          className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/40 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                        >
                          إلغاء ربط الحساب
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Unlinked Card Mode - Linked Form Switch */
                    <div>
                      {!isLinkingFormOpen ? (
                        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 text-center">
                          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-red-400 border border-red-500/20/20">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto mb-4">
                            لم تقم بربط حسابك البنكي ببنك مسقط حتى الآن. يرجى ربط حسابك البنكي لكي تتمكن منصة شومة من إيداع أرباح جولاتك مباشرة وبشكل آمن وتلقائي.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsLinkingFormOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#800A25] to-[#a81434] hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                          >
                            <Landmark className="w-4 h-4" />
                            <span>ربط حساب بنك مسقط الآن</span>
                          </button>
                        </div>
                      ) : (
                        /* Linking Interactive Form */
                        <form onSubmit={handleLinkBank} className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                          <h5 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                            <span className="text-[#a81434] text-lg font-serif">●</span>
                            تسجيل بيانات حساب بنك مسقط وتأكيد الربط
                          </h5>

                          {bankLinkError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{bankLinkError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">اسم صاحب الحساب الثلاثي والمستفيد</label>
                              <input
                                type="text"
                                required
                                value={bankAccountName}
                                onChange={(e) => setBankAccountName(e.target.value)}
                                placeholder="مثال: حمد بن سالم بن محمد الحبسي"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500/50 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">رقم الحساب أو الآيبان (IBAN)</label>
                              <input
                                type="text"
                                required
                                value={bankAccountNumber}
                                onChange={(e) => setBankAccountNumber(e.target.value)}
                                placeholder="مثال: OM73MSCT0010042301129081"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500/50 text-xs text-left font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">رقم البطاقة الشخصية للمطابقة الأمنية</label>
                            <input
                              type="text"
                              required
                              value={bankCivilID}
                              onChange={(e) => setBankCivilID(e.target.value)}
                              placeholder="مثال: 07432198"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500/50 text-xs font-mono"
                            />
                          </div>

                          <div className="text-[10px] text-slate-500 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50 leading-relaxed font-sans">
                            📝 <strong>إقرار أمني:</strong> أقر بأن كافة البيانات المدخلة صحيحة وتخصني شخصياً كمرشد معتمد في شومة، وأتحمل المسؤولية القانونية عن أي خطأ بالتحويل البنكي ناتج عن خطأ في المدخلات.
                          </div>

                          <div className="flex justify-end gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsLinkingFormOpen(false);
                                setBankLinkError('');
                              }}
                              className="px-3.5 py-2 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              إلغاء
                            </button>

                            <button
                              type="submit"
                              disabled={isLinkingLoading}
                              className="px-5 py-2 bg-gradient-to-r from-[#800A25] to-[#a81434] text-white rounded-xl text-xs font-bold transition-all hover:brightness-110 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                            >
                              {isLinkingLoading ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>جاري التحقق والربط...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>ربط وتأكيد الحساب البنكي</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: فريق الدعم */}
          {activeTab === 'support' && (
            <motion.div
              key="tab-support-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* SUBMIT SUPPORT FORM */}
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-fit">
                <h3 className="text-lg font-bold text-white mb-1">تواصل مع إدارة شومة</h3>
                <p className="text-slate-400 text-xs mb-6">لديك تساؤل، مشكلة بالرحلة أو تحتاج أدوات؟ أرسل لفريق الدعم وسنرد عليك فوراً.</p>

                {ticketSuccess && (
                  <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 rounded-xl text-center text-xs font-semibold">
                    تم إرسال بطاقة الدعم بنجاح! سيتم إخطار المشرفين.
                  </div>
                )}

                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">عنوان المشكلة / الموضوع</label>
                    <input
                      id="ticket-subject"
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="مثال: مشكلة في مستحقات رحلة وادي شب"
                      className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">اشرح التفاصيل</label>
                    <textarea
                      id="ticket-message"
                      required
                      rows={5}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="اكتب هنا تفاصيل المشكلة وما تتوقع من فريق الدعم مساعدتك فيه..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 text-xs"
                    />
                  </div>

                  <button
                    id="btn-submit-ticket"
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 transform rotate-180" />
                    <span>إرسال الطلب لفريق الدعم</span>
                  </button>
                </form>
              </div>

              {/* LIST OF PAST TICKETS */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-white">تذاكر الدعم السابقة والردود الإدارية</h3>
                
                {supportTickets.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
                    <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs">لا توجد طلبات دعم فني سابقة.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportTickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                      >
                        <div className="flex items-start justify-between mb-3.5 border-b border-slate-800/60 pb-2">
                          <div>
                            <span className="text-[10px] text-slate-500 font-mono block">التاريخ: {new Date(ticket.createdAt).toLocaleDateString('ar-OM')}</span>
                            <h4 className="text-sm font-bold text-white mt-1">{ticket.subject}</h4>
                          </div>
                          <div>
                            {ticket.status === 'open' ? (
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">قيد المراجعة</span>
                            ) : (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">تم الإجابة</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-950/30 p-3 rounded-xl leading-relaxed mb-3 font-medium">
                          {ticket.message}
                        </p>

                        {ticket.reply ? (
                          <div className="mt-3.5 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-xs">
                            <div className="flex items-center gap-1 text-amber-400 font-bold mb-1.5">
                              <span>💬</span>
                              <span>الرد الإداري من إدارة شومة:</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed leading-normal">{ticket.reply}</p>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 font-medium">⏳ جاري فحص المشكلة وتوجيه مندوب الدعم المناسب لتسليمك الرد...</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-600">
        <p>© 2026 شومة للسياحة والرحلات والاستكشاف • كافة الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
