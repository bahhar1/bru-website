import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { SWATCHES, OUTLINE } from "../theme.js";

// Slide 10, "Data on every order": live popularity from real subscriptions.
const FIELD_TITLES = { base: "Base", milk: "Milk", sweetness: "Sweetness", flavor: "Flavor" };

const REFRESH_MS = 5000; // how often the page checks for new orders

export default function Insights() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [updated, setUpdated] = useState(null);
  const [, tick] = useState(0);

  const load = useCallback(
    () =>
      api
        .stats()
        .then((s) => {
          setStats(s);
          setErr("");
          setUpdated(Date.now());
        })
        .catch((e) => setErr(e.message)),
    []
  );

  // Load now, then every few seconds. Pauses while the tab is hidden.
  useEffect(() => {
    load();
    const poll = setInterval(() => {
      if (!document.hidden) load();
    }, REFRESH_MS);
    const clock = setInterval(() => tick((n) => n + 1), 1000);
    const onVisible = () => !document.hidden && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const ago = updated ? Math.max(0, Math.round((Date.now() - updated) / 1000)) : null;

  if (err && !stats) return <section className="page narrow"><p className="form-error">{err}</p></section>;
  if (!stats) return <section className="page narrow"><p className="muted">Loading…</p></section>;

  const empty = stats.cans_per_cycle === 0;

  return (
    <section className="page">
      <p className="eyebrow">Why it works</p>
      <h1>Made to order. Powered by data.</h1>
      <p className="lead">
        Every subscription tells us exactly what people want, so we know which recipes to brew,
        which flavors to launch next, and which could win in retail.
      </p>

      <div className="insight-top">
        <div className="card stat">
          <span className="stat-num">{stats.active_subscriptions}</span>
          <span className="stat-label">active subscriptions</span>
        </div>
        <div className="card stat">
          <span className="stat-num">{stats.cans_per_cycle}</span>
          <span className="stat-label">cans per delivery cycle</span>
        </div>
        <div className="live">
          <span className={`live-dot ${err ? "off" : ""}`} aria-hidden="true" />
          <span>
            {err ? "Reconnecting…" : "Live"}
            <span className="muted"> · updated {ago === 0 ? "just now" : `${ago}s ago`}</span>
          </span>
          <button className="link-btn" onClick={load}>Refresh now</button>
        </div>
      </div>

      {empty ? (
        <div className="card center pad">
          <p className="lead">No active subscriptions yet. Place a few orders to see the data fill in.</p>
          <Link to="/build" className="btn">Build your Brü</Link>
        </div>
      ) : (
        <>
          <h2 className="h3">Top recipes</h2>
          <ol className="top-list card">
            {stats.top_combinations.map(([combo, count]) => (
              <li key={combo}>
                <span>{combo}</span>
                <strong>{count} cans</strong>
              </li>
            ))}
          </ol>

          <div className="insight-grid">
            {Object.entries(stats.popularity).map(([field, counts]) => {
              const total = Object.values(counts).reduce((a, b) => a + b, 0);
              return (
                <div className="card" key={field}>
                  <h3>{FIELD_TITLES[field]}</h3>
                  {Object.entries(counts).map(([value, n]) => {
                    const pct = Math.round((100 * n) / total);
                    const color = SWATCHES[field][value];
                    return (
                      <div className="bar-row" key={value}>
                        <span className="bar-label">{value}</span>
                        <span className="bar-track">
                          <span
                            className="bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: color || "transparent",
                              boxShadow: color ? "none" : `inset 0 0 0 1.5px ${OUTLINE[field]}`,
                            }}
                          />
                        </span>
                        <span className="bar-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}