---
name: responsive-web-craft
description: >-
  Advanced responsive web engineering, print/PDF report styling, touch-friendly mobile layouts,
  and zero-dependency client-side architecture.
---

# Responsive Web Craft & Export Optimization Skill

This skill provides patterns for responsive design, high-fidelity print report generation, and zero-server client-side web application architectures.

---

## 📱 1. Responsive Layout & Mobile Collapsing

```css
@media (max-width: 1024px) {
  body {
    flex-direction: column;
    height: auto;
    overflow: auto;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-glass);
  }
  
  .main-wrapper {
    height: auto;
    overflow: visible;
  }
  
  .content-body {
    padding: 16px;
  }
}
```

---

## 🖨️ 2. Official Cadastral Print & PDF Report Architecture

When generating print-ready reports for ministries (TKGM, Cadastre, LİHKAB, Municipalities):
1. Use clean black & white styling optimized for standard A4 papers.
2. Hide UI buttons, sidebar, and interactive controls via `@media print`.
3. Provide signature blocks with proper page-break handling.

```css
@media print {
  body {
    background: #ffffff !important;
    color: #000000 !important;
    margin: 10mm;
    font-size: 11px;
  }
  
  .sidebar, .top-header, .btn, .no-print {
    display: none !important;
  }
  
  table {
    page-break-inside: auto;
    width: 100%;
    border-collapse: collapse;
  }
  
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  
  th, td {
    border: 1px solid #333333 !important;
    padding: 4px 6px;
  }
  
  .sign-box {
    page-break-inside: avoid;
  }
}
```

---

## ⚡ 3. Zero-Server Client-Side Execution (cPanel / Shared Hosting)

- Use **Web Workers** for heavy mathematical algorithms (SPP GNSS solvers, RINEX parsers, Transverse Mercator projections).
- Use `Blob` and `URL.createObjectURL` for in-browser file creation without uploading sensitive survey data to third-party servers.
- Use `JSZip` for bundling multi-file packages entirely in RAM.
