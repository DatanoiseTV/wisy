/* ============================================================
   Wisy canvas — the design surface.
   Renders the document inside an <iframe> for true isolation
   and accurate responsive behavior. Selection chrome, drag-to-
   insert, drag-to-reorder, resize and inline editing are drawn
   in an overlay layered above the frame.
   ============================================================ */
import { store, VIEWPORT_WIDTH, DEVICES, DEFAULT_DEVICE } from './state.js';
import { renderNode, BASE_CSS, EDITOR_CSS, buildDocCss } from './render.js';
import { REG } from './registry.js';
import { DEFAULT_TOKENS, tokensToCss, fontsFromTokens } from './themes.js';
import { googleFontsHref } from './fontlib.js';
import { updateTextbar } from './textbar.js';

let frame, overlay, stageFrame, stageSizer, stageScroll, emptyEl, zoomVal;
let fdoc, fwin, mount, sBase, sTheme, sDoc, fontLink;
let ready = false;
let hoverWid = null;
let dragState = null;
let editingEl = null;
export function isEditing() { return !!editingEl; }
function cleanHtml(html) {
  const allowed = { B: 'strong', STRONG: 'strong', I: 'em', EM: 'em', U: 'u', A: 'a', BR: 'br' };
  const tmp = document.createElement('div'); tmp.innerHTML = html;
  const walk = (node) => {
    const out = document.createDocumentFragment();
    node.childNodes.forEach((ch) => {
      if (ch.nodeType === 3) out.append(document.createTextNode(ch.textContent));
      else if (ch.nodeType === 1) {
        const tag = allowed[ch.tagName];
        if (tag === 'br') out.append(document.createElement('br'));
        else if (tag) {
          const el = document.createElement(tag);
          if (tag === 'a' && ch.getAttribute('href')) el.setAttribute('href', ch.getAttribute('href'));
          el.append(walk(ch)); out.append(el);
        } else out.append(walk(ch));
      }
    });
    return out;
  };
  const box = document.createElement('div'); box.append(walk(tmp));
  return box.innerHTML.replace(/ /g, ' ').trim();
}
let userZoom = null;        // null → auto-fit width; number → manual
const ZMIN = 0.1, ZMAX = 4;
let animCleanup = null;
function clearAnimState() {
  try {
    fdoc.documentElement.classList.remove('wc-anim-on');
    fdoc.querySelectorAll('[data-anim]').forEach((el) => { el.classList.remove('wc-inview'); el.__wa = false; });
  } catch { /* */ }
}

const widgetsCssUrl = new URL('../styles/widgets.css', import.meta.url).href;
const widgetsJsUrl = new URL('./widgets.js', import.meta.url).href;
const chartsJsUrl = new URL('./charts.js', import.meta.url).href;

export function initCanvas() {
  frame = document.getElementById('stage');
  overlay = document.getElementById('overlay');
  stageFrame = document.getElementById('stage-frame');
  stageSizer = document.getElementById('stage-sizer');
  stageScroll = document.getElementById('stage-scroll');
  emptyEl = document.getElementById('stage-empty');
  zoomVal = document.getElementById('zoom-val');

  const skeleton = `<!DOCTYPE html><html data-wisy-editor><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link id="wisy-fonts" rel="stylesheet" href="">
<link rel="stylesheet" href="${widgetsCssUrl}">
<style id="wisy-base"></style><style id="wisy-theme"></style><style id="wisy-doc"></style>
<script src="${widgetsJsUrl}"></scr` + `ipt>
<script type="module" src="${chartsJsUrl}"></scr` + `ipt>
</head><body><div id="wisy-root"></div></body></html>`;

  frame.addEventListener('load', () => {
    fdoc = frame.contentDocument; fwin = frame.contentWindow;
    mount = fdoc.getElementById('wisy-root');
    sBase = fdoc.getElementById('wisy-base');
    sTheme = fdoc.getElementById('wisy-theme');
    sDoc = fdoc.getElementById('wisy-doc');
    fontLink = fdoc.getElementById('wisy-fonts');
    sBase.textContent = BASE_CSS + '\n' + EDITOR_CSS;
    wireFrameEvents();
    ready = true;
    renderDoc();
  });
  frame.srcdoc = skeleton;

  // store subscriptions
  store.on('render', renderDoc);
  store.on('select', drawSelection);
  store.on('theme:change', () => { applyTheme(); });
  store.on('page:change', () => { setTimeout(renderDoc, 0); });
  store.on('inserted', (id) => { requestAnimationFrame(() => requestAnimationFrame(() => scrollNodeIntoView(id))); });
  store.on('anim:preview', () => {
    requestAnimationFrame(() => {
      fwin?.WisyAnim?.replay();
      clearTimeout(animCleanup);
      animCleanup = setTimeout(clearAnimState, 2800);
    });
  });

  window.addEventListener('resize', () => { applyZoom(); drawSelection(); });
  stageScroll.addEventListener('scroll', () => drawSelection());
  // ctrl/cmd + wheel to zoom (design-tool convention)
  stageScroll.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const cur = store.zoom || 1;
    setZoom(cur * (e.deltaY < 0 ? 1.1 : 0.9));
  }, { passive: false });

  // start the floating drag listeners (used by library palette)
  window.addEventListener('pointermove', onWindowDragMove);
  window.addEventListener('pointerup', onWindowDragUp);
}

/* ---------- rendering ---------- */
export function renderDoc() {
  if (!ready || !store.root) return;
  mount.innerHTML = '';
  store.root.children?.length === 0 ? mount.append(renderNode(store.root, { editor: true }))
    : mount.append(renderNode(store.root, { editor: true }));
  applyTheme();
  sDoc.textContent = buildDocCss(store.root);
  clearAnimState(); // keep designer view static; animations play via Replay/preview
  // let custom elements + layout settle, then size the frame to content
  requestAnimationFrame(() => { sizeFrame(); drawSelection(); });
  const total = countNodes(store.root);
  emptyEl.hidden = total > 1;
}
function countNodes(n) { return 1 + (n.children || []).reduce((s, c) => s + countNodes(c), 0); }

function familyName(v) {
  if (!v) return null;
  const m = String(v).match(/'([^']+)'|"([^"]+)"/);
  const fam = (m && (m[1] || m[2])) || String(v).split(',')[0].trim();
  if (!fam || /system-ui|serif|sans-serif|monospace|ui-monospace|Georgia|Menlo|inherit/i.test(fam)) return null;
  return fam;
}
function collectNodeFonts(node, set) {
  ['base', 'tablet', 'mobile'].forEach((k) => { const ff = node.style?.[k]?.['font-family']; const f = familyName(ff); if (f) set.add(f); });
  (node.children || []).forEach((c) => collectNodeFonts(c, set));
}
function applyTheme() {
  if (!ready) return;
  const tokens = { ...DEFAULT_TOKENS, ...(store.doc.themeTokens || {}) };
  sTheme.textContent = tokensToCss(store.doc.themeTokens || {});
  const fams = new Set(fontsFromTokens(tokens));
  if (store.root) collectNodeFonts(store.root, fams);
  const href = googleFontsHref([...fams]);
  if (href && fontLink.getAttribute('href') !== href) fontLink.setAttribute('href', href);
}

let contentH = 800;
function curDevice() { return DEVICES[store.device] || DEVICES.desktop; }
function sizeFrame() {
  if (!ready) return;
  const d = curDevice();
  if (deviceFixed) {
    contentH = d.h;
    frame.style.height = d.h + 'px';
    fdoc.documentElement.style.height = '100%';
    fdoc.body.style.height = '100%';
    fdoc.body.style.overflowY = 'auto';
    fdoc.body.style.overflowX = 'hidden';
  } else {
    fdoc.documentElement.style.height = '';
    fdoc.body.style.height = ''; fdoc.body.style.overflow = '';
    contentH = Math.max(fdoc.documentElement.scrollHeight, fdoc.body.scrollHeight, 400);
    frame.style.height = contentH + 'px';
  }
  applyZoom();
}

/* ---------- device + zoom ---------- */
export function setDevice(key) {
  if (!DEVICES[key]) key = 'desktop';
  store.device = key;
  store.viewport = DEVICES[key].bp;
  deviceFixed = !!DEVICES[key].h;
  userZoom = null; // refit
  const d = DEVICES[key];
  frame.classList.toggle('is-phone', d.kind === 'phone');
  frame.classList.toggle('is-tablet', d.kind === 'tablet');
  if (ready) { sizeFrame(); requestAnimationFrame(() => { sizeFrame(); drawSelection(); }); }
  store.emit('device:change', key);
}
export function setViewport(vp) { setDevice(DEFAULT_DEVICE[vp] || 'desktop'); }
function fitScale() {
  const d = curDevice();
  const availW = stageScroll.clientWidth - 80;
  const availH = stageScroll.clientHeight - 80;
  if (deviceFixed) return Math.min(1, availW / d.w, availH / d.h);
  return Math.min(1, availW / d.w);
}
function applyZoom() {
  const d = curDevice();
  const s = clamp(userZoom == null ? fitScale() : userZoom, ZMIN, ZMAX);
  store.zoom = s;
  const h = deviceFixed ? d.h : contentH;
  frame.style.width = d.w + 'px';
  stageFrame.style.transform = `scale(${s})`;
  stageSizer.style.width = (d.w * s) + 'px';
  stageSizer.style.height = (h * s) + 'px';
  overlay.style.width = (d.w * s) + 'px';
  overlay.style.height = (h * s) + 'px';
  if (zoomVal) zoomVal.textContent = Math.round(s * 100) + '%';
}
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

export function setZoom(z) { userZoom = clamp(z, ZMIN, ZMAX); applyZoom(); drawSelection(); }
export function zoomBy(f) { setZoom((store.zoom || 1) * f); }
export function fitZoom() { userZoom = null; applyZoom(); drawSelection(); }
export function resetZoom() { setZoom(1); }
export function getZoom() { return store.zoom || 1; }

// scroll the stage so a node is comfortably in view (used after insert).
// works in screen space so it accounts for stage padding + centering.
function scrollNodeIntoView(id) {
  if (!ready) return;
  const el = fdoc.querySelector(`[data-wid="${id}"]`); if (!el) return;
  const z = store.zoom || 1, pad = 48;
  const r = el.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  const view = stageScroll.getBoundingClientRect();
  const elTop = frameRect.top + r.top * z;
  const elBottom = frameRect.top + (r.top + r.height) * z;
  let delta = 0;
  if (elTop < view.top + pad) delta = elTop - (view.top + pad);
  else if (elBottom > view.bottom - pad) delta = elBottom - (view.bottom - pad);
  if (delta) stageScroll.scrollBy({ top: delta, behavior: 'smooth' });
}

/* ---------- frame interaction ---------- */
function wireFrameEvents() {
  fdoc.addEventListener('pointerdown', onFramePointerDown, true);
  fdoc.addEventListener('mousemove', onFrameHover);
  fdoc.addEventListener('mouseleave', () => { hoverWid = null; clearHover(); });
  fdoc.addEventListener('dblclick', onFrameDblClick);
  // block navigation on links/buttons inside canvas (except in Try mode)
  fdoc.addEventListener('click', (e) => { if (tryMode) return; const a = e.target.closest('a,button,form'); if (a) e.preventDefault(); }, true);
  fdoc.addEventListener('keydown', (e) => { if (e.key === 'Escape') e.target.blur?.(); });
  // wheel over the canvas should pan/zoom the STAGE (not trap inside the iframe),
  // unless we're in a fixed-size device frame (then scroll inside the device).
  fdoc.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom((store.zoom || 1) * (e.deltaY < 0 ? 1.1 : 0.9)); return; }
    if (deviceFixed || tryMode) { drawSelection(); return; }  // scroll inside the device/page
    e.preventDefault();
    stageScroll.scrollTop += e.deltaY;
    stageScroll.scrollLeft += e.deltaX;
  }, { passive: false });
  fwin.addEventListener('scroll', () => drawSelection());
}
let deviceFixed = false;
let tryMode = false;
export function isTryMode() { return tryMode; }
export function setTryMode(on) {
  tryMode = on;
  overlay.style.display = on ? 'none' : '';
  document.body.classList.toggle('is-try', on);
  if (!ready) return;
  if (on) {
    store.select(null);
    fdoc.documentElement.removeAttribute('data-wisy-editor');
    requestAnimationFrame(() => { fwin?.WisyAnim?.replay?.(); fwin?.WisyScroll?.refresh?.(); });
  } else {
    fdoc.documentElement.setAttribute('data-wisy-editor', '');
    clearAnimState();
    fwin?.WisyScroll?.clear?.();
    drawSelection();
  }
}

function widOf(el) { const w = el?.closest?.('[data-wid]'); return w ? w.getAttribute('data-wid') : null; }

function onFrameHover(e) {
  if (dragState || tryMode) return;
  const wid = widOf(e.target);
  if (wid === hoverWid) return;
  hoverWid = wid;
  drawHover();
}

function onFramePointerDown(e) {
  if (tryMode || e.target.isContentEditable) return;
  const wid = widOf(e.target);
  if (!wid) { store.select(null); return; }
  store.select(wid);
  if (e.button !== 0) return;
  // begin potential reorder drag
  const startX = e.clientX, startY = e.clientY;
  const el = fdoc.querySelector(`[data-wid="${wid}"]`);
  const pid = e.pointerId;
  let moving = false;
  const onMove = (ev) => {
    if (!moving && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 5) {
      moving = true;
      dragState = { mode: 'move', wid };
      try { el.setPointerCapture(pid); } catch { /* */ }
      el.style.opacity = '0.45';
      clearHover();
    }
    if (moving) {
      const target = computeDropTarget(ev.clientX, ev.clientY, wid);
      dragState.target = target;
      drawDropMarker(target);
    }
  };
  const onUp = () => {
    fdoc.removeEventListener('pointermove', onMove);
    fdoc.removeEventListener('pointerup', onUp);
    try { el.releasePointerCapture(pid); } catch { /* */ }
    if (moving) {
      el.style.opacity = '';
      clearDropMarker();
      const t = dragState?.target;
      dragState = null;
      if (t && t.parentId) store.move(wid, t.parentId, t.index);
    }
  };
  fdoc.addEventListener('pointermove', onMove);
  fdoc.addEventListener('pointerup', onUp);
}

function onFrameDblClick(e) {
  const editEl = e.target.closest('[data-edit]');
  if (!editEl) return;
  const host = editEl.closest('[data-wid]');
  if (!host) return;
  const wid = host.getAttribute('data-wid');
  const key = editEl.getAttribute('data-edit');
  startInlineEdit(editEl, wid, key);
}

function startInlineEdit(el, wid, key) {
  const rich = !!REG[store.findNode(wid)?.node?.type]?.rich;
  el.setAttribute('contenteditable', 'true');
  el.focus();
  editingEl = el;
  // select all
  const r = fdoc.createRange(); r.selectNodeContents(el);
  const sel = fwin.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  const finish = () => {
    el.removeAttribute('contenteditable');
    el.removeEventListener('blur', finish);
    el.removeEventListener('keydown', onKey);
    editingEl = null;
    const val = rich ? cleanHtml(el.innerHTML) : el.innerText.trim();
    store.updateProps(wid, { [key]: val });
  };
  const onKey = (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); el.blur(); }
    if (ev.key === 'Escape') { ev.preventDefault(); el.blur(); }
  };
  el.addEventListener('blur', finish);
  el.addEventListener('keydown', onKey);
}

/* ---------- drop target computation ---------- */
function frameCoords(clientX, clientY) {
  const r = frame.getBoundingClientRect();
  const z = store.zoom || 1;
  return { x: (clientX - r.left) / z, y: (clientY - r.top) / z };
}
function computeDropTarget(clientX, clientY, excludeWid) {
  // clientX/Y are in the iframe's own coordinate space already when called
  // from frame events; for window-drag we pass frame-space coords.
  const ix = dragState?.fromWindow ? clientX : clientX;
  const iy = dragState?.fromWindow ? clientY : clientY;
  let el = fdoc.elementFromPoint(ix, iy);
  if (!el) return rootDrop();
  // find nearest container
  let container = el.closest('[data-wid]');
  while (container) {
    const wid = container.getAttribute('data-wid');
    const type = store.findNode(wid)?.node?.type;
    if (type && REG[type]?.container && wid !== excludeWid) break;
    container = container.parentElement?.closest('[data-wid]');
  }
  if (!container) return rootDrop();
  const cwid = container.getAttribute('data-wid');
  const def = REG[store.findNode(cwid).node.type];
  const slotSel = def.slot;
  const slot = slotSel ? container.querySelector(slotSel) : container;
  const kids = [...slot.children].filter((c) => c.hasAttribute?.('data-wid') && c.getAttribute('data-wid') !== excludeWid);
  const vertical = getComputedStyle(slot).flexDirection !== 'row';
  let index = kids.length;
  let markRect = null;
  for (let i = 0; i < kids.length; i++) {
    const kr = kids[i].getBoundingClientRect();
    const mid = vertical ? kr.top + kr.height / 2 : kr.left + kr.width / 2;
    const p = vertical ? iy : ix;
    if (p < mid) {
      index = i;
      markRect = { x: kr.left, y: kr.top, w: kr.width, h: kr.height, before: true, vertical };
      break;
    }
  }
  if (markRect === null) {
    if (kids.length) {
      const kr = kids[kids.length - 1].getBoundingClientRect();
      markRect = { x: kr.left, y: kr.top, w: kr.width, h: kr.height, before: false, vertical };
    } else {
      const cr = slot.getBoundingClientRect();
      markRect = { x: cr.left + 6, y: cr.top + 6, w: cr.width - 12, h: cr.height - 12, inside: true, vertical };
    }
  }
  // real children index (accounting for excluded element removed from view list)
  const realKids = [...slot.children].filter((c) => c.hasAttribute?.('data-wid'));
  let realIndex = index;
  if (excludeWid) {
    const exEl = slot.querySelector(`:scope > [data-wid="${excludeWid}"]`);
    if (exEl) { const exPos = realKids.indexOf(exEl); if (exPos !== -1 && exPos < index) realIndex = index + 1; }
  }
  return { parentId: cwid, index: realIndex, mark: markRect };
}
function rootDrop() {
  const r = store.root;
  return { parentId: r.id, index: (r.children || []).length, mark: null };
}

/* ---------- overlay drawing ---------- */
function px(v) { return (v * (store.zoom || 1)) + 'px'; }
export function drawSelection() {
  if (!ready) return;
  clearSelection();
  const id = store.selectedId;
  if (!id) { drawHover(); updateTextbar(null); return; }
  const el = fdoc.querySelector(`[data-wid="${id}"]`);
  if (!el) { updateTextbar(null); return; }
  const r = el.getBoundingClientRect();
  const node = store.findNode(id)?.node;
  const box = document.createElement('div');
  box.className = 'sel-box';
  setRect(box, r);
  const label = document.createElement('div');
  label.className = 'sel-label';
  label.textContent = (node?.name || REG[node?.type]?.label || node?.type || 'Element');
  label.style.left = px(r.left);
  if (r.top * (store.zoom || 1) < 20) { label.classList.add('sel-label--in'); label.style.top = px(r.top); }
  else label.style.top = px(r.top);
  overlay.append(box, label);
  // resize handles
  ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((h) => {
    const handle = document.createElement('div');
    handle.className = 'sel-handle'; handle.dataset.h = h;
    positionHandle(handle, r, h);
    handle.addEventListener('pointerdown', (e) => startResize(e, id, h));
    overlay.append(handle);
  });
  // delete affordance — appended LAST (on top of handles), placed clear of the corner
  if (node && node.id !== store.root.id) {
    const del = document.createElement('button');
    del.className = 'sel-del'; del.title = 'Delete';
    del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    positionDel(del, r);
    del.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); });
    del.addEventListener('click', (e) => { e.stopPropagation(); store.emit('request-delete', id); });
    overlay.append(del);
  }
  drawHover();
  // floating typography toolbar
  const fr = frame.getBoundingClientRect(); const z = store.zoom || 1;
  updateTextbar(node, { left: fr.left + r.left * z, top: fr.top + r.top * z, width: r.width * z, height: r.height * z }, { fwin, editing: !!editingEl });
}
function setRect(box, r) {
  const z = store.zoom || 1;
  box.style.left = r.left * z + 'px'; box.style.top = r.top * z + 'px';
  box.style.width = r.width * z + 'px'; box.style.height = r.height * z + 'px';
}
function positionHandle(el, r, h) {
  const z = store.zoom || 1;
  const x = { w: r.left, e: r.left + r.width, n: r.left + r.width / 2, s: r.left + r.width / 2 };
  const cx = h.includes('w') ? r.left : h.includes('e') ? r.left + r.width : r.left + r.width / 2;
  const cy = h.includes('n') ? r.top : h.includes('s') ? r.top + r.height : r.top + r.height / 2;
  el.style.left = (cx * z - 5) + 'px';
  el.style.top = (cy * z - 5) + 'px';
}
function positionDel(el, r) {
  const z = store.zoom || 1;
  el.style.left = ((r.left + r.width) * z - 22) + 'px';
  const above = r.top * z - 30;
  el.style.top = (above < 4 ? r.top * z + 6 : above) + 'px'; // keep inside when at canvas top
}
// reposition existing selection chrome without rebuilding (used during resize/scroll)
function repositionSelection() {
  const id = store.selectedId; if (!id) return;
  const el = fdoc.querySelector(`[data-wid="${id}"]`); if (!el) return;
  const r = el.getBoundingClientRect();
  const box = overlay.querySelector('.sel-box'); if (box) setRect(box, r);
  const label = overlay.querySelector('.sel-label'); if (label) { label.style.left = px(r.left); label.style.top = px(r.top); }
  overlay.querySelectorAll('.sel-handle').forEach((h) => positionHandle(h, r, h.dataset.h));
  const del = overlay.querySelector('.sel-del'); if (del) positionDel(del, r);
}
function clearSelection() { overlay.querySelectorAll('.sel-box,.sel-label,.sel-handle,.sel-del').forEach((e) => e.remove()); }

function drawHover() {
  clearHover();
  if (!hoverWid || hoverWid === store.selectedId || dragState) return;
  const el = fdoc.querySelector(`[data-wid="${hoverWid}"]`);
  if (!el) return;
  const box = document.createElement('div');
  box.className = 'hov-box';
  setRect(box, el.getBoundingClientRect());
  overlay.append(box);
}
function clearHover() { overlay.querySelectorAll('.hov-box').forEach((e) => e.remove()); }

function drawDropMarker(target) {
  clearDropMarker();
  if (!target || !target.mark) return;
  const z = store.zoom || 1;
  const m = target.mark;
  const el = document.createElement('div');
  el.className = 'drop-marker';
  if (m.inside) {
    el.style.left = m.x * z + 'px'; el.style.top = m.y * z + 'px';
    el.style.width = m.w * z + 'px'; el.style.height = m.h * z + 'px';
    el.style.background = 'transparent'; el.style.boxShadow = 'inset 0 0 0 2px var(--accent)';
    el.style.borderRadius = '8px';
  } else if (m.vertical) {
    const y = m.before ? m.y : m.y + m.h;
    el.style.left = m.x * z + 'px'; el.style.top = (y * z - 1.5) + 'px';
    el.style.width = m.w * z + 'px'; el.style.height = '3px';
  } else {
    const x = m.before ? m.x : m.x + m.w;
    el.style.left = (x * z - 1.5) + 'px'; el.style.top = m.y * z + 'px';
    el.style.width = '3px'; el.style.height = m.h * z + 'px';
  }
  overlay.append(el);
}
function clearDropMarker() { overlay.querySelectorAll('.drop-marker').forEach((e) => e.remove()); }

/* ---------- resize ---------- */
function startResize(e, id, handle) {
  e.preventDefault(); e.stopPropagation();
  const grip = e.currentTarget;           // the .sel-handle element
  const pid = e.pointerId;
  const el = fdoc.querySelector(`[data-wid="${id}"]`);
  const start = el.getBoundingClientRect();
  const sx = e.clientX, sy = e.clientY;
  const z = store.zoom || 1;
  let liveW = start.width, liveH = start.height, done = false;
  // capture so events keep flowing to the parent even when the cursor is over the iframe
  try { grip.setPointerCapture(pid); } catch { /* */ }
  const onMove = (ev) => {
    const dx = (ev.clientX - sx) / z, dy = (ev.clientY - sy) / z;
    liveW = Math.max(8, start.width + (handle.includes('e') ? dx : handle.includes('w') ? -dx : 0));
    liveH = Math.max(8, start.height + (handle.includes('s') ? dy : handle.includes('n') ? -dy : 0));
    if (handle.includes('e') || handle.includes('w')) el.style.width = Math.round(liveW) + 'px';
    if (handle.includes('s') || handle.includes('n')) el.style.height = Math.round(liveH) + 'px';
    repositionSelection();
  };
  const onUp = () => {
    if (done) return; done = true;
    grip.removeEventListener('pointermove', onMove);
    grip.removeEventListener('pointerup', onUp);
    grip.removeEventListener('pointercancel', onUp);
    window.removeEventListener('pointerup', onUp);
    try { grip.releasePointerCapture(pid); } catch { /* */ }
    const patch = {};
    if (handle.includes('e') || handle.includes('w')) patch.width = Math.round(liveW) + 'px';
    if (handle.includes('s') || handle.includes('n')) patch.height = Math.round(liveH) + 'px';
    store.updateStyle(id, patch);
  };
  // with pointer capture, events fire on the grip itself
  grip.addEventListener('pointermove', onMove);
  grip.addEventListener('pointerup', onUp);
  grip.addEventListener('pointercancel', onUp);
  window.addEventListener('pointerup', onUp);
}

/* ---------- library drag (called from library.js) ---------- */
export function beginInsertDrag(type, ev) {
  dragState = { mode: 'insert', type, fromWindow: true, ghost: makeGhost(type) };
  document.body.append(dragState.ghost);
  moveGhost(ev.clientX, ev.clientY);
}
function makeGhost(type) {
  const g = document.createElement('div');
  g.className = 'drag-ghost';
  g.textContent = REG[type]?.label || type;
  Object.assign(g.style, {
    position: 'fixed', zIndex: 9999, pointerEvents: 'none', background: 'var(--accent)',
    color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
    boxShadow: '0 8px 24px rgba(0,0,0,.4)', transform: 'translate(-50%,-140%)', opacity: '.95',
  });
  return g;
}
function moveGhost(x, y) { if (dragState?.ghost) { dragState.ghost.style.left = x + 'px'; dragState.ghost.style.top = y + 'px'; } }

function onWindowDragMove(e) {
  if (!dragState || dragState.mode !== 'insert') return;
  moveGhost(e.clientX, e.clientY);
  const fr = frame.getBoundingClientRect();
  if (e.clientX >= fr.left && e.clientX <= fr.right && e.clientY >= fr.top && e.clientY <= fr.bottom) {
    const { x, y } = frameCoords(e.clientX, e.clientY);
    const target = computeDropTarget(x, y, null);
    dragState.target = target;
    drawDropMarker(target);
  } else {
    dragState.target = null;
    clearDropMarker();
  }
}
function onWindowDragUp(e) {
  if (!dragState || dragState.mode !== 'insert') return;
  const { type, target, ghost } = dragState;
  ghost?.remove();
  clearDropMarker();
  dragState = null;
  if (target) {
    import('./registry.js').then(({ makeComponent }) => {
      const node = makeComponent(type);
      store.insert(node, target.parentId, target.index);
    });
  }
}

export function previewAnimations() { fwin?.WisyAnim?.replay(); }
export function getFrame() { return { fdoc, fwin }; }
