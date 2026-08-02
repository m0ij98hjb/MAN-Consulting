# Security Rules

Firestore/Storage Security Rules are the **real backend enforcement** in this architecture — there is no Cloud Functions layer or Node backend re-checking permissions. Every rule below runs on Google's infrastructure and cannot be bypassed by a modified client.

## Firestore — helper functions

Added at the top of `firestore.rules`, inside `match /databases/{database}/documents`:

```
function purchIsSuperAdmin() {
  return request.auth != null && request.auth.token.email == 'mm5329844@gmail.com';
}
function purchRole() {
  return request.auth != null && exists(/databases/$(database)/documents/purchasingUsers/$(request.auth.uid))
    ? get(/databases/$(database)/documents/purchasingUsers/$(request.auth.uid)).data.role
    : null;
}
function purchInRoles(rolesList) {
  return purchIsSuperAdmin() || (request.auth != null && purchRole() in rolesList);
}
```

`purchIsSuperAdmin()` is OR'd into nearly every rule as a blanket override, matching the site's existing single-super-admin model.

## `purchaseRequests` — the state machine is enforced here, not just in the UI

The `create` rule requires the caller to be the declared requester, to start at `pending_project_manager_approval`, and to have *some* purchasing role (or be super-admin):
```
allow create: if request.auth != null
  && request.resource.data.requesterUid == request.auth.uid
  && request.resource.data.status == 'pending_project_manager_approval'
  && (purchRole() != null || purchIsSuperAdmin());
```

The `update` rule is an explicit **transition table** — for every `(current status, role)` pair, only the specific next statuses that role is allowed to move to are permitted. For example, a Project Manager may only move `pending_project_manager_approval` → one of `{pending_engineering_manager_approval, rejected, returned_for_revision}` — never anything else, and never from any other starting status. The full chain (mirrored in `purchasingConfig.js`'s `APPROVAL_STAGES`) is documented in [ApprovalWorkflow.md](./ApprovalWorkflow.md).

This means: **a role attempting to skip a stage, self-approve, or jump straight to `completed` gets a `permission-denied` error from Firestore itself**, regardless of what buttons the UI does or doesn't show.

`read` is granted to the request's own `requesterUid`, or to any of `project_manager, engineering_manager, procurement_manager, procurement_officer, general_manager, accountant, store_keeper, viewer` — i.e. every admin-module role can see every request (needed for the dashboards/reports), while a Site Engineer can only ever see their own.

`delete` is restricted to `super_admin` only.

### `approvals` / `history` subcollections
`create` is allowed for any authenticated user (the parent document's own `update` rule is what actually gates whether that write could happen in practice); **`update` and `delete` are hard-denied (`if false`)** — this is what makes the audit trail genuinely tamper-proof, not just "nobody built a delete button for it."

## Other collections

| Collection | Read | Write |
|---|---|---|
| `purchasingUsers` | Own doc, or `super_admin` | `super_admin` only (create/update/delete) |
| `purchasingSuppliers` | Any signed-in user | create/update: `procurement_officer`/`procurement_manager`; delete: `super_admin` only |
| `purchaseRFQs` (+ `quotations`) | Any signed-in user | `procurement_officer`/`procurement_manager`; delete: `super_admin` |
| `purchaseOrders` | Any signed-in user | `procurement_officer`/`procurement_manager`; delete: `super_admin` |
| `warehouseReceipts` | Any signed-in user | `store_keeper`/`procurement_manager`; delete: `super_admin` |
| `purchaseNotifications` | Any signed-in user | create/update: any signed-in user; delete: `super_admin` |
| `purchasingMeta` | Any signed-in user | Any signed-in user (transactional counters) |

## Storage

`storage.rules` (new file — **see the warning below before deploying**) grants read/write to any authenticated user under:
```
purchaseRequests/{requestId}/**
purchaseOrders/{orderId}/**        (reserved — currently unused, see PurchaseOrders.md)
purchasingSuppliers/{supplierId}/**
warehouseReceipts/{receiptId}/**
purchaseSignatures/{requestId}/**  (reserved — currently unused, signatures are stored inline in Firestore)
```
Fine-grained authorization is left to the Firestore rules governing the associated document; Storage rules here only gate "must be signed in."

> **⚠️ This repo did not previously track a `storage.rules` file.** Whatever Storage rules are live today (director-photo uploads, camera assets, content-management uploads) exist only in the Firebase Console. `firebase deploy --only storage` **replaces** the entire ruleset — it does not merge. Before ever deploying this file, copy the current live rules from the Console into it. See [Deployment.md](./Deployment.md).

## A note on trust boundaries

`totalEstimatedCost` / `requiresGMApproval` are computed **client-side** and trusted by the rules (there's no Cloud Function recomputing them). A technically sophisticated user could, via direct API calls (not through the UI), submit a request with a manipulated total. This is an accepted limitation of the current architecture (no server compute layer) — see [Troubleshooting.md](./Troubleshooting.md) and the Known Limitations section of the final audit report.
