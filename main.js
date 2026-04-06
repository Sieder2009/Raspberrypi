/**
 * ============================================================
 * MAIN.JS – Raspberry Pi Website
 * ============================================================
 *
 * Dieses Skript läuft auf JEDER Seite der Website.
 * Es liest die Sprache und Seite aus data-Attributen des
 * <script>-Tags:
 *
 *   <script src="../main.js" data-lang="de" data-page="home"></script>
 *
 * Funktionen im Überblick:
 *  1.  Dark Mode           – ☀️/🌙 Toggle mit Systemerkennung
 *  2.  Hamburger-Menü      – Mobile Navigation auf/zuklappen
 *  3.  Scroll Reveal       – Elemente sanft einblenden
 *  4.  Smooth Scroll       – Sanftes Scrollen für Anker-Links (#...)
 *  5.  Cookie-Banner       – Einmalig beim ersten Besuch
 *  6.  FAQ Akkordeon       – Fragen auf-/zuklappen
 *  7.  Support-Formular    – Validierung und Toast-Meldung
 *  8.  Kontakt-Formular    – Validierung und Toast-Meldung
 *  9.  Toast               – Kleine Hinweisbox unten rechts
 * 10.  Offline-Erkennung   – Hinweis wenn kein Internet
 * 11.  Header-Schatten      – Schatten erscheint beim Scrollen
 *
 * WICHTIG: Diese Seite funktioniert KOMPLETT OFFLINE.
 * Keine externen Ressourcen werden geladen.
 * ============================================================
 */

/* ── IIFE: Immediately Invoked Function Expression ───────────
   Alle Variablen bleiben privat, kein Konflikt mit anderen
   Skripten. Die Klammern am Ende rufen die Funktion direkt auf.
   ──────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  // ==========================================================
  // SCHRITT 1: SPRACHE UND SEITE AUSLESEN
  // ==========================================================

  /**
   * Das <script>-Tag hat data-lang und data-page Attribute.
   * Damit weiß dieses Skript auf welcher Seite und in welcher
   * Sprache es gerade läuft – ohne dass die URL analysiert
   * werden muss.
   *
   * Fallback: Deutsch, Startseite
   */
  const scriptTag = document.querySelector('script[data-lang]');
  const LANG      = scriptTag?.getAttribute('data-lang') || 'de';
  const PAGE      = scriptTag?.getAttribute('data-page') || 'home';

  // ==========================================================
  // SCHRITT 2: TEXTE FÜR TOAST & OFFLINE PRO SPRACHE
  // ==========================================================

  /**
   * Alle Hinweis-Texte auf Deutsch, Italienisch und Englisch.
   * Wird für Toast-Meldungen und den Cookie-Banner gebraucht.
   */
  const TEXT = {
    de: {
      offline:       '📡 Offline – die Seite läuft trotzdem!',
      online:        '✅ Wieder online!',
      cookie_msg:    '🍪 Diese Website speichert nur deine Einstellungen (Dark Mode) lokal – keine Tracking-Cookies.',
      cookie_yes:    'Einverstanden',
      cookie_no:     'Ablehnen',
      sf_ok:         '✅ Nachricht gesendet – wir melden uns bald!',
      sf_err:        '⚠️ Bitte Name, E-Mail und Problem ausfüllen.',
      cf_ok:         '✅ Nachricht gesendet – wir melden uns bald!',
    },
    it: {
      offline:       '📡 Offline – il sito funziona lo stesso!',
      online:        '✅ Di nuovo online!',
      cookie_msg:    '🍪 Questo sito salva solo le tue preferenze (tema) in locale – nessun cookie di tracciamento.',
      cookie_yes:    'Accetto',
      cookie_no:     'Rifiuto',
      sf_ok:         '✅ Messaggio inviato – ti risponderemo presto!',
      sf_err:        '⚠️ Compila nome, email e descrizione del problema.',
      cf_ok:         '✅ Messaggio inviato – ti risponderemo presto!',
    },
    en: {
      offline:       '📡 Offline – the site still works!',
      online:        '✅ Back online!',
      cookie_msg:    '🍪 This site only saves your preferences (theme) locally – no tracking cookies.',
      cookie_yes:    'Agree',
      cookie_no:     'Decline',
      sf_ok:         '✅ Message sent – we will get back to you soon!',
      sf_err:        '⚠️ Please fill in name, email and problem description.',
      cf_ok:         '✅ Message sent – we will get back to you soon!',
    },
  };

  /** Aktuelle Sprach-Texte, Fallback Deutsch */
  const T = TEXT[LANG] || TEXT.de;

  // ==========================================================
  // SCHRITT 3: DARK MODE
  // ==========================================================

  /**
   * Das Theme (hell/dunkel) wird im Browser-Speicher gespeichert
   * (localStorage). Beim nächsten Besuch wird es automatisch
   * wieder gesetzt – auch ohne Internet.
   *
   * Wenn noch kein Theme gespeichert ist, wird das Betriebssystem
   * gefragt: Nutzt der User Dark Mode auf dem System?
   *
   * @param {string} theme - 'light' oder 'dark'
   */
  function applyTheme(theme) {
    /* Setzt das Attribut auf dem <html>-Element.
       CSS-Regeln reagieren darauf: [data-theme="dark"] { ... } */
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pi_theme', theme);
  }

  /**
   * Beim Seitenstart: Theme sofort setzen damit kein weißes
   * Aufflackern (Flash of Unstyled Content) passiert.
   */
  function initTheme() {
    const saved  = localStorage.getItem('pi_theme');
    /* prefers-color-scheme: dark → Betriebssystem möchte Dark Mode */
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches
                   ? 'dark' : 'light';
    applyTheme(saved || system);
  }

  /**
   * Dark Mode Toggle-Button: Klick wechselt zwischen Hell/Dunkel.
   * Der Button ist in der Navigation (nav_html im build.py).
   */
  function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ==========================================================
  // SCHRITT 4: HAMBURGER-MENÜ (Mobile)
  // ==========================================================

  /**
   * Auf kleinen Bildschirmen ist die Navigation versteckt.
   * Der Hamburger-Button (☰) öffnet und schließt sie.
   *
   * Klick außerhalb und Escape-Taste schließen das Menü ebenfalls.
   * Das verbessert die Bedienbarkeit.
   */
  function initHamburger() {
    const menuBtn = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (!menuBtn || !mainNav) return; // Elemente vorhanden?

    /** Menü schließen – wird an mehreren Stellen aufgerufen */
    function closeMenu() {
      mainNav.classList.remove('is-open');
      menuBtn.classList.remove('is-open');
      /* aria-expanded informiert Screenreader: "Menü ist zu" */
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    menuBtn.addEventListener('click', () => {
      const isNowOpen = mainNav.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open', isNowOpen);
      menuBtn.setAttribute('aria-expanded', String(isNowOpen));
    });

    /* Klick auf einen Menü-Link schließt das Menü */
    mainNav.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', closeMenu)
    );

    /* Escape-Taste schließt das Menü */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ==========================================================
  // SCHRITT 5: HEADER-SCHATTEN BEIM SCROLLEN
  // ==========================================================

  /**
   * Der Header ist oben fixiert (sticky). Wenn der Nutzer scrollt,
   * erscheint ein Schatten damit klar ist, dass Inhalt dahinter ist.
   *
   * { passive: true } ist wichtig: Scroll-Events ohne passive
   * können den Browser verlangsamen. Mit passive signalisieren wir:
   * "Wir rufen hier kein preventDefault() auf."
   */
  function initHeaderShadow() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 8
        ? 'var(--shadow-sm)'
        : '';
    }, { passive: true });
  }

  // ==========================================================
  // SCHRITT 6: SCROLL REVEAL ANIMATION
  // ==========================================================

  /**
   * Elemente mit der CSS-Klasse ".reveal" erscheinen sanft wenn
   * sie in den sichtbaren Bereich gescrollt werden.
   *
   * IntersectionObserver ist effizienter als scroll-Events:
   * Der Browser führt den Callback nur aus wenn sich der
   * Sichtbarkeits-Status eines Elements ändert.
   *
   * Die CSS-Animation (opacity, translateY) ist in main.css definiert.
   * ".reveal" startet unsichtbar, ".reveal.is-visible" ist sichtbar.
   */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              /* Element sichtbar → CSS-Klasse hinzufügen */
              entry.target.classList.add('is-visible');
              /* Nicht mehr beobachten – die Animation passiert einmalig */
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold:  0.07,             // 7% des Elements sichtbar → triggern
          rootMargin: '0px 0px -20px 0px', // 20px Puffer am unteren Rand
        }
      );

      elements.forEach(el => observer.observe(el));
    } else {
      /* Ältere Browser ohne IntersectionObserver: Alle sofort sichtbar */
      elements.forEach(el => el.classList.add('is-visible'));
    }
  }

  // ==========================================================
  // SCHRITT 7: SANFTES SCROLLEN FÜR ANKER-LINKS
  // ==========================================================

  /**
   * Links wie <a href="#was-ist-pi"> springen normalerweise sofort
   * zur Zielsektion. Hier wird stattdessen sanft gescrollt.
   *
   * Der Offset von 80px verhindert dass der Inhalt hinter dem
   * sticky Header verschwindet.
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return; // Leere Anker ignorieren

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault(); // Normales Springen verhindern

        const HEADER_HEIGHT = 80; // Ungefähre Header-Höhe in Pixeln
        const targetTop = target.getBoundingClientRect().top
                         + window.scrollY
                         - HEADER_HEIGHT;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });
  }

  // ==========================================================
  // SCHRITT 8: TOAST-BENACHRICHTIGUNGEN
  // ==========================================================

  /**
   * Zeigt eine kleine Benachrichtigungs-Box unten rechts.
   * Erscheint mit CSS-Transition, verschwindet nach "duration" ms.
   *
   * Das Toast-Element existiert als <div id="toast-msg"> in
   * jeder HTML-Seite. Wenn es fehlt, wird es erstellt.
   *
   * @param {string} message   - Anzuzeigender Text
   * @param {number} duration  - Anzeigedauer in Millisekunden
   */
  function showToast(message, duration = 3200) {
    let toast = document.getElementById('toast-msg');

    if (!toast) {
      /* Toast-Element dynamisch erstellen falls nicht vorhanden */
      toast = document.createElement('div');
      toast.id        = 'toast-msg';
      toast.className = 'toast-message';
      /* role="status" + aria-live="polite": Screenreader liest vor */
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    /* Laufenden Timer abbrechen (verhindert dass Toast zu früh verschwindet
       wenn mehrere Toasts schnell hintereinander aufgerufen werden) */
    clearTimeout(toast._timer);

    toast.textContent = message;
    toast.classList.add('show');

    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  /* showToast global verfügbar machen (für onclick-Handler in HTML) */
  window.showToast = showToast;

  // ==========================================================
  // SCHRITT 9: COOKIE-BANNER
  // ==========================================================

  /**
   * Erscheint beim ersten Besuch auf einer Index-Seite.
   * Erklärt dass nur lokale Einstellungen gespeichert werden.
   * Nach Zustimmung oder Ablehnung wird der Status gespeichert.
   *
   * Der Banner gleitet von unten in den Bildschirm (CSS-Transition).
   * requestAnimationFrame stellt sicher dass die Animation startet
   * NACHDEM das Element im DOM ist.
   */
  function initCookieBanner() {
    /* Nur auf Startseiten anzeigen */
    if (PAGE !== 'home') return;

    /* Schon gesehen? Dann nicht nochmal. */
    if (localStorage.getItem('pi_cookie_ok')) return;

    /* Banner-Element erstellen */
    const banner = document.createElement('div');
    banner.id        = 'cookie-banner';
    banner.className = 'cookie-banner';
    /* role="dialog": Screenreader erkennt es als Dialog */
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <div class="cookie-inner">
        <p class="cookie-text">${T.cookie_msg}</p>
        <div class="cookie-btns">
          <button id="cookie-yes" class="cookie-btn cookie-yes">${T.cookie_yes}</button>
          <button id="cookie-no"  class="cookie-btn cookie-no">${T.cookie_no}</button>
        </div>
      </div>`;

    document.body.appendChild(banner);

    /* Kurze Pause damit CSS-Transition funktioniert */
    requestAnimationFrame(() => banner.classList.add('cookie-show'));

    /**
     * Banner entfernen nach Klick.
     * @param {boolean} accepted - Hat der User zugestimmt?
     */
    function dismissBanner(accepted) {
      banner.classList.remove('cookie-show');
      /* Warten bis CSS-Transition fertig ist (400ms), dann entfernen */
      setTimeout(() => banner.remove(), 420);
      if (accepted) {
        localStorage.setItem('pi_cookie_ok', '1');
      }
    }

    document.getElementById('cookie-yes')?.addEventListener('click', () => dismissBanner(true));
    document.getElementById('cookie-no')?.addEventListener('click',  () => dismissBanner(false));
  }

  // ==========================================================
  // SCHRITT 10: FAQ AKKORDEON
  // ==========================================================

  /**
   * Klappt FAQ-Einträge auf und zu.
   * Klickt man auf eine Frage, öffnet sich die Antwort.
   * Andere offene Antworten werden dabei geschlossen.
   *
   * HTML-Struktur (in support.html):
   *   <div class="faq-item">
   *     <button class="faq-q">Frage?</button>
   *     <div class="faq-a">Antwort...</div>
   *   </div>
   */
  function initFaqAccordeon() {
    const faqButtons = document.querySelectorAll('.faq-q');
    if (!faqButtons.length) return; // Keine FAQ auf dieser Seite

    faqButtons.forEach(button => {
      button.addEventListener('click', () => {
        const item    = button.closest('.faq-item');
        const wasOpen = item.classList.contains('open');

        /* Alle FAQ-Einträge schließen */
        document.querySelectorAll('.faq-item').forEach(i =>
          i.classList.remove('open')
        );

        /* Angeklickten Eintrag öffnen – aber nur wenn er nicht schon offen war
           (zweiter Klick auf offenen Eintrag schließt ihn) */
        if (!wasOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  // ==========================================================
  // SCHRITT 11: SUPPORT-FORMULAR (auf support.html)
  // ==========================================================

  /**
   * Validiert das "Problem melden"-Formular.
   * Prüft ob Name, E-Mail und Problem ausgefüllt sind.
   * Bei Erfolg: Toast-Meldung, Felder leeren.
   *
   * In Produktion würde hier ein fetch()-Request an den Server gehen,
   * z.B. an ein Python Flask-Script auf dem Raspberry Pi:
   *
   *   fetch('/api/support', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ name, email, device, problem })
   *   });
   */
  function initSupportForm() {
    const submitBtn = document.getElementById('sf-submit');
    if (!submitBtn) return; // Nicht auf dieser Seite

    submitBtn.addEventListener('click', () => {
      /* Felder auslesen und Leerzeichen entfernen */
      const name    = (document.getElementById('sf-name')?.value    || '').trim();
      const email   = (document.getElementById('sf-email')?.value   || '').trim();
      const problem = (document.getElementById('sf-problem')?.value || '').trim();

      /* Pflichtfeld-Prüfung */
      if (!name || !email || !problem) {
        /* data-err Attribut am Button enthält die Fehlermeldung in der richtigen Sprache */
        showToast(submitBtn.dataset.err || T.sf_err, 3500);
        return;
      }

      /* Erfolgsmeldung anzeigen */
      showToast(submitBtn.dataset.ok || T.sf_ok, 4000);

      /* Formular zurücksetzen */
      ['sf-name', 'sf-email', 'sf-problem'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    });
  }

  // ==========================================================
  // SCHRITT 12: KONTAKT-FORMULAR (auf contact.html)
  // ==========================================================

  /**
   * Validiert das Kontaktformular auf contact.html.
   * Funktioniert gleich wie das Support-Formular.
   */
  function initContactForm() {
    const submitBtn = document.getElementById('cf-submit');
    if (!submitBtn) return; // Nicht auf dieser Seite

    submitBtn.addEventListener('click', () => {
      const firstName = (document.getElementById('cf-fn')?.value    || '').trim();
      const email     = (document.getElementById('cf-email')?.value || '').trim();
      const message   = (document.getElementById('cf-msg')?.value   || '').trim();

      if (!firstName || !email || !message) {
        showToast(T.sf_err, 3500);
        return;
      }

      showToast(submitBtn.dataset.ok || T.cf_ok, 4000);

      /* Alle Kontaktformular-Felder zurücksetzen */
      ['cf-fn', 'cf-ln', 'cf-email', 'cf-msg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    });
  }

  // ==========================================================
  // SCHRITT 13: OFFLINE-ERKENNUNG
  // ==========================================================

  /**
   * Browser-Events 'offline' und 'online' werden gefeuert wenn
   * die Netzwerkverbindung sich ändert.
   *
   * Die Website funktioniert vollständig offline da alle Ressourcen
   * lokal gespeichert sind (keine CDN, keine externen Fonts).
   */
  function initOfflineDetection() {
    window.addEventListener('offline', () => showToast(T.offline, 5000));
    window.addEventListener('online',  () => showToast(T.online,  3000));
  }

  // ==========================================================
  // SCHRITT 14: FAQ CSS (wird direkt hier eingefügt)
  // ==========================================================

  /**
   * Die FAQ-Styles werden direkt per JavaScript eingefügt.
   * So brauchen sie nicht in main.css zu sein und werden nur
   * geladen wenn tatsächlich FAQ-Elemente vorhanden sind.
   */
  function injectFaqStyles() {
    if (!document.querySelector('.faq-item')) return;
    if (document.getElementById('faq-styles')) return; // Nicht doppelt einfügen

    const style = document.createElement('style');
    style.id = 'faq-styles';
    style.textContent = `
      /* FAQ-Liste: vertikaler Abstand zwischen Einträgen */
      .faq-list {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        max-width: 780px;
        margin: 0 auto;
      }
      /* FAQ-Eintrag: weißer Kasten mit abgerundeten Ecken */
      .faq-item {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      /* Frage-Button: volle Breite, linksbündig */
      .faq-q {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1.1rem 1.4rem;
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.93rem;
        font-weight: 600;
        color: var(--text-primary);
        text-align: left;
        transition: background 0.15s;
      }
      .faq-q:hover { background: var(--bg-secondary); }
      /* Pfeil-Icon dreht sich wenn Frage offen ist */
      .faq-arrow {
        font-size: 0.7rem;
        color: var(--text-muted);
        transition: transform 0.25s;
        flex-shrink: 0;
      }
      .faq-item.open .faq-arrow { transform: rotate(90deg); }
      /* Antwort-Container: klappt auf mit max-height Transition */
      .faq-a {
        font-size: 0.87rem;
        color: var(--text-secondary);
        line-height: 1.75;
        padding: 0 1.4rem;
        max-height: 0;       /* Geschlossen: kein Platz */
        overflow: hidden;
        transition: max-height 0.3s ease, padding 0.3s ease;
      }
      /* Offen: Platz für Antwort, Innen-Abstand unten */
      .faq-item.open .faq-a {
        max-height: 250px;   /* Groß genug für alle Antworten */
        padding: 0.75rem 1.4rem 1.2rem;
      }
      /* Offener Eintrag: rötliche Umrandung als Akzent */
      .faq-item.open { border-color: rgba(214, 46, 74, 0.25); }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================
  // SCHRITT 15: SUPPORT-FORMULAR CSS
  // ==========================================================

  /**
   * Styles für das Support-Formular und Kontaktformular.
   * Wird nur eingefügt wenn die entsprechenden Elemente vorhanden sind.
   */
  function injectFormStyles() {
    if (!document.querySelector('.sf-input') && !document.querySelector('.contact-form')) return;
    if (document.getElementById('form-styles')) return;

    const style = document.createElement('style');
    style.id = 'form-styles';
    style.textContent = `
      /* Formular-Gruppe: Label + Input mit Abstand nach unten */
      .sf-group { margin-bottom: 1.1rem; }

      /* Label: Klein, Großbuchstaben, gedämpfte Farbe */
      .sf-label {
        display: block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-secondary);
        margin-bottom: 0.45rem;
      }

      /* Input-Felder: Warmer Hintergrund, dezenter Rahmen */
      .sf-input {
        width: 100%;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        border-radius: var(--radius-sm);
        padding: 0.7rem 0.9rem;
        font-size: 0.9rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
      }
      /* Fokus: Roter Rahmen als Akzent */
      .sf-input:focus { border-color: var(--raspberry-red); }

      /* Textarea: Höher, vertikal skalierbar */
      .sf-textarea {
        min-height: 130px;
        resize: vertical;
      }

      /* Absenden-Button: Vollständig ausgefüllte rote Schaltfläche */
      .sf-btn {
        width: 100%;
        padding: 0.9rem;
        background: var(--raspberry-red);
        color: #fff;
        border: none;
        border-radius: var(--radius-pill);
        font-size: 0.95rem;
        font-weight: 700;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.2s, transform 0.15s;
        margin-top: 0.5rem;
      }
      .sf-btn:hover  { background: var(--raspberry-dark); transform: translateY(-1px); }
      .sf-btn:active { transform: translateY(0); }

      /* Kontakt-Seite: Layout */
      .contact-layout {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 3rem;
        align-items: start;
        padding: 4rem 0;
      }
      @media (max-width: 760px) {
        .contact-layout { grid-template-columns: 1fr; }
      }

      /* Kontakt-Karten (E-Mail, Discord, etc.) */
      .contact-cards { display: flex; flex-direction: column; gap: 0.9rem; }
      .contact-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.1rem 1.3rem;
        display: flex;
        align-items: center;
        gap: 0.9rem;
        transition: var(--transition);
      }
      .contact-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: rgba(214, 46, 74, 0.2);
      }
      .contact-icon { font-size: 1.6rem; line-height: 1; flex-shrink: 0; }
      .contact-type {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        font-weight: 600;
        margin-bottom: 0.15rem;
      }
      .contact-val { font-size: 0.9rem; font-weight: 500; }

      /* Kontakt-Formular: gleiche Styles wie Support */
      .contact-form {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 2rem;
      }

      /* Zweispaltige Zeile für Vor- und Nachname */
      .form-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 0;
      }
      @media (max-width: 500px) { .form-row-2 { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================
  // SCHRITT 16: COOKIE-BANNER CSS
  // ==========================================================

  /**
   * Styles für den Cookie-Banner.
   * Wird nur auf der Startseite eingefügt.
   */
  function injectCookieStyles() {
    if (PAGE !== 'home') return;
    if (document.getElementById('cookie-styles')) return;

    const style = document.createElement('style');
    style.id = 'cookie-styles';
    style.textContent = `
      /* Banner: Unten fixiert, beginnt außerhalb des Bildschirms */
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9000;
        background: var(--bg-card);
        border-top: 1px solid var(--border-color);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        transform: translateY(100%);         /* Startet unsichtbar */
        transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1);
        padding: 1.25rem 1.5rem;
      }
      /* Klasse cookie-show: Banner fährt sichtbar ins Bild */
      .cookie-banner.cookie-show { transform: translateY(0); }

      .cookie-inner {
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
      .cookie-text {
        flex: 1;
        font-size: 0.88rem;
        color: var(--text-secondary);
        line-height: 1.6;
        min-width: 260px;
      }
      .cookie-btns { display: flex; gap: 0.6rem; flex-shrink: 0; }
      .cookie-btn {
        padding: 0.55rem 1.3rem;
        border-radius: var(--radius-pill);
        font-size: 0.85rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        border: 1.5px solid transparent;
        transition: all 0.18s;
      }
      /* Zustimmungs-Button: Rot (Raspberry-Farbe) */
      .cookie-yes {
        background: var(--raspberry-red);
        color: #fff;
        border-color: var(--raspberry-red);
      }
      .cookie-yes:hover { background: var(--raspberry-dark); }
      /* Ablehnen-Button: Transparent mit Rahmen */
      .cookie-no {
        background: transparent;
        color: var(--text-secondary);
        border-color: var(--border-color);
      }
      .cookie-no:hover { border-color: var(--text-secondary); color: var(--text-primary); }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================
  // HAUPT-INITIALISIERUNG
  // ==========================================================

  /**
   * init() wird einmal aufgerufen wenn das Skript geladen ist.
   *
   * Reihenfolge ist wichtig:
   *  1. Theme sofort setzen (verhindert weißes Aufflackern)
   *  2. Styles für dynamische Elemente einfügen
   *  3. Interaktivität initialisieren
   *  4. Cookie-Banner mit Verzögerung (erst nach Seitenaufbau)
   */
  function init() {
    /* Sofort ausführen – verhindert Flackern */
    initTheme();

    /* CSS für dynamische Elemente */
    injectFaqStyles();
    injectFormStyles();
    injectCookieStyles();

    /* Navigation und Header */
    initThemeToggle();
    initHamburger();
    initHeaderShadow();

    /* Inhalt-Interaktivität */
    initScrollReveal();
    initSmoothScroll();
    initFaqAccordeon();
    initSupportForm();
    initContactForm();

    /* Netzwerk-Status */
    initOfflineDetection();

    /* Cookie-Banner: kurze Verzögerung damit Seite erst aufgebaut ist */
    setTimeout(() => initCookieBanner(), 900);
  }

  /* ── Warten bis HTML-Dokument vollständig geladen ist ──────
     DOMContentLoaded feuert wenn HTML geparst ist (schneller als 'load').
     Falls das Skript mit defer geladen wird, ist DOM schon bereit.
     ──────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(); /* ← IIFE endet hier */
