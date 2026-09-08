const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'web');
const backupDir = path.join(rootDir, 'web_dev_source_backup');

console.log('🛡️ [KORUMA MOTORU] Başlatılıyor...');

// 1. Orijinal Geliştirici Kaynaklarını Yedekle (Her zaman en güncel web/ içeriğini al)
console.log('📦 Geliştirme kaynak kodları web_dev_source_backup/ klasörüne güncelleniyor...');
fs.cpSync(webDir, backupDir, { recursive: true });

// 2. Şifrelenecek JS Dosyaları
const jsFiles = [
    'js/modules/geodesyEngine.js',
    'js/modules/gnssFormatEngine.js',
    'js/modules/rinexPowerEngine.js',
    'js/workers/rinex_merger_worker.js',
    'js/workers/pos_worker.js',
    'js/app.js'
];

console.log('🔒 JavaScript dosyaları multi-layer obfuscation ile şifreleniyor...');

for (const relPath of jsFiles) {
    const srcFile = path.join(backupDir, relPath);
    const destFile = path.join(webDir, relPath);
    
    if (fs.existsSync(srcFile)) {
        console.log(`  ⚡ Şifreleniyor: ${relPath}...`);
        const originalCode = fs.readFileSync(srcFile, 'utf-8');
        
        const obfuscationResult = JavaScriptObfuscator.obfuscate(originalCode, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.35,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.8,
            selfDefending: true,
            disableConsoleOutput: false
        });

        fs.writeFileSync(destFile, obfuscationResult.getObfuscatedCode(), 'utf-8');
    }
}

// 3. UI Hardening (Sağ tık ve F12 kilit scripti ekle)
const indexPath = path.join(webDir, 'index.html');
if (fs.existsSync(indexPath)) {
    let indexHtml = fs.readFileSync(indexPath, 'utf-8');
    
    const securityScript = `
  <!-- 🛡️ CLIENT SECURITY & ANTI-TAMPER SHIELD -->
  <script>
    (function() {
      // Sessiz Sağ Tık (Context Menu) Engeli
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
      });

      // Sessiz Geliştirici Kısayolları Engeli (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S)
      document.addEventListener('keydown', function(e) {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
          (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
        ) {
          e.preventDefault();
        }
      });
    })();
  </script>
`;

    if (!indexHtml.includes('CLIENT SECURITY & ANTI-TAMPER SHIELD')) {
        indexHtml = indexHtml.replace('</body>', `${securityScript}\n</body>`);
        fs.writeFileSync(indexPath, indexHtml, 'utf-8');
    }
}

console.log('🎉 [BAŞARILI] Tüm proje şifrelendi ve korumalı hale getirildi!');
