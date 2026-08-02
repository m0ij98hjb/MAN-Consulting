// Industrial (weighted-area) calculation engine — factory / warehouse.
// Reuses the exact same weighted-area math and engineering multipliers as
// the commercial/hotel engines. Industrial buildings only ever have a
// ground floor, a mezzanine, and a single first floor — no basements, no
// penthouse — so those parts are simply never populated.

import { PRICING, getRatePerSqm } from "./pricing";
import { COMMERCIAL_BUILDING_MULTIPLIERS } from "./multipliers";
import { computeWeightedArea } from "./weightedAreaEngine";

/**
 * Calculates construction cost for an industrial project using the
 * weighted-area engineering model. `category` is "factory" | "warehouse".
 */
export function calculateIndustrialCost(
  { category, quality, groundFloorArea = 0, mezzanineArea = 0, firstFloorArea = 0 },
  { pricingTable = PRICING, multipliers = COMMERCIAL_BUILDING_MULTIPLIERS } = {}
) {
  const ratePerSqm = getRatePerSqm(category, quality, pricingTable);
  if (ratePerSqm == null) {
    throw new Error(`No pricing configured for "${category}" at quality "${quality}"`);
  }

  const areas = {
    groundFloorArea,
    mezzanineArea,
    floorAreas: [firstFloorArea], // "First Floor ×1" — a single-entry typical-floors array
  };

  const weightedArea = computeWeightedArea(areas, multipliers);
  const estimatedCost = weightedArea * ratePerSqm;

  return {
    kind: "industrial",

    // ── Customer-safe fields ──
    category,
    quality,
    areas: { groundFloorArea, mezzanineArea, firstFloorArea },
    weightedArea: Math.round(weightedArea),
    estimatedCost: Math.round(estimatedCost),

    // ── Admin/internal-only — callers must not render this to customers ──
    _internal: {
      ratePerSqm,
      multipliers,
    },
  };
}
