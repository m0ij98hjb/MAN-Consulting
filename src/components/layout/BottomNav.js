'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderOpen, Briefcase, PhoneCall, Users, Smartphone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

const NAV_ITEMS = [
  { key: 'nav.home',     href: '/',                icon: Home },
  { key: 'nav.projects', href: '/projects',        icon: FolderOpen },
  { key: 'nav.services', href: '/#services',       icon: Briefcase },
  { key: 'nav.contact',  href: '/contact',         icon: PhoneCall },
];

export default function BottomNav() {
  const pathname  = usePathname();
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const isLight   = theme === 'dark';

  /* Hide on admin pages */
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Spacer so page content doesn't hide behind the bar */}
      <div className="block lg:hidden h-[62px]" aria-hidden="true" />

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-[95]"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          background: isLight
            ? 'rgba(255,255,255,0.97)'
            : 'rgba(6,6,8,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: isLight
            ? '1px solid rgba(213,178,93,0.18)'
            : '1px solid rgba(213,178,93,0.22)',
          boxShadow: isLight
            ? '0 -4px 24px rgba(0,0,0,0.06)'
            : '0 -4px 32px rgba(0,0,0,0.8)',
          /* Safe area for phones with home indicator */
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-stretch h-[62px]">
          {NAV_ITEMS.map(({ key, href, icon: Icon, special }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href.split('#')[0]));

            if (special) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center flex-1 gap-0.5 active:scale-95 transition-transform duration-150"
                >
                  <span
                    className="flex items-center justify-center w-9 h-7 rounded-xl"
                    style={{
                      background: isActive
                        ? '#D5B25D'
                        : 'linear-gradient(135deg,rgba(213,178,93,0.15),rgba(213,178,93,0.08))',
                    }}
                  >
                    <Icon size={15} style={{ color: isActive ? '#000' : '#D5B25D' }} />
                  </span>
                  <span
                    className="text-[9px] font-black tracking-wide leading-none truncate max-w-[52px] text-center"
                    style={{ color: '#D5B25D' }}
                  >
                    {t(key)}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center flex-1 gap-0.5 active:scale-95 transition-transform duration-150"
              >
                <span className="flex items-center justify-center w-8 h-6">
                  <Icon
                    size={isActive ? 20 : 18}
                    style={{
                      color: isActive
                        ? '#D5B25D'
                        : isLight ? 'rgba(30,41,59,0.4)' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.2s',
                    }}
                  />
                </span>
                <span
                  className="text-[9px] font-bold leading-none truncate max-w-[52px] text-center transition-colors duration-200"
                  style={{
                    color: isActive
                      ? '#D5B25D'
                      : isLight ? 'rgba(30,41,59,0.45)' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {t(key)}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 w-8 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg,transparent,#D5B25D,transparent)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
