export const PRESET_THEME_COLORS = [
  { id: "crimson", name: "Skipli Crimson", hex: "#E53E3E" },
  { id: "black", name: "Classic Obsidian", hex: "#111827" },
  { id: "ocean", name: "Cobalt Blue", hex: "#2563EB" },
  { id: "emerald", name: "Emerald Green", hex: "#059669" },
  { id: "amber", name: "Caramel Amber", hex: "#D97706" },
  { id: "violet", name: "Royal Violet", hex: "#7C3AED" },
  { id: "rose", name: "Vibrant Rose", hex: "#E11D48" },
  { id: "teal", name: "Artisan Teal", hex: "#0D9488" },
];

export function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return { r: 229, g: 62, b: 62 };
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 229, g: 62, b: 62 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function darkenRgb({ r, g, b }, factor = 0.82) {
  return {
    r: Math.max(0, Math.round(r * factor)),
    g: Math.max(0, Math.round(g * factor)),
    b: Math.max(0, Math.round(b * factor)),
  };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getThemeColorTokens(hexColor) {
  const safeHex = hexColor && /^#[0-9A-Fa-f]{3,8}$/.test(hexColor) ? hexColor : "#E53E3E";
  const rgb = hexToRgb(safeHex);
  const darkRgb = darkenRgb(rgb, 0.85);
  const darkHex = rgbToHex(darkRgb);

  return {
    "--sf-theme-primary": safeHex,
    "--sf-theme-primary-hover": darkHex,
    "--sf-theme-primary-light": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
    "--sf-theme-primary-light-hover": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.16)`,
    "--sf-theme-primary-border": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`,
    "--sf-theme-primary-glow": `0 4px 16px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.24)`,
    "--sf-brand": safeHex,
    "--sf-brand-hover": darkHex,
    "--sf-badge-discount-bg": `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    "--sf-badge-discount-text": safeHex,
  };
}
