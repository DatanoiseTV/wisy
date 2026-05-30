/* ============================================================
   Wisy Start Wizard — an optional, friendly, parametric setup.
   3 quick steps (purpose → template, vibe → typography/shape,
   brand color → live OKLCH palette) with a LIVE preview that
   updates as you choose. Nothing here is required; skip anytime.
   ============================================================ */
import { store, uid } from './state.js';
import { TEMPLATES, applyTemplate } from './templates.js';
import { THEME_PRESETS, DEFAULT_TOKENS } from './themes.js';
import { generateFromSeed } from './color.js';
import { buildPageHtml, getAssets } from './export.js';

const PURPOSE = [
  { id: 'saas', label: 'Website / Landing', tpl: 'saas', sub: 'Marketing site', icon: 'M3 9h18M3 5h18M3 13h12M3 17h8' },
  { id: 'dashboard', label: 'Web app / Dashboard', tpl: 'dashboard', sub: 'Product UI', icon: 'M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z' },
  { id: 'mobile', label: 'Mobile app', tpl: 'mobile', sub: 'App screen', icon: 'M7 3h10v18H7zM11 18h2' },
  { id: 'shop', label: 'Online store', tpl: 'shop', sub: 'E-commerce', icon: 'M3 6h18l-2 11H5zM3 6 2 3M9 21h.01M17 21h.01' },
  { id: 'blog', label: 'Blog / Content', tpl: 'blog', sub: 'Articles', icon: 'M4 5h16M4 10h16M4 15h10' },
  { id: 'portfolio', label: 'Portfolio', tpl: 'portfolio', sub: 'Showcase', icon: 'M3 4h18v14H3zM8 21h8M3 9h18' },
  { id: 'plugin', label: 'Audio plugin UI', tpl: 'plugin', sub: 'Plugin / device', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v4' },
  { id: 'event', label: 'Event / Conference', tpl: 'event', sub: 'Tickets & schedule', icon: 'M3 5h18v16H3zM8 2v4M16 2v4M3 10h18' },
  { id: 'blank', label: 'Start blank', tpl: 'blank', sub: 'From scratch', icon: 'M12 5v14M5 12h14' },
];
const VIBE = [
  { id: 'minimal', label: 'Minimal', theme: 'studio', sub: 'Clean, neutral, calm' },
  { id: 'bold', label: 'Bold', theme: 'noir', sub: 'High contrast, confident' },
  { id: 'elegant', label: 'Elegant', theme: 'editorial', sub: 'Serif, refined' },
  { id: 'playful', label: 'Playful', theme: 'aurora', sub: 'Vivid, rounded' },
  { id: 'techy', label: 'Techy', theme: 'cobalt', sub: 'Dark, precise' },
  { id: 'warm', label: 'Warm', theme: 'warm', sub: 'Friendly, soft' },
];
const HARMONY_BY_VIBE = { minimal: 'monochrome', bold: 'complementary', elegant: 'analogous', playful: 'triadic', techy: 'complementary', warm: 'analogous' };

let layer, state, assetsCache, previewTimer;

export function initWizard() {
  const btn = document.getElementById('btn-wizard');
  if (btn) btn.addEventListener('click', () => openWizard());
  // auto-open on first ever run
  try { if (!localStorage.getItem('wisy.wizard.seen')) setTimeout(() => openWizard(true), 400); } catch { /* */ }
}

export function openWizard(first) {
  state = { step: 0, purpose: 'saas', vibe: 'minimal', seed: '#5b8cff', mode: 'light', first: !!first };
  layer = document.createElement('div'); layer.className = 'wiz-layer';
  layer.innerHTML = `<div class="wiz-back"></div>
    <div class="wiz-card">
      <div class="wiz-main">
        <div class="wiz-head"><div class="wiz-brand"><svg viewBox="0 0 32 32" width="22" height="22"><rect width="32" height="32" rx="8" fill="var(--accent)"/><path d="M7 11l3 11 3-8 3 8 3-11" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Start with Wisy</span></div>
        <button class="wiz-skip">Skip</button></div>
        <div class="wiz-steps" id="wiz-dots"></div>
        <div class="wiz-body" id="wiz-body"></div>
        <div class="wiz-foot"><button class="btn btn--ghost wiz-back-btn">Back</button><button class="btn btn--primary wiz-next">Continue</button></div>
      </div>
      <div class="wiz-preview"><div class="wiz-preview__bar"><span></span><span></span><span></span><em id="wiz-pv-label">Live preview</em></div><iframe id="wiz-frame" title="Preview"></iframe></div>
    </div>`;
  document.body.append(layer);
  layer.querySelector('.wiz-back').onclick = close;
  layer.querySelector('.wiz-skip').onclick = close;
  layer.querySelector('.wiz-back-btn').onclick = () => { if (state.step > 0) { state.step--; paint(); } };
  layer.querySelector('.wiz-next').onclick = () => { if (state.step < 2) { state.step++; paint(); } else finish(); };
  document.addEventListener('keydown', escClose, true);
  getAssets().then((a) => { assetsCache = a; renderPreview(); });
  paint();
}
function escClose(e) { if (e.key === 'Escape') close(); }
function close() { try { localStorage.setItem('wisy.wizard.seen', '1'); } catch { /* */ } document.removeEventListener('keydown', escClose, true); layer?.remove(); layer = null; }

function paint() {
  const dots = layer.querySelector('#wiz-dots');
  dots.innerHTML = ['Purpose', 'Style', 'Brand'].map((s, i) => `<span class="wiz-dot${i === state.step ? ' is-active' : ''}${i < state.step ? ' is-done' : ''}">${s}</span>`).join('');
  const body = layer.querySelector('#wiz-body');
  layer.querySelector('.wiz-back-btn').style.visibility = state.step === 0 ? 'hidden' : 'visible';
  layer.querySelector('.wiz-next').textContent = state.step === 2 ? 'Create project' : 'Continue';
  if (state.step === 0) {
    body.innerHTML = `<h2 class="wiz-q">What are you building?</h2><div class="wiz-grid wiz-grid--3"></div>`;
    const g = body.querySelector('.wiz-grid');
    PURPOSE.forEach((p) => { const b = card(p.label, p.sub, p.icon, state.purpose === p.id); b.onclick = () => { state.purpose = p.id; paint(); renderPreview(); }; g.append(b); });
  } else if (state.step === 1) {
    body.innerHTML = `<h2 class="wiz-q">Pick a vibe</h2><p class="wiz-sub">Sets typography, shape and a starting palette — fully editable later.</p><div class="wiz-grid wiz-grid--2"></div>`;
    const g = body.querySelector('.wiz-grid');
    VIBE.forEach((v) => { const b = vibeCard(v, state.vibe === v.id); b.onclick = () => { state.vibe = v.id; const pr = THEME_PRESETS.find((x) => x.id === v.theme); if (pr && pr.swatches[0]?.startsWith('#')) state.seed = pr.swatches[0]; state.mode = isDarkPreset(v.theme) ? 'dark' : 'light'; paint(); renderPreview(); }; g.append(b); });
  } else {
    body.innerHTML = `<h2 class="wiz-q">Your brand color</h2><p class="wiz-sub">We build a balanced, accessible palette around it.</p>
      <div class="wiz-color"><label class="wiz-swatch"><input type="color" id="wiz-seed" value="${state.seed}"><span id="wiz-seedfill"></span></label><input class="ctl" id="wiz-seedhex" value="${state.seed}"></div>
      <div class="wiz-mode seg" id="wiz-mode"><button data-m="light"${state.mode === 'light' ? ' class="is-active"' : ''}>Light</button><button data-m="dark"${state.mode === 'dark' ? ' class="is-active"' : ''}>Dark</button></div>
      <div class="wiz-swatches" id="wiz-pal"></div>`;
    const fill = body.querySelector('#wiz-seedfill'); fill.style.background = state.seed;
    const picker = body.querySelector('#wiz-seed'); const hex = body.querySelector('#wiz-seedhex');
    picker.addEventListener('input', () => { state.seed = picker.value; hex.value = picker.value; fill.style.background = picker.value; paintPalette(); renderPreview(); });
    hex.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(hex.value)) { state.seed = hex.value; picker.value = hex.value; fill.style.background = hex.value; paintPalette(); renderPreview(); } });
    body.querySelectorAll('#wiz-mode button').forEach((b) => b.onclick = () => { state.mode = b.dataset.m; body.querySelectorAll('#wiz-mode button').forEach((x) => x.classList.toggle('is-active', x === b)); paintPalette(); renderPreview(); });
    paintPalette();
  }
}
function paintPalette() {
  const box = layer.querySelector('#wiz-pal'); if (!box) return;
  const t = previewTokens();
  box.innerHTML = ['color-bg', 'color-surface', 'color-strong', 'color-primary', 'color-accent', 'color-success', 'color-warning', 'color-danger'].map((k) => `<span style="background:${t[k]}" title="${k}"></span>`).join('');
}
function card(label, sub, iconPath, active) {
  const b = document.createElement('button'); b.className = 'wiz-card-opt' + (active ? ' is-active' : '');
  b.innerHTML = `<span class="wiz-card-opt__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${iconPath}"/></svg></span><span class="wiz-card-opt__t">${label}</span><span class="wiz-card-opt__s">${sub}</span>`;
  return b;
}
function vibeCard(v, active) {
  const pr = THEME_PRESETS.find((x) => x.id === v.theme) || { swatches: ['#5b8cff', '#10141b', '#f7f8fa'] };
  const b = document.createElement('button'); b.className = 'wiz-vibe' + (active ? ' is-active' : '');
  b.innerHTML = `<span class="wiz-vibe__sw">${pr.swatches.map((c) => `<i style="background:${c}"></i>`).join('')}</span><span class="wiz-vibe__t">${v.label}</span><span class="wiz-vibe__s">${v.sub}</span>`;
  return b;
}
function isDarkPreset(id) { const p = THEME_PRESETS.find((x) => x.id === id); if (!p) return false; const bg = p.tokens['color-bg'] || '#fff'; return parseInt(bg.slice(1, 3), 16) < 90; }
function previewTokens() {
  const pr = THEME_PRESETS.find((x) => x.id === (VIBE.find((v) => v.id === state.vibe) || {}).theme);
  const base = { ...(pr ? pr.tokens : {}) };
  const colors = generateFromSeed({ seed: state.seed, vibrancy: 1, harmony: HARMONY_BY_VIBE[state.vibe] || 'complementary', mode: state.mode, contrast: 1 });
  return { ...DEFAULT_TOKENS, ...base, ...colors };
}

function renderPreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    if (!layer || !assetsCache) return;
    const tpl = TEMPLATES.find((t) => t.id === (PURPOSE.find((p) => p.id === state.purpose) || {}).tpl) || TEMPLATES[0];
    const pr = THEME_PRESETS.find((x) => x.id === (VIBE.find((v) => v.id === state.vibe) || {}).theme);
    const tokens = { ...(pr ? pr.tokens : {}), ...generateFromSeed({ seed: state.seed, vibrancy: 1, harmony: HARMONY_BY_VIBE[state.vibe] || 'complementary', mode: state.mode, contrast: 1 }) };
    const page = { id: uid('p'), name: 'Home', path: 'index.html', root: tpl.build() };
    // build with a temporary theme without disturbing the real store
    const saved = store.doc.themeTokens;
    store.doc.themeTokens = tokens;
    let html; try { html = buildPageHtml(page, { single: true, widgetsCss: assetsCache.widgetsCss, widgetsJs: assetsCache.widgetsJs, chartsJs: assetsCache.chartsJs }); } finally { store.doc.themeTokens = saved; }
    const f = layer.querySelector('#wiz-frame'); if (f) f.srcdoc = html;
    const lbl = layer.querySelector('#wiz-pv-label'); if (lbl) lbl.textContent = (PURPOSE.find((p) => p.id === state.purpose) || {}).label;
  }, 120);
}

function finish() {
  const tpl = TEMPLATES.find((t) => t.id === (PURPOSE.find((p) => p.id === state.purpose) || {}).tpl) || TEMPLATES[0];
  const vibe = VIBE.find((v) => v.id === state.vibe);
  applyTemplate({ ...tpl, theme: vibe ? vibe.theme : tpl.theme });
  // overlay the user's brand palette on top of the vibe's typography/shape
  const colors = generateFromSeed({ seed: state.seed, vibrancy: 1, harmony: HARMONY_BY_VIBE[state.vibe] || 'complementary', mode: state.mode, contrast: 1 });
  store.setTheme(colors);
  store.emit('render');
  window.__wisyToast?.('Project created — make it yours', 'ok');
  close();
}
