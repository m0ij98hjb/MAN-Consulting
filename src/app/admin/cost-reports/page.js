"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { COST_TOOL_ROLES } from "@/lib/roleBasedAccess";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { subscribeCostReports } from "@/lib/costReportsRepo";
import { formatDateTime, formatNumber } from "@/lib/formatters";
import {
  FileText, Loader2, ShieldAlert, Search, User, Calendar,
  Building, Hotel, Building2, Factory,
} from "lucide-react";

const CATEGORY_ICONS = {
  residential: Building,
  hotel: Hotel,
  commercial: Building2,
  industrial: Factory,
};

export default function CostReportsPage() {
  const { t, lang, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { loading: roleLoading, isRole } = useRoleAccess();
  const isLightMode = theme === "dark";

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = subscribeCostReports((items) => {
      setReports(items);
      setLoadingReports(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = (r.createdByName || "").toLowerCase();
        const type = (r.type || "").toLowerCase();
        if (!name.includes(q) && !type.includes(q)) return false;
      }
      return true;
    });
  }, [reports, category, search]);

  const categories = ["all", "residential", "hotel", "commercial", "industrial"];

  const fmtCurrency = (n) => `${formatNumber(n, lang)} ${t("calculator.currency")}`;
  const toJsDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : new Date());
  // The 4 real calculation flows return { estimatedCost }; only the legacy
  // fallback flow returns a { min, max, avg } range — see CalculatorResultView.
  const headlineCost = (result) => (result?.avg != null ? result.avg : result?.estimatedCost);

  const cardCls = isLightMode ? "bg-[#ffffff] border border-slate-200 shadow-sm" : "bg-white/5 border border-white/10";
  const textPri = isLightMode ? "text-[#1e293b]" : "text-white";
  const textMut = isLightMode ? "text-slate-400" : "text-white/40";
  // Arbitrary-value class, not the literal `text-slate-500` utility — see
  // CalculatorResultView.js for why (a global override forces that exact
  // class to white app-wide).
  const textSec = isLightMode ? "text-[#64748b]" : "text-white/60";

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
        <div className="flex items-center justify-center min-h-[60vh] px-6" dir={isRTL ? "rtl" : "ltr"}>
          <div className="text-center max-w-md">
            <ShieldAlert size={32} className="text-amber-400 mx-auto mb-3" />
            <p className="text-white font-bold mb-1.5">{t("admin.accessDeniedTitle")}</p>
            <p className="text-white/40 text-sm">{t("admin.accessDeniedDesc")}</p>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8 space-y-6" dir={isRTL ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={`text-xl font-black flex items-center gap-2 ${textPri}`}>
              <FileText size={20} className="text-[#c8a96e]" />
              {t("costReports.title")}
            </h1>
            <p className={`text-sm mt-1 ${textSec}`}>{t("costReports.subtitle")}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${isLightMode ? "bg-slate-100 text-[#64748b]" : "bg-white/5 text-white/50"}`}>
            {filtered.length} {t("costReports.reportsCountLabel")}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 ${textMut}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("costReports.searchPlaceholder")}
              className={`w-full ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"} py-2.5 rounded-xl text-sm outline-none transition-all ${
                isLightMode ? "bg-[#ffffff] border border-slate-200 text-[#1e293b] focus:border-[#D5B25D]" : "bg-white/5 border border-white/10 text-white focus:border-[#D5B25D]/50"
              }`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  category === c
                    ? "bg-[#D5B25D] text-black"
                    : isLightMode ? "bg-slate-100 text-[#64748b] hover:bg-slate-200" : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {c === "all" ? t("costReports.allCategories") : t(`calculator.${c}`)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loadingReports ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-[#c8a96e]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className={`${cardCls} rounded-2xl py-20 text-center`}>
            <FileText size={28} className={`mx-auto mb-2 ${textMut}`} />
            <p className={textSec}>{t("costReports.noReportsYet")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => {
              const Icon = CATEGORY_ICONS[r.category] || FileText;
              const cost = headlineCost(r.result);
              return (
                <Link
                  key={r.id}
                  href={`/admin/cost-reports/${r.id}`}
                  className={`${cardCls} rounded-2xl p-5 text-start hover:border-[#D5B25D]/40 transition-all duration-200 space-y-3 block`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-[#D5B25D] uppercase tracking-wide">
                      <Icon size={14} />
                      {t(`calculator.${r.type}`) !== r.type ? t(`calculator.${r.type}`) : t(`calculator.${r.category}`)}
                    </span>
                    {cost != null && (
                      <span className={`text-xs font-bold ${textPri}`}>{fmtCurrency(cost)}</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${textSec}`}>
                    <User size={12} />
                    <span className="truncate">{r.createdByName || "—"}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${textMut}`}>
                    <Calendar size={12} />
                    <span dir="ltr">{formatDateTime(toJsDate(r.createdAt), lang, { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </AdminPageLayout>
  );
}
