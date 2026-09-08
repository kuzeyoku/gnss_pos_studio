/**
 * =========================================================================================
 *  HARİTA TOOLS - JEODEZİK HESAPLAMA ARAÇLARI KONTROLCÜSÜ (toolsTab.js)
 * =========================================================================================
 *  1. Mesafe & Azimut Hesabı (2. Temel Ödev - Vincenty Elipsoit & Projeksiyon Grid)
 *  2. Düz Jeodezi Problemi (1. Temel Ödev - Direct Geodesy Problem)
 *  3. Gauss (Shoelace) Poligon Alanı, Çevre ve Ağırlık Merkezi (Centroid) Hesabı
 *  4. Kutupsal Alım & Aplikasyon Hesabı (Duran, Bakılan Nokta, Kırılma Açısı, Mesafe)
 *  5. Hassas Açı Birimi Dönüştürücü (DMS <-> DD <-> GRAD <-> RAD)
 * =========================================================================================
 */

function initToolsTab() {
  const geoEngine = (typeof state !== "undefined" && state.geodesyEngine) 
    ? state.geodesyEngine 
    : (window.GeodesyEngine ? new window.GeodesyEngine() : null);

  // Helper safe translation
  const tr = (key, fallback = "") => {
    return (window.i18n && typeof window.i18n.t === "function") 
      ? window.i18n.t(key, fallback) 
      : fallback;
  };

  const copyToClipboard = (text, successMsg) => {
    if (!text || !text.trim()) {
      if (typeof showToast === "function") showToast(tr("common.copyEmpty", "Kopyalanacak veri yok."), "warning");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === "function") showToast(successMsg || tr("common.copySuccess", "Panoya kopyalandı."), "success");
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  };

  const fallbackCopy = (text, successMsg) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      if (typeof showToast === "function") showToast(successMsg || tr("common.copySuccess", "Panoya kopyalandı."), "success");
    } catch (e) {
      if (typeof showToast === "function") showToast("Kopyalama başarısız.", "error");
    }
    document.body.removeChild(ta);
  };

  const parseCoordInput = (val) => {
    if (!val) return NaN;
    const str = String(val).trim();
    if (/[°'"″′]/.test(str)) {
      if (geoEngine && typeof geoEngine.dmsToDec === "function") {
        const dmsRes = geoEngine.dmsToDec(str);
        if (dmsRes !== null) return dmsRes;
      }
    }
    return parseFloat(str);
  };

  // =========================================================================
  // SUBTAB SWITCHING
  // =========================================================================
  const subBtns = document.querySelectorAll(".tools-subtab-btn");
  const subPanes = document.querySelectorAll(".tools-subtab-pane");

  subBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-subtab");
      subBtns.forEach(b => {
        b.classList.remove("btn-primary", "active");
        b.classList.add("btn-secondary");
      });
      subPanes.forEach(p => {
        p.classList.remove("active");
        p.style.display = "none";
      });

      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-primary", "active");

      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
        targetPane.style.display = "block";
      }
    });
  });

  // =========================================================================
  // SUBTAB 1: MESAFE & AZİMUT (TERS ÖDEV)
  // =========================================================================
  const selDistType = document.getElementById("toolsSelDistType");
  const selDistEllipsoid = document.getElementById("toolsSelDistEllipsoid");
  const btnLoadDistSample = document.getElementById("toolsBtnLoadDistSample");
  const btnCalcDistAzimuth = document.getElementById("toolsBtnCalcDistAzimuth");
  const btnCopyDistResult = document.getElementById("toolsBtnCopyDistResult");
  const distResultBox = document.getElementById("toolsDistResultBox");

  const distP1C1 = document.getElementById("toolsDistP1C1");
  const distP1C2 = document.getElementById("toolsDistP1C2");
  const distP1C3 = document.getElementById("toolsDistP1C3");
  const distP2C1 = document.getElementById("toolsDistP2C1");
  const distP2C2 = document.getElementById("toolsDistP2C2");
  const distP2C3 = document.getElementById("toolsDistP2C3");

  const lblDistP1C1 = document.getElementById("toolsLblDistP1C1");
  const lblDistP1C2 = document.getElementById("toolsLblDistP1C2");
  const lblDistP1C3 = document.getElementById("toolsLblDistP1C3");
  const lblDistP2C1 = document.getElementById("toolsLblDistP2C1");
  const lblDistP2C2 = document.getElementById("toolsLblDistP2C2");
  const lblDistP2C3 = document.getElementById("toolsLblDistP2C3");

  const updateDistLabels = () => {
    const isGeo = selDistType?.value === "GEO";
    if (isGeo) {
      if (lblDistP1C1) lblDistP1C1.textContent = "Enlem (Lat / DD):";
      if (lblDistP1C2) lblDistP1C2.textContent = "Boylam (Lon / DD):";
      if (lblDistP1C3) lblDistP1C3.textContent = "Elipsoit Kotu (h / m):";
      if (lblDistP2C1) lblDistP2C1.textContent = "Enlem (Lat / DD):";
      if (lblDistP2C2) lblDistP2C2.textContent = "Boylam (Lon / DD):";
      if (lblDistP2C3) lblDistP2C3.textContent = "Elipsoit Kotu (h / m):";
      if (selDistEllipsoid) selDistEllipsoid.style.display = "inline-block";
      if (btnLoadDistSample) btnLoadDistSample.innerHTML = `<i class="fa-solid fa-flask text-cyan"></i> <span>Örnek Yükle (Ankara ➔ İstanbul)</span>`;
    } else {
      if (lblDistP1C1) lblDistP1C1.textContent = "Sağa Değer (Y / m):";
      if (lblDistP1C2) lblDistP1C2.textContent = "Yukarı Değer (X / m):";
      if (lblDistP1C3) lblDistP1C3.textContent = "Kot / Z (m):";
      if (lblDistP2C1) lblDistP2C1.textContent = "Sağa Değer (Y / m):";
      if (lblDistP2C2) lblDistP2C2.textContent = "Yukarı Değer (X / m):";
      if (lblDistP2C3) lblDistP2C3.textContent = "Kot / Z (m):";
      if (selDistEllipsoid) selDistEllipsoid.style.display = "none";
      if (btnLoadDistSample) btnLoadDistSample.innerHTML = `<i class="fa-solid fa-flask text-emerald"></i> <span>Örnek Yükle (Grid Noktaları)</span>`;
    }
  };

  selDistType?.addEventListener("change", updateDistLabels);

  btnLoadDistSample?.addEventListener("click", () => {
    const isGeo = selDistType?.value === "GEO";
    if (isGeo) {
      if (distP1C1) distP1C1.value = "39.920770";
      if (distP1C2) distP1C2.value = "32.854110";
      if (distP1C3) distP1C3.value = "985.000";
      if (distP2C1) distP2C1.value = "41.008240";
      if (distP2C2) distP2C2.value = "28.978360";
      if (distP2C3) distP2C3.value = "45.000";
      if (typeof showToast === "function") showToast("🧪 Örnek coğrafi noktalar yüklendi (Ankara ➔ İstanbul).", "info");
    } else {
      if (distP1C1) distP1C1.value = "500120.000";
      if (distP1C2) distP1C2.value = "4520100.000";
      if (distP1C3) distP1C3.value = "125.400";
      if (distP2C1) distP2C1.value = "501370.000";
      if (distP2C2) distP2C2.value = "4521655.000";
      if (distP2C3) distP2C3.value = "141.200";
      if (typeof showToast === "function") showToast("🧪 Örnek grid noktaları yüklendi.", "info");
    }
  });

  btnCalcDistAzimuth?.addEventListener("click", () => {
    if (!geoEngine) return;
    const isGeo = selDistType?.value === "GEO";
    const c1_1 = parseCoordInput(distP1C1?.value);
    const c1_2 = parseCoordInput(distP1C2?.value);
    const c1_3 = parseFloat(distP1C3?.value) || 0;
    const c2_1 = parseCoordInput(distP2C1?.value);
    const c2_2 = parseCoordInput(distP2C2?.value);
    const c2_3 = parseFloat(distP2C3?.value) || 0;

    if (isNaN(c1_1) || isNaN(c1_2) || isNaN(c2_1) || isNaN(c2_2)) {
      if (typeof showToast === "function") showToast("Lütfen geçerli başlangıç ve hedef koordinatları giriniz.", "warning");
      return;
    }

    if (isGeo) {
      const ellipsoid = selDistEllipsoid?.value || "GRS80";
      const res = geoEngine.vincentyInverse(c1_1, c1_2, c2_1, c2_2, ellipsoid);
      if (!res) {
        if (typeof showToast === "function") showToast("Vincenty jeodezik hesabı yakınsamadı.", "error");
        return;
      }
      const p1DmsLat = geoEngine.decDegToDMS(c1_1);
      const p1DmsLon = geoEngine.decDegToDMS(c1_2);
      const p2DmsLat = geoEngine.decDegToDMS(c2_1);
      const p2DmsLon = geoEngine.decDegToDMS(c2_2);
      const dmsAz12 = geoEngine.decDegToDMS(res.azimuth12Deg);
      const dmsAz21 = geoEngine.decDegToDMS(res.azimuth21Deg);
      const dh = c2_3 - c1_3;
      const slopePct = res.distanceM > 0 ? ((dh / res.distanceM) * 100).toFixed(2) : "0.00";

      const out = `📍 1. Başlangıç Noktası (P1):
   ${c1_1.toFixed(8)}°, ${c1_2.toFixed(8)}° (h = ${c1_3.toFixed(3)} m)
   DMS: ${p1DmsLat}, ${p1DmsLon}

📍 2. Hedef Noktası (P2):
   ${c2_1.toFixed(8)}°, ${c2_2.toFixed(8)}° (h = ${c2_3.toFixed(3)} m)
   DMS: ${p2DmsLat}, ${p2DmsLon}

🌐 Referans Elipsoidi: ${ellipsoid} (a = ${ellipsoid === "HAYFORD" ? "6378388.000" : "6378137.000"} m, f = 1/${ellipsoid === "HAYFORD" ? "297.0" : "298.257222101"})

📏 JEODEZİK ELİPSOİT MESAFESİ (Vincenty):
   s = ${res.distanceM.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m  (${(res.distanceM / 1000).toFixed(4)} km)

🧭 JEODEZİK AZİMUT AÇILARI:
   İleri Azimut (α₁₂): ${res.azimuth12Deg.toFixed(4)}° | ${res.azimuth12Grad.toFixed(4)} grad | ${dmsAz12}
   Geri Azimut  (α₂₁): ${res.azimuth21Deg.toFixed(4)}° | ${res.azimuth21Grad.toFixed(4)} grad | ${dmsAz21}

⛰️ KOT FARKI & EĞİM:
   Δh = ${dh >= 0 ? "+" : ""}${dh.toFixed(3)} m | Eğim: %${slopePct}`;

      if (distResultBox) distResultBox.textContent = out;
      if (typeof showToast === "function") showToast("📏 Jeodezik mesafe ve azimut başarıyla hesaplandı!", "success");
    } else {
      // GRID Mode
      const distRes = geoEngine.gridDistance(c1_1, c1_2, c2_1, c2_2, c1_3, c2_3);
      const azRes = geoEngine.gridAzimuth(c1_1, c1_2, c2_1, c2_2);
      const backAzDeg = (azRes.azimuthDeg + 180) % 360;
      const backAzGrad = (azRes.azimuthGrad + 200) % 400;
      const slopePct = distRes.distance2D > 0 ? ((distRes.dH / distRes.distance2D) * 100).toFixed(2) : "0.00";

      const out = `📍 1. Başlangıç Noktası (P1):
   Y = ${c1_1.toFixed(3)} m, X = ${c1_2.toFixed(3)} m, Z = ${c1_3.toFixed(3)} m

📍 2. Hedef Noktası (P2):
   Y = ${c2_1.toFixed(3)} m, X = ${c2_2.toFixed(3)} m, Z = ${c2_3.toFixed(3)} m

📏 PROJEKSİYON DÜZLEM MESAFELERİ:
   2B Düzlem Mesafesi (S₂D): ${distRes.distance2D.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m
   3B Eğik Mesafe     (S₃D): ${distRes.distance3D.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m

🧭 GRİD SEMT AÇILARI (Azimut):
   İleri Semt (t₁₂): ${azRes.azimuthGrad.toFixed(4)} grad | ${azRes.azimuthDeg.toFixed(4)}° | ${azRes.azimuthDMS}
   Geri Semt  (t₂₁): ${backAzGrad.toFixed(4)} grad | ${backAzDeg.toFixed(4)}° | ${geoEngine.decDegToDMS(backAzDeg)}

📐 KOORDİNAT FARKLARI & EĞİM:
   ΔY (dE) = ${distRes.dE >= 0 ? "+" : ""}${distRes.dE.toFixed(3)} m
   ΔX (dN) = ${distRes.dN >= 0 ? "+" : ""}${distRes.dN.toFixed(3)} m
   ΔZ (dH) = ${distRes.dH >= 0 ? "+" : ""}${distRes.dH.toFixed(3)} m
   Eğim: %${slopePct}`;

      if (distResultBox) distResultBox.textContent = out;
      if (typeof showToast === "function") showToast("📏 Grid mesafesi ve semt açısı başarıyla hesaplandı!", "success");
    }
  });

  btnCopyDistResult?.addEventListener("click", () => {
    if (distResultBox && distResultBox.textContent) {
      copyToClipboard(distResultBox.textContent, "📋 Mesafe & azimut hesap sonucu kopyalandı.");
    }
  });

  // =========================================================================
  // SUBTAB 2: DIRECT GEODESY (1. TEMEL ÖDEV)
  // =========================================================================
  const btnCalcDirect = document.getElementById("toolsBtnCalcDirectGeodesy");
  const btnCopyDirResult = document.getElementById("toolsBtnCopyDirResult");
  const dirResultBox = document.getElementById("toolsDirResultBox");

  btnCalcDirect?.addEventListener("click", () => {
    if (!geoEngine) return;
    const lat1 = parseCoordInput(document.getElementById("toolsDirLat1")?.value);
    const lon1 = parseCoordInput(document.getElementById("toolsDirLon1")?.value);
    const azDeg = parseCoordInput(document.getElementById("toolsDirAzimuth")?.value);
    const distM = parseFloat(document.getElementById("toolsDirDistance")?.value);
    const ellipsoid = document.getElementById("toolsSelDirectEllipsoid")?.value || "GRS80";

    if (isNaN(lat1) || isNaN(lon1) || isNaN(azDeg) || isNaN(distM)) {
      if (typeof showToast === "function") showToast("Lütfen başlangıç noktası, azimut ve mesafe değerlerini eksiksiz giriniz.", "warning");
      return;
    }

    const res = geoEngine.vincentyDirect(lat1, lon1, azDeg, distM, ellipsoid);
    if (!res) {
      if (typeof showToast === "function") showToast("Düz jeodezi hesabı yakınsamadı.", "error");
      return;
    }

    const dmsLat2 = geoEngine.decDegToDMS(res.lat2);
    const dmsLon2 = geoEngine.decDegToDMS(res.lon2);
    const dmsRevAz = geoEngine.decDegToDMS(res.reverseAzimuthDeg);

    const out = `📍 BAŞLANGIÇ NOKTASI (P1):
   Enlem (Lat1):  ${lat1.toFixed(8)}° (${geoEngine.decDegToDMS(lat1)})
   Boylam (Lon1): ${lon1.toFixed(8)}° (${geoEngine.decDegToDMS(lon1)})

🧭 GİRDİ PARAMETRELERİ:
   Çıkış Azimutu (α₁₂):   ${azDeg.toFixed(4)}° | ${(azDeg * 200 / 180).toFixed(4)} grad | ${geoEngine.decDegToDMS(azDeg)}
   Elipsoit Mesafesi (s): ${distM.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m (${(distM / 1000).toFixed(4)} km)
   Referans Elipsoidi:    ${ellipsoid}

🎯 HESAPLANAN HEDEF NOKTA (P2):
   Enlem (Lat2):  ${res.lat2.toFixed(8)}°  |  ${dmsLat2}
   Boylam (Lon2): ${res.lon2.toFixed(8)}°  |  ${dmsLon2}
   Geri Azimut (α₂₁): ${res.reverseAzimuthDeg.toFixed(4)}° | ${(res.reverseAzimuthDeg * 200 / 180).toFixed(4)} grad | ${dmsRevAz}`;

    if (dirResultBox) dirResultBox.textContent = out;
    if (typeof showToast === "function") showToast("📍 1. Temel Ödev: Hedef nokta koordinatları hesaplandı!", "success");
  });

  btnCopyDirResult?.addEventListener("click", () => {
    if (dirResultBox && dirResultBox.textContent) {
      copyToClipboard(dirResultBox.textContent, "📋 1. Temel Ödev sonucu kopyalandı.");
    }
  });

  // =========================================================================
  // SUBTAB 3: GAUSS ALAN HESABI (SHOELACE FORMULA)
  // =========================================================================
  const btnLoadAreaSample = document.getElementById("toolsBtnLoadAreaSample");
  const fileAreaInput = document.getElementById("toolsFileAreaInput");
  const txtAreaInput = document.getElementById("toolsTxtAreaInput");
  const btnCalcArea = document.getElementById("toolsBtnCalcGaussArea");

  btnLoadAreaSample?.addEventListener("click", () => {
    if (txtAreaInput) {
      txtAreaInput.value = `P1  500000.000  4500000.000\nP2  500100.000  4500000.000\nP3  500100.000  4500100.000\nP4  500000.000  4500100.000`;
    }
    if (typeof showToast === "function") showToast("🧪 Örnek 100×100m poligon parseli yüklendi.", "info");
  });

  fileAreaInput?.addEventListener("change", async (ev) => {
    const f = ev.target.files?.[0];
    if (f) {
      const text = await f.text();
      if (txtAreaInput) txtAreaInput.value = text;
      const count = text.split("\n").filter(l => l.trim().length > 0).length;
      if (typeof showToast === "function") showToast(`📂 '${f.name}' dosyasından ${count} satır yüklendi.`, "info");
    }
  });

  btnCalcArea?.addEventListener("click", () => {
    if (!geoEngine) return;
    const raw = txtAreaInput?.value || "";
    if (!raw.trim()) {
      if (typeof showToast === "function") showToast("Lütfen en az 3 köşe noktası koordinatı giriniz.", "warning");
      return;
    }
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("#") && !l.startsWith("//") && !l.startsWith(";"));
    const coords = [];
    lines.forEach(line => {
      const parts = line.split(/[\s,;|\t]+/).filter(Boolean);
      if (parts.length >= 2) {
        let e = parseFloat(parts[0]);
        let n = parseFloat(parts[1]);
        if (isNaN(e) && parts.length >= 3) {
          // 1st item is point name
          e = parseFloat(parts[1]);
          n = parseFloat(parts[2]);
        }
        if (!isNaN(e) && !isNaN(n)) {
          coords.push({ e, n });
        }
      }
    });

    if (coords.length < 3) {
      if (typeof showToast === "function") showToast("Alan hesabı için en az 3 poligon köşe noktası gereklidir.", "warning");
      return;
    }

    const res = geoEngine.gaussArea(coords);
    const m2El = document.getElementById("toolsResAreaM2");
    const donumEl = document.getElementById("toolsResAreaDonum");
    const haEl = document.getElementById("toolsResAreaHektar");
    const perimEl = document.getElementById("toolsResAreaPerimeter");
    const countEl = document.getElementById("toolsResAreaCount");
    const centroidEl = document.getElementById("toolsResAreaCentroid");

    if (m2El) m2El.textContent = res.areaM2.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " m²";
    if (donumEl) donumEl.textContent = res.areaDonumTR.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " Dönüm";
    if (haEl) haEl.textContent = res.areaHektar.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + " ha";
    if (perimEl) perimEl.textContent = res.perimeterM.toLocaleString("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + " m";
    if (countEl) countEl.textContent = res.pointCount.toString();

    // Centroid calculation
    let cY = 0, cX = 0;
    coords.forEach(p => { cY += p.e; cX += p.n; });
    cY /= coords.length;
    cX /= coords.length;
    if (centroidEl) centroidEl.textContent = `Y: ${cY.toFixed(3)} | X: ${cX.toFixed(3)}`;

    if (typeof showToast === "function") showToast(`📐 Gauss poligon alanı: ${res.areaM2.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`, "success");
  });

  // =========================================================================
  // SUBTAB 4: POLAR COORDINATES (KUTUPSAL ALIM) & ANGLE CONVERTER
  // =========================================================================
  const btnCalcPolar = document.getElementById("toolsBtnCalcPolar");
  const polarResultBox = document.getElementById("toolsPolarResultBox");

  btnCalcPolar?.addEventListener("click", () => {
    const yD = parseFloat(document.getElementById("toolsPolarYD")?.value);
    const xD = parseFloat(document.getElementById("toolsPolarXD")?.value);
    const yB = parseFloat(document.getElementById("toolsPolarYB")?.value);
    const xB = parseFloat(document.getElementById("toolsPolarXB")?.value);
    const angleRaw = parseCoordInput(document.getElementById("toolsPolarAngle")?.value);
    const distS = parseFloat(document.getElementById("toolsPolarDist")?.value);
    const unit = document.getElementById("toolsPolarAngleUnit")?.value || "GRAD";

    if (isNaN(yD) || isNaN(xD) || isNaN(yB) || isNaN(xB) || isNaN(angleRaw) || isNaN(distS)) {
      if (typeof showToast === "function") showToast("Lütfen tüm kutupsal alım parametrelerini eksiksiz giriniz.", "warning");
      return;
    }

    // 1. Calculate Backsight Azimuth (t_DB)
    const dyDB = yB - yD;
    const dxDB = xB - xD;
    let tDBRad = Math.atan2(dyDB, dxDB);
    if (tDBRad < 0) tDBRad += 2 * Math.PI;

    // Convert input angle to radians
    let betaRad = 0;
    if (unit === "GRAD") {
      betaRad = angleRaw * Math.PI / 200;
    } else {
      betaRad = angleRaw * Math.PI / 180;
    }

    // 2. Point Direction Azimuth (t_DP)
    let tDPRad = (tDBRad + betaRad) % (2 * Math.PI);
    if (tDPRad < 0) tDPRad += 2 * Math.PI;

    // 3. New Point Coordinates
    const yP = yD + distS * Math.sin(tDPRad);
    const xP = xD + distS * Math.cos(tDPRad);

    const tDPGrad = tDPRad * 200 / Math.PI;
    const tDPDeg = tDPRad * 180 / Math.PI;
    const tDBGrad = tDBRad * 200 / Math.PI;

    const out = `📍 DURAN NOKTA (D): Y = ${yD.toFixed(3)} m, X = ${xD.toFixed(3)} m
🎯 BAKILAN NOKTA (B): Y = ${yB.toFixed(3)} m, X = ${xB.toFixed(3)} m
🧭 REFERANS SEMT (t_DB): ${tDBGrad.toFixed(4)} grad

📐 ÖLÇÜLEN DEĞERLER:
   Kırılma Açısı (β): ${angleRaw.toFixed(4)} ${unit === "GRAD" ? "grad" : "°"}
   Yatay Mesafe (S):  ${distS.toFixed(3)} m
   Hedef Semt (t_DP): ${tDPGrad.toFixed(4)} grad (${tDPDeg.toFixed(4)}°)

⭐ HESAPLANAN YENİ NOKTA (P):
   Y (Sağa Değer):  ${yP.toFixed(3)} m
   X (Yukarı Değer): ${xP.toFixed(3)} m`;

    if (polarResultBox) polarResultBox.textContent = out;
    if (typeof showToast === "function") showToast("⭐ Kutupsal nokta koordinatı başarıyla hesaplandı!", "success");
  });

  // Angle Converter Handlers
  const inpDMS = document.getElementById("toolsAngleDMS");
  const inpDD = document.getElementById("toolsAngleDD");
  const inpGrad = document.getElementById("toolsAngleGrad");
  const inpRad = document.getElementById("toolsAngleRad");

  const syncAnglesFromDD = (deg) => {
    if (isNaN(deg)) return;
    if (inpDD) inpDD.value = deg.toFixed(8);
    if (inpDMS && geoEngine) inpDMS.value = geoEngine.decDegToDMS(deg);
    if (inpGrad) inpGrad.value = (deg * 200 / 180).toFixed(8);
    if (inpRad) inpRad.value = (deg * Math.PI / 180).toFixed(8);
  };

  document.getElementById("toolsBtnConvertFromDMS")?.addEventListener("click", () => {
    const val = inpDMS?.value;
    if (!val || !geoEngine) return;
    const dec = geoEngine.dmsToDec(val);
    if (dec !== null) {
      syncAnglesFromDD(dec);
      if (typeof showToast === "function") showToast("Açı dönüştürüldü.", "success");
    } else {
      if (typeof showToast === "function") showToast("Geçersiz DMS formatı. Ör: 39° 55' 14.52\"", "warning");
    }
  });

  document.getElementById("toolsBtnConvertFromDD")?.addEventListener("click", () => {
    const dec = parseFloat(inpDD?.value);
    if (!isNaN(dec)) {
      syncAnglesFromDD(dec);
      if (typeof showToast === "function") showToast("Açı dönüştürüldü.", "success");
    }
  });

  document.getElementById("toolsBtnConvertFromGrad")?.addEventListener("click", () => {
    const grad = parseFloat(inpGrad?.value);
    if (!isNaN(grad)) {
      const dec = grad * 180 / 200;
      syncAnglesFromDD(dec);
      if (typeof showToast === "function") showToast("Açı dönüştürüldü.", "success");
    }
  });

  document.getElementById("toolsBtnConvertFromRad")?.addEventListener("click", () => {
    const rad = parseFloat(inpRad?.value);
    if (!isNaN(rad)) {
      const dec = rad * 180 / Math.PI;
      syncAnglesFromDD(dec);
      if (typeof showToast === "function") showToast("Açı dönüştürüldü.", "success");
    }
  });
}

if (typeof window !== "undefined") {
  window.initToolsTab = initToolsTab;
}
