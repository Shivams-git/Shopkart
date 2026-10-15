import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export const THEMES = [
  { id: "light", label: "Light", colors: ["#f8fafc", "#0d9488", "#ea580c"] },
  { id: "dark", label: "Dark", colors: ["#151c1b", "#7ac7a0", "#ff9a70"] },
  {
    id: "midnight",
    label: "Midnight",
    colors: ["#111827", "#6fc6d2", "#f1bd73"],
  },
  {
    id: "graphite",
    label: "Graphite",
    colors: ["#202326", "#a8b6b1", "#e38b5b"],
  },
  {
    id: "berry",
    label: "Berry Night",
    colors: ["#261b25", "#d99abb", "#f09b7a"],
  },
  { id: "ocean", label: "Ocean", colors: ["#edf7f6", "#146d78", "#c4573c"] },
  { id: "rose", label: "Rose", colors: ["#fff4f4", "#835069", "#bf4f69"] },
  {
    id: "forest",
    label: "Forest",
    colors: ["#f2f5ed", "#456c4a", "#c46e3e"],
  },
];

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const activeTheme = THEMES.find((option) => option.id === theme) || THEMES[0];

  return (
    <div className="theme-picker">
      <button
        className="theme-picker-trigger"
        type="button"
        aria-label={`Color theme: ${activeTheme.label}`}
        aria-expanded={themeMenuOpen}
        aria-haspopup="true"
        onClick={() => setThemeMenuOpen((open) => !open)}
      >
        <span className="theme-trigger-swatches" aria-hidden="true">
          {activeTheme.colors.map((color) => (
            <i key={color} style={{ "--swatch-color": color }} />
          ))}
        </span>
        <span className="theme-trigger-label">Theme</span>
        <span className="theme-trigger-chevron" aria-hidden="true">
          {themeMenuOpen ? "−" : "+"}
        </span>
      </button>
      {themeMenuOpen && (
        <div
          className="theme-menu"
          role="group"
          aria-label="Choose a color theme"
        >
          <span className="theme-menu-heading">Choose a look</span>
          {THEMES.map((option) => (
            <button
              className={`theme-option ${theme === option.id ? "selected" : ""}`}
              key={option.id}
              type="button"
              aria-pressed={theme === option.id}
              onClick={() => {
                setTheme(option.id);
                setThemeMenuOpen(false);
              }}
            >
              <span className="theme-option-swatches" aria-hidden="true">
                {option.colors.map((color) => (
                  <i key={color} style={{ "--swatch-color": color }} />
                ))}
              </span>
              <span>{option.label}</span>
              {theme === option.id && (
                <span className="theme-option-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
