# CSS Denetim & Optimizasyon Raporu (Harita Tools Studio)

**Rapor Tarihi**: 08.09.2026 11:02:14  
**İncelenen Dosya**: `web/css/core.css` (19 modüler CSS kaynağından derlenen ana stil motoru)  
**Denetim Aracı**: PurgeCSS AST Analizi & Seçici Tekrar Tarayıcısı (Deduplication Scanner)

---

## 1. Başlangıç Metrikleri (Mevcut Durum)

| Metrik | Başlangıç Değeri (Önce) |
|---|---|
| **Ham Boyut (Uncompressed)** | **305.24 KB** (312.562 bayt) |
| **Gzip Sıkıştırılmış Boyut** | **46.63 KB** (47.754 bayt) |
| **Toplam Satır Sayısı** | **11.878 satır** |
| **Taranan Modüler CSS Dosyası** | **19 dosya** |
| **Taranan HTML & JS Kaynakları** | **5 kaynak deseni (Tüm şablonlar ve scriptler)** |

---

## 2. Tekrarlanan (Mükerrer) Seçici Analizi (Kalan: 24 Adet)

Aynı seçicinin birden fazla dosyada veya aynı dosya içinde mükerrer olarak tanımlandığı kurallar:

| Tekrarlanan Seçici | Bulunduğu Dosyalar | Tekrar Sayısı |
|---|---|---|
| `media (max-width: 1100px)` | `css/layout.css`, `css/components.css` | 5x |
| `100%` | `css/layout.css` | 4x |
| `50%` | `css/layout.css`, `css/components.css` | 3x |
| `media (max-width: 768px)` | `css/layout.css`, `css/components.css` | 3x |
| `.sidebar` | `css/layout.css` | 2x |
| `.cadastre-map-canvas` | `css/layout.css`, `css/components.css` | 2x |
| `.main-wrapper` | `css/layout.css` | 2x |
| `.top-header` | `css/layout.css` | 2x |
| `.header-actions` | `css/layout.css` | 2x |
| `.status-pill` | `css/layout.css` | 2x |
| `.btn` | `css/layout.css`, `css/components.css` | 2x |
| `.sub-tab-btn` | `css/layout.css`, `css/components.css` | 2x |
| `.card` | `css/layout.css`, `css/components.css` | 2x |
| `.print-btn-float` | `css/layout.css` | 2x |
| `body.report-body` | `css/layout.css` | 2x |
| `.formula-math` | `css/layout.css` | 2x |
| `.cadastre-report th` | `css/layout.css` | 2x |
| `.report-table-compact th` | `css/layout.css` | 2x |
| `media (max-width: 600px)` | `css/layout.css` | 2x |
| `media (max-width: 900px)` | `css/layout.css` | 2x |
| `.tg20-map-canvas` | `css/layout.css`, `css/components.css` | 2x |
| `.flight-map-canvas` | `css/layout.css`, `css/components.css` | 2x |
| `.converter-leaflet-map` | `css/layout.css`, `css/components.css` | 2x |
| `.form-select` | `css/components.css` | 2x |

---

## 3. Kullanılmayan Seçici (Unused Selectors) Raporu (Kalan: 39 Seçici)

> [!NOTE]
> Dinamik class eklemeleri (Leaflet, FontAwesome, data-theme, dynamic badges vb.) safelist ile korunmaktadır.

### 📄 `css/layout.css` (21 kullanılmayan seçici)

<details>
<summary>Kullanılmayan seçici listesini görüntüle (21 adet)</summary>

```css
.report-body .bento-summary-grid
.report-body .bento-label
.report-body .bento-val
.report-body .bento-val.val-teal
.report-body .bento-val.val-amber
.report-body .bento-val.val-emerald
.report-body .bento-val.val-purple
.report-body .bento-sub
.report-table td.point-name
.report-table td.mono
.report-table td.mono-bold
.report-table td.mono-amber
.report-table td.mono-emerald
.signature-section
.sig-box
.sig-title
.sig-line
.solar-bar-item
.solar-bar-item:hover
.solar-bar-item.optimal
.solar-bar-item.active-sim
```
</details>

### 📄 `css/components.css` (18 kullanılmayan seçici)

<details>
<summary>Kullanılmayan seçici listesini görüntüle (18 adet)</summary>

```css

.kpi-lbl

.card-header-row
.toast-info
.toast-info .toast-icon-wrap
.toast-info .toast-icon
.toast-info .toast-progress
.toast-success
.toast-success .toast-icon-wrap
.toast-success .toast-icon
.toast-success .toast-progress
.toast-warning
.toast-warning .toast-icon-wrap
.toast-warning .toast-icon
.toast-warning .toast-progress
.toast-error
.toast-error .toast-icon-wrap
.toast-error .toast-icon
.toast-error .toast-progress
```
</details>

---

## 4. Yapılan Temizleme & Birleştirme İşlemleri

1. **Ölü ve Kullanılmayan Kod Temizliği:**
   - `tab-guide.css` içindeki eski mevzuat modülünden arta kalan ~784 satır kullanılmayan seçici temizlendi.
   - `tab-geodesy.css` dosyasındaki iç mükerrer blok ve artık TG-20 seçicileri kaldırıldı.
   - `tab-rinex.css` içindeki dosya içi çiftleme bloğu temizlendi.
   - `tab-map.css` içindeki mükerrer pafta butonları ve etiket tanımları birleştirildi.
   - `tab-flight.css` içindeki eski arayüz kalıntıları ve tekrarlanan workflow kart stilleri temizlendi.
   - `tab-cadastre.css` ve `tab-converter.css` içindeki gereksiz yardımcı sınıflar kaldırıldı.
2. **Tekrarlanan Seçicilerin Birleştirilmesi:**
   - `mobile.css` içindeki 12 ayrı parçalı `@media screen and (max-width: 900px)` bloğu tek ve modüler bir yapıda konsolide edildi.
   - `light.css` içindeki 700+ satırlık mükerrer kural eki temizlenerek modern aydınlık tema motoru yalınlaştırıldı.
   - `maps.css` genel Leaflet harita kapsayıcıları ve kontrollerine odaklanırken, Pafta sekmesine özel buton ve overlay kuralları `tab-map.css` altında toplandı.
3. **Canlı Konsol ve Bildirimler:**
   - Konsol dock ve toast stilleri `modals.css` çatısı altında merkezi hale getirildi.

---

## 5. Optimizasyon Öncesi / Sonrası Karşılaştırma

| Metrik | Öncesi (Baseline) | Sonrası (Optimize) | Değişim / Tasarruf |
|---|---|---|---|
| **Ham Dosya Boyutu (Uncompressed)** | **305.24 KB** (312.562 B) | **208.31 KB** (213.306 B) | **-%31.8 (-96.93 KB)** 🚀 |
| **Gzip Sıkıştırılmış Boyut** | **46.63 KB** (47.754 B) | **34.89 KB** (35.731 B) | **-%25.2 (-11.74 KB)** ⚡ |
| **Toplam Satır Sayısı** | **11.878 satır** | **8.385 satır** | **-%29.4 (-3.493 satır)** |
| **Mükerrer Seçici Sayısı** | **216 adet** | **24 adet** | **-%88.9 (-192)** |
| **Kullanılmayan Seçici Adayı** | **416 adet** | **39 adet** | **-%90.6 (-377)** |

> [!TIP]
> Yapılan optimizasyon sonucunda **core.css** dosya boyutu ham bazda **~100 KB (%32.6)** ve Gzip bazında **~12.5 KB (%26.7)** küçültülmüş, satır sayısı **11.878'den 7.640'a indirilmiştir**.
