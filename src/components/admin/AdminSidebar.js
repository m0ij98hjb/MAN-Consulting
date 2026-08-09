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
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebaseStorage';
import {
  LayoutDashboard, Users, CheckCircle, BarChart2,
  ChevronRight, ChevronLeft, LogOut, Briefcase, PenSquare,
  Camera, X, Loader2, MessageSquare, UserCog,
  Award, Settings, Image as ImageIcon, FileText,
} from 'lucide-react';

// Icon mapping
const ICON_MAP = {
  LayoutDashboard,
  Users,
  CheckCircle,
  BarChart2,
  Briefcase,
  PenSquare,
  UserCog,
  MessageSquare,
  Award,
  Settings,
  ImageIcon,
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
        className="hidden lg:flex flex-col w-56 shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto print:hidden"
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
                boxShadow: '0 0 0 2px rgba(200,169,110,0.35)',
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
              style={{ boxShadow: '0 0 0 2px rgba(200,169,110,0.35)' }}
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
                boxShadow: '0 0 0 2px rgba(200,169,110,0.35)',
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
          <p className="text-[13px] font-bold text-[#F2B233] leading-tight text-center">
            {roleLabel}
          </p>
          {/* Gold underline */}
          <div className="mt-2.5 w-8 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-[#F2B233]/50 to-transparent" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col">
          <p className="px-2.5 mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/25 select-none">
            {t('admin.menu')}
          </p>
          <div className="space-y-1">
            {navigationItems.map(({ href, label, icon: iconName }) => {
              const Icon = ICON_MAP[iconName];
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium overflow-hidden transition-colors duration-200
                    ${active ? 'text-[#F2B233] font-semibold' : 'text-white/45 hover:text-white'}`}
                >
                  {/* Background fill */}
                  <span
                    className={`absolute inset-0 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-[#F2B233]/14 via-[#F2B233]/[0.06] to-transparent'
                        : 'bg-transparent group-hover:bg-white/[0.05]'
                    }`}
                  />
                  {/* Active side accent bar */}
                  <span
                    className={`absolute inset-y-2 ${isRTL ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'} w-[3px] bg-[#F2B233] transition-opacity duration-200 ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {/* Icon chip */}
                  <span
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-200 ${
                      active ? 'bg-[#F2B233]/15 shadow-[0_0_0_1px_rgba(242,178,51,0.25)]' : 'bg-white/[0.04] group-hover:bg-white/10'
                    }`}
                  >
                    {Icon && <Icon size={14} />}
                  </span>
                  <span className="relative z-10 flex-1 truncate">{label}</span>
                  {active && <ChevronIcon size={12} className="relative z-10 opacity-60 shrink-0" />}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="mt-auto pt-3 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className="group relative w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium text-red-400/60 hover:text-red-400 transition-colors duration-200"
            >
              <span className="absolute inset-0 rounded-xl bg-transparent group-hover:bg-red-500/[0.06] border border-transparent group-hover:border-red-500/15 transition-all duration-200" />
              <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/[0.05] group-hover:bg-red-500/10 shrink-0 transition-all duration-200">
                <LogOut size={14} />
              </span>
              <span className="relative z-10">{t('admin.logout')}</span>
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
            <p className="text-[13px] font-bold text-[#F2B233] text-center leading-snug">
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
                color: '#F2B233',
              }}
            >
              {isUploading
                ? <><Loader2 size={14} className="animate-spin" /> {t('admin.uploading')}</>
                : <><Camera size={14} /> {t('admin.changePhoto')}</>
              }
            </button>
          </div>
        </div>
      )}
    </>
  );
}
