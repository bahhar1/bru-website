import { CAN_COLORS } from "../theme.js";

// A drawn Brü can that mirrors the cans in the deck photos.
// The label lists the recipe; the can color follows the flavor.
export default function Can({ recipe, name = "", size = 220, className = "" }) {
  const c = CAN_COLORS[recipe.flavor] || CAN_COLORS.Vanilla;
  const lines = [recipe.base, recipe.milk, recipe.sweetness, recipe.flavor].map((s) =>
    (s || "").toUpperCase()
  );
  const id = `can-${recipe.flavor}-${Math.round(size)}`;
  const label = `Brü can: ${recipe.base}, ${recipe.milk} milk, ${recipe.sweetness}, ${recipe.flavor}${
    name ? `, for ${name}` : ""
  }`;

  return (
    <svg
      className={`can ${className}`}
      viewBox="0 0 160 360"
      width={(size * 160) / 360}
      height={size}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor={c.shade} />
          <stop offset="0.28" stopColor={c.body} />
          <stop offset="0.62" stopColor={c.body} />
          <stop offset="1" stopColor={c.shade} />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" x2="1">
          <stop offset="0" stopColor="#9C9C9C" />
          <stop offset="0.4" stopColor="#E9E9E9" />
          <stop offset="1" stopColor="#8F8F8F" />
        </linearGradient>
      </defs>

      {/* lid and base */}
      <rect x="14" y="4" width="132" height="22" rx="10" fill={`url(#${id}-metal)`} />
      <rect x="14" y="334" width="132" height="22" rx="10" fill={`url(#${id}-metal)`} />
      {/* body */}
      <rect x="8" y="18" width="144" height="326" rx="14" fill={`url(#${id}-body)`} />

      <g fill={c.text} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif">
        <text x="80" y="100" fontSize="40">Brü</text>
      </g>
      <g fill={c.text} textAnchor="middle" fontFamily="'Helvetica Neue', Arial, sans-serif" letterSpacing="1.4">
        {lines.map((line, i) => (
          <g key={i}>
            <text x="80" y={132 + i * 23} fontSize="9.5">{line}</text>
            {i < 3 && (
              <line x1="40" x2="120" y1={139 + i * 23} y2={139 + i * 23} stroke={c.text} strokeOpacity="0.35" strokeWidth="0.8" />
            )}
          </g>
        ))}
        <line x1="66" x2="94" y1="230" y2="230" stroke={c.text} strokeWidth="1" />
        {name ? (
          <text x="80" y="256" fontSize="13" fontFamily="Georgia, serif" fontStyle="italic" letterSpacing="0.3">
            {name}
          </text>
        ) : null}
        <text x="80" y="282" fontSize="7.5">REAL COFFEE</text>
        <text x="80" y="293" fontSize="7.5">BALANCED ENERGY</text>
        <text x="80" y="314" fontSize="7">8 FL OZ (237 ML)</text>
      </g>

      {/* highlight */}
      <rect x="34" y="30" width="7" height="296" rx="3.5" fill="#fff" opacity="0.18" />
    </svg>
  );
}
