/* ============================================
   PORTFOLIO — MAIN JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // NAVIGATION
  // ==========================================
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  });

  // Mobile menu toggle
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ==========================================
  // SCROLL REVEAL (Intersection Observer)
  // ==========================================
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the reveal animation
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // HERO ANIMATION (on load)
  // ==========================================
  function animateHero() {
    const heroLines = document.querySelectorAll('.hero-line');
    const heroSub = document.querySelector('.hero-sub');
    const heroRoles = document.querySelectorAll('.hero-role');

    // Reveal lines one by one
    heroLines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('revealed');
      }, 200 + i * 200);
    });

    // Reveal subtitle block
    setTimeout(() => {
      if (heroSub) heroSub.classList.add('revealed');
    }, 800);

    // Reveal roles one by one
    heroRoles.forEach((role, i) => {
      setTimeout(() => {
        role.classList.add('revealed');
      }, 1000 + i * 150);
    });
  }

  // Run hero animation
  setTimeout(animateHero, 300);

  // ==========================================
  // SHOWREEL PARALLAX SCALE
  // ==========================================
  const showreelVideo = document.querySelector('.showreel-video');
  if (showreelVideo) {
    const showreelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.3 });
    showreelObserver.observe(showreelVideo);
  }

  // ==========================================
  // SHOWREEL PLAY BUTTON
  // ==========================================
  const showreelPlay = document.getElementById('showreelPlay');
  if (showreelPlay) {
    showreelPlay.addEventListener('click', () => {
      // Placeholder — replace with actual video play logic
      showreelPlay.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="6" y="5" width="4" height="14" fill="currentColor"/><rect x="14" y="5" width="4" height="14" fill="currentColor"/></svg>';
    });
  }

  // ==========================================
  // STATEMENT SECTION REVEAL
  // ==========================================
  const statementLines = document.querySelectorAll('.statement-line');
  const statementObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, i * 300);
        statementObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statementLines.forEach(line => statementObserver.observe(line));

  // ==========================================
  // SMOOTH ANCHOR SCROLL
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================
  // DISCIPLINE CARD HOVER EFFECT
  // ==========================================
  document.querySelectorAll('.discipline-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--accent)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '';
    });
  });

  // ==========================================
  // VIDEO FILTER + VIEW MORE + INTERLEAVE
  // ==========================================
  const CARDS_PER_PAGE = 12;
  const videoGrid = document.getElementById('videoGrid');
  const filterButtons = document.querySelectorAll('.video-filter');
  const allVideoCards = Array.from(document.querySelectorAll('.asset-card[data-category]'));
  const viewMoreWrap = document.querySelector('.video-view-more-wrap');
  const viewMoreBtn = document.getElementById('viewMoreBtn');
  let currentFilter = 'all';
  let showingAll = false;

  // Store original order for restoring
  const originalOrder = [...allVideoCards];

  // Get interleaving pattern based on viewport width
  // Pattern must match CSS grid-column spans so brands fill complete rows
  function getInterleavePattern() {
    const w = window.innerWidth;
    if (w <= 900) return { reelsPerGroup: 2, brandsPerGroup: 1 }; // Mobile: 2 cols, brand span 2 = full row
    if (w <= 1200) return { reelsPerGroup: 3, brandsPerGroup: 1 }; // Tablet: 3 cols, brand span 3 = full row
    if (w >= 1800) return { reelsPerGroup: 6, brandsPerGroup: 3 }; // Wide: 6 cols, brand span 2, 3 brands = full row
    return { reelsPerGroup: 4, brandsPerGroup: 2 }; // PC: 4 cols, brand span 2, 2 brands = full row
  }

  // Build interleaved order: reels first in groups, then brand cards mixed in
  function buildInterleavedOrder() {
    const reels = allVideoCards.filter(c => c.getAttribute('data-category') === 'reels');
    const brands = allVideoCards.filter(c => c.getAttribute('data-category') === 'brand');
    const { reelsPerGroup, brandsPerGroup } = getInterleavePattern();
    const result = [];
    let rIdx = 0;
    let bIdx = 0;

    while (rIdx < reels.length || bIdx < brands.length) {
      // Add a group of reels
      for (let i = 0; i < reelsPerGroup && rIdx < reels.length; i++) {
        result.push(reels[rIdx++]);
      }
      // Add a group of brands
      for (let i = 0; i < brandsPerGroup && bIdx < brands.length; i++) {
        result.push(brands[bIdx++]);
      }
    }
    return result;
  }

  // Reorder DOM to match given array
  function reorderDOM(cards) {
    cards.forEach(card => videoGrid.appendChild(card));
  }

  function applyFilter(filter, showAll) {
    currentFilter = filter;
    showingAll = showAll;

    if (filter === 'all') {
      // Interleave and reorder DOM
      const interleaved = buildInterleavedOrder();
      reorderDOM(interleaved);

      // Show/hide based on pagination
      interleaved.forEach((card, i) => {
        if (showAll || i < CARDS_PER_PAGE) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });

      if (viewMoreWrap) {
        viewMoreWrap.style.display = interleaved.length > CARDS_PER_PAGE && !showAll ? '' : 'none';
      }
    } else {
      // Restore original DOM order first
      reorderDOM(originalOrder);

      // Filter by category
      let matchCount = 0;
      allVideoCards.forEach(card => {
        const matches = card.getAttribute('data-category') === filter;
        if (matches) {
          matchCount++;
          if (showAll || matchCount <= CARDS_PER_PAGE) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        } else {
          card.style.display = 'none';
        }
      });

      if (viewMoreWrap) {
        viewMoreWrap.style.display = matchCount > CARDS_PER_PAGE && !showAll ? '' : 'none';
      }
    }
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.getAttribute('data-filter'), false);
    });
  });

  // Initial state: show first 12 with interleaving
  applyFilter('all', false);
  // Re-interleave on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentFilter === 'all') applyFilter('all', showingAll);
    }, 250);
  });

  // View More button
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', () => {
      applyFilter(currentFilter, true);
    });
  }

  // ==========================================
  // ONLY ONE VIDEO PLAY AT A TIME
  // ==========================================
  let currentPlayingCard = null;

  document.querySelectorAll('.asset-card__media').forEach(wrapper => {
    const liteYT = wrapper.querySelector('lite-youtube');
    if (!liteYT) return;

    wrapper.addEventListener('click', (e) => {
      if (currentPlayingCard && currentPlayingCard !== wrapper) {
        const prevYT = currentPlayingCard.querySelector('lite-youtube');
        if (prevYT && prevYT.querySelector('iframe')) {
          prevYT.querySelector('iframe').contentWindow.postMessage('{"command":"pause"}', '*');
        }
      }
      currentPlayingCard = wrapper;
    });
  });

  // ==========================================
  // PROJECT CARD PARALLAX (subtle)
  // ==========================================
  const projectCards = document.querySelectorAll('.project-card');
  window.addEventListener('scroll', () => {
    projectCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;
      if (visible) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const offset = (progress - 0.5) * 20;
        const img = card.querySelector('.project-img');
        if (img) {
          img.style.transform = `translateY(${offset}px) scale(1.02)`;
        }
      }
    });
  });

  // ==========================================
  // CURSOR HIDE ON LEAVE
  // ==========================================
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // ==========================================
  // CONTACT FORM — SEND EMAIL
  // ==========================================
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = document.getElementById('contactForm');
      const name = form.querySelector('input[name="name"]').value;
      const email = form.querySelector('input[name="email"]').value;
      const company = form.querySelector('input[name="company"]').value;
      const message = form.querySelector('textarea[name="message"]').value;

      const subject = encodeURIComponent(`Project Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\nProject Details:\n${message}`);

      window.location.href = `mailto:Motionartelier@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  // ==========================================
  // LOADING STATE
  // ==========================================
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

});
