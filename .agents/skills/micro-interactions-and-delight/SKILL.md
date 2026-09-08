---
name: micro-interactions-and-delight
description: >-
  Tactile micro-interactions, spring physics, pulsing live badges, shimmering skeleton loaders,
  drag-over highlight physics, and delightful micro-animations.
---

# Micro-Interactions & UI Delight Skill

This skill guides the implementation of delightful, tactile micro-animations and physics-driven micro-interactions that make web dashboards feel responsive, alive, and ultra-premium.

---

## ⚡ 1. Shimmering Skeleton Loader

When computing or parsing large datasets, use shimmering skeleton blocks instead of blank areas:
```css
.skeleton-row {
  height: 28px;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.6) 25%, rgba(56, 189, 248, 0.12) 50%, rgba(15, 23, 42, 0.6) 75%);
  background-size: 200% 100%;
  animation: shimmerSkeleton 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 6px;
}

@keyframes shimmerSkeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 🌊 2. Tactile Button Click Physics

```css
.btn-tactile {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-tactile:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
}

.btn-tactile:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.2);
}
```

---

## 🎯 3. Tactile Drag-and-Drop Dropzone Glow

```css
.dropzone-cyber {
  border: 2px dashed rgba(255, 255, 255, 0.15);
  background: rgba(15, 23, 42, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropzone-cyber.dragover {
  border-color: var(--cyan-400);
  background: rgba(6, 182, 212, 0.12);
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.35), inset 0 0 15px rgba(6, 182, 212, 0.2);
  transform: scale(1.015);
}
```

---

## 🔢 4. Animated Number Counters (Smooth Count-Up)

```javascript
function animateNumber(element, startVal, endVal, duration = 800, decimals = 0, suffix = '') {
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
    const currentVal = startVal + (endVal - startVal) * easeProgress;
    element.textContent = currentVal.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
```
