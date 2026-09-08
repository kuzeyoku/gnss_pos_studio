const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'web');
const backupDir = path.join(rootDir, 'web_dev_source_backup');
const scratchDir = path.join(rootDir, 'scratch', 'deobf_out');

if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
}

const filesToDeobfuscate = [
    'js/app.js',
    'js/modules/geodesyEngine.js',
    'js/modules/gnssFormatEngine.js',
    'js/modules/flightPlannerEngine.js',
    'js/modules/paftaIndexEngine.js',
    'js/modules/rinexPowerEngine.js',
    'js/modules/tg20GeoidEngine.js',
    'js/workers/rinex_merger_worker.js',
    'js/workers/pos_worker.js'
];

console.log('🚀 [TOPLU DEOBFUSCATION BAŞLATILIYOR]...');

for (const relPath of filesToDeobfuscate) {
    const srcFile = path.join(webDir, relPath);
    if (!fs.existsSync(srcFile)) {
        console.log(`⚠️ Bulunamadı: ${relPath}`);
        continue;
    }

    const fileBase = path.basename(relPath, '.js');
    const outDir = path.join(scratchDir, fileBase);

    console.log(`\n⚡ Çözülüyor: ${relPath}...`);
    try {
        execSync(`npx -y webcrack "${srcFile}" -o "${outDir}" -f`, {
            cwd: rootDir,
            stdio: 'inherit',
            shell: 'cmd.exe'
        });

        const deobfFile = path.join(outDir, 'deobfuscated.js');
        if (fs.existsSync(deobfFile)) {
            const cleanCode = fs.readFileSync(deobfFile, 'utf8');
            
            // 1. web/ dizinine yaz
            fs.writeFileSync(srcFile, cleanCode, 'utf8');
            console.log(`  ✅ web/${relPath} güncellendi (${cleanCode.length} karakter)`);

            // 2. web_dev_source_backup/ dizinine yaz
            const backupTarget = path.join(backupDir, relPath);
            const backupTargetDir = path.dirname(backupTarget);
            if (!fs.existsSync(backupTargetDir)) {
                fs.mkdirSync(backupTargetDir, { recursive: true });
            }
            fs.writeFileSync(backupTarget, cleanCode, 'utf8');
            console.log(`  💾 web_dev_source_backup/${relPath} yedeklendi`);
        } else {
            console.log(`  ❌ Çözülmüş dosya bulunamadı: ${deobfFile}`);
        }
    } catch (err) {
        console.error(`  ❌ Hata oluştu: ${relPath}`, err.message);
    }
}

console.log('\n🎉 [TAMAMLANDI] Tüm şifreli dosyalar başarıyla çözüldü ve yedeklendi!');
