'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Eye, EyeOff, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

/* Deterministic star grid — same on server + client (no hydration mismatch) */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id:      i,
  x:       ((i * 41 + 17) % 97) + 1.5,
  y:       ((i * 59 + 11) % 93) + 2,
  size:    (i % 4) * 0.5 + 0.6,
  opacity: ((i % 6) * 0.015 + 0.03),
  dur:     ((i % 5) * 0.8 + 2.2).toFixed(1),
  delay:   ((i % 9) * 0.3).toFixed(1),
}));

export default function AdminLoginPage() {
  const { user, login, error, setError } = useAuth();
  const { t, isRTL } = useLanguage();
  const { getDashboard, loading: roleLoading } = useRoleAccess();
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  // Redirect based on role after login
  useEffect(() => {
    if (user && !roleLoading) {
      const dashboard = getDashboard();
      router.replace(dashboard);
    }
  }, [user, roleLoading, router, getDashboard]);

  if (user) { return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#000000' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: var(--op); }
          50%      { opacity: calc(var(--op) * 5); }
        }
        @keyframes logo-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes gold-glow {
          0%,100% { box-shadow: 0 0 40px rgba(213,178,93,0.07), 0 0 0 1px rgba(213,178,93,0.14); }
          50%      { box-shadow: 0 0 70px rgba(213,178,93,0.14), 0 0 0 1px rgba(213,178,93,0.22); }
        }
        .login-input { transition: border-color 0.25s, background 0.25s; }
        .login-input:focus { border-color: rgba(213,178,93,0.38) !important; background: rgba(213,178,93,0.03) !important; outline: none; }
      `}</style>

      {/* ── Stars ── */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top:  `${s.y}%`,
              width:  `${s.size}px`,
              height: `${s.size}px`,
              background: '#D5B25D',
              '--op': s.opacity,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Subtle grid lines ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(213,178,93,1) 1px,transparent 1px),linear-gradient(90deg,rgba(213,178,93,1) 1px,transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── Ambient radial glow ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%,-52%)',
          width: '800px', height: '700px',
          background: 'radial-gradient(ellipse,rgba(213,178,93,0.06) 0%,rgba(15,23,42,0.25) 50%,transparent 70%)',
        }}
      />

      {/* ── Top gold accent line ── */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(213,178,93,0.5) 40%,rgba(225,191,103,0.8) 50%,rgba(213,178,93,0.5) 60%,transparent)' }}
      />

      {/* ── Main card wrapper ── */}
      <div className="relative z-10 w-full max-w-[420px] px-5 py-10">

        {/* Logo section */}
        <div className="flex flex-col items-center mb-8">
          <div style={{ animation: 'logo-float 5s ease-in-out infinite' }} className="mb-6">
            {/* Glow behind logo */}
            <div
              className="absolute -inset-6 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse,rgba(213,178,93,0.12) 0%,transparent 65%)', filter: 'blur(8px)' }}
            />
            <Image
              src="/asstes/logo-navbar.png"
              alt="MNC"
              width={280}
              height={140}
              className="relative h-24 sm:h-28 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 24px rgba(213,178,93,0.25))' }}
              priority
            />
          </div>

          {/* Title badge */}
          <div
            className="flex items-center gap-2 rounded-full px-5 py-2 mb-2"
            style={{ background: 'rgba(213,178,93,0.07)', border: '1px solid rgba(213,178,93,0.2)' }}
          >
            <ShieldCheck size={13} style={{ color: '#D5B25D' }} />
            <span
              className="text-[11px] font-black uppercase tracking-[2px]"
              style={{ color: '#D5B25D' }}
            >
              {t('admin.loginTitle')}
            </span>
          </div>

          <p className="text-[13px] text-white/35 text-center font-medium mt-1">
            {t('admin.loginSubtitle')}
          </p>

          {/* Gold separator */}
          <div className="flex items-center gap-3 mt-5">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg,transparent,rgba(213,178,93,0.3))' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(213,178,93,0.5)' }} />
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg,rgba(213,178,93,0.3),transparent)' }} />
          </div>
        </div>

        {/* ── Form card — glass that blends with black bg ── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 sm:p-8 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(213,178,93,0.16)',
            animation: 'gold-glow 4s ease-in-out infinite',
          }}
        >
          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}
            >
              {t('admin.loginError')}
            </div>
          )}

          {/* Email field */}
          <div>
            <label
              className={`block text-[10px] font-black uppercase tracking-[2px] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              style={{ color: 'rgba(213,178,93,0.55)' }}
            >
              {t('admin.emailLabel')}
            </label>
            <div className="relative">
              <Mail
                size={14}
                className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 pointer-events-none`}
                style={{ color: 'rgba(213,178,93,0.3)' }}
              />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError?.(''); }}
                required
                dir="ltr"
                placeholder="admin@mnc.com"
                className={`login-input w-full rounded-xl py-3.5 text-sm text-white placeholder:text-white/15
                  ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label
              className={`block text-[10px] font-black uppercase tracking-[2px] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
              style={{ color: 'rgba(213,178,93,0.55)' }}
            >
              {t('admin.passwordLabel')}
            </label>
            <div className="relative">
              <Lock
                size={14}
                className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 pointer-events-none`}
                style={{ color: 'rgba(213,178,93,0.3)' }}
              />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError?.(''); }}
                required
                dir="ltr"
                placeholder="••••••••"
                className={`login-input w-full rounded-xl py-3.5 text-sm text-white placeholder:text-white/15
                  ${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 transition-colors duration-200`}
                style={{ color: 'rgba(255,255,255,0.18)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(213,178,93,0.65)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-[13px] font-black tracking-[2.5px] uppercase flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg,#8a6a1e 0%,#D5B25D 40%,#e8c96e 55%,#D5B25D 70%,#8a6a1e 100%)',
              color: '#000',
              boxShadow: '0 4px 24px rgba(213,178,93,0.3)',
              marginTop: '4px',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 32px rgba(213,178,93,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(213,178,93,0.3)'; }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? t('admin.loggingIn') : t('admin.loginBtn')}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center text-[9.5px] font-medium mt-6 uppercase tracking-[3.5px]"
          style={{ color: 'rgba(255,255,255,0.1)' }}
        >
          MNC Construction © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
