"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { BLOG_POSTS } from "@/lib/blogData";

export default function BlogPageClient() {
  const { t, lang, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <main className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="image-hero relative min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/asstes/office-projects/17.jpg"
            alt="MAN Engineering Consultancy Blog"
            fill
            className="object-cover object-center scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-[#070d1a]/97" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-center max-w-3xl pt-32 pb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 text-[#D4A843] text-xs font-bold uppercase tracking-[3px] mb-8" data-aos="fade-down">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843] animate-pulse" />
            {lang === "ar" ? "المدونة" : "Blog"}
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 text-white" data-aos="fade-up" data-aos-delay="100">
            {lang === "ar" ? "رؤى هندسية من فريقنا" : "Engineering Insights From Our Team"}
          </h1>
          <p className="text-white/65 text-lg leading-relaxed max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            {lang === "ar"
              ? "مقالات ودلائل عملية حول التصميم الهندسي، التراخيص، والإشراف الموقعي من مكتب MAN للاستشارات الهندسية."
              : "Practical articles and guides on engineering design, permitting, and site supervision from MAN Engineering Consultancy."}
          </p>
        </div>
      </section>

      {/* ── Articles Grid ── */}
      <section className="py-20" style={{ backgroundColor: "var(--background)" }}>
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.14)] transition-all duration-300 flex flex-col"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title[lang] || post.title.en}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 start-4 bg-[#D4A843] text-[#1F2937] text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full">
                    {post.category[lang] || post.category.en}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[#4B5563] text-xs font-semibold mb-3">
                    <CalendarDays size={13} />
                    {post.date}
                  </div>
                  <h2 className="text-lg font-bold text-[#1F2937] leading-snug mb-3 group-hover:text-[#D4A843] transition-colors">
                    {post.title[lang] || post.title.en}
                  </h2>
                  <p className="text-[#4B5563] text-sm leading-relaxed mb-5 flex-1">
                    {post.excerpt[lang] || post.excerpt.en}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[#D4A843] text-sm font-bold">
                    {lang === "ar" ? "اقرأ المزيد" : "Read More"}
                    <ArrowIcon size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
