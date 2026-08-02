"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Both state updates are deferred together (not called synchronously in
    // the effect body) so they still land in the same commit — avoids any
    // one-frame flash of the default theme before the saved one applies.
    queueMicrotask(() => {
      const saved = localStorage.getItem("mnc-theme") || "light";
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
      setMounted(true);
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("mnc-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
