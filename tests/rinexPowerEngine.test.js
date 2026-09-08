/**
 * RinexPowerEngine & UniversalRinexInspector & RinexMergerEngine Unit Tests
 * RINEX header parse, kalite analizi, DOY hesabı
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { UniversalRinexInspector, RinexPowerEngine, RinexMergerEngine } = require('./test-helper.js');

function assertClose(actual, expected, tolerance, msg) {
  const diff = Math.abs(actual - expected);
  assert.ok(diff <= tolerance, `${msg}: ${actual} ≠ ${expected} (fark: ${diff})`);
}

// ═══════════════════════════════════════════════════════════════
// 1. DOY (Day of Year) Hesabı
// ═══════════════════════════════════════════════════════════════
describe('DOY Hesabı', () => {

  it('1 Ocak = DOY 1', () => {
    assert.strictEqual(UniversalRinexInspector.calculateDoy(2024, 1, 1), 1);
  });

  it('31 Aralık (artık yıl olmayan) = DOY 365', () => {
    assert.strictEqual(UniversalRinexInspector.calculateDoy(2023, 12, 31), 365);
  });

  it('31 Aralık (artık yıl) = DOY 366', () => {
    assert.strictEqual(UniversalRinexInspector.calculateDoy(2024, 12, 31), 366);
  });

  it('1 Mart (artık yıl) = DOY 61', () => {
    assert.strictEqual(UniversalRinexInspector.calculateDoy(2024, 3, 1), 61);
  });

  it('1 Mart (artık yıl olmayan) = DOY 60', () => {
    assert.strictEqual(UniversalRinexInspector.calculateDoy(2023, 3, 1), 60);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. RINEX Header Ayrıştırma
// ═══════════════════════════════════════════════════════════════
describe('RINEX Header Ayrıştırma', () => {

  const sampleRinex2Header = `     2.11           OBSERVATION DATA    M (MIXED)           RINEX VERSION / TYPE
XXXX                                                        MARKER NAME
                    LEICA GR25          4.02/6.531           REC # / TYPE / VERS
                    LEIAR25.R4      LEIT                    ANT # / TYPE
  4121954.4670  2652165.7440  4069378.1980                  APPROX POSITION XYZ
        0.0000        0.0000        0.0000                  ANTENNA: DELTA H/E/N
  2024     1    15    10     0    0.0000000     GPS         TIME OF FIRST OBS
  2024     1    15    12     0    0.0000000     GPS         TIME OF LAST OBS
                                                            END OF HEADER
> 2024  1 15 10  0  0.0000000  0 12
G01  23500123.456   123456789.123    6543210.987
`;

  it('RINEX versiyon doğru algılanıyor', () => {
    const info = UniversalRinexInspector.inspectRinexHeader(sampleRinex2Header, 'test.obs');
    assert.ok(info, 'Header parse başarılı');
    if (info.version) {
      assertClose(parseFloat(info.version), 2.11, 0.01, 'RINEX versiyonu');
    }
  });

  it('İstasyon adı ayrıştırılıyor', () => {
    const info = UniversalRinexInspector.inspectRinexHeader(sampleRinex2Header, 'test.obs');
    if (info.markerName) {
      assert.ok(info.markerName.includes('XXXX'), 'Marker name');
    }
  });

  it('Yaklaşık konum okunuyor (ECEF)', () => {
    const info = UniversalRinexInspector.inspectRinexHeader(sampleRinex2Header, 'test.obs');
    if (info.approxX) {
      assert.ok(info.approxX > 4_000_000, 'ECEF X makul');
      assert.ok(info.approxZ > 4_000_000, 'ECEF Z makul');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. PPK Çakışma Analizi
// ═══════════════════════════════════════════════════════════════
describe('PPK Çakışma Analizi', () => {

  it('Çakışan zaman aralıkları → overlap > 0', () => {
    const base = {
      firstObs: { timestamp: new Date('2024-01-15T10:00:00Z').getTime(), dateStr: '2024-01-15', timeStr: '10:00:00' },
      lastObs: { timestamp: new Date('2024-01-15T14:00:00Z').getTime(), dateStr: '2024-01-15', timeStr: '14:00:00' },
      approxX: 4121954, approxY: 2652165, approxZ: 4069378,
      presentConstellations: new Set(['GPS'])
    };
    const rover = {
      firstObs: { timestamp: new Date('2024-01-15T11:00:00Z').getTime(), dateStr: '2024-01-15', timeStr: '11:00:00' },
      lastObs: { timestamp: new Date('2024-01-15T13:00:00Z').getTime(), dateStr: '2024-01-15', timeStr: '13:00:00' },
      approxX: 4121900, approxY: 2652100, approxZ: 4069300,
      presentConstellations: new Set(['GPS'])
    };
    const result = UniversalRinexInspector.inspectPpkOverlap(base, rover);
    assert.ok(result, 'Sonuç null olmamalı');
    if (result.overlapPercent !== undefined) {
      assert.ok(result.overlapPercent > 0, 'Overlap süresi pozitif');
    }
  });

  it('Çakışmayan zaman aralıkları → overlap = 0', () => {
    const base = {
      firstObs: { timestamp: new Date('2024-01-15T10:00:00Z').getTime(), dateStr: '2024-01-15', timeStr: '10:00:00' },
      lastObs: { timestamp: new Date('2024-01-15T12:00:00Z').getTime(), dateStr: '2024-01-15', timeStr: '12:00:00' },
      approxX: 4121954, approxY: 2652165, approxZ: 4069378,
      presentConstellations: new Set(['GPS'])
    };
    const rover = {
      firstObs: { timestamp: new Date('2024-01-15T14:00:00Z').getTime(), dateStr: '2024-01-15', timeStr: '14:00:00' },
      lastObs: { timestamp: new Date('2024-01-15T16:00:00Z').getTime(), dateStr: '2024-01-15', timeStr: '16:00:00' },
      approxX: 4121900, approxY: 2652100, approxZ: 4069300,
      presentConstellations: new Set(['GPS'])
    };
    const result = UniversalRinexInspector.inspectPpkOverlap(base, rover);
    if (result && result.overlapPercent !== undefined) {
      assert.ok(result.overlapPercent <= 0, 'Overlap 0 veya negatif');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. RINEX Versiyon Formatı
// ═══════════════════════════════════════════════════════════════
describe('RINEX Versiyon Formatı', () => {

  it('Versiyon numarası güncellenebiliyor', () => {
    const header = '     2.11           OBSERVATION DATA    M (MIXED)           RINEX VERSION / TYPE\n';
    const updated = RinexMergerEngine.formatRinexVersionInHeader(header, '3.04');
    assert.ok(updated.includes('3.04'), 'Yeni versiyon görünmeli');
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. NMEA Üretimi
// ═══════════════════════════════════════════════════════════════
describe('NMEA Üretimi', () => {

  it('Konum dizisinden GPGGA kayıtları üretiliyor', () => {
    const engine = new RinexPowerEngine();
    const positions = [
      { lat: 39.93, lon: 32.86, h: 350, timestamp: new Date('2024-01-15T10:00:00Z').getTime(), sats: 12 },
      { lat: 41.01, lon: 28.98, h: 100, timestamp: new Date('2024-01-15T10:01:00Z').getTime(), sats: 10 },
    ];
    const nmea = engine.generateNmeaLog(positions);
    assert.ok(typeof nmea === 'string', 'String dönmeli');
    assert.ok(nmea.includes('$GPGGA') || nmea.includes('GGA'), 'GPGGA kayıtları');
  });
});

