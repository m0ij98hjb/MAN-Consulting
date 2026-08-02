# RFQ & Quotation Comparison

`/admin/purchasing/rfq/[requestId]/page.js` — restricted to `procurement_officer`/`procurement_manager` (+ `super_admin`).

## Flow

1. **No RFQ yet** (request status `approved`): pick one or more vendors from `purchasingSuppliers`, optionally set a due date, and "Send RFQ". This creates `purchaseRFQs/{requestId}` (document id == request id, for a simple 1:1 lookup) and transitions the request to `rfq_requested`.
2. **RFQ sent**: for each selected supplier, procurement can enter a quotation (price, delivery time, warranty, quality notes, rating 0–5) via `QuotationRow`. Saving the **first** quotation automatically transitions the request to `quotations_received`.
3. **Comparison table**: once quotations exist, they're shown side-by-side. Procurement clicks **"Select as Winner"** on the best one — this:
   - Generates a `PO-000045` number transactionally.
   - Creates the `purchaseOrders` document (copying the request's items and the winning quotation's price as `totalValue`).
   - Marks that quotation `selected: true`.
   - Transitions the request to `po_issued` with `purchaseOrderId` set.
   - Notifies the original requester.
   - Redirects to the new PO's detail page.

## Error handling

Both `saveQuotation` and `selectWinner` are wrapped in try/catch with an inline error banner — a failed save no longer silently closes the edit row (this was a bug found and fixed during the audit; see the final report).

## Known incomplete wiring (not fixed — would be a new feature)

`QuotationRow` doesn't include a file-upload control, even though the quotation data model carries an `attachments` field (always empty today) that the Purchase Order copies through. Wiring an actual upload UI here — and the matching `purchaseOrders/` Storage path is already reserved for it — would be a genuine feature addition, out of scope for this audit pass per the "no new features" instruction.
