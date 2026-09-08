class Tg20GeoidEngine {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    this.modelName = "TG-20";
    this.minLat = 35.5;
    this.maxLat = 42.5;
    this.minLon = 25.5;
    this.maxLon = 45;
    this.dLat = 1 / 60;
    this.dLon = 1 / 60;
    this.nRows = 421;
    this.nCols = 1171;
    this.headerSize = 146;
    this.scale = 0.002;
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
        console.warn("Embedded TG-20 optimized model load error:", err);
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
        console.warn("Embedded GGF Base64 load error:", err);
      }
    }
    return false;
  }
  async loadModelFromJson(url = "data/tg20Data.json") {
    if (this.isLoaded) return true;
    if (this.tryLoadEmbeddedModel()) return true;

    const cache = (typeof GeoCacheStore !== "undefined" ? GeoCacheStore : null) ||
                  (typeof window !== "undefined" ? window.__geoCacheStore : null);
    const CACHE_KEY = "TG20_GEOID_MODEL";
    const CURRENT_VERSION = "2020.1";

    // 1. IndexedDB Önbellek Kontrolü (Offline-first)
    if (cache) {
      try {
        const cachedModel = await cache.get(CACHE_KEY, CURRENT_VERSION);
        if (cachedModel) {
          if (typeof window !== "undefined") {
            window.TG20_GEOID_MODEL = cachedModel;
          }
          if (this.tryLoadEmbeddedModel()) {
            if (typeof window !== "undefined" && typeof window.logMessage === "function") {
              window.logMessage("⚡ TG-20 jeoit modeli IndexedDB önbelleğinden yüklendi.");
            }
            return true;
          }
        }
      } catch (cacheErr) {
        console.warn("[TG20] Cache read error, falling back to network fetch:", cacheErr);
      }
    }

    // 2. Ağ Üzerinden İndirme
    try {
      if (typeof window !== "undefined" && typeof window.logMessage === "function") {
        window.logMessage("📥 TG-20 jeoit modeli sunucudan indiriliyor (~1.3MB)...");
      }
      const basePath = typeof window !== "undefined" && window.location ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) : "./";
      const fullUrl = url.startsWith("http") || url.startsWith("/") ? url : `${basePath}${url}`;
      const res = await fetch(`${fullUrl}?v=${Date.now()}`);
      if (!res.ok) throw new Error("ERR_TG20_DOWNLOAD_FAILED");
      const model = await res.json();
      if (typeof window !== "undefined") {
        window.TG20_GEOID_MODEL = model;
      }

      // 3. İleriki Açılışlar İçin IndexedDB'ye Kaydetme
      if (cache) {
        try {
          await cache.set(CACHE_KEY, model, CURRENT_VERSION);
          if (typeof window !== "undefined" && typeof window.logMessage === "function") {
            window.logMessage("✅ TG-20 jeoit modeli indirildi ve IndexedDB'ye önbelleklendi.");
          }
        } catch (saveErr) {
          console.warn("[TG20] Cache write error:", saveErr);
        }
      }

      return this.tryLoadEmbeddedModel();
    } catch (err) {
      console.warn("TG-20 database could not be loaded:", err);
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
          throw new Error("ERR_TG20_GGF_DOWNLOAD_FAILED");
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
        throw new Error("ERR_TG20_NOT_LOADED");
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
        nw: { id: "NW", label: "NW", lat: latNorth, lon: lonWest, N: q11, weight: wNW, weightPercent: (wNW * 100).toFixed(1) },
        ne: { id: "NE", label: "NE", lat: latNorth, lon: lonEast, N: q12, weight: wNE, weightPercent: (wNE * 100).toFixed(1) },
        sw: { id: "SW", label: "SW", lat: latSouth, lon: lonWest, N: q21, weight: wSW, weightPercent: (wSW * 100).toFixed(1) },
        se: { id: "SE", label: "SE", lat: latSouth, lon: lonEast, N: q22, weight: wSE, weightPercent: (wSE * 100).toFixed(1) }
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
        status: "OUT_OF_BOUNDS",
        statusCode: "OUT_OF_BOUNDS"
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
      status: "SUCCESS",
      statusCode: "SUCCESS"
    };
  }
  reduceHeightFromTM(y, x, h, epsgCode, geodesyEngine) {
    if (!geodesyEngine) {
      throw new Error("ERR_GEODESY_REQUIRED");
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
    if (typeof window !== "undefined" && window.GnssReportTemplates?.renderTg20TextReport) {
      return window.GnssReportTemplates.renderTg20TextReport({
        projectName: projectName,
        centralMeridian: null,
        date: new Date().toLocaleDateString("tr-TR"),
        points: points
      });
    }
    return JSON.stringify(points);
  }

  getTg20ReportData(points, projectTitle = "TG-20 Ortometrik Kot Indirgeme") {
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
        y: pt.y || null,
        x: pt.x || null,
        N: res.N !== null ? res.N : pt.N !== null ? pt.N : null,
        H: res.H !== null ? res.H : pt.H !== null ? pt.H : (pt.h != null ? pt.h - (res.N || 0) : null),
        inBounds: res.inBounds,
        type: res.inBounds ? "IN_BOUNDS" : "OUT_OF_BOUNDS",
        typeCode: res.inBounds ? "IN_BOUNDS" : "OUT_OF_BOUNDS"
      };
    });
    const inBounds = evaluated.filter(p => p.inBounds && p.N !== null);
    const avgN = inBounds.length > 0 ? inBounds.reduce((acc, p) => acc + p.N, 0) / inBounds.length : 0;
    const minN = inBounds.length > 0 ? Math.min(...inBounds.map(p => p.N)) : 0;
    const maxN = inBounds.length > 0 ? Math.max(...inBounds.map(p => p.N)) : 0;

    return {
      projectName: projectTitle,
      date: dateStr,
      time: timeStr,
      projectionStr: "GRS80 / WGS-84 (TUREF)",
      totalPointsStr: `${evaluated.length} (${inBounds.length})`,
      avgUndulationStr: `${avgN > 0 ? "+" : ""}${avgN.toFixed(3)} m (Min: ${minN.toFixed(3)} m, Max: ${maxN.toFixed(3)} m)`,
      rows: evaluated
    };
  }

  generatePrintableReport(points, projectTitle = "TG-20 Ortometrik Kot Indirgeme") {
    const data = this.getTg20ReportData(points, projectTitle);
    if (typeof window !== "undefined" && window.GnssReportTemplates?.renderTg20Report) {
      return window.GnssReportTemplates.renderTg20Report(data);
    }
    return JSON.stringify(data);
  }
}

if (typeof window !== "undefined") {
  window.Tg20GeoidEngine = Tg20GeoidEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = Tg20GeoidEngine;
}