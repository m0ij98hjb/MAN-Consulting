export const JOB_TYPES = {
  formal: {
    en: "Formal Staff",
    ar: "وظائف إدارية وهندسية",
  },
  skilled: {
    en: "Skilled Workers",
    ar: "وظائف المعلمين والفنيين",
  }
};

export const DEPARTMENTS = {
  engineering: {
    en: "Engineering Department",
    ar: "قسم الهندسة",
    positions: {
      civil: { en: "Civil Engineer", ar: "مهندس مدني" },
      site: { en: "Site Engineer", ar: "مهندس موقع" },
      structural: { en: "Structural Engineer", ar: "مهندس إنشائي" },
      qty: { en: "Quantity Surveyor", ar: "حاسب كميات" },
    }
  },
  architecture: {
    en: "Architecture Department",
    ar: "قسم العمارة",
    positions: {
      architectural_eng: { en: "Architectural Engineer", ar: "مهندس معماري" },
      draftsman: { en: "Architectural Draftsman", ar: "رسام معماري" }
    }
  },
  interior_design: {
    en: "Interior Design Department",
    ar: "قسم التصميم الداخلي",
    positions: {
      designer: { en: "Interior Designer", ar: "مصمم داخلي" },
      designer_3d: { en: "3D Designer", ar: "مصمم ثلاثي الأبعاد" },
      furniture: { en: "Furniture Designer", ar: "مصمم أثاث" }
    }
  },
  it: {
    en: "Information Technology Department",
    ar: "قسم تقنية المعلومات",
    positions: {
      it_eng: { en: "IT Engineer", ar: "مهندس تقنية معلومات" },
      web: { en: "Web Developer", ar: "مطور ويب" },
      mobile: { en: "Mobile App Developer", ar: "مطور تطبيقات جوال" },
      support: { en: "Technical Support Specialist", ar: "أخصائي دعم فني" },
      sysadmin: { en: "System Administrator", ar: "مدير أنظمة" }
    }
  },
  administration: {
    en: "Administration Department",
    ar: "قسم الإدارة",
    positions: {
      secretary: { en: "Administrative Secretary", ar: "سكرتير إداري" },
      admin: { en: "Office Administrator", ar: "إداري مكتب" },
      assistant: { en: "Executive Assistant", ar: "مساعد تنفيذي" }
    }
  },
  hr: {
    en: "Human Resources Department",
    ar: "قسم الموارد البشرية",
    positions: {
      specialist: { en: "HR Specialist", ar: "أخصائي موارد بشرية" },
      recruitment: { en: "Recruitment Officer", ar: "مسؤول توظيف" },
      coordinator: { en: "HR Coordinator", ar: "منسق موارد بشرية" }
    }
  },
  finance: {
    en: "Finance Department",
    ar: "قسم المالية",
    positions: {
      accountant: { en: "Accountant", ar: "محاسب" },
      senior_accountant: { en: "Senior Accountant", ar: "محاسب أول" },
      analyst: { en: "Financial Analyst", ar: "محلل مالي" }
    }
  },
  contracts: {
    en: "Contracts Department",
    ar: "قسم العقود",
    positions: {
      specialist: { en: "Contract Specialist", ar: "أخصائي عقود" },
      admin: { en: "Contract Administrator", ar: "مدير عقود" },
      claims: { en: "Claims Engineer", ar: "مهندس مطالبات" }
    }
  },
  procurement: {
    en: "Procurement Department",
    ar: "قسم المشتريات",
    positions: {
      officer: { en: "Procurement Officer", ar: "مسؤول مشتريات" },
      specialist: { en: "Purchasing Specialist", ar: "أخصائي شراء" },
      vendor: { en: "Vendor Coordinator", ar: "منسق موردين" }
    }
  },
  pm: {
    en: "Project Management Department",
    ar: "قسم إدارة المشاريع",
    positions: {
      manager: { en: "Project Manager", ar: "مدير مشروع" },
      coordinator: { en: "Project Coordinator", ar: "منسق مشروع" },
      planning: { en: "Planning Engineer", ar: "مهندس تخطيط" }
    }
  },
  qc: {
    en: "Quality Control Department",
    ar: "قسم مراقبة الجودة",
    positions: {
      qaqc_eng: { en: "QA/QC Engineer", ar: "مهندس جودة" },
      qaqc_ins: { en: "QA/QC Inspector", ar: "مفتش جودة" }
    }
  },
  hse: {
    en: "HSE Department",
    ar: "قسم الصحة والسلامة المهنية",
    positions: {
      safety_eng: { en: "Safety Engineer", ar: "مهندس سلامة" },
      hse_officer: { en: "HSE Officer", ar: "مسؤول صحة وسلامة" },
      safety_sup: { en: "Safety Supervisor", ar: "مشرف سلامة" }
    }
  }
};

export const TRADES = {
  carpenter: { en: "Carpenter", ar: "معلم نجارة" },
  electrician: { en: "Electrician", ar: "معلم كهرباء" },
  plumber: { en: "Plumber", ar: "معلم سباكة" },
  mason: { en: "Mason", ar: "معلم بناء" },
  steel_fixer: { en: "Steel Fixer", ar: "معلم حدادة" },
  painter: { en: "Painter", ar: "معلم دهانات" },
  gypsum: { en: "Gypsum Board Technician", ar: "معلم جبس بورد" },
  marble: { en: "Marble Installer", ar: "معلم رخام" },
  tile: { en: "Tile Installer", ar: "معلم سيراميك" },
  aluminum: { en: "Aluminum Technician", ar: "معلم ألمنيوم" },
  glass: { en: "Glass Technician", ar: "معلم زجاج" },
  hvac: { en: "HVAC Technician", ar: "معلم تكييف" },
  welder: { en: "Welder", ar: "معلم لحام" },
  waterproofing: { en: "Waterproofing Technician", ar: "معلم عزل" },
  scaffolding: { en: "Scaffolding Technician", ar: "معلم سقالات" },
  concrete: { en: "Concrete Finisher", ar: "معلم خرسانة" },
  road: { en: "Road Works Technician", ar: "معلم طرق" },
  landscaping: { en: "Landscaping Technician", ar: "معلم تنسيق حدائق" },
  equipment: { en: "Heavy Equipment Operator", ar: "مشغل معدات ثقيلة" },
  foreman: { en: "Construction Foreman", ar: "رئيس عمال" }
};

export function mapCardToSelection(pos) {
  const key = pos?.key;
  if (!key) return null;

  const mappings = {
    pm: { jobType: 'formal', department: 'pm', position: 'Project Manager' },
    civil: { jobType: 'formal', department: 'engineering', position: 'Civil Engineer' },
    arch: { jobType: 'formal', department: 'architecture', position: 'Architectural Engineer' },
    interior: { jobType: 'formal', department: 'interior_design', position: 'Interior Designer' },
    supervisor: { jobType: 'formal', department: 'engineering', position: 'Site Engineer' },
    qty: { jobType: 'formal', department: 'engineering', position: 'Quantity Surveyor' },
    autocad: { jobType: 'formal', department: 'architecture', position: 'Architectural Draftsman' },
    sales: { jobType: 'formal', department: 'administration', position: 'Office Administrator' },
    mech: { jobType: 'formal', department: 'engineering', position: 'Site Engineer' },
    elec: { jobType: 'formal', department: 'engineering', position: 'Site Engineer' },
    safety: { jobType: 'formal', department: 'hse', position: 'Safety Engineer' },
    decor: { jobType: 'formal', department: 'interior_design', position: 'Interior Designer' },
    secretary: { jobType: 'formal', department: 'administration', position: 'Administrative Secretary' },
    doccontrol: { jobType: 'formal', department: 'administration', position: 'Office Administrator' },
    contracts: { jobType: 'formal', department: 'contracts', position: 'Contract Specialist' },
    it: { jobType: 'formal', department: 'it', position: 'IT Engineer' },
    intern_eng: { jobType: 'formal', department: 'engineering', position: 'Site Engineer' },
    intern_design: { jobType: 'formal', department: 'interior_design', position: 'Interior Designer' }
  };

  return mappings[key] || null;
}
