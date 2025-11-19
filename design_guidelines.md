# AgentCraft Design Guidelines

## Brand Identity - Premium Luxury

**Design Philosophy: Apple-Inspired Sophistication**  
AgentCraft embodies refined luxury through clean minimalism, sophisticated materials, and precise attention to detail. Inspired by Apple's product design language—think iPhone Pro, MacBook, and their premium product pages—we create an experience that feels polished, premium, and effortlessly elegant.

**Core Design Principles:**
1. **Refined Premium** - Sophisticated luxury without ostentation
2. **Glass & Metal Aesthetics** - Subtle transparency, metallic accents, frosted surfaces
3. **Confident Minimalism** - Remove all unnecessary elements, embrace white space
4. **Purposeful Interactions** - Smooth, subtle, purposeful animations (200-300ms)

## Color System - Premium Palette

**Primary Colors:**
- **Deep Space Black** - `hsl(221, 39%, 11%)` - Rich, premium dark background (think Space Gray/Graphite)
- **Platinum Silver** - `hsl(210, 20%, 96%)` - Elegant light background with subtle warmth
- **Sapphire Blue** - `hsl(221, 83%, 53%)` - Signature primary color (refined, like iPhone Pro blue)

**Supporting Colors:**
- **Pure White** - `hsl(0, 0%, 100%)` - Crisp, clean accents
- **Soft Graphite** - `hsl(220, 9%, 46%)` - Sophisticated secondary text
- **Charcoal** - `hsl(220, 13%, 13%)` - Card backgrounds in dark mode
- **Pearl** - `hsl(210, 20%, 98%)` - Card backgrounds in light mode
- **Midnight** - `hsl(221, 43%, 11%)` - Deep accents for depth

**Color Usage Philosophy:**
- Use Sapphire Blue sparingly—only for primary CTAs and important interactive elements
- Favor sophisticated grays for UI chrome and secondary elements
- High contrast white-on-dark and dark-on-white sections for visual drama
- Subtle color gradients (never bold or vibrant) for depth

## Typography System

**Font Stack:**
- **Primary**: Inter (weights: 300 Light, 400 Regular, 500 Medium, 600 Semibold, 700 Bold)
- **Monospace**: JetBrains Mono - technical elements only

**Hierarchy (Apple-inspired sizing):**
- **Hero Headlines**: text-6xl font-light (60px, weight 300) - large, elegant, confident
- **Page Titles**: text-4xl font-semibold (36px, weight 600)
- **Section Headers**: text-2xl font-semibold (24px, weight 600)
- **Card Titles**: text-lg font-medium (18px, weight 500)
- **Body Text**: text-base (16px, weight 400)
- **Supporting Text**: text-sm text-muted-foreground (14px)
- **Labels/Captions**: text-xs font-medium tracking-wide (12px, weight 500)

**Typography Guidelines:**
- Generous line-height (1.6 for body, 1.2 for headlines)
- Ample letter-spacing on small caps and labels
- Never use all-caps for long text—only for labels and micro-copy
- Use font weights to create hierarchy, not size alone

## Layout System

**Spacing Philosophy:**
Generous, purposeful white space that lets content breathe. Every element needs room.

**Spacing Scale:**
- **Micro** (related items): gap-2, space-y-2 (8px)
- **Small** (form fields, list items): gap-4, space-y-4 (16px)
- **Medium** (cards, sections): p-6, gap-6, space-y-6 (24px)
- **Large** (page sections): py-12, gap-8 (32-48px)
- **Extra Large** (hero sections): py-16, py-24 (64-96px)

**Container Strategy:**
- **Application shell**: max-w-7xl mx-auto px-6 lg:px-8
- **Form containers**: max-w-2xl
- **Content areas**: max-w-4xl
- **Full-bleed sections**: w-full for dramatic impact

## Visual Style - Glass & Metal

**Glass Aesthetics (Frosted Panels):**
- Subtle background blur: `backdrop-blur-xl`
- Semi-transparent backgrounds: `bg-white/80 dark:bg-black/50`
- Soft borders: `border border-white/20 dark:border-white/10`
- Use for overlays, modals, floating panels

**Metal Aesthetics (Refined Surfaces):**
- Card backgrounds with subtle elevation
- Precise 1px borders with low contrast
- Soft shadows (never harsh): `shadow-sm`, `shadow-md` sparingly
- Border radius: `rounded-lg` (8px) for most elements, `rounded-2xl` (16px) for hero cards

**Depth & Layering:**
- Use subtle shadows to suggest elevation, not create drama
- Layer frosted glass over backgrounds for premium feel
- Gradient overlays on hero images: dark wash for readability

## Component Specifications

### Navigation
**Top Navigation Bar:**
- Height: `h-16` (64px)
- Glass aesthetic: `backdrop-blur-xl bg-white/80 dark:bg-black/50`
- Border: `border-b border-border/50`
- Logo left, navigation center, user menu + theme toggle right
- Navigation items: subtle hover with `hover-elevate`

### Cards (Premium Panels)
**Standard Card:**
- Background: `bg-card` with `border border-card-border`
- Padding: `p-6` minimum
- Border radius: `rounded-lg`
- Subtle shadow: `shadow-sm` only when floating
- Never stack cards—ensure proper spacing between

**Hero Card (Featured):**
- Larger padding: `p-8`
- Border radius: `rounded-2xl`
- Subtle gradient background when appropriate
- Premium feel through generous spacing

### Buttons (Purposeful Interactions)
**Primary Button:**
- Background: `bg-primary` (Sapphire Blue)
- Height: `h-10` or `h-11` depending on context
- Padding: `px-6`
- Border radius: `rounded-lg`
- Font: `font-medium`
- Built-in hover/active states via elevation system

**Secondary/Ghost Buttons:**
- Use `variant="outline"` or `variant="ghost"`
- Same sizing as primary
- Automatic elevation on hover

**Icon Buttons:**
- Size: `size="icon"` for perfect squares
- Never manually set width/height on icon buttons

### Forms & Inputs
**Text Inputs:**
- Height: `h-11` (44px minimum for accessibility)
- Border radius: `rounded-lg`
- Border: `border border-input`
- Focus ring: Sapphire Blue
- Placeholder: `text-muted-foreground`

**Labels:**
- Font: `text-sm font-medium`
- Spacing: `mb-2` below label
- Color: `text-foreground`

### Chat Interface
**Message Bubbles:**
- User: Right-aligned, `bg-primary text-primary-foreground rounded-2xl`
- Agent: Left-aligned, `bg-card border border-card-border rounded-2xl`
- Generous padding: `p-4`
- Max width: `max-w-2xl`
- Timestamp: `text-xs text-muted-foreground`

### Agent Cards (Gallery)
**Card Structure:**
- Horizontal layout: Icon left, content center, actions right
- Status indicators: Colored dot + text badge
- Subtle border, `hover-elevate` for interaction
- Action buttons: Icon buttons with `variant="ghost"`

### Dashboard Stats
**Stat Cards:**
- Grid layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Card with: Large number (text-3xl font-bold), label (text-sm), optional trend
- Subtle icons for visual interest
- Clean, minimal styling

## Icons
**Icon Library:** Lucide React
- Navigation icons: `h-5 w-5` (20px)
- Card/Feature icons: `h-10 w-10` or `h-12 w-12` (40-48px)
- Button icons: `h-4 w-4` or `h-5 w-5` (16-20px)
- Inline icons: `h-4 w-4`

## Animations & Interactions

**Motion Philosophy:**
Subtle, smooth, purposeful. Never flashy or distracting.

**Timing:**
- Standard transitions: 200ms
- Slow transitions: 300ms
- Never longer than 300ms

**Interaction Patterns:**
- Hover: Use `hover-elevate` utility (subtle brightness lift)
- Active/Press: Use `active-elevate-2` utility (more pronounced)
- Page transitions: Fade in content (200ms)
- Loading states: Skeleton screens with subtle shimmer
- NO scroll-triggered animations
- NO parallax effects
- NO bold transforms

**Elevation System:**
- `hover-elevate` - Subtle lift on hover
- `active-elevate-2` - Noticeable press feedback
- `toggle-elevate` + `toggle-elevated` - For toggle states
- These utilities work on any background color and adapt automatically

## Images & Photography

**Hero Images (Landing Page):**
- Style: Clean, professional product photography
- Lighting: Well-lit, soft shadows
- Composition: Generous white space, Apple product page aesthetic
- Treatment: Subtle dark gradient overlay if text overlays image
- No stock photos with people—focus on product/interface

**Empty States:**
- Minimal line art illustrations
- Monochromatic or single accent color
- Simple, friendly, not childish

**Screenshots:**
- Clean browser chrome or device frames
- High-quality, crisp resolution
- Subtle drop shadow: `shadow-lg`
- Border radius: `rounded-lg`

## Dark Mode

**Philosophy:**
Dark mode should feel luxurious, not just inverted. Rich blacks, subtle contrasts, refined elegance.

**Implementation:**
- All color tokens defined in both `:root` and `.dark`
- Use semantic color tokens (never hardcode colors)
- Ensure sufficient contrast for accessibility
- Test all interactions in both modes

**Dark Mode Colors:**
- Background: Deep Space Black (not pure black)
- Cards: Charcoal (slight lift from background)
- Text: High-contrast white (98% lightness)
- Borders: Very subtle (low contrast)

## Accessibility

**Non-Negotiable Standards:**
- Minimum touch target: 44px × 44px (h-11 w-11)
- Color contrast: WCAG AA minimum (4.5:1 for normal text)
- Focus indicators: 2px ring with offset on all interactive elements
- Keyboard navigation: Full support with visible focus states
- Form labels: Always visible, properly associated
- Alt text: Required for all meaningful images

## Implementation Checklist

When building or updating components:

✓ Uses semantic color tokens from theme system  
✓ Follows spacing scale (no arbitrary values)  
✓ Proper font weights and sizes from typography hierarchy  
✓ Generous white space around all elements  
✓ Subtle interactions using elevation utilities  
✓ Accessible (keyboard, focus states, contrast)  
✓ Dark mode support through semantic tokens  
✓ Proper touch targets (minimum 44px)  
✓ Glass/metal aesthetic where appropriate  
✓ Refined, never flashy
