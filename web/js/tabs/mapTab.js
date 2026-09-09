/**
 * Harita Tools - Map & Turkey Pafta Index Controller
 */
function initMap() {
  if (state.map) {
    state.map.invalidateSize();
    return;
  }
  const { map } = createStudioMap("mapContainer", {
    center: [39, 35.2],
    zoom: 6,
    defaultType: "hybrid"
  });
  state.map = map;
  state.mapLayerGroup = L.layerGroup().addTo(state.map);
  state.paftaLayerGroup = L.layerGroup().addTo(state.map);
  state.domLayerGroup = L.layerGroup().addTo(state.map);
  state.importedKmlLayerGroup = L.layerGroup().addTo(state.map);
  state.intersectingPaftaLayerGroup = L.layerGroup().addTo(state.map);
  if (state.posSolutions && state.posSolutions.length > 0) {
    plotTrajectoryOnMap(state.posSolutions);
  }
  document.getElementById("btnExportKml")?.addEventListener("click", exportKml);
  document.getElementById("btnExportGeoJson")?.addEventListener("click", exportGeoJson);
  initKmlKmzImporter();
  const btnEl = document.getElementById("btnPafta100k");
  const btnEl_1 = document.getElementById("btnPafta50k");
  const btnEl_2 = document.getElementById("btnPafta25k");
  const btnEl_5k = document.getElementById("btnPafta5k");
  const btnEl_2k = document.getElementById("btnPafta2k");
  const btnEl_1k = document.getElementById("btnPafta1k");
  const btnEl_3 = document.getElementById("btnPaftaOff");
  const btnEl_4 = document.getElementById("btnToggleDom");
  const inputEl = document.getElementById("inputPaftaSearch");
  const btnEl_5 = document.getElementById("btnPaftaSearch");
  const domEl = document.getElementById("cardActivePafta");
  const btnEl_6 = document.getElementById("btnClosePaftaCard");
  function updatePaftaScaleButtonUi(scale) {
    btnEl?.classList.remove("btn-pafta-active");
    btnEl_1?.classList.remove("btn-pafta-active-50k");
    btnEl_2?.classList.remove("btn-pafta-active-25k");
    btnEl_5k?.classList.remove("btn-pafta-active-5k");
    btnEl_2k?.classList.remove("btn-pafta-active-2k");
    btnEl_1k?.classList.remove("btn-pafta-active-1k");
    btnEl_3?.classList.remove("btn-secondary");
    if (scale === "100k") {
      btnEl?.classList.add("btn-pafta-active");
    } else if (scale === "50k") {
      btnEl_1?.classList.add("btn-pafta-active-50k");
    } else if (scale === "25k") {
      btnEl_2?.classList.add("btn-pafta-active-25k");
    } else if (scale === "5k") {
      btnEl_5k?.classList.add("btn-pafta-active-5k");
    } else if (scale === "2k") {
      btnEl_2k?.classList.add("btn-pafta-active-2k");
    } else if (scale === "1k") {
      btnEl_1k?.classList.add("btn-pafta-active-1k");
    } else if (scale === "off") {
      btnEl_3?.classList.add("btn-secondary");
    }
  }

  // Yukarıdaki butonlar sadece arka plandaki tüm Türkiye grid çizgilerini açıp kapatır
  function toggleBackgroundPaftaGrid(scale) {
    state.activePaftaScale = scale;
    updatePaftaScaleButtonUi(scale);

    if (scale === "off") {
      state.paftaLayerGroup.clearLayers();
      if (state.highlightedPaftaLayer) {
        state.map.removeLayer(state.highlightedPaftaLayer);
        state.highlightedPaftaLayer = null;
      }
      if (domEl) {
        domEl.style.display = "none";
      }
      logMessage(t("map.logAllGridLinesClosed"));
      return;
    }
    renderPaftaGrid();
    logMessage(t("map.logGridLinesShown", { scale: scale.replace("k", " 000") }));
    showToast(t("map.toastGridOpened", { scale: scale.replace("k", " 000") }), "success");
  }

  btnEl?.addEventListener("click", () => toggleBackgroundPaftaGrid("100k"));
  btnEl_1?.addEventListener("click", () => toggleBackgroundPaftaGrid("50k"));
  btnEl_2?.addEventListener("click", () => toggleBackgroundPaftaGrid("25k"));
  btnEl_5k?.addEventListener("click", () => toggleBackgroundPaftaGrid("5k"));
  btnEl_2k?.addEventListener("click", () => toggleBackgroundPaftaGrid("2k"));
  btnEl_1k?.addEventListener("click", () => toggleBackgroundPaftaGrid("1k"));
  btnEl_3?.addEventListener("click", () => toggleBackgroundPaftaGrid("off"));

  // İlk açılışta varsayılan tıklama pafta ölçeği: Her zaman 1/100 000
  state.currentIntersectScale = "100k";
  state.activePaftaScale = "off"; // Başlangıçta arka plan tüm grid kapalı, sadece tıklanan/alan paftası açılır
  updatePaftaScaleButtonUi("off");

  function v_5() {
    state.isDomLayerActive = !state.isDomLayerActive;
    if (state.isDomLayerActive) {
      btnEl_4?.classList.add("btn-dom-active");
      renderDomGrid();
      logMessage(t("map.logDomActive"));
      showToast(t("map.toastDomLoaded"), "success");
    } else {
      btnEl_4?.classList.remove("btn-dom-active");
      state.domLayerGroup.clearLayers();
      logMessage(t("map.logDomHidden"));
      showToast(t("map.toastDomClosed"), "info");
    }
  }
  btnEl_4?.addEventListener("click", v_5);

  state.map.on("moveend", () => {
    if (state.activePaftaScale !== "off") {
      renderPaftaGrid();
    }
  });

  // Haritaya tıklandığında (KML yokken varsayılan 100k, KML modalında seçilen ne ise o ölçek açılır)
  state.map.on("click", arg1 => {
    const {
      lat: clickLat,
      lng: clickLng
    } = arg1.latlng;
    if (clickLat < 34 || clickLat > 43 || clickLng < 25 || clickLng > 45.5) {
      return;
    }
    const allSheets = state.paftaEngine.getAllSheetsForPoint(clickLat, clickLng);

    // Sağdaki modalda veya üst çubukta seçili olan ölçek (KML yokken varsayılan: 100k veya aktif grid ölçeği)
    let activeClickScale = state.currentIntersectScale || "100k";
    if (state.activePaftaScale && state.activePaftaScale !== "off") {
      activeClickScale = state.activePaftaScale;
    }

    let targetSheet = allSheets.s100k;
    if (activeClickScale === "100k") {
      targetSheet = allSheets.s100k;
    } else if (activeClickScale === "50k") {
      targetSheet = allSheets.s50k;
    } else if (activeClickScale === "25k") {
      targetSheet = allSheets.s25k;
    } else if (activeClickScale === "5k") {
      targetSheet = allSheets.s5k;
    } else if (activeClickScale === "2k") {
      targetSheet = allSheets.s2k;
    } else if (activeClickScale === "1k") {
      targetSheet = allSheets.s1k;
    }

    highlightSheet(targetSheet);
    showFloatingPaftaCard(targetSheet, allSheets);
  });
  function v_6() {
    const v_1_1 = inputEl.value.trim();
    if (!v_1_1) {
      showToast(t("map.toastSearchNeedPafta"), "warning");
      return;
    }
    const v_2_1 = state.paftaEngine.resolveSheetByName(v_1_1);
    if (!v_2_1) {
      showToast(t("map.toastPaftaNotFound", { name: v_1_1 }), "error");
      return;
    }
    if (v_2_1.scale === "1/100 000" && state.activePaftaScale !== "100k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("100k");
    } else if (v_2_1.scale === "1/50 000" && state.activePaftaScale !== "50k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("50k");
    } else if (v_2_1.scale === "1/25 000" && state.activePaftaScale !== "25k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("25k");
    } else if (v_2_1.scale === "1/5 000" && state.activePaftaScale !== "5k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("5k");
    } else if (v_2_1.scale === "1/2 000" && state.activePaftaScale !== "2k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("2k");
    } else if (v_2_1.scale === "1/1 000" && state.activePaftaScale !== "1k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("1k");
    }
    const items = [[v_2_1.minLat, v_2_1.minLon], [v_2_1.maxLat, v_2_1.maxLon]];
    state.map.flyToBounds(items, {
      maxZoom: 14,
      padding: [60, 60]
    });
    highlightSheet(v_2_1);
    showFloatingPaftaCard(v_2_1);
    logMessage("🎯 [PAFTA BULUNDU] " + v_2_1.name + " (" + v_2_1.scale + ") | Merkez: " + v_2_1.centerLat.toFixed(4) + "N, " + v_2_1.centerLon.toFixed(4) + "E");
    showToast(t("map.toastPaftaFocused", { name: v_2_1.name, scale: v_2_1.scale }), "success");
  }
  btnEl_5?.addEventListener("click", v_6);
  inputEl?.addEventListener("keydown", arg1 => {
    if (arg1.key === "Enter") {
      v_6();
    }
  });
  btnEl_6?.addEventListener("click", () => {
    if (domEl) {
      domEl.style.display = "none";
    }
    if (state.highlightedPaftaLayer) {
      state.map.removeLayer(state.highlightedPaftaLayer);
      state.highlightedPaftaLayer = null;
    }
  });
  document.getElementById("btnDownloadPaftaKml")?.addEventListener("click", () => {
    if (!state.selectedPaftaSheet) {
      return;
    }
    const v_1_1 = state.paftaEngine.exportSheetKml(state.selectedPaftaSheet);
    downloadTextFile(state.selectedPaftaSheet.name + "_pafta.kml", v_1_1);
    showToast(t("map.toastDownloaded", { name: state.selectedPaftaSheet.name + "_pafta.kml" }), "success");
  });
  document.getElementById("btnDownloadPaftaDxf")?.addEventListener("click", () => {
    if (!state.selectedPaftaSheet) {
      return;
    }
    const v_1_1 = state.paftaEngine.exportSheetDxf(state.selectedPaftaSheet, state.gnssEngine.geodesy);
    downloadTextFile(state.selectedPaftaSheet.name + "_pafta.dxf", v_1_1);
    showToast(t("map.toastDownloaded", { name: state.selectedPaftaSheet.name + "_pafta.dxf" }), "success");
  });
  document.getElementById("btnDownloadPaftaJson")?.addEventListener("click", () => {
    if (!state.selectedPaftaSheet) {
      return;
    }
    const v_1_1 = state.selectedPaftaSheet;
    const v_2_1 = state.paftaEngine.getHgmDatumRecord(v_1_1.name, v_1_1.centerLat, v_1_1.centerLon);
    const obj = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {
          name: v_1_1.name,
          scale: v_1_1.scale,
          regionalName: v_1_1.regionalName || "",
          hgm_yukseklik_duz_m: v_2_1.yukseklikDuz,
          hgm_yukari_duz_m: v_2_1.yukariDuz,
          hgm_saga_duz_m: v_2_1.sagaDuz,
          hgm_enlem_duz_arcsec: v_2_1.enlemDuz,
          hgm_boylam_duz_arcsec: v_2_1.boylamDuz
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[v_1_1.minLon, v_1_1.minLat], [v_1_1.maxLon, v_1_1.minLat], [v_1_1.maxLon, v_1_1.maxLat], [v_1_1.minLon, v_1_1.maxLat], [v_1_1.minLon, v_1_1.minLat]]]
        }
      }]
    };
    downloadTextFile(v_1_1.name + "_pafta.geojson", JSON.stringify(obj, null, 2));
    showToast(t("map.toastDownloaded", { name: v_1_1.name + "_pafta.geojson" }), "success");
  });
  window.downloadPaftaDirect = (arg1, arg2) => {
    const v_3_1 = state.paftaEngine.resolveSheetByName(arg1);
    if (!v_3_1) {
      return;
    }
    if (arg2 === "kml") {
      downloadTextFile(v_3_1.name + "_pafta.kml", state.paftaEngine.exportSheetKml(v_3_1));
    } else if (arg2 === "dxf") {
      downloadTextFile(v_3_1.name + "_pafta.dxf", state.paftaEngine.exportSheetDxf(v_3_1, state.gnssEngine.geodesy));
    } else if (arg2 === "json") {
      const v_1_1 = state.paftaEngine.getHgmDatumRecord(v_3_1.name, v_3_1.centerLat, v_3_1.centerLon);
      const obj = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: {
            name: v_3_1.name,
            scale: v_3_1.scale,
            regionalName: v_3_1.regionalName || "",
            hgm_yukseklik_duz_m: v_1_1.yukseklikDuz,
            hgm_yukari_duz_m: v_1_1.yukariDuz,
            hgm_saga_duz_m: v_1_1.sagaDuz,
            hgm_enlem_duz_arcsec: v_1_1.enlemDuz,
            hgm_boylam_duz_arcsec: v_1_1.boylamDuz
          },
          geometry: {
            type: "Polygon",
            coordinates: [[[v_3_1.minLon, v_3_1.minLat], [v_3_1.maxLon, v_3_1.minLat], [v_3_1.maxLon, v_3_1.maxLat], [v_3_1.minLon, v_3_1.maxLat], [v_3_1.minLon, v_3_1.minLat]]]
          }
        }]
      };
      downloadTextFile(v_3_1.name + "_pafta.geojson", JSON.stringify(obj, null, 2));
    }
    showToast(t("map.toastDownloaded", { name: v_3_1.name + "_pafta." + arg2 }), "success");
  };
}
function initKmlKmzImporter() {
  const inputEl = document.getElementById("inputImportKml");
  const mapEl = document.getElementById("mapContainer");
  const domEl = document.getElementById("cardIntersectingPaftas");
  const btnEl = document.getElementById("btnCloseIntersectingCard");
  const elementsList = document.querySelectorAll(".btn-intersect-scale");
  state.currentIntersectScale = "25k";
  state.importedProjectData = null;
  inputEl?.addEventListener("change", async arg1 => {
    const v_2 = arg1.target.files?.[0];
    if (v_2) {
      await processImportedKmlKmz(v_2);
      inputEl.value = "";
    }
  });
  mapEl?.addEventListener("dragover", arg1 => {
    arg1.preventDefault();
    mapEl.style.outline = "2px dashed var(--cyan-400)";
  });
  mapEl?.addEventListener("dragleave", arg1 => {
    arg1.preventDefault();
    mapEl.style.outline = "none";
  });
  mapEl?.addEventListener("drop", async arg1 => {
    arg1.preventDefault();
    mapEl.style.outline = "none";
    const v_2 = arg1.dataTransfer?.files?.[0];
    if (v_2) {
      const v_1 = v_2.name.split(".").pop().toLowerCase();
      if (["kml", "kmz", "geojson", "json"].includes(v_1)) {
        await processImportedKmlKmz(v_2);
      } else {
        showToast(t("map.toastInvalidFormat"), "warning");
      }
    }
  });
  btnEl?.addEventListener("click", () => {
    if (domEl) {
      domEl.style.display = "none";
    }
    if (state.intersectingPaftaLayerGroup) {
      state.intersectingPaftaLayerGroup.clearLayers();
    }
    state.currentIntersectScale = "100k"; // Modal kapatılınca tıklama ölçeği 100k'ya döner
  });
  elementsList.forEach(item => {
    item.addEventListener("click", () => {
      elementsList.forEach(item_1 => {
        item_1.classList.remove("btn-primary");
        item_1.classList.add("btn-secondary");
      });
      item.classList.remove("btn-secondary");
      item.classList.add("btn-primary");
      const chosenScale = item.getAttribute("data-scale") || "25k";
      state.currentIntersectScale = chosenScale; // Tıklama ve analiz ölçeğini ayarla

      if (state.importedProjectData) {
        renderIntersectingPaftasAnalysis(state.importedProjectData);
      }
    });
  });
}
async function processImportedKmlKmz(arg1) {
  showToast(t("map.toastParsing", { name: arg1.name }), "info");
  logMessage(t("map.logImporting", { name: arg1.name }));
  try {
    const v_1 = await parseKmlOrKmzFile(arg1);
    if (!v_1 || !v_1.features || v_1.features.length === 0) {
      showToast(t("map.toastNoGeometry"), "warning");
      return;
    }
    state.importedKmlLayerGroup.clearLayers();
    const v_2 = L.geoJSON(v_1, {
      style: arg1_1 => ({
        color: "#06b6d4",
        weight: 3,
        opacity: 0.9,
        fillColor: "#06b6d4",
        fillOpacity: 0.25,
        dashArray: null
      }),
      pointToLayer: (arg1_1, arg2) => {
        return L.circleMarker(arg2, {
          radius: 6,
          fillColor: "#f59e0b",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });
      },
      onEachFeature: (arg1_1, arg2) => {
        const v_3_1 = arg1_1.properties?.name || "Proje Unsuru";
        const v_4 = arg1_1.properties?.description || "";
        arg2.bindPopup("<b>" + v_3_1 + "</b>" + (v_4 ? "<br><small>" + v_4 + "</small>" : ""));
      }
    }).addTo(state.importedKmlLayerGroup);
    const v_3 = v_2.getBounds();
    if (!v_3.isValid()) {
      showToast(t("map.toastInvalidBounds"), "error");
      return;
    }
    state.map.fitBounds(v_3, {
      padding: [50, 50]
    });
    state.importedProjectData = {
      fileName: arg1.name,
      bounds: v_3,
      geojson: v_1,
      featureCount: v_1.features.length
    };

    // KML yüklendiğinde analiz ölçeğini kesinlikle 1/25 000 olarak başlat ve UI'ı güncelle
    state.currentIntersectScale = "25k";
    const scaleBtns = document.querySelectorAll(".btn-intersect-scale");
    scaleBtns.forEach(btn => {
      if (btn.getAttribute("data-scale") === "25k") {
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
      } else {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
      }
    });

    renderIntersectingPaftasAnalysis(state.importedProjectData);
    logMessage(t("map.logImportSuccess", { name: arg1.name, count: v_1.features.length }));
    showToast(t("map.toastIntersectingPaftaCalculated", { name: arg1.name }), "success");
  } catch (v_1) {
    logMessage(t("map.logImportError", { err: t(v_1.message) || v_1.message }));
    showToast(t("map.toastProcessError", { err: t(v_1.message) || v_1.message || t("common.invalidFormat") }), "error");
  }
}
async function parseKmlOrKmzFile(arg1) {
  const v_2 = arg1.name.split(".").pop().toLowerCase();
  if (v_2 === "kmz") {
    if (typeof JSZip === "undefined") {
      throw new Error("ERR_JSZIP_REQUIRED");
    }
    const v_1 = await JSZip.loadAsync(arg1);
    const v_2_1 = Object.keys(v_1.files).find(item => item.toLowerCase().endsWith(".kml"));
    if (!v_2_1) {
      throw new Error("ERR_KMZ_NO_KML");
    }
    const v_3 = await v_1.files[v_2_1].async("string");
    return parseKmlTextToGeoJson(v_3);
  } else if (v_2 === "geojson" || v_2 === "json") {
    const v_1 = await arg1.text();
    return JSON.parse(v_1);
  } else {
    const v_1 = await arg1.text();
    return parseKmlTextToGeoJson(v_1);
  }
}
function parseKmlTextToGeoJson(arg1) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(arg1, "text/xml");
  const placemarks = xmlDoc.getElementsByTagName("Placemark");
  const items = [];

  const extractFromNode = (container, defaultName, defaultDesc) => {
    // Polygons
    const polygons = container.getElementsByTagName("Polygon");
    for (let poly of polygons) {
      const coordsNodes = poly.getElementsByTagName("coordinates");
      for (let cNode of coordsNodes) {
        const coords = parseCoordString(cNode.textContent);
        if (coords.length >= 3) {
          items.push({
            type: "Feature",
            properties: { name: defaultName, description: defaultDesc },
            geometry: { type: "Polygon", coordinates: [coords] }
          });
        }
      }
    }

    // LineStrings
    const lineStrings = container.getElementsByTagName("LineString");
    for (let line of lineStrings) {
      const coordsNodes = line.getElementsByTagName("coordinates");
      for (let cNode of coordsNodes) {
        const coords = parseCoordString(cNode.textContent);
        if (coords.length >= 2) {
          items.push({
            type: "Feature",
            properties: { name: defaultName, description: defaultDesc },
            geometry: { type: "LineString", coordinates: coords }
          });
        }
      }
    }

    // Points
    const points = container.getElementsByTagName("Point");
    for (let pt of points) {
      const coordsNode = pt.getElementsByTagName("coordinates")[0];
      if (coordsNode) {
        const coords = parseCoordString(coordsNode.textContent);
        if (coords.length > 0) {
          items.push({
            type: "Feature",
            properties: { name: defaultName, description: defaultDesc },
            geometry: { type: "Point", coordinates: coords[0] }
          });
        }
      }
    }
  };

  if (placemarks && placemarks.length > 0) {
    for (let num = 0; num < placemarks.length; num++) {
      const p = placemarks[num];
      const name = p.getElementsByTagName("name")[0]?.textContent?.trim() || `Geometri ${num + 1}`;
      const desc = p.getElementsByTagName("description")[0]?.textContent?.trim() || "";
      extractFromNode(p, name, desc);
    }
  } else {
    // Placemark yoksa veya namespaced ise kök elemandan geometrileri topla
    extractFromNode(xmlDoc.documentElement, "KML Geometrisi", "");
  }

  return {
    type: "FeatureCollection",
    features: items
  };
}

function parseCoordString(arg1) {
  if (!arg1) return [];
  // Regex: boşluk, virgülden sonra boşluk veya alt satıra geçişleri tolere ederek [boylam, enlem] çeker
  const regex = /(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*,\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  const items = [];
  let match;
  while ((match = regex.exec(arg1)) !== null) {
    const lon = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    if (!isNaN(lon) && !isNaN(lat)) {
      items.push([lon, lat]);
    }
  }
  return items;
}

function renderIntersectingPaftasAnalysis(arg1) {
  const domEl = document.getElementById("cardIntersectingPaftas");
  const domEl_1 = document.getElementById("badgeIntersectingCount");
  const domEl_2 = document.getElementById("txtImportedFileName");
  const domEl_3 = document.getElementById("txtImportedFeatureCount");
  const domEl_4 = document.getElementById("listIntersectingPaftas");
  if (!domEl || !domEl_4) {
    return;
  }
  const v_2 = state.currentIntersectScale || "25k";
  const scaleTitles = {
    "100k": "1/100 000",
    "50k": "1/50 000",
    "25k": "1/25 000",
    "5k": "1/5 000",
    "2k": "1/2 000",
    "1k": "1/1 000"
  };
  const scaleName = scaleTitles[v_2] || "1/25 000";
  const v_4 = state.paftaEngine ? state.paftaEngine.getIntersectingSheets(arg1.bounds, v_2, arg1.geojson) : [];
  domEl_2.textContent = "📁 " + arg1.fileName;
  domEl_3.textContent = arg1.featureCount + " Geometri";
  domEl_1.textContent = `${v_4.length} Pafta (${scaleName})`;
  highlightIntersectingPaftas(v_4);
  domEl_4.innerHTML = "";
  if (v_4.length === 0) {
    domEl_4.innerHTML = "<div style=\"font-size: 11.5px; color: var(--text-dim); text-align: center; padding: 10px;\">" + t("map.toastNoIntersectingPafta") + "</div>";
  } else {
    const maxDisplay = 250;
    const listToRender = v_4.slice(0, maxDisplay);
    listToRender.forEach(item => {
      const v_1 = state.paftaEngine.getHgmDatumRecord(item.name, item.centerLat, item.centerLon);
      const v_2_1 = (state.gnssEngine && state.gnssEngine.geodesy && typeof state.gnssEngine.geodesy.getAutoCentralMeridian3Deg === "function")
        ? state.gnssEngine.geodesy.getAutoCentralMeridian3Deg(item.centerLon)
        : Math.floor((item.centerLon - 25.5) / 3) * 3 + 27;
      const v_3_1 = item.regionalName ? " (" + item.regionalName + ")" : "";
      const divEl = document.createElement("div");
      divEl.className = "intersecting-sheet-card";
      divEl.innerHTML = "\n                <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n                    <strong style=\"color: var(--cyan-400); font-family: var(--font-mono); font-size: 12.5px;\">" + item.name + " <span style=\"color: #f59e0b; font-weight: 700; font-size: 11px;\">" + v_3_1 + "</span></strong>\n                    <span style=\"font-size: 10px; color: var(--emerald-400); font-weight: 700; background: rgba(16, 185, 129, 0.15); padding: 1px 6px; border-radius: 4px;\">DOM " + v_2_1 + "°</span>\n                </div>\n                <div style=\"font-size: 10.5px; color: var(--text-dim); display: flex; justify-content: space-between;\">\n                    <span>" + t("map.lblHeightCorr") + " <strong style=\"color: #f59e0b;\">" + v_1.yukseklikDuz.toFixed(2) + " m</strong></span>\n                    <span>" + t("map.lblNorthCorr") + " <strong class=\"text-main\">" + v_1.yukariDuz.toFixed(1) + " m</strong></span>\n                </div>\n                <div style=\"display: flex; gap: 4px; margin-top: 2px;\">\n                    <button class=\"btn btn-secondary btn-sm\" style=\"flex: 1; padding: 2px 4px; font-size: 9.5px;\" onclick=\"event.stopPropagation(); window.downloadPaftaDirect('" + item.name + "', 'kml')\"><i class=\"fa-solid fa-earth-americas\"></i> KML</button>\n                    <button class=\"btn btn-secondary btn-sm\" style=\"flex: 1; padding: 2px 4px; font-size: 9.5px;\" onclick=\"event.stopPropagation(); window.downloadPaftaDirect('" + item.name + "', 'dxf')\"><i class=\"fa-solid fa-vector-square\"></i> DXF</button>\n                    <button class=\"btn btn-secondary btn-sm\" style=\"flex: 1; padding: 2px 4px; font-size: 9.5px;\" onclick=\"event.stopPropagation(); window.downloadPaftaDirect('" + item.name + "', 'json')\"><i class=\"fa-solid fa-code\"></i> JSON</button>\n                </div>\n            ";
      divEl.addEventListener("click", () => {
        const items = [[item.minLat, item.minLon], [item.maxLat, item.maxLon]];
        const maxZoomMap = { "1k": 18, "2k": 17, "5k": 16, "25k": 14, "50k": 12, "100k": 10 };
        const zoomLevel = maxZoomMap[v_2] || 15;
        state.map.flyToBounds(items, {
          maxZoom: zoomLevel,
          padding: [60, 60]
        });
        highlightSheet(item);
        showFloatingPaftaCard(item);
      });
      domEl_4.appendChild(divEl);
    });

    if (v_4.length > maxDisplay) {
      const notice = document.createElement("div");
      notice.style.cssText = "font-size: 11px; color: var(--amber-400); text-align: center; padding: 8px; background: rgba(245, 158, 11, 0.12); border-radius: 6px; border: 1px dashed rgba(245, 158, 11, 0.3); margin-top: 4px;";
      notice.textContent = t("map.warnPaftaLimitNotice", { total: v_4.length, max: maxDisplay });
      domEl_4.appendChild(notice);
    }
  }
  state.currentIntersectingSheets = v_4;
  const btnEl = document.getElementById("btnDownloadAllIntersectingKml");
  if (btnEl) {
    btnEl.onclick = () => {
      if (!state.currentIntersectingSheets || state.currentIntersectingSheets.length === 0) {
        showToast(t("map.toastNoIntersectingPafta"), "warning");
        return;
      }
      const v_1 = state.paftaEngine.exportMultipleSheetsKml(state.currentIntersectingSheets, "Temas Eden Paftalar (" + (state.currentIntersectScale || "25k") + ")");
      const v_2_1 = "temas_eden_paftalar_" + (state.currentIntersectScale || "25k") + ".kml";
      downloadTextFile(v_2_1, v_1);
      showToast(t("map.toastPaftaBoundariesDownloaded", { count: state.currentIntersectingSheets.length, format: v_2_1 }), "success");
    };
  }
  domEl.style.display = "block";
}
function highlightIntersectingPaftas(arg1) {
  if (!state.intersectingPaftaLayerGroup) {
    return;
  }
  state.intersectingPaftaLayerGroup.clearLayers();
  const showLabels = arg1.length <= 40;
  arg1.forEach(item => {
    const items = [[item.minLat, item.minLon], [item.maxLat, item.maxLon]];
    const rect = L.rectangle(items, {
      color: "#f59e0b",
      weight: 2,
      dashArray: "4, 4",
      fillColor: "#f59e0b",
      fillOpacity: 0.15
    }).addTo(state.intersectingPaftaLayerGroup);

    rect.bindTooltip(`<b>${item.name}</b>`, {
      permanent: showLabels,
      direction: "center",
      className: "pafta-intersect-tooltip"
    });

    rect.on("mouseover", () => {
      rect.setStyle({ fillOpacity: 0.35, weight: 2.5, color: "#06b6d4" });
    });
    rect.on("mouseout", () => {
      rect.setStyle({ fillOpacity: 0.15, weight: 2, color: "#f59e0b" });
    });
    rect.on("click", e => {
      L.DomEvent.stopPropagation(e);
      highlightSheet(item);
      showFloatingPaftaCard(item);
    });
  });
}
function renderPaftaGrid() {
  if (!state.map || !state.paftaLayerGroup || state.activePaftaScale === "off") {
    return;
  }
  state.paftaLayerGroup.clearLayers();
  const bounds = state.map.getBounds();
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();
  const zoom = state.map.getZoom();

  // Aktif ölçeğe ve zoom seviyesine göre hiyerarşik üst pafta / detay pafta eşleştirmesi
  let effectiveScale = state.activePaftaScale;
  let isOverview = false;
  let themeColor = "#06b6d4";
  let labelClass = "pafta-label-100k";
  let labelThreshold = 6;

  if (state.activePaftaScale === "100k") {
    themeColor = "#06b6d4";
    labelClass = "pafta-label-100k";
    effectiveScale = "100k";
    isOverview = false;
    labelThreshold = 6;
  } else if (state.activePaftaScale === "50k") {
    themeColor = "#a855f7";
    labelClass = "pafta-label-50k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else {
      effectiveScale = "50k";
      isOverview = false;
      labelThreshold = 8;
    }
  } else if (state.activePaftaScale === "25k") {
    themeColor = "#10b981";
    labelClass = "pafta-label-25k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else if (zoom < 10) {
      effectiveScale = "50k";
      isOverview = true;
      labelThreshold = 8;
    } else {
      effectiveScale = "25k";
      isOverview = false;
      labelThreshold = 10;
    }
  } else if (state.activePaftaScale === "5k") {
    themeColor = "#f43f5e";
    labelClass = "pafta-label-5k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else if (zoom < 10) {
      effectiveScale = "50k";
      isOverview = true;
      labelThreshold = 8;
    } else if (zoom < 12) {
      effectiveScale = "25k";
      isOverview = true;
      labelThreshold = 10;
    } else {
      effectiveScale = "5k";
      isOverview = false;
      labelThreshold = 12;
    }
  } else if (state.activePaftaScale === "2k") {
    themeColor = "#8b5cf6";
    labelClass = "pafta-label-2k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else if (zoom < 10) {
      effectiveScale = "50k";
      isOverview = true;
      labelThreshold = 8;
    } else if (zoom < 12) {
      effectiveScale = "25k";
      isOverview = true;
      labelThreshold = 10;
    } else if (zoom < 14) {
      effectiveScale = "5k";
      isOverview = true;
      labelThreshold = 12;
    } else {
      effectiveScale = "2k";
      isOverview = false;
      labelThreshold = 14;
    }
  } else if (state.activePaftaScale === "1k") {
    themeColor = "#0ea5e9";
    labelClass = "pafta-label-1k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else if (zoom < 10) {
      effectiveScale = "50k";
      isOverview = true;
      labelThreshold = 8;
    } else if (zoom < 12) {
      effectiveScale = "25k";
      isOverview = true;
      labelThreshold = 10;
    } else if (zoom < 14) {
      effectiveScale = "5k";
      isOverview = true;
      labelThreshold = 12;
    } else if (zoom < 15) {
      effectiveScale = "2k";
      isOverview = true;
      labelThreshold = 14;
    } else {
      effectiveScale = "1k";
      isOverview = false;
      labelThreshold = 15;
    }
  }

  const sheets = state.paftaEngine.getVisibleSheets(south, west, north, east, effectiveScale);
  const strokeWidth = isOverview ? 1.2 : 1.5;
  const fillOpacity = isOverview ? 0.02 : 0.06;
  const dashArray = isOverview ? "4, 4" : null;

  sheets.forEach(item => {
    const rect = L.rectangle([[item.minLat, item.minLon], [item.maxLat, item.maxLon]], {
      color: themeColor,
      weight: strokeWidth,
      dashArray: dashArray,
      fillColor: themeColor,
      fillOpacity: fillOpacity
    }).addTo(state.paftaLayerGroup);

    rect.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      if (isOverview) {
        state.map.flyToBounds([[item.minLat, item.minLon], [item.maxLat, item.maxLon]], {
          padding: [40, 40],
          maxZoom: Math.min(zoom + 2, 18)
        });
      }
      highlightSheet(item);
      showFloatingPaftaCard(item);
    });

    rect.on("mouseover", function () {
      this.setStyle({
        weight: strokeWidth + 1.2,
        fillOpacity: fillOpacity + 0.14
      });
    });

    rect.on("mouseout", function () {
      this.setStyle({
        weight: strokeWidth,
        fillOpacity: fillOpacity
      });
    });

    if (zoom >= labelThreshold) {
      const labelIcon = L.divIcon({
        className: labelClass,
        html: item.name,
        iconSize: null
      });
      L.marker([item.centerLat, item.centerLon], {
        icon: labelIcon,
        interactive: false
      }).addTo(state.paftaLayerGroup);
    }
  });
}
function renderDomGrid() {
  if (!state.map || !state.domLayerGroup || !state.isDomLayerActive) {
    return;
  }
  state.domLayerGroup.clearLayers();
  const v_1 = state.paftaEngine.getTurkishDomZones();
  const num = 34.2;
  const num_1 = 42.6;
  v_1.forEach((item, idx) => {
    const v_1_1 = L.rectangle([[num, item.minLon], [num_1, item.maxLon]], {
      color: "#f59e0b",
      weight: 2,
      dashArray: "6, 6",
      fillColor: idx % 2 === 0 ? "#f59e0b" : "#fbbf24",
      fillOpacity: 0.04
    }).addTo(state.domLayerGroup);
    const v_2 = L.divIcon({
      className: "",
      html: "<div class=\"dom-marker-label\" title=\"" + item.name + " (" + item.minLon + "° - " + item.maxLon + "° E)\">📍 DOM " + item.dom + "°<br><span style=\"font-size: 8.5px; font-weight: 500; opacity: 0.85;\">Dilim " + item.zone + "</span></div>",
      iconSize: null
    });
    const v_3 = L.divIcon({
      className: "",
      html: "<div class=\"dom-marker-label\" title=\"" + item.name + " (" + item.minLon + "° - " + item.maxLon + "° E)\">📍 DOM " + item.dom + "°<br><span style=\"font-size: 8.5px; font-weight: 500; opacity: 0.85;\">Dilim " + item.zone + "</span></div>",
      iconSize: null
    });
    const v_4 = L.marker([41.9, item.dom], {
      icon: v_2
    }).addTo(state.domLayerGroup);
    const v_5 = L.marker([35.8, item.dom], {
      icon: v_3
    }).addTo(state.domLayerGroup);
    const v_6 = `
            <div style="font-family: var(--font-body); font-size: 12px; line-height: 1.5; color: #000; min-width: 250px;">
                <div style="font-size: 13.5px; font-weight: 800; color: #d97706; border-bottom: 2px solid #f59e0b; padding-bottom: 3px; margin-bottom: 6px;">
                    ${t("map.domZoneTitle", { dom: item.dom, zone: item.zone })}
                </div>
                <div style="margin-bottom: 4px;"><strong>${t("map.domCentralMeridian")}:</strong> ${item.dom}° 00' 00" E</div>
                <div style="margin-bottom: 4px;"><strong>${t("map.domLonRange")}:</strong> ${item.minLon}° - ${item.maxLon}° E (${item.dom - 1.5}° - ${item.dom + 1.5}°)</div>
                <div style="margin-bottom: 4px;"><strong>TUREF / ITRF-96:</strong> <span style="font-family: monospace; font-weight: bold; color: #0284c7;">${item.epsg}</span></div>
                <div style="margin-bottom: 4px;"><strong>ED-50:</strong> <span style="font-family: monospace; font-weight: bold; color: #7c3aed;">${item.epsgEd50}</span></div>
                <div style="margin-top: 6px; font-size: 11px; color: #475569; background: #fef3c7; padding: 5px 8px; border-radius: 4px; border-left: 3px solid #f59e0b;">
                    <strong>${t("map.domRegions")}:</strong> ${item.desc}
                </div>
            </div>
        `;
    v_1_1.bindPopup(v_6);
    v_4.bindPopup(v_6);
    v_5.bindPopup(v_6);
  });
}
function highlightSheet(arg1) {
  if (!state.map) {
    return;
  }
  if (state.highlightedPaftaLayer) {
    state.map.removeLayer(state.highlightedPaftaLayer);
  }
  state.selectedPaftaSheet = arg1;
  state.highlightedPaftaLayer = L.rectangle([[arg1.minLat, arg1.minLon], [arg1.maxLat, arg1.maxLon]], {
    color: "#f59e0b",
    weight: 3.5,
    fillColor: "#f59e0b",
    fillOpacity: 0.18,
    dashArray: "2, 6"
  }).addTo(state.map);
}
function showFloatingPaftaCard(arg1, arg2) {
  state.selectedPaftaSheet = arg1;
  const domEl = document.getElementById("cardActivePafta");
  if (!domEl) {
    return;
  }
  const v_3 = state.gnssEngine.geodesy.getAutoCentralMeridian3Deg(arg1.centerLon);
  const v_4 = v_3 / 3 + 0;
  const v_5 = arg1.regionalName || "";
  document.getElementById("txtPaftaCardTitle").textContent = arg1.name;
  document.getElementById("txtPaftaCardScale").textContent = arg1.scale;
  document.getElementById("txtPaftaCardLat").textContent = arg1.centerLat.toFixed(5) + "° N";
  document.getElementById("txtPaftaCardLon").textContent = arg1.centerLon.toFixed(5) + "° E";
  document.getElementById("txtPaftaCardDom").textContent = t("map.lblDomZone", { dom: v_3, zone: v_4 });


  let allSheetsObj = arg2;
  if (!allSheetsObj) {
    allSheetsObj = state.paftaEngine.getAllSheetsForPoint(arg1.centerLat, arg1.centerLon);
  }

  const el100k = document.getElementById("txtPaftaCard100k");
  const el50k = document.getElementById("txtPaftaCard50k");
  const el25k = document.getElementById("txtPaftaCard25k");

  if (el100k && allSheetsObj.s100k) {
    el100k.textContent = allSheetsObj.s100k.name;
    el100k.style.cursor = "pointer";
    el100k.title = allSheetsObj.s100k.name;
    el100k.onclick = () => {
      state.activePaftaScale = "100k";
      state.currentIntersectScale = "100k";
      highlightSheet(allSheetsObj.s100k);
      showFloatingPaftaCard(allSheetsObj.s100k, allSheetsObj);
    };
  }

  if (el50k && allSheetsObj.s50k) {
    el50k.textContent = allSheetsObj.s50k.name;
    el50k.style.cursor = "pointer";
    el50k.title = allSheetsObj.s50k.name;
    el50k.onclick = () => {
      state.activePaftaScale = "50k";
      state.currentIntersectScale = "50k";
      highlightSheet(allSheetsObj.s50k);
      showFloatingPaftaCard(allSheetsObj.s50k, allSheetsObj);
    };
  }

  if (el25k && allSheetsObj.s25k) {
    el25k.textContent = allSheetsObj.s25k.name;
    el25k.style.cursor = "pointer";
    el25k.title = allSheetsObj.s25k.name;
    el25k.onclick = () => {
      state.activePaftaScale = "25k";
      state.currentIntersectScale = "25k";
      highlightSheet(allSheetsObj.s25k);
      showFloatingPaftaCard(allSheetsObj.s25k, allSheetsObj);
    };
  }


  const el5k = document.getElementById("txtPaftaCard5k");
  if (el5k && allSheetsObj.s5k) {
    el5k.textContent = allSheetsObj.s5k.name;
    el5k.style.cursor = "pointer";
    el5k.title = allSheetsObj.s5k.name;
    el5k.onclick = () => {
      state.activePaftaScale = "5k";
      state.currentIntersectScale = "5k";
      highlightSheet(allSheetsObj.s5k);
      showFloatingPaftaCard(allSheetsObj.s5k, allSheetsObj);
    };
  }

  const el2k = document.getElementById("txtPaftaCard2k");
  if (el2k && allSheetsObj.s2k) {
    el2k.textContent = allSheetsObj.s2k.name;
    el2k.style.cursor = "pointer";
    el2k.title = allSheetsObj.s2k.name;
    el2k.onclick = () => {
      state.activePaftaScale = "2k";
      state.currentIntersectScale = "2k";
      highlightSheet(allSheetsObj.s2k);
      showFloatingPaftaCard(allSheetsObj.s2k, allSheetsObj);
    };
  }

  const el1k = document.getElementById("txtPaftaCard1k");
  if (el1k && allSheetsObj.s1k) {
    el1k.textContent = allSheetsObj.s1k.name;
    el1k.style.cursor = "pointer";
    el1k.title = allSheetsObj.s1k.name;
    el1k.onclick = () => {
      state.activePaftaScale = "1k";
      state.currentIntersectScale = "1k";
      highlightSheet(allSheetsObj.s1k);
      showFloatingPaftaCard(allSheetsObj.s1k, allSheetsObj);
    };
  }

  const s25Sheet = allSheetsObj.s25k || (arg1.scale === "1/25 000" ? arg1 : state.paftaEngine.get25kSheet(arg1.centerLat, arg1.centerLon));
  const hgmLookupKey = s25Sheet ? (s25Sheet.hgmKey || s25Sheet.name) : arg1.name;
  const datumCorr = (s25Sheet && s25Sheet.datumCorr && s25Sheet.datumCorr.isOfficial)
    ? s25Sheet.datumCorr
    : state.paftaEngine.getHgmDatumRecord(hgmLookupKey, arg1.centerLat, arg1.centerLon);

  const elPaftaRef = document.getElementById("txtHgmPaftaRef");
  if (elPaftaRef) {
    const ref25kName = s25Sheet ? s25Sheet.name : (datumCorr.pafta25k || arg1.name);
    elPaftaRef.textContent = ref25kName;
    elPaftaRef.title = t("map.titleShow25kSheet", { name: ref25kName });
    elPaftaRef.onclick = () => {
      if (s25Sheet) {
        state.activePaftaScale = "25k";
        state.currentIntersectScale = "25k";
        highlightSheet(s25Sheet);
        showFloatingPaftaCard(s25Sheet, allSheetsObj);
      }
    };
  }

  const domEl_1 = document.getElementById("txtHgmYukseklik");
  if (domEl_1) {
    domEl_1.textContent = datumCorr.yukseklikDuz.toFixed(2) + " m";
  }
  const domEl_2 = document.getElementById("txtHgmYukari");
  if (domEl_2) {
    domEl_2.textContent = (datumCorr.yukariDuz >= 0 ? "+" : "") + datumCorr.yukariDuz.toFixed(1) + " m";
  }
  const domEl_3 = document.getElementById("txtHgmSaga");
  if (domEl_3) {
    domEl_3.textContent = (datumCorr.sagaDuz >= 0 ? "+" : "") + datumCorr.sagaDuz.toFixed(1) + " m";
  }
  const domEl_4 = document.getElementById("txtHgmEnlem");
  if (domEl_4) {
    domEl_4.textContent = (datumCorr.enlemDuz >= 0 ? "+" : "") + datumCorr.enlemDuz.toFixed(2) + "\"";
  }
  const domEl_5 = document.getElementById("txtHgmBoylam");
  if (domEl_5) {
    domEl_5.textContent = (datumCorr.boylamDuz >= 0 ? "+" : "") + datumCorr.boylamDuz.toFixed(2) + "\"";
  }
  const domEl_6 = document.getElementById("txtHgmSourceLabel");
  if (domEl_6) {
    domEl_6.textContent = datumCorr.isOfficial ? t("map.officialDb") : t("map.calculated");
    domEl_6.style.color = datumCorr.isOfficial ? "var(--emerald-400)" : "var(--amber-400)";
  }
  const domEl_7 = document.getElementById("txtPaftaCardRegion");
  if (domEl_7) {
    domEl_7.textContent = v_5 ? t("map.paftaNamePrefix", { name: v_5 }) : "";
    domEl_7.style.display = v_5 ? "block" : "none";
  }
  domEl.style.display = "block";
}
// ==========================================================================
// CADASTRE RTK & CORS INTERACTIVE PANORAMIC MAP ENGINE
// ==========================================================================
state.cadastreLabelsVisible = true;
state.cadastreRouteVisible = false;
state.cadastreFilter = "ALL";
state.selectedCadastrePoint = null;
state.cadastreMarkersMap = new Map();

function initCadastreMap() {
  if (state.cadastreMap) {
    state.cadastreMap.invalidateSize();
    return;
  }
  const mapEl = document.getElementById("cadastreMapContainer");
  if (!mapEl || typeof L === "undefined") return;

  const { map } = createStudioMap("cadastreMapContainer", {
    center: [39.0, 35.2],
    zoom: 6,
    minZoom: 5,
    maxZoom: 22,
    defaultType: "hybrid"
  });
  state.cadastreMap = map;
  state.cadastreLayerGroup = L.layerGroup().addTo(state.cadastreMap);
  state.cadastreRouteLayerGroup = L.layerGroup().addTo(state.cadastreMap);

  // Türkiye Geneline Odakla Butonu
  const btnReset = document.getElementById("btnCadastreResetView");
  btnReset?.addEventListener("click", () => {
    if (state.cadastreMap) {
      state.cadastreMap.setView([39.0, 35.2], 6);
    }
  });

  // Ekrana Sığdır Butonu
  const btnFit = document.getElementById("btnFitCadastreMap");
  btnFit?.addEventListener("click", () => {
    fitCadastreMapBounds();
  });

  // Nokta Numaraları / Etiketleri Aç / Kapat
  const btnLabels = document.getElementById("btnCadastreToggleLabels");
  btnLabels?.addEventListener("click", () => {
    state.cadastreLabelsVisible = !state.cadastreLabelsVisible;
    btnLabels.classList.toggle("active", state.cadastreLabelsVisible);
    btnLabels.classList.toggle("text-cyan", state.cadastreLabelsVisible);
    plotCadastrePointsOnMap();
  });

  // Ölçüm Güzergah Çizgisi Aç / Kapat
  const btnRoute = document.getElementById("btnCadastreToggleRoute");
  btnRoute?.addEventListener("click", () => {
    state.cadastreRouteVisible = !state.cadastreRouteVisible;
    btnRoute.classList.toggle("active", state.cadastreRouteVisible);
    btnRoute.classList.toggle("text-cyan", state.cadastreRouteVisible);
    drawCadastreRoute();
  });

  // Filtre Grubu Butonları (Tümü / Çift Okuma / Limit Aşımı / Tekil)
  const filterBtns = document.querySelectorAll("#cadastreMapFilterGroup [data-map-filter]");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.cadastreFilter = btn.getAttribute("data-map-filter") || "ALL";
      plotCadastrePointsOnMap();
    });
  });

  // HUD Kopyala Butonu
  const btnHudCopy = document.getElementById("btnCadastreHudCopy");
  btnHudCopy?.addEventListener("click", () => {
    if (!state.selectedCadastrePoint) {
      showToast(t("cadastre.hudNoPoint"), "info");
      return;
    }
    const pt = state.selectedCadastrePoint;
    const text = `${pt.pn}\t${pt.e.toFixed(3)}\t${pt.n.toFixed(3)}\t${pt.h.toFixed(3)}`;
    copyToClipboard(text, t("cadastre.toastPointCopied", { point: pt.pn }));
  });

  // HUD Odaklan Butonu
  const btnHudFocus = document.getElementById("btnCadastreHudFocus");
  btnHudFocus?.addEventListener("click", () => {
    if (!state.selectedCadastrePoint || !state.selectedCadastrePoint.lat || !state.selectedCadastrePoint.lon) {
      showToast(t("cadastre.hudNoPoint"), "info");
      return;
    }
    const { lat, lon, pn } = state.selectedCadastrePoint;
    state.cadastreMap.flyTo([lat, lon], 18, { animate: true, duration: 1 });
    showToast(t("cadastre.toastPointFocused", { point: pn }), "info");
  });

  // Hızlı Dışa Aktarma Butonları
  document.getElementById("btnCadastreMapExportDxf")?.addEventListener("click", () => {
    elements.btnExportDxf?.click();
  });
  document.getElementById("btnCadastreMapExportKml")?.addEventListener("click", () => {
    elements.btnExportKmlCadastre?.click();
  });
  document.getElementById("btnCadastreMapExportNcn")?.addEventListener("click", () => {
    elements.btnExportNcn?.click();
  });
  document.getElementById("btnCadastreMapExportCsv")?.addEventListener("click", () => {
    elements.btnExportCadastreCsv?.click();
  });
  document.getElementById("btnCadastreMapExportPdf")?.addEventListener("click", () => {
    elements.btnPrintCadastre?.click();
  });

  plotCadastrePointsOnMap();
}

function fitCadastreMapBounds() {
  if (!state.cadastreMap || !state.cadastreLayerGroup) return;
  const layers = state.cadastreLayerGroup.getLayers();
  if (layers.length > 0) {
    const bounds = L.featureGroup(layers).getBounds();
    if (bounds.isValid()) {
      state.cadastreMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }
  }
}

function drawCadastreRoute() {
  if (!state.cadastreRouteLayerGroup) return;
  state.cadastreRouteLayerGroup.clearLayers();
  if (!state.cadastreRouteVisible) return;

  const rawPts = state.gnssEngine?.rawPoints || [];
  if (rawPts.length < 2) return;

  const latLngs = [];
  rawPts.forEach(pt => {
    if (pt.lat !== undefined && pt.lon !== undefined) {
      latLngs.push([pt.lat, pt.lon]);
    }
  });

  if (latLngs.length >= 2) {
    L.polyline(latLngs, {
      color: "#06b6d4",
      weight: 2.5,
      opacity: 0.85,
      dashArray: "6, 8"
    }).addTo(state.cadastreRouteLayerGroup);
  }
}

function selectCadastrePoint(point, flyToMarker = false) {
  if (!point) return;
  state.selectedCadastrePoint = point;

  const hudPtName = document.getElementById("cadastreHudPointName");
  const hudBadge = document.getElementById("cadastreHudStatusBadge");
  const hudDsVal = document.getElementById("cadastreHudDsVal");
  const hudCoords = document.getElementById("cadastreHudCoords");
  const hudHeights = document.getElementById("cadastreHudHeights");
  const hudQuality = document.getElementById("cadastreHudQuality");
  const hudTime = document.getElementById("cadastreHudTime");

  if (hudPtName) hudPtName.textContent = point.pn || "--";

  // Durum ve Tolerans Rozeti
  const meta = point._meta || {};
  if (hudBadge) {
    hudBadge.className = "badge text-2xs";
    if (meta.isDual) {
      if (meta.isPass) {
        hudBadge.classList.add("badge-emerald");
        hudBadge.textContent = t("cadastre.hudStatusPass");
      } else {
        hudBadge.classList.add("badge-rose");
        hudBadge.textContent = t("cadastre.hudStatusFail");
      }
    } else {
      hudBadge.classList.add("badge-cyan");
      hudBadge.textContent = t("cadastre.hudStatusSingle");
    }
  }

  if (hudDsVal) {
    hudDsVal.textContent = meta.isDual && meta.ds2d ? `ΔS: ${meta.ds2d} cm` : "";
    hudDsVal.className = meta.isPass ? "text-xs font-mono text-emerald font-bold" : "text-xs font-mono text-rose font-bold";
  }

  if (hudCoords) {
    hudCoords.textContent = `Y: ${point.e?.toFixed(3) || "-"} | X: ${point.n?.toFixed(3) || "-"}`;
  }

  if (hudHeights) {
    const ortho = point.orthoH !== undefined ? point.orthoH.toFixed(3) : (point.h - 34.455).toFixed(3);
    const nVal = point.tg20N ? point.tg20N : "N≈34.455";
    hudHeights.textContent = `H: ${ortho}m | h: ${point.h?.toFixed(3) || "-"}m | N: ${nVal}`;
  }

  if (hudQuality) {
    hudQuality.textContent = `RMS: ${point.hsdvVal ? point.hsdvVal.toFixed(3) : "-"} m | PDOP: ${point.pdop || "-"}`;
  }

  if (hudTime) {
    hudTime.textContent = `SAT: ${point.sats || "-"} | ${point.tm || point.dt || "--:--:--"}`;
  }

  if (flyToMarker && point.lat !== undefined && point.lon !== undefined && state.cadastreMap) {
    state.cadastreMap.flyTo([point.lat, point.lon], 18, { animate: true, duration: 0.8 });
    const marker = state.cadastreMarkersMap.get(point.pn);
    if (marker) {
      marker.openPopup();
    }
  }
}
window.selectCadastrePoint = selectCadastrePoint;

function plotCadastrePointsOnMap() {
  if (!state.cadastreMap || !state.cadastreLayerGroup) {
    return;
  }
  state.cadastreLayerGroup.clearLayers();
  state.cadastreMarkersMap.clear();

  const rawPts = state.gnssEngine?.rawPoints || [];
  const badgeCount = document.getElementById("badgeCadastreMapCount");
  const badgeCrs = document.getElementById("badgeCadastreMapCrs");

  if (badgeCrs && state.gnssEngine?.centralMeridian) {
    badgeCrs.textContent = `ITRF-96 TM 3° (DOM: ${state.gnssEngine.centralMeridian}°)`;
  }

  if (rawPts.length === 0) {
    if (badgeCount) badgeCount.textContent = t("cadastre.badgePointCount", { count: 0 });
    return;
  }

  // Çift okuma eşleşme tablosunu hızlı arama sözlüğü haline getir
  const matchedPairs = state.gnssEngine?.matchedPairs || [];
  const dualLookup = new Map();
  matchedPairs.forEach(pair => {
    if (pair.p1) dualLookup.set(pair.p1, pair);
    if (pair.p2) dualLookup.set(pair.p2, pair);
  });

  const validBounds = [];

  rawPts.forEach((item, index) => {
    let lat = item.lat ?? item.latDec;
    let lon = item.lon ?? item.lonDec;

    if ((lat === undefined || lon === undefined) && state.geodesyEngine && item.e && item.n) {
      try {
        const geo = state.geodesyEngine.inverseTM(item.e, item.n, state.gnssEngine.centralMeridian, 1.0, false);
        lat = geo.lat;
        lon = geo.lon;
        item.lat = lat;
        item.lon = lon;
      } catch (e) {}
    }

    if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
      return;
    }

    // Çift okuma durum meta verisi
    const pair = dualLookup.get(item);
    const isDual = !!pair;
    const isPass = isDual ? pair.isDistPassed : false;
    const ds2d = isDual ? pair.ds2d : null;
    const type = isDual ? (isPass ? "DUAL_PASS" : "DUAL_FAIL") : "SINGLE";

    item._meta = { isDual, isPass, ds2d, type, pair };

    // Filtre Kontrolü
    if (state.cadastreFilter !== "ALL") {
      if (state.cadastreFilter !== type) return;
    }

    validBounds.push([lat, lon]);

    // Özel Neon İkon Tasarımı
    let markerHtml = "";
    let markerClass = "";
    if (type === "DUAL_PASS") {
      markerClass = "cadastre-marker-pin cadastre-marker-dual-pass";
      markerHtml = `<div class="${markerClass}"><i class="fa-solid fa-check"></i></div>`;
    } else if (type === "DUAL_FAIL") {
      markerClass = "cadastre-marker-pin cadastre-marker-dual-fail";
      markerHtml = `<div class="${markerClass}"><i class="fa-solid fa-triangle-exclamation"></i></div>`;
    } else {
      markerClass = "cadastre-marker-pin cadastre-marker-single";
      markerHtml = `<div class="${markerClass}"><i class="fa-solid fa-circle-dot"></i></div>`;
    }

    const customIcon = L.divIcon({
      className: "cadastre-leaflet-icon-container",
      html: markerHtml,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(state.cadastreLayerGroup);
    state.cadastreMarkersMap.set(item.pn, marker);

    // Etiket (Tooltip)
    marker.bindTooltip(`<b>${item.pn}</b>`, {
      permanent: state.cadastreLabelsVisible,
      direction: "top",
      offset: [0, -10],
      className: "map-point-label"
    });

    // Zengin Geomatik Bilgi Pop-Up'ı
    const orthoH = item.orthoH !== undefined ? item.orthoH : item.h - 34.455;
    const nFormatted = item.tg20N ? item.tg20N : "+34.455 m";
    const statusColor = type === "DUAL_PASS" ? "#10b981" : (type === "DUAL_FAIL" ? "#f43f5e" : "#06b6d4");
    const statusLabel = type === "DUAL_PASS" ? t("cadastre.hudStatusPass") : (type === "DUAL_FAIL" ? t("cadastre.hudStatusFail") : t("cadastre.hudStatusSingle"));

    const popupContent = `
      <div style="font-family: var(--font-sans, sans-serif); font-size: 12px; line-height: 1.5; min-width: 220px; color: #f1f5f9;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; margin-bottom: 6px;">
          <b style="color: #38bdf8; font-size: 14px;">📍 ${item.pn}</b>
          <span style="background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}55; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${statusLabel}</span>
        </div>
        <div><strong>${t("geomatics.easting")}:</strong> <span style="font-family: monospace; color: #ffffff;">${item.e.toFixed(3)} m</span></div>
        <div><strong>${t("geomatics.northing")}:</strong> <span style="font-family: monospace; color: #ffffff;">${item.n.toFixed(3)} m</span></div>
        <div><strong>${t("geomatics.orthometricHeight")}:</strong> <span style="font-family: monospace; color: #fbbf24; font-weight: 700;">${orthoH.toFixed(3)} m</span> (TG-20 N: ${nFormatted})</div>
        <div><strong>${t("geomatics.ellipsoidalHeight")}:</strong> <span style="font-family: monospace; color: #94a3b8;">${item.h.toFixed(3)} m</span></div>
        ${isDual ? `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); color: ${statusColor};"><strong>ΔS (2B Fark):</strong> ${ds2d} cm | <strong>Δt:</strong> ${pair.timeDiffStr || "-"}</div>` : ""}
        <div style="margin-top: 4px; color: #94a3b8; font-size: 11px;">
          <strong>RMS:</strong> ${item.hsdvVal ? item.hsdvVal.toFixed(3) : "-"} m | <strong>PDOP:</strong> ${item.pdop || "-"} | <strong>SAT:</strong> ${item.sats || "-"}
        </div>
      </div>
    `;
    marker.bindPopup(popupContent, { className: "custom-leaflet-popup" });

    marker.on("click", () => {
      selectCadastrePoint(item, false);
    });
  });

  // Rozet Güncellemesi
  if (badgeCount) {
    badgeCount.textContent = t("cadastre.badgePointCount", { count: validBounds.length });
  }

  // Güzergah Çizgisi
  drawCadastreRoute();

  // Otomatik İlk Nokta Seçimi & HUD Güncellemesi
  if (!state.selectedCadastrePoint && rawPts.length > 0) {
    selectCadastrePoint(rawPts[0], false);
  } else if (state.selectedCadastrePoint) {
    selectCadastrePoint(state.selectedCadastrePoint, false);
  }

  // İlk yüklemede haritayı noktalara sığdır
  if (validBounds.length > 0) {
    fitCadastreMapBounds();
  }
}
function plotTrajectoryOnMap(arg1) {
  if (!state.map || !state.mapLayerGroup) {
    return;
  }
  state.mapLayerGroup.clearLayers();
  const v_2 = arg1.map(item => [item.lat, item.lon]);
  const v_3 = L.polyline(v_2, {
    color: "#06b6d4",
    weight: 4,
    opacity: 0.9
  }).addTo(state.mapLayerGroup);
  const v_4 = arg1[0];
  const v_5 = L.marker([v_4.lat, v_4.lon]).addTo(state.mapLayerGroup);
  v_5.bindPopup(`<b>${t("map.stationPos")}</b><br>Lat: ` + v_4.lat.toFixed(8) + "°<br>Lon: " + v_4.lon.toFixed(8) + "°<br>Height: " + v_4.h.toFixed(3) + " m<br>Epoch: " + arg1.length).openPopup();
  state.map.fitBounds(v_3.getBounds(), {
    padding: [40, 40]
  });
}
function exportKml() {
  // 1. Durum: Ekranda seçili/vurgulanmış bir Pafta varsa
  if (state.selectedPaftaSheet) {
    const kmlContent = state.paftaEngine.exportSingleSheetKml(state.selectedPaftaSheet);
    const fileName = `${state.selectedPaftaSheet.name}_pafta_siniri.kml`;
    downloadTextFile(fileName, kmlContent);
    showToast(t("map.toastDownloaded", { name: fileName }), "success");
    return;
  }

  // 2. Durum: Temas eden pafta listesi varsa
  if (state.currentIntersectingSheets && state.currentIntersectingSheets.length > 0) {
    const scaleLabel = state.currentIntersectScale || "25k";
    const kmlContent = state.paftaEngine.exportMultipleSheetsKml(state.currentIntersectingSheets, `Temas Eden Paftalar (${scaleLabel})`);
    const fileName = `temas_eden_paftalar_${scaleLabel}.kml`;
    downloadTextFile(fileName, kmlContent);
    showToast(t("map.toastIntersectingDownloaded", { name: fileName, count: state.currentIntersectingSheets.length }), "success");
    return;
  }

  // 3. Durum: İçe aktarılmış proje geometrisi varsa
  if (state.importedProjectData && state.importedProjectData.geojson) {
    const fileName = `${(state.importedProjectData.fileName || "proje").replace(/\.[^/.]+$/, "")}_export.kml`;
    let str = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n<name>' + fileName + '</name>\n';
    const feats = state.importedProjectData.geojson.features || [];
    for (let f of feats) {
      const pName = f.properties?.name || "Geometri";
      if (f.geometry?.type === "Point") {
        const c = f.geometry.coordinates;
        str += `<Placemark><name>${pName}</name><Point><coordinates>${c[0]},${c[1]},${c[2] || 0}</coordinates></Point></Placemark>\n`;
      } else if (f.geometry?.type === "Polygon") {
        const coords = f.geometry.coordinates[0].map(pt => `${pt[0]},${pt[1]},${pt[2] || 0}`).join(" ");
        str += `<Placemark><name>${pName}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>\n`;
      } else if (f.geometry?.type === "LineString") {
        const coords = f.geometry.coordinates.map(pt => `${pt[0]},${pt[1]},${pt[2] || 0}`).join(" ");
        str += `<Placemark><name>${pName}</name><LineString><coordinates>${coords}</coordinates></LineString></Placemark>\n`;
      }
    }
    str += '</Document>\n</kml>';
    downloadTextFile(fileName, str);
    showToast(t("map.toastDownloaded", { name: fileName }), "success");
    return;
  }

  // 4. Durum: Kadastro noktaları veya GNSS ölçüm çözümleri
  const points = (state.cadastrePoints && state.cadastrePoints.length > 0)
    ? state.cadastrePoints
    : (state.activePoints && state.activePoints.length > 0 ? state.activePoints : state.posSolutions || []);

  if (points.length === 0) {
    showToast(t("map.toastNoDataToExport"), "warning");
    return;
  }

  let str = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n<Document>\n<name>" + t("map.kmlDocName") + "</name>\n";
  for (let p of points) {
    const pName = p.name || p.id || p.pointId || t("common.point");
    const lon = p.lon ?? p.lng ?? p.longitude;
    const lat = p.lat ?? p.latitude;
    const h = p.h ?? p.height ?? p.elevation ?? p.ellipsoidalHeight ?? 0;
    if (lat !== undefined && lon !== undefined) {
      str += "<Placemark><name>" + pName + "</name><Point><coordinates>" + Number(lon).toFixed(8) + "," + Number(lat).toFixed(8) + "," + Number(h).toFixed(3) + "</coordinates></Point></Placemark>\n";
    }
  }
  str += "</Document>\n</kml>";
  downloadTextFile("gnss_points.kml", str);
  showToast(t("map.toastDownloaded", { name: "gnss_points.kml" }), "success");
}

function exportGeoJson() {
  // 1. Durum: Ekranda seçili/vurgulanmış bir Pafta varsa
  if (state.selectedPaftaSheet) {
    const geoJsonContent = state.paftaEngine.exportSingleSheetGeoJson(state.selectedPaftaSheet);
    const fileName = `${state.selectedPaftaSheet.name}_pafta_siniri.geojson`;
    downloadTextFile(fileName, geoJsonContent);
    showToast(t("map.toastDownloaded", { name: fileName }), "success");
    return;
  }

  // 2. Durum: Temas eden pafta listesi varsa
  if (state.currentIntersectingSheets && state.currentIntersectingSheets.length > 0) {
    const scaleLabel = state.currentIntersectScale || "25k";
    const geoJsonContent = state.paftaEngine.exportMultipleSheetsGeoJson(state.currentIntersectingSheets);
    const fileName = `temas_eden_paftalar_${scaleLabel}.geojson`;
    downloadTextFile(fileName, geoJsonContent);
    showToast(t("map.toastIntersectingDownloaded", { name: fileName, count: state.currentIntersectingSheets.length }), "success");
    return;
  }

  // 3. Durum: İçe aktarılmış proje geometrisi varsa
  if (state.importedProjectData && state.importedProjectData.geojson) {
    const fileName = `${(state.importedProjectData.fileName || "proje").replace(/\.[^/.]+$/, "")}_export.geojson`;
    downloadTextFile(fileName, JSON.stringify(state.importedProjectData.geojson, null, 2));
    showToast(t("map.toastDownloaded", { name: fileName }), "success");
    return;
  }

  // 4. Durum: Kadastro noktaları veya GNSS ölçüm çözümleri
  const points = (state.cadastrePoints && state.cadastrePoints.length > 0)
    ? state.cadastrePoints
    : (state.activePoints && state.activePoints.length > 0 ? state.activePoints : state.posSolutions || []);

  if (points.length === 0) {
    showToast(t("map.toastNoDataToExport"), "warning");
    return;
  }

  const features = points.map(item => {
    const lon = item.lon ?? item.lng ?? item.longitude;
    const lat = item.lat ?? item.latitude;
    const h = item.h ?? item.height ?? item.elevation ?? item.ellipsoidalHeight ?? 0;
    return {
      type: "Feature",
      properties: {
        name: item.name || item.id || item.pointId || "",
        code: item.code || item.description || "",
        height: h
      },
      geometry: {
        type: "Point",
        coordinates: [Number(lon), Number(lat), Number(h)]
      }
    };
  }).filter(item => !isNaN(item.geometry.coordinates[0]) && !isNaN(item.geometry.coordinates[1]));

  const obj = {
    type: "FeatureCollection",
    features: features
  };
  downloadTextFile("gnss_points.geojson", JSON.stringify(obj, null, 2));
  showToast(t("map.toastDownloaded", { name: "gnss_points.geojson" }), "success");
}

window.createBaseLayers = createBaseLayers;
