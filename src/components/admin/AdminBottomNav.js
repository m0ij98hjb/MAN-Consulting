'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { LayoutDashboard, Users, CheckCircle, BarChart2, LogOut, Briefcase, MessageSquare, ShoppingCart, PenSquare, Camera, UserCog, Award, Settings, Calculator, FileText } from 'lucide-react';

// Icon mapping
const ICON_MAP = {
  LayoutDashboard,
  Users,
  CheckCircle,
  BarChart2,
  Briefcase,
  PenSquare,
  Camera,
  UserCog,
  MessageSquare,
  ShoppingCart,
  Award,
  Settings,
  Calculator,
  FileText,
};

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { t }    = useLanguage();
  const { logout } = useAuth();
  const { getNavigation } = useRoleAccess();

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };
  
  // Get navigation items based on user role
  const navigationItems = getNavigation();

  return (
    <>
      {/* Spacer — 72px content + safe area */}
      <div className="lg:hidden print:hidden" style={{ height: 'calc(72px + env(safe-area-inset-bottom))' }} aria-hidden="true" />

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-[95] print:hidden"
        style={{
          background: 'rgba(5,5,8,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(201,163,77,0.28)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.7)',
          /* safe-area padding BELOW the 72px content row */
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* 72px fixed-height content row */}
        <div className="flex" style={{ height: '72px' }}>

          {/* Nav links */}
          {navigationItems.map(({ href, label, icon: iconName }) => {
            const Icon = ICON_MAP[iconName];
            const active    = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center flex-1 gap-1.5 transition-all duration-150 active:scale-95 relative px-1"
              >
                {/* Active top indicator */}
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg,transparent,#C9A34D,transparent)' }}
                  />
                )}
                {Icon && (
                  <Icon
                    size={active ? 20 : 18}
                    style={{ color: active ? '#C9A34D' : 'rgba(255,255,255,0.65)', transition: 'all 0.2s' }}
                  />
                )}
                <span
                  className="text-[10px] font-bold leading-tight text-center w-full"
                  style={{ color: active ? '#C9A34D' : 'rgba(255,255,255,0.65)' }}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 gap-1.5 transition-all duration-150 active:scale-95 px-1"
          >
            <LogOut size={18} style={{ color: 'rgba(248,113,113,0.75)' }} />
            <span
              className="text-[10px] font-bold leading-tight text-center w-full"
              style={{ color: 'rgba(248,113,113,0.75)' }}
            >
              {t('admin.logout')}
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}
