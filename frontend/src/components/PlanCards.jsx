import { money, moneyExact } from "../api.js";

// The three plans from slide 09. Pass `selected` + `onSelect` to make them pickable.
export default function PlanCards({ plans, selected, onSelect, compact = false }) {
  if (!plans) return <div className="plans skeleton" aria-busy="true" />;
  const Tag = onSelect ? "button" : "div";
  return (
    <div className={`plans ${compact ? "compact" : ""}`} role={onSelect ? "radiogroup" : undefined} aria-label="Plans">
      {plans.map((p) => (
        <Tag
          key={p.cans}
          type={onSelect ? "button" : undefined}
          role={onSelect ? "radio" : undefined}
          aria-checked={onSelect ? selected === p.cans : undefined}
          className={`plan ${p.popular ? "popular" : ""} ${selected === p.cans ? "selected" : ""}`}
          onClick={onSelect ? () => onSelect(p.cans) : undefined}
        >
          {p.popular && <span className="badge">Most popular</span>}
          <span className="plan-name">{p.name}</span>
          <span className="plan-cans">{p.cans} cans</span>
          <span className="plan-price">{money(p.price_cents)}</span>
          <span className="plan-per">{moneyExact(p.per_can_cents)} / can</span>
        </Tag>
      ))}
    </div>
  );
}

export function Perks() {
  return (
    <ul className="perks">
      <li><TruckIcon /> Free shipping</li>
      <li><CalendarIcon /> Weekly, biweekly or monthly</li>
      <li><PauseIcon /> Pause, skip or change anytime</li>
    </ul>
  );
}

const iconProps = { width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": true };

export const TruckIcon = () => (
  <svg viewBox="0 0 24 24" {...iconProps}>
    <path d="M2 6h12v10H2zM14 10h4l3 3v3h-7" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" />
  </svg>
);
export const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" {...iconProps}>
    <rect x="3" y="5" width="18" height="16" rx="1.5" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const PauseIcon = () => (
  <svg viewBox="0 0 24 24" {...iconProps}>
    <circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" />
  </svg>
);
