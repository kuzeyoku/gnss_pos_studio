# GNSS Pos Studio — Web

**Harita Tools — Jeodezi, Fotogrametri & GNSS Web Stüdyosu**

Çevrimdışı çalışabilen, sıfır sunucu bağımlılığı olan (statik dosya), Türkiye odaklı jeodezik hesaplama ve GNSS veri analiz stüdyosu.

## Hızlı Başlangıç

```bash
# Ön koşul: Node.js ≥ 18
node scripts/bundle.js        # Tek seferlik derleme
node scripts/server.js         # http://localhost:8088 dev sunucusu
```

Tarayıcıda `http://localhost:8088` adresine gidin.  
Alternatif olarak `web/index.html` dosyasını doğrudan tarayıcıda açabilirsiniz (`file:///` protokolü desteklenir).

## Geliştirme

### Kaynak Dosya Yapısı

```
web/
├── index.html                  # 69 satırlık modüler giriş noktası
├── components/                 # HTML bileşenleri (data-component ile yüklenir)
│   ├── sidebar.html
│   ├── header.html
│   ├── consoleDock.html
│   ├── tabs/                   # Her sekme bir HTML bileşeni
│   └── modals/
├── js/
│   ├── core/                   # Çekirdek altyapı (utils, i18n, maps, exporter...)
│   ├── modules/                # Hesaplama motorları (geodesy, RINEX, TG-20, pafta...)
│   ├── tabs/                   # Sekme kontrolcüleri
│   ├── app.js                  # Uygulama başlatıcı
│   ├── app.bundle.js           # 🔴 OTOMATİK ÜRETİLİR — elle düzenlemeyin!
│   └── core/componentCache.js  # 🔴 OTOMATİK ÜRETİLİR — elle düzenlemeyin!
├── css/
│   ├── tokens.css              # Renk/spacing design token'ları
│   ├── reset.css               # CSS reset
│   ├── layout.css              # Shell/sidebar/header
│   ├── components.css          # Ortak UI bileşenleri
│   ├── tabs/                   # Sekmeye özgü stiller
│   ├── light.css               # Aydınlık tema override'ları
│   ├── mobile.css              # Responsive breakpoint'ler
│   └── core.css                # 🔴 OTOMATİK ÜRETİLİR — elle düzenlemeyin!
├── vendor/                     # Offline üçüncü parti kütüphaneler (Leaflet, FA, JSZip)
├── data/                       # Statik veri dosyaları (TG-20, EPSG, HGM datum)
└── locales/                    # Çeviri dosyaları (tr.json)
```

### Build Süreci

Kaynak dosyalarda (`js/`, `css/`, `components/`) değişiklik yaptıktan sonra **mutlaka** build çalıştırın:

```bash
node scripts/bundle.js          # Tek seferlik derleme
# veya
node scripts/bundle.js --watch  # Dosya değişikliklerini otomatik izle ve derle
```

Bu komut 3 çıktı üretir:
1. **`web/js/core/componentCache.js`** — HTML bileşenlerinin JavaScript önbelleği
2. **`web/css/core.css`** — 19 modüler CSS kaynağının birleştirilmiş hali
3. **`web/js/app.bundle.js`** — 31 JS modülünün birleştirilmiş hali

> ⚠️ **DİKKAT:** `app.bundle.js`, `componentCache.js` ve `core.css` dosyalarını asla elle düzenlemeyin.  
> Tüm değişiklikler modüler kaynak dosyalarda yapılmalı, ardından `node scripts/bundle.js` ile yeniden derlenmelidir.

### npm Script'leri

```bash
npm run build     # node scripts/bundle.js
npm run watch     # node scripts/bundle.js --watch
npm run dev       # node scripts/bundle.js --watch (alias)
```

### Hesaplama Motorları

Detaylı API envanteri: [`docs/engine-api-inventory.md`](docs/engine-api-inventory.md)

| Motor | Dosya | Açıklama |
|-------|-------|----------|
| GeodesyEngine | `geodesyEngine.js` | Koordinat dönüşümü, TM projeksiyonu, datum, Helmert, Vincenty |
| Tg20GeoidEngine | `tg20GeoidEngine.js` | HGM TG-20 jeoit modeli, ondülasyon, kot indirgemesi |
| GnssFormatEngine | `gnssFormatEngine.js` | RW5/RAW/CSV/JXL ayrıştırma, çift okuma, DXF/NCN/KML export |
| RinexMergerEngine | `rinexPowerEngine.js` | RINEX header/kalite analizi, birleştirme, PPK çakışma |
| UniversalFormatConverterEngine | `universalFormatConverterEngine.js` | DXF/KML/GPX/NCN/NCZ/CSV/GeoJSON dönüşümü |
| PaftaIndexEngine | `paftaIndexEngine.js` | Türkiye pafta bölümleme (1/100K–1/1K), HGM datum |
| FlightPlannerEngine | `flightPlannerEngine.js` | Fotogrametri uçuş planı, GCP, güneş/hava |
| DroneDatabaseManager | `droneDatabase.js` | Drone/kamera sensör veritabanı |

### Test

```bash
npm test          # Hesaplama motorları unit test'leri (henüz kurulum aşamasında)
```

Manuel test checklist'i: [`docs/manual-smoke-test.md`](docs/manual-smoke-test.md)

## Lisans

Tescilli yazılım. Tüm hakları saklıdır.
