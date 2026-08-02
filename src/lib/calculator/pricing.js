// Construction cost per square meter, by building type and quality tier.
// This is the ONLY place raw pricing numbers should live — never hardcode
// rates inside a React component. Admin-edited rates (via the CMS Calculator
// tab) override this table at runtime; this is just the shipped default.

export const PRICING = {
  residential_building: { economic: 2200, standard: 2500, premium: 3000, ultra: 3500 },
  villa:                { economic: 3500, standard: 4000, premium: 4500, ultra: 5000 },

  // Commercial (weighted-area engineering engine) — see multipliers.js.
  commercial_residential:    { economic: 2000, standard: 2200, premium: 2400, ultra: 2600 },
  commercial_administrative: { economic: 2400, standard: 2800, premium: 3200, ultra: 3600 },

  // Hotel (weighted-area engineering engine) — priced by star rating only,
  // no separate quality tier. See hotelEngine.js.
  hotel: { "3_star": 3500, "4_star": 4000, "5_star": 4500 },

  // Industrial (weighted-area engineering engine) — only two quality tiers
  // (no premium/ultra). See industrialEngine.js.
  factory:   { economic: 2500, standard: 3000 },
  warehouse: { economic: 1800, standard: 2000 },
};

export function getRatePerSqm(buildingType, quality, pricingTable = PRICING) {
  return pricingTable?.[buildingType]?.[quality] ?? null;
}
