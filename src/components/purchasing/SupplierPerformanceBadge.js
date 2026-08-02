'use client';
import { useLanguage } from '@/context/LanguageContext';
import { BADGES } from '@/lib/purchasingSupplierPerformance';
import { ShieldCheck, Star, Eye, Ban, HelpCircle } from 'lucide-react';

const STYLES = {
  [BADGES.PREFERRED]: { icon: Star, cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  [BADGES.APPROVED]: { icon: ShieldCheck, cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  [BADGES.WATCHLIST]: { icon: Eye, cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  [BADGES.BLACKLISTED]: { icon: Ban, cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  [BADGES.UNRATED]: { icon: HelpCircle, cls: 'bg-white/10 text-white/40 border-white/15' },
};

export default function SupplierPerformanceBadge({ badge, score }) {
  const { t } = useLanguage();
  const { icon: Icon, cls } = STYLES[badge] || STYLES[BADGES.UNRATED];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cls}`}>
      <Icon size={10} /> {t(`purchasing.badge_${badge}`)}{typeof score === 'number' && badge !== BADGES.UNRATED ? ` · ${score}` : ''}
    </span>
  );
}
