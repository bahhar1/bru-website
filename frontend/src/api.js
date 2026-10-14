// All calls to the Flask backend. Vite forwards /api to http://127.0.0.1:5000.

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  menu: () => request("/menu"),

  createCart: () => request("/cart", { method: "POST" }),
  getCart: (id) => request(`/cart/${id}`),
  addItem: (id, item) => request(`/cart/${id}/items`, { method: "POST", body: item }),
  updateItem: (id, itemId, changes) =>
    request(`/cart/${id}/items/${itemId}`, { method: "PATCH", body: changes }),
  removeItem: (id, itemId) => request(`/cart/${id}/items/${itemId}`, { method: "DELETE" }),
  checkout: (id, details) => request(`/cart/${id}/checkout`, { method: "POST", body: details }),

  getSubscription: (id) => request(`/subscriptions/${id}`),
  changeSubscription: (id, action) => request(`/subscriptions/${id}/${action}`, { method: "POST" }),

  stats: () => request("/stats"),
};

export const money = (cents) =>
  `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

export const moneyExact = (cents) => `$${(cents / 100).toFixed(2)}`;

// localStorage can throw in private windows, so wrap it.
export const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
