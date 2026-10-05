// Project sheets: fold the page away before heading back to the board.
(() => {
  const sheet = document.querySelector('.sheet');
  // keep the current project's polaroid in view when the strip scrolls sideways
  const current = document.querySelector('.minis__item.is-current');
  const strip = current?.parentElement;
  if (strip && strip.scrollWidth > strip.clientWidth) strip.scrollLeft = current.offsetLeft - (strip.clientWidth - current.offsetWidth) / 2;
  if (!sheet || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('a.sheet__close, a.back-tab, a.minis__item:not(.is-current)').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      sheet.classList.add('is-closing');
      setTimeout(() => { location.href = link.href; }, 260);
    });
  });
  addEventListener('pageshow', (event) => { if (event.persisted) sheet.classList.remove('is-closing'); });
})();
