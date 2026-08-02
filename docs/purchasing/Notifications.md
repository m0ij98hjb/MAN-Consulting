# Notifications

The Procurement module has its **own, independent** notification system — it does not touch or extend the site's existing `NotificationsContext` (which covers `suppliers`/`jobApplications`/`contacts`), per the requirement that this module be self-contained.

## Storage

`purchaseNotifications/{id}`: `{ targetUid?, targetRole?, type, requestId, requestNumber, title, message, read, createdAt }`. A notification targets either a specific user (`targetUid`, e.g. "your request was rejected") or every user with a given role (`targetRole`, e.g. "a request needs your approval").

## Delivery

`usePurchaseNotifications()` (`src/hooks/usePurchaseNotifications.js`) runs two parallel `onSnapshot` queries — one `where('targetUid', '==', currentUser.uid)`, one `where('targetRole', '==', currentRole)` — and merges/sorts the results client-side. `PurchasingNotificationBell.js` renders this as a bell icon + unread badge inside `PurchasingSubNav` (shown on every top-level `/admin/purchasing/*` page). Clicking a notification marks it read and navigates to the relevant request.

## When notifications fire

| Event | Target |
|---|---|
| New request submitted | `project_manager` role |
| Request resubmitted after being returned | `project_manager` role |
| Stage approved, moving to next stage | The next stage's role |
| Fully approved | `procurement_manager` + `procurement_officer` roles |
| Rejected | The requester (`targetUid`), with the reason as the message |
| Returned for revision | The requester (`targetUid`), with the reason as the message |
| PO issued | The requester (`targetUid`) |
| Materials delivered, pending receipt | `store_keeper` role |
| Materials received | The requester (`targetUid`) |
| Request completed | The requester (`targetUid`) |

All of this is fired from the same action handlers documented in [ApprovalWorkflow.md](./ApprovalWorkflow.md), [RFQ.md](./RFQ.md), and [Warehouse.md](./Warehouse.md) — `notify()` in `purchasingApi.js` is the single write path.
