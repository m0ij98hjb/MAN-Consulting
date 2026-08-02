'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useDirectorPhoto } from '@/hooks/useDirectorPhoto';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import {
  LayoutDashboard, Users, CheckCircle, BarChart2,
  ChevronRight, ChevronLeft, LogOut, Briefcase, PenSquare,
  Camera, X, Loader2, MessageSquare, ShoppingCart, UserCog,
  Award, Settings, Image as ImageIcon, Calculator, FileText,
} from 'lucide-react';

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
  ImageIcon,
  Calculator,
  FileText,
};

export default function AdminSidebar() {
  const pathname      = usePathname();
  const router        = useRouter();
  const { t, isRTL } = useLanguage();
  const { logout, isSuperAdmin, user } = useAuth();
  const { getNavigation, getRoleLabel, profile, role } = useRoleAccess();
  const directorPhoto = useDirectorPhoto();

  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [isUploading,  setIsUploading]  = useState(false);
  const fileInputRef = useRef(null);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  
  // Get navigation items based on user role
  const navigationItems = getNavigation();
  const roleLabel = getRoleLabel();

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const sRef = storageRef(storage, 'settings/director-photo');
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      await setDoc(doc(db, 'settings', 'director'), { photoURL: url }, { merge: true });
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setIsUploading(false);
      setIsModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 sticky top-[92px] h-[calc(100vh-92px)] overflow-y-auto print:hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderInlineEnd: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Director profile */}
        <div className="flex flex-col items-center px-4 pt-5 pb-4 border-b border-white/[0.06]">
          {/* Photo — click to open modal (director only) */}
          {isSuperAdmin || role === 'super_admin' ? (
            <div
              className="relative w-[72px] h-[72px] rounded-full overflow-hidden mb-3"
              style={{ 
                boxShadow: '0 0 0 2px rgba(200,169,110,0.35), 0 4px 20px rgba(0,0,0,0.5)',
                backgroundColor: 'transparent'
              }}
            >
              <div
                className="absolute inset-0 rounded-full z-10"
                style={{ boxShadow: 'inset 0 0 0 2px rgba(200,169,110,0.25)' }}
              />
              <Image
                src="/asstes/super-admin.jpg"
                alt="Super Admin"
                fill
                sizes="72px"
                className="object-cover object-top"
              />
            </div>
          ) : role === 'company_manager' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative w-[72px] h-[72px] rounded-full overflow-hidden mb-3 group focus:outline-none"
              style={{ boxShadow: '0 0 0 2px rgba(200,169,110,0.35), 0 4px 20px rgba(0,0,0,0.5)' }}
              title={t('admin.changePhoto')}
            >
              <div
                className="absolute inset-0 rounded-full z-10"
                style={{ boxShadow: 'inset 0 0 0 2px rgba(200,169,110,0.25)' }}
              />
              <Image
                src={directorPhoto}
                alt="Director"
                fill
                sizes="72px"
                className="object-cover object-top"
                unoptimized={directorPhoto.startsWith('http')}
              />
              {/* Camera hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
                <Camera size={18} className="text-white" />
              </div>
            </button>
          ) : (
            <div
              className="relative w-[72px] h-[72px] rounded-full overflow-hidden mb-3"
              style={{ 
                boxShadow: '0 0 0 2px rgba(200,169,110,0.35), 0 4px 20px rgba(0,0,0,0.5)',
                backgroundColor: 'transparent'
              }}
            >
              <div
                className="absolute inset-0 rounded-full z-10"
                style={{ boxShadow: 'inset 0 0 0 2px rgba(200,169,110,0.25)' }}
              />
              <Image
                src={profile?.photoURL || "/asstes/ph dashborad.png"}
                alt="User Profile"
                fill
                sizes="72px"
                className="object-cover object-top"
              />
            </div>
          )}

          {/* Role Label */}
          <p className="text-[13px] font-bold text-[#c8a96e] leading-tight text-center">
            {roleLabel}
          </p>
          {/* Gold underline */}
          <div className="mt-2.5 w-8 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-[#c8a96e]/50 to-transparent" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3">
          <div className="space-y-0.5">
            {navigationItems.map(({ href, label, icon: iconName }) => {
              const Icon = ICON_MAP[iconName];
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                    ${active
                      ? 'bg-[#c8a96e]/10 text-[#c8a96e] font-semibold'
                      : 'text-white/45 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {Icon && <Icon size={15} className="shrink-0" />}
                  <span className="flex-1">{label}</span>
                  {active && <ChevronIcon size={12} className="opacity-50 shrink-0" />}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="mt-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-red-400/60 hover:text-red-400 hover:bg-red-500/6 border border-transparent hover:border-red-500/12 transition-all duration-200"
            >
              <LogOut size={15} className="shrink-0" />
              <span>{t('admin.logout')}</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ── Photo modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.72)' }}
          onClick={() => !isUploading && setIsModalOpen(false)}
        >
          <div
            className="relative flex flex-col items-center gap-5 rounded-2xl p-7 w-[260px]"
            style={{
              background: '#0a0e17',
              border: '1px solid rgba(201,163,77,0.22)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isUploading}
              className="absolute top-3 end-3 w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all"
            >
              <X size={13} />
            </button>

            {/* Large photo */}
            <div
              className="relative w-32 h-32 rounded-full overflow-hidden"
              style={{ boxShadow: '0 0 0 2.5px rgba(201,163,77,0.45), 0 8px 32px rgba(0,0,0,0.6)' }}
            >
              <img
                src={directorPhoto}
                alt="Director"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Name */}
            <p className="text-[13px] font-bold text-[#c8a96e] text-center leading-snug">
              {profile?.name || roleLabel}
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 disabled:opacity-60"
              style={{
                background: 'rgba(201,163,77,0.10)',
                border: '1px solid rgba(201,163,77,0.28)',
                color: '#c8a96e',
              }}
            >
              {isUploading
                ? <><Loader2 size={14} className="animate-spin" /> {t('purchasing.uploading')}</>
                : <><Camera size={14} /> {t('admin.changePhoto')}</>
              }
            </button>
          </div>
        </div>
      )}
    </>
  );
}
