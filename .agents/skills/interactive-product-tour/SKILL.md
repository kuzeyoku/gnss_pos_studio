---
name: interactive-product-tour
description: >-
  Zero-dependency spotlight onboarding tour, progressive discovery, empty-state illustrations,
  and contextual help workflows.
---

# Interactive Product Tour & Empty State UX Skill

This skill guides the design and implementation of guided user tours, spotlight highlights, and informative empty-state designs that help new users master complex scientific workstations quickly.

---

## 🧭 1. Zero-Dependency Spotlight Product Tour

```javascript
class SimpleProductTour {
  constructor(steps = []) {
    this.steps = steps;
    this.currentIdx = 0;
    this.overlay = null;
    this.popover = null;
  }

  start() {
    if (!this.steps || this.steps.length === 0) return;
    this.createDom();
    this.showStep(0);
  }

  createDom() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tour-backdrop';
    document.body.appendChild(this.overlay);

    this.popover = document.createElement('div');
    this.popover.className = 'tour-popover glass-panel';
    document.body.appendChild(this.popover);
  }

  showStep(idx) {
    if (idx < 0 || idx >= this.steps.length) {
      this.end();
      return;
    }
    this.currentIdx = idx;
    const step = this.steps[idx];
    const targetEl = document.querySelector(step.target);

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = targetEl.getBoundingClientRect();

      this.popover.innerHTML = `
        <div class="tour-header">
          <span class="tour-badge">${idx + 1} / ${this.steps.length}</span>
          <h4>${step.title}</h4>
        </div>
        <p>${step.content}</p>
        <div class="tour-actions">
          ${idx > 0 ? '<button class="btn btn-secondary btn-sm" id="btnTourPrev">Geri</button>' : ''}
          <button class="btn btn-primary btn-sm" id="btnTourNext">${idx === this.steps.length - 1 ? 'Tamamla' : 'İleri'}</button>
          <button class="btn btn-sm" id="btnTourClose" style="color: var(--text-dim);">Kapat</button>
        </div>
      `;

      this.popover.style.top = `${rect.bottom + 12}px`;
      this.popover.style.left = `${Math.max(16, rect.left)}px`;

      document.getElementById('btnTourNext')?.addEventListener('click', () => this.showStep(idx + 1));
      document.getElementById('btnTourPrev')?.addEventListener('click', () => this.showStep(idx - 1));
      document.getElementById('btnTourClose')?.addEventListener('click', () => this.end());
    } else {
      this.showStep(idx + 1);
    }
  }

  end() {
    if (this.overlay) this.overlay.remove();
    if (this.popover) this.popover.remove();
  }
}
```

---

## 🎨 2. Engaging Empty State Patterns

When a table or chart has no data loaded yet, always display an engaging empty state with a call-to-action button:
```html
<div class="empty-state-card">
  <div class="empty-state-icon">
    <i class="fa-solid fa-satellite-dish"></i>
  </div>
  <h3>Henüz GNSS Verisi Yüklenmedi</h3>
  <p>Carlson RW5, SurvCE, Leica GSI, CHCNAV veya Netcad dosyanızı sürükleyip bırakın veya örnek veriyi deneyin.</p>
  <button class="btn btn-primary btn-sm" id="btnLoadSampleData">
    <i class="fa-solid fa-flask"></i> Örnek Veriyle Dene
  </button>
</div>
```
