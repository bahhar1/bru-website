// Colors taken from the pitch deck.

// Can color by flavor, matching the five cans on the cover slide.
export const CAN_COLORS = {
  Vanilla: { body: "#B7BD90", shade: "#9EA478", text: "#3B2418" },
  Caramel: { body: "#EBDDA9", shade: "#D6C68E", text: "#3B2418" },
  Mocha: { body: "#E8B9A4", shade: "#D49E88", text: "#3B2418" },
  Hazelnut: { body: "#8C5434", shade: "#6E3F25", text: "#F6EDE3" },
  Unflavored: { body: "#B9CCE0", shade: "#9DB4CC", text: "#3B2418" },
};

// Option swatches, matching slide 07 ("Café-quality coffee, made your way").
// A null color draws an outlined (empty) dot.
export const SWATCHES = {
  base: { "Cold brew": "#3B2418", Espresso: "#7E5038" },
  milk: { Dairy: null, Oat: "#E3D3B0", Almond: "#C9A58A", None: null },
  sweetness: { Unsweetened: null, Light: "#F2DED6", Regular: "#E6C3B6", Extra: "#D19D8C" },
  flavor: {
    Vanilla: "#EFE3BC",
    Caramel: "#C98D52",
    Mocha: "#7A4E36",
    Hazelnut: "#A57A5B",
    Unflavored: "#B9CCE0",
  },
};

export const OUTLINE = {
  base: "#7E5038",
  milk: "#8A6A55",
  sweetness: "#D19D8C",
  flavor: "#8A6A55",
};

export const STEP_LABELS = {
  base: "Choose your base",
  milk: "Choose your milk",
  sweetness: "Sweetness level",
  flavor: "Choose a flavor",
};

export const DEFAULT_RECIPE = {
  base: "Cold brew",
  milk: "Oat",
  sweetness: "Light",
  flavor: "Vanilla",
};
