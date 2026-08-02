'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Star, Trophy, Medal, Award,
  MapPin, Briefcase, Download, Sparkles,
  Clock, TrendingUp,
} from 'lucide-react';

/* ── scoring (same as jobs page) ── */
const CLOSE_CITIES  = ['جدة','jeddah','مكة','mecca','الطائف','taif','رابغ','rabigh','ينبع','yanbu','القنفذة'];
const MEDIUM_CITIES = ['الرياض','riyadh','المدينة','medina','الدمام','dammam','الخبر','khobar','أبها','abha'];
const EXP_SCORES = {
  'أقل من سنة':5,'Less than 1 year':5,
  '1 – 3 سنوات':15,'1 – 3 years':15,
  '3 – 5 سنوات':35,'3 – 5 years':35,
  '5 – 10 سنوات':55,'5 – 10 years':55,
  'أكثر من 10 سنوات':75,'More than 10 years':75,
};
function scoreApp(app) {
  const expScore  = EXP_SCORES[app.experience] ?? 0;
  const cityLower = (app.city || '').toLowerCase();
  const cityScore = CLOSE_CITIES.some(c => cityLower.includes(c.toLowerCase())) ? 50
                  : MEDIUM_CITIES.some(c => cityLower.includes(c.toLowerCase())) ? 25
                  : cityLower.length > 1 ? 5 : 0;
  return { expScore, cityScore, total: expScore + cityScore };
}

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#c8a96e'];
const RANK_ICONS  = [Trophy, Medal, Award];
const RANK_BG     = ['rgba(245,158,11,0.12)', 'rgba(148,163,184,0.10)', 'rgba(200,169,110,0.10)'];
const RANK_BORDER = ['rgba(245,158,11,0.3)', 'rgba(148,163,184,0.25)', 'rgba(200,169,110,0.25)'];

export default function BestJobsPage() {
  const { t, isRTL } = useLanguage();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [apps, setApps] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'jobApplications'), snap => {
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const ranked = useMemo(() => {
    if (!apps) return [];
    return [...apps]
      .map(a => ({ ...a, _sc: scoreApp(a) }))
      .sort((a, b) => b._sc.total - a._sc.total);
  }, [apps]);

  const maxScore = ranked[0]?._sc.total ?? 0;

  const rankLabels = [t('admin.rankFirst'), t('admin.rankSecond'), t('admin.rankThird')];

  if (!apps) {
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
          <Link href="/admin/jobs"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all">
            <BackIcon size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              <h1 className="text-xl font-bold text-white">{t('admin.bestJobsPageTitle')}</h1>
            </div>
            <p className="text-xs text-white/35 mt-0.5">{t('admin.bestJobsPageSub')} · {ranked.length}</p>
          </div>
        </div>

        {ranked.length === 0 ? (
          <div className="text-center py-20 text-white/20">{t('admin.noApplicationsYet')}</div>
        ) : (
          <>
            {/* ── Podium top 3 ── */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {top3.map((app, i) => {
                  const color    = RANK_COLORS[i];
                  const RankIcon = RANK_ICONS[i];
                  return (
                    <div key={app.id}
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
                          {(app.fullName || '?')[0]}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-sm text-center truncate">{app.fullName}</h3>
                      <p className="text-white/40 text-xs text-center mt-0.5 truncate">{app.position || '—'}</p>

                      <div className="mt-4 space-y-1.5">
                        {app.city && (
                          <div className="flex items-center gap-1.5 text-xs text-white/50">
                            <MapPin size={10} />{app.city}
                          </div>
                        )}
                        {app.experience && (
                          <div className="flex items-center gap-1.5 text-xs text-white/50">
                            <Clock size={10} />{app.experience}
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-white/30">{t('admin.scoreLabel')}</span>
                          <span className="font-black" style={{ color }}>{app._sc.total} / 125</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(app._sc.total / 125) * 100}%`, background: color }} />
                        </div>
                      </div>

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
                {ranked.map((app, i) => {
                  const isTop = app._sc.total === maxScore;
                  const pct   = maxScore > 0 ? (app._sc.total / 125) * 100 : 0;
                  const color = RANK_COLORS[i] ?? '#a78bfa';
                  return (
                    <div key={app.id}
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
                          <p className="text-sm font-semibold text-white truncate">{app.fullName}</p>
                          {isTop && (
                            <span className="text-[9px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/25 rounded-full px-1.5 py-0.5 shrink-0 flex items-center gap-0.5">
                              <Star size={7} className="fill-amber-400" /> {t('admin.bestBadge')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {app.position   && <span className="text-[11px] text-white/35 flex items-center gap-1"><Briefcase size={9}/>{app.position}</span>}
                          {app.city       && <span className="text-[11px] text-white/35 flex items-center gap-1"><MapPin size={9}/>{app.city}</span>}
                          {app.experience && <span className="text-[11px] text-white/35 flex items-center gap-1"><Clock size={9}/>{app.experience}</span>}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] text-white/25">{t('admin.expScoreLabel')}</p>
                          <p className="text-xs font-bold text-purple-300">{app._sc.expScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-white/25">{t('admin.locScoreLabel')}</p>
                          <p className="text-xs font-bold text-purple-300">{app._sc.cityScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-white/25">{t('admin.totalScoreLabel')}</p>
                          <p className="text-sm font-black" style={{ color }}>{app._sc.total}</p>
                        </div>
                      </div>

                      <div className="hidden md:block w-24 shrink-0">
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>

                      {app.cvUrl && (
                        <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#c8a96e]/25 text-[#c8a96e]/60 hover:text-[#c8a96e] hover:border-[#c8a96e]/50 hover:bg-[#c8a96e]/8 transition-all shrink-0"
                          title={t('admin.downloadCV')}>
                          <Download size={13} />
                        </a>
                      )}
                    </div>
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
