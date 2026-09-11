import re

with open('web/css_old/components.css', 'r', encoding='utf-8') as f:
    orig = f.read()

# Unified Base Systems for Components
unified_foundation = '''/* ==========================================================================
   HARITA TOOLS GNSS WEB STUDIO — COMPONENTS (UNIFIED DESIGN SYSTEM)
   ========================================================================== */

/* ==========================================================================
   01. CARDS, PANELS & CONTAINERS (UNIFIED)
   ========================================================================== */
.card,
.glass-panel,
.config-panel,
.data-panel,
.timeline-chart-wrap,
.geodesy-panel-box,
.pafta-card {
  position: relative;
  background: var(--bg-glass-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
}

.card:hover,
.card-interactive:hover,
.bento-card:hover,
.kpi-card:hover {
  border-color: var(--border-glass-bright);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-glass);
}

.card-header-clean { border-bottom: none; margin-bottom: 8px; padding-bottom: 0; }

.card-title {
  font-family: var(--font-display);
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title i { color: var(--cyan-400); font-size: 14px; }
.card-body { position: relative; }

/* Card Accent Stripes */
.card[class*="card-accent-"],
.card-accent-cyan    { border-top: 2px solid var(--cyan-500); }
.card-accent-indigo,
.card-accent-purple  { border-top: 2px solid var(--purple-500); }
.card-accent-emerald { border-top: 2px solid var(--emerald-500); }
.card-accent-amber   { border-top: 2px solid var(--amber-500); }
.card-accent-sky     { border-top: 2px solid var(--cyan-400); }
.card-accent-rose    { border-top: 2px solid var(--rose-500); }

/* KPI Grid & Cards */
.kpi-grid   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.kpi-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }

.kpi-card {
  background: rgba(13, 21, 38, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.kpi-card:hover {
  border-color: var(--cyan-a35);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 16px var(--cyan-a12);
}

.kpi-card.border-emerald { border-color: var(--emerald-a35); background: linear-gradient(135deg, var(--surface-deep-a85), var(--emerald-a12)); }
.kpi-card.border-amber   { border-color: var(--amber-a35); background: linear-gradient(135deg, var(--surface-deep-a85), var(--amber-a12)); }

.kpi-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

.kpi-val {
  font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono);
  line-height: 1.1; letter-spacing: -0.02em;
}

.kpi-label {
  font-size: 11px; font-weight: 600; color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 0.04em; margin-top: 3px;
}

/* Bento Cards */
.bento-card {
  background: var(--surface-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex; flex-direction: column; justify-content: space-between;
  gap: 10px; cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; overflow: hidden;
  box-shadow: var(--glow-card);
}

.bento-card:hover {
  transform: translateY(-2px);
  border-color: var(--cyan-a40);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.bento-icon-box {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: var(--cyan-a12); border: 1px solid var(--cyan-a30); color: var(--cyan-400);
}

.bento-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; }
.bento-desc  { font-size: 11.5px; color: var(--text-muted); line-height: 1.45; margin: 0; }
.bento-features { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: var(--text-dim); }
.bento-features span { display: flex; align-items: center; gap: 6px; }
.bento-features i { color: var(--emerald-400); font-size: 10px; }
.bento-footer { border-top: 1px solid var(--glass-bg); padding-top: 8px; display: flex; justify-content: flex-end; }
.bento-action-link { background: transparent; border: none; color: var(--cyan-400); font-size: 11.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s ease; padding: 0; }
.bento-action-link:hover { color: #ffffff; transform: translateX(3px); }

/* ==========================================================================
   02. BADGES, CHIPS, PILLS & SPANS (UNIFIED)
   ========================================================================== */
.badge,
.chip,
.pill,
.dropzone-tag-pill,
.flight-geo-chip,
.guide-filter-chip,
.quick-epsg-chip,
.tg20-region-chip,
.flight-telemetry-chip,
.sidebar-sat-pill,
.map-hud-badge,
.export-tag,
.hero-pill,
.file-info-chip,
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 700;
  border-radius: var(--radius-full);
  line-height: 1.2;
  white-space: nowrap;
  letter-spacing: 0.25px;
  border: 1px solid var(--border-glass);
  background: rgba(var(--surface-card-rgb), 0.75);
  color: var(--text-dim);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  user-select: none;
}

/* Badge Sizes */
.badge-sm, .text-3xs { font-size: 9.5px; padding: 2px 6px; }
.badge-xs, .text-2xs { font-size: 10px; padding: 2px 7px; }
.badge-lg            { font-size: 12.5px; padding: 5px 12px; }

/* Badge Variants */
.badge-cyan,
.badge-sat-gps,
.icon-cyan {
  background: var(--cyan-a15);
  color: var(--cyan-400);
  border: 1px solid var(--cyan-a35);
  box-shadow: 0 0 10px var(--cyan-a15);
}

.badge-purple,
.badge-sat-glo,
.icon-purple {
  background: var(--purple-a15);
  color: #c084fc;
  border: 1px solid var(--purple-a35);
  box-shadow: 0 0 10px var(--purple-a15);
}

.badge-emerald,
.badge-sat-gal,
.icon-emerald {
  background: var(--emerald-a15);
  color: var(--emerald-400);
  border: 1px solid var(--emerald-a35);
  box-shadow: 0 0 10px var(--emerald-a15);
}

.badge-amber,
.badge-sat-bds,
.icon-amber {
  background: var(--amber-a15);
  color: #fbbf24;
  border: 1px solid var(--amber-a35);
  box-shadow: 0 0 10px var(--amber-a15);
}

.badge-rose,
.icon-rose {
  background: var(--rose-a12);
  color: #fb7185;
  border: 1px solid var(--rose-a35);
  box-shadow: 0 0 10px var(--rose-a15);
}

.badge-blue,
.icon-blue {
  background: rgba(var(--blue-rgb), 0.12);
  color: #60a5fa;
  border: 1px solid rgba(var(--blue-rgb), 0.35);
  box-shadow: 0 0 10px rgba(var(--blue-rgb), 0.15);
}

.badge-sky,
.icon-sky {
  background: rgba(var(--sky-rgb), 0.15);
  color: var(--sky-400);
  border: 1px solid rgba(var(--sky-rgb), 0.3);
}

.badge-secondary,
.dropzone-tag-pill,
.file-info-chip {
  background: var(--glass-bg);
  color: var(--text-dim);
  border-color: rgba(255, 255, 255, 0.12);
}

.badge-tg20 {
  background: var(--emerald-a20);
  color: var(--emerald-400);
  border: 1px solid var(--emerald-a40);
  font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px;
}

/* Interactive Chips (Filters, Presets, EPSG Chips) */
.guide-filter-chip,
.quick-epsg-chip,
.tg20-region-chip,
.chip-interactive {
  cursor: pointer;
}

.guide-filter-chip:hover,
.quick-epsg-chip:hover,
.tg20-region-chip:hover,
.chip-interactive:hover {
  color: #ffffff;
  border-color: var(--cyan-400);
  background: var(--cyan-a15);
  transform: translateY(-1px);
}

.guide-filter-chip.active,
.quick-epsg-chip.active,
.chip-interactive.active {
  background: linear-gradient(135deg, var(--cyan-500), var(--blue-500)) !important;
  color: #ffffff !important;
  border-color: var(--cyan-300) !important;
  box-shadow: 0 0 12px var(--cyan-a40) !important;
}

.hero-pill-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--cyan-400);
  box-shadow: 0 0 8px var(--cyan-400);
  animation: pulseDot 2s infinite ease-in-out;
}

/* ==========================================================================
   03. BUTTONS (UNIFIED DESIGN SYSTEM)
   ========================================================================== */
.btn {
  font-family: var(--font-main);
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 12px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  box-sizing: border-box;
}

.btn:hover  { transform: translateY(-1.5px); }
.btn:active { transform: translateY(0); }
.btn:disabled, .btn.disabled { opacity: 0.5; pointer-events: none; }

/* Unified Primary Button (Blue/Cyan action across ALL modules) */
.btn-primary {
  border: 1px solid var(--border-glass-strong);
  background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
  box-shadow: 0 4px 18px var(--cyan-a35);
  color: #ffffff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0891b2 0%, #1d4ed8 100%);
  box-shadow: 0 6px 25px var(--cyan-a55);
}

/* Secondary Button (Glass dark background across ALL modules) */
.btn-secondary {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid var(--border-glass);
  color: var(--text-main);
}

.btn-secondary:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: var(--border-glass-hover);
  color: #ffffff;
}

/* Danger Button */
.btn-danger {
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.35);
  border-color: rgba(239, 68, 68, 0.6);
  color: #ffffff;
}

/* Success / Emerald Button */
.btn-success,
.btn-emerald {
  background: linear-gradient(135deg, var(--emerald-600), var(--emerald-500));
  border: 1px solid var(--emerald-400);
  color: #ffffff;
}

.btn-success:hover,
.btn-emerald:hover {
  box-shadow: 0 0 14px var(--emerald-a35);
}

/* Soft Outline Variants */
.btn-outline-cyan   { background: var(--cyan-a10); border-color: var(--cyan-a40); color: var(--cyan-400); }
.btn-outline-cyan:hover { background: var(--cyan-a20); border-color: var(--cyan-500); color: #ffffff; box-shadow: 0 0 12px var(--cyan-a30); }

.btn-outline-amber  { background: var(--amber-a10); border-color: var(--amber-a40); color: var(--amber-400); }
.btn-outline-amber:hover { background: var(--amber-a20); border-color: var(--amber-500); color: #ffffff; box-shadow: 0 0 12px var(--amber-a30); }

.btn-outline-emerald{ background: var(--emerald-a10); border-color: var(--emerald-a40); color: var(--emerald-400); }
.btn-outline-emerald:hover { background: var(--emerald-a20); border-color: var(--emerald-500); color: #ffffff; box-shadow: 0 0 12px var(--emerald-a30); }

.btn-outline-purple { background: var(--purple-a10); border-color: var(--purple-a40); color: var(--purple-400); }
.btn-outline-purple:hover { background: var(--purple-a20); border-color: var(--purple-500); color: #ffffff; box-shadow: 0 0 12px var(--purple-a30); }

.btn-outline-rose   { background: var(--rose-a10); border-color: var(--rose-a40); color: var(--rose-400); }
.btn-outline-rose:hover { background: var(--rose-a20); border-color: var(--rose-500); color: #ffffff; box-shadow: 0 0 12px var(--rose-a30); }

/* Sizing Modifiers */
.btn-xs { font-size: 10px; padding: 2px 6px; height: 20px; gap: 4px; }
.btn-sm { font-size: 11px; padding: 3px 8px; height: 24px; gap: 6px; }
.btn-lg { font-size: 13px; padding: 6px 16px; height: 34px; gap: 8px; font-weight: 700; }

.btn-icon { width: 28px; height: 28px; padding: 0; }
.btn-icon.btn-xs { width: 20px; height: 20px; }
.btn-icon.btn-sm { width: 24px; height: 24px; }
.btn-icon.btn-lg { width: 34px; height: 34px; }

/* Subtab & Segment Buttons */
.subtabs-bar {
  display: flex; gap: 8px; margin-bottom: 12px;
  border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;
  flex-wrap: wrap; align-items: center;
}

.subtab-btn {
  font-family: var(--font-main); font-size: 11px; font-weight: 600;
  padding: 4px 10px; height: 26px; border-radius: var(--radius-md);
  cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; align-items: center; gap: 7px; border: 1px solid transparent;
}

.subtab-btn.btn-secondary {
  background: var(--surface-card-a70); color: var(--text-muted); border-color: var(--border-glass);
}

.subtab-btn.btn-secondary:hover {
  background: rgba(30, 48, 88, 0.8); color: #ffffff;
  border-color: var(--border-glass-hover); transform: translateY(-1px);
}

.subtab-btn.btn-primary.active,
.subtab-btn.active {
  background: linear-gradient(135deg, var(--cyan-500) 0%, var(--blue-500) 100%) !important;
  color: #ffffff !important; box-shadow: var(--glow-cyan) !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
}

/* Pafta Scale Buttons & Active State */
.pafta-scale-btn {
  border: 1px solid;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: color-mix(in srgb, var(--pafta-color) 8%, transparent);
  border-color: color-mix(in srgb, var(--pafta-color) 35%, transparent);
  color: var(--pafta-color);
}

.pafta-scale-btn:hover {
  color: #ffffff; transform: translateY(-1px);
  background: color-mix(in srgb, var(--pafta-color) 20%, transparent);
  border-color: var(--pafta-color);
  box-shadow: 0 0 14px color-mix(in srgb, var(--pafta-color) 40%, transparent);
}

.pafta-scale-btn.active,
#btnToggleDom.active {
  color: #ffffff !important; font-weight: 800 !important;
  background: color-mix(in srgb, var(--pafta-color) 25%, transparent) !important;
  border-color: var(--pafta-color) !important;
  box-shadow: 0 0 16px color-mix(in srgb, var(--pafta-color) 50%, transparent), inset 0 0 8px color-mix(in srgb, var(--pafta-color) 25%, transparent) !important;
}

.close-minimal {
  background: none; border: none; color: var(--text-dim);
  cursor: pointer; font-size: 15px; padding: 2px 6px; line-height: 1;
  border-radius: 4px; transition: color 0.2s ease, background-color 0.2s ease;
  display: flex; align-items: center; justify-content: center;
}

.close-minimal:hover { color: #fb7185; background: var(--rose-a15); }

/* ==========================================================================
   04. FORM INPUTS, SELECTS & TEXTAREAS (UNIFIED)
   ========================================================================== */
.form-input,
.form-select,
.form-control,
.pafta-search-input {
  width: 100%;
  background: #030712;
  border: 1px solid var(--glass-bg-active);
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 11.5px;
  padding: 4px 8px;
  height: 28px;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.4;
  box-sizing: border-box;
}

.form-input-sm,
.form-select-sm,
.form-control-xs {
  height: 24px; padding: 2px 6px; font-size: 11px;
}

.form-input.font-mono { font-family: var(--font-mono); }

.form-input:hover,
.form-select:hover,
.form-control:hover,
.pafta-search-input:hover {
  border-color: var(--cyan-a40);
}

.form-input:focus,
.form-select:focus,
.form-control:focus,
.pafta-search-input:focus,
.form-textarea:focus,
.batch-textarea:focus,
.dns-textarea:focus,
.code-editor-textarea:focus {
  border-color: var(--cyan-500) !important;
  box-shadow: 0 0 0 2px var(--cyan-a20), inset 0 1px 2px rgba(0, 0, 0, 0.4) !important;
}

.form-input[type="number"] {
  font-family: var(--font-mono); font-weight: 700; color: #38bdf8;
}

.form-select {
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2338bdf8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  padding-right: 32px;
  cursor: pointer;
}

.form-select option {
  background: #0a0f1d; color: #ffffff; padding: 10px 14px; font-size: 12.5px;
}

.input-unit-group {
  position: relative; display: flex; align-items: center; width: 100%;
}

.input-unit-group .form-input { padding-right: 30px; }

.input-unit-suffix {
  position: absolute; right: 10px; font-family: var(--font-mono);
  font-size: 11px; font-weight: 700; color: var(--text-dim);
  pointer-events: none; user-select: none;
}

/* Textareas (Batch, DNS, Code Editor) */
.form-textarea,
.batch-textarea,
.dns-textarea,
.code-editor-textarea {
  width: 100%;
  background: var(--surface-card-a85);
  border: 1px solid var(--border-glass);
  color: #ffffff;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.45;
  resize: vertical;
  min-height: 110px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.code-editor-textarea {
  height: 380px; color: var(--cyan-400); font-size: 12.5px; background: #040814;
}

/* Sliders */
.form-range,
.flight-slider,
.flight-time-slider {
  width: 100%; height: 6px; border-radius: 3px;
  background: var(--surface-card-a90); outline: none;
  accent-color: var(--cyan-400); cursor: pointer;
}

/* ==========================================================================
   05. DROPZONES
   ========================================================================== */
.dropzone {
  border: 2px dashed var(--border-glass-hover);
  background: var(--surface-card-a45);
  border-radius: var(--radius-md);
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
}

.dropzone:hover,
.dropzone.dragover {
  border-color: var(--cyan-400);
  background: var(--cyan-a8);
  transform: scale(1.005);
  box-shadow: 0 0 25px var(--cyan-a15);
}

.dropzone-compact {
  padding: 14px 12px;
}

.dropzone-icon {
  font-size: 28px; color: var(--cyan-400); margin-bottom: 2px;
  transition: transform 0.2s ease;
}

.dropzone:hover .dropzone-icon { transform: translateY(-2px); }

.dropzone-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: #ffffff; }
.dropzone-subtitle { font-size: 11px; color: var(--text-dim); }
.dropzone-tags { display: flex; gap: 5px; flex-wrap: wrap; justify-content: center; }

/* ==========================================================================
   06. TABLES (UNIFIED)
   ========================================================================== */
.table-responsive,
.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-glass);
  background: rgba(var(--surface-deep-rgb), 0.5);
}

.studio-table,
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
  text-align: left;
}

.studio-table th,
table th {
  background: rgba(8, 14, 30, 0.95);
  color: var(--text-muted);
  font-weight: 700;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-glass);
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.studio-table td,
table td {
  padding: 7px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text-main);
  white-space: nowrap;
}

.studio-table tbody tr:hover,
table tbody tr:hover {
  background: var(--cyan-a5);
}

.table-sm th { padding: 5px 8px; font-size: 10px; }
.table-sm td { padding: 4px 8px; font-size: 11px; }

/* ==========================================================================
   07. MODALS & OVERLAYS (SAFE & SOLID: DEFAULT NONE!)
   ========================================================================== */
.modal-overlay,
.modal-overlay-blur,
#modalAbout {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 9999;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.modal-overlay.active,
.modal-overlay.open,
.modal-overlay-blur.active,
#modalAbout.active,
#modalAbout.open {
  display: flex !important;
}

.modal-card,
.modal-box {
  background: rgba(10, 16, 32, 0.95);
  border: 1px solid var(--cyan-a30);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px var(--cyan-a20);
  max-width: 680px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid var(--border-glass);
}

.modal-title {
  font-family: var(--font-display); font-size: 15px; font-weight: 700; color: #ffffff;
  display: flex; align-items: center; gap: 8px;
}

.modal-body { padding: 18px; overflow-y: auto; }
.modal-footer {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 10px; padding: 12px 18px; border-top: 1px solid var(--border-glass);
}

/* ==========================================================================
   08. TOAST NOTIFICATIONS
   ========================================================================== */
.toast-container {
  position: fixed; bottom: 24px; right: 24px; z-index: 10000;
  display: flex; flex-direction: column; gap: 10px; pointer-events: none;
}

.toast {
  pointer-events: auto;
  background: rgba(8, 14, 28, 0.95);
  backdrop-filter: blur(14px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  display: flex; align-items: center; gap: 10px;
  color: #ffffff; font-size: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  min-width: 280px; max-width: 420px;
  animation: toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast.toast-success { border-color: var(--emerald-400); box-shadow: 0 0 20px var(--emerald-a20); }
.toast.toast-error   { border-color: var(--rose-400); box-shadow: 0 0 20px var(--rose-a20); }
.toast.toast-warning { border-color: var(--amber-400); box-shadow: 0 0 20px var(--amber-a20); }
.toast.toast-info    { border-color: var(--cyan-400); box-shadow: 0 0 20px var(--cyan-a20); }

@keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ==========================================================================
   09. MAPS & LEAFLET ENGINE
   ========================================================================== */
.card.app-map-card {
  border-radius: var(--radius-md); border: 1px solid var(--border-glass);
  overflow: hidden; position: relative; background: rgba(var(--surface-card-rgb), 0.55); padding: 0;
}

.map-canvas,
.studio-map-canvas {
  width: 100%; height: 570px; min-height: 480px; background: #020617;
}

.app-map-container .leaflet-bottom.leaflet-left {
  bottom: 74px !important; left: 14px !important; z-index: 999 !important; pointer-events: none;
}

.app-map-container .leaflet-control-scale {
  pointer-events: auto; margin-bottom: 0 !important; margin-left: 0 !important;
}

.map-floating-toolbar {
  position: absolute; top: 14px; right: 14px; z-index: 800;
  display: flex; gap: 6px; background: rgba(6, 11, 25, 0.85);
  backdrop-filter: blur(12px); border: 1px solid var(--border-glass);
  padding: 4px; border-radius: var(--radius-sm);
}

.map-status-hud {
  position: absolute; bottom: 14px; right: 14px; z-index: 800;
  background: rgba(6, 11, 25, 0.85); backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass); padding: 4px 10px;
  border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);
}

/* Floating Pafta & Intersect Widgets */
.floating-pafta-widget, #cardActivePafta,
.floating-intersect-widget, #cardIntersectingPaftas {
  position: absolute !important; bottom: 16px !important; z-index: 1500 !important;
  background: rgba(var(--surface-deep-rgb), 0.94) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
  border: 1px solid var(--border-cyan-glow) !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px var(--cyan-a25) !important;
  border-radius: var(--radius-md) !important; padding: 14px 16px !important;
  max-width: calc(100% - 32px) !important; max-height: calc(100% - 32px) !important;
  overflow-y: auto !important; color: #ffffff !important;
  animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.floating-pafta-widget, #cardActivePafta { left: 16px !important; width: 370px !important; }
.floating-intersect-widget, #cardIntersectingPaftas { right: 16px !important; width: 440px !important; }

.pafta-toolbar {
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;
  background: rgba(4, 9, 24, 0.75); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 10px 16px;
}

.pafta-toolbar-title {
  font-family: var(--font-display); font-size: 13.5px; font-weight: 700; color: #ffffff;
  letter-spacing: 0.3px; white-space: nowrap;
}

.pafta-search-field { position: relative; display: flex; align-items: center; }
.pafta-search-icon { position: absolute; left: 11px; font-size: 13px; color: var(--text-dim); pointer-events: none; }
.pafta-search-input { width: 250px; padding-left: 32px; font-family: var(--font-mono); text-transform: uppercase; }

/* ==========================================================================
   10. GLASS SWITCHES, EXPORT MENUS & HELPERS
   ========================================================================== */
.switch-glass { position: relative; display: inline-block; width: 36px; height: 20px; }
.switch-glass input { opacity: 0; width: 0; height: 0; }
.switch-slider {
  position: absolute; cursor: pointer; inset: 0;
  background: rgba(255, 255, 255, 0.1); border: 1px solid var(--border-glass);
  border-radius: 20px; transition: all 0.25s ease;
}
.switch-slider:before {
  position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px;
  background: #ffffff; border-radius: 50%; transition: all 0.25s ease;
}
.switch-glass input:checked + .switch-slider {
  background: var(--cyan-500); border-color: var(--cyan-400); box-shadow: 0 0 10px var(--cyan-a40);
}
.switch-glass input:checked + .switch-slider:before { transform: translateX(16px); }

.export-menu-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 6px 10px; font-size: 11.5px; color: var(--text-main);
  background: transparent; border: none; border-radius: var(--radius-xs);
  cursor: pointer; transition: all 0.15s ease;
}
.export-menu-item:hover { background: var(--cyan-a15); color: var(--cyan-400); }

.alert-amber-banner,
.alert-cyan-banner {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  border-radius: var(--radius-sm); font-size: 12px; margin-bottom: 12px;
}
.alert-amber-banner { background: var(--amber-a10); border: 1px solid var(--amber-a35); color: #fbbf24; }
.alert-cyan-banner  { background: var(--cyan-a10); border: 1px solid var(--cyan-a35); color: var(--cyan-400); }

.divider-v-glass { width: 1px; height: 18px; background: var(--border-glass); margin: 0 4px; }
.divider-h-glass { width: 100%; height: 1px; background: var(--border-glass); margin: 8px 0; }
'''

# Now extract tab-specific sections (13 to 22) from orig, but filter out redundant button/card/input blocks!
start_idx = orig.find('/* ==========================================================================\n   13. HOME TAB')
tab_css = orig[start_idx:]

# Filter out CANONICAL duplicated chunks because they are now in 01 & 02 above!
tab_css = re.sub(r'/\* ==========================================================================\s*\n\s*CANONICAL SHARED KPI CARDS & DATA PANELS.*?(?=/\* ==========================================================================\s*\n\s*15\. RINEX TAB)', '', tab_css, flags=re.DOTALL)

# Also remove redundant button overrides from tab_css (e.g. #btnSearchPafta {...}, .pafta-scale-btn {...})
tab_css = re.sub(r'/\* Pafta Scale Buttons \*/.*?#btnToggleDom\.active \{[^}]*\}', '', tab_css, flags=re.DOTALL)
tab_css = re.sub(r'#btnSearchPafta\s*\{[^}]*\}', '', tab_css)
tab_css = re.sub(r'\.batch-textarea\s*\{[^}]*\}', '', tab_css)
tab_css = re.sub(r'\.dns-textarea\s*\{[^}]*\}', '', tab_css)
tab_css = re.sub(r'\.code-editor-textarea\s*\{[^}]*\}', '', tab_css)

final_comp_css = unified_foundation + '\n' + tab_css.strip() + '\n'

with open('web/css/components.css', 'w', encoding='utf-8') as f:
    f.write(final_comp_css)

lines = len(final_comp_css.splitlines())
print(f"components.css consolidated successfully! Total lines: {lines}")
