const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'web');
const backupDir = path.join(rootDir, 'web_dev_source_backup');

console.log('🔄 [GELİŞTİRİCİ MODUNA GERİ DÖNÜŞ] Başlatılıyor...');

if (fs.existsSync(backupDir)) {
    console.log('📂 Orijinal açık kaynak kodları web/ dizinine geri yükleniyor...');
    fs.cpSync(backupDir, webDir, { recursive: true });
    console.log('✅ [BAŞARILI] Geliştirici modu aktif! Açık kaynak kodlar geri yüklendi.');
} else {
    console.log('⚠️ Yedek dizini (web_dev_source_backup) bulunamadı.');
}
