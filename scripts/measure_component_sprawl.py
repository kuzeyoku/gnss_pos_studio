"""
Card/Buton/Badge/Alert/Dropzone ailelerinde kac FARKLI ISIMLI class oldugunu sayar.
Amac: bu sayilari zaman icinde DUSURMEK. Konsolidasyon ilerledikce bu script'i tekrar
calistir - sayilar azalmiyorsa is yapilmamis demektir.
"""
import re
import os

os.chdir("c:/gnss_pos_studio/web")

CSS_FILES = ["css/foundation.css", "css/components.css", "css/layout.css", "css/responsive-theme.css"]

FAMILIES = {
    "card/panel/box": re.compile(r"^\.[a-zA-Z0-9_-]*(card|panel|box)[a-zA-Z0-9_-]*$"),
    "buton (btn iceren)": re.compile(r"^\.[a-zA-Z0-9_-]*btn[a-zA-Z0-9_-]*$"),
    "badge/rozet": re.compile(r"^\.[a-zA-Z0-9_-]*badge[a-zA-Z0-9_-]*$"),
    "alert/uyari": re.compile(r"^\.[a-zA-Z0-9_-]*alert[a-zA-Z0-9_-]*$"),
    "dropzone/upload": re.compile(r"^\.[a-zA-Z0-9_-]*(dropzone|upload)[a-zA-Z0-9_-]*$", re.IGNORECASE),
}


def main():
    all_selectors = set()
    for f in CSS_FILES:
        try:
            text = open(f, encoding="utf-8", errors="ignore").read()
        except FileNotFoundError:
            continue
        for m in re.finditer(r"^\s*(\.[a-zA-Z0-9_-]+)\s*[,{]", text, re.MULTILINE):
            all_selectors.add(m.group(1))

    print(f"{'Aile':<22} {'Farkli isim sayisi'}")
    print("-" * 45)
    total = 0
    for name, pattern in FAMILIES.items():
        matches = sorted(s for s in all_selectors if pattern.match(s))
        print(f"{name:<22} {len(matches)}")
        total += len(matches)
    print("-" * 45)
    print(f"{'TOPLAM':<22} {total}")
    print("\nHedef: her aile icin tek haneli sayilara inmek (canonik bilesen + modifier class'lar haric).")


if __name__ == "__main__":
    main()
