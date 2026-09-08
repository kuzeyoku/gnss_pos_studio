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
