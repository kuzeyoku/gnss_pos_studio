const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..', 'web', 'js', 'modules');
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.js'));

console.log('=== MODULES AUDIT ===');
files.forEach(file => {
  const content = fs.readFileSync(path.join(baseDir, file), 'utf8');
  const lines = content.split('\n');
  let throws = [];
  let trLines = [];
  let htmlLines = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    
    if (/throw\s+new\s+Error/.test(trimmed)) {
      throws.push({ line: idx + 1, code: trimmed });
    }
    
    if (/[ğüşıöçĞÜŞİÖÇ]/.test(line) && /['"`]/.test(line)) {
      trLines.push({ line: idx + 1, code: trimmed });
    }

    if (file !== 'gnssReportTemplates.js' && /<[a-zA-Z][^>]*>/.test(line) && !line.includes('<=') && !line.includes('=>') && !line.includes('Math.')) {
      htmlLines.push({ line: idx + 1, code: trimmed });
    }
  });

  console.log(`\n📄 [${file}] - ${lines.length} lines`);
  console.log(`   🚨 Throws: ${throws.length}`);
  throws.forEach(t => console.log(`      L${t.line}: ${t.code}`));
  console.log(`   🌐 Turkish text lines: ${trLines.length}`);
  trLines.slice(0, 8).forEach(t => console.log(`      L${t.line}: ${t.code.slice(0, 90)}`));
  if (trLines.length > 8) console.log(`      ... and ${trLines.length - 8} more`);
  console.log(`   🏷️ HTML tags in code: ${htmlLines.length}`);
  htmlLines.slice(0, 5).forEach(h => console.log(`      L${h.line}: ${h.code.slice(0, 90)}`));
});
