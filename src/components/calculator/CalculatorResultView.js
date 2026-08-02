"use client";

import { TrendingUp, Clock, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { numberToArabicWords } from "@/lib/numberToArabicWords";

const breakdownKeys = ["structure", "finishing", "mep", "external", "contingency"];
const breakdownColors = ["#D5B25D", "#60a5fa", "#34d399", "#f472b6", "#f59e0b"];

// Renders a calculation result exactly as it appears on the calculator's
// step-3 screen. Shared between the live calculator (fresh result) and the
// saved report detail page (historical result) so both stay pixel-identical
// — this is the single source of truth for "what a result looks like".
export default function CalculatorResultView({ result, isLightMode }) {
  const { t, lang } = useLanguage();

  if (!result) return null;

  const fmt = (n) => {
    const locale = lang === "ar" || lang === "ur" ? "ar-SA" : "en-US";
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);
  };
  const sqm = lang === "ar" || lang === "ur" ? "م²" : "m²";

  // bg-[#ffffff], not the bare `bg-white` utility — same reasoning as textSec below.
  const cardCls = isLightMode ? "bg-[#ffffff] border border-slate-200 shadow-sm" : "bg-white/5 border border-white/10";
  const textPri = isLightMode ? "text-[#1e293b]" : "text-white";
  const textMut = isLightMode ? "text-slate-400" : "text-white/40";
  // Arbitrary-value class (not the literal `text-slate-500` utility) — globals.css
  // has a blunt `.text-slate-500 { color: var(--foreground) !important; }` rule
  // that forces that exact class to white app-wide, which made this text
  // invisible on the white report card. Same hex, different class name.
  const textSec = isLightMode ? "text-[#64748b]" : "text-white/60";

  const qualityOptions = [
    { key: "economic", label: t("calculator.economic") },
    { key: "standard", label: t("calculator.standard") },
    { key: "premium", label: t("calculator.premium") },
    { key: "ultra", label: t("calculator.ultra") },
  ];
  const industrialQualityOptions = qualityOptions.filter((q) => q.key === "economic" || q.key === "standard");

  const basementAreaLabel = (i) =>
    (t("calculator.engineering.basementAreaTemplate") || "Basement {n} Area").replace("{n}", i + 1);
  const floorAreaLabel = (i) =>
    (t("calculator.engineering.floorAreaTemplate") || "Floor {n} Area").replace("{n}", i + 1);

  const engineeringAreaFields = [
    { key: "basementArea", label: t("calculator.engineering.basementArea") },
    { key: "groundFloorArea", label: t("calculator.engineering.groundFloorArea") },
    { key: "typicalFloorArea", label: t("calculator.engineering.typicalFloorArea") },
    { key: "penthouseArea", label: t("calculator.engineering.penthouseArea") },
    { key: "waterTankArea", label: t("calculator.engineering.waterTankArea") },
    { key: "septicTankArea", label: t("calculator.engineering.septicTankArea") },
  ];

  return (
    <div className="space-y-6">
      {result.kind === "industrial" ? (
        <>
          {/* Estimated Construction Cost — highlighted */}
          <div className="relative bg-gradient-to-br from-[#D5B25D]/20 to-[#B8923A]/10 border-2 border-[#D5B25D] rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(213,178,93,0.2)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#D5B25D] text-black text-[10px] font-black px-3 py-1 rounded-full">{t("calculator.engineering.estimatedCost")}</span>
            </div>
            <p className="text-3xl font-black text-[#D5B25D] mt-2">{fmt(result.estimatedCost)}</p>
            <p className="text-[#D5B25D]/60 text-xs mt-1">{t("calculator.currency")}</p>
            {lang === "ar" && (
              <p className="text-[#D5B25D]/70 text-[11px] mt-2 px-2 leading-relaxed">
                {numberToArabicWords(result.estimatedCost)} {t("calculator.currency")}
              </p>
            )}
          </div>

          {/* Estimated Built-up Area */}
          <div className={`${cardCls} rounded-2xl p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-xl bg-[#D5B25D]/15 border border-[#D5B25D]/30 flex items-center justify-center">
              <TrendingUp size={22} className="text-[#D5B25D]" />
            </div>
            <div>
              <p className={`text-xs ${textMut}`}>{t("calculator.engineering.builtupArea")}</p>
              <p className={`font-black text-lg ${textPri}`}>{fmt(result.weightedArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></p>
            </div>
          </div>

          {/* Project Summary */}
          <div className={`${cardCls} rounded-2xl p-6`}>
            <h3 className={`font-black text-lg mb-5 flex items-center gap-2 ${textPri}`}>
              <Zap size={18} className="text-[#D5B25D]" />
              {t("calculator.engineering.summary")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.industrialCategory")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{t(`calculator.${result.category}`)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.quality")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{industrialQualityOptions.find((q) => q.key === result.quality)?.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.groundFloorArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.groundFloorArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.mezzanineArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.mezzanineArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.firstFloorArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.firstFloorArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
            </div>
          </div>
        </>
      ) : result.kind === "hotel" ? (
        <>
          <div className="relative bg-gradient-to-br from-[#D5B25D]/20 to-[#B8923A]/10 border-2 border-[#D5B25D] rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(213,178,93,0.2)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#D5B25D] text-black text-[10px] font-black px-3 py-1 rounded-full">{t("calculator.engineering.estimatedCost")}</span>
            </div>
            <p className="text-3xl font-black text-[#D5B25D] mt-2">{fmt(result.estimatedCost)}</p>
            <p className="text-[#D5B25D]/60 text-xs mt-1">{t("calculator.currency")}</p>
            {lang === "ar" && (
              <p className="text-[#D5B25D]/70 text-[11px] mt-2 px-2 leading-relaxed">
                {numberToArabicWords(result.estimatedCost)} {t("calculator.currency")}
              </p>
            )}
          </div>

          <div className={`${cardCls} rounded-2xl p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-xl bg-[#D5B25D]/15 border border-[#D5B25D]/30 flex items-center justify-center">
              <TrendingUp size={22} className="text-[#D5B25D]" />
            </div>
            <div>
              <p className={`text-xs ${textMut}`}>{t("calculator.engineering.builtupArea")}</p>
              <p className={`font-black text-lg ${textPri}`}>{fmt(result.weightedArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></p>
            </div>
          </div>

          <div className={`${cardCls} rounded-2xl p-6`}>
            <h3 className={`font-black text-lg mb-5 flex items-center gap-2 ${textPri}`}>
              <Zap size={18} className="text-[#D5B25D]" />
              {t("calculator.engineering.summary")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.hotelRating")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{t(`calculator.hotel_${result.rating}`)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.basementsCount")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.basementsCount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.floorsCount")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.floorsCount)}</span>
              </div>
              {result.areas.basementAreas.map((area, i) => (
                <div key={`b-${i}`} className="flex items-center justify-between">
                  <span className={`text-sm ${textSec}`}>{basementAreaLabel(i)}</span>
                  <span className={`font-bold text-sm ${textPri}`}>{fmt(area)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.groundFloorArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.groundFloorArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.mezzanineArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.mezzanineArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
              {result.areas.floorAreas.map((area, i) => (
                <div key={`f-${i}`} className="flex items-center justify-between">
                  <span className={`text-sm ${textSec}`}>{floorAreaLabel(i)}</span>
                  <span className={`font-bold text-sm ${textPri}`}>{fmt(area)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.penthouseArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.penthouseArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
            </div>
          </div>
        </>
      ) : result.kind === "commercial" ? (
        <>
          <div className="relative bg-gradient-to-br from-[#D5B25D]/20 to-[#B8923A]/10 border-2 border-[#D5B25D] rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(213,178,93,0.2)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#D5B25D] text-black text-[10px] font-black px-3 py-1 rounded-full">{t("calculator.engineering.estimatedCost")}</span>
            </div>
            <p className="text-3xl font-black text-[#D5B25D] mt-2">{fmt(result.estimatedCost)}</p>
            <p className="text-[#D5B25D]/60 text-xs mt-1">{t("calculator.currency")}</p>
            {lang === "ar" && (
              <p className="text-[#D5B25D]/70 text-[11px] mt-2 px-2 leading-relaxed">
                {numberToArabicWords(result.estimatedCost)} {t("calculator.currency")}
              </p>
            )}
          </div>

          <div className={`${cardCls} rounded-2xl p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-xl bg-[#D5B25D]/15 border border-[#D5B25D]/30 flex items-center justify-center">
              <TrendingUp size={22} className="text-[#D5B25D]" />
            </div>
            <div>
              <p className={`text-xs ${textMut}`}>{t("calculator.engineering.builtupArea")}</p>
              <p className={`font-black text-lg ${textPri}`}>{fmt(result.weightedArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></p>
            </div>
          </div>

          <div className={`${cardCls} rounded-2xl p-6`}>
            <h3 className={`font-black text-lg mb-5 flex items-center gap-2 ${textPri}`}>
              <Zap size={18} className="text-[#D5B25D]" />
              {t("calculator.engineering.summary")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.commercialCategory")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{t(`calculator.${result.category}`)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.quality")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{qualityOptions.find((q) => q.key === result.quality)?.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.basementsCount")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.basementsCount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.floorsCount")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.floorsCount)}</span>
              </div>
              {result.areas.basementAreas.map((area, i) => (
                <div key={`b-${i}`} className="flex items-center justify-between">
                  <span className={`text-sm ${textSec}`}>{basementAreaLabel(i)}</span>
                  <span className={`font-bold text-sm ${textPri}`}>{fmt(area)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.groundFloorArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.groundFloorArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.mezzanineArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.mezzanineArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
              {result.areas.floorAreas.map((area, i) => (
                <div key={`f-${i}`} className="flex items-center justify-between">
                  <span className={`text-sm ${textSec}`}>{floorAreaLabel(i)}</span>
                  <span className={`font-bold text-sm ${textPri}`}>{fmt(area)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.penthouseArea")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas.penthouseArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
              </div>
            </div>
          </div>
        </>
      ) : result.kind === "engineering" ? (
        <>
          <div className="relative bg-gradient-to-br from-[#D5B25D]/20 to-[#B8923A]/10 border-2 border-[#D5B25D] rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(213,178,93,0.2)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#D5B25D] text-black text-[10px] font-black px-3 py-1 rounded-full">{t("calculator.engineering.estimatedCost")}</span>
            </div>
            <p className="text-3xl font-black text-[#D5B25D] mt-2">{fmt(result.estimatedCost)}</p>
            <p className="text-[#D5B25D]/60 text-xs mt-1">{t("calculator.currency")}</p>
            {lang === "ar" && (
              <p className="text-[#D5B25D]/70 text-[11px] mt-2 px-2 leading-relaxed">
                {numberToArabicWords(result.estimatedCost)} {t("calculator.currency")}
              </p>
            )}
          </div>

          <div className={`${cardCls} rounded-2xl p-5 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-xl bg-[#D5B25D]/15 border border-[#D5B25D]/30 flex items-center justify-center">
              <TrendingUp size={22} className="text-[#D5B25D]" />
            </div>
            <div>
              <p className={`text-xs ${textMut}`}>{t("calculator.engineering.builtupArea")}</p>
              <p className={`font-black text-lg ${textPri}`}>{fmt(result.weightedArea)} <span className={`text-xs ${textMut}`}>{sqm}</span></p>
            </div>
          </div>

          <div className={`${cardCls} rounded-2xl p-6`}>
            <h3 className={`font-black text-lg mb-5 flex items-center gap-2 ${textPri}`}>
              <Zap size={18} className="text-[#D5B25D]" />
              {t("calculator.engineering.summary")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.buildingType")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{t(`calculator.${result.buildingType}`)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.quality")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{qualityOptions.find((q) => q.key === result.quality)?.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.floorsCount")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.floorsCount)}</span>
              </div>
              {engineeringAreaFields.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className={`text-sm ${textSec}`}>{label}</span>
                  <span className={`font-bold text-sm ${textPri}`}>{fmt(result.areas[key])} <span className={`text-xs ${textMut}`}>{sqm}</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textSec}`}>{t("calculator.engineering.fenceLength")}</span>
                <span className={`font-bold text-sm ${textPri}`}>{fmt(result.fenceLength)} <span className={`text-xs ${textMut}`}>{lang === "ar" || lang === "ur" ? "م.ط" : "lm"}</span></span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Main Cost Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`${cardCls} rounded-2xl p-6 text-center`}>
              <p className={`text-xs font-semibold mb-2 ${textMut}`}>{t("calculator.min_cost")}</p>
              <p className={`text-2xl font-black ${textPri}`}>{fmt(result.min)}</p>
              <p className={`text-xs mt-1 ${textMut}`}>{t("calculator.currency")}</p>
            </div>
            <div className="relative bg-gradient-to-br from-[#D5B25D]/20 to-[#B8923A]/10 border-2 border-[#D5B25D] rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(213,178,93,0.2)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#D5B25D] text-black text-[10px] font-black px-3 py-1 rounded-full">{t("calculator.avg_cost")}</span>
              </div>
              <p className="text-3xl font-black text-[#D5B25D] mt-2">{fmt(result.avg)}</p>
              <p className="text-[#D5B25D]/60 text-xs mt-1">{t("calculator.currency")}</p>
              {lang === "ar" && (
                <p className="text-[#D5B25D]/70 text-[11px] mt-2 px-2 leading-relaxed">
                  {numberToArabicWords(result.avg)} {t("calculator.currency")}
                </p>
              )}
            </div>
            <div className={`${cardCls} rounded-2xl p-6 text-center`}>
              <p className={`text-xs font-semibold mb-2 ${textMut}`}>{t("calculator.max_cost")}</p>
              <p className={`text-2xl font-black ${textPri}`}>{fmt(result.max)}</p>
              <p className={`text-xs mt-1 ${textMut}`}>{t("calculator.currency")}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`${cardCls} rounded-2xl p-5 flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-[#D5B25D]/15 border border-[#D5B25D]/30 flex items-center justify-center">
                <TrendingUp size={22} className="text-[#D5B25D]" />
              </div>
              <div>
                <p className={`text-xs ${textMut}`}>{t("calculator.cost_per_sqm")}</p>
                <p className={`font-black text-lg ${textPri}`}>{fmt(result.costPerSqm)} <span className={`text-xs ${textMut}`}>{t("calculator.currency")}</span></p>
              </div>
            </div>
            <div className={`${cardCls} rounded-2xl p-5 flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <Clock size={22} className="text-blue-400" />
              </div>
              <div>
                <p className={`text-xs ${textMut}`}>{t("calculator.timeline")}</p>
                <p className={`font-black text-lg ${textPri}`}>{fmt(result.timeline)} <span className={`text-xs ${textMut}`}>{t("calculator.months")}</span></p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className={`${cardCls} rounded-2xl p-6`}>
            <h3 className={`font-black text-lg mb-5 flex items-center gap-2 ${textPri}`}>
              <Zap size={18} className="text-[#D5B25D]" />
              {t("calculator.breakdown")}
            </h3>
            <div className="space-y-4">
              {breakdownKeys.map((key, i) => {
                const value = result.breakdown[key];
                const pct = Math.round((value / result.avg) * 100);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm ${textSec}`}>{t(`calculator.${key}`)}</span>
                      <span className={`font-bold text-sm ${textPri}`}>{fmt(value)} <span className={`text-xs ${textMut}`}>{t("calculator.currency")}</span></span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isLightMode ? "bg-slate-100" : "bg-white/5"}`}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: breakdownColors[i] }} />
                    </div>
                  </div>
                );
              })}
              {result.breakdown.extras > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm ${textSec}`}>{t("calculator.extras")}</span>
                    <span className={`font-bold text-sm ${textPri}`}>{fmt(result.breakdown.extras)} <span className={`text-xs ${textMut}`}>{t("calculator.currency")}</span></span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isLightMode ? "bg-slate-100" : "bg-white/5"}`}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round((result.breakdown.extras / result.avg) * 100)}%`, background: "#e879f9" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Engineering Insights */}
          {result.insights?.length > 0 && (
            <div className="bg-gradient-to-br from-[#D5B25D]/10 to-transparent border border-[#D5B25D]/20 rounded-2xl p-6">
              <h3 className="text-[#D5B25D] font-black text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={18} />
                {t("calculator.aiInsights")}
              </h3>
              <div className="space-y-3">
                {result.insights.map((insight, i) => (
                  <div key={i} className={`flex gap-3 text-sm leading-relaxed ${textSec}`}>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
