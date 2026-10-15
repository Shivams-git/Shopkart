import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Cart({
    user,
    onHome,
    onPassword,
    onLogout,
    submitting,
}) {
    const { cartItems, itemCount, loading, error, refreshCart } = useCart();
    const subtotal = cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
    );

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
                <span className="eyebrow">Ready when you are</span>
                <h1>My Cart</h1>
            </section>

            {loading && <div className="state">Loading your cart...</div>}
            {!loading && error && (
                <div className="state error-state">
                    <p>Unable to load your cart.</p>
                    <button
                        className="outline"
                        onClick={() => refreshCart().catch(() => { })}
                    >
                        Try again
                    </button>
                </div>
            )}
            {!loading && !error && cartItems.length === 0 && (
                <div className="empty-wishlist">
                    <div className="empty-heart">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything yet.</p>
                    <Link className="primary empty-action" to="/products">
                        Browse Products
                    </Link>
                </div>
            )}
            {!loading && !error && cartItems.length > 0 && (
                <div className="cart-layout">
                    <section className="cart-items" aria-label="Cart items">
                        {cartItems.map((item) => (
                            <CartItem key={item.product._id} item={item} />
                        ))}
                    </section>
                    <aside className="order-summary">
                        <h2>Order Summary</h2>
                        <div className="checkout-items summary-items-list">
                            {cartItems.map((item) => (
                                <div key={`summary-${item.product._id}`} className="checkout-item">
                                    <span>
                                        {item.product.name} × {item.quantity}
                                    </span>
                                    <strong>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</strong>
                                </div>
                            ))}
                        </div>
                        <div>
                            <span>Items</span>
                            <strong>{itemCount}</strong>
                        </div>
                        <div className="summary-total">
                            <span>Subtotal</span>
                            <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                        </div>
                        <Link className="primary checkout-button" to="/checkout">
                            Proceed to Checkout
                        </Link>
                        <p>Secure checkout, stock re-check, and order confirmation included.</p>
                    </aside>
                </div>
            )}
        </main>
    );
}
