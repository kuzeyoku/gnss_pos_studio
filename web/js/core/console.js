/**
 * Harita Tools - Live Console Dock & Progress Tracker
 */
function initConsoleControls() {
  const btnClear = document.getElementById("btnClearConsoleLog") || document.getElementById("btnClearLog");
  const btnCopy = document.getElementById("btnCopyConsoleLog") || document.getElementById("btnCopyLog");
  const btnToggle = document.getElementById("btnConsoleToggle") || document.getElementById("btnToggleDock");
  const domEl = document.getElementById("cyberConsoleDock");
  const iconToggle = document.getElementById("iconConsoleToggle") || document.getElementById("iconDockToggle");
  const textToggle = document.getElementById("textConsoleToggle") || document.getElementById("textDockToggle");

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      const logBox = document.getElementById("globalConsoleLog");
      if (logBox) {
        logBox.textContent = "[SİSTEM] Konsol temizlendi.";
      }
    });
  }
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const logBox = document.getElementById("globalConsoleLog");
      if (logBox) {
        copyToClipboard(logBox.textContent, "📋 Konsol kayıtları panoya kopyalandı.");
        const v_1 = btnCopy.innerHTML;
        btnCopy.innerHTML = "<i class=\"fa-solid fa-check text-emerald\"></i> Kopyalandı";
        setTimeout(() => {
          btnCopy.innerHTML = v_1;
        }, 1800);
      }
    });
  }
  if (btnToggle && domEl) {
    btnToggle.addEventListener("click", () => {
      domEl.classList.toggle("minimized");
      const v_1 = domEl.classList.contains("minimized");
      if (iconToggle) {
        iconToggle.className = v_1 ? "fa-solid fa-chevron-up text-xs" : "fa-solid fa-chevron-down text-xs";
      }
      if (textToggle) {
        textToggle.textContent = v_1 ? "Genişlet" : "Küçült";
      }
    });
  }
}
function logMessage(arg1) {
  const v_2 = new Date().toLocaleTimeString("tr-TR");
  elements.globalConsoleLog.textContent += "\n[" + v_2 + "] " + arg1;
  elements.globalConsoleLog.scrollTop = elements.globalConsoleLog.scrollHeight;
}
function updateProgress(arg1, arg2 = "") {
  elements.progressBarFill.style.width = arg1 + "%";
  elements.progressPercent.textContent = arg1 + "%";
  if (arg2) {
    elements.progressLabel.textContent = arg2;
  }
}

window.logMessage = logMessage;
window.updateProgress = updateProgress;
