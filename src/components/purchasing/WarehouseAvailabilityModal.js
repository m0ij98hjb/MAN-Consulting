'use client';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2, X, Boxes } from 'lucide-react';

/**
 * Shown before a Purchase Order is created when some requested items
 * already exist in warehouse stock. Lets procurement choose, per item:
 * issue fully from warehouse, split partial/purchase, or buy the full amount.
 */
export default function WarehouseAvailabilityModal({ availability, onConfirm, onClose, busy }) {
  const { t, isRTL } = useLanguage();
  const [issueQty, setIssueQty] = useState(() => Object.fromEntries(availability.map(a => [a.itemId, a.suggestedIssueQty])));

  const setQty = (itemId, max, val) => {
    const n = Math.max(0, Math.min(max, Number(val) || 0));
    setIssueQty(q => ({ ...q, [itemId]: n }));
  };

  const confirm = () => {
    onConfirm(availability.map(a => ({ ...a, issueQty: issueQty[a.itemId] || 0 })));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl bg-[#111118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-white font-bold text-base flex items-center gap-2"><Boxes size={17} className="text-[#c8a96e]" />{t('purchasing.warehouseAvailabilityTitle')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs text-white/40">{t('purchasing.warehouseAvailabilityDesc')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {[t('purchasing.itemName'), t('purchasing.colRequestedQty'), t('purchasing.quantityOnHand'), t('purchasing.issueFromWarehouseQty'), t('purchasing.toPurchaseQty')].map(h => (
                    <th key={h} className="text-start text-white/30 font-medium px-3 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {availability.map(a => (
                  <tr key={a.itemId}>
                    <td className="px-3 py-2.5 text-white font-medium">{a.itemName}</td>
                    <td className="px-3 py-2.5 text-white/60" dir="ltr">{a.requestedQty}</td>
                    <td className="px-3 py-2.5 text-white/60" dir="ltr">{a.onHand}</td>
                    <td className="px-3 py-2.5">
                      <input type="number" min="0" max={Math.min(a.requestedQty, a.onHand)} dir="ltr"
                        value={issueQty[a.itemId]} onChange={e => setQty(a.itemId, Math.min(a.requestedQty, a.onHand), e.target.value)}
                        disabled={a.onHand <= 0}
                        className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white disabled:opacity-30" />
                    </td>
                    <td className="px-3 py-2.5 text-amber-300 font-bold" dir="ltr">{Math.max(0, a.requestedQty - (issueQty[a.itemId] || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white">{t('admin.back')}</button>
          <button onClick={confirm} disabled={busy} className="flex-1 py-2.5 rounded-xl text-black text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : t('purchasing.confirmAndContinue')}
          </button>
        </div>
      </div>
    </div>
  );
}
