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
- Page components in `client/src/pages/` (Home, Dashboard, Agents, Templates, Chat, Tutorials, Resources, Subscription, Settings)
- Custom hooks in `client/src/hooks/` for mobile detection and toast notifications

**Recent Updates (November 2024):**
- Expanded templates from 3 to 12 total, covering comprehensive business automation use cases
- Enriched Dashboard with Recharts visualizations (area charts for conversations, line charts for response times)
- Added recent activity feed showing agent interactions with success/warning status indicators
- Created Resources/Learning page with video tutorials, use case guides, best practices, and success stories
- Expanded integrations beyond HubSpot to include Calendly, Slack, Gmail, Stripe, and Zapier
- Added 5 pre-built example agents to Agent Gallery with performance metrics and clone functionality
- Implemented comprehensive mobile optimization with hamburger navigation, responsive typography (4xl→7xl scaling), and touch-friendly interfaces
- Updated branding to use custom neural network "A" logo (blue metallic with silver circular frame)

**Key Features:**
- **Dashboard**: Rich analytics with performance charts (conversation volume, response time trends using Recharts), recent activity feed, quick action cards, and usage tracking with visual progress bars
- **Agent Gallery**: Manages user agents with search/filter functionality, plus 5 pre-built example agents (E-commerce Support, Real Estate Lead Bot, Healthcare Appointment Manager, SaaS Onboarding, Restaurant Review Manager) that users can clone
- **Template Marketplace**: 12 comprehensive solution templates including Website FAQ Chatbot, Lead Qualification, Appointment Scheduler, Email Responder, Social Media Manager, Customer Onboarding, Product Recommender, Sales Outreach, Meeting Summarizer, Review Responder, Feedback Collector, and Invoice Reminder
- **Resources & Learning**: Dedicated page with video tutorials, use case guides, best practices documentation, and success stories from businesses using the platform
- **Chat Interface**: For testing and interacting with agents
- **Tutorial System**: For user onboarding
- **Subscription/Pricing**: Free tier (1 agent, 100 msgs/month) and Pro tier ($49/month, 10 agents, unlimited messages)
- **Settings & Integrations**: User preferences plus integration management for HubSpot CRM, Calendly, Slack, Gmail, Stripe, and Zapier

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

**Integrations:**
- **HubSpot CRM**: For lead management and contact synchronization
- **Calendly**: Appointment scheduling integration
- **Slack**: Agent notifications to Slack workspace
- **Gmail**: Email automation via OAuth
- **Stripe**: Payment processing and invoice reminders
- **Zapier**: Trigger workflows from agents
- **OpenAI**: AI/LLM services for agent intelligence (configured)

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