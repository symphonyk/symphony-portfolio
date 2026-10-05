// Thank-you notes: visitors write a note and it's written onto the guest check.
// Notes are stored in Symphony's Google Sheet (see tools/guestbook-apps-script.gs);
// deleting a row there (or typing x in its "Hide" column) takes a note down.

const NOTES_URL = 'https://script.google.com/macros/s/AKfycbwJgN6UmF_T-VLli9BrVPQ4v09fkfV2o7rZEAPdHPq5GZ_MPFDsAWmk6Gr1mrCI1APK/exec';

(() => {
  const item = document.querySelector('.guestcheck');
  if (!item) return;

  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  const demo = !NOTES_URL;
  if (demo && !isLocal) { item.hidden = true; return; }

  const editing = new URLSearchParams(location.search).has('edit');
  const DEMO_KEY = 'guestbook-demo-notes';
  const MAX_NOTE = 140;
  const MAX_NAME = 24;
  let notes = [];

  // ---------- storage ----------
  async function loadNotes() {
    if (demo) return JSON.parse(localStorage.getItem(DEMO_KEY) || '[]');
    const res = await fetch(NOTES_URL);
    const data = await res.json();
    return Array.isArray(data.notes) ? data.notes : [];
  }

  async function postNote(note, name, website) {
    if (demo) {
      const saved = { note, name, t: Date.now() };
      localStorage.setItem(DEMO_KEY, JSON.stringify([saved, ...notes]));
      return saved;
    }
    const res = await fetch(NOTES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ note, name, website }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'failed');
    return data.note || { note, name, t: Date.now() };
  }

  // ---------- drawing notes onto a check ----------
  function noteEl(n, number) {
    const el = document.createElement('span');
    el.className = 'gnote';
    el.dataset.n = number;
    const text = document.createElement('span');
    text.className = 'gnote__text';
    text.textContent = n.note;
    const by = document.createElement('span');
    by.className = 'gnote__by';
    by.textContent = ` – ${n.name || 'a friend'}`;
    el.append(text, by);
    return el;
  }

  function invite() {
    const el = document.createElement('span');
    el.className = 'gnote gnote--invite';
    el.textContent = '✎ leave me a note!';
    return el;
  }

  const total = (check) => {
    check.querySelector('.gcheck__total').textContent = notes.length ? `${notes.length}♥` : '';
  };

  function drawBoard() {
    const box = item.querySelector('.gcheck__notes');
    box.replaceChildren(invite(), ...notes.slice(0, 14).map((n, i) => noteEl(n, notes.length - i)));
    total(item);
  }

  // ---------- the opened check ----------
  const gb = document.createElement('div');
  gb.className = 'gb';
  gb.hidden = true;
  gb.setAttribute('role', 'dialog');
  gb.setAttribute('aria-modal', 'true');
  gb.setAttribute('aria-labelledby', 'gb-title');
  gb.innerHTML = `
    <div class="gb__backdrop"></div>
    <button class="gb__close" type="button" aria-label="Close">×</button>
    <div class="gb__wrap">
      <div class="gb__checkcol">
        <div class="gb__checkholder">
          <img class="gb__pin" src="assets/img/pin-red.webp" width="282" height="337" alt="" aria-hidden="true">
          <span class="gcheck">
            <img class="gcheck__img" src="assets/img/guest-check.webp" width="383" height="644" alt="">
            <span class="gcheck__table">1</span>
            <span class="gcheck__waiter">Symphony</span>
            <span class="gcheck__notes" aria-live="polite"></span>
            <span class="gcheck__total"></span>
          </span>
        </div>
        <div class="gb__pager" hidden>
          <button type="button" data-step="-1">‹ newer</button>
          <span class="gb__page"></span>
          <button type="button" data-step="1">older ›</button>
        </div>
      </div>
      <form class="gb__slip" novalidate>
        <h2 class="gb__title" id="gb-title">Leave me a note!</h2>
        <p class="gb__hint">It'll be written on the check for everyone to see.</p>
        <label for="gb-note">Your note</label>
        <textarea id="gb-note" name="note" maxlength="${MAX_NOTE}" required placeholder="Say hi, share a thought…"></textarea>
        <p class="gb__count" aria-live="polite">0 / ${MAX_NOTE}</p>
        <label for="gb-name">Your name</label>
        <input id="gb-name" name="name" type="text" maxlength="${MAX_NAME}" autocomplete="given-name" placeholder="(optional)">
        <input class="gb__hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="gb__send" type="submit">Pin it up ✎</button>
        <p class="gb__status" role="status"></p>
      </form>
    </div>`;
  document.body.append(gb);

  const check = gb.querySelector('.gcheck');
  const box = check.querySelector('.gcheck__notes');
  const pager = gb.querySelector('.gb__pager');
  const form = gb.querySelector('.gb__slip');
  const textarea = form.elements.note;
  const count = gb.querySelector('.gb__count');
  const status = gb.querySelector('.gb__status');
  const send = gb.querySelector('.gb__send');
  let pages = [[]];
  let page = 0;
  let freshest = null;

  // Split the notes into checks of 14 ruled lines each, measuring as we go.
  function paginate() {
    pages = [[]];
    box.replaceChildren();
    notes.forEach((n, i) => {
      const el = noteEl(n, notes.length - i);
      box.append(el);
      if (box.scrollHeight > box.clientHeight + 1 && box.children.length > 1) {
        el.remove();
        box.replaceChildren(el);
        pages.push([]);
      }
      pages[pages.length - 1].push(i);
    });
    page = Math.min(page, pages.length - 1);
    drawPage();
  }

  function drawPage() {
    box.replaceChildren(...pages[page].map((i) => {
      const el = noteEl(notes[i], notes.length - i);
      if (notes[i] === freshest) el.classList.add('gnote--new');
      return el;
    }));
    if (!notes.length) box.append(invite());
    total(check);
    pager.hidden = pages.length < 2;
    gb.querySelector('.gb__page').textContent = `check ${page + 1} of ${pages.length}`;
    pager.querySelector('[data-step="-1"]').disabled = page === 0;
    pager.querySelector('[data-step="1"]').disabled = page === pages.length - 1;
  }

  pager.addEventListener('click', (e) => {
    const step = Number(e.target.closest('button')?.dataset.step);
    if (!step) return;
    page = Math.max(0, Math.min(pages.length - 1, page + step));
    drawPage();
  });

  textarea.addEventListener('input', () => {
    count.textContent = `${textarea.value.length} / ${MAX_NOTE}`;
    count.classList.toggle('is-full', textarea.value.length >= MAX_NOTE);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = textarea.value.replace(/\s+/g, ' ').trim().slice(0, MAX_NOTE);
    const name = form.elements.name.value.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
    status.classList.remove('is-error');
    if (note.length < 2) {
      status.textContent = 'Write a little something first!';
      status.classList.add('is-error');
      textarea.focus();
      return;
    }
    send.disabled = true;
    status.textContent = 'Pinning it up…';
    try {
      const saved = await postNote(note, name, form.elements.website.value);
      freshest = saved;
      notes = [saved, ...notes];
      page = 0;
      paginate();
      drawBoard();
      form.reset();
      count.textContent = `0 / ${MAX_NOTE}`;
      status.textContent = demo ? 'Thank you! (Preview only, not saved online yet.)' : 'Thank you! Your note is on the check ♥';
    } catch (err) {
      status.textContent = err.message === 'busy'
        ? 'Lots of notes right now! Try again in a little bit.'
        : "Hmm, that didn't go through. Please try again.";
      status.classList.add('is-error');
    } finally {
      send.disabled = false;
    }
  });

  // ---------- open / close (the board item links to #notes) ----------
  let openedFromBoard = false;
  let lastFocus = null;

  function open(fromBoard) {
    if (!gb.hidden || editing) return;
    openedFromBoard = fromBoard;
    lastFocus = document.activeElement;
    gb.classList.remove('is-closing');
    gb.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    paginate();
    if (window.matchMedia('(hover: hover)').matches) textarea.focus({ preventScroll: true });
    else gb.querySelector('.gb__close').focus({ preventScroll: true });
  }

  function close() {
    if (gb.hidden || gb.classList.contains('is-closing')) return;
    gb.classList.add('is-closing');
    const done = () => {
      gb.hidden = true;
      gb.classList.remove('is-closing');
      document.documentElement.style.overflow = '';
      document.querySelectorAll('.is-pressed').forEach((el) => el.classList.remove('is-pressed'));
      (lastFocus && lastFocus !== document.body ? lastFocus : item).focus?.({ preventScroll: true });
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) done();
    else setTimeout(done, 240);
    if (location.hash === '#notes') {
      if (openedFromBoard) history.back();
      else history.replaceState(null, '', location.pathname + location.search);
    }
  }

  gb.querySelector('.gb__close').addEventListener('click', close);
  gb.querySelector('.gb__backdrop').addEventListener('click', close);
  gb.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    const focusable = [...gb.querySelectorAll('button:not(:disabled), textarea, input:not(.gb__hp)')]
      .filter((el) => el.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  window.addEventListener('hashchange', () => {
    if (location.hash === '#notes') open(true);
    else close();
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!gb.hidden) paginate(); }, 150);
  });

  // ---------- start ----------
  drawBoard();
  loadNotes()
    .then((loaded) => {
      notes = loaded;
      drawBoard();
      if (!gb.hidden) paginate();
    })
    .catch(() => {});
  if (location.hash === '#notes') open(false);
})();
