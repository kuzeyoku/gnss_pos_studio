# GNSS Pos Studio (web) — Geliştirme Uygulama Planı

**Hedef proje:** `C:\gnss_pos_studio\web`
**Amaç:** Bu doküman bir AI coding agent'a (Claude Code, Cursor Agent, vb.) verilip sırayla
uygulanabilecek şekilde yazılmıştır. Her faz bağımsız bir PR/commit olacak şekilde
tasarlandı; bir sonraki faza geçmeden önce ilgili fazın "Kabul Kriterleri" doğrulanmalı.

**Genel kural (her faz için geçerli):**
- Değişikliğe başlamadan önce `git status` temiz olmalı; her faz kendi commit'inde bitmeli.
- Hiçbir faz `js/app.bundle.js`'yi elle düzenlemez — bundle her zaman kaynak dosyalardan
  yeniden üretilir (bkz. Faz 1).
- `index.html` içindeki script/style sırası bozulmamalı; component loader'ın yükleme
  sırasına (`homeTab → cadastreTab → rinexTab → mapTab → geodesyTab → tg20Tab → flightTab →
  converterTab → guideTab`) dokunulmaz.
- Her faz sonunda tarayıcıda manuel duman testi (smoke test) yapılmalı: uygulama açılıyor mu,
  konsolda hata var mı, ilgili sekme çalışıyor mu.

---

## Faz 0 — Güvenlik Ağı (ön koşul, atlanamaz)

**Amaç:** Sonraki fazlarda regresyon oluşursa hızlıca tespit edebilmek.

**Görevler:**
1. Proje kök dizininde git deposu yoksa başlat, mevcut hali `chore: initial import` olarak commitle.
2. `docs/manual-smoke-test.md` oluştur: her sekme için 3-5 maddelik manuel test checklist'i
   (örn. Cadastre: dosya yükle → RTK tablo doluyor mu → NCN export çalışıyor mu → harita
   görünümü açılıyor mu).
3. `js/modules/geodesyEngine.js`, `js/modules/tg20GeoidEngine.js`, `js/modules/gnssFormatEngine.js`
   içindeki tüm public fonksiyonları listele ve `docs/engine-api-inventory.md` dosyasına yaz
   (fonksiyon adı, girdi/çıktı tipleri, kısa açıklama). Bu envanter Faz 3'teki testler için
   referans olacak.

**Kabul kriterleri:**
- Git log'da en az 1 commit var.
- `docs/manual-smoke-test.md` ve `docs/engine-api-inventory.md` mevcut ve dolu.

---

## Faz 1 — Build Otomasyonu (bundle senkronizasyonu)

**Amaç:** `js/app.bundle.js`'nin elle bakımdan çıkarılıp otomatik üretilmesi. Şu an bundle,
`js/core/*.js`, `js/modules/*.js`, `js/tabs/*.js`, `js/app.js` dosyalarının ve
`components/**/*.html` içeriklerinin (component cache olarak) birleşimi.

**Görevler:**
1. Kök dizine `build.js` ekle (Node.js, bağımlılıksız veya sadece `esbuild` dev-dependency ile):
   - `components/**/*.html` dosyalarını oku, her birini `window.__COMPONENT_CACHE__["<path>"] = "<escaped html>"`
     satırına dönüştür (mevcut bundle'daki formatla birebir aynı).
   - `js/core/*.js`, `js/modules/*.js`, `js/tabs/*.js`, `js/app.js` dosyalarını mevcut bundle'daki
     sırayla birleştir.
   - Çıktıyı `js/app.bundle.js`'ye yaz.
2. `package.json` oluştur (yoksa), `"scripts": { "build": "node build.js" }` ekle.
3. Mevcut `js/app.bundle.js`'yi silip `npm run build` (veya `node build.js`) ile yeniden üret,
   diff'i incele — sadece formatlama farkı olmalı, davranış değişmemeli.
4. `README.md`'ye "Geliştirme" bölümü ekle: kaynak dosyalarda değişiklik yapıldıktan sonra
   `node build.js` çalıştırılması gerektiği açıkça yazılmalı.
5. (Opsiyonel ama önerilir) `--watch` modu: dosya değişikliğinde otomatik yeniden build.

**Kabul kriterleri:**
- `node build.js` çalıştırıldığında hatasız `js/app.bundle.js` üretiliyor.
- Üretilen bundle ile eski bundle arasında sadece whitespace/sıra farkı var, fonksiyonel fark yok
  (manuel smoke test checklist'i baştan sona geçiyor).
- README güncel.

---

## Faz 2 — CSS Denetimi ve Küçültme ✅ TAMAMLANDI

**Sonuç (agent raporu, doğrulandı):** Ham boyut -%32,7 (305→205 KB), gzip -%27,3 (46,6→33,9 KB),
satır sayısı -%30,2, dosya-içi mükerrer seçici -%39,8 (216→130), ölü seçici adayı -%91,8.
`vendor/` klasörü oluşturulup Leaflet/JSZip/FontAwesome local'e alınmış (Faz 5'in bir kısmı
kendiliğinden gerçekleşmiş — bkz. Faz 5 notu).

**Doğrulanmış eksik:** Bu faz **aynı dosya içindeki birebir tekrarları** (örn. `tab-rinex.css`
içinde `.stat-card-glass`'ın iki kez, çakışan değerlerle tanımlanmış olması) düzeltti — bu
kontrol edildi, artık tek tanım var. Ancak **modüller arası "farklı isim, aynı içerik" tekrarı**
(örn. `.cadastre-kpi-card` ile `.converter-kpi-card`'ın halen byte-birebir aynı olması) devam
ediyor. Otomatik bir içerik-bazlı (isim değil, property-set bazlı) tarama ile doğrulandı:
**26 grup / 55 seçicide** kesin tekrar var (bkz. Faz 2b). Bu, Faz 2'nin kapsamı dışındaydı
(PurgeCSS ve isim-bazlı dedup bu türü yakalamaz) — hata değil, doğal bir sonraki adım.

---

## Faz 2b — CSS Yapısal Konsolidasyonu (19 dosyadan 4 dosyaya indirgeme)

**Neden gerekli:** `css/tabs/` altında her sekme için ayrı dosya olması ("ayrıştırma") + daha
önce denenip terk edilen per-tab lazy-load fikri, her yeni sekmenin ortak bileşenleri
(kart, rozet, panel, dropzone) merkezi `components.css`'e bakmadan yeniden yazmasına yol açtı.
Otomatik bir içerik-karşılaştırma taraması (aşağıdaki script) bunu somut olarak doğruladı:

```
Toplam kural: 877
Birebir aynı (>=3 declaration) içerikli grup sayısı: 26
Bu gruplardaki toplam seçici sayısı: 55
```

Örnek tekrarlar: `.cadastre-kpi-card` / `.converter-kpi-card` (+ `-icon`, `-lbl`, `-grid`, `:hover`
varyantları), `.cadastre-table-panel` / `.rinex-sub-card`, `.icon-box-cyan` / `.bento-icon-cyan`,
üç ayrı dosyada tekrarlanan `input[type="file"]` dropzone stili, iki ayrı Leaflet harita
konteynerinde (`#cadastreMapContainer`, `#tg20MapContainer`) birebir aynı kontrol stilleri.
Hatta bu fazın ortasında eklenen yeni `tab-tools.css` bile `.area-kpi-card` adıyla **aynı
kalıbı bir kez daha** yeniden yazmış — yani sorun kendiliğinden büyümeye devam ediyor,
kaynağında (dosya sayısı ve "her tab kendi CSS'ini yazar" alışkanlığı) kesilmesi lazım.

**Karar:** Per-tab CSS dosyalarını tamamen kaldırıp **4 kaynak dosyaya** sabitliyoruz. Lazy-load
fikrine dönülmüyor — üretim boyutu zaten küçük (gzip ~34 KB, konsolidasyondan sonra daha da
düşecek), tek seferde yüklemek; sıralama/FOUC riski taşıyan runtime CSS enjeksiyonundan daha
basit ve güvenli. Mevcut `scripts/bundle.js` bu 4 dosyayı yine tek `core.css`'e derlemeye devam
edecek (kaynakta ayrık, üründe tek dosya — JS bundle'ıyla aynı felsefe).

**Hedef dosya yapısı:**

| Dosya | İçerik |
| --- | --- |
| `css/foundation.css` | `tokens.css` + `reset.css` + `utilities.css` (renk/spacing token'ları, reset, atomic utility class'lar) |
| `css/components.css` | mevcut `components.css` + `tables.css` + `modals.css` + `maps.css` (Leaflet override'ları) + tab dosyalarından çıkarılan **tüm gerçekten paylaşılan** desenler: kart/rozet/panel/chip/dropzone ailesi |
| `css/layout.css` | mevcut `layout.css` (shell/sidebar/header) + `report.css` (yazdırma) + genellenemeyen, gerçekten sekmeye özgü kalıntı stiller (yorum bloklarıyla ayrılmış: `/* ==== CADASTRE ==== */` gibi) |
| `css/responsive-theme.css` | `mobile.css` (tüm `@media` blokları) + `light.css` (`[data-theme="light"]` override'ları) |

**Görevler:**
1. `docs/css_dup_scan.py` scriptini çalıştırıp (script ekte, aşağıda) tam tekrar listesini
   `docs/css-consolidation-inventory.md`'ye yaz — bu liste konsolidasyonun checklist'i olacak.
2. Her tekrar grubu için **tek bir kanonik class adı** belirle (mümkünse jenerik: `.kpi-card`,
   `.kpi-icon`, `.kpi-label`, `.kpi-grid`, `.glass-panel`, `.file-drop-input`). Renk farkı
   gereken yerlerde (cadastre=cyan, converter=cyan de olabilir ama tg20=amber gibi) tüm bloğu
   kopyalamak yerine sarmalayıcıya bir CSS custom property koy:
   `.tab-cadastre { --accent: var(--cyan-500); }` → `.kpi-card { border-color: var(--accent); }`.
3. Bu kanonik tanımları `css/components.css`'e ekle (var olanlarla birleştirerek).
4. **Her sekmeyi tek tek** güncelle: `components/tabs/<tab>.html` içindeki eski
   modül-önekli class adlarını (`cadastre-kpi-card` vb.) yeni kanonik class + accent wrapper
   ile değiştir → build al → o sekmeyi görsel olarak doğrula → sonraki sekmeye geç. Hepsini
   aynı anda değiştirme, regresyon kaynağını daraltmak için sırayla ilerle.
5. Tüm sekmeler taşındıktan sonra `css/tabs/*.css` dosyalarında **gerçekten benzersiz** kalan
   stilleri `css/layout.css`'in ilgili yorumlu bölümüne taşı, dosyaları sil.
6. `tokens.css`, `reset.css`, `utilities.css` → `foundation.css`'e; `tables.css`, `modals.css`,
   `maps.css` → `components.css`'e; `report.css` → `layout.css`'e; `mobile.css`, `light.css`
   → `responsive-theme.css`'e taşı, eskilerini sil. `css/tabs/` klasörünü tamamen kaldır.
7. `scripts/bundle.js`'deki CSS dosya listesini bu 4 dosyaya güncelle, **sabit sıra**:
   `foundation → components → layout → responsive-theme` (token'lar önce, override'lar/medya
   sorguları en son gelmeli).
8. Duplicate scanner'ı tekrar çalıştır — hedef: dosyalar-arası ≥3 declaration'lık tekrar
   grubu **0** (küçük 1-2 property'lik tesadüfi eşleşmeler önemsiz, göz ardı edilebilir).
9. PurgeCSS raporunu tekrar al, `docs/css-audit-report.md`'yi güncelle.
10. Tam regresyon: 9 sekme × 2 tema (dark/light) × 2 genişlik (masaüstü/mobil) — Faz 0'daki
    `docs/manual-smoke-test.md`'yi bu matrisle genişlet ve baştan sona geç.
11. `README.md`'ye şu iki kararı **açıkça** yaz (gelecekte tekrar aynı yola sapılmasın diye):
    (a) CSS kaynak dosyası sayısı 4'te sabit tutulur, yeni bir sekme eklerken önce
    `components.css`'e bakılır, kopya component yazılmaz; (b) per-tab/lazy CSS yükleme
    **bilinçli olarak tercih edilmedi** (gerekçe: boyut zaten küçük, tek yüklemenin
    karmaşıklığı/riski lazy-load'dan daha düşük).

**Kabul kriterleri:**
- Kaynakta sadece 4 CSS dosyası var (+ `vendor/` içindeki üçüncü parti dosyalar hariç).
- İçerik-bazlı duplicate scanner çıktısı: cross-file ≥3-declaration tekrar grubu 0.
- Gzip boyutu Faz 2 sonrası değerden (33,9 KB) düşük veya eşit.
- Tüm sekmeler/temalar/genişlikler görsel olarak Faz 2 sonrasıyla birebir aynı.
- Repo'da lazy-load/dinamik `<link>` enjeksiyonu yok; README'de yukarıdaki iki karar yazılı.

---

## Faz 3 — Hesaplama Motorları için Unit Test

**Amaç:** `geodesyEngine.js`, `tg20GeoidEngine.js`, `gnssFormatEngine.js`, `rinexPowerEngine.js`,
`universalFormatConverterEngine.js` gibi saf hesaplama motorlarında sessiz regresyonları yakalamak.

**Görevler:**
1. Test runner ekle: `vitest` veya `node --test` (bağımlılık minimum tutulsun, tarayıcı DOM'una
   ihtiyaç duymayan motorlar için node ortamı yeterli).
2. Faz 0'daki `docs/engine-api-inventory.md`'yi temel alarak her motor için bilinen/referans
   koordinat çiftleriyle test yaz:
   - `geodesyEngine`: en az 2 EPSG dönüşümü (TUREF TM ↔ WGS84, ED50 ↔ TUREF) bilinen resmi
     örnek koordinatlarla.
   - `tg20GeoidEngine`: en az 3 nokta için `H = h - N` hesabı, farklı bölgelerden (Ege, İç
     Anadolu, Marmara) örnek jeoit ondülasyon değerleriyle.
   - `gnssFormatEngine`: RW5/RAW parse edip beklenen nokta sayısı ve koordinatları kontrol et.
   - `universalFormatConverterEngine`: DXF→GeoJSON, KML→NCN gibi en az 2 format çifti round-trip
     testi (nokta sayısı ve koordinat toleransı korunuyor mu).
3. `package.json`'a `"test": "vitest run"` script'i ekle.
4. CI yoksa basit bir `pre-commit` hook önerisi dokümante et (zorunlu değil).

**Kabul kriterleri:**
- `npm test` çalışıyor ve tüm testler geçiyor.
- Testler bilinçli olarak bozulan bir hesaplamayı (örn. bir sabiti değiştirerek) yakalıyor —
  bunu bir kez deneyip doğrula, sonra geri al.

---

## Faz 4 — Büyük JSON Dosyaları için IndexedDB Cache

**Amaç:** `data/tg20Data.json` (~1.3MB) ve `data/hgmDatumDatabase.json` (~184KB) her sayfa
yenilemesinde yeniden indirilmesin.

**Görevler:**
1. `js/core/` altına `cacheStore.js` ekle: basit bir IndexedDB wrapper (`get(key)`, `set(key, value, version)`).
   Versiyon anahtarı olarak dosya boyutu veya bir `data-version.json` içindeki elle artırılan
   sürüm numarası kullanılabilir.
2. `tg20GeoidEngine.loadModelFromJson()` ve `paftaIndexEngine.loadHgmDatabase()` (veya ilgili
   yükleme fonksiyonları) şu akışa güncellensin:
   - Önce IndexedDB'de geçerli sürüm var mı kontrol et → varsa oradan yükle.
   - Yoksa/eskiyse `fetch` ile indir, IndexedDB'ye yaz, sonra kullan.
3. Konsola (mevcut `console.js` sistemi üzerinden) "TG-20 verisi önbellekten yüklendi" /
   "TG-20 verisi indiriliyor" gibi durum mesajları ekle (kullanıcı deneyimi için).
4. Cache temizleme için basit bir dev aracı: `window.__clearGeoCache()` konsol komutu.

**Kabul kriterleri:**
- İlk açılışta veri normal şekilde indiriliyor.
- Sayfa yenilendiğinde network sekmesinde `tg20Data.json` tekrar indirilmiyor (IndexedDB'den
  geliyor), TG-20 hesaplamaları öncekiyle aynı sonucu veriyor.
- Cache bozulursa (örn. localStorage/IndexedDB devre dışıysa) uygulama fetch'e otomatik
  düşüyor, hata vermiyor.

---

## Faz 5 — Offline-First: CDN Bağımlılıklarını Local'e Alma 🟡 KISMEN TAMAMLANDI

**Doğrulanmış durum:** Font Awesome, Leaflet ve JSZip zaten `vendor/` klasörüne alınmış ve
`index.html` bunlara local yoldan referans veriyor (Faz 2b sırasında/civarında kendiliğinden
yapılmış görünüyor). **Kalan tek eksik:** `css/tokens.css` içinde hâlâ Google Fonts'a
(`fonts.googleapis.com`) uzak bir `@import` var — bu, Faz 2b'de `tokens.css` `foundation.css`'e
taşınırken de fark edilip çözülmeli. Aşağıdaki görev listesi bu kalan işe göre daraltılmıştır.

**Amaç:** `index.html`'deki Font Awesome, Leaflet, JSZip CDN bağımlılıklarını projeye dahil
ederek "çevrimdışı" iddiasını gerçek kılmak.

**Görevler:**
1. ~~Font Awesome, Leaflet (css+js), JSZip dosyalarını indirip `vendor/` klasörüne yerleştir~~ ✅ yapıldı.
2. ~~`index.html`'deki CDN linklerini local `vendor/` yollarıyla değiştir~~ ✅ yapıldı.
2b. **Kalan iş:** `Outfit`, `Plus Jakarta Sans`, `JetBrains Mono` font dosyalarını (woff2)
   indirip `vendor/fonts/`'a koy, `foundation.css`'te (bkz. Faz 2b) Google Fonts `@import`'unu
   local `@font-face` tanımlarıyla değiştir.
3. (Opsiyonel, ayrı bir faz olarak da bırakılabilir) Basit bir Service Worker ekleyip
   statik asset'leri (`js/app.bundle.js`, `css/*.css`, `vendor/*`, `data/*.json`) cache-first
   stratejisiyle önbellekle — tam PWA olması şart değil, sadece tekrar ziyarette hızlı açılış
   ve internet kesintisinde çalışabilirlik hedefleniyor.

**Kabul kriterleri:**
- Network sekmesi tamamen kapalıyken (DevTools "Offline" modu) uygulama açılıyor ve temel
  sekmeler (Cadastre, Geodesy, TG-20) çalışıyor (harita tile'ları hariç, onlar zaten internet
  gerektirir ve bu normal).
- Font Awesome ikonları ve Leaflet haritası CDN olmadan da yükleniyor.

---

## Faz 6 — Guide Sekmesi için PDF Export

**Amaç:** `components/tabs/guideTab.html` içeriğini (veya seçilen bir bölümünü) PDF'e
aktarabilme — müşteri eğitimi/teslim dokümantasyonu için.

**Görevler:**
1. Mevcut `js/core/exporter.js`'deki export altyapısını incele (muhtemelen zaten PDF export
   fonksiyonları var — cadastre/TG-20 raporlarında kullanılıyor, `reports/*.html` şablonlarına
   bak).
2. Guide sekmesine "PDF olarak indir" butonu ekle; mevcut `reports/` altındaki HTML→PDF
   yaklaşımını (muhtemelen print-to-PDF veya bir kütüphane) yeniden kullan, yeni bağımlılık
   ekleme.
3. Filtre/arama ile daraltılmış görünümün (`data-guide-filter`) PDF'e de yansımasını sağla
   (opsiyonel — istenirse sadece "tam kılavuz" export yeterli olabilir, başta bunu tercih et).

**Kabul kriterleri:**
- Butona tıklanınca düzgün formatlanmış, marka/logo içeren bir PDF iniyor.
- PDF'de tablo ve formüller (`formula-math` blokları) okunabilir kalıyor.

---

## Faz 7 — Format Converter: Native Donanım Format Desteği

**Amaç:** `js/modules/universalFormatConverterEngine.js`'ye dağıttığın/desteklediğin
donanımlara özgü format desteği eklemek (ör. SHARE UAV kamera formatları, CHC C30 oblique
kamera verisi).

**Görevler:**
1. Mevcut converter engine'in format algılama/parse mimarisini incele (muhtemelen
   `detectFormat()` + format-özel parser fonksiyonları şeklinde).
2. Yeni bir parser modülü ekle (aynı dosyada veya `js/modules/` altında ayrı dosya olarak),
   var olan Python `chc_c30_converter.py` mantığını referans alarak JS'e taşı — kamera
   orientation düzeltmeleri dahil.
3. `converterTab.html`'deki dropzone `accept` listesine yeni uzantıları ekle, UI'da yeni
   format için bir badge/etiket göster.
4. Faz 3'teki test altyapısına bu yeni parser için de round-trip testi ekle.

**Kabul kriterleri:**
- Örnek bir CHC C30/SHARE UAV dosyası yüklendiğinde doğru nokta/kamera pozisyonu sayısı
  çıkıyor ve mevcut export formatlarına (DXF, KML, CSV) düzgün aktarılabiliyor.

---

## Faz 8 (Stratejik/Ürün) — Diğer Projelerle Entegrasyon

Bu faz diğerlerinden daha büyük kapsamlı ve ayrı bir karar/tasarım gerektiriyor; agent'a
vermeden önce sen ayrıca netleştirmelisin. Ön hazırlık olarak agent'a şu keşif görevleri
verilebilir:

1. **NTRIP Auto-Router entegrasyonu:** Router'ın loglama formatını incele, bu web
   stüdyosunun Cadastre/RTK raporlarına "kullanılan mountpoint / bağlantı kalitesi" alanı
   eklemek için hangi veri formatının paylaşılması gerektiğine dair bir tasarım notu yaz
   (`docs/ntrip-integration-design.md`).
2. **Drone Tracking App entegrasyonu:** PySide6 tarafındaki MQTT telemetri akışının web
   tarafına (WebSocket köprüsü ile) nasıl taşınabileceğine dair bir mimari taslağı çıkar
   (`docs/live-telemetry-design.md`) — flightTab.js'nin mevcut harita altyapısını (Leaflet)
   nasıl yeniden kullanabileceği dahil.

Bu iki tasarım notu hazır olduğunda, onları ayrı birer implementasyon planına dönüştürüp
tekrar agent'a verebilirsin.

---

## Öncelik Sırası Önerisi

Zaman kısıtlıysa şu sıra önerilir: **Faz 0 → Faz 1 → Faz 3 → Faz 4 → Faz 2 → Faz 5 → Faz 6/7 → Faz 8.**
Gerekçe: önce güvenlik ağı ve build otomasyonu (risksiz, her şeyin temeli), sonra testler
(motorları korumaya alır), sonra performans (cache), sonra görsel/temizlik işleri, en son
büyük yeni özellikler.
