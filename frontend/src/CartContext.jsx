import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, store } from "./api.js";

// Keeps one cart per browser. Its id lives in localStorage so the cart
// survives page reloads; the cart itself lives in the Flask backend.
const CartContext = createContext(null);
const CART_KEY = "bru.cartId";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");

  const ensureCart = useCallback(async () => {
    const saved = store.get(CART_KEY);
    if (saved) {
      try {
        return await api.getCart(saved);
      } catch (e) {
        if (e.status !== 404) throw e; // backend restarted / data.json deleted → make a new one
      }
    }
    const fresh = await api.createCart();
    store.set(CART_KEY, fresh.id);
    return fresh;
  }, []);

  useEffect(() => {
    ensureCart()
      .then(setCart)
      .catch(() => setError("Can't reach the Brü backend. Is python app.py running?"));
  }, [ensureCart]);

  // Wraps every cart change: recover a missing cart once, then retry.
  const run = useCallback(
    async (fn) => {
      let current = cart || (await ensureCart());
      try {
        const updated = await fn(current.id);
        setCart(updated);
        setError("");
        return updated;
      } catch (e) {
        if (e.status === 404 && e.message === "Cart not found") {
          store.remove(CART_KEY);
          current = await ensureCart();
          const updated = await fn(current.id);
          setCart(updated);
          return updated;
        }
        throw e;
      }
    },
    [cart, ensureCart]
  );

  const value = {
    cart,
    error,
    count: cart?.can_count || 0,
    addItem: (item) => run((id) => api.addItem(id, item)),
    updateItem: (itemId, changes) => run((id) => api.updateItem(id, itemId, changes)),
    removeItem: (itemId) => run((id) => api.removeItem(id, itemId)),
    checkout: async (details) => {
      const sub = await api.checkout(cart.id, details);
      setCart(await api.getCart(cart.id)); // cart is now empty
      return sub;
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
