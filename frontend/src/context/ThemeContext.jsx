import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEMES = [
  "light",
  "dark",
  "midnight",
  "graphite",
  "berry",
  "ocean",
  "rose",
  "forest",
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const storedTheme = window.localStorage.getItem("shopkart-theme");
    return THEMES.includes(storedTheme) ? storedTheme : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("shopkart-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
