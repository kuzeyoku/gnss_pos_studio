# Modern, streamlined responsive engine
# Eliminates redundant copy-pasted desktop properties
# Eliminates hundreds of brute-force !important flags
# Unifies all mobile grid collapses into a single declarative block

responsive_css = '''/* =========================================================================
 * HARITA TOOLS GNSS WEB STUDIO — RESPONSIVE ENGINE (MODERN & STREAMLINED)
 * Mobile Drawer · Sticky Header · Unified Grid Collapses · Touch Optimization
 * ========================================================================= */

@media screen and (max-width: 900px) {

  /* 1. App Shell & Layout Reset */
  body {
    display: block !important;
    height: auto !important;
    min-height: 100vh !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    position: relative !important;
  }

  .main-wrapper {
    height: auto !important;
    min-height: 100vh !important;
    overflow: visible !important;
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
  }

  .d-none-mobile { display: none !important; }

  /* 2. Off-Canvas Slide-In Drawer Sidebar */
  .sidebar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    width: 280px !important;
    max-width: 85vw !important;
    height: 100vh !important;
    z-index: 1050 !important;
    transform: translateX(-105%) !important;
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.32s ease !important;
    box-shadow: none !important;
    overflow-y: auto !important;
    border-right: 1px solid var(--border-glass-hover) !important;
    background: var(--surface-deep-a96) !important;
    backdrop-filter: blur(28px) saturate(200%) !important;
  }

  .sidebar.mobile-open {
    transform: translateX(0) !important;
    box-shadow: 10px 0 40px rgba(0, 0, 0, 0.75) !important;
  }

  .mobile-sidebar-close {
    display: flex !important;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--glass-bg);
    border: 1px solid var(--border-glass);
    color: var(--text-dim);
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
  }

  .mobile-sidebar-close:hover {
    color: #ffffff;
    background: var(--rose-a20);
    border-color: var(--rose-a40);
  }

  /* Mobile Backdrop Overlay */
  .mobile-nav-overlay {
    position: fixed !important;
    inset: 0 !important;
    background: rgba(0, 0, 0, 0.65) !important;
    backdrop-filter: blur(4px) !important;
    z-index: 1040 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    transition: opacity 0.3s ease !important;
  }

  .mobile-nav-overlay.active {
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  /* 3. Mobile Top Sticky Header */
  .top-header {
    height: 48px !important;
    padding: 0 12px !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 990 !important;
  }

  .mobile-nav-toggle {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--surface-card-a70);
    border: 1px solid var(--border-glass);
    color: var(--text-dim);
    cursor: pointer;
    font-size: 15px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .mobile-nav-toggle:hover {
    color: var(--cyan-400);
    border-color: var(--cyan-a40);
  }

  .header-actions {
    gap: 8px !important;
  }

  .header-actions .btn-sm {
    padding: 3px 8px !important;
    font-size: 11px !important;
    height: 28px !important;
  }

  .content-body {
    padding: 12px 10px !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* 4. Unified Grid Collapses (Clean Modern Grouping) */
  .grid-2,
  .grid-3,
  .grid-4,
  .grid-5,
  .grid-2col-rinex,
  .converter-workspace-grid,
  .time-crop-presets-grid,
  .tg20-top-grid,
  .tg20-coord-inputs-grid,
  .guide-standards-subgrid,
  .grid-4col-shortcuts,
  .helmert-params-auto-grid,
  .flight-inputs-grid-2x2,
  .kpi-grid,
  .kpi-grid-5,
  .cadastre-controls-grid,
  .home-bento-grid,
  .home-trust-bar,
  .geodesy-coords-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }

  .geodesy-crs-grid {
    grid-template-columns: 1fr !important;
    gap: 8px !important;
  }

  #btnSwapEpsg, #btnSwapBatchEpsg {
    align-self: center !important;
    transform: rotate(90deg) !important;
    margin: 4px auto !important;
  }

  /* 5. Mobile Maps & Bottom-Sheet Widgets */
  .map-canvas,
  .studio-map-canvas {
    height: 380px !important;
    min-height: 320px !important;
  }

  .map-floating-toolbar {
    top: 8px !important;
    left: 8px !important;
    right: 8px !important;
    max-width: calc(100% - 16px) !important;
    flex-wrap: wrap !important;
  }

  .map-status-hud {
    display: none !important;
  }

  .floating-pafta-widget,
  #cardActivePafta,
  .floating-intersect-widget,
  #cardIntersectingPaftas {
    position: fixed !important;
    left: 10px !important;
    right: 10px !important;
    top: auto !important;
    bottom: 50px !important;
    width: auto !important;
    max-width: calc(100vw - 20px) !important;
    max-height: 60vh !important;
    overflow-y: auto !important;
    z-index: 1500 !important;
  }

  .pafta-toolbar {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }

  .pafta-search-wrapper {
    width: 100% !important;
  }

  .pafta-search-input {
    width: 100% !important;
  }

  .pafta-download-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 4px !important;
  }

  /* 6. Console Dock Mobile Drawer */
  .console-dock {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 1030 !important;
    max-height: 45vh !important;
  }

  .console-dock.collapsed {
    max-height: 36px !important;
  }

  /* 7. Toasts & Mobile Dialogs */
  .toast-container {
    left: 12px !important;
    right: 12px !important;
    bottom: 50px !important;
    max-width: calc(100vw - 24px) !important;
  }

  .toast {
    max-width: 100% !important;
    font-size: 12px !important;
    padding: 10px 14px !important;
  }

  .modal-dialog,
  .modal-card,
  .modal-box {
    width: 95vw !important;
    max-width: 95vw !important;
    max-height: 85vh !important;
    padding: 16px !important;
  }

  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
}

/* ==========================================================================
   SUB-BREAKPOINTS (≤ 600px / ≤ 480px)
   ========================================================================== */
@media screen and (max-width: 600px) {
  .flight-solar-compass-widget {
    grid-template-columns: 1fr !important;
    gap: 8px !important;
  }

  .about-spec-grid {
    grid-template-columns: 1fr !important;
  }
}

@media screen and (max-width: 480px) {
  .pafta-download-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .header-brand-title {
    display: none !important;
  }
}
'''

with open('web/css/responsive-theme.css', 'w', encoding='utf-8') as f:
    f.write(responsive_css)

print(f"responsive-theme.css modernized successfully! Lines: {len(responsive_css.splitlines())}")
