// Scrapbook pages: click any photo to see it bigger.

(() => {
  const photos = document.querySelectorAll('.photo');
  if (!photos.length || typeof HTMLDialogElement === 'undefined') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.innerHTML = '<button type="button" aria-label="Close">×</button><img alt="">';
  document.body.append(dialog);
  const big = dialog.querySelector('img');

  photos.forEach((photo) => {
    photo.addEventListener('click', () => {
      const img = photo.querySelector('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      dialog.showModal();
    });
  });

  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
