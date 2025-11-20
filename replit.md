# AgentCraft

## Overview

AgentCraft is a premium AI agent automation platform designed for small businesses. The application enables non-technical users to create, manage, and deploy AI-powered automation agents through guided templates and an intuitive interface. Built with a focus on simplicity and immediate business value, AgentCraft helps small businesses automate tasks like customer support, lead qualification, appointment scheduling, and more—without requiring coding expertise.

The platform features a sophisticated, Apple-inspired design language with clean minimalism, glass-and-metal aesthetics, and purposeful interactions. The core value proposition is "The easiest way for Small Businesses to automate specific tasks."

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18+ with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack React Query (v5) for server state
- **UI Framework:** Shadcn/ui components built on Radix UI primitives
- **Styling:** Tailwind CSS with custom design system
- **Build Tool:** Vite

**Design System:**
The application implements a premium luxury design system inspired by Apple's product design language. Key characteristics:
- Color palette: Deep Space Black, Platinum Silver, Sapphire Blue as primary colors
- Typography: Inter font family (300-700 weights) with generous spacing
- Component styling: Glass/metal aesthetics with subtle elevations and hover states
- Theme support: Light and dark modes with custom CSS variables
- Animation: Subtle, purposeful transitions (200-300ms duration)

**Component Architecture:**
- Reusable UI components in `client/src/components/ui/` (30+ Shadcn components)
- Business components in `client/src/components/` (AgentCard, TemplateCard, ChatMessage, etc.)
- Page components in `client/src/pages/` (Dashboard, Agents, Templates, Chat, etc.)
- Custom hooks in `client/src/hooks/` for mobile detection and toast notifications

**Key Features:**
- Dashboard with agent statistics and quick actions
- Agent gallery for managing multiple AI agents
- Template marketplace for pre-built solution templates
- Chat interface for testing and interacting with agents
- Tutorial system for user onboarding
- Subscription/pricing management
- Settings and user preferences

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL via Neon serverless
- **ORM:** Drizzle ORM
- **Session Management:** Connect-pg-simple (PostgreSQL session store)
- **WebSocket Support:** Native WebSocket constructor for Neon

**Server Structure:**
- Entry point: `server/index.ts` with Express app setup
- Route registration: `server/routes.ts` (currently minimal, ready for expansion)
- Database connection: `server/db.ts` with Neon serverless pool
- Storage layer: `server/storage.ts` with in-memory implementation (IStorage interface)
- Development server: `server/vite.ts` for Vite integration in dev mode

**Storage Interface Design:**
The application uses an abstraction layer (IStorage) that currently implements in-memory storage (MemStorage class) for users. This design allows easy migration to database-backed storage without changing business logic. Key methods:
- `getUser(id)` - Retrieve user by ID
- `getUserByUsername(username)` - Retrieve user by username
- `createUser(user)` - Create new user

**API Design:**
- All API routes prefixed with `/api`
- Request/response logging middleware for debugging
- JSON body parsing with raw body preservation for webhooks
- CORS and credentials support configured

### Data Storage

**Database Technology:**
- PostgreSQL via Neon serverless platform
- Connection pooling through `@neondatabase/serverless`
- WebSocket-based connection for serverless compatibility

**Schema Design (Current):**
Located in `shared/schema.ts`:
- `users` table with UUID primary keys, username (unique), and password fields
- Zod schema validation via drizzle-zod integration
- Type-safe InsertUser and User types exported

**Migration Strategy:**
- Drizzle Kit for schema migrations
- Migration files output to `./migrations/`
- Push-based deployment via `npm run db:push`

**Future Considerations:**
The current schema is minimal. The application will need additional tables for:
- Agents (AI automation configurations)
- Templates (pre-built solution templates)
- Conversations/messages (chat history)
- Subscriptions (pricing tiers)
- User progress/tutorials

### External Dependencies

**Third-Party UI Libraries:**
- Radix UI primitives for accessible, unstyled components (accordion, dialog, dropdown, etc.)
- Tailwind CSS for utility-first styling
- Lucide React for icon system
- Class Variance Authority for component variant management

**Development Tools:**
- Replit plugins for development (cartographer, dev-banner, runtime error modal)
- ESBuild for server bundling in production
- TSX for TypeScript execution in development
- PostCSS with Autoprefixer for CSS processing

**Planned Integrations:**
- HubSpot CRM integration for lead management and contact synchronization
- Calendar integration for appointment scheduling agents
- AI/LLM services for agent intelligence (not yet implemented)

**Build and Deployment:**
- Development: Concurrent Vite dev server + TSX server execution
- Production: Vite build for client, ESBuild for server bundling
- Environment variables: DATABASE_URL required for PostgreSQL connection
- Port configuration: Configurable via environment

**Form Handling:**
- React Hook Form with Hookform Resolvers for validation
- Zod for schema validation across client and server

**Specialized Libraries:**
- `date-fns` for date manipulation
- `cmdk` for command menu interface
- `memoizee` types for performance optimization
- `vaul` for drawer components