import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchOrders } from "../services/api";

function getStatusBadgeClass(status) {
    if (status === "PLACED" || status === "PAID") return "status-badge placed";
    if (status === "PENDING_PAYMENT" || status === "PENDING") return "status-badge pending";
    return "status-badge default";
}

export default function Orders({ user, onHome, onPassword, onLogout, submitting }) {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders()
            .then(({ orders: results }) => {
                setOrders(results || []);
            })
            .catch((requestError) => {
                setError(requestError.message || "Unable to load your orders.");
            })
            .finally(() => setLoading(false));
    }, []);

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
                <span className="eyebrow">Your purchase history</span>
                <h1>My Orders</h1>
            </section>

            {location.state?.cancelledMessage && (
                <div className="success-banner">{location.state.cancelledMessage}</div>
            )}

            {loading && <div className="state">Loading your orders...</div>}
            {!loading && error && <div className="state error-state">{error}</div>}
            {!loading && !error && orders.length === 0 && (
                <div className="empty-wishlist">
                    <div className="empty-heart">📦</div>
                    <h2>You have not placed any orders yet.</h2>
                    <p>Your recent purchases will show up here.</p>
                    <Link className="primary empty-action" to="/products">
                        Start Shopping
                    </Link>
                </div>
            )}
            {!loading && !error && orders.length > 0 && (
                <div className="orders-list">
                    {orders.map((order) => (
                        <article key={order._id} className="order-card">
                            <div className="order-card-header">
                                <div>
                                    <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                                    <p>{new Date(order.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}</p>
                                </div>
                                <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                            </div>
                            <div className="order-items-preview">
                                {order.items.map((item) => (
                                    <span key={`${order._id}-${item.product}`}>
                                        {item.name} × {item.quantity}
                                    </span>
                                ))}
                            </div>
                            <div className="order-footer">
                                <strong>Total: ₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                                <Link className="outline" to={`/orders/${order._id}`}>
                                    View Details
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
