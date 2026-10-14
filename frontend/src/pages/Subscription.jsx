import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Can from "../components/Can.jsx";
import { api, moneyExact, store } from "../api.js";

const SUB_KEY = "bru.subscriptionId";

const fmtDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

export default function Subscription() {
  const [params] = useSearchParams();
  const isNew = params.get("new") === "1";
  const [sub, setSub] = useState(null);
  const [state, setState] = useState("loading"); // loading | none | ready
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    const id = store.get(SUB_KEY);
    if (!id) {
      setState("none");
      return;
    }
    api
      .getSubscription(id)
      .then((s) => {
        setSub(s);
        setState("ready");
      })
      .catch(() => {
        store.remove(SUB_KEY);
        setState("none");
      });
  }, []);

  async function change(action) {
    if (action === "cancel" && !window.confirm("Cancel your Brü subscription?")) return;
    setErr("");
    setBusy(action);
    try {
      setSub(await api.changeSubscription(sub.id, action));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }

  if (state === "loading") return <section className="page narrow"><p className="muted">Loading…</p></section>;

  if (state === "none") {
    return (
      <section className="page narrow center">
        <p className="eyebrow">My subscription</p>
        <h1>No subscription yet.</h1>
        <p className="lead">Build your can, add it to your cart and check out to start one.</p>
        <Link to="/build" className="btn">Build your Brü</Link>
      </section>
    );
  }

  const statusText = {
    active: `Next delivery ${fmtDate(sub.next_delivery)}`,
    paused: "Paused. No deliveries until you resume.",
    cancelled: "Cancelled. We'll miss you.",
  }[sub.status];

  return (
    <section className="page narrow">
      <p className="eyebrow">My subscription</p>
      <h1>{isNew ? `You're in, ${sub.name.split(" ")[0]}.` : `Hi, ${sub.name.split(" ")[0]}.`}</h1>
      {isNew && (
        <p className="lead">Your first box ships soon. Every can is made to your exact order.</p>
      )}

      <div className="card sub-card">
        <div className="sub-top">
          <span className={`pill ${sub.status}`}>{sub.status}</span>
          <span>{statusText}</span>
        </div>
        <div className="sub-meta">
          <div><span className="muted">Frequency</span><strong>{sub.frequency}</strong></div>
          <div><span className="muted">Per delivery</span><strong>{moneyExact(sub.total_per_delivery_cents)}</strong></div>
          <div><span className="muted">Cans per delivery</span><strong>{sub.items.reduce((n, i) => n + i.quantity * i.packs, 0)}</strong></div>
        </div>

        <div className="sub-cans">
          {sub.items.map((i) => (
            <figure key={i.id}>
              <Can recipe={i.recipe} name={i.name_on_can} size={170} />
              <figcaption>
                {i.packs} × {i.plan_name}
              </figcaption>
            </figure>
          ))}
        </div>

        {sub.status !== "cancelled" && (
          <div className="sub-actions">
            {sub.status === "active" && (
              <>
                <button className="btn ghost" onClick={() => change("skip")} disabled={!!busy}>
                  {busy === "skip" ? "Skipping…" : "Skip next delivery"}
                </button>
                <button className="btn ghost" onClick={() => change("pause")} disabled={!!busy}>
                  {busy === "pause" ? "Pausing…" : "Pause"}
                </button>
              </>
            )}
            {sub.status === "paused" && (
              <button className="btn" onClick={() => change("resume")} disabled={!!busy}>
                {busy === "resume" ? "Resuming…" : "Resume"}
              </button>
            )}
            <button className="link-btn danger" onClick={() => change("cancel")} disabled={!!busy}>
              Cancel subscription
            </button>
          </div>
        )}
        {err && <p className="form-error" role="alert">{err}</p>}
      </div>

      <div className="center">
        <Link to="/build" className="btn ghost">Build another can</Link>
      </div>
    </section>
  );
}
