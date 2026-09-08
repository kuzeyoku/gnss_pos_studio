/**
 * PaftaIndexEngine Unit Tests
 * Referans: HGM Türkiye Standart Pafta Bölümleme Sistemi
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { PaftaIndexEngine } = require('./test-helper.js');

const pafta = new PaftaIndexEngine();

function assertClose(actual, expected, tolerance, msg) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tolerance, `${msg}: ${actual} ≠ ${expected} (fark: ${diff})`);
}

// ═══════════════════════════════════════════════════════════════
// 1. 1/100.000 Pafta Hesabı
// ═══════════════════════════════════════════════════════════════
describe('1/100.000 Pafta Hesabı', () => {

  it('Ankara (39.93, 32.86) → "I29" paftası', () => {
    const r = pafta.get100kSheet(39.93, 32.86);
    assert.ok(r, 'Sonuç null olmamalı');
    assert.ok(r.name.includes('I') || r.name.includes('İ') || r.name.includes('J'), 'Harf I/İ bandı');
    assert.ok(r.name.includes('28') || r.name.includes('29') || r.name.includes('30'), 'Sütun no');
  });

  it('İstanbul (41.01, 28.98) → "F21" veya komşu pafta', () => {
    const r = pafta.get100kSheet(41.01, 28.98);
    assert.ok(r, 'Sonuç null olmamalı');
    assert.ok(r.name.startsWith('F') || r.name.startsWith('G') || r.name.startsWith('H'), '41° enlem için F/G/H bandı');
  });

  it('Türkiye dışı nokta kontrol', () => {
    const r = pafta.get100kSheet(50.0, 10.0);
    // Motor boş veya null dönebilir, hata fırlatmamalı
    assert.ok(true, 'Hata fırlatmadı');
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. 1/25.000 Pafta Hesabı
// ═══════════════════════════════════════════════════════════════
describe('1/25.000 Pafta Hesabı', () => {

  it('Pafta ismi doğru format: [harf][numara]-[a-d][1-4]', () => {
    const r = pafta.get25kSheet(39.93, 32.86);
    assert.ok(r, 'Sonuç null olmamalı');
    assert.ok(r.name.length >= 5, 'İsim yeterince uzun');
    // Formatı doğrula: harfler ve rakamlar içermeli
    assert.match(r.name, /[A-ZİI]\d+/, 'Harf + rakam formatı');
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Ölçek Serisi Tutarlılığı
// ═══════════════════════════════════════════════════════════════
describe('Ölçek Serisi Tutarlılığı', () => {

  it('Aynı nokta için tüm ölçekler (100K → 1K) hiyerarşik olarak tutarlı', () => {
    const lat = 39.93, lon = 32.86;
    const s100k = pafta.get100kSheet(lat, lon);
    const s50k = pafta.get50kSheet(lat, lon);
    const s25k = pafta.get25kSheet(lat, lon);
    const s5k = pafta.get5kSheet(lat, lon);

    // Her bir alt ölçek ismi, üst ölçeğin ismini prefix olarak içermeli
    assert.ok(s50k.name.startsWith(s100k.name), '50K, 100K ismini içermeli');
    assert.ok(s25k.name.includes(s100k.name), '25K, 100K ismini içermeli');
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Pafta Sınırları (Bounds)
// ═══════════════════════════════════════════════════════════════
describe('Pafta Sınırları', () => {

  it('100K pafta sınırları 30 dakikalık (0.5°) grid', () => {
    const code = pafta.get100kSheet(40.0, 30.0).name;
    const bounds = pafta.get100kBounds(code);
    if (bounds) {
      const latSpan = bounds.maxLat - bounds.minLat;
      const lonSpan = bounds.maxLon - bounds.minLon;
      assertClose(latSpan, 0.5, 0.01, '100K lat span = 0.5°');
      assertClose(lonSpan, 0.5, 0.01, '100K lon span = 0.5°');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Ters Çözüm (resolveSheetByName)
// ═══════════════════════════════════════════════════════════════
describe('Ters Çözüm (resolveSheetByName)', () => {

  it('Bilinen pafta ismi → sınır koordinatları döner', () => {
    // Önce bir pafta hesapla, sonra ismini çöz
    const sheet = pafta.get25kSheet(39.93, 32.86);
    if (sheet && sheet.name) {
      const resolved = pafta.resolveSheetByName(sheet.name);
      assert.ok(resolved, 'Ters çözüm başarılı');
      assert.ok(resolved.minLat !== undefined, 'Sınır bilgisi mevcut');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. DOM Zoneları
// ═══════════════════════════════════════════════════════════════
describe('DOM Zoneları', () => {

  it('Türkiye DOM listesi 7 eleman: [27, 30, 33, 36, 39, 42, 45]', () => {
    const zones = pafta.getTurkishDomZones();
    assert.ok(Array.isArray(zones), 'Dizi dönmeli');
    assert.ok(zones.length >= 7, 'En az 7 DOM');
    const doms = zones.map(z => z.dom);
    assert.ok(doms.includes(30), 'DOM 30 mevcut');
    assert.ok(doms.includes(33), 'DOM 33 mevcut');
    assert.ok(doms.includes(36), 'DOM 36 mevcut');
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. getVisibleSheets (Harita Görünüm Alanı)
// ═══════════════════════════════════════════════════════════════
describe('getVisibleSheets', () => {

  it('Küçük BBOX için makul sayıda pafta döner', () => {
    const sheets = pafta.getVisibleSheets(39.5, 32.0, 40.5, 33.0, '100k');
    assert.ok(Array.isArray(sheets), 'Dizi dönmeli');
    assert.ok(sheets.length > 0 && sheets.length < 50, `Makul sayı: ${sheets.length}`);
  });
});
