// Project sheets: fold the page away before heading back to the board.
(() => {
  const sheet = document.querySelector('.sheet');
  if (!sheet || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('a.sheet__close, a.back-tab').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      sheet.classList.add('is-closing');
      setTimeout(() => { location.href = link.href; }, 260);
    });
  });
  addEventListener('pageshow', (event) => { if (event.persisted) sheet.classList.remove('is-closing'); });
})();
