<div align="center">

<img src="apps/web/public/logo-ehc-gym.png" alt="EHC GYM" width="120" />

# EHC GYM

**Gym management platform** — a full-stack monorepo with a web admin dashboard, a React Native mobile app for clients and trainers powered by an AI fitness coach, and a Convex backend.

</div>

---

## Overview

EHC GYM is a complete gym ecosystem built as a Turborepo monorepo. It connects **clients**, **trainers**, **branch admins**, and **super admins** through a single platform:

- **Mobile app** (Expo / React Native) — for clients and trainers: onboarding, profile & health metrics, trainer catalog, direct chat, social feed, and friend invitations.
- **Web dashboard** (React / TanStack Router) — for admins and super admins: manage branches (sedes), trainers, clients, invitations, and administrators.
- **Convex backend** — reactive real-time data layer with role-based access control (CLIENT, TRAINER, ADMIN, SUPER_ADMIN) and an **AI fitness coach** (Gemini 2.5 Flash) that personalizes routines using each client's profile and health data.

> [!NOTE]
> The product UI is in Spanish and targets the Colombian market (e.g. document types CC/TI/CE, cities and branches across the country).

## Features

### Mobile app (`apps/native`)
- **Authentication** — email/password sign-in, sign-up, password recovery, and biometric login via Clerk.
- **Onboarding & profiles** — personal info, preferences, emergency contact, and IMC (BMI) tracking with health metrics history.
- **Trainer catalog** — browse trainers by specialty and branch, view details, and start a conversation.
- **Chat** — real-time client↔trainer messaging with read receipts, message quotas, and an **AI assistant** that acts as a digital coach.
- **Social feed** — trainers publish posts; clients and trainers can like and interact.
- **Invite a friend** — generate invitations with tokens, track status (pending/redeemed/expired/canceled).

### Web dashboard (`apps/web`)
- **Super admin** — manage branches (sedes) with multi-step forms (basic info, location/contact, schedule/amenities), administrators, and trainers.
- **Admin** — manage clients, trainers, invitations, and branch details; dashboard with monitoring cards.
- **Landing page** — public marketing page with app download QR code.

### Backend (`packages/backend`)
- **Convex** reactive backend with a rich schema: users, persons, branches, trainers, clients, posts, likes, conversations, messages, invitations, health metrics, and client-trainer contracts.
- **RBAC** via `role_assignments` with per-branch admin scoping.
- **AI agent** (`@convex-dev/agent`) with tools to read client profiles, health metrics, and progress — powered by Google Gemini 2.5 Flash.
- **Emails** via Resend (invitations, notifications).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Monorepo | [Turborepo](https://turbo.build) + npm workspaces |
| Web | [React 19](https://react.dev), [TanStack Router](https://tanstack.com/router), [Vite](https://vite.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Mobile | [React Native 0.81](https://reactnative.dev), [Expo 54](https://expo.dev), [Expo Router](https://docs.expo.dev/router/introduction/), [NativeWind](https://www.nativewind.dev) |
| Backend | [Convex](https://convex.dev), [Clerk](https://clerk.com) (auth), [Resend](https://resend.com) (email) |
| AI | [Google Gemini 2.5 Flash](https://ai.google.dev) via `@ai-sdk/google` + `@convex-dev/agent` |
| Testing | [Vitest](https://vitest.dev) (web, backend), [Jest](https://jestjs.io) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) (mobile) |
| CI/CD | GitHub Actions (web tests, native tests + EAS build, backend tests + Convex deploy) |

## Project Structure

```
ehc-gym-repo/
├── apps/
│   ├── web/                  # Admin & super-admin dashboard (React + TanStack Router)
│   │   └── src/
│   │       ├── routes/       # File-based routing (admin, super-admin, auth, dashboard)
│   │       ├── components/   # UI + feature components (shadcn/ui)
│   │       └── hooks/        # Form & auth hooks
│   └── native/               # Mobile app (React Native + Expo Router)
│       ├── app/              # Screens grouped by feature: (auth), (home), (chat), (blog), (profile)...
│       ├── components/       # Chat, feed, trainer catalog, shared UI
│       └── hooks/            # Data-fetching hooks (auth, chat, catalog, invitations)
└── packages/
    └── backend/              # Convex backend
        └── convex/
            ├── schema.ts     # Full data model
            ├── chat/         # Conversations, messages, AI agent & tools
            ├── profiles/     # Client / trainer / admin profiles
            ├── branches/     # Sedes, cities, addresses
            └── ...           # trainers, clients, posts, invitations, health metrics
```

## Getting Started

### Prerequisites

- **Node.js 20+** (npm 11 recommended)
- An account on [Convex](https://convex.dev) and [Clerk](https://clerk.com)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure the Convex backend (creates a project and connects it)
npm run dev:setup
```

> [!TIP]
> Follow the [Convex + Clerk guide](https://docs.convex.dev/auth/clerk) to wire up authentication.

### Environment variables

Copy the example files and fill in your keys:

```bash
# Web app
cp apps/web/.env.example apps/web/.env.local

# Mobile app
cp apps/native/.env.example apps/native/.env.local
```

| Variable | App | Description |
| --- | --- | --- |
| `VITE_CONVEX_URL` | web | Convex deployment URL |
| `VITE_CLERK_PUBLISHABLE_KEY` | web | Clerk publishable key |
| `EXPO_PUBLIC_CONVEX_URL` | native | Convex deployment URL |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | native | Clerk publishable key |

### Run the development servers

```bash
# Everything (web + native + backend)
npm run dev

# Web dashboard only → http://localhost:3001
npm run dev:web

# Mobile app (Expo Go / dev client)
npm run dev:native

# Backend only
npm run dev:server
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps |
| `npm run check-types` | Type-check all workspaces |
| `npm run dev:web` | Start the web dashboard |
| `npm run dev:native` | Start the Expo dev server |
| `npm run dev:server` | Start the Convex backend |
| `npm run dev:setup` | Configure and connect a Convex project |

## Testing

Each workspace has its own test suite:

```bash
# Web (Vitest)
cd apps/web && npm run test:run

# Mobile (Jest + RNTL)
cd apps/native && npm test

# Backend (Vitest)
cd packages/backend && npm test
```

The mobile suite covers 300+ test cases across auth, chat, feed, trainer catalog, validation, navigation, and UI components. See `apps/native/README_TESTS.md` and `apps/web/TESTING.md` for details.

## CI/CD

GitHub Actions workflows run on pull requests to `main` and deploy on push:

| Workflow | Path | What it does |
| --- | --- | --- |
| `web-ci.yml` | `apps/web/**` | Runs web tests |
| `native-ci-cd.yml` | `apps/native/**` | Runs native tests, then builds & deploys via EAS |
| `backend-ci-cd.yml` | `packages/backend/**` | Runs backend tests, then deploys to Convex |

Required secrets: `EXPO_TOKEN`, `CONVEX_DEPLOY_KEY`.

## Documentation

- **Docs**: [Documentation Doc](https://docs.google.com/document/d/1xdY8uzzLSj79FdIuDiL4xp_QojdCVcxX7tmX4KEyx7M/edit?usp=sharing)
- **Figma**: [Design System - EHC GYM](https://www.figma.com/design/xmfq0nX8GzbLPEG9Dj3mfZ/Design-System-EHC-GYM?node-id=49-7390&t=gnWnIHrg3r2z4ahp-1)
- **Notion**: [Roles Docs](https://www.notion.so/EHC-GYM-24e4722f677880d69fc2d0c17d2835fb?source=copy_link)