// Helpers to manage the primary color stored as H S% L% (matching tailwind config variable usage)
export const LOCAL_KEY = "tv:primary-hsl";
export const LOCAL_HEX_KEY = "tv:primary-hex";

export const applyPrimaryHsl = (hsl: string) => {
  if (typeof document === "undefined") return;
  // Expect hsl like: "142 76% 36%"
  document.documentElement.style.setProperty("--primary", hsl);
  // Keep a readable foreground; assume white works for darker colors
  document.documentElement.style.setProperty("--primary-foreground", "0 0% 100%");
  // Use the primary color for focus rings by default so inputs adopt user-selected color
  document.documentElement.style.setProperty("--ring", hsl);
};

export const savePrimaryHsl = (hsl: string) => {
  try {
    localStorage.setItem(LOCAL_KEY, hsl);
  } catch (e) {
    // ignore
  }
};

export const savePrimaryHex = (hex: string) => {
  try {
    localStorage.setItem(LOCAL_HEX_KEY, hex);
  } catch (e) {
    // ignore
  }
};

export const loadPrimaryHex = (): string | null => {
  try {
    return localStorage.getItem(LOCAL_HEX_KEY);
  } catch (e) {
    return null;
  }
};

export const loadAndApplySavedPrimary = () => {
  try {
    const v = localStorage.getItem(LOCAL_KEY);
    if (v) applyPrimaryHsl(v);
  } catch (e) {
    // ignore
  }
};

// Simple conversion: hex -> H S% L% (approximate)
export const hexToHslString = (hex: string) => {
  // remove #
  const h = hex.replace('#','');
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0,2), 16) / 255;
  const g = parseInt(h.slice(2,4), 16) / 255;
  const b = parseInt(h.slice(4,6), 16) / 255;

  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let hue = 0, sat = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      case b: hue = (r - g) / d + 4; break;
    }
    hue = hue * 60;
  }

  const hRound = Math.round(hue);
  const sRound = Math.round(sat * 100);
  const lRound = Math.round(l * 100);
  return `${hRound} ${sRound}% ${lRound}%`;
};

// Initialize on module import (will be a no-op server-side)
loadAndApplySavedPrimary();
