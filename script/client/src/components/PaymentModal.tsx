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
}

export default function PaymentModal({
  open,
  onOpenChange,
  hotelName,
  pricePerNight,
  nights = 1,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPrice = pricePerNight * nights;

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
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
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              تم الحجز بنجاح!
            </h2>
            <p className="text-muted-foreground mb-6">
              تم تأكيد حجزك في {hotelName}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              سيتم إرسال تفاصيل الحجز إلى بريدك الإلكتروني
            </p>
            <Button onClick={handleClose} className="w-full" data-testid="button-close-success">
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            إتمام الحجز
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">الفندق</span>
                <span className="font-semibold">{hotelName}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">عدد الليالي</span>
                <span className="font-semibold">{nights}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="font-bold">المجموع</span>
                <span className="text-xl font-bold text-primary">{totalPrice.toFixed(3)} ر.ع</span>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label className="text-base font-semibold mb-3 block">اختر طريقة الدفع</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                data-testid="button-payment-card"
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs font-medium">بطاقة</span>
              </button>
              <button
                type="button"
                data-testid="button-payment-paypal"
                onClick={() => setPaymentMethod("paypal")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === "paypal"
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                }`}
              >
                <SiPaypal className="w-6 h-6 text-[#003087]" />
                <span className="text-xs font-medium">PayPal</span>
              </button>
              <button
                type="button"
                data-testid="button-payment-apple"
                onClick={() => setPaymentMethod("apple")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === "apple"
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                }`}
              >
                <SiApplepay className="w-6 h-6" />
                <span className="text-xs font-medium">Apple Pay</span>
              </button>
            </div>
          </div>

          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <SiVisa className="w-8 h-6 text-[#1A1F71]" />
                <SiMastercard className="w-8 h-6" />
              </div>
              <div>
                <Label htmlFor="cardNumber">رقم البطاقة</Label>
                <div className="relative mt-1">
                  <Input
                    id="cardNumber"
                    data-testid="input-card-number"
                    placeholder="1234 5678 9012 3456"
                    className="pl-10"
                    dir="ltr"
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                  <div className="relative mt-1">
                    <Input
                      id="expiry"
                      data-testid="input-expiry"
                      placeholder="MM/YY"
                      className="pl-10"
                      dir="ltr"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative mt-1">
                    <Input
                      id="cvv"
                      data-testid="input-cvv"
                      placeholder="123"
                      className="pl-10"
                      dir="ltr"
                      maxLength={4}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="cardName">الاسم على البطاقة</Label>
                <Input
                  id="cardName"
                  data-testid="input-card-name"
                  placeholder="AHMED MOHAMMED"
                  className="mt-1"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#003087]/10 flex items-center justify-center mx-auto mb-4">
                <SiPaypal className="w-8 h-8 text-[#003087]" />
              </div>
              <p className="text-muted-foreground mb-4">
                سيتم توجيهك إلى PayPal لإتمام عملية الدفع
              </p>
            </div>
          )}

          {paymentMethod === "apple" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-4">
                <SiApplepay className="w-10 h-10" />
              </div>
              <p className="text-muted-foreground mb-4">
                اضغط للدفع باستخدام Apple Pay
              </p>
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-12 text-base"
            data-testid="button-confirm-payment"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 ml-2" />
                {paymentMethod === "paypal" 
                  ? "المتابعة مع PayPal"
                  : paymentMethod === "apple"
                  ? "الدفع بـ Apple Pay"
                  : `ادفع ${totalPrice.toFixed(3)} ر.ع`
                }
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            جميع المعاملات مؤمنة ومشفرة
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
