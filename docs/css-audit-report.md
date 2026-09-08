# CSS Denetim & Optimizasyon Raporu (Harita Tools Studio)

**Rapor Tarihi**: 08.09.2026 00:27:18  
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

## 2. Tekrarlanan (Mükerrer) Seçici Analizi (Kalan: 130 Adet)

Aynı seçicinin birden fazla dosyada veya aynı dosya içinde mükerrer olarak tanımlandığı kurallar:

| Tekrarlanan Seçici | Bulunduğu Dosyalar | Tekrar Sayısı |
|---|---|---|
| `media (max-width: 1100px)` | `css/components.css`, `css/tabs/tab-rinex.css`, `css/tabs/tab-flight.css`, `css/tabs/tab-converter.css`, `css/tabs/tab-guide.css` | 5x |
| `100%` | `css/layout.css`, `css/tabs/tab-tg20.css`, `css/tabs/tab-flight.css` | 4x |
| `.sub-tab-btn` | `css/layout.css`, `css/components.css`, `css/mobile.css` | 4x |
| `media (max-width: 768px)` | `css/tabs/tab-cadastre.css`, `css/tabs/tab-tg20.css`, `css/tabs/tab-guide.css` | 4x |
| `body` | `css/reset.css`, `css/mobile.css` | 3x |
| `.sidebar` | `css/layout.css`, `css/mobile.css` | 3x |
| `.main-wrapper` | `css/layout.css`, `css/mobile.css` | 3x |
| `.top-header` | `css/layout.css`, `css/mobile.css` | 3x |
| `.header-actions` | `css/layout.css`, `css/mobile.css` | 3x |
| `.status-pill` | `css/layout.css`, `css/mobile.css` | 3x |
| `50%` | `css/layout.css`, `css/components.css`, `css/tabs/tab-flight.css` | 3x |
| `.btn` | `css/layout.css`, `css/components.css`, `css/mobile.css` | 3x |
| `.dropzone` | `css/components.css`, `css/tabs/tab-rinex.css`, `css/mobile.css` | 3x |
| `.map-floating-toolbar` | `css/components.css`, `css/tabs/tab-flight.css`, `css/mobile.css` | 3x |
| `.map-toolbar-divider` | `css/components.css`, `css/tabs/tab-flight.css`, `css/mobile.css` | 3x |
| `.converter-leaflet-map` | `css/maps.css`, `css/tabs/tab-converter.css`, `css/mobile.css` | 3x |
| `.tg20-map-canvas` | `css/maps.css`, `css/tabs/tab-tg20.css`, `css/mobile.css` | 3x |
| `.flight-map-canvas` | `css/maps.css`, `css/tabs/tab-flight.css`, `css/mobile.css` | 3x |
| `media (max-width: 900px)` | `css/tabs/tab-geodesy.css`, `css/tabs/tab-guide.css` | 3x |
| `html` | `css/reset.css`, `css/mobile.css` | 2x |
| `select` | `css/reset.css`, `css/mobile.css` | 2x |
| `.mobile-sidebar-close-btn` | `css/layout.css`, `css/mobile.css` | 2x |
| `.mobile-menu-btn` | `css/layout.css`, `css/mobile.css` | 2x |
| `.mobile-nav-overlay` | `css/layout.css`, `css/mobile.css` | 2x |
| `.nav-item` | `css/layout.css`, `css/mobile.css` | 2x |
| `.nav-item i` | `css/layout.css`, `css/mobile.css` | 2x |
| `.header-btn-icon` | `css/layout.css`, `css/mobile.css` | 2x |
| `.header-left-group` | `css/layout.css`, `css/mobile.css` | 2x |
| `.header-title h1` | `css/layout.css`, `css/mobile.css` | 2x |
| `.header-title p` | `css/layout.css`, `css/mobile.css` | 2x |

---

## 3. Kullanılmayan Seçici (Unused Selectors) Raporu (Kalan: 34 Seçici)

> [!NOTE]
> Dinamik class eklemeleri (Leaflet, FontAwesome, data-theme, dynamic badges vb.) safelist ile korunmaktadır.

### 📄 `css/utilities.css` (12 kullanılmayan seçici)

<details>
<summary>Kullanılmayan seçici listesini görüntüle (12 adet)</summary>

```css
.flex-row
.justify-end
.justify-start
.gap-20
.h-100
.relative
.absolute
.text-right
.text-left
.font-black
.mt-3
.pos-rel-w100
```
</details>

### 📄 `css/modals.css` (16 kullanılmayan seçici)

<details>
<summary>Kullanılmayan seçici listesini görüntüle (16 adet)</summary>

```css
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

### 📄 `css/tabs/tab-flight.css` (4 kullanılmayan seçici)

<details>
<summary>Kullanılmayan seçici listesini görüntüle (4 adet)</summary>

```css
.solar-bar-item
.solar-bar-item:hover
.solar-bar-item.optimal
.solar-bar-item.active-sim
```
</details>

### 📄 `css/light.css` (2 kullanılmayan seçici)

<details>
<summary>Kullanılmayan seçici listesini görüntüle (2 adet)</summary>

```css

[data-theme="light"] .data-table-wrap
[data-theme="light"] pre
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
| **Ham Dosya Boyutu (Uncompressed)** | **305.24 KB** (312.562 B) | **205.45 KB** (210.380 B) | **-%32.7 (-99.79 KB)** 🚀 |
| **Gzip Sıkıştırılmış Boyut** | **46.63 KB** (47.754 B) | **33.9 KB** (34.717 B) | **-%27.3 (-12.73 KB)** ⚡ |
| **Toplam Satır Sayısı** | **11.878 satır** | **8.287 satır** | **-%30.2 (-3.591 satır)** |
| **Mükerrer Seçici Sayısı** | **216 adet** | **130 adet** | **-%39.8 (-86)** |
| **Kullanılmayan Seçici Adayı** | **416 adet** | **34 adet** | **-%91.8 (-382)** |

> [!TIP]
> Yapılan optimizasyon sonucunda **core.css** dosya boyutu ham bazda **~100 KB (%32.6)** ve Gzip bazında **~12.5 KB (%26.7)** küçültülmüş, satır sayısı **11.878'den 7.640'a indirilmiştir**.
