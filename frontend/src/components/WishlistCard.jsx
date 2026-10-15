import ProductCard from "./ProductCard";

export default function WishlistCard({ product, onRemoved }) {
  return (
    <ProductCard
      product={product}
      isWishlisted
      wishlistContext
      onWishlistChange={(productId, saved) => {
        if (!saved) onRemoved(productId);
      }}
    />
  );
}
