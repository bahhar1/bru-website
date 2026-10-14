import { useState } from "react";
import { Link } from "react-router-dom";
import Can from "../components/Can.jsx";
import { useCart } from "../CartContext.jsx";
import { money, moneyExact } from "../api.js";

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const [err, setErr] = useState("");

  const act = async (fn) => {
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!cart) {
    return <section className="page narrow"><p className="muted">Loading your cart…</p></section>;
  }

  if (!cart.items.length) {
    return (
      <section className="page narrow center">
        <p className="eyebrow">Your cart</p>
        <h1>Your cart is empty.</h1>
        <p className="lead">Build a can exactly the way you like it.</p>
        <Link to="/build" className="btn">Build your Brü</Link>
      </section>
    );
  }

  return (
    <section className="page narrow">
      <p className="eyebrow">Your cart</p>
      <h1>Ready when you are.</h1>
      {err && <p className="form-error" role="alert">{err}</p>}

      <ul className="cart-list">
        {cart.items.map((item) => (
          <li key={item.id} className="card cart-item">
            <Can recipe={item.recipe} name={item.name_on_can} size={150} />
            <div className="cart-info">
              <h3>
                {item.recipe.base} · {item.recipe.flavor}
                {item.name_on_can && <span className="muted"> for {item.name_on_can}</span>}
              </h3>
              <p className="muted">
                {item.recipe.milk === "None" ? "No milk" : `${item.recipe.milk} milk`} · {item.recipe.sweetness}
              </p>
              <p className="muted">
                {item.plan_name} · {item.quantity} cans · {moneyExact(item.can_price_cents)} / can
              </p>
              <div className="cart-controls">
                <div className="stepper" aria-label="Number of packs">
                  <button
                    type="button"
                    aria-label="One fewer pack"
                    onClick={() => act(() => updateItem(item.id, { packs: item.packs - 1 }))}
                  >
                    −
                  </button>
                  <span aria-live="polite">{item.packs} {item.packs === 1 ? "pack" : "packs"}</span>
                  <button
                    type="button"
                    aria-label="One more pack"
                    onClick={() => act(() => updateItem(item.id, { packs: item.packs + 1 }))}
                  >
                    +
                  </button>
                </div>
                <select
                  className="input select"
                  value={item.quantity}
                  aria-label="Plan size"
                  onChange={(e) => act(() => updateItem(item.id, { quantity: Number(e.target.value) }))}
                >
                  <option value={12}>The 12</option>
                  <option value={24}>The 24</option>
                  <option value={36}>The 36</option>
                </select>
                <button type="button" className="link-btn" onClick={() => act(() => removeItem(item.id))}>
                  Remove
                </button>
              </div>
            </div>
            <strong className="cart-price">{money(item.line_price_cents)}</strong>
          </li>
        ))}
      </ul>

      <div className="card summary">
        <div className="summary-row">
          <span>{cart.can_count} cans per delivery</span>
          <span>{moneyExact(cart.total_cents)}</span>
        </div>
        <div className="summary-row muted">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="summary-row total">
          <span>Total per delivery</span>
          <span>{moneyExact(cart.total_cents)}</span>
        </div>
        <div className="summary-actions">
          <Link to="/build" className="btn ghost">Add another can</Link>
          <Link to="/checkout" className="btn">Checkout</Link>
        </div>
      </div>
    </section>
  );
}
