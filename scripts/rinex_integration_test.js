const { RinexPowerEngine, RinexMergerEngine } = require('../web/js/modules/rinexPowerEngine.js');

console.log("=== RINEX MODÜLÜ ENTEGRASYON TESTİ BAŞLATILIYOR ===");

let passed = 0;
let total = 0;
function test(cond, name, info = "") {
  total++;
  if (cond) {
    console.log(`✅ [GEÇTİ] ${name} ${info}`);
    passed++;
  } else {
    console.error(`❌ [BAŞARISIZ] ${name} ${info}`);
  }
}

const rinexEngine = new RinexPowerEngine();

// 1. RINEX Başlık ve Kalite Analizi Mock
const mockRinexObs = `     3.04           OBSERVATION DATA    M: Mixed            RINEX VERSION / TYPE
GNSS WEB TOOLBOX    MERGED IN BROWSER   2026-08-27 UTC      PGM / RUN BY / DATE 
ANKR                                                        MARKER NAME         
  2026     8    27    10     0    0.0000000     GPS         TIME OF FIRST OBS   
  2026     8    27    12     0    0.0000000     GPS         TIME OF LAST OBS    
    1.0000                                                  INTERVAL            
C1C L1C D1C S1C C2W L2W D2W S2W                             SYS / # / OBS TYPES 
                                                            END OF HEADER
> 2026 08 27 10 00 00.0000000  0 12
G01  22450123.456       117976234.123           3456.789             48.500
G02  21345678.901       112173456.789           2345.678             46.200
`;

const parsedInfo = rinexEngine.inspectHeader(mockRinexObs);
test(parsedInfo && Math.abs(parsedInfo.version - 3.04) < 1e-3, "RinexPowerEngine: inspectHeader() Sürüm Tespiti", `Version=${parsedInfo?.version}`);
test(parsedInfo && parsedInfo.markerName === "ANKR", "RinexPowerEngine: inspectHeader() İstasyon Adı", `Station=${parsedInfo?.markerName}`);

// 2. PPK Zaman Örtüşme Denetimi Testi
const baseTime = {
  start: new Date(Date.UTC(2026, 7, 27, 9, 30, 0)),
  end: new Date(Date.UTC(2026, 7, 27, 13, 0, 0))
};
const roverTime = {
  start: new Date(Date.UTC(2026, 7, 27, 10, 0, 0)),
  end: new Date(Date.UTC(2026, 7, 27, 11, 30, 0))
};

const ppkOverlap = rinexEngine.inspectPpkOverlap(baseTime, roverTime);
test(ppkOverlap && ppkOverlap.overlapPct === 100, "RinexPowerEngine: inspectPpkOverlap() %100 Kapsama", `Örtüşme: %${ppkOverlap?.overlapPct}`);

console.log(`\n=== RINEX TESTİ SONUCU: ${passed} / ${total} TEST BAŞARILI ===`);
