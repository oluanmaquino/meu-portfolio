/** Entrada suave dos blocos e partículas otimizadas do fundo. */
(function () {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealNodes = Array.from(document.querySelectorAll('.reveal'));
  // Observa tanto no desktop quanto no celular: animações dependem de visibilidade real.
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('has-reveal');
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {rootMargin: '0px 0px -12px 0px', threshold: 0.12});
    revealNodes.forEach(function (element) { io.observe(element); });
    // Evita elementos invisíveis nos navegadores que atrasam o observer.
    requestAnimationFrame(function () {
      revealNodes.forEach(function (element) {
        if (element.getBoundingClientRect().top < window.innerHeight * .97) {
          element.classList.add('is-visible');
        }
      });
    });
  }

  const canvas = document.getElementById('particle-canvas');
  if (!canvas || reducedMotion.matches) return;
  const ctx = canvas.getContext('2d', {alpha: true});
  if (!ctx) return;
  let particles = [];
  let running = true;
  let raf = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;
  const smallScreen = window.matchMedia('(max-width: 640px)');

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const quantity = smallScreen.matches ? 13 : 43;
    particles = Array.from({length: quantity}, function () {
      return {x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * (smallScreen.matches ? .35 : .62), vy: (Math.random() - .5) * (smallScreen.matches ? .35 : .62),
        radius: .6 + Math.random() * 1.2};
    });
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(78, 156, 239, .65)';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
      // Em celulares, omite linhas para gastar menos CPU/bateria.
      if (smallScreen.matches) continue;
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance > 110) continue;
        ctx.strokeStyle = 'rgba(64, 151, 231, ' + ((1 - distance / 110) * .18).toFixed(3) + ')';
        ctx.lineWidth = .7;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  let resizeRaf = 0;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  }, {passive: true});
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    cancelAnimationFrame(raf);
    if (running) draw();
  });
  reducedMotion.addEventListener('change', function (event) {
    running = !event.matches;
    cancelAnimationFrame(raf);
    if (running) draw();
    else ctx.clearRect(0, 0, width, height);
  });
}());
