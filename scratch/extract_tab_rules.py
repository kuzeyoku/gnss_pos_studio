with open('web/css/components.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Split by sections 13 to 22
sections_start = text.find('/* ==========================================================================\n   13. HOME TAB')
tab_css = text[sections_start:]

# Find all selectors in tab sections
selectors = re.findall(r'([^{]+)\{', tab_css)
print(f"Total rule blocks in tabs 13-22: {len(selectors)}")
with open('scratch/tab_selectors.txt', 'w', encoding='utf-8') as f:
    for s in selectors:
        f.write(s.strip() + '\n')

print("Saved tab selectors to scratch/tab_selectors.txt")
