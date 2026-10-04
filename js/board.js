// Corkboard interactions: a little wiggle before following a link,
// and the pink envelope that the extra projects slide out of.

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

  document.querySelectorAll('a.item, .stash__card').forEach((link) => {
    link.addEventListener('click', (event) => {
      const opensElsewhere =
        link.target === '_blank' ||
        link.href.startsWith('mailto:') ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;
      const item = link.closest('.item');
      if (!item || reduceMotion) return;

      item.classList.remove('is-pressed');
      void item.offsetWidth; // restart the animation if clicked twice
      item.classList.add('is-pressed');
      item.addEventListener('animationend', () => item.classList.remove('is-pressed'), { once: true });

      if (opensElsewhere) return;
      event.preventDefault();
      setTimeout(() => { window.location.href = link.href; }, 280);
    });
  });

  // Touch screens have no hover: tapping the envelope pulls the projects out.
  document.querySelectorAll('.stash').forEach((stash) => {
    const pocket = stash.querySelector('.stash__pocket');
    const setOpen = (open) => {
      stash.classList.toggle('is-open', open);
      pocket.setAttribute('aria-expanded', String(open));
    };
    pocket.addEventListener('click', () => setOpen(!stash.classList.contains('is-open')));
    document.addEventListener('click', (event) => { if (!stash.contains(event.target)) setOpen(false); });
    stash.addEventListener('keydown', (event) => { if (event.key === 'Escape') { setOpen(false); pocket.focus(); } });
  });

  // Restore the board if the user comes back with the browser's back button.
  window.addEventListener('pageshow', () => {
    document.querySelectorAll('.is-pressed').forEach((el) => el.classList.remove('is-pressed'));
  });
})();
