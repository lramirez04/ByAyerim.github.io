/* ── Custom cursor ── */
const cursor = document.getElementById('cursor');
let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  curX += (mouseX - curX) * 0.12;
  curY += (mouseY - curY) * 0.12;
  cursor.style.left = curX + 'px';
  cursor.style.top  = curY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

const hoverTargets = document.querySelectorAll('a, .video-card, button');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
});

/* ── Nav color: naranja sobre fondo blanco, blanco en el resto ── */
const navEl       = document.querySelector('nav');
const sobreMiEl   = document.getElementById('sobre-mi');
const aboutImgEl  = document.querySelector('.about-image');

function updateNavColor() {
  if (!navEl || !sobreMiEl) return;
  const navH    = navEl.offsetHeight;
  const scrollY = window.scrollY;

  // nav--light: toda la sección #sobre-mi (links se vuelven naranjas)
  const sobreTop    = sobreMiEl.offsetTop;
  const sobreBot    = sobreTop + sobreMiEl.offsetHeight;
  const isOverWhite = (scrollY + navH >= sobreTop) && (scrollY < sobreBot);
  navEl.classList.toggle('nav--light', isOverWhite);

  // nav--hide-logo: solo sobre el área de la imagen (.about-image)
  if (aboutImgEl) {
    const imgTop     = aboutImgEl.getBoundingClientRect().top + scrollY;
    const imgBot     = imgTop + aboutImgEl.offsetHeight;
    const isOverImg  = (scrollY + navH >= imgTop) && (scrollY < imgBot);
    navEl.classList.toggle('nav--hide-logo', isOverImg);
  }
}

window.addEventListener('scroll', updateNavColor, { passive: true });
updateNavColor();

/* ── IntersectionObserver: play/pause videos off-screen ── */
const videoCards = document.querySelectorAll('.video-card video');
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.isIntersecting
      ? entry.target.play().catch(() => {})
      : entry.target.pause();
  });
}, { threshold: 0.1 });
videoCards.forEach(v => videoObserver.observe(v));

/* ── Word reveal on scroll — about-body ── */
const aboutBody = document.querySelector('.about-body');
if (aboutBody) {
  const words = aboutBody.innerText.trim().split(/\s+/);
  aboutBody.innerHTML = words
    .map(w => `<span class="word">${w}</span>`)
    .join(' ');

  const spans = Array.from(aboutBody.querySelectorAll('.word'));

  function updateWords() {
    const threshold = window.innerHeight * 0.78;
    spans.forEach(span => {
      const top = span.getBoundingClientRect().top;
      top < threshold
        ? span.classList.add('visible')
        : span.classList.remove('visible');
    });
  }

  window.addEventListener('scroll', updateWords, { passive: true });
  updateWords();
}

/* ── YouTube facade: clic carga el iframe con autoplay ── */
document.querySelectorAll('.yt-facade').forEach(facade => {
  facade.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = facade.dataset.src;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', '');
    facade.replaceWith(iframe);
  });
});

/* ── Bio Slider con barra de progreso tipo YouTube ── */
const bioSlides      = document.querySelectorAll('.bio-slide');
const bioImgs        = document.querySelectorAll('.bio-img');
const bioFill        = document.getElementById('bioProgressFill');

const SLIDE_DURATION = 5000;  // 5s por slide
const TOTAL_SLIDES   = 3;
let currentSlide     = 0;
let startTime        = null;
let rafId            = null;
let isPaused         = false;
let pausedElapsed    = 0;

function goToSlide(index) {
  bioSlides.forEach(s => s.classList.remove('active'));
  bioImgs.forEach(i   => i.classList.remove('active'));
  bioSlides[index].classList.add('active');
  bioImgs[index].classList.add('active');
}

function animateProgress(timestamp) {
  if (!startTime) startTime = timestamp - pausedElapsed;
  const elapsed  = timestamp - startTime;
  const total    = SLIDE_DURATION * TOTAL_SLIDES;
  const progress = Math.min(elapsed / total, 1);

  bioFill.style.width = (progress * 100) + '%';

  // Cambio de slide
  const slide = Math.min(Math.floor(elapsed / SLIDE_DURATION), TOTAL_SLIDES - 1);
  if (slide !== currentSlide) {
    currentSlide = slide;
    goToSlide(currentSlide);
  }

  if (elapsed < total) {
    rafId = requestAnimationFrame(animateProgress);
  } else {
    // Reiniciar
    currentSlide  = 0;
    startTime     = null;
    pausedElapsed = 0;
    goToSlide(0);
    rafId = requestAnimationFrame(animateProgress);
  }
}

// Clic para pausar / reanudar
const bioSlider = document.querySelector('.bio-slider');
if (bioSlider) {
  bioSlider.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
      cancelAnimationFrame(rafId);
      // Guardar cuánto tiempo llevamos para reanudar desde ahí
      pausedElapsed = performance.now() - startTime;
    } else {
      startTime = null;
      rafId = requestAnimationFrame(animateProgress);
    }
  });
}

if (bioFill) {
  goToSlide(0);
  rafId = requestAnimationFrame(animateProgress);
}

/* ── Galería de imágenes — cambio automático cada 2s ── */
const galeriaSlides = document.querySelectorAll('.galeria-slide');
if (galeriaSlides.length) {
  let galeriaIndex = 0;
  setInterval(() => {
    galeriaSlides[galeriaIndex].classList.remove('active');
    galeriaIndex = (galeriaIndex + 1) % galeriaSlides.length;
    galeriaSlides[galeriaIndex].classList.add('active');
  }, 2000);
}

/* ── Subtle parallax on hero name ── */
const heroName = document.querySelector('.hero-name');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y < window.innerHeight) {
    heroName.style.transform = `translateY(${y * 0.18}px)`;
    heroName.style.opacity   = 1 - (y / (window.innerHeight * 0.7));
  }
}, { passive: true });
