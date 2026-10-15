export async function fetchProducts({ search, category, sort } = {}, signal) {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);

  const response = await fetch(`/products?${params}`, { signal });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Unable to load products.");
  return body.products;
}

export async function fetchProduct(id) {
  const response = await fetch(`/products/${id}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Unable to load product.");
  return body.product;
}

async function wishlistRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Wishlist request failed.");
  return body;
}

export async function fetchWishlist() {
  return wishlistRequest("/wishlist");
}

export async function addToWishlist(productId) {
  return wishlistRequest(`/wishlist/${productId}`, { method: "POST" });
}

export async function removeFromWishlist(productId) {
  return wishlistRequest(`/wishlist/${productId}`, { method: "DELETE" });
}

async function cartRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Cart request failed.");
  return body;
}

export async function fetchCart() {
  return cartRequest("/cart");
}

export async function addCartProduct(productId) {
  return cartRequest(`/cart/${productId}`, { method: "POST" });
}

export async function updateCartQuantity(productId, quantity) {
  return cartRequest(`/cart/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartProduct(productId) {
  return cartRequest(`/cart/${productId}`, { method: "DELETE" });
}

export async function createPaymentOrder(shippingAddress) {
  return cartRequest("/orders/create-payment-order", {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
  });
}

export async function verifyPayment(payload) {
  return cartRequest("/orders/verify-payment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchOrders() {
  return cartRequest("/orders");
}

export async function fetchOrder(id) {
  return cartRequest(`/orders/${id}`);
}

export async function cancelOrder(id, reason) {
  return cartRequest(`/orders/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
