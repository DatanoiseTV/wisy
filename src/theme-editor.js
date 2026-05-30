/* ============================================================
   Theme editor — presets + live token editing. Anchored popover.
   ============================================================ */
import { store } from './state.js';
import { THEME_PRESETS, TOKEN_SCHEMA, DEFAULT_TOKENS, FONT_OPTIONS } from './themes.js';

let pop, btn, open = false;

export function initThemeEditor() {
  btn = document.getElementById('btn-theme');
  pop = document.createElement('div');
  pop.className = 'theme-pop';
  pop.hidden = true;
  document.body.append(pop);
  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  document.addEventListener('click', (e) => { if (open && !pop.contains(e.target) && e.target !== btn) close(); });
  store.on('theme:change', () => { if (open) renderBody(); });
}

function toggle() { open ? close() : show(); }
function close() { open = false; pop.hidden = true; }
function show() {
  open = true; pop.hidden = false;
  const r = btn.getBoundingClientRect();
  pop.style.top = (r.bottom + 8) + 'px';
  pop.style.left = Math.min(r.left, window.innerWidth - 320) + 'px';
  renderBody();
}

function renderBody() {
  pop.innerHTML = `<div class="theme-pop__head">Theme</div><div class="theme-pop__body"></div>`;
  const body = pop.querySelector('.theme-pop__body');

  // presets
  const presets = document.createElement('div'); presets.className = 'theme-presets';
  THEME_PRESETS.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'theme-preset' + (store.doc.themeId === p.id ? ' is-active' : '');
    el.innerHTML = `<div class="theme-preset__sw">${p.swatches.map((c) => `<span style="background:${c}"></span>`).join('')}</div><div class="theme-preset__name">${p.name}</div>`;
    el.onclick = () => {
      store.transaction(() => { store.doc.themeId = p.id; store.doc.themeTokens = { ...p.tokens }; });
      store.emit('theme:change'); store.emit('render');
      renderBody();
    };
    presets.append(el);
  });
  body.append(labelEl('Presets'), presets);

  // token fields
  TOKEN_SCHEMA.forEach((grp) => {
    body.append(labelEl(grp.group));
    const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px';
    grp.fields.forEach((f) => wrap.append(tokenField(f)));
    body.append(wrap);
  });
}
function labelEl(t) { const d = document.createElement('div'); d.style.cssText = 'font-size:10.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--txt-3);margin-top:4px'; d.textContent = t; return d; }

function curTok(key) { return (store.doc.themeTokens?.[key]) ?? DEFAULT_TOKENS[key]; }
function setTok(key, v) { store.setTheme({ [key]: v }); store.emit('render'); }

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
  } else if (f.type === 'select') {
    ctl = document.createElement('select'); ctl.className = 'ctl';
    f.options.forEach((o) => { const op = document.createElement('option'); op.value = o; op.textContent = o; ctl.append(op); });
    ctl.value = curTok(f.key); ctl.addEventListener('change', () => setTok(f.key, ctl.value));
  } else if (f.type === 'font') {
    ctl = document.createElement('select'); ctl.className = 'ctl';
    FONT_OPTIONS.forEach((o) => { const op = document.createElement('option'); op.value = `'${o}', sans-serif`; op.textContent = o; ctl.append(op); });
    ctl.value = curTok(f.key); ctl.addEventListener('change', () => setTok(f.key, ctl.value));
  } else {
    ctl = document.createElement('input'); ctl.className = 'ctl'; ctl.value = curTok(f.key);
    ctl.addEventListener('change', () => setTok(f.key, ctl.value));
  }
  row.append(l, ctl);
  return row;
}
function hex(v) { return /^#([0-9a-f]{6})$/i.test(v) ? v : (/^#([0-9a-f]{3})$/i.test(v) ? '#' + v.slice(1).split('').map((c) => c + c).join('') : '#5b8cff'); }
