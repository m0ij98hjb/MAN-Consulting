"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ViewAllProjectsCTA = () => {
  const { t, lang } = useLanguage();

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-primary">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <p className="text-white mb-6 italic">
          {t("projectsSection.more")}
        </p>
        <Link
          href="/projects"
          className={`inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-full font-bold hover:bg-secondary/80 transition-all shadow-md ${
            lang === 'ar' || lang === 'ur' ? 'flex-row' : 'flex-row-reverse'
          }`}
        >
          {t("projectsSection.viewAll")}
          <ExternalLink size={18} className={lang === 'ar' || lang === 'ur' ? '' : 'rotate-180'} />
        </Link>
      </div>
    </section>
  );
};

export default ViewAllProjectsCTA;
