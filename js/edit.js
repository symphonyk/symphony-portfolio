// Board edit mode (open the board with ?edit on the local preview server).
// Drag to move, drag the corner dot to resize, drag the top dot to rotate,
// then Save to write the new positions into index.html.

(() => {
  const stage = document.querySelector('.stage');
  const items = [...stage.querySelectorAll(':scope > .item')];
  const initial = items.map((el) => el.getAttribute('style'));
  let dirty = false;
  let selected = null;

  document.body.classList.add('editing');

  const num = (el, name) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;
  const round = (n, step = 0.5) => Math.round(n / step) * step;

  function setVars(el, vars) {
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
    markDirty();
  }

  // Handles live in their own layer on top of everything, so no item can hide them.
  const overlay = document.createElement('div');
  overlay.className = 'edit-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <span class="edit-handle edit-handle--rotate" title="Drag to tilt"></span>
    <span class="edit-handle edit-handle--resize" title="Drag to resize"></span>`;
  document.body.append(overlay);
  overlay.addEventListener('pointerdown', (e) => { if (selected && e.target.classList.contains('edit-handle')) start(e, selected); });

  function placeOverlay() {
    if (!selected) { overlay.hidden = true; return; }
    const r = selected.getBoundingClientRect();
    const w = selected.offsetWidth;
    const h = selected.offsetHeight;
    overlay.hidden = false;
    overlay.style.width = `${w}px`;
    overlay.style.height = `${h}px`;
    overlay.style.left = `${r.left + r.width / 2 - w / 2}px`;
    overlay.style.top = `${r.top + r.height / 2 - h / 2}px`;
    overlay.style.transform = `rotate(${num(selected, '--r')}deg)`;
  }
  window.addEventListener('resize', placeOverlay);
  window.addEventListener('scroll', placeOverlay, true);

  function select(el) {
    selected?.classList.remove('is-selected');
    selected = el;
    el?.classList.add('is-selected');
    updateReadout();
  }

  items.forEach((el) => {
    el.setAttribute('draggable', 'false');
    el.querySelectorAll('img').forEach((img) => img.setAttribute('draggable', 'false'));
    el.addEventListener('pointerdown', (e) => start(e, el));
  });

  // stop links, buttons and the envelope from doing their normal thing
  stage.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, true);
  stage.addEventListener('pointerdown', (e) => { if (e.target === stage) select(null); });

  function start(e, el) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    select(el);
    const box = stage.getBoundingClientRect();
    const mode = e.target.classList.contains('edit-handle--resize') ? 'resize'
      : e.target.classList.contains('edit-handle--rotate') ? 'rotate' : 'move';
    const s = { x: num(el, '--x'), y: num(el, '--y'), w: num(el, '--w') || el.offsetWidth / box.width * 100, s: num(el, '--s') || 1, px: e.clientX, py: e.clientY };
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const move = (ev) => {
      const dx = (ev.clientX - s.px) / box.width * 100;
      const dy = (ev.clientY - s.py) / box.height * 100;
      if (mode === 'move') {
        setVars(el, { '--x': `${round(s.x + dx)}%`, '--y': `${round(s.y + dy)}%` });
      } else if (mode === 'resize') {
        const w = Math.max(4, round(s.w + dx, 0.25));
        setVars(el, { '--w': `${w}%`, '--s': `${+(s.s * w / s.w).toFixed(3)}` });
      } else {
        const deg = Math.atan2(ev.clientX - cx, cy - ev.clientY) * 180 / Math.PI;
        setVars(el, { '--r': `${ev.shiftKey ? round(deg, 5) : round(deg, 0.5)}deg` });
      }
      updateReadout();
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  // arrow keys nudge, [ and ] rotate, - and = resize, f/b = front/back
  window.addEventListener('keydown', (e) => {
    if (!selected) return;
    const step = e.shiftKey ? 2 : 0.5;
    const v = { x: num(selected, '--x'), y: num(selected, '--y'), w: num(selected, '--w'), r: num(selected, '--r'), s: num(selected, '--s') || 1 };
    const map = {
      ArrowLeft: { '--x': `${v.x - step}%` }, ArrowRight: { '--x': `${v.x + step}%` },
      ArrowUp: { '--y': `${v.y - step}%` }, ArrowDown: { '--y': `${v.y + step}%` },
      '[': { '--r': `${v.r - 1}deg` }, ']': { '--r': `${v.r + 1}deg` },
      '-': { '--w': `${Math.max(4, v.w - step)}%`, '--s': `${+(v.s * Math.max(4, v.w - step) / v.w).toFixed(3)}` },
      '=': { '--w': `${v.w + step}%`, '--s': `${+(v.s * (v.w + step) / v.w).toFixed(3)}` },
    };
    if (map[e.key]) { e.preventDefault(); setVars(selected, map[e.key]); updateReadout(); }
    if (e.key === 'f' || e.key === 'b') { setVars(selected, { '--z': e.key === 'f' ? '15' : '0' }); updateReadout(); }
    if (e.key === 'Escape') select(null);
  });

  // ---------- toolbar ----------
  const bar = document.createElement('div');
  bar.className = 'edit-bar is-bottom';
  bar.innerHTML = `
    <strong>✏️ Edit mode</strong>
    <span class="edit-bar__readout">👆 Click any item to select it — then drag it, or use the dots to resize/tilt</span>
    <button type="button" data-act="save" disabled>Save layout</button>
    <button type="button" data-act="reset">Undo changes</button>
    <button type="button" data-act="exit">Exit</button>
    <button type="button" data-act="flip" title="Move this toolbar to the other edge">⇅</button>
    <details><summary>tips</summary>
      <p>Drag to move · pink corner dot = resize · blue top dot = rotate (hold Shift to snap)<br>
      Arrow keys nudge (Shift = bigger) · [ ] rotate · - = resize · f / b bring to front / send back</p>
    </details>`;
  document.body.append(bar);
  const saveBtn = bar.querySelector('[data-act="save"]');
  const readout = bar.querySelector('.edit-bar__readout');

  function markDirty() { dirty = true; saveBtn.disabled = false; saveBtn.textContent = 'Save layout'; }

  function updateReadout() {
    placeOverlay();
    if (!selected) { readout.textContent = '👆 Click any item to select it — then drag it, or use the dots to resize/tilt'; return; }
    const label = selected.querySelector('.caption, .print__note, .stash__label, .badge__field i, .notebook__lead, .admit__title, .letter__hi, .bizcard__name, .sis__note')?.textContent
      || selected.getAttribute('aria-label') || selected.className.split(' ')[1];
    readout.textContent = `${label.trim()} — x ${num(selected, '--x')}%, y ${num(selected, '--y')}%, width ${num(selected, '--w')}%, tilt ${num(selected, '--r')}°`;
  }

  bar.addEventListener('click', async (e) => {
    const act = e.target.dataset?.act;
    if (act === 'reset') {
      items.forEach((el, i) => el.setAttribute('style', initial[i]));
      dirty = false; saveBtn.disabled = true; updateReadout();
    }
    if (act === 'flip') bar.classList.toggle('is-bottom');
    if (act === 'exit') {
      if (dirty && !confirm('You have unsaved changes. Leave anyway?')) return;
      location.href = location.pathname;
    }
    if (act === 'save') {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      try {
        const styles = items.map((el) => el.getAttribute('style').replace(/\s*;\s*/g, '; ').trim());
        const res = await fetch('/__save_layout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ styles }) });
        const out = await res.json();
        if (!out.ok) throw new Error(out.error);
        items.forEach((el, i) => { initial[i] = el.getAttribute('style'); });
        dirty = false;
        saveBtn.textContent = 'Saved ✓';
      } catch (err) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save layout';
        alert(`Couldn't save: ${err.message}\n\nMake sure the preview is running with: python3 tools/serve.py`);
      }
    }
  });

  window.addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });
})();
