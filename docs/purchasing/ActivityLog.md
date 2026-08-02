# Activity Log (Audit Trail)

## Where it lives

`purchaseRequests/{id}/history/{entryId}` — one entry per meaningful action on a request, written by `addHistoryEntry()` (`purchasingApi.js`) from every action handler across the module (submit, resubmit, each approval-chain decision, RFQ sent, quotation added, PO issued, delivered, received, completed, archived).

## Shape

```
{ userId, userName, role, action, previousStatus, newStatus, notes, timestamp }
```

## Why it can't be tampered with

Both the Firestore rule for this subcollection and for the sibling `approvals` subcollection are:
```
allow create: if request.auth != null;
allow update, delete: if false;
```
No rule branch anywhere grants `update` or `delete` — not even to `super_admin`. Once written, a history entry is permanent. This was a deliberate design choice from the initial build (not an audit-pass change) and was re-verified as still correct during this audit.

## Display

`ApprovalTimeline.js` renders the subcollection ordered by `timestamp` as a vertical timeline (user name, role, date/time, previous→new status badges, and any notes/reason), used on both the requester-facing "My Requests" expandable rows and the admin-facing request detail page.

## Relationship to `approvals`

`history` is the human-readable *log* (what happened, in order); `approvals` is the *formal record* of each of the four sign-off stages specifically (who signed, with what signature, what job title) — see [ApprovalWorkflow.md](./ApprovalWorkflow.md). Every approval-chain decision writes to both; every other action (RFQ sent, PO issued, receiving, etc.) writes to `history` only, since those aren't accountability sign-offs requiring a signature.
