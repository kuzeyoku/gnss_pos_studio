/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - EVRENSEL DOSYA & FORMAT DÖNÜŞTÜRÜCÜ MOTORU
 *  UniversalFormatConverterEngine
 * =========================================================================================
 *  - AutoCAD / Netcad DXF (.DXF): POINT, LINE, LWPOLYLINE, POLYLINE, 3DFACE, TEXT, MTEXT, CIRCLE
 *  - Google Earth KML / KMZ (.KML, .KMZ): Placemark, Point, LineString, Polygon (outer/inner), ExtendedData
 *  - Netcad Koordinat Dosyası (.NCN, .KOS): Nokta No, Y, X, Z
 *  - Saha / Serbest Metin (.TXT, .CSV, .XYZ, .DAT): Otomatik ayraç ve sütun eşleme
 *  - Standart Coğrafi JSON (.GEOJSON, .JSON): FeatureCollection
 *  - Noktalardan Alan & Poligon Üretme: Sıralı Parsel (Sequential Loop) & Konveks Gövde (Convex Hull - Graham Scan)
 *  - 2B Düzlem & Gauss Alanı (m², Dönüm, Hektar) ve Çevre Hesabı (m)
 *  - Projeksiyon Dönüşümü: TUREF / ITRF-96 TM 3° (DOM 27..45) ⇄ WGS84 Coğrafi (GeodesyEngine Entegre)
 * =========================================================================================
 */

class UniversalFormatConverterEngine {
  constructor() {
    if (typeof GeodesyEngine !== "undefined") {
      this.geodesy = new GeodesyEngine();
    } else {
      try {
        const Geo = require("./geodesyEngine.js");
        this.geodesy = new Geo();
      } catch (e) {
        this.geodesy = null;
      }
    }
    this.features = []; // Standard internal feature structure
    this.layers = new Map(); // layerName -> { color, count, visible }
    this.sourceFormat = "AUTO";
    this.sourceFileName = "";
    this.stats = {
      pointCount: 0,
      lineCount: 0,
      polygonCount: 0,
      textCount: 0,
      totalAreaM2: 0,
      totalPerimeterM: 0,
      bounds: null
    };
    this.defaultDom = 30;
    this.sourceCrs = "TUREF_TM30"; // Default TM 3°
    this.targetCrs = "WGS84";
  }

  /**
   * Otonom Dosya Ayrıştırma Giriş Noktası
   */
  async parseFile(fileOrContent, fileName = "", options = {}) {
    this.sourceFileName = fileName || (fileOrContent && fileOrContent.name) || "veri";
    const ext = this._getFileExtension(this.sourceFileName).toLowerCase();
    let textContent = "";

    // Reset state
    this.features = [];
    this.layers.clear();

    if (ext === "kmz" || (fileOrContent instanceof Blob && ext === "kmz")) {
      this.sourceFormat = "KMZ";
      return await this.parseKmz(fileOrContent, options);
    }

    if (ext === "ncz" || (fileOrContent instanceof Blob && ext === "ncz") || (fileOrContent instanceof ArrayBuffer) || (typeof Buffer !== "undefined" && Buffer.isBuffer(fileOrContent))) {
      this.sourceFormat = "NCZ";
      let arrayBuffer;
      if (fileOrContent instanceof ArrayBuffer) {
        arrayBuffer = fileOrContent;
      } else if (fileOrContent && typeof fileOrContent.arrayBuffer === "function") {
        arrayBuffer = await fileOrContent.arrayBuffer();
      } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(fileOrContent)) {
        arrayBuffer = fileOrContent.buffer.slice(
          fileOrContent.byteOffset,
          fileOrContent.byteOffset + fileOrContent.byteLength
        );
      }
      if (arrayBuffer) {
        return this.parseNcz(arrayBuffer, options);
      }
    }

    if (typeof fileOrContent === "string") {
      textContent = fileOrContent;
    } else if (fileOrContent instanceof Blob) {
      textContent = await fileOrContent.text();
    }

    const trimmed = textContent.trim();
    if (!trimmed) return [];

    // Otonom format tespiti
    if (ext === "dxf" || (trimmed.startsWith("0") && trimmed.includes("SECTION") && trimmed.includes("HEADER"))) {
      this.sourceFormat = "DXF";
      return this.parseDxf(textContent, options);
    }

    if (ext === "gpx" || (trimmed.startsWith("<?xml") && (trimmed.includes("<gpx") || trimmed.includes("<wpt")))) {
      this.sourceFormat = "GPX";
      return this.parseGpx(textContent, options);
    }

    if (ext === "kml" || trimmed.startsWith("<?xml") || trimmed.includes("<kml") || trimmed.includes("<Document")) {
      this.sourceFormat = "KML";
      return this.parseKml(textContent, options);
    }

    if (ext === "geojson" || ext === "json" || (trimmed.startsWith("{") && trimmed.includes('"type"'))) {
      this.sourceFormat = "GEOJSON";
      return this.parseGeoJson(textContent, options);
    }

    if (ext === "ncn" || ext === "kos" || this._isNetcadNcn(trimmed)) {
      this.sourceFormat = "NCN";
      return this.parseNcn(textContent, options);
    }

    if (ext === "pos" || this._isUavPos(trimmed)) {
      this.sourceFormat = "UAV_POS";
      return this.parseUavPos(textContent, options);
    }

    // Tablo / CSV / Serbest Metin
    this.sourceFormat = "TXT_CSV";
    return this.parseCsv(textContent, options);
  }

  /* =========================================================================
   * 1. AUTOCAD / NETCAD DXF PARSER
   * ========================================================================= */
  parseDxf(dxfText, options = {}) {
    const lines = dxfText.split(/\r?\n/);
    const features = [];
    let inEntities = false;
    let i = 0;

    // Katman tablosunu tara
    this._extractDxfLayers(lines);

    while (i < lines.length) {
      const code = parseInt(lines[i]?.trim(), 10);
      const val = lines[i + 1]?.trim();

      if (code === 0 && val === "SECTION") {
        if (lines[i + 3]?.trim() === "ENTITIES") {
          inEntities = true;
          i += 4;
          continue;
        }
      }

      if (code === 0 && val === "ENDSEC") {
        if (inEntities) {
          inEntities = false;
          break;
        }
      }

      if (inEntities && code === 0) {
        const entityType = val.toUpperCase();
        const entityLines = [];
        i += 2;

        while (i < lines.length) {
          const nextCode = parseInt(lines[i]?.trim(), 10);
          const nextVal = lines[i + 1]?.trim();
          if (nextCode === 0) {
            break;
          }
          entityLines.push({ code: nextCode, val: nextVal });
          i += 2;
        }

        const feature = this._parseDxfEntity(entityType, entityLines);
        if (feature) {
          features.push(feature);
          this._registerLayer(feature.layer || "0");
        }
        continue;
      }

      i += 2;
    }

    this.features = features;
    this._recomputeStats();
    return features;
  }

  _extractDxfLayers(lines) {
    let inTables = false;
    let inLayerTable = false;
    let curLayer = null;

    for (let i = 0; i < lines.length; i += 2) {
      const code = parseInt(lines[i]?.trim(), 10);
      const val = lines[i + 1]?.trim();

      if (code === 0 && val === "TABLE") {
        if (lines[i + 3]?.trim() === "LAYER") {
          inLayerTable = true;
          i += 2;
          continue;
        }
      }

      if (code === 0 && val === "ENDTAB") {
        inLayerTable = false;
      }

      if (inLayerTable && code === 0 && val === "LAYER") {
        curLayer = { name: "0", color: "#06b6d4" };
      }

      if (curLayer) {
        if (code === 2) curLayer.name = val;
        if (code === 62) curLayer.color = this._dxfColorIndexToHex(parseInt(val, 10));
        this.layers.set(curLayer.name, { color: curLayer.color || "#06b6d4", count: 0, visible: true });
      }
    }
  }

  _parseDxfEntity(type, entityPairs) {
    let layer = "0";
    let text = "";
    let name = "";
    let x = 0, y = 0, z = 0;
    let x2 = 0, y2 = 0, z2 = 0;
    let x3 = 0, y3 = 0, z3 = 0;
    let x4 = 0, y4 = 0, z4 = 0;
    let radius = 0;
    let isClosed = false;
    const vertices = [];
    let curVertex = null;

    for (let p of entityPairs) {
      const c = p.code;
      const v = p.val;

      if (c === 8) layer = v;
      if (c === 1 || c === 3) text = v;
      if (c === 2) name = v;
      if (c === 70 && (type === "LWPOLYLINE" || type === "POLYLINE")) {
        isClosed = (parseInt(v, 10) & 1) === 1;
      }

      if (c === 10) {
        x = parseFloat(v);
        if (type === "LWPOLYLINE") {
          if (curVertex) vertices.push(curVertex);
          curVertex = { x: x, y: 0, z: 0 };
        }
      }
      if (c === 20) {
        y = parseFloat(v);
        if (type === "LWPOLYLINE" && curVertex) {
          curVertex.y = y;
        }
      }
      if (c === 30) {
        z = parseFloat(v);
        if (type === "LWPOLYLINE" && curVertex) {
          curVertex.z = z;
        }
      }

      if (c === 11) x2 = parseFloat(v);
      if (c === 21) y2 = parseFloat(v);
      if (c === 31) z2 = parseFloat(v);

      if (c === 12) x3 = parseFloat(v);
      if (c === 22) y3 = parseFloat(v);
      if (c === 32) z3 = parseFloat(v);

      if (c === 13) x4 = parseFloat(v);
      if (c === 23) y4 = parseFloat(v);
      if (c === 33) z4 = parseFloat(v);

      if (c === 40) radius = parseFloat(v);
    }

    if (curVertex) vertices.push(curVertex);

    // POINT
    if (type === "POINT") {
      return {
        type: "Point",
        layer: layer,
        name: name || text || `P_${x.toFixed(2)}_${y.toFixed(2)}`,
        coordinates: [x, y, z],
        properties: { layer: layer, elevation: z }
      };
    }

    // TEXT / MTEXT
    if (type === "TEXT" || type === "MTEXT") {
      return {
        type: "Text",
        layer: layer,
        name: text || "Text",
        coordinates: [x, y, z],
        properties: { text: text, layer: layer, elevation: z }
      };
    }

    // LINE
    if (type === "LINE") {
      return {
        type: "LineString",
        layer: layer,
        name: `Line_${layer}`,
        coordinates: [[x, y, z], [x2, y2, z2]],
        properties: { layer: layer, lengthM: this._dist3D(x, y, z, x2, y2, z2) }
      };
    }

    // LWPOLYLINE / POLYLINE
    if (type === "LWPOLYLINE" || type === "POLYLINE") {
      if (vertices.length >= 2) {
        const coords = vertices.map(v => [v.x, v.y, v.z || 0]);
        if (isClosed && vertices.length >= 3) {
          // Closed polygon
          if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
            coords.push([...coords[0]]);
          }
          const areaM2 = this._computePolygonArea(coords);
          const perimM = this._computePolygonPerimeter(coords);
          return {
            type: "Polygon",
            layer: layer,
            name: `Poly_${layer}_${Math.round(areaM2)}m2`,
            coordinates: [coords],
            properties: { layer: layer, areaM2: areaM2, perimeterM: perimM, isClosed: true }
          };
        } else {
          // Open polyline
          return {
            type: "LineString",
            layer: layer,
            name: `Polyline_${layer}`,
            coordinates: coords,
            properties: { layer: layer, lengthM: this._computeLineLength(coords) }
          };
        }
      }
    }

    // 3DFACE
    if (type === "3DFACE") {
      const coords = [[x, y, z], [x2, y2, z2], [x3, y3, z3]];
      if (x4 !== 0 || y4 !== 0) coords.push([x4, y4, z4]);
      coords.push([...coords[0]]);
      const areaM2 = this._computePolygonArea(coords);
      return {
        type: "Polygon",
        layer: layer,
        name: `Face3D_${layer}`,
        coordinates: [coords],
        properties: { layer: layer, areaM2: areaM2 }
      };
    }

    // CIRCLE
    if (type === "CIRCLE" && radius > 0) {
      const numPts = 32;
      const coords = [];
      for (let s = 0; s <= numPts; s++) {
        const angle = (s / numPts) * Math.PI * 2;
        coords.push([x + radius * Math.cos(angle), y + radius * Math.sin(angle), z]);
      }
      return {
        type: "Polygon",
        layer: layer,
        name: `Circle_${radius.toFixed(1)}m`,
        coordinates: [coords],
        properties: { layer: layer, radiusM: radius, areaM2: Math.PI * radius * radius }
      };
    }

    return null;
  }

  /* =========================================================================
   * 2. GOOGLE EARTH KML / KMZ PARSER
   * ========================================================================= */
  parseKml(kmlText, options = {}) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");
    const features = [];

    const placemarks = xmlDoc.getElementsByTagName("Placemark");
    for (let pm of placemarks) {
      const name = pm.getElementsByTagName("name")[0]?.textContent?.trim() || "Placemark";
      const desc = pm.getElementsByTagName("description")[0]?.textContent?.trim() || "";
      const styleUrl = pm.getElementsByTagName("styleUrl")[0]?.textContent?.trim() || "";

      // 1. Point
      const pointEl = pm.getElementsByTagName("Point")[0];
      if (pointEl) {
        const coordsText = pointEl.getElementsByTagName("coordinates")[0]?.textContent?.trim();
        if (coordsText) {
          const pt = this._parseKmlCoord(coordsText);
          if (pt) {
            features.push({
              type: "Point",
              layer: "KML_NOKTALARI",
              name: name,
              coordinates: pt,
              properties: { name: name, description: desc, isWgs84: true }
            });
            this._registerLayer("KML_NOKTALARI");
          }
        }
      }

      // 2. LineString
      const lineEls = pm.getElementsByTagName("LineString");
      for (let lineEl of lineEls) {
        const coordsText = lineEl.getElementsByTagName("coordinates")[0]?.textContent?.trim();
        if (coordsText) {
          const coords = this._parseKmlCoordList(coordsText);
          if (coords.length >= 2) {
            features.push({
              type: "LineString",
              layer: "KML_CILGILERI",
              name: name,
              coordinates: coords,
              properties: { name: name, description: desc, isWgs84: true }
            });
            this._registerLayer("KML_CILGILERI");
          }
        }
      }

      // 3. Polygon
      const polyEls = pm.getElementsByTagName("Polygon");
      for (let polyEl of polyEls) {
        const outerEl = polyEl.getElementsByTagName("outerBoundaryIs")[0];
        if (outerEl) {
          const coordsText = outerEl.getElementsByTagName("coordinates")[0]?.textContent?.trim();
          if (coordsText) {
            const outerCoords = this._parseKmlCoordList(coordsText);
            if (outerCoords.length >= 3) {
              const polyRings = [outerCoords];
              
              // Inner boundaries (holes)
              const innerEls = polyEl.getElementsByTagName("innerBoundaryIs");
              for (let innerEl of innerEls) {
                const inCoordsText = innerEl.getElementsByTagName("coordinates")[0]?.textContent?.trim();
                if (inCoordsText) {
                  const inCoords = this._parseKmlCoordList(inCoordsText);
                  if (inCoords.length >= 3) polyRings.push(inCoords);
                }
              }

              features.push({
                type: "Polygon",
                layer: "KML_ALANLARI",
                name: name,
                coordinates: polyRings,
                properties: { name: name, description: desc, isWgs84: true }
              });
              this._registerLayer("KML_ALANLARI");
            }
          }
        }
      }
    }

    this.features = features;
    this._recomputeStats();
    return features;
  }

  async parseKmz(kmzBlob, options = {}) {
    if (typeof JSZip === "undefined") {
      throw new Error("ERR_JSZIP_REQUIRED");
    }
    const zip = await JSZip.loadAsync(kmzBlob);
    let docKmlText = "";

    // doc.kml dosyasını bul
    for (let fileName in zip.files) {
      if (fileName.toLowerCase().endsWith(".kml")) {
        docKmlText = await zip.file(fileName).async("text");
        break;
      }
    }

    if (!docKmlText) {
      throw new Error("ERR_KMZ_NO_KML");
    }

    return this.parseKml(docKmlText, options);
  }

  _parseKmlCoord(str) {
    const parts = str.trim().split(/[\s,]+/);
    if (parts.length >= 2) {
      const lon = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      const alt = parts[2] ? parseFloat(parts[2]) : 0;
      if (!isNaN(lon) && !isNaN(lat)) return [lon, lat, alt];
    }
    return null;
  }

  _parseKmlCoordList(str) {
    const tokens = str.trim().split(/\s+/);
    const coords = [];
    for (let t of tokens) {
      const pt = this._parseKmlCoord(t);
      if (pt) coords.push(pt);
    }
    return coords;
  }

  /* =========================================================================
   * 2B. GPS EXCHANGE FORMAT (GPX) PARSER (.GPX)
   * ========================================================================= */
  parseGpx(gpxText, options = {}) {
    const features = [];
    let hasDOMParser = false;
    try {
      hasDOMParser = typeof DOMParser !== "undefined" && typeof (new DOMParser().parseFromString) === "function";
    } catch (e) {
      hasDOMParser = false;
    }

    if (hasDOMParser) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxText, "text/xml");

      // 1. Waypoints (<wpt lat="..." lon="...">)
      const wpts = xmlDoc.getElementsByTagName("wpt");
      for (let wpt of wpts) {
        const lat = parseFloat(wpt.getAttribute("lat"));
        const lon = parseFloat(wpt.getAttribute("lon"));
        const ele = parseFloat(wpt.getElementsByTagName("ele")[0]?.textContent || "0");
        const name = wpt.getElementsByTagName("name")[0]?.textContent?.trim() || "WPT";
        const desc = wpt.getElementsByTagName("desc")[0]?.textContent?.trim() || "";

        if (!isNaN(lat) && !isNaN(lon)) {
          features.push({
            type: "Point",
            layer: "GPX_WAYPOINTS",
            name: name,
            coordinates: [lon, lat, isNaN(ele) ? 0 : ele],
            properties: { name, description: desc, isWgs84: true }
          });
          this._registerLayer("GPX_WAYPOINTS", "#38bdf8");
        }
      }

      // 2. Tracks (<trk><trkseg><trkpt lat="..." lon="...">)
      const trks = xmlDoc.getElementsByTagName("trk");
      for (let trk of trks) {
        const name = trk.getElementsByTagName("name")[0]?.textContent?.trim() || "TRACK";
        const trksegs = trk.getElementsByTagName("trkseg");
        for (let seg of trksegs) {
          const pts = [];
          const trkpts = seg.getElementsByTagName("trkpt");
          for (let tp of trkpts) {
            const lat = parseFloat(tp.getAttribute("lat"));
            const lon = parseFloat(tp.getAttribute("lon"));
            const ele = parseFloat(tp.getElementsByTagName("ele")[0]?.textContent || "0");
            if (!isNaN(lat) && !isNaN(lon)) {
              pts.push([lon, lat, isNaN(ele) ? 0 : ele]);
            }
          }
          if (pts.length >= 2) {
            const isClosed = pts.length >= 4 &&
              Math.abs(pts[0][0] - pts[pts.length - 1][0]) < 1e-7 &&
              Math.abs(pts[0][1] - pts[pts.length - 1][1]) < 1e-7;

            if (isClosed) {
              features.push({
                type: "Polygon",
                layer: "GPX_PARKURLAR",
                name: name,
                coordinates: [pts],
                properties: { name, isWgs84: true }
              });
              this._registerLayer("GPX_PARKURLAR", "#34d399");
            } else {
              features.push({
                type: "LineString",
                layer: "GPX_IZLER",
                name: name,
                coordinates: pts,
                properties: { name, isWgs84: true }
              });
              this._registerLayer("GPX_IZLER", "#a855f7");
            }
          }
        }
      }

      // 3. Routes (<rte><rtept lat="..." lon="...">)
      const rtes = xmlDoc.getElementsByTagName("rte");
      for (let rte of rtes) {
        const name = rte.getElementsByTagName("name")[0]?.textContent?.trim() || "ROUTE";
        const pts = [];
        const rtepts = rte.getElementsByTagName("rtept");
        for (let rp of rtepts) {
          const lat = parseFloat(rp.getAttribute("lat"));
          const lon = parseFloat(rp.getAttribute("lon"));
          const ele = parseFloat(rp.getElementsByTagName("ele")[0]?.textContent || "0");
          if (!isNaN(lat) && !isNaN(lon)) {
            pts.push([lon, lat, isNaN(ele) ? 0 : ele]);
          }
        }
        if (pts.length >= 2) {
          features.push({
            type: "LineString",
            layer: "GPX_ROTALAR",
            name: name,
            coordinates: pts,
            properties: { name, isWgs84: true }
          });
          this._registerLayer("GPX_ROTALAR", "#f59e0b");
        }
      }
    } else {
      // Node.js Fallback Regex Parser
      const wptRegex = /<wpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>([\s\S]*?)<\/wpt>/gi;
      let m;
      while ((m = wptRegex.exec(gpxText)) !== null) {
        const lat = parseFloat(m[1]);
        const lon = parseFloat(m[2]);
        const inner = m[3];
        const nameMatch = /<name>([^<]+)<\/name>/i.exec(inner);
        const eleMatch = /<ele>([^<]+)<\/ele>/i.exec(inner);
        const name = nameMatch ? nameMatch[1].trim() : "WPT";
        const ele = eleMatch ? parseFloat(eleMatch[1]) : 0;
        if (!isNaN(lat) && !isNaN(lon)) {
          features.push({
            type: "Point",
            layer: "GPX_WAYPOINTS",
            name: name,
            coordinates: [lon, lat, isNaN(ele) ? 0 : ele],
            properties: { name, isWgs84: true }
          });
          this._registerLayer("GPX_WAYPOINTS", "#38bdf8");
        }
      }

      const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>(?:<ele>([^<]+)<\/ele>)?/gi;
      const pts = [];
      while ((m = trkptRegex.exec(gpxText)) !== null) {
        const lat = parseFloat(m[1]);
        const lon = parseFloat(m[2]);
        const ele = m[3] ? parseFloat(m[3]) : 0;
        if (!isNaN(lat) && !isNaN(lon)) {
          pts.push([lon, lat, ele]);
        }
      }
      if (pts.length >= 2) {
        features.push({
          type: "LineString",
          layer: "GPX_IZLER",
          name: "Track",
          coordinates: pts,
          properties: { name: "Track", isWgs84: true }
        });
        this._registerLayer("GPX_IZLER", "#a855f7");
      }
    }

    this.features = features;
    this._recomputeStats();
    return features;
  }

  /* =========================================================================
   * 3. NETCAD NCN / KOS PARSER
   * ========================================================================= */
  parseNcn(ncnText, options = {}) {
    const lines = ncnText.split(/\r?\n/);
    const features = [];

    for (let line of lines) {
      const l = line.trim();
      if (!l || l.startsWith("#") || l.startsWith(";")) continue;

      // Netcad format: P_NO Y_SAGA X_YUKARI Z_KOT
      const parts = l.split(/\s+/);
      if (parts.length >= 3) {
        const pName = parts[0];
        const yVal = parseFloat(parts[1]);
        const xVal = parseFloat(parts[2]);
        const zVal = parts[3] ? parseFloat(parts[3]) : 0.0;

        if (!isNaN(yVal) && !isNaN(xVal)) {
          features.push({
            type: "Point",
            layer: "NETCAD_NOKTALAR",
            name: pName,
            coordinates: [yVal, xVal, zVal],
            properties: { name: pName, layer: "NETCAD_NOKTALAR", elevation: zVal }
          });
          this._registerLayer("NETCAD_NOKTALAR");
        }
      }
    }

    this.features = features;
    this._recomputeStats();
    return features;
  }

  _isNetcadNcn(text) {
    const lines = text.split(/\r?\n/).slice(0, 10);
    let validCount = 0;
    for (let l of lines) {
      const p = l.trim().split(/\s+/);
      if (p.length >= 3 && !isNaN(parseFloat(p[1])) && !isNaN(parseFloat(p[2]))) {
        validCount++;
      }
    }
    return validCount >= 2;
  }

  /* =========================================================================
   * 4. NETCAD NCZ BİNARY PROJE PARSER (.NCZ)
   * ========================================================================= */
  parseNcz(arrayBufferOrBuffer, options = {}) {
    let ab;
    if (arrayBufferOrBuffer instanceof ArrayBuffer) {
      ab = arrayBufferOrBuffer;
    } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(arrayBufferOrBuffer)) {
      ab = arrayBufferOrBuffer.buffer.slice(
        arrayBufferOrBuffer.byteOffset,
        arrayBufferOrBuffer.byteOffset + arrayBufferOrBuffer.byteLength
      );
    } else if (arrayBufferOrBuffer && arrayBufferOrBuffer.buffer instanceof ArrayBuffer) {
      ab = arrayBufferOrBuffer.buffer;
    } else {
      throw new Error("ERR_NCZ_INVALID_BUFFER");
    }

    const dv = new DataView(ab);
    const u8 = new Uint8Array(ab);
    const features = [];
    const layerNames = [];
    const layerColors = [];
    let version = "";
    let projection = "";
    let detectedDom = null;

    const BLOCK_TYPE_LAYER_TABLE = 6;
    const BLOCK_TYPE_GEOMETRY = 21;
    const BLOCK_TYPE_GEOMETRY_EXTENDED = 22;
    const BLOCK_TYPE_VERSION = 25;
    const BLOCK_TYPE_NAMED_DATA = 28;
    const EXTENDED_HEADER_SIZE = 28;
    const EMBEDDED_CONTAINERS = new Set([0, 5, 14, 48, 108, 111, 132, 150, 180]);

    const decodeTurkish = (offset, len) => {
      let s = "";
      for (let i = 0; i < len && offset + i < u8.length; i++) {
        const b = u8[offset + i];
        if (b === 0) break;
        if (b === 221) s += "İ";
        else if (b === 222) s += "Ş";
        else if (b === 208) s += "Ğ";
        else if (b === 240) s += "ğ";
        else if (b === 253) s += "ı";
        else if (b === 254) s += "ş";
        else if (b === 220) s += "Ü";
        else if (b === 252) s += "ü";
        else if (b === 214) s += "Ö";
        else if (b === 246) s += "ö";
        else if (b === 199) s += "Ç";
        else if (b === 231) s += "ç";
        else if (b >= 32 && b <= 126) s += String.fromCharCode(b);
      }
      return s.trim();
    };

    const validXY = (x, y) => {
      return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) <= 1e8 && Math.abs(y) <= 1e8 && (Math.abs(x) >= 10 || Math.abs(y) >= 10);
    };

    // Netcad binary storage: raw_y is Easting (Y / Sağa), raw_x is Northing (X / Yukarı)
    const toCoord = (raw_x, raw_y, z) => [raw_y, raw_x, z || 0];

    const getLayerName = (layerCode) => {
      if (layerCode >= 0 && layerCode < layerNames.length) return layerNames[layerCode];
      if (layerCode - 1 >= 0 && layerCode - 1 < layerNames.length) return layerNames[layerCode - 1];
      return "0";
    };

    const parseGeomBlock = (offset, blockSize, extSize) => {
      if (blockSize < 7 || offset + 6 >= u8.length) return;
      const geomType = u8[offset + 6];
      const layerCode = u8[offset + 7];
      const layerName = getLayerName(layerCode);

      if (geomType === 1) {
        // Point
        const rx = dv.getFloat64(offset + 8, true);
        const ry = dv.getFloat64(offset + 16, true);
        let z = dv.getFloat32(offset + 24, true);
        if (z === 0 && offset + 32 <= u8.length) z = dv.getFloat32(offset + 28, true);
        if (!validXY(rx, ry)) return;
        const nameLen = u8[offset + extSize + 86];
        const name = nameLen > 0 && nameLen <= 64 ? decodeTurkish(offset + extSize + 87, nameLen) : "P";
        features.push({
          type: "Point",
          layer: layerName,
          name: name || "P",
          coordinates: toCoord(rx, ry, z),
          properties: { name: name || "P", layer: layerName, elevation: z }
        });
        this._registerLayer(layerName);
      } else if (geomType === 2) {
        // Line
        const rx1 = dv.getFloat64(offset + 8, true);
        const ry1 = dv.getFloat64(offset + 16, true);
        const z1 = dv.getFloat32(offset + 24, true);
        const rx2 = dv.getFloat64(offset + blockSize - 19, true);
        const ry2 = dv.getFloat64(offset + blockSize - 11, true);
        const z2 = dv.getFloat32(offset + blockSize - 3, true);
        if (!validXY(rx1, ry1) || !validXY(rx2, ry2)) return;
        features.push({
          type: "LineString",
          layer: layerName,
          name: "",
          coordinates: [toCoord(rx1, ry1, z1), toCoord(rx2, ry2, z2)],
          properties: { layer: layerName, lengthM: Math.hypot(rx2 - rx1, ry2 - ry1) }
        });
        this._registerLayer(layerName);
      } else if (geomType === 3) {
        // Circle
        const rx = dv.getFloat64(offset + 8, true);
        const ry = dv.getFloat64(offset + 16, true);
        const z = dv.getFloat32(offset + 24, true);
        if (!validXY(rx, ry)) return;
        const x2 = dv.getFloat64(offset + 50, true);
        const x3 = dv.getFloat64(offset + 66, true);
        const r = Math.abs(x2 - x3) / 2.0;
        if (r > 0.001) {
          const ring = [];
          for (let deg = 0; deg <= 360; deg += 10) {
            const rad = (deg * Math.PI) / 180;
            ring.push([ry + r * Math.cos(rad), rx + r * Math.sin(rad), z]);
          }
          features.push({
            type: "Polygon",
            layer: layerName,
            name: "Daire",
            coordinates: [ring],
            properties: { layer: layerName, radius: r }
          });
          this._registerLayer(layerName);
        }
      } else if (geomType === 4) {
        // Arc
        const rx = dv.getFloat64(offset + 8, true);
        const ry = dv.getFloat64(offset + 16, true);
        const z = dv.getFloat32(offset + 24, true);
        if (!validXY(rx, ry)) return;
        const r = dv.getFloat64(offset + extSize + 86, true);
        const startAngle = dv.getFloat64(offset + extSize + 104, true);
        const endAngle = dv.getFloat64(offset + extSize + 112, true);
        if (r > 0.001) {
          const arcPts = [];
          const step = (endAngle - startAngle) / 20;
          for (let a = startAngle; a <= endAngle; a += step) {
            arcPts.push([ry + r * Math.cos(a), rx + r * Math.sin(a), z]);
          }
          if (arcPts.length >= 2) {
            features.push({
              type: "LineString",
              layer: layerName,
              name: "Yay",
              coordinates: arcPts,
              properties: { layer: layerName, radius: r }
            });
            this._registerLayer(layerName);
          }
        }
      } else if (geomType === 5) {
        // Text (CAD Metni / Kot / Parsel / Ada No)
        const rx = dv.getFloat64(offset + 8, true);
        const ry = dv.getFloat64(offset + 16, true);
        let z = dv.getFloat32(offset + 24, true);
        if (z === 0 && offset + 32 <= u8.length) z = dv.getFloat32(offset + 28, true);
        if (!validXY(rx, ry)) return;
        let txt = "";
        const l1 = u8[offset + extSize + 97];
        if (l1 > 0 && l1 <= 240) txt = decodeTurkish(offset + extSize + 98, l1);
        if (!txt) {
          const l2 = u8[offset + extSize + 86];
          if (l2 > 0 && l2 <= 240) txt = decodeTurkish(offset + extSize + 87, l2);
        }
        if (!txt && extSize > 0) {
          const l3 = u8[offset + 97];
          if (l3 > 0 && l3 <= 240) txt = decodeTurkish(offset + 98, l3);
          if (!txt) {
            const l4 = u8[offset + 86];
            if (l4 > 0 && l4 <= 240) txt = decodeTurkish(offset + 87, l4);
          }
        }
        if (txt) {
          let rot = 0;
          if (offset + extSize + 94 <= u8.length) {
            const rad = dv.getFloat32(offset + extSize + 90, true);
            if (Number.isFinite(rad)) rot = (rad * (180 / Math.PI)) % 360;
          }
          let height = 1.5;
          if (offset + extSize + 90 <= u8.length) {
            const h = dv.getFloat32(offset + extSize + 86, true);
            if (Number.isFinite(h) && h > 0 && h < 1000) height = h;
          }
          features.push({
            type: "Text",
            layer: layerName,
            name: txt,
            coordinates: toCoord(rx, ry, z),
            properties: { text: txt, layer: layerName, elevation: z, rotation: rot, height }
          });
          this._registerLayer(layerName);
        }
      } else if (geomType === 6) {
        // Symbol (Nokta / Ağaç / Direk / Nirengi Sembolü)
        const rx = dv.getFloat64(offset + 8, true);
        const ry = dv.getFloat64(offset + 16, true);
        let z = dv.getFloat32(offset + 24, true);
        if (z === 0 && offset + 32 <= u8.length) z = dv.getFloat32(offset + 28, true);
        if (!validXY(rx, ry)) return;
        let sOff = offset + extSize + 94;
        if (sOff >= offset + blockSize + 1 || sOff >= u8.length) sOff = offset + 94;
        const sCode = sOff < u8.length ? u8[sOff] : 0;
        const symName = `S${sCode || 0}`;
        features.push({
          type: "Point",
          layer: layerName,
          name: symName,
          coordinates: toCoord(rx, ry, z),
          properties: { name: symName, layer: layerName, elevation: z, isSymbol: true, symbolCode: sCode }
        });
        this._registerLayer(layerName);
      } else if (geomType === 9) {
        // Compressed Curve / Sıkıştırılmış Detay Eğrisi
        const ox = dv.getFloat64(offset + 8, true);
        const oy = dv.getFloat64(offset + 16, true);
        if (!validXY(ox, oy)) return;
        const ptDataOff = offset + extSize + 122;
        const endOff = Math.min(u8.length, offset + blockSize + 1);
        const pts = [];
        for (let rOff = ptDataOff; rOff <= endOff - 8; rOff += 18) {
          const dx = dv.getFloat32(rOff, true);
          const dy = dv.getFloat32(rOff + 4, true);
          if (Number.isFinite(dx) && Number.isFinite(dy)) {
            const cx = ox + dx;
            const cy = oy + dy;
            if (validXY(cx, cy)) {
              pts.push(toCoord(cx, cy, 0));
            }
          }
        }
        if (pts.length >= 2) {
          features.push({
            type: "LineString",
            layer: layerName,
            name: "Curve",
            coordinates: pts,
            properties: { layer: layerName, lengthM: this._computeLineLength(pts) }
          });
          this._registerLayer(layerName);
        }
      } else if (geomType === 10) {
        // Box / Pafta Çerçevesi
        const rx1 = dv.getFloat64(offset + 8, true);
        const ry1 = dv.getFloat64(offset + 16, true);
        const rx2 = dv.getFloat64(offset + extSize + 104, true);
        const ry2 = dv.getFloat64(offset + extSize + 112, true);
        if (!validXY(rx1, ry1) || !validXY(rx2, ry2)) return;
        const p0 = toCoord(rx1, ry1, 0);
        const p1 = toCoord(rx1, ry2, 0);
        const p2 = toCoord(rx2, ry2, 0);
        const p3 = toCoord(rx2, ry1, 0);
        const ring = [p0, p1, p2, p3, p0];
        const area = Math.abs((rx2 - rx1) * (ry2 - ry1));
        features.push({
          type: "Polygon",
          layer: layerName,
          name: "Sheet_Frame",
          coordinates: [ring],
          properties: { layer: layerName, areaM2: area, perimeterM: 2 * (Math.abs(rx2 - rx1) + Math.abs(ry2 - ry1)) }
        });
        this._registerLayer(layerName);
      } else if (geomType === 7) {
        // Multiline / Polyline / Polygon
        const ptCount = Math.floor((blockSize + 1 - 113 - extSize) / 24);
        if (ptCount >= 2) {
          const coords = [];
          const blockEnd = Math.min(u8.length, offset + blockSize + 1);
          for (let i = 0; i < ptCount; i++) {
            const cOffset = i * 24 + (offset + extSize + 113);
            if (cOffset + 24 > blockEnd) break;
            const rx = dv.getFloat64(cOffset, true);
            const ry = dv.getFloat64(cOffset + 8, true);
            const z = dv.getFloat64(cOffset + 16, true);
            coords.push(toCoord(rx, ry, z));
          }
          if (coords.length >= 2) {
            const first = coords[0];
            const last = coords[coords.length - 1];
            const isClosed = Math.abs(first[0] - last[0]) < 0.05 && Math.abs(first[1] - last[1]) < 0.05;
            if (isClosed) {
              features.push({
                type: "Polygon",
                layer: layerName,
                name: "",
                coordinates: [coords],
                properties: { layer: layerName }
              });
            } else {
              features.push({
                type: "LineString",
                layer: layerName,
                name: "",
                coordinates: coords,
                properties: { layer: layerName }
              });
            }
            this._registerLayer(layerName);
          }
        }
      } else if (geomType === 10) {
        // Box / Polygon
        const rx1 = dv.getFloat64(offset + 8, true);
        const ry1 = dv.getFloat64(offset + 16, true);
        const rx2 = dv.getFloat64(offset + extSize + 104, true);
        const ry2 = dv.getFloat64(offset + extSize + 112, true);
        const rotRad = dv.getFloat32(offset + extSize + 120, true);
        if (validXY(rx1, ry1) && validXY(rx2, ry2)) {
          const w = Math.abs(rx2 - rx1);
          const h = Math.abs(ry2 - ry1);
          const rotDeg = (rotRad * 180 / Math.PI) % 360;
          const angle = rotDeg * Math.PI / 180;
          const sx = Math.sin(angle), sy = Math.cos(angle);
          const bx = Math.cos(angle), by = -Math.sin(angle);
          const p0 = toCoord(rx1, ry1, 0);
          const p1 = toCoord(rx1 + bx * w, ry1 + by * w, 0);
          const p2 = toCoord(rx1 + bx * w + sx * h, ry1 + by * w + sy * h, 0);
          const p3 = toCoord(rx1 + sx * h, ry1 + sy * h, 0);
          features.push({
            type: "Polygon",
            layer: layerName,
            name: "Kutu",
            coordinates: [[p0, p1, p2, p3, p0]],
            properties: { layer: layerName }
          });
          this._registerLayer(layerName);
        }
      } else if (geomType === 12 && options.includeTriangles !== false) {
        // Triangle (TIN model)
        const rx1 = dv.getFloat64(offset + 8, true);
        const ry1 = dv.getFloat64(offset + 16, true);
        const z1 = dv.getFloat32(offset + 24, true);
        const rx2 = dv.getFloat64(offset + 86, true);
        const ry2 = dv.getFloat64(offset + 94, true);
        const rx3 = dv.getFloat64(offset + 106, true);
        const ry3 = dv.getFloat64(offset + 114, true);
        if (validXY(rx1, ry1) && validXY(rx2, ry2) && validXY(rx3, ry3)) {
          const p1 = toCoord(rx1, ry1, z1);
          const p2 = toCoord(rx2, ry2, 0);
          const p3 = toCoord(rx3, ry3, 0);
          features.push({
            type: "Polygon",
            layer: layerName || "UCGEN_MODEL",
            name: "TIN",
            coordinates: [[p1, p2, p3, p1]],
            properties: { layer: layerName || "UCGEN_MODEL" }
          });
          this._registerLayer(layerName || "UCGEN_MODEL");
        }
      }
    };

    // Scan blocks
    let cursor = 0;
    while (cursor + 5 < u8.length) {
      const blockSize = dv.getUint32(cursor + 1, true) + 4;
      const totalBlockSize = blockSize + 1;
      if (blockSize < 4 || cursor + totalBlockSize > u8.length) {
        cursor++;
        continue;
      }
      const blockType = u8[cursor];
      if (blockType === BLOCK_TYPE_VERSION && !version) {
        version = decodeTurkish(cursor + 6, u8[cursor + 5]);
      } else if (blockType === BLOCK_TYPE_NAMED_DATA) {
        const blockEnd = Math.min(u8.length, cursor + blockSize + 1);
        const bName = decodeTurkish(cursor + 6, u8[cursor + 5]);
        if (bName === "MPROJ" && cursor + 22 <= blockEnd) {
          const projCode = u8[cursor + 16];
          const datumCode = u8[cursor + 17];
          const zone = u8[cursor + 21];
          const projMap = { 1: "Geographic", 2: "6°", 3: "3°" };
          const datumMap = { 0: "WGS84", 1: "ITRF96", 4: "ED50", 254: "ED50-HGK" };
          const dName = datumMap[datumCode] || "ED50";
          detectedDom = zone;
          projection = `${dName} / TM ${projMap[projCode] || "3°"} / Dilim ${zone}°`;
        } else if (bName === "LEX.ST2" && cursor + 21 <= blockEnd) {
          const count = u8[cursor + 20];
          for (let i = 0; i < count; i++) {
            const itemOffset = cursor + 79 + (i * 256);
            if (itemOffset + 3 > blockEnd) break;
            const r = u8[itemOffset], g = u8[itemOffset + 1], b = u8[itemOffset + 2];
            const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            layerColors.push(hex === "#000000" ? "#06b6d4" : hex);
          }
        }
      } else if (blockType === BLOCK_TYPE_LAYER_TABLE) {
        const lCount = dv.getUint16(cursor + 16, true);
        for (let i = 0; i < lCount; i++) {
          const itemOffset = cursor + 18 + (i * 29);
          if (itemOffset + 29 > cursor + totalBlockSize) break;
          const lName = decodeTurkish(itemOffset + 5, u8[itemOffset + 4]);
          if (lName) layerNames.push(lName);
        }
      } else if (blockType === BLOCK_TYPE_GEOMETRY || blockType === BLOCK_TYPE_GEOMETRY_EXTENDED) {
        const extSize = blockType === BLOCK_TYPE_GEOMETRY_EXTENDED ? EXTENDED_HEADER_SIZE : 0;
        parseGeomBlock(cursor, blockSize, extSize);
      } else if (EMBEDDED_CONTAINERS.has(blockType)) {
        let innerCursor = cursor + 5;
        const innerEnd = Math.min(u8.length, cursor + blockSize);
        while (innerCursor + 6 < innerEnd) {
          const isGeom = u8[innerCursor] === BLOCK_TYPE_GEOMETRY || u8[innerCursor] === BLOCK_TYPE_GEOMETRY_EXTENDED;
          const hasMatchingType = u8[innerCursor + 5] === u8[innerCursor + 6];
          if (!isGeom || !hasMatchingType) {
            innerCursor++;
            continue;
          }
          const innerSize = dv.getUint32(innerCursor + 1, true) + 4;
          const totalInner = innerSize + 1;
          if (innerSize < 7 || innerCursor + totalInner > innerEnd) {
            innerCursor++;
            continue;
          }
          const extSize = u8[innerCursor] === BLOCK_TYPE_GEOMETRY_EXTENDED ? EXTENDED_HEADER_SIZE : 0;
          parseGeomBlock(innerCursor, innerSize, extSize);
          innerCursor += totalInner;
        }
      }
      cursor += totalBlockSize;
    }

    // Apply layer colors to registered layers
    layerNames.forEach((name, idx) => {
      const col = layerColors[idx] || "#06b6d4";
      const isTin = name.includes("UCGEN") || name.includes("TIN") || name.includes("MODEL");
      if (this.layers.has(name)) {
        this.layers.get(name).color = col;
        if (isTin) this.layers.get(name).visible = false; // Hide TIN by default on 2D map for speed
      } else {
        this.layers.set(name, { color: col, count: 0, visible: !isTin });
      }
    });

    if (detectedDom && detectedDom >= 21 && detectedDom <= 45) {
      this.defaultDom = detectedDom;
      this.sourceCrs = `TUREF_TM${detectedDom}`;
    }

    this.metadata = {
      version: version || "Netcad NCZ",
      projection: projection || "Bilinmiyor",
      dom: detectedDom || this.defaultDom,
      layerCount: layerNames.length
    };

    this.features = features;
    this._recomputeStats();
    return features;
  }

  /* =========================================================================
   * 5. SAHA CSV / TXT / XYZ PARSER
   * ========================================================================= */
  parseCsv(csvText, options = {}) {
    const lines = csvText.split(/\r?\n/);
    const features = [];
    let delimiter = ",";

    // Delimiter detection
    const firstLine = lines[0] || "";
    if (firstLine.includes(";")) delimiter = ";";
    else if (firstLine.includes("\t")) delimiter = "\t";
    else if (!firstLine.includes(",") && firstLine.includes(" ")) delimiter = " ";

    let hasHeader = false;
    let colMap = { name: 0, y: 1, x: 2, z: 3 };

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!l || l.startsWith("#")) continue;

      const parts = delimiter === " " ? l.split(/\s+/) : l.split(delimiter).map(s => s.trim());
      if (parts.length < 2) continue;

      if (i === 0) {
        // Detect header
        const lower = parts.map(p => p.toLowerCase());
        if (lower.some(s => s.includes("nokta") || s.includes("name") || s.includes("point") || s.includes("lat") || s.includes("x") || s.includes("y") || s.includes("easting"))) {
          hasHeader = true;
          lower.forEach((col, idx) => {
            if (col.includes("nokta") || col.includes("name") || col.includes("point") || col === "p" || col === "id") colMap.name = idx;
            if (col.includes("saga") || col.includes("easting") || col.includes("lon") || col === "y") colMap.y = idx;
            if (col.includes("yukari") || col.includes("northing") || col.includes("lat") || col === "x") colMap.x = idx;
            if (col.includes("kot") || col.includes("elev") || col.includes("alt") || col.includes("z") || col === "h") colMap.z = idx;
          });
          continue;
        }
      }

      const pName = parts[colMap.name] || `P${features.length + 1}`;
      const yVal = parseFloat(parts[colMap.y]);
      const xVal = parseFloat(parts[colMap.x]);
      const zVal = parts[colMap.z] ? parseFloat(parts[colMap.z]) : 0.0;

      if (!isNaN(yVal) && !isNaN(xVal)) {
        features.push({
          type: "Point",
          layer: "SAHA_NOKTALARI",
          name: pName,
          coordinates: [yVal, xVal, zVal],
          properties: { name: pName, layer: "SAHA_NOKTALARI", elevation: zVal }
        });
        this._registerLayer("SAHA_NOKTALARI");
      }
    }

    this.features = features;
    this._recomputeStats();
    return features;
  }

  /* =========================================================================
   * 5. GEOJSON PARSER
   * ========================================================================= */
  parseGeoJson(geoJsonText, options = {}) {
    const obj = typeof geoJsonText === "string" ? JSON.parse(geoJsonText) : geoJsonText;
    const features = [];

    const rawFeatures = obj.type === "FeatureCollection" ? obj.features : (obj.type === "Feature" ? [obj] : [{ geometry: obj, properties: {} }]);

    for (let f of rawFeatures) {
      if (!f || !f.geometry) continue;
      const gType = f.geometry.type;
      const coords = f.geometry.coordinates;
      const props = f.properties || {};
      const layer = props.layer || props.Layer || "GEOJSON_KATMAN";
      const name = props.name || props.Name || props.Nokta_No || `${gType}_${features.length + 1}`;

      features.push({
        type: gType,
        layer: layer,
        name: name,
        coordinates: coords,
        properties: { ...props, layer: layer, isWgs84: true }
      });
      this._registerLayer(layer);
    }

    this.features = features;
    this._recomputeStats();
    return features;
  }

  /* =========================================================================
   * 5B. İHA & OBLIQUE KAMERA POZ PARSER (CHC C30 / SHARE UAV / DJI Terra)
   * ========================================================================= */
  parseUavPos(posText, options = {}) {
    const lines = posText.split(/\r?\n/);
    const features = [];
    let delimiter = ",";
    const firstLine = lines.find(l => l.trim().length > 0 && !l.trim().startsWith("#") && !l.trim().startsWith("//")) || "";
    if (firstLine.includes("\t")) delimiter = "\t";
    else if (firstLine.includes(";")) delimiter = ";";
    else if (firstLine.includes(",")) delimiter = ",";
    else if (firstLine.includes(" ")) delimiter = " ";

    let colMap = { id: 0, lon: 1, lat: 2, height: 3, yaw: -1, pitch: -1, roll: -1, omega: -1, phi: -1, kappa: -1, lens: -1 };
    let hasHeader = false;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i].trim();
      if (!raw || raw.startsWith("#") || raw.startsWith("//") || raw.startsWith(";")) continue;

      const parts = delimiter === " " ? raw.split(/\s+/) : raw.split(delimiter).map(s => s.trim());
      if (parts.length < 3) continue;

      if (!hasHeader) {
        const lower = parts.map(p => p.toLowerCase());
        if (lower.some(s => s.includes("photo") || s.includes("image") || s.includes("name") || s.includes("yaw") || s.includes("lat") || s.includes("lon") || s.includes("omega") || s.includes("kappa"))) {
          hasHeader = true;
          lower.forEach((col, idx) => {
            if (col.includes("photo") || col.includes("image") || col.includes("name") || col === "id" || col === "no") colMap.id = idx;
            if (col.includes("lon") || col.includes("saga") || col.includes("east") || col === "y" || col === "x") colMap.lon = idx;
            if (col.includes("lat") || col.includes("yukari") || col.includes("north") || col === "x" || col === "y") colMap.lat = idx;
            if (col.includes("alt") || col.includes("height") || col.includes("elev") || col.includes("kot") || col === "z" || col === "h") colMap.height = idx;
            if (col.includes("yaw") || col.includes("heading")) colMap.yaw = idx;
            if (col.includes("pitch") || col.includes("tilt")) colMap.pitch = idx;
            if (col.includes("roll")) colMap.roll = idx;
            if (col.includes("omega")) colMap.omega = idx;
            if (col.includes("phi")) colMap.phi = idx;
            if (col.includes("kappa")) colMap.kappa = idx;
            if (col.includes("lens") || col.includes("cam") || col.includes("kamera")) colMap.lens = idx;
          });
          continue;
        }
      }

      const pId = parts[colMap.id] || `IMG_${features.length + 1}`;
      let c1 = parseFloat(parts[colMap.lon >= 0 ? colMap.lon : 1]);
      let c2 = parseFloat(parts[colMap.lat >= 0 ? colMap.lat : 2]);
      let alt = parseFloat(parts[colMap.height >= 0 ? colMap.height : 3]) || 0;

      if (isNaN(c1) || isNaN(c2)) continue;

      // Detect if coordinates are Lat/Lon vs TM Easting/Northing
      let isWgs = false;
      let finalCoords = [c1, c2, alt];
      if ((c1 >= -180 && c1 <= 180) && (c2 >= -90 && c2 <= 90)) {
        isWgs = true;
        // Lon, Lat order for internal GeoJSON standards
        if (c1 > 25 && c1 < 45 && c2 > 35 && c2 < 43) {
          finalCoords = [c1, c2, alt];
        } else if (c2 > 25 && c2 < 45 && c1 > 35 && c1 < 43) {
          finalCoords = [c2, c1, alt];
        }
      }

      const yaw = colMap.yaw >= 0 && parts[colMap.yaw] ? parseFloat(parts[colMap.yaw]) : (colMap.kappa >= 0 ? parseFloat(parts[colMap.kappa]) : 0);
      const pitch = colMap.pitch >= 0 && parts[colMap.pitch] ? parseFloat(parts[colMap.pitch]) : (colMap.phi >= 0 ? parseFloat(parts[colMap.phi]) : 0);
      const roll = colMap.roll >= 0 && parts[colMap.roll] ? parseFloat(parts[colMap.roll]) : (colMap.omega >= 0 ? parseFloat(parts[colMap.omega]) : 0);

      // Oblique lens detection (1..5 or Nadir/FWD/RGT/BWD/LFT)
      let lensCode = colMap.lens >= 0 && parts[colMap.lens] ? parts[colMap.lens] : "NADIR";
      if (pId.endsWith("_1") || pId.includes("_NAD") || pId.includes("_1.")) lensCode = "NADIR";
      else if (pId.endsWith("_2") || pId.includes("_FWD") || pId.includes("_2.")) lensCode = "FORWARD";
      else if (pId.endsWith("_3") || pId.includes("_RGT") || pId.includes("_3.")) lensCode = "RIGHT";
      else if (pId.endsWith("_4") || pId.includes("_BWD") || pId.includes("_4.")) lensCode = "BACKWARD";
      else if (pId.endsWith("_5") || pId.includes("_LFT") || pId.includes("_5.")) lensCode = "LEFT";

      features.push({
        type: "Point",
        layer: "UAV_KAMERA_POZLARI",
        name: pId,
        coordinates: finalCoords,
        properties: {
          name: pId,
          layer: "UAV_KAMERA_POZLARI",
          elevation: alt,
          yaw: isNaN(yaw) ? 0 : yaw,
          pitch: isNaN(pitch) ? 0 : pitch,
          roll: isNaN(roll) ? 0 : roll,
          lens: lensCode,
          isUavCamera: true,
          isWgs84: isWgs
        }
      });
      this._registerLayer("UAV_KAMERA_POZLARI", "#0ea5e9");
    }

    this.features = features;
    this._recomputeStats();
    return features;
  }

  _isUavPos(text) {
    const lower = text.slice(0, 1000).toLowerCase();
    return lower.includes("photoid") ||
           lower.includes("imagename") ||
           (lower.includes("yaw") && lower.includes("pitch")) ||
           (lower.includes("omega") && lower.includes("phi") && lower.includes("kappa")) ||
           lower.includes("chc") ||
           lower.includes("share uav") ||
           lower.includes("c30") ||
           lower.includes("psdk");
  }

  /* =========================================================================
   * 6. NOKTALARDAN ALAN & POLİGON ÜRETME MOTORU (Point-to-Polygon Engine)
   * ========================================================================= */
  generatePolygonFromPoints(mode = "sequential", options = {}) {
    const points = this.features.filter(f => f.type === "Point");
    if (points.length < 3) {
      throw new Error("ERR_MIN_3_POINTS_REQUIRED");
    }

    const layerName = options.layerName || "KAPALI_ALAN";
    let polyCoords = [];

    if (mode === "convex_hull") {
      // Graham Scan 2D Convex Hull
      polyCoords = this._computeConvexHull(points.map(p => ({
        x: p.coordinates[0],
        y: p.coordinates[1],
        z: p.coordinates[2] || 0,
        name: p.name
      })));
    } else {
      // Sequential loop
      polyCoords = points.map(p => [p.coordinates[0], p.coordinates[1], p.coordinates[2] || 0]);
      // Close polygon
      polyCoords.push([...polyCoords[0]]);
    }

    const areaM2 = this._computePolygonArea(polyCoords);
    const perimM = this._computePolygonPerimeter(polyCoords);

    const polyFeature = {
      type: "Polygon",
      layer: layerName,
      name: `Kapali_Alan_${Math.round(areaM2)}m2`,
      coordinates: [polyCoords],
      properties: {
        layer: layerName,
        areaM2: Math.abs(areaM2),
        areaDonum: Math.abs(areaM2) / 1000.0,
        areaHektar: Math.abs(areaM2) / 10000.0,
        perimeterM: perimM,
        pointCount: polyCoords.length - 1,
        mode: mode,
        isGenerated: true
      }
    };

    this.features.push(polyFeature);
    this._registerLayer(layerName, "#10b981");
    this._recomputeStats();
    return polyFeature;
  }

  _computeConvexHull(pts) {
    if (pts.length <= 2) return pts.map(p => [p.x, p.y, p.z]);

    // Find lowest y (and leftmost x on tie)
    let minIdx = 0;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].y < pts[minIdx].y || (pts[i].y === pts[minIdx].y && pts[i].x < pts[minIdx].x)) {
        minIdx = i;
      }
    }

    const p0 = pts[minIdx];
    const sorted = pts.slice();
    sorted.splice(minIdx, 1);

    sorted.sort((a, b) => {
      const order = this._ccwOrder(p0, a, b);
      if (order === 0) {
        return this._distSq(p0, a) - this._distSq(p0, b);
      }
      return order > 0 ? -1 : 1;
    });

    const hull = [p0, sorted[0], sorted[1]];
    for (let i = 2; i < sorted.length; i++) {
      let top = hull.length - 1;
      while (hull.length >= 2 && this._ccwOrder(hull[top - 1], hull[top], sorted[i]) <= 0) {
        hull.pop();
        top = hull.length - 1;
      }
      hull.push(sorted[i]);
    }

    const res = hull.map(p => [p.x, p.y, p.z || 0]);
    res.push([...res[0]]);
    return res;
  }

  _ccwOrder(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  }

  _distSq(p1, p2) {
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
  }

  /* =========================================================================
   * 7. PROJEKSİYON DÖNÜŞÜMÜ (TUREF TM 3° ⇄ WGS84 Coğrafi)
   * ========================================================================= */
  transformCoordinates(srcCrs, dstCrs, dom = 30) {
    if (!this.geodesy) return;
    if (srcCrs === dstCrs) return;

    this.features = this.features.map(f => {
      const cloned = JSON.parse(JSON.stringify(f));
      cloned.coordinates = this._transformCoordsRec(cloned.coordinates, srcCrs, dstCrs, dom);
      return cloned;
    });

    this._recomputeStats();
  }

  _transformCoordsRec(coords, srcCrs, dstCrs, dom) {
    if (typeof coords[0] === "number") {
      // Single point [c1, c2, c3]
      return this._transformSingleCoord(coords, srcCrs, dstCrs, dom);
    } else {
      return coords.map(c => this._transformCoordsRec(c, srcCrs, dstCrs, dom));
    }
  }

  _transformSingleCoord(c, srcCrs, dstCrs, dom) {
    const xOrLon = c[0];
    const yOrLat = c[1];
    const z = c[2] || 0;

    // TM 3° -> WGS84: coordinates stored as [Y_easting, X_northing, Z]
    if (srcCrs.startsWith("TUREF_TM") && dstCrs === "WGS84") {
      const geo = this.geodesy.turefTMToWgs84(xOrLon, yOrLat, dom);
      return [geo.lon, geo.lat, z];
    }

    // WGS84 -> TM 3°: coordinates stored as [lon, lat, Z]
    if (srcCrs === "WGS84" && dstCrs.startsWith("TUREF_TM")) {
      const tm = this.geodesy.wgs84ToTurefTM(yOrLat, xOrLon, dom);
      return [tm.y, tm.x, z];
    }

    return c;
  }

  /* =========================================================================
   * 8. DIŞA AKTARMA MOTORLARI (DXF, KML, KMZ, NCN, GeoJSON, CSV)
   * ========================================================================= */
  exportDxf(options = {}) {
    let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n";

    // TABLES: LAYER
    dxf += "0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n" + (this.layers.size || 1) + "\n";
    if (this.layers.size === 0) {
      dxf += "0\nLAYER\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS\n";
    } else {
      this.layers.forEach((data, name) => {
        dxf += `0\nLAYER\n2\n${name}\n70\n0\n62\n${this._hexToDxfColorIndex(data.color)}\n6\nCONTINUOUS\n`;
      });
    }
    dxf += "0\nENDTAB\n0\nENDSEC\n";

    // ENTITIES
    dxf += "0\nSECTION\n2\nENTITIES\n";

    for (let f of this.features) {
      const layer = f.layer || "0";
      const name = f.name || "";

      if (f.type === "Point") {
        const [y, x, z] = f.coordinates;
        dxf += `0\nPOINT\n8\n${layer}\n10\n${y}\n20\n${x}\n30\n${z || 0}\n`;
        if (name) {
          dxf += `0\nTEXT\n8\n${layer}_YAZI\n10\n${y + 0.5}\n20\n${x + 0.5}\n30\n${z || 0}\n40\n1.5\n1\n${name}\n`;
        }
      } else if (f.type === "LineString") {
        for (let i = 0; i < f.coordinates.length - 1; i++) {
          const p1 = f.coordinates[i];
          const p2 = f.coordinates[i + 1];
          dxf += `0\nLINE\n8\n${layer}\n10\n${p1[0]}\n20\n${p1[1]}\n30\n${p1[2] || 0}\n11\n${p2[0]}\n21\n${p2[1]}\n31\n${p2[2] || 0}\n`;
        }
      } else if (f.type === "Text") {
        const [y, x, z] = f.coordinates;
        const height = (f.properties && f.properties.height) || 1.5;
        const rot = (f.properties && f.properties.rotation) || 0;
        dxf += `0\nTEXT\n8\n${layer}\n10\n${y}\n20\n${x}\n30\n${z || 0}\n40\n${height}\n50\n${rot}\n1\n${name}\n`;
      } else if (f.type === "Polygon") {
        const ring = f.coordinates[0];
        dxf += `0\nLWPOLYLINE\n8\n${layer}\n90\n${ring.length}\n70\n1\n`;
        for (let pt of ring) {
          dxf += `10\n${pt[0]}\n20\n${pt[1]}\n`;
        }
      }
    }

    dxf += "0\nENDSEC\n0\nEOF\n";
    return dxf;
  }

  exportKml(options = {}) {
    const dom = options.dom || this.defaultDom;
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>${this.sourceFileName || "GNSS_POS_Converter"}</name>
  <description>GNSS POS Studio Universal Converter Export</description>
  
  <Style id="polyStyle">
    <LineStyle><color>ff00ffff</color><width>2.5</width></LineStyle>
    <PolyStyle><color>4000ffff</color></PolyStyle>
  </Style>
  <Style id="lineStyle">
    <LineStyle><color>ff00ff00</color><width>2.0</width></LineStyle>
  </Style>
  <Style id="pointStyle">
    <IconStyle><scale>0.9</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle>
  </Style>
`;

    for (let f of this.features) {
      const layer = f.layer || "Katman";
      const name = f.name || "Geometri";
      const isWgs = f.properties && f.properties.isWgs84;

      if (f.type === "Point" || f.type === "Text") {
        let [lon, lat, alt] = f.coordinates;
        if (!isWgs && this.geodesy) {
          const geo = this.geodesy.turefTMToWgs84(lon, lat, dom);
          lon = geo.lon;
          lat = geo.lat;
        }

        kml += `
  <Placemark>
    <name>${name}</name>
    <ExtendedData>
      <Data name="Type"><value>${f.type === "Text" ? "Text" : "Point"}</value></Data>
      <Data name="Layer"><value>${layer}</value></Data>
      <Data name="Elevation"><value>${alt || 0}</value></Data>
    </ExtendedData>
    <styleUrl>#pointStyle</styleUrl>
    <Point>
      <coordinates>${lon.toFixed(7)},${lat.toFixed(7)},${alt || 0}</coordinates>
    </Point>
  </Placemark>`;
      } else if (f.type === "LineString") {
        const coordStrs = f.coordinates.map(c => {
          let lon = c[0], lat = c[1], alt = c[2] || 0;
          if (!isWgs && this.geodesy) {
            const geo = this.geodesy.turefTMToWgs84(lon, lat, dom);
            lon = geo.lon;
            lat = geo.lat;
          }
          return `${lon.toFixed(7)},${lat.toFixed(7)},${alt}`;
        }).join(" ");

        kml += `
  <Placemark>
    <name>${name}</name>
    <ExtendedData>
      <Data name="Layer"><value>${layer}</value></Data>
    </ExtendedData>
    <styleUrl>#lineStyle</styleUrl>
    <LineString>
      <tessellate>1</tessellate>
      <coordinates>${coordStrs}</coordinates>
    </LineString>
  </Placemark>`;
      } else if (f.type === "Polygon") {
        const outerRing = f.coordinates[0];
        const coordStrs = outerRing.map(c => {
          let lon = c[0], lat = c[1], alt = c[2] || 0;
          if (!isWgs && this.geodesy) {
            const geo = this.geodesy.turefTMToWgs84(lon, lat, dom);
            lon = geo.lon;
            lat = geo.lat;
          }
          return `${lon.toFixed(7)},${lat.toFixed(7)},${alt}`;
        }).join(" ");

        const areaTag = f.properties && f.properties.areaM2 ? `\n      <Data name="Area_m2"><value>${f.properties.areaM2.toFixed(2)}</value></Data>` : "";

        kml += `
  <Placemark>
    <name>${name}</name>
    <ExtendedData>
      <Data name="Layer"><value>${layer}</value></Data>${areaTag}
    </ExtendedData>
    <styleUrl>#polyStyle</styleUrl>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>${coordStrs}</coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>`;
      }
    }

    kml += "\n</Document>\n</kml>";
    return kml;
  }

  async exportKmz(options = {}) {
    if (typeof JSZip === "undefined") {
      throw new Error("ERR_JSZIP_REQUIRED");
    }
    const kmlContent = this.exportKml(options);
    const zip = new JSZip();
    zip.file("doc.kml", kmlContent);
    return await zip.generateAsync({ type: "blob" });
  }

  exportNcn(options = {}) {
    let ncn = "";
    const dom = options.dom || this.defaultDom;

    for (let f of this.features) {
      if (f.type === "Point") {
        let [y, x, z] = f.coordinates;
        if (f.properties && f.properties.isWgs84 && this.geodesy) {
          const tm = this.geodesy.wgs84ToTurefTM(x, y, dom);
          y = tm.y;
          x = tm.x;
        }
        const pName = (f.name || "P").padEnd(14, " ");
        const yStr = y.toFixed(3).padStart(12, " ");
        const xStr = x.toFixed(3).padStart(12, " ");
        const zStr = (z || 0).toFixed(3).padStart(10, " ");
        ncn += `${pName} ${yStr} ${xStr} ${zStr}\n`;
      }
    }
    return ncn;
  }

  exportGeoJson(options = {}) {
    const dom = options.dom || this.defaultDom;
    const geoFeatures = [];

    for (let f of this.features) {
      const isWgs = f.properties && f.properties.isWgs84;
      const convertedCoords = isWgs ? f.coordinates : this._transformCoordsRec(f.coordinates, "TUREF_TM30", "WGS84", dom);
      const geomType = (f.type === "Text" || f.type === "Symbol") ? "Point" : f.type;

      geoFeatures.push({
        type: "Feature",
        geometry: {
          type: geomType,
          coordinates: convertedCoords
        },
        properties: {
          name: f.name,
          layer: f.layer,
          isText: f.type === "Text",
          ...f.properties
        }
      });
    }

    return JSON.stringify({
      type: "FeatureCollection",
      features: geoFeatures
    }, null, 2);
  }

  exportGpx(options = {}) {
    const dom = options.dom || this.defaultDom;
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    gpx += `<gpx version="1.1" creator="Harita Tools GNSS POS Studio" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n`;
    gpx += `  <metadata>\n    <name>${(this.sourceFileName || "Export").replace(/[<>&]/g, "")}</name>\n    <time>${new Date().toISOString()}</time>\n  </metadata>\n`;

    // 1. Waypoints (Points & Texts)
    for (let f of this.features) {
      if (f.type === "Point" || f.type === "Text") {
        const isWgs = f.properties && f.properties.isWgs84;
        const [lon, lat, ele] = isWgs ? f.coordinates : this._transformCoordsRec(f.coordinates, "TUREF_TM30", "WGS84", dom);
        const name = (f.name || "P").replace(/[<>&]/g, "");
        const desc = (f.properties?.description || `Katman: ${f.layer || "0"}`).replace(/[<>&]/g, "");
        gpx += `  <wpt lat="${lat.toFixed(8)}" lon="${lon.toFixed(8)}">\n`;
        gpx += `    <ele>${(ele || 0).toFixed(3)}</ele>\n`;
        gpx += `    <name>${name}</name>\n`;
        gpx += `    <desc>${desc}</desc>\n`;
        gpx += `  </wpt>\n`;
      }
    }

    // 2. Tracks / Lines & Polygons
    for (let f of this.features) {
      if (f.type === "LineString") {
        const isWgs = f.properties && f.properties.isWgs84;
        const coords = isWgs ? f.coordinates : this._transformCoordsRec(f.coordinates, "TUREF_TM30", "WGS84", dom);
        const name = (f.name || "Track").replace(/[<>&]/g, "");
        gpx += `  <trk>\n    <name>${name}</name>\n    <trkseg>\n`;
        for (let pt of coords) {
          const [lon, lat, ele] = pt;
          gpx += `      <trkpt lat="${lat.toFixed(8)}" lon="${lon.toFixed(8)}">\n        <ele>${(ele || 0).toFixed(3)}</ele>\n      </trkpt>\n`;
        }
        gpx += `    </trkseg>\n  </trk>\n`;
      } else if (f.type === "Polygon") {
        const isWgs = f.properties && f.properties.isWgs84;
        const rings = isWgs ? f.coordinates : this._transformCoordsRec(f.coordinates, "TUREF_TM30", "WGS84", dom);
        const name = (f.name || "Polygon").replace(/[<>&]/g, "");
        if (rings && rings.length > 0) {
          gpx += `  <trk>\n    <name>${name}</name>\n    <trkseg>\n`;
          for (let pt of rings[0]) {
            const [lon, lat, ele] = pt;
            gpx += `      <trkpt lat="${lat.toFixed(8)}" lon="${lon.toFixed(8)}">\n        <ele>${(ele || 0).toFixed(3)}</ele>\n      </trkpt>\n`;
          }
          gpx += `    </trkseg>\n  </trk>\n`;
        }
      }
    }

    gpx += `</gpx>\n`;
    return gpx;
  }

  exportCsv(options = {}) {
    let csv = "Nokta_No_Yazi,Y_Saga_Lon,X_Yukari_Lat,Z_Kot,Katman,Geometri_Tipi\n";
    for (let f of this.features) {
      if (f.type === "Point" || f.type === "Text") {
        const [y, x, z] = f.coordinates;
        const safeName = (f.name || "P").replace(/[",\r\n]/g, " ").trim();
        csv += `"${safeName}",${y.toFixed(4)},${x.toFixed(4)},${(z || 0).toFixed(3)},"${f.layer || "0"}",${f.type}\n`;
      }
    }
    return csv;
  }

  /* =========================================================================
   * 9. YARDIMCI VE İSTATİSTİK FONKSİYONLARI
   * ========================================================================= */
  _registerLayer(layerName, defaultColor = "#06b6d4") {
    if (!this.layers.has(layerName)) {
      this.layers.set(layerName, { color: defaultColor, count: 1, visible: true });
    } else {
      const l = this.layers.get(layerName);
      l.count++;
    }
  }

  _recomputeStats() {
    let pCount = 0, lCount = 0, polyCount = 0, textCount = 0;
    let totalArea = 0, totalPerim = 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const updateBounds = (x, y) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    };

    for (let f of this.features) {
      if (f.type === "Point") {
        pCount++;
        updateBounds(f.coordinates[0], f.coordinates[1]);
      } else if (f.type === "Text") {
        textCount++;
        updateBounds(f.coordinates[0], f.coordinates[1]);
      } else if (f.type === "LineString") {
        lCount++;
        f.coordinates.forEach(c => updateBounds(c[0], c[1]));
        totalPerim += f.properties.lengthM || this._computeLineLength(f.coordinates);
      } else if (f.type === "Polygon") {
        polyCount++;
        const ring = f.coordinates[0];
        ring.forEach(c => updateBounds(c[0], c[1]));
        const area = f.properties.areaM2 || this._computePolygonArea(ring);
        const perim = f.properties.perimeterM || this._computePolygonPerimeter(ring);
        totalArea += area;
        totalPerim += perim;
      }
    }

    this.stats = {
      pointCount: pCount,
      lineCount: lCount,
      polygonCount: polyCount,
      textCount: textCount,
      totalAreaM2: Math.round(totalArea * 100) / 100,
      totalPerimeterM: Math.round(totalPerim * 100) / 100,
      bounds: minX !== Infinity ? { minX, minY, maxX, maxY } : null
    };
  }

  _computePolygonArea(ring) {
    if (!ring || ring.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      area += (ring[i][0] * ring[i + 1][1]) - (ring[i + 1][0] * ring[i][1]);
    }
    return Math.abs(area / 2.0);
  }

  _computePolygonPerimeter(ring) {
    if (!ring || ring.length < 2) return 0;
    let perim = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      perim += this._dist2D(ring[i][0], ring[i][1], ring[i + 1][0], ring[i + 1][1]);
    }
    return perim;
  }

  _computeLineLength(coords) {
    let len = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      len += this._dist3D(coords[i][0], coords[i][1], coords[i][2] || 0, coords[i + 1][0], coords[i + 1][1], coords[i + 1][2] || 0);
    }
    return len;
  }

  _dist2D(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  _dist3D(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
  }

  _getFileExtension(fn) {
    const parts = fn.split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  _dxfColorIndexToHex(idx) {
    const map = {
      1: "#ef4444", 2: "#eab308", 3: "#22c55e", 4: "#06b6d4",
      5: "#3b82f6", 6: "#ec4899", 7: "#ffffff", 8: "#94a3b8", 9: "#cbd5e1"
    };
    return map[idx] || "#06b6d4";
  }

  _hexToDxfColorIndex(hex) {
    if (!hex) return 7;
    const h = hex.toLowerCase();
    if (h.includes("red") || h === "#ef4444") return 1;
    if (h.includes("yellow") || h === "#eab308") return 2;
    if (h.includes("green") || h === "#22c55e") return 3;
    if (h.includes("cyan") || h === "#06b6d4") return 4;
    if (h.includes("blue") || h === "#3b82f6") return 5;
    if (h.includes("magenta") || h === "#ec4899") return 6;
    return 7;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = UniversalFormatConverterEngine;
}
