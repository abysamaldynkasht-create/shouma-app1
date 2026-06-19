import { useState } from "react";
import { useLocation } from "wouter";
import { hospitals, getTypeAr, getTypeColor } from "@/lib/hospitals";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Hospital, 
  ArrowRight, 
  Search, 
  MapPin, 
  Star, 
  Clock,
  Phone
} from "lucide-react";
import logoImage from "@assets/شومة_1768320219408.jpg";

export default function HospitalsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const regions = Array.from(new Set(hospitals.map((h) => h.region)));
  const types = ["hospital", "health_center", "clinic", "pharmacy"];

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch =
      hospital.nameAr.includes(searchQuery) ||
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.location.includes(searchQuery);
    const matchesRegion = selectedRegion === "all" || hospital.region === selectedRegion;
    const matchesType = selectedType === "all" || hospital.type === selectedType;
    return matchesSearch && matchesRegion && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              data-testid="button-back"
              onClick={() => setLocation("/home")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm font-medium">رجوع</span>
            </button>

            <div className="flex items-center gap-2">
              <img 
                src={logoImage} 
                alt="شومة" 
                className="w-8 h-8 rounded-full object-cover mix-blend-multiply dark:mix-blend-screen dark:invert"
              />
              <span className="text-lg font-bold">المستشفيات والمراكز الصحية</span>
            </div>

            <div className="w-16" />
          </div>
        </div>
      </header>

      <section className="relative py-16 bg-gradient-to-b from-red-800/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 mb-4">
              <Hospital className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-page-title">
              المستشفيات والمراكز الصحية
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              دليلك الشامل للمستشفيات والمراكز الصحية في سلطنة عُمان
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                data-testid="input-search"
                placeholder="ابحث عن مستشفى أو مركز صحي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-region">
                <SelectValue placeholder="المنطقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المناطق</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-type">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getTypeAr(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">
            {filteredHospitals.length} مستشفى/مركز متوفر
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <Card
              key={hospital.id}
              data-testid={`card-hospital-${hospital.id}`}
              className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setLocation(`/hospitals/${hospital.id}`)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={hospital.image}
                  alt={hospital.nameAr}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <Badge className={`absolute top-3 right-3 ${getTypeColor(hospital.type)}`}>
                  {hospital.typeAr}
                </Badge>
                {hospital.isGovernment && (
                  <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                    حكومي
                  </Badge>
                )}
                <div className="absolute bottom-3 right-3 left-3">
                  <h3 className="text-lg font-bold text-white mb-1">{hospital.nameAr}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{hospital.location}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{hospital.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{hospital.workingHours}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hospital.services.slice(0, 3).map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {hospital.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{hospital.services.length - 3}
                    </Badge>
                  )}
                </div>
                {hospital.emergencyPhone && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-red-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">طوارئ متاحة</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Hospital className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              لم يتم العثور على نتائج
            </h3>
            <p className="text-muted-foreground">
              جرب تغيير معايير البحث
            </p>
          </div>
        )}
      </main>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()} شومة
          </p>
        </div>
      </footer>
    </div>
  );
}
