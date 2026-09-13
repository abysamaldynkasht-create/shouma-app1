import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import SettingsPage from "@/pages/settings";
import ShoumatakPage from "@/pages/shoumatak";
import ItineraryPage from "@/pages/itinerary";
import AttractionsPage from "@/pages/attractions";
import AttractionDetailPage from "@/pages/attraction-detail";
import HotelsPage from "@/pages/hotels";
import HotelDetailPage from "@/pages/hotel-detail";
import RestaurantsPage from "@/pages/restaurants";
import RestaurantDetailPage from "@/pages/restaurant-detail";
import TaxisPage from "@/pages/taxis";
import TaxiDetailPage from "@/pages/taxi-detail";
import HikingPage from "@/pages/hiking";
import HikingDetailPage from "@/pages/hiking-detail";
import HospitalsPage from "@/pages/hospitals";
import HospitalDetailPage from "@/pages/hospital-detail";
import TourGuidesPage from "@/pages/tour-guides";
import GuideDashboardPage from "@/pages/tour-panel";
import AdminPanelOne from "@/pages/admin-panel-1";
import AdminHavingPage from "@/pages/admin-having";
import NearbyPlacesPage from "@/pages/nearby-places";
import ActivitiesPage from "@/pages/activities";
import HiddenGemsPage from "@/pages/hidden-gems";
import OfflineMapPage from "@/pages/offline-map";
import GroupTripsPage from "@/pages/group-trips";
import HimamShoumaPage from "@/pages/himam-shouma";
import HotelPortalPage from "@/pages/hotel-portal";
import TripsAdminPage from "@/pages/trips-admin";
import FinanceAdminPage from "@/pages/finance-admin";
import CarRentalAdminPage from "@/pages/car-rental-admin";
import DeveloperPortalPage from "@/pages/developer-portal";
import MarkAdminPage from "@/pages/mark-admin";
import MyBookingsPage from "@/pages/my-bookings";

import CustomerService from "@/components/CustomerService";
import { AutoDOMTranslator } from "@/components/AutoDOMTranslator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/shoumatak" component={ShoumatakPage} />
      <Route path="/itinerary" component={ItineraryPage} />
      <Route path="/attractions" component={AttractionsPage} />
      <Route path="/attractions/:id" component={AttractionDetailPage} />
      <Route path="/hotels" component={HotelsPage} />
      <Route path="/hotels/:id" component={HotelDetailPage} />
      <Route path="/restaurants" component={RestaurantsPage} />
      <Route path="/restaurants/:id" component={RestaurantDetailPage} />
      <Route path="/taxis" component={TaxisPage} />
      <Route path="/taxis/:id" component={TaxiDetailPage} />
      <Route path="/hiking" component={HikingPage} />
      <Route path="/hiking/:id" component={HikingDetailPage} />
      <Route path="/hospitals" component={HospitalsPage} />
      <Route path="/hospitals/:id" component={HospitalDetailPage} />
      <Route path="/tour-guides" component={TourGuidesPage} />
      <Route path="/tour-panel" component={GuideDashboardPage} />
      <Route path="/hiking-portal" component={GuideDashboardPage} />
      <Route path="/guide-dashboard-private-4190" component={GuideDashboardPage} />
      <Route path="/admin-1" component={AdminPanelOne} />
      <Route path="/admin-shouma" component={AdminPanelOne} />
      <Route path="/admin-panel-1" component={AdminPanelOne} />
      <Route path="/admin-dashboard" component={AdminPanelOne} />
      <Route path="/admin-having" component={AdminHavingPage} />
      <Route path="/admin_having_private_3490" component={AdminHavingPage} />
      <Route path="/hotel-portal" component={HotelPortalPage} />
      <Route path="/hotels-admin-private-8822" component={HotelPortalPage} />
      <Route path="/portal-login" component={LoginPage} />
      <Route path="/car-rental-admin" component={CarRentalAdminPage} />
      <Route path="/cnt-admin" component={CarRentalAdminPage} />
      <Route path="/nearby" component={NearbyPlacesPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/hidden-gems" component={HiddenGemsPage} />
      <Route path="/offline-map" component={OfflineMapPage} />
      <Route path="/group-trips" component={GroupTripsPage} />
      <Route path="/himam-shouma" component={HimamShoumaPage} />
      <Route path="/trips-admin" component={TripsAdminPage} />
      <Route path="/finance-admin" component={FinanceAdminPage} />
      <Route path="/admin-tch" component={DeveloperPortalPage} />
      <Route path="/developer-portal" component={DeveloperPortalPage} />
      <Route path="/mark-admin" component={MarkAdminPage} />
      <Route path="/my-bookings" component={MyBookingsPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <AutoDOMTranslator />
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
            <CustomerService />
          </TooltipProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
