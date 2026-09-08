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
}
