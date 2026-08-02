'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ACTIVITY_KEYS } from '@/lib/suppliersConfig';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Trophy, Medal, Award,
  MapPin, Truck, Tag, Package, Sparkles, TrendingUp, Star,
} from 'lucide-react';

/* ── scoring (same as suppliers page) ── */
const PRICE_SCORES = { low: 70, mid: 35, high: 5 };

function parseCapacity(text = '') {
  const nums = text.match(/\d[\d,.]*/g);
  if (!nums) return 0;
  const val = parseFloat(nums[0].replace(/,/g, ''));
  if (isNaN(val)) return 0;
  return Math.min(Math.round(val / 1000) * 5, 80);
}
function parseDelivery(text = '') {
  const n = parseInt((text || '').match(/\d+/)?.[0] ?? '99', 10);
  return n <= 2 ? 30 : n <= 7 ? 20 : n <= 14 ? 10 : 0;
}
function scoreSupplier(s) {
  const priceScore    = PRICE_SCORES[s.priceLevel] ?? 0;
  const capacityScore = parseCapacity(s.supplyCapacity);
  const deliveryScore = parseDelivery(s.deliveryTime);
  const total = priceScore + capacityScore + deliveryScore;
  return { priceScore, capacityScore, deliveryScore, total };
}

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#c8a96e'];
const RANK_ICONS  = [Trophy, Medal, Award];
const RANK_BG     = ['rgba(245,158,11,0.12)', 'rgba(148,163,184,0.10)', 'rgba(200,169,110,0.10)'];
const RANK_BORDER = ['rgba(245,158,11,0.3)', 'rgba(148,163,184,0.25)', 'rgba(200,169,110,0.25)'];

const MAX_POSSIBLE = 70 + 80 + 30; // 180

export default function BestSuppliersPage() {
  const { t, isRTL } = useLanguage();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const getAct = (name) => name && (t('activities.' + ACTIVITY_KEYS[name]) || name);

  const [suppliers, setSuppliers] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'suppliers'), snap => {
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const ranked = useMemo(() => {
    if (!suppliers) return [];
    return [...suppliers]
      .filter(s => s.status !== 'rejected')
      .map(s => ({ ...s, _sc: scoreSupplier(s) }))
      .sort((a, b) => b._sc.total - a._sc.total);
  }, [suppliers]);

  const maxScore = ranked[0]?._sc.total ?? 0;

  const rankLabels = [t('admin.rankFirst'), t('admin.rankSecond'), t('admin.rankThird')];

  if (!suppliers) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Sparkles size={28} className="text-[#c8a96e] animate-pulse" />
        </div>
      </AdminPageLayout>
    );
  }

  const top3 = ranked.slice(0, 3);

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/suppliers"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all">
            <BackIcon size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              <h1 className="text-xl font-bold text-white">{t('admin.bestSuppliersPageTitle')}</h1>
            </div>
            <p className="text-xs text-white/35 mt-0.5">{t('admin.bestSuppliersPageSub')} · {ranked.length}</p>
          </div>
        </div>

        {ranked.length === 0 ? (
          <div className="text-center py-20 text-white/20">{t('admin.noSuppliersListYet')}</div>
        ) : (
          <>
            {/* ── Podium top 3 ── */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {top3.map((s, i) => {
                  const color    = RANK_COLORS[i];
                  const RankIcon = RANK_ICONS[i];
                  return (
                    <div key={s.id}
                      className={`rounded-2xl p-5 relative overflow-hidden ${i === 0 ? 'sm:order-2' : i === 1 ? 'sm:order-1' : 'sm:order-3'}`}
                      style={{ background: RANK_BG[i], border: `1px solid ${RANK_BORDER[i]}` }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold" style={{ color }}>{rankLabels[i]}</span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: RANK_BG[i], border: `1.5px solid ${RANK_BORDER[i]}` }}>
                          <RankIcon size={15} style={{ color }} />
                        </div>
                      </div>

                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ background: `${color}18`, border: `2px solid ${color}50` }}>
                        <span className="text-xl font-black" style={{ color }}>
                          {(s.companyName || '?')[0]}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-sm text-center truncate">{s.companyName}</h3>
                      <p className="text-white/40 text-xs text-center mt-0.5 truncate">{getAct(s.activity) || '—'}</p>

                      <div className="mt-4 space-y-1.5">
                        {s.city && (
                          <div className="flex items-center gap-1.5 text-xs text-white/50">
                            <MapPin size={10} />{s.city}
                          </div>
                        )}
                        {s.priceLevel && (
                          <div className="flex items-center gap-1.5 text-xs text-white/50">
                            <Tag size={10} />
                            {s.priceLevel === 'low'  ? t('admin.priceScoreLabel') + ' ↓'
                           : s.priceLevel === 'mid'  ? t('admin.priceScoreLabel') + ' ↔'
                           :                           t('admin.priceScoreLabel') + ' ↑'}
                          </div>
                        )}
                        {s.deliveryTime && (
                          <div className="flex items-center gap-1.5 text-xs text-white/50">
                            <Truck size={10} />{s.deliveryTime}
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-white/30">{t('admin.scoreLabel')}</span>
                          <span className="font-black" style={{ color }}>{s._sc.total} / {MAX_POSSIBLE}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{ width: `${(s._sc.total / MAX_POSSIBLE) * 100}%`, background: color }} />
                        </div>
                      </div>

                      <Link href={`/admin/suppliers/${s.id}`}
                        className="mt-4 flex items-center justify-center w-full py-1.5 rounded-lg text-[11px] font-bold transition-all"
                        style={{ color, background: `${color}10`, border: `1px solid ${color}25` }}>
                        {t('admin.viewDetails')}
                      </Link>

                      {i === 0 && (
                        <div className="absolute -bottom-6 -end-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
                          style={{ background: color }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Full ranked list ── */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="px-5 py-3.5 border-b border-white/[0.06]">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-400" />
                  {t('admin.fullRankingTitle')}
                </h2>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {ranked.map((s, i) => {
                  const isTop = s._sc.total === maxScore;
                  const pct   = (s._sc.total / MAX_POSSIBLE) * 100;
                  const color = RANK_COLORS[i] ?? '#a78bfa';
                  return (
                    <Link key={s.id} href={`/admin/suppliers/${s.id}`}
                      className={`flex items-center gap-4 px-5 py-3.5 ${isTop ? 'bg-amber-500/[0.04]' : 'hover:bg-white/[0.02]'} transition-colors`}>

                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-500/20 text-slate-400' :
                        i === 2 ? 'bg-[#c8a96e]/20 text-[#c8a96e]' :
                        'bg-white/5 text-white/25'
                      }`}>
                        {i + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{s.companyName}</p>
                          {isTop && (
                            <span className="text-[9px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/25 rounded-full px-1.5 py-0.5 shrink-0 flex items-center gap-0.5">
                              <Star size={7} className="fill-amber-400" /> {t('admin.bestBadge')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {s.city       && <span className="text-[11px] text-white/35 flex items-center gap-1"><MapPin size={9}/>{s.city}</span>}
                          {s.activity   && <span className="text-[11px] text-white/35 flex items-center gap-1"><Package size={9}/>{getAct(s.activity)}</span>}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] text-white/25">{t('admin.priceScoreLabel')}</p>
                          <p className="text-xs font-bold text-purple-300">{s._sc.priceScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-white/25">{t('admin.capScoreLabel')}</p>
                          <p className="text-xs font-bold text-purple-300">{s._sc.capacityScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-white/25">{t('admin.delScoreLabel')}</p>
                          <p className="text-xs font-bold text-purple-300">{s._sc.deliveryScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-white/25">{t('admin.totalScoreLabel')}</p>
                          <p className="text-sm font-black" style={{ color }}>{s._sc.total}</p>
                        </div>
                      </div>

                      <div className="hidden md:block w-24 shrink-0">
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminPageLayout>
  );
}
