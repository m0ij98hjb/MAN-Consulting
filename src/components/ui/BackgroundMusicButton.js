'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '@/context/MusicContext';
import useHasMounted from '@/hooks/useHasMounted';
import { useLanguage } from '@/context/LanguageContext';

// Randomized equalizer-bar animation config — generated once when this
// module is first evaluated (not during any component render), so it's
// stable for the page's lifetime without ever calling Math.random() as
// part of a render pass.
const BAR_CONFIG = [0, 1, 2, 3, 4].map(() => ({
  peak1: 8 + Math.random() * 6,
  peak2: 10 + Math.random() * 4,
  duration: 0.8 + Math.random() * 0.4,
}));

export default function BackgroundMusicButton() {
  const { isMusicPlaying, toggleMusic, isMusicReady } = useMusic();
  const isMounted = useHasMounted();
  const { t } = useLanguage();

  if (!isMounted || !isMusicReady) return null;

  return (
    <motion.button
      onClick={toggleMusic}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full cursor-pointer transition-all duration-300 z-40"
      title={isMusicPlaying ? t('music.pause') : t('music.play')}
      aria-label={isMusicPlaying ? t('music.pauseAria') : t('music.playAria')}
    >
      {/* Outer glow ring */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        isMusicPlaying
          ? 'bg-[#D5B25D]/10 shadow-[0_0_25px_rgba(213,178,93,0.3)] border border-[#D5B25D]/40'
          : 'bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10'
      }`} />

      {/* Pulsing ring animation when playing */}
      <AnimatePresence>
        {isMusicPlaying && (
          <>
            <motion.div
              className="absolute inset-[-4px] rounded-full border border-[#D5B25D]/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.5, 0],
                scale: [1, 1.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute inset-[-2px] rounded-full border border-[#D5B25D]/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: [0.4, 0],
                scale: [1, 1.25],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Glass background */}
      <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl" />

      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isMusicPlaying ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              {/* Speaker with sound waves icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#D5B25D" fillOpacity="0.3" stroke="#D5B25D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Sound wave lines */}
                <motion.path
                  d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53"
                  stroke="#D5B25D"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
                <motion.path
                  d="M18.07 5.93C19.9447 7.80528 20.9979 10.3478 20.9979 13C20.9979 15.6522 19.9447 18.1947 18.07 20.07"
                  stroke="#D5B25D"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.7, 1, 0.7] }}
                  transition={{
                    pathLength: { duration: 0.6, delay: 0.2 },
                    opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }}
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="muted"
              initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
              transition={{ duration: 0.3 }}
            >
              {/* Muted speaker icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                <line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
                <line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip label */}
      <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-all duration-300 opacity-0 group-hover:opacity-100 ${
        isMusicPlaying ? 'text-[#D5B25D]' : 'text-white/50'
      }`}>
        {isMusicPlaying ? '♪ ON' : '♪ OFF'}
      </div>

      {/* Equalizer bars when playing */}
      <AnimatePresence>
        {isMusicPlaying && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-[2px]">
            {BAR_CONFIG.map((cfg, i) => (
              <motion.div
                key={i}
                className="w-[2px] rounded-full bg-[#D5B25D]"
                initial={{ height: 2 }}
                animate={{
                  height: [3, cfg.peak1, 4, cfg.peak2, 3],
                }}
                transition={{
                  duration: cfg.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
