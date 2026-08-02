# Purchase Orders

Purchase Orders are never created directly by a user — they're always generated automatically by [RFQ.md](./RFQ.md)'s "Select as Winner" action. There is intentionally no "create PO manually" form, since a PO must always trace back to an approved request and a compared quotation.

## Pages

- `/admin/purchasing/orders/page.js` — list of all POs (`poNumber`, project, supplier, value, issue date), read-accessible to all admin-module roles.
- `/admin/purchasing/orders/[id]/page.js` — detail view: supplier, total value, issue date, the originating request number (links back to it), issuer name, and the read-only items table.

## After a PO is issued

The request (status `po_issued`) shows a **"Mark as Delivered"** button (visible to `procurement_officer`/`procurement_manager`/`super_admin`) on its detail page, which transitions it to `delivered_pending_receipt` and notifies the Store Keeper role — see [Warehouse.md](./Warehouse.md) for what happens next.

## Reserved but unused

`purchaseOrders/{orderId}/**` is a valid Storage path (see [Storage.md](./Storage.md)) but nothing currently uploads to it, since quotations (and therefore POs) don't carry real attachments yet.
