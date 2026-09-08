/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - RINEX GÜÇLÜ İŞLEME & ANALİZ MOTORU (RinexPowerEngine)
 * =========================================================================================
 *  - UniversalRinexInspector: RINEX 2.xx / 3.xx / 4.xx Başlık, DOY, Uydu ve Kalite Analizcisi
 *  - inspectPpkOverlap: Sabit (Base) ve Gezici (Rover) Oturum Çakışması & Baz Mesafesi Denetleyici
 *  - analyzeRinexQuality: Epoch bazlı çoklu GNSS (GPS, GLO, GAL, BDS, QZS) Uydu Sayısı & Kalite Analizi
 *  - RinexPowerEngine: Takımyıldız, Frekans Bandı (L1/L2/L5/E6) ve Gözlem Türü (Phase/Code/Doppler/SNR) Filtresi
 *  - RinexMergerEngine: Tarayıcı İçi Yüksek Hızlı RINEX Birleştirme, Zaman Kesme (Crop) ve Decimation
 * =========================================================================================
 */

class UniversalRinexInspector {
  /**
   * RINEX Dosya Başlığını (Header) ve İlk/Son Epoch'ları Ayrıştırıp Özetler
   */
  static inspectRinexHeader(rinexText, fileName = "", tailText = "") {
    const headerEndIdx = rinexText.indexOf("END OF HEADER");
    const headerText = headerEndIdx !== -1 ? rinexText.substring(0, headerEndIdx + 13) : rinexText.substring(0, 15000);
    const postHeaderSample = headerEndIdx !== -1 ? rinexText.substring(headerEndIdx + 13, headerEndIdx + 30000) : "";
    const headerLines = headerText.split(/\r?\n/);

    let version = 2.11;
    let fileType = "UNKNOWN";
    let markerName = "";
    let firstObs = null;
    let lastObs = null;
    let interval = 0;
    let approxX = 0;
    let approxY = 0;
    let approxZ = 0;
    let rinex2ObsTypes = [];
    let rinex3ObsTypes = {};
    let isRinex = false;

    const constellations = new Set();
    const frequencyBands = new Set();
    const observationTypes = new Set();

    for (let line of headerLines) {
      if (line.length < 20) continue;
      const label = line.substring(60).trim();

      if (label.includes("RINEX VERSION / TYPE") || label.includes("RINEX VERSION/TYPE")) {
        isRinex = true;
        const verStr = line.substring(0, 20).trim();
        version = parseFloat(verStr) || 2.11;

        const typeStr = line.substring(20, 40).toUpperCase();
        if (typeStr.includes("OBSERVATION") || typeStr.includes("OBS")) {
          fileType = "OBS";
        } else if (typeStr.includes("NAV") || typeStr.includes("NAVIGATION")) {
          const sysStr = line.substring(40, 60).toUpperCase();
          if (sysStr.includes("GLONASS") || sysStr.includes("GLO")) {
            fileType = "NAV_GLO";
            constellations.add("GLO");
          } else if (sysStr.includes("MIXED") || sysStr.includes("MULTI") || sysStr.includes("M:")) {
            fileType = "NAV_MIXED";
          } else {
            fileType = "NAV_GPS";
            constellations.add("GPS");
          }
        }
      } else if (label.includes("MARKER NAME")) {
        markerName = line.substring(0, 60).trim().toUpperCase();
      } else if (label.includes("TIME OF FIRST OBS")) {
        const numTokens = line.substring(0, 60).trim().split(/\s+/).filter(t => /^\d+(\.\d+)?$/.test(t)).map(Number);
        if (numTokens.length >= 6) {
          const y = numTokens[0] < 80 ? 2000 + numTokens[0] : numTokens[0] < 1900 ? 1900 + numTokens[0] : numTokens[0];
          firstObs = {
            year: y,
            month: numTokens[1],
            day: numTokens[2],
            hour: numTokens[3],
            minute: numTokens[4],
            second: numTokens[5]
          };
        }
      } else if (label.includes("TIME OF LAST OBS")) {
        const numTokens = line.substring(0, 60).trim().split(/\s+/).filter(t => /^\d+(\.\d+)?$/.test(t)).map(Number);
        if (numTokens.length >= 6) {
          const y = numTokens[0] < 80 ? 2000 + numTokens[0] : numTokens[0] < 1900 ? 1900 + numTokens[0] : numTokens[0];
          lastObs = {
            year: y,
            month: numTokens[1],
            day: numTokens[2],
            hour: numTokens[3],
            minute: numTokens[4],
            second: numTokens[5]
          };
        }
      } else if (label.includes("INTERVAL")) {
        interval = parseFloat(line.substring(0, 60).trim()) || 0;
      } else if (label.includes("APPROX POSITION XYZ")) {
        const xyz = line.substring(0, 60).trim().split(/\s+/).map(Number);
        if (xyz.length >= 3) {
          approxX = xyz[0];
          approxY = xyz[1];
          approxZ = xyz[2];
        }
      } else if (label.includes("# / TYPES OF OBSERV")) {
        const obsList = line.substring(6, 60).trim().split(/\s+/);
        for (let obs of obsList) {
          if (obs.length >= 2 && !rinex2ObsTypes.includes(obs)) {
            rinex2ObsTypes.push(obs);
          }
        }
      } else if (label.includes("SYS / # / OBS TYPES")) {
        const sysCode = line.substring(0, 1).trim().toUpperCase();
        if (sysCode === "G") constellations.add("GPS");
        else if (sysCode === "R") constellations.add("GLO");
        else if (sysCode === "E") constellations.add("GAL");
        else if (sysCode === "C") constellations.add("BDS");
        else if (sysCode === "J") constellations.add("QZS");
        else if (sysCode === "S") constellations.add("SBS");

        const obsList = line.substring(6, 60).trim().split(/\s+/);
        if (!rinex3ObsTypes[sysCode]) {
          rinex3ObsTypes[sysCode] = [];
        }
        for (let obs of obsList) {
          if (obs.length >= 3 && !rinex3ObsTypes[sysCode].includes(obs)) {
            rinex3ObsTypes[sysCode].push(obs);
          }
        }
      }
    }

    // Toplu Gözlem Türleri ve Frekans Bantlarının Çıkarılması
    const allObsCodes = [...rinex2ObsTypes];
    for (let sys in rinex3ObsTypes) {
      allObsCodes.push(...rinex3ObsTypes[sys]);
    }
    if (allObsCodes.length === 0) {
      allObsCodes.push("L1", "L2", "C1", "P2");
    }

    for (let code of allObsCodes) {
      const typeLetter = code[0].toUpperCase();
      if (typeLetter === "L") observationTypes.add("Phase");
      else if (typeLetter === "C" || typeLetter === "P") observationTypes.add("Code");
      else if (typeLetter === "D") observationTypes.add("Doppler");
      else if (typeLetter === "S") observationTypes.add("SNR");

      const bandDigit = code.length >= 2 ? code[1] : "1";
      if (bandDigit === "1") frequencyBands.add("L1");
      else if (bandDigit === "2") frequencyBands.add("L2");
      else if (bandDigit === "5" || bandDigit === "7" || bandDigit === "8") frequencyBands.add("L5");
      else if (bandDigit === "6") frequencyBands.add("E6");
    }

    // Başlık sonrası ilk epoch gövdesinden aktif takımyıldızları doğrula
    if (postHeaderSample) {
      const postLines = postHeaderSample.split(/\r?\n/);
      for (let pl of postLines) {
        if (pl.startsWith(">")) continue;
        const matches = pl.match(/([GRECJS])\d{2}/g);
        if (matches) {
          for (let sat of matches) {
            const prefix = sat[0].toUpperCase();
            if (prefix === "G") constellations.add("GPS");
            else if (prefix === "R") constellations.add("GLO");
            else if (prefix === "E") constellations.add("GAL");
            else if (prefix === "C") constellations.add("BDS");
            else if (prefix === "J") constellations.add("QZS");
            else if (prefix === "S") constellations.add("SBS");
          }
        }
      }
    }

    if (constellations.size === 0) constellations.add("GPS");
    if (frequencyBands.size === 0) {
      frequencyBands.add("L1");
      frequencyBands.add("L2");
    }
    if (observationTypes.size === 0) {
      observationTypes.add("Phase");
      observationTypes.add("Code");
      observationTypes.add("SNR");
    }

    if (!markerName) {
      const baseName = fileName.replace(/\.[^/.]+$/, "").toUpperCase();
      markerName = baseName.substring(0, 4) || "STATION";
    }

    let year = new Date().getFullYear();
    let doy = 1;

    // Gövdeden Başlangıç ve Bitiş Zamanlarının Kesin Çıkarımı (Varsa Dosya Sonu Parçası ile)
    const epochBounds = UniversalRinexInspector.extractRinexStartAndEnd(rinexText, firstObs, lastObs, tailText);
    firstObs = epochBounds.firstObs;
    lastObs = epochBounds.lastObs;

    if (firstObs) {
      year = firstObs.year;
      doy = UniversalRinexInspector.calculateDoy(firstObs.year, firstObs.month, firstObs.day);
    } else {
      const doyMatch = fileName.match(/(\d{3})[A-Za-z0-9]\.(\d{2})/);
      if (doyMatch) {
        doy = parseInt(doyMatch[1]) || 1;
        const y2 = parseInt(doyMatch[2]);
        year = y2 < 80 ? 2000 + y2 : 1900 + y2;
      }
    }

    if (fileType === "UNKNOWN") {
      const ext = (fileName.split(".").pop() || "").toUpperCase();
      if (ext.endsWith("O") || ext === "OBS") fileType = "OBS";
      else if (ext.endsWith("N") || ext === "NAV") {
        fileType = "NAV_GPS";
        constellations.add("GPS");
      } else if (ext.endsWith("G") || ext === "GLO") {
        fileType = "NAV_GLO";
        constellations.add("GLO");
      } else if (ext === "RNX") fileType = "OBS";
    }

    return {
      isRinex: isRinex,
      version: version,
      fileType: fileType,
      markerName: markerName.replace(/[^A-Za-z0-9_-]/g, "_"),
      firstObs: firstObs,
      lastObs: lastObs,
      year: year,
      doy: doy,
      interval: interval,
      approxX: approxX,
      approxY: approxY,
      approxZ: approxZ,
      obsTypes: rinex2ObsTypes,
      rinex3ObsTypes: rinex3ObsTypes,
      presentConstellations: Array.from(constellations),
      presentBands: Array.from(frequencyBands),
      presentObsTypes: Array.from(observationTypes)
    };
  }

  /**
   * RINEX Gövdesindeki İlk ve Son Epoch Zamanlarını Tarar (Opsiyonel Dosya Sonu Parçası ile)
   */
  static extractRinexStartAndEnd(rinexText, headerFirstObs, headerLastObs, tailText = "") {
    let firstEpoch = null;
    let lastEpoch = null;

    const buildEpochObj = (y, mo, d, h, mi, s) => {
      const fullYear = y < 80 ? 2000 + y : y < 1900 ? 1900 + y : y;
      const validMonth = Math.max(1, Math.min(12, mo));
      const validDay = Math.max(1, Math.min(31, d));
      const validHour = Math.max(0, Math.min(23, h));
      const validMinute = Math.max(0, Math.min(59, mi));
      const validSecond = Math.max(0, Math.min(59, Math.floor(s)));

      const timestamp = Date.UTC(fullYear, validMonth - 1, validDay, validHour, validMinute, validSecond);
      const dateStr = `${fullYear}-${String(validMonth).padStart(2, "0")}-${String(validDay).padStart(2, "0")}`;
      const timeStr = `${String(validHour).padStart(2, "0")}:${String(validMinute).padStart(2, "0")}:${String(validSecond).padStart(2, "0")} UTC`;
      const dateTimeStr = `${String(validDay).padStart(2, "0")}.${String(validMonth).padStart(2, "0")}.${fullYear} ${timeStr}`;

      return {
        year: fullYear,
        month: validMonth,
        day: validDay,
        hour: validHour,
        minute: validMinute,
        second: s,
        timestamp: timestamp,
        dateStr: dateStr,
        timeStr: timeStr,
        dateTimeStr: dateTimeStr
      };
    };

    if (headerFirstObs && headerFirstObs.year) {
      firstEpoch = buildEpochObj(headerFirstObs.year, headerFirstObs.month, headerFirstObs.day, headerFirstObs.hour, headerFirstObs.minute, headerFirstObs.second);
    }
    if (headerLastObs && headerLastObs.year) {
      lastEpoch = buildEpochObj(headerLastObs.year, headerLastObs.month, headerLastObs.day, headerLastObs.hour, headerLastObs.minute, headerLastObs.second);
    }

    const parseEpochFromLine = (line) => {
      if (!line) return null;
      const trimmed = line.trim();
      if (!trimmed) return null;

      // RINEX 3.xx / 4.xx Epoch Satırı (> YYYY MM DD HH MI SS.SSSSSSS  F NN)
      if (line.startsWith(">")) {
        const tokens = line.substring(1).trim().split(/\s+/);
        if (tokens.length >= 6) {
          const y = parseInt(tokens[0], 10);
          const mo = parseInt(tokens[1], 10);
          const d = parseInt(tokens[2], 10);
          const h = parseInt(tokens[3], 10);
          const mi = parseInt(tokens[4], 10);
          const s = parseFloat(tokens[5]);
          if (!isNaN(y) && !isNaN(mo) && !isNaN(d) && !isNaN(h) && !isNaN(mi) && !isNaN(s)) {
            if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && h >= 0 && h <= 23 && mi >= 0 && mi <= 59 && s >= 0 && s < 60.01) {
              return buildEpochObj(y, mo, d, h, mi, s);
            }
          }
        }
        return null;
      }

      // RINEX 2.xx Epoch Satırı (YY MM DD HH MI SS.SSSSSSS  F NN)
      if (line.length >= 26) {
        const yyStr = line.substring(0, 3).trim();
        const mmStr = line.substring(3, 6).trim();
        const ddStr = line.substring(6, 9).trim();
        const hhStr = line.substring(9, 12).trim();
        const miStr = line.substring(12, 15).trim();
        const ssStr = line.substring(15, 26).trim();

        const yy = parseInt(yyStr, 10);
        const mm = parseInt(mmStr, 10);
        const dd = parseInt(ddStr, 10);
        const hh = parseInt(hhStr, 10);
        const mi = parseInt(miStr, 10);
        const ss = parseFloat(ssStr);

        if (!isNaN(yy) && !isNaN(mm) && !isNaN(dd) && !isNaN(hh) && !isNaN(mi) && !isNaN(ss)) {
          if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 && hh >= 0 && hh <= 23 && mi >= 0 && mi <= 59 && ss >= 0 && ss < 60.01) {
            if (line.length >= 29) {
              const flagStr = line.substring(26, 29).trim();
              const flag = parseInt(flagStr, 10);
              if (!isNaN(flag) && (flag < 0 || flag > 6)) return null;
            }
            return buildEpochObj(yy, mm, dd, hh, mi, ss);
          }
        }
      }
      return null;
    };

    const headerEndIdx = rinexText.indexOf("END OF HEADER");
    const bodyText = headerEndIdx !== -1 ? rinexText.substring(headerEndIdx + 13) : rinexText;
    const bodyLines = bodyText.split(/\r?\n/);

    // Gövdeden İlk Geçerli Epoch'u Keşfet
    let discoveredFirstEpoch = null;
    for (let i = 0; i < Math.min(bodyLines.length, 1000); i++) {
      const ep = parseEpochFromLine(bodyLines[i]);
      if (ep) {
        discoveredFirstEpoch = ep;
        break;
      }
    }

    // Gövdeden Son Geçerli Epoch'u Keşfet (Sondan Başa Tarama)
    let discoveredLastEpoch = null;

    // Eğer dosyanın son parçası (tailText) verilmişse öncelikle oradan ara
    if (tailText) {
      const tailLines = tailText.split(/\r?\n/);
      for (let i = tailLines.length - 1; i >= 0; i--) {
        const ep = parseEpochFromLine(tailLines[i]);
        if (ep) {
          discoveredLastEpoch = ep;
          break;
        }
      }
    }

    if (!discoveredLastEpoch) {
      for (let i = bodyLines.length - 1; i >= 0; i--) {
        const ep = parseEpochFromLine(bodyLines[i]);
        if (ep) {
          discoveredLastEpoch = ep;
          break;
        }
      }
    }

    // Başlık ve Gövde Sonuçlarını Harmanlama
    if (!firstEpoch && discoveredFirstEpoch) {
      firstEpoch = discoveredFirstEpoch;
    }
    if (!lastEpoch && discoveredLastEpoch) {
      lastEpoch = discoveredLastEpoch;
    }

    // Eğer gövdeden son epoch bulunduysa ve başlıktaki lastObs'tan daha yeniyse gövdeyi tercih et
    if (discoveredLastEpoch && (!lastEpoch || discoveredLastEpoch.timestamp > lastEpoch.timestamp)) {
      lastEpoch = discoveredLastEpoch;
    }
    if (discoveredFirstEpoch && (!firstEpoch || discoveredFirstEpoch.timestamp < firstEpoch.timestamp)) {
      firstEpoch = discoveredFirstEpoch;
    }

    if (firstEpoch && !lastEpoch) {
      lastEpoch = {
        ...firstEpoch,
        timestamp: firstEpoch.timestamp + 3600000,
        timeStr: `${String(firstEpoch.hour + 1).padStart(2, "0")}:00:00 UTC`
      };
    }

    return {
      firstObs: firstEpoch,
      lastObs: lastEpoch
    };
  }

  /**
   * Yılın Günü (Day of Year - DOY) Hesabı
   */
  static calculateDoy(year, month, day) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const monthDays = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let doy = day;
    for (let m = 1; m < month; m++) {
      doy += monthDays[m];
    }
    return doy;
  }

  /**
   * Sabit (Base) ve Gezici (Rover) Arasındaki PPK Zaman Çakışmasını & Baz Mesafesini İnceler
   */
  static inspectPpkOverlap(baseInfo, roverInfo) {
    if (!baseInfo || !roverInfo) {
      throw new Error("ERR_RINEX_BASE_ROVER_REQUIRED");
    }

    const baseStart = baseInfo.firstObs?.timestamp || baseInfo.start?.getTime?.() || (baseInfo.start ? new Date(baseInfo.start).getTime() : null);
    const baseEnd = baseInfo.lastObs?.timestamp || baseInfo.end?.getTime?.() || (baseInfo.end ? new Date(baseInfo.end).getTime() : null);
    const roverStart = roverInfo.firstObs?.timestamp || roverInfo.start?.getTime?.() || (roverInfo.start ? new Date(roverInfo.start).getTime() : null);
    const roverEnd = roverInfo.lastObs?.timestamp || roverInfo.end?.getTime?.() || (roverInfo.end ? new Date(roverInfo.end).getTime() : null);

    if (!baseStart || !baseEnd || !roverStart || !roverEnd) {
      throw new Error("ERR_RINEX_TIME_SPAN_UNREADABLE");
    }

    const formatSeconds = (sec) => {
      sec = Math.round(sec);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      if (h > 0) return `${h}h ${m}m ${s}s`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    };

    const roverDurationSec = Math.max(1, (roverEnd - roverStart) / 1000);
    const baseDurationSec = Math.max(1, (baseEnd - baseStart) / 1000);

    const isSameDate = (baseInfo.firstObs?.dateStr && roverInfo.firstObs?.dateStr)
      ? (baseInfo.firstObs.dateStr === roverInfo.firstObs.dateStr)
      : (new Date(baseStart).toDateString() === new Date(roverStart).toDateString());

    const overlapStart = Math.max(baseStart, roverStart);
    const overlapEnd = Math.min(baseEnd, roverEnd);
    const overlapMs = Math.max(0, overlapEnd - overlapStart);
    const overlapSec = overlapMs / 1000;
    const overlapPct = Math.min(100, Math.max(0, (overlapSec / roverDurationSec) * 100));

    // 3B ECEF Baz Mesafesi Hesabı
    let baselineKm = 0;
    let baselineStr = "--";
    let baselineQuality = "UNKNOWN";

    if (
      baseInfo.approxX && baseInfo.approxY && baseInfo.approxZ &&
      roverInfo.approxX && roverInfo.approxY && roverInfo.approxZ &&
      Math.abs(baseInfo.approxX) > 1000 && Math.abs(roverInfo.approxX) > 1000
    ) {
      const dx = roverInfo.approxX - baseInfo.approxX;
      const dy = roverInfo.approxY - baseInfo.approxY;
      const dz = roverInfo.approxZ - baseInfo.approxZ;
      const distM = Math.sqrt(dx * dx + dy * dy + dz * dz);
      baselineKm = distM / 1000.0;

      if (baselineKm < 1) {
        baselineStr = `${distM.toFixed(1)} m`;
        baselineQuality = "VERY_SHORT";
      } else if (baselineKm <= 20) {
        baselineStr = `${baselineKm.toFixed(2)} km (${Math.round(distM)} m)`;
        baselineQuality = "SHORT";
      } else if (baselineKm <= 50) {
        baselineStr = `${baselineKm.toFixed(2)} km (${Math.round(distM)} m)`;
        baselineQuality = "MEDIUM";
      } else {
        baselineStr = `${baselineKm.toFixed(2)} km (${Math.round(distM)} m)`;
        baselineQuality = "LONG";
      }
    } else {
      baselineStr = "--";
      baselineQuality = "NO_APPROX_POS";
    }

    let baselineNote = baselineQuality;
    if (typeof window !== "undefined" && typeof window.t === "function") {
      const trNote = window.t(`rinex.baseline.${baselineQuality}`);
      if (trNote && !trNote.startsWith("rinex.baseline.")) baselineNote = trNote;
    }

    // Ortak Takımyıldızları Belirleme
    const baseConst = Array.from(baseInfo.presentConstellations || []);
    const roverConst = Array.from(roverInfo.presentConstellations || []);
    const commonConstellations = baseConst.filter(c => roverConst.includes(c));

    // Zaman Çizgisi (Timeline) Gösterge Yüzdeleri
    const globalMinTime = Math.min(baseStart, roverStart);
    const globalMaxTime = Math.max(baseEnd, roverEnd);
    const totalSpanMs = Math.max(1, globalMaxTime - globalMinTime);

    const baseLeft = ((baseStart - globalMinTime) / totalSpanMs) * 100;
    const baseWidth = Math.max(2, ((baseEnd - baseStart) / totalSpanMs) * 100);
    const roverLeft = ((roverStart - globalMinTime) / totalSpanMs) * 100;
    const roverWidth = Math.max(2, ((roverEnd - roverStart) / totalSpanMs) * 100);

    let statusLevel = "SUCCESS";
    let statusCode = "FULL_OVERLAP";
    let statusTitle = "FULL_OVERLAP";
    let statusDesc = "";

    if (!isSameDate && Math.abs(baseStart - roverStart) > 86400000) {
      statusLevel = "DANGER";
      statusCode = "DATE_MISMATCH";
      statusTitle = "DATE_MISMATCH";
      statusDesc = `${baseInfo.firstObs?.dateStr || ""} != ${roverInfo.firstObs?.dateStr || ""}`;
    } else if (overlapPct >= 99.5) {
      statusLevel = "SUCCESS";
      statusCode = "FULL_OVERLAP";
      statusTitle = "FULL_OVERLAP";
      statusDesc = "100% overlap";
    } else if (overlapPct > 0) {
      statusLevel = "WARNING";
      statusCode = "PARTIAL_OVERLAP";
      statusTitle = `PARTIAL_OVERLAP (${overlapPct.toFixed(1)}%)`;
      statusDesc = `${overlapPct.toFixed(1)}% overlap`;
    } else {
      statusLevel = "DANGER";
      statusCode = "NO_OVERLAP";
      statusTitle = "NO_OVERLAP";
      statusDesc = "0% overlap";
    }

    if (typeof window !== "undefined" && typeof window.t === "function") {
      const trTitle = window.t(`rinex.ppk.${statusCode}`);
      if (trTitle && !trTitle.startsWith("rinex.ppk.")) {
        statusTitle = statusCode === "PARTIAL_OVERLAP" ? `${trTitle} (%${overlapPct.toFixed(1)})` : trTitle;
      }
      const trDesc = window.t(`rinex.ppk.${statusCode}_DESC`);
      if (trDesc && !trDesc.startsWith("rinex.ppk.")) statusDesc = trDesc;
    }

    return {
      baseStartStr: baseInfo.firstObs?.dateStr ? `${baseInfo.firstObs.dateStr} ${baseInfo.firstObs.timeStr}` : new Date(baseStart).toISOString(),
      baseEndStr: baseInfo.lastObs?.dateStr ? `${baseInfo.lastObs.dateStr} ${baseInfo.lastObs.timeStr}` : new Date(baseEnd).toISOString(),
      roverStartStr: roverInfo.firstObs?.dateStr ? `${roverInfo.firstObs.dateStr} ${roverInfo.firstObs.timeStr}` : new Date(roverStart).toISOString(),
      roverEndStr: roverInfo.lastObs?.dateStr ? `${roverInfo.lastObs.dateStr} ${roverInfo.lastObs.timeStr}` : new Date(roverEnd).toISOString(),
      baseDurationStr: formatSeconds(baseDurationSec),
      roverDurationStr: formatSeconds(roverDurationSec),
      overlapDurationStr: formatSeconds(overlapSec),
      overlapPercent: overlapPct,
      overlapPct: overlapPct,
      baselineKm: baselineKm,
      baselineStr: baselineStr,
      baselineQuality: baselineQuality,
      baselineNote: baselineNote,
      commonConstellations: commonConstellations,
      baseInterval: baseInfo.interval || 1,
      roverInterval: roverInfo.interval || 1,
      statusLevel: statusLevel,
      statusCode: statusCode,
      statusTitle: statusTitle,
      statusDesc: statusDesc,
      timeline: {
        baseLeft: baseLeft,
        baseWidth: baseWidth,
        roverLeft: roverLeft,
        roverWidth: roverWidth
      }
    };
  }

  /**
   * RINEX Gözlem Kalitesini ve Uydu Sayılarını Epoch Epoch İnceler
   */
  static analyzeRinexQuality(rinexText) {
    if (!rinexText || rinexText.length < 50) {
      throw new Error("ERR_RINEX_EMPTY_FILE");
    }

    const headerEndIdx = rinexText.indexOf("END OF HEADER");
    if (headerEndIdx === -1) {
      throw new Error("ERR_RINEX_NO_HEADER");
    }

    const header = rinexText.substring(0, headerEndIdx + 13);
    const body = rinexText.substring(headerEndIdx + 13);
    const isRinex3 = header.includes("3.0") || header.includes("3.01") || header.includes("3.02") || header.includes("3.03") || header.includes("3.04") || header.includes("3.05") || header.includes("4.00");
    const bodyLines = body.split(/\r?\n/);

    const parsedEpochs = [];
    let currentEpoch = null;
    let expectedSatCount = 0;
    let epochSats = [];

    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i];
      if (!line || line.trim().length === 0) continue;

      if (isRinex3) {
        if (line.startsWith(">")) {
          if (currentEpoch) {
            currentEpoch.satellites = epochSats;
            currentEpoch.totalSats = epochSats.length;
            currentEpoch.gpsCount = epochSats.filter(s => s.startsWith("G")).length;
            currentEpoch.gloCount = epochSats.filter(s => s.startsWith("R")).length;
            currentEpoch.galCount = epochSats.filter(s => s.startsWith("E")).length;
            currentEpoch.bdsCount = epochSats.filter(s => s.startsWith("C")).length;
            parsedEpochs.push(currentEpoch);
          }

          const tokens = line.substring(1).trim().split(/\s+/);
          if (tokens.length >= 6) {
            const y = parseInt(tokens[0]);
            const m = parseInt(tokens[1]);
            const d = parseInt(tokens[2]);
            const h = parseInt(tokens[3]);
            const mi = parseInt(tokens[4]);
            const s = parseFloat(tokens[5]);
            expectedSatCount = parseInt(tokens[7]) || 0;
            epochSats = [];

            currentEpoch = {
              year: y,
              month: m,
              day: d,
              hour: h,
              min: mi,
              sec: s,
              timeStr: `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}:${String(Math.floor(s)).padStart(2, "0")}`,
              epochIdx: parsedEpochs.length + 1
            };
          }
        } else if (currentEpoch) {
          const satCode = line.substring(0, 3).trim();
          if (satCode.length >= 2 && ["G", "R", "E", "C", "J", "S"].includes(satCode[0])) {
            epochSats.push(satCode);
          }
        }
      } else {
        // RINEX 2.xx Epoch Formatı
        if (line.length >= 26 && /^\s*\d{1,2}\s+\d{1,2}\s+\d{1,2}\s+\d{1,2}\s+\d{1,2}/.test(line.substring(0, 26))) {
          const yy = parseInt(line.substring(0, 3).trim());
          const mm = parseInt(line.substring(3, 6).trim());
          const dd = parseInt(line.substring(6, 9).trim());
          const hh = parseInt(line.substring(9, 12).trim());
          const mi = parseInt(line.substring(12, 15).trim());
          const ss = parseFloat(line.substring(15, 26).trim());
          const epochFlag = parseInt(line.substring(26, 29).trim()) || 0;
          const numSats = parseInt(line.substring(29, 32).trim()) || 0;

          if (!isNaN(yy) && !isNaN(mm) && !isNaN(dd) && !isNaN(hh) && !isNaN(mi) && epochFlag <= 1 && numSats > 0) {
            if (currentEpoch) {
              currentEpoch.satellites = epochSats;
              currentEpoch.totalSats = epochSats.length || expectedSatCount;
              currentEpoch.gpsCount = epochSats.filter(s => s.startsWith("G") || (!isNaN(s) && !s.includes("R") && !s.includes("E") && !s.includes("C"))).length;
              currentEpoch.gloCount = epochSats.filter(s => s.startsWith("R")).length;
              currentEpoch.galCount = epochSats.filter(s => s.startsWith("E")).length;
              currentEpoch.bdsCount = epochSats.filter(s => s.startsWith("C")).length;
              parsedEpochs.push(currentEpoch);
            }

            expectedSatCount = numSats;
            epochSats = [];

            const satStr1 = line.substring(32, 68);
            for (let c = 0; c < satStr1.length; c += 3) {
              const satId = satStr1.substring(c, c + 3).trim();
              if (satId) epochSats.push(satId);
            }

            let continuationLines = Math.ceil(numSats / 12) - 1;
            while (continuationLines > 0 && i + 1 < bodyLines.length) {
              i++;
              const contLine = bodyLines[i];
              const satStrCont = contLine.substring(32, 68);
              for (let c = 0; c < satStrCont.length; c += 3) {
                const satId = satStrCont.substring(c, c + 3).trim();
                if (satId) epochSats.push(satId);
              }
              continuationLines--;
            }

            currentEpoch = {
              year: yy < 80 ? 2000 + yy : yy < 1900 ? 1900 + yy : yy,
              month: mm,
              day: dd,
              hour: hh,
              min: mi,
              sec: ss,
              timeStr: `${String(hh).padStart(2, "0")}:${String(mi).padStart(2, "0")}:${String(Math.floor(ss)).padStart(2, "0")}`,
              epochIdx: parsedEpochs.length + 1
            };
          }
        }
      }
    }

    if (currentEpoch) {
      currentEpoch.satellites = epochSats;
      currentEpoch.totalSats = epochSats.length || expectedSatCount;
      currentEpoch.gpsCount = epochSats.filter(s => s.startsWith("G") || !isNaN(s)).length;
      currentEpoch.gloCount = epochSats.filter(s => s.startsWith("R")).length;
      currentEpoch.galCount = epochSats.filter(s => s.startsWith("E")).length;
      currentEpoch.bdsCount = epochSats.filter(s => s.startsWith("C")).length;
      parsedEpochs.push(currentEpoch);
    }

    if (parsedEpochs.length === 0) {
      throw new Error("ERR_RINEX_INVALID_EPOCH");
    }

    const totalEpochs = parsedEpochs.length;
    const satCounts = parsedEpochs.map(e => e.totalSats);
    const avgSats = satCounts.reduce((a, b) => a + b, 0) / totalEpochs;
    const maxSats = Math.max(...satCounts);
    const minSats = Math.min(...satCounts);

    const avgGps = parsedEpochs.map(e => e.gpsCount).reduce((a, b) => a + b, 0) / totalEpochs;
    const avgGlo = parsedEpochs.map(e => e.gloCount).reduce((a, b) => a + b, 0) / totalEpochs;
    const avgGal = parsedEpochs.map(e => e.galCount).reduce((a, b) => a + b, 0) / totalEpochs;
    const avgBds = parsedEpochs.map(e => e.bdsCount).reduce((a, b) => a + b, 0) / totalEpochs;

    // Örnekleme Aralığı (Interval) Tespiti
    let detectedInterval = 1;
    if (parsedEpochs.length >= 2) {
      const t1 = new Date(Date.UTC(parsedEpochs[0].year, parsedEpochs[0].month - 1, parsedEpochs[0].day, parsedEpochs[0].hour, parsedEpochs[0].min, parsedEpochs[0].sec)).getTime();
      const t2 = new Date(Date.UTC(parsedEpochs[1].year, parsedEpochs[1].month - 1, parsedEpochs[1].day, parsedEpochs[1].hour, parsedEpochs[1].min, parsedEpochs[1].sec)).getTime();
      detectedInterval = Math.max(1, Math.round((t2 - t1) / 1000));
    }

    // Grafik için Örneklenmiş Zaman Çizelgesi (Timeline Data)
    const sampleStep = Math.max(1, Math.floor(parsedEpochs.length / 80));
    const timeline = [];
    for (let i = 0; i < parsedEpochs.length; i += sampleStep) {
      timeline.push({
        time: parsedEpochs[i].timeStr,
        total: parsedEpochs[i].totalSats,
        gps: parsedEpochs[i].gpsCount,
        glo: parsedEpochs[i].gloCount,
        gal: parsedEpochs[i].galCount,
        bds: parsedEpochs[i].bdsCount
      });
    }

    // Kalite Puanı Hesaplama
    let score = 95;
    if (avgSats < 8) score -= 30;
    else if (avgSats < 14) score -= 15;
    if (minSats < 5) score -= 20;

    return {
      totalEpochs: totalEpochs,
      startTime: parsedEpochs[0].timeStr,
      endTime: parsedEpochs[parsedEpochs.length - 1].timeStr,
      avgSats: avgSats.toFixed(1),
      maxSats: maxSats,
      minSats: minSats,
      avgGps: avgGps.toFixed(1),
      avgGlo: avgGlo.toFixed(1),
      avgGal: avgGal.toFixed(1),
      avgBds: avgBds.toFixed(1),
      detectedInterval: detectedInterval,
      qualityScore: Math.max(10, Math.min(100, score)),
      timeline: timeline
    };
  }
}

class RinexPowerEngine {
  constructor() {
    this.selectedConstellations = {
      GPS: true,
      GLO: true,
      GAL: true,
      BDS: true,
      QZS: true,
      SBS: true
    };
    this.selectedBands = {
      L1: true,
      L2: true,
      L5: true,
      E6: true
    };
    this.selectedObsTypes = {
      Phase: true,
      Code: true,
      Doppler: true,
      SNR: true
    };
    this.targetFormat = "RINEX_211";
    this.samplingStep = 1;
  }

  setConstellations(config) {
    this.selectedConstellations = { ...this.selectedConstellations, ...config };
  }

  setBands(config) {
    this.selectedBands = { ...this.selectedBands, ...config };
  }

  setObsTypes(config) {
    this.selectedObsTypes = { ...this.selectedObsTypes, ...config };
  }

  isSatelliteAllowed(satName) {
    const code = satName.trim().toUpperCase();
    let sys = "GPS";
    if (code.startsWith("G")) sys = "GPS";
    else if (code.startsWith("R")) sys = "GLO";
    else if (code.startsWith("E")) sys = "GAL";
    else if (code.startsWith("C")) sys = "BDS";
    else if (code.startsWith("J")) sys = "QZS";
    else if (code.startsWith("S")) sys = "SBS";
    else sys = "GPS";

    return !!this.selectedConstellations[sys];
  }

  isTypeAllowed(obsType) {
    if (!obsType) return true;
    const cleanType = obsType.trim().toUpperCase();
    const typeLetter = cleanType[0];
    const bandDigit = cleanType[1];

    if (typeLetter === "L" && !this.selectedObsTypes.Phase) return false;
    if ((typeLetter === "C" || typeLetter === "P") && !this.selectedObsTypes.Code) return false;
    if (typeLetter === "D" && !this.selectedObsTypes.Doppler) return false;
    if (typeLetter === "S" && !this.selectedObsTypes.SNR) return false;

    if (bandDigit === "1" && !this.selectedBands.L1) return false;
    if (bandDigit === "2" && !this.selectedBands.L2) return false;
    if ((bandDigit === "5" || bandDigit === "7" || bandDigit === "8") && !this.selectedBands.L5) return false;
    if (bandDigit === "6" && !this.selectedBands.E6) return false;

    return true;
  }

  inspectHeader(rinexText, fileName = "") {
    return UniversalRinexInspector.inspectRinexHeader(rinexText, fileName);
  }

  inspectRinexHeader(rinexText, fileName = "") {
    return UniversalRinexInspector.inspectRinexHeader(rinexText, fileName);
  }

  inspectPpkOverlap(baseSession, roverSession) {
    return UniversalRinexInspector.inspectPpkOverlap(baseSession, roverSession);
  }

  analyzeRinexQuality(rinexText, intervalSeconds = 1) {
    return UniversalRinexInspector.analyzeRinexQuality(rinexText, intervalSeconds);
  }

  /**
   * Çözülmüş Konumlardan Standart NMEA $GPGGA Kayıtları Üretir
   */
  generateNmeaLog(positions) {
    let nmea = "";
    for (let p of positions) {
      const dt = new Date(p.timestamp || Date.now());
      const hh = String(dt.getUTCHours()).padStart(2, "0");
      const mm = String(dt.getUTCMinutes()).padStart(2, "0");
      const ss = String(dt.getUTCSeconds()).padStart(2, "0");
      const utcStr = `${hh}${mm}${ss}.00`;

      const latDeg = Math.floor(Math.abs(p.lat));
      const latMin = ((Math.abs(p.lat) - latDeg) * 60.0).toFixed(4);
      const latNmea = `${String(latDeg).padStart(2, "0")}${latMin.padStart(7, "0")}`;
      const latHemi = p.lat >= 0 ? "N" : "S";

      const lonDeg = Math.floor(Math.abs(p.lon));
      const lonMin = ((Math.abs(p.lon) - lonDeg) * 60.0).toFixed(4);
      const lonNmea = `${String(lonDeg).padStart(3, "0")}${lonMin.padStart(7, "0")}`;
      const lonHemi = p.lon >= 0 ? "E" : "W";

      const sentence = `GPGGA,${utcStr},${latNmea},${latHemi},${lonNmea},${lonHemi},1,${String(p.sats || 8).padStart(2, "0")},1.0,${p.h.toFixed(3)},M,0.0,M,,`;

      let checksum = 0;
      for (let i = 0; i < sentence.length; i++) {
        checksum ^= sentence.charCodeAt(i);
      }
      nmea += `$${sentence}*${checksum.toString(16).toUpperCase().padStart(2, "0")}\n`;
    }
    return nmea;
  }
}

class RinexMergerEngine {
  /**
   * RINEX Grup Dosyalarını (OBS, NAV_GPS, NAV_GLO) Tek Hamlede Birleştirir ve Zaman Keser
   */
  static async processGroup(group, onProgress) {
    try {
      onProgress({ type: "LOG", text: `[START] Processing group '${group.id}'...`, code: "GROUP_START" });
      onProgress({ type: "PROGRESS", value: 20 });

      const results = {};
      const timeCrop = group.timeCrop || { enabled: false };
      const decimation = group.decimation || 1;
      const allowedConst = group.allowedConstellations || null;

      // 1. Gözlem (OBS) Dosyalarını Birleştirme
      if (group.obsFiles && group.obsFiles.length > 0) {
        onProgress({ type: "LOG", text: `[OBS] Processing ${group.obsFiles.length} observation files...`, code: "OBS_PROCESSING" });
        const mergedObs = await RinexMergerEngine.mergeAndCropRinexFiles(
          group.obsFiles,
          "OBS",
          group.targetVersion,
          timeCrop,
          decimation,
          allowedConst
        );

        const outName = `${group.station}${String(group.doy).padStart(3, "0")}0.${String(group.year % 100).padStart(2, "0")}O`;
        results.obs = {
          filename: outName,
          content: mergedObs
        };
        onProgress({ type: "LOG", text: `[SUCCESS] Created ${outName} (${(mergedObs.length / 1048576).toFixed(2)} MB).`, code: "OBS_COMPLETE" });
        onProgress({ type: "PROGRESS", value: 70 });
      }

      // 2. GPS Navigasyon Dosyalarını Birleştirme
      if (group.navGpsFiles && group.navGpsFiles.length > 0) {
        onProgress({ type: "LOG", text: `[NAV_GPS] Processing ${group.navGpsFiles.length} GPS navigation files...`, code: "NAV_GPS_PROCESSING" });
        const mergedNavGps = await RinexMergerEngine.mergeAndCropRinexFiles(
          group.navGpsFiles,
          "NAV_GPS",
          group.targetVersion,
          timeCrop,
          1,
          allowedConst
        );

        const outName = `${group.station}${String(group.doy).padStart(3, "0")}0.${String(group.year % 100).padStart(2, "0")}N`;
        results.navGps = {
          filename: outName,
          content: mergedNavGps
        };
        onProgress({ type: "LOG", text: `[SUCCESS] Created ${outName} (${(mergedNavGps.length / 1024).toFixed(1)} KB).`, code: "NAV_GPS_COMPLETE" });
        onProgress({ type: "PROGRESS", value: 85 });
      }

      // 3. GLONASS Navigasyon Dosyalarını Birleştirme
      if (group.navGloFiles && group.navGloFiles.length > 0) {
        onProgress({ type: "LOG", text: `[NAV_GLO] Processing ${group.navGloFiles.length} GLONASS navigation files...`, code: "NAV_GLO_PROCESSING" });
        const mergedNavGlo = await RinexMergerEngine.mergeAndCropRinexFiles(
          group.navGloFiles,
          "NAV_GLO",
          group.targetVersion,
          timeCrop,
          1,
          allowedConst
        );

        const outName = `${group.station}${String(group.doy).padStart(3, "0")}0.${String(group.year % 100).padStart(2, "0")}G`;
        results.navGlo = {
          filename: outName,
          content: mergedNavGlo
        };
        onProgress({ type: "LOG", text: `[SUCCESS] Created ${outName} (${(mergedNavGlo.length / 1024).toFixed(1)} KB).`, code: "NAV_GLO_COMPLETE" });
      }

      onProgress({ type: "PROGRESS", value: 100 });
      onProgress({ type: "COMPLETE", results: results });
      return results;
    } catch (err) {
      onProgress({ type: "LOG", text: `❌ [HATA]: ${err.message || String(err)}` });
      onProgress({ type: "ERROR", message: err.message || String(err) });
    }
  }

  /**
   * Birden Çok RINEX Dosyasını Birleştirir, Header'ı Düzenler ve Zaman Kesimi Uygular
   */
  static async mergeAndCropRinexFiles(fileObjects, fileType, targetVersion = "", timeCrop = { enabled: false }, decimation = 1, allowedConstellations = null) {
    if (fileObjects.length === 0) return "";

    fileObjects.sort((a, b) => a.name.localeCompare(b.name));

    let headerBlock = "";
    const bodyChunks = [];

    for (let i = 0; i < fileObjects.length; i++) {
      const text = fileObjects[i].text;
      const headerEndIdx = text.indexOf("END OF HEADER");
      if (headerEndIdx === -1) continue;

      const curHeader = text.substring(0, headerEndIdx + 13);
      const curBody = text.substring(headerEndIdx + 13);

      if (i === 0) {
        headerBlock = curHeader;
      }
      bodyChunks.push(curBody.trimStart());
    }

    let mergedBody = bodyChunks.join("\n");
    let firstFilteredEpoch = null;
    let lastFilteredEpoch = null;

    if (fileType === "OBS") {
      const isRinex3 = headerBlock.includes("3.0") || headerBlock.includes("3.02") || headerBlock.includes("3.04") || headerBlock.includes("3.05") || headerBlock.includes("4.00");
      const cropStartSec = (timeCrop && timeCrop.enabled) ? timeCrop.startSec : null;
      const cropEndSec = (timeCrop && timeCrop.enabled) ? timeCrop.endSec : null;

      const bodyLines = mergedBody.split(/\r?\n/);
      const outputLines = [];

      let currentEpochHeader = null;
      let currentEpochSatLines = [];
      let currentEpochSec = null;
      let currentEpochObj = null;

      const flushEpoch = () => {
        if (!currentEpochHeader) return;

        const inTimeRange = (cropStartSec === null || currentEpochSec >= cropStartSec) &&
                           (cropEndSec === null || currentEpochSec <= cropEndSec);
        const inDecimation = (decimation <= 1 || Math.round(currentEpochSec) % decimation === 0);

        if (inTimeRange && inDecimation) {
          if (!firstFilteredEpoch) firstFilteredEpoch = currentEpochObj;
          lastFilteredEpoch = currentEpochObj;

          if (isRinex3) {
            const prefix = currentEpochHeader.substring(0, 32);
            const formattedHeader = prefix + String(currentEpochSatLines.length).padStart(3, " ");
            outputLines.push(formattedHeader);
            outputLines.push(...currentEpochSatLines);
          } else {
            outputLines.push(currentEpochHeader);
            outputLines.push(...currentEpochSatLines);
          }
        }
      };

      for (let i = 0; i < bodyLines.length; i++) {
        const line = bodyLines[i];
        if (!line.trim()) continue;

        if (isRinex3) {
          if (line.startsWith(">")) {
            flushEpoch();
            currentEpochSatLines = [];
            currentEpochHeader = line;

            const tokens = line.substring(1).trim().split(/\s+/);
            const y = parseInt(tokens[0]);
            const m = parseInt(tokens[1]);
            const d = parseInt(tokens[2]);
            const h = parseInt(tokens[3]);
            const mi = parseInt(tokens[4]);
            const s = parseFloat(tokens[5]) || 0;

            currentEpochObj = { year: y, month: m, day: d, hour: h, min: mi, sec: s };
            currentEpochSec = h * 3600 + mi * 60 + s;
          } else if (currentEpochHeader) {
            const sysCode = line.substring(0, 1).toUpperCase();
            let isAllowed = true;

            if (allowedConstellations) {
              if (sysCode === "G" && allowedConstellations.GPS === false) isAllowed = false;
              if (sysCode === "R" && allowedConstellations.GLO === false) isAllowed = false;
              if (sysCode === "E" && allowedConstellations.GAL === false) isAllowed = false;
              if (sysCode === "C" && allowedConstellations.BDS === false) isAllowed = false;
              if (sysCode === "J" && allowedConstellations.QZS === false) isAllowed = false;
              if (sysCode === "S" && allowedConstellations.SBS === false) isAllowed = false;
            }

            if (isAllowed) {
              currentEpochSatLines.push(line);
            }
          }
        } else {
          outputLines.push(line);
        }
      }

      flushEpoch();

      if (outputLines.length > 0) {
        mergedBody = outputLines.join("\n");
      }
    }

    if (targetVersion) {
      headerBlock = RinexMergerEngine.formatRinexVersionInHeader(headerBlock, targetVersion);
    }

    // Başlıktaki TIME OF FIRST/LAST OBS Değerlerini Güncelle
    if (firstFilteredEpoch) {
      const firstLine = `  ${firstFilteredEpoch.year}    ${String(firstFilteredEpoch.month).padStart(2, "0")}    ${String(firstFilteredEpoch.day).padStart(2, "0")}    ${String(firstFilteredEpoch.hour).padStart(2, "0")}    ${String(firstFilteredEpoch.min).padStart(2, "0")}   ${firstFilteredEpoch.sec.toFixed(7).padStart(10, " ")}     GPS         TIME OF FIRST OBS`;
      if (headerBlock.includes("TIME OF FIRST OBS")) {
        headerBlock = headerBlock.replace(/^.*TIME OF FIRST OBS.*$/m, firstLine);
      }
    }

    if (lastFilteredEpoch) {
      const lastLine = `  ${lastFilteredEpoch.year}    ${String(lastFilteredEpoch.month).padStart(2, "0")}    ${String(lastFilteredEpoch.day).padStart(2, "0")}    ${String(lastFilteredEpoch.hour).padStart(2, "0")}    ${String(lastFilteredEpoch.min).padStart(2, "0")}   ${lastFilteredEpoch.sec.toFixed(7).padStart(10, " ")}     GPS         TIME OF LAST OBS`;
      if (headerBlock.includes("TIME OF LAST OBS")) {
        headerBlock = headerBlock.replace(/^.*TIME OF LAST OBS.*$/m, lastLine);
      }
    }

    const commentLine = `GNSS WEB TOOLBOX    MERGED IN BROWSER   ${new Date().toISOString().substring(0, 10)} UTC COMMENT             \n`;
    const finalHeader = headerBlock.replace("END OF HEADER", commentLine + "                                                            END OF HEADER");

    return `${finalHeader}\n${mergedBody}\n`;
  }

  /**
   * Başlıktaki RINEX Sürüm Numarasını Yeniden Formatlar
   */
  static formatRinexVersionInHeader(headerText, newVersion) {
    if (!newVersion) return headerText;
    const lines = headerText.split(/\r?\n/);
    if (lines.length > 0 && lines[0].includes("RINEX VERSION")) {
      const verStr = parseFloat(newVersion).toFixed(2);
      const paddedVer = verStr.padStart(9, " ");
      const restOfLine = lines[0].substring(9);
      lines[0] = paddedVer + restOfLine;
      return lines.join("\n");
    }
    return headerText;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    UniversalRinexInspector,
    RinexPowerEngine,
    RinexMergerEngine
  };
}