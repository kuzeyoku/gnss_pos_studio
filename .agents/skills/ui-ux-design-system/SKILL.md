---
name: ui-ux-design-system
description: >-
  Ultra-modern UI/UX design system skill for crafting award-winning web interfaces,
  glassmorphism aesthetics, vibrant neon/dark palettes, specular glow, and dynamic micro-interactions.
---

# UI/UX & Glassmorphism Design System Skill

This skill provides comprehensive guidelines, tokens, and design patterns for building state-of-the-art web interfaces that stun users at first glance with rich aesthetics, glassmorphism, depth, and micro-interactions.

---

## 🎨 1. Core Color System & Palette

### Dark Obsidian Foundation
```css
:root {
  /* Surface Layers (Depth Stacking) */
  --surface-void: #030712;       /* Level 0 - Deepest background */
  --surface-base: #060b18;       /* Level 1 - App container */
  --surface-panel: rgba(15, 23, 42, 0.65); /* Level 2 - Glass Cards */
  --surface-elevated: rgba(22, 32, 56, 0.80); /* Level 3 - Modals/Dropdowns */
  --surface-hover: rgba(30, 44, 76, 0.90); /* Level 4 - Hover state */

  /* Specular Borders */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-bright: rgba(56, 189, 248, 0.30);
  --border-glow: rgba(139, 92, 246, 0.35);

  /* Semantic Accents */
  --accent-cyan: #06b6d4;     /* Primary Action / Focus */
  --accent-sky: #38bdf8;      /* Highlights & Active text */
  --accent-blue: #3b82f6;     /* Secondary Interactive */
  --accent-indigo: #6366f1;   /* Tertiary Accents */
  --accent-purple: #8b5cf6;   /* Special features / Badges */
  --accent-emerald: #10b981;  /* Success / Fixed / Valid */
  --accent-amber: #f59e0b;    /* Warning / Single readings */
  --accent-rose: #f43f5e;     /* Error / Limit exceeded */
}
```

---

## 🪟 2. Glassmorphism Physics Formula

To achieve authentic, high-end frosted glass rather than flat semi-transparency:
```css
.glass-panel {
  background: var(--surface-panel);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  box-shadow: 
    0 10px 30px -5px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08); /* Specular top edge highlight */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 14px 40px -5px rgba(0, 0, 0, 0.7),
    0 0 20px rgba(6, 182, 212, 0.12),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}
```

---

## ✨ 3. Typography Stacking

Always avoid generic system fonts in favor of curated geometric typefaces:
- **Display & Headlines:** `'Outfit', sans-serif` (Weights: 600, 700, 800)
- **Body & Controls:** `'Plus Jakarta Sans', sans-serif` (Weights: 400, 500, 600)
- **Coordinates & Telemetry:** `'JetBrains Mono', monospace` (Weights: 500, 600)

---

## ⚡ 4. Interactive Micro-Interactions & Pulsing Badges

```css
/* Animated Status Indicator */
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-emerald);
  box-shadow: 0 0 12px var(--accent-emerald);
  animation: pulseLive 2s infinite ease-in-out;
}

@keyframes pulseLive {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.65; box-shadow: 0 0 18px var(--accent-emerald); }
}

/* Gradient Shimmer Button */
.btn-shimmer {
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-shimmer:hover {
  box-shadow: 0 6px 25px rgba(6, 182, 212, 0.5);
  transform: translateY(-1.5px);
}
```
