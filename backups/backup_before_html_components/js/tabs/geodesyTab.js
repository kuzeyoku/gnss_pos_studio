/**
 * Harita Tools - Geodesy & Coordinate Transformation Controller
 */
function initGeodesy() {
  const v_1 = new GeodesyEngine();
  let items = [];
  const domEl = document.getElementById("selSourceEpsg");
  const domEl_1 = document.getElementById("selTargetEpsg");
  const domEl_10 = document.getElementById("selBatchSourceEpsg");
  const domEl_11 = document.getElementById("selBatchTargetEpsg");

  const populateAllEpsgSelects = () => {
    if (domEl) v_1.populateSelect(domEl, domEl.value || "EPSG:4326");
    if (domEl_1) v_1.populateSelect(domEl_1, domEl_1.value || "EPSG:5255");
    if (domEl_10) v_1.populateSelect(domEl_10, domEl_10.value || "EPSG:5255");
    if (domEl_11) v_1.populateSelect(domEl_11, domEl_11.value || "EPSG:4326");
  };
  populateAllEpsgSelects();
  window.refreshEpsgSelects = populateAllEpsgSelects;

  const btnEl = document.getElementById("btnSwapEpsg");
  const btnEl_1 = document.getElementById("btnConvertCoord");
  const btnEl_2 = document.getElementById("btnCopySingleCoordResult");
  const domEl_2 = document.getElementById("coordResultBox");
  const domEl_3 = document.getElementById("geoLat");
  const domEl_4 = document.getElementById("geoLon");
  const domEl_5 = document.getElementById("geoH");
  const inputEl = document.getElementById("lblInputC1");
  const inputEl_1 = document.getElementById("lblInputC2");
  const inputEl_2 = document.getElementById("lblInputC3");
  const domEl_6 = document.getElementById("crossDatumWarningBanner");
  const v_2 = () => {
    if (!domEl || !domEl_1 || !domEl_6) {
      return;
    }
    const v_1_1 = v_1.epsgRegistry[domEl.value] || v_1.epsgRegistry["EPSG:4326"];
    const v_2_1 = v_1.epsgRegistry[domEl_1.value] || v_1.epsgRegistry["EPSG:5255"];
    if (v_1_1.datum !== v_2_1.datum) {
      domEl_6.style.display = "block";
    } else {
      domEl_6.style.display = "none";
    }
  };
  const v_3 = () => {
    return {
      dx: parseFloat(document.getElementById("p_dx")?.value) || -84.1,
      dy: parseFloat(document.getElementById("p_dy")?.value) || -101.8,
      dz: parseFloat(document.getElementById("p_dz")?.value) || -129.7,
      rx: parseFloat(document.getElementById("p_rx")?.value) || 0,
      ry: parseFloat(document.getElementById("p_ry")?.value) || 0,
      rz: parseFloat(document.getElementById("p_rz")?.value) || 0,
      ds: parseFloat(document.getElementById("p_ds")?.value) || 0
    };
  };
  const btnEl_3 = document.getElementById("btnLoadBursaWolfSample");
  const domEl_7 = document.getElementById("txtBursaWolfCommonPoints");
  const btnEl_4 = document.getElementById("btnSolveBursaWolf");
  const domEl_8 = document.getElementById("lblBursaWolfM0");
  if (btnEl_3 && domEl_7) {
    btnEl_3.addEventListener("click", () => {
      domEl_7.value = "P1  4123450.000  2654320.000  4098760.000  4123365.900  2654218.200  4098630.300\nP2  4125600.000  2651200.000  4100100.000  4125515.800  2651098.300  4099970.200\nP3  4121200.000  2658900.000  4095400.000  4121116.100  2658798.100  4095270.400\nP4  4128900.000  2653400.000  4092100.000  4128815.950  2653298.150  4091970.350";
      showToast(t("geodesy.toastSamplePointsLoaded"), "info");
    });
  }
  if (btnEl_4 && domEl_7) {
    btnEl_4.addEventListener("click", () => {
      const v_1_1 = domEl_7.value.trim();
      if (!v_1_1) {
        showToast(t("geodesy.toastNeedCommonPoints"), "warning");
        return;
      }
      const v_2_1 = v_1_1.split(/\r?\n/).map(item => item.trim()).filter(item => item.length > 0 && !item.startsWith("#") && !item.startsWith("//") && !item.startsWith(";"));
      const items_2 = [];
      v_2_1.forEach((item, idx) => {
        const parts = item.split(/[\s,;|\t]+/);
        if (parts.length >= 7) {
          const v_1_2 = parts[0];
          const v_2_2 = parseFloat(parts[1]);
          const v_3_1 = parseFloat(parts[2]);
          const v_4_1 = parseFloat(parts[3]);
          const v_5_1 = parseFloat(parts[4]);
          const v_6_1 = parseFloat(parts[5]);
          const v_7_1 = parseFloat(parts[6]);
          if (!isNaN(v_2_2) && !isNaN(v_3_1) && !isNaN(v_4_1) && !isNaN(v_5_1) && !isNaN(v_6_1) && !isNaN(v_7_1)) {
            items_2.push({
              name: v_1_2,
              x1: v_2_2,
              y1: v_3_1,
              z1: v_4_1,
              x2: v_5_1,
              y2: v_6_1,
              z2: v_7_1
            });
          }
        }
      });
      if (items_2.length < 3) {
        showToast(t("geodesy.toastMin3CommonPoints", { count: items_2.length }), "warning");
        return;
      }
      try {
        const v_1_2 = v_1.solveBursaWolf7Param(items_2);
        if (document.getElementById("p_dx")) {
          document.getElementById("p_dx").value = v_1_2.dx.toFixed(3);
        }
        if (document.getElementById("p_dy")) {
          document.getElementById("p_dy").value = v_1_2.dy.toFixed(3);
        }
        if (document.getElementById("p_dz")) {
          document.getElementById("p_dz").value = v_1_2.dz.toFixed(3);
        }
        if (document.getElementById("p_rx")) {
          document.getElementById("p_rx").value = v_1_2.rx.toFixed(4);
        }
        if (document.getElementById("p_ry")) {
          document.getElementById("p_ry").value = v_1_2.ry.toFixed(4);
        }
        if (document.getElementById("p_rz")) {
          document.getElementById("p_rz").value = v_1_2.rz.toFixed(4);
        }
        if (document.getElementById("p_ds")) {
          document.getElementById("p_ds").value = v_1_2.ds.toFixed(3);
        }
        if (domEl_8) {
          domEl_8.innerHTML = t("geodesy.m0Summary", { m0: (v_1_2.m0 * 100).toFixed(2), count: v_1_2.pointCount });
        }
        logMessage("🏛️ [7 PARAMETRE] dX: " + v_1_2.dx.toFixed(3) + " m, dY: " + v_1_2.dy.toFixed(3) + " m, dZ: " + v_1_2.dz.toFixed(3) + " m, rX: " + v_1_2.rx.toFixed(4) + "\", rY: " + v_1_2.ry.toFixed(4) + "\", rZ: " + v_1_2.rz.toFixed(4) + "\", dS: " + v_1_2.ds.toFixed(3) + " ppm, m0: " + (v_1_2.m0 * 100).toFixed(2) + " cm");
        showToast(t("geodesy.toast7ParamSuccess", { m0: (v_1_2.m0 * 100).toFixed(2) }), "success");
      } catch (v_1_2) {
        logMessage("❌ [7 PARAMETRE HATA] " + v_1_2.message);
        showToast(t("geodesy.toast7ParamError", { err: v_1_2.message }), "error");
      }
    });
  }
  const v_4 = () => {
    if (!domEl) {
      return;
    }
    const v_1_1 = v_1.epsgRegistry[domEl.value] || v_1.epsgRegistry["EPSG:4326"];
    if (v_1_1.type === "GEO") {
      if (inputEl) {
        inputEl.textContent = t("geodesy.lblLatDeg");
      }
      if (inputEl_1) {
        inputEl_1.textContent = t("geodesy.lblLonDeg");
      }
      if (inputEl_2) {
        inputEl_2.textContent = t("geodesy.lblEllipsoidHM");
      }
    } else if (v_1_1.type === "TM") {
      if (inputEl) {
        inputEl.textContent = t("geodesy.lblEastingM");
      }
      if (inputEl_1) {
        inputEl_1.textContent = t("geodesy.lblNorthingM");
      }
      if (inputEl_2) {
        inputEl_2.textContent = t("geodesy.lblHeightM");
      }
    } else if (v_1_1.type === "ECEF") {
      if (inputEl) {
        inputEl.textContent = t("geodesy.lblCartesianX");
      }
      if (inputEl_1) {
        inputEl_1.textContent = t("geodesy.lblCartesianY");
      }
      if (inputEl_2) {
        inputEl_2.textContent = t("geodesy.lblCartesianZ");
      }
    }
    v_2();
  };
  if (domEl) {
    domEl.addEventListener("change", v_4);
    v_4();
  }
  if (domEl_1) {
    domEl_1.addEventListener("change", v_2);
  }
  if (btnEl) {
    btnEl.addEventListener("click", () => {
      const v_1_1 = domEl.value;
      domEl.value = domEl_1.value;
      domEl_1.value = v_1_1;
      v_4();
      v_5();
    });
  }
  const v_5 = () => {
    const v_1_1 = parseFloat(domEl_3.value);
    const v_2_1 = parseFloat(domEl_4.value);
    const v_3_1 = parseFloat(domEl_5.value) || 0;
    if (isNaN(v_1_1) || isNaN(v_2_1)) {
      showToast(t("geodesy.toastInvalidCoords"), "warning");
      return;
    }
    const v_4_1 = domEl.value;
    const v_5_1 = domEl_1.value;
    const v_6_1 = v_1.epsgRegistry[v_4_1] || v_1.epsgRegistry["EPSG:4326"];
    const v_7_1 = v_1.epsgRegistry[v_5_1] || v_1.epsgRegistry["EPSG:5255"];
    const v_8 = v_6_1.datum !== v_7_1.datum ? v_3() : null;
    const v_9 = v_1.transformCoordinate({
      c1: v_1_1,
      c2: v_2_1,
      c3: v_3_1
    }, v_4_1, v_5_1, v_8);
    let v_10 = t("geodesy.resSource", { name: v_6_1.name }) + "\n" + t("geodesy.resInput", { c1: v_1_1.toFixed(v_6_1.unit === "deg" ? 8 : 3), c2: v_2_1.toFixed(v_6_1.unit === "deg" ? 8 : 3), h: v_3_1.toFixed(3) }) + "\n\n" + t("geodesy.resTarget", { name: v_7_1.name }) + "\n" + t("geodesy.resResult", { res: v_9.formattedResult }) + "\n";
    if (v_7_1.type === "TM") {
      const v_1_2 = v_7_1.lon0;
      v_10 += t("geodesy.resZoneInfo", { lon0: v_1_2, zone: v_7_1.zone || "3°" }) + "\n";
    }
    if (v_9.isCrossDatum) {
      v_10 += t("geodesy.resDatumTransition", { from: v_6_1.datum, to: v_7_1.datum }) + "\n";
    }
    v_10 += t("geodesy.resGeoValue", { lat: v_1.toDms(v_9.lat, true), lon: v_1.toDms(v_9.lon, false) });
    lastSingleCoordResult = v_9;
    if (domEl_2) {
      domEl_2.textContent = v_10;
    }
    showToast(t("geodesy.toastTransformSuccess"), "success");
  };
  let lastSingleCoordResult = null;
  if (btnEl_1) {
    btnEl_1.addEventListener("click", v_5);
  }
  if (btnEl_2) {
    btnEl_2.addEventListener("click", () => {
      if (domEl_2) {
        copyToClipboard(domEl_2.textContent, t("geodesy.toastTransformCopied"));
      }
    });
  }
  document.getElementById("btnCopySingleTg20")?.addEventListener("click", () => {
    if (!lastSingleCoordResult) {
      showToast(t("geodesy.toastClickTransformFirst"), "warning");
      return;
    }
    const txt = lastSingleCoordResult.lat.toFixed(8) + "  " + lastSingleCoordResult.lon.toFixed(8) + "  " + (lastSingleCoordResult.h || 0).toFixed(3);
    copyToClipboard(txt, t("geodesy.toastTg20FormatCopied") + ":\n" + txt);
  });
  document.getElementById("btnSendSingleToTg20")?.addEventListener("click", () => {
    if (!lastSingleCoordResult) {
      showToast(t("geodesy.toastClickTransformFirst"), "warning");
      return;
    }
    const inLat = document.getElementById("inputTg20Lat");
    const inLon = document.getElementById("inputTg20Lon");
    const inH = document.getElementById("inputTg20H");
    if (inLat) inLat.value = lastSingleCoordResult.lat.toFixed(8);
    if (inLon) inLon.value = lastSingleCoordResult.lon.toFixed(8);
    if (inH) inH.value = (lastSingleCoordResult.h || 0).toFixed(3);
    const tabBtn = document.querySelector('[data-tab="tab-tg20"]');
    if (tabBtn) tabBtn.click();
    setTimeout(() => {
      document.getElementById("btnCalculateTg20Single")?.click();
    }, 150);
    showToast(t("geodesy.toastTransferredToTg20"), "success");
  });
  const inputEl_3 = document.getElementById("txtBatchInput");
  const inputEl_4 = document.getElementById("fileBatchInput");
  const domEl_9 = document.getElementById("selBatchDelimiter");
  const btnEl_5 = document.getElementById("btnSwapBatchEpsg");
  document.querySelectorAll(".btn-quick-epsg").forEach(item => {
    item.addEventListener("click", () => {
      const v_1_1 = item.getAttribute("data-src");
      const v_2_1 = item.getAttribute("data-tgt");
      if (domEl_10 && v_1_1) {
        domEl_10.value = v_1_1;
      }
      if (domEl_11 && v_2_1) {
        domEl_11.value = v_2_1;
      }
      showToast(t("geodesy.toastTemplateSelected", { name: item.textContent }), "info");
    });
  });
  const btnEl_6 = document.getElementById("btnBatchTransform");
  const domEl_12 = document.getElementById("batchResultsWrapper");
  const domEl_13 = document.getElementById("tbodyBatchResults");
  const domEl_14 = document.getElementById("lblBatchSummary");
  const domEl_15 = document.getElementById("thBatchSrc1");
  const domEl_16 = document.getElementById("thBatchSrc2");
  const domEl_17 = document.getElementById("thBatchTgt1");
  const domEl_18 = document.getElementById("thBatchTgt2");
  const domEl_19 = document.getElementById("selCol1");
  const domEl_20 = document.getElementById("selCol2");
  const domEl_21 = document.getElementById("selCol3");
  const domEl_22 = document.getElementById("selCol4");
  if (btnEl_5 && domEl_10 && domEl_11) {
    btnEl_5.addEventListener("click", () => {
      const v_1_1 = domEl_10.value;
      domEl_10.value = domEl_11.value;
      domEl_11.value = v_1_1;
      showToast(t("geodesy.toastProjectionsSwapped"), "info");
    });
  }
  if (inputEl_4) {
    inputEl_4.addEventListener("change", async event => {
      const v_1_1 = event.target.files[0];
      if (v_1_1) {
        const v_1_2 = await v_1_1.text();
        if (inputEl_3) {
          inputEl_3.value = v_1_2;
        }
        showToast(t("geodesy.toastBatchLoaded", { name: v_1_1.name, size: (v_1_1.size / 1024).toFixed(1) }), "info");
      }
    });
  }
  if (btnEl_6) {
    btnEl_6.addEventListener("click", () => {
      const v_1_1 = inputEl_3?.value || "";
      if (!v_1_1.trim()) {
        showToast(t("geodesy.toastNeedCoordText"), "warning");
        return;
      }
      const v_2_1 = domEl_9?.value || "AUTO";
      const v_3_1 = v_1.parseBatchCoordinateText(v_1_1, v_2_1);
      if (v_3_1.rows.length === 0) {
        showToast(t("geodesy.toastInvalidCoordLines"), "warning");
        return;
      }
      const v_4_1 = domEl_19.value;
      const v_5_1 = domEl_20.value;
      const v_6_1 = domEl_21.value;
      const v_7_1 = domEl_22.value;
      const v_8 = domEl_10 ? domEl_10.value : domEl.value;
      const v_9 = domEl_11 ? domEl_11.value : domEl_1.value;
      const v_10 = v_1.epsgRegistry[v_8] || v_1.epsgRegistry["EPSG:5255"];
      const v_11 = v_1.epsgRegistry[v_9] || v_1.epsgRegistry["EPSG:4326"];
      const v_12 = v_10.datum !== v_11.datum ? v_3() : null;
      if (domEl_15) {
        domEl_15.textContent = "C1 (" + (v_10.type === "GEO" ? t("geodesy.lblLatEnlem") : v_10.type === "ECEF" ? "X" : "Y") + ")";
      }
      if (domEl_16) {
        domEl_16.textContent = "C2 (" + (v_10.type === "GEO" ? t("geodesy.lblLonBoylam") : v_10.type === "ECEF" ? "Y" : "X") + ")";
      }
      if (domEl_17) {
        domEl_17.textContent = "C1' (" + (v_11.type === "GEO" ? t("geodesy.lblLatEnlem") : v_11.type === "ECEF" ? "X" : "Y") + ")";
      }
      if (domEl_18) {
        domEl_18.textContent = "C2' (" + (v_11.type === "GEO" ? t("geodesy.lblLonBoylam") : v_11.type === "ECEF" ? "Y" : "X") + ")";
      }
      items = [];
      if (domEl_13) {
        domEl_13.innerHTML = "";
      }
      v_3_1.rows.forEach((item, idx) => {
        let v_1_2 = "P" + (idx + 1);
        let num = 0;
        let num_1 = 0;
        let num_2 = 0;
        let str = "";
        const v_2_2 = (arg1, arg2) => {
          const v_3_2 = item[arg2] || "";
          if (arg1 === "PN") {
            v_1_2 = v_3_2 || "P" + (idx + 1);
          } else if (arg1 === "C1") {
            num = parseFloat(v_3_2) || 0;
          } else if (arg1 === "C2") {
            num_1 = parseFloat(v_3_2) || 0;
          } else if (arg1 === "C3") {
            num_2 = parseFloat(v_3_2) || 0;
          } else if (arg1 === "CODE") {
            str = v_3_2;
          }
        };
        v_2_2(v_4_1, 0);
        v_2_2(v_5_1, 1);
        v_2_2(v_6_1, 2);
        v_2_2(v_7_1, 3);
        if (num !== 0 || num_1 !== 0) {
          const v_1_3 = v_1.transformCoordinate({
            c1: num,
            c2: num_1,
            c3: num_2
          }, v_8, v_9, v_12);
          const obj = {
            index: idx + 1,
            pn: v_1_2,
            srcC1: num,
            srcC2: num_1,
            srcC3: num_2,
            tgtC1: v_1_3.c1,
            tgtC2: v_1_3.c2,
            tgtC3: v_1_3.c3,
            lat: v_1_3.lat,
            lon: v_1_3.lon,
            h: v_1_3.h,
            code: str
          };
          items.push(obj);
          if (domEl_13) {
            const trEl = document.createElement("tr");
            const v_1_4 = v_10.unit === "deg" ? 8 : 3;
            const v_2_3 = v_11.unit === "deg" ? 8 : 3;
            trEl.innerHTML = "\n                            <td style=\"font-family: var(--font-mono); color: var(--text-dim);\">" + (idx + 1) + "</td>\n                            <td><strong class=\"font-bold text-main\">" + v_1_2 + "</strong></td>\n                            <td style=\"font-family: var(--font-mono);\">" + num.toFixed(v_1_4) + "</td>\n                            <td style=\"font-family: var(--font-mono);\">" + num_1.toFixed(v_1_4) + "</td>\n                            <td style=\"font-family: var(--font-mono);\">" + num_2.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono); font-weight: 700; color: var(--cyan-400);\">" + v_1_3.c1.toFixed(v_2_3) + "</td>\n                            <td style=\"font-family: var(--font-mono); font-weight: 700; color: var(--cyan-400);\">" + v_1_3.c2.toFixed(v_2_3) + "</td>\n                            <td style=\"font-family: var(--font-mono); color: var(--purple-400);\">" + v_1_3.c3.toFixed(3) + "</td>\n                        ";
            domEl_13.appendChild(trEl);
          }
        }
      });
      if (items.length > 0) {
        if (domEl_12) {
          domEl_12.style.display = "flex";
        }
        if (domEl_14) {
          domEl_14.innerHTML = t("geodesy.batchSummaryHtml", { count: items.length, from: v_10.name.split("(")[0], to: v_11.name.split("(")[0] });
        }
        showToast(t("geodesy.toastBatchConverted", { count: items.length, from: v_8, to: v_9 }), "success");
      }
    });
  }
  document.getElementById("btnExportBatchNcn")?.addEventListener("click", () => {
    if (items.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadNcn("donusturulen_noktalar.ncn", items);
  });
  document.getElementById("btnExportBatchDxf")?.addEventListener("click", () => {
    if (items.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadDxf("donusturulen_noktalar.dxf", items);
  });
  document.getElementById("btnExportBatchKml")?.addEventListener("click", () => {
    if (items.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadKml("donusturulen_noktalar.kml", items, { docName: "Donusturulen Noktalar" });
  });
  document.getElementById("btnExportBatchTxt")?.addEventListener("click", () => {
    if (items.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadCsv("donusturulen_noktalar.csv", items);
  });
  document.getElementById("btnCopyBatchTg20")?.addEventListener("click", () => {
    if (items.length === 0) {
      showToast(t("geodesy.toastNoConvertedList"), "warning");
      return;
    }
    let txt = "";
    items.forEach(item => {
      txt += item.pn + "  " + item.lat.toFixed(8) + "  " + item.lon.toFixed(8) + "  " + (item.h || 0).toFixed(3) + "\n";
    });
    copyToClipboard(txt.trim(), t("geodesy.toastTg20BatchCopied", { count: items.length }));
  });
  document.getElementById("btnSendBatchToTg20")?.addEventListener("click", () => {
    if (items.length === 0) {
      showToast(t("geodesy.toastNoConvertedList"), "warning");
      return;
    }
    let txt = "";
    items.forEach(item => {
      txt += item.pn + "  " + item.lat.toFixed(8) + "  " + item.lon.toFixed(8) + "  " + (item.h || 0).toFixed(3) + "\n";
    });
    const batchInput = document.getElementById("txtTg20BatchInput");
    if (batchInput) {
      batchInput.value = txt.trim();
    }
    const tabBtn = document.querySelector('[data-tab="tab-tg20"]');
    if (tabBtn) tabBtn.click();
    setTimeout(() => {
      document.getElementById("btnProcessTg20Batch")?.click();
    }, 200);
    showToast(t("geodesy.toastTransferredBatchTg20", { count: items.length }), "success");
  });
  let v_6 = null;
  let items_1 = [];
  const btnEl_7 = document.getElementById("btnTabHelmertDns");
  const btnEl_8 = document.getElementById("btnTabHelmertPoints");
  const domEl_23 = document.getElementById("paneHelmertDns");
  const domEl_24 = document.getElementById("paneHelmertPoints");
  btnEl_7?.addEventListener("click", () => {
    btnEl_7.classList.add("btn-primary");
    btnEl_7.classList.remove("btn-secondary");
    btnEl_8.classList.add("btn-secondary");
    btnEl_8.classList.remove("btn-primary");
    if (domEl_23) {
      domEl_23.classList.remove("d-none");
      domEl_23.style.setProperty("display", "flex", "important");
    }
    if (domEl_24) {
      domEl_24.classList.add("d-none");
      domEl_24.style.setProperty("display", "none", "important");
    }
  });
  btnEl_8?.addEventListener("click", () => {
    btnEl_8.classList.add("btn-primary");
    btnEl_8.classList.remove("btn-secondary");
    btnEl_7.classList.add("btn-secondary");
    btnEl_7.classList.remove("btn-primary");
    if (domEl_24) {
      domEl_24.classList.remove("d-none");
      domEl_24.style.setProperty("display", "flex", "important");
    }
    if (domEl_23) {
      domEl_23.classList.add("d-none");
      domEl_23.style.setProperty("display", "none", "important");
    }
  });
  const inputEl_5 = document.getElementById("inputHelmertDnsFile");
  const domEl_25 = document.getElementById("txtHelmertDnsFileName");
  const domEl_26 = document.getElementById("txtHelmertDnsContent");
  const btnEl_9 = document.getElementById("btnApplyDnsParams");
  inputEl_5?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.text();
      if (domEl_26) {
        domEl_26.value = v_1_1;
      }
      if (domEl_25) {
        domEl_25.innerHTML = "<span style=\"color: var(--cyan-400); font-weight:700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size:10px;\">" + t("geodesy.dnsBadge") + "</span>";
      }
      v_7(v_1_1, v_2_1.name);
    }
  });
  function v_7(arg1, arg2 = t("geodesy.dnsBadge")) {
    if (!arg1 || !arg1.trim()) {
      showToast(t("geodesy.toastNeedDnsContent"), "warning");
      return;
    }
    try {
      const v_1_1 = v_1.parseNetcadDns(arg1);
      v_6 = v_1_1;
      document.getElementById("resHelmertA").textContent = v_1_1.a.toFixed(8);
      document.getElementById("resHelmertB").textContent = v_1_1.b.toFixed(8);
      document.getElementById("resHelmertDy").textContent = v_1_1.dy0.toFixed(3) + " m";
      document.getElementById("resHelmertDx").textContent = v_1_1.dx0.toFixed(3) + " m";
      document.getElementById("resHelmertScale").textContent = v_1_1.scale_m.toFixed(8) + " (" + (v_1_1.dm_ppm > 0 ? "+" : "") + v_1_1.dm_ppm.toFixed(1) + " ppm)";
      document.getElementById("resHelmertTheta").textContent = v_1_1.theta_grad.toFixed(6) + " grad (" + v_1_1.theta_deg.toFixed(4) + "°)";
      document.getElementById("badgeHelmertM0").textContent = t("geodesy.dnsParams");
      const domEl_33 = document.getElementById("lblHelmertStatusSource");
      if (domEl_33) {
        domEl_33.innerHTML = "<i class=\"fa-solid fa-file-lines\" style=\"color: var(--cyan-400);\"></i> " + t("geodesy.dnsFileActivated", { name: arg2 });
      }
      const domEl_34 = document.getElementById("wrapperHelmertResiduals");
      if (domEl_34) {
        domEl_34.style.display = "none";
      }
      if (domEl_29) {
        domEl_29.style.display = "flex";
      }
      logMessage(t("geodesy.logDnsLoaded", { a: v_1_1.a.toFixed(6), b: v_1_1.b.toFixed(6), dy: v_1_1.dy0.toFixed(2), dx: v_1_1.dx0.toFixed(2) }));
      showToast(t("geodesy.toastDnsActivated"), "success");
    } catch (v_1_1) {
      logMessage("❌ [DNS HATA] " + (v_1_1.message || v_1_1));
      showToast(t("geodesy.toastDnsReadError", { err: v_1_1.message }), "error");
    }
  }
  btnEl_9?.addEventListener("click", () => {
    v_7(domEl_26?.value, "Netcad .DNS Metni");
  });
  const btnEl_10 = document.getElementById("btnLoadHelmertSample");
  const btnEl_11 = document.getElementById("btnSolveHelmert");
  const btnEl_12 = document.getElementById("btnTransformHelmertPoints");
  const domEl_27 = document.getElementById("txtHelmertCommonPoints");
  const domEl_28 = document.getElementById("txtHelmertPointsToTransform");
  const domEl_29 = document.getElementById("helmertResultsWrapper");
  const domEl_30 = document.getElementById("tbodyHelmertResiduals");
  const domEl_31 = document.getElementById("wrapperHelmertTransformedPoints");
  const domEl_32 = document.getElementById("tbodyHelmertTransformed");
  btnEl_10?.addEventListener("click", () => {
    if (domEl_27) {
      domEl_27.value = "P1  500120.000  4520100.000  500122.500  4520104.200\nP2  501240.000  4520150.000  501242.600  4520154.100\nP3  501260.000  4521200.000  501262.400  4521204.300\nP4  500150.000  4521180.000  500152.700  4521184.000";
    }
    if (domEl_28) {
      domEl_28.value = "101  500500.000  4520500.000  125.400\n102  500650.000  4520750.000  128.200\n103  500800.000  4520900.000  131.050\n104  500950.000  4521050.000  133.800";
    }
    showToast(t("geodesy.toastSample2dLoaded"), "info");
  });
  btnEl_11?.addEventListener("click", () => {
    const v_1_1 = domEl_27?.value.trim();
    if (!v_1_1) {
      showToast(t("geodesy.toastNeedMin2CommonPoints"), "warning");
      return;
    }
    const v_2_1 = v_1_1.split(/\r?\n/).map(item => item.trim()).filter(item => item.length > 0);
    const items_2 = [];
    v_2_1.forEach(item => {
      const v_1_2 = item.split(/[\s,;\t]+/).filter(Boolean);
      if (v_1_2.length >= 5) {
        const v_1_3 = v_1_2[0];
        const v_2_2 = parseFloat(v_1_2[1]);
        const v_3_1 = parseFloat(v_1_2[2]);
        const v_4_1 = parseFloat(v_1_2[3]);
        const v_5_1 = parseFloat(v_1_2[4]);
        if (!isNaN(v_2_2) && !isNaN(v_3_1) && !isNaN(v_4_1) && !isNaN(v_5_1)) {
          items_2.push({
            name: v_1_3,
            y1: v_2_2,
            x1: v_3_1,
            y2: v_4_1,
            x2: v_5_1
          });
        }
      }
    });
    if (items_2.length < 2) {
      showToast(t("geodesy.toastNeedMin2CommonPoints"), "error");
      return;
    }
    try {
      const v_1_2 = v_1.solveHelmert2D(items_2);
      v_6 = v_1_2;
      document.getElementById("resHelmertA").textContent = v_1_2.a.toFixed(8);
      document.getElementById("resHelmertB").textContent = v_1_2.b.toFixed(8);
      document.getElementById("resHelmertDy").textContent = v_1_2.dy0.toFixed(3) + " m";
      document.getElementById("resHelmertDx").textContent = v_1_2.dx0.toFixed(3) + " m";
      document.getElementById("resHelmertScale").textContent = v_1_2.scale_m.toFixed(8) + " (" + (v_1_2.dm_ppm > 0 ? "+" : "") + v_1_2.dm_ppm.toFixed(1) + " ppm)";
      document.getElementById("resHelmertTheta").textContent = v_1_2.theta_grad.toFixed(6) + " grad (" + v_1_2.theta_deg.toFixed(4) + "°)";
      document.getElementById("badgeHelmertM0").textContent = "m0 = " + (v_1_2.m0 * 100).toFixed(2) + " cm (" + v_1_2.m0.toFixed(4) + " m)";
      const domEl_33 = document.getElementById("lblHelmertStatusSource");
      if (domEl_33) {
        domEl_33.innerHTML = t("geodesy.helmertFromPoints", { count: items_2.length });
      }
      const domEl_34 = document.getElementById("wrapperHelmertResiduals");
      if (domEl_34) {
        domEl_34.style.display = "block";
      }
      if (domEl_30) {
        domEl_30.innerHTML = "";
        v_1_2.residuals.forEach(item => {
          const trEl = document.createElement("tr");
          const v_1_3 = (item.vy * 100).toFixed(2);
          const v_2_2 = (item.vx * 100).toFixed(2);
          const v_3_1 = (item.vs * 100).toFixed(2);
          trEl.innerHTML = "\n                        <td><strong>" + item.name + "</strong></td>\n                        <td style=\"font-family: var(--font-mono);\">" + item.y1.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono);\">" + item.x1.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono);\">" + item.y2.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono);\">" + item.x2.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono); color: var(--cyan-400);\">" + item.calc_y2.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono); color: var(--cyan-400);\">" + item.calc_x2.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono); color: " + (item.vy >= 0 ? "#34d399" : "#f87171") + ";\">" + (item.vy >= 0 ? "+" : "") + v_1_3 + "</td>\n                        <td style=\"font-family: var(--font-mono); color: " + (item.vx >= 0 ? "#34d399" : "#f87171") + ";\">" + (item.vx >= 0 ? "+" : "") + v_2_2 + "</td>\n                        <td style=\"font-family: var(--font-mono); font-weight: 700; color: #fef08a;\">" + v_3_1 + "</td>\n                    ";
          domEl_30.appendChild(trEl);
        });
      }
      if (domEl_29) {
        domEl_29.style.display = "flex";
      }
      logMessage(t("geodesy.logHelmertSolved", { count: items_2.length, m0: (v_1_2.m0 * 100).toFixed(2), dm: v_1_2.dm_ppm.toFixed(1) }));
      showToast(t("geodesy.toastHelmertSuccess", { m0: (v_1_2.m0 * 100).toFixed(2) }), "success");
    } catch (v_1_2) {
      logMessage("❌ [HELMERT HATA] " + (v_1_2.message || v_1_2));
      showToast(t("geodesy.toastHelmertError", { err: v_1_2.message }), "error");
    }
  });
  btnEl_12?.addEventListener("click", () => {
    if (!v_6) {
      showToast(t("geodesy.toastNeedDnsOrSolveFirst"), "warning");
      return;
    }
    const v_1_1 = domEl_28?.value.trim();
    if (!v_1_1) {
      showToast(t("geodesy.toastNeedPointListToConvert"), "warning");
      return;
    }
    const v_2_1 = v_1_1.split(/\r?\n/).map(item => item.trim()).filter(item => item.length > 0);
    items_1 = [];
    if (domEl_32) {
      domEl_32.innerHTML = "";
    }
    v_2_1.forEach((item, idx) => {
      const v_1_2 = item.split(/[\s,;\t]+/).filter(Boolean);
      if (v_1_2.length >= 3) {
        const v_1_3 = v_1_2[0];
        const v_2_2 = parseFloat(v_1_2[1]);
        const v_3_1 = parseFloat(v_1_2[2]);
        const v_4_1 = v_1_2[3] ? parseFloat(v_1_2[3]) : 0;
        if (!isNaN(v_2_2) && !isNaN(v_3_1)) {
          const v_1_4 = v_1.transformPointHelmert2D(v_2_2, v_3_1, v_6);
          const obj = {
            name: v_1_3,
            y1: v_2_2,
            x1: v_3_1,
            y2: v_1_4.y,
            x2: v_1_4.x,
            z: isNaN(v_4_1) ? 0 : v_4_1
          };
          items_1.push(obj);
          if (domEl_32) {
            const trEl = document.createElement("tr");
            trEl.innerHTML = "\n                            <td style=\"font-family: var(--font-mono); color: var(--text-dim);\">" + (idx + 1) + "</td>\n                            <td><strong class=\"font-bold text-main\">" + v_1_3 + "</strong></td>\n                            <td style=\"font-family: var(--font-mono);\">" + v_2_2.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono);\">" + v_3_1.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono); font-weight: 700; color: var(--emerald-400);\">" + v_1_4.y.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono); font-weight: 700; color: var(--emerald-400);\">" + v_1_4.x.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono);\">" + obj.z.toFixed(3) + "</td>\n                        ";
            domEl_32.appendChild(trEl);
          }
        }
      }
    });
    if (items_1.length > 0) {
      if (domEl_31) {
        domEl_31.style.display = "block";
      }
      showToast(t("geodesy.toastBatchHelmertConverted", { count: items_1.length }), "success");
    }
  });
  document.getElementById("btnExportHelmertNcn")?.addEventListener("click", () => {
    if (items_1.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    const pts = items_1.map(it => ({ name: it.name, y: it.y2, x: it.x2, z: it.z }));
    StudioExporter.downloadNcn("helmert_donusum_noktalari.ncn", pts);
  });
  document.getElementById("btnExportHelmertDxf")?.addEventListener("click", () => {
    if (items_1.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    const pts = items_1.map(it => ({ name: it.name, y: it.y2, x: it.x2, z: it.z }));
    StudioExporter.downloadDxf("helmert_donusum_noktalari.dxf", pts);
  });
  document.getElementById("btnExportHelmertCsv")?.addEventListener("click", () => {
    if (items_1.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadCsv("helmert_donusum_noktalari.csv", items_1, ["NOKTA", "Y_KAYNAK", "X_KAYNAK", "Y_DONUSEN", "X_DONUSEN", "KOT"]);
  });
}
let tg20BatchReducedPoints = [];
