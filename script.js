// ============================================================
// RASPBERRY PI – SCRIPT.JS
// Offline-fähig · Dark Mode · Sanfte Interaktionen
// ============================================================

(function () {
  'use strict';

  // --------------------------------------------------
  // 1. DARK MODE
  // Speichert Präferenz in localStorage, respektiert
  // das OS-Systemthema als Standard
  // --------------------------------------------------
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function getStoredTheme() {
    return localStorage.getItem('pi_theme');
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('pi_theme', theme);
  }

  // Beim Start: gespeichertes Theme oder Systemtheme
  const initialTheme = getStoredTheme() || getSystemTheme();
  applyTheme(initialTheme);

  // Auf OS-Thema-Änderungen reagieren (falls kein manuell gesetztes Theme)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // --------------------------------------------------
  // 2. MOBILES MENÜ
  // --------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  function openMenu() {
    mainNav.classList.add('is-open');
    menuToggle.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Menü schließen');
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleOutsideClick, true);
  }

  function closeMenu() {
    mainNav.classList.remove('is-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Menü öffnen');
    document.removeEventListener('keydown', handleEscape);
    document.removeEventListener('click', handleOutsideClick, true);
  }

  function handleEscape(e) {
    if (e.key === 'Escape') closeMenu();
  }

  function handleOutsideClick(e) {
    if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });

    // Schließen nach Nav-Klick (Mobile)
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // --------------------------------------------------
  // 3. AKTIVEN NAV-LINK MARKIEREN
  // Basierend auf der aktuellen Seiten-URL
  // --------------------------------------------------
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --------------------------------------------------
  // 4. TOAST-NACHRICHTEN
  // --------------------------------------------------
  const toast = document.getElementById('toast-msg');
  let toastTimeout;

  function showToast(message, duration = 3200) {
    if (!toast) return;
    clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // Einmal-Willkommen pro Session
  if (!sessionStorage.getItem('pi_welcomed')) {
    setTimeout(() => {
      showToast('🍓 Willkommen – schön, dass du da bist!', 3500);
      sessionStorage.setItem('pi_welcomed', '1');
    }, 900);
  }

  // --------------------------------------------------
  // 5. SCROLL REVEAL (Intersection Observer)
  // --------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -24px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback für ältere Browser
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // --------------------------------------------------
  // 6. SANFTES SCROLLEN für Anker-Links
  // --------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '64'
        );
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --------------------------------------------------
  // 7. PRODUKT-KARTEN INTERAKTION
  // --------------------------------------------------
  document.querySelectorAll('.product-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const name = item.querySelector('h3')?.textContent || 'Produkt';
      showToast(`✨ "${name}" – mehr Infos im Shop.`, 2500);
    });
  });

  // --------------------------------------------------
  // 8. STORY-KARTEN INTERAKTION
  // --------------------------------------------------
  document.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const title = card.querySelector('h3')?.textContent || 'Geschichte';
      showToast(`📖 "${title}" – bald als vollständiger Artikel.`, 2800);
    });
  });

  // --------------------------------------------------
  // 9. MAGAZIN-KARTEN INTERAKTION
  // --------------------------------------------------
  document.querySelectorAll('.mag-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const title = card.querySelector('h3')?.textContent || 'Artikel';
      showToast(`📰 "${title}" – öffne bald das Magazin.`, 2800);
    });
  });

  // --------------------------------------------------
  // 10. OFFLINE-STATUS-ERKENNUNG
  // --------------------------------------------------
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      showToast('📡 Du bist offline – die Seite läuft trotzdem!', 4000);
    }
  }

  window.addEventListener('offline', updateOnlineStatus);
  window.addEventListener('online', () => {
    showToast('✅ Wieder online!', 2500);
  });

  // --------------------------------------------------
  // 11. HEADER-SCHATTEN BEI SCROLL
  // --------------------------------------------------
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      siteHeader.style.boxShadow = y > 10 ? 'var(--shadow-sm)' : '';
      lastScroll = y;
    }, { passive: true });
  }

  // --------------------------------------------------
  // 12. FLOATING PI ANIMATION (nach Ladevorgang)
  // --------------------------------------------------
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

})();
