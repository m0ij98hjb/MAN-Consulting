// Shared dynamic weighted-area math. Every "sum of variable-count areas ×
// multiplier" building type (commercial, hotel, industrial, and any future
// type wired up the same way — see multipliers.js) computes its weighted
// area with this single function. Basements and typical floors are entered
// as arrays (one input per unit) and summed before the multiplier is
// applied; a type that doesn't use a given part (e.g. industrial has no
// basements or penthouse) simply passes an empty array / 0.

function sumAreas(areas = []) {
  return areas.reduce((total, area) => total + (Number(area) || 0), 0);
}

export function computeWeightedArea(
  { basementAreas = [], groundFloorArea = 0, mezzanineArea = 0, floorAreas = [], penthouseArea = 0 },
  multipliers
) {
  return (
    sumAreas(basementAreas) * multipliers.basement +
    groundFloorArea * multipliers.groundFloor +
    mezzanineArea * multipliers.mezzanine +
    sumAreas(floorAreas) * multipliers.typicalFloors +
    penthouseArea * multipliers.penthouse
  );
}
