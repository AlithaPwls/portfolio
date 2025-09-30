// --- Bewaar scrollpositie ---
window.addEventListener("beforeunload", () => {
  localStorage.setItem("scrollY", window.scrollY);
});

window.addEventListener("load", () => {
  const y = localStorage.getItem("scrollY");
  if (y !== null) {
    window.scrollTo(0, parseInt(y, 10));
  }
});

// Sluit alle panels bij pageload (vangt oude HTML/caching/reset CSS op)
document.querySelectorAll('.project-card').forEach((card) => {
  const panel = card.querySelector('.project-details');
  if (!panel) return;
  panel.hidden = true;            // dicht
  panel.style.maxHeight = '0px';  // startwaarde voor animatie
  card.classList.remove('is-open');
});

// --- Helpers voor open/dicht ---
function closeCard(card) {
  const tile = card.querySelector('.project-toggle');
  const panel = card.querySelector('.project-details');
  if (!panel) return;

  panel.style.maxHeight = '0px';
  if (tile) tile.setAttribute('aria-expanded', 'false');

  panel.addEventListener('transitionend', function onEnd(e) {
    if (e.propertyName !== 'max-height') return;
    panel.hidden = true;
    panel.removeEventListener('transitionend', onEnd);
  });

  card.classList.remove('is-open');
}

function openCard(card) {
  const tile = card.querySelector('.project-toggle');
  const panel = card.querySelector('.project-details');
  if (!panel) return;

  panel.hidden = false;      // moet zichtbaar zijn om hoogte te meten
  panel.style.maxHeight = '0px';
  // force reflow zodat scrollHeight klopt
  // eslint-disable-next-line no-unused-expressions
  panel.offsetHeight;

  panel.style.maxHeight = panel.scrollHeight + 'px';
  if (tile) tile.setAttribute('aria-expanded', 'true');
  card.classList.add('is-open');
}

function toggleCard(card) {
  if (card.classList.contains('is-open')) {
    closeCard(card);
    return; // <— belangrijk: stoppen, niet terug openen
  }
  // slechts 1 tegelijk open
  document.querySelectorAll('.project-card.is-open').forEach((c) => {
    if (c !== card) closeCard(c);
  });
  openCard(card);
}

// --- Event delegation op de carousel ---
(function () {
  const carousel = document.querySelector('#projects .carousel');
  if (!carousel) {
    console.warn('Carousel niet gevonden.');
    return;
  }

  console.log('Project-cards gevonden:', document.querySelectorAll('.project-card').length);

  // Klikken op tegels (project-toggle)
  carousel.addEventListener('click', (e) => {
    console.log('Klik op carousel');
    const tile = e.target.closest('.project-toggle');
    if (!tile || !carousel.contains(tile)) return;

    const card = tile.closest('.project-card');
    if (!card) return;

    toggleCard(card);
  });

  // Toetsenbord (Enter/Spatie) op tegel
  carousel.addEventListener('keydown', (e) => {
    const tile = e.target.closest('.project-toggle');
    if (!tile || !carousel.contains(tile)) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const card = tile.closest('.project-card');
      if (!card) return;
      toggleCard(card);
    }
  });

  // Recompute hoogte bij resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('.project-card.is-open .project-details').forEach((panel) => {
      if (!panel.hidden) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
})();
