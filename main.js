// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Mark active nav link based on current page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links > li > a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Dropdown / megamenu open-close
  const isDesktop = () => window.matchMedia('(min-width: 981px)').matches;

  document.querySelectorAll('.nav-links > li.has-dropdown').forEach(li => {
    const trigger = li.querySelector(':scope > a, :scope > button');
    if (!trigger) return;

    // Desktop: open on hover
    li.addEventListener('mouseenter', () => { if (isDesktop()) li.classList.add('open'); });
    li.addEventListener('mouseleave', () => { if (isDesktop()) li.classList.remove('open'); });

    // All: toggle on click (for mobile + keyboard)
    trigger.addEventListener('click', e => {
      if (trigger.tagName === 'A' && trigger.getAttribute('href') && trigger.getAttribute('href') !== '#' && isDesktop()) {
        return; // allow link navigation on desktop if href is real
      }
      e.preventDefault();
      const wasOpen = li.classList.contains('open');
      document.querySelectorAll('.nav-links > li.open').forEach(x => x.classList.remove('open'));
      if (!wasOpen) li.classList.add('open');
    });
  });

  // Click outside to close
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-links')) {
      document.querySelectorAll('.nav-links > li.open').forEach(x => x.classList.remove('open'));
    }
    if (toggle && links && !e.target.closest('.site-header')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Contact form fallback for the static site.
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const location = data.get('location');
      const recipients = {
        west: 'west@springspickleball.com',
        east: 'east@springspickleball.com',
        either: 'west@springspickleball.com,east@springspickleball.com',
      };
      const locationLabels = {
        west: 'West (Vondelpark)',
        east: 'East (New Center Point)',
        either: 'Either / Not Sure',
      };
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();
      const subject = encodeURIComponent(`Website message from ${name || 'Springs Pickleball visitor'}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nLocation: ${locationLabels[location] || locationLabels.either}\n\n${message}`);
      window.location.href = `mailto:${recipients[location] || recipients.either}?subject=${subject}&body=${body}`;
    });
  }

  // PostHog: named events for the booking funnel
  function detectSource(el) {
    if (el.closest('.mobile-book-bar')) return 'mobile_bar';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('.promo-banner')) return 'promo_banner';
    if (el.closest('.loc-card')) return 'location_card';
    if (el.closest('.megamenu') || el.closest('.submenu')) return 'nav';
    if (el.closest('.cta-band')) return 'cta_band';
    if (el.closest('.site-footer')) return 'footer';
    if (el.closest('.card')) return 'card';
    return 'other';
  }
  function track(name, props) {
    if (!window.posthog || !window.posthog.capture) return;
    window.posthog.capture(name, props);
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[posthog]', name, props);
    }
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || !a.href) return;
    const href = a.href;
    const source = detectSource(a);

    // Court booking clicks
    if (href.includes('publicbookings/8778')) {
      track('book_court_clicked', { location: 'west', kind: 'guest', source });
    } else if (href.includes('publicbookings/15687')) {
      track('book_court_clicked', { location: 'east', kind: 'guest', source });
    } else if (href.includes('EmbedCode/8778/24144')) {
      track('book_court_clicked', { location: 'west', kind: 'member_schedule', source });
    } else if (href.includes('EmbedCode/15687/45222')) {
      track('book_court_clicked', { location: 'east', kind: 'member_schedule', source });
    }

    // Memberships page navigation (nav tab, hero CTA, footer, etc.)
    if (/\/memberships\.html(?:[?#]|$)/.test(href) || href.endsWith('memberships.html')) {
      track('memberships_clicked', { source, page: window.location.pathname });
    }

    // Membership signup clicks
    if (href.includes('membershipId=253681')) {
      track('membership_signup_clicked', { location: 'west', promo: 'summer_special', source });
    } else if (href.includes('membershipId=253683')) {
      track('membership_signup_clicked', { location: 'east', promo: 'summer_special', source });
    } else if (href.includes('Memberships/Public/8778')) {
      track('membership_signup_clicked', { location: 'west', source });
    } else if (href.includes('Memberships/Public/15687')) {
      track('membership_signup_clicked', { location: 'east', source });
    }
  });

  // Scroll reveal
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }
});
