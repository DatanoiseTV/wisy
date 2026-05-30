/* ============================================================
   Wisy state — document model, history, and a tiny pub/sub bus.
   The document is plain JSON so it serializes/persists trivially.
   ============================================================ */

export const BREAKPOINTS = { tablet: 1024, mobile: 640 };
export const VIEWPORT_WIDTH = { desktop: 1280, tablet: 820, mobile: 390 };

let _id = 0;
export function uid(prefix = 'n') {
  _id++;
  return `${prefix}${_id.toString(36)}${(performance.now() | 0).toString(36).slice(-3)}`;
}

/* ---- node helpers ---- */
export function makeNode(type, props = {}, style = {}, children = []) {
  return {
    id: uid('e'),
    type,
    name: '',
    props: { ...props },
    style: { base: { ...style }, tablet: {}, mobile: {} },
    children,
  };
}

export function cloneNode(node, fresh = true) {
  const c = JSON.parse(JSON.stringify(node));
  if (fresh) {
    const reid = (n) => { n.id = uid('e'); n.children?.forEach(reid); };
    reid(c);
  }
  return c;
}

/* effective style for a breakpoint = base merged with overrides */
export function effectiveStyle(node, vp) {
  const s = { ...(node.style.base || {}) };
  if (vp === 'tablet') Object.assign(s, node.style.tablet || {});
  if (vp === 'mobile') Object.assign(s, node.style.tablet || {}, node.style.mobile || {});
  return s;
}

/* ---- the store ---- */
class Store {
  constructor() {
    this.doc = null;
    this.selectedId = null;
    this.viewport = 'desktop';
    this.zoom = 1;
    this._subs = new Map();
    this._history = [];
    this._future = [];
    this._txDepth = 0;
    this._dirty = false;
  }

  on(evt, fn) {
    if (!this._subs.has(evt)) this._subs.set(evt, new Set());
    this._subs.get(evt).add(fn);
    return () => this._subs.get(evt)?.delete(fn);
  }
  emit(evt, payload) { this._subs.get(evt)?.forEach((fn) => fn(payload)); this._subs.get('*')?.forEach((fn) => fn(evt, payload)); }

  load(doc) {
    this.doc = doc;
    this.selectedId = null;
    this._history = [this._snapshot()];
    this._future = [];
    this.emit('doc:loaded', doc);
    this.emit('render');
  }

  get page() { return this.doc.pages.find((p) => p.id === this.doc.activePageId); }
  get root() { return this.page?.root; }

  findNode(id, node = this.root, parent = null) {
    if (!node) return null;
    if (node.id === id) return { node, parent };
    for (const c of node.children || []) {
      const r = this.findNode(id, c, node);
      if (r) return r;
    }
    return null;
  }
  get selected() { return this.selectedId ? this.findNode(this.selectedId)?.node : null; }

  select(id) {
    if (this.selectedId === id) return;
    this.selectedId = id;
    this.emit('select', id);
  }

  setActivePage(id) {
    if (this.doc.activePageId === id) return;
    this.doc.activePageId = id;
    this.selectedId = null;
    this.emit('page:change', id);
    this.emit('render');
    this.emit('select', null);
  }

  /* ---- mutations (wrapped so history + render stay consistent) ---- */
  transaction(fn, opts = {}) {
    this._txDepth++;
    try { fn(); } finally { this._txDepth--; }
    if (this._txDepth === 0) {
      if (!opts.silent) this._commit(opts);
    }
  }

  _commit({ rerender = true, soft = false } = {}) {
    this._dirty = true;
    if (!soft) {
      // coalesce rapid edits: replace top if it was a soft edit of same selection
      this._history.push(this._snapshot());
      if (this._history.length > 120) this._history.shift();
      this._future = [];
    }
    this.emit('change');
    if (rerender) this.emit('render');
    this.emit('persist');
  }

  /* convenience mutators */
  updateProps(id, patch, opts = {}) {
    this.transaction(() => { const r = this.findNode(id); if (r) Object.assign(r.node.props, patch); }, opts);
  }
  updateStyle(id, patch, vp = this.viewport, opts = {}) {
    this.transaction(() => {
      const r = this.findNode(id); if (!r) return;
      const key = vp === 'desktop' ? 'base' : vp;
      r.node.style[key] = r.node.style[key] || {};
      for (const k in patch) {
        if (patch[k] === null || patch[k] === '') delete r.node.style[key][k];
        else r.node.style[key][k] = patch[k];
      }
    }, opts);
  }
  rename(id, name, opts = {}) { this.transaction(() => { const r = this.findNode(id); if (r) r.node.name = name; }, { rerender: false, ...opts }); }

  insert(node, parentId, index = -1) {
    this.transaction(() => {
      const parent = parentId ? this.findNode(parentId)?.node : this.root;
      if (!parent) return;
      if (!parent.children) parent.children = [];
      if (index < 0 || index > parent.children.length) parent.children.push(node);
      else parent.children.splice(index, 0, node);
    });
    this.select(node.id);
    return node;
  }

  remove(id) {
    const r = this.findNode(id);
    if (!r || !r.parent) return;
    this.transaction(() => {
      const i = r.parent.children.indexOf(r.node);
      if (i >= 0) r.parent.children.splice(i, 1);
    });
    if (this.selectedId === id) this.select(r.parent.id === this.root.id ? null : r.parent.id);
  }

  duplicate(id) {
    const r = this.findNode(id);
    if (!r || !r.parent) return;
    const copy = cloneNode(r.node, true);
    const i = r.parent.children.indexOf(r.node);
    this.insert(copy, r.parent.id, i + 1);
    return copy;
  }

  move(id, newParentId, index) {
    const r = this.findNode(id);
    if (!r) return;
    // prevent dropping into own descendant
    if (this.findNode(newParentId, r.node)) return;
    this.transaction(() => {
      const oldParent = r.parent;
      const oi = oldParent.children.indexOf(r.node);
      const target = this.findNode(newParentId)?.node || this.root;
      if (oldParent === target && oi < index) index--;
      oldParent.children.splice(oi, 1);
      if (!target.children) target.children = [];
      if (index < 0 || index > target.children.length) target.children.push(r.node);
      else target.children.splice(index, 0, r.node);
    });
  }

  reorder(id, dir) {
    const r = this.findNode(id);
    if (!r || !r.parent) return;
    const arr = r.parent.children, i = arr.indexOf(r.node), j = i + dir;
    if (j < 0 || j >= arr.length) return;
    this.transaction(() => { arr.splice(i, 1); arr.splice(j, 0, r.node); });
  }

  setTheme(tokens) {
    this.transaction(() => { this.doc.themeTokens = { ...this.doc.themeTokens, ...tokens }; });
    this.emit('theme:change');
  }

  /* ---- history ---- */
  _snapshot() { return JSON.stringify({ pages: this.doc.pages, activePageId: this.doc.activePageId, themeTokens: this.doc.themeTokens, themeId: this.doc.themeId, title: this.doc.title }); }
  _restore(snap) {
    const s = JSON.parse(snap);
    this.doc.pages = s.pages; this.doc.activePageId = s.activePageId;
    this.doc.themeTokens = s.themeTokens; this.doc.themeId = s.themeId; this.doc.title = s.title;
  }
  undo() {
    if (this._history.length <= 1) return;
    this._future.push(this._history.pop());
    this._restore(this._history[this._history.length - 1]);
    this.selectedId = this.findNode(this.selectedId) ? this.selectedId : null;
    this.emit('change'); this.emit('render'); this.emit('select', this.selectedId); this.emit('persist'); this.emit('theme:change');
  }
  redo() {
    if (!this._future.length) return;
    const snap = this._future.pop();
    this._history.push(snap);
    this._restore(snap);
    this.emit('change'); this.emit('render'); this.emit('select', this.selectedId); this.emit('persist'); this.emit('theme:change');
  }
  get canUndo() { return this._history.length > 1; }
  get canRedo() { return this._future.length > 0; }
}

export const store = new Store();
