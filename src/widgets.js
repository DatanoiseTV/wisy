/* ============================================================
   Wisy UI widgets — self-contained custom elements.
   These run in the editor canvas AND in exported sites with
   zero dependencies. Each is parametric via attributes and
   emits `input` / `change` events with a normalized `value`.
   Designed for audio software UIs (knobs, sliders, XY pads),
   but generic enough for dashboards and app controls.
   ============================================================ */
(function () {
  if (window.__wisyWidgets) return;
  window.__wisyWidgets = true;

  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d) => (v == null || v === '' || isNaN(+v) ? d : +v);
  const fmt = (v, step) => {
    const dec = step >= 1 ? 0 : Math.min(4, String(step).split('.')[1]?.length || 2);
    return v.toFixed(dec);
  };
  function css(el, s) { for (const k in s) el.style.setProperty(k, s[k]); }
  function svgEl(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }

  /* Shared pointer-drag helper: vertical drag changes value.
     Returns a cleanup. Fine-tune with Shift (×0.2). */
  function verticalDrag(target, getRange, onValue, opts = {}) {
    target.addEventListener('pointerdown', (e) => {
      if (target.hasAttribute('disabled')) return;
      e.preventDefault();
      target.setPointerCapture?.(e.pointerId);
      const { min, max } = getRange();
      const span = max - min || 1;
      let startY = e.clientY, startV = onValue.get();
      const pxFull = opts.pxFull || 200;
      const move = (ev) => {
        const fine = ev.shiftKey ? 0.2 : 1;
        const dv = ((startY - ev.clientY) / pxFull) * span * fine;
        const nv = clamp(startV + dv, min, max);
        onValue.set(nv); startY = ev.clientY; startV = nv;
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        onValue.commit?.();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    target.addEventListener('dblclick', () => { if (opts.onReset) opts.onReset(); });
    target.addEventListener('wheel', (e) => {
      if (target.hasAttribute('disabled')) return;
      e.preventDefault();
      const { min, max } = getRange();
      const step = num(target.getAttribute('step'), (max - min) / 100) * (e.shiftKey ? 0.2 : 1);
      onValue.set(clamp(onValue.get() - Math.sign(e.deltaY) * step, min, max));
      onValue.commit?.();
    }, { passive: false });
  }

  /* ---------------- wisy-knob ---------------- */
  class WisyKnob extends HTMLElement {
    static get observedAttributes() { return ['value', 'min', 'max', 'step', 'label', 'size', 'color', 'track', 'default', 'unit', 'show-value', 'disabled']; }
    connectedCallback() { this._build(); this._wire(); this._render(); }
    attributeChangedCallback() { if (this._root) this._render(); }
    get min() { return num(this.getAttribute('min'), 0); }
    get max() { return num(this.getAttribute('max'), 100); }
    get step() { return num(this.getAttribute('step'), 1); }
    get value() { return clamp(num(this.getAttribute('value'), this.min), this.min, this.max); }
    set value(v) { this.setAttribute('value', v); }

    _build() {
      this._root = document.createElement('div');
      this._root.className = 'wk-root';
      this._svg = svgEl('svg', { viewBox: '0 0 100 100', class: 'wk-svg' });
      this._trackArc = svgEl('path', { class: 'wk-track', fill: 'none' });
      this._valArc = svgEl('path', { class: 'wk-val', fill: 'none' });
      this._indicator = svgEl('line', { class: 'wk-ind' });
      this._cap = svgEl('circle', { class: 'wk-cap', cx: 50, cy: 50, r: 30 });
      this._svg.append(this._trackArc, this._valArc, this._cap, this._indicator);
      this._label = document.createElement('div'); this._label.className = 'wk-label';
      this._readout = document.createElement('div'); this._readout.className = 'wk-readout';
      this._root.append(this._svg, this._readout, this._label);
      this.innerHTML = ''; this.appendChild(this._root);
    }
    _wire() {
      verticalDrag(this, () => ({ min: this.min, max: this.max }), {
        get: () => this.value,
        set: (v) => { const s = this.step; v = Math.round(v / s) * s; this.value = +v.toFixed(6); this._emit('input'); },
        commit: () => this._emit('change'),
      }, {
        pxFull: 220,
        onReset: () => { if (this.hasAttribute('default')) { this.value = num(this.getAttribute('default'), this.min); this._emit('input'); this._emit('change'); } },
      });
    }
    _emit(type) { this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { value: this.value } })); }
    _render() {
      const size = num(this.getAttribute('size'), 72);
      const color = this.getAttribute('color') || 'var(--accent, #5b8cff)';
      const track = this.getAttribute('track') || 'rgba(150,160,180,.22)';
      css(this._root, { '--wk-size': size + 'px', '--wk-color': color });
      this._root.classList.toggle('is-disabled', this.hasAttribute('disabled'));
      const A0 = 135, A1 = 405; // 270° sweep
      const t = (this.value - this.min) / ((this.max - this.min) || 1);
      const ang = A0 + t * (A1 - A0);
      this._trackArc.setAttribute('d', arc(50, 50, 38, A0, A1));
      this._trackArc.setAttribute('stroke', track);
      this._trackArc.setAttribute('stroke-width', 8);
      this._valArc.setAttribute('d', arc(50, 50, 38, A0, ang));
      this._valArc.setAttribute('stroke', color);
      this._valArc.setAttribute('stroke-width', 8);
      this._cap.setAttribute('fill', 'var(--wk-cap, #20262f)');
      const p = pol(50, 50, 30, ang), c = pol(50, 50, 15, ang);
      this._indicator.setAttribute('x1', c.x); this._indicator.setAttribute('y1', c.y);
      this._indicator.setAttribute('x2', p.x); this._indicator.setAttribute('y2', p.y);
      this._indicator.setAttribute('stroke', color);
      this._indicator.setAttribute('stroke-width', 3.5);
      this._indicator.setAttribute('stroke-linecap', 'round');
      const lbl = this.getAttribute('label');
      this._label.textContent = lbl || ''; this._label.style.display = lbl ? '' : 'none';
      const showV = this.getAttribute('show-value') !== 'false';
      this._readout.style.display = showV ? '' : 'none';
      this._readout.textContent = fmt(this.value, this.step) + (this.getAttribute('unit') || '');
    }
  }

  /* ---------------- wisy-slider ---------------- */
  class WisySlider extends HTMLElement {
    static get observedAttributes() { return ['value', 'min', 'max', 'step', 'label', 'orient', 'length', 'color', 'unit', 'show-value', 'disabled', 'default']; }
    connectedCallback() { this._build(); this._wire(); this._render(); }
    attributeChangedCallback() { if (this._root) this._render(); }
    get min() { return num(this.getAttribute('min'), 0); }
    get max() { return num(this.getAttribute('max'), 100); }
    get step() { return num(this.getAttribute('step'), 1); }
    get value() { return clamp(num(this.getAttribute('value'), this.min), this.min, this.max); }
    set value(v) { this.setAttribute('value', v); }
    get vertical() { return (this.getAttribute('orient') || 'horizontal') === 'vertical'; }

    _build() {
      this._root = document.createElement('div'); this._root.className = 'ws-root';
      this._track = document.createElement('div'); this._track.className = 'ws-track';
      this._fill = document.createElement('div'); this._fill.className = 'ws-fill';
      this._thumb = document.createElement('div'); this._thumb.className = 'ws-thumb';
      this._track.append(this._fill, this._thumb);
      this._label = document.createElement('div'); this._label.className = 'ws-label';
      this._readout = document.createElement('div'); this._readout.className = 'ws-readout';
      this._root.append(this._label, this._track, this._readout);
      this.innerHTML = ''; this.appendChild(this._root);
    }
    _wire() {
      const setFromPoint = (clientX, clientY) => {
        const r = this._track.getBoundingClientRect();
        let t = this.vertical ? 1 - (clientY - r.top) / r.height : (clientX - r.left) / r.width;
        t = clamp(t, 0, 1);
        let v = this.min + t * (this.max - this.min);
        v = Math.round(v / this.step) * this.step;
        this.value = +v.toFixed(6); this._emit('input');
      };
      this._track.addEventListener('pointerdown', (e) => {
        if (this.hasAttribute('disabled')) return;
        e.preventDefault(); this._track.setPointerCapture(e.pointerId);
        setFromPoint(e.clientX, e.clientY);
        const move = (ev) => setFromPoint(ev.clientX, ev.clientY);
        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); this._emit('change'); };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
      });
      this._track.addEventListener('dblclick', () => { if (this.hasAttribute('default')) { this.value = num(this.getAttribute('default'), this.min); this._emit('input'); this._emit('change'); } });
    }
    _emit(type) { this._render(); this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { value: this.value } })); }
    _render() {
      const color = this.getAttribute('color') || 'var(--accent, #5b8cff)';
      const len = num(this.getAttribute('length'), this.vertical ? 160 : 200);
      this._root.classList.toggle('ws-vertical', this.vertical);
      this._root.classList.toggle('is-disabled', this.hasAttribute('disabled'));
      css(this._root, { '--ws-len': len + 'px', '--ws-color': color });
      const t = (this.value - this.min) / ((this.max - this.min) || 1);
      if (this.vertical) { this._fill.style.height = (t * 100) + '%'; this._fill.style.width = ''; this._thumb.style.bottom = `calc(${t * 100}% - 8px)`; this._thumb.style.left = ''; }
      else { this._fill.style.width = (t * 100) + '%'; this._fill.style.height = ''; this._thumb.style.left = `calc(${t * 100}% - 8px)`; this._thumb.style.bottom = ''; }
      const lbl = this.getAttribute('label'); this._label.textContent = lbl || ''; this._label.style.display = lbl ? '' : 'none';
      const showV = this.getAttribute('show-value') !== 'false'; this._readout.style.display = showV ? '' : 'none';
      this._readout.textContent = fmt(this.value, this.step) + (this.getAttribute('unit') || '');
    }
  }

  /* ---------------- wisy-xy ---------------- */
  class WisyXY extends HTMLElement {
    static get observedAttributes() { return ['x', 'y', 'label-x', 'label-y', 'size', 'color', 'grid', 'disabled']; }
    connectedCallback() { this._build(); this._wire(); this._render(); }
    attributeChangedCallback() { if (this._root) this._render(); }
    get x() { return clamp(num(this.getAttribute('x'), 0.5), 0, 1); }
    get y() { return clamp(num(this.getAttribute('y'), 0.5), 0, 1); }
    set x(v) { this.setAttribute('x', v); } set y(v) { this.setAttribute('y', v); }
    _build() {
      this._root = document.createElement('div'); this._root.className = 'wxy-root';
      this._pad = document.createElement('div'); this._pad.className = 'wxy-pad';
      this._hLine = document.createElement('div'); this._hLine.className = 'wxy-line wxy-line--h';
      this._vLine = document.createElement('div'); this._vLine.className = 'wxy-line wxy-line--v';
      this._dot = document.createElement('div'); this._dot.className = 'wxy-dot';
      this._read = document.createElement('div'); this._read.className = 'wxy-read';
      this._pad.append(this._hLine, this._vLine, this._dot);
      this._root.append(this._pad, this._read);
      this.innerHTML = ''; this.appendChild(this._root);
    }
    _wire() {
      const set = (cx, cy) => {
        const r = this._pad.getBoundingClientRect();
        this.x = +clamp((cx - r.left) / r.width, 0, 1).toFixed(4);
        this.y = +clamp(1 - (cy - r.top) / r.height, 0, 1).toFixed(4);
        this._emit('input');
      };
      this._pad.addEventListener('pointerdown', (e) => {
        if (this.hasAttribute('disabled')) return;
        e.preventDefault(); this._pad.setPointerCapture(e.pointerId); set(e.clientX, e.clientY);
        const move = (ev) => set(ev.clientX, ev.clientY);
        const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); this._emit('change'); };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
      });
    }
    _emit(type) { this._render(); this.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { x: this.x, y: this.y } })); }
    _render() {
      const size = num(this.getAttribute('size'), 180);
      const color = this.getAttribute('color') || 'var(--accent, #5b8cff)';
      css(this._root, { '--wxy-size': size + 'px', '--wxy-color': color });
      this._root.classList.toggle('wxy-grid', this.getAttribute('grid') !== 'false');
      this._root.classList.toggle('is-disabled', this.hasAttribute('disabled'));
      this._dot.style.left = (this.x * 100) + '%';
      this._dot.style.top = ((1 - this.y) * 100) + '%';
      this._vLine.style.left = (this.x * 100) + '%';
      this._hLine.style.top = ((1 - this.y) * 100) + '%';
      const lx = this.getAttribute('label-x') || 'X', ly = this.getAttribute('label-y') || 'Y';
      this._read.textContent = `${lx} ${this.x.toFixed(2)} · ${ly} ${this.y.toFixed(2)}`;
    }
  }

  /* ---------------- wisy-toggle ---------------- */
  class WisyToggle extends HTMLElement {
    static get observedAttributes() { return ['on', 'label', 'color', 'disabled']; }
    connectedCallback() { this._build(); this._render(); }
    attributeChangedCallback() { if (this._btn) this._render(); }
    get on() { return this.getAttribute('on') === 'true'; }
    set on(v) { this.setAttribute('on', v ? 'true' : 'false'); }
    _build() {
      this._root = document.createElement('label'); this._root.className = 'wt-root';
      this._btn = document.createElement('button'); this._btn.className = 'wt-btn'; this._btn.type = 'button';
      this._dot = document.createElement('span'); this._dot.className = 'wt-dot';
      this._btn.appendChild(this._dot);
      this._txt = document.createElement('span'); this._txt.className = 'wt-txt';
      this._root.append(this._btn, this._txt);
      this._btn.addEventListener('click', () => { if (this.hasAttribute('disabled')) return; this.on = !this.on; this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { on: this.on } })); });
      this.innerHTML = ''; this.appendChild(this._root);
    }
    _render() {
      const color = this.getAttribute('color') || 'var(--accent, #5b8cff)';
      css(this._root, { '--wt-color': color });
      this._root.classList.toggle('is-on', this.on);
      this._root.classList.toggle('is-disabled', this.hasAttribute('disabled'));
      this._txt.textContent = this.getAttribute('label') || '';
      this._txt.style.display = this.getAttribute('label') ? '' : 'none';
    }
  }

  /* ---------------- wisy-meter (level meter) ---------------- */
  class WisyMeter extends HTMLElement {
    static get observedAttributes() { return ['value', 'min', 'max', 'orient', 'length', 'segments', 'color', 'peak-color', 'label']; }
    connectedCallback() { this._build(); this._render(); }
    attributeChangedCallback() { if (this._root) this._render(); }
    _build() {
      this._root = document.createElement('div'); this._root.className = 'wm-root';
      this._bar = document.createElement('div'); this._bar.className = 'wm-bar';
      this._label = document.createElement('div'); this._label.className = 'wm-label';
      this._root.append(this._label, this._bar);
      this.innerHTML = ''; this.appendChild(this._root);
    }
    _render() {
      const min = num(this.getAttribute('min'), -60), max = num(this.getAttribute('max'), 6);
      const val = clamp(num(this.getAttribute('value'), min), min, max);
      const t = (val - min) / ((max - min) || 1);
      const seg = num(this.getAttribute('segments'), 0);
      const vertical = (this.getAttribute('orient') || 'vertical') === 'vertical';
      const len = num(this.getAttribute('length'), vertical ? 120 : 200);
      const color = this.getAttribute('color') || 'var(--accent, #43c59e)';
      const peak = this.getAttribute('peak-color') || '#ff6b6b';
      this._root.classList.toggle('wm-vertical', vertical);
      css(this._root, { '--wm-len': len + 'px', '--wm-color': color, '--wm-peak': peak });
      if (seg > 0) {
        this._bar.classList.add('wm-seg'); this._bar.innerHTML = '';
        const lit = Math.round(t * seg);
        for (let i = 0; i < seg; i++) {
          const s = document.createElement('span');
          const frac = i / (seg - 1 || 1);
          s.style.background = (vertical ? i < lit : i < lit) ? (frac > 0.85 ? peak : frac > 0.65 ? 'var(--warn,#ffb454)' : color) : 'rgba(150,160,180,.16)';
          this._bar.appendChild(s);
        }
      } else {
        this._bar.classList.remove('wm-seg');
        this._bar.innerHTML = '<i class="wm-fill"></i>';
        const f = this._bar.firstChild;
        if (vertical) f.style.height = (t * 100) + '%'; else f.style.width = (t * 100) + '%';
        f.style.background = `linear-gradient(${vertical ? 0 : 90}deg, ${color} 60%, var(--warn,#ffb454) 85%, ${peak})`;
      }
      this._label.textContent = this.getAttribute('label') || '';
      this._label.style.display = this.getAttribute('label') ? '' : 'none';
    }
  }

  /* ---------------- wisy-stepper (value box) ---------------- */
  class WisyStepper extends HTMLElement {
    static get observedAttributes() { return ['value', 'min', 'max', 'step', 'label', 'unit', 'disabled']; }
    connectedCallback() { this._build(); this._render(); }
    attributeChangedCallback() { if (this._root) this._render(); }
    get min() { return num(this.getAttribute('min'), -Infinity); }
    get max() { return num(this.getAttribute('max'), Infinity); }
    get step() { return num(this.getAttribute('step'), 1); }
    get value() { return clamp(num(this.getAttribute('value'), 0), this.min, this.max); }
    set value(v) { this.setAttribute('value', v); }
    _build() {
      this._root = document.createElement('div'); this._root.className = 'wst-root';
      this._label = document.createElement('div'); this._label.className = 'wst-label';
      const box = document.createElement('div'); box.className = 'wst-box';
      this._dec = document.createElement('button'); this._dec.type = 'button'; this._dec.className = 'wst-btn'; this._dec.textContent = '−';
      this._inp = document.createElement('input'); this._inp.className = 'wst-inp'; this._inp.type = 'text'; this._inp.inputMode = 'decimal';
      this._inc = document.createElement('button'); this._inc.type = 'button'; this._inc.className = 'wst-btn'; this._inc.textContent = '+';
      box.append(this._dec, this._inp, this._inc);
      this._root.append(this._label, box);
      const bump = (d) => { if (this.hasAttribute('disabled')) return; this.value = +(clamp(this.value + d * this.step, this.min, this.max)).toFixed(6); this._emit(); };
      this._dec.onclick = () => bump(-1); this._inc.onclick = () => bump(1);
      this._inp.addEventListener('change', () => { const v = parseFloat(this._inp.value); if (!isNaN(v)) { this.value = clamp(v, this.min, this.max); } this._emit(); });
      this.innerHTML = ''; this.appendChild(this._root);
    }
    _emit() { this._render(); this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: this.value } })); }
    _render() {
      this._root.classList.toggle('is-disabled', this.hasAttribute('disabled'));
      this._inp.value = fmt(this.value, this.step) + (this.getAttribute('unit') || '');
      this._label.textContent = this.getAttribute('label') || '';
      this._label.style.display = this.getAttribute('label') ? '' : 'none';
    }
  }

  const PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='600' height='600' fill='#dfe4ec'/><path d='M0 460l190-150 150 110 120-90 140 120v110H0z' fill='#c6cfdb'/><circle cx='430' cy='150' r='52' fill='#c6cfdb'/></svg>");
  const tfmt = (s) => { if (!isFinite(s)) return '0:00'; const m = Math.floor(s / 60), sec = Math.floor(s % 60); return m + ':' + String(sec).padStart(2, '0'); };

  /* ---------------- wisy-audio (player) ---------------- */
  class WisyAudio extends HTMLElement {
    static get observedAttributes() { return ['src', 'title', 'artist', 'cover', 'color']; }
    connectedCallback() { this._build(); this._render(); }
    attributeChangedCallback() { if (this._root) { this._sync(); } }
    _build() {
      this._audio = document.createElement('audio');
      this._audio.preload = 'metadata';
      this._root = document.createElement('div'); this._root.className = 'wap-root';
      this._cover = document.createElement('div'); this._cover.className = 'wap-cover';
      const main = document.createElement('div'); main.className = 'wap-main';
      this._meta = document.createElement('div'); this._meta.className = 'wap-meta';
      this._title = document.createElement('div'); this._title.className = 'wap-title';
      this._artist = document.createElement('div'); this._artist.className = 'wap-artist';
      this._meta.append(this._title, this._artist);
      const ctrl = document.createElement('div'); ctrl.className = 'wap-ctrl';
      this._play = document.createElement('button'); this._play.className = 'wap-play'; this._play.type = 'button';
      this._cur = document.createElement('span'); this._cur.className = 'wap-time'; this._cur.textContent = '0:00';
      this._bar = document.createElement('div'); this._bar.className = 'wap-bar';
      this._fill = document.createElement('div'); this._fill.className = 'wap-fill';
      this._bar.append(this._fill);
      this._dur = document.createElement('span'); this._dur.className = 'wap-time'; this._dur.textContent = '0:00';
      ctrl.append(this._play, this._cur, this._bar, this._dur);
      main.append(this._meta, ctrl);
      this._root.append(this._cover, main);
      this.innerHTML = ''; this.append(this._root, this._audio);
      this._setIcon(false);
      this._play.addEventListener('click', () => { if (this._audio.paused) this._audio.play().catch(() => {}); else this._audio.pause(); });
      this._audio.addEventListener('play', () => this._setIcon(true));
      this._audio.addEventListener('pause', () => this._setIcon(false));
      this._audio.addEventListener('timeupdate', () => { const d = this._audio.duration || 0; this._fill.style.width = (d ? (this._audio.currentTime / d * 100) : 0) + '%'; this._cur.textContent = tfmt(this._audio.currentTime); });
      this._audio.addEventListener('loadedmetadata', () => { this._dur.textContent = tfmt(this._audio.duration); });
      const scrub = (e) => { const r = this._bar.getBoundingClientRect(); const t = clamp((e.clientX - r.left) / r.width, 0, 1); if (this._audio.duration) this._audio.currentTime = t * this._audio.duration; this._fill.style.width = (t * 100) + '%'; };
      this._bar.addEventListener('pointerdown', (e) => { e.preventDefault(); this._bar.setPointerCapture(e.pointerId); scrub(e); const m = (ev) => scrub(ev); const u = () => { window.removeEventListener('pointermove', m); window.removeEventListener('pointerup', u); }; window.addEventListener('pointermove', m); window.addEventListener('pointerup', u); });
    }
    _setIcon(playing) {
      this._play.innerHTML = playing
        ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>';
    }
    _sync() {
      const src = this.getAttribute('src') || '';
      if (this._audio.getAttribute('src') !== src) this._audio.src = src;
      this._title.textContent = this.getAttribute('title') || 'Untitled track';
      this._artist.textContent = this.getAttribute('artist') || '';
      const cover = this.getAttribute('cover');
      this._cover.style.backgroundImage = `url("${cover || PLACEHOLDER}")`;
      css(this._root, { '--wap-color': this.getAttribute('color') || 'var(--color-primary, #5b8cff)' });
    }
    _render() { this._sync(); }
  }

  /* ---------------- wisy-gallery (grid + lightbox) ---------------- */
  class WisyGallery extends HTMLElement {
    static get observedAttributes() { return ['images', 'cols', 'gap', 'radius']; }
    connectedCallback() { this._build(); }
    attributeChangedCallback() { if (this._root) this._build(); }
    _images() { return (this.getAttribute('images') || '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean); }
    _build() {
      this._root = this._root || document.createElement('div');
      this._root.className = 'wg-root';
      const cols = num(this.getAttribute('cols'), 3), gap = num(this.getAttribute('gap'), 10), rad = this.getAttribute('radius') || '8px';
      css(this._root, { 'grid-template-columns': `repeat(${cols}, minmax(0,1fr))`, gap: gap + 'px' });
      this._root.innerHTML = '';
      const imgs = this._images(); if (!imgs.length) imgs.push(PLACEHOLDER, PLACEHOLDER, PLACEHOLDER);
      imgs.forEach((src, i) => {
        const cell = document.createElement('button'); cell.className = 'wg-cell'; cell.type = 'button'; cell.style.borderRadius = rad;
        const img = document.createElement('img'); img.loading = 'lazy'; img.src = src; img.alt = '';
        cell.append(img);
        cell.addEventListener('click', () => { if (!document.documentElement.hasAttribute('data-wisy-editor')) this._open(i); });
        this._root.append(cell);
      });
      if (!this._root.parentNode) { this.innerHTML = ''; this.append(this._root); }
    }
    _open(index) {
      const imgs = this._images(); if (!imgs.length) return;
      let i = index;
      const ov = document.createElement('div'); ov.className = 'wg-lightbox';
      const big = document.createElement('img');
      const show = () => { big.src = imgs[(i + imgs.length) % imgs.length]; };
      const nav = (d) => { i = (i + d + imgs.length) % imgs.length; show(); };
      const prev = document.createElement('button'); prev.className = 'wg-nav wg-prev'; prev.innerHTML = '‹';
      const next = document.createElement('button'); next.className = 'wg-nav wg-next'; next.innerHTML = '›';
      const close = document.createElement('button'); close.className = 'wg-close'; close.innerHTML = '×';
      prev.onclick = (e) => { e.stopPropagation(); nav(-1); };
      next.onclick = (e) => { e.stopPropagation(); nav(1); };
      const done = () => { ov.remove(); document.removeEventListener('keydown', key); };
      close.onclick = done; ov.onclick = done;
      big.onclick = (e) => e.stopPropagation();
      const key = (e) => { if (e.key === 'Escape') done(); if (e.key === 'ArrowLeft') nav(-1); if (e.key === 'ArrowRight') nav(1); };
      document.addEventListener('keydown', key);
      ov.append(big, prev, next, close); show();
      document.body.append(ov);
    }
  }

  /* geometry helpers */
  function pol(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }
  function arc(cx, cy, r, a0, a1) {
    const s = pol(cx, cy, r, a1), e = pol(cx, cy, r, a0);
    const large = a1 - a0 <= 180 ? 0 : 1;
    return `M ${e.x} ${e.y} A ${r} ${r} 0 ${large} 1 ${s.x} ${s.y}`;
  }

  const reg = (name, cls) => { if (!customElements.get(name)) customElements.define(name, cls); };
  reg('wisy-knob', WisyKnob);
  reg('wisy-slider', WisySlider);
  reg('wisy-xy', WisyXY);
  reg('wisy-toggle', WisyToggle);
  reg('wisy-meter', WisyMeter);
  reg('wisy-stepper', WisyStepper);
  reg('wisy-audio', WisyAudio);
  reg('wisy-gallery', WisyGallery);
})();

/* ============================================================
   Animation runtime — reveals [data-anim] elements on scroll.
   Auto-activates everywhere EXCEPT the editor canvas (which sets
   data-wisy-editor on <html>); there it waits for WisyAnim.replay().
   ============================================================ */
(function () {
  if (window.__wisyAnim) return;
  window.__wisyAnim = true;
  const isEditor = () => document.documentElement.hasAttribute('data-wisy-editor');
  let io = null;
  function observer() {
    if (io || !('IntersectionObserver' in window)) return io;
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('wc-inview'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    return io;
  }
  function scan() {
    const obs = observer();
    document.querySelectorAll('[data-anim]').forEach((el) => {
      if (el.__wa) return; el.__wa = true;
      if (el.getAttribute('data-anim-trigger') === 'load' || !obs) el.classList.add('wc-inview');
      else obs.observe(el);
    });
  }
  function activate() {
    document.documentElement.classList.add('wc-anim-on');
    scan();
    try {
      const mo = new MutationObserver(() => scan());
      mo.observe(document.body, { childList: true, subtree: true });
    } catch { /* */ }
  }
  window.WisyAnim = {
    rescan: scan,
    replay() {
      document.documentElement.classList.add('wc-anim-on');
      const els = [...document.querySelectorAll('[data-anim]')];
      els.forEach((el) => { el.classList.remove('wc-inview'); el.__wa = true; });
      // force reflow so the hidden 0% frame applies before replaying
      void document.body.offsetWidth;
      requestAnimationFrame(() => els.forEach((el) => el.classList.add('wc-inview')));
    },
  };
  const start = () => { if (!isEditor()) activate(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
