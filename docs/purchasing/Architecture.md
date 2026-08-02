# Procurement Module — Architecture

## Overview

The Procurement (Purchasing) module is a self-contained addition to the MNC site, built with the **exact same stack** the rest of the app already uses — no new frameworks, no TypeScript, no state-management library:

- **Next.js 16 (App Router)**, plain `.js`/JSX, client components (`'use client'`)
- **Firebase JS SDK** — Firestore (`onSnapshot` for live data) + Storage (direct `uploadBytes`)
- **Tailwind CSS** utility classes, matching the existing dark/gold admin theme
- **lucide-react** icons, **recharts** for charts, **xlsx** (new, single added dependency) for Excel export

It deliberately does **not** use Cloud Functions, a custom Node backend, or any server framework beyond Next.js's own API routes (which the module doesn't need). All business logic runs client-side; all authorization is enforced by **Firestore/Storage Security Rules**, which is the real backend boundary in this architecture.

## Why this design

The rest of the site (suppliers, jobs, contacts, cameras) already follows this exact pattern: React state + `onSnapshot` + Security Rules, no server-side session or admin SDK. The procurement module mirrors it so it fits the existing codebase without introducing a second architectural style.

## Module boundaries

Every new collection is prefixed `purchase*`/`purchasing*` specifically so it can never collide with existing collections (`suppliers`, `jobApplications`, `contacts`, `cameras`). Every new page lives under `/admin/purchasing/*` or the standalone `/purchase-request` route. No existing file's *behavior* was changed — only additive hooks into `AdminSidebar`, `admin/dashboard`, and `Contact.js` (see [Deployment.md](./Deployment.md) for the exact list).

## High-level flow

```
Site Engineer                       Admin-shell roles (same Sidebar/Dashboard)
──────────────                      ───────────────────────────────────────────
/purchase-request (public shell)    /admin/purchasing/*        (admin shell)
  ├─ inline login                     ├─ page.js          (dashboard/KPIs)
  ├─ New Request tab                  ├─ requests/         (list + detail + approve)
  └─ My Requests tab                  ├─ rfq/[requestId]/  (RFQ + quotations + PO)
                                      ├─ orders/            (Purchase Orders)
                                      ├─ suppliers/         (vendor directory)
                                      ├─ warehouse/         (receiving)
                                      ├─ reports/           (analytics + export)
                                      └─ users/             (super_admin only)
```

## Two distinct "shells"

1. **Public shell** (`Navbar` + global `Footer`) — used only by `/purchase-request`, since Site Engineers are not admin users and should never see the admin sidebar/other admin modules.
2. **Admin shell** (`AdminPageLayout` = `AdminNavbar` + `AdminSidebar` + `AdminBottomNav`) — used by every `/admin/purchasing/*` page, identical to how `suppliers`/`jobs`/`reports` already render. `src/app/admin/layout.js` redirects a `site_engineer`-role account away from the admin shell entirely (see [Roles.md](./Roles.md)).

## Key shared building blocks

| File | Purpose |
|---|---|
| `src/lib/purchasingConfig.js` | Single source of truth: roles, status enum, approval chain, item categories, attachment rules, GM approval threshold |
| `src/lib/purchasingApi.js` | Shared Firestore helpers: sequence numbers, history/approval record writers, notification writer |
| `src/lib/purchasingUserCreation.js` | Secondary-Firebase-App technique to create new Auth accounts without evicting the admin's session |
| `src/lib/purchasingExport.js` | CSV/Excel/Word/PDF export helpers |
| `src/hooks/usePurchasingRole.js` | Resolves the current user's role (incl. the site's existing super-admin override) |
| `src/hooks/usePurchaseNotifications.js` | Independent notification feed (separate from the site's existing `NotificationsContext`) |
| `src/components/purchasing/*` | Reusable UI: `ItemsTable`, `AttachmentsUploader`, `SignaturePad`, `PurchaseStatusBadge`, `ApprovalTimeline`, `PurchasingAccessGate`, `PurchasingSubNav`, `PurchasingDashboardWidget`, `PurchasingNotificationBell` |

See [Collections.md](./Collections.md) for the full data model and [SecurityRules.md](./SecurityRules.md) for how every write is authorized server-side.
