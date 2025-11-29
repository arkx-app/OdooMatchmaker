# ERP Matcher

## Overview

ERP Matcher is a B2B matchmaking platform that connects ERP Partners with potential Clients through an intuitive, Tinder-style swipe interface. The application features a split-personality design with distinct experiences for Clients (who browse and select Partners) and Partners (who create profiles to be discovered). The platform uses a playful yet professional approach, combining dating app mechanics with enterprise software credibility to facilitate business connections in the ERP ecosystem.

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
- **Charts:** Recharts for analytics dashboards

**Design System:**
The application implements a dual-identity design system with distinct visual treatments:
- **Client Side:** Warm gradient themes (orange/pink tones) for the client experience
- **Partner Side:** Cool gradient themes (blue/purple tones) for the partner experience
- **Typography:** Inter or Plus Jakarta Sans for headings, DM Sans for body text
- **Component Library:** Custom shadcn/ui components with "new-york" style variant

**Key Frontend Pages:**
- **Split Page (`/`):** Two-sided choice between client and partner roles
- **Auth Pages:** Login, signup with role-based registration
- **Client Brief Form (`/client/briefs`):** Create detailed project briefs with module selection
- **Client Swipe (`/client/swipe`):** Tinder-style matching interface for clients to swipe through partners
- **Partner Swipe (`/partner/swipe`):** Tinder-style matching interface for partners to review interested clients
- **Client Dashboard (`/client/dashboard`):** View liked partners, matches, and project briefs
- **Partner Dashboard (`/partner/dashboard`):** View incoming client briefs, accept/decline matches
- **Messaging (`/messages/:id`):** Real-time DM system between matched clients and partners
- **Partner Analytics (`/partner/analytics`):** ROI dashboard with conversion metrics and project value tracking
- **Admin Dashboard (`/admin`):** Internal platform management for administrators with analytics, helpdesk, and user management

**Key Frontend Patterns:**
- Component-based architecture with reusable UI primitives
- Form validation using Zod schemas shared between client and server
- Optimistic UI updates with React Query mutations
- Responsive design with mobile-first approach
- Card-stacking animation system for swipe interface using Framer Motion's motion values and transforms
- localStorage-based session management for demo (auth would be JWT-based in production)

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

**Authentication:**
- `POST /api/auth/register` - User registration with role-based profile creation
- `POST /api/auth/login` - User login with profile retrieval

**Partners:**
- `GET /api/partners` - Retrieve all partner profiles
- `GET /api/partners/:id` - Get specific partner profile
- `POST /api/partners` - Create new partner profile
- `PATCH /api/partners/:id` - Update partner profile

**Clients & Briefs:**
- `POST /api/briefs` - Create new client brief (auto-triggers matching)
- `GET /api/briefs/:id` - Retrieve specific brief
- `GET /api/briefs/:id/matches` - Get AI-scored matches for a brief
- `GET /api/clients/:clientId/briefs` - List all briefs for a client

**Matches & Pipeline:**
- `GET /api/matches/partner/:partnerId` - Partner's incoming leads
- `GET /api/matches/client/:clientId` - Client's swipes and matches
- `POST /api/matches` - Create new match record (client swipes right on partner)
- `POST /api/matches/partner-swipe` - Partner swipes on client (creates mutual match if both liked)
- `PATCH /api/matches/:id` - Update match status (accepted/rejected/converted)

**Partner Swipe Discovery:**
- `GET /api/clients/swipe/:partnerId` - Get clients who liked this partner (for partner swiping)

**Messaging:**
- `POST /api/messages` - Send message between matched users
- `GET /api/messages/match/:matchId` - Retrieve conversation history
- `POST /api/messages/match/:matchId/read` - Mark messages as read

**Projects:**
- `POST /api/projects` - Create project from converted match
- `GET /api/projects/partner/:partnerId` - Partner's active projects
- `PATCH /api/projects/:id` - Update project status/completion

**Analytics:**
- `GET /api/analytics/partner/:partnerId` - Partner ROI metrics (matches sent, conversions, total value)

**Admin (requires admin role):**
- `GET /api/admin/analytics` - Platform-wide analytics (users, matches, tickets)
- `GET /api/admin/users` - List all users (excluding password hashes)
- `GET /api/admin/tickets` - List all support tickets
- `GET /api/admin/tickets/:id` - Get specific ticket details
- `PATCH /api/admin/tickets/:id` - Update ticket status/priority

**Support Tickets:**
- `POST /api/tickets` - Submit new support ticket (accessible by anyone)

**Business Logic:**
- In-memory storage implementation (MemStorage) with interface-based design allowing easy migration to database persistence
- Seeded sample partner data for demonstration
- **Advanced matching algorithm** with weighted scoring:
  - Module fit (30%): Technical skills match
  - Industry experience (25%): Prior projects in same sector
  - Budget fit (20%): Rate alignment with project budget
  - Capacity (10%): Availability to take on project
  - Rating (15%): Partner reputation score
  - Returns top 10 matches with explainable reasons
- UUID-based entity identification
- Deterministic client-to-partner matching for demo (rule-based with hash function)

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

4. **Support Tickets Table:**
   - User contact information (name, email)
   - Ticket details (subject, message, category)
   - Status tracking (open, in_progress, resolved, closed)
   - Priority levels (low, medium, high)
   - Admin notes and resolution fields

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