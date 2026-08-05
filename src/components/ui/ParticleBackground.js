'use client';

/* Deterministic particle grid — same on server + client (no hydration mismatch).
   Extracted from the admin login page so the same twinkling-dot effect can run
   once, globally, instead of being duplicated per page. */
const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  id:      i,
  x:       ((i * 41 + 17) % 97) + 1.5,
  y:       ((i * 59 + 11) % 93) + 2,
  size:    (i % 4) * 0.5 + 0.6,
  opacity: ((i % 6) * 0.015 + 0.03),
  dur:     ((i % 5) * 0.8 + 2.2).toFixed(1),
  delay:   ((i % 9) * 0.3).toFixed(1),
}));

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity: var(--op); }
          50%      { opacity: calc(var(--op) * 5); }
        }
      `}</style>
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            width:  `${p.size}px`,
            height: `${p.size}px`,
            background: '#F2B233',
            '--op': p.opacity,
            animation: `twinkle ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
