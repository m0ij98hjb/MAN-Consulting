"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

export default function GalleryClient({ galleries }) {
  const { lang, t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const isLightMode = theme === 'dark';
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: "",
  });

  const openLightbox = (images, index, title) => {
    setLightbox({ isOpen: true, images, currentIndex: index, title });
  };

  const closeLightbox = useCallback(() => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const goNext = useCallback(() => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  }, []);

  const goPrev = useCallback(() => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex:
        (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  }, []);

  useEffect(() => {
    if (!lightbox.isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightbox.isOpen, closeLightbox, goNext, goPrev]);

  return (
    <>
      {galleries.map((gallery) => (
        <div key={gallery.id} className="space-y-12" data-aos="fade-up">
          <div className="text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] font-heading mb-4 relative inline-block">
              {gallery.title}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-secondary rounded-full"></div>
            </h2>
            <p className="text-[var(--foreground)] font-medium mt-6">
              {gallery.description}
            </p>
          </div>

          {gallery.id === "architecture" ? (
            <div className="pb-12">
              <Swiper
                key={`arch-${lang}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={"auto"}
                loop={true}
                loopedSlides={5}
                loopPreventsSliding={false}
                coverflowEffect={{
                  rotate: 30,
                  stretch: 0,
                  depth: 100,
                  modifier: 1,
                  slideShadows: true,
                }}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={true}
                modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
                className="architecture-swiper py-10"
                breakpoints={{
                  320: { slidesPerView: 1.2, spaceBetween: 20 },
                  640: { slidesPerView: 2, spaceBetween: 30 },
                  1024: { slidesPerView: 3, spaceBetween: 40 },
                }}
              >
                {gallery.images.map((imgSrc, imgIndex) => (
                  <SwiperSlide key={imgIndex} className="max-w-[320px]">
                    <div
                      onClick={() => openLightbox(gallery.images, imgIndex, gallery.title)}
                      className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl cursor-pointer bg-slate-100 border-4 border-white"
                    >
                      <Image
                        src={imgSrc}
                        alt={`${gallery.title} - Image ${imgIndex + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <div className="bg-[var(--card-bg)]/20 backdrop-blur-md p-4 rounded-full transform scale-50 group-hover:scale-100 transition-transform duration-500">
                          <ZoomIn size={32} className="text-[var(--foreground)]" />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <style jsx global>{`
                .architecture-swiper .swiper-pagination-bullet-active {
                  background: #c5a059 !important;
                }
                .architecture-swiper .swiper-button-next,
                .architecture-swiper .swiper-button-prev {
                  color: #c5a059 !important;
                  background: rgba(255, 255, 255, 0.8);
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .architecture-swiper .swiper-button-next:after,
                .architecture-swiper .swiper-button-prev:after {
                  font-size: 20px;
                  font-weight: bold;
                }
                @media (max-width: 640px) {
                  .architecture-swiper .swiper-button-next,
                  .architecture-swiper .swiper-button-prev {
                    display: none;
                  }
                }
              `}</style>
            </div>
          ) : gallery.id === "interior" ? (
            <div className="pb-12 relative px-4 md:px-24 group">
              {/* Custom Navigation Buttons */}
              <button className={`swiper-prev-${gallery.id} absolute ${isRTL ? 'right-0 md:right-4' : 'left-0 md:left-4'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-[var(--card-bg)]/10 backdrop-blur-md border border-[rgba(255,255,255,0.2)] text-[var(--secondary)] rounded-2xl hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex`}>
                {isRTL ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
              </button>
              <button className={`swiper-next-${gallery.id} absolute ${isRTL ? 'left-0 md:left-4' : 'right-0 md:right-4'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-[var(--card-bg)]/10 backdrop-blur-md border border-[rgba(255,255,255,0.2)] text-[var(--secondary)] rounded-2xl hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 hidden md:flex`}>
                {isRTL ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
              </button>

              <Swiper
                key={`int-${lang}`}
                dir={isRTL ? 'rtl' : 'ltr'}
                grabCursor={true}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={{
                  nextEl: `.swiper-next-${gallery.id}`,
                  prevEl: `.swiper-prev-${gallery.id}`,
                }}
                loop={true}
                modules={[Pagination, Navigation, Autoplay]}
                className="interior-swiper rounded-[2rem] overflow-visible"
                breakpoints={{
                  320: { slidesPerView: 1.2, spaceBetween: 20 },
                  640: { slidesPerView: 2.5, spaceBetween: 30 },
                  1024: { slidesPerView: 4, spaceBetween: 40 }
                }}
              >
                {gallery.images.map((imgSrc, imgIndex) => (
                  <SwiperSlide key={imgIndex} className="py-10">
                    <div
                      onClick={() => openLightbox(gallery.images, imgIndex, gallery.title)}
                      className="group/slide relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer bg-slate-100 border-4 md:border-8 border-white/50 backdrop-blur-sm transition-all duration-500 hover:z-10"
                    >
                      <Image
                        src={imgSrc}
                        alt={`${gallery.title} - Image ${imgIndex + 1}`}
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover/slide:scale-110"
                        unoptimized
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover/slide:opacity-100 transition-opacity duration-700"></div>
                      
                      <div className={`absolute bottom-6 ${isRTL ? 'right-6' : 'left-6'} md:bottom-10 ${isRTL ? 'md:right-10' : 'md:left-10'} opacity-0 group-hover/slide:opacity-100 translate-y-10 group-hover/slide:translate-y-0 transition-all duration-700 bg-[var(--card-bg)]/10 backdrop-blur-xl border border-[rgba(255,255,255,0.2)] p-3 md:p-4 rounded-2xl`}>
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center">
                            <ZoomIn size={20} className="text-[var(--foreground)]" />
                          </div>
                          <div className={`text-[var(--foreground)] ${isRTL ? 'text-right' : 'text-left'}`}>
                            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-60 mb-0.5">
                              {t('gallery.distinctive')}
                            </p>
                            <p className="text-xs md:text-sm font-bold tracking-wide">
                              {t('gallery.viewDetails')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              <style jsx global>{`
                .interior-swiper .swiper-pagination-bullet {
                  background: rgba(197, 160, 89, 0.3) !important;
                  opacity: 1 !important;
                }
                .interior-swiper .swiper-pagination-bullet-active {
                  background: #c5a059 !important;
                  width: 24px !important;
                  border-radius: 4px !important;
                }
              `}</style>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {gallery.images.map((imgSrc, imgIndex) => (
                <div
                  key={imgIndex}
                  onClick={() => openLightbox(gallery.images, imgIndex, gallery.title)}
                  className="group relative aspect-square rounded-3xl overflow-hidden shadow-lg cursor-pointer bg-slate-100 border-4 border-white transition-all duration-500 hover:shadow-2xl"
                  data-aos="zoom-in"
                  data-aos-delay={imgIndex * 100}
                >
                  <Image
                    src={imgSrc}
                    alt={`${gallery.title} - Image ${imgIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="bg-[var(--card-bg)]/20 backdrop-blur-md p-4 rounded-full transform scale-50 group-hover:scale-100 transition-transform duration-500">
                      <ZoomIn size={32} className="text-[var(--foreground)]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {lightbox.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} text-[var(--foreground)] hover:text-[var(--secondary)] transition-colors z-10`}
          >
            <X size={40} />
          </button>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[var(--foreground)] text-lg font-bold">
            {lightbox.title} - {lightbox.currentIndex + 1} /{" "}
            {lightbox.images.length}
          </div>

          {lightbox.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                isRTL ? goNext() : goPrev();
              }}
              className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-[var(--foreground)] hover:text-[var(--secondary)] transition-colors z-10`}
            >
              <ChevronLeft size={50} />
            </button>
          )}

          <div
            className="relative w-[90vw] h-[80vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.images[lightbox.currentIndex]}
              alt={`${lightbox.title} - Image ${lightbox.currentIndex + 1}`}
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>

          {lightbox.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                isRTL ? goPrev() : goNext();
              }}
              className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-[var(--foreground)] hover:text-[var(--secondary)] transition-colors z-10`}
            >
              <ChevronRight size={50} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
