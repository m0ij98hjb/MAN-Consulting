'use client';
import { useEffect, useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useConfirm } from '@/context/ConfirmContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import AttachmentsUploader from '@/components/purchasing/AttachmentsUploader';
import { usePurchasingRole } from '@/hooks/usePurchasingRole';
import SupplierPerformanceBadge from '@/components/purchasing/SupplierPerformanceBadge';
import { computeAllSupplierPerformance } from '@/lib/purchasingSupplierPerformance';
import { Loader2, Plus, Pencil, Trash2, X, Star, Building2, RefreshCw } from 'lucide-react';

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#c8a96e]/50 outline-none transition-all';
const labelCls = 'text-[#c8a96e] text-[10px] font-black uppercase tracking-widest block mb-1.5';

function emptySupplier() {
  return { name: '', crNumber: '', taxNumber: '', phone: '', email: '', address: '', specialty: '', rating: '', attachments: [], contracts: [] };
}

function SupplierModal({ supplier, onClose }) {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState(supplier || emptySupplier());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const save = async () => {
    if (!form.name.trim()) return;
    setError('');
    setSaving(true);
    try {
      if (supplier?.id) {
        await updateDoc(doc(db, 'purchasingSuppliers', supplier.id), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'purchasingSuppliers'), { ...form, active: true, createdAt: serverTimestamp() });
      }
      onClose();
    } catch (e) {
      setError(e.message || t('purchasing.actionFailed'));
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg bg-[#111118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-white font-bold text-base">{supplier ? t('purchasing.editSupplier') : t('purchasing.addSupplier')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400">{error}</div>}
          <div><label className={labelCls}>{t('purchasing.supplierName')}</label><input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>{t('purchasing.crNumber')}</label><input className={inputCls} dir="ltr" value={form.crNumber} onChange={e => set('crNumber', e.target.value)} /></div>
            <div><label className={labelCls}>{t('purchasing.taxNumber')}</label><input className={inputCls} dir="ltr" value={form.taxNumber} onChange={e => set('taxNumber', e.target.value)} /></div>
            <div><label className={labelCls}>{t('purchasing.requesterPhone')}</label><input className={inputCls} dir="ltr" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><label className={labelCls}>{t('purchasing.requesterEmail')}</label><input className={inputCls} dir="ltr" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          </div>
          <div><label className={labelCls}>{t('purchasing.supplierAddress')}</label><input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>{t('purchasing.supplierSpecialty')}</label><input className={inputCls} value={form.specialty} onChange={e => set('specialty', e.target.value)} /></div>
            <div><label className={labelCls}>{t('purchasing.supplierRating')}</label><input type="number" min="0" max="5" className={inputCls} dir="ltr" value={form.rating} onChange={e => set('rating', e.target.value)} /></div>
          </div>
          <div>
            <label className={labelCls}>{t('purchasing.supplierAttachmentsContracts')}</label>
            <AttachmentsUploader pathPrefix={`purchasingSuppliers/${supplier?.id || 'new'}`} attachments={form.attachments} onChange={a => set('attachments', a)} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white">{t('admin.back')}</button>
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-black text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : t('purchasing.saveSupplier')}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuppliersContent() {
  const { t, isRTL } = useLanguage();
  const { confirm } = useConfirm();
  const { isRole } = usePurchasingRole();
  const canDelete = isRole('super_admin');
  const [suppliers, setSuppliers] = useState(null);
  const [modalSupplier, setModalSupplier] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');
  const [performance, setPerformance] = useState({});
  const [loadingPerf, setLoadingPerf] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'purchasingSuppliers'), snap => setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  const refreshPerformance = async () => {
    setLoadingPerf(true);
    try { setPerformance(await computeAllSupplierPerformance()); }
    finally { setLoadingPerf(false); }
  };

  useEffect(() => { queueMicrotask(() => { refreshPerformance(); }); }, []);

  const remove = async (id, name) => {
    if (!(await confirm(`${t('admin.delete')} "${name}"?`, { variant: 'danger' }))) return;
    setError('');
    try { await deleteDoc(doc(db, 'purchasingSuppliers', id)); }
    catch (e) { setError(e.message || t('purchasing.actionFailed')); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Building2 size={20} className="text-[#c8a96e]" />{t('purchasing.suppliersMenu')}</h1>
        <div className="flex items-center gap-2">
          <button onClick={refreshPerformance} disabled={loadingPerf} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-white/10 text-white/60 hover:text-white disabled:opacity-50">
            {loadingPerf ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} {t('purchasing.refreshPerformance')}
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}>
            <Plus size={14} /> {t('purchasing.addSupplier')}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400 mb-4">{error}</div>}

      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        {suppliers === null ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="text-[#c8a96e] animate-spin" /></div>
        ) : suppliers.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-16">{t('admin.noResults')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {[t('purchasing.supplierName'), t('purchasing.supplierSpecialty'), t('purchasing.requesterPhone'), t('purchasing.supplierRating'), t('purchasing.performanceCol'), t('admin.actionsCol')].map(h => (
                    <th key={h} className="text-start text-xs text-white/30 font-medium px-5 py-3.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{s.name}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs">{s.specialty || '—'}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs" dir="ltr">{s.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-white/60 text-xs flex items-center gap-1"><Star size={11} className="text-amber-400" />{s.rating || '—'}</td>
                    <td className="px-5 py-3.5">
                      <SupplierPerformanceBadge badge={performance[s.id]?.badge || 'unrated'} score={performance[s.id]?.overallScore} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setModalSupplier(s)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><Pencil size={14} /></button>
                        {canDelete && (
                          <button onClick={() => remove(s.id, s.name)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showAdd || modalSupplier) && (
        <SupplierModal supplier={modalSupplier} onClose={() => { setShowAdd(false); setModalSupplier(null); }} />
      )}
    </div>
  );
}

export default function PurchasingSuppliersPage() {
  return (
    <PurchasingAccessGate allow={['procurement_officer', 'procurement_manager']}>
      <AdminPageLayout><SuppliersContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
