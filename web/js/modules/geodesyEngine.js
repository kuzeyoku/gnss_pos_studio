/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - JEODEZİ VE KOORDİNAT DÖNÜŞÜM MOTORU (GeodesyEngine)
 * =========================================================================================
 *  - ITRF-96 (GRS80) ve ED-50 (Hayford) Elipsoit Parametreleri
 *  - Transverse Mercator (TM 3° ve UTM 6°) Düz ve Ters Projeksiyon (Gauss-Krüger / Redfearn)
 *  - ECEF (Kartezyen X, Y, Z) <-> Coğrafi (Enlem, Boylam, Elipsoit Kotu) Dönüşümleri (Bowring)
 *  - 7-Parametreli 3B Bursa-Wolf ve Molodensky-Badekas Datum Dönüşümleri (ITRF96 <-> ED50)
 *  - 2B Helmert Afin / Benzerlik Dönüşümü & Netcad .DNS Dosya Ayrıştırıcı/Üreticisi
 *  - 3B Bursa-Wolf En Küçük Kareler (LSE) Parametre Çözücü
 * =========================================================================================
 */

class GeodesyEngine {
  static epsgData = null;
  static epsgRegistry = {};
  static loadPromise = null;

  /**
   * data/epsg_registry.json dosyasından güncel EPSG sistemlerini asenkron ve tekil olarak yükler
   * Single Source of Truth (Tek Gerçek Kaynak) mimarisi
   */
  static async loadEpsgRegistry() {
    if (GeodesyEngine.epsgData) return GeodesyEngine.epsgData;
    if (GeodesyEngine.loadPromise) return GeodesyEngine.loadPromise;

    GeodesyEngine.loadPromise = (async () => {
      try {
        const basePath = (typeof window !== "undefined" && window.location && window.location.pathname)
          ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
          : '';
        const res = await fetch(`${basePath}data/epsg_registry.json?v=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.systems)) {
            GeodesyEngine.epsgData = json;
            GeodesyEngine.epsgRegistry = {};
            for (const sys of json.systems) {
              GeodesyEngine.epsgRegistry[sys.code] = sys;
            }
          }
        }
      } catch (e) {
        console.warn("EPSG registry (data/epsg_registry.json) could not be loaded:", e);
      }
      return GeodesyEngine.epsgData;
    })();

    return GeodesyEngine.loadPromise;
  }

  constructor() {
    const el = (typeof HaritaGeodesy !== 'undefined' && HaritaGeodesy.ELLIPSOIDS) ? HaritaGeodesy.ELLIPSOIDS : {
      GRS80: { a: 6378137.0, f: 1.0 / 298.257222101, b: 6378137.0 * (1.0 - 1.0 / 298.257222101), e2: (1.0 / 298.257222101) * 2.0 - (1.0 / 298.257222101) ** 2 },
      HAYFORD1924: { a: 6378388.0, f: 1.0 / 297.0, b: 6378388.0 * (1.0 - 1.0 / 297.0), e2: (1.0 / 297.0) * 2.0 - (1.0 / 297.0) ** 2 }
    };

    // GRS80 Elipsoidi Parametreleri (ITRF96 / WGS84 / TUREF)
    this.a_grs80 = el.GRS80.a;
    this.f_grs80 = el.GRS80.f;
    this.b_grs80 = el.GRS80.b;
    this.e2_grs80 = el.GRS80.e2;

    // International 1924 / Hayford Elipsoidi Parametreleri (ED50)
    this.a_hayford = el.HAYFORD1924.a;
    this.f_hayford = el.HAYFORD1924.f;
    this.b_hayford = el.HAYFORD1924.b;
    this.e2_hayford = el.HAYFORD1924.e2;

    // Türkiye Geneli Ortalama 7-Parametreli Bursa-Wolf Dönüşüm Değerleri (ITRF96 -> ED50)
    this.customParams = {
      dx: -84.1,
      dy: -101.8,
      dz: -129.7,
      rx: 0.0,
      ry: 0.0,
      rz: 0.0,
      ds: 0.0
    };

    // EPSG Projeksiyon ve Datum Tanım Kayıtları (Tek Kaynak: data/epsg_registry.json)
    this.epsgData = GeodesyEngine.epsgData;
    this.epsgRegistry = GeodesyEngine.epsgRegistry || {};
    if (!GeodesyEngine.epsgData) {
      GeodesyEngine.loadEpsgRegistry().then(() => {
        this.epsgData = GeodesyEngine.epsgData;
        this.epsgRegistry = GeodesyEngine.epsgRegistry || {};
        if (typeof window !== "undefined" && window.refreshEpsgSelects) {
          window.refreshEpsgSelects();
        }
      });
    }
  }

  /**
   * epsgData verisinden O(1) arama sözlüğü üretir
   */
  rebuildEpsgRegistry() {
    this.epsgRegistry = {};
    const data = this.epsgData || GeodesyEngine.epsgData;
    if (data && Array.isArray(data.systems)) {
      for (const sys of data.systems) {
        this.epsgRegistry[sys.code] = sys;
      }
    }
  }

  /**
   * data/epsg_registry.json dosyasından güncel EPSG sistemlerini asenkron yükler
   */
  async fetchExternalJson() {
    const data = await GeodesyEngine.loadEpsgRegistry();
    if (data) {
      this.epsgData = data;
      this.epsgRegistry = GeodesyEngine.epsgRegistry || {};
      if (typeof window !== "undefined" && window.refreshEpsgSelects) {
        window.refreshEpsgSelects();
      }
    }
    return data;
  }

  /**
   * Herhangi bir select DOM elemanını EPSG JSON kayıtlarıyla dinamik doldurur
   * @param {HTMLSelectElement} selectEl 
   * @param {string} selectedCode 
   */
  populateSelect(selectEl, selectedCode = null) {
    const data = this.epsgData || GeodesyEngine.epsgData;
    if (!selectEl || !data) return;
    const curVal = selectedCode || selectEl.value;
    selectEl.innerHTML = "";

    const groups = data.groups || [];
    const systems = data.systems || [];

    for (const grp of groups) {
      const grpSystems = systems.filter(s => s.group === grp.id);
      if (grpSystems.length === 0) continue;

      const optgroup = document.createElement("optgroup");
      optgroup.label = grp.label;

      for (const sys of grpSystems) {
        const option = document.createElement("option");
        option.value = sys.code;
        option.textContent = sys.name;
        if (sys.code === curVal) {
          option.selected = true;
        }
        optgroup.appendChild(option);
      }
      selectEl.appendChild(optgroup);
    }
  }

  /**
   * Boylam değerine göre Türkiye için en yakın TM 3° Dilim Orta Meridyenini (DOM) seçer.
   */
  getAutoCentralMeridian3Deg(lon) {
    const candidateDOMs = [27, 30, 33, 36, 39, 42, 45];
    let bestDOM = 30;
    let minDiff = 999;
    for (let dom of candidateDOMs) {
      const diff = Math.abs(lon - dom);
      if (diff < minDiff) {
        minDiff = diff;
        bestDOM = dom;
      }
    }
    return bestDOM;
  }

  /**
   * WGS-84 / ITRF-96 Coğrafi Koordinatını TUREF TM 3° Düzlem Koordinatına (Y, X) Dönüştürür
   */
  wgs84ToTurefTM(latDeg, lonDeg, dom = null) {
    const centralMeridian = dom || this.getAutoCentralMeridian3Deg(lonDeg);
    return this.forwardTM(latDeg, lonDeg, centralMeridian, 1.0, false);
  }

  /**
   * TUREF TM 3° Düzlem Koordinatını (Y, X) WGS-84 / ITRF-96 Coğrafi Koordinatına Dönüştürür
   */
  turefTMToWgs84(easting, northing, dom = 30) {
    return this.inverseTM(easting, northing, dom, 1.0, false);
  }

  /**
   * Düz Transverse Mercator (TM / Gauss-Krüger) Projeksiyonu
   * Coğrafi (Enlem, Boylam) -> Düzlem (Sağa Değer Y, Yukarı Değer X)
   */
  forwardTM(latDeg, lonDeg, lon0Deg = 30, scale0 = 1.0, isHayford = false) {
    const a = isHayford ? this.a_hayford : this.a_grs80;
    const e2 = isHayford ? this.e2_hayford : this.e2_grs80;
    const ep2 = e2 / (1.0 - e2);

    const phi = latDeg * (Math.PI / 180.0);
    const lambda = lonDeg * (Math.PI / 180.0);
    const lambda0 = lon0Deg * (Math.PI / 180.0);
    const dLambda = lambda - lambda0;

    const N = a / Math.sqrt(1.0 - e2 * Math.sin(phi) ** 2);
    const T = Math.tan(phi) ** 2;
    const C = ep2 * Math.cos(phi) ** 2;
    const A = Math.cos(phi) * dLambda;

    const e4 = e2 * e2;
    const e6 = e4 * e2;
    const M = a * (
      (1.0 - e2 / 4.0 - e4 * 3.0 / 64.0 - e6 * 5.0 / 256.0) * phi
      - (e2 * 3.0 / 8.0 + e4 * 3.0 / 32.0 + e6 * 45.0 / 1024.0) * Math.sin(2.0 * phi)
      + (e4 * 15.0 / 256.0 + e6 * 45.0 / 1024.0) * Math.sin(4.0 * phi)
      - (e6 * 35.0 / 3072.0) * Math.sin(6.0 * phi)
    );

    const easting = scale0 * N * (
      A
      + (1.0 - T + C) * (A ** 3) / 6.0
      + (5.0 - 18.0 * T + T ** 2 + 72.0 * C - 58.0 * ep2) * (A ** 5) / 120.0
    ) + 500000.0;

    const northing = scale0 * (
      M + N * Math.tan(phi) * (
        (A ** 2) / 2.0
        + (5.0 - T + 9.0 * C + 4.0 * (C ** 2)) * (A ** 4) / 24.0
        + (61.0 - 58.0 * T + T ** 2 + 600.0 * C - 330.0 * ep2) * (A ** 6) / 720.0
      )
    );

    return {
      easting: easting,
      northing: northing,
      y: easting,
      x: northing,
      Y: easting,
      X: northing
    };
  }

  /**
   * Ters Transverse Mercator (TM / Gauss-Krüger) Projeksiyonu
   * Düzlem (Sağa Değer Y, Yukarı Değer X) -> Coğrafi (Enlem, Boylam)
   */
  inverseTM(easting, northing, lon0Deg = 30, scale0 = 1.0, isHayford = false) {
    const a = isHayford ? this.a_hayford : this.a_grs80;
    const e2 = isHayford ? this.e2_hayford : this.e2_grs80;
    const ep2 = e2 / (1.0 - e2);

    const xScaled = northing / scale0;
    const yScaled = (easting - 500000.0) / scale0;

    const e4 = e2 * e2;
    const e6 = e4 * e2;
    const e1 = (1.0 - Math.sqrt(1.0 - e2)) / (1.0 + Math.sqrt(1.0 - e2));

    const mu = xScaled / (a * (1.0 - e2 / 4.0 - e4 * 3.0 / 64.0 - e6 * 5.0 / 256.0));

    const phi1 = mu
      + (e1 * 3.0 / 2.0 - (e1 ** 3) * 27.0 / 32.0) * Math.sin(2.0 * mu)
      + ((e1 ** 2) * 21.0 / 16.0 - (e1 ** 4) * 55.0 / 32.0) * Math.sin(4.0 * mu)
      + ((e1 ** 3) * 151.0 / 96.0) * Math.sin(6.0 * mu)
      + ((e1 ** 4) * 1097.0 / 512.0) * Math.sin(8.0 * mu);

    const N1 = a / Math.sqrt(1.0 - e2 * Math.sin(phi1) ** 2);
    const T1 = Math.tan(phi1) ** 2;
    const C1 = ep2 * Math.cos(phi1) ** 2;
    const R1 = a * (1.0 - e2) / Math.pow(1.0 - e2 * Math.sin(phi1) ** 2, 1.5);
    const D = yScaled / N1;

    const latRad = phi1 - (N1 * Math.tan(phi1) / R1) * (
      (D ** 2) / 2.0
      - (5.0 + 3.0 * T1 + 10.0 * C1 - 4.0 * (C1 ** 2) - 9.0 * ep2) * (D ** 4) / 24.0
      + (61.0 + 90.0 * T1 + 298.0 * C1 + 45.0 * (T1 ** 2) - 252.0 * ep2 - 3.0 * (C1 ** 2)) * (D ** 6) / 720.0
    );

    const lonRad = (lon0Deg * (Math.PI / 180.0)) + (
      D
      - (1.0 + 2.0 * T1 + C1) * (D ** 3) / 6.0
      + (5.0 - 2.0 * C1 + 28.0 * T1 - 3.0 * (C1 ** 2) + 8.0 * ep2 + 24.0 * (T1 ** 2)) * (D ** 5) / 120.0
    ) / Math.cos(phi1);

    const latDeg = latRad * (180.0 / Math.PI);
    const lonDeg = lonRad * (180.0 / Math.PI);

    return {
      lat: latDeg,
      lon: lonDeg,
      latitude: latDeg,
      longitude: lonDeg
    };
  }

  tmToGeographic(easting, northing, lon0 = 30, datum = "ITRF96") {
    const isHayford = (datum === "ED50");
    return this.inverseTM(easting, northing, lon0, 1.0, isHayford);
  }

  geographicToTm(lat, lon, lon0 = 30, datum = "ITRF96") {
    const isHayford = (datum === "ED50");
    return this.forwardTM(lat, lon, lon0, 1.0, isHayford);
  }

  /**
   * Coğrafi Koordinatlardan 3B Kartezyen ECEF (X, Y, Z) Koordinatlarına Dönüşüm
   */
  geodeticToEcef(latDeg, lonDeg, h = 0.0, isHayford = false) {
    const a = isHayford ? this.a_hayford : this.a_grs80;
    const e2 = isHayford ? this.e2_hayford : this.e2_grs80;

    const phi = latDeg * (Math.PI / 180.0);
    const lambda = lonDeg * (Math.PI / 180.0);

    const N = a / Math.sqrt(1.0 - e2 * Math.sin(phi) ** 2);
    const x = (N + h) * Math.cos(phi) * Math.cos(lambda);
    const y = (N + h) * Math.cos(phi) * Math.sin(lambda);
    const z = (N * (1.0 - e2) + h) * Math.sin(phi);

    return { x, y, z };
  }

  /**
   * 3B Kartezyen ECEF (X, Y, Z) Koordinatlarından Coğrafi (Enlem, Boylam, Elipsoit Kotu) Dönüşüm
   * Bowring Kapalı Formülü (Hassasiyet: < 0.001 mm)
   */
  ecefToGeodetic(X, Y, Z, isHayford = false) {
    const a = isHayford ? this.a_hayford : this.a_grs80;
    const b = isHayford ? this.b_hayford : this.b_grs80;
    const e2 = isHayford ? this.e2_hayford : this.e2_grs80;
    const ep2 = (a * a - b * b) / (b * b);

    const p = Math.sqrt(X * X + Y * Y);
    const theta = Math.atan2(Z * a, p * b);

    const phi = Math.atan2(
      Z + ep2 * b * (Math.sin(theta) ** 3),
      p - e2 * a * (Math.cos(theta) ** 3)
    );
    const lambda = Math.atan2(Y, X);

    const N = a / Math.sqrt(1.0 - e2 * (Math.sin(phi) ** 2));
    const h = p / Math.cos(phi) - N;

    return {
      lat: phi * (180.0 / Math.PI),
      lon: lambda * (180.0 / Math.PI),
      h: h
    };
  }

  /**
   * 7-Parametreli Bursa-Wolf Datum Dönüşümü (ITRF96 <-> ED50)
   */
  transformDatum(lat, lon, h = 0.0, fromDatum = "ITRF96", toDatum = "ED50", customParams = null) {
    if (fromDatum === toDatum) {
      return { lat, lon, h };
    }

    const params = customParams || this.customParams;
    const scaleFactor = 1.0 + (params.ds || 0.0) * 1e-6;
    const rx = ((params.rx || 0.0) / 3600.0) * (Math.PI / 180.0);
    const ry = ((params.ry || 0.0) / 3600.0) * (Math.PI / 180.0);
    const rz = ((params.rz || 0.0) / 3600.0) * (Math.PI / 180.0);

    if (fromDatum === "ITRF96" || fromDatum === "WGS84") {
      // ITRF96 (GRS80) -> ED50 (Hayford)
      const ecefSource = this.geodeticToEcef(lat, lon, h, false);
      const X_target = params.dx + scaleFactor * (ecefSource.x - rz * ecefSource.y + ry * ecefSource.z);
      const Y_target = params.dy + scaleFactor * (rz * ecefSource.x + ecefSource.y - rx * ecefSource.z);
      const Z_target = params.dz + scaleFactor * (-ry * ecefSource.x + rx * ecefSource.y + ecefSource.z);
      return this.ecefToGeodetic(X_target, Y_target, Z_target, true);
    } else if (fromDatum === "ED50") {
      // ED50 (Hayford) -> ITRF96 (GRS80)
      const ecefSource = this.geodeticToEcef(lat, lon, h, true);
      const invScale = 1.0 / scaleFactor;
      const X_target = -params.dx + invScale * (ecefSource.x + rz * ecefSource.y - ry * ecefSource.z);
      const Y_target = -params.dy + invScale * (-rz * ecefSource.x + ecefSource.y + rx * ecefSource.z);
      const Z_target = -params.dz + invScale * (ry * ecefSource.x - rx * ecefSource.y + ecefSource.z);
      return this.ecefToGeodetic(X_target, Y_target, Z_target, false);
    }

    return { lat, lon, h };
  }

  /**
   * İki EPSG Kodu Arasında Çoklu/Karmaşık Koordinat Dönüşümü
   */
  transformCoordinate(coord, fromEpsg = "EPSG:4326", toEpsg = "EPSG:5255", customParams = null) {
    const reg = (this.epsgRegistry && Object.keys(this.epsgRegistry).length > 0) ? this.epsgRegistry : (GeodesyEngine.epsgRegistry || {});
    const src = reg[fromEpsg] || reg["EPSG:4326"];
    const tgt = reg[toEpsg] || reg["EPSG:5255"];
    if (!src || !tgt) {
      return { c1: coord.c1, c2: coord.c2, c3: coord.c3 || 0 };
    }
    const isCrossDatum = (src.datum !== tgt.datum);

    let lat = 0.0;
    let lon = 0.0;
    let h = coord.c3 || 0.0;

    // 1. ADIM: Kaynak EPSG formatından Coğrafi (Lat, Lon, h) formatına geçiş
    if (src.type === "GEO") {
      lat = coord.c1;
      lon = coord.c2;
      h = coord.c3 || 0.0;
    } else if (src.type === "TM") {
      const isHayfordSrc = (src.datum === "ED50");
      const geo = this.inverseTM(coord.c1, coord.c2, src.lon0, src.scale0, isHayfordSrc);
      lat = geo.lat;
      lon = geo.lon;
      h = coord.c3 || 0.0;
    } else if (src.type === "ECEF") {
      const geo = this.ecefToGeodetic(coord.c1, coord.c2, coord.c3 || 0.0, false);
      lat = geo.lat;
      lon = geo.lon;
      h = geo.h;
    }

    // 2. ADIM: Farklı Datumlar arası Bursa-Wolf 7-Parametre Dönüşümü (Gerekiyorsa)
    let finalLat = lat;
    let finalLon = lon;
    let finalH = h;
    if (isCrossDatum) {
      const datumTransformed = this.transformDatum(lat, lon, h, src.datum, tgt.datum, customParams);
      finalLat = datumTransformed.lat;
      finalLon = datumTransformed.lon;
      finalH = datumTransformed.h;
    }

    // 3. ADIM: Hedef EPSG formatına projeksiyonlama
    const result = {
      c1: 0.0,
      c2: 0.0,
      c3: finalH,
      lat: finalLat,
      lon: finalLon,
      h: finalH,
      srcEpsg: fromEpsg,
      tgtEpsg: toEpsg,
      isCrossDatum: isCrossDatum,
      formattedResult: ""
    };

    if (tgt.type === "GEO") {
      result.c1 = finalLat;
      result.c2 = finalLon;
      result.c3 = finalH;
      result.formattedResult = `Lat = ${result.c1.toFixed(8)}°, Lon = ${result.c2.toFixed(8)}°, h = ${result.c3.toFixed(3)} m`;
    } else if (tgt.type === "TM") {
      const isHayfordTgt = (tgt.datum === "ED50");
      const projected = this.forwardTM(finalLat, finalLon, tgt.lon0, tgt.scale0, isHayfordTgt);
      result.c1 = projected.easting;
      result.c2 = projected.northing;
      result.c3 = finalH;
      result.formattedResult = `Y = ${result.c1.toFixed(3)} m, X = ${result.c2.toFixed(3)} m, h = ${result.c3.toFixed(3)} m`;
    } else if (tgt.type === "ECEF") {
      const isHayfordTgt = (tgt.datum === "ED50");
      const ecef = this.geodeticToEcef(finalLat, finalLon, finalH, isHayfordTgt);
      result.c1 = ecef.x;
      result.c2 = ecef.y;
      result.c3 = ecef.z;
      result.formattedResult = `X = ${result.c1.toFixed(3)} m, Y = ${result.c2.toFixed(3)} m, Z = ${result.c3.toFixed(3)} m`;
    }

    return result;
  }

  /**
   * Derece Değerini Derece-Dakika-Saniye (DMS) Formatına Çevirir
   */
  toDms(degVal, isLat = true) {
    const direction = degVal >= 0 ? (isLat ? "N" : "E") : (isLat ? "S" : "W");
    const absDeg = Math.abs(degVal);
    const d = Math.floor(absDeg);
    const mFloat = (absDeg - d) * 60.0;
    const m = Math.floor(mFloat);
    const s = (mFloat - m) * 60.0;
    return `${d}°${String(m).padStart(2, "0")}'${s.toFixed(5).padStart(8, "0")}" ${direction}`;
  }

  /**
   * Toplu Metin Tablosundan Koordinat Satırlarını Ayrıştırır
   */
  parseBatchCoordinateText(text, explicitDelimiter = "AUTO") {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      return { delimiter: "SPACE", rows: [] };
    }

    let detectedDelimiter = explicitDelimiter;
    if (detectedDelimiter === "AUTO") {
      const sample = lines.slice(0, 10).join("\n");
      const commaCount = (sample.match(/,/g) || []).length;
      const semiCount = (sample.match(/;/g) || []).length;
      const tabCount = (sample.match(/\t/g) || []).length;
      const pipeCount = (sample.match(/\|/g) || []).length;

      if (tabCount > 5) detectedDelimiter = "TAB";
      else if (semiCount > 5) detectedDelimiter = "SEMICOLON";
      else if (commaCount > 5) detectedDelimiter = "COMMA";
      else if (pipeCount > 5) detectedDelimiter = "PIPE";
      else detectedDelimiter = "SPACE";
    }

    const splitter = (line) => {
      if (detectedDelimiter === "COMMA") return line.split(",").map(s => s.trim());
      if (detectedDelimiter === "SEMICOLON") return line.split(";").map(s => s.trim());
      if (detectedDelimiter === "TAB") return line.split("\t").map(s => s.trim());
      if (detectedDelimiter === "PIPE") return line.split("|").map(s => s.trim());
      return line.split(/\s+/).map(s => s.trim());
    };

    const rows = [];
    for (let i = 0; i < lines.length; i++) {
      const parts = splitter(lines[i]);
      if (parts.length >= 2) {
        rows.push(parts);
      }
    }

    return {
      delimiter: detectedDelimiter,
      rows: rows
    };
  }

  /**
   * 2B Helmert Düzlem Benzerlik Dönüşümü En Küçük Kareler (LSE) Çözücüsü
   * Y2 = a * Y1 + b * X1 + dy0
   * X2 = -b * Y1 + a * X1 + dx0
   */
  solveHelmert2D(controlPairs) {
    const n = controlPairs.length;
    if (n < 2) {
      throw new Error("ERR_HELMERT_MIN_2_POINTS");
    }

    // Ağırlık merkezlerinin hesaplanması
    let sumY1 = 0, sumX1 = 0, sumY2 = 0, sumX2 = 0;
    for (let pt of controlPairs) {
      sumY1 += pt.y1;
      sumX1 += pt.x1;
      sumY2 += pt.y2;
      sumX2 += pt.x2;
    }

    const y0_1 = sumY1 / n;
    const x0_1 = sumX1 / n;
    const y0_2 = sumY2 / n;
    const x0_2 = sumX2 / n;

    // İndirgenmiş koordinatlar ve parametre katsayıları
    let sumNumerator_a = 0;
    let sumNumerator_b = 0;
    let sumDenominator = 0;

    for (let pt of controlPairs) {
      const dy1 = pt.y1 - y0_1;
      const dx1 = pt.x1 - x0_1;
      const dy2 = pt.y2 - y0_2;
      const dx2 = pt.x2 - x0_2;

      sumNumerator_a += dy1 * dy2 + dx1 * dx2;
      sumNumerator_b += dx1 * dy2 - dy1 * dx2;
      sumDenominator += dy1 * dy1 + dx1 * dx1;
    }

    if (sumDenominator === 0) {
      throw new Error("ERR_HELMERT_ZERO_VARIANCE");
    }

    const a = sumNumerator_a / sumDenominator;
    const b = sumNumerator_b / sumDenominator;

    const dy0 = y0_2 - (a * y0_1 + b * x0_1);
    const dx0 = x0_2 - (-b * y0_1 + a * x0_1);

    const scale_m = Math.sqrt(a * a + b * b);
    const dm_ppm = (scale_m - 1.0) * 1e6;
    const theta_rad = Math.atan2(b, a);
    const theta_grad = (theta_rad * 200.0) / Math.PI;
    const theta_deg = (theta_rad * 180.0) / Math.PI;

    // Düzeltmeler (Kalıntılar) ve Birim Ölçünün Orta Hatası (m0)
    const residuals = [];
    let sumResidualSquares = 0;

    for (let pt of controlPairs) {
      const calc_y2 = a * pt.y1 + b * pt.x1 + dy0;
      const calc_x2 = -b * pt.y1 + a * pt.x1 + dx0;
      const vy = calc_y2 - pt.y2;
      const vx = calc_x2 - pt.x2;
      const vs = Math.sqrt(vy * vy + vx * vx);

      sumResidualSquares += vy * vy + vx * vx;

      residuals.push({
        name: pt.name,
        y1: pt.y1,
        x1: pt.x1,
        y2: pt.y2,
        x2: pt.x2,
        calc_y2: calc_y2,
        calc_x2: calc_x2,
        vy: vy,
        vx: vx,
        vs: vs
      });
    }

    const m0 = n > 2 ? Math.sqrt(sumResidualSquares / (n * 2 - 4)) : 0.0;

    return {
      a: a,
      b: b,
      dy0: dy0,
      dx0: dx0,
      y0_1: y0_1,
      x0_1: x0_1,
      y0_2: y0_2,
      x0_2: x0_2,
      scale_m: scale_m,
      dm_ppm: dm_ppm,
      theta_rad: theta_rad,
      theta_grad: theta_grad,
      theta_deg: theta_deg,
      m0: m0,
      residuals: residuals,
      pointCount: n
    };
  }

  /**
   * 2B Helmert Parametreleri ile Tek Nokta Koordinat Dönüşümü
   */
  transformPointHelmert2D(y, x, helmertParams) {
    const yTarget = helmertParams.a * y + helmertParams.b * x + helmertParams.dy0;
    const xTarget = -helmertParams.b * y + helmertParams.a * x + helmertParams.dx0;
    return {
      y: yTarget,
      x: xTarget
    };
  }

  /**
   * Netcad .DNS Dosyası Formatında Parametre İhracı
   */
  exportNetcadDns(helmertParams, projectName = "GNSS_Pos_Helmert_Donusum") {
    const dateStr = new Date().toLocaleDateString("tr-TR");
    return `; Netcad 2D Helmert Donusum Parametre Dosyasi (.DNS)
; GNSS Pos Web Studio v2.0 tarafindan uretilmistir.
; Tarih: ${dateStr}
; Ortak Nokta Sayisi: ${helmertParams.pointCount}
; Birim Olcunun Orta Hatasi (m0): ${helmertParams.m0.toFixed(4)} m (${(helmertParams.m0 * 100).toFixed(2)} cm)
; Olcek Katsayisi (m): ${helmertParams.scale_m.toFixed(8)} (${helmertParams.dm_ppm > 0 ? "+" : ""}${helmertParams.dm_ppm.toFixed(2)} ppm)
; Donukluk Acisi: ${helmertParams.theta_grad.toFixed(6)} grad (${helmertParams.theta_deg.toFixed(6)} deg)

[NETCAD_DONUSUM]
TIP=HELMERT2D
PROJE=${projectName}
A=${helmertParams.a.toFixed(10)}
B=${helmertParams.b.toFixed(10)}
DY=${helmertParams.dy0.toFixed(5)}
DX=${helmertParams.dx0.toFixed(5)}
Y0_KAYNAK=${(helmertParams.y0_1 || 0).toFixed(4)}
X0_KAYNAK=${(helmertParams.x0_1 || 0).toFixed(4)}
Y0_HEDEF=${(helmertParams.y0_2 || 0).toFixed(4)}
X0_HEDEF=${(helmertParams.x0_2 || 0).toFixed(4)}
MO=${(helmertParams.m0 || 0).toFixed(4)}
DM_PPM=${(helmertParams.dm_ppm || 0).toFixed(2)}
THETA_GRAD=${(helmertParams.theta_grad || 0).toFixed(6)}
`;
  }

  /**
   * Netcad .DNS Dosyası Ayrıştırıcısı
   */
  parseNetcadDns(dnsText) {
    const lines = dnsText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith(";"));
    let a = null;
    let b = null;
    let dy0 = null;
    let dx0 = null;
    let scale_m = null;
    let theta_grad = null;
    let theta_deg = null;

    for (let line of lines) {
      const sanitized = line.replace(/[:=]/g, " ");
      const tokens = sanitized.split(/\s+/);
      if (tokens.length >= 2) {
        const key = tokens[0].toUpperCase();
        const val = parseFloat(tokens[1]);
        if (isNaN(val)) continue;

        if (key === "A") a = val;
        else if (key === "B") b = val;
        else if (key === "DY" || key === "DY0" || key === "TY" || key === "YO") dy0 = val;
        else if (key === "DX" || key === "DX0" || key === "TX" || key === "XO") dx0 = val;
        else if (key === "M" || key === "SCALE") scale_m = val;
        else if (key === "THETA_GRAD" || key === "THETA" || key === "ALFA_GRAD") theta_grad = val;
        else if (key === "THETA_DEG" || key === "ALFA_DEG") theta_deg = val;
      }
    }

    if (a !== null && b !== null && dy0 !== null && dx0 !== null) {
      const calcScale = Math.sqrt(a * a + b * b);
      const dm_ppm = (calcScale - 1.0) * 1e6;
      const theta_rad = Math.atan2(b, a);
      return {
        a: a,
        b: b,
        dy0: dy0,
        dx0: dx0,
        scale_m: calcScale,
        dm_ppm: dm_ppm,
        theta_grad: (theta_rad * 200.0) / Math.PI,
        theta_deg: (theta_rad * 180.0) / Math.PI,
        source: "NETCAD_DNS_FILE",
        pointCount: "DNS",
        m0: 0.0
      };
    }

    if (scale_m !== null && (theta_grad !== null || theta_deg !== null) && dy0 !== null && dx0 !== null) {
      const theta_rad = theta_grad !== null ? (theta_grad * Math.PI / 200.0) : (theta_deg * Math.PI / 180.0);
      a = scale_m * Math.cos(theta_rad);
      b = scale_m * Math.sin(theta_rad);
      const dm_ppm = (scale_m - 1.0) * 1e6;
      return {
        a: a,
        b: b,
        dy0: dy0,
        dx0: dx0,
        scale_m: scale_m,
        dm_ppm: dm_ppm,
        theta_grad: (theta_rad * 200.0) / Math.PI,
        theta_deg: (theta_rad * 180.0) / Math.PI,
        source: "NETCAD_DNS_FILE",
        pointCount: "DNS",
        m0: 0.0
      };
    }

    throw new Error("ERR_INVALID_DNS_FILE");
  }

  /**
   * 3B Bursa-Wolf 7-Parametre En Küçük Kareler (LSE) Çözücüsü
   */
  solveBursaWolf7Param(commonPoints3D) {
    const n = commonPoints3D.length;
    if (n < 3) {
      throw new Error("ERR_BURSA_WOLF_MIN_3_POINTS");
    }

    let meanX1 = 0, meanY1 = 0, meanZ1 = 0;
    let meanX2 = 0, meanY2 = 0, meanZ2 = 0;

    commonPoints3D.forEach(p => {
      meanX1 += p.x1;
      meanY1 += p.y1;
      meanZ1 += p.z1;
      meanX2 += p.x2;
      meanY2 += p.y2;
      meanZ2 += p.z2;
    });

    meanX1 /= n; meanY1 /= n; meanZ1 /= n;
    meanX2 /= n; meanY2 /= n; meanZ2 /= n;

    // Normal Denklemler Matrisi (N = A^T * A) ve Sağ Taraf Vektörü (U = A^T * L)
    const N_mat = Array.from({ length: 7 }, () => new Float64Array(7));
    const U_vec = new Float64Array(7);
    const RHO_SEC = 206264.80624709636; // 1 Radyanın Saniye Karşılığı

    commonPoints3D.forEach(p => {
      const x1 = p.x1;
      const y1 = p.y1;
      const z1 = p.z1;

      const lx = p.x2 - p.x1;
      const ly = p.y2 - p.y1;
      const lz = p.z2 - p.z1;

      const rowX = [1, 0, 0, 0, -z1, y1, x1];
      const rowY = [0, 1, 0, z1, 0, -x1, y1];
      const rowZ = [0, 0, 1, -y1, x1, 0, z1];

      const rows = [
        { a: rowX, l: lx },
        { a: rowY, l: ly },
        { a: rowZ, l: lz }
      ];

      rows.forEach(r => {
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            N_mat[i][j] += r.a[i] * r.a[j];
          }
          U_vec[i] += r.a[i] * r.l;
        }
      });
    });

    // Gauss-Jordan Eliminasyonu ile N * X = U Çözümü
    const aug = Array.from({ length: 7 }, (_, i) => {
      const row = new Float64Array(8);
      for (let j = 0; j < 7; j++) row[j] = N_mat[i][j];
      row[7] = U_vec[i];
      return row;
    });

    for (let i = 0; i < 7; i++) {
      let maxRow = i;
      for (let k = i + 1; k < 7; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }
      const tmp = aug[i];
      aug[i] = aug[maxRow];
      aug[maxRow] = tmp;

      const pivot = aug[i][i];
      if (Math.abs(pivot) < 1e-18) {
        throw new Error("ERR_SINGULAR_MATRIX");
      }

      for (let k = i + 1; k < 7; k++) {
        const factor = aug[k][i] / pivot;
        for (let j = i; j <= 7; j++) {
          aug[k][j] -= factor * aug[i][j];
        }
      }
    }

    const sol = new Float64Array(7);
    for (let i = 6; i >= 0; i--) {
      let sum = aug[i][7];
      for (let j = i + 1; j < 7; j++) {
        sum -= aug[i][j] * sol[j];
      }
      sol[i] = sum / aug[i][i];
    }

    const dx = sol[0];
    const dy = sol[1];
    const dz = sol[2];
    const rx_sec = sol[3] * RHO_SEC;
    const ry_sec = sol[4] * RHO_SEC;
    const rz_sec = sol[5] * RHO_SEC;
    const ds_ppm = sol[6] * 1e6;

    // Düzeltmeler ve Birim Ölçünün Orta Hatası (m0)
    let sumV2 = 0;
    const residuals = commonPoints3D.map(p => {
      const rx_rad = sol[3];
      const ry_rad = sol[4];
      const rz_rad = sol[5];
      const s = sol[6];

      const calcX2 = (1 + s) * (p.x1 - ry_rad * p.z1 + rz_rad * p.y1) + dx;
      const calcY2 = (1 + s) * (-rz_rad * p.x1 + p.y1 + rx_rad * p.z1) + dy;
      const calcZ2 = (1 + s) * (ry_rad * p.x1 - rx_rad * p.y1 + p.z1) + dz;

      const vx = calcX2 - p.x2;
      const vy = calcY2 - p.y2;
      const vz = calcZ2 - p.z2;
      const vs = Math.sqrt(vx * vx + vy * vy + vz * vz);

      sumV2 += vx * vx + vy * vy + vz * vz;

      return {
        name: p.name,
        vx, vy, vz, vs,
        calc_x2: calcX2,
        calc_y2: calcY2,
        calc_z2: calcZ2
      };
    });

    const dof = Math.max(1, n * 3 - 7);
    const m0 = Math.sqrt(sumV2 / dof);

    return {
      dx: dx,
      dy: dy,
      dz: dz,
      rx: rx_sec,
      ry: ry_sec,
      rz: rz_sec,
      ds: ds_ppm,
      m0: m0,
      pointCount: n,
      residuals: residuals
    };
  }

  // ==========================================================================
  //  MESAFE, AZİMUT & ALAN HESAPLAMA METOTLARI
  //  (Vincenty Elipsoit, Düzlem Grid, Gauss Alanı)
  // ==========================================================================

  /**
   * Vincenty Ters Jeodezi Problemi (Inverse)
   * İki coğrafi koordinat arasındaki elipsoit mesafesi ve azimutu hesaplar.
   * Referans: T. Vincenty, "Direct and Inverse Solutions of Geodesics on the
   *           Ellipsoid with Application of Nested Equations", 1975.
   *
   * @param {number} lat1 - 1. nokta enlemi (derece)
   * @param {number} lon1 - 1. nokta boylamı (derece)
   * @param {number} lat2 - 2. nokta enlemi (derece)
   * @param {number} lon2 - 2. nokta boylamı (derece)
   * @param {string} ellipsoid - "GRS80" (varsayılan) veya "HAYFORD"
   * @returns {Object} { distanceM, azimuth12Deg, azimuth21Deg, azimuth12Grad, azimuth21Grad }
   */
  vincentyInverse(lat1, lon1, lat2, lon2, ellipsoid = "GRS80") {
    const a = ellipsoid === "HAYFORD" ? this.a_hayford : this.a_grs80;
    const f = ellipsoid === "HAYFORD" ? this.f_hayford : this.f_grs80;
    const b = a * (1 - f);

    const toRad = (d) => d * Math.PI / 180;

    const phi1 = toRad(lat1), phi2 = toRad(lat2);
    const L = toRad(lon2 - lon1);

    const U1 = Math.atan((1 - f) * Math.tan(phi1));
    const U2 = Math.atan((1 - f) * Math.tan(phi2));
    const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
    const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

    let lambda = L, prevLambda, iterLimit = 200;
    let sinSigma, cosSigma, sigma, sinAlpha, cos2Alpha, cos2SigmaM, C;

    do {
      const sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
      sinSigma = Math.sqrt(
        (cosU2 * sinLambda) ** 2 +
        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2
      );
      if (sinSigma === 0) return { distanceM: 0, azimuth12Deg: 0, azimuth21Deg: 0, azimuth12Grad: 0, azimuth21Grad: 0 };

      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
      sigma = Math.atan2(sinSigma, cosSigma);
      sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
      cos2Alpha = 1 - sinAlpha ** 2;
      cos2SigmaM = cos2Alpha !== 0 ? cosSigma - 2 * sinU1 * sinU2 / cos2Alpha : 0;
      C = f / 16 * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha));
      prevLambda = lambda;
      lambda = L + (1 - C) * f * sinAlpha * (
        sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM ** 2))
      );
    } while (Math.abs(lambda - prevLambda) > 1e-12 && --iterLimit > 0);

    if (iterLimit === 0) {
      console.warn("Vincenty iterasyonu yakınsamadı.");
      return null;
    }

    const u2 = cos2Alpha * (a ** 2 - b ** 2) / (b ** 2);
    const A = 1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
    const B = u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
    const deltaSigma = B * sinSigma * (
      cos2SigmaM + B / 4 * (
        cosSigma * (-1 + 2 * cos2SigmaM ** 2) -
        B / 6 * cos2SigmaM * (-3 + 4 * sinSigma ** 2) * (-3 + 4 * cos2SigmaM ** 2)
      )
    );

    const s = b * A * (sigma - deltaSigma);

    // Azimutlar
    let alpha1 = Math.atan2(
      cosU2 * Math.sin(lambda),
      cosU1 * sinU2 - sinU1 * cosU2 * Math.cos(lambda)
    );
    let alpha2 = Math.atan2(
      cosU1 * Math.sin(lambda),
      -sinU1 * cosU2 + cosU1 * sinU2 * Math.cos(lambda)
    );

    const toDeg = (r) => ((r * 180 / Math.PI) + 360) % 360;
    const toGrad = (deg) => deg * 200 / 180;

    const az12 = toDeg(alpha1);
    const az21 = toDeg(alpha2);

    return {
      distanceM: s,
      azimuth12Deg: az12,
      azimuth21Deg: az21,
      azimuth12Grad: toGrad(az12),
      azimuth21Grad: toGrad(az21)
    };
  }

  /**
   * Vincenty Düz Jeodezi Problemi (Direct)
   * Bir noktadan azimut ve mesafe verilerek yeni noktanın koordinatlarını hesaplar.
   *
   * @param {number} lat1 - Başlangıç enlemi (derece)
   * @param {number} lon1 - Başlangıç boylamı (derece)
   * @param {number} azimuthDeg - Azimut (derece, kuzeyden saat yönü)
   * @param {number} distanceM - Mesafe (metre)
   * @param {string} ellipsoid - "GRS80" veya "HAYFORD"
   * @returns {Object} { lat2, lon2, reverseAzimuthDeg }
   */
  vincentyDirect(lat1, lon1, azimuthDeg, distanceM, ellipsoid = "GRS80") {
    const a = ellipsoid === "HAYFORD" ? this.a_hayford : this.a_grs80;
    const f = ellipsoid === "HAYFORD" ? this.f_hayford : this.f_grs80;
    const b = a * (1 - f);
    const toRad = (d) => d * Math.PI / 180;
    const toDeg = (r) => r * 180 / Math.PI;

    const phi1 = toRad(lat1);
    const alpha1 = toRad(azimuthDeg);
    const s = distanceM;

    const sinAlpha1 = Math.sin(alpha1), cosAlpha1 = Math.cos(alpha1);
    const tanU1 = (1 - f) * Math.tan(phi1);
    const cosU1 = 1 / Math.sqrt(1 + tanU1 ** 2);
    const sinU1 = tanU1 * cosU1;

    const sigma1 = Math.atan2(tanU1, cosAlpha1);
    const sinAlpha = cosU1 * sinAlpha1;
    const cos2Alpha = 1 - sinAlpha ** 2;
    const u2 = cos2Alpha * (a ** 2 - b ** 2) / (b ** 2);
    const A = 1 + u2 / 16384 * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
    const B = u2 / 1024 * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));

    let sigma = s / (b * A);
    let prevSigma, cos2SigmaM, sinSigma, cosSigma, deltaSigma;
    let iterLimit = 200;

    do {
      cos2SigmaM = Math.cos(2 * sigma1 + sigma);
      sinSigma = Math.sin(sigma);
      cosSigma = Math.cos(sigma);
      deltaSigma = B * sinSigma * (
        cos2SigmaM + B / 4 * (
          cosSigma * (-1 + 2 * cos2SigmaM ** 2) -
          B / 6 * cos2SigmaM * (-3 + 4 * sinSigma ** 2) * (-3 + 4 * cos2SigmaM ** 2)
        )
      );
      prevSigma = sigma;
      sigma = s / (b * A) + deltaSigma;
    } while (Math.abs(sigma - prevSigma) > 1e-12 && --iterLimit > 0);

    const tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
    const lat2 = Math.atan2(
      sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
      (1 - f) * Math.sqrt(sinAlpha ** 2 + tmp ** 2)
    );
    const lambda = Math.atan2(
      sinSigma * sinAlpha1,
      cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
    );
    const C = f / 16 * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha));
    const L = lambda - (1 - C) * f * sinAlpha * (
      sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM ** 2))
    );

    const lon2 = toRad(lon1) + L;

    const revAz = Math.atan2(sinAlpha, -tmp);

    return {
      lat2: toDeg(lat2),
      lon2: toDeg(lon2),
      reverseAzimuthDeg: ((toDeg(revAz) + 360) % 360)
    };
  }

  /**
   * Düzlem (Grid) Mesafe Hesabı
   * Projeksiyon koordinatları (Easting, Northing) arasındaki 2B düzlem mesafesi.
   *
   * @param {number} e1 - 1. nokta Easting (m)
   * @param {number} n1 - 1. nokta Northing (m)
   * @param {number} e2 - 2. nokta Easting (m)
   * @param {number} n2 - 2. nokta Northing (m)
   * @param {number} [h1=0] - 1. nokta yüksekliği (m, opsiyonel 3B mesafe için)
   * @param {number} [h2=0] - 2. nokta yüksekliği (m, opsiyonel 3B mesafe için)
   * @returns {Object} { distance2D, distance3D, dE, dN, dH }
   */
  gridDistance(e1, n1, e2, n2, h1 = 0, h2 = 0) {
    const dE = e2 - e1;
    const dN = n2 - n1;
    const dH = h2 - h1;
    const dist2D = Math.sqrt(dE ** 2 + dN ** 2);
    const dist3D = Math.sqrt(dE ** 2 + dN ** 2 + dH ** 2);
    return { distance2D: dist2D, distance3D: dist3D, dE, dN, dH };
  }

  /**
   * Düzlem (Grid) Azimut Hesabı
   * Projeksiyon koordinatları arasındaki grid azimutu.
   *
   * @param {number} e1 - 1. nokta Easting (m)
   * @param {number} n1 - 1. nokta Northing (m)
   * @param {number} e2 - 2. nokta Easting (m)
   * @param {number} n2 - 2. nokta Northing (m)
   * @returns {Object} { azimuthDeg, azimuthGrad, azimuthDMS }
   */
  gridAzimuth(e1, n1, e2, n2) {
    const dE = e2 - e1;
    const dN = n2 - n1;
    let azRad = Math.atan2(dE, dN); // Kuzeyden saat yönü
    if (azRad < 0) azRad += 2 * Math.PI;
    const azDeg = azRad * 180 / Math.PI;
    const azGrad = azDeg * 200 / 180;

    // DMS formatına çevir
    const d = Math.floor(azDeg);
    const mFull = (azDeg - d) * 60;
    const m = Math.floor(mFull);
    const s = (mFull - m) * 60;
    const azDMS = `${d}° ${m.toString().padStart(2, "0")}' ${s.toFixed(2).padStart(5, "0")}"`;

    return { azimuthDeg: azDeg, azimuthGrad: azGrad, azimuthDMS: azDMS };
  }

  /**
   * Gauss Alan Hesabı (Shoelace / Surveyor's Formula)
   * Sıralı projeksiyon koordinat listesinden poligon alanı hesaplar.
   *
   * @param {Array<{e: number, n: number}>} coords - Sıralı koordinat dizisi [{e, n}, ...]
   * @returns {Object} { areaM2, areaDonumTR, areaHektar, perimeterM, pointCount }
   */
  gaussArea(coords) {
    if (!coords || coords.length < 3) {
      return { areaM2: 0, areaDonumTR: 0, areaHektar: 0, perimeterM: 0, pointCount: 0 };
    }

    const getEN = (pt) => {
      if (!pt) return { e: 0, n: 0 };
      if (Array.isArray(pt)) return { e: Number(pt[0]) || 0, n: Number(pt[1]) || 0 };
      const e = Number(pt.e ?? pt.y ?? pt.lon ?? pt.east ?? 0);
      const n = Number(pt.n ?? pt.x ?? pt.lat ?? pt.north ?? 0);
      return { e, n };
    };

    const n = coords.length;
    let sum = 0;
    let perimeter = 0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const p1 = getEN(coords[i]);
      const p2 = getEN(coords[j]);

      // Gauss (Shoelace) formülü
      sum += (p1.e * p2.n) - (p2.e * p1.n);

      // Çevre hesabı
      perimeter += Math.sqrt((p2.e - p1.e) ** 2 + (p2.n - p1.n) ** 2);
    }

    const areaM2 = Math.abs(sum / 2);

    return {
      areaM2: areaM2,
      areaDonumTR: areaM2 / 1000,       // Türk dönümü (1 dönüm = 1000 m²)
      areaHektar: areaM2 / 10000,        // Hektar (1 ha = 10000 m²)
      perimeterM: perimeter,
      pointCount: n
    };
  }

  /**
   * Derece → Derece°Dakika'Saniye" formatına dönüştürme
   * @param {number} decDeg - Ondalık derece
   * @returns {string} DMS formatı (ör: 39° 55' 14.52")
   */
  decDegToDMS(decDeg) {
    const abs = Math.abs(decDeg);
    const d = Math.floor(abs);
    const mFull = (abs - d) * 60;
    const m = Math.floor(mFull);
    const s = (mFull - m) * 60;
    const sign = decDeg < 0 ? "-" : "";
    return `${sign}${d}° ${m.toString().padStart(2, "0")}' ${s.toFixed(4).padStart(7, "0")}"`;
  }

  /**
   * DMS → Ondalık derece formatına dönüştürme
   * Kabul edilen formatlar: "39°55'14.52\"", "39 55 14.52", "39-55-14.52"
   * @param {string} dmsStr - DMS formatında string
   * @returns {number|null} Ondalık derece veya null
   */
  dmsToDec(dmsStr) {
    if (typeof dmsStr !== "string") return null;
    const cleaned = dmsStr.trim().replace(/[°'"″′]/g, " ").replace(/[-]/g, " ").replace(/\s+/g, " ").trim();
    const parts = cleaned.split(" ").map(Number);
    if (parts.length < 2 || parts.some(isNaN)) return null;
    const d = Math.abs(parts[0]);
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    const sign = dmsStr.trim().startsWith("-") || /[SsWw]/.test(dmsStr) ? -1 : 1;
    return sign * (d + m / 60 + s / 3600);
  }
}


if (typeof window !== "undefined") {
  window.GeodesyEngine = GeodesyEngine;
  GeodesyEngine.loadEpsgRegistry();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = GeodesyEngine;
}