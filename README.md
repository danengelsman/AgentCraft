# AgentCraft

**AgentCraft** is an AI agent builder for beginners – a full-stack starter kit that helps you go from **“I’ve heard of AI agents”** to **“I’m shipping my own”** without needing to wire everything from scratch.

- 🧠 Build and run AI agents powered by the OpenAI API  
- 🌐 Full-stack TypeScript: React (Vite) + Express + Drizzle ORM  
- 💳 Stripe-ready billing foundation  
- 🗄️ Postgres database (e.g. Neon) with typed schemas  
- 🔁 Shared types & validation between client and server  

> Live dev workspace: [AgentCraftCore on Replit](https://replit.com/@danengelsman/AgentCraftCore)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Running in Development](#running-in-development)
- [Environment Variables](#environment-variables)
- [Database & Migrations](#database--migrations)
- [Available Scripts](#available-scripts)
- [Architecture Overview](#architecture-overview)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

**Frontend**

- React 18 + TypeScript  
- Vite  
- Tailwind CSS  
- Radix / shadcn-style component system  
- TanStack Query (React Query)  
- React Hook Form + Zod  

**Backend**

- Node.js + Express  
- Drizzle ORM + PostgreSQL  
- Passport + sessions (local auth)  
- Stripe (for billing / subscriptions)  
- OpenAI API (for agent reasoning)  

**Tooling**

- TypeScript  
- Drizzle Kit  
- PostCSS + Tailwind  
- Replit configuration for easy online development  

---

## Project Structure

From the repo root:

```text
.
├── attached_assets/       # Screenshots, design assets, misc. files
├── client/                # React frontend (Vite + TS + Tailwind)
├── server/                # Express backend (API, auth, billing, OpenAI)
├── shared/                # Shared types, schemas, and utilities
│
├── .env.example           # Example env variables (copy to .env)
├── .gitignore
├── .replit                # Replit runtime config
│
├── components.json        # UI components registry (e.g. shadcn)
├── design_guidelines.md   # Design / UX notes
├── drizzle.config.ts      # Drizzle ORM config
├── package.json           # Root scripts & dependencies
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts