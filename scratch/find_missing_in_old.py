with open('web/css_old/components.css', 'r', encoding='utf-8') as f:
    old_css = f.read()

from scratch.audit_html_css_compat import unmatched_classes

import re

found_in_old = {}
for c in unmatched_classes:
    pattern = rf'([^{{]*\b{re.escape(c)}\b[^{{]*\{{[^}}]+\}})'
    matches = re.findall(pattern, old_css)
    if matches:
        found_in_old[c] = matches

print(f"Total unmatched classes found in old components.css: {len(found_in_old)} / {len(unmatched_classes)}")
for c, rules in sorted(found_in_old.items()):
    print(f"\n/* --- .{c} --- */")
    print(rules[0].strip()[:180])
