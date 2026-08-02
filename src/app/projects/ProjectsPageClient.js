"use client";

import Image from "next/image";
import Link from "next/link";
import TypewriterText from "@/components/TypewriterText";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import GalleryClient from "./GalleryClient";
import ProjectDirectory from "./ProjectDirectory";
import BuildingJourney from "@/components/sections/BuildingJourney";
import CameraTeaser from "@/components/sections/CameraTeaser";
import { useLanguage } from "@/context/LanguageContext";

export default function ProjectsPageClient({ projects, categories }) {
  const { t, isRTL } = useLanguage();

  const galleries = [
    {
      id: "construction",
      title: t("gallery.barjisTitle"),
      description: t("gallery.clickEnlarge"),
      images: [
        "/asstes/office-projects/BARJIS FRONT FACADE (05.08.2025).jpg",
        "/asstes/office-projects/BARJIS - BACK ENTRANCE (07.07.2025).jpg",
        "/asstes/office-projects/BARJIS - BACK ENTRANCE 02 (07.07.2025).jpg",
        "/asstes/office-projects/BARJIS - INNER COURT (05.24.2025).jpg",
        "/asstes/office-projects/BARJIS - INNER COURT (TWO) (05.24.2025).jpg",
        "/asstes/office-projects/BARJIS - PARKING ENTRANCE (07.07.2025).jpg",
        "/asstes/office-projects/BARJIS - ROOF (05.24.2025).jpg",
        "/asstes/office-projects/BARJIS BASEMENT - TWO (07.13.2025).jpg",
      ]
    },
    {
      id: "architecture",
      title: t("gallery.residentialTitle"),
      description: t("gallery.clickEnlarge"),
      images: [
        "/asstes/office-projects/1.jpg",
        "/asstes/office-projects/2.jpg",
        "/asstes/office-projects/3.jpg",
        "/asstes/office-projects/4.jpg",
        "/asstes/office-projects/5.jpg",
        "/asstes/office-projects/8.jpg",
        "/asstes/office-projects/10.jpg",
        "/asstes/office-projects/11.jpg",
        "/asstes/office-projects/12.jpg",
        "/asstes/office-projects/13.jpg",
        "/asstes/office-projects/14.jpg",
        "/asstes/office-projects/15.jpg",
        "/asstes/office-projects/16.jpg",
        "/asstes/office-projects/17.jpg",
        "/asstes/office-projects/18.jpg",
        "/asstes/office-projects/19.jpg",
        "/asstes/office-projects/20.jpg",
        "/asstes/office-projects/21.jpg",
        "/asstes/office-projects/22.jpg",
        "/asstes/office-projects/23.jpg",
        "/asstes/office-projects/24.jpg",
        "/asstes/office-projects/25.jpg",
        "/asstes/office-projects/26.jpg",
        "/asstes/office-projects/27.jpg",
        "/asstes/office-projects/28.jpg",
        "/asstes/office-projects/29.jpg",
        "/asstes/office-projects/30.jpg",
        "/asstes/office-projects/31.jpg",
        "/asstes/office-projects/32.jpg",
        "/asstes/office-projects/33.jpg",
        "/asstes/office-projects/34.jpg",
        "/asstes/office-projects/35.jpg",
        "/asstes/office-projects/36.jpg",
        "/asstes/office-projects/37.jpg",
        "/asstes/office-projects/38.jpg",
        "/asstes/office-projects/39.jpg",
        "/asstes/office-projects/40.jpg",
        "/asstes/office-projects/41.jpg",
        "/asstes/office-projects/42.jpg",
        "/asstes/office-projects/43.jpg",
        "/asstes/office-projects/44.jpg",
        "/asstes/office-projects/45.jpg",
        "/asstes/office-projects/46.jpg",
        "/asstes/office-projects/47.jpg",
        "/asstes/office-projects/48.jpg",
        "/asstes/office-projects/50.jpg",
        "/asstes/office-projects/51.jpg",
        "/asstes/office-projects/52.jpg",
        "/asstes/office-projects/53.jpg",
        "/asstes/office-projects/54.jpg",
        "/asstes/office-projects/55.jpg",
        "/asstes/office-projects/56.jpg",
        "/asstes/office-projects/57.jpg",
        "/asstes/office-projects/58.jpg",
        "/asstes/office-projects/59.jpg",
        "/asstes/office-projects/60.jpg",
        "/asstes/office-projects/61.jpg",
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* Hero Section */}
      <section className="image-hero relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asstes/office-projects/BARJIS FRONT FACADE (05.08.2025).jpg"
            alt="Projects Background"
            fill
            className="object-cover object-center opacity-90 scale-105 animate-slow-zoom"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
            <h1 className="text-3xl md:text-6xl font-black text-white mb-6 font-heading">
              <TypewriterText
                texts={[t('aboutUsPage.projectsTitle')]}
                typingSpeed={120}
                deletingSpeed={60}
                pauseDuration={2000}
                loop={true}
                className="text-white"
              />
            </h1>
            <div className="w-24 h-1 bg-secondary mx-auto mb-6"></div>
            <p className="text-xl text-white/80 leading-relaxed font-semibold">
              {t('projectsSection.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Original Swiper Galleries Section */}
      <section className="py-24 bg-[var(--card-bg)] text-[var(--foreground)] border-b border-white/5">
        <div className="container mx-auto px-6 max-w-7xl space-y-32">
          <GalleryClient galleries={galleries} />
        </div>
      </section>

      {/* Advanced Categorized Project Directory Section */}
      <section className="pt-8 pb-24 bg-black/40 text-[var(--foreground)]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="space-y-12">
            <div className="text-center" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] font-heading mb-4 relative inline-block">
                {t("projectsSection.exploreTitle")}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-secondary rounded-full"></div>
              </h2>
              <p className="text-[var(--foreground)]/70 font-medium mt-6 text-sm max-w-xl mx-auto leading-relaxed">
                {t("projectsSection.exploreDesc")}
              </p>
            </div>

            <ProjectDirectory projects={projects} categories={categories} />
          </div>
        </div>
      </section>

      {/* Video + Construction Journey */}
      <BuildingJourney />

      {/* Camera Teaser */}
      <CameraTeaser />

      {/* Call to Action */}
      <section className="py-20 bg-[var(--background)] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#D5B25D]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container relative z-10 mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-8 font-heading leading-normal py-2">
            {t('aboutUsPage.ctaTitle')}
          </h2>
          <div className="flex flex-col items-center gap-4">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D5B25D] to-[#E1BF67] text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(213,178,93,0.3)] hover:shadow-[0_0_40px_rgba(213,178,93,0.5)]">
              <span>{t('aboutUsPage.ctaBtn')}</span>
              {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
