/* ============================================================
   Wisy charts — zero-dependency data-visualization components.
   A single custom element <wisy-chart> renders polished inline
   SVG (no d3, no external libs). It re-renders on attribute
   changes and themes itself via CSS variables / currentColor.
   Mirrors the conventions of widgets.js (IIFE guard, SVG
   helpers, observedAttributes → attributeChangedCallback).
   ============================================================ */

/* ---- Module-level exports (importable independently) ---- */

export const CHART_TYPES = ['bar', 'line', 'area', 'pie', 'donut', 'sparkline', 'gauge', 'progress', 'radar'];

export const CHART_CSS = [
  'wisy-chart{display:block;position:relative}',
  'wisy-chart .wch-svg{width:100%;height:auto;display:block;overflow:visible}',
  'wisy-chart text{font-family:var(--font-ui,system-ui,sans-serif)}',
  'wisy-chart .wch-empty{fill:var(--color-muted,#8b96a8);opacity:.5}',
].join('');

export function chartDefaults(type) {
  const base = { type: type, color: 'var(--color-primary, #5b8cff)' };
  switch (type) {
    case 'bar':
      return { ...base, data: 'Mon:12\nTue:19\nWed:9\nThu:22\nFri:15', grid: 'true', height: 220, rounded: 4 };
    case 'line':
      return { ...base, data: '4,8,6,12,9,15,11,18', grid: 'true', height: 220, stroke: 2.5 };
    case 'area':
      return { ...base, data: '4,8,6,12,9,15,11,18', grid: 'true', height: 220, stroke: 2.5 };
    case 'pie':
      return { ...base, data: 'Direct:40\nReferral:25\nSocial:20\nSearch:15', height: 220 };
    case 'donut':
      return { ...base, data: 'Used:68\nFree:32', height: 220, label: '68%' };
    case 'sparkline':
      return { ...base, data: '3,5,4,6,5,8,6,9,7,11,9,12', height: 48, stroke: 2 };
    case 'gauge':
      return { ...base, value: 72, max: 100, height: 200, label: '' };
    case 'progress':
      return { ...base, value: 64, max: 100, height: 64, rounded: 8 };
    case 'radar':
      return { ...base, data: 'Speed:80\nPower:65\nRange:50\nAgility:90\nDefense:70', height: 240, stroke: 2.5 };
    default:
      return { ...base, data: '4,8,6,12,9,15', height: 200 };
  }
}

/* ---- Custom element registration (side effect on import) ---- */
(function () {
  if (typeof window === 'undefined') return;
  if (window.__wisyCharts) return;
  window.__wisyCharts = true;

  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d) => (v == null || v === '' || isNaN(+v) ? d : +v);
  const DEF_COLOR = 'var(--color-primary, #5b8cff)';
  const MUTED = 'var(--color-muted, #8b96a8)';

  let _uid = 0;
  const uid = () => 'wch' + (++_uid);

  function svgEl(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function txt(attrs, content) {
    const t = svgEl('text', attrs);
    t.textContent = content;
    return t;
  }

  /* Parse `data` attribute: numbers and/or label:value pairs,
     separated by commas and/or newlines. Returns
     { labels:[], values:[], hasLabels:bool }. */
  function parseData(raw) {
    const out = { labels: [], values: [], hasLabels: false };
    if (!raw) return out;
    const tokens = String(raw).split(/[\n,]+/).map((s) => s.trim()).filter((s) => s.length);
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const ci = tok.indexOf(':');
      if (ci > -1) {
        const label = tok.slice(0, ci).trim();
        const val = parseFloat(tok.slice(ci + 1).trim());
        if (!isNaN(val)) {
          out.labels.push(label);
          out.values.push(val);
          out.hasLabels = true;
        }
      } else {
        const val = parseFloat(tok);
        if (!isNaN(val)) {
          out.labels.push(String(out.values.length + 1));
          out.values.push(val);
        }
      }
    }
    return out;
  }

  /* Lighten/darken a hex color by an amount in [-1,1]. Returns
     a hex string. Non-hex inputs are returned unchanged. */
  function shade(hex, amt) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (amt >= 0) {
      r = Math.round(r + (255 - r) * amt);
      g = Math.round(g + (255 - g) * amt);
      b = Math.round(b + (255 - b) * amt);
    } else {
      const f = 1 + amt;
      r = Math.round(r * f); g = Math.round(g * f); b = Math.round(b * f);
    }
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* Build a categorical palette of n colors. Prefer an explicit
     palette attribute; otherwise derive tints from the primary
     color (and theme accent) when it is a concrete hex. */
  function buildPalette(paletteAttr, color, n) {
    if (paletteAttr) {
      const list = paletteAttr.split(',').map((s) => s.trim()).filter(Boolean);
      if (list.length) {
        const out = [];
        for (let i = 0; i < n; i++) out.push(list[i % list.length]);
        return out;
      }
    }
    const out = [];
    const isHex = /^#?[0-9a-f]{6}$/i.test(String(color).trim());
    if (isHex) {
      // Spread tints/shades around the base color for variety.
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : (i / (n - 1)) * 1.1 - 0.45; // -0.45 .. 0.65
        out.push(shade(color, t));
      }
      return out;
    }
    // Non-resolvable color (CSS var): fall back to a fixed pleasant ramp.
    const ramp = ['#5b8cff', '#7c5cff', '#41c7d8', '#5bd6a0', '#f2c14e', '#f2784b', '#ef5da8', '#9b8cff'];
    for (let i = 0; i < n; i++) out.push(ramp[i % ramp.length]);
    return out;
  }

  // Catmull-Rom -> cubic bezier smoothing through points.
  function smoothPath(pts, tension) {
    if (!pts.length) return '';
    if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
    const t = tension == null ? 0.5 : tension;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * t * 2;
      const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * t * 2;
      const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * t * 2;
      const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * t * 2;
      d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }
    return d;
  }

  // Polar helper: angle in degrees, 0deg at 12 o'clock, clockwise.
  function polar(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function arcPath(cx, cy, r, startDeg, endDeg) {
    const [sx, sy] = polar(cx, cy, r, endDeg);
    const [ex, ey] = polar(cx, cy, r, startDeg);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M${sx.toFixed(2)},${sy.toFixed(2)} A${r},${r} 0 ${large} 0 ${ex.toFixed(2)},${ey.toFixed(2)}`;
  }

  // Annular (donut) segment between two radii.
  function annularSeg(cx, cy, rOuter, rInner, startDeg, endDeg) {
    const [ox1, oy1] = polar(cx, cy, rOuter, startDeg);
    const [ox2, oy2] = polar(cx, cy, rOuter, endDeg);
    const [ix2, iy2] = polar(cx, cy, rInner, endDeg);
    const [ix1, iy1] = polar(cx, cy, rInner, startDeg);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return [
      `M${ox1.toFixed(2)},${oy1.toFixed(2)}`,
      `A${rOuter},${rOuter} 0 ${large} 1 ${ox2.toFixed(2)},${oy2.toFixed(2)}`,
      `L${ix2.toFixed(2)},${iy2.toFixed(2)}`,
      `A${rInner},${rInner} 0 ${large} 0 ${ix1.toFixed(2)},${iy1.toFixed(2)}`,
      'Z',
    ].join(' ');
  }

  // Pie wedge from center.
  function pieSeg(cx, cy, r, startDeg, endDeg) {
    const [x1, y1] = polar(cx, cy, r, startDeg);
    const [x2, y2] = polar(cx, cy, r, endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
  }

  class WisyChart extends HTMLElement {
    static get observedAttributes() {
      return ['type', 'data', 'labels', 'color', 'palette', 'height', 'stroke', 'grid', 'value', 'max', 'rounded', 'label'];
    }
    connectedCallback() {
      this._uid = uid();
      this._render();
    }
    attributeChangedCallback() {
      if (this.isConnected) this._render();
    }

    /* ---- attribute accessors ---- */
    get _type() {
      const t = (this.getAttribute('type') || 'bar').toLowerCase();
      return CHART_TYPES.indexOf(t) > -1 ? t : 'bar';
    }
    get _color() { return this.getAttribute('color') || DEF_COLOR; }
    get _height() {
      const d = this._type === 'sparkline' ? 48 : this._type === 'progress' ? 64 : 200;
      return num(this.getAttribute('height'), d);
    }
    get _stroke() { return num(this.getAttribute('stroke'), 2.5); }
    get _rounded() { return num(this.getAttribute('rounded'), 4); }
    get _grid() {
      const g = this.getAttribute('grid');
      return g === '' ? false : g === 'true' || g === '1';
    }
    get _dataset() {
      const ds = parseData(this.getAttribute('data'));
      const labelsAttr = this.getAttribute('labels');
      if (labelsAttr) {
        const ls = labelsAttr.split(',').map((s) => s.trim());
        for (let i = 0; i < ds.values.length; i++) {
          if (ls[i] != null && ls[i] !== '') { ds.labels[i] = ls[i]; ds.hasLabels = true; }
        }
      }
      return ds;
    }

    _render() {
      if (!this.__styled) {
        this.style.display = 'block';
        this.style.position = 'relative';
        this.__styled = true;
      }
      const w = 320; // intrinsic viewBox width; SVG scales via width:100%
      const h = Math.max(24, this._height);
      const svg = svgEl('svg', {
        viewBox: `0 0 ${w} ${h}`,
        class: 'wch-svg',
        preserveAspectRatio: 'none',
        role: 'img',
      });
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.display = 'block';
      svg.style.overflow = 'visible';
      svg.setAttribute('font-family', 'var(--font-ui, system-ui, sans-serif)');

      const ds = this._dataset;
      const renderer = this['_draw_' + this._type] || this._draw_bar;
      try {
        renderer.call(this, svg, ds, w, h);
      } catch (e) {
        this._placeholder(svg, w, h);
      }

      // Swap in new SVG (replace prior child only).
      if (this._svg && this._svg.parentNode === this) this.removeChild(this._svg);
      else this.innerHTML = '';
      this._svg = svg;
      this.appendChild(svg);
    }

    _placeholder(svg, w, h) {
      svg.append(
        svgEl('rect', { x: 1, y: 1, width: w - 2, height: h - 2, rx: 8, fill: 'none', stroke: MUTED, 'stroke-width': 1, 'stroke-dasharray': '5 5', opacity: 0.35 }),
        txt({ x: w / 2, y: h / 2, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: MUTED, 'font-size': 12, opacity: 0.6 }, 'no data')
      );
    }

    _hasData(ds) { return ds && ds.values && ds.values.length > 0; }

    /* ---- gridlines + value axis for cartesian charts ---- */
    _drawGrid(svg, x0, y0, plotW, plotH, vmin, vmax) {
      const g = svgEl('g');
      const ticks = 4;
      for (let i = 0; i <= ticks; i++) {
        const yy = y0 + (plotH * i) / ticks;
        const v = vmax - ((vmax - vmin) * i) / ticks;
        g.append(svgEl('line', {
          x1: x0, y1: yy.toFixed(2), x2: x0 + plotW, y2: yy.toFixed(2),
          stroke: MUTED, 'stroke-width': i === ticks ? 1 : 0.6,
          opacity: i === ticks ? 0.4 : 0.15,
        }));
        g.append(txt({
          x: x0 - 6, y: yy + 3, 'text-anchor': 'end', fill: MUTED, 'font-size': 9, opacity: 0.7,
        }, this._fmtTick(v)));
      }
      svg.append(g);
    }
    _fmtTick(v) {
      if (Math.abs(v) >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k';
      return Math.abs(v) < 1 && v !== 0 ? v.toFixed(2) : String(Math.round(v * 100) / 100);
    }

    /* ============== BAR ============== */
    _draw_bar(svg, ds, w, h) {
      if (!this._hasData(ds)) return this._placeholder(svg, w, h);
      const vals = ds.values;
      const grid = this._grid;
      const padL = grid ? 30 : 10;
      const padR = 10, padT = 12;
      const padB = ds.hasLabels ? 22 : 10;
      const x0 = padL, y0 = padT;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const vmax = Math.max(0, ...vals);
      const vmin = Math.min(0, ...vals);
      const span = vmax - vmin || 1;
      if (grid) this._drawGrid(svg, x0, y0, plotW, plotH, vmin, vmax);

      const pal = buildPalette(this.getAttribute('palette'), this._color, vals.length);
      const gap = 0.32;
      const slot = plotW / vals.length;
      const bw = slot * (1 - gap);
      const zeroY = y0 + plotH * (vmax / span);
      const r = clamp(this._rounded, 0, bw / 2);

      vals.forEach((v, i) => {
        const cx = x0 + slot * i + (slot - bw) / 2;
        const vy = y0 + plotH * ((vmax - v) / span);
        const top = Math.min(vy, zeroY);
        const bh = Math.abs(zeroY - vy);
        const fill = vals.length === 1 ? this._color : pal[i];
        svg.append(svgEl('rect', {
          x: cx.toFixed(2), y: top.toFixed(2), width: bw.toFixed(2), height: Math.max(0.5, bh).toFixed(2),
          rx: r, ry: r, fill,
        }));
        if (ds.hasLabels) {
          svg.append(txt({
            x: (cx + bw / 2).toFixed(2), y: h - padB + 14, 'text-anchor': 'middle', fill: MUTED, 'font-size': 9,
          }, ds.labels[i]));
        }
      });
    }

    /* ============== LINE ============== */
    _draw_line(svg, ds, w, h) { this._lineOrArea(svg, ds, w, h, false); }
    _draw_area(svg, ds, w, h) { this._lineOrArea(svg, ds, w, h, true); }

    _lineOrArea(svg, ds, w, h, fill) {
      if (!this._hasData(ds)) return this._placeholder(svg, w, h);
      const vals = ds.values;
      const grid = this._grid;
      const padL = grid ? 30 : 8, padR = 8, padT = 12;
      const padB = ds.hasLabels ? 22 : 8;
      const x0 = padL, y0 = padT;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      let vmax = Math.max(...vals), vmin = Math.min(...vals);
      if (vmax === vmin) { vmax += 1; vmin -= 1; }
      const pad = (vmax - vmin) * 0.08;
      vmax += pad; vmin -= pad;
      const span = vmax - vmin || 1;
      if (grid) this._drawGrid(svg, x0, y0, plotW, plotH, vmin, vmax);

      const n = vals.length;
      const pts = vals.map((v, i) => [
        x0 + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1)),
        y0 + plotH * ((vmax - v) / span),
      ]);
      const color = this._color;
      const d = smoothPath(pts, 0.55);

      if (fill) {
        const gid = this._uid + '-grad';
        const grad = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
        grad.append(svgEl('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 0.35 }));
        grad.append(svgEl('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0.02 }));
        const defs = svgEl('defs'); defs.append(grad); svg.append(defs);
        const base = y0 + plotH;
        const areaD = `${d} L${pts[pts.length - 1][0].toFixed(2)},${base} L${pts[0][0].toFixed(2)},${base} Z`;
        svg.append(svgEl('path', { d: areaD, fill: `url(#${gid})`, stroke: 'none' }));
      }

      svg.append(svgEl('path', {
        d, fill: 'none', stroke: color, 'stroke-width': this._stroke,
        'stroke-linejoin': 'round', 'stroke-linecap': 'round',
      }));

      // End-point dot for a finished look.
      const last = pts[pts.length - 1];
      svg.append(svgEl('circle', { cx: last[0].toFixed(2), cy: last[1].toFixed(2), r: this._stroke + 1.2, fill: color }));
      svg.append(svgEl('circle', { cx: last[0].toFixed(2), cy: last[1].toFixed(2), r: this._stroke + 3, fill: color, opacity: 0.18 }));

      if (ds.hasLabels) {
        pts.forEach((p, i) => {
          svg.append(txt({ x: p[0].toFixed(2), y: h - padB + 14, 'text-anchor': 'middle', fill: MUTED, 'font-size': 9 }, ds.labels[i]));
        });
      }
    }

    /* ============== PIE / DONUT ============== */
    _draw_pie(svg, ds, w, h) { this._pie(svg, ds, w, h, 0); }
    _draw_donut(svg, ds, w, h) { this._pie(svg, ds, w, h, 0.58); }

    _pie(svg, ds, w, h, innerRatio) {
      if (!this._hasData(ds)) return this._placeholder(svg, w, h);
      const vals = ds.values.map((v) => Math.max(0, v));
      const total = vals.reduce((a, b) => a + b, 0);
      if (total <= 0) return this._placeholder(svg, w, h);
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) / 2 - 12;
      const rInner = r * innerRatio;
      const pal = buildPalette(this.getAttribute('palette'), this._color, vals.length);
      let acc = 0;
      vals.forEach((v, i) => {
        const start = (acc / total) * 360;
        acc += v;
        let end = (acc / total) * 360;
        if (end - start >= 359.999) end = start + 359.999; // avoid full-circle degenerate arc
        const d = innerRatio > 0
          ? annularSeg(cx, cy, r, rInner, start, end)
          : pieSeg(cx, cy, r, start, end);
        svg.append(svgEl('path', { d, fill: pal[i], stroke: 'var(--color-bg, #0e1118)', 'stroke-width': 1.25, 'stroke-linejoin': 'round' }));
      });

      if (innerRatio > 0) {
        const label = this.getAttribute('label');
        if (label != null && label !== '') {
          svg.append(txt({ x: cx, y: cy + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: 'currentColor', 'font-size': Math.round(rInner * 0.5), 'font-weight': 600 }, label));
        } else {
          svg.append(txt({ x: cx, y: cy + 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: 'currentColor', 'font-size': Math.round(rInner * 0.45), 'font-weight': 600 }, String(Math.round(total))));
          svg.append(txt({ x: cx, y: cy + rInner * 0.42, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: MUTED, 'font-size': 9 }, 'total'));
        }
      }
    }

    /* ============== SPARKLINE ============== */
    _draw_sparkline(svg, ds, w, h) {
      if (!this._hasData(ds)) return this._placeholder(svg, w, h);
      const vals = ds.values;
      const padX = 3, padY = 4;
      const plotW = w - padX * 2, plotH = h - padY * 2;
      let vmax = Math.max(...vals), vmin = Math.min(...vals);
      if (vmax === vmin) { vmax += 1; vmin -= 1; }
      const span = vmax - vmin || 1;
      const n = vals.length;
      const pts = vals.map((v, i) => [
        padX + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1)),
        padY + plotH * ((vmax - v) / span),
      ]);
      const color = this._color;
      const d = smoothPath(pts, 0.5);

      const gid = this._uid + '-spk';
      const grad = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
      grad.append(svgEl('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 0.28 }));
      grad.append(svgEl('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }));
      const defs = svgEl('defs'); defs.append(grad); svg.append(defs);
      const base = padY + plotH;
      svg.append(svgEl('path', { d: `${d} L${pts[pts.length - 1][0].toFixed(2)},${base} L${pts[0][0].toFixed(2)},${base} Z`, fill: `url(#${gid})`, stroke: 'none' }));
      svg.append(svgEl('path', { d, fill: 'none', stroke: color, 'stroke-width': this._stroke, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      const last = pts[pts.length - 1];
      svg.append(svgEl('circle', { cx: last[0].toFixed(2), cy: last[1].toFixed(2), r: this._stroke + 0.6, fill: color }));
    }

    /* ============== GAUGE (270deg arc) ============== */
    _draw_gauge(svg, ds, w, h) {
      const max = num(this.getAttribute('max'), 100) || 1;
      let value = num(this.getAttribute('value'), NaN);
      if (isNaN(value) && this._hasData(ds)) value = ds.values[ds.values.length - 1];
      if (isNaN(value)) return this._placeholder(svg, w, h);
      const frac = clamp(value / max, 0, 1);
      const cx = w / 2, cy = h / 2 + h * 0.08;
      const r = Math.min(w, h) / 2 - 16;
      const sw = clamp(r * 0.22, 6, 26);
      const startDeg = -135, sweep = 270;
      const endDeg = startDeg + sweep;
      const color = this._color;

      svg.append(svgEl('path', {
        d: arcPath(cx, cy, r, startDeg, endDeg), fill: 'none', stroke: MUTED, 'stroke-width': sw,
        'stroke-linecap': 'round', opacity: 0.2,
      }));
      const valEnd = startDeg + sweep * frac;
      svg.append(svgEl('path', {
        d: arcPath(cx, cy, r, startDeg, valEnd), fill: 'none', stroke: color, 'stroke-width': sw,
        'stroke-linecap': 'round',
      }));

      const label = this.getAttribute('label');
      const center = label != null && label !== '' ? label : Math.round(frac * 100) + '%';
      svg.append(txt({ x: cx, y: cy - r * 0.05, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: 'currentColor', 'font-size': Math.round(r * 0.55), 'font-weight': 700 }, center));
      svg.append(txt({ x: cx, y: cy + r * 0.45, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: MUTED, 'font-size': Math.round(r * 0.2) }, `${Math.round(value)} / ${Math.round(max)}`));
    }

    /* ============== PROGRESS (horizontal bar) ============== */
    _draw_progress(svg, ds, w, h) {
      const max = num(this.getAttribute('max'), 100) || 1;
      let value = num(this.getAttribute('value'), NaN);
      if (isNaN(value) && this._hasData(ds)) value = ds.values[ds.values.length - 1];
      if (isNaN(value)) return this._placeholder(svg, w, h);
      const frac = clamp(value / max, 0, 1);
      const color = this._color;
      const padX = 6;
      const barH = clamp(h * 0.34, 8, 28);
      const y = (h - barH) / 2 + (h > barH * 2 ? 4 : 0);
      const r = clamp(this._rounded, 0, barH / 2);
      const trackW = w - padX * 2;

      const gid = this._uid + '-pg';
      const grad = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2: 1, y2: 0 });
      const isHex = /^#?[0-9a-f]{6}$/i.test(String(color).trim());
      grad.append(svgEl('stop', { offset: '0%', 'stop-color': isHex ? shade(color, -0.12) : color }));
      grad.append(svgEl('stop', { offset: '100%', 'stop-color': color }));
      const defs = svgEl('defs'); defs.append(grad); svg.append(defs);

      svg.append(svgEl('rect', { x: padX, y: y.toFixed(2), width: trackW, height: barH, rx: r, ry: r, fill: MUTED, opacity: 0.18 }));
      svg.append(svgEl('rect', { x: padX, y: y.toFixed(2), width: Math.max(barH, trackW * frac).toFixed(2), height: barH, rx: r, ry: r, fill: `url(#${gid})` }));

      const label = this.getAttribute('label');
      const pct = label != null && label !== '' ? label : Math.round(frac * 100) + '%';
      if (h > barH * 1.6) {
        svg.append(txt({ x: padX, y: y - 6, 'text-anchor': 'start', fill: MUTED, 'font-size': 10 }, label && label !== '' ? '' : 'Progress'));
        svg.append(txt({ x: w - padX, y: y - 6, 'text-anchor': 'end', fill: 'currentColor', 'font-size': 11, 'font-weight': 600 }, pct));
      } else {
        svg.append(txt({ x: w - padX, y: y + barH / 2 + 4, 'text-anchor': 'end', fill: 'currentColor', 'font-size': Math.round(barH * 0.55), 'font-weight': 600 }, pct));
      }
    }

    /* ============== RADAR ============== */
    _draw_radar(svg, ds, w, h) {
      if (!this._hasData(ds) || ds.values.length < 3) return this._placeholder(svg, w, h);
      const vals = ds.values;
      const n = vals.length;
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) / 2 - 24;
      const vmax = Math.max(...vals, 1);
      const color = this._color;
      const rings = 4;

      // Concentric grid rings (polygons).
      for (let g = 1; g <= rings; g++) {
        const rr = (r * g) / rings;
        const poly = [];
        for (let i = 0; i < n; i++) {
          const [px, py] = polar(cx, cy, rr, (360 * i) / n);
          poly.push(`${px.toFixed(2)},${py.toFixed(2)}`);
        }
        svg.append(svgEl('polygon', { points: poly.join(' '), fill: 'none', stroke: MUTED, 'stroke-width': 0.6, opacity: g === rings ? 0.35 : 0.15 }));
      }
      // Spokes + axis labels.
      for (let i = 0; i < n; i++) {
        const [px, py] = polar(cx, cy, r, (360 * i) / n);
        svg.append(svgEl('line', { x1: cx, y1: cy, x2: px.toFixed(2), y2: py.toFixed(2), stroke: MUTED, 'stroke-width': 0.6, opacity: 0.15 }));
        if (ds.hasLabels) {
          const [lx, ly] = polar(cx, cy, r + 12, (360 * i) / n);
          const anchor = Math.abs(lx - cx) < 2 ? 'middle' : lx > cx ? 'start' : 'end';
          svg.append(txt({ x: lx.toFixed(2), y: (ly + 3).toFixed(2), 'text-anchor': anchor, fill: MUTED, 'font-size': 9 }, ds.labels[i]));
        }
      }
      // Data polygon.
      const pts = vals.map((v, i) => polar(cx, cy, r * clamp(v / vmax, 0, 1), (360 * i) / n));
      const dataPoly = pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
      svg.append(svgEl('polygon', { points: dataPoly, fill: color, 'fill-opacity': 0.18, stroke: color, 'stroke-width': this._stroke, 'stroke-linejoin': 'round' }));
      pts.forEach((p) => svg.append(svgEl('circle', { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: this._stroke + 0.4, fill: color })));
    }
  }

  if (!customElements.get('wisy-chart')) customElements.define('wisy-chart', WisyChart);
})();
