// Validation for the engineering (weighted-area) calculator flow.
// Returns { valid, errors } where `errors` is keyed by field name so the UI
// can highlight individual invalid inputs.

const REQUIRED_NON_NEGATIVE_FIELDS = [
  "basementArea",
  "groundFloorArea",
  "typicalFloorArea",
  "penthouseArea",
  "waterTankArea",
  "septicTankArea",
  "fenceLength",
];

function isBlankOrNaN(value) {
  return value === "" || value === null || value === undefined || isNaN(Number(value));
}

export function validateEngineeringInputs(input) {
  const errors = {};

  if (!input.buildingType) errors.buildingType = "required";
  if (!input.quality) errors.quality = "required";

  if (isBlankOrNaN(input.floorsCount) || Number(input.floorsCount) < 1) {
    errors.floorsCount = "invalid";
  }

  REQUIRED_NON_NEGATIVE_FIELDS.forEach((key) => {
    const value = input[key];
    if (isBlankOrNaN(value)) {
      errors[key] = "invalid";
    } else if (Number(value) < 0) {
      errors[key] = "negative";
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

const MAX_BASEMENTS = 4;
const MAX_FLOORS = 60;

function validateAreaList(areas, count, keyPrefix, errors) {
  if (!Number.isInteger(count) || areas.length !== count) {
    errors[keyPrefix] = "invalid";
    return;
  }
  areas.forEach((value, i) => {
    const key = `${keyPrefix}_${i}`;
    if (isBlankOrNaN(value)) {
      errors[key] = "invalid";
    } else if (Number(value) < 0) {
      errors[key] = "negative";
    }
  });
}

/**
 * Shared by every dynamic (basements/floors-as-arrays) flow: validates a
 * variable number of basements and typical floors, each with its own area
 * input, plus the always-visible ground floor / mezzanine / penthouse
 * fields. Mutates `errors` in place; callers add their own category/rating
 * and quality checks on top.
 */
function validateDynamicAreaInputs(input, errors) {
  const basementsCount = Number(input.basementsCount);
  if (isBlankOrNaN(input.basementsCount) || basementsCount < 0 || basementsCount > MAX_BASEMENTS) {
    errors.basementsCount = "invalid";
  } else {
    validateAreaList(input.basementAreas || [], basementsCount, "basementArea", errors);
  }

  const floorsCount = Number(input.floorsCount);
  if (isBlankOrNaN(input.floorsCount) || floorsCount < 1 || floorsCount > MAX_FLOORS) {
    errors.floorsCount = "invalid";
  } else {
    validateAreaList(input.floorAreas || [], floorsCount, "floorArea", errors);
  }

  ["groundFloorArea", "mezzanineArea", "penthouseArea"].forEach((key) => {
    const value = input[key];
    if (isBlankOrNaN(value)) {
      errors[key] = "invalid";
    } else if (Number(value) < 0) {
      errors[key] = "negative";
    }
  });
}

export function validateCommercialInputs(input) {
  const errors = {};
  if (!input.category) errors.category = "required";
  if (!input.quality) errors.quality = "required";
  validateDynamicAreaInputs(input, errors);
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateHotelInputs(input) {
  const errors = {};
  if (!input.rating) errors.rating = "required";
  validateDynamicAreaInputs(input, errors);
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Industrial has no basements, no penthouse, and a single fixed first
 * floor — just three required non-negative areas plus category/quality.
 */
export function validateIndustrialInputs(input) {
  const errors = {};

  if (!input.category) errors.category = "required";
  if (!input.quality) errors.quality = "required";

  ["groundFloorArea", "mezzanineArea", "firstFloorArea"].forEach((key) => {
    const value = input[key];
    if (isBlankOrNaN(value)) {
      errors[key] = "invalid";
    } else if (Number(value) < 0) {
      errors[key] = "negative";
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}
