/* ============================================================
   Extra templates — a broad, tasteful library that extends the
   curated set in templates.js. Every category gets at least three
   new, visually distinct starting points. Zero dependencies; this
   module is imported back into templates.js (cycle is fine — only
   function declarations and the EXTRA_TEMPLATES array are used).
   ============================================================ */
import {
  comp, pageRoot, anim, animAll, gthumb, secondaryPages, navFor,
  postCard, postRow, workCard, appRow, kpi, channelStrip, stepRow,
  menuItem, episodeRow, speakerCard, listingCard, productCard,
} from './templates.js';

/* small local helpers (kept here so we don't touch templates.js) */
function phone(children) {
  return pageRoot(children, { 'max-width': '420px', margin: '0 auto', 'box-shadow': 'var(--shadow-lg)', 'min-height': '100vh' });
}
function sectionWrap(children, style = {}) {
  return comp('section', {}, { padding: '24px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%', 'align-items': 'stretch', gap: '20px', ...style }, children);
}

export const EXTRA_TEMPLATES = [
  /* ===================== MARKETING ===================== */
  {
    id: 'mk-waitlist', name: 'Waitlist launch', tag: 'Pre-launch', category: 'Marketing', theme: 'aurora',
    thumb: gthumb('#0b1020', '#8b5cf6', 'hero', true),
    pages: () => secondaryPages('Driftless', 'Features, Pricing, Blog'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Driftless', links: 'Features, Pricing, Blog', cta: 'Join waitlist', variant: 'glass' }),
      comp('section', {}, { padding: '110px 24px 72px', 'align-items': 'center', gap: '18px', background: 'radial-gradient(120% 110% at 50% 0, color-mix(in srgb,var(--color-primary) 22%,var(--color-bg)), var(--color-bg))' }, [
        anim(comp('badge', { text: '2,400 builders already in line', variant: 'soft' }), 'fade'),
        anim(comp('heading', { text: 'Your inbox, finally on your side', level: '1' }, { 'text-align': 'center', 'font-size': 'clamp(2.6rem,7vw,5rem)', 'max-width': '16ch' }), 'rise', 80),
        anim(comp('text', { text: 'Driftless turns the noise into a single, calm daily brief. Be first through the door.' }, { 'text-align': 'center', color: 'var(--color-muted)', 'max-width': '46ch' }), 'fade-up', 160),
        anim(comp('row', {}, { gap: '10px', 'flex-wrap': 'nowrap', 'max-width': '440px', width: '100%' }, [
          comp('input', { label: '', type: 'email', placeholder: 'you@email.com' }, { flex: '1' }),
          comp('button', { text: 'Get early access', variant: 'primary' }),
        ]), 'fade-up', 240),
        anim(comp('progress', { label: 'Spots claimed', value: 72, showval: true }, { 'max-width': '440px', width: '100%' }), 'fade-up', 320),
      ]),
      animAll(comp('feature', { title: 'Built for focus', cols: 3, items: 'bolt|One daily brief|Everything that matters, once.\nshield|Private by design|Your mail never trains a model.\nzap|Zero setup|Connect and you are done.' })),
      comp('logos', { items: 'Northwind\nAcme\nLumen\nVerde\nOrbit\nCadence', marquee: true }, { 'background-color': 'var(--color-surface)', padding: '28px 24px' }),
      comp('cta', { title: 'Join the waitlist', subtitle: 'Launching this summer. No spam, ever.', button: 'Reserve my spot' }),
      comp('footer', { brand: 'Driftless' }),
    ]),
  },
  {
    id: 'mk-webinar', name: 'Webinar signup', tag: 'Live event', category: 'Marketing', theme: 'cobalt',
    thumb: gthumb('#0b1220', '#38bdf8', 'split', true),
    pages: () => secondaryPages('Scaleline', 'Webinars, Resources, Blog'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Scaleline', links: 'Webinars, Resources, Blog', cta: 'Sign in', variant: 'glass' }),
      comp('section', {}, { padding: '64px 24px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%' }, [
        comp('row', {}, { gap: '48px', 'align-items': 'center', 'flex-wrap': 'wrap' }, [
          anim(comp('stack', {}, { flex: '1.3', 'min-width': '300px', gap: '16px' }, [
            comp('badge', { text: 'Live · June 18 · 11am PT', variant: 'soft' }, { 'align-self': 'flex-start' }),
            comp('heading', { text: 'Scaling a design system without slowing the team', level: '1' }, { 'font-size': 'var(--fs-3xl)' }),
            comp('text', { text: 'A 45-minute working session with the people who shipped tokens to 400 engineers — plus live Q&A.' }, { color: 'var(--color-muted)', 'font-size': '1.1rem' }),
            comp('row', {}, { gap: '14px', 'align-items': 'center' }, [
              comp('avatar', { size: 44, ring: true }),
              comp('stack', {}, { gap: '2px' }, [
                comp('heading', { text: 'Mara Quinn', level: '4' }, { 'font-size': '.98rem' }),
                comp('text', { text: 'Principal Designer, Northwind' }, { color: 'var(--color-muted)', 'font-size': '.84rem', margin: '0' }),
              ]),
            ]),
            comp('list', { items: 'Token architecture that survives growth\nMigrating without a freeze\nMeasuring adoption honestly', marker: 'check' }),
          ]), 'fade-right'),
          anim(comp('card', {}, { flex: '1', 'min-width': '280px', gap: '14px', padding: '28px' }, [
            comp('heading', { text: 'Save your seat', level: '3' }, { 'font-size': '1.3rem' }),
            comp('input', { label: 'Full name', type: 'text', placeholder: 'Jane Doe' }),
            comp('input', { label: 'Work email', type: 'email', placeholder: 'you@company.com' }),
            comp('input', { label: 'Company', type: 'text', placeholder: 'Acme Inc.' }),
            comp('button', { text: 'Register free', variant: 'primary', size: 'lg' }, { width: '100%' }),
            comp('text', { text: 'Can’t make it live? Register and we’ll send the recording.' }, { color: 'var(--color-muted)', 'font-size': '.82rem', 'text-align': 'center', margin: '0' }),
          ]), 'fade-left', 120),
        ]),
      ]),
      comp('stat', { items: '45min|Session\n+2,000|Registered\nLive|Q&A\nFree|Recording' }, { 'background-color': 'var(--color-surface)' }),
      comp('footer', { brand: 'Scaleline' }),
    ]),
  },
  {
    id: 'mk-changelog', name: 'Release notes', tag: 'Changelog', category: 'Marketing', theme: 'slate',
    thumb: gthumb('#f8fafc', '#0284c7', 'list'),
    pages: () => secondaryPages('Northwind', 'Product, Changelog, Docs'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Northwind', links: 'Product, Changelog, Docs', cta: 'Open app', variant: 'solid' }),
      comp('section', {}, { padding: '56px 24px 16px', 'max-width': '760px', margin: '0 auto', width: '100%', gap: '8px', 'align-items': 'flex-start' }, [
        anim(comp('heading', { text: 'What’s new', level: '1' }, { 'font-size': 'var(--fs-2xl)' }), 'fade-up'),
        comp('text', { text: 'Every shipped change, in plain language. Subscribe for the monthly digest.' }, { color: 'var(--color-muted)' }),
      ]),
      sectionWrap([
        comp('timeline', { items: '2.4.0|Saved views|Pin filters and share them with your team.\n2.3.2|Faster export|Large boards now export in under a second.\n2.3.0|Dark mode|System-aware theme across the whole app.\n2.2.0|API v2|Webhooks, scopes, and a typed SDK.' }),
        comp('alert', { title: 'Heads up', text: 'API v1 is deprecated and will stop responding on Sept 1. Migrate to v2 before then.', variant: 'warning' }),
      ], { 'max-width': '760px' }),
      comp('cta', { title: 'Never miss a release', subtitle: 'One short email a month. Unsubscribe anytime.', button: 'Subscribe' }),
      comp('footer', { brand: 'Northwind' }),
    ]),
  },
  {
    id: 'mk-apppromo', name: 'App promo', tag: 'Phone hero', category: 'Marketing', theme: 'sunset',
    thumb: gthumb('#1a0e1a', '#fb7185', 'phone', true),
    pages: () => secondaryPages('Tally', 'Features, Pricing, Support'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Tally', links: 'Features, Pricing, Support', cta: 'Download', variant: 'glass' }),
      comp('section', {}, { padding: '72px 24px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%' }, [
        comp('row', {}, { gap: '48px', 'align-items': 'center', 'flex-wrap': 'wrap', 'justify-content': 'center' }, [
          anim(comp('stack', {}, { flex: '1', 'min-width': '300px', gap: '18px' }, [
            comp('badge', { text: 'New · iOS & Android', variant: 'soft' }, { 'align-self': 'flex-start' }),
            comp('heading', { text: 'Money that finally makes sense', level: '1' }, { 'font-size': 'var(--fs-3xl)' }),
            comp('text', { text: 'Track spending, split bills, and watch your savings grow — all from one calm screen.' }, { color: 'var(--color-muted)', 'font-size': '1.15rem' }),
            comp('row', {}, { gap: '10px' }, [
              comp('button', { text: 'App Store', variant: 'primary', size: 'lg' }),
              comp('button', { text: 'Google Play', variant: 'outline', size: 'lg' }),
            ]),
            comp('row', {}, { gap: '24px', 'margin-top': '8px' }, [
              comp('stack', {}, { gap: '0' }, [comp('heading', { text: '4.9★', level: '3' }), comp('text', { text: '120k ratings' }, { color: 'var(--color-muted)', 'font-size': '.82rem', margin: '0' })]),
              comp('stack', {}, { gap: '0' }, [comp('heading', { text: '2M+', level: '3' }), comp('text', { text: 'downloads' }, { color: 'var(--color-muted)', 'font-size': '.82rem', margin: '0' })]),
            ]),
          ]), 'fade-right'),
          anim(phone([
            comp('appbar', { title: 'Tally', left: 'layers', right: 'bolt' }),
            comp('section', {}, { padding: '18px', gap: '14px', 'align-items': 'stretch', flex: '1', 'background-color': 'var(--color-surface)' }, [
              comp('card', {}, { background: 'linear-gradient(120deg,var(--color-primary),var(--color-accent))', color: '#fff', border: '0', gap: '6px' }, [
                comp('text', { text: 'Balance' }, { color: 'rgba(255,255,255,.85)', margin: '0', 'font-size': '.82rem' }),
                comp('heading', { text: '$4,820.55', level: '2' }, { color: '#fff' }),
              ]),
              appRow('Groceries', '−$54.20'),
              appRow('Rent split', '+$600.00'),
              appRow('Coffee', '−$4.50'),
            ]),
            comp('tabbar', { items: 'globe|Home\nlayers|Cards\nstar|Goals\nheart|You', active: 1 }),
          ]), 'fade-left', 120),
        ]),
      ]),
      animAll(comp('feature', { title: 'Why people switch', cols: 3, items: 'zap|Instant insights|See where it goes, in real time.\nshield|Bank-grade security|256-bit encryption, biometrics.\nheart|Split with friends|Settle up in two taps.' })),
      comp('cta', { title: 'Download Tally free', subtitle: 'No fees. No ads. Just clarity.', button: 'Get the app' }),
      comp('footer', { brand: 'Tally' }),
    ]),
  },
  {
    id: 'mk-compare', name: 'Comparison', tag: 'vs. competitor', category: 'Marketing', theme: 'studio',
    thumb: gthumb('#f7f8fa', '#5b8cff', 'split'),
    pages: () => secondaryPages('Switchboard', 'Product, Pricing, Migrate'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Switchboard', links: 'Product, Pricing, Migrate', cta: 'Start free', variant: 'solid' }),
      comp('section', {}, { padding: '64px 24px 16px', 'align-items': 'center', gap: '10px' }, [
        anim(comp('heading', { text: 'Switchboard vs. the old way', level: '1' }, { 'text-align': 'center', 'max-width': '20ch' }), 'fade-up'),
        anim(comp('text', { text: 'Same job, a fraction of the friction. Here’s the honest side-by-side.' }, { 'text-align': 'center', color: 'var(--color-muted)' }), 'fade-up', 80),
      ]),
      sectionWrap([
        comp('row', {}, { gap: '20px', 'align-items': 'stretch', 'flex-wrap': 'wrap' }, [
          anim(comp('card', {}, { flex: '1', 'min-width': '280px', gap: '12px', padding: '28px' }, [
            comp('badge', { text: 'Legacy tools', variant: 'outline' }, { 'align-self': 'flex-start' }),
            comp('heading', { text: 'The old way', level: '3' }),
            comp('list', { items: 'Weeks of onboarding\nPer-seat pricing surprises\nExport locked behind support\nNo real-time collaboration', marker: 'none' }),
          ]), 'fade-right'),
          anim(comp('card', {}, { flex: '1', 'min-width': '280px', gap: '12px', padding: '28px', border: '2px solid var(--color-primary)' }, [
            comp('badge', { text: 'Switchboard', variant: 'solid' }, { 'align-self': 'flex-start' }),
            comp('heading', { text: 'The new way', level: '3' }),
            comp('list', { items: 'Live in an afternoon\nFlat, predictable pricing\nOne-click export, always\nReal-time, multiplayer by default', marker: 'check' }),
          ]), 'fade-left', 120),
        ]),
      ]),
      comp('testimonial', { quote: 'We migrated 60 people in a weekend and never looked back.', author: 'Sasha Lin', role: 'Ops Lead, Verde' }),
      comp('cta', { title: 'Make the switch', subtitle: 'Free migration assistance included.', button: 'Start free' }),
      comp('footer', { brand: 'Switchboard' }),
    ]),
  },

  /* ===================== APP ===================== */
  {
    id: 'app-settings', name: 'Settings', tag: 'Account', category: 'App', theme: 'graphite',
    thumb: gthumb('#0f1115', '#94a3b8', 'list', true),
    build: () => pageRoot([
      comp('appbar', { title: 'Settings', left: 'layers', right: 'star' }),
      comp('section', {}, { padding: '28px', gap: '20px', 'align-items': 'stretch', 'background-color': 'var(--color-surface)', 'min-height': '100vh' }, [
        comp('breadcrumb', { items: 'Workspace\nSettings\nGeneral' }),
        comp('row', {}, { gap: '14px', 'align-items': 'center' }, [
          comp('avatar', { size: 64, ring: true, status: 'online' }),
          comp('stack', {}, { gap: '2px', flex: '1' }, [
            comp('heading', { text: 'Jordan Avery', level: '3' }, { 'font-size': '1.2rem' }),
            comp('text', { text: 'jordan@northwind.com · Admin' }, { color: 'var(--color-muted)', 'font-size': '.86rem', margin: '0' }),
          ]),
          comp('button', { text: 'Edit profile', variant: 'outline', size: 'sm' }),
        ]),
        comp('card', {}, { gap: '16px', padding: '22px' }, [
          comp('heading', { text: 'Preferences', level: '4' }, { 'font-size': '1rem' }),
          comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'nowrap' }, [comp('text', { text: 'Email notifications' }, { margin: '0' }), comp('toggle', { label: '', on: true })]),
          comp('divider', {}),
          comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'nowrap' }, [comp('text', { text: 'Weekly summary' }, { margin: '0' }), comp('toggle', { label: '', on: true })]),
          comp('divider', {}),
          comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'nowrap' }, [comp('text', { text: 'Product updates' }, { margin: '0' }), comp('toggle', { label: '', on: false })]),
        ]),
        comp('card', {}, { gap: '14px', padding: '22px' }, [
          comp('heading', { text: 'Security', level: '4' }, { 'font-size': '1rem' }),
          comp('input', { label: 'Email', type: 'email', placeholder: 'jordan@northwind.com' }),
          comp('input', { label: 'New password', type: 'password', placeholder: '••••••••' }),
          comp('row', {}, { gap: '10px' }, [comp('button', { text: 'Save changes', variant: 'primary' }), comp('button', { text: 'Cancel', variant: 'ghost' })]),
        ]),
        comp('alert', { title: 'Danger zone', text: 'Deleting your account is permanent and cannot be undone.', variant: 'danger' }),
      ]),
    ]),
  },
  {
    id: 'app-analytics', name: 'Analytics', tag: 'Charts dashboard', category: 'App', theme: 'midnight',
    thumb: gthumb('#070b14', '#3b82f6', 'dash', true),
    build: () => pageRoot([
      comp('appbar', { title: 'Analytics', left: 'layers', right: 'globe' }),
      comp('section', {}, { padding: '28px', gap: '22px', 'align-items': 'stretch', 'background-color': 'var(--color-surface)', 'min-height': '100vh' }, [
        comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'wrap', gap: '12px' }, [
          comp('heading', { text: 'Last 30 days', level: '2' }),
          comp('row', {}, { gap: '8px' }, [comp('badge', { text: 'Live', variant: 'soft' }), comp('button', { text: 'Export', variant: 'outline', size: 'sm' })]),
        ]),
        comp('grid', { cols: 4 }, { 'grid-template-columns': 'repeat(4,minmax(0,1fr))', gap: '16px' }, [
          kpi('Sessions', '128k', '+9%'), kpi('Conversion', '3.4%', '+0.4%'), kpi('Revenue', '$92.1k', '+14%'), kpi('Refunds', '0.9%', '-0.2%'),
        ]),
        comp('row', {}, { gap: '20px', 'align-items': 'stretch', 'flex-wrap': 'wrap' }, [
          comp('card', {}, { flex: '2', 'min-width': '320px', gap: '14px' }, [
            comp('heading', { text: 'Revenue over time', level: '3' }, { 'font-size': '1.05rem' }),
            comp('chart', { type: 'area', data: 'Wk1:42\nWk2:55\nWk3:48\nWk4:71\nWk5:66\nWk6:88', height: 200, grid: true }),
          ]),
          comp('card', {}, { flex: '1', 'min-width': '240px', gap: '14px' }, [
            comp('heading', { text: 'Traffic by source', level: '3' }, { 'font-size': '1.05rem' }),
            comp('chart', { type: 'donut', data: 'Direct:40\nSearch:32\nSocial:18\nReferral:10', height: 200 }),
          ]),
        ]),
        comp('card', {}, { gap: '14px' }, [
          comp('heading', { text: 'Top pages', level: '3' }, { 'font-size': '1.05rem' }),
          comp('chart', { type: 'bar', data: '/home:88\n/pricing:64\n/blog:51\n/docs:39\n/login:22', height: 180, grid: true }),
        ]),
      ]),
    ]),
  },
  {
    id: 'app-kanban', name: 'Kanban board', tag: 'Project', category: 'App', theme: 'slate',
    thumb: gthumb('#f8fafc', '#0284c7', 'dash'),
    build: () => pageRoot([
      comp('appbar', { title: 'Sprint 14', left: 'layers', right: 'bolt' }),
      comp('section', {}, { padding: '24px', gap: '16px', 'align-items': 'stretch', 'background-color': 'var(--color-surface)', 'min-height': '100vh' }, [
        comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', 'flex-wrap': 'wrap', gap: '12px' }, [
          comp('heading', { text: 'Roadmap board', level: '2' }),
          comp('button', { text: '+ New task', variant: 'primary', size: 'sm' }),
        ]),
        comp('row', {}, { gap: '16px', 'align-items': 'flex-start', 'flex-wrap': 'wrap' },
          [
            ['To do', ['Audit empty states', 'Refine token names', 'Write migration guide']],
            ['In progress', ['Dark mode pass', 'Export pipeline']],
            ['Review', ['Settings redesign']],
            ['Done', ['Onboarding flow', 'API v2 docs']],
          ].map(([col, cards]) => comp('stack', {}, { flex: '1', 'min-width': '220px', gap: '10px', 'background-color': 'var(--color-bg)', padding: '14px', 'border-radius': 'var(--radius)', border: '1px solid var(--color-border)' }, [
            comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between' }, [
              comp('heading', { text: col, level: '4' }, { 'font-size': '.82rem', 'text-transform': 'uppercase', 'letter-spacing': '.06em', color: 'var(--color-muted)' }),
              comp('badge', { text: String(cards.length), variant: 'soft' }),
            ]),
            ...cards.map((c) => comp('card', {}, { padding: '14px', gap: '8px', 'box-shadow': 'var(--shadow)' }, [
              comp('text', { text: c }, { margin: '0', 'font-size': '.92rem', color: 'var(--color-strong)' }),
              comp('row', {}, { 'align-items': 'center', gap: '8px' }, [comp('avatar', { size: 24 }), comp('badge', { text: '#design', variant: 'outline' })]),
            ])),
          ])),
        ),
      ]),
    ]),
  },
  {
    id: 'app-signup', name: 'Sign-up flow', tag: 'Multi-step', category: 'App', theme: 'studio',
    thumb: gthumb('#f7f8fa', '#5b8cff', 'card'),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '24px', 'background-color': 'var(--color-surface)' }, [
        anim(comp('card', {}, { 'max-width': '480px', width: '100%', padding: '34px', gap: '22px' }, [
          comp('logo', { text: 'Switchboard', accent: 'last', markStyle: 'gradient', size: 22 }, { 'align-self': 'center' }),
          comp('steps', { items: 'Account\nProfile\nPlan\nDone', active: 2 }),
          comp('stack', {}, { gap: '14px' }, [
            comp('heading', { text: 'Tell us about you', level: '2' }, { 'font-size': 'var(--fs-lg)' }),
            comp('text', { text: 'This helps us set up your workspace with the right defaults.' }, { color: 'var(--color-muted)', margin: '0', 'font-size': '.9rem' }),
            comp('input', { label: 'Full name', type: 'text', placeholder: 'Jane Doe' }),
            comp('input', { label: 'Company', type: 'text', placeholder: 'Acme Inc.' }),
            comp('input', { label: 'Team size', type: 'number', placeholder: '12' }),
          ]),
          comp('row', {}, { gap: '10px', 'justify-content': 'space-between' }, [
            comp('button', { text: 'Back', variant: 'ghost' }),
            comp('button', { text: 'Continue', variant: 'primary' }),
          ]),
        ]), 'zoom-in'),
      ]),
    ]),
  },
  {
    id: 'app-help', name: 'Help center', tag: 'Empty / support', category: 'App', theme: 'arctic',
    thumb: gthumb('#f4fafe', '#0891b2', 'card'),
    pages: () => secondaryPages('Northwind', 'Product, Help, Status'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Northwind Help', links: 'Guides, API, Status', cta: 'Contact us', variant: 'solid' }),
      comp('section', {}, { padding: '72px 24px 32px', 'align-items': 'center', gap: '18px', background: 'radial-gradient(120% 100% at 50% 0, color-mix(in srgb,var(--color-primary) 14%,var(--color-bg)), var(--color-bg))' }, [
        anim(comp('heading', { text: 'How can we help?', level: '1' }, { 'text-align': 'center' }), 'fade-up'),
        anim(comp('row', {}, { gap: '8px', 'flex-wrap': 'nowrap', 'max-width': '520px', width: '100%' }, [
          comp('input', { label: '', type: 'search', placeholder: 'Search the docs…' }, { flex: '1' }),
          comp('button', { text: 'Search', variant: 'primary' }),
        ]), 'fade-up', 100),
      ]),
      sectionWrap([
        comp('grid', { cols: 3 }, { 'grid-template-columns': 'repeat(3,minmax(0,1fr))', gap: '18px' },
          [['outline:rocket', 'Getting started', 'Set up your workspace in minutes.'], ['outline:layers', 'Integrations', 'Connect the tools you already use.'], ['outline:shield', 'Security & privacy', 'How we protect your data.'], ['outline:zap', 'Automations', 'Let the busywork run itself.'], ['outline:globe', 'API & webhooks', 'Build on the platform.'], ['outline:heart', 'Billing', 'Plans, invoices, and refunds.']].map(([ic, t, d]) =>
            anim(comp('card', {}, { gap: '8px', padding: '22px' }, [
              comp('icon', { icon: ic, size: 26 }),
              comp('heading', { text: t, level: '3' }, { 'font-size': '1.1rem' }),
              comp('text', { text: d }, { color: 'var(--color-muted)', 'font-size': '.9rem', margin: '0' }),
            ]), 'fade-up')),
        ),
        comp('accordion', { items: 'How do I reset my password?|Use the “forgot password” link on the sign-in page.\nCan I export my data?|Yes — one click from Settings, anytime.\nDo you offer SSO?|On the Team plan and above.' }),
      ]),
      comp('cta', { title: 'Still stuck?', subtitle: 'Our team replies within a day.', button: 'Contact support' }),
      comp('footer', { brand: 'Northwind' }),
    ]),
  },

  /* ===================== ECOMMERCE ===================== */
  {
    id: 'ec-cart', name: 'Cart & checkout', tag: 'Checkout', category: 'Ecommerce', theme: 'studio',
    thumb: gthumb('#f7f8fa', '#5b8cff', 'split'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Folk', links: 'Shop, About, Journal', cta: 'Cart (3)', variant: 'solid' }),
      comp('section', {}, { padding: '40px 24px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%' }, [
        comp('breadcrumb', { items: 'Cart\nShipping\nPayment' }),
        comp('row', {}, { gap: '36px', 'align-items': 'flex-start', 'flex-wrap': 'wrap', 'margin-top': '16px' }, [
          comp('stack', {}, { flex: '1.4', 'min-width': '300px', gap: '14px' }, [
            comp('heading', { text: 'Your cart', level: '2' }, { 'font-size': 'var(--fs-lg)' }),
            ...[['Linen shirt', 'Size M', '$78'], ['Wool sweater', 'Size L', '$120'], ['Canvas tote', 'One size', '$45']].map(([n, v, p]) =>
              comp('row', {}, { 'align-items': 'center', gap: '14px', padding: '14px', 'background-color': 'var(--color-surface)', border: '1px solid var(--color-border)', 'border-radius': 'var(--radius)', 'flex-wrap': 'nowrap' }, [
                comp('image', { alt: n }, { width: '64px', height: '64px', 'border-radius': 'var(--radius)', flex: '0 0 auto' }),
                comp('stack', {}, { gap: '2px', flex: '1' }, [comp('heading', { text: n, level: '4' }, { 'font-size': '.98rem' }), comp('text', { text: v }, { color: 'var(--color-muted)', 'font-size': '.82rem', margin: '0' })]),
                comp('stepper', { label: '', value: 1, min: 1, max: 9, step: 1 }),
                comp('heading', { text: p, level: '4' }, { 'font-size': '1rem', color: 'var(--color-primary)' }),
              ])),
          ]),
          comp('card', {}, { flex: '1', 'min-width': '280px', gap: '12px', padding: '24px' }, [
            comp('heading', { text: 'Order summary', level: '3' }, { 'font-size': '1.15rem' }),
            comp('row', {}, { 'justify-content': 'space-between' }, [comp('text', { text: 'Subtotal' }, { margin: '0', color: 'var(--color-muted)' }), comp('text', { text: '$243.00' }, { margin: '0' })]),
            comp('row', {}, { 'justify-content': 'space-between' }, [comp('text', { text: 'Shipping' }, { margin: '0', color: 'var(--color-muted)' }), comp('text', { text: 'Free' }, { margin: '0' })]),
            comp('row', {}, { 'justify-content': 'space-between' }, [comp('text', { text: 'Tax' }, { margin: '0', color: 'var(--color-muted)' }), comp('text', { text: '$19.44' }, { margin: '0' })]),
            comp('divider', {}),
            comp('row', {}, { 'justify-content': 'space-between' }, [comp('heading', { text: 'Total', level: '4' }), comp('heading', { text: '$262.44', level: '4' }, { color: 'var(--color-primary)' })]),
            comp('input', { label: '', type: 'text', placeholder: 'Promo code' }),
            comp('button', { text: 'Checkout', variant: 'primary', size: 'lg' }, { width: '100%' }),
            comp('text', { text: 'Secure checkout · 30-day returns' }, { color: 'var(--color-muted)', 'font-size': '.8rem', 'text-align': 'center', margin: '0' }),
          ]),
        ]),
      ]),
      comp('footer', { brand: 'Folk' }),
    ]),
  },
  {
    id: 'ec-category', name: 'Category grid', tag: 'Filtered listing', category: 'Ecommerce', theme: 'sand',
    thumb: gthumb('#fbf9f4', '#a16207', 'grid'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Folk', links: 'New, Women, Men, Sale', cta: 'Cart', variant: 'solid' }),
      comp('section', {}, { padding: '36px 24px 8px', 'max-width': 'calc(var(--container) + 48px)', margin: '0 auto', width: '100%', gap: '8px', 'align-items': 'flex-start' }, [
        comp('breadcrumb', { items: 'Home\nWomen\nKnitwear' }),
        comp('heading', { text: 'Knitwear', level: '1' }, { 'font-size': 'var(--fs-2xl)' }),
        comp('text', { text: '24 pieces · Sorted by newest' }, { color: 'var(--color-muted)', margin: '0' }),
      ]),
      comp('section', {}, { padding: '16px 24px', 'max-width': 'calc(var(--container) + 48px)', margin: '0 auto', width: '100%' }, [
        comp('row', {}, { gap: '32px', 'align-items': 'flex-start', 'flex-wrap': 'wrap' }, [
          comp('stack', {}, { flex: '0 0 200px', gap: '18px' }, [
            comp('heading', { text: 'Filter', level: '4' }, { 'font-size': '.82rem', 'text-transform': 'uppercase', 'letter-spacing': '.06em', color: 'var(--color-muted)' }),
            comp('list', { items: 'All\nSweaters\nCardigans\nVests\nAccessories', marker: 'none' }),
            comp('divider', {}),
            comp('heading', { text: 'Size', level: '4' }, { 'font-size': '.82rem', 'text-transform': 'uppercase', 'letter-spacing': '.06em', color: 'var(--color-muted)' }),
            comp('row', {}, { gap: '8px', 'flex-wrap': 'wrap' }, ['XS', 'S', 'M', 'L', 'XL'].map((s) => comp('badge', { text: s, variant: 'outline' }))),
          ]),
          comp('grid', { cols: 3 }, { 'grid-template-columns': 'repeat(3,minmax(0,1fr))', gap: '22px', flex: '1' },
            [['Lambswool sweater', '$120'], ['Cashmere cardigan', '$240'], ['Ribbed vest', '$88'], ['Fisherman knit', '$165'], ['Merino crew', '$98'], ['Cable beanie', '$32']].map(([n, p]) => productCard(n, p))),
        ]),
      ]),
      comp('footer', { brand: 'Folk' }),
    ]),
  },
  {
    id: 'ec-single', name: 'Single product hero', tag: 'Feature drop', category: 'Ecommerce', theme: 'noir',
    thumb: gthumb('#0a0a0a', '#fafafa', 'split', true),
    build: () => pageRoot([
      comp('navbar', { brand: 'AERO', links: 'Shop, Tech, Story', cta: 'Buy', variant: 'minimal' }, { 'background-color': 'transparent' }),
      comp('section', {}, { padding: '80px 24px', 'align-items': 'center', gap: '20px', background: 'radial-gradient(120% 120% at 50% 0, var(--color-surface), var(--color-bg))' }, [
        anim(comp('badge', { text: 'New · The Aero One', variant: 'outline' }), 'fade'),
        anim(comp('heading', { text: 'Sound without the weight', level: '1' }, { 'text-align': 'center', 'font-size': 'clamp(2.6rem,7vw,5rem)', 'max-width': '14ch' }), 'rise', 80),
        anim(comp('text', { text: 'Open-ear audio that disappears. 18-hour battery. Built from a single piece of titanium.' }, { 'text-align': 'center', color: 'var(--color-muted)', 'max-width': '40ch' }), 'fade-up', 160),
        anim(comp('image', { alt: 'Aero One' }, { 'max-width': '560px', width: '100%', 'aspect-ratio': '16/10', 'border-radius': 'var(--radius-lg)', 'box-shadow': 'var(--shadow-lg)' }), 'zoom-in', 200),
        anim(comp('row', {}, { gap: '12px', 'justify-content': 'center' }, [comp('button', { text: 'Buy · $279', variant: 'primary', size: 'lg' }), comp('button', { text: 'Watch film', variant: 'ghost', size: 'lg' })]), 'fade-up', 280),
      ]),
      animAll(comp('feature', { title: 'The details', cols: 4, items: 'bolt|18h battery|All-day, then some.\nshield|IP57|Rain and sweat proof.\nzap|USB-C fast|10 min = 3 hours.\nlayers|Titanium|Lighter than it looks.' })),
      comp('stat', { items: '12g|Per side\n18h|Battery\nIP57|Rated\n4.8★|Reviews' }, { 'background-color': 'var(--color-surface)' }),
      comp('cta', { title: 'Hear it for yourself', subtitle: 'Free returns within 30 days.', button: 'Buy the Aero One' }),
      comp('footer', { brand: 'AERO' }),
    ]),
  },
  {
    id: 'ec-lookbook', name: 'Lookbook', tag: 'Editorial', category: 'Ecommerce', theme: 'paper',
    thumb: gthumb('#ffffff', '#9a3412', 'grid'),
    build: () => pageRoot([
      comp('navbar', { brand: 'MAISON FOLK', links: 'Collection, Lookbook, Stores', cta: 'Shop', variant: 'minimal' }),
      comp('section', {}, { padding: '56px 24px 24px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%', gap: '8px', 'align-items': 'flex-start' }, [
        anim(comp('badge', { text: 'Autumn / Winter ’26', variant: 'soft' }), 'fade'),
        anim(comp('heading', { text: 'Quiet materials, made to last', level: '1' }, { 'font-size': 'var(--fs-3xl)', 'max-width': '18ch' }), 'fade-up', 80),
      ]),
      comp('section', {}, { padding: '8px 24px 40px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%' }, [
        comp('row', {}, { gap: '20px', 'align-items': 'stretch', 'flex-wrap': 'wrap' }, [
          anim(comp('image', { alt: 'Look 01' }, { flex: '1.4', 'min-width': '300px', 'aspect-ratio': '3/4', 'border-radius': '2px' }), 'fade-right'),
          comp('stack', {}, { flex: '1', 'min-width': '260px', gap: '16px', 'justify-content': 'center' }, [
            comp('heading', { text: 'Look 01 — The Overcoat', level: '2' }),
            comp('text', { text: 'Undyed wool, hand-finished seams, and a cut built for a decade of winters.' }, { color: 'var(--color-muted)' }),
            comp('list', { items: 'Overcoat — $480\nMerino roll-neck — $140\nWool trousers — $190', marker: 'none' }),
            comp('button', { text: 'Shop the look', variant: 'outline' }, { 'align-self': 'flex-start' }),
          ]),
        ]),
      ]),
      comp('section', {}, { padding: '0 24px 48px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%' }, [
        comp('gallery', { cols: 3, gap: 12, radius: '2px' }),
      ]),
      comp('cta', { title: 'See the full collection', subtitle: 'In stores and online from September.', button: 'Explore' }),
      comp('footer', { brand: 'Maison Folk', tagline: 'Considered clothing since 1998.' }),
    ]),
  },

  /* ===================== INDUSTRY ===================== */
  {
    id: 'ind-law', name: 'Law firm', tag: 'Professional', category: 'Industry', theme: 'royal',
    thumb: gthumb('#0a0f1f', '#4f6ef0', 'hero', true),
    pages: () => secondaryPages('Hale & Crane', 'Practice, Team, Insights'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Hale & Crane', links: 'Practice, Team, Insights', cta: 'Consultation', variant: 'minimal' }),
      comp('hero', { eyebrow: 'Est. 1986', title: 'Counsel that protects what you’ve built', subtitle: 'A boutique firm in corporate, IP, and dispute resolution — trusted by founders and family businesses alike.', primary: 'Book a consultation', secondary: 'Our practice', variant: 'plain', align: 'left' }),
      animAll(comp('feature', { title: 'Practice areas', cols: 3, items: 'shield|Corporate|Formation, governance, M&A.\nbolt|Intellectual property|Trademarks, patents, licensing.\nstar|Disputes|Mediation, arbitration, litigation.' })),
      comp('stat', { items: '38yrs|Experience\n900+|Matters\n12|Attorneys\n4.9★|Client rating' }, { 'background-color': 'var(--color-surface)' }),
      comp('testimonial', { quote: 'They treated a small case with the same rigour as a billion-dollar deal.', author: 'M. Okonkwo', role: 'Founder, Verde' }),
      comp('cta', { title: 'Speak with an attorney', subtitle: 'Confidential, no obligation.', button: 'Book a consultation' }),
      comp('footer', { brand: 'Hale & Crane', tagline: 'Attorneys at law.' }),
    ]),
  },
  {
    id: 'ind-dental', name: 'Dental practice', tag: 'Healthcare', category: 'Industry', theme: 'mint',
    thumb: gthumb('#f5fbfa', '#0d9488', 'hero'),
    pages: () => secondaryPages('Bright Lane', 'Services, Team, Patients'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Bright Lane Dental', links: 'Services, Team, Patients', cta: 'Book online', variant: 'solid' }),
      comp('hero', { eyebrow: 'New patients welcome', title: 'A dentist you’ll actually look forward to', subtitle: 'Gentle, modern dentistry for the whole family — with evening and weekend appointments.', primary: 'Book online', secondary: 'See services', variant: 'gradient' }),
      animAll(comp('feature', { title: 'Services', cols: 3, items: 'heart|Family dentistry|Care for every age.\nstar|Cosmetic|Whitening, veneers, aligners.\nshield|Emergency|Same-day relief.' })),
      sectionWrap([
        comp('row', {}, { gap: '20px', 'align-items': 'stretch', 'flex-wrap': 'wrap' }, [
          comp('card', {}, { flex: '1', 'min-width': '280px', gap: '10px' }, [comp('heading', { text: 'Opening hours', level: '3' }, { 'font-size': '1.1rem' }), comp('list', { items: 'Mon–Fri · 8am–7pm\nSaturday · 9am–2pm\nSunday · Closed', marker: 'none' })]),
          comp('card', {}, { flex: '1', 'min-width': '280px', gap: '10px' }, [comp('heading', { text: 'Insurance', level: '3' }, { 'font-size': '1.1rem' }), comp('list', { items: 'Most major plans accepted\nFlexible payment plans\nFree initial consultation', marker: 'check' })]),
        ]),
      ]),
      comp('testimonial', { quote: 'First time in years I left the dentist smiling — literally.', author: 'Priya N.', role: 'Patient since 2022' }),
      comp('cta', { title: 'Book your first visit', subtitle: 'Evenings and weekends available.', button: 'Book online' }),
      comp('footer', { brand: 'Bright Lane Dental' }),
    ]),
  },
  {
    id: 'ind-cafe', name: 'Coffee shop', tag: 'Cafe', category: 'Industry', theme: 'warm',
    thumb: gthumb('#fbf6ef', '#c2410c', 'hero'),
    pages: () => secondaryPages('Ember & Oak', 'Menu, Beans, Visit'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Ember & Oak', links: 'Menu, Beans, Visit', cta: 'Order ahead', variant: 'minimal' }),
      comp('hero', { eyebrow: 'Roasted on-site daily', title: 'Slow coffee, fast mornings', subtitle: 'A corner roastery pulling honest espresso and baking everything from scratch before sunrise.', primary: 'Order ahead', secondary: 'See the menu', variant: 'plain', align: 'left' }),
      comp('section', {}, { padding: '48px 24px', 'max-width': '720px', margin: '0 auto', width: '100%', gap: '8px', 'align-items': 'stretch' }, [
        anim(comp('heading', { text: 'On the bar', level: '2' }, { 'margin-bottom': '8px' }), 'fade-up'),
        menuItem('Single-origin filter', '4.5'),
        menuItem('Cortado', '3.8'),
        menuItem('Oat flat white', '4.2'),
        menuItem('Cardamom bun', '4.0'),
        menuItem('Seasonal galette', '5.5'),
      ]),
      comp('stat', { items: '7am|Open\n6|Origins\nDaily|Bake\n4.9★|Local rating' }, { 'background-color': 'var(--color-surface)' }),
      comp('cta', { title: 'Skip the queue', subtitle: 'Order ahead and grab it on your way.', button: 'Order ahead' }),
      comp('footer', { brand: 'Ember & Oak', tagline: 'Open from 7am, every day.' }),
    ]),
  },
  {
    id: 'ind-services', name: 'Service agency', tag: 'Local services', category: 'Industry', theme: 'forest',
    thumb: gthumb('#0c140f', '#22c55e', 'hero', true),
    pages: () => secondaryPages('Greenline', 'Services, Projects, Quote'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Greenline', links: 'Services, Projects, Quote', cta: 'Free quote', variant: 'glass' }),
      comp('hero', { eyebrow: 'Licensed & insured', title: 'Landscapes that take care of themselves', subtitle: 'Design, build, and maintenance for gardens that look effortless year-round.', primary: 'Get a free quote', secondary: 'See our work', variant: 'spotlight' }),
      animAll(comp('feature', { title: 'What we do', cols: 3, items: 'layers|Design|Plans tailored to your space.\nbolt|Build|Patios, planting, irrigation.\nheart|Maintain|Seasonal care, hassle-free.' })),
      comp('steps', { items: 'Consult\nDesign\nBuild\nMaintain', active: 2 }),
      comp('testimonial', { quote: 'Our yard went from a chore to the best room in the house.', author: 'The Alvarez family', role: 'Riverside' }),
      comp('cta', { title: 'Ready for a greener yard?', subtitle: 'Free on-site consultation.', button: 'Get a free quote' }),
      comp('footer', { brand: 'Greenline' }),
    ]),
  },
  {
    id: 'ind-nonprofit', name: 'Nonprofit', tag: 'Charity', category: 'Industry', theme: 'coral',
    thumb: gthumb('#fff5f3', '#f43f5e', 'hero'),
    pages: () => secondaryPages('Open Harvest', 'Mission, Programs, Donate'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Open Harvest', links: 'Mission, Programs, Stories', cta: 'Donate', variant: 'solid' }),
      comp('hero', { eyebrow: 'A hunger-free city by 2030', title: 'No one should choose between rent and dinner', subtitle: 'We rescue surplus food and get it to neighbours the same day. Your gift becomes meals within hours.', primary: 'Donate now', secondary: 'How it works', variant: 'gradient' }),
      comp('stat', { items: '1.2M|Meals served\n98%|To the table\n340|Volunteers\n0|Overhead skimmed' }, { 'background-color': 'var(--color-surface)' }),
      animAll(comp('feature', { title: 'Where your gift goes', cols: 3, items: 'heart|Rescue|Surplus food collected daily.\nbolt|Deliver|Same-day to community kitchens.\nshield|Sustain|Programs that build resilience.' })),
      comp('progress', { label: 'This month’s goal: $50,000', value: 64, showval: true }),
      comp('testimonial', { quote: 'On the hardest week of my life, a warm meal showed up. I’ll never forget it.', author: 'A neighbour', role: 'Eastside' }),
      comp('cta', { title: 'Give a meal today', subtitle: '$1 puts a full plate on the table.', button: 'Donate now' }),
      comp('footer', { brand: 'Open Harvest', tagline: 'A registered 501(c)(3) nonprofit.' }),
    ]),
  },

  /* ===================== CONTENT ===================== */
  {
    id: 'ct-docs', name: 'Documentation', tag: 'Docs site', category: 'Content', theme: 'terminal',
    thumb: gthumb('#0b0f0c', '#22c55e', 'article', true),
    pages: () => [
      { name: 'API', build: () => pageRoot([navFor('Northwind Docs', 'Guides, API, Changelog'), sectionWrap([comp('heading', { text: 'API reference', level: '1' }), comp('text', { text: '## Authentication\n\nAll requests use a bearer token:\n\n```bash\ncurl -H "Authorization: Bearer $TOKEN" https://api.northwind.dev/v2/boards\n```\n\nTokens are scoped per-workspace and never expire unless revoked.' }), comp('accordion', { items: 'Rate limits?|600 req/min per token.\nPagination?|Cursor-based via the `after` param.\nWebhooks?|Yes — configure under Settings → Developers.' })]), comp('footer', { brand: 'Northwind' })]) },
    ],
    build: () => pageRoot([
      comp('navbar', { brand: 'Northwind Docs', links: 'Guides, API, Changelog', cta: 'Dashboard', variant: 'solid' }),
      comp('section', {}, { padding: '40px 24px', 'max-width': 'calc(var(--container) + 40px)', margin: '0 auto', width: '100%' }, [
        comp('row', {}, { gap: '40px', 'align-items': 'flex-start', 'flex-wrap': 'wrap' }, [
          comp('stack', {}, { flex: '0 0 220px', gap: '18px' }, [
            comp('heading', { text: 'Getting started', level: '4' }, { 'font-size': '.8rem', 'text-transform': 'uppercase', 'letter-spacing': '.06em', color: 'var(--color-muted)' }),
            comp('list', { items: 'Introduction\nInstallation\nQuickstart\nConfiguration', marker: 'none' }),
            comp('heading', { text: 'Guides', level: '4' }, { 'font-size': '.8rem', 'text-transform': 'uppercase', 'letter-spacing': '.06em', color: 'var(--color-muted)' }),
            comp('list', { items: 'Authentication\nWebhooks\nDeploying\nMigrating from v1', marker: 'none' }),
          ]),
          comp('stack', {}, { flex: '1', 'min-width': '300px', gap: '16px' }, [
            comp('breadcrumb', { items: 'Docs\nGuides\nQuickstart' }),
            comp('heading', { text: 'Quickstart', level: '1' }, { 'font-size': 'var(--fs-2xl)' }),
            comp('text', { text: 'Get a working integration in under five minutes. Install the SDK, authenticate, and make your first call.' }),
            comp('text', { text: '```bash\nnpm install @northwind/sdk\n```\n\nThen authenticate and fetch your boards:\n\n```js\nimport { Client } from "@northwind/sdk";\nconst nw = new Client(process.env.TOKEN);\nconst boards = await nw.boards.list();\n```' }),
            comp('alert', { title: 'Tip', text: 'Store your token in an environment variable — never commit it to source control.', variant: 'info' }),
            comp('heading', { text: 'Next steps', level: '2' }),
            comp('list', { items: 'Set up webhooks for real-time updates\nExplore the full API reference\nJoin the developer community', marker: 'arrow' }),
          ]),
        ]),
      ]),
      comp('footer', { brand: 'Northwind' }),
    ]),
  },
  {
    id: 'ct-kb', name: 'Knowledge base', tag: 'Articles', category: 'Content', theme: 'cream',
    thumb: gthumb('#fbf8f1', '#b45309', 'grid'),
    pages: () => secondaryPages('Helpdesk', 'Articles, Topics, Contact'),
    build: () => pageRoot([
      comp('navbar', { brand: 'Helpdesk', links: 'Articles, Topics, Contact', cta: 'Submit ticket', variant: 'solid' }),
      comp('section', {}, { padding: '64px 24px 24px', 'align-items': 'center', gap: '14px' }, [
        anim(comp('heading', { text: 'Find answers fast', level: '1' }, { 'text-align': 'center' }), 'fade-up'),
        anim(comp('row', {}, { gap: '8px', 'flex-wrap': 'nowrap', 'max-width': '520px', width: '100%' }, [comp('input', { label: '', type: 'search', placeholder: 'Search articles…' }, { flex: '1' }), comp('button', { text: 'Search', variant: 'primary' })]), 'fade-up', 100),
      ]),
      sectionWrap([
        comp('heading', { text: 'Popular topics', level: '2' }, { 'font-size': 'var(--fs-lg)' }),
        comp('grid', { cols: 3 }, { 'grid-template-columns': 'repeat(3,minmax(0,1fr))', gap: '20px' },
          [['Account', 'Getting started with your account'], ['Billing', 'Understanding your invoice'], ['Integrations', 'Connecting third-party apps'], ['Security', 'Two-factor authentication'], ['Data', 'Importing and exporting'], ['Teams', 'Roles and permissions']].map(([t, ti]) => postCard(t, ti))),
      ]),
      comp('cta', { title: 'Didn’t find it?', subtitle: 'Our support team is one message away.', button: 'Submit a ticket' }),
      comp('footer', { brand: 'Helpdesk' }),
    ]),
  },
  {
    id: 'ct-linkbio', name: 'Link in bio', tag: 'Profile', category: 'Content', theme: 'candy',
    thumb: gthumb('#fff0f7', '#ec4899', 'card'),
    build: () => phone([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', padding: '48px 24px', gap: '16px', background: 'radial-gradient(120% 80% at 50% 0, color-mix(in srgb,var(--color-primary) 24%,var(--color-bg)), var(--color-bg))' }, [
        anim(comp('avatar', { size: 96, ring: true }), 'zoom-in'),
        anim(comp('heading', { text: '@maya.builds', level: '2' }, { 'text-align': 'center' }), 'fade-up', 80),
        anim(comp('text', { text: 'Designer & maker. Sharing the process, one ship at a time.' }, { 'text-align': 'center', color: 'var(--color-muted)', 'max-width': '30ch', margin: '0' }), 'fade-up', 140),
        comp('row', {}, { gap: '12px', 'justify-content': 'center', 'margin': '4px 0' }, [
          comp('icon', { icon: 'outline:star', size: 22 }), comp('icon', { icon: 'outline:music', size: 22 }), comp('icon', { icon: 'outline:globe', size: 22 }),
        ]),
        comp('stack', {}, { gap: '12px', width: '100%', 'max-width': '360px' }, [
          comp('button', { text: 'Latest project →', variant: 'primary', size: 'lg' }, { width: '100%' }),
          comp('button', { text: 'Newsletter', variant: 'outline', size: 'lg' }, { width: '100%' }),
          comp('button', { text: 'Shop prints', variant: 'outline', size: 'lg' }, { width: '100%' }),
          comp('button', { text: 'Book a call', variant: 'outline', size: 'lg' }, { width: '100%' }),
        ]),
      ]),
    ]),
  },
  {
    id: 'ct-newsletter', name: 'Newsletter', tag: 'Publication', category: 'Content', theme: 'editorial',
    thumb: gthumb('#faf7f2', '#c2410c', 'article'),
    pages: () => secondaryPages('The Weekly Build', 'Issues, Archive, About'),
    build: () => pageRoot([
      comp('navbar', { brand: 'The Weekly Build', links: 'Issues, Archive, About', cta: 'Subscribe', variant: 'minimal' }),
      comp('section', {}, { padding: '64px 24px 24px', 'align-items': 'center', gap: '16px' }, [
        anim(comp('badge', { text: 'Every Sunday · Free', variant: 'soft' }), 'fade'),
        anim(comp('heading', { text: 'The five things in tech worth your attention', level: '1' }, { 'text-align': 'center', 'max-width': '22ch' }), 'fade-up', 80),
        anim(comp('text', { text: 'No hot takes. No filler. Just the week distilled to what actually matters — read by 38,000 builders.' }, { 'text-align': 'center', color: 'var(--color-muted)', 'max-width': '46ch' }), 'fade-up', 140),
        anim(comp('row', {}, { gap: '10px', 'flex-wrap': 'nowrap', 'max-width': '440px', width: '100%' }, [comp('input', { label: '', type: 'email', placeholder: 'you@email.com' }, { flex: '1' }), comp('button', { text: 'Subscribe', variant: 'primary' })]), 'fade-up', 200),
      ]),
      sectionWrap([
        comp('heading', { text: 'Recent issues', level: '2' }, { 'font-size': 'var(--fs-lg)' }),
        postRow('#142 — The quiet return of the monolith', 'May 25 · 6 min', 'architecture'),
        postRow('#141 — Why your AI demo lied to you', 'May 18 · 7 min', 'ai'),
        postRow('#140 — Pricing is a product decision', 'May 11 · 5 min', 'business'),
      ], { 'max-width': '760px' }),
      comp('cta', { title: 'Join 38,000 readers', subtitle: 'One email a week. Unsubscribe anytime.', button: 'Subscribe free' }),
      comp('footer', { brand: 'The Weekly Build' }),
    ]),
  },

  /* ===================== AUDIO ===================== */
  {
    id: 'au-eq', name: 'EQ + compressor', tag: 'Channel plugin', category: 'Audio', theme: 'synth',
    thumb: gthumb('#0a0c10', '#22d3ee', 'strip', true),
    build: () => pageRoot([
      comp('section', {}, { padding: '24px', gap: '18px', 'align-items': 'center', 'min-height': '100vh', background: 'radial-gradient(120% 140% at 50% 0, var(--color-surface), var(--color-bg))' }, [
        comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', width: '100%', 'max-width': '760px' }, [
          comp('heading', { text: 'CHANNEL ONE', level: '3' }, { 'font-family': 'var(--font-display)', 'letter-spacing': '.16em', 'font-size': '1.1rem' }),
          comp('toggle', { label: 'Bypass', on: false, color: 'var(--color-accent)' }),
        ]),
        comp('panel', { title: 'EQUALISER' }, { width: '100%', 'max-width': '760px', 'justify-content': 'center' }, [
          comp('knob', { label: 'Low', value: 45, color: 'var(--color-primary)' }),
          comp('knob', { label: 'Low-Mid', value: 52, color: 'var(--color-primary)' }),
          comp('knob', { label: 'Hi-Mid', value: 60, color: 'var(--color-accent)' }),
          comp('knob', { label: 'High', value: 58, color: 'var(--color-accent)' }),
          comp('stepper', { label: 'Q', value: 4, min: 1, max: 12, step: 1 }),
        ]),
        comp('row', {}, { gap: '18px', 'flex-wrap': 'wrap', 'justify-content': 'center', width: '100%', 'max-width': '760px', 'align-items': 'stretch' }, [
          comp('panel', { title: 'COMPRESSOR' }, { flex: '1', 'min-width': '300px' }, [
            comp('knob', { label: 'Thresh', value: 35, unit: 'dB', color: 'var(--color-primary)' }),
            comp('knob', { label: 'Ratio', value: 50, color: 'var(--color-primary)' }),
            comp('knob', { label: 'Attack', value: 20, color: 'var(--color-accent)' }),
            comp('knob', { label: 'Release', value: 60, color: 'var(--color-accent)' }),
          ]),
          comp('panel', { title: 'OUTPUT' }, {}, [
            comp('slider', { label: 'Gain', orient: 'vertical', value: 64, length: 130 }),
            comp('meter', { label: 'GR', orient: 'vertical', value: -4, segments: 16, length: 130 }),
            comp('meter', { label: 'OUT', orient: 'vertical', value: -8, segments: 16, length: 130 }),
          ]),
        ]),
      ]),
    ]),
  },
  {
    id: 'au-sampler', name: 'Sampler pads', tag: 'Beat maker', category: 'Audio', theme: 'neon',
    thumb: gthumb('#0a0612', '#d946ef', 'pads', true),
    build: () => pageRoot([
      comp('section', {}, { padding: '24px', gap: '18px', 'align-items': 'center', 'min-height': '100vh', background: 'radial-gradient(120% 140% at 50% 0, var(--color-surface), var(--color-bg))' }, [
        comp('row', {}, { 'align-items': 'center', gap: '24px', 'justify-content': 'center', 'flex-wrap': 'wrap' }, [
          comp('heading', { text: 'MPC—16', level: '3' }, { 'letter-spacing': '.16em', 'font-size': '1.1rem' }),
          comp('knob', { label: 'Volume', value: 70, color: 'var(--color-primary)' }),
          comp('knob', { label: 'Swing', value: 30, color: 'var(--color-accent)' }),
          comp('toggle', { label: 'Rec', on: false, color: 'var(--color-accent)' }),
        ]),
        comp('panel', { title: 'PADS' }, { width: '100%', 'max-width': '480px', 'justify-content': 'center' },
          Array.from({ length: 16 }, (_, i) => comp('toggle', { label: 'P' + (i + 1), on: [0, 4, 5, 10, 12].includes(i), color: 'var(--color-primary)' })),
        ),
        comp('row', {}, { gap: '18px', 'flex-wrap': 'wrap', 'justify-content': 'center', 'align-items': 'stretch', width: '100%', 'max-width': '480px' }, [
          comp('panel', { title: 'SAMPLE' }, { flex: '1' }, [
            comp('knob', { label: 'Pitch', value: 50, color: 'var(--color-accent)' }),
            comp('knob', { label: 'Start', value: 12, color: 'var(--color-primary)' }),
            comp('knob', { label: 'Decay', value: 64, color: 'var(--color-primary)' }),
          ]),
          comp('panel', { title: 'OUT' }, {}, [
            comp('meter', { label: 'L', orient: 'vertical', value: -6, segments: 14, length: 110 }),
            comp('meter', { label: 'R', orient: 'vertical', value: -8, segments: 14, length: 110 }),
          ]),
        ]),
      ]),
    ]),
  },
  {
    id: 'au-reverb', name: 'Reverb / FX', tag: 'Space plugin', category: 'Audio', theme: 'midnight',
    thumb: gthumb('#070b14', '#3b82f6', 'split', true),
    build: () => pageRoot([
      comp('section', {}, { padding: '24px', gap: '20px', 'align-items': 'center', 'min-height': '100vh', background: 'radial-gradient(120% 140% at 50% 0, var(--color-surface), var(--color-bg))' }, [
        comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', width: '100%', 'max-width': '680px' }, [
          comp('heading', { text: 'CATHEDRAL', level: '3' }, { 'font-family': 'var(--font-display)', 'letter-spacing': '.18em', 'font-size': '1.1rem' }),
          comp('stepper', { label: 'Preset', value: 3, min: 1, max: 24, step: 1 }),
          comp('toggle', { label: 'Power', on: true, color: 'var(--color-primary)' }),
        ]),
        comp('panel', { title: 'SPACE' }, { flex: '1', width: '100%', 'max-width': '680px', 'align-items': 'center', 'justify-content': 'center' }, [
          comp('xy', { 'label-x': 'Size', 'label-y': 'Decay', x: 0.6, y: 0.7, size: 200 }),
        ]),
        comp('panel', { title: 'TONE & MIX' }, { width: '100%', 'max-width': '680px', 'justify-content': 'center' }, [
          comp('knob', { label: 'Pre-delay', value: 30, unit: 'ms', color: 'var(--color-primary)' }),
          comp('knob', { label: 'Damping', value: 55, color: 'var(--color-primary)' }),
          comp('knob', { label: 'Width', value: 80, color: 'var(--color-accent)' }),
          comp('knob', { label: 'Mix', value: 40, color: 'var(--color-accent)' }),
          comp('meter', { label: 'OUT', orient: 'vertical', value: -10, segments: 14, length: 110 }),
        ]),
      ]),
    ]),
  },

  /* ===================== MOBILE ===================== */
  {
    id: 'mo-profile', name: 'Profile screen', tag: 'App screen', category: 'Mobile', theme: 'grape',
    thumb: gthumb('#0b0716', '#a855f7', 'phone', true),
    build: () => phone([
      comp('appbar', { title: 'Profile', left: 'layers', right: 'star' }),
      comp('section', {}, { padding: '24px 18px', gap: '18px', 'align-items': 'stretch', flex: '1', 'background-color': 'var(--color-surface)' }, [
        comp('stack', {}, { 'align-items': 'center', gap: '8px' }, [
          comp('avatar', { size: 88, ring: true, status: 'online' }),
          comp('heading', { text: 'Maya Chen', level: '2' }, { 'font-size': 'var(--fs-lg)' }),
          comp('text', { text: 'Product designer · San Francisco' }, { color: 'var(--color-muted)', 'font-size': '.85rem', margin: '0' }),
          comp('button', { text: 'Edit profile', variant: 'outline', size: 'sm' }),
        ]),
        comp('row', {}, { gap: '10px', 'justify-content': 'center' }, [
          comp('stack', {}, { 'align-items': 'center', gap: '0', flex: '1' }, [comp('heading', { text: '248', level: '3' }), comp('text', { text: 'Posts' }, { color: 'var(--color-muted)', 'font-size': '.78rem', margin: '0' })]),
          comp('stack', {}, { 'align-items': 'center', gap: '0', flex: '1' }, [comp('heading', { text: '12.4k', level: '3' }), comp('text', { text: 'Followers' }, { color: 'var(--color-muted)', 'font-size': '.78rem', margin: '0' })]),
          comp('stack', {}, { 'align-items': 'center', gap: '0', flex: '1' }, [comp('heading', { text: '321', level: '3' }), comp('text', { text: 'Following' }, { color: 'var(--color-muted)', 'font-size': '.78rem', margin: '0' })]),
        ]),
        comp('gallery', { cols: 3, gap: 6 }),
      ]),
      comp('tabbar', { items: 'globe|Feed\nlayers|Explore\nheart|Likes\nstar|You', active: 4 }),
    ]),
  },
  {
    id: 'mo-checkout', name: 'Checkout screen', tag: 'App screen', category: 'Mobile', theme: 'emerald',
    thumb: gthumb('#04140d', '#10b981', 'phone', true),
    build: () => phone([
      comp('appbar', { title: 'Checkout', left: 'layers', right: '' }),
      comp('section', {}, { padding: '20px 18px', gap: '16px', 'align-items': 'stretch', flex: '1', 'background-color': 'var(--color-surface)' }, [
        comp('steps', { items: 'Cart\nPay\nDone', active: 2 }),
        comp('card', {}, { gap: '10px', padding: '18px' }, [
          comp('heading', { text: 'Order', level: '4' }, { 'font-size': '.95rem' }),
          comp('row', {}, { 'justify-content': 'space-between' }, [comp('text', { text: 'Aero One' }, { margin: '0', 'font-size': '.9rem' }), comp('text', { text: '$279.00' }, { margin: '0', 'font-size': '.9rem' })]),
          comp('row', {}, { 'justify-content': 'space-between' }, [comp('text', { text: 'Shipping' }, { margin: '0', 'font-size': '.9rem', color: 'var(--color-muted)' }), comp('text', { text: 'Free' }, { margin: '0', 'font-size': '.9rem' })]),
          comp('divider', {}),
          comp('row', {}, { 'justify-content': 'space-between' }, [comp('heading', { text: 'Total', level: '4' }, { 'font-size': '1rem' }), comp('heading', { text: '$279.00', level: '4' }, { 'font-size': '1rem', color: 'var(--color-primary)' })]),
        ]),
        comp('stack', {}, { gap: '12px' }, [
          comp('input', { label: 'Card number', type: 'text', placeholder: '1234 5678 9012 3456' }),
          comp('row', {}, { gap: '10px' }, [comp('input', { label: 'Expiry', type: 'text', placeholder: 'MM/YY' }, { flex: '1' }), comp('input', { label: 'CVC', type: 'text', placeholder: '123' }, { flex: '1' })]),
        ]),
        comp('button', { text: 'Pay $279.00', variant: 'primary', size: 'lg' }, { width: '100%' }),
        comp('text', { text: 'Secured with 256-bit encryption' }, { color: 'var(--color-muted)', 'font-size': '.78rem', 'text-align': 'center', margin: '0' }),
      ]),
    ]),
  },
  {
    id: 'mo-feed', name: 'Social feed', tag: 'App screen', category: 'Mobile', theme: 'rose',
    thumb: gthumb('#1a0810', '#fb7185', 'phone', true),
    build: () => phone([
      comp('appbar', { title: 'Feed', left: 'layers', right: 'heart' }),
      comp('section', {}, { padding: '14px', gap: '14px', 'align-items': 'stretch', flex: '1', 'background-color': 'var(--color-surface)' }, [
        comp('row', {}, { gap: '12px', 'flex-wrap': 'nowrap', 'overflow-x': 'auto' },
          ['Maya', 'Leo', 'Ada', 'Kai', 'Noor'].map((nm) => comp('stack', {}, { 'align-items': 'center', gap: '4px' }, [comp('avatar', { size: 56, ring: true }), comp('text', { text: nm }, { 'font-size': '.72rem', color: 'var(--color-muted)', margin: '0' })])),
        ),
        ...[['Maya Chen', '2h'], ['Leo Park', '5h']].map(([author, when]) => comp('card', {}, { padding: '0', gap: '0', overflow: 'hidden' }, [
          comp('row', {}, { 'align-items': 'center', gap: '10px', padding: '12px' }, [
            comp('avatar', { size: 36 }),
            comp('stack', {}, { gap: '0', flex: '1' }, [comp('heading', { text: author, level: '4' }, { 'font-size': '.9rem' }), comp('text', { text: when }, { color: 'var(--color-muted)', 'font-size': '.74rem', margin: '0' })]),
          ]),
          comp('image', { alt: 'Post' }, { 'border-radius': '0', 'aspect-ratio': '1' }),
          comp('row', {}, { gap: '16px', padding: '12px' }, [comp('icon', { icon: 'outline:heart', size: 22 }), comp('icon', { icon: 'outline:star', size: 22 }), comp('icon', { icon: 'outline:globe', size: 22 })]),
        ])),
      ]),
      comp('tabbar', { items: 'globe|Feed\nlayers|Search\nheart|Activity\nstar|Profile', active: 1 }),
    ]),
  },
  {
    id: 'mo-settings', name: 'Settings screen', tag: 'App screen', category: 'Mobile', theme: 'steel',
    thumb: gthumb('#0e1318', '#64748b', 'phone', true),
    build: () => phone([
      comp('appbar', { title: 'Settings', left: 'layers', right: '' }),
      comp('section', {}, { padding: '18px', gap: '16px', 'align-items': 'stretch', flex: '1', 'background-color': 'var(--color-surface)' }, [
        comp('row', {}, { 'align-items': 'center', gap: '12px', padding: '14px', 'background-color': 'var(--color-bg)', 'border-radius': 'var(--radius)', border: '1px solid var(--color-border)' }, [
          comp('avatar', { size: 48 }),
          comp('stack', {}, { gap: '2px', flex: '1' }, [comp('heading', { text: 'Sam Rivera', level: '4' }, { 'font-size': '.95rem' }), comp('text', { text: 'sam@email.com' }, { color: 'var(--color-muted)', 'font-size': '.78rem', margin: '0' })]),
          comp('icon', { icon: 'outline:zap', size: 18 }, { color: 'var(--color-muted)' }),
        ]),
        comp('stack', {}, { gap: '0', 'background-color': 'var(--color-bg)', 'border-radius': 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' }, [
          comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', padding: '14px', 'flex-wrap': 'nowrap', 'border-bottom': '1px solid var(--color-border)' }, [comp('text', { text: 'Notifications' }, { margin: '0' }), comp('toggle', { label: '', on: true })]),
          comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', padding: '14px', 'flex-wrap': 'nowrap', 'border-bottom': '1px solid var(--color-border)' }, [comp('text', { text: 'Dark appearance' }, { margin: '0' }), comp('toggle', { label: '', on: true })]),
          comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', padding: '14px', 'flex-wrap': 'nowrap' }, [comp('text', { text: 'Sounds' }, { margin: '0' }), comp('toggle', { label: '', on: false })]),
        ]),
        comp('list', { items: 'Privacy\nLinked accounts\nHelp & support\nAbout', marker: 'arrow' }),
        comp('button', { text: 'Sign out', variant: 'outline' }, { width: '100%' }),
      ]),
      comp('tabbar', { items: 'globe|Home\nlayers|Browse\nheart|Saved\nstar|Settings', active: 4 }),
    ]),
  },

  /* ===================== UTILITY ===================== */
  {
    id: 'ut-maintenance', name: 'Maintenance', tag: 'Down for work', category: 'Utility', theme: 'amber',
    thumb: gthumb('#1a1206', '#f59e0b', 'card', true),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '24px', gap: '16px', background: 'radial-gradient(120% 120% at 50% 0, color-mix(in srgb,var(--color-primary) 18%,var(--color-bg)), var(--color-bg))' }, [
        anim(comp('icon', { icon: 'outline:zap', size: 56 }), 'zoom-in'),
        anim(comp('heading', { text: 'We’ll be right back', level: '1' }, { 'text-align': 'center', 'font-size': 'clamp(2.2rem,6vw,3.6rem)', 'max-width': '16ch' }), 'rise', 80),
        anim(comp('text', { text: 'We’re performing scheduled maintenance to make things faster. Expected back by 3:00pm UTC.' }, { 'text-align': 'center', color: 'var(--color-muted)', 'max-width': '40ch' }), 'fade-up', 160),
        anim(comp('badge', { text: 'Follow @status for updates', variant: 'outline' }), 'fade-up', 240),
      ]),
    ]),
  },
  {
    id: 'ut-thankyou', name: 'Thank you', tag: 'Confirmation', category: 'Utility', theme: 'sage',
    thumb: gthumb('#f1f6f0', '#4d7c5a', 'card'),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '24px', gap: '16px', 'background-color': 'var(--color-surface)' }, [
        anim(comp('card', {}, { 'max-width': '440px', width: '100%', padding: '40px', gap: '16px', 'align-items': 'center', 'text-align': 'center' }, [
          comp('icon', { icon: 'outline:check', size: 48 }, { width: '80px', height: '80px', 'border-radius': '50%', background: 'color-mix(in srgb,var(--color-primary) 16%,transparent)', color: 'var(--color-primary)' }),
          comp('heading', { text: 'You’re all set', level: '1' }, { 'font-size': 'var(--fs-xl)' }),
          comp('text', { text: 'Thanks for your order! A confirmation is on its way to your inbox. Order #NW-48213.' }, { color: 'var(--color-muted)', margin: '0' }),
          comp('button', { text: 'View order', variant: 'primary', size: 'lg' }, { width: '100%' }),
          comp('link', { text: 'Back to shop', href: '#' }, { 'font-size': '.88rem' }),
        ]), 'zoom-in'),
      ]),
    ]),
  },
  {
    id: 'ut-500', name: 'Server error', tag: '500', category: 'Utility', theme: 'crimson',
    thumb: gthumb('#160608', '#ef4444', 'card', true),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '24px', gap: '14px' }, [
        anim(comp('heading', { text: '500', level: '1' }, { 'font-size': 'clamp(5rem,18vw,12rem)', 'line-height': '1' }), 'zoom-in'),
        comp('heading', { text: 'Something broke on our end', level: '3' }, { color: 'var(--color-muted)', 'text-align': 'center' }),
        comp('text', { text: 'We’ve been notified and are on it. Try again in a moment.' }, { color: 'var(--color-muted)', 'text-align': 'center', margin: '0' }),
        comp('row', {}, { gap: '10px' }, [comp('button', { text: 'Retry', variant: 'primary', size: 'lg' }), comp('button', { text: 'Status page', variant: 'outline', size: 'lg' })]),
      ]),
    ]),
  },
  {
    id: 'ut-status', name: 'Status page', tag: 'Uptime', category: 'Utility', theme: 'graphite',
    thumb: gthumb('#0f1115', '#94a3b8', 'list', true),
    build: () => pageRoot([
      comp('navbar', { brand: 'Northwind Status', links: 'History, Subscribe', cta: 'Dashboard', variant: 'solid' }),
      sectionWrap([
        anim(comp('alert', { title: 'All systems operational', text: 'All services are running normally. Last checked just now.', variant: 'success' }), 'fade-up'),
        comp('stack', {}, { gap: '0', 'background-color': 'var(--color-surface)', 'border-radius': 'var(--radius)', border: '1px solid var(--color-border)', overflow: 'hidden' },
          [['API', 'Operational'], ['Dashboard', 'Operational'], ['Webhooks', 'Operational'], ['Exports', 'Degraded'], ['Authentication', 'Operational']].map(([svc, st], i, arr) =>
            comp('row', {}, { 'align-items': 'center', 'justify-content': 'space-between', padding: '16px', 'flex-wrap': 'nowrap', 'border-bottom': i < arr.length - 1 ? '1px solid var(--color-border)' : '0' }, [
              comp('text', { text: svc }, { margin: '0', 'font-weight': '500' }),
              comp('badge', { text: st, variant: 'soft' }, st === 'Degraded' ? { background: 'color-mix(in srgb,var(--color-danger) 16%,transparent)', color: 'var(--color-danger)' } : { background: 'color-mix(in srgb,var(--color-success) 16%,transparent)', color: 'var(--color-success)' }),
            ])),
        ),
        comp('card', {}, { gap: '12px' }, [
          comp('heading', { text: '90-day uptime', level: '3' }, { 'font-size': '1.05rem' }),
          comp('chart', { type: 'line', data: 'Mar:99.99\nApr:99.97\nMay:99.95', height: 160, grid: true }),
        ]),
        comp('timeline', { items: 'May 24|Exports degraded|Investigating elevated latency on large exports.\nMay 02|Resolved|API latency back to normal.\nApr 18|Maintenance|Database upgrade completed.' }),
      ], { 'max-width': '760px' }),
      comp('footer', { brand: 'Northwind' }),
    ]),
  },
  {
    id: 'ut-reset', name: 'Password reset', tag: 'Auth flow', category: 'Utility', theme: 'indigo',
    thumb: gthumb('#0a0a1f', '#6366f1', 'card', true),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '24px', 'background-color': 'var(--color-surface)' }, [
        anim(comp('card', {}, { 'max-width': '400px', width: '100%', padding: '34px', gap: '16px' }, [
          comp('icon', { icon: 'outline:shield', size: 30 }, { 'align-self': 'center' }),
          comp('heading', { text: 'Reset your password', level: '2' }, { 'text-align': 'center', 'font-size': 'var(--fs-lg)' }),
          comp('text', { text: 'Enter the email on your account and we’ll send a secure reset link.' }, { 'text-align': 'center', color: 'var(--color-muted)', margin: '0', 'font-size': '.9rem' }),
          comp('input', { label: 'Email', type: 'email', placeholder: 'you@company.com' }),
          comp('button', { text: 'Send reset link', variant: 'primary' }, { width: '100%' }),
          comp('link', { text: '← Back to sign in', href: '#' }, { 'text-align': 'center', 'font-size': '.85rem' }),
        ]), 'zoom-in'),
      ]),
    ]),
  },

  /* ===================== MUSIC ===================== */
  {
    id: 'mu-album', name: 'Album release', tag: 'New record', category: 'Music', theme: 'wine',
    thumb: gthumb('#140208', '#be123c', 'split', true),
    build: () => pageRoot([
      comp('navbar', { brand: 'HAVEN', links: 'Music, Tour, Store', cta: 'Listen', variant: 'glass' }),
      comp('section', {}, { padding: '56px 24px', 'align-items': 'center', background: 'radial-gradient(120% 120% at 50% 0, var(--color-surface), var(--color-bg))' }, [
        anim(comp('release', { title: 'After Hours', artist: 'Haven', type: 'Album', links: 'Spotify, Apple Music, Bandcamp, Tidal' }), 'fade-up'),
      ]),
      comp('section', {}, { padding: '24px', 'max-width': '760px', margin: '0 auto', width: '100%', gap: '24px', 'align-items': 'stretch' }, [
        anim(comp('audioplayer', { title: 'After Hours', artist: 'Haven' }), 'fade-up'),
        anim(comp('tracklist', { title: 'Tracklist', tracks: 'Dusk|1:42\nAfter Hours|3:58\nCity Lights|4:12\nUndertow|3:30\nStill|5:08\nDawn|2:51' }), 'fade-up', 80),
      ]),
      comp('cta', { title: 'Out everywhere now', subtitle: 'Stream, buy, or grab the vinyl.', button: 'Listen now' }),
      comp('footer', { brand: 'Haven', tagline: 'New album out now.', cols: 'Music: Albums, Singles | Live: Tour | Follow: Instagram, YouTube' }),
    ]),
  },
  {
    id: 'mu-festival', name: 'Festival lineup', tag: 'Event', category: 'Music', theme: 'sunrise',
    thumb: gthumb('#1a0d04', '#fb923c', 'hero', true),
    build: () => pageRoot([
      comp('navbar', { brand: 'SOLARIS', links: 'Lineup, Tickets, Info', cta: 'Get passes', variant: 'glass' }, { 'background-color': 'transparent' }),
      comp('section', {}, { padding: '110px 24px 64px', 'align-items': 'center', gap: '16px', background: 'radial-gradient(130% 120% at 50% 0, color-mix(in srgb,var(--color-primary) 26%,var(--color-bg)), var(--color-bg))' }, [
        anim(comp('badge', { text: 'Aug 14–16 · Desert Mesa', variant: 'soft' }), 'fade'),
        anim(comp('heading', { text: 'SOLARIS ’26', level: '1' }, { 'text-align': 'center', 'font-size': 'clamp(3rem,10vw,7rem)', 'letter-spacing': '.04em', 'line-height': '1' }), 'rise', 80),
        anim(comp('text', { text: 'Three days. Four stages. Sunrise sets in the dunes.' }, { 'text-align': 'center', color: 'var(--color-muted)' }), 'fade-up', 160),
        anim(comp('button', { text: 'Get passes', variant: 'primary', size: 'lg' }), 'fade-up', 220),
      ]),
      sectionWrap([
        anim(comp('heading', { text: 'Lineup', level: '2' }, { 'text-align': 'center' }), 'fade-up'),
        comp('grid', { cols: 4 }, { 'grid-template-columns': 'repeat(4,minmax(0,1fr))', gap: '20px' },
          [['Aurora Skye', 'Friday · Main'], ['The Lumens', 'Friday · Sands'], ['Kojo', 'Saturday · Main'], ['Mira', 'Saturday · Dome'], ['Velvet Static', 'Saturday · Sands'], ['Nightjar', 'Sunday · Main'], ['Halo Drift', 'Sunday · Dome'], ['+ 40 more', 'All weekend']].map(([n, r]) => speakerCard(n, r))),
      ]),
      comp('pricing', { plans: 'Day pass|$129|Single day;All stages\n3-day|$299|All three days;In/out privileges;Locker\nVIP|$649|3-day;Viewing deck;Lounge;Express entry', featured: 2 }),
      comp('cta', { title: 'See you in the desert', subtitle: 'Passes are selling fast.', button: 'Get passes' }),
      comp('footer', { brand: 'Solaris' }),
    ]),
  },
  {
    id: 'mu-epk', name: 'Producer EPK', tag: 'Press kit', category: 'Music', theme: 'lavender',
    thumb: gthumb('#0f0a1a', '#a78bfa', 'split', true),
    build: () => pageRoot([
      comp('navbar', { brand: 'NOVA', links: 'Music, About, Booking', cta: 'Book', variant: 'minimal' }, { 'background-color': 'transparent' }),
      comp('section', {}, { padding: '64px 24px', 'max-width': 'var(--container)', margin: '0 auto', width: '100%' }, [
        comp('row', {}, { gap: '40px', 'align-items': 'center', 'flex-wrap': 'wrap' }, [
          anim(comp('image', { alt: 'Nova' }, { width: '220px', height: '220px', 'border-radius': 'var(--radius-lg)', 'box-shadow': 'var(--shadow-lg)' }), 'zoom-in'),
          comp('stack', {}, { gap: '12px', flex: '1', 'min-width': '280px' }, [
            comp('badge', { text: 'DJ · Producer · Berlin', variant: 'soft' }, { 'align-self': 'flex-start' }),
            comp('heading', { text: 'NOVA', level: '1' }, { 'font-size': 'var(--fs-3xl)', 'letter-spacing': '.1em' }),
            comp('text', { text: 'Melodic techno built for the hour before sunrise. Resident at Pulse, with releases on Drift and Afterlight.' }, { color: 'var(--color-muted)' }),
            comp('row', {}, { gap: '10px' }, [comp('button', { text: 'Booking inquiry', variant: 'primary' }), comp('button', { text: 'Download press kit', variant: 'outline' })]),
          ]),
        ]),
      ]),
      comp('stat', { items: '2.1M|Monthly listeners\n14|Releases\n40+|Cities played\n2019|Since' }, { 'background-color': 'var(--color-surface)' }),
      comp('section', {}, { padding: '24px', 'max-width': '760px', margin: '0 auto', width: '100%', gap: '20px', 'align-items': 'stretch' }, [
        comp('heading', { text: 'Latest single', level: '2' }),
        comp('audioplayer', { title: 'Solstice', artist: 'Nova' }),
        comp('tracklist', { title: 'Selected works', tracks: 'Solstice|6:24\nUndercurrent|7:02\nViolet Hour|5:48\nRemnant|6:55' }),
      ]),
      comp('section', {}, { padding: '8px 24px 48px', 'align-items': 'center', gap: '12px' }, [
        anim(comp('tour', { title: 'Upcoming dates' }), 'fade-up'),
      ]),
      comp('footer', { brand: 'Nova', tagline: 'For bookings: hello@nova.fm', cols: 'Music: Releases, Mixes | Live: Tour | Follow: Instagram, SoundCloud' }),
    ]),
  },
  {
    id: 'mu-single', name: 'Single / track', tag: 'Track page', category: 'Music', theme: 'bubblegum',
    thumb: gthumb('#fff0f6', '#ec4899', 'card'),
    build: () => pageRoot([
      comp('section', {}, { 'min-height': '100vh', 'align-items': 'center', 'justify-content': 'center', padding: '48px 24px', gap: '24px', background: 'radial-gradient(120% 90% at 50% 0, color-mix(in srgb,var(--color-primary) 22%,var(--color-bg)), var(--color-bg))' }, [
        anim(comp('image', { alt: 'Single art' }, { width: '280px', height: '280px', 'border-radius': 'var(--radius-lg)', 'box-shadow': 'var(--shadow-lg)' }), 'zoom-in'),
        comp('stack', {}, { 'align-items': 'center', gap: '6px' }, [
          comp('badge', { text: 'New single', variant: 'soft' }),
          comp('heading', { text: 'Sugar Static', level: '1' }, { 'font-size': 'var(--fs-2xl)', 'text-align': 'center' }),
          comp('text', { text: 'by Candyfloss' }, { color: 'var(--color-muted)', margin: '0' }),
        ]),
        anim(comp('audioplayer', { title: 'Sugar Static', artist: 'Candyfloss' }, { width: '100%', 'max-width': '460px' }), 'fade-up'),
        comp('row', {}, { gap: '10px', 'justify-content': 'center', 'flex-wrap': 'wrap' }, [
          comp('button', { text: 'Spotify', variant: 'primary' }), comp('button', { text: 'Apple Music', variant: 'outline' }), comp('button', { text: 'Bandcamp', variant: 'outline' }),
        ]),
      ]),
    ]),
  },
];
