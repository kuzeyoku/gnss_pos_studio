/**
 * ===================================================================
 *  HARİTA TOOLS (BETA) - ANA UYGULAMA ORKESTRATÖRÜ (app.js)
 * ===================================================================
 *  Bu dosya sadece modülleri koordine eder ve başlatır.
 *  İş mantığı js/core/, js/modules/ ve js/tabs/ modüllerindedir.
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", async () => {
  // -1. Dynamic Component Engine (Loads all HTML components directly from components/ directory)
  if (window.ComponentLoader && typeof window.ComponentLoader.loadAll === "function") {
    await window.ComponentLoader.loadAll();
  }

  // Refresh DOM elements references
  if (typeof window.refreshElements === "function") {
    window.refreshElements();
  }

  // 0. Localization Engine (i18n), Single-Source Registries (EPSG, Drones, Reports)
  if (window.i18n && typeof window.i18n.init === "function") {
    await window.i18n.init("tr");
  }
  if (window.GeodesyEngine && typeof window.GeodesyEngine.loadEpsgRegistry === "function") {
    await window.GeodesyEngine.loadEpsgRegistry();
  }
  if (window.DroneDatabaseManager && typeof window.DroneDatabaseManager.loadDatabase === "function") {
    await window.DroneDatabaseManager.loadDatabase();
  }
  if (window.GnssReportTemplates && typeof window.GnssReportTemplates.loadAllTemplates === "function") {
    await window.GnssReportTemplates.loadAllTemplates();
  }
  if (state.paftaEngine && typeof state.paftaEngine.loadHgmDatabase === "function") {
    await state.paftaEngine.loadHgmDatabase();
  }
  if (state.tg20Engine && typeof state.tg20Engine.loadModelFromJson === "function") {
    state.tg20Engine.loadModelFromJson(); // Asenkron arka planda hazırla
  }

  // 1. Core Services & Shell
  if (typeof initThemeToggle === "function") initThemeToggle();
  if (typeof initKeyboardShortcuts === "function") initKeyboardShortcuts();
  if (typeof initGlobalDragAndDrop === "function") initGlobalDragAndDrop();
  if (typeof initNavigation === "function") initNavigation();
  if (typeof initAboutModal === "function") initAboutModal();
  if (typeof initConsoleControls === "function") initConsoleControls();
  if (typeof initMobileNavDrawer === "function") initMobileNavDrawer();

  // 2. Tab Controllers
  if (typeof initGpsFormatSubtabs === "function") initGpsFormatSubtabs();
  if (typeof initCadastreModule === "function") initCadastreModule();
  if (typeof initMergerDropzone === "function") initMergerDropzone();
  if (typeof initPpkInspector === "function") initPpkInspector();
  if (typeof initRinexQualityInspector === "function") initRinexQualityInspector();
  if (typeof initGeodesy === "function") initGeodesy();
  if (typeof initToolsTab === "function") initToolsTab();
  if (typeof initTg20GeoidStation === "function") initTg20GeoidStation();
  if (typeof initFlightPlannerStudio === "function") initFlightPlannerStudio();
  if (typeof initFormatConverterModule === "function") initFormatConverterModule();
  if (typeof initVersionAndFormatCascader === "function") initVersionAndFormatCascader();
  if (typeof initGuideSearchAndFilter === "function") initGuideSearchAndFilter();

  console.log("🚀 Harita Tools (Beta) Modüler Çekirdek Başarıyla Başlatıldı.");
});
