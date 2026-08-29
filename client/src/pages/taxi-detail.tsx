import { useEffect } from "react";
import { useLocation } from "wouter";

export default function TaxiDetailPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/taxis");
  }, [setLocation]);

  return null;
}
