// Candy dispenser toy: lift the lever and the disc carries one candy round to the chute;
// push it back down and the next candy drops from the funnel into the disc's pocket.
(() => {
  const toy = document.querySelector('[data-toy]');
  if (!toy) return;
  const svg = toy.querySelector('svg');
  const lever = toy.querySelector('.toy__lever');
  const rotor = toy.querySelector('.toy__rotor');
  const spring = toy.querySelector('.toy__spring');
  const candy = toy.querySelector('.toy__candy');
  const note = toy.querySelector('.toy__note');
  const empty = toy.querySelector('.toy__empty');
  const NS = 'http://www.w3.org/2000/svg';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // coordinates are in the photo's 460×485 space
  const PX = 166, PY = 275, BASE = 32.9, UP = 95, R = 5.5;
  const POCKET = 21;                       // candy sits this far above the pivot
  const HOOK = [-9.5, 32], SB = [156.5, 404], SPRING = 97;   // spring top (on the disc), bottom anchor, rest length
  const CHUTE = [[190, 284], [203, 300], [222, 318], [250, 335], [285, 352], [318, 370], [344, 384]];
  const SLOTS = [];
  for (let row = 0; row < 5; row++) {
    for (let x = 362 + (row % 2) * 5.5; x < 434; x += 11) {
      SLOTS.push([x + (Math.random() - .5) * 1.6, 448 - row * 9.6 + (Math.random() - .5) * 1.2]);
    }
  }

  let rot = 0, ball = null, busy = false, filled = 0, pulls = 0;
  const rad = (d) => d * Math.PI / 180;
  const pocketAt = (r) => [PX + POCKET * Math.sin(rad(r)), PY - POCKET * Math.cos(rad(r))];

  const move = (c, x, y) => { c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); };
  const pearl = (x, y, inside) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', R);
    c.setAttribute('fill', inside ? 'url(#pearl-in)' : 'url(#pearl)');
    move(c, x, y);
    candy.appendChild(c);
    return c;
  };
  const run = (dur, step, done) => {
    if (calm) { step(1); done && done(); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      step(t);
      if (t < 1) requestAnimationFrame(tick); else if (done) done();
    };
    requestAnimationFrame(tick);
  };
  const say = (html) => { note.innerHTML = html; };

  const setRot = (r) => {
    rot = Math.min(UP, Math.max(0, r));
    rotor.style.transform = `rotate(${rot.toFixed(2)}deg)`;
    lever.setAttribute('transform', `translate(${PX} ${PY}) rotate(${(BASE + rot).toFixed(2)})`);
    lever.setAttribute('aria-valuenow', Math.round(rot / UP * 100));
    // the spring's top hook rides on the disc, so it swings round and stretches
    const c = Math.cos(rad(rot)), s = Math.sin(rad(rot));
    const tx = PX + HOOK[0] * c - HOOK[1] * s, ty = PY + HOOK[0] * s + HOOK[1] * c;
    const len = Math.hypot(tx - SB[0], ty - SB[1]);
    spring.style.transform = `rotate(${Math.atan2(tx - SB[0], SB[1] - ty) * 180 / Math.PI}deg) scaleY(${len / SPRING})`;
    spring.style.opacity = 1 - Math.max(0, len / SPRING - 1) * .5;
    if (ball) move(ball, ...pocketAt(rot));
    const t = rot / UP;
    if (t > .85 && ball) release();
    else if (t < .12 && !ball && !busy) reload();
  };

  const segs = [0];
  for (let i = 1; i < CHUTE.length; i++) {
    segs.push(segs[i - 1] + Math.hypot(CHUTE[i][0] - CHUTE[i - 1][0], CHUTE[i][1] - CHUTE[i - 1][1]));
  }
  const along = (d) => {
    let i = 1;
    while (i < segs.length - 1 && segs[i] < d) i++;
    const k = (d - segs[i - 1]) / (segs[i] - segs[i - 1]);
    const [ax, ay] = CHUTE[i - 1], [bx, by] = CHUTE[i];
    return [ax + (bx - ax) * k, ay + (by - ay) * k];
  };

  function release() {
    if (filled >= SLOTS.length) {
      empty.hidden = false;
      say('whoa, the cup’s full!');
      return;
    }
    const c = ball, slot = SLOTS[filled++], [sx, sy] = pocketAt(rot);
    ball = null;
    pulls++;
    const total = segs[segs.length - 1];
    run(140, (t) => move(c, sx + (CHUTE[0][0] - sx) * t, sy + (CHUTE[0][1] - sy) * t), () =>
      run(850, (t) => move(c, ...along(total * t * t)), () => {
        c.setAttribute('fill', 'url(#pearl)');
        const [x0, y0] = CHUTE[CHUTE.length - 1];
        run(360, (t) => {
          const hop = t > .8 ? Math.sin((t - .8) / .2 * Math.PI) * -2.5 : 0;
          move(c, x0 + (slot[0] - x0) * t, y0 + (slot[1] - y0) * Math.min(1, t * t / .64) + hop);
        });
      }));
    say(pulls === 1 ? 'sweet! now push it back down <span aria-hidden="true">↙</span>'
                    : ['wheee!', 'sliiiide!', 'one more?', 'so satisfying.'][pulls % 4]);
  }

  function reload() {
    busy = true;
    const x0 = 196 + Math.random() * 60, c = pearl(x0, -12, false);
    run(650, (t) => {
      const y = -12 + (POCKET * -1 + PY + 12) * t * t;
      const [px, py] = pocketAt(rot);
      move(c, x0 + (px - x0) * Math.min(1, t * 1.6), Math.min(y, py));
      if (y > 78) c.setAttribute('fill', 'url(#pearl-in)');
    }, () => {
      busy = false;
      ball = c;
      move(c, ...pocketAt(rot));
      if (pulls === 1) say('reloaded! lift it again <span aria-hidden="true">↖</span>');
      if (rot / UP > .85) release();
    });
  }

  empty.addEventListener('click', () => {
    [...candy.children].forEach((c) => {
      if (c === ball) return;
      c.style.transition = 'opacity .4s';
      c.style.opacity = 0;
      setTimeout(() => c.remove(), 420);
    });
    filled = 0;
    empty.hidden = true;
    say('all clear! lift away');
  });

  const toAngle = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    let r = Math.atan2(p.y - PY, p.x - PX) * 180 / Math.PI - 90 - BASE;
    if (r < -120) r += 360;
    return r;
  };
  const tween = (to) => { const from = rot; run(380, (t) => setRot(from + (to - from) * (1 - (1 - t) ** 3))); };

  let drag = null;
  lever.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    lever.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, moved: false };
    toy.classList.add('is-dragging');
  });
  lever.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  lever.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4) drag.moved = true;
    if (drag.moved) setRot(toAngle(e));
  });
  const end = () => {
    if (!drag) return;
    if (!drag.moved) tween(rot < UP / 2 ? UP : 0);
    drag = null;
    toy.classList.remove('is-dragging');
  };
  lever.addEventListener('pointerup', end);
  lever.addEventListener('pointercancel', end);
  lever.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowUp' || k === 'ArrowLeft') setRot(rot + 12);
    else if (k === 'ArrowDown' || k === 'ArrowRight') setRot(rot - 12);
    else if (k === ' ' || k === 'Enter') tween(rot < UP / 2 ? UP : 0);
    else return;
    e.preventDefault();
  });

  ball = pearl(...pocketAt(0), true);
  setRot(0);

  // wiggle now and then until someone grabs it, so people know it moves
  let touched = false, shown = false;
  const touch = () => { touched = true; toy.classList.add('is-touched'); };
  lever.addEventListener('pointerdown', touch);
  lever.addEventListener('keydown', touch);
  const wiggle = () => {
    if (touched) return;
    if (shown && rot === 0) run(900, (t) => { if (!touched) setRot(Math.sin(t * Math.PI * 2) ** 2 * 12); });
    setTimeout(wiggle, 3200);
  };
  if (!calm && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { shown = en.isIntersecting; }, { threshold: .6 }).observe(toy);
    setTimeout(wiggle, 800);
  }
})();
