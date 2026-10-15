import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchOrder } from "../services/api";

export default function OrderSuccess({ user, onHome, onPassword, onLogout, submitting }) {
    const { pathname } = useLocation();
    const orderId = pathname.split("/").pop();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            setError("No order was found to display.");
            return;
        }

        fetchOrder(orderId)
            .then(({ order: result }) => {
                setOrder(result);
            })
            .catch((requestError) => {
                setError(requestError.message || "Unable to load this order.");
            })
            .finally(() => setLoading(false));
    }, [orderId]);

    return (
        <main className="shop-page">
            <Navbar
                user={user}
                onHome={onHome}
                onPassword={onPassword}
                onLogout={onLogout}
                submitting={submitting}
            />
            <div className="empty-wishlist order-success-box">
                <div className="empty-heart">✅</div>
                {loading && <h2>Preparing your order receipt...</h2>}
                {!loading && error && (
                    <>
                        <h2>Order confirmation unavailable</h2>
                        <p>{error}</p>
                    </>
                )}
                {!loading && !error && order && (
                    <>
                        <h2>Order placed successfully</h2>
                        <div className="success-details">
                            <div>
                                <span>Order ID</span>
                                <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                            </div>
                            <div>
                                <span>Total</span>
                                <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                            </div>
                            <div>
                                <span>Status</span>
                                <strong className={getStatusBadgeClass(order.status)}>{order.status}</strong>
                            </div>
                        </div>
                        <p>Your order has been confirmed and saved.</p>
                    </>
                )}
                <div className="order-success-actions">
                    <Link className="primary" to="/orders">
                        View My Orders
                    </Link>
                    <Link className="outline" to="/products">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </main>
    );
}

function getStatusBadgeClass(status) {
    if (status === "PLACED" || status === "PAID") return "status-badge placed";
    if (status === "PENDING_PAYMENT" || status === "PENDING") return "status-badge pending";
    return "status-badge default";
}
