# Production Checklist — Procurement Module

## ✓ Environment Variables
- [x] No new variables required — reuses existing `NEXT_PUBLIC_FIREBASE_*` in `.env.local`.
- [ ] **You confirm**: `.env.local` (or your hosting provider's env config) has all of `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID` set in production (already required by the rest of the site).

## ✓ Firebase Config
- [x] `src/lib/firebase.js` unchanged — same app/db/storage/auth instances reused.
- [x] `createPurchasingUser()`'s secondary-app technique reuses the same config via `getApp().options` — no separate service account file needed.

## ✓ Firestore Rules
- [ ] **Manual step**: `firebase deploy --only firestore:rules` (safe — purely additive, doesn't touch the existing `suppliers` rule).
- [ ] Confirm in the Firebase Console → Firestore → Rules that the purchasing block (`purchIsSuperAdmin`, `purchRole`, `purchInRoles`, and the 8 new `match` blocks) is present after deploying.

## ✓ Storage Rules
- [ ] **Manual step, order matters**: copy the currently-live Storage rules from the Console into `storage.rules` *before* deploying (see [Deployment.md](./Deployment.md) — a raw deploy would replace, not merge, and could break director-photo/camera uploads).
- [ ] `firebase deploy --only storage` only after that merge.

## ✓ Required Indexes
- [x] None. Every query is a direct doc read or single-field `where()`.

## ✓ Required Collections
No manual creation needed — Firestore creates collections on first write. For reference, the module uses:
`purchasingUsers`, `purchasingMeta`, `purchaseRequests` (+`approvals`, `history`), `purchasingSuppliers`, `purchaseRFQs` (+`quotations`), `purchaseOrders`, `warehouseReceipts`, `purchaseNotifications`.

## ✓ Required Roles
- [ ] Decide which of the 10 roles (see [Roles.md](./Roles.md)) you'll actually use at launch — not all 10 need accounts on day one.
- [ ] At minimum: one `project_manager`, one `procurement_manager`, and at least one `site_engineer` account to run an end-to-end test.

## ✓ Required Admin Accounts
- [ ] The existing super-admin email (already whitelisted in `AuthContext.js`) can create every other account — no separate setup needed.
- [ ] Create accounts at `/admin/purchasing/users` for each real employee who needs access.

## ✓ Deployment Steps
1. Merge/deploy this code (already verified: `npm install` / `npm run lint` / `npm run build` all pass with zero errors).
2. `firebase deploy --only firestore:rules`.
3. Merge + deploy `storage.rules` (see above).
4. Smoke-test in production: log in as super-admin, create one `site_engineer` test account, submit a test request, and walk it through the whole chain per the checklist below.
5. Once verified, create real accounts and communicate the `/purchase-request` entry point to site engineers.

## ✓ Backup Steps
- [ ] `gcloud firestore export gs://<bucket>/backups/$(date +%Y%m%d) --collection-ids=purchasingUsers,purchasingMeta,purchaseRequests,purchasingSuppliers,purchaseRFQs,purchaseOrders,warehouseReceipts,purchaseNotifications` — recommended before the first production rules deploy, and on whatever cadence your existing Firestore backup policy already uses.

## ✓ Recovery Steps
- [ ] `gcloud firestore import gs://<bucket>/backups/<date>` to restore from a given export.
- [ ] Because `history`/`approvals` subcollections are append-only and undeletable, the audit trail itself survives even data corruption elsewhere and can help reconstruct what happened to a given request.

## Final pre-launch smoke test (manual — could not be run against live Firebase in this session; see final report)
- [ ] Create one account per role you'll use.
- [ ] Submit a request as Site Engineer with 3+ items and at least one attachment.
- [ ] Approve through every stage as the corresponding role (including triggering the GM stage by submitting a request ≥ 50,000 in estimated cost).
- [ ] Reject one test request; return one test request for revision and resubmit it.
- [ ] Run it through RFQ → quotation → PO → delivered → received → completed → archived.
- [ ] Confirm notifications appear for each role at each step.
- [ ] Export a report in all four formats and open each resulting file.
- [ ] Switch language to English and back to Arabic; confirm RTL/LTR both render correctly.
