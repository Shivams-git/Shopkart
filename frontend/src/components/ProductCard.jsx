import { Link } from "react-router-dom";
import { addToWishlist, removeFromWishlist } from "../services/api";
import CartProductControl from "./CartProductControl";
import { useEffect, useState } from "react";

export default function ProductCard({
  product,
  isWishlisted = false,
  onWishlistChange,
  wishlistContext = false,
}) {
  const [saved, setSaved] = useState(isWishlisted);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSaved(isWishlisted);
  }, [isWishlisted]);

  const toggleWishlist = async () => {
    if (saving) return;

    setSaving(true);
    setError("");
    try {
      if (saved) {
        await removeFromWishlist(product._id);
        setSaved(false);
        onWishlistChange?.(product._id, false);
      } else {
        await addToWishlist(product._id);
        setSaved(true);
        onWishlistChange?.(product._id, true);
      }
    } catch (requestError) {
      setError(requestError.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="product-card">
      <Link
        className="product-card-main"
        to={`/products/${product._id}`}
        aria-label={`View ${product.name} details`}
      >
        <img src={product.image} alt={product.name} />
        <div className="product-card-body">
          <span className="product-category">{product.category}</span>
          <h2>{product.name}</h2>
          <p className="price">₹{product.price.toLocaleString("en-IN")}</p>
          <p className={product.stock ? "stock" : "stock sold-out"}>
            {product.stock ? `${product.stock} units left` : "Out of stock"}
          </p>
        </div>
      </Link>
      <div className="product-card-actions">
        <CartProductControl product={product} />
        <button
          className={`wishlist-button ${saved ? "saved" : ""}`}
          onClick={toggleWishlist}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : saved && wishlistContext
              ? "Remove from Wishlist"
              : saved
                ? "♥ Added to Wishlist"
                : "♡ Add to Wishlist"}
        </button>
        {error && <p className="wishlist-error">{error}</p>}
      </div>
    </article>
  );
}
