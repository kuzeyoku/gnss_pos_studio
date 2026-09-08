/**
 * Uçtan Uca Modüller Arası İlişkisel Entegrasyon ve Fonksiyon Zincirleme Testi
 */

const GeodesyEngine = require('../web/js/modules/geodesyEngine.js');
const PaftaIndexEngine = require('../web/js/modules/paftaIndexEngine.js');
const Tg20GeoidEngine = require('../web/js/modules/tg20GeoidEngine.js');
const DroneDatabaseManager = require('../web/js/modules/droneDatabase.js');
const FlightPlannerEngine = require('../web/js/modules/flightPlannerEngine.js');
const GnssFormatEngine = require('../web/js/modules/gnssFormatEngine.js');
const RinexPowerEngine = require('../web/js/modules/rinexPowerEngine.js').RinexPowerEngine;

// Global mock'lar
global.window = {
  HGM_DATUM_CORRECTIONS: {
    "06": { il: "ANKARA", dx: -84.1, dy: -102.3, dz: -129.8, rx: 0, ry: 0, rz: 0, s: 0 }
  },
  DroneDatabase: DroneDatabaseManager
};

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, extraInfo = "") {
  totalTests++;
  if (condition) {
    console.log(`✅ [GEÇTİ] ${testName} ${extraInfo}`);
    passedTests++;
  } else {
    console.error(`❌ [BAŞARISIZ] ${testName} ${extraInfo}`);
  }
}

async function runIntegrationTests() {
  console.log("=== MODÜLLER ARASI İLİŞKİSEL ENTEGRASYON TESTİ BAŞLATILIYOR ===");

  // 1. Geodesy Engine Testi (Ankara Kızılay)
  const geoEngine = new GeodesyEngine();
  const lat = 39.92077;
  const lon = 32.85411;
  const hEllips = 950.0;
  const dom = 33;

  const tmCoord = geoEngine.wgs84ToTurefTM(lat, lon, dom);
  assert(tmCoord && tmCoord.y > 400000 && tmCoord.x > 4400000, "GeodesyEngine: WGS84 -> TUREF TM 3° Dönüşümü", `Y=${tmCoord.y.toFixed(3)}, X=${tmCoord.x.toFixed(3)}`);

  const backGeo = geoEngine.turefTMToWgs84(tmCoord.y, tmCoord.x, dom);
  assert(Math.abs(backGeo.lat - lat) < 1e-6 && Math.abs(backGeo.lon - lon) < 1e-6, "GeodesyEngine: Ters Dönüşüm (TUREF TM 3° -> WGS84)", `dLat=${(backGeo.lat - lat).toExponential(2)}`);

  // 2. TG-20 Jeoit İndirgeme Motoru Testi
  const tg20Engine = new Tg20GeoidEngine();
  tg20Engine.isLoaded = true;
  tg20Engine.gridDataFloat = new Float32Array(421 * 1171).fill(37.45);

  const geoidRes = tg20Engine.reduceHeight(lat, lon, hEllips);
  assert(geoidRes && geoidRes.inBounds && geoidRes.N !== null, "Tg20GeoidEngine: Kot İndirgemesi (reduceHeight)", `N=${geoidRes.N?.toFixed(3)}m, H=${geoidRes.H?.toFixed(3)}m`);

  const tmGeoidRes = tg20Engine.reduceHeightFromTM(tmCoord.y, tmCoord.x, hEllips, "EPSG:7932", geoEngine);
  assert(tmGeoidRes && tmGeoidRes.inBounds, "Tg20GeoidEngine + GeodesyEngine: TM Projeksiyondan İndirgeme (reduceHeightFromTM)");

  // 3. Pafta İndeks Motoru Testi
  const paftaEngine = new PaftaIndexEngine();
  const sheet100k = paftaEngine.calculate100kSheet(lat, lon);
  assert(sheet100k && sheet100k.sheetName, "PaftaIndexEngine: 1/100K Pafta Hesabı", `Pafta=${sheet100k.sheetName}`);

  const sheet25k = paftaEngine.calculate25kSheet(lat, lon);
  assert(sheet25k && sheet25k.sheetName, "PaftaIndexEngine: 1/25K Pafta Hesabı", `Pafta=${sheet25k.sheetName}`);

  const pointSheet = paftaEngine.findPaftaByPoint(lat, lon);
  assert(pointSheet && pointSheet.s100k && pointSheet.s25k, "PaftaIndexEngine: findPaftaByPoint Zincirleme Sorgusu");

  // 4. Drone Veritabanı Testi
  const drones = DroneDatabaseManager.getDrones();
  assert(drones && drones.length > 0, "DroneDatabase: İHA Listesi", `Toplam ${drones.length} model`);

  const m3e = DroneDatabaseManager.getDrone("dji_m3e");
  const m3eCameras = DroneDatabaseManager.getCamerasForDrone("dji_m3e");
  assert(m3e && m3eCameras && m3eCameras.length > 0, "DroneDatabase: DJI Mavic 3 Enterprise Sorgusu", `Kamera: ${m3eCameras[0].name}`);

  // 5. Fotogrametrik Uçuş Planlama Motoru Testi
  const flightEngine = new FlightPlannerEngine();
  const polyCoords = [
    { lat: 39.920, lon: 32.850 },
    { lat: 39.925, lon: 32.850 },
    { lat: 39.925, lon: 32.858 },
    { lat: 39.920, lon: 32.858 }
  ];

  flightEngine.originalPolygon = polyCoords;
  flightEngine.simplifiedPolygon = polyCoords;
  flightEngine.originalStats = flightEngine.computePolygonStats(polyCoords);
  flightEngine.simplifiedStats = flightEngine.originalStats;

  const headingRes = flightEngine.findOptimalLongAxisHeading(polyCoords);
  assert(typeof headingRes === 'number', "FlightPlannerEngine: Optimal Long-Axis Heading Hesabı", `Heading=${headingRes}°`);

  const flightGrid = flightEngine.generatePhotogrammetryGrid({
    polygon: polyCoords,
    flightAltitudeM: 90,
    forwardOverlapPct: 80,
    sideOverlapPct: 70,
    headingDeg: headingRes,
    droneKey: "dji_m3e",
    cameraKey: "m3e_built_in"
  });
  assert(flightGrid && flightGrid.lines && flightGrid.lines.length > 0, "FlightPlannerEngine: Fotogrametri Grid Üretimi", `${flightGrid.lines.length} Hat, ${flightGrid.waypoints.length} Fotoğraf`);

  // Uçuş Export Testleri
  const kmlFlight = flightEngine.exportFlightKml();
  assert(kmlFlight && kmlFlight.includes("<coordinates>"), "FlightPlannerEngine: exportFlightKml()");

  // Smart GCP Testi (Async)
  const gcpResult = await flightEngine.generateSmartGCPs({
    polygon: polyCoords,
    targetGcpCount: 5,
    targetChkCount: 2,
    roadSnapping: false,
    geodesyEngine: geoEngine
  });
  assert(Array.isArray(gcpResult) && gcpResult.length >= 4, "FlightPlannerEngine: generateSmartGCPs() Dağıtımı", `${gcpResult.length} Nokta`);

  const gcpNcn = flightEngine.exportGcpNcn();
  assert(gcpNcn && gcpNcn.length > 0, "FlightPlannerEngine: exportGcpNcn()");

  const gcpDxf = flightEngine.exportGcpDxf();
  assert(gcpDxf && gcpDxf.includes("SECTION"), "FlightPlannerEngine: exportGcpDxf()");

  const gcpCsv = flightEngine.exportGcpCsv();
  assert(gcpCsv && gcpCsv.includes("Nokta_No"), "FlightPlannerEngine: exportGcpCsv()");

  const gcpKml = flightEngine.exportGcpKml();
  assert(gcpKml && gcpKml.includes("<Placemark>"), "FlightPlannerEngine: exportGcpKml()");

  // 6. GNSS Format Motoru Testi (RW5 ve Çift Okuma)
  const gnssEngine = new GnssFormatEngine();
  const sampleRw5 = `
--SurvCE Version 6.0
JB,NMTest_Project,DT08-27-2026,TM10:00:00
GPS,PNP1,LA39.551234567,LN32.511234567,EL950.120,--CORS
GS,PNP1,N 4410200.120,E 485100.230,EL950.120,--Base
--Second Reading
GPS,PNP1,LA39.551234800,LN32.511234900,EL950.140,--CORS
GS,PNP1,N 4410200.140,E 485100.250,EL950.140,--Base
`;

  const parsedGnss = gnssEngine.parseRw5(sampleRw5);
  assert(parsedGnss && parsedGnss.length === 2, "GnssFormatEngine: parseRw5()", `Ayrıştırılan nokta: ${parsedGnss.length}`);

  const dblAnalysis = gnssEngine.analyzeDoubleReadings(7.0, 0, 1.0);
  assert(dblAnalysis && dblAnalysis.matchedPairs.length === 1, "GnssFormatEngine: analyzeDoubleReadings() BÖHHBÜY Çift Okuma Kontrolü", `Eşleşen çift: ${dblAnalysis.matchedPairs.length}`);

  const ncnExport = gnssEngine.exportNcnText();
  assert(ncnExport && ncnExport.includes("P1"), "GnssFormatEngine: exportNcnText()");

  const dxfExport = gnssEngine.exportDxfText();
  assert(dxfExport && dxfExport.includes("SECTION"), "GnssFormatEngine: exportDxfText()");

  // 7. Evrensel Harita & Format Dönüştürücü Motoru (UniversalFormatConverterEngine)
  const UniversalFormatConverterEngine = require('../web/js/modules/universalFormatConverterEngine.js');
  const convEngine = new UniversalFormatConverterEngine();

  // 7.1 Netcad NCN Ayrıştırma Testi
  const sampleNcn = `
P1   485100.000  4410200.000   950.000
P2   485200.000  4410200.000   952.500
P3   485200.000  4410300.000   955.000
P4   485100.000  4410300.000   951.000
`;
  const ncnParsed = await convEngine.parseFile(sampleNcn, "test_parsel.ncn");
  assert(ncnParsed && ncnParsed.length === 4, "UniversalFormatConverter: NCN Ayrıştırma", `Nokta Sayısı=${ncnParsed.length}`);

  // 7.2 Noktalardan Sıralı Parsel Alanı Üretme Testi
  const polySeq = convEngine.generatePolygonFromPoints("sequential", { layerName: "PARSEL_TEST" });
  assert(polySeq && polySeq.properties.areaM2 === 10000, "UniversalFormatConverter: Sıralı Noktadan 10.000 m² (10 Dönüm) Parsel Üretimi", `Alan=${polySeq.properties.areaM2} m² (${polySeq.properties.areaDonum} Dönüm)`);

  // 7.3 Convex Hull Testi
  const polyHull = convEngine.generatePolygonFromPoints("convex_hull", { layerName: "HULL_TEST" });
  assert(polyHull && polyHull.properties.areaM2 === 10000, "UniversalFormatConverter: Convex Hull (Graham Scan) Alan Üretimi", `Alan=${polyHull.properties.areaM2} m²`);

  // 7.4 DXF İhracı Testi
  const convDxf = convEngine.exportDxf();
  assert(convDxf && convDxf.includes("SECTION") && convDxf.includes("LWPOLYLINE") && convDxf.includes("PARSEL_TEST"), "UniversalFormatConverter: Katmanlı DXF İhracı");

  // 7.5 Google Earth KML İhracı Testi
  const convKml = convEngine.exportKml({ dom: 33 });
  assert(convKml && convKml.includes("<Polygon>") && convKml.includes("<outerBoundaryIs>"), "UniversalFormatConverter: Google Earth KML İhracı");

  // 7.6 Standart GeoJSON İhracı Testi
  const convGeoJson = convEngine.exportGeoJson({ dom: 33 });
  const parsedGeo = JSON.parse(convGeoJson);
  assert(parsedGeo && parsedGeo.type === "FeatureCollection" && parsedGeo.features.length >= 4, "UniversalFormatConverter: Standart GeoJSON İhracı", `Özellik Sayısı=${parsedGeo.features.length}`);

  // 7.7 DXF Ayrıştırma Testi
  const dxfParsed = convEngine.parseDxf(convDxf);
  assert(dxfParsed && dxfParsed.length >= 4, "UniversalFormatConverter: Üretilen DXF'i Geri Okuma (Round-Trip)", `Okunan Geometri=${dxfParsed.length}`);

  console.log(`\n=== TEST SONUCU: ${passedTests} / ${totalTests} TEST BAŞARIYLA TAMAMLANDI (${Math.round((passedTests/totalTests)*100)}%) ===`);
}

runIntegrationTests();
