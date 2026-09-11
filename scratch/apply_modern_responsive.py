# Clean, modern, declarative responsive engine
# Eliminates 350+ brute-force !important flags
# Unifies grid collapses and mobile components

responsive_css = '''/* =========================================================================
 * HARITA TOOLS GNSS WEB STUDIO — MODERN RESPONSIVE ENGINE
 * Zero-dependency client-side adaptive layout
 * Clean cascade · Mobile Drawer · Unified Grids · Touch Target Precision
 * ========================================================================= */

@media screen and (max-width: 900px) {

  /* --- 1. App Shell & Layout Reset --- */
  body {
    display: block;
    height: auto;
    min-height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
  }

  .main-wrapper {
    height: auto;
    min-height: 100vh;
    overflow: visible;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .content-body {
    padding: 12px 10px 80px 10px;
    height: auto;
    overflow: visible;
  }

  .d-none-mobile {
    display: none !important;
  }

  /* --- 2. Off-Canvas Slide-In Drawer Sidebar --- */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    max-width: 85vw;
    height: 100vh;
    z-index: 1050;
    transform: translateX(-105%);
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.32s ease;
    box-shadow: none;
    overflow-y: auto;
    border-right: 1px solid var(--border-glass-hover);
    background: var(--surface-deep-a96);
    backdrop-filter: blur(28px) saturate(200%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 10px 0 40px rgba(0, 0, 0, 0.75);
  }

  .mobile-sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    background: var(--surface-card-a80);
    border: 1px solid var(--border-glass);
    color: var(--text-dim);
    font-size: 14px;
    cursor: pointer;
    z-index: 40;
    transition: all 0.2s ease;
  }

  .mobile-sidebar-close:hover {
    color: #ffffff;
    background: var(--rose-a20);
    border-color: var(--rose-a40);
  }

  .mobile-nav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    z-index: 1040;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .mobile-nav-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }

  /* --- 3. Top Sticky Header --- */
  .top-header {
    height: 48px;
    padding: 0 12px;
    position: sticky;
    top: 0;
    z-index: 990;
    background: var(--surface-deep-a95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-glass);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left-group {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }

  .mobile-nav-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--surface-card-a70);
    border: 1px solid var(--border-glass);
    color: var(--text-dim);
    font-size: 14px;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .mobile-nav-toggle:hover {
    color: var(--cyan-400);
    border-color: var(--cyan-a40);
  }

  .mobile-nav-toggle:active {
    transform: scale(0.92);
    background: var(--cyan-a20);
  }

  .header-title {
    min-width: 0;
    flex: 1;
  }

  .header-title h1 {
    font-size: 13.5px;
    font-weight: 800;
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-title p,
  .solar-wind-divider,
  .console-dock #dockSummaryText,
  #lblRw5Tg20Status {
    display: none;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    margin: 0;
    width: auto;
  }

  .btn-icon,
  #btnThemeToggle,
  #btnOpenAboutModal {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .status-pill {
    padding: 3px 6px;
    font-size: 9.5px;
  }

  /* --- 4. Touch Targets & Form Controls --- */
  input[type="text"],
  input[type="number"],
  input[type="search"],
  input[type="date"],
  input[type="time"],
  select,
  .form-input {
    min-height: 34px;
    height: 34px;
    font-size: 13px;
    padding: 4px 8px;
    touch-action: manipulation;
  }

  .btn {
    min-height: 32px;
    font-size: 12px;
    padding: 5px 12px;
    touch-action: manipulation;
  }

  .btn-sm {
    min-height: 28px;
    height: 28px;
    font-size: 11px;
    padding: 3px 8px;
  }

  .subtab-btn {
    min-height: 28px;
    height: 28px;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 6px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .nav-item {
    min-height: 36px;
    padding: 8px 12px;
    margin-bottom: 2px;
    font-size: 13px;
  }

  .nav-item i {
    font-size: 14px;
    width: 20px;
  }

  .dropzone {
    padding: 16px 10px;
  }

  /* --- 5. Unified Responsive Grid Collapses --- */
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
  .flight-inputs-grid-2x2,
  .cadastre-controls-grid,
  .home-bento-grid,
  .home-trust-bar,
  .geodesy-coords-grid,
  .geodesy-crs-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .helmert-params-auto-grid,
  .kpi-grid,
  .kpi-grid-5 {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  #btnSwapEpsg,
  #btnSwapBatchEpsg {
    align-self: center;
    transform: rotate(90deg);
    margin: 4px auto;
  }

  .tg20-subtab-nav {
    flex-wrap: wrap;
    gap: 6px;
  }

  .tg20-subtab-nav .subtab-btn {
    flex: 1 1 auto;
    min-width: 130px;
    padding: 6px 10px;
    font-size: 11px;
  }

  .tg20-action-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .tg20-action-toolbar .btn-primary {
    width: 100%;
    min-height: 32px;
    font-size: 12px;
  }

  .tg20-batch-actions .btn {
    width: auto;
    flex: 1 1 calc(50% - 4px);
    min-height: 26px;
    padding: 3px 6px;
    font-size: 10.5px;
    justify-content: center;
  }

  .helmert-export-row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  /* --- 6. Horizontal Nav & Scrollable Data Tables --- */
  .subtabs-bar,
  .guide-filter-chips {
    display: flex;
    overflow-x: auto;
    flex-wrap: nowrap;
    gap: 4px;
    padding: 2px 0 6px 0;
    margin-bottom: 6px;
    scrollbar-width: none;
    width: 100%;
  }

  .subtabs-bar::-webkit-scrollbar,
  .guide-filter-chips::-webkit-scrollbar {
    display: none;
  }

  .guide-filter-chip {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 11px;
    padding: 4px 10px;
  }

  .table-container {
    overflow-x: auto;
    width: 100%;
    margin-bottom: 10px;
    border-radius: var(--radius-sm);
  }

  .data-table,
  .guide-table {
    min-width: 580px;
  }

  .table-scroll-520,
  .table-scroll-350,
  .table-h220,
  .table-h180 {
    max-height: 260px;
  }

  .cadastre-tg20-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 8px;
  }

  #btnAnalyzeRw5 {
    height: 32px;
    min-height: 32px;
    font-size: 12px;
    padding: 4px 12px;
  }

  /* --- 7. Maps, Floating Controls & Widgets --- */
  #flightMapContainer,
  .flight-map-canvas,
  #tg20MapContainer,
  .map-canvas,
  .studio-map-canvas {
    height: 380px;
    min-height: 320px;
    border-radius: var(--radius-sm);
    touch-action: pan-x pan-y;
  }

  .map-mobile-menu-toggle {
    display: flex;
    position: absolute;
    top: 8px;
    left: 48px;
    z-index: 1001;
    background: var(--surface-deep-a92);
    backdrop-filter: blur(14px);
    border: 1px solid var(--border-cyan-glow);
    color: #ffffff;
    padding: 3px 10px;
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 700;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.75);
    height: 26px;
    transition: all 0.2s ease;
  }

  .map-mobile-menu-toggle:active {
    transform: scale(0.95);
  }

  .map-floating-toolbar {
    display: none;
    position: absolute;
    top: 38px;
    left: 48px;
    width: 220px;
    max-width: calc(100vw - 80px);
    background: rgba(var(--surface-deep-rgb), 0.97);
    backdrop-filter: blur(28px) saturate(200%);
    border: 1px solid var(--border-cyan-glow);
    border-radius: var(--radius-md);
    padding: 10px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    z-index: 1002;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.9);
    animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .map-floating-toolbar.mobile-open {
    display: flex;
  }

  .map-status-hud {
    display: none;
  }

  .flight-solar-compass-widget {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    box-sizing: border-box;
  }

  .solar-dial-circle,
  .wind-dial-circle {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .solar-wind-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--surface-card-a70);
    border: 1px solid var(--border-glass);
    border-radius: var(--radius-xs);
    padding: 5px 6px;
    width: 100%;
    justify-content: flex-start;
  }

  .dropdown-export-wrap {
    width: 100%;
  }

  #btnToggleExportMenu {
    width: 100%;
    justify-content: center;
    min-height: 28px;
    height: 28px;
    font-size: 11px;
  }

  .flight-export-menu {
    position: fixed;
    left: 12px;
    right: 12px;
    top: auto;
    bottom: 60px;
    width: auto;
    min-width: unset;
    z-index: 1200;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.7);
  }

  .floating-pafta-widget,
  #cardActivePafta,
  .floating-intersect-widget,
  #cardIntersectingPaftas {
    position: fixed;
    left: 10px;
    right: 10px;
    top: auto;
    bottom: 50px;
    width: auto;
    max-width: calc(100vw - 20px);
    max-height: 60vh;
    overflow-y: auto;
    z-index: 1500;
  }

  .pafta-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .pafta-search-wrapper,
  .pafta-search-input {
    width: 100%;
  }

  .pafta-download-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }

  /* --- 8. Console Dock --- */
  .console-dock {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 950;
    border-radius: 12px 12px 0 0;
    padding: 8px 12px;
    background: var(--surface-deep-a96);
    backdrop-filter: blur(24px);
    border-top: 1px solid var(--border-glass-hover);
    box-shadow: 0 -6px 25px rgba(0, 0, 0, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 48vh;
  }

  .console-dock.minimized {
    padding: 6px 12px;
    height: 38px;
    max-height: 38px;
    overflow: hidden;
  }

  /* --- 9. Toasts & Modals --- */
  .toast-container {
    left: 12px;
    right: 12px;
    bottom: 50px;
    max-width: calc(100vw - 24px);
  }

  .toast {
    max-width: 100%;
    font-size: 12px;
    padding: 10px 14px;
  }

  .modal-dialog {
    width: 95vw;
    max-width: 95vw;
    max-height: 85vh;
    padding: 16px;
  }

  html, body {
    overflow-x: hidden;
    max-width: 100vw;
  }
}

/* ==========================================================================
   SUB-BREAKPOINTS (≤ 600px / ≤ 480px)
   ========================================================================== */
@media screen and (max-width: 600px) {
  .flight-solar-compass-widget {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .about-spec-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 480px) {
  .pafta-download-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header-brand-title {
    display: none;
  }

  .guide-hero-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .guide-hero-inner .badge-group {
    width: 100%;
    justify-content: flex-start;
  }
}
'''

with open('web/css/responsive-theme.css', 'w', encoding='utf-8') as f:
    f.write(responsive_css)

print(f"responsive-theme.css modernized successfully! Lines: {len(responsive_css.splitlines())}")
