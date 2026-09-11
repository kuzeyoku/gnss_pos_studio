import glob
import re

html_classes = set()
for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    classes = re.findall(r'class=["\']([^"\']+)["\']', content)
    for c_str in classes:
        for c in c_str.split():
            if c:
                html_classes.add(c)

print(f"Total unique classes used in HTML: {len(html_classes)}")

# Also extract IDs
html_ids = set()
for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    ids = re.findall(r'id=["\']([^"\']+)["\']', content)
    for id_val in ids:
        if id_val:
            html_ids.add(id_val)

print(f"Total unique IDs used in HTML: {len(html_ids)}")

with open('scratch/used_html_classes.txt', 'w', encoding='utf-8') as f:
    for c in sorted(html_classes):
        f.write(c + '\n')
