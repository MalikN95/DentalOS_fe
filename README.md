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
    ui/         # design-system components (Dashlab UI kit): Button, Badge, TextField, Checkbox, RadioButton, SwitchToggle, Alert, EmptyState, Modal, Pagination, SearchSelect
  common/       # shared constants, types (incl. generated API schema)
  helpers/      # stateless utilities (openapi-fetch client)
  hooks/        # custom hooks (business logic)
  store/        # Redux Toolkit store, slices, selectors, typed hooks
```

## UI kit

Components follow the Dashlab Figma design system. Design tokens (colors, radii, focus ring) are CSS variables in `src/app/globals.css`. Live showcase: `/ui-kit` route. All components are pure UI with optional `className`/`style`/`onClick` props.

### Modal

`Modal` is the single shell for every dialog (`PatientFormModal`, `CreateAppointmentModal`, `CreateBranchModal`, `SaveSettingsModal`). It owns the overlay, sticky header and sticky footer, while only the body scrolls — so long forms can never push the action buttons out of the viewport.

- `title`, `children` (body), `footer` (usually two `Button`s), `size` — `sm` 420px / `md` 640px (default) / `lg` 880px
- `onSubmit` — when passed, the header/body/footer are wrapped in a `<form>`, so a `type="submit"` button in the footer submits the body fields
- `onClose` — renders the × button, closes on overlay click and on `Escape`; `isLocked` blocks all three (e.g. while saving)
- Overflow affordances come from the `useScrollShadow` hook (`src/hooks/useScrollShadow.ts`): a gradient shadow appears at the top and/or bottom edge only in the direction that can still be scrolled, plus a chevron button in the bottom-right that scrolls one screen down while more content is hidden. Content growth (conditional fields, async data) is tracked via `ResizeObserver`.
- Autofill safety net: browser/password-manager autofill sets input values without the events React listens to, so react-hook-form would validate stale empty values ("Укажите имя" on a visibly filled field). On submit the modal calls `replayAutofill` (`src/helpers/autofill.ts`), which re-dispatches native `input`/`change` events — React skips controls whose value it already knows, so only the out-of-sync ones are flushed into form state.
- Body scroll is locked while a modal is open. Labels are localizable via `closeLabel` / `scrollHintLabel` (`common.close`, `common.scrollForMore`).

## Pages

- `/login` — clinic login via `POST /api/auth/login`. Subdomain is parsed from the URL hostname (`maximum.localhost` → `maximum`, sent as `X-Clinic-Subdomain`). Fallback: `NEXT_PUBLIC_CLINIC_SUBDOMAIN` when opened on bare `localhost`. Layout is a two-column shell: a gradient brand panel (tagline + feature list + security note, all from `t.login`) and the form panel (email/password with leading `MailIcon` / `LockIcon`, password visibility toggle). The brand panel is hidden below 860px and replaced by a compact logo lockup; the entrance animation is disabled under `prefers-reduced-motion`.
- `/` — dashboard (`DashboardPageContent`): 4 stat cards (today's appointments, new patients, today's revenue, today's cancellations — `helpers/dashboard.ts` builds them from `useTodayAppointments` + `useTodayRevenue` + `useNewPatientsToday`), the same today's-appointments table as `/appointments` (with "+ New appointment"), and an upcoming-visits sidebar derived from the non-terminal appointments. The revenue card needs `owner`/`admin`/`accountant` role (`GET /api/analytics/revenue`) and shows "No access" for other roles instead of erroring.
- `/appointments` — today's appointments from `GET /api/appointments?from=&to=` (React Query hook `useTodayAppointments`). Requires login. `AppointmentsTable` (shared with `/`) fills the remaining page height (`.page { height: 100% }` / `.tableSection { flex: 1; min-height: 0 }`, mirroring the `PatientsTable` layout) with a sticky `thead` and an internally-scrolling body, so the title/date-nav/"+ New appointment" header never moves. Below 768px the table is replaced by a stacked card list (same data, same sticky header above it, no horizontal scroll).
- `/settings` — clinic settings (`GET/PATCH /api/clinic`, logo upload) and branches CRUD (`/api/branches`). Name and subdomain are read-only. Timezone / currency / language are searchable `SearchSelect` dropdowns built from `Intl` (`helpers/locale-options`); languages limited to ru/en/ky. Saving opens a `SaveSettingsModal` confirmation that runs the profile update. UI strings come from a locale dictionary (`common/locale/settings.locale`), keyed by the selected language (ru/en, ky→ru fallback).
- `/patients` — full patients CRUD over `/api/patients` (React Query). Server-side search (name/phone/email), active/inactive filter, pagination (default 20, options 10/20/50/100/200). Create/edit via `PatientFormModal` (`usePatientForm`, React Hook Form + Zod), delete via `DeletePatientDialog`. List state in `usePatients`, mutations in `usePatientForm` / `useDeletePatient`. Click a patient name → detail page. `PatientsTable` fills the page height with a sticky `thead` / scrolling body (same `height:100%`/`flex` chain as the page wrapper); below 768px the table is replaced by a card list that scrolls in the same bounded area, so the title/toolbar/pagination never move.
- `/patients/[id]` — patient card, laid out as two compact 3-column rows plus a full-width timeline (each cell a self-contained card, `PatientDetailContent.module.css#row`, collapsing to 2 then 1 column below 1100px/700px):
  - Row 1: `PatientInfoPanel` (contacts, allergies, chronic diseases, insurance) → `PatientDentalChart` → `PatientVisits` (upcoming / past visits, each `VisitCard` expands to the clinical record merged from `/api/medical-records`; the "История посещений" section is client-paginated, **default 5 rows**, options 5/10/20/50). This row is height-matched: `.profileRow` caps it at 460px (`auto` again below the 1100px/700px breakpoints, where it re-wraps to 2/1 columns) and each card fills that height (`height:100%` + a `flex:1; min-height:0; overflow-y:auto` inner body below its fixed header), so a longer list scrolls in place instead of stretching its neighbors.
  - Row 2: `PatientBilling` (the patient's own invoices, via `usePatientInvoices` + `/api/invoices?patientId=`, reusing `InvoicesTable` with `showPatientColumn={false}` and client-side pagination, default 5 rows) → `PatientActions` (compact card holding just "+ Новая запись", opening the shared `CreateAppointmentModal`) → `PatientTreatmentPlans` (top 5 plans via `useTreatmentPlans({ patientId })`, reusing `TreatmentPlanCard` with the new `showPatientName={false}` and the existing `CreateTreatmentPlanModal` / `TreatmentPlanDetailModal`).
  - Row 3: `PatientTimeline` renders a horizontal, zoomable/pannable axis of the patient's real history — appointments, their clinical record, and invoices (`helpers/patient-timeline.ts#buildPatientTimeline`) — color-coded by outcome (green/blue/red/gray) with a "Today" marker; there's no call/SMS/letter logging in the backend yet, so the timeline only plots events the API actually has.
  - Data via `usePatientDetail` (`/patients/:id` + `/patients/:id/history` + `/medical-records?patientId`).
- `/staff` — employees CRUD over `/api/staff` (React Query). Server-side search (name/email/phone), role dropdown filter, working/not-working filter, pagination (default 20, options 10/20/50/100/200). `StaffTable` shows initials avatar, role badge, contacts, specializations and branch. Create/edit via `StaffFormModal` (`useStaffForm`, React Hook Form + Zod) — the doctor-profile fieldset (branch, experience, specializations, education, description) appears only when the selected role is `doctor`; the password field is required on create and "leave empty to keep" on edit. Delete via `DeleteStaffDialog`. List state in `useStaff`, mutations in `useStaffForm` / `useDeleteStaff`, branch options via `useBranchOptions` (shares the settings branches cache). Below 768px `StaffTable` swaps to a card list (page scrolls normally, unlike the bounded `PatientsTable`/`AppointmentsTable`) — no horizontal scroll.
- `/treatment-plans` — placeholder page (`EmptyState`) until the API is wired.
- Auth guard: `DashboardShell` calls `useRequireAuth` — every page in the `(dashboard)` group (dashboard, appointments, patients, settings, staff, treatment-plans) redirects to `/login` when there is no access token and renders nothing meanwhile. Individual data hooks no longer redirect; they only gate requests via `enabled`.
- Layout: the `(dashboard)` route group shares a single `layout.tsx` that renders `DashboardShell` (client component: Redux user, logout). The shell derives the active sidebar item and header title from the pathname (`getNavItemByPathname`), so the sidebar and header persist across navigation.
- Responsive sidebar: below 768px the `Sidebar` becomes an off-canvas drawer (`useMobileSidebar`) toggled by a burger button in the `Header` (`MenuIcon`/`CloseIcon`). Opening it renders a backdrop overlay, locks body scroll and closes on `Escape`, backdrop click, the sidebar's own × button, or navigating to a nav link; the route change also closes it (effect on `pathname` in `DashboardShell`). The desktop-only icon-rail collapse toggle (`useSidebarCollapse`) is hidden on mobile and forced expanded there (`useIsMobile`), since a labelless rail doesn't fit a full-width drawer.

## Localization (i18n)

All UI strings live in locale dictionaries under `src/common/locale/dictionaries/` (`ru`, `en`, `ky`; `ru` is the source of truth and defines the `Dictionary` type). `LocaleProvider` (in `AppProviders`) exposes `useTranslation()` → `{ t, language, setLanguage }`; components read `t.<namespace>.<key>` instead of hardcoding text. `format(template, vars)` interpolates `{name}`-style placeholders. Language is persisted in `localStorage` (`dentalos.lang`, default `ru`) and switched live from the Settings → Language selector. Adding a locale = one dictionary file typed as `Dictionary`.

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

Husky runs `npm run build` (`next build`) on `pre-commit` — that is the only check. ESLint, Prettier and the commit-message format are **not** enforced on commit; run `npm run lint` / `npm run format` manually. There is no `commit-msg` hook (commitlint was removed), so commit messages are free-form.
