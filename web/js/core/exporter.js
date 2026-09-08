/**
 * Harita Tools - Universal Geomatics Exporter Engine
 * Centralized export manager for:
 * - Netcad Point File (.NCN)
 * - Microsoft Excel / Universal CSV (.CSV with UTF-8 BOM)
 * - Google Earth KML (.KML)
 * - AutoCAD / Netcad DXF (.DXF)
 * - GIS GeoJSON (.GEOJSON)
 */

(function () {
  'use strict';

  /**
   * Normalizes point object properties into standard geodetic fields
   * @param {Object} pt 
   * @returns {Object} { name, y, x, z, lat, lon }
   */
  function normalizePoint(pt) {
    const name = String(pt.name || pt.pn || pt.id || pt.pointName || 'P');
    
    // Projected Coordinates (TM 3° / UTM)
    const y = Number(pt.y !== undefined ? pt.y : (pt.e !== undefined ? pt.e : (pt.tgtC1 !== undefined ? pt.tgtC1 : (pt.easting !== undefined ? pt.easting : 0))));
    const x = Number(pt.x !== undefined ? pt.x : (pt.n !== undefined ? pt.n : (pt.tgtC2 !== undefined ? pt.tgtC2 : (pt.northing !== undefined ? pt.northing : 0))));
    const z = Number(pt.z !== undefined ? pt.z : (pt.h !== undefined ? pt.h : (pt.tgtC3 !== undefined ? pt.tgtC3 : (pt.elev !== undefined ? pt.elev : 0))));

    // Geographic Coordinates
    const lat = Number(pt.lat !== undefined ? pt.lat : (pt.latDec !== undefined ? pt.latDec : 0));
    const lon = Number(pt.lon !== undefined ? pt.lon : (pt.lng !== undefined ? pt.lng : (pt.lonDec !== undefined ? pt.lonDec : 0)));

    return { name, y, x, z, lat, lon, raw: pt };
  }

  const StudioExporter = {
    /**
     * Netcad Nokta Dosyası (.NCN) Üretimi
     * Standart TKGM / BÖHHBÜY formatında sabit genişlikli metin
     * @param {Array<Object>} points 
     * @param {Object} options 
     * @returns {string}
     */
    toNcn(points, options = {}) {
      if (!Array.isArray(points) || points.length === 0) return '';
      let ncn = '';
      
      points.forEach(pt => {
        const p = normalizePoint(pt);
        const nameStr = p.name.padEnd(14, ' ');
        const yStr = p.y.toFixed(3).padStart(12, ' ');
        const xStr = p.x.toFixed(3).padStart(12, ' ');
        const zStr = p.z.toFixed(3).padStart(9, ' ');
        ncn += `${nameStr} ${yStr} ${xStr} ${zStr}\n`;
      });

      return ncn;
    },

    /**
     * Excel Uyumlu CSV Üretimi (UTF-8 BOM ile Türkçe Karakter Garantisi)
     * @param {Array<Object>} points 
     * @param {Array<string>|null} customHeaders 
     * @returns {string}
     */
    toCsv(points, customHeaders = null) {
      if (!Array.isArray(points) || points.length === 0) return '';

      const bom = '\uFEFF'; // Excel'in Türkçe karakterleri düzgün tanıması için BOM
      const headers = customHeaders || ['Nokta_Adi', 'Y_Saga', 'X_Yukari', 'Kot_Z', 'Enlem_Lat', 'Boylam_Lon'];
      let csv = bom + headers.join(',') + '\n';

      points.forEach(pt => {
        const p = normalizePoint(pt);
        const row = [
          `"${p.name.replace(/"/g, '""')}"`,
          p.y.toFixed(3),
          p.x.toFixed(3),
          p.z.toFixed(3),
          p.lat ? p.lat.toFixed(8) : '',
          p.lon ? p.lon.toFixed(8) : ''
        ];
        csv += row.join(',') + '\n';
      });

      return csv;
    },

    /**
     * Google Earth KML Üretimi
     * @param {Array<Object>} points 
     * @param {Object} options 
     * @returns {string}
     */
    toKml(points, options = {}) {
      const docName = options.docName || 'Harita_Tools_Noktalari';
      let kml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      kml += `<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n`;
      kml += `  <name>${docName}</name>\n`;
      kml += `  <description>Harita Tools Geomatik Stüdyosu tarafından üretilmiştir.</description>\n`;

      // KML Pin Style
      kml += `  <Style id="surveyPoint">\n`;
      kml += `    <IconStyle>\n`;
      kml += `      <color>ff22d3ee</color>\n`;
      kml += `      <scale>1.1</scale>\n`;
      kml += `      <Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon>\n`;
      kml += `    </IconStyle>\n`;
      kml += `  </Style>\n`;

      points.forEach(pt => {
        const p = normalizePoint(pt);
        if (!p.lat && !p.lon) return;

        kml += `  <Placemark>\n`;
        kml += `    <name>${p.name}</name>\n`;
        kml += `    <styleUrl>#surveyPoint</styleUrl>\n`;
        kml += `    <description><![CDATA[\n`;
        kml += `      <b>Nokta:</b> ${p.name}<br/>\n`;
        if (p.y && p.x) kml += `      <b>Y (Sağa):</b> ${p.y.toFixed(3)} m<br/><b>X (Yukarı):</b> ${p.x.toFixed(3)} m<br/>\n`;
        kml += `      <b>Kot:</b> ${p.z.toFixed(3)} m<br/>\n`;
        kml += `      <b>Enlem:</b> ${p.lat.toFixed(8)}°<br/><b>Boylam:</b> ${p.lon.toFixed(8)}°\n`;
        kml += `    ]]></description>\n`;
        kml += `    <Point>\n`;
        kml += `      <coordinates>${p.lon.toFixed(8)},${p.lat.toFixed(8)},${p.z.toFixed(3)}</coordinates>\n`;
        kml += `    </Point>\n`;
        kml += `  </Placemark>\n`;
      });

      kml += `</Document>\n</kml>`;
      return kml;
    },

    /**
     * AutoCAD / Netcad DXF ASCII Üretimi
     * @param {Array<Object>} points 
     * @param {Object} options 
     * @returns {string}
     */
    toDxf(points, options = {}) {
      let dxf = `0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nENDSEC\n0\nSECTION\n2\nBLOCKS\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n`;

      points.forEach(pt => {
        const p = normalizePoint(pt);
        // POINT Entity
        dxf += `0\nPOINT\n8\nNOKTALAR\n10\n${p.y.toFixed(3)}\n20\n${p.x.toFixed(3)}\n30\n${p.z.toFixed(3)}\n`;
        // Point Name Label Entity
        dxf += `0\nTEXT\n8\nNOKTA_ADI\n10\n${(p.y + 0.5).toFixed(3)}\n20\n${(p.x + 0.5).toFixed(3)}\n30\n${p.z.toFixed(3)}\n40\n1.2\n1\n${p.name}\n`;
        // Point Height Label Entity
        if (options.includeHeights !== false) {
          dxf += `0\nTEXT\n8\nKOTLAR\n10\n${(p.y + 0.5).toFixed(3)}\n20\n${(p.x - 1.0).toFixed(3)}\n30\n${p.z.toFixed(3)}\n40\n0.9\n1\n${p.z.toFixed(3)}\n`;
        }
      });

      dxf += `0\nENDSEC\n0\nEOF\n`;
      return dxf;
    },

    /**
     * Standard GIS GeoJSON FeatureCollection
     * @param {Array<Object>} points 
     * @returns {string}
     */
    toGeoJson(points) {
      const features = [];
      points.forEach(pt => {
        const p = normalizePoint(pt);
        if (!p.lat && !p.lon) return;

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [Number(p.lon.toFixed(8)), Number(p.lat.toFixed(8)), Number(p.z.toFixed(3))]
          },
          properties: {
            name: p.name,
            y: p.y,
            x: p.x,
            z: p.z
          }
        });
      });

      return JSON.stringify({
        type: 'FeatureCollection',
        features
      }, null, 2);
    },

    /**
     * GPS Exchange Format (GPX 1.1) Üretimi
     * @param {Array<Object>} points 
     * @param {Object} options 
     * @returns {string}
     */
    toGpx(points, options = {}) {
      const docName = options.docName || 'Harita_Tools_Noktalari';
      let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      gpx += `<gpx version="1.1" creator="Harita Tools GNSS POS Studio" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n`;
      gpx += `  <metadata>\n    <name>${docName}</name>\n    <time>${new Date().toISOString()}</time>\n  </metadata>\n`;

      points.forEach(pt => {
        const p = normalizePoint(pt);
        if (!p.lat && !p.lon) return;

        gpx += `  <wpt lat="${p.lat.toFixed(8)}" lon="${p.lon.toFixed(8)}">\n`;
        gpx += `    <ele>${p.z.toFixed(3)}</ele>\n`;
        gpx += `    <name>${p.name.replace(/[<>&]/g, '')}</name>\n`;
        gpx += `    <desc>Y: ${p.y.toFixed(3)} m, X: ${p.x.toFixed(3)} m, Z: ${p.z.toFixed(3)} m</desc>\n`;
        gpx += `  </wpt>\n`;
      });

      gpx += `</gpx>\n`;
      return gpx;
    },

    downloadGpx(filename, points, options = {}) {
      const content = this.toGpx(points, options);
      downloadTextFile(filename.endsWith('.gpx') ? filename : `${filename}.gpx`, content, 'application/gpx+xml');
      showToast(t("core.exporter.toastGpxDownloaded") || "💾 GPX dosyası başarıyla indirildi.", 'success');
    },

    /**
     * Shorthand Downloaders with Automatic Toasts
     */
    downloadNcn(filename, points) {
      const content = this.toNcn(points);
      downloadTextFile(filename.endsWith('.ncn') ? filename : `${filename}.ncn`, content, 'text/plain;charset=windows-1254');
      showToast(t("core.exporter.toastNcnDownloaded", { count: points.length }), 'success');
    },

    downloadCsv(filename, points, customHeaders = null) {
      const content = this.toCsv(points, customHeaders);
      downloadTextFile(filename.endsWith('.csv') ? filename : `${filename}.csv`, content, 'text/csv;charset=utf-8');
      showToast(t("core.exporter.toastCsvDownloaded", { count: points.length }), 'success');
    },

    downloadKml(filename, points, options = {}) {
      const content = this.toKml(points, options);
      downloadTextFile(filename.endsWith('.kml') ? filename : `${filename}.kml`, content, 'application/vnd.google-earth.kml+xml');
      showToast(t("core.exporter.toastKmlDownloaded"), 'success');
    },

    downloadDxf(filename, points, options = {}) {
      const content = this.toDxf(points, options);
      downloadTextFile(filename.endsWith('.dxf') ? filename : `${filename}.dxf`, content, 'application/dxf');
      showToast(t("core.exporter.toastDxfDownloaded"), 'success');
    },

    downloadGeoJson(filename, points) {
      const content = this.toGeoJson(points);
      downloadTextFile(filename.endsWith('.geojson') ? filename : `${filename}.geojson`, content, 'application/geo+json');
      showToast(t("core.exporter.toastGeoJsonDownloaded"), 'success');
    }
  };

  // Global Export
  window.StudioExporter = StudioExporter;
})();
