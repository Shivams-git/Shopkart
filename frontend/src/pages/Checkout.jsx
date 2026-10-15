import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { createPaymentOrder, verifyPayment } from "../services/api";

const emptyAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
};

export default function Checkout({ user, onHome, onPassword, onProducts, onLogout, submitting }) {
    const navigate = useNavigate();
    const { cartItems, itemCount, loading, error, refreshCart } = useCart();
    const [address, setAddress] = useState(emptyAddress);
    const [formError, setFormError] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);
    const [mockCheckout, setMockCheckout] = useState(null);

    const subtotal = useMemo(
        () => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
        [cartItems],
    );

    const updateAddress = (event) => {
        const { name, value } = event.target;
        setAddress((current) => ({ ...current, [name]: value }));
    };

    const validateAddress = () => {
        const values = { ...address };
        for (const key of Object.keys(values)) {
            if (typeof values[key] !== "string") continue;
            values[key] = values[key].trim();
        }

        if (!values.fullName) return "Full name is required.";
        if (!values.phone) return "Phone number is required.";
        if (!/^\d{10}$/.test(values.phone.replace(/\s+/g, ""))) {
            return "Phone number must contain 10 digits.";
        }
        if (!values.addressLine1) return "Address is required.";
        if (!values.city) return "City is required.";
        if (!values.state) return "State is required.";
        if (!values.pincode || !/^\d{6}$/.test(values.pincode)) {
            return "Pincode must contain 6 digits.";
        }

        return "";
    };

    const openMockCheckout = async (checkoutData) => {
        setMockCheckout({
            amount: checkoutData.amount,
            currency: checkoutData.currency,
            orderId: checkoutData.razorpayOrderId,
            shopKartOrderId: checkoutData.shopKartOrderId,
            title: "ShopKart Test Mode",
        });
    };

    const payWithMockCheckout = async () => {
        if (!mockCheckout) return;

        setPlacingOrder(true);
        try {
            const payload = {
                shopKartOrderId: mockCheckout.shopKartOrderId,
                razorpay_order_id: mockCheckout.orderId,
                razorpay_payment_id: `mock_payment_${Date.now()}`,
                razorpay_signature: `mock_signature_${mockCheckout.shopKartOrderId}`,
            };

            const result = await verifyPayment(payload);
            if (!result.success) {
                throw new Error(result.message || "Payment verification failed.");
            }

            setMockCheckout(null);
            navigate(`/order-success/${result.order._id}`);
        } catch (error) {
            setPaymentError(error.message || "Payment verification failed.");
            setMockCheckout(null);
        } finally {
            setPlacingOrder(false);
        }
    };

    const handlePlaceOrder = async (event) => {
        event.preventDefault();
        setPaymentError("");
        setFormError("");

        const validationMessage = validateAddress();
        if (validationMessage) {
            setFormError(validationMessage);
            return;
        }

        if (cartItems.length === 0) {
            setFormError("Your cart is empty.");
            return;
        }

        setPlacingOrder(true);
        try {
            const result = await createPaymentOrder(address);
            if (!result.success) {
                throw new Error(result.message || "Unable to create order.");
            }

            if (result.mockMode) {
                await openMockCheckout(result);
                return;
            }

            const scriptLoaded = await new Promise((resolve) => {
                const existing = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");
                if (existing) {
                    if (window.Razorpay) {
                        resolve(true);
                        return;
                    }
                    existing.onload = () => resolve(true);
                    existing.onerror = () => resolve(false);
                    return;
                }

                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });

            if (!scriptLoaded || !window.Razorpay) {
                throw new Error("Unable to load Razorpay checkout.");
            }

            const razorpay = new window.Razorpay({
                key: result.key,
                amount: result.amount,
                currency: result.currency,
                name: "ShopKart",
                description: "Order payment",
                order_id: result.razorpayOrderId,
                prefill: {
                    name: address.fullName,
                    contact: address.phone,
                },
                handler: async function (paymentResponse) {
                    try {
                        const verifyResult = await verifyPayment({
                            shopKartOrderId: result.shopKartOrderId,
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature,
                        });
                        if (!verifyResult.success) {
                            throw new Error(verifyResult.message || "Payment verification failed.");
                        }
                        navigate(`/order-success/${verifyResult.order._id}`);
                    } catch (error) {
                        setPaymentError(error.message || "Payment verification failed.");
                    }
                },
                theme: { color: "#205440" },
            });

            razorpay.on("payment.failed", function () {
                setPaymentError("Payment failed. Your cart has not been cleared.");
            });

            razorpay.open();
        } catch (error) {
            setPaymentError(error.message || "Unable to place order.");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <main className="shop-page">
                <Navbar
                    user={user}
                    onHome={onHome}
                    onPassword={onPassword}
                    onLogout={onLogout}
                    submitting={submitting}
                />
                <div className="state">Loading checkout...</div>
            </main>
        );
    }

    if (!loading && cartItems.length === 0) {
        return (
            <main className="shop-page">
                <Navbar
                    user={user}
                    onHome={onHome}
                    onPassword={onPassword}
                    onLogout={onLogout}
                    submitting={submitting}
                />
                <div className="empty-wishlist">
                    <div className="empty-heart">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Add a few products before you check out.</p>
                    <Link className="primary empty-action" to="/products">
                        Browse Products
                    </Link>
                </div>
            </main>
        );
    }

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
                <span className="eyebrow">Complete your order</span>
                <h1>Checkout</h1>
            </section>
            <form className="checkout-layout" onSubmit={handlePlaceOrder}>
                <section className="checkout-panel">
                    <h2>Shipping Details</h2>
                    <div className="checkout-grid">
                        <label>
                            <span>Full Name</span>
                            <input name="fullName" value={address.fullName} onChange={updateAddress} />
                        </label>
                        <label>
                            <span>Phone</span>
                            <input name="phone" value={address.phone} onChange={updateAddress} />
                        </label>
                        <label className="full-width">
                            <span>Address</span>
                            <input name="addressLine1" value={address.addressLine1} onChange={updateAddress} />
                        </label>
                        <label>
                            <span>City</span>
                            <input name="city" value={address.city} onChange={updateAddress} />
                        </label>
                        <label>
                            <span>State</span>
                            <input name="state" value={address.state} onChange={updateAddress} />
                        </label>
                        <label>
                            <span>Pincode</span>
                            <input name="pincode" value={address.pincode} onChange={updateAddress} />
                        </label>
                    </div>
                    {formError && <p className="wishlist-error">{formError}</p>}
                </section>

                <aside className="checkout-summary">
                    <h2>Order Summary</h2>
                    <div className="checkout-items">
                        {cartItems.map((item) => (
                            <div key={item.product._id} className="checkout-item">
                                <span>
                                    {item.product.name} × {item.quantity}
                                </span>
                                <strong>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</strong>
                            </div>
                        ))}
                    </div>
                    <div className="summary-total">
                        <span>Total : </span>
                        <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                    </div>
                    {paymentError && <p className="wishlist-error">{paymentError}</p>}
                    {error && <p className="wishlist-error">{error}</p>}
                    <button className="primary checkout-submit" type="submit" disabled={placingOrder || submitting}>
                        {placingOrder ? "Placing order..." : "Place Order"}
                    </button>
                </aside>
            </form>

            {mockCheckout && (
                <div className="razorpay-modal-backdrop" onClick={() => setMockCheckout(null)}>
                    <div className="razorpay-checkout-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="razorpay-header">
                            <div>
                                <span className="razorpay-badge">Razorpay Test Mode</span>
                                <h3>{mockCheckout.title}</h3>
                            </div>
                            <button type="button" className="close-checkout-button" onClick={() => setMockCheckout(null)}>
                                ×
                            </button>
                        </div>
                        <div className="razorpay-body">
                            <div className="razorpay-order-row">
                                <span>Order ID</span>
                                <strong>{mockCheckout.orderId}</strong>
                            </div>
                            <div className="razorpay-order-row">
                                <span>Amount</span>
                                <strong>₹{(mockCheckout.amount / 100).toLocaleString("en-IN")}</strong>
                            </div>
                            <div className="razorpay-order-row">
                                <span>Currency</span>
                                <strong>{mockCheckout.currency}</strong>
                            </div>
                        </div>
                        <div className="razorpay-actions">
                            <button type="button" className="outline" onClick={() => setMockCheckout(null)}>
                                Cancel
                            </button>
                            <button type="button" className="primary" onClick={payWithMockCheckout}>
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
