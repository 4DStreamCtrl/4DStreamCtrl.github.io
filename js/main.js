/* ========== Particle Canvas Background ========== */
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 150;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function createParticles() {
    particles = [];
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1,
        color: Math.random() < 0.5 ? 'rgba(74,144,217,' : 'rgba(124,58,237,',
      });
    }
  }

  function draw() {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.6)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(124,58,237,' + opacity + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < 200) {
        const opacity = (1 - mDist / 200) * 0.3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = 'rgba(74,144,217,' + opacity + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });
})();

/* ========== Scroll Animations (Intersection Observer) ========== */
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
})();

/* ========== Navbar Scroll Effect ========== */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* ========== Tab Switching ========== */
(function () {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach((c) => {
        c.classList.remove('active');
        c.style.animation = 'none';
        c.querySelectorAll('video').forEach((v) => v.pause());
      });

      const activeTab = document.getElementById('tab-' + target);
      if (activeTab) {
        void activeTab.offsetHeight;
        activeTab.style.animation = '';
        activeTab.classList.add('active');
        activeTab.querySelectorAll('video').forEach((v) => {
          v.currentTime = 0;
          v.play().catch(() => {});
        });
      }
    });
  });
})();

/* ========== 3D Visualization Switcher ========== */
(function () {
  const vizBtns = document.querySelectorAll('.viz-btn');
  const iframe = document.getElementById('viz-iframe');
  if (!iframe) return;

  vizBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      vizBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      iframe.src = btn.dataset.viz;
    });
  });
})();

/* ========== Copy BibTeX ========== */
(function () {
  const copyBtn = document.getElementById('copy-bibtex');
  if (!copyBtn) return;
  const bibtex = document.querySelector('.bibtex-code code');

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(bibtex.textContent).then(() => {
      copyBtn.classList.add('copied');
      copyBtn.querySelector('span').textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.querySelector('span').textContent = 'Copy';
      }, 2000);
    });
  });
})();

/* ========== Synchronized Video Playback in Comparisons ========== */
(function () {
  document.querySelectorAll('.video-compare').forEach((block) => {
    const videos = block.querySelectorAll('video');
    if (videos.length < 2) return;

    function syncPlay() {
      const minTime = Math.min(...Array.from(videos).map((v) => v.currentTime));
      videos.forEach((v) => {
        if (Math.abs(v.currentTime - minTime) > 0.3) {
          v.currentTime = minTime;
        }
      });
    }

    videos.forEach((v) => {
      v.addEventListener('seeked', syncPlay);
      v.addEventListener('play', () => {
        videos.forEach((other) => {
          if (other !== v) other.play().catch(() => {});
        });
      });
    });
  });
})();

/* ========== Smooth nav link scrolling (fallback) ========== */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
