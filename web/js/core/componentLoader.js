/**
 * Harita Tools - Asynchronous Client-Side Component Loader
 * Dynamically loads and hydrates HTML components into the DOM via data-component attributes.
 */
const ComponentLoader = {
  /**
   * Scans and loads all [data-component] elements concurrently
   * @param {HTMLElement|Document} root 
   * @returns {Promise<number>} Number of loaded components
   */
  async loadAll(root = document) {
    const placeholders = Array.from(root.querySelectorAll('[data-component]'));
    if (!placeholders.length) return 0;

    let loadedCount = 0;

    await Promise.all(placeholders.map(async (el) => {
      const src = el.getAttribute('data-component');
      if (!src) return;

      try {
        let html = null;
        if (window.__COMPONENT_CACHE__ && window.__COMPONENT_CACHE__[src]) {
          html = window.__COMPONENT_CACHE__[src];
        } else {
          const response = await fetch(src, { cache: 'no-cache' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
          }
          html = await response.text();
        }
        
        // Use a template to parse the incoming HTML
        const temp = document.createElement('template');
        temp.innerHTML = html.trim();
        
        // If template has child elements, replace placeholder with them
        if (temp.content.children.length > 0) {
          el.replaceWith(...Array.from(temp.content.childNodes));
          loadedCount++;
        } else {
          el.outerHTML = html;
          loadedCount++;
        }
      } catch (err) {
        console.error(`❌ [ComponentLoader] Bileşen yüklenemedi: ${src}`, err);
        el.innerHTML = `<div class="p-4 text-xs text-rose border border-rose/20 rounded">⚠️ Bileşen yüklenemedi: ${src}</div>`;
      }
    }));

    return loadedCount;
  }
};

window.ComponentLoader = ComponentLoader;
