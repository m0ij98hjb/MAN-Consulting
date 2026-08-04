'use client';
import { useLanguage } from '@/context/LanguageContext';

const STATUS_CONFIG = {
  new:          { label: 'New',          color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  under_review: { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  approved:     { label: 'Approved',     color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  rejected:     { label: 'Rejected',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

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
