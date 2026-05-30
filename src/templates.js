/* ============================================================
   Templates — curated, production-quality starting points.
   Each build() returns a page-root node tree; some also set a
   matching theme preset.
   ============================================================ */
import { store, makeNode } from './state.js';
import { makeComponent } from './registry.js';
import { THEME_PRESETS } from './themes.js';
import { confirmDialog } from './dialog.js';

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
    id: 'saas', name: 'SaaS Landing', tag: 'Marketing', category: 'Marketing', theme: 'studio',
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
    id: 'portfolio', name: 'Portfolio', tag: 'Personal', category: 'Marketing', theme: 'editorial',
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
    id: 'plugin', name: 'Audio Plugin', tag: 'Audio UI', category: 'Audio', theme: 'synth',
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
    id: 'mobile', name: 'Mobile App', tag: 'App screen', category: 'Mobile', theme: 'ocean',
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
    id: 'agency', name: 'Agency', tag: 'Bold dark', category: 'Marketing', theme: 'noir',
    thumb: gthumb('#0a0a0a', '#fafafa', 'hero', true),
    build: () => pageRoot([
      comp('navbar', { brand: 'OBSIDIAN', links: 'Work, Services, Studio', cta: 'Start a project', variant: 'minimal' }, { 'background-color': 'transparent' }),
      comp('section', {}, { padding: '120px 24px', 'align-items': 'center', gap: '18px' }, [
        anim(comp('badge', { text: 'Design & Engineering', variant: 'outline' }), 'fade'),
        anim(comp('heading', { text: 'We build brands that refuse to blend in.', level: '1' }, { 'font-size': 'clamp(2.6rem,7vw,5.5rem)', 'text-align': 'center', 'max-width': '16ch' }), 'rise', 80),
        anim(comp('button', { text: 'See our work', variant: 'primary', size: 'lg' }), 'fade-up', 200),
      ]),
      animAll(comp('feature', { title: 'What we do', items: 'bolt|Brand systems|Identity, voice, and the rules that hold them.\nlayers|Product design|Interfaces that feel inevitable.\nrocket|Launch|From zero to shipped, fast.' })),
      comp('stat', { items: '120+|Projects\n14|Awards\n8yrs|Experience\n40|Clients' }, { 'background-color': 'var(--color-surface)' }),
      comp('cta', { title: 'Let’s make something unmistakable.', subtitle: 'Now booking Q3.', button: 'Get in touch' }),
      comp('footer', { brand: 'OBSIDIAN' }),
    ]),
  },
  {
    id: 'startup', name: 'Startup', tag: 'Gradient', category: 'Marketing', theme: 'aurora',
    thumb: gthumb('#0b1020', '#8b5cf6', 'hero'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Nebula', links: 'Features, Pricing, Blog', cta: 'Try free', variant: 'glass' }),
      (() => { const hh = comp('hero', { eyebrow: 'Backed by founders', title: 'Ship your idea before the weekend ends', subtitle: 'The fastest way from concept to live product. Batteries included.', primary: 'Start building', secondary: 'Book a demo', variant: 'gradient' }); hh.anim = { type: 'fade-up', duration: 700, trigger: 'load' }; return hh; })(),
      animAll(comp('feature', { cols: 4, title: 'Built for momentum', items: 'zap|Instant deploy|Push and it’s live.\nshield|Secure|SOC2 from day one.\nglobe|Global|Edge in 30 regions.\nlayers|Composable|Bring your own stack.' })),
      comp('pricing', {}),
      comp('cta', {}),
      comp('footer', { brand: 'Nebula' }),
    ]),
  },
  {
    id: 'login', name: 'Login / Auth', tag: 'Centered card', category: 'App', theme: 'studio',
    thumb: gthumb('#f7f8fa', '#5b8cff', 'card'),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '24px', 'background-color': 'var(--color-surface)' }, [
        anim(comp('card', {}, { 'max-width': '400px', width: '100%', padding: '34px', gap: '18px' }, [
          comp('icon', { glyph: 'bolt', size: 30 }, { 'align-self': 'center' }),
          comp('heading', { text: 'Welcome back', level: '2' }, { 'text-align': 'center', 'font-size': 'var(--fs-xl)' }),
          comp('text', { text: 'Sign in to continue to your workspace.' }, { 'text-align': 'center', color: 'var(--color-muted)', margin: '0' }),
          comp('input', { label: 'Email', type: 'email', placeholder: 'you@company.com' }),
          comp('input', { label: 'Password', type: 'password', placeholder: '••••••••' }),
          comp('button', { text: 'Sign in', variant: 'primary', size: 'md' }, { width: '100%' }),
          comp('link', { text: 'Forgot password?', href: '#' }, { 'text-align': 'center', 'font-size': '.85rem' }),
        ]), 'zoom-in'),
      ]),
    ]),
  },
  {
    id: 'dashboard', name: 'Dashboard', tag: 'App shell', category: 'App', theme: 'ocean',
    thumb: gthumb('#f8fafc', '#0ea5e9', 'dash'),
    build: () => pageRoot([
      comp('appbar', { title: 'Overview', left: 'layers', right: 'globe' }),
      comp('section', {}, { padding: '28px', gap: '22px', 'align-items': 'stretch', 'background-color': 'var(--color-surface)' }, [
        comp('heading', { text: 'Good afternoon, team', level: '2' }),
        comp('grid', { cols: 4 }, { 'grid-template-columns': 'repeat(4,minmax(0,1fr))', gap: '16px' }, [
          kpi('Revenue', '$48.2k', '+12%'), kpi('Active users', '8,420', '+4%'), kpi('Churn', '1.8%', '-0.3%'), kpi('NPS', '62', '+5'),
        ]),
        comp('row', {}, { gap: '20px', 'align-items': 'stretch', 'flex-wrap': 'wrap' }, [
          comp('card', {}, { flex: '2', 'min-width': '320px', gap: '16px' }, [
            comp('heading', { text: 'Traffic', level: '3' }, { 'font-size': '1.1rem' }),
            comp('row', {}, { gap: '14px', 'align-items': 'flex-end', height: '160px' }, barRow()),
          ]),
          comp('card', {}, { flex: '1', 'min-width': '220px', gap: '14px' }, [
            comp('heading', { text: 'Goals', level: '3' }, { 'font-size': '1.1rem' }),
            comp('list', { items: 'Launch v2\nHire designer\nShip mobile beta\nSOC2 audit', marker: 'check' }),
          ]),
        ]),
      ]),
    ]),
  },
  {
    id: 'pricingpage', name: 'Pricing', tag: 'Plans', category: 'App', theme: 'studio',
    thumb: gthumb('#ffffff', '#5b8cff', 'split'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Acme', links: 'Product, Pricing, Docs', cta: 'Sign in', variant: 'solid' }),
      comp('section', {}, { padding: '72px 24px 24px', 'align-items': 'center', gap: '12px' }, [
        anim(comp('heading', { text: 'Simple, honest pricing', level: '1' }, { 'text-align': 'center' }), 'fade-up'),
        anim(comp('text', { text: 'Start free. Upgrade when you’re ready. Cancel anytime.' }, { 'text-align': 'center', color: 'var(--color-muted)' }), 'fade-up', 80),
      ]),
      animAll(comp('pricing', {})),
      comp('feature', { title: 'Every plan includes', cols: 4, items: 'check|Unlimited pages|No caps.\ncheck|Code export|Own your output.\ncheck|Custom domains|Bring your own.\ncheck|Email support|We reply fast.' }),
      comp('footer', { brand: 'Acme' }),
    ]),
  },
  {
    id: 'comingsoon', name: 'Coming soon', tag: 'Landing', category: 'Utility', theme: 'aurora',
    thumb: gthumb('#0b1020', '#ec4899', 'card'),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '24px', gap: '20px', background: 'radial-gradient(120% 120% at 50% 0, color-mix(in srgb,var(--color-primary) 22%,var(--color-bg)), var(--color-bg))' }, [
        anim(comp('badge', { text: 'Launching soon', variant: 'soft' }), 'fade'),
        anim(comp('heading', { text: 'Something great is on the way', level: '1' }, { 'text-align': 'center', 'font-size': 'clamp(2.4rem,6vw,4.5rem)', 'max-width': '18ch' }), 'rise', 100),
        anim(comp('text', { text: 'Be the first to know when we go live.' }, { 'text-align': 'center', color: 'var(--color-muted)' }), 'fade-up', 200),
        anim(comp('row', {}, { gap: '10px', 'flex-wrap': 'nowrap', 'max-width': '440px', width: '100%' }, [
          comp('input', { label: '', type: 'email', placeholder: 'you@email.com' }, { flex: '1' }),
          comp('button', { text: 'Notify me', variant: 'primary' }),
        ]), 'fade-up', 300),
      ]),
    ]),
  },
  {
    id: 'notfound', name: '404', tag: 'Error page', category: 'Utility', theme: 'noir',
    thumb: gthumb('#0a0a0a', '#fafafa', 'card'),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '24px', gap: '14px' }, [
        anim(comp('heading', { text: '404', level: '1' }, { 'font-size': 'clamp(5rem,18vw,12rem)', 'line-height': '1' }), 'zoom-in'),
        comp('heading', { text: 'This page wandered off', level: '3' }, { color: 'var(--color-muted)' }),
        comp('button', { text: 'Back home', variant: 'outline', size: 'lg' }),
      ]),
    ]),
  },
  {
    id: 'mixer', name: 'Mixer', tag: 'Audio console', category: 'Audio', theme: 'synth',
    thumb: gthumb('#0a0c10', '#22d3ee', 'strip'),
    build: () => pageRoot([
      comp('section', {}, { padding: '24px', gap: '16px', 'min-height': '100vh', background: 'radial-gradient(120% 140% at 50% 0, var(--color-surface), var(--color-bg))' }, [
        comp('heading', { text: 'CONSOLE — 6CH', level: '3' }, { 'letter-spacing': '.14em', 'font-size': '1rem' }),
        comp('row', {}, { gap: '14px', 'flex-wrap': 'wrap', 'align-items': 'stretch', 'justify-content': 'center' },
          ['Kick', 'Snare', 'Bass', 'Synth', 'Vox', 'FX'].map((name, i) => channelStrip(name, 40 + i * 9)),
        ),
      ]),
    ]),
  },
  {
    id: 'drum', name: 'Drum machine', tag: 'Step sequencer', category: 'Audio', theme: 'synth',
    thumb: gthumb('#0a0c10', '#f59e0b', 'pads'),
    build: () => pageRoot([
      comp('section', {}, { padding: '24px', gap: '18px', 'align-items': 'center', 'min-height': '100vh', background: 'radial-gradient(120% 140% at 50% 0, var(--color-surface), var(--color-bg))' }, [
        comp('row', {}, { 'align-items': 'center', gap: '24px', 'justify-content': 'center', 'flex-wrap': 'wrap' }, [
          comp('knob', { label: 'Tempo', value: 120, min: 60, max: 200, unit: '', color: 'var(--color-accent)' }),
          comp('knob', { label: 'Swing', value: 30, color: 'var(--color-primary)' }),
          comp('toggle', { label: 'Run', on: true }),
        ]),
        comp('panel', { title: 'STEPS' }, { display: 'flex', 'flex-direction': 'column', gap: '10px', 'align-items': 'stretch' },
          ['BD', 'SD', 'HH', 'CP'].map((lbl) => stepRow(lbl)),
        ),
      ]),
    ]),
  },
  {
    id: 'onboarding', name: 'Onboarding', tag: 'Mobile flow', category: 'Mobile', theme: 'aurora',
    thumb: gthumb('#0b1020', '#8b5cf6', 'phone'),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'space-between', padding: '40px 24px', gap: '20px', background: 'radial-gradient(120% 90% at 50% 0, color-mix(in srgb,var(--color-primary) 28%,var(--color-bg)), var(--color-bg))' }, [
        comp('stack', {}, { gap: '20px', 'align-items': 'center', flex: '1', 'justify-content': 'center' }, [
          anim(comp('icon', { glyph: 'rocket', size: 64 }), 'zoom-in'),
          anim(comp('heading', { text: 'Welcome to Orbit', level: '1' }, { 'text-align': 'center', 'font-size': 'var(--fs-2xl)' }), 'fade-up', 100),
          anim(comp('text', { text: 'Track your habits, hit your goals, and stay in flow.' }, { 'text-align': 'center', color: 'var(--color-muted)', 'max-width': '28ch' }), 'fade-up', 200),
        ]),
        comp('stack', {}, { gap: '12px', width: '100%', 'max-width': '360px' }, [
          comp('button', { text: 'Get started', variant: 'primary', size: 'lg' }, { width: '100%' }),
          comp('button', { text: 'I already have an account', variant: 'ghost' }, { width: '100%' }),
        ]),
      ])], { 'max-width': '420px', margin: '0 auto', 'box-shadow': 'var(--shadow-lg)', 'min-height': '100vh' }),
  },
  {
    id: 'blank', name: 'Blank', tag: 'Start fresh', category: 'Blank', theme: null,
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

/* ---- composition helpers ---- */
function anim(node, type, delay = 0) { node.anim = { type, duration: 650, delay, trigger: 'inview' }; return node; }
function animAll(node) { node.anim = { type: 'fade-up', duration: 650, trigger: 'inview' }; return node; }
function kpi(label, value, delta) {
  const up = !String(delta).startsWith('-');
  return anim(comp('card', {}, { gap: '6px', padding: '18px' }, [
    comp('text', { text: label }, { color: 'var(--color-muted)', 'font-size': '.82rem', margin: '0', 'text-transform': 'uppercase', 'letter-spacing': '.04em' }),
    comp('heading', { text: value, level: '3' }, { 'font-size': 'var(--fs-xl)' }),
    comp('badge', { text: delta, variant: 'soft' }, { 'align-self': 'flex-start', background: up ? 'color-mix(in srgb,var(--color-success) 16%,transparent)' : 'color-mix(in srgb,var(--color-danger) 16%,transparent)', color: up ? 'var(--color-success)' : 'var(--color-danger)' }),
  ]), 'fade-up');
}
function bar(pct) { return comp('stack', {}, { flex: '1', height: pct + '%', 'background-color': 'var(--color-primary)', 'border-radius': '6px 6px 0 0', 'align-self': 'flex-end', opacity: '.85' }); }
function barRow() { return [42, 68, 54, 88, 63, 79, 48, 73, 60, 92].map(bar); }
function channelStrip(name, fader) {
  return comp('stack', {}, { 'align-items': 'center', gap: '12px', padding: '16px 12px', 'background-color': 'var(--color-surface)', border: '1px solid var(--color-border)', 'border-radius': 'var(--radius)', 'min-width': '92px' }, [
    comp('knob', { label: 'Pan', value: 50, size: 48, 'show-value': false }),
    comp('row', {}, { gap: '10px', 'align-items': 'flex-end' }, [
      comp('slider', { label: '', orient: 'vertical', value: fader, length: 150, 'show-value': false }),
      comp('meter', { label: '', orient: 'vertical', value: -6 - (100 - fader) / 6, segments: 16, length: 150 }),
    ]),
    comp('toggle', { label: '', on: name !== 'FX' }),
    comp('heading', { text: name, level: '4' }, { 'font-size': '.8rem', 'letter-spacing': '.08em', 'text-transform': 'uppercase', color: 'var(--color-muted)' }),
  ]);
}
function stepRow(lbl) {
  const pat = { BD: [1, 0, 0, 0, 1, 0, 0, 0], SD: [0, 0, 1, 0, 0, 0, 1, 0], HH: [1, 1, 1, 1, 1, 1, 1, 1], CP: [0, 0, 0, 0, 1, 0, 0, 0] }[lbl] || [];
  return comp('row', {}, { 'align-items': 'center', gap: '8px', 'flex-wrap': 'nowrap' }, [
    comp('heading', { text: lbl, level: '5' }, { 'font-size': '.72rem', width: '34px', color: 'var(--color-muted)', 'letter-spacing': '.08em' }),
    ...pat.map((on) => comp('toggle', { label: '', on: !!on, color: 'var(--color-accent)' })),
  ]);
}

/* ---- compact thumbnail generator ---- */
function gthumb(bg, accent, kind, dark) {
  const muted = dark ? '#2a2a30' : 'rgba(120,130,150,.25)';
  const card = dark ? '#16161c' : 'rgba(255,255,255,.9)';
  const txt = dark ? '#e8e8ee' : '#10141b';
  const parts = { hero: heroTh, card: cardTh, dash: dashTh, strip: stripTh, pads: padsTh, phone: phoneTh, split: splitTh };
  return svg(`<rect width="200" height="110" fill="${bg}"/>` + (parts[kind] || heroTh)(accent, muted, card, txt));
  function heroTh(a, m, c, t) { return `<rect x="14" y="10" width="40" height="6" rx="2" fill="${t}"/><rect x="150" y="9" width="34" height="8" rx="4" fill="${a}"/><rect x="50" y="34" width="100" height="9" rx="3" fill="${t}"/><rect x="50" y="47" width="100" height="9" rx="3" fill="${t}"/><rect x="74" y="64" width="52" height="9" rx="4" fill="${a}"/><rect x="20" y="84" width="50" height="20" rx="4" fill="${c}"/><rect x="75" y="84" width="50" height="20" rx="4" fill="${c}"/><rect x="130" y="84" width="50" height="20" rx="4" fill="${c}"/>`; }
  function cardTh(a, m, c, t) { return `<rect x="62" y="26" width="76" height="58" rx="8" fill="${c}" stroke="${m}"/><circle cx="100" cy="40" r="6" fill="${a}"/><rect x="74" y="52" width="52" height="6" rx="3" fill="${t}"/><rect x="74" y="63" width="52" height="6" rx="3" fill="${m}"/><rect x="74" y="73" width="52" height="7" rx="3" fill="${a}"/>`; }
  function dashTh(a, m, c, t) { return `<rect x="0" y="0" width="44" height="110" fill="${c}"/><rect x="10" y="12" width="24" height="5" rx="2" fill="${a}"/><rect x="10" y="26" width="24" height="4" rx="2" fill="${m}"/><rect x="10" y="35" width="24" height="4" rx="2" fill="${m}"/><rect x="54" y="14" width="30" height="22" rx="4" fill="${c}"/><rect x="90" y="14" width="30" height="22" rx="4" fill="${c}"/><rect x="126" y="14" width="30" height="22" rx="4" fill="${c}"/><rect x="162" y="14" width="28" height="22" rx="4" fill="${c}"/><rect x="54" y="44" width="136" height="56" rx="5" fill="${c}"/>`; }
  function stripTh(a, m, c, t) { return Array.from({ length: 6 }, (_, i) => { const x = 16 + i * 30; return `<rect x="${x}" y="14" width="24" height="82" rx="4" fill="${c}" stroke="${m}"/><circle cx="${x + 12}" cy="26" r="6" fill="none" stroke="${a}" stroke-width="2"/><rect x="${x + 10}" y="40" width="4" height="44" rx="2" fill="${a}"/>`; }).join(''); }
  function padsTh(a, m, c, t) { let s = ''; for (let r = 0; r < 4; r++)for (let i = 0; i < 8; i++) { const on = (r === 2) || (r === 0 && i % 4 === 0) || (r === 1 && (i === 2 || i === 6)); s += `<rect x="${24 + i * 19}" y="${24 + r * 20}" width="14" height="14" rx="3" fill="${on ? a : c}" stroke="${m}"/>`; } return s; }
  function phoneTh(a, m, c, t) { return `<rect x="74" y="6" width="52" height="98" rx="9" fill="${c}" stroke="${m}"/><circle cx="100" cy="34" r="11" fill="${a}"/><rect x="84" y="52" width="32" height="6" rx="3" fill="${t}"/><rect x="86" y="63" width="28" height="4" rx="2" fill="${m}"/><rect x="84" y="86" width="32" height="9" rx="4" fill="${a}"/>`; }
  function splitTh(a, m, c, t) { return `<rect x="14" y="30" width="52" height="60" rx="6" fill="${c}" stroke="${m}"/><rect x="74" y="22" width="52" height="68" rx="6" fill="${c}" stroke="${a}" stroke-width="2"/><rect x="134" y="30" width="52" height="60" rx="6" fill="${c}" stroke="${m}"/><rect x="86" y="34" width="28" height="6" rx="3" fill="${a}"/>`; }
}

const TPL_CATS = ['All', 'Marketing', 'App', 'Audio', 'Mobile', 'Utility', 'Blank'];

export function initTemplatesPanel() {
  const host = document.getElementById('panel-templates');
  host.innerHTML = `<div class="panel-head"><h2>Templates</h2><span class="mini">${TEMPLATES.length} starts</span></div>`;
  const chips = document.createElement('div'); chips.className = 'tpl-chips';
  const list = document.createElement('div'); list.className = 'tpl-list';
  let active = 'All';

  TPL_CATS.forEach((cat) => {
    const chip = document.createElement('button');
    chip.className = 'tpl-chip' + (cat === active ? ' is-active' : '');
    chip.textContent = cat;
    chip.onclick = () => { active = cat; chips.querySelectorAll('.tpl-chip').forEach((c) => c.classList.toggle('is-active', c === chip)); paint(); };
    chips.append(chip);
  });

  function applyCard(tpl) {
    return async () => {
      const has = (store.root?.children || []).length > 0;
      if (has) {
        const ok = await confirmDialog('Apply template?', { message: `This replaces the contents of “${store.page.name}” with the ${tpl.name} template. You can undo this.`, confirmText: 'Apply template' });
        if (!ok) return;
      }
      applyTemplate(tpl);
      window.__wisyToast?.(`Applied “${tpl.name}”`, 'ok');
    };
  }
  function paint() {
    list.innerHTML = '';
    TEMPLATES.filter((t) => active === 'All' || t.category === active).forEach((tpl) => {
      const card = document.createElement('div'); card.className = 'tpl-card';
      card.innerHTML = `<div class="tpl-card__preview">${tpl.thumb}</div>
        <div class="tpl-card__foot"><span class="tpl-card__name">${tpl.name}</span><span class="tpl-card__tag">${tpl.tag}</span></div>`;
      card.onclick = applyCard(tpl);
      list.append(card);
    });
  }
  host.append(chips, list);
  paint();
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
