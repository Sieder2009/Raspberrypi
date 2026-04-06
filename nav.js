/**
 * ============================================================
 * NAV.JS – Hauptskript für die Raspberry Pi Website
 * ============================================================
 *
 * Dieses Skript übernimmt folgende Aufgaben:
 *  1. Navigation aufbauen und in jede Seite einfügen
 *  2. Sprach-Buttons – gleiche Seite, andere Sprache
 *  3. Menü-Links bleiben in der aktuellen Sprache
 *  4. Dark Mode (☀️/🌙) mit Systemerkennung
 *  5. Hamburger-Menü für Mobile
 *  6. Scroll Reveal – Elemente mit .reveal erscheinen sanft
 *  7. Cookie-Banner beim ersten Besuch (nur auf index-*.html)
 *  8. Support-Formular – Nachricht senden mit Toast-Meldung
 *  9. Toast-Benachrichtigungen (kleine Hinweisbox unten rechts)
 * 10. Offline-Erkennung
 * 11. Favicon dynamisch setzen
 *
 * Wie es funktioniert:
 *  Jede HTML-Seite setzt VOR diesem Skript:
 *    <script>window.SITE_LANG = 'de';</script>
 *  Damit weiß nav.js welche Sprache aktiv ist.
 *
 * Dateinamensschema:
 *  index-de.html, shop-it.html, contact-en.html usw.
 *  Der Basis-Name (z.B. "shop") + Suffix ("-de") ergibt die Datei.
 * ============================================================
 */

(function () {
  'use strict';

  // ============================================================
  // 1. KONFIGURATION & ÜBERSETZUNGEN
  // ============================================================

  /**
   * Aktuelle Sprache – wird von jeder HTML-Seite gesetzt.
   * Fallback: Deutsch
   */
  const LANG = window.SITE_LANG || 'de';

  /**
   * Alle Navigations-Texte in den drei Sprachen.
   * Wenn eine neue Seite hinzukommt, hier den Eintrag ergänzen.
   */
  const NAV_LABELS = {
    de: {
      home:       'Home',
      geschichte: 'Geschichte',
      shop:       'Shop',
      hardware:   'Hardware',
      software:   'Software',
      support:    'Support',
      kontakt:    'Kontakt',
    },
    it: {
      home:       'Home',
      geschichte: 'Storia',
      shop:       'Shop',
      hardware:   'Hardware',
      software:   'Software',
      support:    'Supporto',
      kontakt:    'Contatto',
    },
    en: {
      home:       'Home',
      geschichte: 'History',
      shop:       'Shop',
      hardware:   'Hardware',
      software:   'Software',
      support:    'Support',
      kontakt:    'Contact',
    },
  };

  /**
   * Sprach-Suffix für Dateinamen.
   * shop + '-de' + '.html' = shop-de.html
   */
  const SUFFIX = { de: '-de', it: '-it', en: '-en' };

  /**
   * Alle Navigationsseiten als Array.
   * key = interne Bezeichnung, base = Dateiname ohne Suffix.
   */
  const NAV_LINKS = [
    { key: 'home',        base: 'index'      },
    { key: 'geschichte',  base: 'geschichte'  },
    { key: 'shop',        base: 'shop'        },
    { key: 'hardware',    base: 'hardware'    },
    { key: 'software',    base: 'software'    },
    { key: 'support',     base: 'support'     },
    { key: 'kontakt',     base: 'contact'     },
  ];

  /**
   * Cookie-Banner Texte pro Sprache.
   */
  const COOKIE_TEXT = {
    de: {
      msg:    '🍪 Diese Website verwendet keine Tracking-Cookies. Nur ein lokales Speichern deiner Einstellungen (Dark Mode, Sprache). Einverstanden?',
      yes:    'Einverstanden',
      no:     'Ablehnen',
    },
    it: {
      msg:    '🍪 Questo sito non usa cookie di tracciamento. Salviamo solo le tue preferenze (tema, lingua) in locale. Accetti?',
      yes:    'Accetto',
      no:     'Rifiuto',
    },
    en: {
      msg:    '🍪 This website uses no tracking cookies. We only save your preferences (dark mode, language) locally. Agree?',
      yes:    'Agree',
      no:     'Decline',
    },
  };

  /**
   * Support-Formular Texte pro Sprache.
   * Wird auf support-*.html verwendet.
   */
  const SUPPORT_TEXT = {
    de: {
      title:       'Problem melden',
      name:        'Dein Name',
      email:       'E-Mail-Adresse',
      device:      'Welches Modell?',
      devices:     ['Raspberry Pi 5', 'Raspberry Pi 4', 'Pi Zero 2 W', 'Pi 400 / 500', 'Anderes'],
      problem:     'Beschreibe dein Problem',
      placeholder: 'Was funktioniert nicht? Seit wann? Hast du schon etwas versucht?',
      send:        'Frage absenden',
      ok:          '✅ Nachricht gesendet – wir melden uns bald!',
      err:         '⚠️ Bitte Name, E-Mail und Problembeschreibung ausfüllen.',
    },
    it: {
      title:       'Segnala un problema',
      name:        'Il tuo nome',
      email:       'Indirizzo email',
      device:      'Quale modello?',
      devices:     ['Raspberry Pi 5', 'Raspberry Pi 4', 'Pi Zero 2 W', 'Pi 400 / 500', 'Altro'],
      problem:     'Descrivi il problema',
      placeholder: 'Cosa non funziona? Da quando? Hai già provato qualcosa?',
      send:        'Invia domanda',
      ok:          '✅ Messaggio inviato – ti risponderemo presto!',
      err:         '⚠️ Compila nome, email e descrizione del problema.',
    },
    en: {
      title:       'Report a problem',
      name:        'Your name',
      email:       'Email address',
      device:      'Which model?',
      devices:     ['Raspberry Pi 5', 'Raspberry Pi 4', 'Pi Zero 2 W', 'Pi 400 / 500', 'Other'],
      problem:     'Describe your problem',
      placeholder: 'What is not working? Since when? Have you already tried anything?',
      send:        'Send question',
      ok:          '✅ Message sent – we will get back to you soon!',
      err:         '⚠️ Please fill in name, email and problem description.',
    },
  };

  /**
   * Toast-Texte für Offline/Online-Erkennung.
   */
  const OFFLINE_TEXT = {
    de: { off: '📡 Offline – die Seite läuft trotzdem!', on: '✅ Wieder online!' },
    it: { off: '📡 Offline – il sito funziona lo stesso!', on: '✅ Di nuovo online!' },
    en: { off: '📡 Offline – the site still works!', on: '✅ Back online!' },
  };

  // ============================================================
  // 2. SEITE ERKENNEN – Welcher Basis-Name und Suffix?
  // ============================================================

  /**
   * Aus der aktuellen URL den Dateinamen lesen.
   * Beispiel: "/var/www/html/shop-de.html" → "shop-de.html"
   */
  const rawFile = window.location.pathname.split('/').pop() || 'index-de.html';

  /**
   * Den Sprachsuffix entfernen, um den Basis-Namen zu erhalten.
   * "shop-de.html" → "shop"
   * "contact-it.html" → "contact"
   */
  const baseName = rawFile.replace(/-de\.html$|-it\.html$|-en\.html$|\.html$/, '');

  /**
   * Welcher Navigationsschlüssel gehört zu dieser Seite?
   * Wird gebraucht um den aktiven Menüpunkt rot zu markieren.
   */
  const PAGE_KEY_MAP = {
    'index':      'home',
    'geschichte': 'geschichte',
    'shop':       'shop',
    'hardware':   'hardware',
    'software':   'software',
    'support':    'support',
    'contact':    'kontakt',
  };
  const currentKey = PAGE_KEY_MAP[baseName] || 'home';

  // ============================================================
  // 3. NAVIGATION AUFBAUEN
  // ============================================================

  /**
   * Baut die drei Sprach-Flag-Buttons.
   * Jeder Button verlinkt zur gleichen Seite (gleicher Basis-Name)
   * aber mit einem anderen Sprachsuffix.
   *
   * Beispiel: auf shop-de.html → Links zu shop-de.html, shop-it.html, shop-en.html
   */
  function buildLangButtons() {
    const langs = [
      { code: 'de', label: 'DE', flag: '🇩🇪' },
      { code: 'it', label: 'IT', flag: '🇮🇹' },
      { code: 'en', label: 'EN', flag: '🇬🇧' },
    ];

    return langs.map(({ code, label, flag }) => {
      const href   = baseName + SUFFIX[code] + '.html';
      const active = code === LANG;
      return `<a href="${href}"
                 class="lang-flag-btn${active ? ' lang-active' : ''}"
                 title="${label}"
                 aria-label="Sprache wechseln: ${label}">
                <span class="lang-flag-icon">${flag}</span>
                <span class="lang-code-label">${label}</span>
              </a>`;
    }).join('');
  }

  /**
   * Baut die komplette Navigationsleiste als HTML-String.
   * Alle Menü-Links zeigen in die aktuelle Sprache (via Suffix).
   * Der aktive Link bekommt die CSS-Klasse "active".
   */
  function buildNavHTML() {
    const labels = NAV_LABELS[LANG];
    const sfx    = SUFFIX[LANG];

    // Menü-Einträge generieren
    const navItems = NAV_LINKS.map(({ key, base }) => {
      const href   = base + sfx + '.html';
      const active = key === currentKey;
      return `<li>
                <a href="${href}" class="nav-link${active ? ' active' : ''}">
                  ${labels[key]}
                </a>
              </li>`;
    }).join('');

    return `
      <header class="site-header" id="siteHeader">
        <div class="container nav-container">

          <!-- Logo + Markenname -->
          <a href="index${sfx}.html" class="brand" aria-label="Raspberry Pi Startseite">
            <img src="pic/raspberrypi_logo.png" alt="Raspberry Pi Logo" class="brand-logo">
            <span class="brand-text">raspberry<span>pi</span></span>
          </a>

          <!-- Haupt-Navigation -->
          <nav class="main-nav" id="mainNav" aria-label="Hauptnavigation">
            <ul class="nav-list" role="list">${navItems}</ul>
          </nav>

          <!-- Rechte Seite: Sprache + Dark Mode + Hamburger -->
          <div class="header-actions">

            <!-- Sprach-Buttons: DE / IT / EN -->
            <!-- Klick wechselt zur gleichen Seite in anderer Sprache -->
            <div class="lang-flags" role="navigation" aria-label="Sprachauswahl">
              ${buildLangButtons()}
            </div>

            <!-- Dark Mode Toggle: ☀️ = Hell, 🌙 = Dunkel -->
            <button class="theme-toggle" id="themeToggle" aria-label="Dark Mode umschalten">
              <span class="theme-icon-sun" aria-hidden="true">☀️</span>
              <span class="theme-icon-moon" aria-hidden="true">🌙</span>
            </button>

            <!-- Hamburger-Menü (nur auf kleinen Bildschirmen sichtbar) -->
            <button class="mobile-menu-toggle" id="menuToggle"
                    aria-expanded="false" aria-controls="mainNav"
                    aria-label="Menü öffnen/schließen">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>

          </div>
        </div>
      </header>`;
  }

  // ============================================================
  // 4. NAVIGATION EINFÜGEN (inject)
  // ============================================================

  /**
   * Sucht den Platzhalter <div id="nav-placeholder"> in der HTML-Seite
   * und ersetzt ihn durch die fertig gebaute Navigation.
   */
  function injectNav() {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) return; // Sicherheitscheck: Platzhalter vorhanden?

    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildNavHTML();
    // Das erste Kind ist unser <header> – direkt einfügen
    placeholder.replaceWith(wrapper.firstElementChild);
  }

  // ============================================================
  // 5. EVENTS BINDEN (nach dem Einfügen der Navigation)
  // ============================================================

  /**
   * Alle Klick- und Tastatur-Events für Header-Elemente registrieren.
   * Muss NACH injectNav() aufgerufen werden, weil die Elemente
   * vorher nicht im DOM existieren.
   */
  function bindNavEvents() {

    // ── 5a. Dark Mode Button ─────────────────────────────────
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        // Aktuelles Theme lesen und wechseln
        const current = document.documentElement.getAttribute('data-theme');
        const next    = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    // ── 5b. Hamburger-Menü ───────────────────────────────────
    const menuBtn = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    /** Menü schließen – wird an mehreren Stellen gebraucht */
    function closeMenu() {
      mainNav?.classList.remove('is-open');
      menuBtn?.classList.remove('is-open');
      menuBtn?.setAttribute('aria-expanded', 'false');
    }

    if (menuBtn && mainNav) {
      menuBtn.addEventListener('click', () => {
        // Klick wechselt zwischen offen/geschlossen
        const isNowOpen = mainNav.classList.toggle('is-open');
        menuBtn.classList.toggle('is-open', isNowOpen);
        menuBtn.setAttribute('aria-expanded', String(isNowOpen));
      });

      // Klick auf einen Link schließt das Menü
      mainNav.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', closeMenu)
      );
    }

    // ── 5c. Escape-Taste schließt das Menü ──────────────────
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });

    // ── 5d. Schatten unter dem Header beim Scrollen ──────────
    const header = document.getElementById('siteHeader');
    if (header) {
      window.addEventListener('scroll', () => {
        // Schatten ab 8px Scroll-Position sichtbar
        header.style.boxShadow = window.scrollY > 8 ? 'var(--shadow-sm)' : '';
      }, { passive: true }); // passive: true = bessere Scroll-Performance
    }
  }

  // ============================================================
  // 6. DARK MODE
  // ============================================================

  /**
   * Setzt das Theme auf dem <html>-Element und speichert es.
   * CSS-Variablen reagieren automatisch auf data-theme="dark".
   *
   * @param {string} theme - 'light' oder 'dark'
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pi_theme', theme);
  }

  /**
   * Beim Laden: gespeichertes Theme lesen oder Systemeinstellung nutzen.
   * window.matchMedia prüft ob das Betriebssystem Dark Mode aktiv hat.
   */
  function initTheme() {
    const saved  = localStorage.getItem('pi_theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(saved || system);
  }

  // ============================================================
  // 7. SCROLL REVEAL ANIMATION
  // ============================================================

  /**
   * Elemente mit der CSS-Klasse ".reveal" werden unsichtbar gestartet
   * und erscheinen sanft wenn sie ins Bild scrollen.
   *
   * IntersectionObserver ist deutlich performanter als scroll-Events,
   * da der Browser selbst entscheidet wann er berechnet.
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return; // Keine Elemente? Nichts zu tun.

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Element sichtbar → Animation starten
              entry.target.classList.add('is-visible');
              // Nicht mehr beobachten – Animation passiert nur einmal
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold:  0.07,             // 7% des Elements muss sichtbar sein
          rootMargin: '0px 0px -20px 0px', // Etwas Puffer nach unten
        }
      );
      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback für alte Browser ohne IntersectionObserver
      revealElements.forEach(el => el.classList.add('is-visible'));
    }
  }

  // ============================================================
  // 8. SANFTES SCROLLEN FÜR ANKER-LINKS
  // ============================================================

  /**
   * Links wie <a href="#was-ist-pi"> scrollen sanft zur Zielsektion.
   * Berücksichtigt die Höhe des sticky Headers (70px Offset).
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return; // Leere Anker ignorieren

        const target = document.querySelector(targetId);
        if (!target) return; // Ziel nicht gefunden? Abbrechen.

        e.preventDefault();
        const headerOffset = 74; // Ungefähre Header-Höhe in Pixeln
        const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });
  }

  // ============================================================
  // 9. SUPPORT-FORMULAR (nur auf support-*.html)
  // ============================================================

  /**
   * Baut ein "Problem melden" Formular und fügt es am Ende
   * des <main>-Elements ein, aber nur auf Support-Seiten.
   *
   * Das Formular hat: Name, E-Mail, Modell-Auswahl, Problembeschreibung.
   * Bei Absenden erscheint ein Toast und das Formular wird geleert.
   * (In Produktion würde hier ein PHP/Server-Endpunkt angesprochen.)
   */
  function initSupportForm() {
    // Nur auf Support-Seiten (support-de.html, support-it.html, support-en.html)
    if (baseName !== 'support') return;

    const t = SUPPORT_TEXT[LANG];

    // Formular-HTML erstellen
    const formSection = document.createElement('section');
    formSection.id        = 'support-form-section';
    formSection.className = 'intro-section';
    formSection.style.background = 'var(--bg-primary)';
    formSection.innerHTML = `
      <div class="container" style="max-width:720px">

        <!-- Überschrift -->
        <div class="section-header center" style="margin-bottom:2rem">
          <span class="section-eyebrow">
            ${{ de:'direkte hilfe', it:'aiuto diretto', en:'direct help' }[LANG]}
          </span>
          <h2>${t.title}</h2>
        </div>

        <!-- Formular -->
        <div class="reveal" style="
          background:var(--bg-card);
          border:1px solid var(--border-color);
          border-radius:var(--radius-lg);
          padding:2rem;
        ">
          <!-- Name -->
          <div class="sf-group">
            <label class="sf-label" for="sf-name">${t.name}</label>
            <input class="sf-input" id="sf-name" type="text" autocomplete="name"
                   placeholder="${t.name}">
          </div>

          <!-- E-Mail -->
          <div class="sf-group">
            <label class="sf-label" for="sf-email">${t.email}</label>
            <input class="sf-input" id="sf-email" type="email" autocomplete="email"
                   placeholder="you@example.com">
          </div>

          <!-- Modell-Auswahl -->
          <div class="sf-group">
            <label class="sf-label" for="sf-device">${t.device}</label>
            <select class="sf-input" id="sf-device">
              ${t.devices.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
          </div>

          <!-- Problembeschreibung -->
          <div class="sf-group">
            <label class="sf-label" for="sf-problem">${t.problem}</label>
            <textarea class="sf-input sf-textarea" id="sf-problem"
                      placeholder="${t.placeholder}"></textarea>
          </div>

          <!-- Absenden-Button -->
          <button id="sf-submit" class="sf-btn">${t.send} →</button>
        </div>
      </div>

      <!-- Inline-CSS für das Formular – einmal definiert, überall verfügbar -->
      <style>
        .sf-group  { margin-bottom: 1.1rem; }
        .sf-label  { display:block; font-size:.72rem; font-weight:700;
                     text-transform:uppercase; letter-spacing:.06em;
                     color:var(--text-secondary); margin-bottom:.45rem; }
        .sf-input  { width:100%; background:var(--bg-secondary);
                     border:1px solid var(--border-color);
                     color:var(--text-primary); border-radius:var(--radius-sm);
                     padding:.7rem .9rem; font-size:.9rem; font-family:inherit;
                     outline:none; transition:border-color .2s; }
        .sf-input:focus  { border-color:var(--raspberry-red); }
        .sf-textarea     { min-height:130px; resize:vertical; }
        .sf-btn          { width:100%; padding:.9rem;
                           background:var(--raspberry-red); color:#fff;
                           border:none; border-radius:var(--radius-pill);
                           font-size:.95rem; font-weight:700;
                           font-family:inherit; cursor:pointer;
                           transition:background .2s, transform .15s; margin-top:.5rem; }
        .sf-btn:hover    { background:var(--raspberry-dark); transform:translateY(-1px); }
        .sf-btn:active   { transform:translateY(0); }
      </style>
    `;

    // Formular ans Ende von <main> hängen
    const main = document.querySelector('main');
    if (main) main.appendChild(formSection);

    // Scroll Reveal für das neue Element aktivieren
    formSection.querySelectorAll('.reveal').forEach(el => {
      // Direkt sichtbar machen wenn schon im Viewport
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.05 });
      obs.observe(el);
    });

    // Absenden-Event
    document.getElementById('sf-submit')?.addEventListener('click', () => {
      const name    = document.getElementById('sf-name')?.value.trim();
      const email   = document.getElementById('sf-email')?.value.trim();
      const problem = document.getElementById('sf-problem')?.value.trim();

      // Pflichtfelder prüfen
      if (!name || !email || !problem) {
        showToast(t.err, 3500);
        return;
      }

      // Erfolgsmeldung + Felder leeren
      showToast(t.ok, 4000);
      document.getElementById('sf-name').value    = '';
      document.getElementById('sf-email').value   = '';
      document.getElementById('sf-problem').value = '';

      /**
       * In Produktion würde man hier einen Fetch-Request senden:
       *
       * fetch('/api/support', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify({ name, email, device, problem })
       * });
       *
       * Auf dem Raspberry Pi kann das z.B. ein Python-Flask-Endpunkt sein.
       */
    });
  }

  // ============================================================
  // 10. COOKIE-BANNER
  // ============================================================

  /**
   * Zeigt beim ersten Besuch einen Cookie-Hinweis an.
   * Erscheint nur auf der Startseite (index-*.html).
   * Einwilligung wird in localStorage gespeichert.
   *
   * Diese Seite verwendet KEINE Tracking-Cookies – der Banner
   * informiert nur über lokale Einstellungs-Speicherung.
   */
  function initCookieBanner() {
    // Nur auf der Startseite anzeigen
    if (baseName !== 'index') return;

    // Schon gesehen? Dann nicht nochmal zeigen.
    if (localStorage.getItem('pi_cookie_ok')) return;

    const t = COOKIE_TEXT[LANG];

    // Banner-Element erstellen
    const banner = document.createElement('div');
    banner.id        = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <div class="cookie-inner">
        <p class="cookie-text">${t.msg}</p>
        <div class="cookie-btns">
          <button id="cookie-yes" class="cookie-btn cookie-yes">${t.yes}</button>
          <button id="cookie-no"  class="cookie-btn cookie-no">${t.no}</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // Kurze Verzögerung damit das Einblend-CSS sauber greift
    requestAnimationFrame(() => banner.classList.add('cookie-show'));

    /** Banner ausblenden und entfernen */
    function dismissBanner(accepted) {
      banner.classList.remove('cookie-show');
      setTimeout(() => banner.remove(), 400); // Warten bis CSS-Transition fertig
      if (accepted) localStorage.setItem('pi_cookie_ok', '1');
    }

    document.getElementById('cookie-yes')?.addEventListener('click', () => dismissBanner(true));
    document.getElementById('cookie-no')?.addEventListener('click',  () => dismissBanner(false));
  }

  // ============================================================
  // 11. TOAST-NACHRICHTEN
  // ============================================================

  /**
   * Zeigt eine kurze Hinweisbox unten rechts auf dem Bildschirm.
   * Verschwindet automatisch nach der angegebenen Zeit.
   *
   * @param {string} message   - Der anzuzeigende Text
   * @param {number} duration  - Anzeigedauer in Millisekunden (Standard: 3000)
   */
  function showToast(message, duration = 3000) {
    // Toast-Element erstellen falls noch nicht vorhanden
    let toast = document.getElementById('toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id        = 'toast-msg';
      toast.className = 'toast-message';
      toast.setAttribute('role', 'status'); // Screenreader wird informiert
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    // Laufenden Timer abbrechen (falls noch ein Toast sichtbar ist)
    clearTimeout(toast._hideTimer);

    toast.textContent = message;
    toast.classList.add('show');

    // Automatisch ausblenden
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ============================================================
  // 12. OFFLINE-ERKENNUNG
  // ============================================================

  /**
   * Informiert den Benutzer wenn die Internetverbindung wegfällt
   * oder wiederhergestellt wird.
   * Die Seite selbst funktioniert weiter (offline-fähig).
   */
  function initOfflineDetection() {
    const m = OFFLINE_TEXT[LANG] || OFFLINE_TEXT.de;
    window.addEventListener('offline', () => showToast(m.off, 5000));
    window.addEventListener('online',  () => showToast(m.on,  3000));
  }

  // ============================================================
  // 13. FAVICON DYNAMISCH SETZEN
  // ============================================================

  /**
   * Setzt das Browser-Tab-Icon (Favicon) auf das Raspberry Pi Logo.
   * So muss es nicht in jeder HTML-Datei einzeln definiert werden.
   */
  function initFavicon() {
    // Prüfen ob bereits ein Favicon definiert ist
    if (document.querySelector('link[rel="icon"]')) return;

    const link = document.createElement('link');
    link.rel  = 'icon';
    link.type = 'image/png';
    link.href = 'pic/raspberrypi_logo.png';
    document.head.appendChild(link);

    // Auch Apple Touch Icon für iOS
    const appleLink = document.createElement('link');
    appleLink.rel  = 'apple-touch-icon';
    appleLink.href = 'pic/raspberrypi_logo.png';
    document.head.appendChild(appleLink);
  }

  // ============================================================
  // 14. FAQ-AKKORDEON (nur auf support-*.html)
  // ============================================================

  /**
   * Macht FAQ-Einträge klickbar auf- und zuklappbar.
   * Klickt man auf eine Frage, klappt die Antwort auf.
   * Andere offene Fragen werden dabei geschlossen.
   */
  function initFaqAccordeon() {
    document.querySelectorAll('.faq-q').forEach(button => {
      button.addEventListener('click', () => {
        const item    = button.closest('.faq-item');
        const wasOpen = item.classList.contains('open');

        // Alle Fragen schließen
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

        // Angeklickte Frage öffnen (wenn sie nicht schon offen war)
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  // ============================================================
  // 15. FOOTER AUFBAUEN
  // ============================================================

  /**
   * Baut den Footer für jede Seite auf und ersetzt den Platzhalter.
   * Enthält: Logo, Beschreibung, Social Media, Navigations-Links, Copyright.
   */
  function buildFooter() {
    const sfx = SUFFIX[LANG];

    // Alle Texte nach Sprache
    const F = {
      de: {
        desc:      'Technologie mit Herz. Seit 2012 für eine offene, kreative und inklusive digitale Zukunft.',
        col1:      'Entdecken',
        col2:      'Hilfe',
        col3:      'Über uns',
        links1:    [['Shop', `shop${sfx}.html`], ['Hardware', `hardware${sfx}.html`], ['Software', `software${sfx}.html`], ['Geschichte', `geschichte${sfx}.html`]],
        links2:    [['Support & FAQ', `support${sfx}.html`], ['Tutorials', `support${sfx}.html`], ['Community', `support${sfx}.html`], ['Kontakt', `contact${sfx}.html`]],
        links3:    [['Foundation', `geschichte${sfx}.html`], ['Presse', `contact${sfx}.html`], ['Datenschutz', '#'], ['Impressum', '#']],
        copyright: '© 2025 Raspberry Pi Foundation – Gemeinnützig & offen für alle.',
        privacy:   'Datenschutz',
        imprint:   'Impressum',
      },
      it: {
        desc:      'Tecnologia con cuore. Dal 2012 per un futuro digitale aperto e creativo.',
        col1:      'Scopri',
        col2:      'Aiuto',
        col3:      'Chi siamo',
        links1:    [['Shop', `shop${sfx}.html`], ['Hardware', `hardware${sfx}.html`], ['Software', `software${sfx}.html`], ['Storia', `geschichte${sfx}.html`]],
        links2:    [['Supporto & FAQ', `support${sfx}.html`], ['Tutorial', `support${sfx}.html`], ['Community', `support${sfx}.html`], ['Contatto', `contact${sfx}.html`]],
        links3:    [['Foundation', `geschichte${sfx}.html`], ['Stampa', `contact${sfx}.html`], ['Privacy', '#'], ['Note legali', '#']],
        copyright: '© 2025 Raspberry Pi Foundation – Non profit, aperta a tutti.',
        privacy:   'Privacy',
        imprint:   'Note legali',
      },
      en: {
        desc:      'Technology with heart. Since 2012 for an open, creative and inclusive digital future.',
        col1:      'Explore',
        col2:      'Help',
        col3:      'About',
        links1:    [['Shop', `shop${sfx}.html`], ['Hardware', `hardware${sfx}.html`], ['Software', `software${sfx}.html`], ['History', `geschichte${sfx}.html`]],
        links2:    [['Support & FAQ', `support${sfx}.html`], ['Tutorials', `support${sfx}.html`], ['Community', `support${sfx}.html`], ['Contact', `contact${sfx}.html`]],
        links3:    [['Foundation', `geschichte${sfx}.html`], ['Press', `contact${sfx}.html`], ['Privacy', '#'], ['Imprint', '#']],
        copyright: '© 2025 Raspberry Pi Foundation – Non-profit & open for all.',
        privacy:   'Privacy',
        imprint:   'Imprint',
      },
    }[LANG];

    /** Hilfsfunktion: Link-Liste in <li>-Elemente umwandeln */
    const makeLinks = arr =>
      arr.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join('');

    const footerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">

          <!-- Linke Spalte: Logo + Beschreibung + Social Media -->
          <div class="footer-brand">
            <a href="index${sfx}.html" class="brand-footer" aria-label="Raspberry Pi Startseite">
              <img src="pic/raspberrypi_logo.png" alt="Raspberry Pi Logo"
                   style="width:26px;height:26px;object-fit:contain;filter:brightness(10)">
              <span class="brand-text">raspberry<span>pi</span></span>
            </a>
            <p>${F.desc}</p>

            <!-- Social Media Links -->
            <div class="footer-social">
              <!-- GitHub – Quellcode und Projekte -->
              <a href="https://github.com/raspberrypi" target="_blank" rel="noopener"
                 class="social-link" aria-label="GitHub">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <!-- YouTube – Video-Tutorials -->
              <a href="https://youtube.com/@raspberrypi" target="_blank" rel="noopener"
                 class="social-link" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <!-- Mastodon – Open Source Social Media -->
              <a href="https://fosstodon.org/@raspberrypi" target="_blank" rel="noopener"
                 class="social-link" aria-label="Mastodon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 00.023-.043v-1.809a.052.052 0 00-.02-.041.053.053 0 00-.046-.01 20.282 20.282 0 01-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 01-.319-1.433.053.053 0 01.066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
                </svg>
              </a>
              <!-- Discord – Community -->
              <a href="https://discord.gg/raspberrypi" target="_blank" rel="noopener"
                 class="social-link" aria-label="Discord">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
                </svg>
              </a>
              <!-- Forum – Offizielles Pi Forum -->
              <a href="https://forums.raspberrypi.com" target="_blank" rel="noopener"
                 class="social-link" aria-label="Forum">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Navigations-Links: 3 Spalten -->
          <div class="footer-links">
            <!-- Spalte 1: Entdecken -->
            <div>
              <h4>${F.col1}</h4>
              <ul>${makeLinks(F.links1)}</ul>
            </div>
            <!-- Spalte 2: Hilfe -->
            <div>
              <h4>${F.col2}</h4>
              <ul>${makeLinks(F.links2)}</ul>
            </div>
            <!-- Spalte 3: Über uns -->
            <div>
              <h4>${F.col3}</h4>
              <ul>${makeLinks(F.links3)}</ul>
            </div>
          </div>
        </div>

        <!-- Footer-Unterzeile: Copyright + Legal -->
        <div class="footer-bottom">
          <div class="container footer-bottom-flex">
            <p class="copyright">${F.copyright}</p>
            <div class="legal-links">
              <a href="#">${F.privacy}</a>
              <a href="#">${F.imprint}</a>
            </div>
          </div>
        </div>
      </footer>`;

    // Footer-Platzhalter ersetzen
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = footerHTML;
      placeholder.replaceWith(wrapper.firstElementChild);
    }
  }

  // ============================================================
  // 16. HAUPT-INITIALISIERUNG
  // ============================================================

  /**
   * init() wird einmal beim Laden der Seite aufgerufen.
   * Die Reihenfolge der Funktionen ist wichtig:
   *  1. Theme sofort setzen (verhindert Flackern)
   *  2. Favicon setzen
   *  3. Navigation einfügen
   *  4. Footer einfügen
   *  5. Events binden (Navigation muss vorher existieren)
   *  6. Weitere Features initialisieren
   */
  function init() {
    initTheme();         // Sofort: Dark/Light Mode setzen
    initFavicon();       // Sofort: Tab-Icon setzen

    injectNav();         // Navigation aufbauen und einfügen
    buildFooter();       // Footer aufbauen und einfügen
    bindNavEvents();     // Klick-Events für Navigation registrieren

    initScrollReveal();  // Sanfte Einblend-Animationen
    initSmoothScroll();  // Sanftes Scrollen für Anker-Links
    initOfflineDetection(); // Offline-Hinweis

    // Support-Formular – nur auf support-*.html
    initSupportForm();

    // FAQ-Akkordeon – nur wenn .faq-q Elemente vorhanden
    initFaqAccordeon();

    // Cookie-Banner – nur beim ersten Besuch auf index-*.html
    // Leichte Verzögerung damit Seite erst vollständig geladen ist
    setTimeout(() => initCookieBanner(), 800);
  }

  // Warten bis der DOM bereit ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM schon bereit (z.B. bei defer-Attribut)
    init();
  }

})(); // Ende der IIFE (Immediately Invoked Function Expression)
     // Die Klammern verhindern, dass Variablen ins globale Scope gelangen
