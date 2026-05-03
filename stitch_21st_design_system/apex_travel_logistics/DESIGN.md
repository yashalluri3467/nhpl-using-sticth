---
name: Apex Travel & Logistics
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Work Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h2:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  gutter: 1rem
  margin: 2rem
---

## Brand & Style

The design system is engineered for high-performance travel management, balancing the complexity of logistics with a refined, premium aesthetic. The brand personality is **reliable, efficient, and professional**, aimed at users who manage high volumes of data—from hotel inventories to intricate trip itineraries.

The visual style is **Minimalist-Professional**. It leverages heavy whitespace and a strict mathematical grid to manage information density. It draws inspiration from 21st-century component-driven design, utilizing subtle tonal layering and crisp borders to define hierarchy rather than heavy shadows or decorative elements. The goal is to create a UI that feels like a precision tool: sharp, responsive, and trustworthy.

## Colors

The palette is anchored in high-contrast neutrals to ensure maximum legibility for administrative tasks.

- **Primary:** Black (`#000000`) is used for core branding, primary typography, and the most critical call-to-action buttons, providing a sophisticated, editorial feel.
- **Secondary (Accent):** A deep Indigo (`#4F46E5`) is employed for interactive elements, focus states, and signifying "active" paths in complex workflows.
- **Tertiary (Action):** A vibrant Emerald (`#10B981`) is reserved for success states, confirmed bookings, and positive financial indicators.
- **Neutral:** A foundation of White (`#FFFFFF`) and Off-white (`#FAFAFA`) provides the "canvas," while Slate Grays (derived from `#E5E7EB`) handle borders, secondary text, and subtle backgrounds for high-density data tables.

## Typography

The typography system prioritizes clarity and information hierarchy. 

**Work Sans** is used for headlines to provide a grounded, professional character. Its slightly wider apertures ensure readability even in bold weights. **Inter** is the workhorse for all body copy and UI labels, chosen for its exceptional legibility in high-density data environments and its neutral, systematic feel.

For complex dashboards, use `label-caps` for table headers and section titles to create a clear visual distinction from the data itself. `body-sm` is the default for metadata and secondary information in list views.

## Layout & Spacing

This design system utilizes a **12-column fluid grid** for desktop views, transitioning to a single-column stack for mobile. 

The rhythm is built on a **4px baseline grid**. Spacing should be used to group related information logically:
- **Internal Spacing (within components):** Use `sm` (8px) or `md` (16px) for padding within cards and forms.
- **External Spacing (between components):** Use `lg` (24px) or `xl` (40px) to separate distinct sections of the dashboard.
- **Data Tables:** Utilize "compact" vertical padding (8px) for high-density administrative views to maximize the visibility of rows.

## Elevation & Depth

To maintain a clean and modern aesthetic, depth is primarily conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** `#FAFAFA` — The main application canvas.
- **Level 1 (Cards/Surface):** `#FFFFFF` — Used for the main content areas, containers, and modules. These are defined by a 1px border of `#E5E7EB`.
- **Level 2 (Popovers/Modals):** `#FFFFFF` — These use a very soft, diffused ambient shadow (`0 10px 25px -5px rgba(0,0,0,0.05)`) to indicate they are floating above the main interface.
- **Interactive States:** Hovering over a list item or card should trigger a subtle background shift to `#F3F4F6` rather than an increase in elevation.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding provides a modern, approachable feel while maintaining the structural integrity and professional rigor of a "grid-heavy" interface. 

- **Buttons & Inputs:** Use the standard `rounded` (4px).
- **Cards & Larger Containers:** Use `rounded-lg` (8px) to soften the overall layout.
- **Status Badges/Chips:** Use a full pill-shape (9999px) to distinguish them from interactive buttons.

## Components

### Buttons
Primary buttons are solid `#000000` with white text, featuring sharp 4px corners. Secondary buttons use a `#FFFFFF` fill with a `#E5E7EB` border. Destructive actions use a subtle red text with no fill until hover.

### Inputs & Forms
Form fields use a minimal design: a 1px `#E5E7EB` border that shifts to `#4F46E5` on focus. Labels are positioned above the field using `label-md`. Error states are indicated by a 2px left-border accent in red, rather than changing the entire field color, to keep the UI clean.

### Data Tables
Tables are the heart of the admin experience. Use `label-caps` for headers with a light gray background (`#F9FAFB`). Row dividers are 1px solid `#E5E7EB`. Use high-contrast text for primary data (e.g., Guest Name) and secondary gray text for metadata (e.g., Booking ID).

### Cards
Cards are used to group "Trip" or "Hotel" details. They should be border-only (`#E5E7EB`) with no shadow, ensuring that the interface remains flat and fast.

### Chips & Status Indicators
Status indicators (e.g., "Confirmed", "Pending", "Cancelled") use a light tinted background of the status color with high-saturation text of the same hue (e.g., Success: Light Green background with Emerald text).

### Navigation
The side navigation uses a collapsed/expanded state model. Active links are indicated by a small 2px vertical "pill" of `#4F46E5` on the leading edge.