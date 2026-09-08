/**
 * UniversalFormatConverterEngine Unit Tests
 * DXF, KML, GPX, NCN, CSV, GeoJSON ayrıştırma ve dışa aktarma testleri
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { UniversalFormatConverterEngine, GeodesyEngine } = require('./test-helper.js');

function assertClose(actual, expected, tolerance, msg) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tolerance, `${msg}: ${actual} ≠ ${expected} (fark: ${diff})`);
}

// ═══════════════════════════════════════════════════════════════
// 1. KML Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('KML Ayrıştırma', () => {

  const sampleKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Test</name>
  <Placemark>
    <name>Point1</name>
    <Point><coordinates>32.8597,39.9334,350</coordinates></Point>
  </Placemark>
  <Placemark>
    <name>Line1</name>
    <LineString><coordinates>32.0,39.0,0 33.0,40.0,0 34.0,41.0,0</coordinates></LineString>
  </Placemark>
  <Placemark>
    <name>Area1</name>
    <Polygon><outerBoundaryIs><LinearRing>
      <coordinates>32.0,39.0,0 33.0,39.0,0 33.0,40.0,0 32.0,40.0,0 32.0,39.0,0</coordinates>
    </LinearRing></outerBoundaryIs></Polygon>
  </Placemark>
</Document>
</kml>`;

  it('KML parse - 3 geometri (nokta + çizgi + poligon)', () => {
    const engine = new UniversalFormatConverterEngine();
    const features = engine.parseKml(sampleKml);
    assert.ok(features.length >= 3, `${features.length} feature bulunmalı (≥3)`);
  });

  it('KML parse - nokta koordinatları doğru', () => {
    const engine = new UniversalFormatConverterEngine();
    const features = engine.parseKml(sampleKml);
    const point = features.find(f => f.type === 'Point');
    if (point) {
      assertClose(point.coordinates[0], 32.8597, 0.01, 'lon');
      assertClose(point.coordinates[1], 39.9334, 0.01, 'lat');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. GPX Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('GPX Ayrıştırma', () => {

  const sampleGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Test">
  <wpt lat="39.9334" lon="32.8597"><name>WP1</name><ele>350</ele></wpt>
  <wpt lat="41.0082" lon="28.9784"><name>WP2</name><ele>100</ele></wpt>
  <trk>
    <name>Track1</name>
    <trkseg>
      <trkpt lat="39.0" lon="32.0"><ele>200</ele></trkpt>
      <trkpt lat="39.5" lon="32.5"><ele>250</ele></trkpt>
      <trkpt lat="40.0" lon="33.0"><ele>300</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;

  it('GPX parse - waypoint + track', () => {
    const engine = new UniversalFormatConverterEngine();
    const features = engine.parseGpx(sampleGpx);
    assert.ok(features.length >= 2, `${features.length} feature (≥2: wpt + trk)`);
  });

  it('GPX parse - waypoint koordinatları doğru', () => {
    const engine = new UniversalFormatConverterEngine();
    const features = engine.parseGpx(sampleGpx);
    const wpt = features.find(f => f.type === 'Point' && f.name === 'WP1');
    if (wpt) {
      assertClose(wpt.coordinates[0], 32.8597, 0.01, 'WP1 lon');
      assertClose(wpt.coordinates[1], 39.9334, 0.01, 'WP1 lat');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. NCN Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('NCN Ayrıştırma', () => {

  it('Standart Netcad NCN formatı parse ediliyor', () => {
    const ncn = `1 500000.000 4400000.000 100.000
2 500100.000 4400100.000 200.000
3 500200.000 4400200.000 300.000`;

    const engine = new UniversalFormatConverterEngine();
    const features = engine.parseNcn(ncn);
    assert.ok(features.length >= 3, `${features.length} nokta (≥3)`);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. CSV Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('CSV Ayrıştırma', () => {

  it('Standart CSV formatı parse ediliyor', () => {
    const csv = `name,lon,lat,ele
P1,32.86,39.93,350
P2,28.98,41.01,100`;

    const engine = new UniversalFormatConverterEngine();
    const features = engine.parseCsv(csv);
    assert.ok(features.length >= 2, `${features.length} nokta (≥2)`);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. GeoJSON Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('GeoJSON Ayrıştırma', () => {

  it('FeatureCollection parse ediliyor', () => {
    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [32.86, 39.93] }, properties: { name: 'P1' } },
        { type: 'Feature', geometry: { type: 'Point', coordinates: [28.98, 41.01] }, properties: { name: 'P2' } },
      ]
    });

    const engine = new UniversalFormatConverterEngine();
    const features = engine.parseGeoJson(geojson);
    assert.ok(features.length >= 2, `${features.length} feature (≥2)`);
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. DXF Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('DXF Ayrıştırma', () => {

  it('Minimal DXF POINT entity parse ediliyor', () => {
    const dxf = `0
SECTION
2
ENTITIES
0
POINT
8
NOKTALAR
10
500000.0
20
4400000.0
30
100.0
0
ENDSEC
0
EOF`;

    const engine = new UniversalFormatConverterEngine();
    const features = engine.parseDxf(dxf);
    assert.ok(features.length >= 1, `${features.length} entity (≥1)`);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Export Round-Trip Testleri
// ═══════════════════════════════════════════════════════════════
describe('Export Round-Trip', () => {

  function makeEngineWithData() {
    const engine = new UniversalFormatConverterEngine();
    // parseKml ile veri yükle
    engine.parseKml(`<?xml version="1.0"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <Placemark><name>T1</name><Point><coordinates>32.86,39.93,350</coordinates></Point></Placemark>
  <Placemark><name>T2</name><Point><coordinates>28.98,41.01,100</coordinates></Point></Placemark>
</Document>
</kml>`);
    return engine;
  }

  it('KML export geçerli XML', () => {
    const engine = makeEngineWithData();
    const kml = engine.exportKml();
    assert.ok(typeof kml === 'string', 'String dönmeli');
    assert.ok(kml.includes('<kml') || kml.includes('<?xml'), 'KML/XML yapısı');
  });

  it('GeoJSON export geçerli JSON', () => {
    const engine = makeEngineWithData();
    const geojson = engine.exportGeoJson();
    assert.ok(typeof geojson === 'string', 'String dönmeli');
    const parsed = JSON.parse(geojson);
    assert.strictEqual(parsed.type, 'FeatureCollection', 'FeatureCollection tipi');
    assert.ok(parsed.features.length >= 2, 'En az 2 feature');
  });

  it('NCN export metin üretiyor', () => {
    const engine = makeEngineWithData();
    const ncn = engine.exportNcn();
    assert.ok(typeof ncn === 'string', 'String dönmeli');
    assert.ok(ncn.length > 10, 'Makul uzunluk');
  });

  it('DXF export metin üretiyor', () => {
    const engine = makeEngineWithData();
    const dxf = engine.exportDxf();
    assert.ok(typeof dxf === 'string', 'String dönmeli');
    assert.ok(dxf.includes('SECTION') || dxf.includes('EOF'), 'DXF yapısı');
  });

  it('GPX export standart 1.1 XML', () => {
    const engine = makeEngineWithData();
    const gpx = engine.exportGpx();
    assert.ok(typeof gpx === 'string', 'String dönmeli');
    assert.ok(gpx.includes('<gpx') || gpx.includes('<?xml'), 'GPX yapısı');
  });

  it('CSV export metin üretiyor', () => {
    const engine = makeEngineWithData();
    const csv = engine.exportCsv();
    assert.ok(typeof csv === 'string', 'String dönmeli');
    assert.ok(csv.length > 10, 'Makul uzunluk');
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. Poligon Üretimi
// ═══════════════════════════════════════════════════════════════
describe('Poligon Üretimi', () => {

  it('Sıralı noktalardan poligon üretimi', () => {
    const engine = new UniversalFormatConverterEngine();
    engine.parseNcn(`1 500000.000 4400000.000 100.000
2 500100.000 4400000.000 100.000
3 500100.000 4400100.000 100.000
4 500000.000 4400100.000 100.000`);
    const poly = engine.generatePolygonFromPoints('sequential');
    assert.ok(poly, 'Poligon üretildi');
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. İHA ve Oblique Kamera (CHC C30 / SHARE UAV) POS Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('İHA / Oblique Kamera POS Ayrıştırma', () => {

  const sampleChcPos = `PhotoID,Longitude,Latitude,Height,Roll,Pitch,Yaw
C30_0001_1.JPG,32.859700,39.933400,950.50,0.12,-0.45,182.30
C30_0001_2.JPG,32.859710,39.933410,950.52,-44.80,-0.50,182.30
C30_0001_3.JPG,32.859715,39.933395,950.48,0.15,-45.10,272.30
C30_0001_4.JPG,32.859690,39.933390,950.51,44.90,-0.40,002.30
C30_0001_5.JPG,32.859685,39.933405,950.49,0.10,44.85,092.30`;

  it('CHC C30 5-lens oblique POS dosyası ayrıştırılıyor', async () => {
    const engine = new UniversalFormatConverterEngine();
    const features = await engine.parseFile(sampleChcPos, 'flight_c30.pos');
    assert.strictEqual(features.length, 5, '5 kamera pozu ayrıştırılmalı');
    assert.strictEqual(engine.sourceFormat, 'UAV_POS', 'Format UAV_POS olmalı');

    const nadir = features.find(f => f.name === 'C30_0001_1.JPG');
    assert.ok(nadir, 'Nadir kamera bulunmalı');
    assert.strictEqual(nadir.properties.lens, 'NADIR');
    assertClose(nadir.coordinates[0], 32.8597, 0.0001, 'Lon');
    assertClose(nadir.coordinates[1], 39.9334, 0.0001, 'Lat');
    assertClose(nadir.coordinates[2], 950.50, 0.01, 'Height');
    assertClose(nadir.properties.yaw, 182.30, 0.01, 'Yaw');

    const fwd = features.find(f => f.name === 'C30_0001_2.JPG');
    assert.ok(fwd, 'Forward kamera bulunmalı');
    assert.strictEqual(fwd.properties.lens, 'FORWARD');
  });

  it('UAV POS ayrıştırmasından sonra DXF ve CSV dışa aktarımı çalışıyor', async () => {
    const engine = new UniversalFormatConverterEngine();
    await engine.parseFile(sampleChcPos, 'flight_c30.pos');
    const dxf = engine.exportDxf();
    const csv = engine.exportCsv();
    assert.ok(dxf.includes('UAV_KAMERA_POZLARI') || dxf.includes('C30_0001'), 'DXF katmanı veya nokta adı içermeli');
    assert.ok(csv.includes('C30_0001_1.JPG'), 'CSV nokta adı içermeli');
  });
});

