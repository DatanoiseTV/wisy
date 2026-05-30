/* ============================================================
   Theme editor — presets + live token editing. Anchored popover
   that STAYS OPEN while you experiment (build-once + in-place
   sync; clicks inside never bubble to the outside-close handler).
   ============================================================ */
import { store } from './state.js';
import { THEME_PRESETS, TOKEN_SCHEMA, DEFAULT_TOKENS, FONT_OPTIONS } from './themes.js';
import { generateFromSeed, hexToOklch, oklchHex, contrastRatio, grade, HARMONIES } from './color.js';

let pop, btn, open = false;
let updaters = [];     // in-place field refreshers
let presetEls = [];    // preset card elements for highlight
let gen = { seed: '#5b8cff', vibrancy: 1, harmony: 'complementary', mode: 'light', contrast: 1 };
let genUpdaters = [];

export function initThemeEditor() {
  btn = document.getElementById('btn-theme');
  pop = document.createElement('div');
  pop.className = 'theme-pop';
  pop.hidden = true;
  document.body.append(pop);
  // keep all interaction inside the popover from triggering the outside-close
  pop.addEventListener('pointerdown', (e) => e.stopPropagation());
  pop.addEventListener('click', (e) => e.stopPropagation());
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  document.addEventListener('click', () => { if (open) close(); });
  document.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') close(); });
  store.on('theme:change', () => { if (open) syncAll(); });
}

function toggle() { open ? close() : show(); }
function close() { open = false; pop.hidden = true; }
function show() {
  open = true; pop.hidden = false;
  const r = btn.getBoundingClientRect();
  pop.style.top = (r.bottom + 8) + 'px';
  pop.style.left = Math.min(r.left, window.innerWidth - 316) + 'px';
  build();
}

function curTok(key) { return (store.doc.themeTokens?.[key]) ?? DEFAULT_TOKENS[key]; }
function setTok(key, v) { store.setTheme({ [key]: v }); store.emit('render'); syncPresetHighlight(); }
function applyPreset(p) {
  store.transaction(() => { store.doc.themeId = p.id; store.doc.themeTokens = { ...p.tokens }; });
  store.emit('theme:change'); store.emit('render');
  syncAll();
}

function initGenFromTokens() {
  const prim = curTok('color-primary');
  if (/^#[0-9a-f]{6}$/i.test(prim)) gen.seed = prim;
  const bg = curTok('color-bg');
  try { const [L] = hexToOklch(bg); gen.mode = L < 0.5 ? 'dark' : 'light'; } catch { /* */ }
}

function applyGen(commit) {
  // generator changes ONLY color-* tokens; the active preset's typography/shape stay intact
  const tokens = generateFromSeed(gen);
  store.doc.themeTokens = { ...store.doc.themeTokens, ...tokens };
  store.emit('theme:change');   // canvas updates CSS vars (smooth morph)
  store.emit('persist');
  if (commit) store.transaction(() => {}, { rerender: false }); // one history entry on release
  syncAll();
}

function build() {
  updaters = []; presetEls = []; genUpdaters = [];
  initGenFromTokens();
  pop.innerHTML = `<div class="theme-pop__head">Theme <span class="theme-pop__hint">live · stays open</span></div><div class="theme-pop__body"></div>`;
  const body = pop.querySelector('.theme-pop__body');

  buildGenerator(body);

  body.append(labelEl(`Presets · ${THEME_PRESETS.length}`));
  const presets = document.createElement('div'); presets.className = 'theme-presets';
  THEME_PRESETS.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'theme-preset' + (store.doc.themeId === p.id ? ' is-active' : '');
    el.dataset.id = p.id;
    el.innerHTML = `<div class="theme-preset__sw">${p.swatches.map((c) => `<span style="background:${c}"></span>`).join('')}</div><div class="theme-preset__name">${p.name}</div>`;
    el.onclick = () => applyPreset(p);
    presets.append(el); presetEls.push(el);
  });
  body.append(presets);

  TOKEN_SCHEMA.forEach((grp) => {
    body.append(labelEl(grp.group));
    const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px';
    grp.fields.forEach((f) => wrap.append(tokenField(f)));
    body.append(wrap);
  });
}
function labelEl(t) { const d = document.createElement('div'); d.style.cssText = 'font-size:10.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--txt-3);margin-top:4px'; d.textContent = t; return d; }

function syncPresetHighlight() { presetEls.forEach((el) => el.classList.toggle('is-active', el.dataset.id === store.doc.themeId)); }
function syncAll() { updaters.forEach((fn) => fn()); genUpdaters.forEach((fn) => fn()); syncPresetHighlight(); }

/* ---- parametric palette generator ---- */
function buildGenerator(body) {
  const wrap = document.createElement('div'); wrap.className = 'gen';
  wrap.innerHTML = `<div class="gen__head"><span>Palette generator</span>
    <button class="gen__shuffle" title="Shuffle"><svg viewBox="0 0 24 24" class="ic" style="width:14px;height:14px"><path d="M16 3h5v5M4 20l16-16M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg> Shuffle</button></div>`;
  const grid = document.createElement('div'); grid.className = 'gen__grid';

  // mode segmented
  const modeRow = document.createElement('div'); modeRow.style.cssText = 'display:flex;gap:6px;grid-column:1/-1';
  const seg = document.createElement('div'); seg.className = 'seg'; seg.style.flex = '1';
  ['light', 'dark'].forEach((m) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = m[0].toUpperCase() + m.slice(1);
    if (gen.mode === m) b.classList.add('is-active');
    b.onclick = () => { seg.querySelectorAll('button').forEach((x) => x.classList.remove('is-active')); b.classList.add('is-active'); gen.mode = m; applyGen(true); };
    seg.append(b);
  });
  modeRow.append(seg);
  const harmony = document.createElement('select'); harmony.className = 'ctl'; harmony.style.flex = '1';
  Object.keys(HARMONIES).forEach((h) => { const o = document.createElement('option'); o.value = h; o.textContent = h.replace('-', ' '); harmony.append(o); });
  harmony.value = gen.harmony; harmony.onchange = () => { gen.harmony = harmony.value; applyGen(true); };
  modeRow.append(harmony);
  grid.append(modeRow);

  // seed (brand) color — the designer-standard starting point
  const seedRow = document.createElement('div'); seedRow.className = 'gen__field'; seedRow.style.gridColumn = '1/-1';
  seedRow.innerHTML = '<div class="gen__flabel"><span>Brand color (seed)</span></div>';
  const sc = document.createElement('div'); sc.className = 'color-ctl';
  const sw = document.createElement('div'); sw.className = 'color-swatch';
  const fill = document.createElement('div'); fill.className = 'color-swatch__fill'; fill.style.background = gen.seed;
  const picker = document.createElement('input'); picker.type = 'color'; picker.value = /^#[0-9a-f]{6}$/i.test(gen.seed) ? gen.seed : '#5b8cff';
  const txt = document.createElement('input'); txt.className = 'ctl'; txt.value = gen.seed;
  picker.addEventListener('input', () => { gen.seed = picker.value; txt.value = picker.value; fill.style.background = picker.value; applyGen(false); });
  picker.addEventListener('change', () => applyGen(true));
  txt.addEventListener('input', () => { gen.seed = txt.value; fill.style.background = txt.value; if (/^#[0-9a-f]{6}$/i.test(txt.value)) picker.value = txt.value; applyGen(true); });
  sw.append(fill, picker); sc.append(sw, txt); seedRow.append(sc);
  genUpdaters.push(() => { fill.style.background = gen.seed; txt.value = gen.seed; if (/^#[0-9a-f]{6}$/i.test(gen.seed)) picker.value = gen.seed; });
  grid.append(seedRow);

  grid.append(genSlider('Vibrancy', 'vibrancy', 0, 1.6, 0.02));
  grid.append(genSlider('Contrast', 'contrast', 0.8, 1.3, 0.01));

  // contrast badge
  const badge = document.createElement('div'); badge.className = 'gen__badge';
  const refreshBadge = () => {
    const tk = store.doc.themeTokens || {};
    const r = (a, b) => { try { return contrastRatio(tk[a] || DEFAULT_TOKENS[a], tk[b] || DEFAULT_TOKENS[b]); } catch { return 0; } };
    const rt = r('color-text', 'color-bg'), rp = r('color-primary-contrast', 'color-primary');
    badge.innerHTML = `<span>Text/BG <b>${rt.toFixed(1)}</b> <i class="g-${grade(rt) === 'low' ? 'lo' : 'ok'}">${grade(rt)}</i></span><span>Button <b>${rp.toFixed(1)}</b> <i class="g-${grade(rp) === 'low' ? 'lo' : 'ok'}">${grade(rp)}</i></span>`;
  };
  genUpdaters.push(refreshBadge);
  grid.append(badge);

  wrap.append(grid);
  wrap.querySelector('.gen__shuffle').onclick = () => {
    const hue = Math.floor(Math.random() * 360);
    const harmonies = Object.keys(HARMONIES);
    gen.seed = oklchHex(gen.mode === 'dark' ? 0.68 : 0.6, 0.13 + Math.random() * 0.1, hue);
    gen.harmony = harmonies[Math.floor(Math.random() * harmonies.length)];
    gen.vibrancy = 0.85 + Math.random() * 0.5;
    applyGen(true); rebuildGen();
  };
  body.append(wrap);
  requestAnimationFrame(refreshBadge);
}
function rebuildGen() { build(); } // simplest: rebuild popover to reflect shuffled values

function genSlider(label, key, min, max, step, hue) {
  const row = document.createElement('div'); row.className = 'gen__field';
  const head = document.createElement('div'); head.className = 'gen__flabel';
  const val = document.createElement('span');
  head.innerHTML = `<span>${label}</span>`; head.append(val);
  const input = document.createElement('input'); input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = gen[key];
  input.className = 'gen__range' + (hue ? ' gen__range--hue' : '');
  const fmt = () => { val.textContent = step < 1 ? (+gen[key]).toFixed(2) : Math.round(gen[key]); };
  input.addEventListener('input', () => { gen[key] = +input.value; fmt(); applyGen(false); });
  input.addEventListener('change', () => { gen[key] = +input.value; fmt(); applyGen(true); });
  genUpdaters.push(() => { input.value = gen[key]; fmt(); });
  fmt();
  row.append(head, input);
  return row;
}

function tokenField(f) {
  const row = document.createElement('div'); row.style.cssText = 'display:grid;grid-template-columns:74px 1fr;align-items:center;gap:8px';
  const l = document.createElement('label'); l.textContent = f.label; l.style.cssText = 'font-size:11.5px;color:var(--txt-2)';
  let ctl;
  if (f.type === 'color') {
    ctl = document.createElement('div'); ctl.className = 'color-ctl';
    const sw = document.createElement('div'); sw.className = 'color-swatch';
    const fill = document.createElement('div'); fill.className = 'color-swatch__fill'; fill.style.background = curTok(f.key);
    const picker = document.createElement('input'); picker.type = 'color'; picker.value = hex(curTok(f.key));
    const txt = document.createElement('input'); txt.className = 'ctl'; txt.value = curTok(f.key);
    picker.addEventListener('input', () => { txt.value = picker.value; fill.style.background = picker.value; setTok(f.key, picker.value); });
    txt.addEventListener('change', () => { fill.style.background = txt.value; const h = hex(txt.value); if (h) picker.value = h; setTok(f.key, txt.value); });
    sw.append(fill, picker); ctl.append(sw, txt);
    updaters.push(() => { const v = curTok(f.key); fill.style.background = v; txt.value = v; picker.value = hex(v); });
  } else if (f.type === 'select') {
    ctl = document.createElement('select'); ctl.className = 'ctl';
    f.options.forEach((o) => { const op = document.createElement('option'); op.value = o; op.textContent = o; ctl.append(op); });
    ctl.value = curTok(f.key); ctl.addEventListener('change', () => setTok(f.key, ctl.value));
    updaters.push(() => { ctl.value = curTok(f.key); });
  } else if (f.type === 'font') {
    ctl = document.createElement('select'); ctl.className = 'ctl';
    FONT_OPTIONS.forEach((o) => { const op = document.createElement('option'); op.value = `'${o}', sans-serif`; op.textContent = o; ctl.append(op); });
    ctl.value = curTok(f.key); ctl.addEventListener('change', () => setTok(f.key, ctl.value));
    updaters.push(() => { ctl.value = curTok(f.key); });
  } else {
    ctl = document.createElement('input'); ctl.className = 'ctl'; ctl.value = curTok(f.key);
    ctl.addEventListener('change', () => setTok(f.key, ctl.value));
    updaters.push(() => { ctl.value = curTok(f.key); });
  }
  row.append(l, ctl);
  return row;
}
function hex(v) { return /^#([0-9a-f]{6})$/i.test(v) ? v : (/^#([0-9a-f]{3})$/i.test(v) ? '#' + v.slice(1).split('').map((c) => c + c).join('') : '#5b8cff'); }
