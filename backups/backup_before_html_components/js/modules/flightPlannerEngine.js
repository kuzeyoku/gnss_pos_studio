/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - FOTOGRAMETRİK UÇUŞ PLANLAMA MOTORU (FlightPlannerEngine)
 * =========================================================================================
 *  - KML / KMZ / GeoJSON Poligon Geometri Ayrıştırma, İstatistik & Akıllı Sadeleştirme (Convex Hull)
 *  - OpenStreetMap & KML Yol Ağı Entegrasyonu, Yollara Kenetlenme (Snap-to-Roads)
 *  - Akıllı YKN (Yer Kontrol Noktası & Denetim Noktası) Otomatik Dağıtım Algoritması
 *  - Güneş Açı & Gölge Çarpanı Analizi (Solar Trajectory & Optimal Fotogrametri Zamanı)
 *  - Canlı Meteoroloji & Rüzgara Göre Optimal Rota Yönü Belirleme (Open-Meteo API)
 *  - GSD, Uçuş Yüksekliği, Bindirme Oranları, Çekim Tetikleme & Batarya Hesaplayıcı
 *  - Çoklu Hat Fotogrametri Grid, Koridor & Fotoğraf Pozisyonları Üretici (Long-Axis Heading)
 * =========================================================================================
 */

const _getEarthRadius = () => (typeof HaritaGeodesy !== 'undefined' && HaritaGeodesy.ELLIPSOIDS) ? HaritaGeodesy.ELLIPSOIDS.WGS84.a : 6378137.0;
const _getDeg2Rad = () => (typeof HaritaGeodesy !== 'undefined' && typeof HaritaGeodesy.deg2rad === 'number') ? HaritaGeodesy.deg2rad : (Math.PI / 180.0);
const _getRad2Deg = () => (typeof HaritaGeodesy !== 'undefined' && typeof HaritaGeodesy.rad2deg === 'number') ? HaritaGeodesy.rad2deg : (180.0 / Math.PI);

class FlightPlannerEngine {
  constructor() {
    this.originalPolygon = null;
    this.simplifiedPolygon = null;
    this.originalStats = null;
    this.simplifiedStats = null;
    this.gcpPoints = [];
    this.roadWays = [];
    this.customDrawnRoads = [];
    this.weatherData = null;
    this.solarData = null;
    this.flightParams = null;
    this.isRoadsLoading = false;

    // Dahili Varsayılan Kamera Profilleri
    this.cameraPresets = {
      m3e: {
        name: "DJI Mavic 3 Enterprise (M3E)",
        sensorW: 17.3,
        sensorH: 13.0,
        focalMm: 12.29,
        imageW: 5280,
        imageH: 3956,
        pixelSizeUm: 3.3
      },
      p4rtk: {
        name: "DJI Phantom 4 RTK",
        sensorW: 13.2,
        sensorH: 8.8,
        focalMm: 8.8,
        imageW: 5472,
        imageH: 3648,
        pixelSizeUm: 2.41
      },
      zen_p1_35: {
        name: "DJI Zenmuse P1 (35mm)",
        sensorW: 35.9,
        sensorH: 24.0,
        focalMm: 35.0,
        imageW: 8192,
        imageH: 5460,
        pixelSizeUm: 4.38
      },
      m300_h20t: {
        name: "DJI Matrice 300/350 (H20T Wide)",
        sensorW: 7.68,
        sensorH: 5.76,
        focalMm: 4.5,
        imageW: 4056,
        imageH: 3040,
        pixelSizeUm: 1.89
      },
      custom: {
        name: "Özel Kamera / Sensör",
        sensorW: 17.3,
        sensorH: 13.0,
        focalMm: 12.0,
        imageW: 5000,
        imageH: 4000,
        pixelSizeUm: 3.4
      }
    };
  }

  /**
   * KML, KMZ veya GeoJSON Dosyasından Poligon Geometrisini Ayrıştırır
   */
  async parsePolygonFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    let textContent = "";

    if (ext === "kmz") {
      if (typeof JSZip === "undefined") {
        throw new Error("KMZ dosyasını açmak için JSZip kütüphanesi gereklidir.");
      }
      const zip = await JSZip.loadAsync(file);
      const kmlFile = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith(".kml"));
      if (!kmlFile) {
        throw new Error("KMZ arşivi içinde geçerli bir doc.kml dosyası bulunamadı.");
      }
      textContent = await kmlFile.async("text");
    } else {
      textContent = await file.text();
    }

    let coordinates = [];
    if (ext === "geojson" || ext === "json") {
      coordinates = this._parseGeoJson(textContent);
    } else {
      coordinates = this._parseKml(textContent);
    }

    if (!coordinates || coordinates.length < 3) {
      throw new Error("Geçerli bir kapalı alan / saha geometrisi bulunamadı (En az 3 köşe noktası gereklidir).");
    }

    // Poligonun kapalı olduğundan emin ol (ilk nokta = son nokta)
    const firstPt = coordinates[0];
    const lastPt = coordinates[coordinates.length - 1];
    if (Math.abs(firstPt.lat - lastPt.lat) > 1e-7 || Math.abs(firstPt.lon - lastPt.lon) > 1e-7) {
      coordinates.push({
        lat: firstPt.lat,
        lon: firstPt.lon,
        alt: firstPt.alt || 0
      });
    }

    this.originalPolygon = coordinates;
    this.originalStats = this.computePolygonStats(coordinates);
    this.simplify(0.5);

    return {
      originalCoords: this.originalPolygon,
      simplifiedCoords: this.simplifiedPolygon,
      originalStats: this.originalStats,
      simplifiedStats: this.simplifiedStats
    };
  }

  _parseKml(kmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlString, "text/xml");
    const coordNodes = xmlDoc.querySelectorAll("Polygon coordinates, LinearRing coordinates, coordinates");
    let longestCoordText = "";

    for (let i = 0; i < coordNodes.length; i++) {
      const text = coordNodes[i].textContent.trim();
      if (text.includes(",") && text.length > longestCoordText.length) {
        longestCoordText = text;
      }
    }

    if (!longestCoordText) {
      throw new Error("KML dosyasında <coordinates> alan koordinatları bulunamadı.");
    }

    const coords = [];
    const tokens = longestCoordText.split(/\s+/);
    for (const token of tokens) {
      const parts = token.split(",");
      if (parts.length >= 2) {
        const lon = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        const alt = parts.length >= 3 ? parseFloat(parts[2]) : 0;
        if (!isNaN(lat) && !isNaN(lon)) {
          coords.push({ lat: lat, lon: lon, alt: alt });
        }
      }
    }
    return coords;
  }

  _parseGeoJson(geoJsonString) {
    const parsed = JSON.parse(geoJsonString);
    let polyCoords = null;

    if (parsed.type === "FeatureCollection" && parsed.features && parsed.features.length > 0) {
      for (const feat of parsed.features) {
        if (feat.geometry && (feat.geometry.type === "Polygon" || feat.geometry.type === "MultiPolygon")) {
          polyCoords = feat.geometry.type === "Polygon" ? feat.geometry.coordinates[0] : feat.geometry.coordinates[0][0];
          break;
        }
      }
    } else if (parsed.type === "Feature" && parsed.geometry) {
      polyCoords = parsed.geometry.type === "Polygon" ? parsed.geometry.coordinates[0] : parsed.geometry.coordinates[0][0];
    } else if (parsed.type === "Polygon") {
      polyCoords = parsed.coordinates[0];
    }

    if (!polyCoords) {
      throw new Error("GeoJSON içeriğinde Polygon geometrisi bulunamadı.");
    }

    return polyCoords.map(p => ({
      lon: p[0],
      lat: p[1],
      alt: p[2] || 0
    }));
  }

  /**
   * Poligonun Alanı, Çevresi, Ağırlık Merkezi ve Sınır Kutusunu (BBOX) Hesaplar
   */
  computePolygonStats(coords) {
    if (!coords || coords.length < 3) return null;

    let sumLat = 0;
    let sumLon = 0;
    let minLat = 90.0;
    let maxLat = -90.0;
    let minLon = 180.0;
    let maxLon = -180.0;

    const uniqueCount = coords.length - 1;
    for (let i = 0; i < uniqueCount; i++) {
      const pt = coords[i];
      sumLat += pt.lat;
      sumLon += pt.lon;

      if (pt.lat < minLat) minLat = pt.lat;
      if (pt.lat > maxLat) maxLat = pt.lat;
      if (pt.lon < minLon) minLon = pt.lon;
      if (pt.lon > maxLon) maxLon = pt.lon;
    }

    const centroid = {
      lat: sumLat / uniqueCount,
      lon: sumLon / uniqueCount
    };

    const deg2rad = Math.PI / 180.0;
    const earthRadius = _getEarthRadius();
    const cosCentroidLat = Math.cos(centroid.lat * deg2rad);

    let areaAccum = 0;
    let perimeterM = 0;

    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i + 1];

      const x1 = (p1.lon - centroid.lon) * deg2rad * earthRadius * cosCentroidLat;
      const y1 = (p1.lat - centroid.lat) * deg2rad * earthRadius;
      const x2 = (p2.lon - centroid.lon) * deg2rad * earthRadius * cosCentroidLat;
      const y2 = (p2.lat - centroid.lat) * deg2rad * earthRadius;

      areaAccum += (x1 * y2 - x2 * y1);
      perimeterM += Math.hypot(x2 - x1, y2 - y1);
    }

    const areaM2 = Math.abs(areaAccum) / 2.0;

    return {
      vertexCount: coords.length,
      uniqueVertexCount: uniqueCount,
      areaM2: areaM2,
      areaHa: areaM2 / 10000.0,
      areaKm2: areaM2 / 1000000.0,
      perimeterM: perimeterM,
      centroid: centroid,
      bbox: {
        minLat: minLat,
        maxLat: maxLat,
        minLon: minLon,
        maxLon: maxLon
      }
    };
  }

  /**
   * Poligonu Belirli Bir Agresiflik Derecesinde Sadeleştirir (Convex Hull & Concave Collapse)
   */
  simplify(aggressionFactor = 0.5) {
    if (!this.originalPolygon || this.originalPolygon.length < 4) {
      return this.originalPolygon;
    }

    if (!this.originalStats) {
      this.originalStats = this.computePolygonStats(this.originalPolygon);
    }

    const isClosed = this.originalPolygon[0].lat === this.originalPolygon[this.originalPolygon.length - 1].lat &&
                     this.originalPolygon[0].lon === this.originalPolygon[this.originalPolygon.length - 1].lon;
    const ring = isClosed ? this.originalPolygon.slice(0, -1) : this.originalPolygon;

    if (ring.length <= 4) {
      this.simplifiedPolygon = [...this.originalPolygon];
      this.simplifiedStats = this.originalStats;
      return this.simplifiedPolygon;
    }

    if (aggressionFactor !== null && aggressionFactor !== undefined) {
      this.currentAggressionFactor = aggressionFactor;
    }
    const factor = this.currentAggressionFactor !== undefined ? this.currentAggressionFactor : 0.5;

    const centroid = this.originalStats?.centroid || this.computePolygonStats(this.originalPolygon).centroid;
    const deg2rad = Math.PI / 180.0;
    const cosLat = Math.cos(centroid.lat * deg2rad);
    const radius = _getEarthRadius();

    const localPts = ring.map((pt, idx) => ({
      id: idx,
      lat: pt.lat,
      lon: pt.lon,
      alt: pt.alt || 0,
      x: (pt.lon - centroid.lon) * deg2rad * radius * cosLat,
      y: (pt.lat - centroid.lat) * deg2rad * radius
    }));

    if (factor <= 0.01) {
      const cleanPts = this._removeCollinearPoints(localPts);
      const simplified = cleanPts.map(p => ({
        lat: centroid.lat + (p.y / radius / deg2rad),
        lon: centroid.lon + (p.x / (radius * cosLat) / deg2rad),
        alt: p.alt || 0
      }));
      simplified.push({ ...simplified[0] });
      this.simplifiedPolygon = simplified;
      this.simplifiedStats = this.computePolygonStats(simplified) || this.originalStats;
      this.simplifiedStats.areaDiffPct = 0;
      return this.simplifiedPolygon;
    }

    const convexHullPts = this._calculateConvexHull(localPts);
    if (factor >= 0.9) {
      const simplified = convexHullPts.map(p => ({
        lat: centroid.lat + (p.y / radius / deg2rad),
        lon: centroid.lon + (p.x / (radius * cosLat) / deg2rad),
        alt: p.alt || 0
      }));
      simplified.push({ ...simplified[0] });
      this.simplifiedPolygon = simplified;
      this.simplifiedStats = this.computePolygonStats(simplified) || this.originalStats;
      const areaDiff = Math.max(0, this.simplifiedStats.areaM2 - this.originalStats.areaM2);
      this.simplifiedStats.areaDiffPct = (areaDiff / this.originalStats.areaM2) * 100.0;
      return this.simplifiedPolygon;
    }

    // Saat yönünde düzenle
    let signedArea = 0;
    for (let i = 0; i < localPts.length; i++) {
      const j = (i + 1) % localPts.length;
      signedArea += (localPts[i].x * localPts[j].y - localPts[j].x * localPts[i].y);
    }
    let currentPoly = signedArea < 0 ? [...localPts].reverse() : [...localPts];

    let totalPerimeter = 0;
    for (let i = 0; i < currentPoly.length; i++) {
      const j = (i + 1) % currentPoly.length;
      totalPerimeter += Math.hypot(currentPoly[j].x - currentPoly[i].x, currentPoly[j].y - currentPoly[i].y);
    }

    const avgEdgeLen = totalPerimeter / currentPoly.length;
    const maxCollapseDist = avgEdgeLen * (1.0 + factor * 12.0);

    let changed = true;
    let iterCount = 0;
    const maxIters = Math.floor(2 + factor * 6.0);

    while (changed && currentPoly.length > 4 && iterCount < maxIters) {
      changed = false;
      iterCount++;
      const nextPoly = [];
      let i = 0;

      while (i < currentPoly.length) {
        const n = currentPoly.length;
        const prev = currentPoly[(i - 1 + n) % n];
        const cur = currentPoly[i];
        const next = currentPoly[(i + 1) % n];

        const v1x = cur.x - prev.x;
        const v1y = cur.y - prev.y;
        const v2x = next.x - cur.x;
        const v2y = next.y - cur.y;

        const crossProduct = v1x * v2y - v1y * v2x;
        const distToSpan = Math.hypot(next.x - prev.x, next.y - prev.y);

        if (crossProduct <= 0 && distToSpan <= maxCollapseDist * (iterCount * 0.8)) {
          changed = true;
          i++;
        } else {
          nextPoly.push(cur);
          i++;
        }
      }

      if (nextPoly.length >= 4) {
        currentPoly = nextPoly;
      } else {
        break;
      }
    }

    const simplified = currentPoly.map(p => ({
      lat: centroid.lat + (p.y / radius / deg2rad),
      lon: centroid.lon + (p.x / (radius * cosLat) / deg2rad),
      alt: p.alt || 0
    }));
    simplified.push({ ...simplified[0] });

    this.simplifiedPolygon = simplified;
    this.simplifiedStats = this.computePolygonStats(simplified) || this.originalStats;
    const areaDiff = Math.max(0, this.simplifiedStats.areaM2 - this.originalStats.areaM2);
    this.simplifiedStats.areaDiffPct = (areaDiff / this.originalStats.areaM2) * 100.0;

    return this.simplifiedPolygon;
  }

  _calculateConvexHull(pts) {
    if (pts.length <= 3) return pts;

    const sorted = pts.map(p => ({ x: p.x, y: p.y, lat: p.lat, lon: p.lon, alt: p.alt || 0 }));
    sorted.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

    const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    const lower = [];
    for (let p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }

    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  _removeCollinearPoints(pts, tolerance = 0.0001) {
    if (pts.length <= 3) return pts;
    const clean = [];
    for (let i = 0; i < pts.length; i++) {
      const prev = pts[(i - 1 + pts.length) % pts.length];
      const cur = pts[i];
      const next = pts[(i + 1) % pts.length];

      const cross = (cur.x - prev.x) * (next.y - cur.y) - (cur.y - prev.y) * (next.x - cur.x);
      if (Math.abs(cross) > tolerance) {
        clean.push(cur);
      }
    }
    return clean.length >= 3 ? clean : pts;
  }

  /**
   * OpenStreetMap API / Overpass Üzerinden Saha Etrafındaki Yol Ağını İndirir
   */
  async fetchRoadNetwork(customBbox = null) {
    const stats = this.simplifiedStats || this.originalStats;
    if (!stats && !customBbox) return this.roadWays;

    const bbox = customBbox || stats.bbox;
    const bufferDeg = 0.007; // ~700m tampon
    const minLatStr = (bbox.minLat - bufferDeg).toFixed(5);
    const minLonStr = (bbox.minLon - bufferDeg).toFixed(5);
    const maxLatStr = (bbox.maxLat + bufferDeg).toFixed(5);
    const maxLonStr = (bbox.maxLon + bufferDeg).toFixed(5);

    this.isRoadsLoading = true;
    let fetchedRoads = [];

    // 1. Resmi OpenStreetMap 0.6 API Denemesi
    try {
      const osmUrl = `https://api.openstreetmap.org/api/0.6/map?bbox=${minLonStr},${minLatStr},${maxLonStr},${maxLatStr}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(osmUrl, {
        signal: controller.signal,
        headers: { Accept: "application/xml, text/xml" }
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const xmlText = await resp.text();
        fetchedRoads = this._parseOsmXmlRoads(xmlText);
      }
    } catch (err) {
      console.warn("Official OSM API yanıt vermedi, Overpass ayna sunucularına geçiliyor:", err.message);
    }

    // 2. Overpass API Ayna Sunucuları Denemesi
    if (fetchedRoads.length === 0) {
      const query = `[out:json][timeout:12];(
        way["highway"](${minLatStr},${minLonStr},${maxLatStr},${maxLonStr});
        way["tracktype"](${minLatStr},${minLonStr},${maxLatStr},${maxLonStr});
      );out geom;`;

      const mirrorServers = [
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter",
        "https://overpass.nchc.org.tw/api/interpreter"
      ];

      for (const serverUrl of mirrorServers) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);

          const resp = await fetch(serverUrl, {
            method: "POST",
            body: `data=${encodeURIComponent(query)}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (resp.ok) {
            const data = await resp.json();
            if (data.elements && data.elements.length > 0) {
              for (const elem of data.elements) {
                if (elem.geometry && elem.geometry.length >= 2) {
                  const roadType = elem.tags?.highway || (elem.tags?.tracktype ? "track" : "road");
                  fetchedRoads.push({
                    id: elem.id,
                    type: roadType,
                    name: elem.tags?.name || "",
                    surface: elem.tags?.surface || "",
                    tracktype: elem.tags?.tracktype || "",
                    geometry: elem.geometry.map(g => ({ lat: g.lat, lon: g.lon })),
                    isCustom: false
                  });
                }
              }
              if (fetchedRoads.length > 0) break;
            }
          }
        } catch (e) {}
      }
    }

    const customRoads = this.roadWays.filter(r => r.isCustom);
    this.roadWays = [...fetchedRoads, ...customRoads];
    this.isRoadsLoading = false;
    return this.roadWays;
  }

  _parseOsmXmlRoads(xmlString) {
    const nodeRegex = /<node id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"/g;
    const nodeMap = new Map();
    let match;

    while ((match = nodeRegex.exec(xmlString)) !== null) {
      nodeMap.set(match[1], {
        lat: parseFloat(match[2]),
        lon: parseFloat(match[3])
      });
    }

    const wayRegex = /<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g;
    const roads = [];

    while ((match = wayRegex.exec(xmlString)) !== null) {
      const wayBody = match[2];
      const hwMatch = wayBody.match(/<tag k="highway" v="([^"]+)"/);
      const ttMatch = wayBody.match(/<tag k="tracktype" v="([^"]+)"/);

      if (!hwMatch && !ttMatch) continue;

      const roadType = hwMatch ? hwMatch[1] : "track";
      if (["steps", "pedestrian", "corridor", "proposed", "construction", "elevator"].includes(roadType)) {
        continue;
      }

      const nameMatch = wayBody.match(/<tag k="name" v="([^"]+)"/);
      const surfMatch = wayBody.match(/<tag k="surface" v="([^"]+)"/);
      const trackMatch = wayBody.match(/<tag k="tracktype" v="([^"]+)"/);

      const ndRegex = /<nd ref="(\d+)"/g;
      let ndMatch;
      const roadCoords = [];

      while ((ndMatch = ndRegex.exec(wayBody)) !== null) {
        const pt = nodeMap.get(ndMatch[1]);
        if (pt) roadCoords.push({ lat: pt.lat, lon: pt.lon });
      }

      if (roadCoords.length >= 2) {
        roads.push({
          id: match[1],
          type: roadType,
          name: nameMatch ? nameMatch[1] : "",
          surface: surfMatch ? surfMatch[1] : "",
          tracktype: trackMatch ? trackMatch[1] : "",
          geometry: roadCoords,
          isCustom: false
        });
      }
    }

    return roads;
  }

  addCustomRoad(coords, name = "Tarla İçi Toprak Yol (Manuel)", roadType = "track") {
    if (!coords || coords.length < 2) return null;

    const roadObj = {
      id: `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name || "Tarla / Arazi Yolu",
      type: roadType || "track",
      surface: "unpaved",
      geometry: coords.map(c => ({ lat: c.lat, lon: c.lon })),
      isCustom: true,
      isManuallyDrawn: true
    };

    this.roadWays.push(roadObj);
    this.customDrawnRoads.push(roadObj);
    return roadObj;
  }

  removeCustomRoad(roadId) {
    this.roadWays = this.roadWays.filter(r => r.id !== roadId);
    this.customDrawnRoads = this.customDrawnRoads.filter(r => r.id !== roadId);
    return this.roadWays;
  }

  /**
   * KML veya GeoJSON Formatındaki Kadastro / İthal Yol Dosyasını Ayrıştırır
   */
  async parseRoadFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    let textContent = "";

    if (ext === "kmz") {
      const zip = await JSZip.loadAsync(file);
      const kmlFile = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith(".kml"));
      if (!kmlFile) throw new Error("KMZ dosyasında geçerli doc.kml bulunamadı.");
      textContent = await kmlFile.async("text");
    } else {
      textContent = await file.text();
    }

    const importedRoads = [];

    if (ext === "geojson" || ext === "json") {
      const json = JSON.parse(textContent);
      const features = json.type === "FeatureCollection" ? json.features : [json];

      features.forEach((feat, idx) => {
        if (feat.geometry && (feat.geometry.type === "LineString" || feat.geometry.type === "MultiLineString")) {
          const lines = feat.geometry.type === "LineString" ? [feat.geometry.coordinates] : feat.geometry.coordinates;
          lines.forEach((lineCoords, lIdx) => {
            importedRoads.push({
              id: `imported_${Date.now()}_${idx}_${lIdx}`,
              name: feat.properties?.name || feat.properties?.YOL_ADI || `İthal Yol #${idx + 1}`,
              type: "track",
              geometry: lineCoords.map(p => ({ lat: p[1], lon: p[0] })),
              isCustom: true
            });
          });
        }
      });
    } else {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(textContent, "text/xml");
      const placemarks = xmlDoc.querySelectorAll("Placemark");

      placemarks.forEach((pm, idx) => {
        const nameNode = pm.querySelector("name");
        const roadName = nameNode ? nameNode.textContent.trim() : `Kadastro/İthal Yol #${idx + 1}`;
        const coordNodes = pm.querySelectorAll("LineString coordinates, coordinates");

        coordNodes.forEach((cn, cIdx) => {
          const rawText = cn.textContent.trim();
          const tokens = rawText.split(/\s+/);
          const pts = [];

          for (const tok of tokens) {
            const p = tok.split(",");
            if (p.length >= 2) {
              const lon = parseFloat(p[0]);
              const lat = parseFloat(p[1]);
              if (!isNaN(lat) && !isNaN(lon)) {
                pts.push({ lat: lat, lon: lon });
              }
            }
          }

          if (pts.length >= 2) {
            importedRoads.push({
              id: `kml_road_${Date.now()}_${idx}_${cIdx}`,
              name: roadName,
              type: "track",
              geometry: pts,
              isCustom: true
            });
          }
        });
      });
    }

    if (importedRoads.length === 0) {
      throw new Error("Dosyada çizgi / yol (LineString) geometrisi bulunamadı.");
    }

    this.roadWays.push(...importedRoads);
    return importedRoads;
  }

  /**
   * BÖHHBÜY Standartlarında Akıllı YKN (Yer Kontrol Noktaları) ve Denetim Noktaları Üretir
   */
  async generateSmartGCPs({
    maxDistanceMeters = 1000,
    inwardOffsetMeters = 100,
    yknRatio = 0.75,
    snapToRoads = true,
    snapMaxRadiusM = 500,
    geodesyEngine = null
  }) {
    const polygon = this.simplifiedPolygon || this.originalPolygon;
    if (!polygon || polygon.length < 4) {
      throw new Error("YKN üretmek için önce bir uçuş sahası / çalışma sınırı yükleyiniz.");
    }

    const ring = polygon.slice(0, -1);
    const stats = this.simplifiedStats || this.originalStats;
    const centroid = stats.centroid;
    const deg2rad = Math.PI / 180.0;
    const radius = _getEarthRadius();
    const cosLat = Math.cos(centroid.lat * deg2rad);

    const localPoly = ring.map((pt, idx) => ({
      id: idx,
      lat: pt.lat,
      lon: pt.lon,
      x: (pt.lon - centroid.lon) * deg2rad * radius * cosLat,
      y: (pt.lat - centroid.lat) * deg2rad * radius
    }));

    if (snapToRoads && (!this.roadWays || this.roadWays.length === 0)) {
      await this.fetchRoadNetwork(stats.bbox);
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    localPoly.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const spanDiag = Math.hypot(spanX, spanY);
    const effMaxDist = Math.min(maxDistanceMeters, Math.max(250, spanDiag / 2.2));

    const cornerCandidates = [];
    const n = localPoly.length;

    for (let i = 0; i < n; i++) {
      const prev = localPoly[(i - 1 + n) % n];
      const cur = localPoly[i];
      const next = localPoly[(i + 1) % n];

      const v1x = prev.x - cur.x;
      const v1y = prev.y - cur.y;
      const v2x = next.x - cur.x;
      const v2y = next.y - cur.y;

      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);

      if (len1 === 0 || len2 === 0) continue;

      let bisectorX = (v1x / len1) + (v2x / len2);
      let bisectorY = (v1y / len1) + (v2y / len2);
      let bisectorLen = Math.hypot(bisectorX, bisectorY);

      if (bisectorLen < 0.0001) {
        bisectorX = -v2y / len2;
        bisectorY = v2x / len2;
        bisectorLen = 1.0;
      }

      bisectorX /= bisectorLen;
      bisectorY /= bisectorLen;

      const offsetDist = Math.min(inwardOffsetMeters, Math.min(len1, len2) * 0.35);
      let candidate = {
        x: cur.x + bisectorX * offsetDist,
        y: cur.y + bisectorY * offsetDist,
        isCorner: true,
        cornerIdx: i
      };

      if (!this._isPointInPolygonLocal(candidate, localPoly)) {
        candidate = {
          x: cur.x * 0.94,
          y: cur.y * 0.94,
          isCorner: true,
          cornerIdx: i
        };
      }

      cornerCandidates.push(candidate);
    }

    const filteredCorners = [];
    for (const c of cornerCandidates) {
      const isTooClose = filteredCorners.some(fc => Math.hypot(fc.x - c.x, fc.y - c.y) < effMaxDist * 0.35);
      if (!isTooClose) filteredCorners.push(c);
    }

    // Kenar (Flank) Noktaları
    const perimeterGCPs = [];
    for (let i = 0; i < filteredCorners.length; i++) {
      const c1 = filteredCorners[i];
      const c2 = filteredCorners[(i + 1) % filteredCorners.length];
      perimeterGCPs.push(c1);

      const edgeDist = Math.hypot(c2.x - c1.x, c2.y - c1.y);
      if (edgeDist > effMaxDist * 1.15) {
        const segments = Math.ceil(edgeDist / effMaxDist);
        for (let s = 1; s < segments; s++) {
          const ratio = s / segments;
          const midPt = {
            x: c1.x + ratio * (c2.x - c1.x),
            y: c1.y + ratio * (c2.y - c1.y),
            isFlank: true
          };
          if (this._isPointInPolygonLocal(midPt, localPoly)) {
            perimeterGCPs.push(midPt);
          }
        }
      }
    }

    // İç Alan (Interior) Grid Noktaları
    const interiorStep = Math.min(effMaxDist * 0.85, Math.max(300, Math.min(spanX, spanY) / 2.5));
    const hexRowStep = interiorStep * (Math.sqrt(3) / 2.0);
    const interiorGCPs = [];

    const centerCandidate = { x: (minX + maxX) / 2.0, y: (minY + maxY) / 2.0, isInterior: true };
    if (this._isPointInPolygonLocal(centerCandidate, localPoly) && this._distToPolyBoundaryLocal(centerCandidate, localPoly) >= inwardOffsetMeters * 1.1) {
      const minDist = Math.min(...perimeterGCPs.map(p => Math.hypot(p.x - centerCandidate.x, p.y - centerCandidate.y)));
      if (minDist >= interiorStep * 0.48) {
        interiorGCPs.push(centerCandidate);
      }
    }

    let rowCount = 0;
    for (let curY = minY + inwardOffsetMeters * 1.3; curY <= maxY - inwardOffsetMeters * 1.3; curY += hexRowStep) {
      rowCount++;
      const xOffset = (rowCount % 2 === 1) ? interiorStep * 0.5 : 0;
      for (let curX = minX + inwardOffsetMeters * 1.3 + xOffset; curX <= maxX - inwardOffsetMeters * 1.3; curX += interiorStep) {
        const pt = { x: curX, y: curY, isInterior: true };
        if (this._isPointInPolygonLocal(pt, localPoly) && this._distToPolyBoundaryLocal(pt, localPoly) >= inwardOffsetMeters * 1.1) {
          const dPerim = Math.min(...perimeterGCPs.map(p => Math.hypot(p.x - pt.x, p.y - pt.y)));
          const dInter = interiorGCPs.length > 0 ? Math.min(...interiorGCPs.map(p => Math.hypot(p.x - pt.x, p.y - pt.y))) : Infinity;

          if (dPerim >= interiorStep * 0.58 && dInter >= interiorStep * 0.58) {
            interiorGCPs.push(pt);
          }
        }
      }
    }

    const allGcpCoords = [...perimeterGCPs, ...interiorGCPs];
    const resolvedPoints = [];

    for (let i = 0; i < allGcpCoords.length; i++) {
      const g = allGcpCoords[i];
      const lat = centroid.lat + (g.y / radius / deg2rad);
      const lon = centroid.lon + (g.x / (radius * cosLat) / deg2rad);

      let nearestRoad = null;
      let roadDistM = null;

      if (this.roadWays && this.roadWays.length > 0) {
        const roadPt = this._findNearestRoadPoint(lat, lon, this.roadWays, snapMaxRadiusM);
        if (roadPt && roadPt.distanceM <= snapMaxRadiusM) {
          nearestRoad = roadPt;
          roadDistM = Math.round(roadPt.distanceM);
        }
      }

      resolvedPoints.push({
        lat: lat,
        lon: lon,
        isCorner: g.isCorner || false,
        isFlank: g.isFlank || false,
        isInterior: g.isInterior || false,
        nearestRoad: nearestRoad,
        roadDistM: roadDistM
      });
    }

    const finalPoints = [];
    let yknCounter = 1;
    let dnCounter = 1;

    resolvedPoints.forEach((pt, idx) => {
      const isCheckPoint = (idx % Math.max(2, Math.round(1 / (1 - yknRatio))) === 0 && idx > 0);
      const typeLabel = isCheckPoint ? "DN" : "YKN";
      const name = isCheckPoint ? `DN-${dnCounter++}` : `YKN-${yknCounter++}`;

      let itrfY = 0;
      let itrfX = 0;
      let dom = 30;

      if (geodesyEngine && typeof geodesyEngine.wgs84ToTurefTM === "function") {
        dom = Math.round(pt.lon / 3.0) * 3;
        if (dom < 27) dom = 27;
        if (dom > 45) dom = 45;
        const tm = geodesyEngine.wgs84ToTurefTM(pt.lat, pt.lon, dom);
        itrfY = tm.Y;
        itrfX = tm.X;
      } else {
        dom = Math.round(pt.lon / 3.0) * 3;
        itrfY = 500000.0 + (pt.lon - dom) * deg2rad * radius * cosLat;
        itrfX = pt.lat * deg2rad * radius;
      }

      let statusDesc = "";
      if (pt.roadDistM !== null) {
        const roadName = pt.nearestRoad?.roadInfo?.name ? ` "${pt.nearestRoad.roadInfo.name}"` : "";
        const roadType = pt.nearestRoad?.roadInfo?.type ? ` (${this._formatRoadType(pt.nearestRoad.roadInfo.type)})` : "";
        if (pt.roadDistM <= 15) {
          statusDesc = `Yol Kenarında (~${pt.roadDistM}m)${roadName}${roadType}`;
        } else {
          statusDesc = `En Yakın Yola ${pt.roadDistM}m${roadName}${roadType}`;
        }
      } else {
        statusDesc = pt.isInterior ? "İç Blok (Açık Arazi)" : "Saha Sınırı (Açık Arazi)";
      }

      finalPoints.push({
        id: idx + 1,
        name: name,
        type: typeLabel,
        isCheckPoint: isCheckPoint,
        lat: pt.lat,
        lon: pt.lon,
        itrfY: Math.round(itrfY * 1000) / 1000,
        itrfX: Math.round(itrfX * 1000) / 1000,
        dom: dom,
        nearestRoad: pt.nearestRoad,
        roadDistM: pt.roadDistM,
        isInterior: pt.isInterior,
        status: statusDesc
      });
    });

    this.gcpPoints = finalPoints;
    return this.gcpPoints;
  }

  _isPointInPolygonLocal(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  _distToPolyBoundaryLocal(pt, poly) {
    let minDist = Infinity;
    for (let i = 0; i < poly.length - 1; i++) {
      const p1 = poly[i];
      const p2 = poly[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lenSq = dx * dx + dy * dy;

      let u = lenSq > 0 ? ((pt.x - p1.x) * dx + (pt.y - p1.y) * dy) / lenSq : 0;
      u = Math.max(0, Math.min(1, u));

      const projX = p1.x + u * dx;
      const projY = p1.y + u * dy;
      const dist = Math.hypot(pt.x - projX, pt.y - projY);
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  }

  recalculatePointRoadDistance(point, snapMaxRadiusM = 500) {
    if (!point) return;
    if (this.roadWays && this.roadWays.length > 0) {
      const nearest = this._findNearestRoadPoint(point.lat, point.lon, this.roadWays, snapMaxRadiusM);
      if (nearest && nearest.distanceM <= snapMaxRadiusM) {
        point.nearestRoad = nearest;
        point.roadDistM = Math.round(nearest.distanceM);
        const name = nearest.roadInfo?.name ? ` "${nearest.roadInfo.name}"` : "";
        const type = nearest.roadInfo?.type ? ` (${this._formatRoadType(nearest.roadInfo.type)})` : "";

        if (point.roadDistM <= 15) {
          point.status = `Yol Kenarında (~${point.roadDistM}m)${name}${type}`;
        } else {
          point.status = `En Yakın Yola ${point.roadDistM}m${name}${type}`;
        }
      } else {
        point.nearestRoad = null;
        point.roadDistM = null;
        point.status = "Açık Arazi (>500m)";
      }
    }
  }

  _formatRoadType(type) {
    const types = {
      motorway: "Otoyol",
      trunk: "Dubleyol / Ana Arter",
      primary: "Ana Yol (Asfalt)",
      secondary: "Tali Yol",
      tertiary: "Köy / Bağlantı Yolu",
      residential: "Mahalle Yolu",
      service: "Servis Yolu",
      track: "Tarla / Traktör Yolu (Toprak)",
      path: "Patika / Arazi İzi",
      unclassified: "Yerel Yol",
      custom_track: "Özel Arazi Yolu"
    };
    return types[type] || type;
  }

  _findNearestRoadPoint(lat, lon, roads, maxRadius) {
    let bestDist = Infinity;
    let bestPt = null;

    for (const road of roads) {
      const geom = road.geometry || road;
      for (let i = 0; i < geom.length - 1; i++) {
        const p1 = geom[i];
        const p2 = geom[i + 1];
        const proj = this._projectPointOnSegment(lat, lon, p1.lat, p1.lon, p2.lat, p2.lon);
        const dist = this._geodesicDist(lat, lon, proj.lat, proj.lon);

        if (dist < bestDist) {
          bestDist = dist;
          bestPt = {
            lat: proj.lat,
            lon: proj.lon,
            distanceM: dist,
            roadInfo: {
              id: road.id,
              type: road.type,
              name: road.name,
              isCustom: road.isCustom
            }
          };
        }
      }
    }
    return bestPt;
  }

  _projectPointOnSegment(lat, lon, lat1, lon1, lat2, lon2) {
    const deg2rad = Math.PI / 180.0;
    const radius = _getEarthRadius();
    const cosLat = Math.cos(lat * deg2rad);

    const px = lon * deg2rad * radius * cosLat;
    const py = lat * deg2rad * radius;
    const p1x = lon1 * deg2rad * radius * cosLat;
    const p1y = lat1 * deg2rad * radius;
    const p2x = lon2 * deg2rad * radius * cosLat;
    const p2y = lat2 * deg2rad * radius;

    const dx = p2x - p1x;
    const dy = p2y - p1y;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return { lat: lat1, lon: lon1 };

    let u = ((px - p1x) * dx + (py - p1y) * dy) / lenSq;
    u = Math.max(0, Math.min(1, u));

    const projX = p1x + u * dx;
    const projY = p1y + u * dy;

    return {
      lat: projY / radius / deg2rad,
      lon: projX / (radius * cosLat) / deg2rad
    };
  }

  _haversineDistance(lat1, lon1, lat2, lon2) {
    return this._geodesicDist(lat1, lon1, lat2, lon2);
  }

  _geodesicDist(lat1, lon1, lat2, lon2) {
    const deg2rad = Math.PI / 180.0;
    const radius = _getEarthRadius();
    const dLat = (lat2 - lat1) * deg2rad;
    const dLon = (lon2 - lon1) * deg2rad;

    const a = Math.sin(dLat / 2.0) ** 2 + Math.cos(lat1 * deg2rad) * Math.cos(lat2 * deg2rad) * Math.sin(dLon / 2.0) ** 2;
    return radius * 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  }

  /**
   * Güneş Yörüngesi, Yükselim Açısı ve Gölge Çarpanı Hesabı
   */
  calculateSolarTrajectory(lat, lon, dateObj = new Date()) {
    const date = typeof dateObj === "string" ? new Date(dateObj) : dateObj;
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / 86400000) + 1;

    const b = (360.0 / 365.0) * (dayOfYear - 81) * (Math.PI / 180.0);
    const declinationRad = Math.sin(b) * 23.45 * (Math.PI / 180.0);
    const equationOfTimeMin = Math.sin(b * 2.0) * 9.87 - Math.cos(b) * 7.53 - Math.sin(b) * 1.5;

    const localMeridian = 45.0; // Türkiye UTC+3
    const deg2rad = Math.PI / 180.0;
    const latRad = lat * deg2rad;

    const hourlySeries = [];
    let maxElevationDeg = -90;
    let optimalStart = null;
    let optimalEnd = null;

    for (let minuteOfDay = 360; minuteOfDay <= 1140; minuteOfDay += 15) {
      const hourDecimal = minuteOfDay / 60.0;
      const hh = Math.floor(hourDecimal);
      const mm = minuteOfDay % 60;
      const timeStr = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

      const timeOffsetMin = equationOfTimeMin + (lon - localMeridian) * 4.0;
      const trueSolarTimeMin = minuteOfDay + timeOffsetMin;
      const hourAngleRad = ((trueSolarTimeMin - 720.0) / 4.0) * deg2rad;

      const sinElevation = Math.sin(latRad) * Math.sin(declinationRad) + Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad);
      const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinElevation)));
      const elevationDeg = elevationRad / deg2rad;

      const cosAzimuth = (Math.sin(declinationRad) - Math.sin(latRad) * sinElevation) / (Math.cos(latRad) * Math.cos(elevationRad));
      let azimuthDeg = Math.acos(Math.max(-1, Math.min(1, cosAzimuth))) / deg2rad;
      if (hourAngleRad > 0) azimuthDeg = 360.0 - azimuthDeg;

      let shadowMultiplier = null;
      let shadowStatus = "Gece / Ufuk Altı";

      if (elevationDeg > 0) {
        shadowMultiplier = 1.0 / Math.tan(elevationRad);
        if (elevationDeg >= 45.0) shadowStatus = "Mükemmel (Gölge < 1.0x)";
        else if (elevationDeg >= 35.0) shadowStatus = "Çok İyi (Gölge 1.0 - 1.4x)";
        else if (elevationDeg >= 25.0) shadowStatus = "Orta (Gölge 1.4 - 2.1x)";
        else shadowStatus = "Uzun Gölge (Riskli)";
      }

      if (elevationDeg > maxElevationDeg) maxElevationDeg = elevationDeg;

      const isOptimal = elevationDeg >= 35.0;
      if (isOptimal) {
        if (!optimalStart) optimalStart = timeStr;
        optimalEnd = timeStr;
      }

      hourlySeries.push({
        timeStr: timeStr,
        hourDecimal: hourDecimal,
        elevationDeg: Math.round(elevationDeg * 10) / 10,
        azimuthDeg: Math.round(azimuthDeg * 10) / 10,
        shadowMultiplier: shadowMultiplier ? Math.round(shadowMultiplier * 100) / 100 : null,
        shadowStatus: shadowStatus,
        isOptimal: isOptimal
      });
    }

    const minShadowMultiplier = maxElevationDeg > 0 ? (1.0 / Math.tan(maxElevationDeg * deg2rad)).toFixed(2) : "--";

    this.solarData = {
      dateStr: date.toISOString().split("T")[0],
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000,
      maxElevationDeg: Math.round(maxElevationDeg * 10) / 10,
      minShadowMultiplier: minShadowMultiplier,
      optimalWindow: optimalStart && optimalEnd ? `${optimalStart} - ${optimalEnd}` : "Yetersiz Güneş Açısı (<35°)",
      hasSufficientSun: maxElevationDeg >= 35.0,
      hourlySeries: hourlySeries
    };

    return this.solarData;
  }

  /**
   * Open-Meteo API Üzerinden Gerçek Zamanlı Saatlik Hava Durumu ve Rüzgar Tahmini Çeker
   */
  async fetchLiveWeather(lat, lon, targetDate = null) {
    const todayStr = new Date().toISOString().split("T")[0];
    const dateStr = targetDate || todayStr;
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,weather_code&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;

    try {
      let resp = await fetch(url);
      if (!resp.ok) {
        url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,weather_code&timezone=auto`;
        resp = await fetch(url);
      }
      if (!resp.ok) throw new Error(`Meteoroloji sunucu yanıtı: ${resp.status}`);

      const data = await resp.json();
      if (!data.hourly || !data.hourly.time) throw new Error("Hava durumu saatlik verisi boş döndü.");

      const hourly = data.hourly;
      const hoursList = [];
      let maxWindMs = 0;
      let maxGustMs = 0;
      let totalPrecipMm = 0;
      let maxPrecipProb = 0;
      let sumCloud = 0;
      let sumWindDir = 0;
      let count = 0;

      for (let i = 0; i < hourly.time.length; i++) {
        const timePart = hourly.time[i].split("T")[1].substring(0, 5);
        const hourNum = parseInt(timePart.split(":")[0], 10);

        const tempC = hourly.temperature_2m[i] !== undefined ? hourly.temperature_2m[i] : 20;
        const windKmh = hourly.wind_speed_10m[i] !== undefined ? hourly.wind_speed_10m[i] : 10;
        const windMs = windKmh / 3.6;
        const gustKmh = hourly.wind_gusts_10m[i] !== undefined ? hourly.wind_gusts_10m[i] : windKmh * 1.3;
        const gustMs = gustKmh / 3.6;
        const windDir = hourly.wind_direction_10m[i] !== undefined ? hourly.wind_direction_10m[i] : 45;
        const precipProb = hourly.precipitation_probability[i] !== undefined ? hourly.precipitation_probability[i] : 0;
        const precipMm = hourly.precipitation[i] !== undefined ? hourly.precipitation[i] : 0;
        const cloudPct = hourly.cloud_cover[i] !== undefined ? hourly.cloud_cover[i] : 10;

        if (hourNum >= 6 && hourNum <= 20) {
          if (windMs > maxWindMs) maxWindMs = windMs;
          if (gustMs > maxGustMs) maxGustMs = gustMs;
          if (precipProb > maxPrecipProb) maxPrecipProb = precipProb;
          totalPrecipMm += precipMm;
          sumCloud += cloudPct;
          sumWindDir += windDir;
          count++;
        }

        let safety = "safe";
        let safetyLabel = "Uçuşa Uygun";

        if (windMs > 11.0 || gustMs > 14.0 || precipMm > 0.5) {
          safety = "danger";
          safetyLabel = "Riskli (Yüksek Rüzgar/Yağış)";
        } else if (windMs > 7.0 || gustMs > 10.0 || precipProb > 40) {
          safety = "warning";
          safetyLabel = "Dikkat (Orta Rüzgar)";
        }

        hoursList.push({
          time: timePart,
          hour: hourNum,
          temp: Math.round(tempC * 10) / 10,
          windSpeedMs: Math.round(windMs * 10) / 10,
          windSpeedKmh: Math.round(windKmh * 10) / 10,
          gustMs: Math.round(gustMs * 10) / 10,
          windDir: Math.round(windDir),
          precipProb: Math.round(precipProb),
          precipMm: Math.round(precipMm * 10) / 10,
          cloud: Math.round(cloudPct),
          safety: safety,
          safetyLabel: safetyLabel
        });
      }

      const avgWindDir = count > 0 ? Math.round(sumWindDir / count) : 0;
      const avgCloud = count > 0 ? Math.round(sumCloud / count) : 0;

      let overallSafety = "safe";
      let overallText = "✅ Uçuş İçin Mükemmel Hava Koşulları";
      let overallBadge = "GÜVENLİ";

      if (maxWindMs > 11.0 || maxGustMs > 14.0 || totalPrecipMm > 1.0) {
        overallSafety = "danger";
        overallText = "⛔ Uçuş Tavsiye Edilmez (Kuvvetli Rüzgar / Yağış Riski)";
        overallBadge = "RİSKLİ";
      } else if (maxWindMs > 7.0 || maxGustMs > 10.0 || maxPrecipProb > 45) {
        overallSafety = "warning";
        overallText = "⚠️ Dikkatli Uçuş Gerekli (Orta Rüzgar ve Hamleler)";
        overallBadge = "DİKKATLİ UÇUŞ";
      }

      const optimalHeading1 = (avgWindDir + 90) % 360;
      const optimalHeading2 = (avgWindDir + 270) % 360;

      this.weatherData = {
        date: dateStr,
        lat: lat,
        lon: lon,
        dataSource: "Open-Meteo (DWD ICON / ECMWF Küresel Modeli)",
        isLive: true,
        maxWindMs: Math.round(maxWindMs * 10) / 10,
        maxWindKmh: Math.round(maxWindMs * 3.6 * 10) / 10,
        maxGustMs: Math.round(maxGustMs * 10) / 10,
        totalPrecipMm: Math.round(totalPrecipMm * 10) / 10,
        maxPrecipProb: maxPrecipProb,
        avgCloudPct: avgCloud,
        avgWindDir: avgWindDir,
        optimalFlightHeading: `${optimalHeading1}° / ${optimalHeading2}° (Rüzgara Dik Hatlar)`,
        overallSafety: overallSafety,
        overallText: overallText,
        overallBadge: overallBadge,
        hours: hoursList
      };

      return this.weatherData;
    } catch (err) {
      console.warn("Meteoroloji API uyarısı, dahili model devreye girdi:", err);
      const fallbackHours = [];
      for (let h = 0; h <= 23; h++) {
        const timePart = String(h).padStart(2, "0") + ":00";
        const temp = Math.round((16 + 10 * Math.sin((h - 8) / 12 * Math.PI)) * 10) / 10;
        
        // Realistic diurnal wind speed curve (light morning, gusty afternoon, calm night)
        let windKmh = 6;
        let windDir = 160;
        if (h >= 6 && h <= 10) {
          windKmh = 5 + (h - 6) * 1.8;
          windDir = 180 + (h - 6) * 15;
        } else if (h > 10 && h <= 16) {
          windKmh = 12 + (h - 10) * 1.5;
          windDir = 240 + (h - 10) * 12;
        } else if (h > 16 && h <= 20) {
          windKmh = 21 - (h - 16) * 3.0;
          windDir = 310 + (h - 16) * 10;
        } else {
          windKmh = 5.0;
          windDir = 60;
        }
        windKmh = Math.round(windKmh * 10) / 10;
        const windMs = Math.round((windKmh / 3.6) * 10) / 10;
        const gustMs = Math.round((windMs * 1.35) * 10) / 10;
        windDir = Math.round(windDir % 360);

        let safety = "safe";
        let safetyLabel = "Uçuşa Uygun";
        if (windMs > 11.0) {
          safety = "danger";
          safetyLabel = "Riskli";
        } else if (windMs > 7.0) {
          safety = "warning";
          safetyLabel = "Orta Rüzgar";
        }

        fallbackHours.push({
          time: timePart,
          hour: h,
          temp: temp,
          windSpeedMs: windMs,
          windSpeedKmh: windKmh,
          gustMs: gustMs,
          windDir: windDir,
          precipProb: 0,
          precipMm: 0,
          cloud: 15,
          safety: safety,
          safetyLabel: safetyLabel
        });
      }
      this.weatherData = {
        date: dateStr,
        lat: lat,
        lon: lon,
        dataSource: "Dahili Meteorolojik Simülasyon",
        isLive: false,
        maxWindMs: 5.8,
        maxWindKmh: 21.0,
        maxGustMs: 7.8,
        totalPrecipMm: 0,
        maxPrecipProb: 0,
        avgCloudPct: 15,
        avgWindDir: 285,
        optimalFlightHeading: "15° / 195° (Rüzgara Dik)",
        overallSafety: "safe",
        overallText: "🟢 Uçuş İçin İdeal Meteorolojik Koşullar",
        overallBadge: "GÜVENLİ",
        hours: fallbackHours
      };
      return this.weatherData;
    }
  }

  /**
   * Fotogrametrik Uçuş Parametrelerini (GSD, İrtifa, Hat Sayısı, Fotoğraf Sayısı, Batarya) Hesaplar
   */
  calculateFlightParameters({
    droneKey = "dji_m3e",
    cameraKey = "m3e_built_in",
    customCam = null,
    targetGsdCm = null,
    flightAltitudeM = null,
    forwardOverlapPct = 80,
    sideOverlapPct = 70,
    flightSpeedMs = 12,
    batteryDurationMin = 32,
    polygonAreaM2 = null
  }) {
    let droneDb = null;
    if (typeof window !== "undefined" && window.DroneDatabase) droneDb = window.DroneDatabase;
    else if (typeof global !== "undefined" && global.DroneDatabase) droneDb = global.DroneDatabase;

    let camera = customCam;
    if (!camera && droneDb) camera = droneDb.getCamera(cameraKey);
    if (!camera) {
      camera = {
        id: "m3e_built_in",
        name: "DJI Mavic 3 Enterprise Dahili (4/3 20MP)",
        sensorW: 17.3,
        sensorH: 13.0,
        focalMm: 12.29,
        imageW: 5280,
        imageH: 3956,
        megapixels: 20,
        pixelSizeUm: 3.28,
        shutterType: "Mekanik (1/2000s)",
        minTriggerIntervalS: 0.7
      };
    }

    let drone = null;
    if (droneDb) drone = droneDb.getDrone(droneKey);
    if (!drone) {
      drone = {
        id: "dji_m3e",
        model: "DJI Mavic 3 Enterprise",
        safeFlightTimeMin: 32,
        defaultSpeedMs: 12,
        maxSpeedMs: 21
      };
    }

    const areaM2 = polygonAreaM2 || (this.simplifiedStats ? this.simplifiedStats.areaM2 : (this.originalStats ? this.originalStats.areaM2 : 100000));
    const sensorW = camera.sensorW || camera.sensorWidthMm || 17.3;
    const sensorH = camera.sensorH || camera.sensorHeightMm || 13.0;
    const focalMm = camera.focalMm || camera.focalLengthMm || 12.3;
    const imageW = camera.imageW || camera.imageWidthPx || 5280;
    const imageH = camera.imageH || camera.imageHeightPx || 3956;
    const pixelSizeUm = camera.pixelSizeUm || (sensorW / imageW * 1000.0) || 3.3;
    const pixelSizeMm = pixelSizeUm / 1000.0;
    const minTriggerIntervalS = camera.minTriggerIntervalS || camera.minTriggerIntervalSec || 0.7;

    let altitudeM;
    let gsdCm;

    if (flightAltitudeM !== null && flightAltitudeM !== undefined && !isNaN(parseFloat(flightAltitudeM))) {
      altitudeM = Math.max(10, Math.min(2500, Math.round(parseFloat(flightAltitudeM) * 10) / 10));
      gsdCm = Math.max(0.2, Math.round((altitudeM * pixelSizeMm / focalMm) * 100.0 * 100.0) / 100.0);
    } else {
      const targetGsd = targetGsdCm !== null && targetGsdCm !== undefined && !isNaN(parseFloat(targetGsdCm)) ? parseFloat(targetGsdCm) : 2.5;
      gsdCm = Math.max(0.2, Math.min(100.0, targetGsd));
      const gsdM = gsdCm / 100.0;
      altitudeM = Math.max(10, Math.min(2500, Math.round((gsdM * focalMm / pixelSizeMm) * 10) / 10));
    }

    const forwardOverlap = Math.min(95, Math.max(20, parseFloat(forwardOverlapPct) || 80));
    const sideOverlap = Math.min(90, Math.max(20, parseFloat(sideOverlapPct) || 70));

    const groundWidthM = Math.max(2, Math.round((sensorW * altitudeM / focalMm) * 10) / 10);
    const groundHeightM = Math.max(2, Math.round((sensorH * altitudeM / focalMm) * 10) / 10);

    const lineSpacingSideM = Math.max(2, Math.round(groundWidthM * (1.0 - sideOverlap / 100.0) * 10) / 10);
    const photoDistanceForwardM = Math.max(1.5, Math.round(groundHeightM * (1.0 - forwardOverlap / 100.0) * 10) / 10);

    const sideDimension = Math.sqrt(Math.max(100, areaM2));
    const numberOfLines = Math.min(1500, Math.max(2, Math.ceil(sideDimension / lineSpacingSideM)));
    const totalFlightM = numberOfLines * sideDimension + (numberOfLines - 1) * lineSpacingSideM;
    const totalFlightKm = totalFlightM / 1000.0;

    const photosPerLine = Math.min(250, Math.ceil(sideDimension / photoDistanceForwardM));
    const totalPhotoCount = Math.max(10, numberOfLines * photosPerLine);

    const speedMs = Math.max(1, parseFloat(flightSpeedMs) || 12);
    const triggerIntervalS = Math.round((photoDistanceForwardM / speedMs) * 100) / 100;
    const isTriggerSpeedSafe = triggerIntervalS >= minTriggerIntervalS;

    const totalSeconds = totalFlightM / speedMs + numberOfLines * 6.0; // 6sn dönüş payı
    const flightDurationMin = Math.ceil(totalSeconds / 60.0);

    const effectiveBatteryMin = Math.max(10, batteryDurationMin || drone.safeFlightTimeMin || 30);
    const batteryPacks = Math.max(1, Math.ceil(flightDurationMin / effectiveBatteryMin));
    const batteryUsagePct = Math.min(100, Math.round((flightDurationMin / effectiveBatteryMin) * 100));

    const result = {
      flightAltitudeM: altitudeM,
      flightAltitudeFt: Math.round(altitudeM * 3.28084),
      targetGsdCm: gsdCm,
      groundWidthM: groundWidthM,
      groundHeightM: groundHeightM,
      groundFootprint: `${Math.round(groundWidthM)}m × ${Math.round(groundHeightM)}m`,
      lineSpacingSideM: lineSpacingSideM,
      photoDistanceForwardM: photoDistanceForwardM,
      numberOfLines: numberOfLines,
      totalFlightLengthKm: Math.round(totalFlightKm * 100) / 100,
      totalPhotoCount: totalPhotoCount,
      triggerIntervalS: triggerIntervalS,
      isTriggerSpeedSafe: isTriggerSpeedSafe,
      flightDurationMin: flightDurationMin,
      batteryPacks: batteryPacks,
      batteryUsagePct: batteryUsagePct,
      effectiveBatteryMin: effectiveBatteryMin,
      camera: camera,
      drone: drone
    };

    this.flightParams = result;
    return result;
  }

  /**
   * En Az Hat ve En Verimli Uçuş İçin Uzun Eksen Açısını (Heading) Otomatik Bulur
   */
  findOptimalLongAxisHeading(polygonCoords = null, sideSpacingM = null) {
    const poly = polygonCoords || this.simplifiedPolygon || this.originalPolygon;
    if (!poly || poly.length < 3) return 0;

    let sumLat = 0;
    let sumLon = 0;
    const count = (poly[0].lat === poly[poly.length - 1].lat && poly[0].lon === poly[poly.length - 1].lon) ? poly.length - 1 : poly.length;

    for (let i = 0; i < count; i++) {
      sumLat += poly[i].lat;
      sumLon += poly[i].lon;
    }

    const cLat = sumLat / Math.max(1, count);
    const cLon = sumLon / Math.max(1, count);
    const radius = _getEarthRadius();
    const deg2rad = Math.PI / 180.0;
    const cosLat = Math.cos(cLat * deg2rad);

    const localPts = poly.map(p => ({
      x: (p.lon - cLon) * deg2rad * radius * cosLat,
      y: (p.lat - cLat) * deg2rad * radius
    }));

    const spacing = sideSpacingM || this.flightParams?.lineSpacingSideM || 40.0;
    let bestHeading = 0;
    let minLineCount = Infinity;
    let minSpan = Infinity;

    for (let deg = 0; deg < 180; deg += 5) {
      const rad = deg * deg2rad;
      const cosA = Math.cos(-rad);
      const sinA = Math.sin(-rad);

      let minProj = Infinity;
      let maxProj = -Infinity;

      for (let p of localPts) {
        const proj = p.x * cosA - p.y * sinA;
        if (proj < minProj) minProj = proj;
        if (proj > maxProj) maxProj = proj;
      }

      const span = Math.max(1, maxProj - minProj);
      const lines = Math.max(1, Math.ceil(span / spacing));

      if (lines < minLineCount || (lines === minLineCount && span < minSpan)) {
        minLineCount = lines;
        minSpan = span;
        bestHeading = deg;
      }
    }

    return Math.round(bestHeading);
  }

  /**
   * Poligon İçinde Tam Fotogrametri Hatlarını, Fotoğraf Pozisyonlarını ve Koridorları Üretir
   */
  generatePhotogrammetryGrid({
    polygon = null,
    headingDeg = 0,
    droneKey = "dji_m3e",
    cameraKey = "m3e_built_in",
    targetGsdCm = null,
    flightAltitudeM = null,
    forwardOverlapPct = 80,
    sideOverlapPct = 70,
    flightSpeedMs = 12,
    batteryDurationMin = 32,
    overshootM = 12
  }) {
    const rawPoly = polygon || this.simplifiedPolygon || this.originalPolygon;
    if (!rawPoly || rawPoly.length < 3) return null;

    const polyRing = [...rawPoly];
    const p1 = polyRing[0];
    const p2 = polyRing[polyRing.length - 1];
    if (Math.abs(p1.lat - p2.lat) > 1e-7 || Math.abs(p1.lon - p2.lon) > 1e-7) {
      polyRing.push({ lat: p1.lat, lon: p1.lon });
    }

    const flightParams = this.calculateFlightParameters({
      droneKey: droneKey,
      cameraKey: cameraKey,
      targetGsdCm: targetGsdCm,
      flightAltitudeM: flightAltitudeM,
      forwardOverlapPct: forwardOverlapPct,
      sideOverlapPct: sideOverlapPct,
      flightSpeedMs: flightSpeedMs,
      batteryDurationMin: batteryDurationMin,
      polygonAreaM2: this.simplifiedStats ? this.simplifiedStats.areaM2 : null
    });

    const camera = flightParams.camera;
    const drone = flightParams.drone;
    const lineSpacingM = Math.max(2.5, flightParams.lineSpacingSideM || 10);
    const triggerDistM = Math.max(1.5, flightParams.photoDistanceForwardM || 10);
    const groundWidthM = flightParams.groundWidthM;
    const flightAltitude = flightParams.flightAltitudeM;

    let sumLat = 0, sumLon = 0;
    const ringLen = polyRing.length - 1;
    for (let i = 0; i < ringLen; i++) {
      sumLat += polyRing[i].lat;
      sumLon += polyRing[i].lon;
    }
    const centroidLat = sumLat / Math.max(1, ringLen);
    const centroidLon = sumLon / Math.max(1, ringLen);

    const radius = _getEarthRadius();
    const deg2rad = Math.PI / 180.0;
    const cosLat = Math.cos(centroidLat * deg2rad);

    const localPoly = polyRing.map(p => ({
      x: (p.lon - centroidLon) * deg2rad * radius * cosLat,
      y: (p.lat - centroidLat) * deg2rad * radius
    }));

    const cleanHeading = ((headingDeg % 360) + 360) % 360;
    const headingRad = cleanHeading * deg2rad;
    const cosH = Math.cos(headingRad);
    const sinH = Math.sin(headingRad);
    const cosNegH = Math.cos(-headingRad);
    const sinNegH = Math.sin(-headingRad);

    const rotatedPoly = localPoly.map(p => ({
      x: p.x * cosNegH - p.y * sinNegH,
      y: p.x * sinNegH + p.y * cosNegH
    }));

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rotatedPoly.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const totalWidth = Math.max(1, maxX - minX);
    const lineCount = Math.min(1500, Math.max(1, Math.ceil(totalWidth / lineSpacingM)));
    const startX = lineCount === 1 ? (minX + maxX) / 2.0 : minX + (totalWidth - (lineCount - 1) * lineSpacingM) / 2.0;

    const toGeoCoords = (rotX, rotY) => {
      const lx = rotX * cosH - rotY * sinH;
      const ly = rotX * sinH + rotY * cosH;
      const lat = centroidLat + (ly / radius) * (180.0 / Math.PI);
      const lon = centroidLon + (lx / (radius * cosLat)) * (180.0 / Math.PI);
      return { lat: lat, lon: lon, lng: lon };
    };

    const flightLines = [];
    const corridors = [];
    const waypoints = [];
    const turnArcs = [];

    let photoIndex = 1;
    let totalFlightDistM = 0;
    const maxPhotosCap = 100000;

    for (let lineIdx = 0; lineIdx < lineCount; lineIdx++) {
      const curX = lineCount === 1 ? (minX + maxX) / 2.0 : startX + lineIdx * lineSpacingM;
      const intersections = [];

      for (let i = 0; i < rotatedPoly.length - 1; i++) {
        const pA = rotatedPoly[i];
        const pB = rotatedPoly[i + 1];
        const dx = pB.x - pA.x;

        if (Math.abs(dx) > 1e-7) {
          if ((pA.x <= curX && curX <= pB.x) || (pB.x <= curX && curX <= pA.x)) {
            const ratio = (curX - pA.x) / dx;
            if (ratio >= -1e-7 && ratio <= 1.0000001) {
              const yVal = pA.y + ratio * (pB.y - pA.y);
              if (!isNaN(yVal)) intersections.push(yVal);
            }
          }
        }
      }

      intersections.sort((a, b) => a - b);
      const cleanIntersections = [];
      for (let k = 0; k < intersections.length; k++) {
        if (k === 0 || Math.abs(intersections[k] - cleanIntersections[cleanIntersections.length - 1]) > 0.1) {
          cleanIntersections.push(intersections[k]);
        }
      }

      if (cleanIntersections.length < 2) continue;

      for (let k = 0; k < cleanIntersections.length; k += 2) {
        if (k + 1 >= cleanIntersections.length) break;

        const yStart = cleanIntersections[k];
        const yEnd = cleanIntersections[k + 1];
        if (yEnd - yStart < 2.0) continue;

        const isReverse = (lineIdx % 2 === 1);
        const yP1 = isReverse ? yEnd + overshootM : yStart - overshootM;
        const yP2 = isReverse ? yStart - overshootM : yEnd + overshootM;

        const ptStart = toGeoCoords(curX, yP1);
        const ptEnd = toGeoCoords(curX, yP2);
        const segLen = Math.abs(yP2 - yP1);
        totalFlightDistM += segLen;

        const lineObj = {
          lineIndex: lineIdx,
          segIndex: k / 2,
          start: ptStart,
          end: ptEnd,
          isReverse: isReverse,
          lengthM: Math.round(segLen * 10) / 10
        };
        flightLines.push(lineObj);

        // Koridor Poligonu
        const halfWidth = groundWidthM / 2.0;
        const leftX = curX - halfWidth;
        const rightX = curX + halfWidth;

        corridors.push({
          lineIndex: lineIdx,
          polygon: [
            toGeoCoords(leftX, yStart),
            toGeoCoords(rightX, yStart),
            toGeoCoords(rightX, yEnd),
            toGeoCoords(leftX, yEnd)
          ],
          widthM: Math.round(groundWidthM)
        });

        // Fotoğraf Pozisyonları
        const spanY = yEnd - yStart;
        const countPhotos = Math.min(1000, Math.max(1, Math.floor(spanY / triggerDistM)));
        const stepY = spanY / countPhotos;

        if (waypoints.length < maxPhotosCap) {
          for (let pIdx = 0; pIdx <= countPhotos; pIdx++) {
            if (waypoints.length >= maxPhotosCap) break;
            const curY = isReverse ? yEnd - pIdx * stepY : yStart + pIdx * stepY;
            const geoPt = toGeoCoords(curX, curY);

            waypoints.push({
              photoIndex: photoIndex++,
              lineIndex: lineIdx,
              lat: geoPt.lat,
              lon: geoPt.lon,
              alt: flightAltitude,
              altM: flightAltitude
            });
          }
        }
      }
    }

    // Dönüş Hatları (Turn Arcs)
    for (let i = 0; i < flightLines.length - 1; i++) {
      turnArcs.push({
        fromLine: flightLines[i].lineIndex,
        toLine: flightLines[i + 1].lineIndex,
        points: [flightLines[i].end, flightLines[i + 1].start]
      });
    }

    // Kalkış / Ev (Home) Noktası
    let homePoint = null;
    if (flightLines.length > 0) {
      const firstLineStart = flightLines[0].start;
      homePoint = {
        lat: firstLineStart.lat,
        lon: firstLineStart.lon,
        lng: firstLineStart.lon,
        isRoadSnapped: false
      };

      if (this.roadWays && this.roadWays.length > 0) {
        let bestDist = Infinity;
        let bestRoadPt = null;

        for (let road of this.roadWays) {
          for (let pt of road.geometry) {
            const dist = this._geodesicDist(firstLineStart.lat, firstLineStart.lon, pt.lat, pt.lon);
            if (dist < bestDist && dist <= 300.0) {
              bestDist = dist;
              bestRoadPt = pt;
            }
          }
        }

        if (bestRoadPt) {
          homePoint = {
            lat: bestRoadPt.lat,
            lon: bestRoadPt.lon,
            lng: bestRoadPt.lon,
            isRoadSnapped: true,
            distanceM: Math.round(bestDist)
          };
        }
      }
    }

    const turnsDistM = (flightLines.length - 1) * lineSpacingM;
    const totalDistM = totalFlightDistM + turnsDistM;
    const totalDistKm = Math.round((totalDistM / 1000.0) * 100) / 100;
    const speedMs = Math.max(1, parseFloat(flightSpeedMs) || 12);
    const flightTimeSec = totalDistM / speedMs + flightLines.length * 6.0;
    const durationMin = Math.ceil(flightTimeSec / 60.0);
    const batteryPacks = Math.max(1, Math.ceil(durationMin / (flightParams.effectiveBatteryMin || 30)));

    const result = {
      lines: flightLines,
      corridors: corridors,
      waypoints: waypoints,
      turnArcs: turnArcs,
      homePoint: homePoint,
      headingDeg: cleanHeading,
      lineSpacingM: Math.round(lineSpacingM * 10) / 10,
      triggerDistM: Math.round(triggerDistM * 10) / 10,
      groundWidthM: Math.round(groundWidthM * 10) / 10,
      flightAltitudeM: flightAltitude,
      totalLinesCount: flightLines.length,
      totalPhotosCount: waypoints.length,
      totalDistanceKm: totalDistKm,
      flightDurationMin: durationMin,
      batteryPacks: batteryPacks,
      camera: camera,
      drone: drone
    };

    this.flightGrid = result;
    return result;
  }

  /**
   * Fotogrametrik Uçuş Planını KML / DJI Pilot 2 Uyumlu KML Olarak Dışa Aktarır
   */
  exportFlightKml(isDjiPilot2 = true) {
    if (!this.flightGrid || !this.flightGrid.lines || this.flightGrid.lines.length === 0) {
      return null;
    }

    const grid = this.flightGrid;
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
<Document>
  <name>Fotogrametrik Uçuş Planı - ${grid.drone?.model || "İHA"}</name>
  <description>Uçuş İrtifası: ${grid.flightAltitudeM}m, Hat Sayısı: ${grid.totalLinesCount}, Fotoğraf Sayısı: ${grid.totalPhotosCount}, Toplam Mesafe: ${grid.totalDistanceKm}km</description>
  
  <Style id="flightLineStyle">
    <LineStyle>
      <color>ff00ffff</color>
      <width>3</width>
    </LineStyle>
  </Style>
  
  <Style id="corridorStyle">
    <LineStyle>
      <color>8000ff00</color>
      <width>1</width>
    </LineStyle>
    <PolyStyle>
      <color>3300ff00</color>
    </PolyStyle>
  </Style>

  <Folder>
    <name>Uçuş Hatları (Survey Flight Lines)</name>
`;

    grid.lines.forEach((line, idx) => {
      kml += `
    <Placemark>
      <name>Hat #${idx + 1} (${line.lengthM}m)</name>
      <styleUrl>#flightLineStyle</styleUrl>
      <LineString>
        <altitudeMode>relativeToGround</altitudeMode>
        <coordinates>
          ${line.start.lon},${line.start.lat},${grid.flightAltitudeM}
          ${line.end.lon},${line.end.lat},${grid.flightAltitudeM}
        </coordinates>
      </LineString>
    </Placemark>`;
    });

    kml += `
  </Folder>

  <Folder>
    <name>Fotoğraf Çekim Pozisyonları (Photo Waypoints)</name>
`;

    grid.waypoints.forEach((wp) => {
      kml += `
    <Placemark>
      <name>Foto #${wp.photoIndex}</name>
      <Point>
        <altitudeMode>relativeToGround</altitudeMode>
        <coordinates>${wp.lon},${wp.lat},${wp.altM}</coordinates>
      </Point>
    </Placemark>`;
    });

    kml += `
  </Folder>
</Document>
</kml>`;

    return kml;
  }

  /**
   * Yer Kontrol Noktalarını (YKN / DN) Netcad .NCN Formatında Dışa Aktarır
   */
  exportGcpNcn() {
    if (!this.gcpPoints || this.gcpPoints.length === 0) return "";
    let ncn = "";
    for (let pt of this.gcpPoints) {
      const pName = pt.name.padEnd(14, " ");
      const yStr = (pt.itrfY || 0).toFixed(3).padStart(12, " ");
      const xStr = (pt.itrfX || 0).toFixed(3).padStart(12, " ");
      const zStr = (pt.alt || 1000.0).toFixed(3).padStart(10, " ");
      ncn += `${pName} ${yStr} ${xStr} ${zStr}\n`;
    }
    return ncn;
  }

  /**
   * Yer Kontrol Noktalarını (YKN / DN) AutoCAD .DXF Formatında Dışa Aktarır
   */
  exportGcpDxf() {
    if (!this.gcpPoints || this.gcpPoints.length === 0) return "";

    let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n4\n";
    dxf += "0\nLAYER\n2\nYKN_NOKTALARI\n70\n0\n62\n1\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nYKN_ADLARI\n70\n0\n62\n3\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nYKN_KOTLARI\n70\n0\n62\n4\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nNIRENGI_AGI\n70\n0\n62\n5\n6\nCONTINUOUS\n0\n";
    dxf += "ENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";

    for (let pt of this.gcpPoints) {
      const yVal = pt.itrfY || 0;
      const xVal = pt.itrfX || 0;
      const zVal = pt.alt || 1000.0;

      dxf += `0\nPOINT\n8\nYKN_NOKTALARI\n10\n${yVal}\n20\n${xVal}\n30\n${zVal}\n`;
      dxf += `0\nTEXT\n8\nYKN_ADLARI\n10\n${yVal + 1.0}\n20\n${xVal + 1.0}\n30\n${zVal}\n40\n2.0\n1\n${pt.name} (${pt.type})\n`;
      dxf += `0\nTEXT\n8\nYKN_KOTLARI\n10\n${yVal + 1.0}\n20\n${xVal - 2.5}\n30\n${zVal}\n40\n1.5\n1\n${zVal.toFixed(2)}\n`;
    }

    // Nirengi / Bağlantı Ağı Çizgileri
    for (let i = 0; i < this.gcpPoints.length - 1; i++) {
      const p1 = this.gcpPoints[i];
      const p2 = this.gcpPoints[i + 1];
      dxf += `0\nLINE\n8\nNIRENGI_AGI\n10\n${p1.itrfY || 0}\n20\n${p1.itrfX || 0}\n30\n${p1.alt || 0}\n11\n${p2.itrfY || 0}\n21\n${p2.itrfX || 0}\n31\n${p2.alt || 0}\n`;
    }

    dxf += "0\nENDSEC\n0\nEOF\n";
    return dxf;
  }

  /**
   * Yer Kontrol Noktalarını (YKN / DN) CSV Formatında Dışa Aktarır
   */
  exportGcpCsv() {
    if (!this.gcpPoints || this.gcpPoints.length === 0) return "";
    let csv = "Nokta_No,Nokta_Tipi,WGS84_Enlem,WGS84_Boylam,ITRF96_Y_Saga,ITRF96_X_Yukari,DOM_Dilim,En_Yakin_Yol_Mesafe_m,Arazi_Durumu\n";
    for (let pt of this.gcpPoints) {
      const distStr = pt.roadDistM !== null ? pt.roadDistM : "Acik_Arazi";
      const statusStr = (pt.status || "").replace(/,/g, ";");
      csv += `${pt.name},${pt.type},${pt.lat.toFixed(7)},${pt.lon.toFixed(7)},${(pt.itrfY || 0).toFixed(3)},${(pt.itrfX || 0).toFixed(3)},${pt.dom || 30},${distStr},${statusStr}\n`;
    }
    return csv;
  }

  /**
   * Yer Kontrol Noktalarını (YKN / DN) Google Earth KML Formatında Dışa Aktarır
   */
  exportGcpKml() {
    if (!this.gcpPoints || this.gcpPoints.length === 0) return "";
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Yer Kontrol ve Denetim Noktaları (GCP / YKN)</name>
`;

    for (let pt of this.gcpPoints) {
      kml += `
  <Placemark>
    <name>${pt.name} (${pt.type})</name>
    <description><![CDATA[
      <b>Nokta No:</b> ${pt.name}<br>
      <b>Nokta Tipi:</b> ${pt.type === "DN" ? "Denetim Noktası" : "Yer Kontrol Noktası (YKN)"}<br>
      <b>ITRF-96 Y:</b> ${(pt.itrfY || 0).toFixed(3)} m (Dilim ${pt.dom}°)<br>
      <b>ITRF-96 X:</b> ${(pt.itrfX || 0).toFixed(3)} m<br>
      <b>Yol Durumu:</b> ${pt.status || "Açık Arazi"}<br>
      <b>WGS-84:</b> ${pt.lat.toFixed(7)}°, ${pt.lon.toFixed(7)}°
    ]]></description>
    <Point>
      <coordinates>${pt.lon},${pt.lat},${pt.alt || 0}</coordinates>
    </Point>
  </Placemark>`;
    }

    kml += "\n</Document>\n</kml>";
    return kml;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = FlightPlannerEngine;
}