# Hesaplama Motorları API Envanteri

> **Referans Amacı:** Bu envanter, Faz 3 (Unit Test) için temel referanstır.  
> **Kaynak:** `web/js/modules/*.js` — 9 motor modülü  
> **Oluşturulma:** Otomatik AST taraması ile üretilmiştir.

---

## 1. GeodesyEngine (`geodesyEngine.js` — 1213 satır)

Jeodezi ve koordinat dönüşüm motoru: ITRF-96/GRS80 ve ED-50/Hayford elipsoidleri, TM projeksiyonu, ECEF dönüşümleri, 7-parametreli Bursa-Wolf datum dönüşümü, 2B Helmert ve 3B LSE çözücü.

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `static async loadEpsgRegistry()` | — | `Promise<Object\|null>` | `data/epsg_registry.json`'dan EPSG kayıtlarını yükler (singleton) |
| 2 | `rebuildEpsgRegistry()` | — | `void` | EPSG verisinden O(1) arama sözlüğü üretir |
| 3 | `async fetchExternalJson()` | — | `Promise<void>` | EPSG JSON'ını yeniden çeker |
| 4 | `populateSelect(selectEl, selectedCode?)` | `HTMLSelectElement, string?` | `void` | Select DOM elemanını EPSG kayıtlarıyla doldurur |
| 5 | `getAutoCentralMeridian3Deg(lon)` | `number` (boylam°) | `number` (DOM°) | Boylama göre en yakın TM 3° DOM seçer |
| 6 | `wgs84ToTurefTM(latDeg, lonDeg, dom?)` | `number, number, number?` | `{easting, northing}` | WGS-84 → TUREF TM 3° |
| 7 | `turefTMToWgs84(easting, northing, dom?)` | `number, number, number?` | `{lat, lon}` | TUREF TM 3° → WGS-84 |
| 8 | `forwardTM(latDeg, lonDeg, lon0Deg?, scale0?, isHayford?)` | `number×5` | `{easting, northing}` | Düz TM (Gauss-Krüger) projeksiyonu |
| 9 | `inverseTM(easting, northing, lon0Deg?, scale0?, isHayford?)` | `number×5` | `{lat, lon}` | Ters TM projeksiyonu |
| 10 | `tmToGeographic(easting, northing, lon0?, datum?)` | `number, number, number, string` | `{lat, lon}` | TM → coğrafi (wrapper) |
| 11 | `geographicToTm(lat, lon, lon0?, datum?)` | `number, number, number, string` | `{easting, northing}` | Coğrafi → TM (wrapper) |
| 12 | `geodeticToEcef(latDeg, lonDeg, h?, isHayford?)` | `number×4` | `{X, Y, Z}` | Coğrafi → ECEF kartezyen |
| 13 | `ecefToGeodetic(X, Y, Z, isHayford?)` | `number×4` | `{lat, lon, h}` | ECEF → coğrafi (Bowring) |
| 14 | `transformDatum(lat, lon, h?, fromDatum?, toDatum?, customParams?)` | `number×3, string×2, Object?` | `{lat, lon, h}` | 7-parametreli Bursa-Wolf datum dönüşümü |
| 15 | `transformCoordinate(coord, fromEpsg?, toEpsg?, customParams?)` | `Object, string, string, Object?` | `Object` | İki EPSG kodu arası çoklu dönüşüm |
| 16 | `toDms(degVal, isLat?)` | `number, boolean?` | `string` | Ondalık derece → DMS formatı |
| 17 | `parseBatchCoordinateText(text, explicitDelimiter?)` | `string, string?` | `Array<Object>` | Toplu metin → koordinat satırları |
| 18 | `solveHelmert2D(controlPairs)` | `Array<{src, dst}>` | `Object` | 2B Helmert LSE çözücüsü |
| 19 | `transformPointHelmert2D(y, x, helmertParams)` | `number, number, Object` | `{y2, x2}` | Helmert parametreleri ile nokta dönüşümü |
| 20 | `exportNetcadDns(helmertParams, projectName?)` | `Object, string?` | `string` | Netcad .DNS dosya çıktısı |
| 21 | `parseNetcadDns(dnsText)` | `string` | `Object` | Netcad .DNS ayrıştırıcısı |
| 22 | `solveBursaWolf7Param(commonPoints3D)` | `Array<Object>` | `Object` | 3B Bursa-Wolf 7-parametre LSE çözücüsü |
| 23 | `vincentyInverse(lat1, lon1, lat2, lon2, ellipsoid?)` | `number×4, string?` | `{distanceM, azimuth12Deg, azimuth21Deg, azimuth12Grad, azimuth21Grad}` | Vincenty ters jeodezi (mesafe + azimut) |
| 24 | `vincentyDirect(lat1, lon1, azimuthDeg, distanceM, ellipsoid?)` | `number×4, string?` | `{lat2, lon2, reverseAzimuthDeg}` | Vincenty düz jeodezi |
| 25 | `gridDistance(e1, n1, e2, n2, h1?, h2?)` | `number×6` | `{distance2D, distance3D, dE, dN, dH}` | Projeksiyon düzlem mesafesi |
| 26 | `gridAzimuth(e1, n1, e2, n2)` | `number×4` | `{azimuthDeg, azimuthGrad, azimuthDMS}` | Düzlem (grid) azimut hesabı |
| 27 | `gaussArea(coords)` | `Array<{e, n}>` | `{areaM2, areaDonumTR, areaHektar, perimeterM, pointCount}` | Gauss alan hesabı (Shoelace) |
| 28 | `decDegToDMS(decDeg)` | `number` | `string` | Ondalık derece → DMS string |
| 29 | `dmsToDec(dmsStr)` | `string` | `number\|null` | DMS string → ondalık derece |

---

## 2. Tg20GeoidEngine (`tg20GeoidEngine.js` — 400 satır)

HGM TG-20 Türkiye Hibrit Jeoit Modeli: GGF binary/JSON grid veri yükleyici, bilineer enterpolasyon ile jeoit ondülasyonu (N), ortometrik kot indirgemesi (H = h − N).

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `tryLoadEmbeddedModel()` | — | `boolean` | Gömülü TG-20 modelini (base64/JSON) yüklemeyi dener |
| 2 | `async loadModelFromJson(url?)` | `string?` | `Promise<boolean>` | `data/tg20Data.json`'dan JSON model yükler |
| 3 | `async loadFromUrl(url?)` | `string?` | `Promise<boolean>` | GGF binary dosyasını URL'den yükler |
| 4 | `async loadFromFile(file)` | `File` | `Promise<boolean>` | Kullanıcı dosyasından GGF yükler |
| 5 | `loadBuffer(buf)` | `ArrayBuffer` | `void` | Ham binary buffer'ı parse eder |
| 6 | `getGeoidHeight(lat, lon)` | `number, number` (°) | `number\|null` | Bilineer enterpolasyonla N (jeoit ondülasyonu) döner |
| 7 | `getGeoidInterpolationDetails(lat, lon)` | `number, number` (°) | `Object` | 4 grid düğümü, ağırlıkları ve detaylı enterpolasyon bilgisi |
| 8 | `reduceHeight(lat, lon, h)` | `number, number, number` | `{H, N, h}` | Coğrafi koordinattan H = h − N hesabı |
| 9 | `reduceHeightFromTM(y, x, h, epsgCode, geodesyEngine)` | `number×3, string, GeodesyEngine` | `Object` | TM koordinattan jeoit indirgemesi |
| 10 | `batchReducePoints(points, inputEpsg, geodesyEngine)` | `Array, string, GeodesyEngine` | `Array` | Toplu nokta indirgemesi |
| 11 | `generateReductionReport(points, projectName?)` | `Array, string?` | `string` | Metin indirgeme raporu |
| 12 | `getTg20ReportData(points, projectTitle?)` | `Array, string?` | `Object (DTO)` | Saf veri modeli (rapor için) |
| 13 | `generatePrintableReport(points, projectTitle?)` | `Array, string?` | `string (HTML)` | Yazdırılabilir A4 HTML rapor |

---

## 3. GnssFormatEngine (`gnssFormatEngine.js` — 1541 satır)

GNSS saha veri formatı motoru: RW5, RAW, CSV, JXL ayrıştırma, çift okuma kontrolü (BÖHHBÜY), TG-20 jeoit indirgemesi, DXF/NCN/KML/CSV ihraç, DXF→GeoJSON dönüşümü.

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `parseData(content, fileName?)` | `string, string?` | `Array<Object>` | Evrensel otonom format algılama ve ayrıştırma |
| 2 | `parseRw5(rw5Content)` | `string` | `Array<Object>` | SurvCE/SurvStar RW5 ayrıştırıcı |
| 3 | `parseRawFieldGenius(rawContent)` | `string` | `Array<Object>` | FieldGenius/Carlson RAW ayrıştırıcı |
| 4 | `parseCsv(csvContent)` | `string` | `Array<Object>` | CHC LandStar / standart CSV ayrıştırıcı |
| 5 | `parseGenericText(textContent)` | `string` | `Array<Object>` | Boşlukla ayrılmış genel koordinat ayrıştırıcı |
| 6 | `parseTrimbleJxl(jxlContent)` | `string` | `Array<Object>` | Trimble Access JXL (XML) ayrıştırıcı |
| 7 | `formatHumanTimeDiff(totalSeconds)` | `number` | `string` | Saniye → Türkçe zaman farkı (ör: "14 dk 30 sn") |
| 8 | `analyzeDoubleReadings(maxDistCm?, minTimeDiffMin?, matchRadiusM?)` | `number×3` | `void` | BÖHHBÜY çift okuma kontrolü ve fark analizi |
| 9 | `exportFormattedCoordinateList(formatType?)` | `string?` | `string` | Formatlanmış metin çıktısı |
| 10 | `applyTg20Reduction(tg20Engine, fallbackGeodesy?, customEngine?, applyState?)` | `Tg20GeoidEngine, GeodesyEngine?, Object?, boolean?` | `void` | TG-20 kot indirgemesi (H = h − N) |
| 11 | `getTg20ReductionReportData(projectName?)` | `string?` | `Object (DTO)` | TG-20 indirgeme rapor verisi |
| 12 | `exportTg20ReductionReport(projectName?)` | `string?` | `string` | TG-20 indirgeme raporu (şablon) |
| 13 | `getTg20ReportData(projectName?, tg20?, geodesy?)` | `string?, Object?, Object?` | `Object (DTO)` | TG-20 rapor saf veri modeli |
| 14 | `generatePrintableTg20Report(projectName?, tg20?, geodesy?)` | `string?, Object?, Object?` | `string (HTML)` | Yazdırılabilir A4 TG-20 raporu |
| 15 | `exportDxfText()` | — | `string` | AutoCAD .DXF çizim metni |
| 16 | `exportKosText()` | — | `string` | Netcad .KOS nokta listesi |
| 17 | `exportNcnText()` | — | `string` | Netcad .NCN nokta listesi |
| 18 | `exportKmlText()` | — | `string` | Google Earth .KML |
| 19 | `exportCadastreCsv()` | — | `string` | Kadastro çift okuma kontrol CSV'si |
| 20 | `getCadastreReportData(title?)` | `string?` | `Object (DTO)` | Kadastro karne veri nesnesi |
| 21 | `generatePrintableCadastreReport(title?)` | `string?` | `string (HTML)` | Yazdırılabilir kadastro çetelesi |
| 22 | `autoDetectFormat(content, fileName?)` | `string, string?` | `string` | Otomatik format algılama |
| 23 | `parseDxfToGeoJson(dxfString, overrideDom?)` | `string, number?` | `Object (GeoJSON)` | DXF → GeoJSON dönüşümü |

---

## 4. RinexMergerEngine (`rinexPowerEngine.js` — 1144 satır)

RINEX gözlem ve navigasyon dosyası motoru: header ayrıştırma, çok dosyalı birleştirme, zaman kesimi, PPK çakışma analizi, kalite incelemesi, NMEA üretimi.

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `static inspectRinexHeader(rinexText, fileName?, tailText?)` | `string×3` | `Object` | RINEX başlık ve ilk/son epoch ayrıştırma |
| 2 | `static extractRinexStartAndEnd(rinexText, headerFirstObs, headerLastObs, tailText?)` | `string×4` | `Object` | İlk ve son epoch tarama |
| 3 | `static calculateDoy(year, month, day)` | `number×3` | `number` | Yılın günü (DOY) hesabı |
| 4 | `static inspectPpkOverlap(baseInfo, roverInfo)` | `Object, Object` | `Object` | PPK zaman çakışması ve baz mesafesi |
| 5 | `static analyzeRinexQuality(rinexText)` | `string` | `Object` | Epoch-epoch gözlem kalitesi analizi |
| 6 | `setConstellations(config)` | `Object` | `void` | Uydu takımyıldızı filtresi ayarla |
| 7 | `setBands(config)` | `Object` | `void` | Frekans bandı filtresi ayarla |
| 8 | `setObsTypes(config)` | `Object` | `void` | Gözlem tipi filtresi ayarla |
| 9 | `generateNmeaLog(positions)` | `Array` | `string` | NMEA $GPGGA kayıtları üretimi |
| 10 | `static async processGroup(group, onProgress)` | `Object, Function` | `Promise<Object>` | RINEX grup dosyalarını birleştir ve kes |
| 11 | `static async mergeAndCropRinexFiles(fileObjects, fileType, targetVersion?, timeCrop?, decimation?, allowedConstellations?)` | `Array, string, string?, Object?, number?, Object?` | `Promise<string>` | Çoklu RINEX birleştirme + zaman kesimi |
| 12 | `static formatRinexVersionInHeader(headerText, newVersion)` | `string, string` | `string` | RINEX sürüm numarası güncelleme |

---

## 5. UniversalFormatConverterEngine (`universalFormatConverterEngine.js` — 1819 satır)

Evrensel format dönüştürücü: DXF, KML/KMZ, GPX, NCN/KOS, NCZ (binary), CSV, GeoJSON ayrıştırma; nokta→poligon üretimi; projeksiyon dönüşümü; DXF/KML/KMZ/NCN/GeoJSON/GPX/CSV ihracı.

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `async parseFile(fileOrContent, fileName?, options?)` | `File\|string, string?, Object?` | `Promise<Array>` | Otonom dosya ayrıştırma giriş noktası |
| 2 | `parseDxf(dxfText, options?)` | `string, Object?` | `Array` | AutoCAD/Netcad DXF ayrıştırıcı |
| 3 | `parseKml(kmlText, options?)` | `string, Object?` | `Array` | Google Earth KML ayrıştırıcı |
| 4 | `async parseKmz(kmzBlob, options?)` | `Blob, Object?` | `Promise<Array>` | KMZ (zip) ayrıştırıcı |
| 5 | `parseGpx(gpxText, options?)` | `string, Object?` | `Array` | GPS Exchange Format (GPX) ayrıştırıcı |
| 6 | `parseNcn(ncnText, options?)` | `string, Object?` | `Array` | Netcad NCN/KOS ayrıştırıcı |
| 7 | `parseNcz(arrayBufferOrBuffer, options?)` | `ArrayBuffer, Object?` | `Array` | Netcad NCZ binary proje ayrıştırıcı |
| 8 | `parseCsv(csvText, options?)` | `string, Object?` | `Array` | Saha CSV/TXT/XYZ ayrıştırıcı |
| 9 | `parseGeoJson(geoJsonText, options?)` | `string, Object?` | `Array` | GeoJSON ayrıştırıcı |
| 10 | `generatePolygonFromPoints(mode?, options?)` | `string?, Object?` | `Object` | Noktalardan alan ve poligon üretimi |
| 11 | `transformCoordinates(srcCrs, dstCrs, dom?)` | `string, string, number?` | `void` | TUREF TM ⇄ WGS84 projeksiyon dönüşümü |
| 12 | `exportDxf(options?)` | `Object?` | `string` | DXF dışa aktarma |
| 13 | `exportKml(options?)` | `Object?` | `string` | KML dışa aktarma |
| 14 | `async exportKmz(options?)` | `Object?` | `Promise<Blob>` | KMZ dışa aktarma |
| 15 | `exportNcn(options?)` | `Object?` | `string` | NCN dışa aktarma |
| 16 | `exportGeoJson(options?)` | `Object?` | `string` | GeoJSON dışa aktarma |
| 17 | `exportGpx(options?)` | `Object?` | `string` | GPX dışa aktarma |
| 18 | `exportCsv(options?)` | `Object?` | `string` | CSV dışa aktarma |

---

## 6. PaftaIndexEngine (`paftaIndexEngine.js` — 1127 satır)

Türkiye standart harita pafta bölümleme motoru: 1/100K–1/1K pafta hesabı, ters çözüm (ad→koordinat), HGM datum veritabanı, harita görünüm alanı sorgulama, DXF/NCN/KML/GeoJSON ihracı.

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `getTurkishDomZones()` | — | `Array<number>` | Türkiye TM 3° DOM listesi |
| 2 | `get100kSheet(lat, lon)` | `number, number` | `Object` | 1/100.000 pafta hesabı |
| 3 | `get50kSheet(lat, lon)` | `number, number` | `Object` | 1/50.000 pafta hesabı |
| 4 | `get25kSheet(lat, lon)` | `number, number` | `Object` | 1/25.000 pafta hesabı |
| 5 | `get5kSheet(lat, lon)` | `number, number` | `Object` | 1/5.000 pafta hesabı |
| 6 | `get2kSheet(lat, lon)` | `number, number` | `Object` | 1/2.000 pafta hesabı |
| 7 | `get1kSheet(lat, lon)` | `number, number` | `Object` | 1/1.000 pafta hesabı |
| 8 | `async loadHgmDatabase(url?)` | `string?` | `Promise<boolean>` | HGM datum veritabanını yükler |
| 9 | `getHgmDatumRecord(sheetName, centerLat, centerLon)` | `string, number, number` | `Object\|null` | HGM 1/25K pafta datum düzeltme katsayıları |
| 10 | `calculateGeoidUndulation(lat, lon, sheetName?)` | `number, number, string?` | `number\|null` | Jeoit ondülasyonu hesabı |
| 11 | `calculateHeightCorrection(lat, lon, sheetName?)` | `number, number, string?` | `number\|null` | Yükseklik düzeltmesi |
| 12 | `getAllSheetsForPoint(lat, lon)` | `number, number` | `Object` | Tüm ölçeklerdeki paftalar |
| 13 | `get100kBounds(code)` | `string` | `Object` | 1/100K pafta coğrafi sınırları |
| 14 | `getSubQuadBounds(bounds, quad)` | `Object, string` | `Object` | Sınır alanını 2×2 çeyreğe böler |
| 15 | `get5kBlockBounds(b25, num)` | `Object, number` | `Object` | 1/25K → 5×5 = 25 bloğa böler |
| 16 | `resolveSheetByName(nameQuery)` | `string` | `Object\|null` | Ad → pafta bilgisi ve sınırlar (ters çözüm) |
| 17 | `getVisibleSheets(south, west, north, east, scale?)` | `number×4, string?` | `Array` | Harita BBOX'taki paftalar |
| 18 | `getSheetCorners(sheet)` | `Object` | `Array` | Pafta 4 köşe koordinatları |
| 19 | `exportSheetDxf(sheet, geodesyEngine?)` | `Object, GeodesyEngine?` | `string` | Pafta → DXF |
| 20 | `exportSheetNcn(sheet, geodesyEngine?)` | `Object, GeodesyEngine?` | `string` | Pafta → NCN |
| 21 | `exportSheetKml(sheetNameOrObj)` | `string\|Object` | `string` | Pafta → KML |
| 22 | `exportSheetGeoJson(sheetNameOrObj)` | `string\|Object` | `Object` | Pafta → GeoJSON |
| 23 | `exportMultipleSheetsGeoJson(sheets)` | `Array` | `Object` | Çoklu pafta → GeoJSON |
| 24 | `exportMultipleSheetsKml(sheets, docName?)` | `Array, string?` | `string` | Çoklu pafta → KML |
| 25 | `getIntersectingSheets(boundsObj, scale?, geojson?)` | `Object, string?, Object?` | `Array` | Poligon/sınır ile kesişen paftalar |

---

## 7. FlightPlannerEngine (`flightPlannerEngine.js` — 2022 satır)

Fotogrametrik uçuş planlama motoru: poligon ayrıştırma, alan/çevre hesabı, GCP üretimi, güneş yörüngesi, hava durumu, GSD/irtifa/hat hesabı, fotogrametri grid üretimi, KML/DXF/NCN/CSV ihracı.

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `async parsePolygonFile(file)` | `File` | `Promise<Object>` | KML/KMZ/GeoJSON poligon ayrıştırma |
| 2 | `computePolygonStats(coords)` | `Array` | `Object` | Alan, çevre, ağırlık merkezi, BBOX |
| 3 | `simplify(aggressionFactor?)` | `number?` | `Object` | Poligon sadeleştirme (Convex Hull + Concave Collapse) |
| 4 | `async fetchRoadNetwork(customBbox?)` | `Object?` | `Promise<Object>` | OSM Overpass API yol ağı indirme |
| 5 | `addCustomRoad(coords, name?, roadType?)` | `Array, string?, string?` | `Object` | Manuel yol ekleme |
| 6 | `removeCustomRoad(roadId)` | `string` | `void` | Yol silme |
| 7 | `async parseRoadFile(file)` | `File` | `Promise<Object>` | KML/GeoJSON yol dosyası ayrıştırma |
| 8 | `async generateSmartGCPs()` | — | `Promise<Array>` | BÖHHBÜY standart YKN/DN üretimi |
| 9 | `calculateSolarTrajectory(lat, lon, dateObj?)` | `number, number, Date?` | `Object` | Güneş yörüngesi, yükselim, gölge çarpanı |
| 10 | `async fetchLiveWeather(lat, lon, targetDate?)` | `number, number, Date?` | `Promise<Object>` | Open-Meteo saatlik hava tahmini |
| 11 | `calculateFlightParameters()` | — | `Object` | GSD, irtifa, hat, fotoğraf, batarya hesabı |
| 12 | `findOptimalLongAxisHeading(polygonCoords?, sideSpacingM?)` | `Array?, number?` | `Object` | En verimli uçuş yönü otomatik bulma |
| 13 | `generatePhotogrammetryGrid()` | — | `Object` | Fotogrametri hatları ve fotoğraf pozisyonları |
| 14 | `exportFlightKml(isDjiPilot2?)` | `boolean?` | `string` | Uçuş planı → KML / DJI Pilot 2 |
| 15 | `exportGcpNcn()` | — | `string` | YKN/DN → Netcad NCN |
| 16 | `exportGcpDxf()` | — | `string` | YKN/DN → AutoCAD DXF |
| 17 | `exportGcpCsv()` | — | `string` | YKN/DN → CSV |
| 18 | `exportGcpKml()` | — | `string` | YKN/DN → Google Earth KML |

---

## 8. DroneDatabaseManager (`droneDatabase.js` — 107 satır)

Drone ve kamera sensörü veritabanı yöneticisi: JSON veritabanı yükleyici, drone/kamera sorgulama.

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `static async loadDatabase()` | — | `Promise<Object>` | `data/drone_sensors.json` yükler (singleton) |
| 2 | `async fetchExternalJson()` | — | `Promise<void>` | JSON yeniden çekme |
| 3 | `getDrones()` | — | `Array` | Tüm drone listesi |
| 4 | `getDrone(droneId)` | `string` | `Object\|null` | Tek drone |
| 5 | `getCameras()` | — | `Array` | Tüm kamera listesi |
| 6 | `getCamera(cameraId)` | `string` | `Object\|null` | Tek kamera |
| 7 | `getCamerasForDrone(droneId)` | `string` | `Array` | Droneye ait kameralar |

---

## 9. GnssReportTemplates (`gnssReportTemplates.js` — 342 satır)

Rapor şablonu yöneticisi: Kadastro karnesi ve TG-20 raporu HTML şablonlarını yükler ve doldurulan verilerle hydrate eder.

| # | Metod | Parametreler | Dönüş Tipi | Açıklama |
|---|-------|-------------|------------|----------|
| 1 | `loadReportTemplate(templateId)` | `string` | `string (HTML)` | Şablon HTML'i yükler |
| 2 | `loadAllTemplates()` | — | `void` | Tüm şablonları önyükler |

---

## Özet İstatistikleri

| Motor | Dosya | Satır | Public Metod |
|-------|-------|-------|-------------|
| GeodesyEngine | `geodesyEngine.js` | 1213 | 29 |
| Tg20GeoidEngine | `tg20GeoidEngine.js` | 400 | 13 |
| GnssFormatEngine | `gnssFormatEngine.js` | 1541 | 23 |
| RinexMergerEngine | `rinexPowerEngine.js` | 1144 | 12 |
| UniversalFormatConverterEngine | `universalFormatConverterEngine.js` | 1819 | 18 |
| PaftaIndexEngine | `paftaIndexEngine.js` | 1127 | 25 |
| FlightPlannerEngine | `flightPlannerEngine.js` | 2022 | 18 |
| DroneDatabaseManager | `droneDatabase.js` | 107 | 7 |
| GnssReportTemplates | `gnssReportTemplates.js` | 342 | 2 |
| **TOPLAM** | **9 modül** | **9715** | **147** |
