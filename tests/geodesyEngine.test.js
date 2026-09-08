/**
 * GeodesyEngine Unit Tests
 * Referans koordinatlar: TKGM / HGM resmi dönüşüm örnekleri ve bilinen jeodezik değerler
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { GeodesyEngine } = require('./test-helper.js');

const geo = new GeodesyEngine();

// ───── Tolerans Yardımcıları ─────
function assertClose(actual, expected, tolerance, msg) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tolerance, `${msg}: ${actual} ≠ ${expected} (fark: ${diff}, tolerans: ${tolerance})`);
}

// ═══════════════════════════════════════════════════════════════
// 1. Transverse Mercator Projeksiyonu (Düz ve Ters)
// ═══════════════════════════════════════════════════════════════
describe('Transverse Mercator Projeksiyonu', () => {

  it('Ankara (39.9334° N, 32.8597° E) → TUREF TM30 düzlem koordinatları', () => {
    const r = geo.forwardTM(39.9334, 32.8597, 30);
    // Ankara civarı bilinen yaklaşık değerler
    assertClose(r.easting, 744456, 500, 'Easting (Y)');   // ~744xxx
    assertClose(r.northing, 4426052, 500, 'Northing (X)'); // ~4426xxx
  });

  it('Ankara → TUREF TM33 (farklı DOM ile)', () => {
    const r = geo.forwardTM(39.9334, 32.8597, 33);
    assertClose(r.easting, 488007, 500, 'Easting TM33');
    assertClose(r.northing, 4422143, 500, 'Northing TM33');
  });

  it('Düz ↔ Ters TM round-trip (mm hassasiyet)', () => {
    const lat0 = 41.0082, lon0 = 28.9784;
    const fwd = geo.forwardTM(lat0, lon0, 30);
    const inv = geo.inverseTM(fwd.easting, fwd.northing, 30);
    assertClose(inv.lat, lat0, 1e-8, 'Round-trip lat');
    assertClose(inv.lon, lon0, 1e-8, 'Round-trip lon');
  });

  it('ED50/Hayford TM round-trip', () => {
    const lat0 = 39.0, lon0 = 36.0;
    const fwd = geo.forwardTM(lat0, lon0, 36, 1.0, true);
    const inv = geo.inverseTM(fwd.easting, fwd.northing, 36, 1.0, true);
    assertClose(inv.lat, lat0, 1e-8, 'Hayford round-trip lat');
    assertClose(inv.lon, lon0, 1e-8, 'Hayford round-trip lon');
  });

  it('wgs84ToTurefTM wrapper çalışıyor', () => {
    const r = geo.wgs84ToTurefTM(39.9334, 32.8597);
    assert.ok(r.easting > 0, 'Easting pozitif olmalı');
    assert.ok(r.northing > 0, 'Northing pozitif olmalı');
  });

  it('turefTMToWgs84 wrapper çalışıyor', () => {
    const fwd = geo.wgs84ToTurefTM(40.0, 30.0, 30);
    const inv = geo.turefTMToWgs84(fwd.easting, fwd.northing, 30);
    assertClose(inv.lat, 40.0, 1e-7, 'Wrapper round-trip lat');
    assertClose(inv.lon, 30.0, 1e-7, 'Wrapper round-trip lon');
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. ECEF ↔ Coğrafi Dönüşüm (Bowring)
// ═══════════════════════════════════════════════════════════════
describe('ECEF Kartezyen Dönüşümleri', () => {

  it('Coğrafi → ECEF → Coğrafi round-trip (GRS80)', () => {
    const lat0 = 39.0, lon0 = 35.0, h0 = 1000;
    const ecef = geo.geodeticToEcef(lat0, lon0, h0, false);
    const back = geo.ecefToGeodetic(ecef.x, ecef.y, ecef.z, false);
    assertClose(back.lat, lat0, 1e-8, 'ECEF round-trip lat');
    assertClose(back.lon, lon0, 1e-8, 'ECEF round-trip lon');
    assertClose(back.h, h0, 0.001, 'ECEF round-trip h (mm)');
  });

  it('Coğrafi → ECEF → Coğrafi round-trip (Hayford)', () => {
    const lat0 = 41.5, lon0 = 29.0, h0 = 500;
    const ecef = geo.geodeticToEcef(lat0, lon0, h0, true);
    const back = geo.ecefToGeodetic(ecef.x, ecef.y, ecef.z, true);
    assertClose(back.lat, lat0, 1e-8, 'Hayford ECEF lat');
    assertClose(back.lon, lon0, 1e-8, 'Hayford ECEF lon');
    assertClose(back.h, h0, 0.001, 'Hayford ECEF h');
  });

  it('Bilinen ECEF değeri doğrulaması (Ankara yaklaşık)', () => {
    // Ankara: lat ~40, lon ~33 → ECEF X, Y, Z bilinen büyüklük sırasında
    const ecef = geo.geodeticToEcef(40.0, 33.0, 0);
    assert.ok(ecef.x > 4_000_000 && ecef.x < 5_000_000, 'X aralığı');
    assert.ok(ecef.y > 2_000_000 && ecef.y < 3_500_000, 'Y aralığı');
    assert.ok(ecef.z > 3_500_000 && ecef.z < 4_500_000, 'Z aralığı');
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Datum Dönüşümü (7-Parametreli Bursa-Wolf)
// ═══════════════════════════════════════════════════════════════
describe('Datum Dönüşümü (ITRF96 ↔ ED50)', () => {

  it('ITRF96 → ED50 → ITRF96 round-trip', () => {
    const lat0 = 39.5, lon0 = 32.0, h0 = 500;
    const ed50 = geo.transformDatum(lat0, lon0, h0, 'ITRF96', 'ED50');
    const back = geo.transformDatum(ed50.lat, ed50.lon, ed50.h, 'ED50', 'ITRF96');
    assertClose(back.lat, lat0, 1e-6, 'Datum round-trip lat');
    assertClose(back.lon, lon0, 1e-6, 'Datum round-trip lon');
    assertClose(back.h, h0, 0.5, 'Datum round-trip h');
  });

  it('ITRF96 → ED50 fark büyüklüğü makul (Türkiye ortalaması ~3-5 arcsec)', () => {
    const lat0 = 39.0, lon0 = 35.0;
    const ed50 = geo.transformDatum(lat0, lon0, 0, 'ITRF96', 'ED50');
    const dLat = Math.abs(ed50.lat - lat0) * 3600; // arcseconds
    const dLon = Math.abs(ed50.lon - lon0) * 3600;
    assert.ok(dLat > 0 && dLat < 20, `dLat arcsec makul: ${dLat}`);
    assert.ok(dLon > 0 && dLon < 20, `dLon arcsec makul: ${dLon}`);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Vincenty Ters Jeodezi (Mesafe + Azimut)
// ═══════════════════════════════════════════════════════════════
describe('Vincenty Ters Jeodezi', () => {

  it('Ankara → İstanbul mesafesi ~350 km', () => {
    const r = geo.vincentyInverse(39.9334, 32.8597, 41.0082, 28.9784);
    assertClose(r.distanceM, 350_000, 5_000, 'Ankara→İst mesafe');
    assert.ok(r.azimuth12Deg > 250 && r.azimuth12Deg < 320, 'Azimut batı yönünde');
  });

  it('Aynı nokta mesafesi = 0', () => {
    const r = geo.vincentyInverse(40.0, 30.0, 40.0, 30.0);
    assertClose(r.distanceM, 0, 0.001, 'Aynı nokta mesafesi');
  });

  it('Ekvator üzerinde 1° boylam farkı ≈ 111.32 km', () => {
    const r = geo.vincentyInverse(0.0, 0.0, 0.0, 1.0);
    assertClose(r.distanceM, 111_320, 200, 'Ekvator 1° boylam');
  });

  it('Hayford elipsoidi ile de çalışıyor', () => {
    const r = geo.vincentyInverse(39.0, 32.0, 40.0, 33.0, 'HAYFORD');
    assert.ok(r.distanceM > 100_000, 'Hayford mesafe pozitif');
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Vincenty Düz Jeodezi (Direct)
// ═══════════════════════════════════════════════════════════════
describe('Vincenty Düz Jeodezi', () => {

  it('Bilinen mesafe ve azimutla round-trip', () => {
    const lat1 = 39.9334, lon1 = 32.8597;
    const inv = geo.vincentyInverse(lat1, lon1, 41.0082, 28.9784);
    const dir = geo.vincentyDirect(lat1, lon1, inv.azimuth12Deg, inv.distanceM);
    assertClose(dir.lat2, 41.0082, 1e-4, 'Direct lat');
    assertClose(dir.lon2, 28.9784, 1e-4, 'Direct lon');
  });

  it('0 mesafe → başlangıç noktası dönmeli', () => {
    const r = geo.vincentyDirect(40.0, 30.0, 45, 0);
    assertClose(r.lat2, 40.0, 1e-8, 'Sıfır mesafe lat');
    assertClose(r.lon2, 30.0, 1e-8, 'Sıfır mesafe lon');
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. Grid (Düzlem) Mesafe ve Azimut
// ═══════════════════════════════════════════════════════════════
describe('Grid Mesafe ve Azimut', () => {

  it('1000m dE + 1000m dN = √2 × 1000 ≈ 1414.214m', () => {
    const r = geo.gridDistance(500000, 4400000, 501000, 4401000);
    assertClose(r.distance2D, 1414.2135, 0.001, '2D mesafe');
    assertClose(r.dE, 1000, 0.001, 'dE');
    assertClose(r.dN, 1000, 0.001, 'dN');
  });

  it('3B mesafe (dH = 100m)', () => {
    const r = geo.gridDistance(500000, 4400000, 501000, 4401000, 0, 100);
    assert.ok(r.distance3D > r.distance2D, '3D > 2D');
    assertClose(r.dH, 100, 0.001, 'dH');
  });

  it('Kuzey yönü azimutu = 0° / 0 grad', () => {
    const r = geo.gridAzimuth(500000, 4400000, 500000, 4401000);
    assertClose(r.azimuthDeg, 0, 0.001, 'Kuzey azimut °');
    assertClose(r.azimuthGrad, 0, 0.001, 'Kuzey azimut grad');
  });

  it('Doğu yönü azimutu = 90° / 100 grad', () => {
    const r = geo.gridAzimuth(500000, 4400000, 501000, 4400000);
    assertClose(r.azimuthDeg, 90, 0.001, 'Doğu azimut °');
    assertClose(r.azimuthGrad, 100, 0.001, 'Doğu azimut grad');
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. Gauss Alan Hesabı (Shoelace)
// ═══════════════════════════════════════════════════════════════
describe('Gauss Alan Hesabı', () => {

  it('100×100m kare = 10.000 m², çevre = 400m', () => {
    const coords = [
      { e: 500000, n: 4400000 },
      { e: 500100, n: 4400000 },
      { e: 500100, n: 4400100 },
      { e: 500000, n: 4400100 },
    ];
    const r = geo.gaussArea(coords);
    assertClose(r.areaM2, 10000, 0.001, 'Alan m²');
    assertClose(r.perimeterM, 400, 0.001, 'Çevre m');
    assert.strictEqual(r.pointCount, 4, 'Nokta sayısı');
  });

  it('Türk dönümü ve hektar dönüşümleri', () => {
    const coords = [
      { e: 0, n: 0 }, { e: 1000, n: 0 },
      { e: 1000, n: 1000 }, { e: 0, n: 1000 },
    ];
    const r = geo.gaussArea(coords);
    assertClose(r.areaM2, 1_000_000, 0.01, '1km² alan');
    assertClose(r.areaDonumTR, 1000, 0.01, '1000 Türk dönümü');
    assertClose(r.areaHektar, 100, 0.01, '100 hektar');
  });

  it('Üçgen alan (0.5 × taban × yükseklik)', () => {
    const coords = [
      { e: 0, n: 0 }, { e: 200, n: 0 }, { e: 0, n: 100 },
    ];
    const r = geo.gaussArea(coords);
    assertClose(r.areaM2, 10000, 0.01, 'Üçgen alan');
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. 2B Helmert Düzlem Dönüşüm
// ═══════════════════════════════════════════════════════════════
describe('2B Helmert Düzlem Dönüşümü', () => {

  it('Birim dönüşüm (öteleme yoksa identik sonuç)', () => {
    const pairs = [
      { y1: 100, x1: 200, y2: 100, x2: 200 },
      { y1: 300, x1: 400, y2: 300, x2: 400 },
      { y1: 500, x1: 600, y2: 500, x2: 600 },
    ];
    const h = geo.solveHelmert2D(pairs);
    assertClose(h.a, 1.0, 1e-8, 'a = 1 (ölçek=1, rotasyon=0)');
    assertClose(h.b, 0.0, 1e-8, 'b = 0');
    assertClose(h.dy0, 0.0, 1e-4, 'dy0 = 0');
    assertClose(h.dx0, 0.0, 1e-4, 'dx0 = 0');
  });

  it('Saf öteleme (dx=100, dy=200)', () => {
    const pairs = [
      { y1: 0, x1: 0, y2: 200, x2: 100 },
      { y1: 1000, x1: 0, y2: 1200, x2: 100 },
      { y1: 0, x1: 1000, y2: 200, x2: 1100 },
    ];
    const h = geo.solveHelmert2D(pairs);
    assertClose(h.dy0, 200, 0.01, 'dy0');
    assertClose(h.dx0, 100, 0.01, 'dx0');
    assertClose(h.scale_m, 1.0, 1e-6, 'Ölçek');
  });

  it('transformPointHelmert2D doğru çalışıyor', () => {
    const params = { a: 1, b: 0, dy0: 10, dx0: 20 };
    const r = geo.transformPointHelmert2D(100, 200, params);
    assertClose(r.y, 110, 0.001, 'y = y1 + dy0');
    assertClose(r.x, 220, 0.001, 'x = x1 + dx0');
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. DMS Dönüşüm Yardımcıları
// ═══════════════════════════════════════════════════════════════
describe('DMS Dönüşüm Yardımcıları', () => {

  it('decDegToDMS formatı doğru', () => {
    const dms = geo.decDegToDMS(39.92);
    assert.ok(dms.includes('39°'), 'Derece kısmı');
    assert.ok(dms.includes("'"), 'Dakika ayracı');
  });

  it('dmsToDec doğru dönüşüm', () => {
    const dec = geo.dmsToDec('39°55\'12.00"');
    assert.ok(dec !== null, 'null dönmemeli');
    assertClose(dec, 39.92, 0.01, 'DMS → decimal');
  });

  it('toDms formatı doğru', () => {
    const dms = geo.toDms(39.92, true);
    assert.ok(typeof dms === 'string', 'String dönmeli');
    assert.ok(dms.length > 5, 'Makul uzunluk');
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. Netcad .DNS Parse / Export
// ═══════════════════════════════════════════════════════════════
describe('Netcad .DNS Parse / Export', () => {

  it('Export → Parse round-trip', () => {
    const pairs = [
      { y1: 100, x1: 200, y2: 100.1, x2: 200.2 },
      { y1: 300, x1: 400, y2: 300.1, x2: 400.2 },
      { y1: 500, x1: 600, y2: 500.1, x2: 600.2 },
    ];
    const helmert = geo.solveHelmert2D(pairs);
    const dnsText = geo.exportNetcadDns(helmert, 'TEST_PROJECT');
    assert.ok(dnsText.includes('TEST_PROJECT'), 'Proje adı DNS içinde');
    const parsed = geo.parseNetcadDns(dnsText);
    assert.ok(parsed !== null, 'Parse başarılı');
    assert.ok(parsed.a !== null, 'a parametresi okundu');
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. DOM Otomatik Seçimi
// ═══════════════════════════════════════════════════════════════
describe('Otomatik DOM Seçimi', () => {

  it('Türkiye DOM serileri (27, 30, 33, 36, 39, 42, 45)', () => {
    assert.strictEqual(geo.getAutoCentralMeridian3Deg(29.0), 30, 'İstanbul → DOM 30');
    assert.strictEqual(geo.getAutoCentralMeridian3Deg(32.8), 33, 'Ankara → DOM 33');
    assert.strictEqual(geo.getAutoCentralMeridian3Deg(36.3), 36, 'Samsun → DOM 36');
    assert.strictEqual(geo.getAutoCentralMeridian3Deg(39.7), 39, 'Trabzon → DOM 39');
    assert.strictEqual(geo.getAutoCentralMeridian3Deg(44.0), 45, 'Doğu sınır → DOM 45');
    assert.strictEqual(geo.getAutoCentralMeridian3Deg(26.5), 27, 'Batı sınır → DOM 27');
  });
});

