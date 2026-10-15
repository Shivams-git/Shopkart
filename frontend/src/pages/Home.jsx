import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, fetchWishlist } from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

export default function Home({ user, onPassword, onLogout, submitting }) {
  return (
    <main className="home">
      <Navbar
        user={user}
        onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onPassword={onPassword}
        onLogout={onLogout}
        submitting={submitting}
        home
      />
      <Hero />
      <section id="categories">
        <div className="heading">
          <h2>Shop by category</h2>
          <span>Explore the collection</span>
        </div>
        <div className="categories">
          <Category
            icon="⌂"
            title="Home & living"
            text="Comfort starts here."
            to="/products?category=Home"
          />
          <Category
            icon="✦"
            title="Everyday picks"
            text="Small things, well chosen."
            to="/products"
          />
          <Category
            icon="♡"
            title="Personal care"
            text="Feel-good essentials."
            to="/products"
          />
        </div>
      </section>
      <NewArrivals />
      <section id="about" className="about-section">
        <span className="eyebrow">A little about ShopKart</span>
        <h2>Useful things, chosen with care.</h2>
        <p>
          ShopKart brings together everyday essentials, thoughtful upgrades, and
          small discoveries in one simple place.
        </p>
        <Link className="outline" to="/products">
          Browse the collection
        </Link>
      </section>
    </main>
  );
}

function Hero() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts({ sort: "newest" }, controller.signal)
      .then((items) => setProducts(items.slice(0, 5)))
      .catch((error) => {
        if (error.name !== "AbortError") setProducts([]);
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Fresh finds, just for you</span>
        <h1>Everything you need, all in one place.</h1>
        <p>Explore a curated selection made for your everyday moments.</p>
        <Link className="primary shop" to="/products">
          Start exploring
        </Link>
      </div>
      {products.length > 0 && (
        <div className="hero-collage" aria-label="Featured products">
          {products.map((product, index) => (
            <Link
              className={`hero-product hero-product-${index + 1}`}
              key={product._id}
              to={`/products/${product._id}`}
              aria-label={`View ${product.name}`}
              style={{ "--product-order": index }}
            >
              <img src={product.image} alt={product.name} />
              <span className="hero-product-caption">
                <span>{product.category}</span>
                <strong>{product.name}</strong>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  useEffect(() => {
    const controller = new AbortController();
    fetchProducts({ sort: "newest" }, controller.signal)
      .then((items) => setProducts(items.slice(0, 3)))
      .catch((error) => {
        if (error.name !== "AbortError") setProducts([]);
      });
    fetchWishlist()
      .then(({ wishlist }) =>
        setWishlistIds(new Set(wishlist.map((item) => item._id))),
      )
      .catch(() => setWishlistIds(new Set()));
    return () => controller.abort();
  }, []);
  return (
    <section id="new" className="arrivals-section">
      <div className="heading">
        <div>
          <span className="eyebrow">Just landed</span>
          <h2>New arrivals</h2>
        </div>
        <Link className="text-link" to="/products">
          View all products
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="product-grid arrivals-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isWishlisted={wishlistIds.has(product._id)}
              onWishlistChange={(productId, saved) => {
                setWishlistIds((current) => {
                  const next = new Set(current);
                  if (saved) next.add(productId);
                  else next.delete(productId);
                  return next;
                });
              }}
            />
          ))}
        </div>
      ) : (
        <p className="section-note">Fresh finds are on their way.</p>
      )}
    </section>
  );
}

function Category({ icon, title, text, to }) {
  return (
    <Link className="category" to={to}>
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="category-action">Explore collection →</span>
    </Link>
  );
}
