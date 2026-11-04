// ==========================================================================
// MoneyTree theme engine + brand colours
// Every brand colour in the app reads from the CSS variables set here, so
// switching a theme only rewrites a handful of variables on <html> — no
// re-render needed.
// ==========================================================================

export const DEFAULT_THEME_ID = "moneytree";
export const THEME_STORAGE_KEY = "mt-theme";
const STORAGE_KEY = THEME_STORAGE_KEY;

export const THEMES = [
  { id: "moneytree", name: "MoneyTree", primary: "#005b52" },
  { id: "ocean", name: "Ocean", primary: "#0369a1" },
  { id: "indigo", name: "Indigo", primary: "#4338ca" },
  { id: "lavender", name: "Lavender", primary: "#8b7fd4" },
  { id: "berry", name: "Berry", primary: "#be185d" },
  { id: "sunset", name: "Sunset", primary: "#c2410c" },
  { id: "midnight", name: "Midnight", primary: "#1e293b" },
];

// ---------- colour helpers ----------

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const normalizeHex = (hex) => {
  let h = String(hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return /^[0-9a-f]{6}$/i.test(h) ? `#${h.toLowerCase()}` : null;
};

export const hexToRgb = (hex) => {
  const h = normalizeHex(hex).slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

const rgbToHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
};

const hslToHex = (h, s, l) => {
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
};

// relative luminance — decides whether text on the primary should be white or dark
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Full palette derived from a single primary colour. */
export const buildPalette = (primaryHex) => {
  const primary = normalizeHex(primaryHex) || THEMES[0].primary;
  const rgb = hexToRgb(primary);
  const [h, s, l] = rgbToHsl(rgb);
  const light = hslToHex(h, s, l + 8);
  const dark = hslToHex(h, s, l - 7);
  // bright version that glows on dark backgrounds (screen loader)
  const glow = hslToHex(h, s, clamp(l + 30, 50, 62));
  const backdrop = hslToHex(h, Math.min(s, 60), 4.5);

  return {
    primary,
    rgb: rgb.join(", "),
    light,
    lightRgb: hexToRgb(light).join(", "),
    dark,
    soft50: hslToHex(h, Math.min(s, 70), 97),
    soft100: hslToHex(h, Math.min(s, 40), 93),
    soft200: hslToHex(h, Math.min(s, 40), 85),
    deep: hslToHex(h, Math.min(s, 30), 14),
    emphasis: hslToHex(h, s, Math.max(l - 25, 8)),
    glowRgb: hexToRgb(glow).join(", "),
    backdropRgb: hexToRgb(backdrop).join(", "),
    contrast: luminance(primary) > 0.45 ? "#111827" : "#ffffff",
  };
};

/** Writes the palette to <html> as CSS variables (+ Bootstrap's own primary vars). */
export const applyPalette = (palette) => {
  const root = document.documentElement;
  const vars = {
    "--mt-primary": palette.primary,
    "--mt-primary-rgb": palette.rgb,
    "--mt-primary-light": palette.light,
    "--mt-primary-light-rgb": palette.lightRgb,
    "--mt-primary-dark": palette.dark,
    "--mt-primary-50": palette.soft50,
    "--mt-primary-100": palette.soft100,
    "--mt-primary-200": palette.soft200,
    "--mt-primary-900": palette.deep,
    "--mt-glow-rgb": palette.glowRgb,
    "--mt-backdrop-rgb": palette.backdropRgb,
    "--mt-on-primary": palette.contrast,
    "--mt-primary-gradient": `linear-gradient(135deg, ${palette.primary} 0%, ${palette.light} 100%)`,

    "--bs-primary": palette.primary,
    "--bs-primary-rgb": palette.rgb,
    "--bs-blue": palette.primary,
    "--bs-primary-text-emphasis": palette.emphasis,
    "--bs-primary-bg-subtle": palette.soft100,
    "--bs-primary-border-subtle": palette.soft200,
    "--bs-link-color": palette.primary,
    "--bs-link-color-rgb": palette.rgb,
    "--bs-link-hover-color": palette.dark,
    "--bs-link-hover-color-rgb": hexToRgb(palette.dark).join(", "),
    "--bs-sidebar-menu-item-hover-color": palette.light,
    "--bs-sidebar-menu-item-active-color": palette.light,
    "--bs-menu-item-active-color": palette.light,
  };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

  // mobile browser chrome follows the theme too
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = palette.primary;
};

// ---------- persistence ----------

/** Saved selection: { id, primary }. `id` is "custom" for a picked colour. */
export const loadSavedTheme = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && normalizeHex(saved.primary)) return saved;
  } catch (e) {
    // ignore — fall back to default
  }
  return { id: DEFAULT_THEME_ID, primary: THEMES[0].primary };
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    // storage blocked — theme still applies for this session
  }
};

let currentPrimary = THEMES[0].primary;

/** Current primary as a real hex — for libraries that cannot read CSS variables (react-switch, canvas…). */
export const getPrimaryHex = () => currentPrimary;

export const applyTheme = (theme) => {
  const palette = buildPalette(theme.primary);
  currentPrimary = palette.primary;
  applyPalette(palette);
  return palette;
};

/**
 * Adds transparency to any colour: hex ("#005b52"), or one of our theme variables.
 * Use instead of `${color}40` so it keeps working when color is a CSS variable.
 *   withAlpha("var(--mt-primary)", 0.25) -> "rgba(var(--mt-primary-rgb), 0.25)"
 */
export const withAlpha = (color, alpha) => {
  const varMatch = /^var\((--mt-[a-z0-9-]+)\)$/i.exec(String(color).trim());
  if (varMatch) return `rgba(var(${varMatch[1]}-rgb), ${alpha})`;
  const hex = normalizeHex(color);
  if (hex) return `rgba(${hexToRgb(hex).join(", ")}, ${alpha})`;
  return color;
};

// ---------- brand colours ----------


// Brand colours point at the live theme variables (the theme engine above),
// so they follow the colour picked in the header Theme switcher.
// For transparency use rgba(var(--mt-primary-rgb), .25) or withAlpha() — not `${primary}40`.
const defaultTheme = {
        primary: 'var(--mt-primary)',
        primaryLight: 'var(--mt-primary-light)',
        primaryDark: 'var(--mt-primary-dark)',
        primarySoft: 'var(--mt-primary-50)',
        primaryTint: 'var(--mt-primary-100)',
        primaryDeep: 'var(--mt-primary-900)',
        primaryGradient: 'var(--mt-primary-gradient)',
        // real hex of the current theme — for libraries that can't read CSS variables (react-switch, canvas, pdf)
        get primaryHex() { return getPrimaryHex(); },
        backgroundColor: '#ffffff',
        btnEnable: '#3B82F6',
        btnDisable: '#f0f0f0',
        btnOverlay:'#3B82F6',
        buttonTextColor:'#ffffff',
        loaderColor:'#26a3c0',
        textColor:'#191D31',
        caption:'#9C9EAB',
        invalidInputBorderColor:'#FF0000',
        textInputColor:'#ffffff',
        inputBorderColor:'#d9d9d9',
        placeHolderColor:'#d9d9d9',
        textInputText:'#191D31',
        selectColor:'#d4f0f7',
        Textcolor: '#1B7589',
        logoRedColor:'#ed1b24',
        logoBlueColor:'#0065b3',
        goldColorLogo:'#c38c42',
        redColor:'#FF0000',
        whiteColor:'#FFFFFF'
};

export { defaultTheme };