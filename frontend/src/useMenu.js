import { useEffect, useState } from "react";
import { api } from "./api.js";

// Loads /api/menu once and shares it between pages.
let cached = null;

export function useMenu() {
  const [menu, setMenu] = useState(cached);
  const [error, setError] = useState("");
  useEffect(() => {
    if (cached) return;
    api
      .menu()
      .then((m) => {
        cached = m;
        setMenu(m);
      })
      .catch((e) => setError(e.message));
  }, []);
  return { menu, error };
}
