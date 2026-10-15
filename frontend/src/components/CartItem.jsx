import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartItem({ item }) {
    const { updateQuantity, removeFromCart } = useCart();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const { product, quantity } = item;

    const mutate = async (action) => {
        setBusy(true);
        setError("");
        try {
            await action();
        } catch (requestError) {
            setError(requestError.message || "Unable to update cart.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <article className="cart-item">
            <Link className="cart-item-image" to={`/products/${product._id}`}>
                <img src={product.image} alt={product.name} />
            </Link>
            <div className="cart-item-info">
                <span className="product-category">{product.category}</span>
                <h2>
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                </h2>
                <p className="price">₹{product.price.toLocaleString("en-IN")}</p>
                <p className={product.stock ? "stock" : "stock sold-out"}>
                    {product.stock ? `${product.stock} units available` : "Out of stock"}
                </p>
                <div
                    className="quantity-controls"
                    aria-label={`Quantity for ${product.name}`}
                >
                    <button
                        disabled={busy || quantity <= 1}
                        onClick={() =>
                            mutate(() => updateQuantity(product._id, quantity - 1))
                        }
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>
                    <span>{quantity}</span>
                    <button
                        disabled={busy || quantity >= product.stock}
                        onClick={() =>
                            mutate(() => updateQuantity(product._id, quantity + 1))
                        }
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>
                <button
                    className="remove-cart-button"
                    disabled={busy}
                    onClick={() => mutate(() => removeFromCart(product._id))}
                >
                    Remove
                </button>
                {error && <p className="wishlist-error">{error}</p>}
            </div>
            <strong className="cart-line-total">
                ₹{(product.price * quantity).toLocaleString("en-IN")}
            </strong>
        </article>
    );
}
