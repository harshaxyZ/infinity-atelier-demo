/* ==========================================================================
   INFINITY ATELIER — NATIVE PERFORMANCE INTERACTIVE CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive modules
  initHeaderScroll();
  initMobileDrawer();
  initScrollAnimations();
  initStatsCountUp();
  initCarouselTracks();
  initBeforeAfterSlider();
  initTestimonialCarousel();
  initBlurUpImages();
  initContactForm();
  initConsultationRedirects();
  initTimelineScroll();
});

/* --------------------------------------------------------------------------
   1. Header Scroll Shrink
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const drawerLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggle || !drawer || !overlay || !closeBtn) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', openDrawer, { passive: true });
  closeBtn.addEventListener('click', closeDrawer, { passive: true });
  overlay.addEventListener('click', closeDrawer, { passive: true });

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer, { passive: true });
  });
}

/* --------------------------------------------------------------------------
   3. Intersection Observer Scroll Animations (Zero Scroll Lag)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.will-animate');
  if (animatedElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px', // Trigger slightly before entering screen
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        // Stop observing once animated to save GPU/CPU cycles
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   4. Stats Count-Up Animation
   -------------------------------------------------------------------------- */
function initStatsCountUp() {
  const statsSection = document.querySelector('.stats-band');
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statsSection || statNumbers.length === 0) return;

  const duration = 2000; // 2 seconds animation

  const startCountUp = () => {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      const prefix = stat.getAttribute('data-prefix') || '';
      const suffix = stat.getAttribute('data-suffix') || '';
      let startTime = null;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing out quadratic function
        const easedProgress = progress * (2 - progress);
        const currentVal = Math.floor(easedProgress * target);
        
        stat.textContent = `${prefix}${currentVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          stat.textContent = `${prefix}${target}${suffix}`;
        }
      };

      requestAnimationFrame(animate);
    });
  };

  // Trigger count up once stats section enters viewport
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCountUp();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

  observer.observe(statsSection);
}

/* --------------------------------------------------------------------------
   5. Horizontal Scrollable Library Tracks & Pagination Dots
   -------------------------------------------------------------------------- */
function initCarouselTracks() {
  const carousels = document.querySelectorAll('.carousel-container');
  if (carousels.length === 0) return;

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.prev-btn');
    const nextBtn = carousel.querySelector('.next-btn');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    
    if (!track) return;
    
    const cards = track.querySelectorAll('.carousel-card');
    if (cards.length === 0) return;

    // Create pagination dots
    dotsContainer.innerHTML = '';
    cards.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        scrollToCard(idx);
      }, { passive: true });
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    const updateActiveDot = () => {
      const cardWidth = cards[0].offsetWidth + 32; // card width + track gap (2rem = 32px)
      const scrollPos = track.scrollLeft;
      const activeIdx = Math.round(scrollPos / cardWidth);
      
      dots.forEach((dot, idx) => {
        if (idx === activeIdx) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    const scrollToCard = (index) => {
      const cardWidth = cards[0].offsetWidth + 32;
      track.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    };

    // Navigation buttons scroll track
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 32;
        track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      }, { passive: true });

      nextBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + 32;
        track.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }, { passive: true });
    }

    // Scroll listener with passive flag for high FCP and scroll speeds
    track.addEventListener('scroll', updateActiveDot, { passive: true });
  });
}

/* --------------------------------------------------------------------------
   6. Before/After Comparative Drag Slider
   -------------------------------------------------------------------------- */
function initBeforeAfterSlider() {
  const slider = document.querySelector('.slider-container');
  if (!slider) return;

  const beforeImg = slider.querySelector('.slider-before');
  const afterImg = slider.querySelector('.slider-after');
  const handle = slider.querySelector('.slider-handle');
  const loader = slider.querySelector('.slider-loading');
  if (!beforeImg || !afterImg || !handle) return;

  // Default position: 50% (center)
  afterImg.style.clipPath = `polygon(0 0, 50% 0, 50% 100%, 0 100%)`;
  handle.style.left = `50%`;

  let imagesLoaded = 0;
  let hasError = false;

  const onImageLoad = () => {
    if (hasError) return;
    imagesLoaded++;
    if (imagesLoaded === 2) {
      if (loader) {
        loader.classList.add('loaded');
      }
    }
  };

  const onImageError = () => {
    hasError = true;
    if (loader) {
      const loadingText = loader.querySelector('.slider-loading-text');
      if (loadingText) {
        loadingText.textContent = 'Image loading...';
      }
    }
  };

  // Check before image
  if (beforeImg.complete) {
    imagesLoaded++;
  } else {
    beforeImg.addEventListener('load', onImageLoad);
    beforeImg.addEventListener('error', onImageError);
  }

  // Check after image
  if (afterImg.complete) {
    imagesLoaded++;
  } else {
    afterImg.addEventListener('load', onImageLoad);
    afterImg.addEventListener('error', onImageError);
  }

  // If both already cached / loaded
  if (imagesLoaded === 2 && !hasError) {
    if (loader) {
      loader.classList.add('loaded');
    }
  }

  let isDragging = false;

  const setSliderPosition = (xPos) => {
    const rect = slider.getBoundingClientRect();
    let x = xPos - rect.left;
    const width = rect.width;
    
    // Contain boundary
    if (x < 0) x = 0;
    if (x > width) x = width;

    const percentage = (x / width) * 100;
    afterImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
    handle.style.left = `${percentage}%`;
  };

  // Mouse drag events
  const onMouseDown = () => { isDragging = true; };
  const onMouseUp = () => { isDragging = false; };
  const onMouseMove = (e) => {
    if (!isDragging) return;
    setSliderPosition(e.clientX);
  };

  // Touch drag events
  const onTouchStart = () => { isDragging = true; };
  const onTouchEnd = () => { isDragging = false; };
  const onTouchMove = (e) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      setSliderPosition(e.touches[0].clientX);
    }
  };

  // Attach handlers
  handle.addEventListener('mousedown', onMouseDown, { passive: true });
  window.addEventListener('mouseup', onMouseUp, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  handle.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // Fallback direct click to reposition on slider track
  slider.addEventListener('click', (e) => {
    if (e.target !== handle && !handle.contains(e.target)) {
      setSliderPosition(e.clientX);
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   7. Testimonials Carousel Autoplay
   -------------------------------------------------------------------------- */
function initTestimonialCarousel() {
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.testimonial-track');
  const cards = carousel.querySelectorAll('.testimonial-card');
  const dotsContainer = carousel.querySelector('.testimonial-nav');
  if (!track || cards.length === 0 || !dotsContainer) return;

  let activeIdx = 0;
  let autoplayTimer = null;

  // Create pagination dots
  dotsContainer.innerHTML = '';
  cards.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      setActiveSlide(idx);
      resetAutoplay();
    }, { passive: true });
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  const setActiveSlide = (index) => {
    activeIdx = index;
    track.style.transform = `translateX(-${activeIdx * 100}%)`;
    
    dots.forEach((dot, idx) => {
      if (idx === activeIdx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  const nextSlide = () => {
    let nextIdx = activeIdx + 1;
    if (nextIdx >= cards.length) nextIdx = 0;
    setActiveSlide(nextIdx);
  };

  const startAutoplay = () => {
    autoplayTimer = setInterval(nextSlide, 5000); // Auto slide every 5 seconds
  };

  const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    startAutoplay();
  };

  startAutoplay();
}

/* --------------------------------------------------------------------------
   8. Image Blur-Up Loading Helper
   -------------------------------------------------------------------------- */
function initBlurUpImages() {
  const blurContainers = document.querySelectorAll('.blur-load');
  if (blurContainers.length === 0) return;

  blurContainers.forEach(container => {
    const img = container.querySelector('img');
    if (!img) return;

    function loaded() {
      container.classList.add('loaded');
    }

    if (img.complete) {
      loaded();
    } else {
      img.addEventListener('load', loaded, { once: true });
    }
  });
}

/* --------------------------------------------------------------------------
   9. Contact Form AJAX Submission Mockup
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Simple verification
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const phone = form.querySelector('#phone').value.trim();

    if (!name || !email || !phone) {
      alert('Please fill out all required fields.');
      return;
    }

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate server request
    setTimeout(() => {
      submitBtn.textContent = 'Message Sent Successfully!';
      submitBtn.style.backgroundColor = '#2D4A3E'; // forest green
      form.reset();
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
        submitBtn.disabled = false;
      }, 3000);
    }, 1500);
  });
}

/* --------------------------------------------------------------------------
   10. WhatsApp & Consultation Click Handling
   -------------------------------------------------------------------------- */
function initConsultationRedirects() {
  const phone = '919830098300'; // Studio contact number
  const message = 'Hi Infinity Atelier, I would like to book a free consultation for my home interiors.';
  const encodedText = encodeURIComponent(message);
  
  // WhatsApp pulse float button click
  const waBtn = document.querySelector('.whatsapp-float');
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    }, { passive: true });
  }

  // Consultation book buttons
  const consultBtns = document.querySelectorAll('.book-consultation-trigger');
  consultBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Smooth scroll to the contact form section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, { passive: true });
  });
}

/* --------------------------------------------------------------------------
   11. Timeline Scroll Progress Activation (Smooth Step Highlight)
   -------------------------------------------------------------------------- */
function initTimelineScroll() {
  const steps = document.querySelectorAll('.timeline-step');
  const progressBar = document.getElementById('timeline-progress-bar');
  const timeline = document.querySelector('.timeline');
  if (steps.length === 0 || !progressBar || !timeline) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -150px 0px',
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stepIdx = Array.from(steps).indexOf(entry.target);
        
        // Activate current and preceding steps
        steps.forEach((step, idx) => {
          if (idx <= stepIdx) {
            step.classList.add('active');
          } else {
            step.classList.remove('active');
          }
        });

        // Sync connection bar size
        const percent = (stepIdx / (steps.length - 1)) * 100;
        if (window.innerWidth > 640) {
          progressBar.style.width = `${percent}%`;
          progressBar.style.height = '2px';
        } else {
          progressBar.style.height = `${percent}%`;
          progressBar.style.width = '2px';
        }
      }
    });
  }, observerOptions);

  steps.forEach(step => observer.observe(step));
}
