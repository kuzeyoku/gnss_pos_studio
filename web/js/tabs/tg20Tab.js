/**
 * Harita Tools - HGM TG-20 Geoid Height Reduction Controller
 */
function initTg20GeoidStation() {
  if (state.tg20Engine.isLoaded || state.tg20Engine.tryLoadEmbeddedModel()) {
    logMessage(t("tg20.readyLog"));
  }
  const v_1 = arg1 => {
    if (!arg1) {
      return NaN;
    }
    if (typeof arg1 === "number") {
      return arg1;
    }
    arg1 = String(arg1).trim();
    if (!isNaN(parseFloat(arg1)) && !arg1.includes(" ") && !arg1.includes(":") && !arg1.includes("°")) {
      return parseFloat(arg1);
    }
    const v_2_1 = arg1.replace(/[°'"]/g, " ").split(/[:\s]+/).filter(Boolean).map(Number);
    if (v_2_1.length >= 3) {
      const v_1_1 = v_2_1[0] < 0 ? -1 : 1;
      return (Math.abs(v_2_1[0]) + v_2_1[1] / 60 + v_2_1[2] / 3600) * v_1_1;
    } else if (v_2_1.length === 2) {
      const v_1_1 = v_2_1[0] < 0 ? -1 : 1;
      return (Math.abs(v_2_1[0]) + v_2_1[1] / 60) * v_1_1;
    } else if (v_2_1.length === 1) {
      return v_2_1[0];
    }
    return NaN;
  };
  const inputEl = document.getElementById("inputTg20Lat");
  const inputEl_1 = document.getElementById("inputTg20Lon");
  const inputEl_2 = document.getElementById("inputTg20H");
  const btnEl = document.getElementById("btnCalculateTg20Single");
  const v_2 = () => {
    if (!state.tg20Engine.isLoaded) {
      state.tg20Engine.tryLoadEmbeddedModel();
    }
    const v_1_1 = v_1(inputEl?.value);
    const v_2_1 = v_1(inputEl_1?.value);
    const v_3_1 = parseFloat(inputEl_2?.value) || 0;
    if (isNaN(v_1_1) || isNaN(v_2_1)) {
      showToast(t("tg20.toastInvalidCoords"), "warning");
      return;
    }
    const v_4 = state.tg20Engine.reduceHeight(v_1_1, v_2_1, v_3_1);
    const domEl_3 = document.getElementById("resTg20LatLon");
    const domEl_4 = document.getElementById("resTg20ElipH");
    const domEl_5 = document.getElementById("resTg20N");
    const domEl_6 = document.getElementById("resTg20OrthH");
    if (domEl_3) {
      domEl_3.textContent = v_4.lat.toFixed(6) + "° K, " + v_4.lon.toFixed(6) + "° D";
    }
    if (domEl_4) {
      domEl_4.textContent = v_3_1.toFixed(3) + " m";
    }
    if (domEl_5) {
      domEl_5.textContent = v_4.N !== null ? "" + (v_4.N >= 0 ? "+" : "") + v_4.N.toFixed(3) + " m" : t("tg20.outOfScope");
    }
    if (domEl_6) {
      domEl_6.textContent = v_4.H !== null ? v_4.H.toFixed(3) + " m" : v_3_1.toFixed(3) + " m";
    }
    if (v_4.inBounds) {
      showToast(t("tg20.toastPointReduced", { n: v_4.N.toFixed(3), h: v_4.H.toFixed(3) }), "success");
      logMessage(t("tg20.logSingleReduction", { lat: v_4.lat.toFixed(6), lon: v_4.lon.toFixed(6), h: v_3_1.toFixed(3), n: v_4.N.toFixed(3), H: v_4.H.toFixed(3) }));
    } else {
      showToast(t("tg20.toastOutOfTurkeyBounds"), "warning");
    }
  };
  document.getElementById("btnCopyTg20SingleReport")?.addEventListener("click", () => {
    const v_1_1 = v_1(inputEl?.value);
    const v_2_1 = v_1(inputEl_1?.value);
    const v_3_1 = parseFloat(inputEl_2?.value) || 0;
    const v_4 = state.tg20Engine.reduceHeight(v_1_1, v_2_1, v_3_1);
    const v_5 = t("tg20.singleReportTemplate", {
      lat: v_4.lat.toFixed(6),
      lon: v_4.lon.toFixed(6),
      h: v_3_1.toFixed(3),
      n: (v_4.N !== null ? "+" + v_4.N.toFixed(3) : "--"),
      H: (v_4.H !== null ? v_4.H.toFixed(3) : "--"),
      status: v_4.status,
      date: new Date().toLocaleDateString("tr-TR")
    });
    copyToClipboard(v_5, t("tg20.toastReportCopied"));
  });
  if (btnEl) {
    btnEl.addEventListener("click", v_2);
  }
  const btnEl_1 = document.getElementById("btnLoadTg20SamplePoints");
  const inputEl_3 = document.getElementById("fileTg20BatchInput");
  const inputEl_4 = document.getElementById("txtTg20BatchInput");
  const btnEl_2 = document.getElementById("btnProcessTg20Batch");
  const domEl = document.getElementById("wrapperTg20BatchResults");
  const domEl_1 = document.getElementById("tbodyTg20BatchResults");
  const domEl_2 = document.getElementById("lblTg20BatchSummary");
  const v_3 = async () => {
    const v_1_1 = inputEl_4?.value.trim() || "";
    if (!v_1_1) {
      showToast(t("tg20.toastNeedPoints"), "warning");
      return false;
    }
    if (!state.tg20Engine.isLoaded) {
      state.tg20Engine.tryLoadEmbeddedModel();
    }
    const v_2_1 = v_1_1.split(/\r?\n/).map(item => item.trim()).filter(item => item.length > 0 && !item.startsWith(";") && !item.startsWith("#"));
    const items = [];
    v_2_1.forEach((line, idx) => {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) return;

      let name = "P" + (idx + 1);
      let lat = NaN;
      let lon = NaN;
      let h = 0;

      if (parts.length >= 4) {
        name = parts[0];
        const val1 = v_1(parts[1]);
        const val2 = v_1(parts[2]);
        h = parseFloat(parts[3]) || 0;

        if (val1 >= 34 && val1 <= 44 && val2 >= 24 && val2 <= 46) {
          lat = val1;
          lon = val2;
        } else if (val2 >= 34 && val2 <= 44 && val1 >= 24 && val1 <= 46) {
          lat = val2;
          lon = val1;
        } else if (state.geodesyEngine && (val1 > 100000 || val2 > 100000)) {
          let y = val1, x = val2;
          if (val1 > val2) { x = val1; y = val2; }
          const approxDom = Math.round(Math.min(Math.max((y - 500000) / 100000 * 1.5 + 33, 27), 45) / 3) * 3;
          const geo = state.geodesyEngine.tmToGeographic(y, x, approxDom || 33);
          lat = geo.lat;
          lon = geo.lon;
        } else {
          lat = val1;
          lon = val2;
        }
      } else if (parts.length === 3) {
        const val0 = v_1(parts[0]);
        const val1 = v_1(parts[1]);
        const val2 = parseFloat(parts[2]) || 0;

        if (val0 >= 34 && val0 <= 44 && val1 >= 24 && val1 <= 46) {
          lat = val0;
          lon = val1;
          h = val2;
        } else if (val1 >= 34 && val1 <= 44 && parseFloat(parts[2]) >= 24 && parseFloat(parts[2]) <= 46) {
          name = parts[0];
          lat = val1;
          lon = parseFloat(parts[2]);
          h = 0;
        } else if (state.geodesyEngine && (val0 > 100000 || val1 > 100000)) {
          let y = val0, x = val1;
          if (val0 > val1) { x = val0; y = val1; }
          const approxDom = Math.round(Math.min(Math.max((y - 500000) / 100000 * 1.5 + 33, 27), 45) / 3) * 3;
          const geo = state.geodesyEngine.tmToGeographic(y, x, approxDom || 33);
          lat = geo.lat;
          lon = geo.lon;
          h = val2;
        } else {
          name = parts[0];
          lat = val1;
          lon = val2;
        }
      } else if (parts.length === 2) {
        const val0 = v_1(parts[0]);
        const val1 = v_1(parts[1]);
        if (val0 >= 34 && val0 <= 44 && val1 >= 24 && val1 <= 46) {
          lat = val0;
          lon = val1;
        } else {
          name = parts[0];
          lat = val1;
          lon = 0;
        }
      }

      if (!isNaN(lat) && !isNaN(lon)) {
        items.push({
          name: name,
          lat: lat,
          lon: lon,
          h: h
        });
      }
    });
    if (items.length === 0) {
      showToast(t("tg20.toastInvalidCoordLines"), "warning");
      return false;
    }
    tg20BatchReducedPoints = items.map(item => {
      const v_1_2 = state.tg20Engine.reduceHeight(item.lat, item.lon, item.h);
      return {
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        h: item.h,
        N: v_1_2.N,
        H: v_1_2.H,
        inBounds: v_1_2.inBounds,
        status: v_1_2.status
      };
    });
    if (domEl_1) {
      domEl_1.innerHTML = "";
    }
    tg20BatchReducedPoints.forEach((item, idx) => {
      const trEl = document.createElement("tr");
      trEl.innerHTML = `
        <td style="font-family: var(--font-mono); color: var(--text-dim); text-align: center;">${idx + 1}</td>
        <td><strong class="font-bold text-main font-mono">${item.name}</strong></td>
        <td style="font-family: var(--font-mono);">${item.lat.toFixed(6)}°</td>
        <td style="font-family: var(--font-mono);">${item.lon.toFixed(6)}°</td>
        <td style="font-family: var(--font-mono); color: var(--cyan-400); font-weight: 600;">${item.h.toFixed(3)} m</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--amber-400);">${item.N !== null ? (item.N >= 0 ? "+" : "") + item.N.toFixed(3) + " m" : "--"}</td>
        <td style="font-family: var(--font-mono); font-weight: 800; color: var(--emerald-400); font-size: 13px;">${item.H !== null ? item.H.toFixed(3) + " m" : "--"}</td>
        <td style="text-align: center;"><span class="badge ${item.inBounds ? "badge-emerald" : "badge-rose"}" style="font-size: 10px; padding: 2px 8px;">${item.inBounds ? t("tg20.statusOk") : t("tg20.outOfScope")}</span></td>
      `;
      domEl_1?.appendChild(trEl);
    });
    if (domEl) {
      domEl.classList.remove("d-none");
      domEl.style.display = "flex";
      domEl.style.flexDirection = "column";
      domEl.style.width = "100%";
    }
    if (domEl_2) {
      const v_1_2 = tg20BatchReducedPoints.filter(item => item.inBounds).length;
      const v_2_2 = v_1_2 > 0 ? (tg20BatchReducedPoints.filter(item => item.inBounds).reduce((arg1, arg2) => arg1 + arg2.N, 0) / v_1_2).toFixed(3) : "--";
      domEl_2.innerHTML = t("tg20.batchSummary", { count: tg20BatchReducedPoints.length, avgN: v_2_2 });
    }
    logMessage(t("tg20.logBatchReduced", { count: tg20BatchReducedPoints.length }));
    return true;
  };
  if (btnEl_1 && inputEl_4) {
    btnEl_1.addEventListener("click", async () => {
      inputEl_4.value = "ANKARA_KIZILAY   39.920800   32.854100   900.000\nISTANBUL_TAKSIM  41.037000   28.985000   100.000\nIZMIR_KONAK      38.419200   27.128700    50.000\nANTALYA_KALEICI  36.884100   30.705600    60.000\nTRABZON_MEYDAN   41.002700   39.716800    40.000\nDIYARBAKIR_SUR   37.914400   40.230600   650.000";
      showToast(t("tg20.toastSampleLoaded"), "info");
      await v_3();
    });
  }
  if (inputEl_3 && inputEl_4) {
    inputEl_3.addEventListener("change", async event => {
      const v_1_1 = event.target.files?.[0];
      if (v_1_1) {
        const v_1_2 = await v_1_1.text();
        inputEl_4.value = v_1_2;
        showToast(t("tg20.toastBatchLoaded", { name: v_1_1.name, size: (v_1_1.size / 1024).toFixed(1) }), "info");
        await v_3();
      }
    });
  }
  if (btnEl_2) {
    btnEl_2.addEventListener("click", async () => {
      const v_1_1 = await v_3();
      if (v_1_1) {
        showToast(t("tg20.toastBatchReduced", { count: tg20BatchReducedPoints.length }), "success");
      }
    });
  }
  document.getElementById("btnExportTg20ReportTxt")?.addEventListener("click", async () => {
    if (tg20BatchReducedPoints.length === 0) {
      const v_1_2 = await v_3();
      if (!v_1_2) {
        return;
      }
    }
    const v_1_1 = state.tg20Engine.generateReductionReport(tg20BatchReducedPoints);
    downloadTextFile("Kadastro_TG20_Kot_Indirgeme_Raporu.txt", v_1_1);
    showToast(t("tg20.toastReportDownloaded"), "success");
  });
  document.getElementById("btnExportTg20Ncn")?.addEventListener("click", async () => {
    if (tg20BatchReducedPoints.length === 0) {
      const v_1_1 = await v_3();
      if (!v_1_1) return;
    }
    const pts = tg20BatchReducedPoints.map(it => ({
      name: it.name,
      y: it.lon,
      x: it.lat,
      z: it.H !== null ? it.H : it.h
    }));
    StudioExporter.downloadNcn("Kadastro_TG20_Ortometrik.ncn", pts);
  });
  document.getElementById("btnExportTg20Csv")?.addEventListener("click", async () => {
    if (tg20BatchReducedPoints.length === 0) {
      const v_1_1 = await v_3();
      if (!v_1_1) return;
    }
    const rows = tg20BatchReducedPoints.map(it => ({
      name: it.name,
      y: it.h,
      x: it.N !== null ? it.N : 0,
      z: it.H !== null ? it.H : 0,
      lat: it.lat,
      lon: it.lon
    }));
    StudioExporter.downloadCsv("Kadastro_TG20_Ortometrik.csv", rows, ["NOKTA_ADI", "ELIPSOIT_KOTU_h", "TG20_JEOIT_N", "ORTOMETRIK_KOT_H", "ENLEM_WGS84", "BOYLAM_WGS84"]);
  });
  document.getElementById("btnPrintTg20Report")?.addEventListener("click", async () => {
    if (tg20BatchReducedPoints.length === 0) {
      const v_1_2 = await v_3();
      if (!v_1_2) {
        return;
      }
    }
    const v_1_1 = state.tg20Engine.generatePrintableReport(tg20BatchReducedPoints);
    const v_2_1 = window.open("", "_blank", "width=950,height=750");
    if (v_2_1) {
      v_2_1.document.write(v_1_1);
      v_2_1.document.close();
      logMessage(t("tg20.logPrintOpened"));
      showToast(t("tg20.toastPrintWindowOpened"), "success");
    }
  });

  // Window level helpers for map popup button actions
  window.sendTg20PointToSingle = (lat, lng) => {
    if (inputEl) inputEl.value = Number(lat).toFixed(6);
    if (inputEl_1) inputEl_1.value = Number(lng).toFixed(6);
    btnEl?.click();
    showToast(t("tg20.toastCoordsTransferred"), "success");
    document.getElementById("cardTg20SingleResult")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  window.copyTg20NVal = valStr => {
    copyToClipboard(valStr, t("tg20.toastUndulationCopied", { val: valStr }));
  };

  document.getElementById("btnSendTg20MapToSingle")?.addEventListener("click", () => {
    if (state.lastTg20QueryPoint) {
      window.sendTg20PointToSingle(state.lastTg20QueryPoint.lat, state.lastTg20QueryPoint.lng);
    } else {
      showToast(t("tg20.toastClickMapFirst"), "info");
    }
  });

  initTg20InteractiveMap();
}

function initTg20InteractiveMap() {
  const mapEl = document.getElementById("tg20MapContainer");
  if (!mapEl || typeof L === "undefined") return;

  if (state.tg20Map) {
    state.tg20Map.invalidateSize();
    return;
  }

  const { map } = createStudioMap("tg20MapContainer", {
    center: [39.0, 35.2],
    zoom: 6,
    minZoom: 5,
    maxZoom: 19,
    defaultType: "hybrid"
  });
  state.tg20Map = map;

  // Türkiye TG-20 Sınır Çerçevesi (35.5° - 42.5° N, 25.5° - 45.0° E)
  const tg20Bounds = [
    [35.5, 25.5],
    [35.5, 45.0],
    [42.5, 45.0],
    [42.5, 25.5]
  ];
  L.polygon(tg20Bounds, {
    color: "#f59e0b",
    weight: 1.5,
    dashArray: "4, 6",
    fillColor: "#f59e0b",
    fillOpacity: 0.03,
    interactive: false
  }).addTo(state.tg20Map);

  state.tg20GridLayerGroup = L.layerGroup().addTo(state.tg20Map);

  // Custom Pulsing TG-20 Icon
  const tg20Icon = L.divIcon({
    className: "tg20-leaflet-icon-wrapper",
    html: `
      <div class="tg20-pulsing-marker">
        <div class="tg20-pulsing-ring"></div>
        <div class="tg20-pulsing-core"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // Window level helper to zoom to the 1'x1' grid cell
  window.zoomToTg20Cell = () => {
    if (state.lastTg20CellBounds && state.tg20Map) {
      state.tg20Map.flyToBounds(state.lastTg20CellBounds, { padding: [100, 100], maxZoom: 15 });
      showToast(t("tg20.toastInterpolationCellZoom"), "info");
    }
  };

  // Harita Tıklama Olayı: Anlık N Ondülasyonu & 4 Düğüm Noktası Sorgulama
  state.tg20Map.on("click", async e => {
    try {
      const { lat, lng } = e.latlng;

      if (!state.tg20Engine.isLoaded) {
        state.tg20Engine.tryLoadEmbeddedModel();
      }

      state.tg20GridLayerGroup.clearLayers();
      const details = state.tg20Engine.getGeoidInterpolationDetails(lat, lng);
      state.lastTg20CellBounds = details ? details.cellBounds : null;
      state.lastTg20QueryPoint = { lat, lng, N: details ? details.interpolatedN : null };

      const hudNVal = document.getElementById("tg20HudNValue");
      const hudStatus = document.getElementById("tg20HudStatus");
      const hudLatLon = document.getElementById("tg20HudLatLon");
      const hudTmPafta = document.getElementById("tg20HudTmPafta");

      if (details && details.interpolatedN !== null) {
        const N = details.interpolatedN;
        const dom = state.gnssEngine?.geodesy?.getAutoCentralMeridian3Deg(lng) || 33;
        const tm = state.gnssEngine?.geodesy?.wgs84ToTurefTM(lat, lng, dom) || { y: 0, x: 0 };
        const zone = Math.round(dom / 3);
        const sheet25k = state.paftaEngine?.calculate25kSheet(lat, lng);
        const sheet100k = state.paftaEngine?.calculate100kSheet(lat, lng);
        const paftaName = sheet25k ? (sheet25k.sheetName + (sheet25k.regionalName ? ` (${sheet25k.regionalName})` : "")) : (sheet100k ? sheet100k.sheetName : "--");

        const nFormatted = (N >= 0 ? "+" : "") + N.toFixed(3) + " m";

        // 1. Üçgenleme (Triangulation / TIN Mesh) Görselleştirmesi
        const pNW = [details.nodes.nw.lat, details.nodes.nw.lon];
        const pNE = [details.nodes.ne.lat, details.nodes.ne.lon];
        const pSW = [details.nodes.sw.lat, details.nodes.sw.lon];
        const pSE = [details.nodes.se.lat, details.nodes.se.lon];
        const pCenter = [lat, lng];

        // 4 Adet Üçgenleme Yüzeyi (Merkez Nokta ile 4 Izgara Düğümü Arasındaki Üçgenler)
        const triangles = [
          { pts: [pCenter, pNW, pNE], color: "#06b6d4", fillOp: 0.12 }, // Kuzey Üçgeni
          { pts: [pCenter, pNE, pSE], color: "#38bdf8", fillOp: 0.10 }, // Doğu Üçgeni
          { pts: [pCenter, pSE, pSW], color: "#10b981", fillOp: 0.12 }, // Güney Üçgeni
          { pts: [pCenter, pSW, pNW], color: "#f59e0b", fillOp: 0.10 }  // Batı Üçgeni
        ];

        triangles.forEach(tri => {
          L.polygon(tri.pts, {
            color: "#0284c7",
            weight: 1.5,
            dashArray: "3, 5",
            fillColor: tri.color,
            fillOpacity: tri.fillOp,
            interactive: false
          }).addTo(state.tg20GridLayerGroup);
        });

        // Dış 1'x1' Izgara Hücresi Çerçevesi
        L.polygon(details.cellBounds, {
          color: "#06b6d4",
          weight: 2,
          dashArray: "6, 6",
          fillOpacity: 0,
          interactive: false
        }).addTo(state.tg20GridLayerGroup);

        // Merkezden 4 Köşeye Üçgenleme Radyal Işınları (Dashed Tie Lines)
        [pNW, pNE, pSW, pSE].forEach(corner => {
          L.polyline([pCenter, corner], {
            color: "#f59e0b",
            weight: 1.8,
            dashArray: "4, 4",
            opacity: 0.85,
            interactive: false
          }).addTo(state.tg20GridLayerGroup);
        });

        // 2. Etraftaki 4 Izgara Düğüm Noktasına Yanıp Sönen Pinler
        const nodeList = [details.nodes.nw, details.nodes.ne, details.nodes.sw, details.nodes.se];
        for (const node of nodeList) {
          const gridPinIcon = L.divIcon({
            className: "tg20-leaflet-icon-wrapper",
            html: `
              <div class="tg20-grid-pin" title="${t("tg20.gridNodeTooltip", { id: node.id, n: node.N.toFixed(3) })}">
                <div class="tg20-grid-pin-ring"></div>
                <div class="tg20-grid-pin-core"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          L.marker([node.lat, node.lon], { icon: gridPinIcon })
            .bindTooltip(`TG-20 ${node.id}: +${node.N.toFixed(3)} m`, { direction: "top", offset: [0, -8] })
            .addTo(state.tg20GridLayerGroup);
        }

        // HUD Bilgi Panelini Güncelle (Harita Görüşünü Kapatmayan Sabit Köşe Paneli)
        if (hudNVal) hudNVal.textContent = nFormatted;
        if (hudStatus) {
          hudStatus.textContent = t("tg20.hudInScope");
          hudStatus.className = "badge badge-emerald text-2xs";
        }
        if (hudLatLon) hudLatLon.textContent = `${lat.toFixed(6)}° K, ${lng.toFixed(6)}° D`;
        if (hudTmPafta) hudTmPafta.textContent = `Y: ${tm.y.toFixed(2)}, X: ${tm.x.toFixed(2)} (DOM ${dom}°) | Pafta: ${paftaName}`;

        // Marker Yerleştir (Popup Yok, Harita ve Üçgenler %100 Açık ve Görünür)
        if (!state.tg20MapMarker) {
          state.tg20MapMarker = L.marker([lat, lng], { icon: tg20Icon }).addTo(state.tg20Map);
        } else {
          state.tg20MapMarker.setLatLng([lat, lng]);
        }

        showToast(t("tg20.toastGridInterpolated", { n: nFormatted }), "info");
        logMessage(t("tg20.logInterpolation4Pt", {
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
          n: nFormatted,
          nwN: details.nodes.nw.N.toFixed(3),
          nwW: details.nodes.nw.weightPercent,
          neN: details.nodes.ne.N.toFixed(3),
          neW: details.nodes.ne.weightPercent,
          swN: details.nodes.sw.N.toFixed(3),
          swW: details.nodes.sw.weightPercent,
          seN: details.nodes.se.N.toFixed(3),
          seW: details.nodes.se.weightPercent
        }));
      } else {
        if (hudNVal) hudNVal.textContent = t("tg20.hudOutOfScope");
        if (hudStatus) {
          hudStatus.textContent = t("tg20.hudOutOfTurkey");
          hudStatus.className = "badge badge-rose text-2xs";
        }
        if (hudLatLon) hudLatLon.textContent = `${lat.toFixed(6)}° K, ${lng.toFixed(6)}° D`;
        if (hudTmPafta) hudTmPafta.textContent = "--";

        if (!state.tg20MapMarker) {
          state.tg20MapMarker = L.marker([lat, lng], { icon: tg20Icon }).addTo(state.tg20Map);
        } else {
          state.tg20MapMarker.setLatLng([lat, lng]);
        }

        showToast(t("tg20.toastOutOfTurkeyBounds"), "warning");
      }
    } catch (err) {
      console.error("TG-20 map click error:", err);
    }
  });

  document.getElementById("btnTg20MapResetView")?.addEventListener("click", () => {
    state.tg20Map?.flyTo([39.0, 35.2], 6, { duration: 1 });
  });

  // Window level action: transfer map point to single-point calculator & auto switch subtab
  window.sendTg20PointToSingle = (lat, lng) => {
    const inLat = document.getElementById("inputTg20Lat");
    const inLon = document.getElementById("inputTg20Lon");
    if (inLat && inLon) {
      inLat.value = Number(lat).toFixed(6);
      inLon.value = Number(lng).toFixed(6);
    }
    const btnCalc = document.getElementById("btnTg20SubtabCalc");
    if (btnCalc) btnCalc.click();

    setTimeout(() => {
      document.getElementById("btnCalculateTg20Single")?.click();
    }, 120);

    showToast(t("tg20.toastCoordsTransferred"), "success");
  };

  document.getElementById("btnSendTg20MapToSingle")?.addEventListener("click", () => {
    if (state.lastTg20QueryPoint) {
      window.sendTg20PointToSingle(state.lastTg20QueryPoint.lat, state.lastTg20QueryPoint.lng);
    } else {
      showToast(t("tg20.toastClickMapFirst"), "info");
    }
  });

  document.getElementById("btnCopyTg20HudN")?.addEventListener("click", () => {
    const nText = document.getElementById("tg20HudNValue")?.textContent?.trim();
    if (nText && nText !== "+--.--- m" && nText !== t("tg20.outOfScope")) {
      copyToClipboard(nText, t("tg20.toastUndulationCopied", { val: nText }));
    } else {
      showToast(t("tg20.toastClickMapFirst"), "info");
    }
  });

  // TG-20 Subtab Switcher
  document.querySelectorAll(".subtab-btn, .tg20-subtab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subtab-btn, .tg20-subtab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tg20-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tg20-target");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
      if (targetId === "tg20PaneMap") {
        initTg20InteractiveMap();
        setTimeout(() => {
          state.tg20Map?.invalidateSize();
        }, 150);
      }
    });
  });
}
