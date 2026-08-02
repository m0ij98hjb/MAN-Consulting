'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { usePurchasingRole } from '@/hooks/usePurchasingRole';
import { ROLES } from '@/lib/purchasingConfig';
import PurchasingNotificationBell from './PurchasingNotificationBell';
import {
  LayoutDashboard, ListChecks, FileText, Building2, Truck, BarChart2, Users, Wallet, Search,
} from 'lucide-react';

/* Site Engineer only ever needs their approval queue + notifications (bell, always shown below).
   Everything else here is Procurement Manager (and Super Admin) territory. */
const ITEMS = [
  { href: '/admin/purchasing',           labelKey: 'purchasing.navDashboard', icon: LayoutDashboard, roles: [ROLES.PROCUREMENT_MANAGER] },
  { href: '/admin/purchasing/requests',  labelKey: 'purchasing.navRequests',  icon: ListChecks },
  { href: '/admin/purchasing/orders',    labelKey: 'purchasing.navOrders',    icon: FileText, roles: [ROLES.PROCUREMENT_MANAGER] },
  { href: '/admin/purchasing/suppliers', labelKey: 'purchasing.navSuppliers', icon: Building2, roles: [ROLES.PROCUREMENT_MANAGER] },
  { href: '/admin/purchasing/warehouse', labelKey: 'purchasing.navWarehouse', icon: Truck, roles: [ROLES.PROCUREMENT_MANAGER] },
  { href: '/admin/purchasing/budgets',   labelKey: 'purchasing.navBudgets',   icon: Wallet, roles: [ROLES.PROCUREMENT_MANAGER] },
  { href: '/admin/purchasing/search',    labelKey: 'purchasing.navSearch',    icon: Search, roles: [ROLES.PROCUREMENT_MANAGER] },
  { href: '/admin/purchasing/reports',   labelKey: 'purchasing.navReports',   icon: BarChart2, roles: [ROLES.PROCUREMENT_MANAGER] },
  { href: '/admin/purchasing/users',     labelKey: 'purchasing.navUsers',     icon: Users, roles: [ROLES.SUPER_ADMIN] },
];

export default function PurchasingSubNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { isRole } = usePurchasingRole();

  const visible = ITEMS.filter(item => !item.roles || isRole(...item.roles) || isRole(ROLES.SUPER_ADMIN));

  return (
    <div className="flex items-center justify-between gap-3 mb-6">
      <div className="flex gap-1.5 p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.07] w-fit overflow-x-auto max-w-full">
        {visible.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-[#c8a96e] text-black' : 'text-white/45 hover:text-white'}`}>
              <Icon size={13} /> {t(labelKey)}
            </Link>
          );
        })}
      </div>
      <PurchasingNotificationBell />
    </div>
  );
}
