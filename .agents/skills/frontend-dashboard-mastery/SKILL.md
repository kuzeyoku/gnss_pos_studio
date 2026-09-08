---
name: frontend-dashboard-mastery
description: >-
  Best practices for building high-performance scientific, geodetic, and GIS dashboards with
  sticky data tables, Leaflet multi-layer maps, metric stat cards, and real-time computation logs.
---

# High-Performance Dashboard & GIS Engineering Skill

This skill guides the design and implementation of professional data dashboards, telemetry displays, and geospatial workstations.

---

## 📊 1. High-Density Data Tables

### Rules for Surveying / Scientific Data:
1. **Sticky Header (`position: sticky; top: 0;`):** Header must never scroll out of view when analyzing 100+ rows.
2. **Numeric Alignment:** Numbers, coordinates, and precision metrics MUST use monospaced fonts and right/consistent alignment.
3. **Subtle Zebra Striping:** Alternate row opacity (`rgba(255, 255, 255, 0.015)`) to improve scanability.
4. **Interactive Hover Row:** Highlight row on mouseover with a subtle cyan tint (`rgba(56, 189, 248, 0.08)`).

```css
.table-container {
  overflow-x: auto;
  max-height: 480px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: rgba(6, 11, 24, 0.5);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

thead {
  position: sticky;
  top: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  z-index: 10;
}

th {
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-subtle);
}

td {
  padding: 9px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  color: #e2e8f0;
}

tbody tr:hover {
  background: rgba(56, 189, 248, 0.08) !important;
}
```

---

## 🗺️ 2. Leaflet Multi-Basemap Architecture

Provide users with instant switching between satellite, hybrid, street, and dark maps:
```javascript
function initBaseMapLayers() {
  const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 22, attribution: '&copy; Google' });
  const googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 22, attribution: '&copy; Google' });
  const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: '&copy; Esri' });
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' });
  const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; CartoDB' });

  return {
    '🛰️ Google Hibrit': googleHybrid,
    '🌍 Google Uydu': googleSat,
    '📡 Esri Uydu': esriSat,
    '📍 OpenStreetMap': osm,
    '🌙 CartoDB Karanlık': cartoDark
  };
}
```

---

## 📈 3. Metric KPI Cards with Top Gradient Accent

```css
.metric-card {
  background: var(--surface-elevated);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 14px 18px;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2.5px;
  background: linear-gradient(90deg, #06b6d4, #8b5cf6);
}
```
