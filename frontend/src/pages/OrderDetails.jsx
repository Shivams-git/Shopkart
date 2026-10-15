import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { cancelOrder, fetchOrder } from "../services/api";

function getStatusBadgeClass(status) {
    if (status === "PLACED" || status === "PAID") return "status-badge placed";
    if (status === "PENDING_PAYMENT" || status === "PENDING") return "status-badge pending";
    if (status === "CANCELLED") return "status-badge cancelled";
    return "status-badge default";
}

export default function OrderDetails({ user, onHome, onPassword, onProducts, onLogout, submitting }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const id = pathname.split("/").pop();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [canceling, setCanceling] = useState(false);
    const [cancelMessage, setCancelMessage] = useState("");

    const loadOrder = async () => {
        try {
            const { order: result } = await fetchOrder(id);
            setOrder(result);
        } catch (requestError) {
            setError(requestError.message || "Unable to load this order.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [id]);

    const handleCancelOrder = async (event) => {
        event.preventDefault();
        if (!cancelReason.trim()) {
            setCancelMessage("Please tell us why you want to cancel this order.");
            return;
        }

        setCanceling(true);
        setCancelMessage("");
        try {
            const { order: updatedOrder } = await cancelOrder(order._id, cancelReason.trim());
            setOrder(updatedOrder);
            setCancelReason("");
            navigate("/orders", {
                state: {
                    cancelledMessage: "Order cancelled successfully.",
                },
            });
        } catch (requestError) {
            setCancelMessage(requestError.message || "Unable to cancel the order.");
        } finally {
            setCanceling(false);
        }
    };

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
                ← Back to orders
            </button>

            {loading && <div className="state">Loading order...</div>}
            {!loading && error && <div className="state error-state">{error}</div>}
            {!loading && !error && order && (
                <article className="order-detail">
                    <div className="order-detail-header">
                        <div>
                            <span className="eyebrow">Order summary</span>
                            <h1>Order #{order._id.slice(-6).toUpperCase()}</h1>
                        </div>
                        <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                    </div>

                    <div className="order-detail-grid">
                        <section className="order-detail-panel">
                            <h2>Items</h2>
                            <div className="order-items-list">
                                {order.items.map((item) => (
                                    <div key={`${order._id}-${item.product}`} className="order-item-row">
                                        <div className="order-item-meta">
                                            <img src={item.image} alt={item.name} />
                                            <div>
                                                <strong>{item.name}</strong>
                                                <span>{item.quantity} × ₹{item.price.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>
                                        <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <aside className="order-detail-panel">
                            <h2>Shipping</h2>
                            <p>{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                            <p>{order.shippingAddress.pincode}</p>
                            <p>{order.shippingAddress.phone}</p>
                            <div className="order-total-box">
                                <span>Total</span>
                                <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                            </div>
                            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && order.status !== "SHIPPED" && (
                                <form className="cancel-order-form" onSubmit={handleCancelOrder}>
                                    <label>
                                        <span>Cancellation reason</span>
                                        <textarea
                                            value={cancelReason}
                                            onChange={(event) => setCancelReason(event.target.value)}
                                            rows={3}
                                            placeholder="Tell us why you want to cancel this order"
                                        />
                                    </label>
                                    {cancelMessage && <p className="wishlist-error">{cancelMessage}</p>}
                                    <button type="submit" className="outline cancel-order-button" disabled={canceling}>
                                        {canceling ? "Cancelling..." : "Cancel Order"}
                                    </button>
                                </form>
                            )}
                            {order.status === "CANCELLED" && order.cancellationReason && (
                                <div className="cancelled-summary">
                                    <span>Cancellation reason</span>
                                    <p>{order.cancellationReason}</p>
                                </div>
                            )}
                            <Link className="primary" to="/orders">
                                View all orders
                            </Link>
                        </aside>
                    </div>
                </article>
            )}
        </main>
    );
}
