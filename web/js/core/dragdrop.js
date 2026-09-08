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
   * Intelligent File Router & Handler
   * Analyzes file extensions and sniffs header text content to route to the correct workstation.
   * @param {FileList|File[]|File} files 
   */
  async function routeAndHandleStudioFiles(files) {
    if (!files) return;
    const fileList = Array.isArray(files) ? files : (files instanceof FileList ? Array.from(files) : [files]);
    if (fileList.length === 0) return;

    const firstFile = fileList[0];
    const fname = firstFile.name.toLowerCase();
    const ext = fname.split('.').pop();

    // Sniff first 2KB of text content for intelligent header-based routing
    let headerText = '';
    try {
      headerText = await firstFile.slice(0, 2048).text();
    } catch (e) {}

    // 1. RTK & Raw GNSS Data (.rw5, .raw, .jxl or GPS survey CSV/DAT)
    if (['rw5', 'raw', 'jxl'].includes(ext) || headerText.includes('GPS,PN') || headerText.includes('EP,PN') || headerText.includes('SurvCE') || headerText.includes('FieldGenius') || (ext === 'csv' && (headerText.includes('HRMS') || headerText.includes('PDOP') || headerText.includes('STATUS')))) {
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
      return;
    }

    // 2. RINEX Observation / Navigation (.obs, .rnx, .crx, .zip, .??o, .??d, .??n, .nav)
    if (['obs', 'rnx', 'crx', 'zip', 'nav'].includes(ext) || /\.\d{2}[oOdDnN]$/.test(fname) || headerText.includes('RINEX VERSION') || headerText.includes('MARKER NAME')) {
      document.querySelector('[data-tab="tab-rinex-studio"]')?.click();
      const dt = new DataTransfer();
      fileList.forEach(f => dt.items.add(f));
      const mergerInput = window.elements?.mergerFileInput || document.getElementById('mergerFileInput');
      if (mergerInput) {
        mergerInput.files = dt.files;
        mergerInput.dispatchEvent(new Event('change'));
      }
      if (window.showToast) window.showToast(t("core.dragdrop.toastRinexImported", { count: fileList.length }), 'success');
      return;
    }

    // 3. TG-20 Geoid Model (.ggf)
    if (ext === 'ggf' || headerText.includes('TG-20') || headerText.includes('TR_GEOID')) {
      document.querySelector('[data-tab="tab-tg20"]')?.click();
      if (window.state?.tg20Engine) {
        await window.state.tg20Engine.loadFromFile(firstFile);
      }
      if (window.showToast) window.showToast(t("core.dragdrop.toastTg20Loaded", { name: firstFile.name }), 'success');
      return;
    }

    // 4. Netcad .DNS (Helmert 2D Transformation)
    if (ext === 'dns' || headerText.includes('[NETCAD_DONUSUM]') || headerText.includes('HELMERT2D')) {
      document.querySelector('[data-tab="tab-geodesy"]')?.click();
      const dnsInput = document.getElementById('inputHelmertDnsFile');
      if (dnsInput) {
        const dt = new DataTransfer();
        dt.items.add(firstFile);
        dnsInput.files = dt.files;
        dnsInput.dispatchEvent(new Event('change'));
      }
      if (window.showToast) window.showToast(t("geodesy.toastDnsActivated") || "✨ Netcad .DNS parametreleri yüklendi!", 'success');
      return;
    }

    // 5. Universal Vector & CAD Formats (.ncz, .dxf, .kml, .kmz, .geojson, .json, .gpx, .ncn, .kos)
    if (['ncz', 'dxf', 'kml', 'kmz', 'geojson', 'json', 'gpx', 'ncn', 'kos'].includes(ext) || headerText.includes('kml xmlns') || (headerText.includes('SECTION') && headerText.includes('ENTITIES'))) {
      document.querySelector('[data-tab="tab-converter"]')?.click();
      const inputConv = document.getElementById('inputConverterFile');
      if (inputConv) {
        const dt = new DataTransfer();
        dt.items.add(firstFile);
        inputConv.files = dt.files;
        inputConv.dispatchEvent(new Event('change'));
      }
      if (window.showToast) window.showToast(t("core.dragdrop.toastConverterLoaded", { name: firstFile.name }), 'success');
      return;
    }

    // 6. Generic Text / CSV / XYZ Coordinate Batch
    if (['txt', 'csv', 'xyz', 'dat'].includes(ext)) {
      document.querySelector('[data-tab="tab-converter"]')?.click();
      const inputConv = document.getElementById('inputConverterFile');
      if (inputConv) {
        const dt = new DataTransfer();
        dt.items.add(firstFile);
        inputConv.files = dt.files;
        inputConv.dispatchEvent(new Event('change'));
      }
      if (window.showToast) window.showToast(t("core.dragdrop.toastConverterLoaded", { name: firstFile.name }), 'success');
      return;
    }

    // Fallback default: RTK / Cadastre
    document.querySelector('[data-tab="tab-cadastre"]')?.click();
    if (window.showToast) window.showToast(t("core.dragdrop.toastFileDetected", { name: firstFile.name }), 'info');
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
      await routeAndHandleStudioFiles(files);
    });
  }

  // Global Exports
  window.initGlobalDragAndDrop = initGlobalDragAndDrop;
  window.setupStudioDropzone = setupStudioDropzone;
  window.routeAndHandleStudioFiles = routeAndHandleStudioFiles;
})();
