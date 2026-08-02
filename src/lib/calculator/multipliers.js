// Engineering area multipliers: how each raw entered area contributes to the
// single "weighted engineering area" used to price a project. A building
// type that has an entry here uses the new engineering (weighted-area)
// calculation engine instead of the legacy area×floors model — this is what
// makes the calculator config-driven: adding a new type here (and to
// pricing.js) is enough to switch it onto the engineering engine without
// touching any calculation code.

const RESIDENTIAL_MULTIPLIERS = {
  basement: 2,
  groundFloor: 1,
  typicalFloors: 1, // applied to (typicalFloorArea × floorsCount)
  penthouse: 1,
  waterTank: 2,
  septicTank: 2,
  // Fence is measured in linear meters, not m² — it never enters the
  // weighted AREA. Kept here at 1 so a future per-linear-meter fence rate
  // has an explicit, documented multiplier slot rather than a magic number.
  fence: 1,
};

export const ENGINEERING_MULTIPLIERS = {
  residential_building: RESIDENTIAL_MULTIPLIERS,
  villa: RESIDENTIAL_MULTIPLIERS,
};

export function getEngineeringMultipliers(buildingType, multipliersTable = ENGINEERING_MULTIPLIERS) {
  return multipliersTable?.[buildingType] || null;
}

export function hasEngineeringEngine(buildingType, multipliersTable = ENGINEERING_MULTIPLIERS) {
  return Boolean(multipliersTable?.[buildingType]);
}

// Dynamic weighted-area multipliers: weighted area = (basements × 4) +
// (ground floor × 3) + (mezzanine × 1) + (typical floors × 1) + (penthouse × 1).
// Basements and typical floors are entered per-unit (one input each) and
// summed before the multiplier is applied — see commercialEngine.js /
// hotelEngine.js. Exported so every dynamic (basements/floors-as-arrays)
// building type shares the exact same multiplier values from one place.
export const COMMERCIAL_BUILDING_MULTIPLIERS = {
  basement: 4,
  groundFloor: 3,
  mezzanine: 1,
  typicalFloors: 1,
  penthouse: 1,
};

export const COMMERCIAL_MULTIPLIERS = {
  commercial_residential: COMMERCIAL_BUILDING_MULTIPLIERS,
  commercial_administrative: COMMERCIAL_BUILDING_MULTIPLIERS,
};

export function getCommercialMultipliers(commercialCategory, multipliersTable = COMMERCIAL_MULTIPLIERS) {
  return multipliersTable?.[commercialCategory] || null;
}

export function hasCommercialEngine(commercialCategory, multipliersTable = COMMERCIAL_MULTIPLIERS) {
  return Boolean(multipliersTable?.[commercialCategory]);
}

// Hotel uses a single project type ("hotel") — the star rating only changes
// price per m² (pricing.js), never the engineering multipliers, which are
// identical to the commercial engine's.
export function hasHotelEngine(buildingType) {
  return buildingType === "hotel";
}

// Industrial (factory / warehouse) uses ground floor ×3, mezzanine ×1, and
// a single first floor ×1 — no basements, no penthouse. Those unused parts
// default to 0 in weightedAreaEngine.js, so it's safe to reuse the exact
// same multiplier values as commercial/hotel rather than defining a
// separate (redundant) table.
export function hasIndustrialEngine(buildingType) {
  return buildingType === "factory" || buildingType === "warehouse";
}
