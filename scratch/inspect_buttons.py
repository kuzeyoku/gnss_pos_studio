import glob
import re

button_elements = []
classes = set()

for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    btns = re.finditer(r'<button\b([^>]*)>', content, re.IGNORECASE)
    for m in btns:
        attrs = m.group(1)
        cls_m = re.search(r'class=["\']([^"\']+)["\']', attrs)
        id_m = re.search(r'id=["\']([^"\']+)["\']', attrs)
        cls = cls_m.group(1) if cls_m else ''
        id_val = id_m.group(1) if id_m else ''
        button_elements.append({'file': filepath, 'id': id_val, 'class': cls})
        for c in cls.split():
            classes.add(c)

print(f"Total buttons found across web/**/*.html: {len(button_elements)}")
btn_classes = [c for c in classes if 'btn' in c]
print(f"Button classes ({len(btn_classes)}): {sorted(btn_classes)}")
non_standard = [b for b in button_elements if not any('btn' in c for c in b['class'].split())]
print(f"Buttons without any btn class ({len(non_standard)}):")
for b in non_standard:
    print('  ', b['file'], 'id=' + b['id'], 'class=' + b['class'])

print("\n--- Button class combinations ---")
from collections import Counter
class_combos = Counter(b['class'] for b in button_elements)
for combo, count in class_combos.most_common():
    print(f"  [{count}x] '{combo}'")
