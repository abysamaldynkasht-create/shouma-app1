import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Headphones, X, Phone, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const CUSTOMER_SERVICE_NUMBER = "+96879688500";
const CUSTOMER_SERVICE_EMAIL = "shomah272@gmail.com";

export default function CustomerService() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${CUSTOMER_SERVICE_NUMBER}`;
  };

  const handleWhatsApp = () => {
    const cleanNumber = CUSTOMER_SERVICE_NUMBER.replace("+", "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  const handleEmail = () => {
    window.location.href = `mailto:${CUSTOMER_SERVICE_EMAIL}`;
  };

  return (
    <div className="fixed bottom-24 left-4 z-50" dir="rtl">
      {isOpen && (
        <Card 
          className="mb-3 w-72 shadow-xl border-card-border animate-in slide-in-from-bottom-4 duration-300"
          data-testid="card-customer-service"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">خدمة العملاء</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-customer-service"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              نحن هنا لمساعدتك! تواصل معنا عبر:
            </p>

            <div className="space-y-3">
              <Button
                className="w-full justify-start gap-3 h-12"
                variant="outline"
                onClick={handleCall}
                data-testid="button-call-customer-service"
              >
                <Phone className="h-5 w-5 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">اتصل بنا</span>
                  <span className="text-xs text-muted-foreground" dir="ltr">{CUSTOMER_SERVICE_NUMBER}</span>
                </div>
              </Button>

              <Button
                className="w-full justify-start gap-3 h-12 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleWhatsApp}
                data-testid="button-whatsapp-customer-service"
              >
                <SiWhatsapp className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">واتساب</span>
                  <span className="text-xs text-white/80" dir="ltr">{CUSTOMER_SERVICE_NUMBER}</span>
                </div>
              </Button>

              <Button
                className="w-full justify-start gap-3 h-12"
                variant="outline"
                onClick={handleEmail}
                data-testid="button-email-customer-service"
              >
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">البريد الإلكتروني</span>
                  <span className="text-xs text-muted-foreground">{CUSTOMER_SERVICE_EMAIL}</span>
                </div>
              </Button>
            </div>

            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                متاحون من الأحد إلى الخميس
                <br />
                من 8 صباحاً حتى 8 مساءً
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-customer-service-toggle"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Headphones className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
