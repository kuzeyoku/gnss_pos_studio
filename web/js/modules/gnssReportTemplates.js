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
  if (typeof window === "undefined" || !window.location || typeof window.location.pathname !== "string") {
    return "";
  }
  try {
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
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
  if (cachedCadastreTemplate) return cachedCadastreTemplate;
  if (typeof window !== "undefined" && window.__COMPONENT_CACHE__ && window.__COMPONENT_CACHE__["reports/cadastre-karne.html"]) {
    cachedCadastreTemplate = window.__COMPONENT_CACHE__["reports/cadastre-karne.html"];
    return cachedCadastreTemplate;
  }
  return "";
}

/**
 * Senkron olarak TG-20 Jeoit Raporu şablonunu döner
 */
function getTg20Template() {
  if (cachedTg20Template) return cachedTg20Template;
  if (typeof window !== "undefined" && window.__COMPONENT_CACHE__ && window.__COMPONENT_CACHE__["reports/tg20-report.html"]) {
    cachedTg20Template = window.__COMPONENT_CACHE__["reports/tg20-report.html"];
    return cachedTg20Template;
  }
  return "";
}

/**
 * Şablonu dinamik veriler ve aktif dil sözlüğündeki (locales) metinlerle birleştirir.
 * HTML içinde ve motorda hiçbir statik metin barındırmaz, tüm metinler locale dosyasından gelir.
 * 
 * @param {string} templateHtml - data-i18n ve {{TOKEN}} içeren saf HTML şablonu
 * @param {Object} dynamicReplacements - Hesaplama motorundan gelen dinamik değerler
 * @returns {string} - Tamamen locale metinleriyle doldurulmuş rapor HTML çıktısı
 */
function hydrateTemplate(templateHtml, dynamicReplacements = {}) {
  if (!templateHtml) return "";
  let output = templateHtml;

  // 1. Dinamik hesaplama verilerini değiştir ({{KEY}})
  for (const [key, val] of Object.entries(dynamicReplacements)) {
    output = output.replace(new RegExp(`{{${key}}}`, "g"), String(val ?? ""));
  }

  // 2. data-i18n özniteliklerini aktif dil sözlüğünden çekerek HTML içine yerleştir
  output = output.replace(/<([a-zA-Z0-9]+)([^>]*?)\s+data-i18n="([^"]+)"([^>]*?)>([\s\S]*?)<\/\1>/gi, (match, tag, before, i18nKey, after, existingContent) => {
    let text = "";
    if (typeof window !== "undefined" && typeof window.t === "function") {
      text = window.t(i18nKey);
    } else if (typeof window !== "undefined" && window.__HARITA_TR_TRANSLATIONS__) {
      const parts = i18nKey.split(".");
      let cur = window.__HARITA_TR_TRANSLATIONS__;
      for (const p of parts) {
        cur = (cur && typeof cur === "object") ? cur[p] : null;
      }
      if (typeof cur === "string") text = cur;
    }

    // Eğer tag içinde başka dinamik içerik varsa onu koru
    const content = text || existingContent || "";
    return `<${tag}${before} data-i18n="${i18nKey}"${after}>${content}</${tag}>`;
  });

  return output;
}

/**
 * TG-20 Jeoit Raporunu saf veriden HTML çıktısına dönüştürür (Template View Renderer)
 * Motordan bağımsızdır, tüm DOM/HTML etiketleri ve çeviriler burada yönetilir.
 * @param {Object} data - Hesaplama motorundan gelen saf veri nesnesi
 * @returns {string} - Tamamen işlenmiş, i18n destekli A4 yazdırılabilir HTML
 */
function renderTg20Report(data = {}) {
  const template = getTg20Template();
  if (!template) return "";

  const rows = data.rows || [];
  const tFunc = typeof t === "function" ? t : (k, f) => f || k;
  const rowsHtml = rows.length === 0
    ? `<tr><td colspan="10" class="empty-table-cell" data-i18n="reports.emptyData"></td></tr>`
    : rows.map((r, idx) => {
        const isPair = r.isPair ?? (r.typeCode === "PAIR_AVG");
        const badgeCls = isPair ? "badge badge-blue" : "badge badge-amber";
        const typeLabel = isPair
          ? tFunc("reports.typeDualAvg", "Çift Okuma Ort.")
          : tFunc("reports.typeSingle", "Tekil Ölçü");
        return `
          <tr>
            <td class="col-mono col-dim">${idx + 1}</td>
            <td class="col-name">${r.name || "-"}</td>
            <td class="col-mono">${r.lat || "-"}°</td>
            <td class="col-mono">${r.lon || "-"}°</td>
            <td class="col-mono">${r.y || "-"}</td>
            <td class="col-mono">${r.x || "-"}</td>
            <td class="col-mono">${r.h || "-"} m</td>
            <td class="col-geoid">${r.N || "--"} m</td>
            <td class="col-ortho">${r.H || "-"} m</td>
            <td><span class="${badgeCls}">${typeLabel}</span></td>
          </tr>
        `;
      }).join("");

  const meridian = data.centralMeridian || 30;
  const projStr = data.projectionStr || tFunc("reports.lblProjectionVal", "ITRF-96 TM 3° Dilim {meridian}° E").replace("{meridian}", meridian);
  const totalCount = data.totalPoints ?? rows.length;
  const matched = data.matchedCount ?? 0;
  const unmatched = data.unmatchedCount ?? 0;
  const totalPointsStr = data.totalPointsStr || `${totalCount} ${tFunc("reports.thPointName", "Nokta")} (${matched} ${tFunc("reports.typeDualAvg", "Çift Okuma")}, ${unmatched} ${tFunc("reports.typeSingle", "Tekil")})`;
  const avgUnd = typeof data.avgUndulation === "number"
    ? `${data.avgUndulation > 0 ? "+" : ""}${data.avgUndulation.toFixed(3)} m`
    : (data.avgUndulationStr || "+0.000 m");

  const dynamicReplacements = {
    PROJECT: data.projectName || tFunc("cadastre.tg20ReportTitle", "GNSS RTK / CORS TG-20 JEOİT İNDİRGEME RAPORU"),
    DATE: data.date || new Date().toLocaleDateString("tr-TR"),
    TIME: data.time || new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    PROJECTION_STR: projStr,
    TOTAL_POINTS: totalPointsStr,
    AVG_UNDULATION: avgUnd,
    TABLE_ROWS: rowsHtml
  };

  return hydrateTemplate(template, dynamicReplacements);
}

/**
 * Resmi Kadastro Çift Okuma Karnesini saf veriden HTML çıktısına dönüştürür
 * Tüm tablo başlıkları, etiketler ve metinler reports/cadastre-karne.html içindedir.
 * @param {Object} data - Hesaplama motorundan gelen saf veri nesnesi
 * @returns {string} - Tamamen işlenmiş, i18n destekli A4 yazdırılabilir HTML
 */
function renderCadastreKarne(data = {}) {
  const template = getCadastreTemplate();
  if (!template) return "";

  const pairs = data.pairs || [];
  const unmatched = data.unmatched || [];

  const pairsRows = pairs.length === 0
    ? `<tr><td colspan="14" class="empty-table-cell" data-i18n="reports.noMatchedPairs"></td></tr>`
    : pairs.map(pair => {
        const distClass = pair.isDistPassed ? "passed" : "failed";
        const distI18n = pair.isDistPassed ? "reports.statusPassed" : "reports.statusFailed";
        const timeClass = pair.isTimePassed ? "passed" : "warning";
        const hVal = data.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;

        return `
          <tr>
            <td><strong>${pair.pointName}</strong></td>
            <td>${pair.p1?.dt || "-"}</td>
            <td>${pair.p1?.tm || "-"}</td>
            <td>${pair.p2?.dt || "-"}</td>
            <td>${pair.p2?.tm || "-"}</td>
            <td class="${timeClass}">${pair.timeDiffStr || `${pair.timeDiffMin} dk`}</td>
            <td>${pair.dy}</td>
            <td>${pair.dx}</td>
            <td>${pair.dh}</td>
            <td class="font-bold">${pair.ds2d}</td>
            <td class="${distClass}"><span data-i18n="${distI18n}"></span></td>
            <td>${pair.avgE}</td>
            <td>${pair.avgN}</td>
            <td>${hVal}</td>
          </tr>
        `;
      }).join("");

  const unmatchedRows = unmatched.map((pt, idx) => {
    const hVal = data.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : (pt.h != null ? pt.h.toFixed(3) : "-");
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
        <td><span class="badge badge-amber" data-i18n="reports.badgeSingleWarn"></span></td>
      </tr>
    `;
  }).join("");

  const dynamicReplacements = {
    TITLE: data.title || "",
    DATE: data.date || "",
    MERIDIAN: String(data.centralMeridian || 30),
    PROJECTION_STR: data.projectionStr || "",
    ERROR_LIMIT_STR: data.errorLimitStr || "≤ 7.0 cm",
    MIN_TIME_STR: data.minTimeStr || "≥ 60 Dk",
    TG20_LABEL: data.isTg20Applied ? "(TG-20)" : "",
    UNMATCHED_H_I18N: data.isTg20Applied ? "reports.thElevOrtho" : "reports.thElevEllipsoid",
    UNMATCHED_STYLE: unmatched.length > 0 ? "" : "display: none;",
    PAIRS_ROWS: pairsRows,
    UNMATCHED_ROWS: unmatchedRows
  };

  return hydrateTemplate(template, dynamicReplacements);
}

/**
 * Metin Tabanlı TG-20 Jeoit İndirgeme Raporunu üretir (.TXT Çıktısı)
 * @param {Object} data - { projectName, centralMeridian, date, points: Array }
 * @returns {string} - Standart formatlanmış metin raporu
 */
function renderTg20TextReport(data = {}) {
  const projectName = data.projectName || "TG-20_Kot_Indirgeme";
  const dateStr = data.date || new Date().toLocaleDateString("tr-TR");
  const points = data.points || [];
  const meridianStr = data.centralMeridian ? `Dilim ${data.centralMeridian}° E` : "3° Dilim";

  const tFunc = typeof t === "function" ? t : (k, f) => f || k;
  let rpt = "========================================================================================\n";
  rpt += `          ${tFunc("reports.rptTitle", "GNSS POS WEB STUDIO - TG-20 TÜRKİYE HİBRİT JEOİDİ İNDİRGEME RAPORU")}            \n`;
  rpt += "========================================================================================\n";
  rpt += `${(tFunc("reports.rptProject", "Proje / Dosya")).padEnd(20, " ")}: ${projectName}\n`;
  rpt += `${(tFunc("reports.rptGeoidModel", "Jeoit Modeli")).padEnd(20, " ")}: ${tFunc("reports.rptGeoidModelVal", "Harita Genel Müdürlüğü TG-20 (Türkiye Hibrit Jeoidi 2020)")}\n`;
  rpt += `${(tFunc("reports.rptProjection", "Projeksiyon")).padEnd(20, " ")}: ITRF-96 TM 3° (${meridianStr})\n`;
  rpt += `${(tFunc("reports.rptDate", "Tarih")).padEnd(20, " ")}: ${dateStr}\n`;
  rpt += `${(tFunc("reports.rptTotalPoints", "Toplam Nokta Sayısı")).padEnd(20, " ")}: ${points.length}\n`;
  rpt += `${tFunc("reports.rptFormula", "Temel Bağıntı       : H (Ortometrik) = h (Elipsoit) - N (Jeoit Undülasyonu)")}\n`;
  rpt += "----------------------------------------------------------------------------------------\n";
  rpt += `${tFunc("reports.rptTableHeader", "NOKTA ADI      ENLEM (Lat)  BOYLAM (Lon)  Y (Sağa)       X (Yukarı)     ELİP.(h)   JEOİT(N)  ORT.(H)   DURUM")}\n`;
  rpt += "----------------------------------------------------------------------------------------\n";

  for (let p of points) {
    const pName = String(p.name || "P").padEnd(14, " ");
    const latVal = (p.lat != null && p.lat !== "" && !isNaN(p.lat)) ? parseFloat(p.lat).toFixed(6).padStart(11, " ") : "     -     ";
    const lonVal = (p.lon != null && p.lon !== "" && !isNaN(p.lon)) ? parseFloat(p.lon).toFixed(6).padStart(12, " ") : "      -      ";
    const yVal = (p.y != null && p.y !== "" && !isNaN(p.y)) ? Number(p.y).toFixed(3).padStart(14, " ") : "      -       ";
    const xVal = (p.x != null && p.x !== "" && !isNaN(p.x)) ? Number(p.x).toFixed(3).padStart(14, " ") : "      -       ";
    const hVal = (p.h != null && p.h !== "" && !isNaN(p.h)) ? Number(p.h).toFixed(3).padStart(9, " ") : "    -    ";
    const nVal = (p.N != null && p.N !== "" && !isNaN(p.N)) ? (`+${Number(p.N).toFixed(3)}`).padStart(9, " ") : "    --   ";
    const bigHVal = (p.H != null && p.H !== "" && !isNaN(p.H)) ? Number(p.H).toFixed(3).padStart(9, " ") : "    -    ";
    const isPair = p.isPair ?? (p.typeCode === "PAIR_AVG");
    const statusVal = isPair
      ? tFunc("reports.statusDualAvg", "Çift Okuma Ort.")
      : (p.typeCode === "SINGLE_OBS"
          ? tFunc("reports.statusSingle", "Tekil Ölçü")
          : (p.type || (p.inBounds ? tFunc("reports.statusInBounds", "TG-20 OK") : tFunc("reports.statusOutOfBounds", "Dışında"))));

    rpt += `${pName} ${latVal} ${lonVal} ${yVal} ${xVal} ${hVal} ${nVal} ${bigHVal}   ${statusVal}\n`;
  }

  rpt += "========================================================================================\n";
  rpt += `${tFunc("reports.rptNote", "NOT: Elipsoit Kotları (h) GNSS ölçümünden, Ortometrik Kotlar (H) TG-20 indirgeme\n     sonucu hesaplanmıştır. Bu rapor resmi kadastro işlemlerinde referans olarak kullanılabilir.")}\n`;
  rpt += "========================================================================================\n";

  return rpt;
}

// Global window nesnesi ve CommonJS desteği
if (typeof window !== "undefined") {
  window.GnssReportTemplates = {
    loadReportTemplate,
    loadAllTemplates,
    getCadastreTemplate,
    getTg20Template,
    hydrateTemplate,
    renderTg20Report,
    renderCadastreKarne,
    renderTg20TextReport
  };

  // Sayfa yüklendiğinde arka planda tek kaynak şablonları çek
  if (window.location && typeof window.location.pathname === "string") {
    loadAllTemplates();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadReportTemplate,
    loadAllTemplates,
    getCadastreTemplate,
    getTg20Template,
    hydrateTemplate,
    renderTg20Report,
    renderCadastreKarne,
    renderTg20TextReport
  };
}
