# Türkiye Harita Pafta Bölümleme Sistemi

## 1. Genel Mantık

Bir bölgenin haritası tek bir baskı/çizim alanına sığmadığında, alan standart parçalara (**pafta**) bölünür. Bu bölümleme ve adlandırma kuralına **pafta bölümlemesi (pafta indeksi)** denir.

Temel ilke:
- Pafta boyutları **enlem/boylam farkı** olarak küresel yüzeyde sabittir.
- Aynı pafta, düzlem (projeksiyon) üzerinde konuma göre farklı fiziksel boyutta görünebilir.
- Ölçek sınırına göre iki ayrı sistem uygulanır:
  - **1:1.000.000 – 1:250.000 arası** → **Uluslararası Sistem**
  - **1:250.000'den büyük ölçekler** (1:100.000, 1:50.000, 1:25.000, 1:5.000 vb.) → **Ulusal Sistem**

---

## 2. Uluslararası Sistem (1/1.000.000 – 1/250.000)

Başlangıç: Ekvator (enlem) ve Greenwich meridyeni (boylam).

| Ölçek | Boyut (enlem x boylam) | Adlandırma |
|---|---|---|
| 1/1.000.000 | 4° x 6° | Kuşak harfi + dilim no |
| 1/500.000 | 2° x 3° | En büyük yerleşim adı |
| 1/250.000 | 1° x 1°30' | En büyük il/ilçe adı |

**Türkiye özel durumu (1/250.000):** Orta boylamı 27° olan 1. dilimin doğu ve batısında **1°30'** genişlik, tam derece enlemler arasında **1°** yükseklikte paftalar oluşur. Pafta, içinde kalan en büyük il/ilçe adıyla anılır (örn. *Trabzon*, *Erzurum*).

---

## 3. Ulusal Sistem: 1/100.000'den 1/25.000'e

### 3.1. 1/100.000 Ölçekli Paftalar

1/250.000'lik paftanın:
- **1°30'lık (boylam) kenarı → 3 eşit parçaya**
- **1°'lik (enlem) kenarı → 2 eşit parçaya**

bölünerek **6 adet** 1/100.000 ölçekli pafta elde edilir (her biri **30' x 30'**).

Türkiye'nin tamamı için bağımsız bir kuşak/dilim ağı da tanımlıdır:
- **Enlem kuşakları:** 44° kuzeyden başlanarak güneye doğru **30' aralıklarla**, alfabetik harflerle (A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, R... — **Ç, Ğ, İ, Ö, Ş harfleri kullanılmaz**).
- **Boylam dilimleri:** 24° doğu boylamından başlanarak doğuya doğru **30' aralıklarla**, **12'den başlayan** sıra numaralarıyla.

**Formül (yaklaşık):**
```
Kuşak harfi indeksi = floor[(44° - enlem) / 30']  → A'dan başlayarak sırayla (atlanan harfler hariç)
Dilim numarası      = 12 + floor[(boylam - 24°) / 30']
```
Pafta adı: **[Kuşak Harfi][Dilim No]** → örn. **J28**, **K29**, **G42**.

> Örnek: Trabzon 1/250.000 paftasının sol üst köşesindeki 1/100.000 pafta **G42** olarak adlandırılır.

Alan: yaklaşık **50 km çevre**, ≈ **1650 km²** (30' x 30').

### 3.2. 1/50.000 Ölçekli Paftalar

1/100.000 paftası **kuzeybatıdan başlayarak saat yönünde** 4 eşit parçaya (2x2, her biri **15' x 15'**) bölünür ve küçük harflerle adlandırılır:

```
a | b
-----
c | d
```

Pafta adı: **[100k adı]-[harf]** → örn. **J28-b**

### 3.3. 1/25.000 Ölçekli Paftalar

1/50.000 paftası aynı mantıkla (kuzeybatıdan saat yönünde) 4 eşit parçaya (**7'30" x 7'30"**) bölünür ve **1, 2, 3, 4** rakamlarıyla adlandırılır:

```
1 | 2
-----
3 | 4
```

Pafta adı: **[100k adı]-[50k harfi][25k no]** → örn. **J28-b4** veya boşluksuz **J28b4**

Alan: 1/25.000 paftası ≈ **150 km² (15.000 ha)**, çevresi ≈ **50 km**.

### 3.4. Özet Tablo — Ulusal Sistem Bölümleme Zinciri

| Ölçek | Elde Edildiği Pafta | Bölüm Sayısı | Boyut | Ek Kod |
|---|---|---|---|---|
| 1/250.000 | — | — | 1° x 1°30' | İl/ilçe adı |
| 1/100.000 | 1/250.000 | 6 (3x2) | 30' x 30' | Harf+Sayı (örn. J28) |
| 1/50.000 | 1/100.000 | 4 (2x2) | 15' x 15' | a, b, c, d |
| 1/25.000 | 1/50.000 | 4 (2x2) | 7'30" x 7'30" | 1, 2, 3, 4 |

---

## 4. Büyük Ölçekli Paftalar (1/5.000 ve Sonrası — Standart Topoğrafik Harita Sistemi)

1/5.000 ölçekli **"Standart Topoğrafik Harita"**, ülke pafta bölümleme sisteminin temel (esas) paftası kabul edilir. Kadastroya uygulandığında **"Standart Topoğrafik Kadastral Harita"** adını alır.

Bölümleme, pafta kenarlarının art arda **ikiye bölünmesiyle 4'e ayrılması** mantığıyla ilerler:

| Ölçek | Elde Edildiği Pafta | Bölüm Sayısı | Adlandırma Eki |
|---|---|---|---|
| 1/2.000 | 1/5.000 | 4 | I, II, III, IV (bazı yönetmeliklerde) |
| 1/1.000 | 1/2.000 | 4 | Sayı/harf (yönetmeliğe göre değişir) |
| 1/500 | 1/1.000 | 4 | Sayı/harf |

> Not: Kadastroda tarihsel olarak birden fazla yönetmelik (1/2.500 Ölçekli Haritalar Yönetmeliği, Büyük Ölçekli Haritaların Yapım Yönetmeliği vb.) farklı alt bölümleme ve harf/rakam kuralları kullanmıştır. Örneğin bir yönteme göre 1/2.500 paftalar, 1/5.000 paftanın 4 eşit parçaya bölünüp sol üst köşeden saat yönünde **A, B, C, D** harfi verilmesiyle elde edilir (örn. **102N-IVC**); 1/2.000 paftalar ise 1/10.000 paftanın **25 eşit parçaya** bölünmesiyle (10–25 arası numaralarla) oluşturulur. Uygulamada kullanılan yönetmelik/kurum esas alınmalıdır.

**Koordinata dayalı adlandırma (1/5.000 temel pafta, imar/kadastro yönetmeliği):**
```
Pafta No = floor(Y_güneybatı / 1000) ve floor(X_güneybatı / 1000)
```
Paftanın güneybatı köşe koordinatları 1000'e bölünüp art arda yazılarak pafta numarası elde edilir. Pafta boyutu arazide **3 km x 4 km**'dir (çizimde 60 cm x 80 cm).

---

## 5. Tüm Sistemin Formülize Akışı

```
1/1.000.000  (4° x 6°)
      │  ÷ (kuşak/dilim, uluslararası)
1/500.000    (2° x 3°)
      │
1/250.000    (1° x 1°30')
      │  ÷3 (boylamda) x ÷2 (enlemde) = 6 parça
1/100.000    (30' x 30')      → Kod: Harf+Sayı (örn. J28)
      │  ÷2x2 = 4 parça, saat yönü, a-d
1/50.000     (15' x 15')      → Kod: J28-b
      │  ÷2x2 = 4 parça, saat yönü, 1-4
1/25.000     (7'30" x 7'30")  → Kod: J28-b4
      │  (bu noktadan sonra ulusal büyük ölçek yönetmelikleri devreye girer)
1/5.000      (1'30" x 1'30")  → "Standart Topoğrafik Harita" (temel pafta)
      │  ÷2 kenar = 4 parça (1, 2, 3, 4)
1/2.000      (45" x 45")
      │  ÷2 kenar = 4 parça (a, b, c, d)
1/1.000      (22.5" x 22.5")
      │  ÷2 kenar = 4 parça (1, 2, 3, 4)
1/500        (11.25" x 11.25")
```

---

## 6. Pratik Örnek Doğrulama

- **J28-b4** paftası:
  - 1/50.000 karşılığı: **J28-b**
  - 1/100.000 karşılığı: **J28**
  - 1/250.000 karşılığı: J28'in içinde bulunduğu 1°x1°30' pafta (bölgeye göre il/ilçe adı)

- 1 adet 1/100.000 pafta içinde:
  - **4** adet 1/50.000 pafta
  - **16** adet 1/25.000 pafta (4x4) bulunur.

- 1 adet 1/250.000 pafta içinde **6** adet 1/100.000 pafta bulunur (3 doğu-batı x 2 kuzey-güney).

---

## Kaynaklar
- HKMO (Harita ve Kadastro Mühendisleri Odası) — Pafta Bölümlendirilmesi dokümanı
- Harita Genel Müdürlüğü (HGM) — 1/100.000 ve 1/25.000 pafta indeksleri
- Coğrafya.gen.tr — Pafta Hakkında Bilgi
- ATAY Mühendislik — "Pafta Nedir?" blog yazısı
- OMÜ Coğrafya Bölümü — Kartografya ders notları
- Tekharita — Pafta Bölümlendirmesi Nasıl Yapılır
- Kürşat Özcan — Türkiye Pafta Bölümlemesi (uygulama örnekleri)

*Not: Büyük ölçekli (1/5.000 altı) bölümlemede yönetmelikler arasında farklılıklar bulunur; proje bazlı çalışmada güncel BÖHHBÜY (Büyük Ölçekli Harita ve Harita Bilgileri Üretim Yönetmeliği) veya ilgili kurumun (HGM/TKGM) mevcut versiyonu esas alınmalıdır.*
