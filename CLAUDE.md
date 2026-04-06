# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shadcn Admin is an admin dashboard SPA built with React 19, Vite 7, TypeScript, Tailwind CSS v4, and Shadcn/UI (new-york style). It uses TanStack Router for file-based routing with automatic code-splitting, TanStack React Query for server state, Zustand for client state (auth), and React Context for app-wide settings (theme, layout, direction, font).

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build` (runs `tsc -b && vite build`)
- **Lint:** `pnpm lint` (ESLint)
- **Format:** `pnpm format` (Prettier write) / `pnpm format:check` (Prettier check)
- **Unused code detection:** `pnpm knip`
- **Add Shadcn component:** `pnpm dlx shadcn@latest add <component>`

No test framework is configured.

## Architecture

### Routing (TanStack Router — file-based)

Routes live in `src/routes/`. The route tree is auto-generated in `src/routeTree.gen.ts` — never edit this file manually.

- `__root.tsx` — Root route, wraps app with providers (QueryClient, Theme, Font, Direction)
- `_authenticated/` — Protected route layout segment; all dashboard pages are children
- `(auth)/` — Auth pages (sign-in, sign-up, forgot-password, otp); parentheses = layout group, no URL segment
- `(errors)/` — Error pages (401, 403, 404, 500, 503)
- `$error.tsx` — Dynamic error route segment

Routes define Zod schemas for search param validation, providing type-safe URL state.

### Feature Organization

`src/features/<feature>/` — Each feature (tasks, users, chats, dashboard, settings, apps, auth, errors) owns its components, data schemas, and logic. Features are connected to routes but self-contained.

### Component Layers

- `src/components/ui/` — Shadcn UI primitives (some customized for RTL). Excluded from linting and knip.
- `src/components/layout/` — App shell (sidebar, header, main container)
- `src/components/data-table/` — Reusable data table building blocks (filters, pagination, toolbar, bulk actions)
- `src/components/` — App-level shared components (command menu, theme switch, profile dropdown)

### State Management

1. **URL state** — Table pagination, filters, and search synced via `useTableUrlState` hook
2. **Server state** — TanStack React Query (mock data via faker currently; Axios infrastructure ready)
3. **Client state** — Zustand auth store (`src/stores/auth-store.ts`), token persisted in cookies
4. **App settings** — React Context providers in `src/context/` for theme, layout, direction, font, search — all cookie-persisted

### Styling

Tailwind CSS v4 with CSS custom properties for theming (`src/styles/theme.css`). Supports dark mode and RTL. Utility helpers: `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge). Component variants use class-variance-authority (cva).

## Key Conventions

- **Path alias:** `@/*` maps to `src/*`
- **Imports:** `type` keyword required for type-only imports (enforced by ESLint)
- **Import order:** Enforced by Prettier plugin (@trivago/prettier-plugin-sort-imports) — React → globals → radix → tanstack → internal → relative
- **No console.log:** `no-console` ESLint rule is set to error
- **Unused vars:** Prefix with `_` to suppress lint errors
- **Semicolons:** Off (Prettier enforced)
- **Quotes:** Single quotes (Prettier enforced)
- **Form pattern:** Zod schema → React Hook Form with zodResolver → Shadcn form components
- **Dialog/drawer state:** Managed through feature-level context providers (e.g., `TasksProvider`)
