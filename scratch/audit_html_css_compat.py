import glob
import re

# 1. Read all bundled CSS
with open('web/css/core.css', 'r', encoding='utf-8') as f:
    core_css = f.read()

# Extract all class and ID selectors from core.css
css_classes = set(re.findall(r'\.([a-zA-Z0-9_-]+)', core_css))
css_ids = set(re.findall(r'#([a-zA-Z0-9_-]+)', core_css))

# 2. Read all HTML files
html_classes = {}
html_ids = {}

for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Classes
    for m in re.finditer(r'class=["\']([^"\']+)["\']', content):
        for c in m.group(1).split():
            if c not in html_classes:
                html_classes[c] = []
            html_classes[c].append(filepath)

    # IDs
    for m in re.finditer(r'id=["\']([^"\']+)["\']', content):
        val = m.group(1)
        if val not in html_ids:
            html_ids[val] = []
        html_ids[val].append(filepath)

print(f"Total unique classes in HTML: {len(html_classes)}")
print(f"Total unique IDs in HTML: {len(html_ids)}")
print(f"Total CSS classes in core.css: {len(css_classes)}")
print(f"Total CSS IDs in core.css: {len(css_ids)}")

# Filter out third-party/library prefixes (FontAwesome, Leaflet)
ignore_prefixes = ['fa-', 'fa', 'fas', 'far', 'fad', 'leaflet-', 'cm-', 'CodeMirror']

unmatched_classes = {}
for c, files in html_classes.items():
    if any(c == p or c.startswith(p) for p in ignore_prefixes):
        continue
    if c not in css_classes:
        unmatched_classes[c] = files

print(f"\nHTML classes with no direct match in CSS: {len(unmatched_classes)}")
for c, files in sorted(unmatched_classes.items(), key=lambda x: len(x[1]), reverse=True):
    sample_file = files[0].replace('web\\', '')
    print(f"  .{c} (used in {len(files)} places, e.g. {sample_file})")
