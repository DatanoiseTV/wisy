/* ============================================================
   Wisy — application bootstrap & toolbar wiring.
   ============================================================ */
import { store } from './state.js';
import { initCanvas, setViewport, setZoom, zoomBy, fitZoom, resetZoom } from './canvas.js';
import { initLibrary } from './library.js';
import { initInspector } from './inspector.js';
import { initLayers } from './layers.js';
import { initPages, newPage } from './pages.js';
import { initTemplatesPanel, applyTemplate, TEMPLATES } from './templates.js';
import { initThemeEditor } from './theme-editor.js';
import { getCodeBundle, previewActivePage, exportProject, highlight } from './export.js';
import { initTextbar } from './textbar.js';
import { confirmOnce } from './dialog.js';

const STORAGE_KEY = 'wisy.project.v1';

boot();

function boot() {
  store.load(loadDoc());
  initCanvas();
  initLibrary();
  initInspector();
  initLayers();
  initPages();
  initTemplatesPanel();
  initThemeEditor();
  initTextbar();
  wireRailTabs();
  wireToolbar();
  wireViewport();
  wireZoom();
  wireModal();
  wireShortcuts();
  wirePersistence();
  setViewport('desktop');
  // first render kicks once iframe is ready (canvas handles it)
}

/* ---------- document load / default ---------- */
function loadDoc() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const d = JSON.parse(raw); if (d?.pages?.length) return d; }
  } catch { /* ignore */ }
  return defaultDoc();
}
function defaultDoc() {
  const page = newPage('Home');
  const doc = { title: 'Untitled Project', themeId: 'studio', themeTokens: {}, pages: [page], activePageId: page.id };
  // seed with the SaaS template for a strong first impression
  const tpl = TEMPLATES.find((t) => t.id === 'saas');
  page.root = tpl.build();
  doc.themeId = tpl.theme; doc.themeTokens = {};
  return doc;
}

/* ---------- rail tab switching ---------- */
function wireRailTabs() {
  const tabs = document.querySelectorAll('.rail-tab');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    const name = tab.dataset.panel;
    tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
    document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('is-active', p.dataset.panel === name));
  }));
}

/* ---------- toolbar ---------- */
function wireToolbar() {
  const title = document.getElementById('doc-title');
  title.value = store.doc.title || 'Untitled Project';
  title.addEventListener('change', () => { store.transaction(() => { store.doc.title = title.value; }, { rerender: false }); });

  document.getElementById('btn-undo').addEventListener('click', () => store.undo());
  document.getElementById('btn-redo').addEventListener('click', () => store.redo());
  document.getElementById('btn-preview').addEventListener('click', () => previewActivePage());
  document.getElementById('btn-code').addEventListener('click', () => openCode());
  document.getElementById('btn-export').addEventListener('click', async () => {
    const n = await exportProject();
    toast(`Exported ${n} files`, 'ok');
  });

  const sync = () => {
    document.getElementById('btn-undo').disabled = !store.canUndo;
    document.getElementById('btn-redo').disabled = !store.canRedo;
  };
  store.on('change', sync); store.on('doc:loaded', sync); sync();
}

/* ---------- viewport ---------- */
function wireViewport() {
  document.querySelectorAll('.vp-btn').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.vp-btn').forEach((x) => x.classList.toggle('is-active', x === b));
    setViewport(b.dataset.viewport);
    store.emit('select', store.selectedId); // refresh inspector scope
  }));
}

/* ---------- zoom ---------- */
function wireZoom() {
  document.getElementById('zoom-in').addEventListener('click', () => zoomBy(1.25));
  document.getElementById('zoom-out').addEventListener('click', () => zoomBy(0.8));
  document.getElementById('zoom-fit').addEventListener('click', () => fitZoom());
  document.getElementById('zoom-val').addEventListener('click', () => resetZoom());
}

/* ---------- code modal ---------- */
function wireModal() {
  const modal = document.getElementById('modal');
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => { modal.hidden = true; }));
  document.getElementById('code-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.ctab'); if (!b) return;
    document.querySelectorAll('.ctab').forEach((t) => t.classList.toggle('is-active', t === b));
    showCode(b.dataset.code);
  });
  document.getElementById('btn-copy-code').addEventListener('click', () => {
    navigator.clipboard.writeText(window.__codeBundle?.[window.__codeTab || 'html'] || '');
    toast('Copied to clipboard', 'ok');
  });
  document.getElementById('btn-download-zip').addEventListener('click', async () => {
    const n = await exportProject(); toast(`Exported ${n} files`, 'ok');
  });
}
async function openCode() {
  const modal = document.getElementById('modal');
  modal.hidden = false;
  document.getElementById('code-out').textContent = 'Generating…';
  window.__codeBundle = await getCodeBundle();
  document.querySelectorAll('.ctab').forEach((t, i) => t.classList.toggle('is-active', i === 0));
  showCode('html');
}
function showCode(which) {
  window.__codeTab = which;
  const code = window.__codeBundle?.[which] || '';
  document.getElementById('code-out').innerHTML = highlight(code, which);
}

/* ---------- keyboard ---------- */
function wireShortcuts() {
  window.addEventListener('keydown', (e) => {
    const t = e.target;
    const typing = t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName);
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? store.redo() : store.undo(); return; }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); store.redo(); return; }
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); persistNow(); toast('Saved locally', 'ok'); return; }
    if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomBy(1.25); return; }
    if (mod && e.key === '-') { e.preventDefault(); zoomBy(0.8); return; }
    if (mod && e.key === '0') { e.preventDefault(); resetZoom(); return; }
    if (mod && e.key === '1') { e.preventDefault(); fitZoom(); return; }
    if (typing) return;
    if (mod && e.key.toLowerCase() === 'd' && store.selectedId) { e.preventDefault(); store.duplicate(store.selectedId); return; }
    // OS-native delete: Delete (Win/Linux), Backspace + Cmd/Ctrl+Backspace (macOS)
    if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedId) { e.preventDefault(); requestDelete(store.selectedId); return; }
    if (e.key === 'Escape') { store.select(null); }
  });
}

/* ---------- delete with first-time warning ---------- */
async function requestDelete(id) {
  const node = store.findNode(id)?.node;
  if (!node) return;
  const label = node.name || node.type;
  const ok = await confirmOnce('delete-element', 'Delete element?', {
    message: `Delete “${label}”? You can undo this with ${navigator.platform.includes('Mac') ? '⌘Z' : 'Ctrl+Z'}.`,
    confirmText: 'Delete', danger: true,
  });
  if (ok) store.remove(id);
}
store.on('request-delete', requestDelete);

/* ---------- persistence ---------- */
let saveTimer = null;
function wirePersistence() {
  store.on('persist', () => { clearTimeout(saveTimer); saveTimer = setTimeout(persistNow, 400); });
  window.addEventListener('beforeunload', persistNow);
}
function persistNow() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: store.doc.title, themeId: store.doc.themeId, themeTokens: store.doc.themeTokens, pages: store.doc.pages, activePageId: store.doc.activePageId }));
  } catch { /* quota */ }
}

/* ---------- toast ---------- */
let toastTimer = null;
function toast(msg, kind) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (kind ? ' toast--' + kind : '');
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); }, 2200);
}
window.__wisyToast = toast;
window.__wisy = { store }; // debug/testing handle
