import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Building2, 
  Building,
  Compass, 
  Trash2, 
  Plus, 
  Lock, 
  PieChart as PieIcon, 
  Layers, 
  Receipt,
  Users,
  Briefcase,
  Percent,
  CheckCircle,
  FileSpreadsheet,
  Presentation,
  Phone,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import pptxgen from "pptxgenjs";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { useToast } from "@/hooks/use-toast";

// Finance categories translate to Arabic and have custom styling
const CATEGORIES_AR: Record<string, { label: string; color: string }> = {
  hiking: { label: "مغامرات الهايكنج", color: "#0ea5e9" },
  hotel: { label: "شراكات الفنادق", color: "#10b981" },
  car: { label: "تأجير السيارات", color: "#f43f5e" },
  office: { label: "مصاريف إدارية ومكتبية", color: "#f59e0b" },
  marketing: { label: "تسويق وإعلانات", color: "#ec4899" },
  salary: { label: "أجور مرشدين وموظفين", color: "#8b5cf6" },
  fees: { label: "رسوم تراخيص وضرائب", color: "#6b7280" },
  other: { label: "أخرى وتكميلية", color: "#14b8a6" }
};

export default function FinanceAdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Authentication states
  const [email, setEmail] = useState("finance@shouma.com");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem("shouma_finance_auth") === "true";
  });
  const [authError, setAuthError] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"dashboard" | "hotels" | "hiking" | "cashbook">("dashboard");

  // Form state for adding manual transactions
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txCategory, setTxCategory] = useState("office");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [txDescription, setTxDescription] = useState("");

  // Fetching data queries
  const { data: transactions = [], isLoading: isLoadingTx } = useQuery<any[]>({
    queryKey: ["/api/finance/transactions"],
    enabled: isAuthorized
  });

  const { data: hotelBookings = [], isLoading: isLoadingHotels } = useQuery<any[]>({
    queryKey: ["/api/hotel-bookings"],
    enabled: isAuthorized
  });

  const { data: hikingBookings = [], isLoading: isLoadingHiking } = useQuery<any[]>({
    queryKey: ["/api/hiking-bookings"],
    enabled: isAuthorized
  });

  const { data: dbHotels = [] } = useQuery<any[]>({
    queryKey: ["/api/catalog/hotels"],
    enabled: isAuthorized
  });

  // Fetch pending hotels awaiting finance percentage set
  const { data: pendingFinanceHotels = [], refetch: refetchPendingFinance } = useQuery<any[]>({
    queryKey: ["/api/finance/hotels/pending-finance"],
    enabled: isAuthorized
  });

  const [selectedPendingHotel, setSelectedPendingHotel] = useState<any | null>(null);
  const [commissionPct, setCommissionPct] = useState<string>("15");
  const [isSubmittingCommission, setIsSubmittingCommission] = useState(false);
  const [selectedHotelFinanceId, setSelectedHotelFinanceId] = useState<string | null>(null);

  const handleSetCommission = async (hotelId: number) => {
    if (!commissionPct) return;
    setIsSubmittingCommission(true);
    try {
      const res = await fetch(`/api/finance/hotels/${hotelId}/set-commission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoumaPct: parseFloat(commissionPct) })
      });
      if (res.ok) {
        toast({
          title: "✅ تم تحديد النسبة بنجاح",
          description: `تم اعتماد نسبة ${commissionPct}% لشركة شومة ونسبة ${100 - parseFloat(commissionPct)}% للفندق وتحويل الطلب لمدير الشركة للاعتماد النهائي.`
        });
        setSelectedPendingHotel(null);
        refetchPendingFinance();
        queryClient.invalidateQueries({ queryKey: ["/api/finance/hotels/pending-finance"] });
      } else {
        const err = await res.json();
        toast({ description: err.message || "فشل تحديد نسبة العمولة", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ description: "حدث خطأ في الشبكة أثناء إعداد النسبة.", variant: "destructive" });
    } finally {
      setIsSubmittingCommission(false);
    }
  };

  // Create transaction mutation
  const createTxMutation = useMutation({
    mutationFn: async (newTx: any) => {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTx)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشلت عملية الإضافة");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/transactions"] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم تسجيل المعاملة المالية في النظام المحاسبي بنجاح.",
        variant: "default"
      });
      // Reset form (except date)
      setTxAmount("");
      setTxDescription("");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإضافة",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete transaction mutation
  const deleteTxMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/finance/transactions/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("تعذر حذف المعاملة المالية");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/transactions"] });
      toast({
        title: "تم الحذف",
        description: "تم شطب المعاملة المالية من الكشف العام."
      });
    }
  });

  // --- CALCULATING ACCOUNTING METRICS (Hooks defined at top level) ---

  // Hotel bookings revenue details:
  const allHotelsCombined = React.useMemo(() => {
    return dbHotels.map(h => {
      return {
        id: h.id.toString(),
        name: h.name_ar || h.nameAr || h.name || 'فندق مخصص',
        pricePerNight: Number(h.price_per_night || h.pricePerNight) || 55,
        splitShoumaPct: h.split_shouma_pct !== undefined ? Number(h.split_shouma_pct) : (h.splitShoumaPct !== undefined ? Number(h.splitShoumaPct) : 15),
        splitHotelPct: h.split_hotel_pct !== undefined ? Number(h.split_hotel_pct) : (h.splitHotelPct !== undefined ? Number(h.splitHotelPct) : 85),
      };
    });
  }, [dbHotels]);

  const totalHotelBookingsRev = React.useMemo(() => {
    return hotelBookings.reduce((sum, b) => sum + Number(b.total_price || b.totalPrice || 0), 0);
  }, [hotelBookings]);
  
  // Split Commission of Shouma from Hotels & Hotel share using exact mapping
  const shoumaHotelCommissions = React.useMemo(() => {
    return hotelBookings.reduce((sum, b) => {
      const match = allHotelsCombined.find(h => 
        h.id === (b.hotel_id || b.hotelId)?.toString() || 
        h.name === b.hotel_name || 
        h.name === b.hotelName
      );
      const splitShouma = match ? match.splitShoumaPct : 15;
      const splitHotel = match ? match.splitHotelPct : 85;
      const totalWeight = splitShouma + splitHotel;
      const ratio = totalWeight === 0 ? 0.15 : splitShouma / totalWeight;
      return sum + (Number(b.total_price || b.totalPrice || 0) * ratio);
    }, 0);
  }, [hotelBookings, allHotelsCombined]);
  
  const partnerHotelsShare = React.useMemo(() => {
    return hotelBookings.reduce((sum, b) => {
      const match = allHotelsCombined.find(h => 
        h.id === (b.hotel_id || b.hotelId)?.toString() || 
        h.name === b.hotel_name || 
        h.name === b.hotelName
      );
      const splitShouma = match ? match.splitShoumaPct : 15;
      const splitHotel = match ? match.splitHotelPct : 85;
      const totalWeight = splitShouma + splitHotel;
      const ratio = totalWeight === 0 ? 0.85 : splitHotel / totalWeight;
      return sum + (Number(b.total_price || b.totalPrice || 0) * ratio);
    }, 0);
  }, [hotelBookings, allHotelsCombined]);

  const selectedHotelObj = React.useMemo(() => {
    if (!selectedHotelFinanceId) return null;
    return allHotelsCombined.find(h => h.id === selectedHotelFinanceId);
  }, [selectedHotelFinanceId, allHotelsCombined]);

  const selectedHotelBookings = React.useMemo(() => {
    if (!selectedHotelObj) return [];
    return hotelBookings.filter(b => 
      b.hotel_id?.toString() === selectedHotelObj.id || 
      b.hotelId?.toString() === selectedHotelObj.id || 
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!email || !password) {
      setAuthError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/portal-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalType: "finance", email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthorized(true);
        sessionStorage.setItem("shouma_finance_auth", "true");
        setAuthError("");
      } else {
        setAuthError(data.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }
    } catch (err) {
      setAuthError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || parseFloat(txAmount) <= 0) {
      toast({
        title: "تنبيه",
        description: "يرجى تحديد مبلغ مالي صحيح أكبر من الصفر.",
        variant: "destructive"
      });
      return;
    }
    if (!txDescription.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى كتابة بيان ووصف دقيق للمعاملة.",
        variant: "destructive"
      });
      return;
    }

    createTxMutation.mutate({
      type: txType,
      category: txCategory,
      amount: parseFloat(txAmount),
      description: txDescription,
      date: txDate
    });
  };

  // Password Lockout Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 font-sans" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-800 text-slate-100 p-8 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-emerald-500 to-sky-500" />
          
          <div className="flex flex-col items-center text-center mt-4">
            <div className="p-4 bg-slate-700/60 rounded-full text-emerald-400 mb-4 border border-slate-600">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">النظام المحاسبي والمالي لشركة شومة</h1>
            <p className="text-slate-400 text-sm mt-2">يرجى تسجيل الدخول بالبريد الإلكتروني وكلمة المرور المصرحة لقسم الإدارة المالية</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="finance@shouma.com"
                className="w-full bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors text-right dir-ltr"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-1.5">كلمة المرور</label>
              <input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••••"
                className="w-full bg-slate-950 text-slate-100 px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors text-center text-lg tracking-wider"
                required
              />
            </div>

            {authError && (
              <p className="text-red-400 text-xs text-center bg-red-400/10 p-2.5 rounded-lg border border-red-400/20">{authError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200 cursor-pointer flex justify-center items-center gap-2 shadow-lg hover:shadow-emerald-950/20"
            >
              {isLoggingIn ? "جاري التحقق..." : "دخول كمدير مالي مصرح"}
            </button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-8">خاضع للتشفير والرقابة المباشرة - شركة شومة لخدمات السياحة والمغامرات © 2026</p>
        </motion.div>
      </div>
    );
  }

  // --- CALCULATING ACCOUNTING METRICS ---
  
  // 1. Hiking bookings revenue (Automatic Incoming)
  const totalHikingBookingsRev = hikingBookings.reduce((sum, b) => sum + (parseFloat(b.paid_amount || b.paidAmount || 0)), 0);
  
  // 4. Manual general transactions (excluding automatic bookings to prevent double-counting)
  const manualIncomes = transactions.filter(t => t.type === "income" && !t.reference_id && !t.referenceId).reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const manualExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // 5. Overall Totals
  // Under the new model: "All money from bookings goes 100% to company's wallet first, then splitting details are shown in the finance section."
  // Total Company Wallet Inflow: 100% Hiking Revenue + 100% Hotel Revenue + other manual incomes
  const companyTotalIncoming = totalHikingBookingsRev + totalHotelBookingsRev + manualIncomes;
  const companyTotalExpenses = manualExpenses;
  
  // Total Partner/Guides Payables (85% share)
  const totalPartnerShare = (totalHikingBookingsRev * 0.85) + partnerHotelsShare;
  
  // Platform Net Commission Share (15% share) after deducting general operational expenses
  const shoumaPlatformRevenue = (totalHikingBookingsRev * 0.15) + shoumaHotelCommissions + manualIncomes;
  const netEarningsBalance = shoumaPlatformRevenue - companyTotalExpenses;

  // Pie chart representation
  const expenseByCategoryMap: Record<string, number> = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    expenseByCategoryMap[t.category] = (expenseByCategoryMap[t.category] || 0) + parseFloat(t.amount || 0);
  });
  
  const expenseChartData = Object.entries(expenseByCategoryMap).map(([cat, amount]) => ({
    name: CATEGORIES_AR[cat]?.label || cat,
    val: amount,
    color: CATEGORIES_AR[cat]?.color || "#cccccc"
  }));

  // Bar Chart of Monthly entries
  const incomeVsExpenseData = [
    { name: "واردات المحفظة الكلية", المداخيل: companyTotalIncoming, المصاريف: 0 },
    { name: "أرباح المنصة (عمولة)", المداخيل: shoumaPlatformRevenue, المصاريف: 0 },
    { name: "مستحقات الشركاء للتسوية", المداخيل: 0, المصاريف: totalPartnerShare },
    { name: "نفقات التشغيل والرواتب", المداخيل: 0, المصاريف: companyTotalExpenses }
  ];

  // Extract month string YYYY-MM from date string or ISO timestamp
  const getMonthFromDateStr = (dateStr: any) => {
    if (!dateStr) return null;
    const matches = String(dateStr).match(/^(\d{4})-(\d{2})/);
    if (matches) {
      return `${matches[1]}-${matches[2]}`;
    }
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      const y = parsedDate.getFullYear();
      const m = String(parsedDate.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    }
    return null;
  };

  const monthlyDataMap: Record<string, { revenue: number; expenses: number; hiking: number; hotel: number; other: number }> = {};

  // Initialize active months in 2026 for a smoother starting view
  const activeMonths = ["04", "05", "06", "07", "08"];
  activeMonths.forEach(m => {
    monthlyDataMap[`2026-${m}`] = { revenue: 0, expenses: 0, hiking: 0, hotel: 0, other: 0 };
  });

  // 1. Process hiking bookings for monthly data
  hikingBookings.forEach(b => {
    const dateStr = b.booking_date || b.bookingDate || b.created_at || b.createdAt;
    const month = getMonthFromDateStr(dateStr) || "2026-06";
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { revenue: 0, expenses: 0, hiking: 0, hotel: 0, other: 0 };
    }
    const amt = parseFloat(b.paid_amount || b.paidAmount || 0);
    monthlyDataMap[month].hiking += amt;
    monthlyDataMap[month].revenue += amt;
  });

  // 2. Process hotel bookings for monthly data (100% of hotel bookings goes to company's wallet)
  hotelBookings.forEach(b => {
    const dateStr = b.created_at || b.createdAt;
    const month = getMonthFromDateStr(dateStr) || "2026-06";
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { revenue: 0, expenses: 0, hiking: 0, hotel: 0, other: 0 };
    }
    const total = parseFloat(b.total_price || b.totalPrice || 0);
    monthlyDataMap[month].hotel += total;
    monthlyDataMap[month].revenue += total;
  });

  // 3. Process general finance transactions for monthly data (excluding automatic bookings to prevent double-counting)
  transactions.forEach(t => {
    const dateStr = t.date || t.created_at || t.createdAt;
    const month = getMonthFromDateStr(dateStr) || "2026-06";
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { revenue: 0, expenses: 0, hiking: 0, hotel: 0, other: 0 };
    }
    const amt = parseFloat(t.amount || 0);
    if (t.type === "income") {
      if (!t.reference_id && !t.referenceId) {
        monthlyDataMap[month].other += amt;
        monthlyDataMap[month].revenue += amt;
      }
    } else if (t.type === "expense") {
      monthlyDataMap[month].expenses += amt;
    }
  });

  const monthNamesAr: Record<string, string> = {
    "01": "يناير", "02": "فبراير", "03": "مارس", "04": "أبريل", 
    "05": "مايو", "06": "يونيو", "07": "يوليو", "08": "أغسطس", 
    "09": "سبتمبر", "10": "أكتوبر", "11": "نوفمبر", "12": "ديسمبر"
  };

  const monthlyTrendData = Object.entries(monthlyDataMap)
    .map(([monthKey, val]) => {
      const [year, monthPart] = monthKey.split("-");
      const name = `${monthNamesAr[monthPart] || monthPart} ${year}`;
      // Net Profit of platform (Shouma) is: (15% of hiking + 15% of hotel + other manual incomes) - operational expenses
      const shoumaHikingComm = val.hiking * 0.15;
      const shoumaHotelComm = val.hotel * 0.15;
      const shoumaCommissionRevenue = shoumaHikingComm + shoumaHotelComm + val.other;
      const profit = shoumaCommissionRevenue - val.expenses;
      return {
        monthKey,
        name,
        الإيرادات: parseFloat(val.revenue.toFixed(1)),
        المصاريف: parseFloat(val.expenses.toFixed(1)),
        الأرباح: parseFloat(profit.toFixed(1)),
        الهايكنج: parseFloat(val.hiking.toFixed(1)),
        الفنادق: parseFloat(val.hotel.toFixed(1))
      };
    })
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Export Hotel Bookings to CSV
  const handleExportHotelsCSV = () => {
    try {
      const headers = ["ID", "Hotel Name", "Room Name", "Guest Name", "Phone", "Email", "Nights", "Price Per Night", "Total Price", "Payment Gateway", "Date"];
      const rows = hotelBookings.map(b => [
        b.id,
        `"${b.hotel_name || b.hotelName || ''}"`,
        `"${b.room_name || b.roomName || ''}"`,
        `"${b.full_name || b.fullName || ''}"`,
        `"${b.phone || ''}"`,
        `"${b.email || ''}"`,
        b.nights || 1,
        b.price_per_night || b.pricePerNight || 0,
        b.total_price || b.totalPrice || 0,
        `"${b.payment_gateway || b.paymentGateway || 'شومة باي'}"`,
        b.created_at || b.createdAt || ''
      ]);
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `تقرير_حجوزات_الفنادق_شومة_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "تم استخراج تقرير الحجوزات",
        description: "تم تحميل ملف كشف حجوزات الفنادق بصيغة CSV بنجاح."
      });
    } catch (err) {
      toast({
        title: "خطأ في التصدير",
        description: "عذراً، حدث خطأ أثناء محاولة تصدير ملف CSV.",
        variant: "destructive"
      });
    }
  };

  // Export Hiking Bookings to CSV
  const handleExportHikingCSV = () => {
    try {
      const headers = ["ID", "Trip Title", "Guest Name", "Phone", "Email", "Paid Amount", "Tickets Count", "Payment Status", "Gateway", "Date"];
      const rows = hikingBookings.map(b => [
        b.id,
        `"${b.trip_title || b.tripTitle || ''}"`,
        `"${b.full_name || b.fullName || ''}"`,
        `"${b.phone || ''}"`,
        `"${b.email || ''}"`,
        b.paid_amount || b.paidAmount || 0,
        b.tickets_count || b.ticketsCount || 1,
        `"${b.payment_status || b.paymentStatus || 'مؤكد'}"`,
        `"${b.payment_gateway || b.paymentGateway || 'شومة باي'}"`,
        b.created_at || b.createdAt || ''
      ]);
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `تقرير_حجوزات_الهايكنق_شومة_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "تم استخراج تقرير الهايكنق",
        description: "تم تحميل ملف كشف حجوزات مغامرات الهايكنق بصيغة CSV بنجاح."
      });
    } catch (err) {
      toast({
        title: "خطأ في التصدير",
        description: "عذراً، حدث خطأ أثناء محاولة تصدير ملف CSV.",
        variant: "destructive"
      });
    }
  };

  // Generate highly detailed financial PowerPoint report
  const handleGenerateDetailedPPTXReport = () => {
    try {
      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_16x9";

      // Slide 1: Welcome & Cover Slide (Financial Focus)
      const slide1 = pptx.addSlide();
      slide1.background = { color: "0B1329" };

      // Main Title
      slide1.addText("التقرير الحسابي والمالي التنفيذي المفصل", {
        x: 0.5,
        y: 1.5,
        w: 12.3,
        h: 0.9,
        fontSize: 28,
        fontFace: "Arial",
        color: "FFFFFF",
        bold: true,
        align: "right"
      } as any);

      slide1.addText("منصة شومة للاستكشاف والهايكنج والمغامرات السياحية", {
        x: 0.5,
        y: 2.3,
        w: 12.3,
        h: 0.5,
        fontSize: 18,
        fontFace: "Arial",
        color: "10B981",
        bold: true,
        align: "right"
      } as any);

      // Subtitle
      slide1.addText("ميزان المراجعة، تسويات قطاع الفنادق والضيافة، وعوائد ومصاريف الأنشطة التشغيلية لعام ٢٠٢٦", {
        x: 0.5,
        y: 3.0,
        w: 12.3,
        h: 0.8,
        fontSize: 14,
        fontFace: "Arial",
        color: "94A3B8",
        align: "right"
      } as any);

      // Corporate/Auditor note
      slide1.addText(`أُعد بواسطة: قسم الرقابة المالية والتدقيق الحسابي الموحد\nتاريخ وموعد استخراج التقرير: ${new Date().toLocaleString("ar-OM")}`, {
        x: 0.5,
        y: 4.8,
        w: 12.3,
        h: 1.0,
        fontSize: 12,
        fontFace: "Arial",
        color: "64748B",
        align: "right"
      } as any);

      // Slide 2: General Balance & Treasury Analysis (قائمة الدخل وميزان الخزانة)
      const slide2 = pptx.addSlide();
      slide2.background = { color: "0F172A" };

      slide2.addText("١. قائمة الدخل والتدفقات النقدية الكلية", {
        x: 0.5,
        y: 0.4,
        w: 12.3,
        h: 0.6,
        fontSize: 20,
        fontFace: "Arial",
        color: "FFFFFF",
        bold: true,
        align: "right"
      } as any);

      // Incoming
      slide2.addText("إجمالي المقبوضات والتدفقات الواردة", {
        x: 8.7,
        y: 1.3,
        w: 4.0,
        h: 0.4,
        fontSize: 13,
        fontFace: "Arial",
        color: "10B981",
        align: "center",
        bold: true
      } as any);
      slide2.addText(`${companyTotalIncoming.toFixed(3)} ر.ع`, {
        x: 8.7,
        y: 1.7,
        w: 4.0,
        h: 0.7,
        fontSize: 24,
        fontFace: "Arial",
        color: "FFFFFF",
        align: "center",
        bold: true
      } as any);

      // Outgoing
      slide2.addText("إجمالي المصاريف والنفقات التشغيلية", {
        x: 4.6,
        y: 1.3,
        w: 4.0,
        h: 0.4,
        fontSize: 13,
        fontFace: "Arial",
        color: "EF4444",
        align: "center",
        bold: true
      } as any);
      slide2.addText(`${companyTotalExpenses.toFixed(3)} ر.ع`, {
        x: 4.6,
        y: 1.7,
        w: 4.0,
        h: 0.7,
        fontSize: 24,
        fontFace: "Arial",
        color: "FFFFFF",
        align: "center",
        bold: true
      } as any);

      // Net Balance
      slide2.addText("صافي الفائض / الأرباح بالخزينة", {
        x: 0.5,
        y: 1.3,
        w: 4.0,
        h: 0.4,
        fontSize: 13,
        fontFace: "Arial",
        color: "38BDF8",
        align: "center",
        bold: true
      } as any);
      slide2.addText(`${netEarningsBalance.toFixed(3)} ر.ع`, {
        x: 0.5,
        y: 1.7,
        w: 4.0,
        h: 0.7,
        fontSize: 24,
        fontFace: "Arial",
        color: "FFFFFF",
        align: "center",
        bold: true
      } as any);

      // Detailed financial breakdown points
      slide2.addText(
        "• إجمالي المقبوضات والسيولة الواردة لمحفظة الشركة تشمل: كامل عوائد تذاكر الهايكنج بقيمة " + totalHikingBookingsRev.toFixed(3) + " ر.ع، وكامل عوائد حجوزات الفنادق البالغة " + totalHotelBookingsRev.toFixed(3) + " ر.ع، بالإضافة للمداخيل اليدوية الأخرى بقيمة " + manualIncomes.toFixed(3) + " ر.ع.\n" +
        "• صافي مستحقات الشركاء للتسوية والمنظمين (85٪): تبلغ " + totalPartnerShare.toFixed(3) + " ر.ع (تشمل حصص الفنادق الشريكة ومعدات وإرشاد الهايكنج).\n" +
        "• صافي أرباح خزانة المنصة (بعد خصم مستحقات الشركاء والمصاريف): تبلغ الأرباح الصافية الحالية لشومة " + netEarningsBalance.toFixed(3) + " ر.ع.",
        {
          x: 0.5,
          y: 2.8,
          w: 12.3,
          h: 2.4,
          fontSize: 13,
          fontFace: "Arial",
          color: "CBD5E1",
          align: "right"
        } as any
      );

      // Slide 3: Hiking Financials (صندوق دخل جولات الهايكنج والمغامرات)
      const slide3 = pptx.addSlide();
      slide3.background = { color: "0F172A" };

      slide3.addText("٢. تفاصيل وصندوق إيرادات جولات الهايكنج والمشاركين", {
        x: 0.5,
        y: 0.4,
        w: 12.3,
        h: 0.6,
        fontSize: 20,
        fontFace: "Arial",
        color: "FFFFFF",
        bold: true,
        align: "right"
      } as any);

      // Metrics in column
      slide3.addText(
        `• إجمالي حجوزات الهايكنج: ${hikingBookings.length} مشاركًا مسجلاً بالنظام الإلكتروني\n` +
        `• إجمالي عوائد تذاكر الهايكنج (المباشر): ${totalHikingBookingsRev.toFixed(3)} ر.ع\n` +
        `• حصة منصة شومة المستقطعة (١٥٪): ${(totalHikingBookingsRev * 0.15).toFixed(3)} ر.ع\n` +
        `• صافي حصة مرشدي الهايكنج والمنظمين (٨٥٪): ${(totalHikingBookingsRev * 0.85).toFixed(3)} ر.ع`,
        {
          x: 7.5,
          y: 1.2,
          w: 5.3,
          h: 1.8,
          fontSize: 13,
          fontFace: "Arial",
          color: "38BDF8",
          align: "right"
        } as any
      );

      slide3.addText("جدول تفصيلي لآخر الحجوزات المسجلة للهايكنج:", {
        x: 0.5,
        y: 2.8,
        w: 12.3,
        h: 0.4,
        fontSize: 14,
        fontFace: "Arial",
        color: "E2E8F0",
        bold: true,
        align: "right"
      } as any);

      const hikingTableRows: any[] = [
        [
          { text: "الرحلة الجبلية", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "المشارك", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "التاريخ", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "المقاعد", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "المبلغ المدفوع", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "بوابة الدفع", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } }
        ]
      ];

      hikingBookings.slice(0, 5).forEach((b: any) => {
        hikingTableRows.push([
          { text: b.trip_name || b.tripName || "رحلة جبلية", options: { color: "E2E8F0", align: "right", bold: false } },
          { text: b.full_name || b.fullName || "-", options: { color: "CBD5E1", align: "right", bold: false } },
          { text: b.booking_date || b.bookingDate || "-", options: { color: "CBD5E1", align: "center", bold: false } },
          { text: `${b.attendees || 1} أشخاص`, options: { color: "CBD5E1", align: "center", bold: false } },
          { text: `${parseFloat(b.paid_amount || b.paidAmount || 0).toFixed(1)} ر.ع`, options: { color: "10B981", align: "center", bold: true } },
          { text: b.payment_gateway || b.paymentGateway || "بوابة شومة", options: { color: "CBD5E1", align: "center", bold: false } }
        ]);
      });

      if (hikingBookings.length > 0) {
        slide3.addTable(hikingTableRows as any, {
          x: 0.5,
          y: 3.3,
          w: 12.3,
          colW: [3.3, 2.5, 1.8, 1.5, 1.7, 1.5],
          border: { pt: 1, color: "334155" },
          fontSize: 10,
          fontFace: "Arial"
        } as any);
      } else {
        slide3.addText("لا تتوفر سجلات حجوزات هايكنج نشطة حالياً.", {
          x: 1.0,
          y: 4.0,
          w: 11.3,
          h: 0.8,
          fontSize: 14,
          fontFace: "Arial",
          color: "94A3B8",
          align: "center"
        } as any);
      }

      // Slide 4: Hotel Partnerships & Commission Settlements (شراكات الفنادق والعمولات)
      const slide4 = pptx.addSlide();
      slide4.background = { color: "0F172A" };

      slide4.addText("٣. شراكات الضيافة والقطاع الفندقي والتسويات", {
        x: 0.5,
        y: 0.4,
        w: 12.3,
        h: 0.6,
        fontSize: 20,
        fontFace: "Arial",
        color: "FFFFFF",
        bold: true,
        align: "right"
      } as any);

      slide4.addText(
        `• إجمالي قيمة حجوزات الغرف الفندقية ونزل الضيافة: ${totalHotelBookingsRev.toFixed(3)} ر.ع\n` +
        `• إجمالي عمولة منصة شومة المستقطعة (١٥٪ كقيمة متوسطة): ${shoumaHotelCommissions.toFixed(3)} ر.ع\n` +
        `• صافي المستحقات الواجب صرفها للفنادق الشريكة (٨٥٪): ${partnerHotelsShare.toFixed(3)} ر.ع`,
        {
          x: 0.5,
          y: 1.1,
          w: 12.3,
          h: 1.2,
          fontSize: 13,
          fontFace: "Arial",
          color: "F59E0B",
          align: "right"
        } as any
      );

      slide4.addText("جدول حركة حجوزات الفنادق المعتمدة بالفترة المالية الأخيرة:", {
        x: 0.5,
        y: 2.4,
        w: 12.3,
        h: 0.4,
        fontSize: 14,
        fontFace: "Arial",
        color: "E2E8F0",
        bold: true,
        align: "right"
      } as any);

      const hotelTableRows: any[] = [
        [
          { text: "الفندق الشريك", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "الزبون", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "الغرفة / الليالي", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "إجمالي الحجز", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "عمولة المنصة", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "حصة الفندق الشريك", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } }
        ]
      ];

      hotelBookings.slice(0, 5).forEach((b: any) => {
        const totalAmount = parseFloat(b.total_price || b.totalPrice || 0);
        const shoumaPct = b.split_shouma_pct !== undefined ? b.split_shouma_pct : 15;
        const hotelPct = b.split_hotel_pct !== undefined ? b.split_hotel_pct : 85;
        const shoumaShare = totalAmount * (shoumaPct / 100);
        const hotelShare = totalAmount * (hotelPct / 100);

        hotelTableRows.push([
          { text: b.hotel_name || b.hotelName || "-", options: { color: "E2E8F0", align: "right", bold: false } },
          { text: b.full_name || b.fullName || "-", options: { color: "CBD5E1", align: "right", bold: false } },
          { text: `${b.room_name || "غرفة"} (${b.nights || 1} ليال)`, options: { color: "CBD5E1", align: "center", bold: false } },
          { text: `${totalAmount.toFixed(1)} ر.ع`, options: { color: "FFFFFF", align: "center", bold: false } },
          { text: `${shoumaShare.toFixed(1)} ر.ع (${shoumaPct}٪)`, options: { color: "10B981", align: "center", bold: true } },
          { text: `${hotelShare.toFixed(1)} ر.ع (${hotelPct}٪)`, options: { color: "8B5CF6", align: "center", bold: true } }
        ]);
      });

      if (hotelBookings.length > 0) {
        slide4.addTable(hotelTableRows as any, {
          x: 0.5,
          y: 2.9,
          w: 12.3,
          colW: [2.8, 2.2, 2.3, 1.6, 1.8, 1.6],
          border: { pt: 1, color: "334155" },
          fontSize: 9.5,
          fontFace: "Arial"
        } as any);
      } else {
        slide4.addText("لا تتوفر سجلات حجوزات فندقية نشطة حالياً بالنظام المالي.", {
          x: 1.0,
          y: 3.5,
          w: 11.3,
          h: 0.8,
          fontSize: 14,
          fontFace: "Arial",
          color: "94A3B8",
          align: "center"
        } as any);
      }

      // Slide 5: Expense Structure & Cashbook ledger analysis (تحليل النفقات والمصاريف التشغيلية)
      const slide5 = pptx.addSlide();
      slide5.background = { color: "0F172A" };

      slide5.addText("٤. هيكل النفقات والمصاريف التشغيلية والإدارية", {
        x: 0.5,
        y: 0.4,
        w: 12.3,
        h: 0.6,
        fontSize: 20,
        fontFace: "Arial",
        color: "FFFFFF",
        bold: true,
        align: "right"
      } as any);

      // Show expense category sums
      const catSummaryRows: any[] = [
        [
          { text: "الفئة المحاسبية للنفقات", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "الوصف والتعريف بالبند المالي", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "إجمالي المبالغ المنصرفة", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } }
        ]
      ];

      Object.entries(CATEGORIES_AR).forEach(([key, info]) => {
        const amt = expenseByCategoryMap[key] || 0;
        let desc = "مصاريف عامة وتكميلية للشركة";
        if (key === "hiking") desc = "تكاليف تنظيم جولات الهايكنج، تجهيز وصيانة الحبال ومعدات التسلق الجبلية";
        if (key === "hotel") desc = "تسويات النزل والفنادق ومصاريف حجز وتأكيد الإشغال السكني";
        if (key === "car") desc = "تسويات عقود ومبالغ تأجير السيارات وعائدات الأسطول السياحي للشركة";
        if (key === "office") desc = "إيجار مقر الشركة، فواتير الإنترنت والمياه والكهرباء والقرطاسية والمستلزمات";
        if (key === "marketing") desc = "حملات إعلانية ممولة، تسويق رقمي، مطبوعات ومنشورات ترويجية للمسارات الجبلية";
        if (key === "salary") desc = "مستحقات مرشدي السياحة المحليين وأجور العاملين وخدمة العملاء بالشركة";
        if (key === "fees") desc = "رسوم التراخيص الحكومية، ضرائب المعاملات ومستحقات بوابات الدفع الإلكترونية";

        catSummaryRows.push([
          { text: info.label, options: { color: "FFFFFF", align: "right", bold: false } },
          { text: desc, options: { color: "CBD5E1", align: "right", bold: false } },
          { text: `${amt.toFixed(3)} ر.ع`, options: { color: "EF4444", align: "center", bold: true } }
        ]);
      });

      slide5.addTable(catSummaryRows as any, {
        x: 0.5,
        y: 1.2,
        w: 12.3,
        colW: [2.5, 7.3, 2.5],
        border: { pt: 1, color: "334155" },
        fontSize: 10,
        fontFace: "Arial"
      } as any);

      // Slide 6: Ledger Transactions list (دفتر اليومية والأستاذ العام - العمليات الأخيرة)
      const slide6 = pptx.addSlide();
      slide6.background = { color: "0B1329" };

      slide6.addText("٥. سجل المعاملات المالية والقيود المحاسبية الأخيرة", {
        x: 0.5,
        y: 0.4,
        w: 12.3,
        h: 0.6,
        fontSize: 20,
        fontFace: "Arial",
        color: "FFFFFF",
        bold: true,
        align: "right"
      } as any);

      slide6.addText("القيود المسجلة يدويًا بدفتر الأستاذ العام لتتبع المداخيل والمصاريف الإدارية والتسويقية والمكتبية للشركة:", {
        x: 0.5,
        y: 1.1,
        w: 12.3,
        h: 0.4,
        fontSize: 12,
        fontFace: "Arial",
        color: "94A3B8",
        align: "right"
      } as any);

      const txTableRows: any[] = [
        [
          { text: "رمز القيد", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "بيان وتفاصيل العملية المالية", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "التاريخ", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "التصنيف المالي", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "النوع", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } },
          { text: "مبلغ القيد", options: { bold: true, color: "FFFFFF", fill: "1E293B", align: "center" } }
        ]
      ];

      transactions.slice(0, 7).forEach((t: any, idx: number) => {
        const catInfo = CATEGORIES_AR[t.category] || { label: t.category, color: "94a3b8" };
        const isExpense = t.type === "expense";

        txTableRows.push([
          { text: `#TXN-${t.id || idx + 500}`, options: { color: "8B5CF6", align: "center", bold: false } },
          { text: t.description || "-", options: { color: "E2E8F0", align: "right", bold: false } },
          { text: t.date || "-", options: { color: "CBD5E1", align: "center", bold: false } },
          { text: catInfo.label, options: { color: "CBD5E1", align: "center", bold: false } },
          { text: isExpense ? "مصروف" : "مقبوضات / وارد", options: { color: isExpense ? "EF4444" : "10B981", align: "center", bold: true } },
          { text: `${parseFloat(t.amount || 0).toFixed(1)} ر.ع`, options: { color: isExpense ? "EF4444" : "10B981", align: "center", bold: true } }
        ]);
      });

      if (transactions.length > 0) {
        slide6.addTable(txTableRows as any, {
          x: 0.5,
          y: 1.7,
          w: 12.3,
          colW: [1.5, 4.3, 1.8, 1.8, 1.5, 1.4],
          border: { pt: 1, color: "334155" },
          fontSize: 9.5,
          fontFace: "Arial"
        } as any);
      } else {
        slide6.addText("لا تتوفر قيود محاسبية مسجلة يدويًا في هذا الحساب حاليًا.", {
          x: 1.0,
          y: 3.2,
          w: 11.3,
          h: 0.8,
          fontSize: 14,
          fontFace: "Arial",
          color: "94A3B8",
          align: "center"
        } as any);
      }

      // Save presentation file
      pptx.writeFile({ fileName: `التقرير_المالي_التفصيلي_شومة_${new Date().toISOString().slice(0, 10)}.pptx` });
      
      toast({
        title: "تم استخراج التقرير بنجاح",
        description: "تم توليد وتنزيل كشف التقرير المالي التفصيلي والتدقيق المحاسبي كملف بوربوينت بجهازك بنجاح.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء توليد وعرض تقرير البوربوينت المالي.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16" dir="rtl">
      
      {/* Brand Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600/10 p-2.5 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Compass className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">شومة للمغامرات والسياحة</h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">الإدارة المالية</span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">النظام المحاسبي والمالي الموحد لإيرادات ومصروفات الشركة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportHotelsCSV}
              className="text-xs bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 font-medium px-4 py-1.5 rounded-xl transition-all duration-200 border border-sky-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" />
              تنزيل كشف الفنادق (CSV)
            </button>
            <button
              onClick={handleExportHikingCSV}
              className="text-xs bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 font-medium px-4 py-1.5 rounded-xl transition-all duration-200 border border-amber-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" />
              تنزيل كشف الهايكنق (CSV)
            </button>
            <button
              onClick={handleGenerateDetailedPPTXReport}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-1.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
            >
              <Presentation className="h-4 w-4" />
              تصدير التقرير المالي الشامل (PPTX)
            </button>
            <button
              onClick={async () => {
                if (window.confirm("هل أنت متأكد من رغبتك في حذف وتصفير جميع المعاملات المالية؟ لا يمكن التراجع عن هذا الإجراء.")) {
                  try {
                    const res = await fetch("/api/finance/transactions/all", { method: "DELETE" });
                    if (res.ok) {
                      queryClient.invalidateQueries({ queryKey: ["/api/finance/transactions"] });
                      toast({
                        title: "تم تصفير المعاملات المالية",
                        description: "تم مسح وتصفير كافة السجلات والمعاملات المالية بنجاح للبدء من جديد.",
                      });
                    } else {
                      toast({
                        title: "خطأ",
                        description: "فشل في تصفير المعاملات المالية",
                        variant: "destructive"
                      });
                    }
                  } catch (e) {
                    toast({
                      title: "خطأ",
                      description: "حدث خطأ أثناء الاتصال بالخادم للتصفير",
                      variant: "destructive"
                    });
                  }
                }
              }}
              className="text-xs bg-rose-950/40 hover:bg-rose-900 text-rose-200 hover:text-white px-3 py-1.5 rounded-xl border border-rose-800 transition-colors"
            >
              تصفير البيانات المالية
            </button>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              قاعدة البيانات متصلة وجاهزة
            </span>
            <button
              onClick={() => {
                try {
                  fetch('/api/portal-auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: email || "finance1@shouma.com",
                      name: "مسؤول المالية",
                      portalType: "finance",
                      portalName: "لوحة الإدارة المالية العامة"
                    })
                  }).catch(() => {});
                } catch (e) {}
                sessionStorage.removeItem("shouma_finance_auth");
                setIsAuthorized(false);
              }}
              className="text-xs bg-slate-800 hover:bg-red-950/30 hover:text-red-400 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700/60 transition-colors"
            >
              قفل الجلسة آمنًا
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* UPPER KPI CARDS PANEL */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-medium">إجمالي السيولة الواردة للمحفظة</p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">{companyTotalIncoming.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-300">ر.ع</span></h3>
                <p className="text-slate-500 text-[10px] mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  كامل عوائد حجوزات الهايكنج والفنادق (100٪)
                </p>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-sky-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-medium">صافي أرباح خزانة شومة</p>
                <h3 className={`text-3xl font-extrabold mt-2 font-mono ${netEarningsBalance >= 0 ? "text-sky-400" : "text-amber-500"}`}>
                  {netEarningsBalance.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 
                  <span className="text-xs font-normal text-slate-300"> ر.ع</span>
                </h3>
                <p className="text-slate-500 text-[10px] mt-2 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-sky-400" />
                  العمولات والمداخيل (15٪) بعد خصم النفقات
                </p>
              </div>
              <div className="bg-sky-500/10 p-3 rounded-2xl text-sky-400 border border-sky-500/20">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-violet-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-medium">مستحقات الشركاء للتسوية</p>
                <h3 className="text-3xl font-extrabold text-violet-400 mt-2 font-mono">{totalPartnerShare.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-300">ر.ع</span></h3>
                <p className="text-slate-500 text-[10px] mt-2 flex items-center gap-1">
                  <Percent className="h-3 w-3 text-violet-400" />
                  حصة الفنادق والمنظمين واجبة التوزيع (85٪)
                </p>
              </div>
              <div className="bg-violet-500/10 p-3 rounded-2xl text-violet-300 border border-violet-500/20">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-medium">النفقات والمصاريف التشغيلية</p>
                <h3 className="text-3xl font-extrabold text-red-400 mt-2 font-mono">{companyTotalExpenses.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-300">ر.ع</span></h3>
                <p className="text-slate-500 text-[10px] mt-2 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  رواتب إضافية، تسويق، تشغيل ومصاريف عامة
                </p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </div>

        </section>

        {/* TABS SELECTORBAR */}
        <section className="mt-8 bg-slate-900 p-2 rounded-2xl border border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 min-w-[130px] font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${activeTab === "dashboard" ? "bg-gradient-to-l from-emerald-600 to-sky-600 text-white shadow-md shadow-emerald-900/10" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            <PieIcon className="h-4 w-4" />
            لوحة الأداء وكشف الربحية
          </button>
          
          <button
            onClick={() => setActiveTab("hotels")}
            className={`flex-1 min-w-[130px] font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${activeTab === "hotels" ? "bg-gradient-to-l from-emerald-600 to-sky-600 text-white shadow-md shadow-emerald-900/10" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            <Building2 className="h-4 w-4" />
            توزيعات الفنادق الشريكة
          </button>

          <button
            onClick={() => setActiveTab("hiking")}
            className={`flex-1 min-w-[130px] font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${activeTab === "hiking" ? "bg-gradient-to-l from-emerald-600 to-sky-600 text-white shadow-md shadow-emerald-900/10" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            <Compass className="h-4 w-4" />
            إيرادات وحجوزات الهايكنج
          </button>

          <button
            onClick={() => setActiveTab("cashbook")}
            className={`flex-1 min-w-[130px] font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${activeTab === "cashbook" ? "bg-gradient-to-l from-emerald-600 to-sky-600 text-white shadow-md shadow-emerald-900/10" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            <Layers className="h-4 w-4" />
            مصاريف التشغيل وصندوق النقدية
          </button>
        </section>

        {/* TABS DETAILED OUTPUT AREA */}
        <section className="mt-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DASHBOARD AND CHARTS */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Visual Charts section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Bar Chart element */}
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-md font-bold text-slate-100">الموازنة الكلية ومقارنة المحفظة المالية</h4>
                        <p className="text-slate-400 text-xs mt-1">توزيع الإيرادات المحققة تلقائياً والمصروفات المسجلة</p>
                      </div>
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg border border-slate-700">بيانات تراكمية حية</span>
                    </div>

                    <div className="h-80 w-full font-mono text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incomeVsExpenseData} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", fontFamily: "sans-serif" }} 
                            formatter={(value) => [`${value} ر.ع`, ""]}
                          />
                          <Legend wrapperStyle={{ fontFamily: "sans-serif" }} />
                          <Bar dataKey="المداخيل" fill="#10b981" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="المصاريف" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Expense Breakdown Pie Chart */}
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                    <div className="mb-6">
                      <h4 className="text-md font-bold text-slate-100">تقسيم محفظة التكاليف</h4>
                      <p className="text-slate-400 text-xs mt-1">المصروفات التشغيلية مصنفة حسب الأبواب</p>
                    </div>

                    {expenseChartData.length === 0 ? (
                      <div className="h-64 flex flex-col justify-center items-center text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                        <PieIcon className="h-10 w-10 text-slate-600 mb-2" />
                        <span className="text-xs">لا يوجد مصروفات إضافية مسجلة بعد</span>
                        <p className="text-[10px] text-slate-600 mt-1">سجل مصروفاً جديداً في صندوق النقدية لعرض هيكليته هنا</p>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between items-center h-full">
                        <div className="h-52 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={expenseChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={75}
                                paddingAngle={4}
                                dataKey="val"
                              >
                                {expenseChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", fontFamily: "sans-serif" }}
                                formatter={(value) => [`${value} ر.ع`, ""]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Legend breakdown list */}
                        <div className="w-full space-y-2 mt-2">
                          {expenseChartData.map((entry, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-300">{entry.name}</span>
                              </div>
                              <span className="font-mono text-slate-300 font-bold">{entry.val} ر.ع</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Monthly Profit and Revenue Line Chart */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-md font-bold text-slate-100">تحليل اتجاهات الأرباح والإيرادات الشهرية</h4>
                      <p className="text-slate-400 text-xs mt-1">مخطط خطي يوضح نمو صافي الأرباح والإيرادات مقارنة بالمصروفات التشغيلية بناءً على الحجوزات المقبولة</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">نمو تراكمي شهري</span>
                  </div>

                  <div className="h-80 w-full font-mono text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrendData} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc", fontFamily: "sans-serif" }} 
                          formatter={(value) => [`${value} ر.ع`, ""]}
                        />
                        <Legend wrapperStyle={{ fontFamily: "sans-serif" }} />
                        <Line 
                          type="monotone" 
                          dataKey="الأرباح" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="الإيرادات" 
                          stroke="#0ea5e9" 
                          strokeWidth={2} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="المصاريف" 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Audit Log / General Balance sheet summary */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-md font-bold text-slate-100">تفصيل السيولة وتوزيع المبالغ في قسم الإدارة المالية</h4>
                      <p className="text-slate-400 text-xs mt-1">كشف بحركة النقد الكاملة الواردة إلى محفظة الشركة وطريقة تفصيلها للمستفيدين</p>
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      تصدير / طباعة الكشف المالي
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    
                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        السيولة الكلية المستلمة بمحفظة الشركة (100٪)
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400">كامل عوائد حجوزات الهايكنج (المستلمة مباشرة)</span>
                          <span className="font-mono text-sm text-emerald-400 font-bold">{totalHikingBookingsRev.toFixed(1)} ر.ع</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400">كامل عوائد حجوزات الفنادق (المستلمة مباشرة)</span>
                          <span className="font-mono text-sm text-emerald-400 font-bold">{totalHotelBookingsRev.toFixed(1)} ر.ع</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400">مقبوضات وحوالات مالية يدوية إضافية</span>
                          <span className="font-mono text-sm text-emerald-400 font-bold">{manualIncomes.toFixed(1)} ر.ع</span>
                        </div>
                        <div className="flex justify-between p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 font-bold">
                          <span className="text-xs text-emerald-300">مجموع المقبوضات الكلي بمحفظة الشركة</span>
                          <span className="font-mono text-md text-emerald-400">{companyTotalIncoming.toFixed(1)} ر.ع</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        التفصيل والتقسيم المعتمد بقسم المالية (ر.ع)
                      </h5>

                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400">صافي حصة الفنادق واجبة التوزيع والتسوية (85٪)</span>
                          <span className="font-mono text-sm text-violet-400 font-bold">
                            {partnerHotelsShare.toFixed(1)} ر.ع
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400">صافي حصة منظمي ومرشدي الهايكنج للتسوية (85٪)</span>
                          <span className="font-mono text-sm text-violet-400 font-bold">
                            {(totalHikingBookingsRev * 0.85).toFixed(1)} ر.ع
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400">صافي عمولات منصة شومة من كافة الحجوزات (15٪)</span>
                          <span className="font-mono text-sm text-sky-400 font-bold">
                            {((totalHikingBookingsRev * 0.15) + shoumaHotelCommissions).toFixed(1)} ر.ع
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400">إجمالي النفقات والمصاريف التشغيلية والإدارية</span>
                          <span className="font-mono text-sm text-red-400 font-bold">
                            {companyTotalExpenses.toFixed(1)} ر.ع
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-sky-500/5 rounded-xl border border-sky-500/20 font-bold">
                          <span className="text-xs text-sky-300">صافي أرباح المنصة المتبقية بالخزينة</span>
                          <span className="font-mono text-md text-sky-400">{netEarningsBalance.toFixed(1)} ر.ع</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: PARTNER HOTELS SPLIT CALCULATOR */}
            {activeTab === "hotels" && (
              <motion.div
                key="hotels-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Pending Hotel Registrations Section */}
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-md space-y-4 text-right dir-rtl font-sans">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                    <Building2 className="w-5 h-5 text-amber-500 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-black text-white">طلبات الفنادق المعلقة مالياً (بانتظار تحديد نسبة الشراكة)</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        هذه الفنادق والمنتجعات قامت بالتسجيل بنفسها وبانتظار تحديد نسبة شركة شومة من الأرباح (العمولة) لتجهيزها لموافقة الإدارة العليا.
                      </p>
                    </div>
                  </div>

                  {pendingFinanceHotels.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/20 border border-dashed border-slate-850 rounded-2xl">
                      🎉 لا توجد طلبات تسجيل معلقة مالياً حالياً. جميع الطلبات مراجعة!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingFinanceHotels.map((hotel: any) => (
                        <div key={hotel.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                قيد المراجعة المالية
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ID: {hotel.id}
                              </span>
                            </div>
                            <h5 className="text-xs font-black text-white">{hotel.name_ar || hotel.nameAr || hotel.name}</h5>
                            <p className="text-[10px] text-slate-400 font-sans line-clamp-1">{hotel.description || "لا يوجد وصف."}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-500 font-sans pt-1">
                              <span>📍 {hotel.city || hotel.location}</span>
                              <span>📞 {hotel.phone || "غير محدد"}</span>
                              <span>✉️ {hotel.email}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-900 pt-3">
                            {selectedPendingHotel?.id === hotel.id ? (
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-300 block">حدد نسبة عمولة منصة شومة (%):</label>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={commissionPct}
                                    onChange={e => setCommissionPct(e.target.value)}
                                    placeholder="%"
                                    className="w-16 h-8 bg-slate-900 border border-slate-800 text-xs text-center text-white rounded-lg font-mono font-bold"
                                  />
                                  <div className="flex-1 text-[10px] text-slate-400 self-center">
                                    حصة شومة: <strong className="text-emerald-400 font-bold">{commissionPct}%</strong> • حصة الفندق: <strong className="text-violet-400 font-bold">{100 - (parseFloat(commissionPct) || 0)}%</strong>
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => handleSetCommission(hotel.id)}
                                    disabled={isSubmittingCommission}
                                    className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg transition cursor-pointer text-white"
                                  >
                                    {isSubmittingCommission ? "جاري الاعتماد..." : "تأكيد وإرسال للمدير العام"}
                                  </button>
                                  <button
                                    onClick={() => setSelectedPendingHotel(null)}
                                    className="px-3 h-8 border border-slate-850 text-slate-400 hover:text-white rounded-lg text-[10px] cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedPendingHotel(hotel);
                                  setCommissionPct("15");
                                }}
                                className="w-full h-8 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/10 hover:border-emerald-500/30 text-[10px] font-bold rounded-lg transition cursor-pointer"
                              >
                                ⚙️ تحديد نسبة الشراكة والعمولة
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <h4 className="text-md font-bold text-slate-100">سجل عوائد وتوزيع شراكات الفنادق المعززة</h4>
                      <p className="text-slate-400 text-xs mt-1">كشف بحجوزات الزبائن ونسب توزيع الأرباح تلقائياً لصالح شومة والفندق الشريك</p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs flex gap-4">
                      <div>
                        <span className="text-slate-400">عمولة شركة شومة (15%): </span>
                        <span className="font-mono font-bold text-emerald-400 mr-1">{shoumaHotelCommissions.toFixed(1)} ر.ع</span>
                      </div>
                      <div className="border-r border-slate-700 pr-4">
                        <span className="text-slate-400">مستحقات الفنادق الثابتة: </span>
                        <span className="font-mono font-bold text-violet-400 mr-1">{partnerHotelsShare.toFixed(1)} ر.ع</span>
                      </div>
                    </div>
                  </div>

                  {isLoadingHotels ? (
                    <div className="text-center py-12 text-slate-500 text-xs">جاري تحميل بيانات الفنادق الشريكة...</div>
                  ) : hotelBookings.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
                      <Building2 className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                      <span className="text-xs">لا يوجد أي حجوزات فنادق مسجلة في قاعدة البيانات حالياً.</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-medium">
                            <th className="pb-3 pl-4">كود الحجز</th>
                            <th className="pb-3 text-white">الفندق الشريك</th>
                            <th className="pb-3">الغرفة المحجوزة</th>
                            <th className="pb-3">اسم الزبون والهاتف</th>
                            <th className="pb-3 text-center">الليالي</th>
                            <th className="pb-3 text-left">مبلغ الحجز الكامل</th>
                            <th className="pb-3 text-left text-emerald-400">عمولة شومة (١٥٪)</th>
                            <th className="pb-3 text-left text-violet-300">مستحقات الفندق (٨٥٪)</th>
                            <th className="pb-3 text-center">بوابة السداد</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium">
                          {hotelBookings.map((b, index) => {
                            const totalAmount = parseFloat(b.total_price || b.totalPrice || 0);
                            const shoumaPct = b.split_shouma_pct !== undefined ? b.split_shouma_pct : 15;
                            const hotelPct = b.split_hotel_pct !== undefined ? b.split_hotel_pct : 85;
                            const shoumaShare = totalAmount * (shoumaPct / 100);
                            const hotelShare = totalAmount * (hotelPct / 100);

                            return (
                              <tr key={b.id || index} className="text-slate-300 hover:bg-slate-900/40">
                                <td className="py-4 pl-4 text-slate-500 font-mono">#HTL-{b.id || index + 100}</td>
                                <td className="py-4 text-white font-semibold flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                  {b.hotel_name || b.hotelName}
                                </td>
                                <td className="py-4">{b.room_name || b.roomName || "غرفة قياسية"}</td>
                                <td className="py-4">
                                  <div className="text-white">{b.full_name || b.fullName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{b.phone}</div>
                                </td>
                                <td className="py-4 text-center font-mono">{b.nights || 1} ليالٍ</td>
                                <td className="py-4 text-left font-mono text-white font-bold">{totalAmount.toFixed(1)} ر.ع</td>
                                <td className="py-4 text-left font-mono text-emerald-400 font-bold">
                                  {shoumaShare.toFixed(1)} ر.ع 
                                  <span className="text-[9px] text-slate-500 block">({shoumaPct}٪)</span>
                                </td>
                                <td className="py-4 text-left font-mono text-violet-300 font-bold">
                                  {hotelShare.toFixed(1)} ر.ع 
                                  <span className="text-[9px] text-slate-500 block">({hotelPct}٪)</span>
                                </td>
                                <td className="py-4 text-center text-[10px]">
                                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                                    {b.payment_gateway || b.paymentGateway || "بطاقة ائتمانية"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. Hotel Financial Ledger (Individual dashboard page for each hotel) */}
                <div id="hotel-financial-ledger-section" className="space-y-6 text-right mt-12 font-sans dir-rtl">
                  <div className="border-b border-slate-800 pb-3 text-right">
                    <h3 className="text-base font-black text-white flex items-center gap-2 justify-end">
                      <Building className="w-5 h-5 text-sky-400" /> الملفات المالية المستقلة للفنادق المدرجة
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-1">اختر أي فندق أدناه لفتح صفحته المالية الفردية لمراقبة مستحقاته وطلبات حجوزاته بالتفصيل وتسوية حسابه</p>
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
                            b.hotel_id?.toString() === h.id || 
                            b.hotelId?.toString() === h.id ||
                            (b.hotel_name && b.hotel_name.includes(h.name)) ||
                            (h.name && h.name.includes(b.hotel_name))
                          ).length;

                          return (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => setSelectedHotelFinanceId(h.id)}
                              className={`w-full p-3 rounded-xl text-right flex flex-col gap-1 transition-all cursor-pointer ${
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
                                    toast({
                                      title: "✅ تم تسوية الحساب بنجاح",
                                      description: `تم تسوية وتحويل مبلغ ${selectedHotelDueAmount.toFixed(3)} ر.ع بنجاح لحساب ${selectedHotelObj.name} عبر شومة باي!`
                                    });
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
                                <span className="text-[10px] text-slate-400 font-semibold block">اقتطاع عمولة شومة ({selectedHotelObj.splitShoumaPct}%)</span>
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
                                <Layers className="w-4 h-4 text-sky-400" /> الحجوزات والمعاملات المسجلة للفندق ({selectedHotelBookings.length})
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
                                          <span className="text-white font-bold">{b.fullName || b.full_name}</span>
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
                                            href={`tel:${b.phone}`} 
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
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 font-sans">
                          <Building2 className="w-16 h-16 text-slate-700 mx-auto animate-bounce" />
                          <h4 className="font-bold text-slate-300 text-sm">بوابة صفحات الفنادق المستقلة (المالية)</h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                            انقر على الفندق من القائمة الجانبية اليمنى لعرض حصصه الحية ومستحقاته المالية، سجل حجوزاته الفورية، والتحكم بعمليات تحويل وصرف صافيه المالي.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: HIKING REVENUE */}
            {activeTab === "hiking" && (
              <motion.div
                key="hiking-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <h4 className="text-md font-bold text-slate-100">سجل عوائد الهايكنج والمغامرات الجبلية المباشرة</h4>
                      <p className="text-slate-400 text-xs mt-1">سجل مالي مفصل للرحلات المحجوزة عبر بوابات دفع شومة الفورية والمدفوعة بالكامل لصالح الشركة</p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs flex gap-2 items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Compass className="h-4 w-4 text-sky-450" />
                        إجمالي صندوق الهايكنج: 
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{totalHikingBookingsRev} ر.ع</span>
                    </div>
                  </div>

                  {isLoadingHiking ? (
                    <div className="text-center py-12 text-slate-500 text-xs">جاري استرجاع حجوزات المغامرات...</div>
                  ) : hikingBookings.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
                      <Compass className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                      <span className="text-xs">لا يوجد أي حجوزات هايكنج مسجلة حالياً في النظام الحسابي.</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-medium">
                            <th className="pb-3 pl-4">الرقم المرجعي</th>
                            <th className="pb-3 text-white">رحلة الهايكنج</th>
                            <th className="pb-3">تاريخ المغامرة</th>
                            <th className="pb-3">الزبون المسجل</th>
                            <th className="pb-3">معلومات التواصل</th>
                            <th className="pb-3 text-center">عدد المشاركين</th>
                            <th className="pb-3 text-left">المبلغ الكامل (100%)</th>
                            <th className="pb-3 text-left text-emerald-400">عمولة المنصة (15%)</th>
                            <th className="pb-3 text-left text-sky-300">حصة المرشد (85%)</th>
                            <th className="pb-3 text-center">بوابة السداد</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                          {hikingBookings.map((b, index) => {
                            const amt = parseFloat(b.paid_amount || b.paidAmount || 0);
                            const shoumaShare = amt * 0.15;
                            const guidesShare = amt * 0.85;

                            return (
                              <tr key={b.id || index} className="hover:bg-slate-900/40">
                                <td className="py-4 pl-4 text-slate-500 font-mono">#HIK-{b.id || index + 200}</td>
                                <td className="py-4 text-white font-semibold flex items-center gap-1.5">
                                  <Compass className="h-3.5 w-3.5 text-sky-400" />
                                  {b.trip_name || b.tripName}
                                </td>
                                <td className="py-4 font-mono">{b.booking_date || b.bookingDate}</td>
                                <td className="py-4 text-white font-semibold">{b.full_name || b.fullName}</td>
                                <td className="py-4 font-mono">
                                  <div>{b.phone}</div>
                                  <div className="text-[10px] text-slate-500">{b.email}</div>
                                </td>
                                <td className="py-4 text-center font-mono">{b.attendees || 1} أشخاص</td>
                                <td className="py-4 text-left font-mono text-white font-bold">{amt.toFixed(1)} ر.ع</td>
                                <td className="py-4 text-left font-mono text-emerald-400 font-bold">{shoumaShare.toFixed(1)} ر.ع</td>
                                <td className="py-4 text-left font-mono text-sky-300 font-bold">{guidesShare.toFixed(1)} ر.ع</td>
                                <td className="py-4 text-center text-[10px]">
                                  <span className="bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded border border-slate-700">
                                    {b.payment_gateway || b.paymentGateway || "فيزا/ماستركارد"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: MANUAL CASH Ledger OF OPERATIONAL EXTRA EXPENSES */}
            {activeTab === "cashbook" && (
              <motion.div
                key="cashbook-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-6"
              >
                
                {/* Form to insert manual entries */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 h-fit xl:col-span-1">
                  <div className="border-b border-slate-800 pb-4 mb-4">
                    <h4 className="text-md font-bold text-slate-100">تسجيل حركة نقدية جديدة في الصندوق</h4>
                    <p className="text-slate-400 text-xs mt-1">إضافة أجور مرشدين سياحيين، خدمات ترويجية، شراء حبال أو مداخيل استثنائية يدوياً</p>
                  </div>

                  <form onSubmit={handleCreateTx} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">نوع العملية المالية</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTxType("expense")}
                          className={`flex-1 py-2 rounded-xl font-bold border transition-all ${txType === "expense" ? "bg-red-500/10 text-red-400 border-red-500/40" : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"}`}
                        >
                          مصروفات (خارجة)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTxType("income")}
                          className={`flex-1 py-2 rounded-xl font-bold border transition-all ${txType === "income" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40" : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"}`}
                        >
                          إيرادات (داخلة)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="txCategory" className="block text-slate-300 font-medium mb-1.5">التبويب المالي</label>
                        <select
                          id="txCategory"
                          value={txCategory}
                          onChange={(e) => setTxCategory(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                        >
                          {Object.entries(CATEGORIES_AR).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="txAmount" className="block text-slate-300 font-medium mb-1.5">المبلغ المالي (ر.ع)</label>
                        <input
                          id="txAmount"
                          type="number"
                          step="0.1"
                          placeholder="مثال: 55.0"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                          className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="txDate" className="block text-slate-300 font-medium mb-1.5">تاريخ المعاملة الحسابية</label>
                      <input
                        id="txDate"
                        type="date"
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="txDescription" className="block text-slate-300 font-medium mb-1.5">البيان والوصف التفصيلي</label>
                      <textarea
                        id="txDescription"
                        placeholder="ما هو سبب هذا المصروف أو الدخل؟ اكتب تفاصيل واضحة لمدير التدقيق"
                        value={txDescription}
                        onChange={(e) => setTxDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={createTxMutation.isPending}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Plus className="h-4 w-4" />
                      {createTxMutation.isPending ? "جاري الحفظ في الخزانة..." : "إدراج وتسجيل بالدفاتر المحاسبية"}
                    </button>
                  </form>
                </div>

                {/* List of general Ledger transactions */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 xl:col-span-2">
                  <div className="border-b border-slate-800 pb-4 mb-4">
                    <h4 className="text-md font-bold text-slate-100">كشف وتفاصيل صندوق النقدية اليدوي للشركة</h4>
                    <p className="text-slate-400 text-xs mt-1">يحتوي على كافة الحركات المسجلة يدويا لمتابعة أجور الكادر، التسويق والمصاريف المكتبية اليومية</p>
                  </div>

                  {isLoadingTx ? (
                    <div className="text-center py-12 text-slate-500 text-xs">جاري تفحص سجلات الدفتر المحاسبي...</div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
                      <Receipt className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                      <span className="text-xs">الدفتر الحسابي اليدوي فارغ حالياً.</span>
                      <p className="text-[10px] text-slate-600 mt-1">استخدم النموذج في الجانب الأيمن لإضافة أول حركة مالية بالصندوق.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-medium">
                            <th className="pb-3 pl-4">كود القيد</th>
                            <th className="pb-3 text-white">التاريخ والبيان</th>
                            <th className="pb-3">التبويب الفرعي</th>
                            <th className="pb-3 text-left">التدفق المالي</th>
                            <th className="pb-3 text-center">أدوات إدارية</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                          {transactions.map((t, idx) => {
                            const isExpense = t.type === "expense";
                            const catInfo = CATEGORIES_AR[t.category] || { label: t.category, color: "#94a3b8" };
                            
                            return (
                              <tr key={t.id || idx} className="hover:bg-slate-900/40">
                                <td className="py-4 pl-4 text-slate-500 font-mono">#TXN-{t.id || idx + 500}</td>
                                <td className="py-4">
                                  <div className="text-white font-semibold">{t.description}</div>
                                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                    <Calendar className="h-3 w-3" />
                                    {t.date}
                                  </div>
                                </td>
                                <td className="py-4">
                                  <span 
                                    className="px-2.5 py-0.5 rounded-full text-[10px] border font-bold"
                                    style={{ 
                                      backgroundColor: `${catInfo.color}10`, 
                                      borderColor: `${catInfo.color}35`, 
                                      color: catInfo.color 
                                    }}
                                  >
                                    {catInfo.label}
                                  </span>
                                </td>
                                <td className={`py-4 text-left font-mono font-bold text-md ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
                                  {isExpense ? "-" : "+"}
                                  {parseFloat(t.amount || 0).toFixed(1)} ر.ع
                                </td>
                                <td className="py-4 text-center">
                                  <button
                                    onClick={() => {
                                      if (confirm("هل أنت متأكد من حذف هذا القيد المحاسبي بشكل نهائي من الدفاتر؟")) {
                                        deleteTxMutation.mutate(t.id);
                                      }
                                    }}
                                    className="p-1.5 bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 border border-slate-700 hover:border-red-500/20 transition-all cursor-pointer"
                                    title="حذف القيد المالي"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

    </div>
  );
}
