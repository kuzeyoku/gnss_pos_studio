/**
 * Harita Tools - Universal Drag & Drop and Dropzone Engine
 * - Global Window Drag & Drop Overlay Router
 * - Reusable Module Dropzone Binder (setupStudioDropzone)
 */

(function () {
  'use strict';

  /**
   * Configures a unified dropzone with drag-over styling, click-to-browse, and extension validation
   * @param {HTMLElement|string} dropzoneEl Dropzone element or DOM ID
   * @param {HTMLInputElement|string|null} fileInputEl File input element or DOM ID
   * @param {Function} onFileDrop Callback function receiving (files, event)
   * @param {Object} options { allowedExtensions: string[], multiple: boolean }
   */
  function setupStudioDropzone(dropzoneEl, fileInputEl, onFileDrop, options = {}) {
    const zone = typeof dropzoneEl === 'string' ? document.getElementById(dropzoneEl) : dropzoneEl;
    const input = typeof fileInputEl === 'string' ? document.getElementById(fileInputEl) : fileInputEl;

    if (!zone) return;

    // Click to open file dialog
    if (input) {
      zone.addEventListener('click', (e) => {
        if (e.target !== input) {
          input.click();
        }
      });

      input.addEventListener('change', (e) => {
        const files = Array.from(input.files || []);
        if (files.length > 0 && typeof onFileDrop === 'function') {
          onFileDrop(options.multiple ? files : files[0], e);
        }
      });
    }

    let dragCounter = 0;

    zone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      zone.classList.add('drag-over', 'border-cyan');
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        zone.classList.remove('drag-over', 'border-cyan');
      }
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      zone.classList.remove('drag-over', 'border-cyan');

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      if (droppedFiles.length === 0) return;

      // Validate extensions if provided
      let validFiles = droppedFiles;
      if (options.allowedExtensions && Array.isArray(options.allowedExtensions)) {
        const allowed = options.allowedExtensions.map(ext => ext.toLowerCase().replace(/^\./, ''));
        validFiles = droppedFiles.filter(f => {
          const ext = f.name.split('.').pop().toLowerCase();
          return allowed.includes(ext);
        });

        if (validFiles.length === 0) {
          if (window.showToast) {
            window.showToast(t("core.dragdrop.toastUnsupported", { types: allowed.join(', .') }), 'warning');
          }
          return;
        }
      }

      // Sync with file input if available
      if (input && validFiles.length > 0) {
        const dt = new DataTransfer();
        validFiles.forEach(f => dt.items.add(f));
        input.files = dt.files;
      }

      if (typeof onFileDrop === 'function') {
        onFileDrop(options.multiple ? validFiles : validFiles[0], e);
      }
    });
  }

  /**
   * Global Window Drag & Drop Overlay Router
   */
  function initGlobalDragAndDrop() {
    const overlay = document.getElementById('globalDragOverlay');
    if (!overlay) return;

    let dragCount = 0;

    window.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCount++;
      if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
        overlay.classList.add('active');
      }
    });

    window.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCount--;
      if (dragCount <= 0) {
        dragCount = 0;
        overlay.classList.remove('active');
      }
    });

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    window.addEventListener('drop', async (e) => {
      e.preventDefault();
      dragCount = 0;
      overlay.classList.remove('active');

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const firstFile = files[0];
      const fname = firstFile.name.toLowerCase();

      // Route 1: Cadastre RTK / RW5 / Raw
      if (fname.endsWith('.rw5') || fname.endsWith('.raw') || fname.endsWith('.jxl') || (fname.endsWith('.csv') && !fname.includes('rinex'))) {
        document.querySelector('[data-tab="tab-cadastre"]')?.click();
        const dt = new DataTransfer();
        dt.items.add(firstFile);
        if (window.elements?.rw5FileInput) {
          window.elements.rw5FileInput.files = dt.files;
        }
        if (window.showToast) window.showToast(t("core.dragdrop.toastRw5Loaded", { name: firstFile.name }), 'success');
        if (typeof window.handleGnssAnalysis === 'function') {
          await window.handleGnssAnalysis();
        }
      }
      // Route 2: RINEX Studio
      else if (fname.endsWith('.obs') || fname.endsWith('.rnx') || fname.endsWith('.zip') || /\.\d{2}[oO]$/.test(fname)) {
        document.querySelector('[data-tab="tab-rinex-studio"]')?.click();
        const dt = new DataTransfer();
        Array.from(files).forEach(f => dt.items.add(f));
        if (window.elements?.mergerFileInput) {
          window.elements.mergerFileInput.files = dt.files;
          window.elements.mergerFileInput.dispatchEvent(new Event('change'));
        }
        if (window.showToast) window.showToast(t("core.dragdrop.toastRinexImported", { count: files.length }), 'success');
      }
      // Route 3: TG-20 Geoid
      else if (fname.endsWith('.ggf')) {
        document.querySelector('[data-tab="tab-tg20"]')?.click();
        if (window.state?.tg20Engine) {
          await window.state.tg20Engine.loadFromFile(firstFile);
        }
        if (window.showToast) window.showToast(t("core.dragdrop.toastTg20Loaded", { name: firstFile.name }), 'success');
      }
      // Route 4: Universal Format Converter
      else if (fname.endsWith('.ncz') || fname.endsWith('.dxf') || fname.endsWith('.kml') || fname.endsWith('.kmz') || fname.endsWith('.ncn') || fname.endsWith('.kos') || fname.endsWith('.geojson')) {
        document.querySelector('[data-tab="tab-converter"]')?.click();
        const inputConv = document.getElementById('inputConverterFile');
        if (inputConv) {
          const dt = new DataTransfer();
          dt.items.add(firstFile);
          inputConv.files = dt.files;
          inputConv.dispatchEvent(new Event('change'));
        }
        if (window.showToast) window.showToast(t("core.dragdrop.toastConverterLoaded", { name: firstFile.name }), 'success');
      }
      else {
        if (window.showToast) window.showToast(t("core.dragdrop.toastFileDetected", { name: firstFile.name }), 'info');
      }
    });
  }

  // Global Exports
  window.initGlobalDragAndDrop = initGlobalDragAndDrop;
  window.setupStudioDropzone = setupStudioDropzone;
})();
