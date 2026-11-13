---
name: TravelKart
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#424655'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#727687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0055d5'
  primary: '#0053d3'
  on-primary: '#ffffff'
  primary-container: '#1a6bff'
  on-primary-container: '#fffeff'
  inverse-primary: '#b3c5ff'
  secondary: '#ab3500'
  on-secondary: '#ffffff'
  secondary-container: '#fe6a34'
  on-secondary-container: '#5d1900'
  tertiary: '#00667c'
  on-tertiary: '#ffffff'
  tertiary-container: '#00819b'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59d'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#832600'
  tertiary-fixed: '#b3ebff'
  tertiary-fixed-dim: '#4cd6fb'
  on-tertiary-fixed: '#001f27'
  on-tertiary-fixed-variant: '#004e5f'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the optimism, clarity, and delight of seamless modern travel planning. The visual language balances trust, utility, and discovery: structured utility for complex search and transaction workflows, paired with energetic warmth that evokes exploration and vacation excitement.

### Tone & Personality
- **Effortless & Clear:** High legibility, uncluttered surfaces, and unambiguous interactions that remove booking anxiety.
- **Friendly & Inviting:** Generous corner radii, cheerful warm accents, and approachable typography that make exploring feel like a vacation before departure.
- **Trustworthy & Dependable:** Grounded by an authoritative, clear ocean-blue primary tone that signals enterprise-grade booking security, reliability, and precision.

### Design Direction
The style merges **Modern Clean Utility** with **Tactile Soft Dimension**. It relies on crisp white canvases, whisper-soft gray borders for structural clarity, subtle sky-tinted ambient drop shadows, and vibrant tactile interaction anchors. Visual interest comes from bold photographic editorial blocks, pill-shaped tactile controls, and high-contrast orange discovery badges.

## Colors

The palette establishes an immediate balance between dependability and journey-ready enthusiasm.

### Functional Roles
- **Primary (`#1A6BFF`):** The trust engine. Applied to primary booking CTAs, active navigation items, progress milestones, and selected states. Conveys security, speed, and professionalism.
- **Secondary (`#FF6B35`):** The catalyst. Reserved for time-sensitive deals, discount highlights, loyalty badges, favorited hearts, and conversion accelerators. Used intentionally to drive focus without causing cognitive exhaustion.
- **Tertiary (`#00B4D8`):** The atmosphere. Represents clear skies and tropical destinations. Utilized for secondary tags (e.g., "Free Cancellation", "Eco-Certified"), transit line badges, and subtle informational callouts.
- **Neutral (`#111827`):** Deep ink charcoal for high-readability body copy and headings, replacing harsh pure black.
- **Surface & Canvas:** Base canvas is pure crisp white (`#FFFFFF`), supported by an off-white tonal layer (`#F8FAFC`) for card backgrounds, section alternation, and filter drawers.
- **Dividers & Borders:** Subtle gray (`#E5E7EB`) provides structural containment without visual heaviness.

## Typography

The type system is powered entirely by **Plus Jakarta Sans**, utilizing its geometric clarity, friendly open counters, and human warmth. 

### Implementation Rules
- **Display & Headings:** Rendered with tighter negative letter spacing (`-0.02em` to `-0.03em`) and heavy weights (700, 800) to produce modern, punchy destination headlines.
- **Flight & Price Numerals:** Numerical values in pricing listings and departure/arrival times should always utilize tabular figures (`font-variant-numeric: tabular-nums`) to prevent layout shifts during live price updates.
- **Micro-Labels & Metadata:** Used for cabin class, airport codes (e.g., `JFK`, `LHR`), and checkout breadcrumbs. Scaled down to `label-md` and `label-sm` with slight uppercase letter-spacing to guarantee legibility at small sizes.

## Layout & Spacing

A responsive 12-column fluid grid system with controlled maximum content widths ensures comfortable reading and scanning across viewports.

### Grid Constraints & Breakpoints
- **Desktop (1200px+):** 12 columns, 24px (`1.5rem`) gutters, max-width bounded at 1280px with centered canvas layout.
- **Tablet (768px – 1199px):** 8 columns, 16px (`1rem`) gutters, fluid margins with a minimum of 24px (`1.5rem`).
- **Mobile (< 768px):** 4 columns, 12px (`0.75rem`) gutters, 16px (`1rem`) outer margins. Search filters collapse from a persistent left rail into a bottom modal sheet.

### Spacing Cadence
- **Component Interiors:** Gaps inside buttons, compact tags, and rating chips use `space-xs` (4px) and `space-sm` (8px).
- **Search Module Bar:** Desktop search inputs (Destination, Dates, Guests) sit within an integrated segmented dock spaced using `space-md` (16px) internal cell padding.
- **Card Padding & Content Blocks:** Product cards, flight itinerary segments, and pricing breakdowns utilize `space-lg` (24px) padding to retain an open, breathable resort feel.

## Elevation & Depth

This system avoids heavy drop shadows, opting instead for crisp boundaries, subtle border strokes, and light-filled, sky-tinted ambient diffusion.

### Elevation Hierarchy
- **Level 0 (Flat Canvas):** Neutral background (`#FFFFFF` or `#F8FAFC`) with no shadow. Structural separation relies on 1px borders (`#E5E7EB`).
- **Level 1 (Card & Flight Cell Base):** `0px 2px 8px -2px rgba(26, 107, 255, 0.05), 0px 1px 3px 0px rgba(0, 0, 0, 0.04)`, bordered with 1px `#E5E7EB`. Used for inactive listing cards, filter toolbars, and date pickers.
- **Level 2 (Hover & Active Booking Modules):** `0px 12px 24px -6px rgba(26, 107, 255, 0.12), 0px 4px 8px -2px rgba(17, 24, 39, 0.04)`, border shifts to `rgba(26, 107, 255, 0.3)`. Applied to interactive cards on hover, pinned summary widgets, and floating sticky bottom search bars.
- **Level 3 (Modals, Flight Details Drawer, Autocomplete Popovers):** `0px 24px 48px -12px rgba(17, 24, 39, 0.14), 0px 8px 16px -4px rgba(26, 107, 255, 0.08)`.

## Shapes

The geometric personality features a combination of medium-curved containers (`rounded-xl` / 16px) and full-radius pill silhouettes (`rounded-full` / 9999px).

### Shape Rules
- **Pill Silhouette (`9999px`):** Used exclusively for high-intent interactive controls: primary search triggers, category tabs (e.g., Flights, Hotels, Villas), destination filter pills, promotional badges, and passenger counter controls.
- **Structured Rounded Containers (`16px`):** Applied to hotel property cards, flight itinerary cards, search docks, map view containers, and image gallery carousels.
- **Compact Elements (`8px`):** Utilized for text input fields, rating score chips, amenity icons, and calendar day selection boxes.

## Components

### Buttons
- **Primary CTA:** Pill-shaped (`rounded-full`), primary blue background (`#1A6BFF`), white text (`#FFFFFF`), `label-lg`. Padding: 12px 24px. Hover state shifts to `#0F56D9` with subtle upward transform (`-1px`).
- **Secondary CTA (Deals/Instant Book):** Pill-shaped, warm orange background (`#FF6B35`), white text, used for flash booking triggers and discount actions.
- **Tertiary & Ghost:** Pill-shaped, transparent background with 1px border (`#E5E7EB`), text `#111827`, hover state transitions to `#F8FAFC`.

### Chips & Category Filters
- **Filter Chips:** Pill-shaped (`rounded-full`), height: 36px, horizontal padding: 16px. Inactive: `#FFFFFF` surface, `#E5E7EB` border, `#111827` text. Active: `#1A6BFF` background with `#FFFFFF` text and no border.
- **Deal Badge:** Pill-shaped, `#FF6B35` tinted background (10% opacity: `#FFF0EB`), bold `#FF6B35` text, `label-sm`.

### Form Fields & Search Bar Dock
- **Search Console Dock:** Consolidated white pill or 16px rounded island bordered with `#E5E7EB` and Level 2 elevation. Divided internally by 1px vertical borders.
- **Input Fields:** 8px radius, border 1px solid `#E5E7EB`, font `body-md`. Focus state features a solid 2px outline of `#1A6BFF` with no generic browser glow.

### Cards (Hotels & Flights)
- **Hotel Listing Card:** 16px radius (`rounded-xl`), overflow hidden, 1px border `#E5E7EB`. Contains a 16:10 aspect ratio image gallery with floating heart icon (top right, glassmorphic white circle) and deal badge (top left). Bottom content segment uses 20px padding with clear price anchoring (bold 22px price text).
- **Flight Itinerary Card:** Horizontal layout with clear leg-by-leg visual timeline. Origin, line with duration badge, and destination. Nonstop badges styled in `#E5E7EB` pill with subtle green dot indicator.

### Checkboxes & Radios
- **Selection Controls:** 6px radius for checkboxes, full circle for radios. Default border 1.5px `#E5E7EB`. Selected state fills with `#1A6BFF` with an animated white check/dot icon.