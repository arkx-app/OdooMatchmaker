# Odoo Matchmaker

## Overview

Odoo Matchmaker is a B2B matchmaking platform that connects Odoo Partners with potential Clients through an intuitive, Tinder-style swipe interface. The application features a split-personality design with distinct experiences for Clients (who browse and select Partners) and Partners (who create profiles to be discovered). The platform uses a playful yet professional approach, combining dating app mechanics with enterprise software credibility to facilitate business connections in the Odoo ecosystem.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **Routing:** Wouter for lightweight client-side routing
- **State Management:** TanStack Query (React Query) for server state management
- **UI Components:** Radix UI primitives with shadcn/ui component library
- **Styling:** Tailwind CSS with custom design tokens
- **Animations:** Framer Motion for swipe gestures and transitions
- **Forms:** React Hook Form with Zod schema validation

**Design System:**
The application implements a dual-identity design system with distinct visual treatments:
- **Client Side:** Warm gradient themes (orange/pink tones) for the client experience
- **Partner Side:** Cool gradient themes (blue/purple tones) for the partner experience
- **Typography:** Inter or Plus Jakarta Sans for headings, DM Sans for body text
- **Component Library:** Custom shadcn/ui components with "new-york" style variant

**Key Frontend Patterns:**
- Component-based architecture with reusable UI primitives
- Form validation using Zod schemas shared between client and server
- Optimistic UI updates with React Query mutations
- Responsive design with mobile-first approach
- Card-stacking animation system for swipe interface using Framer Motion's motion values and transforms

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript with ES modules
- **Database ORM:** Drizzle ORM
- **Database:** PostgreSQL (via Neon serverless driver)
- **Validation:** Zod schemas shared with frontend

**Server Configuration:**
- Dual-mode setup: Development server with Vite middleware, production server with static file serving
- Development mode integrates Vite's HMR (Hot Module Replacement) for instant feedback
- Production build bundles server code with esbuild

**API Design:**
RESTful API endpoints organized by resource:
- `GET /api/partners` - Retrieve all partner profiles for swiping
- `POST /api/clients` - Create new client profile
- `POST /api/partners` - Create new partner profile  
- `POST /api/matches` - Record swipe decisions and detect mutual matches

**Business Logic:**
- In-memory storage implementation (MemStorage) with interface-based design allowing easy migration to database persistence
- Seeded sample partner data for demonstration
- Match detection algorithm that identifies mutual interest between clients and partners
- UUID-based entity identification

### Data Storage

**Database Schema:**
The application uses Drizzle ORM with PostgreSQL, defining three core tables:

1. **Partners Table:**
   - Profile information (name, email, company)
   - Industry categorization
   - Service offerings (array field)
   - Social proof (rating, review count)
   - Optional logo and description

2. **Clients Table:**
   - Contact information (name, email, company)
   - Industry and budget range for matching criteria

3. **Matches Table:**
   - Client-Partner relationship tracking
   - Like/dislike decisions
   - Mutual match detection flag

**Schema Validation:**
- Zod schemas derived from Drizzle table definitions using `createInsertSchema`
- Shared schema definitions between frontend and backend ensure type safety
- Automatic validation of API requests using parsed schemas

**Current State:**
The application currently uses an in-memory storage implementation for rapid prototyping but is architected to support database persistence through the IStorage interface pattern.

### External Dependencies

**UI Component Libraries:**
- **Radix UI:** Unstyled, accessible component primitives (dialogs, dropdowns, forms, tooltips, etc.)
- **shadcn/ui:** Pre-built component implementations using Radix UI
- **Lucide React:** Icon library for UI elements

**Animation & Interaction:**
- **Framer Motion:** Animation library for swipe gestures, card transitions, and modal effects
- **Embla Carousel:** Touch-friendly carousel component (available but not actively used)

**Form Management:**
- **React Hook Form:** Form state management with performance optimization
- **@hookform/resolvers:** Integration between React Hook Form and Zod validation

**Database & ORM:**
- **Drizzle ORM:** TypeScript ORM for type-safe database operations
- **Drizzle Zod:** Schema-to-Zod conversion utilities
- **@neondatabase/serverless:** Serverless PostgreSQL driver for Neon database

**Development Tools:**
- **@replit/vite-plugin-runtime-error-modal:** Development error overlay
- **@replit/vite-plugin-cartographer:** Code mapping for Replit environment
- **@replit/vite-plugin-dev-banner:** Development mode indicator

**Styling:**
- **Tailwind CSS:** Utility-first CSS framework
- **PostCSS & Autoprefixer:** CSS processing and vendor prefixing
- **class-variance-authority:** Type-safe variant styling for components
- **clsx & tailwind-merge:** Conditional className utilities

**Utilities:**
- **date-fns:** Date manipulation and formatting
- **nanoid:** Unique ID generation
- **cmdk:** Command palette component (available but not actively used)