'use client';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ACTIVITY_TYPES, ACTIVITY_KEYS, COUNTRIES_KEYS } from '@/lib/suppliersConfig';
import { useLanguage } from '@/context/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import { uploadAsset } from '@/lib/cloudinary';
import {
  Building2, User, Phone, Mail, MapPin, Globe, ChevronDown,
  Send, CheckCircle2, Loader2, Briefcase, FileText,
  Clock, MessageSquare, Tag, Upload, X, DollarSign, PackageCheck,
} from 'lucide-react';

const COUNTRIES = [
  'Saudi Arabia', 'United Arab Emirates', 'Kuwait', 'Qatar', 'Bahrain',
  'Oman', 'Egypt', 'Jordan', 'Lebanon', 'Iraq', 'Other',
];

async function uploadToCloudinary(file) {
  const { url } = await uploadAsset(file, {
    resourceType: 'auto',
    preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  });
  return url;
}

export default function SuppliersPage() {
  const { t, isRTL } = useLanguage();
  const [form, setForm] = useState({
    companyName: '', contactName: '', phone: '', email: '',
    city: '', country: '', website: '',
    activity: '',
    description: '', brands: '', coverageArea: '', deliveryTime: '',
    priceLevel: '', supplyCapacity: '', notes: '',
  });
  const [docFile, setDocFile]         = useState(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
    setSubmitError('');
  };

  const validate = () => {
    const e = {};
    const req = t('suppliers.required');
    if (!form.companyName.trim()) e.companyName = req;
    if (!form.contactName.trim()) e.contactName = req;
    if (!form.phone.trim())       e.phone       = req;
    if (!form.email.trim())       e.email       = req;
    if (!form.city.trim())        e.city        = req;
    if (!form.country)            e.country     = req;
    if (!form.activity)           e.activity    = req;
    if (!form.description.trim()) e.description = req;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      let documentUrl = '';
      if (docFile) {
        documentUrl = await uploadToCloudinary(docFile);
      }
      await addDoc(collection(db, 'suppliers'), {
        ...form,
        documentUrl,
        status:     'new',
        createdAt:  serverTimestamp(),
        adminNotes: '',
        reviewedAt: null,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('[Suppliers form] Error:', err?.code, err?.message, err);
      setSubmitError(t('suppliers.errorPrefix') + ' ' + (err?.message || t('suppliers.tryAgain')));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setDocFile(null);
    setForm({
      companyName:'', contactName:'', phone:'', email:'',
      city:'', country:'', website:'',
      activity:'',
      description:'', brands:'', coverageArea:'', deliveryTime:'',
      priceLevel:'', supplyCapacity:'', notes:'',
    });
    setErrors({});
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setDocFile(file);
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setDocFile(file);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-white font-cairo" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#0f172a]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #D5B25D 0px, #D5B25D 1px, transparent 1px, transparent 80px)' }}
        />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-secondary to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-secondary/30 rounded-full px-5 py-2 mb-6" data-aos="fade-up">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-xs font-bold tracking-widest uppercase">
              {t('suppliers.portalBadge')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight" data-aos="fade-up" data-aos-delay="100">
            {t('suppliers.portalTitle')}
          </h1>

          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" data-aos="fade-up" data-aos-delay="200">
            {t('suppliers.portalDesc')}
          </p>
        </div>
      </section>

      {/* ── Form Section ── */}
      <section className="py-16 sm:py-24 bg-[var(--card-bg)]">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

          {submitted ? (
            <div className="text-center py-20" data-aos="zoom-in">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 mb-8">
                <CheckCircle2 size={44} className="text-green-400" />
              </div>
              <h2 className="text-3xl font-black text-white mb-4">
                {t('suppliers.successTitle')}
              </h2>
              <p className="text-white/60 text-base max-w-md mx-auto leading-relaxed mb-10">
                {t('suppliers.successDesc')}
              </p>
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-3 bg-[var(--secondary)] hover:bg-[#E1BF67] text-black font-black px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(213,178,93,0.3)]"
              >
                {t('suppliers.submitAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              {/* 01 — Company Information */}
              <FormSection icon={Building2} title={t('suppliers.sectionCompany')} badge="01" data-aos="fade-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label={t('suppliers.companyName')} required error={errors.companyName}>
                    <input value={form.companyName} onChange={e => set('companyName', e.target.value)} className={inputCls(errors.companyName)} />
                  </FormField>
                  <FormField label={t('suppliers.contactPerson')} required error={errors.contactName}>
                    <input value={form.contactName} onChange={e => set('contactName', e.target.value)} className={inputCls(errors.contactName)} />
                  </FormField>
                  <FormField label={t('suppliers.phone')} required error={errors.phone}>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+966 5x xxx xxxx" dir="ltr" className={inputCls(errors.phone)} />
                  </FormField>
                  <FormField label={t('suppliers.email')} required error={errors.email}>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@company.com" dir="ltr" className={inputCls(errors.email)} />
                  </FormField>
                  <FormField label={t('suppliers.city')} required error={errors.city}>
                    <input value={form.city} onChange={e => set('city', e.target.value)} className={inputCls(errors.city)} />
                  </FormField>
                  <FormField label={t('suppliers.country')} required error={errors.country}>
                    <div className="relative">
                      <select value={form.country} onChange={e => set('country', e.target.value)} className={`${inputCls(errors.country)} appearance-none cursor-pointer pe-10`}>
                        <option value=""></option>
                        {COUNTRIES.map(c => (
                          <option key={c} value={c} className="bg-black">
                            {t('countries.' + COUNTRIES_KEYS[c])}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none`} />
                    </div>
                  </FormField>
                  <FormField label={`${t('suppliers.website')} ${t('suppliers.websiteOptional')}`} className="md:col-span-2">
                    <div className="relative">
                      <Globe size={15} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
                      <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://www.company.com" dir="ltr" className={`${inputCls()} ${isRTL ? 'pr-10' : 'pl-10'}`} />
                    </div>
                  </FormField>
                </div>
              </FormSection>

              {/* 02 — Business Activity */}
              <FormSection icon={Briefcase} title={t('suppliers.sectionActivity')} badge="02" className="mt-8" data-aos="fade-up" data-aos-delay="100">
                <FormField label={t('suppliers.activityType')} required error={errors.activity}>
                  <div className="relative">
                    <select value={form.activity} onChange={e => set('activity', e.target.value)} className={`${inputCls(errors.activity)} appearance-none cursor-pointer pe-10`}>
                      <option value="">{t('suppliers.selectActivity')}</option>
                      {ACTIVITY_TYPES.map(a => (
                          <option key={a} value={a} className="bg-black">
                            {t('activities.' + ACTIVITY_KEYS[a])}
                          </option>
                        ))}
                    </select>
                    <ChevronDown size={16} className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none`} />
                  </div>
                </FormField>
              </FormSection>

              {/* 03 — Offer Details */}
              <FormSection icon={FileText} title={t('suppliers.sectionOffer')} badge="03" className="mt-8" data-aos="fade-up" data-aos-delay="200">
                <div className="space-y-5">
                  <FormField label={t('suppliers.descriptionLabel')} required error={errors.description}>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className={`${inputCls(errors.description)} resize-none`} />
                  </FormField>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label={t('suppliers.brands')}>
                      <div className="relative">
                        <Tag size={15} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
                        <input value={form.brands} onChange={e => set('brands', e.target.value)} className={`${inputCls()} ${isRTL ? 'pr-10' : 'pl-10'}`} />
                      </div>
                    </FormField>
                    <FormField label={t('suppliers.coverageArea')}>
                      <div className="relative">
                        <MapPin size={15} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
                        <input value={form.coverageArea} onChange={e => set('coverageArea', e.target.value)} className={`${inputCls()} ${isRTL ? 'pr-10' : 'pl-10'}`} />
                      </div>
                    </FormField>
                    <FormField label={t('suppliers.deliveryTime')}>
                      <div className="relative">
                        <Clock size={15} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
                        <input value={form.deliveryTime} onChange={e => set('deliveryTime', e.target.value)} className={`${inputCls()} ${isRTL ? 'pr-10' : 'pl-10'}`} />
                      </div>
                    </FormField>
                    <FormField label={t('suppliers.priceLevel')}>
                      <div className="relative">
                        <DollarSign size={15} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
                        <select value={form.priceLevel} onChange={e => set('priceLevel', e.target.value)}
                          className={`${inputCls()} ${isRTL ? 'pr-10' : 'pl-10'} appearance-none cursor-pointer`}>
                          <option value="" className="bg-[#0a0a14]">--</option>
                          <option value="low"  className="bg-[#0a0a14]">{t('suppliers.priceLow')}</option>
                          <option value="mid"  className="bg-[#0a0a14]">{t('suppliers.priceMid')}</option>
                          <option value="high" className="bg-[#0a0a14]">{t('suppliers.priceHigh')}</option>
                        </select>
                        <ChevronDown size={13} className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
                      </div>
                    </FormField>
                    <FormField label={t('suppliers.supplyCapacity')}>
                      <div className="relative">
                        <PackageCheck size={15} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/30 pointer-events-none`} />
                        <input value={form.supplyCapacity} onChange={e => set('supplyCapacity', e.target.value)}
                          placeholder={t('suppliers.supplyCapacityPlaceholder')}
                          className={`${inputCls()} ${isRTL ? 'pr-10' : 'pl-10'}`} />
                      </div>
                    </FormField>
                  </div>
                  <FormField label={t('suppliers.notes')}>
                    <div className="relative">
                      <MessageSquare size={15} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-4 text-white/30 pointer-events-none`} />
                      <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={`${inputCls()} resize-none ${isRTL ? 'pr-10' : 'pl-10'}`} />
                    </div>
                  </FormField>
                </div>
              </FormSection>

              {/* 04 — Company Document (Cloudinary) */}
              <FormSection icon={Upload} title={`${t('suppliers.docUpload')} ${t('suppliers.websiteOptional')}`} badge="04" className="mt-8" data-aos="fade-up" data-aos-delay="300">
                <p className="text-white/35 text-xs mb-4 leading-relaxed">
                  {t('suppliers.docUploadHint')}
                </p>

                {docFile ? (
                  /* File selected — show info + remove button */
                  <div className="flex items-center gap-4 bg-secondary/8 border border-secondary/25 rounded-2xl px-5 py-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{docFile.name}</p>
                      <p className="text-secondary text-xs mt-0.5 font-bold">
                        {t('suppliers.docUploaded')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocFile(null)}
                      className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('supplierDocInput').click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                      ${isDragging
                        ? 'border-secondary bg-secondary/10 scale-[1.01]'
                        : 'border-white/12 hover:border-secondary/35 hover:bg-white/3'
                      }`}
                  >
                    <input
                      id="supplierDocInput"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Upload size={22} className="text-white/30" />
                      </div>
                      <p className="text-white/40 text-sm font-medium">
                        {t('suppliers.docUploadHint')}
                      </p>
                      <p className="text-white/20 text-xs">PDF, JPG, PNG</p>
                    </div>
                  </div>
                )}
              </FormSection>

              {submitError && (
                <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-sm text-red-400 text-center">
                  {submitError}
                </div>
              )}

              <div className="mt-8 text-center" data-aos="fade-up">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-3 bg-[var(--secondary)] hover:bg-[#E1BF67] disabled:opacity-60 disabled:cursor-not-allowed text-black font-black px-12 py-4 rounded-full text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(213,178,93,0.3)]"
                >
                  {submitting ? (
                    <><Loader2 size={20} className="animate-spin" />
                      {docFile ? t('suppliers.docUploading') : t('suppliers.submitting')}</>
                  ) : (
                    <><Send size={20} /> {t('suppliers.submit')}</>
                  )}
                </button>
                <p className="text-white/30 text-xs mt-4">{t('suppliers.fieldsRequired')}</p>
              </div>
            </form>
          )}

        </div>
      </section>
    </main>
  );
}

function FormSection({ icon: Icon, title, badge, children, className = '', ...rest }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden group ${className}`} {...rest}>
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors duration-700 pointer-events-none" />
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-secondary" />
        </div>
        <div>
          <span className="text-secondary/50 text-[10px] font-bold tracking-widest uppercase">{badge}</span>
          <h3 className="text-white font-black text-lg leading-tight">{title}</h3>
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function FormField({ label, required, error, children, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-bold text-secondary/80 px-1 uppercase tracking-wider">
        {label}{required ? ' *' : ''}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs px-1">{error}</p>}
    </div>
  );
}

function inputCls(error) {
  return `w-full bg-black/40 border rounded-xl px-4 py-3.5 text-sm text-white focus:bg-black/60 outline-none transition-all duration-300 shadow-sm placeholder:text-white/25
    ${error
      ? 'border-red-500/40 focus:border-red-500/60'
      : 'border-white/10 focus:border-[var(--secondary)]'
    }`;
}
