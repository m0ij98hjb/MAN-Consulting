# Firebase Storage

## Upload pattern

Every upload in this module goes through the shared `src/components/purchasing/AttachmentsUploader.js` component:

1. Client-side validation: file extension must be one of `ACCEPTED_ATTACHMENT_EXT` (`.pdf .doc .docx .xls .xlsx .dwg .dxf .zip .png .jpg .jpeg .webp`, defined in `purchasingConfig.js`), and size must be ≤ `MAX_ATTACHMENT_SIZE_MB` (25 MB).
2. Files are uploaded **in parallel** (`Promise.all`) to `firebase/storage`'s `uploadBytes`, each under `${pathPrefix}/${Date.now()}_${file.name}`.
3. `getDownloadURL()` is resolved for each, and the resulting `{ name, url, path, size, type, uploadedAt }` objects are appended to the parent Firestore document's `attachments` array.

## Path usage by feature

| Path prefix | Used by | Status |
|---|---|---|
| `purchaseRequests/{requestId or requester uid}/` | Request attachments (`purchase-request` portal, read-only view on request detail) | Active |
| `purchasingSuppliers/{supplierId or 'new'}/` | Vendor documents/contracts (`suppliers` admin page) | Active |
| `warehouseReceipts/{requestId}/` | Receiving photos (`ReceivingPanel` on request detail) | Active |
| `purchaseOrders/{orderId}/` | — | **Reserved, not currently used.** Quotation rows carry an `attachments` field that PO creation copies through, but no UI currently lets procurement upload a quotation document — see [RFQ.md](./RFQ.md) and [PurchaseOrders.md](./PurchaseOrders.md). |
| `purchaseSignatures/{requestId}/` | — | **Reserved, not currently used.** Digital signatures are stored inline as base64 data-URL strings inside the `approvals` Firestore subcollection instead (a hand-drawn signature PNG is only a few KB, well under Firestore's 1 MiB document limit at today's scale). |

## Why attachments aren't validated server-side too

Storage Rules only check `request.auth != null` for these paths — they do **not** re-validate file type/size (Storage Rules can inspect `request.resource.size` and `request.resource.contentType`, but this wasn't added since the existing site's Cloudinary-based uploads elsewhere don't do this either, and it would be new defensive-programming scope beyond the audit). The client-side check in `AttachmentsUploader` is the only gate today. See Known Limitations in the final report.
