# AgentCraft Design Guidelines

## Design Approach

**Selected Framework: Modern SaaS Application Design**
Drawing inspiration from Linear (clean typography, generous spacing), Stripe (professional minimalism, trustworthy aesthetics), and Notion (approachable complexity management). This positions AgentCraft as a credible enterprise tool while maintaining accessibility for small business beginners.

**Core Design Principles:**
1. **Approachable Professionalism** - Enterprise-quality UI without intimidation
2. **Guided Clarity** - Visual hierarchy that naturally leads users through complex flows
3. **Confident Simplicity** - Remove unnecessary chrome, let content breathe

## Typography System

**Font Stack:**
- Primary: Inter (via Google Fonts CDN) - all UI elements, body text, controls
- Monospace: JetBrains Mono - code snippets, API keys, technical references

**Hierarchy:**
- Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Supporting Text: text-sm text-gray-600 (14px)
- Labels/Captions: text-xs font-medium uppercase tracking-wide (12px)

## Layout System

**Spacing Primitives:** Consistently use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Micro spacing (between related items): space-y-2, gap-2
- Standard spacing (cards, sections): p-6, space-y-6
- Major spacing (page sections): py-12, gap-8
- Generous spacing (visual separation): py-16, my-24

**Container Strategy:**
- Application shell: max-w-7xl mx-auto
- Form containers: max-w-2xl
- Content areas: max-w-4xl
- Full-width dashboards: w-full with px-6

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header with backdrop-blur effect, border-b
- Logo left, primary navigation center, user menu + CTA right
- Height: h-16
- Navigation items with hover states using underline offset

**Sidebar Navigation (Dashboard areas):**
- Width: w-64, sticky left side
- Section groupings with subtle dividers
- Active state: subtle background highlight + left border accent

### Solution Templates (GuidedBuilder)
**Template Cards:**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Card structure: border rounded-lg p-6 hover:shadow-lg transition
- Icon (large, 48px) at top, title (text-xl font-semibold), description (text-sm), "Start Building" button
- Include small badges for tier requirements (Free/Pro)

### Chat Interface
**Message Container:**
- Two-column conversation layout
- User messages: right-aligned, max-w-2xl, rounded-2xl background
- Agent responses: left-aligned, max-w-2xl, subtle border
- Timestamp and status indicators: text-xs
- Input area: sticky bottom, rounded-full input with send button integrated

### Agent Gallery
**Agent Cards:**
- Horizontal cards with: agent icon, name, status badge, description snippet, action buttons
- Status indicators: Active (green dot), Inactive (gray dot), Draft (yellow dot)
- Quick actions: Edit (pencil icon), Delete (trash icon), Toggle Active (switch)

### HubSpot Integration UI
**Field Mapping Interface:**
- Two-column mapping table: AgentCraft field | HubSpot field
- Dropdown selectors with search capability
- Visual connection lines between mapped fields (subtle)
- "Add Mapping" button, "Test Connection" prominent CTA

**Sync Dashboard:**
- Stats cards in grid: Total Syncs, Success Rate, Last Sync Time, Pending Actions
- Activity timeline showing recent sync operations
- Large "Sync Now" button with loading states

### Forms & Inputs
**Text Inputs:**
- Height: h-12, rounded-lg, border with focus ring
- Labels: text-sm font-medium mb-2
- Helper text: text-xs text-gray-500 mt-1
- Error states: border-red-500, text-red-600

**Buttons:**
- Primary: h-12 px-6 rounded-lg font-medium
- Secondary: h-12 px-6 rounded-lg border-2 font-medium
- Icon buttons: w-10 h-10 rounded-lg
- Implement hover and active states with subtle transforms and shadow changes

**Dropdowns/Selects:**
- Match input height (h-12), chevron icon right
- Dropdown menu: rounded-lg shadow-xl border max-h-64 overflow-auto

### Onboarding Tour
**Spotlight Overlays:**
- Dark overlay (bg-black/50) with cut-out for highlighted element
- Tooltip positioned near highlighted area: rounded-xl p-6 shadow-2xl max-w-sm
- Progress indicators: dots at bottom, "Next" button, "Skip Tour" link

### Pricing Page
**Pricing Tiers:**
- Two cards side-by-side on desktop: Free and Pro
- Cards: border-2 rounded-2xl p-8, Pro tier with highlighted border
- Structure: Tier name (text-2xl), price (text-5xl font-bold), feature list with checkmark icons, CTA button
- Feature comparison table below cards for detailed breakdown

### Dashboard
**Usage Metrics:**
- Stats grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Stat card: border rounded-lg p-6, large number (text-3xl font-bold), label (text-sm), trend indicator
- Charts: Clean line graphs using charting library (Chart.js), minimal grid lines

## Icons
**Icon Library:** Heroicons (via CDN)
- Navigation: 24px (h-6 w-6)
- Card icons: 48px (h-12 w-12)
- Inline icons: 20px (h-5 w-5)
- Button icons: 20px (h-5 w-5)

## Images

**Hero Image (Marketing/Landing):**
- Full-width hero section with background image showing a small business owner using AgentCraft
- Image: Professional workspace, laptop with AgentCraft interface visible, warm lighting
- Overlay: subtle gradient (bg-gradient-to-r from-black/60 to-transparent)
- Height: 80vh
- Buttons on image: backdrop-blur-sm background with white text

**Solution Template Icons:**
- Custom illustration-style icons for each template (FAQ bot, Lead qualifier, Scheduler)
- Style: Duotone, modern, geometric
- Placement: Top of template cards, centered

**Empty States:**
- Illustration for "No agents yet" in gallery
- Illustration for "Connect HubSpot" prompts
- Style: Friendly, simple line art with subtle accent colors

**Tutorial Screenshots:**
- Annotated screenshots showing key interface elements
- Border: rounded-lg with subtle shadow

## Animations
Use sparingly and purposefully:
- Card hover: subtle scale (scale-105) and shadow increase
- Page transitions: fade in content (200ms)
- Loading states: skeleton screens with shimmer effect
- Button interactions: transform scale on press
- NO scroll-triggered animations, NO complex parallax effects

## Accessibility
- Minimum touch target: 44px (h-11 w-11 minimum for buttons)
- Focus indicators: 2px ring with offset for all interactive elements
- Color contrast: WCAG AA minimum for all text
- Form labels: Always visible, properly associated
- Alt text: Required for all images and icons
- Keyboard navigation: Full support with visible focus states