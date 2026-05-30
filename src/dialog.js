/* ============================================================
   In-app dialogs — replaces window.confirm/prompt with styled,
   promise-based modals. Esc cancels, Enter confirms.
   ============================================================ */
let layer = null;

function ensureLayer() {
  if (layer) return layer;
  layer = document.createElement('div');
  layer.className = 'dlg-layer';
  layer.hidden = true;
  document.body.append(layer);
  return layer;
}

function open({ title, message, icon, confirmText = 'Confirm', cancelText = 'Cancel', danger = false, input = null }) {
  return new Promise((resolve) => {
    const l = ensureLayer();
    l.hidden = false;
    const card = document.createElement('div');
    card.className = 'dlg-card';
    card.innerHTML = `
      <div class="dlg-head">
        ${icon ? `<div class="dlg-ic ${danger ? 'is-danger' : ''}">${icon}</div>` : ''}
        <div class="dlg-titles">
          <h3>${esc(title)}</h3>
          ${message ? `<p>${esc(message)}</p>` : ''}
        </div>
      </div>
      ${input != null ? `<input class="dlg-input ctl" type="text" value="${esc(input)}" />` : ''}
      <div class="dlg-actions">
        <button class="btn btn--ghost" data-act="cancel">${esc(cancelText)}</button>
        <button class="btn ${danger ? 'btn--danger-solid' : 'btn--primary'}" data-act="ok">${esc(confirmText)}</button>
      </div>`;
    const back = document.createElement('div'); back.className = 'dlg-back';
    l.innerHTML = ''; l.append(back, card);
    requestAnimationFrame(() => card.classList.add('in'));

    const inp = card.querySelector('.dlg-input');
    if (inp) { inp.focus(); inp.select(); }
    else card.querySelector('[data-act="ok"]').focus();

    const done = (val) => {
      card.classList.remove('in');
      setTimeout(() => { l.hidden = true; l.innerHTML = ''; }, 140);
      document.removeEventListener('keydown', onKey, true);
      resolve(val);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(input != null ? null : false); }
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); done(input != null ? inp.value : true); }
    };
    document.addEventListener('keydown', onKey, true);
    back.onclick = () => done(input != null ? null : false);
    card.querySelector('[data-act="cancel"]').onclick = () => done(input != null ? null : false);
    card.querySelector('[data-act="ok"]').onclick = () => done(input != null ? inp.value : true);
  });
}

const WARN_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';

export function confirmDialog(title, opts = {}) {
  return open({ title, icon: opts.icon || WARN_IC, ...opts });
}
export function promptDialog(title, value = '', opts = {}) {
  return open({ title, input: value, confirmText: opts.confirmText || 'Save', ...opts });
}

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
