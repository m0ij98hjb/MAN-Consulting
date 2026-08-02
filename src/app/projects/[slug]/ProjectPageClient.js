"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, MapPin, Calendar, User, HardHat, Ruler,
  Building2, Wallet, FileText, X, ChevronLeft, ChevronRight, Layers,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalizedText } from "@/lib/i18nHelpers";
import { getCategoryLabel } from "@/lib/projectCategories";
import { SERVICES_DATA } from "@/lib/servicesData";

function isVideoEmbeddable(url) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

function toEmbedUrl(url) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function DetailItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary/10 border border-secondary/20 shrink-0">
        <Icon size={16} className="text-secondary" />
      </div>
      <div className="min-w-0">
        <p className="text-secondary text-[10px] font-bold uppercase tracking-wider">{label}</p>
        <p className="text-white text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

export default function ProjectPageClient({ project, related }) {
  const { t, lang, isRTL } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const desc = getLocalizedText(project, "desc", lang);
  const location = getLocalizedText(project, "location", lang);
  // Public visitors see a location-based label, never the real project name.
  const name = t("projectsSection.genericProjectName").replace("{location}", location);
  const features = lang === "ar" ? project.features_ar : project.features_en;
  const gallery = project.gallery || [];
  const galleryUrls = [project.coverImage, ...gallery.map((g) => g.url)].filter(Boolean);

  const goNext = () => setLightboxIndex((i) => (i + 1) % galleryUrls.length);
  const goPrev = () => setLightboxIndex((i) => (i - 1 + galleryUrls.length) % galleryUrls.length);

  return (
    <main className="min-h-screen bg-[var(--background)] font-cairo" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[420px] flex items-end overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image src={project.coverImage} alt={name} fill className="object-cover object-center" priority unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </div>
        <div className="container relative z-10 mx-auto px-6 pb-14">
          <Link href="/projects" className="inline-flex items-center gap-2 text-white/60 hover:text-secondary text-xs font-bold mb-4 transition-colors">
            {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            {t("projectsSection.exploreTitle")}
          </Link>
          <span className="text-secondary font-black tracking-widest text-[11px] uppercase block mb-2">
            {getCategoryLabel(project.category, lang)}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white font-heading">{name}</h1>
          {location && (
            <p className="flex items-center gap-2 text-white/60 text-sm mt-3">
              <MapPin size={14} className="text-secondary" /> {location}
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-6xl py-16 space-y-16">
        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem icon={User} label={t("admin.contentTabs.projectsTab.clientLabel")} value={project.client} />
          <DetailItem icon={HardHat} label={t("admin.contentTabs.projectsTab.contractorLabel")} value={project.contractor} />
          <DetailItem icon={Building2} label={t("admin.contentTabs.projectsTab.consultantLabel")} value={project.consultant} />
          <DetailItem icon={Calendar} label={t("admin.contentTabs.projectsTab.completionDateLabel")} value={project.completionDate} />
          <DetailItem icon={Ruler} label={t("admin.contentTabs.projectsTab.areaLabel")} value={project.area} />
          <DetailItem icon={Layers} label={t("admin.contentTabs.projectsTab.floorsLabel")} value={project.floors} />
          <DetailItem icon={Wallet} label={t("admin.contentTabs.projectsTab.budgetLabel")} value={project.budget} />
          <DetailItem icon={Calendar} label={t("admin.contentTabs.projectsTab.yearLabel")} value={project.year} />
        </div>

        {/* Description */}
        {desc && (
          <div className="max-w-3xl">
            <p className="text-white/70 text-sm md:text-base leading-relaxed whitespace-pre-line">{desc}</p>
          </div>
        )}

        {/* Features & Services */}
        {(features?.length > 0 || project.services?.length > 0) && (
          <div className="grid md:grid-cols-2 gap-8">
            {features?.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4">{t("admin.contentTabs.projectsTab.sectionFeaturesServicesTags")}</h3>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.services?.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4">{t("admin.contentTabs.projectsTab.servicesLabel")}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.services.map((slug) => (
                    <span key={slug} className="px-3 py-1.5 rounded-full text-xs font-bold bg-secondary/10 border border-secondary/25 text-secondary">
                      {SERVICES_DATA[slug]?.content?.[lang]?.title || SERVICES_DATA[slug]?.content?.en?.title || slug}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery */}
        {galleryUrls.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t("projectsSection.directory.photosCount")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 hover:border-secondary/40 transition-all"
                >
                  <Image src={url} alt={`${name} ${idx + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {project.videos?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">{t("admin.contentTabs.projectsTab.videosLabel")}</h3>
            {project.videos.map((url, i) => (
              <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                {isVideoEmbeddable(url) ? (
                  <iframe src={toEmbedUrl(url)} className="w-full h-full" allowFullScreen title={`video-${i}`} />
                ) : (
                  <video src={url} controls className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* PDF Brochure */}
        {project.pdfBrochure?.url && (
          <a
            href={project.pdfBrochure.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/25 rounded-2xl px-5 py-3.5 hover:bg-secondary/20 transition-all"
          >
            <FileText size={18} className="text-secondary" />
            <span className="text-white text-sm font-bold">{t("admin.contentTabs.projectsTab.brochureLabel")}</span>
          </a>
        )}

        {/* Related Projects */}
        {related?.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{t("projectsSection.relatedProjects")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/projects/${rp.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:border-secondary/40 hover:bg-white/8 transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <Image
                      src={rp.coverImage}
                      alt={t("projectsSection.genericProjectName").replace("{location}", getLocalizedText(rp, "location", lang))}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-secondary text-[10px] font-black uppercase tracking-widest block mb-1">
                      {getCategoryLabel(rp.category, lang)}
                    </span>
                    <h4 className="text-white font-bold group-hover:text-secondary transition-colors line-clamp-1">
                      {t("projectsSection.genericProjectName").replace("{location}", getLocalizedText(rp, "location", lang))}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-secondary text-black z-10"
          >
            <X size={18} />
          </button>
          {galleryUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); isRTL ? goNext() : goPrev(); }}
              className="absolute left-4 md:left-8 p-3 rounded-2xl bg-black/60 hover:bg-secondary hover:text-black text-white transition-all z-10"
            >
              <ChevronLeft size={26} />
            </button>
          )}
          <div className="relative w-[90vw] h-[70vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={galleryUrls[lightboxIndex]} alt="" fill className="object-contain" unoptimized />
          </div>
          {galleryUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); isRTL ? goPrev() : goNext(); }}
              className="absolute right-4 md:right-8 p-3 rounded-2xl bg-black/60 hover:bg-secondary hover:text-black text-white transition-all z-10"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      )}
    </main>
  );
}
