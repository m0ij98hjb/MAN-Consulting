"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Send, ClipboardList, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { COMPANY } from "@/config/company";

const Contact = () => {
  const { lang, t } = useLanguage();
  const isRTL = lang === 'ar' || lang === 'ur';
  const { data: cms } = useSiteContent('contact');

  const phone1   = cms?.phone1    || '0598242385';
  const phone2   = cms?.phone2    || '0505649859';
  const email    = cms?.email     || COMPANY.email;
  const address  = (isRTL ? cms?.address_ar : cms?.address_en) || t('footer.location');

  return (
    <section id="contact" className="py-24 bg-[var(--card-bg)] overflow-hidden font-cairo">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Info Side (Right in RTL) */}
          <div className="w-full lg:w-1/2 space-y-8 md:space-y-10" data-aos="fade-right" data-aos-delay="50">
            <div>
              <span className="text-secondary font-bold tracking-widest text-xs mb-3 block text-center lg:text-right">{t('contact.title')}</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight text-[var(--foreground)] text-center lg:text-right">
                {t('contact.ready')} <br />
                <span className="text-secondary">{t('contact.nextProject')}</span>
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0 text-center lg:text-right">
                {t('contact.desc')}
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 md:gap-5 group cursor-default justify-center lg:justify-start rtl:lg:justify-end" data-aos="fade-up" data-aos-delay="150">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-[rgba(15,23,42,0.06)] bg-[var(--card-bg)] group-hover:border-[var(--secondary)] transition-all duration-300 shadow-sm shrink-0">
                  <Phone className="text-secondary" size={18} md:size={20} />
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-[var(--foreground)] text-[10px] md:text-xs mb-0.5">{t('contact.phone')}</p>
                  <p className="text-base md:text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--secondary)] transition-colors line-clamp-1">{phone1}{phone2 && ` - ${phone2}`}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-5 group cursor-default justify-center lg:justify-start rtl:lg:justify-end" data-aos="fade-up" data-aos-delay="250">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-slate-300 bg-white group-hover:border-secondary transition-all duration-300 shadow-sm shrink-0">
                  <Mail className="text-secondary" size={18} md:size={20} />
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-[var(--foreground)] text-[10px] md:text-xs mb-0.5">{t('contact.email')}</p>
                  <p className="text-base md:text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--secondary)] transition-colors">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-5 group cursor-default justify-center lg:justify-start rtl:lg:justify-end" data-aos="fade-up" data-aos-delay="350">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-slate-300 bg-white group-hover:border-secondary transition-all duration-300 shadow-sm shrink-0">
                  <MapPin className="text-secondary" size={18} md:size={20} />
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-[var(--foreground)] text-[10px] md:text-xs mb-0.5">{t('contact.location')}</p>
                  <p className="text-base md:text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--secondary)] transition-colors text-xs md:text-sm">{address}</p>
                </div>
              </div>
            </div>

            {/* Purchasing module entry point */}
            <Link
              href="/purchase-request"
              data-aos="fade-up" data-aos-delay="420"
              className="group flex items-center gap-4 md:gap-5 rounded-xl border border-[rgba(15,23,42,0.08)] bg-[var(--card-bg)] p-4 md:p-5 shadow-sm hover:border-[var(--secondary)] transition-all duration-300"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border border-[rgba(15,23,42,0.06)] bg-[var(--background)] group-hover:border-[var(--secondary)] transition-all duration-300 shrink-0">
                <ClipboardList className="text-secondary" size={18} md:size={20} />
              </div>
              <div className="flex-1 min-w-0 text-start rtl:text-right">
                <p className="text-base md:text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--secondary)] transition-colors">
                  {t('contact.purchasingCard.title')}
                </p>
                <p className="text-[var(--foreground)]/60 text-xs md:text-sm mt-0.5">{t('contact.purchasingCard.desc')}</p>
              </div>
              {lang === 'ar' || lang === 'ur'
                ? <ArrowLeft size={18} className="text-secondary shrink-0 group-hover:-translate-x-1 transition-transform" />
                : <ArrowRight size={18} className="text-secondary shrink-0 group-hover:translate-x-1 transition-transform" />}
            </Link>
          </div>

          {/* Form Side (Left in RTL) */}
          <div className="lg:w-1/2 w-full" data-aos="fade-left" data-aos-delay="100">
            <div className="bg-[var(--background)] p-6 sm:p-8 md:p-10 rounded-2xl border border-[rgba(15,23,42,0.2)] shadow-2xl">
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 px-1">{t('contact.form.name')}</label>
                    <input
                      type="text"
                      className="w-full bg-[var(--card-bg)] border border-[rgba(15,23,42,0.12)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--secondary)] outline-none transition-colors"
                      placeholder={t('contactPage.formNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 px-1">{t('contact.form.phone')}</label>
                    <input
                      type="tel"
                      className="w-full bg-[var(--card-bg)] border border-[rgba(15,23,42,0.12)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--secondary)] outline-none transition-colors"
                      placeholder={t('careers.phonePlaceholder')}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 px-1">{t('contact.form.service')}</label>
                  <select className="w-full bg-[var(--card-bg)] border border-[rgba(15,23,42,0.12)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--secondary)] outline-none transition-colors appearance-none">
                    <option className="bg-slate-800">{t('contactPage.formServiceOptions.construction')}</option>
                    <option className="bg-slate-800">{t('contactPage.formServiceOptions.architecture')}</option>
                    <option className="bg-slate-800">{t('contactPage.formServiceOptions.management')}</option>
                    <option className="bg-slate-800">{t('contactPage.formServiceOptions.other')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 px-1">{t('contact.form.message')}</label>
                  <textarea
                    rows="4"
                    className="w-full bg-[var(--card-bg)] border border-[rgba(15,23,42,0.12)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--secondary)] outline-none transition-colors resize-none"
                    placeholder={t('contactPage.formMessagePlaceholder')}
                  ></textarea>
                </div>
                 <button type="button" className="w-full mt-2 bg-[var(--secondary)] hover:bg-[var(--gold)] text-[var(--foreground)] font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg">
                   {t('contact.form.submit')} <Send size={16} />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
