/**
 * Harita Tools - Centralized Leaflet Map Engine & Factory
 * Unifies all map viewports across all studio modules:
 * - Pafta Index & GNSS Solutions (#mapContainer)
 * - Cadastre RTK & CORS (#cadastreMapContainer)
 * - Drone Flight Planner & Smart GCP (#flightMapContainer)
 * - HGM TG-20 Geoid Height Station (#tg20MapContainer)
 * - Universal CAD / GIS Converter (#converterMap)
 */

(function () {
  'use strict';

  /**
   * Generates the 9 standard geodetic & engineering tile layers
   * @param {Object} options Configuration options
   * @returns {Object} { baseMaps, defaultLayer }
   */
  function createBaseLayers(options = {}) {
    if (typeof L === 'undefined') {
      console.warn('Leaflet (L) kütüphanesi henüz yüklenmedi.');
      return { baseMaps: {}, defaultLayer: null };
    }

    // 1. Google Hibrit (Yüksek Çözünürlüklü Uydu + Karayolları + İl/İlçe/Köy/Mahalle İsimleri)
    const layerGoogleHybridDetailed = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      attribution: '&copy; Google Maps (Detaylı Hibrit Uydu & Yerleşim)'
    });

    // 2. Google Detaylı Vektör Yol Haritası (Caddeler, Sokaklar, Şehirler)
    const layerGoogleStreets = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      attribution: '&copy; Google Maps (Detaylı Yol & Şehir Haritası)'
    });

    // 3. Google Saf Uydu (Yazısız)
    const layerGoogleSatellitePure = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      attribution: '&copy; Google Maps (Saf Uydu)'
    });

    // 4. Esri Detaylı Topoğrafik Harita (Eşyükselti Eğrileri, Coğrafi İsimler)
    const layerEsriTopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '&copy; Esri World Topo Map'
    });

    // 5. Esri Yüksek Çözünürlüklü Uydu
    const layerEsriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '&copy; Esri World Imagery'
    });

    // 6. OpenStreetMap Standart Detaylı
    const layerOsm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap Katkıda Bulunanlar'
    });

    // 7. CartoDB Karanlık Mühendislik
    const layerCartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; CartoDB Dark (Detaylı Mühendislik)'
    });

    // 8. CartoDB Aydınlık Mühendislik
    const layerCartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; CartoDB Light (Aydınlık Mühendislik)'
    });

    // 9. Google Topoğrafya (Kabartmalı Arazi)
    const layerGoogleTerrain = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      attribution: '&copy; Google Terrain (Detaylı Arazi)'
    });

    const baseMaps = {
      [t("map.layerGoogleHybrid")]: layerGoogleHybridDetailed,
      [t("map.layerGoogleStreets")]: layerGoogleStreets,
      [t("map.layerGoogleSatellite")]: layerGoogleSatellitePure,
      [t("map.layerEsriTopo")]: layerEsriTopo,
      [t("map.layerEsriSat")]: layerEsriSat,
      '🌐 OpenStreetMap': layerOsm,
      [t("map.layerGoogleTerrain")]: layerGoogleTerrain,
      [t("map.layerCartoDark")]: layerCartoDark,
      [t("map.layerCartoLight")]: layerCartoLight
    };

    // Varsayılan Katman: Her zaman Detaylı Google Hibrit
    let defaultLayer = layerGoogleHybridDetailed;
    if (options.defaultType === 'dark') defaultLayer = layerCartoDark;
    else if (options.defaultType === 'streets') defaultLayer = layerGoogleStreets;
    else if (options.defaultType === 'pure_sat') defaultLayer = layerGoogleSatellitePure;
    else if (options.defaultType === 'esri_sat') defaultLayer = layerEsriSat;
    else if (options.defaultType === 'osm') defaultLayer = layerOsm;

    return { baseMaps, defaultLayer };
  }

  /**
   * Unified Map Factory for all Studio modules
   * @param {string} containerId DOM ID of the map element
   * @param {Object} options Map options (center, zoom, defaultType, overlays, etc.)
   * @returns {Object} { map, baseMaps, defaultLayer, layerControl, scaleControl }
   */
  function createStudioMap(containerId, options = {}) {
    const el = document.getElementById(containerId);
    if (!el) {
      console.warn(`[createStudioMap] "${containerId}" id'li harita konteyneri bulunamadı.`);
      return { map: null, baseMaps: {}, defaultLayer: null };
    }

    if (typeof L === 'undefined') {
      console.error('[createStudioMap] Leaflet (L) kütüphanesi yüklü değil.');
      return { map: null, baseMaps: {}, defaultLayer: null };
    }

    // Generate standard base layers
    const { baseMaps, defaultLayer } = createBaseLayers({
      defaultType: options.defaultType || 'hybrid'
    });

    const mapOptions = {
      center: options.center || [39.0, 35.2], // Türkiye Coğrafi Merkezi
      zoom: options.zoom !== undefined ? options.zoom : 6,
      minZoom: options.minZoom || 3,
      maxZoom: options.maxZoom || 22,
      layers: [defaultLayer],
      preferCanvas: true,
      zoomControl: options.zoomControl !== undefined ? options.zoomControl : true,
      attributionControl: options.attributionControl !== undefined ? options.attributionControl : true
    };

    const map = L.map(containerId, mapOptions);

    // Standardized Layer Control (Top-Right)
    const layerControl = L.control.layers(
      baseMaps,
      options.overlays || null,
      {
        position: options.layerControlPosition || 'topright',
        collapsed: options.collapsed !== undefined ? options.collapsed : true
      }
    ).addTo(map);

    // Geodetic Metric Scale Bar (Bottom-Left)
    let scaleControl = null;
    if (options.scale !== false) {
      scaleControl = L.control.scale({
        metric: true,
        imperial: false,
        position: 'bottomleft',
        maxWidth: 150
      }).addTo(map);
    }

    // Attach container class for uniform styling
    el.classList.add('studio-map-canvas');

    return {
      map,
      baseMaps,
      defaultLayer,
      layerControl,
      scaleControl
    };
  }

  /**
   * Fits map to a layer group bounds with safe padding
   */
  function fitBoundsWithPadding(map, layerGroup, padding = [40, 40]) {
    if (!map || !layerGroup) return;
    try {
      const layers = layerGroup.getLayers ? layerGroup.getLayers() : [];
      if (layers.length === 0) return;
      const bounds = L.featureGroup(layers).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding });
      }
    } catch (err) {
      console.warn('[fitBoundsWithPadding] Sığdırma hatası:', err);
    }
  }

  // Global Exports
  window.createBaseLayers = createBaseLayers;
  window.createStudioMap = createStudioMap;
  window.fitBoundsWithPadding = fitBoundsWithPadding;
})();
