'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ACTIVITY_TYPES, ACTIVITY_KEYS } from '@/lib/suppliersConfig';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Search, Building2, Phone, MapPin, Mail, Briefcase, Eye, X } from 'lucide-react';
import Link from 'next/link';

export default function ApprovedSuppliersPage() {
  const { t, isRTL } = useLanguage();
  const getAct = (name) => name && (t('activities.' + ACTIVITY_KEYS[name]) || name);
  const [suppliers, setSuppliers]   = useState([]);
  const [search, setSearch]         = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [cities, setCities]         = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'suppliers'), where('status', '==', 'approved'));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSuppliers(docs);
      setCities([...new Set(docs.map(d => d.city).filter(Boolean))].sort());
    });
    return unsub;
  }, []);

  const visible = suppliers.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.companyName?.toLowerCase().includes(q) ||
      s.contactName?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q);
    const matchActivity = !filterActivity || s.activity === filterActivity;
    const matchCity     = !filterCity     || s.city === filterCity;
    return matchSearch && matchActivity && matchCity;
  });

  const clearFilters = () => { setSearch(''); setFilterActivity(''); setFilterCity(''); };
  const hasFilters = search || filterActivity || filterCity;

  return (
    <AdminPageLayout>
      <div className="p-6 lg:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{t('admin.approvedMenu')}</h1>
          <p className="text-sm text-white/40 mt-1">
            <strong className="text-[#c8a96e]">{suppliers.length}</strong>{' '}
            {t('admin.approved').toLowerCase()}
            {hasFilters && <> · <strong className="text-white/60">{visible.length}</strong></>}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
          <div className={`relative flex-1 min-w-[200px] max-w-sm`}>
            <Search size={15} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.searchPlaceholder')}
              className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8a96e]/40`}
            />
          </div>
          <select
            value={filterActivity}
            onChange={e => setFilterActivity(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#c8a96e]/40 cursor-pointer"
          >
            <option value="">{t('admin.allActivities')}</option>
            {ACTIVITY_TYPES.map(a => <option key={a} value={a} className="bg-[#111]">{getAct(a)}</option>)}
          </select>
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#c8a96e]/40 cursor-pointer"
          >
            <option value="">{t('admin.allCities')}</option>
            {cities.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              <X size={13} /> {t('admin.clearFilters')}
            </button>
          )}
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <div className="text-center py-20 text-white/30 text-sm">
            {suppliers.length === 0 ? t('admin.noApproved') : t('admin.noResultsFiltered')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map(s => (
              <Link
                key={s.id}
                href={`/admin/suppliers/${s.id}`}
                className="group bg-white/[0.02] border border-white/[0.07] hover:border-[#c8a96e]/30 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#c8a96e]/10 flex items-center justify-center">
                    <Building2 size={18} className="text-[#c8a96e]" />
                  </div>
                  <Eye size={14} className="text-white/20 group-hover:text-white/50 mt-1 transition-colors" />
                </div>

                <h3 className="text-sm font-semibold text-white mb-0.5 truncate">{s.companyName}</h3>
                <p className="text-xs text-white/40 mb-3">{s.contactName}</p>

                {s.activity && (
                  <div className="flex items-center gap-1.5 text-xs text-[#c8a96e]/70 mb-3">
                    <Briefcase size={11} /> {getAct(s.activity)}
                  </div>
                )}

                <div className="space-y-1.5 border-t border-white/[0.06] pt-3">
                  {s.city && (
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <MapPin size={11} /> {s.city}{s.country ? `, ${s.country}` : ''}
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-white/40" dir="ltr">
                      <Phone size={11} /> {s.phone}
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-1.5 text-xs text-white/40 truncate">
                      <Mail size={11} /> <span className="truncate">{s.email}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
