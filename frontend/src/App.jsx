import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Password from "./pages/Password";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import OrderSuccess from "./pages/OrderSuccess";
import { CartProvider } from "./context/CartContext";

const emptyRegister = { fullName: "", email: "", phone: "", password: "" };
const emptyPassword = { oldPassword: "", newPassword: "", confirmPassword: "" };

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "include", ...options });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(() => getPage(location.pathname));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ message: "", success: false });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [register, setRegister] = useState(emptyRegister);
  const [passwords, setPasswords] = useState(emptyPassword);
  const [submitting, setSubmitting] = useState(false);

  const message = (text, success = false) =>
    setNotice({ message: text, success });
  const noticeElement = notice.message ? (
    <p
      className={`notice ${notice.success ? "success" : ""}`}
      aria-live="polite"
    >
      {notice.message}
    </p>
  ) : null;

  const authenticate = async (destination = "home", shouldNavigate = true) => {
    const { response, body } = await api("/customers/me");
    if (response.ok) {
      setUser(body);
      setPage(destination);
      if (shouldNavigate) navigate(`/${destination}`);
    } else {
      setUser(null);
      setPage("login");
      if (shouldNavigate) navigate("/");
    }
    return response.ok;
  };

  useEffect(() => {
    authenticate(getPage(location.pathname), false).finally(() =>
      setLoading(false),
    );
  }, []);

  useEffect(() => {
    const names = {
      login: "Sign in",
      register: "Create account",
      password: "Change password",
      home: "Everyday shopping",
      products: "Products",
      wishlist: "Wishlist",
      cart: "Cart",
      checkout: "Checkout",
      orders: "Orders",
    };
    const routePage = getPage(location.pathname);
    document.title = `ShopKart | ${names[routePage] || names[page] || "Shop"}`;
  }, [page, location.pathname]);

  const go = async (destination) => {
    message("");
    if (destination === "home" || destination === "password")
      await authenticate(destination);
    else {
      setPage(destination);
      navigate(destination === "login" ? "/" : `/${destination}`);
    }
  };

  const update = (setter) => (event) =>
    setter((values) => ({
      ...values,
      [event.target.name]: event.target.value,
    }));

  const registerSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    message("");
    try {
      const { response, body } = await api("/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(register),
      });
      if (!response.ok)
        throw new Error(body.message || "Unable to create your account.");
      setLogin({ email: register.email, password: "" });
      setRegister(emptyRegister);
      setPage("login");
      navigate("/");
      message("Account created. Please sign in to continue.", true);
    } catch (error) {
      message(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const loginSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    message("");
    try {
      const { response, body } = await api("/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      if (!response.ok) throw new Error(body.message || "Unable to sign in.");
      await authenticate();
    } catch (error) {
      message(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const passwordSubmit = async (event) => {
    event.preventDefault();
    message("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      message("New passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const { response, body } = await api("/customers/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });
      if (!response.ok)
        throw new Error(body.message || "Unable to update password.");
      setPasswords(emptyPassword);
      message("Password updated successfully.", true);
    } catch (error) {
      message(error.message);
      if (error.message === "Unauthorized") authenticate();
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    setSubmitting(true);
    try {
      await api("/customers/logout", { method: "POST" });
    } finally {
      setUser(null);
      setLogin({ email: "", password: "" });
      setPage("login");
      navigate("/");
      message("You have been logged out.", true);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading ShopKart...</div>;
  if (page === "register")
    return (
      <Register
        register={register}
        onChange={update(setRegister)}
        onSubmit={registerSubmit}
        submitting={submitting}
        message={noticeElement}
        onLogin={() => go("login")}
      />
    );
  if (page === "password")
    return (
      <Password
        passwords={passwords}
        onChange={update(setPasswords)}
        onSubmit={passwordSubmit}
        submitting={submitting}
        message={noticeElement}
        onHome={() => go("home")}
      />
    );
  if (!user)
    return (
      <Login
        login={login}
        onChange={update(setLogin)}
        onSubmit={loginSubmit}
        submitting={submitting}
        message={noticeElement}
        onRegister={() => go("register")}
      />
    );
  return (
    <CartProvider key={user._id}>
      <AuthenticatedPages
        page={page}
        pathname={location.pathname}
        user={user}
        onHome={() => go("home")}
        onPassword={() => go("password")}
        onLogout={logout}
        onProducts={() => go("products")}
        submitting={submitting}
      />
    </CartProvider>
  );
}

function AuthenticatedPages({
  page,
  pathname,
  user,
  onHome,
  onPassword,
  onLogout,
  onProducts,
  submitting,
}) {
  if (pathname.startsWith("/orders/")) {
    return (
      <OrderDetails
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onProducts={onProducts}
        onLogout={onLogout}
        submitting={submitting}
      />
    );
  }
  if (pathname === "/order-success" || pathname.startsWith("/order-success/")) {
    return (
      <OrderSuccess
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onProducts={onProducts}
        onLogout={onLogout}
        submitting={submitting}
      />
    );
  }
  if (pathname === "/checkout") {
    return (
      <Checkout
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onProducts={onProducts}
        onLogout={onLogout}
        submitting={submitting}
      />
    );
  }
  if (page === "orders" || pathname === "/orders") {
    return (
      <Orders
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onLogout={onLogout}
        submitting={submitting}
      />
    );
  }
  if (pathname.startsWith("/products/")) {
    return (
      <ProductDetails
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onProducts={onProducts}
        onLogout={onLogout}
        submitting={submitting}
      />
    );
  }
  if (page === "wishlist" || pathname === "/wishlist") {
    return (
      <Wishlist
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onLogout={onLogout}
        submitting={submitting}
      />
    );
  }
  if (page === "cart" || pathname === "/cart") {
    return (
      <Cart
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onLogout={onLogout}
        submitting={submitting}
      />
    );
  }
  if (page === "products" || pathname === "/products") {
    return (
      <Products
        user={user}
        onHome={onHome}
        onPassword={onPassword}
        onLogout={onLogout}
        submitting={submitting}
      />
    );
  }
  return (
    <Home
      user={user}
      onPassword={onPassword}
      onLogout={onLogout}
      submitting={submitting}
    />
  );
}

function getPage(pathname) {
  if (pathname.startsWith("/products")) return "products";
  if (pathname === "/wishlist") return "wishlist";
  if (pathname === "/cart") return "cart";
  if (pathname === "/checkout") return "checkout";
  if (pathname === "/orders" || pathname.startsWith("/orders/")) return "orders";
  if (pathname === "/home") return "home";
  if (pathname === "/register") return "register";
  return "login";
}
