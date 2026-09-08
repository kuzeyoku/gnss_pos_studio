const fs = require('fs');
const path = require('path');

const webDir = path.resolve(__dirname, '..', 'web');
const template = fs.readFileSync(path.join(webDir, 'index.template.html'), 'utf8');

const assembled = template.replace(/<!--\s*@include:([^\s]+)\s*-->/g, (match, relPath) => {
  return fs.readFileSync(path.join(webDir, relPath), 'utf8');
});

const orig = fs.readFileSync(path.join(webDir, 'index.html.bak'), 'utf8');
const idRegex = /id="([^"]+)"/g;

const origIds = new Set();
let m;
while ((m = idRegex.exec(orig)) !== null) {
  origIds.add(m[1]);
}

const assembledIds = new Set();
while ((m = idRegex.exec(assembled)) !== null) {
  assembledIds.add(m[1]);
}

console.log('Original unique IDs count:', origIds.size);
console.log('Assembled unique IDs count:', assembledIds.size);

const missingInAssembled = [...origIds].filter(id => !assembledIds.has(id));
const extraInAssembled = [...assembledIds].filter(id => !origIds.has(id));

console.log('Missing IDs in assembled:', missingInAssembled);
console.log('Extra IDs in assembled:', extraInAssembled);

// Also check all data-i18n attributes
const i18nRegex = /data-i18n="([^"]+)"/g;
const origI18n = new Set();
while ((m = i18nRegex.exec(orig)) !== null) {
  origI18n.add(m[1]);
}

const assembledI18n = new Set();
while ((m = i18nRegex.exec(assembled)) !== null) {
  assembledI18n.add(m[1]);
}

console.log('Original data-i18n count:', origI18n.size);
console.log('Assembled data-i18n count:', assembledI18n.size);
const missingI18n = [...origI18n].filter(k => !assembledI18n.has(k));
console.log('Missing data-i18n in assembled:', missingI18n);
