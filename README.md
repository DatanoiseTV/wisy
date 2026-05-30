<div align="center">

# Wisy

### A parametric visual design studio for the web, desktop & audio software UIs

Design on a canvas. Export clean, valid, dependency‑free **HTML5 + CSS + JS**.
No build step, no framework, no lock‑in.

<img src="docs/screenshots/editor.png" alt="Wisy editor" width="100%" />

</div>

---

## Why Wisy

Most visual builders ship bloated, unreadable markup you can never own. Wisy is built around one rule: **what you see on the canvas is exactly what you export** — because the editor and the export share the same renderer. The output is semantic HTML5, token‑driven CSS, and a tiny zero‑dependency runtime for the interactive widgets.

And it isn't only for marketing pages. The same engine builds **dashboards, mobile app screens, and audio software front‑ends** (JUCE WebView, plugin UIs) — with first‑class **knobs, sliders, XY pads, level meters, toggles and steppers** as real custom elements.

## Highlights

- 🧩 **45 parametric components** — sections (navbar, hero, feature grid, stats, pricing, testimonial, CTA, footer), layout primitives, content, **media** (image, gallery + lightbox, video player, image frame), **music/artist** (audio player, release, tracklist, tour), forms incl. contact, mobile bars — each fully customizable.
- 🎛️ **Audio‑grade UI widgets** — knob, slider (H/V), XY pad, level meter, toggle, stepper, rack panel. Real `<wisy-*>` custom elements, drag/scroll/keyboard interactive, shipped with your export.
- 🎨 **37 token‑based themes + a parametric palette generator** — pick a harmony (complementary / analogous / triadic…), drag hue/saturation/contrast and the whole site **morphs live**, with **WCAG contrast checking** built in. Presets and the generator are independent: randomize colors while keeping a preset's typography.
- 📱 **Real device presets** — iPhone, Pixel, Galaxy, iPad at exact logical sizes with correct aspect ratio and **constrained internal scroll** (1:1 at 100% zoom), plus fluid desktop/tablet/mobile breakpoints.
- ▶️ **Try mode** — flip into an interactive preview where links, widgets, animations and scrolling behave like the real site, on any device.
- ✨ **Animations** — entrance (fade / zoom / rise / blur / flip with direction, duration, delay, easing, scroll‑reveal or on‑load) and hover effects (lift / grow / sink / glow / tilt). Ships an `IntersectionObserver` runtime.
- ✍️ **Pro editing** — drag‑to‑insert, drag‑to‑reorder, resize handles, **inline rich text** with a floating typography toolbar (bold/italic/underline/font/size/align), **structured list editors** (drag rows — no more `a|b|c`), **slider + scrub‑number** controls, graphical 3×3 **alignment pad**, layers tree, multi‑page projects, undo/redo, autosave.
- 📦 **Clean export + project files** — pretty‑printed valid HTML per page + shared `styles.css` + `widgets.js`, packaged as a ZIP. Save/Open `.wisy.json` projects, live preview, and a syntax‑highlighted code viewer.

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/device.png" alt="Device presets in the editor" /><br/><sub><b>Real device presets</b> — exact phone sizes, constrained scroll</sub></td>
    <td width="50%"><img src="docs/screenshots/generator.png" alt="Palette generator" /><br/><sub><b>Parametric palette generator</b> — harmony + live morph + contrast</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/saas.png" alt="SaaS landing template" /><br/><sub><b>SaaS landing</b></sub></td>
    <td width="50%"><img src="docs/screenshots/agency.png" alt="Agency template" /><br/><sub><b>Agency</b> — bold dark</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/dashboard.png" alt="Dashboard template" /><br/><sub><b>Dashboard</b> — app shell</sub></td>
    <td width="50%"><img src="docs/screenshots/mixer.png" alt="Audio mixer template" /><br/><sub><b>Mixer</b> — audio console</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/plugin.png" alt="Audio plugin template" /><br/><sub><b>Synth plugin</b> — knobs, XY pad, meters</sub></td>
    <td width="50%"><img src="docs/screenshots/musician.png" alt="Musician template" /><br/><sub><b>Musician</b> — player, tracklist, gallery, tour</sub></td>
  </tr>
</table>

## Quick start

No dependencies. Clone and serve the folder:

```bash
git clone https://github.com/DatanoiseTV/wisy.git
cd wisy
python3 -m http.server 5173      # or: npx serve .
# open http://localhost:5173
```

Drag components from the left, pick a template, tweak in the inspector, hit **Try** to test it, and **Export** when you're happy.

## Architecture

Plain ES modules, zero runtime dependencies. The renderer is shared between the editor and the export, so the canvas is a faithful preview.

| File | Responsibility |
|------|----------------|
| `src/state.js` | Document model, history/undo, pub‑sub store, device presets |
| `src/registry.js` | Component definitions (schema + render → semantic HTML5) |
| `src/render.js` | Node→DOM renderer, base + component CSS, responsive + animation CSS |
| `src/widgets.js` | `<wisy-*>` custom elements + animation runtime (bundled into exports) |
| `src/canvas.js` | Iframe canvas, selection, drag/drop, resize, zoom, device frames, Try mode |
| `src/inspector.js` | Parametric property + style + animation editor (lists, sliders, align pad) |
| `src/color.js` | HSL/contrast math + parametric palette generator |
| `src/theme-editor.js` · `library.js` · `layers.js` · `pages.js` · `templates.js` · `textbar.js` · `dialog.js` | Panels, toolbars, dialogs |
| `src/export.js` | HTML/CSS/JS generation, ZIP, preview, code view |

## Exported output

```
your-site/
├── index.html        # + one file per extra page
├── styles.css        # design tokens + components + widgets
└── widgets.js         # interactive UI elements + scroll-reveal runtime
```

Open `index.html` directly or serve it — no build, no install.

## Roadmap

Active areas being expanded: OKLCH seed‑colour generation, scroll‑driven effects (parallax/scroll‑linked), graphical icon & font browsers, media‑service embeds with privacy options, local image upload/crop, and per‑component style‑preset libraries.

## License

MIT — see [`LICENSE`](LICENSE).
