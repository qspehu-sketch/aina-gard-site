(() => {
  'use strict';

  function flipCard(el) {
    el.classList.toggle('flipped');
  }

  document.querySelectorAll('[data-card]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a[href]')) return;
      if (e.target.closest('.card-close')) {
        e.stopPropagation();
        card.classList.remove('flipped');
        return;
      }
      flipCard(card);
    });
  });
})();
