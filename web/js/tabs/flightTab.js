/**
 * Harita Tools - UAV Flight Planner & Smart GCP Station Controller
 */
function initFlightPlannerStudio() {
  if (!state.flightEngine) {
    state.flightEngine = new FlightPlannerEngine();
  }
  const mapEl = document.getElementById("flightMapContainer");
  if (!mapEl) {
    return;
  }
  if (!state.flightMap) {
    const { map } = createStudioMap("flightMapContainer", {
      center: [39, 35.2],
      zoom: 6,
      defaultType: "hybrid"
    });
    state.flightMap = map;
    state.flightOriginalLayer = L.layerGroup().addTo(state.flightMap);
    state.flightSimplifiedLayer = L.layerGroup().addTo(state.flightMap);
    state.flightRoadLayer = L.layerGroup().addTo(state.flightMap);
    state.flightTriangulationLayer = L.layerGroup().addTo(state.flightMap);
    state.flightGcpLayer = L.layerGroup().addTo(state.flightMap);
    state.isFlightMapInit = true;
    bindRoadDrawingMapEvents();

    // Mobile Map Tools Dropdown Menu Toggle
    const btnMobileMapTools = document.getElementById("btnFlightMapMenuToggle");
    const mapToolbarEl = document.getElementById("mapControlToolbar");
    const iconMapChevron = document.getElementById("iconFlightMapMenuChevron");

    if (btnMobileMapTools && mapToolbarEl) {
      btnMobileMapTools.addEventListener("click", (e) => {
        e.stopPropagation();
        mapToolbarEl.classList.toggle("mobile-open");
        const isOpen = mapToolbarEl.classList.contains("mobile-open");
        if (iconMapChevron) {
          iconMapChevron.className = isOpen ? "fa-solid fa-chevron-up text-xs text-cyan" : "fa-solid fa-chevron-down text-xs text-cyan";
        }
      });

      mapToolbarEl.querySelectorAll(".btn, .map-btn-compact").forEach(btn => {
        btn.addEventListener("click", () => {
          if (window.innerWidth <= 900) {
            mapToolbarEl.classList.remove("mobile-open");
            if (iconMapChevron) iconMapChevron.className = "fa-solid fa-chevron-down text-xs text-cyan";
          }
        });
      });

      document.addEventListener("click", (e) => {
        if (window.innerWidth <= 900 && mapToolbarEl.classList.contains("mobile-open")) {
          if (!mapToolbarEl.contains(e.target) && !btnMobileMapTools.contains(e.target)) {
            mapToolbarEl.classList.remove("mobile-open");
            if (iconMapChevron) iconMapChevron.className = "fa-solid fa-chevron-down text-xs text-cyan";
          }
        }
      });
    }

    document.getElementById("btnDrawCustomRoad")?.addEventListener("click", () => {
      startDrawingRoad();
    });
    document.getElementById("btnPanelDrawRoad")?.addEventListener("click", () => {
      startDrawingRoad();
    });
    document.getElementById("btnFinishDrawRoad")?.addEventListener("click", () => {
      finishDrawingRoad();
    });
    document.getElementById("btnCancelDrawRoad")?.addEventListener("click", () => {
      cancelDrawingRoad();
    });
    document.getElementById("btnUploadRoadFile")?.addEventListener("click", () => {
      document.getElementById("inputCustomRoadFile")?.click();
    });
    document.getElementById("inputCustomRoadFile")?.addEventListener("change", async arg1 => {
      const v_2_1 = arg1.target.files?.[0];
      if (!v_2_1) {
        return;
      }
      try {
        const v_1_1 = await state.flightEngine.parseRoadFile(v_2_1);
        renderRoadNetworkOnMap(state.flightEngine.roadWays);
        showToast(t("flight.toastExternalRoadsLoaded", { count: v_1_1.length }), "success");
        if (state.flightEngine.gcpPoints && state.flightEngine.gcpPoints.length > 0) {
          state.flightEngine.gcpPoints.forEach(item => state.flightEngine.recalculatePointRoadDistance(item, 600));
          renderGcpMarkersOnMap(state.flightEngine.gcpPoints);
          renderGcpTable(state.flightEngine.gcpPoints);
        }
      } catch (v_1_1) {
        showToast(t("flight.toastExternalRoadsError", { err: v_1_1.message }), "error");
      }
      arg1.target.value = "";
    });
    document.getElementById("btnFlightFitBounds")?.addEventListener("click", () => {
      const v_1_1 = state.flightEngine.simplifiedPolygon || state.flightEngine.originalPolygon;
      if (v_1_1 && v_1_1.length > 0) {
        const v_1_2 = v_1_1.map(item => [item.lat, item.lon]);
        state.flightMap.fitBounds(L.latLngBounds(v_1_2), {
          padding: [40, 40]
        });
      } else {
        showToast(t("flight.toastNoBoundaryInMap"), "info");
      }
    });
    document.getElementById("btnFetchRoadsNow")?.addEventListener("click", async () => {
      const v_1_1 = state.flightEngine.simplifiedPolygon || state.flightEngine.originalPolygon;
      if (!v_1_1 || v_1_1.length === 0) {
        showToast(t("flight.toastNeedKmlFirst"), "info");
        return;
      }
      const btnEl_3 = document.getElementById("btnFetchRoadsNow");
      const btnEl_4 = document.getElementById("txtRoadBtn");
      if (btnEl_4) {
        btnEl_4.textContent = t("flight.btnDownloading");
      }
      if (btnEl_3) {
        btnEl_3.disabled = true;
      }
      logMessage(t("flight.logRoadDownloading"));
      try {
        const v_1_2 = await state.flightEngine.fetchRoadNetwork();
        renderRoadNetworkOnMap(v_1_2);
        showToast(t("flight.toastRoadsLoaded", { count: v_1_2.length }), "success");
        logMessage(t("flight.logRoadLoaded", { count: v_1_2.length }));
        if (state.flightEngine.gcpPoints && state.flightEngine.gcpPoints.length > 0) {
          await generateFlightGCPs();
        }
      } catch (v_1_2) {
        console.error("Road download error:", v_1_2);
        showToast(t("flight.toastRoadsError", { err: v_1_2.message }), "error");
      } finally {
        if (btnEl_3) {
          btnEl_3.disabled = false;
        }
      }
    });
    document.getElementById("btnToggleRoadNetwork")?.addEventListener("click", arg1 => {
      const v_2_1 = arg1.currentTarget;
      if (state.flightMap.hasLayer(state.flightRoadLayer)) {
        state.flightMap.removeLayer(state.flightRoadLayer);
        v_2_1.classList.remove("active");
        v_2_1.classList.add("inactive");
      } else {
        state.flightMap.addLayer(state.flightRoadLayer);
        v_2_1.classList.add("active");
        v_2_1.classList.remove("inactive");
      }
    });
    document.getElementById("btnToggleGcpPins")?.addEventListener("click", arg1 => {
      const v_2_1 = arg1.currentTarget;
      if (state.flightMap.hasLayer(state.flightGcpLayer)) {
        state.flightMap.removeLayer(state.flightGcpLayer);
        v_2_1.classList.remove("active");
        v_2_1.classList.add("inactive");
      } else {
        state.flightMap.addLayer(state.flightGcpLayer);
        v_2_1.classList.add("active");
        v_2_1.classList.remove("inactive");
      }
    });
    document.getElementById("btnToggleTriangles")?.addEventListener("click", arg1 => {
      const v_2_1 = arg1.currentTarget;
      if (state.flightMap.hasLayer(state.flightTriangulationLayer)) {
        state.flightMap.removeLayer(state.flightTriangulationLayer);
        v_2_1.classList.remove("active");
        v_2_1.classList.add("inactive");
      } else {
        state.flightMap.addLayer(state.flightTriangulationLayer);
        v_2_1.classList.add("active");
        v_2_1.classList.remove("inactive");
      }
    });
    const btnEl = document.getElementById("btnToggleFlightLines");
    const btnEl_1 = document.getElementById("btnToggleCorridors");
    const btnEl_2 = document.getElementById("btnToggleWaypoints");
    if (btnEl) {
      btnEl.addEventListener("click", () => {
        const v_1_1 = btnEl.classList.toggle("active");
        if (state.flightLinesLayer) {
          if (v_1_1) {
            state.flightMap.addLayer(state.flightLinesLayer);
          } else {
            state.flightMap.removeLayer(state.flightLinesLayer);
          }
        }
        if (state.flightHomeLayer) {
          if (v_1_1) {
            state.flightMap.addLayer(state.flightHomeLayer);
          } else {
            state.flightMap.removeLayer(state.flightHomeLayer);
          }
        }
      });
    }
    if (btnEl_2) {
      btnEl_2.addEventListener("click", () => {
        const v_1_1 = btnEl_2.classList.toggle("active");
        if (state.flightWaypointsLayer) {
          if (v_1_1) {
            state.flightMap.addLayer(state.flightWaypointsLayer);
          } else {
            state.flightMap.removeLayer(state.flightWaypointsLayer);
          }
        }
      });
    }
  } else {
    setTimeout(() => {
      state.flightMap.invalidateSize();
    }, 250);
  }
  const domEl = document.getElementById("flightDatePicker");
  if (domEl && !domEl.value) {
    domEl.value = new Date().toISOString().split("T")[0];
  }
  bindFlightIngestHandlers();
  bindFlightSimplificationHandlers();
  bindSolarAndWeatherHandlers();
  initDroneDatabaseUI();
  bindGcpGenerationHandlers();
  bindFlightExportHandlers();

  if (!state.flightEngine && typeof FlightPlannerEngine !== "undefined") {
    state.flightEngine = new FlightPlannerEngine();
  }
  if (state.flightEngine) {
    const defaultDate = domEl?.value || new Date().toISOString().split("T")[0];
    updateWeatherAndSolar(39.9208, 32.8541, defaultDate);
  }
}
function bindFlightIngestHandlers() {
  const inputEl = document.getElementById("inputFlightFile");
  const btnEl = document.getElementById("btnLoadDemoFlightKml");
  inputEl?.addEventListener("change", async arg1 => {
    if (!arg1.target.files || arg1.target.files.length === 0) {
      return;
    }
    const v_2 = arg1.target.files[0];
    try {
      logMessage(t("flight.logBoundaryParsing", { name: v_2.name }));
      showToast(t("flight.toastLoadingBoundary", { name: v_2.name }), "info");
      await state.flightEngine.parsePolygonFile(v_2);
      await onFlightPolygonLoaded(v_2.name);
    } catch (v_1) {
      console.error("Flight boundary loading error:", v_1);
      showToast(t("flight.toastBoundaryError", { err: v_1.message }), "error");
      logMessage("⛔ " + v_1.message);
    }
  });
  btnEl?.addEventListener("click", async () => {
    try {
      logMessage(t("flight.logDemoLoading"));
      const v_1 = getSampleFlightKmlString();
      const v_2 = new Blob([v_1], {
        type: "application/vnd.google-earth.kml+xml"
      });
      const v_3 = new File([v_2], "Ornek_Cok_Krikli_Ucus_Sahasi.kml", {
        type: "application/vnd.google-earth.kml+xml"
      });
      await state.flightEngine.parsePolygonFile(v_3);
      await onFlightPolygonLoaded(v_3.name);
      showToast(t("flight.toastSampleLoaded"), "success");
    } catch (v_1) {
      console.error("Sample boundary loading error:", v_1);
      showToast(t("flight.toastSampleError", { err: v_1.message }), "error");
    }
  });
}
async function onFlightPolygonLoaded(arg1) {
  const v_2 = state.flightEngine.originalStats;
  const v_3 = state.flightEngine.simplifiedStats;
  const domEl = document.getElementById("kpiVertexRatio");
  const domEl_1 = document.getElementById("kpiAreaDiff");
  const domEl_2 = document.getElementById("kpiAreaDisplay");
  const domEl_3 = document.getElementById("badgeFlightSimplification");
  const statVertices = document.getElementById("statFlightVertices");
  const statPerimeter = document.getElementById("statFlightPerimeter");
  const statArea = document.getElementById("statFlightArea");
  const statGain = document.getElementById("statFlightGain");
  if (v_2 && v_3) {
    if (domEl) {
      domEl.textContent = v_2.uniqueVertexCount + " ➔ " + v_3.uniqueVertexCount + " " + t("flight.unitVertex");
    }
    if (domEl_1) {
      domEl_1.textContent = "(+%" + v_3.areaDiffPct.toFixed(1) + ")";
    }
    if (domEl_2) {
      domEl_2.textContent = t("flight.lblAreaPerimeter", { area: v_3.areaHa.toFixed(2), km2: v_3.areaKm2.toFixed(3), perimeter: Math.round(v_3.perimeterM) });
    }
    if (statVertices) {
      statVertices.textContent = v_2.uniqueVertexCount + " ➔ " + v_3.uniqueVertexCount + " " + t("flight.unitVertex");
    }
    if (statPerimeter) {
      statPerimeter.textContent = Math.round(v_3.perimeterM) + " m";
    }
    if (statArea) {
      statArea.textContent = v_3.areaHa.toFixed(2) + " ha";
    }
    const gPct = Math.round((1 - v_3.uniqueVertexCount / v_2.uniqueVertexCount) * 100);
    if (statGain) {
      statGain.textContent = "%" + gPct + " " + t("flight.initialSaving", "Tasarruf");
    }
    if (domEl_3) {
      domEl_3.textContent = t("flight.lblVertexSummary", { count: v_3.uniqueVertexCount, pct: gPct });
    }
  }
  renderFlightPolygonsOnMap();
  const v_4 = state.flightEngine.simplifiedPolygon || state.flightEngine.originalPolygon;
  if (v_4 && v_4.length > 0) {
    state.flightMap.fitBounds(L.latLngBounds(v_4.map(item => [item.lat, item.lon || item.lng])), {
      padding: [40, 40]
    });
  }
  const inputEl = document.getElementById("inputFlightHeading");
  const domEl_4 = document.getElementById("sliderFlightHeading");
  if (state.flightEngine) {
    const v_1 = state.flightEngine.findOptimalLongAxisHeading();
    if (inputEl && !inputEl.dataset.customized) {
      inputEl.value = v_1;
      if (domEl_4) {
        domEl_4.value = v_1;
      }
    }
  }
  recalculatePhotogrammetry();
  try {
    logMessage(t("flight.logRoadNetworkFetching"));
    const v_1 = await state.flightEngine.fetchRoadNetwork();
    renderRoadNetworkOnMap(v_1);
    logMessage(t("flight.logRoadNetworkLoaded", { count: v_1.length }));
    recalculatePhotogrammetry();
  } catch (v_1) {
    console.warn("Road network fetch error:", v_1);
  }
  try {
    const v_1 = document.getElementById("flightDatePicker")?.value || new Date().toISOString().split("T")[0];
    const v_2_1 = v_2 ? v_2.centroid.lat : v_4[0].lat;
    const v_3_1 = v_2 ? v_2.centroid.lon : v_4[0].lon;
    await updateWeatherAndSolar(v_2_1, v_3_1, v_1);
  } catch (v_1) {
    console.warn("Weather fetch error:", v_1);
  }
  try {
    await generateFlightGCPs();
  } catch (v_1) {
    console.warn("GCP generation error:", v_1);
  }
  logMessage(t("flight.logPlanningReady", { name: arg1 }));
}
function renderFlightPolygonsOnMap() {
  if (!state.flightMap) {
    return;
  }
  state.flightOriginalLayer.clearLayers();
  state.flightSimplifiedLayer.clearLayers();
  const v_1 = state.flightEngine.originalPolygon;
  const v_2 = state.flightEngine.simplifiedPolygon;
  if (v_1 && v_1.length > 0) {
    const v_1_1 = v_1.map(item => [item.lat, item.lon || item.lng]);
    const v_2_1 = L.polygon(v_1_1, {
      color: "#ef4444",
      weight: 2,
      dashArray: "5, 5",
      fillColor: "#ef4444",
      fillOpacity: 0.08
    }).bindTooltip(t("flight.tooltipOriginalBoundary"), {
      sticky: true
    });
    state.flightOriginalLayer.addLayer(v_2_1);
  }
  if (v_2 && v_2.length > 0) {
    const v_1_1 = v_2.map(item => [item.lat, item.lon || item.lng]);
    const v_2_1 = L.polygon(v_1_1, {
      color: "#00f2ff",
      weight: 3.2,
      fillColor: "#00f2ff",
      fillOpacity: 0.15
    }).bindTooltip(t("flight.tooltipOptimizedBoundary"), {
      sticky: true
    });
    state.flightSimplifiedLayer.addLayer(v_2_1);
  }
}
function bindFlightSimplificationHandlers() {
  const domEl = document.getElementById("sliderSimplification");
  const domEl_1 = document.getElementById("txtSimplificationLevel");
  const btnEl = document.getElementById("btnToggleOriginalLayer");
  const btnEl_1 = document.getElementById("btnToggleSimplifiedLayer");
  domEl?.addEventListener("input", arg1 => {
    const v_2 = parseInt(arg1.target.value, 10);
    const v_3 = v_2 / 100;
    let v_4 = t("flight.balanced", "Dengeli") + " (%" + v_2 + ")";
    if (v_2 === 0) {
      v_4 = t("flight.simplifyRaw");
    } else if (v_2 <= 25) {
      v_4 = t("flight.simplifyLight", { pct: v_2 });
    } else if (v_2 >= 90) {
      v_4 = t("flight.simplifyBounding", { pct: v_2 });
    }
    if (domEl_1) {
      domEl_1.textContent = v_4;
    }
    if (state.flightEngine && state.flightEngine.originalPolygon) {
      state.flightEngine.simplify(v_3);
      const v_1 = state.flightEngine.originalStats;
      const v_2_1 = state.flightEngine.simplifiedStats;
      const domEl_2 = document.getElementById("kpiVertexRatio");
      const domEl_3 = document.getElementById("kpiAreaDiff");
      const domEl_4 = document.getElementById("kpiAreaDisplay");
      const domEl_5 = document.getElementById("badgeFlightSimplification");
      if (domEl_2 && v_1 && v_2_1) {
        domEl_2.textContent = v_1.uniqueVertexCount + " ➔ " + v_2_1.uniqueVertexCount + " " + t("flight.unitVertex");
      }
      if (domEl_3 && v_2_1) {
        domEl_3.textContent = "(+%" + v_2_1.areaDiffPct.toFixed(1) + ")";
      }
      if (domEl_4 && v_2_1) {
        domEl_4.textContent = t("flight.lblAreaPerimeter", { area: v_2_1.areaHa.toFixed(2), km2: v_2_1.areaKm2.toFixed(3), perimeter: Math.round(v_2_1.perimeterM) });
      }
      if (domEl_5 && v_1 && v_2_1) {
        const v_1_1 = Math.round((1 - v_2_1.uniqueVertexCount / Math.max(1, v_1.uniqueVertexCount)) * 100);
        domEl_5.textContent = v_2_1.uniqueVertexCount + " " + t("flight.unitVertex") + " (%-" + v_1_1 + ")";
      }
      renderFlightPolygonsOnMap();
      recalculatePhotogrammetry();
    }
  });
  btnEl?.addEventListener("click", () => {
    if (state.flightMap.hasLayer(state.flightOriginalLayer)) {
      state.flightMap.removeLayer(state.flightOriginalLayer);
      btnEl.classList.remove("btn-primary");
      btnEl.classList.add("btn-secondary");
    } else {
      state.flightMap.addLayer(state.flightOriginalLayer);
      btnEl.classList.remove("btn-secondary");
      btnEl.classList.add("btn-primary");
    }
  });
  btnEl_1?.addEventListener("click", () => {
    if (state.flightMap.hasLayer(state.flightSimplifiedLayer)) {
      state.flightMap.removeLayer(state.flightSimplifiedLayer);
      btnEl_1.classList.remove("btn-primary");
      btnEl_1.classList.add("btn-secondary");
    } else {
      state.flightMap.addLayer(state.flightSimplifiedLayer);
      btnEl_1.classList.remove("btn-secondary");
      btnEl_1.classList.add("btn-primary");
    }
  });
}
function getCardinalDirectionTr(arg1) {
  const items = t("flight.cardinalDirections") || ["K (Kuzey)", "KKD", "KD (Kuzeydoğu)", "DKD", "D (Doğu)", "DGD", "GD (Güneydoğu)", "GGD", "G (Güney)", "GGB", "GB (Güneybatı)", "BGB", "B (Batı)", "BKB", "KB (Kuzeybatı)", "KKB"];
  const v_2 = Math.round((arg1 % 360 + 360) % 360 / 22.5) % 16;
  return items[v_2];
}
function initFlightDatePickerBounds() {
  const v_1 = new Date();
  const v_2 = v_1.toISOString().split("T")[0];
  const v_3 = new Date(v_1.getTime() + 1296000000);
  const v_4 = v_3.toISOString().split("T")[0];
  const domEl = document.getElementById("flightDatePicker");
  if (domEl) {
    domEl.min = v_2;
    domEl.max = v_4;
    if (!domEl.value || domEl.value < v_2 || domEl.value > v_4) {
      domEl.value = v_2;
    }
  }
}
async function updateWeatherAndSolar(arg1, arg2, arg3) {
  if (!state.flightEngine) {
    return;
  }
  const v_4 = state.flightEngine.calculateSolarTrajectory(arg1, arg2, arg3);
  const domEl = document.getElementById("kpiOptimalSolarWindow");
  const domEl_1 = document.getElementById("kpiSolarDetail");
  const domEl_2 = document.getElementById("badgeSolarStatus");
  if (domEl) {
    domEl.textContent = v_4.optimalWindow;
  }
  if (domEl_1) {
    domEl_1.textContent = t("flight.lblMaxElevation", { deg: v_4.maxElevationDeg, shadow: v_4.minShadowMultiplier });
  }
  if (domEl_2) {
    domEl_2.textContent = v_4.hasSufficientSun ? t("flight.lblSunEfficient") : t("flight.lblSunLowAngle");
    domEl_2.className = v_4.hasSufficientSun ? "status-pill badge-emerald" : "status-pill badge-amber";
  }
  if (typeof window !== "undefined" && typeof window.renderSolarTimelineBars === "function") {
    window.renderSolarTimelineBars(v_4.hourlySeries);
  }
  const v_5 = await state.flightEngine.fetchLiveWeather(arg1, arg2, arg3);
  const domEl_3 = document.getElementById("kpiWindSpeed");
  const domEl_4 = document.getElementById("kpiWindKmh");
  const domEl_5 = document.getElementById("kpiWeatherSummary");
  const domEl_6 = document.getElementById("badgeFlightSafety");
  const domEl_7 = document.getElementById("txtOptimalHeadingVal");
  if (domEl_3) {
    domEl_3.textContent = v_5.maxWindMs + " m/s";
  }
  if (domEl_4) {
    domEl_4.textContent = "(" + v_5.maxWindKmh + " km/h)";
  }
  if (domEl_5) {
    domEl_5.textContent = t("flight.lblGustPrecip", { gust: v_5.maxGustMs, precip: v_5.maxPrecipProb });
  }
  if (domEl_6) {
    const badgeKey = v_5.overallSafety === "danger" ? "badgeDanger" : (v_5.overallSafety === "warning" ? "badgeWarning" : "badgeSafe");
    domEl_6.textContent = t("flight." + badgeKey);
    const safetyBadgeClass = v_5.overallSafety === "danger" ? "badge-rose" : (v_5.overallSafety === "warning" ? "badge-amber" : "badge-emerald");
    domEl_6.className = "status-pill " + safetyBadgeClass;
  }
  if (domEl_7) {
    domEl_7.textContent = v_5.optimalFlightHeading || "--";
  }
  const domEl_8 = document.getElementById("hudFlightAtmosphere");
  if (domEl_8) {
    domEl_8.style.display = "block";
  }
  const v_6 = parseInt(document.getElementById("sliderToolbarFlightTime")?.value || "660", 10);
  onFlightTimeSliderChange(v_6);
}
function onFlightTimeSliderChange(arg1) {
  const domEl = document.getElementById("sliderToolbarFlightTime");
  const domEl_1 = document.getElementById("sliderSunTime");
  const domEl_2 = document.getElementById("txtToolbarFlightTime");
  const domEl_3 = document.getElementById("txtSunTimeSim");
  const domEl_4 = document.getElementById("hudLiveTimeBadge");
  const domEl_5 = document.getElementById("badgeLiveSunTime");
  if (domEl && parseInt(domEl.value, 10) !== arg1) {
    domEl.value = arg1;
  }
  if (domEl_1 && parseInt(domEl_1.value, 10) !== arg1) {
    domEl_1.value = arg1;
  }
  const v_2 = Math.floor(arg1 / 60);
  const v_3 = arg1 % 60;
  const v_4 = String(v_2).padStart(2, "0") + ":" + String(v_3).padStart(2, "0");
  if (domEl_2) {
    domEl_2.textContent = v_4;
  }
  if (domEl_3) {
    const timeLabel = v_2 >= 11 && v_2 <= 14 ? t("flight.solarTimeNoon") : v_2 < 11 ? t("flight.solarTimeMorning") : t("flight.solarTimeAfternoon");
    domEl_3.textContent = `${v_4} (${timeLabel})`;
  }
  if (domEl_4) {
    domEl_4.textContent = v_4;
  }
  if (domEl_5) {
    domEl_5.textContent = v_4;
  }
  updateAtmosphereSimulation(arg1);
}
function updateAtmosphereSimulation(arg1) {
  if (!state.flightEngine) {
    return;
  }
  const hourDecimal = arg1 / 60;
  const currentHour = Math.floor(hourDecimal);
  const minuteFract = (arg1 % 60) / 60;

  let sunAzimuth = 145;
  let sunElevation = 45;
  let shadowMultiplier = 0.8;

  if (state.flightEngine.solarData && state.flightEngine.solarData.hourlySeries && state.flightEngine.solarData.hourlySeries.length > 0) {
    const series = state.flightEngine.solarData.hourlySeries;
    const s0 = series.find(item => Math.floor(item.hourDecimal) === currentHour) || series[0];
    const s1 = series.find(item => Math.floor(item.hourDecimal) === currentHour + 1) || s0;
    
    // Smooth angle interpolation for sun azimuth
    const diffAz = ((s1.azimuthDeg - s0.azimuthDeg + 540) % 360) - 180;
    sunAzimuth = Math.round((s0.azimuthDeg + diffAz * minuteFract + 360) % 360);
    sunElevation = Math.round(s0.elevationDeg + (s1.elevationDeg - s0.elevationDeg) * minuteFract);
    const sh0 = s0.shadowMultiplier || 0;
    const sh1 = s1.shadowMultiplier || 0;
    shadowMultiplier = Math.max(0, sh0 + (sh1 - sh0) * minuteFract);
  }

  const dialSun = document.getElementById("dialSunPointer");
  const lblSunAzimuth = document.getElementById("lblWidgetSunAzimuth");
  const lblSunElev = document.getElementById("lblWidgetSunElev");
  const lblShadowMult = document.getElementById("lblWidgetShadowMult");

  if (dialSun) {
    dialSun.style.transform = "rotate(" + sunAzimuth + "deg)";
  }
  if (lblSunAzimuth) {
    const cardDir = getCardinalDirectionTr(sunAzimuth).split(" ")[0];
    lblSunAzimuth.textContent = sunAzimuth + "° (" + cardDir + ")";
  }
  if (lblSunElev) {
    lblSunElev.textContent = sunElevation > 0 ? "(" + sunElevation + "°)" : "(Gece)";
  }
  if (lblShadowMult) {
    lblShadowMult.textContent = sunElevation > 0 ? shadowMultiplier.toFixed(1) + "x Boy" : "Gece";
  }

  let windSpeedMs = 3.5;
  let windSpeedKmh = 12.6;
  let windDir = 45;
  let gustMs = 4.8;

  let cloudPct = 15;
  let precipProb = 0;

  if (state.flightEngine.weatherData && state.flightEngine.weatherData.hours && state.flightEngine.weatherData.hours.length > 0) {
    const hours = state.flightEngine.weatherData.hours;
    const h0 = hours.find(item => item.hour === currentHour) || hours[0];
    const h1 = hours.find(item => item.hour === currentHour + 1) || h0;

    // Linear interpolation between the two hours for minute-level dynamic simulation
    const w0Ms = h0.windSpeedMs !== undefined ? h0.windSpeedMs : h0.windSpeedKmh / 3.6;
    const w1Ms = h1.windSpeedMs !== undefined ? h1.windSpeedMs : h1.windSpeedKmh / 3.6;
    windSpeedMs = w0Ms + (w1Ms - w0Ms) * minuteFract;
    windSpeedKmh = windSpeedMs * 3.6;

    const g0Ms = h0.gustMs !== undefined ? h0.gustMs : w0Ms * 1.35;
    const g1Ms = h1.gustMs !== undefined ? h1.gustMs : w1Ms * 1.35;
    gustMs = g0Ms + (g1Ms - g0Ms) * minuteFract;

    const diffDir = ((h1.windDir - h0.windDir + 540) % 360) - 180;
    windDir = Math.round((h0.windDir + diffDir * minuteFract + 360) % 360);

    const c0 = h0.cloud !== undefined ? h0.cloud : 15;
    const c1 = h1.cloud !== undefined ? h1.cloud : 15;
    cloudPct = Math.round(c0 + (c1 - c0) * minuteFract);

    const p0 = h0.precipProb !== undefined ? h0.precipProb : 0;
    const p1 = h1.precipProb !== undefined ? h1.precipProb : 0;
    precipProb = Math.round(p0 + (p1 - p0) * minuteFract);
  }

  const inputAlt = document.getElementById("inputFlightAltitude");
  const flightAlt = Math.round(state.flightEngine.currentFlightAltitudeM || (inputAlt ? parseFloat(inputAlt.value) : 100) || 100);
  
  // Power law altitude wind gradient: v(h) = v10 * (h/10)^0.14
  const altitudeWindSpeedMs = Math.max(0.5, windSpeedMs * Math.pow(Math.max(10, flightAlt) / 10, 0.14));
  const altitudeWindSpeedKmh = Math.round(altitudeWindSpeedMs * 3.6);

  const dialWind = document.getElementById("dialWindPointer");
  const lblAlt = document.getElementById("lblWidgetFlightAlt");
  const lblWindSpeed = document.getElementById("lblWidgetWindSpeed");
  const lblWindDir = document.getElementById("lblWidgetWindDir");
  const lblWindSafety = document.getElementById("lblWidgetWindSafety");
  const txtSource = document.getElementById("txtWeatherDataSource");

  const lblCloudCover = document.getElementById("lblWidgetCloudCover");
  const lblCloudDesc = document.getElementById("lblWidgetCloudDesc");
  const lblLightCond = document.getElementById("lblWidgetLightCondition");
  const iconCloud = document.getElementById("iconWidgetCloud");

  if (dialWind) {
    dialWind.style.transform = "rotate(" + windDir + "deg)";
  }
  if (lblAlt) {
    lblAlt.textContent = flightAlt + "m";
  }
  if (lblWindSpeed) {
    lblWindSpeed.textContent = altitudeWindSpeedMs.toFixed(1) + " m/s (" + altitudeWindSpeedKmh + " km/sa)";
  }
  if (lblWindDir) {
    const cardDir = getCardinalDirectionTr(windDir).split(" ")[0];
    lblWindDir.textContent = windDir + "° (" + cardDir + ")";
  }
  if (lblWindSafety) {
    if (altitudeWindSpeedMs <= 6.5) {
      lblWindSafety.textContent = t("flight.lblWindCalm");
      lblWindSafety.style.color = "var(--emerald-400)";
    } else if (altitudeWindSpeedMs <= 10.5) {
      lblWindSafety.textContent = t("flight.lblWindModerate");
      lblWindSafety.style.color = "var(--amber-400)";
    } else {
      lblWindSafety.textContent = t("flight.lblWindRisky");
      lblWindSafety.style.color = "#ef4444";
    }
  }

  // Cloud and Lighting Quality Updates
  if (lblCloudCover) {
    lblCloudCover.textContent = "%" + cloudPct;
  }
  if (lblCloudDesc) {
    if (cloudPct <= 15) lblCloudDesc.textContent = t("flight.lblCloudClear");
    else if (cloudPct <= 45) lblCloudDesc.textContent = t("flight.lblCloudFew");
    else if (cloudPct <= 75) lblCloudDesc.textContent = t("flight.lblCloudScattered");
    else lblCloudDesc.textContent = t("flight.lblCloudOvercast");
  }
  if (iconCloud) {
    if (precipProb > 40) {
      iconCloud.className = "fa-solid fa-cloud-showers-heavy text-rose";
    } else if (cloudPct <= 20) {
      iconCloud.className = "fa-solid fa-sun text-amber";
    } else if (cloudPct <= 50) {
      iconCloud.className = "fa-solid fa-cloud-sun text-sky";
    } else if (cloudPct <= 80) {
      iconCloud.className = "fa-solid fa-cloud-sun text-dim";
    } else {
      iconCloud.className = "fa-solid fa-cloud text-dim";
    }
  }
  if (lblLightCond) {
    if (precipProb > 40) {
      lblLightCond.textContent = t("flight.lblLightPrecipRisk");
      lblLightCond.style.color = "#ef4444";
    } else if (cloudPct <= 25) {
      lblLightCond.textContent = t("flight.lblLightSunny");
      lblLightCond.style.color = "var(--emerald-400)";
    } else if (cloudPct <= 60) {
      lblLightCond.textContent = t("flight.lblLightBalanced");
      lblLightCond.style.color = "var(--emerald-400)";
    } else if (cloudPct <= 85) {
      lblLightCond.textContent = t("flight.lblLightVariable");
      lblLightCond.style.color = "var(--amber-400)";
    } else {
      lblLightCond.textContent = t("flight.lblLightDiffuse");
      lblLightCond.style.color = "var(--text-dim)";
    }
  }

  if (txtSource && state.flightEngine.weatherData) {
    txtSource.textContent = state.flightEngine.weatherData.isLive ? t("flight.srcLiveEcmwf") : t("flight.srcSimulation");
  }

  // Real-time cross-wind optimal heading
  const domHeadingVal = document.getElementById("txtOptimalHeadingVal");
  if (domHeadingVal) {
    const cross1 = (windDir + 90) % 360;
    const cross2 = (windDir + 270) % 360;
    domHeadingVal.textContent = t("flight.headingCrosswindVal", { h1: cross1, h2: cross2 });
  }

  const domEl_9 = document.getElementById("txtSimSunElev");
  const domEl_10 = document.getElementById("txtSimShadowMult");
  if (domEl_9) {
    domEl_9.textContent = sunElevation + "°";
  }
  if (domEl_10) {
    domEl_10.textContent = sunElevation > 0 ? shadowMultiplier.toFixed(1) + "x" : "Gece";
  }
}
function bindSolarAndWeatherHandlers() {
  initFlightDatePickerBounds();
  const domEl = document.getElementById("sliderToolbarFlightTime");
  const domEl_1 = document.getElementById("sliderSunTime");
  const domEl_2 = document.getElementById("flightDatePicker");
  domEl?.addEventListener("input", arg1 => {
    onFlightTimeSliderChange(parseInt(arg1.target.value, 10));
  });
  domEl_1?.addEventListener("input", arg1 => {
    onFlightTimeSliderChange(parseInt(arg1.target.value, 10));
  });
  domEl_2?.addEventListener("change", async arg1 => {
    const v_2 = arg1.target.value;
    const v_3 = state.flightEngine.simplifiedStats || state.flightEngine.originalStats;
    const lat = v_3 ? v_3.centroid.lat : 39.9208;
    const lon = v_3 ? v_3.centroid.lon : 32.8541;
    showToast(t("flight.toastWeatherFetching", { date: v_2 }), "info");
    await updateWeatherAndSolar(lat, lon, v_2);
    showToast(t("flight.toastWeatherLoaded", { date: v_2 }), "success");
  });
}
function initDroneDatabaseUI() {
  if (!window.DroneDatabase) {
    return;
  }
  window.refreshDroneDatabaseUI = initDroneDatabaseUI;
  const domEl = document.getElementById("selectDroneModel");
  const domEl_1 = document.getElementById("selectDroneCamera");
  const domEl_2 = document.getElementById("badgeDroneType");
  const domEl_3 = document.getElementById("badgeSensorType");
  const inputEl = document.getElementById("inputFlightSpeed");
  const inputEl_1 = document.getElementById("inputSafeBatteryDuration");
  const domEl_4 = document.getElementById("lblDroneSpeedLimitBadge");
  const domEl_5 = document.getElementById("sliderFlightHeading");
  const inputEl_2 = document.getElementById("inputFlightHeading");
  if (!domEl || !domEl_1) {
    return;
  }
  const v_1 = domEl.value;
  const v_2 = window.DroneDatabase.getDrones();
  domEl.innerHTML = "";
  const v_3 = v_2.filter(item => item.brand === "DJI");
  const v_4 = v_2.filter(item => item.brand === "Quantum Systems" || item.brand === "Wingtra");
  const v_5 = v_2.filter(item => item.brand !== "DJI" && item.brand !== "Quantum Systems" && item.brand !== "Wingtra");
  const v_6 = (arg1, arg2) => {
    if (arg2.length === 0) {
      return;
    }
    const optgroupEl = document.createElement("optgroup");
    optgroupEl.label = arg1;
    arg2.forEach(item => {
      const optionEl = document.createElement("option");
      optionEl.value = item.id;
      optionEl.textContent = item.model;
      optgroupEl.appendChild(optionEl);
    });
    domEl.appendChild(optgroupEl);
  };
  v_6(t("flight.categoryDji", "DJI Enterprise & RTK Serisi"), v_3);
  v_6(t("flight.categoryVtol"), v_4);
  v_6(t("flight.categoryOther"), v_5);
  if (v_1 && v_2.some(item => item.id === v_1)) {
    domEl.value = v_1;
  } else {
    domEl.value = "dji_m3e";
  }
  function v_7(arg1) {
    if (!domEl_4 || !arg1) {
      return;
    }
    const v_2_1 = parseFloat(inputEl?.value || arg1.defaultSpeedMs);
    const v_3_1 = arg1.maxSpeedMs || 15;
    const v_4_1 = arg1.maxSpeedKmh || (v_3_1 * 3.6).toFixed(1);
    const v_5_1 = arg1.defaultSpeedMs || 12;
    const v_6_1 = arg1.windResistanceMs || 12;
    const v_7_1 = state.flightEngine ? state.flightEngine.flightParams : null;
    const v_8_1 = v_7_1 ? v_7_1.isTriggerSpeedSafe !== false : true;
    if (v_2_1 > v_3_1) {
      domEl_4.innerHTML = `
        <div class="flight-telemetry-chip" style="grid-column: 1 / -1; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.12);">
          <span style="color: #f87171;">⚠️ ${t("flight.warnWarning", "UYARI")}</span>
          <strong style="color: #ef4444;">${t("flight.warnOtonomSpeedLimit", { ms: v_3_1, kmh: v_4_1 })}</strong>
        </div>`;
    } else if (!v_8_1) {
      domEl_4.innerHTML = `
        <div class="flight-telemetry-chip" style="grid-column: 1 / -1; border-color: rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.12);">
          <span style="color: #fbbf24;">${t("flight.warnCaution")}</span>
          <strong style="color: #f59e0b;">${t("flight.warnShutterLag", { speed: v_2_1 })}</strong>
        </div>`;
    } else {
      domEl_4.innerHTML = `
        <div class="flight-telemetry-chip">
          <span>${t("flight.lblOtonomMax", "Otonom Maks")}</span>
          <strong class="text-cyan">${v_3_1} m/s</strong>
        </div>
        <div class="flight-telemetry-chip">
          <span>${t("flight.lblRecommendedSpeed")}</span>
          <strong class="text-emerald">${v_5_1} m/s</strong>
        </div>
        <div class="flight-telemetry-chip">
          <span>${t("flight.lblWindResistance")}</span>
          <strong class="text-amber">${v_6_1} m/s</strong>
        </div>`;
    }
  }
  function v_8(arg1 = null) {
    const v_2_1 = domEl.value;
    const v_3_1 = window.DroneDatabase.getDrone(v_2_1);
    if (domEl_2 && v_3_1) {
      domEl_2.textContent = v_3_1.type || t("flight.defaultUavType");
    }
    if (v_3_1) {
      if (inputEl) {
        inputEl.max = v_3_1.maxSpeedMs || 15;
        inputEl.min = v_3_1.minSpeedMs || 1;
        if (!inputEl.dataset.customized) {
          inputEl.value = v_3_1.defaultSpeedMs || 12;
        }
      }
      if (inputEl_1 && !inputEl_1.dataset.customized) {
        inputEl_1.value = v_3_1.safeFlightTimeMin || 32;
      }
      v_7(v_3_1);
    }
    const v_4_1 = window.DroneDatabase.getCamerasForDrone(v_2_1);
    domEl_1.innerHTML = "";
    v_4_1.forEach(item => {
      const optionEl = document.createElement("option");
      optionEl.value = item.id;
      optionEl.textContent = "" + item.name;
      domEl_1.appendChild(optionEl);
    });
    if (arg1 && v_4_1.some(item => item.id === arg1)) {
      domEl_1.value = arg1;
    } else if (v_4_1.length > 0) {
      domEl_1.value = v_4_1[0].id;
    }
    v_9();
    v_10();
    recalculatePhotogrammetry();
  }
  function v_9() {
    const v_1_1 = domEl_1.value;
    const v_2_1 = window.DroneDatabase.getCamera(v_1_1);
    const inputEl_5 = document.getElementById("inputFlightAltitude");
    const inputEl_6 = document.getElementById("inputTargetGsd");
    if (!v_2_1 || !inputEl_5 || !inputEl_6) {
      return;
    }
    const v_3_1 = v_2_1.sensorW || v_2_1.sensorWidthMm || 17.3;
    const v_4_1 = v_2_1.imageW || v_2_1.imageWidthPx || 5280;
    const v_5_1 = v_2_1.pixelSizeUm || v_3_1 / v_4_1 * 1000 || 3.3;
    const v_6_1 = v_2_1.focalMm || v_2_1.focalLengthMm || 12.3;
    if (inputEl_5.value && parseFloat(inputEl_5.value) > 0) {
      const v_1_2 = parseFloat(inputEl_5.value);
      const v_2_2 = v_1_2 * (v_5_1 / 1000) / v_6_1 * 100;
      inputEl_6.value = v_2_2.toFixed(2);
    } else if (inputEl_6.value && parseFloat(inputEl_6.value) > 0) {
      const v_1_2 = parseFloat(inputEl_6.value);
      const v_2_2 = v_1_2 / 100 * v_6_1 / (v_5_1 / 1000);
      inputEl_5.value = v_2_2.toFixed(1);
    }
  }
  function v_10() {
    const v_1_1 = domEl_1.value;
    const v_2_1 = window.DroneDatabase.getCamera(v_1_1);
    if (domEl_3 && v_2_1) {
      domEl_3.textContent = v_2_1.megapixels + "MP (" + (v_2_1.focalLengthMm || v_2_1.focalMm) + "mm)";
    }
  }
  domEl.addEventListener("change", () => {
    if (inputEl) {
      delete inputEl.dataset.customized;
    }
    if (inputEl_1) {
      delete inputEl_1.dataset.customized;
    }
    v_8();
  });
  domEl_1.addEventListener("change", () => {
    v_9();
    v_10();
    recalculatePhotogrammetry();
  });
  inputEl?.addEventListener("input", () => {
    inputEl.dataset.customized = "true";
    const v_1_1 = window.DroneDatabase.getDrone(domEl.value);
    if (v_1_1) {
      v_7(v_1_1);
    }
    recalculatePhotogrammetry();
  });
  inputEl_1?.addEventListener("input", () => {
    inputEl_1.dataset.customized = "true";
    recalculatePhotogrammetry();
  });
  const inputEl_3 = document.getElementById("inputFlightAltitude");
  const inputEl_4 = document.getElementById("inputTargetGsd");
  let v_11 = null;
  const v_12 = (arg1 = 100) => {
    clearTimeout(v_11);
    v_11 = setTimeout(() => {
      recalculatePhotogrammetry();
    }, arg1);
  };
  inputEl_3?.addEventListener("input", () => {
    inputEl_3.dataset.customized = "true";
    delete inputEl_4?.dataset.customized;
    const v_1_1 = domEl_1.value;
    const v_2_1 = window.DroneDatabase ? window.DroneDatabase.getCamera(v_1_1) : null;
    const v_3_1 = parseFloat(inputEl_3.value);
    if (v_2_1 && inputEl_4 && !isNaN(v_3_1) && v_3_1 > 0) {
      const v_1_2 = v_2_1.sensorW || v_2_1.sensorWidthMm || 17.3;
      const v_2_2 = v_2_1.imageW || v_2_1.imageWidthPx || 5280;
      const v_3_2 = v_2_1.pixelSizeUm || v_1_2 / v_2_2 * 1000 || 3.3;
      const v_4_1 = v_2_1.focalMm || v_2_1.focalLengthMm || 12.3;
      const v_5_1 = v_3_1 * (v_3_2 / 1000) / v_4_1 * 100;
      inputEl_4.value = v_5_1.toFixed(2);
    }
    v_12();
  });
  inputEl_4?.addEventListener("input", () => {
    inputEl_4.dataset.customized = "true";
    delete inputEl_3?.dataset.customized;
    const v_1_1 = domEl_1.value;
    const v_2_1 = window.DroneDatabase ? window.DroneDatabase.getCamera(v_1_1) : null;
    const v_3_1 = parseFloat(inputEl_4.value);
    if (v_2_1 && inputEl_3 && !isNaN(v_3_1) && v_3_1 > 0) {
      const v_1_2 = v_2_1.sensorW || v_2_1.sensorWidthMm || 17.3;
      const v_2_2 = v_2_1.imageW || v_2_1.imageWidthPx || 5280;
      const v_3_2 = v_2_1.pixelSizeUm || v_1_2 / v_2_2 * 1000 || 3.3;
      const v_4_1 = v_2_1.focalMm || v_2_1.focalLengthMm || 12.3;
      const v_5_1 = v_3_1 / 100 * v_4_1 / (v_3_2 / 1000);
      inputEl_3.value = v_5_1.toFixed(1);
    }
    v_12();
  });
  ["inputForwardOverlap", "inputSideOverlap", "inputFlightSpeed", "inputSafeBatteryDuration"].forEach(item => {
    document.getElementById(item)?.addEventListener("input", () => {
      v_12(100);
    });
  });
  if (domEl_5 && inputEl_2) {
    domEl_5.addEventListener("input", () => {
      inputEl_2.value = domEl_5.value;
      inputEl_2.dataset.customized = "true";
      recalculatePhotogrammetry();
    });
    inputEl_2.addEventListener("input", () => {
      domEl_5.value = inputEl_2.value;
      inputEl_2.dataset.customized = "true";
      recalculatePhotogrammetry();
    });
  }
  document.getElementById("btnAutoOptimalHeading")?.addEventListener("click", () => {
    if (!state.flightEngine) {
      return;
    }
    const v_1_1 = state.flightEngine.findOptimalLongAxisHeading();
    if (domEl_5) {
      domEl_5.value = v_1_1;
    }
    if (inputEl_2) {
      inputEl_2.value = v_1_1;
      inputEl_2.dataset.customized = "true";
    }
    recalculatePhotogrammetry();
    showToast(t("flight.toastHeadingOptimal", { heading: v_1_1 }), "info");
  });
  document.getElementById("btnWindAlignHeading")?.addEventListener("click", () => {
    if (!state.flightEngine) {
      return;
    }
    const curTime = parseInt(document.getElementById("sliderToolbarFlightTime")?.value || "660", 10);
    const curHour = Math.floor(curTime / 60);
    const minuteFract = (curTime % 60) / 60;
    let windDir = 45;
    if (state.flightEngine.weatherData && state.flightEngine.weatherData.hours && state.flightEngine.weatherData.hours.length > 0) {
      const hours = state.flightEngine.weatherData.hours;
      const h0 = hours.find(item => item.hour === curHour) || hours[0];
      const h1 = hours.find(item => item.hour === curHour + 1) || h0;
      const diffDir = ((h1.windDir - h0.windDir + 540) % 360) - 180;
      windDir = Math.round((h0.windDir + diffDir * minuteFract + 360) % 360);
    }
    const crossWindHeading = (windDir + 90) % 360;
    if (domEl_5) {
      domEl_5.value = crossWindHeading;
    }
    if (inputEl_2) {
      inputEl_2.value = crossWindHeading;
      inputEl_2.dataset.customized = "true";
    }
    recalculatePhotogrammetry();
    showToast(t("flight.toastHeadingCrosswind", { windDir: windDir, heading: crossWindHeading }), "info");
  });
  v_8();
}
function recalculatePhotogrammetry() {
  if (!state.flightEngine) {
    if (typeof FlightPlannerEngine !== "undefined") {
      state.flightEngine = new FlightPlannerEngine();
    } else {
      return;
    }
  }
  const v_1 = document.getElementById("selectDroneModel")?.value || "dji_m3e";
  const v_2 = document.getElementById("selectDroneCamera")?.value || "m3e_built_in";
  const inputEl = document.getElementById("inputFlightAltitude");
  const inputEl_1 = document.getElementById("inputTargetGsd");
  const v_3 = inputEl?.dataset.customized === "true";
  const v_4 = parseFloat(inputEl_1?.value) || 2.5;
  const v_5 = parseFloat(inputEl?.value) || 93.2;
  const v_6 = parseFloat(document.getElementById("inputForwardOverlap")?.value) || 80;
  const v_7 = parseFloat(document.getElementById("inputSideOverlap")?.value) || 70;
  const v_8 = parseFloat(document.getElementById("inputFlightSpeed")?.value) || 12;
  const v_9 = parseFloat(document.getElementById("inputSafeBatteryDuration")?.value) || 32;
  const v_10 = parseFloat(document.getElementById("inputFlightHeading")?.value) || 0;
  const domEl = document.getElementById("sliderSimplification");
  const v_11 = domEl ? parseInt(domEl.value, 10) / 100 : 0.5;
  const v_12 = state.flightEngine.generatePhotogrammetryGrid({
    headingDeg: v_10,
    droneKey: v_1,
    cameraKey: v_2,
    targetGsdCm: v_3 ? null : v_4,
    flightAltitudeM: v_3 ? v_5 : null,
    forwardOverlapPct: v_6,
    sideOverlapPct: v_7,
    flightSpeedMs: v_8,
    batteryDurationMin: v_9
  });
  const v_13 = state.flightEngine.flightParams || {};
  state.flightEngine.currentFlightAltitudeM = v_12 ? v_12.flightAltitudeM : v_13.flightAltitudeM || 90;
  if (v_12) {
    if (!v_3 && inputEl && document.activeElement !== inputEl) {
      inputEl.value = v_12.flightAltitudeM;
    } else if (v_3 && inputEl_1 && document.activeElement !== inputEl_1) {
      inputEl_1.value = v_13.targetGsdCm ? v_13.targetGsdCm.toFixed(2) : v_4;
    }
  }
  const domEl_1 = document.getElementById("resCalcAltitude");
  const domEl_2 = document.getElementById("resCalcGridLines");
  const domEl_3 = document.getElementById("resCalcPathLength");
  const domEl_4 = document.getElementById("resCalcPhotos");
  const domEl_5 = document.getElementById("resCalcDuration");
  const domEl_6 = document.getElementById("txtFlightHeadingVal");
  const v_14 = v_12 ? v_12.flightAltitudeM : v_13.flightAltitudeM || v_5;
  const v_15 = v_13.targetGsdCm || v_4;
  const v_16 = v_12 ? v_12.totalLinesCount : v_13.numberOfLines;
  const v_17 = v_12 ? v_12.lineSpacingM : v_13.lineSpacingSideM;
  const v_18 = v_12 ? v_12.groundWidthM : v_13.groundWidthM;
  if (domEl_1) {
    domEl_1.textContent = v_14 + " m AGL (" + Math.round(v_14 * 3.28084) + " ft) | GSD: " + v_15.toFixed(2) + " cm";
  }
  if (domEl_6) {
    domEl_6.textContent = v_10 + "°";
  }
  if (v_12) {
    if (domEl_2) {
      domEl_2.textContent = t("flight.lineCountSummary", { lines: v_12.totalLinesCount, spacing: v_12.lineSpacingM, width: v_12.groundWidthM });
    }
    if (domEl_3) {
      domEl_3.textContent = v_12.totalDistanceKm + " km (" + v_12.totalLinesCount + " Hat)";
    }
    if (domEl_4) {
      const v_1_1 = !v_13.isTriggerSpeedSafe ? t("flight.warnExcessiveSpeed") : "";
      domEl_4.textContent = v_12.totalPhotosCount + " Tetikleme (~" + (v_13.triggerIntervalS || 1.5) + " sn)" + v_1_1;
      domEl_4.style.color = v_13.isTriggerSpeedSafe !== false ? "#fff" : "#ef4444";
    }
    if (domEl_5) {
      domEl_5.textContent = v_12.flightDurationMin + " Dk (" + v_12.batteryPacks + " Batarya Seti)";
      domEl_5.style.color = v_12.batteryPacks === 1 ? "var(--emerald-400)" : v_12.batteryPacks <= 2 ? "var(--amber-400)" : "#ef4444";
    }
    if (typeof renderFlightGridOnMap === "function") {
      renderFlightGridOnMap(v_12);
    }
  } else {
    if (domEl_2) {
      domEl_2.textContent = v_16 ? t("flight.lineEstimateSummary", { lines: v_16, spacing: v_17 }) : t("flight.waitingForBoundary");
    }
    if (domEl_3) {
      domEl_3.textContent = t("flight.badgeBoundaryWaiting");
    }
    if (domEl_4) {
      const v_1_1 = !v_13.isTriggerSpeedSafe ? t("flight.warnExcessiveSpeed") : "";
      domEl_4.textContent = "~" + (v_13.triggerIntervalS || 1.5) + " sn / Tetikleme" + v_1_1;
      domEl_4.style.color = v_13.isTriggerSpeedSafe !== false ? "#fff" : "#ef4444";
    }
    if (domEl_5) {
      domEl_5.textContent = "~" + (v_13.effectiveBatteryMin || 32) + " Dk / Batarya";
      domEl_5.style.color = "var(--emerald-400)";
    }
  }
  try {
    const v_1_1 = parseInt(document.getElementById("sliderToolbarFlightTime")?.value || "660", 10);
    if (typeof updateAtmosphereSimulation === "function") {
      updateAtmosphereSimulation(v_1_1);
    }
  } catch (v_1_1) {}
}
function bindGcpGenerationHandlers() {
  const btnEl = document.getElementById("btnGenerateGCPs");
  btnEl?.addEventListener("click", async () => {
    await generateFlightGCPs();
  });
  const domEl = document.getElementById("filterGcpSearch");
  domEl?.addEventListener("input", arg1 => {
    const v_2 = arg1.target.value.toLowerCase().trim();
    filterGcpTable(v_2);
  });

  const chkSnap = document.getElementById("chkSnapToRoads");
  const inputSnapRadius = document.getElementById("inputSnapMaxRadius");
  const statSnapEl = document.getElementById("statSnapDistance");
  const inputMaxDist = document.getElementById("inputMaxGcpDistance");
  const statTriEl = document.getElementById("statTriangleSpacing");

  const updateGcpStatChips = () => {
    if (chkSnap && inputSnapRadius && statSnapEl) {
      if (!chkSnap.checked) {
        inputSnapRadius.disabled = true;
        inputSnapRadius.style.opacity = "0.45";
        statSnapEl.textContent = t("flight.lblSnapGridOff");
      } else {
        inputSnapRadius.disabled = false;
        inputSnapRadius.style.opacity = "1";
        const val = parseFloat(inputSnapRadius.value) || 300;
        statSnapEl.textContent = t("flight.lblSnapMax", { val: val });
      }
    }
    if (inputMaxDist && statTriEl) {
      const dist = parseFloat(inputMaxDist.value) || 1000;
      statTriEl.textContent = `~${dist} m`;
    }
  };

  chkSnap?.addEventListener("change", updateGcpStatChips);
  inputSnapRadius?.addEventListener("input", updateGcpStatChips);
  inputMaxDist?.addEventListener("input", updateGcpStatChips);
  updateGcpStatChips();
}
async function generateFlightGCPs() {
  if (!state.flightEngine || !state.flightEngine.simplifiedPolygon && !state.flightEngine.originalPolygon) {
    showToast(t("flight.toastNeedKmlFirst"), "warning");
    return;
  }
  const v_1 = parseFloat(document.getElementById("inputMaxGcpDistance")?.value) || 1000;
  const v_2 = parseFloat(document.getElementById("inputInwardOffset")?.value) || 100;
  const v_3 = parseFloat(document.getElementById("selectGcpRatio")?.value) || 0.75;
  const v_4 = document.getElementById("chkSnapToRoads")?.checked ?? true;
  const snapRadius = parseFloat(document.getElementById("inputSnapMaxRadius")?.value) || 300;

  showToast(t("flight.toastGcpGenerating"), "info");
  logMessage(t("flight.logGcpGeneratorStart", { dist: v_1, snap: v_4 ? t("flight.snapOn", { radius: snapRadius }) : t("flight.snapOff") }));
  try {
    const v_1_1 = await state.flightEngine.generateSmartGCPs({
      maxDistanceMeters: v_1,
      inwardOffsetMeters: v_2,
      yknRatio: v_3,
      snapToRoads: v_4,
      snapMaxRadiusM: snapRadius,
      geodesyEngine: state.geodesyEngine,
      tg20Engine: state.tg20Engine
    });
    const v_2_1 = v_1_1.filter(item => item.type === "YKN").length;
    const v_3_1 = v_1_1.filter(item => item.type === "DN").length;
    const v_4_1 = v_1_1.filter(item => item.isRoadSnapped).length;
    const v_5 = v_1_1.length > 0 ? Math.round(v_4_1 / v_1_1.length * 100) : 0;
    const kpiCountEl = document.getElementById("kpiGcpCount");
    const kpiDistEl = document.getElementById("kpiGcpDistance");
    const badgeSnapEl = document.getElementById("badgeGcpRoadSnap");
    if (kpiCountEl) kpiCountEl.textContent = v_2_1 + " YKN + " + v_3_1 + " DN";
    if (kpiDistEl) kpiDistEl.textContent = t("flight.lblMaxRoadSide", { dist: v_1, pct: v_5 });
    if (badgeSnapEl) badgeSnapEl.textContent = v_4 ? t("flight.lblRoadSnap", { pct: v_5 }) : t("flight.lblDirectGrid");
    const targetGcpEl = document.getElementById("statTargetGcpCount");
    const targetChkEl = document.getElementById("statTargetChkCount");
    const triSpacingEl = document.getElementById("statTriangleSpacing");
    const statSnapDistance = document.getElementById("statSnapDistance");
    if (targetGcpEl) targetGcpEl.textContent = v_2_1 + " YKN";
    if (targetChkEl) targetChkEl.textContent = v_3_1 + " DN";
    if (triSpacingEl) triSpacingEl.textContent = "~" + Math.round(v_1) + " m";
    if (statSnapDistance) statSnapDistance.textContent = v_4 ? t("flight.lblSnapMax", { val: snapRadius }) : t("flight.lblSnapOff");
    renderGcpMarkersOnMap(v_1_1);
    renderRoadNetworkOnMap(state.flightEngine.roadWays);
    renderGcpTable(v_1_1);
    showToast(t("flight.toastGcpSuccess", { count: v_1_1.length, ykn: v_2_1, dn: v_3_1 }), "success");
    logMessage(t("flight.logGcpCompleted", { ykn: v_2_1, dn: v_3_1 }));
  } catch (v_1_1) {
    console.error("GCP generation error:", v_1_1);
    showToast(t("flight.toastGcpError", { err: v_1_1.message }), "error");
  }
}
function buildGcpPopupContent(arg1) {
  const v_2 = arg1.type === "YKN";
  const v_3 = arg1.roadDistM !== null ? "<div style=\"margin-top: 4px; color: #0284c7; font-weight: 600;\">\n            <i class=\"fa-solid fa-road\"></i> " + arg1.status + "\n         </div>" : "<div style=\"margin-top: 4px; color: #64748b; font-weight: 600;\">\n            <i class=\"fa-solid fa-mountain\"></i> " + t("flight.openField") + "\n         </div>";
  return "\n        <div style=\"font-family: var(--font-sans); font-size: 12px; line-height: 1.5; color: #0f172a; min-width: 230px;\">\n            <div style=\"font-weight: 800; font-size: 14px; margin-bottom: 4px; color: " + (v_2 ? "#059669" : "#d97706") + ";\">\n                " + arg1.name + " <span style=\"font-size: 11px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;\">" + (arg1.type === "YKN" ? t("flight.pointGcpLabel") : t("flight.pointChkLabel")) + "</span>\n            </div>\n            <hr style=\"margin: 4px 0; border: none; border-top: 1px solid #cbd5e1;\"/>\n            <div><strong>WGS-84 (Enlem/Boylam):</strong></div>\n            <div style=\"font-family: var(--font-mono); font-size: 11px; color: #334155;\">\n                " + arg1.lat.toFixed(7) + "°, " + arg1.lon.toFixed(7) + "°\n            </div>\n            <div style=\"margin-top: 3px;\"><strong>ITRF-96 TM 3° (DOM " + arg1.dom + "°):</strong></div>\n            <div style=\"font-family: var(--font-mono); font-size: 11.5px; font-weight: 700; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; margin: 3px 0; color: #0369a1;\">\n                Y: " + arg1.itrfY.toFixed(3) + "<br/>X: " + arg1.itrfX.toFixed(3) + "\n            </div>\n            " + v_3 + "\n            <div style=\"margin-top: 6px; font-size: 10.5px; color: #64748b; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 3px;\">\n                " + t("flight.dragPointHint") + "\n            </div>\n            <button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-top: 8px; width: 100%; background: #ef4444; color: #ffffff; border: none; padding: 5px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;\" onclick=\"window.deleteGcpPoint(" + arg1.id + ")\">\n                <i class=\"fa-solid fa-trash-can\"></i> " + t("flight.deleteThisPoint") + "\n            </button>\n        </div>\n    ";
}
function highlightTableRow(arg1) {
  const domEl = document.getElementById("tbodyFlightGcpResults");
  if (!domEl) {
    return;
  }
  const domEl_1 = domEl.querySelector("tr[data-point-id=\"" + arg1 + "\"]");
  if (domEl_1) {
    domEl_1.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
    domEl_1.classList.remove("table-row-highlight");
    domEl_1.offsetWidth;
    domEl_1.classList.add("table-row-highlight");
  }
}
window.deleteGcpPoint = function (arg1) {
  if (!state.flightEngine || !state.flightEngine.gcpPoints) {
    return;
  }
  const v_2 = state.flightEngine.gcpPoints.find(item => item.id == arg1 || item.name == arg1);
  if (!v_2) {
    return;
  }
  state.flightEngine.gcpPoints = state.flightEngine.gcpPoints.filter(item => item.id != arg1 && item.name != arg1);
  if (state.flightMap) {
    state.flightMap.closePopup();
  }
  renderGcpMarkersOnMap(state.flightEngine.gcpPoints);
  renderGcpTable(state.flightEngine.gcpPoints);
  const tableEl = document.getElementById("badgeGcpTableCount");
  if (tableEl) {
    tableEl.textContent = state.flightEngine.gcpPoints.length + " Nokta";
  }
  const domEl = document.getElementById("statGcpCount");
  if (domEl) {
    domEl.textContent = state.flightEngine.gcpPoints.length;
  }
  showToast(t("flight.toastGcpRemoved", { name: v_2.name }), "warning");
  logMessage(t("flight.logGcpDeleted", { name: v_2.name, remaining: state.flightEngine.gcpPoints.length }));
};
function renderGcpMarkersOnMap(arg1) {
  if (!state.flightMap || !state.flightGcpLayer) {
    return;
  }
  state.flightGcpLayer.clearLayers();
  if (state.flightTriangulationLayer) {
    state.flightTriangulationLayer.clearLayers();
  }
  if (state.flightTriangulationLayer && arg1.length >= 3) {
    const v_1 = computeDelaunayEdges(arg1);
    v_1.forEach(([item, item_1]) => {
      const v_1_1 = Math.PI / 180;
      const v_2 = (item_1.lat - item.lat) * v_1_1;
      const v_3 = (item_1.lon - item.lon) * v_1_1;
      const v_4 = Math.sin(v_2 / 2) ** 2 + Math.cos(item.lat * v_1_1) * Math.cos(item_1.lat * v_1_1) * Math.sin(v_3 / 2) ** 2;
      const v_5 = Math.round(Math.atan2(Math.sqrt(v_4), Math.sqrt(1 - v_4)) * 12756274);
      const v_6 = L.polyline([[item.lat, item.lon], [item_1.lat, item_1.lon]], {
        color: "#00e5ff",
        weight: 1.6,
        dashArray: "3, 4",
        opacity: 0.35
      }).bindTooltip(t("flight.tooltipTriangleEdge", { p1: item.name, p2: item_1.name, dist: v_5 }), {
        sticky: true
      });
      state.flightTriangulationLayer.addLayer(v_6);
    });
  }
  arg1.forEach(item => {
    const v_1 = item.type === "YKN";
    const v_2 = v_1 ? "gcp-pin-ykn" : "gcp-pin-dn";
    const v_3 = "\n            <div class=\"gcp-map-pin " + v_2 + "\">\n                <span class=\"gcp-pin-num\">" + item.id + "</span>\n                <div class=\"gcp-pin-delete\" title=\"" + t("flight.btnRemoveGcpPoint", { name: item.name }) + "\" onclick=\"event.stopPropagation(); window.deleteGcpPoint(" + item.id + ")\">✕</div>\n            </div>\n        ";
    const v_4 = L.divIcon({
      html: v_3,
      className: "custom-gcp-icon-wrap",
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    let v_5 = null;
    if (item.nearestRoad && item.roadDistM !== null) {
      v_5 = L.polyline([[item.lat, item.lon], [item.nearestRoad.lat, item.nearestRoad.lon]], {
        color: "#f59e0b",
        weight: 2,
        dashArray: "4, 4",
        opacity: 0.8
      });
      if (item.roadDistM >= 20) {
        v_5.bindTooltip("📏 " + item.roadDistM + "m", {
          permanent: true,
          direction: "center",
          className: "road-dist-tooltip"
        });
      } else {
        v_5.bindTooltip("🛣️ " + item.roadDistM + "m (" + (item.nearestRoad.roadInfo?.name || t("flight.roadShort", "Yol")) + ")", {
          sticky: true,
          className: "road-dist-tooltip"
        });
      }
      state.flightGcpLayer.addLayer(v_5);
    }
    const v_6 = L.marker([item.lat, item.lon], {
      icon: v_4,
      draggable: true,
      zIndexOffset: 1000,
      title: t("flight.dragToMovePoint", { name: item.name })
    }).bindPopup(buildGcpPopupContent(item));
    v_6.on("drag", arg1_1 => {
      const v_2_1 = v_6.getLatLng();
      if (state.flightEngine.roadWays && state.flightEngine.roadWays.length > 0) {
        const v_1_1 = state.flightEngine._findNearestRoadPoint(v_2_1.lat, v_2_1.lng, state.flightEngine.roadWays, 600);
        if (v_1_1 && v_1_1.distanceM <= 600) {
          const v_1_2 = Math.round(v_1_1.distanceM);
          if (!v_5) {
            v_5 = L.polyline([[v_2_1.lat, v_2_1.lng], [v_1_1.lat, v_1_1.lon]], {
              color: "#f59e0b",
              weight: 2,
              dashArray: "4, 4",
              opacity: 0.8
            }).addTo(state.flightGcpLayer);
            if (v_1_2 >= 20) {
              v_5.bindTooltip("📏 " + v_1_2 + "m", {
                permanent: true,
                direction: "center",
                className: "road-dist-tooltip"
              });
            }
          } else {
            v_5.setLatLngs([[v_2_1.lat, v_2_1.lng], [v_1_1.lat, v_1_1.lon]]);
            if (v_1_2 >= 20) {
              v_5.setTooltipContent("📏 " + v_1_2 + "m");
            }
          }
        } else if (v_5) {
          state.flightGcpLayer.removeLayer(v_5);
          v_5 = null;
        }
      }
    });
    v_6.on("dragend", arg1_1 => {
      const v_2_1 = v_6.getLatLng();
      item.lat = v_2_1.lat;
      item.lon = v_2_1.lng;
      let v_3_1 = Math.round(item.lon / 3) * 3;
      if (v_3_1 < 27) {
        v_3_1 = 27;
      }
      if (v_3_1 > 45) {
        v_3_1 = 45;
      }
      item.dom = v_3_1;
      if (state.geodesyEngine && typeof state.geodesyEngine.wgs84ToTurefTM === "function") {
        const v_1_1 = state.geodesyEngine.wgs84ToTurefTM(item.lat, item.lon, item.dom);
        item.itrfY = Math.round(v_1_1.Y * 1000) / 1000;
        item.itrfX = Math.round(v_1_1.X * 1000) / 1000;
      } else {
        const v_1_1 = (typeof HaritaGeodesy !== "undefined" && HaritaGeodesy.deg2rad) || (Math.PI / 180);
        const num = (typeof HaritaGeodesy !== "undefined" && HaritaGeodesy.ELLIPSOIDS) ? HaritaGeodesy.ELLIPSOIDS.GRS80.a : 6378137;
        const v_2_2 = Math.cos(item.lat * v_1_1);
        item.itrfY = Math.round((500000 + (item.lon - item.dom) * v_1_1 * num * v_2_2) * 1000) / 1000;
        item.itrfX = Math.round(item.lat * v_1_1 * num * 1000) / 1000;
      }
      state.flightEngine.recalculatePointRoadDistance(item, 600);
      v_6.setPopupContent(buildGcpPopupContent(item));
      renderGcpTable(state.flightEngine.gcpPoints);
      highlightTableRow(item.id);
      if (state.flightTriangulationLayer) {
        renderGcpMarkersOnMap(state.flightEngine.gcpPoints);
      }
      showToast(t("flight.toastGcpMoved", { name: item.name, y: item.itrfY.toFixed(3), x: item.itrfX.toFixed(3) }), "info");
    });
    v_6.on("click", () => {
      highlightTableRow(item.id);
    });
    state.flightGcpLayer.addLayer(v_6);
    setTimeout(() => {
      const v_1_1 = v_6.getElement();
      if (v_1_1) {
        const domEl = v_1_1.querySelector(".gcp-pin-delete");
        if (domEl) {
          L.DomEvent.disableClickPropagation(domEl);
          L.DomEvent.disableScrollPropagation(domEl);
          domEl.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            window.deleteGcpPoint(item.id);
          });
          domEl.addEventListener("mousedown", event => {
            event.stopPropagation();
          });
          domEl.addEventListener("touchstart", event => {
            event.stopPropagation();
            window.deleteGcpPoint(item.id);
          });
        }
      }
    }, 10);
  });
}
function renderRoadNetworkOnMap(arg1) {
  if (!state.flightMap || !state.flightRoadLayer) {
    return;
  }
  state.flightRoadLayer.clearLayers();
  const domEl = document.getElementById("badgeRoadCount");
  const btnEl = document.getElementById("txtRoadBtn");
  if (!arg1 || arg1.length === 0) {
    if (domEl) {
      domEl.textContent = t("flight.lblRoadSegments", { count: 0 });
    }
    if (btnEl) {
      btnEl.textContent = t("flight.btnFetchRoads");
    }
    return;
  }
  if (domEl) {
    domEl.textContent = t("flight.lblRoadSegments", { count: arg1.length });
  }
  if (btnEl) {
    btnEl.textContent = t("flight.lblRoadsActive", { count: arg1.length });
  }
  arg1.forEach(item => {
    const v_1 = item.geometry || (Array.isArray(item) ? item : []);
    if (!v_1 || v_1.length < 2) {
      return;
    }
    const v_2 = v_1.map(item_1 => [item_1.lat, item_1.lon]);
    const v_3 = (item.type || "road").toLowerCase();
    const v_4 = item.name || "";
    let str = "#818cf8";
    let num = 2.5;
    let num_1 = 0.85;
    let v_5 = null;
    let str_1 = "Yerel Yol";
    if (item.isCustom || v_3 === "custom_track") {
      str = "#f59e0b";
      num = 3.5;
      v_5 = "6, 4";
      str_1 = t("flight.roadTypeManual");
    } else if (["motorway", "trunk", "primary"].includes(v_3)) {
      str = "#38bdf8";
      num = 3.5;
      str_1 = t("flight.roadTypePrimary", "Ana Yol (Asfalt)");
    } else if (["secondary", "tertiary"].includes(v_3)) {
      str = "#34d399";
      num = 3;
      str_1 = t("flight.roadTypeVillage");
    } else if (["residential", "unclassified", "living_street"].includes(v_3)) {
      str = "#cbd5e1";
      num = 2.5;
      str_1 = t("flight.roadTypeResidential", "Mahalle Yolu");
    } else if (["track", "service"].includes(v_3)) {
      str = "#c084fc";
      num = 2.2;
      v_5 = "5, 4";
      str_1 = t("flight.roadTypeTrack");
    } else if (["path", "footway"].includes(v_3)) {
      str = "#fbbf24";
      num = 1.8;
      v_5 = "3, 3";
      str_1 = t("flight.roadTypeTrail");
    }
    const v_6 = v_4 ? "🛣️ <strong>" + v_4 + "</strong> (" + str_1 + ")" : "🛣️ " + str_1;
    const v_7 = L.polyline(v_2, {
      color: str,
      weight: num,
      opacity: num_1,
      dashArray: v_5
    }).bindTooltip(v_6, {
      sticky: true
    });
    state.flightRoadLayer.addLayer(v_7);
  });
}
function renderGcpTable(arg1) {
  const domEl = document.getElementById("tbodyFlightGcpResults");
  const tableEl = document.getElementById("badgeGcpTableCount");
  if (!domEl) {
    return;
  }
  if (tableEl) {
    tableEl.textContent = arg1.length + " " + t("flight.unitPoint");
  }
  domEl.innerHTML = "";
  if (arg1.length === 0) {
    domEl.innerHTML = "<tr><td colspan=\"9\" style=\"text-align: center; padding: 24px; color: var(--text-muted);\">"+t("flight.emptyGcpTable")+"</td></tr>";
    return;
  }
  arg1.forEach(item => {
    const trEl = document.createElement("tr");
    trEl.setAttribute("data-point-id", item.id);
    trEl.style.cursor = "pointer";
    const v_1 = item.type === "YKN";
    const v_2 = v_1 ? "<span style=\"background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 10.5px;\">YKN</span>" : "<span style=\"background: rgba(245, 158, 11, 0.15); color: var(--amber-400); padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 10.5px;\">DN</span>";
    let str = "";
    if (item.roadDistM !== null) {
      if (item.roadDistM <= 15) {
        str = "<span style=\"color: var(--emerald-400); font-weight: 600;\"><i class=\"fa-solid fa-road\"></i> " + t("flight.lblRoadside", { dist: item.roadDistM }) + "</span>";
      } else {
        str = "<span style=\"color: var(--cyan-400); font-weight: 600;\"><i class=\"fa-solid fa-person-walking\"></i> " + t("flight.lblToRoad", { dist: item.roadDistM }) + "</span>";
      }
    } else {
      str = "<span style=\"color: var(--text-muted);\"><i class=\"fa-solid fa-mountain\"></i> " + t("flight.lblOpenField") + "</span>";
    }
    trEl.innerHTML = "\n            <td style=\"text-align: center; font-family: var(--font-mono); color: var(--text-muted);\">" + item.id + "</td>\n            <td style=\"text-align: left; font-weight: 700;\" class=\"text-main font-mono\">" + item.name + "</td>\n            <td style=\"text-align: center;\">" + v_2 + "</td>\n            <td style=\"text-align: right; font-family: var(--font-mono);\">" + item.lat.toFixed(7) + "°</td>\n            <td style=\"text-align: right; font-family: var(--font-mono);\">" + item.lon.toFixed(7) + "°</td>\n            <td style=\"text-align: right; font-family: var(--font-mono); font-weight: 600; color: var(--cyan-400);\">" + item.itrfY.toFixed(3) + "</td>\n            <td style=\"text-align: right; font-family: var(--font-mono); font-weight: 600; color: var(--cyan-400);\">" + item.itrfX.toFixed(3) + "</td>\n            <td style=\"text-align: center; font-family: var(--font-mono); color: var(--indigo-400); font-weight: 600;\">" + item.dom + "°</td>\n            <td style=\"text-align: left; font-size: 11px;\">" + str + "</td>\n            <td style=\"text-align: center;\">\n                <button class=\"btn btn-icon btn-danger btn-xs\" style=\"padding: 2px 7px; font-size: 11px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 4px; cursor: pointer;\" onclick=\"event.stopPropagation(); window.deleteGcpPoint(" + item.id + ")\" title=\"" + t("flight.titleDeletePoint", { name: item.name }) + "\">\n                    <i class=\"fa-solid fa-xmark\"></i>\n                </button>\n            </td>\n        ";
    trEl.addEventListener("click", () => {
      if (state.flightMap) {
        state.flightMap.setView([item.lat, item.lon], Math.max(state.flightMap.getZoom(), 17), {
          animate: true
        });
        highlightTableRow(item.id);
      }
    });
    domEl.appendChild(trEl);
  });
}
function filterGcpTable(arg1) {
  const domEl = document.getElementById("tbodyFlightGcpResults");
  if (!domEl) {
    return;
  }
  const elementsList = domEl.querySelectorAll("tr");
  let num = 0;
  elementsList.forEach(item => {
    const v_1 = item.textContent.toLowerCase();
    if (!arg1 || v_1.includes(arg1)) {
      item.style.display = "";
      num++;
    } else {
      item.style.display = "none";
    }
  });
  const tableEl = document.getElementById("badgeGcpTableCount");
  if (tableEl) {
    tableEl.textContent = num + " Nokta";
  }
}
window.toggleExportDropdown = function (arg1) {
  if (arg1) {
    arg1.preventDefault();
    arg1.stopPropagation();
  }
  const domEl = document.getElementById("menuExportDropdown");
  if (!domEl) {
    return;
  }
  const v_2 = domEl.style.display === "flex" || domEl.classList.contains("show");
  if (v_2) {
    domEl.style.display = "none";
    domEl.classList.remove("show");
  } else {
    domEl.style.display = "flex";
    domEl.classList.add("show");
  }
};
window.exportFlightFile = function (arg1) {
  const domEl = document.getElementById("menuExportDropdown");
  if (domEl) {
    domEl.style.display = "none";
    domEl.classList.remove("show");
  }
  if (!state.flightEngine) {
    state.flightEngine = new FlightPlannerEngine();
  }
  if (arg1 === "dji_kml") {
    const v_1 = state.flightEngine.simplifiedPolygon || state.flightEngine.originalPolygon;
    if (!v_1 || v_1.length === 0) {
      showToast(t("flight.toastExportNeedBoundary"), "warning");
      return;
    }
    const v_2 = state.flightEngine.exportFlightKml(true);
    downloadTextFile("GNSS_Studio_Ucus_Plani_Sadelestirilmis.kml", v_2, "application/vnd.google-earth.kml+xml");
    showToast(t("flight.toastExportDjiKml"), "success");
  } else if (arg1 === "netcad_ncn") {
    if (!state.flightEngine.gcpPoints || state.flightEngine.gcpPoints.length === 0) {
      showToast(t("flight.toastExportNeedGcp"), "warning");
      return;
    }
    const v_1 = state.flightEngine.exportGcpNcn();
    downloadTextFile("IHA_YKN_Noktalari.ncn", v_1, "text/plain");
    showToast(t("flight.toastExportNcn"), "success");
  } else if (arg1 === "autocad_dxf") {
    if (!state.flightEngine.gcpPoints || state.flightEngine.gcpPoints.length === 0) {
      showToast(t("flight.toastExportNeedGcp"), "warning");
      return;
    }
    const v_1 = state.flightEngine.exportGcpDxf();
    downloadTextFile("IHA_Ucus_Plani_ve_YKN.dxf", v_1, "application/dxf");
    showToast(t("flight.toastExportDxf"), "success");
  } else if (arg1 === "excel_csv") {
    if (!state.flightEngine.gcpPoints || state.flightEngine.gcpPoints.length === 0) {
      showToast(t("flight.toastExportNeedGcp"), "warning");
      return;
    }
    const v_1 = state.flightEngine.exportGcpCsv();
    downloadTextFile("IHA_YKN_Koordinatlari.csv", v_1, "text/csv");
    showToast(t("flight.toastExportCsv"), "success");
  } else if (arg1 === "google_kml") {
    if (!state.flightEngine.gcpPoints || state.flightEngine.gcpPoints.length === 0) {
      showToast(t("flight.toastExportNeedGcp"), "warning");
      return;
    }
    const v_1 = state.flightEngine.exportGcpKml();
    downloadTextFile("IHA_YKN_Noktalari_3D.kml", v_1, "application/vnd.google-earth.kml+xml");
    showToast(t("flight.toastExportGcpKml"), "success");
  }
};
document.addEventListener("click", event => {
  const btnEl = document.getElementById("btnToggleExportMenu");
  const domEl = document.getElementById("menuExportDropdown");
  if (domEl && btnEl && !btnEl.contains(event.target) && !domEl.contains(event.target)) {
    domEl.style.display = "none";
    domEl.classList.remove("show");
  }
});
function bindFlightExportHandlers() {}
function getSampleFlightKmlString() {
  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n  <Document>\n    <name>Milas_Maden_Saha_Siniri</name>\n    <Placemark>\n      <name>Ucus_Alani_38_Krikli</name>\n      <Polygon>\n        <outerBoundaryIs>\n          <LinearRing>\n            <coordinates>\n              27.7850,37.3100,120 27.7880,37.3120,125 27.7870,37.3145,130 27.7910,37.3160,135\n              27.7900,37.3180,140 27.7940,37.3200,145 27.7925,37.3225,150 27.7960,37.3250,155\n              27.7990,37.3240,150 27.8020,37.3270,160 27.8060,37.3260,158 27.8080,37.3290,165\n              27.8120,37.3280,162 27.8150,37.3305,170 27.8180,37.3275,165 27.8210,37.3290,168\n              27.8250,37.3260,160 27.8220,37.3220,150 27.8260,37.3190,145 27.8230,37.3160,140\n              27.8270,37.3130,135 27.8240,37.3100,130 27.8200,37.3080,125 27.8160,37.3095,128\n              27.8120,37.3060,120 27.8080,37.3075,122 27.8040,37.3040,115 27.8000,37.3060,118\n              27.7960,37.3030,112 27.7920,37.3050,115 27.7880,37.3020,110 27.7850,37.3100,120\n            </coordinates>\n          </LinearRing>\n        </outerBoundaryIs>\n      </Polygon>\n    </Placemark>\n  </Document>\n</kml>";
}
function startDrawingRoad() {
  if (!state.flightMap) {
    showToast(t("flight.toastOpenMapFirst"), "warning");
    return;
  }
  if (state.isDrawingRoad) {
    cancelDrawingRoad();
    return;
  }
  state.isDrawingRoad = true;
  state.activeRoadPoints = [];
  state.activeRoadMarkers = [];
  state.flightMap.getContainer().style.cursor = "crosshair";
  if (state.flightGcpLayer) {
    state.flightGcpLayer.eachLayer(arg1 => {
      if (arg1.getElement) {
        arg1.getElement()?.style.setProperty("pointer-events", "none");
      }
    });
  }
  if (state.flightOriginalLayer) {
    state.flightOriginalLayer.eachLayer(arg1 => {
      if (arg1.getElement) {
        arg1.getElement()?.style.setProperty("pointer-events", "none");
      }
    });
  }
  if (state.flightSimplifiedLayer) {
    state.flightSimplifiedLayer.eachLayer(arg1 => {
      if (arg1.getElement) {
        arg1.getElement()?.style.setProperty("pointer-events", "none");
      }
    });
  }
  const btnEl = document.getElementById("btnDrawCustomRoad");
  const btnEl_1 = document.getElementById("txtDrawRoadBtn");
  const btnEl_2 = document.getElementById("btnPanelDrawRoad");
  const btnEl_3 = document.getElementById("btnFinishDrawRoad");
  const btnEl_4 = document.getElementById("btnCancelDrawRoad");
  if (btnEl_1) {
    btnEl_1.textContent = t("flight.btnDrawingRoad", { count: 0 });
  }
  if (btnEl_3) {
    btnEl_3.style.display = "inline-flex";
    btnEl_3.textContent = "✔️ Tamamla";
  }
  if (btnEl_4) {
    btnEl_4.style.display = "inline-flex";
    btnEl_4.classList.remove("hidden");
  }
  if (btnEl) {
    btnEl.style.borderColor = "#f59e0b";
    btnEl.style.background = "rgba(245, 158, 11, 0.25)";
  }
  if (btnEl_2) {
    btnEl_2.style.borderColor = "#f59e0b";
    btnEl_2.style.background = "rgba(245, 158, 11, 0.25)";
  }
  showToast(t("flight.toastDrawRoadHelp"), "info");
  logMessage(t("flight.logManualRoadDrawingActive"));
}
function finishDrawingRoad() {
  if (!state.isDrawingRoad) {
    return;
  }
  if (state.activeRoadPoints.length >= 2) {
    const v_1 = state.activeRoadPoints.map(item => ({
      lat: item[0],
      lon: item[1]
    }));
    const v_2 = t("flight.customDrawnRoadName", { num: ((state.flightEngine.customDrawnRoads || []).length + 1) });
    const v_3 = state.flightEngine.addCustomRoad(v_1, v_2, "custom_track");
    renderRoadNetworkOnMap(state.flightEngine.roadWays);
    if (state.flightEngine.gcpPoints && state.flightEngine.gcpPoints.length > 0) {
      state.flightEngine.gcpPoints.forEach(item => {
        state.flightEngine.recalculatePointRoadDistance(item, 600);
      });
      renderGcpMarkersOnMap(state.flightEngine.gcpPoints);
      renderGcpTable(state.flightEngine.gcpPoints);
    }
    showToast(t("flight.toastDrawRoadSuccess", { count: v_1.length }), "success");
    logMessage(t("flight.logManualRoadSaved", { count: v_1.length }));
  } else {
    showToast(t("flight.toastDrawRoadMinPoints"), "warning");
  }
  cancelDrawingRoad();
}
function cancelDrawingRoad() {
  state.isDrawingRoad = false;
  state.activeRoadPoints = [];
  if (state.flightMap) {
    state.flightMap.getContainer().style.cursor = "";
    if (state.activeRoadPolyline) {
      state.flightMap.removeLayer(state.activeRoadPolyline);
      state.activeRoadPolyline = null;
    }
    if (state.activeRoadRubberBand) {
      state.flightMap.removeLayer(state.activeRoadRubberBand);
      state.activeRoadRubberBand = null;
    }
    if (state.activeRoadMarkers) {
      state.activeRoadMarkers.forEach(item => state.flightMap.removeLayer(item));
      state.activeRoadMarkers = [];
    }
    if (state.flightGcpLayer) {
      state.flightGcpLayer.eachLayer(arg1 => {
        if (arg1.getElement) {
          arg1.getElement()?.style.removeProperty("pointer-events");
        }
      });
    }
    if (state.flightOriginalLayer) {
      state.flightOriginalLayer.eachLayer(arg1 => {
        if (arg1.getElement) {
          arg1.getElement()?.style.removeProperty("pointer-events");
        }
      });
    }
    if (state.flightSimplifiedLayer) {
      state.flightSimplifiedLayer.eachLayer(arg1 => {
        if (arg1.getElement) {
          arg1.getElement()?.style.removeProperty("pointer-events");
        }
      });
    }
  }
  const btnEl = document.getElementById("btnDrawCustomRoad");
  const btnEl_1 = document.getElementById("txtDrawRoadBtn");
  const btnEl_2 = document.getElementById("btnPanelDrawRoad");
  const btnEl_3 = document.getElementById("btnFinishDrawRoad");
  const btnEl_4 = document.getElementById("btnCancelDrawRoad");
  if (btnEl_1) {
    btnEl_1.textContent = t("flight.btnDrawRoad");
  }
  if (btnEl_3) {
    btnEl_3.style.display = "none";
    btnEl_3.classList.add("hidden");
  }
  if (btnEl_4) {
    btnEl_4.style.display = "none";
    btnEl_4.classList.add("hidden");
  }
  if (btnEl) {
    btnEl.style.borderColor = "rgba(245, 158, 11, 0.5)";
    btnEl.style.background = "";
  }
  if (btnEl_2) {
    btnEl_2.style.borderColor = "rgba(245, 158, 11, 0.4)";
    btnEl_2.style.background = "";
  }
}
function bindRoadDrawingMapEvents() {
  if (!state.flightMap || state.isRoadDrawingBound) {
    return;
  }
  state.isRoadDrawingBound = true;
  state.flightMap.on("click", arg1 => {
    if (!state.isDrawingRoad) {
      return;
    }
    const items = [arg1.latlng.lat, arg1.latlng.lng];
    state.activeRoadPoints.push(items);
    const v_2 = L.circleMarker(items, {
      radius: 5,
      color: "#f59e0b",
      fillColor: "#ffffff",
      fillOpacity: 1,
      weight: 2.5
    }).addTo(state.flightMap);
    state.activeRoadMarkers.push(v_2);
    if (state.activeRoadPolyline) {
      state.activeRoadPolyline.setLatLngs(state.activeRoadPoints);
    } else {
      state.activeRoadPolyline = L.polyline(state.activeRoadPoints, {
        color: "#f59e0b",
        weight: 3.5,
        dashArray: "6, 4",
        opacity: 0.95
      }).addTo(state.flightMap);
    }
    const btnEl = document.getElementById("txtDrawRoadBtn");
    const btnEl_1 = document.getElementById("btnFinishDrawRoad");
    if (btnEl) {
      btnEl.textContent = t("flight.btnDrawingRoad", { count: state.activeRoadPoints.length });
    }
    if (btnEl_1) {
      btnEl_1.textContent = "✔️ Tamamla (" + state.activeRoadPoints.length + " Nokta)";
    }
  });
  state.flightMap.on("mousemove", arg1 => {
    if (!state.isDrawingRoad || state.activeRoadPoints.length === 0) {
      return;
    }
    const v_2 = state.activeRoadPoints[state.activeRoadPoints.length - 1];
    const items = [arg1.latlng.lat, arg1.latlng.lng];
    if (state.activeRoadRubberBand) {
      state.activeRoadRubberBand.setLatLngs([v_2, items]);
    } else {
      state.activeRoadRubberBand = L.polyline([v_2, items], {
        color: "#f59e0b",
        weight: 2,
        dashArray: "3, 4",
        opacity: 0.7
      }).addTo(state.flightMap);
    }
  });
  state.flightMap.on("dblclick", arg1 => {
    if (state.isDrawingRoad) {
      L.DomEvent.stopPropagation(arg1);
      finishDrawingRoad();
    }
  });
  document.addEventListener("keydown", event => {
    if (!state.isDrawingRoad) {
      return;
    }
    if (event.key === "Escape") {
      cancelDrawingRoad();
    } else if (event.key === "Enter") {
      finishDrawingRoad();
    }
  });
}
function computeDelaunayEdges(arg1) {
  if (!arg1 || arg1.length < 3) {
    return [];
  }
  const v_2 = arg1.map(item => ({
    id: item.id,
    name: item.name,
    lat: item.lat,
    lon: item.lon,
    x: item.itrfY || item.lon * 100000,
    y: item.itrfX || item.lat * 100000
  }));
  let v_3 = Infinity;
  let v_4 = -Infinity;
  let v_5 = Infinity;
  let v_6 = -Infinity;
  v_2.forEach(item => {
    if (item.x < v_3) {
      v_3 = item.x;
    }
    if (item.x > v_4) {
      v_4 = item.x;
    }
    if (item.y < v_5) {
      v_5 = item.y;
    }
    if (item.y > v_6) {
      v_6 = item.y;
    }
  });
  const v_7 = (v_4 - v_3) * 10;
  const v_8 = (v_6 - v_5) * 10;
  const v_9 = (v_3 + v_4) / 2;
  const v_10 = (v_5 + v_6) / 2;
  const obj = {
    x: v_9 - v_7,
    y: v_10 - v_8,
    isSuper: true
  };
  const obj_1 = {
    x: v_9,
    y: v_10 + v_8 * 2,
    isSuper: true
  };
  const obj_2 = {
    x: v_9 + v_7 * 2,
    y: v_10 - v_8,
    isSuper: true
  };
  let items = [{
    a: obj,
    b: obj_1,
    c: obj_2,
    circle: _getCircumcircle(obj, obj_1, obj_2)
  }];
  for (const v_1 of v_2) {
    const items_2 = [];
    const items_3 = [];
    for (const v_1_1 of items) {
      const v_1_2 = Math.hypot(v_1.x - v_1_1.circle.x, v_1.y - v_1_1.circle.y);
      if (v_1_2 < v_1_1.circle.r) {
        items_3.push(v_1_1);
      }
    }
    for (const v_1_1 of items_3) {
      const items_4 = [[v_1_1.a, v_1_1.b], [v_1_1.b, v_1_1.c], [v_1_1.c, v_1_1.a]];
      for (const v_1_2 of items_4) {
        let flag = false;
        for (const v_1_3 of items_3) {
          if (v_1_3 === v_1_1) {
            continue;
          }
          const items_5 = [[v_1_3.a, v_1_3.b], [v_1_3.b, v_1_3.c], [v_1_3.c, v_1_3.a]];
          if (items_5.some(item => item[0] === v_1_2[0] && item[1] === v_1_2[1] || item[0] === v_1_2[1] && item[1] === v_1_2[0])) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          items_2.push(v_1_2);
        }
      }
    }
    items = items.filter(item => !items_3.includes(item));
    for (const v_1_1 of items_2) {
      const obj_3 = {
        a: v_1_1[0],
        b: v_1_1[1],
        c: v_1
      };
      obj_3.circle = _getCircumcircle(obj_3.a, obj_3.b, obj_3.c);
      items.push(obj_3);
    }
  }
  items = items.filter(item => !item.a.isSuper && !item.b.isSuper && !item.c.isSuper);
  const v_11 = new Set();
  const items_1 = [];
  items.forEach(item => {
    const items_2 = [[item.a, item.b], [item.b, item.c], [item.c, item.a]];
    items_2.forEach(([item_1, item_2]) => {
      const v_1 = item_1.id < item_2.id ? item_1.id + "-" + item_2.id : item_2.id + "-" + item_1.id;
      if (!v_11.has(v_1)) {
        v_11.add(v_1);
        items_1.push([item_1, item_2]);
      }
    });
  });
  return items_1;
}
function _getCircumcircle(arg1, arg2, arg3) {
  const v_4 = (arg1.x * (arg2.y - arg3.y) + arg2.x * (arg3.y - arg1.y) + arg3.x * (arg1.y - arg2.y)) * 2;
  if (Math.abs(v_4) < 1e-7) {
    return {
      x: 0,
      y: 0,
      r: Infinity
    };
  }
  const v_5 = ((arg1.x * arg1.x + arg1.y * arg1.y) * (arg2.y - arg3.y) + (arg2.x * arg2.x + arg2.y * arg2.y) * (arg3.y - arg1.y) + (arg3.x * arg3.x + arg3.y * arg3.y) * (arg1.y - arg2.y)) / v_4;
  const v_6 = ((arg1.x * arg1.x + arg1.y * arg1.y) * (arg3.x - arg2.x) + (arg2.x * arg2.x + arg2.y * arg2.y) * (arg1.x - arg3.x) + (arg3.x * arg3.x + arg3.y * arg3.y) * (arg2.x - arg1.x)) / v_4;
  return {
    x: v_5,
    y: v_6,
    r: Math.hypot(arg1.x - v_5, arg1.y - v_6)
  };
}
function bindPhotogrammetryHandlers() {
  initDroneDatabaseUI();
}
function renderFlightGridOnMap(arg1) {
  if (!state.flightMap) {
    return;
  }
  if (!state.flightLinesLayer) {
    state.flightLinesLayer = L.layerGroup().addTo(state.flightMap);
  }
  if (!state.flightWaypointsLayer) {
    state.flightWaypointsLayer = L.layerGroup().addTo(state.flightMap);
  }
  if (!state.flightHomeLayer) {
    state.flightHomeLayer = L.layerGroup().addTo(state.flightMap);
  }
  if (state.flightCorridorsLayer) {
    state.flightCorridorsLayer.clearLayers();
  }
  state.flightLinesLayer.clearLayers();
  state.flightWaypointsLayer.clearLayers();
  state.flightHomeLayer.clearLayers();
  if (!arg1 || !arg1.lines || arg1.lines.length === 0) {
    return;
  }
  if (arg1.turnArcs && arg1.turnArcs.length > 0) {
    arg1.turnArcs.forEach(item => {
      const v_1 = item.points.map(item_1 => [item_1.lat, item_1.lon || item_1.lng]);
      const v_2 = L.polyline(v_1, {
        color: "#f59e0b",
        weight: 1.8,
        dashArray: "4, 4",
        opacity: 0.75
      });
      state.flightLinesLayer.addLayer(v_2);
    });
  }
  if (arg1.lines && arg1.lines.length > 0) {
    arg1.lines.forEach((item, idx) => {
      const items = [item.start.lat, item.start.lon || item.start.lng];
      const items_1 = [item.end.lat, item.end.lon || item.end.lng];
      const v_1 = L.polyline([items, items_1], {
        color: "#00f2ff",
        weight: 3,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round"
      });
      v_1.bindTooltip(t("flight.tooltipCorridorLine", { num: idx + 1, length: item.lengthM, alt: arg1.flightAltitudeM }), {
        sticky: true
      });
      state.flightLinesLayer.addLayer(v_1);
      const v_2 = (item.start.lat + item.end.lat) / 2;
      const v_3 = ((item.start.lon || item.start.lng) + (item.end.lon || item.end.lng)) / 2;
      const v_4 = item.end.lat - item.start.lat;
      const v_5 = ((item.end.lon || item.end.lng) - (item.start.lon || item.start.lng)) * Math.cos(v_2 * Math.PI / 180);
      let v_6 = Math.atan2(v_5, v_4) * (180 / Math.PI);
      if (v_6 < 0) {
        v_6 += 360;
      }
      const v_7 = L.divIcon({
        className: "flight-dir-arrow-icon",
        html: "<div style=\"transform: rotate(" + v_6.toFixed(0) + "deg); color: #00f2ff; font-size: 11px; text-shadow: 0 0 5px rgba(0,242,255,0.9); display: flex; align-items: center; justify-content: center;\"><i class=\"fa-solid fa-chevron-up\"></i></div>",
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      const v_8 = L.marker([v_2, v_3], {
        icon: v_7,
        interactive: false
      });
      state.flightLinesLayer.addLayer(v_8);
    });
  }
  if (arg1.waypoints && arg1.waypoints.length > 0) {
    const v_1 = arg1.waypoints.length;
    const v_2 = v_1 > 350 ? Math.ceil(v_1 / 350) : 1;
    for (let num = 0; num < v_1; num += v_2) {
      const v_1_1 = arg1.waypoints[num];
      const v_2_1 = L.circleMarker([v_1_1.lat, v_1_1.lon || v_1_1.lng], {
        radius: 2.2,
        color: "#fbbf24",
        fillColor: "#fbbf24",
        fillOpacity: 0.9,
        weight: 1
      });
      state.flightWaypointsLayer.addLayer(v_2_1);
    }
  }
  if (arg1.homePoint) {
    const v_1 = arg1.homePoint;
    const items = [v_1.lat, v_1.lon || v_1.lng];
    const v_2 = v_1.isRoadSnapped;
    const v_3 = L.divIcon({
      className: "flight-home-icon",
      html: "<div style=\"width: 24px; height: 24px; border-radius: 50%; background: " + (v_2 ? "#10b981" : "#f59e0b") + "; border: 2px solid #ffffff; box-shadow: 0 0 10px " + (v_2 ? "rgba(16, 185, 129, 0.9)" : "rgba(245, 158, 11, 0.9)") + "; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: 900; font-family: var(--font-display);\">H</div>",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    const v_4 = L.marker(items, {
      icon: v_3
    });
    const roadDesc = v_2 ? t("flight.alignedToRoad", { dist: v_1.distanceM }) : t("flight.flightStartPos");
    v_4.bindPopup("<b>" + t("flight.popupHomeTitle") + "</b><br/>" + roadDesc + "<br/><b>WGS-84:</b> " + v_1.lat.toFixed(6) + ", " + (v_1.lon || v_1.lng).toFixed(6));
    state.flightHomeLayer.addLayer(v_4);
    if (arg1.lines.length > 0) {
      const items_1 = [arg1.lines[0].start.lat, arg1.lines[0].start.lon || arg1.lines[0].start.lng];
      const v_1_1 = L.polyline([items, items_1], {
        color: v_2 ? "#10b981" : "#f59e0b",
        weight: 1.5,
        dashArray: "4, 5",
        opacity: 0.8
      });
      state.flightHomeLayer.addLayer(v_1_1);
      const v_2_1 = arg1.lines[arg1.lines.length - 1];
      const items_2 = [v_2_1.end.lat, v_2_1.end.lon || v_2_1.end.lng];
      const v_3_1 = L.polyline([items_2, items], {
        color: v_2 ? "#10b981" : "#f59e0b",
        weight: 1.5,
        dashArray: "4, 5",
        opacity: 0.8
      });
      state.flightHomeLayer.addLayer(v_3_1);
    }
  }
}
