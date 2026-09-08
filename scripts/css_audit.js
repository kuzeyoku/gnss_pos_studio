const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const webDir = path.join(__dirname, '../web');

const CSS_SOURCES = [
  'css/tokens.css',
  'css/reset.css',
  'css/layout.css',
  'css/utilities.css',
  'css/components.css',
  'css/tables.css',
  'css/maps.css',
  'css/modals.css',
  'css/tabs/tab-cadastre.css',
  'css/tabs/tab-rinex.css',
  'css/tabs/tab-map.css',
  'css/tabs/tab-geodesy.css',
  'css/tabs/tab-tools.css',
  'css/tabs/tab-tg20.css',
  'css/tabs/tab-flight.css',
  'css/tabs/tab-converter.css',
  'css/tabs/tab-guide.css',
  'css/light.css',
  'css/mobile.css'
];

function getAllFiles(dir, exts) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'vendor' || entry.name === 'node_modules' || entry.name === '.git') continue;
      files = files.concat(getAllFiles(full, exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      // Exclude bundles and caches to only analyze source files
      if (entry.name === 'app.bundle.js' || entry.name === 'componentCache.js' || entry.name === 'core.css') continue;
      files.push(full);
    }
  }
  return files;
}

const contentFiles = [
  ...getAllFiles(webDir, ['.html']),
  ...getAllFiles(path.join(webDir, 'js'), ['.js'])
];

console.log(`Analyzing ${contentFiles.length} content files (.html, .js)...`);

// Gather all raw text from content files
let allContentText = '';
const wordsSet = new Set();

for (const file of contentFiles) {
  const content = fs.readFileSync(file, 'utf8');
  allContentText += '\n' + content;
  // Match all class-like / identifier-like words
  const words = content.match(/[a-zA-Z0-9_\-\:]+/g) || [];
  for (const w of words) wordsSet.add(w);
}

console.log(`Extracted ${wordsSet.size} unique words/tokens.`);

// Parse CSS Rules roughly into selectors and blocks
function parseCssRules(cssText, sourceFile) {
  const rules = [];
  // Strip comments
  const clean = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // We want to extract top-level rules and rules inside @media
  // Simple brace matcher
  let i = 0;
  let currentSelector = '';
  let insideAtRule = null;
  let atRuleHeader = '';
  let depth = 0;
  let buffer = '';

  while (i < clean.length) {
    const char = clean[i];
    if (char === '{') {
      depth++;
      if (depth === 1) {
        const header = buffer.trim();
        buffer = '';
        if (header.startsWith('@media') || header.startsWith('@supports')) {
          insideAtRule = header;
        } else if (header.startsWith('@keyframes')) {
          // Keyframes block - skip inner parsing
          insideAtRule = header;
        } else {
          currentSelector = header;
        }
      } else if (depth === 2 && insideAtRule && (insideAtRule.startsWith('@media') || insideAtRule.startsWith('@supports'))) {
        currentSelector = buffer.trim();
        buffer = '';
      }
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        if (insideAtRule && insideAtRule.startsWith('@keyframes')) {
          // Store entire keyframe
          rules.push({
            type: 'keyframes',
            name: insideAtRule,
            content: buffer,
            file: sourceFile
          });
        }
        insideAtRule = null;
        buffer = '';
        currentSelector = '';
      } else if (depth === 1 && insideAtRule) {
        if (currentSelector) {
          rules.push({
            type: 'rule',
            atRule: insideAtRule,
            selector: currentSelector,
            body: buffer.trim(),
            file: sourceFile
          });
          currentSelector = '';
          buffer = '';
        }
      } else if (depth === 0) {
        if (currentSelector) {
          rules.push({
            type: 'rule',
            atRule: null,
            selector: currentSelector,
            body: buffer.trim(),
            file: sourceFile
          });
          currentSelector = '';
          buffer = '';
        }
      }
    } else if (char === ';' && depth === 0) {
      // Top-level statement (like @import)
      buffer = '';
    } else {
      buffer += char;
    }
    i++;
  }
  return rules;
}

const allRules = [];
const selectorCounts = {};
const duplicateSelectors = [];

for (const rel of CSS_SOURCES) {
  const full = path.join(webDir, rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');
  const rules = parseCssRules(content, rel);
  for (const r of rules) {
    if (r.type === 'rule') {
      allRules.push(r);
      const selKey = (r.atRule ? r.atRule + ' -> ' : '') + r.selector;
      if (!selectorCounts[selKey]) selectorCounts[selKey] = [];
      selectorCounts[selKey].push({ file: rel, body: r.body });
    }
  }
}

for (const [sel, list] of Object.entries(selectorCounts)) {
  if (list.length > 1) {
    duplicateSelectors.push({ selector: sel, occurrences: list });
  }
}

console.log(`Parsed ${allRules.length} CSS rules.`);
console.log(`Found ${duplicateSelectors.length} duplicate selector definitions.`);

// Analyze selectors for unused candidates
const unusedSelectors = [];
const safeSelectors = [];

function isSelectorUsed(selector) {
  // Split multiple comma-separated selectors
  const parts = selector.split(',').map(s => s.trim()).filter(Boolean);
  
  let usedInAny = false;
  
  for (const part of parts) {
    // Check elements in this selector part
    // Clean pseudo-classes and pseudo-elements
    const cleaned = part
      .replace(/:not\([^)]*\)/g, '')
      .replace(/::?(before|after|hover|active|focus|focus-within|focus-visible|disabled|checked|root|first-child|last-child|nth-child\([^)]*\)|empty|valid|invalid)/g, '')
      .replace(/\[data-theme=["']?[a-zA-Z0-9_\-]+["']?\]/g, '')
      .replace(/\[data-[a-zA-Z0-9_\-]+(=["']?[^"']*["']?)?\]/g, '')
      .replace(/\[type=["']?[a-zA-Z0-9_\-]+["']?\]/g, '')
      .replace(/\[title(=["']?[^"']*["']?)?\]/g, '')
      .replace(/\[aria-[a-zA-Z0-9_\-]+(=["']?[^"']*["']?)?\]/g, '');

    // Extract classes (.classname) and IDs (#idname)
    const classes = (cleaned.match(/\.([a-zA-Z0-9_\-]+)/g) || []).map(c => c.substring(1));
    const ids = (cleaned.match(/#([a-zA-Z0-9_\-]+)/g) || []).map(id => id.substring(1));

    // Special cases: Leaflet, FontAwesome, html, body, svg, table, etc.
    if (part.includes('.leaflet') || part.includes('.fa-') || part.startsWith('html') || part.startsWith('body') || part.startsWith('*') || part.startsWith(':root')) {
      usedInAny = true;
      continue;
    }

    if (classes.length === 0 && ids.length === 0) {
      // Tag-only selector (like table, th, td, input, select, textarea, button, code, kbd, label)
      usedInAny = true;
      continue;
    }

    // Check if classes exist in wordsSet
    let allTokensExist = true;
    for (const c of classes) {
      if (!wordsSet.has(c)) {
        allTokensExist = false;
        break;
      }
    }
    for (const id of ids) {
      if (!wordsSet.has(id)) {
        allTokensExist = false;
        break;
      }
    }

    if (allTokensExist && (classes.length > 0 || ids.length > 0)) {
      usedInAny = true;
    }
  }

  return usedInAny;
}

const unusedRules = [];

for (const rule of allRules) {
  if (!isSelectorUsed(rule.selector)) {
    unusedRules.push(rule);
  }
}

console.log(`Found ${unusedRules.length} potentially unused CSS rules.`);

// Measure core.css sizes
const coreCssPath = path.join(webDir, 'css/core.css');
let coreCssRaw = fs.existsSync(coreCssPath) ? fs.readFileSync(coreCssPath) : Buffer.from('');
let coreCssGzip = zlib.gzipSync(coreCssRaw);

console.log(`Current core.css size: ${(coreCssRaw.length / 1024).toFixed(2)} KB (Gzip: ${(coreCssGzip.length / 1024).toFixed(2)} KB)`);

// Prepare report output
const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

let reportMd = `# CSS Audit & Optimization Report — Harita Tools Web Studio

**Audit Date**: ${new Date().toLocaleString('tr-TR')}  
**Target File**: \`web/css/core.css\` (Bundled from 19 modular CSS files)  
**Total Rules Analyzed**: ${allRules.length}  

---

## 1. Initial CSS Bundle Metrics

| Metric | Initial Value |
|---|---|
| **Raw Uncompressed Size** | ${(coreCssRaw.length / 1024).toFixed(2)} KB (${coreCssRaw.length} bytes) |
| **Gzip Compressed Size** | ${(coreCssGzip.length / 1024).toFixed(2)} KB (${coreCssGzip.length} bytes) |
| **Total Lines in core.css** | ${coreCssRaw.toString('utf8').split('\n').length} |
| **Total Source Files** | 19 modular stylesheets |

---

## 2. Duplicate Selector Analysis (${duplicateSelectors.length} instances)

Below are selector definitions that appear multiple times across source files:

| Duplicate Selector | Files & Occurrences |
|---|---|
`;

for (const dup of duplicateSelectors.slice(0, 50)) {
  const fileList = dup.occurrences.map(o => `\`${o.file}\``).join(', ');
  const cleanSel = dup.selector.replace(/\|/g, '\\|');
  reportMd += `| \`${cleanSel}\` | ${fileList} (${dup.occurrences.length}x) |\n`;
}

reportMd += `\n---

## 3. Potentially Unused Selectors (${unusedRules.length} candidates)

> [!NOTE]
> Selectors listed here had zero occurrences of their class/ID tokens in all HTML components and JS application files.
> Before deletion, each item is classified into **Safe to Remove** (dead legacy code) and **Preserve/Suspicious** (dynamic JS creation, print styles, or third-party Leaflet/vendor extensions).

| File | Selector | Status / Decision |
|---|---|---|
`;

for (const r of unusedRules.slice(0, 100)) {
  const cleanSel = r.selector.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  reportMd += `| \`${r.file}\` | \`${cleanSel}\` | Candidate for Review |\n`;
}

reportMd += `\n---

## 4. Optimization Actions & Results

*(This section will be updated after cleanup and deduplication)*
`;

fs.writeFileSync(path.join(docsDir, 'css-audit-report.md'), reportMd, 'utf8');
console.log('Report written to docs/css-audit-report.md');
