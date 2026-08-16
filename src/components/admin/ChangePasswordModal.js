'use client';
import { useState } from 'react';
import { Key, X, Loader2, Lock, Check } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';

const inputCls = 'w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#F2B233]/50 outline-none transition-all';
const labelCls = 'text-[#F2B233] text-[10px] font-black uppercase tracking-widest block mb-1.5';

export default function ChangePasswordModal({ onClose, targetUser }) {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setError('');
    if (newPassword.length < 6) {
      setError(t('admin.passwordMinLength'));
      return;
    }

    setSaving(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, uid: targetUser.id, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t('admin.changePasswordError'));
      }
      setSuccess(true);
    } catch (e) {
      setError(e.message || t('admin.changePasswordError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)' }}
    >
      <div
        className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F2B233]/15 flex items-center justify-center">
              <Key size={14} className="text-[#F2B233]" />
            </div>
            <h2 className="text-white font-bold text-base">{t('admin.changePasswordTitle')}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400">
              {error}
            </div>
          )}

          {success ? (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm bg-green-500/10 border border-green-500/25 text-green-400">
              <Check size={16} />
              {t('admin.changePasswordSuccess')}
            </div>
          ) : (
            <>
              <p className="text-white/50 text-sm">
                {t('admin.changePasswordFor')} <strong className="text-white">&quot;{targetUser?.name}&quot;</strong>
              </p>
              <div>
                <label className={labelCls}><Lock size={10} className="inline me-1" />{t('admin.newPasswordLabel')}</label>
                <input
                  type="password"
                  dir="ltr"
                  className={inputCls}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={t('admin.minSixCharsPlaceholder')}
                  autoFocus
                />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/25 transition-all"
          >
            {success ? t('admin.okBtn') : t('admin.cancel')}
          </button>
          {!success && (
            <button
              onClick={submit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-black text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg,#8a6a1e,#F2B233,#e8c96e,#F2B233,#8a6a1e)' }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : t('admin.changePasswordBtn')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
