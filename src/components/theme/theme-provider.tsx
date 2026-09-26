"use client";

/**
 * Theme provider: manages light/dark mode with a class on <html>.
 *
 * - Respects the system preference on first load.
 * - Persists the user's explicit choice in localStorage.
 * - The initial class is set synchronously by an inline script in the root
 *   layout (`THEME_INIT_SCRIPT`, before React hydrates) to avoid a flash of
 *   the wrong theme; this provider only takes over for subsequent toggles.
 */

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * Inline script injected into <head> to set the `dark` class before the
 * first paint, preventing a flash of the wrong theme. Must stay in sync
 * with `getInitialTheme` below.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("sheetops-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("sheetops-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("sheetops-theme", theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = React.useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}