import { useState } from "react";
import { useCart } from "../context/CartContext";
import CartAddedToast from "./CartAddedToast";

export default function CartProductControl({ product }) {
    const { cartItems, loading, addToCart, updateQuantity, removeFromCart } =
        useCart();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const cartItem = cartItems.find((item) => item.product?._id === product._id);

    const addProduct = async () => {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            await addToCart(product._id);
            setShowToast(true);
        } catch (requestError) {
            setError(requestError.message || "Unable to add product to cart.");
        } finally {
            setBusy(false);
        }
    };

    const changeQuantity = async (quantity) => {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            await updateQuantity(product._id, quantity);
        } catch (requestError) {
            setError(requestError.message || "Unable to update quantity.");
        } finally {
            setBusy(false);
        }
    };

    const decreaseQuantity = async () => {
        if (!cartItem || busy) return;
        if (cartItem.quantity === 1) {
            setBusy(true);
            setError("");
            try {
                await removeFromCart(product._id);
            } catch (requestError) {
                setError(requestError.message || "Unable to remove product from cart.");
            } finally {
                setBusy(false);
            }
            return;
        }

        await changeQuantity(cartItem.quantity - 1);
    };

    return (
        <>
            {loading && !cartItem ? (
                <button className="cart-add-button" type="button" disabled>
                    Loading cart...
                </button>
            ) : cartItem ? (
                <div
                    className="product-quantity-control"
                    aria-label={`Quantity of ${product.name} in cart`}
                    aria-busy={busy}
                >
                    <button
                        type="button"
                        aria-label={
                            cartItem.quantity === 1
                                ? `Remove ${product.name} from cart`
                                : `Decrease ${product.name} quantity`
                        }
                        onClick={decreaseQuantity}
                        disabled={busy}
                    >
                        −
                    </button>
                    <span className="product-quantity-value">{cartItem.quantity}</span>
                    <button
                        type="button"
                        aria-label={`Increase ${product.name} quantity`}
                        onClick={() => changeQuantity(cartItem.quantity + 1)}
                        disabled={busy || cartItem.quantity >= product.stock}
                    >
                        +
                    </button>
                </div>
            ) : (
                <button
                    className="cart-add-button"
                    type="button"
                    onClick={addProduct}
                    disabled={busy || !product.stock}
                >
                    {busy ? "Adding..." : "Add to Cart"}
                </button>
            )}
            {error && <p className="wishlist-error">{error}</p>}
            {showToast && (
                <CartAddedToast
                    productName={product.name}
                    onClose={() => setShowToast(false)}
                />
            )}
        </>
    );
}
