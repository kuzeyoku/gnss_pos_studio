const GnssFormatEngine = require('../web/js/modules/gnssFormatEngine.js');
const Rw5CadastreEngine = require('../web/js/modules/rw5CadastreModule.js');

console.log("=== RW5 EASTING / ELEVATION AYRIŞTIRMA TESTİ ===");

const engine = new GnssFormatEngine();

const sampleRw5 = `
--SurvCE Version 6.0
JB,NMTest,DT08-27-2026,TM10:00:00
GPS,PN1,LA39.551234567,LN32.511234567,EL950.120,--CORS
GS,PN1,N 4410200.120,E 485100.230,EL950.120,--Base
--HSDV:0.005,VSDV:0.008,STATUS:FIXED,SATS:30,PDOP:1.1
GS,PN2,N:4410300.500,E:485200.800,EL:960.250,--Base2
--HSDV:0.006,VSDV:0.009,STATUS:FIXED,SATS:28,PDOP:1.2
`;

const points = engine.parseRw5(sampleRw5);
console.log("Ayrıştırılan Noktalar:", points.length);

let passed = true;
points.forEach((pt, i) => {
  console.log(`\nNokta ${pt.pn}:`);
  console.log(`  Easting (Sağa / Y):   ${pt.e} (Beklenen: ~485000)`);
  console.log(`  Northing (Yukarı / X): ${pt.n} (Beklenen: ~4410000)`);
  console.log(`  Kot (H / Elipsoit):   ${pt.h} (Beklenen: ~950-960)`);

  if (pt.e < 100000 || pt.e > 900000) {
    console.error(`❌ HATA: Nokta ${pt.pn} için Easting (${pt.e}) hatalı! Kot değeri (${pt.h}) Easting yerine yazılmış olabilir!`);
    passed = false;
  } else if (pt.n < 3000000 || pt.n > 5000000) {
    console.error(`❌ HATA: Nokta ${pt.pn} için Northing (${pt.n}) hatalı!`);
    passed = false;
  } else if (pt.h < 500 || pt.h > 2000) {
    console.error(`❌ HATA: Nokta ${pt.pn} için Kot (${pt.h}) hatalı!`);
    passed = false;
  } else {
    console.log(`  ✅ Nokta ${pt.pn} koordinat ve kot ayrıştırması KUSURSUZ!`);
  }
});

if (passed) {
  console.log("\n🎉 TEST BAŞARILI: Easting (Sağa Değer), Northing (Yukarı Değer) ve Kot (Elevation) tam doğru ayrıştırılıyor!");
} else {
  console.error("\n❌ TEST BAŞARISIZ!");
  process.exit(1);
}
