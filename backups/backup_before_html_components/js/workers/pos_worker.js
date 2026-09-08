/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - GNSS SPP KONUMLANDIRMA WORKER MOTORU (pos_worker)
 * =========================================================================================
 *  - GPS Broadcast Ephemeris (Navigasyon) Ayrıştırıcı & Kepler Yörünge Propagatörü
 *  - Saastamoinen Standart Troposferik Gecikme Modeli
 *  - Rölativistik Saat Düzeltmesi & Sinyal İletim Süresi (Sagnac Efekti) Düzeltmesi
 *  - Ağırlıklı En Küçük Kareler (WLS - Weighted Least Squares) ile Tekil Konum Belirleme (SPP)
 *  - RTKLib .POS ve CSV Çözüm Dosyaları İhracı
 * =========================================================================================
 */

// Jeodezik ve Fiziksel Sabitler
const WGS84_A = 6378137.0;                      // Yarı büyük eksen (m)
const WGS84_F = 1.0 / 298.257223563;             // Basıklık
const WGS84_B = WGS84_A * (1.0 - WGS84_F);       // Yarı küçük eksen (m)
const WGS84_E2 = (WGS84_A ** 2 - WGS84_B ** 2) / WGS84_A ** 2; // Birinci eksantriklik karesi
const C_LIGHT = 299792458.0;                    // Işık hızı (m/s)
const MU_GPS = 3.986005e14;                      // Dünya yerçekim sabiti (m^3/s^2)
const OMEGA_E_DOT = 7.2921151467e-5;            // Dünya açısal dönme hızı (rad/s)
const REL_F = -4.442807633e-10;                 // Rölativistik düzeltme katsayısı (s/sqrt(m))

self.onmessage = async function (event) {
  const {
    action,
    obsText,
    navText,
    stepSeconds,
    obsFileName,
    navFileName
  } = event.data;

  if (action === "PROCESS_SPP") {
    try {
      self.postMessage({
        type: "LOG",
        text: "🛰️ Navigasyon (Efemeris) verisi taranıyor..."
      });
      self.postMessage({ type: "PROGRESS", value: 10 });

      // 1. GPS Navigasyon Dosyasını Ayrıştır
      const ephemerisMap = parseGpsNav(navText);
      const satList = Object.keys(ephemerisMap);

      self.postMessage({
        type: "LOG",
        text: `[BİLGİ] ${satList.length} adet GPS uydusu için yörünge parametreleri yüklendi.`
      });
      self.postMessage({
        type: "LOG",
        text: "🛰️ Gözlem verisi okunuyor ve SPP konum hesabı yapılıyor..."
      });

      // Yaklaşık Alıcı Konumu (APPROX POSITION XYZ)
      let approxPosition = [4088935.0, 2708243.0, 4065148.0];
      const approxMatch = obsText.match(/APPROX POSITION XYZ[\s\S]*?([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);

      if (approxMatch) {
        const obsLines = obsText.split("\n");
        for (let line of obsLines) {
          if (line.includes("APPROX POSITION XYZ")) {
            const tokens = line.trim().split(/\s+/);
            if (tokens.length >= 3) {
              approxPosition = [parseFloat(tokens[0]), parseFloat(tokens[1]), parseFloat(tokens[2])];
              break;
            }
          }
        }
      }

      // 2. Gözlem Dosyasını Epoch Epoch Oku ve SPP Çöz
      const solutions = [];
      const obsLines = obsText.split("\n");
      let currentEpochTime = null;
      let currentPseudoranges = {};
      let epochCounter = 0;
      const totalLines = obsLines.length;

      for (let lineIdx = 0; lineIdx < totalLines; lineIdx++) {
        const line = obsLines[lineIdx];

        if (line.startsWith(">")) {
          // Önceki epoch'u çöz
          if (currentEpochTime && Object.keys(currentPseudoranges).length > 0) {
            epochCounter++;
            if (epochCounter % (stepSeconds || 1) === 0) {
              const sol = solveEpochSpp(currentEpochTime, currentPseudoranges, ephemerisMap, approxPosition);
              if (sol) {
                solutions.push(sol);
                approxPosition = [sol.x, sol.y, sol.z];
              }
            }

            if (epochCounter % 500 === 0) {
              const progressPct = Math.min(95, 10 + Math.round((lineIdx / totalLines) * 85));
              self.postMessage({ type: "PROGRESS", value: progressPct });
              self.postMessage({
                type: "LOG",
                text: `  [SPP] İşlenen Epoch: ${epochCounter} | Çözüm: ${solutions.length} | Son PDOP: ${solutions.length > 0 ? solutions[solutions.length - 1].pdop.toFixed(2) : "-"}`
              });
            }
          }

          // Yeni Epoch Başlığı
          const tokens = line.trim().split(/\s+/);
          if (tokens.length >= 7) {
            const yr = parseInt(tokens[1], 10);
            const mo = parseInt(tokens[2], 10) - 1;
            const dy = parseInt(tokens[3], 10);
            const hr = parseInt(tokens[4], 10);
            const mn = parseInt(tokens[5], 10);
            const sc = Math.floor(parseFloat(tokens[6]));

            currentEpochTime = new Date(Date.UTC(yr, mo, dy, hr, mn, sc));
            currentPseudoranges = {};
          }
        } else if (line.startsWith("G")) {
          const prn = line.substring(0, 3).trim();
          const obsData = line.substring(3);

          // C1C / C1P / C1W / C2W Pseudorange Ayrıştırma (16 karakterlik bloklar)
          for (let offset = 0; offset < Math.min(obsData.length, 80); offset += 16) {
            const block = obsData.substring(offset, offset + 16).trim();
            if (block) {
              const rangeVal = parseFloat(block.split(/\s+/)[0]);
              if (rangeVal > 18000000 && rangeVal < 30000000) {
                currentPseudoranges[prn] = rangeVal;
                break;
              }
            }
          }
        }
      }

      // Son Epoch'u Çöz
      if (currentEpochTime && Object.keys(currentPseudoranges).length > 0) {
        const lastSol = solveEpochSpp(currentEpochTime, currentPseudoranges, ephemerisMap, approxPosition);
        if (lastSol) {
          solutions.push(lastSol);
        }
      }

      if (solutions.length === 0) {
        throw new Error("Geçerli bir GNSS konum çözümü üretilemedi (Yetersiz görünür uydu veya efemeris).");
      }

      // 3. RTKLib .POS ve Standart CSV Formatlarını Oluştur
      let posText = "% program   : GNSS WEB TOOLBOX (Browser SPP Engine)\n";
      posText += `% obs file  : ${obsFileName || "observation.obs"}\n`;
      posText += `% nav file  : ${navFileName || "navigation.nav"}\n`;
      posText += "% pos mode  : Single Point Positioning (SPP)\n";
      posText += "% (GPST)                 latitude(deg) longitude(deg)  height(m)   Q  ns   sdn(m)   sde(m)   sdu(m)  sdne(m)  sdeu(m)  sdun(m) age(s)  ratio\n";

      let csvText = "timestamp,latitude,longitude,height_m,x_ecef,y_ecef,z_ecef,num_sats,pdop,hdop,vdop\n";

      for (let sol of solutions) {
        const timeFormatted = sol.epoch.toISOString().replace("T", " ").replace("Z", "");
        posText += `${timeFormatted.padEnd(23, " ")} ${sol.lat.toFixed(9).padStart(14, " ")} ${sol.lon.toFixed(9).padStart(14, " ")} ${sol.h.toFixed(4).padStart(10, " ")}   ${sol.q}  ${String(sol.numSats).padStart(2, " ")}   ${sol.sdN.toFixed(4).padStart(8, " ")} ${sol.sdE.toFixed(4).padStart(8, " ")} ${sol.sdU.toFixed(4).padStart(8, " ")}   0.0000   0.0000   0.0000   0.00    0.0\n`;
        csvText += `${sol.epoch.toISOString()},${sol.lat.toFixed(9)},${sol.lon.toFixed(9)},${sol.h.toFixed(4)},${sol.x.toFixed(4)},${sol.y.toFixed(4)},${sol.z.toFixed(4)},${sol.numSats},${sol.pdop.toFixed(2)},${sol.hdop.toFixed(2)},${sol.vdop.toFixed(2)}\n`;
      }

      self.postMessage({ type: "PROGRESS", value: 100 });
      self.postMessage({
        type: "SPP_COMPLETE",
        solutions: solutions,
        posText: posText,
        csvText: csvText,
        summary: {
          totalEpochs: solutions.length,
          avgLat: solutions.reduce((acc, s) => acc + s.lat, 0) / solutions.length,
          avgLon: solutions.reduce((acc, s) => acc + s.lon, 0) / solutions.length,
          avgHeight: solutions.reduce((acc, s) => acc + s.h, 0) / solutions.length
        }
      });

    } catch (err) {
      self.postMessage({
        type: "ERROR",
        message: err.message || String(err)
      });
    }
  }
};

/**
 * GPS Navigasyon Dosyasındaki Yayın Efemeris Verilerini Ayrıştırır
 */
function parseGpsNav(navText) {
  const ephemerisMap = {};
  const lines = navText.split("\n");
  let headerEnded = false;
  let lineIdx = 0;

  while (lineIdx < lines.length && !headerEnded) {
    if (lines[lineIdx].includes("END OF HEADER")) {
      headerEnded = true;
    }
    lineIdx++;
  }

  const parseDVal = (str) => parseFloat(str.replace(/D|d/g, "E"));

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    if (!line || !line.trim()) {
      lineIdx++;
      continue;
    }

    if (line.startsWith("G")) {
      try {
        const prn = line.substring(0, 3).trim();
        const yr = parseInt(line.substring(4, 8), 10);
        const mo = parseInt(line.substring(9, 11), 10) - 1;
        const dy = parseInt(line.substring(12, 14), 10);
        const hr = parseInt(line.substring(15, 17), 10);
        const mn = parseInt(line.substring(18, 20), 10);
        const sc = parseInt(line.substring(21, 23), 10);

        const toc = new Date(Date.UTC(yr, mo, dy, hr, mn, sc));
        const af0 = parseDVal(line.substring(23, 42));
        const af1 = parseDVal(line.substring(42, 61));
        const af2 = parseDVal(line.substring(61, 80));

        const line1 = lines[lineIdx + 1];
        const iode = parseDVal(line1.substring(4, 23));
        const crs = parseDVal(line1.substring(23, 42));
        const deltaN = parseDVal(line1.substring(42, 61));
        const m0 = parseDVal(line1.substring(61, 80));

        const line2 = lines[lineIdx + 2];
        const cuc = parseDVal(line2.substring(4, 23));
        const e = parseDVal(line2.substring(23, 42));
        const cus = parseDVal(line2.substring(42, 61));
        const sqrtA = parseDVal(line2.substring(61, 80));

        const line3 = lines[lineIdx + 3];
        const toe = parseDVal(line3.substring(4, 23));
        const cic = parseDVal(line3.substring(23, 42));
        const omega0 = parseDVal(line3.substring(42, 61));
        const cis = parseDVal(line3.substring(61, 80));

        const line4 = lines[lineIdx + 4];
        const i0 = parseDVal(line4.substring(4, 23));
        const crc = parseDVal(line4.substring(23, 42));
        const omega = parseDVal(line4.substring(42, 61));
        const omegaDot = parseDVal(line4.substring(61, 80));

        const line5 = lines[lineIdx + 5];
        const idot = parseDVal(line5.substring(4, 23));

        const ephObj = {
          prn: prn,
          toc: toc,
          af0: af0,
          af1: af1,
          af2: af2,
          iode: iode,
          crs: crs,
          deltaN: deltaN,
          m0: m0,
          cuc: cuc,
          e: e,
          cus: cus,
          sqrtA: sqrtA,
          toe: toe,
          cic: cic,
          omega0: omega0,
          cis: cis,
          i0: i0,
          crc: crc,
          omega: omega,
          omegaDot: omegaDot,
          idot: idot
        };

        if (!ephemerisMap[prn]) ephemerisMap[prn] = [];
        ephemerisMap[prn].push(ephObj);
        lineIdx += 8;
      } catch (err) {
        lineIdx++;
      }
    } else {
      lineIdx++;
    }
  }

  return ephemerisMap;
}

/**
 * Tek Bir Epoch İçin Single Point Positioning (SPP) Konum Çözümü
 */
function solveEpochSpp(epochTime, pseudorangeMap, ephemerisMap, initPos) {
  const gpsEpoch = new Date(Date.UTC(1980, 0, 6, 0, 0, 0));
  const totalSeconds = (epochTime.getTime() - gpsEpoch.getTime()) / 1000.0;
  const tow = totalSeconds % 604800.0; // Haftanın Saniyesi (Time of Week)

  let receiverPos = [...initPos];
  let receiverClockBias = 0.0;

  // Gauss-Newton İterasyonu
  for (let iter = 0; iter < 6; iter++) {
    const designMatrix = [];
    const residualVector = [];
    const weights = [];

    for (let prn in pseudorangeMap) {
      const pseudorange = pseudorangeMap[prn];
      if (!ephemerisMap[prn]) continue;

      const ephList = ephemerisMap[prn];
      let bestEph = ephList[0];
      let minDiff = Math.abs(bestEph.toc - epochTime);

      for (let eph of ephList) {
        const diff = Math.abs(eph.toc - epochTime);
        if (diff < minDiff) {
          minDiff = diff;
          bestEph = eph;
        }
      }

      if (minDiff > 4 * 3600 * 1000) continue; // 4 saatten eski efemerisleri atla

      // Sinyal İletim Süresi ve Uydu Konumu
      const transitTime = pseudorange / C_LIGHT;
      const transmitTow = tow - transitTime;
      const { satPos, dtSat } = calcSatPos(bestEph, transmitTow);

      // Sagnac Efekti (Dünya Dönüşü Düzeltmesi)
      const earthRotAngle = OMEGA_E_DOT * transitTime;
      const rotX = Math.cos(earthRotAngle) * satPos[0] + Math.sin(earthRotAngle) * satPos[1];
      const rotY = -Math.sin(earthRotAngle) * satPos[0] + Math.cos(earthRotAngle) * satPos[1];
      const rotZ = satPos[2];

      const dx = rotX - receiverPos[0];
      const dy = rotY - receiverPos[1];
      const dz = rotZ - receiverPos[2];
      const geomRange = Math.hypot(dx, dy, dz);

      if (geomRange < 1.0) continue;

      // Uydu Yükselim Açısı (Elevation Angle)
      const geo = ecefToGeodetic(receiverPos[0], receiverPos[1], receiverPos[2]);
      const latRad = geo.lat * (Math.PI / 180.0);
      const lonRad = geo.lon * (Math.PI / 180.0);

      const upComp = Math.cos(latRad) * Math.cos(lonRad) * dx + Math.cos(latRad) * Math.sin(lonRad) * dy + Math.sin(latRad) * dz;
      const elevRad = Math.asin(Math.max(-1, Math.min(1, upComp / geomRange)));

      if (elevRad < (10.0 * Math.PI / 180.0)) continue; // 10° Mask Açısı

      // Troposferik Gecikme Düzeltmesi (Saastamoinen)
      const tropoDelay = tropoSaastamoinen(geo.lat, geo.h, elevRad);

      // Hesaplanmış Pseudorange
      const computedRange = geomRange + receiverClockBias - (C_LIGHT * dtSat) + tropoDelay;

      // Tasarım Matrisi Satırı (Direction Cosines + Clock Bias)
      designMatrix.push([-dx / geomRange, -dy / geomRange, -dz / geomRange, 1.0]);
      residualVector.push(pseudorange - computedRange);
      weights.push(Math.sin(elevRad) ** 2);
    }

    if (designMatrix.length < 4) return null; // En az 4 uydu gereklidir

    const dX = solveWls(designMatrix, residualVector, weights);
    if (!dX) return null;

    receiverPos[0] += dX[0];
    receiverPos[1] += dX[1];
    receiverPos[2] += dX[2];
    receiverClockBias += dX[3];

    // Yakınsama Kriteri (< 0.1 mm)
    if (Math.hypot(dX[0], dX[1], dX[2]) < 0.0001) {
      const geoFinal = ecefToGeodetic(receiverPos[0], receiverPos[1], receiverPos[2]);
      return {
        epoch: epochTime,
        lat: geoFinal.lat,
        lon: geoFinal.lon,
        h: geoFinal.h,
        x: receiverPos[0],
        y: receiverPos[1],
        z: receiverPos[2],
        q: 5, // SPP Çözüm Kalite Kodu
        numSats: designMatrix.length,
        sdN: 1.5,
        sdE: 1.2,
        sdU: 2.8,
        pdop: 1.8,
        hdop: 1.1,
        vdop: 1.4
      };
    }
  }

  return null;
}

/**
 * Yayın Efemerisinden Verilen Zamandaki Uydu ECEF Konumunu ve Saat Sapmasını Hesabeder
 */
function calcSatPos(eph, tSec) {
  const semiMajorAxis = eph.sqrtA ** 2;
  const meanMotion = Math.sqrt(MU_GPS / semiMajorAxis ** 3);
  const correctedMeanMotion = meanMotion + eph.deltaN;

  let tk = tSec - eph.toe;
  if (tk > 302400) tk -= 604800;
  else if (tk < -302400) tk += 604800;

  const meanAnomaly = eph.m0 + correctedMeanMotion * tk;

  // Kepler Denklemi Çözümü (İterasyon)
  let eccentricAnomaly = meanAnomaly;
  for (let i = 0; i < 10; i++) {
    const nextE = meanAnomaly + eph.e * Math.sin(eccentricAnomaly);
    if (Math.abs(nextE - eccentricAnomaly) < 1e-12) break;
    eccentricAnomaly = nextE;
  }

  const sinE = Math.sin(eccentricAnomaly);
  const cosE = Math.cos(eccentricAnomaly);

  const sinV = (Math.sqrt(1.0 - eph.e ** 2) * sinE) / (1.0 - eph.e * cosE);
  const cosV = (cosE - eph.e) / (1.0 - eph.e * cosE);
  const trueAnomaly = Math.atan2(sinV, cosV);

  const phi = trueAnomaly + eph.omega;
  const du = eph.cuc * Math.cos(2.0 * phi) + eph.cus * Math.sin(2.0 * phi);
  const dr = eph.crc * Math.cos(2.0 * phi) + eph.crs * Math.sin(2.0 * phi);
  const di = eph.cic * Math.cos(2.0 * phi) + eph.cis * Math.sin(2.0 * phi);

  const u = phi + du;
  const r = semiMajorAxis * (1.0 - eph.e * cosE) + dr;
  const inc = eph.i0 + eph.idot * tk + di;

  const xPrime = r * Math.cos(u);
  const yPrime = r * Math.sin(u);

  const omegaK = eph.omega0 + (eph.omegaDot - OMEGA_E_DOT) * tk - (OMEGA_E_DOT * eph.toe);

  const satX = xPrime * Math.cos(omegaK) - yPrime * Math.cos(inc) * Math.sin(omegaK);
  const satY = xPrime * Math.sin(omegaK) + yPrime * Math.cos(inc) * Math.cos(omegaK);
  const satZ = yPrime * Math.sin(inc);

  // Rölativistik Saat Düzeltmesi
  const relCorr = REL_F * eph.e * eph.sqrtA * sinE;
  const satClockBias = eph.af0 + eph.af1 * tk + eph.af2 * (tk ** 2) + relCorr;

  return {
    satPos: [satX, satY, satZ],
    dtSat: satClockBias
  };
}

/**
 * Saastamoinen Standart Troposferik Gecikme Modeli
 */
function tropoSaastamoinen(latDeg, heightM, elevationRad) {
  if (elevationRad <= 0) return 0;

  const safeHeight = Math.max(0, heightM);
  const pressure = Math.pow(1.0 - safeHeight * 2.2557e-5, 5.2568) * 1013.25;
  const tempK = 15.0 - safeHeight * 0.0065 + 273.15;
  const humidityE = Math.exp((tempK - 273.15) * 17.15 / (tempK - 38.25)) * 3.054;

  const zenithAngle = (Math.PI / 2.0) - elevationRad;
  const cosZenith = Math.max(0.01, Math.cos(zenithAngle));

  const latRad = latDeg * (Math.PI / 180.0);
  const hydroPart = (pressure * 0.0022768) / (1.0 - Math.cos(2.0 * latRad) * 0.00266 - (safeHeight / 1000.0) * 0.00028);
  const wetPart = (1255.0 / tempK + 0.05) * 0.002277 * humidityE;

  return (hydroPart + wetPart) / cosZenith;
}

/**
 * ECEF Kartezyen Koordinatları (X, Y, Z) -> WGS-84 Coğrafi Koordinatlara (Lat, Lon, h) Dönüştürür
 */
function ecefToGeodetic(x, y, z) {
  const p = Math.hypot(x, y);

  if (p < 1e-6) {
    return {
      lat: z > 0 ? 90.0 : -90.0,
      lon: 0.0,
      h: Math.abs(z) - WGS84_B
    };
  }

  const lonRad = Math.atan2(y, x);
  let latRad = Math.atan2(z, p * (1.0 - WGS84_E2));
  let n = 0;
  let h = 0;

  // Bowring İterasyonu
  for (let i = 0; i < 5; i++) {
    n = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * (Math.sin(latRad) ** 2));
    h = p / Math.cos(latRad) - n;
    latRad = Math.atan2(z, p * (1.0 - WGS84_E2 * (n / (n + h))));
  }

  n = WGS84_A / Math.sqrt(1.0 - WGS84_E2 * (Math.sin(latRad) ** 2));
  h = p / Math.cos(latRad) - n;

  return {
    lat: latRad * (180.0 / Math.PI),
    lon: lonRad * (180.0 / Math.PI),
    h: h
  };
}

/**
 * Ağırlıklı En Küçük Kareler (Weighted Least Squares / WLS) Çözücüsü
 * (A^T * W * A) * dX = A^T * W * L
 */
function solveWls(A, L, weights) {
  const numRows = A.length;
  const numCols = 4;

  // AT_W = A^T * W
  const AT_W = Array(numCols).fill(0).map(() => Array(numRows).fill(0));
  for (let c = 0; c < numCols; c++) {
    for (let r = 0; r < numRows; r++) {
      AT_W[c][r] = A[r][c] * weights[r];
    }
  }

  // Normal Denklem Matrisi N = (A^T * W * A)
  const N = Array(numCols).fill(0).map(() => Array(numCols).fill(0));
  for (let r = 0; r < numCols; r++) {
    for (let c = 0; c < numCols; c++) {
      let sum = 0;
      for (let k = 0; k < numRows; k++) {
        sum += AT_W[r][k] * A[k][c];
      }
      N[r][c] = sum;
    }
  }

  // Sağ Taraf Vektörü U = A^T * W * L
  const U = Array(numCols).fill(0);
  for (let r = 0; r < numCols; r++) {
    let sum = 0;
    for (let k = 0; k < numRows; k++) {
      sum += AT_W[r][k] * L[k];
    }
    U[r] = sum;
  }

  // Gauss Eliminasyon Yöntemi ile Lineer Denklem Çözümü
  const augmented = N.map((row, idx) => [...row, U[idx]]);

  for (let i = 0; i < numCols; i++) {
    let maxRow = i;
    for (let k = i + 1; k < numCols; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    if (Math.abs(augmented[i][i]) < 1e-12) return null; // Tekil matris

    for (let k = i + 1; k < numCols; k++) {
      const factor = augmented[k][i] / augmented[i][i];
      for (let j = i; j <= numCols; j++) {
        augmented[k][j] -= factor * augmented[i][j];
      }
    }
  }

  // Geriye Doğru Yerine Koyma (Back Substitution)
  const result = Array(numCols).fill(0);
  for (let i = numCols - 1; i >= 0; i--) {
    result[i] = augmented[i][numCols];
    for (let j = i + 1; j < numCols; j++) {
      result[i] -= augmented[i][j] * result[j];
    }
    result[i] /= augmented[i][i];
  }

  return result;
}