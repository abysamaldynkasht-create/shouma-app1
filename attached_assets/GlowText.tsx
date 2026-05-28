import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, Settings, MapPin, ClipboardList, Send, Check, X, 
  MapPinOff, Landmark, Compass, HelpCircle, Phone, Clock, Plus, Trash2
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

  // Admin section: 'applications' | 'office' | 'trips' | 'support'
  const [adminSection, setAdminSection] = useState<'applications' | 'office' | 'trips' | 'support'>('applications');

  // Local lists synced with localStorage
  const [applications, setApplications] = useState<GuideApplication[]>([]);
  const [office, setOffice] = useState<OfficeConfig>(DEFAULT_OFFICE);
  const [trips, setTrips] = useState<TripBooking[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

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
  }, []);

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

          <nav className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-2xl">
            <button
              id="sect-apps"
              onClick={() => setAdminSection('applications')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                adminSection === 'applications' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>طلبات التقديم ({applications.length})</span>
            </button>
            <button
              id="sect-office"
              onClick={() => setAdminSection('office')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                adminSection === 'office' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>موقع المكتب</span>
            </button>
            <button
              id="sect-trips"
              onClick={() => setAdminSection('trips')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                adminSection === 'trips' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>تخصيص الرحلات</span>
            </button>
            <button
              id="sect-support"
              onClick={() => setAdminSection('support')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                adminSection === 'support' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>الدعم الفني ({supportTickets.filter(t=>t.status==='open').length})</span>
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
                            'bg-red-500/10 text-red-400 border border-red-500/30'
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
                        <span className="text-slate-500 text-[10px] block">رقم الهاتف</span>
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

        {/* SECTION 2: OFFICE CONFIGURATION */}
        {adminSection === 'office' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white pb-3 border-b border-slate-800">إعداد موقع مكتب شومة</h2>
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-250 text-xs"
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
                      <div className="space-y-1">
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
                        <p className="text-slate-400 text-[10px] font-mono">الأجر المقدر: {trip.price}</p>
                      </div>

                      <button
                        id={`btn-delete-trip-${trip.id}`}
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-red-500 rounded-xl transition-all cursor-pointer"
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

                    <p className="text-xs text-slate-300 font-medium leading-relaxed leading-normal bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 mb-4">
                      {ticket.message}
                    </p>

                    {/* Reply input/or display */}
                    <div className="space-y-2">
                      {ticket.reply ? (
                        <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 text-xs">
                          <p className="text-amber-400 font-bold mb-1 block text-[10px]">الرد الحالي الخاص بك:</p>
                          <p className="text-slate-300">{ticket.reply}</p>
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
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
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

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-600">
        <p>© 2026 شومة للسياحة والرحلات والاستكشاف • لوحة حماية الإدارة الكاملة</p>
      </footer>
    </div>
  );
}
