/**
 * Harita Tools - Format Converter Module Controller
 */
function initFormatConverterModule() {
  const dropzone = document.getElementById("converterDropzone");
  const fileInput = document.getElementById("inputConverterFile");
  const fileInfoChip = document.getElementById("converterFileInfo");
  const fileNameTxt = document.getElementById("txtConverterFileName");
  const fileDetailsTxt = document.getElementById("txtConverterFileDetails");
  const btnReset = document.getElementById("btnResetConverter");

  const selSrcCrs = document.getElementById("selConverterSrcCrs");
  const selDom = document.getElementById("selConverterDom");
  const badgeCrs = document.getElementById("badgeConverterCrs");

  const btnGenPolygon = document.getElementById("btnGeneratePolygon");
  const layersListEl = document.getElementById("converterLayersList");
  const lblLayerCount = document.getElementById("lblLayerCount");

  const kpiPoints = document.getElementById("kpiConverterPoints");
  const kpiTexts = document.getElementById("kpiConverterTexts");
  const kpiLines = document.getElementById("kpiConverterLines");
  const kpiPolygons = document.getElementById("kpiConverterPolygons");
  const kpiTotalArea = document.getElementById("kpiConverterTotalArea");
  const kpiDonum = document.getElementById("kpiConverterDonum");

  const btnFitBounds = document.getElementById("btnConverterFitBounds");
  const btnToggleTexts = document.getElementById("btnConverterToggleTexts");
  const btnToggleLabels = document.getElementById("btnConverterToggleLabels");

  const typeFiltersEl = document.getElementById("converterTypeFilters");
  const inputSearch = document.getElementById("inputConverterSearch");

  const btnExportDxf = document.getElementById("btnConverterExportDxf");
  const btnExportKml = document.getElementById("btnConverterExportKml");
  const btnExportKmz = document.getElementById("btnConverterExportKmz");
  const btnExportNcn = document.getElementById("btnConverterExportNcn");
  const btnExportGeoJson = document.getElementById("btnConverterExportGeoJson");
  const btnExportGpx = document.getElementById("btnConverterExportGpx");
  const btnExportCsv = document.getElementById("btnConverterExportCsv");

  const tbodyData = document.getElementById("tbodyConverterData");
  const lblTableCount = document.getElementById("lblConverterTableCount");

  if (!state.converterEngine && typeof UniversalFormatConverterEngine !== "undefined") {
    state.converterEngine = new UniversalFormatConverterEngine();
  }

  function initConverterMap() {
    if (state.converterMap) {
      state.converterMap.invalidateSize();
      return;
    }
    if (!document.getElementById("converterMap") || typeof L === "undefined") return;

    const { map } = createStudioMap("converterMap", {
      center: [39.0, 35.0],
      zoom: 6,
      defaultType: "hybrid"
    });
    state.converterMap = map;
    state.converterLayerGroup = L.layerGroup().addTo(state.converterMap);
    state.isConverterMapInit = true;
  }
  window.initConverterMap = initConverterMap;

  function refreshConverterTableOnly() {
    const engine = state.converterEngine;
    if (!tbodyData || !engine) return;

    tbodyData.innerHTML = "";
    if (engine.features.length === 0) {
      renderTableEmptyState(tbodyData, 8, t("converter.emptyStateNoData"), "fa-folder-open", t("converter.emptyStateNoDataSub"));
      if (lblTableCount) lblTableCount.textContent = t("converter.lblRecordCount", { count: 0 });
      return;
    }

    let filtered = engine.features;
    if (state.converterFilterType && state.converterFilterType !== "ALL") {
      filtered = filtered.filter(f => f.type === state.converterFilterType);
    }
    if (state.converterSearchQuery) {
      const q = state.converterSearchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) || 
        (f.layer && f.layer.toLowerCase().includes(q)) ||
        (f.type && f.type.toLowerCase().includes(q))
      );
    }

    const rows = filtered.slice(0, 400);
    if (rows.length === 0) {
      renderTableEmptyState(tbodyData, 8, t("converter.emptyStateNoFilter"), "fa-filter", t("converter.emptyStateNoFilterSub"));
      if (lblTableCount) lblTableCount.textContent = t("converter.lblFilteredRecordCount", { count: 0, total: filtered.length });
      return;
    }

    rows.forEach((f, idx) => {
      const tr = document.createElement("tr");
      let yStr = "-", xStr = "-", zStr = "-";
      let metrajStr = "-";

      let typeBadge = "badge-cyan";
      if (f.type === "Point") {
        typeBadge = f.properties && f.properties.isSymbol ? "badge-amber" : "badge-cyan";
        yStr = (f.coordinates[0] || 0).toFixed(3);
        xStr = (f.coordinates[1] || 0).toFixed(3);
        zStr = (f.coordinates[2] || 0).toFixed(2);
        metrajStr = f.properties && f.properties.isSymbol ? t("converter.symbolPrefix", { name: f.name }) : t("converter.typePoint");
      } else if (f.type === "Text") {
        typeBadge = "badge-purple";
        yStr = (f.coordinates[0] || 0).toFixed(3);
        xStr = (f.coordinates[1] || 0).toFixed(3);
        zStr = (f.coordinates[2] || 0).toFixed(2);
        metrajStr = `CAD Metni: "${f.name}"`;
      } else if (f.type === "LineString") {
        typeBadge = "badge-blue";
        metrajStr = (f.properties.lengthM || 0).toFixed(1) + " m";
      } else if (f.type === "Polygon") {
        typeBadge = "badge-emerald";
        metrajStr = (f.properties.areaM2 || 0).toFixed(1) + " m²";
      }

      tr.innerHTML = `
        <td class="text-dim font-mono">${idx + 1}</td>
        <td class="text-white font-bold">${f.name || "-"}</td>
        <td><span class="badge badge-secondary font-mono text-3xs">${f.layer || "0"}</span></td>
        <td><span class="badge ${typeBadge} font-mono text-3xs">${f.type}</span></td>
        <td class="font-mono">${yStr}</td>
        <td class="font-mono">${xStr}</td>
        <td class="font-mono">${zStr}</td>
        <td class="font-mono text-emerald font-bold">${metrajStr}</td>
      `;
      tbodyData.appendChild(tr);
    });

    if (lblTableCount) {
      lblTableCount.textContent = filtered.length > 400 ? t("converter.lblTableFirst400", { total: filtered.length.toLocaleString("tr-TR") }) : t("converter.lblTableCountTotal", { count: filtered.length.toLocaleString("tr-TR") });
    }
  }

  function refreshConverterUI() {
    const engine = state.converterEngine;
    if (!engine) return;

    const stats = engine.stats;
    if (kpiPoints) kpiPoints.textContent = (stats.pointCount || 0).toLocaleString("tr-TR");
    if (kpiTexts) kpiTexts.textContent = (stats.textCount || 0).toLocaleString("tr-TR");
    if (kpiLines) kpiLines.textContent = (stats.lineCount || 0).toLocaleString("tr-TR");
    if (kpiPolygons) kpiPolygons.textContent = (stats.polygonCount || 0).toLocaleString("tr-TR");
    if (kpiTotalArea) kpiTotalArea.textContent = stats.totalAreaM2.toLocaleString("tr-TR") + " m²";
    if (kpiDonum) kpiDonum.textContent = t("converter.lblDonumHa", { donum: (stats.totalAreaM2 / 1000).toFixed(2), ha: (stats.totalAreaM2 / 10000).toFixed(3) });

    if (typeFiltersEl) {
      const btnAll = typeFiltersEl.querySelector('[data-filter="ALL"]');
      const btnTxt = typeFiltersEl.querySelector('[data-filter="Text"]');
      const btnPt = typeFiltersEl.querySelector('[data-filter="Point"]');
      const btnLn = typeFiltersEl.querySelector('[data-filter="LineString"]');
      const btnPg = typeFiltersEl.querySelector('[data-filter="Polygon"]');
      if (btnAll) btnAll.textContent = t("converter.btnAllWithCount", { count: engine.features.length.toLocaleString("tr-TR") });
      if (btnTxt) btnTxt.innerHTML = `<i class="fa-solid fa-font text-purple mr-1"></i> ` + t("converter.btnTextsWithCount", { count: (stats.textCount || 0).toLocaleString("tr-TR") });
      if (btnPt) btnPt.innerHTML = `<i class="fa-solid fa-location-dot text-cyan mr-1"></i> ` + t("converter.btnPointsWithCount", { count: (stats.pointCount || 0).toLocaleString("tr-TR") });
      if (btnLn) btnLn.innerHTML = `<i class="fa-solid fa-route text-blue mr-1"></i> ` + t("converter.btnLinesWithCount", { count: (stats.lineCount || 0).toLocaleString("tr-TR") });
      if (btnPg) btnPg.innerHTML = `<i class="fa-solid fa-draw-polygon text-emerald mr-1"></i> ` + t("converter.btnPolygonsWithCount", { count: (stats.polygonCount || 0).toLocaleString("tr-TR") });
    }

    if (fileInfoChip) {
      if (engine.features.length > 0) {
        fileInfoChip.classList.remove("d-none");
        if (fileNameTxt) fileNameTxt.textContent = engine.sourceFileName;
        if (fileDetailsTxt) {
          const extraProj = engine.metadata?.projection ? ` • Proj: ${engine.metadata.projection}` : "";
          fileDetailsTxt.textContent = `${engine.sourceFormat} • ${engine.features.length.toLocaleString("tr-TR")} Geometri • ${engine.layers.size} Katman${extraProj}`;
        }
        if (engine.metadata?.dom && selDom) {
          selDom.value = String(engine.metadata.dom);
          if (badgeCrs) badgeCrs.textContent = `TUREF TM 3° (DOM: ${engine.metadata.dom}°)`;
        }
      } else {
        fileInfoChip.classList.add("d-none");
      }
    }

    if (layersListEl) {
      layersListEl.innerHTML = "";
      if (engine.layers.size === 0) {
        layersListEl.innerHTML = '<div class="text-center py-3 text-xs text-dim">' + t("converter.noLayersLoaded") + '</div>';
      } else {
        engine.layers.forEach((data, name) => {
          const row = document.createElement("div");
          row.className = "converter-layer-item";
          row.innerHTML = `
            <div class="d-flex items-center gap-6 min-w-0">
              <span class="converter-layer-dot" style="background-color: ${data.color || '#06b6d4'};"></span>
              <strong class="text-white text-xs truncate">${name}</strong>
              <span class="text-3xs text-dim font-mono">(${data.count})</span>
            </div>
            <label class="d-flex items-center gap-4 text-3xs text-dim cursor-pointer">
              <input type="checkbox" class="chk-converter-layer" data-layer="${name}" ${data.visible !== false ? "checked" : ""} />
              <span>${t("converter.btnShowLayer")}</span>
            </label>
          `;
          layersListEl.appendChild(row);
        });

        layersListEl.querySelectorAll(".chk-converter-layer").forEach(chk => {
          chk.addEventListener("change", () => {
            const lName = chk.getAttribute("data-layer");
            const isVis = chk.checked;
            const lData = engine.layers.get(lName);
            if (lData) lData.visible = isVis;
            renderConverterMapLayers();
          });
        });
      }
    }
    if (lblLayerCount) lblLayerCount.textContent = `${engine.layers.size} Katman`;

    refreshConverterTableOnly();
    renderConverterMapLayers();
  }

  function renderConverterMapLayers() {
    initConverterMap();
    if (!state.converterMap || !state.converterLayerGroup) return;

    state.converterLayerGroup.clearLayers();
    const engine = state.converterEngine;
    if (!engine || engine.features.length === 0) return;

    const dom = parseInt(selDom ? selDom.value : "30", 10);
    const bounds = L.latLngBounds([]);

    const toLatLng = (c, isWgs) => {
      let lon = c[0], lat = c[1];
      if (!isWgs && engine.geodesy) {
        const geo = engine.geodesy.turefTMToWgs84(lon, lat, dom);
        lat = geo.lat;
        lon = geo.lon;
      }
      return [lat, lon];
    };

    let renderCount = 0;
    const MAX_RENDER = 12000;
    for (const f of engine.features) {
      const lData = engine.layers.get(f.layer);
      if (lData && lData.visible === false) continue;
      if (renderCount >= MAX_RENDER) break;
      renderCount++;

      const isWgs = f.properties && f.properties.isWgs84;
      const color = lData ? lData.color : "#06b6d4";

      if (f.type === "Point") {
        const [lat, lon] = toLatLng(f.coordinates, isWgs);
        if (!isNaN(lat) && !isNaN(lon)) {
          const isSym = f.properties && f.properties.isSymbol;
          const marker = L.circleMarker([lat, lon], {
            radius: isSym ? 5 : 4,
            fillColor: isSym ? "#f59e0b" : color,
            color: "#ffffff",
            weight: 1.2,
            opacity: 0.9,
            fillOpacity: 0.85
          });

          if (state.converterShowLabels && f.name) {
            marker.bindTooltip(f.name, { permanent: false, direction: "top" });
          }
          const [y, x, z] = f.coordinates;
          marker.bindPopup(`
            <div style="font-size: 11px; line-height: 1.4;">
              <strong class="${isSym ? 'text-amber' : 'text-cyan'}">${f.name || t("converter.typePoint")}</strong><br>
              ${t("converter.popupType")}: <strong>${isSym ? t("converter.typeSymbol") : t("converter.typePoint")}</strong><br>
              ${t("converter.popupLayer")}: <strong>${f.layer}</strong><br>
              ${t("geomatics.easting")}: <span style="font-family: monospace;">${y.toFixed(3)}</span><br>
              ${t("geomatics.northing")}: <span style="font-family: monospace;">${x.toFixed(3)}</span><br>
              ${t("geomatics.ellipsoidalHeight")}: <span style="font-family: monospace;">${(z || 0).toFixed(2)} m</span>
            </div>
          `);
          state.converterLayerGroup.addLayer(marker);
          bounds.extend([lat, lon]);
        }
      } else if (f.type === "Text") {
        if (!state.converterShowTexts) continue;
        const [lat, lon] = toLatLng(f.coordinates, isWgs);
        if (!isNaN(lat) && !isNaN(lon)) {
          const textIcon = L.divIcon({
            className: "cad-map-text-wrapper",
            html: `<span class="cad-map-text" style="color: ${color || '#c084fc'};">${f.name || ''}</span>`,
            iconSize: null
          });
          const textMarker = L.marker([lat, lon], { icon: textIcon });
          const [y, x, z] = f.coordinates;
          textMarker.bindPopup(`
            <div style="font-size: 11px; line-height: 1.4;">
              <strong style="color: #c084fc;"><i class="fa-solid fa-font"></i> CAD Metni: "${f.name}"</strong><br>
              ${t("converter.popupLayer")}: <strong>${f.layer}</strong><br>
              ${t("geomatics.easting")}: <span style="font-family: monospace;">${y.toFixed(3)}</span><br>
              ${t("geomatics.northing")}: <span style="font-family: monospace;">${x.toFixed(3)}</span><br>
              ${t("geomatics.ellipsoidalHeight")}: <span style="font-family: monospace;">${(z || 0).toFixed(2)} m</span>
            </div>
          `);
          state.converterLayerGroup.addLayer(textMarker);
          bounds.extend([lat, lon]);
        }
      } else if (f.type === "LineString") {
        const latLngs = f.coordinates.map(c => toLatLng(c, isWgs));
        if (latLngs.length >= 2) {
          const polyline = L.polyline(latLngs, {
            color: color || "#3b82f6",
            weight: 3,
            opacity: 0.85
          });
          polyline.bindPopup(`<strong>${f.name}</strong><br>${t("converter.popupLayer")}: ${f.layer}<br>Uzunluk: ${(f.properties.lengthM || 0).toFixed(1)} m`);
          state.converterLayerGroup.addLayer(polyline);
          latLngs.forEach(ll => bounds.extend(ll));
        }
      } else if (f.type === "Polygon") {
        const rings = f.coordinates.map(r => r.map(c => toLatLng(c, isWgs)));
        if (rings.length > 0 && rings[0].length >= 3) {
          const polygon = L.polygon(rings, {
            color: f.properties.isGenerated ? "#10b981" : (color || "#10b981"),
            fillColor: f.properties.isGenerated ? "#10b981" : (color || "#10b981"),
            fillOpacity: 0.35,
            weight: 2.5
          });
          const areaStr = (f.properties.areaM2 || 0).toFixed(1) + " m² (" + t("converter.lblDonumHa", { donum: ((f.properties.areaM2 || 0) / 1000).toFixed(2), ha: ((f.properties.areaM2 || 0) / 10000).toFixed(3) }) + ")";
          polygon.bindPopup(`<strong>${f.name}</strong><br>${t("converter.popupLayer")}: ${f.layer}<br>${t("converter.popupArea")}: ${areaStr}<br>${t("converter.popupPerimeter")}: ${(f.properties.perimeterM || 0).toFixed(1)} m`);
          state.converterLayerGroup.addLayer(polygon);
          rings[0].forEach(ll => bounds.extend(ll));
        }
      }
    }

    if (bounds.isValid()) {
      state.converterMap.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  async function handleFileProcess(file) {
    if (!file) return;
    try {
      showToast(t("converter.toastParsing", { name: file.name }), "info");
      await state.converterEngine.parseFile(file, file.name);
      refreshConverterUI();
      showToast(t("converter.toastParsed", { name: file.name, count: state.converterEngine.features.length }), "success");
    } catch (err) {
      console.error("Format conversion error:", err);
      showToast(t("converter.toastParseError", { err: err.message }), "error");
    }
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });
    dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        await handleFileProcess(file);
      }
    });

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFileProcess(file);
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (fileInput) fileInput.value = "";
      if (state.converterEngine) {
        state.converterEngine.features = [];
        state.converterEngine.layers.clear();
        state.converterEngine._recomputeStats();
      }
      if (state.converterLayerGroup) state.converterLayerGroup.clearLayers();
      refreshConverterUI();
      showToast(t("converter.toastCleared"), "info");
    });
  }

  const btnModeSeq = document.getElementById("btnModeSequential");
  const btnModeHull = document.getElementById("btnModeConvexHull");
  state.converterPolygonMode = "sequential";

  if (btnModeSeq && btnModeHull) {
    btnModeSeq.addEventListener("click", () => {
      state.converterPolygonMode = "sequential";
      btnModeSeq.className = "btn btn-primary btn-sm flex-1 text-xs";
      btnModeHull.className = "btn btn-secondary btn-sm flex-1 text-xs";
    });
    btnModeHull.addEventListener("click", () => {
      state.converterPolygonMode = "convex_hull";
      btnModeHull.className = "btn btn-primary btn-sm flex-1 text-xs";
      btnModeSeq.className = "btn btn-secondary btn-sm flex-1 text-xs";
    });
  }

  if (btnGenPolygon) {
    btnGenPolygon.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.toastNeedPointsFirst"), "warning");
        return;
      }
      const mode = state.converterPolygonMode || "sequential";

      try {
        const poly = state.converterEngine.generatePolygonFromPoints(mode, { layerName: "KAPALI_ALAN" });
        refreshConverterUI();
        const areaStr = poly.properties.areaM2.toLocaleString("tr-TR") + " m² (" + t("converter.lblDonumHa", { donum: poly.properties.areaDonum.toFixed(2), ha: (poly.properties.areaM2 / 10000).toFixed(3) }) + ")";
        showToast(t("converter.toastAreaCreated", { area: areaStr }), "success", 5000);
      } catch (err) {
        showToast(t("converter.toastAreaError", { err: err.message }), "error");
      }
    });
  }

  if (selDom && badgeCrs) {
    selDom.addEventListener("change", () => {
      const domVal = selDom.value;
      badgeCrs.textContent = `TUREF TM 3° (DOM: ${domVal}°)`;
      if (state.converterEngine) {
        state.converterEngine.defaultDom = parseInt(domVal, 10);
      }
      renderConverterMapLayers();
    });
  }

  if (btnFitBounds) {
    btnFitBounds.addEventListener("click", () => {
      renderConverterMapLayers();
    });
  }
  if (btnToggleTexts) {
    btnToggleTexts.addEventListener("click", () => {
      state.converterShowTexts = !state.converterShowTexts;
      btnToggleTexts.classList.toggle("active", state.converterShowTexts);
      btnToggleTexts.classList.toggle("text-purple", state.converterShowTexts);
      renderConverterMapLayers();
      showToast(state.converterShowTexts ? t("converter.toastShowTexts") : t("converter.toastHideTexts"), "info");
    });
  }
  if (btnToggleLabels) {
    btnToggleLabels.addEventListener("click", () => {
      state.converterShowLabels = !state.converterShowLabels;
      btnToggleLabels.classList.toggle("text-cyan", state.converterShowLabels);
      renderConverterMapLayers();
      showToast(state.converterShowLabels ? t("converter.toastShowLabels") : t("converter.toastHideLabels"), "info");
    });
  }

  if (typeFiltersEl) {
    typeFiltersEl.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        typeFiltersEl.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.converterFilterType = btn.getAttribute("data-filter") || "ALL";
        refreshConverterTableOnly();
      });
    });
  }

  if (inputSearch) {
    inputSearch.addEventListener("input", (e) => {
      state.converterSearchQuery = e.target.value.trim();
      refreshConverterTableOnly();
    });
  }

  const getOutputBaseName = () => {
    const raw = state.converterEngine?.sourceFileName || "Donusturulen_Harita";
    return raw.replace(/\.[^/.]+$/, "");
  };

  if (btnExportDxf) {
    btnExportDxf.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dxfContent = state.converterEngine.exportDxf();
      downloadTextFile(`${getOutputBaseName()}_export.dxf`, dxfContent, "application/dxf");
      showToast(t("converter.toastExportDxfSuccess"), "success");
    });
  }

  if (btnExportKml) {
    btnExportKml.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      const kmlContent = state.converterEngine.exportKml({ dom: dom });
      downloadTextFile(`${getOutputBaseName()}_google_earth.kml`, kmlContent, "application/vnd.google-earth.kml+xml");
      showToast(t("converter.toastExportKmlSuccess"), "success");
    });
  }

  if (btnExportKmz) {
    btnExportKmz.addEventListener("click", async () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      try {
        const kmzBlob = await state.converterEngine.exportKmz({ dom: dom });
        downloadTextFile(`${getOutputBaseName()}_google_earth.kmz`, kmzBlob, "application/vnd.google-earth.kmz");
        showToast(t("converter.toastExportKmzSuccess"), "success");
      } catch (err) {
        showToast(t("converter.toastExportKmzError", { err: err.message }), "error");
      }
    });
  }

  if (btnExportNcn) {
    btnExportNcn.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoPointsToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      const ncnContent = state.converterEngine.exportNcn({ dom: dom });
      downloadTextFile(`${getOutputBaseName()}_netcad.ncn`, ncnContent, "text/plain");
      showToast(t("converter.toastExportNcnSuccess"), "success");
    });
  }

  if (btnExportGeoJson) {
    btnExportGeoJson.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      const geoJsonContent = state.converterEngine.exportGeoJson({ dom: dom });
      downloadTextFile(`${getOutputBaseName()}.geojson`, geoJsonContent, "application/geo+json");
      showToast(t("converter.toastExportGeoJsonSuccess"), "success");
    });
  }

  if (btnExportGpx) {
    btnExportGpx.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      const gpxContent = state.converterEngine.exportGpx({ dom: dom });
      downloadTextFile(`${getOutputBaseName()}_gps.gpx`, gpxContent, "application/gpx+xml");
      showToast(t("converter.toastExportGpxSuccess"), "success");
    });
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoDataToExport"), "warning");
        return;
      }
      const csvContent = state.converterEngine.exportCsv();
      downloadTextFile(`${getOutputBaseName()}_koordinatlar.csv`, csvContent, "text/csv");
      showToast(t("converter.toastExportCsvSuccess"), "success");
    });
  }
}

