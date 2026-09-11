import glob
import re
from collections import Counter

card_classes = Counter()

for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    classes = re.findall(r'class=["\']([^"\']+)["\']', content)
    for c_str in classes:
        for c in c_str.split():
            if any(k in c for k in ['card', 'panel', 'box', 'wrap', 'container', 'hud']):
                card_classes[c] += 1

print("=== CONTAINER / CARD / PANEL CLASSES IN HTML ===")
for c, count in card_classes.most_common():
    print(f"  [{count}x] {c}")
