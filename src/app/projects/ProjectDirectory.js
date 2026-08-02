"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ZoomIn, X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Search, Calendar, MapPin, Layers } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ProjectDirectory({ projects, categories }) {
  const { lang, t, isRTL } = useLanguage();

  // Public visitors see a location-based label, never the real project name.
  const projectLabel = useCallback(
    (p) => t("projectsSection.genericProjectName").replace("{location}", p.location[lang] || p.location.en),
    [t, lang]
  );

  // State for active category
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Lightbox & Project Details state
  const [activeProject, setActiveProject] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const lightboxRef = useRef(null);

  // Extract cities and years from projects for filters
  const cities = useMemo(() => {
    const allCities = projects.map(p => p.location);
    const unique = [];
    allCities.forEach(c => {
      const label = c[lang] || c.en;
      if (!unique.some(u => u.label === label)) {
        unique.push({ label, raw: c });
      }
    });
    return unique;
  }, [projects, lang]);

  const years = useMemo(() => {
    const allYears = projects.map(p => p.year).filter(Boolean);
    return [...new Set(allYears)].sort((a, b) => b - a);
  }, [projects]);

  // Filter projects based on all parameters
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Category filter
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      
      // Search query filter
      const titleText = projectLabel(p).toLowerCase();
      const descText = (p.description[lang] || p.description.en).toLowerCase();
      const matchesSearch = titleText.includes(searchQuery.toLowerCase()) || descText.includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      
      // City filter
      if (selectedCity !== "all") {
        const cityLabel = p.location[lang] || p.location.en;
        if (cityLabel !== selectedCity) return false;
      }
      
      // Year filter
      if (selectedYear !== "all" && String(p.year) !== selectedYear) return false;
      
      // Status filter
      if (selectedStatus !== "all" && p.status !== selectedStatus) return false;
      
      return true;
    });
  }, [projects, activeCategory, searchQuery, selectedCity, selectedYear, selectedStatus, lang, projectLabel]);

  // Handle opening a project details modal
  const handleOpenProject = (project) => {
    setActiveProject(project);
    setCurrentImageIndex(0);
    setLightboxOpen(true);
  };

  // Keyboard navigation inside lightbox
  const goNext = useCallback(() => {
    if (!activeProject) return;
    setCurrentImageIndex((prev) => (prev + 1) % activeProject.gallery.length);
  }, [activeProject]);

  const goPrev = useCallback(() => {
    if (!activeProject) return;
    setCurrentImageIndex((prev) => (prev - 1 + activeProject.gallery.length) % activeProject.gallery.length);
  }, [activeProject]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setActiveProject(null);
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") {
        isRTL ? goPrev() : goNext();
      }
      if (e.key === "ArrowLeft") {
        isRTL ? goNext() : goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, isRTL, goNext, goPrev, closeLightbox]);

  // Toggle fullscreen mode for lightbox
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      lightboxRef.current?.requestFullscreen().catch((err) => {
        console.error(err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Category covers map
  const categoryCovers = {
    commercial: "/asstes/office-projects/BARJIS FRONT FACADE (05.08.2025).jpg",
    residential: "/asstes/office-projects/1.jpg",
    recent: "/asstes/office-projects/projects-ph/WhatsApp Image 2025-12-29 at 02.52.48.jpeg",
    architectural: "/asstes/mamary1.png",
    archive: "/asstes/office-projects/WhatsApp Image 2023-02-16 at 09.49.49.jpeg",
  };

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    projects.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [projects]);

  const projectsSectionRef = useRef(null);

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    projectsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-16">

      {/* ── Category Cards Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {Object.values(categories).filter(cat => cat.id !== "all").map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          const cover = categoryCovers[cat.id] || "/asstes/office-projects/1.jpg";
          const isActive = activeCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer border transition-all duration-500 hover:-translate-y-1.5 ${
                isActive ? "border-secondary shadow-lg shadow-secondary/25 scale-[1.02]" : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Cover Photo */}
              <Image
                src={cover}
                alt={cat.label.en}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Text Info */}
              <div className="absolute bottom-5 inset-x-5 text-center space-y-1 z-10">
                <span className="text-2xl block">{cat.icon}</span>
                <h3 className="text-sm font-black text-white group-hover:text-secondary transition-colors line-clamp-1">
                  {cat.label[lang] || cat.label.en}
                </h3>
                <span className="text-[10px] font-bold text-white/50 block">
                  {count} {count === 1 ? t("projectsSection.directory.projectSingular") : count === 2 ? t("projectsSection.directory.projectDual") : t("projectsSection.directory.projectPlural")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* ── Filters & Search Section ── */}
      <div ref={projectsSectionRef} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Search and Category Tabs Row */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/40`} size={20} />
            <input
              type="text"
              placeholder={t("projectsSection.directory.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-black/40 border border-white/10 rounded-2xl ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 text-sm text-white focus:border-[var(--secondary)] focus:bg-black/60 outline-none transition-all duration-300`}
            />
          </div>

          {/* Category segmented list */}
          <div className="flex flex-wrap gap-2 items-center">
            {Object.values(categories).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-secondary to-[#E1BF67] text-black shadow-lg shadow-secondary/20"
                      : "bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.label[lang] || cat.label.en}
                </button>
              );
            })}
          </div>

        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          
          {/* City Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#D5B25D] tracking-wider block">
              {t("projectsSection.directory.cityLabel")}
            </label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className={`w-full bg-black/40 border border-white/10 rounded-xl ${isRTL ? 'pe-4 ps-10' : 'ps-4 pe-10'} py-3 text-xs text-white focus:border-[var(--secondary)] outline-none transition-all appearance-none cursor-pointer`}
              >
                <option value="all" className="bg-[#0f172a] text-white">
                  {t("projectsSection.directory.allCities")}
                </option>
                {cities.map((city) => (
                  <option key={city.label} value={city.label} className="bg-[#0f172a] text-white">
                    {city.label}
                  </option>
                ))}
              </select>
              <ChevronLeft className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none -rotate-90`} size={14} />
            </div>
          </div>

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#D5B25D] tracking-wider block">
              {t("projectsSection.directory.yearLabel")}
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={`w-full bg-black/40 border border-white/10 rounded-xl ${isRTL ? 'pe-4 ps-10' : 'ps-4 pe-10'} py-3 text-xs text-white focus:border-[var(--secondary)] outline-none transition-all appearance-none cursor-pointer`}
              >
                <option value="all" className="bg-[#0f172a] text-white">
                  {t("projectsSection.directory.allYears")}
                </option>
                {years.map((y) => (
                  <option key={y} value={String(y)} className="bg-[#0f172a] text-white">
                    {y}
                  </option>
                ))}
              </select>
              <ChevronLeft className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none -rotate-90`} size={14} />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#D5B25D] tracking-wider block">
              {t("projectsSection.directory.statusLabel")}
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full bg-black/40 border border-white/10 rounded-xl ${isRTL ? 'pe-4 ps-10' : 'ps-4 pe-10'} py-3 text-xs text-white focus:border-[var(--secondary)] outline-none transition-all appearance-none cursor-pointer`}
              >
                <option value="all" className="bg-[#0f172a] text-white">
                  {t("projectsSection.directory.allStatuses")}
                </option>
                <option value="completed" className="bg-[#0f172a] text-white">
                  {t("projectsSection.directory.completed")}
                </option>
                <option value="ongoing" className="bg-[#0f172a] text-white">
                  {t("projectsSection.directory.ongoing")}
                </option>
              </select>
              <ChevronLeft className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none -rotate-90`} size={14} />
            </div>
          </div>

        </div>

      </div>

      {/* ── Projects Grid ── */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl space-y-4">
          <p className="text-white/60 text-lg">
            {t("projectsSection.directory.noResults")}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
              setSelectedCity("all");
              setSelectedYear("all");
              setSelectedStatus("all");
            }}
            className="text-secondary font-bold text-sm hover:underline"
          >
            {t("projectsSection.directory.resetFilters")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => handleOpenProject(p)}
              className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-xl cursor-pointer hover:border-secondary/40 hover:bg-white/8 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between"
            >
              <div>
                {/* Cover Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <Image
                    src={p.coverImage}
                    alt={projectLabel(p)}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-w-728px) 100vw, (max-w-1024px) 50vw, 33vw"
                    unoptimized
                  />
                  
                  {/* Status Badge */}
                  <span className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                    p.status === "completed" 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {p.status === "completed" ? t("projectsSection.directory.completed") : t("projectsSection.directory.ongoing")}
                  </span>

                  {/* Photo Count Badge */}
                  <span className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-white/10`}>
                    <Layers size={11} />
                    {p.gallery.length} {t("projectsSection.directory.photosCount")}
                  </span>
                </div>

                {/* Info Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-secondary font-black tracking-widest text-[10px] uppercase block mb-1">
                      {categories[p.category]?.label[lang] || categories[p.category]?.label.en}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-secondary transition-colors duration-300 line-clamp-1">
                      {projectLabel(p)}
                    </h3>
                  </div>

                  <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
                    {p.description[lang] || p.description.en}
                  </p>
                </div>
              </div>

              {/* Card Footer Metadata */}
              <div className="px-6 pb-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-secondary" />
                  <span>{p.location[lang] || p.location.en}</span>
                </div>
                {p.year && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-secondary" />
                    <span>{p.year}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Advanced Lightbox Modal ── */}
      {lightboxOpen && activeProject && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between"
          onClick={closeLightbox}
        >
          {/* Top Header Bar */}
          <div 
            className="flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent relative z-10 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-secondary font-black tracking-widest text-[10px] uppercase block mb-1">
                {categories[activeProject.category]?.label[lang] || categories[activeProject.category]?.label.en}
              </span>
              <h2 className="text-white text-base md:text-xl font-black">
                {projectLabel(activeProject)}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all"
                title={t("projectsSection.directory.fullScreen")}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="p-2.5 rounded-xl bg-secondary hover:bg-[#E1BF67] border border-secondary/20 text-black font-black transition-all"
                title={t("aboutUsPage.closeLabel")}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Content Area (Image + Navigation) */}
          <div className="relative flex-1 flex items-center justify-center px-4 md:px-16">
            
            {/* Prev Arrow */}
            {activeProject.gallery.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isRTL ? goNext() : goPrev();
                }}
                className={`absolute ${isRTL ? 'right-4 md:right-8' : 'left-4 md:left-8'} p-3 md:p-4 rounded-2xl bg-black/60 hover:bg-secondary hover:text-black border border-white/10 hover:border-secondary/40 text-white transition-all duration-300 z-10`}
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Central Large Image Wrapper */}
            <div
              className="relative w-[90vw] h-[55vh] md:h-[65vh] max-w-5xl transition-all duration-500"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeProject.gallery[currentImageIndex]}
                alt={`${projectLabel(activeProject)} - ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>

            {/* Next Arrow */}
            {activeProject.gallery.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isRTL ? goPrev() : goNext();
                }}
                className={`absolute ${isRTL ? 'left-4 md:left-8' : 'right-4 md:right-8'} p-3 md:p-4 rounded-2xl bg-black/60 hover:bg-secondary hover:text-black border border-white/10 hover:border-secondary/40 text-white transition-all duration-300 z-10`}
              >
                <ChevronRight size={28} />
              </button>
            )}

          </div>

          {/* Bottom Thumbnails / Metadata Strip */}
          <div
            className="bg-black/90 border-t border-white/10 p-4 md:p-6 w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Description & Counter */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-3xl">
                {activeProject.description[lang] || activeProject.description.en}
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs font-bold text-secondary self-end md:self-auto whitespace-nowrap" dir="ltr">
                {t("projectsSection.directory.imageCounter")
                  .replace("{current}", String(currentImageIndex + 1))
                  .replace("{total}", String(activeProject.gallery.length))}
              </div>
            </div>

            {/* Thumbnails strip */}
            {activeProject.gallery.length > 1 && (
              <div className="max-w-6xl mx-auto overflow-x-auto no-scrollbar py-2 flex items-center justify-start gap-3">
                {activeProject.gallery.map((img, tIdx) => {
                  const isCurrent = tIdx === currentImageIndex;
                  return (
                    <button
                      key={tIdx}
                      onClick={() => setCurrentImageIndex(tIdx)}
                      className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                        isCurrent ? "border-secondary scale-105 shadow-lg shadow-secondary/25" : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <Image
                        src={img}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* Hide Scrollbar Tailwind CSS Rule */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
}
