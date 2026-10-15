import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchWishlist } from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

export default function Products({
  user,
  onHome,
  onPassword,
  onLogout,
  submitting,
}) {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    () => searchParams.get("category") || "",
  );
  const [sort, setSort] = useState("");
  const [status, setStatus] = useState("loading");
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    fetchWishlist()
      .then(({ wishlist }) =>
        setWishlistIds(new Set(wishlist.map((item) => item._id))),
      )
      .catch(() => setWishlistIds(new Set()));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const request = window.setTimeout(() => {
      setStatus(products.length ? "refreshing" : "loading");
      fetchProducts({ search, category, sort }, controller.signal)
        .then((items) => {
          setProducts(items);
          setStatus(items.length ? "ready" : "empty");
        })
        .catch((error) => {
          if (error.name !== "AbortError") setStatus("error");
        });
    }, 350);
    return () => {
      window.clearTimeout(request);
      controller.abort();
    };
  }, [search, category, sort]);

  return (
    <main className="shop-page">
      <Navbar
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onLogout={onLogout}
        submitting={submitting}
      />
      <section className="page-intro">
        <span className="eyebrow">The ShopKart collection</span>
        <h1>Find something good.</h1>
        <p>Browse practical favorites and small upgrades for everyday life.</p>
      </section>
      <SearchBar
        search={search}
        category={category}
        sort={sort}
        onSearch={setSearch}
        onCategory={setCategory}
        onSort={setSort}
      />
      {status === "loading" && <div className="state">Loading products...</div>}
      {status === "error" && (
        <div className="state error-state">
          Something went wrong while loading products.
        </div>
      )}
      {status === "empty" && <div className="state">No products found.</div>}
      {(status === "ready" || status === "refreshing") && (
        <div className="product-grid">
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
      )}
      {status === "refreshing" && (
        <p className="refresh-note">Updating results...</p>
      )}
    </main>
  );
}
