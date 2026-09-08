const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..', 'web', 'js');

function scanDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(scanDir(full));
    } else if (item.name.endsWith('.js') && item.name !== 'app.bundle.js' && item.name !== 'componentCache.js') {
      results.push(full);
    }
  }
  return results;
}

const files = scanDir(baseDir);
const report = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(baseDir, file).replace(/\\/g, '/');
  
  let throwErrors = [];
  let hardcodedTurkish = [];
  let htmlStrings = [];
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    
    // Throw error checks
    if (/throw\s+new\s+Error\s*\(\s*['"`][^'"`]+['"`]/.test(trimmed)) {
      throwErrors.push({ line: idx + 1, code: trimmed });
    }
    
    // Turkish characters in code strings (excluding comments)
    if (/[ğüşıöçĞÜŞİÖÇ]/.test(line)) {
      if (/['"`][^'"`]*[ğüşıöçĞÜŞİÖÇ][^'"`]*['"`]/.test(line)) {
        hardcodedTurkish.push({ line: idx + 1, code: trimmed.slice(0, 100) });
      }
    }
    
    // HTML tag strings in non-template engines
    if (rel.startsWith('modules/') && rel !== 'modules/gnssReportTemplates.js') {
      if (/<[a-zA-Z][^>]*>/.test(line) && !line.includes('<=') && !line.includes('=>') && !line.includes('Math.')) {
        htmlStrings.push({ line: idx + 1, code: trimmed.slice(0, 100) });
      }
    }
  });
  
  report.push({
    file: rel,
    totalLines: lines.length,
    throwsCount: throwErrors.length,
    throws: throwErrors,
    turkishStringsCount: hardcodedTurkish.length,
    turkishSamples: hardcodedTurkish.slice(0, 10),
    htmlInEngineCount: htmlStrings.length,
    htmlSamples: htmlStrings.slice(0, 10)
  });
});

console.log(JSON.stringify(report, null, 2));
