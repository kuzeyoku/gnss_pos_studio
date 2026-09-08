# 🧠 HARİTA TOOL (GNSS & CBS STUDIO) - MASTER ZİHİN HARİTASI & BİLGİ MİMARİSİ (MIND MAP)

> 🔴 **AJAN İÇİN KRİTİK VE ZORUNLU KURAL (PERSISTENCE & LIVE REFRESH DIRECTIVE):**  
> Bu belge projenin beynidir. Yapılan **HER YENİ İŞLEM, DEĞİŞİKLİK VEYA GELİŞTİRMEDEN SONRA** bu zihin haritası mutlaka gözden geçirilmeli, yeni eklenen özellikler, dosya yapıları ve algoritmalar bu haritaya derhal işlenmeli ve belge sürekli canlı, taze ve güncel tutulmalıdır!

---

## 🗺️ 1. Genel Proje Zihin Haritası (Mermaid Mindmap)

```mermaid
mindmap
  root((🗺️ Harita Tool))
    %% MİMARİ VE ÇALIŞMA FELSEFESİ
    Felsefe & Altyapı
      %100 İstemci Taraflı (Zero Backend / Pure Client-Side)
      Sıfır Sunucu Yükü (cPanel & Paylaşımlı Hosting Uyumlu)
      Çift Modlu Çalışma Güvencesi
        Web Worker Modu (http / https / cPanel)
        In-RAM Direct Streaming Modu (file:/// Çift Tıklama)
    
    %% KADASTRO & RTK MODÜLÜ
    GNSS / RTK Ölçüm & Kadastro Çetelesi
      Format Ayrıştırıcılar (Parsers)
        RW5 Ham Ölçü Dosyaları (.rw5 - Tüm Cihazlar)
        RAW Ham Ölçü Dosyaları (.raw)
        GNSS CSV & Koordinat Listeleri (.csv)
        Trimble JXL & Leica GSI (.jxl / .gsi)
        Serbest Metin & Netcad (.txt / .ncn)
      Tekilleştirilmiş RTK Ölçüm Tablosu (Unified Master)
        RTK & Detay Verilerinin Eksiksiz Birleşimi
        Tüm Noktalarda TG-20 Ortometrik Kot (H = h - N)
        Doğrudan Sekme İçi Dışa Aktarım (TG-20 PDF, NCN, DXF, KML, CSV)
      Kadastro Çetelesi & Kontrol (GCP)
        Birleşik Kadastro Master Tablosu (Tek Tabloda Çift Okuma + Tekil Noktalar)
        Ölçüm / Hata Kontrolü Sütununda Durum Ayrımı (UYGUN, LİMİT AŞILDI, Tekil Ölçü)
        Çift Okuma Yoksa Akıllı Pasif Kilitleme & Bilgilendirme Balonu
        Tolerans Denetimi (Y/X ≤ 7cm, H ≤ 10cm)
      1-Tıkla TG-20 Jeoit İndirgemesi (H = h - N)
        Çift Okumalı Noktalarda Ortometrik Kot (H)
        Tekil Noktalarda Ortometrik Kot (H)
        Dinamik Sütun Başlıkları & N Undülasyon Rozetleri
      Çıktı & Rapor Üretimi (Exporters)
        Resmi Çetelesi Yazdır (PDF)
        🖨️ TG-20 PDF Raporu Al (Kurumsal Şablon & Yasal Sorumluluk Reddi)
        Netcad Nokta Dosyası (.ncn)
        AutoCAD Vektör (.dxf) (Çift Okuma + Tekil Noktalar)
        Google Earth 3D (.kml) (Çift Okuma + Tekil Noktalar)
        Excel / CSV Çetelesi (Çift Okuma + Tekil Noktalar)

    %% TG-20 TÜRKİYE HİBRİT JEOİDİ & KOT İNDİRGEME İSTASYONU
    TG-20 Jeoit & Kot İndirgeme İstasyonu
      Gömülü Grid & Veri Mimarisi
        Harita Genel Müdürlüğü (HGM) TG-20 Resmi Modeli
        1' x 1' Grid Çözünürlüğü (421 Satır x 1171 Sütun = 492.991 Düğüm Noktası)
        Kapsam: 35.5° - 42.5° K, 25.5° - 45.0° D
        Uint16Array Sıkıştırılmış In-Memory Grid (1.28 MB Sıfır Gecikme)
        ±1 mm Çift Doğrusal (Bilinear) Enterpolasyon
      Tek Nokta Hızlı Kot İndirgeme (WGS-84)
        Enlem, Boylam, Elipsoit Kotu (h) ➔ Jeoit (N) & Ortometrik Kot (H)
        Tek Nokta Raporunu Panoya Kopyalama
      Toplu Liste & Çetele İndirgeme
        WGS-84 Dosya Yükleme (.txt, .csv, .ncn, .dat)
        Akıllı Ayırıcı & Canlı Tablo Önizleme
        Otomatik Örnek Veri Yükleme & Başlatma
      Raporlama & Dışa Aktarım
        🖨️ TG-20 PDF Raporu (A4 Optimize, Şık Tipografi, Sorumluluk Reddi)
        Netcad .NCN (Ortometrik Kotlu)
        Excel / CSV İndirgeme Çetelesi
    
    %% RINEX & GNSS STUDIO
    Unified RINEX & GNSS Workstation
      İçerik Odaklı Başlık Tarayıcı (64KB Header Scanner)
      Dinamik Filtreleme Matrisi
        Uydu Sistemleri (GPS, GLO, GAL, BDS, QZS, SBS)
        Frekans Bantları (L1, L2, L5, E6)
        Gözlem Tipleri (Phase, Code, Doppler, SNR)
      Zaman Aralığı & Kesme (Time Window Crop)
        Cam Efektli Aç/Kapa Switch (Dimmed Disabled State)
        Akıllı Önayarlar (Tümü, 1 Saat, İlk 2 Saat, Son 2 Saat)
      Örnekleme Seyreltme (Decimation: 1s - 30s)
      Kademeli Çıktı & Sürüm Seçici
        RINEX 2.10 & 2.11 (.YYo, .obs, .YYn, .nav, .YYg, .YYd, .ZIP)
        RINEX 3.00 - 3.05 & 4.00 (.YYo, .obs, .rnx, .YYn, .YYg, .crx, .ZIP)
        Konum Çözümü & Telemetri (.pos, .nmea $GPGGA, .csv)
      Yüksek Hızlı Akış Motoru (Sub-100ms Streaming Engine)
    
    %% JEODEZİ VE KOORDİNAT (UNIVERSAL EPSG WORKSTATION)
    Universal EPSG & Jeodezi İstasyonu
      Gömülü Türkiye EPSG Veritabanı
        ITRF-96 / TUREF TM 3° (DOM 27, 30, 33, 36, 39, 42, 45) [EPSG:5253-5259]
        ED-50 TM 3° (DOM 27, 30, 33, 36, 39, 42, 45) [EPSG:5263-5269]
        UTM 6° (Zone 35, 36, 37, 38) [EPSG:32635-32638 & EPSG:23035-23038]
        WGS84 / ETRS89 Coğrafi [EPSG:4326, 4258] & ECEF [EPSG:4978]
      Matematiksel Kesinlik Prensibi
        Aynı Datum İçi (DOM ↔ DOM, 3° ↔ 6°, Coğrafi ↔ Projeksiyon ↔ ECEF): %100 Kesin Matematik
        Farklı Datum (ITRF96 ↔ ED50): Yerel 7 Parametreli Bursa-Wolf Güvencesi & Uyarı Rozeti
      Toplu Liste & Dosya Dönüştürücü (Batch Transformer)
        Akıllı Ayırıcı (Boşluk, Virgül, Noktalı Virgül, Tab, Pipe)
        Dinamik Sütun Eşleştirici (Nokta No, Y, X, Z, Kod)
        Canlı Önizleme & İhracatçılar (.ncn, .dxf, .kml, .csv)
    
    %% HARİTA & CBS
    Görselleştirici & Harita
      Leaflet Multi-Basemap (Google Hibrit, Google Uydu, Esri, OSM, CartoDB Dark)
      Türkiye Standart Pafta İndeks Motoru (1/100K, 1/50K, 1/25K)
        HGM Standart Bölgesel İl/İlçe İsimleri Veritabanı (Örn: F22 İSTANBUL, H29 ANKARA, L18 İZMİR)
        Akıllı İl/İlçe & Pafta Kodu Arama Motoru
        Dinamik Viewport Culling (60 FPS Akıcı Izgara Çizimi)
        Pafta Adından Arama & Odaklanma (Örn: F22, H29-b, K18-c2)
        Tıklanan Noktanın Paftasını Bulma (Reverse Sheet Lookup)
        Pafta Sınırlarını İndirme (KML, AutoCAD DXF, Netcad NCN)
      TUREF TM 3° Dilim Sınırları Katmanı (DOM 27° - 45° Bağımsız Aç/Kapa)
        Dilim Genişlik Şeritleri (3° Boylam Aralıkları)
        Dilim Orta Meridyeni Merkez Çizgileri & Etkileşimli Rozetler
        İl/Bölge & EPSG Kapsam Bilgi Kartı Popup
      RTK Nokta Haritası & Sınır Uydurma (FitBounds)
      SPP Yörünge & Trajectory Çizimi
    
    %% UI/UX PRO MAX TASARIM SİSTEMİ
    Modern Arayüz & UX
      Obsidian Glassmorphism & Neon Specular Vurgular
      Bento Grid Kart Düzeni
      Sabit Alt Konsol İstasyonu (Sticky Bottom Dock + Toggle)
      Canlı Toast Bildirim Motoru (Alert-Free UX)
      Dengeli, Tek Satır Eylem Araç Çubukları (Clean Toolbar Hierarchy)
```

---

## 📁 2. Dosya & Klasör Hiyerarşisi

```
c:\gnss_pos_studio\
│
├── MIND_MAP.md                     <-- 🧠 Bu Ana Zihin Haritası & Proje Beyni (Sürekli Güncel)
├── gnss_web_cpanel.zip             <-- 📦 cPanel'e yüklenecek hazır dağıtım paketi
│
├── scripts\
│   ├── build_protect.js            <-- 🔒 1-Tıkla Multi-Layer JS Şifreleme ve Güvenlik Kilidi
│   └── restore_dev.js              <-- 🔄 1-Tıkla Açık Kaynak Geliştirici Moduna Geri Dönüş
│
├── web_dev_source_backup\          <-- 🛡️ Açık kaynak geliştirici kodlarının yedek havuzu
│
└── web\                            <-- Web Kök Dizini (Tamamen Bağımsız & Statik)
    ├── index.html                  <-- Ana Arayüz (GPSFormat, TG-20 Studio, RINEX, EPSG & Pafta Workstation)
    ├── Baslat_Web_Studio.bat       <-- 1-Tıkla Windows Yerel Sunucu Başlatıcı
    │
    ├── css\
    │   ├── style.css               <-- Cyberpunk Glassmorphism Tasarım Sistemi & Pafta Etiket Stilleri
    │   └── report.css              <-- Standart A4 Yazdırılabilir Rapor & Çetele Tasarım Sistemi (PDF)
    │
    ├── data\
    │   └── TG20.ggf                <-- Trimble GGF Formatında Resmi HGM TG-20 Jeoid Modeli
    │
    ├── js\
    │   ├── app.js                  <-- Ana Kontrolcü, Modül Başlatıcıları & Olay Dinleyicileri (Temiz Sınıf Mimarisi)
    │   │
    │   ├── modules\
    │   │   ├── tg20Data.js         <-- 🇹🇷 Gömülü 492.991 Noktalı TG-20 Binary Grid Matrisi (Uint16Array)
    │   │   ├── flightPlannerEngine.js<-- 🚁 İHA Uçuş Planlama, Dış Zarf Sadeleştirme & Akıllı YKN Motoru
    │   │   ├── tg20GeoidEngine.js  <-- 🇹🇷 TG-20 Çift Doğrusal (Bilinear) Enterpolasyon Motoru
    │   │   ├── geodesyEngine.js    <-- Universal Türkiye & Global EPSG Dönüşüm Motoru
    │   │   ├── gnssFormatEngine.js <-- Çok Formatlı RTK/Kadastro Ayrıştırıcı (GPSFormat & TG-20 Uyumlu)
    │   │   ├── rinexPowerEngine.js <-- Hızlı RINEX Başlık Tarayıcı, Zaman Kesme & Seyreltme Motoru
    │   │   └── paftaIndexEngine.js <-- Türkiye Standart Pafta İndeks Motoru (1/100K, 1/50K, 1/25K, DXF/NCN/KML)
    │   │
    │   └── workers\
    │       ├── rinex_merger_worker.js <-- RAM İçi Yüksek Hızlı RINEX Birleştirme & Kesme İşçisi
    │       └── pos_worker.js          <-- RTKLIB Benzeri SPP Nokta Konum Çözüm İşçisi
```

---

## 🔬 3. Kritik Motorlar ve Algoritmik Kurallar (Unutulmayacak Notlar)

### A. TG-20 Jeoid İndirgemesi & Enterpolasyon Prensipleri
1. **Grid Yapısı ve Eksen Yönelimi:**
   - Harita Genel Müdürlüğü (HGM) TG-20 modeli: $35.5^\circ \text{N} - 42.5^\circ \text{N}$ ve $25.5^\circ \text{E} - 45.0^\circ \text{E}$.
   - Çözünürlük: $1'$ yay dakikası ($421 \text{ satır} \times 1171 \text{ sütun} = 492.991 \text{ düğüm noktası}$).
   - Trimble GGF dosya standardında Satır 0 = En Kuzey ($42.5^\circ \text{N}$), Satır 420 = En Güney ($35.5^\circ \text{N}$).
   - Grid indeks formülü:
     $$r = \frac{42.5 - \text{Lat}}{1/60}, \quad c = \frac{\text{Lon} - 25.5}{1/60}$$
2. **Çift Doğrusal (Bilinear) Enterpolasyon:**
   - 4 komşu grid düğümünden $Q_{11}, Q_{12}, Q_{21}, Q_{22}$ ağırlıklı ortalama alınarak $\pm 1\text{ mm}$ hassasiyetle $N$ undülasyonu elde edilir.
3. **Temel Yükseklik Bağıntısı:**
   $$H_{\text{ortometrik (TUDKA-99 Helmert)}} = h_{\text{elipsoit (WGS-84 GNSS)}} - N_{\text{TG-20 (Jeoit Undülasyonu)}}$$
4. **Çift Okuma (Matched) ve Tekil (Unmatched) Nokta Eşitliği:**
   - TG-20 indirgemesi hem ortalama koordinatı bulunan çift okumalı noktalara hem de tekil ölçülen noktalara eksiksiz uygulanır.
   - Netcad .NCN, AutoCAD .DXF, Google Earth .KML ve CSV dışa aktarımlarında her iki grup da güncel ortometrik kotlarla ($H$) yazılır.

### B. Kurumsal PDF Rapor Şablonu & Yasal Sorumluluk Reddi (Disclaimer)
- **Kurumsal Başlık:** Raporlar kurum taklidi yapmaz; "GNSS POS WEB STUDIO - Profesyonel Jeodezik Hesaplama İstasyonu" başlığıyla tanzim edilir.
- **İmza Alanları:** Resmi onay kurumlarına ait olmadığı için imza kutuları kaldırılmıştır.
- **Yasal Sorumluluk Reddi Beyanı:** Raporun altında BÖHHBÜY yönetmeliği ve teknik kontrol amaçlı bilgilendirme metni zorunlu olarak yer alır.
- **Tablo Görünümü:** Her noktanın Enlem, Boylam, Elipsoit Kotu ($h$), TG-20 Undülasyonu ($N$) ve Ortometrik Kotu ($H$) net olarak listelenir.

### C. Jeodezik Bütünlük & Datum Dönüşüm Kuralı (EPSG Standartları)
1. **Aynı Datum İçi Dönüşümler (%100 Matematiksel Kesinlik):**
   - TUREF / ITRF-96 (GRS80) kendi içinde: Coğrafi $\leftrightarrow$ TM 3° (DOM 27..45) $\leftrightarrow$ UTM 6° (Zone 35..38) $\leftrightarrow$ ECEF.
   - Analitik Transverse Mercator formülleri ile sıfır hata.
2. **Farklı Datumlar Arası Geçiş (ITRF-96 $\leftrightarrow$ ED-50):**
   - Bursa-Wolf 7 parametre panelini aktif eder; projeye özel parametre girişine olanak tanır.

### D. Çift Modlu İstemci Çalışma Güvencesi (Dual-Mode Execution)
- `file:///` protokolünde doğrudan In-Memory JS yürütme yapılır; `http(s)://` ortamında ise arka plan Web Worker motorları kullanılır. Sıfır sunucu bağımlılığı vardır.

### E. Pafta İndeks & KML Kesişim Analiz Motoru
1. **Standart Pafta Koordinat Boyutları:**
   - 1/100 000: $30' \times 30' = 0.50^\circ \times 0.50^\circ$
   - 1/50 000: $15' \times 15' = 0.25^\circ \times 0.25^\circ$
   - 1/25 000: $7'30'' \times 7'30'' = 0.125^\circ \times 0.125^\circ$ (Hassas grid adımı: `0.125°`)
   - 1/5 000: $1'30'' \times 1'30'' = 0.025^\circ \times 0.025^\circ$
   - 1/2 000: $45'' \times 45'' = 0.0125^\circ \times 0.0125^\circ$
   - 1/1 000: $22.5'' \times 22.5'' = 0.00625^\circ \times 0.00625^\circ$
2. **KML / KMZ / GeoJSON İçe Aktarım Güvencesi:**
   - Netcad, AutoCAD ve Google Earth KML çıktılarında virgülden sonra gelen boşlukları, satır atlamalarını ve 2D/3D koordinatları toleranslı yakalayan regex koordinat ayrıştırıcı.
   - İçe aktarılan projenin bounding box'ı ile kesişen paftalar `getIntersectingSheets` ile Türkiye sınırları içerisinde hatasız belirlenir; varsayılan olarak **1/25 000** paftaları listelenir ve yan paneldeki seçici ile **1/100 000, 1/50 000, 1/25 000, 1/5 000, 1/2 000 ve 1/1 000** ölçekleri arasında anında dinamik geçiş yapılabilir.


### F. İHA Uçuş Planlama


8. **Jeodezik & Fotogrametrik Nirengi / Üçgenleme (Delaunay) Ağı Standartı:**
   - Poligonun tüm uç köşeleri (Corner Anchors) ve uzun kenar hatları (Flanks) üçgenleme geometrisini kapatacak şekilde kesin olarak kontrol altına alınır.
   - İç blok noktaları, çevre noktalarıyla **eşkenara yakın ideal Delaunay üçgenleri** oluşturacak şekilde hekzagonal olarak yerleştirilir.
   - Harita araç çubuğuna **`[ 📐 Üçgen Ağı ]`** katmanı eklenmiştir; haritacı oluşturulan YKN'lerin birbirini nasıl bağladığını, kenar mesafelerini ve üçgenleme kalitesini görsel olarak denetleyebilir.
 (Merkez Çekirdek & Kubbe Deformasyonu Koruması):**
   - Fotogrametrideki kubbe/çanak (dome effect) deformasyonunu engellemek için noktalar sadece dış sınırlara yığılmaz; alanın geometrik ağırlık merkezi ve iç çekirdeğine (Core Interior Mesh) düzenli aralıklarla kontrol noktaları yerleştirilir.
   - **Hekzagonal Ağ & Centroidal Voronoi / Yay (Spring) Relaksasyonu** ile tüm noktalar alan boyunca eşit, dengeli ve homojen dağıtılır; her mesafe adımında (örn: 2000m) iç alan ile çevre arasında ~%50 / %50 optimal denge kurulur.
   - Noktadan en yakın yola **mesafe lider çizgisi** (ör: `📏 68m`) çekilir ve arazi erişim mesafesi gösterilir.
   - Kullanıcı/haritacı sahadaki tüm YKN/DN pinlerini fareyle **istediği açıklığa veya parsel köşesine sürükleyip bırakabilir**; WGS-84, ITRF-96 ve yol mesafeleri canlı olarak anında güncellenir.

   - YKN koordinatları kesinlikle yolun üzerine zorla çekilmez; fotogrametrik bindirme ve güvenlik gereği **saha içindeki asıl güvenli konumunda** kalır.
   - Noktadan en yakın yola **mesafe lider çizgisi** (ör: `📏 68m`) çekilir ve arazi erişim mesafesi hem haritada hem tabloda gösterilir.
   - Kullanıcı/haritacı sahadaki tüm YKN/DN pinlerini fareyle **istediği açıklığa veya parsel köşesine sürükleyip bırakabilir**; WGS-84, ITRF-96 ve yol mesafeleri canlı olarak anında güncellenir.


7. **Harita Altlıklarında Ticari POI & Mekan Kirliliğinin Engellenmesi:**
   - Harita altlıklarında kafa karıştırıcı otel, restoran, dükkan ve işletme simgeleri (`POI - Point of Interest`) tamamen devre dışı bırakılmıştır.
   - Varsayılan altlık olarak **Saf Yüksek Çözünürlüklü Uydu** (`Google lyrs=s` ve `Esri World Imagery`) kullanılır.
   - Topoğrafya ve hibrit katmanlarda Google Maps API stil filtreleri (`apistyle=s.t:33|p.v:off|s.t:34|p.v:off...`) ile tüm ticari etiketler kapatılmıştır.
, Dışbükey Koruyucu Alan Sadeleştirme & Akıllı YKN Dağıtım Mimarisi
1. **Dışbükey Koruyucu Alan Sadeleştirme (Outward-Preserving Outer-Hull):**
   - **Kritik Kural:** Alanı **asla içeri doğru küçültmez / daraltmaz** ($Area_{simplified} \ge Area_{original}$).
   - İçe doğru girintili (concave notches / zikzaklar) cepler dıştan köprülenerek ($cross \le 0$) teğetsel dış zarfa dönüştürülür.
   - İHA'nın gereksiz köşe dönüşleri engellenir, batarya tasarrufu ve uçuş emniyeti maksimize edilir.
2. **Astronomik Güneş Yüksekliği & Gölge İndeksi (Solar Trajectory):**
   - Gün/ay/yıl ve koordinata göre Spencer/Cooper deklinasyonu ($\delta$), Zaman Denklemi ($E_oT$) ve Yerel Güneş Zamanı ($LST$) hesaplanır.
   - Gölge katsayısı: $L = 1 / 	an(	heta_{	ext{alt}})$.
   - Güneş yüksekliği $	heta \ge 35^\circ$ ($L \le 1.4	imes$) olan zaman dilimi **"En Verimli Uçuş Penceresi"** olarak otomatik belirlenir.
3. **Canlı Open-Meteo Rüzgar & Uçuş Güvenlik İndeksi:**
   - 10m rüzgar hızı, rüzgar hamlesi (gust), yağış olasılığı ve bulutluluk oranı canlı çekilir.
   - Rüzgar $< 8	ext{ m/s}$ (Güvenli), $8-12	ext{ m/s}$ (Dikkat), $> 12	ext{ m/s}$ veya Yağışlı (Riskli) uçuş indeksi sunulur.
   - Hakim rüzgar yönüne göre **Önerilen Uçuş Hat Doğrultusu (Optimal Heading Azimuth)** önerilir.
4. **Akıllı YKN Üçgenlemesi & OpenStreetMap Yol Ağına Snap:**
   - Kullanıcı tanımlı "Maksimum 2 YKN Arası Mesafe" (örn: $1000	ext{ m}$) ile çevre ve iç hacimde homojen üçgen/altıgen grid kurulur.
   - Çok Kaynaklı Hibrit Yol Ağı & Akıllı Snap Sistemi:
     * a) **Genişletilmiş OSM & Arazi Sorgusu:** `highway=*`, `tracktype=*`, `surface=unpaved/dirt/gravel` ve tarla servis yolları otomatik çekilir.
     * b) **İnteraktif Uydudan Toprak Yol Çizim Aracı (Manual Road Trace):** OSM'de henüz haritalanmamış tarla içi traktör yolları için harita üzerinde 2-3 tıkla anında canlı yol hattı çizilebilir; YKN'ler çizilen bu yola anında bağlanır.
     * c) **Dış Yol Dosyası İthalatı (KML / KMZ / GeoJSON / DXF):** Netcad veya resmi kadastro tescilli yol hatları doğrudan projeye aktarılabilir. haritada yol sınıflarına göre (Asfalt, Köy Yolu, Traktör İzi, Patika) renklendirilerek çizilir; teorik YKN noktaları en yakın yol kenarına ($d \le 300	ext{ m}$) otomatik kaydırılır (**Snap to Road**).
   - Noktalar **%75 YKN (Yer Kontrol)** ve **%25 DN (Denetim Noktası)** olarak sınıflandırılır.
   - Üretilen tüm noktalara `geodesyEngine.js` ile ITRF-96 TM 3° koordinatları ve `tg20GeoidEngine.js` ile HGM TG-20 ortometrik kotları ($H = h - N$) anında basılır.
5. **Fotogrametri & Çoklu Format Dışa Aktarım:**
   - Sensör ve GSD parametreleriyle gerekli Uçuş İrtifası (AGL), hat uzunluğu, fotoğraf sayısı ve batarya adedi hesaplanır.
   - Çıktılar: **DJI Pilot 2 / UgCS KML**, **Netcad NCN**, **AutoCAD DXF**, **Google Earth KML**, **Excel CSV**.

### E. Proje Agent Becerileri (Skills Architecture)
Projede yüklü 8 adet tasarım, harita mühendisliği ve kullanıcı deneyimi uzmanlığı:
1. `ui-ux-pro-max`: Bento grid, Glassmorphism, Specular Glow ve 99 anti-pattern koruması.
2. `ui-ux-design-system`: Tasarım token'ları, Obsidian teması, renk paletleri ve tipografi.
3. `frontend-dashboard-mastery`: Leaflet haritalar, sticky tablolar ve gerçek zamanlı KPI'lar.
4. `responsive-web-craft`: Sıfır bağımlılık, responsive düzenler ve temiz A4 baskı stilleri.
5. `ux-heuristics-and-keyboard-mastery`: `Ctrl+K`, `Ctrl+O`, `Ctrl+P`, `Esc` ve 10 Nielsen UX kuralı.
6. `micro-interactions-and-delight`: Full-screen dragover glow, tactile click physics ve skeleton loaders.
7. `interactive-product-tour`: Sıfır bağımlılıklı spotlight tanıtım turu ve empty state CTA'ları.
8. `geomatics-ux-copywriting`: Türkiye Harita & Kadastro Mühendisliği sektör jargonu, BÖHHBÜY / TKGM terminolojisi ve doğal insan dili (Humanized Copy).

---

## 📌 4. Gelecek Geliştirme Fikirleri & Genişleme Alanları (Roadmap)
* [x] TG-20 Türkiye Hibrit Jeoidi Entegrasyonu (Gömülü Uint16Array + Bilinear Engine)
* [x] Bağımsız TG-20 İstasyonu (Tek Nokta & Toplu Liste İndirgeme)
* [x] GPSFormat Pro Çift Okuma & Tekil Noktalarda TG-20 Ortometrik Kotlama
* [x] Kurumsal Yazdırılabilir PDF Rapor Şablonu & Yasal Sorumluluk Reddi
* [x] Kullanıcı Deneyimi & Klavye Kısayolları (Ctrl+K, Ctrl+O, Ctrl+P, Esc)
* [x] Tam Ekran Sürükle-Bırak Neon Geri Bildirimi (Full-Page Drag Glow)
* [x] Zengin Boş Durumlar & Çağrı Butonları (Empty States with CTA)
* [x] 4 Adımlı İnteraktif Spotlight Tanıtım Turu
* [x] Akıllı Jeodezik Bilgi Balonları (Hover Tooltips)
* [ ] RTK Çift Frekanslı Kinematik Baseline Çözücü (Taşıyıcı Faz Çözümü)
* [x] İHA Uçuş Ön Hazırlık, Dışbükey Koruyucu Alan Sadeleştirme & Akıllı YKN Dağıtım İstasyonu
* [x] Astronomik Güneş Yüksekliği, Gölge İndeksi & Canlı Meteoroloji Entegrasyonu
* [x] OSM Yol Ağına Snap Özellikli YKN/DN Üçgenleme ve TG-20 Kotlu Çoklu Format Export (DJI KML, NCN, DXF, CSV)
* [ ] RINEX Header Editör Modülü (Anten yüksekliği, alıcı tipi, istasyon adı değiştirme)


9. **Ölçek-Bağımsız Adaptif Maksimum Aralık Mantığı ($D_{max}$ Tavan Sınırı):**
   - Kullanıcının girdiği `Maksimum YKN Aralığı` bir asgari mesafe değil, **üst tavan sınırdır** (*"Hiçbir iki kontrol noktası bu mesafeden daha uzak olamaz"*).
   - Yüzlerce/binlerce hektarlık büyük uçuş bloklarında noktalar girilen aralıkla (500m, 1000m, 2000m) homojen hekzagonal ağ oluşturur.
   - Küçük ve orta ölçekli parsellerde (10-100 ha) ise algoritma alanın diyagonal boyutuna otomatik adapte olur; parsel boyutundan bağımsız olarak **uç köşe ankrajları (4 kadrant) ve geometrik merkez çekirdeği** daima korunarak 2D/3D fotogrametrik geometri asla bozulmaz/doğrusal çizgiye çökmez.


10. **Dar Açılı (İğne / Degenerate Sliver) Üçgenleri Önleme ve Kırıklık Açısı Filtresi:**
   - Bir poligon köşesinin kontrol noktası ankrajı olabilmesi için doğrultu sapma açısının $\ge 30^\circ$ (iç açı $\le 150^\circ$) olması şarttır. Düz hat kıvrımlarına gereksiz nokta atılmaz.
   - Oluşan Delaunay üçgenlerinde iki kenarı neredeyse paralel, bir açısı $< 20^\circ$ olan dar iğne üçgenler (sliver triangles) fotogrametrik açıdan sakıncalı olduğu için aynı kenardaki birbirine çok yakın lüzumsuz ara noktalar elenir ve köşeler eşkenar oranına yakın geniş üçgenlerle birbirine bağlanır.


---
## ⭐ ALTIN STANDART (MÜKEMMEL FOTOGRAMETRİK AĞ MİMARİSİ):
- **Adaptif 2D Mekansal Taban & Köşe Ankrajları:** Poligonun tüm belirgin uç köşeleri (Corner Anchors) ve uzun kenar hatları (Flanks) kesin olarak kontrol altına alınır.
- **Hekzagonal İç Çekirdek:** İç blok noktaları, çevre noktalarıyla eşkenara yakın ideal fotogrametrik üçgenler (Delaunay Mesh) oluşturacak şekilde yerleştirilir.
- **Canlı Nirengi (Üçgenleme) Ağı Katmanı (`[ 📐 Üçgen Ağı ]`):** Harita üzerinde noktaların birbirine bağlantısı kesikli çizgiler ve kenar mesafeleriyle interaktif olarak denetlenebilir.
- **Sürükle-Bırak & Canlı Yol Mesafesi:** Her nokta yola lider çizgisiyle bağlanır (`📏 Mesafe`), kullanıcı sahada istediği noktayı fareyle sürükleyip anında koordine edebilir.


11. **İnteraktif YKN Silme & Dinamik Nirengi Yenilenmesi:**
   - Haritadaki her YKN/DN pininin sağ üst köşesine kırmızı küçük bir **`✕`** silme butonu yerleştirilmiştir.
   - Ulaşımı zor, dik yamaçta veya orman içinde kalan istenmeyen bir noktaya tıklandığında (veya tablodan silindiğinde) nokta anında kaldırılır.
   - Kalan noktalar arasında **Delaunay üçgenleme (nirengi) ağı ve koordinat tablosu anında yeniden hesaplanarak** geometri otomatik olarak güncellenir.


12. **Uydudan Canlı Yol Çizim Motoru (`[ ✏️ Yol Çiz ]`):**
   - OSM'de bulunmayan tarla/arazi yolları için harita araç çubuğundaki ve Panel 2'deki `[ ✏️ Yol Çiz ]` butonuyla interaktif çizim modu açılır.
   - Haritaya tıklandıkça canlı elastik turuncu yol çizgisi ve düğüm noktaları çizilir; çift tık veya `[ ✔️ Tamamla ]` ile yol kalıcı hale getirilir (`#f59e0b` altın sarısı kesikli hat).
   - Çizilen yol anında yol ağına katılır ve sahadaki tüm YKN'lerin yola olan mesafesi ve lider çizgileri bu yeni yola göre güncellenir.


13. **Harita Çizgi Renk ve Görsel Ayrıştırma Standardı:**
   - **Nirengi / Üçgen Ağı Çizgileri (`[ 📐 Üçgen Ağı ]`):** Açık Elektrik Camgöbeği / Neon Cyan (`#00e5ff`) kesikli çizgilerle çizilir.
   - **Yola Erişim Ofset Lider Çizgileri (`📏 Mesafe`):** Canlı Altın Sarısı / Sıcak Amber (`#f59e0b`) kesikli hat ve altın rozet etiketi ile gösterilir; nirengi ağıyla asla karışmaz.


- **YKN Silme Güvenilirliği:** Leaflet sürükleme (drag) olaylarının `✕` butonunu bloke etmesini önlemek için `L.DomEvent.disableClickPropagation(delBtn)` ve doğrudan DOM event dinleyicisi eklenmiştir. Nokta silindiğinde `window.deleteGcpPoint` nirengi ağını ve tabloyu anında sıfırdan yeniden örer.


14. **Meteoroloji Tahmin Takvimi, Saat Kaydıracı & Canlı Uçuş HUD Paneli:**
   - **15 Günlük Tahmin Sınırı:** Uçuş tarihi seçicisi (`flightDatePicker`), Open-Meteo küresel tahmin verisiyle uyumlu olarak `Bugün` ile `Bugün + 15 Gün` aralığına kısıtlanmıştır; geçersiz tarih seçimi engellenmiştir.
   - **Tekil Saat Kaydıracı (`[ 🕒 Saat: 11:00 ]`):** Üst araç çubuğuna ve panel içine entegre edilen kaydırıcıyla uçuş saati değiştirildiğinde o saatin **güneş açısı, gölge boyu ve Open-Meteo'dan gelen anlık rüzgar hızı/yönü** canlı olarak simüle edilir.
   - **Uçuş Ortamı HUD Paneli (2 Dinamik Kadran / Ok):**
     1. **☀️ Güneş & Gölge Kadranı:** Işığın gökyüzünde nereden geldiğini (Azimut örn. 145° GD), tepe yüksekliğini ve tam zıt yönündeki gölge vektörünü 360° pusula üzerinde gösterir.
     2. **💨 Rüzgar & Hat Kadranı:** Rüzgarın estiği yönü (Derece & Yön), şiddetini (km/s & m/s) ve fotogrametrik uçuş güvenliği durumunu (🟢 İdeal / 🟡 Dikkat / 🔴 Riskli) canlı ok ile sunar.
   - **Harita Katmanı:** Harita üzerinde ışık kaynağı pini (`☀️ Işık Kaynağı`), ışın demetleri (`#f59e0b`), mor gölge düşüm vektörü (`#a855f7`) ve turkuaz rüzgar akım çizgisi (`#06b6d4`) yüksek kontrastla çizdirilir.


15. **Premium Koyu-Cam (Dark Glassmorphic) Form Elemanları:**
   - Panel 2 ve tüm sol panel kartlarındaki tarayıcı varsayılanı beyaz input kutuları kaldırılmıştır.
   - Tüm sayısal ve metin girişleri `#030712` koyu obsidyen zemin, `1px solid rgba(255,255,255,0.14)` cam çerçeve, odaklandığında (focus) `cyan glow` halkası ve mono tipografi ile giydirilmiştir.
   - Birimler (`m`, `cm/px`, `%`) şık iç rozetler (`.input-unit-suffix`) olarak inputun sağına gömülmüştür.
   - Açılır kutular (`<select>`) özel SVG ok simgesi ve koyu seçenek menüleriyle estetik bir bütünlüğe kavuşturulmuştur.


- **Arayüz Sadeleştirmesi:** Sol paneldeki mükerrer "Güneş Açısı & Gölge Simülasyonu" kartı kaldırılmış; tüm simülasyon kontrolü üst araç çubuğundaki tekil saat kaydıracına (`[ 🕒 Saat ]`) ve harita köşe HUD pusula paneline taşınarak sol çalışma sütunu ferahlatılmıştır.


- **Sadeleştirilmiş Güneş & Gölge Widget'ı (Harita Sol Köşe):**
  - Harita verisinin (poligon, yol, YKN ağı) üzerindeki kalabalık çizgi ve animasyonlar tamamen temizlenmiştir.
  - Haritanın sol alt köşesine kompakt bir pusula kadranı (`#widgetSolarShadowCompass`) yerleştirilmiştir:
    - Saat değiştikçe dönen altın renkli güneş yön oku (`☀️ 145° GD`).
    - Yanında anlık açı ve yaklaşık gölge boyu çarpanı (`0.7x Boy`).


16. **İrtifaya Duyarlı Rüzgar Katmanları & İkili (Güneş + Rüzgar) Pusula Widget'ı:**
   - **Çok Katmanlı Atmosferik Rüzgar:** Open-Meteo'dan `10m`, `80m`, `120m`, `180m` irtifa rüzgar hız ve yön katmanları çekilmektedir.
   - **Dinamik İrtifa Eşleşmesi:** Panel 3'te seçilen kamera veya hedef GSD'ye göre hesaplanan uçuş irtifası (örn. `96m AGL`, `120m AGL`, `150m AGL`) değiştikçe, o irtifadaki gerçek rüzgar hızı, yönü ve hamlesi interpole edilerek otomatik getirilir.
   - **Harita Sol Köşe İkili Widget (`#widgetSolarWindCompass`):**
     1. **☀️ Güneş Kadranı:** Güneşin geliş açısı (`145° GD`) ve anlık gölge boyu çarpanı (`0.7x Boy`).
     2. **💨 İrtifa Rüzgarı Kadranı:** Uçuş yüksekliğindeki anlık rüzgar yön oku (`258° BGB`), hızı (`km/s` & `m/s`) ve uçuş güvenlik durumu (`🟢 İdeal`).


- **Panel 2 Yol Butonları Sadeleştirmesi:** Harita üst çubuğunda zaten `[ ✏️ Yol Çiz ]` ve `[ 📁 Yol KML ]` butonları bulunduğu için sol paneldeki mükerrer yol butonları kutusu kaldırılmış; kart doğrudan YKN parametrelerine odaklanacak şekilde kompaktlaştırılmıştır.


- **İnteraktif Tarih Seçici Tasarımı (`.interactive-date-control`):** Düz ve tıklanması anlaşılmayan tarih kutusu yerine, parlak turkuaz takvim simgesi (`📅`), açılır ok (`▾`), hover parlama efekti (`cyan glow`) ve tıklamada doğrudan yerel takvim seçicisini (`showPicker()`) tetikleyen şık bir buton yapısı oluşturulmuştur.


17. **Genişletilebilir İHA & Kamera Sensör Veritabanı (DJI, Quantum Systems, Sony vb.):**
   - **Desteklenen Platformlar:** DJI Matrice 350 RTK, Matrice 300 RTK, Matrice 400 (Ağır Yük), Mavic 3 Enterprise (M3E), Mavic 3 Thermal (M3T), Mavic 3 Multispectral (M3M), Phantom 4 RTK, Inspire 3 (X9-8K), Quantum Systems Trinity Pro (VTOL), Trinity F90+ (VTOL), WingtraOne GEN II.
   - **Desteklenen Kameralar/Faydalı Yükler:** Zenmuse P1 (35mm/24mm/50mm Full-Frame 45MP), Zenmuse L2 (LiDAR RGB 4/3 20MP), Zenmuse L1 (1" 20MP), Zenmuse L3 (45MP FF), Zenmuse H30/H30T (48MP), Sony ILX-LR1 (61MP FF), Sony RX1R II (42.4MP FF Zeiss), Micasense RedEdge-P.
   - **Dinamik Eşleşme & Reel Değer Düzenleme:** İHA seçildiğinde sadece o İHA'ya uyumlu kameralar listelenir, varsayılan haritalama hızı (`m/s`) ve güvenli batarya süresi (`dk`) otomatik doldurulur; kullanıcı sahada tecrübe ettiği reel değerleri serbestçe değiştirebilir.
   - **JSON Tabanlı Geliştirilebilirlik:** `web/data/drone_sensors.json` ve arayüzdeki `[ ⚙️ DB Düzenle ]` modalı ile kullanıcı canlı JSON düzenleyebilir, yeni İHA/kamera ekleyebilir, dışa/içe aktarabilir veya fabrika ayarlarına dönebilir (`localStorage` destekli).


18. **Minimalist & Çakışmasız Harita Araç Çubuğu Tasarımı:**
   - **Sol Üst Araç Çubuğu:** Leaflet `+ / -` zoom butonlarının sağına (`left: 52px`) kaydırılmış, buton yükseklikleri `25px` seviyesine indirilmiş, paddingler daraltılmıştır.
   - **Kompakt Katman Toggle İkonları:** `Yollar`, `YKN'ler`, `Üçgen Ağı` butonları metinsiz, kompakt kare ikon butonlara (`25x25px`) dönüştürülmüş ve aktif/pasif parlama durumları bağlanmıştır.
   - **Sağ Üst Hat Rozeti:** `Önerilen Uçuş Doğrultusu` uzun metni `Hat: 308° / 128°` olarak sadeleştirilmiş ve Leaflet katman butonunun soluna (`right: 54px`) sabitlenerek hiçbir çözünürlükte araç çubuğuyla çakışmayacak geniş serbest alan bırakılmıştır.


19. **Tek Satır (Single-Line) Kompakt Üst Araç Çubuğu & Dışa Aktar Menüsü:**
   - İki satıra taşarak ekranı kaplayan dağınık butonlar kaldırılmış; tüm üst çubuk **tek bir ince yatay satıra** (`flex-wrap: nowrap`) toplanmıştır.
   - **Sol Blok:** `[ ☁️ Poligon Yükle ]`, `[ 🪄 Örnek ]`, `[ 📅 Tarih ]`, `[ 🕒 Saat Kaydıracı ]`.
   - **Sağ Blok:** Tüm dışa aktarma formatları (DJI Pilot 2 KML, Netcad NCN, AutoCAD DXF, Excel CSV, Google Earth KML) şık bir **`[ 💾 Dışa Aktar ▾ ]`** açılır menüsünde toplanarak %60 dikey ve yatay alan tasarrufu sağlanmıştır.


20. **Tam Genişlik Panoramik Harita & Alt 3'lü Kart Dizilimi (Widescreen Layout):**
   - Sol paneldeki dikey sıkışık kart düzeni kaldırılmıştır.
   - **Üst Katman:** Harita ekranın %100 tam genişliğine yayılmış panoramik bir çalışma alanına (`560px` yükseklik) dönüştürülmüştür.
   - **Orta Katman (3'lü Kart Dizilimi):** Haritanın altında doğal bir iş akışı olarak 3 temel panel yan yana (`repeat(3, 1fr)`) konumlandırılmıştır:
     1. `1. Uçuş Alanı & Zarf` (Sadeleştirme Düzeyi, Orijinal/Zarf Katmanları, Alan Kapsama)
     2. `2. Akıllı YKN & Yol Ağı` (Maks Aralık, YKN/DN Oranı, Emniyet Payı, Snap to Road, YKN Üret Butonu)
     3. `3. İHA, GSD & Batarya` (İHA Modeli, Kamera Sensörü, Hedef GSD, Hız, Bindirme, Batarya Süresi, DB Düzenle)
   - **Alt Katman:** Üretilen YKN ve DN Koordinat Tablosu tam genişlikte (`100%`) tüm sütunları rahatça okunacak şekilde en altta yer alır.


- **Gereksiz Koordinat Tablosunun Kaldırılması:** Harita üzerinde tüm YKN pinleri etkileşimli olarak görülebildiği ve üst menüdeki `[ 💾 Dışa Aktar ]` butonuyla DJI KML, Netcad NCN, AutoCAD DXF, Excel CSV, Google Earth KML formatlarında anında indirilebildiği için alttaki yer kaplayan koordinat tablosu kaldırılmış; arayüz tamamen ferahlatılmıştır.


21. **Kompakt Telemetri KPI Göstergeleri (Ultra-Sleek Ribbon):**
   - Üstteki 4 adet kaba KPI kartının dikey yüksekliği ve paddingleri %50'den fazla küçültülmüş (`7px 11px`), yazı boyutları `14.5px` seviyesine indirilmiştir.
   - Kartlar haritanın hemen üzerinde ince, zarif bir telemetri şeridi gibi konumlanarak dikeyde büyük alan tasarrufu sağlar.


22. **İHA Maksimum Uçuş Hızları (Max Speed) & Hız Aşım Güvenlik Telemetrisi:**
   - DJI Matrice 350/300 RTK (23 m/s - 83 km/h), Matrice 400 (25 m/s - 90 km/h), Mavic 3 Enterprise/Thermal/Multispectral (21 m/s - 76 km/h), Phantom 4 RTK (14 m/s - 50 km/h), Inspire 3 (26 m/s - 94 km/h), Quantum Systems Trinity Pro / F90+ (Seyir: 17 m/s, Maks: 22 m/s - 79 km/h), WingtraOne GEN II (Seyir: 16 m/s, Maks: 20 m/s - 72 km/h) değerleri veritabanına işlenmiştir.
   - **Arayüz Gösterimi:** İHA seçim kutusunda model adının yanında anında `[Maks: 21 m/s / 75.6 km/h | 32 dk]` olarak gösterilir.
   - **Canlı Hız Aşım Uyarısı:** Kullanıcı İHA'nın fiziksel limitinden yüksek bir hız girdiğinde arayüzde kırmızı alarm (`⚠️ Maks Hız Sınırı Aşıldı`) vererek uçuş güvenliğini korur.


23. **Tam Matrice 4 Serisi Entegrasyonu & Doğrudan JSON Veritabanı Mimarisi:**
   - **DJI Matrice 4 Serisi Eklendi:**
     * `DJI Matrice 400 (Ağır Yük / 6kg Flagship)`: 25.0 m/s (90.0 km/h) Maks Hız, 14 m/s Rüzgar, Zenmuse P1/L2/L3/H30/H30T, Sony ILX-LR1 desteği.
     * `DJI Matrice 4 Enterprise (M4E)`: 21.0 m/s (75.6 km/h) Maks Hız, 20MP Mekanik Shutter haritalama sensörü.
     * `DJI Matrice 4 Thermal (M4T)`: 21.0 m/s (75.6 km/h) Maks Hız, Termal + RGB Tele sensörü.
     * `DJI Matrice 30 & 30T (IP55)`: 23.0 m/s (82.8 km/h) Maks Hız, 15 m/s rüzgar dayanımı.
     * `DJI Matrice 210 RTK V2` & `Matrice 600 Pro`: Klasik endüstriyel platformlar.
   - **Kullanıcı Arayüzü DB Modalının Kaldırılması:** Kullanıcıların arayüzde JSON ile uğraşmaması için `[ ⚙️ DB Düzenle ]` butonu ve modalı arayüzden tamamen kaldırılmıştır. Sistem `web/data/drone_sensors.json` dosyasını otomatik senkronize okur; yönetici dosyayı doğrudan güncelleyebilir.


24. **Tüm Modüllerde Tasarım & Yerleşim Uyumlaştırması (Global Design Harmony):**
   - **Form Kontrolleri:** `RTK & Kadastro Çetelesi`, `Koordinat Dönüşümü`, `TG-20 Jeoit İndirgeme` ve `RINEX Düzenleyici` modüllerindeki tüm form girişleri standart obsidian koyu cam `.form-input`, `.form-select`, `.input-unit-group` ve gömülü birim rozetleriyle (`m`, `cm`, `dk`, `°`, `%`) giydirilmiştir.
   - **Panoramik Harita Standardı:** `Pafta İndeksi & Harita` ve `Kadastro View` haritaları tam genişlikte (`560px` yükseklik) ve minimal araç çubuklarıyla `İHA Uçuş & YKN` modülüyle birebir aynı görsel standarda getirilmiştir.
   - **Kompakt Dropzone & Araç Çubukları:** RINEX yükleme dropzone'u, Jeodezi EPSG seçimleri ve Kadastro parametreleri aşırı kaba yüksekliklerden arındırılarak ince ve minimal bir düzen kazanmıştır.


25. **Tüm Sistemde Fiziksel Boyut & Ekran Alanı Optimizasyonu (Ultra-Kompakt & Minimalist Arayüz):**
   - **Üst Başlık & Kenar Çubuğu:** `.top-header` yüksekliği `72px`'den `44px`'e, kenar çubuğu genişliği `260px`'den `220px`'e indirilerek dikey/yatay çalışma alanı maksimum seviyeye çıkarılmıştır.
   - **Genel Buton Boyutları:** `.btn` varsayılan iç dolgusu `9px 18px`'den `4px 12px` (`28px` sabit yükseklik), `.btn-sm` `22px` ve `.sub-tab-btn` `26px` yüksekliğe küçültülmüştür.
   - **Kart ve İçerik Boşlukları:** `.card` paddingi `20px 24px`'den `10px 14px`'e, `.content-body` dış boşluğu `24px 32px`'den `10px 16px`'e düşürülmüştür.
   - **Tablolar ve Giriş Alanları:** Tablo satır yükseklikleri ve form girişleri `28px` standart minimal yüksekliğe sabitlenmiş, ekranda kaydırma yapmadan tüm verilerin tek bakışta görünmesi sağlanmıştır.


26. **Ana Sayfa Bento Kartları & HTML Hiyerarşi Kusursuzluğu (Bento & Section Integrity):**
   - Ana Sayfa (`tab-home`) üzerindeki Bento modül kartları (`.bento-card`, `.bento-featured`, `.home-bento-grid`) tam CSS stilleriyle eksiksiz restore edilmiş ve minimalist kompakt boyutlara oturtulmuştur.
   - `tab-tg20` içerisindeki fazladan kapanan div etiketi düzeltilerek tüm sekmelerin (`tab-home`, `tab-cadastre`, `tab-rinex-studio`, `tab-map`, `tab-geodesy`, `tab-tg20`, `tab-flight`, `tab-guide`) div açma/kapama farkları sıfırlanmış ve birbirine karışma sorunu tamamen giderilmiştir.

27. **Fotogrametri Motoru Değişken Uyumu & Panel 3 Canlı Tetikleme:**
   - lightPlannerEngine.js içerisindeki kamera özellikleri (sensorW/sensorWidthMm, ocalMm/ocalLengthMm, imageW/imageWidthPx) çapraz desteklenecek şekilde uyumlu hale getirilmiştir.
   - Hedef GSD, Boyuna/Enine Bindirme, Uçuş Hızı ve Pil Süresi girişlerinin tümüne canlı input dinleyicileri bağlanarak her değer değişiminde anında İrtifa (AGL), Mesafe, Fotoğraf Sayısı ve Batarya İhtiyacı hesaplanır.

28. **Fotogrametrik Uçuş Koridorları, Yılan Kıvrımlı (Serpentine) Hatlar & Pozlama Haritası:**
   - Kamera odak uzaklığı ($), sensör boyutu (, H_s$), hedef GSD ($) ve boyuna/enine bindirme oranlarına göre matematiksel olarak hesaplanan uçuş yüksekliği ($), hat aralığı ({step}$) ve fotoğraf tetikleme adımı ({step}$) belirlenir.
   - Poligonun en az dönüşlü uzun eksenine (indOptimalLongAxisHeading) veya canlı rüzgar açısına göre dönel koordinat sisteminde paralel uçuş hatları, dönüş yayları, koridor kapsama bantları (swath buffer) ve pozlama noktaları üretilir.
   - Harita üst araç çubuğundaki katman butonları ( tnToggleFlightLines,  tnToggleCorridors,  tnToggleWaypoints) ile görselleştirme ve DJI Pilot 2 KML görev ihracı tam desteklenir.

29. **Yalın Uçuş Koridor Hatları ve Tetikleme Noktaları (Minimalist Grid):**
   - Haritayı boğan yarı saydam yer kaplama alanı poligonları kaldırılmış; yalnızca net, estetik neon uçuş koridor çizgileri, yön okları, turuncu dönüş yayları ve sarı kamera tetikleme (pozlama) noktaları çizilerek harita performansı ve okunabilirliği en üst seviyeye çıkarılmıştır.

30. **Zenmuse P1 Lens Seçenekleri & DJI Matrice 350 Resmi Yük Uyumu:**
   - DJI Zenmuse P1 için 24mm (Geniş), 35mm (Standart) ve 50mm (Dar/Tele) lensler seçildiğinde aynı hedef GSD (örn: 2.5cm) için uçuş irtifası optik formüle ( = (GSD \cdot f) / pixelSize$) göre anında değişir (24mm -> 136.4m, 35mm -> 198.9m, 50mm -> 284.1m).
   - selectDroneCamera dinleyicisi canlı bağlanarak her lens değişiminde anında harita ve telemetri güncellenir.
   - Matrice 350 / 300 RTK yük listesinden uyumsuz zen_l3 kaldırılmış, yalnızca resmi desteklenen P1, L2, L1, H30, H30T yükleri bırakılmıştır.

31. **Alanı Uçuş Rotasına Göre Optimize Etme (Paralel Dışsal Zarf Butonu):**
   - Kullanıcı isteğine bağlı olarak hem Panel 1 hem Panel 3 içine [ 🔄 Alanı Uçuş Rotasına Göre Optimize Et ] / [ 🔄 Rotaya Uyarla ] butonu eklenmiştir.
   - Buton aktif edildiğinde, saha poligonunun uçuş koridoruna bakan yan kenarları uçuş açısına (' = x'_{min}, x'_{max}$) tam paralel hale getirilir, baş/son dönüş kenarları dışbükey olarak düzleştirilir ve asla orijinal alan küçülmeyecek (tam dışa doğru kapsama) şekilde optimize edilir.
   - Kullanıcı açı sliderını oynattıkça bu mod açıksa poligon dinamik olarak yeni açıya göre paralel zarfını günceller. İstenmediğinde tek tıkla kapatılıp standart zarfa dönülebilir.

32. **Çift Yönlü Canlı Uçuş İrtifası (AGL m) ve Hedef GSD (cm/px) Girişi:**
   - Panel 3 parametrelerine doğrudan düzenlenebilir İrtifa (AGL): [ XX ] m giriş kutusu (#inputFlightAltitude) eklenmiştir.
   - Kullanıcı ister doğrudan Uçuş Yüksekliği (m) girer, ister Hedef GSD (cm) girer; optik formüle ( = (GSD \cdot f)/p$) göre her iki girdi kutusu birbirini canlı olarak anında hesaplayıp günceller, hat sayısı, şerit aralığı, tetikleme adımı ve haritadaki uçuş hatları anında yeniden çizilir.

33. **Panel 3 Ergonomik 2x2 Grid Mimarisi & Canlı Optik Telemetri:**
   - Panel 3 parametreleri birbirini ezmeyecek ferah 2 sütunlu satırlara bölünmüştür: Satır 1 [İrtifa (AGL)] & [Hedef GSD], Satır 2 [Uçuş Hızı] & [Pil Süresi], Satır 3 [Maks Hız & Rüzgar Rozeti], Satır 4 [Boyuna & Enine Bindirme].
   - Mükerrer HTML input etiketleri tamamen temizlenmiştir.
   - Kamera veya İHA modeli değiştirildiğinde `syncOpticsForSelectedCamera` çağrılarak yeni kameranın odak uzaklığı ve piksel boyutuna göre anında doğru GSD (örn: P4 RTK 100m için 2.73 cm) hesaplanır.
   - Saha poligonu henüz yüklenmemiş olsa dahi alt telemetri özet kutusu canlı optik değerleri (İrtifa, GSD, Fotoğraf Kapsama Alanı ve Deklanşör Güvenliği) anlık gösterir.

34. **Otonom Haritalama Görev Hız Limitleri (DJI Pilot 2 / GS RTK Standartları):**
   - Manuel Sport mod hızları fotogrametrik uçuşta geçersizdir. Tüm İHA modellerinin hız sınırları doğrudan otonom rota planlama yazılım limitlerine (DJI Pilot 2: 15.0 m/s, GS RTK: 13.8 m/s, QBase: 18.0 m/s, M600: 12.0 m/s) ve deklanşör güvenliği için önerilen nominal hızlara güncellenmiştir.
   - Hız girişi ve canlı rozet bu otonom sınırları denetler; aşım veya deklanşör gecikmesi durumunda kullanıcıyı anında uyarır.

35. **İrtifa ve Parametre Değişimlerinde Tarayıcı Çökme/Donma Bariyerleri (Debounce & Hard Caps):**
   - Kullanıcı irtifa kutusunu silip örn: 100 yazarken ilk basılan tek haneli '1' veya '10' gibi ara değerlerde 1 metrelik irtifa için milyonlarca tetikleme noktası ve binlerce koridor hattı üretilmesi engellenmiştir.
   - **Debounce:** İrtifa ve GSD girdi dinleyicilerine 100-120ms debounce eklenerek yazma tamamlanana kadar ara hesaplama ötelenmiştir.
   - **Sert Güvenlik Sınırları:** Minimum irtifa emniyeti ($H_{min} = 10m$), minimum şerit aralığı ($S_{min} = 2.5m$), maksimum koridor hattı ($N_{max} = 300$), maksimum tetikleme noktası ($W_{max} = 2500$) hard cap ile güvenceye alınmıştır.
   - **Leaflet DOM Örnekleme:** Haritada 350'den fazla tetikleme noktası oluştuğunda noktalar otomatik örneklenerek (sampling) tarayıcı sekmesinin bellek tükenmesi/kilitlenmesi tamamen ortadan kaldırılmıştır.

36. **Mega Saha Desteği (2.000 - 10.000 Hektar Ölçeklenebilirlik & 100.000 Nokta Motoru):**
   - Fotogrametri motoru 2.000 - 3.000+ hektarlık devasa endüstriyel sahaları destekleyecek şekilde 1.500 koridor hattı ve 100.000 tetikleme noktasına kadar ölçeklenmiştir.
   - **Hesaplama Hızı:** 3.000 hektarlık (30 km²) bir sahada 24.000 fotoğraf, 600+ km rota ve 22 batarya seti hesaplaması JavaScript çekirdeğinde sadece **3-7 milisaniyede** tamamlanır.
   - **Harita Akıcılığı:** Haritada rotanın tamamı eksiksiz çizilirken, Leaflet üzerinde tetikleme noktaları akıllı görsel örnekleme ile sunularak tarayıcının 60 FPS akıcılıkta kalması garanti altına alınmıştır.

37. **Orijinal Kanıtlanmış Alan Sadeleştirme Motoru (Step 216 Çentik Köprüleme & Varsayılan %50):**
   - Sahanın solundaki veya yanlarındaki derin koy/girintileri tek hamlede düz hatla dıştan birleştiren ve binaların girinti kırıklarını pürüzsüzleştiren orijinal çentik köprüleme algoritması eksiksiz geri yüklenmiştir.
   - Poligon yüklendiğinde varsayılan olarak **Orta (%50)** seviyesiyle açılır; hem orijinal kırıklı sınır (kırmızı kesikli) hem de pürüzsüzleştirilmiş dış sınır (Cyan) birlikte sunulur.
   - Uçuş hatları bu pürüzsüzleştirilmiş dış sınır içinde kusursuz bir şekilde planlanır.

38. **Harita Sol Alt Güneş & Rüzgar HUD Widget'ı ve Saat Kaydırıcı Senkronizasyonu:**
   - Üst araç çubuğundaki uçuş saati slider'ı (#sliderToolbarFlightTime) kaydırıldığında, haritanın sol alt köşesinde yüzen Güneş & İrtifa-Rüzgar Pusula Kartı (#widgetSolarWindCompass) anlık olarak canlı güncellenir.
   - Güneş pusulasında güneş ikonu ilgili azimut açısına (örn: 145° GD) döner; tepe açısı (örn: 54°) ve gölge katsayısı (0.7x Boy) güncellenir.
   - Rüzgar pusulasında rüzgar oku irtifaya uyarlı yöne döner; uçuş irtifasındaki rüzgar hızı (örn: 14 km/s) ve güvenlik durumu (🟢 İdeal / 🟡 Orta / 🔴 Riskli) canlı değişir.
   - Harita yüzeyine gereksiz çizgi çizilmez; tüm görsel telemetri sol alttaki bu zarif widget üzerinden sunulur.

39. **İHA Veritabanı & Selectbox Sadeleştirmesi (Gereksiz Açıklamaların Temizlenmesi):**
   - `drone_sensors.json` ve `droneDatabase.js` içerisindeki tüm modellerden yapay/hatalı `"type"` alanları (örn: `"Hava Koşullarına Dayanıklı (IP55)"`, `"Ağır Endüstriyel Platform"`, `"Kompakt Haritalama Quadcopter"`) ve gereksiz notlar tamamen kaldırılmıştır.
   - Model adlarındaki mükerrer/parantez içi açıklamalar (örn: `DJI Matrice 30 (M30)` ➔ `DJI Matrice 30`, `DJI Matrice 4 Enterprise (M4E)` ➔ `DJI Matrice 4 Enterprise`, `DJI Mavic 3 Enterprise (M3E)` ➔ `DJI Mavic 3 Enterprise`, `DJI Matrice 400 (Ağır Yük / Flagship)` ➔ `DJI Matrice 400`) doğrudan saf model adına sadeleştirilmiştir.
   - İHA Seçim Kutusundaki (`selectDroneModel`) model adının yanındaki parantez içi hız ve batarya metin kalabalığı (`[Maks: ... | ... dk]`) kaldırılmış; model seçildiğinde tüm bu değerler zaten aşağıdaki hız kutusu, pil kutusu ve hız limit rozetinde dinamik çıktığı için açılır liste sadece saf model adlarını gösterecek şekilde ferahlatılmıştır.
   - Kamera sensör adları da profesyonel ve sade bir standarda getirilmiştir.

40. **Operasyonel Saha Süresi & İniş/Kalkış Senaryosu Bilgilendirme Notu:**
   - Panel 3 altındaki Telemetri ve Süre / Batarya (`resCalcDuration`) çıktısının hemen altına profesyonel bir **Operasyonel Saha Notu** mikro kartı eklenmiştir.
   - Haritacıya / İHA pilotuna şu teknik güvence sunulur: *"Hesaplanan süre salt haritalama hatları üzerindeki taramayı kapsar. Kalkış noktasından ilk hatta intikal mesafesi, irtifaya tırmanma, rüzgar direnci ve RTH (eve dönüş / iniş) manevralarına bağlı olarak toplam operasyonel uçuş süresi sahada bir miktar değişkenlik gösterebilir."*
   - Böylece teorik fotogrametri hesabı ile reel arazi operasyonu arasındaki lojistik pay açık ve kurumsal bir dille netleştirilmiştir.

41. **Canlıya Alma, Çok Katmanlı Şifreleme (Obfuscation) & cPanel Dağıtım Paketi:**
   - `web_dev_source_backup/` klasöründe açık kaynak geliştirici kaynak kodları güvenle saklanırken, `web/` klasöründeki tüm JavaScript motorları (`hgmDatumDatabase.js`, `geodesyEngine.js`, `gnssFormatEngine.js`, `rinexPowerEngine.js`, `paftaIndexEngine.js`, `tg20GeoidEngine.js`, `droneDatabase.js`, `flightPlannerEngine.js`, worker'lar ve `app.js`) çok katmanlı `javascript-obfuscator` (Control Flow Flattening, Dead Code Injection, Base64 String Array Encoding, Self-Defending) ile tam korumalı/şifreli hale getirilmiştir.
   - `index.html` içerisine sessiz sağ tık, F12 ve geliştirici araçları kısayol kilitleri (Anti-Tamper Shield) eklenmiştir.
   - cPanel veya paylaşımlı hostinge doğrudan yüklenebilir **`gnss_web_cpanel.zip`** dağıtım paketi kök dizinde üretilmiştir.

42. **Proje Marka & İsim Güncellemesi (Harita Tool & Parlak BETA Rozeti):**
   - Projenin ana marka adı **HARİTA TOOL** (`Harita Tool - Jeodezi & CBS İstasyonu`) olarak güncellenmiştir.
   - Logo ikonu modern haritacılık/CBS temalı `fa-map-location-dot` (ve canlı neon darbe/pulse efekti) ile yenilenmiştir.
   - Başlığın hemen yanına neon cyan ışıltılı, sürekli specular yansıma animasyonlu (`betaShine`) ve nefes alan parlak bir **BETA** rozeti eklenmiştir.

43. **Evrensel RW5 / GeoSurv Çoklu Marka Ayrıştırıcı (Tarih & Grid Koordinat Çözücü):**
   - GeoSurv / Stonex / South cihazlarının yazdığı `--GT,PN...,SW2380,ST461989799` satırlarından GPS Haftası ve Milisaniyesi otomatik çözülerek yerel Türkiye saatine (`UTC+3`) dönüştürülür.
   - Saha cihazının anlık olarak hesaplayıp `--GS,PN...,N...,E...,EL...` satırlarına kaydettiği gerçek arazi Grid koordinatları (`Easting / Northing / Kot`) doğrudan okunup tabloya ve çıktılara aktarılır (varsayılan sıfırdan projeksiyon yerine sahadaki cihaz koordinatları önceliklendirilir).

44. **Tüm Kaynak Kodların Geri Kazanımı & AST Deobfuscation (Full Source Recovery):**
   - AST tabanlı deobfuscator (`webcrack`) ile `web/` klasöründeki tüm JavaScript motorları (`app.js`, `geodesyEngine.js`, `gnssFormatEngine.js`, `flightPlannerEngine.js`, `paftaIndexEngine.js`, `rinexPowerEngine.js`, `tg20GeoidEngine.js`, `rinex_merger_worker.js`, `pos_worker.js`) şifreli halinden tamamen kurtarılmış, %100 açık kaynak ve okunabilir temiz JavaScript mimarisine kavuşturulmuştur.
   - Geliştirme kolaylığı için `index.html`'deki geçici F12/sağ-tık anti-tamper kilitleri kaldırılmış, `web_dev_source_backup/` klasörü en güncel temiz kaynaklarla senkronize edilmiştir.

45. **Panoramik Widescreen Harita Düzeni & İrtifaya Duyarlı Rüzgar/Güneş Gösterge Motoru:**
   - **Üst 3 Mini Kartın Kaldırılması:** Harita üzerindeki dikey sıkışıklık ve mükerrer göstergeler (`.flight-hud-kpi-container`) kaldırılarak harita doğrudan araç çubuğu altına bağlanmış ve tam ekran panoramik çalışma alanı kazanılmıştır.
   - **Rüzgar & Güneş Göstergesinin Canlı Eşleşmesi (`updateAtmosphereSimulation`):**
     * Saat kaydıracı (`sliderToolbarFlightTime`) kaydırıldığında `weatherData.hours` içindeki saat verileri (`item.hour` & zaman dilimi) tam eşleştirilerek rüzgar yön oku (`#dialWindPointer`), rüzgar hızı (`#lblWidgetWindSpeed`) ve güvenlik durumu (`🟢 İdeal / 🟡 Orta / 🔴 Yüksek`) anlık güncellenir.
     * Seçilen uçuş irtifasına ($h$) göre atmosferik rüzgar hız gradyenti ($v(h) = v_{10} \cdot (h/10)^{0.14}$) hesaplanarak irtifa rüzgarı telemetriye yansıtılır.
     * Çevrimdışı veya dosya açma durumlarında (`file:///`) dahili meteorolojik model otomatik devreye girerek pusula kadranlarının her ortamda kesintisiz çalışması güvenceye alınmıştır.
     * Uçuş stüdyosu açıldığında varsayılan olarak güncel tarih ve Türkiye merkez koordinatlarıyla ilk hesaplama otomatik tetiklenir.

46. **Kullanıcı Tanımlı Dinamik Yol Snap Yarıçapı & Akıllı YKN Kontrolü:**
   - Panel 2'deki sabit `300m` statik gösterge kaldırılarak, **`#inputSnapMaxRadius`** ayarlanabilir sayısal girdi kutusuna (20m - 2000m arası serbest parametre) dönüştürülmüştür.
   - Snap onay kutusu (`#chkSnapToRoads`) veya yarıçap kutusu değiştirildiğinde alttaki matris kartları (`#statSnapDistance`) dinamik olarak `Maks 300 m`, `Maks 500 m` veya `Kapalı (Grid)` şeklinde gerçek zamanlı güncellenir.
   - `generateSmartGCPs()` fonksiyonuna bu dinamik değer aktarılarak arazi şartlarına ve yol erişimine göre noktaların yola bağlanma toleransı haritacının tam kontrolüne verilmiştir.

47. **Kusursuz Dengeli Bento Grid & Eşit Yükseklikli (Equal-Height) 3 İş Akışı Paneli:**
   - Harita altındaki 3 kart (`1. Uçuş Alanı & Sınır`, `2. Akıllı YKN & Yol Ağı`, `3. İHA, GSD & Batarya`) CSS Flexbox / Grid stretch mekanizmasıyla dikeyde **tam eşit yüksekliğe (`height: 100%`)** kilitlenmiştir.
   - Her üç panelin tabanına standartlaştırılmış 5 satırlı koyu cam telemetri kutuları (`.flight-summary-box`) yerleştirilerek dikey boşluklar sıfırlanmış ve alt kenar çizgileri (baseline) piksel piksel eşitlenmiştir.
   - Başlık rozetleri (`Douglas-Peucker`, `Üçgenleme + OSM`, `AGL / Overlap`), 4'lü matris çipleri ve girdi aralıkları projenin kompakt tipografi standartlarına kavuşturulmuştur.

48. **Doğal İç Boşluk Düzeni (Natural Gap Flow) & Tam Genişlikte Şık Kaydıraç Konteynerleri:**
   - Kart gövdelerinde elemanları yapay olarak tüm boya yayan `space-between` kaldırılmış; üst kontroller doğal ve sıkı `10px` aralıklarla (`justify-content: flex-start`) üstte toplanırken, taban özet kutuları `margin-top: auto` ile alt kenara sabitlenmiştir.
   - 1. Karttaki sadeleştirme kaydıracı (`#sliderSimplification`) cam çerçeveli şık bir konteyner içerisine alınarak **tam genişlikte (`width: 100%`)** genişletilmiş; 3. Karttaki hat açısı kaydıracı ve derece kutusunun üst çiplere olan dikey nefes alma mesafesi dengelenmiştir.

49. **Kaydıraç İçi Dikey Ritim & Çakışma Önleme (Vertical Rhythm Fix):**
   - `.flight-slider-container` ve `.flight-heading-box` bileşenlerine ferah iç dolgu (`padding: 10px 12px`) ve dikey boşluk (`gap: 6px`) verilmiştir.
   - Kaydıraç çubuğuna (`.flight-slider`) dikey `margin: 6px 0 !important` eklenerek üstteki başlık metinleri ile alttaki kademe etiketleri (`Orijinal Kırıklar`, `Dengeli`, `Maksimum Sade`) arasındaki çakışma ve sıkışma tamamen giderilmiştir.

50. **Harita & Fotogrametri Sektör Terminolojisi ve Yapay Zeka Jargonunun Temizlenmesi:**
   - Yabancı / robotik algoritma isimleri ve yapay zeka klişeleri Türkiye Harita Mühendisliği ve BÖHHBÜY standartlarına dönüştürülmüştür:
     * `Douglas-Peucker` ➔ **`Sınır Sadeleştirme`**
     * `Üçgenleme + OSM` ➔ **`BÖHHBÜY + Yol Ağı`**
     * `AGL / Overlap` ➔ **`Uçuş & Bindirme`**
     * `Orijinal Sınır / Optimize Sınır` ➔ **`Ham Sınır / Sade Sınır`**
     * `Sınır Emniyeti` ➔ **`İç Emniyet Mesafesi`**
     * `Akıllı YKN Üret & Snap` ➔ **`YKN & DN Noktalarını Dağıt`**
     * `Hedef GSD` ➔ **`Yer Örnekleme (GSD)`**
     * `İrtifa (AGL)` ➔ **`Uçuş Yüksekliği (AGL)`**
     * `Optimal / Rüzgar` ➔ **`Uzun Eksen / Rüzgar Yönü`**

51. **Canlı ECMWF / Open-Meteo Meteoroloji Motoru & Kesintisiz Dakika İnterpolasyonu:**
   - **Gerçek Zamanlı Küresel Veri Kaynağı:** Rüzgar, hamle, bulutluluk ve yağış verileri `Open-Meteo` üzerinden Avrupa Orta Vadeli Hava Tahminleri Merkezi (**ECMWF**) ve Alman Meteoroloji Servisi (**DWD ICON**) modelleriyle 24 saatlik periyotta çekilir.
   - **Dakika Seviyesinde Kesintisiz İnterpolasyon (Smooth Interpolation):** Saat kaydıracı (`sliderToolbarFlightTime`) kaydırıldığında artık sabit saat basamaklarında takılı kalınmaz; ardışık iki saat arasındaki rüzgar hızı, hamlesi, 360° dairesel açı sarımlı rüzgar yönü ve güneş azimutu dakika hassasiyetinde lineer olarak enterpole edilir.
   - **İrtifa Gradyenti & Standart Birimler:** Rüzgar hızı $v(h) = v_{10} \cdot (h/10)^{0.14}$ formülüyle uçuş irtifasına indirgenerek hem havacılık standardı olan **m/s** hem de **km/sa** cinsinden (`Örn: 2.4 m/s (8.6 km/sa)`) harita göstergesinde canlı gösterilir.

52. **Harita Üstü Canlı Bulutluluk & Fotogrametrik Işık Kalitesi Göstergesi:**
   - Haritanın sol altındaki kompakt telemetri paneline (`#widgetSolarWindCompass`) **Bulut & Işık Durumu** modülü entegre edilmiştir.
   - ECMWF modelinden çekilen saatlik bulut kapalılık oranı (`%0 - %100`) ve yağış ihtimali dakika bazlı enterpole edilerek anlık olarak güncellenir.
   - Fotogrametri uçuşları için kritik olan ışık kalitesi otomatik sınıflandırılır:
     * `%0 - %25`: 🟢 *Net Güneş Işığı (İdeal)*
     * `%26 - %60`: 🟢 *Dengeli Işık (Uygun)*
     * `%61 - %85`: 🟡 *Değişken Gölge (Dikkat)*
     * `>%85`: ⚪ *Dağınık Difüz Işık*
     * Yağış Riski: 🔴 *Uçuş Güvensiz*

53. **Proje Künyesi (About Modal) UI/UX Sadeleştirmesi:**
   - Künye modalının altındaki mükerrer **"Kapat"** butonu kaldırılmış; sağ üst köşedeki yuvarlak cam kapatma ikonu (`xmark`), `ESC` tuşu ve dış arka plan tıkı yeterli kılınmıştır.
   - Alt telif hakkı metni (`.about-footer-wrap`) estetik ve simetrik olarak ortalanmıştır.

54. **Müstakil Aydınlık Tema Motoru (Dedicated `light.css` Architecture):**
   - Aydınlık tema kodları ana CSS'ten ayrılarak modüler, yüksek performanslı ve tam kapsamlı [web/css/light.css](file:///c:/gnss_pos_studio/web/css/light.css) dosyasına taşınmıştır.
   - Tüm ekranlar (Ana Sayfa Bento Grid, İHA Uçuş Planlama, BÖHHBÜY Çift Okuma, Jeodezi, 2B Helmert, TG-20 Jeoid, Pafta İndeksi, RINEX Muayene, Künye Modalı ve Canlı Konsol Dock) Apple & WCAG AAA kontrast standartlarında aydınlık tema ile donatılmıştır.
   - Harita üzerindeki Güneş/Rüzgar/Bulut telemetri paneli, katman seçici, 3'lü Bento iş akışı kartları ve tablo satırları açık temada pürüzsüz beyaz/buzlu cam estetiğine kavuşturulmuştur.

55. **Tüm Sayfalarda Aydınlık Tema (Light Mode) Kontrast & Uyum Denetimi:**
   - Tarayıcı alt ajanı ile tüm sekmeler taranarak koyu/silik kalan tüm modüller [web/css/light.css](file:///c:/gnss_pos_studio/web/css/light.css) içinde giderilmiştir:
     * **RINEX Muayene:** Sabit/Gezici PPK istasyon kutuları ve kalite yükleme dropzone'u ferah beyaz karta dönüştürüldü.
     * **Koordinat & Helmert:** Sütun eşleştirme paneli, Hızlı Şablon buton hapları ve 2B Helmert parametre kaynak kutuları net okunabilir kılındı.
     * **İHA Uçuş & YKN:** 1. ve 2. Bento kartlarındaki matris çipleri (`#flightSimplificationStats`, `#flightGcpStats`) ve sağ sütun telemetri metinleri açık zemin üzerine koyu kontrastla eşitlendi.
     * **TG-20 Jeoid:** Bölgesel undülasyon kartları (`Ege`, `İç Anadolu`, `Marmara`, `Karadeniz`) açık yeşil/gri pastel zemin ve koyu yeşil zümrüt değerlerle kristal netliğe kavuşturuldu.
     * **Pafta İndeksi:** Harita üstü araç çubuğu açık tema buzlu cam görünümüne uyarlandı.
     * **Kullanım Rehberi:** Silik gri kalan tüm açıklama metinleri, başlıklar ve liste maddeleri yüksek kontrastlı koyu arduvaz tonuna (`#334155`) çekildi.

56. **RINEX Studio Tekil Ana Kart (Unified Master Card) Mimarisi:**
   - Pafta İndeksi modülündeki (`#tab-map`) bütüncül ve derli toplu kart mimarisi referans alınarak, RINEX Studio'daki (`#tab-rinex-studio`) dağınık duran bağımsız kartlar tek bir ana `.card` çatısı altında toplanmıştır.
   - Üst kısma tekil `card-header` (Başlık ve "Çoklu İstasyon", "Frekans Ayıklama", "RINEX 2/3/4" rozetleri) entegre edilmiştir.
   - Sürükle-bırak yükleme alanı (`.rinex-dropzone-panel`) ve Filtreleme & Çıktı ayarları (`.rinex-config-panel`) yan yana iki sütunlu ızgara içinde uyumlu alt panellere dönüştürülmüştür.
   - Sabit/Gezici PPK Analizörü ve GNSS Kalite Muayene modülü (`.rinex-sub-card`) ana kart içinde kesintisiz, akıcı ve yüksek kontrastlı alt bölümler olarak konumlandırılmıştır.

57. **RTK & Ham Data Tekil Ana Kart (Unified Master Card) Mimarisi:**
   - Pafta İndeksi ve RINEX Studio tasarım standardına uygun olarak, RTK & Ham Data (`#tab-cadastre`) modülündeki bağımsız kart blokları tek bir kapsayıcı `.card` çatısı altında toplanmıştır.
   - Üst kısma tekil `card-header` (*"RTK & GNSS Ham Veri Çözümleme Stüdyosu"* ve *"⚡ TUSAGA-Aktif & BÖHHBÜY"*, *"🇹🇷 TG-20 Jeoidi"*, *"📐 Netcad .NCN & DXF"* rozetleri) entegre edilmiştir.
   - Yükleme & parametre kutusu (`.cadastre-config-panel`), alt sekme araç çubuğu (`.subtabs-bar`), ölçüm tabloları (`.cadastre-table-panel`) ve alt durum çubuğu (`.status-bar-footer`) tek parça, bütüncül ve modern bir düzene kavuşturulmuştur.

58. **RTK Alt Sekme Geçişleri & BÖHHBÜY Standart Terminoloji Güncellemesi:**
   - **Sekme Geçiş Kilidi Çözümü:** `d-none` sınıfının doğrudan CSS `display: none !important;` çakışması yapması engellenerek, `.subtab-content` ve `.subtab-content.active` tabanlı modern ve akıcı sekme geçişi sağlandı. Çift Okuma, Koordinat Formatları ve Harita ekranları 1 tıkla anında açılacak şekilde optimize edildi.
   - **Harita & Koordinat Canlılığı:** Harita sekmesine tıklandığında Leaflet `invalidateSize()` ve Koordinat sekmesine tıklandığında format çıktılarının otomatik yenilenmesi güvenceye alındı.
   - **Doğal Sektörel İsimlendirme:** Sekme isimlerindeki İngilizce/karma ifadeler kaldırılarak BÖHHBÜY / TKGM jeodezik standartlarına uygun Türkçe terminolojiye kavuşturuldu:
     * *1. Sekme:* `🛰️ RTK Ham Ölçüm Tablosu`
     * *2. Sekme:* `📋 Çift Okuma & Karne` (BÖHHBÜY Madde 28)
     * *3. Sekme:* `📐 Koordinat Formatları & Aktarım`
     * *4. Sekme:* `🗺️ Harita & Nokta Dağılımı`

59. **PPK Oturum & Baz Analizi Terminoloji Düzeltmesi:**
   - RINEX Studio içerisindeki PPK rozeti, işlem mantığına (ölçüm/uçuş sonrası sabit-gezici oturum kesişimi ve baz uzunluğu hesaplama) tam uygun olarak **`🛰️ PPK Oturum & Baz Analizi`** olarak güncellendi.

60. **Fosforlu Cam Göbeği (Cyan Specular Glow) Kart Başlığı Alt Çizgisi:**
   - Tüm ana kart başlıklarının (`.card-header`) ve alt panel başlıklarının (`.border-bottom-glass`) altına projenin imza tasarım dili olan neon/fosforlu cam göbeği mavi alt sınır uygulandı.

61. **Uca Kadar Kesintisiz Uzanan İnce & Sivri İğne Neon Çizgisi (Full-Span 1.5px Needle-Pointed Divider):**
   - Kart başlıkları (`.card-header`) altındaki ayırıcı çizgi, en sol sınırdan (`%0`) en sağ sınıra (`%100`) kadar kesintisiz uzatıldı; genişliğin `%94`'lük ana gövdesinde `1.5px` kalınlıkta ve belirgin fosforlu cam göbeği renkte kalacak, sadece dış `%3`'lük uçlarda sivri iğne ucuna inecek şekilde optimize edildi.

62. **Aydınlık Tema (Light Mode) Kapsamlı Derinlik, Gölge & Kontrast Revizyonu:**
   - **Belirgin Kart Sınırları & Çok Katmanlı Gölgeler:** Tüm ana ve alt kartlara (`.card`, `.bento-card`, `.flight-workflow-card`, `.cadastre-config-panel`, `.rinex-config-panel`, `.helmert-section-card`, `.tg20-stat-card`, `.docs-card`, `.about-modal-card`) net ve kaliteli gri/mavi sınır (`border: 1px solid #cbd5e1`) ve modern Apple/Stripe tarzı derinlik gölgeleri (`box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.08)`) uygulandı. Hover durumunda kartlar yukarı kalkış (`transform: translateY(-2px)`) ve mavi ışıltılı sınır efekti kazandı.
   - **Yüksek Kontrastlı Yükleme Alanları (Dropzones):** Sönük/soluk gri çizgiler yerine canlı gök mavisi kesikli sınırlar (`border: 2px dashed #60a5fa`) ve iç derinlik gölgeleri eklendi.
   - **Karanlık Mod Kalıntılarının Temizliği:** Koordinat dönüşümündeki sütun eşleştirme kutuları (`.geodesy-panel-box`, `.col-select-glass`), Bursa-Wolf parametre alanları (`.bursa-details-box`, `.bursa-param-input`), RTK alt durum çubuğu (`.status-bar-footer`), kod editörleri (`.code-editor-textarea`), harita kanvasları (`.cadastre-map-canvas`), TG-20 formül ve sonuç panelleri ve Leaflet harita kontrolleri aydınlık tema ile %100 uyumlu ve yüksek kontrastlı hale getirildi.

63. **RW5 Gerçek GNSS Projeksiyon Senkronizasyonu & Ondalık (Decimal) Enlem/Boylam Gösterimi:**
   - **Gerçek Uydu Koordinatlarından (LA/LN) Kesin TM 3° Projeksiyon Hesabı:** Saha kontrol ünitelerinden (SurvCE, SurvStar, LandStar, GeoSurv vb.) gelen .rw5 ve .raw dosyalarında yer alan ham WGS-84/ITRF-96 uydu koordinatları (LA, LN), saha başlığındaki tanımlı dilim orta meridyeni (--User Defined: ... TM 27 / CM 27E) veya otomatik boylam hesabı (DOM 27°, 30°, 33°) ile tam Gauss-Krüger / Transverse Mercator formülleri (orwardTM) üzerinden doğrudan hesaplandı. Böylece sahadaki lokal baz kayıklıkları veya farklı grid ofsetleri elenerek noktaların harita, Google Earth (KML) ve Netcad'de tam doğru jeodezik konumlarına oturması sağlandı.
   - **Ondalık Derece Gösterimi (Decimal Degrees):** RTK Ham Ölçüm Tablosu ve CSV dışa aktarımlarındaki enlem ve boylam sütunları derece-dakika-saniye (DMS) yerine, harita mühendisliği veri işleme standartlarına uygun olarak 8 basamaklı hassas ondalık formatta (37.18449140°, 28.10234350°) görüntülenecek şekilde güncellendi.
   - **Harita & KML Tam Entegrasyonu:** Analiz tamamlandığında Leaflet haritasının (plotCadastrePointsOnMap) anında güncellenip sahadaki gerçek noktalara odaklanması (fit bounds) ve KML dışa aktarımlarının 3B hassas GNSS koordinatları ile üretilmesi güvenceye alındı.
