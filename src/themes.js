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

import { generateFromSeed, oklchHex } from './color.js';

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
  {
    id: 'forest', name: 'Forest', tag: 'Natural · light',
    swatches: ['#2f855a', '#b45309', '#f6faf7'],
    tokens: {
      'color-bg': '#f6faf7', 'color-surface': '#eaf3ed', 'color-surface-2': '#dcebe1',
      'color-text': '#34433b', 'color-muted': '#6b7d72', 'color-strong': '#13241b', 'color-border': '#d4e4da',
      'color-primary': '#2f855a', 'color-accent': '#b45309', 'color-primary-contrast': '#ffffff',
      'font-display': "'Sora', system-ui, sans-serif", 'radius': '12px', 'radius-lg': '20px',
    },
  },
  {
    id: 'sunset', name: 'Sunset', tag: 'Warm · dark',
    swatches: ['#fb7185', '#f59e0b', '#1a1020'],
    tokens: {
      'color-bg': '#160e1c', 'color-surface': '#221531', 'color-surface-2': '#2e1d40',
      'color-text': '#d8c7dd', 'color-muted': '#9a86a3', 'color-strong': '#fdf2f8', 'color-border': '#352447',
      'color-primary': '#fb7185', 'color-accent': '#f59e0b', 'color-primary-contrast': '#1a1020',
      'font-display': "'Outfit', system-ui, sans-serif", 'radius': '14px', 'radius-lg': '22px',
      'shadow-lg': '0 18px 60px rgba(251,113,133,.22)',
    },
  },
  {
    id: 'grape', name: 'Grape', tag: 'Playful · light',
    swatches: ['#7c3aed', '#db2777', '#faf8ff'],
    tokens: {
      'color-bg': '#faf8ff', 'color-surface': '#f2ecff', 'color-surface-2': '#e7dcff',
      'color-text': '#403a4d', 'color-muted': '#766d87', 'color-strong': '#1e1530', 'color-border': '#e3d8f5',
      'color-primary': '#7c3aed', 'color-accent': '#db2777', 'color-primary-contrast': '#ffffff',
      'font-display': "'Plus Jakarta Sans', system-ui, sans-serif", 'radius': '16px', 'radius-lg': '26px',
    },
  },
  {
    id: 'slate', name: 'Slate', tag: 'Corporate · cool',
    swatches: ['#475569', '#0284c7', '#f8fafc'],
    tokens: {
      'color-bg': '#f8fafc', 'color-surface': '#f1f5f9', 'color-surface-2': '#e2e8f0',
      'color-text': '#334155', 'color-muted': '#64748b', 'color-strong': '#0f172a', 'color-border': '#dbe2ea',
      'color-primary': '#334155', 'color-accent': '#0284c7', 'color-primary-contrast': '#ffffff',
      'font-display': "'IBM Plex Sans', system-ui, sans-serif", 'font-ui': "'IBM Plex Sans', system-ui, sans-serif",
      'scale': '1.2', 'radius': '6px', 'radius-lg': '10px',
    },
  },
  {
    id: 'crimson', name: 'Crimson', tag: 'Bold · editorial',
    swatches: ['#dc2626', '#171717', '#fffaf9'],
    tokens: {
      'color-bg': '#fffaf9', 'color-surface': '#fdeeec', 'color-surface-2': '#fbdedb',
      'color-text': '#3a2a28', 'color-muted': '#82706d', 'color-strong': '#1a0f0e', 'color-border': '#f1d9d6',
      'color-primary': '#dc2626', 'color-accent': '#171717', 'color-primary-contrast': '#ffffff',
      'font-display': "'Fraunces', Georgia, serif", 'scale': '1.333', 'radius': '4px', 'radius-lg': '8px', 'weight-heading': '600',
    },
  },
  {
    id: 'mint', name: 'Mint', tag: 'Fresh · light',
    swatches: ['#0d9488', '#0ea5e9', '#f5fbfa'],
    tokens: {
      'color-bg': '#f5fbfa', 'color-surface': '#e7f5f2', 'color-surface-2': '#d6efe9',
      'color-text': '#2f4a45', 'color-muted': '#5f827b', 'color-strong': '#0c2925', 'color-border': '#cce8e2',
      'color-primary': '#0d9488', 'color-accent': '#0ea5e9', 'color-primary-contrast': '#ffffff',
      'font-display': "'DM Sans', system-ui, sans-serif", 'font-ui': "'DM Sans', system-ui, sans-serif", 'radius': '14px', 'radius-lg': '22px',
    },
  },
  {
    id: 'midnight', name: 'Midnight', tag: 'Deep · dark',
    swatches: ['#3b82f6', '#22d3ee', '#070b14'],
    tokens: {
      'color-bg': '#070b14', 'color-surface': '#0e1422', 'color-surface-2': '#161f31',
      'color-text': '#b3bdd1', 'color-muted': '#76829b', 'color-strong': '#eef2fb', 'color-border': '#1d2638',
      'color-primary': '#3b82f6', 'color-accent': '#22d3ee', 'color-primary-contrast': '#ffffff',
      'font-display': "'Sora', system-ui, sans-serif", 'radius': '10px', 'radius-lg': '16px',
    },
  },
  {
    id: 'sand', name: 'Sand', tag: 'Muted · warm',
    swatches: ['#a16207', '#3f3f46', '#fbf9f4'],
    tokens: {
      'color-bg': '#fbf9f4', 'color-surface': '#f3eee2', 'color-surface-2': '#e9e1cf',
      'color-text': '#46413a', 'color-muted': '#7c7466', 'color-strong': '#211e18', 'color-border': '#e4dccb',
      'color-primary': '#a16207', 'color-accent': '#3f3f46', 'color-primary-contrast': '#fffaf0',
      'font-display': "'Work Sans', system-ui, sans-serif", 'font-ui': "'Work Sans', system-ui, sans-serif", 'radius': '8px', 'radius-lg': '14px',
    },
  },
  {
    id: 'terminal', name: 'Terminal', tag: 'Hacker · mono',
    swatches: ['#22c55e', '#a3e635', '#05080a'],
    tokens: {
      'color-bg': '#05080a', 'color-surface': '#0c1110', 'color-surface-2': '#121917',
      'color-text': '#9fb3a8', 'color-muted': '#5f7268', 'color-strong': '#d7ffe6', 'color-border': '#1a2420',
      'color-primary': '#22c55e', 'color-accent': '#a3e635', 'color-primary-contrast': '#05080a',
      'font-display': "'JetBrains Mono', monospace", 'font-ui': "'JetBrains Mono', monospace", 'font-mono': "'JetBrains Mono', monospace",
      'scale': '1.2', 'radius': '4px', 'radius-lg': '6px', 'tracking': '-0.01em',
    },
  },
  {
    id: 'candy', name: 'Candy', tag: 'Soft · pastel',
    swatches: ['#f472b6', '#60a5fa', '#fff7fb'],
    tokens: {
      'color-bg': '#fff7fb', 'color-surface': '#fdeef6', 'color-surface-2': '#fbe0ee',
      'color-text': '#4a3a44', 'color-muted': '#8a7682', 'color-strong': '#2a1a24', 'color-border': '#f6dbe9',
      'color-primary': '#ec4899', 'color-accent': '#60a5fa', 'color-primary-contrast': '#ffffff',
      'font-display': "'Figtree', system-ui, sans-serif", 'font-ui': "'Figtree', system-ui, sans-serif", 'radius': '20px', 'radius-lg': '32px', 'weight-heading': '700',
    },
  },
  {
    id: 'royal', name: 'Royal', tag: 'Premium · dark',
    swatches: ['#1e3a8a', '#eab308', '#0b1020'],
    tokens: {
      'color-bg': '#0a0f1f', 'color-surface': '#111934', 'color-surface-2': '#1a2549',
      'color-text': '#c0c9e0', 'color-muted': '#8290b3', 'color-strong': '#f5f7ff', 'color-border': '#223057',
      'color-primary': '#4f6ef0', 'color-accent': '#eab308', 'color-primary-contrast': '#0b1020',
      'font-display': "'Playfair Display', Georgia, serif", 'scale': '1.333', 'radius': '8px', 'radius-lg': '14px', 'weight-heading': '600',
    },
  },
  {
    id: 'arctic', name: 'Arctic', tag: 'Icy · light',
    swatches: ['#0891b2', '#6366f1', '#f4fafe'],
    tokens: {
      'color-bg': '#f4fafe', 'color-surface': '#e8f3fb', 'color-surface-2': '#d8ebf7',
      'color-text': '#324653', 'color-muted': '#5f7888', 'color-strong': '#0b2330', 'color-border': '#cfe4f1',
      'color-primary': '#0891b2', 'color-accent': '#6366f1', 'color-primary-contrast': '#ffffff',
      'font-display': "'Manrope', system-ui, sans-serif", 'font-ui': "'Manrope', system-ui, sans-serif", 'radius': '12px', 'radius-lg': '20px',
    },
  },
  {
    id: 'neon', name: 'Neon', tag: 'Cyber · dark',
    swatches: ['#d946ef', '#06b6d4', '#0a0612'],
    tokens: {
      'color-bg': '#0a0612', 'color-surface': '#150d24', 'color-surface-2': '#1f1436',
      'color-text': '#c4b6e0', 'color-muted': '#8576a8', 'color-strong': '#f6efff', 'color-border': '#2a1b44',
      'color-primary': '#d946ef', 'color-accent': '#06b6d4', 'color-primary-contrast': '#0a0612',
      'font-display': "'Space Grotesk', system-ui, sans-serif", 'radius': '10px', 'radius-lg': '16px',
      'shadow-lg': '0 0 40px rgba(217,70,239,.3)',
    },
  },
  {
    id: 'paper', name: 'Paper', tag: 'Print · serif',
    swatches: ['#171717', '#9a3412', '#ffffff'],
    tokens: {
      'color-bg': '#ffffff', 'color-surface': '#f6f6f4', 'color-surface-2': '#ededea',
      'color-text': '#2b2b28', 'color-muted': '#6f6f68', 'color-strong': '#0a0a0a', 'color-border': '#e2e2dd',
      'color-primary': '#171717', 'color-accent': '#9a3412', 'color-primary-contrast': '#ffffff',
      'font-display': "'Lora', Georgia, serif", 'font-ui': "'Lora', Georgia, serif", 'scale': '1.414', 'leading': '1.75', 'radius': '2px', 'radius-lg': '4px', 'weight-heading': '600',
    },
  },
  { id: 'coral', name: 'Coral', tag: 'Warm · light', swatches: ['#ff6b6b', '#1f2937', '#fff8f6'], tokens: { 'color-bg': '#fff8f6', 'color-surface': '#fdeeea', 'color-surface-2': '#fbe0d8', 'color-text': '#43352f', 'color-muted': '#8a746c', 'color-strong': '#241712', 'color-border': '#f3ddd4', 'color-primary': '#ff5a5f', 'color-accent': '#1f9e8f', 'color-primary-contrast': '#ffffff', 'font-display': "'Plus Jakarta Sans', system-ui, sans-serif", 'radius': '14px', 'radius-lg': '24px' } },
  { id: 'lavender', name: 'Lavender', tag: 'Soft · light', swatches: ['#8b7cf6', '#4c1d95', '#faf9ff'], tokens: { 'color-bg': '#faf9ff', 'color-surface': '#f1eefc', 'color-surface-2': '#e6e0fa', 'color-text': '#413a52', 'color-muted': '#7a7191', 'color-strong': '#1f1633', 'color-border': '#e6def7', 'color-primary': '#7c5cff', 'color-accent': '#d946ef', 'color-primary-contrast': '#ffffff', 'font-display': "'Outfit', system-ui, sans-serif", 'radius': '16px', 'radius-lg': '26px' } },
  { id: 'sage', name: 'Sage', tag: 'Earthy · calm', swatches: ['#5f7a5f', '#2f3a2f', '#f7f8f4'], tokens: { 'color-bg': '#f7f8f4', 'color-surface': '#eef1e8', 'color-surface-2': '#e2e7d8', 'color-text': '#3a4138', 'color-muted': '#6f786a', 'color-strong': '#1d2419', 'color-border': '#dde3d2', 'color-primary': '#5f8b5a', 'color-accent': '#a8742b', 'color-primary-contrast': '#ffffff', 'font-display': "'Fraunces', Georgia, serif", 'scale': '1.333', 'radius': '8px', 'radius-lg': '14px', 'weight-heading': '600' } },
  { id: 'cobalt', name: 'Cobalt', tag: 'Tech · dark', swatches: ['#2563eb', '#38bdf8', '#0b1220'], tokens: { 'color-bg': '#0b1220', 'color-surface': '#121b2e', 'color-surface-2': '#1a2640', 'color-text': '#b6c2da', 'color-muted': '#7986a3', 'color-strong': '#eef3fc', 'color-border': '#22304c', 'color-primary': '#3b82f6', 'color-accent': '#38bdf8', 'color-primary-contrast': '#ffffff', 'font-display': "'Space Grotesk', system-ui, sans-serif", 'radius': '8px', 'radius-lg': '14px' } },
  { id: 'rose', name: 'Rosé', tag: 'Elegant · light', swatches: ['#e11d6b', '#3f1d2e', '#fff7fa'], tokens: { 'color-bg': '#fff7fa', 'color-surface': '#fce9f0', 'color-surface-2': '#f9d7e4', 'color-text': '#4a2f3a', 'color-muted': '#8a6975', 'color-strong': '#2a121c', 'color-border': '#f3d3df', 'color-primary': '#e11d6b', 'color-accent': '#9333ea', 'color-primary-contrast': '#ffffff', 'font-display': "'Playfair Display', Georgia, serif", 'scale': '1.333', 'radius': '6px', 'radius-lg': '12px', 'weight-heading': '600' } },
  { id: 'emerald', name: 'Emerald', tag: 'Fresh · corporate', swatches: ['#059669', '#064e3b', '#f5fbf8'], tokens: { 'color-bg': '#f5fbf8', 'color-surface': '#e7f4ee', 'color-surface-2': '#d4ece1', 'color-text': '#314740', 'color-muted': '#5f7f73', 'color-strong': '#0a2c20', 'color-border': '#cde6db', 'color-primary': '#059669', 'color-accent': '#0d9488', 'color-primary-contrast': '#ffffff', 'font-display': "'Sora', system-ui, sans-serif", 'radius': '12px', 'radius-lg': '20px' } },
  { id: 'amber', name: 'Amber', tag: 'Bold · warm', swatches: ['#f59e0b', '#451a03', '#fffaf0'], tokens: { 'color-bg': '#fffaf0', 'color-surface': '#fdf0d9', 'color-surface-2': '#fbe3bb', 'color-text': '#4a3a22', 'color-muted': '#8a7250', 'color-strong': '#2a1c08', 'color-border': '#f3e2c2', 'color-primary': '#ea8a06', 'color-accent': '#dc2626', 'color-primary-contrast': '#2a1c08', 'font-display': "'Archivo', system-ui, sans-serif", 'scale': '1.333', 'radius': '10px', 'radius-lg': '16px', 'weight-heading': '800' } },
  { id: 'indigo', name: 'Indigo', tag: 'Deep · refined', swatches: ['#6366f1', '#a5b4fc', '#0c0e1a'], tokens: { 'color-bg': '#0c0e1a', 'color-surface': '#14172a', 'color-surface-2': '#1e2240', 'color-text': '#bcc2e0', 'color-muted': '#7e85ad', 'color-strong': '#f1f3ff', 'color-border': '#262c4d', 'color-primary': '#6366f1', 'color-accent': '#a78bfa', 'color-primary-contrast': '#ffffff', 'font-display': "'Manrope', system-ui, sans-serif", 'radius': '12px', 'radius-lg': '18px' } },
  { id: 'cream', name: 'Cream', tag: 'Minimal · soft', swatches: ['#1c1917', '#b45309', '#fdfcf7'], tokens: { 'color-bg': '#fdfcf7', 'color-surface': '#f6f3ea', 'color-surface-2': '#ece7d8', 'color-text': '#3d3a32', 'color-muted': '#79746a', 'color-strong': '#1c1917', 'color-border': '#e9e3d4', 'color-primary': '#1c1917', 'color-accent': '#b45309', 'color-primary-contrast': '#fdfcf7', 'font-display': "'Instrument Serif', Georgia, serif", 'scale': '1.414', 'radius': '4px', 'radius-lg': '8px' } },
  { id: 'graphite', name: 'Graphite', tag: 'Pro · neutral dark', swatches: ['#e5e7eb', '#9ca3af', '#0e0f11'], tokens: { 'color-bg': '#0e0f11', 'color-surface': '#17181b', 'color-surface-2': '#202327', 'color-text': '#b6b9c0', 'color-muted': '#7c8088', 'color-strong': '#f3f4f6', 'color-border': '#2a2d33', 'color-primary': '#e5e7eb', 'color-accent': '#60a5fa', 'color-primary-contrast': '#0e0f11', 'font-display': "'Inter', system-ui, sans-serif", 'radius': '8px', 'radius-lg': '12px', 'tracking-tight': '-0.03em' } },
  { id: 'bubblegum', name: 'Bubblegum', tag: 'Playful · pop', swatches: ['#ff4fa3', '#22d3ee', '#fff6fb'], tokens: { 'color-bg': '#fff6fb', 'color-surface': '#ffe9f4', 'color-surface-2': '#ffd6ec', 'color-text': '#4a2b3d', 'color-muted': '#9a6a85', 'color-strong': '#2a0f20', 'color-border': '#ffcfe6', 'color-primary': '#ff4fa3', 'color-accent': '#22d3ee', 'color-primary-contrast': '#ffffff', 'font-display': "'Bricolage Grotesque', system-ui, sans-serif", 'radius': '22px', 'radius-lg': '34px', 'weight-heading': '800' } },
  { id: 'matcha', name: 'Matcha', tag: 'Natural · zen', swatches: ['#84cc16', '#3f6212', '#f8faf2'], tokens: { 'color-bg': '#f8faf2', 'color-surface': '#eef4e0', 'color-surface-2': '#e2eccd', 'color-text': '#3b4327', 'color-muted': '#6f7a52', 'color-strong': '#1f2a0e', 'color-border': '#dce8c4', 'color-primary': '#65a30d', 'color-accent': '#0f766e', 'color-primary-contrast': '#ffffff', 'font-display': "'DM Sans', system-ui, sans-serif", 'radius': '12px', 'radius-lg': '20px' } },
  { id: 'wine', name: 'Wine', tag: 'Luxe · dark', swatches: ['#9f1239', '#fb7185', '#140a0e'], tokens: { 'color-bg': '#140a0e', 'color-surface': '#1f1016', 'color-surface-2': '#2c1620', 'color-text': '#d6bcc4', 'color-muted': '#9c7984', 'color-strong': '#fbeef2', 'color-border': '#3a1d28', 'color-primary': '#e11d48', 'color-accent': '#f59e0b', 'color-primary-contrast': '#ffffff', 'font-display': "'Playfair Display', Georgia, serif", 'scale': '1.333', 'radius': '6px', 'radius-lg': '12px', 'weight-heading': '600' } },
  { id: 'steel', name: 'Steel', tag: 'Industrial · cool', swatches: ['#0891b2', '#334155', '#eef2f5'], tokens: { 'color-bg': '#eef2f5', 'color-surface': '#e2e8ed', 'color-surface-2': '#d2dae1', 'color-text': '#37434f', 'color-muted': '#647383', 'color-strong': '#101921', 'color-border': '#cbd5dd', 'color-primary': '#0e7490', 'color-accent': '#475569', 'color-primary-contrast': '#ffffff', 'font-display': "'IBM Plex Sans', system-ui, sans-serif", 'font-ui': "'IBM Plex Sans', system-ui, sans-serif", 'radius': '4px', 'radius-lg': '8px' } },
  { id: 'sunrise', name: 'Sunrise', tag: 'Gradient · vivid', swatches: ['#f97316', '#ec4899', '#fffaf7'], tokens: { 'color-bg': '#fffaf7', 'color-surface': '#fff0e9', 'color-surface-2': '#ffe0d3', 'color-text': '#46352f', 'color-muted': '#8a6f63', 'color-strong': '#2a1a12', 'color-border': '#f7dccf', 'color-primary': '#f97316', 'color-accent': '#ec4899', 'color-primary-contrast': '#ffffff', 'font-display': "'Figtree', system-ui, sans-serif", 'radius': '14px', 'radius-lg': '22px' } },
];

/* ---- generated theme matrix: hue wheel × style variations ---- */
const HUES = [
  ['Azure', 232], ['Cobalt', 218], ['Sky', 205], ['Cyan', 192], ['Teal', 178], ['Emerald', 160],
  ['Green', 142], ['Lime', 110], ['Gold', 70], ['Amber', 45], ['Orange', 28], ['Coral', 14],
  ['Crimson', 2], ['Rose', 348], ['Pink', 330], ['Magenta', 312], ['Grape', 292], ['Violet', 276], ['Indigo', 258], ['Slate', 235],
];
const STYLES = [
  { suffix: '', mode: 'light', font: 'Inter', radius: 12, scale: 1.25, vib: 1, harmony: 'analogous', tag: 'Light' },
  { suffix: ' Dark', mode: 'dark', font: 'Inter', radius: 12, scale: 1.25, vib: 1.05, harmony: 'analogous', tag: 'Dark' },
  { suffix: ' Soft', mode: 'light', font: 'Plus Jakarta Sans', radius: 20, scale: 1.25, vib: 0.95, harmony: 'analogous', tag: 'Rounded' },
  { suffix: ' Bold', mode: 'light', font: 'Archivo', radius: 3, scale: 1.4, vib: 1.12, harmony: 'complementary', tag: 'Bold' },
  { suffix: ' Serif', mode: 'light', font: 'Fraunces', radius: 6, scale: 1.333, vib: 0.9, harmony: 'analogous', tag: 'Editorial', serif: true },
  { suffix: ' Night', mode: 'dark', font: 'Space Grotesk', radius: 10, scale: 1.22, vib: 1.18, harmony: 'complementary', tag: 'Dark' },
];
function makeTheme(name, hue, st, idx) {
  const seed = oklchHex(st.mode === 'dark' ? 0.68 : 0.6, 0.12 + 0.06 * st.vib, hue);
  const colors = generateFromSeed({ seed, vibrancy: st.vib, harmony: st.harmony, mode: st.mode, contrast: 1 });
  const display = st.serif ? `'${st.font}', Georgia, serif` : `'${st.font}', system-ui, sans-serif`;
  const tokens = {
    ...colors, 'font-display': display, 'font-ui': "'Inter', system-ui, sans-serif",
    'radius': st.radius + 'px', 'radius-lg': Math.round(st.radius * 1.7) + 'px', 'scale': String(st.scale),
    'weight-heading': st.serif ? '600' : (st.radius <= 4 ? '800' : '700'),
  };
  return { id: `g-${name.toLowerCase()}-${idx}`, name: name + st.suffix, tag: st.tag, swatches: [colors['color-primary'], colors['color-accent'], colors['color-bg']], tokens };
}
HUES.forEach(([name, hue]) => STYLES.forEach((st, i) => THEME_PRESETS.push(makeTheme(name, hue, st, i))));

/* ---- really cool, hand-crafted themes (mesh gradients, neon, grids, dev palettes) ---- */
const mono = "'JetBrains Mono', ui-monospace, monospace";
const COOL = [
  { id: 'aurora-mesh', name: 'Aurora Mesh', tag: 'Mesh · dark', swatches: ['#22d3ee', '#a855f7', '#0a0c14'], tokens: { 'color-bg': '#0a0c14', 'color-surface': 'rgba(255,255,255,.04)', 'color-surface-2': 'rgba(255,255,255,.07)', 'color-text': '#c4cce0', 'color-muted': '#828bab', 'color-strong': '#f2f5ff', 'color-border': 'rgba(255,255,255,.1)', 'color-primary': '#22d3ee', 'color-accent': '#a855f7', 'color-primary-contrast': '#06121a', 'font-display': "'Space Grotesk', system-ui, sans-serif", 'radius': '14px', 'radius-lg': '22px', 'shadow-lg': '0 18px 60px rgba(168,85,247,.3)', 'bg-image': 'radial-gradient(55% 50% at 18% 12%, rgba(168,85,247,.35), transparent), radial-gradient(50% 45% at 85% 8%, rgba(34,211,238,.3), transparent), radial-gradient(60% 60% at 60% 100%, rgba(59,130,246,.25), transparent), #0a0c14' } },
  { id: 'nebula', name: 'Nebula', tag: 'Mesh · cosmic', swatches: ['#8b5cf6', '#ec4899', '#070512'], tokens: { 'color-bg': '#070512', 'color-surface': 'rgba(255,255,255,.045)', 'color-surface-2': 'rgba(255,255,255,.08)', 'color-text': '#c9c2e6', 'color-muted': '#8b82ad', 'color-strong': '#f5f0ff', 'color-border': 'rgba(255,255,255,.1)', 'color-primary': '#a78bfa', 'color-accent': '#f472b6', 'color-primary-contrast': '#0a0418', 'font-display': "'Outfit', system-ui, sans-serif", 'radius': '16px', 'radius-lg': '26px', 'shadow-lg': '0 20px 70px rgba(139,92,246,.35)', 'bg-image': 'radial-gradient(45% 40% at 25% 20%, rgba(139,92,246,.4), transparent), radial-gradient(40% 40% at 80% 30%, rgba(236,72,153,.32), transparent), radial-gradient(50% 50% at 50% 95%, rgba(56,189,248,.22), transparent), #070512' } },
  { id: 'cyberpunk', name: 'Cyberpunk', tag: 'Neon · glow', swatches: ['#f0f', '#0ff', '#0a0510'], tokens: { 'color-bg': '#0a0510', 'color-surface': '#14091d', 'color-surface-2': '#1d1029', 'color-text': '#d9b8e8', 'color-muted': '#9a7aad', 'color-strong': '#fdf0ff', 'color-border': '#2a1640', 'color-primary': '#ff2bd6', 'color-accent': '#22e6ff', 'color-primary-contrast': '#0a0510', 'font-display': "'Space Grotesk', system-ui, sans-serif", 'radius': '4px', 'radius-lg': '8px', 'shadow-lg': '0 0 40px rgba(255,43,214,.45)', 'shadow': '0 0 16px rgba(34,230,255,.3)' } },
  { id: 'vaporwave', name: 'Vaporwave', tag: 'Retro · pastel', swatches: ['#ff6ad5', '#26c6da', '#fdf0ff'], tokens: { 'color-bg': '#fbeffb', 'color-surface': '#ffffff', 'color-surface-2': '#f6e0f7', 'color-text': '#5a3b66', 'color-muted': '#9a7ba6', 'color-strong': '#3a1f44', 'color-border': '#f0d0f0', 'color-primary': '#ff6ad5', 'color-accent': '#00c2cb', 'color-primary-contrast': '#ffffff', 'font-display': "'Outfit', system-ui, sans-serif", 'radius': '16px', 'radius-lg': '26px', 'bg-image': 'radial-gradient(60% 50% at 0% 0%, rgba(255,106,213,.18), transparent), radial-gradient(50% 50% at 100% 0%, rgba(38,198,218,.18), transparent), #fbeffb' } },
  { id: 'blueprint', name: 'Blueprint', tag: 'Grid · technical', swatches: ['#7dd3fc', '#38bdf8', '#0b1d3a'], tokens: { 'color-bg': '#0b1d3a', 'color-surface': '#0f2748', 'color-surface-2': '#143257', 'color-text': '#b9d4f0', 'color-muted': '#7b9bc4', 'color-strong': '#eef6ff', 'color-border': '#1d3a64', 'color-primary': '#56b3f5', 'color-accent': '#7dd3fc', 'color-primary-contrast': '#06122a', 'font-display': "'Space Grotesk', system-ui, sans-serif", 'font-ui': mono, 'radius': '4px', 'radius-lg': '6px', 'bg-image': 'linear-gradient(rgba(125,211,252,.08) 1px, transparent 1px) 0 0/32px 32px, linear-gradient(90deg, rgba(125,211,252,.08) 1px, transparent 1px) 0 0/32px 32px, #0b1d3a' } },
  { id: 'matrix', name: 'Matrix', tag: 'Terminal · grid', swatches: ['#22c55e', '#86efac', '#04140a'], tokens: { 'color-bg': '#04140a', 'color-surface': '#08200f', 'color-surface-2': '#0c2a15', 'color-text': '#79d99a', 'color-muted': '#4f9468', 'color-strong': '#c9ffd9', 'color-border': '#143a22', 'color-primary': '#22c55e', 'color-accent': '#86efac', 'color-primary-contrast': '#04140a', 'font-display': mono, 'font-ui': mono, 'font-mono': mono, 'radius': '3px', 'radius-lg': '5px', 'bg-image': 'linear-gradient(rgba(34,197,94,.06) 1px, transparent 1px) 0 0/24px 24px, #04140a' } },
  { id: 'gold-noir', name: 'Gold Noir', tag: 'Luxe · glow', swatches: ['#e8c879', '#b8923a', '#0a0a0a'], tokens: { 'color-bg': '#0a0a0a', 'color-surface': '#141210', 'color-surface-2': '#1e1a14', 'color-text': '#cfc4ad', 'color-muted': '#8f836a', 'color-strong': '#f7efdc', 'color-border': '#2a2418', 'color-primary': '#e8c879', 'color-accent': '#b8923a', 'color-primary-contrast': '#0a0a0a', 'font-display': "'Playfair Display', Georgia, serif", 'scale': '1.414', 'radius': '2px', 'radius-lg': '4px', 'weight-heading': '600', 'shadow-lg': '0 18px 50px rgba(232,200,121,.18)' } },
  { id: 'holographic', name: 'Holographic', tag: 'Iridescent · light', swatches: ['#6366f1', '#ec4899', '#fafaff'], tokens: { 'color-bg': '#fafaff', 'color-surface': '#ffffff', 'color-surface-2': '#f0f0fb', 'color-text': '#3a3a52', 'color-muted': '#7a7a96', 'color-strong': '#16162a', 'color-border': '#e8e8f6', 'color-primary': '#6366f1', 'color-accent': '#ec4899', 'color-primary-contrast': '#ffffff', 'font-display': "'Bricolage Grotesque', system-ui, sans-serif", 'radius': '14px', 'radius-lg': '22px', 'bg-image': 'conic-gradient(from 180deg at 50% 30%, rgba(99,102,241,.08), rgba(236,72,153,.08), rgba(34,211,238,.08), rgba(99,102,241,.08)), #fafaff' } },
  { id: 'dracula', name: 'Dracula', tag: 'Dev · dark', swatches: ['#bd93f9', '#ff79c6', '#282a36'], tokens: { 'color-bg': '#282a36', 'color-surface': '#2d3040', 'color-surface-2': '#383b4d', 'color-text': '#c8cce0', 'color-muted': '#8b8fa8', 'color-strong': '#f8f8f2', 'color-border': '#3c3f52', 'color-primary': '#bd93f9', 'color-accent': '#ff79c6', 'color-primary-contrast': '#1a1b24', 'color-success': '#50fa7b', 'color-warning': '#f1fa8c', 'color-danger': '#ff5555', 'font-display': "'Inter', system-ui, sans-serif", 'font-mono': mono, 'radius': '8px', 'radius-lg': '12px' } },
  { id: 'nord', name: 'Nord', tag: 'Dev · arctic', swatches: ['#88c0d0', '#81a1c1', '#2e3440'], tokens: { 'color-bg': '#2e3440', 'color-surface': '#3b4252', 'color-surface-2': '#434c5e', 'color-text': '#d8dee9', 'color-muted': '#9aa4b8', 'color-strong': '#eceff4', 'color-border': '#434c5e', 'color-primary': '#88c0d0', 'color-accent': '#81a1c1', 'color-primary-contrast': '#2e3440', 'color-success': '#a3be8c', 'color-warning': '#ebcb8b', 'color-danger': '#bf616a', 'font-display': "'Inter', system-ui, sans-serif", 'radius': '8px', 'radius-lg': '12px' } },
  { id: 'gruvbox', name: 'Gruvbox', tag: 'Dev · retro', swatches: ['#fabd2f', '#fe8019', '#282828'], tokens: { 'color-bg': '#282828', 'color-surface': '#32302f', 'color-surface-2': '#3c3836', 'color-text': '#d5c4a1', 'color-muted': '#a89984', 'color-strong': '#fbf1c7', 'color-border': '#504945', 'color-primary': '#fabd2f', 'color-accent': '#fe8019', 'color-primary-contrast': '#282828', 'color-success': '#b8bb26', 'color-warning': '#fabd2f', 'color-danger': '#fb4934', 'font-display': "'Archivo', system-ui, sans-serif", 'font-mono': mono, 'radius': '4px', 'radius-lg': '8px' } },
  { id: 'rose-pine', name: 'Rosé Pine', tag: 'Dev · cosy', swatches: ['#ebbcba', '#c4a7e7', '#191724'], tokens: { 'color-bg': '#191724', 'color-surface': '#1f1d2e', 'color-surface-2': '#26233a', 'color-text': '#e0def4', 'color-muted': '#908caa', 'color-strong': '#f4f2ff', 'color-border': '#2a2740', 'color-primary': '#ebbcba', 'color-accent': '#c4a7e7', 'color-primary-contrast': '#191724', 'color-success': '#9ccfd8', 'color-warning': '#f6c177', 'color-danger': '#eb6f92', 'font-display': "'Fraunces', Georgia, serif", 'scale': '1.333', 'radius': '10px', 'radius-lg': '16px', 'weight-heading': '600' } },
  { id: 'solarized-dark', name: 'Solarized Dark', tag: 'Dev · classic', swatches: ['#268bd2', '#2aa198', '#002b36'], tokens: { 'color-bg': '#002b36', 'color-surface': '#073642', 'color-surface-2': '#0a4a5a', 'color-text': '#93a1a1', 'color-muted': '#657b83', 'color-strong': '#fdf6e3', 'color-border': '#0a4a5a', 'color-primary': '#268bd2', 'color-accent': '#2aa198', 'color-primary-contrast': '#fdf6e3', 'color-warning': '#b58900', 'color-danger': '#dc322f', 'font-display': "'IBM Plex Sans', system-ui, sans-serif", 'font-mono': "'IBM Plex Mono', monospace", 'radius': '5px', 'radius-lg': '9px' } },
  { id: 'solarized-light', name: 'Solarized Light', tag: 'Dev · classic', swatches: ['#268bd2', '#d33682', '#fdf6e3'], tokens: { 'color-bg': '#fdf6e3', 'color-surface': '#eee8d5', 'color-surface-2': '#e3ddc8', 'color-text': '#586e75', 'color-muted': '#93a1a1', 'color-strong': '#073642', 'color-border': '#ddd6c1', 'color-primary': '#268bd2', 'color-accent': '#d33682', 'color-primary-contrast': '#ffffff', 'color-warning': '#b58900', 'color-danger': '#dc322f', 'font-display': "'IBM Plex Sans', system-ui, sans-serif", 'font-mono': "'IBM Plex Mono', monospace", 'radius': '5px', 'radius-lg': '9px' } },
  { id: 'sunset-mesh', name: 'Sunset Mesh', tag: 'Mesh · warm', swatches: ['#fb7185', '#fbbf24', '#1a0f1e'], tokens: { 'color-bg': '#160b18', 'color-surface': 'rgba(255,255,255,.045)', 'color-surface-2': 'rgba(255,255,255,.08)', 'color-text': '#e0c8d0', 'color-muted': '#a3838f', 'color-strong': '#fff2f0', 'color-border': 'rgba(255,255,255,.1)', 'color-primary': '#fb7185', 'color-accent': '#fbbf24', 'color-primary-contrast': '#160b18', 'font-display': "'Outfit', system-ui, sans-serif", 'radius': '16px', 'radius-lg': '24px', 'shadow-lg': '0 18px 60px rgba(251,113,133,.3)', 'bg-image': 'radial-gradient(50% 45% at 15% 10%, rgba(251,113,133,.4), transparent), radial-gradient(45% 45% at 90% 15%, rgba(251,191,36,.3), transparent), radial-gradient(60% 50% at 50% 100%, rgba(168,85,247,.22), transparent), #160b18' } },
  { id: 'mono-zen', name: 'Mono Zen', tag: 'Monochrome · calm', swatches: ['#111111', '#737373', '#fbfbfa'], tokens: { 'color-bg': '#fbfbfa', 'color-surface': '#f4f4f2', 'color-surface-2': '#eaeae7', 'color-text': '#3a3a38', 'color-muted': '#8a8a86', 'color-strong': '#0c0c0b', 'color-border': '#e6e6e2', 'color-primary': '#1a1a18', 'color-accent': '#737373', 'color-primary-contrast': '#fbfbfa', 'font-display': "'Newsreader', Georgia, serif", 'scale': '1.414', 'leading': '1.7', 'radius': '3px', 'radius-lg': '6px', 'weight-heading': '500' } },
];
THEME_PRESETS.push(...COOL);

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
      { key: 'text-base', label: 'Base size', type: 'range', min: 12, max: 24, step: 1, unit: 'px' },
      { key: 'scale', label: 'Scale', type: 'select', options: ['1.2', '1.25', '1.333', '1.414', '1.5'] },
      { key: 'leading', label: 'Line height', type: 'range', min: 1, max: 2, step: 0.05, unit: '' },
    ],
  },
  {
    group: 'Shape', fields: [
      { key: 'radius', label: 'Radius', type: 'range', min: 0, max: 40, step: 1, unit: 'px' },
      { key: 'radius-lg', label: 'Radius lg', type: 'range', min: 0, max: 64, step: 1, unit: 'px' },
      { key: 'container', label: 'Container', type: 'range', min: 720, max: 1680, step: 20, unit: 'px' },
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
