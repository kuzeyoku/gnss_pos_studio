import re
import glob

with open('web/css_old/components.css', 'r', encoding='utf-8') as f:
    old_css = f.read()

with open('web/css/core.css', 'r', encoding='utf-8') as f:
    core_css = f.read()

css_classes = set(re.findall(r'\.([a-zA-Z0-9_-]+)', core_css))

html_classes = set()
for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for m in re.finditer(r'class=["\']([^"\']+)["\']', content):
        for c in m.group(1).split():
            html_classes.add(c)

ignore = ['fa-', 'fa', 'fas', 'far', 'fad', 'leaflet-', 'cm-', 'CodeMirror']
needed = [c for c in html_classes if not any(c == p or c.startswith(p) for p in ignore) and c not in css_classes]

print(f"Total needed HTML classes missing from core.css: {len(needed)}")

# Extract blocks from old_css
blocks = re.findall(r'([^{]+)\{([^}]+)\}', old_css)
found_rules = []
found_classes = set()

for sel, body in blocks:
    sel_clean = sel.strip()
    # Check if any needed class is in sel
    matches = [c for c in needed if f".{c}" in sel_clean]
    if matches:
        found_rules.append((sel_clean, body.strip()))
        for m in matches:
            found_classes.add(m)

print(f"Found {len(found_rules)} rules in old_css covering {len(found_classes)} classes.")

# Save recovered rules to a file
with open('scratch/recovered_rules.css', 'w', encoding='utf-8') as f:
    for sel, body in found_rules:
        # Compact single line formatting
        body_clean = ' '.join(body.split())
        f.write(f"{sel} {{ {body_clean} }}\n")

print("Saved recovered rules to scratch/recovered_rules.css")

still_missing = set(needed) - found_classes
print(f"Classes still missing (likely utilities or tailwind-like): {len(still_missing)}")
print(" ", sorted(list(still_missing)))
