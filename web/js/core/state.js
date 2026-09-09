/**
 * Harita Tools - Global State & DOM Element Registry
 */
var state = window.state = {
  flightEngine: null,
  flightMap: null,
  flightOriginalLayer: null,
  flightSimplifiedLayer: null,
  flightRoadLayer: null,
  flightGcpLayer: null,
  flightTriangulationLayer: null,
  isDrawingRoad: false,
  activeRoadPoints: [],
  activeRoadPolyline: null,
  activeRoadMarkers: [],
  isFlightMapInit: false,
  mergerGroups: {},
  currentMergedFiles: {},
  posSolutions: [],
  posText: "",
  csvText: "",
  map: null,
  mapLayerGroup: null,
  cadastreMap: null,
  cadastreLayerGroup: null,
  paftaLayerGroup: null,
  domLayerGroup: null,
  isDomLayerActive: false,
  highlightedPaftaLayer: null,
  activePaftaScale: "off",
  gnssEngine: typeof GnssFormatEngine !== "undefined" ? new GnssFormatEngine() : null,
  rinexEngine: typeof RinexPowerEngine !== "undefined" ? new RinexPowerEngine() : null,
  paftaEngine: typeof PaftaIndexEngine !== "undefined" ? new PaftaIndexEngine() : null,
  tg20Engine: typeof Tg20GeoidEngine !== "undefined" ? new Tg20GeoidEngine() : null,
  tg20Map: null,
  tg20MapMarker: null,
  lastTg20QueryPoint: null,
  converterEngine: typeof UniversalFormatConverterEngine !== "undefined" ? new UniversalFormatConverterEngine() : null,
  converterMap: null,
  converterLayerGroup: null,
  isConverterMapInit: false,
  converterShowLabels: false,
  converterShowTexts: true,
  converterFilterType: "ALL",
  converterSearchQuery: ""
};
function getElementsRegistry() {
  return {
    get navItems() { return document.querySelectorAll(".sidebar .nav-item, .nav-item"); },
    get toolTabs() { return document.querySelectorAll(".tool-tab"); },
    get subTabBtns() { return document.querySelectorAll(".subtab-btn, .sub-tab-btn"); },
    get subTabContents() { return document.querySelectorAll(".subtab-content"); },
    get pageTitle() { return document.getElementById("pageTitle"); },
    get pageSubtitle() { return document.getElementById("pageSubtitle"); },
    get globalConsoleLog() { return document.getElementById("globalConsoleLog"); },
    get progressBarFill() { return document.getElementById("progressBarFill"); },
    get progressLabel() { return document.getElementById("progressLabel"); },
    get progressPercent() { return document.getElementById("progressPercent"); },
    get btnClearLog() { return document.getElementById("btnClearLog") || document.getElementById("btnClearConsoleLog"); },
    get btnCopyLog() { return document.getElementById("btnCopyLog"); },
    get rw5FileInput() { return document.getElementById("rw5FileInput"); },
    get rw5Radius() { return document.getElementById("rw5Radius"); },
    get rw5Tolerance() { return document.getElementById("rw5Tolerance"); },
    get rw5MinTime() { return document.getElementById("rw5MinTime"); },
    get btnAnalyzeRw5() { return document.getElementById("btnAnalyzeRw5"); },
    get brandDetectPill() { return document.getElementById("brandDetectPill"); },
    get tableGpsFormatRtkBody() { return document.getElementById("tableGpsFormatRtkBody"); },
    get tableRw5MatchedBody() { return document.getElementById("tableRw5MatchedBody"); },
    get txtCoordOutput() { return document.getElementById("txtCoordOutput"); },
    get selectCoordOrder() { return document.getElementById("selectCoordOrder"); },
    get btnCopyCoords() { return document.getElementById("btnCopyCoords"); },
    get btnDownloadCoordTxt() { return document.getElementById("btnDownloadCoordTxt"); },
    get btnFitCadastreMap() { return document.getElementById("btnFitCadastreMap"); },
    get btnPrintCadastre() { return document.getElementById("btnPrintCadastre"); },
    get btnExportCadastreCsv() { return document.getElementById("btnExportCadastreCsv"); },
    get btnExportRtkCsv() { return document.getElementById("btnExportRtkCsv"); },
    get btnExportNcn() { return document.getElementById("btnExportNcn"); },
    get btnExportKos() { return document.getElementById("btnExportKos"); },
    get btnExportDxf() { return document.getElementById("btnExportDxf"); },
    get btnExportKmlCadastre() { return document.getElementById("btnExportKmlCadastre"); },
    get btnExportTg20RwReport() { return document.getElementById("btnExportTg20RwReport"); },
    get barCriterion() { return document.getElementById("barCriterion"); },
    get barProj() { return document.getElementById("barProj"); },
    get barGeoid() { return document.getElementById("barGeoid"); },
    get mergerDropzone() { return document.getElementById("mergerDropzone"); },
    get mergerFileInput() { return document.getElementById("mergerFileInput"); },
    get mergerResultCard() { return document.getElementById("mergerResultCard"); },
    get tableGroupsBody() { return document.getElementById("tableGroupsBody"); },
    get btnMergeAll() { return document.getElementById("btnMergeAll"); },
    get chkSysGps() { return document.getElementById("chkSysGps"); },
    get chkSysGlo() { return document.getElementById("chkSysGlo"); },
    get chkSysGal() { return document.getElementById("chkSysGal"); },
    get chkSysBds() { return document.getElementById("chkSysBds"); },
    get inputExcludeSats() { return document.getElementById("inputExcludeSats"); },
    get selectTargetFormat() { return document.getElementById("selectTargetFormat"); },
    get selectDecimationStep() { return document.getElementById("selectDecimationStep"); },
    get btnExportKml() { return document.getElementById("btnExportKml"); },
    get btnExportGeoJson() { return document.getElementById("btnExportGeoJson"); },
    get geoLat() { return document.getElementById("geoLat"); },
    get geoLon() { return document.getElementById("geoLon"); },
    get geoH() { return document.getElementById("geoH"); },
    get btnConvertCoord() { return document.getElementById("btnConvertCoord"); },
    get coordResultBox() { return document.getElementById("coordResultBox") }
  };
}

const elementsTarget = getElementsRegistry();

// Using Proxy so ANY element accessed via elements[prop] will dynamically query by ID if not predefined
var elements = window.elements = new Proxy(elementsTarget, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    if (typeof prop === "string" && typeof document !== "undefined") {
      return document.getElementById(prop);
    }
    return undefined;
  }
});

function refreshElements() {
  const updated = getElementsRegistry();
  Object.keys(updated).forEach(k => {
    Object.defineProperty(elementsTarget, k, Object.getOwnPropertyDescriptor(updated, k));
  });
  return elements;
}

window.state = state;
window.elements = elements;
window.refreshElements = refreshElements;
