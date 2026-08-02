"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Maximize2, Minimize2, RefreshCw, Wifi, WifiOff,
  Camera, MapPin, Hash, Clock, Shield, ExternalLink, ChevronLeft,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatTime } from "@/lib/formatters";

/* ─────────── Stream type detection ─────────── */
function detectType(url, hint) {
  if (!url) return "empty";
  if (hint) return hint.toUpperCase();
  if (/\.m3u8/i.test(url)) return "HLS";
  if (/^rtsp:\/\//i.test(url)) return "RTSP";
  if (/^https?:\/\//i.test(url)) return "MJPEG";
  return "MJPEG";
}

/* ─────────── MJPEG via <img> ─────────── */
function MjpegPlayer({ url, onError }) {
  const { t } = useLanguage();
  const [stamp, setStamp] = useState(() => Date.now());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    queueMicrotask(() => {
      if (disposed) return;
      setFailed(false);
      setStamp(Date.now());
    });
    const iv = setInterval(() => setStamp(Date.now()), 5000);
    return () => { disposed = true; clearInterval(iv); };
  }, [url]);

  const src = url + (url.includes("?") ? "&" : "?") + "_t=" + stamp;

  if (failed) { onError?.(); return null; }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={t("camera.liveCameraAlt")}
      className="w-full h-full object-contain bg-black"
      onError={() => setFailed(true)}
    />
  );
}

/* ─────────── HLS via hls.js ─────────── */
function HlsPlayer({ url, onError }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !url) return;
    let hls;
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: false });
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) onError?.(); });
      } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = url;
      } else {
        onError?.();
      }
    }).catch(onError);
    return () => { if (hls) hls.destroy(); };
  }, [url, onError]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain bg-black"
      autoPlay muted playsInline
      onError={onError}
    />
  );
}

/* ─────────── HTTPS / Portal via iframe ─────────── */
function IframePlayer({ url }) {
  const { t } = useLanguage();
  return (
    <iframe
      src={url}
      title={t("camera.liveCameraAlt")}
      className="w-full h-full bg-black"
      allowFullScreen
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  );
}

/* ─────────── RTSP placeholder ─────────── */
function RtspInfo({ url }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 bg-black p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
        <Shield size={28} className="text-amber-400" />
      </div>
      <div>
        <h3 className="text-white font-black text-xl mb-2">{t("camera.rtspTitle")}</h3>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm">
          {t("camera.rtspDesc")}
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-3 bg-[#C9A34D]/15 border border-[#C9A34D]/30 text-[#C9A34D] rounded-xl text-sm font-bold hover:bg-[#C9A34D]/25 transition-colors"
      >
        <ExternalLink size={15} /> {t("camera.copyRtspLink")}
      </a>
    </div>
  );
}

/* ─────────── Empty / no stream ─────────── */
function NoStream() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4 bg-black text-center p-8">
      <WifiOff size={40} className="text-white/15" />
      <p className="text-white/30 text-sm">{t("camera.noStreamSet")}</p>
      <p className="text-white/20 text-xs">{t("camera.adminCanUpdate")}</p>
    </div>
  );
}

/* ─────────── Main page ─────────── */
export default function LiveCameraPage() {
  const { serial } = useParams();
  const router = useRouter();
  const { t, lang, isRTL } = useLanguage();

  const [camera,     setCamera]     = useState(null);
  const [stream,     setStream]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [streamErr,  setStreamErr]  = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);
  const viewerRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setStreamErr(false);
    try {
      const [camRes, streamRes] = await Promise.all([
        fetch(`/api/cameras/${serial}`),
        fetch(`/api/cameras/${serial}/stream`),
      ]);
      if (!camRes.ok) {
        setError(t("camera.cameraNotFoundBySerial"));
        setLoading(false);
        return;
      }
      const { camera: cam }   = await camRes.json();
      const streamData        = streamRes.ok ? await streamRes.json() : null;
      setCamera(cam);
      setStream(streamData);
      setLastRefresh(new Date());
    } catch {
      setError(t("camera.connectionErrorRetry"));
    }
    setLoading(false);
  }, [serial, t]);

  useEffect(() => { queueMicrotask(() => { load(); }); }, [load]);

  const refresh = () => { setRefreshKey(k => k + 1); setLastRefresh(new Date()); setStreamErr(false); };

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A34D]/15 border border-[#C9A34D]/30 flex items-center justify-center animate-pulse">
            <Camera size={22} className="text-[#C9A34D]" />
          </div>
          <p className="text-white/40 text-sm">{t("camera.loadingCamera")}</p>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (error || !camera) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-8 text-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
          <WifiOff size={28} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-white font-black text-2xl mb-2">{t("camera.cameraNotFoundTitle")}</h1>
          <p className="text-white/40 text-sm max-w-md">
            {error || t("camera.noCameraWithSerial")}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-3 bg-[#C9A34D]/15 border border-[#C9A34D]/30 text-[#C9A34D] rounded-xl font-bold text-sm hover:bg-[#C9A34D]/25 transition-colors"
        >
          <ChevronLeft size={16} /> {t("camera.backAction")}
        </button>
      </div>
    );
  }

  const isOnline  = camera.status === "online";
  const streamUrl = stream?.streamUrl || "";
  const camType   = detectType(streamUrl, stream?.cameraType);

  const renderPlayer = () => {
    if (!streamUrl || streamErr) return <NoStream />;
    switch (camType) {
      case "HLS":    return <HlsPlayer   key={refreshKey} url={streamUrl} onError={() => setStreamErr(true)} />;
      case "RTSP":   return <RtspInfo    url={streamUrl} />;
      case "PORTAL": return <IframePlayer url={streamUrl} />;
      case "HTTPS":  return <IframePlayer url={streamUrl} />;
      default:       return <MjpegPlayer key={refreshKey} url={streamUrl} onError={() => { setStreamErr(true); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Top bar ── */}
      <header
        className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#C9A34D]/10"
        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo + back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <ArrowRight size={16} />
          </button>
          <Link href="/">
            <Image
              src="/asstes/logo-navbar.png"
              alt="MNC"
              width={120}
              height={60}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Status + serial */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            isOnline
              ? 'bg-green-500/10 border-green-500/25 text-green-400'
              : 'bg-red-500/10 border-red-500/25 text-red-400'
          }`}>
            {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
            {isOnline ? t("camera.live") : t("camera.offline")}
          </div>
          <span className="hidden sm:block text-[#C9A34D]/60 text-xs font-mono font-bold">
            {camera.serialNumber}
          </span>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── Video viewer ── */}
        <div ref={viewerRef} className="relative flex-1 bg-black flex items-center justify-center min-h-[280px] sm:min-h-[400px]">

          {/* Fullscreen bg */}
          {fullscreen && (
            <div className="absolute inset-0 bg-black z-0" />
          )}

          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {renderPlayer()}
          </div>

          {/* Stream error overlay */}
          {streamErr && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 z-20">
              <WifiOff size={32} className="text-red-400" />
              <p className="text-red-400 font-bold text-sm">{t("camera.streamLoadFailed")}</p>
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-4 py-2 text-xs text-[#C9A34D] border border-[#C9A34D]/30 rounded-xl hover:bg-[#C9A34D]/10 transition-colors"
              >
                <RefreshCw size={12} /> {t("camera.retry")}
              </button>
            </div>
          )}

          {/* Overlay controls (top-left) */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-30">
            <button
              onClick={refresh}
              title={t("camera.refreshStreamTitle")}
              className="w-9 h-9 rounded-xl bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-[#C9A34D]/40 transition-all"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={toggleFullscreen}
              title={t("camera.fullscreenTitle")}
              className="w-9 h-9 rounded-xl bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-[#C9A34D]/40 transition-all"
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          {/* Live indicator */}
          {isOnline && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur rounded-lg border border-red-500/25 z-30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-[10px] font-black tracking-wider">LIVE</span>
            </div>
          )}

          {/* Camera type badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur rounded-lg border border-[#C9A34D]/15 z-30">
            <span className="text-[#C9A34D]/60 text-[10px] font-mono font-bold">{camType}</span>
          </div>
        </div>

        {/* ── Info panel ── */}
        <div
          className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-r border-[#C9A34D]/10 flex flex-col shrink-0"
          style={{ background: '#080808' }}
        >

          {/* Gold top line */}
          <div className="h-px bg-gradient-to-l from-transparent via-[#C9A34D]/30 to-transparent shrink-0" />

          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.05] shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A34D]/10 border border-[#C9A34D]/20 flex items-center justify-center shrink-0 mt-0.5">
                <Camera size={18} className="text-[#C9A34D]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-black text-base text-white leading-tight truncate">{camera.cameraName}</h1>
                <p className="text-[#C9A34D]/60 text-xs mt-0.5 truncate">{camera.projectName}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            {/* Serial */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Hash size={14} className="text-[#C9A34D]/50 shrink-0" />
              <div className="min-w-0">
                <p className="text-white/30 text-[10px] mb-0.5">{t("camera.serialNumberLabel")}</p>
                <p className="text-[#C9A34D] text-sm font-mono font-black">{camera.serialNumber}</p>
              </div>
            </div>

            {/* Location */}
            {camera.projectLocation && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <MapPin size={14} className="text-[#C9A34D]/50 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white/30 text-[10px] mb-0.5">{t("camera.locationLabel")}</p>
                  <p className="text-white/70 text-sm font-bold truncate">{camera.projectLocation}</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
              <div>
                <p className="text-white/30 text-[10px] mb-0.5">{t("camera.statusLabel")}</p>
                <p className={`text-sm font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isOnline ? t("camera.connectedLive") : t("camera.disconnected")}
                </p>
              </div>
            </div>

            {/* Last refresh */}
            {lastRefresh && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Clock size={14} className="text-[#C9A34D]/50 shrink-0" />
                <div>
                  <p className="text-white/30 text-[10px] mb-0.5">{t("camera.lastUpdateLabel")}</p>
                  <p className="text-white/60 text-xs">
                    {formatTime(lastRefresh, lang)}
                  </p>
                </div>
              </div>
            )}

            {/* QR Code */}
            {camera.qrCode && (
              <div className="mt-2">
                <p className="text-white/25 text-[10px] mb-2 font-bold uppercase tracking-wider">{t("camera.qrCodeLabel")}</p>
                <div className="flex justify-center p-4 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={camera.qrCode}
                    alt={`QR ${camera.serialNumber}`}
                    className="w-28 h-28"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <p className="text-white/20 text-[10px] text-center mt-1.5">{t("camera.scanToOpen")}</p>
              </div>
            )}

          </div>

          {/* Refresh button */}
          <div className="shrink-0 p-5 border-t border-white/[0.05]">
            <button
              onClick={refresh}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#C9A34D]/10 border border-[#C9A34D]/20 text-[#C9A34D] font-bold text-sm hover:bg-[#C9A34D]/18 transition-colors"
            >
              <RefreshCw size={14} />
              {t("camera.refreshStreamTitle")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
