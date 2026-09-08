/**
 * Harita Tools - Auto Bundler & Component Cache Builder for WEB2
 * 1. Caches modular HTML components into web2/js/core/componentCache.js
 * 2. Consolidates modular JS source files into web2/js/app.bundle.js
 * 3. Consolidates web2/css design system into web2/css/core.css
 * 
 * Usage:
 *   node scripts/bundle-web2.js         (Build once)
 *   node scripts/bundle-web2.js --watch (Live watch mode)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'web2');
const bundleOutputFile = path.join(webDir, 'js', 'app.bundle.js');
const componentCacheFile = path.join(webDir, 'js', 'core', 'componentCache.js');
const cssOutputFile = path.join(webDir, 'css', 'core.css');

const CSS_SOURCES = [
  'css/tokens.css',
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/theme.css'
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
  cacheContent += ' * GNSS POS STUDIO - WEB2 COMPONENT CACHE (OFFLINE & FILE:/// COMPATIBLE)\n';
  cacheContent += ' * components/ klasöründeki HTML bileşenlerini otomatik önbelleğe alır.\n';
  cacheContent += ' * ========================================================================= */\n\n';
  cacheContent += 'window.__COMPONENT_CACHE__ = window.__COMPONENT_CACHE__ || {};\n\n';

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file.fullPath, 'utf8');
    cacheContent += `window.__COMPONENT_CACHE__[${JSON.stringify(file.relPath)}] = ${JSON.stringify(content.trim())};\n`;
  }

  fs.writeFileSync(componentCacheFile, cacheContent, 'utf8');
  console.log(`📦 [WEB2 COMPONENT CACHE] ${htmlFiles.length} bileşen önbelleklendi -> web2/js/core/componentCache.js`);
}

function buildCssBundle() {
  const startTime = Date.now();
  let cssContent = '/* =========================================================================\n';
  cssContent += ' * GNSS POS STUDIO - WEB2 CLEAN CORE DESIGN SYSTEM (core.css)\n';
  cssContent += ` * Otomatik Derleme Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
  cssContent += ' * ========================================================================= */\n\n';

  let totalBytes = 0;
  let fileCount = 0;

  for (const relPath of CSS_SOURCES) {
    const fullPath = path.join(webDir, relPath);
    if (!fs.existsSync(fullPath)) {
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
  console.log(`🎨 [WEB2 CSS BUNDLE] ${fileCount} stil modülü paketlendi -> web2/css/core.css (${kbSize} KB) [${elapsed} ms]`);
}

function buildBundle() {
  const startTime = Date.now();
  
  buildComponentCache();
  buildCssBundle();

  let bundleContent = '/* =========================================================================\n';
  bundleContent += ' * GNSS POS STUDIO - WEB2 CONSOLIDATED APPLICATION BUNDLE (app.bundle.js)\n';
  bundleContent += ` * Otomatik Derleme Tarihi: ${new Date().toLocaleString('tr-TR')}\n`;
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
  console.log(`⚡ [WEB2 JS BUNDLE] ${fileCount} modül paketlendi -> web2/js/app.bundle.js (${kbSize} KB) [${elapsed} ms]`);
}

const isWatchMode = process.argv.includes('--watch') || process.argv.includes('-w');
buildBundle();

if (isWatchMode) {
  console.log('👀 [WEB2 WATCH MODU AKTİF] HTML, JS, CSS izleniyor...');
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
          console.log(`🔄 [WEB2 DEĞİŞİKLİK] ${filename} güncellendi...`);
          buildBundle();
        }, 50);
      });
    }
  });
}
