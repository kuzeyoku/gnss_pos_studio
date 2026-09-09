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
  v_2("dark");
  localStorage.setItem("gnss_studio_theme", "dark");
  if (btnEl) {
    btnEl.addEventListener("click", () => {
      showToast("Karanlık tema varsayılandır (Açık tema geliştirme aşamasındadır)", "info");
    });
  }

  const btnSidebarTheme = document.getElementById("btnSidebarThemeShortcut");
  if (btnSidebarTheme) {
    btnSidebarTheme.addEventListener("click", () => {
      showToast("Karanlık tema varsayılandır (Açık tema geliştirme aşamasındadır)", "info");
    });
  }

  // Global Keyboard Shortcuts: Ctrl+O (Dosya Aç) & Ctrl+D (Tema Değiştir)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
      e.preventDefault();
      document.getElementById("inputHomeHeroFile")?.click();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      showToast("Karanlık tema varsayılandır (Açık tema geliştirme aşamasındadır)", "info");
    }
  });

  function v_2(arg1) {
    document.documentElement.setAttribute("data-theme", "dark");
    if (domEl) {
      domEl.className = "fa-solid fa-moon";
      domEl.style.color = "var(--cyan-400)";
    }
    const mobileThemeIcon = document.getElementById("mobileThemeIcon");
    if (mobileThemeIcon) {
      mobileThemeIcon.className = "fa-solid fa-moon";
      mobileThemeIcon.style.color = "var(--cyan-400)";
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
    "tab-tools": "navigation.tabTools",
    "tab-tg20": "navigation.tabTg20",
    "tab-flight": "navigation.tabFlight",
    "tab-converter": "navigation.tabConverter",
    "tab-guide": "navigation.tabGuide"
  };

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

    "tools": "tab-tools",
    "hesap": "tab-tools",
    "hesaplama": "tab-tools",
    "calc": "tab-tools",
    "calculator": "tab-tools",
    "mesafe": "tab-tools",
    "alan": "tab-tools",

    "flight": "tab-flight",
    "iha": "tab-flight",
    "drone": "tab-flight",
    "ucusp": "tab-flight",

    "converter": "tab-converter",
    "donusturucu": "tab-converter",
    "dxf": "tab-converter",
    "kml": "tab-converter",

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
    "tab-tools": "tools",
    "tab-tg20": "tg20",
    "tab-flight": "flight",
    "tab-converter": "converter",
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
    } else if (tabId === "tab-tools") {
      setTimeout(() => {
        if (["inv", "ters", "distance", "mesafe", "azimut"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-tools-inv"]')?.click();
        } else if (["dir", "duz", "direct", "temel1"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-tools-dir"]')?.click();
        } else if (["area", "alan", "gauss", "cevre", "shoelace"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-tools-area"]')?.click();
        } else if (["polar", "kutupsal", "aplikasyon", "aci", "angle"].includes(sub)) {
          document.querySelector('[data-subtab="subtab-tools-polar"]')?.click();
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
    const navItems = document.querySelectorAll(".sidebar .nav-item, .nav-item");
    navItems.forEach(item => {
      if (item.getAttribute("data-tab") === arg1) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    const toolTabs = document.querySelectorAll(".tool-tab");
    toolTabs.forEach(item => item.classList.remove("active"));
    const domEl = document.getElementById(arg1);
    if (domEl) {
      domEl.classList.add("active");
      const i18nKey = TAB_I18N_MAP[arg1];
      if (i18nKey && typeof window.t === "function") {
        const pageTitle = document.getElementById("pageTitle");
        const pageSubtitle = document.getElementById("pageSubtitle");
        if (pageTitle) pageTitle.textContent = window.t(`${i18nKey}.title`);
        if (pageSubtitle) pageSubtitle.textContent = window.t(`${i18nKey}.sub`);
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

  const bindNavEvents = () => {
    const navItems = document.querySelectorAll(".sidebar .nav-item, .nav-item");
    navItems.forEach(item => {
      if (item.dataset.navBound === "true") return;
      item.dataset.navBound = "true";
      item.addEventListener("click", () => {
        const tabId = item.getAttribute("data-tab");
        if (tabId) {
          switchTab(tabId, true);
        }
      });
    });

    document.querySelectorAll(".bento-card[data-launch-tab]").forEach(item => {
      if (item.dataset.launchBound === "true") return;
      item.dataset.launchBound = "true";
      item.addEventListener("click", () => {
        const tabId = item.getAttribute("data-launch-tab");
        if (tabId) {
          switchTab(tabId, true);
          const modTitle = TAB_I18N_MAP[tabId] ? (typeof t === "function" ? t(`${TAB_I18N_MAP[tabId]}.title`) : tabId) : tabId;
          if (typeof logMessage === "function") {
            logMessage(typeof t === "function" ? t("core.navigation.logModuleSwitched", { module: modTitle }) : `Modül: ${modTitle}`);
          }
        }
      });
    });

    document.querySelectorAll(".brand").forEach(brandEl => {
      if (brandEl.dataset.brandBound === "true") return;
      brandEl.dataset.brandBound = "true";
      brandEl.addEventListener("click", () => {
        switchTab("tab-home", true);
      });
    });
  };

  bindNavEvents();

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
  const heroDrop = document.getElementById("homeHeroDropzone");
  const inputEl = document.getElementById("inputHomeHeroFile");
  if (heroDrop && window.setupStudioDropzone) {
    window.setupStudioDropzone(heroDrop, inputEl, (files) => {
      if (window.routeAndHandleStudioFiles) {
        window.routeAndHandleStudioFiles(files);
      }
    }, { multiple: true });
  } else if (inputEl) {
    inputEl.addEventListener("change", async (event) => {
      if (window.routeAndHandleStudioFiles) {
        window.routeAndHandleStudioFiles(event.target.files);
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
