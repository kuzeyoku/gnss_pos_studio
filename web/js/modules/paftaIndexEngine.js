/**
 * =========================================================================================
 *  HARİTA TOOL / GNSS POS WEB STUDIO - PAFTA İNDEKS & BÖHHBÜY HESAP MOTORU (PaftaIndexEngine)
 * =========================================================================================
 *  - Türkiye 1/100 000, 1/50 000 ve 1/25 000 Standart Pafta İndeks Bölümleme Algoritmaları
 *  - HGM Resmi Pafta Bazlı Datum Düzeltme Katsayıları (ΔX, ΔY, Δh, N) Eşleştirici
 *  - TUREF TM 3° Dilim Orta Meridyeni (DOM 27°-45°) Sınır ve Kapsama Hesaplayıcı
 *  - Pafta Adından / Şehir Adından Koordinat ve Sınır Çözümleyici (Reverse Geocoding)
 *  - CAD & CBS İhracı: Netcad Nokta (.NCN), AutoCAD Çizim (.DXF) ve Google Earth (.KML)
 * =========================================================================================
 */

const TR_25_PAFTA_LETTERS = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'İ',
  'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'Ş',
  'T', 'U', 'Ü', 'V', 'Y'
];

class PaftaIndexEngine {
  constructor() {
    this.tr25Letters = TR_25_PAFTA_LETTERS;
    // 1/100K Enlem Harf Haritası (34.0° - 44.0°K)
    this.latMap = {
      43.5: "A",
      43.0: "B",
      42.5: "C",
      42.0: "D",
      41.5: "E",
      41.0: "F",
      40.5: "G",
      40.0: "H",
      39.5: "I",
      39.0: "J",
      38.5: "K",
      38.0: "L",
      37.5: "M",
      37.0: "N",
      36.5: "O",
      36.0: "P",
      35.5: "Q",
      35.0: "R",
      34.5: "S",
      34.0: "T"
    };

    // Harften Minimum Enlem Değerine Dönüşüm
    this.letterToLatMin = {
      A: 43.5,
      B: 43.0,
      C: 42.5,
      D: 42.0,
      E: 41.5,
      F: 41.0,
      G: 40.5,
      H: 40.0,
      I: 39.5,
      İ: 39.5,
      J: 39.0,
      K: 38.5,
      L: 38.0,
      M: 37.5,
      N: 37.0,
      O: 36.5,
      P: 36.0,
      Q: 35.5,
      R: 35.0,
      S: 34.5,
      T: 34.0
    };

    // Türkiye Coğrafi Sınır Kapsamı (BBOX)
    this.turkeyBounds = {
      minLat: 35.5,
      maxLat: 42.5,
      minLon: 25.5,
      maxLon: 45.0
    };

    // 1/100.000'lik Pafta Kodundan 1/250.000'lik Şehir / Bölge Adı Eşleştirmesi
    this.sheet100kTo250k = {
      M33: "ADANA", M34: "ADANA", M35: "ADANA", N33: "ADANA", N34: "ADANA", N35: "ADANA",
      G24: "ADAPAZARI", G25: "ADAPAZARI", G26: "ADAPAZARI", H24: "ADAPAZARI", H25: "ADAPAZARI", H26: "ADAPAZARI",
      K24: "AFYON", K25: "AFYON", K26: "AFYON", L24: "AFYON", L25: "AFYON", L26: "AFYON",
      I48: "AGRI", I49: "AGRI", I50: "AGRI", J48: "AGRI", J49: "AGRI", J50: "AGRI",
      F42: "AKÇAABAT", F43: "AKÇAABAT", F44: "AKÇAABAT",
      K30: "AKSARAY", K31: "AKSARAY", K32: "AKSARAY", L30: "AKSARAY", L31: "AKSARAY", L32: "AKSARAY",
      O27: "ALANYA", O28: "ALANYA", O29: "ALANYA", P28: "ALANYA", P29: "ALANYA",
      I27: "ANKARA", I28: "ANKARA", I29: "ANKARA", J27: "ANKARA", J28: "ANKARA", J29: "ANKARA",
      O36: "ANTAKYA", O37: "ANTAKYA", O38: "ANTAKYA", P36: "ANTAKYA", P37: "ANTAKYA", R36: "ANTAKYA",
      O24: "ANTALYA", O25: "ANTALYA", O26: "ANTALYA", P24: "ANTALYA", P25: "ANTALYA",
      E48: "ARDAHAN", E49: "ARDAHAN", F48: "ARDAHAN", F49: "ARDAHAN", F50: "ARDAHAN", F51: "ARDAHAN",
      E47: "ARTVIN", F45: "ARTVIN", F46: "ARTVIN", F47: "ARTVIN",
      M18: "AYDIN", M19: "AYDIN", M20: "AYDIN", N18: "AYDIN", N19: "AYDIN", N20: "AYDIN",
      I15: "AYVALIK", I16: "AYVALIK", I17: "AYVALIK", J16: "AYVALIK", J17: "AYVALIK",
      T28: "BAF", T29: "BAF",
      I18: "BALIKESIR", I19: "BALIKESIR", I20: "BALIKESIR", J18: "BALIKESIR", J19: "BALIKESIR", J20: "BALIKESIR",
      G18: "BANDIRMA", G19: "BANDIRMA", H18: "BANDIRMA", H19: "BANDIRMA", H20: "BANDIRMA",
      K51: "BASKALE", K52: "BASKALE", L51: "BASKALE", L52: "BASKALE",
      G27: "BOLU", G28: "BOLU", G29: "BOLU", H27: "BOLU", H28: "BOLU", H29: "BOLU",
      G21: "BURSA", G22: "BURSA", G23: "BURSA", H21: "BURSA", H22: "BURSA", H23: "BURSA",
      O42: "CEYLANPINAR", O43: "CEYLANPINAR", O44: "CEYLANPINAR",
      M48: "CIZRE", M49: "CIZRE", M50: "CIZRE", N48: "CIZRE", N49: "CIZRE", N50: "CIZRE",
      G16: "ÇANAKKALE", G17: "ÇANAKKALE", H15: "ÇANAKKALE", H16: "ÇANAKKALE", H17: "ÇANAKKALE",
      G30: "ÇANKIRI", G31: "ÇANKIRI", G32: "ÇANKIRI", H30: "ÇANKIRI", H31: "ÇANKIRI", H32: "ÇANKIRI",
      G33: "ÇORUM", G34: "ÇORUM", G35: "ÇORUM", H33: "ÇORUM", H34: "ÇORUM", H35: "ÇORUM",
      M21: "DENIZLI", M22: "DENIZLI", M23: "DENIZLI", N21: "DENIZLI", N22: "DENIZLI", N23: "DENIZLI",
      I39: "DIVRIGI", I40: "DIVRIGI", I41: "DIVRIGI", J39: "DIVRIGI", J40: "DIVRIGI", J41: "DIVRIGI",
      M42: "DIYARBAKIR", M43: "DIYARBAKIR", M44: "DIYARBAKIR", N42: "DIYARBAKIR", N43: "DIYARBAKIR", N44: "DIYARBAKIR",
      H52: "DOGUBAYAZIT", I51: "DOGUBAYAZIT", I52: "DOGUBAYAZIT", I53: "DOGUBAYAZIT", J51: "DOGUBAYAZIT", J52: "DOGUBAYAZIT",
      D17: "EDIRNE", E16: "EDIRNE", E17: "EDIRNE", F16: "EDIRNE", F17: "EDIRNE",
      K42: "ELAZIG", K43: "ELAZIG", K44: "ELAZIG", L42: "ELAZIG", L43: "ELAZIG", L44: "ELAZIG",
      K36: "ELBISTAN", K37: "ELBISTAN", K38: "ELBISTAN", L36: "ELBISTAN", L37: "ELBISTAN", L38: "ELBISTAN",
      F24: "EREGLI", F25: "EREGLI", F26: "EREGLI",
      I42: "ERZINCAN", I43: "ERZINCAN", I44: "ERZINCAN", J42: "ERZINCAN", J43: "ERZINCAN", J44: "ERZINCAN",
      I45: "ERZURUM", I46: "ERZURUM", I47: "ERZURUM", J45: "ERZURUM", J46: "ERZURUM", J47: "ERZURUM",
      I24: "ESKISEHIR", I25: "ESKISEHIR", I26: "ESKISEHIR", J24: "ESKISEHIR", J25: "ESKISEHIR", J26: "ESKISEHIR",
      O21: "FETHIYE", O22: "FETHIYE", O23: "FETHIYE", P22: "FETHIYE", P23: "FETHIYE",
      M36: "GAZIANTEP", M37: "GAZIANTEP", M38: "GAZIANTEP", N36: "GAZIANTEP", N37: "GAZIANTEP", N38: "GAZIANTEP",
      G39: "GIRESUN", G40: "GIRESUN", G41: "GIRESUN", H39: "GIRESUN", H40: "GIRESUN", H41: "GIRESUN",
      S28: "GÜZELYURT", S29: "GÜZELYURT",
      M51: "HAKKARI", M52: "HAKKARI", M53: "HAKKARI", N51: "HAKKARI", N52: "HAKKARI", N53: "HAKKARI", O52: "HAKKARI",
      K27: "ILGIN", K28: "ILGIN", K29: "ILGIN", L27: "ILGIN", L28: "ILGIN", L29: "ILGIN",
      M24: "ISPARTA", M25: "ISPARTA", M26: "ISPARTA", N24: "ISPARTA", N25: "ISPARTA", N26: "ISPARTA",
      F21: "ISTANBUL", F22: "ISTANBUL", F23: "ISTANBUL",
      K18: "IZMIR", K19: "IZMIR", K20: "IZMIR", L18: "IZMIR", L19: "IZMIR", L20: "IZMIR",
      M30: "KARAMAN", M31: "KARAMAN", M32: "KARAMAN", N30: "KARAMAN", N31: "KARAMAN", N32: "KARAMAN",
      G48: "KARS", G49: "KARS", G50: "KARS", G51: "KARS", H48: "KARS", H49: "KARS", H50: "KARS", H51: "KARS",
      D30: "KASTAMONU", E30: "KASTAMONU", E31: "KASTAMONU", E32: "KASTAMONU", F30: "KASTAMONU", F31: "KASTAMONU", F32: "KASTAMONU",
      K33: "KAYSERI", K34: "KAYSERI", K35: "KAYSERI", L33: "KAYSERI", L34: "KAYSERI", L35: "KAYSERI",
      D18: "KIRKLARELI", E18: "KIRKLARELI", E19: "KIRKLARELI", E20: "KIRKLARELI", F18: "KIRKLARELI", F19: "KIRKLARELI", F20: "KIRKLARELI",
      I30: "KIRSEHIR", I31: "KIRSEHIR", I32: "KIRSEHIR", J30: "KIRSEHIR", J31: "KIRSEHIR", J32: "KIRSEHIR",
      M27: "KONYA", M28: "KONYA", M29: "KONYA", N27: "KONYA", N28: "KONYA", N29: "KONYA",
      I21: "KÜTAHYA", I22: "KÜTAHYA", I23: "KÜTAHYA", J21: "KÜTAHYA", J22: "KÜTAHYA", J23: "KÜTAHYA",
      R32: "LEFKOSA", R33: "LEFKOSA", S30: "LEFKOSA", S31: "LEFKOSA", S32: "LEFKOSA",
      T30: "LIMASOL", T31: "LIMASOL", T32: "LIMASOL",
      K39: "MALATYA", K40: "MALATYA", K41: "MALATYA", L39: "MALATYA", L40: "MALATYA", L41: "MALATYA",
      M45: "MARDIN", M46: "MARDIN", M47: "MARDIN", N45: "MARDIN", N46: "MARDIN", N47: "MARDIN",
      O18: "MARMARIS", O19: "MARMARIS", O20: "MARMARIS",
      O33: "MERSIN", O34: "MERSIN", O35: "MERSIN", P35: "MERSIN", R35: "MERSIN",
      K45: "MUS", K46: "MUS", K47: "MUS", L45: "MUS", L46: "MUS", L47: "MUS",
      F39: "PERSEMBE", F41: "PERSEMBE",
      E36: "SAMSUN", F36: "SAMSUN", F37: "SAMSUN", F38: "SAMSUN",
      M39: "SANLIURFA", M40: "SANLIURFA", M41: "SANLIURFA", N39: "SANLIURFA", N40: "SANLIURFA", N41: "SANLIURFA",
      O30: "SILIFKE", O31: "SILIFKE", O32: "SILIFKE", P30: "SILIFKE", P31: "SILIFKE", P32: "SILIFKE",
      D33: "SINOP", D34: "SINOP", E33: "SINOP", E34: "SINOP", E35: "SINOP", F33: "SINOP", F34: "SINOP", F35: "SINOP",
      I36: "SIVAS", I37: "SIVAS", I38: "SIVAS", J36: "SIVAS", J37: "SIVAS", J38: "SIVAS",
      O39: "SURUÇ", O40: "SURUÇ", O41: "SURUÇ",
      G36: "TOKAT", G37: "TOKAT", G38: "TOKAT", H36: "TOKAT", H37: "TOKAT", H38: "TOKAT",
      G45: "TORTUM", G46: "TORTUM", G47: "TORTUM", H45: "TORTUM", H46: "TORTUM", H47: "TORTUM",
      G42: "TRABZON", G43: "TRABZON", G44: "TRABZON", H42: "TRABZON", H43: "TRABZON", H44: "TRABZON",
      K16: "URLA", K17: "URLA", L16: "URLA", L17: "URLA",
      K21: "USAK", K22: "USAK", K23: "USAK", L21: "USAK", L22: "USAK", L23: "USAK",
      K48: "VAN", K49: "VAN", K50: "VAN", L48: "VAN", L49: "VAN", L50: "VAN",
      I33: "YOZGAT", I34: "YOZGAT", I35: "YOZGAT", J33: "YOZGAT", J34: "YOZGAT", J35: "YOZGAT",
      E27: "ZONGULDAK", E28: "ZONGULDAK", E29: "ZONGULDAK", F27: "ZONGULDAK", F28: "ZONGULDAK"
    };
  }

  /**
   * Türkiye TUREF TM 3° Dilim Orta Meridyenleri Listesini Döndürür
   */
  getTurkishDomZones() {
    return [
      { zone: 9, dom: 27, epsg: "EPSG:5253", epsgEd50: "EPSG:5263", minLon: 25.5, maxLon: 28.5, name: "DOM 27° (Dilim 9)", desc: "Trakya, Çanakkale, Balıkesir, İzmir Batısı" },
      { zone: 10, dom: 30, epsg: "EPSG:5254", epsgEd50: "EPSG:5264", minLon: 28.5, maxLon: 31.5, name: "DOM 30° (Dilim 10)", desc: "İstanbul, Bursa, Kocaeli, Sakarya, Bilecik, Kütahya, Manisa, İzmir, Muğla, Antalya Batısı" },
      { zone: 11, dom: 33, epsg: "EPSG:5255", epsgEd50: "EPSG:5265", minLon: 31.5, maxLon: 34.5, name: "DOM 33° (Dilim 11)", desc: "Ankara, Eskişehir, Konya, Afyon, Bolu, Düzce, Zonguldak, Bartın, Kastamonu Batısı, Aksaray, Karaman, Antalya, Mersin" },
      { zone: 12, dom: 36, epsg: "EPSG:5256", epsgEd50: "EPSG:5266", minLon: 34.5, maxLon: 37.5, name: "DOM 36° (Dilim 12)", desc: "Samsun, Çorum, Amasya, Tokat, Yozgat, Kırşehir, Nevşehir, Niğde, Kayseri, Sivas Batısı, Adana, Osmaniye, Hatay" },
      { zone: 13, dom: 39, epsg: "EPSG:5257", epsgEd50: "EPSG:5267", minLon: 37.5, maxLon: 40.5, name: "DOM 39° (Dilim 13)", desc: "Ordu, Giresun, Trabzon, Gümüşhane, Bayburt, Sivas, Erzincan, Malatya, Elazığ, Tunceli, Kahramanmaraş, Gaziantep, Kilis, Adıyaman, Şanlıurfa Batısı" },
      { zone: 14, dom: 42, epsg: "EPSG:5258", epsgEd50: "EPSG:5268", minLon: 40.5, maxLon: 43.5, name: "DOM 42° (Dilim 14)", desc: "Rize, Artvin, Erzurum, Bingöl, Muş, Bitlis, Diyarbakır, Batman, Siirt, Mardin, Şanlıurfa, Şırnak Batısı" },
      { zone: 15, dom: 45, epsg: "EPSG:5259", epsgEd50: "EPSG:5269", minLon: 43.5, maxLon: 46.5, name: "DOM 45° (Dilim 15)", desc: "Ardahan, Kars, Iğdır, Ağrı, Van, Hakkari, Şırnak" }
    ];
  }

  calculate100kSheet(lat, lon) { return this.get100kSheet(lat, lon); }
  calculate50kSheet(lat, lon) { return this.get50kSheet(lat, lon); }
  calculate25kSheet(lat, lon) { return this.get25kSheet(lat, lon); }
  calculate10kSheet(lat, lon) { return this.get10kSheet(lat, lon); }
  calculate5kSheet(lat, lon) { return this.get5kSheet(lat, lon); }
  calculate2kSheet(lat, lon) { return this.get2kSheet(lat, lon); }
  calculate1kSheet(lat, lon) { return this.get1kSheet(lat, lon); }
  findPaftaByPoint(lat, lon) { return this.getAllSheetsForPoint(lat, lon); }

  /**
   * Enlem ve Boylama Göre 1/100 000 Ölçekli Paftayı Hesaplar (30' x 30')
   */
  get100kSheet(lat, lon) {
    const minLat = Math.floor(Math.round(lat * 1e6) / 500000) * 0.5;
    const maxLat = minLat + 0.5;
    const minLon = Math.floor(Math.round(lon * 1e6) / 500000) * 0.5;
    const maxLon = minLon + 0.5;

    const latKey = minLat.toFixed(1);
    const letter = this.latMap[latKey] || this.latMap[String(minLat)] || "F";
    const colNum = Math.round(minLon * 2) - 36;
    const colStr = String(colNum).padStart(2, "0");
    const sheetName = `${letter}${colStr}`;
    const regName = this.sheet100kTo250k[sheetName] || "";

    return {
      scale: "1/100 000",
      name: sheetName,
      sheetName: sheetName,
      letter: letter,
      col: colNum,
      regionalName: regName,
      displayName: regName ? `${sheetName} (${regName})` : sheetName,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: minLat + 0.25,
      centerLon: minLon + 0.25
    };
  }

  /**
   * Enlem ve Boylama Göre 1/50 000 Ölçekli Paftayı Hesaplar (15' x 15' - a, b, c, d)
   */
  get50kSheet(lat, lon) {
    const parent100k = this.get100kSheet(lat, lon);
    const midLat = parent100k.minLat + 0.25;
    const midLon = parent100k.minLon + 0.25;

    let subLetter = "a";
    let minLat, maxLat, minLon, maxLon;

    if (lat >= midLat && lon < midLon) {
      subLetter = "a";
      minLat = midLat; maxLat = parent100k.maxLat;
      minLon = parent100k.minLon; maxLon = midLon;
    } else if (lat >= midLat && lon >= midLon) {
      subLetter = "b";
      minLat = midLat; maxLat = parent100k.maxLat;
      minLon = midLon; maxLon = parent100k.maxLon;
    } else if (lat < midLat && lon >= midLon) {
      subLetter = "c";
      minLat = parent100k.minLat; maxLat = midLat;
      minLon = midLon; maxLon = parent100k.maxLon;
    } else {
      subLetter = "d";
      minLat = parent100k.minLat; maxLat = midLat;
      minLon = parent100k.minLon; maxLon = midLon;
    }

    const sheetName = `${parent100k.name}-${subLetter}`;
    return {
      scale: "1/50 000",
      name: sheetName,
      sheetName: sheetName,
      parent100k: parent100k.name,
      regionalName: parent100k.regionalName,
      displayName: parent100k.regionalName ? `${sheetName} (${parent100k.regionalName})` : sheetName,
      subLetter: subLetter,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: minLat + 0.125,
      centerLon: minLon + 0.125
    };
  }

  /**
   * Enlem ve Boylama Göre 1/25 000 Ölçekli Paftayı Hesaplar
   * (1/50k'dan 2x2 = 4 parça -> 7'30" x 7'30" = 0.125° x 0.125° -> 1, 2, 3, 4)
   * Resmi HGM Formatı: [100k]-[50k_harfi][1..4] (Örn: J28-b4, M33-a1, N21-d1)
   */
  get25kSheet(lat, lon) {
    const parent50k = this.get50kSheet(lat, lon);
    const midLat = parent50k.minLat + 0.125;
    const midLon = parent50k.minLon + 0.125;

    let subNum = 1;
    let minLat, maxLat, minLon, maxLon;

    // Saat yönünde: 1 (KB), 2 (KD), 3 (GD), 4 (GB)
    if (lat >= midLat && lon < midLon) {
      subNum = 1;
      minLat = midLat; maxLat = parent50k.maxLat;
      minLon = parent50k.minLon; maxLon = midLon;
    } else if (lat >= midLat && lon >= midLon) {
      subNum = 2;
      minLat = midLat; maxLat = parent50k.maxLat;
      minLon = midLon; maxLon = parent50k.maxLon;
    } else if (lat < midLat && lon >= midLon) {
      subNum = 3;
      minLat = parent50k.minLat; maxLat = midLat;
      minLon = midLon; maxLon = parent50k.maxLon;
    } else {
      subNum = 4;
      minLat = parent50k.minLat; maxLat = midLat;
      minLon = parent50k.minLon; maxLon = midLon;
    }

    const sheetName = `${parent50k.parent100k}-${parent50k.subLetter}${subNum}`;
    const centerLat = minLat + 0.0625;
    const centerLon = minLon + 0.0625;
    const datumCorr = this.getHgmDatumRecord(sheetName, centerLat, centerLon);

    return {
      scale: "1/25 000",
      name: sheetName,
      sheetName: sheetName,
      parent100k: parent50k.parent100k,
      parent50k: parent50k.name,
      regionalName: parent50k.regionalName,
      displayName: parent50k.regionalName ? `${sheetName} (${parent50k.regionalName})` : sheetName,
      subLetter: parent50k.subLetter,
      subNum: subNum,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: centerLat,
      centerLon: centerLon,
      hgmKey: sheetName,
      datumCorr: datumCorr,
      geoid: datumCorr.yukseklikDuz,
      heightCorr: datumCorr.yukariDuz
    };
  }

  /**
   * Enlem ve Boylama Göre 1/5 000 Ölçekli Paftayı Hesaplar
   * (1/25k'dan 5x5 = 25 parça -> 1'30" x 1'30" = 0.025° x 0.025° -> 01..25)
   * Örn: J28-b4-01 .. J28-b4-25
   */
  get5kSheet(lat, lon) {
    const parent25k = this.get25kSheet(lat, lon);
    const dLat = parent25k.maxLat - lat;
    const dLon = lon - parent25k.minLon;
    const r = Math.min(4, Math.max(0, Math.floor(dLat / 0.025)));
    const c = Math.min(4, Math.max(0, Math.floor(dLon / 0.025)));
    const num = r * 5 + c + 1;
    const numStr = String(num).padStart(2, "0");

    const maxLat = parent25k.maxLat - r * 0.025;
    const minLat = maxLat - 0.025;
    const minLon = parent25k.minLon + c * 0.025;
    const maxLon = minLon + 0.025;

    const sheetName = `${parent25k.name}-${numStr}`;
    const centerLat = minLat + 0.0125;
    const centerLon = minLon + 0.0125;

    return {
      scale: "1/5 000",
      name: sheetName,
      sheetName: sheetName,
      parent25k: parent25k.name,
      parent50k: parent25k.parent50k,
      parent100k: parent25k.parent100k,
      regionalName: parent25k.regionalName,
      displayName: parent25k.regionalName ? `${sheetName} (${parent25k.regionalName})` : sheetName,
      subNum: num,
      numStr: numStr,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: centerLat,
      centerLon: centerLon
    };
  }

  /**
   * Enlem ve Boylama Göre 1/2 000 Ölçekli Paftayı Hesaplar
   * (1/5k'dan 2x2 = 4 parça -> 45" x 45" = 0.0125° x 0.0125° -> 1, 2, 3, 4)
   * Örn: J28-b4-13-1 .. J28-b4-13-4
   */
  get2kSheet(lat, lon) {
    const parent5k = this.get5kSheet(lat, lon);
    const midLat = parent5k.minLat + 0.0125;
    const midLon = parent5k.minLon + 0.0125;

    let subNum = 1;
    let minLat, maxLat, minLon, maxLon;
    if (lat >= midLat && lon < midLon) {
      subNum = 1; minLat = midLat; maxLat = parent5k.maxLat; minLon = parent5k.minLon; maxLon = midLon;
    } else if (lat >= midLat && lon >= midLon) {
      subNum = 2; minLat = midLat; maxLat = parent5k.maxLat; minLon = midLon; maxLon = parent5k.maxLon;
    } else if (lat < midLat && lon >= midLon) {
      subNum = 3; minLat = parent5k.minLat; maxLat = midLat; minLon = midLon; maxLon = parent5k.maxLon;
    } else {
      subNum = 4; minLat = parent5k.minLat; maxLat = midLat; minLon = parent5k.minLon; maxLon = midLon;
    }

    const sheetName = `${parent5k.name}-${subNum}`;
    const centerLat = minLat + 0.00625;
    const centerLon = minLon + 0.00625;

    return {
      scale: "1/2 000",
      name: sheetName,
      sheetName: sheetName,
      parent5k: parent5k.name,
      parent25k: parent5k.parent25k,
      parent50k: parent5k.parent50k,
      parent100k: parent5k.parent100k,
      regionalName: parent5k.regionalName,
      displayName: parent5k.regionalName ? `${sheetName} (${parent5k.regionalName})` : sheetName,
      subNum: subNum,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: centerLat,
      centerLon: centerLon
    };
  }

  /**
   * Enlem ve Boylama Göre 1/1 000 Ölçekli Paftayı Hesaplar
   * (1/2k'dan 2x2 = 4 parça -> 22.5" x 22.5" = 0.00625° x 0.00625° -> a, b, c, d)
   * Örn: J28-b4-13-2-a .. J28-b4-13-2-d
   */
  get1kSheet(lat, lon) {
    const parent2k = this.get2kSheet(lat, lon);
    const midLat = parent2k.minLat + 0.00625;
    const midLon = parent2k.minLon + 0.00625;

    let subLetter = "a";
    let minLat, maxLat, minLon, maxLon;
    if (lat >= midLat && lon < midLon) {
      subLetter = "a"; minLat = midLat; maxLat = parent2k.maxLat; minLon = parent2k.minLon; maxLon = midLon;
    } else if (lat >= midLat && lon >= midLon) {
      subLetter = "b"; minLat = midLat; maxLat = parent2k.maxLat; minLon = midLon; maxLon = parent2k.maxLon;
    } else if (lat < midLat && lon >= midLon) {
      subLetter = "c"; minLat = parent2k.minLat; maxLat = midLat; minLon = midLon; maxLon = parent2k.maxLon;
    } else {
      subLetter = "d"; minLat = parent2k.minLat; maxLat = midLat; minLon = parent2k.minLon; maxLon = midLon;
    }

    const sheetName = `${parent2k.name}-${subLetter}`;
    const centerLat = minLat + 0.003125;
    const centerLon = minLon + 0.003125;

    return {
      scale: "1/1 000",
      name: sheetName,
      sheetName: sheetName,
      parent2k: parent2k.name,
      parent5k: parent2k.parent5k,
      parent25k: parent2k.parent25k,
      parent50k: parent2k.parent50k,
      parent100k: parent2k.parent100k,
      regionalName: parent2k.regionalName,
      displayName: parent2k.regionalName ? `${sheetName} (${parent2k.regionalName})` : sheetName,
      subLetter: subLetter,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon,
      centerLat: centerLat,
      centerLon: centerLon
    };
  }

  /**
   * data/hgmDatumDatabase.json dosyasından HGM pafta datum ve yükseklik düzeltmelerini asenkron yükler
   */
  async loadHgmDatabase(url = "data/hgmDatumDatabase.json") {
    if (this.isHgmLoaded && this.hgmDatabase) return this.hgmDatabase;
    if (this.hgmLoadPromise) return this.hgmLoadPromise;

    this.hgmLoadPromise = (async () => {
      try {
        const basePath = typeof window !== "undefined" && window.location ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1) : "./";
        const fullUrl = url.startsWith("http") || url.startsWith("/") ? url : `${basePath}${url}`;
        const res = await fetch(`${fullUrl}?v=${Date.now()}`);
        if (!res.ok) throw new Error("ERR_HGM_DATABASE_FETCH_FAILED");
        this.hgmDatabase = await res.json();
        if (typeof window !== "undefined") {
          window.HGM_DATUM_CORRECTIONS = this.hgmDatabase;
        }
        this.isHgmLoaded = true;
        return this.hgmDatabase;
      } catch (err) {
        console.warn("HGM Datum Database fetch error:", err);
        return null;
      }
    })();
    return this.hgmLoadPromise;
  }

  /**
   * HGM Resmi 1/25 000 Pafta Datum Düzeltme Katsayılarını (ΔX, ΔY, Δh/N, Δφ, Δλ) Getirir
   * Not: Türkiye'de HGM datum ve jeoit yükseklik düzeltmeleri 1/25 000 ölçekli standart paftalar bazındadır.
   */
  getHgmDatumRecord(sheetName, centerLat, centerLon) {
    const hgmDict = this.hgmDatabase || (typeof window !== "undefined" && window.HGM_DATUM_CORRECTIONS)
      ? (this.hgmDatabase || window.HGM_DATUM_CORRECTIONS)
      : (typeof global !== "undefined" && global.HGM_DATUM_CORRECTIONS ? global.HGM_DATUM_CORRECTIONS : null);

    let matchRecord = null;
    let resolved25kKey = sheetName ? sheetName.trim() : "";

    if (hgmDict && sheetName) {
      const rawKey = sheetName.trim();
      const normKey = sheetName.replace(/([A-Z]\d+)[-_]?([a-zA-Z])(\d)/, (_, p1, p2, p3) => `${p1.toUpperCase()}-${p2.toLowerCase()}${p3}`);
      matchRecord = hgmDict[normKey] || hgmDict[rawKey] || hgmDict[sheetName.toUpperCase()];
      if (matchRecord) {
        resolved25kKey = normKey || rawKey;
      }
    }

    // Doğrudan pafta adıyla eşleşmediyse koordinattan ilgili 1/25 000 HGM kuadranını türet
    if (!matchRecord && hgmDict && centerLat !== undefined && centerLon !== undefined && !isNaN(centerLat) && !isNaN(centerLon)) {
      const p50 = this.get50kSheet(centerLat, centerLon);
      const midLat = p50.minLat + 0.125;
      const midLon = p50.minLon + 0.125;
      let quad = 1;
      if (centerLat >= midLat && centerLon < midLon) quad = 1;
      else if (centerLat >= midLat && centerLon >= midLon) quad = 2;
      else if (centerLat < midLat && centerLon >= midLon) quad = 3;
      else quad = 4;
      const hgmKey = `${p50.name}${quad}`;
      resolved25kKey = hgmKey;
      matchRecord = hgmDict[hgmKey];
    }

    if (matchRecord) {
      return {
        pafta25k: resolved25kKey,
        enlemDuz: matchRecord[0],      // Enlem Düzeltmesi (Saniye)
        boylamDuz: matchRecord[1],     // Boylam Düzeltmesi (Saniye)
        yukariDuz: matchRecord[2],     // Yukarı Düzeltmesi ΔX (Metre)
        sagaDuz: matchRecord[3],       // Sağa Düzeltmesi ΔY (Metre)
        yukseklikDuz: matchRecord[4],  // Jeoit Yükseklik Undülasyonu N (Metre)
        isOfficial: true
      };
    }

    // Veritabanında eşleşmeyen sınır dışı bölgeler için polinomik enterpolasyon yaklaşımı
    const dLon = (centerLon !== undefined && !isNaN(centerLon)) ? centerLon - 35.0 : 0.0;
    const dLat = (centerLat !== undefined && !isNaN(centerLat)) ? centerLat - 39.0 : 0.0;

    let geoidApprox = 34.25 - dLon * 0.88 + dLat * 0.12 - (dLon ** 2) * 0.018 - (dLat ** 2) * 0.035 + dLat * 0.015 * dLon;
    if (centerLat > 38.0) {
      geoidApprox -= ((centerLat - 38.0) ** 1.3) * 0.18;
    }
    if (centerLon < 38.0 && centerLat > 34.0) {
      geoidApprox -= (1.0 - (centerLon - 35.5) / 2.5) * 1.8;
    }

    const dX_approx = 184.0 - dLon * 0.42 + dLat * 0.25;

    return {
      pafta25k: resolved25kKey,
      enlemDuz: Number((3.45 + dLat * 0.03).toFixed(2)),
      boylamDuz: Number((1.50 - dLon * 0.06).toFixed(2)),
      yukariDuz: Number(dX_approx.toFixed(1)),
      sagaDuz: Number((38.0 + dLon * 0.4).toFixed(1)),
      yukseklikDuz: Number(geoidApprox.toFixed(2)),
      isOfficial: false
    };
  }

  calculateGeoidUndulation(lat, lon, sheetName = "") {
    return this.getHgmDatumRecord(sheetName, lat, lon).yukseklikDuz;
  }

  calculateHeightCorrection(lat, lon, sheetName = "") {
    return this.getHgmDatumRecord(sheetName, lat, lon).yukariDuz;
  }

  /**
   * Noktanın dahil olduğu tüm ölçeklerdeki paftaları (100K, 50K, 25K) döndürür
   */
  getAllSheetsForPoint(lat, lon) {
    return {
      s100k: this.get100kSheet(lat, lon),
      s50k: this.get50kSheet(lat, lon),
      s25k: this.get25kSheet(lat, lon),
      s5k: this.get5kSheet(lat, lon),
      s2k: this.get2kSheet(lat, lon),
      s1k: this.get1kSheet(lat, lon)
    };
  }

  /**
   * 1/100 000 Paftasının Coğrafi Sınırlarını (BBOX) Döndürür
   */
  get100kBounds(code) {
    let letter = code[0].toUpperCase();
    if (letter === "İ") letter = "I";
    const col = parseInt(code.substring(1), 10);
    const minLat = this.letterToLatMin[letter];
    if (minLat === undefined) return null;
    const maxLat = minLat + 0.5;
    const minLon = (col + 36) / 2.0;
    const maxLon = minLon + 0.5;
    return { minLat, maxLat, minLon, maxLon };
  }

  /**
   * Bir Sınır Alanını 2x2 Dört Çeyreğe Böler (a/1: KB, b/2: KD, c/3: GD, d/4: GB)
   */
  getSubQuadBounds(bounds, quad) {
    const midLat = (bounds.minLat + bounds.maxLat) / 2.0;
    const midLon = (bounds.minLon + bounds.maxLon) / 2.0;
    const q = String(quad).toLowerCase();
    if (q === "a" || q === "1") {
      return { minLat: midLat, maxLat: bounds.maxLat, minLon: bounds.minLon, maxLon: midLon };
    } else if (q === "b" || q === "2") {
      return { minLat: midLat, maxLat: bounds.maxLat, minLon: midLon, maxLon: bounds.maxLon };
    } else if (q === "c" || q === "3") {
      return { minLat: bounds.minLat, maxLat: midLat, minLon: midLon, maxLon: bounds.maxLon };
    } else {
      return { minLat: bounds.minLat, maxLat: midLat, minLon: bounds.minLon, maxLon: midLon };
    }
  }

  /**
   * 1/25 000 Sınırını 5x5 = 25 Bloğa Böler (1..25) -> 1/5 000
   */
  get5kBlockBounds(b25, num) {
    const n = Math.min(25, Math.max(1, num));
    const r = Math.floor((n - 1) / 5);
    const c = (n - 1) % 5;
    const maxLat = b25.maxLat - r * 0.025;
    const minLat = maxLat - 0.025;
    const minLon = b25.minLon + c * 0.025;
    const maxLon = minLon + 0.025;
    return { minLat, maxLat, minLon, maxLon };
  }

  /**
   * Verilen Pafta Adından (Örn: "N21-d-13-b-2-a", "N21-d1-13-2", "N21-d1-13", "N21-d1", "J28-b4", "N21-d", "N21", "İSTANBUL")
   * Pafta Bilgisini ve Koordinat Sınırlarını Çözer (Reverse Geocoding)
   */
  resolveSheetByName(nameQuery) {
    if (!nameQuery) return null;
    let query = nameQuery.trim().toLocaleUpperCase("tr-TR");
    // İl / Bölge ön ekini temizle (Örn: "KOCAELI-F24-c-01-a" -> "F24-c-01-a")
    query = query.replace(/^[A-ZÇĞİÖŞÜ]+[-_](?=[A-SİI]\d)/i, "");
    const cleanQuery = query.replace(/\s+/g, "").replace(/_/g, "-");

    // Format 1: 1/1 000 -> N21-d1-13-2-a veya N21-d-1-13-2-a veya N21-d-13-b-2-a
    const m1k = cleanQuery.match(/^([A-SİI]\d{1,2})-?([A-D])[-_]?([1-4])?[-_]?(\d{1,2})[-_]([1-4]|[A-D])[-_]([A-D]|[1-4])$/i);
    if (m1k) {
      const [_, p100k, p50k, p25k, p5k, p2k, p1k] = m1k;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const b25 = this.getSubQuadBounds(b50, p25k ? parseInt(p25k, 10) : 1);
        const b5 = this.get5kBlockBounds(b25, parseInt(p5k, 10));
        const b2 = this.getSubQuadBounds(b5, p2k);
        const b1 = this.getSubQuadBounds(b2, p1k);
        const cLat = (b1.minLat + b1.maxLat) / 2.0;
        const cLon = (b1.minLon + b1.maxLon) / 2.0;
        return this.get1kSheet(cLat, cLon);
      }
    }

    // Format 2: 1/2 000 -> N21-d1-13-2 veya N21-d-1-13-2 veya N21-d-13-b-2
    const m2k = cleanQuery.match(/^([A-SİI]\d{1,2})-?([A-D])[-_]?([1-4])?[-_]?(\d{1,2})[-_]([1-4]|[A-D])$/i);
    if (m2k) {
      const [_, p100k, p50k, p25k, p5k, p2k] = m2k;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const b25 = this.getSubQuadBounds(b50, p25k ? parseInt(p25k, 10) : 1);
        const b5 = this.get5kBlockBounds(b25, parseInt(p5k, 10));
        const b2 = this.getSubQuadBounds(b5, p2k);
        const cLat = (b2.minLat + b2.maxLat) / 2.0;
        const cLon = (b2.minLon + b2.maxLon) / 2.0;
        return this.get2kSheet(cLat, cLon);
      }
    }

    // Format 3: 1/25 000 Resmi HGM & Ulusal Şablon -> N21-d1 veya N21-d-1 veya J28-b4 veya F21a1
    const m25kHgm = cleanQuery.match(/^([A-SİI]\d{1,2})-?([A-D])[-_]?([1-4])$/i);
    if (m25kHgm) {
      const [_, p100k, p50k, sub] = m25kHgm;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const b25 = this.getSubQuadBounds(b50, parseInt(sub, 10));
        const cLat = (b25.minLat + b25.maxLat) / 2.0;
        const cLon = (b25.minLon + b25.maxLon) / 2.0;
        return this.get25kSheet(cLat, cLon);
      }
    }

    // Format 4: 1/5 000 -> N21-d1-13 veya N21-d-1-13 veya N21-d-13
    const m5k = cleanQuery.match(/^([A-SİI]\d{1,2})-?([A-D])(?:[-_]?([1-4]))?[-_]?(\d{1,2})$/i);
    if (m5k) {
      const [_, p100k, p50k, p25k, p5k] = m5k;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const b25 = this.getSubQuadBounds(b50, p25k ? parseInt(p25k, 10) : 1);
        const b5 = this.get5kBlockBounds(b25, parseInt(p5k, 10));
        const cLat = (b5.minLat + b5.maxLat) / 2.0;
        const cLon = (b5.minLon + b5.maxLon) / 2.0;
        return this.get5kSheet(cLat, cLon);
      }
    }

    // Format 5: 1/50 000 -> N21-d veya J28-b
    const m50k = cleanQuery.match(/^([A-SİI]\d{1,2})-([A-D])$/i);
    if (m50k) {
      const [_, p100k, p50k] = m50k;
      const b100 = this.get100kBounds(p100k);
      if (b100) {
        const b50 = this.getSubQuadBounds(b100, p50k.toLowerCase());
        const cLat = (b50.minLat + b50.maxLat) / 2.0;
        const cLon = (b50.minLon + b50.maxLon) / 2.0;
        return this.get50kSheet(cLat, cLon);
      }
    }

    // Format 6: 1/100 000 -> N21 veya J28
    const m100k = cleanQuery.match(/^([A-SİI]\d{1,2})$/i);
    if (m100k) {
      const b100 = this.get100kBounds(m100k[1]);
      if (b100) {
        const cLat = (b100.minLat + b100.maxLat) / 2.0;
        const cLon = (b100.minLon + b100.maxLon) / 2.0;
        return this.get100kSheet(cLat, cLon);
      }
    }

    // Şehir / Bölge Adından Eşleştirme (Örn: "İSTANBUL", "ANKARA", "DENİZLİ")
    const normalizeTr = (str) => str.replace(/İ/g, "I").replace(/ı/g, "i").replace(/Ğ/g, "G").replace(/ğ/g, "g").replace(/Ü/g, "U").replace(/ü/g, "u").replace(/Ş/g, "S").replace(/ş/g, "s").replace(/Ö/g, "O").replace(/ö/g, "o").replace(/Ç/g, "C").replace(/ç/g, "c").toUpperCase();
    const normQuery = normalizeTr(query);

    for (const [code, cityName] of Object.entries(this.sheet100kTo250k)) {
      const normCity = normalizeTr(cityName);
      if (normCity === normQuery || normCity.includes(normQuery) || normQuery.includes(normCity)) {
        const b100 = this.get100kBounds(code);
        if (b100) {
          const cLat = (b100.minLat + b100.maxLat) / 2.0;
          const cLon = (b100.minLon + b100.maxLon) / 2.0;
          return this.get100kSheet(cLat, cLon);
        }
      }
    }

    return null;
  }

  /**
   * Harita Görünüm Alanındaki (BBOX) Tüm Paftaları Listeler
   * Ekran performansını korumak ve yarım pafta çizimini önlemek için otomatik ölçek adaptasyonu içerir.
   */
  getVisibleSheets(south, west, north, east, scale = "100k") {
    let curScale = scale === "10k" ? "5k" : scale;
    const minLat = Math.max(this.turkeyBounds.minLat, south);
    const minLon = Math.max(this.turkeyBounds.minLon, west);
    const maxLat = Math.min(this.turkeyBounds.maxLat, north);
    const maxLon = Math.min(this.turkeyBounds.maxLon, east);

    if (minLat >= maxLat || minLon >= maxLon) return [];

    const stepMap = { "100k": 0.5, "50k": 0.25, "25k": 0.125, "5k": 0.025, "2k": 0.0125, "1k": 0.00625 };
    const parentScaleMap = { "1k": "2k", "2k": "5k", "5k": "25k", "25k": "50k", "50k": "100k" };

    let step = stepMap[curScale] || 0.5;
    let numRows = Math.ceil((maxLat - minLat) / step);
    let numCols = Math.ceil((maxLon - minLon) / step);

    // Otomatik ölçek koruması: Ekranda 1200'den fazla pafta gerekiyorsa ve harita çok uzaktaysa
    // ekranın yarım kalmaması için tüm ekranı kapsayan uygun üst ölçeğe kademeli geçer.
    while (numRows * numCols > 1200 && parentScaleMap[curScale]) {
      curScale = parentScaleMap[curScale];
      step = stepMap[curScale] || 0.5;
      numRows = Math.ceil((maxLat - minLat) / step);
      numCols = Math.ceil((maxLon - minLon) / step);
    }

    const startLat = Math.floor(minLat / step) * step;
    const startLon = Math.floor(minLon / step) * step;
    const sheets = [];

    for (let curLat = startLat; curLat < maxLat - 1e-6; curLat += step) {
      for (let curLon = startLon; curLon < maxLon - 1e-6; curLon += step) {
        const centerLat = curLat + step / 2.0;
        const centerLon = curLon + step / 2.0;

        if (curScale === "100k") sheets.push(this.get100kSheet(centerLat, centerLon));
        else if (curScale === "50k") sheets.push(this.get50kSheet(centerLat, centerLon));
        else if (curScale === "25k") sheets.push(this.get25kSheet(centerLat, centerLon));
        else if (curScale === "5k") sheets.push(this.get5kSheet(centerLat, centerLon));
        else if (curScale === "2k") sheets.push(this.get2kSheet(centerLat, centerLon));
        else if (curScale === "1k") sheets.push(this.get1kSheet(centerLat, centerLon));
      }
    }

    return sheets;
  }

  /**
   * Paftanın 4 Köşe Koordinatlarını Döndürür
   */
  getSheetCorners(sheet) {
    return [
      { name: "NW", code: "NW", lat: sheet.maxLat, lon: sheet.minLon },
      { name: "NE", code: "NE", lat: sheet.maxLat, lon: sheet.maxLon },
      { name: "SE", code: "SE", lat: sheet.minLat, lon: sheet.maxLon },
      { name: "SW", code: "SW", lat: sheet.minLat, lon: sheet.minLon }
    ];
  }

  /**
   * Pafta Sınırlarını ve Etiketini AutoCAD .DXF Formatında İhraç Eder
   */
  exportSheetDxf(sheet, geodesyEngine = null) {
    const corners = this.getSheetCorners(sheet);
    let pts = corners.map(c => {
      if (geodesyEngine) {
        const dom = geodesyEngine.getAutoCentralMeridian3Deg(sheet.centerLon);
        const proj = geodesyEngine.forwardTM(c.lat, c.lon, dom, 1.0, false);
        return { x: proj.easting, y: proj.northing, z: 0.0 };
      }
      return { x: c.lon, y: c.lat, z: 0.0 };
    });

    let dxf = "0\nSECTION\n2\nENTITIES\n";
    dxf += "0\nLWPOLYLINE\n8\nPAFTA_SINIRLARI\n90\n4\n70\n1\n";
    for (let pt of pts) {
      dxf += `10\n${pt.x.toFixed(3)}\n20\n${pt.y.toFixed(3)}\n`;
    }

    const textX = ((pts[0].x + pts[1].x) / 2.0).toFixed(3);
    const textY = ((pts[0].y + pts[2].y) / 2.0).toFixed(3);
    dxf += `0\nTEXT\n8\nPAFTA_ETIKET\n10\n${textX}\n20\n${textY}\n40\n50.0\n1\n${sheet.name}\n`;
    dxf += "0\nENDSEC\n0\nEOF\n";

    return dxf;
  }

  /**
   * Pafta Köşe Koordinatlarını Netcad .NCN Dosyası Formatında İhraç Eder
   */
  exportSheetNcn(sheet, geodesyEngine = null) {
    const corners = this.getSheetCorners(sheet);
    let ncn = "";

    corners.forEach((c, idx) => {
      let xVal = c.lon;
      let yVal = c.lat;

      if (geodesyEngine) {
        const dom = geodesyEngine.getAutoCentralMeridian3Deg(sheet.centerLon);
        const proj = geodesyEngine.forwardTM(c.lat, c.lon, dom, 1.0, false);
        xVal = proj.easting;
        yVal = proj.northing;
      }

      const pName = `${sheet.name}_K${idx + 1}`.padEnd(14, " ");
      ncn += `${pName} ${xVal.toFixed(3).padStart(12, " ")} ${yVal.toFixed(3).padStart(12, " ")} ${"0.000".padStart(10, " ")}\n`;
    });

    return ncn;
  }

  /**
   * Verilen pafta sınırının bir GeoJSON Geometri nesnesi ile fiziksel olarak temas edip etmediğini kontrol eder
   * Saf uzamsal kesişim hesaplamasını core/geometryUtils.js modülüne devreder.
   */
  _sheetIntersectsGeometry(sheetBox, geometry) {
    if (typeof GeometryUtils !== "undefined" && typeof GeometryUtils.bboxIntersectsGeometry === "function") {
      return GeometryUtils.bboxIntersectsGeometry(sheetBox, geometry);
    }
    return true;
  }

  /**
   * Verilen Bir Poligon veya Harita Sınırı ile Kesişen Paftaları Listeler
   * Eğer geojson parametresi verilirse salt BBOX değil, geometrik gerçek temas (intersection) kontrol edilir.
   */
  getIntersectingSheets(boundsObj, scale = "25k", optionalGeojson = null) {
    let south, west, north, east;
    let geojson = optionalGeojson;

    if (boundsObj && boundsObj.type === "FeatureCollection") {
      geojson = boundsObj;
      boundsObj = null;
    } else if (boundsObj && boundsObj.bounds && boundsObj.geojson) {
      geojson = boundsObj.geojson;
      boundsObj = boundsObj.bounds;
    }

    if (boundsObj && boundsObj.getSouth && boundsObj.getNorth) {
      south = boundsObj.getSouth();
      west = boundsObj.getWest();
      north = boundsObj.getNorth();
      east = boundsObj.getEast();
    } else if (Array.isArray(boundsObj)) {
      south = boundsObj[0];
      west = boundsObj[1];
      north = boundsObj[2];
      east = boundsObj[3];
    } else if (boundsObj) {
      south = boundsObj.south ?? boundsObj.minLat;
      west = boundsObj.west ?? boundsObj.minLon;
      north = boundsObj.north ?? boundsObj.maxLat;
      east = boundsObj.east ?? boundsObj.maxLon;
    }

    // GeoJSON'dan sınır kutusu türetme
    if ((isNaN(south) || isNaN(west) || isNaN(north) || isNaN(east)) && geojson && geojson.features) {
      south = Infinity; north = -Infinity; west = Infinity; east = -Infinity;
      const scanCoords = c => {
        if (typeof c[0] === "number" && typeof c[1] === "number") {
          const lon = c[0], lat = c[1];
          if (lon < west) west = lon;
          if (lon > east) east = lon;
          if (lat < south) south = lat;
          if (lat > north) north = lat;
        } else if (Array.isArray(c)) {
          c.forEach(scanCoords);
        }
      };
      geojson.features.forEach(f => {
        if (f.geometry && f.geometry.coordinates) scanCoords(f.geometry.coordinates);
      });
    }

    if (isNaN(south) || isNaN(west) || isNaN(north) || isNaN(east)) {
      return [];
    }

    // Türkiye sınırları dışındaki alanları kırp
    const minLat = Math.max(this.turkeyBounds.minLat, Math.min(south, north));
    const maxLat = Math.min(this.turkeyBounds.maxLat, Math.max(south, north));
    const minLon = Math.max(this.turkeyBounds.minLon, Math.min(west, east));
    const maxLon = Math.min(this.turkeyBounds.maxLon, Math.max(west, east));

    if (minLat > maxLat || minLon > maxLon) {
      return [];
    }

    // Türkiye pafta standart koordinat adımları:
    // 1/100 000: 30' = 0.5°
    // 1/50 000:  15' = 0.25°
    // 1/25 000:  7'30" = 0.125°
    // 1/5 000:   1'30" = 0.025°
    // 1/2 000:   45" = 0.0125°
    // 1/1 000:   22.5" = 0.00625°
    const stepMap = {
      "100k": 0.5,
      "50k": 0.25,
      "25k": 0.125,
      "5k": 0.025,
      "2k": 0.0125,
      "1k": 0.00625
    };
    const step = stepMap[scale] || 0.125;

    const eps = 1e-7;
    const startLat = Math.floor((minLat + eps) / step) * step;
    const endLat = Math.floor((maxLat - eps) / step) * step;
    const startLon = Math.floor((minLon + eps) / step) * step;
    const endLon = Math.floor((maxLon - eps) / step) * step;

    let matchedSheets = [];
    const addedSheetNames = new Set();

    for (let curLat = startLat; curLat <= endLat + 1e-5; curLat += step) {
      for (let curLon = startLon; curLon <= endLon + 1e-5; curLon += step) {
        const centerLat = curLat + step / 2.0;
        const centerLon = curLon + step / 2.0;

        let sheet = null;
        if (scale === "100k") sheet = this.get100kSheet(centerLat, centerLon);
        else if (scale === "50k") sheet = this.get50kSheet(centerLat, centerLon);
        else if (scale === "25k") sheet = this.get25kSheet(centerLat, centerLon);
        else if (scale === "5k") sheet = this.get5kSheet(centerLat, centerLon);
        else if (scale === "2k") sheet = this.get2kSheet(centerLat, centerLon);
        else if (scale === "1k") sheet = this.get1kSheet(centerLat, centerLon);

        if (sheet && !addedSheetNames.has(sheet.name)) {
          addedSheetNames.add(sheet.name);
          matchedSheets.push(sheet);
        }
      }
    }

    // Sınır veya tek nokta durumunda güvence
    if (matchedSheets.length === 0) {
      const cLat = (minLat + maxLat) / 2.0;
      const cLon = (minLon + maxLon) / 2.0;
      let sheet = null;
      if (scale === "100k") sheet = this.get100kSheet(cLat, cLon);
      else if (scale === "50k") sheet = this.get50kSheet(cLat, cLon);
      else if (scale === "25k") sheet = this.get25kSheet(cLat, cLon);
      else if (scale === "5k") sheet = this.get5kSheet(cLat, cLon);
      else if (scale === "2k") sheet = this.get2kSheet(cLat, cLon);
      else if (scale === "1k") sheet = this.get1kSheet(cLat, cLon);
      if (sheet) matchedSheets.push(sheet);
    }

    // Gerçek Geometrik Kesişim Filtresi:
    // Eğer GeoJSON geometrisi mevcutsa, BBOX dikdörtgeni içindeki boş paftaları filtrele;
    // yalnızca geometri ile fiziksel olarak temas eden paftaları koru.
    if (geojson && Array.isArray(geojson.features) && geojson.features.length > 0) {
      const validFeatures = geojson.features.filter(f => f && f.geometry);
      if (validFeatures.length > 0) {
        const strictlyIntersecting = matchedSheets.filter(sheet => {
          return validFeatures.some(f => this._sheetIntersectsGeometry(sheet, f.geometry));
        });
        if (strictlyIntersecting.length > 0) {
          matchedSheets = strictlyIntersecting;
        }
      }
    }

    return matchedSheets.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Tekil Paftayı Google Earth .KML Formatında İhraç Eder
   */
  exportSheetKml(sheetNameOrObj) {
    const sheet = typeof sheetNameOrObj === "string" ? this.resolveSheetByName(sheetNameOrObj) : sheetNameOrObj;
    if (!sheet) return null;
    return this.exportMultipleSheetsKml([sheet], `Pafta - ${sheet.name}`);
  }

  exportSingleSheetKml(sheetNameOrObj) {
    return this.exportSheetKml(sheetNameOrObj);
  }

  /**
   * Tekil Paftayı GeoJSON Formatında İhraç Eder
   */
  exportSheetGeoJson(sheetNameOrObj) {
    const sheet = typeof sheetNameOrObj === "string" ? this.resolveSheetByName(sheetNameOrObj) : sheetNameOrObj;
    if (!sheet) return null;
    return this.exportMultipleSheetsGeoJson([sheet]);
  }

  exportSingleSheetGeoJson(sheetNameOrObj) {
    return this.exportSheetGeoJson(sheetNameOrObj);
  }

  /**
   * Çoklu Paftaları GeoJSON Formatında İhraç Eder
   */
  exportMultipleSheetsGeoJson(sheets) {
    const features = sheets.map(sh => {
      const datum = this.getHgmDatumRecord(sh.name, sh.centerLat, sh.centerLon);
      return {
        type: "Feature",
        properties: {
          name: sh.name,
          scale: sh.scale,
          regionalName: sh.regionalName || "",
          centerLat: sh.centerLat,
          centerLon: sh.centerLon,
          hgm_yukseklik_duz_m: datum.yukseklikDuz,
          hgm_yukari_duz_m: datum.yukariDuz,
          hgm_saga_duz_m: datum.sagaDuz,
          hgm_enlem_duz_arcsec: datum.enlemDuz,
          hgm_boylam_duz_arcsec: datum.boylamDuz
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[sh.minLon, sh.minLat], [sh.maxLon, sh.minLat], [sh.maxLon, sh.maxLat], [sh.minLon, sh.maxLat], [sh.minLon, sh.minLat]]]
        }
      };
    });

    return JSON.stringify({
      type: "FeatureCollection",
      features: features
    }, null, 2);
  }

  /**
   * Çoklu Paftaları Google Earth .KML Formatında İhraç Eder
   */
  exportMultipleSheetsKml(sheets, docName = "Temas Eden Paftalar") {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>${docName}</name>
    <description>GNSS Pos Web Studio - Sheet Index</description>
<Style id="paftaPolyStyle">
  <LineStyle><color>ff00d4ff</color><width>2.5</width></LineStyle>
  <PolyStyle><color>3300d4ff</color></PolyStyle>
</Style>
`;

    sheets.forEach(sh => {
      const datum = this.getHgmDatumRecord(sh.name, sh.centerLat, sh.centerLon);
      const corners = this.getSheetCorners(sh);
      let coordStr = "";
      corners.forEach(c => {
        coordStr += `${c.lon.toFixed(7)},${c.lat.toFixed(7)},0 `;
      });
      coordStr += `${corners[0].lon.toFixed(7)},${corners[0].lat.toFixed(7)},0`;

      kml += `
  <Placemark>
    <name>${sh.name} (${sh.scale})</name>
    <styleUrl>#paftaPolyStyle</styleUrl>
    <ExtendedData>
      <Data name="Sheet"><value>${sh.name}</value></Data>
      <Data name="Scale"><value>${sh.scale}</value></Data>
      <Data name="Datum_N"><value>${datum.yukseklikDuz.toFixed(2)}</value></Data>
      <Data name="Datum_dX"><value>${datum.yukariDuz.toFixed(1)}</value></Data>
      <Data name="Datum_dY"><value>${datum.sagaDuz.toFixed(1)}</value></Data>
      <Data name="Center"><value>${sh.centerLat.toFixed(5)}, ${sh.centerLon.toFixed(5)}</value></Data>
    </ExtendedData>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>${coordStr}</coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>
`;
    });

    kml += "</Document>\n</kml>";
    return kml;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PaftaIndexEngine;
}