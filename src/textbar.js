/* ============================================================
   Floating typography toolbar — a contextual bar above the
   selected text. Inline rich formatting (bold/italic/underline)
   via execCommand while editing; element‑level font/size/align
   otherwise. Loved Medium/Notion‑style ergonomics.
   ============================================================ */
import { store, effectiveStyle } from './state.js';
import { FONT_OPTIONS } from './themes.js';

let bar, current = null, ctx = {};
const TEXT_TYPES = new Set(['heading', 'text', 'button', 'link', 'badge', 'list']);

const ALIGN_ICONS = {
  left: '<path d="M4 6h16M4 12h10M4 18h13"/>',
  center: '<path d="M4 6h16M7 12h10M5 18h14"/>',
  right: '<path d="M4 6h16M10 12h10M7 18h13"/>',
  justify: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};

export function initTextbar() { if (!bar) build(); }

function build() {
  bar = document.createElement('div');
  bar.className = 'textbar';
  bar.hidden = true;
  bar.addEventListener('mousedown', (e) => e.preventDefault()); // keep iframe selection
  document.body.append(bar);

  bar.append(
    btn('format-b', '<b style="font-size:14px">B</b>', 'Bold (⌘B)', () => fmt('bold', 'font-weight', '700', '400')),
    btn('format-i', '<i style="font-size:14px">I</i>', 'Italic (⌘I)', () => fmt('italic', 'font-style', 'italic', 'normal')),
    btn('format-u', '<span style="text-decoration:underline;font-size:13px">U</span>', 'Underline (⌘U)', () => fmt('underline', 'text-decoration', 'underline', 'none')),
    sep(),
  );

  fontSel = document.createElement('select'); fontSel.className = 'textbar__font';
  const optDef = document.createElement('option'); optDef.value = ''; optDef.textContent = 'Default'; fontSel.append(optDef);
  FONT_OPTIONS.forEach((f) => { const o = document.createElement('option'); o.value = `'${f}', sans-serif`; o.textContent = f; fontSel.append(o); });
  fontSel.onchange = () => { if (current) store.updateStyle(current.id, { 'font-family': fontSel.value || null }); };
  bar.append(fontSel, sep());

  bar.append(
    btn('', '<svg viewBox="0 0 24 24" class="ic"><path d="M5 12h14"/></svg>', 'Smaller', () => bumpSize(-2)),
  );
  sizeOut = document.createElement('span'); sizeOut.className = 'textbar__size'; bar.append(sizeOut);
  bar.append(
    btn('', '<svg viewBox="0 0 24 24" class="ic"><path d="M12 5v14M5 12h14"/></svg>', 'Larger', () => bumpSize(2)),
    sep(),
  );

  Object.entries(ALIGN_ICONS).forEach(([a, p]) => bar.append(
    btn('align-' + a, `<svg viewBox="0 0 24 24" class="ic">${p}</svg>`, 'Align ' + a, () => { if (current) store.updateStyle(current.id, { 'text-align': a }); }),
  ));
}
let fontSel, sizeOut;

function btn(name, html, title, onClick) {
  const b = document.createElement('button');
  b.className = 'textbar__btn'; if (name) b.dataset.k = name; b.title = title; b.innerHTML = html;
  b.onclick = (e) => { e.preventDefault(); onClick(); };
  return b;
}
function sep() { const s = document.createElement('span'); s.className = 'textbar__sep'; return s; }

function fmt(cmd, key, onVal, offVal) {
  if (!current) return;
  if (ctx.editing && ctx.fwin) {
    try { ctx.fwin.document.execCommand('styleWithCSS', false, false); } catch { /* */ }
    try { ctx.fwin.document.execCommand(cmd, false, null); } catch { /* */ }
    return;
  }
  const cur = effectiveStyle(current, store.viewport)[key];
  let on;
  if (key === 'font-weight') on = cur === '700' || cur === 'bold';
  else if (key === 'text-decoration') on = (cur || '').includes('underline');
  else on = cur === onVal;
  store.updateStyle(current.id, { [key]: on ? offVal : onVal });
}
function bumpSize(d) {
  if (!current || !ctx.fwin) return;
  const el = ctx.fwin.document.querySelector(`[data-wid="${current.id}"]`);
  if (!el) return;
  const px = parseFloat(ctx.fwin.getComputedStyle(el).fontSize) || 16;
  store.updateStyle(current.id, { 'font-size': Math.max(8, Math.round(px + d)) + 'px' });
}

export function updateTextbar(node, rect, c) {
  if (!bar) build();
  ctx = c || {};
  const applies = node && (TEXT_TYPES.has(node.type) || ctx.editing);
  if (!applies) { bar.hidden = true; current = null; return; }
  current = node;
  syncStates();
  bar.hidden = false;
  position(rect);
}

function syncStates() {
  const s = effectiveStyle(current, store.viewport);
  const set = (k, on) => { const b = bar.querySelector(`[data-k="${k}"]`); if (b) b.classList.toggle('is-active', !!on); };
  if (ctx.editing && ctx.fwin) {
    try {
      set('format-b', ctx.fwin.document.queryCommandState('bold'));
      set('format-i', ctx.fwin.document.queryCommandState('italic'));
      set('format-u', ctx.fwin.document.queryCommandState('underline'));
    } catch { /* */ }
  } else {
    set('format-b', s['font-weight'] === '700' || s['font-weight'] === 'bold');
    set('format-i', s['font-style'] === 'italic');
    set('format-u', (s['text-decoration'] || '').includes('underline'));
  }
  ['left', 'center', 'right', 'justify'].forEach((a) => set('align-' + a, (s['text-align'] || 'left') === a));
  if (fontSel) fontSel.value = s['font-family'] && FONT_OPTIONS.some((f) => s['font-family'].includes(f)) ? s['font-family'] : '';
  if (sizeOut && ctx.fwin) { const el = ctx.fwin.document.querySelector(`[data-wid="${current.id}"]`); sizeOut.textContent = el ? Math.round(parseFloat(ctx.fwin.getComputedStyle(el).fontSize)) : '–'; }
}

function position(rect) {
  const bw = bar.offsetWidth, bh = bar.offsetHeight;
  let left = rect.left + rect.width / 2 - bw / 2;
  left = Math.max(10, Math.min(left, window.innerWidth - bw - 10));
  let top = rect.top - bh - 10;
  if (top < 58) top = rect.top + rect.height + 10; // flip below if it would hit the top bar
  bar.style.left = left + 'px';
  bar.style.top = top + 'px';
}
