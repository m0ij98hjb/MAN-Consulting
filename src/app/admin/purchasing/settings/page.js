'use client';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import PurchasingAccessGate from '@/components/purchasing/PurchasingAccessGate';
import PurchasingSubNav from '@/components/purchasing/PurchasingSubNav';
import { Settings, Shield, Bell, FileText, CheckCircle2, Save, Layers } from 'lucide-react';

function SettingsContent() {
  const { t, isRTL } = useLanguage();
  const [currency, setCurrency] = useState('SAR');
  const [autoNotify, setAutoNotify] = useState(true);
  const [allowOverStock, setAllowOverStock] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <PurchasingSubNav />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings size={22} className="text-[#c8a96e]" />
            {t('purchasing.settingsPageTitle')}
          </h1>
          <p className="text-xs text-white/40 mt-1">{t('purchasing.settingsPageSubtitle')}</p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          {t('purchasing.settingsSavedMsg')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow Info */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4 text-[#c8a96e] font-bold text-base">
            <Layers size={18} />
            {t('purchasing.currentWorkflowTitle')}
          </div>
          <p className="text-xs text-white/50 leading-relaxed mb-4">
            {t('purchasing.workflowDesc')}
          </p>
          <ol className="space-y-2.5 text-xs text-white/70 list-decimal list-inside bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl">
            <li><span className="font-semibold text-white">{t('purchasing.roleSiteSupervisor')}:</span> {t('purchasing.roleSiteSupervisorDesc')}</li>
            <li><span className="font-semibold text-white">{t('purchasing.roleSiteEngineer')}:</span> {t('purchasing.roleSiteEngineerDesc')}</li>
            <li><span className="font-semibold text-white">{t('purchasing.roleProcurementManager')}:</span> {t('purchasing.roleProcurementManagerDesc')}</li>
          </ol>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 mb-2 text-[#c8a96e] font-bold text-base">
            <FileText size={18} />
            {t('purchasing.currencyWarehouseOptionsTitle')}
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1.5 font-medium">{t('purchasing.baseCurrencyLabel')}</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c8a96e]/50"
            >
              <option value="SAR" className="bg-slate-900">{t('purchasing.currencySAR')}</option>
              <option value="USD" className="bg-slate-900">{t('purchasing.currencyUSD')}</option>
              <option value="EUR" className="bg-slate-900">{t('purchasing.currencyEUR')}</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowOverStock}
                onChange={e => setAllowOverStock(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-[#c8a96e]"
              />
              <span className="text-xs text-white/70">{t('purchasing.allowOverStockLabel')}</span>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 shadow-xl space-y-4 md:col-span-2">
          <div className="flex items-center gap-2.5 mb-2 text-[#c8a96e] font-bold text-base">
            <Bell size={18} />
            {t('purchasing.notifAlertsTitle')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer bg-white/[0.01] border border-white/[0.05] p-3.5 rounded-xl">
              <input
                type="checkbox"
                checked={autoNotify}
                onChange={e => setAutoNotify(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-[#c8a96e]"
              />
              <div>
                <div className="text-xs text-white font-medium">{t('purchasing.instantNotifyPMTitle')}</div>
                <div className="text-[11px] text-white/40">{t('purchasing.instantNotifyPMDesc')}</div>
              </div>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-black hover:opacity-90 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}
            >
              <Save size={14} />
              {t('purchasing.saveSettingsBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchasingSettingsPage() {
  return (
    <PurchasingAccessGate>
      <AdminPageLayout><SettingsContent /></AdminPageLayout>
    </PurchasingAccessGate>
  );
}
