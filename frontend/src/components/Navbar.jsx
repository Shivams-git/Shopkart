import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({
  user,
  onHome,
  onPassword,
  onLogout,
  submitting,
  home = false,
}) {
  const initial = (user.fullName || "Shopper").charAt(0).toUpperCase();
  const { itemCount } = useCart();
  const { theme, setTheme } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const themes = [
    { id: "light", label: "Light", colors: ["#f8f6f0", "#205440", "#e86636"] },
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
  const activeTheme = themes.find((option) => option.id === theme) || themes[0];

  return (
    <header>
      <button className="brand" onClick={onHome}>
        shop<i>kart</i>.
      </button>

      {home ? (
        <nav>
          <a href="#categories">Categories</a>
          <a href="#new">New arrivals</a>
          <a href="#about">About us</a>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart ({itemCount})</Link>
          <Link to="/orders">My Orders</Link>
        </nav>
      ) : (
        <nav>
          <Link to="/products">Products</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart ({itemCount})</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/home#categories">Categories</Link>
        </nav>
      )}

      <div className="header-actions">
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
              {themes.map((option) => (
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
        <div className="account">
          <div
            className="account-menu"
            data-open={accountMenuOpen}
            onMouseEnter={() => setAccountMenuOpen(true)}
            onMouseLeave={() => setAccountMenuOpen(false)}
            onFocusCapture={() => setAccountMenuOpen(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setAccountMenuOpen(false);
              }
            }}
          >
            <button
              className="account-identity"
              type="button"
              aria-expanded={accountMenuOpen}
              aria-haspopup="true"
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              <div className="avatar">{initial}</div>
              <span className="account-name">{user.fullName || "Shopper"}</span>
              <span className="account-chevron" aria-hidden="true" />
            </button>
            <div
              className="account-dropdown"
              role="group"
              aria-label="Account actions"
            >
              {onPassword && (
                <button
                  className="account-menu-item"
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    onPassword();
                  }}
                >
                  Change password
                </button>
              )}
              <button
                className="account-menu-item account-logout-item"
                type="button"
                onClick={() => {
                  setAccountMenuOpen(false);
                  onLogout();
                }}
                disabled={submitting}
              >
                {submitting ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
