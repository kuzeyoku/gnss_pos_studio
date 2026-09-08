---
name: error-resilience-and-validation
description: >-
  Robust error handling, input validation, graceful degradation, and file parse
  resilience patterns for the 20+ file formats processed by Harita Tools GNSS Web Studio.
---

# Error Resilience & Validation Skill

This skill provides error handling patterns for a zero-server client-side application that parses 20+ geodetic file formats entirely in the browser.

---

## 🛡️ 1. File Parse Error Hierarchy

When parsing user-uploaded files, follow this severity hierarchy:

| Seviye | Durum | Kullanıcıya Gösterme | Örnek |
|--------|-------|---------------------|-------|
| **FATAL** | Dosya hiç okunamıyor | `showToast(msg, "error")` | Boş dosya, binary bozuk, encoding hatası |
| **WARNING** | Kısmi veri okundu | `showToast(msg, "warning")` | 100 satırdan 3'ü parse edilemedi |
| **INFO** | Küçük sapma | Console log only | Boş satır atlandı, trailing whitespace temizlendi |
| **SILENT** | Beklenen durum | Log bile yapma | Dosya sonunda boş satır |

### Temel Kural:
```javascript
// ❌ YANLIŞ: Tek bir hatalı satır tüm dosyayı çökertiyor
function parseFile(text) {
  const lines = text.split('\n');
  return lines.map(line => parseStrictLine(line)); // Hatalı satırda throw
}

// ✅ DOĞRU: Hatalı satırları atla, toplu rapor ver
function parseFile(text) {
  const lines = text.split('\n');
  const results = [];
  const errors = [];

  lines.forEach((line, idx) => {
    try {
      const parsed = parseLine(line);
      if (parsed) results.push(parsed);
    } catch (e) {
      errors.push({ line: idx + 1, reason: e.message });
    }
  });

  if (errors.length > 0) {
    showToast(`${results.length} nokta okundu, ${errors.length} satır atlandı.`, "warning");
  }
  return results;
}
```

---

## 📋 2. Desteklenen Format Ailesi & Validasyon Kuralları

### GNSS Arazi Veri Dosyaları:
| Format | Uzantı | Kritik Validasyon |
|--------|--------|-------------------|
| Carlson RW5 | `.rw5` | `--` ile başlayan başlık satırları, `SP,PN` kayıt yapısı |
| SurvCE RW5 | `.rw5` | Farklı header yapısı, GPS kayıt formatı |
| Leica GSI-16 | `.gsi` | `*` ile başlayan satırlar, 16-digit word formatı |
| CHCNAV | `.csv`, `.dat` | Sütun sayısı ve header tanıma |
| Netcad NCN | `.ncn` | `Nokta_No Y X h` sıralı, virgül/boşluk ayraç |

### RINEX Dosyaları:
| Format | Uzantı | Kritik Validasyon |
|--------|--------|-------------------|
| RINEX 2.x Obs | `.YYo`, `.obs` | `RINEX VERSION / TYPE` header, 80-char fixed width |
| RINEX 3.x Obs | `.rnx` | Versiyon `3.0x`, `>` epoch marker |
| RINEX Nav | `.YYn`, `.nav` | GPS broadcast ephemeris kayıtları |
| Hatanaka | `.YYd`, `.crx` | Sıkıştırılmış gözlem, decompress gerekli |

### Çıktı/İhraç Formatları:
| Format | Uzantı | Kritik Validasyon |
|--------|--------|-------------------|
| AutoCAD DXF | `.dxf` | Geçerli entity yapısı, koordinat aralığı |
| Google Earth | `.kml` | Geçerli XML, WGS-84 coğrafi koordinat |
| Excel CSV | `.csv` | UTF-8 BOM, Türkçe karakter koruması |
| RTKLib POS | `.pos` | Fixed-width sütun formatı |

---

## 🔒 3. Koordinat Aralığı Validasyonu

Türkiye sınırları dışındaki koordinatlar büyük olasılıkla hatalıdır:

```javascript
function validateTurkeyCoords(lat, lon) {
  // Türkiye coğrafi sınırları (geniş toleranslı)
  const TURKEY_BOUNDS = {
    minLat: 35.5, maxLat: 42.5,
    minLon: 25.5, maxLon: 45.0
  };

  if (lat < TURKEY_BOUNDS.minLat || lat > TURKEY_BOUNDS.maxLat ||
      lon < TURKEY_BOUNDS.minLon || lon > TURKEY_BOUNDS.maxLon) {
    return { valid: false, reason: `Koordinat Türkiye dışında: ${lat.toFixed(6)}, ${lon.toFixed(6)}` };
  }
  return { valid: true };
}

// TM 3° projeksiyon koordinatları için:
function validateTMCoords(Y, X) {
  // Y (Sağa): 100,000 – 900,000 aralığı
  // X (Yukarı): 3,900,000 – 4,700,000 aralığı (Türkiye)
  if (Y < 100000 || Y > 900000) return { valid: false, reason: `Y (Sağa Değer) aralık dışı: ${Y}` };
  if (X < 3900000 || X > 4700000) return { valid: false, reason: `X (Yukarı Değer) aralık dışı: ${X}` };
  return { valid: true };
}
```

---

## ⚠️ 4. Web Worker Hata Yakalama

Worker'larda yakalanmayan hatalar ana thread'i bilgilendirmeli:

```javascript
// Worker içinde (pos_worker.js / rinex_merger_worker.js):
self.onmessage = async function(event) {
  try {
    // ... hesaplama mantığı ...
    self.postMessage({ type: "RESULT", data: results });
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      message: error.message || "Bilinmeyen hesaplama hatası"
    });
  }
};

// Ana thread'de:
worker.onerror = (e) => {
  showToast("Hesaplama motoru beklenmeyen bir hata ile karşılaştı.", "error");
  console.error("Worker error:", e.message, e.filename, e.lineno);
};

worker.onmessageerror = (e) => {
  showToast("Hesaplama sonucu aktarılamadı.", "error");
};
```

---

## 🧪 5. Input Sanitization Patterns

### Dosya Boyutu Kontrolü:
```javascript
function validateFileSize(file, maxMB = 50) {
  if (file.size > maxMB * 1024 * 1024) {
    showToast(`Dosya çok büyük (${(file.size/1024/1024).toFixed(1)} MB). Maksimum: ${maxMB} MB`, "warning");
    return false;
  }
  return true;
}
```

### Encoding Tespiti:
```javascript
// Türkçe karakterler için encoding kontrolü
function readFileWithEncoding(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target.result;
      // Windows-1254 (Türkçe) encoding sorunlarını kontrol et
      if (text.includes('Ã¶') || text.includes('Ã¼') || text.includes('Ã§')) {
        // Muhtemelen UTF-8 olarak okunmuş Latin-5 dosyası
        showToast("Dosya encoding'i düzeltiliyor (Windows-1254 → UTF-8)...", "info");
      }
      resolve(text);
    };
    reader.readAsText(file, 'UTF-8');
  });
}
```

---

## 📌 6. Toast Mesaj Seviyeleri Kılavuzu

Tutarlı kullanıcı bildirimleri için:

```javascript
// ✅ Başarı: İşlem tamamlandı
showToast("42 nokta başarıyla dönüştürüldü.", "success");

// ℹ️ Bilgi: Nötr bildirim
showToast("Rapor yazdırma penceresi açıldı.", "info");

// ⚠️ Uyarı: Kısmi başarı veya dikkat gerekli
showToast("3 nokta Türkiye sınırları dışında, atlandı.", "warning");

// ❌ Hata: İşlem başarısız
showToast("Dosya formatı tanınamadı.", "error");
```

### Asla Yapma:
- `alert()` kullanma → her zaman `showToast()`
- Console'a hata bas ama kullanıcıyı bilgilendirme → her ERROR seviyesi toast almalı
- Jenerik "Bir hata oluştu" mesajı → spesifik ve anlaşılır mesaj yaz
