---
name: gnss-math-engine-patterns
description: >-
  Geodetic computation engine architecture patterns, Web Worker messaging protocol,
  ellipsoid constants management, and module structure conventions for the Harita Tools
  GNSS Web Studio project.
---

# GNSS Math Engine Patterns Skill

This skill codifies the architecture patterns used across the 11 computation engine modules and 2 Web Workers in this project.

---

## 🏗️ 1. Engine Module Structure

Every engine in `web/js/modules/` follows a consistent structure:

```javascript
/**
 * ===================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - [MODÜL ADI] ([SınıfAdı])
 * ===================================================================
 *  - [Yetenek 1]
 *  - [Yetenek 2]
 *  - [Yetenek 3]
 * ===================================================================
 */

// 1. Sabitler & Konfigürasyon (modül kapsamında)
const CONSTANTS = { ... };

// 2. Ana Sınıf veya Fonksiyonlar
class EngineName {
  constructor() {
    this.isLoaded = false;
    this.isLoading = false;
    // Varsayılan parametreler
  }

  // 3. Veri Yükleme / Model Başlatma
  loadModel(data) { ... }

  // 4. Hesaplama / Dönüşüm Metotları
  compute(input) { ... }

  // 5. Toplu İşlem (Batch)
  batchCompute(points) {
    return points.map(p => this.compute(p));
  }
}
```

### Mevcut Motor Envanteri:

| Motor | Sınıf/Pattern | Satır | Görev |
|-------|-------------|-------|-------|
| `geodesyEngine.js` | Global fonksiyonlar + `DEFAULT_EPSG_DATA` | 920 | TM/UTM projeksiyon, Bursa-Wolf, Helmert |
| `tg20GeoidEngine.js` | `class Tg20GeoidEngine` | 754 | Jeoit undülasyonu interpolasyonu |
| `rinexPowerEngine.js` | Fonksiyonel | 900+ | RINEX parse, merge, crop, decimate |
| `gnssFormatEngine.js` | Fonksiyonel | 1200+ | RW5, SurvCE, Leica GSI, CHCNAV parser |
| `flightPlannerEngine.js` | Fonksiyonel | 1200+ | İHA uçuş planlama, YKN optimizasyonu |
| `paftaIndexEngine.js` | Fonksiyonel | 700+ | 1/100K→1/1K pafta hesabı |
| `universalFormatConverterEngine.js` | Fonksiyonel | 1000+ | NCN, DXF, KML, CSV üretici |
| `rw5CadastreModule.js` | Fonksiyonel | 400+ | Kadastro çift okuma analizi |

---

## 🔬 2. Geodezik Sabitler Yönetimi

Projedeki tüm motorlar aşağıdaki sabitleri kullanır. Yeni motor eklerken bu değerleri **kopyalama**, ilgili motordan **referans al**:

### WGS-84 / GRS-80 Elipsoit:
```javascript
const WGS84_A  = 6378137.0;                    // Yarı büyük eksen (m)
const WGS84_F  = 1.0 / 298.257223563;          // Basıklık
const WGS84_B  = WGS84_A * (1.0 - WGS84_F);   // Yarı küçük eksen (m)
const WGS84_E2 = (WGS84_A**2 - WGS84_B**2) / WGS84_A**2;  // 1. eksantriklik²
```

### Fiziksel Sabitler (SPP Worker):
```javascript
const C_LIGHT     = 299792458.0;         // Işık hızı (m/s)
const MU_GPS      = 3.986005e14;         // Yerçekim sabiti (m³/s²)
const OMEGA_E_DOT = 7.2921151467e-5;     // Dünya açısal hızı (rad/s)
const REL_F       = -4.442807633e-10;    // Rölativistik düzeltme (s/√m)
```

### TG-20 Jeoit Grid Parametreleri:
```javascript
// Türkiye sınırları (TG-20 grid coverage)
minLat: 35.5, maxLat: 42.5     // ~7° kuzey-güney
minLon: 25.5, maxLon: 45.0     // ~19.5° doğu-batı
dLat: 1/60, dLon: 1/60         // 1 dakika (arc-minute) çözünürlük
nRows: 421, nCols: 1171        // Grid boyutu
```

---

## 📡 3. Web Worker Mesaj Protokolü

Worker'larla iletişim standart bir mesaj protokolüne sahip:

### Ana Thread → Worker (Gönderme):
```javascript
worker.postMessage({
  action: "PROCESS_SPP",     // İş tipi (büyük harf, snake_case değil)
  obsText: "...",            // Girdi verisi (string)
  navText: "...",            // İkincil girdi
  stepSeconds: 30,           // Parametreler
  obsFileName: "test.obs",   // Dosya bilgisi
  navFileName: "test.nav"
});
```

### Worker → Ana Thread (Yanıt mesaj tipleri):
```javascript
// İlerleme bildirimi
self.postMessage({ type: "PROGRESS", value: 45 });

// Log mesajı (konsola yazılır)
self.postMessage({ type: "LOG", text: "🛰️ 12 uydu bulundu" });

// Sonuç verisi
self.postMessage({ type: "RESULT", data: { ... } });

// Hata bildirimi
self.postMessage({ type: "ERROR", message: "Navigasyon verisi bulunamadı" });
```

### Ana Thread'de Dinleme:
```javascript
worker.onmessage = (e) => {
  const { type, value, text, data, message } = e.data;
  switch (type) {
    case "PROGRESS": updateProgressBar(value); break;
    case "LOG":      appendToConsole(text); break;
    case "RESULT":   handleResult(data); break;
    case "ERROR":    showToast(message, "error"); break;
  }
};
```

---

## 🧮 4. Birim Dönüşüm Kuralları

Tüm motorlarda tutarlı kullanılması gereken dönüşümler:

```javascript
// Açı Dönüşümleri
const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

// GNSS saat dönüşümleri
const SECONDS_PER_WEEK = 604800;     // GPS hafta saniyesi
const SECONDS_PER_HALF_WEEK = 302400;

// Koordinat hassasiyeti
// Y, X, h, H → 3 ondalık basamak (mm seviyesi)
// Enlem, Boylam → 8 ondalık basamak (mm seviyesi)
// Jeoit N → 3 ondalık basamak
```

---

## 📦 5. Yeni Motor Ekleme Kontrol Listesi

Yeni bir hesaplama motoru eklerken:

1. `web/js/modules/` altında `[isim]Engine.js` dosyası oluştur
2. Dosya başına standart JSDoc yorum bloğu ekle (bkz. Bölüm 1)
3. Sabitleri merkezi tanımla, başka motorlardan kopyalama
4. `index.html`'de `<script src="js/modules/[isim]Engine.js"></script>` ekle — `app.js`'den **önce**
5. `app.js`'de ilgili tab'ın init fonksiyonunda motoru başlat
6. Ağır hesaplama gerekiyorsa `web/js/workers/` altında ayrı Worker oluştur
7. Worker mesaj protokolünü takip et: `PROGRESS`, `LOG`, `RESULT`, `ERROR`
