/* ============================================================
   Layers panel — the document outline. Select, collapse,
   drag-to-reorder/reparent, delete.
   ============================================================ */
import { store } from './state.js';
import { REG, icoSvg } from './registry.js';

let host;
const collapsed = new Set();
let dnd = null;

export function initLayers() {
  host = document.getElementById('panel-layers');
  store.on('render', render);
  store.on('select', highlight);
  store.on('page:change', render);
  render();
}

function render() {
  if (!host.classList.contains('is-active') && host.dataset.built) { host.dataset.dirty = '1'; }
  host.innerHTML = `<div class="panel-head"><h2>Layers</h2><span class="mini">${store.page?.name || ''}</span></div>`;
  const tree = document.createElement('div'); tree.className = 'tree';
  if (store.root) tree.append(...(store.root.children || []).map((c) => nodeRow(c, 0)));
  if (!store.root?.children?.length) tree.innerHTML = `<div class="insp-empty" style="padding:24px 16px;font-size:12px">Empty page — add components from Insert.</div>`;
  host.append(tree);
  host.dataset.built = '1';
  highlight();
}

function nodeRow(node, depth) {
  const def = REG[node.type] || {};
  const wrap = document.createElement('div');
  wrap.className = 'tree-node' + (collapsed.has(node.id) ? ' collapsed' : '');
  const row = document.createElement('div');
  row.className = 'tree-row';
  row.dataset.id = node.id;
  const hasKids = def.container && node.children?.length;
  row.innerHTML = `
    <span class="tree-caret">${hasKids ? '<svg viewBox="0 0 24 24" class="ic"><path d="M6 9l6 6 6-6"/></svg>' : ''}</span>
    <span class="tree-ic">${icoSvg(def.icon)}</span>
    <span class="tree-label">${node.name || def.label || node.type}</span>
    <button class="tree-vis" title="Delete"><svg viewBox="0 0 24 24" class="ic" style="width:13px;height:13px"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>`;
  row.querySelector('.tree-caret').addEventListener('click', (e) => { e.stopPropagation(); if (collapsed.has(node.id)) collapsed.delete(node.id); else collapsed.add(node.id); wrap.classList.toggle('collapsed'); });
  row.querySelector('.tree-label').addEventListener('click', () => store.select(node.id));
  row.querySelector('.tree-ic').addEventListener('click', () => store.select(node.id));
  row.querySelector('.tree-vis').addEventListener('click', (e) => { e.stopPropagation(); store.remove(node.id); });
  wireDnd(row, node);
  wrap.append(row);
  if (def.container && node.children?.length) {
    const kids = document.createElement('div'); kids.className = 'tree-children';
    node.children.forEach((c) => kids.append(nodeRow(c, depth + 1)));
    wrap.append(kids);
  }
  return wrap;
}

function wireDnd(row, node) {
  row.draggable = true;
  row.addEventListener('dragstart', (e) => { dnd = { id: node.id }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', node.id); });
  row.addEventListener('dragend', () => { dnd = null; clearMarks(); });
  row.addEventListener('dragover', (e) => {
    if (!dnd || dnd.id === node.id) return;
    e.preventDefault();
    clearMarks();
    const r = row.getBoundingClientRect();
    const def = REG[node.type];
    const rel = (e.clientY - r.top) / r.height;
    if (def?.container && rel > 0.3 && rel < 0.7) { row.classList.add('drop-inside'); dnd.mode = 'inside'; }
    else if (rel < 0.5) { row.classList.add('drop-before'); dnd.mode = 'before'; }
    else { row.classList.add('drop-after'); dnd.mode = 'after'; }
    dnd.over = node.id;
  });
  row.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!dnd || dnd.id === node.id) return;
    const t = store.findNode(dnd.over);
    if (!t) return;
    if (dnd.mode === 'inside') {
      store.move(dnd.id, dnd.over, (t.node.children || []).length);
    } else {
      const parent = t.parent || store.root;
      const idx = parent.children.indexOf(t.node) + (dnd.mode === 'after' ? 1 : 0);
      store.move(dnd.id, parent.id, idx);
    }
    dnd = null; clearMarks();
  });
}
function clearMarks() { host.querySelectorAll('.drop-before,.drop-after,.drop-inside').forEach((e) => e.classList.remove('drop-before', 'drop-after', 'drop-inside')); }

function highlight() {
  host.querySelectorAll('.tree-row').forEach((r) => r.classList.toggle('is-selected', r.dataset.id === store.selectedId));
}
