with open('web/css/responsive-theme.css', 'r', encoding='utf-8') as f:
    content = f.read()

import re

blocks = re.findall(r'([^{]+)\{([^}]+)\}', content)
print(f"Total blocks in responsive-theme.css: {len(blocks)}")

# Check duplicate selectors
seen = {}
for sel, body in blocks:
    s = sel.strip()
    if s.startswith('@media'):
        continue
    props = [p.strip() for p in body.split(';') if p.strip()]
    if s not in seen:
        seen[s] = []
    seen[s].append(props)

print(f"Unique selectors in responsive-theme.css: {len(seen)}")
for s, prop_lists in seen.items():
    if len(prop_lists) > 1:
        print(f"  DUPLICATE SELECTOR: {s} (defined {len(prop_lists)} times)")
