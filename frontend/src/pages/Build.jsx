import { useState } from "react";
import { Link } from "react-router-dom";
import Can from "../components/Can.jsx";
import PlanCards, { Perks } from "../components/PlanCards.jsx";
import { useCart } from "../CartContext.jsx";
import { useMenu } from "../useMenu.js";
import { money } from "../api.js";
import { DEFAULT_RECIPE, OUTLINE, STEP_LABELS, SWATCHES } from "../theme.js";

const FIELDS = ["base", "milk", "sweetness", "flavor"];

export default function Build() {
  const { menu, error: menuError } = useMenu();
  const { addItem } = useCart();
  const [recipe, setRecipe] = useState(DEFAULT_RECIPE);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState(24);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  const choose = (field, value) => {
    setRecipe((r) => ({ ...r, [field]: value }));
    setStatus({ type: "", text: "" });
  };

  const selectedPlan = menu?.plans.find((p) => p.cans === plan);

  async function handleAdd() {
    setBusy(true);
    setStatus({ type: "", text: "" });
    try {
      await addItem({ recipe, quantity: plan, name_on_can: name });
      setStatus({ type: "ok", text: `Added ${selectedPlan.name} to your cart.` });
    } catch (e) {
      setStatus({ type: "error", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  if (menuError) {
    return (
      <section className="page narrow">
        <p className="form-error">Couldn't load the menu: {menuError}</p>
      </section>
    );
  }

  return (
    <section className="page build">
      <div className="build-head">
        <p className="eyebrow">Build your Brü</p>
        <h1>160 recipes. One can with your name on it.</h1>
      </div>

      <div className="build-grid">
        <div className="build-options">
          {FIELDS.map((field, i) => (
            <fieldset key={field} className="option-group">
              <legend>
                <span className="step-num small">{i + 1}</span> {STEP_LABELS[field]}
              </legend>
              <div className="option-row">
                {(menu?.options[field] || Object.keys(SWATCHES[field])).map((value) => {
                  const color = SWATCHES[field][value];
                  const active = recipe[field] === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      className={`option ${active ? "active" : ""}`}
                      aria-pressed={active}
                      onClick={() => choose(field, value)}
                    >
                      <span
                        className="dot big"
                        style={color ? { background: color } : { boxShadow: `inset 0 0 0 1.5px ${OUTLINE[field]}` }}
                      >
                        {field === "milk" && value === "None" && <span className="none-slash" />}
                      </span>
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <fieldset className="option-group">
            <legend>
              <span className="step-num small">5</span> Put your name on it <span className="muted">(optional)</span>
            </legend>
            <input
              className="input"
              type="text"
              value={name}
              maxLength={menu?.name_on_can_max || 14}
              placeholder="e.g. Shira"
              onChange={(e) => setName(e.target.value)}
              aria-label="Name on can"
            />
          </fieldset>

          <fieldset className="option-group">
            <legend>
              <span className="step-num small">6</span> Choose your plan
            </legend>
            <PlanCards plans={menu?.plans} selected={plan} onSelect={setPlan} compact />
            <Perks />
          </fieldset>
        </div>

        <aside className="preview">
          <div className="preview-card">
            <p className="eyebrow">Preview your can</p>
            <div className="can-stage">
              <Can recipe={recipe} name={name.trim()} size={340} />
            </div>
            <dl className="recipe-list">
              {FIELDS.map((f) => (
                <div key={f}>
                  <dt>{f === "base" ? "Base" : f[0].toUpperCase() + f.slice(1)}</dt>
                  <dd>{recipe[f]}</dd>
                </div>
              ))}
              <div>
                <dt>Size</dt>
                <dd>8 oz (237 mL)</dd>
              </div>
            </dl>
            <div className="preview-total">
              <span>{selectedPlan ? `${selectedPlan.name} · ${selectedPlan.cans} cans` : "Loading plans…"}</span>
              <strong>{selectedPlan ? money(selectedPlan.price_cents) : ""}</strong>
            </div>
            <button className="btn full" onClick={handleAdd} disabled={busy || !selectedPlan}>
              {busy ? "Adding…" : "Add to cart"}
            </button>
            <div aria-live="polite" className="status-line">
              {status.type === "ok" && (
                <p className="form-ok">
                  {status.text} <Link to="/cart">View cart →</Link>
                </p>
              )}
              {status.type === "error" && <p className="form-error">{status.text}</p>}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
