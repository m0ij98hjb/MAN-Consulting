# Deployment

## 1. No new environment variables required

The module reuses the site's existing Firebase client config (`NEXT_PUBLIC_FIREBASE_*` in `.env.local`) and the existing `firebase.js` app initialization. `createPurchasingUser()` spins up a **secondary named Firebase App** at runtime (`initializeApp(config, 'purchasingUserCreation')`) using the same config — no separate service account or admin SDK credentials needed.

## 2. Deploy Firestore rules

```
firebase deploy --only firestore:rules
```
The additive purchasing block in `firestore.rules` doesn't touch the existing `suppliers` rule; safe to deploy directly.

## 3. Deploy Storage rules — merge first

`storage.rules` is a **new file this project didn't have before**. Deploying it as-is will **replace** whatever Storage rules are currently live in the Firebase Console (director-photo uploads, camera assets, content-management uploads), since Storage rule deploys are a full replace, not a merge.

**Before running `firebase deploy --only storage`:**
1. Open Firebase Console → Storage → Rules.
2. Copy the currently-live rule content.
3. Paste those `match` blocks into `storage.rules` alongside the purchasing-module blocks already there.
4. Only then deploy.

## 4. No indexes to create

Every query in this module is a direct document read or a single-field `where()` — Firestore auto-indexes these. Nothing to add to `firestore.indexes.json`.

## 5. Files touched outside the module (all additive, zero behavior change to existing features)

- `src/app/admin/layout.js` — redirects `site_engineer`-role accounts to `/purchase-request`.
- `src/components/admin/AdminSidebar.js` — one new nav item, role-gated.
- `src/app/admin/dashboard/page.js` — one new widget appended below the existing sections.
- `src/components/sections/Contact.js` — one new card linking to `/purchase-request`.
- All 9 `src/locales/*.js` — a new `purchasing` translation namespace + two small additions to `admin`/`contact`.
- `package.json` — added the single `xlsx` dependency.
- `eslint.config.mjs` — added `.claude/**` to the ignore list (unrelated tooling cleanup found during the lint audit; see [Troubleshooting.md](./Troubleshooting.md)).

## 6. Create the first accounts

Once rules are deployed, sign in as the existing super-admin, go to `/admin/purchasing/users`, and create at least one account per role you intend to use (see [Roles.md](./Roles.md)). Password minimum is 6 characters (Firebase Auth's own minimum), enforced client-side too.

## 7. Backup

Standard Firestore export applies — no new backup mechanism was introduced. To back up just this module's data:
```
gcloud firestore export gs://<your-bucket>/backups/$(date +%Y%m%d) \
  --collection-ids=purchasingUsers,purchasingMeta,purchaseRequests,purchasingSuppliers,purchaseRFQs,purchaseOrders,warehouseReceipts,purchaseNotifications
```

## 8. Recovery

Firestore's own point-in-time recovery / import from a prior export is the standard path (`gcloud firestore import gs://<bucket>/backups/<date>`). Because every status transition and every approval decision is logged in the (undeletable) `history`/`approvals` subcollections, a corrupted or wrongly-modified request's real history can always be reconstructed even without a backup — the audit trail is itself a recovery aid.

## 9. Verify after deploying

Repeat the checklist in [ProductionChecklist.md](./ProductionChecklist.md) and the manual walkthrough in the final audit report — rules changes are the one class of bug that `npm run build` cannot catch (a build succeeds even if a rule is subtly wrong; only exercising the app against live Firestore reveals that).
