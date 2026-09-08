/* =========================================================================
 * GNSS POS STUDIO - CONSOLIDATED APPLICATION BUNDLE (app.bundle.js)
 * Otomatik Derleme Tarihi: 06.09.2026 19:05:18
 * Modüler kaynak kodlardan otomatik üretilmiştir.
 * ========================================================================= */


/* >>>>>>>>>> [MODULE: js/core/geodesyConstants.js] >>>>>>>>>> */
/**
 * Harita Tools - Geodetic Constants & Angular Math Utility Engine
 * Centralized Single Source of Truth for Reference Ellipsoids & Coordinate Math
 * Standards: BÖHHBÜY, IERS, EPSG, HGM
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.HaritaGeodesy = exports;
    root.GEODETIC_CONSTANTS = exports.ELLIPSOIDS;
    // Export global angle helpers for backward compatibility
    if (typeof root.deg2rad === 'undefined') root.deg2rad = exports.deg2rad;
    if (typeof root.rad2deg === 'undefined') root.rad2deg = exports.rad2deg;
    if (typeof root.gon2deg === 'undefined') root.gon2deg = exports.gon2deg;
    if (typeof root.deg2gon === 'undefined') root.deg2gon = exports.deg2gon;
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Standard Ellipsoids
  const ELLIPSOIDS = Object.freeze({
    // GRS80 (ITRF96, TUREF, ETRS89)
    GRS80: Object.freeze({
      name: 'GRS80',
      a: 6378137.0,
      invF: 298.257222101,
      f: 1.0 / 298.257222101,
      b: 6378137.0 * (1.0 - 1.0 / 298.257222101),
      e2: (2.0 * (1.0 / 298.257222101)) - (1.0 / 298.257222101) ** 2,
      ep2: ((6378137.0 ** 2) - (6378137.0 * (1.0 - 1.0 / 298.257222101)) ** 2) / ((6378137.0 * (1.0 - 1.0 / 298.257222101)) ** 2)
    }),
    // WGS84 (GPS standard)
    WGS84: Object.freeze({
      name: 'WGS84',
      a: 6378137.0,
      invF: 298.257223563,
      f: 1.0 / 298.257223563,
      b: 6378137.0 * (1.0 - 1.0 / 298.257223563),
      e2: (2.0 * (1.0 / 298.257223563)) - (1.0 / 298.257223563) ** 2,
      ep2: ((6378137.0 ** 2) - (6378137.0 * (1.0 - 1.0 / 298.257223563)) ** 2) / ((6378137.0 * (1.0 - 1.0 / 298.257223563)) ** 2)
    }),
    // Hayford 1924 / International 1924 (ED50)
    HAYFORD1924: Object.freeze({
      name: 'Hayford 1924 / International 1924',
      a: 6378388.0,
      invF: 297.0,
      f: 1.0 / 297.0,
      b: 6378388.0 * (1.0 - 1.0 / 297.0),
      e2: (2.0 * (1.0 / 297.0)) - (1.0 / 297.0) ** 2,
      ep2: ((6378388.0 ** 2) - (6378388.0 * (1.0 - 1.0 / 297.0)) ** 2) / ((6378388.0 * (1.0 - 1.0 / 297.0)) ** 2)
    })
  });

  // Universal Angular Unit Conversions
  const deg2rad = deg => (deg * Math.PI) / 180.0;
  const rad2deg = rad => (rad * 180.0) / Math.PI;
  const gon2deg = gon => gon * 0.9;
  const deg2gon = deg => deg / 0.9;
  const gon2rad = gon => (gon * Math.PI) / 200.0;
  const rad2gon = rad => (rad * 200.0) / Math.PI;

  return {
    ELLIPSOIDS,
    deg2rad,
    rad2deg,
    gon2deg,
    deg2gon,
    gon2rad,
    rad2gon
  };
}));

/* <<<<<<<<<< [END MODULE: js/core/geodesyConstants.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/core/utils.js] >>>>>>>>>> */
/**
 * Harita Tools - Global Core Utilities
 * - Toast Notification System
 * - File Downloader
 * - Resilient Clipboard Manager (with execCommand fallback for local IP)
 * - Geodetic Unit Formatters
 * - Universal Table Empty-State Renderer
 */

(function () {
  'use strict';

  /**
   * Universal Toast Notification
   * @param {string} message 
   * @param {'info'|'success'|'warning'|'error'} type 
   * @param {number} durationMs 
   */
  function showToast(message, type = 'info', durationMs = 3800) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    else if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';
    else if (type === 'error') iconClass = 'fa-solid fa-circle-xmark';

    toast.innerHTML = `
      <div class="toast-icon-wrap">
        <i class="${iconClass} toast-icon"></i>
      </div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" title="Kapat" type="button">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="toast-progress" style="animation-duration: ${durationMs}ms;"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    let timeoutId = null;

    const hideToast = () => {
      if (toast.classList.contains('toast-hiding')) return;
      toast.classList.add('toast-hiding');
      if (timeoutId) clearTimeout(timeoutId);
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 320);
    };

    if (closeBtn) closeBtn.addEventListener('click', hideToast);
    container.appendChild(toast);
    timeoutId = setTimeout(hideToast, durationMs);
  }

  /**
   * Browser File Downloader
   * @param {string} filename 
   * @param {string|Blob} content 
   * @param {string} mimeType 
   */
  function downloadTextFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  /**
   * Resilient Clipboard Copy
   * Supports modern navigator.clipboard AND legacy execCommand fallback
   * (Essential for non-HTTPS local network IP addresses like http://192.168.x.x)
   * @param {string} text 
   * @param {string} successMsg 
   * @returns {Promise<boolean>}
   */
  async function copyToClipboard(text, successMsg = null) {
    if (typeof text !== 'string') text = String(text ?? '');
    if (!text) {
      showToast(t("core.utils.toastCopyEmpty"), 'warning');
      return false;
    }

    let copied = false;

    // 1. Try modern navigator.clipboard
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (err) {
        console.warn('[copyToClipboard] navigator.clipboard başarısız, fallback deneniyor:', err);
      }
    }

    // 2. Fallback to hidden textarea + execCommand
    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error('[copyToClipboard] Fallback kopyalama da başarısız oldu:', err);
      }
    }

    if (copied) {
      const msg = successMsg || t("core.utils.toastCopySuccess");
      showToast(msg, 'success');
      return true;
    } else {
      showToast(t("core.utils.toastCopyError"), 'error');
      return false;
    }
  }

  /**
   * Geodetic Formatters
   */
  function formatMeter(val, decimals = 3, withUnit = true) {
    if (val === null || val === undefined || isNaN(val)) return '--';
    const num = Number(val).toFixed(decimals);
    return withUnit ? `${num} m` : num;
  }

  function formatUndulation(val, decimals = 3, withUnit = true) {
    if (val === null || val === undefined || isNaN(val)) return '--';
    const sign = val >= 0 ? '+' : '';
    const num = sign + Number(val).toFixed(decimals);
    return withUnit ? `${num} m` : num;
  }

  function formatDegree(val, decimals = 6, withUnit = true) {
    if (val === null || val === undefined || isNaN(val)) return '--';
    const num = Number(val).toFixed(decimals);
    return withUnit ? `${num}°` : num;
  }

  function formatDMS(decDeg, isLat = true) {
    if (decDeg === null || decDeg === undefined || isNaN(decDeg)) return '--';
    const val = Math.abs(Number(decDeg));
    const deg = Math.floor(val);
    const minDec = (val - deg) * 60;
    const min = Math.floor(minDec);
    const sec = ((minDec - min) * 60).toFixed(4);
    const dir = isLat ? (decDeg >= 0 ? 'K' : 'G') : (decDeg >= 0 ? 'D' : 'B');
    return `${deg}° ${String(min).padStart(2, '0')}' ${String(sec).padStart(7, '0')}" ${dir}`;
  }

  /**
   * Universal Table Empty-State Renderer
   * @param {HTMLElement|string} tbody Table body element or selector ID
   * @param {number} colspan Number of columns to span
   * @param {string} message Primary guidance message
   * @param {string} icon FontAwesome icon class
   * @param {string} subMessage Optional hint
   */
  function renderTableEmptyState(tbody, colspan = 8, message = 'Henüz veri yüklenmedi.', icon = 'fa-folder-open', subMessage = 'Lütfen sol panelden bir veri dosyası seçin veya sürükleyip bırakın.') {
    const el = typeof tbody === 'string' ? document.getElementById(tbody) : tbody;
    if (!el) return;

    el.innerHTML = `
      <tr>
        <td colspan="${colspan}" class="text-center py-5">
          <div class="table-empty-state-wrap d-flex flex-col items-center justify-center gap-6 p-4">
            <div class="empty-state-icon text-cyan" style="font-size: 28px; opacity: 0.65;">
              <i class="fa-solid ${icon}"></i>
            </div>
            <div class="empty-state-msg font-bold text-main text-xs">${message}</div>
            ${subMessage ? `<div class="empty-state-sub text-dim text-2xs" style="max-width: 360px;">${subMessage}</div>` : ''}
          </div>
        </td>
      </tr>
    `;
  }

  // Global Exports
  window.showToast = showToast;
  window.downloadTextFile = downloadTextFile;
  window.copyToClipboard = copyToClipboard;
  window.formatMeter = formatMeter;
  window.formatUndulation = formatUndulation;
  window.formatDegree = formatDegree;
  window.formatDMS = formatDMS;
  window.renderTableEmptyState = renderTableEmptyState;
})();

/* <<<<<<<<<< [END MODULE: js/core/utils.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: locales/tr.js] >>>>>>>>>> */
// Harita Tools Türkçe Çeviri Paketi
const translations = {
  "app": {
    "title": "Harita Tools (Beta) - Jeodezi & GNSS Stüdyosu",
    "metaDescription": "Türkiye Harita, Jeodezi ve Kadastro Mühendisliği web araçları"
  },
  "common": {
    "copySuccess": "📋 Panoya kopyalandı.",
    "copyEmpty": "⚠️ Kopyalanacak içerik boş.",
    "download": "İndir",
    "clear": "Temizle",
    "reset": "Sıfırla",
    "close": "Kapat",
    "search": "Ara...",
    "filter": "Filtrele",
    "all": "Tümü",
    "loading": "Yükleniyor...",
    "processing": "İşleniyor...",
    "systemReady": "Sistem Hazır",
    "offlineBadge": "%100 Çevrimdışı",
    "noData": "Görüntülenecek veri bulunamadı.",
    "selectFile": "Dosya Seçin",
    "dragDropFile": "Dosyayı buraya sürükleyin veya seçin",
    "statusApproved": "UYGUN",
    "statusLimitExceeded": "LİMİT AŞILDI",
    "singleObservation": "Tekil Ölçü",
    "scale": "Ölçek:",
    "centerLat": "Merkez Enlem:",
    "centerLon": "Merkez Boylam:",
    "date": "Tarih:",
    "time": "Saat:",
    "tools": "Araçlar",
    "export": "Dışa Aktar",
    "example": "Örnek",
    "sourceSystem": "Kaynak Sistem:",
    "allDocuments": "Tüm Dokümanlar",
    "goToPafta": "Paftaya Git",
    "copy": "Kopyala"
  },
  "geomatics": {
    "easting": "Sağa Değer (Y)",
    "northing": "Yukarı Değer (X)",
    "ellipsoidalHeight": "Elipsoit Kotu (h)",
    "geoidUndulation": "Jeoit Undülasyonu (N)",
    "orthometricHeight": "Ortometrik Kot (H)",
    "closedArea": "Kapalı Alan",
    "sahaSiniri": "Saha Sınırı",
    "traversePoint": "Poligon Noktası (P)",
    "meridian": "Dilim Orta Meridyeni (DOM)",
    "coordinateSystem": "Koordinat Sistemi",
    "projection": "Projeksiyon",
    "unitMeter": "m",
    "unitSquareMeter": "m²",
    "unitDonum": "Dönüm",
    "unitHectare": "ha",
    "unitKilometer": "km"
  },
  "navigation": {
    "tabDashboard": {
      "title": "Harita Tools",
      "sub": "Harita, Kadastro & Jeodezi Mühendislik Araçları"
    },
    "tabRtk": {
      "title": "RTK & Ham Data",
      "sub": "Tüm GNSS alıcılarının ham ölçü dosyaları (.rw5, .raw, .csv, .txt, .jxl), ITRF-96 TM 3° hesaplaması, HGM TG-20 jeoidi ve Netcad/AutoCAD/PDF çıktıları"
    },
    "tabTg20": {
      "title": "HGM TG-20 Jeoit Kot İndirgeme",
      "sub": "Harita Genel Müdürlüğü TG-20 modeli ile Elipsoit Kotu (h) ➔ TUDKA-99 Ortometrik Nivelman Kotu (H = h - N) hesabı"
    },
    "tabRinex": {
      "title": "RINEX Dosya Düzenleme & Birleştirme",
      "sub": "İstasyon gözlem dosyalarını birleştirme, zaman aralığı kesme, uydu filtreleme ve RINEX 2.11 / 3.x dönüştürme"
    },
    "tabMap": {
      "title": "Pafta İndeksi & Harita Görünümü",
      "sub": "Türkiye 1/100.000, 1/50.000, 1/25.000 standart paftaları, 3° dilim sınırları ve nokta çizimi"
    },
    "tabGeodesy": {
      "title": "Koordinat Dönüşümü & Helmert Hesabı",
      "sub": "ITRF-96 TM 3°, ED-50, Coğrafi koordinat dönüşümleri, 2B Helmert (.DNS) ve 3B datum parametreleri"
    },
    "tabFlight": {
      "title": "İHA Uçuş & YKN Planlama",
      "sub": "Akıllı uçuş alanı optimizasyonu, güneş/gölge analizi, canlı meteoroloji ve yol ağına duyarlı YKN üretimi"
    },
    "tabConverter": {
      "title": "Evrensel Harita Dosya & Format Dönüştürücü",
      "sub": "AutoCAD/Netcad DXF, Google Earth KML/KMZ, NCN, CSV/TXT ve GeoJSON iki yönlü dönüşüm, noktalardan kapalı alan üretimi"
    },
    "tabStandards": {
      "title": "Resmi Mevzuat & Standartlar Kütüphanesi",
      "sub": "BÖHHBÜY, MAPEG, TKGM, HGM ve DSİ resmi PDF dokümanları ve standartları"
    },
    "tabGuide": {
      "title": "Kullanım & Mühendislik Kılavuzu",
      "sub": "Modül iş akışları, jeodezik formüller ve saha uygulama ipuçları"
    }
  },
  "converter": {
    "headerTitle": "Evrensel Harita & CAD Dosya Dönüştürücü",
    "headerDesc": "AutoCAD/Netcad DXF, Google Earth KML/KMZ, NCN, CSV/TXT ve GeoJSON İki Yönlü Dönüşüm & Noktalardan Kapalı Alan Çevirme",
    "dropzoneTitle": "CAD, KML, NCN veya GeoJSON Dosyası Yükleyin",
    "dropzoneSub": ".dxf, .kml, .kmz, .ncn, .txt, .csv, .geojson veya .ncz dosyalarını sürükleyip bırakın",
    "badgeOffline": "%100 Çevrimdışı",
    "badgeMultiLayer": "Çoklu Katman",
    "sectionExport": "2. Hedef Format & Dışa Aktar",
    "sectionAreaGen": "3. Noktalardan Kapalı Alan Üret",
    "sectionAreaGenDesc": "Yüklenen NCN, TXT veya DXF nokta listesinden tek tıkla sıralı veya konveks kapalı alan üretir.",
    "btnMethodSequential": "Sıralı Dizi",
    "btnMethodHull": "Dış Çeper (Hull)",
    "btnCreateArea": "Kapalı Alan Oluştur",
    "lblAreaMethod": "Alan Çevirme Yöntemi:",
    "kpiPoints": "Nokta",
    "kpiTexts": "Yazı / Kot",
    "kpiLines": "Çizgi / Hat",
    "kpiPolygons": "Kapalı Alan",
    "filterAll": "Tümü",
    "filterTexts": "Yazılar",
    "filterPoints": "Noktalar",
    "filterLines": "Çizgiler",
    "filterPolygons": "Kapalı Alanlar",
    "btnExportDxf": "AutoCAD DXF (.dxf)",
    "btnExportKml": "Google Earth (.kml)",
    "btnExportKmz": "Sıkıştırılmış KMZ (.kmz)",
    "btnExportNcn": "Netcad Nokta (.ncn)",
    "btnExportGeoJson": "Standart GeoJSON (.geojson)",
    "btnExportCsv": "Koordinat Listesi (.csv)",
    "toastParsing": "🔄 '{name}' dosyası ayrıştırılıyor...",
    "toastParsed": "✅ '{name}' başarıyla işlendi ({count} geometri).",
    "toastParseError": "❌ Dosya okunamadı: {err}",
    "toastCleared": "Format dönüştürücü temizlendi.",
    "toastAreaCreated": "✅ Kapalı Alan Üretildi!\n📐 Alan: {area}",
    "toastAreaError": "❌ Alan üretilemedi: {err}",
    "toastNeedPointsFirst": "Lütfen önce nokta içeren bir dosya yükleyin.",
    "toastShowTexts": "✍️ CAD Metinleri haritada açıldı.",
    "toastHideTexts": "CAD Metinleri gizlendi.",
    "toastShowLabels": "🏷️ Nokta etiketleri açıldı.",
    "toastHideLabels": "Nokta etiketleri gizlendi.",
    "toastExportDxfSuccess": "✅ AutoCAD / Netcad DXF dosyası başarıyla indirildi.",
    "toastExportKmlSuccess": "✅ Google Earth KML dosyası başarıyla indirildi.",
    "toastExportKmzSuccess": "✅ Sıkıştırılmış Google Earth KMZ dosyası indirildi.",
    "toastExportKmzError": "❌ KMZ oluşturulamadı: {err}",
    "toastExportNcnSuccess": "✅ Netcad NCN nokta dosyası başarıyla indirildi.",
    "toastExportGeoJsonSuccess": "✅ Standart GeoJSON dosyası başarıyla indirildi.",
    "toastExportCsvSuccess": "✅ CSV koordinat tablosu başarıyla indirildi.",
    "errMinPointsForArea": "Kapalı alan üretmek için en az 3 nokta gereklidir.",
    "errNoDataToExport": "Dışa aktarılacak veri bulunamadı.",
    "errNoGeometryToExport": "Dışa aktarılacak geometri bulunamadı.",
    "errNoPointsToExport": "Dışa aktarılacak nokta bulunamadı.",
    "lblRecordCount": "{count} Kayıt",
    "lblFilteredRecordCount": "{count} / {total} Kayıt",
    "btnAllWithCount": "Tümü ({count})",
    "btnTextsWithCount": "Yazılar ({count})",
    "btnPointsWithCount": "Noktalar ({count})",
    "btnLinesWithCount": "Çizgiler ({count})",
    "btnPolygonsWithCount": "Kapalı Alanlar ({count})",
    "emptyStateNoData": "Henüz CAD/GIS verisi yüklenmedi.",
    "emptyStateNoDataSub": "Sol panelden .NCZ, .DXF, .KML, .KMZ veya .NCN dosyası yükleyin.",
    "emptyStateNoFilter": "Filtreye uygun kayıt bulunamadı.",
    "emptyStateNoFilterSub": "Arama terimini veya geometri türü filtresini değiştirmeyi deneyin.",
    "symbolPrefix": "Sembol: {name}",
    "typePoint": "Nokta",
    "typeSymbol": "Harita Sembolü",
    "lblTableFirst400": "İlk 400 / {total} Kayıt",
    "lblTableCountTotal": "{count} Kayıt",
    "lblDonumHa": "{donum} Dönüm ({ha} ha)",
    "noLayersLoaded": "Henüz katman yüklenmedi.",
    "btnShowLayer": "Göster",
    "popupLayer": "Katman",
    "popupArea": "Alan",
    "popupPerimeter": "Çevre",
    "popupType": "Tip",
    "tabAllLayers": "Tüm Geometriler",
    "tabPointsOnly": "Noktalar",
    "tabLinesOnly": "Çizgiler",
    "tabPolygonsOnly": "Kapalı Alanlar",
    "tabTextsOnly": "Yazılar",
    "btnToggleCadTexts": "CAD Yazılarını Aç/Kapat",
    "btnTogglePointLabels": "Nokta Etiketlerini Aç/Kapat",
    "lblFilterLayers": "Katman Filtresi:",
    "lblSearchGeom": "Ara (Katman, Yazı, Kod):",
    "searchPlaceholder": "Tabloda veya haritada ara...",
    "step1Title": "1. Dosya Yükle",
    "dropzoneLabel": "Dosyayı Buraya Sürükleyin veya Seçin",
    "step2Title": "2. Projeksiyon & Koordinat Sistemi",
    "lblSourceProj": "Kaynak Sistem:"
  },
  "flight": {
    "headerTitle": "İHA Fotogrametri & Uçuş Planlama",
    "headerDesc": "Saha sınırı optimizasyonu, 3B arazi gölge analizi, hava durumu ve otomatik YKN dağıtımı",
    "step1Title": "1. Uçuş Sahası Sınırı",
    "btnUploadBoundary": "Saha Sınırı Yükle (KML/GeoJSON)",
    "btnSampleBoundary": "Örnek Uçuş Sahası Yükle",
    "btnSampleBoundarySub": "Muğla/Milas sahasını yükler",
    "btnDownloading": "İndiriliyor...",
    "badgeBoundaryWaiting": "Saha Sınırı Yükleyiniz",
    "toastLoadingBoundary": "'{name}' uçuş sahası yükleniyor...",
    "toastBoundaryLoaded": "✨ '{name}' uçuş sahası başarıyla yüklendi!",
    "toastBoundaryError": "Saha sınırı yüklenemedi: {err}",
    "toastSampleLoaded": "✨ Örnek uçuş sahası yüklendi (38 kırıklı sınır)!",
    "toastSampleError": "Örnek saha yüklenemedi: {err}",
    "toastNoBoundaryInMap": "Haritaya sığdırılacak yüklü bir uçuş sahası / çalışma sınırı bulunamadı.",
    "toastNeedKmlFirst": "Lütfen önce bir KML/KMZ uçuş sahası yükleyiniz.",
    "toastRoadsLoaded": "✅ {count} adet yol ve patika segmenti haritaya işlendi!",
    "toastRoadsError": "Yol ağı indirilemedi: {err}",
    "toastExternalRoadsLoaded": "✅ {count} adet dış yol geometrisi başarıyla yüklendi!",
    "toastExternalRoadsError": "Yol dosyası açılamadı: {err}",
    "toastWeatherFetching": "🌤️ {date} tarihi için hava durumu ve güneş analizi çekiliyor...",
    "toastWeatherLoaded": "✅ {date} tahminleri haritaya işlendi!",
    "toastHeadingOptimal": "Optimal Hat Doğrultusu: En az dönüşlü uzun eksen ({heading}°) otomatik ayarlandı.",
    "toastHeadingCrosswind": "Rüzgar Uyumlu Doğrultu: Uçuş hatları {windDir}° rüzgara dik ({heading}°) olarak hizalandı.",
    "toastGcpGenerating": "🚀 Yol ağı taranıyor ve akıllı YKN/DN üçgenleme ağı kuruluyor...",
    "toastGcpSuccess": "✅ {count} adet nokta ({ykn} YKN, {dn} DN) başarıyla üretildi!",
    "toastGcpError": "YKN üretilirken hata oluştu: {err}",
    "toastGcpRemoved": "🗑️ {name} noktası kaldırıldı. Nirengi / Üçgenleme ağı güncellendi.",
    "toastGcpMoved": "📍 {name} yeni konuma yerleştirildi (Y: {y}, X: {x})",
    "toastExportNeedBoundary": "Dışa aktarmak için önce bir uçuş sahası yükleyin.",
    "toastExportNeedGcp": "Dışa aktarmak için önce YKN noktası üretin.",
    "toastExportDjiKml": "✈️ DJI Pilot 2 uyumlu sadeleştirilmiş KML indirildi.",
    "toastExportNcn": "📍 Netcad .NCN koordinat dosyası indirildi.",
    "toastExportDxf": "📐 AutoCAD .DXF plan dosyası indirildi.",
    "toastExportCsv": "📊 Excel .CSV koordinat çizelgesi indirildi.",
    "toastExportGcpKml": "🌐 Google Earth YKN KML dosyası indirildi.",
    "toastOpenMapFirst": "Lütfen önce uçuş stüdyosu haritasını açınız.",
    "toastDrawRoadHelp": "✏️ Uyduda gördüğünüz toprak yol güzergahına sırayla tıklayın. Bitirmek için Tamamla veya Çift Tık!",
    "toastDrawRoadSuccess": "✅ {count} noktalı toprak yol eklendi! YKN mesafeleri bu yola bağlandı.",
    "toastDrawRoadMinPoints": "Yol oluşturmak için haritada en az 2 noktaya tıklamalısınız.",
    "tooltipOriginalBoundary": "Orijinal Sınır (Kırıklı)",
    "tooltipOptimizedBoundary": "Akıllı Optimize Edilmiş Uçuş Sınırı",
    "errNeedBoundaryForGcp": "YKN üretmek için önce bir uçuş sahası / çalışma sınırı yükleyiniz.",
    "errInvalidBoundary": "Geçerli bir kapalı alan / saha geometrisi bulunamadı (En az 3 köşe noktası gereklidir).",
    "lblWindCalm": "🟢 Sakin / İdeal",
    "lblWindModerate": "🟡 Orta Rüzgar",
    "lblWindRisky": "🔴 Riskli Rüzgar",
    "lblCloudClear": "(Açık)",
    "lblCloudFew": "(Az Bulutlu)",
    "lblCloudScattered": "(Parçalı)",
    "lblCloudOvercast": "(Kapalı)",
    "lblLightPrecipRisk": "🔴 Yağış Riski",
    "lblLightSunny": "🟢 Net Güneş",
    "lblLightBalanced": "🟢 Dengeli Işık",
    "lblLightVariable": "🟡 Değişken Gölge",
    "lblLightDiffuse": "⚪ Dağınık Difüz Işık",
    "lblSnapGridOff": "Kapalı (Grid)",
    "btnFetchRoads": "Yolları Çek",
    "btnDrawRoad": "Yol Çiz",
    "btnDrawingRoad": "Çiziliyor ({count} Nokta)...",
    "lblRoadSegments": "{count} Yol Segmenti",
    "lblRoadsActive": "{count} Yol Aktif",
    "unitVertex": "Köşe",
    "lblAreaPerimeter": "Alan: {area} ha ({km2} km²) | Çevre: {perimeter} m",
    "lblMaxElevation": "Maks Tepe Açısı: {deg}° | Min Gölge: {shadow}x",
    "lblSunEfficient": "Verimli Güneş (≥35°)",
    "lblSunLowAngle": "Düşük Açı",
    "lblGustPrecip": "Hamle: {gust} m/s | Yağış: %{precip}",
    "lblSnapMax": "Maks {val} m",
    "lblMaxRoadSide": "Maks: {dist}m | %{pct} Yol Kenarı",
    "lblRoadSnap": "%{pct} Yol Snap",
    "lblDirectGrid": "Doğrudan Grid",
    "lblSnapOff": "Kapalı",
    "unitPoint": "Nokta",
    "emptyGcpTable": "Üretilmiş YKN noktası bulunamadı.",
    "lblRoadside": "Yol Kenarı (~{dist}m)",
    "lblToRoad": "Yola {dist}m",
    "lblOpenField": "Açık Arazi",
    "titleDeletePoint": "{name} Noktasını Sil",
    "logBaseLoaded": "🏛️ [SABİT RINEX] '{name}' yüklendi ({marker}).",
    "logRoverLoaded": "🚁 [GEZİCİ RINEX] '{name}' yüklendi ({marker}).",
    "tabFlightSettings": "Uçuş & Kamera Parametreleri",
    "tabRoadNetwork": "Yol Ağı & Snap Ayarları",
    "tabSolarWeather": "Güneş & Canlı Hava Durumu",
    "tabGcpPlan": "YKN / DN Dağıtım Planı",
    "lblSelectDrone": "İHA & Kamera Modeli:",
    "lblFlightAltitude": "Uçuş İrtifası (H / metre):",
    "lblForwardOverlap": "Boyuna Bindirme (%):",
    "lblSideOverlap": "Enine Bindirme (%):",
    "lblTargetGsd": "Hedef GSD (cm/piksel):",
    "btnGenerateFlightLines": "Uçuş Hatlarını Planla",
    "btnGenerateGcp": "🚀 Akıllı YKN Noktaları Üret",
    "btnExportDjiKml": "DJI Pilot 2 (KML)",
    "btnExportNcnGcp": "Netcad .NCN",
    "btnExportDxfGcp": "AutoCAD .DXF",
    "btnExportCsvGcp": "Excel .CSV",
    "btnExportKmlGcp": "Google Earth KML",
    "btnUploadBoundaryShort": "Saha Sınırı Yükle",
    "btnSampleShort": "Örnek",
    "exportDescBoundary": "Uçuş alanı & koridor",
    "exportDescNcn": "YKN & DN koordinatları",
    "exportDescDxf": "Katmanlı CAD çizimi",
    "exportDescCsv": "WGS-84 & ITRF tablosu",
    "exportDescKml": "3D YKN yer kontrol pinleri"
  },
  "tg20": {
    "toastLoadGgfError": "TG20.ggf jeoid veri dosyası yüklenemedi.",
    "toastInvalidCoords": "Lütfen geçerli bir WGS-84 Enlem ve Boylam değeri girin.",
    "toastPointReduced": "🏔️ TG-20 İndirgemesi: N = {n} m ➔ Ortometrik H = {h} m",
    "toastOutOfTurkeyBounds": "⚠️ Belirtilen nokta Türkiye TG-20 jeoid sınırları (35.5°-42.5°K, 25.5°-45.0°D) dışındadır.",
    "toastNeedPoints": "Lütfen indirgenecek nokta listesini girin veya dosya seçin.",
    "toastInvalidCoordLines": "Geçerli koordinat satırı tespit edilemedi.",
    "toastSampleLoaded": "🧪 Örnek 6 şehir kadastro WGS-84 noktası yüklendi.",
    "toastBatchLoaded": "📂 '{name}' içeriği yüklendi ({size} KB).",
    "toastBatchReduced": "✨ {count} nokta TG-20 modeliyle başarıyla ortometrik kota indirgendi!",
    "toastReportDownloaded": "📄 Kadastro_TG20_Kot_Indirgeme_Raporu.txt indirildi.",
    "toastPrintWindowOpened": "🖨️ TG-20 İndirgeme Raporu yazdırma penceresi açıldı.",
    "toastCoordsTransferred": "📍 Koordinatlar Tek Nokta Kot İndirgemesine aktarıldı.",
    "toastClickMapFirst": "Lütfen önce harita üzerinde bir noktaya tıklayın.",
    "toastInterpolationCellZoom": "🔍 1' x 1' TG-20 Enterpolasyon Hücresine Yaklaşıldı",
    "toastGgfLoading": "TG20.ggf jeoid verisi yükleniyor...",
    "toastGridInterpolated": "🌊 TG-20 Ondülasyonu: {n} | 4 Enterpolasyon Düğümü Çizildi",
    "hudInScope": "TG-20 Kapsamında",
    "hudOutOfScope": "Kapsam Dışı",
    "hudOutOfTurkey": "Türkiye Sınırı Dışında",
    "readyLog": "🇹🇷 [TG-20] Harita Genel Müdürlüğü Türkiye Hibrit Jeoidi 2020 (492.991 Grid Noktası) hazır.",
    "outOfScope": "Kapsam Dışı",
    "statusOk": "TG-20 OK",
    "logSingleReduction": "🏔️ [TG-20 İNDİRGEME] Enlem: {lat}°, Boylam: {lon}°, Elipsoit h: {h} m, N: {n} m, Ortometrik H: {H} m",
    "singleReportTemplate": "==================================================\n  TG-20 JEOİT İNDİRGEME TEK NOKTA RAPORU\n==================================================\nWGS-84 Enlem (Lat)    : {lat}° K\nWGS-84 Boylam (Lon)   : {lon}° D\nElipsoit Kotu (h)     : {h} m\nTG-20 Undülasyonu (N) : {n} m\nOrtometrik Kot (H)    : {H} m (TUDKA-99)\nTemel Bağıntı         : H = h - N\nDurum                 : {status}\nTarih                 : {date}\n==================================================",
    "toastReportCopied": "📋 Tek nokta TG-20 indirgeme raporu panoya kopyalandı.",
    "batchSummary": "✅ Toplam <strong>{count}</strong> nokta hesaplandı (Ortalama N: <strong>{avgN} m</strong>)",
    "logBatchReduced": "🇹🇷 [TG-20 TOPLU İNDİRGEME] {count} nokta TG-20 ile indirgendi.",
    "logPrintOpened": "🖨️ [TG-20 RAPOR] Yazdırılabilir indirgeme raporu yeni pencerede açıldı.",
    "toastUndulationCopied": "📋 Ondülasyon değeri panoya kopyalandı: {val}",
    "gridNodeTooltip": "TG-20 Izgara Düğümü ({id}): N = +{n}m",
    "logInterpolation4Pt": "🌊 [TG-20 4-NOKTA ENTERPOLASYONU] {lat}°K, {lng}°D ➔ N: {n} | Düğümler: NW(+{nwN}m %{nwW}), NE(+{neN}m %{neW}), SW(+{swN}m %{swW}), SE(+{seN}m %{seW})",
    "headerTitle": "HGM TG-20 Türkiye Hibrit Jeoidi & Kot İndirgeme Stüdyosu",
    "badgeHybrid": "🇹🇷 Harita Genel Müdürlüğü TG-20",
    "badgeTudka": "🏔️ TUDKA-99 Nivelman Ağı",
    "badgeResolution": "📐 1' x 1' Grid (~1.8 km)",
    "tabSingleReduction": "Tek Nokta Kot İndirgeme",
    "tabBatchReduction": "Toplu Dosya İndirgeme (.TXT / .CSV / .NCN)",
    "tabGridMap": "Enterpolasyon & Jeoit Grid Haritası",
    "lblInputLat": "WGS-84 Enlem (Lat / Dec.Deg):",
    "lblInputLon": "WGS-84 Boylam (Lon / Dec.Deg):",
    "lblInputEllipsoidH": "Elipsoit Kotu (h / metre):",
    "btnReduceSingle": "🏔️ TG-20 İndirge (H = h - N)",
    "btnCopySingleReport": "📋 İndirgeme Raporunu Kopyala",
    "batchTitle": "Toplu Nokta Kot İndirgeme (H = h - N)",
    "batchDesc": "Nokta listesini (NoktaNo Enlem Boylam Kot) yapıştırın veya dosya seçin:",
    "btnReduceBatch": "Toplu Kot İndirgeme Yap",
    "btnDownloadBatchReport": "📄 Resmi Rapor (.TXT) İndir",
    "btnPrintBatchReport": "🖨️ Yazdırılabilir Rapor",
    "gridMapTitle": "TG-20 Jeoit Haritası & Enterpolasyon Analizörü",
    "lblMapClickHint": "Haritada bir noktaya tıklayarak 4 komşu grid düğümünü ve enterpolasyonu inceleyin.",
    "tabReductionTools": "1. Kot İndirgeme Araçları",
    "tabReductionToolsSub": "Tek & Toplu Çözüm",
    "tabInteractiveMap": "2. İnteraktif Jeoit Haritası",
    "tabInteractiveMapSub": "Noktasal Ondülasyon (N)",
    "singleReductionCardTitle": "Tek Nokta Hızlı Kot İndirgeme (WGS-84)",
    "badgeHgmOfficial": "🇹🇷 HGM 2020 Resmi",
    "lblLatWgs84": "🌐 Enlem (Latitude):",
    "lblLonWgs84": "🌐 Boylam (Longitude):",
    "lblHgtWgs84": "📐 Elipsoit Kotu (h / m):",
    "guideCardTitle": "Türkiye Jeoit & Undülasyon Rehberi",
    "badgeGridCount": "492.991 Grid"
  },
  "cadastre": {
    "toastFormatDetected": "🔍 Format Algılandı: {name}",
    "toastTxtDownloaded": "💾 koordinatlar.txt başarıyla indirildi.",
    "toastTg20Applied": "🇹🇷 TG-20 Jeoit İndirgemesi uygulandı (H = h - N).",
    "toastTg20Reverted": "Elipsoit Kotlarına geri dönüldü.",
    "toastNeedGnssFile": "⚠️ Önce bir RW5 / GNSS veri dosyası yükleyip analiz edin.",
    "toastTg20TxtDownloaded": "📄 TG-20 İndirgeme Raporu (.TXT) başarıyla indirildi.",
    "toastPrintWindowOpened": "🖨️ TG-20 Kadastro Raporu yazdırma penceresi açıldı.",
    "toastPopupBlocked": "Açılır pencere engellendi. Lütfen tarayıcı izinlerini kontrol edin.",
    "toastSelectValidGnssFile": "Lütfen analiz edilecek bir GNSS veri dosyası seçin (.rw5, .raw, .csv, .txt, .jxl).",
    "toastNoDualReadingsWarning": "ℹ️ Dosyada çift okuma bulunmadığından Resmi Ölçü Karnesi oluşturulamaz. Lütfen 'TG-20 PDF Raporu' butonunu kullanın.",
    "formatLabel": "Format: {name}",
    "barGeoidValue": "TG-20 Jeoid: N={val}m",
    "barGeoidDefault": "HGM TG-20 Jeoidi",
    "badgePassDual": "ÇİFT OKUMA (≤ 7cm)",
    "badgeFailLimit": "LİMİT AŞILDI",
    "badgeSingleWarn": "Tekil Ölçü (2. Okuma Yok)",
    "noPointsToDisplay": "Görüntülenecek ölçüm noktası bulunamadı.",
    "countDualReadings": "{count} Çift Okuma",
    "logFormatDetected": "🔍 [OTOMATİK FORMAT TESPİTİ] '{filename}' içeriği analiz edildi -> {brand}",
    "toastCoordListCopied": "📋 Koordinat listesi panoya kopyalandı.",
    "logTg20Active": "🇹🇷 [TG-20 İNDİRGEME] Aktif: Tüm çift okuma ve tekil kotlar HGM TG-20 ile H = h - N seviyesine indirgendi.",
    "logTg20Inactive": "🇹🇷 [TG-20 İNDİRGEME] Devre Dışı: Elipsoit kotlarına geri dönüldü.",
    "logTg20ReportDownloaded": "📄 [TG-20 RAPOR] GPSFormat_TG20_Indirgeme_Raporu.txt başarıyla indirildi.",
    "logPrintOpened": "🖨️ [TG-20 RAPOR] Yazdırılabilir kadastro raporu pencerede açıldı.",
    "logReadingFile": "📂 GNSS Veri Dosyası Okunuyor: {name}...",
    "progReadingFile": "Dosya Okunuyor...",
    "logDefaultFileLoading": "📂 Örnek dosya yükleniyor...",
    "progDefaultFileLoading": "Varsayılan Dosya Yükleniyor...",
    "logFormatScanning": "🔍 Format taranıyor | Aynı Nokta Eşiği: {thresh} m | Tolerans: {tol} cm | Min. Zaman: {time} dk...",
    "progParsingProjecting": "Ayrıştırma ve Projeksiyon Hesaplanıyor...",
    "barGeoidOutOfScope": "TG-20 (Dışında)",
    "tooltipNoDualReadings": "Bu dosyada çift okuma bulunamadı (Tüm noktalar tekil).",
    "tooltipOfficialKarneDisabled": "Çift okuma ölçüsü bulunmadığından Resmi Ölçü Karnesi pasiftir. TG-20 PDF Raporu alabilirsiniz.",
    "tooltipDualCount": "{count} adet çift okuma eşleşti.",
    "progCompleted": "Tamamlandı",
    "logAnalysisSuccess": "✨ [BAŞARILI] '{brand}' formatında {count} ham ölçü analiz edildi.",
    "logProjectionInfo": "🌐 Projeksiyon: ITRF-96 TM 3° Dilim {meridian}° E | {dualStatus}",
    "dualStatusMatched": "{count} Çift Okuma Eşleşti.",
    "dualStatusNone": "Çift Okuma Yok (Tüm noktalar tekil ölçü).",
    "timeDiffMin60Pass": "{time} (≥60 dk ✓)",
    "timeDiffMin60Fail": "{time} (<60 dk ⚠️)",
    "tooltipBohhbuyArticle28": "BÖHHBÜY Madde 28: İki ölçüm arasında en az 60 dakika (1 saat) fark olmalıdır.",
    "mapTitle": "RTK & Kadastro Nokta Haritası",
    "badgeCrsDefault": "ITRF-96 TM 3°",
    "badgePointCount": "{count} Nokta",
    "btnFit": "Sığdır",
    "btnResetView": "Türkiye Geneli",
    "btnLabels": "Nokta No",
    "btnRoute": "Güzergah",
    "filterAll": "Tümü",
    "filterDualPass": "Çift Okuma (≤7cm)",
    "filterDualFail": "Fark Aşımı (>7cm)",
    "filterSingle": "Tekil (2. Okuma Yok)",
    "hudTelemetryTitle": "Seçili Nokta Telemetrisi:",
    "hudNoPoint": "Haritadan veya tablodan bir nokta seçin",
    "hudNoSurvey": "Ölçüm Yok",
    "hudStatusPass": "Çift Okuma (Uygun)",
    "hudStatusFail": "Limit Aşımı (>7cm)",
    "hudStatusSingle": "Tekil Ölçüm",
    "hudQuality": "RMS: {rms} m | PDOP: {pdop}",
    "hudSatsTime": "SAT: {sats} | {time}",
    "hudBtnCopy": "Kopyala",
    "hudBtnFocus": "Odaklan",
    "toastPointFocused": "📍 {point} noktasına odaklanıldı.",
    "toastPointCopied": "📋 {point} koordinatları panoya kopyalandı.",
    "exportTitle": "Dışa Aktar & Raporla:",
    "btnExportDxf": ".DXF İndir",
    "btnExportKml": ".KML İndir",
    "btnExportNcn": ".NCN İndir",
    "btnExportCsv": ".CSV İndir",
    "btnExportPdf": "Çift Okuma PDF Raporu",
    "routeTitle": "Ölçüm Güzergahı ({count} Nokta)",
    "headerTitle": "RTK & GNSS Ham Veri Çözümleme Stüdyosu",
    "badgeTusaga": "⚡ TUSAGA-Aktif & BÖHHBÜY",
    "badgeTg20": "🇹🇷 TG-20 Jeoidi",
    "badgeNcnDxf": "📐 Netcad .NCN & DXF",
    "lblGnssFile": "GNSS / RTK Ham Gözlem Dosyası (.rw5, .raw, .jxl, RTK .csv):",
    "fileSelectOrDrag": "Dosya Seç veya Sürükle...",
    "lblSamePointThreshold": "Aynı Nokta Eşiği:",
    "lblTolerance": "Hata Sınırı (dS):",
    "lblMinTime": "Min. Zaman (dt):",
    "btnUploadSolve": "Yükle & Çöz",
    "lblTg20Reduction": "🇹🇷 TG-20 Jeoit İndirgemesi (H = h - N)",
    "badgeTg20Active": "TG-20 Aktif",
    "lblTg20StatusHint": "(Ortalama noktalara HGM TG-20 jeoidi uygulanır ve çıktılar ortometrik kotla üretilir)",
    "btnPdfReport": "🖨️ TG-20 PDF Raporu Al",
    "tabRtkTable": "RTK Ham Ölçüm Tablosu",
    "tabGcpKarne": "Çift Okuma & Karne",
    "tabCoordsTransfer": "Koordinat Formatları & Aktarım",
    "tabMapView": "Harita & Nokta Dağılımı",
    "rtkTableTitle": "RTK Detaylı Ham GNSS Ölçüm Tablosu",
    "btnPdfReportShort": "🖨️ TG-20 PDF Raporu",
    "btnNetcadNcn": "Netcad .NCN",
    "btnRtkCsv": "RTK CSV",
    "btnAutocadDxf": "AutoCAD .DXF",
    "thPointNo": "Nokta No",
    "thDate": "Tarih",
    "thTime": "Saat",
    "thStatus": "Durum",
    "thRms": "RMS",
    "thPdop": "PDOP",
    "thSats": "Uydu",
    "thSolution": "Çözüm",
    "thTargetDiff": "Hedef Fark",
    "thTimeDiff": "Süre Farkı",
    "gcpMasterTitle": "Resmi Çift Okuma & Ölçü Karnesi",
    "gcpMasterDesc": "BÖHHBÜY Madde 28 uyarınca en az 60 dk arayla yapılan 2 bağımsız RTK ölçümünün limit denetimi (Tolerans ≤ 7 cm).",
    "kpiTotalObs": "Toplam Ölçü",
    "kpiDualPairs": "Çift Okuma",
    "kpiLimitExceeded": "Fark Aşımı",
    "kpiSingleObs": "Tekil Ölçü",
    "filterPass": "Çift Okuma (≤ 7cm)",
    "filterFail": "Fark Aşımı (> 7cm)",
    "btnOfficialKarnePdf": "📋 Resmi Ölçü Karnesi (PDF)",
    "coordsExportTitle": "Koordinat Formatları & Dışa Aktarım",
    "coordsExportDesc": "Çözümlenen koordinatları farklı GIS/CAD yazılımlarına uygun formatlarda indirin veya panoya kopyalayın.",
    "btnCopyCoords": "📋 Koordinatları Kopyala",
    "btnDownloadTxt": "💾 koordinatlar.txt İndir",
    "bannerStaticTitle": "Yüklenen Dosya Salt Koordinat Listesidir (Ham GNSS Oturumu Değildir)",
    "bannerStaticDesc": "Bu dosyada GNSS oturum zaman damgaları, uydu ve RMS/PDOP telemetrisi bulunmamaktadır. Koordinatlar ve coğrafi enlem/boylam başarıyla listelenmiştir; ancak BÖHHBÜY Madde 28 Çift Ölçü Karnesi için alıcıdan aktarılmış ham gözlem oturum dosyası (.rw5, .raw, .jxl veya RTK .csv) yüklenmelidir. Format veya projeksiyon dönüşümü için ilgili modüllere geçebilirsiniz.",
    "btnGoConverter": "Format Dönüştürücüye Git",
    "btnGoGeodesy": "Koordinat Dönüşümüne Git",
    "alertNoPairsDesc": "Bu dosyada ikinci kez ölçülen çift nokta bulunmamaktadır. Tüm noktalar tekil olarak listelenmiştir.",
    "alertDownloadSingleTg20Pdf": "Tekil Noktaları TG-20 PDF Olarak İndirebilirsiniz",
    "logStaticDatasetDetected": "ℹ️ [BİLGİ] Yüklenen dosya salt koordinat listesidir (oturum zaman damgası ve GNSS telemetrisi bulunmamaktadır).",
    "toastStaticCoordsLoaded": "ℹ️ Salt koordinat listesi yüklendi. Çift ölçü karnesi için .rw5/.raw/.jxl ham gözlem oturumları gereklidir."
  },
  "geodesy": {
    "toastSamplePointsLoaded": "🧪 Örnek 4 adet 3B ITRF & ED50 kontrol noktası yüklendi.",
    "toastNeedCommonPoints": "Lütfen en az 3 adet 3B ortak kontrol noktası girin.",
    "toastMin3CommonPoints": "En az 3 geçerli 3B nokta gereklidir. (Okunan: {count})",
    "toast7ParamSuccess": "✨ 7 Parametre hesaplandı ve aktif edildi! (m₀ = {m0} cm)",
    "toast7ParamError": "❌ 7 Parametre hesabı başarısız: {err}",
    "toastInvalidCoords": "Lütfen geçerli 1. ve 2. koordinat değerlerini girin.",
    "toastTransformSuccess": "📐 Koordinat dönüşümü tamamlandı.",
    "toastClickTransformFirst": "Lütfen önce 'Hassas Dönüştür' butonuna basın.",
    "toastTransferredToTg20": "🏔️ Nokta TG-20 Jeoid Modeline aktarıldı ve ortometrik kotu hesaplandı!",
    "toastTemplateSelected": "⚡ Şablon Seçildi: {name}",
    "toastProjectionsSwapped": "🔄 Dosya Kaynak ve Hedef projeksiyonları değiştirildi.",
    "toastBatchLoaded": "📂 '{name}' içeriği yüklendi ({size} KB).",
    "toastNeedCoordText": "Lütfen dönüştürülecek koordinat metnini yapıştırın veya dosya seçin.",
    "toastInvalidCoordLines": "Geçerli koordinat satırı tespit edilemedi.",
    "toastBatchConverted": "✨ {count} nokta [{from} ➔ {to}] dönüştürüldü!",
    "toastNoPointsToExport": "Dışa aktarılacak nokta bulunamadı.",
    "toastNoConvertedList": "Dönüştürülmüş nokta listesi bulunamadı.",
    "toastTransferredBatchTg20": "✨ {count} nokta TG-20 sekmesine aktarıldı ve ortometrik kot hesabı yapıldı!",
    "toastNeedDnsContent": "⚠️ Lütfen geçerli bir .DNS dosya içeriği girin.",
    "toastDnsActivated": "✨ Netcad .DNS parametreleri aktif edildi! Şimdi noktalarınızı dönüştürebilirsiniz.",
    "toastDnsReadError": "❌ DNS dosyası okunamadı: {err}",
    "toastSample2dLoaded": "🧪 Örnek 4 adet ortak kontrol noktası yüklendi.",
    "toastNeedMin2CommonPoints": "⚠️ Lütfen en az 2 ortak kontrol noktası girin.",
    "toastHelmertSuccess": "✨ 2D Helmert çözüldü! m0 = {m0} cm",
    "toastHelmertError": "❌ Helmert çözülemedi: {err}",
    "toastNeedDnsOrSolveFirst": "⚠️ Lütfen önce .DNS dosyasını yükleyin veya ortak noktalardan parametreleri çözün.",
    "toastNeedPointListToConvert": "⚠️ Lütfen dönüştürülecek nokta listesini girin.",
    "toastBatchHelmertConverted": "✨ {count} nokta Helmert ile yeni sisteme dönüştürüldü!",
    "lblEastingM": "Sağa Değer (Y / Easting - m):",
    "lblNorthingM": "Yukarı Değer (X / Northing - m):",
    "lblHeightM": "Kot / Yükseklik (h / Z - m):",
    "lblLatDeg": "Enlem (Lat / Dec.Deg):",
    "lblLonDeg": "Boylam (Lon / Dec.Deg):",
    "lblEllipsoidHM": "Elipsoit Kotu (h / m):",
    "lblCartesianX": "Kartezyen X (m):",
    "lblCartesianY": "Kartezyen Y (m):",
    "lblCartesianZ": "Kartezyen Z (m):",
    "m0Summary": "✅ m₀: <strong>{m0} cm</strong> ({count} Nokta)",
    "toastTransformCopied": "📋 Dönüşüm sonucu panoya kopyalandı.",
    "toastTg20FormatCopied": "📋 TG-20 Formatında Kopyalandı (Enlem Boylam Kot)",
    "batchSummaryHtml": "✨ <strong>{count}</strong> adet nokta dönüştürüldü [{from} ➔ {to}].",
    "toastTg20BatchCopied": "📋 {count} nokta TG-20 formatında kopyalandı (NoktaNo Enlem Boylam Kot).",
    "dnsBadge": "DNS Dosyası",
    "dnsParams": "Netcad .DNS Parametreleri",
    "dnsFileActivated": "{name} Aktif Edildi",
    "lblLatEnlem": "Lat / Enlem",
    "lblLonBoylam": "Lon / Boylam",
    "logDnsLoaded": "📄 [DNS YÜKLENDİ] Netcad .DNS parametreleri başarıyla yüklendi (a={a}, b={b}, dy={dy}, dx={dx})",
    "helmertFromPoints": "<i class=\"fa-solid fa-list-check\" style=\"color: var(--emerald-400);\"></i> Ortak Kontrol Noktalarından Hesaplandı ({count} Nokta)",
    "logHelmertSolved": "📐 [HELMERT 2D] {count} ortak nokta ile çözüldü. m0 = {m0} cm, dm = {dm} ppm",
    "resSource": "Kaynak: {name}",
    "resInput": "Girdi: {c1}, {c2}, h={h} m",
    "resTarget": "Hedef: {name}",
    "resResult": "Sonuç: {res}",
    "resZoneInfo": "Dilim Bilgisi: DOM={lon0}°, Dilim={zone}",
    "resDatumTransition": "Datum Geçişi: {from} ➔ {to}",
    "resGeoValue": "Coğrafi Değer: {lat}, {lon}",
    "headerTitle": "Jeodezik Koordinat Dönüşümü & Helmert Stüdyosu",
    "badgeBohhbuy": "⚡ BÖHHBÜY Standart",
    "badge7Param": "🌐 7 Parametre / Datum",
    "badgeHelmert": "📐 Netcad .DNS & 2D Helmert",
    "tabSinglePoint": "Tek Nokta Dönüşümü",
    "tabBatchConversion": "Toplu Dosya Dönüşümü",
    "tabHelmert2d": "2B Helmert & Netcad .DNS",
    "tabDatum7Param": "3B Datum & 7 Parametre",
    "lblSourceCrs": "Kaynak Koordinat Sistemi:",
    "lblTargetCrs": "Hedef Koordinat Sistemi:",
    "btnTransform": "Hassas Dönüştür",
    "btnSendToTg20": "🏔️ TG-20 Jeoit Sekmesine Aktar",
    "lblBatchSource": "1. Kaynak Projeksiyon:",
    "lblBatchTarget": "2. Hedef Projeksiyon:",
    "btnSwapProjections": "Kaynak ve Hedefi Değiştir",
    "lblBatchInput": "Dönüştürülecek Koordinatlar (.txt, .csv, .ncn veya yapıştırın):",
    "btnBatchConvert": "Toplu Dönüştür",
    "btnExportNcnBatch": "Netcad .NCN İndir",
    "btnExportCsvBatch": "CSV İndir",
    "btnExportDxfBatch": "AutoCAD .DXF İndir",
    "btnBatchToTg20": "🏔️ Toplu TG-20 İndirgemesine Aktar",
    "dnsTitle": "Netcad .DNS Parametreleri & 2B Helmert Lokal Benzerlik",
    "dnsDesc": "Ortak noktalardan 2B Helmert benzerlik parametrelerini çözün veya mevcut .DNS dosyasını yükleyin.",
    "btnLoadDnsFile": "Netcad .DNS Dosyası Yükle",
    "btnSolveHelmert": "Ortak Noktalardan Helmert Çöz",
    "btnApplyDnsBatch": "Noktaları Dönüştür",
    "datumTitle": "3B Bursa-Wolf / 7 Parametre Datum Dönüşümü",
    "datumDesc": "ITRF-96 (TUREF) ile ED-50 datumları arasında 3B benzerlik parametrelerini hesaplayın ve uygulayın.",
    "btnSolve7Param": "7 Parametre Hesapla",
    "btnActivate7Param": "Parametreleri Aktif Et",
    "badgeTurefEd50": "🇹🇷 TUREF / ITRF-96 & ED-50",
    "geodeticInfoLabel": "Jeodezik Bilgi:",
    "dxLabel": "dX (m):",
    "dyLabel": "dY (m):",
    "dzLabel": "dZ (m):",
    "rxLabel": "rX (sn):",
    "ryLabel": "rY (sn):",
    "rzLabel": "rZ (sn):",
    "scaleLabel": "Scale (ppm):",
    "btnCalcFrom3dPoints": "+ 3B Ortak Noktalardan Hesapla",
    "btnSample4Points": "🧪 Örnek 4 Nokta Yükle",
    "paramAutoCalcTitle": "📐 Elinizdeki 3B Ortak Kontrol Noktalarından 7 Parametreyi Otomatik Hesapla",
    "paramBursaWolfCustom": "⚙️ Bölgesel / Projeye Özel 7 Parametre Girişi (İsteğe Bağlı Bursa-Wolf)"
  },
  "map": {
    "toastZoomInForScale": "🔍 {scale} pafta grid çizgilerini görüntülemek için haritada yakınlaşınız.",
    "toastGridOpened": "🗺️ 1/{scale} Grid Çizgileri açıldı.",
    "toastDomLoaded": "🌐 DOM 3° Dilimleri (Dilim 9 - 15) yüklendi.",
    "toastDomClosed": "🌐 DOM sınırları kapatıldı.",
    "toastSearchNeedPafta": "Lütfen aramak istediğiniz pafta adını yazın (Örn: F22, H29-b, K18-c2).",
    "toastPaftaNotFound": "⚠️ '{name}' pafta formatı bulunamadı. Örn: 'F22', 'H29-a', 'K18-c2'",
    "toastPaftaFocused": "🎯 {name} Paftasına odaklanıldı ({scale})",
    "toastDownloaded": "💾 {name} indirildi.",
    "toastInvalidFormat": "⚠️ Lütfen .KML, .KMZ veya .GeoJSON uzantılı bir dosya yükleyin.",
    "toastParsing": "📂 '{name}' okunuyor ve çözümleniyor...",
    "toastNoGeometry": "⚠️ Dosya içinde geçerli nokta, çizgi veya kapalı alan geometrisi bulunamadı.",
    "toastInvalidBounds": "⚠️ Geometri koordinatları geçerli bir harita sınırına dönüştürülemedi.",
    "toastIntersectingPaftaCalculated": "✨ '{name}' yüklendi ve 1/25 000 temas eden paftalar hesaplandı.",
    "toastProcessError": "❌ Dosya işlenemedi: {err}",
    "toastNoIntersectingPafta": "⚠️ İndirilecek temas eden pafta bulunamadı.",
    "toastPaftaBoundariesDownloaded": "💾 {count} adet pafta sınırı {format} olarak indirildi.",
    "toastIntersectingDownloaded": "💾 {name} ({count} Pafta) indirildi.",
    "toastNoDataToExport": "⚠️ Haritada dışa aktarılacak seçili pafta, içe aktarılmış KML veya nokta verisi bulunmuyor.",
    "layerGoogleHybrid": "🛰️ Google Hibrit (Detaylı Uydu + Yerleşim)",
    "layerGoogleStreets": "🗺️ Google Yol & Şehir Haritası",
    "layerGoogleSatellite": "🌍 Google Saf Uydu (Yazısız)",
    "layerEsriTopo": "⛰️ Esri Topoğrafya & Coğrafi Detay",
    "layerEsriSat": "📡 Esri Yüksek Çözünürlüklü Uydu",
    "layerGoogleTerrain": "⛰️ Google Arazi & Yükselti",
    "layerCartoDark": "🌙 CartoDB Karanlık Detay",
    "layerCartoLight": "☀️ CartoDB Aydınlık Detay",
    "officialDb": "Resmi HGM DB",
    "calculated": "Hesaplanan",
    "paftaNamePrefix": "Pafta Adı: {name}",
    "stationPos": "GNSS İstasyon Konumu",
    "lblHeightCorr": "Yükseklik Düz. (Δh):",
    "lblNorthCorr": "Yukarı (ΔX):",
    "lblDomZone": "DOM {dom}° (Dilim {zone})",
    "headerTitle": "Türkiye Standart Pafta İndeksi & Harita",
    "btnImportKml": "KML / KMZ İçe Aktar",
    "toolbarTitle": "Türkiye Pafta Katmanı:",
    "btnPafta100k": "1/100 000",
    "btnPafta50k": "1/50 000",
    "btnPafta25k": "1/25 000",
    "btnPafta5k": "1/5 000",
    "btnPafta2k": "1/2 000",
    "btnPafta1k": "1/1 000",
    "btnPaftaOff": "Paftaları Kapat",
    "btnToggleDom": "DOM 3° Dilimleri",
    "searchPlaceholder": "Pafta Ara (Örn: F22, H29-b, K18-c2)...",
    "btnSearch": "Bul",
    "btnDownloadPaftaKml": "KML İndir",
    "btnDownloadIntersecting": "Kesişen Paftaları İndir",
    "layerSelectorTitle": "Altlık Harita Katmanı:",
    "datumCorrectionTitle": "🇹🇷 HGM Datum & Yükseklik Düz."
  },
  "rinex": {
    "toastPpkCoverage": "🛰️ PPK Kapsama Analizi: %{percent} Örtüşme",
    "toastPpkError": "❌ PPK Analiz Hatası: {err}",
    "toastFileDownloaded": "💾 {name} indirildi.",
    "toastObsNotFound": "Gözlem dosyası bulunamadı.",
    "toastGpsNavNotFound": "GPS Navigasyon dosyası bulunamadı.",
    "toastGloNavNotFound": "GLONASS Navigasyon dosyası bulunamadı.",
    "toastZipPrepared": "📦 {name} ZIP arşivi hazırlandı ve indiriliyor.",
    "toastMultiGnssZipPrepared": "📦 {name} Multi-GNSS ZIP arşivi hazırlandı ve indiriliyor.",
    "toastPpkAnalysisSuccess": "✨ PPK Analizi: %{percent} Kapsama ({baseline} km baz)",
    "toastPpkAnalysisError": "❌ PPK analizi yapılamadı: {err}",
    "toastBaseLoaded": "🏛️ Sabit İstasyon yüklendi: {name}",
    "toastRoverLoaded": "🚁 Gezici yüklendi: {name}",
    "toastAnalyzing": "🔍 '{name}' analiz ediliyor...",
    "toastAnalysisSuccess": "✨ '{name}' başarıyla analiz edildi (Ort. {sats} Uydu).",
    "toastAnalysisError": "❌ Kalite analizi yapılamadı: {err}",
    "filterActive": "Filtre Aktif",
    "filterDisabled": "Filtre Kapalı",
    "badgeBase": "Sabit",
    "badgeRover": "Gezici",
    "labelDate": "Tarih: {date}",
    "unitHour": "sa",
    "unitMinute": "dk",
    "unitSecond": "sn",
    "unitHourFile": "{count} saat",
    "unitFile": "{count} dosya",
    "btnProcessDownload": "İşle & İndir",
    "logBaseLoaded": "🏛️ [SABİT RINEX] '{name}' yüklendi ({marker}).",
    "logRoverLoaded": "🚁 [GEZİCİ RINEX] '{name}' yüklendi ({marker}).",
    "formatObsYyo": "Standart Yıl Uzantılı Gözlem (.{yy}o - RINEX {ver})",
    "formatObsExt": "Doğrudan .OBS Uzantılı Gözlem (.obs - RINEX {ver})",
    "formatNavYyn": "GPS Navigasyon / Seyir (.{yy}n)",
    "formatNavExt": "Doğrudan .NAV Uzantılı GPS Seyir (.nav)",
    "formatNavYyg": "GLONASS Navigasyon / Seyir (.{yy}g)",
    "formatHatanakaYyd": "Hatanaka Sıkıştırılmış Gözlem (.{yy}d)",
    "formatAllZip": "Gözlem + Navigasyon Tam Paket (.ZIP)",
    "formatObs83": "Standart 8.3 Gözlem Dosyası (.{yy}o - RINEX {ver})",
    "formatRnxObs": "Modern IGS Uzun İsimli Gözlem (.rnx - RINEX {ver})",
    "formatRnxNavMix": "Multi-GNSS Karma Seyir (.{yy}p / _MN.rnx)",
    "formatHatanakaCrx": "Hatanaka Sıkıştırılmış Multi-GNSS (.crx)",
    "formatAllZipMulti": "Tüm Multi-GNSS Dosyaları Paketi (.ZIP)",
    "headerTitle": "RINEX Studio & Oturum Düzenleyici",
    "badgeMultiStation": "⚡ Çoklu İstasyon",
    "badgeFreqPrune": "🛰️ Frekans Ayıklama",
    "badgeRinexVersions": "🔄 RINEX 2/3/4",
    "dropzoneTitle": "RINEX Gözlem ve Navigasyon Dosyalarını Yükleyin",
    "dropzoneDesc": "Saatlik veya parçalı .26O, .26N, .26G, .OBS, .NAV, .rnx dosyalarını sürükleyin",
    "btnSelectFiles": "Dosyaları Seç",
    "settingsTitle": "Filtreleme & Çıktı Ayarları",
    "alertPruningNotice": "Tüm tespit edilen sistemler varsayılan olarak seçilidir. İşaretini (tikini) kaldırdığınız uydular, frekanslar veya gözlem tipleri sonuç dosyasından ayıklanır.",
    "lblDetectedConstellations": "1. Tespit Edilen Uydu Sistemleri",
    "lblDetectedConstellationsHint": "(Seçimi kaldırarak ayıklayabilirsiniz):",
    "lblDetectedBands": "2. Tespit Edilen Frekans & Taşıyıcı Bantları",
    "lblDetectedBandsHint": "(Seçimi kaldırarak ayıklayabilirsiniz):",
    "lblDetectedObsTypes": "3. Tespit Edilen Gözlem Tipleri",
    "lblDetectedObsTypesHint": "(Seçimi kaldırarak ayıklayabilirsiniz):",
    "lblTimeWindowCrop": "Zaman Aralığı & Kesme (Time Window Crop):",
    "lblCropStart": "Kesme Başlangıcı (UTC):",
    "lblCropEnd": "Kesme Bitişi (UTC):",
    "btnCropAll": "Tümü",
    "btnCrop1h": "1 Saat",
    "btnCropFirst2h": "İlk 2 Saat",
    "btnCropLast2h": "Son 2 Saat",
    "lblTargetVersion": "1. Hedef Sürüm / Standart:",
    "lblTargetFormat": "2. Çıktı Dosya Formatı:",
    "lblDecimationStep": "3. Örnekleme Hızı:",
    "secGroupsTitle": "Tespit Edilen İstasyon Oturum Grupları",
    "btnMergeAllZip": "Tüm Grupları Birleştir & İndir (.ZIP)",
    "thGroupId": "Grup ID",
    "thStation": "İstasyon",
    "thYear": "Yıl",
    "thDoy": "DOY (Yılın Günü)",
    "thObs": "Gözlem (OBS)",
    "thGpsNav": "GPS Nav (.N)",
    "thGloNav": "GLONASS Nav (.G)",
    "thAction": "İşlem",
    "ppkTitle": "Sabit & Gezici (Base - Rover) PPK Kapsama & Örtüşme Analizi",
    "ppkBadge": "🛰️ PPK Oturum & Baz Analizi",
    "lblBaseStation": "🏛️ 1. Sabit İstasyon (Base / TUSAGA-Aktif RINEX):",
    "lblBaseSelectOrDrag": "Sabit RINEX Seç veya Sürükle...",
    "lblRoverStation": "🚁 2. Gezici İstasyon (Rover / İHA / RTK RINEX):",
    "lblRoverSelectOrDrag": "Gezici RINEX Seç veya Sürükle...",
    "titlePpkSuccess": "PPK Analizi Tamamlandı",
    "descPpkSuccess": "Gezici oturumu analiz edildi.",
    "lblBaseSessionUtc": "🏛️ Sabit Oturumu (UTC):",
    "lblRoverSessionUtc": "🚁 Gezici Oturumu (UTC):",
    "lblOverlapDuration": "⏱️ Ortak Örtüşme Süresi:",
    "lblApproxBaseline": "📏 Yaklaşık Baz Mesafesi:",
    "lblCommonSystems": "🛰️ Ortak Sistemler:",
    "lblVisualTimeline": "📊 Görsel Zaman Şeridi & Kapsama Dağılımı:",
    "lblBaseShort": "Sabit:",
    "lblRoverShort": "Gezici:",
    "qualityTitle": "📊 RINEX Sinyal Kalite, Uydu Görünürlük & Epoch Çizelgesi",
    "qualityBadge": "📡 Çoklu GNSS Kalite Analizi",
    "qualityPrompt": "İncelemek istediğiniz RINEX Gözlem (OBS) dosyasını seçin veya sürükleyin:",
    "btnQualityAnalyze": "OBS Dosyası Analiz Et",
    "statTotalEpochs": "Toplam Epoch:",
    "statSamplingInterval": "Örnekleme Hızı:",
    "statAvgMaxSat": "Ort. / Maks. Uydu:",
    "statScore": "GNSS Kalite Skoru:",
    "timelineChartTitle": "Zaman İçinde Takip Edilen Uydu Sayıları (Epoch Timeline)"
  },
  "core": {
    "exporter": {
      "toastNcnDownloaded": "✅ Netcad .NCN dosyası indirildi ({count} Nokta).",
      "toastCsvDownloaded": "✅ Excel uyumlu CSV dosyası indirildi ({count} Kayıt).",
      "toastKmlDownloaded": "✅ Google Earth KML dosyası indirildi.",
      "toastDxfDownloaded": "✅ AutoCAD / Netcad DXF çizimi indirildi.",
      "toastGeoJsonDownloaded": "✅ GIS GeoJSON verisi indirildi."
    },
    "dragdrop": {
      "toastUnsupported": "⚠️ Desteklenmeyen dosya türü. Kabul edilenler: .{types}",
      "toastRw5Loaded": "📂 '{name}' yüklendi. Hesaplama başlatılıyor...",
      "toastRinexImported": "🛰️ {count} adet RINEX dosyası aktarıldı.",
      "toastTg20Loaded": "🇹🇷 '{name}' TG-20 Jeoidi yüklendi!",
      "toastConverterLoaded": "🔄 '{name}' Format Dönüştürücüye yüklendi!",
      "toastFileDetected": "📂 '{name}' dosyası algılandı."
    },
    "utils": {
      "toastCopyEmpty": "⚠️ Kopyalanacak içerik boş.",
      "toastCopySuccess": "📋 Panoya kopyalandı.",
      "toastCopyError": "❌ Panoya kopyalanamadı. Lütfen metni manuel seçip kopyalayın."
    },
    "navigation": {
      "toastSearchFocus": "🔍 Arama kutusuna odaklanıldı (Esc: Temizle)",
      "toastSearchCleared": "Arama temizlendi.",
      "toastRoutedRtk": "🚀 '{name}' algılandı, RTK & Ham Data modülüne yönlendirildi.",
      "toastRoutedRinex": "🛰️ '{name}' RINEX gözlem dosyası algılandı, RINEX Düzenleyiciye aktarılıyor.",
      "toastRoutedConverter": "🔄 '{name}' algılandı, Format Dönüştürücüye aktarıldı.",
      "toastRoutedGeodesy": "📐 '{name}' koordinat/dönüşüm dosyası algılandı, Koordinat Dönüşümüne aktarıldı.",
      "toastThemeLight": "☀️ Aydınlık tema aktif edildi.",
      "toastThemeDark": "🌙 Koyu tema aktif edildi.",
      "logModuleSwitched": "🚀 [MODÜL BAŞLATILDI] {module} modülüne geçildi."
    }
  },
  "guide": {
    "btnDownloadPdf": "Resmi PDF İndir",
    "headerTitle": "Harita Tools Kullanım & Mühendislik Rehberi",
    "headerDesc": "Saha GNSS ölçümleri, jeodezik hesaplamalar, İHA uçuş planlama ve mevzuat standartları uygulama kılavuzu",
    "badgeUpdated": "Son Güncelleme: 2026",
    "secWorkflow": "1. Modül İş Akışları",
    "secFormulas": "2. Jeodezik Formüller & Standartlar",
    "secFieldTips": "3. Saha GNSS & RTK İpuçları"
  },
  "sidebar": {
    "closeAria": "Menüyü Kapat",
    "subTitle": "Jeodezi & GNSS",
    "secCore": "Temel Araçlar",
    "tabHome": "Ana Sayfa",
    "tabRtk": "RTK & Ham Data",
    "tabRinex": "RINEX Düzenleyici",
    "tabMap": "Pafta İndeksi & Harita",
    "tabConverter": "Format Dönüştürücü",
    "badgeNew": "YENİ",
    "secGeodesy": "Jeodezik Hesap",
    "tabGeodesy": "Koordinat Dönüşümü",
    "tabFlight": "İHA Uçuş & YKN",
    "tabTg20": "TG-20 Jeoit İndirgeme",
    "secLegal": "Mevzuat & Rehber",
    "tabStandards": "Resmi Mevzuat (PDF)",
    "tabGuide": "Kullanım Rehberi",
    "geoStandard": "Jeodezik Standart",
    "sysSync": "Sistem Senkron",
    "datumRef": "Datum / Ref:",
    "geoidModel": "Jeoit Modeli:",
    "projection": "İzdüşüm:",
    "quickUpload": "Hızlı Dosya Yükle",
    "openFile": "Dosya Aç",
    "themeChange": "Tema Değiştir",
    "localClient": "%100 Yerel İstemci",
    "aboutBtn": "Künye",
    "privacyNotice": "Verileriniz tarayıcınızda yerel işlenir, sunucuya aktarılmaz."
  },
  "header": {
    "openMenu": "Menüyü Aç",
    "themeToggle": "Tema Değiştir (Koyu / Açık)",
    "themeTitle": "Tema Değiştir",
    "aboutTooltip": "Proje Künyesi & Bilgi",
    "aboutTitle": "Proje Künyesi",
    "statusReady": "Sistem: Hazır"
  },
  "home": {
    "heroPill": "Harita & Kadastro Mühendislik Araçları",
    "heroTitle": "GNSS & Jeodezik Hesaplama Merkezi",
    "heroDesc": "Tüm GNSS alıcı formatlarını çözümleyin, TUSAGA-Aktif çift okuma karnelerini denetleyin, ITRF-96 TM 3° ve ED-50 dönüşümlerini yapın, HGM TG-20 ile ortometrik kotları elde edin ve Netcad/AutoCAD/PDF çıktılarınızı anında hazırlayın.",
    "heroDropTitle": "Hızlı Dosya İşleme",
    "heroDropSub": "Herhangi bir .rw5, .raw, .csv, .jxl, .o, .rnx, .ncn dosyasını buraya bırakın",
    "heroDropBadge": "Formatı Otomatik Tanır & İlgili Modülü Açar",
    "openModule": "Modülü Aç",
    "openStandards": "Mevzuatı Aç",
    "rtkBadge": "TUSAGA-Aktif & BÖHHBÜY",
    "rtkTitle": "RTK & Ham Data",
    "rtkDesc": "Tüm GNSS alıcılarının ham ölçü (.rw5, .raw, .csv, .txt, .jxl) dosyalarını otomatik okur; TUSAGA-Aktif çift okuma limitlerini (≤7cm, ≥60dk) denetleyip resmi ölçü karnesini üretir.",
    "rtkFeat1": "Evrensel GNSS Desteği",
    "rtkFeat2": "Çift Okuma & Hata Analizi",
    "rtkFeat3": "Netcad .NCN & DXF",
    "flightBadge": "Fotogrametri & İHA",
    "flightTitle": "İHA Uçuş Planlama & YKN",
    "flightDesc": "Akıllı uçuş alanı optimizasyonu, güneş/gölge analizi, canlı meteoroloji ve yol ağına duyarlı YKN üretimi.",
    "flightFeat1": "Akıllı Alan Sadeleştirme",
    "flightFeat2": "Güneş & Canlı Rüzgar",
    "flightFeat3": "Yol Ağına Snap YKN",
    "rinexBadge": "RINEX 2.xx & 3.xx Multi-GNSS",
    "rinexTitle": "RINEX Düzenleyici & Birleştirici",
    "rinexDesc": "Saatlik ve parçalı gözlem dosyalarını tek parça halinde birleştirir, zaman aralığı kırpar, istenmeyen uydu ve frekansları ayıklar.",
    "rinexFeat1": "Multi-GNSS Desteği",
    "rinexFeat2": "Zaman Kesme (Crop)",
    "mapBadge": "1/100K - 1/50K - 1/25K & DOM",
    "mapTitle": "Pafta İndeksi & Harita",
    "mapDesc": "Türkiye standart pafta lejantlarını harita üzerinde interaktif görüntüler; yüklenen koordinat noktalarına göre kesişen paftaları listeler.",
    "mapFeat1": "Otomatik Pafta Bulma",
    "mapFeat2": "3° Dilim DOM Çizgileri",
    "geodesyBadge": "ITRF-96 ⇄ ED-50 & 3°/6°",
    "geodesyTitle": "Koordinat Dönüşümü",
    "geodesyDesc": "3° TM ve 6° UTM projeksiyonları arasında analitik dönüşüm; Netcad .DNS ve 2B Helmert lokal benzerlik dönüşümleri.",
    "geodesyFeat1": "3° ↔ 6° TM/UTM",
    "geodesyFeat2": "Netcad .DNS Çözümü",
    "tg20Badge": "TUDKA-99 Nivelman Ağı",
    "tg20Title": "TG-20 Jeoit İndirgeme",
    "tg20Desc": "GNSS elipsoit kotlarını (h), Harita Genel Müdürlüğü TG-20 Türkiye Hibrit Jeoidi ile resmi ortometrik kota (H = h - N) indirger.",
    "tg20Feat1": "1km Grid Çözünürlüğü",
    "tg20Feat2": "Resmi TG-20 Raporu",
    "converterBadge": "NCZ ⇄ DXF ⇄ KML ⇄ NCN ⇄ GeoJSON",
    "converterTitle": "Format Dönüştürücü & Alan Studio",
    "converterDesc": "Netcad NCZ proje çizimleri, AutoCAD DXF, Google Earth KML/KMZ, NCN ve GeoJSON çift yönlü dönüşümü; noktalardan otomatik kapalı alan üretimi.",
    "converterFeat1": "Netcad NCZ İkili Okuma",
    "converterFeat2": "DXF ⇄ KML/KMZ & NCN",
    "converterFeat3": "Noktalardan Alan Üretme",
    "converterFeat4": "TUREF TM 3° ⇄ WGS84",
    "standardsBadge": "MAPEG • BÖHHBÜY • TKGM (PDF)",
    "standardsTitle": "Resmi Mevzuat & Standartlar",
    "standardsDesc": "BÖHHBÜY, MAPEG Maden İmalat Kılavuzu, TKGM İHA Genelgeleri, HGM TG-20 ve DSİ Şartnamelerinin orijinal resmi PDF dokümanlarını doğrudan görüntüleyin ve indirin.",
    "standardsFeat1": "Doğrudan Resmi PDF Okuyucu",
    "standardsFeat2": "MAPEG, BÖHHBÜY & TKGM",
    "standardsFeat3": "Tek Tıkla İndirme & Portal",
    "trust1Title": "%100 İstemci İçi Güvenlik",
    "trust1Desc": "Verileriniz tarayıcınızda işlenir, harici sunucuya aktarılmaz.",
    "trust2Title": "Yüksek Hızlı Web Workers",
    "trust2Desc": "Büyük RINEX ve GNSS dosyaları arayüzü dondurmadan arka planda işlenir.",
    "trust3Title": "Resmi Standartlar",
    "trust3Desc": "BÖHHBÜY, TKGM, HGM ve Netcad/AutoCAD formatları ile tam uyum."
  },
  "standards": {
    "headerTitle": "Resmi Mevzuat & Standartlar Kütüphanesi",
    "headerDesc": "Harita, Kadastro, Maden ve İHA Mühendisliği resmi yönetmelik, kılavuz ve teknik şartnameleri",
    "badgeTotalPdfs": "Toplam 6 Resmi Doküman",
    "catAll": "Tümü (6)",
    "catBohhbuy": "BÖHHBÜY",
    "catMapeg": "MAPEG",
    "catTkgm": "TKGM & İHA",
    "catHgmdsi": "HGM & DSİ",
    "btnViewModal": "Oku / Önizle",
    "btnDirectDownload": "PDF İndir",
    "titleBohhbuy": "Büyük Ölçekli Harita ve Harita Bilgileri Üretim Yönetmeliği",
    "subBohhbuy": "Resmi Gazete: 25876 • T.C. Mevzuat Bilgi Sistemi",
    "titleMapeg": "Maden İmalat ve Arama Haritaları Standartları Kılavuzu",
    "subMapeg": "Maden ve Petrol İşleri Genel Müdürlüğü",
    "titleTkgmDrone": "İnsansız Hava Araçları (İHA) ile Harita Üretimi Genelgesi",
    "subTkgmDrone": "Tapu ve Kadastro Genel Müdürlüğü (Kadastro Dairesi)",
    "titleTkgmLihkab": "Tescile Esas Harita ve Planlar & LİHKAB Aplikasyon Kılavuzu",
    "subTkgmLihkab": "TKGM Harita Dairesi Başkanlığı"
  },
  "modals": {
    "aboutTitle": "Harita Tools (Beta) Hakkında",
    "aboutSub": "Harita, Jeodezi ve Kadastro Mühendisliği Web Stüdyosu",
    "aboutDesc": "Harita Tools; GNSS ham verilerinin işlenmesi, TUSAGA-Aktif çift okuma denetimi, HGM TG-20 jeoid kot indirgemesi, İHA fotogrametri planlama ve evrensel CAD/GIS format dönüşümlerini tamamen istemci taraflı (offline-first) gerçekleştiren yeni nesil mühendislik platformudur.",
    "aboutFeaturesTitle": "Temel Özellikler & Standartlar",
    "aboutStd1Title": "Jeodezik Projeksiyonlar:",
    "aboutStd1Desc": "TUREF / ITRF-96 TM 3° (DOM 27°-45°), ED-50 Gauss-Kruger 3°/6°",
    "aboutStd2Title": "Sektör Formatları:",
    "aboutStd2Desc": "Netcad (.NCN / .DNS), AutoCAD (.DXF), Google Earth (.KML), RINEX 2.11/3.04",
    "aboutPrivacyTitle": "Tam Gizlilik & Güvenlik Bildirisi",
    "aboutPrivacyDesc": "Bu platformda yüklenen hiçbir dosya, koordinat veya ölçüm verisi harici sunuculara aktarılmaz. Tüm hesaplamalar doğrudan kendi bilgisayarınızın donanım kaynakları üzerinde yerel olarak yapılır.",
    "aboutCopyright": "© 2026 Geografik Harita ve Coğrafi Bilgi Teknolojileri. Tüm hakları saklıdır.",
    "closeModal": "Kapat"
  },
  "ui": {
    "110000030": "1/100.000 (30' × 30') ➔ 1/50.000 (15' × 15') ➔ 1/25.000 (7.5' × 7.5') ➔ 1/5.000 & 1/1.000 standart hiyerarşi.",
    "gaussKruger3": "Gauss-Krüger 3°",
    "eastingSaga": "Easting (Sağa)",
    "northingYukari": "Northing (Yukarı)",
    "ciftOkumaYok": "Çift Okuma Yok:",
    "noktaAdi": "Nokta Adı",
    "1OlcuZaman": "1. Ölçü (Zaman)",
    "2OlcuZaman": "2. Ölçü (Zaman)",
    "zamanFarki": "Zaman Farkı",
    "olcumHataKontrolu": "Ölçüm / Hata Kontrolü",
    "ySaga": "Y (Sağa)",
    "xYukari": "X (Yukarı)",
    "hKot": "H (Kot)",
    "siralama": "Sıralama:",
    "noktanoSagaYYukari": "NoktaNo,Sağa(Y),Yukarı(X),Kot(H) (Virgüllü CSV)",
    "noktanoYukariXSaga": "NoktaNo Yukarı(X) Sağa(Y) Kot(H)",
    "sagaYYukariX": "Sağa(Y) Yukarı(X) Kot(H) NoktaNo",
    "0Nokta": "0 Nokta",
    "sagaYukari": "Sağa / Yukarı:",
    "kotHHN": "Kot (H/h/N):",
    "iSaretiniTikiniKaldirdiginiz": "İşaretini (tikini) kaldırdığınız",
    "secimiKaldirarakAyiklayabilirsiniz": "(Seçimi kaldırarak ayıklayabilirsiniz)",
    "dosyaYuklendigindeIceriktekiUydu": "📂 Dosya yüklendiğinde içerikteki uydu sistemleri otomatik taranıp listelenecektir.",
    "dosyadaMevcutOlanFrekans": "📶 Dosyada mevcut olan frekans bantları burada listelenecektir.",
    "rinex302Multi": "RINEX 3.02 (Multi-GNSS Standart)",
    "rinex304Igs": "RINEX 3.04 (IGS MGEX Standart)",
    "rinex300I": "RINEX 3.00 (İlk v3 Sürümü)",
    "rinex303Qzss": "RINEX 3.03 (QZSS Genişletmesi)",
    "rinex400Yeni": "RINEX 4.00 (Yeni Nesil IGS)",
    "1SaniyeTumu": "1 Saniye (Tümü)",
    "100Kapsama": "%100 Kapsama",
    "95Mukemmel": "%95 Mükemmel",
    "f22Paftasi": "F22 Paftası",
    "yukariDegerDuzX": "Yukarı Değer Düz. (ΔX):",
    "sagaDegerDuzY": "Sağa Değer Düz. (ΔY):",
    "enlemDuz": "Enlem Düz. (Δϕ):",
    "boylamDuz": "Boylam Düz. (Δλ):",
    "projeDosyasi": "📁 Proje Dosyası",
    "temasEdenTumPaftalari": "Temas Eden Tüm Paftaları KML İndir",
    "kotYukseklikHZ": "Kot / Yükseklik (h / Z):",
    "donusumSonucunuGormekIcin": "Dönüşüm sonucunu görmek için 'Hassas Dönüştür' butonuna basın...",
    "2TopluListeDosya": "\"2. Toplu Liste & Dosya Dönüştürücü\"",
    "ayirici": "Ayırıcı:",
    "otomatikAlgila": "🔍 Otomatik Algıla",
    "boslukSpace": "Boşluk (Space)",
    "virgul": "Virgül (,)",
    "noktaliVirgul": "Noktalı Virgül (;)",
    "girdiDosyasininKaynakProjeksiyonu": "📂 Girdi Dosyasının Kaynak Projeksiyonu:",
    "ciktininHedefProjeksiyonu": "🎯 Çıktının Hedef Projeksiyonu:",
    "1Sutun": "1. Sütun:",
    "ySagaEnlem": "Y (Sağa) / Enlem",
    "xYukariBoylam": "X (Yukarı) / Boylam",
    "zKotH": "Z (Kot / h)",
    "2Sutun": "2. Sütun:",
    "3Sutun": "3. Sütun:",
    "4Sutun": "4. Sütun:",
    "kodAciklama": "Kod / Açıklama",
    "yokBos": "Yok / Boş",
    "kaynakKot": "Kaynak Kot",
    "donusen1": "Dönüşen 1",
    "donusen2": "Dönüşen 2",
    "donusenKot": "Dönüşen Kot",
    "3Lokal2bHelmert": "3. Lokal 2B Helmert Dönüşümü (ITRF ⇄ ED-50 & Lokal Projeler)",
    "netcadDnsDosyasi": "📄 Netcad .DNS Dosyası",
    "onemliJeodezikKural3": "⚠️ Önemli Jeodezik Kural (3° Dilim Zorunluluğu):",
    "yalnizca3LikTransverse": "yalnızca 3°'lik Transverse Mercator (TM) dilimlerinde",
    "1DonusumParametreKaynagi": "1. Dönüşüm Parametre Kaynağı:",
    "netcadDnsParametreDosyasi": "Netcad .DNS Parametre Dosyası Seç...",
    "veyaDnsDosyaIcerigini": "veya .DNS dosya içeriğini doğrudan buraya yapıştırın:",
    "2DonusturulecekNoktalarHedef": "2. Dönüştürülecek Noktalar (Hedef Liste):",
    "formatNoktanoYKaynak": "Format: NoktaNo Y_Kaynak X_Kaynak [Kot]",
    "aktifHelmert2dParametreleri": "Aktif Helmert 2D Parametreleri Hazır",
    "yOteleme": "ΔY Öteleme:",
    "xOteleme": "ΔX Öteleme:",
    "olcekKatsayisiM": "Ölçek Katsayısı (m):",
    "donukluk": "Dönüklük (θ):",
    "yDonusen": "Y (Dönüşen)",
    "xDonusen": "X (Dönüşen)",
    "kotZ": "Kot (Z)",
    "1X1Cozunurluk": "1' x 1' Çözünürlük",
    "ortometrikKotElipsoitKotu": "Ortometrik Kot = Elipsoit Kotu - Jeoit Undülasyonu",
    "egeBolgesi": "🌊 Ege Bölgesi:",
    "iCAnadolu": "🌾 İç Anadolu:",
    "bohhbuyStandardindaGnssNivelman": "BÖHHBÜY standardında GNSS nivelman indirgemelerinde TG-20 enterpolasyonu resmi jeoit kotunu üretir.",
    "topluNoktaListesiKadastro": "Toplu Nokta Listesi & Kadastro Çetelesi İndirgeme (WGS-84)",
    "ornekNoktalariYukle": "🧪 Örnek Noktaları Yükle",
    "noktaadiEnlemLatBoylam": "NoktaAdı Enlem(Lat) Boylam(Lon) ElipsoitKotu(h)",
    "iNteraktifTg20": "İnteraktif TG-20 Jeoit Haritası",
    "haritadaTurkiyeSinirlariIcinde": "Haritada Türkiye sınırları içinde herhangi bir yere tıklayın",
    "tg20JeoitOndulasyonu": "TG-20 Jeoit Ondülasyonu (N):",
    "hazir": "Hazır",
    "haritadaBirNoktayaTiklayin": "Haritada bir noktaya tıklayın",
    "alanaSigdir": "Alana Sığdır",
    "yolINdir": "Yol İndir",
    "cizimiBitir": "Çizimi Bitir",
    "iPtal": "İptal",
    "kmlYukle": "KML Yükle",
    "gunes": "Güneş:",
    "golge": "Gölge:",
    "yon": "Yön:",
    "iDeal": "🟢 İdeal",
    "isik": "Işık:",
    "canliEcmwf": "Canlı ECMWF",
    "sinirSadelestirme": "Sınır Sadeleştirme:",
    "hamSinir": "Ham Sınır",
    "sadeSinir": "Sade Sınır",
    "kose": "-- Köşe",
    "alanFarki": "Alan Farkı:",
    "sinirDurumu": "Sınır Durumu:",
    "sadelestirilmisSinir": "Sadeleştirilmiş Sınır",
    "sahaKapsama": "Saha Kapsama:",
    "100AlanKapsama": "%100 Alan Kapsama",
    "manevraAlani": "Manevra Alanı:",
    "donusKoridoruDahil": "Dönüş Koridoru Dahil",
    "ucusSahasi": "Uçuş Sahası:",
    "2YknDagitimiYol": "2. YKN Dağıtımı & Yol Ağı",
    "bohhbuyYolAgi": "BÖHHBÜY + Yol Ağı",
    "maksYknAraligi": "Maks YKN Aralığı:",
    "yknDnOrani": "YKN / DN Oranı:",
    "iCEmniyetMesafesi": "İç Emniyet Mesafesi:",
    "yolBaglantisi": "Yol Bağlantısı:",
    "yknDnNoktalariniDagit": "YKN & DN Noktalarını Dağıt",
    "noktaDagilimi": "Nokta Dağılımı:",
    "yolaBaglama": "Yola Bağlama:",
    "yolAgiAktif": "Yol Ağı Aktif",
    "konumDuzenleme": "Konum Düzenleme:",
    "haritadaTasinabilir": "Haritada Taşınabilir",
    "3IHaGsd": "3. İHA GSD",
    "ucusBindirme": "Uçuş & Bindirme",
    "iHaModeli": "İHA Modeli:",
    "kameraSensor": "Kamera / Sensör:",
    "ucusYuksekligiAgl": "Uçuş Yüksekliği (AGL):",
    "yerOrneklemeGsd": "Yer Örnekleme (GSD):",
    "ucusHizi": "Uçuş Hızı:",
    "bataryaSuresi": "Batarya Süresi:",
    "maksHiz": "Maks. Hız",
    "onerilenHiz": "Önerilen Hız",
    "maksRuzgar": "Maks. Rüzgar",
    "ucusHatYonu": "Uçuş Hat Yönü:",
    "ucusYuksekligi": "Uçuş Yüksekliği:",
    "ucusHatlari": "Uçuş Hatları:",
    "hatAralikM": "-- Hat (Aralık: -- m)",
    "toplamHatUzunlugu": "Toplam Hat Uzunluğu:",
    "kameraCekimi": "Kamera Çekimi:",
    "fotograf": "-- Fotoğraf",
    "tahminiUcusSuresi": "Tahmini Uçuş Süresi:",
    "dosyaDxf": "dosya.dxf",
    "wgs84CografiEnlem": "WGS-84 Coğrafi (Enlem/Boylam)",
    "ed50GaussKruger": "ED-50 Gauss-Krüger 3° (Metre)",
    "akilliAlan": "AKILLI ALAN",
    "noktaSayisi": "Nokta Sayısı",
    "yaziCadMetni": "Yazı / CAD Metni",
    "iNteraktifVektorHarita": "İnteraktif Vektör & Harita Önizleme",
    "donusturDisaAktar": "Dönüştür & Dışa Aktar:",
    "kmzINdir": ".KMZ İndir",
    "ayristirilanGeometriNoktaListesi": "Ayrıştırılan Geometri & Nokta Listesi",
    "0Kayit": "0 Kayıt",
    "noktaGeometriAdi": "Nokta / Geometri Adı",
    "tur": "Tür",
    "ySagaDegerLon": "Y / Sağa Değer (Lon)",
    "xYukariDegerLat": "X / Yukarı Değer (Lat)",
    "metrajAlan": "Metraj / Alan",
    "veriYuklenmediLutfenSol": "Veri yüklenmedi. Lütfen sol panelden bir dosya seçin.",
    "resmiMevzuatHaritaStandartlari": "Resmi Mevzuat & Harita Standartları Kütüphanesi",
    "tkgmIHa": "TKGM İHA",
    "tkgmLiHkab": "TKGM / LİHKAB",
    "5368SayiliK": "5368 Sayılı K.",
    "tg20TurkiyeHibrit": "TG-20 Türkiye Hibrit Jeoidi Teknik Raporu & Nivelman Kılavuzu",
    "haritaGenelMudurluguJeodezi": "Harita Genel Müdürlüğü Jeodezi Dairesi",
    "jeodezikAglar": "Jeodezik Ağlar",
    "turkiyeUlusalReferansCercevesi": "Türkiye Ulusal Referans Çerçevesi & Datum Standartları",
    "haritaGenelMudurluguHgm": "Harita Genel Müdürlüğü (HGM):",
    "dsiKgm": "DSİ / KGM",
    "kamulastirmaPlanlariHazirlamaTeknik": "Kamulaştırma Planları Hazırlama Teknik Şartnamesi",
    "devletSuISleri": "Devlet Su İşleri & Karayolları Genel Müdürlüğü",
    "iLbank": "İLBANK",
    "teknikSartname": "Teknik Şartname",
    "sayisalHalihazirHaritaYapim": "Sayısal Halihazır Harita Yapım Teknik Şartnamesi",
    "iLlerBankasiA": "İller Bankası A.Ş. Genel Müdürlüğü",
    "buyukOlcekliHaritaVe": "Büyük Ölçekli Harita ve Harita Bilgileri Üretim Yönetmeliği uyarınca geçerli resmi yasal sınır değerler:",
    "tCCumhurbaskanligiResmi": "T.C. Cumhurbaşkanlığı • Resmi Gazete Sayı: 30460 • Karar No: 2018/11962",
    "mevzuatPortali": "\"Mevzuat Portalı\"",
    "resmiPdfINdir": "\"Resmi PDF İndir\"",
    "jeodeziSahaMuhendislikKilavuzu": "Jeodezi & Saha Mühendislik Kılavuzu",
    "turkiyeHaritaKadastroLi": "Türkiye Harita, Kadastro, LİHKAB ve Fotogrametri standartları (BÖHHBÜY, TKGM, HGM) ile tam uyumlu iş akışları, toleranslar ve formül rehberi.",
    "1MuhendiSliK": "1. MÜHENDİSLİK MODÜLLERİ & İŞ AKIŞLARI",
    "1RtkHamData": "1. RTK & Ham Data Modülü",
    "moduleGit": "Modüle Git",
    "evrenselHamOlcuCozumleme": "Evrensel Ham Ölçü Çözümleme & BÖHHBÜY Çift Okuma Denetimi",
    "iSAkisi": "İŞ AKIŞI",
    "hamDosyaYuklemeOtomatik": "Ham dosya yükleme → Otomatik format algılama → Çift okuma eşleştirme → Tolerans denetimi (ΔS ≤ 7 cm, Δt ≥ 60 dk) → Netcad NCN/DXF ve resmi PDF karne üretimi.",
    "bohhbuyMadde28": "BÖHHBÜY MADDE 28",
    "iPucu": "İPUCU",
    "otomatikToleransDenetimiAktifken": "Otomatik tolerans denetimi aktifken, yasal hata sınırlarını aşan veya 60 dakikadan önce yapılan ikinci okumalar tabloda anında kırmızı renkle vurgulanır.",
    "2IHaUcus": "2. İHA Uçuş Planlama & Akıllı YKN",
    "fotogrametrikGridCanliMeteoroloji": "Fotogrametrik Grid, Canlı Meteoroloji & Yol Ağına Duyarlı YKN",
    "kmlKmzProjeSiniri": "KML/KMZ proje sınırı yükleme → Optimal uçuş yönü & hat hesaplama → Güneş & Canlı Meteoroloji simülasyonu → OSM yol ağına kenetlenen YKN (GCP) dağıtımı → KML/NCN/DXF aktarımı.",
    "djiMavic3eMatrice": "DJI Mavic 3E, Matrice 300/350 P1, Phantom 4 RTK, Wingtra, eBee vb. 18+ profesyonel İHA ve sensör veritabanı entegredir.",
    "tkgm20214Sayili": "TKGM 2021/4 Sayılı İHA Genelgesi standartlarına göre Yer Örnekleme Aralığı (GSD), bindirme payları ve YKN dağılım sıklığı otomatik denetlenir.",
    "yolAginaKenetleSnap": "Yol Ağına Kenetle (Snap to Road) seçeneği aktif edildiğinde, YKN noktaları arazide arabayla ulaşımı imkansız dağlık alanlar yerine en yakın stabilize/asfalt yollara akıllıca kaydırılır.",
    "3RinexDuzenleyiciBirlestirici": "3. RINEX Düzenleyici & Birleştirici",
    "multiGnssGozlemDuzenleme": "Multi-GNSS Gözlem Düzenleme, Kırpma & Sürüm Dönüştürme",
    "saatlikGunlukRinexDosyalarini": "Saatlik/günlük RINEX dosyalarını yükleme → GNSS takımyıldızı (GPS, GLONASS, Galileo, BeiDou) filtreleme → Zaman aralığı kırpma (Crop) → RINEX 2.11 / 3.04 dışa aktarma.",
    "webWorkersAltyapisiSayesinde": "Web Workers altyapısı sayesinde 100 MB+ büyüklüğündeki 24 saatlik statik RINEX dosyaları arayüzü kilitlemeden saniyeler içinde işlenir.",
    "tusagaAktifVeyaIgs": "TUSAGA-Aktif veya IGS istasyonlarından indirdiğiniz 1 saatlik 24 adet RINEX dosyasını tek seferde yükleyerek tek bir 24 saatlik statik gözlem dosyası halinde birleştirebilirsiniz.",
    "4PaftaINdeksi": "4. Pafta İndeksi & Harita Görünümü",
    "turkiyeStandartPaftaHiyerarsisi": "Türkiye Standart Pafta Hiyerarşisi & 3° DOM Dilim Sınırları",
    "koordinatKmlYuklemeVeya": "Koordinat/KML yükleme veya arama kutusuna pafta adı (Örn: I29-b1, F23-d) yazma → Harita üzerinde 1/100K, 1/50K, 1/25K pafta sınırları çizimi → Kesişen paftaların listesi ve dışa aktarımı.",
    "hiYerarsi": "HİYERARŞİ",
    "domCiZgiLeri": "DOM ÇİZGİLERİ",
    "turkiye3DilimOrta": "Türkiye 3° Dilim Orta Meridyenleri (DOM) Referansı",
    "genisBirIletimHatti": "Geniş bir iletim hattı veya yol projesi KML'i yüklediğinizde, hattın geçtiği tüm 1/25.000 ve 1/5.000 paftaları tek tıkla Excel veya Netcad formatında indirebilirsiniz.",
    "5KoordinatDonusumuHelmert": "5. Koordinat Dönüşümü & Helmert 2D",
    "36TmUtm": "3° ⇄ 6° TM/UTM, ED-50 ⇄ ITRF-96 & Netcad .DNS Çözümü",
    "kaynakHedefSistemSecimi": "Kaynak & Hedef sistem seçimi → Tek nokta veya toplu dosya yükleme → Analitik dönüşüm veya Ortak nokta ile 2B Helmert parametre hesabı (a, b, Tx, Ty) → Netcad DNS ve Koordinat çıktısı.",
    "siStemler": "SİSTEMLER",
    "turefItrf96Tm": "TUREF / ITRF-96 TM 3°, ED-50 Gauss-Krüger 3°, UTM 6°, WGS84 Coğrafi (Derece / DMS), EPSG kodları.",
    "enAz2Ortak": "En az 2 ortak nokta ile ölçek, dönüklük ve öteleme parametrelerini ağırlıklı en küçük kareler yöntemiyle çözer; birim ölçü standart sapmasını (m₀) raporlar.",
    "lokalSantiyePoligonAginizi": "Lokal şantiye poligon ağınızı resmi ITRF-96 koordinatlarına bağlamak için ortak noktaları yükleyip hesaplanan .DNS dosyasını Netcad'de doğrudan kullanabilirsiniz.",
    "6HgmTg20": "6. HGM TG-20 Jeoit İndirgeme",
    "tudka99NivelmanKotu": "TUDKA-99 Nivelman Kotu (H = h - N) & İnteraktif Jeoit Haritası",
    "tekNoktaVeyaToplu": "Tek nokta veya toplu liste/RW5 yükleme → 4 düğümlü çift doğrusal (bilinear) enterpolasyon → Ondülasyon (N) hesabı → Helmert Ortometrik Kot (H = h - N) → Resmi PDF rapor.",
    "tg20GriDi": "TG-20 GRİDİ",
    "492991ReferansGrid": "492.991 referans grid noktası",
    "eldeEdilenOrtometrikKotlar": "Elde edilen ortometrik kotlar Türkiye Ulusal Düşey Kontrol Ağı (TUDKA-99) geometrik nivelman esasına dayalı resmi yüksekliklerdir.",
    "iNteraktifJeoitHaritasi": "İnteraktif Jeoit Haritası üzerinde Türkiye'nin herhangi bir yerine tıklayarak anlık ondülasyon (N), TM 3° izdüşüm ve pafta adını telemetri panelinde görebilirsiniz.",
    "2JeodeziKStandartlar": "2. JEODEZİK STANDARTLAR, 3° DİLİM (DOM) & FORMÜLLER",
    "bohhbuyTkgmOlcuToleranslari": "BÖHHBÜY & TKGM Ölçü Toleransları Resmi Tablosu",
    "noktaTuruOlcmeYontemi": "Nokta Türü & Ölçme Yöntemi",
    "konumFarkiS": "Konum Farkı (ΔS)",
    "kotFarkiH": "Kot Farkı (ΔH)",
    "minimumSureFarkiT": "Minimum Süre Farkı (Δt)",
    "detayParselKosesiRtk": "Detay / Parsel Köşesi (RTK Ölçüsü)",
    "poligonYerKontrolNoktasi": "Poligon / Yer Kontrol Noktası (C3)",
    "bohhbuyMadde24": "BÖHHBÜY Madde 24",
    "geometrikNivelmanDuseyAg": "Geometrik Nivelman / Düşey Ağ",
    "nivelmanHatti": "Nivelman Hattı",
    "bohhbuyMadde31": "BÖHHBÜY Madde 31",
    "iHaFotogrametriYkn": "İHA Fotogrametri YKN (GCP)",
    "tkgmIHaGenelgesi": "TKGM İHA Genelgesi",
    "turefItrf96Ve": "TUREF / ITRF-96 ve ED-50 Gauss-Krüger 3° projeksiyon dilimleri:",
    "diLiM9": "DİLİM 9",
    "iZmirMuglaCanakkale": "İzmir, Muğla, Çanakkale",
    "diLiM10": "DİLİM 10",
    "iStanbulBursaAntalya": "İstanbul, Bursa, Antalya",
    "diLiM11": "DİLİM 11",
    "diLiM12": "DİLİM 12",
    "diLiM13": "DİLİM 13",
    "diLiM14": "DİLİM 14/15",
    "erzurumDiyarbakirVan": "Erzurum, Diyarbakır, Van",
    "temelJeodezikFotogrametrikFormuller": "Temel Jeodezik & Fotogrametrik Formüller",
    "1OrtometrikKot": "1. Ortometrik Kot",
    "3SikcaSorulanSorular": "3. SIKÇA SORULAN SORULAR & SAHA İPUÇLARI (FAQ)",
    "carlsonSurvceRw5Dosyami": "Carlson / SurvCE .RW5 dosyamı yüklediğimde noktaların koordinatları neden tam yerine oturuyor?",
    "hgmTg20Jeoidi": "HGM TG-20 jeoidi ile indirgenen kot resmi kurumlarda (Kadastro, Belediye, DSİ) geçerli midir?",
    "tg20JeoiDi": "TG-20 JEOİDİ",
    "tudka99TurkiyeUlusal": "TUDKA-99 Türkiye Ulusal Düşey Kontrol Ağı Helmert Ortometrik Kotudur (H = h - N)",
    "rtkKadastroModulundeCift": "RTK Kadastro modülünde çift okuma eşleştirmesi nasıl çalışır?",
    "iHaUcusPlanlama": "İHA Uçuş Planlama modülünde \"Yol Ağına Snap YKN\" özelliği sahada ne avantaj sağlar?",
    "iHaFotogrametri": "İHA & FOTOGRAMETRİ",
    "araclaVeyaYayaOlarak": "araçla veya yaya olarak kolayca ulaşılabilen yol kenarlarına ve tarla sınırlarına",
    "yukledigimKoordinatDosyalariVeya": "Yüklediğim koordinat dosyaları veya GNSS verileri internete/sunucuya aktarılıyor mu?",
    "guvenliKGiZli": "GÜVENLİK & GİZLİLİK",
    "kesinlikleHayir": "Kesinlikle hayır.",
    "4KlavyeKisayollariHizli": "4. KLAVYE KISAYOLLARI & HIZLI ERİŞİM MATRİSİ",
    "evrenselDosyaAc": "Evrensel Dosya Aç",
    "hamVeriRinexKml": "Ham veri, RINEX, KML veya Koordinat yükler",
    "karanlikAydinlikTemaGecisi": "Karanlık / Aydınlık tema geçişi yapar",
    "altLogVeTelemetri": "Alt log ve telemetri panelini açar / kapatır",
    "pencereleriKapat": "Pencereleri Kapat",
    "acikModalVeyaAcilir": "Açık modal veya açılır pencereleri kapatır",
    "siStemISlem": "SİSTEM İŞLEM & CANLI KONSOL",
    "siStemHaritaTools": "[SİSTEM] Harita Tools (Beta) başlatıldı. İşlem yapmak için dosya seçebilir veya bir modüle geçebilirsiniz.",
    "yazilimMimarisiKodlama": "Yazılım Mimarisi & Kodlama:",
    "telifMulkiyet": "Telif & Mülkiyet:",
    "surumAltyapi": "Sürüm & Altyapı:",
    "calismaPrensibi": "Çalışma Prensibi:",
    "tkgmBohhbuy": "TKGM & BÖHHBÜY:",
    "geografikHaritaVeCografi": "Geografik Harita ve Coğrafi Bilgi Teknolojileri"
  },
  "reports": {
    "cadastreAgencyTitle": "T.C. TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ",
    "cadastreReportSubTitle": "TUSAGA-AKTİF (CORS-TR) ÇİFT OKUMA VE KONTROL ÇETELESİ",
    "lblJobFile": "İş / Dosya:",
    "lblDate": "Tarih:",
    "lblProjection": "Projeksiyon:",
    "lblProjectionVal": "ITRF-96 TM 3° Dilim {meridian}° E",
    "lblErrorLimit": "Hata Limiti (dS):",
    "lblErrorLimitVal": "≤ 7.0 cm",
    "lblMinTime": "Min. Zaman:",
    "lblMinTimeVal": "≥ 60 Dk",
    "cadastreSec1Title": "1. ÇİFT OKUMA VE FARK KONTROL TABLOSU",
    "thPointNo": "Nokta No",
    "thObs1Time": "1. Ölçü (Zaman)",
    "thObs2Time": "2. Ölçü (Zaman)",
    "thTimeDiff": "Zaman Farkı",
    "thDiffs": "Farklar (cm)",
    "thDs2d": "dS (2B) (cm)",
    "thControl": "Kontrol (≤7cm)",
    "thAvgCoords": "Ortalama Koordinatlar (m)",
    "thDate": "Tarih",
    "thTime": "Saat",
    "thDy": "dY",
    "thDx": "dX",
    "thDh": "dH",
    "thEast": "Y (Sağa)",
    "thNorth": "X (Yukarı)",
    "thElev": "H (Kot)",
    "statusPassed": "UYGUN",
    "statusFailed": "LİMİT DIŞI",
    "noMatchedPairs": "Bu veri setinde çift okuma (eşleşen) nokta bulunmamaktadır. Tüm ölçüler tekil olarak Tablo 2'de listelenmiştir.",
    "cadastreSec2Title": "2. İKİNCİ OKUMASI BULUNMAYAN (TEKİL) NOKTALAR TABLOSU",
    "thNum": "#",
    "thPointName": "Nokta Adı",
    "thEastM": "Y (Sağa - m)",
    "thNorthM": "X (Yukarı - m)",
    "thElevEllipsoid": "Elipsoit Kotu (h)",
    "thElevOrtho": "Ortometrik H (TG-20)",
    "thHrms": "hRMS (mm)",
    "thPdop": "PDOP",
    "thSats": "Uydu",
    "thStatus": "Durum",
    "badgeSingleWarn": "Tek Ölçü (2. Okuma Yok)",
    "sigSurveyor": "Ölçümü Yapan<br>Harita Mühendisi / Teknikeri",
    "sigController": "Kontrol Eden<br>Kontrol Mühendisi",
    "sigApprover": "Onaylayan<br>Kadastro Müdürü / Yetkili",
    "tg20BrandTitle": "HARİTA TOOLS — JEODEZİ & GNSS STÜDYOSU",
    "tg20BrandSub": "Profesyonel Jeodezi, Fotogrametri & GNSS Hesaplama Platformu | Geografik Harita ve Coğrafi Bilgi Teknolojileri",
    "tg20MetaHeader": "TUSAGA-Aktif TG-20 Raporu",
    "lblDateTime": "Tarih / Saat:",
    "tg20MainTitle": "TG-20 TÜRKİYE HİBRİT JEOİDİ ORTOMETRİK KOT İNDİRGEME RAPORU",
    "tg20SubTitle": "TUSAGA-Aktif (CORS-TR) Ölçümleri Helmert Ortometrik Nivelman Kotu (TUDKA-99) Çetelesi (BÖHHBÜY Standartları)",
    "lblProject": "Proje / Dosya:",
    "lblCalcDate": "Hesaplama Tarihi:",
    "lblGeoidModel": "Kullanılan Jeoit Modeli:",
    "valGeoidModel": "HGM TG-20 (Türkiye Hibrit Jeoidi 2020)",
    "lblTotalPoints": "Toplam Nokta:",
    "lblVerticalDatum": "Düşey Referans Sistemi:",
    "valVerticalDatum": "TUDKA-99 (Türkiye Ulusal Düşey Kontrol Ağı)",
    "formulaTitle": "Temel Formül:",
    "avgUndulationPrefix": "Bölgesel Ortalama Jeoit Undülasyonu:",
    "thLat": "WGS-84 Enlem (ϕ)",
    "thLon": "WGS-84 Boylam (λ)",
    "thElevEllipsoidM": "Elipsoit Kotu (h / m)",
    "thUndulationM": "TG-20 Undülasyon (N / m)",
    "thElevOrthoM": "Ortometrik Kot (H / m)",
    "thObsType": "Ölçüm Tipi",
    "typeDualAvg": "Çift Okuma Ort.",
    "typeSingle": "Tekil Ölçü",
    "emptyData": "İndirgenecek koordinat verisi bulunamadı.",
    "disclaimerTitle": "⚠️ Yasal Bilgilendirme ve Sorumluluk Reddi Beyanı",
    "disclaimerText": "Bu hesaplama raporu, Harita Genel Müdürlüğü (HGM) tarafından yayımlanan resmi TG-20 Türkiye Hibrit Jeoidi 2020 modeli grid düğüm noktaları ve çift doğrusal (bilinear) enterpolasyon algoritması kullanılarak Harita Tools yazılımı tarafından teknik kontrol ve veri işleme amacıyla üretilmiştir. İşbu raporda yer alan ortometrik kot indirgemeleri (H = h − N) teknik destek niteliğinde olup, Tapu ve Kadastro Genel Müdürlüğü (TKGM) veya Harita Genel Müdürlüğü (HGM) tarafından doğrudan tanzim edilmiş resmi bir idari onay belgesi yerine geçmez.",
    "footerBrand": "Harita Tools © 2026 | Jeodezi & GNSS Stüdyosu — Geografik Harita ve Coğrafi Bilgi Teknolojileri",
    "footerRef": "Referans: HGM TG-20 (TUDKA-99 Helmert Ortometrik Yükseklik)",
    "footerPage": "Sayfa 1 / 1",
    "btnPrint": "🖨️ Yazdır / PDF Kaydet"
  }
};

if (typeof window !== "undefined") {
  window.__HARITA_TR_TRANSLATIONS__ = translations;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = translations;
}

/* <<<<<<<<<< [END MODULE: locales/tr.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/core/i18n.js] >>>>>>>>>> */
/**
 * =========================================================================
 * HARITA TOOLS BETA - INTERNATIONALIZATION & STRINGS ENGINE (i18n)
 * =========================================================================
 * Centralizes all static copy, geomatics domain terminology, labels,
 * button texts, and toast messages in external JSON dictionary files.
 */

(function (window, document) {
  'use strict';

  class StudioI18n {
    constructor() {
      this.currentLang = 'tr';
      // Synchronous instant initialization from embedded dictionary if present
      const embedded = (typeof window !== 'undefined' && (window.__HARITA_TR_TRANSLATIONS__ || window.__I18N_TR__)) ? (window.__HARITA_TR_TRANSLATIONS__ || window.__I18N_TR__) : null;
      this.strings = embedded ? Object.assign({}, embedded) : {};
      this.isLoaded = !!embedded;
      this.loadingPromise = null;
    }

    /**
     * Initialize language and load JSON file from server
     * @param {string} lang 
     * @returns {Promise<boolean>}
     */
    async init(lang = 'tr') {
      this.currentLang = lang;
      const embeddedDict = (typeof window !== 'undefined' && (window.__HARITA_TR_TRANSLATIONS__ || window.__I18N_TR__)) ? (window.__HARITA_TR_TRANSLATIONS__ || window.__I18N_TR__) : null;
      if (!this.isLoaded && embeddedDict) {
        this.strings = Object.assign({}, embeddedDict);
        this.isLoaded = true;
      }

      if (this.loadingPromise) return this.loadingPromise;

      this.loadingPromise = (async () => {
        try {
          const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
          const jsonUrl = `${basePath}locales/${lang}.json`;

          const response = await fetch(jsonUrl, { cache: 'no-cache' });
          if (response.ok) {
            const fetched = await response.json();
            this.strings = Object.assign({}, this.strings, fetched);
            this.isLoaded = true;
          }
        } catch (err) {
          // file:// or offline fallback - embedded strings already active
        }

        // Hydrate all data-i18n elements in DOM
        this.translateDOM();

        // Dispatch event for components that need to re-render
        document.dispatchEvent(new CustomEvent('i18n:ready', {
          detail: { lang: this.currentLang, strings: this.strings }
        }));

        console.log(`[i18n] '${lang}' dil paketi hazır.`);
        return true;
      })();

      return this.loadingPromise;
    }

    /**
     * Resolve a dot-notated key with optional placeholder params
     * Example: t('converter.toastParsed', { name: 'harita.dxf', count: 12 })
     * @param {string} key 
     * @param {Object} [params] 
     * @returns {string}
     */
    t(key, params = {}, fallback = null) {
      if (!key) return fallback !== null ? fallback : '';

      const parts = key.split('.');
      let current = this.strings;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          current = null;
          break;
        }
      }

      if (typeof current !== 'string') {
        if (fallback !== null) return fallback;
        return key;
      }

      let text = current;
      if (params && typeof params === 'object') {
        for (const [paramKey, val] of Object.entries(params)) {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val ?? ''));
        }
      }

      return text;
    }

    /**
     * Automatically translates all elements marked with data-i18n attributes
     * @param {HTMLElement|Document} root 
     */
    translateDOM(root = document) {
      if (!this.isLoaded) return;

      // Text content
      root.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = this.t(key);
        if (translated) el.textContent = translated;
      });

      // HTML content (for badges with icons)
      root.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const translated = this.t(key);
        if (translated) el.innerHTML = translated;
      });

      // Placeholders
      root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translated = this.t(key);
        if (translated) el.setAttribute('placeholder', translated);
      });

      // Titles / Tooltips
      root.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const translated = this.t(key);
        if (translated) el.setAttribute('title', translated);
      });

      // Aria labels
      root.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        const translated = this.t(key);
        if (translated) el.setAttribute('aria-label', translated);
      });
    }
  }

  // Export globally
  const i18nInstance = new StudioI18n();
  window.i18n = i18nInstance;
  window.t = (key, params) => i18nInstance.t(key, params);

  // Synchronously translate DOM if embedded strings are present
  if (i18nInstance.isLoaded) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => i18nInstance.translateDOM());
    } else {
      i18nInstance.translateDOM();
    }
  }

})(window, document);

/* <<<<<<<<<< [END MODULE: js/core/i18n.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/core/console.js] >>>>>>>>>> */
/**
 * Harita Tools - Live Console Dock & Progress Tracker
 */
function initConsoleControls() {
  const btnClear = document.getElementById("btnClearConsoleLog") || document.getElementById("btnClearLog");
  const btnCopy = document.getElementById("btnCopyConsoleLog") || document.getElementById("btnCopyLog");
  const btnToggle = document.getElementById("btnConsoleToggle") || document.getElementById("btnToggleDock");
  const domEl = document.getElementById("cyberConsoleDock");
  const iconToggle = document.getElementById("iconConsoleToggle") || document.getElementById("iconDockToggle");
  const textToggle = document.getElementById("textConsoleToggle") || document.getElementById("textDockToggle");

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      const logBox = document.getElementById("globalConsoleLog");
      if (logBox) {
        logBox.textContent = "[SİSTEM] Konsol temizlendi.";
      }
    });
  }
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const logBox = document.getElementById("globalConsoleLog");
      if (logBox) {
        copyToClipboard(logBox.textContent, "📋 Konsol kayıtları panoya kopyalandı.");
        const v_1 = btnCopy.innerHTML;
        btnCopy.innerHTML = "<i class=\"fa-solid fa-check text-emerald\"></i> Kopyalandı";
        setTimeout(() => {
          btnCopy.innerHTML = v_1;
        }, 1800);
      }
    });
  }
  if (btnToggle && domEl) {
    btnToggle.addEventListener("click", () => {
      domEl.classList.toggle("minimized");
      const v_1 = domEl.classList.contains("minimized");
      if (iconToggle) {
        iconToggle.className = v_1 ? "fa-solid fa-chevron-up text-xs" : "fa-solid fa-chevron-down text-xs";
      }
      if (textToggle) {
        textToggle.textContent = v_1 ? "Genişlet" : "Küçült";
      }
    });
  }
}
function logMessage(arg1) {
  const v_2 = new Date().toLocaleTimeString("tr-TR");
  elements.globalConsoleLog.textContent += "\n[" + v_2 + "] " + arg1;
  elements.globalConsoleLog.scrollTop = elements.globalConsoleLog.scrollHeight;
}
function updateProgress(arg1, arg2 = "") {
  elements.progressBarFill.style.width = arg1 + "%";
  elements.progressPercent.textContent = arg1 + "%";
  if (arg2) {
    elements.progressLabel.textContent = arg2;
  }
}

window.logMessage = logMessage;
window.updateProgress = updateProgress;

/* <<<<<<<<<< [END MODULE: js/core/console.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/core/dragdrop.js] >>>>>>>>>> */
/**
 * Harita Tools - Universal Drag & Drop and Dropzone Engine
 * - Global Window Drag & Drop Overlay Router
 * - Reusable Module Dropzone Binder (setupStudioDropzone)
 */

(function () {
  'use strict';

  /**
   * Configures a unified dropzone with drag-over styling, click-to-browse, and extension validation
   * @param {HTMLElement|string} dropzoneEl Dropzone element or DOM ID
   * @param {HTMLInputElement|string|null} fileInputEl File input element or DOM ID
   * @param {Function} onFileDrop Callback function receiving (files, event)
   * @param {Object} options { allowedExtensions: string[], multiple: boolean }
   */
  function setupStudioDropzone(dropzoneEl, fileInputEl, onFileDrop, options = {}) {
    const zone = typeof dropzoneEl === 'string' ? document.getElementById(dropzoneEl) : dropzoneEl;
    const input = typeof fileInputEl === 'string' ? document.getElementById(fileInputEl) : fileInputEl;

    if (!zone) return;

    // Click to open file dialog
    if (input) {
      zone.addEventListener('click', (e) => {
        if (e.target !== input) {
          input.click();
        }
      });

      input.addEventListener('change', (e) => {
        const files = Array.from(input.files || []);
        if (files.length > 0 && typeof onFileDrop === 'function') {
          onFileDrop(options.multiple ? files : files[0], e);
        }
      });
    }

    let dragCounter = 0;

    zone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      zone.classList.add('drag-over', 'border-cyan');
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        zone.classList.remove('drag-over', 'border-cyan');
      }
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      zone.classList.remove('drag-over', 'border-cyan');

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      if (droppedFiles.length === 0) return;

      // Validate extensions if provided
      let validFiles = droppedFiles;
      if (options.allowedExtensions && Array.isArray(options.allowedExtensions)) {
        const allowed = options.allowedExtensions.map(ext => ext.toLowerCase().replace(/^\./, ''));
        validFiles = droppedFiles.filter(f => {
          const ext = f.name.split('.').pop().toLowerCase();
          return allowed.includes(ext);
        });

        if (validFiles.length === 0) {
          if (window.showToast) {
            window.showToast(t("core.dragdrop.toastUnsupported", { types: allowed.join(', .') }), 'warning');
          }
          return;
        }
      }

      // Sync with file input if available
      if (input && validFiles.length > 0) {
        const dt = new DataTransfer();
        validFiles.forEach(f => dt.items.add(f));
        input.files = dt.files;
      }

      if (typeof onFileDrop === 'function') {
        onFileDrop(options.multiple ? validFiles : validFiles[0], e);
      }
    });
  }

  /**
   * Global Window Drag & Drop Overlay Router
   */
  function initGlobalDragAndDrop() {
    const overlay = document.getElementById('globalDragOverlay');
    if (!overlay) return;

    let dragCount = 0;

    window.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCount++;
      if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
        overlay.classList.add('active');
      }
    });

    window.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCount--;
      if (dragCount <= 0) {
        dragCount = 0;
        overlay.classList.remove('active');
      }
    });

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    window.addEventListener('drop', async (e) => {
      e.preventDefault();
      dragCount = 0;
      overlay.classList.remove('active');

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const firstFile = files[0];
      const fname = firstFile.name.toLowerCase();

      // Route 1: Cadastre RTK / RW5 / Raw
      if (fname.endsWith('.rw5') || fname.endsWith('.raw') || fname.endsWith('.jxl') || (fname.endsWith('.csv') && !fname.includes('rinex'))) {
        document.querySelector('[data-tab="tab-cadastre"]')?.click();
        const dt = new DataTransfer();
        dt.items.add(firstFile);
        if (window.elements?.rw5FileInput) {
          window.elements.rw5FileInput.files = dt.files;
        }
        if (window.showToast) window.showToast(t("core.dragdrop.toastRw5Loaded", { name: firstFile.name }), 'success');
        if (typeof window.handleGnssAnalysis === 'function') {
          await window.handleGnssAnalysis();
        }
      }
      // Route 2: RINEX Studio
      else if (fname.endsWith('.obs') || fname.endsWith('.rnx') || fname.endsWith('.zip') || /\.\d{2}[oO]$/.test(fname)) {
        document.querySelector('[data-tab="tab-rinex-studio"]')?.click();
        const dt = new DataTransfer();
        Array.from(files).forEach(f => dt.items.add(f));
        if (window.elements?.mergerFileInput) {
          window.elements.mergerFileInput.files = dt.files;
          window.elements.mergerFileInput.dispatchEvent(new Event('change'));
        }
        if (window.showToast) window.showToast(t("core.dragdrop.toastRinexImported", { count: files.length }), 'success');
      }
      // Route 3: TG-20 Geoid
      else if (fname.endsWith('.ggf')) {
        document.querySelector('[data-tab="tab-tg20"]')?.click();
        if (window.state?.tg20Engine) {
          await window.state.tg20Engine.loadFromFile(firstFile);
        }
        if (window.showToast) window.showToast(t("core.dragdrop.toastTg20Loaded", { name: firstFile.name }), 'success');
      }
      // Route 4: Universal Format Converter
      else if (fname.endsWith('.ncz') || fname.endsWith('.dxf') || fname.endsWith('.kml') || fname.endsWith('.kmz') || fname.endsWith('.ncn') || fname.endsWith('.kos') || fname.endsWith('.geojson')) {
        document.querySelector('[data-tab="tab-converter"]')?.click();
        const inputConv = document.getElementById('inputConverterFile');
        if (inputConv) {
          const dt = new DataTransfer();
          dt.items.add(firstFile);
          inputConv.files = dt.files;
          inputConv.dispatchEvent(new Event('change'));
        }
        if (window.showToast) window.showToast(t("core.dragdrop.toastConverterLoaded", { name: firstFile.name }), 'success');
      }
      else {
        if (window.showToast) window.showToast(t("core.dragdrop.toastFileDetected", { name: firstFile.name }), 'info');
      }
    });
  }

  // Global Exports
  window.initGlobalDragAndDrop = initGlobalDragAndDrop;
  window.setupStudioDropzone = setupStudioDropzone;
})();

/* <<<<<<<<<< [END MODULE: js/core/dragdrop.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/core/maps.js] >>>>>>>>>> */
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

/* <<<<<<<<<< [END MODULE: js/core/maps.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/core/exporter.js] >>>>>>>>>> */
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

/* <<<<<<<<<< [END MODULE: js/core/exporter.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/geodesyEngine.js] >>>>>>>>>> */
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
        const basePath = (typeof window !== "undefined" && window.location.pathname)
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
        console.warn("EPSG veritabanı (data/epsg_registry.json) yüklenemedi:", e);
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
      result.formattedResult = `Enlem (Lat) = ${result.c1.toFixed(8)}°, Boylam (Lon) = ${result.c2.toFixed(8)}°, Kot (h) = ${result.c3.toFixed(3)} m`;
    } else if (tgt.type === "TM") {
      const isHayfordTgt = (tgt.datum === "ED50");
      const projected = this.forwardTM(finalLat, finalLon, tgt.lon0, tgt.scale0, isHayfordTgt);
      result.c1 = projected.easting;
      result.c2 = projected.northing;
      result.c3 = finalH;
      result.formattedResult = `Y (Sağa) = ${result.c1.toFixed(3)} m, X (Yukarı) = ${result.c2.toFixed(3)} m, Kot (h) = ${result.c3.toFixed(3)} m`;
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
      throw new Error("2D Helmert dönüşümü için en az 2 ortak kontrol noktası gereklidir.");
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
      throw new Error("Ortak noktaların koordinat varyansı sıfır (tüm noktalar çakışık).");
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
        pointCount: "DNS Dosyası",
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
        pointCount: "DNS Dosyası",
        m0: 0.0
      };
    }

    throw new Error("Geçersiz Netcad .DNS dosyası. (A, B, DY, DX parametreleri tespit edilemedi)");
  }

  /**
   * 3B Bursa-Wolf 7-Parametre En Küçük Kareler (LSE) Çözücüsü
   */
  solveBursaWolf7Param(commonPoints3D) {
    const n = commonPoints3D.length;
    if (n < 3) {
      throw new Error(`7 parametre hesabı için en az 3 adet 3B ortak kontrol noktası gereklidir (Verilen: ${n}).`);
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
        throw new Error("Matris tekil veya ortak noktalar geometrisi yetersiz.");
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
}

if (typeof window !== "undefined") {
  window.GeodesyEngine = GeodesyEngine;
  GeodesyEngine.loadEpsgRegistry();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = GeodesyEngine;
}
/* <<<<<<<<<< [END MODULE: js/modules/geodesyEngine.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/paftaIndexEngine.js] >>>>>>>>>> */
/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - PAFTA İNDEKS & BÖHHBÜY HESAP MOTORU (PaftaIndexEngine)
 * =========================================================================================
 *  - Türkiye 1/100 000, 1/50 000 ve 1/25 000 Standart Pafta İndeks Bölümleme Algoritmaları
 *  - HGM Resmi Pafta Bazlı Datum Düzeltme Katsayıları (ΔX, ΔY, Δh, N) Eşleştirici
 *  - TUREF TM 3° Dilim Orta Meridyeni (DOM 27°-45°) Sınır ve Kapsama Hesaplayıcı
 *  - Pafta Adından / Şehir Adından Koordinat ve Sınır Çözümleyici (Reverse Geocoding)
 *  - CAD & CBS İhracı: Netcad Nokta (.NCN), AutoCAD Çizim (.DXF) ve Google Earth (.KML)
 * =========================================================================================
 */

const TR_25_PAFTA_LETTERS = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'İ',
  'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'Ş',
  'T', 'U', 'Ü', 'V', 'Y'
];

class PaftaIndexEngine {
  constructor() {
    this.tr25Letters = TR_25_PAFTA_LETTERS;
    // 1/100K Enlem Harf Haritası (34.0° - 44.0°K)
    this.latMap = {
      43.5: "A",
      43.0: "B",
      42.5: "C",
      42.0: "D",
      41.5: "E",
      41.0: "F",
      40.5: "G",
      40.0: "H",
      39.5: "I",
      39.0: "J",
      38.5: "K",
      38.0: "L",
      37.5: "M",
      37.0: "N",
      36.5: "O",
      36.0: "P",
      35.5: "Q",
      35.0: "R",
      34.5: "S",
      34.0: "T"
    };

    // Harften Minimum Enlem Değerine Dönüşüm
    this.letterToLatMin = {
      A: 43.5,
      B: 43.0,
      C: 42.5,
      D: 42.0,
      E: 41.5,
      F: 41.0,
      G: 40.5,
      H: 40.0,
      I: 39.5,
      İ: 39.5,
      J: 39.0,
      K: 38.5,
      L: 38.0,
      M: 37.5,
      N: 37.0,
      O: 36.5,
      P: 36.0,
      Q: 35.5,
      R: 35.0,
      S: 34.5,
      T: 34.0
    };

    // Türkiye Coğrafi Sınır Kapsamı (BBOX)
    this.turkeyBounds = {
      minLat: 35.5,
      maxLat: 42.5,
      minLon: 25.5,
      maxLon: 45.0
    };

    // 1/100.000'lik Pafta Kodundan 1/250.000'lik Şehir / Bölge Adı Eşleştirmesi
    this.sheet100kTo250k = {
      M33: "ADANA", M34: "ADANA", M35: "ADANA", N33: "ADANA", N34: "ADANA", N35: "ADANA",
      G24: "ADAPAZARI", G25: "ADAPAZARI", G26: "ADAPAZARI", H24: "ADAPAZARI", H25: "ADAPAZARI", H26: "ADAPAZARI",
      K24: "AFYON", K25: "AFYON", K26: "AFYON", L24: "AFYON", L25: "AFYON", L26: "AFYON",
      I48: "AGRI", I49: "AGRI", I50: "AGRI", J48: "AGRI", J49: "AGRI", J50: "AGRI",
      F42: "AKÇAABAT", F43: "AKÇAABAT", F44: "AKÇAABAT",
      K30: "AKSARAY", K31: "AKSARAY", K32: "AKSARAY", L30: "AKSARAY", L31: "AKSARAY", L32: "AKSARAY",
      O27: "ALANYA", O28: "ALANYA", O29: "ALANYA", P28: "ALANYA", P29: "ALANYA",
      I27: "ANKARA", I28: "ANKARA", I29: "ANKARA", J27: "ANKARA", J28: "ANKARA", J29: "ANKARA",
      O36: "ANTAKYA", O37: "ANTAKYA", O38: "ANTAKYA", P36: "ANTAKYA", P37: "ANTAKYA", R36: "ANTAKYA",
      O24: "ANTALYA", O25: "ANTALYA", O26: "ANTALYA", P24: "ANTALYA", P25: "ANTALYA",
      E48: "ARDAHAN", E49: "ARDAHAN", F48: "ARDAHAN", F49: "ARDAHAN", F50: "ARDAHAN", F51: "ARDAHAN",
      E47: "ARTVIN", F45: "ARTVIN", F46: "ARTVIN", F47: "ARTVIN",
      M18: "AYDIN", M19: "AYDIN", M20: "AYDIN", N18: "AYDIN", N19: "AYDIN", N20: "AYDIN",
      I15: "AYVALIK", I16: "AYVALIK", I17: "AYVALIK", J16: "AYVALIK", J17: "AYVALIK",
      T28: "BAF", T29: "BAF",
      I18: "BALIKESIR", I19: "BALIKESIR", I20: "BALIKESIR", J18: "BALIKESIR", J19: "BALIKESIR", J20: "BALIKESIR",
      G18: "BANDIRMA", G19: "BANDIRMA", H18: "BANDIRMA", H19: "BANDIRMA", H20: "BANDIRMA",
      K51: "BASKALE", K52: "BASKALE", L51: "BASKALE", L52: "BASKALE",
      G27: "BOLU", G28: "BOLU", G29: "BOLU", H27: "BOLU", H28: "BOLU", H29: "BOLU",
      G21: "BURSA", G22: "BURSA", G23: "BURSA", H21: "BURSA", H22: "BURSA", H23: "BURSA",
      O42: "CEYLANPINAR", O43: "CEYLANPINAR", O44: "CEYLANPINAR",
      M48: "CIZRE", M49: "CIZRE", M50: "CIZRE", N48: "CIZRE", N49: "CIZRE", N50: "CIZRE",
      G16: "ÇANAKKALE", G17: "ÇANAKKALE", H15: "ÇANAKKALE", H16: "ÇANAKKALE", H17: "ÇANAKKALE",
      G30: "ÇANKIRI", G31: "ÇANKIRI", G32: "ÇANKIRI", H30: "ÇANKIRI", H31: "ÇANKIRI", H32: "ÇANKIRI",
      G33: "ÇORUM", G34: "ÇORUM", G35: "ÇORUM", H33: "ÇORUM", H34: "ÇORUM", H35: "ÇORUM",
      M21: "DENIZLI", M22: "DENIZLI", M23: "DENIZLI", N21: "DENIZLI", N22: "DENIZLI", N23: "DENIZLI",
      I39: "DIVRIGI", I40: "DIVRIGI", I41: "DIVRIGI", J39: "DIVRIGI", J40: "DIVRIGI", J41: "DIVRIGI",
      M42: "DIYARBAKIR", M43: "DIYARBAKIR", M44: "DIYARBAKIR", N42: "DIYARBAKIR", N43: "DIYARBAKIR", N44: "DIYARBAKIR",
      H52: "DOGUBAYAZIT", I51: "DOGUBAYAZIT", I52: "DOGUBAYAZIT", I53: "DOGUBAYAZIT", J51: "DOGUBAYAZIT", J52: "DOGUBAYAZIT",
      D17: "EDIRNE", E16: "EDIRNE", E17: "EDIRNE", F16: "EDIRNE", F17: "EDIRNE",
      K42: "ELAZIG", K43: "ELAZIG", K44: "ELAZIG", L42: "ELAZIG", L43: "ELAZIG", L44: "ELAZIG",
      K36: "ELBISTAN", K37: "ELBISTAN", K38: "ELBISTAN", L36: "ELBISTAN", L37: "ELBISTAN", L38: "ELBISTAN",
      F24: "EREGLI", F25: "EREGLI", F26: "EREGLI",
      I42: "ERZINCAN", I43: "ERZINCAN", I44: "ERZINCAN", J42: "ERZINCAN", J43: "ERZINCAN", J44: "ERZINCAN",
      I45: "ERZURUM", I46: "ERZURUM", I47: "ERZURUM", J45: "ERZURUM", J46: "ERZURUM", J47: "ERZURUM",
      I24: "ESKISEHIR", I25: "ESKISEHIR", I26: "ESKISEHIR", J24: "ESKISEHIR", J25: "ESKISEHIR", J26: "ESKISEHIR",
      O21: "FETHIYE", O22: "FETHIYE", O23: "FETHIYE", P22: "FETHIYE", P23: "FETHIYE",
      M36: "GAZIANTEP", M37: "GAZIANTEP", M38: "GAZIANTEP", N36: "GAZIANTEP", N37: "GAZIANTEP", N38: "GAZIANTEP",
      G39: "GIRESUN", G40: "GIRESUN", G41: "GIRESUN", H39: "GIRESUN", H40: "GIRESUN", H41: "GIRESUN",
      S28: "GÜZELYURT", S29: "GÜZELYURT",
      M51: "HAKKARI", M52: "HAKKARI", M53: "HAKKARI", N51: "HAKKARI", N52: "HAKKARI", N53: "HAKKARI", O52: "HAKKARI",
      K27: "ILGIN", K28: "ILGIN", K29: "ILGIN", L27: "ILGIN", L28: "ILGIN", L29: "ILGIN",
      M24: "ISPARTA", M25: "ISPARTA", M26: "ISPARTA", N24: "ISPARTA", N25: "ISPARTA", N26: "ISPARTA",
      F21: "ISTANBUL", F22: "ISTANBUL", F23: "ISTANBUL",
      K18: "IZMIR", K19: "IZMIR", K20: "IZMIR", L18: "IZMIR", L19: "IZMIR", L20: "IZMIR",
      M30: "KARAMAN", M31: "KARAMAN", M32: "KARAMAN", N30: "KARAMAN", N31: "KARAMAN", N32: "KARAMAN",
      G48: "KARS", G49: "KARS", G50: "KARS", G51: "KARS", H48: "KARS", H49: "KARS", H50: "KARS", H51: "KARS",
      D30: "KASTAMONU", E30: "KASTAMONU", E31: "KASTAMONU", E32: "KASTAMONU", F30: "KASTAMONU", F31: "KASTAMONU", F32: "KASTAMONU",
      K33: "KAYSERI", K34: "KAYSERI", K35: "KAYSERI", L33: "KAYSERI", L34: "KAYSERI", L35: "KAYSERI",
      D18: "KIRKLARELI", E18: "KIRKLARELI", E19: "KIRKLARELI", E20: "KIRKLARELI", F18: "KIRKLARELI", F19: "KIRKLARELI", F20: "KIRKLARELI",
      I30: "KIRSEHIR", I31: "KIRSEHIR", I32: "KIRSEHIR", J30: "KIRSEHIR", J31: "KIRSEHIR", J32: "KIRSEHIR",
      M27: "KONYA", M28: "KONYA", M29: "KONYA", N27: "KONYA", N28: "KONYA", N29: "KONYA",
      I21: "KÜTAHYA", I22: "KÜTAHYA", I23: "KÜTAHYA", J21: "KÜTAHYA", J22: "KÜTAHYA", J23: "KÜTAHYA",
      R32: "LEFKOSA", R33: "LEFKOSA", S30: "LEFKOSA", S31: "LEFKOSA", S32: "LEFKOSA",
      T30: "LIMASOL", T31: "LIMASOL", T32: "LIMASOL",
      K39: "MALATYA", K40: "MALATYA", K41: "MALATYA", L39: "MALATYA", L40: "MALATYA", L41: "MALATYA",
      M45: "MARDIN", M46: "MARDIN", M47: "MARDIN", N45: "MARDIN", N46: "MARDIN", N47: "MARDIN",
      O18: "MARMARIS", O19: "MARMARIS", O20: "MARMARIS",
      O33: "MERSIN", O34: "MERSIN", O35: "MERSIN", P35: "MERSIN", R35: "MERSIN",
      K45: "MUS", K46: "MUS", K47: "MUS", L45: "MUS", L46: "MUS", L47: "MUS",
      F39: "PERSEMBE", F41: "PERSEMBE",
      E36: "SAMSUN", F36: "SAMSUN", F37: "SAMSUN", F38: "SAMSUN",
      M39: "SANLIURFA", M40: "SANLIURFA", M41: "SANLIURFA", N39: "SANLIURFA", N40: "SANLIURFA", N41: "SANLIURFA",
      O30: "SILIFKE", O31: "SILIFKE", O32: "SILIFKE", P30: "SILIFKE", P31: "SILIFKE", P32: "SILIFKE",
      D33: "SINOP", D34: "SINOP", E33: "SINOP", E34: "SINOP", E35: "SINOP", F33: "SINOP", F34: "SINOP", F35: "SINOP",
      I36: "SIVAS", I37: "SIVAS", I38: "SIVAS", J36: "SIVAS", J37: "SIVAS", J38: "SIVAS",
      O39: "SURUÇ", O40: "SURUÇ", O41: "SURUÇ",
      G36: "TOKAT", G37: "TOKAT", G38: "TOKAT", H36: "TOKAT", H37: "TOKAT", H38: "TOKAT",
      G45: "TORTUM", G46: "TORTUM", G47: "TORTUM", H45: "TORTUM", H46: "TORTUM", H47: "TORTUM",
      G42: "TRABZON", G43: "TRABZON", G44: "TRABZON", H42: "TRABZON", H43: "TRABZON", H44: "TRABZON",
      K16: "URLA", K17: "URLA", L16: "URLA", L17: "URLA",
      K21: "USAK", K22: "USAK", K23: "USAK", L21: "USAK", L22: "USAK", L23: "USAK",
      K48: "VAN", K49: "VAN", K50: "VAN", L48: "VAN", L49: "VAN", L50: "VAN",
      I33: "YOZGAT", I34: "YOZGAT", I35: "YOZGAT", J33: "YOZGAT", J34: "YOZGAT", J35: "YOZGAT",
      E27: "ZONGULDAK", E28: "ZONGULDAK", E29: "ZONGULDAK", F27: "ZONGULDAK", F28: "ZONGULDAK"
    };
  }

  /**
   * Türkiye TUREF TM 3° Dilim Orta Meridyenleri Listesini Döndürür
   */
  getTurkishDomZones() {
    return [
      { zone: 9, dom: 27, epsg: "EPSG:5253", epsgEd50: "EPSG:5263", minLon: 25.5, maxLon: 28.5, name: "DOM 27° (Dilim 9)", desc: "Trakya, Çanakkale, Balıkesir, İzmir Batısı" },
      { zone: 10, dom: 30, epsg: "EPSG:5254", epsgEd50: "EPSG:5264", minLon: 28.5, maxLon: 31.5, name: "DOM 30° (Dilim 10)", desc: "İstanbul, Bursa, Kocaeli, Sakarya, Bilecik, Kütahya, Manisa, İzmir, Muğla, Antalya Batısı" },
      { zone: 11, dom: 33, epsg: "EPSG:5255", epsgEd50: "EPSG:5265", minLon: 31.5, maxLon: 34.5, name: "DOM 33° (Dilim 11)", desc: "Ankara, Eskişehir, Konya, Afyon, Bolu, Düzce, Zonguldak, Bartın, Kastamonu Batısı, Aksaray, Karaman, Antalya, Mersin" },
      { zone: 12, dom: 36, epsg: "EPSG:5256", epsgEd50: "EPSG:5266", minLon: 34.5, maxLon: 37.5, name: "DOM 36° (Dilim 12)", desc: "Samsun, Çorum, Amasya, Tokat, Yozgat, Kırşehir, Nevşehir, Niğde, Kayseri, Sivas Batısı, Adana, Osmaniye, Hatay" },
      { zone: 13, dom: 39, epsg: "EPSG:5257", epsgEd50: "EPSG:5267", minLon: 37.5, maxLon: 40.5, name: "DOM 39° (Dilim 13)", desc: "Ordu, Giresun, Trabzon, Gümüşhane, Bayburt, Sivas, Erzincan, Malatya, Elazığ, Tunceli, Kahramanmaraş, Gaziantep, Kilis, Adıyaman, Şanlıurfa Batısı" },
      { zone: 14, dom: 42, epsg: "EPSG:5258", epsgEd50: "EPSG:5268", minLon: 40.5, maxLon: 43.5, name: "DOM 42° (Dilim 14)", desc: "Rize, Artvin, Erzurum, Bingöl, Muş, Bitlis, Diyarbakır, Batman, Siirt, Mardin, Şanlıurfa, Şırnak Batısı" },
      { zone: 15, dom: 45, epsg: "EPSG:5259", epsgEd50: "EPSG:5269", minLon: 43.5, maxLon: 46.5, name: "DOM 45° (Dilim 15)", desc: "Ardahan, Kars, Iğdır, Ağrı, Van, Hakkari, Şırnak" }
    ];
  }

  calculate100kSheet(lat, lon) { return this.get100kSheet(lat, lon); }
  calculate50kSheet(lat, lon) { return this.get50kSheet(lat, lon); }
  calculate25kSheet(lat, lon) { return this.get25kSheet(lat, lon); }
  calculate10kSheet(lat, lon) { return this.get10kSheet(lat, lon); }
  calculate5kSheet(lat, lon) { return this.get5kSheet(lat, lon); }
  calculate2kSheet(lat, lon) { return this.get2kSheet(lat, lon); }
  calculate1kSheet(lat, lon) { return this.get1kSheet(lat, lon); }
  findPaftaByPoint(lat, lon) { return this.getAllSheetsForPoint(lat, lon); }

  /**
   * Enlem ve Boylama Göre 1/100 000 Ölçekli Paftayı Hesaplar (30' x 30')
   */
  get100kSheet(lat, lon) {
    const minLat = Math.floor(Math.round(lat * 1e6) / 500000) * 0.5;
    const maxLat = minLat + 0.5;
    const minLon = Math.floor(Math.round(lon * 1e6) / 500000) * 0.5;
    const maxLon = minLon + 0.5;

    const latKey = minLat.toFixed(1);
    const letter = this.latMap[latKey] || this.latMap[String(minLat)] || "F";
    const colNum = Math.round(minLon * 2) - 36;
    const colStr = String(colNum).padStart(2, "0");
    const sheetName = `${letter}${colStr}`;
    const regName = this.sheet100kTo250k[sheetName] || "";

    return {
      scale: "1/100 000",
      name: sheetName,
      sheetName: sheetName,
      letter: letter,
      col: colNum,
      regionalName: regName,
      displayName: regName ? `${sheetName} (${regName})` : sheetName,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: minLat + 0.25,
      centerLon: minLon + 0.25
    };
  }

  /**
   * Enlem ve Boylama Göre 1/50 000 Ölçekli Paftayı Hesaplar (15' x 15' - a, b, c, d)
   */
  get50kSheet(lat, lon) {
    const parent100k = this.get100kSheet(lat, lon);
    const midLat = parent100k.minLat + 0.25;
    const midLon = parent100k.minLon + 0.25;

    let subLetter = "a";
    let minLat, maxLat, minLon, maxLon;

    if (lat >= midLat && lon < midLon) {
      subLetter = "a";
      minLat = midLat; maxLat = parent100k.maxLat;
      minLon = parent100k.minLon; maxLon = midLon;
    } else if (lat >= midLat && lon >= midLon) {
      subLetter = "b";
      minLat = midLat; maxLat = parent100k.maxLat;
      minLon = midLon; maxLon = parent100k.maxLon;
    } else if (lat < midLat && lon >= midLon) {
      subLetter = "c";
      minLat = parent100k.minLat; maxLat = midLat;
      minLon = midLon; maxLon = parent100k.maxLon;
    } else {
      subLetter = "d";
      minLat = parent100k.minLat; maxLat = midLat;
      minLon = parent100k.minLon; maxLon = midLon;
    }

    const sheetName = `${parent100k.name}-${subLetter}`;
    return {
      scale: "1/50 000",
      name: sheetName,
      sheetName: sheetName,
      parent100k: parent100k.name,
      regionalName: parent100k.regionalName,
      displayName: parent100k.regionalName ? `${sheetName} (${parent100k.regionalName})` : sheetName,
      subLetter: subLetter,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: minLat + 0.125,
      centerLon: minLon + 0.125
    };
  }

  /**
   * Enlem ve Boylama Göre 1/25 000 Ölçekli Paftayı Hesaplar
   * (1/50k'dan 2x2 = 4 parça -> 7'30" x 7'30" = 0.125° x 0.125° -> 1, 2, 3, 4)
   * Resmi HGM Formatı: [100k]-[50k_harfi][1..4] (Örn: J28-b4, M33-a1, N21-d1)
   */
  get25kSheet(lat, lon) {
    const parent50k = this.get50kSheet(lat, lon);
    const midLat = parent50k.minLat + 0.125;
    const midLon = parent50k.minLon + 0.125;

    let subNum = 1;
    let minLat, maxLat, minLon, maxLon;

    // Saat yönünde: 1 (KB), 2 (KD), 3 (GD), 4 (GB)
    if (lat >= midLat && lon < midLon) {
      subNum = 1;
      minLat = midLat; maxLat = parent50k.maxLat;
      minLon = parent50k.minLon; maxLon = midLon;
    } else if (lat >= midLat && lon >= midLon) {
      subNum = 2;
      minLat = midLat; maxLat = parent50k.maxLat;
      minLon = midLon; maxLon = parent50k.maxLon;
    } else if (lat < midLat && lon >= midLon) {
      subNum = 3;
      minLat = parent50k.minLat; maxLat = midLat;
      minLon = midLon; maxLon = parent50k.maxLon;
    } else {
      subNum = 4;
      minLat = parent50k.minLat; maxLat = midLat;
      minLon = parent50k.minLon; maxLon = midLon;
    }

    const sheetName = `${parent50k.parent100k}-${parent50k.subLetter}${subNum}`;
    const centerLat = minLat + 0.0625;
    const centerLon = minLon + 0.0625;
    const datumCorr = this.getHgmDatumRecord(sheetName, centerLat, centerLon);

    return {
      scale: "1/25 000",
      name: sheetName,
      sheetName: sheetName,
      parent100k: parent50k.parent100k,
      parent50k: parent50k.name,
      regionalName: parent50k.regionalName,
      displayName: parent50k.regionalName ? `${sheetName} (${parent50k.regionalName})` : sheetName,
      subLetter: parent50k.subLetter,
      subNum: subNum,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: centerLat,
      centerLon: centerLon,
      hgmKey: sheetName,
      datumCorr: datumCorr,
      geoid: datumCorr.yukseklikDuz,
      heightCorr: datumCorr.yukariDuz
    };
  }

  /**
   * Enlem ve Boylama Göre 1/5 000 Ölçekli Paftayı Hesaplar
   * (1/25k'dan 5x5 = 25 parça -> 1'30" x 1'30" = 0.025° x 0.025° -> 01..25)
   * Örn: J28-b4-01 .. J28-b4-25
   */
  get5kSheet(lat, lon) {
    const parent25k = this.get25kSheet(lat, lon);
    const dLat = parent25k.maxLat - lat;
    const dLon = lon - parent25k.minLon;
    const r = Math.min(4, Math.max(0, Math.floor(dLat / 0.025)));
    const c = Math.min(4, Math.max(0, Math.floor(dLon / 0.025)));
    const num = r * 5 + c + 1;
    const numStr = String(num).padStart(2, "0");

    const maxLat = parent25k.maxLat - r * 0.025;
    const minLat = maxLat - 0.025;
    const minLon = parent25k.minLon + c * 0.025;
    const maxLon = minLon + 0.025;

    const sheetName = `${parent25k.name}-${numStr}`;
    const centerLat = minLat + 0.0125;
    const centerLon = minLon + 0.0125;

    return {
      scale: "1/5 000",
      name: sheetName,
      sheetName: sheetName,
      parent25k: parent25k.name,
      parent50k: parent25k.parent50k,
      parent100k: parent25k.parent100k,
      regionalName: parent25k.regionalName,
      displayName: parent25k.regionalName ? `${sheetName} (${parent25k.regionalName})` : sheetName,
      subNum: num,
      numStr: numStr,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: centerLat,
      centerLon: centerLon
    };
  }

  /**
   * Enlem ve Boylama Göre 1/2 000 Ölçekli Paftayı Hesaplar
   * (1/5k'dan 2x2 = 4 parça -> 45" x 45" = 0.0125° x 0.0125° -> 1, 2, 3, 4)
   * Örn: J28-b4-13-1 .. J28-b4-13-4
   */
  get2kSheet(lat, lon) {
    const parent5k = this.get5kSheet(lat, lon);
    const midLat = parent5k.minLat + 0.0125;
    const midLon = parent5k.minLon + 0.0125;

    let subNum = 1;
    let minLat, maxLat, minLon, maxLon;
    if (lat >= midLat && lon < midLon) {
      subNum = 1; minLat = midLat; maxLat = parent5k.maxLat; minLon = parent5k.minLon; maxLon = midLon;
    } else if (lat >= midLat && lon >= midLon) {
      subNum = 2; minLat = midLat; maxLat = parent5k.maxLat; minLon = midLon; maxLon = parent5k.maxLon;
    } else if (lat < midLat && lon >= midLon) {
      subNum = 3; minLat = parent5k.minLat; maxLat = midLat; minLon = midLon; maxLon = parent5k.maxLon;
    } else {
      subNum = 4; minLat = parent5k.minLat; maxLat = midLat; minLon = parent5k.minLon; maxLon = midLon;
    }

    const sheetName = `${parent5k.name}-${subNum}`;
    const centerLat = minLat + 0.00625;
    const centerLon = minLon + 0.00625;

    return {
      scale: "1/2 000",
      name: sheetName,
      sheetName: sheetName,
      parent5k: parent5k.name,
      parent25k: parent5k.parent25k,
      parent50k: parent5k.parent50k,
      parent100k: parent5k.parent100k,
      regionalName: parent5k.regionalName,
      displayName: parent5k.regionalName ? `${sheetName} (${parent5k.regionalName})` : sheetName,
      subNum: subNum,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: centerLat,
      centerLon: centerLon
    };
  }

  /**
   * Enlem ve Boylama Göre 1/1 000 Ölçekli Paftayı Hesaplar
   * (1/2k'dan 2x2 = 4 parça -> 22.5" x 22.5" = 0.00625° x 0.00625° -> a, b, c, d)
   * Örn: J28-b4-13-2-a .. J28-b4-13-2-d
   */
  get1kSheet(lat, lon) {
    const parent2k = this.get2kSheet(lat, lon);
    const midLat = parent2k.minLat + 0.00625;
    const midLon = parent2k.minLon + 0.00625;

    let subLetter = "a";
    let minLat, maxLat, minLon, maxLon;
    if (lat >= midLat && lon < midLon) {
      subLetter = "a"; minLat = midLat; maxLat = parent2k.maxLat; minLon = parent2k.minLon; maxLon = midLon;
    } else if (lat >= midLat && lon >= midLon) {
      subLetter = "b"; minLat = midLat; maxLat = parent2k.maxLat; minLon = midLon; maxLon = parent2k.maxLon;
    } else if (lat < midLat && lon >= midLon) {
      subLetter = "c"; minLat = parent2k.minLat; maxLat = midLat; minLon = midLon; maxLon = parent2k.maxLon;
    } else {
      subLetter = "d"; minLat = parent2k.minLat; maxLat = midLat; minLon = parent2k.minLon; maxLon = midLon;
    }

    const sheetName = `${parent2k.name}-${subLetter}`;
    const centerLat = minLat + 0.003125;
    const centerLon = minLon + 0.003125;

    return {
      scale: "1/1 000",
      name: sheetName,
      sheetName: sheetName,
      parent2k: parent2k.name,
      parent5k: parent2k.parent5k,
      parent25k: parent2k.parent25k,
      parent50k: parent2k.parent50k,
      parent100k: parent2k.parent100k,
      regionalName: parent2k.regionalName,
      displayName: parent2k.regionalName ? `${sheetName} (${parent2k.regionalName})` : sheetName,
      subLetter: subLetter,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: centerLat,
      centerLon: centerLon
    };
  }

  /**
   * data/hgmDatumDatabase.json dosyasından HGM pafta datum ve yükseklik düzeltmelerini asenkron yükler
   */
  async loadHgmDatabase(url = "data/hgmDatumDatabase.json") {
    if (this.isHgmLoaded && this.hgmDatabase) return this.hgmDatabase;
    if (this.hgmLoadPromise) return this.hgmLoadPromise;

    this.hgmLoadPromise = (async () => {
      try {
        const basePath = typeof window !== "undefined" && window.location ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) : "./";
        const fullUrl = url.startsWith("http") || url.startsWith("/") ? url : `${basePath}${url}`;
        const res = await fetch(`${fullUrl}?v=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.hgmDatabase = await res.json();
        if (typeof window !== "undefined") {
          window.HGM_DATUM_CORRECTIONS = this.hgmDatabase;
        }
        this.isHgmLoaded = true;
        return this.hgmDatabase;
      } catch (err) {
        console.warn("HGM Datum Veritabanı (data/hgmDatumDatabase.json) yüklenemedi:", err);
        return null;
      }
    })();
    return this.hgmLoadPromise;
  }

  /**
   * HGM Resmi 1/25 000 Pafta Datum Düzeltme Katsayılarını (ΔX, ΔY, Δh/N, Δφ, Δλ) Getirir
   * Not: Türkiye'de HGM datum ve jeoit yükseklik düzeltmeleri 1/25 000 ölçekli standart paftalar bazındadır.
   */
  getHgmDatumRecord(sheetName, centerLat, centerLon) {
    const hgmDict = this.hgmDatabase || (typeof window !== "undefined" && window.HGM_DATUM_CORRECTIONS)
      ? (this.hgmDatabase || window.HGM_DATUM_CORRECTIONS)
      : (typeof global !== "undefined" && global.HGM_DATUM_CORRECTIONS ? global.HGM_DATUM_CORRECTIONS : null);

    let matchRecord = null;
    let resolved25kKey = sheetName ? sheetName.trim() : "";

    if (hgmDict && sheetName) {
      const rawKey = sheetName.trim();
      const normKey = sheetName.replace(/([A-Z]\d+)[-_]?([a-zA-Z])(\d)/, (_, p1, p2, p3) => `${p1.toUpperCase()}-${p2.toLowerCase()}${p3}`);
      matchRecord = hgmDict[normKey] || hgmDict[rawKey] || hgmDict[sheetName.toUpperCase()];
      if (matchRecord) {
        resolved25kKey = normKey || rawKey;
      }
    }

    // Doğrudan pafta adıyla eşleşmediyse koordinattan ilgili 1/25 000 HGM kuadranını türet
    if (!matchRecord && hgmDict && centerLat !== undefined && centerLon !== undefined && !isNaN(centerLat) && !isNaN(centerLon)) {
      const p50 = this.get50kSheet(centerLat, centerLon);
      const midLat = p50.minLat + 0.125;
      const midLon = p50.minLon + 0.125;
      let quad = 1;
      if (centerLat >= midLat && centerLon < midLon) quad = 1;
      else if (centerLat >= midLat && centerLon >= midLon) quad = 2;
      else if (centerLat < midLat && centerLon >= midLon) quad = 3;
      else quad = 4;
      const hgmKey = `${p50.name}${quad}`;
      resolved25kKey = hgmKey;
      matchRecord = hgmDict[hgmKey];
    }

    if (matchRecord) {
      return {
        pafta25k: resolved25kKey,
        enlemDuz: matchRecord[0],      // Enlem Düzeltmesi (Saniye)
        boylamDuz: matchRecord[1],     // Boylam Düzeltmesi (Saniye)
        yukariDuz: matchRecord[2],     // Yukarı Düzeltmesi ΔX (Metre)
        sagaDuz: matchRecord[3],       // Sağa Düzeltmesi ΔY (Metre)
        yukseklikDuz: matchRecord[4],  // Jeoit Yükseklik Undülasyonu N (Metre)
        isOfficial: true
      };
    }

    // Veritabanında eşleşmeyen sınır dışı bölgeler için polinomik enterpolasyon yaklaşımı
    const dLon = (centerLon !== undefined && !isNaN(centerLon)) ? centerLon - 35.0 : 0.0;
    const dLat = (centerLat !== undefined && !isNaN(centerLat)) ? centerLat - 39.0 : 0.0;

    let geoidApprox = 34.25 - dLon * 0.88 + dLat * 0.12 - (dLon ** 2) * 0.018 - (dLat ** 2) * 0.035 + dLat * 0.015 * dLon;
    if (centerLat > 38.0) {
      geoidApprox -= ((centerLat - 38.0) ** 1.3) * 0.18;
    }
    if (centerLon < 38.0 && centerLat > 34.0) {
      geoidApprox -= (1.0 - (centerLon - 35.5) / 2.5) * 1.8;
    }

    const dX_approx = 184.0 - dLon * 0.42 + dLat * 0.25;

    return {
      pafta25k: resolved25kKey,
      enlemDuz: Number((3.45 + dLat * 0.03).toFixed(2)),
      boylamDuz: Number((1.50 - dLon * 0.06).toFixed(2)),
      yukariDuz: Number(dX_approx.toFixed(1)),
      sagaDuz: Number((38.0 + dLon * 0.4).toFixed(1)),
      yukseklikDuz: Number(geoidApprox.toFixed(2)),
      isOfficial: false
    };
  }

  calculateGeoidUndulation(lat, lon, sheetName = "") {
    return this.getHgmDatumRecord(sheetName, lat, lon).yukseklikDuz;
  }

  calculateHeightCorrection(lat, lon, sheetName = "") {
    return this.getHgmDatumRecord(sheetName, lat, lon).yukariDuz;
  }

  /**
   * Noktanın dahil olduğu tüm ölçeklerdeki paftaları (100K, 50K, 25K) döndürür
   */
  getAllSheetsForPoint(lat, lon) {
    return {
      s100k: this.get100kSheet(lat, lon),
      s50k: this.get50kSheet(lat, lon),
      s25k: this.get25kSheet(lat, lon),
      s5k: this.get5kSheet(lat, lon),
      s2k: this.get2kSheet(lat, lon),
      s1k: this.get1kSheet(lat, lon)
    };
  }

  /**
   * 1/100 000 Paftasının Coğrafi Sınırlarını (BBOX) Döndürür
   */
  get100kBounds(code) {
    let letter = code[0].toUpperCase();
    if (letter === "İ") letter = "I";
    const col = parseInt(code.substring(1), 10);
    const minLat = this.letterToLatMin[letter];
    if (minLat === undefined) return null;
    const maxLat = minLat + 0.5;
    const minLon = (col + 36) / 2.0;
    const maxLon = minLon + 0.5;
    return { minLat, maxLat, minLon, maxLon };
  }

  /**
   * Bir Sınır Alanını 2x2 Dört Çeyreğe Böler (a/1: KB, b/2: KD, c/3: GD, d/4: GB)
   */
  getSubQuadBounds(bounds, quad) {
    const midLat = (bounds.minLat + bounds.maxLat) / 2.0;
    const midLon = (bounds.minLon + bounds.maxLon) / 2.0;
    const q = String(quad).toLowerCase();
    if (q === "a" || q === "1") {
      return { minLat: midLat, maxLat: bounds.maxLat, minLon: bounds.minLon, maxLon: midLon };
    } else if (q === "b" || q === "2") {
      return { minLat: midLat, maxLat: bounds.maxLat, minLon: midLon, maxLon: bounds.maxLon };
    } else if (q === "c" || q === "3") {
      return { minLat: bounds.minLat, maxLat: midLat, minLon: midLon, maxLon: bounds.maxLon };
    } else {
      return { minLat: bounds.minLat, maxLat: midLat, minLon: bounds.minLon, maxLon: midLon };
    }
  }

  /**
   * 1/25 000 Sınırını 5x5 = 25 Bloğa Böler (1..25) -> 1/5 000
   */
  get5kBlockBounds(b25, num) {
    const n = Math.min(25, Math.max(1, num));
    const r = Math.floor((n - 1) / 5);
    const c = (n - 1) % 5;
    const maxLat = b25.maxLat - r * 0.025;
    const minLat = maxLat - 0.025;
    const minLon = b25.minLon + c * 0.025;
    const maxLon = minLon + 0.025;
    return { minLat, maxLat, minLon, maxLon };
  }

  /**
   * Verilen Pafta Adından (Örn: "N21-d-13-b-2-a", "N21-d1-13-2", "N21-d1-13", "N21-d1", "J28-b4", "N21-d", "N21", "İSTANBUL")
   * Pafta Bilgisini ve Koordinat Sınırlarını Çözer (Reverse Geocoding)
   */
  resolveSheetByName(nameQuery) {
    if (!nameQuery) return null;
    let query = nameQuery.trim().toLocaleUpperCase("tr-TR");
    // İl / Bölge ön ekini temizle (Örn: "KOCAELI-F24-c-01-a" -> "F24-c-01-a")
    query = query.replace(/^[A-ZÇĞİÖŞÜ]+[-_](?=[A-SİI]\d)/i, "");
    const cleanQuery = query.replace(/\s+/g, "").replace(/_/g, "-");

    // Format 1: 1/1 000 -> N21-d1-13-2-a veya N21-d-1-13-2-a veya N21-d-13-b-2-a
    const m1k = cleanQuery.match(/^([A-SİI]\d{1,2})-?([A-D])[-_]?([1-4])?[-_]?(\d{1,2})[-_]([1-4]|[A-D])[-_]([A-D]|[1-4])$/i);
    if (m1k) {
      const [_, p100k, p50k, p25k, p5k, p2k, p1k] = m1k;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const b25 = this.getSubQuadBounds(b50, p25k ? parseInt(p25k, 10) : 1);
        const b5 = this.get5kBlockBounds(b25, parseInt(p5k, 10));
        const b2 = this.getSubQuadBounds(b5, p2k);
        const b1 = this.getSubQuadBounds(b2, p1k);
        const cLat = (b1.minLat + b1.maxLat) / 2.0;
        const cLon = (b1.minLon + b1.maxLon) / 2.0;
        return this.get1kSheet(cLat, cLon);
      }
    }

    // Format 2: 1/2 000 -> N21-d1-13-2 veya N21-d-1-13-2 veya N21-d-13-b-2
    const m2k = cleanQuery.match(/^([A-SİI]\d{1,2})-?([A-D])[-_]?([1-4])?[-_]?(\d{1,2})[-_]([1-4]|[A-D])$/i);
    if (m2k) {
      const [_, p100k, p50k, p25k, p5k, p2k] = m2k;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const b25 = this.getSubQuadBounds(b50, p25k ? parseInt(p25k, 10) : 1);
        const b5 = this.get5kBlockBounds(b25, parseInt(p5k, 10));
        const b2 = this.getSubQuadBounds(b5, p2k);
        const cLat = (b2.minLat + b2.maxLat) / 2.0;
        const cLon = (b2.minLon + b2.maxLon) / 2.0;
        return this.get2kSheet(cLat, cLon);
      }
    }

    // Format 3: 1/25 000 Resmi HGM & Ulusal Şablon -> N21-d1 veya N21-d-1 veya J28-b4 veya F21a1
    const m25kHgm = cleanQuery.match(/^([A-SİI]\d{1,2})-?([A-D])[-_]?([1-4])$/i);
    if (m25kHgm) {
      const [_, p100k, p50k, sub] = m25kHgm;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const b25 = this.getSubQuadBounds(b50, parseInt(sub, 10));
        const cLat = (b25.minLat + b25.maxLat) / 2.0;
        const cLon = (b25.minLon + b25.maxLon) / 2.0;
        return this.get25kSheet(cLat, cLon);
      }
    }

    // Format 4: 1/5 000 -> N21-d1-13 veya N21-d-1-13 veya N21-d-13
    const m5k = cleanQuery.match(/^([A-SİI]\d{1,2})-?([A-D])(?:[-_]?([1-4]))?[-_]?(\d{1,2})$/i);
    if (m5k) {
      const [_, p100k, p50k, p25k, p5k] = m5k;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const b25 = this.getSubQuadBounds(b50, p25k ? parseInt(p25k, 10) : 1);
        const b5 = this.get5kBlockBounds(b25, parseInt(p5k, 10));
        const cLat = (b5.minLat + b5.maxLat) / 2.0;
        const cLon = (b5.minLon + b5.maxLon) / 2.0;
        return this.get5kSheet(cLat, cLon);
      }
    }

    // Format 5: 1/50 000 -> N21-d veya J28-b
    const m50k = cleanQuery.match(/^([A-SİI]\d{1,2})-([A-D])$/i);
    if (m50k) {
      const [_, p100k, p50k] = m50k;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const cLat = (b50.minLat + b50.maxLat) / 2.0;
        const cLon = (b50.minLon + b50.maxLon) / 2.0;
        return this.get50kSheet(cLat, cLon);
      }
    }

    // Format 6: 1/100 000 -> N21 veya J28
    const m100k = cleanQuery.match(/^([A-SİI]\d{1,2})$/i);
    if (m100k) {
      const b100 = this.get100kBounds(m100k[1]);
      if (b100) {
        const cLat = (b100.minLat + b100.maxLat) / 2.0;
        const cLon = (b100.minLon + b100.maxLon) / 2.0;
        return this.get100kSheet(cLat, cLon);
      }
    }

    // Şehir / Bölge Adından Eşleştirme (Örn: "İSTANBUL", "ANKARA", "DENİZLİ")
    const normalizeTr = (str) => str.replace(/İ/g, "I").replace(/ı/g, "i").replace(/Ğ/g, "G").replace(/ğ/g, "g").replace(/Ü/g, "U").replace(/ü/g, "u").replace(/Ş/g, "S").replace(/ş/g, "s").replace(/Ö/g, "O").replace(/ö/g, "o").replace(/Ç/g, "C").replace(/ç/g, "c").toUpperCase();
    const normQuery = normalizeTr(query);

    for (const [code, cityName] of Object.entries(this.sheet100kTo250k)) {
      const normCity = normalizeTr(cityName);
      if (normCity === normQuery || normCity.includes(normQuery) || normQuery.includes(normCity)) {
        const b100 = this.get100kBounds(code);
        if (b100) {
          const cLat = (b100.minLat + b100.maxLat) / 2.0;
          const cLon = (b100.minLon + b100.maxLon) / 2.0;
          return this.get100kSheet(cLat, cLon);
        }
      }
    }

    return null;
  }

  /**
   * Harita Görünüm Alanındaki (BBOX) Tüm Paftaları Listeler
   * Ekran performansını korumak ve yarım pafta çizimini önlemek için otomatik ölçek adaptasyonu içerir.
   */
  getVisibleSheets(south, west, north, east, scale = "100k") {
    let curScale = scale === "10k" ? "5k" : scale;
    const minLat = Math.max(this.turkeyBounds.minLat, south);
    const minLon = Math.max(this.turkeyBounds.minLon, west);
    const maxLat = Math.min(this.turkeyBounds.maxLat, north);
    const maxLon = Math.min(this.turkeyBounds.maxLon, east);

    if (minLat >= maxLat || minLon >= maxLon) return [];

    const stepMap = { "100k": 0.5, "50k": 0.25, "25k": 0.125, "5k": 0.025, "2k": 0.0125, "1k": 0.00625 };
    const parentScaleMap = { "1k": "2k", "2k": "5k", "5k": "25k", "25k": "50k", "50k": "100k" };

    let step = stepMap[curScale] || 0.5;
    let numRows = Math.ceil((maxLat - minLat) / step);
    let numCols = Math.ceil((maxLon - minLon) / step);

    // Otomatik ölçek koruması: Ekranda 1200'den fazla pafta gerekiyorsa ve harita çok uzaktaysa
    // ekranın yarım kalmaması için tüm ekranı kapsayan uygun üst ölçeğe kademeli geçer.
    while (numRows * numCols > 1200 && parentScaleMap[curScale]) {
      curScale = parentScaleMap[curScale];
      step = stepMap[curScale] || 0.5;
      numRows = Math.ceil((maxLat - minLat) / step);
      numCols = Math.ceil((maxLon - minLon) / step);
    }

    const startLat = Math.floor(minLat / step) * step;
    const startLon = Math.floor(minLon / step) * step;
    const sheets = [];

    for (let curLat = startLat; curLat < maxLat - 1e-6; curLat += step) {
      for (let curLon = startLon; curLon < maxLon - 1e-6; curLon += step) {
        const centerLat = curLat + step / 2.0;
        const centerLon = curLon + step / 2.0;

        if (curScale === "100k") sheets.push(this.get100kSheet(centerLat, centerLon));
        else if (curScale === "50k") sheets.push(this.get50kSheet(centerLat, centerLon));
        else if (curScale === "25k") sheets.push(this.get25kSheet(centerLat, centerLon));
        else if (curScale === "5k") sheets.push(this.get5kSheet(centerLat, centerLon));
        else if (curScale === "2k") sheets.push(this.get2kSheet(centerLat, centerLon));
        else if (curScale === "1k") sheets.push(this.get1kSheet(centerLat, centerLon));
      }
    }

    return sheets;
  }

  /**
   * Paftanın 4 Köşe Koordinatlarını Döndürür
   */
  getSheetCorners(sheet) {
    return [
      { name: "KB (Kuzeybatı)", lat: sheet.maxLat, lon: sheet.minLon },
      { name: "KD (Kuzeydoğu)", lat: sheet.maxLat, lon: sheet.maxLon },
      { name: "GD (Güneydoğu)", lat: sheet.minLat, lon: sheet.maxLon },
      { name: "GB (Güneybatı)", lat: sheet.minLat, lon: sheet.minLon }
    ];
  }

  /**
   * Pafta Sınırlarını ve Etiketini AutoCAD .DXF Formatında İhraç Eder
   */
  exportSheetDxf(sheet, geodesyEngine = null) {
    const corners = this.getSheetCorners(sheet);
    let pts = corners.map(c => {
      if (geodesyEngine) {
        const dom = geodesyEngine.getAutoCentralMeridian3Deg(sheet.centerLon);
        const proj = geodesyEngine.forwardTM(c.lat, c.lon, dom, 1.0, false);
        return { x: proj.easting, y: proj.northing, z: 0.0 };
      }
      return { x: c.lon, y: c.lat, z: 0.0 };
    });

    let dxf = "0\nSECTION\n2\nENTITIES\n";
    dxf += "0\nLWPOLYLINE\n8\nPAFTA_SINIRLARI\n90\n4\n70\n1\n";
    for (let pt of pts) {
      dxf += `10\n${pt.x.toFixed(3)}\n20\n${pt.y.toFixed(3)}\n`;
    }

    const textX = ((pts[0].x + pts[1].x) / 2.0).toFixed(3);
    const textY = ((pts[0].y + pts[2].y) / 2.0).toFixed(3);
    dxf += `0\nTEXT\n8\nPAFTA_ETIKET\n10\n${textX}\n20\n${textY}\n40\n50.0\n1\n${sheet.name}\n`;
    dxf += "0\nENDSEC\n0\nEOF\n";

    return dxf;
  }

  /**
   * Pafta Köşe Koordinatlarını Netcad .NCN Dosyası Formatında İhraç Eder
   */
  exportSheetNcn(sheet, geodesyEngine = null) {
    const corners = this.getSheetCorners(sheet);
    let ncn = "";

    corners.forEach((c, idx) => {
      let xVal = c.lon;
      let yVal = c.lat;

      if (geodesyEngine) {
        const dom = geodesyEngine.getAutoCentralMeridian3Deg(sheet.centerLon);
        const proj = geodesyEngine.forwardTM(c.lat, c.lon, dom, 1.0, false);
        xVal = proj.easting;
        yVal = proj.northing;
      }

      const pName = `${sheet.name}_K${idx + 1}`.padEnd(14, " ");
      ncn += `${pName} ${xVal.toFixed(3).padStart(12, " ")} ${yVal.toFixed(3).padStart(12, " ")} ${"0.000".padStart(10, " ")}\n`;
    });

    return ncn;
  }

  /**
   * Verilen Bir Poligon veya Harita Sınırı ile Kesişen Paftaları Listeler
   */
  getIntersectingSheets(boundsObj, scale = "25k") {
    let south, west, north, east;

    if (boundsObj.getSouth && boundsObj.getNorth) {
      south = boundsObj.getSouth();
      west = boundsObj.getWest();
      north = boundsObj.getNorth();
      east = boundsObj.getEast();
    } else if (Array.isArray(boundsObj)) {
      south = boundsObj[0];
      west = boundsObj[1];
      north = boundsObj[2];
      east = boundsObj[3];
    } else {
      south = boundsObj.south ?? boundsObj.minLat;
      west = boundsObj.west ?? boundsObj.minLon;
      north = boundsObj.north ?? boundsObj.maxLat;
      east = boundsObj.east ?? boundsObj.maxLon;
    }

    const stepMap = { "100k": 0.5, "50k": 0.25, "25k": 0.05, "5k": 0.025, "2k": 0.0125, "1k": 0.00625 };
    const step = stepMap[scale] || 0.05;
    const startLat = Math.floor(south / step) * step;
    const startLon = Math.floor(west / step) * step;

    const matchedSheets = [];
    const addedSheetNames = new Set();

    for (let curLat = startLat; curLat < north + 1e-4; curLat += step) {
      for (let curLon = startLon; curLon < east + 1e-4; curLon += step) {
        const centerLat = curLat + step / 2.0;
        const centerLon = curLon + step / 2.0;

        let sheet = null;
        if (scale === "100k") sheet = this.get100kSheet(centerLat, centerLon);
        else if (scale === "50k") sheet = this.get50kSheet(centerLat, centerLon);
        else if (scale === "25k") sheet = this.get25kSheet(centerLat, centerLon);
        else if (scale === "5k") sheet = this.get5kSheet(centerLat, centerLon);
        else if (scale === "2k") sheet = this.get2kSheet(centerLat, centerLon);
        else if (scale === "1k") sheet = this.get1kSheet(centerLat, centerLon);

        if (sheet && !addedSheetNames.has(sheet.name)) {
          addedSheetNames.add(sheet.name);
          matchedSheets.push(sheet);
        }
      }
    }
    return matchedSheets.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Tekil Paftayı Google Earth .KML Formatında İhraç Eder
   */
  exportSheetKml(sheetNameOrObj) {
    const sheet = typeof sheetNameOrObj === "string" ? this.resolveSheetByName(sheetNameOrObj) : sheetNameOrObj;
    if (!sheet) return null;
    return this.exportMultipleSheetsKml([sheet], `Pafta - ${sheet.name}`);
  }

  exportSingleSheetKml(sheetNameOrObj) {
    return this.exportSheetKml(sheetNameOrObj);
  }

  /**
   * Tekil Paftayı GeoJSON Formatında İhraç Eder
   */
  exportSheetGeoJson(sheetNameOrObj) {
    const sheet = typeof sheetNameOrObj === "string" ? this.resolveSheetByName(sheetNameOrObj) : sheetNameOrObj;
    if (!sheet) return null;
    return this.exportMultipleSheetsGeoJson([sheet]);
  }

  exportSingleSheetGeoJson(sheetNameOrObj) {
    return this.exportSheetGeoJson(sheetNameOrObj);
  }

  /**
   * Çoklu Paftaları GeoJSON Formatında İhraç Eder
   */
  exportMultipleSheetsGeoJson(sheets) {
    const features = sheets.map(sh => {
      const datum = this.getHgmDatumRecord(sh.name, sh.centerLat, sh.centerLon);
      return {
        type: "Feature",
        properties: {
          name: sh.name,
          scale: sh.scale,
          regionalName: sh.regionalName || "",
          centerLat: sh.centerLat,
          centerLon: sh.centerLon,
          hgm_yukseklik_duz_m: datum.yukseklikDuz,
          hgm_yukari_duz_m: datum.yukariDuz,
          hgm_saga_duz_m: datum.sagaDuz,
          hgm_enlem_duz_arcsec: datum.enlemDuz,
          hgm_boylam_duz_arcsec: datum.boylamDuz
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[sh.minLon, sh.minLat], [sh.maxLon, sh.minLat], [sh.maxLon, sh.maxLat], [sh.minLon, sh.maxLat], [sh.minLon, sh.minLat]]]
        }
      };
    });

    return JSON.stringify({
      type: "FeatureCollection",
      features: features
    }, null, 2);
  }

  /**
   * Çoklu Paftaları Google Earth .KML Formatında İhraç Eder
   */
  exportMultipleSheetsKml(sheets, docName = "Temas Eden Paftalar") {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>${docName}</name>
<description>GNSS Pos Web Studio - Otomatik Pafta İndeks Çıktısı</description>
<Style id="paftaPolyStyle">
  <LineStyle><color>ff00d4ff</color><width>2.5</width></LineStyle>
  <PolyStyle><color>3300d4ff</color></PolyStyle>
</Style>
`;

    sheets.forEach(sh => {
      const datum = this.getHgmDatumRecord(sh.name, sh.centerLat, sh.centerLon);
      const corners = this.getSheetCorners(sh);
      let coordStr = "";
      corners.forEach(c => {
        coordStr += `${c.lon.toFixed(7)},${c.lat.toFixed(7)},0 `;
      });
      coordStr += `${corners[0].lon.toFixed(7)},${corners[0].lat.toFixed(7)},0`;

      kml += `
  <Placemark>
    <name>${sh.name} (${sh.scale})</name>
    <styleUrl>#paftaPolyStyle</styleUrl>
    <description><![CDATA[
      <b>Pafta Adı:</b> ${sh.name}<br/>
      <b>Ölçek:</b> ${sh.scale}<br/>
      <b>HGM Yükseklik Düz. (N):</b> ${datum.yukseklikDuz.toFixed(2)} m<br/>
      <b>HGM Yukarı Düz. (ΔX):</b> ${datum.yukariDuz.toFixed(1)} m<br/>
      <b>HGM Sağa Düz. (ΔY):</b> ${datum.sagaDuz.toFixed(1)} m<br/>
      <b>Merkez Konum:</b> ${sh.centerLat.toFixed(5)}° N, ${sh.centerLon.toFixed(5)}° E
    ]]></description>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>${coordStr}</coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>
`;
    });

    kml += "</Document>\n</kml>";
    return kml;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PaftaIndexEngine;
}
/* <<<<<<<<<< [END MODULE: js/modules/paftaIndexEngine.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/tg20GeoidEngine.js] >>>>>>>>>> */
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
/* <<<<<<<<<< [END MODULE: js/modules/tg20GeoidEngine.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/gnssReportTemplates.js] >>>>>>>>>> */
/**
 * =========================================================================================
 *  HARİTA TOOLS - GNSS STUDIO RAPOR ŞABLONLARI YÖNETİCİSİ (GnssReportTemplates)
 * =========================================================================================
 *  Single Source of Truth (Tek Kaynak) Mimarisi:
 *  Tüm rapor HTML ve CSS yapıları reports/ klasöründeki bağımsız şablon dosyalarından okunur:
 *  - reports/cadastre-karne.html (Resmi Kadastro Çift Okuma Karnesi)
 *  - reports/tg20-report.html    (TG-20 Jeoit İndirgeme ve Yükseklik Raporu)
 * =========================================================================================
 */

let cachedCadastreTemplate = "";
let cachedTg20Template = "";
let templatesLoadPromise = null;

/**
 * Tekil bir HTML rapor şablon dosyasını asenkron olarak yükler ve önbelleğe alır
 */
async function loadReportTemplate(templateName) {
  try {
    const basePath = (typeof window !== "undefined" && window.location.pathname)
      ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
      : '';
    const res = await fetch(`${basePath}reports/${templateName}.html?v=${Date.now()}`);
    if (res.ok) {
      const text = await res.text();
      if (templateName === "cadastre-karne") cachedCadastreTemplate = text;
      if (templateName === "tg20-report") cachedTg20Template = text;
      return text;
    }
  } catch (e) {
    console.warn(`Rapor şablonu (reports/${templateName}.html) yüklenemedi:`, e);
  }

  if (templateName === "cadastre-karne") return cachedCadastreTemplate;
  if (templateName === "tg20-report") return cachedTg20Template;
  return "";
}

/**
 * Tüm rapor şablonlarını paralel olarak tek seferde yükler
 */
async function loadAllTemplates() {
  if (cachedCadastreTemplate && cachedTg20Template) {
    return { cadastre: cachedCadastreTemplate, tg20: cachedTg20Template };
  }
  if (templatesLoadPromise) return templatesLoadPromise;

  templatesLoadPromise = (async () => {
    await Promise.all([
      loadReportTemplate("cadastre-karne"),
      loadReportTemplate("tg20-report")
    ]);
    return { cadastre: cachedCadastreTemplate, tg20: cachedTg20Template };
  })();

  return templatesLoadPromise;
}

/**
 * Senkron olarak Kadastro Karnesi şablonunu döner
 */
function getCadastreTemplate() {
  return cachedCadastreTemplate || "";
}

/**
 * Senkron olarak TG-20 Jeoit Raporu şablonunu döner
 */
function getTg20Template() {
  return cachedTg20Template || "";
}

// Global window nesnesi ve CommonJS desteği
if (typeof window !== "undefined") {
  window.GnssReportTemplates = {
    loadReportTemplate,
    loadAllTemplates,
    getCadastreTemplate,
    getTg20Template
  };

  // Sayfa yüklendiğinde arka planda tek kaynak şablonları çek
  loadAllTemplates();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadReportTemplate,
    loadAllTemplates,
    getCadastreTemplate,
    getTg20Template
  };
}

/* <<<<<<<<<< [END MODULE: js/modules/gnssReportTemplates.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/gnssFormatEngine.js] >>>>>>>>>> */
/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - GNSS KADASTRO & VERİ FORMAT MOTORU (GnssFormatEngine)
 * =========================================================================================
 *  - SurvCE / SurvStar (.RW5), FieldGenius / Carlson (.RAW), CHC LandStar / CSV, Trimble (.JXL)
 *  - Çift Okuma Kontrolü & Fark Analizi (BÖHHBÜY: dS ≤ 7cm, Δt ≥ 60 dk, Ortalama Koordinat Hesabı)
 *  - TG-20 Türkiye Hibrit Jeoidi ile Elipsoit Kotundan Ortometrik Kota İndirgeme (H = h - N)
 *  - Netcad (.NCN / .KOS), AutoCAD (.DXF), Google Earth (.KML) ve Kadastro CSV / HTML Rapor İhracı
 *  - DXF Çizim Dosyalarını GeoJSON Web Harita Vektör Katmanına Dönüştürme
 * =========================================================================================
 */

class GnssFormatEngine {
  constructor() {
    this.rawPoints = [];
    this.matchedPairs = [];
    this.unmatchedPoints = [];
    this.detectedBrand = "AUTO";
    this.geodesy = typeof GeodesyEngine !== "undefined" ? new GeodesyEngine() : null;
    this.centralMeridian = 30;
    this.geoidN = 34.455;
    this.isTg20Applied = false;
  }

  /**
   * Evrensel Otonom GNSS Karar Motoru (Universal Pattern & Data-Type Decision Engine)
   * Hiçbir marka veya yazılım adına bakmaksızın, doğrudan gelen verinin tipine,
   * sayısal büyüklüklerine ve desenlerine göre otonom karar verir.
   */
  parseData(content, fileName = "") {
    const text = content.trim();
    if (!text) return [];

    // 1. XML Veri Yapısı (JXL / LandXML vb.)
    if (text.startsWith("<?xml") || text.includes("<JOBFile") || text.includes("<FieldBook") || fileName.toLowerCase().endsWith(".jxl")) {
      this.detectedBrand = "XML Tabanlı Geodezik Veri";
      return this.parseTrimbleJxl(text);
    }

    // 2. Bloklu ve Etiketli Saha Kayıt Formatları (RW5, RAW, Saha Günlükleri)
    if (text.includes("GPS,") || text.includes("GS,") || text.includes("BP,") || text.includes("EP,") || text.includes("SP,") || text.includes("JB,") || text.includes("--")) {
      this.detectedBrand = "Otonom Saha Ölçü Akışı";
      return this.parseRw5(text);
    }

    // 3. Tablo / CSV / Ayrılmış Sütunlu Veri
    const firstLine = text.split("\n")[0] || "";
    if (firstLine.includes(",") || firstLine.includes(";") || firstLine.includes("\t")) {
      this.detectedBrand = "Tablo / Ayrılmış Sütunlu Koordinat Akışı";
      return this.parseCsv(text);
    }

    // 4. Serbest Sütunlu Sayı Dizisi
    this.detectedBrand = "Serbest Sütunlu Koordinat Akışı";
    return this.parseGenericText(text);
  }

  /**
   * Saf Sayısal ve Geodezik Örüntü Karar Motoru (Pure Heuristic Pattern Parser)
   * Satırları sayısal aralıklarına (Değer Büyüklüğü), zaman desenlerine ve
   * geodezik niteliklerine göre markadan bağımsız olarak çözümler.
   */
  parseRw5(rw5Content) {
    const lines = rw5Content.split("\n");
    const points = [];
    let curRecord = {};
    let isBaseContext = false;
    let fallbackDate = "";
    let fallbackTime = "";

    // 1. RW5 / Saha Başlığından Projeksiyon ve DOM Keşfi (Header Projection Scanner)
    let headerDom = null;
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
      const l = lines[i];
      const matchTm = l.match(/(?:3-derece\s+TM|TM\s+3°?|CM\s*|DOM\s*|Zone\s*)(\d{2})/i) || l.match(/Transverse\s+Mercator.*?(\d{2})/i);
      if (matchTm) {
        const domVal = parseInt(matchTm[1], 10);
        if ([27, 30, 33, 36, 39, 42, 45].includes(domVal)) {
          headerDom = domVal;
          this.centralMeridian = domVal;
          break;
        }
      }
    }

    // GPS Hafta & Zamanından Otonom UTC Çözümleyici
    const parseGpsTime = (week, towSec) => {
      const gpsEpoch = Date.UTC(1980, 0, 6, 0, 0, 0);
      const msInWeek = 7 * 24 * 3600 * 1000;
      const leapMs = 18000;
      return new Date(gpsEpoch + (week * msInWeek) + Math.round(towSec * 1000) - leapMs);
    };

    // Noktayı Otonom Doğrulayıp Kaydetme
    const commitPoint = () => {
      if (isBaseContext) {
        curRecord = {};
        return;
      }

      // En az bir nokta adı ve koordinat/enlem bilgisi mevcut mu?
      if (curRecord.pn && (curRecord.lat !== undefined || (curRecord.n !== undefined && curRecord.e !== undefined))) {
        // Otomatik DOM Keşfi (Eğer başlıkta yoksa, ilk noktanın boylamından tespit et)
        if (!headerDom && points.length === 0 && this.geodesy && curRecord.lon !== undefined) {
          this.centralMeridian = this.geodesy.getAutoCentralMeridian3Deg(curRecord.lon);
        }

        let easting = curRecord.e || 0;
        let northing = curRecord.n || 0;

        // Eğer ham veride gerçek uydu koordinatları (lat/lon) varsa
        if (this.geodesy && curRecord.lat !== undefined && curRecord.lon !== undefined) {
          if (curRecord.e && curRecord.n && Math.abs(curRecord.e) > 10000 && Math.abs(curRecord.n) > 10000) {
            easting = curRecord.e;
            northing = curRecord.n;
          } else {
            const tm = this.geodesy.forwardTM(curRecord.lat, curRecord.lon, this.centralMeridian, 1.0, false);
            easting = tm.easting;
            northing = tm.northing;
          }
        } else if (this.geodesy && (curRecord.lat === undefined || curRecord.lon === undefined) && curRecord.e && curRecord.n) {
          // Değer Büyüklüğüne Göre Northing (7 Basamak) ve Easting (6 Basamak) Otomatik Doğrulama
          if (easting > 1000000 && northing < 1000000 && northing > 0) {
            const tmp = easting;
            easting = northing;
            northing = tmp;
          }
          // Eğer sadece N, E varsa, ters projeksiyonla lat, lon hesapla
          const geo = this.geodesy.inverseTM(easting, northing, this.centralMeridian, 1.0, false);
          curRecord.lat = geo.lat;
          curRecord.lon = geo.lon;
        }

        curRecord.e = easting;
        curRecord.n = northing;
        curRecord.h = curRecord.elRaw !== undefined ? curRecord.elRaw : (curRecord.h !== undefined ? curRecord.h : null);
        curRecord.orthoH = curRecord.h !== null ? curRecord.h - this.geoidN : null;
        curRecord.latDec = curRecord.lat || 0;
        curRecord.lonDec = curRecord.lon || 0;
        curRecord.latDms = curRecord.lat ? (this.geodesy ? this.geodesy.toDms(curRecord.lat, true) : `${curRecord.lat.toFixed(7)}° N`) : "--";
        curRecord.lonDms = curRecord.lon ? (this.geodesy ? this.geodesy.toDms(curRecord.lon, false) : `${curRecord.lon.toFixed(7)}° E`) : "--";

        // Zaman Damgası
        if (!curRecord.timestamp) {
          const dStr = curRecord.dt || fallbackDate;
          const tStr = curRecord.tm || fallbackTime;
          if (dStr && tStr) {
            const [mo, da, yr] = dStr.split("-").map(Number);
            const [hh, mi, ss] = tStr.split(":").map(Number);
            curRecord.timestamp = new Date(yr || 2026, (mo || 1) - 1, da || 1, hh || 0, mi || 0, ss || 0);
          } else {
            curRecord.timestamp = null;
          }
        }

        if (!curRecord.dt) curRecord.dt = curRecord.timestamp ? curRecord.timestamp.toLocaleDateString("tr-TR") : "-";
        if (!curRecord.tm) curRecord.tm = curRecord.timestamp ? curRecord.timestamp.toLocaleTimeString("tr-TR") : "-";

        // Sayısal Hassasiyet ve Kalite Parametreleri - Sadece ham veride varsa gösterilir!
        curRecord.hsdvVal = curRecord.hsdv ? parseFloat(curRecord.hsdv) : (curRecord.hsdvVal || null);
        curRecord.vsdvVal = curRecord.vsdv ? parseFloat(curRecord.vsdv) : (curRecord.vsdvVal || null);
        curRecord.sats = curRecord.sats ? parseInt(curRecord.sats, 10) : (curRecord.sats || null);
        curRecord.pdop = curRecord.pdop ? parseFloat(curRecord.pdop).toFixed(2) : (curRecord.pdop || null);
        curRecord.status = curRecord.status ? curRecord.status.toUpperCase() : "-";
        curRecord.hr = curRecord.hr ? curRecord.hr : "-";
        curRecord.epochs = curRecord.epochs || null;
        curRecord.hz = curRecord.hz || null;
        curRecord.method = curRecord.method || "-";
        curRecord.network = curRecord.network || "-";
        curRecord.measure = curRecord.measure || "-";
        curRecord.code = curRecord.code || "";

        points.push(curRecord);
      }
      curRecord = {};
    };

    // Carlson RW5 DD.MMSSssss -> Ondalık Derece (Decimal Degrees) Çözümleyici
    const dmsToDecimal = (val) => {
      if (val === undefined || val === null || isNaN(val)) return 0;
      const isNeg = val < 0;
      const absVal = Math.abs(val);
      const deg = Math.floor(absVal);
      const minSec = (absVal - deg) * 100;
      const min = Math.floor(minSec + 1e-9);
      const sec = (minSec - min) * 100;
      // Eğer dakika veya saniye 60 veya daha büyükse, bu değer zaten saf ondalık derecedir
      if (min >= 60 || sec >= 60) {
        return val;
      }
      const decimal = deg + min / 60 + sec / 3600;
      return isNeg ? -decimal : decimal;
    };

    // Saf Değer ve Tip Ayrıştırıcı (Marka Metinlerinden Tamamen Bağımsız)
    const extractValueByPattern = (token) => {
      const s = token.trim();
      if (!s) return;

      // 1. Kot / Yükseklik Kalıpları
      if (/^(EL|ELEV|HT|HEIGHT|Z)[\s:]/i.test(s) || (/^EL[\d.-]/i.test(s) && !/^ELIP/i.test(s))) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) { curRecord.h = v; curRecord.elRaw = v; }
      }
      // 2. Coğrafi Enlem Kalıpları (Carlson RW5 formatında LA: DD.MMSSssss)
      else if (/^(LA|LAT|LATITUDE)[\s:]?/i.test(s)) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) {
          curRecord.latRaw = v;
          curRecord.lat = dmsToDecimal(v);
        }
      }
      // 3. Coğrafi Boylam Kalıpları (Carlson RW5 formatında LN: DD.MMSSssss)
      else if (/^(LN|LON|LONG|LONGITUDE)[\s:]?/i.test(s)) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) {
          curRecord.lonRaw = v;
          curRecord.lon = dmsToDecimal(v);
        }
      }
      // 4. Projeksiyon Kuzey / Northing Kalıpları
      else if (/^(N|NORTH|NOR)[\s:]/i.test(s) || (/^N[\d.-]/i.test(s) && !/^NO/i.test(s))) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) curRecord.n = v;
      }
      // 5. Projeksiyon Doğu / Easting Kalıpları
      else if (/^(E|EAST|EAS)[\s:]/i.test(s) || (/^E[\d.-]/i.test(s) && !/^(EL|EP|ET)/i.test(s))) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) curRecord.e = v;
      }
    };

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // A. OTONOM BAZ İSTASYONU TESPİTİ (Sadece geodezik baz belirteçleri)
      if (line.startsWith("BP,") || line.startsWith("--BP,") || line.includes("SRBASE") || line.includes("Base Configuration") || line.includes("OCCUPY")) {
        commitPoint();
        isBaseContext = true;
        continue;
      }

      // B. OTONOM NOKTA BAŞLANGICI (Herhangi bir nokta başlatan kayıt: GPS, EP, SP, AP, POS, PNT vb.)
      if (line.startsWith("GPS,") || line.startsWith("--GPS,") || line.startsWith("EP,") || line.startsWith("SP,") || line.startsWith("AP,") || line.startsWith("POS,") || line.startsWith("PNT,")) {
        commitPoint();
        isBaseContext = false;
        const parts = line.split(",");
        if (parts.length >= 2) {
          curRecord.pn = parts[1].replace(/^(PN|EP|SP|AP|POS|PNT):?/i, "").trim();
          for (let seg of parts.slice(2)) {
            extractValueByPattern(seg);
          }
        }
      }
      // C. KOORDİNAT VERİ SATIRLARI (GS, --GS vb.)
      else if (line.startsWith("GS,") || line.startsWith("--GS,")) {
        if (isBaseContext) continue;
        const parts = line.split(",");
        if (parts.length >= 2) {
          const possiblePn = parts[1].replace(/^(PN|POS):?/i, "").trim();
          if (curRecord.pn && curRecord.pn !== possiblePn && (curRecord.n !== undefined || curRecord.lat !== undefined)) {
            commitPoint();
          }
          if (!curRecord.pn) curRecord.pn = possiblePn;
          for (let seg of parts.slice(2)) {
            extractValueByPattern(seg);
          }
        }
      }
      // D. GPS ZAMAN VE HAFTA DESENİ
      else if (line.includes("SW") && line.includes("ST") && (line.startsWith("--GT") || line.startsWith("GT"))) {
        const parts = line.split(",");
        let swVal = null;
        let stVal = null;
        for (let p of parts) {
          p = p.trim();
          if (p.startsWith("SW")) swVal = parseInt(p.substring(2), 10);
          else if (p.startsWith("ST")) stVal = parseFloat(p.substring(2)) / (p.length > 8 ? 1000.0 : 1.0);
        }
        if (swVal !== null && stVal !== null) {
          const dtObj = parseGpsTime(swVal, stVal);
          if (!isNaN(dtObj.getTime())) {
            curRecord.timestamp = dtObj;
            curRecord.dt = `${String(dtObj.getUTCMonth() + 1).padStart(2, "0")}-${String(dtObj.getUTCDate()).padStart(2, "0")}-${dtObj.getUTCFullYear()}`;
            curRecord.tm = `${String(dtObj.getUTCHours()).padStart(2, "0")}:${String(dtObj.getUTCMinutes()).padStart(2, "0")}:${String(dtObj.getUTCSeconds()).padStart(2, "0")}`;
          }
        }
      }
      // E. TARİH VE SAAT DESENLERİ
      else if (line.startsWith("JB,") || line.startsWith("JOB,")) {
        const parts = line.split(",");
        for (let p of parts) {
          p = p.trim();
          if (p.startsWith("DT")) fallbackDate = p.substring(2).trim();
          else if (p.startsWith("TM")) fallbackTime = p.substring(2).trim();
        }
      } else if (line.startsWith("--DT") || line.startsWith("--Date:") || line.startsWith("DT,")) {
        const d = line.replace(/^(--DT|--Date:|DT,):?/i, "").trim();
        if (!isBaseContext) curRecord.dt = d;
        if (!fallbackDate) fallbackDate = d;
      } else if (line.startsWith("--TM") || line.startsWith("--Time:") || line.startsWith("TM,")) {
        const t = line.replace(/^(--TM|--Time:|TM,):?/i, "").trim();
        if (!isBaseContext) curRecord.tm = t;
        if (!fallbackTime) fallbackTime = t;
      }
      // F. JALON VE ANTEN YÜKSEKLİK DESENLERİ
      else if (line.includes("HR:") || line.startsWith("LS,HR") || line.includes("Jalon") || line.includes("Antenna")) {
        const m = line.match(/(?:HR|HT|Jalon Y\w+kseklik):\s*([\d.]+)/i) || line.match(/LS,HR\s*([\d.]+)/i);
        if (m) curRecord.hr = m[1];
      }
      // G. KALİTE VE RMS DEĞERLERİ
      else if (line.includes("HSDV") || line.includes("RMS") || line.includes("STATUS:") || line.includes("SATS:")) {
        const tokens = line.replace(/^--/, "").split(",");
        for (let t of tokens) {
          if (t.includes(":")) {
            const [k, v] = t.split(":");
            curRecord[k.trim().toLowerCase()] = v.trim();
          }
        }
      }
      // H. SAYISAL İSTATİSTİK VE ORTALAMA DEĞERLER
      else if (line.includes("Avg:")) {
        const mNor = line.match(/(?:Nor|North|Yukarı)\s*Avg:\s*([\d.]+)/i);
        if (mNor) curRecord.n = parseFloat(mNor[1]);
        const mEas = line.match(/(?:Eas|East|Sağa)\s*Avg:\s*([\d.]+)/i);
        if (mEas) curRecord.e = parseFloat(mEas[1]);
        const mElv = line.match(/(?:Elv|Elev|Kot|Height)\s*Avg:\s*([\d.]+)/i);
        if (mElv) {
          curRecord.h = parseFloat(mElv[1]);
          curRecord.elRaw = parseFloat(mElv[1]);
        }
        const mHsdv = line.match(/(?:HSDV|HRMS)\s*Avg:\s*([\d.]+)/i);
        if (mHsdv) curRecord.hsdvVal = parseFloat(mHsdv[1]);
        const mVsdv = line.match(/(?:VSDV|VRMS)\s*Avg:\s*([\d.]+)/i);
        if (mVsdv) curRecord.vsdvVal = parseFloat(mVsdv[1]);
        const mPdop = line.match(/PDOP\s*Avg:\s*([\d.]+)/i);
        if (mPdop) curRecord.pdop = parseFloat(mPdop[1]).toFixed(2);
        const mSats = line.match(/(?:Satellites|Uydu)\s*Avg:\s*(\d+)/i);
        if (mSats) curRecord.sats = parseInt(mSats[1], 10);
        const mFixed = line.match(/Fixed\s*Readings:\s*(\d+)\s+of\s+(\d+)/i);
        if (mFixed) {
          curRecord.epochs = parseInt(mFixed[2], 10);
          curRecord.status = parseInt(mFixed[1], 10) > 0 ? "FIXED" : "FLOAT";
        }
      }
    }

    commitPoint();

    this.rawPoints = points;
    return points;
  }

  /**
   * FieldGenius / Carlson RAW Formatını Ayrıştırır
   */
  parseRawFieldGenius(rawContent) {
    return this.parseRw5(rawContent);
  }

  /**
   * CHCNAV LandStar veya Standart CSV Tablo Formatını Ayrıştırır
   */
  parseCsv(csvContent) {
    const lines = csvContent.split("\n");
    const points = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || (i === 0 && (line.toLowerCase().includes("point") || line.toLowerCase().includes("nokta") || line.toLowerCase().includes("easting")))) {
        continue;
      }

      const cols = line.split(/[,;\t]/).map(c => c.trim());
      if (cols.length >= 3) {
        const pName = cols[0];
        const coord1 = parseFloat(cols[1]);
        const coord2 = parseFloat(cols[2]);
        const coordH = cols.length >= 4 && !isNaN(parseFloat(cols[3])) ? parseFloat(cols[3]) : null;

        if (!isNaN(coord1) && !isNaN(coord2)) {
          // Gerçek GNSS telemetrisi (Tarih, saat, uydu, RMS) mevcut mu kontrolü - Asla uydurma değer atanmaz!
          const hasTime = cols.length >= 5 && (cols[4].includes("-") || cols[4].includes("/") || cols[4].includes("."));
          const hasTelemetry = hasTime || (cols.length >= 8 && !isNaN(parseFloat(cols[6])));

          const dateStr = hasTime ? cols[4] : "-";
          const timeStr = hasTime && cols[5] ? cols[5] : "-";
          const sats = hasTelemetry && cols[6] && !isNaN(parseInt(cols[6], 10)) ? parseInt(cols[6], 10) : null;
          const pdop = hasTelemetry && cols[7] && !isNaN(parseFloat(cols[7])) ? parseFloat(cols[7]).toFixed(2) : null;
          const hsdv = hasTelemetry && cols[8] && !isNaN(parseFloat(cols[8])) ? parseFloat(cols[8]) : null;

          let ts = null;
          if (hasTime && dateStr !== "-") {
            const parsedTs = new Date(dateStr + (timeStr !== "-" ? ` ${timeStr}` : ""));
            if (!isNaN(parsedTs.getTime())) ts = parsedTs;
          }

          // Sağa Değer (Y) ve Yukarı Değer (X) Ayrımı (X > Y)
          const easting = coord1 > coord2 ? coord2 : coord1;
          const northing = coord1 > coord2 ? coord1 : coord2;
          const hVal = coordH;

          let lat = 39.0;
          let lon = 35.0;
          if (this.geodesy) {
            const geo = this.geodesy.inverseTM(easting, northing, this.centralMeridian, 1.0, false);
            lat = geo.lat;
            lon = geo.lon;
          }

          points.push({
            pn: pName,
            e: easting,
            n: northing,
            h: hVal,
            orthoH: hVal !== null ? hVal - this.geoidN : null,
            dt: dateStr,
            tm: timeStr,
            timestamp: ts,
            hsdvVal: hsdv,
            vsdvVal: (hsdv !== null && cols[9] && !isNaN(parseFloat(cols[9]))) ? parseFloat(cols[9]) : null,
            sats: sats,
            pdop: pdop,
            status: (hasTelemetry && cols[14]) ? cols[14].toUpperCase() : "-",
            hr: (hasTelemetry && cols[15]) ? cols[15] : "-",
            epochs: (hasTelemetry && cols[10] && !isNaN(parseInt(cols[10], 10))) ? parseInt(cols[10], 10) : null,
            hz: null,
            method: (hasTelemetry && cols[12]) ? cols[12] : "-",
            network: (hasTelemetry && cols[13]) ? cols[13] : "-",
            measure: "-",
            code: (!hasTelemetry && cols[4]) ? cols[4] : "",
            lat: lat,
            lon: lon,
            latDec: lat,
            lonDec: lon,
            latDms: this.geodesy ? this.geodesy.toDms(lat, true) : `${lat.toFixed(7)}° N`,
            lonDms: this.geodesy ? this.geodesy.toDms(lon, false) : `${lon.toFixed(7)}° E`,
            isStaticCoordinate: !hasTelemetry
          });
        }
      }
    }

    this.rawPoints = points;
    return points;
  }

  /**
   * Boşlukla Ayrılmış Genel Koordinat Metinlerini (Nokta No, Y, X, Z) Ayrıştırır
   * Not: Asla default/uydurma değer ataması yapılmaz. Datada ne varsa sadece o gösterilir.
   */
  parseGenericText(textContent) {
    const lines = textContent.split("\n");
    const points = [];

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("//") || line.startsWith("#")) continue;

      const tokens = line.split(/\s+/);
      if (tokens.length >= 3) {
        const pName = tokens[0];
        const coord1 = parseFloat(tokens[1]);
        const coord2 = parseFloat(tokens[2]);
        const hVal = tokens.length >= 4 && !isNaN(parseFloat(tokens[3])) ? parseFloat(tokens[3]) : null;

        if (!isNaN(coord1) && !isNaN(coord2)) {
          // Sağa Değer (Y) ve Yukarı Değer (X) Ayrımı (X > Y)
          const easting = coord1 > coord2 ? coord2 : coord1;
          const northing = coord1 > coord2 ? coord1 : coord2;
          let lat = 39.0;
          let lon = 35.0;
          if (this.geodesy) {
            const geo = this.geodesy.inverseTM(easting, northing, this.centralMeridian, 1.0, false);
            lat = geo.lat;
            lon = geo.lon;
          }

          points.push({
            pn: pName,
            e: easting,
            n: northing,
            h: hVal,
            orthoH: hVal !== null ? hVal - this.geoidN : null,
            dt: "-",
            tm: "-",
            timestamp: null,
            hsdvVal: null,
            vsdvVal: null,
            sats: null,
            pdop: null,
            status: "-",
            hr: "-",
            epochs: null,
            hz: null,
            method: "-",
            network: "-",
            measure: "-",
            code: tokens[4] || "",
            lat: lat,
            lon: lon,
            latDec: lat,
            lonDec: lon,
            latDms: this.geodesy ? this.geodesy.toDms(lat, true) : `${lat.toFixed(7)}° N`,
            lonDms: this.geodesy ? this.geodesy.toDms(lon, false) : `${lon.toFixed(7)}° E`,
            isStaticCoordinate: true
          });
        }
      }
    }

    this.rawPoints = points;
    return points;
  }

  /**
   * Trimble Access (.JXL) XML Formatını Ayrıştırır
   * Not: Sadece XML içerisindeki gerçek düğümler (TimeStamp, Precision vb.) okunur, asla default atanmaz.
   */
  parseTrimbleJxl(jxlContent) {
    const points = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(jxlContent, "text/xml");
    const records = xmlDoc.getElementsByTagName("PointRecord");

    for (let rec of records) {
      const pName = rec.getElementsByTagName("Name")[0]?.textContent || "";
      const gridNodes = rec.getElementsByTagName("Grid");

      let northing = null;
      let easting = null;
      let elev = null;

      if (gridNodes.length > 0) {
        const nNode = gridNodes[0].getElementsByTagName("North")[0]?.textContent;
        const eNode = gridNodes[0].getElementsByTagName("East")[0]?.textContent;
        const elNode = gridNodes[0].getElementsByTagName("Elevation")[0]?.textContent;
        if (nNode && !isNaN(parseFloat(nNode))) northing = parseFloat(nNode);
        if (eNode && !isNaN(parseFloat(eNode))) easting = parseFloat(eNode);
        if (elNode && !isNaN(parseFloat(elNode))) elev = parseFloat(elNode);
      }

      if (pName && (northing !== null || easting !== null)) {
        let lat = 39.0;
        let lon = 35.0;
        if (this.geodesy && easting !== null && northing !== null) {
          const geo = this.geodesy.inverseTM(easting, northing, this.centralMeridian, 1.0, false);
          lat = geo.lat;
          lon = geo.lon;
        }

        // Zaman damgası çıkarımı - Sadece XML'de varsa
        const tsNode = rec.getElementsByTagName("TimeStamp")[0] || rec.getElementsByTagName("DateTime")[0];
        let dt = "-";
        let tm = "-";
        let timestamp = null;
        if (tsNode && tsNode.textContent) {
          const parsedTs = new Date(tsNode.textContent.trim());
          if (!isNaN(parsedTs.getTime())) {
            timestamp = parsedTs;
            dt = parsedTs.toLocaleDateString("tr-TR");
            tm = parsedTs.toLocaleTimeString("tr-TR");
          }
        }

        // Hassasiyet ve kalite parametreleri - Sadece XML'de varsa
        const precH = parseFloat(rec.getElementsByTagName("HorizontalPrecision")[0]?.textContent || rec.getElementsByTagName("Horizontal")[0]?.textContent || "");
        const precV = parseFloat(rec.getElementsByTagName("VerticalPrecision")[0]?.textContent || rec.getElementsByTagName("Vertical")[0]?.textContent || "");
        const pdopNode = rec.getElementsByTagName("PDOP")[0]?.textContent;
        const satsNode = rec.getElementsByTagName("NumberOfSatellites")[0]?.textContent || rec.getElementsByTagName("Satellites")[0]?.textContent;
        const methodNode = rec.getElementsByTagName("Method")[0]?.textContent;
        const solTypeNode = rec.getElementsByTagName("SolutionType")[0]?.textContent ||
                            rec.getElementsByTagName("FixType")[0]?.textContent ||
                            rec.getElementsByTagName("Quality")[0]?.textContent ||
                            rec.getElementsByTagName("Status")[0]?.textContent;
        const antHtNode = rec.getElementsByTagName("AntennaHeight")[0]?.textContent ||
                          rec.getElementsByTagName("TargetHeight")[0]?.textContent ||
                          rec.getElementsByTagName("RodHeight")[0]?.textContent;

        const hsdv = !isNaN(precH) ? precH : null;
        const vsdv = !isNaN(precV) ? precV : null;
        const pdop = pdopNode && !isNaN(parseFloat(pdopNode)) ? parseFloat(pdopNode).toFixed(2) : null;
        const sats = satsNode && !isNaN(parseInt(satsNode, 10)) ? parseInt(satsNode, 10) : null;
        const statusVal = solTypeNode ? solTypeNode.trim().toUpperCase() : "-";
        const antHt = antHtNode && !isNaN(parseFloat(antHtNode)) ? parseFloat(antHtNode).toFixed(3) : "-";

        points.push({
          pn: pName,
          n: northing,
          e: easting,
          h: elev,
          orthoH: elev !== null ? elev - this.geoidN : null,
          dt: dt,
          tm: tm,
          timestamp: timestamp,
          hsdvVal: hsdv,
          vsdvVal: vsdv,
          sats: sats,
          pdop: pdop,
          status: statusVal,
          hr: antHt,
          epochs: null,
          hz: null,
          method: methodNode || "-",
          network: "-",
          measure: "-",
          code: rec.getElementsByTagName("Code")[0]?.textContent || "",
          lat: lat,
          lon: lon,
          latDec: lat,
          lonDec: lon,
          latDms: this.geodesy ? this.geodesy.toDms(lat, true) : `${lat.toFixed(7)}° N`,
          lonDms: this.geodesy ? this.geodesy.toDms(lon, false) : `${lon.toFixed(7)}° E`,
          isStaticCoordinate: !timestamp
        });
      }
    }

    this.rawPoints = points;
    return points;
  }

  /**
   * Saniye Cinsinden Zaman Farkını Doğal Türkçe Formatına Dönüştürür (örn: "22 sn", "14 dk 30 sn", "1 sa 15 dk")
   */
  formatHumanTimeDiff(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    if (s < 60) return `${s} sn`;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins < 60) return secs > 0 ? `${mins} dk ${secs} sn` : `${mins} dk`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hours} sa ${remMins} dk` : `${hours} sa`;
  }

  /**
   * BÖHHBÜY / Kadastro Standartlarında Çift Okuma Kontrolü & Fark Analizi Yapar
   */
  analyzeDoubleReadings(maxDistCm = 7.0, minTimeDiffMin = 60, matchRadiusM = 1.0) {
    const points = this.rawPoints;
    const matchedList = [];
    const usedIndices = new Set();

    for (let i = 0; i < points.length; i++) {
      if (usedIndices.has(i)) continue;
      const p1 = points[i];
      let bestMatch = null;
      let minDistance = 999999;

      for (let j = 0; j < points.length; j++) {
        if (i === j || usedIndices.has(j)) continue;
        const p2 = points[j];
        const dy = p2.e - p1.e;
        const dx = p2.n - p1.n;
        const dist2d = Math.hypot(dy, dx);

        if (dist2d <= matchRadiusM && dist2d < minDistance) {
          minDistance = dist2d;
          bestMatch = { j: j, p2: p2, dist2d: dist2d };
        }
      }

      if (bestMatch) {
        const { j: matchIdx, p2, dist2d } = bestMatch;
        usedIndices.add(i);
        usedIndices.add(matchIdx);

        const dyCm = (p2.e - p1.e) * 100.0;
        const dxCm = (p2.n - p1.n) * 100.0;
        const dhCm = (p2.h - p1.h) * 100.0;
        const ds2dCm = dist2d * 100.0;
        const ds3dCm = Math.hypot(dist2d, p2.h - p1.h) * 100.0;

        let timeDiffSec = 0;
        if (p1.timestamp && p2.timestamp) {
          timeDiffSec = Math.abs(p2.timestamp - p1.timestamp) / 1000.0;
        }
        const timeDiffMin = timeDiffSec / 60.0;

        const isDistPassed = ds2dCm <= maxDistCm;
        const isTimePassed = timeDiffMin >= minTimeDiffMin;

        const avgEasting = (p1.e + p2.e) / 2.0;
        const avgNorthing = (p1.n + p2.n) / 2.0;
        const avgHeight = (p1.h + p2.h) / 2.0;

        matchedList.push({
          p1: p1,
          p2: p2,
          pointName: p1.pn === p2.pn ? p1.pn : `${p1.pn} / ${p2.pn}`,
          dy: dyCm.toFixed(1),
          dx: dxCm.toFixed(1),
          dh: dhCm.toFixed(1),
          ds2d: ds2dCm.toFixed(1),
          ds3d: ds3dCm.toFixed(1),
          timeDiffSec: Math.round(timeDiffSec),
          timeDiffMin: timeDiffMin.toFixed(1),
          timeDiffStr: this.formatHumanTimeDiff(timeDiffSec),
          timeDiffHours: (timeDiffMin / 60.0).toFixed(2),
          isDistPassed: isDistPassed,
          isTimePassed: isTimePassed,
          avgE: avgEasting.toFixed(3),
          avgN: avgNorthing.toFixed(3),
          avgH: avgHeight.toFixed(3)
        });
      }
    }

    const unmatchedList = [];
    for (let i = 0; i < points.length; i++) {
      if (!usedIndices.has(i)) {
        unmatchedList.push(points[i]);
      }
    }

    this.matchedPairs = matchedList;
    this.unmatchedPoints = unmatchedList;

    return {
      matched: matchedList,
      unmatched: unmatchedList,
      matchedPairs: matchedList,
      unmatchedPoints: unmatchedList
    };
  }

  /**
   * Formatlanmış Metin Çıktısı Üretir
   */
  exportFormattedCoordinateList(formatType = "Pt,E,N,h") {
    let out = "";
    for (let p of this.rawPoints) {
      const eStr = p.e !== null && p.e !== undefined ? p.e.toFixed(3) : "-";
      const nStr = p.n !== null && p.n !== undefined ? p.n.toFixed(3) : "-";
      const hStr = p.h !== null && p.h !== undefined ? p.h.toFixed(3) : "-";

      if (formatType === "Pt,E,N,h") {
        out += `${p.pn.padEnd(10, " ")} ${eStr.padStart(12, " ")} ${nStr.padStart(12, " ")} ${hStr.padStart(10, " ")}\n`;
      } else if (formatType === "Pt,N,E,h") {
        out += `${p.pn.padEnd(10, " ")} ${nStr.padStart(12, " ")} ${eStr.padStart(12, " ")} ${hStr.padStart(10, " ")}\n`;
      } else if (formatType === "E,N,h,Pt") {
        out += `${eStr.padStart(12, " ")} ${nStr.padStart(12, " ")} ${hStr.padStart(10, " ")}   ${p.pn}\n`;
      } else if (formatType === "CSV_Y_X_H") {
        out += `${p.pn},${eStr},${nStr},${hStr}\n`;
      }
    }
    return out;
  }

  /**
   * HGM TG-20 Türkiye Hibrit Jeoidi İndirgemesi Uygular (H = h - N)
   */
  applyTg20Reduction(tg20Engine, fallbackGeodesyEngine = null, customEngine = null, applyState = true) {
    this.isTg20Applied = applyState;

    if (!applyState || !tg20Engine) {
      for (let pair of this.matchedPairs) {
        pair.isTg20Applied = false;
        pair.currentH = pair.avgH;
      }
      for (let pt of this.unmatchedPoints) {
        pt.isTg20Applied = false;
        pt.currentH = pt.h !== null && pt.h !== undefined ? pt.h.toFixed(3) : "-";
      }
      for (let pt of this.rawPoints) {
        pt.isTg20Applied = false;
        pt.currentH = pt.h !== null && pt.h !== undefined ? pt.h.toFixed(3) : "-";
      }
      return true;
    }

    const dom = this.centralMeridian || 30;
    const geodesy = this.geodesy || fallbackGeodesyEngine;

    // 1. Çift Okumaları İndirge
    for (let pair of this.matchedPairs) {
      const avgE = parseFloat(pair.avgE);
      const avgN = parseFloat(pair.avgN);
      const avgH = parseFloat(pair.avgH);

      let lat = pair.p1?.lat || pair.p1?.latDec || pair.p2?.lat || pair.p2?.latDec;
      let lon = pair.p1?.lon || pair.p1?.lonDec || pair.p2?.lon || pair.p2?.lonDec;

      if ((!lat || !lon) && geodesy && avgE && avgN) {
        try {
          const geo = geodesy.inverseTM(avgE, avgN, dom);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }

      if (lat && lon && !isNaN(avgH)) {
        const red = tg20Engine.reduceHeight(lat, lon, avgH);
        if (red.inBounds && red.N !== null) {
          pair.tg20N = red.N.toFixed(3);
          pair.avgOrthoH = red.H.toFixed(3);
          pair.currentH = pair.avgOrthoH;
          pair.isTg20Applied = true;
        } else {
          pair.isTg20Applied = false;
          pair.currentH = pair.avgH;
        }
      } else {
        pair.isTg20Applied = false;
        pair.currentH = pair.avgH;
      }
    }

    // 2. Ham Noktaları İndirge
    for (let pt of this.rawPoints) {
      let lat = pt.lat || pt.latDec;
      let lon = pt.lon || pt.lonDec;

      if ((!lat || !lon) && geodesy && pt.e && pt.n) {
        try {
          const geo = geodesy.inverseTM(pt.e, pt.n, dom);
          lat = geo.lat;
          lon = geo.lon;
          pt.lat = lat;
          pt.lon = lon;
          pt.latDec = lat;
          pt.lonDec = lon;
        } catch (e) {}
      }

      if (lat && lon && pt.h !== null && pt.h !== undefined && !isNaN(pt.h)) {
        const red = tg20Engine.reduceHeight(lat, lon, pt.h);
        if (red.inBounds && red.N !== null) {
          pt.tg20N = red.N.toFixed(3);
          pt.orthoH = red.H;
          pt.currentH = red.H.toFixed(3);
          pt.isTg20Applied = true;
        } else {
          pt.isTg20Applied = false;
          pt.currentH = pt.h.toFixed(3);
        }
      } else {
        pt.isTg20Applied = false;
        pt.currentH = pt.h !== null && pt.h !== undefined ? pt.h.toFixed(3) : "-";
      }
    }

    // 3. Tekil Noktaları İndirge
    for (let pt of this.unmatchedPoints) {
      let lat = pt.lat || pt.latDec;
      let lon = pt.lon || pt.lonDec;

      if ((!lat || !lon) && geodesy && pt.e && pt.n) {
        try {
          const geo = geodesy.inverseTM(pt.e, pt.n, dom);
          lat = geo.lat;
          lon = geo.lon;
          pt.lat = lat;
          pt.lon = lon;
          pt.latDec = lat;
          pt.lonDec = lon;
        } catch (e) {}
      }

      if (lat && lon && pt.h !== null && pt.h !== undefined && !isNaN(pt.h)) {
        const red = tg20Engine.reduceHeight(lat, lon, pt.h);
        if (red.inBounds && red.N !== null) {
          pt.tg20N = red.N.toFixed(3);
          pt.orthoH = red.H;
          pt.currentH = red.H.toFixed(3);
          pt.isTg20Applied = true;
        } else {
          pt.isTg20Applied = false;
          pt.currentH = pt.h.toFixed(3);
        }
      } else {
        pt.isTg20Applied = false;
        pt.currentH = pt.h !== null && pt.h !== undefined ? pt.h.toFixed(3) : "-";
      }
    }

    return true;
  }

  /**
   * Metin Bazlı TG-20 İndirgeme Raporu Üretir
   */
  exportTg20ReductionReport(projectName = "GNSS_RTK_TG20_Indirgeme") {
    const dateStr = new Date().toLocaleDateString("tr-TR");
    const reportPoints = [];

    for (let pair of this.matchedPairs) {
      if (pair.isTg20Applied && pair.avgOrthoH) {
        reportPoints.push({
          name: pair.pointName,
          lat: pair.p1?.lat || pair.p1?.latDec || pair.p2?.lat || pair.p2?.latDec || "",
          lon: pair.p1?.lon || pair.p1?.lonDec || pair.p2?.lon || pair.p2?.lonDec || "",
          y: pair.avgE,
          x: pair.avgN,
          h: pair.avgH,
          N: pair.tg20N,
          H: pair.avgOrthoH,
          type: "Çift Okuma Ort."
        });
      }
    }

    for (let pt of this.unmatchedPoints) {
      if (pt.isTg20Applied && pt.orthoH !== undefined) {
        reportPoints.push({
          name: pt.pn,
          lat: pt.lat || pt.latDec || "",
          lon: pt.lon || pt.lonDec || "",
          y: pt.e.toFixed(3),
          x: pt.n.toFixed(3),
          h: pt.h.toFixed(3),
          N: pt.tg20N,
          H: pt.orthoH.toFixed(3),
          type: "Tekil Ölçü"
        });
      }
    }

    let rpt = "========================================================================================\n";
    rpt += "    GNSS POS WEB STUDIO - TG-20 JEOİT İNDİRGEME RAPORU (GPSFormat Entegrasyonu)     \n";
    rpt += "========================================================================================\n";
    rpt += `Proje / Dosya       : ${projectName}\n`;
    rpt += "Jeoit Modeli        : Harita Genel Müdürlüğü TG-20 (Türkiye Hibrit Jeoidi 2020)\n";
    rpt += `Projeksiyon         : ITRF-96 TM 3° Dilim ${this.centralMeridian}° E\n`;
    rpt += `Tarih               : ${dateStr}\n`;
    rpt += `Toplam Nokta Sayısı : ${reportPoints.length}\n`;
    rpt += "Temel Bağıntı       : H (Ortometrik) = h (Elipsoit) - N (Jeoit Undülasyonu)\n";
    rpt += "----------------------------------------------------------------------------------------\n";
    rpt += "NOKTA ADI      ENLEM (Lat)  BOYLAM (Lon)  Y (Sağa)       X (Yukarı)     ELİP.(h)   JEOİT(N)  ORT.(H)   TİP\n";
    rpt += "----------------------------------------------------------------------------------------\n";

    for (let p of reportPoints) {
      const pName = String(p.name).padEnd(14, " ");
      const latStr = p.lat ? parseFloat(p.lat).toFixed(6).padStart(11, " ") : "     -     ";
      const lonStr = p.lon ? parseFloat(p.lon).toFixed(6).padStart(12, " ") : "      -      ";
      const yStr = String(p.y).padStart(14, " ");
      const xStr = String(p.x).padStart(14, " ");
      const hStr = String(p.h).padStart(9, " ");
      const nStr = (`+${p.N}`).padStart(9, " ");
      const bigHStr = String(p.H).padStart(9, " ");

      rpt += `${pName} ${latStr} ${lonStr} ${yStr} ${xStr} ${hStr} ${nStr} ${bigHStr}   ${p.type}\n`;
    }

    rpt += "========================================================================================\n";
    rpt += "NOT: Elipsoit Kotları (h) GPS/GNSS ölçümünden, Ortometrik Kotlar (H) TG-20 indirgeme\n";
    rpt += "     sonucu hesaplanmıştır. Bu rapor resmi kadastro işlemlerinde referans olarak kullanılabilir.\n";
    rpt += "========================================================================================\n";

    return rpt;
  }

  /**
   * Dil Çeviri Yardımcısı (i18n Fallback Resolver)
   */
  getI18n(key, fallback = "") {
    if (typeof t === "function") {
      const val = t(key);
      if (val && val !== key) return val;
    }
    if (typeof window !== "undefined" && window.__HARITA_TR_TRANSLATIONS__) {
      const parts = key.split(".");
      let curr = window.__HARITA_TR_TRANSLATIONS__;
      for (let p of parts) {
        if (curr && typeof curr === "object") curr = curr[p];
        else return fallback;
      }
      if (curr) return curr;
    }
    return fallback;
  }

  /**
   * Yazdırılabilir / PDF Kaydedilebilir A4 TG-20 Raporu HTML Şablonu Üretir
   */
  generatePrintableTg20Report(projectName = "GNSS RTK / CORS ÖLÇÜLERİ TG-20 İNDİRGEME RAPORU", externalTg20 = null, externalGeodesy = null) {
    const curDate = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const curTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    const reportRows = [];
    const tg20Engine = externalTg20 || (typeof state !== "undefined" ? state.tg20Engine : null);
    const geodesyEngine = this.geodesy || externalGeodesy || (typeof state !== "undefined" ? state.geodesyEngine : null);
    const dom = this.centralMeridian || 30;

    for (let pair of this.matchedPairs) {
      let lat = pair.p1?.lat || pair.p1?.latDec || pair.p2?.lat || pair.p2?.latDec;
      let lon = pair.p1?.lon || pair.p1?.lonDec || pair.p2?.lon || pair.p2?.lonDec;
      const eVal = parseFloat(pair.avgE);
      const nVal = parseFloat(pair.avgN);
      const hVal = parseFloat(pair.avgH);

      if ((!lat || !lon) && geodesyEngine && eVal && nVal) {
        try {
          const geo = geodesyEngine.inverseTM(eVal, nVal, dom);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }

      let nStr = pair.tg20N;
      let hStr = pair.avgOrthoH;

      if ((!nStr || nStr === "--") && tg20Engine && lat && lon) {
        const red = tg20Engine.reduceHeight(lat, lon, hVal);
        if (red.inBounds && red.N !== null) {
          nStr = red.N.toFixed(3);
          hStr = red.H.toFixed(3);
          pair.tg20N = nStr;
          pair.avgOrthoH = hStr;
        }
      }

      reportRows.push({
        name: pair.pointName,
        lat: lat ? lat.toFixed(6) : "-",
        lon: lon ? lon.toFixed(6) : "-",
        y: pair.avgE,
        x: pair.avgN,
        h: pair.avgH,
        N: nStr ? (nStr.startsWith("+") || nStr.startsWith("-") ? nStr : `+${nStr}`) : "--",
        H: hStr || pair.avgH,
        type: this.getI18n("reports.typeDualAvg", "Çift Okuma Ort.")
      });
    }

    for (let pt of this.unmatchedPoints) {
      let lat = pt.lat || pt.latDec;
      let lon = pt.lon || pt.lonDec;

      if ((!lat || !lon) && geodesyEngine && pt.e && pt.n) {
        try {
          const geo = geodesyEngine.inverseTM(pt.e, pt.n, dom);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }

      let nStr = pt.tg20N;
      let hStr = pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : null;

      if ((!nStr || nStr === "--") && tg20Engine && lat && lon) {
        const red = tg20Engine.reduceHeight(lat, lon, pt.h);
        if (red.inBounds && red.N !== null) {
          nStr = red.N.toFixed(3);
          hStr = red.H.toFixed(3);
          pt.tg20N = nStr;
          pt.orthoH = red.H;
        }
      }

      reportRows.push({
        name: pt.pn,
        lat: lat ? lat.toFixed(6) : "-",
        lon: lon ? lon.toFixed(6) : "-",
        y: pt.e.toFixed(3),
        x: pt.n.toFixed(3),
        h: pt.h.toFixed(3),
        N: nStr ? (nStr.startsWith("+") || nStr.startsWith("-") ? nStr : `+${nStr}`) : "--",
        H: hStr || pt.h.toFixed(3),
        type: this.getI18n("reports.typeSingle", "Tekil Ölçü")
      });
    }

    const nNumList = reportRows.map(r => parseFloat(r.N)).filter(v => !isNaN(v));
    const avgUndulation = nNumList.length > 0 ? (nNumList.reduce((a, b) => a + b, 0) / nNumList.length) : 0;

    let template = (typeof window !== "undefined" && window.GnssReportTemplates?.getTg20Template)
      ? window.GnssReportTemplates.getTg20Template()
      : "";

    let rowsHtml = "";
    if (reportRows.length === 0) {
      rowsHtml = `<tr><td colspan="10" class="empty-table-cell">${this.getI18n("reports.emptyData", "İndirgenecek koordinat verisi bulunamadı.")}</td></tr>`;
    } else {
      rowsHtml = reportRows.map((r, idx) => {
        const badgeCls = r.type.includes(this.getI18n("reports.typeDualAvg", "Çift")) ? "badge-pair" : "badge-single";
        return `
          <tr>
            <td class="col-mono col-dim">${idx + 1}</td>
            <td class="col-name">${r.name}</td>
            <td class="col-mono">${r.lat}°</td>
            <td class="col-mono">${r.lon}°</td>
            <td class="col-mono">${r.y}</td>
            <td class="col-mono">${r.x}</td>
            <td class="col-mono">${r.h} m</td>
            <td class="col-geoid">${r.N} m</td>
            <td class="col-ortho">${r.H} m</td>
            <td><span class="${badgeCls}">${r.type}</span></td>
          </tr>
        `;
      }).join("");
    }

    const avgUndulationStr = `${avgUndulation > 0 ? "+" : ""}${avgUndulation.toFixed(3)} m`;
    const totalPointsStr = `${reportRows.length} ${this.getI18n("reports.thPointName", "Nokta")} (${this.matchedPairs.length} ${this.getI18n("reports.typeDualAvg", "Çift Okuma")}, ${this.unmatchedPoints.length} ${this.getI18n("reports.typeSingle", "Tekil")})`;
    const projStr = this.getI18n("reports.lblProjectionVal", "ITRF-96 TM 3° Dilim {meridian}° E").replace("{meridian}", this.centralMeridian);

    return template
      .replace(/{{TITLE}}/g, projectName)
      .replace(/{{PROJECT}}/g, projectName)
      .replace(/{{DATE}}/g, curDate)
      .replace(/{{TIME}}/g, curTime)
      .replace(/{{MERIDIAN}}/g, String(this.centralMeridian))
      .replace(/{{PROJECTION_STR}}/g, projStr)
      .replace(/{{TOTAL_POINTS}}/g, totalPointsStr)
      .replace(/{{AVG_UNDULATION}}/g, avgUndulationStr)
      .replace(/{{TABLE_ROWS}}/g, rowsHtml)
      .replace(/{{BTN_PRINT}}/g, this.getI18n("reports.btnPrint", "🖨️ Yazdır / PDF Kaydet"))
      .replace(/{{BRAND_TITLE}}/g, this.getI18n("reports.tg20BrandTitle", "HARİTA TOOLS — JEODEZİ & GNSS STÜDYOSU"))
      .replace(/{{BRAND_SUB}}/g, this.getI18n("reports.tg20BrandSub", "Profesyonel Jeodezi, Fotogrametri & GNSS Hesaplama Platformu | Geografik Harita ve Coğrafi Bilgi Teknolojileri"))
      .replace(/{{META_HEADER}}/g, this.getI18n("reports.tg20MetaHeader", "TUSAGA-Aktif TG-20 Raporu"))
      .replace(/{{LBL_DATETIME}}/g, this.getI18n("reports.lblDateTime", "Tarih / Saat:"))
      .replace(/{{MAIN_TITLE}}/g, this.getI18n("reports.tg20MainTitle", "TG-20 TÜRKİYE HİBRİT JEOİDİ ORTOMETRİK KOT İNDİRGEME RAPORU"))
      .replace(/{{SUB_TITLE}}/g, this.getI18n("reports.tg20SubTitle", "TUSAGA-Aktif (CORS-TR) Ölçümleri Helmert Ortometrik Nivelman Kotu (TUDKA-99) Çetelesi (BÖHHBÜY Standartları)"))
      .replace(/{{LBL_PROJECT}}/g, this.getI18n("reports.lblProject", "Proje / Dosya:"))
      .replace(/{{LBL_CALC_DATE}}/g, this.getI18n("reports.lblCalcDate", "Hesaplama Tarihi:"))
      .replace(/{{LBL_PROJECTION}}/g, this.getI18n("reports.lblProjection", "Projeksiyon:"))
      .replace(/{{LBL_GEOID_MODEL}}/g, this.getI18n("reports.lblGeoidModel", "Kullanılan Jeoit Modeli:"))
      .replace(/{{VAL_GEOID_MODEL}}/g, this.getI18n("reports.valGeoidModel", "HGM TG-20 (Türkiye Hibrit Jeoidi 2020)"))
      .replace(/{{LBL_TOTAL_POINTS}}/g, this.getI18n("reports.lblTotalPoints", "Toplam Nokta:"))
      .replace(/{{LBL_VERTICAL_DATUM}}/g, this.getI18n("reports.lblVerticalDatum", "Düşey Referans Sistemi:"))
      .replace(/{{VAL_VERTICAL_DATUM}}/g, this.getI18n("reports.valVerticalDatum", "TUDKA-99 (Türkiye Ulusal Düşey Kontrol Ağı)"))
      .replace(/{{FORMULA_TITLE}}/g, this.getI18n("reports.formulaTitle", "Temel Formül:"))
      .replace(/{{AVG_UNDULATION_PREFIX}}/g, this.getI18n("reports.avgUndulationPrefix", "Bölgesel Ortalama Jeoit Undülasyonu:"))
      .replace(/{{TH_NUM}}/g, this.getI18n("reports.thNum", "#"))
      .replace(/{{TH_POINT_NAME}}/g, this.getI18n("reports.thPointName", "Nokta Adı"))
      .replace(/{{TH_LAT}}/g, this.getI18n("reports.thLat", "WGS-84 Enlem (ϕ)"))
      .replace(/{{TH_LON}}/g, this.getI18n("reports.thLon", "WGS-84 Boylam (λ)"))
      .replace(/{{TH_EAST_M}}/g, this.getI18n("reports.thEastM", "Y (Sağa - m)"))
      .replace(/{{TH_NORTH_M}}/g, this.getI18n("reports.thNorthM", "X (Yukarı - m)"))
      .replace(/{{TH_ELEV_ELLIPSOID_M}}/g, this.getI18n("reports.thElevEllipsoidM", "Elipsoit Kotu (h / m)"))
      .replace(/{{TH_UNDULATION_M}}/g, this.getI18n("reports.thUndulationM", "TG-20 Undülasyon (N / m)"))
      .replace(/{{TH_ELEV_ORTHO_M}}/g, this.getI18n("reports.thElevOrthoM", "Ortometrik Kot (H / m)"))
      .replace(/{{TH_OBS_TYPE}}/g, this.getI18n("reports.thObsType", "Ölçüm Tipi"))
      .replace(/{{DISCLAIMER_TITLE}}/g, this.getI18n("reports.disclaimerTitle", "⚠️ Yasal Bilgilendirme ve Sorumluluk Reddi Beyanı"))
      .replace(/{{DISCLAIMER_TEXT}}/g, this.getI18n("reports.disclaimerText", "Bu hesaplama raporu..."))
      .replace(/{{FOOTER_BRAND}}/g, this.getI18n("reports.footerBrand", "Harita Tools © 2026 | Jeodezi & GNSS Stüdyosu — Geografik Harita ve Coğrafi Bilgi Teknolojileri"))
      .replace(/{{FOOTER_REF}}/g, this.getI18n("reports.footerRef", "Referans: HGM TG-20 (TUDKA-99 Helmert Ortometrik Yükseklik)"))
      .replace(/{{FOOTER_PAGE}}/g, this.getI18n("reports.footerPage", "Sayfa 1 / 1"));
  }

  /**
   * AutoCAD .DXF Çizim Metni Üretir (Noktalar, İsimler, Kotlar, Hata Vektörleri Katmanları)
   */
  exportDxfText() {
    let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n5\n";
    dxf += "0\nLAYER\n2\nNOKTALAR\n70\n0\n62\n7\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nNOKTA_ADLARI\n70\n0\n62\n3\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nKOTLAR\n70\n0\n62\n4\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nTEKIL_NOKTALAR\n70\n0\n62\n1\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nHATA_VEKTORLERI\n70\n0\n62\n1\n6\nCONTINUOUS\n0\n";
    dxf += "ENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";

    for (let pair of this.matchedPairs) {
      const eVal = parseFloat(pair.avgE);
      const nVal = parseFloat(pair.avgN);
      const hVal = this.isTg20Applied && pair.avgOrthoH ? parseFloat(pair.avgOrthoH) : parseFloat(pair.avgH);

      dxf += `0\nPOINT\n8\nNOKTALAR\n10\n${eVal}\n20\n${nVal}\n30\n${hVal}\n`;
      dxf += `0\nTEXT\n8\nNOKTA_ADLARI\n10\n${eVal + 0.5}\n20\n${nVal + 0.5}\n30\n${hVal}\n40\n1.2\n1\n${pair.pointName}\n`;
      dxf += `0\nTEXT\n8\nKOTLAR\n10\n${eVal + 0.5}\n20\n${nVal - 1.2}\n30\n${hVal}\n40\n1.0\n1\n${hVal.toFixed(2)}\n`;
      dxf += `0\nLINE\n8\nHATA_VEKTORLERI\n10\n${pair.p1.e}\n20\n${pair.p1.n}\n30\n${pair.p1.h}\n11\n${pair.p2.e}\n21\n${pair.p2.n}\n31\n${pair.p2.h}\n`;
    }

    for (let pt of this.unmatchedPoints) {
      const eVal = pt.e;
      const nVal = pt.n;
      const hVal = this.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH : pt.h;

      dxf += `0\nPOINT\n8\nTEKIL_NOKTALAR\n10\n${eVal}\n20\n${nVal}\n30\n${hVal}\n`;
      dxf += `0\nTEXT\n8\nNOKTA_ADLARI\n10\n${eVal + 0.5}\n20\n${nVal + 0.5}\n30\n${hVal}\n40\n1.2\n1\n${pt.pn}\n`;
      dxf += `0\nTEXT\n8\nKOTLAR\n10\n${eVal + 0.5}\n20\n${nVal - 1.2}\n30\n${hVal}\n40\n1.0\n1\n${hVal.toFixed(2)}\n`;
    }

    dxf += "0\nENDSEC\n0\nEOF\n";
    return dxf;
  }

  /**
   * Netcad .KOS Formatında Nokta Listesi Üretir
   */
  exportKosText() {
    let kos = "; NETCAD KOS FORMATI - GNSS KADASTRO CETELERI\n";
    for (let pair of this.matchedPairs) {
      const hVal = this.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;
      kos += `NOKTA ${pair.pointName} Y=${pair.avgE} X=${pair.avgN} Z=${hVal} dS=${pair.ds2d}cm\n`;
    }
    return kos;
  }

  /**
   * Netcad .NCN Formatında Nokta Listesi Üretir
   */
  exportNcnText() {
    let ncn = "";
    for (let pair of this.matchedPairs) {
      const hVal = this.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;
      ncn += `${pair.pointName.padEnd(14, " ")} ${pair.avgE.padStart(12, " ")} ${pair.avgN.padStart(12, " ")} ${hVal.padStart(10, " ")}\n`;
    }
    for (let pt of this.unmatchedPoints) {
      const hVal = this.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : pt.h.toFixed(3);
      ncn += `${pt.pn.padEnd(14, " ")} ${pt.e.toFixed(3).padStart(12, " ")} ${pt.n.toFixed(3).padStart(12, " ")} ${hVal.padStart(10, " ")}\n`;
    }
    return ncn;
  }

  /**
   * Google Earth .KML Formatında Nokta ve Detay Bilgilerini Üretir
   */
  exportKmlText() {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>Kadastro GNSS Olculeri</name>
`;

    for (let pair of this.matchedPairs) {
      let lat = pair.p1?.lat ?? pair.p1?.latDec;
      let lon = pair.p1?.lon ?? pair.p1?.lonDec;
      if ((lat === undefined || lon === undefined) && this.geodesy && pair.avgE && pair.avgN) {
        try {
          const geo = this.geodesy.inverseTM(parseFloat(pair.avgE), parseFloat(pair.avgN), this.centralMeridian, 1.0, false);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }
      lat = lat !== undefined ? lat : 39.0;
      lon = lon !== undefined ? lon : 35.0;
      const hVal = this.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;
      const timeDisplay = pair.timeDiffStr || `${pair.timeDiffMin} dk`;

      kml += `
  <Placemark>
    <name>${pair.pointName}</name>
    <description><![CDATA[
      <b>Nokta:</b> ${pair.pointName}<br>
      <b>Fark (dS):</b> ${pair.ds2d} cm (${pair.isDistPassed ? "UYGUN" : "LIMIT DISI"})<br>
      <b>Zaman Farkı:</b> ${timeDisplay} (${pair.isTimePassed ? "≥60 dk UYGUN" : "<60 dk YETERSIZ"})<br>
      <b>Ortalama Y:</b> ${pair.avgE}<br>
      <b>Ortalama X:</b> ${pair.avgN}<br>
      <b>Kot (H):</b> ${hVal} ${this.isTg20Applied ? "(TG-20 Ortometrik)" : "(Elipsoit)"}<br>
      <b>Enlem (Lat):</b> ${lat.toFixed(8)}°<br>
      <b>Boylam (Lon):</b> ${lon.toFixed(8)}°
    ]]></description>
    <Point>
      <coordinates>${lon},${lat},${hVal}</coordinates>
    </Point>
  </Placemark>
`;
    }

    for (let pt of this.unmatchedPoints) {
      let lat = pt.lat ?? pt.latDec;
      let lon = pt.lon ?? pt.lonDec;
      if ((lat === undefined || lon === undefined) && this.geodesy && pt.e && pt.n) {
        try {
          const geo = this.geodesy.inverseTM(pt.e, pt.n, this.centralMeridian, 1.0, false);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }
      lat = lat !== undefined ? lat : 39.0;
      lon = lon !== undefined ? lon : 35.0;
      const hVal = this.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : pt.h.toFixed(3);

      kml += `
  <Placemark>
    <name>${pt.pn} (Tekil)</name>
    <description><![CDATA[
      <b>Nokta:</b> ${pt.pn} (Tekil Ölçü)<br>
      <b>Y:</b> ${pt.e.toFixed(3)}<br>
      <b>X:</b> ${pt.n.toFixed(3)}<br>
      <b>Kot (H):</b> ${hVal} ${this.isTg20Applied ? "(TG-20 Ortometrik)" : "(Elipsoit)"}<br>
      <b>Enlem (Lat):</b> ${lat.toFixed(8)}°<br>
      <b>Boylam (Lon):</b> ${lon.toFixed(8)}°
    ]]></description>
    <Point>
      <coordinates>${lon},${lat},${hVal}</coordinates>
    </Point>
  </Placemark>
`;
    }

    kml += "</Document>\n</kml>";
    return kml;
  }

  /**
   * Resmi Kadastro Çift Okuma Kontrol Çetelesini CSV Formatında İhraç Eder
   */
  exportCadastreCsv() {
    let csv = this.isTg20Applied
      ? "Nokta_No,1_Tarih,1_Saat,2_Tarih,2_Saat,Zaman_Farki_Dk,Zaman_Farki_Saat,dY_cm,dX_cm,dH_cm,dS_cm,Hata_Durumu,Zaman_Durumu,Ortalama_Y,Ortalama_X,Elipsoit_H,TG20_Undulasyon_N,Ortometrik_H,Olcu_Tipi\n"
      : "Nokta_No,1_Tarih,1_Saat,2_Tarih,2_Saat,Zaman_Farki_Dk,Zaman_Farki_Saat,dY_cm,dX_cm,dH_cm,dS_cm,Hata_Durumu,Zaman_Durumu,Ortalama_Y,Ortalama_X,Ortalama_H,Olcu_Tipi\n";

    for (let pair of this.matchedPairs) {
      if (this.isTg20Applied) {
        csv += `${pair.pointName},${pair.p1.dt},${pair.p1.tm},${pair.p2.dt},${pair.p2.tm},${pair.timeDiffMin},${pair.timeDiffHours},${pair.dy},${pair.dx},${pair.dh},${pair.ds2d},${pair.isDistPassed ? "UYGUN" : "LIMIT_ASILDI"},${pair.isTimePassed ? "UYGUN" : "YETERSIZ"},${pair.avgE},${pair.avgN},${pair.avgH},${pair.tg20N || ""},${pair.avgOrthoH || pair.avgH},Cift_Okuma\n`;
      } else {
        csv += `${pair.pointName},${pair.p1.dt},${pair.p1.tm},${pair.p2.dt},${pair.p2.tm},${pair.timeDiffMin},${pair.timeDiffHours},${pair.dy},${pair.dx},${pair.dh},${pair.ds2d},${pair.isDistPassed ? "UYGUN" : "LIMIT_ASILDI"},${pair.isTimePassed ? "UYGUN" : "YETERSIZ"},${pair.avgE},${pair.avgN},${pair.avgH},Cift_Okuma\n`;
      }
    }

    for (let pt of this.unmatchedPoints) {
      if (this.isTg20Applied) {
        csv += `${pt.pn},${pt.dt || ""},${pt.tm || ""},--,--,--,--,--,--,--,--,--,--,${pt.e.toFixed(3)},${pt.n.toFixed(3)},${pt.h.toFixed(3)},${pt.tg20N || ""},${pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : pt.h.toFixed(3)},Tekil_Olcu\n`;
      } else {
        csv += `${pt.pn},${pt.dt || ""},${pt.tm || ""},--,--,--,--,--,--,--,--,--,--,${pt.e.toFixed(3)},${pt.n.toFixed(3)},${pt.h.toFixed(3)},Tekil_Olcu\n`;
      }
    }

    return csv;
  }

  /**
   * Yazdırılabilir Resmi Kadastro Çift Okuma Çetelesi HTML Çıktısı Üretir
   */
  generatePrintableCadastreReport(title = "KADASTRO RTK/CORS ÖLÇÜ KONTROL ÇETELESİ") {
    const curDate = new Date().toLocaleDateString("tr-TR");

    const emptyPairsMsg = this.getI18n("reports.noMatchedPairs", "Bu veri setinde çift okuma (eşleşen) nokta bulunmamaktadır. Tüm ölçüler tekil olarak Tablo 2'de listelenmiştir.");
    let pairsRows = "";
    if (this.matchedPairs.length === 0) {
      pairsRows = `<tr><td colspan="14" class="empty-table-cell">${emptyPairsMsg}</td></tr>`;
    } else {
      pairsRows = this.matchedPairs.map(pair => {
        const distClass = pair.isDistPassed ? "passed" : "failed";
        const distLabel = pair.isDistPassed ? this.getI18n("reports.statusPassed", "UYGUN") : this.getI18n("reports.statusFailed", "LİMİT DIŞI");
        const timeClass = pair.isTimePassed ? "passed" : "warning";
        const hVal = this.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;

        return `
          <tr>
            <td><strong>${pair.pointName}</strong></td>
            <td>${pair.p1.dt || "-"}</td>
            <td>${pair.p1.tm || "-"}</td>
            <td>${pair.p2.dt || "-"}</td>
            <td>${pair.p2.tm || "-"}</td>
            <td class="${timeClass}">${pair.timeDiffStr || `${pair.timeDiffMin} dk`}</td>
            <td>${pair.dy}</td>
            <td>${pair.dx}</td>
            <td>${pair.dh}</td>
            <td class="font-bold">${pair.ds2d}</td>
            <td class="${distClass}">${distLabel}</td>
            <td>${pair.avgE}</td>
            <td>${pair.avgN}</td>
            <td>${hVal}</td>
          </tr>
        `;
      }).join("");
    }

    let unmatchedSection = "";
    if (this.unmatchedPoints && this.unmatchedPoints.length > 0) {
      const unmatchedRows = this.unmatchedPoints.map((pt, idx) => {
        const hVal = this.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : (pt.h != null ? pt.h.toFixed(3) : "-");
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${pt.pn}</strong></td>
            <td>${pt.dt || "-"}</td>
            <td>${pt.tm || "-"}</td>
            <td>${pt.e != null ? pt.e.toFixed(3) : "-"}</td>
            <td>${pt.n != null ? pt.n.toFixed(3) : "-"}</td>
            <td class="font-bold">${hVal}</td>
            <td>${pt.hsdvVal != null ? (pt.hsdvVal * 1000).toFixed(1) : "-"}</td>
            <td>${pt.pdop || "-"}</td>
            <td>${pt.sats || "-"}</td>
            <td><span class="badge-single-warn">${this.getI18n("reports.badgeSingleWarn", "Tek Ölçü (2. Okuma Yok)")}</span></td>
          </tr>
        `;
      }).join("");

      const sec2Title = this.getI18n("reports.cadastreSec2Title", "2. İKİNCİ OKUMASI BULUNMAYAN (TEKİL) NOKTALAR TABLOSU");
      const hTitle = this.isTg20Applied ? this.getI18n("reports.thElevOrtho", "Ortometrik H (TG-20)") : this.getI18n("reports.thElevEllipsoid", "Elipsoit Kotu (h)");

      unmatchedSection = `
  <h4>${sec2Title}</h4>
  <table class="report-table-compact">
    <thead>
      <tr>
        <th>${this.getI18n("reports.thNum", "#")}</th>
        <th>${this.getI18n("reports.thPointName", "Nokta Adı")}</th>
        <th>${this.getI18n("reports.thDate", "Tarih")}</th>
        <th>${this.getI18n("reports.thTime", "Saat")}</th>
        <th>${this.getI18n("reports.thEastM", "Y (Sağa - m)")}</th>
        <th>${this.getI18n("reports.thNorthM", "X (Yukarı - m)")}</th>
        <th>${hTitle}</th>
        <th>${this.getI18n("reports.thHrms", "hRMS (mm)")}</th>
        <th>${this.getI18n("reports.thPdop", "PDOP")}</th>
        <th>${this.getI18n("reports.thSats", "Uydu")}</th>
        <th>${this.getI18n("reports.thStatus", "Durum")}</th>
      </tr>
    </thead>
    <tbody>
      ${unmatchedRows}
    </tbody>
  </table>
      `;
    }

    let template = (typeof window !== "undefined" && window.GnssReportTemplates?.getCadastreTemplate)
      ? window.GnssReportTemplates.getCadastreTemplate()
      : "";

    const projStr = this.getI18n("reports.lblProjectionVal", "ITRF-96 TM 3° Dilim {meridian}° E").replace("{meridian}", this.centralMeridian);

    return template
      .replace(/{{TITLE}}/g, title)
      .replace(/{{DATE}}/g, curDate)
      .replace(/{{MERIDIAN}}/g, String(this.centralMeridian))
      .replace(/{{PROJECTION_STR}}/g, projStr)
      .replace(/{{ERROR_LIMIT_STR}}/g, this.getI18n("reports.lblErrorLimitVal", "≤ 7.0 cm"))
      .replace(/{{MIN_TIME_STR}}/g, this.getI18n("reports.lblMinTimeVal", "≥ 60 Dk"))
      .replace(/{{TG20_LABEL}}/g, this.isTg20Applied ? "(TG-20)" : "")
      .replace(/{{PAIRS_ROWS}}/g, pairsRows)
      .replace(/{{UNMATCHED_SECTION}}/g, unmatchedSection)
      .replace(/{{AGENCY_TITLE}}/g, this.getI18n("reports.cadastreAgencyTitle", "T.C. TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ"))
      .replace(/{{REPORT_SUBTITLE}}/g, this.getI18n("reports.cadastreReportSubTitle", "TUSAGA-AKTİF (CORS-TR) ÇİFT OKUMA VE KONTROL ÇETELESİ"))
      .replace(/{{LBL_JOB_FILE}}/g, this.getI18n("reports.lblJobFile", "İş / Dosya:"))
      .replace(/{{LBL_DATE}}/g, this.getI18n("reports.lblDate", "Tarih:"))
      .replace(/{{LBL_PROJECTION}}/g, this.getI18n("reports.lblProjection", "Projeksiyon:"))
      .replace(/{{LBL_ERROR_LIMIT}}/g, this.getI18n("reports.lblErrorLimit", "Hata Limiti (dS):"))
      .replace(/{{LBL_MIN_TIME}}/g, this.getI18n("reports.lblMinTime", "Min. Zaman:"))
      .replace(/{{SEC1_TITLE}}/g, this.getI18n("reports.cadastreSec1Title", "1. ÇİFT OKUMA VE FARK KONTROL TABLOSU"))
      .replace(/{{TH_POINT_NO}}/g, this.getI18n("reports.thPointNo", "Nokta No"))
      .replace(/{{TH_OBS1_TIME}}/g, this.getI18n("reports.thObs1Time", "1. Ölçü (Zaman)"))
      .replace(/{{TH_OBS2_TIME}}/g, this.getI18n("reports.thObs2Time", "2. Ölçü (Zaman)"))
      .replace(/{{TH_TIME_DIFF}}/g, this.getI18n("reports.thTimeDiff", "Zaman Farkı"))
      .replace(/{{TH_DIFFS}}/g, this.getI18n("reports.thDiffs", "Farklar (cm)"))
      .replace(/{{TH_DS2D}}/g, this.getI18n("reports.thDs2d", "dS (2B) (cm)"))
      .replace(/{{TH_CONTROL}}/g, this.getI18n("reports.thControl", "Kontrol (≤7cm)"))
      .replace(/{{TH_AVG_COORDS}}/g, this.getI18n("reports.thAvgCoords", "Ortalama Koordinatlar (m)"))
      .replace(/{{TH_DATE}}/g, this.getI18n("reports.thDate", "Tarih"))
      .replace(/{{TH_TIME}}/g, this.getI18n("reports.thTime", "Saat"))
      .replace(/{{TH_DY}}/g, this.getI18n("reports.thDy", "dY"))
      .replace(/{{TH_DX}}/g, this.getI18n("reports.thDx", "dX"))
      .replace(/{{TH_DH}}/g, this.getI18n("reports.thDh", "dH"))
      .replace(/{{TH_EAST}}/g, this.getI18n("reports.thEast", "Y (Sağa)"))
      .replace(/{{TH_NORTH}}/g, this.getI18n("reports.thNorth", "X (Yukarı)"))
      .replace(/{{TH_ELEV}}/g, this.getI18n("reports.thElev", "H (Kot)"))
      .replace(/{{SIG_SURVEYOR}}/g, this.getI18n("reports.sigSurveyor", "Ölçümü Yapan<br>Harita Mühendisi / Teknikeri"))
      .replace(/{{SIG_CONTROLLER}}/g, this.getI18n("reports.sigController", "Kontrol Eden<br>Kontrol Mühendisi"))
      .replace(/{{SIG_APPROVER}}/g, this.getI18n("reports.sigApprover", "Onaylayan<br>Kadastro Müdürü / Yetkili"));
  }

  /**
   * Verilen Metin veya Dosya Adından Formatı Otomatik Algılar
   */
  autoDetectFormat(content, fileName = "") {
    const text = (content || "").trim();
    const ext = (fileName || "").split(".").pop().toLowerCase();
    const preview = text.substring(0, 500);

    if (ext === "rw5" || preview.includes("GPS,PN") || preview.includes("JB,NM") || preview.includes("--SurvCE") || preview.includes("--SurvStar")) {
      return { format: "rw5", name: "RW5 Ham Ölçü Dosyası (.rw5)", icon: "fa-satellite-dish" };
    }
    if (ext === "gsi" || preview.includes("WI11") || preview.includes("*11") || /^\*?11\d{4}\+/m.test(preview)) {
      return { format: "gsi", name: "Leica GSI Formatı", icon: "fa-crosshairs" };
    }
    if (ext === "xml" || preview.includes("<LandXML") || preview.includes("<CgPoints>")) {
      return { format: "landxml", name: "LandXML Formatı", icon: "fa-file-code" };
    }
    if (ext === "jxl" || preview.includes("<JOBFile") || preview.includes("<FieldBook")) {
      return { format: "trimble", name: "Trimble Access JXL", icon: "fa-location-arrow" };
    }
    if (ext === "kml" || preview.includes("<kml") || preview.includes("<Placemark>")) {
      return { format: "kml", name: "Google Earth KML", icon: "fa-earth-americas" };
    }
    if (ext === "kmz") {
      return { format: "kmz", name: "Google Earth KMZ", icon: "fa-earth-americas" };
    }
    if (ext === "geojson" || (preview.includes('"type"') && preview.includes("FeatureCollection"))) {
      return { format: "geojson", name: "GeoJSON Standart Formatı", icon: "fa-code" };
    }
    if (ext === "dxf" || preview.includes("ENTITIES") || preview.includes("HEADER") || preview.includes("SECTION")) {
      return { format: "dxf", name: "AutoCAD / Netcad DXF", icon: "fa-vector-square" };
    }
    if (ext === "ncn" || /^[A-Za-z0-9_-]+\s+\d{5,7}\.\d+\s+\d{6,8}\.\d+/m.test(preview)) {
      return { format: "ncn", name: "Netcad NCN Formatı", icon: "fa-map-pin" };
    }
    if (ext === "csv" || preview.includes(",") || preview.includes(";")) {
      return { format: "csv", name: "Standart CSV Tablo Formatı", icon: "fa-file-csv" };
    }

    return { format: "generic", name: "Metin / Sütunlu Koordinat Verisi", icon: "fa-file-lines" };
  }

  /**
   * DXF Çizim Dosyalarını GeoJSON Formatına Dönüştürür (Noktalar, Çizgiler, Poligonlar)
   */
  parseDxfToGeoJson(dxfString, overrideDom = null) {
    const lines = dxfString.split(/\r?\n/);
    const features = [];

    let inEntities = false;
    let lineIdx = 0;
    const rawEntities = [];

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    while (lineIdx < lines.length) {
      const code = lines[lineIdx]?.trim();
      const val = lines[lineIdx + 1]?.trim();
      lineIdx += 2;

      if (code === "0" && val === "SECTION") {
        const nextCode = lines[lineIdx]?.trim();
        const nextVal = lines[lineIdx + 1]?.trim();
        if (nextCode === "2" && nextVal === "ENTITIES") {
          inEntities = true;
          lineIdx += 2;
        }
      } else if (code === "0" && val === "ENDSEC") {
        inEntities = false;
      }

      if (!inEntities) continue;

      if (code === "0" && val === "POINT") {
        let x = null, y = null, z = 0;
        let layer = "Default";

        while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "10") x = parseFloat(v);
          else if (c === "20") y = parseFloat(v);
          else if (c === "30") z = parseFloat(v);
          else if (c === "8") layer = v;
          lineIdx += 2;
        }

        if (x !== null && y !== null && !isNaN(x) && !isNaN(y)) {
          rawEntities.push({ type: "Point", coords: [x, y, z], layer: layer });
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      } else if (code === "0" && val === "LINE") {
        let x1 = null, y1 = null, x2 = null, y2 = null;
        let layer = "Default";

        while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "10") x1 = parseFloat(v);
          else if (c === "20") y1 = parseFloat(v);
          else if (c === "11") x2 = parseFloat(v);
          else if (c === "21") y2 = parseFloat(v);
          else if (c === "8") layer = v;
          lineIdx += 2;
        }

        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          rawEntities.push({ type: "LineString", coords: [[x1, y1], [x2, y2]], layer: layer });
          minX = Math.min(minX, x1, x2); maxX = Math.max(maxX, x1, x2);
          minY = Math.min(minY, y1, y2); maxY = Math.max(maxY, y1, y2);
        }
      } else if (code === "0" && val === "LWPOLYLINE") {
        const polyCoords = [];
        let isClosed = false;
        let layer = "Default";
        let tempX = null;

        while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "70") isClosed = (parseInt(v, 10) & 1) === 1;
          else if (c === "8") layer = v;
          else if (c === "10") tempX = parseFloat(v);
          else if (c === "20" && tempX !== null) {
            const tempY = parseFloat(v);
            polyCoords.push([tempX, tempY]);
            minX = Math.min(minX, tempX); maxX = Math.max(maxX, tempX);
            minY = Math.min(minY, tempY); maxY = Math.max(maxY, tempY);
            tempX = null;
          }
          lineIdx += 2;
        }

        if (polyCoords.length >= 2) {
          if (isClosed && polyCoords.length >= 3) {
            if (polyCoords[0][0] !== polyCoords[polyCoords.length - 1][0] || polyCoords[0][1] !== polyCoords[polyCoords.length - 1][1]) {
              polyCoords.push([polyCoords[0][0], polyCoords[0][1]]);
            }
            rawEntities.push({ type: "Polygon", coords: [polyCoords], layer: layer });
          } else {
            rawEntities.push({ type: "LineString", coords: polyCoords, layer: layer });
          }
        }
      } else if (code === "0" && val === "POLYLINE") {
        const polyCoords = [];
        let layer = "Default";
        let isClosed = false;

        while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "70") isClosed = (parseInt(v, 10) & 1) === 1;
          else if (c === "8") layer = v;
          lineIdx += 2;
        }

        while (lineIdx < lines.length) {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "0" && v === "SEQEND") {
            lineIdx += 2;
            break;
          }
          if (c === "0" && v === "VERTEX") {
            lineIdx += 2;
            let vx = null, vy = null;
            while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
              const vc = lines[lineIdx]?.trim();
              const vv = lines[lineIdx + 1]?.trim();
              if (vc === "10") vx = parseFloat(vv);
              else if (vc === "20") vy = parseFloat(vv);
              lineIdx += 2;
            }
            if (vx !== null && vy !== null) {
              polyCoords.push([vx, vy]);
              minX = Math.min(minX, vx); maxX = Math.max(maxX, vx);
              minY = Math.min(minY, vy); maxY = Math.max(maxY, vy);
            }
          } else {
            lineIdx += 2;
          }
        }

        if (polyCoords.length >= 2) {
          if (isClosed && polyCoords.length >= 3) {
            polyCoords.push([polyCoords[0][0], polyCoords[0][1]]);
            rawEntities.push({ type: "Polygon", coords: [polyCoords], layer: layer });
          } else {
            rawEntities.push({ type: "LineString", coords: polyCoords, layer: layer });
          }
        }
      }
    }

    if (rawEntities.length === 0) {
      return { type: "FeatureCollection", features: [] };
    }

    const midX = (minX + maxX) / 2.0;
    const midY = (minY + maxY) / 2.0;

    let isProjected = false;
    let isSwapped = false;
    let detectedDom = overrideDom || 30;

    if (midX > 100000 || midY > 100000) {
      isProjected = true;
      if (midX > 1000000 && midY < 1000000) {
        isSwapped = true;
      }
      if (!overrideDom && this.geodesy) {
        const estCoord = isSwapped ? midY : midX;
        detectedDom = this.geodesy.getAutoCentralMeridian3Deg(estCoord > 1000000 ? estCoord / 100000.0 : 33);
        if (detectedDom < 27 || detectedDom > 45) detectedDom = 30;
      }
    }

    const transformCoord = (coord) => {
      let raw1 = coord[0];
      let raw2 = coord[1];

      if (!isProjected) {
        if (raw1 > 24 && raw1 < 45 && raw2 > 35 && raw2 < 43) return [raw1, raw2];
        else if (raw2 > 24 && raw2 < 45 && raw1 > 35 && raw1 < 43) return [raw2, raw1];
        return [raw1, raw2];
      }

      let easting = isSwapped ? raw2 : raw1;
      let northing = isSwapped ? raw1 : raw2;
      if (easting > 1000000) easting = easting % 1000000;

      if (this.geodesy) {
        const geo = this.geodesy.tmToGeographic(easting, northing, detectedDom, "ITRF96");
        return [geo.lon, geo.lat];
      }
      return [easting, northing];
    };

    for (let ent of rawEntities) {
      if (ent.type === "Point") {
        features.push({
          type: "Feature",
          properties: { layer: ent.layer, name: `DXF Nokta (${ent.layer})` },
          geometry: { type: "Point", coordinates: transformCoord(ent.coords) }
        });
      } else if (ent.type === "LineString") {
        features.push({
          type: "Feature",
          properties: { layer: ent.layer, name: `DXF Çizgi (${ent.layer})` },
          geometry: { type: "LineString", coordinates: ent.coords.map(transformCoord) }
        });
      } else if (ent.type === "Polygon") {
        features.push({
          type: "Feature",
          properties: { layer: ent.layer, name: `DXF Kapalı Alan (${ent.layer})` },
          geometry: { type: "Polygon", coordinates: ent.coords.map(ring => ring.map(transformCoord)) }
        });
      }
    }

    return {
      type: "FeatureCollection",
      features: features,
      metadata: {
        isProjected: isProjected,
        detectedDom: detectedDom,
        featureCount: features.length
      }
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = GnssFormatEngine;
}
/* <<<<<<<<<< [END MODULE: js/modules/gnssFormatEngine.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/rinexPowerEngine.js] >>>>>>>>>> */
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
      throw new Error("Hem Sabit (Base) hem Gezici (Rover) RINEX dosyası gereklidir.");
    }

    const baseStart = baseInfo.firstObs?.timestamp || baseInfo.start?.getTime?.() || (baseInfo.start ? new Date(baseInfo.start).getTime() : null);
    const baseEnd = baseInfo.lastObs?.timestamp || baseInfo.end?.getTime?.() || (baseInfo.end ? new Date(baseInfo.end).getTime() : null);
    const roverStart = roverInfo.firstObs?.timestamp || roverInfo.start?.getTime?.() || (roverInfo.start ? new Date(roverInfo.start).getTime() : null);
    const roverEnd = roverInfo.lastObs?.timestamp || roverInfo.end?.getTime?.() || (roverInfo.end ? new Date(roverInfo.end).getTime() : null);

    if (!baseStart || !baseEnd || !roverStart || !roverEnd) {
      throw new Error("Dosyalardan başlangıç ve bitiş zamanları (Epochs) okunamadı.");
    }

    const formatSeconds = (sec) => {
      sec = Math.round(sec);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      if (h > 0) return `${h} sa ${m} dk ${s} sn`;
      if (m > 0) return `${m} dk ${s} sn`;
      return `${s} sn`;
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
    let baselineNote = "";

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
        baselineNote = "✅ Çok Kısa Baz (Yüksek Hassasiyet)";
      } else if (baselineKm <= 20) {
        baselineStr = `${baselineKm.toFixed(2)} km (${Math.round(distM).toLocaleString("tr-TR")} m)`;
        baselineNote = "✅ Kısa Baz (İdeal PPK)";
      } else if (baselineKm <= 50) {
        baselineStr = `${baselineKm.toFixed(2)} km (${Math.round(distM).toLocaleString("tr-TR")} m)`;
        baselineNote = "ℹ️ Orta Baz";
      } else {
        baselineStr = `${baselineKm.toFixed(2)} km (${Math.round(distM).toLocaleString("tr-TR")} m)`;
        baselineNote = "⚠️ Uzun Baz (>50 km)";
      }
    } else {
      baselineStr = "Header XYZ Yok";
      baselineNote = "⚠️ RINEX başlığında APPROX POSITION XYZ girilmemiş";
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
    let statusTitle = "Mükemmel PPK Kapsaması (%100)";
    let statusDesc = "Gezici oturumunun tamamı Sabit İstasyon çalışma zaman aralığı içinde yer almaktadır.";

    if (!isSameDate && Math.abs(baseStart - roverStart) > 86400000) {
      statusLevel = "DANGER";
      statusTitle = "Tarih Uyuşmazlığı (%0 Kapsama)";
      statusDesc = `Sabit İstasyon (${baseInfo.firstObs.dateStr}) ile Gezici (${roverInfo.firstObs.dateStr}) FARKLI GÜNLERDE kaydedilmiştir! PPK işlemi yapılamaz.`;
    } else if (overlapPct >= 99.5) {
      statusLevel = "SUCCESS";
      statusTitle = "Mükemmel PPK Kapsaması (%100)";
      statusDesc = "Gezici oturumunun %100'ü Sabit İstasyon kaydı tarafından kapsanmaktadır.";
    } else if (overlapPct > 0) {
      statusLevel = "WARNING";
      statusTitle = `Kısmi PPK Kapsaması (%${overlapPct.toFixed(1)})`;
      const reasons = [];
      if (roverStart < baseStart) {
        reasons.push(`Gezici Sabit'ten ${formatSeconds((baseStart - roverStart) / 1000)} önce başlamış`);
      }
      if (roverEnd > baseEnd) {
        reasons.push(`Gezici Sabit kapandıktan sonra ${formatSeconds((roverEnd - baseEnd) / 1000)} daha devam etmiş`);
      }
      statusDesc = `Gezici süresinin yalnızca %${overlapPct.toFixed(1)}'i (${formatSeconds(overlapSec)}) Sabit kaydıyla örtüşüyor. (${reasons.join(", ")}).`;
    } else {
      statusLevel = "DANGER";
      statusTitle = "Zaman Örtüşmesi Yok (%0 Kapsama)";
      const roverTimeStart = roverInfo.firstObs?.timeStr || new Date(roverStart).toLocaleTimeString();
      const roverTimeEnd = roverInfo.lastObs?.timeStr || new Date(roverEnd).toLocaleTimeString();
      if (roverEnd <= baseStart) {
        statusDesc = `Gezici oturumu (${roverTimeStart} - ${roverTimeEnd}), Sabit açılmadan ${formatSeconds((baseStart - roverEnd) / 1000)} önce bitmiştir.`;
      } else if (roverStart >= baseEnd) {
        statusDesc = `Gezici oturumu (${roverTimeStart} - ${roverTimeEnd}), Sabit kapandıktan ${formatSeconds((roverStart - baseEnd) / 1000)} sonra başlamıştır.`;
      } else {
        statusDesc = "Sabit ve Gezici dosyaları arasında hiçbir ortak gözlem zamanı tespit edilemedi.";
      }
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
      baselineNote: baselineNote,
      commonConstellations: commonConstellations,
      baseInterval: baseInfo.interval || 1,
      roverInterval: roverInfo.interval || 1,
      statusLevel: statusLevel,
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
      throw new Error("Geçersiz veya boş RINEX dosyası.");
    }

    const headerEndIdx = rinexText.indexOf("END OF HEADER");
    if (headerEndIdx === -1) {
      throw new Error("Geçerli bir RINEX başlığı (END OF HEADER) bulunamadı.");
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
      throw new Error("Gözlem verisi içerisinde geçerli epoch ayrıştırılamadı.");
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
      onProgress({ type: "LOG", text: `🚀 '${group.id}' grubu için tarayıcı içi işleme başlatılıyor...` });
      onProgress({ type: "PROGRESS", value: 20 });

      const results = {};
      const timeCrop = group.timeCrop || { enabled: false };
      const decimation = group.decimation || 1;
      const allowedConst = group.allowedConstellations || null;

      // 1. Gözlem (OBS) Dosyalarını Birleştirme
      if (group.obsFiles && group.obsFiles.length > 0) {
        onProgress({ type: "LOG", text: `📦 ${group.obsFiles.length} adet Gözlem (OBS) dosyası işleniyor...` });
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
        onProgress({ type: "LOG", text: `✨ [BAŞARILI] ${outName} oluşturuldu (${(mergedObs.length / 1048576).toFixed(2)} MB).` });
        onProgress({ type: "PROGRESS", value: 70 });
      }

      // 2. GPS Navigasyon Dosyalarını Birleştirme
      if (group.navGpsFiles && group.navGpsFiles.length > 0) {
        onProgress({ type: "LOG", text: `🛰️ ${group.navGpsFiles.length} adet GPS Navigasyon dosyası işleniyor...` });
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
        onProgress({ type: "LOG", text: `✨ [BAŞARILI] ${outName} oluşturuldu (${(mergedNavGps.length / 1024).toFixed(1)} KB).` });
        onProgress({ type: "PROGRESS", value: 85 });
      }

      // 3. GLONASS Navigasyon Dosyalarını Birleştirme
      if (group.navGloFiles && group.navGloFiles.length > 0) {
        onProgress({ type: "LOG", text: `📡 ${group.navGloFiles.length} adet GLONASS Navigasyon dosyası işleniyor...` });
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
        onProgress({ type: "LOG", text: `✨ [BAŞARILI] ${outName} oluşturuldu (${(mergedNavGlo.length / 1024).toFixed(1)} KB).` });
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
/* <<<<<<<<<< [END MODULE: js/modules/rinexPowerEngine.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/droneDatabase.js] >>>>>>>>>> */
/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - İHA & FOTOGRAMETRİ SENSÖR VERİTABANI (DroneDatabase)
 * =========================================================================================
 *  - Profesyonel Fotogrametri İHA Platformları (DJI Matrice, Mavic 3E/T/M, Phantom 4 RTK, Trinity Pro vb.)
 *  - Metrik Kamera & LiDAR Sensör Parametreleri (Sensör Boyutları, Odak Uzaklığı, Çözünürlük, Deklanşör)
 *  - Dinamik Harici JSON Yükleme & Otomatik UI Senkronizasyonu
 * =========================================================================================
 */

class DroneDatabaseManager {
  static droneData = null;
  static loadPromise = null;

  /**
   * data/drone_sensors.json dosyasından güncel sensör veritabanını asenkron ve tekil olarak çeker
   * Single Source of Truth (Tek Gerçek Kaynak) mimarisi
   */
  static async loadDatabase() {
    if (DroneDatabaseManager.droneData) return DroneDatabaseManager.droneData;
    if (DroneDatabaseManager.loadPromise) return DroneDatabaseManager.loadPromise;

    DroneDatabaseManager.loadPromise = (async () => {
      try {
        const basePath = (typeof window !== "undefined" && window.location.pathname)
          ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
          : '';
        const res = await fetch(`${basePath}data/drone_sensors.json?v=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.drones && json.cameras) {
            DroneDatabaseManager.droneData = json;
          }
        }
      } catch (err) {
        console.warn("İHA Sensör veritabanı (data/drone_sensors.json) yüklenemedi:", err);
      }
      return DroneDatabaseManager.droneData || { drones: [], cameras: [] };
    })();

    return DroneDatabaseManager.loadPromise;
  }

  constructor() {
    this.data = DroneDatabaseManager.droneData || { drones: [], cameras: [] };
    if (!DroneDatabaseManager.droneData) {
      DroneDatabaseManager.loadDatabase().then(json => {
        if (json) {
          this.data = json;
          if (typeof window !== "undefined" && window.refreshDroneDatabaseUI) {
            window.refreshDroneDatabaseUI();
          }
        }
      });
    }
  }

  /**
   * Harici JSON dosyasını yeniden çeker
   */
  async fetchExternalJson() {
    const json = await DroneDatabaseManager.loadDatabase();
    if (json) {
      this.data = json;
      if (typeof window !== "undefined" && window.refreshDroneDatabaseUI) {
        window.refreshDroneDatabaseUI();
      }
    }
    return json;
  }

  getDrones() {
    return this.data.drones || [];
  }

  getDrone(droneId) {
    return (this.data.drones || []).find(d => d.id === droneId) || null;
  }

  getCameras() {
    return this.data.cameras || [];
  }

  getCamera(cameraId) {
    return (this.data.cameras || []).find(c => c.id === cameraId) || null;
  }

  getCamerasForDrone(droneId) {
    const drone = this.getDrone(droneId);
    if (!drone || !drone.supportedPayloads) {
      return this.getCameras();
    }
    return this.getCameras().filter(cam => drone.supportedPayloads.includes(cam.id));
  }
}

const defaultDroneManager = new DroneDatabaseManager();

if (typeof window !== "undefined") {
  window.DroneDatabase = defaultDroneManager;
  window.DroneDatabaseManager = DroneDatabaseManager;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = defaultDroneManager;
  module.exports.DroneDatabaseManager = DroneDatabaseManager;
}
/* <<<<<<<<<< [END MODULE: js/modules/droneDatabase.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/flightPlannerEngine.js] >>>>>>>>>> */
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
/* <<<<<<<<<< [END MODULE: js/modules/flightPlannerEngine.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/modules/universalFormatConverterEngine.js] >>>>>>>>>> */
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
        name: text || "Yazı",
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
      throw new Error("KMZ dosyası ayrıştırmak için JSZip kütüphanesi gereklidir.");
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
      throw new Error("KMZ arşivinde .kml dosyası bulunamadı.");
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
      throw new Error("NCZ ayrıştırması için geçerli bir ArrayBuffer gereklidir.");
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
            name: "Eğri",
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
          name: "Pafta Çerçevesi",
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
   * 6. NOKTALARDAN ALAN & POLİGON ÜRETME MOTORU (Point-to-Polygon Engine)
   * ========================================================================= */
  generatePolygonFromPoints(mode = "sequential", options = {}) {
    const points = this.features.filter(f => f.type === "Point");
    if (points.length < 3) {
      throw new Error("Kapalı alan üretmek için en az 3 nokta gereklidir.");
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
  <name>${this.sourceFileName || "GNSS_POS_Donusturucu"}</name>
  <description>GNSS POS Studio Evrensel Format Dönüştürücü Çıktısı</description>
  
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
    <description><![CDATA[<b>Tip:</b> ${f.type === "Text" ? "Yazı/Etiket" : "Nokta"}<br><b>Katman:</b> ${layer}<br><b>Kot (Z):</b> ${alt || 0} m]]></description>
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

        const areaStr = f.properties && f.properties.areaM2 ? `<br><b>Alan:</b> ${f.properties.areaM2.toFixed(1)} m² (${(f.properties.areaM2 / 1000).toFixed(2)} Dönüm)` : "";

        kml += `
  <Placemark>
    <name>${name}</name>
    <description><![CDATA[<b>Katman:</b> ${layer}${areaStr}]]></description>
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
      throw new Error("KMZ oluşturmak için JSZip kütüphanesi gereklidir.");
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

/* <<<<<<<<<< [END MODULE: js/modules/universalFormatConverterEngine.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/core/state.js] >>>>>>>>>> */
/**
 * Harita Tools - Global State & DOM Element Registry
 */
var state = window.state = {
  flightEngine: null,
  flightMap: null,
  flightOriginalLayer: null,
  flightSimplifiedLayer: null,
  flightRoadLayer: null,
  flightGcpLayer: null,
  flightTriangulationLayer: null,
  isDrawingRoad: false,
  activeRoadPoints: [],
  activeRoadPolyline: null,
  activeRoadMarkers: [],
  isFlightMapInit: false,
  mergerGroups: {},
  currentMergedFiles: {},
  posSolutions: [],
  posText: "",
  csvText: "",
  map: null,
  mapLayerGroup: null,
  cadastreMap: null,
  cadastreLayerGroup: null,
  paftaLayerGroup: null,
  domLayerGroup: null,
  isDomLayerActive: false,
  highlightedPaftaLayer: null,
  activePaftaScale: "off",
  gnssEngine: typeof GnssFormatEngine !== "undefined" ? new GnssFormatEngine() : null,
  rinexEngine: typeof RinexPowerEngine !== "undefined" ? new RinexPowerEngine() : null,
  paftaEngine: typeof PaftaIndexEngine !== "undefined" ? new PaftaIndexEngine() : null,
  tg20Engine: typeof Tg20GeoidEngine !== "undefined" ? new Tg20GeoidEngine() : null,
  tg20Map: null,
  tg20MapMarker: null,
  lastTg20QueryPoint: null,
  converterEngine: typeof UniversalFormatConverterEngine !== "undefined" ? new UniversalFormatConverterEngine() : null,
  converterMap: null,
  converterLayerGroup: null,
  isConverterMapInit: false,
  converterShowLabels: false,
  converterShowTexts: true,
  converterFilterType: "ALL",
  converterSearchQuery: ""
};
var elements = window.elements = {
  navItems: document.querySelectorAll(".nav-item"),
  toolTabs: document.querySelectorAll(".tool-tab"),
  subTabBtns: document.querySelectorAll(".sub-tab-btn"),
  subTabContents: document.querySelectorAll(".subtab-content"),
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  globalConsoleLog: document.getElementById("globalConsoleLog"),
  progressBarFill: document.getElementById("progressBarFill"),
  progressLabel: document.getElementById("progressLabel"),
  progressPercent: document.getElementById("progressPercent"),
  btnClearLog: document.getElementById("btnClearLog"),
  btnCopyLog: document.getElementById("btnCopyLog"),
  rw5FileInput: document.getElementById("rw5FileInput"),
  rw5Radius: document.getElementById("rw5Radius"),
  rw5Tolerance: document.getElementById("rw5Tolerance"),
  rw5MinTime: document.getElementById("rw5MinTime"),
  btnAnalyzeRw5: document.getElementById("btnAnalyzeRw5"),
  brandDetectPill: document.getElementById("brandDetectPill"),
  tableGpsFormatRtkBody: document.getElementById("tableGpsFormatRtkBody"),
  tableRw5MatchedBody: document.getElementById("tableRw5MatchedBody"),
  txtCoordOutput: document.getElementById("txtCoordOutput"),
  selectCoordOrder: document.getElementById("selectCoordOrder"),
  btnCopyCoords: document.getElementById("btnCopyCoords"),
  btnDownloadCoordTxt: document.getElementById("btnDownloadCoordTxt"),
  btnFitCadastreMap: document.getElementById("btnFitCadastreMap"),
  btnPrintCadastre: document.getElementById("btnPrintCadastre"),
  btnExportCadastreCsv: document.getElementById("btnExportCadastreCsv"),
  btnExportRtkCsv: document.getElementById("btnExportRtkCsv"),
  btnExportNcn: document.getElementById("btnExportNcn"),
  btnExportKos: document.getElementById("btnExportKos"),
  btnExportDxf: document.getElementById("btnExportDxf"),
  btnExportKmlCadastre: document.getElementById("btnExportKmlCadastre"),
  btnExportTg20RwReport: document.getElementById("btnExportTg20RwReport"),
  barCriterion: document.getElementById("barCriterion"),
  barProj: document.getElementById("barProj"),
  barGeoid: document.getElementById("barGeoid"),
  mergerDropzone: document.getElementById("mergerDropzone"),
  mergerFileInput: document.getElementById("mergerFileInput"),
  mergerResultCard: document.getElementById("mergerResultCard"),
  tableGroupsBody: document.getElementById("tableGroupsBody"),
  btnMergeAll: document.getElementById("btnMergeAll"),
  chkSysGps: document.getElementById("chkSysGps"),
  chkSysGlo: document.getElementById("chkSysGlo"),
  chkSysGal: document.getElementById("chkSysGal"),
  chkSysBds: document.getElementById("chkSysBds"),
  inputExcludeSats: document.getElementById("inputExcludeSats"),
  selectTargetFormat: document.getElementById("selectTargetFormat"),
  selectDecimationStep: document.getElementById("selectDecimationStep"),
  btnExportKml: document.getElementById("btnExportKml"),
  btnExportGeoJson: document.getElementById("btnExportGeoJson"),
  geoLat: document.getElementById("geoLat"),
  geoLon: document.getElementById("geoLon"),
  geoH: document.getElementById("geoH"),
  btnConvertCoord: document.getElementById("btnConvertCoord"),
  coordResultBox: document.getElementById("coordResultBox")
};

window.state = state;
window.elements = elements;

/* <<<<<<<<<< [END MODULE: js/core/state.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/core/navigation.js] >>>>>>>>>> */
/**
 * Harita Tools - Navigation, Shortcuts, Theme & Modals
 */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const domEl = document.querySelector(".tool-tab.active");
      let v_1 = null;
      if (domEl) {
        v_1 = domEl.querySelector("input[type=\"text\"][placeholder*=\"ara\" i], input[type=\"search\"]");
      }
      if (!v_1) {
        v_1 = document.getElementById("inputSearchRtk") || document.getElementById("inputSearchGcp") || document.getElementById("txtPaftaSearchInput");
      }
      if (v_1) {
        v_1.focus();
        v_1.select();
        showToast(t("core.navigation.toastSearchFocus"), "info");
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") {
      event.preventDefault();
      const domEl = document.querySelector(".tool-tab.active");
      const v_1 = domEl ? domEl.querySelector("input[type=\"file\"]") : document.getElementById("rw5FileInput");
      if (v_1) {
        v_1.click();
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      const domEl = document.querySelector(".tool-tab.active");
      const v_1 = domEl ? domEl.querySelector("[id*=\"Print\" i]") : document.getElementById("btnPrintTg20RwReportRtk");
      if (v_1 && !v_1.disabled) {
        v_1.click();
      } else {
        window.print();
      }
    }
    if (event.key === "Escape") {
      const v_1 = document.activeElement;
      if (v_1 && v_1.tagName === "INPUT") {
        v_1.value = "";
        v_1.dispatchEvent(new Event("input"));
        v_1.blur();
        showToast(t("core.navigation.toastSearchCleared"), "info");
      }
    }
  });
}

function initThemeToggle() {
  const btnEl = document.getElementById("btnThemeToggle");
  const domEl = document.getElementById("themeIcon");
  const v_1 = localStorage.getItem("gnss_studio_theme") || "dark";
  v_2(v_1);
  if (btnEl) {
    btnEl.addEventListener("click", () => {
      const v_1_1 = document.documentElement.getAttribute("data-theme") || "dark";
      const v_2_1 = v_1_1 === "dark" ? "light" : "dark";
      v_2(v_2_1);
      localStorage.setItem("gnss_studio_theme", v_2_1);
      showToast(v_2_1 === "light" ? t("core.navigation.toastThemeLight") : t("core.navigation.toastThemeDark"), "info");
    });
  }

  const btnSidebarTheme = document.getElementById("btnSidebarThemeShortcut");
  if (btnSidebarTheme) {
    btnSidebarTheme.addEventListener("click", () => {
      btnEl?.click();
    });
  }

  // Global Keyboard Shortcuts: Ctrl+O (Dosya Aç) & Ctrl+D (Tema Değiştir)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
      e.preventDefault();
      document.getElementById("inputHomeHeroFile")?.click();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      btnEl?.click();
    }
  });

  function v_2(arg1) {
    document.documentElement.setAttribute("data-theme", arg1);
    if (domEl) {
      if (arg1 === "light") {
        domEl.className = "fa-solid fa-sun";
        domEl.style.color = "var(--amber-500)";
      } else {
        domEl.className = "fa-solid fa-moon";
        domEl.style.color = "var(--cyan-400)";
      }
    }
    const mobileThemeIcon = document.getElementById("mobileThemeIcon");
    if (mobileThemeIcon) {
      if (arg1 === "light") {
        mobileThemeIcon.className = "fa-solid fa-sun";
        mobileThemeIcon.style.color = "var(--amber-500)";
      } else {
        mobileThemeIcon.className = "fa-solid fa-moon";
        mobileThemeIcon.style.color = "var(--cyan-400)";
      }
    }
  }
}

function initMobileNavDrawer() {
  const sidebar = document.getElementById("appSidebar");
  const overlay = document.getElementById("mobileNavOverlay");
  const btnToggle = document.getElementById("btnMobileMenuToggle");
  const btnClose = document.getElementById("btnMobileSidebarClose");
  const navItems = document.querySelectorAll(".sidebar .nav-item");

  if (!sidebar) return;

  const openDrawer = () => {
    sidebar.classList.add("mobile-open");
    overlay?.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    sidebar.classList.remove("mobile-open");
    overlay?.classList.remove("active");
    document.body.style.overflow = "";
  };

  btnToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains("mobile-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  btnClose?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);

  // Close drawer upon clicking any navigation tab item on mobile
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        closeDrawer();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // Wire mobile theme toggle button
  document.getElementById("btnMobileThemeToggle")?.addEventListener("click", () => {
    document.getElementById("btnThemeToggle")?.click();
  });

  // ESC closes drawer
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("mobile-open")) {
      closeDrawer();
    }
  });

  // Auto clean up drawer state when resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && sidebar.classList.contains("mobile-open")) {
      closeDrawer();
    }
  });
}

function initAboutModal() {
  const modal = document.getElementById("modalAbout");
  if (!modal) return;
  
  const openModal = () => {
    modal.style.display = "flex";
  };
  const closeModal = () => {
    modal.style.display = "none";
  };

  document.getElementById("btnOpenAboutModal")?.addEventListener("click", openModal);
  document.getElementById("btnSidebarAbout")?.addEventListener("click", openModal);
  document.getElementById("btnCloseAboutModal")?.addEventListener("click", closeModal);
  document.getElementById("btnConfirmAboutModal")?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      closeModal();
    }
  });
}


function initNavigation() {
  const TAB_I18N_MAP = {
    "tab-home": "navigation.tabDashboard",
    "tab-cadastre": "navigation.tabRtk",
    "tab-rinex-studio": "navigation.tabRinex",
    "tab-map": "navigation.tabMap",
    "tab-geodesy": "navigation.tabGeodesy",
    "tab-tg20": "navigation.tabTg20",
    "tab-flight": "navigation.tabFlight",
    "tab-converter": "navigation.tabConverter",
    "tab-standards": "navigation.tabStandards",
    "tab-guide": "navigation.tabGuide"
  };

  // Tab-Specific Lazy-Load CSS Mapping
  const TAB_CSS_MAP = {
    "tab-cadastre": "css/tabs/tab-cadastre.css",
    "tab-rinex-studio": "css/tabs/tab-rinex.css",
    "tab-map": "css/tabs/tab-map.css",
    "tab-geodesy": "css/tabs/tab-geodesy.css",
    "tab-tg20": "css/tabs/tab-tg20.css",
    "tab-flight": "css/tabs/tab-flight.css",
    "tab-converter": "css/tabs/tab-converter.css",
    "tab-guide": "css/tabs/tab-guide.css"
  };

  const loadedTabStyles = new Set();

  function loadTabStyle(tabId) {
    const cssPath = TAB_CSS_MAP[tabId];
    if (!cssPath || loadedTabStyles.has(tabId)) return;

    if (document.querySelector(`link[href*="${cssPath}"]`)) {
      loadedTabStyles.add(tabId);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;
    link.setAttribute("data-lazy-tab", tabId);
    document.head.appendChild(link);
    loadedTabStyles.add(tabId);
  }

  // URL Hash & Parameter Slugs Mapping (Deep Linking)
  const TAB_SLUG_MAP = {
    "home": "tab-home",
    "dashboard": "tab-home",
    "anasayfa": "tab-home",

    "tg20": "tab-tg20",
    "tg-20": "tab-tg20",
    "jeoid": "tab-tg20",
    "geoid": "tab-tg20",

    "cadastre": "tab-cadastre",
    "rtk": "tab-cadastre",
    "kadastro": "tab-cadastre",
    "hamdata": "tab-cadastre",

    "rinex": "tab-rinex-studio",
    "rinex-studio": "tab-rinex-studio",
    "gnss": "tab-rinex-studio",

    "map": "tab-map",
    "pafta": "tab-map",
    "harita": "tab-map",

    "geodesy": "tab-geodesy",
    "jeodezi": "tab-geodesy",
    "donusum": "tab-geodesy",
    "helmert": "tab-geodesy",

    "flight": "tab-flight",
    "iha": "tab-flight",
    "drone": "tab-flight",
    "ucusp": "tab-flight",

    "converter": "tab-converter",
    "donusturucu": "tab-converter",
    "dxf": "tab-converter",
    "kml": "tab-converter",

    "standards": "tab-standards",
    "mevzuat": "tab-standards",
    "standartlar": "tab-standards",

    "guide": "tab-guide",
    "rehber": "tab-guide",
    "kilavuz": "tab-guide"
  };

  const TAB_DEFAULT_SLUG = {
    "tab-home": "home",
    "tab-cadastre": "rtk",
    "tab-rinex-studio": "rinex",
    "tab-map": "map",
    "tab-geodesy": "geodesy",
    "tab-tg20": "tg20",
    "tab-flight": "flight",
    "tab-converter": "converter",
    "tab-standards": "standards",
    "tab-guide": "guide"
  };

  const activateSubtab = (tabId, subtabSlug) => {
    if (!subtabSlug) return;
    const sub = subtabSlug.toLowerCase().trim();

    if (tabId === "tab-tg20") {
      setTimeout(() => {
        if (["map", "harita"].includes(sub)) {
          document.getElementById("btnTg20SubtabMap")?.click();
        } else if (["batch", "toplu"].includes(sub)) {
          document.getElementById("btnTg20SubtabBatch")?.click();
        } else if (["single", "tek"].includes(sub)) {
          document.getElementById("btnTg20SubtabSingle")?.click();
        } else if (["tech", "teknik"].includes(sub)) {
          document.getElementById("btnTg20SubtabTech")?.click();
        }
      }, 150);
    } else if (tabId === "tab-cadastre") {
      setTimeout(() => {
        if (["map", "harita", "view"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-view"]')?.click();
        } else if (["table", "tablo", "rtk"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-table"]')?.click();
        } else if (["matched", "cift", "dual"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-matched"]')?.click();
        } else if (["coords", "koordinat", "coordinate"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-coordinate"]')?.click();
        } else if (["upload", "yukle"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-upload"]')?.click();
        }
      }, 150);
    }
  };

  const resolveTabFromUrl = () => {
    // 1. Query Parametreleri Kontrolü: ?tab=tg20 veya ?module=tg20
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const param = urlParams.get("module") || urlParams.get("modul") || urlParams.get("tab");
      if (param) {
        const clean = param.toLowerCase().trim();
        if (TAB_SLUG_MAP[clean]) {
          return { tabId: TAB_SLUG_MAP[clean], subtab: urlParams.get("sub") || null };
        }
      }
    } catch (e) {}

    // 2. URL Hash Kontrolü: #tg20 veya #tg20/map
    let hash = window.location.hash || "";
    if (hash.startsWith("#")) {
      hash = hash.substring(1);
    }
    hash = hash.trim().toLowerCase();
    if (!hash) return null;

    const parts = hash.split("/");
    const primary = parts[0];
    const sub = parts[1] || null;

    if (TAB_SLUG_MAP[primary]) {
      return { tabId: TAB_SLUG_MAP[primary], subtab: sub };
    }
    if (document.getElementById(primary)) {
      return { tabId: primary, subtab: sub };
    }
    if (document.getElementById(`tab-${primary}`)) {
      return { tabId: `tab-${primary}`, subtab: sub };
    }

    return null;
  };

  const switchTab = (arg1, updateHash = true, subtab = null) => {
    // Lazy-load the tab's stylesheet if not already loaded
    loadTabStyle(arg1);

    elements.navItems.forEach(item => {
      if (item.getAttribute("data-tab") === arg1) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
    elements.toolTabs.forEach(item => item.classList.remove("active"));
    const domEl = document.getElementById(arg1);
    if (domEl) {
      domEl.classList.add("active");
      const i18nKey = TAB_I18N_MAP[arg1];
      if (i18nKey && typeof window.t === "function") {
        if (elements.pageTitle) elements.pageTitle.textContent = window.t(`${i18nKey}.title`);
        if (elements.pageSubtitle) elements.pageSubtitle.textContent = window.t(`${i18nKey}.sub`);
      }

      // Modül içi özel tetikleyiciler
      if (arg1 === "tab-map") {
        setTimeout(initMap, 200);
      }
      if (arg1 === "tab-flight") {
        setTimeout(() => { if (typeof initFlightPlannerStudio === "function") initFlightPlannerStudio(); }, 200);
      }
      if (arg1 === "tab-tg20") {
        setTimeout(() => { if (typeof initTg20InteractiveMap === "function") initTg20InteractiveMap(); }, 200);
      }
      if (arg1 === "tab-converter") {
        setTimeout(() => {
          if (typeof window.initConverterMap === "function") {
            window.initConverterMap();
          }
          if (state.converterMap) {
            state.converterMap.invalidateSize();
          }
        }, 200);
      }

      // Alt sekme varsa aktive et
      if (subtab) {
        activateSubtab(arg1, subtab);
      }

      // URL Hash güncellemesi (Sayfa yenilenmeden / zıplamadan doğrudan linklenebilir)
      if (updateHash) {
        const slug = TAB_DEFAULT_SLUG[arg1] || arg1.replace("tab-", "");
        let newHash = `#${slug}`;
        if (subtab) newHash += `/${subtab}`;
        if (window.location.hash !== newHash) {
          try {
            history.replaceState(null, "", newHash);
          } catch (e) {
            window.location.hash = newHash;
          }
        }
      }
    }
  };

  // Global Dışa Aktarım
  window.switchStudioTab = switchTab;

  elements.navItems.forEach(item => {
    item.addEventListener("click", () => {
      const v_1_1 = item.getAttribute("data-tab");
      switchTab(v_1_1, true);
    });
  });

  document.querySelectorAll(".bento-card[data-launch-tab]").forEach(item => {
    item.addEventListener("click", () => {
      const v_1_1 = item.getAttribute("data-launch-tab");
      if (v_1_1) {
        switchTab(v_1_1, true);
        const modTitle = TAB_I18N_MAP[v_1_1] ? t(`${TAB_I18N_MAP[v_1_1]}.title`) : v_1_1;
        logMessage(t("core.navigation.logModuleSwitched", { module: modTitle }));
      }
    });
  });

  document.querySelector(".brand")?.addEventListener("click", () => {
    switchTab("tab-home", true);
  });

  // Tarayıcı İleri / Geri & Hash Değişimi Dinleyicileri
  window.addEventListener("hashchange", () => {
    const route = resolveTabFromUrl();
    if (route && route.tabId) {
      switchTab(route.tabId, false, route.subtab);
    }
  });

  window.addEventListener("popstate", () => {
    const route = resolveTabFromUrl();
    if (route && route.tabId) {
      switchTab(route.tabId, false, route.subtab);
    }
  });

  // Sayfa Açılışında URL Parametre / Hash Kontrolü
  const initialRoute = resolveTabFromUrl();
  if (initialRoute && initialRoute.tabId) {
    switchTab(initialRoute.tabId, false, initialRoute.subtab);
  }
  const inputEl = document.getElementById("inputHomeHeroFile");
  if (inputEl) {
    inputEl.addEventListener("change", async event => {
      const v_1_1 = event.target.files?.[0];
      if (!v_1_1) {
        return;
      }
      const v_2 = v_1_1.name.split(".").pop().toLowerCase();
      const v_3 = await v_1_1.slice(0, 1500).text();
      if (["rw5", "raw", "csv", "jxl", "dat"].includes(v_2) || v_3.includes("GPS,PN") || v_3.includes("EP,PN")) {
        switchTab("tab-cadastre", true);
        const v_1_2 = new DataTransfer();
        v_1_2.items.add(v_1_1);
        if (elements.rw5FileInput) {
          elements.rw5FileInput.files = v_1_2.files;
          elements.rw5FileInput.dispatchEvent(new Event("change"));
        }
        showToast(t("core.navigation.toastRoutedRtk", { name: v_1_1.name }), "success");
      } else if (["o", "rnx", "crx", "obs", "nav", "26o", "25o", "24o"].some(item => v_2.includes(item) || v_2.endsWith("o") || v_2.endsWith("d"))) {
        switchTab("tab-rinex-studio", true);
        showToast(t("core.navigation.toastRoutedRinex", { name: v_1_1.name }), "info");
      } else if (["dxf", "kml", "kmz", "geojson"].includes(v_2)) {
        switchTab("tab-converter", true);
        const dt = new DataTransfer();
        dt.items.add(v_1_1);
        const inputConv = document.getElementById("inputConverterFile");
        if (inputConv) {
          inputConv.files = dt.files;
          inputConv.dispatchEvent(new Event("change"));
        }
        showToast(t("core.navigation.toastRoutedConverter", { name: v_1_1.name }), "success");
      } else if (["dns", "ncn", "txt", "xyz"].includes(v_2)) {
        switchTab("tab-geodesy", true);
        showToast(t("core.navigation.toastRoutedGeodesy", { name: v_1_1.name }), "info");
      } else {
        switchTab("tab-cadastre", true);
      }
    });
  }

  document.addEventListener("i18n:ready", () => {
    const activeItem = document.querySelector(".nav-item.active");
    const activeTab = activeItem ? activeItem.getAttribute("data-tab") : "tab-home";
    if (activeTab && TAB_I18N_MAP[activeTab]) {
      switchTab(activeTab, false);
    }
  });
}

/* <<<<<<<<<< [END MODULE: js/core/navigation.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/tabs/cadastreTab.js] >>>>>>>>>> */
/**
 * Harita Tools - RTK & Cadastre Module Controller
 */
function initGpsFormatSubtabs() {
  const subBtns = document.querySelectorAll(".sub-tab-btn");
  const subContents = document.querySelectorAll(".subtab-content");

  subBtns.forEach(item => {
    item.addEventListener("click", () => {
      subBtns.forEach(b => {
        b.classList.remove("active", "btn-primary");
        b.classList.add("btn-secondary");
      });
      subContents.forEach(c => {
        c.classList.remove("active");
        c.classList.add("d-none");
        c.style.display = "none";
      });

      item.classList.add("active", "btn-primary");
      item.classList.remove("btn-secondary");

      const targetId = item.getAttribute("data-subtab");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.remove("d-none");
        targetPanel.classList.add("active");
        targetPanel.style.display = "block";

        if (targetId === "subtab-view") {
          setTimeout(() => {
            initCadastreMap();
            if (state.cadastreMap) {
              state.cadastreMap.invalidateSize();
              plotCadastrePointsOnMap();
            }
          }, 150);
        } else if (targetId === "subtab-coordinate") {
          if (elements.txtCoordOutput && state.gnssEngine) {
            elements.txtCoordOutput.value = state.gnssEngine.exportFormattedCoordinateList(elements.selectCoordOrder.value);
          }
        }
      }
    });
  });
}

function initCadastreModule() {
  if (elements.rw5FileInput) {
    elements.rw5FileInput.addEventListener("change", async event => {
      const v_1_1 = event.target.files[0];
      const domEl_5 = document.getElementById("rw5FileDisplayName");
      const domEl_6 = document.getElementById("brandDetectPill");
      if (v_1_1) {
        const v_1_2 = await v_1_1.slice(0, 1500).text();
        const v_2_1 = state.gnssEngine.autoDetectFormat(v_1_2, v_1_1.name);
        if (domEl_5) {
          domEl_5.innerHTML = "<span class=\"text-white\">" + v_1_1.name + "</span> <span class=\"badge badge-tg20 ml-6\"><i class=\"fa-solid " + v_2_1.icon + "\"></i> " + v_2_1.name + "</span>";
        }
        if (domEl_6) {
          domEl_6.innerHTML = "<span class=\"status-dot status-dot-active\"></span> " + t("cadastre.formatLabel", { name: v_2_1.name });
        }
        logMessage(t("cadastre.logFormatDetected", { filename: v_1_1.name, brand: v_2_1.name }));
        showToast(t("cadastre.toastFormatDetected", { name: v_2_1.name }), "info");
      }
    });
  }
  elements.btnAnalyzeRw5?.addEventListener("click", handleGnssAnalysis);
  elements.btnPrintCadastre?.addEventListener("click", handlePrintCadastre);
  elements.btnExportCadastreCsv?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportCadastreCsv();
    downloadTextFile("kadastro_cift_okuma_cetelesi.csv", v_1_1);
  });
  elements.btnExportRtkCsv?.addEventListener("click", () => {
    let str = "No,Date/Time,Point,Easting,Northing,EL.Hgt,Ep,Hz,SAT,hRms,vRms,Pdop,Method,Network,Status,Ant.Ht,Latitude_Dec,Longitude_Dec\n";
    state.gnssEngine.rawPoints.forEach((item, idx) => {
      const latStr = item.lat !== undefined && item.lat !== null ? item.lat.toFixed(8) : (item.latDec ? item.latDec.toFixed(8) : "");
      const lonStr = item.lon !== undefined && item.lon !== null ? item.lon.toFixed(8) : (item.lonDec ? item.lonDec.toFixed(8) : "");
      const dtTm = (item.dt && item.dt !== "-") ? `${item.dt} ${item.tm && item.tm !== "-" ? item.tm : ""}`.trim() : "";
      const hRms = item.hsdvVal !== null && item.hsdvVal !== undefined ? item.hsdvVal.toFixed(3) : "";
      const vRms = item.vsdvVal !== null && item.vsdvVal !== undefined ? item.vsdvVal.toFixed(3) : "";
      const hVal = item.h !== null && item.h !== undefined ? item.h.toFixed(3) : "";
      str += `${idx + 1},${dtTm},${item.pn},${item.e.toFixed(3)},${item.n.toFixed(3)},${hVal},${item.epochs || ""},${item.hz || ""},${item.sats || ""},${hRms},${vRms},${item.pdop || ""},${item.method || ""},${item.network || ""},${item.status || ""},${item.hr || ""},${latStr},${lonStr}\n`;
    });
    downloadTextFile("gpsformat_rtk_ham_tablo.csv", str);
  });
  elements.btnExportNcn?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportNcnText();
    downloadTextFile("kadastro_noktalar.ncn", v_1_1);
  });
  elements.btnExportKos?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportKosText();
    downloadTextFile("kadastro_olculer.kos", v_1_1);
  });
  elements.btnExportDxf?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportDxfText();
    downloadTextFile("kadastro_cizim.dxf", v_1_1);
  });
  elements.btnExportKmlCadastre?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportKmlText();
    downloadTextFile("kadastro_noktalar_3d.kml", v_1_1);
  });
  elements.selectCoordOrder.addEventListener("change", () => {
    elements.txtCoordOutput.value = state.gnssEngine.exportFormattedCoordinateList(elements.selectCoordOrder.value);
  });
  elements.btnCopyCoords.addEventListener("click", () => {
    elements.txtCoordOutput.select();
    copyToClipboard(elements.txtCoordOutput.value, t("cadastre.toastCoordListCopied"));
  });
  elements.btnDownloadCoordTxt.addEventListener("click", () => {
    downloadTextFile("koordinatlar.txt", elements.txtCoordOutput.value);
    showToast(t("cadastre.toastTxtDownloaded"), "success");
  });
  const domEl = document.getElementById("chkRw5ApplyTg20");
  const domEl_1 = document.getElementById("badgeRw5Tg20Applied");
  const domEl_2 = document.getElementById("thRw5MatchedKot");
  const domEl_3 = document.getElementById("thRw5UnmatchedKot");
  const domEl_4 = document.getElementById("thRtkKot");
  domEl?.addEventListener("change", () => {
    const v_1_1 = domEl.checked;
    state.gnssEngine.applyTg20Reduction(state.tg20Engine, state.geodesyEngine, null, v_1_1);
    if (domEl_1) {
      domEl_1.style.display = v_1_1 ? "block" : "none";
    }
    if (elements.btnExportTg20RwReport) {
      elements.btnExportTg20RwReport.style.display = v_1_1 ? "inline-flex" : "none";
    }
    if (domEl_2) {
      domEl_2.innerHTML = v_1_1 ? "H (Ortometrik Kot) <span class=\"badge badge-tg20\">TG-20</span>" : "H (Kot) Ortalama";
    }
    if (domEl_4) {
      domEl_4.innerHTML = v_1_1 ? "H (Ortometrik Kot) <span class=\"badge badge-tg20\">TG-20</span>" : "EL.Hgt. (h)";
    }
    if (state.gnssEngine.rawPoints && state.gnssEngine.rawPoints.length > 0) {
      renderGpsFormatRtkTable(state.gnssEngine.rawPoints);
      renderRw5MatchedTable(state.gnssEngine.matchedPairs, state.gnssEngine.unmatchedPoints);
      elements.txtCoordOutput.value = state.gnssEngine.exportFormattedCoordinateList(elements.selectCoordOrder.value);
      logMessage(v_1_1 ? t("cadastre.logTg20Active") : t("cadastre.logTg20Inactive"));
      showToast(v_1_1 ? t("cadastre.toastTg20Applied") : t("cadastre.toastTg20Reverted"), "info");
    }
  });
  const v_1 = () => {
    if (!state.gnssEngine.isTg20Applied) {
      const domEl_5 = document.getElementById("chkRw5ApplyTg20");
      if (domEl_5) {
        domEl_5.checked = true;
        domEl_5.dispatchEvent(new Event("change"));
      }
    }
    if (state.gnssEngine.rawPoints?.length === 0) {
      showToast(t("cadastre.toastNeedGnssFile"), "warning");
      return;
    }
    const v_1_1 = state.gnssEngine.exportTg20ReductionReport();
    downloadTextFile("GPSFormat_TG20_Indirgeme_Raporu.txt", v_1_1);
    logMessage(t("cadastre.logTg20ReportDownloaded"));
    showToast(t("cadastre.toastTg20TxtDownloaded"), "success");
  };
  const v_2 = () => {
    if (!state.gnssEngine.isTg20Applied) {
      const domEl_5 = document.getElementById("chkRw5ApplyTg20");
      if (domEl_5) {
        domEl_5.checked = true;
        domEl_5.dispatchEvent(new Event("change"));
      }
    }
    if (state.gnssEngine.rawPoints?.length === 0) {
      showToast(t("cadastre.toastNeedGnssFile"), "warning");
      return;
    }
    const v_1_1 = state.gnssEngine.generatePrintableTg20Report("GNSS RTK / CORS TG-20 JEOİT İNDİRGEME RAPORU", state.tg20Engine, state.geodesyEngine);
    const v_2_1 = window.open("", "_blank", "width=950,height=750");
    if (v_2_1) {
      v_2_1.document.write(v_1_1);
      v_2_1.document.close();
      logMessage(t("cadastre.logPrintOpened"));
      showToast(t("cadastre.toastPrintWindowOpened"), "success");
    } else {
      showToast(t("cadastre.toastPopupBlocked"), "warning");
    }
  };
  document.getElementById("btnPrintTg20RwReportTop")?.addEventListener("click", v_2);
  document.getElementById("btnExportTg20RwReportTop")?.addEventListener("click", v_1);
  document.getElementById("btnPrintTg20RwReport")?.addEventListener("click", v_2);
  document.getElementById("btnExportTg20RwReport")?.addEventListener("click", v_1);
  document.getElementById("btnPrintTg20RwReportRtk")?.addEventListener("click", v_2);
  document.getElementById("btnExportNcnRtk")?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportNcnText();
    downloadTextFile("kadastro_noktalar.ncn", v_1_1);
  });
  document.getElementById("btnExportDxfRtk")?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportDxfText();
    downloadTextFile("kadastro_cizim.dxf", v_1_1);
  });
  document.getElementById("btnExportKmlRtk")?.addEventListener("click", () => {
    const v_1_1 = state.gnssEngine.exportKmlText();
    downloadTextFile("kadastro_noktalar_3d.kml", v_1_1);
  });
  document.getElementById("btnGoToFormatConverter")?.addEventListener("click", () => {
    if (typeof window.switchStudioTab === "function") {
      window.switchStudioTab("tab-converter");
    }
  });
  document.getElementById("btnGoToCoordTransform")?.addEventListener("click", () => {
    if (typeof window.switchStudioTab === "function") {
      window.switchStudioTab("tab-geodesy");
    }
  });
}
async function handleGnssAnalysis() {
  let str = "";
  let str_1 = "";
  const v_1 = elements.rw5FileInput.files[0];
  if (v_1) {
    str_1 = v_1.name;
    logMessage(t("cadastre.logReadingFile", { name: v_1.name }));
    updateProgress(20, t("cadastre.progReadingFile"));
    str = await v_1.text();
  } else {
    str_1 = "musksenylYKN20260313.rw5";
    logMessage(t("cadastre.logDefaultFileLoading"));
    updateProgress(20, t("cadastre.progDefaultFileLoading"));
    try {
      const v_1_1 = await fetch("musksenylYKN20260313.rw5");
      if (v_1_1.ok) {
        str = await v_1_1.text();
      } else {
        showToast(t("cadastre.toastSelectValidGnssFile"), "warning");
        return;
      }
    } catch (v_1_1) {
      showToast(t("cadastre.toastSelectValidGnssFile"), "warning");
      return;
    }
  }
  const v_2 = parseFloat(elements.rw5Tolerance.value) || 7;
  const v_3 = parseFloat(elements.rw5MinTime.value) || 60;
  const v_4 = parseFloat(elements.rw5Radius.value) || 1;
  logMessage(t("cadastre.logFormatScanning", { thresh: v_4, tol: v_2, time: v_3 }));
  updateProgress(50, t("cadastre.progParsingProjecting"));
  const v_5 = state.gnssEngine.parseData(str, str_1);
  elements.brandDetectPill.textContent = t("cadastre.formatLabel", { name: state.gnssEngine.detectedBrand });
  const {
    matched: v_6,
    unmatched: v_7
  } = state.gnssEngine.analyzeDoubleReadings(v_2, v_3, v_4);
  const domEl = document.getElementById("chkRw5ApplyTg20");
  const v_8 = domEl ? domEl.checked : false;
  if (v_8) {
    state.gnssEngine.applyTg20Reduction(state.tg20Engine, state.geodesyEngine, null, true);
  }
  elements.barCriterion.textContent = (v_2 / 100).toFixed(2) + "m [FIX]";
  elements.barProj.textContent = "ITRF-TM 3° " + state.gnssEngine.centralMeridian + "° E";
  if (v_5.length > 0 && state.tg20Engine?.isLoaded && v_5[0].latDec && v_5[0].lonDec) {
    const v_1_1 = state.tg20Engine.getGeoidHeight(v_5[0].latDec, v_5[0].lonDec);
    elements.barGeoid.textContent = v_1_1 !== null ? t("cadastre.barGeoidValue", { val: v_1_1.toFixed(3) }) : t("cadastre.barGeoidOutOfScope");
  } else {
    elements.barGeoid.textContent = t("cadastre.barGeoidDefault");
  }
  const btnEl = document.getElementById("btnSubtabGcp");
  const domEl_1 = document.getElementById("badgeGcpPairCount");
  const domEl_2 = document.getElementById("alertGcpNoPairs");
  const btnEl_1 = document.getElementById("btnPrintCadastre");
  if (v_6.length === 0) {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.classList.remove("disabled");
      btnEl.style.opacity = "1";
      btnEl.style.cursor = "pointer";
      btnEl.style.filter = "none";
      btnEl.title = t("cadastre.tooltipNoDualReadings");
    }
    if (domEl_1) {
      domEl_1.style.display = "inline-flex";
      domEl_1.className = "badge";
      domEl_1.style.background = "rgba(100, 116, 139, 0.25)";
      domEl_1.style.color = "#94a3b8";
      domEl_1.style.borderColor = "rgba(100, 116, 139, 0.4)";
      domEl_1.style.fontSize = "10px";
      domEl_1.style.padding = "1px 6px";
      domEl_1.innerHTML = t("cadastre.countDualReadings", { count: 0 });
    }
    if (domEl_2) {
      domEl_2.style.display = "flex";
    }
    if (btnEl_1) {
      btnEl_1.disabled = true;
      btnEl_1.classList.add("disabled");
      btnEl_1.style.opacity = "0.5";
      btnEl_1.style.cursor = "not-allowed";
      btnEl_1.title = t("cadastre.tooltipOfficialKarneDisabled");
    }
  } else {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.classList.remove("disabled");
      btnEl.style.opacity = "1";
      btnEl.style.cursor = "pointer";
      btnEl.style.filter = "none";
      btnEl.title = t("cadastre.tooltipDualCount", { count: v_6.length });
    }
    if (domEl_1) {
      domEl_1.style.display = "inline-flex";
      domEl_1.className = "badge";
      domEl_1.style.background = "rgba(16, 185, 129, 0.2)";
      domEl_1.style.color = "var(--emerald-400)";
      domEl_1.style.borderColor = "rgba(16, 185, 129, 0.4)";
      domEl_1.style.fontSize = "10px";
      domEl_1.style.padding = "1px 6px";
      domEl_1.innerHTML = t("cadastre.countDualReadings", { count: v_6.length }) + " ✓";
    }
    if (domEl_2) {
      domEl_2.style.display = "none";
    }
    if (btnEl_1) {
      btnEl_1.disabled = false;
      btnEl_1.classList.remove("disabled");
      btnEl_1.style.opacity = "1";
      btnEl_1.style.cursor = "pointer";
      btnEl_1.title = "";
    }
  }

  const isStaticDataset = v_5.length > 0 && v_5.every(p => p.isStaticCoordinate || !p.timestamp);
  const bannerStatic = document.getElementById("cadastreStaticCoordBanner");
  if (bannerStatic) {
    bannerStatic.classList.toggle("d-none", !isStaticDataset);
    if (isStaticDataset) {
      logMessage(t("cadastre.logStaticDatasetDetected"));
      showToast(t("cadastre.toastStaticCoordsLoaded"), "info");
    }
  }

  renderGpsFormatRtkTable(v_5);
  renderRw5MatchedTable(v_6, v_7);
  elements.txtCoordOutput.value = state.gnssEngine.exportFormattedCoordinateList(elements.selectCoordOrder.value);
  if (state.cadastreMap) {
    plotCadastrePointsOnMap();
  }
  updateProgress(100, t("cadastre.progCompleted"));
  logMessage(t("cadastre.logAnalysisSuccess", { brand: state.gnssEngine.detectedBrand, count: v_5.length }));
  logMessage(t("cadastre.logProjectionInfo", { meridian: state.gnssEngine.centralMeridian, dualStatus: v_6.length > 0 ? t("cadastre.dualStatusMatched", { count: v_6.length }) : t("cadastre.dualStatusNone") }));
}
function renderGpsFormatRtkTable(arg1 = []) {
  const tbody = elements.tableGpsFormatRtkBody;
  if (!tbody) return;
  tbody.innerHTML = "";

  const tmpl = document.getElementById("tmplRtkRow");
  if (!tmpl) return;

  const isTg20 = !!state.gnssEngine.isTg20Applied;
  document.querySelectorAll("#theadGpsFormatRtk .col-tg20").forEach(el => {
    el.style.display = isTg20 ? "" : "none";
  });

  const fragment = document.createDocumentFragment();

  arg1.forEach((item, idx) => {
    const clone = tmpl.content.cloneNode(true);
    const tr = clone.querySelector("tr");

    tr.querySelector(".cell-idx").textContent = idx + 1;
    tr.querySelector(".cell-pn").textContent = item.pn || "-";

    const dtTm = (item.dt && item.dt !== "-") ? `${item.dt} ${item.tm && item.tm !== "-" ? item.tm : ""}`.trim() : "-";
    tr.querySelector(".cell-time").textContent = dtTm;

    tr.querySelector(".cell-e").textContent = item.e != null ? item.e.toFixed(3) : "-";
    tr.querySelector(".cell-n").textContent = item.n != null ? item.n.toFixed(3) : "-";
    tr.querySelector(".cell-h").textContent = item.h != null ? item.h.toFixed(3) : "-";

    const tg20NCell = tr.querySelector(".cell-tg20-n");
    const tg20HCell = tr.querySelector(".cell-tg20-h");
    if (isTg20) {
      tg20NCell.style.display = "";
      tg20HCell.style.display = "";
      tg20NCell.textContent = item.tg20N ? (item.tg20N.startsWith("+") || item.tg20N.startsWith("-") ? item.tg20N : "+" + item.tg20N) + " m" : "--";
      tg20HCell.textContent = item.orthoH != null ? item.orthoH.toFixed(3) : (item.h != null ? item.h.toFixed(3) : "-");
    }

    tr.querySelector(".cell-ep").textContent = item.epochs ?? "-";
    tr.querySelector(".cell-hz").textContent = item.hz ?? "-";
    tr.querySelector(".cell-sats").textContent = item.sats ?? "-";
    tr.querySelector(".cell-hrms").textContent = item.hsdvVal != null ? item.hsdvVal.toFixed(3) : "-";
    tr.querySelector(".cell-vrms").textContent = item.vsdvVal != null ? item.vsdvVal.toFixed(3) : "-";
    tr.querySelector(".cell-pdop").textContent = item.pdop ?? "-";

    const statusCell = tr.querySelector(".cell-status");
    if (item.status && item.status !== "-") {
      statusCell.innerHTML = `<span class="text-emerald font-bold">${item.status}</span>`;
    } else {
      statusCell.innerHTML = `<span class="text-dim">-</span>`;
    }

    tr.querySelector(".cell-network").textContent = item.network || "-";
    tr.querySelector(".cell-method").textContent = item.method || "-";
    tr.querySelector(".cell-hr").textContent = item.hr || "-";

    const latVal = item.lat != null ? item.lat.toFixed(8) + "°" : (item.latDec ? item.latDec.toFixed(8) + "°" : "-");
    const lonVal = item.lon != null ? item.lon.toFixed(8) + "°" : (item.lonDec ? item.lonDec.toFixed(8) + "°" : "-");
    tr.querySelector(".cell-lat").textContent = latVal;
    tr.querySelector(".cell-lon").textContent = lonVal;

    tr.addEventListener("click", () => {
      if (typeof window.selectCadastrePoint === "function") {
        window.selectCadastrePoint(item, true);
      }
    });

    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

function renderRw5MatchedTable(arg1 = [], arg2 = []) {
  const tbody = elements.tableRw5MatchedBody;
  if (!tbody) return;
  tbody.innerHTML = "";

  const isTg20 = !!state.gnssEngine.isTg20Applied;
  document.querySelectorAll("#theadRw5Matched .col-tg20").forEach(el => {
    el.style.display = isTg20 ? "" : "none";
  });

  const totalPoints = (arg1?.length || 0) + (arg2?.length || 0);
  if (totalPoints === 0) {
    tbody.innerHTML = `<tr><td colspan="${isTg20 ? 14 : 12}" class="text-center text-amber p-14">${t("cadastre.noPointsToDisplay")}</td></tr>`;
    return;
  }

  const tmplMatched = document.getElementById("tmplMatchedRow");
  const tmplUnmatched = document.getElementById("tmplUnmatchedRow");
  if (!tmplMatched || !tmplUnmatched) return;

  const fragment = document.createDocumentFragment();

  // 1. Çift Okuma Eşleşen Noktalar
  if (arg1 && arg1.length > 0) {
    arg1.forEach(item => {
      const clone = tmplMatched.content.cloneNode(true);
      const tr = clone.querySelector("tr");

      tr.querySelector(".cell-pn").textContent = item.pointName;
      tr.querySelector(".cell-t1").textContent = (item.p1?.dt && item.p1?.dt !== "-") ? `${item.p1.dt} ${item.p1.tm || ""}`.trim() : "-";
      tr.querySelector(".cell-t2").textContent = (item.p2?.dt && item.p2?.dt !== "-") ? `${item.p2.dt} ${item.p2.tm || ""}`.trim() : "-";

      const timeDisplay = item.timeDiffStr || (parseFloat(item.timeDiffMin) < 60 ? `${item.timeDiffMin} dk` : `${item.timeDiffHours} sa`);
      const dtCell = tr.querySelector(".cell-dt");
      if (item.isTimePassed) {
        dtCell.innerHTML = `<span class="text-emerald font-semibold">${t("cadastre.timeDiffMin60Pass", { time: timeDisplay })}</span>`;
      } else {
        dtCell.innerHTML = `<span class="text-amber font-semibold" title="${t("cadastre.tooltipBohhbuyArticle28")}">${t("cadastre.timeDiffMin60Fail", { time: timeDisplay })}</span>`;
      }

      tr.querySelector(".cell-dy").textContent = item.dy;
      tr.querySelector(".cell-dx").textContent = item.dx;
      tr.querySelector(".cell-dh").textContent = item.dh;

      const dsCell = tr.querySelector(".cell-ds");
      dsCell.className = `cell-ds font-mono font-extrabold text-sm ${item.isDistPassed ? "text-emerald" : "text-rose"}`;
      dsCell.textContent = `${item.ds2d} cm`;

      const statusCell = tr.querySelector(".cell-status");
      statusCell.innerHTML = item.isDistPassed
        ? `<span class="badge-pass">${t("cadastre.badgePassDual")}</span>`
        : `<span class="badge-fail">${t("cadastre.badgeFailLimit")}</span>`;

      tr.querySelector(".cell-e").textContent = item.avgE;
      tr.querySelector(".cell-n").textContent = item.avgN;
      tr.querySelector(".cell-h").textContent = item.avgH;

      const tg20NCell = tr.querySelector(".cell-tg20-n");
      const tg20HCell = tr.querySelector(".cell-tg20-h");
      if (isTg20) {
        tg20NCell.style.display = "";
        tg20HCell.style.display = "";
        tg20NCell.textContent = item.tg20N ? (item.tg20N.startsWith("+") || item.tg20N.startsWith("-") ? item.tg20N : "+" + item.tg20N) + " m" : "--";
        tg20HCell.textContent = item.avgOrthoH || item.avgH;
      }

      tr.addEventListener("click", () => {
        if (typeof window.selectCadastrePoint === "function") {
          window.selectCadastrePoint(item.p1 || item, true);
        }
      });

      fragment.appendChild(tr);
    });
  }

  // 2. Tekil (İkinci Okuması Olmayan) Noktalar
  if (arg2 && arg2.length > 0) {
    arg2.forEach(item => {
      const clone = tmplUnmatched.content.cloneNode(true);
      const tr = clone.querySelector("tr");

      tr.querySelector(".cell-pn").textContent = item.pn;
      tr.querySelector(".cell-t1").textContent = (item.dt && item.dt !== "-") ? `${item.dt} ${item.tm || ""}`.trim() : "-";
      tr.querySelector(".cell-e").textContent = item.e != null ? item.e.toFixed(3) : "-";
      tr.querySelector(".cell-n").textContent = item.n != null ? item.n.toFixed(3) : "-";
      tr.querySelector(".cell-h").textContent = item.h != null ? item.h.toFixed(3) : "-";

      const tg20NCell = tr.querySelector(".cell-tg20-n");
      const tg20HCell = tr.querySelector(".cell-tg20-h");
      if (isTg20) {
        tg20NCell.style.display = "";
        tg20HCell.style.display = "";
        tg20NCell.textContent = item.tg20N ? (item.tg20N.startsWith("+") || item.tg20N.startsWith("-") ? item.tg20N : "+" + item.tg20N) + " m" : "--";
        tg20HCell.textContent = item.orthoH != null ? item.orthoH.toFixed(3) : (item.h != null ? item.h.toFixed(3) : "-");
      }

      tr.addEventListener("click", () => {
        if (typeof window.selectCadastrePoint === "function") {
          window.selectCadastrePoint(item, true);
        }
      });

      fragment.appendChild(tr);
    });
  }

  tbody.appendChild(fragment);
}
function handlePrintCadastre() {
  if (!state.gnssEngine.rawPoints || state.gnssEngine.rawPoints.length === 0) {
    showToast(t("cadastre.toastNeedGnssFile"), "warning");
    return;
  }
  if (!state.gnssEngine.matchedPairs || state.gnssEngine.matchedPairs.length === 0) {
    showToast(t("cadastre.toastNoDualReadingsWarning"), "warning");
    return;
  }
  const v_1 = state.gnssEngine.generatePrintableCadastreReport("TUSAGA-AKTİF RTK ÇİFT OKUMA & ÖLÇÜ KARNESİ");
  const v_2 = window.open("", "_blank");
  if (v_2) {
    v_2.document.write(v_1);
    v_2.document.close();
    v_2.focus();
    setTimeout(() => v_2.print(), 500);
  } else {
    alert(t("cadastre.toastPopupBlocked"));
  }
}

/* <<<<<<<<<< [END MODULE: js/tabs/cadastreTab.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/tabs/rinexTab.js] >>>>>>>>>> */
/**
 * Harita Tools - RINEX Studio, Merger & PPK Inspector Controller
 */
function initMergerDropzone() {
  const v_1 = elements.mergerDropzone;
  const v_2 = elements.mergerFileInput;
  ["dragenter", "dragover"].forEach(item => {
    v_1.addEventListener(item, event => {
      event.preventDefault();
      v_1.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(item => {
    v_1.addEventListener(item, event => {
      event.preventDefault();
      v_1.classList.remove("dragover");
    });
  });
  v_1.addEventListener("drop", event => {
    const v_1_1 = Array.from(event.dataTransfer.files);
    if (v_1_1.length > 0) {
      processUploadedFiles(v_1_1);
    }
  });
  v_2.addEventListener("change", event => {
    const v_1_1 = Array.from(event.target.files);
    if (v_1_1.length > 0) {
      processUploadedFiles(v_1_1);
    }
  });
  elements.btnMergeAll.addEventListener("click", mergeAllGroups);
  let v_3 = null;
  let v_4 = null;
  const inputEl = document.getElementById("inputPpkBaseFile");
  const inputEl_1 = document.getElementById("inputPpkRoverFile");
  const domEl = document.getElementById("txtPpkBaseFileName");
  const domEl_1 = document.getElementById("txtPpkRoverFileName");
  async function v_5() {
    if (!v_3 || !v_4) {
      return;
    }
    try {
      const v_1_1 = UniversalRinexInspector.inspectPpkOverlap(v_3, v_4);
      const domEl_2 = document.getElementById("ppkAnalysisResultWrapper");
      if (!domEl_2) {
        return;
      }
      document.getElementById("statPpkBaseTime").textContent = v_1_1.baseStartStr + " - " + v_1_1.baseEndStr + " (" + v_1_1.baseDurationStr + ")";
      document.getElementById("statPpkRoverTime").textContent = v_1_1.roverStartStr + " - " + v_1_1.roverEndStr + " (" + v_1_1.roverDurationStr + ")";
      document.getElementById("statPpkOverlapDuration").textContent = v_1_1.overlapDurationStr;
      document.getElementById("statPpkBaselineDist").textContent = v_1_1.baselineKm > 0 ? v_1_1.baselineKm.toFixed(2) + " km" : "Anten XYZ Yok";
      document.getElementById("statPpkCommonSystems").textContent = v_1_1.commonConstellations.length > 0 ? v_1_1.commonConstellations.join(" + ") : "Ortak Sistem Yok";
      const domEl_3 = document.getElementById("badgePpkOverlapPercent");
      if (domEl_3) {
        domEl_3.textContent = "%" + v_1_1.overlapPercent.toFixed(1) + " Kapsama";
        domEl_3.style.background = v_1_1.overlapPercent >= 99.5 ? "rgba(16, 185, 129, 0.25)" : v_1_1.overlapPercent >= 70 ? "rgba(245, 158, 11, 0.25)" : "rgba(244, 63, 94, 0.25)";
        domEl_3.style.color = v_1_1.overlapPercent >= 99.5 ? "var(--emerald-400)" : v_1_1.overlapPercent >= 70 ? "var(--amber-400)" : "var(--rose-400)";
      }
      const domEl_4 = document.getElementById("bannerPpkStatus");
      const domEl_5 = document.getElementById("iconPpkStatus");
      const domEl_6 = document.getElementById("titlePpkStatus");
      const domEl_7 = document.getElementById("descPpkStatus");
      if (domEl_4) {
        domEl_4.style.borderColor = v_1_1.statusLevel === "SUCCESS" ? "rgba(16, 185, 129, 0.5)" : v_1_1.statusLevel === "WARNING" ? "rgba(245, 158, 11, 0.5)" : "rgba(244, 63, 94, 0.5)";
        domEl_4.style.background = v_1_1.statusLevel === "SUCCESS" ? "rgba(16, 185, 129, 0.1)" : v_1_1.statusLevel === "WARNING" ? "rgba(245, 158, 11, 0.1)" : "rgba(244, 63, 94, 0.1)";
      }
      if (domEl_5) {
        domEl_5.className = v_1_1.statusLevel === "SUCCESS" ? "fa-solid fa-circle-check" : v_1_1.statusLevel === "WARNING" ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-circle-xmark";
        domEl_5.style.color = v_1_1.statusLevel === "SUCCESS" ? "var(--emerald-400)" : v_1_1.statusLevel === "WARNING" ? "var(--amber-400)" : "var(--rose-400)";
      }
      if (domEl_6) {
        domEl_6.textContent = v_1_1.statusTitle;
      }
      if (domEl_7) {
        domEl_7.textContent = v_1_1.statusDesc;
      }
      const domEl_8 = document.getElementById("barPpkBase");
      const domEl_9 = document.getElementById("barPpkRover");
      if (domEl_8 && domEl_9) {
        domEl_8.style.marginLeft = v_1_1.timeline.baseLeft + "%";
        domEl_8.style.width = v_1_1.timeline.baseWidth + "%";
        domEl_9.style.left = v_1_1.timeline.roverLeft + "%";
        domEl_9.style.width = v_1_1.timeline.roverWidth + "%";
        domEl_9.style.background = v_1_1.overlapPercent >= 99.5 ? "var(--emerald-400)" : v_1_1.overlapPercent >= 70 ? "var(--amber-400)" : "var(--rose-400)";
      }
      domEl_2.style.display = "flex";
      logMessage("🛰️ [PPK ANALİZİ] Gezici-Sabit Kapsaması: %" + v_1_1.overlapPercent.toFixed(1) + " | Baz: " + v_1_1.baselineKm.toFixed(2) + " km | Ortak: " + v_1_1.commonConstellations.join(", "));
      showToast(t("rinex.toastPpkCoverage", { percent: v_1_1.overlapPercent.toFixed(1) }), v_1_1.overlapPercent >= 99 ? "success" : "warning");
    } catch (v_1_1) {
      logMessage("❌ [PPK ANALİZ HATA] " + (v_1_1.message || v_1_1));
      showToast(t("rinex.toastPpkError", { err: v_1_1.message }), "error");
    }
  }
  inputEl?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.slice(0, 30000).text();
      v_3 = UniversalRinexInspector.inspectRinexHeader(v_1_1, v_2_1.name);
      if (domEl) {
        domEl.innerHTML = "<span style=\"color: var(--cyan-400); font-weight:700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size:10px;\">" + (v_3.markerName || t("rinex.badgeBase")) + "</span>";
      }
      logMessage(t("rinex.logBaseLoaded", { name: v_2_1.name, marker: v_3.markerName || "BASE" }));
      if (v_4) {
        v_5();
      }
    }
  });
  inputEl_1?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.slice(0, 30000).text();
      v_4 = UniversalRinexInspector.inspectRinexHeader(v_1_1, v_2_1.name);
      if (domEl_1) {
        domEl_1.innerHTML = "<span style=\"color: var(--emerald-400); font-weight:700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size:10px;\">" + (v_4.markerName || t("rinex.badgeRover")) + "</span>";
      }
      logMessage(t("rinex.logRoverLoaded", { name: v_2_1.name, marker: v_4.markerName || "ROVER" }));
      if (v_3) {
        v_5();
      }
    }
  });
}
async function processUploadedFiles(arg1) {
  logMessage("📂 " + arg1.length + " adet dosyanın RINEX başlıkları (Header) RAM'de taranıyor...");
  updateProgress(10, "Dosya başlıkları taranıyor...");
  state.mergerGroups = {};
  const obj = {
    constellations: new Set(),
    bands: new Set(),
    obsTypes: new Set()
  };
  for (let v_1 of arg1) {
    const headBlob = v_1.slice(0, 65536);
    const tailBlob = v_1.size > 65536 ? v_1.slice(Math.max(0, v_1.size - 65536)) : null;

    const readBlob = (blob) => new Promise(resolve => {
      if (!blob) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => resolve("");
      reader.readAsText(blob);
    });

    const headText = await readBlob(headBlob);
    const tailText = await readBlob(tailBlob);

    const v_3_1 = UniversalRinexInspector.inspectRinexHeader(headText, v_1.name, tailText);
    v_3_1.presentConstellations.forEach(item => obj.constellations.add(item));
    v_3_1.presentBands.forEach(item => obj.bands.add(item));
    v_3_1.presentObsTypes.forEach(item => obj.obsTypes.add(item));
    const v_4 = v_3_1.markerName || v_1.name.replace(/\.[^/.]+$/, "").toUpperCase();
    const v_5 = v_3_1.year;
    const v_6 = v_3_1.doy;
    const v_7 = v_4 + "_" + v_5 + "_DOY" + String(v_6).padStart(3, "0");
    if (!state.mergerGroups[v_7]) {
      state.mergerGroups[v_7] = {
        id: v_7,
        station: v_4,
        year: v_5,
        doy: v_6,
        version: v_3_1.version,
        obsFiles: [],
        navGpsFiles: [],
        navGloFiles: []
      };
    }
    const v_8 = state.mergerGroups[v_7];
    const obj_1 = {
      name: v_1.name,
      size: v_1.size,
      fileRef: v_1,
      inspected: v_3_1
    };
    if (v_3_1.fileType === "OBS") {
      v_8.obsFiles.push(obj_1);
    } else if (v_3_1.fileType === "NAV_GPS" || v_3_1.fileType === "NAV_MIXED") {
      v_8.navGpsFiles.push(obj_1);
    } else if (v_3_1.fileType === "NAV_GLO") {
      v_8.navGloFiles.push(obj_1);
    } else {
      const v_1_2 = (v_1.name.split(".").pop() || "").toUpperCase();
      if (v_1_2.endsWith("O") || v_1_2 === "OBS" || v_1_2 === "RNX") {
        v_8.obsFiles.push(obj_1);
      } else if (v_1_2.endsWith("N") || v_1_2 === "NAV") {
        v_8.navGpsFiles.push(obj_1);
      } else if (v_1_2.endsWith("G") || v_1_2 === "GLO") {
        v_8.navGloFiles.push(obj_1);
      }
    }
  }
  const v_2 = Object.keys(state.mergerGroups);
  if (v_2.length === 0) {
    logMessage("⚠️ Uygun RINEX gözlem veya navigasyon dosyası tespit edilemedi.");
    updateProgress(0, "Hazır");
    return;
  }
  const v_3 = state.mergerGroups[v_2[0]];
  if (v_3 && v_3.year) {
    const domEl = document.getElementById("selectTargetVersion");
    if (domEl) {
      populateDynamicFormats(domEl.value, v_3.year);
    }
  }
  let minStartTimestamp = Infinity;
  let maxEndTimestamp = -Infinity;
  let detectedDateStr = "";
  let startFormattedTime = "00:00:00";
  let endFormattedTime = "23:59:59";
  let startSecOfDay = 0;
  let endSecOfDay = 86399;

  for (let grpKey in state.mergerGroups) {
    const grp = state.mergerGroups[grpKey];
    for (let f of grp.obsFiles) {
      if (f.inspected) {
        const first = f.inspected.firstObs;
        const last = f.inspected.lastObs;
        if (first && first.timestamp) {
          if (first.timestamp < minStartTimestamp) {
            minStartTimestamp = first.timestamp;
            detectedDateStr = first.dateStr || `${first.year}-${String(first.month).padStart(2, "0")}-${String(first.day).padStart(2, "0")}`;
            startFormattedTime = `${String(first.hour).padStart(2, "0")}:${String(first.minute).padStart(2, "0")}:${String(Math.floor(first.second)).padStart(2, "0")}`;
            startSecOfDay = first.hour * 3600 + first.minute * 60 + Math.floor(first.second);
          }
        }
        if (last && last.timestamp) {
          if (last.timestamp > maxEndTimestamp) {
            maxEndTimestamp = last.timestamp;
            endFormattedTime = `${String(last.hour).padStart(2, "0")}:${String(last.minute).padStart(2, "0")}:${String(Math.floor(last.second)).padStart(2, "0")}`;
            endSecOfDay = last.hour * 3600 + last.minute * 60 + Math.floor(last.second);
          }
        }
      }
    }
  }

  if (minStartTimestamp !== Infinity && maxEndTimestamp !== -Infinity && maxEndTimestamp >= minStartTimestamp) {
    state.detectedTimeWindow = {
      date: detectedDateStr,
      startSec: startSecOfDay,
      endSec: endSecOfDay,
      startTimestamp: minStartTimestamp,
      endTimestamp: maxEndTimestamp
    };

    const totalDurationSec = Math.max(0, Math.round((maxEndTimestamp - minStartTimestamp) / 1000));
    const hours = Math.floor(totalDurationSec / 3600);
    const remMinutes = Math.floor((totalDurationSec % 3600) / 60);
    const remSeconds = totalDurationSec % 60;

    let durationText = "";
    if (hours > 0) {
      durationText = `${hours} ${t("rinex.unitHour")} ${remMinutes} ${t("rinex.unitMinute")}` + (remSeconds > 0 ? ` ${remSeconds} ${t("rinex.unitSecond")}` : "");
    } else if (remMinutes > 0) {
      durationText = `${remMinutes} ${t("rinex.unitMinute")}` + (remSeconds > 0 ? ` ${remSeconds} ${t("rinex.unitSecond")}` : "");
    } else {
      durationText = `${remSeconds} ${t("rinex.unitSecond")}`;
    }

    const domEl = document.getElementById("lblDetectedDate");
    if (domEl) {
      domEl.textContent = t("rinex.labelDate", { date: detectedDateStr });
    }
    const domEl_1 = document.getElementById("lblDetectedTimeRange");
    if (domEl_1) {
      domEl_1.textContent = startFormattedTime + " - " + endFormattedTime + " UTC";
    }
    const domEl_2 = document.getElementById("lblDetectedDuration");
    if (domEl_2) {
      domEl_2.textContent = durationText + ` (${(totalDurationSec / 3600).toFixed(2)} ${t("rinex.unitHour")})`;
    }
    const inputEl = document.getElementById("inputCropStart");
    if (inputEl) {
      inputEl.value = startFormattedTime;
    }
    const inputEl_1 = document.getElementById("inputCropEnd");
    if (inputEl_1) {
      inputEl_1.value = endFormattedTime;
    }
  }
  logMessage("✅ " + v_2.length + " istasyon oturumu, " + obj.constellations.size + " uydu sistemi dosyadan tespit edildi.");
  renderDynamicFilters(obj);
  renderGroupsTable();
  updateProgress(100, "Tarama Tamamlandı");
  elements.mergerResultCard.style.display = "block";
}
function renderDynamicFilters(arg1) {
  const domEl = document.getElementById("containerConstellations");
  const domEl_1 = document.getElementById("containerBands");
  const domEl_2 = document.getElementById("containerObsTypes");
  const obj = {
    GPS: {
      label: "🇺🇸 GPS (G)",
      color: "var(--cyan-500)"
    },
    GLO: {
      label: "🇷🇺 GLONASS (R)",
      color: "var(--cyan-500)"
    },
    GAL: {
      label: "🇪🇺 GALILEO (E)",
      color: "var(--cyan-500)"
    },
    BDS: {
      label: "🇨🇳 BEIDOU (C)",
      color: "var(--cyan-500)"
    },
    QZS: {
      label: "🇯🇵 QZSS (J)",
      color: "var(--cyan-500)"
    },
    SBS: {
      label: "🛰️ SBAS (S)",
      color: "var(--cyan-500)"
    }
  };
  const obj_1 = {
    L1: {
      label: "📶 L1 / E1 / B1 (1575 MHz)",
      color: "var(--purple-500)"
    },
    L2: {
      label: "📶 L2 / G2 / B2 (1227 MHz)",
      color: "var(--purple-500)"
    },
    L5: {
      label: "📶 L5 / E5a / B2a (1176 MHz)",
      color: "var(--purple-500)"
    },
    E6: {
      label: "📶 E6 / B3 (1278 MHz)",
      color: "var(--purple-500)"
    }
  };
  const obj_2 = {
    Phase: {
      label: "📡 Taşıyıcı Faz (L)",
      color: "var(--emerald-400)"
    },
    Code: {
      label: "🎯 Kod / Mesafe (C / P)",
      color: "var(--emerald-400)"
    },
    Doppler: {
      label: "🔊 Doppler (D)",
      color: "var(--emerald-400)"
    },
    SNR: {
      label: "📶 SNR Sinyal Gücü (S)",
      color: "var(--emerald-400)"
    }
  };
  if (domEl) {
    domEl.innerHTML = "";
    if (arg1.constellations.size === 0) {
      arg1.constellations.add("GPS");
    }
    arg1.constellations.forEach(item => {
      const v_1 = obj[item] || {
        label: item,
        color: "var(--cyan-500)"
      };
      const labelEl = document.createElement("label");
      labelEl.className = "rinex-filter-chip";
      labelEl.innerHTML = "<input type=\"checkbox\" class=\"chk-dynamic-const\" data-const=\"" + item + "\" checked style=\"accent-color: " + v_1.color + ";\" /> <span>" + v_1.label + "</span>";
      domEl.appendChild(labelEl);
    });
  }
  if (domEl_1) {
    domEl_1.innerHTML = "";
    if (arg1.bands.size === 0) {
      arg1.bands.add("L1");
      arg1.bands.add("L2");
    }
    arg1.bands.forEach(item => {
      const v_1 = obj_1[item] || {
        label: item,
        color: "var(--purple-500)"
      };
      const labelEl = document.createElement("label");
      labelEl.className = "rinex-filter-chip";
      labelEl.innerHTML = "<input type=\"checkbox\" class=\"chk-dynamic-band\" data-band=\"" + item + "\" checked style=\"accent-color: " + v_1.color + ";\" /> <span>" + v_1.label + "</span>";
      domEl_1.appendChild(labelEl);
    });
  }
  if (domEl_2) {
    domEl_2.innerHTML = "";
    if (arg1.obsTypes.size === 0) {
      arg1.obsTypes.add("Phase");
      arg1.obsTypes.add("Code");
      arg1.obsTypes.add("SNR");
    }
    arg1.obsTypes.forEach(item => {
      const v_1 = obj_2[item] || {
        label: item,
        color: "var(--emerald-400)"
      };
      const labelEl = document.createElement("label");
      labelEl.className = "rinex-filter-chip";
      labelEl.innerHTML = "<input type=\"checkbox\" class=\"chk-dynamic-obs\" data-obs=\"" + item + "\" checked style=\"accent-color: " + v_1.color + ";\" /> <span>" + v_1.label + "</span>";
      domEl_2.appendChild(labelEl);
    });
  }
}
function renderGroupsTable() {
  const v_1 = elements.tableGroupsBody;
  v_1.innerHTML = "";
  for (let v_1_1 in state.mergerGroups) {
    const v_1_2 = state.mergerGroups[v_1_1];
    const trEl = document.createElement("tr");
    trEl.innerHTML = "\n            <td class=\"font-bold text-main font-mono\">\n              <i class=\"fa-solid fa-layer-group\" style=\"color: var(--cyan-400); margin-right: 6px;\"></i> " + v_1_2.id + "\n            </td>\n            <td style=\"font-weight: 800; color: var(--cyan-400); font-size: 13px;\">" + v_1_2.station + "</td>\n            <td><span class=\"badge-year-chip\">" + v_1_2.year + "</span></td>\n            <td><span style=\"background: rgba(139, 92, 246, 0.15); color: var(--purple-500); border: 1px solid var(--border-purple-glow); padding: 2px 8px; border-radius: 6px; font-weight: 700; font-family: var(--font-mono);\">DOY " + String(v_1_2.doy).padStart(3, "0") + "</span></td>\n            <td><span style=\"background: rgba(6, 182, 212, 0.15); color: var(--cyan-400); border: 1px solid var(--border-cyan-glow); padding: 3px 10px; border-radius: 20px; font-weight: 700;\">📁 " + t("rinex.unitHourFile", { count: v_1_2.obsFiles.length }) + "</span></td>\n            <td><span style=\"background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); border: 1px solid var(--glow-emerald); padding: 3px 10px; border-radius: 20px; font-weight: 700;\">🛰️ " + t("rinex.unitFile", { count: v_1_2.navGpsFiles.length }) + "</span></td>\n            <td><span style=\"background: rgba(245, 158, 11, 0.15); color: var(--amber-400); border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 10px; border-radius: 20px; font-weight: 700;\">📡 " + t("rinex.unitFile", { count: v_1_2.navGloFiles.length }) + "</span></td>\n            <td>\n                <button class=\"btn btn-primary\" style=\"padding: 6px 14px; font-size: 12px;\" onclick=\"mergeSingleGroup('" + v_1_1 + "')\">\n                    <i class=\"fa-solid fa-bolt\"></i> " + t("rinex.btnProcessDownload") + "\n                </button>\n            </td>\n        ";
    v_1.appendChild(trEl);
  }
}
window.applyCropPreset = function (arg1) {
  if (!state.detectedTimeWindow) {
    return;
  }
  const {
    startSec: v_2,
    endSec: v_3
  } = state.detectedTimeWindow;
  const inputEl = document.getElementById("inputCropStart");
  const inputEl_1 = document.getElementById("inputCropEnd");
  const domEl = document.getElementById("chkEnableTimeCrop");
  const domEl_1 = document.getElementById("timeCropControlsContainer");
  const domEl_2 = document.getElementById("lblTimeCropStatusText");
  const v_4 = arg1_1 => {
    const v_2_1 = String(Math.floor(arg1_1 / 3600)).padStart(2, "0");
    const v_3_1 = String(Math.floor(arg1_1 % 3600 / 60)).padStart(2, "0");
    const v_4_1 = String(Math.floor(arg1_1 % 60)).padStart(2, "0");
    return v_2_1 + ":" + v_3_1 + ":" + v_4_1;
  };
  if (arg1 === "ALL") {
    inputEl.value = v_4(v_2);
    inputEl_1.value = v_4(v_3);
    if (domEl) {
      domEl.checked = false;
      if (domEl_1) {
        domEl_1.classList.remove("time-crop-enabled");
        domEl_1.classList.add("time-crop-disabled");
      }
      if (domEl_2) {
        domEl_2.textContent = t("rinex.filterDisabled");
        domEl_2.style.color = "var(--text-dim)";
      }
    }
  } else {
    if (domEl) {
      domEl.checked = true;
      if (domEl_1) {
        domEl_1.classList.remove("time-crop-disabled");
        domEl_1.classList.add("time-crop-enabled");
      }
      if (domEl_2) {
        domEl_2.textContent = t("rinex.filterActive");
        domEl_2.style.color = "var(--cyan-400)";
      }
    }
    if (arg1 === "FIRST_1H") {
      inputEl.value = v_4(v_2);
      inputEl_1.value = v_4(Math.min(v_3, v_2 + 3600));
    } else if (arg1 === "FIRST_2H") {
      inputEl.value = v_4(v_2);
      inputEl_1.value = v_4(Math.min(v_3, v_2 + 7200));
    } else if (arg1 === "LAST_2H") {
      inputEl.value = v_4(Math.max(v_2, v_3 - 7200));
      inputEl_1.value = v_4(v_3);
    }
  }
};
const chkEnableTimeCrop = document.getElementById("chkEnableTimeCrop");
const timeCropControlsContainer = document.getElementById("timeCropControlsContainer");
const lblTimeCropStatusText = document.getElementById("lblTimeCropStatusText");
if (chkEnableTimeCrop && timeCropControlsContainer) {
  chkEnableTimeCrop.addEventListener("change", () => {
    if (chkEnableTimeCrop.checked) {
      timeCropControlsContainer.classList.remove("time-crop-disabled");
      timeCropControlsContainer.classList.add("time-crop-enabled");
      if (lblTimeCropStatusText) {
        lblTimeCropStatusText.textContent = t("rinex.filterActive");
        lblTimeCropStatusText.style.color = "var(--cyan-400)";
      }
    } else {
      timeCropControlsContainer.classList.remove("time-crop-enabled");
      timeCropControlsContainer.classList.add("time-crop-disabled");
      if (lblTimeCropStatusText) {
        lblTimeCropStatusText.textContent = t("rinex.filterDisabled");
        lblTimeCropStatusText.style.color = "var(--text-dim)";
      }
    }
  });
}
function createSafeRinexWorker() {
  if (window.location.protocol === "file:") {
    return {
      postMessage: function (arg1) {
        if (arg1.action === "MERGE_GROUP") {
          setTimeout(() => {
            RinexMergerEngine.processGroup(arg1.group, arg1_1 => {
              if (this.onmessage) {
                this.onmessage({
                  data: arg1_1
                });
              }
            });
          }, 20);
        }
      },
      terminate: function () {},
      onmessage: null
    };
  }
  try {
    return new Worker("js/workers/rinex_merger_worker.js");
  } catch (v_1) {
    console.warn("Worker initialization blocked by browser file:// security, falling back to direct RAM execution:", v_1);
    return {
      postMessage: function (arg1) {
        if (arg1.action === "MERGE_GROUP") {
          setTimeout(() => {
            RinexMergerEngine.processGroup(arg1.group, arg1_1 => {
              if (this.onmessage) {
                this.onmessage({
                  data: arg1_1
                });
              }
            });
          }, 20);
        }
      },
      terminate: function () {},
      onmessage: null
    };
  }
}
window.mergeSingleGroup = async function (arg1) {
  const v_2 = state.mergerGroups[arg1];
  if (!v_2) {
    return;
  }
  const v_3 = document.getElementById("selectTargetVersion")?.value || "RINEX_211";
  const v_4 = document.getElementById("selectTargetFormat")?.value || "OBS_ONLY";
  const v_5 = parseInt(document.getElementById("selectDecimationStep")?.value) || 1;
  const obj = {};
  document.querySelectorAll(".chk-dynamic-const").forEach(item => {
    obj[item.dataset.const] = item.checked;
  });
  state.rinexEngine.setConstellations(obj);
  const obj_1 = {};
  document.querySelectorAll(".chk-dynamic-band").forEach(item => {
    obj_1[item.dataset.band] = item.checked;
  });
  state.rinexEngine.setBands(obj_1);
  const obj_2 = {};
  document.querySelectorAll(".chk-dynamic-obs").forEach(item => {
    obj_2[item.dataset.obs] = item.checked;
  });
  state.rinexEngine.setObsTypes(obj_2);
  const v_6 = document.getElementById("chkEnableTimeCrop")?.checked ?? false;
  let v_7 = null;
  let v_8 = null;
  if (v_6) {
    const v_1 = document.getElementById("inputCropStart")?.value || "00:00:00";
    const v_2_1 = v_1.split(":").map(Number);
    v_7 = (v_2_1[0] || 0) * 3600 + (v_2_1[1] || 0) * 60 + (v_2_1[2] || 0);
    const v_3_1 = document.getElementById("inputCropEnd")?.value || "23:59:59";
    const v_4_1 = v_3_1.split(":").map(Number);
    v_8 = (v_4_1[0] || 0) * 3600 + (v_4_1[1] || 0) * 60 + (v_4_1[2] || 0);
  }
  let str = "2.11";
  let flag = false;
  if (v_3 === "RINEX_210") {
    str = "2.10";
  } else if (v_3 === "RINEX_211") {
    str = "2.11";
  } else if (v_3 === "RINEX_300") {
    str = "3.00";
    flag = true;
  } else if (v_3 === "RINEX_302") {
    str = "3.02";
    flag = true;
  } else if (v_3 === "RINEX_303") {
    str = "3.03";
    flag = true;
  } else if (v_3 === "RINEX_304") {
    str = "3.04";
    flag = true;
  } else if (v_3 === "RINEX_305") {
    str = "3.05";
    flag = true;
  } else if (v_3 === "RINEX_400") {
    str = "4.00";
    flag = true;
  }
  const v_9 = Object.keys(obj).filter(item => obj[item]).join("/");
  logMessage("🚀 '" + arg1 + "' grubu işleniyor | Sistemler: " + (v_9 || "Tümü") + " | Sürüm: " + v_3 + " | Format: " + v_4 + " | Örnekleme: " + v_5 + "s...");
  updateProgress(15, "İçerikler okunuyor...");
  const v_10 = arg1_1 => {
    return new Promise((arg1_2, arg2) => {
      const v_3_1 = new FileReader();
      v_3_1.onload = () => arg1_2({
        name: arg1_1.name,
        text: v_3_1.result
      });
      v_3_1.onerror = arg2;
      v_3_1.readAsText(arg1_1.fileRef);
    });
  };
  const v_11 = await Promise.all(v_2.obsFiles.map(v_10));
  const v_12 = await Promise.all(v_2.navGpsFiles.map(v_10));
  const v_13 = await Promise.all(v_2.navGloFiles.map(v_10));
  const obj_3 = {
    id: v_2.id,
    station: v_2.station,
    year: v_2.year,
    doy: v_2.doy,
    targetVersion: str,
    decimation: v_5,
    allowedConstellations: obj,
    timeCrop: {
      enabled: v_6,
      startSec: v_7,
      endSec: v_8
    },
    obsFiles: v_11,
    navGpsFiles: v_12,
    navGloFiles: v_13
  };
  const v_14 = createSafeRinexWorker();
  v_14.postMessage({
    action: "MERGE_GROUP",
    group: obj_3
  });
  v_14.onmessage = async arg1_1 => {
    const {
      type: v_2_1,
      text: v_3_1,
      value: v_4_1,
      results: v_5_1,
      message: v_6_1
    } = arg1_1.data;
    if (v_2_1 === "LOG") {
      logMessage(v_3_1);
    }
    if (v_2_1 === "PROGRESS") {
      updateProgress(v_4_1, "İşleniyor...");
    }
    if (v_2_1 === "COMPLETE") {
      logMessage("🎉 [BAŞARILI] '" + arg1 + "' grubu başarıyla tamamlandı!");
      state.currentMergedFiles[arg1] = v_5_1;
      const v_1 = "" + v_2.station + String(v_2.doy).padStart(3, "0") + "0";
      if (v_3 === "RINEX_211" || v_3 === "RINEX_210") {
        if (v_4 === "OBS_YYO") {
          if (v_5_1.obs) {
            downloadTextFile(v_5_1.obs.filename, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.obs.filename + " (RINEX " + str + " Yıl Uzantılı Gözlem).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.obs.filename }), "success");
          } else {
            showToast(t("rinex.toastObsNotFound"), "warning");
          }
        } else if (v_4 === "OBS_EXT") {
          if (v_5_1.obs) {
            const v_1_1 = v_1 + ".obs";
            downloadTextFile(v_1_1, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_1 + " (RINEX " + str + " .OBS Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_1 }), "success");
          } else {
            showToast(t("rinex.toastObsNotFound"), "warning");
          }
        } else if (v_4 === "NAV_YYN") {
          if (v_5_1.navGps) {
            downloadTextFile(v_5_1.navGps.filename, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.navGps.filename + " (GPS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.navGps.filename }), "success");
          } else {
            showToast(t("rinex.toastGpsNavNotFound"), "warning");
          }
        } else if (v_4 === "NAV_EXT") {
          if (v_5_1.navGps) {
            const v_1_1 = v_1 + ".nav";
            downloadTextFile(v_1_1, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_1 + " (.NAV GPS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_1 }), "success");
          } else {
            showToast(t("rinex.toastGpsNavNotFound"), "warning");
          }
        } else if (v_4 === "NAV_YYG") {
          if (v_5_1.navGlo) {
            downloadTextFile(v_5_1.navGlo.filename, v_5_1.navGlo.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.navGlo.filename + " (GLONASS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.navGlo.filename }), "success");
          } else {
            showToast(t("rinex.toastGloNavNotFound"), "warning");
          }
        } else if (v_4 === "HATANAKA_YYD") {
          if (v_5_1.obs) {
            const v_1_1 = v_5_1.obs.filename.replace(/O$/i, "D");
            downloadTextFile(v_1_1, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_1 + " (Hatanaka Compact RINEX ." + String(v_2.year % 100).padStart(2, "0") + "d).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_1 }), "success");
          }
        } else {
          downloadGroupZip(arg1, v_5_1);
          showToast(t("rinex.toastZipPrepared", { name: arg1 }), "success");
        }
      } else if (flag) {
        const v_1_1 = v_2.station + "00TUR_R_" + v_2.year + String(v_2.doy).padStart(3, "0") + "0000_01D_" + v_5 + "S_MO.rnx";
        if (v_4 === "OBS_YYO") {
          if (v_5_1.obs) {
            downloadTextFile(v_5_1.obs.filename, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.obs.filename + " (RINEX " + str + " 8.3 Gözlem Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.obs.filename }), "success");
          } else {
            showToast(t("rinex.toastObsNotFound"), "warning");
          }
        } else if (v_4 === "OBS_EXT") {
          if (v_5_1.obs) {
            const v_1_2 = v_1 + ".obs";
            downloadTextFile(v_1_2, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (RINEX " + str + " .OBS Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          } else {
            showToast(t("rinex.toastObsNotFound"), "warning");
          }
        } else if (v_4 === "RNX_OBS") {
          if (v_5_1.obs) {
            downloadTextFile(v_1_1, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_1 + " (Modern Multi-GNSS RINEX " + str + ").");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_1 }), "success");
          }
        } else if (v_4 === "NAV_YYN") {
          if (v_5_1.navGps) {
            downloadTextFile(v_5_1.navGps.filename, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.navGps.filename + " (GPS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.navGps.filename }), "success");
          } else {
            showToast(t("rinex.toastGpsNavNotFound"), "warning");
          }
        } else if (v_4 === "NAV_EXT") {
          if (v_5_1.navGps) {
            const v_1_2 = v_1 + ".nav";
            downloadTextFile(v_1_2, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (.NAV GPS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          } else {
            showToast(t("rinex.toastGpsNavNotFound"), "warning");
          }
        } else if (v_4 === "NAV_YYG") {
          if (v_5_1.navGlo) {
            downloadTextFile(v_5_1.navGlo.filename, v_5_1.navGlo.content);
            logMessage("💾 [İNDİRİLDİ] " + v_5_1.navGlo.filename + " (GLONASS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_5_1.navGlo.filename }), "success");
          } else {
            showToast(t("rinex.toastGloNavNotFound"), "warning");
          }
        } else if (v_4 === "RNX_NAV_MIX") {
          if (v_5_1.navGps) {
            const v_1_2 = v_2.station + "00TUR_R_" + v_2.year + String(v_2.doy).padStart(3, "0") + "0000_01D_MN.rnx";
            downloadTextFile(v_1_2, v_5_1.navGps.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (Multi-GNSS Seyir Dosyası).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          }
        } else if (v_4 === "HATANAKA_YYD") {
          if (v_5_1.obs) {
            const v_1_2 = v_5_1.obs.filename.replace(/O$/i, "D");
            downloadTextFile(v_1_2, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (Hatanaka Compact RINEX ." + String(v_2.year % 100).padStart(2, "0") + "d).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          }
        } else if (v_4 === "HATANAKA_CRX") {
          const v_1_2 = v_1_1.replace(/\.rnx$/i, ".crx");
          if (v_5_1.obs) {
            downloadTextFile(v_1_2, v_5_1.obs.content);
            logMessage("💾 [İNDİRİLDİ] " + v_1_2 + " (Compact RINEX Multi-GNSS .crx).");
            showToast(t("rinex.toastFileDownloaded", { name: v_1_2 }), "success");
          }
        } else {
          downloadGroupZip(arg1, v_5_1);
          showToast(t("rinex.toastMultiGnssZipPrepared", { name: arg1 }), "success");
        }
      }
      v_14.terminate();
    }
    if (v_2_1 === "ERROR") {
      logMessage("❌ [HATA] " + v_6_1);
      v_14.terminate();
    }
  };
};
async function runSppOnMergedResults(arg1, arg2, arg3, arg4, arg5) {
  const v_6 = new Worker("js/workers/pos_worker.js");
  v_6.postMessage({
    action: "PROCESS_SPP",
    obsText: arg2,
    navText: arg3,
    stepSeconds: arg4,
    obsFileName: arg1 + ".obs",
    navFileName: arg1 + ".nav"
  });
  v_6.onmessage = arg1_1 => {
    const {
      type: v_2,
      text: v_3,
      value: v_4,
      solutions: v_5,
      posText: v_6_1,
      csvText: v_7,
      summary: v_8,
      message: v_9
    } = arg1_1.data;
    if (v_2 === "LOG") {
      logMessage(v_3);
    }
    if (v_2 === "PROGRESS") {
      updateProgress(v_4, "SPP Hesaplanıyor...");
    }
    if (v_2 === "SPP_COMPLETE") {
      state.posSolutions = v_5;
      state.posText = v_6_1;
      state.csvText = v_7;
      logMessage("✨ [BAŞARILI] " + v_8.totalEpochs + " epoch için hassas konum çözümü üretildi!");
      logMessage("[KONUM] Enlem: " + v_8.avgLat.toFixed(8) + "° | Boylam: " + v_8.avgLon.toFixed(8) + "° | Kot: " + v_8.avgHeight.toFixed(3) + " m");
      if (arg5 === "NMEA_0183") {
        const v_1 = state.rinexEngine.generateNmeaLog(v_5);
        downloadTextFile(arg1 + ".nmea", v_1);
        logMessage("💾 [İNDİRİLDİ] " + arg1 + ".nmea (NMEA-0183 Telemetri Logu).");
      } else if (arg5 === "CSV_TELEMETRY") {
        downloadTextFile(arg1 + ".csv", v_7);
        logMessage("💾 [İNDİRİLDİ] " + arg1 + ".csv (Konum Tablosu).");
      } else {
        downloadTextFile(arg1 + ".pos", v_6_1);
        logMessage("💾 [İNDİRİLDİ] " + arg1 + ".pos (RTKLIB Hassas Çözüm Dosyası).");
      }
      v_6.terminate();
    }
    if (v_2 === "ERROR") {
      logMessage("❌ [HATA] " + v_9);
      v_6.terminate();
    }
  };
}
async function mergeAllGroups() {
  for (let v_1 in state.mergerGroups) {
    await window.mergeSingleGroup(v_1);
  }
}
function downloadGroupZip(arg1, arg2) {
  const v_3 = new JSZip();
  if (arg2.obs) {
    v_3.file(arg2.obs.filename, arg2.obs.content);
  }
  if (arg2.navGps) {
    v_3.file(arg2.navGps.filename, arg2.navGps.content);
  }
  if (arg2.navGlo) {
    v_3.file(arg2.navGlo.filename, arg2.navGlo.content);
  }
  v_3.generateAsync({
    type: "blob"
  }).then(blob => {
    downloadTextFile(arg1 + "_MERGED.zip", blob, "application/zip");
  });
}

function initPpkInspector() {
  let v_1 = null;
  let v_2 = null;
  const inputEl = document.getElementById("inputPpkBaseFile");
  const inputEl_1 = document.getElementById("inputPpkRoverFile");
  const domEl = document.getElementById("txtPpkBaseFileName");
  const domEl_1 = document.getElementById("txtPpkRoverFileName");
  const domEl_2 = document.getElementById("ppkAnalysisResultWrapper");
  const v_3 = () => {
    if (!v_1 || !v_2) {
      return;
    }
    try {
      const v_1_1 = UniversalRinexInspector.inspectPpkOverlap(v_1, v_2);
      if (domEl_2) {
        domEl_2.style.display = "flex";
      }
      const domEl_3 = document.getElementById("bannerPpkStatus");
      const domEl_4 = document.getElementById("iconPpkStatus");
      const domEl_5 = document.getElementById("titlePpkStatus");
      const domEl_6 = document.getElementById("descPpkStatus");
      const domEl_7 = document.getElementById("badgePpkOverlapPercent");
      if (v_1_1.statusLevel === "SUCCESS") {
        if (domEl_3) {
          domEl_3.style.background = "rgba(16, 185, 129, 0.12)";
          domEl_3.style.borderColor = "rgba(16, 185, 129, 0.4)";
        }
        if (domEl_4) {
          domEl_4.className = "fa-solid fa-circle-check";
          domEl_4.style.color = "var(--emerald-400)";
        }
        if (domEl_5) {
          domEl_5.style.color = "var(--emerald-400)";
        }
        if (domEl_7) {
          domEl_7.style.background = "rgba(16, 185, 129, 0.2)";
          domEl_7.style.color = "var(--emerald-400)";
        }
      } else if (v_1_1.statusLevel === "WARNING") {
        if (domEl_3) {
          domEl_3.style.background = "rgba(245, 158, 11, 0.12)";
          domEl_3.style.borderColor = "rgba(245, 158, 11, 0.4)";
        }
        if (domEl_4) {
          domEl_4.className = "fa-solid fa-triangle-exclamation";
          domEl_4.style.color = "var(--amber-400)";
        }
        if (domEl_5) {
          domEl_5.style.color = "var(--amber-400)";
        }
        if (domEl_7) {
          domEl_7.style.background = "rgba(245, 158, 11, 0.2)";
          domEl_7.style.color = "var(--amber-400)";
        }
      } else {
        if (domEl_3) {
          domEl_3.style.background = "rgba(239, 68, 68, 0.12)";
          domEl_3.style.borderColor = "rgba(239, 68, 68, 0.4)";
        }
        if (domEl_4) {
          domEl_4.className = "fa-solid fa-circle-xmark";
          domEl_4.style.color = "var(--red-400)";
        }
        if (domEl_5) {
          domEl_5.style.color = "var(--red-400)";
        }
        if (domEl_7) {
          domEl_7.style.background = "rgba(239, 68, 68, 0.2)";
          domEl_7.style.color = "var(--red-400)";
        }
      }
      if (domEl_5) {
        domEl_5.textContent = v_1_1.statusTitle;
      }
      if (domEl_6) {
        domEl_6.textContent = v_1_1.statusDesc;
      }
      if (domEl_7) {
        domEl_7.textContent = "%" + v_1_1.overlapPercent.toFixed(1) + " Kapsama";
      }
      const domEl_8 = document.getElementById("statPpkBaseTime");
      const domEl_9 = document.getElementById("statPpkRoverTime");
      const domEl_10 = document.getElementById("statPpkOverlapDuration");
      const v_2_1 = document.getElementById("statPpkBaselineDist") || document.getElementById("statPpkBaselineKm");
      const v_3_1 = document.getElementById("statPpkCommonSystems") || document.getElementById("statPpkCommonConst");
      if (domEl_8) {
        domEl_8.textContent = v_1_1.baseStartStr + " - " + v_1_1.baseEndStr + " (" + v_1_1.baseDurationStr + ")";
      }
      if (domEl_9) {
        domEl_9.textContent = v_1_1.roverStartStr + " - " + v_1_1.roverEndStr + " (" + v_1_1.roverDurationStr + ")";
      }
      if (domEl_10) {
        domEl_10.textContent = v_1_1.overlapDurationStr + " (%" + v_1_1.overlapPercent.toFixed(1) + ")";
      }
      if (v_2_1) {
        v_2_1.innerHTML = "<span style=\"color:var(--purple-400); font-weight:700;\">" + v_1_1.baselineStr + "</span> <span style=\"font-size:10px; color:#94a3b8; display:block; font-weight:normal;\">" + v_1_1.baselineNote + "</span>";
      }
      if (v_3_1) {
        v_3_1.textContent = v_1_1.commonConstellations.join(", ") || "GPS";
      }
      const domEl_11 = document.getElementById("barPpkBase");
      const domEl_12 = document.getElementById("barPpkRover");
      if (domEl_11) {
        domEl_11.style.left = v_1_1.timeline.baseLeft + "%";
        domEl_11.style.width = v_1_1.timeline.baseWidth + "%";
      }
      if (domEl_12) {
        domEl_12.style.left = v_1_1.timeline.roverLeft + "%";
        domEl_12.style.width = v_1_1.timeline.roverWidth + "%";
      }
      logMessage("🛰️ [PPK ANALİZİ] Kapsama: %" + v_1_1.overlapPercent.toFixed(1) + ", Baz: " + v_1_1.baselineKm.toFixed(2) + " km, Ortak Süre: " + v_1_1.overlapDurationStr);
      showToast(t("rinex.toastPpkAnalysisSuccess", { percent: v_1_1.overlapPercent.toFixed(1), baseline: v_1_1.baselineKm.toFixed(1) }), v_1_1.statusLevel === "SUCCESS" ? "success" : "warning");
    } catch (v_1_1) {
      logMessage("❌ [PPK HATA] " + (v_1_1.message || v_1_1));
      showToast(t("rinex.toastPpkAnalysisError", { err: v_1_1.message }), "error");
    }
  };
  inputEl?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.text();
      v_1 = UniversalRinexInspector.inspectRinexHeader(v_1_1, v_2_1.name);
      if (domEl) {
        domEl.innerHTML = "<span style=\"color: var(--cyan-400); font-weight: 700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size: 10px;\">" + t("rinex.badgeBase") + "</span>";
      }
      showToast(t("rinex.toastBaseLoaded", { name: v_2_1.name }), "info");
      v_3();
    }
  });
  inputEl_1?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.text();
      v_2 = UniversalRinexInspector.inspectRinexHeader(v_1_1, v_2_1.name);
      if (domEl_1) {
        domEl_1.innerHTML = "<span style=\"color: var(--emerald-400); font-weight: 700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size: 10px;\">" + t("rinex.badgeRover") + "</span>";
      }
      showToast(t("rinex.toastRoverLoaded", { name: v_2_1.name }), "info");
      v_3();
    }
  });
}
function initRinexQualityInspector() {
  const inputEl = document.getElementById("inputRinexQualityFile");
  const domEl = document.getElementById("rinexQualityDashboard");
  inputEl?.addEventListener("change", async arg1 => {
    const v_2 = arg1.target.files?.[0];
    if (!v_2) {
      return;
    }
    showToast(t("rinex.toastAnalyzing", { name: v_2.name }), "info");
    try {
      const v_1 = await v_2.text();
      const v_2_1 = UniversalRinexInspector.analyzeRinexQuality(v_1);
      if (domEl) {
        domEl.style.display = "flex";
      }
      document.getElementById("statQualityEpochs").textContent = v_2_1.totalEpochs + " Epoch (" + v_2_1.startTime + " - " + v_2_1.endTime + ")";
      document.getElementById("statQualityInterval").textContent = v_2_1.detectedInterval + " sn";
      document.getElementById("statQualitySatCount").textContent = v_2_1.avgSats + " / " + v_2_1.maxSats + " Uydu";
      document.getElementById("statQualityConstellation").textContent = "G:" + v_2_1.avgGps + " | R:" + v_2_1.avgGlo + " | E:" + v_2_1.avgGal + " | C:" + v_2_1.avgBds;
      document.getElementById("statQualityScore").textContent = "%" + v_2_1.qualityScore + " " + (v_2_1.qualityScore >= 80 ? "Mükemmel" : "İyi");
      drawRinexQualityChart(v_2_1.timeline);
      logMessage("📊 [RINEX KALİTE] " + v_2.name + ": " + v_2_1.totalEpochs + " Epoch, Ort. " + v_2_1.avgSats + " Uydu, Kalite Skoru %" + v_2_1.qualityScore);
      showToast(t("rinex.toastAnalysisSuccess", { name: v_2.name, sats: v_2_1.avgSats }), "success");
    } catch (v_1) {
      logMessage("❌ [RINEX KALİTE HATA] " + (v_1.message || v_1));
      showToast(t("rinex.toastAnalysisError", { err: v_1.message }), "error");
    }
  });
  window.addEventListener("resize", () => {
    const domEl_1 = document.getElementById("canvasRinexQualityChart");
    if (domEl_1 && domEl_1.offsetParent !== null && window.lastRinexQualityTimeline) {
      drawRinexQualityChart(window.lastRinexQualityTimeline);
    }
  });
}
function drawRinexQualityChart(arg1) {
  const domEl = document.getElementById("canvasRinexQualityChart");
  if (!domEl || !arg1 || arg1.length === 0) {
    return;
  }
  window.lastRinexQualityTimeline = arg1;
  const v_2 = domEl.getContext("2d");
  const v_3 = domEl.width = domEl.parentElement.clientWidth || 900;
  const v_4 = domEl.height = 180;
  v_2.clearRect(0, 0, v_3, v_4);
  const num = 35;
  const num_1 = 15;
  const num_2 = 15;
  const num_3 = 25;
  const v_5 = v_3 - num - num_1;
  const v_6 = v_4 - num_2 - num_3;
  const v_7 = Math.max(35, Math.ceil((Math.max(...arg1.map(item => item.total)) + 5) / 5) * 5);
  v_2.strokeStyle = "rgba(255, 255, 255, 0.08)";
  v_2.lineWidth = 1;
  v_2.fillStyle = "#64748b";
  v_2.font = "10px monospace";
  v_2.textAlign = "right";
  const num_4 = 4;
  for (let num_5 = 0; num_5 <= num_4; num_5++) {
    const v_1 = Math.round(v_7 / num_4 * num_5);
    const v_2_1 = num_2 + v_6 - v_1 / v_7 * v_6;
    v_2.beginPath();
    v_2.moveTo(num, v_2_1);
    v_2.lineTo(v_3 - num_1, v_2_1);
    v_2.stroke();
    v_2.fillText("" + v_1, num - 5, v_2_1 + 3);
  }
  const v_8 = arg1_1 => num + arg1_1 / (arg1.length - 1) * v_5;
  const v_9 = arg1_1 => num_2 + v_6 - arg1_1 / v_7 * v_6;
  const v_10 = (arg1_1, arg2, arg3, arg4 = null) => {
    if (arg1.length < 2) {
      return;
    }
    v_2.beginPath();
    v_2.moveTo(v_8(0), v_9(arg1[0][arg1_1]));
    for (let num_5 = 1; num_5 < arg1.length; num_5++) {
      v_2.lineTo(v_8(num_5), v_9(arg1[num_5][arg1_1]));
    }
    if (arg4) {
      v_2.save();
      v_2.lineTo(v_8(arg1.length - 1), num_2 + v_6);
      v_2.lineTo(v_8(0), num_2 + v_6);
      v_2.closePath();
      v_2.fillStyle = arg4;
      v_2.fill();
      v_2.restore();
    }
    v_2.strokeStyle = arg2;
    v_2.lineWidth = arg3;
    v_2.shadowColor = arg2;
    v_2.shadowBlur = arg3 > 1.5 ? 6 : 0;
    v_2.stroke();
    v_2.shadowBlur = 0;
  };
  const v_11 = v_2.createLinearGradient(0, num_2, 0, num_2 + v_6);
  v_11.addColorStop(0, "rgba(245, 158, 11, 0.25)");
  v_11.addColorStop(1, "rgba(245, 158, 11, 0.0)");
  v_10("total", "#f59e0b", 2.5, v_11);
  v_10("gps", "#38bdf8", 1.8);
  v_10("glo", "#f87171", 1.4);
  v_10("gal", "#c084fc", 1.4);
  v_10("bds", "#34d399", 1.4);
  v_2.fillStyle = "#94a3b8";
  v_2.textAlign = "center";
  const v_12 = Math.min(6, arg1.length);
  for (let num_5 = 0; num_5 < v_12; num_5++) {
    const v_1 = Math.floor(num_5 / (v_12 - 1) * (arg1.length - 1));
    const v_2_1 = v_8(v_1);
    v_2.fillText(arg1[v_1].time, v_2_1, v_4 - 8);
  }
}

function initVersionAndFormatCascader() {
  const domEl = document.getElementById("selectTargetVersion");
  if (domEl) {
    domEl.addEventListener("change", () => {
      const v_1 = state.detectedTimeWindow?.date ? parseInt(state.detectedTimeWindow.date.split("-")[0]) : 2026;
      populateDynamicFormats(domEl.value, v_1);
    });
    populateDynamicFormats(domEl.value, 2026);
  }
}

function populateDynamicFormats(arg1, arg2 = 2026) {
  const domEl = document.getElementById("selectTargetFormat");
  if (!domEl) return;
  const v_3 = String(arg2 % 100).padStart(2, "0");
  domEl.innerHTML = "";
  if (arg1 === "RINEX_211" || arg1 === "RINEX_210") {
    const v_1 = arg1 === "RINEX_210" ? "2.10" : "2.11";
    domEl.innerHTML = `
      <option value="OBS_YYO" selected>${t("rinex.formatObsYyo", { yy: v_3, ver: v_1 })}</option>
      <option value="OBS_EXT">${t("rinex.formatObsExt", { ver: v_1 })}</option>
      <option value="NAV_YYN">${t("rinex.formatNavYyn", { yy: v_3 })}</option>
      <option value="NAV_EXT">${t("rinex.formatNavExt")}</option>
      <option value="NAV_YYG">${t("rinex.formatNavYyg", { yy: v_3 })}</option>
      <option value="HATANAKA_YYD">${t("rinex.formatHatanakaYyd", { yy: v_3 })}</option>
      <option value="ALL_ZIP">${t("rinex.formatAllZip")}</option>
    `;
  } else if (arg1.startsWith("RINEX_3") || arg1 === "RINEX_400") {
    const v_1 = arg1.replace("RINEX_", "").replace("30", "3.0").replace("400", "4.00");
    domEl.innerHTML = `
      <option value="OBS_YYO" selected>${t("rinex.formatObs83", { yy: v_3, ver: v_1 })}</option>
      <option value="OBS_EXT">${t("rinex.formatObsExt", { ver: v_1 })}</option>
      <option value="RNX_OBS">${t("rinex.formatRnxObs", { ver: v_1 })}</option>
      <option value="NAV_YYN">${t("rinex.formatNavYyn", { yy: v_3 })}</option>
      <option value="NAV_EXT">${t("rinex.formatNavExt")}</option>
      <option value="NAV_YYG">${t("rinex.formatNavYyg", { yy: v_3 })}</option>
      <option value="RNX_NAV_MIX">${t("rinex.formatRnxNavMix", { yy: v_3 })}</option>
      <option value="HATANAKA_YYD">${t("rinex.formatHatanakaYyd", { yy: v_3 })}</option>
      <option value="HATANAKA_CRX">${t("rinex.formatHatanakaCrx")}</option>
      <option value="ALL_ZIP">${t("rinex.formatAllZipMulti")}</option>
    `;
  }
}


/* <<<<<<<<<< [END MODULE: js/tabs/rinexTab.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/tabs/mapTab.js] >>>>>>>>>> */
/**
 * Harita Tools - Map & Turkey Pafta Index Controller
 */
function initMap() {
  if (state.map) {
    state.map.invalidateSize();
    return;
  }
  const { map } = createStudioMap("mapContainer", {
    center: [39, 35.2],
    zoom: 6,
    defaultType: "hybrid"
  });
  state.map = map;
  state.mapLayerGroup = L.layerGroup().addTo(state.map);
  state.paftaLayerGroup = L.layerGroup().addTo(state.map);
  state.domLayerGroup = L.layerGroup().addTo(state.map);
  state.importedKmlLayerGroup = L.layerGroup().addTo(state.map);
  state.intersectingPaftaLayerGroup = L.layerGroup().addTo(state.map);
  if (state.posSolutions && state.posSolutions.length > 0) {
    plotTrajectoryOnMap(state.posSolutions);
  }
  document.getElementById("btnExportKml")?.addEventListener("click", exportKml);
  document.getElementById("btnExportGeoJson")?.addEventListener("click", exportGeoJson);
  initKmlKmzImporter();
  const btnEl = document.getElementById("btnPafta100k");
  const btnEl_1 = document.getElementById("btnPafta50k");
  const btnEl_2 = document.getElementById("btnPafta25k");
  const btnEl_5k = document.getElementById("btnPafta5k");
  const btnEl_2k = document.getElementById("btnPafta2k");
  const btnEl_1k = document.getElementById("btnPafta1k");
  const btnEl_3 = document.getElementById("btnPaftaOff");
  const btnEl_4 = document.getElementById("btnToggleDom");
  const inputEl = document.getElementById("inputPaftaSearch");
  const btnEl_5 = document.getElementById("btnPaftaSearch");
  const domEl = document.getElementById("cardActivePafta");
  const btnEl_6 = document.getElementById("btnClosePaftaCard");
  function updatePaftaScaleButtonUi(scale) {
    btnEl?.classList.remove("btn-pafta-active");
    btnEl_1?.classList.remove("btn-pafta-active-50k");
    btnEl_2?.classList.remove("btn-pafta-active-25k");
    btnEl_5k?.classList.remove("btn-pafta-active-5k");
    btnEl_2k?.classList.remove("btn-pafta-active-2k");
    btnEl_1k?.classList.remove("btn-pafta-active-1k");
    btnEl_3?.classList.remove("btn-secondary");
    if (scale === "100k") {
      btnEl?.classList.add("btn-pafta-active");
    } else if (scale === "50k") {
      btnEl_1?.classList.add("btn-pafta-active-50k");
    } else if (scale === "25k") {
      btnEl_2?.classList.add("btn-pafta-active-25k");
    } else if (scale === "5k") {
      btnEl_5k?.classList.add("btn-pafta-active-5k");
    } else if (scale === "2k") {
      btnEl_2k?.classList.add("btn-pafta-active-2k");
    } else if (scale === "1k") {
      btnEl_1k?.classList.add("btn-pafta-active-1k");
    } else if (scale === "off") {
      btnEl_3?.classList.add("btn-secondary");
    }
  }

  // Yukarıdaki butonlar sadece arka plandaki tüm Türkiye grid çizgilerini açıp kapatır
  function toggleBackgroundPaftaGrid(scale) {
    state.activePaftaScale = scale;
    updatePaftaScaleButtonUi(scale);

    if (scale === "off") {
      state.paftaLayerGroup.clearLayers();
      if (state.highlightedPaftaLayer) {
        state.map.removeLayer(state.highlightedPaftaLayer);
        state.highlightedPaftaLayer = null;
      }
      if (domEl) {
        domEl.style.display = "none";
      }
      logMessage("🗺️ Tüm pafta grid çizgileri kapatıldı.");
      return;
    }
    renderPaftaGrid();
    logMessage("🗺️ Tüm Türkiye 1/" + scale.replace("k", " 000") + " Pafta Grid Çizgileri gösteriliyor.");
    showToast(t("map.toastGridOpened", { scale: scale.replace("k", " 000") }), "success");
  }

  btnEl?.addEventListener("click", () => toggleBackgroundPaftaGrid("100k"));
  btnEl_1?.addEventListener("click", () => toggleBackgroundPaftaGrid("50k"));
  btnEl_2?.addEventListener("click", () => toggleBackgroundPaftaGrid("25k"));
  btnEl_5k?.addEventListener("click", () => toggleBackgroundPaftaGrid("5k"));
  btnEl_2k?.addEventListener("click", () => toggleBackgroundPaftaGrid("2k"));
  btnEl_1k?.addEventListener("click", () => toggleBackgroundPaftaGrid("1k"));
  btnEl_3?.addEventListener("click", () => toggleBackgroundPaftaGrid("off"));

  // İlk açılışta varsayılan tıklama pafta ölçeği: Her zaman 1/100 000
  state.currentIntersectScale = "100k";
  state.activePaftaScale = "off"; // Başlangıçta arka plan tüm grid kapalı, sadece tıklanan/alan paftası açılır
  updatePaftaScaleButtonUi("off");

  function v_5() {
    state.isDomLayerActive = !state.isDomLayerActive;
    if (state.isDomLayerActive) {
      btnEl_4?.classList.add("btn-dom-active");
      renderDomGrid();
      logMessage("🌐 TUREF TM 3° Dilim Sınırları (DOM 27°-45°) haritada aktif.");
      showToast(t("map.toastDomLoaded"), "success");
    } else {
      btnEl_4?.classList.remove("btn-dom-active");
      state.domLayerGroup.clearLayers();
      logMessage("🌐 DOM 3° Dilim sınırları gizlendi.");
      showToast(t("map.toastDomClosed"), "info");
    }
  }
  btnEl_4?.addEventListener("click", v_5);

  state.map.on("moveend", () => {
    if (state.activePaftaScale !== "off") {
      renderPaftaGrid();
    }
  });

  // Haritaya tıklandığında (KML yokken varsayılan 100k, KML modalında seçilen ne ise o ölçek açılır)
  state.map.on("click", arg1 => {
    const {
      lat: clickLat,
      lng: clickLng
    } = arg1.latlng;
    if (clickLat < 34 || clickLat > 43 || clickLng < 25 || clickLng > 45.5) {
      return;
    }
    const allSheets = state.paftaEngine.getAllSheetsForPoint(clickLat, clickLng);

    // Sağdaki modalda veya üst çubukta seçili olan ölçek (KML yokken varsayılan: 100k veya aktif grid ölçeği)
    let activeClickScale = state.currentIntersectScale || "100k";
    if (state.activePaftaScale && state.activePaftaScale !== "off") {
      activeClickScale = state.activePaftaScale;
    }

    let targetSheet = allSheets.s100k;
    if (activeClickScale === "100k") {
      targetSheet = allSheets.s100k;
    } else if (activeClickScale === "50k") {
      targetSheet = allSheets.s50k;
    } else if (activeClickScale === "25k") {
      targetSheet = allSheets.s25k;
    } else if (activeClickScale === "5k") {
      targetSheet = allSheets.s5k;
    } else if (activeClickScale === "2k") {
      targetSheet = allSheets.s2k;
    } else if (activeClickScale === "1k") {
      targetSheet = allSheets.s1k;
    }

    highlightSheet(targetSheet);
    showFloatingPaftaCard(targetSheet, allSheets);
  });
  function v_6() {
    const v_1_1 = inputEl.value.trim();
    if (!v_1_1) {
      showToast(t("map.toastSearchNeedPafta"), "warning");
      return;
    }
    const v_2_1 = state.paftaEngine.resolveSheetByName(v_1_1);
    if (!v_2_1) {
      showToast(t("map.toastPaftaNotFound", { name: v_1_1 }), "error");
      return;
    }
    if (v_2_1.scale === "1/100 000" && state.activePaftaScale !== "100k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("100k");
    } else if (v_2_1.scale === "1/50 000" && state.activePaftaScale !== "50k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("50k");
    } else if (v_2_1.scale === "1/25 000" && state.activePaftaScale !== "25k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("25k");
    } else if (v_2_1.scale === "1/5 000" && state.activePaftaScale !== "5k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("5k");
    } else if (v_2_1.scale === "1/2 000" && state.activePaftaScale !== "2k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("2k");
    } else if (v_2_1.scale === "1/1 000" && state.activePaftaScale !== "1k" && state.activePaftaScale !== "off") {
      toggleBackgroundPaftaGrid("1k");
    }
    const items = [[v_2_1.minLat, v_2_1.minLon], [v_2_1.maxLat, v_2_1.maxLon]];
    state.map.flyToBounds(items, {
      maxZoom: 14,
      padding: [60, 60]
    });
    highlightSheet(v_2_1);
    showFloatingPaftaCard(v_2_1);
    logMessage("🎯 [PAFTA BULUNDU] " + v_2_1.name + " (" + v_2_1.scale + ") | Merkez: " + v_2_1.centerLat.toFixed(4) + "N, " + v_2_1.centerLon.toFixed(4) + "E");
    showToast(t("map.toastPaftaFocused", { name: v_2_1.name, scale: v_2_1.scale }), "success");
  }
  btnEl_5?.addEventListener("click", v_6);
  inputEl?.addEventListener("keydown", arg1 => {
    if (arg1.key === "Enter") {
      v_6();
    }
  });
  btnEl_6?.addEventListener("click", () => {
    if (domEl) {
      domEl.style.display = "none";
    }
    if (state.highlightedPaftaLayer) {
      state.map.removeLayer(state.highlightedPaftaLayer);
      state.highlightedPaftaLayer = null;
    }
  });
  document.getElementById("btnDownloadPaftaKml")?.addEventListener("click", () => {
    if (!state.selectedPaftaSheet) {
      return;
    }
    const v_1_1 = state.paftaEngine.exportSheetKml(state.selectedPaftaSheet);
    downloadTextFile(state.selectedPaftaSheet.name + "_pafta.kml", v_1_1);
    showToast(t("map.toastDownloaded", { name: state.selectedPaftaSheet.name + "_pafta.kml" }), "success");
  });
  document.getElementById("btnDownloadPaftaDxf")?.addEventListener("click", () => {
    if (!state.selectedPaftaSheet) {
      return;
    }
    const v_1_1 = state.paftaEngine.exportSheetDxf(state.selectedPaftaSheet, state.gnssEngine.geodesy);
    downloadTextFile(state.selectedPaftaSheet.name + "_pafta.dxf", v_1_1);
    showToast(t("map.toastDownloaded", { name: state.selectedPaftaSheet.name + "_pafta.dxf" }), "success");
  });
  document.getElementById("btnDownloadPaftaJson")?.addEventListener("click", () => {
    if (!state.selectedPaftaSheet) {
      return;
    }
    const v_1_1 = state.selectedPaftaSheet;
    const v_2_1 = state.paftaEngine.getHgmDatumRecord(v_1_1.name, v_1_1.centerLat, v_1_1.centerLon);
    const obj = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {
          name: v_1_1.name,
          scale: v_1_1.scale,
          regionalName: v_1_1.regionalName || "",
          hgm_yukseklik_duz_m: v_2_1.yukseklikDuz,
          hgm_yukari_duz_m: v_2_1.yukariDuz,
          hgm_saga_duz_m: v_2_1.sagaDuz,
          hgm_enlem_duz_arcsec: v_2_1.enlemDuz,
          hgm_boylam_duz_arcsec: v_2_1.boylamDuz
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[v_1_1.minLon, v_1_1.minLat], [v_1_1.maxLon, v_1_1.minLat], [v_1_1.maxLon, v_1_1.maxLat], [v_1_1.minLon, v_1_1.maxLat], [v_1_1.minLon, v_1_1.minLat]]]
        }
      }]
    };
    downloadTextFile(v_1_1.name + "_pafta.geojson", JSON.stringify(obj, null, 2));
    showToast(t("map.toastDownloaded", { name: v_1_1.name + "_pafta.geojson" }), "success");
  });
  window.downloadPaftaDirect = (arg1, arg2) => {
    const v_3_1 = state.paftaEngine.resolveSheetByName(arg1);
    if (!v_3_1) {
      return;
    }
    if (arg2 === "kml") {
      downloadTextFile(v_3_1.name + "_pafta.kml", state.paftaEngine.exportSheetKml(v_3_1));
    } else if (arg2 === "dxf") {
      downloadTextFile(v_3_1.name + "_pafta.dxf", state.paftaEngine.exportSheetDxf(v_3_1, state.gnssEngine.geodesy));
    } else if (arg2 === "json") {
      const v_1_1 = state.paftaEngine.getHgmDatumRecord(v_3_1.name, v_3_1.centerLat, v_3_1.centerLon);
      const obj = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: {
            name: v_3_1.name,
            scale: v_3_1.scale,
            regionalName: v_3_1.regionalName || "",
            hgm_yukseklik_duz_m: v_1_1.yukseklikDuz,
            hgm_yukari_duz_m: v_1_1.yukariDuz,
            hgm_saga_duz_m: v_1_1.sagaDuz,
            hgm_enlem_duz_arcsec: v_1_1.enlemDuz,
            hgm_boylam_duz_arcsec: v_1_1.boylamDuz
          },
          geometry: {
            type: "Polygon",
            coordinates: [[[v_3_1.minLon, v_3_1.minLat], [v_3_1.maxLon, v_3_1.minLat], [v_3_1.maxLon, v_3_1.maxLat], [v_3_1.minLon, v_3_1.maxLat], [v_3_1.minLon, v_3_1.minLat]]]
          }
        }]
      };
      downloadTextFile(v_3_1.name + "_pafta.geojson", JSON.stringify(obj, null, 2));
    }
    showToast(t("map.toastDownloaded", { name: v_3_1.name + "_pafta." + arg2 }), "success");
  };
}
function initKmlKmzImporter() {
  const inputEl = document.getElementById("inputImportKml");
  const mapEl = document.getElementById("mapContainer");
  const domEl = document.getElementById("cardIntersectingPaftas");
  const btnEl = document.getElementById("btnCloseIntersectingCard");
  const elementsList = document.querySelectorAll(".btn-intersect-scale");
  state.currentIntersectScale = "25k";
  state.importedProjectData = null;
  inputEl?.addEventListener("change", async arg1 => {
    const v_2 = arg1.target.files?.[0];
    if (v_2) {
      await processImportedKmlKmz(v_2);
      inputEl.value = "";
    }
  });
  mapEl?.addEventListener("dragover", arg1 => {
    arg1.preventDefault();
    mapEl.style.outline = "2px dashed var(--cyan-400)";
  });
  mapEl?.addEventListener("dragleave", arg1 => {
    arg1.preventDefault();
    mapEl.style.outline = "none";
  });
  mapEl?.addEventListener("drop", async arg1 => {
    arg1.preventDefault();
    mapEl.style.outline = "none";
    const v_2 = arg1.dataTransfer?.files?.[0];
    if (v_2) {
      const v_1 = v_2.name.split(".").pop().toLowerCase();
      if (["kml", "kmz", "geojson", "json"].includes(v_1)) {
        await processImportedKmlKmz(v_2);
      } else {
        showToast(t("map.toastInvalidFormat"), "warning");
      }
    }
  });
  btnEl?.addEventListener("click", () => {
    if (domEl) {
      domEl.style.display = "none";
    }
    if (state.intersectingPaftaLayerGroup) {
      state.intersectingPaftaLayerGroup.clearLayers();
    }
    state.currentIntersectScale = "100k"; // Modal kapatılınca tıklama ölçeği 100k'ya döner
  });
  elementsList.forEach(item => {
    item.addEventListener("click", () => {
      elementsList.forEach(item_1 => {
        item_1.classList.remove("btn-primary");
        item_1.classList.add("btn-secondary");
      });
      item.classList.remove("btn-secondary");
      item.classList.add("btn-primary");
      const chosenScale = item.getAttribute("data-scale") || "25k";
      state.currentIntersectScale = chosenScale; // Tıklama ve analiz ölçeğini ayarla

      if (state.importedProjectData) {
        renderIntersectingPaftasAnalysis(state.importedProjectData);
      }
    });
  });
}
async function processImportedKmlKmz(arg1) {
  showToast(t("map.toastParsing", { name: arg1.name }), "info");
  logMessage("📂 [IMPORT] '" + arg1.name + "' dosyası içe aktarılıyor...");
  try {
    const v_1 = await parseKmlOrKmzFile(arg1);
    if (!v_1 || !v_1.features || v_1.features.length === 0) {
      showToast(t("map.toastNoGeometry"), "warning");
      return;
    }
    state.importedKmlLayerGroup.clearLayers();
    const v_2 = L.geoJSON(v_1, {
      style: arg1_1 => ({
        color: "#06b6d4",
        weight: 3,
        opacity: 0.9,
        fillColor: "#06b6d4",
        fillOpacity: 0.25,
        dashArray: null
      }),
      pointToLayer: (arg1_1, arg2) => {
        return L.circleMarker(arg2, {
          radius: 6,
          fillColor: "#f59e0b",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });
      },
      onEachFeature: (arg1_1, arg2) => {
        const v_3_1 = arg1_1.properties?.name || "Proje Unsuru";
        const v_4 = arg1_1.properties?.description || "";
        arg2.bindPopup("<b>" + v_3_1 + "</b>" + (v_4 ? "<br><small>" + v_4 + "</small>" : ""));
      }
    }).addTo(state.importedKmlLayerGroup);
    const v_3 = v_2.getBounds();
    if (!v_3.isValid()) {
      showToast(t("map.toastInvalidBounds"), "error");
      return;
    }
    state.map.fitBounds(v_3, {
      padding: [50, 50]
    });
    state.importedProjectData = {
      fileName: arg1.name,
      bounds: v_3,
      geojson: v_1,
      featureCount: v_1.features.length
    };

    // KML yüklendiğinde analiz ölçeğini kesinlikle 1/25 000 olarak başlat ve UI'ı güncelle
    state.currentIntersectScale = "25k";
    const scaleBtns = document.querySelectorAll(".btn-intersect-scale");
    scaleBtns.forEach(btn => {
      if (btn.getAttribute("data-scale") === "25k") {
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
      } else {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
      }
    });

    renderIntersectingPaftasAnalysis(state.importedProjectData);
    logMessage("✨ [BAŞARILI] '" + arg1.name + "' haritaya yüklendi (" + v_1.features.length + " geometri, 1/25 000 paftaları hesaplandı).");
    showToast(t("map.toastIntersectingPaftaCalculated", { name: arg1.name }), "success");
  } catch (v_1) {
    logMessage("❌ [HATA] KML/KMZ işleme hatası: " + (v_1.message || v_1));
    showToast(t("map.toastProcessError", { err: v_1.message || "Geçersiz format" }), "error");
  }
}
async function parseKmlOrKmzFile(arg1) {
  const v_2 = arg1.name.split(".").pop().toLowerCase();
  if (v_2 === "kmz") {
    if (typeof JSZip === "undefined") {
      throw new Error("KMZ açıcı JSZip modülü bulunamadı.");
    }
    const v_1 = await JSZip.loadAsync(arg1);
    const v_2_1 = Object.keys(v_1.files).find(item => item.toLowerCase().endsWith(".kml"));
    if (!v_2_1) {
      throw new Error("KMZ arşivi içinde geçerli bir .kml dosyası bulunamadı.");
    }
    const v_3 = await v_1.files[v_2_1].async("string");
    return parseKmlTextToGeoJson(v_3);
  } else if (v_2 === "geojson" || v_2 === "json") {
    const v_1 = await arg1.text();
    return JSON.parse(v_1);
  } else {
    const v_1 = await arg1.text();
    return parseKmlTextToGeoJson(v_1);
  }
}
function parseKmlTextToGeoJson(arg1) {
  const v_2 = new DOMParser();
  const v_3 = v_2.parseFromString(arg1, "text/xml");
  const v_4 = v_3.getElementsByTagName("Placemark");
  const items = [];
  for (let num = 0; num < v_4.length; num++) {
    const v_1 = v_4[num];
    const v_2_1 = v_1.getElementsByTagName("name")[0]?.textContent?.trim() || "Geometri " + (num + 1);
    const v_3_1 = v_1.getElementsByTagName("description")[0]?.textContent?.trim() || "";
    const v_4_1 = v_1.getElementsByTagName("Polygon");
    for (let v_1_1 of v_4_1) {
      const v_1_2 = v_1_1.getElementsByTagName("coordinates");
      for (let v_1_3 of v_1_2) {
        const v_1_4 = parseCoordString(v_1_3.textContent);
        if (v_1_4.length >= 3) {
          items.push({
            type: "Feature",
            properties: {
              name: v_2_1,
              description: v_3_1
            },
            geometry: {
              type: "Polygon",
              coordinates: [v_1_4]
            }
          });
        }
      }
    }
    const v_5 = v_1.getElementsByTagName("LineString");
    for (let v_1_1 of v_5) {
      const v_1_2 = v_1_1.getElementsByTagName("coordinates")[0];
      if (v_1_2) {
        const v_1_3 = parseCoordString(v_1_2.textContent);
        if (v_1_3.length >= 2) {
          items.push({
            type: "Feature",
            properties: {
              name: v_2_1,
              description: v_3_1
            },
            geometry: {
              type: "LineString",
              coordinates: v_1_3
            }
          });
        }
      }
    }
    const v_6 = v_1.getElementsByTagName("Point");
    for (let v_1_1 of v_6) {
      const v_1_2 = v_1_1.getElementsByTagName("coordinates")[0];
      if (v_1_2) {
        const v_1_3 = v_1_2.textContent.trim().split(",").map(Number);
        if (!isNaN(v_1_3[0]) && !isNaN(v_1_3[1])) {
          items.push({
            type: "Feature",
            properties: {
              name: v_2_1,
              description: v_3_1
            },
            geometry: {
              type: "Point",
              coordinates: [v_1_3[0], v_1_3[1]]
            }
          });
        }
      }
    }
  }
  return {
    type: "FeatureCollection",
    features: items
  };
}
function parseCoordString(arg1) {
  if (!arg1) {
    return [];
  }
  const parts = arg1.trim().split(/\s+/);
  const items = [];
  for (let v_1 of parts) {
    const v_1_1 = v_1.split(",").map(Number);
    if (!isNaN(v_1_1[0]) && !isNaN(v_1_1[1])) {
      items.push([v_1_1[0], v_1_1[1]]);
    }
  }
  return items;
}
function renderIntersectingPaftasAnalysis(arg1) {
  const domEl = document.getElementById("cardIntersectingPaftas");
  const domEl_1 = document.getElementById("badgeIntersectingCount");
  const domEl_2 = document.getElementById("txtImportedFileName");
  const domEl_3 = document.getElementById("txtImportedFeatureCount");
  const domEl_4 = document.getElementById("listIntersectingPaftas");
  if (!domEl || !domEl_4) {
    return;
  }
  const v_2 = state.currentIntersectScale || "25k";
  const v_3 = v_2 === "25k" ? "1/25 000" : v_2 === "50k" ? "1/50 000" : "1/100 000";
  const v_4 = state.paftaEngine.getIntersectingSheets(arg1.bounds, v_2);
  domEl_2.textContent = "📁 " + arg1.fileName;
  domEl_3.textContent = arg1.featureCount + " Geometri";
  domEl_1.textContent = v_4.length + " Pafta";
  highlightIntersectingPaftas(v_4);
  domEl_4.innerHTML = "";
  if (v_4.length === 0) {
    domEl_4.innerHTML = "<div style=\"font-size: 11.5px; color: var(--text-dim); text-align: center; padding: 10px;\">" + t("map.toastNoIntersectingPafta") + "</div>";
  } else {
    v_4.forEach(item => {
      const v_1 = state.paftaEngine.getHgmDatumRecord(item.name, item.centerLat, item.centerLon);
      const v_2_1 = state.gnssEngine.geodesy.getAutoCentralMeridian3Deg(item.centerLon);
      const v_3_1 = item.regionalName ? " (" + item.regionalName + ")" : "";
      const divEl = document.createElement("div");
      divEl.className = "intersecting-sheet-card";
      divEl.innerHTML = "\n                <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n                    <strong style=\"color: var(--cyan-400); font-family: var(--font-mono); font-size: 12.5px;\">" + item.name + " <span style=\"color: #f59e0b; font-weight: 700; font-size: 11px;\">" + v_3_1 + "</span></strong>\n                    <span style=\"font-size: 10px; color: var(--emerald-400); font-weight: 700; background: rgba(16, 185, 129, 0.15); padding: 1px 6px; border-radius: 4px;\">DOM " + v_2_1 + "°</span>\n                </div>\n                <div style=\"font-size: 10.5px; color: var(--text-dim); display: flex; justify-content: space-between;\">\n                    <span>" + t("map.lblHeightCorr") + " <strong style=\"color: #f59e0b;\">" + v_1.yukseklikDuz.toFixed(2) + " m</strong></span>\n                    <span>" + t("map.lblNorthCorr") + " <strong class=\"text-main\">" + v_1.yukariDuz.toFixed(1) + " m</strong></span>\n                </div>\n                <div style=\"display: flex; gap: 4px; margin-top: 2px;\">\n                    <button class=\"btn btn-secondary btn-sm\" style=\"flex: 1; padding: 2px 4px; font-size: 9.5px;\" onclick=\"event.stopPropagation(); window.downloadPaftaDirect('" + item.name + "', 'kml')\"><i class=\"fa-solid fa-earth-americas\"></i> KML</button>\n                    <button class=\"btn btn-secondary btn-sm\" style=\"flex: 1; padding: 2px 4px; font-size: 9.5px;\" onclick=\"event.stopPropagation(); window.downloadPaftaDirect('" + item.name + "', 'dxf')\"><i class=\"fa-solid fa-vector-square\"></i> DXF</button>\n                    <button class=\"btn btn-secondary btn-sm\" style=\"flex: 1; padding: 2px 4px; font-size: 9.5px;\" onclick=\"event.stopPropagation(); window.downloadPaftaDirect('" + item.name + "', 'json')\"><i class=\"fa-solid fa-code\"></i> JSON</button>\n                </div>\n            ";
      divEl.addEventListener("click", () => {
        const items = [[item.minLat, item.minLon], [item.maxLat, item.maxLon]];
        state.map.flyToBounds(items, {
          maxZoom: 14,
          padding: [60, 60]
        });
        highlightSheet(item);
        showFloatingPaftaCard(item);
      });
      domEl_4.appendChild(divEl);
    });
  }
  state.currentIntersectingSheets = v_4;
  const btnEl = document.getElementById("btnDownloadAllIntersectingKml");
  if (btnEl) {
    btnEl.onclick = () => {
      if (!state.currentIntersectingSheets || state.currentIntersectingSheets.length === 0) {
        showToast(t("map.toastNoIntersectingPafta"), "warning");
        return;
      }
      const v_1 = state.paftaEngine.exportMultipleSheetsKml(state.currentIntersectingSheets, "Temas Eden Paftalar (" + (state.currentIntersectScale || "25k") + ")");
      const v_2_1 = "temas_eden_paftalar_" + (state.currentIntersectScale || "25k") + ".kml";
      downloadTextFile(v_2_1, v_1);
      showToast(t("map.toastPaftaBoundariesDownloaded", { count: state.currentIntersectingSheets.length, format: v_2_1 }), "success");
    };
  }
  domEl.style.display = "block";
}
function highlightIntersectingPaftas(arg1) {
  if (!state.intersectingPaftaLayerGroup) {
    return;
  }
  state.intersectingPaftaLayerGroup.clearLayers();
  arg1.forEach(item => {
    const items = [[item.minLat, item.minLon], [item.maxLat, item.maxLon]];
    L.rectangle(items, {
      color: "#f59e0b",
      weight: 2.2,
      dashArray: "5, 5",
      fillColor: "#f59e0b",
      fillOpacity: 0.12
    }).addTo(state.intersectingPaftaLayerGroup);
  });
}
function renderPaftaGrid() {
  if (!state.map || !state.paftaLayerGroup || state.activePaftaScale === "off") {
    return;
  }
  state.paftaLayerGroup.clearLayers();
  const bounds = state.map.getBounds();
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();
  const zoom = state.map.getZoom();

  // Aktif ölçeğe ve zoom seviyesine göre hiyerarşik üst pafta / detay pafta eşleştirmesi
  let effectiveScale = state.activePaftaScale;
  let isOverview = false;
  let themeColor = "#06b6d4";
  let labelClass = "pafta-label-100k";
  let labelThreshold = 6;

  if (state.activePaftaScale === "100k") {
    themeColor = "#06b6d4";
    labelClass = "pafta-label-100k";
    effectiveScale = "100k";
    isOverview = false;
    labelThreshold = 6;
  } else if (state.activePaftaScale === "50k") {
    themeColor = "#a855f7";
    labelClass = "pafta-label-50k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else {
      effectiveScale = "50k";
      isOverview = false;
      labelThreshold = 8;
    }
  } else if (state.activePaftaScale === "25k") {
    themeColor = "#10b981";
    labelClass = "pafta-label-25k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else if (zoom < 10) {
      effectiveScale = "50k";
      isOverview = true;
      labelThreshold = 8;
    } else {
      effectiveScale = "25k";
      isOverview = false;
      labelThreshold = 10;
    }
  } else if (state.activePaftaScale === "5k") {
    themeColor = "#f43f5e";
    labelClass = "pafta-label-5k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else if (zoom < 10) {
      effectiveScale = "50k";
      isOverview = true;
      labelThreshold = 8;
    } else if (zoom < 12) {
      effectiveScale = "25k";
      isOverview = true;
      labelThreshold = 10;
    } else {
      effectiveScale = "5k";
      isOverview = false;
      labelThreshold = 12;
    }
  } else if (state.activePaftaScale === "2k") {
    themeColor = "#8b5cf6";
    labelClass = "pafta-label-2k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else if (zoom < 10) {
      effectiveScale = "50k";
      isOverview = true;
      labelThreshold = 8;
    } else if (zoom < 12) {
      effectiveScale = "25k";
      isOverview = true;
      labelThreshold = 10;
    } else if (zoom < 14) {
      effectiveScale = "5k";
      isOverview = true;
      labelThreshold = 12;
    } else {
      effectiveScale = "2k";
      isOverview = false;
      labelThreshold = 14;
    }
  } else if (state.activePaftaScale === "1k") {
    themeColor = "#0ea5e9";
    labelClass = "pafta-label-1k";
    if (zoom < 8) {
      effectiveScale = "100k";
      isOverview = true;
      labelThreshold = 6;
    } else if (zoom < 10) {
      effectiveScale = "50k";
      isOverview = true;
      labelThreshold = 8;
    } else if (zoom < 12) {
      effectiveScale = "25k";
      isOverview = true;
      labelThreshold = 10;
    } else if (zoom < 14) {
      effectiveScale = "5k";
      isOverview = true;
      labelThreshold = 12;
    } else if (zoom < 15) {
      effectiveScale = "2k";
      isOverview = true;
      labelThreshold = 14;
    } else {
      effectiveScale = "1k";
      isOverview = false;
      labelThreshold = 15;
    }
  }

  const sheets = state.paftaEngine.getVisibleSheets(south, west, north, east, effectiveScale);
  const strokeWidth = isOverview ? 1.2 : 1.5;
  const fillOpacity = isOverview ? 0.02 : 0.06;
  const dashArray = isOverview ? "4, 4" : null;

  sheets.forEach(item => {
    const rect = L.rectangle([[item.minLat, item.minLon], [item.maxLat, item.maxLon]], {
      color: themeColor,
      weight: strokeWidth,
      dashArray: dashArray,
      fillColor: themeColor,
      fillOpacity: fillOpacity
    }).addTo(state.paftaLayerGroup);

    rect.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      if (isOverview) {
        state.map.flyToBounds([[item.minLat, item.minLon], [item.maxLat, item.maxLon]], {
          padding: [40, 40],
          maxZoom: Math.min(zoom + 2, 18)
        });
      }
      highlightSheet(item);
      showFloatingPaftaCard(item);
    });

    rect.on("mouseover", function () {
      this.setStyle({
        weight: strokeWidth + 1.2,
        fillOpacity: fillOpacity + 0.14
      });
    });

    rect.on("mouseout", function () {
      this.setStyle({
        weight: strokeWidth,
        fillOpacity: fillOpacity
      });
    });

    if (zoom >= labelThreshold) {
      const labelIcon = L.divIcon({
        className: labelClass,
        html: item.name,
        iconSize: null
      });
      L.marker([item.centerLat, item.centerLon], {
        icon: labelIcon,
        interactive: false
      }).addTo(state.paftaLayerGroup);
    }
  });
}
function renderDomGrid() {
  if (!state.map || !state.domLayerGroup || !state.isDomLayerActive) {
    return;
  }
  state.domLayerGroup.clearLayers();
  const v_1 = state.paftaEngine.getTurkishDomZones();
  const num = 34.2;
  const num_1 = 42.6;
  v_1.forEach((item, idx) => {
    const v_1_1 = L.rectangle([[num, item.minLon], [num_1, item.maxLon]], {
      color: "#f59e0b",
      weight: 2,
      dashArray: "6, 6",
      fillColor: idx % 2 === 0 ? "#f59e0b" : "#fbbf24",
      fillOpacity: 0.04
    }).addTo(state.domLayerGroup);
    const v_2 = L.divIcon({
      className: "",
      html: "<div class=\"dom-label-badge\" title=\"" + item.name + " (" + item.minLon + "° - " + item.maxLon + "° E)\">📍 DOM " + item.dom + "°<br><span style=\"font-size: 8.5px; font-weight: 500; opacity: 0.85;\">Dilim " + item.zone + "</span></div>",
      iconSize: null
    });
    const v_3 = L.divIcon({
      className: "",
      html: "<div class=\"dom-label-badge\" title=\"" + item.name + " (" + item.minLon + "° - " + item.maxLon + "° E)\">📍 DOM " + item.dom + "°<br><span style=\"font-size: 8.5px; font-weight: 500; opacity: 0.85;\">Dilim " + item.zone + "</span></div>",
      iconSize: null
    });
    const v_4 = L.marker([41.9, item.dom], {
      icon: v_2
    }).addTo(state.domLayerGroup);
    const v_5 = L.marker([35.8, item.dom], {
      icon: v_3
    }).addTo(state.domLayerGroup);
    const v_6 = "\n            <div style=\"font-family: var(--font-body); font-size: 12px; line-height: 1.5; color: #000; min-width: 250px;\">\n                <div style=\"font-size: 13.5px; font-weight: 800; color: #d97706; border-bottom: 2px solid #f59e0b; padding-bottom: 3px; margin-bottom: 6px;\">\n                    🌐 TUREF TM 3° - DOM " + item.dom + "° (Dilim " + item.zone + ")\n                </div>\n                <div style=\"margin-bottom: 4px;\"><strong>Dilim Orta Meridyeni:</strong> " + item.dom + "° 00' 00\" E</div>\n                <div style=\"margin-bottom: 4px;\"><strong>Boylam Kapsamı (3°):</strong> " + item.minLon + "° - " + item.maxLon + "° E (" + (item.dom - 1.5) + "° - " + (item.dom + 1.5) + "°)</div>\n                <div style=\"margin-bottom: 4px;\"><strong>TUREF / ITRF-96:</strong> <span style=\"font-family: monospace; font-weight: bold; color: #0284c7;\">" + item.epsg + "</span></div>\n                <div style=\"margin-bottom: 4px;\"><strong>ED-50:</strong> <span style=\"font-family: monospace; font-weight: bold; color: #7c3aed;\">" + item.epsgEd50 + "</span></div>\n                <div style=\"margin-top: 6px; font-size: 11px; color: #475569; background: #fef3c7; padding: 5px 8px; border-radius: 4px; border-left: 3px solid #f59e0b;\">\n                    <strong>Kapsadığı Bölgeler:</strong> " + item.desc + "\n                </div>\n            </div>\n        ";
    v_1_1.bindPopup(v_6);
    v_4.bindPopup(v_6);
    v_5.bindPopup(v_6);
  });
}
function highlightSheet(arg1) {
  if (!state.map) {
    return;
  }
  if (state.highlightedPaftaLayer) {
    state.map.removeLayer(state.highlightedPaftaLayer);
  }
  state.selectedPaftaSheet = arg1;
  state.highlightedPaftaLayer = L.rectangle([[arg1.minLat, arg1.minLon], [arg1.maxLat, arg1.maxLon]], {
    color: "#f59e0b",
    weight: 3.5,
    fillColor: "#f59e0b",
    fillOpacity: 0.18,
    dashArray: "2, 6"
  }).addTo(state.map);
}
function showFloatingPaftaCard(arg1, arg2) {
  state.selectedPaftaSheet = arg1;
  const domEl = document.getElementById("cardActivePafta");
  if (!domEl) {
    return;
  }
  const v_3 = state.gnssEngine.geodesy.getAutoCentralMeridian3Deg(arg1.centerLon);
  const v_4 = v_3 / 3 + 0;
  const v_5 = arg1.regionalName || "";
  document.getElementById("txtPaftaCardTitle").textContent = arg1.name;
  document.getElementById("txtPaftaCardScale").textContent = arg1.scale;
  document.getElementById("txtPaftaCardLat").textContent = arg1.centerLat.toFixed(5) + "° N";
  document.getElementById("txtPaftaCardLon").textContent = arg1.centerLon.toFixed(5) + "° E";
  document.getElementById("txtPaftaCardDom").textContent = t("map.lblDomZone", { dom: v_3, zone: v_4 });


  let allSheetsObj = arg2;
  if (!allSheetsObj) {
    allSheetsObj = state.paftaEngine.getAllSheetsForPoint(arg1.centerLat, arg1.centerLon);
  }

  const el100k = document.getElementById("txtPaftaCard100k");
  const el50k = document.getElementById("txtPaftaCard50k");
  const el25k = document.getElementById("txtPaftaCard25k");

  if (el100k && allSheetsObj.s100k) {
    el100k.textContent = allSheetsObj.s100k.name;
    el100k.style.cursor = "pointer";
    el100k.title = allSheetsObj.s100k.name;
    el100k.onclick = () => {
      state.activePaftaScale = "100k";
      state.currentIntersectScale = "100k";
      highlightSheet(allSheetsObj.s100k);
      showFloatingPaftaCard(allSheetsObj.s100k, allSheetsObj);
    };
  }

  if (el50k && allSheetsObj.s50k) {
    el50k.textContent = allSheetsObj.s50k.name;
    el50k.style.cursor = "pointer";
    el50k.title = allSheetsObj.s50k.name;
    el50k.onclick = () => {
      state.activePaftaScale = "50k";
      state.currentIntersectScale = "50k";
      highlightSheet(allSheetsObj.s50k);
      showFloatingPaftaCard(allSheetsObj.s50k, allSheetsObj);
    };
  }

  if (el25k && allSheetsObj.s25k) {
    el25k.textContent = allSheetsObj.s25k.name;
    el25k.style.cursor = "pointer";
    el25k.title = allSheetsObj.s25k.name;
    el25k.onclick = () => {
      state.activePaftaScale = "25k";
      state.currentIntersectScale = "25k";
      highlightSheet(allSheetsObj.s25k);
      showFloatingPaftaCard(allSheetsObj.s25k, allSheetsObj);
    };
  }


  const el5k = document.getElementById("txtPaftaCard5k");
  if (el5k && allSheetsObj.s5k) {
    el5k.textContent = allSheetsObj.s5k.name;
    el5k.style.cursor = "pointer";
    el5k.title = allSheetsObj.s5k.name;
    el5k.onclick = () => {
      state.activePaftaScale = "5k";
      state.currentIntersectScale = "5k";
      highlightSheet(allSheetsObj.s5k);
      showFloatingPaftaCard(allSheetsObj.s5k, allSheetsObj);
    };
  }

  const el2k = document.getElementById("txtPaftaCard2k");
  if (el2k && allSheetsObj.s2k) {
    el2k.textContent = allSheetsObj.s2k.name;
    el2k.style.cursor = "pointer";
    el2k.title = allSheetsObj.s2k.name;
    el2k.onclick = () => {
      state.activePaftaScale = "2k";
      state.currentIntersectScale = "2k";
      highlightSheet(allSheetsObj.s2k);
      showFloatingPaftaCard(allSheetsObj.s2k, allSheetsObj);
    };
  }

  const el1k = document.getElementById("txtPaftaCard1k");
  if (el1k && allSheetsObj.s1k) {
    el1k.textContent = allSheetsObj.s1k.name;
    el1k.style.cursor = "pointer";
    el1k.title = allSheetsObj.s1k.name;
    el1k.onclick = () => {
      state.activePaftaScale = "1k";
      state.currentIntersectScale = "1k";
      highlightSheet(allSheetsObj.s1k);
      showFloatingPaftaCard(allSheetsObj.s1k, allSheetsObj);
    };
  }

  const s25Sheet = allSheetsObj.s25k || (arg1.scale === "1/25 000" ? arg1 : state.paftaEngine.get25kSheet(arg1.centerLat, arg1.centerLon));
  const hgmLookupKey = s25Sheet ? (s25Sheet.hgmKey || s25Sheet.name) : arg1.name;
  const datumCorr = (s25Sheet && s25Sheet.datumCorr && s25Sheet.datumCorr.isOfficial)
    ? s25Sheet.datumCorr
    : state.paftaEngine.getHgmDatumRecord(hgmLookupKey, arg1.centerLat, arg1.centerLon);

  const elPaftaRef = document.getElementById("txtHgmPaftaRef");
  if (elPaftaRef) {
    const ref25kName = s25Sheet ? s25Sheet.name : (datumCorr.pafta25k || arg1.name);
    elPaftaRef.textContent = ref25kName;
    elPaftaRef.title = `${ref25kName} (1/25 000 Paftasını Göster)`;
    elPaftaRef.onclick = () => {
      if (s25Sheet) {
        state.activePaftaScale = "25k";
        state.currentIntersectScale = "25k";
        highlightSheet(s25Sheet);
        showFloatingPaftaCard(s25Sheet, allSheetsObj);
      }
    };
  }

  const domEl_1 = document.getElementById("txtHgmYukseklik");
  if (domEl_1) {
    domEl_1.textContent = datumCorr.yukseklikDuz.toFixed(2) + " m";
  }
  const domEl_2 = document.getElementById("txtHgmYukari");
  if (domEl_2) {
    domEl_2.textContent = (datumCorr.yukariDuz >= 0 ? "+" : "") + datumCorr.yukariDuz.toFixed(1) + " m";
  }
  const domEl_3 = document.getElementById("txtHgmSaga");
  if (domEl_3) {
    domEl_3.textContent = (datumCorr.sagaDuz >= 0 ? "+" : "") + datumCorr.sagaDuz.toFixed(1) + " m";
  }
  const domEl_4 = document.getElementById("txtHgmEnlem");
  if (domEl_4) {
    domEl_4.textContent = (datumCorr.enlemDuz >= 0 ? "+" : "") + datumCorr.enlemDuz.toFixed(2) + "\"";
  }
  const domEl_5 = document.getElementById("txtHgmBoylam");
  if (domEl_5) {
    domEl_5.textContent = (datumCorr.boylamDuz >= 0 ? "+" : "") + datumCorr.boylamDuz.toFixed(2) + "\"";
  }
  const domEl_6 = document.getElementById("txtHgmSourceLabel");
  if (domEl_6) {
    domEl_6.textContent = datumCorr.isOfficial ? t("map.officialDb") : t("map.calculated");
    domEl_6.style.color = datumCorr.isOfficial ? "var(--emerald-400)" : "var(--amber-400)";
  }
  const domEl_7 = document.getElementById("txtPaftaCardRegion");
  if (domEl_7) {
    domEl_7.textContent = v_5 ? t("map.paftaNamePrefix", { name: v_5 }) : "";
    domEl_7.style.display = v_5 ? "block" : "none";
  }
  domEl.style.display = "block";
}
// ==========================================================================
// CADASTRE RTK & CORS INTERACTIVE PANORAMIC MAP ENGINE
// ==========================================================================
state.cadastreLabelsVisible = true;
state.cadastreRouteVisible = false;
state.cadastreFilter = "ALL";
state.selectedCadastrePoint = null;
state.cadastreMarkersMap = new Map();

function initCadastreMap() {
  if (state.cadastreMap) {
    state.cadastreMap.invalidateSize();
    return;
  }
  const mapEl = document.getElementById("cadastreMapContainer");
  if (!mapEl || typeof L === "undefined") return;

  const { map } = createStudioMap("cadastreMapContainer", {
    center: [39.0, 35.2],
    zoom: 6,
    minZoom: 5,
    maxZoom: 22,
    defaultType: "hybrid"
  });
  state.cadastreMap = map;
  state.cadastreLayerGroup = L.layerGroup().addTo(state.cadastreMap);
  state.cadastreRouteLayerGroup = L.layerGroup().addTo(state.cadastreMap);

  // Türkiye Geneline Odakla Butonu
  const btnReset = document.getElementById("btnCadastreResetView");
  btnReset?.addEventListener("click", () => {
    if (state.cadastreMap) {
      state.cadastreMap.setView([39.0, 35.2], 6);
    }
  });

  // Ekrana Sığdır Butonu
  const btnFit = document.getElementById("btnFitCadastreMap");
  btnFit?.addEventListener("click", () => {
    fitCadastreMapBounds();
  });

  // Nokta Numaraları / Etiketleri Aç / Kapat
  const btnLabels = document.getElementById("btnCadastreToggleLabels");
  btnLabels?.addEventListener("click", () => {
    state.cadastreLabelsVisible = !state.cadastreLabelsVisible;
    btnLabels.classList.toggle("active", state.cadastreLabelsVisible);
    btnLabels.classList.toggle("text-cyan", state.cadastreLabelsVisible);
    plotCadastrePointsOnMap();
  });

  // Ölçüm Güzergah Çizgisi Aç / Kapat
  const btnRoute = document.getElementById("btnCadastreToggleRoute");
  btnRoute?.addEventListener("click", () => {
    state.cadastreRouteVisible = !state.cadastreRouteVisible;
    btnRoute.classList.toggle("active", state.cadastreRouteVisible);
    btnRoute.classList.toggle("text-cyan", state.cadastreRouteVisible);
    drawCadastreRoute();
  });

  // Filtre Grubu Butonları (Tümü / Çift Okuma / Limit Aşımı / Tekil)
  const filterBtns = document.querySelectorAll("#cadastreMapFilterGroup [data-map-filter]");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.cadastreFilter = btn.getAttribute("data-map-filter") || "ALL";
      plotCadastrePointsOnMap();
    });
  });

  // HUD Kopyala Butonu
  const btnHudCopy = document.getElementById("btnCadastreHudCopy");
  btnHudCopy?.addEventListener("click", () => {
    if (!state.selectedCadastrePoint) {
      showToast(t("cadastre.hudNoPoint"), "info");
      return;
    }
    const pt = state.selectedCadastrePoint;
    const text = `${pt.pn}\t${pt.e.toFixed(3)}\t${pt.n.toFixed(3)}\t${pt.h.toFixed(3)}`;
    copyToClipboard(text, t("cadastre.toastPointCopied", { point: pt.pn }));
  });

  // HUD Odaklan Butonu
  const btnHudFocus = document.getElementById("btnCadastreHudFocus");
  btnHudFocus?.addEventListener("click", () => {
    if (!state.selectedCadastrePoint || !state.selectedCadastrePoint.lat || !state.selectedCadastrePoint.lon) {
      showToast(t("cadastre.hudNoPoint"), "info");
      return;
    }
    const { lat, lon, pn } = state.selectedCadastrePoint;
    state.cadastreMap.flyTo([lat, lon], 18, { animate: true, duration: 1 });
    showToast(t("cadastre.toastPointFocused", { point: pn }), "info");
  });

  // Hızlı Dışa Aktarma Butonları
  document.getElementById("btnCadastreMapExportDxf")?.addEventListener("click", () => {
    elements.btnExportDxf?.click();
  });
  document.getElementById("btnCadastreMapExportKml")?.addEventListener("click", () => {
    elements.btnExportKmlCadastre?.click();
  });
  document.getElementById("btnCadastreMapExportNcn")?.addEventListener("click", () => {
    elements.btnExportNcn?.click();
  });
  document.getElementById("btnCadastreMapExportCsv")?.addEventListener("click", () => {
    elements.btnExportCadastreCsv?.click();
  });
  document.getElementById("btnCadastreMapExportPdf")?.addEventListener("click", () => {
    elements.btnPrintCadastre?.click();
  });

  plotCadastrePointsOnMap();
}

function fitCadastreMapBounds() {
  if (!state.cadastreMap || !state.cadastreLayerGroup) return;
  const layers = state.cadastreLayerGroup.getLayers();
  if (layers.length > 0) {
    const bounds = L.featureGroup(layers).getBounds();
    if (bounds.isValid()) {
      state.cadastreMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }
  }
}

function drawCadastreRoute() {
  if (!state.cadastreRouteLayerGroup) return;
  state.cadastreRouteLayerGroup.clearLayers();
  if (!state.cadastreRouteVisible) return;

  const rawPts = state.gnssEngine?.rawPoints || [];
  if (rawPts.length < 2) return;

  const latLngs = [];
  rawPts.forEach(pt => {
    if (pt.lat !== undefined && pt.lon !== undefined) {
      latLngs.push([pt.lat, pt.lon]);
    }
  });

  if (latLngs.length >= 2) {
    L.polyline(latLngs, {
      color: "#06b6d4",
      weight: 2.5,
      opacity: 0.85,
      dashArray: "6, 8"
    }).addTo(state.cadastreRouteLayerGroup);
  }
}

function selectCadastrePoint(point, flyToMarker = false) {
  if (!point) return;
  state.selectedCadastrePoint = point;

  const hudPtName = document.getElementById("cadastreHudPointName");
  const hudBadge = document.getElementById("cadastreHudStatusBadge");
  const hudDsVal = document.getElementById("cadastreHudDsVal");
  const hudCoords = document.getElementById("cadastreHudCoords");
  const hudHeights = document.getElementById("cadastreHudHeights");
  const hudQuality = document.getElementById("cadastreHudQuality");
  const hudTime = document.getElementById("cadastreHudTime");

  if (hudPtName) hudPtName.textContent = point.pn || "--";

  // Durum ve Tolerans Rozeti
  const meta = point._meta || {};
  if (hudBadge) {
    hudBadge.className = "badge text-2xs";
    if (meta.isDual) {
      if (meta.isPass) {
        hudBadge.classList.add("badge-emerald");
        hudBadge.textContent = t("cadastre.hudStatusPass");
      } else {
        hudBadge.classList.add("badge-rose");
        hudBadge.textContent = t("cadastre.hudStatusFail");
      }
    } else {
      hudBadge.classList.add("badge-cyan");
      hudBadge.textContent = t("cadastre.hudStatusSingle");
    }
  }

  if (hudDsVal) {
    hudDsVal.textContent = meta.isDual && meta.ds2d ? `ΔS: ${meta.ds2d} cm` : "";
    hudDsVal.className = meta.isPass ? "text-xs font-mono text-emerald font-bold" : "text-xs font-mono text-rose font-bold";
  }

  if (hudCoords) {
    hudCoords.textContent = `Y: ${point.e?.toFixed(3) || "-"} | X: ${point.n?.toFixed(3) || "-"}`;
  }

  if (hudHeights) {
    const ortho = point.orthoH !== undefined ? point.orthoH.toFixed(3) : (point.h - 34.455).toFixed(3);
    const nVal = point.tg20N ? point.tg20N : "N≈34.455";
    hudHeights.textContent = `H: ${ortho}m | h: ${point.h?.toFixed(3) || "-"}m | N: ${nVal}`;
  }

  if (hudQuality) {
    hudQuality.textContent = `RMS: ${point.hsdvVal ? point.hsdvVal.toFixed(3) : "-"} m | PDOP: ${point.pdop || "-"}`;
  }

  if (hudTime) {
    hudTime.textContent = `SAT: ${point.sats || "-"} | ${point.tm || point.dt || "--:--:--"}`;
  }

  if (flyToMarker && point.lat !== undefined && point.lon !== undefined && state.cadastreMap) {
    state.cadastreMap.flyTo([point.lat, point.lon], 18, { animate: true, duration: 0.8 });
    const marker = state.cadastreMarkersMap.get(point.pn);
    if (marker) {
      marker.openPopup();
    }
  }
}
window.selectCadastrePoint = selectCadastrePoint;

function plotCadastrePointsOnMap() {
  if (!state.cadastreMap || !state.cadastreLayerGroup) {
    return;
  }
  state.cadastreLayerGroup.clearLayers();
  state.cadastreMarkersMap.clear();

  const rawPts = state.gnssEngine?.rawPoints || [];
  const badgeCount = document.getElementById("badgeCadastreMapCount");
  const badgeCrs = document.getElementById("badgeCadastreMapCrs");

  if (badgeCrs && state.gnssEngine?.centralMeridian) {
    badgeCrs.textContent = `ITRF-96 TM 3° (DOM: ${state.gnssEngine.centralMeridian}°)`;
  }

  if (rawPts.length === 0) {
    if (badgeCount) badgeCount.textContent = t("cadastre.badgePointCount", { count: 0 });
    return;
  }

  // Çift okuma eşleşme tablosunu hızlı arama sözlüğü haline getir
  const matchedPairs = state.gnssEngine?.matchedPairs || [];
  const dualLookup = new Map();
  matchedPairs.forEach(pair => {
    if (pair.p1) dualLookup.set(pair.p1, pair);
    if (pair.p2) dualLookup.set(pair.p2, pair);
  });

  const validBounds = [];

  rawPts.forEach((item, index) => {
    let lat = item.lat ?? item.latDec;
    let lon = item.lon ?? item.lonDec;

    if ((lat === undefined || lon === undefined) && state.geodesyEngine && item.e && item.n) {
      try {
        const geo = state.geodesyEngine.inverseTM(item.e, item.n, state.gnssEngine.centralMeridian, 1.0, false);
        lat = geo.lat;
        lon = geo.lon;
        item.lat = lat;
        item.lon = lon;
      } catch (e) {}
    }

    if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
      return;
    }

    // Çift okuma durum meta verisi
    const pair = dualLookup.get(item);
    const isDual = !!pair;
    const isPass = isDual ? pair.isDistPassed : false;
    const ds2d = isDual ? pair.ds2d : null;
    const type = isDual ? (isPass ? "DUAL_PASS" : "DUAL_FAIL") : "SINGLE";

    item._meta = { isDual, isPass, ds2d, type, pair };

    // Filtre Kontrolü
    if (state.cadastreFilter !== "ALL") {
      if (state.cadastreFilter !== type) return;
    }

    validBounds.push([lat, lon]);

    // Özel Neon İkon Tasarımı
    let markerHtml = "";
    let markerClass = "";
    if (type === "DUAL_PASS") {
      markerClass = "cadastre-marker-pin cadastre-marker-dual-pass";
      markerHtml = `<div class="${markerClass}"><i class="fa-solid fa-check"></i></div>`;
    } else if (type === "DUAL_FAIL") {
      markerClass = "cadastre-marker-pin cadastre-marker-dual-fail";
      markerHtml = `<div class="${markerClass}"><i class="fa-solid fa-triangle-exclamation"></i></div>`;
    } else {
      markerClass = "cadastre-marker-pin cadastre-marker-single";
      markerHtml = `<div class="${markerClass}"><i class="fa-solid fa-circle-dot"></i></div>`;
    }

    const customIcon = L.divIcon({
      className: "cadastre-leaflet-icon-container",
      html: markerHtml,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(state.cadastreLayerGroup);
    state.cadastreMarkersMap.set(item.pn, marker);

    // Etiket (Tooltip)
    marker.bindTooltip(`<b>${item.pn}</b>`, {
      permanent: state.cadastreLabelsVisible,
      direction: "top",
      offset: [0, -10],
      className: "map-point-label"
    });

    // Zengin Geomatik Bilgi Pop-Up'ı
    const orthoH = item.orthoH !== undefined ? item.orthoH : item.h - 34.455;
    const nFormatted = item.tg20N ? item.tg20N : "+34.455 m";
    const statusColor = type === "DUAL_PASS" ? "#10b981" : (type === "DUAL_FAIL" ? "#f43f5e" : "#06b6d4");
    const statusLabel = type === "DUAL_PASS" ? t("cadastre.hudStatusPass") : (type === "DUAL_FAIL" ? t("cadastre.hudStatusFail") : t("cadastre.hudStatusSingle"));

    const popupContent = `
      <div style="font-family: var(--font-sans, sans-serif); font-size: 12px; line-height: 1.5; min-width: 220px; color: #f1f5f9;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px; margin-bottom: 6px;">
          <b style="color: #38bdf8; font-size: 14px;">📍 ${item.pn}</b>
          <span style="background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}55; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${statusLabel}</span>
        </div>
        <div><strong>${t("geomatics.easting")}:</strong> <span style="font-family: monospace; color: #ffffff;">${item.e.toFixed(3)} m</span></div>
        <div><strong>${t("geomatics.northing")}:</strong> <span style="font-family: monospace; color: #ffffff;">${item.n.toFixed(3)} m</span></div>
        <div><strong>${t("geomatics.orthometricHeight")}:</strong> <span style="font-family: monospace; color: #fbbf24; font-weight: 700;">${orthoH.toFixed(3)} m</span> (TG-20 N: ${nFormatted})</div>
        <div><strong>${t("geomatics.ellipsoidalHeight")}:</strong> <span style="font-family: monospace; color: #94a3b8;">${item.h.toFixed(3)} m</span></div>
        ${isDual ? `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); color: ${statusColor};"><strong>ΔS (2B Fark):</strong> ${ds2d} cm | <strong>Δt:</strong> ${pair.timeDiffStr || "-"}</div>` : ""}
        <div style="margin-top: 4px; color: #94a3b8; font-size: 11px;">
          <strong>RMS:</strong> ${item.hsdvVal ? item.hsdvVal.toFixed(3) : "-"} m | <strong>PDOP:</strong> ${item.pdop || "-"} | <strong>SAT:</strong> ${item.sats || "-"}
        </div>
      </div>
    `;
    marker.bindPopup(popupContent, { className: "custom-leaflet-popup" });

    marker.on("click", () => {
      selectCadastrePoint(item, false);
    });
  });

  // Rozet Güncellemesi
  if (badgeCount) {
    badgeCount.textContent = t("cadastre.badgePointCount", { count: validBounds.length });
  }

  // Güzergah Çizgisi
  drawCadastreRoute();

  // Otomatik İlk Nokta Seçimi & HUD Güncellemesi
  if (!state.selectedCadastrePoint && rawPts.length > 0) {
    selectCadastrePoint(rawPts[0], false);
  } else if (state.selectedCadastrePoint) {
    selectCadastrePoint(state.selectedCadastrePoint, false);
  }

  // İlk yüklemede haritayı noktalara sığdır
  if (validBounds.length > 0) {
    fitCadastreMapBounds();
  }
}
function plotTrajectoryOnMap(arg1) {
  if (!state.map || !state.mapLayerGroup) {
    return;
  }
  state.mapLayerGroup.clearLayers();
  const v_2 = arg1.map(item => [item.lat, item.lon]);
  const v_3 = L.polyline(v_2, {
    color: "#06b6d4",
    weight: 4,
    opacity: 0.9
  }).addTo(state.mapLayerGroup);
  const v_4 = arg1[0];
  const v_5 = L.marker([v_4.lat, v_4.lon]).addTo(state.mapLayerGroup);
  v_5.bindPopup(`<b>${t("map.stationPos")}</b><br>Lat: ` + v_4.lat.toFixed(8) + "°<br>Lon: " + v_4.lon.toFixed(8) + "°<br>Height: " + v_4.h.toFixed(3) + " m<br>Epoch: " + arg1.length).openPopup();
  state.map.fitBounds(v_3.getBounds(), {
    padding: [40, 40]
  });
}
function exportKml() {
  // 1. Durum: Ekranda seçili/vurgulanmış bir Pafta varsa
  if (state.selectedPaftaSheet) {
    const kmlContent = state.paftaEngine.exportSingleSheetKml(state.selectedPaftaSheet);
    const fileName = `${state.selectedPaftaSheet.name}_pafta_siniri.kml`;
    downloadTextFile(fileName, kmlContent);
    showToast(t("map.toastDownloaded", { name: fileName }), "success");
    return;
  }

  // 2. Durum: Temas eden pafta listesi varsa
  if (state.currentIntersectingSheets && state.currentIntersectingSheets.length > 0) {
    const scaleLabel = state.currentIntersectScale || "25k";
    const kmlContent = state.paftaEngine.exportMultipleSheetsKml(state.currentIntersectingSheets, `Temas Eden Paftalar (${scaleLabel})`);
    const fileName = `temas_eden_paftalar_${scaleLabel}.kml`;
    downloadTextFile(fileName, kmlContent);
    showToast(t("map.toastIntersectingDownloaded", { name: fileName, count: state.currentIntersectingSheets.length }), "success");
    return;
  }

  // 3. Durum: İçe aktarılmış proje geometrisi varsa
  if (state.importedProjectData && state.importedProjectData.geojson) {
    const fileName = `${(state.importedProjectData.fileName || "proje").replace(/\.[^/.]+$/, "")}_export.kml`;
    let str = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n<name>' + fileName + '</name>\n';
    const feats = state.importedProjectData.geojson.features || [];
    for (let f of feats) {
      const pName = f.properties?.name || "Geometri";
      if (f.geometry?.type === "Point") {
        const c = f.geometry.coordinates;
        str += `<Placemark><name>${pName}</name><Point><coordinates>${c[0]},${c[1]},${c[2] || 0}</coordinates></Point></Placemark>\n`;
      } else if (f.geometry?.type === "Polygon") {
        const coords = f.geometry.coordinates[0].map(pt => `${pt[0]},${pt[1]},${pt[2] || 0}`).join(" ");
        str += `<Placemark><name>${pName}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>\n`;
      } else if (f.geometry?.type === "LineString") {
        const coords = f.geometry.coordinates.map(pt => `${pt[0]},${pt[1]},${pt[2] || 0}`).join(" ");
        str += `<Placemark><name>${pName}</name><LineString><coordinates>${coords}</coordinates></LineString></Placemark>\n`;
      }
    }
    str += '</Document>\n</kml>';
    downloadTextFile(fileName, str);
    showToast(t("map.toastDownloaded", { name: fileName }), "success");
    return;
  }

  // 4. Durum: Kadastro noktaları veya GNSS ölçüm çözümleri
  const points = (state.cadastrePoints && state.cadastrePoints.length > 0)
    ? state.cadastrePoints
    : (state.activePoints && state.activePoints.length > 0 ? state.activePoints : state.posSolutions || []);

  if (points.length === 0) {
    showToast(t("map.toastNoDataToExport"), "warning");
    return;
  }

  let str = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n<Document>\n<name>GNSS Noktaları & Rota</name>\n";
  for (let p of points) {
    const pName = p.name || p.id || p.pointId || "Nokta";
    const lon = p.lon ?? p.lng ?? p.longitude;
    const lat = p.lat ?? p.latitude;
    const h = p.h ?? p.height ?? p.elevation ?? p.ellipsoidalHeight ?? 0;
    if (lat !== undefined && lon !== undefined) {
      str += "<Placemark><name>" + pName + "</name><Point><coordinates>" + Number(lon).toFixed(8) + "," + Number(lat).toFixed(8) + "," + Number(h).toFixed(3) + "</coordinates></Point></Placemark>\n";
    }
  }
  str += "</Document>\n</kml>";
  downloadTextFile("gnss_points.kml", str);
  showToast(t("map.toastDownloaded", { name: "gnss_points.kml" }), "success");
}

function exportGeoJson() {
  // 1. Durum: Ekranda seçili/vurgulanmış bir Pafta varsa
  if (state.selectedPaftaSheet) {
    const geoJsonContent = state.paftaEngine.exportSingleSheetGeoJson(state.selectedPaftaSheet);
    const fileName = `${state.selectedPaftaSheet.name}_pafta_siniri.geojson`;
    downloadTextFile(fileName, geoJsonContent);
    showToast(t("map.toastDownloaded", { name: fileName }), "success");
    return;
  }

  // 2. Durum: Temas eden pafta listesi varsa
  if (state.currentIntersectingSheets && state.currentIntersectingSheets.length > 0) {
    const scaleLabel = state.currentIntersectScale || "25k";
    const geoJsonContent = state.paftaEngine.exportMultipleSheetsGeoJson(state.currentIntersectingSheets);
    const fileName = `temas_eden_paftalar_${scaleLabel}.geojson`;
    downloadTextFile(fileName, geoJsonContent);
    showToast(t("map.toastIntersectingDownloaded", { name: fileName, count: state.currentIntersectingSheets.length }), "success");
    return;
  }

  // 3. Durum: İçe aktarılmış proje geometrisi varsa
  if (state.importedProjectData && state.importedProjectData.geojson) {
    const fileName = `${(state.importedProjectData.fileName || "proje").replace(/\.[^/.]+$/, "")}_export.geojson`;
    downloadTextFile(fileName, JSON.stringify(state.importedProjectData.geojson, null, 2));
    showToast(t("map.toastDownloaded", { name: fileName }), "success");
    return;
  }

  // 4. Durum: Kadastro noktaları veya GNSS ölçüm çözümleri
  const points = (state.cadastrePoints && state.cadastrePoints.length > 0)
    ? state.cadastrePoints
    : (state.activePoints && state.activePoints.length > 0 ? state.activePoints : state.posSolutions || []);

  if (points.length === 0) {
    showToast(t("map.toastNoDataToExport"), "warning");
    return;
  }

  const features = points.map(item => {
    const lon = item.lon ?? item.lng ?? item.longitude;
    const lat = item.lat ?? item.latitude;
    const h = item.h ?? item.height ?? item.elevation ?? item.ellipsoidalHeight ?? 0;
    return {
      type: "Feature",
      properties: {
        name: item.name || item.id || item.pointId || "",
        code: item.code || item.description || "",
        height: h
      },
      geometry: {
        type: "Point",
        coordinates: [Number(lon), Number(lat), Number(h)]
      }
    };
  }).filter(item => !isNaN(item.geometry.coordinates[0]) && !isNaN(item.geometry.coordinates[1]));

  const obj = {
    type: "FeatureCollection",
    features: features
  };
  downloadTextFile("gnss_points.geojson", JSON.stringify(obj, null, 2));
  showToast(t("map.toastDownloaded", { name: "gnss_points.geojson" }), "success");
}

window.createBaseLayers = createBaseLayers;

/* <<<<<<<<<< [END MODULE: js/tabs/mapTab.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/tabs/geodesyTab.js] >>>>>>>>>> */
/**
 * Harita Tools - Geodesy & Coordinate Transformation Controller
 */
function initGeodesy() {
  const v_1 = new GeodesyEngine();
  let items = [];
  const domEl = document.getElementById("selSourceEpsg");
  const domEl_1 = document.getElementById("selTargetEpsg");
  const domEl_10 = document.getElementById("selBatchSourceEpsg");
  const domEl_11 = document.getElementById("selBatchTargetEpsg");

  const populateAllEpsgSelects = () => {
    if (domEl) v_1.populateSelect(domEl, domEl.value || "EPSG:4326");
    if (domEl_1) v_1.populateSelect(domEl_1, domEl_1.value || "EPSG:5255");
    if (domEl_10) v_1.populateSelect(domEl_10, domEl_10.value || "EPSG:5255");
    if (domEl_11) v_1.populateSelect(domEl_11, domEl_11.value || "EPSG:4326");
  };
  populateAllEpsgSelects();
  window.refreshEpsgSelects = populateAllEpsgSelects;

  const btnEl = document.getElementById("btnSwapEpsg");
  const btnEl_1 = document.getElementById("btnConvertCoord");
  const btnEl_2 = document.getElementById("btnCopySingleCoordResult");
  const domEl_2 = document.getElementById("coordResultBox");
  const domEl_3 = document.getElementById("geoLat");
  const domEl_4 = document.getElementById("geoLon");
  const domEl_5 = document.getElementById("geoH");
  const inputEl = document.getElementById("lblInputC1");
  const inputEl_1 = document.getElementById("lblInputC2");
  const inputEl_2 = document.getElementById("lblInputC3");
  const domEl_6 = document.getElementById("crossDatumWarningBanner");
  const v_2 = () => {
    if (!domEl || !domEl_1 || !domEl_6) {
      return;
    }
    const v_1_1 = v_1.epsgRegistry[domEl.value] || v_1.epsgRegistry["EPSG:4326"];
    const v_2_1 = v_1.epsgRegistry[domEl_1.value] || v_1.epsgRegistry["EPSG:5255"];
    if (v_1_1.datum !== v_2_1.datum) {
      domEl_6.style.display = "block";
    } else {
      domEl_6.style.display = "none";
    }
  };
  const v_3 = () => {
    return {
      dx: parseFloat(document.getElementById("p_dx")?.value) || -84.1,
      dy: parseFloat(document.getElementById("p_dy")?.value) || -101.8,
      dz: parseFloat(document.getElementById("p_dz")?.value) || -129.7,
      rx: parseFloat(document.getElementById("p_rx")?.value) || 0,
      ry: parseFloat(document.getElementById("p_ry")?.value) || 0,
      rz: parseFloat(document.getElementById("p_rz")?.value) || 0,
      ds: parseFloat(document.getElementById("p_ds")?.value) || 0
    };
  };
  const btnEl_3 = document.getElementById("btnLoadBursaWolfSample");
  const domEl_7 = document.getElementById("txtBursaWolfCommonPoints");
  const btnEl_4 = document.getElementById("btnSolveBursaWolf");
  const domEl_8 = document.getElementById("lblBursaWolfM0");
  if (btnEl_3 && domEl_7) {
    btnEl_3.addEventListener("click", () => {
      domEl_7.value = "P1  4123450.000  2654320.000  4098760.000  4123365.900  2654218.200  4098630.300\nP2  4125600.000  2651200.000  4100100.000  4125515.800  2651098.300  4099970.200\nP3  4121200.000  2658900.000  4095400.000  4121116.100  2658798.100  4095270.400\nP4  4128900.000  2653400.000  4092100.000  4128815.950  2653298.150  4091970.350";
      showToast(t("geodesy.toastSamplePointsLoaded"), "info");
    });
  }
  if (btnEl_4 && domEl_7) {
    btnEl_4.addEventListener("click", () => {
      const v_1_1 = domEl_7.value.trim();
      if (!v_1_1) {
        showToast(t("geodesy.toastNeedCommonPoints"), "warning");
        return;
      }
      const v_2_1 = v_1_1.split(/\r?\n/).map(item => item.trim()).filter(item => item.length > 0 && !item.startsWith("#") && !item.startsWith("//") && !item.startsWith(";"));
      const items_2 = [];
      v_2_1.forEach((item, idx) => {
        const parts = item.split(/[\s,;|\t]+/);
        if (parts.length >= 7) {
          const v_1_2 = parts[0];
          const v_2_2 = parseFloat(parts[1]);
          const v_3_1 = parseFloat(parts[2]);
          const v_4_1 = parseFloat(parts[3]);
          const v_5_1 = parseFloat(parts[4]);
          const v_6_1 = parseFloat(parts[5]);
          const v_7_1 = parseFloat(parts[6]);
          if (!isNaN(v_2_2) && !isNaN(v_3_1) && !isNaN(v_4_1) && !isNaN(v_5_1) && !isNaN(v_6_1) && !isNaN(v_7_1)) {
            items_2.push({
              name: v_1_2,
              x1: v_2_2,
              y1: v_3_1,
              z1: v_4_1,
              x2: v_5_1,
              y2: v_6_1,
              z2: v_7_1
            });
          }
        }
      });
      if (items_2.length < 3) {
        showToast(t("geodesy.toastMin3CommonPoints", { count: items_2.length }), "warning");
        return;
      }
      try {
        const v_1_2 = v_1.solveBursaWolf7Param(items_2);
        if (document.getElementById("p_dx")) {
          document.getElementById("p_dx").value = v_1_2.dx.toFixed(3);
        }
        if (document.getElementById("p_dy")) {
          document.getElementById("p_dy").value = v_1_2.dy.toFixed(3);
        }
        if (document.getElementById("p_dz")) {
          document.getElementById("p_dz").value = v_1_2.dz.toFixed(3);
        }
        if (document.getElementById("p_rx")) {
          document.getElementById("p_rx").value = v_1_2.rx.toFixed(4);
        }
        if (document.getElementById("p_ry")) {
          document.getElementById("p_ry").value = v_1_2.ry.toFixed(4);
        }
        if (document.getElementById("p_rz")) {
          document.getElementById("p_rz").value = v_1_2.rz.toFixed(4);
        }
        if (document.getElementById("p_ds")) {
          document.getElementById("p_ds").value = v_1_2.ds.toFixed(3);
        }
        if (domEl_8) {
          domEl_8.innerHTML = t("geodesy.m0Summary", { m0: (v_1_2.m0 * 100).toFixed(2), count: v_1_2.pointCount });
        }
        logMessage("🏛️ [7 PARAMETRE] dX: " + v_1_2.dx.toFixed(3) + " m, dY: " + v_1_2.dy.toFixed(3) + " m, dZ: " + v_1_2.dz.toFixed(3) + " m, rX: " + v_1_2.rx.toFixed(4) + "\", rY: " + v_1_2.ry.toFixed(4) + "\", rZ: " + v_1_2.rz.toFixed(4) + "\", dS: " + v_1_2.ds.toFixed(3) + " ppm, m0: " + (v_1_2.m0 * 100).toFixed(2) + " cm");
        showToast(t("geodesy.toast7ParamSuccess", { m0: (v_1_2.m0 * 100).toFixed(2) }), "success");
      } catch (v_1_2) {
        logMessage("❌ [7 PARAMETRE HATA] " + v_1_2.message);
        showToast(t("geodesy.toast7ParamError", { err: v_1_2.message }), "error");
      }
    });
  }
  const v_4 = () => {
    if (!domEl) {
      return;
    }
    const v_1_1 = v_1.epsgRegistry[domEl.value] || v_1.epsgRegistry["EPSG:4326"];
    if (v_1_1.type === "GEO") {
      if (inputEl) {
        inputEl.textContent = t("geodesy.lblLatDeg");
      }
      if (inputEl_1) {
        inputEl_1.textContent = t("geodesy.lblLonDeg");
      }
      if (inputEl_2) {
        inputEl_2.textContent = t("geodesy.lblEllipsoidHM");
      }
    } else if (v_1_1.type === "TM") {
      if (inputEl) {
        inputEl.textContent = t("geodesy.lblEastingM");
      }
      if (inputEl_1) {
        inputEl_1.textContent = t("geodesy.lblNorthingM");
      }
      if (inputEl_2) {
        inputEl_2.textContent = t("geodesy.lblHeightM");
      }
    } else if (v_1_1.type === "ECEF") {
      if (inputEl) {
        inputEl.textContent = t("geodesy.lblCartesianX");
      }
      if (inputEl_1) {
        inputEl_1.textContent = t("geodesy.lblCartesianY");
      }
      if (inputEl_2) {
        inputEl_2.textContent = t("geodesy.lblCartesianZ");
      }
    }
    v_2();
  };
  if (domEl) {
    domEl.addEventListener("change", v_4);
    v_4();
  }
  if (domEl_1) {
    domEl_1.addEventListener("change", v_2);
  }
  if (btnEl) {
    btnEl.addEventListener("click", () => {
      const v_1_1 = domEl.value;
      domEl.value = domEl_1.value;
      domEl_1.value = v_1_1;
      v_4();
      v_5();
    });
  }
  const v_5 = () => {
    const v_1_1 = parseFloat(domEl_3.value);
    const v_2_1 = parseFloat(domEl_4.value);
    const v_3_1 = parseFloat(domEl_5.value) || 0;
    if (isNaN(v_1_1) || isNaN(v_2_1)) {
      showToast(t("geodesy.toastInvalidCoords"), "warning");
      return;
    }
    const v_4_1 = domEl.value;
    const v_5_1 = domEl_1.value;
    const v_6_1 = v_1.epsgRegistry[v_4_1] || v_1.epsgRegistry["EPSG:4326"];
    const v_7_1 = v_1.epsgRegistry[v_5_1] || v_1.epsgRegistry["EPSG:5255"];
    const v_8 = v_6_1.datum !== v_7_1.datum ? v_3() : null;
    const v_9 = v_1.transformCoordinate({
      c1: v_1_1,
      c2: v_2_1,
      c3: v_3_1
    }, v_4_1, v_5_1, v_8);
    let v_10 = t("geodesy.resSource", { name: v_6_1.name }) + "\n" + t("geodesy.resInput", { c1: v_1_1.toFixed(v_6_1.unit === "deg" ? 8 : 3), c2: v_2_1.toFixed(v_6_1.unit === "deg" ? 8 : 3), h: v_3_1.toFixed(3) }) + "\n\n" + t("geodesy.resTarget", { name: v_7_1.name }) + "\n" + t("geodesy.resResult", { res: v_9.formattedResult }) + "\n";
    if (v_7_1.type === "TM") {
      const v_1_2 = v_7_1.lon0;
      v_10 += t("geodesy.resZoneInfo", { lon0: v_1_2, zone: v_7_1.zone || "3°" }) + "\n";
    }
    if (v_9.isCrossDatum) {
      v_10 += t("geodesy.resDatumTransition", { from: v_6_1.datum, to: v_7_1.datum }) + "\n";
    }
    v_10 += t("geodesy.resGeoValue", { lat: v_1.toDms(v_9.lat, true), lon: v_1.toDms(v_9.lon, false) });
    lastSingleCoordResult = v_9;
    if (domEl_2) {
      domEl_2.textContent = v_10;
    }
    showToast(t("geodesy.toastTransformSuccess"), "success");
  };
  let lastSingleCoordResult = null;
  if (btnEl_1) {
    btnEl_1.addEventListener("click", v_5);
  }
  if (btnEl_2) {
    btnEl_2.addEventListener("click", () => {
      if (domEl_2) {
        copyToClipboard(domEl_2.textContent, t("geodesy.toastTransformCopied"));
      }
    });
  }
  document.getElementById("btnCopySingleTg20")?.addEventListener("click", () => {
    if (!lastSingleCoordResult) {
      showToast(t("geodesy.toastClickTransformFirst"), "warning");
      return;
    }
    const txt = lastSingleCoordResult.lat.toFixed(8) + "  " + lastSingleCoordResult.lon.toFixed(8) + "  " + (lastSingleCoordResult.h || 0).toFixed(3);
    copyToClipboard(txt, t("geodesy.toastTg20FormatCopied") + ":\n" + txt);
  });
  document.getElementById("btnSendSingleToTg20")?.addEventListener("click", () => {
    if (!lastSingleCoordResult) {
      showToast(t("geodesy.toastClickTransformFirst"), "warning");
      return;
    }
    const inLat = document.getElementById("inputTg20Lat");
    const inLon = document.getElementById("inputTg20Lon");
    const inH = document.getElementById("inputTg20H");
    if (inLat) inLat.value = lastSingleCoordResult.lat.toFixed(8);
    if (inLon) inLon.value = lastSingleCoordResult.lon.toFixed(8);
    if (inH) inH.value = (lastSingleCoordResult.h || 0).toFixed(3);
    const tabBtn = document.querySelector('[data-tab="tab-tg20"]');
    if (tabBtn) tabBtn.click();
    setTimeout(() => {
      document.getElementById("btnCalculateTg20Single")?.click();
    }, 150);
    showToast(t("geodesy.toastTransferredToTg20"), "success");
  });
  const inputEl_3 = document.getElementById("txtBatchInput");
  const inputEl_4 = document.getElementById("fileBatchInput");
  const domEl_9 = document.getElementById("selBatchDelimiter");
  const btnEl_5 = document.getElementById("btnSwapBatchEpsg");
  document.querySelectorAll(".btn-quick-epsg").forEach(item => {
    item.addEventListener("click", () => {
      const v_1_1 = item.getAttribute("data-src");
      const v_2_1 = item.getAttribute("data-tgt");
      if (domEl_10 && v_1_1) {
        domEl_10.value = v_1_1;
      }
      if (domEl_11 && v_2_1) {
        domEl_11.value = v_2_1;
      }
      showToast(t("geodesy.toastTemplateSelected", { name: item.textContent }), "info");
    });
  });
  const btnEl_6 = document.getElementById("btnBatchTransform");
  const domEl_12 = document.getElementById("batchResultsWrapper");
  const domEl_13 = document.getElementById("tbodyBatchResults");
  const domEl_14 = document.getElementById("lblBatchSummary");
  const domEl_15 = document.getElementById("thBatchSrc1");
  const domEl_16 = document.getElementById("thBatchSrc2");
  const domEl_17 = document.getElementById("thBatchTgt1");
  const domEl_18 = document.getElementById("thBatchTgt2");
  const domEl_19 = document.getElementById("selCol1");
  const domEl_20 = document.getElementById("selCol2");
  const domEl_21 = document.getElementById("selCol3");
  const domEl_22 = document.getElementById("selCol4");
  if (btnEl_5 && domEl_10 && domEl_11) {
    btnEl_5.addEventListener("click", () => {
      const v_1_1 = domEl_10.value;
      domEl_10.value = domEl_11.value;
      domEl_11.value = v_1_1;
      showToast(t("geodesy.toastProjectionsSwapped"), "info");
    });
  }
  if (inputEl_4) {
    inputEl_4.addEventListener("change", async event => {
      const v_1_1 = event.target.files[0];
      if (v_1_1) {
        const v_1_2 = await v_1_1.text();
        if (inputEl_3) {
          inputEl_3.value = v_1_2;
        }
        showToast(t("geodesy.toastBatchLoaded", { name: v_1_1.name, size: (v_1_1.size / 1024).toFixed(1) }), "info");
      }
    });
  }
  if (btnEl_6) {
    btnEl_6.addEventListener("click", () => {
      const v_1_1 = inputEl_3?.value || "";
      if (!v_1_1.trim()) {
        showToast(t("geodesy.toastNeedCoordText"), "warning");
        return;
      }
      const v_2_1 = domEl_9?.value || "AUTO";
      const v_3_1 = v_1.parseBatchCoordinateText(v_1_1, v_2_1);
      if (v_3_1.rows.length === 0) {
        showToast(t("geodesy.toastInvalidCoordLines"), "warning");
        return;
      }
      const v_4_1 = domEl_19.value;
      const v_5_1 = domEl_20.value;
      const v_6_1 = domEl_21.value;
      const v_7_1 = domEl_22.value;
      const v_8 = domEl_10 ? domEl_10.value : domEl.value;
      const v_9 = domEl_11 ? domEl_11.value : domEl_1.value;
      const v_10 = v_1.epsgRegistry[v_8] || v_1.epsgRegistry["EPSG:5255"];
      const v_11 = v_1.epsgRegistry[v_9] || v_1.epsgRegistry["EPSG:4326"];
      const v_12 = v_10.datum !== v_11.datum ? v_3() : null;
      if (domEl_15) {
        domEl_15.textContent = "C1 (" + (v_10.type === "GEO" ? t("geodesy.lblLatEnlem") : v_10.type === "ECEF" ? "X" : "Y") + ")";
      }
      if (domEl_16) {
        domEl_16.textContent = "C2 (" + (v_10.type === "GEO" ? t("geodesy.lblLonBoylam") : v_10.type === "ECEF" ? "Y" : "X") + ")";
      }
      if (domEl_17) {
        domEl_17.textContent = "C1' (" + (v_11.type === "GEO" ? t("geodesy.lblLatEnlem") : v_11.type === "ECEF" ? "X" : "Y") + ")";
      }
      if (domEl_18) {
        domEl_18.textContent = "C2' (" + (v_11.type === "GEO" ? t("geodesy.lblLonBoylam") : v_11.type === "ECEF" ? "Y" : "X") + ")";
      }
      items = [];
      if (domEl_13) {
        domEl_13.innerHTML = "";
      }
      v_3_1.rows.forEach((item, idx) => {
        let v_1_2 = "P" + (idx + 1);
        let num = 0;
        let num_1 = 0;
        let num_2 = 0;
        let str = "";
        const v_2_2 = (arg1, arg2) => {
          const v_3_2 = item[arg2] || "";
          if (arg1 === "PN") {
            v_1_2 = v_3_2 || "P" + (idx + 1);
          } else if (arg1 === "C1") {
            num = parseFloat(v_3_2) || 0;
          } else if (arg1 === "C2") {
            num_1 = parseFloat(v_3_2) || 0;
          } else if (arg1 === "C3") {
            num_2 = parseFloat(v_3_2) || 0;
          } else if (arg1 === "CODE") {
            str = v_3_2;
          }
        };
        v_2_2(v_4_1, 0);
        v_2_2(v_5_1, 1);
        v_2_2(v_6_1, 2);
        v_2_2(v_7_1, 3);
        if (num !== 0 || num_1 !== 0) {
          const v_1_3 = v_1.transformCoordinate({
            c1: num,
            c2: num_1,
            c3: num_2
          }, v_8, v_9, v_12);
          const obj = {
            index: idx + 1,
            pn: v_1_2,
            srcC1: num,
            srcC2: num_1,
            srcC3: num_2,
            tgtC1: v_1_3.c1,
            tgtC2: v_1_3.c2,
            tgtC3: v_1_3.c3,
            lat: v_1_3.lat,
            lon: v_1_3.lon,
            h: v_1_3.h,
            code: str
          };
          items.push(obj);
          if (domEl_13) {
            const trEl = document.createElement("tr");
            const v_1_4 = v_10.unit === "deg" ? 8 : 3;
            const v_2_3 = v_11.unit === "deg" ? 8 : 3;
            trEl.innerHTML = "\n                            <td style=\"font-family: var(--font-mono); color: var(--text-dim);\">" + (idx + 1) + "</td>\n                            <td><strong class=\"font-bold text-main\">" + v_1_2 + "</strong></td>\n                            <td style=\"font-family: var(--font-mono);\">" + num.toFixed(v_1_4) + "</td>\n                            <td style=\"font-family: var(--font-mono);\">" + num_1.toFixed(v_1_4) + "</td>\n                            <td style=\"font-family: var(--font-mono);\">" + num_2.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono); font-weight: 700; color: var(--cyan-400);\">" + v_1_3.c1.toFixed(v_2_3) + "</td>\n                            <td style=\"font-family: var(--font-mono); font-weight: 700; color: var(--cyan-400);\">" + v_1_3.c2.toFixed(v_2_3) + "</td>\n                            <td style=\"font-family: var(--font-mono); color: var(--purple-400);\">" + v_1_3.c3.toFixed(3) + "</td>\n                        ";
            domEl_13.appendChild(trEl);
          }
        }
      });
      if (items.length > 0) {
        if (domEl_12) {
          domEl_12.style.display = "flex";
        }
        if (domEl_14) {
          domEl_14.innerHTML = t("geodesy.batchSummaryHtml", { count: items.length, from: v_10.name.split("(")[0], to: v_11.name.split("(")[0] });
        }
        showToast(t("geodesy.toastBatchConverted", { count: items.length, from: v_8, to: v_9 }), "success");
      }
    });
  }
  document.getElementById("btnExportBatchNcn")?.addEventListener("click", () => {
    if (items.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadNcn("donusturulen_noktalar.ncn", items);
  });
  document.getElementById("btnExportBatchDxf")?.addEventListener("click", () => {
    if (items.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadDxf("donusturulen_noktalar.dxf", items);
  });
  document.getElementById("btnExportBatchKml")?.addEventListener("click", () => {
    if (items.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadKml("donusturulen_noktalar.kml", items, { docName: "Donusturulen Noktalar" });
  });
  document.getElementById("btnExportBatchTxt")?.addEventListener("click", () => {
    if (items.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadCsv("donusturulen_noktalar.csv", items);
  });
  document.getElementById("btnCopyBatchTg20")?.addEventListener("click", () => {
    if (items.length === 0) {
      showToast(t("geodesy.toastNoConvertedList"), "warning");
      return;
    }
    let txt = "";
    items.forEach(item => {
      txt += item.pn + "  " + item.lat.toFixed(8) + "  " + item.lon.toFixed(8) + "  " + (item.h || 0).toFixed(3) + "\n";
    });
    copyToClipboard(txt.trim(), t("geodesy.toastTg20BatchCopied", { count: items.length }));
  });
  document.getElementById("btnSendBatchToTg20")?.addEventListener("click", () => {
    if (items.length === 0) {
      showToast(t("geodesy.toastNoConvertedList"), "warning");
      return;
    }
    let txt = "";
    items.forEach(item => {
      txt += item.pn + "  " + item.lat.toFixed(8) + "  " + item.lon.toFixed(8) + "  " + (item.h || 0).toFixed(3) + "\n";
    });
    const batchInput = document.getElementById("txtTg20BatchInput");
    if (batchInput) {
      batchInput.value = txt.trim();
    }
    const tabBtn = document.querySelector('[data-tab="tab-tg20"]');
    if (tabBtn) tabBtn.click();
    setTimeout(() => {
      document.getElementById("btnProcessTg20Batch")?.click();
    }, 200);
    showToast(t("geodesy.toastTransferredBatchTg20", { count: items.length }), "success");
  });
  let v_6 = null;
  let items_1 = [];
  const btnEl_7 = document.getElementById("btnTabHelmertDns");
  const btnEl_8 = document.getElementById("btnTabHelmertPoints");
  const domEl_23 = document.getElementById("paneHelmertDns");
  const domEl_24 = document.getElementById("paneHelmertPoints");
  btnEl_7?.addEventListener("click", () => {
    btnEl_7.classList.add("btn-primary");
    btnEl_7.classList.remove("btn-secondary");
    btnEl_8.classList.add("btn-secondary");
    btnEl_8.classList.remove("btn-primary");
    if (domEl_23) {
      domEl_23.classList.remove("d-none");
      domEl_23.style.setProperty("display", "flex", "important");
    }
    if (domEl_24) {
      domEl_24.classList.add("d-none");
      domEl_24.style.setProperty("display", "none", "important");
    }
  });
  btnEl_8?.addEventListener("click", () => {
    btnEl_8.classList.add("btn-primary");
    btnEl_8.classList.remove("btn-secondary");
    btnEl_7.classList.add("btn-secondary");
    btnEl_7.classList.remove("btn-primary");
    if (domEl_24) {
      domEl_24.classList.remove("d-none");
      domEl_24.style.setProperty("display", "flex", "important");
    }
    if (domEl_23) {
      domEl_23.classList.add("d-none");
      domEl_23.style.setProperty("display", "none", "important");
    }
  });
  const inputEl_5 = document.getElementById("inputHelmertDnsFile");
  const domEl_25 = document.getElementById("txtHelmertDnsFileName");
  const domEl_26 = document.getElementById("txtHelmertDnsContent");
  const btnEl_9 = document.getElementById("btnApplyDnsParams");
  inputEl_5?.addEventListener("change", async arg1 => {
    const v_2_1 = arg1.target.files?.[0];
    if (v_2_1) {
      const v_1_1 = await v_2_1.text();
      if (domEl_26) {
        domEl_26.value = v_1_1;
      }
      if (domEl_25) {
        domEl_25.innerHTML = "<span style=\"color: var(--cyan-400); font-weight:700;\">" + v_2_1.name + "</span> <span class=\"badge\" style=\"font-size:10px;\">" + t("geodesy.dnsBadge") + "</span>";
      }
      v_7(v_1_1, v_2_1.name);
    }
  });
  function v_7(arg1, arg2 = t("geodesy.dnsBadge")) {
    if (!arg1 || !arg1.trim()) {
      showToast(t("geodesy.toastNeedDnsContent"), "warning");
      return;
    }
    try {
      const v_1_1 = v_1.parseNetcadDns(arg1);
      v_6 = v_1_1;
      document.getElementById("resHelmertA").textContent = v_1_1.a.toFixed(8);
      document.getElementById("resHelmertB").textContent = v_1_1.b.toFixed(8);
      document.getElementById("resHelmertDy").textContent = v_1_1.dy0.toFixed(3) + " m";
      document.getElementById("resHelmertDx").textContent = v_1_1.dx0.toFixed(3) + " m";
      document.getElementById("resHelmertScale").textContent = v_1_1.scale_m.toFixed(8) + " (" + (v_1_1.dm_ppm > 0 ? "+" : "") + v_1_1.dm_ppm.toFixed(1) + " ppm)";
      document.getElementById("resHelmertTheta").textContent = v_1_1.theta_grad.toFixed(6) + " grad (" + v_1_1.theta_deg.toFixed(4) + "°)";
      document.getElementById("badgeHelmertM0").textContent = t("geodesy.dnsParams");
      const domEl_33 = document.getElementById("lblHelmertStatusSource");
      if (domEl_33) {
        domEl_33.innerHTML = "<i class=\"fa-solid fa-file-lines\" style=\"color: var(--cyan-400);\"></i> " + t("geodesy.dnsFileActivated", { name: arg2 });
      }
      const domEl_34 = document.getElementById("wrapperHelmertResiduals");
      if (domEl_34) {
        domEl_34.style.display = "none";
      }
      if (domEl_29) {
        domEl_29.style.display = "flex";
      }
      logMessage(t("geodesy.logDnsLoaded", { a: v_1_1.a.toFixed(6), b: v_1_1.b.toFixed(6), dy: v_1_1.dy0.toFixed(2), dx: v_1_1.dx0.toFixed(2) }));
      showToast(t("geodesy.toastDnsActivated"), "success");
    } catch (v_1_1) {
      logMessage("❌ [DNS HATA] " + (v_1_1.message || v_1_1));
      showToast(t("geodesy.toastDnsReadError", { err: v_1_1.message }), "error");
    }
  }
  btnEl_9?.addEventListener("click", () => {
    v_7(domEl_26?.value, "Netcad .DNS Metni");
  });
  const btnEl_10 = document.getElementById("btnLoadHelmertSample");
  const btnEl_11 = document.getElementById("btnSolveHelmert");
  const btnEl_12 = document.getElementById("btnTransformHelmertPoints");
  const domEl_27 = document.getElementById("txtHelmertCommonPoints");
  const domEl_28 = document.getElementById("txtHelmertPointsToTransform");
  const domEl_29 = document.getElementById("helmertResultsWrapper");
  const domEl_30 = document.getElementById("tbodyHelmertResiduals");
  const domEl_31 = document.getElementById("wrapperHelmertTransformedPoints");
  const domEl_32 = document.getElementById("tbodyHelmertTransformed");
  btnEl_10?.addEventListener("click", () => {
    if (domEl_27) {
      domEl_27.value = "P1  500120.000  4520100.000  500122.500  4520104.200\nP2  501240.000  4520150.000  501242.600  4520154.100\nP3  501260.000  4521200.000  501262.400  4521204.300\nP4  500150.000  4521180.000  500152.700  4521184.000";
    }
    if (domEl_28) {
      domEl_28.value = "101  500500.000  4520500.000  125.400\n102  500650.000  4520750.000  128.200\n103  500800.000  4520900.000  131.050\n104  500950.000  4521050.000  133.800";
    }
    showToast(t("geodesy.toastSample2dLoaded"), "info");
  });
  btnEl_11?.addEventListener("click", () => {
    const v_1_1 = domEl_27?.value.trim();
    if (!v_1_1) {
      showToast(t("geodesy.toastNeedMin2CommonPoints"), "warning");
      return;
    }
    const v_2_1 = v_1_1.split(/\r?\n/).map(item => item.trim()).filter(item => item.length > 0);
    const items_2 = [];
    v_2_1.forEach(item => {
      const v_1_2 = item.split(/[\s,;\t]+/).filter(Boolean);
      if (v_1_2.length >= 5) {
        const v_1_3 = v_1_2[0];
        const v_2_2 = parseFloat(v_1_2[1]);
        const v_3_1 = parseFloat(v_1_2[2]);
        const v_4_1 = parseFloat(v_1_2[3]);
        const v_5_1 = parseFloat(v_1_2[4]);
        if (!isNaN(v_2_2) && !isNaN(v_3_1) && !isNaN(v_4_1) && !isNaN(v_5_1)) {
          items_2.push({
            name: v_1_3,
            y1: v_2_2,
            x1: v_3_1,
            y2: v_4_1,
            x2: v_5_1
          });
        }
      }
    });
    if (items_2.length < 2) {
      showToast(t("geodesy.toastNeedMin2CommonPoints"), "error");
      return;
    }
    try {
      const v_1_2 = v_1.solveHelmert2D(items_2);
      v_6 = v_1_2;
      document.getElementById("resHelmertA").textContent = v_1_2.a.toFixed(8);
      document.getElementById("resHelmertB").textContent = v_1_2.b.toFixed(8);
      document.getElementById("resHelmertDy").textContent = v_1_2.dy0.toFixed(3) + " m";
      document.getElementById("resHelmertDx").textContent = v_1_2.dx0.toFixed(3) + " m";
      document.getElementById("resHelmertScale").textContent = v_1_2.scale_m.toFixed(8) + " (" + (v_1_2.dm_ppm > 0 ? "+" : "") + v_1_2.dm_ppm.toFixed(1) + " ppm)";
      document.getElementById("resHelmertTheta").textContent = v_1_2.theta_grad.toFixed(6) + " grad (" + v_1_2.theta_deg.toFixed(4) + "°)";
      document.getElementById("badgeHelmertM0").textContent = "m0 = " + (v_1_2.m0 * 100).toFixed(2) + " cm (" + v_1_2.m0.toFixed(4) + " m)";
      const domEl_33 = document.getElementById("lblHelmertStatusSource");
      if (domEl_33) {
        domEl_33.innerHTML = t("geodesy.helmertFromPoints", { count: items_2.length });
      }
      const domEl_34 = document.getElementById("wrapperHelmertResiduals");
      if (domEl_34) {
        domEl_34.style.display = "block";
      }
      if (domEl_30) {
        domEl_30.innerHTML = "";
        v_1_2.residuals.forEach(item => {
          const trEl = document.createElement("tr");
          const v_1_3 = (item.vy * 100).toFixed(2);
          const v_2_2 = (item.vx * 100).toFixed(2);
          const v_3_1 = (item.vs * 100).toFixed(2);
          trEl.innerHTML = "\n                        <td><strong>" + item.name + "</strong></td>\n                        <td style=\"font-family: var(--font-mono);\">" + item.y1.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono);\">" + item.x1.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono);\">" + item.y2.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono);\">" + item.x2.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono); color: var(--cyan-400);\">" + item.calc_y2.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono); color: var(--cyan-400);\">" + item.calc_x2.toFixed(3) + "</td>\n                        <td style=\"font-family: var(--font-mono); color: " + (item.vy >= 0 ? "#34d399" : "#f87171") + ";\">" + (item.vy >= 0 ? "+" : "") + v_1_3 + "</td>\n                        <td style=\"font-family: var(--font-mono); color: " + (item.vx >= 0 ? "#34d399" : "#f87171") + ";\">" + (item.vx >= 0 ? "+" : "") + v_2_2 + "</td>\n                        <td style=\"font-family: var(--font-mono); font-weight: 700; color: #fef08a;\">" + v_3_1 + "</td>\n                    ";
          domEl_30.appendChild(trEl);
        });
      }
      if (domEl_29) {
        domEl_29.style.display = "flex";
      }
      logMessage(t("geodesy.logHelmertSolved", { count: items_2.length, m0: (v_1_2.m0 * 100).toFixed(2), dm: v_1_2.dm_ppm.toFixed(1) }));
      showToast(t("geodesy.toastHelmertSuccess", { m0: (v_1_2.m0 * 100).toFixed(2) }), "success");
    } catch (v_1_2) {
      logMessage("❌ [HELMERT HATA] " + (v_1_2.message || v_1_2));
      showToast(t("geodesy.toastHelmertError", { err: v_1_2.message }), "error");
    }
  });
  btnEl_12?.addEventListener("click", () => {
    if (!v_6) {
      showToast(t("geodesy.toastNeedDnsOrSolveFirst"), "warning");
      return;
    }
    const v_1_1 = domEl_28?.value.trim();
    if (!v_1_1) {
      showToast(t("geodesy.toastNeedPointListToConvert"), "warning");
      return;
    }
    const v_2_1 = v_1_1.split(/\r?\n/).map(item => item.trim()).filter(item => item.length > 0);
    items_1 = [];
    if (domEl_32) {
      domEl_32.innerHTML = "";
    }
    v_2_1.forEach((item, idx) => {
      const v_1_2 = item.split(/[\s,;\t]+/).filter(Boolean);
      if (v_1_2.length >= 3) {
        const v_1_3 = v_1_2[0];
        const v_2_2 = parseFloat(v_1_2[1]);
        const v_3_1 = parseFloat(v_1_2[2]);
        const v_4_1 = v_1_2[3] ? parseFloat(v_1_2[3]) : 0;
        if (!isNaN(v_2_2) && !isNaN(v_3_1)) {
          const v_1_4 = v_1.transformPointHelmert2D(v_2_2, v_3_1, v_6);
          const obj = {
            name: v_1_3,
            y1: v_2_2,
            x1: v_3_1,
            y2: v_1_4.y,
            x2: v_1_4.x,
            z: isNaN(v_4_1) ? 0 : v_4_1
          };
          items_1.push(obj);
          if (domEl_32) {
            const trEl = document.createElement("tr");
            trEl.innerHTML = "\n                            <td style=\"font-family: var(--font-mono); color: var(--text-dim);\">" + (idx + 1) + "</td>\n                            <td><strong class=\"font-bold text-main\">" + v_1_3 + "</strong></td>\n                            <td style=\"font-family: var(--font-mono);\">" + v_2_2.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono);\">" + v_3_1.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono); font-weight: 700; color: var(--emerald-400);\">" + v_1_4.y.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono); font-weight: 700; color: var(--emerald-400);\">" + v_1_4.x.toFixed(3) + "</td>\n                            <td style=\"font-family: var(--font-mono);\">" + obj.z.toFixed(3) + "</td>\n                        ";
            domEl_32.appendChild(trEl);
          }
        }
      }
    });
    if (items_1.length > 0) {
      if (domEl_31) {
        domEl_31.style.display = "block";
      }
      showToast(t("geodesy.toastBatchHelmertConverted", { count: items_1.length }), "success");
    }
  });
  document.getElementById("btnExportHelmertNcn")?.addEventListener("click", () => {
    if (items_1.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    const pts = items_1.map(it => ({ name: it.name, y: it.y2, x: it.x2, z: it.z }));
    StudioExporter.downloadNcn("helmert_donusum_noktalari.ncn", pts);
  });
  document.getElementById("btnExportHelmertDxf")?.addEventListener("click", () => {
    if (items_1.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    const pts = items_1.map(it => ({ name: it.name, y: it.y2, x: it.x2, z: it.z }));
    StudioExporter.downloadDxf("helmert_donusum_noktalari.dxf", pts);
  });
  document.getElementById("btnExportHelmertCsv")?.addEventListener("click", () => {
    if (items_1.length === 0) return showToast(t("geodesy.toastNoPointsToExport"), "warning");
    StudioExporter.downloadCsv("helmert_donusum_noktalari.csv", items_1, ["NOKTA", "Y_KAYNAK", "X_KAYNAK", "Y_DONUSEN", "X_DONUSEN", "KOT"]);
  });
}
let tg20BatchReducedPoints = [];

/* <<<<<<<<<< [END MODULE: js/tabs/geodesyTab.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/tabs/tg20Tab.js] >>>>>>>>>> */
/**
 * Harita Tools - HGM TG-20 Geoid Height Reduction Controller
 */
function initTg20GeoidStation() {
  if (state.tg20Engine.isLoaded || state.tg20Engine.tryLoadEmbeddedModel()) {
    logMessage(t("tg20.readyLog"));
  }
  const v_1 = arg1 => {
    if (!arg1) {
      return NaN;
    }
    if (typeof arg1 === "number") {
      return arg1;
    }
    arg1 = String(arg1).trim();
    if (!isNaN(parseFloat(arg1)) && !arg1.includes(" ") && !arg1.includes(":") && !arg1.includes("°")) {
      return parseFloat(arg1);
    }
    const v_2_1 = arg1.replace(/[°'"]/g, " ").split(/[:\s]+/).filter(Boolean).map(Number);
    if (v_2_1.length >= 3) {
      const v_1_1 = v_2_1[0] < 0 ? -1 : 1;
      return (Math.abs(v_2_1[0]) + v_2_1[1] / 60 + v_2_1[2] / 3600) * v_1_1;
    } else if (v_2_1.length === 2) {
      const v_1_1 = v_2_1[0] < 0 ? -1 : 1;
      return (Math.abs(v_2_1[0]) + v_2_1[1] / 60) * v_1_1;
    } else if (v_2_1.length === 1) {
      return v_2_1[0];
    }
    return NaN;
  };
  const inputEl = document.getElementById("inputTg20Lat");
  const inputEl_1 = document.getElementById("inputTg20Lon");
  const inputEl_2 = document.getElementById("inputTg20H");
  const btnEl = document.getElementById("btnCalculateTg20Single");
  const v_2 = () => {
    if (!state.tg20Engine.isLoaded) {
      state.tg20Engine.tryLoadEmbeddedModel();
    }
    const v_1_1 = v_1(inputEl?.value);
    const v_2_1 = v_1(inputEl_1?.value);
    const v_3_1 = parseFloat(inputEl_2?.value) || 0;
    if (isNaN(v_1_1) || isNaN(v_2_1)) {
      showToast(t("tg20.toastInvalidCoords"), "warning");
      return;
    }
    const v_4 = state.tg20Engine.reduceHeight(v_1_1, v_2_1, v_3_1);
    const domEl_3 = document.getElementById("resTg20LatLon");
    const domEl_4 = document.getElementById("resTg20ElipH");
    const domEl_5 = document.getElementById("resTg20N");
    const domEl_6 = document.getElementById("resTg20OrthH");
    if (domEl_3) {
      domEl_3.textContent = v_4.lat.toFixed(6) + "° K, " + v_4.lon.toFixed(6) + "° D";
    }
    if (domEl_4) {
      domEl_4.textContent = v_3_1.toFixed(3) + " m";
    }
    if (domEl_5) {
      domEl_5.textContent = v_4.N !== null ? "" + (v_4.N >= 0 ? "+" : "") + v_4.N.toFixed(3) + " m" : t("tg20.outOfScope");
    }
    if (domEl_6) {
      domEl_6.textContent = v_4.H !== null ? v_4.H.toFixed(3) + " m" : v_3_1.toFixed(3) + " m";
    }
    if (v_4.inBounds) {
      showToast(t("tg20.toastPointReduced", { n: v_4.N.toFixed(3), h: v_4.H.toFixed(3) }), "success");
      logMessage(t("tg20.logSingleReduction", { lat: v_4.lat.toFixed(6), lon: v_4.lon.toFixed(6), h: v_3_1.toFixed(3), n: v_4.N.toFixed(3), H: v_4.H.toFixed(3) }));
    } else {
      showToast(t("tg20.toastOutOfTurkeyBounds"), "warning");
    }
  };
  document.getElementById("btnCopyTg20SingleReport")?.addEventListener("click", () => {
    const v_1_1 = v_1(inputEl?.value);
    const v_2_1 = v_1(inputEl_1?.value);
    const v_3_1 = parseFloat(inputEl_2?.value) || 0;
    const v_4 = state.tg20Engine.reduceHeight(v_1_1, v_2_1, v_3_1);
    const v_5 = t("tg20.singleReportTemplate", {
      lat: v_4.lat.toFixed(6),
      lon: v_4.lon.toFixed(6),
      h: v_3_1.toFixed(3),
      n: (v_4.N !== null ? "+" + v_4.N.toFixed(3) : "--"),
      H: (v_4.H !== null ? v_4.H.toFixed(3) : "--"),
      status: v_4.status,
      date: new Date().toLocaleDateString("tr-TR")
    });
    copyToClipboard(v_5, t("tg20.toastReportCopied"));
  });
  if (btnEl) {
    btnEl.addEventListener("click", v_2);
  }
  const btnEl_1 = document.getElementById("btnLoadTg20SamplePoints");
  const inputEl_3 = document.getElementById("fileTg20BatchInput");
  const inputEl_4 = document.getElementById("txtTg20BatchInput");
  const btnEl_2 = document.getElementById("btnProcessTg20Batch");
  const domEl = document.getElementById("wrapperTg20BatchResults");
  const domEl_1 = document.getElementById("tbodyTg20BatchResults");
  const domEl_2 = document.getElementById("lblTg20BatchSummary");
  const v_3 = async () => {
    const v_1_1 = inputEl_4?.value.trim() || "";
    if (!v_1_1) {
      showToast(t("tg20.toastNeedPoints"), "warning");
      return false;
    }
    if (!state.tg20Engine.isLoaded) {
      state.tg20Engine.tryLoadEmbeddedModel();
    }
    const v_2_1 = v_1_1.split(/\r?\n/).map(item => item.trim()).filter(item => item.length > 0 && !item.startsWith(";") && !item.startsWith("#"));
    const items = [];
    v_2_1.forEach((line, idx) => {
      const parts = line.split(/[\s,;\t]+/).filter(Boolean);
      if (parts.length < 2) return;

      let name = "P" + (idx + 1);
      let lat = NaN;
      let lon = NaN;
      let h = 0;

      if (parts.length >= 4) {
        name = parts[0];
        const val1 = v_1(parts[1]);
        const val2 = v_1(parts[2]);
        h = parseFloat(parts[3]) || 0;

        if (val1 >= 34 && val1 <= 44 && val2 >= 24 && val2 <= 46) {
          lat = val1;
          lon = val2;
        } else if (val2 >= 34 && val2 <= 44 && val1 >= 24 && val1 <= 46) {
          lat = val2;
          lon = val1;
        } else if (state.geodesyEngine && (val1 > 100000 || val2 > 100000)) {
          let y = val1, x = val2;
          if (val1 > val2) { x = val1; y = val2; }
          const approxDom = Math.round(Math.min(Math.max((y - 500000) / 100000 * 1.5 + 33, 27), 45) / 3) * 3;
          const geo = state.geodesyEngine.tmToGeographic(y, x, approxDom || 33);
          lat = geo.lat;
          lon = geo.lon;
        } else {
          lat = val1;
          lon = val2;
        }
      } else if (parts.length === 3) {
        const val0 = v_1(parts[0]);
        const val1 = v_1(parts[1]);
        const val2 = parseFloat(parts[2]) || 0;

        if (val0 >= 34 && val0 <= 44 && val1 >= 24 && val1 <= 46) {
          lat = val0;
          lon = val1;
          h = val2;
        } else if (val1 >= 34 && val1 <= 44 && parseFloat(parts[2]) >= 24 && parseFloat(parts[2]) <= 46) {
          name = parts[0];
          lat = val1;
          lon = parseFloat(parts[2]);
          h = 0;
        } else if (state.geodesyEngine && (val0 > 100000 || val1 > 100000)) {
          let y = val0, x = val1;
          if (val0 > val1) { x = val0; y = val1; }
          const approxDom = Math.round(Math.min(Math.max((y - 500000) / 100000 * 1.5 + 33, 27), 45) / 3) * 3;
          const geo = state.geodesyEngine.tmToGeographic(y, x, approxDom || 33);
          lat = geo.lat;
          lon = geo.lon;
          h = val2;
        } else {
          name = parts[0];
          lat = val1;
          lon = val2;
        }
      } else if (parts.length === 2) {
        const val0 = v_1(parts[0]);
        const val1 = v_1(parts[1]);
        if (val0 >= 34 && val0 <= 44 && val1 >= 24 && val1 <= 46) {
          lat = val0;
          lon = val1;
        } else {
          name = parts[0];
          lat = val1;
          lon = 0;
        }
      }

      if (!isNaN(lat) && !isNaN(lon)) {
        items.push({
          name: name,
          lat: lat,
          lon: lon,
          h: h
        });
      }
    });
    if (items.length === 0) {
      showToast(t("tg20.toastInvalidCoordLines"), "warning");
      return false;
    }
    tg20BatchReducedPoints = items.map(item => {
      const v_1_2 = state.tg20Engine.reduceHeight(item.lat, item.lon, item.h);
      return {
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        h: item.h,
        N: v_1_2.N,
        H: v_1_2.H,
        inBounds: v_1_2.inBounds,
        status: v_1_2.status
      };
    });
    if (domEl_1) {
      domEl_1.innerHTML = "";
    }
    tg20BatchReducedPoints.forEach((item, idx) => {
      const trEl = document.createElement("tr");
      trEl.innerHTML = `
        <td style="font-family: var(--font-mono); color: var(--text-dim); text-align: center;">${idx + 1}</td>
        <td><strong class="font-bold text-main font-mono">${item.name}</strong></td>
        <td style="font-family: var(--font-mono);">${item.lat.toFixed(6)}°</td>
        <td style="font-family: var(--font-mono);">${item.lon.toFixed(6)}°</td>
        <td style="font-family: var(--font-mono); color: var(--cyan-400); font-weight: 600;">${item.h.toFixed(3)} m</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--amber-400);">${item.N !== null ? (item.N >= 0 ? "+" : "") + item.N.toFixed(3) + " m" : "--"}</td>
        <td style="font-family: var(--font-mono); font-weight: 800; color: var(--emerald-400); font-size: 13px;">${item.H !== null ? item.H.toFixed(3) + " m" : "--"}</td>
        <td style="text-align: center;"><span class="badge ${item.inBounds ? "badge-emerald" : "badge-rose"}" style="font-size: 10px; padding: 2px 8px;">${item.inBounds ? t("tg20.statusOk") : t("tg20.outOfScope")}</span></td>
      `;
      domEl_1?.appendChild(trEl);
    });
    if (domEl) {
      domEl.classList.remove("d-none");
      domEl.style.display = "flex";
      domEl.style.flexDirection = "column";
      domEl.style.width = "100%";
    }
    if (domEl_2) {
      const v_1_2 = tg20BatchReducedPoints.filter(item => item.inBounds).length;
      const v_2_2 = v_1_2 > 0 ? (tg20BatchReducedPoints.filter(item => item.inBounds).reduce((arg1, arg2) => arg1 + arg2.N, 0) / v_1_2).toFixed(3) : "--";
      domEl_2.innerHTML = t("tg20.batchSummary", { count: tg20BatchReducedPoints.length, avgN: v_2_2 });
    }
    logMessage(t("tg20.logBatchReduced", { count: tg20BatchReducedPoints.length }));
    return true;
  };
  if (btnEl_1 && inputEl_4) {
    btnEl_1.addEventListener("click", async () => {
      inputEl_4.value = "ANKARA_KIZILAY   39.920800   32.854100   900.000\nISTANBUL_TAKSIM  41.037000   28.985000   100.000\nIZMIR_KONAK      38.419200   27.128700    50.000\nANTALYA_KALEICI  36.884100   30.705600    60.000\nTRABZON_MEYDAN   41.002700   39.716800    40.000\nDIYARBAKIR_SUR   37.914400   40.230600   650.000";
      showToast(t("tg20.toastSampleLoaded"), "info");
      await v_3();
    });
  }
  if (inputEl_3 && inputEl_4) {
    inputEl_3.addEventListener("change", async event => {
      const v_1_1 = event.target.files?.[0];
      if (v_1_1) {
        const v_1_2 = await v_1_1.text();
        inputEl_4.value = v_1_2;
        showToast(t("tg20.toastBatchLoaded", { name: v_1_1.name, size: (v_1_1.size / 1024).toFixed(1) }), "info");
        await v_3();
      }
    });
  }
  if (btnEl_2) {
    btnEl_2.addEventListener("click", async () => {
      const v_1_1 = await v_3();
      if (v_1_1) {
        showToast(t("tg20.toastBatchReduced", { count: tg20BatchReducedPoints.length }), "success");
      }
    });
  }
  document.getElementById("btnExportTg20ReportTxt")?.addEventListener("click", async () => {
    if (tg20BatchReducedPoints.length === 0) {
      const v_1_2 = await v_3();
      if (!v_1_2) {
        return;
      }
    }
    const v_1_1 = state.tg20Engine.generateReductionReport(tg20BatchReducedPoints);
    downloadTextFile("Kadastro_TG20_Kot_Indirgeme_Raporu.txt", v_1_1);
    showToast(t("tg20.toastReportDownloaded"), "success");
  });
  document.getElementById("btnExportTg20Ncn")?.addEventListener("click", async () => {
    if (tg20BatchReducedPoints.length === 0) {
      const v_1_1 = await v_3();
      if (!v_1_1) return;
    }
    const pts = tg20BatchReducedPoints.map(it => ({
      name: it.name,
      y: it.lon,
      x: it.lat,
      z: it.H !== null ? it.H : it.h
    }));
    StudioExporter.downloadNcn("Kadastro_TG20_Ortometrik.ncn", pts);
  });
  document.getElementById("btnExportTg20Csv")?.addEventListener("click", async () => {
    if (tg20BatchReducedPoints.length === 0) {
      const v_1_1 = await v_3();
      if (!v_1_1) return;
    }
    const rows = tg20BatchReducedPoints.map(it => ({
      name: it.name,
      y: it.h,
      x: it.N !== null ? it.N : 0,
      z: it.H !== null ? it.H : 0,
      lat: it.lat,
      lon: it.lon
    }));
    StudioExporter.downloadCsv("Kadastro_TG20_Ortometrik.csv", rows, ["NOKTA_ADI", "ELIPSOIT_KOTU_h", "TG20_JEOIT_N", "ORTOMETRIK_KOT_H", "ENLEM_WGS84", "BOYLAM_WGS84"]);
  });
  document.getElementById("btnPrintTg20Report")?.addEventListener("click", async () => {
    if (tg20BatchReducedPoints.length === 0) {
      const v_1_2 = await v_3();
      if (!v_1_2) {
        return;
      }
    }
    const v_1_1 = state.tg20Engine.generatePrintableReport(tg20BatchReducedPoints);
    const v_2_1 = window.open("", "_blank", "width=950,height=750");
    if (v_2_1) {
      v_2_1.document.write(v_1_1);
      v_2_1.document.close();
      logMessage(t("tg20.logPrintOpened"));
      showToast(t("tg20.toastPrintWindowOpened"), "success");
    }
  });

  // Window level helpers for map popup button actions
  window.sendTg20PointToSingle = (lat, lng) => {
    if (inputEl) inputEl.value = Number(lat).toFixed(6);
    if (inputEl_1) inputEl_1.value = Number(lng).toFixed(6);
    btnEl?.click();
    showToast(t("tg20.toastCoordsTransferred"), "success");
    document.getElementById("cardTg20SingleResult")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  window.copyTg20NVal = valStr => {
    copyToClipboard(valStr, t("tg20.toastUndulationCopied", { val: valStr }));
  };

  document.getElementById("btnSendTg20MapToSingle")?.addEventListener("click", () => {
    if (state.lastTg20QueryPoint) {
      window.sendTg20PointToSingle(state.lastTg20QueryPoint.lat, state.lastTg20QueryPoint.lng);
    } else {
      showToast(t("tg20.toastClickMapFirst"), "info");
    }
  });

  initTg20InteractiveMap();
}

function initTg20InteractiveMap() {
  const mapEl = document.getElementById("tg20MapContainer");
  if (!mapEl || typeof L === "undefined") return;

  if (state.tg20Map) {
    state.tg20Map.invalidateSize();
    return;
  }

  const { map } = createStudioMap("tg20MapContainer", {
    center: [39.0, 35.2],
    zoom: 6,
    minZoom: 5,
    maxZoom: 19,
    defaultType: "hybrid"
  });
  state.tg20Map = map;

  // Türkiye TG-20 Sınır Çerçevesi (35.5° - 42.5° N, 25.5° - 45.0° E)
  const tg20Bounds = [
    [35.5, 25.5],
    [35.5, 45.0],
    [42.5, 45.0],
    [42.5, 25.5]
  ];
  L.polygon(tg20Bounds, {
    color: "#f59e0b",
    weight: 1.5,
    dashArray: "4, 6",
    fillColor: "#f59e0b",
    fillOpacity: 0.03,
    interactive: false
  }).addTo(state.tg20Map);

  state.tg20GridLayerGroup = L.layerGroup().addTo(state.tg20Map);

  // Custom Pulsing TG-20 Icon
  const tg20Icon = L.divIcon({
    className: "tg20-leaflet-icon-wrapper",
    html: `
      <div class="tg20-pulsing-marker">
        <div class="tg20-pulsing-ring"></div>
        <div class="tg20-pulsing-core"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // Window level helper to zoom to the 1'x1' grid cell
  window.zoomToTg20Cell = () => {
    if (state.lastTg20CellBounds && state.tg20Map) {
      state.tg20Map.flyToBounds(state.lastTg20CellBounds, { padding: [100, 100], maxZoom: 15 });
      showToast(t("tg20.toastInterpolationCellZoom"), "info");
    }
  };

  // Harita Tıklama Olayı: Anlık N Ondülasyonu & 4 Düğüm Noktası Sorgulama
  state.tg20Map.on("click", async e => {
    try {
      const { lat, lng } = e.latlng;

      if (!state.tg20Engine.isLoaded) {
        state.tg20Engine.tryLoadEmbeddedModel();
      }

      state.tg20GridLayerGroup.clearLayers();
      const details = state.tg20Engine.getGeoidInterpolationDetails(lat, lng);
      state.lastTg20CellBounds = details ? details.cellBounds : null;
      state.lastTg20QueryPoint = { lat, lng, N: details ? details.interpolatedN : null };

      const hudNVal = document.getElementById("tg20HudNValue");
      const hudStatus = document.getElementById("tg20HudStatus");
      const hudLatLon = document.getElementById("tg20HudLatLon");
      const hudTmPafta = document.getElementById("tg20HudTmPafta");

      if (details && details.interpolatedN !== null) {
        const N = details.interpolatedN;
        const dom = state.gnssEngine?.geodesy?.getAutoCentralMeridian3Deg(lng) || 33;
        const tm = state.gnssEngine?.geodesy?.wgs84ToTurefTM(lat, lng, dom) || { y: 0, x: 0 };
        const zone = Math.round(dom / 3);
        const sheet25k = state.paftaEngine?.calculate25kSheet(lat, lng);
        const sheet100k = state.paftaEngine?.calculate100kSheet(lat, lng);
        const paftaName = sheet25k ? (sheet25k.sheetName + (sheet25k.regionalName ? ` (${sheet25k.regionalName})` : "")) : (sheet100k ? sheet100k.sheetName : "--");

        const nFormatted = (N >= 0 ? "+" : "") + N.toFixed(3) + " m";

        // 1. Üçgenleme (Triangulation / TIN Mesh) Görselleştirmesi
        const pNW = [details.nodes.nw.lat, details.nodes.nw.lon];
        const pNE = [details.nodes.ne.lat, details.nodes.ne.lon];
        const pSW = [details.nodes.sw.lat, details.nodes.sw.lon];
        const pSE = [details.nodes.se.lat, details.nodes.se.lon];
        const pCenter = [lat, lng];

        // 4 Adet Üçgenleme Yüzeyi (Merkez Nokta ile 4 Izgara Düğümü Arasındaki Üçgenler)
        const triangles = [
          { pts: [pCenter, pNW, pNE], color: "#06b6d4", fillOp: 0.12 }, // Kuzey Üçgeni
          { pts: [pCenter, pNE, pSE], color: "#38bdf8", fillOp: 0.10 }, // Doğu Üçgeni
          { pts: [pCenter, pSE, pSW], color: "#10b981", fillOp: 0.12 }, // Güney Üçgeni
          { pts: [pCenter, pSW, pNW], color: "#f59e0b", fillOp: 0.10 }  // Batı Üçgeni
        ];

        triangles.forEach(tri => {
          L.polygon(tri.pts, {
            color: "#0284c7",
            weight: 1.5,
            dashArray: "3, 5",
            fillColor: tri.color,
            fillOpacity: tri.fillOp,
            interactive: false
          }).addTo(state.tg20GridLayerGroup);
        });

        // Dış 1'x1' Izgara Hücresi Çerçevesi
        L.polygon(details.cellBounds, {
          color: "#06b6d4",
          weight: 2,
          dashArray: "6, 6",
          fillOpacity: 0,
          interactive: false
        }).addTo(state.tg20GridLayerGroup);

        // Merkezden 4 Köşeye Üçgenleme Radyal Işınları (Dashed Tie Lines)
        [pNW, pNE, pSW, pSE].forEach(corner => {
          L.polyline([pCenter, corner], {
            color: "#f59e0b",
            weight: 1.8,
            dashArray: "4, 4",
            opacity: 0.85,
            interactive: false
          }).addTo(state.tg20GridLayerGroup);
        });

        // 2. Etraftaki 4 Izgara Düğüm Noktasına Yanıp Sönen Pinler
        const nodeList = [details.nodes.nw, details.nodes.ne, details.nodes.sw, details.nodes.se];
        for (const node of nodeList) {
          const gridPinIcon = L.divIcon({
            className: "tg20-leaflet-icon-wrapper",
            html: `
              <div class="tg20-grid-pin" title="${t("tg20.gridNodeTooltip", { id: node.id, n: node.N.toFixed(3) })}">
                <div class="tg20-grid-pin-ring"></div>
                <div class="tg20-grid-pin-core"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          L.marker([node.lat, node.lon], { icon: gridPinIcon })
            .bindTooltip(`TG-20 ${node.id}: +${node.N.toFixed(3)} m`, { direction: "top", offset: [0, -8] })
            .addTo(state.tg20GridLayerGroup);
        }

        // HUD Bilgi Panelini Güncelle (Harita Görüşünü Kapatmayan Sabit Köşe Paneli)
        if (hudNVal) hudNVal.textContent = nFormatted;
        if (hudStatus) {
          hudStatus.textContent = t("tg20.hudInScope");
          hudStatus.className = "badge badge-emerald text-2xs";
        }
        if (hudLatLon) hudLatLon.textContent = `${lat.toFixed(6)}° K, ${lng.toFixed(6)}° D`;
        if (hudTmPafta) hudTmPafta.textContent = `Y: ${tm.y.toFixed(2)}, X: ${tm.x.toFixed(2)} (DOM ${dom}°) | Pafta: ${paftaName}`;

        // Marker Yerleştir (Popup Yok, Harita ve Üçgenler %100 Açık ve Görünür)
        if (!state.tg20MapMarker) {
          state.tg20MapMarker = L.marker([lat, lng], { icon: tg20Icon }).addTo(state.tg20Map);
        } else {
          state.tg20MapMarker.setLatLng([lat, lng]);
        }

        showToast(t("tg20.toastGridInterpolated", { n: nFormatted }), "info");
        logMessage(t("tg20.logInterpolation4Pt", {
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
          n: nFormatted,
          nwN: details.nodes.nw.N.toFixed(3),
          nwW: details.nodes.nw.weightPercent,
          neN: details.nodes.ne.N.toFixed(3),
          neW: details.nodes.ne.weightPercent,
          swN: details.nodes.sw.N.toFixed(3),
          swW: details.nodes.sw.weightPercent,
          seN: details.nodes.se.N.toFixed(3),
          seW: details.nodes.se.weightPercent
        }));
      } else {
        if (hudNVal) hudNVal.textContent = t("tg20.hudOutOfScope");
        if (hudStatus) {
          hudStatus.textContent = t("tg20.hudOutOfTurkey");
          hudStatus.className = "badge badge-rose text-2xs";
        }
        if (hudLatLon) hudLatLon.textContent = `${lat.toFixed(6)}° K, ${lng.toFixed(6)}° D`;
        if (hudTmPafta) hudTmPafta.textContent = "--";

        if (!state.tg20MapMarker) {
          state.tg20MapMarker = L.marker([lat, lng], { icon: tg20Icon }).addTo(state.tg20Map);
        } else {
          state.tg20MapMarker.setLatLng([lat, lng]);
        }

        showToast(t("tg20.toastOutOfTurkeyBounds"), "warning");
      }
    } catch (err) {
      console.error("TG-20 map click error:", err);
    }
  });

  document.getElementById("btnTg20MapResetView")?.addEventListener("click", () => {
    state.tg20Map?.flyTo([39.0, 35.2], 6, { duration: 1 });
  });

  // Window level action: transfer map point to single-point calculator & auto switch subtab
  window.sendTg20PointToSingle = (lat, lng) => {
    const inLat = document.getElementById("inputTg20Lat");
    const inLon = document.getElementById("inputTg20Lon");
    if (inLat && inLon) {
      inLat.value = Number(lat).toFixed(6);
      inLon.value = Number(lng).toFixed(6);
    }
    const btnCalc = document.getElementById("btnTg20SubtabCalc");
    if (btnCalc) btnCalc.click();

    setTimeout(() => {
      document.getElementById("btnCalculateTg20Single")?.click();
    }, 120);

    showToast(t("tg20.toastCoordsTransferred"), "success");
  };

  document.getElementById("btnSendTg20MapToSingle")?.addEventListener("click", () => {
    if (state.lastTg20QueryPoint) {
      window.sendTg20PointToSingle(state.lastTg20QueryPoint.lat, state.lastTg20QueryPoint.lng);
    } else {
      showToast(t("tg20.toastClickMapFirst"), "info");
    }
  });

  document.getElementById("btnCopyTg20HudN")?.addEventListener("click", () => {
    const nText = document.getElementById("tg20HudNValue")?.textContent?.trim();
    if (nText && nText !== "+--.--- m" && nText !== t("tg20.outOfScope")) {
      copyToClipboard(nText, t("tg20.toastUndulationCopied", { val: nText }));
    } else {
      showToast(t("tg20.toastClickMapFirst"), "info");
    }
  });

  // TG-20 Subtab Switcher
  document.querySelectorAll(".tg20-subtab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tg20-subtab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tg20-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tg20-target");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
      if (targetId === "tg20PaneMap") {
        initTg20InteractiveMap();
        setTimeout(() => {
          state.tg20Map?.invalidateSize();
        }, 150);
      }
    });
  });
}

/* <<<<<<<<<< [END MODULE: js/tabs/tg20Tab.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/tabs/flightTab.js] >>>>>>>>>> */
/**
 * Harita Tools - UAV Flight Planner & Smart GCP Station Controller
 */
function initFlightPlannerStudio() {
  if (!state.flightEngine) {
    state.flightEngine = new FlightPlannerEngine();
  }
  const mapEl = document.getElementById("flightMapContainer");
  if (!mapEl) {
    return;
  }
  if (!state.flightMap) {
    const { map } = createStudioMap("flightMapContainer", {
      center: [39, 35.2],
      zoom: 6,
      defaultType: "hybrid"
    });
    state.flightMap = map;
    state.flightOriginalLayer = L.layerGroup().addTo(state.flightMap);
    state.flightSimplifiedLayer = L.layerGroup().addTo(state.flightMap);
    state.flightRoadLayer = L.layerGroup().addTo(state.flightMap);
    state.flightTriangulationLayer = L.layerGroup().addTo(state.flightMap);
    state.flightGcpLayer = L.layerGroup().addTo(state.flightMap);
    state.isFlightMapInit = true;
    bindRoadDrawingMapEvents();

    // Mobile Map Tools Dropdown Menu Toggle
    const btnMobileMapTools = document.getElementById("btnFlightMapMenuToggle");
    const mapToolbarEl = document.getElementById("mapControlToolbar");
    const iconMapChevron = document.getElementById("iconFlightMapMenuChevron");

    if (btnMobileMapTools && mapToolbarEl) {
      btnMobileMapTools.addEventListener("click", (e) => {
        e.stopPropagation();
        mapToolbarEl.classList.toggle("mobile-open");
        const isOpen = mapToolbarEl.classList.contains("mobile-open");
        if (iconMapChevron) {
          iconMapChevron.className = isOpen ? "fa-solid fa-chevron-up text-xs text-cyan" : "fa-solid fa-chevron-down text-xs text-cyan";
        }
      });

      mapToolbarEl.querySelectorAll(".map-btn-compact").forEach(btn => {
        btn.addEventListener("click", () => {
          if (window.innerWidth <= 900) {
            mapToolbarEl.classList.remove("mobile-open");
            if (iconMapChevron) iconMapChevron.className = "fa-solid fa-chevron-down text-xs text-cyan";
          }
        });
      });

      document.addEventListener("click", (e) => {
        if (window.innerWidth <= 900 && mapToolbarEl.classList.contains("mobile-open")) {
          if (!mapToolbarEl.contains(e.target) && !btnMobileMapTools.contains(e.target)) {
            mapToolbarEl.classList.remove("mobile-open");
            if (iconMapChevron) iconMapChevron.className = "fa-solid fa-chevron-down text-xs text-cyan";
          }
        }
      });
    }

    document.getElementById("btnDrawCustomRoad")?.addEventListener("click", () => {
      startDrawingRoad();
    });
    document.getElementById("btnPanelDrawRoad")?.addEventListener("click", () => {
      startDrawingRoad();
    });
    document.getElementById("btnFinishDrawRoad")?.addEventListener("click", () => {
      finishDrawingRoad();
    });
    document.getElementById("btnCancelDrawRoad")?.addEventListener("click", () => {
      cancelDrawingRoad();
    });
    document.getElementById("btnUploadRoadFile")?.addEventListener("click", () => {
      document.getElementById("inputCustomRoadFile")?.click();
    });
    document.getElementById("inputCustomRoadFile")?.addEventListener("change", async arg1 => {
      const v_2_1 = arg1.target.files?.[0];
      if (!v_2_1) {
        return;
      }
      try {
        const v_1_1 = await state.flightEngine.parseRoadFile(v_2_1);
        renderRoadNetworkOnMap(state.flightEngine.roadWays);
        showToast(t("flight.toastExternalRoadsLoaded", { count: v_1_1.length }), "success");
        if (state.flightEngine.gcpPoints && state.flightEngine.gcpPoints.length > 0) {
          state.flightEngine.gcpPoints.forEach(item => state.flightEngine.recalculatePointRoadDistance(item, 600));
          renderGcpMarkersOnMap(state.flightEngine.gcpPoints);
          renderGcpTable(state.flightEngine.gcpPoints);
        }
      } catch (v_1_1) {
        showToast(t("flight.toastExternalRoadsError", { err: v_1_1.message }), "error");
      }
      arg1.target.value = "";
    });
    document.getElementById("btnFlightFitBounds")?.addEventListener("click", () => {
      const v_1_1 = state.flightEngine.simplifiedPolygon || state.flightEngine.originalPolygon;
      if (v_1_1 && v_1_1.length > 0) {
        const v_1_2 = v_1_1.map(item => [item.lat, item.lon]);
        state.flightMap.fitBounds(L.latLngBounds(v_1_2), {
          padding: [40, 40]
        });
      } else {
        showToast(t("flight.toastNoBoundaryInMap"), "info");
      }
    });
    document.getElementById("btnFetchRoadsNow")?.addEventListener("click", async () => {
      const v_1_1 = state.flightEngine.simplifiedPolygon || state.flightEngine.originalPolygon;
      if (!v_1_1 || v_1_1.length === 0) {
        showToast(t("flight.toastNeedKmlFirst"), "info");
        return;
      }
      const btnEl_3 = document.getElementById("btnFetchRoadsNow");
      const btnEl_4 = document.getElementById("txtRoadBtn");
      if (btnEl_4) {
        btnEl_4.textContent = t("flight.btnDownloading");
      }
      if (btnEl_3) {
        btnEl_3.disabled = true;
      }
      logMessage("🛣️ [YOL SORGUSU] OpenStreetMap sunucularından yol ağı indiriliyor...");
      try {
        const v_1_2 = await state.flightEngine.fetchRoadNetwork();
        renderRoadNetworkOnMap(v_1_2);
        showToast(t("flight.toastRoadsLoaded", { count: v_1_2.length }), "success");
        logMessage("✅ [YOL SORGUSU] " + v_1_2.length + " yol segmenti başarıyla haritaya yüklendi.");
        if (state.flightEngine.gcpPoints && state.flightEngine.gcpPoints.length > 0) {
          await generateFlightGCPs();
        }
      } catch (v_1_2) {
        console.error("Yol indirme hatası:", v_1_2);
        showToast(t("flight.toastRoadsError", { err: v_1_2.message }), "error");
      } finally {
        if (btnEl_3) {
          btnEl_3.disabled = false;
        }
      }
    });
    document.getElementById("btnToggleRoadNetwork")?.addEventListener("click", arg1 => {
      const v_2_1 = arg1.currentTarget;
      if (state.flightMap.hasLayer(state.flightRoadLayer)) {
        state.flightMap.removeLayer(state.flightRoadLayer);
        v_2_1.classList.remove("active");
        v_2_1.classList.add("inactive");
      } else {
        state.flightMap.addLayer(state.flightRoadLayer);
        v_2_1.classList.add("active");
        v_2_1.classList.remove("inactive");
      }
    });
    document.getElementById("btnToggleGcpPins")?.addEventListener("click", arg1 => {
      const v_2_1 = arg1.currentTarget;
      if (state.flightMap.hasLayer(state.flightGcpLayer)) {
        state.flightMap.removeLayer(state.flightGcpLayer);
        v_2_1.classList.remove("active");
        v_2_1.classList.add("inactive");
      } else {
        state.flightMap.addLayer(state.flightGcpLayer);
        v_2_1.classList.add("active");
        v_2_1.classList.remove("inactive");
      }
    });
    document.getElementById("btnToggleTriangles")?.addEventListener("click", arg1 => {
      const v_2_1 = arg1.currentTarget;
      if (state.flightMap.hasLayer(state.flightTriangulationLayer)) {
        state.flightMap.removeLayer(state.flightTriangulationLayer);
        v_2_1.classList.remove("active");
        v_2_1.classList.add("inactive");
      } else {
        state.flightMap.addLayer(state.flightTriangulationLayer);
        v_2_1.classList.add("active");
        v_2_1.classList.remove("inactive");
      }
    });
    const btnEl = document.getElementById("btnToggleFlightLines");
    const btnEl_1 = document.getElementById("btnToggleCorridors");
    const btnEl_2 = document.getElementById("btnToggleWaypoints");
    if (btnEl) {
      btnEl.addEventListener("click", () => {
        const v_1_1 = btnEl.classList.toggle("active");
        if (state.flightLinesLayer) {
          if (v_1_1) {
            state.flightMap.addLayer(state.flightLinesLayer);
          } else {
            state.flightMap.removeLayer(state.flightLinesLayer);
          }
        }
        if (state.flightHomeLayer) {
          if (v_1_1) {
            state.flightMap.addLayer(state.flightHomeLayer);
          } else {
            state.flightMap.removeLayer(state.flightHomeLayer);
          }
        }
      });
    }
    if (btnEl_2) {
      btnEl_2.addEventListener("click", () => {
        const v_1_1 = btnEl_2.classList.toggle("active");
        if (state.flightWaypointsLayer) {
          if (v_1_1) {
            state.flightMap.addLayer(state.flightWaypointsLayer);
          } else {
            state.flightMap.removeLayer(state.flightWaypointsLayer);
          }
        }
      });
    }
  } else {
    setTimeout(() => {
      state.flightMap.invalidateSize();
    }, 250);
  }
  const domEl = document.getElementById("flightDatePicker");
  if (domEl && !domEl.value) {
    domEl.value = new Date().toISOString().split("T")[0];
  }
  bindFlightIngestHandlers();
  bindFlightSimplificationHandlers();
  bindSolarAndWeatherHandlers();
  initDroneDatabaseUI();
  bindGcpGenerationHandlers();
  bindFlightExportHandlers();

  if (!state.flightEngine && typeof FlightPlannerEngine !== "undefined") {
    state.flightEngine = new FlightPlannerEngine();
  }
  if (state.flightEngine) {
    const defaultDate = domEl?.value || new Date().toISOString().split("T")[0];
    updateWeatherAndSolar(39.9208, 32.8541, defaultDate);
  }
}
function bindFlightIngestHandlers() {
  const inputEl = document.getElementById("inputFlightFile");
  const btnEl = document.getElementById("btnLoadDemoFlightKml");
  inputEl?.addEventListener("change", async arg1 => {
    if (!arg1.target.files || arg1.target.files.length === 0) {
      return;
    }
    const v_2 = arg1.target.files[0];
    try {
      logMessage("📂 [İHA UÇUŞ] '" + v_2.name + "' dosyası ayrıştırılıyor...");
      showToast(t("flight.toastLoadingBoundary", { name: v_2.name }), "info");
      await state.flightEngine.parsePolygonFile(v_2);
      await onFlightPolygonLoaded(v_2.name);
    } catch (v_1) {
      console.error("Uçuş sahası yükleme hatası:", v_1);
      showToast(t("flight.toastBoundaryError", { err: v_1.message }), "error");
      logMessage("⛔ [HATA] " + v_1.message);
    }
  });
  btnEl?.addEventListener("click", async () => {
    try {
      logMessage("✨ [DEMO] Gerçekçi çok kırıklı İHA uçuş sahası (Muğla/Milas Maden & Tarım Sahası) yükleniyor...");
      const v_1 = getSampleFlightKmlString();
      const v_2 = new Blob([v_1], {
        type: "application/vnd.google-earth.kml+xml"
      });
      const v_3 = new File([v_2], "Ornek_Cok_Krikli_Ucus_Sahasi.kml", {
        type: "application/vnd.google-earth.kml+xml"
      });
      await state.flightEngine.parsePolygonFile(v_3);
      await onFlightPolygonLoaded(v_3.name);
      showToast(t("flight.toastSampleLoaded"), "success");
    } catch (v_1) {
      console.error("Örnek saha yükleme hatası:", v_1);
      showToast(t("flight.toastSampleError", { err: v_1.message }), "error");
    }
  });
}
async function onFlightPolygonLoaded(arg1) {
  const v_2 = state.flightEngine.originalStats;
  const v_3 = state.flightEngine.simplifiedStats;
  const domEl = document.getElementById("kpiVertexRatio");
  const domEl_1 = document.getElementById("kpiAreaDiff");
  const domEl_2 = document.getElementById("kpiAreaDisplay");
  const domEl_3 = document.getElementById("badgeFlightSimplification");
  const statVertices = document.getElementById("statFlightVertices");
  const statPerimeter = document.getElementById("statFlightPerimeter");
  const statArea = document.getElementById("statFlightArea");
  const statGain = document.getElementById("statFlightGain");
  if (v_2 && v_3) {
    if (domEl) {
      domEl.textContent = v_2.uniqueVertexCount + " ➔ " + v_3.uniqueVertexCount + " " + t("flight.unitVertex");
    }
    if (domEl_1) {
      domEl_1.textContent = "(+%" + v_3.areaDiffPct.toFixed(1) + ")";
    }
    if (domEl_2) {
      domEl_2.textContent = t("flight.lblAreaPerimeter", { area: v_3.areaHa.toFixed(2), km2: v_3.areaKm2.toFixed(3), perimeter: Math.round(v_3.perimeterM) });
    }
    if (statVertices) {
      statVertices.textContent = v_2.uniqueVertexCount + " ➔ " + v_3.uniqueVertexCount + " " + t("flight.unitVertex");
    }
    if (statPerimeter) {
      statPerimeter.textContent = Math.round(v_3.perimeterM) + " m";
    }
    if (statArea) {
      statArea.textContent = v_3.areaHa.toFixed(2) + " ha";
    }
    const gPct = Math.round((1 - v_3.uniqueVertexCount / v_2.uniqueVertexCount) * 100);
    if (statGain) {
      statGain.textContent = "%" + gPct + " Tasarruf";
    }
    if (domEl_3) {
      domEl_3.textContent = v_3.uniqueVertexCount + " Köşe (%-" + gPct + ")";
    }
  }
  renderFlightPolygonsOnMap();
  const v_4 = state.flightEngine.simplifiedPolygon || state.flightEngine.originalPolygon;
  if (v_4 && v_4.length > 0) {
    state.flightMap.fitBounds(L.latLngBounds(v_4.map(item => [item.lat, item.lon || item.lng])), {
      padding: [40, 40]
    });
  }
  const inputEl = document.getElementById("inputFlightHeading");
  const domEl_4 = document.getElementById("sliderFlightHeading");
  if (state.flightEngine) {
    const v_1 = state.flightEngine.findOptimalLongAxisHeading();
    if (inputEl && !inputEl.dataset.customized) {
      inputEl.value = v_1;
      if (domEl_4) {
        domEl_4.value = v_1;
      }
    }
  }
  recalculatePhotogrammetry();
  try {
    logMessage("🛣️ [YOL AĞI] Saha çevresindeki OpenStreetMap yol ve patika ağı çekiliyor...");
    const v_1 = await state.flightEngine.fetchRoadNetwork();
    renderRoadNetworkOnMap(v_1);
    logMessage("✅ [YOL AĞI] " + v_1.length + " adet erişilebilir yol segmenti haritaya işlendi.");
    recalculatePhotogrammetry();
  } catch (v_1) {
    console.warn("Yol ağı çekme hatası:", v_1);
  }
  try {
    const v_1 = document.getElementById("flightDatePicker")?.value || new Date().toISOString().split("T")[0];
    const v_2_1 = v_2 ? v_2.centroid.lat : v_4[0].lat;
    const v_3_1 = v_2 ? v_2.centroid.lon : v_4[0].lon;
    await updateWeatherAndSolar(v_2_1, v_3_1, v_1);
  } catch (v_1) {
    console.warn("Hava durumu çekme hatası:", v_1);
  }
  try {
    await generateFlightGCPs();
  } catch (v_1) {
    console.warn("GCP üretim hatası:", v_1);
  }
  logMessage("✅ [İHA PLANLAMA] " + arg1 + " için uçuş sahası, koridorlar ve akıllı YKN ağı hazırlandı.");
}
function renderFlightPolygonsOnMap() {
  if (!state.flightMap) {
    return;
  }
  state.flightOriginalLayer.clearLayers();
  state.flightSimplifiedLayer.clearLayers();
  const v_1 = state.flightEngine.originalPolygon;
  const v_2 = state.flightEngine.simplifiedPolygon;
  if (v_1 && v_1.length > 0) {
    const v_1_1 = v_1.map(item => [item.lat, item.lon || item.lng]);
    const v_2_1 = L.polygon(v_1_1, {
      color: "#ef4444",
      weight: 2,
      dashArray: "5, 5",
      fillColor: "#ef4444",
      fillOpacity: 0.08
    }).bindTooltip(t("flight.tooltipOriginalBoundary"), {
      sticky: true
    });
    state.flightOriginalLayer.addLayer(v_2_1);
  }
  if (v_2 && v_2.length > 0) {
    const v_1_1 = v_2.map(item => [item.lat, item.lon || item.lng]);
    const v_2_1 = L.polygon(v_1_1, {
      color: "#00f2ff",
      weight: 3.2,
      fillColor: "#00f2ff",
      fillOpacity: 0.15
    }).bindTooltip(t("flight.tooltipOptimizedBoundary"), {
      sticky: true
    });
    state.flightSimplifiedLayer.addLayer(v_2_1);
  }
}
function bindFlightSimplificationHandlers() {
  const domEl = document.getElementById("sliderSimplification");
  const domEl_1 = document.getElementById("txtSimplificationLevel");
  const btnEl = document.getElementById("btnToggleOriginalLayer");
  const btnEl_1 = document.getElementById("btnToggleSimplifiedLayer");
  domEl?.addEventListener("input", arg1 => {
    const v_2 = parseInt(arg1.target.value, 10);
    const v_3 = v_2 / 100;
    let v_4 = "Dengeli (%" + v_2 + ")";
    if (v_2 === 0) {
      v_4 = "Ham Sınır (%0)";
    } else if (v_2 <= 25) {
      v_4 = "Hafif Düzeltme (%" + v_2 + ")";
    } else if (v_2 >= 90) {
      v_4 = "Dış Sınır Çerçevesi (%" + v_2 + ")";
    }
    if (domEl_1) {
      domEl_1.textContent = v_4;
    }
    if (state.flightEngine && state.flightEngine.originalPolygon) {
      state.flightEngine.simplify(v_3);
      const v_1 = state.flightEngine.originalStats;
      const v_2_1 = state.flightEngine.simplifiedStats;
      const domEl_2 = document.getElementById("kpiVertexRatio");
      const domEl_3 = document.getElementById("kpiAreaDiff");
      const domEl_4 = document.getElementById("kpiAreaDisplay");
      const domEl_5 = document.getElementById("badgeFlightSimplification");
      if (domEl_2 && v_1 && v_2_1) {
        domEl_2.textContent = v_1.uniqueVertexCount + " ➔ " + v_2_1.uniqueVertexCount + " " + t("flight.unitVertex");
      }
      if (domEl_3 && v_2_1) {
        domEl_3.textContent = "(+%" + v_2_1.areaDiffPct.toFixed(1) + ")";
      }
      if (domEl_4 && v_2_1) {
        domEl_4.textContent = t("flight.lblAreaPerimeter", { area: v_2_1.areaHa.toFixed(2), km2: v_2_1.areaKm2.toFixed(3), perimeter: Math.round(v_2_1.perimeterM) });
      }
      if (domEl_5 && v_1 && v_2_1) {
        const v_1_1 = Math.round((1 - v_2_1.uniqueVertexCount / Math.max(1, v_1.uniqueVertexCount)) * 100);
        domEl_5.textContent = v_2_1.uniqueVertexCount + " " + t("flight.unitVertex") + " (%-" + v_1_1 + ")";
      }
      renderFlightPolygonsOnMap();
      recalculatePhotogrammetry();
    }
  });
  btnEl?.addEventListener("click", () => {
    if (state.flightMap.hasLayer(state.flightOriginalLayer)) {
      state.flightMap.removeLayer(state.flightOriginalLayer);
      btnEl.classList.remove("btn-primary");
      btnEl.classList.add("btn-secondary");
    } else {
      state.flightMap.addLayer(state.flightOriginalLayer);
      btnEl.classList.remove("btn-secondary");
      btnEl.classList.add("btn-primary");
    }
  });
  btnEl_1?.addEventListener("click", () => {
    if (state.flightMap.hasLayer(state.flightSimplifiedLayer)) {
      state.flightMap.removeLayer(state.flightSimplifiedLayer);
      btnEl_1.classList.remove("btn-primary");
      btnEl_1.classList.add("btn-secondary");
    } else {
      state.flightMap.addLayer(state.flightSimplifiedLayer);
      btnEl_1.classList.remove("btn-secondary");
      btnEl_1.classList.add("btn-primary");
    }
  });
}
function getCardinalDirectionTr(arg1) {
  const items = ["K (Kuzey)", "KKD", "KD (Kuzeydoğu)", "DKD", "D (Doğu)", "DGD", "GD (Güneydoğu)", "GGD", "G (Güney)", "GGB", "GB (Güneybatı)", "BGB", "B (Batı)", "BKB", "KB (Kuzeybatı)", "KKB"];
  const v_2 = Math.round((arg1 % 360 + 360) % 360 / 22.5) % 16;
  return items[v_2];
}
function initFlightDatePickerBounds() {
  const v_1 = new Date();
  const v_2 = v_1.toISOString().split("T")[0];
  const v_3 = new Date(v_1.getTime() + 1296000000);
  const v_4 = v_3.toISOString().split("T")[0];
  const domEl = document.getElementById("flightDatePicker");
  if (domEl) {
    domEl.min = v_2;
    domEl.max = v_4;
    if (!domEl.value || domEl.value < v_2 || domEl.value > v_4) {
      domEl.value = v_2;
    }
  }
}
async function updateWeatherAndSolar(arg1, arg2, arg3) {
  if (!state.flightEngine) {
    return;
  }
  const v_4 = state.flightEngine.calculateSolarTrajectory(arg1, arg2, arg3);
  const domEl = document.getElementById("kpiOptimalSolarWindow");
  const domEl_1 = document.getElementById("kpiSolarDetail");
  const domEl_2 = document.getElementById("badgeSolarStatus");
  if (domEl) {
    domEl.textContent = v_4.optimalWindow;
  }
  if (domEl_1) {
    domEl_1.textContent = t("flight.lblMaxElevation", { deg: v_4.maxElevationDeg, shadow: v_4.minShadowMultiplier });
  }
  if (domEl_2) {
    domEl_2.textContent = v_4.hasSufficientSun ? t("flight.lblSunEfficient") : t("flight.lblSunLowAngle");
    domEl_2.className = v_4.hasSufficientSun ? "status-pill badge-safety-safe" : "status-pill badge-safety-warning";
  }
  if (typeof window !== "undefined" && typeof window.renderSolarTimelineBars === "function") {
    window.renderSolarTimelineBars(v_4.hourlySeries);
  }
  const v_5 = await state.flightEngine.fetchLiveWeather(arg1, arg2, arg3);
  const domEl_3 = document.getElementById("kpiWindSpeed");
  const domEl_4 = document.getElementById("kpiWindKmh");
  const domEl_5 = document.getElementById("kpiWeatherSummary");
  const domEl_6 = document.getElementById("badgeFlightSafety");
  const domEl_7 = document.getElementById("txtOptimalHeadingVal");
  if (domEl_3) {
    domEl_3.textContent = v_5.maxWindMs + " m/s";
  }
  if (domEl_4) {
    domEl_4.textContent = "(" + v_5.maxWindKmh + " km/h)";
  }
  if (domEl_5) {
    domEl_5.textContent = t("flight.lblGustPrecip", { gust: v_5.maxGustMs, precip: v_5.maxPrecipProb });
  }
  if (domEl_6) {
    domEl_6.textContent = v_5.overallBadge;
    domEl_6.className = "status-pill badge-safety-" + v_5.overallSafety;
  }
  if (domEl_7) {
    domEl_7.textContent = v_5.optimalFlightHeading || "--";
  }
  const domEl_8 = document.getElementById("hudFlightAtmosphere");
  if (domEl_8) {
    domEl_8.style.display = "block";
  }
  const v_6 = parseInt(document.getElementById("sliderToolbarFlightTime")?.value || "660", 10);
  onFlightTimeSliderChange(v_6);
}
function onFlightTimeSliderChange(arg1) {
  const domEl = document.getElementById("sliderToolbarFlightTime");
  const domEl_1 = document.getElementById("sliderSunTime");
  const domEl_2 = document.getElementById("txtToolbarFlightTime");
  const domEl_3 = document.getElementById("txtSunTimeSim");
  const domEl_4 = document.getElementById("hudLiveTimeBadge");
  const domEl_5 = document.getElementById("badgeLiveSunTime");
  if (domEl && parseInt(domEl.value, 10) !== arg1) {
    domEl.value = arg1;
  }
  if (domEl_1 && parseInt(domEl_1.value, 10) !== arg1) {
    domEl_1.value = arg1;
  }
  const v_2 = Math.floor(arg1 / 60);
  const v_3 = arg1 % 60;
  const v_4 = String(v_2).padStart(2, "0") + ":" + String(v_3).padStart(2, "0");
  if (domEl_2) {
    domEl_2.textContent = v_4;
  }
  if (domEl_3) {
    domEl_3.textContent = v_4 + " (" + (v_2 >= 11 && v_2 <= 14 ? "Öğle" : v_2 < 11 ? "Kuşluk" : "İkindi") + ")";
  }
  if (domEl_4) {
    domEl_4.textContent = v_4;
  }
  if (domEl_5) {
    domEl_5.textContent = v_4;
  }
  updateAtmosphereSimulation(arg1);
}
function updateAtmosphereSimulation(arg1) {
  if (!state.flightEngine) {
    return;
  }
  const hourDecimal = arg1 / 60;
  const currentHour = Math.floor(hourDecimal);
  const minuteFract = (arg1 % 60) / 60;

  let sunAzimuth = 145;
  let sunElevation = 45;
  let shadowMultiplier = 0.8;

  if (state.flightEngine.solarData && state.flightEngine.solarData.hourlySeries && state.flightEngine.solarData.hourlySeries.length > 0) {
    const series = state.flightEngine.solarData.hourlySeries;
    const s0 = series.find(item => Math.floor(item.hourDecimal) === currentHour) || series[0];
    const s1 = series.find(item => Math.floor(item.hourDecimal) === currentHour + 1) || s0;
    
    // Smooth angle interpolation for sun azimuth
    const diffAz = ((s1.azimuthDeg - s0.azimuthDeg + 540) % 360) - 180;
    sunAzimuth = Math.round((s0.azimuthDeg + diffAz * minuteFract + 360) % 360);
    sunElevation = Math.round(s0.elevationDeg + (s1.elevationDeg - s0.elevationDeg) * minuteFract);
    const sh0 = s0.shadowMultiplier || 0;
    const sh1 = s1.shadowMultiplier || 0;
    shadowMultiplier = Math.max(0, sh0 + (sh1 - sh0) * minuteFract);
  }

  const dialSun = document.getElementById("dialSunPointer");
  const lblSunAzimuth = document.getElementById("lblWidgetSunAzimuth");
  const lblSunElev = document.getElementById("lblWidgetSunElev");
  const lblShadowMult = document.getElementById("lblWidgetShadowMult");

  if (dialSun) {
    dialSun.style.transform = "rotate(" + sunAzimuth + "deg)";
  }
  if (lblSunAzimuth) {
    const cardDir = getCardinalDirectionTr(sunAzimuth).split(" ")[0];
    lblSunAzimuth.textContent = sunAzimuth + "° (" + cardDir + ")";
  }
  if (lblSunElev) {
    lblSunElev.textContent = sunElevation > 0 ? "(" + sunElevation + "°)" : "(Gece)";
  }
  if (lblShadowMult) {
    lblShadowMult.textContent = sunElevation > 0 ? shadowMultiplier.toFixed(1) + "x Boy" : "Gece";
  }

  let windSpeedMs = 3.5;
  let windSpeedKmh = 12.6;
  let windDir = 45;
  let gustMs = 4.8;

  let cloudPct = 15;
  let precipProb = 0;

  if (state.flightEngine.weatherData && state.flightEngine.weatherData.hours && state.flightEngine.weatherData.hours.length > 0) {
    const hours = state.flightEngine.weatherData.hours;
    const h0 = hours.find(item => item.hour === currentHour) || hours[0];
    const h1 = hours.find(item => item.hour === currentHour + 1) || h0;

    // Linear interpolation between the two hours for minute-level dynamic simulation
    const w0Ms = h0.windSpeedMs !== undefined ? h0.windSpeedMs : h0.windSpeedKmh / 3.6;
    const w1Ms = h1.windSpeedMs !== undefined ? h1.windSpeedMs : h1.windSpeedKmh / 3.6;
    windSpeedMs = w0Ms + (w1Ms - w0Ms) * minuteFract;
    windSpeedKmh = windSpeedMs * 3.6;

    const g0Ms = h0.gustMs !== undefined ? h0.gustMs : w0Ms * 1.35;
    const g1Ms = h1.gustMs !== undefined ? h1.gustMs : w1Ms * 1.35;
    gustMs = g0Ms + (g1Ms - g0Ms) * minuteFract;

    const diffDir = ((h1.windDir - h0.windDir + 540) % 360) - 180;
    windDir = Math.round((h0.windDir + diffDir * minuteFract + 360) % 360);

    const c0 = h0.cloud !== undefined ? h0.cloud : 15;
    const c1 = h1.cloud !== undefined ? h1.cloud : 15;
    cloudPct = Math.round(c0 + (c1 - c0) * minuteFract);

    const p0 = h0.precipProb !== undefined ? h0.precipProb : 0;
    const p1 = h1.precipProb !== undefined ? h1.precipProb : 0;
    precipProb = Math.round(p0 + (p1 - p0) * minuteFract);
  }

  const inputAlt = document.getElementById("inputFlightAltitude");
  const flightAlt = Math.round(state.flightEngine.currentFlightAltitudeM || (inputAlt ? parseFloat(inputAlt.value) : 100) || 100);
  
  // Power law altitude wind gradient: v(h) = v10 * (h/10)^0.14
  const altitudeWindSpeedMs = Math.max(0.5, windSpeedMs * Math.pow(Math.max(10, flightAlt) / 10, 0.14));
  const altitudeWindSpeedKmh = Math.round(altitudeWindSpeedMs * 3.6);

  const dialWind = document.getElementById("dialWindPointer");
  const lblAlt = document.getElementById("lblWidgetFlightAlt");
  const lblWindSpeed = document.getElementById("lblWidgetWindSpeed");
  const lblWindDir = document.getElementById("lblWidgetWindDir");
  const lblWindSafety = document.getElementById("lblWidgetWindSafety");
  const txtSource = document.getElementById("txtWeatherDataSource");

  const lblCloudCover = document.getElementById("lblWidgetCloudCover");
  const lblCloudDesc = document.getElementById("lblWidgetCloudDesc");
  const lblLightCond = document.getElementById("lblWidgetLightCondition");
  const iconCloud = document.getElementById("iconWidgetCloud");

  if (dialWind) {
    dialWind.style.transform = "rotate(" + windDir + "deg)";
  }
  if (lblAlt) {
    lblAlt.textContent = flightAlt + "m";
  }
  if (lblWindSpeed) {
    lblWindSpeed.textContent = altitudeWindSpeedMs.toFixed(1) + " m/s (" + altitudeWindSpeedKmh + " km/sa)";
  }
  if (lblWindDir) {
    const cardDir = getCardinalDirectionTr(windDir).split(" ")[0];
    lblWindDir.textContent = windDir + "° (" + cardDir + ")";
  }
  if (lblWindSafety) {
    if (altitudeWindSpeedMs <= 6.5) {
      lblWindSafety.textContent = t("flight.lblWindCalm");
      lblWindSafety.style.color = "var(--emerald-400)";
    } else if (altitudeWindSpeedMs <= 10.5) {
      lblWindSafety.textContent = t("flight.lblWindModerate");
      lblWindSafety.style.color = "var(--amber-400)";
    } else {
      lblWindSafety.textContent = t("flight.lblWindRisky");
      lblWindSafety.style.color = "#ef4444";
    }
  }

  // Cloud and Lighting Quality Updates
  if (lblCloudCover) {
    lblCloudCover.textContent = "%" + cloudPct;
  }
  if (lblCloudDesc) {
    if (cloudPct <= 15) lblCloudDesc.textContent = t("flight.lblCloudClear");
    else if (cloudPct <= 45) lblCloudDesc.textContent = t("flight.lblCloudFew");
    else if (cloudPct <= 75) lblCloudDesc.textContent = t("flight.lblCloudScattered");
    else lblCloudDesc.textContent = t("flight.lblCloudOvercast");
  }
  if (iconCloud) {
    if (precipProb > 40) {
      iconCloud.className = "fa-solid fa-cloud-showers-heavy text-rose";
    } else if (cloudPct <= 20) {
      iconCloud.className = "fa-solid fa-sun text-amber";
    } else if (cloudPct <= 50) {
      iconCloud.className = "fa-solid fa-cloud-sun text-sky";
    } else if (cloudPct <= 80) {
      iconCloud.className = "fa-solid fa-cloud-sun text-dim";
    } else {
      iconCloud.className = "fa-solid fa-cloud text-dim";
    }
  }
  if (lblLightCond) {
    if (precipProb > 40) {
      lblLightCond.textContent = t("flight.lblLightPrecipRisk");
      lblLightCond.style.color = "#ef4444";
    } else if (cloudPct <= 25) {
      lblLightCond.textContent = t("flight.lblLightSunny");
      lblLightCond.style.color = "var(--emerald-400)";
    } else if (cloudPct <= 60) {
      lblLightCond.textContent = t("flight.lblLightBalanced");
      lblLightCond.style.color = "var(--emerald-400)";
    } else if (cloudPct <= 85) {
      lblLightCond.textContent = t("flight.lblLightVariable");
      lblLightCond.style.color = "var(--amber-400)";
    } else {
      lblLightCond.textContent = t("flight.lblLightDiffuse");
      lblLightCond.style.color = "var(--text-dim)";
    }
  }

  if (txtSource && state.flightEngine.weatherData) {
    txtSource.textContent = state.flightEngine.weatherData.isLive ? "Canlı ECMWF" : "Simülasyon Modeli";
  }

  // Real-time cross-wind optimal heading
  const domHeadingVal = document.getElementById("txtOptimalHeadingVal");
  if (domHeadingVal) {
    const cross1 = (windDir + 90) % 360;
    const cross2 = (windDir + 270) % 360;
    domHeadingVal.textContent = cross1 + "° / " + cross2 + "° (Rüzgara Dik)";
  }

  const domEl_9 = document.getElementById("txtSimSunElev");
  const domEl_10 = document.getElementById("txtSimShadowMult");
  if (domEl_9) {
    domEl_9.textContent = sunElevation + "°";
  }
  if (domEl_10) {
    domEl_10.textContent = sunElevation > 0 ? shadowMultiplier.toFixed(1) + "x" : "Gece";
  }
}
function bindSolarAndWeatherHandlers() {
  initFlightDatePickerBounds();
  const domEl = document.getElementById("sliderToolbarFlightTime");
  const domEl_1 = document.getElementById("sliderSunTime");
  const domEl_2 = document.getElementById("flightDatePicker");
  domEl?.addEventListener("input", arg1 => {
    onFlightTimeSliderChange(parseInt(arg1.target.value, 10));
  });
  domEl_1?.addEventListener("input", arg1 => {
    onFlightTimeSliderChange(parseInt(arg1.target.value, 10));
  });
  domEl_2?.addEventListener("change", async arg1 => {
    const v_2 = arg1.target.value;
    const v_3 = state.flightEngine.simplifiedStats || state.flightEngine.originalStats;
    const lat = v_3 ? v_3.centroid.lat : 39.9208;
    const lon = v_3 ? v_3.centroid.lon : 32.8541;
    showToast(t("flight.toastWeatherFetching", { date: v_2 }), "info");
    await updateWeatherAndSolar(lat, lon, v_2);
    showToast(t("flight.toastWeatherLoaded", { date: v_2 }), "success");
  });
}
function initDroneDatabaseUI() {
  if (!window.DroneDatabase) {
    return;
  }
  window.refreshDroneDatabaseUI = initDroneDatabaseUI;
  const domEl = document.getElementById("selectDroneModel");
  const domEl_1 = document.getElementById("selectDroneCamera");
  const domEl_2 = document.getElementById("badgeDroneType");
  const domEl_3 = document.getElementById("badgeSensorType");
  const inputEl = document.getElementById("inputFlightSpeed");
  const inputEl_1 = document.getElementById("inputSafeBatteryDuration");
  const domEl_4 = document.getElementById("lblDroneSpeedLimitBadge");
  const domEl_5 = document.getElementById("sliderFlightHeading");
  const inputEl_2 = document.getElementById("inputFlightHeading");
  if (!domEl || !domEl_1) {
    return;
  }
  const v_1 = domEl.value;
  const v_2 = window.DroneDatabase.getDrones();
  domEl.innerHTML = "";
  const v_3 = v_2.filter(item => item.brand === "DJI");
  const v_4 = v_2.filter(item => item.brand === "Quantum Systems" || item.brand === "Wingtra");
  const v_5 = v_2.filter(item => item.brand !== "DJI" && item.brand !== "Quantum Systems" && item.brand !== "Wingtra");
  const v_6 = (arg1, arg2) => {
    if (arg2.length === 0) {
      return;
    }
    const optgroupEl = document.createElement("optgroup");
    optgroupEl.label = arg1;
    arg2.forEach(item => {
      const optionEl = document.createElement("option");
      optionEl.value = item.id;
      optionEl.textContent = item.model;
      optgroupEl.appendChild(optionEl);
    });
    domEl.appendChild(optgroupEl);
  };
  v_6("DJI Enterprise & RTK Serisi", v_3);
  v_6("VTOL / Sabit Kanat Haritalama İHA’ları", v_4);
  v_6("Diğer / Özel Platformlar", v_5);
  if (v_1 && v_2.some(item => item.id === v_1)) {
    domEl.value = v_1;
  } else {
    domEl.value = "dji_m3e";
  }
  function v_7(arg1) {
    if (!domEl_4 || !arg1) {
      return;
    }
    const v_2_1 = parseFloat(inputEl?.value || arg1.defaultSpeedMs);
    const v_3_1 = arg1.maxSpeedMs || 15;
    const v_4_1 = arg1.maxSpeedKmh || (v_3_1 * 3.6).toFixed(1);
    const v_5_1 = arg1.defaultSpeedMs || 12;
    const v_6_1 = arg1.windResistanceMs || 12;
    const v_7_1 = state.flightEngine ? state.flightEngine.flightParams : null;
    const v_8_1 = v_7_1 ? v_7_1.isTriggerSpeedSafe !== false : true;
    if (v_2_1 > v_3_1) {
      domEl_4.innerHTML = `
        <div class="flight-telemetry-chip" style="grid-column: 1 / -1; border-color: rgba(239, 68, 68, 0.5); background: rgba(239, 68, 68, 0.12);">
          <span style="color: #f87171;">⚠️ UYARI</span>
          <strong style="color: #ef4444;">Otonom Görev Sınırı Aşıldı! (Maks: ${v_3_1} m/s / ${v_4_1} km/h)</strong>
        </div>`;
    } else if (!v_8_1) {
      domEl_4.innerHTML = `
        <div class="flight-telemetry-chip" style="grid-column: 1 / -1; border-color: rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.12);">
          <span style="color: #fbbf24;">⚠️ DİKKAT</span>
          <strong style="color: #f59e0b;">Deklanşör Gecikmesi! Bu irtifada ${v_2_1} m/s hızda fotoğraf atlayabilir</strong>
        </div>`;
    } else {
      domEl_4.innerHTML = `
        <div class="flight-telemetry-chip">
          <span>Otonom Maks</span>
          <strong class="text-cyan">${v_3_1} m/s</strong>
        </div>
        <div class="flight-telemetry-chip">
          <span>Önerilen Hız</span>
          <strong class="text-emerald">${v_5_1} m/s</strong>
        </div>
        <div class="flight-telemetry-chip">
          <span>Rüzgar Direnci</span>
          <strong class="text-amber">${v_6_1} m/s</strong>
        </div>`;
    }
  }
  function v_8(arg1 = null) {
    const v_2_1 = domEl.value;
    const v_3_1 = window.DroneDatabase.getDrone(v_2_1);
    if (domEl_2 && v_3_1) {
      domEl_2.textContent = v_3_1.type || "İHA";
    }
    if (v_3_1) {
      if (inputEl) {
        inputEl.max = v_3_1.maxSpeedMs || 15;
        inputEl.min = v_3_1.minSpeedMs || 1;
        if (!inputEl.dataset.customized) {
          inputEl.value = v_3_1.defaultSpeedMs || 12;
        }
      }
      if (inputEl_1 && !inputEl_1.dataset.customized) {
        inputEl_1.value = v_3_1.safeFlightTimeMin || 32;
      }
      v_7(v_3_1);
    }
    const v_4_1 = window.DroneDatabase.getCamerasForDrone(v_2_1);
    domEl_1.innerHTML = "";
    v_4_1.forEach(item => {
      const optionEl = document.createElement("option");
      optionEl.value = item.id;
      optionEl.textContent = "" + item.name;
      domEl_1.appendChild(optionEl);
    });
    if (arg1 && v_4_1.some(item => item.id === arg1)) {
      domEl_1.value = arg1;
    } else if (v_4_1.length > 0) {
      domEl_1.value = v_4_1[0].id;
    }
    v_9();
    v_10();
    recalculatePhotogrammetry();
  }
  function v_9() {
    const v_1_1 = domEl_1.value;
    const v_2_1 = window.DroneDatabase.getCamera(v_1_1);
    const inputEl_5 = document.getElementById("inputFlightAltitude");
    const inputEl_6 = document.getElementById("inputTargetGsd");
    if (!v_2_1 || !inputEl_5 || !inputEl_6) {
      return;
    }
    const v_3_1 = v_2_1.sensorW || v_2_1.sensorWidthMm || 17.3;
    const v_4_1 = v_2_1.imageW || v_2_1.imageWidthPx || 5280;
    const v_5_1 = v_2_1.pixelSizeUm || v_3_1 / v_4_1 * 1000 || 3.3;
    const v_6_1 = v_2_1.focalMm || v_2_1.focalLengthMm || 12.3;
    if (inputEl_5.value && parseFloat(inputEl_5.value) > 0) {
      const v_1_2 = parseFloat(inputEl_5.value);
      const v_2_2 = v_1_2 * (v_5_1 / 1000) / v_6_1 * 100;
      inputEl_6.value = v_2_2.toFixed(2);
    } else if (inputEl_6.value && parseFloat(inputEl_6.value) > 0) {
      const v_1_2 = parseFloat(inputEl_6.value);
      const v_2_2 = v_1_2 / 100 * v_6_1 / (v_5_1 / 1000);
      inputEl_5.value = v_2_2.toFixed(1);
    }
  }
  function v_10() {
    const v_1_1 = domEl_1.value;
    const v_2_1 = window.DroneDatabase.getCamera(v_1_1);
    if (domEl_3 && v_2_1) {
      domEl_3.textContent = v_2_1.megapixels + "MP (" + (v_2_1.focalLengthMm || v_2_1.focalMm) + "mm)";
    }
  }
  domEl.addEventListener("change", () => {
    if (inputEl) {
      delete inputEl.dataset.customized;
    }
    if (inputEl_1) {
      delete inputEl_1.dataset.customized;
    }
    v_8();
  });
  domEl_1.addEventListener("change", () => {
    v_9();
    v_10();
    recalculatePhotogrammetry();
  });
  inputEl?.addEventListener("input", () => {
    inputEl.dataset.customized = "true";
    const v_1_1 = window.DroneDatabase.getDrone(domEl.value);
    if (v_1_1) {
      v_7(v_1_1);
    }
    recalculatePhotogrammetry();
  });
  inputEl_1?.addEventListener("input", () => {
    inputEl_1.dataset.customized = "true";
    recalculatePhotogrammetry();
  });
  const inputEl_3 = document.getElementById("inputFlightAltitude");
  const inputEl_4 = document.getElementById("inputTargetGsd");
  let v_11 = null;
  const v_12 = (arg1 = 100) => {
    clearTimeout(v_11);
    v_11 = setTimeout(() => {
      recalculatePhotogrammetry();
    }, arg1);
  };
  inputEl_3?.addEventListener("input", () => {
    inputEl_3.dataset.customized = "true";
    delete inputEl_4?.dataset.customized;
    const v_1_1 = domEl_1.value;
    const v_2_1 = window.DroneDatabase ? window.DroneDatabase.getCamera(v_1_1) : null;
    const v_3_1 = parseFloat(inputEl_3.value);
    if (v_2_1 && inputEl_4 && !isNaN(v_3_1) && v_3_1 > 0) {
      const v_1_2 = v_2_1.sensorW || v_2_1.sensorWidthMm || 17.3;
      const v_2_2 = v_2_1.imageW || v_2_1.imageWidthPx || 5280;
      const v_3_2 = v_2_1.pixelSizeUm || v_1_2 / v_2_2 * 1000 || 3.3;
      const v_4_1 = v_2_1.focalMm || v_2_1.focalLengthMm || 12.3;
      const v_5_1 = v_3_1 * (v_3_2 / 1000) / v_4_1 * 100;
      inputEl_4.value = v_5_1.toFixed(2);
    }
    v_12();
  });
  inputEl_4?.addEventListener("input", () => {
    inputEl_4.dataset.customized = "true";
    delete inputEl_3?.dataset.customized;
    const v_1_1 = domEl_1.value;
    const v_2_1 = window.DroneDatabase ? window.DroneDatabase.getCamera(v_1_1) : null;
    const v_3_1 = parseFloat(inputEl_4.value);
    if (v_2_1 && inputEl_3 && !isNaN(v_3_1) && v_3_1 > 0) {
      const v_1_2 = v_2_1.sensorW || v_2_1.sensorWidthMm || 17.3;
      const v_2_2 = v_2_1.imageW || v_2_1.imageWidthPx || 5280;
      const v_3_2 = v_2_1.pixelSizeUm || v_1_2 / v_2_2 * 1000 || 3.3;
      const v_4_1 = v_2_1.focalMm || v_2_1.focalLengthMm || 12.3;
      const v_5_1 = v_3_1 / 100 * v_4_1 / (v_3_2 / 1000);
      inputEl_3.value = v_5_1.toFixed(1);
    }
    v_12();
  });
  ["inputForwardOverlap", "inputSideOverlap", "inputFlightSpeed", "inputSafeBatteryDuration"].forEach(item => {
    document.getElementById(item)?.addEventListener("input", () => {
      v_12(100);
    });
  });
  if (domEl_5 && inputEl_2) {
    domEl_5.addEventListener("input", () => {
      inputEl_2.value = domEl_5.value;
      inputEl_2.dataset.customized = "true";
      recalculatePhotogrammetry();
    });
    inputEl_2.addEventListener("input", () => {
      domEl_5.value = inputEl_2.value;
      inputEl_2.dataset.customized = "true";
      recalculatePhotogrammetry();
    });
  }
  document.getElementById("btnAutoOptimalHeading")?.addEventListener("click", () => {
    if (!state.flightEngine) {
      return;
    }
    const v_1_1 = state.flightEngine.findOptimalLongAxisHeading();
    if (domEl_5) {
      domEl_5.value = v_1_1;
    }
    if (inputEl_2) {
      inputEl_2.value = v_1_1;
      inputEl_2.dataset.customized = "true";
    }
    recalculatePhotogrammetry();
    showToast(t("flight.toastHeadingOptimal", { heading: v_1_1 }), "info");
  });
  document.getElementById("btnWindAlignHeading")?.addEventListener("click", () => {
    if (!state.flightEngine) {
      return;
    }
    const curTime = parseInt(document.getElementById("sliderToolbarFlightTime")?.value || "660", 10);
    const curHour = Math.floor(curTime / 60);
    const minuteFract = (curTime % 60) / 60;
    let windDir = 45;
    if (state.flightEngine.weatherData && state.flightEngine.weatherData.hours && state.flightEngine.weatherData.hours.length > 0) {
      const hours = state.flightEngine.weatherData.hours;
      const h0 = hours.find(item => item.hour === curHour) || hours[0];
      const h1 = hours.find(item => item.hour === curHour + 1) || h0;
      const diffDir = ((h1.windDir - h0.windDir + 540) % 360) - 180;
      windDir = Math.round((h0.windDir + diffDir * minuteFract + 360) % 360);
    }
    const crossWindHeading = (windDir + 90) % 360;
    if (domEl_5) {
      domEl_5.value = crossWindHeading;
    }
    if (inputEl_2) {
      inputEl_2.value = crossWindHeading;
      inputEl_2.dataset.customized = "true";
    }
    recalculatePhotogrammetry();
    showToast(t("flight.toastHeadingCrosswind", { windDir: windDir, heading: crossWindHeading }), "info");
  });
  v_8();
}
function recalculatePhotogrammetry() {
  if (!state.flightEngine) {
    if (typeof FlightPlannerEngine !== "undefined") {
      state.flightEngine = new FlightPlannerEngine();
    } else {
      return;
    }
  }
  const v_1 = document.getElementById("selectDroneModel")?.value || "dji_m3e";
  const v_2 = document.getElementById("selectDroneCamera")?.value || "m3e_built_in";
  const inputEl = document.getElementById("inputFlightAltitude");
  const inputEl_1 = document.getElementById("inputTargetGsd");
  const v_3 = inputEl?.dataset.customized === "true";
  const v_4 = parseFloat(inputEl_1?.value) || 2.5;
  const v_5 = parseFloat(inputEl?.value) || 93.2;
  const v_6 = parseFloat(document.getElementById("inputForwardOverlap")?.value) || 80;
  const v_7 = parseFloat(document.getElementById("inputSideOverlap")?.value) || 70;
  const v_8 = parseFloat(document.getElementById("inputFlightSpeed")?.value) || 12;
  const v_9 = parseFloat(document.getElementById("inputSafeBatteryDuration")?.value) || 32;
  const v_10 = parseFloat(document.getElementById("inputFlightHeading")?.value) || 0;
  const domEl = document.getElementById("sliderSimplification");
  const v_11 = domEl ? parseInt(domEl.value, 10) / 100 : 0.5;
  const v_12 = state.flightEngine.generatePhotogrammetryGrid({
    headingDeg: v_10,
    droneKey: v_1,
    cameraKey: v_2,
    targetGsdCm: v_3 ? null : v_4,
    flightAltitudeM: v_3 ? v_5 : null,
    forwardOverlapPct: v_6,
    sideOverlapPct: v_7,
    flightSpeedMs: v_8,
    batteryDurationMin: v_9
  });
  const v_13 = state.flightEngine.flightParams || {};
  state.flightEngine.currentFlightAltitudeM = v_12 ? v_12.flightAltitudeM : v_13.flightAltitudeM || 90;
  if (v_12) {
    if (!v_3 && inputEl && document.activeElement !== inputEl) {
      inputEl.value = v_12.flightAltitudeM;
    } else if (v_3 && inputEl_1 && document.activeElement !== inputEl_1) {
      inputEl_1.value = v_13.targetGsdCm ? v_13.targetGsdCm.toFixed(2) : v_4;
    }
  }
  const domEl_1 = document.getElementById("resCalcAltitude");
  const domEl_2 = document.getElementById("resCalcGridLines");
  const domEl_3 = document.getElementById("resCalcPathLength");
  const domEl_4 = document.getElementById("resCalcPhotos");
  const domEl_5 = document.getElementById("resCalcDuration");
  const domEl_6 = document.getElementById("txtFlightHeadingVal");
  const v_14 = v_12 ? v_12.flightAltitudeM : v_13.flightAltitudeM || v_5;
  const v_15 = v_13.targetGsdCm || v_4;
  const v_16 = v_12 ? v_12.totalLinesCount : v_13.numberOfLines;
  const v_17 = v_12 ? v_12.lineSpacingM : v_13.lineSpacingSideM;
  const v_18 = v_12 ? v_12.groundWidthM : v_13.groundWidthM;
  if (domEl_1) {
    domEl_1.textContent = v_14 + " m AGL (" + Math.round(v_14 * 3.28084) + " ft) | GSD: " + v_15.toFixed(2) + " cm";
  }
  if (domEl_6) {
    domEl_6.textContent = v_10 + "°";
  }
  if (v_12) {
    if (domEl_2) {
      domEl_2.textContent = v_12.totalLinesCount + " Hat (Aralık: " + v_12.lineSpacingM + "m | Kapsama: " + v_12.groundWidthM + "m)";
    }
    if (domEl_3) {
      domEl_3.textContent = v_12.totalDistanceKm + " km (" + v_12.totalLinesCount + " Hat)";
    }
    if (domEl_4) {
      const v_1_1 = !v_13.isTriggerSpeedSafe ? " ⚠️ (Aşırı Hız)" : "";
      domEl_4.textContent = v_12.totalPhotosCount + " Tetikleme (~" + (v_13.triggerIntervalS || 1.5) + " sn)" + v_1_1;
      domEl_4.style.color = v_13.isTriggerSpeedSafe !== false ? "#fff" : "#ef4444";
    }
    if (domEl_5) {
      domEl_5.textContent = v_12.flightDurationMin + " Dk (" + v_12.batteryPacks + " Batarya Seti)";
      domEl_5.style.color = v_12.batteryPacks === 1 ? "var(--emerald-400)" : v_12.batteryPacks <= 2 ? "var(--amber-400)" : "#ef4444";
    }
    if (typeof renderFlightGridOnMap === "function") {
      renderFlightGridOnMap(v_12);
    }
  } else {
    if (domEl_2) {
      domEl_2.textContent = v_16 ? "Tahmini ~" + v_16 + " Hat (Aralık: " + v_17 + "m)" : "Saha Bekleniyor";
    }
    if (domEl_3) {
      domEl_3.textContent = t("flight.badgeBoundaryWaiting");
    }
    if (domEl_4) {
      const v_1_1 = !v_13.isTriggerSpeedSafe ? " ⚠️ (Aşırı Hız)" : "";
      domEl_4.textContent = "~" + (v_13.triggerIntervalS || 1.5) + " sn / Tetikleme" + v_1_1;
      domEl_4.style.color = v_13.isTriggerSpeedSafe !== false ? "#fff" : "#ef4444";
    }
    if (domEl_5) {
      domEl_5.textContent = "~" + (v_13.effectiveBatteryMin || 32) + " Dk / Batarya";
      domEl_5.style.color = "var(--emerald-400)";
    }
  }
  try {
    const v_1_1 = parseInt(document.getElementById("sliderToolbarFlightTime")?.value || "660", 10);
    if (typeof updateAtmosphereSimulation === "function") {
      updateAtmosphereSimulation(v_1_1);
    }
  } catch (v_1_1) {}
}
function bindGcpGenerationHandlers() {
  const btnEl = document.getElementById("btnGenerateGCPs");
  btnEl?.addEventListener("click", async () => {
    await generateFlightGCPs();
  });
  const domEl = document.getElementById("filterGcpSearch");
  domEl?.addEventListener("input", arg1 => {
    const v_2 = arg1.target.value.toLowerCase().trim();
    filterGcpTable(v_2);
  });

  const chkSnap = document.getElementById("chkSnapToRoads");
  const inputSnapRadius = document.getElementById("inputSnapMaxRadius");
  const statSnapEl = document.getElementById("statSnapDistance");
  const inputMaxDist = document.getElementById("inputMaxGcpDistance");
  const statTriEl = document.getElementById("statTriangleSpacing");

  const updateGcpStatChips = () => {
    if (chkSnap && inputSnapRadius && statSnapEl) {
      if (!chkSnap.checked) {
        inputSnapRadius.disabled = true;
        inputSnapRadius.style.opacity = "0.45";
        statSnapEl.textContent = t("flight.lblSnapGridOff");
      } else {
        inputSnapRadius.disabled = false;
        inputSnapRadius.style.opacity = "1";
        const val = parseFloat(inputSnapRadius.value) || 300;
        statSnapEl.textContent = t("flight.lblSnapMax", { val: val });
      }
    }
    if (inputMaxDist && statTriEl) {
      const dist = parseFloat(inputMaxDist.value) || 1000;
      statTriEl.textContent = `~${dist} m`;
    }
  };

  chkSnap?.addEventListener("change", updateGcpStatChips);
  inputSnapRadius?.addEventListener("input", updateGcpStatChips);
  inputMaxDist?.addEventListener("input", updateGcpStatChips);
  updateGcpStatChips();
}
async function generateFlightGCPs() {
  if (!state.flightEngine || !state.flightEngine.simplifiedPolygon && !state.flightEngine.originalPolygon) {
    showToast(t("flight.toastNeedKmlFirst"), "warning");
    return;
  }
  const v_1 = parseFloat(document.getElementById("inputMaxGcpDistance")?.value) || 1000;
  const v_2 = parseFloat(document.getElementById("inputInwardOffset")?.value) || 100;
  const v_3 = parseFloat(document.getElementById("selectGcpRatio")?.value) || 0.75;
  const v_4 = document.getElementById("chkSnapToRoads")?.checked ?? true;
  const snapRadius = parseFloat(document.getElementById("inputSnapMaxRadius")?.value) || 300;

  showToast(t("flight.toastGcpGenerating"), "info");
  logMessage("⏳ [YKN ÜRETECİ] Maks Aralık: " + v_1 + "m, Yol Snap: " + (v_4 ? `Açık (${snapRadius}m)` : "Kapalı") + "...");
  try {
    const v_1_1 = await state.flightEngine.generateSmartGCPs({
      maxDistanceMeters: v_1,
      inwardOffsetMeters: v_2,
      yknRatio: v_3,
      snapToRoads: v_4,
      snapMaxRadiusM: snapRadius,
      geodesyEngine: state.geodesyEngine,
      tg20Engine: state.tg20Engine
    });
    const v_2_1 = v_1_1.filter(item => item.type === "YKN").length;
    const v_3_1 = v_1_1.filter(item => item.type === "DN").length;
    const v_4_1 = v_1_1.filter(item => item.isRoadSnapped).length;
    const v_5 = v_1_1.length > 0 ? Math.round(v_4_1 / v_1_1.length * 100) : 0;
    const kpiCountEl = document.getElementById("kpiGcpCount");
    const kpiDistEl = document.getElementById("kpiGcpDistance");
    const badgeSnapEl = document.getElementById("badgeGcpRoadSnap");
    if (kpiCountEl) kpiCountEl.textContent = v_2_1 + " YKN + " + v_3_1 + " DN";
    if (kpiDistEl) kpiDistEl.textContent = t("flight.lblMaxRoadSide", { dist: v_1, pct: v_5 });
    if (badgeSnapEl) badgeSnapEl.textContent = v_4 ? t("flight.lblRoadSnap", { pct: v_5 }) : t("flight.lblDirectGrid");
    const targetGcpEl = document.getElementById("statTargetGcpCount");
    const targetChkEl = document.getElementById("statTargetChkCount");
    const triSpacingEl = document.getElementById("statTriangleSpacing");
    const statSnapDistance = document.getElementById("statSnapDistance");
    if (targetGcpEl) targetGcpEl.textContent = v_2_1 + " YKN";
    if (targetChkEl) targetChkEl.textContent = v_3_1 + " DN";
    if (triSpacingEl) triSpacingEl.textContent = "~" + Math.round(v_1) + " m";
    if (statSnapDistance) statSnapDistance.textContent = v_4 ? t("flight.lblSnapMax", { val: snapRadius }) : t("flight.lblSnapOff");
    renderGcpMarkersOnMap(v_1_1);
    renderRoadNetworkOnMap(state.flightEngine.roadWays);
    renderGcpTable(v_1_1);
    showToast(t("flight.toastGcpSuccess", { count: v_1_1.length, ykn: v_2_1, dn: v_3_1 }), "success");
    logMessage("🎯 [YKN TAMAMLANDI] " + v_2_1 + " YKN ve " + v_3_1 + " Denetim Noktası (DN) TG-20 kotlarıyla hesaplandı.");
  } catch (v_1_1) {
    console.error("YKN üretim hatası:", v_1_1);
    showToast(t("flight.toastGcpError", { err: v_1_1.message }), "error");
  }
}
function buildGcpPopupContent(arg1) {
  const v_2 = arg1.type === "YKN";
  const v_3 = arg1.roadDistM !== null ? "<div style=\"margin-top: 4px; color: #0284c7; font-weight: 600;\">\n            <i class=\"fa-solid fa-road\"></i> " + arg1.status + "\n         </div>" : "<div style=\"margin-top: 4px; color: #64748b; font-weight: 600;\">\n            <i class=\"fa-solid fa-mountain\"></i> Açık Arazi\n         </div>";
  return "\n        <div style=\"font-family: var(--font-sans); font-size: 12px; line-height: 1.5; color: #0f172a; min-width: 230px;\">\n            <div style=\"font-weight: 800; font-size: 14px; margin-bottom: 4px; color: " + (v_2 ? "#059669" : "#d97706") + ";\">\n                " + arg1.name + " <span style=\"font-size: 11px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;\">" + (arg1.type === "YKN" ? "Yer Kontrol Noktası" : "Denetim Noktası (DN)") + "</span>\n            </div>\n            <hr style=\"margin: 4px 0; border: none; border-top: 1px solid #cbd5e1;\"/>\n            <div><strong>WGS-84 (Enlem/Boylam):</strong></div>\n            <div style=\"font-family: var(--font-mono); font-size: 11px; color: #334155;\">\n                " + arg1.lat.toFixed(7) + "°, " + arg1.lon.toFixed(7) + "°\n            </div>\n            <div style=\"margin-top: 3px;\"><strong>ITRF-96 TM 3° (DOM " + arg1.dom + "°):</strong></div>\n            <div style=\"font-family: var(--font-mono); font-size: 11.5px; font-weight: 700; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; margin: 3px 0; color: #0369a1;\">\n                Y: " + arg1.itrfY.toFixed(3) + "<br/>X: " + arg1.itrfX.toFixed(3) + "\n            </div>\n            " + v_3 + "\n            <div style=\"margin-top: 6px; font-size: 10.5px; color: #64748b; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 3px;\">\n                💡 Noktayı fareyle sürükleyerek istediğiniz yere kaydırabilirsiniz.\n            </div>\n            <button type=\"button\" class=\"btn btn-danger btn-xs\" style=\"margin-top: 8px; width: 100%; background: #ef4444; color: #ffffff; border: none; padding: 5px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;\" onclick=\"window.deleteGcpPoint(" + arg1.id + ")\">\n                <i class=\"fa-solid fa-trash-can\"></i> Bu Noktayı Sil (Ağı Yenile)\n            </button>\n        </div>\n    ";
}
function highlightTableRow(arg1) {
  const domEl = document.getElementById("tbodyFlightGcpResults");
  if (!domEl) {
    return;
  }
  const domEl_1 = domEl.querySelector("tr[data-point-id=\"" + arg1 + "\"]");
  if (domEl_1) {
    domEl_1.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
    domEl_1.classList.remove("table-row-highlight");
    domEl_1.offsetWidth;
    domEl_1.classList.add("table-row-highlight");
  }
}
window.deleteGcpPoint = function (arg1) {
  if (!state.flightEngine || !state.flightEngine.gcpPoints) {
    return;
  }
  const v_2 = state.flightEngine.gcpPoints.find(item => item.id == arg1 || item.name == arg1);
  if (!v_2) {
    return;
  }
  state.flightEngine.gcpPoints = state.flightEngine.gcpPoints.filter(item => item.id != arg1 && item.name != arg1);
  if (state.flightMap) {
    state.flightMap.closePopup();
  }
  renderGcpMarkersOnMap(state.flightEngine.gcpPoints);
  renderGcpTable(state.flightEngine.gcpPoints);
  const tableEl = document.getElementById("badgeGcpTableCount");
  if (tableEl) {
    tableEl.textContent = state.flightEngine.gcpPoints.length + " Nokta";
  }
  const domEl = document.getElementById("statGcpCount");
  if (domEl) {
    domEl.textContent = state.flightEngine.gcpPoints.length;
  }
  showToast(t("flight.toastGcpRemoved", { name: v_2.name }), "warning");
  logMessage("🗑️ [YKN SİLME] " + v_2.name + " noktası kaldırıldı. Kalan " + state.flightEngine.gcpPoints.length + " nokta ile nirengi ağı yeniden bağlandı.");
};
function renderGcpMarkersOnMap(arg1) {
  if (!state.flightMap || !state.flightGcpLayer) {
    return;
  }
  state.flightGcpLayer.clearLayers();
  if (state.flightTriangulationLayer) {
    state.flightTriangulationLayer.clearLayers();
  }
  if (state.flightTriangulationLayer && arg1.length >= 3) {
    const v_1 = computeDelaunayEdges(arg1);
    v_1.forEach(([item, item_1]) => {
      const v_1_1 = Math.PI / 180;
      const v_2 = (item_1.lat - item.lat) * v_1_1;
      const v_3 = (item_1.lon - item.lon) * v_1_1;
      const v_4 = Math.sin(v_2 / 2) ** 2 + Math.cos(item.lat * v_1_1) * Math.cos(item_1.lat * v_1_1) * Math.sin(v_3 / 2) ** 2;
      const v_5 = Math.round(Math.atan2(Math.sqrt(v_4), Math.sqrt(1 - v_4)) * 12756274);
      const v_6 = L.polyline([[item.lat, item.lon], [item_1.lat, item_1.lon]], {
        color: "#00e5ff",
        weight: 1.6,
        dashArray: "3, 4",
        opacity: 0.35
      }).bindTooltip("📐 Nirengi / Üçgen Kenarı: " + item.name + " ➔ " + item_1.name + " (" + v_5 + "m)", {
        sticky: true
      });
      state.flightTriangulationLayer.addLayer(v_6);
    });
  }
  arg1.forEach(item => {
    const v_1 = item.type === "YKN";
    const v_2 = v_1 ? "gcp-pin-ykn" : "gcp-pin-dn";
    const v_3 = "\n            <div class=\"gcp-map-pin " + v_2 + "\">\n                <span class=\"gcp-pin-num\">" + item.id + "</span>\n                <div class=\"gcp-pin-del-badge\" title=\"" + item.name + " Noktasını Kaldır\" onclick=\"event.stopPropagation(); window.deleteGcpPoint(" + item.id + ")\">✕</div>\n            </div>\n        ";
    const v_4 = L.divIcon({
      html: v_3,
      className: "custom-gcp-icon-wrap",
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    let v_5 = null;
    if (item.nearestRoad && item.roadDistM !== null) {
      v_5 = L.polyline([[item.lat, item.lon], [item.nearestRoad.lat, item.nearestRoad.lon]], {
        color: "#f59e0b",
        weight: 2,
        dashArray: "4, 4",
        opacity: 0.8
      });
      if (item.roadDistM >= 20) {
        v_5.bindTooltip("📏 " + item.roadDistM + "m", {
          permanent: true,
          direction: "center",
          className: "road-dist-tooltip"
        });
      } else {
        v_5.bindTooltip("🛣️ " + item.roadDistM + "m (" + (item.nearestRoad.roadInfo?.name || "Yol") + ")", {
          sticky: true,
          className: "road-dist-tooltip"
        });
      }
      state.flightGcpLayer.addLayer(v_5);
    }
    const v_6 = L.marker([item.lat, item.lon], {
      icon: v_4,
      draggable: true,
      zIndexOffset: 1000,
      title: item.name + " - Konumu değiştirmek için sürükleyiniz"
    }).bindPopup(buildGcpPopupContent(item));
    v_6.on("drag", arg1_1 => {
      const v_2_1 = v_6.getLatLng();
      if (state.flightEngine.roadWays && state.flightEngine.roadWays.length > 0) {
        const v_1_1 = state.flightEngine._findNearestRoadPoint(v_2_1.lat, v_2_1.lng, state.flightEngine.roadWays, 600);
        if (v_1_1 && v_1_1.distanceM <= 600) {
          const v_1_2 = Math.round(v_1_1.distanceM);
          if (!v_5) {
            v_5 = L.polyline([[v_2_1.lat, v_2_1.lng], [v_1_1.lat, v_1_1.lon]], {
              color: "#f59e0b",
              weight: 2,
              dashArray: "4, 4",
              opacity: 0.8
            }).addTo(state.flightGcpLayer);
            if (v_1_2 >= 20) {
              v_5.bindTooltip("📏 " + v_1_2 + "m", {
                permanent: true,
                direction: "center",
                className: "road-dist-tooltip"
              });
            }
          } else {
            v_5.setLatLngs([[v_2_1.lat, v_2_1.lng], [v_1_1.lat, v_1_1.lon]]);
            if (v_1_2 >= 20) {
              v_5.setTooltipContent("📏 " + v_1_2 + "m");
            }
          }
        } else if (v_5) {
          state.flightGcpLayer.removeLayer(v_5);
          v_5 = null;
        }
      }
    });
    v_6.on("dragend", arg1_1 => {
      const v_2_1 = v_6.getLatLng();
      item.lat = v_2_1.lat;
      item.lon = v_2_1.lng;
      let v_3_1 = Math.round(item.lon / 3) * 3;
      if (v_3_1 < 27) {
        v_3_1 = 27;
      }
      if (v_3_1 > 45) {
        v_3_1 = 45;
      }
      item.dom = v_3_1;
      if (state.geodesyEngine && typeof state.geodesyEngine.wgs84ToTurefTM === "function") {
        const v_1_1 = state.geodesyEngine.wgs84ToTurefTM(item.lat, item.lon, item.dom);
        item.itrfY = Math.round(v_1_1.Y * 1000) / 1000;
        item.itrfX = Math.round(v_1_1.X * 1000) / 1000;
      } else {
        const v_1_1 = (typeof HaritaGeodesy !== "undefined" && HaritaGeodesy.deg2rad) || (Math.PI / 180);
        const num = (typeof HaritaGeodesy !== "undefined" && HaritaGeodesy.ELLIPSOIDS) ? HaritaGeodesy.ELLIPSOIDS.GRS80.a : 6378137;
        const v_2_2 = Math.cos(item.lat * v_1_1);
        item.itrfY = Math.round((500000 + (item.lon - item.dom) * v_1_1 * num * v_2_2) * 1000) / 1000;
        item.itrfX = Math.round(item.lat * v_1_1 * num * 1000) / 1000;
      }
      state.flightEngine.recalculatePointRoadDistance(item, 600);
      v_6.setPopupContent(buildGcpPopupContent(item));
      renderGcpTable(state.flightEngine.gcpPoints);
      highlightTableRow(item.id);
      if (state.flightTriangulationLayer) {
        renderGcpMarkersOnMap(state.flightEngine.gcpPoints);
      }
      showToast(t("flight.toastGcpMoved", { name: item.name, y: item.itrfY.toFixed(3), x: item.itrfX.toFixed(3) }), "info");
    });
    v_6.on("click", () => {
      highlightTableRow(item.id);
    });
    state.flightGcpLayer.addLayer(v_6);
    setTimeout(() => {
      const v_1_1 = v_6.getElement();
      if (v_1_1) {
        const domEl = v_1_1.querySelector(".gcp-pin-del-badge");
        if (domEl) {
          L.DomEvent.disableClickPropagation(domEl);
          L.DomEvent.disableScrollPropagation(domEl);
          domEl.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            window.deleteGcpPoint(item.id);
          });
          domEl.addEventListener("mousedown", event => {
            event.stopPropagation();
          });
          domEl.addEventListener("touchstart", event => {
            event.stopPropagation();
            window.deleteGcpPoint(item.id);
          });
        }
      }
    }, 10);
  });
}
function renderRoadNetworkOnMap(arg1) {
  if (!state.flightMap || !state.flightRoadLayer) {
    return;
  }
  state.flightRoadLayer.clearLayers();
  const domEl = document.getElementById("badgeRoadCount");
  const btnEl = document.getElementById("txtRoadBtn");
  if (!arg1 || arg1.length === 0) {
    if (domEl) {
      domEl.textContent = t("flight.lblRoadSegments", { count: 0 });
    }
    if (btnEl) {
      btnEl.textContent = t("flight.btnFetchRoads");
    }
    return;
  }
  if (domEl) {
    domEl.textContent = t("flight.lblRoadSegments", { count: arg1.length });
  }
  if (btnEl) {
    btnEl.textContent = t("flight.lblRoadsActive", { count: arg1.length });
  }
  arg1.forEach(item => {
    const v_1 = item.geometry || (Array.isArray(item) ? item : []);
    if (!v_1 || v_1.length < 2) {
      return;
    }
    const v_2 = v_1.map(item_1 => [item_1.lat, item_1.lon]);
    const v_3 = (item.type || "road").toLowerCase();
    const v_4 = item.name || "";
    let str = "#818cf8";
    let num = 2.5;
    let num_1 = 0.85;
    let v_5 = null;
    let str_1 = "Yerel Yol";
    if (item.isCustom || v_3 === "custom_track") {
      str = "#f59e0b";
      num = 3.5;
      v_5 = "6, 4";
      str_1 = "✏️ Manuel Çizilen Arazi Yolu";
    } else if (["motorway", "trunk", "primary"].includes(v_3)) {
      str = "#38bdf8";
      num = 3.5;
      str_1 = "Ana Yol (Asfalt)";
    } else if (["secondary", "tertiary"].includes(v_3)) {
      str = "#34d399";
      num = 3;
      str_1 = "Tali / Köy Yolu";
    } else if (["residential", "unclassified", "living_street"].includes(v_3)) {
      str = "#cbd5e1";
      num = 2.5;
      str_1 = "Mahalle Yolu";
    } else if (["track", "service"].includes(v_3)) {
      str = "#c084fc";
      num = 2.2;
      v_5 = "5, 4";
      str_1 = "Tarla / Traktör Yolu (Track)";
    } else if (["path", "footway"].includes(v_3)) {
      str = "#fbbf24";
      num = 1.8;
      v_5 = "3, 3";
      str_1 = "Patika / Arazi İzi";
    }
    const v_6 = v_4 ? "🛣️ <strong>" + v_4 + "</strong> (" + str_1 + ")" : "🛣️ " + str_1;
    const v_7 = L.polyline(v_2, {
      color: str,
      weight: num,
      opacity: num_1,
      dashArray: v_5
    }).bindTooltip(v_6, {
      sticky: true
    });
    state.flightRoadLayer.addLayer(v_7);
  });
}
function renderGcpTable(arg1) {
  const domEl = document.getElementById("tbodyFlightGcpResults");
  const tableEl = document.getElementById("badgeGcpTableCount");
  if (!domEl) {
    return;
  }
  if (tableEl) {
    tableEl.textContent = arg1.length + " " + t("flight.unitPoint");
  }
  domEl.innerHTML = "";
  if (arg1.length === 0) {
    domEl.innerHTML = "<tr><td colspan=\"9\" style=\"text-align: center; padding: 24px; color: var(--text-muted);\">"+t("flight.emptyGcpTable")+"</td></tr>";
    return;
  }
  arg1.forEach(item => {
    const trEl = document.createElement("tr");
    trEl.setAttribute("data-point-id", item.id);
    trEl.style.cursor = "pointer";
    const v_1 = item.type === "YKN";
    const v_2 = v_1 ? "<span style=\"background: rgba(16, 185, 129, 0.15); color: var(--emerald-400); padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 10.5px;\">YKN</span>" : "<span style=\"background: rgba(245, 158, 11, 0.15); color: var(--amber-400); padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 10.5px;\">DN</span>";
    let str = "";
    if (item.roadDistM !== null) {
      if (item.roadDistM <= 15) {
        str = "<span style=\"color: var(--emerald-400); font-weight: 600;\"><i class=\"fa-solid fa-road\"></i> " + t("flight.lblRoadside", { dist: item.roadDistM }) + "</span>";
      } else {
        str = "<span style=\"color: var(--cyan-400); font-weight: 600;\"><i class=\"fa-solid fa-person-walking\"></i> " + t("flight.lblToRoad", { dist: item.roadDistM }) + "</span>";
      }
    } else {
      str = "<span style=\"color: var(--text-muted);\"><i class=\"fa-solid fa-mountain\"></i> " + t("flight.lblOpenField") + "</span>";
    }
    trEl.innerHTML = "\n            <td style=\"text-align: center; font-family: var(--font-mono); color: var(--text-muted);\">" + item.id + "</td>\n            <td style=\"text-align: left; font-weight: 700;\" class=\"text-main font-mono\">" + item.name + "</td>\n            <td style=\"text-align: center;\">" + v_2 + "</td>\n            <td style=\"text-align: right; font-family: var(--font-mono);\">" + item.lat.toFixed(7) + "°</td>\n            <td style=\"text-align: right; font-family: var(--font-mono);\">" + item.lon.toFixed(7) + "°</td>\n            <td style=\"text-align: right; font-family: var(--font-mono); font-weight: 600; color: var(--cyan-400);\">" + item.itrfY.toFixed(3) + "</td>\n            <td style=\"text-align: right; font-family: var(--font-mono); font-weight: 600; color: var(--cyan-400);\">" + item.itrfX.toFixed(3) + "</td>\n            <td style=\"text-align: center; font-family: var(--font-mono); color: var(--indigo-400); font-weight: 600;\">" + item.dom + "°</td>\n            <td style=\"text-align: left; font-size: 11px;\">" + str + "</td>\n            <td style=\"text-align: center;\">\n                <button class=\"btn btn-icon btn-danger btn-xs\" style=\"padding: 2px 7px; font-size: 11px; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; border-radius: 4px; cursor: pointer;\" onclick=\"event.stopPropagation(); window.deleteGcpPoint(" + item.id + ")\" title=\"" + t("flight.titleDeletePoint", { name: item.name }) + "\">\n                    <i class=\"fa-solid fa-xmark\"></i>\n                </button>\n            </td>\n        ";
    trEl.addEventListener("click", () => {
      if (state.flightMap) {
        state.flightMap.setView([item.lat, item.lon], Math.max(state.flightMap.getZoom(), 17), {
          animate: true
        });
        highlightTableRow(item.id);
      }
    });
    domEl.appendChild(trEl);
  });
}
function filterGcpTable(arg1) {
  const domEl = document.getElementById("tbodyFlightGcpResults");
  if (!domEl) {
    return;
  }
  const elementsList = domEl.querySelectorAll("tr");
  let num = 0;
  elementsList.forEach(item => {
    const v_1 = item.textContent.toLowerCase();
    if (!arg1 || v_1.includes(arg1)) {
      item.style.display = "";
      num++;
    } else {
      item.style.display = "none";
    }
  });
  const tableEl = document.getElementById("badgeGcpTableCount");
  if (tableEl) {
    tableEl.textContent = num + " Nokta";
  }
}
window.toggleExportDropdown = function (arg1) {
  if (arg1) {
    arg1.preventDefault();
    arg1.stopPropagation();
  }
  const domEl = document.getElementById("menuExportDropdown");
  if (!domEl) {
    return;
  }
  const v_2 = domEl.style.display === "flex" || domEl.classList.contains("show");
  if (v_2) {
    domEl.style.display = "none";
    domEl.classList.remove("show");
  } else {
    domEl.style.display = "flex";
    domEl.classList.add("show");
  }
};
window.exportFlightFile = function (arg1) {
  const domEl = document.getElementById("menuExportDropdown");
  if (domEl) {
    domEl.style.display = "none";
    domEl.classList.remove("show");
  }
  if (!state.flightEngine) {
    state.flightEngine = new FlightPlannerEngine();
  }
  if (arg1 === "dji_kml") {
    const v_1 = state.flightEngine.simplifiedPolygon || state.flightEngine.originalPolygon;
    if (!v_1 || v_1.length === 0) {
      showToast(t("flight.toastExportNeedBoundary"), "warning");
      return;
    }
    const v_2 = state.flightEngine.exportFlightKml(true);
    downloadTextFile("GNSS_Studio_Ucus_Plani_Sadelestirilmis.kml", v_2, "application/vnd.google-earth.kml+xml");
    showToast(t("flight.toastExportDjiKml"), "success");
  } else if (arg1 === "netcad_ncn") {
    if (!state.flightEngine.gcpPoints || state.flightEngine.gcpPoints.length === 0) {
      showToast(t("flight.toastExportNeedGcp"), "warning");
      return;
    }
    const v_1 = state.flightEngine.exportGcpNcn();
    downloadTextFile("IHA_YKN_Noktalari.ncn", v_1, "text/plain");
    showToast(t("flight.toastExportNcn"), "success");
  } else if (arg1 === "autocad_dxf") {
    if (!state.flightEngine.gcpPoints || state.flightEngine.gcpPoints.length === 0) {
      showToast(t("flight.toastExportNeedGcp"), "warning");
      return;
    }
    const v_1 = state.flightEngine.exportGcpDxf();
    downloadTextFile("IHA_Ucus_Plani_ve_YKN.dxf", v_1, "application/dxf");
    showToast(t("flight.toastExportDxf"), "success");
  } else if (arg1 === "excel_csv") {
    if (!state.flightEngine.gcpPoints || state.flightEngine.gcpPoints.length === 0) {
      showToast(t("flight.toastExportNeedGcp"), "warning");
      return;
    }
    const v_1 = state.flightEngine.exportGcpCsv();
    downloadTextFile("IHA_YKN_Koordinatlari.csv", v_1, "text/csv");
    showToast(t("flight.toastExportCsv"), "success");
  } else if (arg1 === "google_kml") {
    if (!state.flightEngine.gcpPoints || state.flightEngine.gcpPoints.length === 0) {
      showToast(t("flight.toastExportNeedGcp"), "warning");
      return;
    }
    const v_1 = state.flightEngine.exportGcpKml();
    downloadTextFile("IHA_YKN_Noktalari_3D.kml", v_1, "application/vnd.google-earth.kml+xml");
    showToast(t("flight.toastExportGcpKml"), "success");
  }
};
document.addEventListener("click", event => {
  const btnEl = document.getElementById("btnToggleExportMenu");
  const domEl = document.getElementById("menuExportDropdown");
  if (domEl && btnEl && !btnEl.contains(event.target) && !domEl.contains(event.target)) {
    domEl.style.display = "none";
    domEl.classList.remove("show");
  }
});
function bindFlightExportHandlers() {}
function getSampleFlightKmlString() {
  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n  <Document>\n    <name>Milas_Maden_Saha_Siniri</name>\n    <Placemark>\n      <name>Ucus_Alani_38_Krikli</name>\n      <Polygon>\n        <outerBoundaryIs>\n          <LinearRing>\n            <coordinates>\n              27.7850,37.3100,120 27.7880,37.3120,125 27.7870,37.3145,130 27.7910,37.3160,135\n              27.7900,37.3180,140 27.7940,37.3200,145 27.7925,37.3225,150 27.7960,37.3250,155\n              27.7990,37.3240,150 27.8020,37.3270,160 27.8060,37.3260,158 27.8080,37.3290,165\n              27.8120,37.3280,162 27.8150,37.3305,170 27.8180,37.3275,165 27.8210,37.3290,168\n              27.8250,37.3260,160 27.8220,37.3220,150 27.8260,37.3190,145 27.8230,37.3160,140\n              27.8270,37.3130,135 27.8240,37.3100,130 27.8200,37.3080,125 27.8160,37.3095,128\n              27.8120,37.3060,120 27.8080,37.3075,122 27.8040,37.3040,115 27.8000,37.3060,118\n              27.7960,37.3030,112 27.7920,37.3050,115 27.7880,37.3020,110 27.7850,37.3100,120\n            </coordinates>\n          </LinearRing>\n        </outerBoundaryIs>\n      </Polygon>\n    </Placemark>\n  </Document>\n</kml>";
}
function startDrawingRoad() {
  if (!state.flightMap) {
    showToast(t("flight.toastOpenMapFirst"), "warning");
    return;
  }
  if (state.isDrawingRoad) {
    cancelDrawingRoad();
    return;
  }
  state.isDrawingRoad = true;
  state.activeRoadPoints = [];
  state.activeRoadMarkers = [];
  state.flightMap.getContainer().style.cursor = "crosshair";
  if (state.flightGcpLayer) {
    state.flightGcpLayer.eachLayer(arg1 => {
      if (arg1.getElement) {
        arg1.getElement()?.style.setProperty("pointer-events", "none");
      }
    });
  }
  if (state.flightOriginalLayer) {
    state.flightOriginalLayer.eachLayer(arg1 => {
      if (arg1.getElement) {
        arg1.getElement()?.style.setProperty("pointer-events", "none");
      }
    });
  }
  if (state.flightSimplifiedLayer) {
    state.flightSimplifiedLayer.eachLayer(arg1 => {
      if (arg1.getElement) {
        arg1.getElement()?.style.setProperty("pointer-events", "none");
      }
    });
  }
  const btnEl = document.getElementById("btnDrawCustomRoad");
  const btnEl_1 = document.getElementById("txtDrawRoadBtn");
  const btnEl_2 = document.getElementById("btnPanelDrawRoad");
  const btnEl_3 = document.getElementById("btnFinishDrawRoad");
  const btnEl_4 = document.getElementById("btnCancelDrawRoad");
  if (btnEl_1) {
    btnEl_1.textContent = t("flight.btnDrawingRoad", { count: 0 });
  }
  if (btnEl_3) {
    btnEl_3.style.display = "inline-flex";
    btnEl_3.textContent = "✔️ Tamamla";
  }
  if (btnEl_4) {
    btnEl_4.style.display = "inline-flex";
    btnEl_4.classList.remove("hidden");
  }
  if (btnEl) {
    btnEl.style.borderColor = "#f59e0b";
    btnEl.style.background = "rgba(245, 158, 11, 0.25)";
  }
  if (btnEl_2) {
    btnEl_2.style.borderColor = "#f59e0b";
    btnEl_2.style.background = "rgba(245, 158, 11, 0.25)";
  }
  showToast(t("flight.toastDrawRoadHelp"), "info");
  logMessage("✏️ [YOL ÇİZİMİ] Manuel toprak yol çizim modu aktif. Harita üzerinde güzergaha tıklayınız.");
}
function finishDrawingRoad() {
  if (!state.isDrawingRoad) {
    return;
  }
  if (state.activeRoadPoints.length >= 2) {
    const v_1 = state.activeRoadPoints.map(item => ({
      lat: item[0],
      lon: item[1]
    }));
    const v_2 = "Uydudan Çizilen Arazi Yolu #" + ((state.flightEngine.customDrawnRoads || []).length + 1);
    const v_3 = state.flightEngine.addCustomRoad(v_1, v_2, "custom_track");
    renderRoadNetworkOnMap(state.flightEngine.roadWays);
    if (state.flightEngine.gcpPoints && state.flightEngine.gcpPoints.length > 0) {
      state.flightEngine.gcpPoints.forEach(item => {
        state.flightEngine.recalculatePointRoadDistance(item, 600);
      });
      renderGcpMarkersOnMap(state.flightEngine.gcpPoints);
      renderGcpTable(state.flightEngine.gcpPoints);
    }
    showToast(t("flight.toastDrawRoadSuccess", { count: v_1.length }), "success");
    logMessage("✅ [YOL ÇİZİMİ] " + v_1.length + " noktalı toprak yol kaydedildi. YKN'ler bu yola bağlandı.");
  } else {
    showToast(t("flight.toastDrawRoadMinPoints"), "warning");
  }
  cancelDrawingRoad();
}
function cancelDrawingRoad() {
  state.isDrawingRoad = false;
  state.activeRoadPoints = [];
  if (state.flightMap) {
    state.flightMap.getContainer().style.cursor = "";
    if (state.activeRoadPolyline) {
      state.flightMap.removeLayer(state.activeRoadPolyline);
      state.activeRoadPolyline = null;
    }
    if (state.activeRoadRubberBand) {
      state.flightMap.removeLayer(state.activeRoadRubberBand);
      state.activeRoadRubberBand = null;
    }
    if (state.activeRoadMarkers) {
      state.activeRoadMarkers.forEach(item => state.flightMap.removeLayer(item));
      state.activeRoadMarkers = [];
    }
    if (state.flightGcpLayer) {
      state.flightGcpLayer.eachLayer(arg1 => {
        if (arg1.getElement) {
          arg1.getElement()?.style.removeProperty("pointer-events");
        }
      });
    }
    if (state.flightOriginalLayer) {
      state.flightOriginalLayer.eachLayer(arg1 => {
        if (arg1.getElement) {
          arg1.getElement()?.style.removeProperty("pointer-events");
        }
      });
    }
    if (state.flightSimplifiedLayer) {
      state.flightSimplifiedLayer.eachLayer(arg1 => {
        if (arg1.getElement) {
          arg1.getElement()?.style.removeProperty("pointer-events");
        }
      });
    }
  }
  const btnEl = document.getElementById("btnDrawCustomRoad");
  const btnEl_1 = document.getElementById("txtDrawRoadBtn");
  const btnEl_2 = document.getElementById("btnPanelDrawRoad");
  const btnEl_3 = document.getElementById("btnFinishDrawRoad");
  const btnEl_4 = document.getElementById("btnCancelDrawRoad");
  if (btnEl_1) {
    btnEl_1.textContent = t("flight.btnDrawRoad");
  }
  if (btnEl_3) {
    btnEl_3.style.display = "none";
    btnEl_3.classList.add("hidden");
  }
  if (btnEl_4) {
    btnEl_4.style.display = "none";
    btnEl_4.classList.add("hidden");
  }
  if (btnEl) {
    btnEl.style.borderColor = "rgba(245, 158, 11, 0.5)";
    btnEl.style.background = "";
  }
  if (btnEl_2) {
    btnEl_2.style.borderColor = "rgba(245, 158, 11, 0.4)";
    btnEl_2.style.background = "";
  }
}
function bindRoadDrawingMapEvents() {
  if (!state.flightMap || state.isRoadDrawingBound) {
    return;
  }
  state.isRoadDrawingBound = true;
  state.flightMap.on("click", arg1 => {
    if (!state.isDrawingRoad) {
      return;
    }
    const items = [arg1.latlng.lat, arg1.latlng.lng];
    state.activeRoadPoints.push(items);
    const v_2 = L.circleMarker(items, {
      radius: 5,
      color: "#f59e0b",
      fillColor: "#ffffff",
      fillOpacity: 1,
      weight: 2.5
    }).addTo(state.flightMap);
    state.activeRoadMarkers.push(v_2);
    if (state.activeRoadPolyline) {
      state.activeRoadPolyline.setLatLngs(state.activeRoadPoints);
    } else {
      state.activeRoadPolyline = L.polyline(state.activeRoadPoints, {
        color: "#f59e0b",
        weight: 3.5,
        dashArray: "6, 4",
        opacity: 0.95
      }).addTo(state.flightMap);
    }
    const btnEl = document.getElementById("txtDrawRoadBtn");
    const btnEl_1 = document.getElementById("btnFinishDrawRoad");
    if (btnEl) {
      btnEl.textContent = t("flight.btnDrawingRoad", { count: state.activeRoadPoints.length });
    }
    if (btnEl_1) {
      btnEl_1.textContent = "✔️ Tamamla (" + state.activeRoadPoints.length + " Nokta)";
    }
  });
  state.flightMap.on("mousemove", arg1 => {
    if (!state.isDrawingRoad || state.activeRoadPoints.length === 0) {
      return;
    }
    const v_2 = state.activeRoadPoints[state.activeRoadPoints.length - 1];
    const items = [arg1.latlng.lat, arg1.latlng.lng];
    if (state.activeRoadRubberBand) {
      state.activeRoadRubberBand.setLatLngs([v_2, items]);
    } else {
      state.activeRoadRubberBand = L.polyline([v_2, items], {
        color: "#f59e0b",
        weight: 2,
        dashArray: "3, 4",
        opacity: 0.7
      }).addTo(state.flightMap);
    }
  });
  state.flightMap.on("dblclick", arg1 => {
    if (state.isDrawingRoad) {
      L.DomEvent.stopPropagation(arg1);
      finishDrawingRoad();
    }
  });
  document.addEventListener("keydown", event => {
    if (!state.isDrawingRoad) {
      return;
    }
    if (event.key === "Escape") {
      cancelDrawingRoad();
    } else if (event.key === "Enter") {
      finishDrawingRoad();
    }
  });
}
function computeDelaunayEdges(arg1) {
  if (!arg1 || arg1.length < 3) {
    return [];
  }
  const v_2 = arg1.map(item => ({
    id: item.id,
    name: item.name,
    lat: item.lat,
    lon: item.lon,
    x: item.itrfY || item.lon * 100000,
    y: item.itrfX || item.lat * 100000
  }));
  let v_3 = Infinity;
  let v_4 = -Infinity;
  let v_5 = Infinity;
  let v_6 = -Infinity;
  v_2.forEach(item => {
    if (item.x < v_3) {
      v_3 = item.x;
    }
    if (item.x > v_4) {
      v_4 = item.x;
    }
    if (item.y < v_5) {
      v_5 = item.y;
    }
    if (item.y > v_6) {
      v_6 = item.y;
    }
  });
  const v_7 = (v_4 - v_3) * 10;
  const v_8 = (v_6 - v_5) * 10;
  const v_9 = (v_3 + v_4) / 2;
  const v_10 = (v_5 + v_6) / 2;
  const obj = {
    x: v_9 - v_7,
    y: v_10 - v_8,
    isSuper: true
  };
  const obj_1 = {
    x: v_9,
    y: v_10 + v_8 * 2,
    isSuper: true
  };
  const obj_2 = {
    x: v_9 + v_7 * 2,
    y: v_10 - v_8,
    isSuper: true
  };
  let items = [{
    a: obj,
    b: obj_1,
    c: obj_2,
    circle: _getCircumcircle(obj, obj_1, obj_2)
  }];
  for (const v_1 of v_2) {
    const items_2 = [];
    const items_3 = [];
    for (const v_1_1 of items) {
      const v_1_2 = Math.hypot(v_1.x - v_1_1.circle.x, v_1.y - v_1_1.circle.y);
      if (v_1_2 < v_1_1.circle.r) {
        items_3.push(v_1_1);
      }
    }
    for (const v_1_1 of items_3) {
      const items_4 = [[v_1_1.a, v_1_1.b], [v_1_1.b, v_1_1.c], [v_1_1.c, v_1_1.a]];
      for (const v_1_2 of items_4) {
        let flag = false;
        for (const v_1_3 of items_3) {
          if (v_1_3 === v_1_1) {
            continue;
          }
          const items_5 = [[v_1_3.a, v_1_3.b], [v_1_3.b, v_1_3.c], [v_1_3.c, v_1_3.a]];
          if (items_5.some(item => item[0] === v_1_2[0] && item[1] === v_1_2[1] || item[0] === v_1_2[1] && item[1] === v_1_2[0])) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          items_2.push(v_1_2);
        }
      }
    }
    items = items.filter(item => !items_3.includes(item));
    for (const v_1_1 of items_2) {
      const obj_3 = {
        a: v_1_1[0],
        b: v_1_1[1],
        c: v_1
      };
      obj_3.circle = _getCircumcircle(obj_3.a, obj_3.b, obj_3.c);
      items.push(obj_3);
    }
  }
  items = items.filter(item => !item.a.isSuper && !item.b.isSuper && !item.c.isSuper);
  const v_11 = new Set();
  const items_1 = [];
  items.forEach(item => {
    const items_2 = [[item.a, item.b], [item.b, item.c], [item.c, item.a]];
    items_2.forEach(([item_1, item_2]) => {
      const v_1 = item_1.id < item_2.id ? item_1.id + "-" + item_2.id : item_2.id + "-" + item_1.id;
      if (!v_11.has(v_1)) {
        v_11.add(v_1);
        items_1.push([item_1, item_2]);
      }
    });
  });
  return items_1;
}
function _getCircumcircle(arg1, arg2, arg3) {
  const v_4 = (arg1.x * (arg2.y - arg3.y) + arg2.x * (arg3.y - arg1.y) + arg3.x * (arg1.y - arg2.y)) * 2;
  if (Math.abs(v_4) < 1e-7) {
    return {
      x: 0,
      y: 0,
      r: Infinity
    };
  }
  const v_5 = ((arg1.x * arg1.x + arg1.y * arg1.y) * (arg2.y - arg3.y) + (arg2.x * arg2.x + arg2.y * arg2.y) * (arg3.y - arg1.y) + (arg3.x * arg3.x + arg3.y * arg3.y) * (arg1.y - arg2.y)) / v_4;
  const v_6 = ((arg1.x * arg1.x + arg1.y * arg1.y) * (arg3.x - arg2.x) + (arg2.x * arg2.x + arg2.y * arg2.y) * (arg1.x - arg3.x) + (arg3.x * arg3.x + arg3.y * arg3.y) * (arg2.x - arg1.x)) / v_4;
  return {
    x: v_5,
    y: v_6,
    r: Math.hypot(arg1.x - v_5, arg1.y - v_6)
  };
}
function bindPhotogrammetryHandlers() {
  initDroneDatabaseUI();
}
function renderFlightGridOnMap(arg1) {
  if (!state.flightMap) {
    return;
  }
  if (!state.flightLinesLayer) {
    state.flightLinesLayer = L.layerGroup().addTo(state.flightMap);
  }
  if (!state.flightWaypointsLayer) {
    state.flightWaypointsLayer = L.layerGroup().addTo(state.flightMap);
  }
  if (!state.flightHomeLayer) {
    state.flightHomeLayer = L.layerGroup().addTo(state.flightMap);
  }
  if (state.flightCorridorsLayer) {
    state.flightCorridorsLayer.clearLayers();
  }
  state.flightLinesLayer.clearLayers();
  state.flightWaypointsLayer.clearLayers();
  state.flightHomeLayer.clearLayers();
  if (!arg1 || !arg1.lines || arg1.lines.length === 0) {
    return;
  }
  if (arg1.turnArcs && arg1.turnArcs.length > 0) {
    arg1.turnArcs.forEach(item => {
      const v_1 = item.points.map(item_1 => [item_1.lat, item_1.lon || item_1.lng]);
      const v_2 = L.polyline(v_1, {
        color: "#f59e0b",
        weight: 1.8,
        dashArray: "4, 4",
        opacity: 0.75
      });
      state.flightLinesLayer.addLayer(v_2);
    });
  }
  if (arg1.lines && arg1.lines.length > 0) {
    arg1.lines.forEach((item, idx) => {
      const items = [item.start.lat, item.start.lon || item.start.lng];
      const items_1 = [item.end.lat, item.end.lon || item.end.lng];
      const v_1 = L.polyline([items, items_1], {
        color: "#00f2ff",
        weight: 3,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round"
      });
      v_1.bindTooltip("<b>✈️ Koridor Hattı #" + (idx + 1) + "</b><br/>Uzunluk: " + item.lengthM + " m<br/>İrtifa: " + arg1.flightAltitudeM + " m AGL", {
        sticky: true
      });
      state.flightLinesLayer.addLayer(v_1);
      const v_2 = (item.start.lat + item.end.lat) / 2;
      const v_3 = ((item.start.lon || item.start.lng) + (item.end.lon || item.end.lng)) / 2;
      const v_4 = item.end.lat - item.start.lat;
      const v_5 = ((item.end.lon || item.end.lng) - (item.start.lon || item.start.lng)) * Math.cos(v_2 * Math.PI / 180);
      let v_6 = Math.atan2(v_5, v_4) * (180 / Math.PI);
      if (v_6 < 0) {
        v_6 += 360;
      }
      const v_7 = L.divIcon({
        className: "flight-dir-arrow-icon",
        html: "<div style=\"transform: rotate(" + v_6.toFixed(0) + "deg); color: #00f2ff; font-size: 11px; text-shadow: 0 0 5px rgba(0,242,255,0.9); display: flex; align-items: center; justify-content: center;\"><i class=\"fa-solid fa-chevron-up\"></i></div>",
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      const v_8 = L.marker([v_2, v_3], {
        icon: v_7,
        interactive: false
      });
      state.flightLinesLayer.addLayer(v_8);
    });
  }
  if (arg1.waypoints && arg1.waypoints.length > 0) {
    const v_1 = arg1.waypoints.length;
    const v_2 = v_1 > 350 ? Math.ceil(v_1 / 350) : 1;
    for (let num = 0; num < v_1; num += v_2) {
      const v_1_1 = arg1.waypoints[num];
      const v_2_1 = L.circleMarker([v_1_1.lat, v_1_1.lon || v_1_1.lng], {
        radius: 2.2,
        color: "#fbbf24",
        fillColor: "#fbbf24",
        fillOpacity: 0.9,
        weight: 1
      });
      state.flightWaypointsLayer.addLayer(v_2_1);
    }
  }
  if (arg1.homePoint) {
    const v_1 = arg1.homePoint;
    const items = [v_1.lat, v_1.lon || v_1.lng];
    const v_2 = v_1.isRoadSnapped;
    const v_3 = L.divIcon({
      className: "flight-home-icon",
      html: "<div style=\"width: 24px; height: 24px; border-radius: 50%; background: " + (v_2 ? "#10b981" : "#f59e0b") + "; border: 2px solid #ffffff; box-shadow: 0 0 10px " + (v_2 ? "rgba(16, 185, 129, 0.9)" : "rgba(245, 158, 11, 0.9)") + "; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px; font-weight: 900; font-family: var(--font-display);\">H</div>",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    const v_4 = L.marker(items, {
      icon: v_3
    });
    v_4.bindPopup("<b>🚀 Önerilen Kalkış/İniş Noktası (Home)</b><br/>" + (v_2 ? "🛣️ En Yakın Yola Hizalandı (" + v_1.distanceM + "m mesafede)" : "Uçuş Başlangıç Konumu") + "<br/><b>WGS-84:</b> " + v_1.lat.toFixed(6) + ", " + (v_1.lon || v_1.lng).toFixed(6));
    state.flightHomeLayer.addLayer(v_4);
    if (arg1.lines.length > 0) {
      const items_1 = [arg1.lines[0].start.lat, arg1.lines[0].start.lon || arg1.lines[0].start.lng];
      const v_1_1 = L.polyline([items, items_1], {
        color: v_2 ? "#10b981" : "#f59e0b",
        weight: 1.5,
        dashArray: "4, 5",
        opacity: 0.8
      });
      state.flightHomeLayer.addLayer(v_1_1);
      const v_2_1 = arg1.lines[arg1.lines.length - 1];
      const items_2 = [v_2_1.end.lat, v_2_1.end.lon || v_2_1.end.lng];
      const v_3_1 = L.polyline([items_2, items], {
        color: v_2 ? "#10b981" : "#f59e0b",
        weight: 1.5,
        dashArray: "4, 5",
        opacity: 0.8
      });
      state.flightHomeLayer.addLayer(v_3_1);
    }
  }
}

/* <<<<<<<<<< [END MODULE: js/tabs/flightTab.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/tabs/converterTab.js] >>>>>>>>>> */
/**
 * Harita Tools - Format Converter Module Controller
 */
function initFormatConverterModule() {
  const dropzone = document.getElementById("converterDropzone");
  const fileInput = document.getElementById("inputConverterFile");
  const fileInfoChip = document.getElementById("converterFileInfo");
  const fileNameTxt = document.getElementById("txtConverterFileName");
  const fileDetailsTxt = document.getElementById("txtConverterFileDetails");
  const btnReset = document.getElementById("btnResetConverter");

  const selSrcCrs = document.getElementById("selConverterSrcCrs");
  const selDom = document.getElementById("selConverterDom");
  const badgeCrs = document.getElementById("badgeConverterCrs");

  const btnGenPolygon = document.getElementById("btnGeneratePolygon");
  const layersListEl = document.getElementById("converterLayersList");
  const lblLayerCount = document.getElementById("lblLayerCount");

  const kpiPoints = document.getElementById("kpiConverterPoints");
  const kpiTexts = document.getElementById("kpiConverterTexts");
  const kpiLines = document.getElementById("kpiConverterLines");
  const kpiPolygons = document.getElementById("kpiConverterPolygons");
  const kpiTotalArea = document.getElementById("kpiConverterTotalArea");
  const kpiDonum = document.getElementById("kpiConverterDonum");

  const btnFitBounds = document.getElementById("btnConverterFitBounds");
  const btnToggleTexts = document.getElementById("btnConverterToggleTexts");
  const btnToggleLabels = document.getElementById("btnConverterToggleLabels");

  const typeFiltersEl = document.getElementById("converterTypeFilters");
  const inputSearch = document.getElementById("inputConverterSearch");

  const btnExportDxf = document.getElementById("btnExportDxf");
  const btnExportKml = document.getElementById("btnExportKml");
  const btnExportKmz = document.getElementById("btnExportKmz");
  const btnExportNcn = document.getElementById("btnExportNcn");
  const btnExportGeoJson = document.getElementById("btnExportGeoJson");
  const btnExportCsv = document.getElementById("btnExportCsv");

  const tbodyData = document.getElementById("tbodyConverterData");
  const lblTableCount = document.getElementById("lblConverterTableCount");

  if (!state.converterEngine && typeof UniversalFormatConverterEngine !== "undefined") {
    state.converterEngine = new UniversalFormatConverterEngine();
  }

  function initConverterMap() {
    if (state.converterMap) {
      state.converterMap.invalidateSize();
      return;
    }
    if (!document.getElementById("converterMap") || typeof L === "undefined") return;

    const { map } = createStudioMap("converterMap", {
      center: [39.0, 35.0],
      zoom: 6,
      defaultType: "hybrid"
    });
    state.converterMap = map;
    state.converterLayerGroup = L.layerGroup().addTo(state.converterMap);
    state.isConverterMapInit = true;
  }
  window.initConverterMap = initConverterMap;

  function refreshConverterTableOnly() {
    const engine = state.converterEngine;
    if (!tbodyData || !engine) return;

    tbodyData.innerHTML = "";
    if (engine.features.length === 0) {
      renderTableEmptyState(tbodyData, 8, t("converter.emptyStateNoData"), "fa-folder-open", t("converter.emptyStateNoDataSub"));
      if (lblTableCount) lblTableCount.textContent = t("converter.lblRecordCount", { count: 0 });
      return;
    }

    let filtered = engine.features;
    if (state.converterFilterType && state.converterFilterType !== "ALL") {
      filtered = filtered.filter(f => f.type === state.converterFilterType);
    }
    if (state.converterSearchQuery) {
      const q = state.converterSearchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) || 
        (f.layer && f.layer.toLowerCase().includes(q)) ||
        (f.type && f.type.toLowerCase().includes(q))
      );
    }

    const rows = filtered.slice(0, 400);
    if (rows.length === 0) {
      renderTableEmptyState(tbodyData, 8, t("converter.emptyStateNoFilter"), "fa-filter", t("converter.emptyStateNoFilterSub"));
      if (lblTableCount) lblTableCount.textContent = t("converter.lblFilteredRecordCount", { count: 0, total: filtered.length });
      return;
    }

    rows.forEach((f, idx) => {
      const tr = document.createElement("tr");
      let yStr = "-", xStr = "-", zStr = "-";
      let metrajStr = "-";

      let typeBadge = "badge-cyan";
      if (f.type === "Point") {
        typeBadge = f.properties && f.properties.isSymbol ? "badge-amber" : "badge-cyan";
        yStr = (f.coordinates[0] || 0).toFixed(3);
        xStr = (f.coordinates[1] || 0).toFixed(3);
        zStr = (f.coordinates[2] || 0).toFixed(2);
        metrajStr = f.properties && f.properties.isSymbol ? t("converter.symbolPrefix", { name: f.name }) : t("converter.typePoint");
      } else if (f.type === "Text") {
        typeBadge = "badge-purple";
        yStr = (f.coordinates[0] || 0).toFixed(3);
        xStr = (f.coordinates[1] || 0).toFixed(3);
        zStr = (f.coordinates[2] || 0).toFixed(2);
        metrajStr = `CAD Metni: "${f.name}"`;
      } else if (f.type === "LineString") {
        typeBadge = "badge-blue";
        metrajStr = (f.properties.lengthM || 0).toFixed(1) + " m";
      } else if (f.type === "Polygon") {
        typeBadge = "badge-emerald";
        metrajStr = (f.properties.areaM2 || 0).toFixed(1) + " m²";
      }

      tr.innerHTML = `
        <td class="text-dim font-mono">${idx + 1}</td>
        <td class="text-white font-bold">${f.name || "-"}</td>
        <td><span class="badge badge-secondary font-mono text-3xs">${f.layer || "0"}</span></td>
        <td><span class="badge ${typeBadge} font-mono text-3xs">${f.type}</span></td>
        <td class="font-mono">${yStr}</td>
        <td class="font-mono">${xStr}</td>
        <td class="font-mono">${zStr}</td>
        <td class="font-mono text-emerald font-bold">${metrajStr}</td>
      `;
      tbodyData.appendChild(tr);
    });

    if (lblTableCount) {
      lblTableCount.textContent = filtered.length > 400 ? t("converter.lblTableFirst400", { total: filtered.length.toLocaleString("tr-TR") }) : t("converter.lblTableCountTotal", { count: filtered.length.toLocaleString("tr-TR") });
    }
  }

  function refreshConverterUI() {
    const engine = state.converterEngine;
    if (!engine) return;

    const stats = engine.stats;
    if (kpiPoints) kpiPoints.textContent = (stats.pointCount || 0).toLocaleString("tr-TR");
    if (kpiTexts) kpiTexts.textContent = (stats.textCount || 0).toLocaleString("tr-TR");
    if (kpiLines) kpiLines.textContent = (stats.lineCount || 0).toLocaleString("tr-TR");
    if (kpiPolygons) kpiPolygons.textContent = (stats.polygonCount || 0).toLocaleString("tr-TR");
    if (kpiTotalArea) kpiTotalArea.textContent = stats.totalAreaM2.toLocaleString("tr-TR") + " m²";
    if (kpiDonum) kpiDonum.textContent = t("converter.lblDonumHa", { donum: (stats.totalAreaM2 / 1000).toFixed(2), ha: (stats.totalAreaM2 / 10000).toFixed(3) });

    if (typeFiltersEl) {
      const btnAll = typeFiltersEl.querySelector('[data-filter="ALL"]');
      const btnTxt = typeFiltersEl.querySelector('[data-filter="Text"]');
      const btnPt = typeFiltersEl.querySelector('[data-filter="Point"]');
      const btnLn = typeFiltersEl.querySelector('[data-filter="LineString"]');
      const btnPg = typeFiltersEl.querySelector('[data-filter="Polygon"]');
      if (btnAll) btnAll.textContent = t("converter.btnAllWithCount", { count: engine.features.length.toLocaleString("tr-TR") });
      if (btnTxt) btnTxt.innerHTML = `<i class="fa-solid fa-font text-purple mr-1"></i> ` + t("converter.btnTextsWithCount", { count: (stats.textCount || 0).toLocaleString("tr-TR") });
      if (btnPt) btnPt.innerHTML = `<i class="fa-solid fa-location-dot text-cyan mr-1"></i> ` + t("converter.btnPointsWithCount", { count: (stats.pointCount || 0).toLocaleString("tr-TR") });
      if (btnLn) btnLn.innerHTML = `<i class="fa-solid fa-route text-blue mr-1"></i> ` + t("converter.btnLinesWithCount", { count: (stats.lineCount || 0).toLocaleString("tr-TR") });
      if (btnPg) btnPg.innerHTML = `<i class="fa-solid fa-draw-polygon text-emerald mr-1"></i> ` + t("converter.btnPolygonsWithCount", { count: (stats.polygonCount || 0).toLocaleString("tr-TR") });
    }

    if (fileInfoChip) {
      if (engine.features.length > 0) {
        fileInfoChip.classList.remove("d-none");
        if (fileNameTxt) fileNameTxt.textContent = engine.sourceFileName;
        if (fileDetailsTxt) {
          const extraProj = engine.metadata?.projection ? ` • Proj: ${engine.metadata.projection}` : "";
          fileDetailsTxt.textContent = `${engine.sourceFormat} • ${engine.features.length.toLocaleString("tr-TR")} Geometri • ${engine.layers.size} Katman${extraProj}`;
        }
        if (engine.metadata?.dom && selDom) {
          selDom.value = String(engine.metadata.dom);
          if (badgeCrs) badgeCrs.textContent = `TUREF TM 3° (DOM: ${engine.metadata.dom}°)`;
        }
      } else {
        fileInfoChip.classList.add("d-none");
      }
    }

    if (layersListEl) {
      layersListEl.innerHTML = "";
      if (engine.layers.size === 0) {
        layersListEl.innerHTML = '<div class="text-center py-3 text-xs text-dim">' + t("converter.noLayersLoaded") + '</div>';
      } else {
        engine.layers.forEach((data, name) => {
          const row = document.createElement("div");
          row.className = "converter-layer-item";
          row.innerHTML = `
            <div class="d-flex items-center gap-6 min-w-0">
              <span class="converter-layer-dot" style="background-color: ${data.color || '#06b6d4'};"></span>
              <strong class="text-white text-xs truncate">${name}</strong>
              <span class="text-3xs text-dim font-mono">(${data.count})</span>
            </div>
            <label class="d-flex items-center gap-4 text-3xs text-dim cursor-pointer">
              <input type="checkbox" class="chk-converter-layer" data-layer="${name}" ${data.visible !== false ? "checked" : ""} />
              <span>${t("converter.btnShowLayer")}</span>
            </label>
          `;
          layersListEl.appendChild(row);
        });

        layersListEl.querySelectorAll(".chk-converter-layer").forEach(chk => {
          chk.addEventListener("change", () => {
            const lName = chk.getAttribute("data-layer");
            const isVis = chk.checked;
            const lData = engine.layers.get(lName);
            if (lData) lData.visible = isVis;
            renderConverterMapLayers();
          });
        });
      }
    }
    if (lblLayerCount) lblLayerCount.textContent = `${engine.layers.size} Katman`;

    refreshConverterTableOnly();
    renderConverterMapLayers();
  }

  function renderConverterMapLayers() {
    initConverterMap();
    if (!state.converterMap || !state.converterLayerGroup) return;

    state.converterLayerGroup.clearLayers();
    const engine = state.converterEngine;
    if (!engine || engine.features.length === 0) return;

    const dom = parseInt(selDom ? selDom.value : "30", 10);
    const bounds = L.latLngBounds([]);

    const toLatLng = (c, isWgs) => {
      let lon = c[0], lat = c[1];
      if (!isWgs && engine.geodesy) {
        const geo = engine.geodesy.turefTMToWgs84(lon, lat, dom);
        lat = geo.lat;
        lon = geo.lon;
      }
      return [lat, lon];
    };

    let renderCount = 0;
    const MAX_RENDER = 12000;
    for (const f of engine.features) {
      const lData = engine.layers.get(f.layer);
      if (lData && lData.visible === false) continue;
      if (renderCount >= MAX_RENDER) break;
      renderCount++;

      const isWgs = f.properties && f.properties.isWgs84;
      const color = lData ? lData.color : "#06b6d4";

      if (f.type === "Point") {
        const [lat, lon] = toLatLng(f.coordinates, isWgs);
        if (!isNaN(lat) && !isNaN(lon)) {
          const isSym = f.properties && f.properties.isSymbol;
          const marker = L.circleMarker([lat, lon], {
            radius: isSym ? 5 : 4,
            fillColor: isSym ? "#f59e0b" : color,
            color: "#ffffff",
            weight: 1.2,
            opacity: 0.9,
            fillOpacity: 0.85
          });

          if (state.converterShowLabels && f.name) {
            marker.bindTooltip(f.name, { permanent: false, direction: "top" });
          }
          const [y, x, z] = f.coordinates;
          marker.bindPopup(`
            <div style="font-size: 11px; line-height: 1.4;">
              <strong class="${isSym ? 'text-amber' : 'text-cyan'}">${f.name || t("converter.typePoint")}</strong><br>
              ${t("converter.popupType")}: <strong>${isSym ? t("converter.typeSymbol") : t("converter.typePoint")}</strong><br>
              ${t("converter.popupLayer")}: <strong>${f.layer}</strong><br>
              ${t("geomatics.easting")}: <span style="font-family: monospace;">${y.toFixed(3)}</span><br>
              ${t("geomatics.northing")}: <span style="font-family: monospace;">${x.toFixed(3)}</span><br>
              ${t("geomatics.ellipsoidalHeight")}: <span style="font-family: monospace;">${(z || 0).toFixed(2)} m</span>
            </div>
          `);
          state.converterLayerGroup.addLayer(marker);
          bounds.extend([lat, lon]);
        }
      } else if (f.type === "Text") {
        if (!state.converterShowTexts) continue;
        const [lat, lon] = toLatLng(f.coordinates, isWgs);
        if (!isNaN(lat) && !isNaN(lon)) {
          const textIcon = L.divIcon({
            className: "cad-map-text-wrapper",
            html: `<span class="cad-map-text" style="color: ${color || '#c084fc'};">${f.name || ''}</span>`,
            iconSize: null
          });
          const textMarker = L.marker([lat, lon], { icon: textIcon });
          const [y, x, z] = f.coordinates;
          textMarker.bindPopup(`
            <div style="font-size: 11px; line-height: 1.4;">
              <strong style="color: #c084fc;"><i class="fa-solid fa-font"></i> CAD Metni: "${f.name}"</strong><br>
              ${t("converter.popupLayer")}: <strong>${f.layer}</strong><br>
              ${t("geomatics.easting")}: <span style="font-family: monospace;">${y.toFixed(3)}</span><br>
              ${t("geomatics.northing")}: <span style="font-family: monospace;">${x.toFixed(3)}</span><br>
              ${t("geomatics.ellipsoidalHeight")}: <span style="font-family: monospace;">${(z || 0).toFixed(2)} m</span>
            </div>
          `);
          state.converterLayerGroup.addLayer(textMarker);
          bounds.extend([lat, lon]);
        }
      } else if (f.type === "LineString") {
        const latLngs = f.coordinates.map(c => toLatLng(c, isWgs));
        if (latLngs.length >= 2) {
          const polyline = L.polyline(latLngs, {
            color: color || "#3b82f6",
            weight: 3,
            opacity: 0.85
          });
          polyline.bindPopup(`<strong>${f.name}</strong><br>${t("converter.popupLayer")}: ${f.layer}<br>Uzunluk: ${(f.properties.lengthM || 0).toFixed(1)} m`);
          state.converterLayerGroup.addLayer(polyline);
          latLngs.forEach(ll => bounds.extend(ll));
        }
      } else if (f.type === "Polygon") {
        const rings = f.coordinates.map(r => r.map(c => toLatLng(c, isWgs)));
        if (rings.length > 0 && rings[0].length >= 3) {
          const polygon = L.polygon(rings, {
            color: f.properties.isGenerated ? "#10b981" : (color || "#10b981"),
            fillColor: f.properties.isGenerated ? "#10b981" : (color || "#10b981"),
            fillOpacity: 0.35,
            weight: 2.5
          });
          const areaStr = (f.properties.areaM2 || 0).toFixed(1) + " m² (" + t("converter.lblDonumHa", { donum: ((f.properties.areaM2 || 0) / 1000).toFixed(2), ha: ((f.properties.areaM2 || 0) / 10000).toFixed(3) }) + ")";
          polygon.bindPopup(`<strong>${f.name}</strong><br>${t("converter.popupLayer")}: ${f.layer}<br>${t("converter.popupArea")}: ${areaStr}<br>${t("converter.popupPerimeter")}: ${(f.properties.perimeterM || 0).toFixed(1)} m`);
          state.converterLayerGroup.addLayer(polygon);
          rings[0].forEach(ll => bounds.extend(ll));
        }
      }
    }

    if (bounds.isValid()) {
      state.converterMap.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  async function handleFileProcess(file) {
    if (!file) return;
    try {
      showToast(t("converter.toastParsing", { name: file.name }), "info");
      await state.converterEngine.parseFile(file, file.name);
      refreshConverterUI();
      showToast(t("converter.toastParsed", { name: file.name, count: state.converterEngine.features.length }), "success");
    } catch (err) {
      console.error("Format dönüştürme hatası:", err);
      showToast(t("converter.toastParseError", { err: err.message }), "error");
    }
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });
    dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        await handleFileProcess(file);
      }
    });

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFileProcess(file);
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (fileInput) fileInput.value = "";
      if (state.converterEngine) {
        state.converterEngine.features = [];
        state.converterEngine.layers.clear();
        state.converterEngine._recomputeStats();
      }
      if (state.converterLayerGroup) state.converterLayerGroup.clearLayers();
      refreshConverterUI();
      showToast(t("converter.toastCleared"), "info");
    });
  }

  const btnModeSeq = document.getElementById("btnModeSequential");
  const btnModeHull = document.getElementById("btnModeConvexHull");
  state.converterPolygonMode = "sequential";

  if (btnModeSeq && btnModeHull) {
    btnModeSeq.addEventListener("click", () => {
      state.converterPolygonMode = "sequential";
      btnModeSeq.className = "btn btn-primary btn-sm flex-1 text-xs";
      btnModeHull.className = "btn btn-secondary btn-sm flex-1 text-xs";
    });
    btnModeHull.addEventListener("click", () => {
      state.converterPolygonMode = "convex_hull";
      btnModeHull.className = "btn btn-primary btn-sm flex-1 text-xs";
      btnModeSeq.className = "btn btn-secondary btn-sm flex-1 text-xs";
    });
  }

  if (btnGenPolygon) {
    btnGenPolygon.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.toastNeedPointsFirst"), "warning");
        return;
      }
      const mode = state.converterPolygonMode || "sequential";

      try {
        const poly = state.converterEngine.generatePolygonFromPoints(mode, { layerName: "KAPALI_ALAN" });
        refreshConverterUI();
        const areaStr = poly.properties.areaM2.toLocaleString("tr-TR") + " m² (" + t("converter.lblDonumHa", { donum: poly.properties.areaDonum.toFixed(2), ha: (poly.properties.areaM2 / 10000).toFixed(3) }) + ")";
        showToast(t("converter.toastAreaCreated", { area: areaStr }), "success", 5000);
      } catch (err) {
        showToast(t("converter.toastAreaError", { err: err.message }), "error");
      }
    });
  }

  if (selDom && badgeCrs) {
    selDom.addEventListener("change", () => {
      const domVal = selDom.value;
      badgeCrs.textContent = `TUREF TM 3° (DOM: ${domVal}°)`;
      if (state.converterEngine) {
        state.converterEngine.defaultDom = parseInt(domVal, 10);
      }
      renderConverterMapLayers();
    });
  }

  if (btnFitBounds) {
    btnFitBounds.addEventListener("click", () => {
      renderConverterMapLayers();
    });
  }
  if (btnToggleTexts) {
    btnToggleTexts.addEventListener("click", () => {
      state.converterShowTexts = !state.converterShowTexts;
      btnToggleTexts.classList.toggle("active", state.converterShowTexts);
      btnToggleTexts.classList.toggle("text-purple", state.converterShowTexts);
      renderConverterMapLayers();
      showToast(state.converterShowTexts ? t("converter.toastShowTexts") : t("converter.toastHideTexts"), "info");
    });
  }
  if (btnToggleLabels) {
    btnToggleLabels.addEventListener("click", () => {
      state.converterShowLabels = !state.converterShowLabels;
      btnToggleLabels.classList.toggle("text-cyan", state.converterShowLabels);
      renderConverterMapLayers();
      showToast(state.converterShowLabels ? t("converter.toastShowLabels") : t("converter.toastHideLabels"), "info");
    });
  }

  if (typeFiltersEl) {
    typeFiltersEl.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        typeFiltersEl.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.converterFilterType = btn.getAttribute("data-filter") || "ALL";
        refreshConverterTableOnly();
      });
    });
  }

  if (inputSearch) {
    inputSearch.addEventListener("input", (e) => {
      state.converterSearchQuery = e.target.value.trim();
      refreshConverterTableOnly();
    });
  }

  const getOutputBaseName = () => {
    const raw = state.converterEngine?.sourceFileName || "Donusturulen_Harita";
    return raw.replace(/\.[^/.]+$/, "");
  };

  if (btnExportDxf) {
    btnExportDxf.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dxfContent = state.converterEngine.exportDxf();
      downloadTextFile(`${getOutputBaseName()}_export.dxf`, dxfContent, "application/dxf");
      showToast(t("converter.toastExportDxfSuccess"), "success");
    });
  }

  if (btnExportKml) {
    btnExportKml.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      const kmlContent = state.converterEngine.exportKml({ dom: dom });
      downloadTextFile(`${getOutputBaseName()}_google_earth.kml`, kmlContent, "application/vnd.google-earth.kml+xml");
      showToast(t("converter.toastExportKmlSuccess"), "success");
    });
  }

  if (btnExportKmz) {
    btnExportKmz.addEventListener("click", async () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      try {
        const kmzBlob = await state.converterEngine.exportKmz({ dom: dom });
        downloadTextFile(`${getOutputBaseName()}_google_earth.kmz`, kmzBlob, "application/vnd.google-earth.kmz");
        showToast(t("converter.toastExportKmzSuccess"), "success");
      } catch (err) {
        showToast(t("converter.toastExportKmzError", { err: err.message }), "error");
      }
    });
  }

  if (btnExportNcn) {
    btnExportNcn.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoPointsToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      const ncnContent = state.converterEngine.exportNcn({ dom: dom });
      downloadTextFile(`${getOutputBaseName()}_netcad.ncn`, ncnContent, "text/plain");
      showToast(t("converter.toastExportNcnSuccess"), "success");
    });
  }

  if (btnExportGeoJson) {
    btnExportGeoJson.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoGeometryToExport"), "warning");
        return;
      }
      const dom = parseInt(selDom ? selDom.value : "30", 10);
      const geoJsonContent = state.converterEngine.exportGeoJson({ dom: dom });
      downloadTextFile(`${getOutputBaseName()}.geojson`, geoJsonContent, "application/geo+json");
      showToast(t("converter.toastExportGeoJsonSuccess"), "success");
    });
  }

  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", () => {
      if (!state.converterEngine || state.converterEngine.features.length === 0) {
        showToast(t("converter.errNoDataToExport"), "warning");
        return;
      }
      const csvContent = state.converterEngine.exportCsv();
      downloadTextFile(`${getOutputBaseName()}_koordinatlar.csv`, csvContent, "text/csv");
      showToast(t("converter.toastExportCsvSuccess"), "success");
    });
  }
}


/* <<<<<<<<<< [END MODULE: js/tabs/converterTab.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/tabs/guideTab.js] >>>>>>>>>> */
/**
 * Harita Tools - Standards Library & User Guide Controller
 */
let cachedStandardsCatalog = null;

async function loadStandardsCatalog() {
  if (cachedStandardsCatalog) return cachedStandardsCatalog;
  try {
    const basePath = (typeof window !== "undefined" && window.location.pathname)
      ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
      : '';
    const res = await fetch(`${basePath}data/standards_catalog.json?v=${Date.now()}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.documents) {
        cachedStandardsCatalog = json.documents;
      }
    }
  } catch (err) {
    console.warn("Standartlar kataloğu (data/standards_catalog.json) yüklenemedi:", err);
  }
  return cachedStandardsCatalog || {};
}

function initStandardsLibrary() {
  const docsCatalog = cachedStandardsCatalog || {};

  const docItems = document.querySelectorAll(".standards-doc-item");
  const filterChips = document.querySelectorAll(".standards-chip");
  const searchInput = document.getElementById("inputStandardsSearch");
  const docTitleEl = document.getElementById("standardsCurrentDocTitle");
  const docSubEl = document.getElementById("standardsCurrentDocSub");
  const docIconEl = document.getElementById("standardsDocIcon");
  const pdfFrame = document.getElementById("standardsPdfFrame");
  const btnDownload = document.getElementById("btnStandardsDownload");
  const btnOpenNewTab = document.getElementById("btnStandardsOpenNewTab");
  const btnFullscreen = document.getElementById("btnStandardsFullscreen");
  const viewerPane = document.querySelector(".standards-viewer-pane");

  function selectDoc(docId) {
    const doc = docsCatalog[docId];
    if (!doc) return;

    docItems.forEach(item => {
      if (item.getAttribute("data-doc-id") === docId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    if (docTitleEl) docTitleEl.textContent = doc.title;
    if (docSubEl) docSubEl.textContent = doc.sub;
    if (docIconEl) {
      docIconEl.className = doc.icon + " " + doc.iconColor;
    }
    if (pdfFrame) {
      pdfFrame.src = doc.pdfUrl;
    }
    if (btnDownload) {
      btnDownload.href = doc.pdfUrl;
      btnDownload.innerHTML = '<i class="fa-solid fa-file-pdf"></i> <span>' + t("guide.btnDownloadPdf") + '</span>';
    }
    if (btnOpenNewTab) {
      btnOpenNewTab.href = doc.portalUrl;
    }
  }

  docItems.forEach(item => {
    item.addEventListener("click", () => {
      const docId = item.getAttribute("data-doc-id");
      selectDoc(docId);
    });
  });

  // Initial populate with bohhbuy
  selectDoc("bohhbuy");

  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const filterVal = chip.getAttribute("data-standards-filter");
      const q = searchInput ? searchInput.value.trim().toLowerCase() : "";

      docItems.forEach(item => {
        const cat = item.getAttribute("data-doc-cat") || "";
        const text = item.textContent.toLowerCase();
        const matchCat = filterVal === "all" || filterVal === cat;
        const matchQuery = !q || text.includes(q);

        if (matchCat && matchQuery) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      const activeChip = document.querySelector(".standards-chip.active");
      const filterVal = activeChip ? activeChip.getAttribute("data-standards-filter") : "all";

      docItems.forEach(item => {
        const cat = item.getAttribute("data-doc-cat") || "";
        const text = item.textContent.toLowerCase();
        const matchCat = filterVal === "all" || filterVal === cat;
        const matchQuery = !q || text.includes(q);

        if (matchCat && matchQuery) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  }

  if (btnFullscreen && viewerPane) {
    btnFullscreen.addEventListener("click", () => {
      viewerPane.classList.toggle("standards-viewer-fullscreen");
      const isFull = viewerPane.classList.contains("standards-viewer-fullscreen");
      btnFullscreen.innerHTML = isFull ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
    });
  }

  window.selectStandardsDoc = selectDoc;
}

function initGuideSearchAndFilter() {
  const inputSearch = document.getElementById("inputGuideSearch");
  const btnClearSearch = document.getElementById("btnClearGuideSearch");
  const filterChips = document.querySelectorAll(".guide-filter-chip");
  const moduleCards = document.querySelectorAll("#guideModulesGrid .guide-card-box");
  const standardsBento = document.querySelectorAll(".guide-standards-bento");
  const faqItems = document.querySelectorAll(".guide-faq-item");
  const sectionHeadings = document.querySelectorAll(".guide-section-heading");

  // Global Tab Switcher helper
  window.launchGuideTab = (tabId) => {
    const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navItem) {
      navItem.click();
    }
  };

  // Filter Chips Logic
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const filterVal = chip.getAttribute("data-guide-filter");
      applyGuideFilter(filterVal, inputSearch ? inputSearch.value.trim() : "");
    });
  });

  // Search Input Logic
  if (inputSearch) {
    inputSearch.addEventListener("input", () => {
      const q = inputSearch.value.trim();
      if (btnClearSearch) {
        if (q.length > 0) {
          btnClearSearch.classList.remove("d-none");
        } else {
          btnClearSearch.classList.add("d-none");
        }
      }
      const activeChip = document.querySelector(".guide-filter-chip.active");
      const activeFilter = activeChip ? activeChip.getAttribute("data-guide-filter") : "all";
      applyGuideFilter(activeFilter, q);
    });

    if (btnClearSearch) {
      btnClearSearch.addEventListener("click", () => {
        inputSearch.value = "";
        btnClearSearch.classList.add("d-none");
        const activeChip = document.querySelector(".guide-filter-chip.active");
        const activeFilter = activeChip ? activeChip.getAttribute("data-guide-filter") : "all";
        applyGuideFilter(activeFilter, "");
      });
    }
  }

  // Global Copy Legislation Clause to Clipboard Helper
  window.copyLegislationClause = function(clauseText, clauseTitle) {
    if (!clauseText) return;
    copyToClipboard(clauseText, "📋 " + (clauseTitle || "Mevzuat standardı") + " panoya kopyalandı!");
  };

  // Filter and Search Evaluation
  function applyGuideFilter(filterCategory, searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    const legislationCards = document.querySelectorAll(".legislation-card");

    // 1. Module Cards
    moduleCards.forEach(card => {
      const cat = card.getAttribute("data-guide-category") || "";
      const text = card.textContent.toLowerCase();
      const matchCat = filterCategory === "all" || filterCategory === "modules" || filterCategory === cat;
      const matchQuery = !queryLower || text.includes(queryLower);

      if (matchCat && matchQuery) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });

    // 2. Legislation / Standards Cards (MAPEG, BÖHHBÜY, TKGM, HGM, DSİ, İLBANK)
    legislationCards.forEach(card => {
      const cat = card.getAttribute("data-legislation-cat") || "";
      const text = card.textContent.toLowerCase();
      const matchCat = filterCategory === "all" || filterCategory === "standards" || filterCategory === cat;
      const matchQuery = !queryLower || text.includes(queryLower);

      if (matchCat && matchQuery) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });

    // 3. Standards & Formulas
    standardsBento.forEach(bento => {
      const cat = bento.getAttribute("data-guide-category") || "standards";
      const text = bento.textContent.toLowerCase();
      const matchCat = filterCategory === "all" || filterCategory === "standards" || filterCategory === "bohhbuy";
      const matchQuery = !queryLower || text.includes(queryLower);

      if (matchCat && matchQuery) {
        bento.style.display = "grid";
      } else {
        bento.style.display = "none";
      }
    });

    // 4. FAQ Accordion Items
    faqItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const matchCat = filterCategory === "all" || filterCategory === "faq";
      const matchQuery = !queryLower || text.includes(queryLower);

      if (matchCat && matchQuery) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });

    // 5. Section Headings
    sectionHeadings.forEach(heading => {
      const cat = heading.getAttribute("data-guide-category") || "";
      if (filterCategory === "all") {
        heading.style.display = "flex";
      } else if (cat && (cat === filterCategory || (filterCategory === "standards" && cat === "standards") || (filterCategory === "mapeg" && cat === "standards") || (filterCategory === "bohhbuy" && cat === "standards") || (filterCategory === "tkgm" && cat === "standards") || (filterCategory === "hgm" && cat === "standards") || (filterCategory === "dsi" && cat === "standards") || (filterCategory === "ilbank" && cat === "standards"))) {
        heading.style.display = "flex";
      } else if (!cat && (filterCategory === "modules" || filterCategory === "cadastre" || filterCategory === "rinex" || filterCategory === "map" || filterCategory === "geodesy" || filterCategory === "flight" || filterCategory === "tg20")) {
        heading.style.display = "flex";
      } else {
        heading.style.display = "none";
      }
    });
  }

  // FAQ Accordion Click Handler
  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".guide-faq-question");
    if (questionBtn) {
      questionBtn.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        faqItems.forEach(other => other.classList.remove("active"));
        if (!isActive) {
          item.classList.add("active");
        }
      });
    }
  });
}

/* <<<<<<<<<< [END MODULE: js/tabs/guideTab.js] <<<<<<<<<< */

/* >>>>>>>>>> [MODULE: js/app.js] >>>>>>>>>> */
/**
 * ===================================================================
 *  HARİTA TOOLS (BETA) - ANA UYGULAMA ORKESTRATÖRÜ (app.js)
 * ===================================================================
 *  Bu dosya sadece modülleri koordine eder ve başlatır.
 *  İş mantığı js/core/, js/modules/ ve js/tabs/ modüllerindedir.
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 0. Localization Engine (i18n), Single-Source Registries (EPSG, Drones, Reports)
  if (window.i18n && typeof window.i18n.init === "function") {
    await window.i18n.init("tr");
  }
  if (window.GeodesyEngine && typeof window.GeodesyEngine.loadEpsgRegistry === "function") {
    await window.GeodesyEngine.loadEpsgRegistry();
  }
  if (window.DroneDatabaseManager && typeof window.DroneDatabaseManager.loadDatabase === "function") {
    await window.DroneDatabaseManager.loadDatabase();
  }
  if (window.GnssReportTemplates && typeof window.GnssReportTemplates.loadAllTemplates === "function") {
    await window.GnssReportTemplates.loadAllTemplates();
  }
  if (typeof loadStandardsCatalog === "function") {
    await loadStandardsCatalog();
  }
  if (state.paftaEngine && typeof state.paftaEngine.loadHgmDatabase === "function") {
    await state.paftaEngine.loadHgmDatabase();
  }
  if (state.tg20Engine && typeof state.tg20Engine.loadModelFromJson === "function") {
    state.tg20Engine.loadModelFromJson(); // Asenkron arka planda hazırla
  }

  // 1. Core Services & Shell
  if (typeof initThemeToggle === "function") initThemeToggle();
  if (typeof initKeyboardShortcuts === "function") initKeyboardShortcuts();
  if (typeof initGlobalDragAndDrop === "function") initGlobalDragAndDrop();
  if (typeof initNavigation === "function") initNavigation();
  if (typeof initAboutModal === "function") initAboutModal();
  if (typeof initConsoleControls === "function") initConsoleControls();
  if (typeof initMobileNavDrawer === "function") initMobileNavDrawer();

  // 2. Tab Controllers
  if (typeof initGpsFormatSubtabs === "function") initGpsFormatSubtabs();
  if (typeof initCadastreModule === "function") initCadastreModule();
  if (typeof initMergerDropzone === "function") initMergerDropzone();
  if (typeof initPpkInspector === "function") initPpkInspector();
  if (typeof initRinexQualityInspector === "function") initRinexQualityInspector();
  if (typeof initGeodesy === "function") initGeodesy();
  if (typeof initTg20GeoidStation === "function") initTg20GeoidStation();
  if (typeof initFlightPlannerStudio === "function") initFlightPlannerStudio();
  if (typeof initFormatConverterModule === "function") initFormatConverterModule();
  if (typeof initVersionAndFormatCascader === "function") initVersionAndFormatCascader();
  if (typeof initStandardsLibrary === "function") initStandardsLibrary();
  if (typeof initGuideSearchAndFilter === "function") initGuideSearchAndFilter();

  console.log("🚀 Harita Tools (Beta) Modüler Çekirdek Başarıyla Başlatıldı.");
});

/* <<<<<<<<<< [END MODULE: js/app.js] <<<<<<<<<< */
