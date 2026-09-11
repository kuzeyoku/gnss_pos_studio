with open('web/css/components.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Find all rules that have identical or nearly identical property sets
blocks = re.findall(r'([^{]+)\{([^}]+)\}', text)
print(f"Total CSS rule blocks in components.css: {len(blocks)}")

# Check duplicate selectors
selectors = [b[0].strip() for b in blocks]
from collections import Counter
c = Counter(selectors)
dups = {k: v for k, v in c.items() if v > 1}
print(f"Selectors defined multiple times: {len(dups)}")
for k, v in list(dups.items())[:10]:
    print(f"  [{v}x] {k}")
