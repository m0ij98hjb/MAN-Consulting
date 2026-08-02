/* ══════════════════════════════════════════════════════════════
   Project Budget Control — connects purchaseRequests/purchaseOrders
   to a lightweight per-project budget registry (projectBudgets).
   No real "Projects+budget" module exists elsewhere on the site
   (Projects is marketing content only, see docs/purchasing/Roles.md
   deviations) — this registry is purpose-built for procurement.
   ══════════════════════════════════════════════════════════════ */
import { STATUS } from './purchasingConfig';

export function projectKeyFor(projectName) {
  return (projectName || '').trim().toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, '-').replace(/^-+|-+$/g, '') || 'unassigned';
}

/* Requests whose estimated cost still counts as "committed" (not yet a real purchase, not closed out) */
const COMMITTED_STATUSES = [
  STATUS.PENDING_ENGINEER_APPROVAL, STATUS.PENDING_PROC_APPROVAL,
  STATUS.APPROVED, STATUS.RFQ_REQUESTED, STATUS.QUOTATIONS_RECEIVED,
  STATUS.PO_ISSUED, STATUS.DELIVERED_PENDING,
];
/* Requests whose PO value is now "actual" real spend */
const ACTUAL_STATUSES = [STATUS.RECEIVED, STATUS.COMPLETED, STATUS.ARCHIVED];

export function computeBudgetSummary({ approvedBudget, projectRequests, projectOrders }) {
  const committedCost = (projectRequests || [])
    .filter(r => COMMITTED_STATUSES.includes(r.status))
    .reduce((sum, r) => sum + (Number(r.totalEstimatedCost) || 0), 0);

  const actualCost = (projectOrders || [])
    .filter(o => {
      const req = (projectRequests || []).find(r => r.id === o.requestId);
      return req && ACTUAL_STATUSES.includes(req.status);
    })
    .reduce((sum, o) => sum + (Number(o.totalValue) || 0), 0);

  const budget = Number(approvedBudget) || 0;
  const remaining = budget - committedCost - actualCost;
  const consumedPct = budget > 0 ? Math.min(999, Math.round(((committedCost + actualCost) / budget) * 100)) : 0;

  return { approvedBudget: budget, committedCost, actualCost, remaining, consumedPct, exceeded: budget > 0 && remaining < 0 };
}

export function budgetBarColor(consumedPct) {
  if (consumedPct >= 100) return '#ef4444';
  if (consumedPct >= 80) return '#f59e0b';
  return '#10b981';
}
