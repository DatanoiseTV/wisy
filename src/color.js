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
