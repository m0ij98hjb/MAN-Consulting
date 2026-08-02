'use client';

import { useEffect, useState, useRef } from 'react';

export default function CounterStat({ value, label, suffix = '+', displayValue = null, aosDeley = 0 }) {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  // Format displayed value
  const getDisplayValue = () => {
    if (displayValue && typeof displayValue === 'function') {
      return displayValue(count);
    }
    return count;
  };

  // Intersection Observer for when element enters viewport
  useEffect(() => {
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsInView(true);
          setHasAnimated(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3, rootMargin: '0px' }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasAnimated]);

  // Enhanced counter animation with easing
  useEffect(() => {
    if (!isInView) return;

    const end = value;
    const duration = 2500; // 2.5 seconds for smooth animation
    let animationFrameId;
    let startTime;

    const updateCount = (currentTime) => {
      if (!startTime) startTime = currentTime;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Enhanced easing function (cubic ease-out)
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      const currentCount = Math.floor(end * easedProgress);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, value]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center text-center"
      data-aos="fade-up"
      data-aos-delay={aosDeley}
    >
      <div className="text-4xl lg:text-5xl font-black text-white leading-none tabular-nums">
        {suffix === '%' 
          ? `${getDisplayValue()}%` 
          : suffix === 'k'
          ? `${getDisplayValue()}k`
          : `+${getDisplayValue()}`
        }
      </div>
      <span className="text-xs lg:text-sm text-white/70 mt-2 font-semibold tracking-wide">{label}</span>
    </div>
  );
}
