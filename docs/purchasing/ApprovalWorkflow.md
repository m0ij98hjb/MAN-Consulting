# Approval Workflow

## The chain

```
Site Engineer creates request
        │
        ▼
pending_project_manager_approval  ──(reject)──▶ rejected
        │  (approve)                ──(return)──▶ returned_for_revision ──▶ (edit+resubmit) ──▶ pending_project_manager_approval
        ▼
pending_engineering_manager_approval  ──(reject/return)──▶ same as above
        │  (approve)
        ▼
pending_procurement_approval  ──(reject/return)──▶ same as above
        │  (approve)
        │
        ├─ if totalEstimatedCost < GM_APPROVAL_THRESHOLD (50,000) ──▶ approved
        │
        └─ if totalEstimatedCost >= GM_APPROVAL_THRESHOLD
                 ▼
           pending_gm_approval  ──(reject/return)──▶ same as above
                 │ (approve)
                 ▼
              approved
                 │
                 ▼
         rfq_requested ──▶ quotations_received ──▶ po_issued ──▶ delivered_pending_receipt ──▶ received ──▶ completed ──▶ archived
```

## Every stage records

Each approval decision writes **two** records (see `ApprovalActionPanel` in `requests/[id]/page.js`):

1. `purchaseRequests/{id}/approvals/{stageId}` — the formal record: `stage`, `decision`, `approverUid`, `approverName`, `jobTitle`, **e-signature** (drawn on a canvas or typed name — see `SignaturePad.js`), and an optional comment. Mandatory for reject/return, encouraged for approve.
2. `purchaseRequests/{id}/history/{entryId}` — a plain-language activity-log line, shown in the "Activity Log" (`ApprovalTimeline.js`) on the request detail page.

Both subcollections are append-only at the rules level — nothing can edit or delete a past decision.

## The General Manager stage is conditional

`computeRequiresGMApproval(totalEstimatedCost)` (in `purchasingConfig.js`) returns `true` once the request's total estimated cost reaches `GM_APPROVAL_THRESHOLD` (currently 50,000 — a plain constant, easy to tune). This flag is computed **once, client-side, at submission time** and stored on the request as `requiresGMApproval`; the Procurement Manager's approval action reads that flag to decide whether the next status is `pending_gm_approval` or straight to `approved` (`nextAfterProcurementApproval()`).

## Reject vs. Return

- **Reject** is terminal — the request moves to `rejected` and notifies the requester with the reason. It cannot be resubmitted.
- **Return for Revision** sends it back to the requester (`returned_for_revision`). Only the original requester can then edit it (via the "Edit & Resubmit" button on `/purchase-request`'s "My Requests" tab) and resubmit, which resets status to `pending_project_manager_approval` — **it always restarts at stage 1**, even if it was returned from a later stage. This is intentional: a resubmitted request may have materially different items/costs, so it re-enters the full chain rather than resuming mid-chain.

## Procurement execution pipeline (after `approved`)

This is documented in full in [RFQ.md](./RFQ.md), [PurchaseOrders.md](./PurchaseOrders.md), and [Warehouse.md](./Warehouse.md). Summary of the status chain:

`approved → rfq_requested → quotations_received → po_issued → delivered_pending_receipt → received → completed → archived`

Unlike the approval chain, this pipeline doesn't require a signature at each step — it's operational status tracking, not a decision requiring accountability sign-off (only the four approval-chain stages capture a signature).
