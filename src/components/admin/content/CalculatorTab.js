'use client';
import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { loadSiteContent, saveSiteContent } from '@/lib/siteContent';
import { Field, Section, SaveBtn, TabLoading } from './Shared';
import { useLanguage } from '@/context/LanguageContext';

const DEF_RATES = {
  residential_building:      { economic: 2200, standard: 2500, premium: 3000, ultra: 3500 },
  villa:                     { economic: 3500, standard: 4000, premium: 4500, ultra: 5000 },
  commercial_residential:    { economic: 2000, standard: 2200, premium: 2400, ultra: 2600 },
  commercial_administrative: { economic: 2400, standard: 2800, premium: 3200, ultra: 3600 },
  hotel:       { "3_star": 3500, "4_star": 4000, "5_star": 4500 },
  factory:     { economic: 2500, standard: 3000 },
  warehouse:   { economic: 1800, standard: 2000 },
};

const TYPE_LABEL_KEYS   = { residential_building: 'admin.contentTabs.calculatorTab.typeResidentialBuilding', villa: 'admin.contentTabs.calculatorTab.typeVilla', commercial_residential: 'admin.contentTabs.calculatorTab.typeCommercialResidential', commercial_administrative: 'admin.contentTabs.calculatorTab.typeCommercialAdministrative' };
const QUALITY_LABEL_KEYS = { economic: 'admin.contentTabs.calculatorTab.qualityEconomic', standard: 'admin.contentTabs.calculatorTab.qualityStandard', premium: 'admin.contentTabs.calculatorTab.qualityPremium', ultra: 'admin.contentTabs.calculatorTab.qualityUltra' };
const HOTEL_RATING_LABEL_KEYS = { "3_star": 'admin.contentTabs.calculatorTab.hotelRating3', "4_star": 'admin.contentTabs.calculatorTab.hotelRating4', "5_star": 'admin.contentTabs.calculatorTab.hotelRating5' };
const INDUSTRIAL_TYPE_LABEL_KEYS = { factory: 'admin.contentTabs.calculatorTab.typeFactory', warehouse: 'admin.contentTabs.calculatorTab.typeWarehouse' };
const INDUSTRIAL_QUALITY_LABEL_KEYS = { economic: 'admin.contentTabs.calculatorTab.qualityEconomic', standard: 'admin.contentTabs.calculatorTab.qualityStandard' };

export default function CalculatorTab() {
  const { t } = useLanguage();
  const [rates, setRates]     = useState(DEF_RATES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    loadSiteContent('calculator').then(d => {
      if (d.rates) setRates(d.rates);
      setLoading(false);
    });
  }, []);

  const setRate = (type, quality, val) => {
    setRates(p => ({ ...p, [type]: { ...p[type], [quality]: Number(val) } }));
  };

  const save = async () => {
    setSaving(true);
    try { await saveSiteContent('calculator', { rates }); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    finally { setSaving(false); }
  };

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-5 max-w-2xl">
      <Section title={t('admin.contentTabs.calculatorTab.residentialSectionTitle')} icon={Calculator}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-start text-[11px] text-white/35 font-semibold pb-3 pe-3">{t('admin.contentTabs.calculatorTab.typeColumnHeader')}</th>
                {Object.keys(QUALITY_LABEL_KEYS).map(q => (
                  <th key={q} className="text-center text-[11px] text-white/35 font-semibold pb-3 px-2">{t(QUALITY_LABEL_KEYS[q])}</th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-2">
              {Object.keys(TYPE_LABEL_KEYS).map(type => (
                <tr key={type}>
                  <td className="pe-3 pb-3">
                    <span className="text-xs font-bold text-white/60">{t(TYPE_LABEL_KEYS[type])}</span>
                  </td>
                  {Object.keys(QUALITY_LABEL_KEYS).map(q => (
                    <td key={q} className="px-2 pb-3">
                      <input
                        type="number"
                        value={rates[type]?.[q] ?? 0}
                        onChange={e => setRate(type, q, e.target.value)}
                        className="w-full px-2 py-2 rounded-lg text-center text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none transition-colors"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-white/20 mt-2">{t('admin.contentTabs.calculatorTab.residentialFootnote')}</p>
      </Section>

      <Section title={t('admin.contentTabs.calculatorTab.hotelSectionTitle')} icon={Calculator}>
        <div className="grid grid-cols-3 gap-3">
          {Object.keys(HOTEL_RATING_LABEL_KEYS).map(rating => (
            <div key={rating}>
              <label className="block text-[11px] text-white/35 font-semibold mb-2 text-center">{t(HOTEL_RATING_LABEL_KEYS[rating])}</label>
              <input
                type="number"
                value={rates.hotel?.[rating] ?? 0}
                onChange={e => setRate('hotel', rating, e.target.value)}
                className="w-full px-2 py-2 rounded-lg text-center text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/20 mt-2">{t('admin.contentTabs.calculatorTab.hotelFootnote')}</p>
      </Section>

      <Section title={t('admin.contentTabs.calculatorTab.industrialSectionTitle')} icon={Calculator}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-start text-[11px] text-white/35 font-semibold pb-3 pe-3">{t('admin.contentTabs.calculatorTab.typeColumnHeader')}</th>
                {Object.keys(INDUSTRIAL_QUALITY_LABEL_KEYS).map(q => (
                  <th key={q} className="text-center text-[11px] text-white/35 font-semibold pb-3 px-2">{t(INDUSTRIAL_QUALITY_LABEL_KEYS[q])}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(INDUSTRIAL_TYPE_LABEL_KEYS).map(type => (
                <tr key={type}>
                  <td className="pe-3 pb-3">
                    <span className="text-xs font-bold text-white/60">{t(INDUSTRIAL_TYPE_LABEL_KEYS[type])}</span>
                  </td>
                  {Object.keys(INDUSTRIAL_QUALITY_LABEL_KEYS).map(q => (
                    <td key={q} className="px-2 pb-3">
                      <input
                        type="number"
                        value={rates[type]?.[q] ?? 0}
                        onChange={e => setRate(type, q, e.target.value)}
                        className="w-full px-2 py-2 rounded-lg text-center text-sm text-white bg-white/[0.04] border border-white/10 focus:border-[#c8a96e]/50 focus:outline-none transition-colors"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-white/20 mt-2">{t('admin.contentTabs.calculatorTab.industrialFootnote')}</p>
      </Section>

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </div>
  );
}
