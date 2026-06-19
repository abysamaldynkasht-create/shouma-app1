# Shouma Tourism App

## Overview

Shouma (شومة) is a tourism discovery application designed for Oman travelers. The app helps users explore destinations, hotels, restaurants, hiking trips, and taxis. A key feature called "Shoumatak" (شومتك) provides personalized trip planning through a questionnaire-based itinerary generator.

The application follows a modern full-stack architecture with a React frontend and Express backend, using Arabic (RTL) as the primary language with a warm brown/beige design palette inspired by premium travel platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom warm brown/beige color palette
- **Build Tool**: Vite with hot module replacement

**Key Design Decisions:**
- RTL (right-to-left) layout as primary direction for Arabic content
- Typography uses Cairo (Arabic) and Montserrat (headers) Google Fonts
- Card-based UI for destination discovery and exploration
- Mobile-first responsive design with breakpoints for tablet and desktop
- Dark/Light mode (الوضع الليلي/النهاري) with class-based toggling

### Dark/Light Mode System
- **Component**: `client/src/components/ThemeToggle.tsx` - reusable toggle button
- **Strategy**: Tailwind CSS class-based (`darkMode: ["class"]`) - adds/removes `dark` class on `<html>`
- **CSS Variables**: Light mode in `:root`, dark mode in `.dark` (defined in `client/src/index.css`)
- **Persistence**: localStorage key `shouma-theme` (values: "dark" or "light")
- **Placement**: Available on every page header (login, home, attractions, hotels, restaurants, etc.)
- **Accessibility Panel**: Also integrated in `AccessibilityAssistant.tsx` as a toggle switch (الوضع الليلي/النهاري)
- **Login Page Variant**: Uses `variant="icon-only"` with transparent styling to match the SVG background
- **Sync**: ThemeToggle component and AccessibilityAssistant share the same localStorage key for consistent state

### Multi-Language System
- **8 Languages Supported**: Arabic (AR), English (EN), French (FR), Spanish (ES), Turkish (TR), Chinese (ZH), Japanese (JA), Persian (FA)
- **RTL Languages**: Arabic and Persian automatically set document direction to 'rtl' and apply Cairo font
- **Language Context**: `client/src/contexts/LanguageContext.tsx` provides language state and translation function
- **Translation Files**: `client/src/lib/translations.ts` contains all translation dictionaries
- **Language Switcher**: Globe icon dropdown in header with code badges (no emoji flags for compliance)
- **Persistence**: Language preference stored in localStorage with key 'shouma-language'
- **Filter System**: Tour guides page uses language-agnostic keys for specialization/city filters to work across language switches

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js native HTTP server
- **API Pattern**: RESTful JSON APIs under `/api` prefix
- **Storage**: In-memory storage with interface abstraction for future database integration

**Route Structure:**
- `/api/auth/register` - User registration
- `/api/auth/login` - User authentication
- `/api/itinerary` - Trip itinerary generation

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Validation**: Zod schemas with drizzle-zod integration
- **Current Storage**: MemStorage class (in-memory, ready for database migration)

**Data Models:**
- Users table with username/password authentication
- Questionnaire schema for trip preferences (duration, budget, interests, group size, activities, accommodation, meals)
- Itinerary types for generated trip plans with geographic clustering (Haversine distance)
- All appAttractions, appHotels, appRestaurants, appActivities in server/routes.ts have lat/lng coordinates and estimatedCost
- **Interest-based itinerary generation**: Maps user interests (adventure, nature, culture, swimming, etc.) to attraction categories; prioritizes matching places
- **Activities pool**: 14 activities (hiking, camel riding, diving, camping, turtle watching, etc.) injected into days when interests match
- **Budget system**: Each item has estimatedCost; budget multipliers (low=0.6, medium=1.0, high=1.5, luxury=2.5) scale hotel/transport costs
- **BudgetSummary**: Returned in itinerary response with breakdown: hotels, restaurants, attractions, activities, transport, total (in OMR)
- **Frontend budget card**: Displayed at bottom of itinerary page with cost per item badges and auto-recalculation on edits
- **Randomization**: shuffle() applied to data pools for different plans each run
- **Smart replace**: Category-based filtering in suggestions API; cost shown in suggestion cards; budget auto-recalculated on replace/add/delete
- Activities include distance descriptions (e.g., "5 كم من الفندق") and estimated travel times
- Day titles are region-specific (e.g., "استكشاف مسقط" for Muscat, "تراث الداخلية" for Dakhiliyah) — covers all 11 governorates
- Global deduplication: tracks usedAttractions, usedHotels, usedRestaurants, usedActivities across all days; falls back to full data pool before repeating any place
- Hotel preference: questionnaire asks user if they want single hotel (same throughout) or multiple hotels (different each day); defaults to single
- Geographic clustering: attractions per day are grouped within same governorate (80km radius), restaurants and hotels selected nearest to day's attractions
- Attraction interface with optional lat/lng coordinates for geolocation features

### Nearby Places Feature
- **Route**: `/nearby`
- **Component**: `client/src/pages/nearby-places.tsx`
- **Functionality**: Uses browser Geolocation API to find user's current location and displays nearby tourist attractions sorted by distance
- **Algorithm**: Haversine formula for distance calculation between user location and attraction coordinates
- **States**: Loading (requesting location), Error (location denied/unavailable with retry), Success (grid of nearby attractions)
- **Coverage**: 18+ attractions have coordinates across Muscat, Dakhiliyah, Wusta, North Batinah, and Dhofar governorates

### Offline Map Feature
- **Route**: `/offline-map`
- **Component**: `client/src/pages/offline-map.tsx`
- **Functionality**: Interactive SVG-based map of Oman that works without internet connection
- **Governorates**: All 11 governorates rendered as clickable SVG path regions with Arabic/English labels
- **Attraction Markers**: Attractions with lat/lng coordinates shown as dots on the map
- **Side Panel**: Shows governorate attractions list or individual attraction details with images
- **Navigation**: Can navigate to attraction detail pages from the map
- **Coordinate Mapping**: latLngToSvg() converts real coordinates to SVG positions
- **No Dependencies**: Pure SVG, no external map tiles or APIs needed

### Build System
- **Development**: Vite dev server with Express middleware integration
- **Production**: esbuild for server bundling, Vite for client build
- **Output**: `dist/` directory with `public/` for static assets

### Group Trips Feature
- **Route**: `/group-trips`
- **Component**: `client/src/pages/group-trips.tsx`
- **API**: `POST /api/group-trips` (create), `GET /api/group-trips` (list)
- **Schema**: `groupTripRequests` table in `shared/schema.ts`
- **Storage**: In-memory via `MemStorage` class
- **Form Fields**: Number of people, number of days, trip preferences (multi-select: adventures, exploration, heritage, nature, entertainment, custom), destination preference (single/multiple governorates), selected governorate (conditional dropdown), country of origin (dropdown), arrival date (date picker)
- **Validation**: Zod schema with react-hook-form + zodResolver; server-side refinement requires selectedGovernorate when destinationPreference is "single"
- **Purpose**: Collect group trip requests for future custom offer generation
- **Multi-language**: Translations in all 8 languages

### Himam Shouma (همم شومة) - Accessibility Section
- **Route**: `/himam-shouma`
- **Component**: `client/src/pages/himam-shouma.tsx`
- **Purpose**: Dedicated section for people of determination showing accessible locations and services in Oman
- **Service Categories**: Wheelchair accessible places, accessible restrooms, easy entrances & ramps, support & assistance services
- **Data**: 8 accessible places including National Museum, Sultan Qaboos Grand Mosque, Royal Opera House, Qurum Natural Park, OCEC, City Centre Muscat, Shangri-La, Bait Al Zubair
- **Features per place**: Name (AR/EN), description, location, accessibility rating, phone, Google Maps link, feature badges
- **Multi-language**: Translations in all 8 languages

## Pending Features

### Payment Integration (Hotels)
- **Status**: Not configured
- **Requirement**: User requested Apple Pay and credit card payment for hotel bookings
- **Solution**: Stripe integration - user needs to provide Stripe API keys (Secret Key and Publishable Key) or complete the Replit Stripe connector setup
- **Note**: When ready, use Replit's Stripe connector for secure payment processing

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Connection**: Drizzle ORM with `drizzle-kit` for migrations
- **Session Store**: connect-pg-simple available for session persistence

### UI Framework
- **Radix UI**: Complete primitive component set (dialogs, dropdowns, tabs, tooltips, etc.)
- **Embla Carousel**: Image carousels for destination galleries
- **Lucide Icons**: Icon library for UI elements

### Fonts
- **Google Fonts**: Cairo and Montserrat loaded via CDN in `client/index.html`

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment
- **TypeScript**: Strict mode with path aliases (`@/` for client, `@shared/` for shared code)