/* ============================================================
   Inspector — parametric property + style editor.
   Component props come from the registry schema; style controls
   are generic and write to the active responsive breakpoint.
   ============================================================ */
import { store, effectiveStyle } from './state.js';
import { REG, icoSvg } from './registry.js';
import { FONT_OPTIONS } from './themes.js';

let host;
const collapsed = new Set();

export function initInspector() {
  host = document.getElementById('inspector');
  store.on('select', render);
  store.on('change', () => { if (store.selectedId) render(); });
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
  // style sections
  host.append(section('Layout', layoutControls(node, def)));
  host.append(section('Spacing', [spacingControl(node, 'padding'), spacingControl(node, 'margin')]));
  host.append(section('Size', sizeControls(node)));
  host.append(section('Typography', typoControls(node)));
  host.append(section('Background & Border', bgControls(node)));
  host.append(section('Effects', effectControls(node)));
  host.append(section('Animation', animControls(node)));
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
  const set = (v) => store.updateProps(node.id, { [f.key]: v });
  const ctl = buildControl(f, get, set);
  const stack = f.type === 'textarea';
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
    default: return textCtl(get, set, opts.placeholder);
  }
}
function textCtl(get, set, ph) {
  const i = document.createElement('input'); i.className = 'ctl'; i.type = 'text'; i.value = get() ?? ''; if (ph) i.placeholder = ph;
  i.addEventListener('change', () => set(i.value));
  return i;
}
function textareaCtl(get, set) {
  const t = document.createElement('textarea'); t.className = 'ctl'; t.value = get() ?? '';
  t.addEventListener('change', () => set(t.value));
  return t;
}
function numberCtl(get, set) {
  const i = document.createElement('input'); i.className = 'ctl'; i.type = 'number'; i.value = get() ?? '';
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
  picker.addEventListener('input', () => { txt.value = picker.value; fill.style.background = picker.value; set(picker.value); });
  txt.addEventListener('change', () => { fill.style.background = txt.value; const hx = toHex(txt.value); if (hx) picker.value = hx; set(txt.value); });
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

/* ---------- style controls ---------- */
function styleGet(node, key) { return effectiveStyle(node, store.viewport)[key]; }
function styleSet(node, key, v) { store.updateStyle(node.id, { [key]: v === '' ? null : v }); }
function styleField(node, label, key, type, opts = {}) {
  const f = { type, ...opts };
  const ctl = buildControl(f, () => styleGet(node, key), (v) => styleSet(node, key, v), opts);
  return field(label, ctl, opts.stack);
}

function layoutControls(node, def) {
  const out = [];
  out.push(styleField(node, 'Display', 'display', 'select', { options: ['block', 'flex', 'grid', 'inline-flex', 'inline-block', 'none'] }));
  const disp = styleGet(node, 'display');
  if (disp === 'flex' || disp === 'inline-flex') {
    out.push(styleField(node, 'Direction', 'flex-direction', 'seg', {
      options: ['row', 'column'],
      icons: ['<svg viewBox="0 0 24 24" class="ic"><path d="M4 12h16M14 6l6 6-6 6"/></svg>', '<svg viewBox="0 0 24 24" class="ic"><path d="M12 4v16M6 14l6 6 6-6"/></svg>'],
    }));
    out.push(styleField(node, 'Justify', 'justify-content', 'select', { options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] }));
    out.push(styleField(node, 'Align', 'align-items', 'select', { options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] }));
    out.push(styleField(node, 'Wrap', 'flex-wrap', 'select', { options: ['nowrap', 'wrap'] }));
    out.push(styleField(node, 'Gap', 'gap', 'text', { placeholder: '0px' }));
  } else if (disp === 'grid') {
    out.push(styleField(node, 'Columns', 'grid-template-columns', 'text', { placeholder: 'repeat(3, 1fr)' }));
    out.push(styleField(node, 'Gap', 'gap', 'text', { placeholder: '0px' }));
  }
  return out;
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
    styleField(node, 'Color', 'color', 'color', { placeholder: 'inherit' }),
    styleField(node, 'Font size', 'font-size', 'text', { placeholder: '1rem' }),
    styleField(node, 'Weight', 'font-weight', 'select', { options: ['', '300', '400', '500', '600', '700', '800', '900'] }),
    styleField(node, 'Line height', 'line-height', 'text', { placeholder: '1.5' }),
    styleField(node, 'Letter sp.', 'letter-spacing', 'text', { placeholder: '0' }),
    styleField(node, 'Align', 'text-align', 'seg', {
      options: ['left', 'center', 'right', 'justify'],
      icons: ['<svg viewBox="0 0 24 24" class="ic"><path d="M4 6h16M4 12h10M4 18h13"/></svg>', '<svg viewBox="0 0 24 24" class="ic"><path d="M4 6h16M7 12h10M5 18h14"/></svg>', '<svg viewBox="0 0 24 24" class="ic"><path d="M4 6h16M10 12h10M7 18h13"/></svg>', '<svg viewBox="0 0 24 24" class="ic"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'],
    }),
    styleField(node, 'Transform', 'text-transform', 'select', { options: ['', 'none', 'uppercase', 'lowercase', 'capitalize'] }),
  ];
}
function bgControls(node) {
  return [
    styleField(node, 'Background', 'background-color', 'color', { placeholder: 'transparent' }),
    styleField(node, 'Gradient', 'background', 'text', { placeholder: 'linear-gradient(...)' }),
    styleField(node, 'Radius', 'border-radius', 'text', { placeholder: '0px' }),
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
  const replay = document.createElement('button');
  replay.className = 'btn btn--ghost'; replay.style.cssText = 'width:100%;justify-content:center;margin-top:2px';
  replay.innerHTML = '<svg viewBox="0 0 24 24" class="ic" style="width:15px;height:15px"><path d="M5 3l14 9-14 9z"/></svg> Replay animations';
  replay.onclick = () => store.emit('anim:preview');
  out.push(replay);
  return out;
}

function effectControls(node) {
  return [
    styleField(node, 'Opacity', 'opacity', 'range', { min: 0, max: 1, step: 0.05 }),
    styleField(node, 'Overflow', 'overflow', 'select', { options: ['', 'visible', 'hidden', 'auto', 'scroll'] }),
    styleField(node, 'Position', 'position', 'select', { options: ['', 'relative', 'absolute', 'sticky', 'fixed'] }),
    styleField(node, 'Cursor', 'cursor', 'select', { options: ['', 'default', 'pointer', 'grab', 'text', 'not-allowed'] }),
  ];
}
