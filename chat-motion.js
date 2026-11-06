(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (!reduced.matches) entry.target.classList.add('chat-motion');
    observer.unobserve(entry.target);
  }), {threshold: .4});
  document.querySelectorAll('.chat-preview').forEach(el => observer.observe(el));
  reduced.addEventListener('change', () => {
    if (reduced.matches) document.querySelectorAll('.chat-motion').forEach(el => el.classList.remove('chat-motion'));
  });
})();
