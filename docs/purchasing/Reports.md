# Reports

`/admin/purchasing/reports/page.js` — readable by all `ADMIN_MODULE_ROLES`.

## What's shown

- **KPIs**: overdue requests (any open request with an item past its `neededDate`), urgent/very-urgent open requests, average approval duration (days between `submittedAt` and `approvalDecisionAt`), average purchase duration (days between `approvalDecisionAt` and `completedAt`), total estimated value across all requests.
- **Charts** (recharts, matching the existing `admin/reports/page.js` visual style — `KPI`/`ChartCard`/`DonutChart`/`RankBar` patterns): requests by status (donut), requests by project (top 10, horizontal bars), top suppliers by total PO value, monthly and yearly request volume.

## Export

Four buttons, all client-side (no server round-trip beyond what's already loaded):

| Format | Method |
|---|---|
| **CSV** | Hand-built CSV string → `Blob` → download link (no dependency) |
| **Excel** | `xlsx` (SheetJS) — the one new dependency this module adds — `json_to_sheet` → `writeFile` |
| **PDF** | A dedicated `#purchasing-print-area` + a `@media print` stylesheet that hides everything else, then `window.print()` (browser's native "Save as PDF") — no library |
| **Word** | The same print area's `innerHTML` wrapped in a minimal Office-XML-namespaced HTML document, served as a `.doc`-extension `Blob` (a standard technique — Word opens HTML files with a `.doc` extension) — no library |

## Data notes

`totalCost` sums `totalEstimatedCost` across **every** request regardless of status (including pending/rejected/returned) — this reflects "total estimated purchasing demand," not "confirmed spend." If you want a "confirmed spend only" figure later, that's a small, well-scoped follow-up (filter to `completed`/`archived`/PO-issued+ statuses).
