'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { createAdminUser, updateAdminUserPermissions, deleteAdminUser } from '@/lib/adminUserCreation';
import { ROLES, ROLE_LABELS } from '@/lib/roleBasedAccess';
import { useRouter } from 'next/navigation';
import {
  Users, Plus, X, Loader2, Power, ShieldCheck, ShieldOff,
  Building2, Briefcase, MessageSquare, ShoppingCart, BarChart2,
  Check, User, Phone, Mail, Lock, Edit2, Trash2,
} from 'lucide-react';

/* ─── Permission definitions ─── */
const PERMISSION_KEYS = [
  {
    id: 'purchasing_module',
    labelKey: 'admin.purchasingMenu',
    descKey: 'admin.permPurchasingDesc',
    icon: ShoppingCart,
    color: '#c8a96e',
  },
  {
    id: 'suppliers_module',
    labelKey: 'admin.suppliersMenu',
    descKey: 'admin.permSuppliersDesc',
    icon: Building2,
    color: '#a78bfa',
  },
  {
    id: 'jobs_module',
    labelKey: 'admin.jobsMenu',
    descKey: 'admin.permJobsDesc',
    icon: Briefcase,
    color: '#3b82f6',
  },
  {
    id: 'messages_module',
    labelKey: 'admin.messagesMenu',
    descKey: 'admin.permMessagesDesc',
    icon: MessageSquare,
    color: '#10b981',
  },
  {
    id: 'reports_module',
    labelKey: 'admin.reportsMenu',
    descKey: 'admin.permReportsDesc',
    icon: BarChart2,
    color: '#f59e0b',
  },
];

/* ─── Role definitions ─── */
const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([key, label]) => ({
  value: key,
  label: label,
}));

const inputCls = 'w-full bg-black border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#c8a96e]/50 outline-none transition-all';
const labelCls = 'text-[#c8a96e] text-[10px] font-black uppercase tracking-widest block mb-1.5';

/* ─── Add / Edit User Modal ─── */
function UserModal({ onClose, currentUid, editUser = null }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(editUser
    ? { name: editUser.name, phone: editUser.phone || '', jobTitle: editUser.jobTitle || '', department: editUser.department || '' }
    : { name: '', email: '', password: '', phone: '', jobTitle: '', department: '' }
  );
  const [role, setRole] = useState(editUser?.role || ROLES.PROJECT_MANAGER);
  const [permissions, setPermissions] = useState(editUser?.permissions ?? []);
  const [purchasingRole, setPurchasingRole] = useState(editUser?.purchasingRole ?? 'site_supervisor');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (f, v) => setForm(x => ({ ...x, [f]: v }));

  const togglePerm = (id) => setPermissions(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
  );

  const submit = async () => {
    setError('');
    if (!editUser) {
      if (!form.name.trim() || !form.email.trim()) {
        setError(t('admin.nameEmailRequired')); return;
      }
      if ((form.password || '').length < 6) {
        setError(t('admin.passwordMinLength')); return;
      }
    }

    setSaving(true);
    try {
      if (editUser) {
        await updateAdminUserPermissions(editUser.id, {
          ...form,
          role,
          permissions,
          purchasingRole: permissions.includes('purchasing_module') ? purchasingRole : null,
        });
      } else {
        await createAdminUser({
          ...form,
          role,
          permissions,
          purchasingRole: permissions.includes('purchasing_module') ? purchasingRole : null,
          createdByUid: currentUid,
        });
      }
      onClose();
    } catch (e) {
      setError(e.message || t('admin.saveErrorGeneric'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="w-full max-w-xl bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#c8a96e]/15 flex items-center justify-center">
              {editUser ? <Edit2 size={14} className="text-[#c8a96e]" /> : <Plus size={14} className="text-[#c8a96e]" />}
            </div>
            <h2 className="text-white font-bold text-base">
              {editUser ? t('admin.editUserTitle') : t('admin.addUserTitle')}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">{t('admin.basicInfoTitle')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}><User size={10} className="inline me-1" />{t('admin.fullNameLabel')}</label>
                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('admin.fullNamePlaceholder')} />
              </div>
              {!editUser && (
                <>
                  <div>
                    <label className={labelCls}><Mail size={10} className="inline me-1" />{t('admin.emailLabel')}</label>
                    <input type="email" dir="ltr" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@mnc.com" />
                  </div>
                  <div>
                    <label className={labelCls}><Lock size={10} className="inline me-1" />{t('admin.initialPasswordLabel')}</label>
                    <input type="password" dir="ltr" className={inputCls} value={form.password} onChange={e => set('password', e.target.value)} placeholder={t('admin.minSixCharsPlaceholder')} />
                  </div>
                </>
              )}
              <div>
                <label className={labelCls}><Phone size={10} className="inline me-1" />{t('purchasing.requesterPhone')}</label>
                <input dir="ltr" className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+966 5xx xxx xxx" />
              </div>
              <div>
                <label className={labelCls}>{t('purchasing.jobTitle')}</label>
                <input className={inputCls} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder={t('admin.jobTitlePlaceholder')} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>{t('purchasing.department')}</label>
                <input className={inputCls} value={form.department} onChange={e => set('department', e.target.value)} placeholder={t('admin.departmentPlaceholder')} />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">{t('admin.jobAndRoleTitle')}</p>
            <div>
              <label className={labelCls}>{t('purchasing.roleLabel')}</label>
              <select
                className={inputCls}
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                {ROLE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">{t('admin.permissionsAccessTitle')}</p>
            <div className="space-y-2">
              {PERMISSION_KEYS.map(({ id, labelKey, descKey, icon: Icon, color }) => {
                const checked = permissions.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePerm(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-start transition-all duration-200 ${
                      checked
                        ? 'border-[#c8a96e]/40 bg-[#c8a96e]/8'
                        : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: checked ? `${color}22` : 'rgba(255,255,255,0.05)' }}
                    >
                      <Icon size={15} style={{ color: checked ? color : 'rgba(255,255,255,0.3)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${checked ? 'text-white' : 'text-white/50'}`}>{t(labelKey)}</p>
                      <p className="text-[11px] text-white/25 mt-0.5">{t(descKey)}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      checked ? 'border-[#c8a96e] bg-[#c8a96e]' : 'border-white/20'
                    }`}>
                      {checked && <Check size={11} className="text-black" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/25 transition-all"
          >
            {t('admin.cancel')}
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-black text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : (editUser ? t('admin.saveChangesBtn') : t('purchasing.createUser'))}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Permission Badges ─── */
function PermBadge({ id }) {
  const { t } = useLanguage();
  const perm = PERMISSION_KEYS.find(p => p.id === id);
  if (!perm) return null;
  const Icon = perm.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ color: perm.color, background: `${perm.color}18`, border: `1px solid ${perm.color}28` }}
    >
      <Icon size={9} />
      {t(perm.labelKey)}
    </span>
  );
}

/* ─── Main Page Content ─── */
function UsersContent() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [users, setUsers] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let adminDocs = [];
    let purchDocs = [];

    const mergeUsers = () => {
      const adminMap = new Map();
      adminDocs.forEach(d => adminMap.set(d.id, d));

      purchDocs.forEach(p => {
        if (!adminMap.has(p.id)) {
          // User exists in purchasingUsers but not in adminUsers
          adminMap.set(p.id, {
            id: p.id,
            name: p.name || t('admin.purchasingUserFallbackName'),
            email: p.email || '',
            role: 'user',
            permissions: ['purchasing_module'],
            purchasingRole: p.role || 'site_supervisor',
            active: p.active !== false,
            createdAt: p.createdAt,
            phone: p.phone || '',
            department: p.department || '',
            jobTitle: p.jobTitle || '',
          });
        }
      });

      setUsers(Array.from(adminMap.values()));
    };

    const unsub1 = onSnapshot(collection(db, 'adminUsers'), snap => {
      adminDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      mergeUsers();
    });

    const unsub2 = onSnapshot(collection(db, 'purchasingUsers'), snap => {
      purchDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      mergeUsers();
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [t]);

  const toggleActive = async (u) => {
    setError('');
    try {
      await updateAdminUserPermissions(u.id, { active: !u.active });
    } catch (e) {
      setError(e.message || t('admin.genericError'));
    }
  };

  const openEdit = (u) => { setEditUser(u); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditUser(null); };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-[#c8a96e]" />
            {t('admin.usersManagementTitle')}
          </h1>
          <p className="text-sm text-white/30 mt-1">{t('admin.usersManagementSubtitle')}</p>
        </div>
        <button
          onClick={() => { setEditUser(null); setShowModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-black shadow-lg transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#8a6a1e,#D5B25D,#e8c96e,#D5B25D,#8a6a1e)' }}
        >
          <Plus size={14} /> {t('purchasing.addUser')}
        </button>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 border border-red-500/25 text-red-400 mb-5">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        {users === null ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-[#c8a96e] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users size={40} className="text-white/10" />
            <p className="text-white/30 text-sm">{t('admin.noUsersYet')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {[t('admin.nameLabel'), t('admin.emailLabel'), t('purchasing.roleLabel'), t('purchasing.department'), t('admin.statusCol'), t('admin.actionsCol')].map(h => (
                    <th key={h} className="text-start text-xs text-white/30 font-medium px-5 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                          <Image
                            src={
                              u.role === 'super_admin'
                                ? '/asstes/super-admin.jpg'
                                : u.role === 'company_manager'
                                ? '/asstes/directort.png'
                                : (u.photoURL || '/asstes/ph dashborad.png')
                            }
                            alt={u.name || 'User'}
                            fill
                            sizes="32px"
                            className="object-cover object-top"
                          />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{u.name}</p>
                          {u.jobTitle && <p className="text-white/35 text-xs mt-0.5">{u.jobTitle}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-xs" dir="ltr">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className="text-[#c8a96e] text-xs font-medium">
                        {ROLE_LABELS[u.role] || u.role || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-xs">{u.department || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.active !== false
                          ? 'text-green-400 bg-green-500/12 border border-green-500/20'
                          : 'text-red-400 bg-red-500/12 border border-red-500/20'
                      }`}>
                        {u.active !== false
                          ? <><ShieldCheck size={9} /> {t('purchasing.activeLabel')}</>
                          : <><ShieldOff size={9} /> {t('purchasing.inactiveLabel')}</>
                        }
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-[#c8a96e] hover:bg-[#c8a96e]/10 transition-all"
                          title={t('admin.editLabel')}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          className={`p-1.5 rounded-lg transition-all ${
                            u.active !== false
                              ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                              : 'text-white/40 hover:text-green-400 hover:bg-green-500/10'
                          }`}
                          title={u.active !== false ? t('admin.deactivateAccountLabel') : t('admin.activateAccountLabel')}
                        >
                          <Power size={13} />
                        </button>
                        {u.id !== user?.uid && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            title={t('admin.deleteUserTitle')}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          onClose={closeModal}
          currentUid={user?.uid}
          editUser={editUser}
        />
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-2xl" dir="rtl">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <h3 className="text-white font-bold text-lg">{t('admin.deleteUserTitle')}</h3>
            </div>
            <p className="text-white/60 text-sm mb-6 leading-relaxed text-right">
              {t('admin.deleteUserConfirmPrefix')} <strong className="text-white">&quot;{deleteTarget.name}&quot;</strong>{t('admin.deleteUserConfirmSuffix')}
              <br />
              {t('admin.deleteUserConfirmDetail')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:text-white hover:border-white/25 transition-all"
              >
                {t('admin.cancel')}
              </button>
              <button
                onClick={async () => {
                  const targetId = deleteTarget.id;
                  setDeleteTarget(null);
                  setError('');
                  try {
                    await deleteAdminUser(targetId);
                  } catch (e) {
                    setError(e.message || t('admin.deleteUserError'));
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
              >
                {t('admin.confirmDeleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */
export default function AdminUsersPage() {
  const { isSuperAdmin, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user !== undefined && user !== null && !isSuperAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [user, isSuperAdmin, router]);

  if (!isSuperAdmin) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="animate-spin text-[#c8a96e]" />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <UsersContent />
    </AdminPageLayout>
  );
}
