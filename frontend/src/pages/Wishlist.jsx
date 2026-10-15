import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWishlist } from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";

export default function Wishlist({
  user,
  onHome,
  onPassword,
  onLogout,
  submitting,
}) {
  const [wishlist, setWishlist] = useState([]);
  const [status, setStatus] = useState("loading");

  const loadWishlist = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetchWishlist();
      setWishlist(response.wishlist || []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const removeProduct = (productId) => {
    setWishlist((items) => items.filter((item) => item._id !== productId));
  };

  return (
    <main className="shop-page">
      <Navbar
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onLogout={onLogout}
        submitting={submitting}
      />

      <section className="page-intro wishlist-intro">
        <span className="eyebrow">Saved for later</span>
        <h1>My Wishlist</h1>
        {status === "ready" && (
          <p>
            {wishlist.length} {wishlist.length === 1 ? "product" : "products"}{" "}
            saved
          </p>
        )}
      </section>

      {status === "loading" && (
        <div className="state">Loading your wishlist...</div>
      )}
      {status === "error" && (
        <div className="state error-state">
          <p>Unable to load wishlist.</p>
          <button className="outline" onClick={loadWishlist}>
            Try again
          </button>
        </div>
      )}
      {status === "ready" && wishlist.length === 0 && (
        <div className="empty-wishlist">
          <div className="empty-heart">♥</div>
          <h2>Your wishlist is empty</h2>
          <p>Save products you love and find them here later.</p>
          <Link className="primary empty-action" to="/products">
            Browse products
          </Link>
        </div>
      )}
      {status === "ready" && wishlist.length > 0 && (
        <div className="product-grid">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemoved={removeProduct}
            />
          ))}
        </div>
      )}
    </main>
  );
}
