/**
 * ===================================================================
 *  HARİTA TOOLS - CORE GEOMETRY UTILITIES (GeometryUtils)
 * ===================================================================
 *  Saf matematiksel ve uzamsal hesaplama kütüphanesi (Zero-dependency).
 *  DOM, Leaflet veya arayüz bağımlılığı barındırmaz.
 *  Hem ana iş parçacığında hem de Web Worker ortamlarında çalışabilir.
 * ===================================================================
 */

(function (global) {
  'use strict';

  const GeometryUtils = {
    /**
     * İki 2B doğru parçasının kesişip kesişmediğini kontrol eder (Segment Intersection)
     * @param {{x: number, y: number}} p1 - Doğru 1 Başlangıç
     * @param {{x: number, y: number}} p2 - Doğru 1 Bitiş
     * @param {{x: number, y: number}} p3 - Doğru 2 Başlangıç
     * @param {{x: number, y: number}} p4 - Doğru 2 Bitiş
     * @returns {boolean}
     */
    lineSegmentsIntersect(p1, p2, p3, p4) {
      function ccw(a, b, c) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
      }
      return (
        ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
        ccw(p1, p2, p3) !== ccw(p1, p2, p4)
      );
    },

    /**
     * Noktanın poligon içinde olup olmadığını Ray-Casting algoritmasıyla test eder
     * @param {{lat: number, lon: number}|{x: number, y: number}} point 
     * @param {Array<{lat: number, lon: number}|{x: number, y: number}>} ring 
     * @returns {boolean}
     */
    pointInPolygon(point, ring) {
      if (!ring || ring.length < 3) return false;
      const px = point.lon !== undefined ? point.lon : point.x;
      const py = point.lat !== undefined ? point.lat : point.y;

      let inside = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i].lon !== undefined ? ring[i].lon : ring[i].x;
        const yi = ring[i].lat !== undefined ? ring[i].lat : ring[i].y;
        const xj = ring[j].lon !== undefined ? ring[j].lon : ring[j].x;
        const yj = ring[j].lat !== undefined ? ring[j].lat : ring[j].y;

        const intersect =
          yi > py !== yj > py &&
          px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    },

    /**
     * İki sınır kutusunun (Bounding Box) çakışıp çakışmadığını test eder
     * @param {{minLat: number, maxLat: number, minLon: number, maxLon: number}} b1 
     * @param {{minLat: number, maxLat: number, minLon: number, maxLon: number}} b2 
     * @returns {boolean}
     */
    bboxIntersectsBbox(b1, b2) {
      return !(
        b1.maxLon < b2.minLon ||
        b1.minLon > b2.maxLon ||
        b1.maxLat < b2.minLat ||
        b1.minLat > b2.maxLat
      );
    },

    /**
     * Bounding Box ile Poligon geometrisinin fiziksel olarak kesişip kesişmediğini denetler
     * @param {{minLat: number, maxLat: number, minLon: number, maxLon: number}} bbox 
     * @param {Array<[number, number]>|Array<{lat: number, lon: number}>} ringCoordinates 
     * @returns {boolean}
     */
    bboxIntersectsPolygon(bbox, ringCoordinates) {
      if (!ringCoordinates || ringCoordinates.length < 3) return false;

      // Normalizasyon: Noktaları {x, y} (lon, lat) formatına dönüştür
      const polyPts = ringCoordinates.map(pt => {
        if (Array.isArray(pt)) {
          return { x: pt[0], y: pt[1] }; // GeoJSON: [lon, lat]
        }
        return {
          x: pt.lon !== undefined ? pt.lon : pt.x,
          y: pt.lat !== undefined ? pt.lat : pt.y
        };
      });

      // 1. Kutunun 4 köşesinden herhangi biri poligon içinde mi?
      const bboxCorners = [
        { x: bbox.minLon, y: bbox.minLat },
        { x: bbox.maxLon, y: bbox.minLat },
        { x: bbox.maxLon, y: bbox.maxLat },
        { x: bbox.minLon, y: bbox.maxLat }
      ];

      for (let c of bboxCorners) {
        if (this.pointInPolygon(c, polyPts)) return true;
      }

      // 2. Poligonun herhangi bir köşesi kutunun içinde mi?
      for (let pt of polyPts) {
        if (
          pt.x >= bbox.minLon &&
          pt.x <= bbox.maxLon &&
          pt.y >= bbox.minLat &&
          pt.y <= bbox.maxLat
        ) {
          return true;
        }
      }

      // 3. Kutunun 4 kenarından herhangi biri poligon kenarlarıyla kesişiyor mu?
      const bboxSegments = [
        [bboxCorners[0], bboxCorners[1]],
        [bboxCorners[1], bboxCorners[2]],
        [bboxCorners[2], bboxCorners[3]],
        [bboxCorners[3], bboxCorners[0]]
      ];

      for (let i = 0; i < polyPts.length; i++) {
        const p1 = polyPts[i];
        const p2 = polyPts[(i + 1) % polyPts.length];
        for (let seg of bboxSegments) {
          if (this.lineSegmentsIntersect(p1, p2, seg[0], seg[1])) {
            return true;
          }
        }
      }

      return false;
    },

    /**
     * GeoJSON Geometrisi ile Bounding Box kesişimini kontrol eder
     * MultiPolygon, Polygon veya Feature destekler.
     * @param {{minLat: number, maxLat: number, minLon: number, maxLon: number}} bbox 
     * @param {Object} geojsonGeometry 
     * @returns {boolean}
     */
    bboxIntersectsGeometry(bbox, geojsonGeometry) {
      if (!geojsonGeometry) return false;
      const geom = geojsonGeometry.geometry || geojsonGeometry;
      const type = geom.type;
      const coords = geom.coordinates;

      if (!coords) return false;

      if (type === "Polygon") {
        return this.bboxIntersectsPolygon(bbox, coords[0]);
      } else if (type === "MultiPolygon") {
        for (let poly of coords) {
          if (this.bboxIntersectsPolygon(bbox, poly[0])) return true;
        }
        return false;
      } else if (type === "FeatureCollection" && Array.isArray(geom.features)) {
        for (let feat of geom.features) {
          if (this.bboxIntersectsGeometry(bbox, feat)) return true;
        }
        return false;
      } else if (type === "GeometryCollection" && Array.isArray(geom.geometries)) {
        for (let g of geom.geometries) {
          if (this.bboxIntersectsGeometry(bbox, g)) return true;
        }
        return false;
      }
      return false;
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeometryUtils;
  }
  global.GeometryUtils = GeometryUtils;
})(typeof window !== 'undefined' ? window : global);
