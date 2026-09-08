"""
CSS icerik-bazli tekrar tarayici (isim degil, property-set karsilastirmasi yapar).
PurgeCSS/isim-bazli araclarin kacirdigi "farkli isim, ayni icerik" tekrarlarini bulur.

Kullanim:
    pip install tinycss2 --break-system-packages
    python3 css_dup_scan.py

Not: FILES listesini kendi css klasor yapina gore guncelle.
"""
import tinycss2
import glob
import collections

import os

base_dir = "web/css" if os.path.isdir("web/css") else "css"
FILES = [
    os.path.join(base_dir, f).replace("\\", "/")
    for f in ["foundation.css", "components.css", "layout.css", "responsive-theme.css"]
]

MIN_DECLARATIONS = 3  # bundan az deklarasyonlu kurallar gurultu sayilir, atlanir


def extract_rules(path):
    text = open(path, encoding="utf-8", errors="ignore").read()
    top_level = tinycss2.parse_stylesheet(text, skip_whitespace=True, skip_comments=True)
    out = []

    def walk(rule_list):
        for r in rule_list:
            if r.type == "qualified-rule":
                sel = tinycss2.serialize(r.prelude).strip()
                body = tinycss2.serialize(r.content).strip()
                decls = [d.strip() for d in body.split(";") if d.strip()]
                norm = ";".join(sorted(decls))
                out.append((path, sel, norm, len(decls)))
            elif r.type == "at-rule" and r.content:
                inner = tinycss2.parse_stylesheet(
                    tinycss2.serialize(r.content), skip_whitespace=True, skip_comments=True
                )
                walk(inner)

    walk(top_level)
    return out


def main():
    all_rules = []
    for f in FILES:
        try:
            all_rules.extend(extract_rules(f))
        except Exception as e:
            print("ERR", f, e)

    groups = collections.defaultdict(list)
    for path, sel, norm, ndecl in all_rules:
        if ndecl >= MIN_DECLARATIONS:
            groups[norm].append((path, sel))

    report = [
        (len(items), items)
        for norm, items in groups.items()
        if len(items) > 1
    ]
    report.sort(key=lambda x: -x[0])

    total_selectors_in_dupes = sum(c for c, _ in report)

    print(f"Toplam kural: {len(all_rules)}")
    print(f"Birebir ayni (>= {MIN_DECLARATIONS} declaration) icerige sahip grup sayisi: {len(report)}")
    print(f"Bu gruplardaki toplam selector sayisi: {total_selectors_in_dupes}")
    print("\n=== Tum tekrar gruplari (buyukten kucuge) ===")
    for count, items in report:
        print(f"\n[{count} kopya]")
        for p, s in items:
            print(f"  - {p} :: {s}")

    if not report:
        print("\nTekrar bulunamadi - konsolidasyon hedefine ulasilmis olabilir.")


if __name__ == "__main__":
    main()
