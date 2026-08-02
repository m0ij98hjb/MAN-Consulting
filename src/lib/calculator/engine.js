// Engineering (weighted-area) calculation engine.
// Pure functions only — no React, no UI, no i18n. Business logic lives here
// so it can be unit-tested and reused independently of the calculator page.

import { PRICING, getRatePerSqm } from "./pricing";
import { ENGINEERING_MULTIPLIERS, getEngineeringMultipliers } from "./multipliers";

export function computeWeightedArea(areas, multipliers) {
  const {
    basementArea = 0,
    groundFloorArea = 0,
    typicalFloorArea = 0,
    floorsCount = 0,
    penthouseArea = 0,
    waterTankArea = 0,
    septicTankArea = 0,
  } = areas;

  const typicalFloorsArea = typicalFloorArea * floorsCount;

  return (
    basementArea * multipliers.basement +
    groundFloorArea * multipliers.groundFloor +
    typicalFloorsArea * multipliers.typicalFloors +
    penthouseArea * multipliers.penthouse +
    waterTankArea * multipliers.waterTank +
    septicTankArea * multipliers.septicTank
  );
}

/**
 * Calculates construction cost using the engineering (weighted-area) model.
 *
 * `fenceRatePerLm` defaults to 0 — fence pricing is not defined yet. Once a
 * rate is introduced (per building type/quality), pass it in and fence cost
 * is added automatically with no change to this function or its callers.
 *
 * `pricingTable` / `multipliersTable` can be overridden (e.g. with
 * CMS-edited rates) without touching this function.
 */
export function calculateEngineeringCost(
  {
    buildingType,
    quality,
    basementArea = 0,
    groundFloorArea = 0,
    typicalFloorArea = 0,
    floorsCount = 0,
    penthouseArea = 0,
    waterTankArea = 0,
    septicTankArea = 0,
    fenceLength = 0,
    fenceRatePerLm = 0,
  },
  { pricingTable = PRICING, multipliersTable = ENGINEERING_MULTIPLIERS } = {}
) {
  const multipliers = getEngineeringMultipliers(buildingType, multipliersTable);
  if (!multipliers) {
    throw new Error(`No engineering multipliers configured for building type "${buildingType}"`);
  }

  const ratePerSqm = getRatePerSqm(buildingType, quality, pricingTable);
  if (ratePerSqm == null) {
    throw new Error(`No pricing configured for "${buildingType}" at quality "${quality}"`);
  }

  const areas = { basementArea, groundFloorArea, typicalFloorArea, floorsCount, penthouseArea, waterTankArea, septicTankArea };
  const weightedArea = computeWeightedArea(areas, multipliers);
  const constructionCost = weightedArea * ratePerSqm;
  const fenceCost = fenceLength * fenceRatePerLm;
  const totalCost = constructionCost + fenceCost;

  return {
    kind: "engineering",

    // ── Customer-safe fields ──
    buildingType,
    quality,
    floorsCount,
    areas,
    fenceLength,
    weightedArea: Math.round(weightedArea),
    estimatedCost: Math.round(totalCost),

    // ── Admin/internal-only — callers must not render this to customers ──
    _internal: {
      ratePerSqm,
      multipliers,
      constructionCost: Math.round(constructionCost),
      fenceRatePerLm,
      fenceCost: Math.round(fenceCost),
    },
  };
}
