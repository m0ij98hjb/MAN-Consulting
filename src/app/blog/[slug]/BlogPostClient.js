"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, PhoneCall } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { BLOG_POSTS } from "@/lib/blogData";

export default function BlogPostClient({ post }) {
  const { lang, isRTL } = useLanguage();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="image-hero relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={post.coverImage}
            alt={post.title[lang] || post.title.en}
            fill
            className="object-contain object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#070d1a]" />
        </div>
        <div className="relative z-10 container mx-auto px-6 max-w-3xl pt-32 pb-14">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-[#D4A843] text-sm font-semibold mb-6 transition-colors"
          >
            <BackArrow size={15} />
            {lang === "ar" ? "الرجوع إلى المدونة" : "Back to Blog"}
          </Link>
          <span className="inline-block bg-[#D4A843] text-[#1F2937] text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
            {post.category[lang] || post.category.en}
          </span>
          <h1 className="text-3xl md:text-5xl font-black leading-[1.15] text-white mb-4">
            {post.title[lang] || post.title.en}
          </h1>
          <div className="flex items-center gap-2 text-white/60 text-sm font-semibold">
            <CalendarDays size={14} />
            {post.date}
          </div>
        </div>
      </section>

      {/* ── Article Body ── */}
      <section className="py-16" style={{ backgroundColor: "var(--background)" }}>
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 md:p-12">
            {(post.content[lang] || post.content.en).map((paragraph, i) => (
              <p key={i} className="text-[#1F2937] text-base md:text-lg leading-relaxed mb-6 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 flex flex-col sm:flex-row items-center justify-between gap-5 border-t-4 border-[#D4A843]">
            <p className="text-[#1F2937] font-bold text-lg text-center sm:text-start">
              {lang === "ar" ? "هل لديك مشروع تريد مناقشته معنا؟" : "Have a project you'd like to discuss?"}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4A843] hover:bg-[#E8C46A] text-[#1F2937] font-bold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              <PhoneCall size={15} />
              {lang === "ar" ? "تواصل معنا" : "Contact Us"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Related Articles ── */}
      {related.length > 0 && (
        <section className="pb-20" style={{ backgroundColor: "var(--background)" }}>
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="text-2xl font-bold text-white mb-8">
              {lang === "ar" ? "مقالات ذات صلة" : "Related Articles"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.14)] transition-all duration-300"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={p.coverImage}
                      alt={p.title[lang] || p.title.en}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-[#1F2937] leading-snug group-hover:text-[#D4A843] transition-colors">
                      {p.title[lang] || p.title.en}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
