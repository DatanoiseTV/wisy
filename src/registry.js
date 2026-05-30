/* ============================================================
   Wisy component registry.
   Each component declares:
     - meta: label, group, icon
     - container: can hold children (renderer fills the slot)
     - props: parametric schema → drives the inspector
     - defaultProps / defaultStyle
     - render(node): builds a real HTML element (semantic HTML5)
   The SAME render runs in the editor canvas and in export, so
   what you see is exactly what ships.
   ============================================================ */
import { makeNode } from './state.js';
import { CHART_TYPES, chartDefaults } from './charts.js';
import { parseEmbed } from './embeds.js';
import { iconSVG } from './iconlib.js';
import { markdownToHtml, looksLikeMarkdown } from './markdown.js';

/* tiny hyperscript over real DOM (we're always in a browser) */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'class') el.className = attrs[k];
    else if (k === 'html') el.innerHTML = attrs[k];
    else if (k === 'style' && typeof attrs[k] === 'object') Object.assign(el.style, attrs[k]);
    else if (attrs[k] != null && attrs[k] !== false) el.setAttribute(k, attrs[k]);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
const edit = (el, key) => { el.setAttribute('data-edit', key); return el; };

/* icon library (stroke style, 24px viewBox path content) */
export const ICONS = {
  section: '<path d="M3 5h18M3 12h18M3 19h18"/>',
  container: '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  row: '<rect x="3" y="6" width="5" height="12" rx="1"/><rect x="10" y="6" width="5" height="12" rx="1"/><rect x="17" y="6" width="4" height="12" rx="1"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  stack: '<rect x="5" y="3" width="14" height="5" rx="1"/><rect x="5" y="10" width="14" height="5" rx="1"/><rect x="5" y="17" width="14" height="4" rx="1"/>',
  spacer: '<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>',
  divider: '<path d="M3 12h18"/>',
  heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
  text: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  button: '<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M8 12h8"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  icon: '<polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.5 5.5 21 7.5 13.5 2 9 9 9"/>',
  badge: '<path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.3 7.2 17l.9-5.4L4.2 7.7l5.4-.8z"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  card: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
  navbar: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M6 6.5h3M15 6.5h3"/>',
  hero: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 10h10M7 14h6"/>',
  feature: '<rect x="3" y="5" width="6" height="6" rx="1"/><rect x="3" y="13" width="6" height="6" rx="1"/><path d="M12 7h8M12 15h8M12 10h5M12 18h5"/>',
  cta: '<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="14" y="10" width="5" height="4" rx="2"/>',
  footer: '<rect x="3" y="15" width="18" height="5" rx="1"/><path d="M6 4h6M6 8h10"/>',
  stat: '<path d="M4 19V9M10 19V5M16 19v-7M22 19h-20"/>',
  form: '<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="11" width="18" height="4" rx="1"/><rect x="3" y="18" width="9" height="3" rx="1"/>',
  input: '<rect x="3" y="9" width="18" height="6" rx="2"/><path d="M7 12h2"/>',
  testimonial: '<path d="M7 7h4v4a4 4 0 0 1-4 4M14 7h4v4a4 4 0 0 1-4 4"/>',
  video: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
  knob: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4"/>',
  slider: '<path d="M4 12h16"/><circle cx="9" cy="12" r="3" fill="currentColor"/>',
  xy: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="14" cy="9" r="2.4" fill="currentColor"/>',
  toggle: '<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="3" fill="currentColor"/>',
  meter: '<rect x="6" y="3" width="4" height="18" rx="1"/><rect x="14" y="8" width="4" height="13" rx="1"/>',
  stepper: '<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 12h2M15 12h2"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18"/><circle cx="6.5" cy="5.5" r=".6" fill="currentColor"/>',
  tabbar: '<rect x="3" y="16" width="18" height="5" rx="1"/><circle cx="7" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="17" cy="18.5" r="1"/>',
  appbar: '<rect x="3" y="3" width="18" height="5" rx="1"/><path d="M6 5.5h2M16 5.5h2"/>',
  embed: '<path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12"/>',
  pricing: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  audio: '<circle cx="6" cy="17" r="3"/><path d="M9 17V5l12-2v12"/><circle cx="18" cy="15" r="3"/>',
  gallery: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  frame: '<rect x="3" y="3" width="18" height="18" rx="1"/><rect x="7" y="7" width="10" height="7" rx="1"/><path d="M7 18h10"/>',
  contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  track: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  release: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
  tour: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  chart: '<path d="M4 19V5M4 19h16M8 16V9M13 16V6M18 16v-4"/>',
  embed2: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z"/>',
};
export const icoSvg = (name) => `<svg viewBox="0 0 24 24" class="ic">${ICONS[name] || ICONS.container}</svg>`;

/* shared option lists */
const ALIGN = ['start', 'center', 'end', 'space-between', 'space-around'];
const ICON_GLYPHS = {
  star: '<polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.5 5.5 21 7.5 13.5 2 9 9 9"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  heart: '<path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  rocket: '<path d="M5 19c1-3 3-5 6-6M14 5c4-2 6 0 6 0s2 2 0 6c-2 4-7 7-9 7l-4-4c0-2 3-7 7-9z"/><circle cx="15" cy="9" r="1.4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
};
export const glyph = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_GLYPHS[name] || ICON_GLYPHS.star}</svg>`;

/* ---------------- the registry ---------------- */
export const REG = {};
function def(type, spec) { REG[type] = { type, ...spec }; }

/* === LAYOUT === */
def('section', {
  label: 'Section', group: 'Layout', icon: 'section', container: true,
  props: [{ key: 'tag', label: 'HTML tag', type: 'select', options: ['section', 'div', 'header', 'footer', 'main', 'article', 'aside', 'nav'] }],
  defaultProps: { tag: 'section' },
  defaultStyle: { padding: '64px 24px', display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '24px', 'background-color': 'var(--color-bg)' },
  render: (n) => h(n.props.tag || 'section', { class: 'wc-section' }),
});
def('container', {
  label: 'Container', group: 'Layout', icon: 'container', container: true,
  props: [],
  defaultStyle: { width: '100%', 'max-width': 'var(--container)', margin: '0 auto', display: 'flex', 'flex-direction': 'column', gap: '20px' },
  render: () => h('div', { class: 'wc-container' }),
});
def('row', {
  label: 'Row', group: 'Layout', icon: 'row', container: true,
  props: [
    { key: 'wrap', label: 'Wrap', type: 'bool' },
  ],
  defaultStyle: { display: 'flex', 'flex-direction': 'row', gap: '20px', 'align-items': 'stretch', 'justify-content': 'flex-start', 'flex-wrap': 'wrap' },
  render: () => h('div', { class: 'wc-row' }),
});
def('grid', {
  label: 'Grid', group: 'Layout', icon: 'grid', container: true,
  props: [{ key: 'cols', label: 'Columns', type: 'range', min: 1, max: 6, step: 1 }],
  defaultProps: { cols: 3 },
  defaultStyle: { display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '20px' },
  render: (n) => h('div', { class: 'wc-grid', style: { 'grid-template-columns': `repeat(${n.props.cols || 3}, minmax(0,1fr))` } }),
});
def('stack', {
  label: 'Stack', group: 'Layout', icon: 'stack', container: true,
  props: [],
  defaultStyle: { display: 'flex', 'flex-direction': 'column', gap: '12px' },
  render: () => h('div', { class: 'wc-stack' }),
});
def('spacer', {
  label: 'Spacer', group: 'Layout', icon: 'spacer',
  props: [{ key: 'size', label: 'Height', type: 'text' }],
  defaultProps: { size: '48px' },
  render: (n) => h('div', { class: 'wc-spacer', style: { height: n.props.size || '48px' }, 'aria-hidden': 'true' }),
});
def('divider', {
  label: 'Divider', group: 'Layout', icon: 'divider',
  props: [],
  defaultStyle: { width: '100%', height: '1px', 'background-color': 'var(--color-border)' },
  render: () => h('hr', { class: 'wc-divider' }),
});

/* === CONTENT === */
def('heading', {
  label: 'Heading', group: 'Content', icon: 'heading',
  props: [
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'level', label: 'Level', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },
  ],
  defaultProps: { text: 'A headline that earns attention', level: '2' },
  rich: true,
  defaultStyle: { margin: '0', color: 'var(--color-strong)', 'font-family': 'var(--font-display)', 'font-weight': 'var(--weight-heading)', 'line-height': 'var(--leading-tight)', 'letter-spacing': 'var(--tracking-tight)', 'font-size': 'var(--fs-2xl)' },
  render: (n) => edit(h('h' + (n.props.level || '2'), { class: 'wc-heading', html: n.props.text || '' }), 'text'),
});
def('text', {
  label: 'Text', group: 'Content', icon: 'text',
  props: [{ key: 'text', label: 'Text', type: 'textarea' }],
  defaultProps: { text: 'Write something meaningful here. Good copy is specific, concrete, and respects the reader’s time.\n\nSupports **markdown** — try `# headings`, lists, [links](#), and `code`.' },
  rich: true,
  defaultStyle: { margin: '0', color: 'var(--color-text)', 'line-height': 'var(--leading)', 'font-size': 'var(--fs-md)', 'max-width': '64ch' },
  render: (n) => {
    const raw = n.props.text || '';
    const html = looksLikeMarkdown(raw) ? markdownToHtml(raw) : raw;
    return edit(h('p', { class: 'wc-text wc-prose', html }), 'text');
  },
});
def('button', {
  label: 'Button', group: 'Content', icon: 'button',
  props: [
    { key: 'text', label: 'Label', type: 'text' },
    { key: 'href', label: 'Link', type: 'link' },
    { key: 'variant', label: 'Style', type: 'select', options: ['primary', 'secondary', 'ghost', 'outline'] },
    { key: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
  ],
  defaultProps: { text: 'Get started', href: '#', variant: 'primary', size: 'md' },
  render: (n) => edit(h('a', { class: `wc-btn wc-btn--${n.props.variant || 'primary'} wc-btn--${n.props.size || 'md'}`, href: n.props.href || '#' }, n.props.text || 'Button'), 'text'),
});
def('link', {
  label: 'Link', group: 'Content', icon: 'link',
  props: [
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'href', label: 'URL', type: 'link' },
  ],
  defaultProps: { text: 'Learn more →', href: '#' },
  defaultStyle: { color: 'var(--color-primary)', 'text-decoration': 'none', 'font-weight': '500' },
  render: (n) => edit(h('a', { class: 'wc-link', href: n.props.href || '#' }, n.props.text || 'link'), 'text'),
});
def('badge', {
  label: 'Badge', group: 'Content', icon: 'badge',
  props: [
    { key: 'text', label: 'Text', type: 'text' },
    { key: 'variant', label: 'Style', type: 'select', options: ['soft', 'solid', 'outline'] },
  ],
  defaultProps: { text: 'New', variant: 'soft' },
  render: (n) => edit(h('span', { class: `wc-badge wc-badge--${n.props.variant || 'soft'}` }, n.props.text || 'Badge'), 'text'),
});
def('icon', {
  label: 'Icon', group: 'Content', icon: 'icon',
  props: [
    { key: 'icon', label: 'Icon', type: 'iconpick' },
    { key: 'size', label: 'Size', type: 'range', min: 16, max: 96, step: 2 },
    { key: 'weight', label: 'Stroke', type: 'range', min: 1, max: 3, step: 0.25 },
  ],
  defaultProps: { icon: 'outline:sparkles', size: 28, weight: 1.8 },
  defaultStyle: { color: 'var(--color-primary)' },
  render: (n) => {
    const [set, name] = (n.props.icon || 'outline:star').split(':');
    return h('span', { class: 'wc-icon', style: { width: (n.props.size || 28) + 'px', height: (n.props.size || 28) + 'px' }, html: iconSVG(set, name, { size: n.props.size || 28, stroke: n.props.weight || 1.8 }) });
  },
});
def('list', {
  label: 'List', group: 'Content', icon: 'list',
  props: [
    { key: 'items', label: 'Items', type: 'list', columns: [{ label: 'Item' }], addLabel: 'Add item' },
    { key: 'ordered', label: 'Numbered', type: 'bool' },
    { key: 'marker', label: 'Bullet', type: 'select', options: ['check', 'dot', 'arrow', 'none'] },
  ],
  defaultProps: { items: 'Ships valid HTML5\nResponsive by default\nNo build step required', ordered: false, marker: 'check' },
  defaultStyle: { display: 'flex', 'flex-direction': 'column', gap: '10px', margin: '0', padding: '0', color: 'var(--color-text)', 'line-height': 'var(--leading)' },
  render: (n) => {
    const tag = n.props.ordered ? 'ol' : 'ul';
    const el = h(tag, { class: `wc-list wc-list--${n.props.marker || 'check'}` });
    (n.props.items || '').split('\n').filter((s) => s.trim()).forEach((line) => el.append(h('li', null, line.trim())));
    return el;
  },
});
def('image', {
  label: 'Image', group: 'Media', icon: 'image',
  props: [
    { key: 'src', label: 'Image', type: 'asset' },
    { key: 'alt', label: 'Alt text', type: 'text' },
    { key: 'fit', label: 'Fit', type: 'select', options: ['cover', 'contain', 'fill'] },
  ],
  defaultProps: { src: '', alt: 'Descriptive alt text', fit: 'cover' },
  defaultStyle: { width: '100%', 'border-radius': 'var(--radius)', display: 'block', height: 'auto' },
  render: (n) => {
    const src = n.props.src || placeholderImg();
    return h('img', { class: 'wc-image', src, alt: n.props.alt || '', loading: 'lazy', style: { 'object-fit': n.props.fit || 'cover' } });
  },
});
def('video', {
  label: 'Video', group: 'Media', icon: 'video',
  props: [{ key: 'src', label: 'Embed URL', type: 'text' }],
  defaultProps: { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  defaultStyle: { width: '100%', 'aspect-ratio': '16/9', 'border-radius': 'var(--radius)', overflow: 'hidden', border: '0' },
  render: (n) => h('iframe', { class: 'wc-video', src: n.props.src || '', allowfullscreen: 'true', loading: 'lazy', title: 'Embedded video' }),
});

def('mediaplayer', {
  label: 'Video player', group: 'Media', icon: 'video',
  props: [
    { key: 'src', label: 'Video URL', type: 'text' },
    { key: 'poster', label: 'Poster URL', type: 'text' },
  ],
  defaultProps: { src: '', poster: '' },
  defaultStyle: { width: '100%', 'border-radius': 'var(--radius)', display: 'block', background: '#000' },
  render: (n) => h('video', { class: 'wc-mediaplayer', src: n.props.src || '', poster: n.props.poster || placeholderImg(), controls: '', playsinline: '', preload: 'metadata' }),
});
def('imageframe', {
  label: 'Image frame', group: 'Media', icon: 'frame',
  props: [
    { key: 'src', label: 'Image', type: 'asset' },
    { key: 'caption', label: 'Caption', type: 'text' },
    { key: 'frame', label: 'Frame', type: 'select', options: ['shadow', 'border', 'polaroid', 'browser'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['cover', 'contain'] },
  ],
  defaultProps: { src: '', caption: 'A framed photograph', frame: 'polaroid', fit: 'cover' },
  render: (n) => {
    const fig = h('figure', { class: `wc-frame wc-frame--${n.props.frame || 'shadow'}` });
    if (n.props.frame === 'browser') fig.append(h('div', { class: 'wc-frame__bar' }, h('span', null), h('span', null), h('span', null)));
    fig.append(h('img', { src: n.props.src || placeholderImg(), alt: n.props.caption || '', loading: 'lazy', style: { 'object-fit': n.props.fit || 'cover' } }));
    if (n.props.caption && n.props.frame !== 'browser') fig.append(edit(h('figcaption', null, n.props.caption), 'caption'));
    return fig;
  },
});
def('gallery', {
  label: 'Gallery', group: 'Media', icon: 'gallery',
  props: [
    { key: 'images', label: 'Images', type: 'list', columns: [{ label: 'Image URL' }], addLabel: 'Add image' },
    { key: 'cols', label: 'Columns', type: 'range', min: 1, max: 6, step: 1 },
    { key: 'gap', label: 'Gap', type: 'range', min: 0, max: 40, step: 2 },
    { key: 'radius', label: 'Radius', type: 'text' },
  ],
  defaultProps: { images: '', cols: 3, gap: 10, radius: '8px' },
  defaultStyle: { width: '100%' },
  render: (n) => buildWidget('wisy-gallery', n.props),
});

/* === DATA / CHARTS === */
def('chart', {
  label: 'Chart', group: 'Data', icon: 'chart',
  props: [
    { key: 'type', label: 'Type', type: 'select', options: CHART_TYPES },
    { key: 'data', label: 'Data', type: 'list', columns: [{ label: 'Label' }, { label: 'Value', w: '64px' }], sep: ':', addLabel: 'Add point' },
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'palette', label: 'Palette (comma)', type: 'text' },
    { key: 'height', label: 'Height', type: 'range', min: 80, max: 480, step: 10 },
    { key: 'grid', label: 'Gridlines', type: 'bool' },
    { key: 'value', label: 'Value (gauge)', type: 'number' },
    { key: 'max', label: 'Max (gauge)', type: 'number' },
    { key: 'label', label: 'Center label', type: 'text' },
  ],
  defaultProps: chartDefaults('bar'),
  defaultStyle: { width: '100%' },
  render: (n) => buildWidget('wisy-chart', n.props),
});

def('mediaembed', {
  label: 'Embed', group: 'Media', icon: 'embed2',
  props: [
    { key: 'url', label: 'URL', type: 'text' },
    { key: 'privacy', label: 'Privacy mode', type: 'bool' },
  ],
  defaultProps: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', privacy: true },
  defaultStyle: { width: '100%', 'max-width': '720px' },
  render: (n) => {
    const el = h('div', { class: 'wc-mediaembed' });
    const r = parseEmbed(n.props.url || '', { privacy: n.props.privacy !== false });
    el.innerHTML = (r && r.ok) ? r.html : '<div style="padding:28px;border:1px dashed var(--color-border);border-radius:var(--radius);text-align:center;color:var(--color-muted)">Paste a YouTube · Vimeo · Spotify · SoundCloud · Maps · Figma · CodePen… URL</div>';
    return el;
  },
});

/* === MUSIC / ARTIST === */
def('audioplayer', {
  label: 'Audio player', group: 'Music', icon: 'audio',
  props: [
    { key: 'title', label: 'Track', type: 'text' },
    { key: 'artist', label: 'Artist', type: 'text' },
    { key: 'src', label: 'Audio URL', type: 'text' },
    { key: 'cover', label: 'Cover URL', type: 'text' },
    { key: 'color', label: 'Accent', type: 'color' },
  ],
  defaultProps: { title: 'Midnight Drive', artist: 'The Lumens', src: '', cover: '', color: '' },
  render: (n) => buildWidget('wisy-audio', n.props),
});
def('release', {
  label: 'Release', group: 'Music', icon: 'release',
  props: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'artist', label: 'Artist', type: 'text' },
    { key: 'type', label: 'Type', type: 'select', options: ['Album', 'Single', 'EP'] },
    { key: 'cover', label: 'Cover URL', type: 'text' },
    { key: 'links', label: 'Streaming (comma)', type: 'text' },
  ],
  defaultProps: { title: 'Neon Fields', artist: 'The Lumens', type: 'Album', cover: '', links: 'Spotify, Apple Music, Bandcamp' },
  render: (n) => {
    const links = h('div', { class: 'wc-release__links' });
    (n.props.links || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((l) => links.append(h('a', { class: 'wc-btn wc-btn--outline wc-btn--sm', href: '#' }, l)));
    return h('div', { class: 'wc-release' },
      h('div', { class: 'wc-release__cover', style: { 'background-image': `url("${n.props.cover || placeholderImg()}")` } }),
      h('div', { class: 'wc-release__info' },
        h('span', { class: 'wc-release__type' }, n.props.type || 'Album'),
        edit(h('h2', { class: 'wc-release__title' }, n.props.title || ''), 'title'),
        edit(h('p', { class: 'wc-release__artist' }, n.props.artist || ''), 'artist'),
        links));
  },
});
def('tracklist', {
  label: 'Track list', group: 'Music', icon: 'track',
  props: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'tracks', label: 'Tracks', type: 'list', columns: [{ label: 'Title' }, { label: 'Time', w: '60px' }], addLabel: 'Add track' },
  ],
  defaultProps: { title: 'Tracklist', tracks: 'Intro|1:12\nNeon Fields|3:48\nMidnight Drive|4:05\nAfterglow|3:21\nHome|5:02' },
  render: (n) => {
    const list = h('div', { class: 'wc-tracklist' });
    if (n.props.title) list.append(edit(h('h3', { class: 'wc-tracklist__title' }, n.props.title), 'title'));
    (n.props.tracks || '').split('\n').filter((l) => l.trim()).forEach((line, i) => {
      const [t, d] = line.split('|');
      list.append(h('div', { class: 'wc-track' },
        h('span', { class: 'wc-track__n' }, String(i + 1).padStart(2, '0')),
        h('span', { class: 'wc-track__play', html: glyph('music') }),
        h('span', { class: 'wc-track__title' }, (t || '').trim()),
        h('span', { class: 'wc-track__dur' }, (d || '').trim())));
    });
    return list;
  },
});
def('tour', {
  label: 'Tour dates', group: 'Music', icon: 'tour',
  props: [
    { key: 'title', label: 'Heading', type: 'text' },
    { key: 'dates', label: 'Dates', type: 'list', columns: [{ label: 'Date', w: '74px' }, { label: 'Venue' }, { label: 'City' }], addLabel: 'Add date' },
    { key: 'button', label: 'Button', type: 'text' },
  ],
  defaultProps: { title: 'On tour', dates: 'May 12|Paradiso|Amsterdam\nMay 15|Village Underground|London\nMay 19|Bataclan|Paris\nMay 24|Berghain|Berlin', button: 'Tickets' },
  render: (n) => {
    const wrap = h('div', { class: 'wc-tour' });
    if (n.props.title) wrap.append(edit(h('h3', { class: 'wc-tour__title' }, n.props.title), 'title'));
    (n.props.dates || '').split('\n').filter((l) => l.trim()).forEach((line) => {
      const [d, venue, city] = line.split('|');
      wrap.append(h('div', { class: 'wc-tour__row' },
        h('span', { class: 'wc-tour__date' }, (d || '').trim()),
        h('div', { class: 'wc-tour__place' }, h('strong', null, (venue || '').trim()), h('span', null, (city || '').trim())),
        h('a', { class: 'wc-btn wc-btn--primary wc-btn--sm', href: '#' }, n.props.button || 'Tickets')));
    });
    return wrap;
  },
});

/* === SECTIONS (high-level, parametric, multi-variant) === */
def('navbar', {
  label: 'Navbar', group: 'Sections', icon: 'navbar',
  props: [
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'links', label: 'Links', type: 'text' },
    { key: 'cta', label: 'Button', type: 'text' },
    { key: 'variant', label: 'Style', type: 'select', options: ['solid', 'glass', 'minimal'] },
  ],
  defaultProps: { brand: 'Acme', links: 'Product, Pricing, Docs, Blog', cta: 'Sign in', variant: 'solid' },
  render: (n) => {
    const nav = h('nav', { class: 'wc-navlinks' });
    (n.props.links || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((l) => nav.append(h('a', { href: '#' }, l)));
    return h('header', { class: `wc-navbar wc-navbar--${n.props.variant || 'solid'}` },
      h('div', { class: 'wc-navbar__inner' },
        h('a', { class: 'wc-navbar__brand', href: '#' }, n.props.brand || 'Brand'),
        nav,
        n.props.cta ? h('a', { class: 'wc-btn wc-btn--primary wc-btn--sm', href: '#' }, n.props.cta) : null,
      ));
  },
});
def('hero', {
  label: 'Hero', group: 'Sections', icon: 'hero',
  props: [
    { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { key: 'title', label: 'Title', type: 'textarea' },
    { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
    { key: 'primary', label: 'Primary CTA', type: 'text' },
    { key: 'secondary', label: 'Secondary CTA', type: 'text' },
    { key: 'align', label: 'Align', type: 'select', options: ['center', 'left'] },
    { key: 'variant', label: 'Style', type: 'select', options: ['gradient', 'plain', 'spotlight'] },
  ],
  defaultProps: {
    eyebrow: 'Introducing Wisy', title: 'Design software people actually love to use',
    subtitle: 'A parametric studio for websites, desktop apps and audio plugin UIs. Ship clean, valid, responsive code — no build step.',
    primary: 'Start free', secondary: 'Watch demo', align: 'center', variant: 'gradient',
  },
  render: (n) => {
    const a = n.props.align || 'center';
    return h('section', { class: `wc-hero wc-hero--${n.props.variant || 'gradient'} wc-hero--${a}` },
      h('div', { class: 'wc-hero__inner' },
        n.props.eyebrow ? h('span', { class: 'wc-hero__eyebrow' }, n.props.eyebrow) : null,
        edit(h('h1', { class: 'wc-hero__title' }, n.props.title || ''), 'title'),
        n.props.subtitle ? edit(h('p', { class: 'wc-hero__sub' }, n.props.subtitle), 'subtitle') : null,
        h('div', { class: 'wc-hero__cta' },
          n.props.primary ? h('a', { class: 'wc-btn wc-btn--primary wc-btn--lg', href: '#' }, n.props.primary) : null,
          n.props.secondary ? h('a', { class: 'wc-btn wc-btn--ghost wc-btn--lg', href: '#' }, n.props.secondary) : null,
        )));
  },
});
def('feature', {
  label: 'Feature grid', group: 'Sections', icon: 'feature',
  props: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'items', label: 'Features', type: 'list', columns: [{ label: 'Icon', type: 'select', options: Object.keys(ICON_GLYPHS) }, { label: 'Title' }, { label: 'Description' }], addLabel: 'Add feature' },
    { key: 'cols', label: 'Columns', type: 'range', min: 2, max: 4, step: 1 },
  ],
  defaultProps: {
    title: 'Everything you need to ship',
    items: 'bolt|Fast by default|No build step, instant load, clean output.\nlayers|Parametric|Every component is fully customizable.\nshield|Accessible|Semantic HTML5 and sensible defaults.',
    cols: 3,
  },
  render: (n) => {
    const grid = h('div', { class: 'wc-feature__grid', style: { 'grid-template-columns': `repeat(${n.props.cols || 3}, minmax(0,1fr))` } });
    (n.props.items || '').split('\n').filter((l) => l.trim()).forEach((line) => {
      const [g, t, d] = line.split('|');
      grid.append(h('div', { class: 'wc-feature__card' },
        h('span', { class: 'wc-feature__ic', html: glyph((g || 'star').trim()) }),
        h('h3', null, (t || '').trim()),
        h('p', null, (d || '').trim())));
    });
    return h('section', { class: 'wc-feature' },
      n.props.title ? edit(h('h2', { class: 'wc-feature__title' }, n.props.title), 'title') : null, grid);
  },
});
def('stat', {
  label: 'Stats', group: 'Sections', icon: 'stat',
  props: [{ key: 'items', label: 'Stats', type: 'list', columns: [{ label: 'Value', w: '88px' }, { label: 'Label' }], addLabel: 'Add stat' }],
  defaultProps: { items: '99.9%|Uptime\n12k+|Teams\n4.9/5|Rating\n<50ms|Latency' },
  render: (n) => {
    const row = h('div', { class: 'wc-stat__row' });
    (n.props.items || '').split('\n').filter((l) => l.trim()).forEach((line) => {
      const [v, l] = line.split('|');
      row.append(h('div', { class: 'wc-stat__item' }, h('div', { class: 'wc-stat__val' }, (v || '').trim()), h('div', { class: 'wc-stat__lbl' }, (l || '').trim())));
    });
    return h('section', { class: 'wc-stat' }, row);
  },
});
def('cta', {
  label: 'CTA banner', group: 'Sections', icon: 'cta',
  props: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    { key: 'button', label: 'Button', type: 'text' },
  ],
  defaultProps: { title: 'Ready to build something great?', subtitle: 'Join thousands of makers shipping with Wisy.', button: 'Get started free' },
  render: (n) => h('section', { class: 'wc-cta' },
    h('div', { class: 'wc-cta__inner' },
      edit(h('h2', null, n.props.title || ''), 'title'),
      n.props.subtitle ? edit(h('p', null, n.props.subtitle), 'subtitle') : null,
      n.props.button ? h('a', { class: 'wc-btn wc-btn--primary wc-btn--lg', href: '#' }, n.props.button) : null)),
});
def('testimonial', {
  label: 'Testimonial', group: 'Sections', icon: 'testimonial',
  props: [
    { key: 'quote', label: 'Quote', type: 'textarea' },
    { key: 'author', label: 'Author', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
  ],
  defaultProps: { quote: 'Wisy replaced three tools in our stack. The output is clean enough to hand straight to engineering.', author: 'Jordan Avery', role: 'Head of Design, Northwind' },
  render: (n) => h('figure', { class: 'wc-quote' },
    edit(h('blockquote', null, '“' + (n.props.quote || '') + '”'), 'quote'),
    h('figcaption', null, h('strong', null, n.props.author || ''), n.props.role ? h('span', null, n.props.role) : null)),
});
def('pricing', {
  label: 'Pricing', group: 'Sections', icon: 'pricing',
  props: [
    { key: 'plans', label: 'Plans', type: 'list', columns: [{ label: 'Name', w: '84px' }, { label: 'Price', w: '60px' }, { label: 'Features (; sep)' }], addLabel: 'Add plan' },
    { key: 'featured', label: 'Highlight #', type: 'range', min: 0, max: 4, step: 1 },
  ],
  defaultProps: { plans: 'Starter|$0|1 project;Community support;Basic export\nPro|$19|Unlimited projects;Priority support;Code export;Custom themes\nTeam|$49|Everything in Pro;Collaboration;SSO;Audit log', featured: 2 },
  render: (n) => {
    const row = h('div', { class: 'wc-pricing__row' });
    (n.props.plans || '').split('\n').filter((l) => l.trim()).forEach((line, i) => {
      const [name, price, feats] = line.split('|');
      const card = h('div', { class: 'wc-pricing__card' + ((i + 1) == n.props.featured ? ' is-featured' : '') },
        h('div', { class: 'wc-pricing__name' }, (name || '').trim()),
        h('div', { class: 'wc-pricing__price' }, (price || '').trim()),
        h('ul', { class: 'wc-pricing__feats' }, ...(feats || '').split(';').filter(Boolean).map((f) => h('li', null, f.trim()))),
        h('a', { class: 'wc-btn ' + ((i + 1) == n.props.featured ? 'wc-btn--primary' : 'wc-btn--outline'), href: '#' }, 'Choose'));
      row.append(card);
    });
    return h('section', { class: 'wc-pricing' }, row);
  },
});
def('footer', {
  label: 'Footer', group: 'Sections', icon: 'footer',
  props: [
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'tagline', label: 'Tagline', type: 'text' },
    { key: 'cols', label: 'Columns (title:a,b,c | ...)', type: 'textarea' },
  ],
  defaultProps: { brand: 'Acme', tagline: 'Building delightful software since 2024.', cols: 'Product: Features, Pricing, Changelog | Company: About, Careers, Contact | Legal: Privacy, Terms' },
  render: (n) => {
    const cols = h('div', { class: 'wc-footer__cols' });
    (n.props.cols || '').split('|').forEach((c) => {
      const [title, links] = c.split(':');
      const col = h('div', { class: 'wc-footer__col' }, h('h4', null, (title || '').trim()));
      (links || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((l) => col.append(h('a', { href: '#' }, l)));
      cols.append(col);
    });
    return h('footer', { class: 'wc-footer' },
      h('div', { class: 'wc-footer__top' },
        h('div', { class: 'wc-footer__brand' }, h('strong', null, n.props.brand || ''), h('p', null, n.props.tagline || '')), cols),
      h('div', { class: 'wc-footer__bottom' }, h('span', null, `© ${'2025'} ${n.props.brand || ''}. All rights reserved.`)));
  },
});

/* === FORM === */
def('form', {
  label: 'Form', group: 'Forms', icon: 'form', container: true,
  props: [{ key: 'action', label: 'Action URL', type: 'text' }],
  defaultStyle: { display: 'flex', 'flex-direction': 'column', gap: '14px', width: '100%', 'max-width': '420px' },
  render: (n) => h('form', { class: 'wc-form', action: n.props.action || '#', method: 'post' }),
});
def('input', {
  label: 'Input', group: 'Forms', icon: 'input',
  props: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'type', label: 'Type', type: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'textarea'] },
    { key: 'placeholder', label: 'Placeholder', type: 'text' },
  ],
  defaultProps: { label: 'Email', type: 'email', placeholder: 'you@company.com' },
  render: (n) => {
    const field = n.props.type === 'textarea'
      ? h('textarea', { class: 'wc-input', placeholder: n.props.placeholder || '', rows: '4' })
      : h('input', { class: 'wc-input', type: n.props.type || 'text', placeholder: n.props.placeholder || '' });
    return h('label', { class: 'wc-field' }, n.props.label ? h('span', { class: 'wc-field__label' }, n.props.label) : null, field);
  },
});

def('contact', {
  label: 'Contact form', group: 'Forms', icon: 'contact',
  props: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    { key: 'button', label: 'Button', type: 'text' },
    { key: 'action', label: 'Action URL', type: 'text' },
  ],
  defaultProps: { title: 'Get in touch', subtitle: 'We usually reply within a day.', button: 'Send message', action: '#' },
  render: (n) => {
    const f = h('form', { class: 'wc-contact', action: n.props.action || '#', method: 'post' });
    if (n.props.title) f.append(edit(h('h3', { class: 'wc-contact__title' }, n.props.title), 'title'));
    if (n.props.subtitle) f.append(edit(h('p', { class: 'wc-contact__sub' }, n.props.subtitle), 'subtitle'));
    const grid = h('div', { class: 'wc-contact__grid' });
    grid.append(
      h('label', { class: 'wc-field' }, h('span', { class: 'wc-field__label' }, 'Name'), h('input', { class: 'wc-input', type: 'text', placeholder: 'Your name', name: 'name' })),
      h('label', { class: 'wc-field' }, h('span', { class: 'wc-field__label' }, 'Email'), h('input', { class: 'wc-input', type: 'email', placeholder: 'you@email.com', name: 'email' })),
    );
    f.append(grid,
      h('label', { class: 'wc-field' }, h('span', { class: 'wc-field__label' }, 'Message'), h('textarea', { class: 'wc-input', rows: '4', placeholder: 'How can we help?', name: 'message' })),
      h('button', { class: 'wc-btn wc-btn--primary', type: 'submit' }, n.props.button || 'Send'));
    return f;
  },
});

/* === AUDIO / APP UI === */
function audioWidget(type, tag, spec) {
  def(type, { group: 'Audio / UI', ...spec, render: spec.render || ((n) => buildWidget(tag, n.props, spec.attrMap)) });
}
function buildWidget(tag, props, attrMap) {
  const el = document.createElement(tag);
  for (const k in props) {
    const attr = (attrMap && attrMap[k]) || k;
    if (props[k] === '' || props[k] == null) continue;
    el.setAttribute(attr, props[k]);
  }
  return el;
}
audioWidget('knob', 'wisy-knob', {
  label: 'Knob', icon: 'knob',
  props: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'min', label: 'Min', type: 'number' }, { key: 'max', label: 'Max', type: 'number' },
    { key: 'step', label: 'Step', type: 'number' }, { key: 'default', label: 'Default', type: 'number' },
    { key: 'size', label: 'Size', type: 'range', min: 44, max: 140, step: 2 },
    { key: 'unit', label: 'Unit', type: 'text' },
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'show-value', label: 'Show value', type: 'bool' },
  ],
  defaultProps: { label: 'Cutoff', value: 65, min: 0, max: 100, step: 1, default: 50, size: 76, unit: '', 'show-value': true },
});
audioWidget('slider', 'wisy-slider', {
  label: 'Slider', icon: 'slider',
  props: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'min', label: 'Min', type: 'number' }, { key: 'max', label: 'Max', type: 'number' },
    { key: 'step', label: 'Step', type: 'number' },
    { key: 'orient', label: 'Orientation', type: 'select', options: ['horizontal', 'vertical'] },
    { key: 'length', label: 'Length', type: 'range', min: 80, max: 320, step: 4 },
    { key: 'unit', label: 'Unit', type: 'text' },
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'show-value', label: 'Show value', type: 'bool' },
  ],
  defaultProps: { label: 'Gain', value: 70, min: 0, max: 100, step: 1, orient: 'horizontal', length: 200, 'show-value': true },
});
audioWidget('xy', 'wisy-xy', {
  label: 'XY Pad', icon: 'xy',
  props: [
    { key: 'x', label: 'X', type: 'number' }, { key: 'y', label: 'Y', type: 'number' },
    { key: 'label-x', label: 'X label', type: 'text' }, { key: 'label-y', label: 'Y label', type: 'text' },
    { key: 'size', label: 'Size', type: 'range', min: 120, max: 360, step: 4 },
    { key: 'color', label: 'Color', type: 'color' },
    { key: 'grid', label: 'Grid', type: 'bool' },
  ],
  defaultProps: { x: 0.4, y: 0.6, 'label-x': 'Freq', 'label-y': 'Res', size: 180, grid: true },
});
audioWidget('toggle', 'wisy-toggle', {
  label: 'Toggle', icon: 'toggle',
  props: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'on', label: 'On', type: 'bool' },
    { key: 'color', label: 'Color', type: 'color' },
  ],
  defaultProps: { label: 'Bypass', on: false },
});
audioWidget('meter', 'wisy-meter', {
  label: 'Meter', icon: 'meter',
  props: [
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'min', label: 'Min', type: 'number' }, { key: 'max', label: 'Max', type: 'number' },
    { key: 'orient', label: 'Orientation', type: 'select', options: ['vertical', 'horizontal'] },
    { key: 'length', label: 'Length', type: 'range', min: 60, max: 320, step: 4 },
    { key: 'segments', label: 'Segments', type: 'range', min: 0, max: 24, step: 1 },
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'color', label: 'Color', type: 'color' },
  ],
  defaultProps: { value: -8, min: -60, max: 6, orient: 'vertical', length: 120, segments: 14, label: 'L' },
});
audioWidget('stepper', 'wisy-stepper', {
  label: 'Stepper', icon: 'stepper',
  props: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'value', label: 'Value', type: 'number' },
    { key: 'min', label: 'Min', type: 'number' }, { key: 'max', label: 'Max', type: 'number' },
    { key: 'step', label: 'Step', type: 'number' }, { key: 'unit', label: 'Unit', type: 'text' },
  ],
  defaultProps: { label: 'Voices', value: 8, min: 1, max: 16, step: 1 },
});
def('panel', {
  label: 'Rack panel', group: 'Audio / UI', icon: 'panel', container: true,
  props: [{ key: 'title', label: 'Title', type: 'text' }],
  defaultProps: { title: 'OSCILLATOR' },
  defaultStyle: { background: 'linear-gradient(180deg, var(--color-surface), var(--color-surface-2))', border: '1px solid var(--color-border)', 'border-radius': 'var(--radius-lg)', padding: '18px', display: 'flex', 'flex-wrap': 'wrap', gap: '20px', 'align-items': 'flex-end', 'box-shadow': 'var(--shadow)' },
  render: (n) => {
    const el = h('div', { class: 'wc-panel' });
    if (n.props.title) el.append(h('div', { class: 'wc-panel__title' }, n.props.title));
    el.append(h('div', { class: 'wc-panel__slot', 'data-slot': '' }));
    return el;
  },
  slot: '[data-slot]',
});

/* === MOBILE === */
def('appbar', {
  label: 'App bar', group: 'Mobile', icon: 'appbar',
  props: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'left', label: 'Left glyph', type: 'select', options: ['', ...Object.keys(ICON_GLYPHS)] },
    { key: 'right', label: 'Right glyph', type: 'select', options: ['', ...Object.keys(ICON_GLYPHS)] },
  ],
  defaultProps: { title: 'Inbox', left: 'layers', right: 'bolt' },
  render: (n) => h('header', { class: 'wc-appbar' },
    h('button', { class: 'wc-appbar__btn', html: n.props.left ? glyph(n.props.left) : '' }),
    edit(h('div', { class: 'wc-appbar__title' }, n.props.title || ''), 'title'),
    h('button', { class: 'wc-appbar__btn', html: n.props.right ? glyph(n.props.right) : '' })),
});
def('tabbar', {
  label: 'Tab bar', group: 'Mobile', icon: 'tabbar',
  props: [{ key: 'items', label: 'Tabs', type: 'list', columns: [{ label: 'Icon', type: 'select', options: Object.keys(ICON_GLYPHS) }, { label: 'Label' }], addLabel: 'Add tab' }, { key: 'active', label: 'Active #', type: 'range', min: 1, max: 5, step: 1 }],
  defaultProps: { items: 'globe|Home\nlayers|Browse\nheart|Saved\nstar|Profile', active: 1 },
  render: (n) => {
    const bar = h('nav', { class: 'wc-tabbar' });
    (n.props.items || '').split('\n').filter((l) => l.trim()).forEach((line, i) => {
      const [g, l] = line.split('|');
      bar.append(h('button', { class: 'wc-tabbar__item' + ((i + 1) == n.props.active ? ' is-active' : '') },
        h('span', { class: 'wc-tabbar__ic', html: glyph((g || 'star').trim()) }), h('span', null, (l || '').trim())));
    });
    return bar;
  },
});

/* === ADVANCED === */
def('card', {
  label: 'Card', group: 'Layout', icon: 'card', container: true,
  props: [],
  defaultStyle: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', 'border-radius': 'var(--radius-lg)', padding: '24px', display: 'flex', 'flex-direction': 'column', gap: '12px', 'box-shadow': 'var(--shadow)' },
  render: () => h('div', { class: 'wc-card' }),
});
def('embed', {
  label: 'Embed / Code', group: 'Advanced', icon: 'embed',
  props: [{ key: 'html', label: 'HTML', type: 'textarea' }],
  defaultProps: { html: '<div style="padding:24px;text-align:center;border:1px dashed var(--color-border);border-radius:var(--radius)">Custom HTML / JS embed</div>' },
  render: (n) => { const el = h('div', { class: 'wc-embed' }); el.innerHTML = n.props.html || ''; return el; },
});

/* helpers */
function placeholderImg() {
  return "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='800' height='500' fill='#e8ecf2'/><path d='M0 380l250-180 180 130 140-110 230 160v120H0z' fill='#cfd8e3'/><circle cx='600' cy='130' r='60' fill='#cfd8e3'/></svg>`);
}

/* category order for the library palette */
export const GROUPS = ['Sections', 'Layout', 'Content', 'Media', 'Data', 'Music', 'Forms', 'Audio / UI', 'Mobile', 'Advanced'];

/* make a node with the registry defaults applied */
export function makeComponent(type) {
  const d = REG[type];
  if (!d) throw new Error('unknown component ' + type);
  const node = makeNode(type, d.defaultProps || {}, d.defaultStyle || {});
  if (d.container && !node.children) node.children = [];
  return node;
}
