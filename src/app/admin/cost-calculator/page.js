"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useAuth } from "@/context/AuthContext";
import { COST_TOOL_ROLES } from "@/lib/roleBasedAccess";
import { createCostReport } from "@/lib/costReportsRepo";
import CalculatorResultView from "@/components/calculator/CalculatorResultView";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { PRICING } from "@/lib/calculator/pricing";
import { hasEngineeringEngine, hasCommercialEngine, hasHotelEngine, hasIndustrialEngine } from "@/lib/calculator/multipliers";
import { calculateEngineeringCost } from "@/lib/calculator/engine";
import { calculateCommercialCost } from "@/lib/calculator/commercialEngine";
import { calculateHotelCost } from "@/lib/calculator/hotelEngine";
import { calculateIndustrialCost } from "@/lib/calculator/industrialEngine";
import { validateEngineeringInputs, validateCommercialInputs, validateHotelInputs, validateIndustrialInputs } from "@/lib/calculator/validation";
import {
  Home,
  Building,
  Building2,
  Factory,
  Hotel,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Calculator,
  RotateCcw,
  TrendingUp,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Waves,
  Zap,
  Sun,
  Cpu,
  Flower2,
  SquareStack,
  Phone,
  Loader2,
  ShieldAlert,
  FileText,
  Printer,
} from "lucide-react";

// ─── Component ────────────────────────────────────────────────────────────────
export default function CostCalculatorPage() {
  const { t, lang, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { data: calcCms } = useSiteContent('calculator');
  const { loading: roleLoading, isRole, profile, role } = useRoleAccess();
  const { user } = useAuth();
  const isLightMode = theme === 'dark';
  const isRtl = isRTL;
  // Light mode helper classes
  const cardCls = isLightMode ? 'bg-white border border-slate-200 shadow-sm' : 'bg-white/5 border border-white/10';
  const textPri = isLightMode ? 'text-[#1e293b]' : 'text-white';
  const textMut = isLightMode ? 'text-slate-400' : 'text-white/40';
  const textSec = isLightMode ? 'text-slate-500' : 'text-white/60';

  const fmt = (n) => {
    const locale = (lang === "ar" || lang === "ur") ? "ar-SA" : "en-US";
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);
  };

  const ui = {
    next: {
      ar: "التالي", en: "Next", zh: "下一步", es: "Siguiente",
      fr: "Suivant", de: "Weiter", tr: "İleri", ur: "اگلا"
    },
    back: {
      ar: "السابق", en: "Back", zh: "上一步", es: "Atrás",
      fr: "Retour", de: "Zurück", tr: "Geri", ur: "پیچھے"
    },
    backToHome: {
      ar: "العودة إلى لوحة التحكم", en: "Back to Dashboard", zh: "返回仪表板", es: "Volver al panel",
      fr: "Retour au tableau de bord", de: "Zurück zum Dashboard", tr: "Panele Dön", ur: "ڈیش بورڈ پر واپس"
    },
    processing: {
      ar: "نعمل على تحليل بيانات مشروعك...",
      en: "Processing your project specifications...",
      zh: "正在处理您的项目规格...",
      es: "Procesando las especificaciones de su proyecto...",
      fr: "Traitement des spécifications de votre projet...",
      de: "Verarbeitung Ihrer Projektspezifikationen...",
      tr: "Proje özellikleriniz işleniyor...",
      ur: "آپ کے پروجیکٹ کی تفصیلات پر کارروائي کی جا رہی ہے..."
    }
  };

  const generateInsights = ({ type, area, quality, location, extras, costPerSqm }) => {
    const list = [];

    if (quality === "premium" || quality === "ultra") {
      list.push(t("calculator.insights.premium"));
    }
    if (area > 1000) {
      list.push(t("calculator.insights.large"));
    }
    if (extras.includes("solar")) {
      list.push(t("calculator.insights.solar"));
    }
    if (extras.includes("smart")) {
      list.push(t("calculator.insights.smart"));
    }
    if (location === "mecca") {
      list.push(t("calculator.insights.mecca"));
    }
    if (type === "hotel") {
      list.push(t("calculator.insights.hotel"));
    }

    // Format the range insight template
    const minVal = fmt(costPerSqm * 0.9);
    const maxVal = fmt(costPerSqm * 1.1);
    
    // Resolve location name
    const locName = t(`calculator.${location}`);
    
    let rangeTemplate = t("calculator.insights.range");
    if (rangeTemplate && typeof rangeTemplate === "string") {
      rangeTemplate = rangeTemplate
        .replace("{location}", locName)
        .replace("{min}", minVal)
        .replace("{max}", maxVal);
      list.push(rangeTemplate);
    }

    return list;
  };

  const calculateProjectCost = ({ type, area, floors, quality, location, extras }) => {
    const BASE_RATES = calcCms?.rates || PRICING;

    const LOCATION_MULTIPLIER = {
      jeddah: 1.0,
      riyadh: 1.05,
      mecca: 1.1,
      dammam: 0.98,
      other_city: 0.92,
    };

    const EXTRAS_COST = {
      pool: 180000,
      elevator: 120000,
      solar: 85000,
      smart: 95000,
      landscape: 65000,
      basement: area * 600,
    };

    const baseRate = BASE_RATES[type]?.[quality] || 2500;
    const totalArea = area * floors;
    const locationMult = LOCATION_MULTIPLIER[location] || 1.0;
    const baseTotal = totalArea * baseRate * locationMult;

    let extrasTotal = 0;
    extras.forEach((ex) => { extrasTotal += EXTRAS_COST[ex] || 0; });

    const structurePct = 0.40;
    const finishingPct = 0.30;
    const mepPct = 0.20;
    const externalPct = 0.07;
    const contingencyPct = 0.03;

    const structure   = baseTotal * structurePct;
    const finishing   = baseTotal * finishingPct;
    const mep         = baseTotal * mepPct;
    const external    = baseTotal * externalPct;
    const contingency = baseTotal * contingencyPct;

    const total = baseTotal + extrasTotal;
    const min = total * 0.88;
    const max = total * 1.18;

    // Timeline (months)
    const timeline = Math.ceil(totalArea / 800 + floors * 1.5 + (extras.length * 0.5));

    // AI Insights
    const insights = generateInsights({ type, area: totalArea, quality, location, extras, costPerSqm: baseRate * locationMult });

    return {
      kind: "legacy",
      min: Math.round(min),
      max: Math.round(max),
      avg: Math.round(total),
      costPerSqm: Math.round(baseRate * locationMult),
      breakdown: {
        structure: Math.round(structure),
        finishing: Math.round(finishing),
        mep: Math.round(mep),
        external: Math.round(external),
        contingency: Math.round(contingency),
        extras: Math.round(extrasTotal),
      },
      timeline,
      insights,
    };
  };

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    // legacy (area × floors) flow — hotel / commercial / industrial
    area: "",
    floors: "1",
    location: "jeddah",
    extras: [],
    // shared
    quality: "standard",
    // engineering (weighted-area) flow — residential buildings / villas
    basementArea: "",
    groundFloorArea: "",
    typicalFloorArea: "",
    floorsCount: "1",
    penthouseArea: "",
    waterTankArea: "",
    septicTankArea: "",
    fenceLength: "",
    // commercial / hotel / industrial (weighted-area, dynamic) flow
    basementsCount: "0",
    basementAreas: [],
    mezzanineArea: "",
    floorAreas: [],
    hotelRating: "",
    firstFloorArea: "",
  });
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastReportId, setLastReportId] = useState(null);

  const isEngineeringFlow = hasEngineeringEngine(formData.type);
  const isCommercialFlow = hasCommercialEngine(formData.type);
  const isHotelFlow = hasHotelEngine(formData.type);
  const isIndustrialFlow = hasIndustrialEngine(formData.type);
  const isResidentialSubtype = (type) => type === "residential_building" || type === "villa";
  const isCommercialSubtype = (type) => type === "commercial_residential" || type === "commercial_administrative";
  const isIndustrialSubtype = (type) => type === "factory" || type === "warehouse";
  const [residentialOpen, setResidentialOpen] = useState(false);
  const [commercialOpen, setCommercialOpen] = useState(false);
  const [industrialOpen, setIndustrialOpen] = useState(false);
  const subtypePanelRef = useRef(null);

  // Auto-scroll the newly revealed subtype panel into view instead of leaving
  // it hidden below the fold until the user notices and scrolls manually.
  useEffect(() => {
    if ((residentialOpen || commercialOpen || industrialOpen) && subtypePanelRef.current) {
      subtypePanelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [residentialOpen, commercialOpen, industrialOpen]);

  const hotelRatingOptions = [
    { key: "3_star", label: t("calculator.hotel_3_star") },
    { key: "4_star", label: t("calculator.hotel_4_star") },
    { key: "5_star", label: t("calculator.hotel_5_star") },
  ];

  const projectTypes = [
    { key: "residential", icon: Building, color: "#D5B25D" },
    { key: "hotel",       icon: Hotel, color: "#f472b6" },
    { key: "commercial",  icon: Building2, color: "#60a5fa" },
    { key: "industrial",  icon: Factory, color: "#34d399" },
  ];

  const residentialSubtypes = [
    { key: "residential_building", icon: Building, color: "#D5B25D" },
    { key: "villa",                icon: Home, color: "#c9975a" },
  ];

  const commercialSubtypes = [
    { key: "commercial_residential",    icon: Building2,    color: "#60a5fa" },
    { key: "commercial_administrative", icon: SquareStack,  color: "#38bdf8" },
  ];

  const industrialSubtypes = [
    { key: "factory",   icon: Factory,     color: "#34d399" },
    { key: "warehouse", icon: SquareStack, color: "#2dd4bf" },
  ];

  const MAX_COMMERCIAL_BASEMENTS = 4;
  const MAX_COMMERCIAL_FLOORS = 30;

  const setBasementsCount = (count) => {
    const n = Math.max(0, Math.min(MAX_COMMERCIAL_BASEMENTS, count));
    setFormData((p) => ({
      ...p,
      basementsCount: String(n),
      basementAreas: Array.from({ length: n }, (_, i) => p.basementAreas[i] ?? ""),
    }));
    setErrors({});
  };

  const setCommercialFloorsCount = (count) => {
    const n = Math.max(1, Math.min(MAX_COMMERCIAL_FLOORS, count));
    setFormData((p) => ({
      ...p,
      floorsCount: String(n),
      floorAreas: Array.from({ length: n }, (_, i) => p.floorAreas[i] ?? ""),
    }));
    setErrors({});
  };

  const updateBasementArea = (index, value) => {
    setFormData((p) => {
      const arr = [...p.basementAreas];
      arr[index] = value;
      return { ...p, basementAreas: arr };
    });
    setErrors({});
  };

  const updateFloorArea = (index, value) => {
    setFormData((p) => {
      const arr = [...p.floorAreas];
      arr[index] = value;
      return { ...p, floorAreas: arr };
    });
    setErrors({});
  };

  const basementAreaLabel = (i) =>
    (t("calculator.engineering.basementAreaTemplate") || "Basement {n} Area").replace("{n}", i + 1);
  const floorAreaLabel = (i) =>
    (t("calculator.engineering.floorAreaTemplate") || "Floor {n} Area").replace("{n}", i + 1);

  const engineeringAreaFields = [
    { key: "basementArea",     label: t("calculator.engineering.basementArea") },
    { key: "groundFloorArea",  label: t("calculator.engineering.groundFloorArea") },
    { key: "typicalFloorArea", label: t("calculator.engineering.typicalFloorArea") },
    { key: "penthouseArea",    label: t("calculator.engineering.penthouseArea") },
    { key: "waterTankArea",    label: t("calculator.engineering.waterTankArea") },
    { key: "septicTankArea",   label: t("calculator.engineering.septicTankArea") },
  ];

  const qualityOptions = [
    { key: "economic", color: "#64748b", label: t("calculator.economic") },
    { key: "standard", color: "#D5B25D", label: t("calculator.standard") },
    { key: "premium",  color: "#f59e0b", label: t("calculator.premium") },
    { key: "ultra",    color: "#a855f7", label: t("calculator.ultra") },
  ];

  // Industrial (factory/warehouse) only offers two tiers — no premium/ultra.
  const industrialQualityOptions = qualityOptions.filter((q) => q.key === "economic" || q.key === "standard");

  const locationOptions = [
    { key: "jeddah", label: t("calculator.jeddah") },
    { key: "riyadh", label: t("calculator.riyadh") },
    { key: "mecca",  label: t("calculator.mecca") },
    { key: "dammam", label: t("calculator.dammam") },
    { key: "other_city", label: t("calculator.other_city") },
  ];

  const extrasOptions = [
    { key: "pool",      icon: Waves,       label: t("calculator.pool"),      cost: "180,000" },
    { key: "elevator",  icon: SquareStack, label: t("calculator.elevator"),  cost: "120,000" },
    { key: "solar",     icon: Sun,         label: t("calculator.solar"),     cost: "85,000"  },
    { key: "smart",     icon: Cpu,         label: t("calculator.smart"),     cost: "95,000"  },
    { key: "landscape", icon: Flower2,     label: t("calculator.landscape"), cost: "65,000"  },
    { key: "basement",  icon: SquareStack, label: t("calculator.basement"),  cost: "+" },
  ];

  const validateStep1 = () => {
    if (!formData.type) {
      setErrors({ type: true });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    if (isIndustrialFlow) {
      const { valid, errors: e } = validateIndustrialInputs({
        category: formData.type,
        quality: formData.quality,
        groundFloorArea: formData.groundFloorArea,
        mezzanineArea: formData.mezzanineArea,
        firstFloorArea: formData.firstFloorArea,
      });
      if (!valid) { setErrors(e); return false; }
      setErrors({});
      return true;
    }

    if (isHotelFlow) {
      const { valid, errors: e } = validateHotelInputs({
        rating: formData.hotelRating,
        basementsCount: formData.basementsCount,
        basementAreas: formData.basementAreas,
        groundFloorArea: formData.groundFloorArea,
        mezzanineArea: formData.mezzanineArea,
        floorsCount: formData.floorsCount,
        floorAreas: formData.floorAreas,
        penthouseArea: formData.penthouseArea,
      });
      if (!valid) { setErrors(e); return false; }
      setErrors({});
      return true;
    }

    if (isCommercialFlow) {
      const { valid, errors: e } = validateCommercialInputs({
        category: formData.type,
        quality: formData.quality,
        basementsCount: formData.basementsCount,
        basementAreas: formData.basementAreas,
        groundFloorArea: formData.groundFloorArea,
        mezzanineArea: formData.mezzanineArea,
        floorsCount: formData.floorsCount,
        floorAreas: formData.floorAreas,
        penthouseArea: formData.penthouseArea,
      });
      if (!valid) { setErrors(e); return false; }
      setErrors({});
      return true;
    }

    if (isEngineeringFlow) {
      const { valid, errors: e } = validateEngineeringInputs({
        buildingType: formData.type,
        quality: formData.quality,
        floorsCount: formData.floorsCount,
        basementArea: formData.basementArea,
        groundFloorArea: formData.groundFloorArea,
        typicalFloorArea: formData.typicalFloorArea,
        penthouseArea: formData.penthouseArea,
        waterTankArea: formData.waterTankArea,
        septicTankArea: formData.septicTankArea,
        fenceLength: formData.fenceLength,
      });
      if (!valid) { setErrors(e); return false; }
      setErrors({});
      return true;
    }

    const e = {};
    if (!formData.area || isNaN(formData.area) || Number(formData.area) < 50)
      e.area = true;
    if (Object.keys(e).length) { setErrors(e); return false; }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 2) {
      runCalculation();
      return;
    }
    setStep((s) => s + 1);
  };

  const runCalculation = () => {
    setCalculating(true);
    setTimeout(() => {
      const res = isIndustrialFlow
        ? calculateIndustrialCost(
            {
              category: formData.type,
              quality: formData.quality,
              groundFloorArea: Number(formData.groundFloorArea) || 0,
              mezzanineArea: Number(formData.mezzanineArea) || 0,
              firstFloorArea: Number(formData.firstFloorArea) || 0,
            },
            { pricingTable: calcCms?.rates || PRICING }
          )
        : isHotelFlow
        ? calculateHotelCost(
            {
              rating: formData.hotelRating,
              basementAreas: formData.basementAreas.map((a) => Number(a) || 0),
              groundFloorArea: Number(formData.groundFloorArea) || 0,
              mezzanineArea: Number(formData.mezzanineArea) || 0,
              floorAreas: formData.floorAreas.map((a) => Number(a) || 0),
              penthouseArea: Number(formData.penthouseArea) || 0,
            },
            { pricingTable: calcCms?.rates || PRICING }
          )
        : isCommercialFlow
        ? calculateCommercialCost(
            {
              category: formData.type,
              quality: formData.quality,
              basementAreas: formData.basementAreas.map((a) => Number(a) || 0),
              groundFloorArea: Number(formData.groundFloorArea) || 0,
              mezzanineArea: Number(formData.mezzanineArea) || 0,
              floorAreas: formData.floorAreas.map((a) => Number(a) || 0),
              penthouseArea: Number(formData.penthouseArea) || 0,
            },
            { pricingTable: calcCms?.rates || PRICING }
          )
        : isEngineeringFlow
        ? calculateEngineeringCost(
            {
              buildingType: formData.type,
              quality: formData.quality,
              basementArea: Number(formData.basementArea) || 0,
              groundFloorArea: Number(formData.groundFloorArea) || 0,
              typicalFloorArea: Number(formData.typicalFloorArea) || 0,
              floorsCount: Number(formData.floorsCount) || 0,
              penthouseArea: Number(formData.penthouseArea) || 0,
              waterTankArea: Number(formData.waterTankArea) || 0,
              septicTankArea: Number(formData.septicTankArea) || 0,
              fenceLength: Number(formData.fenceLength) || 0,
            },
            { pricingTable: calcCms?.rates || PRICING }
          )
        : calculateProjectCost({
            type: formData.type,
            area: Number(formData.area),
            floors: Number(formData.floors),
            quality: formData.quality,
            location: formData.location,
            extras: formData.extras,
          });
      setResult(res);
      setCalculating(false);
      setStep(3);
      setLastReportId(null);

      // Auto-log this run so it shows up in "تقارير التكلفة" — fire-and-forget,
      // a logging failure shouldn't block the user from seeing their result.
      const category = isIndustrialFlow ? "industrial" : isHotelFlow ? "hotel" : isCommercialFlow ? "commercial" : isEngineeringFlow ? "residential" : "other";
      createCostReport({
        category,
        type: formData.type,
        quality: formData.quality,
        inputs: formData,
        result: res,
        createdByUid: user?.uid || "",
        createdByName: profile?.name || user?.email || "",
        createdByEmail: user?.email || "",
        createdByRole: role || "",
      }).then((id) => setLastReportId(id))
        .catch((err) => console.error("Failed to save cost report:", err));
    }, 1800);
  };

  const toggleExtra = (key) => {
    setFormData((prev) => ({
      ...prev,
      extras: prev.extras.includes(key)
        ? prev.extras.filter((e) => e !== key)
        : [...prev.extras, key],
    }));
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    setLastReportId(null);
    setResidentialOpen(false);
    setCommercialOpen(false);
    setIndustrialOpen(false);
    setFormData({
      type: "", area: "", floors: "1", location: "jeddah", extras: [], quality: "standard",
      basementArea: "", groundFloorArea: "", typicalFloorArea: "", floorsCount: "1",
      penthouseArea: "", waterTankArea: "", septicTankArea: "", fenceLength: "",
      basementsCount: "0", basementAreas: [], mezzanineArea: "", floorAreas: [], hotelRating: "",
      firstFloorArea: "",
    });
    setErrors({});
  };

  const breakdownKeys = ["structure", "finishing", "mep", "external", "contingency"];
  const breakdownColors = ["#D5B25D", "#60a5fa", "#34d399", "#f472b6", "#f59e0b"];

  // Role gate: this is an internal tool, restricted to the 6 roles in ALLOWED_ROLES.
  // UI-level check (hides the sidebar entry) lives in roleBasedAccess.js / AdminSidebar;
  // this is the route-level check so direct URL access is blocked too.
  if (roleLoading) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="animate-spin text-[#c8a96e]" />
        </div>
      </AdminPageLayout>
    );
  }

  if (!isRole(COST_TOOL_ROLES)) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-center max-w-md">
            <ShieldAlert size={32} className="text-amber-400 mx-auto mb-3" />
            <p className="text-white font-bold mb-1.5">{t('admin.accessDeniedTitle')}</p>
            <p className="text-white/40 text-sm">{t('admin.accessDeniedDesc')}</p>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]" dir={isRtl ? "rtl" : "ltr"}>

      {/* Hero Banner */}
      <div className="relative pt-6 sm:pt-8 md:pt-10 pb-8 sm:pb-10 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0d1526] to-black" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #D5B25D 0%, transparent 60%), radial-gradient(circle at 70% 30%, #B8923A 0%, transparent 50%)" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#D5B25D]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(to right, #D5B25D 1px, transparent 1px), linear-gradient(to bottom, #D5B25D 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D5B25D]/30 bg-[#D5B25D]/10 mb-6">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D5B25D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L3 7v5c0 5 4 9.3 9 10.5C17 21.3 21 17 21 12V7l-9-5z"/>
            </svg>
            <span className="text-[#D5B25D] text-xs font-bold tracking-widest uppercase">{t("calculator.badge")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight text-white">
            <span className="text-gradient">{t("calculator.title")}</span>
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] mx-auto mb-6 rounded-full" />
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-white/70">
            {t("calculator.subtitle")}
          </p>
          <Link
            href="/admin/cost-reports"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full border border-[#D5B25D]/40 bg-[#D5B25D]/10 hover:bg-[#D5B25D]/20 hover:border-[#D5B25D]/70 text-[#D5B25D] font-bold text-sm transition-all duration-300"
          >
            <FileText size={16} />
            {t("costReports.title")}
          </Link>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className={`sticky top-[72px] z-40 backdrop-blur-xl border-b ${isLightMode ? 'bg-white/90 border-[#D5B25D]/20' : 'bg-black/80 border-[#D5B25D]/10'}`}>
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center gap-2 sm:gap-4">
                <div className={`flex items-center gap-2 transition-all duration-300 ${step >= s ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                    step > s ? "bg-[#D5B25D] text-black" : step === s ? "bg-[#D5B25D]/20 border-2 border-[#D5B25D] text-[#D5B25D]" : isLightMode ? "bg-slate-100 border border-slate-300 text-slate-400" : "bg-white/5 border border-white/20 text-white/40"
                  }`}>
                    {step > s ? <CheckCircle2 size={14} /> : s}
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold hidden sm:block ${step === s ? "text-[#D5B25D]" : textMut}`}>
                    {t(`calculator.step${s}`)}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-8 sm:w-16 h-px transition-all duration-500 ${step > s + 0 ? "bg-[#D5B25D]" : isLightMode ? "bg-slate-200" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">

        {/* ── STEP 1: Project Type ── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className={`text-2xl sm:text-3xl font-black text-center mb-8 ${textPri}`}>
              {t("calculator.projectType")}
            </h2>
            {errors.type && (
              <p className="text-red-400 text-sm text-center mb-4">{t("calculator.required")}</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              {projectTypes.map(({ key, icon: Icon, color }) => {
                const isSelected = key === "residential" ? isResidentialSubtype(formData.type) : key === "commercial" ? isCommercialSubtype(formData.type) : key === "industrial" ? isIndustrialSubtype(formData.type) : formData.type === key;
                return (
                <button
                  key={key}
                  onClick={() => {
                    setErrors({});
                    if (key === "residential") {
                      if (!residentialOpen && !isResidentialSubtype(formData.type)) {
                        setFormData((p) => ({ ...p, type: "" }));
                      }
                      setCommercialOpen(false);
                      setIndustrialOpen(false);
                      setResidentialOpen((o) => !o);
                    } else if (key === "commercial") {
                      if (!commercialOpen && !isCommercialSubtype(formData.type)) {
                        setFormData((p) => ({ ...p, type: "" }));
                      }
                      setResidentialOpen(false);
                      setIndustrialOpen(false);
                      setCommercialOpen((o) => !o);
                    } else if (key === "industrial") {
                      if (!industrialOpen && !isIndustrialSubtype(formData.type)) {
                        setFormData((p) => ({ ...p, type: "" }));
                      }
                      setResidentialOpen(false);
                      setCommercialOpen(false);
                      setIndustrialOpen((o) => !o);
                    } else {
                      setResidentialOpen(false);
                      setCommercialOpen(false);
                      setIndustrialOpen(false);
                      setFormData((p) => ({ ...p, type: key }));
                    }
                  }}
                  className={`group relative p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center flex flex-col items-center gap-3 ${
                    isSelected
                      ? "border-[#D5B25D] bg-[#D5B25D]/10 shadow-[0_0_30px_rgba(213,178,93,0.2)]"
                      : isLightMode
                        ? "border-slate-200 bg-white hover:border-[#D5B25D]/50 hover:bg-slate-50 shadow-sm"
                        : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={16} className="text-[#D5B25D]" />
                    </div>
                  )}
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                  >
                    <Icon size={28} style={{ color }} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm sm:text-base ${textPri}`}>{t(`calculator.${key}`)}</p>
                    <p className={`text-xs mt-1 ${textMut}`}>{t(`calculator.${key}_desc`)}</p>
                  </div>
                </button>
                );
              })}
            </div>

            {residentialOpen && (
              <div ref={subtypePanelRef} className="mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className={`text-sm font-bold text-center mb-4 ${textSec}`}>{t("calculator.chooseResidentialType")}</p>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto">
                  {residentialSubtypes.map(({ key, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => { setFormData((p) => ({ ...p, type: key })); setErrors({}); }}
                      className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center flex flex-col items-center gap-3 ${
                        formData.type === key
                          ? "border-[#D5B25D] bg-[#D5B25D]/10 shadow-[0_0_30px_rgba(213,178,93,0.2)]"
                          : isLightMode
                            ? "border-slate-200 bg-white hover:border-[#D5B25D]/50 hover:bg-slate-50 shadow-sm"
                            : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      {formData.type === key && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 size={16} className="text-[#D5B25D]" />
                        </div>
                      )}
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                      >
                        <Icon size={24} style={{ color }} />
                      </div>
                      <div>
                        <p className={`font-bold text-sm sm:text-base ${textPri}`}>{t(`calculator.${key}`)}</p>
                        <p className={`text-xs mt-1 ${textMut}`}>{t(`calculator.${key}_desc`)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {commercialOpen && (
              <div ref={subtypePanelRef} className="mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className={`text-sm font-bold text-center mb-4 ${textSec}`}>{t("calculator.chooseCommercialType")}</p>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto">
                  {commercialSubtypes.map(({ key, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => { setFormData((p) => ({ ...p, type: key })); setErrors({}); }}
                      className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center flex flex-col items-center gap-3 ${
                        formData.type === key
                          ? "border-[#D5B25D] bg-[#D5B25D]/10 shadow-[0_0_30px_rgba(213,178,93,0.2)]"
                          : isLightMode
                            ? "border-slate-200 bg-white hover:border-[#D5B25D]/50 hover:bg-slate-50 shadow-sm"
                            : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      {formData.type === key && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 size={16} className="text-[#D5B25D]" />
                        </div>
                      )}
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                      >
                        <Icon size={24} style={{ color }} />
                      </div>
                      <div>
                        <p className={`font-bold text-sm sm:text-base ${textPri}`}>{t(`calculator.${key}`)}</p>
                        <p className={`text-xs mt-1 ${textMut}`}>{t(`calculator.${key}_desc`)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {industrialOpen && (
              <div ref={subtypePanelRef} className="mb-10 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className={`text-sm font-bold text-center mb-4 ${textSec}`}>{t("calculator.chooseIndustrialType")}</p>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto">
                  {industrialSubtypes.map(({ key, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => { setFormData((p) => ({ ...p, type: key })); setErrors({}); }}
                      className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-center flex flex-col items-center gap-3 ${
                        formData.type === key
                          ? "border-[#D5B25D] bg-[#D5B25D]/10 shadow-[0_0_30px_rgba(213,178,93,0.2)]"
                          : isLightMode
                            ? "border-slate-200 bg-white hover:border-[#D5B25D]/50 hover:bg-slate-50 shadow-sm"
                            : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      {formData.type === key && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 size={16} className="text-[#D5B25D]" />
                        </div>
                      )}
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                      >
                        <Icon size={24} style={{ color }} />
                      </div>
                      <div>
                        <p className={`font-bold text-sm sm:text-base ${textPri}`}>{t(`calculator.${key}`)}</p>
                        <p className={`text-xs mt-1 ${textMut}`}>{t(`calculator.${key}_desc`)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#D5B25D] hover:bg-[#E1BF67] text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#D5B25D]/20 text-base cursor-pointer"
              >
                {isRtl && <ChevronLeft size={20} />}
                <span>{ui.next[lang] || ui.next['en']}</span>
                {!isRtl && <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Specifications ── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isIndustrialFlow ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Construction Quality */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.quality")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {industrialQualityOptions.map(({ key, color, label }) => (
                        <button key={key} onClick={() => { setFormData((p) => ({ ...p, quality: key })); setErrors({}); }}
                          className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${formData.quality === key ? "border-[#D5B25D] text-[#D5B25D] bg-[#D5B25D]/10" : isLightMode ? "border-slate-200 text-slate-500 hover:border-[#D5B25D]/50" : "border-white/10 text-white/60 hover:border-white/25"}`}
                          style={formData.quality === key ? { borderColor: color, color } : {}}
                        >{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Ground Floor Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.groundFloorArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.groundFloorArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, groundFloorArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.groundFloorArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.groundFloorArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Mezzanine Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.mezzanineArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.mezzanineArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, mezzanineArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.mezzanineArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.mezzanineArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>

                  {/* First Floor Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.firstFloorArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.firstFloorArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, firstFloorArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.firstFloorArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.firstFloorArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>
                </div>
              </div>
            ) : isHotelFlow ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Hotel Rating */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.hotelRating")}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {hotelRatingOptions.map(({ key, label }) => (
                        <button key={key} onClick={() => { setFormData((p) => ({ ...p, hotelRating: key })); setErrors({}); }}
                          className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${formData.hotelRating === key ? "border-[#D5B25D] text-[#D5B25D] bg-[#D5B25D]/10" : isLightMode ? "border-slate-200 text-slate-500 hover:border-[#D5B25D]/50" : "border-white/10 text-white/60 hover:border-white/25"}`}
                        >{label}</button>
                      ))}
                    </div>
                    {errors.rating && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>

                  {/* Number of Basements */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.basementsCount")}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setBasementsCount(Number(formData.basementsCount) - 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >−</button>
                      <span className="text-3xl font-black text-[#D5B25D] min-w-[60px] text-center">
                        {Number(formData.basementsCount) === 0 ? t("calculator.engineering.noBasementOption") : fmt(Number(formData.basementsCount))}
                      </span>
                      <button
                        onClick={() => setBasementsCount(Number(formData.basementsCount) + 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >+</button>
                    </div>
                    {errors.basementsCount && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}

                    {formData.basementAreas.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-5">
                        {formData.basementAreas.map((value, i) => (
                          <div key={i}>
                            <label className={`block text-xs font-semibold mb-1.5 ${textSec}`}>{basementAreaLabel(i)}</label>
                            <input
                              type="number"
                              min="0"
                              value={value}
                              onChange={(e) => updateBasementArea(i, e.target.value)}
                              placeholder="0"
                              className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors[`basementArea_${i}`] ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ground Floor Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.groundFloorArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.groundFloorArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, groundFloorArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.groundFloorArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.groundFloorArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Mezzanine Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.mezzanineArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.mezzanineArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, mezzanineArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.mezzanineArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.mezzanineArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>

                  {/* Number of Floors */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.floorsCount")}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCommercialFloorsCount(Number(formData.floorsCount) - 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >−</button>
                      <span className="text-3xl font-black text-[#D5B25D] min-w-[60px] text-center">{fmt(Number(formData.floorsCount))}</span>
                      <button
                        onClick={() => setCommercialFloorsCount(Number(formData.floorsCount) + 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >+</button>
                    </div>
                    {errors.floorsCount && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}

                    {formData.floorAreas.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-5">
                        {formData.floorAreas.map((value, i) => (
                          <div key={i}>
                            <label className={`block text-xs font-semibold mb-1.5 ${textSec}`}>{floorAreaLabel(i)}</label>
                            <input
                              type="number"
                              min="0"
                              value={value}
                              onChange={(e) => updateFloorArea(i, e.target.value)}
                              placeholder="0"
                              className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors[`floorArea_${i}`] ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Penthouse Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.penthouseArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.penthouseArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, penthouseArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.penthouseArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.penthouseArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>
                </div>
              </div>
            ) : isCommercialFlow ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Quality */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.quality")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {qualityOptions.map(({ key, color, label }) => (
                        <button key={key} onClick={() => setFormData((p) => ({ ...p, quality: key }))}
                          className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${formData.quality === key ? "border-[#D5B25D] text-[#D5B25D] bg-[#D5B25D]/10" : isLightMode ? "border-slate-200 text-slate-500 hover:border-[#D5B25D]/50" : "border-white/10 text-white/60 hover:border-white/25"}`}
                          style={formData.quality === key ? { borderColor: color, color } : {}}
                        >{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Basements */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.basementsCount")}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setBasementsCount(Number(formData.basementsCount) - 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >−</button>
                      <span className="text-3xl font-black text-[#D5B25D] min-w-[60px] text-center">
                        {Number(formData.basementsCount) === 0 ? t("calculator.engineering.noBasementOption") : fmt(Number(formData.basementsCount))}
                      </span>
                      <button
                        onClick={() => setBasementsCount(Number(formData.basementsCount) + 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >+</button>
                    </div>
                    {errors.basementsCount && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}

                    {formData.basementAreas.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-5">
                        {formData.basementAreas.map((value, i) => (
                          <div key={i}>
                            <label className={`block text-xs font-semibold mb-1.5 ${textSec}`}>{basementAreaLabel(i)}</label>
                            <input
                              type="number"
                              min="0"
                              value={value}
                              onChange={(e) => updateBasementArea(i, e.target.value)}
                              placeholder="0"
                              className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors[`basementArea_${i}`] ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ground Floor Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.groundFloorArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.groundFloorArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, groundFloorArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.groundFloorArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.groundFloorArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Mezzanine Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.mezzanineArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.mezzanineArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, mezzanineArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.mezzanineArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.mezzanineArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>

                  {/* Number of Floors */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.floorsCount")}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCommercialFloorsCount(Number(formData.floorsCount) - 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >−</button>
                      <span className="text-3xl font-black text-[#D5B25D] min-w-[60px] text-center">{fmt(Number(formData.floorsCount))}</span>
                      <button
                        onClick={() => setCommercialFloorsCount(Number(formData.floorsCount) + 1)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >+</button>
                    </div>
                    {errors.floorsCount && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}

                    {formData.floorAreas.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mt-5">
                        {formData.floorAreas.map((value, i) => (
                          <div key={i}>
                            <label className={`block text-xs font-semibold mb-1.5 ${textSec}`}>{floorAreaLabel(i)}</label>
                            <input
                              type="number"
                              min="0"
                              value={value}
                              onChange={(e) => updateFloorArea(i, e.target.value)}
                              placeholder="0"
                              className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors[`floorArea_${i}`] ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Penthouse Area */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.penthouseArea")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.penthouseArea}
                      onChange={(e) => { setFormData((p) => ({ ...p, penthouseArea: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.penthouseArea ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.penthouseArea && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>
                </div>
              </div>
            ) : isEngineeringFlow ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basement / Ground Floor / Typical Floor Area */}
                  {engineeringAreaFields.slice(0, 3).map(({ key, label }) => (
                    <div key={key} className={`${cardCls} rounded-2xl p-6`}>
                      <label className="block text-[#D5B25D] font-bold text-sm mb-3">{label}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData[key]}
                        onChange={(e) => { setFormData((p) => ({ ...p, [key]: e.target.value })); setErrors({}); }}
                        placeholder="0"
                        className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors[key] ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                      />
                      {errors[key] && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                    </div>
                  ))}

                  {/* Number of Typical Floors */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.floorsCount")}
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setFormData((p) => ({ ...p, floorsCount: String(Math.max(1, Number(p.floorsCount) - 1)) }))}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >−</button>
                      <span className="text-3xl font-black text-[#D5B25D] min-w-[60px] text-center">{fmt(Number(formData.floorsCount))}</span>
                      <button
                        onClick={() => setFormData((p) => ({ ...p, floorsCount: String(Math.min(60, Number(p.floorsCount) + 1)) }))}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                      >+</button>
                    </div>
                    {errors.floorsCount && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Penthouse / Water Tank / Septic Tank */}
                  {engineeringAreaFields.slice(3).map(({ key, label }) => (
                    <div key={key} className={`${cardCls} rounded-2xl p-6`}>
                      <label className="block text-[#D5B25D] font-bold text-sm mb-3">{label}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData[key]}
                        onChange={(e) => { setFormData((p) => ({ ...p, [key]: e.target.value })); setErrors({}); }}
                        placeholder="0"
                        className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors[key] ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                      />
                      {errors[key] && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                    </div>
                  ))}

                  {/* Fence Length (linear meters) */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.engineering.fenceLength")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.fenceLength}
                      onChange={(e) => { setFormData((p) => ({ ...p, fenceLength: e.target.value })); setErrors({}); }}
                      placeholder="0"
                      className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.fenceLength ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                    />
                    {errors.fenceLength && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  </div>

                  {/* Quality */}
                  <div className={`${cardCls} rounded-2xl p-6`}>
                    <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                      {t("calculator.quality")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {qualityOptions.map(({ key, color, label }) => (
                        <button key={key} onClick={() => setFormData((p) => ({ ...p, quality: key }))}
                          className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${formData.quality === key ? "border-[#D5B25D] text-[#D5B25D] bg-[#D5B25D]/10" : isLightMode ? "border-slate-200 text-slate-500 hover:border-[#D5B25D]/50" : "border-white/10 text-white/60 hover:border-white/25"}`}
                          style={formData.quality === key ? { borderColor: color, color } : {}}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Area */}
                <div className={`${cardCls} rounded-2xl p-6`}>
                  <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                    {t("calculator.area")}
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={formData.area}
                    onChange={(e) => { setFormData((p) => ({ ...p, area: e.target.value })); setErrors({}); }}
                    placeholder={t("calculator.areaPlaceholder")}
                    className={`w-full border rounded-xl px-4 py-3 text-lg font-bold outline-none transition-all duration-300 focus:border-[#D5B25D] ${errors.area ? "border-red-500" : isLightMode ? "border-slate-200 bg-white text-[#1e293b]" : "border-white/15 bg-black/40 text-white"}`}
                  />
                  {errors.area && <p className="text-red-400 text-xs mt-2">{t("calculator.required")}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[200, 400, 600, 1000, 2000].map((v) => (
                      <button key={v} onClick={() => setFormData((p) => ({ ...p, area: String(v) }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all duration-200 ${formData.area === String(v) ? "bg-[#D5B25D] text-black border-[#D5B25D]" : isLightMode ? "border-slate-200 text-slate-500 hover:border-[#D5B25D]/50" : "border-white/15 text-white/60 hover:border-[#D5B25D]/50"}`}>
                        {fmt(v)} {lang === "ar" || lang === "ur" ? "م²" : "m²"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floors */}
                <div className={`${cardCls} rounded-2xl p-6`}>
                  <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                    {t("calculator.floors")}
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setFormData((p) => ({ ...p, floors: String(Math.max(1, Number(p.floors) - 1)) }))}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                    >−</button>
                    <span className="text-3xl font-black text-[#D5B25D] min-w-[60px] text-center">{fmt(Number(formData.floors))}</span>
                    <button
                      onClick={() => setFormData((p) => ({ ...p, floors: String(Math.min(20, Number(p.floors) + 1)) }))}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center hover:border-[#D5B25D] hover:bg-[#D5B25D]/10 transition-all text-xl font-bold ${isLightMode ? 'border-slate-200 text-[#1e293b]' : 'border-white/20 text-white'}`}
                    >+</button>
                  </div>
                </div>

                {/* Quality */}
                <div className={`${cardCls} rounded-2xl p-6`}>
                  <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                    {t("calculator.quality")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {qualityOptions.map(({ key, color, label }) => (
                      <button key={key} onClick={() => setFormData((p) => ({ ...p, quality: key }))}
                        className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${formData.quality === key ? "border-[#D5B25D] text-[#D5B25D] bg-[#D5B25D]/10" : isLightMode ? "border-slate-200 text-slate-500 hover:border-[#D5B25D]/50" : "border-white/10 text-white/60 hover:border-white/25"}`}
                        style={formData.quality === key ? { borderColor: color, color } : {}}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Location */}
                <div className={`${cardCls} rounded-2xl p-6`}>
                  <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                    {t("calculator.location")}
                  </label>
                  <div className="flex flex-col gap-2">
                    {locationOptions.map(({ key, label }) => (
                      <button key={key} onClick={() => setFormData((p) => ({ ...p, location: key }))}
                        className={`w-full py-2.5 px-4 rounded-xl border text-sm font-semibold text-start transition-all duration-200 ${formData.location === key ? "border-[#D5B25D] bg-[#D5B25D]/10 text-[#D5B25D]" : isLightMode ? "border-slate-200 text-slate-500 hover:border-[#D5B25D]/40" : "border-white/10 text-white/60 hover:border-white/25"}`}
                      >{label}</button>
                    ))}
                  </div>
                </div>

                {/* Extras */}
                <div className={`${cardCls} rounded-2xl p-6`}>
                  <label className="block text-[#D5B25D] font-bold text-sm mb-3">
                    {t("calculator.extras")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {extrasOptions.map(({ key, icon: Icon, label, cost }) => {
                      const active = formData.extras.includes(key);
                      return (
                        <button key={key} onClick={() => toggleExtra(key)}
                          className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${active ? "border-[#D5B25D] bg-[#D5B25D]/10 text-[#D5B25D]" : isLightMode ? "border-slate-200 text-slate-500 hover:border-[#D5B25D]/40" : "border-white/10 text-white/50 hover:border-white/25"}`}
                        >
                          <Icon size={15} />
                          <span className="truncate">{label}</span>
                          {active && <CheckCircle2 size={12} className="ms-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)}
                className={`flex items-center gap-2 px-6 py-3 border font-bold rounded-xl transition-all duration-300 text-sm ${isLightMode ? 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-[#1e293b]' : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'}`}>
                {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                <span>{ui.back[lang] || ui.back['en']}</span>
              </button>
              <button onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#D5B25D] hover:bg-[#E1BF67] text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#D5B25D]/20 text-base">
                <Calculator size={18} />
                {t("calculator.calculate")}
              </button>
            </div>
          </div>
        )}

        {/* ── Calculating Loader ── */}
        {calculating && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-300">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-[#D5B25D]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#D5B25D] animate-spin" />
              <div className="absolute inset-4 rounded-full bg-[#D5B25D]/10 flex items-center justify-center">
                <Calculator size={28} className="text-[#D5B25D] animate-pulse" />
              </div>
            </div>
            <p className="text-[#D5B25D] font-bold text-xl">{t("calculator.calculating")}</p>
            <p className={`text-sm mt-2 ${textMut}`}>{ui.processing[lang] || ui.processing['en']}</p>
            {/* Animated dots */}
            <div className="flex gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#D5B25D]"
                  style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && result && !calculating && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

            <CalculatorResultView result={result} isLightMode={isLightMode} />

            {/* Print Report — jumps to the saved report's page */}
            {lastReportId && (
              <Link
                href={`/admin/cost-reports/${lastReportId}`}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-[#D5B25D] bg-[#D5B25D]/10 hover:bg-[#D5B25D]/20 text-[#D5B25D] font-bold text-base transition-all duration-300"
              >
                <Printer size={18} />
                {t("costReports.printBtn")}
              </Link>
            )}

            {/* Note */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <p className="text-amber-500 font-bold text-sm mb-1">⚠ {t("calculator.note")}</p>
              <p className={`text-xs leading-relaxed ${isLightMode ? 'text-amber-700/70' : 'text-amber-300/60'}`}>{t("calculator.noteText")}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#D5B25D] hover:bg-[#E1BF67] text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#D5B25D]/20 text-base">
                <Phone size={18} />
                {t("calculator.contact_cta")}
              </Link>
              <button onClick={reset}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 font-bold rounded-xl transition-all duration-300 text-base ${isLightMode ? 'border-slate-200 text-slate-600 hover:border-slate-400' : 'border-white/20 text-white hover:border-white/40'}`}>
                <RotateCcw size={18} />
                {t("calculator.reset")}
              </button>
            </div>

            {/* Back link */}
            <div className="text-center pt-2">
              <Link href="/admin/dashboard" className={`inline-flex items-center gap-2 text-sm transition-colors ${isLightMode ? 'text-slate-400 hover:text-slate-600' : 'text-white/40 hover:text-white/70'}`}>
                <ArrowLeft size={14} className={isRtl ? "rotate-180" : ""} />
                <span>{ui.backToHome[lang] || ui.backToHome['en']}</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* bounce keyframe via style tag */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        .animate-in { animation: fadeSlideIn 0.5s ease-out; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
    </AdminPageLayout>
  );
}
