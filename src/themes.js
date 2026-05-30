/* ============================================================
   Wisy themes — design tokens → CSS variables.
   Tokens cover color, typography (vetted Google pairings),
   spacing, radius, shadow. Components reference these vars so
   re-theming is global and instant.
   ============================================================ */

/* Default token set. Every preset is a partial override of this. */
export const DEFAULT_TOKENS = {
  // color
  'color-bg': '#ffffff',
  'color-surface': '#f7f8fa',
  'color-surface-2': '#eef0f4',
  'color-text': '#39414e',
  'color-muted': '#6b7480',
  'color-strong': '#10141b',
  'color-border': '#e3e7ee',
  'color-primary': '#5b8cff',
  'color-primary-contrast': '#ffffff',
  'color-accent': '#7c5cff',
  'color-success': '#16a34a',
  'color-warning': '#d97706',
  'color-danger': '#dc2626',
  // typography
  'font-display': "'Inter', system-ui, sans-serif",
  'font-ui': "'Inter', system-ui, sans-serif",
  'font-mono': "'JetBrains Mono', ui-monospace, monospace",
  'text-base': '16px',
  'scale': '1.25',           // modular type scale ratio
  'leading': '1.6',
  'leading-tight': '1.15',
  'tracking': '0em',          // body tracking
  'tracking-tight': '-0.02em', // heading tracking
  'weight-body': '400',
  'weight-heading': '700',
  // shape & rhythm
  'radius': '10px',
  'radius-lg': '18px',
  'space': '16px',
  'container': '1120px',
  'shadow': '0 1px 2px rgba(16,20,27,.06), 0 4px 16px rgba(16,20,27,.06)',
  'shadow-lg': '0 12px 40px rgba(16,20,27,.12)',
};

/* Curated presets. Font pairings chosen for contrast + legibility. */
export const THEME_PRESETS = [
  {
    id: 'studio', name: 'Studio', tag: 'SaaS · clean',
    swatches: ['#5b8cff', '#10141b', '#f7f8fa'],
    tokens: {}, // = defaults
  },
  {
    id: 'editorial', name: 'Editorial', tag: 'Serif · elegant',
    swatches: ['#1a1a1a', '#c2410c', '#faf7f2'],
    tokens: {
      'color-bg': '#faf7f2', 'color-surface': '#f3ece1', 'color-surface-2': '#e9dfd0',
      'color-text': '#3a342c', 'color-muted': '#7a7066', 'color-strong': '#1a1612', 'color-border': '#e3d8c8',
      'color-primary': '#c2410c', 'color-accent': '#1a1612', 'color-primary-contrast': '#fffaf3',
      'font-display': "'Fraunces', Georgia, serif", 'font-ui': "'Inter', system-ui, sans-serif",
      'scale': '1.333', 'leading': '1.7', 'tracking-tight': '-0.01em', 'weight-heading': '600', 'radius': '4px', 'radius-lg': '8px',
    },
  },
  {
    id: 'aurora', name: 'Aurora', tag: 'Vibrant · gradient',
    swatches: ['#7c3aed', '#ec4899', '#0b1020'],
    tokens: {
      'color-bg': '#0b1020', 'color-surface': '#141a2e', 'color-surface-2': '#1d2742',
      'color-text': '#c7d0e4', 'color-muted': '#8a93ad', 'color-strong': '#f3f6ff', 'color-border': '#283250',
      'color-primary': '#8b5cf6', 'color-accent': '#ec4899', 'color-primary-contrast': '#ffffff',
      'font-display': "'Outfit', system-ui, sans-serif", 'font-ui': "'Inter', system-ui, sans-serif",
      'scale': '1.28', 'radius': '14px', 'radius-lg': '24px',
      'shadow': '0 2px 8px rgba(0,0,0,.3)', 'shadow-lg': '0 20px 60px rgba(124,58,237,.25)',
    },
  },
  {
    id: 'synth', name: 'Synth', tag: 'Audio · dark UI',
    swatches: ['#22d3ee', '#f59e0b', '#0a0c10'],
    tokens: {
      'color-bg': '#0a0c10', 'color-surface': '#13171e', 'color-surface-2': '#1b2129',
      'color-text': '#b8c0cc', 'color-muted': '#7c8593', 'color-strong': '#eef2f7', 'color-border': '#232a34',
      'color-primary': '#22d3ee', 'color-accent': '#f59e0b', 'color-primary-contrast': '#06121a',
      'color-success': '#34d399', 'color-warning': '#fbbf24', 'color-danger': '#f87171',
      'font-display': "'Space Grotesk', system-ui, sans-serif", 'font-ui': "'Inter', system-ui, sans-serif",
      'font-mono': "'JetBrains Mono', monospace",
      'scale': '1.22', 'radius': '8px', 'radius-lg': '14px',
      'shadow': '0 1px 2px rgba(0,0,0,.5)', 'shadow-lg': '0 16px 50px rgba(0,0,0,.6)',
    },
  },
  {
    id: 'noir', name: 'Noir', tag: 'Minimal · mono',
    swatches: ['#fafafa', '#a3a3a3', '#0a0a0a'],
    tokens: {
      'color-bg': '#0a0a0a', 'color-surface': '#141414', 'color-surface-2': '#1f1f1f',
      'color-text': '#bdbdbd', 'color-muted': '#7d7d7d', 'color-strong': '#fafafa', 'color-border': '#262626',
      'color-primary': '#fafafa', 'color-accent': '#a3a3a3', 'color-primary-contrast': '#0a0a0a',
      'font-display': "'Manrope', system-ui, sans-serif", 'font-ui': "'Manrope', system-ui, sans-serif",
      'scale': '1.2', 'radius': '6px', 'radius-lg': '10px', 'tracking-tight': '-0.03em', 'weight-heading': '800',
    },
  },
  {
    id: 'warm', name: 'Warm', tag: 'Friendly · rounded',
    swatches: ['#f97316', '#0d9488', '#fffdf9'],
    tokens: {
      'color-bg': '#fffdf9', 'color-surface': '#fff6ec', 'color-surface-2': '#ffedd9',
      'color-text': '#44403c', 'color-muted': '#78716c', 'color-strong': '#1c1917', 'color-border': '#f0e6d8',
      'color-primary': '#f97316', 'color-accent': '#0d9488', 'color-primary-contrast': '#ffffff',
      'font-display': "'Plus Jakarta Sans', system-ui, sans-serif", 'font-ui': "'Plus Jakarta Sans', system-ui, sans-serif",
      'scale': '1.25', 'radius': '16px', 'radius-lg': '28px', 'weight-heading': '700',
    },
  },
  {
    id: 'brutal', name: 'Brutalist', tag: 'Bold · flat',
    swatches: ['#ffe600', '#000000', '#ffffff'],
    tokens: {
      'color-bg': '#ffffff', 'color-surface': '#f4f4f4', 'color-surface-2': '#ffe600',
      'color-text': '#0a0a0a', 'color-muted': '#404040', 'color-strong': '#000000', 'color-border': '#000000',
      'color-primary': '#0a0a0a', 'color-accent': '#1d4ed8', 'color-primary-contrast': '#ffe600',
      'font-display': "'Archivo', system-ui, sans-serif", 'font-ui': "'Archivo', system-ui, sans-serif",
      'scale': '1.4', 'radius': '0px', 'radius-lg': '0px', 'tracking-tight': '-0.04em', 'weight-heading': '800',
      'shadow': '4px 4px 0 #000', 'shadow-lg': '8px 8px 0 #000',
    },
  },
  {
    id: 'ocean', name: 'Ocean', tag: 'Calm · corporate',
    swatches: ['#0ea5e9', '#0f766e', '#f8fafc'],
    tokens: {
      'color-bg': '#f8fafc', 'color-surface': '#ffffff', 'color-surface-2': '#eef4f8',
      'color-text': '#334155', 'color-muted': '#64748b', 'color-strong': '#0f172a', 'color-border': '#e2e8f0',
      'color-primary': '#0ea5e9', 'color-accent': '#0f766e', 'color-primary-contrast': '#ffffff',
      'font-display': "'Sora', system-ui, sans-serif", 'font-ui': "'Inter', system-ui, sans-serif",
      'scale': '1.25', 'radius': '12px', 'radius-lg': '20px',
    },
  },
];

/* Theme-editor field layout */
export const TOKEN_SCHEMA = [
  {
    group: 'Brand color', fields: [
      { key: 'color-primary', label: 'Primary', type: 'color' },
      { key: 'color-accent', label: 'Accent', type: 'color' },
      { key: 'color-primary-contrast', label: 'On primary', type: 'color' },
    ],
  },
  {
    group: 'Surfaces', fields: [
      { key: 'color-bg', label: 'Background', type: 'color' },
      { key: 'color-surface', label: 'Surface', type: 'color' },
      { key: 'color-surface-2', label: 'Surface 2', type: 'color' },
      { key: 'color-border', label: 'Border', type: 'color' },
    ],
  },
  {
    group: 'Text', fields: [
      { key: 'color-strong', label: 'Heading', type: 'color' },
      { key: 'color-text', label: 'Body', type: 'color' },
      { key: 'color-muted', label: 'Muted', type: 'color' },
    ],
  },
  {
    group: 'Typography', fields: [
      { key: 'font-display', label: 'Display', type: 'font' },
      { key: 'font-ui', label: 'Body', type: 'font' },
      { key: 'text-base', label: 'Base size', type: 'text' },
      { key: 'scale', label: 'Scale', type: 'select', options: ['1.2', '1.25', '1.333', '1.414', '1.5'] },
      { key: 'leading', label: 'Line height', type: 'text' },
    ],
  },
  {
    group: 'Shape', fields: [
      { key: 'radius', label: 'Radius', type: 'text' },
      { key: 'radius-lg', label: 'Radius lg', type: 'text' },
      { key: 'container', label: 'Container', type: 'text' },
    ],
  },
];

/* Google Fonts available in the font picker (family → weights query) */
export const FONT_OPTIONS = [
  "Inter", "Manrope", "Plus Jakarta Sans", "Sora", "Outfit", "Space Grotesk",
  "Archivo", "Fraunces", "Lora", "Playfair Display", "Sora", "DM Sans",
  "Work Sans", "Figtree", "Bricolage Grotesque", "Instrument Serif",
  "IBM Plex Sans", "IBM Plex Mono", "JetBrains Mono", "Space Mono",
];

/* Extract the family names referenced by the current tokens so we can
   request exactly those from Google Fonts (editor + export). */
export function fontsFromTokens(tokens) {
  const fams = new Set();
  ['font-display', 'font-ui', 'font-mono'].forEach((k) => {
    const v = tokens[k] || '';
    const m = v.match(/'([^']+)'|"([^"]+)"/);
    const fam = (m && (m[1] || m[2])) || v.split(',')[0].trim();
    if (fam && !/system-ui|serif|sans-serif|monospace|ui-monospace|Georgia|Menlo/.test(fam)) fams.add(fam);
  });
  return [...fams];
}

export function googleFontsHref(tokens) {
  const fams = fontsFromTokens(tokens);
  if (!fams.length) return null;
  const q = fams.map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800`).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/* Build the :root { --token: value } block + type-scale helpers. */
export function tokensToCss(tokens) {
  const t = { ...DEFAULT_TOKENS, ...tokens };
  const scale = parseFloat(t.scale) || 1.25;
  const sizes = {
    'fs-xs': Math.pow(scale, -1), 'fs-sm': Math.pow(scale, -0.5), 'fs-md': 1,
    'fs-lg': scale, 'fs-xl': Math.pow(scale, 2), 'fs-2xl': Math.pow(scale, 3),
    'fs-3xl': Math.pow(scale, 4), 'fs-4xl': Math.pow(scale, 5),
  };
  let vars = '';
  for (const k in t) vars += `  --${k}: ${t[k]};\n`;
  for (const k in sizes) vars += `  --${k}: ${sizes[k].toFixed(4)}rem;\n`;
  // widget aliases
  vars += `  --accent: var(--color-primary);\n  --warn: var(--color-warning);\n`;
  vars += `  --txt-strong: var(--color-strong);\n  --txt-muted: var(--color-muted);\n`;
  return `:root {\n${vars}}`;
}
