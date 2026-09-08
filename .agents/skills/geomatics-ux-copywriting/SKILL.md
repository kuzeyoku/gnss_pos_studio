---
name: geomatics-ux-copywriting
description: >-
  Türkiye Harita, Jeodezi ve Kadastro Mühendisliği sektör dili, BÖHHBÜY / TKGM standart terminolojisi,
  doğal insan dili (Humanized UX Writing) ve yapay zeka jargonu temizleme kılavuzu.
---

# Geomatics UX Copywriting & Humanized Engineering Language Skill

Bu beceri, web uygulamasındaki tüm metinlerin, başlıkların, hata mesajlarının, buton etiketlerinin ve rapor açıklamalarının **yapay zeka klişelerinden arındırılmasını** ve Türkiye'deki Harita Mühendisleri, Kadastro Teknisyenleri ve LİHKAB bürolarının kullandığı **öz, net, profesyonel ve doğal sektör diline** dönüştürülmesini sağlar.

---

## 🚫 1. Temizlenecek Yapay Zeka Klişeleri ve Karşılıkları

| ❌ Yapay Zeka / Robotik Klişe | ✅ Doğal Harita & Mühendislik Dili |
| :--- | :--- |
| *Cybernetic Toast Notification Engine* | *Sistem Bildirimi* |
| *Workstation Pro / Master İstasyonu* | *Harita & Kadastro Araçları* |
| *TG-20 İndirgeme Merkezi & Sihirli Dönüştürücü* | *TG-20 Jeoit Kot İndirgeme (H = h - N)* |
| *Unified RTK & Detail Master Table* | *RTK Ölçüm Tablosu* |
| *Zaman Aralığı Kesme, Uydu & Frekans Ayıklama Merkezi* | *RINEX Birleştirme, Kesme & Seyreltme* |
| *Motor: Hazır (Web Worker)* | *Sistem Hazır* |
| *Verileriniz yerel RAM'de işlenir (Sıfır Sunucu Yükü)* | *Veriler tarayıcınızda yerel olarak işlenir* |
| *Yazdırılabilir kadastro raporu pencerede açıldı* | *Rapor yazdırma penceresi açıldı.* |
| *Bu veri setinde çift okuma bulunmadığı için...* | *Dosyada çift okuma bulunamadı.* |
| *Başarıyla indirgendi ve çözüldü!* | *TG-20 kotları hesaplandı.* |

---

## 📐 2. Harita & Kadastro Mühendisliği Terminoloji Sözlüğü

1. **Koordinat & Projeksiyon:**
   - $Y$: **Sağa Değer** (Doğu / Easting)
   - $X$: **Yukarı Değer** (Kuzey / Northing)
   - $h$: **Elipsoit Yüksekliği / Kotu** (GRS-80 / WGS-84)
   - $N$: **Jeoit Yüksekliği / Undülasyonu** (HGM TG-20)
   - $H$: **Ortometrik Kot / Nivelman Kotu** (TUDKA-99, $H = h - N$)
   - **Projeksiyon:** *ITRF-96 / TUREF TM 3°* veya *ED-50 TM 3°*
   - **DOM:** *Dilim Orta Meridyeni* ($27^\circ, 30^\circ, 33^\circ, 36^\circ, 39^\circ, 42^\circ, 45^\circ$)

2. **Kadastro & Çift Okuma (BÖHHBÜY / TKGM Standartları):**
   - **Çift Okuma:** TUSAGA-Aktif (CORS-TR) ile en az 1 saat ($60\text{ dk}$) arayla yapılan iki bağımsız RTK ölçüsü.
   - **Hata Sınırı / Tolerans:**
     - $\Delta Y \le 7\text{ cm}$, $\Delta X \le 7\text{ cm}$, $\Delta S_{2B} = \sqrt{\Delta Y^2 + \Delta X^2} \le 7\text{ cm}$
     - $\Delta H \le 10\text{ cm}$
   - **Durum İfadeleri:** *UYGUN (≤ 7cm)*, *LİMİT AŞILDI (> 7cm)*, *Tekil Ölçü (2. Okuma Yok)*.

3. **Çıktı & Format İsimlendirmeleri:**
   - *Netcad Nokta Dosyası (.ncn)*
   - *AutoCAD Çizimi (.dxf)*
   - *Google Earth KML (.kml)*
   - *Excel Koordinat Çetelesi (.csv)*
   - *Resmi Kadastro Çift Okuma Çetelesi (PDF)*
   - *TG-20 Jeoit Kot İndirgeme Raporu (PDF)*

4. **RINEX & GNSS Terimleri:**
   - *Gözlem Dosyası (.obs, .YYo, .rnx)*
   - *Navigasyon / Seyir Dosyası (.nav, .YYn, .YYg, .YYp)*
   - *Hatanaka Sıkıştırılmış Gözlem (.YYd, .crx)*
   - *Kayıt Aralığı (Örnekleme / Decimation)*
   - *Uydu Sistemleri (GPS, GLONASS, Galileo, BeiDou)*

---

## ✍️ 3. UX Yazım & İletişim İlkeleri (Tone of Voice)

1. **Sade ve Doğrudan Olun:** Uzun cümleler kurmayın. Harita mühendisi butona bastığında sonucun ne olduğunu tek bakışta anlamalıdır.
2. **Kişiselleştirilmiş / İnsani Uyarılar:**
   - ❌ *"⚠️ Bu veri setinde çift okuma bulunmadığı için Kadastro Çift Okuma Çetelesi pasiftir."*
   - ✅ *"Bu dosyada mükerrer (çift) okuma bulunamadı. Noktalar tekil olarak RTK sekmesinde listelendi."*
3. **Mühendislik Güveni:**
   - Raporlarda ve hesaplama özetlerinde gereksiz abartı yerine matematiksel kesinlik ve standart formüller gösterilmelidir ($H = h - N$, $m_0$, $dS$).
