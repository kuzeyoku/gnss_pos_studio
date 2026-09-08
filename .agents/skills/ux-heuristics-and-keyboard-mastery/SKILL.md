---
name: ux-heuristics-and-keyboard-mastery
description: >-
  Industry-standard UX heuristics, accessible keyboard navigation shortcuts (Ctrl+K, Ctrl+O, Esc),
  focus management, rich contextual tooltips, and error prevention patterns.
---

# UX Heuristics, Keyboard Navigation & Accessibility Skill

This skill provides proven standards and guidelines for building intuitive, accessible, and power-user friendly web applications with keyboard-first workflows, contextual tooltips, and Nielsen UX heuristics.

---

## 🧭 1. The 10 Nielsen Heuristics Applied to Engineering Apps

1. **Visibility of System Status:**
   - Always display immediate, visual feedback for long operations (e.g. progress bars with percent, status pill indicating active projection and geoid model).
   - Real-time log feeds and unobtrusive toast notifications instead of blocking `alert()`.

2. **Match Between System & Real World:**
   - Use standard surveying & geodesy terminology: $Y$ (Sağa Değer), $X$ (Yukarı Değer), $h$ (Elipsoit Kotu), $N$ (Jeoid Undülasyonu), $H$ (Helmert Ortometrik Nivelman Kotu), $dS$ (Bileşke 2B Fark).
   - Format coordinates with standard precision ($Y, X, h, H$ to 3 decimal places, Enlem/Boylam to 6 decimal places).

3. **User Control & Freedom:**
   - Provide clear escape routes: `Esc` closes modals/drawers, clear button resets search inputs, toggle switches allow instant undo of geoid reduction.

4. **Consistency & Standards:**
   - All action buttons follow strict semantic hierarchy:
     - **Primary Action (Cyan/Blue gradient):** Analyze, Transform, Calculate.
     - **Secondary Action (Glass Obsidian):** Export NCN, CSV, DXF, KML.
     - **Warning Action (Amber):** Threshold adjustments, single point warnings.
     - **Danger Action (Rose):** Error limit exceeded, reset all.

5. **Error Prevention & Graceful Recovery:**
   - Disable actions that cannot be performed (e.g. gray out and explain why GCP Cadastre report is inactive when zero double readings exist).
   - Auto-detect formats rather than forcing users to manually select dropdowns.

---

## ⌨️ 2. Global Power-User Keyboard Shortcuts

Implement a unified keyboard event listener:
```javascript
document.addEventListener('keydown', (e) => {
  // 1. Universal Search (Ctrl + K / Cmd + K)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('inputSearchRtk') || document.getElementById('inputSearchGcp') || document.getElementById('txtPaftaSearchInput');
    searchInput?.focus();
    searchInput?.select();
  }

  // 2. Open File Dialog (Ctrl + O)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
    e.preventDefault();
    const activeFileInput = document.querySelector('.tool-tab.active input[type="file"]');
    activeFileInput?.click();
  }

  // 3. Quick Print PDF Report (Ctrl + P)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    const btnPrint = document.querySelector('.tool-tab.active [id*="Print"], .tool-tab.active [id*="print"]');
    btnPrint?.click();
  }

  // 4. Escape Closes Panels / Clears Filters (Esc)
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal, .drawer').forEach(m => m.classList.remove('open'));
    const activeSearch = document.activeElement;
    if (activeSearch && activeSearch.tagName === 'INPUT') {
      activeSearch.value = '';
      activeSearch.dispatchEvent(new Event('input'));
      activeSearch.blur();
    }
  }
});
```

---

## 💡 3. Rich Contextual Tooltips (Hover Cards)

Never use ugly default browser title tooltips for critical terms. Use styled glassmorphic popover tooltips:
```css
[data-tooltip] {
  position: relative;
  cursor: help;
}

[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: rgba(3, 7, 18, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-family: var(--font-main);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
}

[data-tooltip]:hover::after {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
```
