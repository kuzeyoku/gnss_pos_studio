with open('web/css_old/components.css', 'r', encoding='utf-8') as f:
    orig_css = f.read()

from scratch.build_consolidated_css import css_content as new_css
import re

orig_selectors = set(s.strip() for s in re.findall(r'([^{]+)\{', orig_css))
new_selectors = set(s.strip() for s in re.findall(r'([^{]+)\{', new_css))

print(f"Original CSS selectors: {len(orig_selectors)}")
print(f"New CSS selectors: {len(new_selectors)}")

missing = []
for sel in orig_selectors:
    # Check if selector or part of it is in new CSS
    parts = [p.strip() for p in sel.split(',')]
    uncovered = []
    for p in parts:
        # Check if the class/id appears anywhere in new CSS
        classes = re.findall(r'(\.[a-zA-Z0-9_-]+|#[a-zA-Z0-9_-]+)', p)
        if not any(c in new_css for c in classes):
            uncovered.append(p)
    if uncovered:
        missing.append((sel, uncovered))

print(f"Selectors with classes/IDs not present in new CSS: {len(missing)}")
for s, u in missing[:30]:
    print(" ", s[:60], "-->", u[:2])
