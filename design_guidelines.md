# Odoo Matchmaker Design Guidelines

## Design Approach
**Reference-Based Approach** drawing from modern dating apps (Tinder, Bumble) for the swipe interface, combined with clean SaaS aesthetics (Linear, Stripe) for landing/pricing sections.

## Core Design Principles
1. **Playful Professionalism**: Balance fun matchmaking mechanics with B2B credibility
2. **Clear Dual Identity**: Distinct visual treatment for Client vs Partner experiences
3. **Engaging Interactions**: Smooth, delightful animations that encourage exploration
4. **Trust & Clarity**: Professional forms and pricing that inspire confidence

---

## Typography
- **Headings**: Inter or Plus Jakarta Sans (700-800 weight) for bold, modern headlines
- **Body**: Inter or DM Sans (400-500 weight) for clean readability
- **Scale**: 
  - Hero: text-5xl to text-7xl
  - Section titles: text-3xl to text-4xl
  - Cards/buttons: text-lg to text-xl
  - Body: text-base to text-lg

## Layout System
**Spacing**: Use Tailwind units 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8

---

## Component Library

### 1. Landing Page - Split Interface
- **Layout**: Full viewport height (h-screen), two equal halves (grid-cols-2 on desktop, stack on mobile)
- **Buttons**: Large, rounded-2xl cards with gradient backgrounds, subtle hover lift effects (hover:scale-105)
- **Client Side**: Warm gradient (orange/pink tones), icon showing user/briefcase
- **Partner Side**: Cool gradient (blue/purple tones), icon showing handshake/network
- **Typography**: Bold text-4xl to text-5xl with taglines in text-lg below
- **Background**: Subtle gradient mesh or geometric pattern overlay

### 2. Swipe Card Interface
- **Card Container**: max-w-md mx-auto, rounded-3xl with shadow-2xl
- **Card Stack**: Layered effect showing 2-3 cards behind (scale-95, opacity-50)
- **Profile Card Content**:
  - Partner logo placeholder (h-32 rounded-full)
  - Company name (text-2xl font-bold)
  - Industry tags (rounded-full px-4 py-2 badges with gradient backgrounds)
  - Services list (text-base with checkmark icons)
  - Rating/reviews indicator
- **Action Buttons**: 
  - Fixed bottom position with backdrop blur background
  - Large circular buttons: Skip (red gradient, X icon) and Like (green gradient, heart icon)
  - Size: w-16 h-16 with smooth scale animations
- **Swipe Animation**: translateX with rotate tilt, fade on dismiss

### 3. Match Notification
- **Modal**: Centered overlay with backdrop-blur-lg and animated scale entrance
- **Content**: Confetti animation, "It's a Match!" text-4xl, partner preview cards side-by-side
- **CTA**: "Start Conversation" gradient button

### 4. Signup Forms
- **Layout**: Centered max-w-lg cards with rounded-2xl and p-8 to p-12
- **Input Fields**:
  - Full-width with rounded-xl borders
  - Floating labels or top-aligned labels (text-sm font-medium)
  - Focus state: ring-2 with brand color
  - Spacing: space-y-6 between fields
- **Dropdowns**: Custom styled select with chevron icon
- **Submit Button**: Full-width gradient button with text-lg, py-4, rounded-xl
- **Progress Indicator**: Step dots at top if multi-step (filled circles for completed steps)

### 5. Pricing Section
- **Toggle Switch**: 
  - Centered above pricing cards
  - Pill-shaped with sliding indicator (rounded-full)
  - "Save 20%" badge on yearly option
- **Pricing Cards**: 
  - Grid of 3 cards (grid-cols-1 md:grid-cols-3)
  - Middle tier elevated with scale-105 and stronger shadow
  - Each card: rounded-2xl, p-8, border with gradient on featured tier
  - Price: text-5xl font-bold with /mo or /yr in text-lg
  - Features list: space-y-3 with checkmark icons
  - CTA buttons: Gradient for featured tier, outline for others

### 6. Navigation
- **Header**: Fixed top, backdrop-blur-lg, py-4
- **Logo**: Text-2xl font-bold with gradient text or icon+text combo
- **Menu**: Flex justify-between, text-base with hover:text-brand transitions
- **Mobile**: Hamburger menu with slide-in drawer

---

## Animations
- **Page Transitions**: Fade + slight translateY (20px)
- **Card Swipe**: Transform translateX + rotate (±15deg) with spring physics
- **Button Hovers**: Scale 1.05, duration-200
- **Match Popup**: Scale from 0.8 to 1 with bounce easing
- **Form Validation**: Shake animation on error

---

## Images
**Hero Section**: Use a split-screen abstract illustration showing connection/network on one side and business professionals on the other. Alternatively, use gradient mesh backgrounds instead of photos for a more modern, abstract feel.

**Partner Cards**: Include placeholder avatar/logo images (120px × 120px circular)

**Match Animation**: Use illustration or icon-based graphics rather than photos

---

## Responsive Behavior
- **Desktop (lg:)**: Full split landing, 3-column pricing, side-by-side form layouts
- **Tablet (md:)**: Stack landing buttons vertically, 2-column pricing, maintain card swipe
- **Mobile**: Single column throughout, swipe cards take 90vw, simplified navigation

---

## Accessibility
- High contrast ratios for gradient text overlays (minimum 4.5:1)
- Focus indicators on all interactive elements (ring-2)
- Semantic HTML structure
- Swipe interface includes keyboard controls (arrow keys + Enter/Space)
- ARIA labels for icon-only buttons