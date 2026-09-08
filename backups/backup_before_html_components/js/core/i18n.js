/**
 * =========================================================================
 * HARITA TOOLS BETA - INTERNATIONALIZATION & STRINGS ENGINE (i18n)
 * =========================================================================
 * Centralizes all static copy, geomatics domain terminology, labels,
 * button texts, and toast messages in external JSON dictionary files.
 */

(function (window, document) {
  'use strict';

  class StudioI18n {
    constructor() {
      this.currentLang = 'tr';
      // Synchronous instant initialization from embedded dictionary if present
      const embedded = (typeof window !== 'undefined' && (window.__HARITA_TR_TRANSLATIONS__ || window.__I18N_TR__)) ? (window.__HARITA_TR_TRANSLATIONS__ || window.__I18N_TR__) : null;
      this.strings = embedded ? Object.assign({}, embedded) : {};
      this.isLoaded = !!embedded;
      this.loadingPromise = null;
    }

    /**
     * Initialize language and load JSON file from server
     * @param {string} lang 
     * @returns {Promise<boolean>}
     */
    async init(lang = 'tr') {
      this.currentLang = lang;
      const embeddedDict = (typeof window !== 'undefined' && (window.__HARITA_TR_TRANSLATIONS__ || window.__I18N_TR__)) ? (window.__HARITA_TR_TRANSLATIONS__ || window.__I18N_TR__) : null;
      if (!this.isLoaded && embeddedDict) {
        this.strings = Object.assign({}, embeddedDict);
        this.isLoaded = true;
      }

      if (this.loadingPromise) return this.loadingPromise;

      this.loadingPromise = (async () => {
        try {
          const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
          const jsonUrl = `${basePath}locales/${lang}.json`;

          const response = await fetch(jsonUrl, { cache: 'no-cache' });
          if (response.ok) {
            const fetched = await response.json();
            this.strings = Object.assign({}, this.strings, fetched);
            this.isLoaded = true;
          }
        } catch (err) {
          // file:// or offline fallback - embedded strings already active
        }

        // Hydrate all data-i18n elements in DOM
        this.translateDOM();

        // Dispatch event for components that need to re-render
        document.dispatchEvent(new CustomEvent('i18n:ready', {
          detail: { lang: this.currentLang, strings: this.strings }
        }));

        console.log(`[i18n] '${lang}' dil paketi hazır.`);
        return true;
      })();

      return this.loadingPromise;
    }

    /**
     * Resolve a dot-notated key with optional placeholder params
     * Example: t('converter.toastParsed', { name: 'harita.dxf', count: 12 })
     * @param {string} key 
     * @param {Object} [params] 
     * @returns {string}
     */
    t(key, params = {}, fallback = null) {
      if (!key) return fallback !== null ? fallback : '';

      const parts = key.split('.');
      let current = this.strings;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          current = null;
          break;
        }
      }

      if (typeof current !== 'string') {
        if (fallback !== null) return fallback;
        return key;
      }

      let text = current;
      if (params && typeof params === 'object') {
        for (const [paramKey, val] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val ?? ''));
        }
      }

      return text;
    }

    /**
     * Automatically translates all elements marked with data-i18n attributes
     * @param {HTMLElement|Document} root 
     */
    translateDOM(root = document) {
      if (!this.isLoaded) return;

      // Text content
      root.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = this.t(key);
        if (translated) el.textContent = translated;
      });

      // HTML content (for badges with icons)
      root.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const translated = this.t(key);
        if (translated) el.innerHTML = translated;
      });

      // Placeholders
      root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translated = this.t(key);
        if (translated) el.setAttribute('placeholder', translated);
      });

      // Titles / Tooltips
      root.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const translated = this.t(key);
        if (translated) el.setAttribute('title', translated);
      });

      // Aria labels
      root.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        const translated = this.t(key);
        if (translated) el.setAttribute('aria-label', translated);
      });
    }
  }

  // Export globally
  const i18nInstance = new StudioI18n();
  window.i18n = i18nInstance;
  window.t = (key, params) => i18nInstance.t(key, params);

  // Synchronously translate DOM if embedded strings are present
  if (i18nInstance.isLoaded) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => i18nInstance.translateDOM());
    } else {
      i18nInstance.translateDOM();
    }
  }

})(window, document);
