# CSS Konsolidasyonu — TEK GÖREV PLANI

**Kapsam uyarısı (agent bunu okumalı):** Bu görevin TEK amacı aşağıdaki CSS konsolidasyonudur.
NTRIP, telemetri, PDF export, yeni özellik, test altyapısı, dokümantasyon genişletme —
**hiçbiri bu görevin parçası değil.** Bu dosyanın dışında hiçbir konuya dokunma. İlgisiz bir
iyileştirme fikrin olursa bile uygulama, sadece not düş.

**Kaynak repo:** `github.com/kuzeyoku/gnss_pos_studio` — çalışma dizini `web/css/`.

**Şu an doğrulanmış durum (04.09.2026 klonundan):** `web/css/` altında 20 kaynak dosya var,
`css/tabs/` klasörü hâlâ 8 ayrı dosya içeriyor, `foundation.css`/`responsive-theme.css` yok.
İçerik-bazlı tarama **26 grup / 55 seçicide** birebir aynı CSS bloğu tekrarı buldu (tam liste
aşağıda — bunlar varsayım değil, ekteki `css_dup_scan.py` ile ölçüldü).

---

## Tek Hedef

19 kaynak CSS dosyasını (core.css derleme çıktısı hariç) **4 dosyaya** indirmek, aşağıdaki
26 tekrar grubunun tamamını tek bir kanonik tanıma bağlamak, ve mevcut görünümü/işlevi
**hiç bozmadan** bunu yapmak.

## Hedef Dosya Yapısı (bundan fazlası da azı da olmasın)

| Dosya | İçerik |
| --- | --- |
| `css/foundation.css` | `tokens.css` + `reset.css` + `utilities.css` |
| `css/components.css` | mevcut `components.css` + `tables.css` + `modals.css` + `maps.css` + aşağıdaki tüm kanonik ortak bileşenler |
| `css/layout.css` | mevcut `layout.css` + `report.css` + sekmeye özgü genellenemeyen kalıntılar (yorumlu bölümler halinde) |
| `css/responsive-theme.css` | `mobile.css` (tüm `@media`) + `light.css` |

`css/tabs/` klasörü iş bitince tamamen silinmiş olmalı. `scripts/bundle.js` bu 4 dosyayı
sabit sırayla (`foundation → components → layout → responsive-theme`) tek `core.css`'e
derlemeye devam edecek.

---

## Çözülecek 26 Tekrar Grubu (tam liste — hepsi tek tek ele alınacak)

Aşağıdaki her grup için: **tek bir kanonik class adı** seç, `components.css`'e (veya yapısına
göre `layout.css`'e) tek bir tanım olarak yaz, ardından ilgili HTML dosyalarındaki eski class
adlarını kanonik adla değiştir. Renk/varyant farkı gereken gruplarda (örn. kpi kartların farklı
sekmelerde farklı vurgu rengi gerekiyorsa) tüm bloğu kopyalamak yerine bir CSS custom property
kullan (`.tab-cadastre { --accent: var(--cyan-500); }`).

**A) Cadastre ↔ Converter KPI kart ailesi (5 grup, tek component'e indirilecek: `.kpi-card` ailesi)**
- `.cadastre-kpi-grid` ↔ `.converter-kpi-grid` → `.kpi-grid`
- `.cadastre-kpi-card` ↔ `.converter-kpi-card` → `.kpi-card`
- `.cadastre-kpi-card:hover` ↔ `.converter-kpi-card:hover` → `.kpi-card:hover`
- `.cadastre-kpi-icon` ↔ `.converter-kpi-icon` → `.kpi-icon`
- `.cadastre-kpi-lbl` ↔ `.converter-kpi-lbl` → `.kpi-label`

**B) Panel/kart varyantları (2 grup)**
- `.cadastre-table-panel` ↔ `.rinex-sub-card` → `.data-panel` (veya benzeri tek ad)
- `.converter-export-btns` ↔ `.pafta-search-wrapper` → içerikleri gerçekten aynıysa birleştir,
  değilse (isimler çok alakasız — dikkatli incele, bu bir yanlış eşleşme olabilir) atla ve not düş.

**C) Leaflet harita override'ları (2 grup) → `components.css`'teki genel `.leaflet-*` kurallarına taşı**
- `#cadastreMapContainer .leaflet-bottom.leaflet-left` ↔ `#tg20MapContainer .leaflet-bottom.leaflet-left`
- `#cadastreMapContainer .leaflet-control-scale` ↔ `#tg20MapContainer .leaflet-control-scale`
- Öneri: ID-özel seçici yerine ortak bir `.app-map-container` class'ı ekleyip genel kuralı ona bağla.

**D) Dosya yükleme / dropzone (2 grup) → `.file-drop-input` tek tanımı**
- `.file-upload-glass input[type="file"]` ↔ `.dropzone input[type="file"]` ↔ `.ppk-upload-box input[type="file"]`
- `components.css` içinde zaten `.hero-quick-dropzone input[type="file"]` ↔ `.file-upload-glass input[type="file"]` de birbirinin aynısı — aynı çözüme dahil et.

**E) İkon kutusu ailesi (4 grup) — Guide sekmesi zaten `components.css`'teki `.bento-icon-*`'ı kopyalamış**
- `.icon-box-cyan` → sil, `.bento-icon-cyan` kullan
- `.icon-box-purple` → sil, `.bento-icon-purple` kullan
- `.icon-box-emerald` → sil, `.bento-icon-emerald` kullan
- `.icon-box-amber` → sil, `.bento-icon-amber` kullan

**F) Küçük/tekil tekrarlar (7 grup) — tek tek incele, çoğu birleştirilebilir**
- `.solar-wind-chip` ↔ `.guide-shortcut-top` ↔ `.pafta-intersect-title-group` → `.chip-row` gibi genel bir ad
- `.flight-summary-box > div` ↔ `.dom-badge-header` ↔ `.bento-card-header` → `.card-header-row`
- `.map-toolbar-actions-group, .map-layer-toggles-row` ↔ `.legend-item`
- `.batch-textarea:focus` ↔ `.dns-textarea:focus` (aynı dosya içi, `tab-geodesy.css`) → `.mono-textarea:focus`
- `.grid-3col-dom` ↔ `.grid-3col-formulas` (aynı dosya içi, `tab-guide.css`) → `.grid-3col`
- `.dom-scope` ↔ `.guide-shortcut-desc` (aynı dosya içi, `tab-guide.css`)
- `.pafta-geoid-box` (hem `tab-map.css` hem `utilities.css`'te tanımlı) → sadece `components.css`'te kalsın

**G) Şüpheli/muhtemelen tesadüfi eşleşmeler (2 grup) — birleştirme, sadece incele**
- `.bento-features span` ↔ `.brand-title-wrap` — isimler çok alakasız, muhtemelen tesadüfi aynı
  property seti (örn. sadece `display:flex; gap:8px; align-items:center`). İncele, gerçekten aynı
  amaç için mi kullanılıyorlar yoksa tesadüf mü — tesadüfse dokunma.
- `.trust-item` ↔ `.header-left-group` — aynı şekilde önce incele.
- `.helmert-param-label` ↔ `.quality-stat-label` (aynı dosya, `utilities.css`) — muhtemelen gerçek
  bir birleştirme adayı, tek isimde topla.
- `.card` (`layout.css`) ↔ `[data-theme="light"] .leaflet-control-layers:not(...)` (`maps.css`) —
  bu ikisi neredeyse kesin tesadüfi (bambaşka amaçlar), **dokunma**, listede bilgi amaçlı duruyor.

---

## Yapılış Sırası (agent bu sırayı takip etsin)

1. Ekteki `css_dup_scan.py`'yi çalıştır, yukarıdaki listeyle aynı sonucu aldığını doğrula
   (repo değişmiş olabilir, sayılar farklıysa önce bana bildir, tahmin yürütme).
2. `css/components.css`'e yukarıdaki A-F gruplarının kanonik tanımlarını ekle.
3. **Tek tek sekme, sırayla:** Cadastre → Converter → Rinex → Geodesy → TG-20 → Flight → Map → Guide.
   Her sekme için: `components/tabs/<sekme>.html`'deki eski class adlarını kanonik adla değiştir,
   `node scripts/bundle.js` çalıştır, tarayıcıda o sekmeyi aç, görsel olarak öncekiyle aynı
   olduğunu doğrula. Bir sekmeyi bitirmeden diğerine geçme.
4. Tüm sekmeler bitince: `tokens.css`+`reset.css`+`utilities.css` → `foundation.css`;
   `tables.css`+`modals.css`+`maps.css` → `components.css`; `report.css` → `layout.css`;
   `mobile.css`+`light.css` → `responsive-theme.css`. Eski dosyaları sil, `css/tabs/` klasörünü sil.
5. `scripts/bundle.js`'deki dosya listesini güncelle (`foundation → components → layout → responsive-theme`).
6. `css_dup_scan.py`'yi tekrar çalıştır — hedef: **0 grup** (madde G'deki tesadüfi eşleşmeler
   hariç, onlar kabul edilebilir istisna).
7. `node scripts/run_purgecss_report.js` çalıştır, sonucu kaydet.
8. Tüm sekmeleri, dark ve light temada, masaüstü ve mobil genişlikte tek tek gez — hiçbir
   görsel/işlevsel fark olmamalı.
9. Tek bir commit at: `refactor: consolidate CSS into 4 source files, eliminate cross-module duplication`.

## Bitti Sayılmasının Şartı (bunlar sağlanmadan "tamamlandı" denemez)

- [ ] `web/css/` altında tam olarak 4 kaynak dosya var (+ `core.css` derleme çıktısı).
- [ ] `css/tabs/` klasörü yok.
- [ ] `css_dup_scan.py` çıktısı: 0 grup (G maddesindeki 1-2 tesadüfi istisna hariç).
- [ ] Derlenmiş `core.css` boyutu (gzip) önceki ölçümden (33,9 KB) büyük değil.
- [ ] Tek bir git commit'i var ve commit mesajı bu işi açıkça anlatıyor.
- [ ] Bu plandaki hiçbir maddenin dışına çıkılmamış (başka özellik/dosya eklenmemiş).
