"""
HTML'de kullanılan tüm spacing/border utility class'larının (mb-N, px-N, border-b vb.)
CSS'te gerçekten tanımlı olup olmadığını kontrol eder.
"""
import re
import glob
import os

os.chdir("c:/gnss_pos_studio/web")

CSS_FILES = [
    "css/foundation.css",
    "css/components.css",
    "css/layout.css",
    "css/responsive-theme.css",
]

HTML_GLOBS = [
    "components/**/*.html",
    "reports/**/*.html",
    "index.html"
]

UTILITY_PATTERN = re.compile(r"^(m|p)[tblrxy]?-\d+$|^border-[tblr]$|^border$")


def main():
    defined = set()
    for f in CSS_FILES:
        try:
            text = open(f, encoding="utf-8", errors="ignore").read()
        except FileNotFoundError:
            print(f"UYARI: {f} bulunamadı, atlandı")
            continue
        for m in re.finditer(r"\.([a-zA-Z_][a-zA-Z0-9_-]*)\s*[,{]", text):
            defined.add(m.group(1))

    used = set()
    files = []
    for pattern in HTML_GLOBS:
        files.extend(glob.glob(pattern, recursive=True))

    for f in files:
        try:
            html = open(f, encoding="utf-8", errors="ignore").read()
        except FileNotFoundError:
            continue
        for m in re.finditer(r'class="([^"]*)"', html):
            for c in m.group(1).split():
                if UTILITY_PATTERN.match(c):
                    used.add(c)

    missing = sorted(c for c in used if c not in defined)

    print(f"Taranan HTML dosya sayısı: {len(files)}")
    print(f"Kullanılan spacing/border utility class sayısı: {len(used)}")
    print(f"Eksik: {len(missing)}")
    if missing:
        print("Eksik class'lar:", missing)
    else:
        print("Hiç eksik utility yok - tamamlandı.")


if __name__ == "__main__":
    main()
