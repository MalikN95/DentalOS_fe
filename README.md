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
- `/` — dashboard (`DashboardPageContent`): 4 stat cards (today's appointments, new patients, today's revenue, today's cancellations — `helpers/dashboard.ts` builds them from `useTodayAppointments` + `useTodayRevenue` + `useNewPatientsToday`) plus the same `AppointmentsBoard` used on `/appointments` (with "+ New appointment"). The revenue card needs `owner`/`admin`/`accountant` role (`GET /api/analytics/revenue`) and shows "No access" for other roles instead of erroring.
- `/appointments` — today's appointments from `GET /api/appointments?from=&to=` (React Query hook `useTodayAppointments`; `/appointments` itself uses `useAppointmentsByDate` with a date-nav). Requires login. `AppointmentsBoard` (`components/dashboard/AppointmentsBoard`, shared with `/`) renders a day-timeline calendar instead of a plain table:
  - `AppointmentsBoardSidebar` on the left — a doctor filter (checkbox per doctor who has an appointment that day, derived from the appointment list itself, plus a "select all" master checkbox with indeterminate state) that hides/shows cards client-side without refetching, and below it a status-color legend (dot + label per `AppointmentStatus`, sourced from the same `appointmentStatusColor` map the badges use — so it can never drift from what the badges actually show). Collapses to a horizontal wrapped row above the board below 900px.
  - An hour-line grid from `helpers/appointments-board.ts` (`getBoardHourRange`/`groupAppointmentsByHour`, spanning the 08:00–20:00 clinic window and stretching to fit any booking outside it — hours with no bookings still render as a thin labeled divider).
  - Each booked hour renders one compact `AppointmentPatientCard` per appointment: a narrow patient-info column (avatar, name/age via `helpers/date.ts#calculateAge`, the appointment's `HH:MM–HH:MM` time range and duration, phone, service/doctor/cabinet, status badge, a payment badge, and a reference code), a strip of four quick-action icons with hover `Tooltip`s (call via `tel:`, email via `SendEmailModal`, record a payment via `PatientPaymentModal`, open the full profile), and — inline, to the right, not stacked below — that patient's own `PatientTimeline` in `compact` mode (their real history, see `/patients/[id]` below; opens at max zoom and ignores the mouse wheel there, since the card sits inside a long scrollable list), fed by the shared `usePatientTimeline` hook. A colored left-edge bar flags the patient's first-ever appointment (blue) or a cancelled one (orange); a red-tinted actions strip with a warning icon appears once an appointment is 15+ minutes past its start time and still `pending`/`confirmed` (only checked for today, ticks forward every minute). The payment badge (`helpers/appointment-payment.ts`, colored via the existing `helpers/invoice-status.ts#invoiceStatusColor`) reads the invoice for that appointment from the patient's own invoice list (`usePatientInvoices` — shares its query key with `usePatientTimeline`'s internal fetch, no extra request) and shows "Не оплачено" when there's no invoice yet, "Частично оплачено" or "Оплачено" otherwise; exact figures are one click away in `AppointmentManagePanel`. The reference code (`helpers/appointment-code.ts#getAppointmentCode`, also shown in `AppointmentManagePanel`) is a 7-character uppercase alphanumeric string hashed deterministically from the appointment's UUID — same appointment, same code, always, with no dedicated DB column. Clicking the card body opens `AppointmentManageModal`; clicking the name opens `PatientQuickViewModal`.
  - The board fills the remaining page height and scrolls internally, same as the old table did.
  - `CreateAppointmentModal` (`+ New appointment`, shared with `/patients/[id]`) asks for branch/patient/service/doctor/date-time and a **duration**: 15/30/45/60/90/120-minute preset chips plus a manual number input (`min=15`, `step=15`), pre-filled from the selected service's own duration (rounded to the nearest 15 minutes) until the user picks a chip or types their own value. `POST /api/appointments` accepts an optional `durationMinutes` (multiple of 15, 15–480) that overrides the service's default when present; `Appointment.durationMinutes`/`endTime` (`helpers/appointments.mapper.ts`, from the API's `endsAt`) are what the board card's time range renders from.
- `/settings` — clinic settings (`GET/PATCH /api/clinic`, logo upload) and branches CRUD (`/api/branches`). Name and subdomain are read-only. Timezone / currency / language are searchable `SearchSelect` dropdowns built from `Intl` (`helpers/locale-options`); languages limited to ru/en/ky. Saving opens a `SaveSettingsModal` confirmation that runs the profile update. UI strings come from a locale dictionary (`common/locale/settings.locale`), keyed by the selected language (ru/en, ky→ru fallback).
- `/patients` — full patients CRUD over `/api/patients` (React Query). Server-side search (name/phone/email), active/inactive filter, pagination (default 20, options 10/20/50/100/200). Create/edit via `PatientFormModal` (`usePatientForm`, React Hook Form + Zod), delete via `DeletePatientDialog`. List state in `usePatients` (accepts an `initialSearch` seed), mutations in `usePatientForm` / `useDeletePatient`. Click a patient name → detail page. `PatientsTable` fills the page height with a sticky `thead` / scrolling body (same `height:100%`/`flex` chain as the page wrapper); below 768px the table is replaced by a card list that scrolls in the same bounded area, so the title/toolbar/pagination never move. The page reads two one-shot query params (wrapped in `<Suspense>` in `page.tsx`, per Next's `useSearchParams` requirement): `?search=` seeds the search box (the top-nav search bar navigates here) and `?new=1` opens the create-patient modal on load, then both are stripped from the URL via `router.replace`.
- `/patients/[id]` — patient card, laid out as two compact 3-column rows plus a full-width timeline (each cell a self-contained card, `PatientDetailContent.module.css#row`, collapsing to 2 then 1 column below 1100px/700px):
  - Row 1: `PatientInfoPanel` (contacts, allergies, chronic diseases, insurance) → `PatientDentalChart` → `PatientVisits` (upcoming / past visits, each `VisitCard` expands to the clinical record merged from `/api/medical-records`; the "История посещений" section is client-paginated, **default 5 rows**, options 5/10/20/50). This row is height-matched: `.profileRow` caps it at 460px (`auto` again below the 1100px/700px breakpoints, where it re-wraps to 2/1 columns) and each card fills that height (`height:100%` + a `flex:1; min-height:0; overflow-y:auto` inner body below its fixed header), so a longer list scrolls in place instead of stretching its neighbors.
  - Row 2: `PatientBilling` (the patient's own invoices, via `usePatientInvoices` + `/api/invoices?patientId=`, reusing `InvoicesTable` with `showPatientColumn={false}` and client-side pagination, default 5 rows) → `PatientActions` (compact card holding just "+ Новая запись", opening the shared `CreateAppointmentModal`) → `PatientTreatmentPlans` (top 5 plans via `useTreatmentPlans({ patientId })`, reusing `TreatmentPlanCard` with the new `showPatientName={false}` and the existing `CreateTreatmentPlanModal` / `TreatmentPlanDetailModal`).
  - Row 3: `PatientTimeline` renders a horizontal, zoomable/pannable axis of the patient's real history — appointments, their clinical record, and invoices (`helpers/patient-timeline.ts#buildPatientTimeline`) — color-coded by outcome (green/blue/red/gray) with a "Today" marker; there's no call/SMS/letter logging in the backend yet, so the timeline only plots events the API actually has. The same component takes a `compact` prop (heading hidden, every circular element and the vertical scale shrunk as one unit) used to embed it inline in each `AppointmentPatientCard` on `/` and `/appointments`.
  - Data via `usePatientDetail` (`/patients/:id` + `/patients/:id/history` + `/medical-records?patientId`) and `usePatientInvoices`, composed by the shared `usePatientTimeline` hook (`hooks/usePatientTimeline.ts`) — the one place that assembles a patient's timeline events, so the profile page and the appointments board can't drift apart.
- `/staff` — employees CRUD over `/api/staff` (React Query). Server-side search (name/email/phone), role dropdown filter, working/not-working filter, pagination (default 20, options 10/20/50/100/200). `StaffTable` shows initials avatar, role badge, contacts, specializations and branch. Create (and the table's row-level edit action) still go through `StaffFormModal` (`useStaffForm`, React Hook Form + Zod) — the doctor-profile fieldset (branch, experience, specializations, education, services, description) appears only when the selected role is `doctor`; the password field is required on create and "leave empty to keep" on edit. Delete via `DeleteStaffDialog`. List state in `useStaff`, mutations in `useStaffForm` / `useDeleteStaff`, branch options via `useBranchOptions` (shares the settings branches cache). Below 768px `StaffTable` swaps to a card list (page scrolls normally, unlike the bounded `PatientsTable`/`AppointmentsTable`) — no horizontal scroll.
  - **Specializations** are a `StringTagField` (`src/components/patients/StringTagField/StringTagField.tsx`, the same pill-picker used for patient allergies/chronic diseases): pick from every specialization already used clinic-wide (`useSpecializationsCatalog` → `GET /api/staff/catalog/specializations`, a `DISTINCT jsonb_array_elements_text(specializations)` query, same pattern as the patients allergies catalog) or quick-add a new one — the new string is simply saved onto that doctor's profile, no separate catalog-create call needed.
  - **Services this doctor provides** are a `DoctorServicesField` (`src/components/staff/DoctorServicesField/`), a multi-select pill-picker keyed by service id (options from the existing `useServiceOptions()`), with an inline quick-create mini-form (name + price + duration, via the existing `useCreateServiceOption()` mutation — same one `ServicePickerField` uses in treatment plans) for a brand-new service. This populates the `doctor_services` join table (`DoctorProfileEntity.services`, backend `StaffDoctorDto.serviceIds`) — **assigning a service to a doctor here is what makes that doctor selectable for that service in the public booking widget**, since `BookingService.getDoctors` already filters on this exact relation.
- `/staff/[id]` — employee card (`StaffDetailContent`), edited inline instead of through a modal: the pencil icon toggles the same `useStaffForm` (React Hook Form + Zod) fields — name, email, phone, role, password, active toggle, and the doctor-profile fieldset (including the specializations/services pickers above) when the role is (or is switched to) `doctor` — directly in place over the read-only labels, with Save/Cancel replacing the pencil until submit or cancel. The doctor-schedule section below the card keeps its own separate save action and is unaffected.
- `/treatment-plans` — placeholder page (`EmptyState`) until the API is wired.
- Auth guard: `DashboardShell` calls `useRequireAuth` — every page in the `(dashboard)` group (dashboard, appointments, patients, settings, staff, treatment-plans) redirects to `/login` when there is no access token and renders nothing meanwhile. Individual data hooks no longer redirect; they only gate requests via `enabled`.
- Layout: the `(dashboard)` route group shares a single `layout.tsx` that renders `DashboardShell` (client component: Redux user, logout). The shell derives the active nav item from the pathname (`getNavItemByPathname`) and renders a single top bar, `TopNav` (`components/layout/TopNav`) — logo, a patient search box (submits to `/patients?search=`), the page nav (icon-over-label pills, same `NAV_ITEMS` as before, plus a "+ New patient" shortcut to `/patients?new=1`), notifications bell, user avatar/role and logout — which persists across navigation. `Sidebar`/`Header` and the icon-rail collapse concept (`useSidebarCollapse`) were removed when the nav moved from a left rail to this top bar.
- Responsive top nav: below 1024px the inline search box and nav pills hide behind a burger button (`useMobileNav`, `MenuIcon`/`CloseIcon`) that drops down a full-width panel with the search box, every nav item as a labeled row, and logout. Opening it renders a backdrop overlay, locks body scroll and closes on `Escape`, backdrop click, or navigating to a link; the route change also closes it (effect on `pathname` in `DashboardShell`). Below 1180px the clinic name and the user's name/role are hidden first to make room (avatar and icons stay).

## Localization (i18n)

All UI strings live in locale dictionaries under `src/common/locale/dictionaries/` (`ru`, `en`, `ky`; `ru` is the source of truth and defines the `Dictionary` type). `LocaleProvider` (in `AppProviders`) exposes `useTranslation()` → `{ t, language, setLanguage }`; components read `t.<namespace>.<key>` instead of hardcoding text. `format(template, vars)` interpolates `{name}`-style placeholders. Language is persisted in `localStorage` (`dentalos.lang`, default `ru`) and switched live from the Settings → Language selector. Adding a locale = one dictionary file typed as `Dictionary`.

## Typography

Global font is Roboto (`next/font/google`, weights 400/500/700, latin + cyrillic subsets), exposed as the `--font-roboto` CSS variable and applied in `globals.css`.

## Conventions

- Server Components by default, `'use client'` only where Redux/browser APIs are needed
- Named exports only (App Router pages/layouts are the framework exception)
- Server state via React Query, client state via Redux Toolkit
- Typed Redux hooks: `useAppDispatch` / `useAppSelector` from `src/store/hooks.ts`
- **React Compiler (`reactCompiler: true` in `next.config.ts`) + react-hook-form don't mix by default.** Reading a field with the plain `form.watch('x')` escape hatch (rather than the `useWatch` hook) for a value used in JSX — a `SwitchToggle`'s `checked` prop, an `isDoctor`-style conditional fieldset — silently stops re-rendering: the compiler memoizes across renders since `watch`'s return isn't a value it can see change, so the switch looks unclickable and the conditional fieldset never appears, with no console error. Every RHF form component in this codebase (`ServiceEditorModal`, `ClinicSettingsForm`, `CreateBranchModal`, `StaffFormModal`, `StaffDetailContent`, `PatientFormModal`) therefore does two things: uses `useWatch({ control, name })` instead of `watch(name)` for any field read directly in render, and opens with a `'use no memo'` directive (the compiler's own documented opt-out) since `useWatch` alone wasn't sufficient for compiler-memoized conditional JSX blocks derived from it (e.g. `{isDoctor ? <fieldset>… : null}`). Keep both when adding a new RHF-backed form here.

## Linting

ESLint 9 (flat config) with Airbnb style guide via `eslint-config-airbnb-extended` (base + next + typescript) on top of `eslint-config-next`, Prettier applied last.

## Pre-commit

Husky runs `npm run build` (`next build`) on `pre-commit` — that is the only check. ESLint, Prettier and the commit-message format are **not** enforced on commit; run `npm run lint` / `npm run format` manually. There is no `commit-msg` hook (commitlint was removed), so commit messages are free-form.
