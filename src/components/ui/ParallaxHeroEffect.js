"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ParallaxHeroEffect (Universal Section Parallax)
 * Automatically applies 60fps hardware-accelerated 3D parallax scroll effects 
 * to ALL sections and section backgrounds site-wide.
 */
export default function ParallaxHeroEffect() {
  const pathname = usePathname();

  useEffect(() => {
    const getSections = () => Array.from(document.querySelectorAll("section"));

    const applyParallax = () => {
      const sections = getSections();
      const viewportH = window.innerHeight;
      const viewportCenter = viewportH / 2;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();

        // Skip sections out of viewport bounds
        if (rect.bottom < -100 || rect.top > viewportH + 100) return;

        const isHero = section.classList.contains("image-hero") || section.className.includes("hero");

        // Target background container: explicit parallax bg or first absolute inset-0 child
        const bg = section.querySelector(".parallax-bg") ||
                   section.querySelector(".hero-parallax-bg") ||
                   section.querySelector(".absolute.inset-0") ||
                   section.querySelector(":scope > div.absolute");

        if (!bg) return;

        if (isHero) {
          // Hero section parallax: scroll offset calculation
          const scrolled = Math.max(0, -rect.top);
          const shift = scrolled * 0.35;
          bg.style.transform = `translate3d(0, ${shift}px, 0)`;
        } else {
          // Regular section parallax: relative to viewport center
          const sectionCenter = rect.top + rect.height / 2;
          const distanceFromCenter = sectionCenter - viewportCenter;
          
          // Smooth subtle offset (-12% speed differential for depth effect)
          const shift = distanceFromCenter * -0.12;
          bg.style.transform = `translate3d(0, ${shift}px, 0)`;
        }
      });
    };

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        applyParallax();
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", applyParallax, { passive: true });

    // Initial calculation after render
    applyParallax();
    // Secondary trigger for dynamic content height stabilization
    const timer = setTimeout(applyParallax, 300);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", applyParallax);
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  return null;
}
