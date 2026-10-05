// Corkboard interactions: a little wiggle before following a link.

(() => {
  if (new URLSearchParams(location.search).has('edit')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/edit.css';
    document.head.append(link);
    const script = document.createElement('script');
    script.src = 'js/edit.js';
    document.body.append(script);
    return;
  }

  // Local preview only: a shortcut into edit mode.
  if (['localhost', '127.0.0.1'].includes(location.hostname)) {
    const btn = document.createElement('a');
    btn.href = '?edit';
    btn.textContent = '✏️ Edit board';
    btn.style.cssText = 'position:fixed;right:40px;bottom:40px;z-index:100;padding:10px 16px;border-radius:10px;'
      + 'font:600 14px system-ui,sans-serif;color:#fff;background:rgba(25,22,28,.9);text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.35)';
    document.body.append(btn);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a.item, a.swatch__card').forEach((link) => {
    link.addEventListener('click', (event) => {
      const opensElsewhere =
        link.target === '_blank' ||
        link.href.startsWith('mailto:') ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;
      if (reduceMotion) return;
      // a swatch page wiggles on its own, not the whole book
      const item = link.classList.contains('swatch__card') ? link : link.closest('.item');
      if (!item) return;

      item.classList.remove('is-pressed');
      void item.offsetWidth; // restart the animation if clicked twice
      item.classList.add('is-pressed');
      item.addEventListener('animationend', () => item.classList.remove('is-pressed'), { once: true });

      if (opensElsewhere) return;
      event.preventDefault();
      setTimeout(() => { window.location.href = link.href; }, 280);
    });
  });

  // Restore the board if the user comes back with the browser's back button.
  window.addEventListener('pageshow', () => {
    document.querySelectorAll('.is-pressed').forEach((el) => el.classList.remove('is-pressed'));
  });
})();

// today's date on the ID badge (MM·DD·YY)
(() => {
  const el = document.querySelector('.badge__date');
  if (!el) return;
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  el.textContent = `${p(d.getMonth() + 1)}·${p(d.getDate())}·${p(d.getFullYear() % 100)}`;
})();
