# Shouma Tourism App - Design Guidelines

## Design Approach
**Reference-Based:** Drawing from premium travel platforms (Airbnb, Booking.com) with emphasis on discovery, wanderlust, and ease of use. The app balances functional utility with emotional appeal through rich imagery and warm, inviting aesthetics.

## Core Design Principles
- **Warmth & Discovery:** Brown/beige palette creates authentic, earthy travel atmosphere
- **Visual Storytelling:** High-quality destination imagery drives engagement
- **Effortless Navigation:** Clear categorization with intuitive card-based exploration
- **Trust & Credibility:** Professional presentation with emphasis on quality content

---

## Typography System

**Primary Font:** Montserrat (Google Fonts) - Modern, clean, excellent Arabic support  
**Secondary Font:** Cairo (Google Fonts) - Optimized for Arabic readability

**Hierarchy:**
- Hero/Headers: Montserrat Bold, 32-48px
- Section Titles: Montserrat SemiBold, 24-28px
- Card Titles: Cairo Bold, 18-20px
- Body Text: Cairo Regular, 14-16px
- Buttons: Montserrat Medium, 14-16px

---

## Layout System

**Spacing Units:** Tailwind spacing of 4, 6, 8, 12, 16 (p-4, m-6, gap-8, etc.)

**Container Strategy:**
- Max-width: 7xl for full-width sections
- Content sections: max-w-6xl centered
- Cards: Consistent 4-6 unit padding

**Grid Patterns:**
- Mobile: Single column
- Tablet: 2 columns for cards
- Desktop: 3-4 columns for category cards, 2 columns for detailed views

---

## Page Structures

### Login Screen
**Layout:** Split-screen design (hidden on mobile)
- Left: Full-bleed hero image of stunning Saudi destination (60% width on desktop)
- Right: Centered login form (40% width, single column on mobile)
- Logo placement: Top-left overlay on image
- Form: Minimal fields, large touch targets, rounded inputs

### Main Dashboard/Homepage
**Hero Section:** 
- Height: 70vh, full-width background image of iconic travel moment
- Overlay: Subtle dark gradient (bottom to top)
- Content: Centered welcome message, search bar component
- CTA: Blurred background button for "Start Your Journey"

**Category Grid Section:**
Six main categories displayed as large, image-rich cards in 3-column grid (2 on tablet, 1 on mobile):
1. Tourist Places (السياحية الأماكن)
2. Hotels (الفنادق)
3. Restaurants (المطاعم)
4. Hiking Trips (الهايكنق رحلات)
5. Taxis (الأجرة سيارات)
6. Shoumatak (شومتك) - Featured with distinct visual treatment

**Card Anatomy:**
- Aspect ratio: 4:3
- Image: Full-card background with overlay
- Title: Bottom-aligned, white text with shadow
- Icon: Top-right corner, subtle presence
- Hover: Gentle lift effect (4-8px), slight image zoom

### Shoumatak Questionnaire Page
**Layout:** Progressive multi-step form
- Progress indicator: Top of page, showing 5-7 steps
- Single question per view with generous spacing
- Large, tappable answer options (cards or buttons)
- Navigation: "Next" and "Back" buttons at bottom
- Key questions: Duration, Budget, Preferences, Group Size, Interests

**Result Page:** Generated itinerary displayed as timeline/calendar view with day-by-day cards

---

## Component Library

### Navigation
**Top Bar:** Fixed position with blur backdrop
- Logo: Left-aligned
- Menu items: Centered (desktop) or hamburger (mobile)
- User profile: Right-aligned circular avatar

### Cards
**Category Cards:** Image background, gradient overlay, text overlaid
**Content Cards:** White/cream background, image top, content below, subtle shadow
**Interactive Cards:** Clear hover states, no excessive animation

### Forms
**Input Fields:**
- Rounded corners (8-12px radius)
- Generous padding (12-16px)
- Light background with subtle border
- Focus state: Border color shift to accent brown

**Buttons:**
- Primary: Solid brown/tan fill, white text, rounded (8px)
- Secondary: Outline style with brown border
- Size: Minimum 44px height for touch targets

### Search Component
Large, prominent search bar with:
- Icon left-aligned
- Placeholder text centered
- Dropdown suggestions
- Filter chips below for quick category selection

---

## Images Strategy

**Required Images:**
1. **Login Hero:** Atmospheric Saudi landscape (Al-Ula rocks, desert vista, or coastal scene)
2. **Homepage Hero:** Wide-angle travel moment (group hiking, traditional market, scenic viewpoint)
3. **Category Cards (6 images):**
   - Tourist Places: Iconic landmark
   - Hotels: Luxury accommodation interior
   - Restaurants: Traditional cuisine close-up
   - Hiking: Mountain trail scenic
   - Taxis: Clean modern vehicle
   - Shoumatak: Person planning with map/tablet
4. **Content imagery:** Throughout listings and detail pages

**Image Treatment:**
- High quality, professionally shot
- Warm color grading matching brown/beige theme
- Subtle overlays for text readability
- Consistent aspect ratios per component type

---

## Interaction Patterns
- **Navigation:** Smooth scrolling between sections
- **Cards:** Subtle hover elevation, no dramatic transitions
- **Forms:** Inline validation, clear error states
- **Loading:** Subtle skeleton screens, no spinners
- **Transitions:** 200-300ms ease-in-out for micro-interactions

**Minimal Animation:** Reserve for:
- Page transitions (fade)
- Card hover states
- Form field focus
- Modal appearance/dismissal