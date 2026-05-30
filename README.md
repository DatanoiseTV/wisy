# Wisy

A parametric visual design studio for **websites, desktop apps (Tauri/Electron), and audio software UIs** (JUCE WebView, plugin front-ends). Design on a canvas; export clean, valid, dependency‑free **HTML5 + CSS + JS**.

No build step. Open `index.html` or serve the folder.

```bash
python3 -m http.server 5173   # then open http://localhost:5173
# or: npx serve .
```

## What it does

- **Iframe canvas** — the document renders in a real iframe, so responsive breakpoints and the exported result behave identically to what you design.
- **Parametric components** — Sections (navbar, hero, feature grid, stats, pricing, CTA, testimonial, footer), layout primitives (section/container/row/grid/stack/card), content, media, forms, and **audio/app UI widgets**: knob, slider, XY pad, toggle, level meter, stepper, rack panel. Mobile app bar + tab bar.
- **Inspector** — every component exposes typed properties; a generic style panel covers layout, spacing, size, typography, background/border, effects, and **animation**, scoped per responsive breakpoint (desktop/tablet/mobile).
- **Themes** — token‑driven design system (color, typography with curated Google‑font pairings, spacing, radius, shadow) with 8 presets and a live theme editor. Re‑theming is global and instant.
- **Animations** — entrance effects (fade/zoom/rise/blur/flip with direction, duration, delay, easing, scroll‑reveal or on‑load) and hover effects (lift/grow/sink/glow/tilt). A tiny `IntersectionObserver` runtime ships with the export.
- **Templates** — 15 production‑quality starts across Marketing / App / Audio / Mobile / Utility, with category filtering.
- **Pages** — multi‑page projects.
- **Export** — pretty‑printed, valid HTML5 per page + shared `styles.css` + `widgets.js`, packaged as a ZIP (dependency‑free, store‑only writer). Live preview and a syntax‑highlighted code viewer.
- **Editing** — drag from the library to insert, drag to reorder, resize handles, double‑click to edit text inline, undo/redo, zoom (fit / in / out / ⌘‑wheel), localStorage autosave.

## Architecture

Plain ES modules, zero dependencies.

| File | Responsibility |
|------|----------------|
| `src/state.js` | Document model, history/undo, pub‑sub store |
| `src/registry.js` | Component definitions (schema + render → semantic HTML) |
| `src/render.js` | Node→DOM renderer, base component CSS, per‑node + responsive CSS, animation CSS |
| `src/widgets.js` | Self‑contained custom elements (knob/slider/XY/…) + animation runtime — bundled into exports |
| `src/canvas.js` | Iframe canvas, selection overlay, drag/drop, resize, zoom |
| `src/inspector.js` | Parametric property + style + animation editor |
| `src/library.js` / `layers.js` / `pages.js` / `templates.js` / `theme-editor.js` | Panels |
| `src/export.js` | HTML/CSS/JS generation, ZIP, preview, code view |
| `src/dialog.js` | In‑app modals (replaces `window.confirm`) |

The renderer is shared between the editor and the export, so **what you see is what you ship**.

## Known limitations

- Cross‑page navigation links are not auto‑rewired on export (anchors are `#`).
- Resize handles adjust width/height (flow layout); free absolute positioning is available via the inspector `position` control.
- Persistence is local (browser `localStorage`); there is no cloud/collaboration layer.

## License

Private / unreleased.
