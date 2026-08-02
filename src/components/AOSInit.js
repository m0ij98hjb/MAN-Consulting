"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export const AOSInit = () => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    AOS.init({
      duration:  750,
      once:      true,
      easing:    "ease-out-cubic",
      offset:    70,
      delay:     0,
      throttleDelay: 99,
      disable:   prefersReducedMotion,
    });
  }, []);

  return null;
};
