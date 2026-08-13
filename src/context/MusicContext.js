'use client';

import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicReady, setIsMusicReady] = useState(false);
  const [musicUserPaused, setMusicUserPaused] = useState(false);
  const musicRef = useRef(null);
  const wasMusicPlayingRef = useRef(false);
  const musicUserPausedRef = useRef(false);
  const wasHiddenPlayingRef = useRef(false);
  const wasAdminPausedRef = useRef(false);
  const isAdminPageRef = useRef(false);
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.35;
    audio.src = '/assets/audio/divine-music.mp3';
    musicRef.current = audio;
    // Deferred so the "ready" flag isn't set synchronously in the effect body.
    queueMicrotask(() => setIsMusicReady(true));

    // Browsers only allow autoplay-with-sound once a visitor has built up
    // enough engagement with the site, so try that first and fall back to a
    // silent autoplay (always permitted) that gets unmuted on the visitor's
    // first real gesture — the timeline is already advancing in the
    // background, so sound kicks in instantly on that first click/tap/key
    // instead of waiting on a fresh play() call.
    audio.play().then(() => {
      if (isAdminPageRef.current) { audio.pause(); return; }
      setIsMusicPlaying(true);
    }).catch(() => {
      if (isAdminPageRef.current) return;
      audio.muted = true;
      audio.play().catch(() => {});
    });

    const onFirstInteraction = () => {
      // A gesture made in the admin area doesn't count — stay armed so
      // the first gesture after leaving it still unmutes.
      if (isAdminPageRef.current) return;
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('touchend', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      if (!musicRef.current || musicUserPausedRef.current) return;
      musicRef.current.muted = false;
      musicRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    };
    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('touchstart', onFirstInteraction, { passive: true });
    window.addEventListener('touchend', onFirstInteraction, { passive: true });
    window.addEventListener('keydown', onFirstInteraction);

    return () => {
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('touchend', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  // Admin area (dashboard + login): stop the music while it's shown, resume
  // on returning to the rest of the site (unless the user had paused it).
  useEffect(() => {
    isAdminPageRef.current = isAdminPage;
    if (isAdminPage) {
      if (musicRef.current && !musicRef.current.paused) {
        wasAdminPausedRef.current = true;
        musicRef.current.pause();
        setIsMusicPlaying(false);
      }
    } else if (wasAdminPausedRef.current) {
      wasAdminPausedRef.current = false;
      if (musicRef.current && !musicUserPausedRef.current) {
        const audio = musicRef.current;
        audio.play().then(() => {
          if (!audio.muted) setIsMusicPlaying(true);
        }).catch(() => {});
      }
    }
  }, [pathname, isAdminPage]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (musicRef.current && !musicRef.current.paused) {
          wasHiddenPlayingRef.current = true;
          musicRef.current.pause();
          setIsMusicPlaying(false);
        } else {
          wasHiddenPlayingRef.current = false;
        }
      } else if (musicRef.current && wasHiddenPlayingRef.current && !musicUserPausedRef.current) {
        wasHiddenPlayingRef.current = false;
        const audio = musicRef.current;
        audio.play().then(() => {
          if (!audio.muted) setIsMusicPlaying(true);
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const playMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.muted = false;
      musicRef.current.play().then(() => {
        setIsMusicPlaying(true);
        setMusicUserPaused(false);
      }).catch(() => {});
    }
  }, []);

  const pauseMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (isMusicPlaying) {
      pauseMusic();
      musicUserPausedRef.current = true;
      setMusicUserPaused(true);
    } else {
      playMusic();
      musicUserPausedRef.current = false;
      setMusicUserPaused(false);
    }
  }, [isMusicPlaying, pauseMusic, playMusic]);

  // Called when voice starts — pause music temporarily
  const pauseMusicForVoice = useCallback(() => {
    if (musicRef.current && isMusicPlaying) {
      wasMusicPlayingRef.current = true;
      musicRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      wasMusicPlayingRef.current = false;
    }
  }, [isMusicPlaying]);

  // Called when voice stops — resume only if music was playing before voice started
  const resumeMusicAfterVoice = useCallback(() => {
    if (musicRef.current && wasMusicPlayingRef.current && !musicUserPaused) {
      wasMusicPlayingRef.current = false;
      musicRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {});
    }
  }, [musicUserPaused]);

  return (
    <MusicContext.Provider value={{
      isMusicPlaying,
      isMusicReady,
      toggleMusic,
      playMusic,
      pauseMusic,
      pauseMusicForVoice,
      resumeMusicAfterVoice,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
