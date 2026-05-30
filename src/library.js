/* ============================================================
   Component library palette. Drag an item onto the canvas, or
   click to append it to the current selection / page root.
   ============================================================ */
import { REG, GROUPS, icoSvg, makeComponent } from './registry.js';
import { beginInsertDrag } from './canvas.js';
import { store } from './state.js';

export function initLibrary() {
  const panel = document.getElementById('panel-insert');
  panel.innerHTML = `
    <div class="search">
      <svg viewBox="0 0 24 24" class="ic"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
      <input id="lib-search" type="text" placeholder="Search components…" />
    </div>
    <div id="lib-body"></div>`;
  const body = panel.querySelector('#lib-body');
  const search = panel.querySelector('#lib-search');

  const byGroup = {};
  for (const type in REG) {
    const d = REG[type];
    (byGroup[d.group] ||= []).push(d);
  }

  function paint(filter = '') {
    const f = filter.trim().toLowerCase();
    body.innerHTML = '';
    GROUPS.forEach((group) => {
      const items = (byGroup[group] || []).filter((d) => !f || d.label.toLowerCase().includes(f) || d.type.includes(f));
      if (!items.length) return;
      const wrap = document.createElement('div');
      wrap.className = 'lib-group';
      wrap.innerHTML = `<div class="lib-group__title">${group}</div>`;
      const grid = document.createElement('div');
      grid.className = 'lib-grid';
      items.forEach((d) => grid.append(makeItem(d)));
      wrap.append(grid);
      body.append(wrap);
    });
    if (!body.children.length) body.innerHTML = `<div class="insp-empty">No components match “${filter}”.</div>`;
  }

  function makeItem(d) {
    const btn = document.createElement('button');
    btn.className = 'lib-item';
    btn.type = 'button';
    btn.innerHTML = `<span class="lib-item__icon">${icoSvg(d.icon)}</span><span class="lib-item__label">${d.label}</span>`;
    let dragging = false, suppressClick = false;
    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const sx = e.clientX, sy = e.clientY;
      const onMove = (ev) => {
        if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
          dragging = true;
          btn.classList.add('dragging');
          btn.setPointerCapture?.(e.pointerId);
          beginInsertDrag(d.type, ev);
        }
      };
      const onUp = () => {
        btn.removeEventListener('pointermove', onMove);
        btn.removeEventListener('pointerup', onUp);
        if (dragging) { dragging = false; suppressClick = true; btn.classList.remove('dragging'); }
      };
      btn.addEventListener('pointermove', onMove);
      btn.addEventListener('pointerup', onUp);
    });
    btn.addEventListener('click', () => {
      // a drag-drop already inserted via the canvas; don't also append on the trailing click
      if (suppressClick) { suppressClick = false; return; }
      appendComponent(d.type);
    });
    return btn;
  }

  search.addEventListener('input', () => paint(search.value));
  paint();
}

/* click-to-add: into selected container, else page root */
export function appendComponent(type) {
  const node = makeComponent(type);
  const sel = store.selected;
  let parentId = store.root.id, index = -1;
  if (sel) {
    const def = REG[sel.type];
    if (def?.container) parentId = sel.id;
    else { const r = store.findNode(sel.id); parentId = r.parent?.id || store.root.id; index = r.parent ? r.parent.children.indexOf(sel) + 1 : -1; }
  }
  store.insert(node, parentId, index);
}
