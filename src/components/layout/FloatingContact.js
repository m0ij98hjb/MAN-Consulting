"use client";

import { useState, useEffect } from "react";
import { Mail, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";
import { COMPANY } from "@/config/company";

const FloatingContact = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const { lang, isRTL } = useLanguage();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <div className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} flex flex-col gap-3 z-50 transition-all duration-500`}>
      {/* WhatsApp - Hidden on mobile until scroll */}
      <Link
        href="https://wa.me/966598242385"
        target="_blank"
        rel="noopener noreferrer"
        className={`md:flex w-12 h-12 bg-secondary text-white rounded-full items-center justify-center shadow-lg hover:bg-gold transition-colors hover:-translate-y-1 duration-300 ${
          isVisible ? "flex opacity-100 translate-y-0" : "hidden opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Contact on WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </Link>

      {/* Email - Hidden on mobile until scroll */}
      <Link
        href={`mailto:${COMPANY.email}`}
        className={`md:flex w-12 h-12 bg-secondary text-white rounded-full items-center justify-center shadow-lg hover:bg-gold transition-colors hover:-translate-y-1 duration-300 ${
          isVisible ? "flex opacity-100 translate-y-0" : "hidden opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Send Email"
      >
        <Mail size={22} />
      </Link>

      {/* Scroll to Top - Reverted to Original Styling */}
      <button
        onClick={scrollToTop}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-secondary bg-[#e5e5e5] shadow-md border-2 border-secondary/60 hover:border-secondary hover:bg-[#d4d4d4] transition-all duration-300 hover:-translate-y-1 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default FloatingContact;
