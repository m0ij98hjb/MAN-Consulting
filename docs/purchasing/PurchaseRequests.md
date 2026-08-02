# Purchase Requests

## Where they're created

`/purchase-request` — a **public-shell** page (same `Navbar`/`Footer` as the marketing site, not the admin shell), reachable via a card on the "Contact Us" page. It requires login (any provisioned `purchasingUsers` account, not just Site Engineer — a Project Manager could submit a request for themselves too).

Three states:
1. **Not logged in** → inline login form (`InlineLogin`).
2. **Logged in, no `purchasingUsers` doc** → "account not provisioned, contact your administrator."
3. **Logged in, provisioned** → two tabs: **New Request** and **My Requests**.

## The form

- Requester info (name/phone/email/job title/department) — pre-filled from the account profile, editable per submission.
- Project info (name/code/site).
- Priority: `normal | urgent | very_urgent`.
- **Unlimited item rows** (`ItemsTable.js`) — add/duplicate/reorder (▲▼)/delete, each with name, description, category (12 predefined + implicit "other" via free text), unit, quantity, estimated price, suggested supplier, needed-by date, notes. Quantity/price are clamped to ≥ 0 so a negative value can never suppress the computed total or dodge the GM-approval threshold.
- Attachments (multi-file, validated by extension + 25 MB size cap, uploaded in parallel).
- General notes.
- A read-only "Approval Status" banner (always shows "Pending Project Manager Approval" pre-submit) — **there is no approve/reject control anywhere on this page**, by design; only the admin-shell pages expose those.

On submit: a `PR-000123`-style number is generated transactionally, the request is created at `pending_project_manager_approval`, a `submitted` history entry is written, and the Project Manager role is notified.

## "My Requests"

A live list (`onSnapshot`, filtered to `requesterUid == currentUser`) of the requester's own submissions, each expandable to show its full [ApprovalTimeline](./ActivityLog.md). If a request is `returned_for_revision`, an **"Edit & Resubmit"** button appears — the only way a resubmitted request's items/costs can be re-computed.

## Viewing/acting on a request (admin shell)

`/admin/purchasing/requests/[id]/page.js` shows every field (read-only `ItemsTable`, attachments), the full activity log, and a **role-and-status-conditional action panel** — never more than one panel type renders for a given viewer/status combination, matching the rules exactly (see [Roles.md](./Roles.md) for the permission matrix and [ApprovalWorkflow.md](./ApprovalWorkflow.md) for the state machine).
