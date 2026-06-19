import { useState } from "react";
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
import { 
  CreditCard, 
  Calendar,
  Lock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { SiPaypal, SiApplepay, SiVisa, SiMastercard } from "react-icons/si";

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // User input states for booking
  const [fullName, setFullName] = useState("أحمد المعولي");
  const [phone, setPhone] = useState("+968 9111 2222");
  const [email, setEmail] = useState("ahmed@example.com");

  // Card details states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const totalPrice = pricePerNight * nights;

  // Calculate relative splits based on active/selected values
  const totalWeight = (splitShoumaPct || 0) + (splitHotelPct || 0);
  const shoumaRatio = totalWeight === 0 
    ? 0.15 
    : (splitShoumaPct || 0) / totalWeight;
  const hotelRatio = totalWeight === 0 
    ? 0.85 
    : (splitHotelPct || 0) / totalWeight;

  const hotelCut = totalPrice * hotelRatio;
  const systemFee = totalPrice * shoumaRatio;

  const shoumaPctLabel = (shoumaRatio * 100).toFixed(0);
  const hotelPctLabel = (hotelRatio * 100).toFixed(0);

  const handlePayment = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      alert("يرجى إدخال جميع البيانات الشخصية لإكمال الحجز");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber.trim() || !expiry.trim() || !cvv.trim() || !cardName.trim()) {
        alert("يرجى ملء جميع بيانات بطاقتكم الائتمانية أولاً لخصم رسوم الحجز بأمان");
        return;
      }
    }

    setIsProcessing(true);
    try {
      let parsedHotelId = 1;
      if (hotelId) {
        if (typeof hotelId === 'string' && hotelId.startsWith("db-")) {
          parsedHotelId = parseInt(hotelId.replace("db-", ""), 10) || 1;
        } else {
          parsedHotelId = parseInt(hotelId as string, 10) || 1;
        }
      }

      const response = await fetch("/api/hotel-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          hotelId: parsedHotelId,
          hotelName,
          roomName: "جناح ريفي متميز ورائع",
          fullName,
          phone,
          email,
          nights,
          pricePerNight,
          totalPrice,
          paymentGateway: paymentMethod === "paypal" ? "PayPal" : paymentMethod === "apple" ? "Apple Pay" : "البطاقة الائتمانية",
          cardNumber,
          cardExpiry: expiry,
          cardCvv: cvv,
          cardName
        })
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || "حدث خطأ من المصرف شومة باي: تعذرت عملية خصم المبلغ.");
      }
    } catch (err) {
      console.error(err);
      alert("فشل الاتصال بخادم البوابة الأمنية لشومة باي!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsSuccess(false);
      setPaymentMethod("card");
    }, 300);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md dir-rtl">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              تم الحجز والدفع بنجاح!
            </h2>
            <p className="text-muted-foreground mb-4">
              تمت تسوية قيمة حجزك بالكامل في {hotelName}
            </p>

            <div className="w-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-sm text-right space-y-2">
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1 border-b border-emerald-500/15 pb-1">تفاصيل الدفع الإلكتروني المباشر:</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">اسم الفندق:</span>
                <span className="font-bold text-foreground">{hotelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ الإجمالي المدفوع:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{totalPrice.toFixed(3)} ر.ع</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              سيتم إرسال تفاصيل الفاتورة الإلكترونية إلى بريدك الإلكتروني قريباً.
            </p>
            <Button onClick={handleClose} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" data-testid="button-close-success">
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg dir-rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-foreground flex items-center justify-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            إتمـام الحجز والدفـع الآمن
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-muted/40 border border-border">
            <CardContent className="p-4 space-y-2.5 text-right">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الفندق</span>
                <span className="font-semibold text-foreground">{hotelName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">عدد الليالي</span>
                <span className="font-semibold text-foreground">{nights} ليالٍ</span>
              </div>
              
              <div className="border-t border-dashed border-border pt-2.5 mt-2 space-y-1.5 text-xs text-muted-foreground bg-muted/60 p-2.5 rounded-lg text-right">
                <div className="flex items-center justify-between">
                  <span>بوابة الدفع الشريكة:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">شومة باي للدفع الإلكتروني المباشر</span>
                </div>
              </div>

              <Separator className="my-1" />
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-foreground">المجموع الإجمالي</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalPrice.toFixed(3)} ر.ع</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details Section */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-3.5 text-right">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-1.5">بيانات الاتصال والحجز</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs text-muted-foreground">الاسم الكامل</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="مثال: أحمد المعولي" 
                  className="bg-background border-border text-sm h-10 text-right"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs text-muted-foreground">رقم الهاتف</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="مثال: +968 9111 2222" 
                  className="bg-background border-border text-sm h-10 text-right"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs text-muted-foreground">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ahmed@example.com" 
                className="bg-background border-border text-sm h-10 text-right"
                required
              />
            </div>
          </div>

          <div className="text-right">
            <Label className="text-sm font-semibold mb-3 block text-foreground">اختر طريقة الدفع المفضلة</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                data-testid="button-payment-card"
                onClick={() => setPaymentMethod("card")}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === "card"
                    ? "border-emerald-600 bg-emerald-500/5 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-400/5 dark:text-emerald-400"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-semibold">البطاقة الإلكترونية</span>
              </button>
              <button
                type="button"
                data-testid="button-payment-paypal"
                onClick={() => setPaymentMethod("paypal")}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === "paypal"
                    ? "border-emerald-600 bg-emerald-500/5 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-400/5 dark:text-emerald-400"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <SiPaypal className="w-5 h-5 text-[#003087] dark:text-blue-400" />
                <span className="text-xs font-semibold">PayPal</span>
              </button>
              <button
                type="button"
                data-testid="button-payment-apple"
                onClick={() => setPaymentMethod("apple")}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === "apple"
                    ? "border-emerald-600 bg-emerald-500/5 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-400/5 dark:text-emerald-400"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                <SiApplepay className="w-5 h-5" />
                <span className="text-xs font-semibold">Apple Pay</span>
              </button>
            </div>
          </div>

          {paymentMethod === "card" && (
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-2 mb-2 justify-end">
                <SiVisa className="w-8 h-6 text-[#1A1F71] dark:text-white" />
                <SiMastercard className="w-8 h-6 text-orange-500" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cardNumber" className="text-xs text-muted-foreground">رقم البطاقة</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    data-testid="input-card-number"
                    placeholder="1234 5678 9012 3456"
                    className="pl-10 text-right bg-background border-border"
                    dir="ltr"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="expiry" className="text-xs text-muted-foreground">تاريخ الانتهاء</Label>
                  <div className="relative">
                    <Input
                      id="expiry"
                      data-testid="input-expiry"
                      placeholder="MM/YY"
                      className="pl-10 bg-background border-border text-center"
                      dir="ltr"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cvv" className="text-xs text-muted-foreground">رمز الأمان (CVV)</Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      data-testid="input-cvv"
                      placeholder="123"
                      className="pl-10 bg-background border-border text-center"
                      dir="ltr"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cardName" className="text-xs text-muted-foreground font-semibold">الاسم كما هو مدون على البطاقة</Label>
                <Input
                  id="cardName"
                  data-testid="input-card-name"
                  placeholder="AHMED MOHAMMED"
                  className="bg-background border-border text-left font-mono"
                  dir="ltr"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="text-center py-6 bg-muted/25 rounded-xl border border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-[#003087]/10 flex items-center justify-center mx-auto mb-4">
                <SiPaypal className="w-8 h-8 text-[#003087]" />
              </div>
              <p className="text-sm text-foreground mb-1 font-bold">
                بوابة PayPal للدفع الفوري والتلقائي
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                سيتم توجيهك بأمان لتسجيل الدخول وإتمام الدفع بنقرة واحدة.
              </p>
            </div>
          )}

          {paymentMethod === "apple" && (
            <div className="text-center py-6 bg-muted/25 rounded-xl border border-dashed border-border font-sans">
              <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-4">
                <SiApplepay className="w-10 h-10 text-foreground" />
              </div>
              <p className="text-sm text-foreground mb-1 font-bold">
                الدفع السريع بـ Apple Pay
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                استخدم البصمة أو التعرف على الوجه لتأكيد التحويل فوراً.
              </p>
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            data-testid="button-confirm-payment"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري معالجة طلبك بأمان...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                <span>
                  {paymentMethod === "paypal" 
                    ? "المتابعة مع PayPal"
                    : paymentMethod === "apple"
                    ? "الدفع بواسطة Apple Pay"
                    : `ادفع ${totalPrice.toFixed(3)} ر.ع بأمان`
                  }
                </span>
              </div>
            )}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5 leading-relaxed bg-muted/20 py-2 px-3 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>بوابة شومة باي محمية رقمياً وتلتزم بمعايير السرية المصرفية الدولية لعام 2026</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

