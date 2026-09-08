# İHA Canlı Telemetri & Drone Tracking Entegrasyon Tasarımı

**Hedef:** PySide6 / MQTT tabanlı İHA yer kontrol ve telemetri akışının GNSS Pos Web Studio `flightTab` modülüne WebSocket köprüsüyle aktarılması ve mevcut Leaflet harita altyapısıyla görselleştirilmesi.

---

## 1. Mimari Genel Bakış

```
[İHA / Drone Otopilot (MAVLink)]
          │
          ▼ (Radio / 4G / 5G)
[PySide6 Desktop / GCS Servisi]
          │ (MQTT Broker - topics: drone/telemetry, drone/status)
          ▼
[Local WebSocket Köprüsü (ws://localhost:8089/drone-telemetry)]
          │
          ▼ (JSON Push Stream)
[GNSS Pos Web Studio - flightTab.js (Leaflet Canvas)]
```

---

## 2. Telemetri Veri Kontratı (WebSocket Mesajı)

```json
{
  "type": "TELEMETRY_UPDATE",
  "droneId": "DRONE-CHC-P330",
  "timestamp": 1788850000000,
  "position": {
    "lat": 39.933452,
    "lon": 32.859781,
    "altRelM": 120.5,
    "altAbsM": 1071.0,
    "headingDeg": 185.4
  },
  "attitude": {
    "rollDeg": 1.2,
    "pitchDeg": -3.4,
    "yawDeg": 185.4
  },
  "speed": {
    "groundSpeedMs": 14.2,
    "verticalSpeedMs": 0.1
  },
  "system": {
    "batteryPercent": 84,
    "voltageV": 22.8,
    "satellites": 29,
    "fixType": "RTK_FIXED",
    "linkQualityPercent": 98
  },
  "mission": {
    "currentWaypoint": 14,
    "totalWaypoints": 42,
    "etaMinutes": 18.5,
    "distanceTraveledM": 3240
  }
}
```

---

## 3. Web Studio `flightTab` Harita Entegrasyonu

1. **Leaflet Rotasyonlu İkon Katmanı:**
   - `L.marker([lat, lon], { icon: droneRotatedIcon, rotationAngle: headingDeg })`
   - Uçuş yolu izi için `L.polyline([], { color: '#38bdf8', weight: 3, dashArray: '4, 4' })`

2. **Canlı Telemetri Gösterge Paneli (HUD / Dials):**
   - Rüzgar / Solar panelleri canlı telemetri verisiyle dinamik güncellenir.
   - İrtifa, yer hızı ve batarya seviyeleri gerçek zamanlı animasyonla akar.

3. **Çevrimdışı Güvenlik:**
   - WebSocket bağlantısı koptuğunda UI "Çevrimdışı / Simülasyon Modu"na otomatik geçer, hata fırlatmaz.
