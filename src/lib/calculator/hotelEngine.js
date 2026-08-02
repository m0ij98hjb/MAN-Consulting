// Hotel (weighted-area) calculation engine.
// Reuses the exact same weighted-area math and engineering multipliers as
// the commercial engine (per spec — hotels use identical basements/ground
// floor/mezzanine/floors/penthouse multipliers). Only the price lookup
// differs: hotel is priced by star rating instead of category + quality.

import { PRICING, getRatePerSqm } from "./pricing";
import { COMMERCIAL_BUILDING_MULTIPLIERS } from "./multipliers";
import { computeWeightedArea } from "./weightedAreaEngine";

/**
 * Calculates construction cost for a hotel using the weighted-area
 * engineering model. `rating` is "3_star" | "4_star" | "5_star".
 */
export function calculateHotelCost(
  {
    rating,
    basementAreas = [],
    groundFloorArea = 0,
    mezzanineArea = 0,
    floorAreas = [],
    penthouseArea = 0,
  },
  { pricingTable = PRICING, multipliers = COMMERCIAL_BUILDING_MULTIPLIERS } = {}
) {
  const ratePerSqm = getRatePerSqm("hotel", rating, pricingTable);
  if (ratePerSqm == null) {
    throw new Error(`No pricing configured for hotel rating "${rating}"`);
  }

  const numericBasementAreas = basementAreas.map((a) => Number(a) || 0);
  const numericFloorAreas = floorAreas.map((a) => Number(a) || 0);
  const areas = {
    basementAreas: numericBasementAreas,
    groundFloorArea,
    mezzanineArea,
    floorAreas: numericFloorAreas,
    penthouseArea,
  };

  const weightedArea = computeWeightedArea(areas, multipliers);
  const estimatedCost = weightedArea * ratePerSqm;

  return {
    kind: "hotel",

    // ── Customer-safe fields ──
    rating,
    basementsCount: numericBasementAreas.length,
    floorsCount: numericFloorAreas.length,
    areas,
    weightedArea: Math.round(weightedArea),
    estimatedCost: Math.round(estimatedCost),

    // ── Admin/internal-only — callers must not render this to customers ──
    _internal: {
      ratePerSqm,
      multipliers,
    },
  };
}
