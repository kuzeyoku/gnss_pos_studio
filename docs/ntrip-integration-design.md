# NTRIP Auto-Router Entegrasyon Tasarım Dokümanı

**Hedef:** NTRIP Auto-Router arka plan servisinin bağlantı, mountpoint ve düzeltme verisi telemetrisini GNSS Pos Web Studio Kadastro/RTK raporlarına ve canlı durum çubuğuna entegre etmek.

---

## 1. Arka Plan & Gereksinim
GNSS RTK ölçümlerinde CORS / TUSAGA-Aktif istasyonlarından alınan düzeltme verilerinin kalitesi, BÖHHBÜY Madde 28 ve TKGM standartları uyarınca resmi raporlarda belgelenmelidir:
- Kullanılan CORS Ağı / Mountpoint Adı (örn. `VRST_CMR`, `VRST_RTCM32`, `ISTANBUL_RTCM3`)
- Bağlantı Süresi, Gecikme (Age of Corrections / Latency < 2.0s)
- Çözüm Tipi (Fixed / Float / DGPS)
- Veri Bütünlüğü (RTCM Mesaj Tipleri: 1004, 1006, 1008, 1077, 1087, 1127)

---

## 2. Veri Değişim Formatı (JSON Kontratı)

NTRIP Router servisinden Web Studio'ya aktarılacak standart JSON log yapısı:

```json
{
  "version": "1.0",
  "sessionId": "ntrip-sess-20260908-01",
  "caster": {
    "host": "cors.harita.gov.tr",
    "port": 2101,
    "mountpoint": "VRST_RTCM32",
    "format": "RTCM 3.2 MSM5"
  },
  "client": {
    "id": "ROVER_CHC_01",
    "connectedAt": "2026-09-08T08:30:15Z",
    "durationSec": 3600,
    "bytesReceived": 1452800
  },
  "metrics": {
    "avgLatencyMs": 320,
    "maxLatencyMs": 1150,
    "packetLossPercent": 0.02,
    "rtcmMessages": ["1006", "1077", "1087", "1127", "1019"]
  },
  "epochs": [
    {
      "time": "2026-09-08T08:30:16Z",
      "lat": 39.933412,
      "lon": 32.859745,
      "h": 950.45,
      "status": "FIXED",
      "sats": 28,
      "pdop": 1.2,
      "correctionAge": 0.8
    }
  ]
}
```

---

## 3. Web Studio Arayüz Entegrasyonu

1. **Cadastre & RTK Karne Raporuna Alan Eklenmesi:**
   - `reports/cadastre-karne.html` şablonuna `CORS / NTRIP Mountpoint Bilgisi` tablosu eklenir.
   - Her nokta ölçüm anındaki referans istasyonu ve düzeltme gecikmesi karnede gösterilir.

2. **Canlı Durum Rozeti (Shell Header):**
   - Üst bilgi çubuğuna `NTRIP: ACTIVE (VRST_RTCM32 • 0.8s)` durum çipi yerleştirilir.

3. **İletişim Kanalı:**
   - İstemci tarafında `BroadcastChannel("ntrip-channel")` veya `WebTransport / Local WebSocket (ws://localhost:8090/ntrip)` köprüsü.
