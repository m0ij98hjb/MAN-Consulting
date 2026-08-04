export const DEPARTMENTS = {
  architecture: {
    en: "Architecture",
    ar: "التصميم المعماري",
    positions: {
      architect: { en: "Architect", ar: "مهندس معماري" },
      senior_architect: { en: "Senior Architect", ar: "مهندس معماري أول" },
      interior: { en: "Interior Designer", ar: "مصمم داخلي" },
      cad: { en: "CAD Draftsman", ar: "رسام AutoCAD" },
    }
  },
  civil_structural: {
    en: "Civil & Structural Engineering",
    ar: "الهندسة المدنية والإنشائية",
    positions: {
      civil: { en: "Civil Engineer", ar: "مهندس مدني" },
      structural: { en: "Structural Engineer", ar: "مهندس إنشائي" },
      site_eng: { en: "Site Engineer", ar: "مهندس موقع" },
    }
  },
  mep: {
    en: "Mechanical & Electrical Engineering (MEP)",
    ar: "الهندسة الميكانيكية والكهربائية (MEP)",
    positions: {
      mech: { en: "Mechanical Engineer", ar: "مهندس ميكانيكا" },
      elec: { en: "Electrical Engineer", ar: "مهندس كهرباء" },
    }
  },
  bim: {
    en: "BIM & Digital Design",
    ar: "النمذجة الرقمية BIM",
    positions: {
      bim: { en: "BIM Engineer", ar: "مهندس BIM" },
      revit: { en: "Revit Specialist", ar: "أخصائي Revit" },
    }
  },
  quantities_cost: {
    en: "Quantities & Costs",
    ar: "الكميات والتكاليف",
    positions: {
      qty: { en: "Quantity Surveyor", ar: "مراقب كميات" },
      cost_eng: { en: "Cost Engineer", ar: "مهندس تكاليف" },
    }
  },
  project_management: {
    en: "Project Management",
    ar: "إدارة المشاريع",
    positions: {
      pm: { en: "Project Manager", ar: "مدير مشروع" },
      planning: { en: "Planning Engineer", ar: "مهندس تخطيط" },
      tech_office: { en: "Technical Office Engineer", ar: "مهندس مكتب فني" },
    }
  },
  permits_compliance: {
    en: "Permits & Compliance",
    ar: "التراخيص والجودة",
    positions: {
      permit_eng: { en: "Building Permit Engineer", ar: "مهندس تراخيص" },
      inspector: { en: "Engineering Inspector", ar: "مفتش هندسي" },
    }
  },
  administration: {
    en: "Administration",
    ar: "الإدارة",
    positions: {
      doccontrol: { en: "Document Controller", ar: "داكيومنت كنترول" },
      admin_asst: { en: "Administrative Assistant", ar: "مساعد إداري" },
    }
  },
};

export const TRADES = {
  cad: { en: "CAD Draftsman", ar: "رسام AutoCAD" },
  revit: { en: "Revit Specialist", ar: "أخصائي Revit" },
  doccontrol: { en: "Document Controller", ar: "داكيومنت كنترول" },
  admin_asst: { en: "Administrative Assistant", ar: "مساعد إداري" },
};

export function mapCardToSelection(pos) {
  const key = pos?.key;
  if (!key) return null;

  const mappings = {
    architect: { jobType: 'formal', department: 'architecture', position: 'Architect' },
    senior_architect: { jobType: 'formal', department: 'architecture', position: 'Senior Architect' },
    interior: { jobType: 'formal', department: 'architecture', position: 'Interior Designer' },
    civil: { jobType: 'formal', department: 'civil_structural', position: 'Civil Engineer' },
    structural: { jobType: 'formal', department: 'civil_structural', position: 'Structural Engineer' },
    mech: { jobType: 'formal', department: 'mep', position: 'Mechanical Engineer' },
    elec: { jobType: 'formal', department: 'mep', position: 'Electrical Engineer' },
    bim: { jobType: 'formal', department: 'bim', position: 'BIM Engineer' },
    qty: { jobType: 'formal', department: 'quantities_cost', position: 'Quantity Surveyor' },
    pm: { jobType: 'formal', department: 'project_management', position: 'Project Manager' },
    site_eng: { jobType: 'formal', department: 'civil_structural', position: 'Site Engineer' },
    tech_office: { jobType: 'formal', department: 'project_management', position: 'Technical Office Engineer' },
    cad: { jobType: 'formal', department: 'architecture', position: 'CAD Draftsman' },
    revit: { jobType: 'formal', department: 'bim', position: 'Revit Specialist' },
    planning: { jobType: 'formal', department: 'project_management', position: 'Planning Engineer' },
    cost_eng: { jobType: 'formal', department: 'quantities_cost', position: 'Cost Engineer' },
    permit_eng: { jobType: 'formal', department: 'permits_compliance', position: 'Building Permit Engineer' },
    inspector: { jobType: 'formal', department: 'permits_compliance', position: 'Engineering Inspector' },
    doccontrol: { jobType: 'formal', department: 'administration', position: 'Document Controller' },
    admin_asst: { jobType: 'formal', department: 'administration', position: 'Administrative Assistant' },
  };

  return mappings[key] || null;
}
