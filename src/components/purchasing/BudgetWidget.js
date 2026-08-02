'use client';
import { useLanguage } from '@/context/LanguageContext';
import { useProjectBudget } from '@/hooks/useProjectBudget';
import { budgetBarColor } from '@/lib/purchasingBudget';
import { Loader2, Wallet, AlertTriangle } from 'lucide-react';

function Stat({ label, value, dir }) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white" dir={dir || 'ltr'}>{Number(value || 0).toLocaleString()}</p>
    </div>
  );
}

export default function BudgetWidget({ projectName }) {
  const { t, isRTL } = useLanguage();
  const { loading, hasBudget, summary } = useProjectBudget(projectName);

  if (loading) {
    return <div className="flex items-center justify-center py-6"><Loader2 size={18} className="animate-spin text-[#c8a96e]" /></div>;
  }
  if (!hasBudget) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 text-xs text-white/30" dir={isRTL ? 'rtl' : 'ltr'}>
        {t('purchasing.noBudgetSetForProject')}
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, summary.consumedPct));
  const color = budgetBarColor(summary.consumedPct);

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="text-xs text-[#c8a96e] font-bold uppercase tracking-widest flex items-center gap-1.5">
        <Wallet size={13} /> {t('purchasing.budgetSectionTitle')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label={t('purchasing.budgetApproved')} value={summary.approvedBudget} />
        <Stat label={t('purchasing.budgetCommitted')} value={summary.committedCost} />
        <Stat label={t('purchasing.budgetActual')} value={summary.actualCost} />
        <Stat label={t('purchasing.budgetRemaining')} value={summary.remaining} />
      </div>
      <div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
        <p className="text-[11px] text-white/30 mt-1.5" dir="ltr">{summary.consumedPct}% {t('purchasing.budgetConsumedLabel')}</p>
      </div>
      {summary.exceeded && (
        <div className="rounded-lg px-3 py-2 text-xs bg-red-500/10 border border-red-500/25 text-red-400 flex items-center gap-2">
          <AlertTriangle size={14} /> {t('purchasing.budgetExceededWarning')}
        </div>
      )}
    </div>
  );
}
