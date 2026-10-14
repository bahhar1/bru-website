import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext.jsx";
import { moneyExact, store } from "../api.js";

const FREQUENCIES = [
  ["Weekly", "Every 7 days"],
  ["Biweekly", "Every 2 weeks"],
  ["Monthly", "Every 30 days"],
];

export default function Checkout() {
  const { cart, checkout } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", frequency: "Weekly" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const sub = await checkout(form);
      store.set("bru.subscriptionId", sub.id);
      navigate("/subscription?new=1");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  if (!cart) return <section className="page narrow"><p className="muted">Loading…</p></section>;

  if (!cart.items.length) {
    return (
      <section className="page narrow center">
        <h1>Nothing to check out yet.</h1>
        <Link to="/build" className="btn">Build your Brü</Link>
      </section>
    );
  }

  return (
    <section className="page narrow">
      <p className="eyebrow">Checkout</p>
      <h1>Subscribe and forget.</h1>

      <form className="checkout" onSubmit={submit} noValidate>
        <div className="card form-card">
          <label className="field">
            <span>Name</span>
            <input className="input" value={form.name} onChange={set("name")} autoComplete="name" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input className="input" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
          </label>

          <fieldset className="field">
            <legend>Delivery frequency</legend>
            <div className="freq-row">
              {FREQUENCIES.map(([value, hint]) => (
                <label key={value} className={`freq ${form.frequency === value ? "active" : ""}`}>
                  <input type="radio" name="frequency" value={value} checked={form.frequency === value} onChange={set("frequency")} />
                  <strong>{value}</strong>
                  <span className="muted">{hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="note">
            Demo checkout: no payment is taken. You can pause, skip or cancel anytime.
          </p>
          {err && <p className="form-error" role="alert">{err}</p>}
          <button className="btn full" disabled={busy}>
            {busy ? "Starting…" : `Start subscription · ${moneyExact(cart.total_cents)} per delivery`}
          </button>
        </div>

        <aside className="card summary">
          <p className="eyebrow">Order summary</p>
          {cart.items.map((i) => (
            <div className="summary-row" key={i.id}>
              <span>
                {i.packs} × {i.plan_name}
                <span className="muted block">
                  {i.recipe.base}, {i.recipe.milk}, {i.recipe.sweetness}, {i.recipe.flavor}
                  {i.name_on_can ? ` · "${i.name_on_can}"` : ""}
                </span>
              </span>
              <span>{moneyExact(i.line_price_cents)}</span>
            </div>
          ))}
          <div className="summary-row muted"><span>Shipping</span><span>Free</span></div>
          <div className="summary-row total">
            <span>{form.frequency} total</span>
            <span>{moneyExact(cart.total_cents)}</span>
          </div>
        </aside>
      </form>
    </section>
  );
}
