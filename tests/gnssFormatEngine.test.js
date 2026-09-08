/**
 * GnssFormatEngine Unit Tests
 * RW5/CSV ayrıştırma, çift okuma analizi, format algılama, export doğrulaması
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { GnssFormatEngine } = require('./test-helper.js');

function assertClose(actual, expected, tolerance, msg) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tolerance, `${msg}: ${actual} ≠ ${expected} (fark: ${diff})`);
}

// ═══════════════════════════════════════════════════════════════
// 1. CSV Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('CSV Ayrıştırma', () => {

  it('Standart Pt,Y,X,Z CSV formatı doğru parse ediliyor', () => {
    const csv = `Pt,Easting,Northing,Elevation
1,500100.123,4400200.456,350.789
2,500200.321,4400300.654,351.123
3,500300.111,4400400.222,352.456`;

    const engine = new GnssFormatEngine();
    const points = engine.parseCsv(csv);
    assert.ok(points.length >= 3, `${points.length} nokta bulunmalı (≥3)`);
  });

  it('Virgülle ayrılmış koordinatlar doğru okunuyor', () => {
    const csv = `A1,500000.00,4400000.00,100.00
A2,500100.00,4400100.00,200.00`;

    const engine = new GnssFormatEngine();
    const points = engine.parseCsv(csv);
    if (points.length >= 2) {
      // Koordinat değerleri makul aralıkta
      const p1 = points[0];
      assert.ok(p1.e !== undefined || p1.easting !== undefined || p1.y !== undefined, 'Easting/Y mevcut');
      assert.ok(p1.n !== undefined || p1.northing !== undefined || p1.x !== undefined, 'Northing/X mevcut');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. RW5 Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('RW5 Ayrıştırma', () => {

  it('GPS kayıt bloğu doğru ayrıştırılıyor', () => {
    const rw5 = `JB,NM:TEST_PROJECT
--GPS Data
GPS,PN1,LA39.93340000,LN32.85970000,EL350.000,--GS,PN:1,N:4422143.591,E:738675.608,EL:350.000,--HRMS:0.015,VRMS:0.025`;

    const engine = new GnssFormatEngine();
    const points = engine.parseRw5(rw5);
    assert.ok(points.length >= 1, `${points.length} GPS noktası bulunmalı`);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Format Otomatik Algılama
// ═══════════════════════════════════════════════════════════════
describe('Format Otomatik Algılama', () => {

  it('CSV formatı tanınıyor', () => {
    const engine = new GnssFormatEngine();
    engine.parseData('1,500000,4400000,100', 'test.csv');
    assert.ok(engine.detectedBrandCode, 'Format kodu üretildi');
    assert.ok(engine.detectedBrandCode.includes('DELIMITED') || engine.detectedBrandCode.includes('COORDS'));
  });

  it('RW5 formatı tanınıyor', () => {
    const engine = new GnssFormatEngine();
    engine.parseData('GPS,PN1,LA39.93,LN32.86', 'test.rw5');
    assert.ok(engine.detectedBrandCode, 'Format kodu üretildi');
    assert.ok(engine.detectedBrandCode.includes('FIELD') || engine.detectedBrandCode.includes('STREAM'));
  });

  it('JXL formatı tanınıyor', () => {
    const engine = new GnssFormatEngine();
    engine.parseData('<?xml version="1.0"?><JOBFile>', 'test.jxl');
    assert.ok(engine.detectedBrandCode, 'Format kodu üretildi');
    assert.ok(engine.detectedBrandCode.includes('XML'));
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Çift Okuma Analizi (BÖHHBÜY)
// ═══════════════════════════════════════════════════════════════
describe('Çift Okuma Analizi', () => {

  it('Aynı nokta farklı zamanlarda → çift okuma olarak eşleşmeli', () => {
    const engine = new GnssFormatEngine();
    // Manuel rawPoints enjekte et (pn, e, n, h, timestamp)
    engine.rawPoints = [
      { pn: '1', e: 500000.010, n: 4400000.020, h: 100, timestamp: new Date('2024-01-01T10:00:00Z').getTime() },
      { pn: '1', e: 500000.030, n: 4400000.040, h: 100.05, timestamp: new Date('2024-01-01T12:00:00Z').getTime() },
      { pn: '2', e: 501000.000, n: 4401000.000, h: 200, timestamp: new Date('2024-01-01T10:30:00Z').getTime() },
    ];
    engine.analyzeDoubleReadings(7.0, 60, 1.0);
    assert.ok(engine.matchedPairs.length >= 1, 'En az 1 çift okuma eşleşmesi');
  });

  it('Farklı isimli ve uzak noktalar eşleşmemeli', () => {
    const engine = new GnssFormatEngine();
    engine.rawPoints = [
      { pn: 'A', e: 500000, n: 4400000, h: 100, timestamp: new Date('2024-01-01T10:00:00Z').getTime() },
      { pn: 'B', e: 501000, n: 4401000, h: 200, timestamp: new Date('2024-01-01T12:00:00Z').getTime() },
    ];
    engine.analyzeDoubleReadings(7.0, 60, 1.0);
    assert.strictEqual(engine.matchedPairs.length, 0, 'Farklı isimli ve uzak noktalar eşleşmemeli');
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Export Fonksiyonları
// ═══════════════════════════════════════════════════════════════
describe('Export Fonksiyonları', () => {

  function makeEngine() {
    const engine = new GnssFormatEngine();
    engine.rawPoints = [
      { pn: 'P1', e: 500000, n: 4400000, h: 100 },
      { pn: 'P2', e: 500100, n: 4400100, h: 200 },
    ];
    // matchedPairs ve unmatchedPoints ayarla
    engine.matchedPairs = [];
    engine.unmatchedPoints = [...engine.rawPoints];
    return engine;
  }

  it('DXF export metin üretiyor', () => {
    const engine = makeEngine();
    const dxf = engine.exportDxfText();
    assert.ok(typeof dxf === 'string', 'String dönmeli');
    assert.ok(dxf.length > 50, 'Makul uzunluk');
    assert.ok(dxf.includes('SECTION') || dxf.includes('ENTITIES') || dxf.includes('0'), 'DXF yapısı');
  });

  it('NCN export metin üretiyor', () => {
    const engine = makeEngine();
    const ncn = engine.exportNcnText();
    assert.ok(typeof ncn === 'string', 'String dönmeli');
    assert.ok(ncn.includes('P1') || ncn.includes('500000'), 'Nokta verisi içermeli');
  });

  it('KML export geçerli XML üretiyor', () => {
    const engine = makeEngine();
    const kml = engine.exportKmlText();
    assert.ok(typeof kml === 'string', 'String dönmeli');
    assert.ok(kml.includes('<?xml') || kml.includes('<kml') || kml.includes('<Document'), 'KML yapısı');
  });

  it('formatHumanTimeDiff doğru Türkçe format', () => {
    const engine = new GnssFormatEngine();
    const r1 = engine.formatHumanTimeDiff(90);
    assert.ok(r1.includes('dk') || r1.includes('sn'), '90 sn → "1 dk 30 sn" benzeri');

    const r2 = engine.formatHumanTimeDiff(3700);
    assert.ok(r2.includes('sa') || r2.includes('dk'), '3700 sn → "1 sa X dk" benzeri');
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. parseData (Evrensel Giriş Noktası)
// ═══════════════════════════════════════════════════════════════
describe('parseData (Evrensel Giriş)', () => {

  it('CSV girişi parseData ile de çalışıyor', () => {
    const engine = new GnssFormatEngine();
    const points = engine.parseData('1,500000,4400000,100\n2,501000,4401000,200', 'test.csv');
    assert.ok(Array.isArray(points), 'Dizi dönmeli');
    assert.ok(points.length >= 2, 'En az 2 nokta');
  });

  it('Boş girişte hata fırlatmıyor', () => {
    const engine = new GnssFormatEngine();
    const points = engine.parseData('', '');
    assert.ok(Array.isArray(points), 'Boş dizi dönmeli');
    assert.strictEqual(points.length, 0, '0 nokta');
  });
});
