/**
 * Harita Tools - RTK & Cadastre Module Controller
 */
function initGpsFormatSubtabs() {
  const subBtns = document.querySelectorAll(".subtab-btn, .sub-tab-btn");
  const subContents = document.querySelectorAll(".subtab-content");

  subBtns.forEach(item => {
    item.addEventListener("click", () => {
      subBtns.forEach(b => {
        b.classList.remove("active", "btn-primary");
        b.classList.add("btn-secondary");
      });
      subContents.forEach(c => {
        c.classList.remove("active");
        c.classList.add("d-none");
        c.style.display = "none";
      });

      item.classList.add("active", "btn-primary");
      item.classList.remove("btn-secondary");

      const targetId = item.getAttribute("data-subtab");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.remove("d-none");
        targetPanel.classList.add("active");
        targetPanel.style.display = "block";

        if (targetId === "subtab-view") {
          setTimeout(() => {
            initCadastreMap();
            if (state.cadastreMap) {
              state.cadastreMap.invalidateSize();
              plotCadastrePointsOnMap();
            }
          }, 150);
        } else if (targetId === "subtab-coordinate") {
          if (elements.txtCoordOutput && state.gnssEngine) {
            elements.txtCoordOutput.value = state.gnssEngine.exportFormattedCoordinateList(elements.selectCoordOrder.value);
          }
        }
      }
    });
  });
}

function initCadastreModule() {
  if (elements.rw5FileInput) {
    elements.rw5FileInput.addEventListener("change", async event => {
      const v_1_1 = event.target.files[0];
      const domEl_5 = document.getElementById("rw5FileDisplayName");
      const domEl_6 = document.getElementById("brandDetectPill");
      if (v_1_1) {
        const v_1_2 = await v_1_1.slice(0, 1500).text();
        const detected = state.gnssEngine.autoDetectFormat(v_1_2, v_1_1.name);
        const formatMeta = {
          rw5: { icon: "fa-satellite-dish", key: "cadastre.formats.rw5" },
          gsi: { icon: "fa-crosshairs", key: "cadastre.formats.gsi" },
          landxml: { icon: "fa-file-code", key: "cadastre.formats.landxml" },
          trimble: { icon: "fa-location-arrow", key: "cadastre.formats.trimble" },
          kml: { icon: "fa-earth-americas", key: "cadastre.formats.kml" },
          kmz: { icon: "fa-earth-americas", key: "cadastre.formats.kmz" },
          geojson: { icon: "fa-code", key: "cadastre.formats.geojson" },
          dxf: { icon: "fa-vector-square", key: "cadastre.formats.dxf" },
          ncn: { icon: "fa-map-pin", key: "cadastre.formats.ncn" },
          csv: { icon: "fa-file-csv", key: "cadastre.formats.csv" },
          generic: { icon: "fa-file-lines", key: "cadastre.formats.generic" }
        };
        const meta = formatMeta[detected.format] || formatMeta.generic;
        const formatName = t(meta.key);
        const formatIcon = meta.icon;

        if (domEl_5) {
          domEl_5.innerHTML = "<span class=\"text-white\">" + v_1_1.name + "</span> <span class=\"badge badge-tg20 ml-6\"><i class=\"fa-solid " + formatIcon + "\"></i> " + formatName + "</span>";
        }
        if (domEl_6) {
          domEl_6.innerHTML = "<span class=\"status-dot status-dot-active\"></span> " + t("cadastre.formatLabel", { name: formatName });
        }
        logMessage(t("cadastre.logFormatDetected", { filename: v_1_1.name, brand: formatName }));
        showToast(t("cadastre.toastFormatDetected", { name: formatName }), "info");
      }
    });
  }
  elements.btnAnalyzeRw5?.addEventListener("click", handleGnssAnalysis);
  elements.btnPrintCadastre?.addEventListener("click", handlePrintCadastre);
  elements.btnExportCadastreCsv?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportCadastreCsv();
    downloadTextFile("kadastro_cift_okuma_cetelesi.csv", v_1_1);
  });
  elements.btnExportRtkCsv?.addEventListener("click", () => {
    const isTg20 = !!state.gnssEngine.isTg20Applied;
    let str = isTg20
      ? "No,Date/Time,Point,Easting,Northing,EL.Hgt,TG20_N,Ortho_H,Ep,Hz,SAT,hRms,vRms,Pdop,Method,Network,Status,Ant.Ht,Latitude_Dec,Longitude_Dec\n"
      : "No,Date/Time,Point,Easting,Northing,EL.Hgt,Ep,Hz,SAT,hRms,vRms,Pdop,Method,Network,Status,Ant.Ht,Latitude_Dec,Longitude_Dec\n";
    state.gnssEngine.rawPoints.forEach((item, idx) => {
      const latStr = item.lat !== undefined && item.lat !== null ? item.lat.toFixed(8) : (item.latDec ? item.latDec.toFixed(8) : "");
      const lonStr = item.lon !== undefined && item.lon !== null ? item.lon.toFixed(8) : (item.lonDec ? item.lonDec.toFixed(8) : "");
      const dtTm = (item.dt && item.dt !== "-") ? `${item.dt} ${item.tm && item.tm !== "-" ? item.tm : ""}`.trim() : "";
      const hRms = item.hsdvVal !== null && item.hsdvVal !== undefined ? item.hsdvVal.toFixed(3) : "";
      const vRms = item.vsdvVal !== null && item.vsdvVal !== undefined ? item.vsdvVal.toFixed(3) : "";
      const hVal = item.h !== null && item.h !== undefined ? item.h.toFixed(3) : "";
      if (isTg20) {
        const tg20NStr = item.tg20N ? (item.tg20N.startsWith("+") || item.tg20N.startsWith("-") ? item.tg20N : "+" + item.tg20N) : "";
        const orthoHStr = item.orthoH != null ? item.orthoH.toFixed(3) : hVal;
        str += `${idx + 1},${dtTm},${item.pn},${item.e.toFixed(3)},${item.n.toFixed(3)},${hVal},${tg20NStr},${orthoHStr},${item.epochs || ""},${item.hz || ""},${item.sats || ""},${hRms},${vRms},${item.pdop || ""},${item.method || ""},${item.network || ""},${item.status || ""},${item.hr || ""},${latStr},${lonStr}\n`;
      } else {
        str += `${idx + 1},${dtTm},${item.pn},${item.e.toFixed(3)},${item.n.toFixed(3)},${hVal},${item.epochs || ""},${item.hz || ""},${item.sats || ""},${hRms},${vRms},${item.pdop || ""},${item.method || ""},${item.network || ""},${item.status || ""},${item.hr || ""},${latStr},${lonStr}\n`;
      }
    });
    downloadTextFile("gpsformat_rtk_ham_tablo.csv", str);
  });
  elements.btnExportNcn?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportNcnText();
    downloadTextFile("kadastro_noktalar.ncn", v_1_1);
  });
  elements.btnExportKos?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportKosText();
    downloadTextFile("kadastro_olculer.kos", v_1_1);
  });
  elements.btnExportDxf?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportDxfText();
    downloadTextFile("kadastro_cizim.dxf", v_1_1);
  });
  elements.btnExportKmlCadastre?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportKmlText();
    downloadTextFile("kadastro_noktalar_3d.kml", v_1_1);
  });
  elements.selectCoordOrder.addEventListener("change", () => {
    elements.txtCoordOutput.value = state.gnssEngine.exportFormattedCoordinateList(elements.selectCoordOrder.value);
  });
  elements.btnCopyCoords.addEventListener("click", () => {
    elements.txtCoordOutput.select();
    copyToClipboard(elements.txtCoordOutput.value, t("cadastre.toastCoordListCopied"));
  });
  elements.btnDownloadCoordTxt.addEventListener("click", () => {
    downloadTextFile("koordinatlar.txt", elements.txtCoordOutput.value);
    showToast(t("cadastre.toastTxtDownloaded"), "success");
  });
  const domEl = document.getElementById("chkRw5ApplyTg20");
  const domEl_1 = document.getElementById("badgeRw5Tg20Applied");
  domEl?.addEventListener("change", () => {
    const v_1_1 = domEl.checked;
    state.gnssEngine.applyTg20Reduction(state.tg20Engine, state.geodesyEngine, null, v_1_1);
    if (domEl_1) {
      domEl_1.style.display = v_1_1 ? "block" : "none";
    }
    if (elements.btnExportTg20RwReport) {
      elements.btnExportTg20RwReport.style.display = v_1_1 ? "inline-flex" : "none";
    }
    if (state.gnssEngine.rawPoints && state.gnssEngine.rawPoints.length > 0) {
      renderGpsFormatRtkTable(state.gnssEngine.rawPoints);
      renderRw5MatchedTable(state.gnssEngine.matchedPairs, state.gnssEngine.unmatchedPoints);
      elements.txtCoordOutput.value = state.gnssEngine.exportFormattedCoordinateList(elements.selectCoordOrder.value);
      logMessage(v_1_1 ? t("cadastre.logTg20Active") : t("cadastre.logTg20Inactive"));
      showToast(v_1_1 ? t("cadastre.toastTg20Applied") : t("cadastre.toastTg20Reverted"), "info");
    }
  });
  const v_1 = () => {
    if (!state.gnssEngine.isTg20Applied) {
      const domEl_5 = document.getElementById("chkRw5ApplyTg20");
      if (domEl_5) {
        domEl_5.checked = true;
        domEl_5.dispatchEvent(new Event("change"));
      }
    }
    if (state.gnssEngine.rawPoints?.length === 0) {
      showToast(t("cadastre.toastNeedGnssFile"), "warning");
      return;
    }
    const v_1_1 = state.gnssEngine.exportTg20ReductionReport();
    downloadTextFile("GPSFormat_TG20_Indirgeme_Raporu.txt", v_1_1);
    logMessage(t("cadastre.logTg20ReportDownloaded"));
    showToast(t("cadastre.toastTg20TxtDownloaded"), "success");
  };
  const v_2 = () => {
    if (!state.gnssEngine.isTg20Applied) {
      const domEl_5 = document.getElementById("chkRw5ApplyTg20");
      if (domEl_5) {
        domEl_5.checked = true;
        domEl_5.dispatchEvent(new Event("change"));
      }
    }
    if (state.gnssEngine.rawPoints?.length === 0) {
      showToast(t("cadastre.toastNeedGnssFile"), "warning");
      return;
    }
    const reportData = state.gnssEngine.getTg20ReportData(t("cadastre.tg20ReportTitle", "GNSS RTK / CORS TG-20 JEOİT İNDİRGEME RAPORU"), state.tg20Engine, state.geodesyEngine);
    const v_1_1 = window.GnssReportTemplates?.renderTg20Report ? window.GnssReportTemplates.renderTg20Report(reportData) : state.gnssEngine.generatePrintableTg20Report();
    const v_2_1 = window.open("", "_blank", "width=950,height=750");
    if (v_2_1) {
      v_2_1.document.write(v_1_1);
      v_2_1.document.close();
      logMessage(t("cadastre.logPrintOpened"));
      showToast(t("cadastre.toastPrintWindowOpened"), "success");
    } else {
      showToast(t("cadastre.toastPopupBlocked"), "warning");
    }
  };
  document.getElementById("btnPrintTg20RwReport")?.addEventListener("click", v_2);
  document.getElementById("btnExportTg20RwReport")?.addEventListener("click", v_1);
  document.getElementById("btnPrintTg20RwReportRtk")?.addEventListener("click", v_2);
  document.getElementById("btnExportNcnRtk")?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportNcnText();
    downloadTextFile("kadastro_noktalar.ncn", v_1_1);
  });
  document.getElementById("btnExportDxfRtk")?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportDxfText();
    downloadTextFile("kadastro_cizim.dxf", v_1_1);
  });
  document.getElementById("btnExportKmlRtk")?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportKmlText();
    downloadTextFile("kadastro_noktalar_3d.kml", v_1_1);
  });
  document.getElementById("btnGoToFormatConverter")?.addEventListener("click", () => {
    if (typeof window.switchStudioTab === "function") {
      window.switchStudioTab("tab-converter");
    }
  });
  document.getElementById("btnGoToCoordTransform")?.addEventListener("click", () => {
    if (typeof window.switchStudioTab === "function") {
      window.switchStudioTab("tab-geodesy");
    }
  });
}
async function handleGnssAnalysis() {
  let str = "";
  let str_1 = "";
  const v_1 = elements.rw5FileInput.files[0];
  if (v_1) {
    str_1 = v_1.name;
    logMessage(t("cadastre.logReadingFile", { name: v_1.name }));
    updateProgress(20, t("cadastre.progReadingFile"));
    str = await v_1.text();
  } else {
    str_1 = "musksenylYKN20260313.rw5";
    logMessage(t("cadastre.logDefaultFileLoading"));
    updateProgress(20, t("cadastre.progDefaultFileLoading"));
    try {
      const v_1_1 = await fetch("musksenylYKN20260313.rw5");
      if (v_1_1.ok) {
        str = await v_1_1.text();
      } else {
        showToast(t("cadastre.toastSelectValidGnssFile"), "warning");
        return;
      }
    } catch (v_1_1) {
      showToast(t("cadastre.toastSelectValidGnssFile"), "warning");
      return;
    }
  }
  const v_2 = parseFloat(elements.rw5Tolerance.value) || 7;
  const v_3 = parseFloat(elements.rw5MinTime.value) || 60;
  const v_4 = parseFloat(elements.rw5Radius.value) || 1;
  logMessage(t("cadastre.logFormatScanning", { thresh: v_4, tol: v_2, time: v_3 }));
  updateProgress(50, t("cadastre.progParsingProjecting"));
  const v_5 = state.gnssEngine.parseData(str, str_1);
  elements.brandDetectPill.textContent = t("cadastre.formatLabel", { name: state.gnssEngine.detectedBrand });
  const {
    matched: v_6,
    unmatched: v_7
  } = state.gnssEngine.analyzeDoubleReadings(v_2, v_3, v_4);
  const domEl = document.getElementById("chkRw5ApplyTg20");
  const v_8 = domEl ? domEl.checked : false;
  if (v_8) {
    state.gnssEngine.applyTg20Reduction(state.tg20Engine, state.geodesyEngine, null, true);
  }
  elements.barCriterion.textContent = (v_2 / 100).toFixed(2) + "m [FIX]";
  elements.barProj.textContent = "ITRF-TM 3° " + state.gnssEngine.centralMeridian + "° E";
  if (v_5.length > 0 && state.tg20Engine?.isLoaded && v_5[0].latDec && v_5[0].lonDec) {
    const v_1_1 = state.tg20Engine.getGeoidHeight(v_5[0].latDec, v_5[0].lonDec);
    elements.barGeoid.textContent = v_1_1 !== null ? t("cadastre.barGeoidValue", { val: v_1_1.toFixed(3) }) : t("cadastre.barGeoidOutOfScope");
  } else {
    elements.barGeoid.textContent = t("cadastre.barGeoidDefault");
  }
  const btnEl = document.getElementById("btnSubtabGcp");
  const domEl_1 = document.getElementById("badgeGcpPairCount");
  const domEl_2 = document.getElementById("alertGcpNoPairs");
  const btnEl_1 = document.getElementById("btnPrintCadastre");
  if (v_6.length === 0) {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.classList.remove("disabled");
      btnEl.style.opacity = "1";
      btnEl.style.cursor = "pointer";
      btnEl.style.filter = "none";
      btnEl.title = t("cadastre.tooltipNoDualReadings");
    }
    if (domEl_1) {
      domEl_1.style.display = "inline-flex";
      domEl_1.className = "badge";
      domEl_1.style.background = "rgba(100, 116, 139, 0.25)";
      domEl_1.style.color = "#94a3b8";
      domEl_1.style.borderColor = "rgba(100, 116, 139, 0.4)";
      domEl_1.style.fontSize = "10px";
      domEl_1.style.padding = "1px 6px";
      domEl_1.innerHTML = t("cadastre.countDualReadings", { count: 0 });
    }
    if (domEl_2) {
      domEl_2.style.display = "flex";
    }
    if (btnEl_1) {
      btnEl_1.disabled = true;
      btnEl_1.classList.add("disabled");
      btnEl_1.style.opacity = "0.5";
      btnEl_1.style.cursor = "not-allowed";
      btnEl_1.title = t("cadastre.tooltipOfficialKarneDisabled");
    }
  } else {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.classList.remove("disabled");
      btnEl.style.opacity = "1";
      btnEl.style.cursor = "pointer";
      btnEl.style.filter = "none";
      btnEl.title = t("cadastre.tooltipDualCount", { count: v_6.length });
    }
    if (domEl_1) {
      domEl_1.style.display = "inline-flex";
      domEl_1.className = "badge";
      domEl_1.style.background = "rgba(16, 185, 129, 0.2)";
      domEl_1.style.color = "var(--emerald-400)";
      domEl_1.style.borderColor = "rgba(16, 185, 129, 0.4)";
      domEl_1.style.fontSize = "10px";
      domEl_1.style.padding = "1px 6px";
      domEl_1.innerHTML = t("cadastre.countDualReadings", { count: v_6.length }) + " ✓";
    }
    if (domEl_2) {
      domEl_2.style.display = "none";
    }
    if (btnEl_1) {
      btnEl_1.disabled = false;
      btnEl_1.classList.remove("disabled");
      btnEl_1.style.opacity = "1";
      btnEl_1.style.cursor = "pointer";
      btnEl_1.title = "";
    }
  }

  const isStaticDataset = v_5.length > 0 && v_5.every(p => p.isStaticCoordinate || !p.timestamp);
  const bannerStatic = document.getElementById("cadastreStaticCoordBanner");
  if (bannerStatic) {
    bannerStatic.classList.toggle("d-none", !isStaticDataset);
    if (isStaticDataset) {
      logMessage(t("cadastre.logStaticDatasetDetected"));
      showToast(t("cadastre.toastStaticCoordsLoaded"), "info");
    }
  }

  renderGpsFormatRtkTable(v_5);
  renderRw5MatchedTable(v_6, v_7);
  updateCadastreKpiStats(v_5);
  elements.txtCoordOutput.value = state.gnssEngine.exportFormattedCoordinateList(elements.selectCoordOrder.value);
  if (state.cadastreMap) {
    plotCadastrePointsOnMap();
  }
  updateProgress(100, t("cadastre.progCompleted"));
  logMessage(t("cadastre.logAnalysisSuccess", { brand: state.gnssEngine.detectedBrand, count: v_5.length }));
  logMessage(t("cadastre.logProjectionInfo", { meridian: state.gnssEngine.centralMeridian, dualStatus: v_6.length > 0 ? t("cadastre.dualStatusMatched", { count: v_6.length }) : t("cadastre.dualStatusNone") }));
}

function updateCadastreKpiStats(rawPoints = []) {
  const totalCountEl = document.getElementById("kpiRtkTotalCount");
  const dualSummaryEl = document.getElementById("kpiRtkDualSummary");
  const avgHrmsEl = document.getElementById("kpiRtkAvgHrms");
  const hrmsRangeEl = document.getElementById("kpiRtkHrmsRange");
  const avgPdopEl = document.getElementById("kpiRtkAvgPdop");
  const pdopRangeEl = document.getElementById("kpiRtkPdopRange");
  const fixRateEl = document.getElementById("kpiRtkFixRate");
  const avgEpochsEl = document.getElementById("kpiRtkAvgEpochs");

  if (!rawPoints || rawPoints.length === 0) {
    if (totalCountEl) totalCountEl.textContent = "0";
    if (dualSummaryEl) dualSummaryEl.textContent = "0 Çift Okuma";
    if (avgHrmsEl) avgHrmsEl.textContent = "--";
    if (hrmsRangeEl) hrmsRangeEl.textContent = "Min: -- | Max: --";
    if (avgPdopEl) avgPdopEl.textContent = "--";
    if (pdopRangeEl) pdopRangeEl.textContent = "Min: -- | Max: --";
    if (fixRateEl) fixRateEl.textContent = "--";
    if (avgEpochsEl) avgEpochsEl.textContent = "Ortalama -- Epoch";
    return;
  }

  const total = rawPoints.length;
  const dualPairs = state.gnssEngine?.matchedPairs || [];
  const failCount = dualPairs.filter(p => !p.isDistPassed).length;

  if (totalCountEl) totalCountEl.textContent = total.toString();
  if (dualSummaryEl) {
    dualSummaryEl.textContent = `${dualPairs.length} Çift Okuma (${failCount > 0 ? `${failCount} Limit Aşımı` : '0 Hata'})`;
    dualSummaryEl.className = `text-3xs font-mono ${failCount > 0 ? 'text-rose font-bold' : 'text-emerald'}`;
  }

  // HRMS Stats
  const hrmsValues = rawPoints.map(p => p.hsdvVal).filter(v => v !== null && v !== undefined && !isNaN(v) && v > 0);
  if (hrmsValues.length > 0) {
    const avgHrms = hrmsValues.reduce((a, b) => a + b, 0) / hrmsValues.length;
    const minHrms = Math.min(...hrmsValues);
    const maxHrms = Math.max(...hrmsValues);
    if (avgHrmsEl) avgHrmsEl.textContent = `±${avgHrms.toFixed(3)} m`;
    if (hrmsRangeEl) hrmsRangeEl.textContent = `Min: ${minHrms.toFixed(3)} | Max: ${maxHrms.toFixed(3)} m`;
  } else {
    if (avgHrmsEl) avgHrmsEl.textContent = "±0.010 m";
    if (hrmsRangeEl) hrmsRangeEl.textContent = "Nominal RTK";
  }

  // PDOP Stats
  const pdopValues = rawPoints.map(p => parseFloat(p.pdop)).filter(v => !isNaN(v) && v > 0);
  if (pdopValues.length > 0) {
    const avgPdop = pdopValues.reduce((a, b) => a + b, 0) / pdopValues.length;
    const minPdop = Math.min(...pdopValues);
    const maxPdop = Math.max(...pdopValues);
    if (avgPdopEl) avgPdopEl.textContent = avgPdop.toFixed(1);
    if (pdopRangeEl) pdopRangeEl.textContent = `Min: ${minPdop.toFixed(1)} | Max: ${maxPdop.toFixed(1)}`;
  } else {
    if (avgPdopEl) avgPdopEl.textContent = "1.5";
    if (pdopRangeEl) pdopRangeEl.textContent = "İyi Geometri";
  }

  // Fix Rate & Epochs Stats
  const fixedCount = rawPoints.filter(p => !p.status || p.status.toUpperCase().includes("FIX")).length;
  const fixRate = total > 0 ? Math.round((fixedCount / total) * 100) : 100;
  const epochValues = rawPoints.map(p => parseInt(p.epochs, 10)).filter(v => !isNaN(v) && v > 0);
  const avgEpoch = epochValues.length > 0 ? Math.round(epochValues.reduce((a, b) => a + b, 0) / epochValues.length) : 30;

  if (fixRateEl) fixRateEl.textContent = `%${fixRate} Fixed`;
  if (avgEpochsEl) avgEpochsEl.textContent = `Ort. ${avgEpoch} Epoch / Nokta`;
}

function renderGpsFormatRtkTable(arg1 = []) {
  const tbody = elements.tableGpsFormatRtkBody;
  if (!tbody) return;
  tbody.innerHTML = "";
  updateCadastreKpiStats(arg1);

  if (!arg1 || arg1.length === 0) {
    const emptyTitle = typeof t === "function" ? t("cadastre.emptyTableTitle") : "Henüz GNSS / RTK Gözlem Dosyası Yüklenmedi";
    const emptyHint = typeof t === "function" ? t("cadastre.emptyTableHint") : "Yukarıdaki panelden .rw5, .raw, .csv veya .jxl dosyanızı seçin ya da doğrudan ekrana sürükleyip bırakın.";
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="20" class="text-center py-40">
          <div class="d-flex flex-col items-center justify-center gap-8 py-20">
            <i class="fa-solid fa-satellite text-cyan text-2xl opacity-75"></i>
            <strong class="text-white text-sm">${emptyTitle}</strong>
            <span class="text-xs text-dim max-w-md text-center">${emptyHint}</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const tmpl = document.getElementById("tmplRtkRow");
  if (!tmpl) return;

  const isTg20 = !!state.gnssEngine.isTg20Applied;
  document.querySelectorAll("#theadGpsFormatRtk .col-tg20").forEach(el => {
    el.style.display = isTg20 ? "" : "none";
  });

  const fragment = document.createDocumentFragment();

  arg1.forEach((item, idx) => {
    const clone = tmpl.content.cloneNode(true);
    const tr = clone.querySelector("tr");

    tr.querySelector(".cell-idx").textContent = idx + 1;
    tr.querySelector(".cell-pn").textContent = item.pn || "-";

    const dtTm = (item.dt && item.dt !== "-") ? `${item.dt} ${item.tm && item.tm !== "-" ? item.tm : ""}`.trim() : "-";
    tr.querySelector(".cell-time").textContent = dtTm;

    tr.querySelector(".cell-e").textContent = item.e != null ? item.e.toFixed(3) : "-";
    tr.querySelector(".cell-n").textContent = item.n != null ? item.n.toFixed(3) : "-";
    tr.querySelector(".cell-h").textContent = item.h != null ? item.h.toFixed(3) : "-";

    const tg20NCell = tr.querySelector(".cell-tg20-n");
    const tg20HCell = tr.querySelector(".cell-tg20-h");
    if (isTg20) {
      tg20NCell.style.display = "";
      tg20HCell.style.display = "";
      tg20NCell.textContent = item.tg20N ? (item.tg20N.startsWith("+") || item.tg20N.startsWith("-") ? item.tg20N : "+" + item.tg20N) + " m" : "--";
      tg20HCell.textContent = item.orthoH != null ? item.orthoH.toFixed(3) : (item.h != null ? item.h.toFixed(3) : "-");
    }

    tr.querySelector(".cell-ep").textContent = item.epochs ?? "-";
    tr.querySelector(".cell-hz").textContent = item.hz ?? "-";
    tr.querySelector(".cell-sats").textContent = item.sats ?? "-";
    tr.querySelector(".cell-hrms").textContent = item.hsdvVal != null ? item.hsdvVal.toFixed(3) : "-";
    tr.querySelector(".cell-vrms").textContent = item.vsdvVal != null ? item.vsdvVal.toFixed(3) : "-";
    tr.querySelector(".cell-pdop").textContent = item.pdop ?? "-";

    const statusCell = tr.querySelector(".cell-status");
    if (item.status && item.status !== "-") {
      statusCell.innerHTML = `<span class="text-emerald font-bold">${item.status}</span>`;
    } else {
      statusCell.innerHTML = `<span class="text-dim">-</span>`;
    }

    tr.querySelector(".cell-network").textContent = item.network || "-";
    tr.querySelector(".cell-method").textContent = item.method || "-";
    tr.querySelector(".cell-hr").textContent = item.hr || "-";

    const latVal = item.lat != null ? item.lat.toFixed(8) + "°" : (item.latDec ? item.latDec.toFixed(8) + "°" : "-");
    const lonVal = item.lon != null ? item.lon.toFixed(8) + "°" : (item.lonDec ? item.lonDec.toFixed(8) + "°" : "-");
    tr.querySelector(".cell-lat").textContent = latVal;
    tr.querySelector(".cell-lon").textContent = lonVal;

    tr.addEventListener("click", () => {
      if (typeof window.selectCadastrePoint === "function") {
        window.selectCadastrePoint(item, true);
      }
    });

    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

function renderRw5MatchedTable(arg1 = [], arg2 = []) {
  const tbody = elements.tableRw5MatchedBody;
  if (!tbody) return;
  tbody.innerHTML = "";

  const isTg20 = !!state.gnssEngine.isTg20Applied;
  document.querySelectorAll("#theadRw5Matched .col-tg20").forEach(el => {
    el.style.display = isTg20 ? "" : "none";
  });

  const totalPoints = (arg1?.length || 0) + (arg2?.length || 0);
  if (totalPoints === 0) {
    tbody.innerHTML = `<tr><td colspan="${isTg20 ? 14 : 12}" class="text-center text-amber p-14">${t("cadastre.noPointsToDisplay")}</td></tr>`;
    return;
  }

  const tmplMatched = document.getElementById("tmplMatchedRow");
  const tmplUnmatched = document.getElementById("tmplUnmatchedRow");
  if (!tmplMatched || !tmplUnmatched) return;

  const fragment = document.createDocumentFragment();

  // 1. Çift Okuma Eşleşen Noktalar
  if (arg1 && arg1.length > 0) {
    arg1.forEach(item => {
      const clone = tmplMatched.content.cloneNode(true);
      const tr = clone.querySelector("tr");

      tr.querySelector(".cell-pn").textContent = item.pointName;
      tr.querySelector(".cell-t1").textContent = (item.p1?.dt && item.p1?.dt !== "-") ? `${item.p1.dt} ${item.p1.tm || ""}`.trim() : "-";
      tr.querySelector(".cell-t2").textContent = (item.p2?.dt && item.p2?.dt !== "-") ? `${item.p2.dt} ${item.p2.tm || ""}`.trim() : "-";

      const timeDisplay = item.timeDiffStr || (parseFloat(item.timeDiffMin) < 60 ? `${item.timeDiffMin} dk` : `${item.timeDiffHours} sa`);
      const dtCell = tr.querySelector(".cell-dt");
      if (item.isTimePassed) {
        dtCell.innerHTML = `<span class="text-emerald font-semibold">${t("cadastre.timeDiffMin60Pass", { time: timeDisplay })}</span>`;
      } else {
        dtCell.innerHTML = `<span class="text-amber font-semibold" title="${t("cadastre.tooltipBohhbuyArticle28")}">${t("cadastre.timeDiffMin60Fail", { time: timeDisplay })}</span>`;
      }

      tr.querySelector(".cell-dy").textContent = item.dy;
      tr.querySelector(".cell-dx").textContent = item.dx;
      tr.querySelector(".cell-dh").textContent = item.dh;

      const dsCell = tr.querySelector(".cell-ds");
      dsCell.className = `cell-ds font-mono font-extrabold text-sm ${item.isDistPassed ? "text-emerald" : "text-rose"}`;
      dsCell.textContent = `${item.ds2d} cm`;

      const statusCell = tr.querySelector(".cell-status");
      statusCell.innerHTML = item.isDistPassed
        ? `<span class="badge badge-emerald">${t("cadastre.badgePassDual")}</span>`
        : `<span class="badge badge-rose">${t("cadastre.badgeFailLimit")}</span>`;

      tr.querySelector(".cell-e").textContent = item.avgE;
      tr.querySelector(".cell-n").textContent = item.avgN;
      tr.querySelector(".cell-h").textContent = item.avgH;

      const tg20NCell = tr.querySelector(".cell-tg20-n");
      const tg20HCell = tr.querySelector(".cell-tg20-h");
      if (isTg20) {
        tg20NCell.style.display = "";
        tg20HCell.style.display = "";
        tg20NCell.textContent = item.tg20N ? (item.tg20N.startsWith("+") || item.tg20N.startsWith("-") ? item.tg20N : "+" + item.tg20N) + " m" : "--";
        tg20HCell.textContent = item.avgOrthoH || item.avgH;
      }

      tr.addEventListener("click", () => {
        if (typeof window.selectCadastrePoint === "function") {
          window.selectCadastrePoint(item.p1 || item, true);
        }
      });

      fragment.appendChild(tr);
    });
  }

  // 2. Tekil (İkinci Okuması Olmayan) Noktalar
  if (arg2 && arg2.length > 0) {
    arg2.forEach(item => {
      const clone = tmplUnmatched.content.cloneNode(true);
      const tr = clone.querySelector("tr");

      tr.querySelector(".cell-pn").textContent = item.pn;
      tr.querySelector(".cell-t1").textContent = (item.dt && item.dt !== "-") ? `${item.dt} ${item.tm || ""}`.trim() : "-";
      tr.querySelector(".cell-e").textContent = item.e != null ? item.e.toFixed(3) : "-";
      tr.querySelector(".cell-n").textContent = item.n != null ? item.n.toFixed(3) : "-";
      tr.querySelector(".cell-h").textContent = item.h != null ? item.h.toFixed(3) : "-";

      const tg20NCell = tr.querySelector(".cell-tg20-n");
      const tg20HCell = tr.querySelector(".cell-tg20-h");
      if (isTg20) {
        tg20NCell.style.display = "";
        tg20HCell.style.display = "";
        tg20NCell.textContent = item.tg20N ? (item.tg20N.startsWith("+") || item.tg20N.startsWith("-") ? item.tg20N : "+" + item.tg20N) + " m" : "--";
        tg20HCell.textContent = item.orthoH != null ? item.orthoH.toFixed(3) : (item.h != null ? item.h.toFixed(3) : "-");
      }

      tr.addEventListener("click", () => {
        if (typeof window.selectCadastrePoint === "function") {
          window.selectCadastrePoint(item, true);
        }
      });

      fragment.appendChild(tr);
    });
  }

  tbody.appendChild(fragment);
}
function handlePrintCadastre() {
  if (!state.gnssEngine.rawPoints || state.gnssEngine.rawPoints.length === 0) {
    showToast(t("cadastre.toastNeedGnssFile"), "warning");
    return;
  }
  if (!state.gnssEngine.matchedPairs || state.gnssEngine.matchedPairs.length === 0) {
    showToast(t("cadastre.toastNoDualReadingsWarning"), "warning");
    return;
  }
  const karneData = state.gnssEngine.getCadastreReportData(t("cadastre.karneReportTitle", "TUSAGA-AKTİF RTK ÇİFT OKUMA & ÖLÇÜ KARNESİ"));
  const v_1 = window.GnssReportTemplates?.renderCadastreKarne ? window.GnssReportTemplates.renderCadastreKarne(karneData) : state.gnssEngine.generatePrintableCadastreReport();
  const v_2 = window.open("", "_blank");
  if (v_2) {
    v_2.document.write(v_1);
    v_2.document.close();
    v_2.focus();
    setTimeout(() => v_2.print(), 500);
  } else {
    alert(t("cadastre.toastPopupBlocked"));
  }
}
