/**
 * Harita Tools - User Guide & Help Center Controller
 */


function initGuideSearchAndFilter() {
  const inputSearch = document.getElementById("inputGuideSearch");
  const btnClearSearch = document.getElementById("btnClearGuideSearch");
  const filterChips = document.querySelectorAll(".guide-filter-chip");
  const moduleCards = document.querySelectorAll("#guideModulesGrid .guide-card-box");
  const standardsBento = document.querySelectorAll(".guide-standards-bento");
  const faqItems = document.querySelectorAll(".guide-faq-item");
  const sectionHeadings = document.querySelectorAll(".guide-section-heading");

  // Global Tab Switcher helper
  window.launchGuideTab = (tabId) => {
    const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navItem) {
      navItem.click();
    }
  };

  // Filter Chips Logic
  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const filterVal = chip.getAttribute("data-guide-filter");
      applyGuideFilter(filterVal, inputSearch ? inputSearch.value.trim() : "");
    });
  });

  // Search Input Logic
  if (inputSearch) {
    inputSearch.addEventListener("input", () => {
      const q = inputSearch.value.trim();
      if (btnClearSearch) {
        if (q.length > 0) {
          btnClearSearch.classList.remove("d-none");
        } else {
          btnClearSearch.classList.add("d-none");
        }
      }
      const activeChip = document.querySelector(".guide-filter-chip.active");
      const activeFilter = activeChip ? activeChip.getAttribute("data-guide-filter") : "all";
      applyGuideFilter(activeFilter, q);
    });

    if (btnClearSearch) {
      btnClearSearch.addEventListener("click", () => {
        inputSearch.value = "";
        btnClearSearch.classList.add("d-none");
        const activeChip = document.querySelector(".guide-filter-chip.active");
        const activeFilter = activeChip ? activeChip.getAttribute("data-guide-filter") : "all";
        applyGuideFilter(activeFilter, "");
      });
    }
  }

  // Global Copy Legislation Clause to Clipboard Helper
  window.copyLegislationClause = function(clauseText, clauseTitle) {
    if (!clauseText) return;
    const title = clauseTitle || t("guide.defaultClauseTitle", "Mevzuat standardı");
    copyToClipboard(clauseText, t("guide.toastCopied", { title }));
  };

  // Filter and Search Evaluation
  function applyGuideFilter(filterCategory, searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    const legislationCards = document.querySelectorAll(".legislation-card");

    // 1. Module Cards
    moduleCards.forEach(card => {
      const cat = card.getAttribute("data-guide-category") || "";
      const text = card.textContent.toLowerCase();
      const matchCat = filterCategory === "all" || filterCategory === "modules" || filterCategory === cat;
      const matchQuery = !queryLower || text.includes(queryLower);

      if (matchCat && matchQuery) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });

    // 2. Legislation / Standards Cards (MAPEG, BÖHHBÜY, TKGM, HGM, DSİ, İLBANK)
    legislationCards.forEach(card => {
      const cat = card.getAttribute("data-legislation-cat") || "";
      const text = card.textContent.toLowerCase();
      const matchCat = filterCategory === "all" || filterCategory === "standards" || filterCategory === cat;
      const matchQuery = !queryLower || text.includes(queryLower);

      if (matchCat && matchQuery) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });

    // 3. Standards & Formulas
    standardsBento.forEach(bento => {
      const cat = bento.getAttribute("data-guide-category") || "standards";
      const text = bento.textContent.toLowerCase();
      const matchCat = filterCategory === "all" || filterCategory === "standards" || filterCategory === "bohhbuy";
      const matchQuery = !queryLower || text.includes(queryLower);

      if (matchCat && matchQuery) {
        bento.style.display = "grid";
      } else {
        bento.style.display = "none";
      }
    });

    // 4. FAQ Accordion Items
    faqItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const matchCat = filterCategory === "all" || filterCategory === "faq";
      const matchQuery = !queryLower || text.includes(queryLower);

      if (matchCat && matchQuery) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });

    // 5. Section Headings
    sectionHeadings.forEach(heading => {
      const cat = heading.getAttribute("data-guide-category") || "";
      if (filterCategory === "all") {
        heading.style.display = "flex";
      } else if (cat && (cat === filterCategory || (filterCategory === "standards" && cat === "standards") || (filterCategory === "mapeg" && cat === "standards") || (filterCategory === "bohhbuy" && cat === "standards") || (filterCategory === "tkgm" && cat === "standards") || (filterCategory === "hgm" && cat === "standards") || (filterCategory === "dsi" && cat === "standards") || (filterCategory === "ilbank" && cat === "standards"))) {
        heading.style.display = "flex";
      } else if (!cat && (filterCategory === "modules" || filterCategory === "cadastre" || filterCategory === "rinex" || filterCategory === "map" || filterCategory === "geodesy" || filterCategory === "flight" || filterCategory === "tg20")) {
        heading.style.display = "flex";
      } else {
        heading.style.display = "none";
      }
    });
  }

  // FAQ Accordion Click Handler
  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".guide-faq-question");
    if (questionBtn) {
      questionBtn.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        faqItems.forEach(other => other.classList.remove("active"));
        if (!isActive) {
          item.classList.add("active");
        }
      });
    }
  });

  // PDF Export / Print Logic
  const btnExportPdf = document.getElementById("btnExportGuidePdf");
  if (btnExportPdf) {
    btnExportPdf.addEventListener("click", () => {
      exportGuideToPdf();
    });
  }

  function exportGuideToPdf() {
    const activeChip = document.querySelector(".guide-filter-chip.active");
    const activeFilterText = activeChip ? activeChip.textContent.trim() : "Tümü";
    const dateStr = new Date().toLocaleDateString("tr-TR");

    const printDoc = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Harita Tools GNSS Pos Studio - Mühendislik ve Kullanım Kılavuzu</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 12mm 15mm 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #fff;
      margin: 0;
      padding: 0;
      font-size: 10.5pt;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-title { font-size: 16pt; font-weight: 800; color: #0369a1; margin: 0 0 4px 0; }
    .header-sub { font-size: 9.5pt; color: #64748b; margin: 0; }
    .header-meta { text-align: right; font-size: 8.5pt; color: #475569; }
    .header-meta strong { color: #0f172a; }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      background: #f1f5f9;
      padding: 6px 12px;
      border-left: 4px solid #0284c7;
      margin: 20px 0 10px 0;
      page-break-after: avoid;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
      background: #fff;
      page-break-inside: avoid;
    }
    .card h4 { margin: 0 0 6px 0; font-size: 10.5pt; color: #0f172a; }
    .card p { margin: 0 0 4px 0; font-size: 9pt; color: #334155; }
    .badge {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e0f2fe;
      color: #0369a1;
      margin-right: 6px;
    }
    .formula-math {
      font-family: "Courier New", Courier, monospace;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 10px;
      margin: 6px 0;
      font-size: 8.5pt;
      color: #0f172a;
    }
    code { font-family: monospace; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 8.5pt; }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      font-size: 8pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="header-title">HARİTA TOOLS — GNSS POS WEB STUDIO</h1>
      <p class="header-sub">Jeodezi & Saha Mühendislik Standartları ve Kullanım Kılavuzu (v2.4)</p>
    </div>
    <div class="header-meta">
      <div><strong>Tarih:</strong> ${dateStr}</div>
      <div><strong>Kapsam:</strong> ${activeFilterText}</div>
      <div><strong>Mevzuat:</strong> BÖHHBÜY / TKGM Standartları</div>
    </div>
  </div>

  <div id="content">
    ${getPrintableGuideContent()}
  </div>

  <div class="footer">
    <span>Harita Tools GNSS POS Web Studio — Lisanslı Mühendislik Yazılımı</span>
    <span>Resmi Dokümantasyon Çıktısı</span>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 250);
    });
  <\/script>
</body>
</html>`;

    const printWin = window.open("", "_blank", "width=950,height=750");
    if (printWin) {
      printWin.document.write(printDoc);
      printWin.document.close();
      if (typeof window.logMessage === "function") {
        window.logMessage("📄 Kılavuz PDF / Yazdırma penceresi açıldı.");
      }
      if (typeof window.showToast === "function") {
        window.showToast("📄 Kılavuz PDF yazdırma penceresi hazırlandı.", "success");
      }
    } else {
      if (typeof window.showToast === "function") {
        window.showToast("⚠️ Yazdırma penceresi tarayıcı tarafından engellendi.", "warning");
      }
    }
  }

  function getPrintableGuideContent() {
    let html = "";
    
    // 1. Visible Module Cards
    const visibleCards = Array.from(moduleCards).filter(c => c.style.display !== "none");
    if (visibleCards.length > 0) {
      html += `<div class="section-title">1. Mühendislik Modülleri ve İş Akışları</div>`;
      visibleCards.forEach(c => {
        const title = c.querySelector("h4")?.textContent || "";
        const sub = c.querySelector(".guide-card-head span")?.textContent || "";
        const rows = Array.from(c.querySelectorAll(".guide-feature-row")).map(r => {
          const badge = r.querySelector(".guide-feature-badge")?.textContent || "";
          const p = r.querySelector("p")?.innerHTML || "";
          return `<div><span class="badge">${badge}</span> ${p}</div>`;
        }).join("");
        html += `<div class="card"><h4>${title} ${sub ? `— <small style="color:#64748b;">${sub}</small>` : ''}</h4>${rows}</div>`;
      });
    }

    // 2. Visible Standards & Legislation Cards
    const visibleLegislation = Array.from(document.querySelectorAll(".legislation-card")).filter(c => c.style.display !== "none");
    if (visibleLegislation.length > 0) {
      html += `<div class="section-title">2. Mevzuat, Tolerans ve Standartlar</div>`;
      visibleLegislation.forEach(c => {
        const title = c.querySelector("h4, h5, .legislation-title")?.textContent || "";
        const body = c.querySelector(".legislation-body, p")?.innerHTML || c.innerHTML;
        html += `<div class="card"><h4>${title}</h4><div>${body}</div></div>`;
      });
    }

    // 3. Visible Bento Standards
    const visibleBento = Array.from(standardsBento).filter(b => b.style.display !== "none");
    if (visibleBento.length > 0) {
      visibleBento.forEach(b => {
        const cards = Array.from(b.querySelectorAll(".bento-card, .card")).map(c => `<div class="card">${c.innerHTML}</div>`).join("");
        html += cards;
      });
    }

    // 4. Visible FAQ
    const visibleFaq = Array.from(faqItems).filter(f => f.style.display !== "none");
    if (visibleFaq.length > 0) {
      html += `<div class="section-title">3. Sıkça Sorulan Sorular ve Saha İpuçları</div>`;
      visibleFaq.forEach(f => {
        const q = f.querySelector(".guide-faq-question")?.textContent || "";
        const a = f.querySelector(".guide-faq-answer")?.innerHTML || "";
        html += `<div class="card"><h4>❓ ${q}</h4><p>${a}</p></div>`;
      });
    }

    return html || "<p>Görüntülenecek içerik bulunamadı.</p>";
  }
}
