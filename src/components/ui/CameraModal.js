"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X, Eye, QrCode, Search, Loader2, WifiOff,
  ChevronLeft, SwitchCamera, RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/* ─────────────────── QR / Barcode Scanner ─────────────────── */
function QrScanView({ onResult, onBack }) {
  const { t } = useLanguage();
  const [status,      setStatus]      = useState("idle");
  const [errMsg,      setErrMsg]      = useState("");
  const [cameras,     setCameras]     = useState([]);
  const [activeCamId, setActiveCamId] = useState(null);
  const scannerRef = useRef(null);
  const startedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && startedRef.current) {
      await scannerRef.current.stop().catch(() => {});
      startedRef.current = false;
    }
  }, []);

  const startScanner = useCallback(async (camId) => {
    await stopScanner();
    setStatus("loading");
    setErrMsg("");
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

      let camList = cameras;
      if (!camList.length) {
        try { camList = await Html5Qrcode.getCameras(); setCameras(camList); } catch { camList = []; }
      }

      let cameraConstraint;
      if (camId) {
        cameraConstraint = camId;
        setActiveCamId(camId);
      } else if (camList.length) {
        const backCam = camList.find(c => /back|rear|environment/i.test(c.label));
        const chosen  = backCam ?? camList[camList.length - 1];
        setActiveCamId(chosen.id);
        cameraConstraint = chosen.id;
      } else {
        cameraConstraint = { facingMode: "environment" };
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("mnc-qr-reader", { verbose: false });
      }

      const formats = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.PDF_417,
        Html5QrcodeSupportedFormats.AZTEC,
      ].filter(Boolean);

      await scannerRef.current.start(
        cameraConstraint,
        { fps: 15, qrbox: { width: 230, height: 230 }, formatsToSupport: formats },
        (text) => { stopScanner(); onResult(text); },
        () => {}
      );
      startedRef.current = true;
      setStatus("scanning");
    } catch (e) {
      setStatus("error");
      setErrMsg(
        e?.message?.includes("NotAllowed")
          ? t("camera.cameraPermissionDenied")
          : e?.message?.includes("NotFound") || e?.message?.includes("DevicesNotFound")
          ? t("camera.noCameraFound")
          : t("camera.cameraStartFailed")
      );
    }
  }, [cameras, onResult, stopScanner, t]);

  useEffect(() => {
    // Deferred so the (traced) setState calls inside startScanner aren't
    // considered a direct synchronous effect-body call.
    queueMicrotask(() => { startScanner(null); });
    return () => { stopScanner(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchCamera = useCallback(async (camId) => {
    setActiveCamId(camId);
    await startScanner(camId);
  }, [startScanner]);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-sm text-center text-white/50">
        {t("camera.pointAtCode")}
      </p>

      <div className="relative rounded-2xl overflow-hidden border-2 border-[#C9A34D]/35 w-full max-w-[280px] aspect-square bg-black flex items-center justify-center">
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-black/80">
            <Loader2 size={32} className="text-[#C9A34D] animate-spin" />
            <span className="text-white/50 text-xs">{t("camera.startingCamera")}</span>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-3 px-4 text-center">
            <WifiOff size={28} className="text-red-500" />
            <p className="text-red-400 text-sm font-bold leading-snug">{errMsg}</p>
            <button
              onClick={() => startScanner(activeCamId)}
              className="flex items-center gap-1.5 text-[#C9A34D] text-xs border border-[#C9A34D]/30 px-3 py-1.5 rounded-lg hover:bg-[#C9A34D]/10 transition-colors"
            >
              <RefreshCw size={11} /> {t("camera.retry")}
            </button>
          </div>
        )}

        <div id="mnc-qr-reader" className="w-full h-full" />

        {status === "scanning" && (
          <>
            <div className="absolute top-3 left-3   w-7 h-7 border-t-2 border-l-2 border-[#C9A34D] rounded-tl pointer-events-none" />
            <div className="absolute top-3 right-3  w-7 h-7 border-t-2 border-r-2 border-[#C9A34D] rounded-tr pointer-events-none" />
            <div className="absolute bottom-3 left-3  w-7 h-7 border-b-2 border-l-2 border-[#C9A34D] rounded-bl pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-[#C9A34D] rounded-br pointer-events-none" />
            <div
              className="absolute left-3 right-3 h-px bg-gradient-to-r from-transparent via-[#C9A34D] to-transparent pointer-events-none"
              style={{ top: "50%", boxShadow: "0 0 6px rgba(201,163,77,0.8)", animation: "mnc-scan 2s ease-in-out infinite" }}
            />
          </>
        )}
      </div>

      {cameras.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <SwitchCamera size={13} className="text-[#C9A34D]/50 shrink-0" />
          {cameras.map((cam, i) => (
            <button
              key={cam.id}
              onClick={() => switchCamera(cam.id)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                activeCamId === cam.id
                  ? "bg-[#C9A34D]/15 border-[#C9A34D]/45 text-[#C9A34D] font-bold"
                  : "bg-white/[0.04] border-white/10 text-white/35 hover:text-white/60"
              }`}
            >
              {cam.label?.replace(/\s*\(.*?\)\s*/g, "").trim() || t("camera.cameraNumberFallback").replace("{n}", i + 1)}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#C9A34D]/60 hover:text-[#C9A34D] text-sm transition-colors mt-1"
      >
        <ChevronLeft size={16} /> {t("camera.back")}
      </button>

      <style jsx global>{`
        @keyframes mnc-scan {
          0%, 100% { top: 20%; }
          50%       { top: 80%; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────── Main Modal ─────────────────── */
export default function CameraModal({ onClose }) {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [view,    setView   ] = useState("entry");
  const [serial,  setSerial ] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg,  setErrMsg ] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const resolve = useCallback(async (value) => {
    const v = (value || "").trim();
    if (!v) return;

    /* QR code that contains our viewer URL */
    const m = v.match(/\/live-camera\/([^/?#\s]+)/i);
    if (m) { onClose(); router.push(`/live-camera/${m[1]}`); return; }

    /* Validate via API */
    setLoading(true);
    setErrMsg("");
    try {
      const res = await fetch(`/api/cameras/${encodeURIComponent(v)}`);
      if (res.ok) {
        onClose();
        router.push(`/live-camera/${encodeURIComponent(v)}`);
      } else {
        setErrMsg(t("camera.notFoundBySerial").replace("{serial}", v));
      }
    } catch {
      setErrMsg(t("camera.connectionError"));
    }
    setLoading(false);
  }, [onClose, router, t]);

  const handleScan = useCallback((text) => {
    setView("entry");
    setSerial(text);
    resolve(text);
  }, [resolve]);

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh] sm:max-h-[85dvh] bg-[#0a0a0a] border border-[#C9A34D]/15 shadow-[0_-20px_80px_rgba(0,0,0,0.9)]">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C9A34D]/40 to-transparent rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A34D]/10 border border-[#C9A34D]/20 flex items-center justify-center">
              <Eye size={17} className="text-[#C9A34D]" />
            </div>
            <div>
              <h2 className="font-black text-base text-white leading-tight">{t("camera.title")}</h2>
              <p className="text-[11px] text-white/30">{t("camera.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <X size={17} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {view === "scan" ? (
            <QrScanView onResult={handleScan} onBack={() => setView("entry")} />
          ) : (
            <div className="flex flex-col gap-5">

              {/* Serial input */}
              <div className="flex flex-col gap-2">
                <label className="text-[#C9A34D]/70 text-xs font-bold flex items-center gap-1.5">
                  <Search size={11} /> {t("camera.serialLabel")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serial}
                    onChange={e => { setSerial(e.target.value); setErrMsg(""); }}
                    onKeyDown={e => e.key === "Enter" && resolve(serial)}
                    placeholder={t("camera.serialPlaceholder")}
                    dir="ltr"
                    autoFocus
                    className="flex-1 rounded-xl px-4 py-3 text-sm bg-white/[0.05] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#C9A34D]/50 transition-colors"
                  />
                  <button
                    onClick={() => resolve(serial)}
                    disabled={loading || !serial.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-[#C9A34D] to-[#e0b85a] text-black font-black text-sm rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shadow-[0_0_18px_rgba(201,163,77,0.3)]"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : t("camera.search")}
                  </button>
                </div>
                {errMsg && (
                  <p className="text-red-400 text-xs flex items-center gap-1.5">
                    <WifiOff size={11} /> {errMsg}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-xs text-white/25">{t("camera.orScanBarcode")}</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              {/* QR scan button */}
              <button
                onClick={() => setView("scan")}
                className="flex flex-col items-center gap-3 py-6 border-2 border-dashed border-[#C9A34D]/25 hover:border-[#C9A34D]/55 rounded-2xl hover:bg-[#C9A34D]/[0.04] transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#C9A34D]/10 border border-[#C9A34D]/20 flex items-center justify-center group-hover:bg-[#C9A34D]/18 transition-colors">
                  <QrCode size={26} className="text-[#C9A34D]" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-white">{t("camera.scanQrTitle")}</p>
                  <p className="text-xs mt-0.5 text-white/30">{t("camera.scanQrSubtitle")}</p>
                </div>
              </button>

            </div>
          )}
        </div>

        {/* Mobile drag handle */}
        <div className="sm:hidden pb-4 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
