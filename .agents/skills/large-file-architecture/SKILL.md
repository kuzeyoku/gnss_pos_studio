---
name: large-file-architecture
description: >-
  Project-specific architecture map for navigating and editing large monolithic files
  (7700+ line app.js, 7200+ line style.css, 4000+ line index.html). Section boundaries,
  naming conventions, module registration patterns, and safe editing protocols.
---

# Large File Architecture & Navigation Skill

This skill provides a structural map and editing protocols for the Harita Tools GNSS Web Studio project, which uses large monolithic files.

---

## 📂 1. Project File Map

```
web/
├── index.html          (~4,014 lines)  → All 9+ tab HTML structures
├── css/
│   ├── style.css       (~7,291 lines)  → Master dark theme stylesheet
│   ├── light.css       (~62 KB)        → Light mode overrides [data-theme="light"]
│   ├── mobile.css      (~33 KB)        → Responsive breakpoints & touch
│   └── report.css      (~7 KB)         → Print/PDF report styles
├── js/
│   ├── app.js          (~7,765 lines)  → Main application logic
│   ├── modules/
│   │   ├── geodesyEngine.js            → Koordinat dönüşümü (TM, UTM, Bursa-Wolf, Helmert)
│   │   ├── tg20GeoidEngine.js          → TG-20 jeoit indirgemesi (H = h - N)
│   │   ├── rinexPowerEngine.js         → RINEX parse, merge, crop, decimate
│   │   ├── gnssFormatEngine.js         → RW5, SurvCE, Leica GSI, CHCNAV parser
│   │   ├── flightPlannerEngine.js      → İHA uçuş planlaması & YKN optimizasyonu
│   │   ├── paftaIndexEngine.js         → Türkiye pafta indeksi (1/100K → 1/1K)
│   │   ├── universalFormatConverterEngine.js → NCN, DXF, KML, CSV çıktı üretici
│   │   ├── rw5CadastreModule.js        → Kadastro çift okuma analizi
│   │   ├── hgmDatumDatabase.js         → 226 KB HGM datum veritabanı
│   │   ├── hgmDatumDatabase.json       → JSON datum referans verisi
│   │   └── droneDatabase.js            → İHA marka/model veritabanı
│   └── workers/
│       ├── pos_worker.js               → SPP GNSS konumlama (WLS çözücü)
│       └── rinex_merger_worker.js      → RINEX birleştirme arka plan işlemi
└── data/                               → TG-20 jeoit modeli ve statik veri dosyaları
```

---

## 📐 2. style.css Bölüm Haritası (19 Bölüm)

`style.css` dosyasını düzenlerken doğru bölümü bul. Her bölüm `/* === ... === */` yorum bloğuyla başlar:

| # | Bölüm | Yaklaşık Satır Aralığı | İçerik |
|---|-------|----------------------|--------|
| 01 | DESIGN SYSTEM TOKENS | L1–L130 | `:root` CSS variables, renkler, fontlar |
| 02 | RESET & AMBIENT CANVAS | L130–L200 | `*`, `body`, scrollbar, ambient glow |
| 03 | APP SHELL LAYOUT | L200–L600 | Sidebar, header, content shell |
| 04 | ATOMIC UTILITIES | L600–L800 | `.d-flex`, `.gap-*`, `.text-*`, `.bg-*` |
| 05 | GLASS COMPONENTS & BUTTONS | L800–L1200 | Cards, bento grid, badges, switches |
| 06 | FORMS & INPUTS | L1200–L1500 | Inputs, selects, sliders, dropzones |
| 07 | GLASS DATA TABLES | L1500–L1800 | Dense tables, sticky thead, monospace |
| 08 | INTERACTIVE MAPS & LEAFLET | L1800–L2100 | Harita container, popup, control |
| 09 | MODALS & OVERLAYS | L2100–L2400 | About modal, künyeler, floating panels |
| 10 | CONSOLE & TOAST | L2400–L2800 | Live console dock, toast notifications |
| 11 | TAB: RTK & HAM DATA | L2800–L3400 | RTK subtabs, code editor, koordinatlar |
| 12 | TAB: RINEX STUDIO | L3400–L4000 | Dropzone, time-crop, PPK analyzer |
| 13 | TAB: PAFTA İNDEKSİ | L4000–L4500 | 1/100K-1/1K hierarchy, harita panel |
| 14 | TAB: KOORDİNAT DÖNÜŞÜMÜ | L4500–L5200 | Presets, batch, Bursa-Wolf |
| 15 | TAB: TG-20 JEOİT | L5200–L5700 | Formula box, batch grid |
| 16 | TAB: İHA UÇUŞ | L5700–L6200 | Solar/wind dials, telemetry |
| 17 | TAB: KULLANIM REHBERİ | L6200–L6600 | User guide sections |
| 18 | LIGHT MODE ENGINE | — | `light.css` dosyasında |
| 19 | RESPONSIVE & PRINT | — | `mobile.css` + `report.css` dosyalarında |

### Düzenleme Kuralı:
- **Yeni component** → İlgili TAB bölümüne veya Bölüm 05 (genel component) altına ekle
- **Yeni utility class** → Bölüm 04'e ekle
- **Yeni renk/font token** → Bölüm 01 `:root` bloğuna ekle
- **Asla** farklı bölümlerin CSS'ini karıştırma

---

## 🗂️ 3. index.html Sekme (Tab) Yapısı

HTML'de her sekme `<div class="tool-tab" id="tab-XXX">` ile tanımlı:

| Tab ID | Menü Etiketi | Sidebar Grubu |
|--------|-------------|---------------|
| `tab-home` | Ana Sayfa | Temel Araçlar |
| `tab-cadastre` | RTK & Ham Data | Temel Araçlar |
| `tab-rinex-studio` | RINEX Düzenleyici | Temel Araçlar |
| `tab-map` | Pafta İndeksi & Harita | Temel Araçlar |
| `tab-converter` | Format Dönüştürücü | Temel Araçlar |
| `tab-geodesy` | Koordinat Dönüşümü | Jeodezik Hesap |
| `tab-flight` | İHA Uçuş & YKN | Jeodezik Hesap |
| `tab-tg20` | TG-20 Jeoit İndirgeme | Jeodezik Hesap |
| `tab-standards` | Resmi Mevzuat (PDF) | Mevzuat & Rehber |
| `tab-guide` | Kullanım Rehberi | Mevzuat & Rehber |

### Yeni Sekme Ekleme Protokolü:
1. Sidebar'da `<li class="nav-item" data-tab="tab-yeni">` ekle
2. HTML'de `<div class="tool-tab" id="tab-yeni">` bloğu oluştur
3. `app.js`'de tab switching logic'e kayıt et
4. `style.css`'de yeni TAB bölümü aç (mevcut TAB sıralamasını takip et)

---

## ⚙️ 4. app.js Fonksiyon Organizasyonu

`app.js` tek dosya olmasına rağmen mantıksal bölümlere ayrılmıştır:

1. **Global Utility Functions** (L1–L200): `showToast()`, `downloadTextFile()`, `initKeyboardShortcuts()`, `animateNumber()`
2. **Tab Initialization** (L200–L500): Tab switching, sidebar navigation
3. **Tab-Specific Logic** (L500+): Her tab'ın kendi init, parse, compute, render, export fonksiyonları

### Fonksiyon İsimlendirme Konvansiyonu:
```
init[TabName]()          → Tab ilk yüklendiğinde
parse[Format]Data()      → Dosya ayrıştırma
compute[Operation]()     → Hesaplama
render[Component]()      → DOM güncelleme
export[Format]()         → Dosya indirme
handle[Event]()          → Event listener callback
```

---

## 🛡️ 5. Güvenli Düzenleme Kuralları

1. **Satır referansı ver:** Düzenleme yaparken her zaman ilgili bölümün satır aralığını belirt
2. **Bir bölüm = Bir düzenleme:** Birden fazla bölüme dokunuyorsan, her birini ayrı ayrı belirt
3. **TOC güncel tut:** `style.css` başındaki İÇİNDEKİLER yorumunu güncelle
4. **Modül dosyalarını tercih et:** Yeni büyük fonksiyonelliği `app.js`'e eklemek yerine `web/js/modules/` altında yeni modül oluştur
5. **`<script>` sırası:** `index.html`'deki modül script tag'leri `app.js`'den **önce** yüklenmeli
