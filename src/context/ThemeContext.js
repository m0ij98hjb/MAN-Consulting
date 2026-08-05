"use client";

import { createContext, useContext } from "react";

// Single permanent dark theme — no toggle, no localStorage, no class toggling.
// The context is kept so existing imports (`useTheme()`) continue to work;
// they just always receive { theme: "dark", toggleTheme: noop }.
const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
