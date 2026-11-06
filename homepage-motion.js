// Short, viewport-triggered sequences. Content stays readable without motion or JS.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const graphics = document.querySelectorAll('[data-home-motion]');
  function play(graphic) {
    graphic.classList.remove('motion-playing');
    if (reduced.matches) return;
    void graphic.offsetWidth;
    graphic.classList.add('motion-playing');
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      play(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  graphics.forEach(graphic => {
    observer.observe(graphic);
    graphic.querySelector('.motion-replay')?.addEventListener('click', () => play(graphic));
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) graphics.forEach(graphic => graphic.classList.remove('motion-playing'));
  });
})();
