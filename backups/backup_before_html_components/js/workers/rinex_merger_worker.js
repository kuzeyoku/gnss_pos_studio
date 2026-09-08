/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - RINEX BİRLEŞTİRME WORKER MOTORU (rinex_merger_worker)
 * =========================================================================================
 *  - Çoklu RINEX Gözlem (OBS), GPS Navigasyon (NAV) ve GLONASS Navigasyon Dosyalarını Birleştirir
 *  - RINEX 2.x ve 3.x/4.x Epoch Ayrıştırma, Kesme (Time Cropping) & Seyreltme (Decimation)
 *  - Uydu Takımyıldızı Filtreleme (GPS, GLONASS, Galileo, BeiDou, QZSS, SBAS)
 *  - Başlık Güncelleme: TIME OF FIRST OBS, TIME OF LAST OBS ve Merged Comment
 * =========================================================================================
 */

self.onmessage = async function (event) {
  const { action, group } = event.data;

  if (action === "MERGE_GROUP") {
    try {
      self.postMessage({
        type: "LOG",
        text: `🚀 '${group.id}' grubu için tarayıcı içi işleme başlatılıyor...`
      });
      self.postMessage({ type: "PROGRESS", value: 20 });

      const results = {};
      const timeCrop = group.timeCrop || { enabled: false };
      const decimation = group.decimation || 1;
      const allowedConstellations = group.allowedConstellations || null;

      // 1. Gözlem Dosyalarını (OBS) Birleştir
      if (group.obsFiles && group.obsFiles.length > 0) {
        self.postMessage({
          type: "LOG",
          text: `📦 ${group.obsFiles.length} adet Gözlem (OBS) dosyası işleniyor...`
        });

        const mergedObsContent = await mergeAndCropRinexFiles(
          group.obsFiles,
          "OBS",
          group.targetVersion,
          timeCrop,
          decimation,
          allowedConstellations
        );

        const yearShort = String(group.year % 100).padStart(2, "0");
        const doyStr = String(group.doy).padStart(3, "0");
        const obsFilename = `${group.station}${doyStr}0.${yearShort}O`;

        results.obs = {
          filename: obsFilename,
          content: mergedObsContent
        };

        self.postMessage({
          type: "LOG",
          text: `✨ [BAŞARILI] ${obsFilename} oluşturuldu (${(mergedObsContent.length / 1048576).toFixed(2)} MB).`
        });
        self.postMessage({ type: "PROGRESS", value: 70 });
      }

      // 2. GPS Navigasyon Dosyalarını (NAV) Birleştir
      if (group.navGpsFiles && group.navGpsFiles.length > 0) {
        self.postMessage({
          type: "LOG",
          text: `🛰️ ${group.navGpsFiles.length} adet GPS Navigasyon dosyası işleniyor...`
        });

        const mergedGpsNavContent = await mergeAndCropRinexFiles(
          group.navGpsFiles,
          "NAV_GPS",
          group.targetVersion,
          timeCrop,
          1,
          allowedConstellations
        );

        const yearShort = String(group.year % 100).padStart(2, "0");
        const doyStr = String(group.doy).padStart(3, "0");
        const navGpsFilename = `${group.station}${doyStr}0.${yearShort}N`;

        results.navGps = {
          filename: navGpsFilename,
          content: mergedGpsNavContent
        };

        self.postMessage({
          type: "LOG",
          text: `✨ [BAŞARILI] ${navGpsFilename} oluşturuldu (${(mergedGpsNavContent.length / 1024).toFixed(1)} KB).`
        });
        self.postMessage({ type: "PROGRESS", value: 85 });
      }

      // 3. GLONASS Navigasyon Dosyalarını (GLO) Birleştir
      if (group.navGloFiles && group.navGloFiles.length > 0) {
        self.postMessage({
          type: "LOG",
          text: `📡 ${group.navGloFiles.length} adet GLONASS Navigasyon dosyası işleniyor...`
        });

        const mergedGloNavContent = await mergeAndCropRinexFiles(
          group.navGloFiles,
          "NAV_GLO",
          group.targetVersion,
          timeCrop,
          1,
          allowedConstellations
        );

        const yearShort = String(group.year % 100).padStart(2, "0");
        const doyStr = String(group.doy).padStart(3, "0");
        const navGloFilename = `${group.station}${doyStr}0.${yearShort}G`;

        results.navGlo = {
          filename: navGloFilename,
          content: mergedGloNavContent
        };

        self.postMessage({
          type: "LOG",
          text: `✨ [BAŞARILI] ${navGloFilename} oluşturuldu (${(mergedGloNavContent.length / 1024).toFixed(1)} KB).`
        });
      }

      self.postMessage({ type: "PROGRESS", value: 100 });
      self.postMessage({ type: "COMPLETE", results: results });

    } catch (err) {
      self.postMessage({
        type: "LOG",
        text: `❌ [HATA]: ${err.message || String(err)}`
      });
      self.postMessage({
        type: "ERROR",
        message: err.message || String(err)
      });
    }
  }
};

/**
 * RINEX Dosyalarını Birleştirir, Zaman Aralığına Göre Kırpar ve Filtreler
 */
async function mergeAndCropRinexFiles(files, fileType, targetVersion = "", timeCrop = { enabled: false }, decimationStep = 1, allowedConstellations = null) {
  if (!files || files.length === 0) return "";

  files.sort((a, b) => a.name.localeCompare(b.name));

  let primaryHeader = "";
  const bodySections = [];

  for (let i = 0; i < files.length; i++) {
    const text = files[i].text;
    const endHeaderIdx = text.indexOf("END OF HEADER");
    if (endHeaderIdx === -1) continue;

    const header = text.substring(0, endHeaderIdx + 13);
    const body = text.substring(endHeaderIdx + 13);

    if (i === 0) {
      primaryHeader = header;
    }
    bodySections.push(body.trimStart());
  }

  let fullBody = bodySections.join("\n");
  let firstObsTime = null;
  let lastObsTime = null;

  if (fileType === "OBS") {
    const isRinex3 = primaryHeader.includes("3.0") || primaryHeader.includes("3.02") || primaryHeader.includes("3.04") || primaryHeader.includes("3.05") || primaryHeader.includes("4.00");
    const cropStartSec = timeCrop && timeCrop.enabled ? timeCrop.startSec : null;
    const cropEndSec = timeCrop && timeCrop.enabled ? timeCrop.endSec : null;

    const lines = fullBody.split(/\r?\n/);
    const filteredLines = [];

    let currentEpochHeader = null;
    let currentSatLines = [];
    let currentEpochSec = null;
    let currentEpochTimeObj = null;

    const flushCurrentEpoch = () => {
      if (!currentEpochHeader) return;

      const isInCropRange = (cropStartSec === null || currentEpochSec >= cropStartSec) && (cropEndSec === null || currentEpochSec <= cropEndSec);
      const isDecimationMatch = decimationStep <= 1 || Math.round(currentEpochSec) % decimationStep === 0;

      if (isInCropRange && isDecimationMatch) {
        if (!firstObsTime) firstObsTime = currentEpochTimeObj;
        lastObsTime = currentEpochTimeObj;

        if (isRinex3) {
          const headerPrefix = currentEpochHeader.substring(0, 32);
          const satCountStr = String(currentSatLines.length).padStart(3, " ");
          filteredLines.push(headerPrefix + satCountStr);
          filteredLines.push(...currentSatLines);
        } else {
          filteredLines.push(currentEpochHeader);
          filteredLines.push(...currentSatLines);
        }
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      if (isRinex3) {
        if (line.startsWith(">")) {
          flushCurrentEpoch();
          currentSatLines = [];
          currentEpochHeader = line;

          const tokens = line.substring(1).trim().split(/\s+/);
          const yr = parseInt(tokens[0], 10);
          const mo = parseInt(tokens[1], 10);
          const dy = parseInt(tokens[2], 10);
          const hr = parseInt(tokens[3], 10);
          const mn = parseInt(tokens[4], 10);
          const sc = parseFloat(tokens[5]) || 0;

          currentEpochTimeObj = { year: yr, month: mo, day: dy, hour: hr, min: mn, sec: sc };
          currentEpochSec = hr * 3600 + mn * 60 + sc;
        } else if (currentEpochHeader) {
          const sysChar = line.substring(0, 1).toUpperCase();
          let keepSat = true;

          if (allowedConstellations) {
            if (sysChar === "G" && allowedConstellations.GPS === false) keepSat = false;
            if (sysChar === "R" && allowedConstellations.GLO === false) keepSat = false;
            if (sysChar === "E" && allowedConstellations.GAL === false) keepSat = false;
            if (sysChar === "C" && allowedConstellations.BDS === false) keepSat = false;
            if (sysChar === "J" && allowedConstellations.QZS === false) keepSat = false;
            if (sysChar === "S" && allowedConstellations.SBS === false) keepSat = false;
          }

          if (keepSat) {
            currentSatLines.push(line);
          }
        }
      } else {
        filteredLines.push(line);
      }
    }

    flushCurrentEpoch();

    if (filteredLines.length > 0) {
      fullBody = filteredLines.join("\n");
    }
  }

  if (targetVersion) {
    primaryHeader = formatRinexVersionInHeader(primaryHeader, targetVersion);
  }

  if (firstObsTime) {
    const firstObsStr = `  ${firstObsTime.year}    ${String(firstObsTime.month).padStart(2, "0")}    ${String(firstObsTime.day).padStart(2, "0")}    ${String(firstObsTime.hour).padStart(2, "0")}    ${String(firstObsTime.min).padStart(2, "0")}   ${firstObsTime.sec.toFixed(7).padStart(10, " ")}     GPS         TIME OF FIRST OBS`;
    if (primaryHeader.includes("TIME OF FIRST OBS")) {
      primaryHeader = primaryHeader.replace(/^.*TIME OF FIRST OBS.*$/m, firstObsStr);
    }
  }

  if (lastObsTime) {
    const lastObsStr = `  ${lastObsTime.year}    ${String(lastObsTime.month).padStart(2, "0")}    ${String(lastObsTime.day).padStart(2, "0")}    ${String(lastObsTime.hour).padStart(2, "0")}    ${String(lastObsTime.min).padStart(2, "0")}   ${lastObsTime.sec.toFixed(7).padStart(10, " ")}     GPS         TIME OF LAST OBS`;
    if (primaryHeader.includes("TIME OF LAST OBS")) {
      primaryHeader = primaryHeader.replace(/^.*TIME OF LAST OBS.*$/m, lastObsStr);
    }
  }

  const commentLine = `GNSS WEB TOOLBOX    MERGED IN BROWSER   ${new Date().toISOString().substring(0, 10)} UTC COMMENT             \n`;
  const mergedHeader = primaryHeader.replace("END OF HEADER", commentLine + "                                                            END OF HEADER");

  return `${mergedHeader}\n${fullBody}\n`;
}

/**
 * RINEX Başlığındaki Sürüm Bilgisini Günceller
 */
function formatRinexVersionInHeader(headerText, targetVersion) {
  if (!targetVersion) return headerText;

  const lines = headerText.split(/\r?\n/);
  if (lines.length > 0 && lines[0].includes("RINEX VERSION")) {
    const verStr = parseFloat(targetVersion).toFixed(2).padStart(9, " ");
    const restOfLine = lines[0].substring(9);
    lines[0] = verStr + restOfLine;
    return lines.join("\n");
  }

  return headerText;
}