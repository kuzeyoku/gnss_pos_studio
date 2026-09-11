with open('scratch/all_classes.txt', 'r', encoding='utf-8') as f:
    active_classes = set(line.strip() for line in f if line.strip())

with open('web/css/components.css', 'r', encoding='utf-8') as f:
    comp_css = f.read()

import re
css_classes = set(re.findall(r'\.([a-zA-Z0-9_-]+)', comp_css))

print(f"Total active HTML/JS classes: {len(active_classes)}")
print(f"Total classes in components.css: {len(css_classes)}")
matched = active_classes.intersection(css_classes)
print(f"Active classes defined in components.css: {len(matched)}")
unmatched_active = active_classes - css_classes
print(f"Active classes NOT in components.css (likely in layout/foundation or utilities): {len(unmatched_active)}")
