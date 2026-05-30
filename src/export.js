/* ============================================================
   Export — turn the document into clean, valid, dependency-free
   HTML5 + CSS + JS. Multi-page project as a downloadable ZIP
   (store-only, no external libs), plus live preview + code view.
   ============================================================ */
import { store } from './state.js';
import { renderNode, BASE_CSS, buildDocCss } from './render.js';
import { DEFAULT_TOKENS, tokensToCss, googleFontsHref } from './themes.js';

const widgetsCssUrl = new URL('../styles/widgets.css', import.meta.url).href;
const widgetsJsUrl = new URL('./widgets.js', import.meta.url).href;
let _assets = null;
async function assets() {
  if (_assets) return _assets;
  const [css, js] = await Promise.all([
    fetch(widgetsCssUrl).then((r) => r.text()),
    fetch(widgetsJsUrl).then((r) => r.text()),
  ]);
  _assets = { widgetsCss: css, widgetsJs: js };
  return _assets;
}

/* ---------- HTML serialization (pretty) ---------- */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const INLINE = new Set(['a', 'span', 'strong', 'em', 'b', 'i', 'code', 'small', 'sub', 'sup', 'label', 'abbr', 'mark']);
const OPAQUE = new Set(['svg', 'wisy-knob', 'wisy-slider', 'wisy-xy', 'wisy-toggle', 'wisy-meter', 'wisy-stepper', 'iframe', 'textarea']);

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

function openTag(el) {
  let s = '<' + el.tagName.toLowerCase();
  for (const a of el.attributes) {
    if (a.name === 'data-edit' || a.name === 'data-wid' || a.name === 'contenteditable') continue;
    if (a.name === 'data-slot') continue;
    s += a.value === '' ? ` ${a.name}` : ` ${a.name}="${escAttr(a.value)}"`;
  }
  return s + '>';
}
function formatEl(el, depth, out) {
  const pad = '  '.repeat(depth);
  const tag = el.tagName.toLowerCase();
  if (VOID.has(tag)) { out.push(pad + openTag(el)); return; }
  if (OPAQUE.has(tag)) {
    // keep on as few lines as possible; opaque innerHTML preserved
    const html = el.outerHTML.replace(/ data-(edit|wid|slot)="[^"]*"/g, '').replace(/ contenteditable="[^"]*"/g, '');
    out.push(pad + html.replace(/\n/g, '\n' + pad));
    return;
  }
  const kids = [...el.childNodes].filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));
  const onlyText = kids.length === 1 && kids[0].nodeType === 3;
  const allInline = kids.every((n) => n.nodeType === 3 || INLINE.has(n.tagName?.toLowerCase()));
  if (kids.length === 0) { out.push(pad + openTag(el) + `</${tag}>`); return; }
  if (onlyText || (allInline && el.textContent.length < 80)) {
    let inner = '';
    kids.forEach((n) => { inner += n.nodeType === 3 ? esc(n.textContent.trim()) : n.outerHTML.replace(/ data-(edit|wid|slot)="[^"]*"/g, ''); });
    out.push(pad + openTag(el) + inner + `</${tag}>`);
    return;
  }
  out.push(pad + openTag(el));
  kids.forEach((n) => { if (n.nodeType === 3) out.push('  '.repeat(depth + 1) + esc(n.textContent.trim())); else formatEl(n, depth + 1, out); });
  out.push(pad + `</${tag}>`);
}
function serialize(root, depth = 2) {
  const out = [];
  [...root.childNodes].filter((n) => n.nodeType === 1).forEach((n) => formatEl(n, depth, out));
  return out.join('\n');
}

/* render a page's body to clean HTML string */
function pageBodyHtml(page) {
  const rootEl = renderNode(page.root, { editor: false });
  const holder = document.createElement('div');
  holder.append(rootEl);
  return serialize(holder, 2);
}

/* ---------- file builders ---------- */
export function buildStylesCss(widgetsCss) {
  const tokens = store.doc.themeTokens || {};
  return `/* ---- Design tokens ---- */\n${tokensToCss(tokens)}\n\n` +
    `/* ---- Base & components ---- */\n${BASE_CSS.trim()}\n\n` +
    `/* ---- UI widgets ---- */\n${widgetsCss.trim()}\n`;
}

export function buildPageHtml(page, { single = false, widgetsCss = '', widgetsJs = '' } = {}) {
  const tokens = { ...DEFAULT_TOKENS, ...(store.doc.themeTokens || {}) };
  const fonts = googleFontsHref(tokens);
  const docCss = buildDocCss(page.root);
  const title = `${page.name} — ${store.doc.title || 'Wisy Project'}`;
  const head = [
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${esc(title)}</title>`,
    fonts ? `  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="stylesheet" href="${fonts}">` : '',
  ];
  let styleRefs, scriptRefs;
  if (single) {
    head.push(`  <style>\n${indent(buildStylesCss(widgetsCss), 4)}\n  </style>`);
    head.push(docCss ? `  <style>\n${indent(docCss, 4)}\n  </style>` : '');
    scriptRefs = `  <script>\n${indent(widgetsJs, 4)}\n  </scr` + `ipt>`;
  } else {
    head.push('  <link rel="stylesheet" href="styles.css">');
    head.push(docCss ? `  <style>\n${indent(docCss, 4)}\n  </style>` : '');
    scriptRefs = '  <script src="widgets.js" defer></scr' + 'ipt>';
  }
  const body = pageBodyHtml(page);
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head.filter(Boolean).join('\n')}
</head>
<body>
${body}
${scriptRefs}
</body>
</html>
`;
}
function indent(s, n) { const pad = ' '.repeat(n); return s.split('\n').map((l) => l ? pad + l : l).join('\n'); }

/* ---------- public actions ---------- */
export async function getCodeBundle() {
  const { widgetsCss, widgetsJs } = await assets();
  return {
    html: buildPageHtml(store.page, { widgetsCss, widgetsJs }),
    css: buildStylesCss(widgetsCss),
    js: widgetsJs,
  };
}

export async function previewActivePage() {
  const { widgetsCss, widgetsJs } = await assets();
  const html = buildPageHtml(store.page, { single: true, widgetsCss, widgetsJs });
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function exportProject() {
  const { widgetsCss, widgetsJs } = await assets();
  const files = [];
  files.push({ name: 'styles.css', content: buildStylesCss(widgetsCss) });
  files.push({ name: 'widgets.js', content: widgetsJs });
  store.doc.pages.forEach((p, i) => {
    const name = i === 0 ? 'index.html' : (p.path || `page-${i}.html`);
    files.push({ name, content: buildPageHtml(p, { widgetsCss, widgetsJs }) });
  });
  files.push({ name: 'README.md', content: readme() });
  const blob = zipStore(files);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (slug(store.doc.title) || 'wisy-site') + '.zip';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  return files.length;
}
function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function readme() {
  return `# ${store.doc.title || 'Wisy Project'}\n\nExported from Wisy. Static, dependency-free.\n\n## Files\n- \`index.html\` (+ any extra pages) — markup\n- \`styles.css\` — design tokens, components, widgets\n- \`widgets.js\` — interactive UI elements (knobs, sliders, XY pads…)\n\n## Run\nOpen \`index.html\`, or serve the folder:\n\n    npx serve .\n\nNo build step required.\n`;
}

/* ---------- minimal store-only ZIP (valid, no compression) ---------- */
function crc32(bytes) {
  let c = ~0;
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function zipStore(files) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const u16 = (n) => [n & 255, (n >> 8) & 255];
  const u32 = (n) => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
  for (const f of files) {
    const data = enc.encode(f.content);
    const name = enc.encode(f.name);
    const crc = crc32(data);
    const local = [...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)];
    chunks.push(new Uint8Array(local), name, data);
    central.push({ crc, size: data.length, name, offset });
    offset += local.length + name.length + data.length;
  }
  const cdStart = offset;
  let cdSize = 0;
  for (const c of central) {
    const head = [...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(c.crc), ...u32(c.size), ...u32(c.size), ...u16(c.name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(c.offset)];
    chunks.push(new Uint8Array(head), c.name);
    cdSize += head.length + c.name.length;
  }
  const end = [...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length), ...u32(cdSize), ...u32(cdStart), ...u16(0)];
  chunks.push(new Uint8Array(end));
  return new Blob(chunks, { type: 'application/zip' });
}

/* ---------- tiny HTML syntax highlighter for the code view ---------- */
export function highlight(code, lang) {
  let s = esc(code);
  if (lang === 'html') {
    s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-com">$1</span>')
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="tok-tag">$2</span>')
      .replace(/([\w-]+)=(&quot;.*?&quot;)/g, '<span class="tok-attr">$1</span>=<span class="tok-str">$2</span>');
  } else if (lang === 'css') {
    s = s.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>')
      .replace(/([.#:][\w-]+)(?=[^{}]*\{)/g, '<span class="tok-tag">$1</span>')
      .replace(/([\w-]+)(\s*:)/g, '<span class="tok-attr">$1</span>$2');
  } else {
    s = s.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, '<span class="tok-com">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|new|class|this|=&gt;|import|export|null|true|false)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/('[^']*'|"[^"]*"|`[^`]*`)/g, '<span class="tok-str">$1</span>');
  }
  return s;
}
