/* ============================================================
   Templates — curated, production-quality starting points.
   Each build() returns a page-root node tree; some also set a
   matching theme preset.
   ============================================================ */
import { store, makeNode } from './state.js';
import { makeComponent } from './registry.js';
import { THEME_PRESETS } from './themes.js';

function comp(type, props = {}, style = {}, children = []) {
  const n = makeComponent(type);
  Object.assign(n.props, props);
  Object.assign(n.style.base, style);
  if (children.length) n.children = children;
  return n;
}
function pageRoot(children, style = {}) {
  const root = makeNode('section', {}, { padding: '0', gap: '0', 'align-items': 'stretch', width: '100%', display: 'flex', 'flex-direction': 'column', ...style });
  root.name = 'Page Root';
  root.children = children;
  return root;
}

export const TEMPLATES = [
  {
    id: 'saas', name: 'SaaS Landing', tag: 'Marketing', theme: 'studio',
    thumb: thumbSaas(),
    build: () => pageRoot([
      comp('navbar', { brand: 'Northwind', links: 'Product, Pricing, Customers, Docs', cta: 'Start free', variant: 'glass' }),
      comp('hero', { eyebrow: 'New · v2 is here', variant: 'gradient' }),
      comp('feature', {}),
      comp('stat', {}, { 'background-color': 'var(--color-surface)' }),
      comp('testimonial', {}),
      comp('pricing', {}),
      comp('cta', {}),
      comp('footer', {}),
    ]),
  },
  {
    id: 'portfolio', name: 'Portfolio', tag: 'Personal', theme: 'editorial',
    thumb: thumbPortfolio(),
    build: () => pageRoot([
      comp('navbar', { brand: 'Studio Avery', links: 'Work, About, Journal', cta: 'Contact', variant: 'minimal' }),
      comp('section', {}, { padding: '80px 24px 40px', 'align-items': 'flex-start', 'max-width': 'var(--container)', margin: '0 auto', gap: '16px' }, [
        comp('badge', { text: 'Independent design studio', variant: 'outline' }),
        comp('heading', { text: 'Brand & product design for people who care about craft.', level: '1' }, { 'font-size': 'var(--fs-4xl)', 'max-width': '20ch' }),
        comp('text', { text: 'We partner with founders and teams to design clear, distinctive products — from first sketch to shipped interface.' }, { 'font-size': '1.25rem', color: 'var(--color-muted)' }),
      ]),
      comp('section', {}, { padding: '24px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%' }, [
        comp('grid', { cols: 2 }, { 'grid-template-columns': 'repeat(2, minmax(0,1fr))', gap: '24px' }, [
          workCard('Aperture', 'Brand identity'),
          workCard('Cadence', 'Mobile app'),
          workCard('Lumen', 'Web platform'),
          workCard('Verde', 'Packaging'),
        ]),
      ]),
      comp('footer', { brand: 'Studio Avery', tagline: 'Design that respects the reader.', cols: 'Studio: Work, About, Journal | Contact: Email, Instagram, Dribbble' }),
    ]),
  },
  {
    id: 'plugin', name: 'Audio Plugin', tag: 'Audio UI', theme: 'synth',
    thumb: thumbPlugin(),
    build: () => pageRoot([
      comp('section', {}, { padding: '24px', gap: '20px', 'align-items': 'center', background: 'radial-gradient(120% 140% at 50% 0, var(--color-surface), var(--color-bg))', 'min-height': '100vh' }, [
        comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', width: '100%', 'max-width': '720px' }, [
          comp('heading', { text: 'POLYSYNTH — 8', level: '3' }, { 'font-family': 'var(--font-display)', 'letter-spacing': '0.15em', 'font-size': '1.1rem' }),
          comp('toggle', { label: 'Power', on: true, color: 'var(--color-primary)' }),
        ]),
        comp('panel', { title: 'OSCILLATOR' }, {}, [
          comp('knob', { label: 'Tune', value: 50, color: 'var(--color-primary)' }),
          comp('knob', { label: 'Fine', value: 20, color: 'var(--color-primary)' }),
          comp('knob', { label: 'Shape', value: 70, color: 'var(--color-accent)' }),
          comp('stepper', { label: 'Octave', value: 0, min: -3, max: 3, step: 1 }),
        ]),
        comp('row', {}, { gap: '20px', 'flex-wrap': 'wrap', 'justify-content': 'center', width: '100%', 'max-width': '720px' }, [
          comp('panel', { title: 'FILTER' }, { flex: '1' }, [
            comp('xy', { 'label-x': 'Cutoff', 'label-y': 'Reso', x: 0.5, y: 0.6, size: 150 }),
            comp('knob', { label: 'Drive', value: 35, color: 'var(--color-accent)' }),
          ]),
          comp('panel', { title: 'AMP' }, {}, [
            comp('slider', { label: 'A', orient: 'vertical', value: 20, length: 110 }),
            comp('slider', { label: 'D', orient: 'vertical', value: 40, length: 110 }),
            comp('slider', { label: 'S', orient: 'vertical', value: 70, length: 110 }),
            comp('slider', { label: 'R', orient: 'vertical', value: 30, length: 110 }),
            comp('meter', { label: 'OUT', segments: 14, value: -6 }),
          ]),
        ]),
      ]),
    ]),
  },
  {
    id: 'mobile', name: 'Mobile App', tag: 'App screen', theme: 'ocean',
    thumb: thumbMobile(),
    build: () => pageRoot([
      comp('appbar', { title: 'Discover', left: 'layers', right: 'heart' }),
      comp('section', {}, { padding: '18px', gap: '16px', 'align-items': 'stretch', flex: '1', 'background-color': 'var(--color-surface)' }, [
        comp('heading', { text: 'Good morning, Sam', level: '2' }, { 'font-size': 'var(--fs-xl)' }),
        comp('card', {}, { background: 'linear-gradient(120deg,var(--color-primary),var(--color-accent))', color: '#fff', border: '0' }, [
          comp('badge', { text: 'Featured', variant: 'solid' }, { background: 'rgba(255,255,255,.2)', color: '#fff', 'align-self': 'flex-start' }),
          comp('heading', { text: 'Your weekly mix is ready', level: '3' }, { color: '#fff' }),
          comp('button', { text: 'Listen now', variant: 'secondary' }, { 'align-self': 'flex-start' }),
        ]),
        appRow('Continue', '4 items'),
        appRow('Recently played', '12 items'),
        appRow('Made for you', '8 items'),
      ]),
      comp('tabbar', { items: 'globe|Home\nlayers|Browse\nmusic|Library\nstar|You', active: 1 }),
    ], { 'max-width': '420px', margin: '0 auto', 'box-shadow': 'var(--shadow-lg)', 'min-height': '100vh' }),
  },
  {
    id: 'blank', name: 'Blank', tag: 'Start fresh', theme: null,
    thumb: thumbBlank(),
    build: () => pageRoot([
      comp('section', {}, { padding: '80px 24px', gap: '20px', 'align-items': 'center' }, [
        comp('heading', { text: 'Start here', level: '1' }),
        comp('text', { text: 'Drag components from the left, or pick a different template.' }, { 'text-align': 'center' }),
      ]),
    ]),
  },
];

function workCard(title, tag) {
  return comp('card', {}, { padding: '0', overflow: 'hidden', gap: '0' }, [
    comp('image', { alt: title }, { 'border-radius': '0', 'aspect-ratio': '4/3' }),
    comp('stack', {}, { padding: '18px', gap: '4px' }, [
      comp('heading', { text: title, level: '3' }, { 'font-size': '1.2rem' }),
      comp('text', { text: tag }, { color: 'var(--color-muted)', 'font-size': '.9rem' }),
    ]),
  ]);
}
function appRow(title, meta) {
  return comp('row', {}, { 'align-items': 'center', gap: '12px', 'background-color': 'var(--color-bg)', padding: '12px', 'border-radius': 'var(--radius)', border: '1px solid var(--color-border)' }, [
    comp('icon', { glyph: 'music', size: 22 }, {}),
    comp('stack', {}, { gap: '2px', flex: '1' }, [
      comp('heading', { text: title, level: '4' }, { 'font-size': '.98rem' }),
      comp('text', { text: meta }, { color: 'var(--color-muted)', 'font-size': '.82rem', margin: '0' }),
    ]),
    comp('icon', { glyph: 'bolt', size: 18 }, { color: 'var(--color-muted)' }),
  ]);
}

export function initTemplatesPanel() {
  const host = document.getElementById('panel-templates');
  host.innerHTML = `<div class="panel-head"><h2>Templates</h2><span class="mini">Replaces current page</span></div>`;
  const list = document.createElement('div'); list.className = 'tpl-list';
  TEMPLATES.forEach((tpl) => {
    const card = document.createElement('div'); card.className = 'tpl-card';
    card.innerHTML = `<div class="tpl-card__preview">${tpl.thumb}</div>
      <div class="tpl-card__foot"><span class="tpl-card__name">${tpl.name}</span><span class="tpl-card__tag">${tpl.tag}</span></div>`;
    card.onclick = () => {
      const has = (store.root?.children || []).length > 0;
      if (has && !confirm(`Replace the current page with the “${tpl.name}” template?`)) return;
      applyTemplate(tpl);
    };
    list.append(card);
  });
  host.append(list);
}

export function applyTemplate(tpl) {
  store.transaction(() => {
    store.page.root = tpl.build();
    if (tpl.theme) {
      const preset = THEME_PRESETS.find((p) => p.id === tpl.theme);
      if (preset) { store.doc.themeId = preset.id; store.doc.themeTokens = { ...preset.tokens }; }
    }
  });
  store.select(null);
  store.emit('theme:change');
  store.emit('render');
}

/* thumbnails */
function svg(inner) { return `<svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`; }
function thumbSaas() { return svg(`<rect width="200" height="110" fill="#fff"/><rect width="200" height="14" fill="#f1f3f7"/><circle cx="14" cy="7" r="3" fill="#5b8cff"/><rect x="150" y="4" width="34" height="7" rx="3" fill="#5b8cff"/><rect x="40" y="30" width="120" height="10" rx="3" fill="#10141b"/><rect x="55" y="46" width="90" height="5" rx="2" fill="#c2cbd9"/><rect x="70" y="58" width="28" height="9" rx="4" fill="#5b8cff"/><rect x="102" y="58" width="28" height="9" rx="4" fill="#eef0f4"/><rect x="20" y="82" width="48" height="22" rx="4" fill="#f7f8fa"/><rect x="76" y="82" width="48" height="22" rx="4" fill="#f7f8fa"/><rect x="132" y="82" width="48" height="22" rx="4" fill="#f7f8fa"/>`); }
function thumbPortfolio() { return svg(`<rect width="200" height="110" fill="#faf7f2"/><rect x="16" y="14" width="60" height="9" rx="2" fill="#1a1612"/><rect x="16" y="28" width="100" height="6" rx="2" fill="#7a7066"/><rect x="16" y="50" width="84" height="48" rx="5" fill="#e9dfd0"/><rect x="108" y="50" width="76" height="48" rx="5" fill="#e9dfd0"/><rect x="124" y="20" width="30" height="8" rx="4" fill="#c2410c"/>`); }
function thumbPlugin() { return svg(`<rect width="200" height="110" fill="#0a0c10"/><rect x="14" y="14" width="172" height="36" rx="6" fill="#13171e" stroke="#232a34"/><circle cx="34" cy="32" r="9" fill="none" stroke="#22d3ee" stroke-width="2.5"/><circle cx="64" cy="32" r="9" fill="none" stroke="#22d3ee" stroke-width="2.5"/><circle cx="94" cy="32" r="9" fill="none" stroke="#f59e0b" stroke-width="2.5"/><rect x="14" y="56" width="100" height="44" rx="6" fill="#13171e" stroke="#232a34"/><rect x="120" y="56" width="66" height="44" rx="6" fill="#13171e" stroke="#232a34"/><rect x="128" y="64" width="5" height="28" rx="2" fill="#22d3ee"/><rect x="138" y="70" width="5" height="22" rx="2" fill="#22d3ee"/><rect x="148" y="66" width="5" height="26" rx="2" fill="#22d3ee"/>`); }
function thumbMobile() { return svg(`<rect width="200" height="110" fill="#eef4f8"/><rect x="74" y="8" width="52" height="94" rx="9" fill="#fff" stroke="#e2e8f0"/><rect x="80" y="14" width="40" height="8" rx="2" fill="#0f172a"/><rect x="80" y="28" width="40" height="22" rx="4" fill="#0ea5e9"/><rect x="80" y="56" width="40" height="10" rx="3" fill="#eef4f8"/><rect x="80" y="70" width="40" height="10" rx="3" fill="#eef4f8"/><rect x="80" y="90" width="40" height="8" rx="2" fill="#f1f5f9"/>`); }
function thumbBlank() { return svg(`<rect width="200" height="110" fill="#fff"/><rect x="2" y="2" width="196" height="106" rx="6" fill="none" stroke="#e3e7ee" stroke-dasharray="6 6"/><path d="M100 44v22M89 55h22" stroke="#c2cbd9" stroke-width="3" stroke-linecap="round"/>`); }
