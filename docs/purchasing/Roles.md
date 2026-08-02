# Roles

## The 10 implemented roles

Defined in `src/lib/purchasingConfig.js` (`ROLES`):

| Role | Constant | Where they operate | Admin-shell access? |
|---|---|---|---|
| Super Admin | `super_admin` | Everywhere — blanket override in every rule | Yes (full site admin) |
| General Manager | `general_manager` | Final conditional approval stage | Yes |
| Engineering Manager | `engineering_manager` | 2nd approval stage | Yes |
| Project Manager | `project_manager` | 1st approval stage | Yes |
| Site Engineer | `site_engineer` | Creates/edits requests only | **No** — redirected to `/purchase-request` |
| Procurement Officer | `procurement_officer` | RFQ, quotations, PO issuance | Yes |
| Procurement Manager | `procurement_manager` | 3rd approval stage + all procurement actions + completion/archive | Yes |
| Accountant | `accountant` | Read-only (reports, costs) | Yes (view only) |
| Store Keeper | `store_keeper` | Warehouse receiving | Yes |
| Viewer | `viewer` | Read-only everywhere | Yes (view only) |

`ADMIN_MODULE_ROLES` (everyone except `site_engineer`) is what `PurchasingAccessGate`'s default (no `allow` prop) checks, and what `AdminSidebar`/`admin/layout.js` use to decide whether to show the "إدارة المشتريات" nav item / allow entry into `/admin/*` at all.

## ⚠️ Deviation from the later audit brief

The Phase 4/5 instructions in the final audit round named an 11th role, **"Site Manager,"** as a distinct entity between Site Engineer and Project Manager. **This role does not exist in the implemented system.** It appeared in the very first draft of the spec, but was explicitly superseded during the architecture clarification round (mid-build) in favor of the current chain: `Site Engineer → Project Manager → Engineering Manager → Procurement Manager → General Manager (conditional)`.

No "Site Manager" role, approval stage, or Firestore rule branch was added for this audit pass, since:
1. Adding a 5th mandatory approval stage is a **new feature** (a workflow change), not a bug fix, and the audit brief explicitly said not to add features unless required to fix a bug.
2. It would require rewriting the approval chain, `firestore.rules`, `APPROVAL_STAGES`, every role-gate in `requests/[id]/page.js`, and the notification routing — a scope change, not an audit fix.

If you do want a "Site Manager" stage added later, that's a real, well-scoped feature request — happy to plan it separately.

## Account provisioning

There is no self-registration. `super_admin` creates every account from `/admin/purchasing/users`, via `createPurchasingUser()` (`purchasingUserCreation.js`), which uses a **secondary Firebase App instance** to call `createUserWithEmailAndPassword` — this avoids the well-known gotcha where creating a user via the client SDK signs in as that new user (which would otherwise evict the admin's own session).

## Role permission matrix (CRUD + workflow actions)

| Action | Roles allowed (Firestore-rule enforced) |
|---|---|
| Create a purchase request | Any role with a `purchasingUsers` doc, or `super_admin` |
| Read a request | Requester (own only), or any of `project_manager / engineering_manager / procurement_manager / procurement_officer / general_manager / accountant / store_keeper / viewer`, or `super_admin` |
| Edit + resubmit a returned request | Only the original requester, only while status is `returned_for_revision` |
| Approve/reject/return — stage 1 | `project_manager` (+ `super_admin`) |
| Approve/reject/return — stage 2 | `engineering_manager` (+ `super_admin`) |
| Approve/reject/return — stage 3 | `procurement_manager` (+ `super_admin`) |
| Approve/reject/return — stage 4 (conditional) | `general_manager` (+ `super_admin`) |
| RFQ → PO pipeline | `procurement_officer`, `procurement_manager` (+ `super_admin`) |
| Warehouse receiving | `store_keeper` (+ `super_admin`) |
| Mark completed (received → completed) | `procurement_manager`, `store_keeper` (+ `super_admin`) |
| Archive (completed → archived) | `procurement_manager` only (+ `super_admin`) — **not** `store_keeper` |
| Manage `purchasingSuppliers` (create/update) | `procurement_officer`, `procurement_manager` (+ `super_admin`) |
| Delete a supplier | `super_admin` only (UI hides the delete button from everyone else) |
| Manage user accounts | `super_admin` only |
| Export reports (CSV/Excel/Word/PDF) | Any role that can open `/admin/purchasing/reports` (all `ADMIN_MODULE_ROLES`) — export itself has no separate rule, it's a client-side data transform of already-readable data |
| Delete a request | `super_admin` only |

Every row above is enforced twice: once by hiding/showing the relevant button in the UI (`PurchasingAccessGate`, `isRole(...)` checks), and once — the real boundary — by `firestore.rules`. During this audit, three UI/rule mismatches were found and fixed where the button was shown to a role the rule would actually reject (Archive button visible to Store Keeper; Super Admin missing from several action-panel gates; Supplier delete button visible to non-super-admins). See the Bugs Fixed section of the final report.
