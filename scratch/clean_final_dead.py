import re

# 1. Clean responsive-theme.css
with open('web/css/responsive-theme.css', 'r', encoding='utf-8') as f:
    resp = f.read()

resp = resp.replace('  .geodesy-coords-grid,\n', '')
resp = re.sub(r'\s*\.map-status-hud\s*\{[^}]+\}', '', resp)
resp = re.sub(r'\s*\.header-brand-title\s*\{[^}]+\}', '', resp)

with open('web/css/responsive-theme.css', 'w', encoding='utf-8') as f:
    f.write(resp)

# 2. Clean foundation.css (mt-3, pulse-dot, pulse-dot-emerald)
with open('web/css/foundation.css', 'r', encoding='utf-8') as f:
    found = f.read()

found = re.sub(r'\.mt-3,\s*', '', found)
found = re.sub(r'\.pulse-dot,\s*', '', found)
found = re.sub(r'\.pulse-dot-emerald,\s*\.pulse-dot\.online\s*\{[^}]+\}', '', found)

with open('web/css/foundation.css', 'w', encoding='utf-8') as f:
    f.write(found)

# 3. Clean components.css (dead legacy classes)
with open('web/css/components.css', 'r', encoding='utf-8') as f:
    comp = f.read()

dead_comp_pats = [
    r'/\*\s*Badge Sizes\s*\*/\s*\.badge-sm\s*\{[^}]+\}',
    r'\.badge-xs\s*\{[^}]+\}',
    r'\.chip-interactive:hover\s*\{[^}]+\}',
    r'\.chip-interactive\.active\s*\{[^}]+\}',
    r'\.chip-interactive\s*\{[^}]+\}',
    r'\.card-interactive:hover\s*\{[^}]+\}',
    r'\.card-interactive\s*\{[^}]+\}',
    r'\.glass-panel\s*\{[^}]+\}',
    r'\.form-control-xs\s*\{[^}]+\}',
    r'\.form-control:hover\s*\{[^}]+\}',
    r'\.form-control:focus\s*\{[^}]+\}',
    r'\.form-control\s*\{[^}]+\}',
    r'\.form-range[^{]*\{[^}]+\}',
    r'\.form-textarea[^{]*\{[^}]+\}',
    r'\.studio-table[^{]*\{[^}]+\}',
    r'\.table-sm[^{]*\{[^}]+\}',
]

for pat in dead_comp_pats:
    comp = re.sub(pat, '', comp)

with open('web/css/components.css', 'w', encoding='utf-8') as f:
    f.write(comp)

print("Final dead classes cleaned from all CSS files!")
