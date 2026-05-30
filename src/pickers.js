/* ============================================================
   Pickers — graphical popovers for icons, fonts, links and
   assets (upload / free stock / crop). Used by the inspector.
   ============================================================ */
import { store } from './state.js';
import { ICON_LIBRARY, ICON_SET_KEYS, searchIcons, iconSVG } from './iconlib.js';
import { FONT_LIBRARY, FONT_CATEGORIES, FONT_PAIRINGS, searchFonts, fontStack, googleFontsHref } from './fontlib.js';

let activePop = null;
function closePop() { if (activePop) { activePop.remove(); activePop = null; document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', onEsc, true); } }
function outside(e) { if (activePop && !activePop.contains(e.target)) closePop(); }
function onEsc(e) { if (e.key === 'Escape') closePop(); }
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function popover(anchor, width = 320) {
  closePop();
  const pop = el('div', 'picker-pop'); pop.style.width = width + 'px';
  document.body.append(pop);
  const r = anchor.getBoundingClientRect();
  pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8)) + 'px';
  const below = r.bottom + 6, h = Math.min(440, window.innerHeight - below - 12);
  pop.style.top = (below + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 6) : below) + 'px';
  pop.style.maxHeight = h + 'px';
  pop.addEventListener('pointerdown', (e) => e.stopPropagation());
  activePop = pop;
  setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', onEsc, true); }, 0);
  return pop;
}

/* ---------------- icon picker ---------------- */
export function openIconPicker(anchor, current, onPick) {
  const pop = popover(anchor, 304);
  let set = (current && current.split(':')[0]) || 'outline';
  if (!ICON_SET_KEYS.includes(set)) set = 'outline';
  pop.innerHTML = `
    <div class="pk-head">
      <div class="pk-tabs">${ICON_SET_KEYS.map((k) => `<button class="pk-tab${k === set ? ' is-active' : ''}" data-set="${k}">${ICON_LIBRARY[k].name}</button>`).join('')}</div>
      <div class="pk-search"><input type="text" placeholder="Search ${Object.values(ICON_LIBRARY).reduce((a, s) => a + Object.keys(s.icons).length, 0)} icons…" /></div>
    </div>
    <div class="pk-grid" id="pk-grid"></div>`;
  const grid = pop.querySelector('#pk-grid');
  const input = pop.querySelector('input');
  function paint(q) {
    grid.innerHTML = '';
    let items;
    if (q && q.trim()) items = searchIcons(q).slice(0, 300);
    else items = Object.keys(ICON_LIBRARY[set].icons).map((name) => ({ set, name }));
    items.forEach(({ set: s, name }) => {
      const b = el('button', 'pk-icon'); b.title = `${name}`;
      b.innerHTML = iconSVG(s, name, { size: 22, stroke: 1.8 });
      if (current === `${s}:${name}`) b.classList.add('is-active');
      b.onclick = () => { onPick(`${s}:${name}`); closePop(); };
      grid.append(b);
    });
    if (!items.length) grid.innerHTML = '<div class="pk-empty">No icons</div>';
  }
  pop.querySelectorAll('.pk-tab').forEach((t) => t.onclick = () => { set = t.dataset.set; pop.querySelectorAll('.pk-tab').forEach((x) => x.classList.toggle('is-active', x === t)); paint(input.value); });
  input.addEventListener('input', () => paint(input.value));
  paint('');
  setTimeout(() => input.focus(), 0);
}

/* ---------------- font browser ---------------- */
let fontLinkEl = null;
function ensureFontPreview(families) {
  // load preview fonts into the editor document
  if (!families.length) return;
  if (!fontLinkEl) { fontLinkEl = document.createElement('link'); fontLinkEl.rel = 'stylesheet'; document.head.append(fontLinkEl); }
  fontLinkEl.href = googleFontsHref(families.slice(0, 48));
}
export function openFontBrowser(anchor, current, onPick) {
  const pop = popover(anchor, 300);
  let cat = 'all', mode = 'fonts';
  pop.innerHTML = `
    <div class="pk-head">
      <div class="pk-tabs"><button class="pk-tab is-active" data-mode="fonts">Fonts</button><button class="pk-tab" data-mode="pairs">Pairings</button></div>
      <div class="pk-search" data-fonts><input type="text" placeholder="Search 110 fonts…" /></div>
      <div class="pk-chips" data-fonts>${['all', ...FONT_CATEGORIES].map((c) => `<button class="pk-chip${c === 'all' ? ' is-active' : ''}" data-cat="${c}">${c}</button>`).join('')}</div>
    </div>
    <div class="pk-list" id="pk-flist"></div>`;
  const list = pop.querySelector('#pk-flist');
  const input = pop.querySelector('input');
  function paintFonts(q) {
    const items = searchFonts(q, cat === 'all' ? null : cat).slice(0, 80);
    ensureFontPreview(items.map((f) => f.family));
    list.innerHTML = '';
    items.forEach((f) => {
      const row = el('button', 'pk-frow');
      const stack = fontStack(f.family);
      if (current && current.includes(f.family)) row.classList.add('is-active');
      row.innerHTML = `<span class="pk-fname" style="font-family:${stack}">${f.family}</span><span class="pk-fcat">${f.category}</span>`;
      row.onclick = () => { onPick(stack); closePop(); };
      list.append(row);
    });
    if (!items.length) list.innerHTML = '<div class="pk-empty">No fonts</div>';
  }
  function paintPairs() {
    ensureFontPreview(FONT_PAIRINGS.flatMap((p) => [p.display, p.body]));
    list.innerHTML = '';
    FONT_PAIRINGS.forEach((p) => {
      const row = el('button', 'pk-pair');
      row.innerHTML = `<span class="pk-pair-d" style="font-family:${fontStack(p.display)}">${p.display}</span><span class="pk-pair-b" style="font-family:${fontStack(p.body)}">${p.body}</span><span class="pk-fcat">${p.tag}</span>`;
      row.onclick = () => { onPick(fontStack(p.display), fontStack(p.body)); closePop(); };
      list.append(row);
    });
  }
  pop.querySelectorAll('[data-mode]').forEach((t) => t.onclick = () => {
    mode = t.dataset.mode; pop.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('is-active', x === t));
    pop.querySelectorAll('[data-fonts]').forEach((x) => x.style.display = mode === 'fonts' ? '' : 'none');
    mode === 'fonts' ? paintFonts(input.value) : paintPairs();
  });
  pop.querySelectorAll('.pk-chip').forEach((c) => c.onclick = () => { cat = c.dataset.cat; pop.querySelectorAll('.pk-chip').forEach((x) => x.classList.toggle('is-active', x === c)); paintFonts(input.value); });
  input.addEventListener('input', () => paintFonts(input.value));
  paintFonts('');
  setTimeout(() => input.focus(), 0);
}

/* ---------------- link picker ---------------- */
export function openLinkPicker(anchor, current, onPick) {
  const pop = popover(anchor, 280);
  pop.innerHTML = `<div class="pk-section">Pages</div><div class="pk-pages"></div>
    <div class="pk-section">Anchor / URL</div>
    <div class="pk-urlrow"><input class="ctl" type="text" placeholder="https://…  or  #section" /></div>
    <div class="pk-quick"><button data-v="#">Top of page</button><button data-v="mailto:">Email</button><button data-v="tel:">Phone</button></div>`;
  const pages = pop.querySelector('.pk-pages');
  store.doc.pages.forEach((p) => {
    const b = el('button', 'pk-page' + (current === p.path ? ' is-active' : ''));
    b.innerHTML = `<svg viewBox="0 0 24 24" class="ic" style="width:14px;height:14px"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6"/></svg> ${p.name} <span class="pk-page-path">/${p.path}</span>`;
    b.onclick = () => { onPick(p.path); closePop(); };
    pages.append(b);
  });
  const input = pop.querySelector('input'); input.value = current || '';
  input.addEventListener('change', () => { onPick(input.value); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { onPick(input.value); closePop(); } });
  pop.querySelectorAll('.pk-quick button').forEach((b) => b.onclick = () => { input.value = b.dataset.v; input.focus(); });
  setTimeout(() => input.focus(), 0);
}

/* ---------------- asset picker (upload / stock / url + crop) ---------------- */
const STOCK = {
  photo: { label: 'Photos', build: (q, i) => `https://picsum.photos/seed/${encodeURIComponent((q || 'wisy') + i)}/600/400` },
  avatar: { label: 'Avatars', build: (q, i) => `https://i.pravatar.cc/300?img=${(i % 70) + 1}` },
  shape: { label: 'Avatars 2', build: (q, i) => `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent((q || 's') + i)}` },
  fun: { label: 'Fun', build: (q, i) => `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${encodeURIComponent((q || 'f') + i)}` },
};
export function openAssetPicker(anchor, current, onPick) {
  const pop = popover(anchor, 320);
  let tab = 'upload';
  pop.innerHTML = `
    <div class="pk-head"><div class="pk-tabs">
      <button class="pk-tab is-active" data-tab="upload">Upload</button>
      <button class="pk-tab" data-tab="stock">Free stock</button>
      <button class="pk-tab" data-tab="url">URL</button>
    </div></div>
    <div class="pk-body" id="pk-asset"></div>`;
  const body = pop.querySelector('#pk-asset');
  function paint() {
    body.innerHTML = '';
    if (tab === 'upload') {
      body.innerHTML = `<label class="pk-drop"><input type="file" accept="image/*" hidden />
        <svg viewBox="0 0 24 24" class="ic"><path d="M12 16V4M8 8l4-4 4 4M4 20h16"/></svg>
        <span>Click to upload an image</span><small>Bundled into your export (inlined)</small></label>
        ${current ? '<button class="pk-cropbtn">Crop / edit current image</button>' : ''}`;
      body.querySelector('input').addEventListener('change', (e) => {
        const file = e.target.files[0]; if (!file) return;
        const r = new FileReader(); r.onload = () => { onPick(r.result); closePop(); }; r.readAsDataURL(file);
      });
      const cb = body.querySelector('.pk-cropbtn'); if (cb) cb.onclick = () => openCropModal(current, onPick);
    } else if (tab === 'stock') {
      body.innerHTML = `<div class="pk-stock-tabs">${Object.keys(STOCK).map((k, i) => `<button class="pk-stab${i === 0 ? ' is-active' : ''}" data-s="${k}">${STOCK[k].label}</button>`).join('')}</div>
        <div class="pk-search"><input type="text" placeholder="Keyword / seed…" /></div><div class="pk-stockgrid"></div>`;
      let src = 'photo';
      const grid = body.querySelector('.pk-stockgrid'); const inp = body.querySelector('input');
      const fill = () => { grid.innerHTML = ''; for (let i = 0; i < 12; i++) { const url = STOCK[src].build(inp.value, i); const b = el('button', 'pk-stockcell'); b.innerHTML = `<img src="${url}" loading="lazy" alt="">`; b.onclick = () => { onPick(url); closePop(); }; grid.append(b); } };
      body.querySelectorAll('.pk-stab').forEach((t) => t.onclick = () => { src = t.dataset.s; body.querySelectorAll('.pk-stab').forEach((x) => x.classList.toggle('is-active', x === t)); fill(); });
      inp.addEventListener('input', () => fill());
      fill();
    } else {
      body.innerHTML = `<div class="pk-urlrow"><input class="ctl" type="text" placeholder="https://…" value="${(current || '').startsWith('data:') ? '' : (current || '')}" /></div><button class="pk-applyurl btn btn--primary" style="width:100%;justify-content:center">Use URL</button>`;
      const inp = body.querySelector('input');
      const go = () => { onPick(inp.value); closePop(); };
      body.querySelector('.pk-applyurl').onclick = go;
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    }
  }
  pop.querySelectorAll('[data-tab]').forEach((t) => t.onclick = () => { tab = t.dataset.tab; pop.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('is-active', x === t)); paint(); });
  paint();
}

/* ---------------- crop modal ---------------- */
export function openCropModal(src, onPick) {
  closePop();
  const layer = el('div', 'crop-layer');
  layer.innerHTML = `<div class="crop-back"></div>
    <div class="crop-card">
      <div class="crop-head"><span>Crop image</span>
        <div class="crop-aspects">${[['Free', 0], ['1:1', 1], ['4:3', 4 / 3], ['16:9', 16 / 9], ['3:4', 3 / 4]].map(([l, v], i) => `<button class="crop-asp${i === 0 ? ' is-active' : ''}" data-a="${v}">${l}</button>`).join('')}</div>
      </div>
      <div class="crop-stage"><img class="crop-img" src="${src}" crossorigin="anonymous"><div class="crop-box"><span class="crop-h nw"></span><span class="crop-h ne"></span><span class="crop-h sw"></span><span class="crop-h se"></span></div></div>
      <div class="crop-foot"><button class="btn btn--ghost crop-cancel">Cancel</button><button class="btn btn--primary crop-apply">Apply</button></div>
    </div>`;
  document.body.append(layer);
  const img = layer.querySelector('.crop-img');
  const box = layer.querySelector('.crop-box');
  let aspect = 0;
  const stage = layer.querySelector('.crop-stage');
  let crop = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }; // fractions of displayed image
  function layout() {
    const ir = img.getBoundingClientRect(); const sr = stage.getBoundingClientRect();
    const ox = ir.left - sr.left, oy = ir.top - sr.top;
    box.style.left = (ox + crop.x * ir.width) + 'px';
    box.style.top = (oy + crop.y * ir.height) + 'px';
    box.style.width = (crop.w * ir.width) + 'px';
    box.style.height = (crop.h * ir.height) + 'px';
  }
  img.onload = layout; if (img.complete) layout();
  window.addEventListener('resize', layout);
  // drag move
  box.addEventListener('pointerdown', (e) => {
    if (e.target.classList.contains('crop-h')) return;
    e.preventDefault(); box.setPointerCapture(e.pointerId);
    const ir = img.getBoundingClientRect(); const sx = e.clientX, sy = e.clientY; const c0 = { ...crop };
    const mv = (ev) => { crop.x = Math.max(0, Math.min(1 - c0.w, c0.x + (ev.clientX - sx) / ir.width)); crop.y = Math.max(0, Math.min(1 - c0.h, c0.y + (ev.clientY - sy) / ir.height)); layout(); };
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  });
  layer.querySelectorAll('.crop-h').forEach((handle) => handle.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation(); handle.setPointerCapture(e.pointerId);
    const ir = img.getBoundingClientRect(); const sx = e.clientX, sy = e.clientY; const c0 = { ...crop }; const h = handle.className.split(' ')[1];
    const mv = (ev) => {
      let dx = (ev.clientX - sx) / ir.width, dy = (ev.clientY - sy) / ir.height;
      let x = c0.x, y = c0.y, w = c0.w, hh = c0.h;
      if (h.includes('e')) w = Math.max(0.05, c0.w + dx);
      if (h.includes('w')) { w = Math.max(0.05, c0.w - dx); x = c0.x + (c0.w - w); }
      if (h.includes('s')) hh = Math.max(0.05, c0.h + dy);
      if (h.includes('n')) { hh = Math.max(0.05, c0.h - dy); y = c0.y + (c0.h - hh); }
      if (aspect) { hh = (w * ir.width / aspect) / ir.height; if (h.includes('n')) y = c0.y + (c0.h - hh); }
      crop = { x: Math.max(0, x), y: Math.max(0, y), w: Math.min(1 - Math.max(0, x), w), h: Math.min(1 - Math.max(0, y), hh) };
      layout();
    };
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  }));
  layer.querySelectorAll('.crop-asp').forEach((b) => b.onclick = () => { aspect = +b.dataset.a; layer.querySelectorAll('.crop-asp').forEach((x) => x.classList.toggle('is-active', x === b)); if (aspect) { const ir = img.getBoundingClientRect(); crop.h = (crop.w * ir.width / aspect) / ir.height; if (crop.y + crop.h > 1) crop.h = 1 - crop.y; layout(); } });
  const close = () => { window.removeEventListener('resize', layout); layer.remove(); };
  layer.querySelector('.crop-back').onclick = close;
  layer.querySelector('.crop-cancel').onclick = close;
  layer.querySelector('.crop-apply').onclick = () => {
    const nw = img.naturalWidth, nh = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = Math.round(crop.w * nw); cv.height = Math.round(crop.h * nh);
    const ctx = cv.getContext('2d');
    try {
      ctx.drawImage(img, crop.x * nw, crop.y * nh, crop.w * nw, crop.h * nh, 0, 0, cv.width, cv.height);
      onPick(cv.toDataURL('image/png'));
    } catch (e) { onPick(src); } // tainted (cross-origin) → keep original
    close();
  };
}
