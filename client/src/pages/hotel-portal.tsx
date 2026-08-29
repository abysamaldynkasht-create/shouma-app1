import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Calendar, 
  LogOut, 
  Search,
  User,
  Star,
  DollarSign,
  Plus,
  Trash2,
  Bed,
  Sparkles,
  TrendingUp,
  Percent,
  Check,
  Shield,
  ShieldAlert,
  Users,
  MessageSquare,
  Key,
  CalendarCheck
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface HotelBooking {
  id: number;
  hotel_id?: number;
  hotelId?: number;
  hotel_name?: string;
  hotelName?: string;
  room_name?: string;
  roomName?: string;
  full_name: string;
  fullName?: string;
  phone: string;
  email: string;
  nights: number;
  price_per_night?: number;
  pricePerNight?: number;
  total_price: string | number;
  totalPrice?: string | number;
  commission_amount?: string | number;
  commissionAmount?: string | number;
  payment_gateway?: string;
  paymentGateway?: string;
  created_at?: string;
  createdAt?: string;
}

export default function HotelPortalPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Authentication State
  const [hotel, setHotel] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string>("manager");
  const [staffInfo, setStaffInfo] = useState<any | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Data States
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Rooms Management
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [newRoom, setNewRoom] = useState({
    nameAr: "",
    priceBase: "",
    maxGuests: "2",
    availableRooms: "10",
    description: "",
    image: "https://images.unsplash.com/photo-1611891405914-ee72af1717a3?auto=format&fit=crop&w=600&q=80",
    roomSize: "45",
    bedType: "سرير كينج مزدوج كبير جداً",
    viewType: "إطلالة بانورامية كاملة على الجبال الخضراء",
    amenitiesInput: "واي فاي مجاني فائق السرعة, تكييف هواء مركزي, شاشة ذكية 4K, ميني بار مجاني, آلة صنع القهوة, شرفة خاصة"
  });
  const [isAddingRoom, setIsAddingRoom] = useState(false);

  // Financials & Payouts Management
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [isCalculatingPayout, setIsCalculatingPayout] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Team Management (Manager Only)
  const [team, setTeam] = useState<any[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [newMember, setNewMember] = useState({
    username: "",
    password: "",
    role: "receptionist",
    name: ""
  });
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Manager Security Settings
  const [secEmail, setSecEmail] = useState("");
  const [secPassword, setSecPassword] = useState("");
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Booking Local Statuses (Accepted / Rejected / Pending)
  const [bookingStatuses, setBookingStatuses] = useState<Record<number, 'approved' | 'rejected' | 'pending'>>({});

  // New Hotel Registration Request States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    nameAr: "",
    nameEn: "",
    city: "صلالة",
    region: "محافظة ظفار",
    description: "",
    pricePerNight: "45",
    stars: "4",
    phone: "",
    email: "",
    password: "",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.nameAr || !registerForm.email || !registerForm.password) {
      toast({ description: "يرجى تعبئة الحقول الأساسية المطلوبة لتسجيل الفندق." });
      return;
    }
    setIsRegistering(true);
    try {
      const res = await fetch("/api/hotels/register-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "📨 تم تقديم الطلب بنجاح",
          description: data.message || "طلبك الآن قيد المراجعة المالية والاعتماد النهائي."
        });
        setIsRegisterOpen(false);
        setRegisterForm({
          nameAr: "",
          nameEn: "",
          city: "صلالة",
          region: "محافظة ظفار",
          description: "",
          pricePerNight: "45",
          stars: "4",
          phone: "",
          email: "",
          password: "",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
        });
      } else {
        toast({ description: data.message || "حدث خطأ أثناء تقديم طلب التسجيل.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ description: "عذراً، حدث خطأ في الشبكة.", variant: "destructive" });
    } finally {
      setIsRegistering(false);
    }
  };

  // Restore session
  useEffect(() => {
    const storedHotel = localStorage.getItem("shouma_logged_hotel");
    const storedRole = localStorage.getItem("shouma_logged_role");
    const storedStaff = localStorage.getItem("shouma_logged_staff");

    if (storedHotel) {
      try {
        setHotel(JSON.parse(storedHotel));
        setUserRole(storedRole || "manager");
        if (storedStaff) setStaffInfo(JSON.parse(storedStaff));
      } catch (e) {
        handleLogout();
      }
    }

    // Restore booking statuses
    const storedStatuses = localStorage.getItem("shouma_booking_statuses");
    if (storedStatuses) {
      try {
        setBookingStatuses(JSON.parse(storedStatuses));
      } catch (e) {}
    }
  }, []);

  // Fetch data on login / change
  useEffect(() => {
    if (hotel) {
      fetchBookings();
      fetchRooms();
      fetchReviews();

      if (userRole === "manager" || userRole === "accountant") {
        fetchPayouts();
      }

      if (userRole === "manager") {
        fetchTeam();
        setSecEmail(hotel.email || "");
        setSecPassword(hotel.password || "");
      }

      // Default active tab based on role restrictions
      if (userRole === "accountant") {
        setActiveTab("financials");
      } else {
        setActiveTab("dashboard");
      }
    }
  }, [hotel, userRole]);

  // Data fetching helpers (passing x-user-role)
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "x-user-role": userRole
    };
  };

  const fetchBookings = async () => {
    if (!hotel) return;
    setIsLoadingBookings(true);
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/bookings`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchRooms = async () => {
    if (!hotel) return;
    setIsLoadingRooms(true);
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/pms-rooms`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchPayouts = async () => {
    if (!hotel) return;
    setIsLoadingPayouts(true);
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/payouts`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPayouts(data);
      }
    } catch (err) {
      console.error("Error fetching payouts:", err);
    } finally {
      setIsLoadingPayouts(false);
    }
  };

  const fetchReviews = async () => {
    if (!hotel) return;
    setIsLoadingReviews(true);
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/reviews`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchTeam = async () => {
    if (!hotel) return;
    setIsLoadingTeam(true);
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/staff`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (err) {
      console.error("Error fetching team:", err);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoggingIn(true);

    try {
      let res = await fetch("/api/hotels/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setHotel(data.hotel);
        setUserRole(data.role);
        setStaffInfo(data.staff);

        localStorage.setItem("shouma_logged_hotel", JSON.stringify(data.hotel));
        localStorage.setItem("shouma_logged_role", data.role);
        localStorage.setItem("shouma_logged_staff", JSON.stringify(data.staff));

        toast({
          title: "🔑 تم الولوج بنجاح",
          description: `مرحباً بك ${data.staff.name} برتبة (${translateRole(data.role)})`,
        });
      } else {
        // Fallback check against portal accounts
        const portalRes = await fetch("/api/portal-auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portalType: "hotels", email, password })
        });
        if (portalRes.ok) {
          const pData = await portalRes.json();
          if (pData.success) {
            const mockHotel = { id: 1, nameAr: "بوابة الفنادق والمنتجعات - شومة", email: pData.account.email };
            const mockStaff = { name: pData.account.name || "مدير اللوحة", email: pData.account.email, role: "manager" };
            setHotel(mockHotel);
            setUserRole("manager");
            setStaffInfo(mockStaff);

            localStorage.setItem("shouma_logged_hotel", JSON.stringify(mockHotel));
            localStorage.setItem("shouma_logged_role", "manager");
            localStorage.setItem("shouma_logged_staff", JSON.stringify(mockStaff));

            toast({
              title: "🔑 تم الولوج بنجاح",
              description: `مرحباً بك ${mockStaff.name} كمدير لوحة الفنادق والمنتجعات`,
            });
            return;
          }
        }
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("حدث خطأ في الاتصال بالشبكة.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    try {
      const storedStaff = localStorage.getItem("shouma_logged_staff");
      let staffObj = null;
      if (storedStaff) {
        try { staffObj = JSON.parse(storedStaff); } catch (e) {}
      }
      fetch('/api/portal-auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staffObj?.email || "hotels@shouma.com",
          name: staffObj?.name || "مدير الفندق",
          portalType: "hotels",
          portalName: "لوحة الفنادق والمنتجعات"
        })
      }).catch(err => console.error("Logout audit log error", err));
    } catch (err) {}

    localStorage.removeItem("shouma_logged_hotel");
    localStorage.removeItem("shouma_logged_role");
    localStorage.removeItem("shouma_logged_staff");
    setHotel(null);
    setUserRole("manager");
    setStaffInfo(null);
    setBookings([]);
    setRooms([]);
    setPayouts([]);
    setReviews([]);
    setTeam([]);
    toast({
      description: "تم تسجيل خروج الحساب الفندقي بنجاح."
    });
  };

  // Room Operations
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.nameAr || !newRoom.priceBase) {
      toast({ description: "يرجى تعبئة اسم الغرفة والسعر الأساسي لتقديم الطلب." });
      return;
    }

    setIsAddingRoom(true);
    try {
      const amenities = newRoom.amenitiesInput.split(",").map(a => a.trim()).filter(Boolean);
      
      const fullDescription = `المساحة: ${newRoom.roomSize || "45"} م² | نوع السرير: ${newRoom.bedType} | الإطلالة: ${newRoom.viewType}\n\n${newRoom.description}`;

      const res = await fetch(`/api/hotels/${hotel.id}/pms-rooms`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nameAr: newRoom.nameAr,
          priceBase: parseFloat(newRoom.priceBase),
          maxGuests: parseInt(newRoom.maxGuests, 10),
          description: fullDescription,
          amenities,
          image: newRoom.image,
          availableRooms: parseInt(newRoom.availableRooms, 10) || 10
        })
      });

      if (res.ok) {
        toast({
          title: "📨 تم إرسال الغرفة بنجاح",
          description: "تم إرسال الغرفة ومواصفاتها الكاملة للمسؤول الرئيسي بنجاح وسيتم إدراج السعر النهائي فور اعتماد العمولة."
        });
        setNewRoom({
          nameAr: "",
          priceBase: "",
          maxGuests: "2",
          availableRooms: "10",
          description: "",
          image: "https://images.unsplash.com/photo-1611891405914-ee72af1717a3?auto=format&fit=crop&w=600&q=80",
          roomSize: "45",
          bedType: "سرير كينج مزدوج كبير جداً",
          viewType: "إطلالة بانورامية كاملة على الجبال الخضراء",
          amenitiesInput: "واي فاي مجاني فائق السرعة, تكييف هواء مركزي, شاشة ذكية 4K, ميني بار مجاني, آلة صنع القهوة, شرفة خاصة"
        });
        fetchRooms();
      } else {
        const err = await res.json();
        toast({ description: err.message || "فشل في إرسال الغرفة", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الغرفة من النظام؟")) return;
    try {
      const res = await fetch(`/api/pms-rooms/${roomId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        toast({ description: "تم حذف الغرفة بنجاح من سجلات الفندق." });
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRoomAvailability = async (roomId: number, currentStatus: string) => {
    // Allows toggling local status/visibility or availability
    const nextStatus = currentStatus === "approved" ? "pending" : "approved";
    try {
      const res = await fetch(`/api/pms-rooms/${roomId}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        toast({ description: "تم تعديل حالة توفر وتنشيط الغرفة في التطبيق." });
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Booking Status Operations (Local persistence inside session context)
  const handleUpdateBookingStatus = (bookingId: number, status: 'approved' | 'rejected') => {
    const next = { ...bookingStatuses, [bookingId]: status };
    setBookingStatuses(next);
    localStorage.setItem("shouma_booking_statuses", JSON.stringify(next));
    toast({
      description: `تم تحديث حالة الحجز #${bookingId} إلى: ${status === 'approved' ? 'مقبول ومؤكد للنزيل' : 'مرفوض وتم التراجع'}`
    });
  };

  // Payout Operations
  const handleCalculatePayout = async () => {
    setIsCalculatingPayout(true);
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/payouts/calculate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ month: selectedMonth })
      });
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "🎉 تم إصدار الكشف",
          description: data.message || "تم توليد الفاتورة الشهرية وتثبيت صافي مستحقاتكم بنجاح."
        });
        fetchPayouts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculatingPayout(false);
    }
  };

  // Team Operations
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.username || !newMember.password || !newMember.name) {
      toast({ description: "يرجى تعبئة كافة حقول الموظف الجديد." });
      return;
    }

    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/staff`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newMember)
      });
      if (res.ok) {
        toast({
          title: "👥 تم إدراج الموظف",
          description: "تم إنشاء وتنشيط حساب الموظف للعمل في لوحة تحكم الـ PMS."
        });
        setNewMember({ username: "", password: "", role: "receptionist", name: "" });
        fetchTeam();
      } else {
        const err = await res.json();
        toast({ description: err.message || "حدث خطأ أثناء إدراج الموظف", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteTeamMember = async (staffId: number) => {
    try {
      setTeam((prev: any[]) => prev.filter((m: any) => m.id !== staffId));
      const res = await fetch(`/api/hotels/${hotel.id}/staff/${staffId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        toast({ description: "تم إقصاء الموظف وحذف بيانات ولوجه للبرنامج بنجاح." });
      }
      fetchTeam();
    } catch (err) {
      console.warn("Delete staff member fallback:", err);
      toast({ description: "تم تحديث قائمة الموظفين بنجاح." });
      fetchTeam();
    }
  };

  // Update Main Manager Credentials
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCreds(true);
    try {
      const res = await fetch(`/api/hotels/${hotel.id}/credentials`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: secEmail, password: secPassword })
      });
      if (res.ok) {
        toast({
          title: "🔐 تم تأمين الحساب",
          description: "تم تحديث كلمة المرور والبريد الإلكتروني بنجاح."
        });
        // Update local state
        const updatedHotel = { ...hotel, email: secEmail, password: secPassword };
        setHotel(updatedHotel);
        localStorage.setItem("shouma_logged_hotel", JSON.stringify(updatedHotel));
      } else {
        const err = await res.json();
        toast({ description: err.message || "فشل تحديث بيانات الاعتماد", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  // Computed Values
  const splitShoumaPct = useMemo(() => {
    if (!hotel) return 15;
    return hotel.split_shouma_pct !== undefined 
      ? Number(hotel.split_shouma_pct) 
      : (hotel.splitShoumaPct !== undefined ? Number(hotel.splitShoumaPct) : 15);
  }, [hotel]);

  const totalSales = useMemo(() => {
    return bookings.reduce((sum, b) => {
      const val = b.total_price !== undefined ? b.total_price : b.totalPrice;
      return sum + (parseFloat(val as string) || 0);
    }, 0);
  }, [bookings]);

  const systemCommission = useMemo(() => {
    return bookings.reduce((sum, b) => {
      const val = b.total_price !== undefined ? b.total_price : b.totalPrice;
      const totalPrice = parseFloat(val as string) || 0;
      
      if (b.commission_amount !== undefined && b.commission_amount !== null) {
        const commAmt = parseFloat(String(b.commission_amount)) || 0;
        const nights = parseInt(String(b.nights || 1), 10) || 1;
        return sum + (commAmt * nights);
      }
      
      return sum + (totalPrice * (splitShoumaPct / 100));
    }, 0);
  }, [bookings, splitShoumaPct]);

  const netEarnings = totalSales - systemCommission;

  const chartData = useMemo(() => {
    if (bookings.length === 0) return [];
    const sorted = [...bookings].sort((a, b) => {
      const tA = new Date(a.created_at || a.createdAt || 0).getTime();
      const tB = new Date(b.created_at || b.createdAt || 0).getTime();
      return tA - tB;
    });

    let cumSales = 0;
    let cumShouma = 0;
    let cumHotel = 0;

    return sorted.map(b => {
      const val = b.total_price !== undefined ? b.total_price : b.totalPrice;
      const price = parseFloat(String(val || 0)) || 0;
      cumSales += price;

      let bookingComm = 0;
      if (b.commission_amount !== undefined && b.commission_amount !== null) {
        const commAmt = parseFloat(String(b.commission_amount)) || 0;
        const nights = parseInt(String(b.nights || 1), 10) || 1;
        bookingComm = commAmt * nights;
      } else {
        bookingComm = price * (splitShoumaPct / 100);
      }

      cumShouma += bookingComm;
      cumHotel += (price - bookingComm);

      const dateStr = b.created_at || b.createdAt
        ? new Date(b.created_at || b.createdAt || "").toLocaleDateString("ar-OM", { day: "numeric", month: "short" })
        : `حجز #${b.id}`;

      return {
        name: dateStr,
        "مبيعات الإشغال": Number(cumSales.toFixed(3)),
        "عمولة شومة": Number(cumShouma.toFixed(3)),
        "مستحقات الفندق": Number(cumHotel.toFixed(3))
      };
    });
  }, [bookings, splitShoumaPct]);

  const filteredBookings = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    const guestName = b.full_name || b.fullName || "";
    const guestPhone = b.phone || "";
    const roomName = b.room_name || b.roomName || "";
    return (
      guestName.toLowerCase().includes(q) ||
      guestPhone.toLowerCase().includes(q) ||
      roomName.toLowerCase().includes(q)
    );
  });

  const translateRole = (role: string) => {
    switch (role) {
      case "manager": return "المدير العام (General Manager)";
      case "receptionist": return "موظف الاستقبال (Receptionist)";
      case "accountant": return "المحاسب المالي (Accountant)";
      default: return role;
    }
  };

  // Render Login state
  if (!hotel) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none" />

        <header className="max-w-7xl w-full mx-auto flex justify-between items-center z-10 py-2">
          <Button 
            variant="ghost" 
            className="text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2"
            onClick={() => setLocation("/hotels")}
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لمنصة شومة</span>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-mono">
              PORTAL v2.4 (Oman PMS)
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-10 z-10">
          <Card className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-md shadow-2xl p-6 md:p-8 dir-rtl text-right">
            <div className="text-center space-y-3 mb-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Building2 className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-black text-white">بوابة الفنادق والقرى السياحية</h1>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                نظام شومتك الموحد لإدارة الفنادق (PMS). سجل الدخول كمدير عام، محاسب، أو موظف استقبال لمباشرة مهامك التعاقدية.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-xs font-bold text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="space-y-1.5 text-right">
                <Label htmlFor="email" className="text-xs font-bold text-slate-300">اسم المستخدم أو الإيميل:</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@hotel.com"
                    required
                    className="w-full border-slate-800 rounded-xl pl-3 pr-10 text-xs text-left bg-slate-950 text-white placeholder:text-slate-600 focus:ring-emerald-500"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <Label htmlFor="pass" className="text-xs font-bold text-slate-300">كلمة المرور السرية:</Label>
                <div className="relative">
                  <Input
                    id="pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border-slate-800 rounded-xl pl-3 pr-10 text-xs text-left bg-slate-950 text-white placeholder:text-slate-600 focus:ring-emerald-500"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs transition-all mt-2 cursor-pointer text-white"
              >
                {isLoggingIn ? "جاري التحقق من الهوية والصلاحيات..." : "تسجيل الدخول الآمن لنظام الـ PMS"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/60 text-center space-y-1.5">
              <span className="text-[10px] text-slate-500 block">
                🔑 يتم توليد حسابات الموظفين وصلاحياتهم الفردية مباشرة بواسطة المدير العام للفندق.
              </span>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition block mx-auto pt-3 cursor-pointer"
              >
                📝 تسجيل فندق جديد في منصة شومة للاستكشاف
              </button>
            </div>
          </Card>
        </main>

        {isRegisterOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto dir-rtl">
            <Card className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="absolute top-4 left-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
              
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-white">طلب تسجيل وإدراج فندق جديد</h2>
                <p className="text-xs text-slate-400">
                  يرجى ملء البيانات التالية لتقديم طلب التسجيل لشركة شومة السياحية.
                </p>
              </div>

              <form onSubmit={handleRegisterHotel} className="space-y-4 text-right">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">اسم الفندق (بالعربية):</Label>
                    <Input
                      type="text"
                      placeholder="مثال: منتجع شاطئ صلالة"
                      value={registerForm.nameAr}
                      onChange={e => setRegisterForm(prev => ({ ...prev, nameAr: e.target.value }))}
                      required
                      className="bg-slate-950 border-slate-850 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">اسم الفندق (بالإنجليزية):</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Salalah Beach Resort"
                      value={registerForm.nameEn}
                      onChange={e => setRegisterForm(prev => ({ ...prev, nameEn: e.target.value }))}
                      className="bg-slate-950 border-slate-850 text-xs text-white text-left font-sans"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">الولاية / المدينة:</Label>
                    <Input
                      type="text"
                      value={registerForm.city}
                      onChange={e => setRegisterForm(prev => ({ ...prev, city: e.target.value }))}
                      required
                      className="bg-slate-950 border-slate-850 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">المحافظة / المنطقة:</Label>
                    <Input
                      type="text"
                      value={registerForm.region}
                      onChange={e => setRegisterForm(prev => ({ ...prev, region: e.target.value }))}
                      required
                      className="bg-slate-950 border-slate-850 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-300">نبذة وتفاصيل عن الفندق:</Label>
                  <textarea
                    placeholder="اكتب وصفاً معبراً عن الفندق والخدمات التي يقدمها للضيوف..."
                    value={registerForm.description}
                    onChange={e => setRegisterForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-white h-20 text-right font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">سعر الليلة التقريبي:</Label>
                    <Input
                      type="number"
                      placeholder="ر.ع"
                      value={registerForm.pricePerNight}
                      onChange={e => setRegisterForm(prev => ({ ...prev, pricePerNight: e.target.value }))}
                      className="bg-slate-950 border-slate-850 text-xs text-white text-left font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">تصنيف النجوم:</Label>
                    <select
                      value={registerForm.stars}
                      onChange={e => setRegisterForm(prev => ({ ...prev, stars: e.target.value }))}
                      className="w-full h-9 bg-slate-950 border border-slate-850 text-xs rounded-lg text-slate-300 text-right px-2"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 نجوم)</option>
                      <option value="4">⭐⭐⭐⭐ (4 نجوم)</option>
                      <option value="3">⭐⭐⭐ (3 نجوم)</option>
                      <option value="2">⭐⭐ (نجمتين)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-300">هاتف التواصل المباشر:</Label>
                    <Input
                      type="tel"
                      placeholder="+968..."
                      value={registerForm.phone}
                      onChange={e => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-slate-950 border-slate-850 text-xs text-white text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-300">رابط صورة الفندق الرئيسية (اختياري):</Label>
                  <Input
                    type="text"
                    value={registerForm.image}
                    onChange={e => setRegisterForm(prev => ({ ...prev, image: e.target.value }))}
                    className="bg-slate-950 border-slate-850 text-xs text-white text-left font-mono text-[10px]"
                    dir="ltr"
                  />
                </div>

                <div className="border-t border-slate-800/60 pt-4 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400">🔑 بيانات ولوج مدير الفندق للنظام (PMS Credentials)</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-300">البريد الإلكتروني للولوج:</Label>
                      <Input
                        type="email"
                        placeholder="admin@hotel.com"
                        value={registerForm.email}
                        onChange={e => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="bg-slate-950 border-slate-850 text-xs text-white text-left font-mono"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-300">كلمة المرور السرية للولوج:</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={e => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="bg-slate-950 border-slate-850 text-xs text-white text-left font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isRegistering}
                    className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {isRegistering ? "جاري تقديم الطلب للخوادم..." : "إرسال طلب الانضمام والتسجيل"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsRegisterOpen(false)}
                    className="h-10 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs px-4 cursor-pointer"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <footer className="py-4 text-center z-10 text-[11px] text-slate-600 border-t border-slate-900">
          منصة شومة للاستكشاف والمدفوعات السياحية الموحدة بمحافظات سلطنة عُمان © 2026
        </footer>
      </div>
    );
  }

  // Render Logged in Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="z-10 bg-slate-900/80 border-b border-slate-800/60 sticky top-0 backdrop-blur-md px-4 md:px-8 py-3.5 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 dir-rtl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div className="text-right">
              <h1 className="text-base font-black text-white">{hotel.name_ar || hotel.nameAr || hotel.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-400 font-sans">
                  المستخدم الحالي: <strong className="text-white font-bold">{staffInfo?.name || "المدير"}</strong> • الرتبة: <span className="text-emerald-400 font-bold">{translateRole(userRole)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg font-mono">
              PMS Secure Session
            </span>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="px-3.5 h-9 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-500 text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6 z-10 dir-rtl text-right">
        {/* Navigation Tabs based on Role */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {userRole !== "accountant" && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "dashboard" ? "bg-emerald-600 text-slate-950 font-black" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                📊 لوحة القيادة العامة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bookings")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "bookings" ? "bg-emerald-600 text-slate-950 font-black" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                🔑 إدارة وتأكيد الحجوزات
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rooms")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "rooms" ? "bg-emerald-600 text-slate-950 font-black" : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                🛏️ إدارة الغرف الشاغرة
              </button>
            </>
          )}

          {(userRole === "manager" || userRole === "accountant") && (
            <button
              type="button"
              onClick={() => setActiveTab("financials")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "financials" ? "bg-emerald-600 text-slate-950 font-black" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              💰 كشوفات التسويات والأرباح
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "reviews" ? "bg-emerald-600 text-slate-950 font-black" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            ⭐ آراء وتقييمات العملاء
          </button>

          {userRole === "manager" && (
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "team" ? "bg-emerald-600 text-slate-950 font-black" : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              👥 الكادر البشري والإعدادات
            </button>
          )}
        </div>

        {/* ==================== 1. DASHBOARD TAB ==================== */}
        {activeTab === "dashboard" && userRole !== "accountant" && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-900/60 border-slate-800 rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">إجمالي الحجوزات المستلمة</span>
                    <h3 className="text-xl font-black text-white font-mono">{bookings.length} حجوزات</h3>
                  </div>
                  <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <CalendarCheck className="w-5 h-5" />
                  </span>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">عدد الغرف في السجل</span>
                    <h3 className="text-xl font-black text-white font-mono">{rooms.length} غرف مفعلة</h3>
                  </div>
                  <span className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Bed className="w-5 h-5" />
                  </span>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800 rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">متوسط التقييم العام</span>
                    <h3 className="text-xl font-black text-white font-mono">{hotel.rating || "4.8"} / 5</h3>
                  </div>
                  <span className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </span>
                </CardContent>
              </Card>

              {/* Hide financial stat card from receptionist */}
              {userRole === "manager" ? (
                <Card className="bg-slate-900/60 border-slate-800 rounded-2xl">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">صافي مستحقات الفندق (٨٥٪)</span>
                      <h3 className="text-xl font-black text-emerald-400 font-mono">{netEarnings.toFixed(3)} ر.ع</h3>
                    </div>
                    <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <DollarSign className="w-5 h-5" />
                    </span>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-900/40 border-slate-800 rounded-2xl border-dashed">
                  <CardContent className="p-5 flex items-center gap-3 text-slate-500">
                    <ShieldAlert className="w-5 h-5 text-amber-500/70" />
                    <span className="text-[10px] leading-relaxed">البيانات المالية محجوبة عن موظفي الاستقبال لدواعي الأمان.</span>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Manager Analytics Chart */}
            {userRole === "manager" && bookings.length > 0 && (
              <Card className="bg-slate-900 border-slate-850">
                <CardHeader>
                  <CardTitle className="text-sm font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> نمو العوائد وصافي أرباح الفندق
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-[10px]">
                    مخطط بياني يوضح نمو مبيعات الغرف التراكمي وصافي المستحقات المستلمة بعد اقتطاع العمولات
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "10px", color: "#fff", textAlign: "right" }} />
                      <Legend verticalAlign="top" height={32} iconType="circle" fontSize={11} />
                      <Area type="monotone" dataKey="مبيعات الإشغال" stroke="#d97706" fill="url(#gSales)" strokeWidth={2} />
                      <Area type="monotone" dataKey="مستحقات الفندق" stroke="#10b981" fill="url(#gNet)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Quick overview of latest bookings */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white">آخر الحجوزات الواردة للفندق</h3>
              {bookings.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">لم يستقبل فندقكم أي حجوزات بعد عبر المنصة.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {bookings.slice(0, 3).map((booking) => {
                    const priceVal = booking.total_price !== undefined ? booking.total_price : booking.totalPrice;
                    const bPrice = parseFloat(priceVal as string) || 0;
                    const status = bookingStatuses[booking.id] || 'pending';
                    return (
                      <div key={booking.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 font-sans relative overflow-hidden">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                          <span className="text-[10px] font-mono text-slate-400">حجز #{booking.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                            status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {status === 'approved' ? '✓ مقبول ومؤكد' : status === 'rejected' ? '✗ ملغى/مرفوض' : '⏱️ بانتظار التأكيد'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate">{booking.room_name || booking.roomName || "غرفة فندقية متميزة"}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">النزيل: {booking.full_name || booking.fullName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">الهاتف: {booking.phone}</p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-850">
                          <span>الإقامة: {booking.nights} ليالٍ</span>
                          <span className="text-xs font-black text-emerald-400">{bPrice.toFixed(3)} ر.ع</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 2. BOOKINGS TAB ==================== */}
        {activeTab === "bookings" && userRole !== "accountant" && (
          <div className="space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-500" /> إدارة وحالة كشوف الحجوزات الواردة
                </h2>
                <p className="text-xs text-slate-400 mt-1">تتبع كشوفات النزلاء وأرقام هواتفهم للتواصل وتأكيد أو رفض عملية الدخول.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم النزيل، رقم الهاتف، أو الغرفة..."
                  className="w-full bg-slate-900 border-slate-800 text-xs rounded-xl pr-9 pl-3 text-right text-white"
                />
                <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {isLoadingBookings ? (
              <p className="text-xs text-slate-400 text-center py-10">جاري تحميل سجلات المدفوعات والحجوزات...</p>
            ) : filteredBookings.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10 border border-slate-800 rounded-2xl bg-slate-900/30">لم يتم العثور على أي حجز مطابق لمعيار البحث.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((booking) => {
                  const priceVal = booking.total_price !== undefined ? booking.total_price : booking.totalPrice;
                  const bPrice = parseFloat(priceVal as string) || 0;
                  const status = bookingStatuses[booking.id] || 'pending';
                  return (
                    <Card key={booking.id} className="bg-slate-900/50 border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                      {/* Top indicator bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        status === 'approved' ? 'bg-emerald-500' :
                        status === 'rejected' ? 'bg-rose-500' :
                        'bg-amber-500'
                      }`} />

                      <CardHeader className="p-4 pb-2 text-right">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500 font-mono">حجز موحد #{booking.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                            status === 'rejected' ? 'bg-rose-500/15 text-rose-400' :
                            'bg-amber-500/15 text-amber-400 animate-pulse'
                          }`}>
                            {status === 'approved' ? 'مقبول ومؤكد للنزيل' : status === 'rejected' ? 'مرفوض' : 'انتظار المراجعة'}
                          </span>
                        </div>
                        <CardTitle className="text-xs font-bold text-white mt-2 leading-tight">
                          {booking.room_name || booking.roomName || "جناح ريفي متميز"}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-4 pt-2 space-y-4 flex-1 flex flex-col justify-between">
                        {/* Guest Details */}
                        <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-400">الاسم:</span>
                            <strong className="text-white font-bold">{booking.full_name || booking.fullName}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-400 font-sans">الهاتف:</span>
                            <strong className="text-white">{booking.phone}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-400 font-sans">الإيميل:</span>
                            <span className="text-slate-300 truncate" title={booking.email}>{booking.email}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                          <div className="p-2 bg-slate-950 rounded-lg">
                            <span>مدة الإقامة:</span>
                            <strong className="block text-white mt-0.5">{booking.nights} ليالٍ</strong>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-lg">
                            <span>القيمة الإجمالية:</span>
                            <strong className="block text-emerald-400 mt-0.5 font-mono">{bPrice.toFixed(3)} ر.ع</strong>
                          </div>
                        </div>

                        {/* Accept/Reject PMS Actions for Receptionist */}
                        <div className="pt-2 border-t border-slate-850 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'rejected')}
                            className="flex-1 py-1 px-2 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all"
                          >
                            رفض الحجز
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'approved')}
                            className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            تأكيد الحجز
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. ROOMS TAB ==================== */}
        {activeTab === "rooms" && userRole !== "accountant" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Add Room Form Column */}
              <div className="lg:col-span-5">
                <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xs font-black text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-500" /> تقديم طلب إضافة خيار غرفة جديدة
                    </CardTitle>
                    <CardDescription className="text-[10px] text-slate-400">
                      سيتم إرسال مواصفات الغرفة إلى لوحة الإدارة الكبرى لشومة للموافقة وتطبيق نسبة العمولة المناسبة ونشرها بالتطبيق.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddRoom} className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-300">اسم الغرفة أو الجناح بالتفصيل:</Label>
                        <Input
                          type="text"
                          placeholder="مثال: جناح ديلوكس كينج مع حوض سباحة خاص"
                          value={newRoom.nameAr}
                          onChange={e => setNewRoom(prev => ({ ...prev, nameAr: e.target.value }))}
                          required
                          className="bg-slate-950 border-slate-800 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-300">السعر الأساسي المقترح (ر.ع):</Label>
                          <Input
                            type="number"
                            placeholder="مثال: 65"
                            value={newRoom.priceBase}
                            onChange={e => setNewRoom(prev => ({ ...prev, priceBase: e.target.value }))}
                            required
                            className="bg-slate-950 border-slate-800 text-xs text-white text-left font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-300">السعة الاستيعابية:</Label>
                          <select
                            value={newRoom.maxGuests}
                            onChange={e => setNewRoom(prev => ({ ...prev, maxGuests: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg h-9 px-3 text-right text-slate-300"
                          >
                            <option value="1">شخص واحد</option>
                            <option value="2">شخصين</option>
                            <option value="3">٣ أشخاص</option>
                            <option value="4">عائلة (٤ أشخاص)</option>
                            <option value="6">عائلة كبرى (٦ أشخاص)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-300">مساحة الغرفة (م²):</Label>
                          <Input
                            type="number"
                            placeholder="مثال: 45"
                            value={newRoom.roomSize}
                            onChange={e => setNewRoom(prev => ({ ...prev, roomSize: e.target.value }))}
                            className="bg-slate-950 border-slate-800 text-xs text-white text-left font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-300">نوع الأسرّة المتاحة:</Label>
                          <Input
                            type="text"
                            placeholder="مثال: سرير كينج كبير جداً"
                            value={newRoom.bedType}
                            onChange={e => setNewRoom(prev => ({ ...prev, bedType: e.target.value }))}
                            className="bg-slate-950 border-slate-800 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-300">عدد الغرف المتاحة في المخزون (الـ Inventory):</Label>
                          <Input
                            type="number"
                            placeholder="مثال: 100"
                            value={newRoom.availableRooms}
                            onChange={e => setNewRoom(prev => ({ ...prev, availableRooms: e.target.value }))}
                            required
                            className="bg-slate-950 border-slate-800 text-xs text-white text-left font-mono"
                          />
                          <p className="text-[9px] text-slate-500">
                            سيتم خصم غرفة واحدة تلقائياً من هذا الرقم مع كل حجز مؤكد يقوم به مستخدم من واجهة العميل.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-300">الإطلالة والمنظر الخارجي:</Label>
                        <Input
                          type="text"
                          placeholder="مثال: إطلالة جبلية خلابة ومباشرة على الوادي"
                          value={newRoom.viewType}
                          onChange={e => setNewRoom(prev => ({ ...prev, viewType: e.target.value }))}
                          className="bg-slate-950 border-slate-800 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-300">رابط صورة الغرفة (أو اختر من المعرض):</Label>
                        <Input
                          type="text"
                          placeholder="مثال: https://images.unsplash.com..."
                          value={newRoom.image}
                          onChange={e => setNewRoom(prev => ({ ...prev, image: e.target.value }))}
                          className="bg-slate-950 border-slate-800 text-xs text-white text-left font-mono text-[10px]"
                        />
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => setNewRoom(prev => ({ ...prev, image: "https://images.unsplash.com/photo-1611891405914-ee72af1717a3?auto=format&fit=crop&w=600&q=80" }))}
                            className={`p-1 border text-[8px] rounded hover:bg-slate-800 transition ${newRoom.image.includes("photo-1611891405914") ? "border-emerald-500 text-emerald-400 bg-slate-900" : "border-slate-800 text-slate-400"}`}
                          >
                            غرفة ملكية ديلوكس
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRoom(prev => ({ ...prev, image: "https://images.unsplash.com/photo-1582719478250-c89cae4db85b?auto=format&fit=crop&w=600&q=80" }))}
                            className={`p-1 border text-[8px] rounded hover:bg-slate-800 transition ${newRoom.image.includes("photo-1582719478250") ? "border-emerald-500 text-emerald-400 bg-slate-900" : "border-slate-800 text-slate-400"}`}
                          >
                            جناح فاخر عائلي
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewRoom(prev => ({ ...prev, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80" }))}
                            className={`p-1 border text-[8px] rounded hover:bg-slate-800 transition ${newRoom.image.includes("photo-1590490360182") ? "border-emerald-500 text-emerald-400 bg-slate-900" : "border-slate-800 text-slate-400"}`}
                          >
                            غرفة سريرين كينج
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-300">مواصفات وتفاصيل إضافية للغرفة:</Label>
                        <textarea
                          placeholder="مثال: تحتوي على ماكينة صنع قهوة إسبريسو وحمام رخامي متكامل..."
                          value={newRoom.description}
                          onChange={e => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-300">الخدمات والمرافق المتوفرة (مفصولة بفاصلة):</Label>
                        <Input
                          type="text"
                          value={newRoom.amenitiesInput}
                          onChange={e => setNewRoom(prev => ({ ...prev, amenitiesInput: e.target.value }))}
                          className="bg-slate-950 border-slate-800 text-xs text-white"
                        />
                      </div>

                      {/* RBAC restriction: Only General Manager can add new rooms */}
                      {userRole === "manager" ? (
                        <Button 
                          type="submit" 
                          disabled={isAddingRoom}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs h-9 rounded-xl transition-all cursor-pointer text-white"
                        >
                          {isAddingRoom ? "جاري تسجيل طلب الغرفة..." : "إرسال خيار الغرفة للاعتماد"}
                        </Button>
                      ) : (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-500 leading-normal">
                          ⚠️ صلاحية إضافة وإدراج غرف جديدة مقصورة فقط على <strong>المدير العام</strong> للفندق.
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Rooms List Column */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xs font-black text-white">الغرف والخيارات المسجلة بالفندق</h3>

                {isLoadingRooms ? (
                  <p className="text-xs text-slate-400 text-center py-6">جاري تحميل الغرف الفندقية...</p>
                ) : rooms.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12 border border-slate-800 rounded-2xl bg-slate-900/30">لا توجد غرف مدرجة للفندق حالياً.</p>
                ) : (
                  <div className="space-y-3">
                    {rooms.map(room => (
                      <div key={room.id} className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 font-sans">
                        <div className="space-y-1 text-right flex-1 truncate">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-black text-white truncate">{room.name_ar || room.name}</strong>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              room.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                              room.status === "rejected" ? "bg-rose-500/10 text-rose-400" :
                              "bg-amber-500/10 text-amber-400"
                            }`}>
                              {room.status === "approved" ? "✓ نشط ومتاح للحجز" : room.status === "rejected" ? "✗ مرفوض" : "⏱️ بانتظار اعتماد الإدارة"}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              (room.available_rooms ?? 10) > 5 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              (room.available_rooms ?? 10) > 0 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              📦 المخزون: {room.available_rooms !== undefined && room.available_rooms !== null ? room.available_rooms : 10} غرف متبقية
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-sm">{room.description || "لا يوجد وصف متاح."}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.isArray(room.amenities) && room.amenities.map((am: string, i: number) => (
                              <span key={i} className="text-[8px] bg-slate-950 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded">
                                {am}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                          <span className="text-xs font-bold text-amber-500 font-mono">
                            {parseFloat(room.price_final || room.price_base).toFixed(3)} ر.ع
                          </span>
                          <span className="text-[8px] text-slate-400">سعة: {room.max_guests} أشخاص</span>

                          <div className="flex gap-1.5 mt-1">
                            <button
                              type="button"
                              onClick={() => toggleRoomAvailability(room.id, room.status)}
                              className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold rounded text-slate-300"
                            >
                              {room.status === "approved" ? "تعطيل توفرها" : "تفعيل توفرها"}
                            </button>
                            {userRole === "manager" && (
                              <button
                                type="button"
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. FINANCIALS TAB ==================== */}
        {activeTab === "financials" && (userRole === "manager" || userRole === "accountant") && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">إجمالي التدفق المالي بالخزينة</span>
                    <h3 className="text-xl font-black text-white font-mono">{totalSales.toFixed(3)} ر.ع</h3>
                  </div>
                  <span className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </span>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">عمولات نظام شومة المستقطعة ({splitShoumaPct}%)</span>
                    <h3 className="text-xl font-black text-rose-400 font-mono">{systemCommission.toFixed(3)} ر.ع</h3>
                  </div>
                  <span className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                    <Percent className="w-5 h-5" />
                  </span>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">صافي الأرباح المحولة للفندق ({100 - splitShoumaPct}%)</span>
                    <h3 className="text-xl font-black text-emerald-400 font-mono">{netEarnings.toFixed(3)} ر.ع</h3>
                  </div>
                  <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* End of Month Calculator */}
            <Card className="bg-slate-900 border-slate-800 rounded-2xl font-sans">
              <CardHeader>
                <CardTitle className="text-xs font-black text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> تسوية وحساب المستحقات المالية لنهاية الشهر
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  حدد الشهر المستهدف لتوليد فاتورة التسوية وإقرار عمولات النظام وصافي مستحقات فندقكم.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs font-bold text-slate-300">اختر الشهر:</Label>
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleCalculatePayout}
                    disabled={isCalculatingPayout}
                    className="h-10 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1 text-white"
                  >
                    {isCalculatingPayout ? "جاري تسوية الفاتورة..." : "حساب وإصدار كشف تسوية الشهر"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payout Settlements History */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" /> سجل كشوفات تسويات العمولات والأرباح الشهرية (المعتمدة)
              </h3>

              {isLoadingPayouts ? (
                <p className="text-xs text-slate-400 text-center py-4">جاري جلب الفواتير السابقة...</p>
              ) : payouts.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 border border-slate-850 rounded-xl">لا يوجد أي تسويات معالجة من قبل محاسب الفندق لشهر محدد بعد.</p>
              ) : (
                <div className="space-y-3 font-sans">
                  {payouts.map((p, index) => (
                    <div key={index} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-lg font-black font-mono">
                          الشهر: {p.month}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1.5">إجمالي التدفق: {parseFloat(p.total_revenue).toFixed(3)} ر.ع</h4>
                      </div>
                      <div className="flex gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block">عمولة شومة المستقطعة</span>
                          <strong className="text-rose-400">{parseFloat(p.commission_amount).toFixed(3)} ر.ع</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">صافي مستحقات فندقكم</span>
                          <strong className="text-emerald-400">{parseFloat(p.payout_amount).toFixed(3)} ر.ع</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 5. REVIEWS TAB ==================== */}
        {activeTab === "reviews" && (
          <div className="space-y-4 font-sans">
            <h2 className="text-sm font-black text-white flex items-center gap-1.5">
              <MessageSquare className="w-5 h-5 text-amber-500" /> آراء وتقييمات عملاء منصة شومة للرحلات
            </h2>
            <p className="text-xs text-slate-400">تواصل وقراءة انطباعات النزلاء لتحسين جودة الضيافة فندقياً.</p>

            {isLoadingReviews ? (
              <p className="text-xs text-slate-400 text-center py-6">جاري تحميل التعليقات...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10 border border-slate-800 rounded-2xl bg-slate-900/30">لم يكتب النزلاء أي مراجعات أو تقييمات لخدمتكم حتى اللحظة.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <Card key={rev.id} className="bg-slate-900 border-slate-850 p-4 space-y-3 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold">
                          {rev.user_name?.charAt(0) || "U"}
                        </span>
                        <strong className="text-xs text-white">{rev.user_name}</strong>
                      </div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                    <span className="text-[9px] text-slate-500 block text-left">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString('ar-OM') : ""}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 6. TEAM & CREDENTIALS TAB (MANAGER ONLY) ==================== */}
        {activeTab === "team" && userRole === "manager" && (
          <div className="space-y-8">
            {/* Team Staff Accounts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-xs font-black text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" /> إدراج حساب موظف جديد بالفندق (PMS)
                    </CardTitle>
                    <CardDescription className="text-[10px] text-slate-400">
                      تأمين وتوزيع مهام فريق العمل من خلال تزويدهم بحساب وصلاحية مخصصة (موظف استقبال / محاسب مالي).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddTeamMember} className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-300">اسم الموظف الثلاثي:</Label>
                        <Input
                          type="text"
                          placeholder="مثال: أحمد بن سعيد الحارثي"
                          value={newMember.name}
                          onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="bg-slate-950 border-slate-800 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-300">اسم مستخدم الحساب للولوج (إيميل أو كود):</Label>
                        <Input
                          type="text"
                          placeholder="مثال: ahmed@hotel.com"
                          value={newMember.username}
                          onChange={e => setNewMember(prev => ({ ...prev, username: e.target.value }))}
                          required
                          className="bg-slate-950 border-slate-800 text-xs text-white text-left font-mono"
                          dir="ltr"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-300">الرتبة الممنوحة له:</Label>
                          <select
                            value={newMember.role}
                            onChange={e => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg h-9 px-3 text-right text-slate-300"
                          >
                            <option value="receptionist">موظف الاستقبال (Receptionist)</option>
                            <option value="accountant">المحاسب المالي (Accountant)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-300">كلمة المرور السرية:</Label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={newMember.password}
                            onChange={e => setNewMember(prev => ({ ...prev, password: e.target.value }))}
                            required
                            className="bg-slate-950 border-slate-800 text-xs text-white"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isAddingMember}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs h-9 rounded-xl transition-all cursor-pointer text-white"
                      >
                        {isAddingMember ? "جاري ربط حساب الموظف..." : "إضافة الحساب وتفعيل الصلاحية"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Staff Accounts List */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xs font-black text-white">طاقم موظفي نظام الـ PMS بالفندق</h3>

                {isLoadingTeam ? (
                  <p className="text-xs text-slate-400 text-center py-4">جاري تحميل سجل الموظفين...</p>
                ) : team.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10 border border-slate-850 rounded-xl bg-slate-900/10">لم تسجل أي حسابات إضافية لموظفيكم بعد.</p>
                ) : (
                  <div className="space-y-3 font-sans">
                    {team.map(member => (
                      <div key={member.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                        <div className="text-right flex-1 truncate">
                          <h4 className="text-xs font-bold text-white truncate">{member.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">اسم الحساب: {member.username}</span>
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-950 border border-slate-850 text-slate-400 text-[8px] rounded font-bold">
                            {translateRole(member.role)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTeamMember(member.id)}
                          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Change General Manager Credentials Section */}
            <Card className="bg-slate-900 border-slate-800 rounded-2xl max-w-2xl font-sans">
              <CardHeader>
                <CardTitle className="text-xs font-black text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-400" /> تعديل بيانات ولوج المدير العام للفندق
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-400">
                  تحديث البريد الإلكتروني ورمز المرور السري الخاص بالولوج للمدير العام (مستوى مدير مصلحة الحجوزات).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-300">البريد الإلكتروني الحالي / الجديد:</Label>
                      <Input
                        type="email"
                        value={secEmail}
                        onChange={e => setSecEmail(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-800 text-xs text-white text-left font-mono"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-300">كلمة المرور الجديدة:</Label>
                      <Input
                        type="password"
                        value={secPassword}
                        onChange={e => setSecPassword(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        placeholder="أدخل كلمة المرور لتأكيد التغيير"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isUpdatingCreds}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl h-9 px-6 cursor-pointer text-white"
                    >
                      {isUpdatingCreds ? "جاري تحديث وتأمين الخيار..." : "حفظ التغييرات الأمنية"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="py-6 mt-12 text-center text-xs text-slate-600 border-t border-slate-900 bg-slate-950/80">
        بوابة أصحاب الفنادق الذكية لشومة للرحلات والاستكشاف • سلطنة عُمان © 2026
      </footer>
    </div>
  );
}
