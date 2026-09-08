/**
 * Harita Tools - Global Core Utilities
 * - Toast Notification System
 * - File Downloader
 * - Resilient Clipboard Manager (with execCommand fallback for local IP)
 * - Geodetic Unit Formatters
 * - Universal Table Empty-State Renderer
 */

(function () {
  'use strict';

  /**
   * Universal Toast Notification
   * @param {string} message 
   * @param {'info'|'success'|'warning'|'error'} type 
   * @param {number} durationMs 
   */
  function showToast(message, type = 'info', durationMs = 3800) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    else if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';
    else if (type === 'error') iconClass = 'fa-solid fa-circle-xmark';

    toast.innerHTML = `
      <div class="toast-icon-wrap">
        <i class="${iconClass} toast-icon"></i>
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" title="Kapat" type="button">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="toast-progress" style="animation-duration: ${durationMs}ms;"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    let timeoutId = null;

    const hideToast = () => {
      if (toast.classList.contains('toast-hiding')) return;
      toast.classList.add('toast-hiding');
      if (timeoutId) clearTimeout(timeoutId);
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 320);
    };

    if (closeBtn) closeBtn.addEventListener('click', hideToast);
    container.appendChild(toast);
    timeoutId = setTimeout(hideToast, durationMs);
  }

  /**
   * Browser File Downloader
   * @param {string} filename 
   * @param {string|Blob} content 
   * @param {string} mimeType 
   */
  function downloadTextFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  /**
   * Resilient Clipboard Copy
   * Supports modern navigator.clipboard AND legacy execCommand fallback
   * (Essential for non-HTTPS local network IP addresses like http://192.168.x.x)
   * @param {string} text 
   * @param {string} successMsg 
   * @returns {Promise<boolean>}
   */
  async function copyToClipboard(text, successMsg = null) {
    if (typeof text !== 'string') text = String(text ?? '');
    if (!text) {
      showToast(t("core.utils.toastCopyEmpty"), 'warning');
      return false;
    }

    let copied = false;

    // 1. Try modern navigator.clipboard
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (err) {
        console.warn('[copyToClipboard] navigator.clipboard başarısız, fallback deneniyor:', err);
      }
    }

    // 2. Fallback to hidden textarea + execCommand
    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error('[copyToClipboard] Fallback kopyalama da başarısız oldu:', err);
      }
    }

    if (copied) {
      const msg = successMsg || t("core.utils.toastCopySuccess");
      showToast(msg, 'success');
      return true;
    } else {
      showToast(t("core.utils.toastCopyError"), 'error');
      return false;
    }
  }

  /**
   * Geodetic Formatters
   */
  function formatMeter(val, decimals = 3, withUnit = true) {
    if (val === null || val === undefined || isNaN(val)) return '--';
    const num = Number(val).toFixed(decimals);
    return withUnit ? `${num} m` : num;
  }

  function formatUndulation(val, decimals = 3, withUnit = true) {
    if (val === null || val === undefined || isNaN(val)) return '--';
    const sign = val >= 0 ? '+' : '';
    const num = sign + Number(val).toFixed(decimals);
    return withUnit ? `${num} m` : num;
  }

  function formatDegree(val, decimals = 6, withUnit = true) {
    if (val === null || val === undefined || isNaN(val)) return '--';
    const num = Number(val).toFixed(decimals);
    return withUnit ? `${num}°` : num;
  }

  function formatDMS(decDeg, isLat = true) {
    if (decDeg === null || decDeg === undefined || isNaN(decDeg)) return '--';
    const val = Math.abs(Number(decDeg));
    const deg = Math.floor(val);
    const minDec = (val - deg) * 60;
    const min = Math.floor(minDec);
    const sec = ((minDec - min) * 60).toFixed(4);
    const dir = isLat ? (decDeg >= 0 ? 'K' : 'G') : (decDeg >= 0 ? 'D' : 'B');
    return `${deg}° ${String(min).padStart(2, '0')}' ${String(sec).padStart(7, '0')}" ${dir}`;
  }

  /**
   * Universal Table Empty-State Renderer
   * @param {HTMLElement|string} tbody Table body element or selector ID
   * @param {number} colspan Number of columns to span
   * @param {string} message Primary guidance message
   * @param {string} icon FontAwesome icon class
   * @param {string} subMessage Optional hint
   */
  function renderTableEmptyState(tbody, colspan = 8, message = 'Henüz veri yüklenmedi.', icon = 'fa-folder-open', subMessage = 'Lütfen sol panelden bir veri dosyası seçin veya sürükleyip bırakın.') {
    const el = typeof tbody === 'string' ? document.getElementById(tbody) : tbody;
    if (!el) return;

    el.innerHTML = `
      <tr>
        <td colspan="${colspan}" class="text-center py-5">
          <div class="table-empty-state-wrap d-flex flex-col items-center justify-center gap-6 p-4">
            <div class="empty-state-icon text-cyan" style="font-size: 28px; opacity: 0.65;">
              <i class="fa-solid ${icon}"></i>
            </div>
            <div class="empty-state-msg font-bold text-main text-xs">${message}</div>
            ${subMessage ? `<div class="empty-state-sub text-dim text-2xs" style="max-width: 360px;">${subMessage}</div>` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  // Global Exports
  window.showToast = showToast;
  window.downloadTextFile = downloadTextFile;
  window.copyToClipboard = copyToClipboard;
  window.formatMeter = formatMeter;
  window.formatUndulation = formatUndulation;
  window.formatDegree = formatDegree;
  window.formatDMS = formatDMS;
  window.renderTableEmptyState = renderTableEmptyState;
})();
