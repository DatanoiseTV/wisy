/* ============================================================
   Page manager — multiple pages per project, each with its own
   node tree. Add, rename, duplicate, delete, reorder, switch.
   ============================================================ */
import { store, makeNode, uid, cloneNode } from './state.js';

let host;

export function initPages() {
  host = document.getElementById('panel-pages');
  store.on('page:change', render);
  store.on('change', render);
  store.on('doc:loaded', render);
  render();
}

export function newPage(name = 'New Page') {
  const root = makeNode('section', {}, { 'min-height': '100%', display: 'flex', 'flex-direction': 'column' });
  root.name = 'Page Root';
  return { id: uid('p'), name, path: slug(name) + '.html', root };
}
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page'; }

function render() {
  if (!host) return;
  host.innerHTML = `<div class="panel-head"><h2>Pages</h2>
    <button class="btn btn--ghost" id="add-page" style="height:26px;padding:0 8px"><svg viewBox="0 0 24 24" class="ic" style="width:14px;height:14px"><path d="M12 5v14M5 12h14"/></svg></button></div>`;
  host.querySelector('#add-page').onclick = () => {
    const p = newPage('Page ' + (store.doc.pages.length + 1));
    store.transaction(() => store.doc.pages.push(p));
    store.setActivePage(p.id);
  };
  const list = document.createElement('div'); list.className = 'pages-list';
  store.doc.pages.forEach((p) => list.append(pageCard(p)));
  host.append(list);
}

function pageCard(p) {
  const card = document.createElement('div');
  card.className = 'page-card' + (p.id === store.doc.activePageId ? ' is-active' : '');
  card.innerHTML = `
    <div class="page-card__thumb"><svg viewBox="0 0 24 24" class="ic" style="width:16px;height:16px"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6"/></svg></div>
    <div class="page-card__meta">
      <div class="page-card__name" contenteditable="true" spellcheck="false">${p.name}</div>
      <div class="page-card__path">/${p.path}</div>
    </div>
    <button class="page-card__act" data-act="dup" title="Duplicate"><svg viewBox="0 0 24 24" class="ic" style="width:14px;height:14px"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
    <button class="page-card__act" data-act="del" title="Delete"><svg viewBox="0 0 24 24" class="ic" style="width:14px;height:14px"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>`;
  card.addEventListener('click', (e) => { if (e.target.closest('[data-act]') || e.target.isContentEditable) return; store.setActivePage(p.id); });
  const nameEl = card.querySelector('.page-card__name');
  nameEl.addEventListener('blur', () => {
    const name = nameEl.innerText.trim() || 'Untitled';
    store.transaction(() => { p.name = name; p.path = slug(name) + '.html'; }, { rerender: false });
    render();
  });
  nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
  card.querySelector('[data-act="dup"]').onclick = (e) => {
    e.stopPropagation();
    const copy = { id: uid('p'), name: p.name + ' copy', path: slug(p.name + '-copy') + '.html', root: cloneNode(p.root, true) };
    store.transaction(() => { const i = store.doc.pages.indexOf(p); store.doc.pages.splice(i + 1, 0, copy); });
    store.setActivePage(copy.id);
  };
  card.querySelector('[data-act="del"]').onclick = (e) => {
    e.stopPropagation();
    if (store.doc.pages.length === 1) return;
    const i = store.doc.pages.indexOf(p);
    store.transaction(() => store.doc.pages.splice(i, 1));
    if (store.doc.activePageId === p.id) store.setActivePage(store.doc.pages[Math.max(0, i - 1)].id);
    else render();
  };
  return card;
}
