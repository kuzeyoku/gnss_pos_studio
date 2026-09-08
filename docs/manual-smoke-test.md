# Manuel Duman Testi (Smoke Test) Checklist

> Her faz sonunda bu listeyi baştan sona geçerek regresyon olup olmadığını doğrulayın.  
> ✅ Geçti | ❌ Başarısız | ⏭️ Atlandı  
> **Test Matrisi:** 10 sekme × 2 tema (dark / light) × 2 genişlik (masaüstü / mobil ≤ 768px)

---

## Genel Uygulama Kontrolleri

- [ ] `node scripts/bundle.js` hatasız tamamlanıyor (`core.css` + `app.bundle.js` + `componentCache.js` üretildi)
- [ ] `node scripts/server.js` ile `http://localhost:8088` açılıyor
- [ ] Konsolda (F12) JavaScript hatası yok
- [ ] Sidebar navigasyonu çalışıyor: 10 sekme arası geçiş sorunsuz
- [ ] Karanlık / Aydınlık tema değişimi düzgün (header'daki toggle)
- [ ] Mobil görünüm: hamburger menü açılıyor ve sekmeler arasında geçiş yapılabiliyor

---

## 1. Ana Sayfa (homeTab)

- [ ] Hoş geldiniz kartları ve animasyonlar render ediliyor
- [ ] İstatistik sayaçları (araç sayısı, hesaplama modülü vb.) görünüyor
- [ ] Dosya sürükle-bırak alanı çalışıyor (örnek dosya bırakıldığında doğru sekmeye yönlendirme)
- [ ] Tüm butonlar ve navigasyon bağlantıları çalışıyor

---

## 2. Kadastro / RTK Stüdyosu (cadastreTab)

- [ ] RW5 / RAW / CSV / JXL dosya yükleme çalışıyor (test dosyası: örnek `.rw5`)
- [ ] Nokta tablosu doğru dolduruluyor (nokta adı, Y, X, h, HRMS, PDOP, epoch, tarih/saat)
- [ ] Çift okuma analizi (BÖHHBÜY Madde 28) çalışıyor ve sonuçlar tabloya yansıyor
- [ ] RTK Telemetri Bento KPI kartları (toplam nokta, HRMS, PDOP, çözüm tipi) görünüyor
- [ ] TG-20 jeoit indirgemesi çalışıyor (H = h - N hesabı doğru)
- [ ] Harita görünümü açılıyor, noktalar haritada gösteriliyor
- [ ] Export butonları: DXF ✅ | NCN ✅ | KML ✅ | CSV ✅ | Kadastro Karnesi ✅ | TG-20 Raporu ✅
- [ ] Export dosyaları gerçekten indiriliyor (tarayıcı download)

---

## 3. RINEX Stüdyosu (rinexTab)

- [ ] RINEX 2/3/4 gözlem dosyası yükleme çalışıyor
- [ ] Header bilgileri doğru ayrıştırılıp gösteriliyor (istasyon, anten, alıcı, versiyon)
- [ ] Navigasyon dosyası eşleştirme çalışıyor
- [ ] PPK zaman çakışma analizi sonucu görünüyor (overlap süresi, baz mesafesi)
- [ ] Kalite analizi grafiği (uydu sayısı/epoch) çalışıyor
- [ ] Birleştirme ve zaman kesimi başarılı (çıktı dosyası indiriliyor)

---

## 4. Pafta Haritası (mapTab)

- [ ] Leaflet harita render ediliyor (tile'lar yükleniyor)
- [ ] Pafta grid overlay'i çalışıyor (1/100K, 1/50K, 1/25K, vb.)
- [ ] Nokta arama ve tıklama ile pafta bilgisi gösteriliyor
- [ ] Ölçek seçimi pafta grid'ini güncelliyor
- [ ] Pafta export (DXF / NCN / KML / GeoJSON) çalışıyor

---

## 5. Jeodezik Dönüşüm Stüdyosu (geodesyTab)

- [ ] Koordinat dönüşüm paneli: EPSG seçimi çalışıyor
- [ ] Tekli koordinat dönüşümü doğru çalışıyor (örnek: TUREF TM30 → WGS84)
- [ ] Toplu dönüşüm (batch) çalışıyor (metin kutusu yapıştır / dosya yükle)
- [ ] 2B Helmert düzlem dönüşümü çalışıyor (kontrol noktaları girişi + çözüm)
- [ ] .DNS dosya yükleme ve export çalışıyor
- [ ] Vincenty mesafe/azimut hesabı çalışıyor (Kart 4 - Panel 1)
- [ ] Vincenty düz jeodezi hesabı çalışıyor (Kart 4 - Panel 2)
- [ ] Gauss alan hesabı çalışıyor (Kart 4 - Panel 3)

---

## 6. TG-20 Jeoit Stüdyosu (tg20Tab)

- [ ] TG-20 jeoit modeli yükleniyor (JSON veya GGF)
- [ ] Tekli nokta sorgulama: enlem/boylam girişi → N ondülasyon değeri görünüyor
- [ ] Enterpolasyon detayları (4 grid düğümü, ağırlıklar) gösteriliyor
- [ ] Harita üzerinde tıklama ile sorgulama çalışıyor
- [ ] Toplu indirgeme: dosya/metin yükleme → rapor tablosu dolduruluyor
- [ ] TG-20 rapor export (yazdırılabilir HTML) çalışıyor

---

## 7. Uçuş Planlama Stüdyosu (flightTab)

- [ ] Poligon dosyası (KML/GeoJSON) yükleme çalışıyor
- [ ] Alan/çevre hesabı ve harita üzerinde poligon gösterimi çalışıyor
- [ ] Drone ve kamera seçimi çalışıyor
- [ ] GSD, irtifa, hat sayısı, fotoğraf sayısı hesabı çalışıyor
- [ ] Fotogrametri grid (uçuş hatları) harita üzerinde çiziliyor
- [ ] Akıllı YKN (GCP) üretimi çalışıyor
- [ ] Güneş yörüngesi ve hava durumu sorgusu çalışıyor
- [ ] Export: Uçuş KML ✅ | GCP DXF ✅ | GCP NCN ✅ | GCP CSV ✅ | GCP KML ✅

---

## 8. Evrensel Format Dönüştürücü (converterTab)

- [ ] Desteklenen formatlarda dosya yükleme: DXF ✅ | KML ✅ | KMZ ✅ | GPX ✅ | NCN ✅ | NCZ ✅ | CSV ✅ | GeoJSON ✅
- [ ] Yüklenen verilerin harita ve tablo görünümü çalışıyor
- [ ] Projeksiyon dönüşümü (TUREF TM ⇄ WGS84) çalışıyor
- [ ] Noktalardan poligon üretimi çalışıyor
- [ ] Export butonları: DXF ✅ | KML ✅ | KMZ ✅ | NCN ✅ | GPX ✅ | GeoJSON ✅ | CSV ✅

---

## 9. Hesaplama Araçları (toolsTab)

- [ ] Araç kartları render ediliyor
- [ ] Mevcut araçlar sorunsuz çalışıyor (arayüz açılıyor, hesaplama sonuçları doğru)
- [ ] Sonuçlar tabloya / ekrana düzgün yansıyor

---

## 10. Kılavuz (guideTab)

- [ ] Kılavuz içeriği tam render ediliyor
- [ ] Arama/filtre çalışıyor
- [ ] Tablo ve formül blokları okunabilir görünüyor
- [ ] Bölümler arası navigasyon çalışıyor (anchor bağlantıları)

---

## Çapraz Kontroller

- [ ] Tema (dark → light → dark) değişiminde hiçbir sekme bozulmuyor
- [ ] Mobil (≤ 768px) genişlikte sidebar/tab'lar düzgün görünüyor
- [ ] `index.html` açılışında favicon ve sayfa başlığı düzgün
- [ ] Herhangi bir CDN bağımlılığı hala var mı? (Network tab'ında harici istekler kontrol edilmeli — Google Fonts hariç)
