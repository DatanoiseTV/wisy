/* ============================================================
   Wisy renderer.
   - renderNode(): node tree → real DOM (editor + export share it)
   - BASE_CSS: component look, token-driven (shipped to exports)
   - buildDocCss(): per-node style rules incl. responsive @media
   ============================================================ */
import { REG } from './registry.js';
import { effectiveStyle } from './state.js';

export function renderNode(node, ctx = {}) {
  const d = REG[node.type];
  if (!d) return document.createComment('unknown:' + node.type);
  const el = d.render(node, ctx);
  if (!el || el.nodeType !== 1) return el;
  el.classList.add('n-' + node.id);
  if (ctx.editor) el.setAttribute('data-wid', node.id);

  if (d.container) {
    const slot = d.slot ? el.querySelector(d.slot) : el;
    const kids = node.children || [];
    if (slot) {
      kids.forEach((c) => slot.append(renderNode(c, ctx)));
      if (ctx.editor && kids.length === 0) slot.classList.add('wc-empty');
    }
  }
  return el;
}

/* ---- per-node CSS ---- */
function styleBlock(sel, style) {
  const entries = Object.entries(style || {}).filter(([, v]) => v !== '' && v != null);
  if (!entries.length) return '';
  return `${sel}{${entries.map(([k, v]) => `${k}:${v}`).join(';')}}`;
}
export function nodeCss(node) {
  let css = '';
  const base = node.style?.base || {};
  if (Object.keys(base).length) css += styleBlock(`.n-${node.id}`, base);
  const tablet = node.style?.tablet || {};
  const mobile = node.style?.mobile || {};
  for (const c of node.children || []) css += nodeCss(c);
  // media queries appended separately by buildDocCss for ordering
  node.__mq = { tablet, mobile };
  return css;
}
export function buildDocCss(root) {
  let base = '', tablet = '', mobile = '';
  const walk = (node) => {
    const b = node.style?.base || {}, t = node.style?.tablet || {}, m = node.style?.mobile || {};
    if (Object.keys(b).length) base += styleBlock(`.n-${node.id}`, b);
    if (Object.keys(t).length) tablet += styleBlock(`.n-${node.id}`, t);
    if (Object.keys(m).length) mobile += styleBlock(`.n-${node.id}`, m);
    (node.children || []).forEach(walk);
  };
  walk(root);
  let out = base;
  if (tablet) out += `\n@media (max-width:1024px){${tablet}}`;
  if (mobile) out += `\n@media (max-width:640px){${mobile}}`;
  return out;
}

/* ---- component base stylesheet (token-driven) ---- */
export const BASE_CSS = `
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--font-ui);font-size:var(--text-base);line-height:var(--leading);color:var(--color-text);background:var(--color-bg);font-weight:var(--weight-body);text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;font-feature-settings:"kern" 1,"liga" 1,"calt" 1;letter-spacing:var(--tracking)}
h1,h2,h3,h4,h5,h6{font-family:var(--font-display);color:var(--color-strong);line-height:var(--leading-tight);letter-spacing:var(--tracking-tight);font-weight:var(--weight-heading);margin:0;text-wrap:balance}
p{text-wrap:pretty}
img{max-width:100%}
a{color:inherit}
:focus-visible{outline:2px solid var(--color-primary);outline-offset:2px}

/* primitives */
.wc-section,.wc-container,.wc-row,.wc-grid,.wc-stack,.wc-card{box-sizing:border-box}
.wc-link{transition:opacity .15s}.wc-link:hover{opacity:.7}

/* buttons */
.wc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--font-ui);font-weight:600;text-decoration:none;border:1px solid transparent;border-radius:var(--radius);cursor:pointer;transition:transform .12s ease,box-shadow .15s ease,background .15s ease,opacity .15s;white-space:nowrap;line-height:1}
.wc-btn--sm{padding:8px 14px;font-size:.875rem}
.wc-btn--md{padding:11px 20px;font-size:.95rem}
.wc-btn--lg{padding:15px 28px;font-size:1.0625rem}
.wc-btn--primary{background:var(--color-primary);color:var(--color-primary-contrast);box-shadow:var(--shadow)}
.wc-btn--primary:hover{transform:translateY(-1px);box-shadow:var(--shadow-lg)}
.wc-btn--secondary{background:var(--color-surface-2);color:var(--color-strong);border-color:var(--color-border)}
.wc-btn--secondary:hover{background:var(--color-border)}
.wc-btn--ghost{background:transparent;color:var(--color-strong)}
.wc-btn--ghost:hover{background:var(--color-surface)}
.wc-btn--outline{background:transparent;color:var(--color-strong);border-color:var(--color-border)}
.wc-btn--outline:hover{border-color:var(--color-primary);color:var(--color-primary)}

/* badge */
.wc-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;font-size:.78rem;font-weight:600;border-radius:99px;letter-spacing:.01em;line-height:1.4}
.wc-badge--soft{background:color-mix(in srgb,var(--color-primary) 14%,transparent);color:var(--color-primary)}
.wc-badge--solid{background:var(--color-primary);color:var(--color-primary-contrast)}
.wc-badge--outline{border:1px solid var(--color-border);color:var(--color-muted)}

/* icon */
.wc-icon{display:inline-grid;place-items:center}.wc-icon svg{width:100%;height:100%}

/* list */
.wc-list{list-style:none}.wc-list li{position:relative;padding-left:28px}
.wc-list--check li::before{content:"";position:absolute;left:0;top:.15em;width:18px;height:18px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 16%,transparent) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235b8cff' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E") center/12px no-repeat}
.wc-list--dot li::before{content:"";position:absolute;left:5px;top:.55em;width:6px;height:6px;border-radius:50%;background:var(--color-primary)}
.wc-list--arrow li::before{content:"→";position:absolute;left:0;color:var(--color-primary);font-weight:700}
.wc-list--none li{padding-left:0}
.wc-list[class*="wc-list--"] li{color:var(--color-text)}

/* navbar */
.wc-navbar{width:100%;border-bottom:1px solid var(--color-border);background:var(--color-bg)}
.wc-navbar--glass{background:color-mix(in srgb,var(--color-bg) 72%,transparent);backdrop-filter:blur(12px);position:sticky;top:0;z-index:50}
.wc-navbar--minimal{border-bottom:0}
.wc-navbar__inner{max-width:var(--container);margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:28px}
.wc-navbar__brand{font-family:var(--font-display);font-weight:800;font-size:1.2rem;color:var(--color-strong);text-decoration:none;letter-spacing:var(--tracking-tight)}
.wc-navlinks{display:flex;gap:22px;margin-left:auto}
.wc-navlinks a{color:var(--color-muted);text-decoration:none;font-size:.95rem;font-weight:500;transition:color .15s}
.wc-navlinks a:hover{color:var(--color-strong)}
.wc-navbar__inner>.wc-btn{margin-left:8px}

/* hero */
.wc-hero{width:100%;padding:96px 24px;overflow:hidden;position:relative}
.wc-hero--gradient{background:radial-gradient(120% 120% at 50% 0,color-mix(in srgb,var(--color-primary) 16%,var(--color-bg)) 0,var(--color-bg) 55%)}
.wc-hero--spotlight{background:var(--color-strong)}.wc-hero--spotlight .wc-hero__title{color:var(--color-bg)}.wc-hero--spotlight .wc-hero__sub{color:color-mix(in srgb,var(--color-bg) 70%,transparent)}
.wc-hero__inner{max-width:860px;margin:0 auto;display:flex;flex-direction:column;gap:22px}
.wc-hero--center .wc-hero__inner{align-items:center;text-align:center}
.wc-hero--left .wc-hero__inner{align-items:flex-start;text-align:left;margin-left:max(24px,calc((100% - var(--container))/2))}
.wc-hero__eyebrow{display:inline-flex;align-self:var(--_a,center);padding:6px 14px;border-radius:99px;background:color-mix(in srgb,var(--color-primary) 12%,transparent);color:var(--color-primary);font-size:.82rem;font-weight:600;letter-spacing:.02em}
.wc-hero--left .wc-hero__eyebrow{align-self:flex-start}
.wc-hero__title{font-size:clamp(2.4rem,5vw,var(--fs-4xl));font-weight:var(--weight-heading)}
.wc-hero__sub{font-size:1.18rem;color:var(--color-muted);max-width:60ch;line-height:1.55}
.wc-hero__cta{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px}
.wc-hero--center .wc-hero__cta{justify-content:center}

/* feature */
.wc-feature{width:100%;padding:80px 24px;max-width:calc(var(--container) + 48px);margin:0 auto}
.wc-feature__title{font-size:var(--fs-2xl);text-align:center;margin-bottom:48px}
.wc-feature__grid{display:grid;gap:22px}
.wc-feature__card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:26px;display:flex;flex-direction:column;gap:12px;transition:transform .18s ease,box-shadow .18s ease}
.wc-feature__card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg)}
.wc-feature__ic{width:44px;height:44px;border-radius:var(--radius);display:grid;place-items:center;background:color-mix(in srgb,var(--color-primary) 14%,transparent);color:var(--color-primary)}
.wc-feature__ic svg{width:24px;height:24px}
.wc-feature__card h3{font-size:1.18rem}.wc-feature__card p{color:var(--color-muted);font-size:.96rem;line-height:1.6;margin:0}

/* stat */
.wc-stat{width:100%;padding:56px 24px}
.wc-stat__row{max-width:var(--container);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:24px;text-align:center}
.wc-stat__val{font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:800;color:var(--color-strong);letter-spacing:var(--tracking-tight)}
.wc-stat__lbl{color:var(--color-muted);font-size:.92rem;margin-top:4px}

/* cta */
.wc-cta{width:100%;padding:64px 24px}
.wc-cta__inner{max-width:var(--container);margin:0 auto;background:linear-gradient(120deg,var(--color-primary),var(--color-accent));color:var(--color-primary-contrast);border-radius:var(--radius-lg);padding:56px 40px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px}
.wc-cta__inner h2{color:inherit;font-size:var(--fs-2xl)}
.wc-cta__inner p{color:inherit;opacity:.9;max-width:48ch;margin:0}
.wc-cta__inner .wc-btn--primary{background:var(--color-primary-contrast);color:var(--color-primary)}

/* quote */
.wc-quote{max-width:680px;margin:0 auto;padding:40px 24px;text-align:center}
.wc-quote blockquote{font-family:var(--font-display);font-size:1.5rem;line-height:1.45;color:var(--color-strong);margin:0 0 20px;font-weight:500;text-wrap:balance}
.wc-quote figcaption{display:flex;flex-direction:column;gap:2px;color:var(--color-muted);font-size:.92rem}
.wc-quote figcaption strong{color:var(--color-strong)}

/* pricing */
.wc-pricing{width:100%;padding:72px 24px}
.wc-pricing__row{max-width:var(--container);margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px;align-items:start}
.wc-pricing__card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:30px;display:flex;flex-direction:column;gap:14px}
.wc-pricing__card.is-featured{border-color:var(--color-primary);box-shadow:var(--shadow-lg);transform:scale(1.03);background:var(--color-bg)}
.wc-pricing__name{font-weight:600;color:var(--color-muted);text-transform:uppercase;letter-spacing:.05em;font-size:.8rem}
.wc-pricing__price{font-family:var(--font-display);font-size:var(--fs-2xl);font-weight:800;color:var(--color-strong)}
.wc-pricing__feats{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:9px;flex:1}
.wc-pricing__feats li{position:relative;padding-left:24px;color:var(--color-text);font-size:.93rem}
.wc-pricing__feats li::before{content:"✓";position:absolute;left:0;color:var(--color-primary);font-weight:700}
.wc-pricing__card .wc-btn{margin-top:6px}

/* footer */
.wc-footer{width:100%;background:var(--color-surface);border-top:1px solid var(--color-border);padding:56px 24px 28px;color:var(--color-muted)}
.wc-footer__top{max-width:var(--container);margin:0 auto;display:flex;flex-wrap:wrap;gap:48px;justify-content:space-between}
.wc-footer__brand strong{font-family:var(--font-display);font-size:1.3rem;color:var(--color-strong);display:block;margin-bottom:8px}
.wc-footer__brand p{max-width:34ch;margin:0;font-size:.93rem}
.wc-footer__cols{display:flex;gap:48px;flex-wrap:wrap}
.wc-footer__col{display:flex;flex-direction:column;gap:10px}
.wc-footer__col h4{font-size:.82rem;text-transform:uppercase;letter-spacing:.05em;color:var(--color-strong);margin-bottom:2px}
.wc-footer__col a{color:var(--color-muted);text-decoration:none;font-size:.92rem;transition:color .15s}
.wc-footer__col a:hover{color:var(--color-strong)}
.wc-footer__bottom{max-width:var(--container);margin:28px auto 0;padding-top:20px;border-top:1px solid var(--color-border);font-size:.85rem}

/* form */
.wc-field{display:flex;flex-direction:column;gap:6px}
.wc-field__label{font-size:.85rem;font-weight:500;color:var(--color-strong)}
.wc-input{width:100%;padding:11px 13px;border:1px solid var(--color-border);border-radius:var(--radius);background:var(--color-bg);color:var(--color-strong);font:inherit;font-size:.95rem;transition:border-color .15s,box-shadow .15s}
.wc-input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 18%,transparent)}
textarea.wc-input{resize:vertical;line-height:1.5}

/* panel (audio rack) */
.wc-panel{position:relative}
.wc-panel__title{position:absolute;top:-9px;left:16px;background:var(--color-surface-2);color:var(--color-muted);font-size:.66rem;font-weight:700;letter-spacing:.12em;padding:2px 8px;border-radius:4px}
.wc-panel__slot{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-end;width:100%}

/* mobile */
.wc-appbar{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--color-bg);border-bottom:1px solid var(--color-border);width:100%}
.wc-appbar__title{font-family:var(--font-display);font-weight:700;font-size:1.1rem;color:var(--color-strong)}
.wc-appbar__btn{width:36px;height:36px;display:grid;place-items:center;border:0;background:transparent;color:var(--color-muted);border-radius:var(--radius);cursor:pointer}
.wc-appbar__btn svg{width:22px;height:22px}.wc-appbar__btn:hover{background:var(--color-surface)}
.wc-tabbar{display:flex;background:var(--color-bg);border-top:1px solid var(--color-border);width:100%}
.wc-tabbar__item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 0;border:0;background:transparent;color:var(--color-muted);font-size:.68rem;cursor:pointer}
.wc-tabbar__ic svg{width:22px;height:22px}
.wc-tabbar__item.is-active{color:var(--color-primary)}

.wc-divider{border:0}
`;

/* editor-only overlay css injected into iframe to show drop targets */
export const EDITOR_CSS = `
[data-wid]{transition:outline .1s}
.wc-empty{min-height:60px;border:1.5px dashed color-mix(in srgb,var(--color-primary) 50%,transparent);border-radius:8px;display:flex !important;align-items:center;justify-content:center;position:relative}
.wc-empty::after{content:"Drop components here";color:var(--color-muted);font-size:12px;font-family:var(--font-ui);opacity:.7;pointer-events:none}
[data-wid][contenteditable=true]{outline:2px solid var(--color-primary);outline-offset:2px;cursor:text;border-radius:3px}
[data-wid]{cursor:default}
html,body{min-height:100%}
body{padding-bottom:1px}
.wc-drag-flash{animation:wcflash .4s ease}
@keyframes wcflash{from{background:color-mix(in srgb,var(--color-primary) 20%,transparent)}to{}}
`;
