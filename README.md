<div align="center">

# TMS Order Management Dashboard

**A production-grade frontend prototype for a Transportation Management System**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-5-433E38?style=flat-square)](https://zustand-demo.pmnd.rs)
[![Zod](https://img.shields.io/badge/Zod-4-3068B7?style=flat-square)](https://zod.dev)

</div>

---

## What is this?

A fully functional Order Management module for a TMS startup. The backend isn't ready yet — so this prototype ships with a realistic mock API (localStorage persistence, simulated network delays, random failures) that lets the team evaluate UX and finalize data contracts before backend development begins.

Built to production frontend standards: strict TypeScript, Feature-Sliced Design architecture, state machine–driven business logic, multi-draft persistence, and comprehensive error handling across every user flow.

---

## Features at a Glance

### Orders Table `/orders`

- Paginated list — 10 / 25 / 50 rows per page, `Showing X–Y of Z` counter
- **Columns:** Reference #, Status badge, Route (pickup → delivery, `+N stops`), Carrier, Equipment, Pickup Date, Rate, Stop count, Actions
- Column sorting on Pickup Date, Rate, and Status with direction indicator (↑ / ↓)
- Status **multi-select filter** — toggle individual statuses independently
- **Text search** debounced at 300ms — searches reference number, client name, carrier name simultaneously
- One-click **Clear filters** resets all active filters
- Loading skeleton rows, empty state with context message, error state with Retry
- **Inline status change** — click any badge to open a transition dialog; only valid next states shown
- **Local Drafts callout** above the table — appears when unsaved drafts exist, with Resume / Discard per draft
- **Row actions menu** — View · Edit (pending only) · Duplicate as Draft · Change Status · Delete with confirmation

### Draft Workspace `/orders/new`

- Up to **5 draft tabs** open simultaneously — instant switching, no data loss
- Tab labels show the entered reference number or "New Draft"
- **Amber dot** on tabs with unsaved changes (dirty indicator)
- **Autosave every 5 seconds** and on blur — "Saved 2 minutes ago" indicator in the header
- Full session persistence — close the browser, reopen, all drafts restored exactly as left
- Header controls: New tab `+` · Save · Clear fields · Delete Draft · Clear All · Submit Order · Close
- **Three-section scrollable form:**
  1. **Client** — Client Name, Reference Number (auto-generated, editable)
  2. **Order** — Carrier (searchable combobox, shows name + MC#), Equipment Type, Load Type, Rate, Weight, Notes
  3. **Stops** — dynamic list: add / reorder (↑↓) / delete; min 2, max 5; each stop has address, location name, appointment type, date/time, notes
- Zod validation with inline errors on blur, scroll to first error on submit, loading spinner, success/error toasts

### Order Detail `/orders/:id`

- Reference number + status badge in the header
- Route summary: `City → City` or `City → +N → City`
- Edit / Delete action buttons (gated by status)
- Full metadata: Client, Carrier (with MC#), Equipment, Load Type, Rate, Weight, Notes
- **Stops list** — numbered, color-coded connector dots (green pickup, red drop-off, blue intermediate stop)
- **Status history timeline** — vertical, newest entry highlighted, cancellation reasons shown inline

### Edit Order `/orders/:id/edit`

- Accessible only for `pending` orders — other statuses show an informational block
- Same three-section form as the draft workspace (single shared component)
- Pre-filled from the existing order data
- Save → success toast → redirect to order detail

### Status Machine

```
[Draft] ──Submit──→  pending ──→ in_transit ──→ delivered   (final)
                        │               │
                        └───────────────┴──→ cancelled      (final)
```

All transition logic lives in one file and is enforced in the API layer, inline badge, Change Status dialog, and row action guards — never duplicated. Cancellation always requires a mandatory reason.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 | Concurrent features, stable ecosystem |
| Language | TypeScript 6 (strict) | Catch entire error classes at compile time |
| Build | Vite 8 | Sub-second HMR, native ESM in dev |
| Routing | React Router v7 | Nested layouts, lazy-loaded routes |
| Styling | Tailwind CSS v4 | Utility-first, zero runtime overhead |
| UI Primitives | shadcn/ui + Radix UI | Headless — full style control + built-in accessibility |
| Server State | TanStack Query v5 | Caching, background refetch, mutation invalidation — no manual loading/error state |
| Client State | Zustand v5 | Minimal boilerplate for draft workspace; persists across navigation |
| Forms | React Hook Form v7 + Zod v4 | Uncontrolled inputs (no re-render per keystroke), schema-derived TypeScript types |
| Icons | Lucide React | Consistent, tree-shakeable SVG icon set |

---

## Architecture

The project follows **Feature-Sliced Design (FSD)** — a layered architecture where each layer imports only from layers below it.

```
src/
├── app/
│   ├── providers/        QueryClientProvider, ToastProvider
│   ├── router/           Route definitions (all pages lazy-loaded via React.lazy)
│   └── styles/           Tailwind entry point
│
├── pages/                Thin route shells — wire state to widgets
│   ├── orders-list/
│   ├── order-detail/
│   ├── order-edit/
│   └── order-new/        Draft workspace page
│
├── widgets/              Self-contained UI blocks, no business logic
│   ├── orders-table/
│   ├── order-filters/
│   ├── order-form/       Shared form: used by draft workspace AND edit page
│   │   └── sections/     ClientSection · OrderSection · StopsSection
│   ├── order-status-timeline/
│   └── local-drafts-panel/
│
├── features/             User actions that trigger mutations or state changes
│   ├── change-order-status/
│   ├── create-order-draft/   ← Zustand draft store lives here
│   ├── delete-order/
│   ├── duplicate-order-as-draft/
│   └── edit-order/
│
├── entities/             Domain types, hooks, formatters, UI primitives per entity
│   ├── order/
│   │   ├── model/        types.ts · status-machine.ts · use-orders.ts
│   │   ├── lib/          order.schema.ts (Zod) · formatters.ts
│   │   └── ui/           OrderStatusBadge
│   └── carrier/
│       ├── model/        types.ts · use-carriers.ts
│       └── lib/          formatters.ts
│
├── shared/
│   ├── api/              Re-export layer — the only entry point for mock API calls
│   ├── config/           query-keys.ts · constants.ts
│   ├── hooks/            useDebounce
│   ├── lib/              utils.ts
│   ├── types/            Shared cross-feature types
│   └── ui/               Skeleton · EmptyState · ErrorState · ConfirmDialog · Pagination · Toast
│
└── mocks/                Backend simulation — swap this folder for real fetch calls
    ├── api/              orders.api.ts · carriers.api.ts
    ├── seed/             Deterministic seed data (50 orders, 15 carriers)
    └── storage/          localStorage helpers · draft-storage.ts
```

**Why FSD over a flat `components/hooks/utils` folder structure?**

With 60+ source files and multiple interconnected features, flat folders become hard to navigate. FSD enforces a one-way dependency rule: pages → widgets → features → entities → shared. Following that rule means you can look at any import and immediately know the scope of the change. Removing a feature means deleting a folder — no hunting for scattered references.

---

## State Management in Depth

### Server State — TanStack Query

Every order and carrier fetch goes through React Query. It provides caching, loading/error state, background refetch, and smart invalidation after mutations — without a single `useState` for loading flags.

```ts
// Query keys are typed and centralized — no magic strings
QUERY_KEYS.orders.list({ page: 1, pageSize: 10, status: ['pending'] })
// → ['orders', 'list', { page: 1, pageSize: 10, status: ['pending'] }]
```

After creating an order, `invalidateQueries({ queryKey: QUERY_KEYS.orders.all })` automatically refetches the list. `staleTime: 30_000` on order detail means navigating away and back within 30 seconds returns cached data instantly.

**Why not Redux Toolkit?** RTK Query is excellent, but for a data-fetching dashboard without complex cross-feature shared state, React Query is lighter, faster to write, and simpler to understand.

### Client State — Zustand

The draft workspace needs state that survives navigation. Context is destroyed when its provider unmounts — switching from `/orders` to `/orders/new` and back would wipe all drafts. Zustand lives outside the React tree, so navigation never resets the store.

The draft store manages:

| State | Purpose |
|---|---|
| `tabs` | Open tabs: id, label, dirty flag, last-saved timestamp |
| `drafts` | In-memory form data per draft ID |
| `activeDraftId` | Which tab is currently focused |
| `isAutosaving` | Drives the "Saving…" indicator in the header |

**Why not mix them?** Orders come from the server and belong in React Query's cache. Drafts are ephemeral workspace state with no server representation. Mixing them would require special-casing the cache or polling for non-existent resources.

---

## Mock API

All app code imports from `src/shared/api/`. The implementations live in `src/mocks/`. To wire up a real backend, only `src/shared/api/` changes — zero component or hook modifications.

### Network behavior

| Characteristic | Value |
|---|---|
| Simulated delay | 300ms + 0–500ms random jitter per request |
| Random error rate | ~5% — any request can fail |
| Persistence | localStorage — all changes survive page reloads |
| Seed data | 50 orders + 15 carriers on first load |
| Schema versioning | Bump `SEED_VERSION` to trigger a fresh reseed |

### Available methods

```ts
getOrders({ page, pageSize, sortBy?, sortOrder?, status?, search? })
  → Promise<{ data: Order[]; total: number }>

getOrder(id)                              → Promise<Order>
createOrder(input)                        → Promise<Order>
updateOrder(id, input)                    → Promise<Order>   // pending only
deleteOrder(id)                           → Promise<void>    // pending only
updateOrderStatus(id, status, note?)      → Promise<Order>
getCarriers({ search? })                  → Promise<Carrier[]>
```

The 5% random error rate isn't noise — it's intentional. It ensures every user-facing action has been tested against failure: the table shows a Retry button, status changes show an error toast, form submission handles the error gracefully.

---

## Draft Persistence Design

Drafts use two localStorage key patterns:

```
draft:index      →  string[]    ordered list of open draft IDs (preserves tab order)
draft:{id}       →  LocalDraft  { id, title, formData, savedAt }
```

Separating the index from the data means the Local Drafts panel above the table can read all draft titles without deserializing every form's payload.

**Autosave flow:**

```
1. initDrafts()         on workspace mount → restore all tabs from localStorage
2. watch()              RHF → every field change → updateDraftData() in-memory + dirty flag
3. Every 5s + on blur   → persistDraft() → write to localStorage → clear dirty flag
4. Submit success       → closeDraft() → remove localStorage entry + close tab
```

This means an incomplete draft is never lost — it survives page refreshes, tab switches, and browser restarts.

---

## Validation

Implemented with Zod in `src/entities/order/lib/order.schema.ts`. TypeScript types are derived directly from the schema via `z.infer<typeof createOrderSchema>` — validation rules and types are always in sync.

| Field | Rule |
|---|---|
| `referenceNumber` | Required · max 50 chars · alphanumeric + `-_` only |
| `clientName` | Required · max 100 chars |
| `carrierId` | Required on submit |
| `rate` | Positive · max $100,000 · stored in cents |
| `weight` | Positive · max 80,000 lbs |
| `stops` | Min 2 · max 5 · at least one `pick_up` + one `drop_off` |
| `address.state` | 2-letter uppercase code |
| `address.zip` | US ZIP: 5 digits or 9 digits (5+4 format) |

Errors appear on blur (`mode: 'onBlur'`). On submit, the form scrolls smoothly to the first invalid field — implemented by querying `[aria-invalid="true"]` after a `requestAnimationFrame` (React updates the DOM asynchronously, so the query runs after the render cycle completes).

---

## Data Model

```ts
type OrderStatus     = 'pending' | 'in_transit' | 'delivered' | 'cancelled'
type EquipmentType   = 'dry_van' | 'reefer' | 'flatbed' | 'step_deck' | 'lowboy' | 'tanker' | 'box_truck'
type LoadType        = 'ftl' | 'ltl' | 'partial'
type StopType        = 'pick_up' | 'drop_off' | 'stop'
type AppointmentType = 'fixed' | 'window' | 'fcfs'

interface Order {
  id: string
  referenceNumber: string       // "TMS-2024-0001"
  status: OrderStatus
  clientName: string
  carrier: Carrier
  equipmentType: EquipmentType
  loadType: LoadType
  stops: Stop[]                 // 2–5, must include pickup + dropoff
  weight: number
  rate: number                  // stored in cents
  notes: string
  statusHistory: StatusChange[]
  createdAt: string
  updatedAt: string
}

interface StatusChange {
  from: OrderStatus | null
  to: OrderStatus
  changedAt: string
  note?: string
  changedBy: string
}

interface LocalDraft {
  id: string
  title: string
  formData: Partial<CreateOrderInput>
  savedAt: string
}
```

---

## Business Rules

```
Status machine:
  pending    → in_transit | cancelled
  in_transit → delivered  | cancelled
  delivered  → (final — no transitions)
  cancelled  → (final — no transitions)

Cancellation  → mandatory reason required (saved in statusHistory)
Edit order    → only when status is pending
Delete order  → only when status is pending (confirmation dialog required)
Stops         → minimum 2, maximum 5 per order
Drafts        → maximum 5 open tabs at once
```

All status logic lives in `src/entities/order/model/status-machine.ts` — a pure map with helper functions (`isTransitionAllowed`, `isFinalStatus`, `canEdit`, `canDelete`, `requiresCancellationReason`). No status logic is embedded in components.

---

## Getting Started

**Requirements:** Node.js 18+

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Production build
npm run build

# Lint
npm run lint
```

No environment variables required — the mock API is fully self-contained.

> **Reset seed data:** DevTools → Application → Local Storage → delete all keys starting with `tms:` and `draft:`, then reload the page.

---

## Key Architectural Decisions

### TanStack Query over Redux Toolkit

RTK Query solves the same problem but requires wiring slices, reducers, and an API config layer. For a fetch-heavy dashboard with no complex cross-feature shared state, React Query is faster to write, easier to read, and just as capable. Redux becomes the right answer when you have meaningful derived state across multiple domains — this project doesn't have that.

### Zustand for draft state

Draft tabs need to survive page navigation. React Context is destroyed when its provider unmounts. Zustand lives outside the React tree, so switching from `/orders` to `/orders/new` and back preserves all open tabs. The store is flat and small — Zustand's direct mutation API is clearer than a reducer for this use case.

### Isolated mock layer

Every component imports from `src/shared/api/` — a thin re-export layer. The actual implementations are in `src/mocks/`. When a real backend ships, replacing those implementations (same function signatures, real `fetch` calls) is the only change needed. No component touches `mocks/` directly.

### Scroll to first error on submit

React Hook Form calls the `onInvalid` callback when validation fails. At that point, RHF updates its internal state but React hasn't flushed to the DOM yet. `requestAnimationFrame` defers the `querySelector('[aria-invalid="true"]')` call until after the browser's render cycle, when the attribute is actually present.

---

## What I'd Improve With More Time

- **URL-synced filters** — serialize active filters, sort state, and current page into query params so filtered views are bookmarkable and shareable
- **Optimistic status updates** — immediately reflect status changes in the UI, roll back on API error (React Query supports this via `onMutate` / `onError`)
- **Virtualized table rows** — `@tanstack/virtual` for smooth performance with thousands of orders
- **Drag-to-reorder stops** — ↑↓ buttons work; a `@dnd-kit` drag handle would be significantly more ergonomic for frequent reordering
- **Unit tests** — state machine transitions, Zod schema edge cases, draft store actions (all pure logic, easy to test without rendering)
- **E2E tests** — Playwright scripts for the three critical paths: create an order from draft, change a status, persist and resume a draft across a page reload
- **React Query DevTools** — wired in dev mode for inspecting the cache during development
- **Date range filter UI** — the API and types already support `dateFrom` / `dateTo` filter params; the UI control is the only missing piece

---

<div align="center">

Made as a take-home assignment · Position: Strong Junior / Middle Frontend Developer

</div>
