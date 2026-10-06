/* ============================================
   Josglovic Travel Agency — Main JavaScript
   ============================================ */

/* ---------- Header scroll effect ---------- */
(function () {
  var header = document.querySelector('.header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- Mobile navigation toggle ---------- */
(function () {
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.querySelector('.nav__menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    menu.classList.toggle('open');
    toggle.classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });

  // Close menu when a regular link is clicked
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!link.parentElement.classList.contains('nav__item--has-submenu')) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.classList.remove('nav-open');
      }
    });
  });

  // Submenu toggle on mobile
  var submenuItems = document.querySelectorAll('.nav__item--has-submenu > .nav__link');
  submenuItems.forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.parentElement.classList.toggle('submenu-open');
      }
    });
  });
})();

/* ---------- Hero slider ---------- */
(function () {
  var slides = document.querySelectorAll('.hero__slide');
  var dots = document.querySelectorAll('.hero__dot');
  if (slides.length === 0) return;

  var current = 0;
  var timer = null;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');

    // Restart ken-burns animation on the active slide
    var bg = slides[current].querySelector('.hero__slide-bg');
    if (bg) {
      bg.style.animation = 'none';
      void bg.offsetWidth;
      bg.style.animation = '';
    }
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    timer = setInterval(next, 6000);
  }

  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goTo(i);
      startAuto();
    });
  });

  var leftArrow = document.querySelector('.hero__arrow--left');
  var rightArrow = document.querySelector('.hero__arrow--right');
  if (leftArrow) leftArrow.addEventListener('click', function () { prev(); startAuto(); });
  if (rightArrow) rightArrow.addEventListener('click', function () { next(); startAuto(); });

  // Pause on hover
  var hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
  }

  startAuto();
})();

/* ---------- Services subnav active state & smooth scroll ---------- */
(function () {
  var subnavLinks = document.querySelectorAll('.services-subnav__link');
  if (subnavLinks.length === 0) return;

  var sections = [];
  subnavLinks.forEach(function (link) {
    var targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      var target = document.querySelector(targetId);
      if (target) sections.push({ link: link, el: target });
    }
  });

  function updateActive() {
    var scrollPos = window.scrollY + 140;
    var activeIdx = 0;
    sections.forEach(function (s, i) {
      if (s.el.offsetTop <= scrollPos) activeIdx = i;
    });
    subnavLinks.forEach(function (l) { l.classList.remove('active'); });
    if (sections[activeIdx]) sections[activeIdx].link.classList.add('active');
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // Smooth scroll with header offset
  subnavLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          var offset = target.getBoundingClientRect().top + window.scrollY - 130;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }
    });
  });
})();

/* ---------- Gallery lightbox ---------- */
(function () {
  var items = document.querySelectorAll('.gallery-item');
  var lightbox = document.querySelector('.lightbox');
  if (items.length === 0 || !lightbox) return;

  var lightboxImg = lightbox.querySelector('.lightbox__img');
  var lightboxCaption = lightbox.querySelector('.lightbox__caption');
  var closeBtn = lightbox.querySelector('.lightbox__close');

  var currentIdx = 0;
  var data = [];
  items.forEach(function (item, i) {
    var img = item.querySelector('img');
    var caption = item.querySelector('.gallery-item__caption');
    data.push({
      src: img ? img.getAttribute('src') : '',
      caption: caption ? caption.textContent : ''
    });
    item.addEventListener('click', function () {
      currentIdx = i;
      showImage();
      lightbox.classList.add('open');
    });
  });

  function showImage() {
    if (lightboxImg) lightboxImg.src = data[currentIdx].src;
    if (lightboxCaption) lightboxCaption.textContent = data[currentIdx].caption;
  }

  function close() { lightbox.classList.remove('open'); }

  if (closeBtn) closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') { currentIdx = (currentIdx + 1) % data.length; showImage(); }
    if (e.key === 'ArrowLeft') { currentIdx = (currentIdx - 1 + data.length) % data.length; showImage(); }
  });
})();

/* ---------- Contact / Booking form handler ---------- */
/* Uses FormSubmit.co to send form data directly to booking@josglovictravels.online */
(function () {
  var forms = document.querySelectorAll('[data-form]');
  if (forms.length === 0) return;

  var EMAIL = 'booking@josglovictravels.online';

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var msg = form.querySelector('.form-message');
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      var formType = form.getAttribute('data-form-type') || 'contact';
      var subject = formType === 'booking'
        ? 'New Booking Request from Website'
        : 'New Contact Form Submission from Website';

      var formData = new FormData(form);
      formData.append('_subject', subject);
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');

      fetch('https://formsubmit.co/ajax/' + EMAIL, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      })
        .then(function (res) { return res.json(); })
        .then(function (result) {
          if (msg) {
            msg.className = 'form-message success';
            msg.textContent = 'Thank you! Your message has been sent. We will contact you within 24 hours.';
            msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          form.reset();
          setTimeout(function () { if (msg) msg.className = 'form-message'; }, 6000);
        })
        .catch(function () {
          if (msg) {
            msg.className = 'form-message error';
            msg.textContent = 'Sorry, something went wrong. Please try again or chat with us on WhatsApp.';
            msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
    });
  });
})();

/* ---------- Active nav link based on current page ---------- */
(function () {
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var links = document.querySelectorAll('.nav__menu > .nav__item > .nav__link');
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
  });
})();

/* ---------- Counter animation for stats ---------- */
(function () {
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length === 0) return;

  var animated = false;

  function animateCounters() {
    if (animated) return;
    var trigger = counters[0].getBoundingClientRect();
    if (trigger.top > window.innerHeight) return;

    animated = true;
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var current = 0;
      var step = Math.ceil(target / 40);
      var interval = setInterval(function () {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current + suffix;
      }, 30);
    });
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters();
})();
