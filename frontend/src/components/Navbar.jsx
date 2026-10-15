import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ThemePicker from "./ThemePicker";

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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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
        <ThemePicker />
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
