"use client";

import { useState, useRef, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  Award, TrendingUp, Users, Building2,
  MapPin, Clock, Upload, Send, CheckCircle2,
  Briefcase, ChevronDown, FileText, ArrowDown, GraduationCap,
  HardHat,
} from "lucide-react";
import { DEPARTMENTS, TRADES } from "@/lib/recruitmentConfig";
import { uploadAsset } from "@/lib/cloudinary";

const BENEFIT_ICONS = [Award, TrendingUp, Users, Building2];

/* ── Firestore-driven job listings (siteContent/jobs → { listings: [...] }) ──
   type: 'full' | 'part' | 'training' | 'supervision' | 'trades'
   visible !== false is treated as published (missing flag defaults to visible). */
const TYPE_BADGE_KEYS = {
  full: "careers.fullTime",
  part: "careers.partTimeLabel",
  training: "careers.trainingLabel",
  supervision: "careers.supervisionLabel",
  trades: "careers.tradesLabel",
};

async function uploadToCloudinary(file) {
  const { url } = await uploadAsset(file, {
    resourceType: "auto",
    preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  });
  return url;
}

function JobCard({ job, lang, isRTL, t, onApply, delay = 0 }) {
  const title = job[`title_${lang}`] || job.title_en || job.title_ar || "";
  const desc  = job[`desc_${lang}`]  || job.desc_en  || job.desc_ar  || "";
  const typeLabel = t(TYPE_BADGE_KEYS[job.type] || "careers.fullTime");
  const location  = job.location || t("careers.jeddah");
  return (
    <div className="group relative bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:border-[#D4A843]/30 hover:bg-[#D4A843]/4 transition-all duration-400 flex flex-col gap-4 overflow-hidden" data-aos="fade-up" data-aos-delay={delay}>
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4A843]/0 to-transparent group-hover:via-[#D4A843]/50 transition-all duration-500" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4A843]/12 text-[#D4A843] text-[10px] font-black uppercase tracking-widest mb-2.5 border border-[#D4A843]/20">{typeLabel}</span>
          <h3 className="text-white font-black text-xl leading-tight">{title}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#D4A843]/8 border border-[#D4A843]/15 flex items-center justify-center text-[#D4A843] flex-shrink-0 group-hover:scale-110 group-hover:bg-[#D4A843]/15 transition-all duration-300">
          <Briefcase size={19} />
        </div>
      </div>
      <p className="text-white/55 text-sm leading-relaxed flex-1">{desc}</p>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className={`flex items-center gap-4 text-white/35 text-xs ${isRTL ? "flex-row" : ""}`}>
          <span className="flex items-center gap-1.5"><MapPin size={11} />{location}</span>
          <span className="flex items-center gap-1.5"><Clock size={11} />{typeLabel}</span>
        </div>
        <button onClick={() => onApply(job)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A843] to-[#D4A843] text-black font-black text-xs hover:shadow-lg hover:shadow-[#D4A843]/25 hover:-translate-y-0.5 transition-all duration-300 active:scale-95">
          {t("careers.applyNow")}
        </button>
      </div>
    </div>
  );
}

function EmptyJobsState({ t }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-14 px-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.015]" data-aos="fade-up">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center text-white/20">
        <Briefcase size={20} />
      </div>
      <p className="text-white/30 text-sm text-center">{t("careers.emptyStateMessage")}</p>
    </div>
  );
}

export default function CareersPage() {
  const { t, lang, isRTL } = useLanguage();

  /* ── Firestore job listings ── */
  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "siteContent", "jobs"), (snap) => {
      setJobs(snap.exists() ? (snap.data().listings || []) : []);
    }, (err) => {
      console.error("Failed to load job listings:", err);
    });
    return unsub;
  }, []);
  const published = jobs.filter((j) => j.visible !== false);
  const availableJobs   = published.filter((j) => j.type === "full" || j.type === "part");
  const trainingJobs    = published.filter((j) => j.type === "training");
  const supervisionJobs = published.filter((j) => j.type === "supervision");
  const tradesJobs      = published.filter((j) => j.type === "trades");
  const hasAnyPublishedJob = published.length > 0;

  /* ── Apply Now from a Firestore job card ── */
  const [jobCardMode, setJobCardMode] = useState(false);

  /* ── Personal Info ── */
  const [fullName, setFullName]       = useState("");
  const [phone, setPhone]             = useState("");
  const [email, setEmail]             = useState("");
  const [city, setCity]               = useState("");
  const [nationality, setNationality] = useState("");
  const [country, setCountry]         = useState("");

  /* ── Job Selection ── */
  const [jobType, setJobType]         = useState("");
  const [department, setDepartment]   = useState("");
  const [position, setPosition]       = useState("");
  const [trade, setTrade]             = useState("");

  /* ── Other form fields ── */
  const [experience, setExperience]   = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile]           = useState(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [website, setWebsite]         = useState(""); // honeypot — must stay empty; real visitors never see/fill this

  /* ── Submission state ── */
  const [submitted, setSubmitted]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  const formRef         = useRef(null);
  const positionsRef    = useRef(null);
  const trainingRef     = useRef(null);
  const availPosRef     = useRef(null);

  const benefits           = t("careers.benefits");
  const expOptions         = t("careers.expOptions");

  /* ─── Derived options from recruitmentConfig ─── */
  const departmentOptions = Object.entries(DEPARTMENTS).map(([key, val]) => ({
    key,
    label: val[lang] || val.en,
  }));

  const positionOptions = department && DEPARTMENTS[department]
    ? Object.values(DEPARTMENTS[department].positions).map(p =>
        p[lang] || p.en
      )
    : [];

  const tradeOptions = Object.entries(TRADES).map(([key, val]) => ({
    key,
    label: val[lang] || val.en,
  }));

  /* ── handleApplyFromJob — Apply Now from any Firestore-driven job card.
     Works for any job created from the dashboard automatically: the card's
     own title/type are used directly, no per-job code changes needed. ── */
  const handleApplyFromJob = (job) => {
    const title = job[`title_${lang}`] || job.title_en || job.title_ar || "";
    setJobCardMode(true);
    setJobType(job.type || "full");
    setDepartment(""); setPosition(title); setTrade("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0]; if (file) setCvFile(file);
  };

  const resolvedPosition = jobCardMode
    ? position
    : jobType === "formal"
      ? position
      : trade ? (TRADES[trade]?.[lang] || TRADES[trade]?.en) ?? trade : "";

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setSubmitError("");
    try {
      let cvUrl = "";
      if (cvFile) cvUrl = await uploadToCloudinary(cvFile);
      const deptLabel = department && DEPARTMENTS[department]
        ? (DEPARTMENTS[department][lang] || DEPARTMENTS[department].en) : "";
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, phone, email, city, nationality, country,
          jobType, department: deptLabel,
          position: resolvedPosition, experience, coverLetter, cvUrl,
          website, // honeypot
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || "Error. Please try again.");
      setSubmitted(true);
      window.scrollTo({ top: formRef.current?.offsetTop - 100, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err?.message || "Error. Please try again.");
    } finally { setSubmitting(false); }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName(""); setPhone(""); setEmail(""); setCity("");
    setNationality(""); setCountry("");
    setJobCardMode(false);
    setJobType(""); setDepartment(""); setPosition(""); setTrade("");
    setExperience(""); setCoverLetter(""); setCvFile(null); setWebsite(""); setSubmitError("");
  };

  const selectCls = `w-full bg-black/40 border border-white/10 rounded-xl py-3.5 text-sm text-white focus:border-[#D4A843]/60 outline-none transition-all duration-300 appearance-none cursor-pointer ${isRTL ? "pe-4 ps-10" : "ps-4 pe-10"}`;
  const inputCls  = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:border-[#D4A843]/60 focus:bg-black/60 outline-none transition-all duration-300";
  const labelCls  = "text-[#D4A843] text-[11px] font-black uppercase tracking-widest block";

  return (
    <main className="min-h-screen bg-[var(--background)] text-white font-cairo">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="image-hero relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asstes/shorkaa.webp"
            alt="MAN Careers" fill className="object-contain object-center" priority
            fetchPriority="high" sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-[#070d1a]/97" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center max-w-5xl pt-32 pb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 text-[#D4A843] text-xs font-bold uppercase tracking-[3px] mb-8" data-aos="fade-down">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843] animate-pulse" />
            {t("careers.heroBadge")}
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] mb-6" data-aos="fade-up" data-aos-delay="100">
            {t("careers.heroTitle")}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A843] via-[#E8D08A] to-[#D4A843]">
              {t("careers.heroSubtitle")}
            </span>
          </h1>
          <p className="text-white/65 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12" data-aos="fade-up" data-aos-delay="200">
            {t("careers.heroDesc")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center" data-aos="fade-up" data-aos-delay="300">
            <button onClick={() => availPosRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="group px-8 py-4 rounded-xl bg-[#D4A843] text-black font-black text-sm hover:bg-[#D4A843] transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-[#D4A843]/30 flex items-center gap-2">
              {t("careers.exploreBtn")}
              <ArrowDown size={15} className="group-hover:translate-y-1 transition-transform duration-300" />
            </button>
            <button onClick={() => trainingRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-xl border border-[#D4A843]/40 text-[#D4A843] font-black text-sm hover:bg-[#D4A843]/10 hover:border-[#D4A843]/70 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2">
              <GraduationCap size={15} />
              {t("careers.trainingBadge")}
            </button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-[#D4A843] to-transparent" />
        </div>
      </section>

      {/* ===== WHY JOIN US ===== */}
      <section className="py-28 bg-[var(--card-bg)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D4A843 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="text-[#D4A843] text-xs font-bold uppercase tracking-[3px] mb-3 block">{t("careers.whyBadge")}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">{t("careers.whyTitle")}</h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">{t("careers.whySubtitle")}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4A843] to-[#D4A843] mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(benefits) && benefits.map((benefit, i) => {
              const Icon = BENEFIT_ICONS[i];
              return (
                <div key={i} className="group relative bg-white/[0.03] border border-white/8 rounded-2xl p-7 hover:border-[#D4A843]/35 hover:bg-[#D4A843]/5 transition-all duration-500 overflow-hidden" data-aos="fade-up" data-aos-delay={i * 80}>
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-[#D4A843]/5 group-hover:bg-[#D4A843]/12 transition-all duration-500 blur-xl" />
                  <div className="w-12 h-12 rounded-xl bg-[#D4A843]/12 border border-[#D4A843]/20 flex items-center justify-center text-[#D4A843] mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-white font-black text-base mb-2.5">{benefit.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== OPEN POSITIONS ===== */}
      <section ref={el => { positionsRef.current = el; availPosRef.current = el; }} className="py-28 bg-[var(--background)] relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="text-[#D4A843] text-xs font-bold uppercase tracking-[3px] mb-3 block">{t("careers.positionsBadge")}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">{t("careers.positionsTitle")}</h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">{t("careers.positionsSubtitle")}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4A843] to-[#D4A843] mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {availableJobs.length === 0 ? (
              <EmptyJobsState t={t} />
            ) : (
              availableJobs.map((job, i) => (
                <JobCard key={job.id} job={job} lang={lang} isRTL={isRTL} t={t} onApply={handleApplyFromJob} delay={i * 60} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== TRAINING SECTION ===== */}
      <section ref={trainingRef} className="py-28 bg-[var(--card-bg)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D4A843 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4A843]/30 to-transparent" />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-flex items-center gap-2 text-[#D4A843] text-xs font-bold uppercase tracking-[3px] mb-3">
              <GraduationCap size={14} />{t("careers.trainingBadge")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">{t("careers.trainingTitle")}</h2>
            <p className="text-white/50 text-base max-w-2xl mx-auto">{t("careers.trainingDesc")}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4A843] to-[#D4A843] mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainingJobs.length === 0 ? (
              <EmptyJobsState t={t} />
            ) : (
              trainingJobs.map((job, i) => (
                <JobCard key={job.id} job={job} lang={lang} isRTL={isRTL} t={t} onApply={handleApplyFromJob} delay={i * 100} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== SUPERVISION & MANAGEMENT JOBS ===== */}
      <section className="py-28 bg-[var(--background)] relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="text-[#D4A843] text-xs font-bold uppercase tracking-[3px] mb-3 block">{t("careers.supervisionSectionBadge")}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">{t("careers.supervisionSectionTitle")}</h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">{t("careers.supervisionSectionDesc")}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4A843] to-[#D4A843] mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {supervisionJobs.length === 0 ? (
              <EmptyJobsState t={t} />
            ) : (
              supervisionJobs.map((job, i) => (
                <JobCard key={job.id} job={job} lang={lang} isRTL={isRTL} t={t} onApply={handleApplyFromJob} delay={i * 60} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== TRADES JOBS ===== */}
      <section className="py-28 bg-[var(--card-bg)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D4A843 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4A843]/30 to-transparent" />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <span className="inline-flex items-center gap-2 text-[#D4A843] text-xs font-bold uppercase tracking-[3px] mb-3">
              <HardHat size={14} />{t("careers.tradesSectionBadge")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">{t("careers.tradesSectionTitle")}</h2>
            <p className="text-white/50 text-base max-w-2xl mx-auto">{t("careers.tradesSectionDesc")}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4A843] to-[#D4A843] mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tradesJobs.length === 0 ? (
              <EmptyJobsState t={t} />
            ) : (
              tradesJobs.map((job, i) => (
                <JobCard key={job.id} job={job} lang={lang} isRTL={isRTL} t={t} onApply={handleApplyFromJob} delay={i * 60} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== APPLICATION FORM — hidden while no job is published anywhere on the page ===== */}
      {hasAnyPublishedJob && (
      <section ref={formRef} className="py-28 bg-[var(--card-bg)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #D4A843 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4A843]/30 to-transparent" />

        <div className="container mx-auto px-6 max-w-3xl relative z-10">
          <div className="text-center mb-14" data-aos="fade-up">
            <span className="text-[#D4A843] text-xs font-bold uppercase tracking-[3px] mb-3 block">{t("careers.formBadge")}</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t("careers.formTitle")}</h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">{t("careers.formSubtitle")}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D4A843] to-[#D4A843] mx-auto mt-6 rounded-full" />
          </div>

          {submitted ? (
            <div className="bg-gradient-to-br from-[#D4A843]/10 to-[#D4A843]/5 border border-[#D4A843]/25 rounded-3xl p-14 text-center" data-aos="zoom-in">
              <div className="relative inline-block mb-7">
                <div className="w-24 h-24 rounded-full bg-[#D4A843]/15 border border-[#D4A843]/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={44} className="text-[#D4A843]" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#D4A843]/10 blur-xl animate-pulse" />
              </div>
              <h3 className="text-3xl font-black text-white mb-3">{t("careers.successTitle")}</h3>
              <p className="text-white/60 leading-relaxed max-w-md mx-auto mb-10 text-base">{t("careers.successDesc")}</p>
              <button onClick={handleReset}
                className="px-10 py-4 rounded-xl bg-[#D4A843] text-black font-black text-sm hover:bg-[#D4A843] transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-[#D4A843]/25">
                {t("careers.successBtn")}
              </button>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-8 md:p-10 relative overflow-hidden" data-aos="fade-up">
              <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#D4A843]/6 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#D4A843]/4 rounded-full blur-3xl pointer-events-none" />

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                {/* Honeypot — invisible to real visitors, left in the DOM/tab order out of reach so bots that auto-fill every field trip it. Never surface this in visible validation. */}
                <div
                  style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, pointerEvents: "none" }}
                  aria-hidden="true"
                >
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex="-1"
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {/* Selected job summary banner */}
                {jobCardMode ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#D4A843]/10 to-[#D4A843]/5 border border-[#D4A843]/25">
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <CheckCircle2 size={14} className="text-[#D4A843] flex-shrink-0" />
                      <span className="text-[#D4A843] text-[11px] font-black uppercase tracking-widest">
                        {t("careers.selectedPositionBannerLabel")}
                      </span>
                    </div>
                    <p className="text-white/35 text-[10px] uppercase tracking-wider mb-1">
                      {t("careers.positionShort")}
                    </p>
                    <p className="text-white font-bold text-sm">{position}</p>
                  </div>
                ) : jobType && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#D4A843]/10 to-[#D4A843]/5 border border-[#D4A843]/25">
                    <div className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <CheckCircle2 size={14} className="text-[#D4A843] flex-shrink-0" />
                      <span className="text-[#D4A843] text-[11px] font-black uppercase tracking-widest">
                        {t("careers.selectedPositionBannerLabel")}
                      </span>
                    </div>
                    <div className={`grid grid-cols-2 gap-4 ${isRTL ? "text-right" : "text-left"}`}>
                      <div>
                        <p className="text-white/35 text-[10px] uppercase tracking-wider mb-1">
                          {t("careers.jobType")}
                        </p>
                        <p className="text-white font-bold text-sm">
                          {jobType === "formal"
                            ? t("careers.formalStaffTab")
                            : t("careers.skilledWorkersTab")}
                        </p>
                      </div>
                      {(department || trade || position) && (
                        <div>
                          <p className="text-white/35 text-[10px] uppercase tracking-wider mb-1">
                            {t("careers.positionShort")}
                          </p>
                          <p className="text-white font-bold text-sm">
                            {department
                              ? (departmentOptions.find(o => o.key === department)?.label ?? department)
                              : trade
                                ? (tradeOptions.find(o => o.key === trade)?.label ?? trade)
                                : position}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Name + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.fullName")}</label>
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder={t("careers.namePlaceholder")} className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.phone")}</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder={t("careers.phonePlaceholder")} className={inputCls} />
                  </div>
                </div>

                {/* Email + City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.email")}</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t("careers.emailPlaceholder")} className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.city")}</label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)}
                      placeholder={t("careers.cityPlaceholder")} className={inputCls} />
                  </div>
                </div>

                {/* Nationality + Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.nationality")}</label>
                    <input type="text" required value={nationality} onChange={e => setNationality(e.target.value)}
                      placeholder={t("careers.nationalityPlaceholder")} className={inputCls} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.country")}</label>
                    <input type="text" required value={country} onChange={e => setCountry(e.target.value)}
                      placeholder={t("careers.countryPlaceholder")} className={inputCls} />
                  </div>
                </div>

                {/* Job Type — hidden once a specific job card has been selected */}
                {!jobCardMode && (
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.jobType")}</label>
                    <div className="relative">
                      <select required value={jobType}
                        onChange={e => { setJobType(e.target.value); setDepartment(""); setPosition(""); setTrade(""); }}
                        className={selectCls}>
                        <option value="" className="bg-[#111]">{t("careers.chooseJobType")}</option>
                        <option value="formal"  className="bg-[#111]">{t("careers.formalStaffTab")}</option>
                        <option value="skilled" className="bg-[#111]">{t("careers.skilledWorkersTab")}</option>
                      </select>
                      <ChevronDown size={14} className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none`} />
                    </div>
                  </div>
                )}

                {/* Department (formal) */}
                {jobType === "formal" && (
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.department")}</label>
                    <div className="relative">
                      <select required value={department}
                        onChange={e => { setDepartment(e.target.value); setPosition(""); }}
                        className={selectCls}>
                        <option value="" className="bg-[#111]">{t("careers.chooseDepartment")}</option>
                        {departmentOptions.map(opt => (
                          <option key={opt.key} value={opt.key} className="bg-[#111]">{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none`} />
                    </div>
                  </div>
                )}

                {/* Position (formal + dept selected) */}
                {jobType === "formal" && department && (
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.position")}</label>
                    <div className="relative">
                      <select required value={position} onChange={e => setPosition(e.target.value)} className={selectCls}>
                        <option value="" className="bg-[#111]">{t("careers.choosePosition")}</option>
                        {positionOptions.map((opt, i) => (
                          <option key={i} value={opt} className="bg-[#111]">{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none`} />
                    </div>
                  </div>
                )}

                {/* Trade (skilled) */}
                {jobType === "skilled" && (
                  <div className="space-y-2">
                    <label className={labelCls}>{t("careers.trade")}</label>
                    <div className="relative">
                      <select required value={trade} onChange={e => setTrade(e.target.value)} className={selectCls}>
                        <option value="" className="bg-[#111]">{t("careers.chooseTrade")}</option>
                        {tradeOptions.map(opt => (
                          <option key={opt.key} value={opt.key} className="bg-[#111]">{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none`} />
                    </div>
                  </div>
                )}

                {/* Experience */}
                <div className="space-y-2">
                  <label className={labelCls}>{t("careers.experience")}</label>
                  <div className="relative">
                    <select required value={experience} onChange={e => setExperience(e.target.value)} className={selectCls}>
                      <option value="" className="bg-[#111]">--</option>
                      {Array.isArray(expOptions) && expOptions.map((opt, i) => (
                        <option key={i} value={opt} className="bg-[#111]">{opt}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none`} />
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="space-y-2">
                  <label className={labelCls}>{t("careers.coverLetter")}</label>
                  <textarea rows={5} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                    placeholder={t("careers.coverLetterPlaceholder")}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:border-[#D4A843]/60 focus:bg-black/60 outline-none transition-all duration-300 resize-none" />
                </div>

                {/* CV Upload */}
                <div className="space-y-2">
                  <label className={labelCls}>{t("careers.cvUpload")}</label>
                  <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => document.getElementById("cvFileInput").click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragging ? "border-[#D4A843] bg-[#D4A843]/12 scale-[1.01]"
                      : cvFile ? "border-[#D4A843]/60 bg-[#D4A843]/8"
                      : "border-white/12 hover:border-[#D4A843]/35 hover:bg-white/3"}`}>
                    <input id="cvFileInput" type="file" accept=".pdf,.doc,.docx"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setCvFile(f); }}
                      className="hidden" />
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4A843]/20 border border-[#D4A843]/30 flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-[#D4A843]" />
                        </div>
                        <div className={isRTL ? "text-right" : "text-left"}>
                          <p className="text-white font-bold text-sm leading-tight">{cvFile.name}</p>
                          <p className="text-[#D4A843] text-xs mt-0.5 font-bold">{t("careers.cvUploaded")}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Upload size={22} className="text-white/30" />
                        </div>
                        <p className="text-white/40 text-sm font-medium">{t("careers.cvUploadHint")}</p>
                        <p className="text-white/20 text-xs">PDF, DOC, DOCX</p>
                      </div>
                    )}
                  </div>
                </div>

                {submitError && <p className="text-red-400 text-sm text-center">{submitError}</p>}

                <button type="submit" disabled={submitting}
                  className="w-full mt-2 bg-gradient-to-r from-[#D4A843] to-[#D4A843] hover:from-[#D4A843] hover:to-[#D4A843] text-black font-black py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-sm shadow-2xl shadow-[#D4A843]/20 hover:-translate-y-1 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                  <Send size={17} />
                  {submitting ? "..." : t("careers.submitApplication")}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
      )}
    </main>
  );
}
