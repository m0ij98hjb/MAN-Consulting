"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { COST_TOOL_ROLES } from "@/lib/roleBasedAccess";
import { useLanguage } from "@/context/LanguageContext";
import { getCostReportById } from "@/lib/costReportsRepo";
import { formatDateTime } from "@/lib/formatters";
import CalculatorResultView from "@/components/calculator/CalculatorResultView";
import { COMPANY } from "@/config/company";
import {
  Loader2, ShieldAlert, Printer, ArrowLeft, ArrowRight,
  User, Calendar, FileText, Layers,
} from "lucide-react";

export default function CostReportDetailPage() {
  const { id } = useParams();
  const { t, lang, isRTL } = useLanguage();
  const { loading: roleLoading, isRole } = useRoleAccess();

  const [report, setReport] = useState(undefined); // undefined = loading, null = not found
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    let active = true;
    getCostReportById(id).then((r) => { if (active) setReport(r); });
    return () => { active = false; };
  }, [id]);

  const toJsDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : new Date());

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
      <div className="p-6 lg:p-8 print:p-0" dir={isRTL ? "rtl" : "ltr"}>

        {report === undefined ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 size={26} className="animate-spin text-[#c8a96e]" />
          </div>
        ) : report === null ? (
          <div className="text-center py-24">
            <FileText size={28} className="mx-auto mb-2 text-white/20" />
            <p className="text-white/50">{t("costReports.noReportsYet")}</p>
            <Link href="/admin/cost-reports" className="inline-flex items-center gap-2 mt-4 text-sm text-[#c8a96e] hover:underline">
              <BackIcon size={14} />
              {t("costReports.backToList")}
            </Link>
          </div>
        ) : (
          <>
            {/* On-screen action bar */}
            <div className="flex items-center justify-between mb-6 print:hidden">
              <Link href="/admin/cost-reports" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                <BackIcon size={16} />
                {t("costReports.backToList")}
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D5B25D] hover:bg-[#E1BF67] text-black font-bold text-sm transition-all"
              >
                <Printer size={16} />
                {t("costReports.printBtn")}
              </button>
            </div>

            {/* Printable document card — bg-[#ffffff] (not the bare `bg-white`
                utility) so a global `.dark .bg-white { background-color:
                var(--card-bg) !important }` override in globals.css can't
                ever shift this off pure white depending on the site theme. */}
            <div className="bg-[#ffffff] text-[#1e293b] rounded-2xl p-6 sm:p-10 max-w-3xl mx-auto print:rounded-none print:p-0 print:max-w-none print:mx-0 space-y-6">

              {/* Print-only branded header — company logo top-right (leading edge in RTL) */}
              <div className="hidden print:flex items-start justify-between border-b-2 border-[#D5B25D] pb-4 mb-2">
                <div className="flex flex-col items-end gap-1.5">
                  <Image
                    src="/asstes/ph dashborad.png"
                    alt={COMPANY.name}
                    width={300}
                    height={200}
                    className="h-16 w-auto object-contain"
                    priority
                  />
                  <p className="text-[11px] text-[#64748b]">{COMPANY.email}</p>
                </div>
                <div className="text-start">
                  <p className="font-bold text-[#D5B25D]">{t("costReports.detailsTitle")}</p>
                  <p className="text-xs text-[#64748b]" dir="ltr">
                    {t("costReports.generatedOnLabel")}: {formatDateTime(new Date(), lang, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>

              {/* Screen-only title */}
              <h1 className="text-lg font-black flex items-center gap-2 print:hidden">
                <FileText size={20} className="text-[#D5B25D]" />
                {t("costReports.detailsTitle")}
              </h1>

              {/* Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-200 rounded-xl p-4 print:border-slate-300">
                <div>
                  <p className="text-slate-400 mb-1 flex items-center gap-1"><User size={11} />{t("costReports.createdByLabel")}</p>
                  <p className="font-bold">{report.createdByName || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1 flex items-center gap-1"><Calendar size={11} />{t("costReports.dateLabel")}</p>
                  <p className="font-bold" dir="ltr">{formatDateTime(toJsDate(report.createdAt), lang, { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1 flex items-center gap-1"><Layers size={11} />{t("calculator.projectType")}</p>
                  <p className="font-bold">{t(`calculator.${report.type}`)}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">{t("calculator.quality")}</p>
                  <p className="font-bold">{t(`calculator.${report.quality}`)}</p>
                </div>
              </div>

              {/* Full result — identical to the calculator's step-3 screen */}
              <CalculatorResultView result={report.result} isLightMode={true} />
            </div>
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}
