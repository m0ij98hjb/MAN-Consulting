"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const getServerDir = () => false;

/**
 * TypewriterText
 *
 * A production-ready typing animation component for Next.js + Tailwind.
 *
 * Features:
 *   - Letter-by-letter typing + optional deleting
 *   - Multi-text rotation with looping support
 *   - Auto RTL/LTR detection via document.dir
 *   - Blinking cursor with CSS animation
 *   - Zero memory leaks (timeouts cleared on unmount / prop change)
 *   - Fully typed, configurable props
 *
 * @param {string[]} texts           – Array of strings to rotate through
 * @param {number}   typingSpeed     – Milliseconds between each typed char (default 100)
 * @param {number}   deletingSpeed   – Milliseconds between each deleted char (default 50)
 * @param {number}   pauseDuration   – Milliseconds to pause before deleting (default 2000)
 * @param {boolean}  loop             – Whether to infinitely loop through texts (default true)
 * @param {boolean}  cursor           – Show blinking cursor (default true)
 * @param {string}   cursorClassName  – Extra Tailwind classes for the cursor element
 * @param {string}   className        – Extra Tailwind classes for the wrapper span
 * @param {string[]} textClassNames   – Extra Tailwind classes per text entry (matched by index)
 */
export default function TypewriterText({
  texts = [""],
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  loop = true,
  cursor = true,
  cursorClassName = "animate-cursor-blink",
  className = "",
  textClassNames = [],
}) {
  const [displayText, setDisplayText] = useState("");
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  // Refs avoid stale-closure issues inside setTimeout callbacks.
  const stateRef = useRef({
    textIndex: 0,
    isDeleting: false,
    currentText: "",
  });
  const timeoutRef = useRef(null);

  // SSR-safe page direction read (false on server/initial hydration, then the
  // real value) — no effect/state pair needed for a value this simple.
  const isRTL = useSyncExternalStore(
    noopSubscribe,
    () => document.dir === "rtl",
    getServerDir
  );

  // ------------------------------------------------------------------
  // Core typing engine
  // ------------------------------------------------------------------
  useEffect(() => {
    let active = true;

    // Reset whenever the text array or timing props change.
    stateRef.current = { textIndex: 0, isDeleting: false, currentText: "" };
    clearTimeout(timeoutRef.current);

    const tick = () => {
      if (!active) return;

      const { textIndex, isDeleting, currentText } = stateRef.current;
      const fullText = texts[textIndex] ?? "";

      if (isDeleting) {
        // Backspace one character.
        const nextText = currentText.slice(0, -1);
        stateRef.current.currentText = nextText;
        setDisplayText(nextText);

        if (nextText === "") {
          // Finished deleting → move to next text.
          stateRef.current.isDeleting = false;
          const nextIndex = (textIndex + 1) % texts.length;
          stateRef.current.textIndex = nextIndex;
          setActiveTextIndex(nextIndex);
          timeoutRef.current = setTimeout(tick, typingSpeed);
        } else {
          timeoutRef.current = setTimeout(tick, deletingSpeed);
        }
      } else {
        // Type one more character.
        const nextText = fullText.slice(0, currentText.length + 1);
        stateRef.current.currentText = nextText;
        setDisplayText(nextText);

        if (nextText === fullText) {
          // Finished typing this text.
          const hasMore = loop || textIndex < texts.length - 1;
          if (hasMore) {
            // Pause, then switch to deleting mode.
            timeoutRef.current = setTimeout(() => {
              if (!active) return;
              stateRef.current.isDeleting = true;
              tick();
            }, pauseDuration);
          }
          // If loop=false and this is the last text, we simply stop.
        } else {
          timeoutRef.current = setTimeout(tick, typingSpeed);
        }
      }
    };

    // Clear the displayed text, then kick off after one typing-speed delay.
    // Deferred into the timeout callback (rather than set synchronously in
    // the effect body) so the visual reset happens as a reaction to the
    // scheduled timer firing, not as a direct effect-body state update.
    timeoutRef.current = setTimeout(() => {
      if (!active) return;
      setDisplayText("");
      tick();
    }, typingSpeed);

    // Cleanup: flag + clear any pending timeout.
    return () => {
      active = false;
      clearTimeout(timeoutRef.current);
    };
  }, [texts, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <span className={`inline-block ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      <span className={`whitespace-pre-wrap ${textClassNames[activeTextIndex] ?? ""}`}>
        {displayText}
      </span>
      {cursor && (
        <span
          className={`inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle ${cursorClassName}`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
