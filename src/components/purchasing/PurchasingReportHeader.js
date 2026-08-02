'use client';
import { useLanguage } from '@/context/LanguageContext';

/** Shared print/export header (logo + title + generated date) for Executive Reports and per-request printable reports. */
export default function PurchasingReportHeader({ title, subtitle }) {
  const { isRTL } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-4 pb-4 mb-2 border-b-2 border-[#c8a96e]/40" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/asstes/logo-navbar.png" alt="MNC" className="h-10 w-auto" />
        <div>
          <p className="text-white font-black text-sm">{title}</p>
          {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <p className="text-white/30 text-[11px]" dir="ltr">{new Date().toLocaleString('en-GB')}</p>
    </div>
  );
}
