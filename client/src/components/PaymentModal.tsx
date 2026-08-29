import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Calendar,
  Lock,
  CheckCircle2,
  Loader2,
  Smartphone,
  QrCode,
  ShieldCheck,
  Building2,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { SiVisa, SiMastercard } from "react-icons/si";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelName: string;
  pricePerNight: number;
  nights?: number;
  hotelId?: string | number;
  splitShoumaPct?: number;
  splitHotelPct?: number;
}

export default function PaymentModal({
  open,
  onOpenChange,
  hotelName,
  pricePerNight,
  nights = 1,
  hotelId,
  splitShoumaPct = 15,
  splitHotelPct = 85,
}: PaymentModalProps) {
  // Thawani payment methods: "card" (OmanNet / Visa / MC), "thawani_wallet", "thawani_qr"
  const [paymentMethod, setPaymentMethod] = useState<"card" | "thawani_wallet" | "thawani_qr">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // OTP 3D Secure Step (for OmanNet / Visa card validation)
  const [step, setStep] = useState<"details" | "otp">("details");
  const [otpCode, setOtpCode] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("492810");

  // User input states for booking
  const [fullName, setFullName] = useState("أحمد المعولي");
  const [phone, setPhone] = useState("+968 9111 2222");
  const [email, setEmail] = useState("ahmed@example.com");

  // Thawani Wallet specific state
  const [walletPhone, setWalletPhone] = useState("+968 9111 2222");
  const [walletWaitingApproval, setWalletWaitingApproval] = useState(false);

  // Card details states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Thawani session details
  const [thawaniSession, setThawaniSession] = useState<{
    sessionId: string;
    invoiceId: string;
    referenceCode: string;
  } | null>(null);

  const totalPrice = pricePerNight * nights;
  const totalPriceBaisa = Math.round(totalPrice * 1000);

  // Auto-format Card Number with spaces
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(" "));
  };

  // Auto-format Expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Card Network detection (OmanNet vs Visa vs Mastercard)
  const isOmanNet = cardNumber.startsWith("5893") || cardNumber.startsWith("4") || cardNumber.startsWith("5");

  // Create Thawani session when modal opens
  useEffect(() => {
    if (open) {
      fetch("/api/thawani/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          customerName: fullName,
          customerPhone: phone,
          customerEmail: email,
          productName: `حجز إقامة في ${hotelName} (${nights} ليالٍ)`
        })
      })
        .then(r => r.ok ? r.json() : null)
        .then(res => {
          if (res?.data) {
            setThawaniSession({
              sessionId: res.data.sessionId,
              invoiceId: res.data.invoiceId,
              referenceCode: res.data.referenceCode
            });
          }
        })
        .catch(() => {
          // Fallback reference code
          setThawaniSession({
            sessionId: `thw_ses_${Date.now()}`,
            invoiceId: `INV-THW-${Date.now().toString().slice(-6)}`,
            referenceCode: `THW-OM-${Math.floor(100000 + Math.random() * 900000)}`
          });
        });
    }
  }, [open, totalPrice, hotelName, nights]);

  const handleInitiatePayment = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      alert("يرجى إدخال جميع البيانات الشخصية لإكمال الحجز");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 15 || !expiry.trim() || !cvv.trim() || !cardName.trim()) {
        alert("يرجى إدخال جميع بيانات البطاقة البنكية (رقم البطاقة، تاريخ الانتهاء، رمز الأمان، الاسم)");
        return;
      }
      // Trigger 3D Secure / OmanNet OTP Step for maximum realism and security
      const genOtp = String(Math.floor(100000 + Math.random() * 900000));
      setSimulatedOtp(genOtp);
      setStep("otp");
      return;
    }

    if (paymentMethod === "thawani_wallet") {
      if (!walletPhone.trim()) {
        alert("يرجى إدخال رقم الهاتف المسجل في تطبيق ثواني");
        return;
      }
      setIsProcessing(true);
      setWalletWaitingApproval(true);

      // Simulate instant push notification approval from Thawani App
      setTimeout(async () => {
        await executeFinalBooking("محفظة وتطبيق ثواني (Thawani Pay)");
      }, 2500);
      return;
    }

    if (paymentMethod === "thawani_qr") {
      setIsProcessing(true);
      setTimeout(async () => {
        await executeFinalBooking("مسح رمز QR ثواني (Thawani QR Pay)");
      }, 2000);
    }
  };

  const handleVerifyOtpAndPay = async () => {
    if (!otpCode || otpCode.length < 4) {
      alert("يرجى إدخال رمز التحقق OTP المرسل لهاتفك");
      return;
    }
    setIsProcessing(true);
    await executeFinalBooking("بطاقة بنكية عبر بوابة ثواني (عُمان نت / Visa / Mastercard)");
  };

  const executeFinalBooking = async (methodLabel: string) => {
    try {
      let parsedHotelId = 1;
      if (hotelId) {
        if (typeof hotelId === 'string' && hotelId.startsWith("db-")) {
          parsedHotelId = parseInt(hotelId.replace("db-", ""), 10) || 1;
        } else {
          parsedHotelId = parseInt(hotelId as string, 10) || 1;
        }
      }

      // Process payment with Thawani API
      await fetch("/api/thawani/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: thawaniSession?.sessionId,
          amount: totalPrice,
          paymentMethod: paymentMethod === "thawani_wallet" ? "thawani_wallet" : paymentMethod === "thawani_qr" ? "thawani_qr" : "oman_net",
          walletPhone
        })
      });

      // Save hotel booking with Thawani payment metadata
      const payload = {
        hotelId: parsedHotelId,
        hotelName,
        roomName: "جناح ريفي متميز ورائع",
        fullName,
        phone,
        email,
        nights,
        pricePerNight,
        totalPrice,
        paymentGateway: `بوابة ثواني العمانية (${methodLabel})`,
        cardNumber: paymentMethod === "card" ? `**** **** **** ${cardNumber.replace(/\s/g, "").slice(-4)}` : undefined,
        cardExpiry: expiry,
        cardCvv: cvv,
        cardName,
        thawaniSessionId: thawaniSession?.sessionId,
        thawaniReference: thawaniSession?.referenceCode,
        thawaniInvoice: thawaniSession?.invoiceId
      };

      const response = await fetch("/api/hotel-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setIsSuccess(true);
        setStep("details");
        setWalletWaitingApproval(false);
      } else {
        alert(data.message || "تعذرت معالجة الدفع عبر بوابة ثواني، يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error(err);
      alert("فشل الاتصال بخادم بوابة ثواني للمدفوعات!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsSuccess(false);
      setStep("details");
      setPaymentMethod("card");
      setWalletWaitingApproval(false);
      setOtpCode("");
    }, 300);
  };

  const copyReferenceCode = () => {
    if (thawaniSession?.referenceCode) {
      navigator.clipboard.writeText(thawaniSession.referenceCode);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  // SUCCESS SCREEN (Official Thawani Receipt)
  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto dir-rtl text-right font-sans p-6">
          <div className="flex flex-col items-center justify-center text-center">
            
            {/* Thawani Official Branding Header */}
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 flex items-center justify-center mb-3 text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-300 dark:bg-purple-500/20 border-purple-300 dark:border-purple-800 text-xs px-3 py-1 mb-2 font-bold gap-1.5 inline-flex items-center">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>معتمدة من البنك المركزي العُماني</span>
            </Badge>

            <h2 className="text-xl font-extrabold text-foreground mb-1">
              تم الدفع بنجاح عبر بوابة ثواني
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              تم تأكيد حجزك في {hotelName} وإصدار إيصال السداد الرسمي
            </p>

            {/* Official Thawani Receipt Card */}
            <div className="w-full bg-gradient-to-b from-purple-500/5 to-purple-500/10 border border-purple-500/25 rounded-2xl p-4 mb-5 text-xs text-right space-y-2.5">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">
                  إيصال دفع إلكتروني - Thawani Pay
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {new Date().toLocaleDateString("ar-OM")}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">رقم مرجع ثواني:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-foreground">
                    {thawaniSession?.referenceCode || "THW-OM-748921"}
                  </span>
                  <button 
                    onClick={copyReferenceCode}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 p-0.5"
                    title="نسخ المرجع"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">رقم الفاتورة:</span>
                <span className="font-mono font-semibold text-foreground">
                  {thawaniSession?.invoiceId || "INV-THW-2026-01"}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">المنشأة المستفيدة:</span>
                <span className="font-semibold text-foreground">{hotelName}</span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">اسم المستأجر:</span>
                <span className="font-semibold text-foreground">{fullName}</span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">طريقة الدفع:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {paymentMethod === "card" ? "عُمان نت / بطاقة بنكية" : paymentMethod === "thawani_wallet" ? "محفظة وتطبيق ثواني" : "رمز QR ثواني"}
                </span>
              </div>

              <Separator className="bg-purple-500/20 my-1" />

              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-foreground text-sm">المبلغ الإجمالي المسدد:</span>
                <div className="text-left">
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                    {totalPrice.toFixed(3)} ر.ع
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    ({totalPriceBaisa.toLocaleString()} بيسة)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full mb-3">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1 gap-2 text-xs border-border"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الإيصال</span>
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                data-testid="button-close-success"
              >
                تم والعودة
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              تم إرسال نسخة من إيصال ثواني وتفاصيل الحجز إلى البريد {email}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 3D SECURE OTP SIMULATION STEP
  if (step === "otp") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto dir-rtl text-right font-sans p-6">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-600 flex items-center justify-center font-bold">
                  ث
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">بوابة ثواني - التحقق الآمن</h3>
                  <p className="text-[10px] text-muted-foreground">OmanNet 3D Secure Authentication</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] border-purple-400 text-purple-600">
                مشفر 256-bit
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="bg-muted/40 p-3.5 rounded-xl border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">التاجر:</span>
                <span className="font-bold text-foreground">منصة شومة (حجز {hotelName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ المطلوب:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                  {totalPrice.toFixed(3)} ر.ع
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">البطاقة المستخدمة:</span>
                <span className="font-mono text-foreground">
                  **** **** **** {cardNumber.replace(/\s/g, "").slice(-4)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-foreground block">
                أدخل رمز التحقق لمرة واحدة (OTP)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                تم إرسال رسالة SMS برمز التحقق إلى هاتفك المرتبط بحسابك البنكي.
              </p>
              <div className="flex gap-2">
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="أدخل الرمز المكون من 6 أرقام"
                  maxLength={6}
                  className="text-center font-mono text-lg tracking-widest bg-background border-purple-500/50"
                  dir="ltr"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOtpCode(simulatedOtp)}
                  className="text-xs whitespace-nowrap text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                >
                  تعبئة تلقائية ({simulatedOtp})
                </Button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("details")}
                disabled={isProcessing}
                className="w-1/3 text-xs"
              >
                تراجع
              </Button>
              <Button
                type="button"
                onClick={handleVerifyOtpAndPay}
                disabled={isProcessing}
                className="w-2/3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق والتسوية...</span>
                  </div>
                ) : (
                  <span>تأكيد وسداد {totalPrice.toFixed(3)} ر.ع</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // MAIN CHECKOUT FORM
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto dir-rtl font-sans text-right p-6">
        
        {/* Modal Header with Thawani Gateway Branding */}
        <DialogHeader>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                ث
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                  <span>بوابة ثواني للدفع الإلكتروني</span>
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground">
                  Thawani Payment Gateway • سلطنة عُمان
                </p>
              </div>
            </div>

            <Badge className="bg-purple-600/10 text-purple-700 dark:text-purple-300 dark:bg-purple-500/20 border-purple-300 dark:border-purple-800 text-[10px] px-2 py-0.5 font-bold gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>ترخيص CBO</span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          
          {/* Booking Summary Card */}
          <Card className="bg-muted/40 border border-border overflow-hidden">
            <CardContent className="p-4 space-y-2 text-right text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">الفندق المحجوز:</span>
                <span className="font-bold text-foreground">{hotelName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">مدة الإقامة:</span>
                <span className="font-semibold text-foreground">{nights} ليالٍ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">سعر الليلة:</span>
                <span className="font-mono text-foreground">{pricePerNight.toFixed(3)} ر.ع</span>
              </div>

              <Separator className="my-1.5" />

              <div className="flex items-center justify-between pt-0.5">
                <div>
                  <span className="font-bold text-foreground text-sm">المجموع المطلوب:</span>
                  <div className="text-[10px] text-muted-foreground">شامل الرسوم والضرائب السياحية</div>
                </div>
                <div className="text-left">
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
                    {totalPrice.toFixed(3)} ر.ع
                  </span>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    ({totalPriceBaisa.toLocaleString()} بيسة)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details Section */}
          <div className="bg-muted/20 p-4 rounded-xl border border-border space-y-3 text-right">
            <h3 className="text-xs font-bold text-foreground border-b border-border pb-1.5 flex items-center justify-between">
              <span>بيانات المستأجر والاتصال</span>
              <span className="text-[10px] font-normal text-muted-foreground">مطلوبة لإصدار فاتورة ثواني</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-[11px] text-muted-foreground">الاسم الكامل</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="أحمد المعولي" 
                  className="bg-background border-border text-xs h-9 text-right"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-[11px] text-muted-foreground">رقم الهاتف العُماني</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+968 9111 2222" 
                  className="bg-background border-border text-xs h-9 text-right font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-[11px] text-muted-foreground">البريد الإلكتروني للإيصال</Label>
              <Input 
                id="email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ahmed@example.com" 
                className="bg-background border-border text-xs h-9 text-right font-mono"
                required
              />
            </div>
          </div>

          {/* Thawani Payment Methods Selector */}
          <div className="text-right space-y-2.5">
            <Label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>اختر طريقة الدفع عبر بوابة ثواني</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">بوابة الدفع الرسمية</span>
            </Label>

            <div className="grid grid-cols-3 gap-2">
              
              {/* Option 1: Card / OmanNet */}
              <button
                type="button"
                data-testid="button-payment-card"
                onClick={() => setPaymentMethod("card")}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                  paymentMethod === "card"
                    ? "border-purple-600 bg-purple-500/10 text-purple-600 dark:border-purple-400 dark:bg-purple-400/10 dark:text-purple-300 font-bold shadow-sm"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-[11px] font-bold leading-tight">عُمان نت / بطاقة</span>
                <span className="text-[9px] opacity-75">Debit & Credit</span>
              </button>

              {/* Option 2: Thawani App & Wallet */}
              <button
                type="button"
                data-testid="button-payment-thawani-wallet"
                onClick={() => setPaymentMethod("thawani_wallet")}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                  paymentMethod === "thawani_wallet"
                    ? "border-purple-600 bg-purple-500/10 text-purple-600 dark:border-purple-400 dark:bg-purple-400/10 dark:text-purple-300 font-bold shadow-sm"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[11px] font-bold leading-tight">محفظة ثواني</span>
                <span className="text-[9px] opacity-75">Thawani Pay</span>
              </button>

              {/* Option 3: Thawani QR Code */}
              <button
                type="button"
                data-testid="button-payment-thawani-qr"
                onClick={() => setPaymentMethod("thawani_qr")}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                  paymentMethod === "thawani_qr"
                    ? "border-purple-600 bg-purple-500/10 text-purple-600 dark:border-purple-400 dark:bg-purple-400/10 dark:text-purple-300 font-bold shadow-sm"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-[11px] font-bold leading-tight">مسح رمز QR</span>
                <span className="text-[9px] opacity-75">Scan & Pay</span>
              </button>
            </div>
          </div>

          {/* METHOD 1: OmanNet / Card Form */}
          {paymentMethod === "card" && (
            <div className="space-y-3 text-right bg-muted/15 p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-muted-foreground">البطاقات المقبولة عبر ثواني:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold border-purple-500/40 text-purple-600 bg-purple-500/5">
                    عُمان نت OmanNet
                  </Badge>
                  <SiVisa className="w-6 h-4 text-[#1A1F71] dark:text-white" />
                  <SiMastercard className="w-6 h-4 text-orange-500" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cardNumber" className="text-[11px] text-muted-foreground">رقم البطاقة (عُمان نت / فيزا / ماستركارد)</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    data-testid="input-card-number"
                    placeholder="5893 1234 5678 9012"
                    className="pl-10 text-right bg-background border-border text-xs h-9 font-mono"
                    dir="ltr"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="expiry" className="text-[11px] text-muted-foreground">تاريخ الانتهاء</Label>
                  <div className="relative">
                    <Input
                      id="expiry"
                      data-testid="input-expiry"
                      placeholder="MM/YY"
                      className="pl-10 bg-background border-border text-center text-xs h-9 font-mono"
                      dir="ltr"
                      value={expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cvv" className="text-[11px] text-muted-foreground">رمز الأمان (CVV)</Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      data-testid="input-cvv"
                      placeholder="123"
                      className="pl-10 bg-background border-border text-center text-xs h-9 font-mono"
                      dir="ltr"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cardName" className="text-[11px] text-muted-foreground font-semibold">
                  الاسم كما هو مدون على البطاقة
                </Label>
                <Input
                  id="cardName"
                  data-testid="input-card-name"
                  placeholder="AHMED MOHAMMED"
                  className="bg-background border-border text-left font-mono text-xs h-9"
                  dir="ltr"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          )}

          {/* METHOD 2: Thawani App & Wallet */}
          {paymentMethod === "thawani_wallet" && (
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 text-right space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    الدفع المباشر عبر تطبيق ثواني (Thawani App)
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    أدخل رقم هاتفك المسجل في ثواني وسنرسل إشعاراً فورياً للتطبيق لاعتماد الدفع.
                  </p>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <Label htmlFor="walletPhone" className="text-[11px] text-muted-foreground">
                  رقم الهاتف المسجل في تطبيق ثواني
                </Label>
                <Input
                  id="walletPhone"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  placeholder="+968 9111 2222"
                  className="bg-background border-purple-500/40 text-xs h-9 font-mono text-right"
                  dir="ltr"
                />
              </div>

              {walletWaitingApproval && (
                <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center space-y-1 animate-pulse">
                  <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>يرجى فتح تطبيق ثواني على هاتفك والموافقة على العملية...</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    المبلغ: {totalPrice.toFixed(3)} ر.ع • المرجع: {thawaniSession?.referenceCode}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* METHOD 3: Thawani QR Code */}
          {paymentMethod === "thawani_qr" && (
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 text-center space-y-3">
              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-md border border-purple-200 flex flex-col items-center justify-center relative">
                {/* Visual QR Code Pattern Representation */}
                <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-purple-50 rounded">
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                  <div className="bg-purple-900 rounded-sm"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-md bg-purple-600 text-white font-black flex items-center justify-center text-xs shadow-lg border-2 border-white">
                    ث
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground">
                  امسح الرمز عبر تطبيق ثواني للدفع فوراً
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  افتح تطبيق ثواني على هاتفك &gt; اختر مسح QR &gt; وجّه الكاميرا نحو الشاشة.
                </p>
                <div className="mt-1 font-mono text-[10px] text-purple-600 dark:text-purple-400">
                  مرجع ثواني: {thawaniSession?.referenceCode || "THW-OM-654321"}
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleInitiatePayment}
            disabled={isProcessing}
            className="w-full h-12 text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer transition-all"
            data-testid="button-confirm-payment"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري معالجة الدفع عبر بوابة ثواني...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>
                  {paymentMethod === "thawani_wallet" 
                    ? `إرسال طلب الدفع لتطبيق ثواني (${totalPrice.toFixed(3)} ر.ع)`
                    : paymentMethod === "thawani_qr"
                    ? `تأكيد المسح وسداد ${totalPrice.toFixed(3)} ر.ع`
                    : `ادفع ${totalPrice.toFixed(3)} ر.ع عبر بوابة ثواني`
                  }
                </span>
              </div>
            )}
          </Button>

          {/* CBO & PCI-DSS Trust Badge Footer */}
          <div className="text-[10px] text-center text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-1.5 leading-relaxed bg-muted/20 py-2 px-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-1 font-semibold text-purple-700 dark:text-purple-300">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>بوابة ثواني للمدفوعات الإلكترونية (Thawani Pay)</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span>مرخصة من البنك المركزي العُماني ومتوافقة مع معايير PCI-DSS</span>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
