/* ============================================================
   Inspector — parametric property + style editor.
   Component props come from the registry schema; style controls
   are generic and write to the active responsive breakpoint.
   ============================================================ */
import { store, effectiveStyle } from './state.js';
import { REG, icoSvg } from './registry.js';
import { FONT_OPTIONS } from './themes.js';
import { iconSVG } from './iconlib.js';
import { openIconPicker, openFontBrowser, openLinkPicker, openAssetPicker, openCropModal } from './pickers.js';
import { presetsFor } from './component-presets.js';

let host;
const collapsed = new Set();

export function initInspector() {
  host = document.getElementById('inspector');
  store.on('select', render);
  // don't rebuild the inspector while the user is typing in one of its fields
  // (that would clobber the caret); the canvas still live-updates.
  store.on('change', () => { if (store.selectedId && !host.contains(document.activeElement)) render(); });
  render();
}

function render() {
  const node = store.selected;
  if (!node) {
    host.innerHTML = `<div class="insp-empty">
      <svg viewBox="0 0 24 24" class="ic"><path d="M12 2l9 4.9v10.2L12 22l-9-4.9V6.9z"/><path d="M12 22V12M3 7l9 5 9-5"/></svg>
      <p>Select an element to edit its properties.</p>
      <p style="margin-top:14px;color:var(--txt-3);font-size:11.5px">Tip: double-click text on the canvas to edit it inline.</p>
    </div>`;
    return;
  }
  const def = REG[node.type];
  host.innerHTML = '';
  host.append(header(node, def));
  const presetStrip = stylePresets(node);
  if (presetStrip) host.append(presetStrip);

  // viewport scope hint
  if (store.viewport !== 'desktop') {
    const hint = document.createElement('div');
    hint.style.cssText = 'padding:8px 14px;font-size:11px;color:var(--warn);background:rgba(255,180,84,.08);border-bottom:1px solid var(--line-soft)';
    hint.innerHTML = `Editing <b>${store.viewport}</b> overrides. Desktop values shown as base.`;
    host.append(hint);
  }

  // component props
  if (def.props?.length) {
    host.append(section('Content', def.props.map((f) => propField(node, f))));
  }
  // image-specific framing
  if (node.type === 'image' || node.type === 'imageframe') host.append(section('Image', imageControls(node)));
  // style sections
  host.append(section('Layout', layoutControls(node, def)));
  host.append(section('Spacing', [spacingControl(node, 'padding'), spacingControl(node, 'margin')]));
  host.append(section('Size', sizeControls(node)));
  host.append(section('Typography', typoControls(node)));
  host.append(section('Background & Border', bgControls(node)));
  host.append(section('Effects', effectControls(node)));
  host.append(section('Animation', animControls(node)));
}

/* ---------- style presets strip ---------- */
const camelToKebab = (k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
function stylePresets(node) {
  let list = presetsFor(node.type);
  if (!list.length && node.type === 'input') list = presetsFor('wc-input');
  if (!list || !list.length) return null;
  const sec = document.createElement('div');
  sec.className = 'insp-presets';
  sec.innerHTML = '<div class="insp-presets__label">Styles</div>';
  const strip = document.createElement('div'); strip.className = 'insp-presets__strip';
  list.forEach((p) => {
    const chip = document.createElement('button'); chip.type = 'button'; chip.className = 'preset-chip'; chip.textContent = p.name; chip.title = p.name;
    chip.onclick = () => {
      const style = {}; for (const k in (p.style || {})) style[camelToKebab(k)] = p.style[k];
      store.transaction(() => {
        const r = store.findNode(node.id); if (!r) return;
        Object.assign(r.node.style.base, style);
        if (p.props) Object.assign(r.node.props, p.props);
      });
      window.__wisyToast?.(`Applied “${p.name}”`, 'ok');
    };
    strip.append(chip);
  });
  sec.append(strip);
  return sec;
}

/* ---------- header ---------- */
function header(node, def) {
  const el = document.createElement('div');
  el.className = 'insp-head';
  el.innerHTML = `<div class="insp-head__ic">${icoSvg(def.icon)}</div>
    <div class="insp-head__meta">
      <div class="insp-head__type">${def.label}</div>
      <input class="insp-head__name" value="${node.name || ''}" placeholder="${def.label}" />
    </div>`;
  const name = el.querySelector('.insp-head__name');
  Object.assign(name.style, { background: 'transparent', border: '1px solid transparent', color: 'var(--txt-3)', fontSize: '11px', fontFamily: 'var(--mono)', padding: '2px 4px', borderRadius: '4px', width: '100%', outline: 'none' });
  name.addEventListener('focus', () => { name.style.background = 'var(--bg-2)'; name.style.borderColor = 'var(--accent-line)'; });
  name.addEventListener('blur', () => { name.style.background = 'transparent'; name.style.borderColor = 'transparent'; store.rename(node.id, name.value); });

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:2px';
  actions.append(
    iconBtn('Duplicate', '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', () => store.duplicate(node.id)),
    iconBtn('Move up', '<path d="M12 19V5M5 12l7-7 7 7"/>', () => store.reorder(node.id, -1)),
    iconBtn('Move down', '<path d="M12 5v14M5 12l7 7 7-7"/>', () => store.reorder(node.id, 1)),
  );
  const del = iconBtn('Delete', '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', () => store.remove(node.id));
  del.classList.add('insp-head__del');
  actions.append(del);
  el.append(actions);
  return el;
}
function iconBtn(title, path, onClick) {
  const b = document.createElement('button');
  b.title = title;
  b.style.cssText = 'background:transparent;border:0;padding:6px;border-radius:6px;color:var(--txt-3)';
  b.innerHTML = `<svg viewBox="0 0 24 24" class="ic" style="width:16px;height:16px">${path}</svg>`;
  b.onmouseenter = () => { b.style.background = 'var(--bg-3)'; b.style.color = 'var(--txt-0)'; };
  b.onmouseleave = () => { b.style.background = 'transparent'; b.style.color = 'var(--txt-3)'; };
  b.onclick = onClick;
  return b;
}

/* ---------- section wrapper ---------- */
function section(title, fields) {
  fields = fields.filter(Boolean);
  const sec = document.createElement('div');
  sec.className = 'insp-section' + (collapsed.has(title) ? ' collapsed' : '');
  const head = document.createElement('div');
  head.className = 'insp-section__head';
  head.innerHTML = `<span class="insp-section__title">${title}</span>
    <svg viewBox="0 0 24 24" class="ic insp-section__caret" style="width:14px;height:14px"><path d="M6 9l6 6 6-6"/></svg>`;
  head.onclick = () => { sec.classList.toggle('collapsed'); if (collapsed.has(title)) collapsed.delete(title); else collapsed.add(title); };
  const body = document.createElement('div');
  body.className = 'insp-section__body';
  fields.forEach((f) => body.append(f));
  sec.append(head, body);
  return sec;
}

/* ---------- field row ---------- */
function field(label, control, stack = false) {
  const row = document.createElement('div');
  row.className = 'field' + (stack ? ' field--stack' : '');
  const l = document.createElement('label'); l.className = 'field__label'; l.textContent = label;
  const c = document.createElement('div'); c.className = 'field__control'; c.append(control);
  row.append(l, c);
  return row;
}

/* ---------- prop controls ---------- */
function propField(node, f) {
  const get = () => node.props[f.key];
  const set = (v, soft) => store.updateProps(node.id, { [f.key]: v }, soft ? { soft: true } : {});
  const ctl = buildControl(f, get, set);
  const stack = f.type === 'textarea' || f.type === 'list' || f.type === 'asset';
  return field(f.label, ctl, stack);
}

/* ---------- generic control factory ---------- */
function buildControl(f, get, set, opts = {}) {
  switch (f.type) {
    case 'textarea': return textareaCtl(get, set);
    case 'number': return numberCtl(get, set);
    case 'color': return colorCtl(get, set, opts.placeholder);
    case 'range': return rangeCtl(get, set, f);
    case 'bool': return boolCtl(get, set);
    case 'select': return selectCtl(get, set, f.options);
    case 'font': return selectCtl(get, set, FONT_OPTIONS.map((x) => `'${x}', sans-serif`), FONT_OPTIONS);
    case 'seg': return segCtl(get, set, f.options, f.icons);
    case 'list': return listCtl(f, get, set);
    case 'dim': return dimCtl(get, set, f);
    case 'iconpick': return iconPickCtl(get, set);
    case 'fontpick': return fontPickCtl(get, set);
    case 'link': return linkCtl(get, set);
    case 'asset': return assetCtl(get, set);
    default: return textCtl(get, set, opts.placeholder);
  }
}
function textCtl(get, set, ph) {
  const i = document.createElement('input'); i.className = 'ctl'; i.type = 'text'; i.value = get() ?? ''; if (ph) i.placeholder = ph;
  i.addEventListener('input', () => set(i.value, true));   // live
  i.addEventListener('change', () => set(i.value));         // commit (history)
  return i;
}
function textareaCtl(get, set) {
  const t = document.createElement('textarea'); t.className = 'ctl'; t.value = get() ?? '';
  t.addEventListener('input', () => set(t.value, true));
  t.addEventListener('change', () => set(t.value));
  return t;
}
function numberCtl(get, set) {
  const i = document.createElement('input'); i.className = 'ctl'; i.type = 'number'; i.value = get() ?? '';
  i.addEventListener('input', () => set(i.value === '' ? '' : +i.value, true));
  i.addEventListener('change', () => set(i.value === '' ? '' : +i.value));
  return i;
}
function selectCtl(get, set, options, labels) {
  const s = document.createElement('select'); s.className = 'ctl';
  options.forEach((o, i) => { const op = document.createElement('option'); op.value = o; op.textContent = (labels ? labels[i] : o); s.append(op); });
  s.value = get() ?? options[0];
  s.addEventListener('change', () => set(s.value));
  return s;
}
function boolCtl(get, set) {
  const wrap = document.createElement('label'); wrap.className = 'switch';
  const i = document.createElement('input'); i.type = 'checkbox'; i.checked = !!get();
  const track = document.createElement('span'); track.className = 'switch__track';
  i.addEventListener('change', () => set(i.checked));
  wrap.append(i, track);
  return wrap;
}
function rangeCtl(get, set, f) {
  const wrap = document.createElement('div'); wrap.className = 'range-ctl';
  const r = document.createElement('input'); r.type = 'range'; r.min = f.min; r.max = f.max; r.step = f.step ?? 1; r.value = get() ?? f.min;
  const n = document.createElement('input'); n.className = 'ctl range-num'; n.type = 'number'; n.value = r.value;
  r.addEventListener('input', () => { n.value = r.value; set(+r.value); });
  n.addEventListener('change', () => { r.value = n.value; set(+n.value); });
  wrap.append(r, n);
  return wrap;
}
function colorCtl(get, set, ph) {
  const wrap = document.createElement('div'); wrap.className = 'color-ctl';
  const sw = document.createElement('div'); sw.className = 'color-swatch';
  const fill = document.createElement('div'); fill.className = 'color-swatch__fill';
  const picker = document.createElement('input'); picker.type = 'color';
  const val = get() || '';
  fill.style.background = val || 'transparent';
  picker.value = toHex(val) || '#5b8cff';
  const txt = document.createElement('input'); txt.className = 'ctl'; txt.type = 'text'; txt.value = val; txt.placeholder = ph || 'inherit';
  picker.addEventListener('input', () => { txt.value = picker.value; fill.style.background = picker.value; set(picker.value, true); });
  picker.addEventListener('change', () => set(picker.value));
  txt.addEventListener('input', () => { fill.style.background = txt.value; const hx = toHex(txt.value); if (hx) picker.value = hx; set(txt.value, true); });
  txt.addEventListener('change', () => set(txt.value));
  sw.append(fill, picker);
  wrap.append(sw, txt);
  return wrap;
}
function segCtl(get, set, options, icons) {
  const seg = document.createElement('div'); seg.className = 'seg';
  options.forEach((o, i) => {
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = icons ? icons[i] : o;
    if ((get() || options[0]) === o) b.classList.add('is-active');
    b.onclick = () => { seg.querySelectorAll('button').forEach((x) => x.classList.remove('is-active')); b.classList.add('is-active'); set(o); };
    seg.append(b);
  });
  return seg;
}
function toHex(v) { if (!v) return null; if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v.length === 4 ? '#' + v.slice(1).split('').map((c) => c + c).join('') : v; return null; }

/* picker controls (icon / font / link / asset) */
function iconPickCtl(get, set) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'ctl pick-btn';
  const render = () => { const v = get() || 'outline:star'; const [s, nm] = v.split(':'); b.innerHTML = `<span class="pick-ico">${iconSVG(s, nm, { size: 18, stroke: 1.8 })}</span><span class="pick-lbl">${nm || 'icon'}</span><svg viewBox="0 0 24 24" class="ic pick-caret"><path d="M6 9l6 6 6-6"/></svg>`; };
  render();
  b.onclick = () => openIconPicker(b, get(), (v) => { set(v); render(); });
  return b;
}
function fontPickCtl(get, set) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'ctl pick-btn';
  const render = () => { const v = get() || ''; const name = (v.match(/'([^']+)'/) || [])[1] || 'Default'; b.style.fontFamily = v || 'inherit'; b.innerHTML = `<span class="pick-lbl">${name}</span><svg viewBox="0 0 24 24" class="ic pick-caret"><path d="M6 9l6 6 6-6"/></svg>`; };
  render();
  b.onclick = () => openFontBrowser(b, get(), (stack) => { set(stack); render(); });
  return b;
}
function linkCtl(get, set) {
  const wrap = document.createElement('div'); wrap.className = 'pick-link';
  const i = document.createElement('input'); i.className = 'ctl'; i.type = 'text'; i.value = get() ?? ''; i.placeholder = '# / page / url';
  i.addEventListener('input', () => set(i.value, true));
  i.addEventListener('change', () => set(i.value));
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pick-link-btn'; b.title = 'Choose page or link';
  b.innerHTML = '<svg viewBox="0 0 24 24" class="ic"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>';
  b.onclick = () => openLinkPicker(b, get(), (v) => { i.value = v; set(v); });
  wrap.append(i, b);
  return wrap;
}
function assetCtl(get, set) {
  const wrap = document.createElement('div'); wrap.className = 'pick-asset';
  const thumb = document.createElement('div'); thumb.className = 'pick-thumb';
  const setThumb = () => { const v = get(); thumb.style.backgroundImage = v ? `url("${v.replace(/"/g, '%22')}")` : ''; thumb.classList.toggle('empty', !v); };
  setThumb();
  const b = document.createElement('button'); b.type = 'button'; b.className = 'btn pick-asset-btn'; b.textContent = 'Choose image…';
  b.onclick = () => openAssetPicker(b, get(), (v) => { set(v); setThumb(); });
  thumb.onclick = () => openAssetPicker(thumb, get(), (v) => { set(v); setThumb(); });
  wrap.append(thumb, b);
  return wrap;
}

/* dimension control — slider + scrubbable number + unit (pro-tool ergonomics) */
function dimCtl(get, set, f) {
  const units = f.units || ['px'];
  const re = /^(-?[\d.]+)\s*(px|rem|em|%|vw|vh|ch)?$/;
  const wrap = document.createElement('div'); wrap.className = 'dim-ctl';
  const slider = document.createElement('input'); slider.type = 'range'; slider.min = f.min; slider.max = f.max; slider.step = f.step ?? 1; slider.className = 'dim-range';
  const num = document.createElement('input'); num.className = 'ctl dim-num'; num.type = 'text'; num.title = 'Drag to scrub';
  const unit = document.createElement('select'); unit.className = 'ctl dim-unit';
  units.forEach((u) => { const o = document.createElement('option'); o.value = u; o.textContent = u || '—'; unit.append(o); });
  function read() {
    const v = (get() ?? '') + ''; const m = v.match(re);
    if (m) { slider.value = m[1]; num.value = v; const u = m[2] || ''; if (units.includes(u)) unit.value = u; }
    else { num.value = v; slider.value = f.min; }
  }
  read();
  const emit = (val, soft) => { num.value = val; set(val, soft); };
  slider.addEventListener('input', () => emit(slider.value + unit.value, true));
  slider.addEventListener('change', () => emit(slider.value + unit.value));
  num.addEventListener('input', () => { const m = num.value.match(re); if (m) { slider.value = m[1]; if (m[2] && units.includes(m[2])) unit.value = m[2]; } set(num.value, true); });
  num.addEventListener('change', () => set(num.value));
  unit.addEventListener('change', () => { const m = (num.value || '').match(re); emit((m ? m[1] : slider.value) + unit.value); });
  // scrub: drag horizontally on the number to change value
  num.addEventListener('pointerdown', (e) => {
    if (document.activeElement === num) return; // let click focus for typing
    e.preventDefault(); num.setPointerCapture(e.pointerId);
    const start = e.clientX; const m = (num.value || '').match(re); let base = m ? parseFloat(m[1]) : (+slider.value || 0);
    const step = f.step ?? 1;
    const mv = (ev) => { const nv = +(base + Math.round((ev.clientX - start) / 2) * step).toFixed(3); slider.value = Math.min(f.max, Math.max(f.min, nv)); emit(nv + unit.value, true); };
    const up = () => { num.releasePointerCapture(e.pointerId); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); set(num.value); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  });
  wrap.append(slider, num, unit);
  return wrap;
}

/* structured list editor — replaces "a|b|c" textareas with real rows */
function listCtl(f, get, set) {
  const sep = f.sep || '|', rowsep = f.rowsep || '\n', multi = (f.columns.length > 1);
  const wrap = document.createElement('div'); wrap.className = 'listed';
  let rows = (get() || '').split(rowsep).map((l) => l.trim()).filter(Boolean).map((l) => multi ? l.split(sep) : [l]);
  const serialize = () => rows.map((cells) => cells.map((c) => (c || '').trim()).join(sep)).join(rowsep);
  const commit = (soft) => set(serialize(), soft);
  const rowsBox = document.createElement('div'); rowsBox.className = 'listed__rows';

  function makeRow(cells, ri) {
    const row = document.createElement('div'); row.className = 'listed__row';
    const grip = document.createElement('span'); grip.className = 'listed__grip'; grip.innerHTML = '<svg viewBox="0 0 24 24" class="ic" style="width:13px;height:13px"><path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/></svg>';
    row.append(grip);
    f.columns.forEach((col, ci) => {
      let inp;
      if (col.type === 'select') {
        inp = document.createElement('select'); inp.className = 'ctl';
        col.options.forEach((o) => { const op = document.createElement('option'); op.value = o; op.textContent = o; inp.append(op); });
        inp.value = cells[ci] || col.options[0]; inp.onchange = () => { cells[ci] = inp.value; commit(); };
      } else {
        inp = document.createElement('input'); inp.className = 'ctl'; inp.type = 'text'; inp.placeholder = col.label || ''; inp.value = cells[ci] || '';
        inp.oninput = () => { cells[ci] = inp.value; commit(true); };
        inp.onchange = () => { cells[ci] = inp.value; commit(); };
      }
      inp.style.flex = col.w ? `0 0 ${col.w}` : '1';
      inp.style.minWidth = '0';
      row.append(inp);
    });
    const rm = document.createElement('button'); rm.className = 'listed__rm'; rm.type = 'button'; rm.title = 'Remove'; rm.innerHTML = '×';
    rm.onclick = () => { rows.splice(ri, 1); commit(); paint(); };
    row.append(rm);
    // drag reorder
    row.draggable = true;
    row.addEventListener('dragstart', (e) => { e.dataTransfer.effectAllowed = 'move'; wrap._drag = ri; row.classList.add('drag'); });
    row.addEventListener('dragend', () => row.classList.remove('drag'));
    row.addEventListener('dragover', (e) => { e.preventDefault(); });
    row.addEventListener('drop', (e) => { e.preventDefault(); const from = wrap._drag; if (from == null || from === ri) return; const m = rows.splice(from, 1)[0]; rows.splice(ri, 0, m); commit(); paint(); });
    return row;
  }
  function paint() {
    rowsBox.innerHTML = '';
    rows.forEach((cells, ri) => rowsBox.append(makeRow(cells, ri)));
  }
  paint();
  const add = document.createElement('button'); add.className = 'listed__add'; add.type = 'button'; add.textContent = '+ ' + (f.addLabel || 'Add item');
  add.onclick = () => { rows.push(f.columns.map(() => '')); commit(); paint(); };
  wrap.append(rowsBox, add);
  return wrap;
}

/* ---------- style controls ---------- */
function styleGet(node, key) { return effectiveStyle(node, store.viewport)[key]; }
function styleSet(node, key, v, soft) { store.updateStyle(node.id, { [key]: v === '' ? null : v }, store.viewport, soft ? { soft: true } : {}); }
function styleField(node, label, key, type, opts = {}) {
  const f = { type, ...opts };
  const ctl = buildControl(f, () => styleGet(node, key), (v, soft) => styleSet(node, key, v, soft), opts);
  return field(label, ctl, opts.stack);
}

function layoutControls(node, def) {
  const out = [];
  out.push(styleField(node, 'Display', 'display', 'select', { options: ['block', 'flex', 'grid', 'inline-flex', 'inline-block', 'none'] }));
  const disp = styleGet(node, 'display');
  if (disp === 'flex' || disp === 'inline-flex') {
    out.push(alignPad(node));
    out.push(styleField(node, 'Direction', 'flex-direction', 'seg', {
      options: ['row', 'column'],
      icons: ['<svg viewBox="0 0 24 24" class="ic"><path d="M4 12h16M14 6l6 6-6 6"/></svg>', '<svg viewBox="0 0 24 24" class="ic"><path d="M12 4v16M6 14l6 6 6-6"/></svg>'],
    }));
    out.push(styleField(node, 'Justify', 'justify-content', 'select', { options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] }));
    out.push(styleField(node, 'Align', 'align-items', 'select', { options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] }));
    out.push(styleField(node, 'Wrap', 'flex-wrap', 'select', { options: ['nowrap', 'wrap'] }));
    out.push(styleField(node, 'Gap', 'gap', 'dim', { min: 0, max: 80, step: 1, units: ['px', 'rem'] }));
  } else if (disp === 'grid') {
    out.push(styleField(node, 'Columns', 'grid-template-columns', 'text', { placeholder: 'repeat(3, 1fr)' }));
    out.push(styleField(node, 'Gap', 'gap', 'text', { placeholder: '0px' }));
  }
  return out;
}
/* graphical 3×3 alignment pad for flex containers */
function alignPad(node) {
  const dir = (styleGet(node, 'flex-direction') || 'row');
  const isRow = dir.startsWith('row');
  const map = ['flex-start', 'center', 'flex-end'];
  const j = styleGet(node, 'justify-content') || 'flex-start';
  const a = styleGet(node, 'align-items') || 'stretch';
  // current cell coordinates
  const jIdx = Math.max(0, map.indexOf(j === 'space-between' || j === 'space-around' || j === 'space-evenly' ? 'center' : j));
  const aIdx = Math.max(0, map.indexOf(a === 'stretch' || a === 'baseline' ? 'center' : a));
  const curC = isRow ? jIdx : aIdx;
  const curR = isRow ? aIdx : jIdx;
  const pad = document.createElement('div'); pad.className = 'align-pad';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const b = document.createElement('button'); b.className = 'align-cell'; b.type = 'button';
    if (r === curR && c === curC) b.classList.add('is-active');
    b.onclick = () => {
      const h = map[c], v = map[r];
      if (isRow) store.updateStyle(node.id, { 'justify-content': h, 'align-items': v });
      else store.updateStyle(node.id, { 'align-items': h, 'justify-content': v });
    };
    pad.append(b);
  }
  // distribute buttons
  const dist = document.createElement('div'); dist.className = 'align-dist';
  [['between', 'space-between'], ['around', 'space-around'], ['evenly', 'space-evenly']].forEach(([lbl, v]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'align-distbtn' + (j === v ? ' is-active' : ''); b.textContent = lbl;
    b.onclick = () => store.updateStyle(node.id, { 'justify-content': v });
    dist.append(b);
  });
  const box = document.createElement('div'); box.style.cssText = 'display:flex;gap:10px;align-items:center';
  box.append(pad, dist);
  return field('Align', box, true);
}

function spacingControl(node, prop) {
  const sides = ['top', 'right', 'bottom', 'left'];
  const wrap = document.createElement('div');
  const box = document.createElement('div'); box.className = 'spacing-box';
  sides.forEach((s) => {
    const key = `${prop}-${s}`;
    const mf = document.createElement('div'); mf.className = 'mini-field';
    const lbl = document.createElement('label'); lbl.textContent = s[0].toUpperCase();
    const inp = document.createElement('input'); inp.className = 'ctl'; inp.type = 'text';
    inp.value = resolveSide(node, prop, s);
    inp.addEventListener('change', () => styleSet(node, key, inp.value));
    mf.append(lbl, inp); box.append(mf);
  });
  return field(prop[0].toUpperCase() + prop.slice(1), box, true);
}
function resolveSide(node, prop, side) {
  const s = effectiveStyle(node, store.viewport);
  if (s[`${prop}-${side}`] != null) return s[`${prop}-${side}`];
  if (s[prop]) { const parts = s[prop].split(/\s+/); const map = { top: 0, right: 1, bottom: 2, left: 3 }; return parts[map[side]] ?? parts[map[side] % parts.length] ?? parts[0]; }
  return '';
}
function sizeControls(node) {
  const row = document.createElement('div'); row.className = 'dim-row';
  row.append(miniLabeled('W', node, 'width'), miniLabeled('H', node, 'height'));
  const row2 = document.createElement('div'); row2.className = 'dim-row';
  row2.append(miniLabeled('Max-W', node, 'max-width'), miniLabeled('Min-H', node, 'min-height'));
  const f1 = field('Size', row, true);
  const f2 = field('Limits', row2, true);
  return [f1, f2];
}
function miniLabeled(label, node, key) {
  const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;align-items:center;gap:6px';
  const l = document.createElement('span'); l.textContent = label; l.style.cssText = 'font-size:10px;color:var(--txt-3);min-width:32px';
  const i = document.createElement('input'); i.className = 'ctl'; i.type = 'text'; i.value = styleGet(node, key) ?? ''; i.placeholder = 'auto';
  i.addEventListener('change', () => styleSet(node, key, i.value));
  wrap.append(l, i);
  return wrap;
}
function typoControls(node) {
  return [
    styleField(node, 'Font', 'font-family', 'fontpick'),
    styleField(node, 'Color', 'color', 'color', { placeholder: 'inherit' }),
    styleField(node, 'Font size', 'font-size', 'dim', { min: 8, max: 120, step: 1, units: ['px', 'rem', 'em'] }),
    styleField(node, 'Weight', 'font-weight', 'select', { options: ['', '300', '400', '500', '600', '700', '800', '900'] }),
    styleField(node, 'Line height', 'line-height', 'dim', { min: 0.8, max: 3, step: 0.05, units: ['', 'px'] }),
    styleField(node, 'Letter sp.', 'letter-spacing', 'dim', { min: -0.05, max: 0.4, step: 0.005, units: ['em', 'px'] }),
    styleField(node, 'Align', 'text-align', 'seg', {
      options: ['left', 'center', 'right', 'justify'],
      icons: ['<svg viewBox="0 0 24 24" class="ic"><path d="M4 6h16M4 12h10M4 18h13"/></svg>', '<svg viewBox="0 0 24 24" class="ic"><path d="M4 6h16M7 12h10M5 18h14"/></svg>', '<svg viewBox="0 0 24 24" class="ic"><path d="M4 6h16M10 12h10M7 18h13"/></svg>', '<svg viewBox="0 0 24 24" class="ic"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'],
    }),
    styleField(node, 'Transform', 'text-transform', 'select', { options: ['', 'none', 'uppercase', 'lowercase', 'capitalize'] }),
    styleField(node, 'Wrapping', 'text-wrap', 'select', { options: ['', 'wrap', 'balance', 'pretty', 'nowrap', 'stable'] }),
    styleField(node, 'White space', 'white-space', 'select', { options: ['', 'normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line'] }),
    styleField(node, 'Word break', 'word-break', 'select', { options: ['', 'normal', 'break-word', 'break-all', 'keep-all'] }),
    styleField(node, 'Overflow wrap', 'overflow-wrap', 'select', { options: ['', 'normal', 'break-word', 'anywhere'] }),
    styleField(node, 'Hyphens', 'hyphens', 'select', { options: ['', 'none', 'manual', 'auto'] }),
    clampControl(node),
  ];
}
/* truncate to N lines (sets the -webkit-line-clamp bundle as one action) */
function clampControl(node) {
  const cur = effectiveStyle(node, store.viewport)['-webkit-line-clamp'] || '';
  const wrap = document.createElement('div'); wrap.className = 'range-ctl';
  const r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = 10; r.step = 1; r.value = cur || 0;
  const n = document.createElement('input'); n.className = 'ctl range-num'; n.type = 'number'; n.value = cur || 0; n.title = '0 = off';
  const apply = (v, soft) => {
    const lines = +v;
    const patch = lines > 0
      ? { display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': String(lines), overflow: 'hidden' }
      : { display: null, '-webkit-box-orient': null, '-webkit-line-clamp': null, overflow: null };
    store.updateStyle(node.id, patch, store.viewport, soft ? { soft: true } : {});
  };
  r.addEventListener('input', () => { n.value = r.value; apply(r.value, true); });
  r.addEventListener('change', () => apply(r.value));
  n.addEventListener('change', () => { r.value = n.value; apply(n.value); });
  wrap.append(r, n);
  return field('Clamp lines', wrap);
}
function bgControls(node) {
  return [
    styleField(node, 'Background', 'background-color', 'color', { placeholder: 'transparent' }),
    styleField(node, 'Gradient', 'background', 'text', { placeholder: 'linear-gradient(...)' }),
    styleField(node, 'Radius', 'border-radius', 'dim', { min: 0, max: 64, step: 1, units: ['px', 'rem', '%'] }),
    styleField(node, 'Border', 'border', 'text', { placeholder: '1px solid #ddd' }),
    styleField(node, 'Shadow', 'box-shadow', 'text', { placeholder: 'var(--shadow)' }),
  ];
}
function animControls(node) {
  const a = node.anim || {};
  const set = (patch) => store.updateAnim(node.id, patch);
  const out = [];
  const TYPES = ['none', 'fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in', 'zoom-out', 'rise', 'blur-in', 'flip'];
  out.push(field('Entrance', selectCtl(() => a.type || 'none', (v) => set({ type: v }), TYPES)));
  if (a.type && a.type !== 'none') {
    out.push(field('Trigger', selectCtl(() => a.trigger || 'inview', (v) => set({ trigger: v }), ['inview', 'load'])));
    out.push(field('Duration', rangeCtl(() => a.duration ?? 700, (v) => set({ duration: v }), { min: 100, max: 2000, step: 50 })));
    out.push(field('Delay', rangeCtl(() => a.delay ?? 0, (v) => set({ delay: v }), { min: 0, max: 1500, step: 50 })));
    out.push(field('Easing', selectCtl(() => a.easing || 'spring', (v) => set({ easing: v }), ['spring', 'ease-out', 'ease-in-out', 'back', 'linear'])));
  }
  out.push(field('Hover', selectCtl(() => a.hover || 'none', (v) => set({ hover: v }), ['none', 'lift', 'grow', 'sink', 'glow', 'tilt'])));
  out.push(field('On scroll', selectCtl(() => a.scroll || 'none', (v) => set({ scroll: v }), ['none', 'parallax-up', 'parallax-down', 'fade-scroll', 'zoom-scroll', 'rotate-scroll'])));
  if (a.scroll && a.scroll !== 'none') out.push(field('Intensity', rangeCtl(() => a.scrollAmt ?? 1, (v) => set({ scrollAmt: v }), { min: 0.2, max: 3, step: 0.1 })));
  out.push(field('On click', selectCtl(() => a.click || 'none', (v) => set({ click: v }), ['none', 'ripple', 'pop', 'pulse', 'shake', 'jelly', 'dissolve', 'glitch'])));
  const replay = document.createElement('button');
  replay.className = 'btn btn--ghost'; replay.style.cssText = 'width:100%;justify-content:center;margin-top:2px';
  replay.innerHTML = '<svg viewBox="0 0 24 24" class="ic" style="width:15px;height:15px"><path d="M5 3l14 9-14 9z"/></svg> Replay animations';
  replay.onclick = () => store.emit('anim:preview');
  out.push(replay);
  return out;
}

/* ---------- image framing: fit + focus point + crop + transform ---------- */
function imageControls(node) {
  const out = [];
  out.push(styleField(node, 'Object fit', 'object-fit', 'select', { options: ['cover', 'contain', 'fill', 'none', 'scale-down'] }));
  out.push(field('Focus point', focusPad(node), true));
  out.push(field('Aspect', textCtl(() => styleGet(node, 'aspect-ratio'), (v, s) => styleSet(node, 'aspect-ratio', v, s), 'e.g. 16/9')));
  const cropBtn = document.createElement('button');
  cropBtn.className = 'btn btn--ghost'; cropBtn.style.cssText = 'width:100%;justify-content:center';
  cropBtn.innerHTML = '<svg viewBox="0 0 24 24" class="ic" style="width:15px;height:15px"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg> Crop image';
  cropBtn.onclick = () => { const src = node.props.src; if (src) openCropModal(src, (v) => store.updateProps(node.id, { src: v })); else window.__wisyToast?.('Choose an image first', 'err'); };
  out.push(cropBtn);
  return out;
}
function focusPad(node) {
  const cur = (styleGet(node, 'object-position') || '50% 50%').split(/\s+/);
  let x = parseFloat(cur[0]) || 50, y = parseFloat(cur[1] ?? cur[0]) || 50;
  const pad = document.createElement('div'); pad.className = 'focus-pad';
  const dot = document.createElement('div'); dot.className = 'focus-dot'; pad.append(dot);
  const place = () => { dot.style.left = x + '%'; dot.style.top = y + '%'; };
  place();
  const setFrom = (e, soft) => { const r = pad.getBoundingClientRect(); x = Math.round(Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100))); y = Math.round(Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100))); place(); styleSet(node, 'object-position', `${x}% ${y}%`, soft); };
  pad.addEventListener('pointerdown', (e) => { e.preventDefault(); pad.setPointerCapture(e.pointerId); setFrom(e, true); const mv = (ev) => setFrom(ev, true); const up = () => { pad.removeEventListener('pointermove', mv); pad.removeEventListener('pointerup', up); styleSet(node, 'object-position', `${x}% ${y}%`); }; pad.addEventListener('pointermove', mv); pad.addEventListener('pointerup', up); });
  return pad;
}

function parseTransform(str) { const o = { rotate: 0, sx: 1, sy: 1, scale: 1 }; if (!str) return o; let m; if ((m = str.match(/rotate\((-?[\d.]+)deg\)/))) o.rotate = +m[1]; if ((m = str.match(/scaleX\((-?[\d.]+)\)/))) o.sx = +m[1]; if ((m = str.match(/scaleY\((-?[\d.]+)\)/))) o.sy = +m[1]; if ((m = str.match(/(?:^|\s)scale\((-?[\d.]+)\)/))) o.scale = +m[1]; return o; }
function buildTransform(o) { const p = []; if (o.scale !== 1) p.push(`scale(${o.scale})`); if (o.sx !== 1) p.push(`scaleX(${o.sx})`); if (o.sy !== 1) p.push(`scaleY(${o.sy})`); if (o.rotate) p.push(`rotate(${o.rotate}deg)`); return p.join(' '); }
function transformControl(node) {
  const get = () => parseTransform(styleGet(node, 'transform'));
  const set = (o, soft) => styleSet(node, 'transform', buildTransform(o) || null, soft);
  const wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px';
  // rotate
  const rRow = document.createElement('div'); rRow.className = 'range-ctl';
  const r = document.createElement('input'); r.type = 'range'; r.min = -180; r.max = 180; r.step = 1; r.value = get().rotate;
  const rn = document.createElement('input'); rn.className = 'ctl range-num'; rn.type = 'number'; rn.value = get().rotate;
  r.addEventListener('input', () => { rn.value = r.value; const o = get(); o.rotate = +r.value; set(o, true); });
  r.addEventListener('change', () => { const o = get(); o.rotate = +r.value; set(o); });
  rn.addEventListener('change', () => { r.value = rn.value; const o = get(); o.rotate = +rn.value; set(o); });
  rRow.append(r, rn);
  // scale
  const sRow = document.createElement('div'); sRow.className = 'range-ctl';
  const s = document.createElement('input'); s.type = 'range'; s.min = 0.3; s.max = 2.5; s.step = 0.05; s.value = get().scale;
  const sn = document.createElement('input'); sn.className = 'ctl range-num'; sn.type = 'number'; sn.value = get().scale;
  s.addEventListener('input', () => { sn.value = s.value; const o = get(); o.scale = +s.value; set(o, true); });
  s.addEventListener('change', () => { const o = get(); o.scale = +s.value; set(o); });
  sn.addEventListener('change', () => { s.value = sn.value; const o = get(); o.scale = +sn.value; set(o); });
  sRow.append(s, sn);
  // flips
  const seg = document.createElement('div'); seg.className = 'seg';
  const fh = document.createElement('button'); fh.type = 'button'; fh.textContent = 'Flip H';
  const fv = document.createElement('button'); fv.type = 'button'; fv.textContent = 'Flip V';
  const sync = () => { const o = get(); fh.classList.toggle('is-active', o.sx < 0); fv.classList.toggle('is-active', o.sy < 0); };
  fh.onclick = () => { const o = get(); o.sx = o.sx < 0 ? 1 : -1; set(o); sync(); };
  fv.onclick = () => { const o = get(); o.sy = o.sy < 0 ? 1 : -1; set(o); sync(); };
  sync(); seg.append(fh, fv);
  wrap.append(labeledRow('Rotate', rRow), labeledRow('Scale', sRow), seg);
  return field('Transform', wrap, true);
}
function labeledRow(lbl, ctl) { const w = document.createElement('div'); w.style.cssText = 'display:flex;align-items:center;gap:8px'; const l = document.createElement('span'); l.textContent = lbl; l.style.cssText = 'font-size:11px;color:var(--txt-3);min-width:44px'; w.append(l, ctl); ctl.style.flex = '1'; return w; }

function effectControls(node) {
  return [
    transformControl(node),
    styleField(node, 'Opacity', 'opacity', 'range', { min: 0, max: 1, step: 0.05 }),
    styleField(node, 'Overflow', 'overflow', 'select', { options: ['', 'visible', 'hidden', 'auto', 'scroll'] }),
    styleField(node, 'Position', 'position', 'select', { options: ['', 'relative', 'absolute', 'sticky', 'fixed'] }),
    styleField(node, 'Cursor', 'cursor', 'select', { options: ['', 'default', 'pointer', 'grab', 'text', 'not-allowed'] }),
  ];
}
