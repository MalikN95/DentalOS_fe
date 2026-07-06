# DentalOS Frontend

Dental Practice Management System (DPMS) web client.

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- TanStack Query (React Query) — server state
- Redux Toolkit — client state (auth), typed hooks
- React Hook Form + Zod — forms and validation
- TanStack Table — data grids
- FullCalendar — appointment scheduling
- React Flow (`@xyflow/react`) — treatment plan diagrams
- openapi-fetch + openapi-typescript — typed API client generated from backend Swagger

## Requirements

- Node.js 22+
- Running DentalOS backend (for API codegen and data)

## Getting started

```bash
# 1. Install dependencies
npm ci

# 2. Configure environment
cp .env.example .env.local

# 3. (optional) Generate typed API client — backend must be running on :4000
npm run codegen:api
# then re-export `paths` from src/common/types/api-schema.d.ts in src/common/types/api.ts

# 4. Start dev server
npm run dev
```

App: `http://localhost:3000`

## Docker

```bash
docker build -t dentalos-fe \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_WS_URL=https://api.example.com \
  .
docker run -p 3000:3000 dentalos-fe
```

`NEXT_PUBLIC_*` variables are inlined at build time, so they are passed as build args (standalone output).

## Scripts

| Script                      | Description                             |
| --------------------------- | --------------------------------------- |
| `npm run dev`               | Dev server                              |
| `npm run build`             | Production build (standalone)           |
| `npm run lint` / `lint:fix` | ESLint                                  |
| `npm run format`            | Prettier                                |
| `npm run codegen:api`       | Generate API types from backend Swagger |

## Project structure

```
src/
  app/          # Next.js routing & layouts (Server Components by default)
  components/
    ui/         # design-system components (Dashlab UI kit): Button, Badge, TextField, Checkbox, RadioButton, SwitchToggle, Alert
  common/       # shared constants, types (incl. generated API schema)
  helpers/      # stateless utilities (openapi-fetch client)
  hooks/        # custom hooks (business logic)
  store/        # Redux Toolkit store, slices, selectors, typed hooks
```

## UI kit

Components follow the Dashlab Figma design system. Design tokens (colors, radii, focus ring) are CSS variables in `src/app/globals.css`. Live showcase: `/ui-kit` route. All components are pure UI with optional `className`/`style`/`onClick` props.

## Pages (mock data)

- `/login` — clinic login: React Hook Form + Zod validation, mock auth (see the demo hint on the page), stores credentials in the Redux auth slice, redirects to the dashboard.
- `/` — dashboard: stat cards, today's appointments table, upcoming visits list. Data comes from `src/common/mocks/` until the API is wired.
- `/appointments` — appointments table (mock data).
- `/patients`, `/treatment-plans`, `/staff`, `/settings` — placeholder pages (`EmptyState`) until the API is wired.
- Layout: the `(dashboard)` route group shares a single `layout.tsx` that renders `DashboardShell` (client component: Redux user, logout). The shell derives the active sidebar item and header title from the pathname (`getNavItemByPathname`), so the sidebar and header persist across navigation.

## Typography

Global font is Roboto (`next/font/google`, weights 400/500/700, latin + cyrillic subsets), exposed as the `--font-roboto` CSS variable and applied in `globals.css`.

## Conventions

- Server Components by default, `'use client'` only where Redux/browser APIs are needed
- Named exports only (App Router pages/layouts are the framework exception)
- Server state via React Query, client state via Redux Toolkit
- Typed Redux hooks: `useAppDispatch` / `useAppSelector` from `src/store/hooks.ts`

## Linting

ESLint 9 (flat config) with Airbnb style guide via `eslint-config-airbnb-extended` (base + next + typescript) on top of `eslint-config-next`, Prettier applied last.

## Pre-commit

Husky + lint-staged (ESLint + Prettier on staged files) + commitlint (conventional commits).
