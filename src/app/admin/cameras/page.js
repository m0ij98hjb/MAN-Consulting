"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import {
  Plus, Pencil, Trash2, QrCode, RefreshCw, Wifi, WifiOff,
  Camera, Search, X, Eye, Check, Loader2, Sparkles,
  MapPin, Hash, Monitor, Globe, User, Lock, Link2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

/* ── Field definitions for add/edit form ── */
const CAMERA_TYPES = ["MJPEG", "HLS", "RTSP", "HTTPS", "PORTAL"];

const EMPTY_FORM = {
  serialNumber: "", projectName: "", projectLocation: "",
  cameraName: "", cameraType: "MJPEG",
  externalIp: "", domain: "", username: "", password: "",
  streamUrl: "", status: "offline",
};

/* ─────────────── QR Code Modal ─────────────── */
function QrModal({ camera, onClose, onRegenerate }) {
  const { t } = useLanguage();
  const [regen, setRegen] = useState(false);
  const [qr,    setQr   ] = useState(camera.qrCode || "");

  const handleRegen = async () => {
    setRegen(true);
    try {
      const res = await fetch(`/api/cameras/${camera.serialNumber}/qr`, { method: "POST" });
      const data = await res.json();
      if (data.qrCode) { setQr(data.qrCode); onRegenerate?.(); }
    } finally {
      setRegen(false);
    }
  };

  const qrUrl = `/live-camera/${camera.serialNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-3xl border border-[#C9A34D]/20 p-6 flex flex-col items-center gap-5"
        style={{ background: '#0a0a0a', boxShadow: '0 0 80px rgba(0,0,0,0.9)' }}
      >
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C9A34D]/40 to-transparent" />
        <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-white/30 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
          <X size={16} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#C9A34D]/10 border border-[#C9A34D]/20 flex items-center justify-center">
          <QrCode size={22} className="text-[#C9A34D]" />
        </div>

        <div className="text-center">
          <h3 className="font-black text-white text-lg">{camera.serialNumber}</h3>
          <p className="text-white/40 text-xs mt-0.5">{camera.cameraName}</p>
        </div>

        {qr ? (
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR Code" className="w-44 h-44" style={{ imageRendering: 'pixelated' }} />
          </div>
        ) : (
          <div className="w-44 h-44 rounded-2xl bg-white/[0.04] border border-dashed border-white/[0.12] flex items-center justify-center">
            <p className="text-white/20 text-xs text-center px-4">{t('admin.contentTabs.camerasPage.noQrYet')}</p>
          </div>
        )}

        <div className="text-center">
          <p className="text-white/30 text-[10px] mb-1">{t('admin.contentTabs.camerasPage.encryptedLink')}</p>
          <p className="text-[#C9A34D]/70 text-xs font-mono bg-[#C9A34D]/5 px-3 py-1.5 rounded-lg border border-[#C9A34D]/10">
            /live-camera/{camera.serialNumber}
          </p>
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={handleRegen}
            disabled={regen}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C9A34D]/10 border border-[#C9A34D]/25 text-[#C9A34D] text-sm font-bold hover:bg-[#C9A34D]/18 disabled:opacity-50 transition-colors"
          >
            {regen ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {t('admin.contentTabs.camerasPage.regenerate')}
          </button>
          {qr && (
            <a
              href={qr}
              download={`${camera.serialNumber}-qr.png`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/60 text-sm font-bold hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              {t('admin.contentTabs.camerasPage.download')}
            </a>
          )}
        </div>

        <Link href={qrUrl} target="_blank" className="flex items-center gap-1.5 text-[#C9A34D]/50 text-xs hover:text-[#C9A34D] transition-colors">
          <Eye size={11} /> {t('admin.contentTabs.camerasPage.previewCameraPage')}
        </Link>
      </div>
    </div>
  );
}

/* ─────────────── Shared form field (declared outside so it isn't recreated every render) ─────────────── */
function FormField({ icon: Icon, label, name, type = "text", placeholder, readOnly, value, onChange }) {
  const dir = (name === "serialNumber" || name === "externalIp" || name === "domain" || name === "streamUrl") ? "ltr" : "rtl";
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 mb-1.5 uppercase tracking-wider">
        <Icon size={10} className="text-[#C9A34D]/50" /> {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        dir={dir}
        className={`w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A34D]/40 transition-colors ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

/* ─────────────── Add / Edit Form Modal ─────────────── */
function CameraFormModal({ mode, initial, onClose, onSaved }) {
  const { t } = useLanguage();
  const [form,    setForm   ] = useState({ ...EMPTY_FORM, ...initial });
  const [loading, setLoading] = useState(false);
  const [err,     setErr    ] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.serialNumber.trim() || !form.projectName.trim() || !form.cameraName.trim()) {
      setErr(t('admin.contentTabs.camerasPage.requiredFieldsError'));
      return;
    }
    setLoading(true);
    try {
      let res;
      if (mode === "add") {
        res = await fetch("/api/cameras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, serialNumber: form.serialNumber.toUpperCase() }),
        });
      } else {
        res = await fetch(`/api/cameras/${initial.serialNumber}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) {
        const d = await res.json();
        setErr(d.error || t('admin.contentTabs.camerasPage.genericError'));
      } else {
        // Auto-generate QR code if adding new camera
        if (mode === "add") {
          const created = await res.json();
          // Trigger QR generation
          const serial = form.serialNumber.toUpperCase();
          await fetch(`/api/cameras/${serial}/qr`, { method: "POST" }).catch(() => {});
        }
        onSaved?.();
        onClose();
      }
    } catch {
      setErr(t('admin.contentTabs.camerasPage.connectionError'));
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh]"
        style={{ background: '#0a0a0a', border: '1px solid rgba(201,163,77,0.15)', boxShadow: '0 -20px 80px rgba(0,0,0,0.9)' }}
      >
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C9A34D]/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A34D]/10 border border-[#C9A34D]/20 flex items-center justify-center">
              <Camera size={16} className="text-[#C9A34D]" />
            </div>
            <h2 className="font-black text-white text-base">
              {mode === "add" ? t('admin.contentTabs.camerasPage.addCameraModalTitle') : t('admin.contentTabs.camerasPage.editCameraModalTitle')}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Section: Project Info */}
          <div className="space-y-3.5">
            <p className="text-[#C9A34D]/60 text-[10px] font-black uppercase tracking-widest border-b border-[#C9A34D]/10 pb-2">{t('admin.contentTabs.camerasPage.projectInfoSection')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField icon={Hash}    label={t('admin.contentTabs.camerasPage.serialNumberLabel')}  name="serialNumber"    placeholder="MNC-CAM-004" readOnly={mode === "edit"} value={form.serialNumber} onChange={e => set("serialNumber", e.target.value)} />
              <FormField icon={Monitor} label={t('admin.contentTabs.camerasPage.cameraNameLabel')}     name="cameraName"     placeholder={t('admin.contentTabs.camerasPage.cameraNamePlaceholder')} value={form.cameraName} onChange={e => set("cameraName", e.target.value)} />
              <FormField icon={Camera}  label={t('admin.contentTabs.camerasPage.projectNameLabel')}     name="projectName"    placeholder={t('admin.contentTabs.camerasPage.projectNamePlaceholder')} value={form.projectName} onChange={e => set("projectName", e.target.value)} />
              <FormField icon={MapPin}  label={t('admin.contentTabs.camerasPage.projectLocationLabel')}      name="projectLocation" placeholder={t('admin.contentTabs.camerasPage.projectLocationPlaceholder')} value={form.projectLocation} onChange={e => set("projectLocation", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-white/30 mb-1.5 block uppercase tracking-wider">{t('admin.contentTabs.camerasPage.streamTypeLabel')}</label>
                <select
                  value={form.cameraType}
                  onChange={e => set("cameraType", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C9A34D]/40 transition-colors"
                  dir="ltr"
                >
                  {CAMERA_TYPES.map(ct => <option key={ct} value={ct} className="bg-[#111]">{ct}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/30 mb-1.5 block uppercase tracking-wider">{t('admin.contentTabs.camerasPage.statusLabel')}</label>
                <select
                  value={form.status}
                  onChange={e => set("status", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C9A34D]/40 transition-colors"
                >
                  <option value="offline" className="bg-[#111]">{t('admin.contentTabs.camerasPage.offlineOption')}</option>
                  <option value="online"  className="bg-[#111]">{t('admin.contentTabs.camerasPage.onlineOption')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Credentials */}
          <div className="space-y-3.5">
            <p className="text-[#C9A34D]/60 text-[10px] font-black uppercase tracking-widest border-b border-[#C9A34D]/10 pb-2">{t('admin.contentTabs.camerasPage.credentialsSection')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField icon={Globe} label={t('admin.contentTabs.camerasPage.externalIpLabel')}   name="externalIp"  placeholder="192.168.1.100" value={form.externalIp} onChange={e => set("externalIp", e.target.value)} />
              <FormField icon={Globe} label={t('admin.contentTabs.camerasPage.domainLabel')} name="domain"  placeholder="cam1.mnc-project.com" value={form.domain} onChange={e => set("domain", e.target.value)} />
              <FormField icon={User}  label={t('admin.contentTabs.camerasPage.usernameLabel')}  name="username"   placeholder="admin" value={form.username} onChange={e => set("username", e.target.value)} />
              <FormField icon={Lock}  label={t('admin.contentTabs.camerasPage.passwordLabel')}   name="password"   type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} />
            </div>
            <FormField icon={Link2}  label={t('admin.contentTabs.camerasPage.streamUrlLabel')} name="streamUrl" placeholder={t('admin.contentTabs.camerasPage.streamUrlPlaceholder')} value={form.streamUrl} onChange={e => set("streamUrl", e.target.value)} />
          </div>

          {err && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <X size={14} /> {err}
            </div>
          )}
        </form>

        <div className="shrink-0 px-6 py-4 border-t border-white/[0.06] flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#C9A34D] to-[#e0b85a] text-black font-black text-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-60 transition-all"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {mode === "add" ? t('admin.contentTabs.camerasPage.addCameraSubmitBtn') : t('admin.contentTabs.camerasPage.saveChangesBtn')}
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-bold transition-colors">
            {t('admin.contentTabs.camerasPage.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Delete Confirm Modal ─────────────── */
function DeleteModal({ camera, onClose, onDeleted }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/cameras/${camera.serialNumber}`, { method: "DELETE" });
    onDeleted?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-3xl p-6 flex flex-col gap-5 text-center"
        style={{ background: '#0a0a0a', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto">
          <Trash2 size={22} className="text-red-400" />
        </div>
        <div>
          <h3 className="font-black text-white text-lg mb-1">{t('admin.contentTabs.camerasPage.deleteCameraTitle')}</h3>
          <p className="text-white/40 text-sm">
            {t('admin.contentTabs.camerasPage.deleteCameraConfirmPrefix')} <span className="text-[#C9A34D] font-bold">{camera.serialNumber}</span>{t('admin.contentTabs.camerasPage.deleteCameraConfirmQuestionMark')}
            <br />{t('admin.contentTabs.camerasPage.deleteCameraConfirmNote')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-black text-sm hover:bg-red-500/25 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {t('admin.contentTabs.camerasPage.yesDelete')}
          </button>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 font-bold text-sm hover:text-white transition-colors">
            {t('admin.contentTabs.camerasPage.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Camera Row ─────────────── */
function CameraRow({ camera, onEdit, onDelete, onQr, onToggleStatus }) {
  const { t } = useLanguage();
  const [toggling, setToggling] = useState(false);
  const isOnline = camera.status === "online";

  const handleToggle = async () => {
    setToggling(true);
    await fetch(`/api/cameras/${camera.serialNumber}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isOnline ? "offline" : "online" }),
    });
    onToggleStatus?.();
    setToggling(false);
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.06] hover:border-[#C9A34D]/20 bg-white/[0.02] hover:bg-white/[0.03] transition-all group">
      {/* Status dot */}
      <button onClick={handleToggle} disabled={toggling} title={t('admin.contentTabs.camerasPage.toggleStatusTitle')} className="shrink-0">
        {toggling
          ? <Loader2 size={16} className="text-[#C9A34D]/50 animate-spin" />
          : <div className={`w-3 h-3 rounded-full border-2 transition-colors ${isOnline ? 'bg-green-400 border-green-400/50 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-white/15 border-white/25 hover:bg-red-400/50'}`} />
        }
      </button>

      {/* Camera icon */}
      <div className="w-9 h-9 rounded-xl bg-[#C9A34D]/8 border border-[#C9A34D]/15 flex items-center justify-center shrink-0">
        <Camera size={15} className="text-[#C9A34D]/60" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#C9A34D] text-xs font-mono font-black">{camera.serialNumber}</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white text-sm font-bold truncate">{camera.cameraName}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-white/35 text-xs truncate">{camera.projectName}</span>
          {camera.projectLocation && (
            <>
              <span className="text-white/15 text-xs">·</span>
              <span className="text-white/25 text-[10px] truncate">{camera.projectLocation}</span>
            </>
          )}
        </div>
      </div>

      {/* Type badge */}
      <span className="hidden sm:block text-[10px] font-mono font-bold text-[#C9A34D]/40 bg-[#C9A34D]/5 border border-[#C9A34D]/10 px-2 py-1 rounded-lg shrink-0">
        {camera.cameraType || 'MJPEG'}
      </span>

      {/* Status badge */}
      <span className={`hidden md:flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${
        isOnline ? 'text-green-400 bg-green-500/8 border-green-500/20' : 'text-white/25 bg-white/[0.03] border-white/[0.07]'
      }`}>
        {isOnline ? <Wifi size={9} /> : <WifiOff size={9} />}
        {isOnline ? t('admin.contentTabs.camerasPage.liveLabel') : t('admin.contentTabs.camerasPage.offlineLabel')}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
        <Link
          href={`/live-camera/${camera.serialNumber}`}
          target="_blank"
          title={t('admin.contentTabs.camerasPage.previewCameraTitle')}
          className="w-8 h-8 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-[#C9A34D] hover:border-[#C9A34D]/30 transition-all"
        >
          <Eye size={13} />
        </Link>
        <button
          onClick={onQr}
          title={t('admin.contentTabs.camerasPage.qrCodeTitle')}
          className="w-8 h-8 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-[#C9A34D] hover:border-[#C9A34D]/30 transition-all"
        >
          <QrCode size={13} />
        </button>
        <button
          onClick={onEdit}
          title={t('admin.contentTabs.camerasPage.editTitle')}
          className="w-8 h-8 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 transition-all"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          title={t('admin.contentTabs.camerasPage.deleteTitle')}
          className="w-8 h-8 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
export default function AdminCamerasPage() {
  const { t } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const router = useRouter();

  const [cameras,  setCameras ] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [search,   setSearch  ] = useState("");
  const [seeding,  setSeeding ] = useState(false);
  const [seedMsg,  setSeedMsg ] = useState("");

  const [addModal,    setAddModal   ] = useState(false);
  const [editCamera,  setEditCamera ] = useState(null);
  const [deleteCamera, setDeleteCamera] = useState(null);
  const [qrCamera,    setQrCamera   ] = useState(null);

  const fetchCameras = useCallback(async () => {
    setLoading(true);
    try {
      // Admin gets all cameras (public fields — credentials are omitted)
      const res = await fetch("/api/cameras");
      const { cameras: data } = await res.json();
      setCameras(data || []);
    } catch { setCameras([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) { router.replace("/admin/dashboard"); return; }
    queueMicrotask(() => { fetchCameras(); });
  }, [isSuperAdmin, fetchCameras, router]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res  = await fetch("/api/cameras/seed", { method: "POST" });
      const data = await res.json();
      const added   = data.created?.filter(c => !c.skipped).length || 0;
      const skipped = data.created?.filter(c =>  c.skipped).length || 0;
      setSeedMsg(`✓ ${added} ${t('admin.contentTabs.camerasPage.seedSuccessAdded')}${skipped ? ` · ${skipped} ${t('admin.contentTabs.camerasPage.seedSuccessSkipped')}` : ''}`);
      await fetchCameras();
    } catch { setSeedMsg(t('admin.contentTabs.camerasPage.seedErrorMsg')); }
    setSeeding(false);
  };

  const filtered = cameras.filter(c =>
    !search ||
    c.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    c.cameraName?.toLowerCase().includes(search.toLowerCase())
  );

  const online  = cameras.filter(c => c.status === "online").length;
  const offline = cameras.filter(c => c.status !== "online").length;

  if (!isSuperAdmin) return null;

  return (
    <AdminPageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" dir="rtl">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#C9A34D]/10 border border-[#C9A34D]/20 flex items-center justify-center">
                <Camera size={15} className="text-[#C9A34D]" />
              </div>
              <h1 className="text-xl font-black text-white">{t('admin.contentTabs.camerasPage.pageTitle')}</h1>
            </div>
            <p className="text-white/30 text-sm">{t('admin.contentTabs.camerasPage.pageSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C9A34D]/20 bg-[#C9A34D]/8 text-[#C9A34D] text-sm font-bold hover:bg-[#C9A34D]/15 disabled:opacity-50 transition-all"
            >
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {t('admin.contentTabs.camerasPage.seedDemoCamerasBtn')}
            </button>
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A34D] to-[#e0b85a] text-black text-sm font-black hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(201,163,77,0.25)]"
            >
              <Plus size={15} /> {t('admin.contentTabs.camerasPage.addCameraBtn')}
            </button>
          </div>
        </div>

        {/* Seed message */}
        {seedMsg && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
            <Check size={14} /> {seedMsg}
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { labelKey: "admin.contentTabs.camerasPage.totalCamerasLabel", value: cameras.length, color: "#C9A34D" },
            { labelKey: "admin.contentTabs.camerasPage.onlineStatLabel",   value: online,          color: "#4ade80" },
            { labelKey: "admin.contentTabs.camerasPage.offlineStatLabel", value: offline,         color: "#f87171" },
          ].map(s => (
            <div key={s.labelKey} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
              <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-white/30 text-xs mt-0.5">{t(s.labelKey)}</p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative mb-5">
          <Search size={15} className="absolute top-1/2 right-4 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.contentTabs.camerasPage.searchPlaceholder')}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C9A34D]/35 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute top-1/2 left-3 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── Camera List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="text-[#C9A34D]/40 animate-spin" />
              <p className="text-white/25 text-sm">{t('admin.contentTabs.camerasPage.loadingLabel')}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Camera size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/25 text-base font-bold mb-1">
              {search ? t('admin.contentTabs.camerasPage.noResultsLabel') : t('admin.contentTabs.camerasPage.noCamerasYetLabel')}
            </p>
            <p className="text-white/15 text-sm">
              {search ? t('admin.contentTabs.camerasPage.tryDifferentSearchLabel') : t('admin.contentTabs.camerasPage.pressAddCameraHint')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(cam => (
              <CameraRow
                key={cam.serialNumber}
                camera={cam}
                onEdit={() => setEditCamera(cam)}
                onDelete={() => setDeleteCamera(cam)}
                onQr={() => setQrCamera(cam)}
                onToggleStatus={fetchCameras}
              />
            ))}
          </div>
        )}

        {/* ── Documentation note ── */}
        <div className="mt-8 p-5 rounded-2xl border border-[#C9A34D]/10 bg-[#C9A34D]/[0.03]">
          <p className="text-[#C9A34D]/70 text-xs font-bold mb-2">{t('admin.contentTabs.camerasPage.docNoteTitle')}</p>
          <ol className="text-white/30 text-xs space-y-1 list-decimal list-inside">
            <li>{t('admin.contentTabs.camerasPage.docStep1')}</li>
            <li>{t('admin.contentTabs.camerasPage.docStep2')}</li>
            <li>{t('admin.contentTabs.camerasPage.docStep3')}</li>
            <li>{t('admin.contentTabs.camerasPage.docStep4')}</li>
          </ol>
        </div>
      </div>

      {/* ── Modals ── */}
      {addModal && (
        <CameraFormModal
          mode="add"
          initial={EMPTY_FORM}
          onClose={() => setAddModal(false)}
          onSaved={fetchCameras}
        />
      )}
      {editCamera && (
        <CameraFormModal
          mode="edit"
          initial={editCamera}
          onClose={() => setEditCamera(null)}
          onSaved={fetchCameras}
        />
      )}
      {deleteCamera && (
        <DeleteModal
          camera={deleteCamera}
          onClose={() => setDeleteCamera(null)}
          onDeleted={fetchCameras}
        />
      )}
      {qrCamera && (
        <QrModal
          camera={qrCamera}
          onClose={() => setQrCamera(null)}
          onRegenerate={fetchCameras}
        />
      )}
    </AdminPageLayout>
  );
}
