import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    addCartProduct,
    fetchCart,
    removeCartProduct,
    updateCartQuantity,
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refreshCart = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await fetchCart();
            setCartItems(result.cart || []);
            return result.cart || [];
        } catch (requestError) {
            setError(requestError.message || "Unable to load your cart.");
            throw requestError;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart().catch(() => { });
    }, [refreshCart]);

    const applyMutation = async (request) => {
        const result = await request();
        setCartItems(result.cart || []);
        setError("");
        return result;
    };

    const addToCart = (productId) =>
        applyMutation(() => addCartProduct(productId));
    const updateQuantity = (productId, quantity) =>
        applyMutation(() => updateCartQuantity(productId, quantity));
    const removeFromCart = (productId) =>
        applyMutation(() => removeCartProduct(productId));

    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const value = useMemo(
        () => ({
            cartItems,
            itemCount,
            loading,
            error,
            refreshCart,
            addToCart,
            updateQuantity,
            removeFromCart,
        }),
        [cartItems, itemCount, loading, error, refreshCart],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside CartProvider");
    return context;
}
