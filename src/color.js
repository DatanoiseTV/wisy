/* ============================================================
   Color engine — HSL math, WCAG contrast, and a parametric,
   visually‑correct palette generator. Produces a full set of
   `color-*` design tokens from a few parameters (base hue,
   saturation, harmony, light/dark, contrast, neutral tint).
   ============================================================ */

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const round = Math.round;

/* ---- conversions ---- */
export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [round(f(0) * 255), round(f(8) * 255), round(f(4) * 255)];
}
export function hslHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  const d = max - min;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [round(h), round(s * 100), round(l * 100)];
}
export function hexToHsl(hex) { return rgbToHsl(...hexToRgb(hex)); }

/* ---- WCAG contrast ---- */
function luminance(r, g, b) {
  const a = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
export function contrastRatio(hex1, hex2) {
  const L1 = luminance(...hexToRgb(hex1)), L2 = luminance(...hexToRgb(hex2));
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}
/* choose the foreground (from candidates) with the best contrast on bg */
export function bestOn(bg, candidates = ['#ffffff', '#0b0d10']) {
  return candidates.map((c) => [c, contrastRatio(bg, c)]).sort((a, b) => b[1] - a[1])[0][0];
}

/* ============================================================
   OKLCH — perceptually uniform color space (the modern, correct
   way to build palettes: equal lightness *looks* equal across
   hues, unlike HSL). Used for the seed‑color generator.
   ============================================================ */
function srgbToLin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function linToSrgb(c) { return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
export function rgbToOklch(r, g, b) {
  const lr = srgbToLin(r), lg = srgbToLin(g), lb = srgbToLin(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  let C = Math.hypot(A, B), H = Math.atan2(B, A) * 180 / Math.PI; if (H < 0) H += 360;
  return [L, C, H];
}
export function hexToOklch(hex) { return rgbToOklch(...hexToRgb(hex)); }
function oklchToRgbRaw(L, C, H) {
  const h = H * Math.PI / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}
function inGamut(rgb) { return rgb.every((c) => c >= -0.001 && c <= 1.001); }
/* clamp into sRGB by reducing chroma until the color fits (keeps hue + lightness) */
export function oklchHex(L, C, H) {
  L = clamp(L, 0, 1);
  let lo = 0, hi = C, lin = oklchToRgbRaw(L, C, H);
  if (!inGamut(lin)) {
    for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (inGamut(oklchToRgbRaw(L, mid, H))) lo = mid; else hi = mid; }
    lin = oklchToRgbRaw(L, lo, H);
  }
  const [r, g, b] = lin.map((c) => Math.round(clamp(linToSrgb(clamp(c, 0, 1)), 0, 1) * 255));
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/* ---- harmony offsets ---- */
export const HARMONIES = {
  monochrome: [0],
  analogous: [30],
  complementary: [180],
  'split-complementary': [150],
  triadic: [120],
  tetradic: [60],
};
export function accentHue(hue, harmony) { return (hue + (HARMONIES[harmony]?.[0] ?? 180)) % 360; }

/* ---- the generator ----
   opts: { hue, sat, harmony, mode:'light'|'dark', contrast(0.8..1.3), tint(0..1) } */
export function generatePalette(opts) {
  const hue = ((opts.hue % 360) + 360) % 360;
  const sat = clamp(opts.sat ?? 70, 0, 100);
  const harmony = opts.harmony || 'complementary';
  const dark = opts.mode === 'dark';
  const c = clamp(opts.contrast ?? 1, 0.8, 1.35);
  const tint = clamp(opts.tint ?? 0.5, 0, 1);
  const aHue = accentHue(hue, harmony);

  // neutral saturation: a touch of the base hue bled into greys
  const nSat = clamp((dark ? 16 : 12) * tint, 0, 24);

  let t;
  if (dark) {
    const sep = (base) => clamp(base * c, 0, 100);
    t = {
      'color-bg': hslHex(hue, nSat, 7),
      'color-surface': hslHex(hue, nSat, 11),
      'color-surface-2': hslHex(hue, nSat * 0.9, 16),
      'color-border': hslHex(hue, nSat * 0.8, 22),
      'color-text': hslHex(hue, nSat * 0.5, sep(76)),
      'color-muted': hslHex(hue, nSat * 0.5, 56),
      'color-strong': hslHex(hue, nSat * 0.4, sep(96)),
      'color-primary': hslHex(hue, clamp(sat + 4, 0, 100), 62),
      'color-accent': hslHex(aHue, clamp(sat + 8, 0, 100), 64),
      'color-success': hslHex(152, 55, 60),
      'color-warning': hslHex(40, 90, 62),
      'color-danger': hslHex(2, 80, 64),
    };
  } else {
    const textL = clamp(28 - (c - 1) * 70, 10, 34);
    const strongL = clamp(13 - (c - 1) * 40, 6, 20);
    t = {
      'color-bg': hslHex(hue, nSat * 0.45, 99),
      'color-surface': hslHex(hue, nSat * 0.6, 96.5),
      'color-surface-2': hslHex(hue, nSat * 0.7, 93),
      'color-border': hslHex(hue, nSat * 0.7, 88),
      'color-text': hslHex(hue, clamp(nSat * 0.8, 0, 14), textL),
      'color-muted': hslHex(hue, clamp(nSat * 0.6, 0, 12), 45),
      'color-strong': hslHex(hue, clamp(nSat, 0, 18), strongL),
      'color-primary': hslHex(hue, sat, clamp(50 - (c - 1) * 20, 32, 60)),
      'color-accent': hslHex(aHue, clamp(sat + 4, 0, 100), 48),
      'color-success': hslHex(150, 60, 38),
      'color-warning': hslHex(36, 92, 45),
      'color-danger': hslHex(4, 74, 50),
    };
  }
  // pick readable text color that sits on the primary (for buttons)
  t['color-primary-contrast'] = bestOn(t['color-primary'], ['#ffffff', t['color-strong']]);
  return t;
}

/* ---- seed‑color generator (OKLCH, perceptually uniform) ----
   opts: { seed (hex brand color), vibrancy (0..1.6 chroma scale), harmony,
   mode:'light'|'dark', contrast (0.8..1.3) } */
export function generateFromSeed(opts) {
  const [, c0, h0] = hexToOklch(opts.seed || '#5b8cff');
  const H = ((h0 % 360) + 360) % 360;
  const vib = clamp(opts.vibrancy ?? 1, 0, 1.6);
  const baseC = clamp(c0 * vib, 0.02, 0.32);
  const aH = accentHue(H, opts.harmony || 'complementary');
  const dark = opts.mode === 'dark';
  const ct = clamp(opts.contrast ?? 1, 0.8, 1.3);
  const nC = Math.min(baseC * 0.16, dark ? 0.02 : 0.014); // neutral chroma (hint of hue)
  let t;
  if (dark) {
    t = {
      'color-bg': oklchHex(0.18, nC, H),
      'color-surface': oklchHex(0.225, nC, H),
      'color-surface-2': oklchHex(0.27, nC * 0.9, H),
      'color-border': oklchHex(0.32, nC * 0.8, H),
      'color-text': oklchHex(clamp(0.80 * ct, 0.6, 0.9), nC * 1.4, H),
      'color-muted': oklchHex(0.64, nC * 1.2, H),
      'color-strong': oklchHex(clamp(0.96 * ct, 0.85, 0.99), nC, H),
      'color-primary': oklchHex(0.70, Math.max(baseC, 0.12), H),
      'color-accent': oklchHex(0.72, Math.max(baseC, 0.12), aH),
      'color-success': oklchHex(0.74, 0.15, 150),
      'color-warning': oklchHex(0.80, 0.15, 80),
      'color-danger': oklchHex(0.68, 0.18, 25),
    };
  } else {
    t = {
      'color-bg': oklchHex(0.992, nC * 0.5, H),
      'color-surface': oklchHex(0.972, nC * 0.7, H),
      'color-surface-2': oklchHex(0.94, nC * 0.9, H),
      'color-border': oklchHex(0.90, nC, H),
      'color-text': oklchHex(clamp(0.40 - (ct - 1) * 0.5, 0.28, 0.46), nC * 1.6, H),
      'color-muted': oklchHex(0.56, nC * 1.3, H),
      'color-strong': oklchHex(clamp(0.28 - (ct - 1) * 0.4, 0.18, 0.34), nC * 1.2, H),
      'color-primary': oklchHex(clamp(0.62 - (ct - 1) * 0.25, 0.45, 0.7), Math.max(baseC, 0.13), H),
      'color-accent': oklchHex(0.60, Math.max(baseC, 0.13), aH),
      'color-success': oklchHex(0.58, 0.15, 150),
      'color-warning': oklchHex(0.70, 0.16, 75),
      'color-danger': oklchHex(0.56, 0.19, 27),
    };
  }
  t['color-primary-contrast'] = bestOn(t['color-primary'], ['#ffffff', '#0b0d10']);
  return t;
}

/* sensible randomization (avoids muddy/garish results) */
export function randomScheme(prev = {}) {
  const r = (a, b) => a + Math.random() * (b - a);
  const harmonies = Object.keys(HARMONIES);
  return {
    hue: round(r(0, 360)),
    sat: round(r(52, 86)),
    harmony: harmonies[round(r(0, harmonies.length - 1))],
    mode: prev.mode || 'light',
    contrast: 1,
    tint: round(r(0.3, 0.8) * 100) / 100,
  };
}

/* contrast grade for UI feedback */
export function grade(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA·lg';
  return 'low';
}
