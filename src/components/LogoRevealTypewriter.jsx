"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";

const noopSubscribe = () => () => {};
const getServerDir = () => false;

const LOGO_SRC = "/brand/logo-navbar-real.png";
const LOGO_ASPECT = 1029 / 461;
const LOGO_EM_HEIGHT = 1.35;
const LOGO_EM_WIDTH = +(LOGO_EM_HEIGHT * LOGO_ASPECT).toFixed(3);
const LOGO_REVEAL_MS = 700;

// Splits a text into the part before/after the literal "MAN" substring, but
// only for Arabic — every other locale (and any Arabic phrase that doesn't
// contain "MAN") is left completely untouched and renders as plain text,
// exactly like the plain TypewriterText it replaces.
function splitAroundLogo(text, lang) {
  if (lang !== "ar") return { hasLogo: false, prefix: text, suffix: "" };
  const idx = text.indexOf("MAN");
  if (idx === -1) return { hasLogo: false, prefix: text, suffix: "" };
  return { hasLogo: true, prefix: text.slice(0, idx), suffix: text.slice(idx + 3) };
}

/**
 * LogoRevealTypewriter
 *
 * Drop-in replacement for TypewriterText that additionally understands one
 * special case: when the active (Arabic) phrase contains the literal word
 * "MAN", that word is typed as the real company logo instead of text — the
 * text before/after it is still typed and deleted exactly like today, and
 * the logo itself progressively reveals/hides via an animated clip-path,
 * continuing the same left/right growth direction the surrounding RTL
 * characters already animate in.
 */
export default function LogoRevealTypewriter({
  texts = [""],
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  loop = true,
  cursor = true,
  cursorClassName = "animate-cursor-blink",
  className = "",
  textClassNames = [],
  lang,
}) {
  const initialParts = splitAroundLogo(texts[0] ?? "", lang);

  const [prefixDisplay, setPrefixDisplay] = useState(initialParts.prefix);
  const [suffixDisplay, setSuffixDisplay] = useState("");
  const [logoMounted, setLogoMounted] = useState(false);
  const [logoRevealed, setLogoRevealed] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  const timeoutRef = useRef(null);
  const isFirstRunRef = useRef(true);

  const isRTL = useSyncExternalStore(
    noopSubscribe,
    () => document.dir === "rtl",
    getServerDir
  );

  useEffect(() => {
    let active = true;

    const schedule = (fn, ms) => {
      timeoutRef.current = setTimeout(() => {
        if (active) fn();
      }, ms);
    };

    const typeChars = (full, setDisplay, onDone) => {
      if (full.length === 0) { onDone(); return; }
      let n = 0;
      const step = () => {
        if (!active) return;
        n += 1;
        setDisplay(full.slice(0, n));
        if (n < full.length) schedule(step, typingSpeed);
        else onDone();
      };
      step();
    };

    const deleteChars = (full, setDisplay, onDone) => {
      if (full.length === 0) { onDone(); return; }
      let n = full.length;
      const step = () => {
        if (!active) return;
        n -= 1;
        setDisplay(full.slice(0, n));
        if (n > 0) schedule(step, deletingSpeed);
        else onDone();
      };
      step();
    };

    // Mounts the logo hidden, then flips it to revealed on the next tick so
    // the clip-path transition actually plays (a same-frame mount+reveal
    // would be batched and skip the animation). Cursor hides for the
    // duration — it's a graphic, not a typed character.
    const revealLogo = (onDone) => {
      setCursorVisible(false);
      setLogoRevealed(false);
      setLogoMounted(true);
      schedule(() => {
        setLogoRevealed(true);
        schedule(() => {
          setCursorVisible(true);
          onDone();
        }, LOGO_REVEAL_MS);
      }, 30);
    };

    const hideLogo = (onDone) => {
      setCursorVisible(false);
      setLogoRevealed(false);
      schedule(() => {
        setLogoMounted(false);
        setCursorVisible(true);
        onDone();
      }, LOGO_REVEAL_MS);
    };

    const deleteSequence = (parts, onDone) => {
      deleteChars(parts.suffix, setSuffixDisplay, () => {
        if (parts.hasLogo) {
          hideLogo(() => deleteChars(parts.prefix, setPrefixDisplay, onDone));
        } else {
          deleteChars(parts.prefix, setPrefixDisplay, onDone);
        }
      });
    };

    const playIndex = (idx) => {
      const parts = splitAroundLogo(texts[idx] ?? "", lang);
      setActiveTextIndex(idx);

      const goNext = () => {
        const nextIndex = (idx + 1) % texts.length;
        schedule(() => playIndex(nextIndex), typingSpeed);
      };

      const afterTyped = () => {
        const hasMore = loop || idx < texts.length - 1;
        if (!hasMore) return;
        schedule(() => deleteSequence(parts, goNext), pauseDuration);
      };

      typeChars(parts.prefix, setPrefixDisplay, () => {
        if (parts.hasLogo) {
          revealLogo(() => typeChars(parts.suffix, setSuffixDisplay, afterTyped));
        } else {
          afterTyped();
        }
      });
    };

    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      // Already painted with the full first phrase (see initial state) for
      // LCP stability, same reasoning as TypewriterText. Jump straight to
      // "just finished typing": pause, then delete.
      const parts0 = splitAroundLogo(texts[0] ?? "", lang);
      const hasMore = loop || texts.length > 1;
      if (hasMore) {
        schedule(() => {
          deleteSequence(parts0, () => {
            const nextIndex = 1 % texts.length;
            schedule(() => playIndex(nextIndex), typingSpeed);
          });
        }, pauseDuration);
      }
    } else {
      // Reset whenever the text array or timing/lang props change.
      clearTimeout(timeoutRef.current);
      schedule(() => {
        setPrefixDisplay("");
        setSuffixDisplay("");
        setLogoMounted(false);
        setLogoRevealed(false);
        setCursorVisible(true);
        playIndex(0);
      }, typingSpeed);
    }

    return () => {
      active = false;
      clearTimeout(timeoutRef.current);
    };
  }, [texts, typingSpeed, deletingSpeed, pauseDuration, loop, lang]);

  const textClass = textClassNames[activeTextIndex] ?? "";

  return (
    <span className={`inline-flex flex-wrap items-center ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      <span className={`whitespace-pre-wrap ${textClass}`}>{prefixDisplay}</span>
      {logoMounted && (
        <span
          className="relative inline-block align-middle mx-1.5"
          style={{
            height: `${LOGO_EM_HEIGHT}em`,
            width: `${LOGO_EM_WIDTH}em`,
            clipPath: logoRevealed ? "inset(0 0 0 0%)" : "inset(0 0 0 100%)",
            transition: `clip-path ${LOGO_REVEAL_MS}ms ease`,
            filter:
              "drop-shadow(0 0 10px rgba(255,255,255,0.35)) drop-shadow(0 0 22px rgba(232,196,106,0.30))",
          }}
        >
          <Image src={LOGO_SRC} alt="MAN" fill sizes="300px" className="object-contain" />
        </span>
      )}
      <span className={`whitespace-pre-wrap ${textClass}`}>{suffixDisplay}</span>
      {cursor && cursorVisible && (
        <span
          className={`inline-block w-[2px] h-[1em] bg-current ml-0.5 align-middle ${cursorClassName}`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
