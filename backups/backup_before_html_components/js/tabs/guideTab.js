/**
 * Harita Tools - Standards Library & User Guide Controller
 */
let cachedStandardsCatalog = null;

async function loadStandardsCatalog() {
  if (cachedStandardsCatalog) return cachedStandardsCatalog;
  try {
    const basePath = (typeof window !== "undefined" && window.location.pathname)
      ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
      : '';
    const res = await fetch(`${basePath}data/standards_catalog.json?v=${Date.now()}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.documents) {
        cachedStandardsCatalog = json.documents;
      }
    }
  } catch (err) {
    console.warn("Standartlar kataloğu (data/standards_catalog.json) yüklenemedi:", err);
  }
  return cachedStandardsCatalog || {};
}

function initStandardsLibrary() {
  const docsCatalog = cachedStandardsCatalog || {};

  const docItems = document.querySelectorAll(".standards-doc-item");
  const filterChips = document.querySelectorAll(".standards-chip");
  const searchInput = document.getElementById("inputStandardsSearch");
  const docTitleEl = document.getElementById("standardsCurrentDocTitle");
  const docSubEl = document.getElementById("standardsCurrentDocSub");
  const docIconEl = document.getElementById("standardsDocIcon");
  const pdfFrame = document.getElementById("standardsPdfFrame");
  const btnDownload = document.getElementById("btnStandardsDownload");
  const btnOpenNewTab = document.getElementById("btnStandardsOpenNewTab");
  const btnFullscreen = document.getElementById("btnStandardsFullscreen");
  const viewerPane = document.querySelector(".standards-viewer-pane");

  function selectDoc(docId) {
    const doc = docsCatalog[docId];
    if (!doc) return;

    docItems.forEach(item => {
      if (item.getAttribute("data-doc-id") === docId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    if (docTitleEl) docTitleEl.textContent = doc.title;
    if (docSubEl) docSubEl.textContent = doc.sub;
    if (docIconEl) {
      docIconEl.className = doc.icon + " " + doc.iconColor;
    }
    if (pdfFrame) {
      pdfFrame.src = doc.pdfUrl;
    }
    if (btnDownload) {
      btnDownload.href = doc.pdfUrl;
      btnDownload.innerHTML = '<i class="fa-solid fa-file-pdf"></i> <span>' + t("guide.btnDownloadPdf") + '</span>';
    }
    if (btnOpenNewTab) {
      btnOpenNewTab.href = doc.portalUrl;
    }
  }

  docItems.forEach(item => {
    item.addEventListener("click", () => {
      const docId = item.getAttribute("data-doc-id");
      selectDoc(docId);
    });
  });

  // Initial populate with bohhbuy
  selectDoc("bohhbuy");

  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const filterVal = chip.getAttribute("data-standards-filter");
      const q = searchInput ? searchInput.value.trim().toLowerCase() : "";

      docItems.forEach(item => {
        const cat = item.getAttribute("data-doc-cat") || "";
        const text = item.textContent.toLowerCase();
        const matchCat = filterVal === "all" || filterVal === cat;
        const matchQuery = !q || text.includes(q);

        if (matchCat && matchQuery) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      const activeChip = document.querySelector(".standards-chip.active");
      const filterVal = activeChip ? activeChip.getAttribute("data-standards-filter") : "all";

      docItems.forEach(item => {
        const cat = item.getAttribute("data-doc-cat") || "";
        const text = item.textContent.toLowerCase();
        const matchCat = filterVal === "all" || filterVal === cat;
        const matchQuery = !q || text.includes(q);

        if (matchCat && matchQuery) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  }

  if (btnFullscreen && viewerPane) {
    btnFullscreen.addEventListener("click", () => {
      viewerPane.classList.toggle("standards-viewer-fullscreen");
      const isFull = viewerPane.classList.contains("standards-viewer-fullscreen");
      btnFullscreen.innerHTML = isFull ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
    });
  }

  window.selectStandardsDoc = selectDoc;
}

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
    copyToClipboard(clauseText, "📋 " + (clauseTitle || "Mevzuat standardı") + " panoya kopyalandı!");
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
