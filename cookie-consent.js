/*
 * Cookie-/Einwilligungs-Verwaltung für Frauenkompass Tirol.
 * Lädt optionale Dienste (aktuell: Google Fonts) erst nach ausdrücklicher
 * Zustimmung nach; speichert die Auswahl lokal im Browser (kein Server-Tracking).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'fk_cookie_consent_v2';
  var GOOGLE_FONTS_HREF =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Jost:wght@300;400;500;600&display=swap';

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {
      /* localStorage nicht verfügbar (z.B. Privatmodus) - Auswahl gilt nur für diese Sitzung */
    }
  }

  function loadGoogleFonts() {
    if (document.getElementById('googleFontsStylesheet')) return;
    var preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);

    var stylesheet = document.createElement('link');
    stylesheet.id = 'googleFontsStylesheet';
    stylesheet.rel = 'stylesheet';
    stylesheet.href = GOOGLE_FONTS_HREF;
    document.head.appendChild(stylesheet);
  }

  function applyConsent(consent) {
    if (consent && consent.fonts) {
      loadGoogleFonts();
    }
  }

  function initBanner() {
    var overlay = document.getElementById('cookieOverlay');
    if (!overlay) return;

    var fontsToggle = document.getElementById('cookieFontsToggle');
    var acceptAllBtn = document.getElementById('cookieAcceptAll');
    var rejectAllBtn = document.getElementById('cookieRejectAll');
    var saveBtn = document.getElementById('cookieSaveSelection');

    function openBanner(existing) {
      if (fontsToggle) fontsToggle.checked = !!(existing && existing.fonts);
      overlay.hidden = false;
    }

    function closeBanner() {
      overlay.hidden = true;
    }

    function save(fontsAllowed) {
      var consent = {
        necessary: true,
        fonts: !!fontsAllowed,
        timestamp: new Date().toISOString(),
        version: 2
      };
      writeConsent(consent);
      applyConsent(consent);
      closeBanner();
    }

    if (acceptAllBtn) acceptAllBtn.addEventListener('click', function () { save(true); });
    if (rejectAllBtn) rejectAllBtn.addEventListener('click', function () { save(false); });
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        save(fontsToggle && fontsToggle.checked);
      });
    }

    var existing = readConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      openBanner(null);
    }

    // Für den Footer-Link "Cookie-Einstellungen ändern"
    window.fkOpenCookieSettings = function (event) {
      if (event && event.preventDefault) event.preventDefault();
      openBanner(readConsent());
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
