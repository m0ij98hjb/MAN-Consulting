'use client';
import { useLanguage } from '@/context/LanguageContext';
import { STATUS_COLORS, STATUS_LABEL_KEYS } from '@/lib/purchasingConfig';

export default function PurchaseStatusBadge({ status }) {
  const { t } = useLanguage();
  const color = STATUS_COLORS[status] || '#6b7280';
  const labelKey = STATUS_LABEL_KEYS[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ color, background: `${color}1e`, border: `1px solid ${color}40` }}
    >
      {labelKey ? t(labelKey) : status}
    </span>
  );
}
