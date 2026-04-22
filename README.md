# TMS Order Management Dashboard

A production-like frontend prototype for a Transportation Management System (TMS) — built as a take-home assignment.

---

## Overview

This is a fully functional Order Management Dashboard that demonstrates real-world frontend architecture patterns:
- Orders list with filtering, sorting, and pagination
- Multi-tab draft workspace with localStorage autosave
- Order detail view with status timeline
- Pending-only edit flow
- Mock API layer that behaves like a real backend

---

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npm run lint      # ESLint
```

---

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript ~6.0 (strict) |
| Build | Vite 8 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn/ui (Radix UI + cva) |
| Server State | TanStack React Query v5 |
| Local State | Zustand v5 |
| Forms | React Hook Form v7 + Zod v4 |
| Icons | Lucide React |

---

## Architecture

```
src/
  app/
    providers/      QueryClientProvider, ToastProvider
    router/         Route definitions (lazy-loaded pages)
    styles/         Tailwind globals

  pages/            Route-level components (thin shells)
    orders-list/
    order-detail/
    order-edit/
    order-new/      Draft workspace

  widgets/          Feature-level UI components (no business logic)
    orders-table/
    order-filters/
    order-form/     Shared form used by draft workspace + edit page
    order-status-timeline/
    local-drafts-panel/

  features/         User interactions that trigger mutations or state changes
    change-order-status/
    create-order-draft/   (includes Zustand draft store)
    delete-order/
    duplicate-order-as-draft/
    edit-order/

  entities/         Domain types, hooks, formatters, UI per entity
    order/
      model/        types.ts, status-machine.ts, use-orders.ts
      lib/          formatters.ts, order.schema.ts (Zod)
      ui/           OrderStatusBadge
    carrier/
      model/        types.ts, use-carriers.ts
      lib/          formatters.ts

  shared/
    api/            Thin re-export layer (components only import from here)
    lib/            utils.ts, date helpers
    ui/             Reusable primitives: Skeleton, EmptyState, ErrorState, ConfirmDialog, Pagination, Toast
    hooks/          useDebounce
    config/         query-keys.ts, constants.ts
    types/          draft.ts, shared types

  mocks/
    api/            Mock order and carrier CRUD functions
    storage/        localStorage helpers
    seed/           Deterministic seed data generators
```

### Why this structure?

The slice-by-feature approach (entities → features → widgets → pages) scales well because:
- **Entities** own the domain — types live next to their hooks and formatters
- **Features** encapsulate mutations and user-triggered workflows
- **Widgets** are stateless UI compositions — no business logic
- **Pages** are thin shells that wire state to widgets
- **Shared** contains only truly generic, reusable primitives

---

## State Management

### Server State: React Query

All orders and carriers data is managed by React Query. This gives us:
- Automatic caching and background refetch
- Simple invalidation after mutations
- Loading/error states without manual `useState`
- Query keys as a typed contract (`QUERY_KEYS` in `shared/config/query-keys.ts`)

React Query was chosen over Redux Toolkit because the data here is fundamentally server-shaped (fetched, cached, invalidated) — not shared client UI state.

### Local State: Zustand

The draft workspace uses Zustand (`features/create-order-draft/draft-store.ts`) for:
- Active draft tab ID
- In-memory draft tab metadata (label, dirty flag, last-saved timestamp)
- Draft form data mirrors (between autosave ticks)
- Autosave indicator

Zustand was chosen over `useState` + Context because:
1. Draft state needs to survive navigation (from table → workspace → back)
2. No React re-render when only the autosave timestamp updates
3. Simple to initialize from localStorage on mount

**Why not mix them?** Orders from the server belong in React Query's cache. Draft tabs are ephemeral workspace state with no server representation. Mixing them would mean either polling for non-existent data or special-casing the cache.

---

## Mock API

Located in `src/mocks/`. The mock layer intentionally mirrors a real REST API:

- **Realistic delays**: `300ms + random(500ms)` per request
- **5% error rate**: random failures to test error handling
- **localStorage persistence**: data survives page reloads
- **Seed on first load**: 32 orders + 15 carriers seeded if storage is empty

All app code imports from `src/shared/api/` (a thin re-export layer). To swap in a real backend, only those files change — no component touches `mocks/` directly.

### Mock API functions

```ts
getOrders(params)             // paginated, filtered, sorted
getOrder(id)
createOrder(input)
updateOrder(id, input)
deleteOrder(id)
updateOrderStatus(id, status, note?)
getCarriers(search?)
```

---

## Draft Persistence

Drafts are stored in localStorage under two key patterns:

```
draft:index     → string[]     ordered list of open draft IDs
draft:{id}      → LocalDraft   per-draft: id, formData, createdAt, updatedAt
```

On opening `/orders/new`, the Zustand store calls `initDrafts()` which reads all drafts from localStorage. If none exist, a blank draft is created automatically.

Autosave runs every 5 seconds via `setInterval` in the workspace page. It calls `persistDraft(id)` which writes the current in-memory draft to localStorage and marks the tab as clean.

On successful order submission, `closeDraft(id)` deletes the localStorage entry and removes the tab.

---

## Validation Decisions

Form validation uses Zod (`src/entities/order/lib/order.schema.ts`), with two distinct contexts:

| Context | Schema | Behavior |
|---|---|---|
| Submit | `createOrderSchema` | Full validation, all fields required |
| Autosave | No validation | Data saved as-is, incomplete is fine |

Key constraints:
- `referenceNumber`: required, alphanumeric + hyphens/underscores, max 50 chars
- `clientName`: required, max 100 chars
- `carrierId`: required on submit
- `rate`: positive number (stored in cents)
- `weight`: positive, max 80,000 lbs (legal limit)
- `stops`: min 2, max 5; must include at least one pickup and one dropoff
- `state`: 2-letter uppercase code
- `zip`: US ZIP (5 or 5+4 digit)

Inline errors appear on blur (`mode: 'onBlur'`). On submit, React Hook Form scrolls to the first invalid field via native form validation.

---

## Business Rules

```
Status transitions:
  pending   → in_transit | cancelled
  in_transit → delivered | cancelled
  delivered  → (final)
  cancelled  → (final)

Edit order:   only pending
Delete order: only pending
Cancellation: requires a mandatory reason note
Max stops:    5 (min 2, must have pickup + dropoff)
Max drafts:   5 open at once
```

All transition logic lives in `src/entities/order/model/status-machine.ts` — a pure map with helper functions. No status logic is embedded in components.

---

## Prioritization

Given the scope, features were built in this order:
1. Architecture + domain model (highest leverage)
2. Mock API + seed (unblocks everything)
3. Orders table (primary feature)
4. Draft workspace (most complex UX)
5. Order detail
6. Edit page

### What was prioritized
- Clean architecture over feature completeness
- Type safety without `any`
- Realistic mock data and API behavior
- UX polish on the table (loading skeletons, empty states, sortable columns)
- Draft workspace autosave reliability

### What would be improved with more time
- **Date range filter** on the orders table (wired in types/API but not in UI)
- **Drag-to-reorder stops** in the form (↑↓ arrow buttons are implemented; drag-and-drop with grip handles would be more ergonomic for 5-stop reordering)
- **Optimistic updates** on status change (currently waits for mock delay)
- **React Query DevTools** for development
- **E2E tests** with Playwright for the critical flows (create order, status change, draft persistence)
- **Virtualized table rows** for large datasets
- **Keyboard navigation** improvements in the status change flow
