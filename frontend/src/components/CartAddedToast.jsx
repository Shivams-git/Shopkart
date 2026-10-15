import { Link } from "react-router-dom";
import { createPortal } from "react-dom";

export default function CartAddedToast({ productName, onClose }) {
    return createPortal(
        <aside className="cart-added-toast" role="status" aria-live="polite">
            <button
                className="cart-added-toast-close"
                type="button"
                onClick={onClose}
                aria-label="Dismiss cart confirmation"
            >
                ×
            </button>
            <span className="cart-added-toast-icon" aria-hidden="true">
                ✓
            </span>
            <div className="cart-added-toast-copy">
                <strong>Added to your cart</strong>
                <span>{productName}</span>
            </div>
            <Link className="cart-added-toast-action" to="/cart" onClick={onClose}>
                Review cart
            </Link>
        </aside>,
        document.body,
    );
}
