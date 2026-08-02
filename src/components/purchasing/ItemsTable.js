'use client';
import { Plus, Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ITEM_CATEGORIES, ITEM_CATEGORY_LABEL_KEYS } from '@/lib/purchasingConfig';

let rowSeq = 0;
export function blankItem() {
  rowSeq += 1;
  return {
    id: `row_${Date.now()}_${rowSeq}`,
    itemName: '', description: '', category: '', unit: '',
    quantity: '', estimatedPrice: '', suggestedSupplier: '', neededDate: '', notes: '',
  };
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-white/20 focus:border-[#c8a96e]/50 outline-none transition-all';

export default function ItemsTable({ items, onChange, readOnly = false }) {
  const { t, isRTL } = useLanguage();

  const updateRow = (id, field, val) => {
    onChange(items.map(it => (it.id === id ? { ...it, [field]: val } : it)));
  };
  const addRow = () => onChange([...items, blankItem()]);
  const duplicateRow = (idx) => {
    const copy = { ...items[idx], id: blankItem().id };
    onChange([...items.slice(0, idx + 1), copy, ...items.slice(idx + 1)]);
  };
  const removeRow = (idx) => onChange(items.filter((_, i) => i !== idx));
  const moveRow = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const lineTotal = (it) => Math.max(0, Number(it.quantity) || 0) * Math.max(0, Number(it.estimatedPrice) || 0);
  const totalQuantity = items.reduce((s, it) => s + Math.max(0, Number(it.quantity) || 0), 0);
  const totalCost = items.reduce((s, it) => s + lineTotal(it), 0);

  const COLS = [
    { key: 'itemName',          label: t('purchasing.itemName'),          w: 140 },
    { key: 'description',       label: t('purchasing.itemDescription'),   w: 160 },
    { key: 'category',          label: t('purchasing.itemCategory'),      w: 140 },
    { key: 'unit',               label: t('purchasing.itemUnit'),          w: 90  },
    { key: 'quantity',          label: t('purchasing.itemQuantity'),      w: 90  },
    { key: 'estimatedPrice',    label: t('purchasing.itemEstimatedPrice'),w: 110 },
    { key: 'suggestedSupplier', label: t('purchasing.itemSuggestedSupplier'), w: 140 },
    { key: 'neededDate',        label: t('purchasing.itemNeededDate'),    w: 130 },
    { key: 'notes',             label: t('purchasing.itemNotes'),         w: 140 },
  ];

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-xs" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-white/[0.04] border-b border-white/10">
              {COLS.map(c => (
                <th key={c.key} style={{ minWidth: c.w }} className="text-start px-2.5 py-2.5 text-white/40 font-semibold whitespace-nowrap">
                  {c.label}
                </th>
              ))}
              <th className="px-2.5 py-2.5 text-white/40 font-semibold whitespace-nowrap">{t('purchasing.itemLineTotal')}</th>
              {!readOnly && <th className="px-2.5 py-2.5 w-[110px]" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={COLS.length + 2} className="text-center text-white/25 py-6">
                  {t('purchasing.noItemsYet')}
                </td>
              </tr>
            ) : items.map((it, idx) => (
              <tr key={it.id} className="hover:bg-white/[0.02]">
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/80">{it.itemName || '—'}</span> :
                    <input className={inputCls} value={it.itemName} onChange={e => updateRow(it.id, 'itemName', e.target.value)} placeholder={t('purchasing.itemName')} />}
                </td>
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/60">{it.description || '—'}</span> :
                    <input className={inputCls} value={it.description} onChange={e => updateRow(it.id, 'description', e.target.value)} />}
                </td>
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/60">{it.category ? t(ITEM_CATEGORY_LABEL_KEYS[it.category]) : '—'}</span> :
                    <select className={`${inputCls} appearance-none cursor-pointer`} value={it.category} onChange={e => updateRow(it.id, 'category', e.target.value)}>
                      <option value="" className="bg-slate-800">{t('purchasing.selectCategory')}</option>
                      {ITEM_CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{t(ITEM_CATEGORY_LABEL_KEYS[c])}</option>)}
                    </select>}
                </td>
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/60">{it.unit || '—'}</span> :
                    <input className={inputCls} value={it.unit} onChange={e => updateRow(it.id, 'unit', e.target.value)} />}
                </td>
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/80">{it.quantity || 0}</span> :
                    <input type="number" min="0" className={inputCls} value={it.quantity} onChange={e => updateRow(it.id, 'quantity', e.target.value)} />}
                </td>
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/80" dir="ltr">{Number(it.estimatedPrice || 0).toLocaleString()}</span> :
                    <input type="number" min="0" className={inputCls} value={it.estimatedPrice} onChange={e => updateRow(it.id, 'estimatedPrice', e.target.value)} dir="ltr" />}
                </td>
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/60">{it.suggestedSupplier || '—'}</span> :
                    <input className={inputCls} value={it.suggestedSupplier} onChange={e => updateRow(it.id, 'suggestedSupplier', e.target.value)} />}
                </td>
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/60" dir="ltr">{it.neededDate || '—'}</span> :
                    <input type="date" className={inputCls} value={it.neededDate} onChange={e => updateRow(it.id, 'neededDate', e.target.value)} dir="ltr" />}
                </td>
                <td className="p-1.5">
                  {readOnly ? <span className="px-1 text-white/60">{it.notes || '—'}</span> :
                    <input className={inputCls} value={it.notes} onChange={e => updateRow(it.id, 'notes', e.target.value)} />}
                </td>
                <td className="px-2.5 text-[#c8a96e] font-bold whitespace-nowrap" dir="ltr">
                  {lineTotal(it).toLocaleString()}
                </td>
                {!readOnly && (
                  <td className="p-1.5">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveRow(idx, -1)} disabled={idx === 0} className="p-1 rounded text-white/30 hover:text-white disabled:opacity-20" title={t('purchasing.moveUp')}><ArrowUp size={13} /></button>
                      <button type="button" onClick={() => moveRow(idx, 1)} disabled={idx === items.length - 1} className="p-1 rounded text-white/30 hover:text-white disabled:opacity-20" title={t('purchasing.moveDown')}><ArrowDown size={13} /></button>
                      <button type="button" onClick={() => duplicateRow(idx)} className="p-1 rounded text-white/30 hover:text-[#c8a96e]" title={t('purchasing.duplicateItem')}><Copy size={13} /></button>
                      <button type="button" onClick={() => removeRow(idx)} className="p-1 rounded text-white/30 hover:text-red-400" title={t('purchasing.removeItem')}><Trash2 size={13} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="bg-white/[0.03] border-t border-white/10 font-bold">
                <td colSpan={4} className="px-2.5 py-2.5 text-white/50">{t('purchasing.totals')}</td>
                <td className="px-2.5 py-2.5 text-white" dir="ltr">{totalQuantity.toLocaleString()}</td>
                <td colSpan={3} />
                <td className="px-2.5 py-2.5 text-[#c8a96e]" dir="ltr">{totalCost.toLocaleString()}</td>
                {!readOnly && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {!readOnly && (
        <button type="button" onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#c8a96e] border border-[#c8a96e]/30 hover:bg-[#c8a96e]/10 transition-all">
          <Plus size={14} /> {t('purchasing.addItem')}
        </button>
      )}
    </div>
  );
}

export function computeItemTotals(items) {
  const totalQuantity = items.reduce((s, it) => s + Math.max(0, Number(it.quantity) || 0), 0);
  const totalEstimatedCost = items.reduce((s, it) => s + Math.max(0, Number(it.quantity) || 0) * Math.max(0, Number(it.estimatedPrice) || 0), 0);
  return { totalQuantity, totalEstimatedCost };
}
