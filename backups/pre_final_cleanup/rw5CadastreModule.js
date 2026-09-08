/**
 * GNSS Web Toolbox - RW5 Kadastro Çetelesi & Çift Okuma Kontrol Modülü
 * SurvCE / SurvStar / Carlson .RW5 ham veri okuyucu ve analiz motoru
 */

class Rw5CadastreModule {
    constructor() {
        this.rawPoints = [];
        this.matchedPairs = [];
        this.unmatchedPoints = [];
    }

    /**
     * .RW5 Ham Metin İçeriğini Ayrıştırır
     */
    parseRw5Text(rw5Text) {
        const lines = rw5Text.split('\n');
        const points = [];
        let cur = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const dmsToDecimal = (val) => {
                if (val === undefined || val === null || isNaN(val)) return 0;
                const isNeg = val < 0;
                const absVal = Math.abs(val);
                const deg = Math.floor(absVal);
                const minSec = (absVal - deg) * 100;
                const min = Math.floor(minSec + 1e-9);
                const sec = (minSec - min) * 100;
                if (min >= 60 || sec >= 60) return val;
                const decimal = deg + min / 60 + sec / 3600;
                return isNeg ? -decimal : decimal;
            };

            const parseSegment = (p) => {
                const s = p.trim();
                if (!s) return;
                if (/^EL/i.test(s) || /^ELEV/i.test(s) || /^HT/i.test(s)) {
                    const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, ''));
                    if (!isNaN(v)) { cur.h = v; cur.elRaw = v; }
                } else if (/^LA/i.test(s) || /^LAT/i.test(s)) {
                    const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, ''));
                    if (!isNaN(v)) cur.lat = dmsToDecimal(v);
                } else if (/^LN/i.test(s) || /^LON/i.test(s)) {
                    const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, ''));
                    if (!isNaN(v)) cur.lon = dmsToDecimal(v);
                } else if (/^N[\s:]/i.test(s) || /^NORTH/i.test(s) || /^N[\d.-]/i.test(s)) {
                    const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, ''));
                    if (!isNaN(v)) cur.n = v;
                } else if (/^E[\s:]/i.test(s) || /^EAST/i.test(s) || (/^E[\d.-]/i.test(s) && !/^EL/i.test(s))) {
                    const v = parseFloat(s.replace(/^[A-Za-z\s:]+/, ''));
                    if (!isNaN(v)) cur.e = v;
                }
            };

            if (line.startsWith('BP,PN') || line.startsWith('--BP,PN') || line.includes('SRBASE')) {
                cur = {};
                continue;
            }

            if (line.startsWith('GPS,PN') || line.startsWith('--GPS,PN') || line.startsWith('EP,PN') || line.startsWith('SP,PN')) {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    cur.pn = parts[1].replace(/^(PN|EP|SP):?/i, '').trim();
                    for (let p of parts.slice(2)) {
                        parseSegment(p);
                    }
                }
            } else if (line.startsWith('GS,PN') || line.startsWith('--GS,PN') || line.startsWith('GS,')) {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    if (!cur.pn) cur.pn = parts[1].replace(/^(PN):?/i, '').trim();
                    for (let p of parts.slice(2)) {
                        parseSegment(p);
                    }
                }
            } else if (line.startsWith('--DT') || line.startsWith('--Date:')) {
                cur.dt = line.replace(/^--(DT|Date:)/i, '').trim();
            } else if (line.startsWith('--TM') || line.startsWith('--Time:')) {
                cur.tm = line.replace(/^--(TM|Time:)/i, '').trim();
            } else if (line.startsWith('--Entered Rover HR:') || line.startsWith('--HR:') || line.startsWith('LS,HR')) {
                const m = line.match(/HR:?\s*([\d.]+)/i);
                if (m) cur.hr = parseFloat(m[1]);
            } else if (line.startsWith('--HSDV:') || line.startsWith('--RMS:')) {
                const pairs = line.substring(2).split(',');
                for (let pair of pairs) {
                    if (pair.includes(':')) {
                        const [k, v] = pair.split(':');
                        cur[k.trim().toLowerCase()] = v.trim();
                    }
                }

                if (cur.pn && cur.n !== undefined && cur.e !== undefined) {
                    let dtObj = null;
                    if (cur.dt && cur.tm) {
                        const [mo, dy, yr] = cur.dt.split('-').map(Number);
                        const [hr, mn, sc] = cur.tm.split(':').map(Number);
                        dtObj = new Date(yr, mo - 1, dy, hr, mn, sc);
                    }
                    cur.timestamp = dtObj;
                    cur.hsdvMm = cur.hsdv ? (parseFloat(cur.hsdv) * 1000).toFixed(1) : '-';
                    cur.vsdvMm = cur.vsdv ? (parseFloat(cur.vsdv) * 1000).toFixed(1) : '-';
                    cur.sats = cur.sats ? parseInt(cur.sats) : '-';
                    cur.pdop = cur.pdop ? parseFloat(cur.pdop).toFixed(2) : '-';
                    cur.status = cur.status || 'Fixed';
                    cur.hr = cur.hr || 1.70;

                    points.push(cur);
                }
                cur = {};
            }
        }

        this.rawPoints = points;
        return points;
    }

    /**
     * İki Okuma Kontrolünü ve Ortalama Hesabını Yapar
     * @param {number} maxDistCm - Kadastro Toleransı (cm, örn: 7.0)
     * @param {number} minTimeDiffMin - Minimum zaman aralığı (dakika, örn: 60.0)
     * @param {number} matchThresholdM - Aynı Nokta Sayılma Eşik Yarıçapı (metre, örn: 1.0m)
     */
    analyzeDoubleReadings(maxDistCm = 7.0, minTimeDiffMin = 60.0, matchThresholdM = 1.0) {
        const points = this.rawPoints;
        const matched = [];
        const matchedIdxSet = new Set();

        // 1. Eşleştirme Algoritması: Sadece mesafe <= matchThresholdM (örn: 1 metre) olanlar aynı nokta sayılır!
        for (let i = 0; i < points.length; i++) {
            if (matchedIdxSet.has(i)) continue;
            const p1 = points[i];
            let bestMatch = null;
            let minDist = 999999.0;

            for (let j = 0; j < points.length; j++) {
                if (i === j || matchedIdxSet.has(j)) continue;
                const p2 = points[j];

                // 2B Yatay Mesafe
                const dy = p2.e - p1.e;
                const dx = p2.n - p1.n;
                const dist2d = Math.sqrt(dy * dy + dx * dx);

                // 1 metreden veya eşik mesafesinden büyükse ASLA aynı nokta kabul edilmez!
                if (dist2d <= matchThresholdM && dist2d < minDist) {
                    minDist = dist2d;
                    bestMatch = { j, p2, dist2d };
                }
            }

            if (bestMatch) {
                const { j, p2, dist2d } = bestMatch;
                matchedIdxSet.add(i);
                matchedIdxSet.add(j);

                // Farklar
                const dy = (p2.e - p1.e) * 100; // cm
                const dx = (p2.n - p1.n) * 100; // cm
                const dh = (p2.h - p1.h) * 100; // cm
                const ds2dCm = dist2d * 100;    // cm
                const ds3dCm = Math.sqrt(dist2d * dist2d + (p2.h - p1.h) * (p2.h - p1.h)) * 100; // cm

                // Zaman Farkı ve İnsan Formatı
                let timeDiffSec = 0;
                if (p1.timestamp && p2.timestamp) {
                    timeDiffSec = Math.abs(p2.timestamp - p1.timestamp) / 1000.0;
                }
                const timeDiffMin = timeDiffSec / 60.0;

                const formatTimeHuman = (s) => {
                    const sec = Math.max(0, Math.round(s));
                    if (sec < 60) return `${sec} sn`;
                    const mins = Math.floor(sec / 60);
                    const remSec = sec % 60;
                    if (mins < 60) return remSec > 0 ? `${mins} dk ${remSec} sn` : `${mins} dk`;
                    const hours = Math.floor(mins / 60);
                    const remMins = mins % 60;
                    return remMins > 0 ? `${hours} sa ${remMins} dk` : `${hours} sa`;
                };

                // Kontrol Kriterleri
                const isDistPassed = ds2dCm <= maxDistCm;
                const isTimePassed = timeDiffMin >= minTimeDiffMin;

                // Ortalama Koordinatlar
                const avgE = (p1.e + p2.e) / 2.0;
                const avgN = (p1.n + p2.n) / 2.0;
                const avgH = (p1.h + p2.h) / 2.0;

                matched.push({
                    p1,
                    p2,
                    pointName: p1.pn === p2.pn ? p1.pn : `${p1.pn} / ${p2.pn}`,
                    dy: dy.toFixed(1),
                    dx: dx.toFixed(1),
                    dh: dh.toFixed(1),
                    ds2d: ds2dCm.toFixed(1),
                    ds3d: ds3dCm.toFixed(1),
                    timeDiffSec: Math.round(timeDiffSec),
                    timeDiffMin: timeDiffMin.toFixed(1),
                    timeDiffStr: formatTimeHuman(timeDiffSec),
                    timeDiffHours: (timeDiffMin / 60.0).toFixed(2),
                    isDistPassed,
                    isTimePassed,
                    avgE: avgE.toFixed(4),
                    avgN: avgN.toFixed(4),
                    avgH: avgH.toFixed(4)
                });
            }
        }

        // İkinci okuması bulunmayan (tekil) noktalar
        const unmatched = [];
        for (let i = 0; i < points.length; i++) {
            if (!matchedIdxSet.has(i)) {
                unmatched.push(points[i]);
            }
        }

        this.matchedPairs = matched;
        this.unmatchedPoints = unmatched;

        return { matched, unmatched };
    }

    /**
     * Kadastro Ölçü Çetelesini Resmi Yazdırılabilir HTML Şablonuna Dönüştürür
     */
    generatePrintableCadastreReport(jobName = 'KADASTRO RTK/CORS ÖLÇÜ KONTROL ÇETELESİ') {
        const dateStr = new Date().toLocaleDateString('tr-TR');

        let html = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <title>${jobName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; margin: 15mm; color: #000; }
            h2, h3 { text-align: center; margin: 2px 0; }
            .header-box { border: 1px solid #333; padding: 8px; margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px; }
            th, td { border: 1px solid #444; padding: 4px 6px; text-align: center; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .passed { color: #059669; font-weight: bold; }
            .warning { color: #d97706; font-weight: bold; }
            .failed { color: #dc2626; font-weight: bold; }
            .font-bold { font-weight: bold; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; text-align: center; }
            .sign-box { width: 200px; padding-top: 40px; border-top: 1px solid #333; }
            @media print { body { margin: 0; } button { display: none; } }
          </style>
        </head>
        <body>
          <h2>T.C. TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ</h2>
          <h3>TUSAGA-AKTİF (CORS-TR) ÇİFT OKUMA VE KONTROL ÇETELESİ</h3>
          <br>
          <div class="header-box">
            <div><strong>İş / Dosya Adı:</strong> ${jobName}</div>
            <div><strong>Tarih:</strong> ${dateStr}</div>
            <div><strong>Hata Limiti (dS):</strong> ≤ 7.0 cm</div>
            <div><strong>Min. Zaman Farkı:</strong> ≥ 60 Dakika (1 Saat)</div>
          </div>

          <h4>1. ÇİFT OKUMA VE FARK KONTROL TABLOSU</h4>
          <table>
            <thead>
              <tr>
                <th rowspan="2">Nokta No</th>
                <th colspan="2">1. Ölçü (Zaman)</th>
                <th colspan="2">2. Ölçü (Zaman)</th>
                <th rowspan="2">Zaman Farkı</th>
                <th colspan="3">Farklar (cm)</th>
                <th rowspan="2">dS (2B) (cm)</th>
                <th rowspan="2">Kontrol (≤7cm)</th>
                <th colspan="3">Ortalama Koordinatlar (m)</th>
              </tr>
              <tr>
                <th>Tarih</th>
                <th>Saat</th>
                <th>Tarih</th>
                <th>Saat</th>
                <th>dY</th>
                <th>dX</th>
                <th>dH</th>
                <th>Y (Sağa)</th>
                <th>X (Yukarı)</th>
                <th>H (Kot)</th>
              </tr>
            </thead>
            <tbody>
        `;

        for (let m of this.matchedPairs) {
            const distClass = m.isDistPassed ? 'passed' : 'failed';
            const distText = m.isDistPassed ? 'UYGUN' : 'LİMİT DIŞI';
            const timeClass = m.isTimePassed ? 'passed' : 'warning';

            html += `
              <tr>
                <td><strong>${m.pointName}</strong></td>
                <td>${m.p1.dt || '-'}</td>
                <td>${m.p1.tm || '-'}</td>
                <td>${m.p2.dt || '-'}</td>
                <td>${m.p2.tm || '-'}</td>
                <td class="${timeClass}">${m.timeDiffStr || `${m.timeDiffMin} dk`}</td>
                <td>${m.dy}</td>
                <td>${m.dx}</td>
                <td>${m.dh}</td>
                <td class="font-bold">${m.ds2d}</td>
                <td class="${distClass}">${distText}</td>
                <td>${m.avgE}</td>
                <td>${m.avgN}</td>
                <td>${m.avgH}</td>
              </tr>
            `;
        }

        html += `
            </tbody>
          </table>

          <div class="footer">
            <div class="sign-box">Ölçümü Yapan<br>Harita Mühendisi / Teknikeri</div>
            <div class="sign-box">Kontrol Eden<br>Kontrol Mühendisi</div>
            <div class="sign-box">Onaylayan<br>Kadastro Müdürü / Yetkili</div>
          </div>
        </body>
        </html>
        `;

        return html;
    }

    /**
     * Netcad (.NCN) Nokta Dosyası Çıktısı Üretir
     */
    exportNcnText() {
        let ncn = '';
        for (let m of this.matchedPairs) {
            ncn += `${m.pointName.padEnd(12, ' ')} ${m.avgE.padStart(12, ' ')} ${m.avgN.padStart(12, ' ')} ${m.avgH.padStart(10, ' ')}\n`;
        }
        return ncn;
    }

    /**
     * Kadastro Çetelesi CSV Formatında Dışa Aktarır
     */
    exportCadastreCsv() {
        let csv = 'Nokta_No,1_Tarih,1_Saat,2_Tarih,2_Saat,Zaman_Farki_Dk,Zaman_Farki_Saat,dY_cm,dX_cm,dH_cm,dS_cm,Hata_Durumu,Ortalama_Y,Ortalama_X,Ortalama_H\n';
        for (let m of this.matchedPairs) {
            csv += `${m.pointName},${m.p1.dt},${m.p1.tm},${m.p2.dt},${m.p2.tm},${m.timeDiffMin},${m.timeDiffHours},${m.dy},${m.dx},${m.dh},${m.ds2d},${m.isDistPassed ? 'UYGUN' : 'LIMIT_ASILDI'},${m.avgE},${m.avgN},${m.avgH}\n`;
        }
        return csv;
    }
}
