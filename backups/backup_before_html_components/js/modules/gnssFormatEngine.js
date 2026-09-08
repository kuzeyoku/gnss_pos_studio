/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - GNSS KADASTRO & VERİ FORMAT MOTORU (GnssFormatEngine)
 * =========================================================================================
 *  - SurvCE / SurvStar (.RW5), FieldGenius / Carlson (.RAW), CHC LandStar / CSV, Trimble (.JXL)
 *  - Çift Okuma Kontrolü & Fark Analizi (BÖHHBÜY: dS ≤ 7cm, Δt ≥ 60 dk, Ortalama Koordinat Hesabı)
 *  - TG-20 Türkiye Hibrit Jeoidi ile Elipsoit Kotundan Ortometrik Kota İndirgeme (H = h - N)
 *  - Netcad (.NCN / .KOS), AutoCAD (.DXF), Google Earth (.KML) ve Kadastro CSV / HTML Rapor İhracı
 *  - DXF Çizim Dosyalarını GeoJSON Web Harita Vektör Katmanına Dönüştürme
 * =========================================================================================
 */

class GnssFormatEngine {
  constructor() {
    this.rawPoints = [];
    this.matchedPairs = [];
    this.unmatchedPoints = [];
    this.detectedBrand = "AUTO";
    this.geodesy = typeof GeodesyEngine !== "undefined" ? new GeodesyEngine() : null;
    this.centralMeridian = 30;
    this.geoidN = 34.455;
    this.isTg20Applied = false;
  }

  /**
   * Evrensel Otonom GNSS Karar Motoru (Universal Pattern & Data-Type Decision Engine)
   * Hiçbir marka veya yazılım adına bakmaksızın, doğrudan gelen verinin tipine,
   * sayısal büyüklüklerine ve desenlerine göre otonom karar verir.
   */
  parseData(content, fileName = "") {
    const text = content.trim();
    if (!text) return [];

    // 1. XML Veri Yapısı (JXL / LandXML vb.)
    if (text.startsWith("<?xml") || text.includes("<JOBFile") || text.includes("<FieldBook") || fileName.toLowerCase().endsWith(".jxl")) {
      this.detectedBrand = "XML Tabanlı Geodezik Veri";
      return this.parseTrimbleJxl(text);
    }

    // 2. Bloklu ve Etiketli Saha Kayıt Formatları (RW5, RAW, Saha Günlükleri)
    if (text.includes("GPS,") || text.includes("GS,") || text.includes("BP,") || text.includes("EP,") || text.includes("SP,") || text.includes("JB,") || text.includes("--")) {
      this.detectedBrand = "Otonom Saha Ölçü Akışı";
      return this.parseRw5(text);
    }

    // 3. Tablo / CSV / Ayrılmış Sütunlu Veri
    const firstLine = text.split("\n")[0] || "";
    if (firstLine.includes(",") || firstLine.includes(";") || firstLine.includes("\t")) {
      this.detectedBrand = "Tablo / Ayrılmış Sütunlu Koordinat Akışı";
      return this.parseCsv(text);
    }

    // 4. Serbest Sütunlu Sayı Dizisi
    this.detectedBrand = "Serbest Sütunlu Koordinat Akışı";
    return this.parseGenericText(text);
  }

  /**
   * Saf Sayısal ve Geodezik Örüntü Karar Motoru (Pure Heuristic Pattern Parser)
   * Satırları sayısal aralıklarına (Değer Büyüklüğü), zaman desenlerine ve
   * geodezik niteliklerine göre markadan bağımsız olarak çözümler.
   */
  parseRw5(rw5Content) {
    const lines = rw5Content.split("\n");
    const points = [];
    let curRecord = {};
    let isBaseContext = false;
    let fallbackDate = "";
    let fallbackTime = "";

    // 1. RW5 / Saha Başlığından Projeksiyon ve DOM Keşfi (Header Projection Scanner)
    let headerDom = null;
    for (let i = 0; i < Math.min(lines.length, 50); i++) {
      const l = lines[i];
      const matchTm = l.match(/(?:3-derece\s+TM|TM\s+3°?|CM\s*|DOM\s*|Zone\s*)(\d{2})/i) || l.match(/Transverse\s+Mercator.*?(\d{2})/i);
      if (matchTm) {
        const domVal = parseInt(matchTm[1], 10);
        if ([27, 30, 33, 36, 39, 42, 45].includes(domVal)) {
          headerDom = domVal;
          this.centralMeridian = domVal;
          break;
        }
      }
    }

    // GPS Hafta & Zamanından Otonom UTC Çözümleyici
    const parseGpsTime = (week, towSec) => {
      const gpsEpoch = Date.UTC(1980, 0, 6, 0, 0, 0);
      const msInWeek = 7 * 24 * 3600 * 1000;
      const leapMs = 18000;
      return new Date(gpsEpoch + (week * msInWeek) + Math.round(towSec * 1000) - leapMs);
    };

    // Noktayı Otonom Doğrulayıp Kaydetme
    const commitPoint = () => {
      if (isBaseContext) {
        curRecord = {};
        return;
      }

      // En az bir nokta adı ve koordinat/enlem bilgisi mevcut mu?
      if (curRecord.pn && (curRecord.lat !== undefined || (curRecord.n !== undefined && curRecord.e !== undefined))) {
        // Otomatik DOM Keşfi (Eğer başlıkta yoksa, ilk noktanın boylamından tespit et)
        if (!headerDom && points.length === 0 && this.geodesy && curRecord.lon !== undefined) {
          this.centralMeridian = this.geodesy.getAutoCentralMeridian3Deg(curRecord.lon);
        }

        let easting = curRecord.e || 0;
        let northing = curRecord.n || 0;

        // Eğer ham veride gerçek uydu koordinatları (lat/lon) varsa
        if (this.geodesy && curRecord.lat !== undefined && curRecord.lon !== undefined) {
          if (curRecord.e && curRecord.n && Math.abs(curRecord.e) > 10000 && Math.abs(curRecord.n) > 10000) {
            easting = curRecord.e;
            northing = curRecord.n;
          } else {
            const tm = this.geodesy.forwardTM(curRecord.lat, curRecord.lon, this.centralMeridian, 1.0, false);
            easting = tm.easting;
            northing = tm.northing;
          }
        } else if (this.geodesy && (curRecord.lat === undefined || curRecord.lon === undefined) && curRecord.e && curRecord.n) {
          // Değer Büyüklüğüne Göre Northing (7 Basamak) ve Easting (6 Basamak) Otomatik Doğrulama
          if (easting > 1000000 && northing < 1000000 && northing > 0) {
            const tmp = easting;
            easting = northing;
            northing = tmp;
          }
          // Eğer sadece N, E varsa, ters projeksiyonla lat, lon hesapla
          const geo = this.geodesy.inverseTM(easting, northing, this.centralMeridian, 1.0, false);
          curRecord.lat = geo.lat;
          curRecord.lon = geo.lon;
        }

        curRecord.e = easting;
        curRecord.n = northing;
        curRecord.h = curRecord.elRaw !== undefined ? curRecord.elRaw : (curRecord.h !== undefined ? curRecord.h : null);
        curRecord.orthoH = curRecord.h !== null ? curRecord.h - this.geoidN : null;
        curRecord.latDec = curRecord.lat || 0;
        curRecord.lonDec = curRecord.lon || 0;
        curRecord.latDms = curRecord.lat ? (this.geodesy ? this.geodesy.toDms(curRecord.lat, true) : `${curRecord.lat.toFixed(7)}° N`) : "--";
        curRecord.lonDms = curRecord.lon ? (this.geodesy ? this.geodesy.toDms(curRecord.lon, false) : `${curRecord.lon.toFixed(7)}° E`) : "--";

        // Zaman Damgası
        if (!curRecord.timestamp) {
          const dStr = curRecord.dt || fallbackDate;
          const tStr = curRecord.tm || fallbackTime;
          if (dStr && tStr) {
            const [mo, da, yr] = dStr.split("-").map(Number);
            const [hh, mi, ss] = tStr.split(":").map(Number);
            curRecord.timestamp = new Date(yr || 2026, (mo || 1) - 1, da || 1, hh || 0, mi || 0, ss || 0);
          } else {
            curRecord.timestamp = null;
          }
        }

        if (!curRecord.dt) curRecord.dt = curRecord.timestamp ? curRecord.timestamp.toLocaleDateString("tr-TR") : "-";
        if (!curRecord.tm) curRecord.tm = curRecord.timestamp ? curRecord.timestamp.toLocaleTimeString("tr-TR") : "-";

        // Sayısal Hassasiyet ve Kalite Parametreleri - Sadece ham veride varsa gösterilir!
        curRecord.hsdvVal = curRecord.hsdv ? parseFloat(curRecord.hsdv) : (curRecord.hsdvVal || null);
        curRecord.vsdvVal = curRecord.vsdv ? parseFloat(curRecord.vsdv) : (curRecord.vsdvVal || null);
        curRecord.sats = curRecord.sats ? parseInt(curRecord.sats, 10) : (curRecord.sats || null);
        curRecord.pdop = curRecord.pdop ? parseFloat(curRecord.pdop).toFixed(2) : (curRecord.pdop || null);
        curRecord.status = curRecord.status ? curRecord.status.toUpperCase() : "-";
        curRecord.hr = curRecord.hr ? curRecord.hr : "-";
        curRecord.epochs = curRecord.epochs || null;
        curRecord.hz = curRecord.hz || null;
        curRecord.method = curRecord.method || "-";
        curRecord.network = curRecord.network || "-";
        curRecord.measure = curRecord.measure || "-";
        curRecord.code = curRecord.code || "";

        points.push(curRecord);
      }
      curRecord = {};
    };

    // Carlson RW5 DD.MMSSssss -> Ondalık Derece (Decimal Degrees) Çözümleyici
    const dmsToDecimal = (val) => {
      if (val === undefined || val === null || isNaN(val)) return 0;
      const isNeg = val < 0;
      const absVal = Math.abs(val);
      const deg = Math.floor(absVal);
      const minSec = (absVal - deg) * 100;
      const min = Math.floor(minSec + 1e-9);
      const sec = (minSec - min) * 100;
      // Eğer dakika veya saniye 60 veya daha büyükse, bu değer zaten saf ondalık derecedir
      if (min >= 60 || sec >= 60) {
        return val;
      }
      const decimal = deg + min / 60 + sec / 3600;
      return isNeg ? -decimal : decimal;
    };

    // Saf Değer ve Tip Ayrıştırıcı (Marka Metinlerinden Tamamen Bağımsız)
    const extractValueByPattern = (token) => {
      const s = token.trim();
      if (!s) return;

      // 1. Kot / Yükseklik Kalıpları
      if (/^(EL|ELEV|HT|HEIGHT|Z)[\s:]/i.test(s) || (/^EL[\d.-]/i.test(s) && !/^ELIP/i.test(s))) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) { curRecord.h = v; curRecord.elRaw = v; }
      }
      // 2. Coğrafi Enlem Kalıpları (Carlson RW5 formatında LA: DD.MMSSssss)
      else if (/^(LA|LAT|LATITUDE)[\s:]?/i.test(s)) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) {
          curRecord.latRaw = v;
          curRecord.lat = dmsToDecimal(v);
        }
      }
      // 3. Coğrafi Boylam Kalıpları (Carlson RW5 formatında LN: DD.MMSSssss)
      else if (/^(LN|LON|LONG|LONGITUDE)[\s:]?/i.test(s)) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) {
          curRecord.lonRaw = v;
          curRecord.lon = dmsToDecimal(v);
        }
      }
      // 4. Projeksiyon Kuzey / Northing Kalıpları
      else if (/^(N|NORTH|NOR)[\s:]/i.test(s) || (/^N[\d.-]/i.test(s) && !/^NO/i.test(s))) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) curRecord.n = v;
      }
      // 5. Projeksiyon Doğu / Easting Kalıpları
      else if (/^(E|EAST|EAS)[\s:]/i.test(s) || (/^E[\d.-]/i.test(s) && !/^(EL|EP|ET)/i.test(s))) {
        const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, "").trim());
        if (!isNaN(v)) curRecord.e = v;
      }
    };

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // A. OTONOM BAZ İSTASYONU TESPİTİ (Sadece geodezik baz belirteçleri)
      if (line.startsWith("BP,") || line.startsWith("--BP,") || line.includes("SRBASE") || line.includes("Base Configuration") || line.includes("OCCUPY")) {
        commitPoint();
        isBaseContext = true;
        continue;
      }

      // B. OTONOM NOKTA BAŞLANGICI (Herhangi bir nokta başlatan kayıt: GPS, EP, SP, AP, POS, PNT vb.)
      if (line.startsWith("GPS,") || line.startsWith("--GPS,") || line.startsWith("EP,") || line.startsWith("SP,") || line.startsWith("AP,") || line.startsWith("POS,") || line.startsWith("PNT,")) {
        commitPoint();
        isBaseContext = false;
        const parts = line.split(",");
        if (parts.length >= 2) {
          curRecord.pn = parts[1].replace(/^(PN|EP|SP|AP|POS|PNT):?/i, "").trim();
          for (let seg of parts.slice(2)) {
            extractValueByPattern(seg);
          }
        }
      }
      // C. KOORDİNAT VERİ SATIRLARI (GS, --GS vb.)
      else if (line.startsWith("GS,") || line.startsWith("--GS,")) {
        if (isBaseContext) continue;
        const parts = line.split(",");
        if (parts.length >= 2) {
          const possiblePn = parts[1].replace(/^(PN|POS):?/i, "").trim();
          if (curRecord.pn && curRecord.pn !== possiblePn && (curRecord.n !== undefined || curRecord.lat !== undefined)) {
            commitPoint();
          }
          if (!curRecord.pn) curRecord.pn = possiblePn;
          for (let seg of parts.slice(2)) {
            extractValueByPattern(seg);
          }
        }
      }
      // D. GPS ZAMAN VE HAFTA DESENİ
      else if (line.includes("SW") && line.includes("ST") && (line.startsWith("--GT") || line.startsWith("GT"))) {
        const parts = line.split(",");
        let swVal = null;
        let stVal = null;
        for (let p of parts) {
          p = p.trim();
          if (p.startsWith("SW")) swVal = parseInt(p.substring(2), 10);
          else if (p.startsWith("ST")) stVal = parseFloat(p.substring(2)) / (p.length > 8 ? 1000.0 : 1.0);
        }
        if (swVal !== null && stVal !== null) {
          const dtObj = parseGpsTime(swVal, stVal);
          if (!isNaN(dtObj.getTime())) {
            curRecord.timestamp = dtObj;
            curRecord.dt = `${String(dtObj.getUTCMonth() + 1).padStart(2, "0")}-${String(dtObj.getUTCDate()).padStart(2, "0")}-${dtObj.getUTCFullYear()}`;
            curRecord.tm = `${String(dtObj.getUTCHours()).padStart(2, "0")}:${String(dtObj.getUTCMinutes()).padStart(2, "0")}:${String(dtObj.getUTCSeconds()).padStart(2, "0")}`;
          }
        }
      }
      // E. TARİH VE SAAT DESENLERİ
      else if (line.startsWith("JB,") || line.startsWith("JOB,")) {
        const parts = line.split(",");
        for (let p of parts) {
          p = p.trim();
          if (p.startsWith("DT")) fallbackDate = p.substring(2).trim();
          else if (p.startsWith("TM")) fallbackTime = p.substring(2).trim();
        }
      } else if (line.startsWith("--DT") || line.startsWith("--Date:") || line.startsWith("DT,")) {
        const d = line.replace(/^(--DT|--Date:|DT,):?/i, "").trim();
        if (!isBaseContext) curRecord.dt = d;
        if (!fallbackDate) fallbackDate = d;
      } else if (line.startsWith("--TM") || line.startsWith("--Time:") || line.startsWith("TM,")) {
        const t = line.replace(/^(--TM|--Time:|TM,):?/i, "").trim();
        if (!isBaseContext) curRecord.tm = t;
        if (!fallbackTime) fallbackTime = t;
      }
      // F. JALON VE ANTEN YÜKSEKLİK DESENLERİ
      else if (line.includes("HR:") || line.startsWith("LS,HR") || line.includes("Jalon") || line.includes("Antenna")) {
        const m = line.match(/(?:HR|HT|Jalon Y\w+kseklik):\s*([\d.]+)/i) || line.match(/LS,HR\s*([\d.]+)/i);
        if (m) curRecord.hr = m[1];
      }
      // G. KALİTE VE RMS DEĞERLERİ
      else if (line.includes("HSDV") || line.includes("RMS") || line.includes("STATUS:") || line.includes("SATS:")) {
        const tokens = line.replace(/^--/, "").split(",");
        for (let t of tokens) {
          if (t.includes(":")) {
            const [k, v] = t.split(":");
            curRecord[k.trim().toLowerCase()] = v.trim();
          }
        }
      }
      // H. SAYISAL İSTATİSTİK VE ORTALAMA DEĞERLER
      else if (line.includes("Avg:")) {
        const mNor = line.match(/(?:Nor|North|Yukarı)\s*Avg:\s*([\d.]+)/i);
        if (mNor) curRecord.n = parseFloat(mNor[1]);
        const mEas = line.match(/(?:Eas|East|Sağa)\s*Avg:\s*([\d.]+)/i);
        if (mEas) curRecord.e = parseFloat(mEas[1]);
        const mElv = line.match(/(?:Elv|Elev|Kot|Height)\s*Avg:\s*([\d.]+)/i);
        if (mElv) {
          curRecord.h = parseFloat(mElv[1]);
          curRecord.elRaw = parseFloat(mElv[1]);
        }
        const mHsdv = line.match(/(?:HSDV|HRMS)\s*Avg:\s*([\d.]+)/i);
        if (mHsdv) curRecord.hsdvVal = parseFloat(mHsdv[1]);
        const mVsdv = line.match(/(?:VSDV|VRMS)\s*Avg:\s*([\d.]+)/i);
        if (mVsdv) curRecord.vsdvVal = parseFloat(mVsdv[1]);
        const mPdop = line.match(/PDOP\s*Avg:\s*([\d.]+)/i);
        if (mPdop) curRecord.pdop = parseFloat(mPdop[1]).toFixed(2);
        const mSats = line.match(/(?:Satellites|Uydu)\s*Avg:\s*(\d+)/i);
        if (mSats) curRecord.sats = parseInt(mSats[1], 10);
        const mFixed = line.match(/Fixed\s*Readings:\s*(\d+)\s+of\s+(\d+)/i);
        if (mFixed) {
          curRecord.epochs = parseInt(mFixed[2], 10);
          curRecord.status = parseInt(mFixed[1], 10) > 0 ? "FIXED" : "FLOAT";
        }
      }
    }

    commitPoint();

    this.rawPoints = points;
    return points;
  }

  /**
   * FieldGenius / Carlson RAW Formatını Ayrıştırır
   */
  parseRawFieldGenius(rawContent) {
    return this.parseRw5(rawContent);
  }

  /**
   * CHCNAV LandStar veya Standart CSV Tablo Formatını Ayrıştırır
   */
  parseCsv(csvContent) {
    const lines = csvContent.split("\n");
    const points = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || (i === 0 && (line.toLowerCase().includes("point") || line.toLowerCase().includes("nokta") || line.toLowerCase().includes("easting")))) {
        continue;
      }

      const cols = line.split(/[,;\t]/).map(c => c.trim());
      if (cols.length >= 3) {
        const pName = cols[0];
        const coord1 = parseFloat(cols[1]);
        const coord2 = parseFloat(cols[2]);
        const coordH = cols.length >= 4 && !isNaN(parseFloat(cols[3])) ? parseFloat(cols[3]) : null;

        if (!isNaN(coord1) && !isNaN(coord2)) {
          // Gerçek GNSS telemetrisi (Tarih, saat, uydu, RMS) mevcut mu kontrolü - Asla uydurma değer atanmaz!
          const hasTime = cols.length >= 5 && (cols[4].includes("-") || cols[4].includes("/") || cols[4].includes("."));
          const hasTelemetry = hasTime || (cols.length >= 8 && !isNaN(parseFloat(cols[6])));

          const dateStr = hasTime ? cols[4] : "-";
          const timeStr = hasTime && cols[5] ? cols[5] : "-";
          const sats = hasTelemetry && cols[6] && !isNaN(parseInt(cols[6], 10)) ? parseInt(cols[6], 10) : null;
          const pdop = hasTelemetry && cols[7] && !isNaN(parseFloat(cols[7])) ? parseFloat(cols[7]).toFixed(2) : null;
          const hsdv = hasTelemetry && cols[8] && !isNaN(parseFloat(cols[8])) ? parseFloat(cols[8]) : null;

          let ts = null;
          if (hasTime && dateStr !== "-") {
            const parsedTs = new Date(dateStr + (timeStr !== "-" ? ` ${timeStr}` : ""));
            if (!isNaN(parsedTs.getTime())) ts = parsedTs;
          }

          // Sağa Değer (Y) ve Yukarı Değer (X) Ayrımı (X > Y)
          const easting = coord1 > coord2 ? coord2 : coord1;
          const northing = coord1 > coord2 ? coord1 : coord2;
          const hVal = coordH;

          let lat = 39.0;
          let lon = 35.0;
          if (this.geodesy) {
            const geo = this.geodesy.inverseTM(easting, northing, this.centralMeridian, 1.0, false);
            lat = geo.lat;
            lon = geo.lon;
          }

          points.push({
            pn: pName,
            e: easting,
            n: northing,
            h: hVal,
            orthoH: hVal !== null ? hVal - this.geoidN : null,
            dt: dateStr,
            tm: timeStr,
            timestamp: ts,
            hsdvVal: hsdv,
            vsdvVal: (hsdv !== null && cols[9] && !isNaN(parseFloat(cols[9]))) ? parseFloat(cols[9]) : null,
            sats: sats,
            pdop: pdop,
            status: (hasTelemetry && cols[14]) ? cols[14].toUpperCase() : "-",
            hr: (hasTelemetry && cols[15]) ? cols[15] : "-",
            epochs: (hasTelemetry && cols[10] && !isNaN(parseInt(cols[10], 10))) ? parseInt(cols[10], 10) : null,
            hz: null,
            method: (hasTelemetry && cols[12]) ? cols[12] : "-",
            network: (hasTelemetry && cols[13]) ? cols[13] : "-",
            measure: "-",
            code: (!hasTelemetry && cols[4]) ? cols[4] : "",
            lat: lat,
            lon: lon,
            latDec: lat,
            lonDec: lon,
            latDms: this.geodesy ? this.geodesy.toDms(lat, true) : `${lat.toFixed(7)}° N`,
            lonDms: this.geodesy ? this.geodesy.toDms(lon, false) : `${lon.toFixed(7)}° E`,
            isStaticCoordinate: !hasTelemetry
          });
        }
      }
    }

    this.rawPoints = points;
    return points;
  }

  /**
   * Boşlukla Ayrılmış Genel Koordinat Metinlerini (Nokta No, Y, X, Z) Ayrıştırır
   * Not: Asla default/uydurma değer ataması yapılmaz. Datada ne varsa sadece o gösterilir.
   */
  parseGenericText(textContent) {
    const lines = textContent.split("\n");
    const points = [];

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("//") || line.startsWith("#")) continue;

      const tokens = line.split(/\s+/);
      if (tokens.length >= 3) {
        const pName = tokens[0];
        const coord1 = parseFloat(tokens[1]);
        const coord2 = parseFloat(tokens[2]);
        const hVal = tokens.length >= 4 && !isNaN(parseFloat(tokens[3])) ? parseFloat(tokens[3]) : null;

        if (!isNaN(coord1) && !isNaN(coord2)) {
          // Sağa Değer (Y) ve Yukarı Değer (X) Ayrımı (X > Y)
          const easting = coord1 > coord2 ? coord2 : coord1;
          const northing = coord1 > coord2 ? coord1 : coord2;
          let lat = 39.0;
          let lon = 35.0;
          if (this.geodesy) {
            const geo = this.geodesy.inverseTM(easting, northing, this.centralMeridian, 1.0, false);
            lat = geo.lat;
            lon = geo.lon;
          }

          points.push({
            pn: pName,
            e: easting,
            n: northing,
            h: hVal,
            orthoH: hVal !== null ? hVal - this.geoidN : null,
            dt: "-",
            tm: "-",
            timestamp: null,
            hsdvVal: null,
            vsdvVal: null,
            sats: null,
            pdop: null,
            status: "-",
            hr: "-",
            epochs: null,
            hz: null,
            method: "-",
            network: "-",
            measure: "-",
            code: tokens[4] || "",
            lat: lat,
            lon: lon,
            latDec: lat,
            lonDec: lon,
            latDms: this.geodesy ? this.geodesy.toDms(lat, true) : `${lat.toFixed(7)}° N`,
            lonDms: this.geodesy ? this.geodesy.toDms(lon, false) : `${lon.toFixed(7)}° E`,
            isStaticCoordinate: true
          });
        }
      }
    }

    this.rawPoints = points;
    return points;
  }

  /**
   * Trimble Access (.JXL) XML Formatını Ayrıştırır
   * Not: Sadece XML içerisindeki gerçek düğümler (TimeStamp, Precision vb.) okunur, asla default atanmaz.
   */
  parseTrimbleJxl(jxlContent) {
    const points = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(jxlContent, "text/xml");
    const records = xmlDoc.getElementsByTagName("PointRecord");

    for (let rec of records) {
      const pName = rec.getElementsByTagName("Name")[0]?.textContent || "";
      const gridNodes = rec.getElementsByTagName("Grid");

      let northing = null;
      let easting = null;
      let elev = null;

      if (gridNodes.length > 0) {
        const nNode = gridNodes[0].getElementsByTagName("North")[0]?.textContent;
        const eNode = gridNodes[0].getElementsByTagName("East")[0]?.textContent;
        const elNode = gridNodes[0].getElementsByTagName("Elevation")[0]?.textContent;
        if (nNode && !isNaN(parseFloat(nNode))) northing = parseFloat(nNode);
        if (eNode && !isNaN(parseFloat(eNode))) easting = parseFloat(eNode);
        if (elNode && !isNaN(parseFloat(elNode))) elev = parseFloat(elNode);
      }

      if (pName && (northing !== null || easting !== null)) {
        let lat = 39.0;
        let lon = 35.0;
        if (this.geodesy && easting !== null && northing !== null) {
          const geo = this.geodesy.inverseTM(easting, northing, this.centralMeridian, 1.0, false);
          lat = geo.lat;
          lon = geo.lon;
        }

        // Zaman damgası çıkarımı - Sadece XML'de varsa
        const tsNode = rec.getElementsByTagName("TimeStamp")[0] || rec.getElementsByTagName("DateTime")[0];
        let dt = "-";
        let tm = "-";
        let timestamp = null;
        if (tsNode && tsNode.textContent) {
          const parsedTs = new Date(tsNode.textContent.trim());
          if (!isNaN(parsedTs.getTime())) {
            timestamp = parsedTs;
            dt = parsedTs.toLocaleDateString("tr-TR");
            tm = parsedTs.toLocaleTimeString("tr-TR");
          }
        }

        // Hassasiyet ve kalite parametreleri - Sadece XML'de varsa
        const precH = parseFloat(rec.getElementsByTagName("HorizontalPrecision")[0]?.textContent || rec.getElementsByTagName("Horizontal")[0]?.textContent || "");
        const precV = parseFloat(rec.getElementsByTagName("VerticalPrecision")[0]?.textContent || rec.getElementsByTagName("Vertical")[0]?.textContent || "");
        const pdopNode = rec.getElementsByTagName("PDOP")[0]?.textContent;
        const satsNode = rec.getElementsByTagName("NumberOfSatellites")[0]?.textContent || rec.getElementsByTagName("Satellites")[0]?.textContent;
        const methodNode = rec.getElementsByTagName("Method")[0]?.textContent;
        const solTypeNode = rec.getElementsByTagName("SolutionType")[0]?.textContent ||
                            rec.getElementsByTagName("FixType")[0]?.textContent ||
                            rec.getElementsByTagName("Quality")[0]?.textContent ||
                            rec.getElementsByTagName("Status")[0]?.textContent;
        const antHtNode = rec.getElementsByTagName("AntennaHeight")[0]?.textContent ||
                          rec.getElementsByTagName("TargetHeight")[0]?.textContent ||
                          rec.getElementsByTagName("RodHeight")[0]?.textContent;

        const hsdv = !isNaN(precH) ? precH : null;
        const vsdv = !isNaN(precV) ? precV : null;
        const pdop = pdopNode && !isNaN(parseFloat(pdopNode)) ? parseFloat(pdopNode).toFixed(2) : null;
        const sats = satsNode && !isNaN(parseInt(satsNode, 10)) ? parseInt(satsNode, 10) : null;
        const statusVal = solTypeNode ? solTypeNode.trim().toUpperCase() : "-";
        const antHt = antHtNode && !isNaN(parseFloat(antHtNode)) ? parseFloat(antHtNode).toFixed(3) : "-";

        points.push({
          pn: pName,
          n: northing,
          e: easting,
          h: elev,
          orthoH: elev !== null ? elev - this.geoidN : null,
          dt: dt,
          tm: tm,
          timestamp: timestamp,
          hsdvVal: hsdv,
          vsdvVal: vsdv,
          sats: sats,
          pdop: pdop,
          status: statusVal,
          hr: antHt,
          epochs: null,
          hz: null,
          method: methodNode || "-",
          network: "-",
          measure: "-",
          code: rec.getElementsByTagName("Code")[0]?.textContent || "",
          lat: lat,
          lon: lon,
          latDec: lat,
          lonDec: lon,
          latDms: this.geodesy ? this.geodesy.toDms(lat, true) : `${lat.toFixed(7)}° N`,
          lonDms: this.geodesy ? this.geodesy.toDms(lon, false) : `${lon.toFixed(7)}° E`,
          isStaticCoordinate: !timestamp
        });
      }
    }

    this.rawPoints = points;
    return points;
  }

  /**
   * Saniye Cinsinden Zaman Farkını Doğal Türkçe Formatına Dönüştürür (örn: "22 sn", "14 dk 30 sn", "1 sa 15 dk")
   */
  formatHumanTimeDiff(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    if (s < 60) return `${s} sn`;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins < 60) return secs > 0 ? `${mins} dk ${secs} sn` : `${mins} dk`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hours} sa ${remMins} dk` : `${hours} sa`;
  }

  /**
   * BÖHHBÜY / Kadastro Standartlarında Çift Okuma Kontrolü & Fark Analizi Yapar
   */
  analyzeDoubleReadings(maxDistCm = 7.0, minTimeDiffMin = 60, matchRadiusM = 1.0) {
    const points = this.rawPoints;
    const matchedList = [];
    const usedIndices = new Set();

    for (let i = 0; i < points.length; i++) {
      if (usedIndices.has(i)) continue;
      const p1 = points[i];
      let bestMatch = null;
      let minDistance = 999999;

      for (let j = 0; j < points.length; j++) {
        if (i === j || usedIndices.has(j)) continue;
        const p2 = points[j];
        const dy = p2.e - p1.e;
        const dx = p2.n - p1.n;
        const dist2d = Math.hypot(dy, dx);

        if (dist2d <= matchRadiusM && dist2d < minDistance) {
          minDistance = dist2d;
          bestMatch = { j: j, p2: p2, dist2d: dist2d };
        }
      }

      if (bestMatch) {
        const { j: matchIdx, p2, dist2d } = bestMatch;
        usedIndices.add(i);
        usedIndices.add(matchIdx);

        const dyCm = (p2.e - p1.e) * 100.0;
        const dxCm = (p2.n - p1.n) * 100.0;
        const dhCm = (p2.h - p1.h) * 100.0;
        const ds2dCm = dist2d * 100.0;
        const ds3dCm = Math.hypot(dist2d, p2.h - p1.h) * 100.0;

        let timeDiffSec = 0;
        if (p1.timestamp && p2.timestamp) {
          timeDiffSec = Math.abs(p2.timestamp - p1.timestamp) / 1000.0;
        }
        const timeDiffMin = timeDiffSec / 60.0;

        const isDistPassed = ds2dCm <= maxDistCm;
        const isTimePassed = timeDiffMin >= minTimeDiffMin;

        const avgEasting = (p1.e + p2.e) / 2.0;
        const avgNorthing = (p1.n + p2.n) / 2.0;
        const avgHeight = (p1.h + p2.h) / 2.0;

        matchedList.push({
          p1: p1,
          p2: p2,
          pointName: p1.pn === p2.pn ? p1.pn : `${p1.pn} / ${p2.pn}`,
          dy: dyCm.toFixed(1),
          dx: dxCm.toFixed(1),
          dh: dhCm.toFixed(1),
          ds2d: ds2dCm.toFixed(1),
          ds3d: ds3dCm.toFixed(1),
          timeDiffSec: Math.round(timeDiffSec),
          timeDiffMin: timeDiffMin.toFixed(1),
          timeDiffStr: this.formatHumanTimeDiff(timeDiffSec),
          timeDiffHours: (timeDiffMin / 60.0).toFixed(2),
          isDistPassed: isDistPassed,
          isTimePassed: isTimePassed,
          avgE: avgEasting.toFixed(3),
          avgN: avgNorthing.toFixed(3),
          avgH: avgHeight.toFixed(3)
        });
      }
    }

    const unmatchedList = [];
    for (let i = 0; i < points.length; i++) {
      if (!usedIndices.has(i)) {
        unmatchedList.push(points[i]);
      }
    }

    this.matchedPairs = matchedList;
    this.unmatchedPoints = unmatchedList;

    return {
      matched: matchedList,
      unmatched: unmatchedList,
      matchedPairs: matchedList,
      unmatchedPoints: unmatchedList
    };
  }

  /**
   * Formatlanmış Metin Çıktısı Üretir
   */
  exportFormattedCoordinateList(formatType = "Pt,E,N,h") {
    let out = "";
    for (let p of this.rawPoints) {
      const eStr = p.e !== null && p.e !== undefined ? p.e.toFixed(3) : "-";
      const nStr = p.n !== null && p.n !== undefined ? p.n.toFixed(3) : "-";
      const hStr = p.h !== null && p.h !== undefined ? p.h.toFixed(3) : "-";

      if (formatType === "Pt,E,N,h") {
        out += `${p.pn.padEnd(10, " ")} ${eStr.padStart(12, " ")} ${nStr.padStart(12, " ")} ${hStr.padStart(10, " ")}\n`;
      } else if (formatType === "Pt,N,E,h") {
        out += `${p.pn.padEnd(10, " ")} ${nStr.padStart(12, " ")} ${eStr.padStart(12, " ")} ${hStr.padStart(10, " ")}\n`;
      } else if (formatType === "E,N,h,Pt") {
        out += `${eStr.padStart(12, " ")} ${nStr.padStart(12, " ")} ${hStr.padStart(10, " ")}   ${p.pn}\n`;
      } else if (formatType === "CSV_Y_X_H") {
        out += `${p.pn},${eStr},${nStr},${hStr}\n`;
      }
    }
    return out;
  }

  /**
   * HGM TG-20 Türkiye Hibrit Jeoidi İndirgemesi Uygular (H = h - N)
   */
  applyTg20Reduction(tg20Engine, fallbackGeodesyEngine = null, customEngine = null, applyState = true) {
    this.isTg20Applied = applyState;

    if (!applyState || !tg20Engine) {
      for (let pair of this.matchedPairs) {
        pair.isTg20Applied = false;
        pair.currentH = pair.avgH;
      }
      for (let pt of this.unmatchedPoints) {
        pt.isTg20Applied = false;
        pt.currentH = pt.h !== null && pt.h !== undefined ? pt.h.toFixed(3) : "-";
      }
      for (let pt of this.rawPoints) {
        pt.isTg20Applied = false;
        pt.currentH = pt.h !== null && pt.h !== undefined ? pt.h.toFixed(3) : "-";
      }
      return true;
    }

    const dom = this.centralMeridian || 30;
    const geodesy = this.geodesy || fallbackGeodesyEngine;

    // 1. Çift Okumaları İndirge
    for (let pair of this.matchedPairs) {
      const avgE = parseFloat(pair.avgE);
      const avgN = parseFloat(pair.avgN);
      const avgH = parseFloat(pair.avgH);

      let lat = pair.p1?.lat || pair.p1?.latDec || pair.p2?.lat || pair.p2?.latDec;
      let lon = pair.p1?.lon || pair.p1?.lonDec || pair.p2?.lon || pair.p2?.lonDec;

      if ((!lat || !lon) && geodesy && avgE && avgN) {
        try {
          const geo = geodesy.inverseTM(avgE, avgN, dom);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }

      if (lat && lon && !isNaN(avgH)) {
        const red = tg20Engine.reduceHeight(lat, lon, avgH);
        if (red.inBounds && red.N !== null) {
          pair.tg20N = red.N.toFixed(3);
          pair.avgOrthoH = red.H.toFixed(3);
          pair.currentH = pair.avgOrthoH;
          pair.isTg20Applied = true;
        } else {
          pair.isTg20Applied = false;
          pair.currentH = pair.avgH;
        }
      } else {
        pair.isTg20Applied = false;
        pair.currentH = pair.avgH;
      }
    }

    // 2. Ham Noktaları İndirge
    for (let pt of this.rawPoints) {
      let lat = pt.lat || pt.latDec;
      let lon = pt.lon || pt.lonDec;

      if ((!lat || !lon) && geodesy && pt.e && pt.n) {
        try {
          const geo = geodesy.inverseTM(pt.e, pt.n, dom);
          lat = geo.lat;
          lon = geo.lon;
          pt.lat = lat;
          pt.lon = lon;
          pt.latDec = lat;
          pt.lonDec = lon;
        } catch (e) {}
      }

      if (lat && lon && pt.h !== null && pt.h !== undefined && !isNaN(pt.h)) {
        const red = tg20Engine.reduceHeight(lat, lon, pt.h);
        if (red.inBounds && red.N !== null) {
          pt.tg20N = red.N.toFixed(3);
          pt.orthoH = red.H;
          pt.currentH = red.H.toFixed(3);
          pt.isTg20Applied = true;
        } else {
          pt.isTg20Applied = false;
          pt.currentH = pt.h.toFixed(3);
        }
      } else {
        pt.isTg20Applied = false;
        pt.currentH = pt.h !== null && pt.h !== undefined ? pt.h.toFixed(3) : "-";
      }
    }

    // 3. Tekil Noktaları İndirge
    for (let pt of this.unmatchedPoints) {
      let lat = pt.lat || pt.latDec;
      let lon = pt.lon || pt.lonDec;

      if ((!lat || !lon) && geodesy && pt.e && pt.n) {
        try {
          const geo = geodesy.inverseTM(pt.e, pt.n, dom);
          lat = geo.lat;
          lon = geo.lon;
          pt.lat = lat;
          pt.lon = lon;
          pt.latDec = lat;
          pt.lonDec = lon;
        } catch (e) {}
      }

      if (lat && lon && pt.h !== null && pt.h !== undefined && !isNaN(pt.h)) {
        const red = tg20Engine.reduceHeight(lat, lon, pt.h);
        if (red.inBounds && red.N !== null) {
          pt.tg20N = red.N.toFixed(3);
          pt.orthoH = red.H;
          pt.currentH = red.H.toFixed(3);
          pt.isTg20Applied = true;
        } else {
          pt.isTg20Applied = false;
          pt.currentH = pt.h.toFixed(3);
        }
      } else {
        pt.isTg20Applied = false;
        pt.currentH = pt.h !== null && pt.h !== undefined ? pt.h.toFixed(3) : "-";
      }
    }

    return true;
  }

  /**
   * Metin Bazlı TG-20 İndirgeme Raporu Üretir
   */
  exportTg20ReductionReport(projectName = "GNSS_RTK_TG20_Indirgeme") {
    const dateStr = new Date().toLocaleDateString("tr-TR");
    const reportPoints = [];

    for (let pair of this.matchedPairs) {
      if (pair.isTg20Applied && pair.avgOrthoH) {
        reportPoints.push({
          name: pair.pointName,
          lat: pair.p1?.lat || pair.p1?.latDec || pair.p2?.lat || pair.p2?.latDec || "",
          lon: pair.p1?.lon || pair.p1?.lonDec || pair.p2?.lon || pair.p2?.lonDec || "",
          y: pair.avgE,
          x: pair.avgN,
          h: pair.avgH,
          N: pair.tg20N,
          H: pair.avgOrthoH,
          type: "Çift Okuma Ort."
        });
      }
    }

    for (let pt of this.unmatchedPoints) {
      if (pt.isTg20Applied && pt.orthoH !== undefined) {
        reportPoints.push({
          name: pt.pn,
          lat: pt.lat || pt.latDec || "",
          lon: pt.lon || pt.lonDec || "",
          y: pt.e.toFixed(3),
          x: pt.n.toFixed(3),
          h: pt.h.toFixed(3),
          N: pt.tg20N,
          H: pt.orthoH.toFixed(3),
          type: "Tekil Ölçü"
        });
      }
    }

    let rpt = "========================================================================================\n";
    rpt += "    GNSS POS WEB STUDIO - TG-20 JEOİT İNDİRGEME RAPORU (GPSFormat Entegrasyonu)     \n";
    rpt += "========================================================================================\n";
    rpt += `Proje / Dosya       : ${projectName}\n`;
    rpt += "Jeoit Modeli        : Harita Genel Müdürlüğü TG-20 (Türkiye Hibrit Jeoidi 2020)\n";
    rpt += `Projeksiyon         : ITRF-96 TM 3° Dilim ${this.centralMeridian}° E\n`;
    rpt += `Tarih               : ${dateStr}\n`;
    rpt += `Toplam Nokta Sayısı : ${reportPoints.length}\n`;
    rpt += "Temel Bağıntı       : H (Ortometrik) = h (Elipsoit) - N (Jeoit Undülasyonu)\n";
    rpt += "----------------------------------------------------------------------------------------\n";
    rpt += "NOKTA ADI      ENLEM (Lat)  BOYLAM (Lon)  Y (Sağa)       X (Yukarı)     ELİP.(h)   JEOİT(N)  ORT.(H)   TİP\n";
    rpt += "----------------------------------------------------------------------------------------\n";

    for (let p of reportPoints) {
      const pName = String(p.name).padEnd(14, " ");
      const latStr = p.lat ? parseFloat(p.lat).toFixed(6).padStart(11, " ") : "     -     ";
      const lonStr = p.lon ? parseFloat(p.lon).toFixed(6).padStart(12, " ") : "      -      ";
      const yStr = String(p.y).padStart(14, " ");
      const xStr = String(p.x).padStart(14, " ");
      const hStr = String(p.h).padStart(9, " ");
      const nStr = (`+${p.N}`).padStart(9, " ");
      const bigHStr = String(p.H).padStart(9, " ");

      rpt += `${pName} ${latStr} ${lonStr} ${yStr} ${xStr} ${hStr} ${nStr} ${bigHStr}   ${p.type}\n`;
    }

    rpt += "========================================================================================\n";
    rpt += "NOT: Elipsoit Kotları (h) GPS/GNSS ölçümünden, Ortometrik Kotlar (H) TG-20 indirgeme\n";
    rpt += "     sonucu hesaplanmıştır. Bu rapor resmi kadastro işlemlerinde referans olarak kullanılabilir.\n";
    rpt += "========================================================================================\n";

    return rpt;
  }

  /**
   * Dil Çeviri Yardımcısı (i18n Fallback Resolver)
   */
  getI18n(key, fallback = "") {
    if (typeof t === "function") {
      const val = t(key);
      if (val && val !== key) return val;
    }
    if (typeof window !== "undefined" && window.__HARITA_TR_TRANSLATIONS__) {
      const parts = key.split(".");
      let curr = window.__HARITA_TR_TRANSLATIONS__;
      for (let p of parts) {
        if (curr && typeof curr === "object") curr = curr[p];
        else return fallback;
      }
      if (curr) return curr;
    }
    return fallback;
  }

  /**
   * Yazdırılabilir / PDF Kaydedilebilir A4 TG-20 Raporu HTML Şablonu Üretir
   */
  generatePrintableTg20Report(projectName = "GNSS RTK / CORS ÖLÇÜLERİ TG-20 İNDİRGEME RAPORU", externalTg20 = null, externalGeodesy = null) {
    const curDate = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const curTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

    const reportRows = [];
    const tg20Engine = externalTg20 || (typeof state !== "undefined" ? state.tg20Engine : null);
    const geodesyEngine = this.geodesy || externalGeodesy || (typeof state !== "undefined" ? state.geodesyEngine : null);
    const dom = this.centralMeridian || 30;

    for (let pair of this.matchedPairs) {
      let lat = pair.p1?.lat || pair.p1?.latDec || pair.p2?.lat || pair.p2?.latDec;
      let lon = pair.p1?.lon || pair.p1?.lonDec || pair.p2?.lon || pair.p2?.lonDec;
      const eVal = parseFloat(pair.avgE);
      const nVal = parseFloat(pair.avgN);
      const hVal = parseFloat(pair.avgH);

      if ((!lat || !lon) && geodesyEngine && eVal && nVal) {
        try {
          const geo = geodesyEngine.inverseTM(eVal, nVal, dom);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }

      let nStr = pair.tg20N;
      let hStr = pair.avgOrthoH;

      if ((!nStr || nStr === "--") && tg20Engine && lat && lon) {
        const red = tg20Engine.reduceHeight(lat, lon, hVal);
        if (red.inBounds && red.N !== null) {
          nStr = red.N.toFixed(3);
          hStr = red.H.toFixed(3);
          pair.tg20N = nStr;
          pair.avgOrthoH = hStr;
        }
      }

      reportRows.push({
        name: pair.pointName,
        lat: lat ? lat.toFixed(6) : "-",
        lon: lon ? lon.toFixed(6) : "-",
        y: pair.avgE,
        x: pair.avgN,
        h: pair.avgH,
        N: nStr ? (nStr.startsWith("+") || nStr.startsWith("-") ? nStr : `+${nStr}`) : "--",
        H: hStr || pair.avgH,
        type: this.getI18n("reports.typeDualAvg", "Çift Okuma Ort.")
      });
    }

    for (let pt of this.unmatchedPoints) {
      let lat = pt.lat || pt.latDec;
      let lon = pt.lon || pt.lonDec;

      if ((!lat || !lon) && geodesyEngine && pt.e && pt.n) {
        try {
          const geo = geodesyEngine.inverseTM(pt.e, pt.n, dom);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }

      let nStr = pt.tg20N;
      let hStr = pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : null;

      if ((!nStr || nStr === "--") && tg20Engine && lat && lon) {
        const red = tg20Engine.reduceHeight(lat, lon, pt.h);
        if (red.inBounds && red.N !== null) {
          nStr = red.N.toFixed(3);
          hStr = red.H.toFixed(3);
          pt.tg20N = nStr;
          pt.orthoH = red.H;
        }
      }

      reportRows.push({
        name: pt.pn,
        lat: lat ? lat.toFixed(6) : "-",
        lon: lon ? lon.toFixed(6) : "-",
        y: pt.e.toFixed(3),
        x: pt.n.toFixed(3),
        h: pt.h.toFixed(3),
        N: nStr ? (nStr.startsWith("+") || nStr.startsWith("-") ? nStr : `+${nStr}`) : "--",
        H: hStr || pt.h.toFixed(3),
        type: this.getI18n("reports.typeSingle", "Tekil Ölçü")
      });
    }

    const nNumList = reportRows.map(r => parseFloat(r.N)).filter(v => !isNaN(v));
    const avgUndulation = nNumList.length > 0 ? (nNumList.reduce((a, b) => a + b, 0) / nNumList.length) : 0;

    let template = (typeof window !== "undefined" && window.GnssReportTemplates?.getTg20Template)
      ? window.GnssReportTemplates.getTg20Template()
      : "";

    let rowsHtml = "";
    if (reportRows.length === 0) {
      rowsHtml = `<tr><td colspan="10" class="empty-table-cell">${this.getI18n("reports.emptyData", "İndirgenecek koordinat verisi bulunamadı.")}</td></tr>`;
    } else {
      rowsHtml = reportRows.map((r, idx) => {
        const badgeCls = r.type.includes(this.getI18n("reports.typeDualAvg", "Çift")) ? "badge-pair" : "badge-single";
        return `
          <tr>
            <td class="col-mono col-dim">${idx + 1}</td>
            <td class="col-name">${r.name}</td>
            <td class="col-mono">${r.lat}°</td>
            <td class="col-mono">${r.lon}°</td>
            <td class="col-mono">${r.y}</td>
            <td class="col-mono">${r.x}</td>
            <td class="col-mono">${r.h} m</td>
            <td class="col-geoid">${r.N} m</td>
            <td class="col-ortho">${r.H} m</td>
            <td><span class="${badgeCls}">${r.type}</span></td>
          </tr>
        `;
      }).join("");
    }

    const avgUndulationStr = `${avgUndulation > 0 ? "+" : ""}${avgUndulation.toFixed(3)} m`;
    const totalPointsStr = `${reportRows.length} ${this.getI18n("reports.thPointName", "Nokta")} (${this.matchedPairs.length} ${this.getI18n("reports.typeDualAvg", "Çift Okuma")}, ${this.unmatchedPoints.length} ${this.getI18n("reports.typeSingle", "Tekil")})`;
    const projStr = this.getI18n("reports.lblProjectionVal", "ITRF-96 TM 3° Dilim {meridian}° E").replace("{meridian}", this.centralMeridian);

    return template
      .replace(/{{TITLE}}/g, projectName)
      .replace(/{{PROJECT}}/g, projectName)
      .replace(/{{DATE}}/g, curDate)
      .replace(/{{TIME}}/g, curTime)
      .replace(/{{MERIDIAN}}/g, String(this.centralMeridian))
      .replace(/{{PROJECTION_STR}}/g, projStr)
      .replace(/{{TOTAL_POINTS}}/g, totalPointsStr)
      .replace(/{{AVG_UNDULATION}}/g, avgUndulationStr)
      .replace(/{{TABLE_ROWS}}/g, rowsHtml)
      .replace(/{{BTN_PRINT}}/g, this.getI18n("reports.btnPrint", "🖨️ Yazdır / PDF Kaydet"))
      .replace(/{{BRAND_TITLE}}/g, this.getI18n("reports.tg20BrandTitle", "HARİTA TOOLS — JEODEZİ & GNSS STÜDYOSU"))
      .replace(/{{BRAND_SUB}}/g, this.getI18n("reports.tg20BrandSub", "Profesyonel Jeodezi, Fotogrametri & GNSS Hesaplama Platformu | Geografik Harita ve Coğrafi Bilgi Teknolojileri"))
      .replace(/{{META_HEADER}}/g, this.getI18n("reports.tg20MetaHeader", "TUSAGA-Aktif TG-20 Raporu"))
      .replace(/{{LBL_DATETIME}}/g, this.getI18n("reports.lblDateTime", "Tarih / Saat:"))
      .replace(/{{MAIN_TITLE}}/g, this.getI18n("reports.tg20MainTitle", "TG-20 TÜRKİYE HİBRİT JEOİDİ ORTOMETRİK KOT İNDİRGEME RAPORU"))
      .replace(/{{SUB_TITLE}}/g, this.getI18n("reports.tg20SubTitle", "TUSAGA-Aktif (CORS-TR) Ölçümleri Helmert Ortometrik Nivelman Kotu (TUDKA-99) Çetelesi (BÖHHBÜY Standartları)"))
      .replace(/{{LBL_PROJECT}}/g, this.getI18n("reports.lblProject", "Proje / Dosya:"))
      .replace(/{{LBL_CALC_DATE}}/g, this.getI18n("reports.lblCalcDate", "Hesaplama Tarihi:"))
      .replace(/{{LBL_PROJECTION}}/g, this.getI18n("reports.lblProjection", "Projeksiyon:"))
      .replace(/{{LBL_GEOID_MODEL}}/g, this.getI18n("reports.lblGeoidModel", "Kullanılan Jeoit Modeli:"))
      .replace(/{{VAL_GEOID_MODEL}}/g, this.getI18n("reports.valGeoidModel", "HGM TG-20 (Türkiye Hibrit Jeoidi 2020)"))
      .replace(/{{LBL_TOTAL_POINTS}}/g, this.getI18n("reports.lblTotalPoints", "Toplam Nokta:"))
      .replace(/{{LBL_VERTICAL_DATUM}}/g, this.getI18n("reports.lblVerticalDatum", "Düşey Referans Sistemi:"))
      .replace(/{{VAL_VERTICAL_DATUM}}/g, this.getI18n("reports.valVerticalDatum", "TUDKA-99 (Türkiye Ulusal Düşey Kontrol Ağı)"))
      .replace(/{{FORMULA_TITLE}}/g, this.getI18n("reports.formulaTitle", "Temel Formül:"))
      .replace(/{{AVG_UNDULATION_PREFIX}}/g, this.getI18n("reports.avgUndulationPrefix", "Bölgesel Ortalama Jeoit Undülasyonu:"))
      .replace(/{{TH_NUM}}/g, this.getI18n("reports.thNum", "#"))
      .replace(/{{TH_POINT_NAME}}/g, this.getI18n("reports.thPointName", "Nokta Adı"))
      .replace(/{{TH_LAT}}/g, this.getI18n("reports.thLat", "WGS-84 Enlem (ϕ)"))
      .replace(/{{TH_LON}}/g, this.getI18n("reports.thLon", "WGS-84 Boylam (λ)"))
      .replace(/{{TH_EAST_M}}/g, this.getI18n("reports.thEastM", "Y (Sağa - m)"))
      .replace(/{{TH_NORTH_M}}/g, this.getI18n("reports.thNorthM", "X (Yukarı - m)"))
      .replace(/{{TH_ELEV_ELLIPSOID_M}}/g, this.getI18n("reports.thElevEllipsoidM", "Elipsoit Kotu (h / m)"))
      .replace(/{{TH_UNDULATION_M}}/g, this.getI18n("reports.thUndulationM", "TG-20 Undülasyon (N / m)"))
      .replace(/{{TH_ELEV_ORTHO_M}}/g, this.getI18n("reports.thElevOrthoM", "Ortometrik Kot (H / m)"))
      .replace(/{{TH_OBS_TYPE}}/g, this.getI18n("reports.thObsType", "Ölçüm Tipi"))
      .replace(/{{DISCLAIMER_TITLE}}/g, this.getI18n("reports.disclaimerTitle", "⚠️ Yasal Bilgilendirme ve Sorumluluk Reddi Beyanı"))
      .replace(/{{DISCLAIMER_TEXT}}/g, this.getI18n("reports.disclaimerText", "Bu hesaplama raporu..."))
      .replace(/{{FOOTER_BRAND}}/g, this.getI18n("reports.footerBrand", "Harita Tools © 2026 | Jeodezi & GNSS Stüdyosu — Geografik Harita ve Coğrafi Bilgi Teknolojileri"))
      .replace(/{{FOOTER_REF}}/g, this.getI18n("reports.footerRef", "Referans: HGM TG-20 (TUDKA-99 Helmert Ortometrik Yükseklik)"))
      .replace(/{{FOOTER_PAGE}}/g, this.getI18n("reports.footerPage", "Sayfa 1 / 1"));
  }

  /**
   * AutoCAD .DXF Çizim Metni Üretir (Noktalar, İsimler, Kotlar, Hata Vektörleri Katmanları)
   */
  exportDxfText() {
    let dxf = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n5\n";
    dxf += "0\nLAYER\n2\nNOKTALAR\n70\n0\n62\n7\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nNOKTA_ADLARI\n70\n0\n62\n3\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nKOTLAR\n70\n0\n62\n4\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nTEKIL_NOKTALAR\n70\n0\n62\n1\n6\nCONTINUOUS\n0\n";
    dxf += "LAYER\n2\nHATA_VEKTORLERI\n70\n0\n62\n1\n6\nCONTINUOUS\n0\n";
    dxf += "ENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";

    for (let pair of this.matchedPairs) {
      const eVal = parseFloat(pair.avgE);
      const nVal = parseFloat(pair.avgN);
      const hVal = this.isTg20Applied && pair.avgOrthoH ? parseFloat(pair.avgOrthoH) : parseFloat(pair.avgH);

      dxf += `0\nPOINT\n8\nNOKTALAR\n10\n${eVal}\n20\n${nVal}\n30\n${hVal}\n`;
      dxf += `0\nTEXT\n8\nNOKTA_ADLARI\n10\n${eVal + 0.5}\n20\n${nVal + 0.5}\n30\n${hVal}\n40\n1.2\n1\n${pair.pointName}\n`;
      dxf += `0\nTEXT\n8\nKOTLAR\n10\n${eVal + 0.5}\n20\n${nVal - 1.2}\n30\n${hVal}\n40\n1.0\n1\n${hVal.toFixed(2)}\n`;
      dxf += `0\nLINE\n8\nHATA_VEKTORLERI\n10\n${pair.p1.e}\n20\n${pair.p1.n}\n30\n${pair.p1.h}\n11\n${pair.p2.e}\n21\n${pair.p2.n}\n31\n${pair.p2.h}\n`;
    }

    for (let pt of this.unmatchedPoints) {
      const eVal = pt.e;
      const nVal = pt.n;
      const hVal = this.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH : pt.h;

      dxf += `0\nPOINT\n8\nTEKIL_NOKTALAR\n10\n${eVal}\n20\n${nVal}\n30\n${hVal}\n`;
      dxf += `0\nTEXT\n8\nNOKTA_ADLARI\n10\n${eVal + 0.5}\n20\n${nVal + 0.5}\n30\n${hVal}\n40\n1.2\n1\n${pt.pn}\n`;
      dxf += `0\nTEXT\n8\nKOTLAR\n10\n${eVal + 0.5}\n20\n${nVal - 1.2}\n30\n${hVal}\n40\n1.0\n1\n${hVal.toFixed(2)}\n`;
    }

    dxf += "0\nENDSEC\n0\nEOF\n";
    return dxf;
  }

  /**
   * Netcad .KOS Formatında Nokta Listesi Üretir
   */
  exportKosText() {
    let kos = "; NETCAD KOS FORMATI - GNSS KADASTRO CETELERI\n";
    for (let pair of this.matchedPairs) {
      const hVal = this.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;
      kos += `NOKTA ${pair.pointName} Y=${pair.avgE} X=${pair.avgN} Z=${hVal} dS=${pair.ds2d}cm\n`;
    }
    return kos;
  }

  /**
   * Netcad .NCN Formatında Nokta Listesi Üretir
   */
  exportNcnText() {
    let ncn = "";
    for (let pair of this.matchedPairs) {
      const hVal = this.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;
      ncn += `${pair.pointName.padEnd(14, " ")} ${pair.avgE.padStart(12, " ")} ${pair.avgN.padStart(12, " ")} ${hVal.padStart(10, " ")}\n`;
    }
    for (let pt of this.unmatchedPoints) {
      const hVal = this.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : pt.h.toFixed(3);
      ncn += `${pt.pn.padEnd(14, " ")} ${pt.e.toFixed(3).padStart(12, " ")} ${pt.n.toFixed(3).padStart(12, " ")} ${hVal.padStart(10, " ")}\n`;
    }
    return ncn;
  }

  /**
   * Google Earth .KML Formatında Nokta ve Detay Bilgilerini Üretir
   */
  exportKmlText() {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>Kadastro GNSS Olculeri</name>
`;

    for (let pair of this.matchedPairs) {
      let lat = pair.p1?.lat ?? pair.p1?.latDec;
      let lon = pair.p1?.lon ?? pair.p1?.lonDec;
      if ((lat === undefined || lon === undefined) && this.geodesy && pair.avgE && pair.avgN) {
        try {
          const geo = this.geodesy.inverseTM(parseFloat(pair.avgE), parseFloat(pair.avgN), this.centralMeridian, 1.0, false);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }
      lat = lat !== undefined ? lat : 39.0;
      lon = lon !== undefined ? lon : 35.0;
      const hVal = this.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;
      const timeDisplay = pair.timeDiffStr || `${pair.timeDiffMin} dk`;

      kml += `
  <Placemark>
    <name>${pair.pointName}</name>
    <description><![CDATA[
      <b>Nokta:</b> ${pair.pointName}<br>
      <b>Fark (dS):</b> ${pair.ds2d} cm (${pair.isDistPassed ? "UYGUN" : "LIMIT DISI"})<br>
      <b>Zaman Farkı:</b> ${timeDisplay} (${pair.isTimePassed ? "≥60 dk UYGUN" : "<60 dk YETERSIZ"})<br>
      <b>Ortalama Y:</b> ${pair.avgE}<br>
      <b>Ortalama X:</b> ${pair.avgN}<br>
      <b>Kot (H):</b> ${hVal} ${this.isTg20Applied ? "(TG-20 Ortometrik)" : "(Elipsoit)"}<br>
      <b>Enlem (Lat):</b> ${lat.toFixed(8)}°<br>
      <b>Boylam (Lon):</b> ${lon.toFixed(8)}°
    ]]></description>
    <Point>
      <coordinates>${lon},${lat},${hVal}</coordinates>
    </Point>
  </Placemark>
`;
    }

    for (let pt of this.unmatchedPoints) {
      let lat = pt.lat ?? pt.latDec;
      let lon = pt.lon ?? pt.lonDec;
      if ((lat === undefined || lon === undefined) && this.geodesy && pt.e && pt.n) {
        try {
          const geo = this.geodesy.inverseTM(pt.e, pt.n, this.centralMeridian, 1.0, false);
          lat = geo.lat;
          lon = geo.lon;
        } catch (e) {}
      }
      lat = lat !== undefined ? lat : 39.0;
      lon = lon !== undefined ? lon : 35.0;
      const hVal = this.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : pt.h.toFixed(3);

      kml += `
  <Placemark>
    <name>${pt.pn} (Tekil)</name>
    <description><![CDATA[
      <b>Nokta:</b> ${pt.pn} (Tekil Ölçü)<br>
      <b>Y:</b> ${pt.e.toFixed(3)}<br>
      <b>X:</b> ${pt.n.toFixed(3)}<br>
      <b>Kot (H):</b> ${hVal} ${this.isTg20Applied ? "(TG-20 Ortometrik)" : "(Elipsoit)"}<br>
      <b>Enlem (Lat):</b> ${lat.toFixed(8)}°<br>
      <b>Boylam (Lon):</b> ${lon.toFixed(8)}°
    ]]></description>
    <Point>
      <coordinates>${lon},${lat},${hVal}</coordinates>
    </Point>
  </Placemark>
`;
    }

    kml += "</Document>\n</kml>";
    return kml;
  }

  /**
   * Resmi Kadastro Çift Okuma Kontrol Çetelesini CSV Formatında İhraç Eder
   */
  exportCadastreCsv() {
    let csv = this.isTg20Applied
      ? "Nokta_No,1_Tarih,1_Saat,2_Tarih,2_Saat,Zaman_Farki_Dk,Zaman_Farki_Saat,dY_cm,dX_cm,dH_cm,dS_cm,Hata_Durumu,Zaman_Durumu,Ortalama_Y,Ortalama_X,Elipsoit_H,TG20_Undulasyon_N,Ortometrik_H,Olcu_Tipi\n"
      : "Nokta_No,1_Tarih,1_Saat,2_Tarih,2_Saat,Zaman_Farki_Dk,Zaman_Farki_Saat,dY_cm,dX_cm,dH_cm,dS_cm,Hata_Durumu,Zaman_Durumu,Ortalama_Y,Ortalama_X,Ortalama_H,Olcu_Tipi\n";

    for (let pair of this.matchedPairs) {
      if (this.isTg20Applied) {
        csv += `${pair.pointName},${pair.p1.dt},${pair.p1.tm},${pair.p2.dt},${pair.p2.tm},${pair.timeDiffMin},${pair.timeDiffHours},${pair.dy},${pair.dx},${pair.dh},${pair.ds2d},${pair.isDistPassed ? "UYGUN" : "LIMIT_ASILDI"},${pair.isTimePassed ? "UYGUN" : "YETERSIZ"},${pair.avgE},${pair.avgN},${pair.avgH},${pair.tg20N || ""},${pair.avgOrthoH || pair.avgH},Cift_Okuma\n`;
      } else {
        csv += `${pair.pointName},${pair.p1.dt},${pair.p1.tm},${pair.p2.dt},${pair.p2.tm},${pair.timeDiffMin},${pair.timeDiffHours},${pair.dy},${pair.dx},${pair.dh},${pair.ds2d},${pair.isDistPassed ? "UYGUN" : "LIMIT_ASILDI"},${pair.isTimePassed ? "UYGUN" : "YETERSIZ"},${pair.avgE},${pair.avgN},${pair.avgH},Cift_Okuma\n`;
      }
    }

    for (let pt of this.unmatchedPoints) {
      if (this.isTg20Applied) {
        csv += `${pt.pn},${pt.dt || ""},${pt.tm || ""},--,--,--,--,--,--,--,--,--,--,${pt.e.toFixed(3)},${pt.n.toFixed(3)},${pt.h.toFixed(3)},${pt.tg20N || ""},${pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : pt.h.toFixed(3)},Tekil_Olcu\n`;
      } else {
        csv += `${pt.pn},${pt.dt || ""},${pt.tm || ""},--,--,--,--,--,--,--,--,--,--,${pt.e.toFixed(3)},${pt.n.toFixed(3)},${pt.h.toFixed(3)},Tekil_Olcu\n`;
      }
    }

    return csv;
  }

  /**
   * Yazdırılabilir Resmi Kadastro Çift Okuma Çetelesi HTML Çıktısı Üretir
   */
  generatePrintableCadastreReport(title = "KADASTRO RTK/CORS ÖLÇÜ KONTROL ÇETELESİ") {
    const curDate = new Date().toLocaleDateString("tr-TR");

    const emptyPairsMsg = this.getI18n("reports.noMatchedPairs", "Bu veri setinde çift okuma (eşleşen) nokta bulunmamaktadır. Tüm ölçüler tekil olarak Tablo 2'de listelenmiştir.");
    let pairsRows = "";
    if (this.matchedPairs.length === 0) {
      pairsRows = `<tr><td colspan="14" class="empty-table-cell">${emptyPairsMsg}</td></tr>`;
    } else {
      pairsRows = this.matchedPairs.map(pair => {
        const distClass = pair.isDistPassed ? "passed" : "failed";
        const distLabel = pair.isDistPassed ? this.getI18n("reports.statusPassed", "UYGUN") : this.getI18n("reports.statusFailed", "LİMİT DIŞI");
        const timeClass = pair.isTimePassed ? "passed" : "warning";
        const hVal = this.isTg20Applied && pair.avgOrthoH ? pair.avgOrthoH : pair.avgH;

        return `
          <tr>
            <td><strong>${pair.pointName}</strong></td>
            <td>${pair.p1.dt || "-"}</td>
            <td>${pair.p1.tm || "-"}</td>
            <td>${pair.p2.dt || "-"}</td>
            <td>${pair.p2.tm || "-"}</td>
            <td class="${timeClass}">${pair.timeDiffStr || `${pair.timeDiffMin} dk`}</td>
            <td>${pair.dy}</td>
            <td>${pair.dx}</td>
            <td>${pair.dh}</td>
            <td class="font-bold">${pair.ds2d}</td>
            <td class="${distClass}">${distLabel}</td>
            <td>${pair.avgE}</td>
            <td>${pair.avgN}</td>
            <td>${hVal}</td>
          </tr>
        `;
      }).join("");
    }

    let unmatchedSection = "";
    if (this.unmatchedPoints && this.unmatchedPoints.length > 0) {
      const unmatchedRows = this.unmatchedPoints.map((pt, idx) => {
        const hVal = this.isTg20Applied && pt.orthoH !== undefined ? pt.orthoH.toFixed(3) : (pt.h != null ? pt.h.toFixed(3) : "-");
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${pt.pn}</strong></td>
            <td>${pt.dt || "-"}</td>
            <td>${pt.tm || "-"}</td>
            <td>${pt.e != null ? pt.e.toFixed(3) : "-"}</td>
            <td>${pt.n != null ? pt.n.toFixed(3) : "-"}</td>
            <td class="font-bold">${hVal}</td>
            <td>${pt.hsdvVal != null ? (pt.hsdvVal * 1000).toFixed(1) : "-"}</td>
            <td>${pt.pdop || "-"}</td>
            <td>${pt.sats || "-"}</td>
            <td><span class="badge-single-warn">${this.getI18n("reports.badgeSingleWarn", "Tek Ölçü (2. Okuma Yok)")}</span></td>
          </tr>
        `;
      }).join("");

      const sec2Title = this.getI18n("reports.cadastreSec2Title", "2. İKİNCİ OKUMASI BULUNMAYAN (TEKİL) NOKTALAR TABLOSU");
      const hTitle = this.isTg20Applied ? this.getI18n("reports.thElevOrtho", "Ortometrik H (TG-20)") : this.getI18n("reports.thElevEllipsoid", "Elipsoit Kotu (h)");

      unmatchedSection = `
  <h4>${sec2Title}</h4>
  <table class="report-table-compact">
    <thead>
      <tr>
        <th>${this.getI18n("reports.thNum", "#")}</th>
        <th>${this.getI18n("reports.thPointName", "Nokta Adı")}</th>
        <th>${this.getI18n("reports.thDate", "Tarih")}</th>
        <th>${this.getI18n("reports.thTime", "Saat")}</th>
        <th>${this.getI18n("reports.thEastM", "Y (Sağa - m)")}</th>
        <th>${this.getI18n("reports.thNorthM", "X (Yukarı - m)")}</th>
        <th>${hTitle}</th>
        <th>${this.getI18n("reports.thHrms", "hRMS (mm)")}</th>
        <th>${this.getI18n("reports.thPdop", "PDOP")}</th>
        <th>${this.getI18n("reports.thSats", "Uydu")}</th>
        <th>${this.getI18n("reports.thStatus", "Durum")}</th>
      </tr>
    </thead>
    <tbody>
      ${unmatchedRows}
    </tbody>
  </table>
      `;
    }

    let template = (typeof window !== "undefined" && window.GnssReportTemplates?.getCadastreTemplate)
      ? window.GnssReportTemplates.getCadastreTemplate()
      : "";

    const projStr = this.getI18n("reports.lblProjectionVal", "ITRF-96 TM 3° Dilim {meridian}° E").replace("{meridian}", this.centralMeridian);

    return template
      .replace(/{{TITLE}}/g, title)
      .replace(/{{DATE}}/g, curDate)
      .replace(/{{MERIDIAN}}/g, String(this.centralMeridian))
      .replace(/{{PROJECTION_STR}}/g, projStr)
      .replace(/{{ERROR_LIMIT_STR}}/g, this.getI18n("reports.lblErrorLimitVal", "≤ 7.0 cm"))
      .replace(/{{MIN_TIME_STR}}/g, this.getI18n("reports.lblMinTimeVal", "≥ 60 Dk"))
      .replace(/{{TG20_LABEL}}/g, this.isTg20Applied ? "(TG-20)" : "")
      .replace(/{{PAIRS_ROWS}}/g, pairsRows)
      .replace(/{{UNMATCHED_SECTION}}/g, unmatchedSection)
      .replace(/{{AGENCY_TITLE}}/g, this.getI18n("reports.cadastreAgencyTitle", "T.C. TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ"))
      .replace(/{{REPORT_SUBTITLE}}/g, this.getI18n("reports.cadastreReportSubTitle", "TUSAGA-AKTİF (CORS-TR) ÇİFT OKUMA VE KONTROL ÇETELESİ"))
      .replace(/{{LBL_JOB_FILE}}/g, this.getI18n("reports.lblJobFile", "İş / Dosya:"))
      .replace(/{{LBL_DATE}}/g, this.getI18n("reports.lblDate", "Tarih:"))
      .replace(/{{LBL_PROJECTION}}/g, this.getI18n("reports.lblProjection", "Projeksiyon:"))
      .replace(/{{LBL_ERROR_LIMIT}}/g, this.getI18n("reports.lblErrorLimit", "Hata Limiti (dS):"))
      .replace(/{{LBL_MIN_TIME}}/g, this.getI18n("reports.lblMinTime", "Min. Zaman:"))
      .replace(/{{SEC1_TITLE}}/g, this.getI18n("reports.cadastreSec1Title", "1. ÇİFT OKUMA VE FARK KONTROL TABLOSU"))
      .replace(/{{TH_POINT_NO}}/g, this.getI18n("reports.thPointNo", "Nokta No"))
      .replace(/{{TH_OBS1_TIME}}/g, this.getI18n("reports.thObs1Time", "1. Ölçü (Zaman)"))
      .replace(/{{TH_OBS2_TIME}}/g, this.getI18n("reports.thObs2Time", "2. Ölçü (Zaman)"))
      .replace(/{{TH_TIME_DIFF}}/g, this.getI18n("reports.thTimeDiff", "Zaman Farkı"))
      .replace(/{{TH_DIFFS}}/g, this.getI18n("reports.thDiffs", "Farklar (cm)"))
      .replace(/{{TH_DS2D}}/g, this.getI18n("reports.thDs2d", "dS (2B) (cm)"))
      .replace(/{{TH_CONTROL}}/g, this.getI18n("reports.thControl", "Kontrol (≤7cm)"))
      .replace(/{{TH_AVG_COORDS}}/g, this.getI18n("reports.thAvgCoords", "Ortalama Koordinatlar (m)"))
      .replace(/{{TH_DATE}}/g, this.getI18n("reports.thDate", "Tarih"))
      .replace(/{{TH_TIME}}/g, this.getI18n("reports.thTime", "Saat"))
      .replace(/{{TH_DY}}/g, this.getI18n("reports.thDy", "dY"))
      .replace(/{{TH_DX}}/g, this.getI18n("reports.thDx", "dX"))
      .replace(/{{TH_DH}}/g, this.getI18n("reports.thDh", "dH"))
      .replace(/{{TH_EAST}}/g, this.getI18n("reports.thEast", "Y (Sağa)"))
      .replace(/{{TH_NORTH}}/g, this.getI18n("reports.thNorth", "X (Yukarı)"))
      .replace(/{{TH_ELEV}}/g, this.getI18n("reports.thElev", "H (Kot)"))
      .replace(/{{SIG_SURVEYOR}}/g, this.getI18n("reports.sigSurveyor", "Ölçümü Yapan<br>Harita Mühendisi / Teknikeri"))
      .replace(/{{SIG_CONTROLLER}}/g, this.getI18n("reports.sigController", "Kontrol Eden<br>Kontrol Mühendisi"))
      .replace(/{{SIG_APPROVER}}/g, this.getI18n("reports.sigApprover", "Onaylayan<br>Kadastro Müdürü / Yetkili"));
  }

  /**
   * Verilen Metin veya Dosya Adından Formatı Otomatik Algılar
   */
  autoDetectFormat(content, fileName = "") {
    const text = (content || "").trim();
    const ext = (fileName || "").split(".").pop().toLowerCase();
    const preview = text.substring(0, 500);

    if (ext === "rw5" || preview.includes("GPS,PN") || preview.includes("JB,NM") || preview.includes("--SurvCE") || preview.includes("--SurvStar")) {
      return { format: "rw5", name: "RW5 Ham Ölçü Dosyası (.rw5)", icon: "fa-satellite-dish" };
    }
    if (ext === "gsi" || preview.includes("WI11") || preview.includes("*11") || /^\*?11\d{4}\+/m.test(preview)) {
      return { format: "gsi", name: "Leica GSI Formatı", icon: "fa-crosshairs" };
    }
    if (ext === "xml" || preview.includes("<LandXML") || preview.includes("<CgPoints>")) {
      return { format: "landxml", name: "LandXML Formatı", icon: "fa-file-code" };
    }
    if (ext === "jxl" || preview.includes("<JOBFile") || preview.includes("<FieldBook")) {
      return { format: "trimble", name: "Trimble Access JXL", icon: "fa-location-arrow" };
    }
    if (ext === "kml" || preview.includes("<kml") || preview.includes("<Placemark>")) {
      return { format: "kml", name: "Google Earth KML", icon: "fa-earth-americas" };
    }
    if (ext === "kmz") {
      return { format: "kmz", name: "Google Earth KMZ", icon: "fa-earth-americas" };
    }
    if (ext === "geojson" || (preview.includes('"type"') && preview.includes("FeatureCollection"))) {
      return { format: "geojson", name: "GeoJSON Standart Formatı", icon: "fa-code" };
    }
    if (ext === "dxf" || preview.includes("ENTITIES") || preview.includes("HEADER") || preview.includes("SECTION")) {
      return { format: "dxf", name: "AutoCAD / Netcad DXF", icon: "fa-vector-square" };
    }
    if (ext === "ncn" || /^[A-Za-z0-9_-]+\s+\d{5,7}\.\d+\s+\d{6,8}\.\d+/m.test(preview)) {
      return { format: "ncn", name: "Netcad NCN Formatı", icon: "fa-map-pin" };
    }
    if (ext === "csv" || preview.includes(",") || preview.includes(";")) {
      return { format: "csv", name: "Standart CSV Tablo Formatı", icon: "fa-file-csv" };
    }

    return { format: "generic", name: "Metin / Sütunlu Koordinat Verisi", icon: "fa-file-lines" };
  }

  /**
   * DXF Çizim Dosyalarını GeoJSON Formatına Dönüştürür (Noktalar, Çizgiler, Poligonlar)
   */
  parseDxfToGeoJson(dxfString, overrideDom = null) {
    const lines = dxfString.split(/\r?\n/);
    const features = [];

    let inEntities = false;
    let lineIdx = 0;
    const rawEntities = [];

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    while (lineIdx < lines.length) {
      const code = lines[lineIdx]?.trim();
      const val = lines[lineIdx + 1]?.trim();
      lineIdx += 2;

      if (code === "0" && val === "SECTION") {
        const nextCode = lines[lineIdx]?.trim();
        const nextVal = lines[lineIdx + 1]?.trim();
        if (nextCode === "2" && nextVal === "ENTITIES") {
          inEntities = true;
          lineIdx += 2;
        }
      } else if (code === "0" && val === "ENDSEC") {
        inEntities = false;
      }

      if (!inEntities) continue;

      if (code === "0" && val === "POINT") {
        let x = null, y = null, z = 0;
        let layer = "Default";

        while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "10") x = parseFloat(v);
          else if (c === "20") y = parseFloat(v);
          else if (c === "30") z = parseFloat(v);
          else if (c === "8") layer = v;
          lineIdx += 2;
        }

        if (x !== null && y !== null && !isNaN(x) && !isNaN(y)) {
          rawEntities.push({ type: "Point", coords: [x, y, z], layer: layer });
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      } else if (code === "0" && val === "LINE") {
        let x1 = null, y1 = null, x2 = null, y2 = null;
        let layer = "Default";

        while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "10") x1 = parseFloat(v);
          else if (c === "20") y1 = parseFloat(v);
          else if (c === "11") x2 = parseFloat(v);
          else if (c === "21") y2 = parseFloat(v);
          else if (c === "8") layer = v;
          lineIdx += 2;
        }

        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          rawEntities.push({ type: "LineString", coords: [[x1, y1], [x2, y2]], layer: layer });
          minX = Math.min(minX, x1, x2); maxX = Math.max(maxX, x1, x2);
          minY = Math.min(minY, y1, y2); maxY = Math.max(maxY, y1, y2);
        }
      } else if (code === "0" && val === "LWPOLYLINE") {
        const polyCoords = [];
        let isClosed = false;
        let layer = "Default";
        let tempX = null;

        while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "70") isClosed = (parseInt(v, 10) & 1) === 1;
          else if (c === "8") layer = v;
          else if (c === "10") tempX = parseFloat(v);
          else if (c === "20" && tempX !== null) {
            const tempY = parseFloat(v);
            polyCoords.push([tempX, tempY]);
            minX = Math.min(minX, tempX); maxX = Math.max(maxX, tempX);
            minY = Math.min(minY, tempY); maxY = Math.max(maxY, tempY);
            tempX = null;
          }
          lineIdx += 2;
        }

        if (polyCoords.length >= 2) {
          if (isClosed && polyCoords.length >= 3) {
            if (polyCoords[0][0] !== polyCoords[polyCoords.length - 1][0] || polyCoords[0][1] !== polyCoords[polyCoords.length - 1][1]) {
              polyCoords.push([polyCoords[0][0], polyCoords[0][1]]);
            }
            rawEntities.push({ type: "Polygon", coords: [polyCoords], layer: layer });
          } else {
            rawEntities.push({ type: "LineString", coords: polyCoords, layer: layer });
          }
        }
      } else if (code === "0" && val === "POLYLINE") {
        const polyCoords = [];
        let layer = "Default";
        let isClosed = false;

        while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "70") isClosed = (parseInt(v, 10) & 1) === 1;
          else if (c === "8") layer = v;
          lineIdx += 2;
        }

        while (lineIdx < lines.length) {
          const c = lines[lineIdx]?.trim();
          const v = lines[lineIdx + 1]?.trim();
          if (c === "0" && v === "SEQEND") {
            lineIdx += 2;
            break;
          }
          if (c === "0" && v === "VERTEX") {
            lineIdx += 2;
            let vx = null, vy = null;
            while (lineIdx < lines.length && lines[lineIdx]?.trim() !== "0") {
              const vc = lines[lineIdx]?.trim();
              const vv = lines[lineIdx + 1]?.trim();
              if (vc === "10") vx = parseFloat(vv);
              else if (vc === "20") vy = parseFloat(vv);
              lineIdx += 2;
            }
            if (vx !== null && vy !== null) {
              polyCoords.push([vx, vy]);
              minX = Math.min(minX, vx); maxX = Math.max(maxX, vx);
              minY = Math.min(minY, vy); maxY = Math.max(maxY, vy);
            }
          } else {
            lineIdx += 2;
          }
        }

        if (polyCoords.length >= 2) {
          if (isClosed && polyCoords.length >= 3) {
            polyCoords.push([polyCoords[0][0], polyCoords[0][1]]);
            rawEntities.push({ type: "Polygon", coords: [polyCoords], layer: layer });
          } else {
            rawEntities.push({ type: "LineString", coords: polyCoords, layer: layer });
          }
        }
      }
    }

    if (rawEntities.length === 0) {
      return { type: "FeatureCollection", features: [] };
    }

    const midX = (minX + maxX) / 2.0;
    const midY = (minY + maxY) / 2.0;

    let isProjected = false;
    let isSwapped = false;
    let detectedDom = overrideDom || 30;

    if (midX > 100000 || midY > 100000) {
      isProjected = true;
      if (midX > 1000000 && midY < 1000000) {
        isSwapped = true;
      }
      if (!overrideDom && this.geodesy) {
        const estCoord = isSwapped ? midY : midX;
        detectedDom = this.geodesy.getAutoCentralMeridian3Deg(estCoord > 1000000 ? estCoord / 100000.0 : 33);
        if (detectedDom < 27 || detectedDom > 45) detectedDom = 30;
      }
    }

    const transformCoord = (coord) => {
      let raw1 = coord[0];
      let raw2 = coord[1];

      if (!isProjected) {
        if (raw1 > 24 && raw1 < 45 && raw2 > 35 && raw2 < 43) return [raw1, raw2];
        else if (raw2 > 24 && raw2 < 45 && raw1 > 35 && raw1 < 43) return [raw2, raw1];
        return [raw1, raw2];
      }

      let easting = isSwapped ? raw2 : raw1;
      let northing = isSwapped ? raw1 : raw2;
      if (easting > 1000000) easting = easting % 1000000;

      if (this.geodesy) {
        const geo = this.geodesy.tmToGeographic(easting, northing, detectedDom, "ITRF96");
        return [geo.lon, geo.lat];
      }
      return [easting, northing];
    };

    for (let ent of rawEntities) {
      if (ent.type === "Point") {
        features.push({
          type: "Feature",
          properties: { layer: ent.layer, name: `DXF Nokta (${ent.layer})` },
          geometry: { type: "Point", coordinates: transformCoord(ent.coords) }
        });
      } else if (ent.type === "LineString") {
        features.push({
          type: "Feature",
          properties: { layer: ent.layer, name: `DXF Çizgi (${ent.layer})` },
          geometry: { type: "LineString", coordinates: ent.coords.map(transformCoord) }
        });
      } else if (ent.type === "Polygon") {
        features.push({
          type: "Feature",
          properties: { layer: ent.layer, name: `DXF Kapalı Alan (${ent.layer})` },
          geometry: { type: "Polygon", coordinates: ent.coords.map(ring => ring.map(transformCoord)) }
        });
      }
    }

    return {
      type: "FeatureCollection",
      features: features,
      metadata: {
        isProjected: isProjected,
        detectedDom: detectedDom,
        featureCount: features.length
      }
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = GnssFormatEngine;
}