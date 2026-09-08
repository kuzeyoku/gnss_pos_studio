class Tg20GeoidEngine {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.modelName = "TG-20 (Türkiye Hibrit Jeoidi 2020)";
    this.minLat = 35.5;
    this.maxLat = 42.5;
    this.minLon = 25.5;
    this.maxLon = 45;
    this.dLat = 1 / 60;
    this.dLon = 1 / 60;
    this.nRows = 421;
    this.nCols = 1171;
    this.headerSize = 146;
    this.scale = 0.001;
    this.gridDataUint16 = null;
    this.gridDataFloat = null;
    this.loadPromise = null;
    this.tryLoadEmbeddedModel();
  }
  tryLoadEmbeddedModel() {
    if (this.isLoaded) {
      return true;
    }
    if (typeof window !== "undefined" && window.TG20_GEOID_MODEL) {
      try {
        const model = window.TG20_GEOID_MODEL;
        this.modelName = model.name || this.modelName;
        this.minLat = model.minLat || this.minLat;
        this.maxLat = model.maxLat || this.maxLat;
        this.minLon = model.minLon || this.minLon;
        this.maxLon = model.maxLon || this.maxLon;
        this.dLat = model.dLat || this.dLat;
        this.dLon = model.dLon || this.dLon;
        this.nRows = model.nRows || this.nRows;
        this.nCols = model.nCols || this.nCols;
        this.scale = model.scale || 0.001;
        const binStr = atob(model.data);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        this.gridDataUint16 = new Uint16Array(bytes.buffer);
        this.isLoaded = true;
        return true;
      } catch (err) {
        console.warn("Gömülü TG-20 optimize model yükleme hatası:", err);
      }
    }
    if (typeof window !== "undefined" && window.TG20_GGF_BASE64) {
      try {
        const raw = window.TG20_GGF_BASE64;
        const binStr = atob(raw);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        this.loadBuffer(bytes.buffer);
        return true;
      } catch (err) {
        console.warn("Gömülü GGF Base64 yükleme hatası:", err);
      }
    }
    return false;
  }
  async loadModelFromJson(url = "data/tg20Data.json") {
    if (this.isLoaded) return true;
    if (this.tryLoadEmbeddedModel()) return true;

    try {
      const basePath = typeof window !== "undefined" && window.location ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) : "./";
      const fullUrl = url.startsWith("http") || url.startsWith("/") ? url : `${basePath}${url}`;
      const res = await fetch(`${fullUrl}?v=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const model = await res.json();
      if (typeof window !== "undefined") {
        window.TG20_GEOID_MODEL = model;
      }
      return this.tryLoadEmbeddedModel();
    } catch (err) {
      console.warn("TG-20 Veritabanı (data/tg20Data.json) yüklenemedi:", err);
      return false;
    }
  }

  async loadFromUrl(url = "./data/TG20.ggf") {
    if (this.isLoaded) {
      return true;
    }
    if (this.tryLoadEmbeddedModel()) {
      return true;
    }
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }
    this.isLoading = true;
    this.loadPromise = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("TG20.ggf indirilemedi (HTTP " + res.status + ")");
        }
        const buffer = await res.arrayBuffer();
        this.loadBuffer(buffer);
        this.isLoaded = true;
        this.isLoading = false;
        return true;
      } catch (err) {
        this.isLoading = false;
        if (this.tryLoadEmbeddedModel()) {
          return true;
        }
        throw err;
      }
    })();
    return this.loadPromise;
  }
  async loadFromFile(file) {
    const buffer = await file.arrayBuffer();
    this.loadBuffer(buffer);
    this.modelName = file.name.replace(/\.[^/.]+$/, "");
    return true;
  }
  loadBuffer(buf) {
    const byteOffset = buf.byteOffset || 0;
    const arrayBuffer = buf.buffer || buf;
    const view = new DataView(arrayBuffer, byteOffset, buf.byteLength || arrayBuffer.byteLength);
    this.minLat = view.getFloat64(48, true);
    this.maxLat = view.getFloat64(56, true);
    this.minLon = view.getFloat64(64, true);
    this.maxLon = view.getFloat64(72, true);
    this.dLat = view.getFloat64(80, true);
    this.dLon = view.getFloat64(88, true);
    this.nRows = view.getInt32(96, true);
    this.nCols = view.getInt32(100, true);
    const totalNodes = this.nRows * this.nCols;
    const gridSlice = arrayBuffer.slice(byteOffset + this.headerSize, byteOffset + this.headerSize + totalNodes * 4);
    this.gridDataFloat = new Float32Array(gridSlice);
    this.gridDataUint16 = null;
    this.isLoaded = true;
  }
  getGeoidHeight(lat, lon) {
    if (!this.isLoaded) {
      this.tryLoadEmbeddedModel();
      if (!this.isLoaded) {
        throw new Error("TG-20 Jeoit Modeli henüz yüklenmedi.");
      }
    }
    if (lat < this.minLat || lat > this.maxLat || lon < this.minLon || lon > this.maxLon) {
      return null;
    }
    const rFloat = (this.maxLat - lat) / this.dLat;
    const cFloat = (lon - this.minLon) / this.dLon;
    const r0 = Math.floor(rFloat);
    const c0 = Math.floor(cFloat);
    const r1 = Math.min(this.nRows - 1, r0 + 1);
    const c1 = Math.min(this.nCols - 1, c0 + 1);
    const dr = rFloat - r0;
    const dc = cFloat - c0;
    let q11;
    let q12;
    let q21;
    let q22;
    if (this.gridDataUint16) {
      q11 = this.gridDataUint16[r0 * this.nCols + c0] * this.scale;
      q12 = this.gridDataUint16[r0 * this.nCols + c1] * this.scale;
      q21 = this.gridDataUint16[r1 * this.nCols + c0] * this.scale;
      q22 = this.gridDataUint16[r1 * this.nCols + c1] * this.scale;
    } else if (this.gridDataFloat) {
      q11 = this.gridDataFloat[r0 * this.nCols + c0];
      q12 = this.gridDataFloat[r0 * this.nCols + c1];
      q21 = this.gridDataFloat[r1 * this.nCols + c0];
      q22 = this.gridDataFloat[r1 * this.nCols + c1];
    } else {
      return null;
    }
    const top = q11 * (1 - dc) + q12 * dc;
    const bottom = q21 * (1 - dc) + q22 * dc;
    return top * (1 - dr) + bottom * dr;
  }

  /**
   * Tıklanan noktanın etrafındaki 4 TG-20 ızgara düğüm noktasını (NW, NE, SW, SE),
   * ondülasyon değerlerini ve enterpolasyon ağırlıklarını detaylı döndürür.
   */
  getGeoidInterpolationDetails(lat, lon) {
    if (!this.isLoaded) {
      if (!this.tryLoadEmbeddedModel()) {
        return null;
      }
    }
    if (lat < this.minLat || lat > this.maxLat || lon < this.minLon || lon > this.maxLon) {
      return null;
    }
    const rFloat = (this.maxLat - lat) / this.dLat;
    const cFloat = (lon - this.minLon) / this.dLon;
    const r0 = Math.floor(rFloat);
    const c0 = Math.floor(cFloat);
    const r1 = Math.min(this.nRows - 1, r0 + 1);
    const c1 = Math.min(this.nCols - 1, c0 + 1);
    const dr = rFloat - r0;
    const dc = cFloat - c0;
    let q11, q12, q21, q22;
    if (this.gridDataUint16) {
      q11 = this.gridDataUint16[r0 * this.nCols + c0] * this.scale;
      q12 = this.gridDataUint16[r0 * this.nCols + c1] * this.scale;
      q21 = this.gridDataUint16[r1 * this.nCols + c0] * this.scale;
      q22 = this.gridDataUint16[r1 * this.nCols + c1] * this.scale;
    } else if (this.gridDataFloat) {
      q11 = this.gridDataFloat[r0 * this.nCols + c0];
      q12 = this.gridDataFloat[r0 * this.nCols + c1];
      q21 = this.gridDataFloat[r1 * this.nCols + c0];
      q22 = this.gridDataFloat[r1 * this.nCols + c1];
    } else {
      return null;
    }

    const wNW = (1 - dr) * (1 - dc);
    const wNE = (1 - dr) * dc;
    const wSW = dr * (1 - dc);
    const wSE = dr * dc;

    const latNorth = this.maxLat - r0 * this.dLat;
    const latSouth = this.maxLat - r1 * this.dLat;
    const lonWest = this.minLon + c0 * this.dLon;
    const lonEast = this.minLon + c1 * this.dLon;

    const top = q11 * (1 - dc) + q12 * dc;
    const bottom = q21 * (1 - dc) + q22 * dc;
    const interpolatedN = top * (1 - dr) + bottom * dr;

    return {
      interpolatedN: interpolatedN,
      lat: lat,
      lon: lon,
      dr: dr,
      dc: dc,
      cellBounds: [
        [latSouth, lonWest], // SW
        [latSouth, lonEast], // SE
        [latNorth, lonEast], // NE
        [latNorth, lonWest]  // NW
      ],
      nodes: {
        nw: { id: "NW", label: "Kuzeybatı (NW)", lat: latNorth, lon: lonWest, N: q11, weight: wNW, weightPercent: (wNW * 100).toFixed(1) },
        ne: { id: "NE", label: "Kuzeydoğu (NE)", lat: latNorth, lon: lonEast, N: q12, weight: wNE, weightPercent: (wNE * 100).toFixed(1) },
        sw: { id: "SW", label: "Güneybatı (SW)", lat: latSouth, lon: lonWest, N: q21, weight: wSW, weightPercent: (wSW * 100).toFixed(1) },
        se: { id: "SE", label: "Güneydoğu (SE)", lat: latSouth, lon: lonEast, N: q22, weight: wSE, weightPercent: (wSE * 100).toFixed(1) }
      }
    };
  }

  reduceHeight(lat, lon, h) {
    const N = this.getGeoidHeight(lat, lon);
    if (N === null) {
      return {
        lat: lat,
        lon: lon,
        h: h,
        N: null,
        H: h,
        inBounds: false,
        model: this.modelName,
        status: "TG-20 Kapsamı Dışı (35.5°-42.5°K, 25.5°-45.0°D)"
      };
    }
    const H = h - N;
    return {
      lat: lat,
      lon: lon,
      h: h,
      N: N,
      H: H,
      inBounds: true,
      model: this.modelName,
      status: "Başarılı (TG-20)"
    };
  }
  reduceHeightFromTM(y, x, h, epsgCode, geodesyEngine) {
    if (!geodesyEngine) {
      throw new Error("Projeksiyon dönüşümü için GeodesyEngine gereklidir.");
    }
    const geo = geodesyEngine.transformCoordinate({
      c1: y,
      c2: x,
      c3: h
    }, epsgCode, "EPSG:4326");
    const result = this.reduceHeight(geo.lat, geo.lon, h);
    return {
      ...result,
      y: y,
      x: x,
      epsgCode: epsgCode
    };
  }
  batchReducePoints(points, inputEpsg, geodesyEngine) {
    const isWgs84 = inputEpsg === "EPSG:4326";
    return points.map(pt => {
      let lat = isWgs84 ? pt.c1 : 0;
      let lon = isWgs84 ? pt.c2 : 0;
      let y = isWgs84 ? 0 : pt.c1;
      let x = isWgs84 ? 0 : pt.c2;
      const h = pt.h || 0;
      if (!isWgs84) {
        const geo = geodesyEngine.transformCoordinate({
          c1: y,
          c2: x,
          c3: h
        }, inputEpsg, "EPSG:4326");
        lat = geo.lat;
        lon = geo.lon;
      }
      const res = this.reduceHeight(lat, lon, h);
      return {
        name: pt.name,
        y: y,
        x: x,
        lat: lat,
        lon: lon,
        h: h,
        N: res.N,
        H: res.H,
        inBounds: res.inBounds,
        status: res.status
      };
    });
  }
  generateReductionReport(points, projectName = "Kadastro_TG20_Kot_Indirgeme") {
    const dateStr = new Date().toLocaleDateString("tr-TR");
    let report = "========================================================================================\n          GNSS POS WEB STUDIO - TG-20 TÜRKİYE HİBRİT JEOİDİ İNDİRGEME RAPORU            \n========================================================================================\nProje Adı           : " + projectName + "\nJeoit Modeli        : Harita Genel Müdürlüğü TG-20 (Türkiye Hibrit Jeoidi 2020)\nTarih               : " + dateStr + "\nToplam Nokta Sayısı : " + points.length + "\nTemel Bağıntı       : H (Ortometrik Nivelman Kotu) = h (Elipsoit Kotu) - N (Jeoit Undülasyonu)\n----------------------------------------------------------------------------------------\nNOKTA ADI     ENLEM (Lat)   BOYLAM (Lon)    ELİPSOİT (h)   JEOİT (N)   ORTOMETRİK (H)  DURUM\n----------------------------------------------------------------------------------------\n";
    points.forEach(pt => {
      const name = (pt.name || "P").padEnd(12, " ");
      const latStr = pt.lat.toFixed(6).padStart(12, " ");
      const lonStr = pt.lon.toFixed(6).padStart(12, " ");
      const hStr = pt.h.toFixed(3).padStart(12, " ");
      const nStr = (pt.N !== null ? (pt.N >= 0 ? "+" : "") + pt.N.toFixed(3) : "--").padStart(10, " ");
      const orthoStr = (pt.H !== null ? pt.H.toFixed(3) : "--").padStart(14, " ");
      const status = pt.inBounds ? "TG-20 OK" : "Dışında";
      report += name + " " + latStr + " " + lonStr + " " + hStr + " " + nStr + " " + orthoStr + "   " + status + "\n";
    });
    report += "========================================================================================\n";
    return report;
  }
  generatePrintableReport(points, projectTitle = "TG-20 ORTOMETRİK KOT İNDİRGEME PROJESİ") {
    const dateStr = new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const timeStr = new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    });
    const evaluated = points.map(pt => {
      const res = this.reduceHeight(pt.lat, pt.lon, pt.h);
      return {
        name: pt.name || "P",
        lat: pt.lat,
        lon: pt.lon,
        h: pt.h,
        N: res.N !== null ? res.N : pt.N !== null ? pt.N : null,
        H: res.H !== null ? res.H : pt.H !== null ? pt.H : pt.h - (res.N || 0),
        inBounds: res.inBounds,
        status: res.status
      };
    });
    const inBounds = evaluated.filter(p => p.inBounds && p.N !== null);
    const avgN = inBounds.length > 0 ? inBounds.reduce((acc, p) => acc + p.N, 0) / inBounds.length : 0;
    const minN = inBounds.length > 0 ? Math.min(...inBounds.map(p => p.N)) : 0;
    const maxN = inBounds.length > 0 ? Math.max(...inBounds.map(p => p.N)) : 0;
    
    let rowsHtml = "";
    evaluated.forEach((pt, idx) => {
      const nStr = pt.N !== null ? (pt.N >= 0 ? "+" : "") + pt.N.toFixed(3) : "Kapsam Dışı";
      const hStr = pt.H !== null ? pt.H.toFixed(3) : (pt.h !== null ? Number(pt.h).toFixed(3) : "--");
      const elipStr = pt.h !== null ? Number(pt.h).toFixed(3) : "--";
      const badgeCls = pt.inBounds ? "badge-ok" : "badge-out";
      const badgeText = pt.inBounds ? "TG-20 OK" : "Dışında";

      rowsHtml += `<tr>
        <td class="col-num">${idx + 1}</td>
        <td class="col-pname"><strong>${pt.name}</strong></td>
        <td class="col-lat font-mono">${pt.lat.toFixed(6)}°</td>
        <td class="col-lon font-mono">${pt.lon.toFixed(6)}°</td>
        <td class="col-metric font-mono">--</td>
        <td class="col-metric font-mono">--</td>
        <td class="col-metric font-mono">${elipStr} m</td>
        <td class="col-metric col-geoid font-mono">${nStr} m</td>
        <td class="col-metric col-ortho font-mono">${hStr} m</td>
        <td class="col-obstype"><span class="${badgeCls}">${badgeText}</span></td>
      </tr>\n`;
    });

    // Single Source of Truth: reports/tg20-report.html şablonunu al
    let tpl = (typeof window !== "undefined" && window.GnssReportTemplates?.getTg20Template)
      ? window.GnssReportTemplates.getTg20Template()
      : "";

    if (tpl) {
      return tpl
        .replace(/{{TITLE}}/g, "TG-20 Jeoit İndirgeme Raporu")
        .replace(/{{BTN_PRINT}}/g, "🖨️ Yazdır / PDF Kaydet")
        .replace(/{{BRAND_TITLE}}/g, "HARİTA TOOLS — JEODEZİ & GNSS STÜDYOSU")
        .replace(/{{BRAND_SUB}}/g, "Profesyonel Jeodezi, Fotogrametri & GNSS Hesaplama Platformu | Geografik Harita ve Coğrafi Bilgi Teknolojileri")
        .replace(/{{META_HEADER}}/g, "TG-20 Jeoit İndirgeme Çetelesi")
        .replace(/{{LBL_DATETIME}}/g, "Tarih / Saat:")
        .replace(/{{DATE}}/g, dateStr)
        .replace(/{{TIME}}/g, timeStr)
        .replace(/{{MAIN_TITLE}}/g, "TG-20 TÜRKİYE HİBRİT JEOİDİ ORTOMETRİK KOT İNDİRGEME RAPORU")
        .replace(/{{SUB_TITLE}}/g, "GPS / GNSS Ölçümlerinin TUDKA-99 Helmert Ortometrik Nivelman Kotuna İndirgenmesi (BÖHHBÜY Standartları)")
        .replace(/{{LBL_PROJECT}}/g, "Proje / İş Adı:")
        .replace(/{{PROJECT}}/g, projectTitle)
        .replace(/{{LBL_CALC_DATE}}/g, "Hesaplama Tarihi:")
        .replace(/{{LBL_PROJECTION}}/g, "Referans Sistemi:")
        .replace(/{{PROJECTION_STR}}/g, "GRS80 / WGS-84 (TUREF)")
        .replace(/{{LBL_GEOID_MODEL}}/g, "Kullanılan Jeoit Modeli:")
        .replace(/{{VAL_GEOID_MODEL}}/g, "HGM TG-20 (Türkiye Hibrit Jeoidi 2020) — 1' x 1' Grid")
        .replace(/{{LBL_TOTAL_POINTS}}/g, "Toplam Nokta Sayısı:")
        .replace(/{{TOTAL_POINTS}}/g, `${evaluated.length} Nokta (${inBounds.length} Kapsam İçi)`)
        .replace(/{{LBL_VERTICAL_DATUM}}/g, "Düşey Datum:")
        .replace(/{{VAL_VERTICAL_DATUM}}/g, "TUDKA-99 Türkiye Ulusal Düşey Kontrol Ağı")
        .replace(/{{FORMULA_TITLE}}/g, "Temel Formül:")
        .replace(/{{AVG_UNDULATION_PREFIX}}/g, "Ortalama N:")
        .replace(/{{AVG_UNDULATION}}/g, `${avgN > 0 ? "+" : ""}${avgN.toFixed(3)} m (Min: ${minN.toFixed(3)} m, Max: ${maxN.toFixed(3)} m)`)
        .replace(/{{TH_NUM}}/g, "#")
        .replace(/{{TH_POINT_NAME}}/g, "Nokta Adı")
        .replace(/{{TH_LAT}}/g, "Enlem (ϕ)")
        .replace(/{{TH_LON}}/g, "Boylam (λ)")
        .replace(/{{TH_EAST_M}}/g, "Sağa (Y)")
        .replace(/{{TH_NORTH_M}}/g, "Yukarı (X)")
        .replace(/{{TH_ELEV_ELLIPSOID_M}}/g, "Elipsoit Kotu (h)")
        .replace(/{{TH_UNDULATION_M}}/g, "TG-20 (N)")
        .replace(/{{TH_ELEV_ORTHO_M}}/g, "Ortometrik Kot (H)")
        .replace(/{{TH_OBS_TYPE}}/g, "Durum")
        .replace(/{{TABLE_ROWS}}/g, rowsHtml)
        .replace(/{{DISCLAIMER_TITLE}}/g, "⚠️ Yasal Bilgilendirme ve Sorumluluk Reddi Beyanı")
        .replace(/{{DISCLAIMER_TEXT}}/g, "Bu hesaplama raporu, Harita Genel Müdürlüğü (HGM) resmi TG-20 modeli kullanılarak Harita Tools tarafından teknik kontrol amaçlı üretilmiştir. Resmi onay yerine geçmez.")
        .replace(/{{FOOTER_BRAND}}/g, "Harita Tools © 2026 | Jeodezi & GNSS Stüdyosu — Geografik Harita ve Coğrafi Bilgi Teknolojileri")
        .replace(/{{FOOTER_REF}}/g, "Referans: HGM TG-20 (TUDKA-99 Düşey Kontrol Sistemi)")
        .replace(/{{FOOTER_PAGE}}/g, "Sayfa 1 / 1");
    }

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>TG-20 Rapor</title></head><body><h1>TG-20 Raporu</h1><table border="1">${rowsHtml}</table></body></html>`;
  }
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Tg20GeoidEngine;
}