// Commercial (weighted-area) calculation engine.
// Pure functions only — no React, no UI, no i18n. Handles the dynamic
// per-basement / per-floor area inputs that the generic engineering engine
// (engine.js) doesn't support, since commercial buildings need each
// basement/floor tracked and displayed individually rather than a single
// "typical floor area × count".

import { PRICING, getRatePerSqm } from "./pricing";
import { COMMERCIAL_MULTIPLIERS, getCommercialMultipliers } from "./multipliers";
import { computeWeightedArea } from "./weightedAreaEngine";

/**
 * Calculates construction cost for a commercial project using the weighted-
 * area engineering model. `category` is "commercial_residential" or
 * "commercial_administrative" — each has its own price table (pricing.js)
 * but shares the same area multipliers (multipliers.js).
 */
export function calculateCommercialCost(
  {
    category,
    quality,
    basementAreas = [],
    groundFloorArea = 0,
    mezzanineArea = 0,
    floorAreas = [],
    penthouseArea = 0,
  },
  { pricingTable = PRICING, multipliersTable = COMMERCIAL_MULTIPLIERS } = {}
) {
  const multipliers = getCommercialMultipliers(category, multipliersTable);
  if (!multipliers) {
    throw new Error(`No commercial multipliers configured for category "${category}"`);
  }

  const ratePerSqm = getRatePerSqm(category, quality, pricingTable);
  if (ratePerSqm == null) {
    throw new Error(`No pricing configured for "${category}" at quality "${quality}"`);
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
    kind: "commercial",

    // ── Customer-safe fields ──
    category,
    quality,
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
