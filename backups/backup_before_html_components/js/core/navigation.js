/**
 * Harita Tools - Navigation, Shortcuts, Theme & Modals
 */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      const domEl = document.querySelector(".tool-tab.active");
      let v_1 = null;
      if (domEl) {
        v_1 = domEl.querySelector("input[type=\"text\"][placeholder*=\"ara\" i], input[type=\"search\"]");
      }
      if (!v_1) {
        v_1 = document.getElementById("inputSearchRtk") || document.getElementById("inputSearchGcp") || document.getElementById("txtPaftaSearchInput");
      }
      if (v_1) {
        v_1.focus();
        v_1.select();
        showToast(t("core.navigation.toastSearchFocus"), "info");
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") {
      event.preventDefault();
      const domEl = document.querySelector(".tool-tab.active");
      const v_1 = domEl ? domEl.querySelector("input[type=\"file\"]") : document.getElementById("rw5FileInput");
      if (v_1) {
        v_1.click();
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      const domEl = document.querySelector(".tool-tab.active");
      const v_1 = domEl ? domEl.querySelector("[id*=\"Print\" i]") : document.getElementById("btnPrintTg20RwReportRtk");
      if (v_1 && !v_1.disabled) {
        v_1.click();
      } else {
        window.print();
      }
    }
    if (event.key === "Escape") {
      const v_1 = document.activeElement;
      if (v_1 && v_1.tagName === "INPUT") {
        v_1.value = "";
        v_1.dispatchEvent(new Event("input"));
        v_1.blur();
        showToast(t("core.navigation.toastSearchCleared"), "info");
      }
    }
  });
}

function initThemeToggle() {
  const btnEl = document.getElementById("btnThemeToggle");
  const domEl = document.getElementById("themeIcon");
  const v_1 = localStorage.getItem("gnss_studio_theme") || "dark";
  v_2(v_1);
  if (btnEl) {
    btnEl.addEventListener("click", () => {
      const v_1_1 = document.documentElement.getAttribute("data-theme") || "dark";
      const v_2_1 = v_1_1 === "dark" ? "light" : "dark";
      v_2(v_2_1);
      localStorage.setItem("gnss_studio_theme", v_2_1);
      showToast(v_2_1 === "light" ? t("core.navigation.toastThemeLight") : t("core.navigation.toastThemeDark"), "info");
    });
  }

  const btnSidebarTheme = document.getElementById("btnSidebarThemeShortcut");
  if (btnSidebarTheme) {
    btnSidebarTheme.addEventListener("click", () => {
      btnEl?.click();
    });
  }

  // Global Keyboard Shortcuts: Ctrl+O (Dosya Aç) & Ctrl+D (Tema Değiştir)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
      e.preventDefault();
      document.getElementById("inputHomeHeroFile")?.click();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      btnEl?.click();
    }
  });

  function v_2(arg1) {
    document.documentElement.setAttribute("data-theme", arg1);
    if (domEl) {
      if (arg1 === "light") {
        domEl.className = "fa-solid fa-sun";
        domEl.style.color = "var(--amber-500)";
      } else {
        domEl.className = "fa-solid fa-moon";
        domEl.style.color = "var(--cyan-400)";
      }
    }
    const mobileThemeIcon = document.getElementById("mobileThemeIcon");
    if (mobileThemeIcon) {
      if (arg1 === "light") {
        mobileThemeIcon.className = "fa-solid fa-sun";
        mobileThemeIcon.style.color = "var(--amber-500)";
      } else {
        mobileThemeIcon.className = "fa-solid fa-moon";
        mobileThemeIcon.style.color = "var(--cyan-400)";
      }
    }
  }
}

function initMobileNavDrawer() {
  const sidebar = document.getElementById("appSidebar");
  const overlay = document.getElementById("mobileNavOverlay");
  const btnToggle = document.getElementById("btnMobileMenuToggle");
  const btnClose = document.getElementById("btnMobileSidebarClose");
  const navItems = document.querySelectorAll(".sidebar .nav-item");

  if (!sidebar) return;

  const openDrawer = () => {
    sidebar.classList.add("mobile-open");
    overlay?.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    sidebar.classList.remove("mobile-open");
    overlay?.classList.remove("active");
    document.body.style.overflow = "";
  };

  btnToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains("mobile-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  btnClose?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);

  // Close drawer upon clicking any navigation tab item on mobile
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        closeDrawer();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // Wire mobile theme toggle button
  document.getElementById("btnMobileThemeToggle")?.addEventListener("click", () => {
    document.getElementById("btnThemeToggle")?.click();
  });

  // ESC closes drawer
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("mobile-open")) {
      closeDrawer();
    }
  });

  // Auto clean up drawer state when resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && sidebar.classList.contains("mobile-open")) {
      closeDrawer();
    }
  });
}

function initAboutModal() {
  const modal = document.getElementById("modalAbout");
  if (!modal) return;
  
  const openModal = () => {
    modal.style.display = "flex";
  };
  const closeModal = () => {
    modal.style.display = "none";
  };

  document.getElementById("btnOpenAboutModal")?.addEventListener("click", openModal);
  document.getElementById("btnSidebarAbout")?.addEventListener("click", openModal);
  document.getElementById("btnCloseAboutModal")?.addEventListener("click", closeModal);
  document.getElementById("btnConfirmAboutModal")?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      closeModal();
    }
  });
}


function initNavigation() {
  const TAB_I18N_MAP = {
    "tab-home": "navigation.tabDashboard",
    "tab-cadastre": "navigation.tabRtk",
    "tab-rinex-studio": "navigation.tabRinex",
    "tab-map": "navigation.tabMap",
    "tab-geodesy": "navigation.tabGeodesy",
    "tab-tg20": "navigation.tabTg20",
    "tab-flight": "navigation.tabFlight",
    "tab-converter": "navigation.tabConverter",
    "tab-standards": "navigation.tabStandards",
    "tab-guide": "navigation.tabGuide"
  };

  // Tab-Specific Lazy-Load CSS Mapping
  const TAB_CSS_MAP = {
    "tab-cadastre": "css/tabs/tab-cadastre.css",
    "tab-rinex-studio": "css/tabs/tab-rinex.css",
    "tab-map": "css/tabs/tab-map.css",
    "tab-geodesy": "css/tabs/tab-geodesy.css",
    "tab-tg20": "css/tabs/tab-tg20.css",
    "tab-flight": "css/tabs/tab-flight.css",
    "tab-converter": "css/tabs/tab-converter.css",
    "tab-guide": "css/tabs/tab-guide.css"
  };

  const loadedTabStyles = new Set();

  function loadTabStyle(tabId) {
    const cssPath = TAB_CSS_MAP[tabId];
    if (!cssPath || loadedTabStyles.has(tabId)) return;

    if (document.querySelector(`link[href*="${cssPath}"]`)) {
      loadedTabStyles.add(tabId);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;
    link.setAttribute("data-lazy-tab", tabId);
    document.head.appendChild(link);
    loadedTabStyles.add(tabId);
  }

  // URL Hash & Parameter Slugs Mapping (Deep Linking)
  const TAB_SLUG_MAP = {
    "home": "tab-home",
    "dashboard": "tab-home",
    "anasayfa": "tab-home",

    "tg20": "tab-tg20",
    "tg-20": "tab-tg20",
    "jeoid": "tab-tg20",
    "geoid": "tab-tg20",

    "cadastre": "tab-cadastre",
    "rtk": "tab-cadastre",
    "kadastro": "tab-cadastre",
    "hamdata": "tab-cadastre",

    "rinex": "tab-rinex-studio",
    "rinex-studio": "tab-rinex-studio",
    "gnss": "tab-rinex-studio",

    "map": "tab-map",
    "pafta": "tab-map",
    "harita": "tab-map",

    "geodesy": "tab-geodesy",
    "jeodezi": "tab-geodesy",
    "donusum": "tab-geodesy",
    "helmert": "tab-geodesy",

    "flight": "tab-flight",
    "iha": "tab-flight",
    "drone": "tab-flight",
    "ucusp": "tab-flight",

    "converter": "tab-converter",
    "donusturucu": "tab-converter",
    "dxf": "tab-converter",
    "kml": "tab-converter",

    "standards": "tab-standards",
    "mevzuat": "tab-standards",
    "standartlar": "tab-standards",

    "guide": "tab-guide",
    "rehber": "tab-guide",
    "kilavuz": "tab-guide"
  };

  const TAB_DEFAULT_SLUG = {
    "tab-home": "home",
    "tab-cadastre": "rtk",
    "tab-rinex-studio": "rinex",
    "tab-map": "map",
    "tab-geodesy": "geodesy",
    "tab-tg20": "tg20",
    "tab-flight": "flight",
    "tab-converter": "converter",
    "tab-standards": "standards",
    "tab-guide": "guide"
  };

  const activateSubtab = (tabId, subtabSlug) => {
    if (!subtabSlug) return;
    const sub = subtabSlug.toLowerCase().trim();

    if (tabId === "tab-tg20") {
      setTimeout(() => {
        if (["map", "harita"].includes(sub)) {
          document.getElementById("btnTg20SubtabMap")?.click();
        } else if (["batch", "toplu"].includes(sub)) {
          document.getElementById("btnTg20SubtabBatch")?.click();
        } else if (["single", "tek"].includes(sub)) {
          document.getElementById("btnTg20SubtabSingle")?.click();
        } else if (["tech", "teknik"].includes(sub)) {
          document.getElementById("btnTg20SubtabTech")?.click();
        }
      }, 150);
    } else if (tabId === "tab-cadastre") {
      setTimeout(() => {
        if (["map", "harita", "view"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-view"]')?.click();
        } else if (["table", "tablo", "rtk"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-table"]')?.click();
        } else if (["matched", "cift", "dual"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-matched"]')?.click();
        } else if (["coords", "koordinat", "coordinate"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-coordinate"]')?.click();
        } else if (["upload", "yukle"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-upload"]')?.click();
        }
      }, 150);
    }
  };

  const resolveTabFromUrl = () => {
    // 1. Query Parametreleri Kontrolü: ?tab=tg20 veya ?module=tg20
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const param = urlParams.get("module") || urlParams.get("modul") || urlParams.get("tab");
      if (param) {
        const clean = param.toLowerCase().trim();
        if (TAB_SLUG_MAP[clean]) {
          return { tabId: TAB_SLUG_MAP[clean], subtab: urlParams.get("sub") || null };
        }
      }
    } catch (e) {}

    // 2. URL Hash Kontrolü: #tg20 veya #tg20/map
    let hash = window.location.hash || "";
    if (hash.startsWith("#")) {
      hash = hash.substring(1);
    }
    hash = hash.trim().toLowerCase();
    if (!hash) return null;

    const parts = hash.split("/");
    const primary = parts[0];
    const sub = parts[1] || null;

    if (TAB_SLUG_MAP[primary]) {
      return { tabId: TAB_SLUG_MAP[primary], subtab: sub };
    }
    if (document.getElementById(primary)) {
      return { tabId: primary, subtab: sub };
    }
    if (document.getElementById(`tab-${primary}`)) {
      return { tabId: `tab-${primary}`, subtab: sub };
    }

    return null;
  };

  const switchTab = (arg1, updateHash = true, subtab = null) => {
    // Lazy-load the tab's stylesheet if not already loaded
    loadTabStyle(arg1);

    elements.navItems.forEach(item => {
      if (item.getAttribute("data-tab") === arg1) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
    elements.toolTabs.forEach(item => item.classList.remove("active"));
    const domEl = document.getElementById(arg1);
    if (domEl) {
      domEl.classList.add("active");
      const i18nKey = TAB_I18N_MAP[arg1];
      if (i18nKey && typeof window.t === "function") {
        if (elements.pageTitle) elements.pageTitle.textContent = window.t(`${i18nKey}.title`);
        if (elements.pageSubtitle) elements.pageSubtitle.textContent = window.t(`${i18nKey}.sub`);
      }

      // Modül içi özel tetikleyiciler
      if (arg1 === "tab-map") {
        setTimeout(initMap, 200);
      }
      if (arg1 === "tab-flight") {
        setTimeout(() => { if (typeof initFlightPlannerStudio === "function") initFlightPlannerStudio(); }, 200);
      }
      if (arg1 === "tab-tg20") {
        setTimeout(() => { if (typeof initTg20InteractiveMap === "function") initTg20InteractiveMap(); }, 200);
      }
      if (arg1 === "tab-converter") {
        setTimeout(() => {
          if (typeof window.initConverterMap === "function") {
            window.initConverterMap();
          }
          if (state.converterMap) {
            state.converterMap.invalidateSize();
          }
        }, 200);
      }

      // Alt sekme varsa aktive et
      if (subtab) {
        activateSubtab(arg1, subtab);
      }

      // URL Hash güncellemesi (Sayfa yenilenmeden / zıplamadan doğrudan linklenebilir)
      if (updateHash) {
        const slug = TAB_DEFAULT_SLUG[arg1] || arg1.replace("tab-", "");
        let newHash = `#${slug}`;
        if (subtab) newHash += `/${subtab}`;
        if (window.location.hash !== newHash) {
          try {
            history.replaceState(null, "", newHash);
          } catch (e) {
            window.location.hash = newHash;
          }
        }
      }
    }
  };

  // Global Dışa Aktarım
  window.switchStudioTab = switchTab;

  elements.navItems.forEach(item => {
    item.addEventListener("click", () => {
      const v_1_1 = item.getAttribute("data-tab");
      switchTab(v_1_1, true);
    });
  });

  document.querySelectorAll(".bento-card[data-launch-tab]").forEach(item => {
    item.addEventListener("click", () => {
      const v_1_1 = item.getAttribute("data-launch-tab");
      if (v_1_1) {
        switchTab(v_1_1, true);
        const modTitle = TAB_I18N_MAP[v_1_1] ? t(`${TAB_I18N_MAP[v_1_1]}.title`) : v_1_1;
        logMessage(t("core.navigation.logModuleSwitched", { module: modTitle }));
      }
    });
  });

  document.querySelector(".brand")?.addEventListener("click", () => {
    switchTab("tab-home", true);
  });

  // Tarayıcı İleri / Geri & Hash Değişimi Dinleyicileri
  window.addEventListener("hashchange", () => {
    const route = resolveTabFromUrl();
    if (route && route.tabId) {
      switchTab(route.tabId, false, route.subtab);
    }
  });

  window.addEventListener("popstate", () => {
    const route = resolveTabFromUrl();
    if (route && route.tabId) {
      switchTab(route.tabId, false, route.subtab);
    }
  });

  // Sayfa Açılışında URL Parametre / Hash Kontrolü
  const initialRoute = resolveTabFromUrl();
  if (initialRoute && initialRoute.tabId) {
    switchTab(initialRoute.tabId, false, initialRoute.subtab);
  }
  const inputEl = document.getElementById("inputHomeHeroFile");
  if (inputEl) {
    inputEl.addEventListener("change", async event => {
      const v_1_1 = event.target.files?.[0];
      if (!v_1_1) {
        return;
      }
      const v_2 = v_1_1.name.split(".").pop().toLowerCase();
      const v_3 = await v_1_1.slice(0, 1500).text();
      if (["rw5", "raw", "csv", "jxl", "dat"].includes(v_2) || v_3.includes("GPS,PN") || v_3.includes("EP,PN")) {
        switchTab("tab-cadastre", true);
        const v_1_2 = new DataTransfer();
        v_1_2.items.add(v_1_1);
        if (elements.rw5FileInput) {
          elements.rw5FileInput.files = v_1_2.files;
          elements.rw5FileInput.dispatchEvent(new Event("change"));
        }
        showToast(t("core.navigation.toastRoutedRtk", { name: v_1_1.name }), "success");
      } else if (["o", "rnx", "crx", "obs", "nav", "26o", "25o", "24o"].some(item => v_2.includes(item) || v_2.endsWith("o") || v_2.endsWith("d"))) {
        switchTab("tab-rinex-studio", true);
        showToast(t("core.navigation.toastRoutedRinex", { name: v_1_1.name }), "info");
      } else if (["dxf", "kml", "kmz", "geojson"].includes(v_2)) {
        switchTab("tab-converter", true);
        const dt = new DataTransfer();
        dt.items.add(v_1_1);
        const inputConv = document.getElementById("inputConverterFile");
        if (inputConv) {
          inputConv.files = dt.files;
          inputConv.dispatchEvent(new Event("change"));
        }
        showToast(t("core.navigation.toastRoutedConverter", { name: v_1_1.name }), "success");
      } else if (["dns", "ncn", "txt", "xyz"].includes(v_2)) {
        switchTab("tab-geodesy", true);
        showToast(t("core.navigation.toastRoutedGeodesy", { name: v_1_1.name }), "info");
      } else {
        switchTab("tab-cadastre", true);
      }
    });
  }

  document.addEventListener("i18n:ready", () => {
    const activeItem = document.querySelector(".nav-item.active");
    const activeTab = activeItem ? activeItem.getAttribute("data-tab") : "tab-home";
    if (activeTab && TAB_I18N_MAP[activeTab]) {
      switchTab(activeTab, false);
    }
  });
}
