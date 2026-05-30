/* ============================================================
   Wisy — application bootstrap & toolbar wiring.
   ============================================================ */
import { store } from './state.js';
import { initCanvas, setViewport, setDevice, setTryMode, isTryMode, setZoom, zoomBy, fitZoom, resetZoom } from './canvas.js';
import { DEVICES, DEFAULT_DEVICE } from './state.js';
import { initLibrary } from './library.js';
import { initInspector } from './inspector.js';
import { initLayers } from './layers.js';
import { initPages, newPage } from './pages.js';
import { initTemplatesPanel, applyTemplate, TEMPLATES } from './templates.js';
import { initThemeEditor } from './theme-editor.js';
import { getCodeBundle, previewActivePage, exportProject, highlight } from './export.js';
import { initTextbar } from './textbar.js';
import { confirmOnce } from './dialog.js';
import { initWizard } from './wizard.js';

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
  initWizard();
  wireRailTabs();
  wireToolbar();
  wireViewport();
  wireZoom();
  wireTry();
  wireFile();
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

/* ---------- viewport + device ---------- */
function wireViewport() {
  const sel = document.getElementById('device-select');
  // group devices by kind
  const kinds = { desktop: 'Desktop', tablet: 'Tablet', phone: 'Phone' };
  const groups = {};
  for (const k in DEVICES) (groups[DEVICES[k].kind] ||= []).push([k, DEVICES[k]]);
  ['desktop', 'tablet', 'phone'].forEach((kind) => {
    const og = document.createElement('optgroup'); og.label = kinds[kind];
    (groups[kind] || []).forEach(([key, d]) => { const o = document.createElement('option'); o.value = key; o.textContent = d.h ? `${d.label}  ·  ${d.w}×${d.h}` : `${d.label}  ·  ${d.w}`; og.append(o); });
    sel.append(og);
  });
  sel.value = store.device;
  sel.addEventListener('change', () => { setDevice(sel.value); syncVpButtons(); store.emit('select', store.selectedId); });

  document.querySelectorAll('.vp-btn').forEach((b) => b.addEventListener('click', () => {
    setDevice(DEFAULT_DEVICE[b.dataset.viewport]);
    sel.value = store.device; syncVpButtons();
    store.emit('select', store.selectedId);
  }));
  store.on('device:change', () => { sel.value = store.device; syncVpButtons(); });
}
function syncVpButtons() {
  const bp = DEVICES[store.device]?.bp || 'desktop';
  document.querySelectorAll('.vp-btn').forEach((x) => x.classList.toggle('is-active', x.dataset.viewport === bp));
}

/* ---------- try mode ---------- */
function wireTry() {
  const btn = document.getElementById('btn-try');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const on = !isTryMode();
    setTryMode(on);
    btn.classList.toggle('is-active', on);
    btn.querySelector('span').textContent = on ? 'Editing' : 'Try';
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isTryMode()) { setTryMode(false); btn.classList.remove('is-active'); btn.querySelector('span').textContent = 'Try'; } });
}

/* ---------- file: new / open / save ---------- */
function wireFile() {
  document.getElementById('btn-new').addEventListener('click', async () => {
    const ok = await confirmOnce('new-project', 'New project?', { message: 'Start a fresh project. Your current work is saved in this browser but will be replaced in the editor.', confirmText: 'New project' });
    if (!ok) return;
    store.load(blankDoc());
    document.getElementById('doc-title').value = store.doc.title;
    toast('New project', 'ok');
  });
  document.getElementById('btn-save').addEventListener('click', () => {
    const data = JSON.stringify({ wisy: 1, ...store.doc }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = (store.doc.title || 'wisy-project').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.wisy.json';
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 20000);
    toast('Project saved', 'ok');
  });
  const input = document.getElementById('open-input');
  document.getElementById('btn-open').addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    const file = input.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d.pages?.length) throw new Error('Not a Wisy project');
        store.load(d); document.getElementById('doc-title').value = store.doc.title || 'Untitled Project';
        toast('Project opened', 'ok');
      } catch (e) { toast('Could not open: ' + e.message, 'err'); }
      input.value = '';
    };
    r.readAsText(file);
  });
}
function blankDoc() {
  const page = newPage('Home');
  return { title: 'Untitled Project', themeId: 'studio', themeTokens: {}, pages: [page], activePageId: page.id };
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
