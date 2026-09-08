/**
 * Harita Tools - RINEX Studio, Merger & PPK Inspector Controller
 */
function initMergerDropzone() {
  const v_1 = elements.mergerDropzone;
  const v_2 = elements.mergerFileInput;
  ["dragenter", "dragover"].forEach(item => {
    v_1.addEventListener(item, event => {
      event.preventDefault();
      v_1.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(item => {
    v_1.addEventListener(item, event => {
      event.preventDefault();
      v_1.classList.remove("dragover");
    });
  });
  v_1.addEventListener("drop", event => {
    const v_1_1 = Array.from(event.dataTransfer.files);
    if (v_1_1.length > 0) {
      processUploadedFiles(v_1_1);
    }
  });
  v_2.addEventListener("change", event => {
    const v_1_1 = Array.from(event.target.files);
    if (v_1_1.length > 0) {
      processUploadedFiles(v_1_1);
    }
  });
  elements.btnMergeAll.addEventListener("click", mergeAllGroups);
  let v_3 = null;
  let v_4 = null;
  const inputEl = document.getElementById("inputPpkBaseFile");
  const inputEl_1 = document.getElementById("inputPpkRoverFile");
  const domEl = document.getElementById("txtPpkBaseFileName");
  const domEl_1 = document.getElementById("txtPpkRoverFileName");
  async function v_5() {
    if (!v_3 || !v_4) {
      return;
    }
    try {
      const v_1_1 = UniversalRinexInspector.inspectPpkOverlap(v_3, v_4);
      const domEl_2 = document.getElementById("ppkAnalysisResultWrapper");
      if (!domEl_2) {
        return;
      }
      document.getElementById("statPpkBaseTime").textContent = v_1_1.baseStartStr + " - " + v_1_1.baseEndStr + " (" + v_1_1.baseDurationStr + ")";
      document.getElementById("statPpkRoverTime").textContent = v_1_1.roverStartStr + " - " + v_1_1.roverEndStr + " (" + v_1_1.roverDurationStr + ")";
      document.getElementById("statPpkOverlapDuration").textContent = v_1_1.overlapDurationStr;
      document.getElementById("statPpkBaselineDist").textContent = v_1_1.baselineKm > 0 ? v_1_1.baselineKm.toFixed(2) + " km" : "Anten XYZ Yok";
      document.getElementById("statPpkCommonSystems").textContent = v_1_1.commonConstellations.length > 0 ? v_1_1.commonConstellations.join(" + ") : "Ortak Sistem Yok";
      const domEl_3 = document.getElementById("badgePpkOverlapPercent");
      if (domEl_3) {
        domEl_3.textContent = "%" + v_1_1.overlapPercent.toFixed(1) + " Kapsama";
        domEl_3.style.background = v_1_1.overlapPercent >= 99.5 ? "rgba(16, 185, 129, 0.25)" : v_1_1.overlapPercent >= 70 ? "rgba(245, 158, 11, 0.25)" : "rgba(244, 63, 94, 0.25)";
        domEl_3.style.color = v_1_1.overlapPercent >= 99.5 ? "var(--emerald-400)" : v_1_1.overlapPercent >= 70 ? "var(--amber-400)" : "var(--rose-400)";
      }
      const domEl_4 = document.getElementById("bannerPpkStatus");
      const domEl_5 = document.getElementById("iconPpkStatus");
      const domEl_6 = document.getElementById("titlePpkStatus");
      const domEl_7 = document.getElementById("descPpkStatus");
      if (domEl_4) {
        domEl_4.style.borderColor = v_1_1.statusLevel === "SUCCESS" ? "rgba(16, 185, 129, 0.5)" : v_1_1.statusLevel === "WARNING" ? "rgba(245, 158, 11, 0.5)" : "rgba(244, 63, 94, 0.5)";
        domEl_4.style.background = v_1_1.statusLevel === "SUCCESS" ? "rgba(16, 185, 129, 0.1)" : v_1_1.statusLevel === "WARNING" ? "rgba(245, 158, 11, 0.1)" : "rgba(244, 63, 94, 0.1)";
      }
      if (domEl_5) {
        domEl_5.className = v_1_1.statusLevel === "SUCCESS" ? "fa-solid fa-circle-check" : v_1_1.statusLevel === "WARNING" ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-circle-xmark";
        domEl_5.style.color = v_1_1.statusLevel === "SUCCESS" ? "var(--emerald-400)" : v_1_1.statusLevel === "WARNING" ? "var(--amber-400)" : "var(--rose-400)";
      }
      if (domEl_6) {
        domEl_6.textContent = v_1_1.statusTitle;
      }
      if (domEl_7) {
        domEl_7.textContent = v_1_1.statusDesc;
      }
      const domEl_8 = document.getElementById("barPpkBase");
      const domEl_9 = document.getElementById("barPpkRover");
      if (domEl_8 && domEl_9) {
        domEl_8.style.marginLeft = v_1_1.timeline.baseLeft + "%";
        domEl_8.style.width = v_1_1.timeline.baseWidth + "%";
        domEl_9.style.left = v_1_1.timeline.roverLeft + "%";
        domEl_9.style.width = v_1_1.timeline.roverWidth + "%";
        domEl_9.style.background = v_1_1.overlapPercent >= 99.5 ? "var(--emerald-400)" : v_1_1.overlapPercent >= 70 ? "var(--amber-400)" : "var(--rose-400)";
      }
      domEl_2.style.display = "flex";
      logMessage("🛰️ [PPK ANALİZİ] Gezici-Sabit Kapsaması: %" + v_1_1.overlapPercent.toFixed(1) + " | Baz: " + v_1_1.baselineKm.toFixed(2) + " km | Ortak: " + v_1_1.commonConstellations.join(", "));
      showToast(t("rinex.toastPpkCoverage", { percent: v_1_1.overlapPercent.toFixed(1) }), v_1_1.overlapPercent >= 99 ? "success" : "warning");
    } catch (v_1_1) {
      logMessage("❌ [PPK ANALİZ HATA] " + (v_1_1.message || v_1_1));
      showToast(t("rinex.toastPpkError", { err: v_1_1.message }), "error");
    }
  }
  inputEl?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.slice(0, 30000).text();
      v_3 = UniversalRinexInspector.inspectRinexHeader(v_1_1, v_2_1.name);
      if (domEl) {
        domEl.innerHTML = "<span style=\"color: var(--cyan-400); font-weight:700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size:10px;\">" + (v_3.markerName || t("rinex.badgeBase")) + "</span>";
      }
      logMessage(t("rinex.logBaseLoaded", { name: v_2_1.name, marker: v_3.markerName || "BASE" }));
      if (v_4) {
        v_5();
      }
    }
  });
  inputEl_1?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.slice(0, 30000).text();
      v_4 = UniversalRinexInspector.inspectRinexHeader(v_1_1, v_2_1.name);
      if (domEl_1) {
        domEl_1.innerHTML = "<span style=\"color: var(--emerald-400); font-weight:700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size:10px;\">" + (v_4.markerName || t("rinex.badgeRover")) + "</span>";
      }
      logMessage(t("rinex.logRoverLoaded", { name: v_2_1.name, marker: v_4.markerName || "ROVER" }));
      if (v_3) {
        v_5();
      }
    }
  });
}
async function processUploadedFiles(arg1) {
  logMessage("📂 " + arg1.length + " adet dosyanın RINEX başlıkları (Header) RAM'de taranıyor...");
  updateProgress(10, "Dosya başlıkları taranıyor...");
  state.mergerGroups = {};
  const obj = {
    constellations: new Set(),
    bands: new Set(),
    obsTypes: new Set()
  };
  for (let v_1 of arg1) {
    const headBlob = v_1.slice(0, 65536);
    const tailBlob = v_1.size > 65536 ? v_1.slice(Math.max(0, v_1.size - 65536)) : null;

    const readBlob = (blob) => new Promise(resolve => {
      if (!blob) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => resolve("");
      reader.readAsText(blob);
    });

    const headText = await readBlob(headBlob);
    const tailText = await readBlob(tailBlob);

    const v_3_1 = UniversalRinexInspector.inspectRinexHeader(headText, v_1.name, tailText);
    v_3_1.presentConstellations.forEach(item => obj.constellations.add(item));
    v_3_1.presentBands.forEach(item => obj.bands.add(item));
    v_3_1.presentObsTypes.forEach(item => obj.obsTypes.add(item));
    const v_4 = v_3_1.markerName || v_1.name.replace(/\.[^/.]+$/, "").toUpperCase();
    const v_5 = v_3_1.year;
    const v_6 = v_3_1.doy;
    const v_7 = v_4 + "_" + v_5 + "_DOY" + String(v_6).padStart(3, "0");
    if (!state.mergerGroups[v_7]) {
      state.mergerGroups[v_7] = {
        id: v_7,
        station: v_4,
        year: v_5,
        doy: v_6,
        version: v_3_1.version,
        obsFiles: [],
        navGpsFiles: [],
        navGloFiles: []
      };
    }
    const v_8 = state.mergerGroups[v_7];
    const obj_1 = {
      name: v_1.name,
      size: v_1.size,
      fileRef: v_1,
      inspected: v_3_1
    };
    if (v_3_1.fileType === "OBS") {
      v_8.obsFiles.push(obj_1);
    } else if (v_3_1.fileType === "NAV_GPS" || v_3_1.fileType === "NAV_MIXED") {
      v_8.navGpsFiles.push(obj_1);
    } else if (v_3_1.fileType === "NAV_GLO") {
      v_8.navGloFiles.push(obj_1);
    } else {
      const v_1_2 = (v_1.name.split(".").pop() || "").toUpperCase();
      if (v_1_2.endsWith("O") || v_1_2 === "OBS" || v_1_2 === "RNX") {
        v_8.obsFiles.push(obj_1);
      } else if (v_1_2.endsWith("N") || v_1_2 === "NAV") {
        v_8.navGpsFiles.push(obj_1);
      } else if (v_1_2.endsWith("G") || v_1_2 === "GLO") {
        v_8.navGloFiles.push(obj_1);
      }
    }
  }
  const v_2 = Object.keys(state.mergerGroups);
  if (v_2.length === 0) {
    logMessage("⚠️ Uygun RINEX gözlem veya navigasyon dosyası tespit edilemedi.");
    updateProgress(0, "Hazır");
    return;
  }
  const v_3 = state.mergerGroups[v_2[0]];
  if (v_3 && v_3.year) {
    const domEl = document.getElementById("selectTargetVersion");
    if (domEl) {
      populateDynamicFormats(domEl.value, v_3.year);
    }
  }
  let minStartTimestamp = Infinity;
  let maxEndTimestamp = -Infinity;
  let detectedDateStr = "";
  let startFormattedTime = "00:00:00";
  let endFormattedTime = "23:59:59";
  let startSecOfDay = 0;
  let endSecOfDay = 86399;

  for (let grpKey in state.mergerGroups) {
    const grp = state.mergerGroups[grpKey];
    for (let f of grp.obsFiles) {
      if (f.inspected) {
        const first = f.inspected.firstObs;
        const last = f.inspected.lastObs;
        if (first && first.timestamp) {
          if (first.timestamp < minStartTimestamp) {
            minStartTimestamp = first.timestamp;
            detectedDateStr = first.dateStr || `${first.year}-${String(first.month).padStart(2, "0")}-${String(first.day).padStart(2, "0")}`;
            startFormattedTime = `${String(first.hour).padStart(2, "0")}:${String(first.minute).padStart(2, "0")}:${String(Math.floor(first.second)).padStart(2, "0")}`;
            startSecOfDay = first.hour * 3600 + first.minute * 60 + Math.floor(first.second);
          }
        }
        if (last && last.timestamp) {
          if (last.timestamp > maxEndTimestamp) {
            maxEndTimestamp = last.timestamp;
            endFormattedTime = `${String(last.hour).padStart(2, "0")}:${String(last.minute).padStart(2, "0")}:${String(Math.floor(last.second)).padStart(2, "0")}`;
            endSecOfDay = last.hour * 3600 + last.minute * 60 + Math.floor(last.second);
          }
        }
      }
    }
  }

  if (minStartTimestamp !== Infinity && maxEndTimestamp !== -Infinity && maxEndTimestamp >= minStartTimestamp) {
    state.detectedTimeWindow = {
      date: detectedDateStr,
      startSec: startSecOfDay,
      endSec: endSecOfDay,
      startTimestamp: minStartTimestamp,
      endTimestamp: maxEndTimestamp
    };

    const totalDurationSec = Math.max(0, Math.round((maxEndTimestamp - minStartTimestamp) / 1000));
    const hours = Math.floor(totalDurationSec / 3600);
    const remMinutes = Math.floor((totalDurationSec % 3600) / 60);
    const remSeconds = totalDurationSec % 60;

    let durationText = "";
    if (hours > 0) {
      durationText = `${hours} ${t("rinex.unitHour")} ${remMinutes} ${t("rinex.unitMinute")}` + (remSeconds > 0 ? ` ${remSeconds} ${t("rinex.unitSecond")}` : "");
    } else if (remMinutes > 0) {
      durationText = `${remMinutes} ${t("rinex.unitMinute")}` + (remSeconds > 0 ? ` ${remSeconds} ${t("rinex.unitSecond")}` : "");
    } else {
      durationText = `${remSeconds} ${t("rinex.unitSecond")}`;
    }

    const domEl = document.getElementById("lblDetectedDate");
    if (domEl) {
      domEl.textContent = t("rinex.labelDate", { date: detectedDateStr });
    }
    const domEl_1 = document.getElementById("lblDetectedTimeRange");
    if (domEl_1) {
      domEl_1.textContent = startFormattedTime + " - " + endFormattedTime + " UTC";
    }
    const domEl_2 = document.getElementById("lblDetectedDuration");
    if (domEl_2) {
      domEl_2.textContent = durationText + ` (${(totalDurationSec / 3600).toFixed(2)} ${t("rinex.unitHour")})`;
    }
    const inputEl = document.getElementById("inputCropStart");
    if (inputEl) {
      inputEl.value = startFormattedTime;
    }
    const inputEl_1 = document.getElementById("inputCropEnd");
    if (inputEl_1) {
      inputEl_1.value = endFormattedTime;
    }
  }
  logMessage("✅ " + v_2.length + " istasyon oturumu, " + obj.constellations.size + " uydu sistemi dosyadan tespit edildi.");
  renderDynamicFilters(obj);
  renderGroupsTable();
  updateProgress(100, "Tarama Tamamlandı");
  elements.mergerResultCard.style.display = "block";
}
function renderDynamicFilters(arg1) {
  const domEl = document.getElementById("containerConstellations");
  const domEl_1 = document.getElementById("containerBands");
  const domEl_2 = document.getElementById("containerObsTypes");
  const obj = {
    GPS: {
      label: "🇺🇸 GPS (G)",
      color: "var(--cyan-500)"
    },
    GLO: {
      label: "🇷🇺 GLONASS (R)",
      color: "var(--cyan-500)"
    },
    GAL: {
      label: "🇪🇺 GALILEO (E)",
      color: "var(--cyan-500)"
    },
    BDS: {
      label: "🇨🇳 BEIDOU (C)",
      color: "var(--cyan-500)"
    },
    QZS: {
      label: "🇯🇵 QZSS (J)",
      color: "var(--cyan-500)"
    },
    SBS: {
      label: "🛰️ SBAS (S)",
      color: "var(--cyan-500)"
    }
  };
  const obj_1 = {
    L1: {
      label: "📶 L1 / E1 / B1 (1575 MHz)",
      color: "var(--purple-500)"
    },
    L2: {
      label: "📶 L2 / G2 / B2 (1227 MHz)",
      color: "var(--purple-500)"
    },
    L5: {
      label: "📶 L5 / E5a / B2a (1176 MHz)",
      color: "var(--purple-500)"
    },
    E6: {
      label: "📶 E6 / B3 (1278 MHz)",
      color: "var(--purple-500)"
    }
  };
  const obj_2 = {
    Phase: {
      label: "📡 Taşıyıcı Faz (L)",
      color: "var(--emerald-400)"
    },
    Code: {
      label: "🎯 Kod / Mesafe (C / P)",
      color: "var(--emerald-400)"
    },
    Doppler: {
      label: "🔊 Doppler (D)",
      color: "var(--emerald-400)"
    },
    SNR: {
      label: "📶 SNR Sinyal Gücü (S)",
      color: "var(--emerald-400)"
    }
  };
  if (domEl) {
    domEl.innerHTML = "";
    if (arg1.constellations.size === 0) {
      arg1.constellations.add("GPS");
    }
    arg1.constellations.forEach(item => {
      const v_1 = obj[item] || {
        label: item,
        color: "var(--cyan-500)"
      };
      const labelEl = document.createElement("label");
      labelEl.className = "rinex-filter-chip";
      labelEl.innerHTML = "<input type=\"checkbox\" class=\"chk-dynamic-const\" data-const=\"" + item + "\" checked style=\"accent-color: " + v_1.color + ";\" /> <span>" + v_1.label + "</span>";
      domEl.appendChild(labelEl);
    });
  }
  if (domEl_1) {
    domEl_1.innerHTML = "";
    if (arg1.bands.size === 0) {
      arg1.bands.add("L1");
      arg1.bands.add("L2");
    }
    arg1.bands.forEach(item => {
      const v_1 = obj_1[item] || {
        label: item,
        color: "var(--purple-500)"
      };
      const labelEl = document.createElement("label");
      labelEl.className = "rinex-filter-chip";
      labelEl.innerHTML = "<input type=\"checkbox\" class=\"chk-dynamic-band\" data-band=\"" + item + "\" checked style=\"accent-color: " + v_1.color + ";\" /> <span>" + v_1.label + "</span>";
      domEl_1.appendChild(labelEl);
    });
  }
  if (domEl_2) {
    domEl_2.innerHTML = "";
    if (arg1.obsTypes.size === 0) {
      arg1.obsTypes.add("Phase");
      arg1.obsTypes.add("Code");
      arg1.obsTypes.add("SNR");
    }
    arg1.obsTypes.forEach(item => {
      const v_1 = obj_2[item] || {
        label: item,
        color: "var(--emerald-400)"
      };
      const labelEl = document.createElement("label");
      labelEl.className = "rinex-filter-chip";
      labelEl.innerHTML = "<input type=\"checkbox\" class=\"chk-dynamic-obs\" data-obs=\"" + item + "\" checked style=\"accent-color: " + v_1.color + ";\" /> <span>" + v_1.label + "</span>";
      domEl_2.appendChild(labelEl);
    });
  }
}
function renderGroupsTable() {
  const v_1 = elements.tableGroupsBody;
  v_1.innerHTML = "";
  for (let v_1_1 in state.mergerGroups) {
    const v_1_2 = state.mergerGroups[v_1_1];
    const trEl = document.createElement("tr");
    trEl.innerHTML = "\n            <td class=\"font-bold text-main font-mono\">\n              <i class=\"fa-solid fa-layer-group\" style=\"color: var(--cyan-400); margin-right: 6px;\"></i> " + v_1_2.id + "\n            </td>\n            <td style=\"font-weight: 800; color: var(--cyan-400); font-size: 13px;\">" + v_1_2.station + "</td>\n            <td><span class=\"badge-year-chip\">" + v_1_2.year + "</span></td>\n            <td><span style=\"background: rgba(139, 92, 246, 0.15); color: var(--purple-500); border: 1px solid var(--border-purple-glow); padding: 2px 8px; border-radius: 6px; font-weight: 700; font-family: var(--font-mono);\">DOY " + String(v_1_2.doy).padStart(3, "0") + "</span></td>\n            <td><span style=\"background: rgba(6, 182, 212, 0.15); color: var(--cyan-400); border: 1px solid var(--border-cyan-glow); padding: 3px 10px; border-radius: 20px; font-weight: 700;\">📁 " + t("rinex.unitHourFile", { count: v_1_2.obsFiles.length }) + "</span></td>\n            <td><span style=\"background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); border: 1px solid var(--glow-emerald); padding: 3px 10px; border-radius: 20px; font-weight: 700;\">🛰️ " + t("rinex.unitFile", { count: v_1_2.navGpsFiles.length }) + "</span></td>\n            <td><span style=\"background: rgba(245, 158, 11, 0.15); color: var(--amber-400); border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 10px; border-radius: 20px; font-weight: 700;\">📡 " + t("rinex.unitFile", { count: v_1_2.navGloFiles.length }) + "</span></td>\n            <td>\n                <button class=\"btn btn-primary\" style=\"padding: 6px 14px; font-size: 12px;\" onclick=\"mergeSingleGroup('" + v_1_1 + "')\">\n                    <i class=\"fa-solid fa-bolt\"></i> " + t("rinex.btnProcessDownload") + "\n                </button>\n            </td>\n        ";
    v_1.appendChild(trEl);
  }
}
window.applyCropPreset = function (arg1) {
  if (!state.detectedTimeWindow) {
    return;
  }
  const {
    startSec: v_2,
    endSec: v_3
  } = state.detectedTimeWindow;
  const inputEl = document.getElementById("inputCropStart");
  const inputEl_1 = document.getElementById("inputCropEnd");
  const domEl = document.getElementById("chkEnableTimeCrop");
  const domEl_1 = document.getElementById("timeCropControlsContainer");
  const domEl_2 = document.getElementById("lblTimeCropStatusText");
  const v_4 = arg1_1 => {
    const v_2_1 = String(Math.floor(arg1_1 / 3600)).padStart(2, "0");
    const v_3_1 = String(Math.floor(arg1_1 % 3600 / 60)).padStart(2, "0");
    const v_4_1 = String(Math.floor(arg1_1 % 60)).padStart(2, "0");
    return v_2_1 + ":" + v_3_1 + ":" + v_4_1;
  };
  if (arg1 === "ALL") {
    inputEl.value = v_4(v_2);
    inputEl_1.value = v_4(v_3);
    if (domEl) {
      domEl.checked = false;
      if (domEl_1) {
        domEl_1.classList.remove("time-crop-enabled");
        domEl_1.classList.add("time-crop-disabled");
      }
      if (domEl_2) {
        domEl_2.textContent = t("rinex.filterDisabled");
        domEl_2.style.color = "var(--text-dim)";
      }
    }
  } else {
    if (domEl) {
      domEl.checked = true;
      if (domEl_1) {
        domEl_1.classList.remove("time-crop-disabled");
        domEl_1.classList.add("time-crop-enabled");
      }
      if (domEl_2) {
        domEl_2.textContent = t("rinex.filterActive");
        domEl_2.style.color = "var(--cyan-400)";
      }
    }
    if (arg1 === "FIRST_1H") {
      inputEl.value = v_4(v_2);
      inputEl_1.value = v_4(Math.min(v_3, v_2 + 3600));
    } else if (arg1 === "FIRST_2H") {
      inputEl.value = v_4(v_2);
      inputEl_1.value = v_4(Math.min(v_3, v_2 + 7200));
    } else if (arg1 === "LAST_2H") {
      inputEl.value = v_4(Math.max(v_2, v_3 - 7200));
      inputEl_1.value = v_4(v_3);
    }
  }
};
const chkEnableTimeCrop = document.getElementById("chkEnableTimeCrop");
const timeCropControlsContainer = document.getElementById("timeCropControlsContainer");
const lblTimeCropStatusText = document.getElementById("lblTimeCropStatusText");
if (chkEnableTimeCrop && timeCropControlsContainer) {
  chkEnableTimeCrop.addEventListener("change", () => {
    if (chkEnableTimeCrop.checked) {
      timeCropControlsContainer.classList.remove("time-crop-disabled");
      timeCropControlsContainer.classList.add("time-crop-enabled");
      if (lblTimeCropStatusText) {
        lblTimeCropStatusText.textContent = t("rinex.filterActive");
        lblTimeCropStatusText.style.color = "var(--cyan-400)";
      }
    } else {
      timeCropControlsContainer.classList.remove("time-crop-enabled");
      timeCropControlsContainer.classList.add("time-crop-disabled");
      if (lblTimeCropStatusText) {
        lblTimeCropStatusText.textContent = t("rinex.filterDisabled");
        lblTimeCropStatusText.style.color = "var(--text-dim)";
      }
    }
  });
}
function createSafeRinexWorker() {
  if (window.location.protocol === "file:") {
    return {
      postMessage: function (arg1) {
        if (arg1.action === "MERGE_GROUP") {
          setTimeout(() => {
            RinexMergerEngine.processGroup(arg1.group, arg1_1 => {
              if (this.onmessage) {
                this.onmessage({
                  data: arg1_1
                });
              }
            });
          }, 20);
        }
      },
      terminate: function () {},
      onmessage: null
    };
  }
  try {
    return new Worker("js/workers/rinex_merger_worker.js");
  } catch (v_1) {
    console.warn("Worker initialization blocked by browser file:// security, falling back to direct RAM execution:", v_1);
    return {
      postMessage: function (arg1) {
        if (arg1.action === "MERGE_GROUP") {
          setTimeout(() => {
            RinexMergerEngine.processGroup(arg1.group, arg1_1 => {
              if (this.onmessage) {
                this.onmessage({
                  data: arg1_1
                });
              }
            });
          }, 20);
        }
      },
      terminate: function () {},
      onmessage: null
    };
  }
}
window.mergeSingleGroup = async function (arg1) {
  const v_2 = state.mergerGroups[arg1];
  if (!v_2) {
    return;
  }
  const v_3 = document.getElementById("selectTargetVersion")?.value || "RINEX_211";
  const v_4 = document.getElementById("selectTargetFormat")?.value || "OBS_ONLY";
  const v_5 = parseInt(document.getElementById("selectDecimationStep")?.value) || 1;
  const obj = {};
  document.querySelectorAll(".chk-dynamic-const").forEach(item => {
    obj[item.dataset.const] = item.checked;
  });
  state.rinexEngine.setConstellations(obj);
  const obj_1 = {};
  document.querySelectorAll(".chk-dynamic-band").forEach(item => {
    obj_1[item.dataset.band] = item.checked;
  });
  state.rinexEngine.setBands(obj_1);
  const obj_2 = {};
  document.querySelectorAll(".chk-dynamic-obs").forEach(item => {
    obj_2[item.dataset.obs] = item.checked;
  });
  state.rinexEngine.setObsTypes(obj_2);
  const v_6 = document.getElementById("chkEnableTimeCrop")?.checked ?? false;
  let v_7 = null;
  let v_8 = null;
  if (v_6) {
    const v_1 = document.getElementById("inputCropStart")?.value || "00:00:00";
    const v_2_1 = v_1.split(":").map(Number);
    v_7 = (v_2_1[0] || 0) * 3600 + (v_2_1[1] || 0) * 60 + (v_2_1[2] || 0);
    const v_3_1 = document.getElementById("inputCropEnd")?.value || "23:59:59";
    const v_4_1 = v_3_1.split(":").map(Number);
    v_8 = (v_4_1[0] || 0) * 3600 + (v_4_1[1] || 0) * 60 + (v_4_1[2] || 0);
  }
  let str = "2.11";
  let flag = false;
  if (v_3 === "RINEX_210") {
    str = "2.10";
  } else if (v_3 === "RINEX_211") {
    str = "2.11";
  } else if (v_3 === "RINEX_300") {
    str = "3.00";
    flag = true;
  } else if (v_3 === "RINEX_302") {
    str = "3.02";
    flag = true;
  } else if (v_3 === "RINEX_303") {
    str = "3.03";
    flag = true;
  } else if (v_3 === "RINEX_304") {
    str = "3.04";
    flag = true;
  } else if (v_3 === "RINEX_305") {
    str = "3.05";
    flag = true;
  } else if (v_3 === "RINEX_400") {
    str = "4.00";
    flag = true;
  }
  const v_9 = Object.keys(obj).filter(item => obj[item]).join("/");
  logMessage("🚀 '" + arg1 + "' grubu işleniyor | Sistemler: " + (v_9 || "Tümü") + " | Sürüm: " + v_3 + " | Format: " + v_4 + " | Örnekleme: " + v_5 + "s...");
  updateProgress(15, "İçerikler okunuyor...");
  const v_10 = arg1_1 => {
    return new Promise((arg1_2, arg2) => {
      const v_3_1 = new FileReader();
      v_3_1.onload = () => arg1_2({
        name: arg1_1.name,
        text: v_3_1.result
      });
      v_3_1.onerror = arg2;
      v_3_1.readAsText(arg1_1.fileRef);
    });
  };
  const v_11 = await Promise.all(v_2.obsFiles.map(v_10));
  const v_12 = await Promise.all(v_2.navGpsFiles.map(v_10));
  const v_13 = await Promise.all(v_2.navGloFiles.map(v_10));
  const obj_3 = {
    id: v_2.id,
    station: v_2.station,
    year: v_2.year,
    doy: v_2.doy,
    targetVersion: str,
    decimation: v_5,
    allowedConstellations: obj,
    timeCrop: {
      enabled: v_6,
      startSec: v_7,
      endSec: v_8
    },
    obsFiles: v_11,
    navGpsFiles: v_12,
    navGloFiles: v_13
  };
  const v_14 = createSafeRinexWorker();
  v_14.postMessage({
    action: "MERGE_GROUP",
    group: obj_3
  });
  v_14.onmessage = async arg1_1 => {
    const {
      type: v_2_1,
      text: v_3_1,
      value: v_4_1,
      results: v_5_1,
      message: v_6_1
    } = arg1_1.data;
    if (v_2_1 === "LOG") {
      logMessage(v_3_1);
    }
    if (v_2_1 === "PROGRESS") {
      updateProgress(v_4_1, "İşleniyor...");
    }
    if (v_2_1 === "COMPLETE") {
      logMessage("🎉 [BAŞARILI] '" + arg1 + "' grubu başarıyla tamamlandı!");
      state.currentMergedFiles[arg1] = v_5_1;
      const v_1 = "" + v_2.station + String(v_2.doy).padStart(3, "0") + "0";
      if (v_3 === "RINEX_211" || v_3 === "RINEX_210") {
        if (v_4 === "OBS_YYO") {
          if (v_5_1.obs) {
            downloadTextFile(v_5_1.obs.filename, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.obs.filename + " (RINEX " + str + " Yıl Uzantılı Gözlem).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.obs.filename }), "success");
          } else {
            showToast(t("rinex.toastObsNotFound"), "warning");
          }
        } else if (v_4 === "OBS_EXT") {
          if (v_5_1.obs) {
            const v_1_1 = v_1 + ".obs";
            downloadTextFile(v_1_1, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_1 + " (RINEX " + str + " .OBS Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_1 }), "success");
          } else {
            showToast(t("rinex.toastObsNotFound"), "warning");
          }
        } else if (v_4 === "NAV_YYN") {
          if (v_5_1.navGps) {
            downloadTextFile(v_5_1.navGps.filename, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.navGps.filename + " (GPS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.navGps.filename }), "success");
          } else {
            showToast(t("rinex.toastGpsNavNotFound"), "warning");
          }
        } else if (v_4 === "NAV_EXT") {
          if (v_5_1.navGps) {
            const v_1_1 = v_1 + ".nav";
            downloadTextFile(v_1_1, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_1 + " (.NAV GPS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_1 }), "success");
          } else {
            showToast(t("rinex.toastGpsNavNotFound"), "warning");
          }
        } else if (v_4 === "NAV_YYG") {
          if (v_5_1.navGlo) {
            downloadTextFile(v_5_1.navGlo.filename, v_5_1.navGlo.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.navGlo.filename + " (GLONASS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.navGlo.filename }), "success");
          } else {
            showToast(t("rinex.toastGloNavNotFound"), "warning");
          }
        } else if (v_4 === "HATANAKA_YYD") {
          if (v_5_1.obs) {
            const v_1_1 = v_5_1.obs.filename.replace(/O$/i, "D");
            downloadTextFile(v_1_1, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_1 + " (Hatanaka Compact RINEX ." + String(v_2.year % 100).padStart(2, "0") + "d).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_1 }), "success");
          }
        } else {
          downloadGroupZip(arg1, v_5_1);
          showToast(t("rinex.toastZipPrepared", { name: arg1 }), "success");
        }
      } else if (flag) {
        const v_1_1 = v_2.station + "00TUR_R_" + v_2.year + String(v_2.doy).padStart(3, "0") + "0000_01D_" + v_5 + "S_MO.rnx";
        if (v_4 === "OBS_YYO") {
          if (v_5_1.obs) {
            downloadTextFile(v_5_1.obs.filename, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.obs.filename + " (RINEX " + str + " 8.3 Gözlem Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.obs.filename }), "success");
          } else {
            showToast(t("rinex.toastObsNotFound"), "warning");
          }
        } else if (v_4 === "OBS_EXT") {
          if (v_5_1.obs) {
            const v_1_2 = v_1 + ".obs";
            downloadTextFile(v_1_2, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (RINEX " + str + " .OBS Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          } else {
            showToast(t("rinex.toastObsNotFound"), "warning");
          }
        } else if (v_4 === "RNX_OBS") {
          if (v_5_1.obs) {
            downloadTextFile(v_1_1, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_1 + " (Modern Multi-GNSS RINEX " + str + ").");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_1 }), "success");
          }
        } else if (v_4 === "NAV_YYN") {
          if (v_5_1.navGps) {
            downloadTextFile(v_5_1.navGps.filename, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.navGps.filename + " (GPS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.navGps.filename }), "success");
          } else {
            showToast(t("rinex.toastGpsNavNotFound"), "warning");
          }
        } else if (v_4 === "NAV_EXT") {
          if (v_5_1.navGps) {
            const v_1_2 = v_1 + ".nav";
            downloadTextFile(v_1_2, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (.NAV GPS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          } else {
            showToast(t("rinex.toastGpsNavNotFound"), "warning");
          }
        } else if (v_4 === "NAV_YYG") {
          if (v_5_1.navGlo) {
            downloadTextFile(v_5_1.navGlo.filename, v_5_1.navGlo.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.navGlo.filename + " (GLONASS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.navGlo.filename }), "success");
          } else {
            showToast(t("rinex.toastGloNavNotFound"), "warning");
          }
        } else if (v_4 === "RNX_NAV_MIX") {
          if (v_5_1.navGps) {
            const v_1_2 = v_2.station + "00TUR_R_" + v_2.year + String(v_2.doy).padStart(3, "0") + "0000_01D_MN.rnx";
            downloadTextFile(v_1_2, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (Multi-GNSS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          }
        } else if (v_4 === "HATANAKA_YYD") {
          if (v_5_1.obs) {
            const v_1_2 = v_5_1.obs.filename.replace(/O$/i, "D");
            downloadTextFile(v_1_2, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (Hatanaka Compact RINEX ." + String(v_2.year % 100).padStart(2, "0") + "d).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          }
        } else if (v_4 === "HATANAKA_CRX") {
          const v_1_2 = v_1_1.replace(/\.rnx$/i, ".crx");
          if (v_5_1.obs) {
            downloadTextFile(v_1_2, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (Compact RINEX Multi-GNSS .crx).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          }
        } else {
          downloadGroupZip(arg1, v_5_1);
          showToast(t("rinex.toastMultiGnssZipPrepared", { name: arg1 }), "success");
        }
      }
      v_14.terminate();
    }
    if (v_2_1 === "ERROR") {
      logMessage("❌ [HATA] " + v_6_1);
      v_14.terminate();
    }
  };
};
async function runSppOnMergedResults(arg1, arg2, arg3, arg4, arg5) {
  const v_6 = new Worker("js/workers/pos_worker.js");
  v_6.postMessage({
    action: "PROCESS_SPP",
    obsText: arg2,
    navText: arg3,
    stepSeconds: arg4,
    obsFileName: arg1 + ".obs",
    navFileName: arg1 + ".nav"
  });
  v_6.onmessage = arg1_1 => {
    const {
      type: v_2,
      text: v_3,
      value: v_4,
      solutions: v_5,
      posText: v_6_1,
      csvText: v_7,
      summary: v_8,
      message: v_9
    } = arg1_1.data;
    if (v_2 === "LOG") {
      logMessage(v_3);
    }
    if (v_2 === "PROGRESS") {
      updateProgress(v_4, "SPP Hesaplanıyor...");
    }
    if (v_2 === "SPP_COMPLETE") {
      state.posSolutions = v_5;
      state.posText = v_6_1;
      state.csvText = v_7;
      logMessage("✨ [BAŞARILI] " + v_8.totalEpochs + " epoch için hassas konum çözümü üretildi!");
      logMessage("[KONUM] Enlem: " + v_8.avgLat.toFixed(8) + "° | Boylam: " + v_8.avgLon.toFixed(8) + "° | Kot: " + v_8.avgHeight.toFixed(3) + " m");
      if (arg5 === "NMEA_0183") {
        const v_1 = state.rinexEngine.generateNmeaLog(v_5);
        downloadTextFile(arg1 + ".nmea", v_1);
        logMessage("💾 [İNDİRİLDİ] " + arg1 + ".nmea (NMEA-0183 Telemetri Logu).");
      } else if (arg5 === "CSV_TELEMETRY") {
        downloadTextFile(arg1 + ".csv", v_7);
        logMessage("💾 [İNDİRİLDİ] " + arg1 + ".csv (Konum Tablosu).");
      } else {
        downloadTextFile(arg1 + ".pos", v_6_1);
        logMessage("💾 [İNDİRİLDİ] " + arg1 + ".pos (RTKLIB Hassas Çözüm Dosyası).");
      }
      v_6.terminate();
    }
    if (v_2 === "ERROR") {
      logMessage("❌ [HATA] " + v_9);
      v_6.terminate();
    }
  };
}
async function mergeAllGroups() {
  for (let v_1 in state.mergerGroups) {
    await window.mergeSingleGroup(v_1);
  }
}
function downloadGroupZip(arg1, arg2) {
  const v_3 = new JSZip();
  if (arg2.obs) {
    v_3.file(arg2.obs.filename, arg2.obs.content);
  }
  if (arg2.navGps) {
    v_3.file(arg2.navGps.filename, arg2.navGps.content);
  }
  if (arg2.navGlo) {
    v_3.file(arg2.navGlo.filename, arg2.navGlo.content);
  }
  v_3.generateAsync({
    type: "blob"
  }).then(blob => {
    downloadTextFile(arg1 + "_MERGED.zip", blob, "application/zip");
  });
}

function initPpkInspector() {
  let v_1 = null;
  let v_2 = null;
  const inputEl = document.getElementById("inputPpkBaseFile");
  const inputEl_1 = document.getElementById("inputPpkRoverFile");
  const domEl = document.getElementById("txtPpkBaseFileName");
  const domEl_1 = document.getElementById("txtPpkRoverFileName");
  const domEl_2 = document.getElementById("ppkAnalysisResultWrapper");
  const v_3 = () => {
    if (!v_1 || !v_2) {
      return;
    }
    try {
      const v_1_1 = UniversalRinexInspector.inspectPpkOverlap(v_1, v_2);
      if (domEl_2) {
        domEl_2.style.display = "flex";
      }
      const domEl_3 = document.getElementById("bannerPpkStatus");
      const domEl_4 = document.getElementById("iconPpkStatus");
      const domEl_5 = document.getElementById("titlePpkStatus");
      const domEl_6 = document.getElementById("descPpkStatus");
      const domEl_7 = document.getElementById("badgePpkOverlapPercent");
      if (v_1_1.statusLevel === "SUCCESS") {
        if (domEl_3) {
          domEl_3.style.background = "rgba(16, 185, 129, 0.12)";
          domEl_3.style.borderColor = "rgba(16, 185, 129, 0.4)";
        }
        if (domEl_4) {
          domEl_4.className = "fa-solid fa-circle-check";
          domEl_4.style.color = "var(--emerald-400)";
        }
        if (domEl_5) {
          domEl_5.style.color = "var(--emerald-400)";
        }
        if (domEl_7) {
          domEl_7.style.background = "rgba(16, 185, 129, 0.2)";
          domEl_7.style.color = "var(--emerald-400)";
        }
      } else if (v_1_1.statusLevel === "WARNING") {
        if (domEl_3) {
          domEl_3.style.background = "rgba(245, 158, 11, 0.12)";
          domEl_3.style.borderColor = "rgba(245, 158, 11, 0.4)";
        }
        if (domEl_4) {
          domEl_4.className = "fa-solid fa-triangle-exclamation";
          domEl_4.style.color = "var(--amber-400)";
        }
        if (domEl_5) {
          domEl_5.style.color = "var(--amber-400)";
        }
        if (domEl_7) {
          domEl_7.style.background = "rgba(245, 158, 11, 0.2)";
          domEl_7.style.color = "var(--amber-400)";
        }
      } else {
        if (domEl_3) {
          domEl_3.style.background = "rgba(239, 68, 68, 0.12)";
          domEl_3.style.borderColor = "rgba(239, 68, 68, 0.4)";
        }
        if (domEl_4) {
          domEl_4.className = "fa-solid fa-circle-xmark";
          domEl_4.style.color = "var(--red-400)";
        }
        if (domEl_5) {
          domEl_5.style.color = "var(--red-400)";
        }
        if (domEl_7) {
          domEl_7.style.background = "rgba(239, 68, 68, 0.2)";
          domEl_7.style.color = "var(--red-400)";
        }
      }
      if (domEl_5) {
        domEl_5.textContent = v_1_1.statusTitle;
      }
      if (domEl_6) {
        domEl_6.textContent = v_1_1.statusDesc;
      }
      if (domEl_7) {
        domEl_7.textContent = "%" + v_1_1.overlapPercent.toFixed(1) + " Kapsama";
      }
      const domEl_8 = document.getElementById("statPpkBaseTime");
      const domEl_9 = document.getElementById("statPpkRoverTime");
      const domEl_10 = document.getElementById("statPpkOverlapDuration");
      const v_2_1 = document.getElementById("statPpkBaselineDist") || document.getElementById("statPpkBaselineKm");
      const v_3_1 = document.getElementById("statPpkCommonSystems") || document.getElementById("statPpkCommonConst");
      if (domEl_8) {
        domEl_8.textContent = v_1_1.baseStartStr + " - " + v_1_1.baseEndStr + " (" + v_1_1.baseDurationStr + ")";
      }
      if (domEl_9) {
        domEl_9.textContent = v_1_1.roverStartStr + " - " + v_1_1.roverEndStr + " (" + v_1_1.roverDurationStr + ")";
      }
      if (domEl_10) {
        domEl_10.textContent = v_1_1.overlapDurationStr + " (%" + v_1_1.overlapPercent.toFixed(1) + ")";
      }
      if (v_2_1) {
        v_2_1.innerHTML = "<span style=\"color:var(--purple-400); font-weight:700;\">" + v_1_1.baselineStr + "</span> <span style=\"font-size:10px; color:#94a3b8; display:block; font-weight:normal;\">" + v_1_1.baselineNote + "</span>";
      }
      if (v_3_1) {
        v_3_1.textContent = v_1_1.commonConstellations.join(", ") || "GPS";
      }
      const domEl_11 = document.getElementById("barPpkBase");
      const domEl_12 = document.getElementById("barPpkRover");
      if (domEl_11) {
        domEl_11.style.left = v_1_1.timeline.baseLeft + "%";
        domEl_11.style.width = v_1_1.timeline.baseWidth + "%";
      }
      if (domEl_12) {
        domEl_12.style.left = v_1_1.timeline.roverLeft + "%";
        domEl_12.style.width = v_1_1.timeline.roverWidth + "%";
      }
      logMessage("🛰️ [PPK ANALİZİ] Kapsama: %" + v_1_1.overlapPercent.toFixed(1) + ", Baz: " + v_1_1.baselineKm.toFixed(2) + " km, Ortak Süre: " + v_1_1.overlapDurationStr);
      showToast(t("rinex.toastPpkAnalysisSuccess", { percent: v_1_1.overlapPercent.toFixed(1), baseline: v_1_1.baselineKm.toFixed(1) }), v_1_1.statusLevel === "SUCCESS" ? "success" : "warning");
    } catch (v_1_1) {
      logMessage("❌ [PPK HATA] " + (v_1_1.message || v_1_1));
      showToast(t("rinex.toastPpkAnalysisError", { err: v_1_1.message }), "error");
    }
  };
  inputEl?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.text();
      v_1 = UniversalRinexInspector.inspectRinexHeader(v_1_1, v_2_1.name);
      if (domEl) {
        domEl.innerHTML = "<span style=\"color: var(--cyan-400); font-weight: 700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size: 10px;\">" + t("rinex.badgeBase") + "</span>";
      }
      showToast(t("rinex.toastBaseLoaded", { name: v_2_1.name }), "info");
      v_3();
    }
  });
  inputEl_1?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.text();
      v_2 = UniversalRinexInspector.inspectRinexHeader(v_1_1, v_2_1.name);
      if (domEl_1) {
        domEl_1.innerHTML = "<span style=\"color: var(--emerald-400); font-weight: 700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size: 10px;\">" + t("rinex.badgeRover") + "</span>";
      }
      showToast(t("rinex.toastRoverLoaded", { name: v_2_1.name }), "info");
      v_3();
    }
  });
}
function initRinexQualityInspector() {
  const inputEl = document.getElementById("inputRinexQualityFile");
  const domEl = document.getElementById("rinexQualityDashboard");
  inputEl?.addEventListener("change", async arg1 => {
    const v_2 = arg1.target.files?.[0];
    if (!v_2) {
      return;
    }
    showToast(t("rinex.toastAnalyzing", { name: v_2.name }), "info");
    try {
      const v_1 = await v_2.text();
      const v_2_1 = UniversalRinexInspector.analyzeRinexQuality(v_1);
      if (domEl) {
        domEl.style.display = "flex";
      }
      document.getElementById("statQualityEpochs").textContent = v_2_1.totalEpochs + " Epoch (" + v_2_1.startTime + " - " + v_2_1.endTime + ")";
      document.getElementById("statQualityInterval").textContent = v_2_1.detectedInterval + " sn";
      document.getElementById("statQualitySatCount").textContent = v_2_1.avgSats + " / " + v_2_1.maxSats + " Uydu";
      document.getElementById("statQualityConstellation").textContent = "G:" + v_2_1.avgGps + " | R:" + v_2_1.avgGlo + " | E:" + v_2_1.avgGal + " | C:" + v_2_1.avgBds;
      document.getElementById("statQualityScore").textContent = "%" + v_2_1.qualityScore + " " + (v_2_1.qualityScore >= 80 ? "Mükemmel" : "İyi");
      drawRinexQualityChart(v_2_1.timeline);
      logMessage("📊 [RINEX KALİTE] " + v_2.name + ": " + v_2_1.totalEpochs + " Epoch, Ort. " + v_2_1.avgSats + " Uydu, Kalite Skoru %" + v_2_1.qualityScore);
      showToast(t("rinex.toastAnalysisSuccess", { name: v_2.name, sats: v_2_1.avgSats }), "success");
    } catch (v_1) {
      logMessage("❌ [RINEX KALİTE HATA] " + (v_1.message || v_1));
      showToast(t("rinex.toastAnalysisError", { err: v_1.message }), "error");
    }
  });
  window.addEventListener("resize", () => {
    const domEl_1 = document.getElementById("canvasRinexQualityChart");
    if (domEl_1 && domEl_1.offsetParent !== null && window.lastRinexQualityTimeline) {
      drawRinexQualityChart(window.lastRinexQualityTimeline);
    }
  });
}
function drawRinexQualityChart(arg1) {
  const domEl = document.getElementById("canvasRinexQualityChart");
  if (!domEl || !arg1 || arg1.length === 0) {
    return;
  }
  window.lastRinexQualityTimeline = arg1;
  const v_2 = domEl.getContext("2d");
  const v_3 = domEl.width = domEl.parentElement.clientWidth || 900;
  const v_4 = domEl.height = 180;
  v_2.clearRect(0, 0, v_3, v_4);
  const num = 35;
  const num_1 = 15;
  const num_2 = 15;
  const num_3 = 25;
  const v_5 = v_3 - num - num_1;
  const v_6 = v_4 - num_2 - num_3;
  const v_7 = Math.max(35, Math.ceil((Math.max(...arg1.map(item => item.total)) + 5) / 5) * 5);
  v_2.strokeStyle = "rgba(255, 255, 255, 0.08)";
  v_2.lineWidth = 1;
  v_2.fillStyle = "#64748b";
  v_2.font = "10px monospace";
  v_2.textAlign = "right";
  const num_4 = 4;
  for (let num_5 = 0; num_5 <= num_4; num_5++) {
    const v_1 = Math.round(v_7 / num_4 * num_5);
    const v_2_1 = num_2 + v_6 - v_1 / v_7 * v_6;
    v_2.beginPath();
    v_2.moveTo(num, v_2_1);
    v_2.lineTo(v_3 - num_1, v_2_1);
    v_2.stroke();
    v_2.fillText("" + v_1, num - 5, v_2_1 + 3);
  }
  const v_8 = arg1_1 => num + arg1_1 / (arg1.length - 1) * v_5;
  const v_9 = arg1_1 => num_2 + v_6 - arg1_1 / v_7 * v_6;
  const v_10 = (arg1_1, arg2, arg3, arg4 = null) => {
    if (arg1.length < 2) {
      return;
    }
    v_2.beginPath();
    v_2.moveTo(v_8(0), v_9(arg1[0][arg1_1]));
    for (let num_5 = 1; num_5 < arg1.length; num_5++) {
      v_2.lineTo(v_8(num_5), v_9(arg1[num_5][arg1_1]));
    }
    if (arg4) {
      v_2.save();
      v_2.lineTo(v_8(arg1.length - 1), num_2 + v_6);
      v_2.lineTo(v_8(0), num_2 + v_6);
      v_2.closePath();
      v_2.fillStyle = arg4;
      v_2.fill();
      v_2.restore();
    }
    v_2.strokeStyle = arg2;
    v_2.lineWidth = arg3;
    v_2.shadowColor = arg2;
    v_2.shadowBlur = arg3 > 1.5 ? 6 : 0;
    v_2.stroke();
    v_2.shadowBlur = 0;
  };
  const v_11 = v_2.createLinearGradient(0, num_2, 0, num_2 + v_6);
  v_11.addColorStop(0, "rgba(245, 158, 11, 0.25)");
  v_11.addColorStop(1, "rgba(245, 158, 11, 0.0)");
  v_10("total", "#f59e0b", 2.5, v_11);
  v_10("gps", "#38bdf8", 1.8);
  v_10("glo", "#f87171", 1.4);
  v_10("gal", "#c084fc", 1.4);
  v_10("bds", "#34d399", 1.4);
  v_2.fillStyle = "#94a3b8";
  v_2.textAlign = "center";
  const v_12 = Math.min(6, arg1.length);
  for (let num_5 = 0; num_5 < v_12; num_5++) {
    const v_1 = Math.floor(num_5 / (v_12 - 1) * (arg1.length - 1));
    const v_2_1 = v_8(v_1);
    v_2.fillText(arg1[v_1].time, v_2_1, v_4 - 8);
  }
}

function initVersionAndFormatCascader() {
  const domEl = document.getElementById("selectTargetVersion");
  if (domEl) {
    domEl.addEventListener("change", () => {
      const v_1 = state.detectedTimeWindow?.date ? parseInt(state.detectedTimeWindow.date.split("-")[0]) : 2026;
      populateDynamicFormats(domEl.value, v_1);
    });
    populateDynamicFormats(domEl.value, 2026);
  }
}

function populateDynamicFormats(arg1, arg2 = 2026) {
  const domEl = document.getElementById("selectTargetFormat");
  if (!domEl) return;
  const v_3 = String(arg2 % 100).padStart(2, "0");
  domEl.innerHTML = "";
  if (arg1 === "RINEX_211" || arg1 === "RINEX_210") {
    const v_1 = arg1 === "RINEX_210" ? "2.10" : "2.11";
    domEl.innerHTML = `
      <option value="OBS_YYO" selected>${t("rinex.formatObsYyo", { yy: v_3, ver: v_1 })}</option>
      <option value="OBS_EXT">${t("rinex.formatObsExt", { ver: v_1 })}</option>
      <option value="NAV_YYN">${t("rinex.formatNavYyn", { yy: v_3 })}</option>
      <option value="NAV_EXT">${t("rinex.formatNavExt")}</option>
      <option value="NAV_YYG">${t("rinex.formatNavYyg", { yy: v_3 })}</option>
      <option value="HATANAKA_YYD">${t("rinex.formatHatanakaYyd", { yy: v_3 })}</option>
      <option value="ALL_ZIP">${t("rinex.formatAllZip")}</option>
    `;
  } else if (arg1.startsWith("RINEX_3") || arg1 === "RINEX_400") {
    const v_1 = arg1.replace("RINEX_", "").replace("30", "3.0").replace("400", "4.00");
    domEl.innerHTML = `
      <option value="OBS_YYO" selected>${t("rinex.formatObs83", { yy: v_3, ver: v_1 })}</option>
      <option value="OBS_EXT">${t("rinex.formatObsExt", { ver: v_1 })}</option>
      <option value="RNX_OBS">${t("rinex.formatRnxObs", { ver: v_1 })}</option>
      <option value="NAV_YYN">${t("rinex.formatNavYyn", { yy: v_3 })}</option>
      <option value="NAV_EXT">${t("rinex.formatNavExt")}</option>
      <option value="NAV_YYG">${t("rinex.formatNavYyg", { yy: v_3 })}</option>
      <option value="RNX_NAV_MIX">${t("rinex.formatRnxNavMix", { yy: v_3 })}</option>
      <option value="HATANAKA_YYD">${t("rinex.formatHatanakaYyd", { yy: v_3 })}</option>
      <option value="HATANAKA_CRX">${t("rinex.formatHatanakaCrx")}</option>
      <option value="ALL_ZIP">${t("rinex.formatAllZipMulti")}</option>
    `;
  }
}

