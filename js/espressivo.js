// Espressivo: drag the objects around; drop one near the tabletop and it
// settles onto the surface. Click (or Enter) toggles an object on/off the table.
(() => {
  const room = document.querySelector('.esp__room');
  const stage = room?.querySelector('.esp__stage');
  const table = stage?.querySelector('.esp__table');
  if (!stage || !table) return;

  const things = [...stage.querySelectorAll('.thing')];
  const done = room.querySelector('.esp__done');
  const mobile = matchMedia('(max-width: 700px)');
  // the tabletop, as fractions of the table photo (top face runs from y .06 to .18)
  const TOP = { x0: .07, x1: .93, y0: .07, y1: .17 };
  const SLOTS = [.2, .8, .5, .35, .65, .12, .88];

  const pct = (px, of) => `${(px / of) * 100}%`;
  const box = (el) => el.getBoundingClientRect();

  function moveTo(thing, left, top) {
    const s = box(stage);
    thing.style.left = pct(left, s.width);
    thing.style.top = pct(top, s.height);
  }

  function goHome(thing, animate) {
    const [x, y] = thing.dataset[mobile.matches ? 'mhome' : 'home'].split(',');
    settle(thing, animate);
    thing.style.left = `${x}%`;
    thing.style.top = `${y}%`;
    thing.classList.remove('is-placed');
    thing.style.zIndex = '';
  }

  function settle(thing, animate) {
    if (!animate) return;
    thing.classList.add('is-settling');
    setTimeout(() => thing.classList.remove('is-settling'), 460);
  }

  // put a thing on the tabletop with its base at fraction (u, v) of the photo
  function place(thing, u, v) {
    const s = box(stage), t = box(table), b = box(thing);
    const half = b.width / 2 / t.width;
    u = Math.min(Math.max(u, TOP.x0 + half * .6), TOP.x1 - half * .6);
    v = Math.min(Math.max(v, TOP.y0), TOP.y1);
    settle(thing, true);
    moveTo(thing, t.left - s.left + u * t.width - b.width / 2, t.top - s.top + v * t.height - b.height);
    thing.classList.add('is-placed');
    thing.style.zIndex = String(10 + Math.round(v * 100));
    update();
  }

  function update() {
    const n = things.filter((t) => t.classList.contains('is-placed')).length;
    room.classList.toggle('has-placed', n > 0);
    done.textContent = n === things.length ? 'so cozy! thanks for decorating ♡' : '';
  }

  things.forEach((thing) => {
    goHome(thing, false);

    let start = null;
    let moved = false;

    thing.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const b = box(thing);
      start = { x: event.clientX, y: event.clientY, dx: event.clientX - b.left, dy: event.clientY - b.top };
      moved = false;
      try { thing.setPointerCapture(event.pointerId); } catch { /* synthetic events */ }
    });

    thing.addEventListener('pointermove', (event) => {
      if (!start) return;
      if (!moved && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5) return;
      if (!moved) {
        moved = true;
        thing.classList.add('is-dragging');
        thing.classList.remove('is-placed');
        thing.style.zIndex = '';
      }
      const s = box(stage), b = box(thing);
      const left = Math.min(Math.max(event.clientX - start.dx - s.left, -b.width * .3), s.width - b.width * .7);
      const top = Math.min(Math.max(event.clientY - start.dy - s.top, -b.height * .5), s.height - b.height * .6);
      moveTo(thing, left, top);
    });

    const end = () => {
      if (!start) return;
      start = null;
      if (!moved) return;
      thing.classList.remove('is-dragging');
      const t = box(table), b = box(thing);
      const u = (b.left + b.width / 2 - t.left) / t.width;
      const v = (b.bottom - t.top) / t.height;
      if (u > .02 && u < .98 && v > -.45 && v < .6) place(thing, u, v);
      else update();
    };
    thing.addEventListener('pointerup', end);
    thing.addEventListener('pointercancel', end);

    // click / keyboard: hop onto the table, or back to where it floated
    thing.addEventListener('click', (event) => {
      if (moved) { event.preventDefault(); moved = false; return; }
      if (thing.classList.contains('is-placed')) { goHome(thing, true); update(); return; }
      const taken = things.filter((t) => t.classList.contains('is-placed')).length;
      place(thing, SLOTS[taken % SLOTS.length], TOP.y0 + (taken % 3) * .04);
    });
  });

  room.querySelector('.esp__tidy').addEventListener('click', () => {
    things.forEach((t) => goHome(t, true));
    update();
  });

  // the stage changes shape between layouts, so start fresh
  mobile.addEventListener('change', () => { things.forEach((t) => goHome(t, false)); update(); });
})();
