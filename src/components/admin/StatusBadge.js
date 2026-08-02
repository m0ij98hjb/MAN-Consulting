'use client';
import { STATUS_CONFIG } from '@/lib/suppliersConfig';
import { useLanguage } from '@/context/LanguageContext';

const STATUS_LABEL_KEYS = {
  new:          'admin.statusNew',
  under_review: 'admin.statusUnderReview',
  approved:     'admin.statusApproved',
  rejected:     'admin.statusRejected',
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  const { t } = useLanguage();
  const labelKey = STATUS_LABEL_KEYS[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {labelKey ? t(labelKey) : cfg.label}
    </span>
  );
}
