/**
 * Tg20GeoidEngine Unit Tests
 * HGM TG-20 Türkiye Hibrit Jeoit Modeli & Kot İndirgemesi (H = h - N)
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Tg20GeoidEngine, GeodesyEngine } = require('./test-helper.js');

function assertClose(actual, expected, tolerance, msg) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tolerance, `${msg}: ${actual} ≠ ${expected} (fark: ${diff})`);
}

const tg20 = new Tg20GeoidEngine();
const geodesy = new GeodesyEngine();

// ═══════════════════════════════════════════════════════════════
// 1. Model Yükleme ve Sınırlar
// ═══════════════════════════════════════════════════════════════
describe('TG-20 Model Yükleme ve Sınırlar', () => {

  it('TG-20 modeli yüklü ve geçerli', () => {
    assert.ok(tg20.isLoaded, 'TG-20 modeli belleğe yüklü');
    assert.strictEqual(tg20.minLat, 35.5, 'minLat 35.5');
    assert.strictEqual(tg20.maxLat, 42.5, 'maxLat 42.5');
    assert.strictEqual(tg20.minLon, 25.5, 'minLon 25.5');
    assert.strictEqual(tg20.maxLon, 45.0, 'maxLon 45.0');
  });

  it('Türkiye sınırları dışındaki koordinatlar için null döner', () => {
    assert.strictEqual(tg20.getGeoidHeight(50.0, 10.0), null, 'Almanya → null');
    assert.strictEqual(tg20.getGeoidHeight(30.0, 32.0), null, 'Mısır/Akdeniz güneyi → null');
    assert.strictEqual(tg20.getGeoidHeight(40.0, 20.0), null, 'Yunanistan batısı → null');
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Farklı Bölgelerde Jeoit Ondülasyonu (N) Doğrulaması
// ═══════════════════════════════════════════════════════════════
describe('Bölgesel Jeoit Ondülasyonu (N)', () => {

  it('İç Anadolu (Ankara: 39.9334° N, 32.8597° E) → N ≈ 36.3m', () => {
    const N = tg20.getGeoidHeight(39.9334, 32.8597);
    assert.ok(N !== null, 'N null olmamalı');
    assert.ok(N >= 34.0 && N <= 38.0, `Ankara N (${N.toFixed(3)}m) 34-38m aralığında`);
  });

  it('Marmara (İstanbul: 41.0082° N, 28.9784° E) → N ≈ 36.8m', () => {
    const N = tg20.getGeoidHeight(41.0082, 28.9784);
    assert.ok(N !== null, 'N null olmamalı');
    assert.ok(N >= 35.0 && N <= 40.0, `İstanbul N (${N.toFixed(3)}m) 35-40m aralığında`);
  });

  it('Ege (İzmir: 38.4192° N, 27.1287° E) → N ≈ 35.8m', () => {
    const N = tg20.getGeoidHeight(38.4192, 27.1287);
    assert.ok(N !== null, 'N null olmamalı');
    assert.ok(N >= 33.0 && N <= 38.0, `İzmir N (${N.toFixed(3)}m) 33-38m aralığında`);
  });

  it('Karadeniz (Trabzon: 41.0027° N, 39.7168° E) → N ≈ 25.1m', () => {
    const N = tg20.getGeoidHeight(41.0027, 39.7168);
    assert.ok(N !== null, 'N null olmamalı');
    assert.ok(N >= 20.0 && N <= 30.0, `Trabzon N (${N.toFixed(3)}m) 20-30m aralığında`);
  });

  it('Güneydoğu (Diyarbakır: 37.9144° N, 40.2306° E) → N ≈ 24.6m', () => {
    const N = tg20.getGeoidHeight(37.9144, 40.2306);
    assert.ok(N !== null, 'N null olmamalı');
    assert.ok(N >= 20.0 && N <= 30.0, `Diyarbakır N (${N.toFixed(3)}m) 20-30m aralığında`);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Kot İndirgemesi (H = h - N)
// ═══════════════════════════════════════════════════════════════
describe('Ortometrik Kot İndirgemesi (H = h - N)', () => {

  it('reduceHeight: H = h - N bağıntısı tam sağlanıyor', () => {
    const lat = 39.9334, lon = 32.8597, h = 1000.0;
    const res = tg20.reduceHeight(lat, lon, h);
    assert.ok(res.inBounds, 'Nokta model sınırları içinde');
    assertClose(res.H, h - res.N, 1e-4, 'H = h - N');
    assertClose(res.h, h, 1e-4, 'Elipsoit kotu korundu');
  });

  it('reduceHeight: model dışı noktada inBounds false', () => {
    const res = tg20.reduceHeight(55.0, 10.0, 100.0);
    assert.strictEqual(res.inBounds, false, 'Model dışı nokta');
    assert.strictEqual(res.N, null, 'N null');
    assert.strictEqual(res.H, 100.0, 'H elipsoit kotuna eşit kalır');
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Enterpolasyon Detayları (Grid Düğümleri ve Ağırlıklar)
// ═══════════════════════════════════════════════════════════════
describe('Bilineer Enterpolasyon Düğümleri', () => {

  it('getGeoidInterpolationDetails: 4 köşe düğümü ve ağırlık toplamı = 1.0', () => {
    const details = tg20.getGeoidInterpolationDetails(39.9334, 32.8597);
    assert.ok(details, 'Detay nesnesi döndü');
    assert.ok(details.nodes, '4 köşe düğümü mevcut');
    assert.ok(details.nodes.nw && details.nodes.ne && details.nodes.sw && details.nodes.se);

    // Ağırlıkların toplamı 1.0 olmalı
    const weightSum = details.nodes.nw.weight + details.nodes.ne.weight + details.nodes.sw.weight + details.nodes.se.weight;
    assertClose(weightSum, 1.0, 1e-6, 'Ağırlıklar toplamı = 1.0');
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. TM Projeksiyonundan Kot İndirgeme
// ═══════════════════════════════════════════════════════════════
describe('TM Koordinatından İndirgeme', () => {

  it('reduceHeightFromTM: TM koordinatından H ve N hesaplanıyor', () => {
    // Ankara civarı TM33 koordinatları (EPSG:5255 -> TUREF TM33)
    const res = tg20.reduceHeightFromTM(488007, 4422143, 950.0, 'EPSG:5255', geodesy);
    assert.ok(res.inBounds, 'Sınır içinde');
    assert.ok(res.N > 30 && res.N < 40, 'N değeri makul');
    assertClose(res.H, 950.0 - res.N, 1e-4, 'H = h - N');
  });

  it('batchReducePoints: toplu nokta listesi indirgeniyor', () => {
    const points = [
      { name: '1', c1: 488000, c2: 4422000, h: 900 },
      { name: '2', c1: 488100, c2: 4422100, h: 910 },
      { name: '3', c1: 488200, c2: 4422200, h: 920 },
    ];
    const results = tg20.batchReducePoints(points, 'EPSG:5255', geodesy);
    assert.strictEqual(results.length, 3, '3 nokta dönmeli');
    assert.ok(results.every(p => p.H !== undefined && p.N !== undefined), 'Her noktada H ve N var');
  });
});
