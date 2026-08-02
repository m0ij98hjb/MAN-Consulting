# Warehouse Receiving

`/admin/purchasing/warehouse/page.js` — restricted to `store_keeper` (+ `super_admin`).

## Two lists

1. **Pending Receipt** — a live query (`where('status', '==', 'delivered_pending_receipt')`) of every request currently awaiting physical receiving. Clicking one opens its detail page.
2. **Recent Receipts** — the last 15 `warehouseReceipts` documents (sorted client-side by `receivedAt`), each linking back to its originating request.

## The receiving form

Lives directly on the request detail page (`ReceivingPanel` in `requests/[id]/page.js`), shown only when the viewer is a Store Keeper and the request's status is `delivered_pending_receipt`:

- One row per item: ordered quantity (read-only, from the request), received quantity, shortage quantity (both editable numbers).
- Photo upload (`AttachmentsUploader`, path `warehouseReceipts/{requestId}/`).
- **"Confirm Receipt"** — writes a new `warehouseReceipts` document, transitions the request to `received`, and notifies the original requester.

## After receiving

Status `received` shows a **"Mark Completed"** button (`procurement_manager` or `store_keeper`, + `super_admin`) → `completed`, which stamps `completedAt` and notifies the requester. From `completed`, an **"Archive"** button (`procurement_manager`/`super_admin` **only** — not Store Keeper) moves it to the terminal `archived` state.

> This asymmetry (Store Keeper can complete, but not archive) is intentional and rules-enforced — it was also a bug found during the audit (the UI previously showed the Archive button to Store Keeper too, which would have failed at the rules layer with an unhandled error; now fixed to match exactly).
