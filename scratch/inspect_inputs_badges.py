import glob
import re
from collections import Counter

inputs = []
badges = []
cards = []

for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Inputs & selects & textareas
    for tag in ['input', 'select', 'textarea']:
        for m in re.finditer(rf'<{tag}\b([^>]*)>', content, re.IGNORECASE):
            attrs = m.group(1)
            cls_m = re.search(r'class=["\']([^"\']+)["\']', attrs)
            id_m = re.search(r'id=["\']([^"\']+)["\']', attrs)
            type_m = re.search(r'type=["\']([^"\']+)["\']', attrs)
            t_type = type_m.group(1) if type_m else ('select' if tag == 'select' else ('textarea' if tag == 'textarea' else 'text'))
            if t_type in ['file', 'checkbox', 'radio', 'hidden']:
                continue
            inputs.append({
                'tag': tag,
                'file': filepath,
                'id': id_m.group(1) if id_m else '',
                'class': cls_m.group(1) if cls_m else '',
                'type': t_type
            })

    # Badges, chips, pills
    for m in re.finditer(r'<([a-z0-9]+)\b([^>]*class=["\'][^"\']*(?:badge|chip|pill|tag)[^"\']*["\'][^>]*)>', content, re.IGNORECASE):
        tag = m.group(1)
        attrs = m.group(2)
        cls_m = re.search(r'class=["\']([^"\']+)["\']', attrs)
        id_m = re.search(r'id=["\']([^"\']+)["\']', attrs)
        badges.append({
            'tag': tag,
            'file': filepath,
            'id': id_m.group(1) if id_m else '',
            'class': cls_m.group(1) if cls_m else ''
        })

print(f"Total text/number/select inputs: {len(inputs)}")
input_combos = Counter(i['class'] for i in inputs)
for combo, cnt in input_combos.most_common():
    print(f"  [{cnt}x] '{combo}'")

non_standard_inputs = [i for i in inputs if 'form-input' not in i['class'] and 'form-select' not in i['class']]
print(f"\nNon-standard inputs without form-input/select: {len(non_standard_inputs)}")
for n in non_standard_inputs[:15]:
    print("  ", n)

print(f"\nTotal badges/chips/pills: {len(badges)}")
badge_combos = Counter(b['class'] for b in badges)
for combo, cnt in badge_combos.most_common():
    print(f"  [{cnt}x] '{combo}'")
