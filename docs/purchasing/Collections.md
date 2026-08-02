# Firestore Collections

All collections live in the **same** Firestore database as the rest of the site (no separate project/database was created). Every collection name is prefixed `purchase`/`purchasing` to guarantee no collision with `suppliers`, `jobApplications`, `contacts`, or `cameras`.

## `purchasingUsers/{uid}`
Role/profile record, keyed by the Firebase Auth UID.

```
uid, name, email, phone, role, jobTitle, department, projectName,
active: boolean, createdAt, createdBy
```
`role` is one of the 10 values in [Roles.md](./Roles.md). The site's whitelisted super-admin email is treated as `super_admin` automatically even without a document here.

## `purchasingMeta/counters`
Single document holding auto-increment counters, updated inside a Firestore transaction:
```
{ requestSeq: number, poSeq: number }
```
Used to generate human-readable `PR-000123` / `PO-000045` numbers (see `nextRequestNumber`/`nextPONumber` in `purchasingApi.js`).

## `purchaseRequests/{id}`
The core document — a purchase request header + its line items.

```
requestNumber, requestDate, projectName, projectCode, siteName,
requesterUid, requesterName, requesterPhone, requesterEmail, jobTitle, department,
priority: normal|urgent|very_urgent,
reason, generalNotes,
items: [{ id, itemName, description, category, unit, quantity, estimatedPrice, suggestedSupplier, neededDate, notes }],
attachments: [{ name, url, path, size, type, uploadedAt }],
totalQuantity, totalEstimatedCost, requiresGMApproval: boolean,
status: <see ApprovalWorkflow.md>,
rejectionReason, returnReason, decidedByUid, decidedByName,
purchaseOrderId,
createdAt, updatedAt, submittedAt, approvalDecisionAt, completedAt
```

### Subcollection `purchaseRequests/{id}/approvals/{stageId}`
One record per approval-chain decision (append-only):
```
stage, decision: approve|reject|return, approverUid, approverName, jobTitle,
signature: { type: 'drawn'|'typed', value }, comment, decidedAt
```

### Subcollection `purchaseRequests/{id}/history/{entryId}`
The full activity log — append-only, never editable or deletable at the rules level:
```
userId, userName, role, action, previousStatus, newStatus, notes, timestamp
```

## `purchasingSuppliers/{id}`
Procurement's own vendor directory — **intentionally separate** from the site's existing `suppliers` collection (different schema/purpose; kept apart so nothing about the existing supplier-registration feature is touched):
```
name, crNumber, taxNumber, phone, email, address, specialty, rating,
attachments: [...], contracts: [...], active, createdAt, updatedAt
```

## `purchaseRFQs/{id}` (document id == the request id)
```
requestId, requestNumber, supplierIds: [...], items: [...copied from request...],
sentAt, dueDate, status
```
### Subcollection `purchaseRFQs/{id}/quotations/{supplierId}`
```
supplierId, supplierName, price, deliveryTime, warranty, qualityNotes, rating,
attachments: [...], selected: boolean, submittedAt
```

## `purchaseOrders/{id}`
Created automatically when a quotation is selected as the winner:
```
poNumber, requestId, requestNumber, projectName, supplierId, supplierName,
items: [...], totalValue, issuedByUid, issuedByName, issuedAt, status, attachments: [...]
```

## `warehouseReceipts/{id}`
```
requestId, poId, receivedByUid, receivedByName, receivedAt,
items: [{ itemId, orderedQty, receivedQty, shortageQty, notes }],
photos: [...], confirmed, allocatedToProject
```

## `purchaseNotifications/{id}`
Independent of the site's existing notification bell (`suppliers`/`jobs`/`contacts`):
```
targetUid | targetRole, type, requestId, requestNumber, title, message, read, createdAt
```

## Indexes

**No composite indexes are required anywhere in this module.** Every query is either a direct document read or a single `where()` equality filter (Firestore auto-indexes single fields). Client-side `.sort()`/`.filter()` is used instead of `orderBy()` for anything beyond a single equality clause, specifically to avoid needing to configure `firestore.indexes.json`.
