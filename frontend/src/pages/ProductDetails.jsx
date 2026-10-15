import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchProduct } from "../services/api";
import Navbar from "../components/Navbar";
import CartProductControl from "../components/CartProductControl";

export default function ProductDetails({
  user,
  onHome,
  onPassword,
  onProducts,
  onLogout,
  submitting,
}) {
  const { pathname } = useLocation();
  const id = pathname.split("/").pop();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    fetchProduct(id)
      .then((item) => {
        setProduct(item);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);
  return (
    <main className="shop-page">
      <Navbar
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onLogout={onLogout}
        submitting={submitting}
      />
      <button className="back-link" onClick={onProducts}>
        ← Back to products
      </button>
      {status === "loading" && <div className="state">Loading product...</div>}
      {status === "error" && (
        <div className="state error-state">
          Something went wrong while loading this product.
        </div>
      )}
      {status === "ready" && product && (
        <article className="product-detail">
          <div className="product-detail-media">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-detail-copy">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            <h2 className="detail-section-title">About this product</h2>
            <p className="detail-description">{product.description}</p>
            <div className="detail-purchase">
              <div className="detail-price-block">
                <span className="detail-label">Price</span>
                <p className="detail-price">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>
              <p
                className={
                  product.stock ? "detail-stock" : "detail-stock sold-out"
                }
              >
                <span className="stock-indicator" aria-hidden="true" />
                {product.stock
                  ? `${product.stock} units available`
                  : "Out of stock"}
              </p>
            </div>
            <dl className="product-facts">
              <div>
                <dt>Category</dt>
                <dd>{product.category}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>
                  {product.stock > 0 ? "In stock" : "Currently unavailable"}
                </dd>
              </div>
            </dl>
            <CartProductControl product={product} />
          </div>
        </article>
      )}
    </main>
  );
}
