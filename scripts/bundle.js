/**
 * Harita Tools - Auto Bundler & Component Cache Builder
 * 1. Caches modular HTML components into web/js/core/componentCache.js (preserving 69-line modular index.html)
 * 2. Consolidates modular JS source files into web/js/app.bundle.js
 * 
 * Usage:
 *   node scripts/bundle.js         (Build once)
 *   node scripts/bundle.js --watch (Live watch mode)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'web');
const bundleOutputFile = path.join(webDir, 'js', 'app.bundle.js');
const componentCacheFile = path.join(webDir, 'js', 'core', 'componentCache.js');
const cssOutputFile = path.join(webDir, 'css', 'core.css');

const CSS_SOURCES = [
  'css/foundation.css',
  'css/components.css',
  'css/layout.css',
  'css/responsive-theme.css'
];

const BUNDLE_SOURCES = [
  // 1. Core Framework & Utilities
  'js/core/geodesyConstants.js',
  'js/core/geometryUtils.js',
  'js/core/utils.js',
  'js/core/componentCache.js',
  'js/core/componentLoader.js',
  'js/core/i18n.js',
  'js/core/console.js',
  'js/core/cacheStore.js',
  'js/core/dragdrop.js',
  'js/core/maps.js',
  'js/core/exporter.js',

  // 2. Geodetic & Engineering Computation Engines
  'js/modules/geodesyEngine.js',
  'js/modules/paftaIndexEngine.js',
  'js/modules/tg20GeoidEngine.js',
  'js/modules/gnssReportTemplates.js',
  'js/modules/gnssFormatEngine.js',
  'js/modules/rinexPowerEngine.js',
  'js/modules/droneDatabase.js',
  'js/modules/flightPlannerEngine.js',
  'js/modules/universalFormatConverterEngine.js',

  // 3. Global State Registry & Navigation Shell
  'js/core/state.js',
  'js/core/navigation.js',

  // 4. Tab Controllers
  'js/tabs/cadastreTab.js',
  'js/tabs/rinexTab.js',
  'js/tabs/mapTab.js',
  'js/tabs/geodesyTab.js',
  'js/tabs/toolsTab.js',
  'js/tabs/tg20Tab.js',
  'js/tabs/flightTab.js',
  'js/tabs/converterTab.js',
  'js/tabs/guideTab.js',

  // 5. Application Orchestrator
  'js/app.js'
];

/**
 * Derleme 1: Bileşen Önbelleği (web/components altındaki HTML dosyalarını önbelleğe alır)
 * Bu sayede index.html 69 satırlık tertemiz component yapısını korur,
 * aynı zamanda hem file:/// hem de localhost/cPanel ortamında anında çalışır.
 */
function buildComponentCache() {
  const componentsDir = path.join(webDir, 'components');
  const reportsDir = path.join(webDir, 'reports');
  
  function getHtmlFiles(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getHtmlFiles(fullPath));
      } else if (entry.name.endsWith('.html')) {
        const rel = path.relative(webDir, fullPath).replace(/\\/g, '/');
        files.push({ relPath: rel, fullPath });
      }
    }
    return files;
  }

  const htmlFiles = [...getHtmlFiles(componentsDir), ...getHtmlFiles(reportsDir)];
  let cacheContent = '/* =========================================================================\n';
  cacheContent += ' * GNSS POS STUDIO - COMPONENT CACHE (OFFLINE & FILE:/// COMPATIBLE)\n';
  cacheContent += ' * components/ klasöründeki HTML bileşenlerini otomatik önbelleğe alır.\n';
  cacheContent += ' * ========================================================================= */\n\n';
  cacheContent += 'window.__COMPONENT_CACHE__ = window.__COMPONENT_CACHE__ || {};\n\n';

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file.fullPath, 'utf8');
    cacheContent += `window.__COMPONENT_CACHE__[${JSON.stringify(file.relPath)}] = ${JSON.stringify(content.trim())};\n`;
  }

  fs.writeFileSync(componentCacheFile, cacheContent, 'utf8');
  console.log(`📦 [COMPONENT CACHE] ${htmlFiles.length} bileşen önbelleklendi -> web/js/core/componentCache.js`);
}

/**
 * Derleme 2: CSS Tasarım Sistemini ve Sekme Stillerini Paketle (core.css)
 */
function buildCssBundle() {
  const startTime = Date.now();
  let cssContent = '/* =========================================================================\n';
  cssContent += ' * GNSS POS STUDIO - CONSOLIDATED CORE DESIGN SYSTEM (core.css)\n';
  cssContent += ` * Otomatik Derleme Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
  cssContent += ' * Modüler CSS kaynaklarından otomatik derlenmiştir.\n';
  cssContent += ' * ========================================================================= */\n\n';

  let totalBytes = 0;
  let fileCount = 0;

  for (const relPath of CSS_SOURCES) {
    const fullPath = path.join(webDir, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ [UYARI] CSS dosyası bulunamadı: ${relPath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    totalBytes += content.length;
    fileCount++;

    cssContent += `\n/* --- START: ${relPath} --- */\n`;
    cssContent += content;
    cssContent += `\n/* --- END: ${relPath} --- */\n`;
  }

  fs.writeFileSync(cssOutputFile, cssContent, 'utf8');
  const elapsed = Date.now() - startTime;
  const kbSize = (fs.statSync(cssOutputFile).size / 1024).toFixed(1);
  console.log(`🎨 [CSS BUNDLE] ${fileCount} stil modülü paketlendi -> web/css/core.css (${kbSize} KB) [${elapsed} ms]`);
}

/**
 * Derleme 3: JavaScript Modüllerini Paketle
 */
function buildBundle() {
  const startTime = Date.now();
  
  // Önce bileşenleri önbelleğe al
  buildComponentCache();

  // CSS Tasarım Sistemini birleştir
  buildCssBundle();

  let bundleContent = '/* =========================================================================\n';
  bundleContent += ' * GNSS POS STUDIO - CONSOLIDATED APPLICATION BUNDLE (app.bundle.js)\n';
  bundleContent += ` * Otomatik Derleme Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
  bundleContent += ' * Modüler kaynak kodlardan otomatik üretilmiştir.\n';
  bundleContent += ' * ========================================================================= */\n\n';

  let totalBytes = 0;
  let fileCount = 0;

  for (const relPath of BUNDLE_SOURCES) {
    const fullPath = path.join(webDir, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ [UYARI] JS dosyası bulunamadı: ${relPath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    totalBytes += content.length;
    fileCount++;

    bundleContent += `\n/* >>>>>>>>>> [MODULE: ${relPath}] >>>>>>>>>> */\n`;
    bundleContent += content;
    bundleContent += `\n/* <<<<<<<<<< [END MODULE: ${relPath}] <<<<<<<<<< */\n`;
  }

  fs.writeFileSync(bundleOutputFile, bundleContent, 'utf8');
  const elapsed = Date.now() - startTime;
  const kbSize = (fs.statSync(bundleOutputFile).size / 1024).toFixed(1);
  console.log(`⚡ [JS BUNDLE] ${fileCount} modül paketlendi -> web/js/app.bundle.js (${kbSize} KB) [${elapsed} ms]`);

  // 4. Service Worker ve index.html önbellek versiyonlarını senkronize et
  const buildVersion = Date.now();
  updateVersionTags(buildVersion);
}

/**
 * Derleme 4: Service Worker & index.html Önbellek ve Versiyon Etiketlerini Senkronize Et
 */
function updateVersionTags(version) {
  // 1. sw.js içindeki CACHE_NAME'i güncelle
  const swFile = path.join(webDir, 'sw.js');
  if (fs.existsSync(swFile)) {
    let swContent = fs.readFileSync(swFile, 'utf8');
    swContent = swContent.replace(/const CACHE_NAME = ['"][^'"]+['"];/, `const CACHE_NAME = 'gnss-pos-studio-v${version}';`);
    fs.writeFileSync(swFile, swContent, 'utf8');
    console.log(`🛡️ [SERVICE WORKER] Önbellek sürümü güncellendi -> gnss-pos-studio-v${version}`);
  }

  // 2. index.html içindeki CSS ve JS ?v= versiyon parametrelerini güncelle
  const indexFile = path.join(webDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    let indexContent = fs.readFileSync(indexFile, 'utf8');
    indexContent = indexContent.replace(/(href=["']css\/[^"']+\.css)\?v=[^"']*(["'])/g, `$1?v=${version}$2`);
    indexContent = indexContent.replace(/(src=["']js\/app\.bundle\.js)\?v=[^"']*(["'])/g, `$1?v=${version}$2`);
    fs.writeFileSync(indexFile, indexContent, 'utf8');
    console.log(`🏷️ [INDEX.HTML] Cache buster versiyonları güncellendi -> ?v=${version}`);
  }
}

// Komut satırı parametreleri
const isWatchMode = process.argv.includes('--watch') || process.argv.includes('-w');

// İlk tam derlemeyi gerçekleştir
buildBundle();

if (isWatchMode) {
  console.log('👀 [WATCH MODU AKTİF] HTML bileşenleri, JS modülleri, CSS stilleri ve çeviriler izleniyor...');

  let debounceTimer = null;

  const watchTargets = [
    path.join(webDir, 'components'),
    path.join(webDir, 'js'),
    path.join(webDir, 'locales'),
    path.join(webDir, 'css')
  ];

  watchTargets.forEach(targetDir => {
    if (fs.existsSync(targetDir)) {
      fs.watch(targetDir, { recursive: true }, (eventType, filename) => {
        if (!filename || filename.includes('app.bundle.js') || filename.includes('componentCache.js') || filename.includes('core.css') || filename.endsWith('.tmp') || filename.endsWith('~') || filename.startsWith('.')) {
          return;
        }
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`🔄 [DEĞİŞİKLİK] ${filename} güncellendi...`);
          buildBundle();
        }, 50);
      });
    }
  });
}
