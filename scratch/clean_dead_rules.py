import re

# 1. Clean foundation.css
with open('web/css/foundation.css', 'r', encoding='utf-8') as f:
    foundation_text = f.read()

# Dead classes in foundation.css to remove
dead_foundation_classes = [
    r'\.flex-row\s*\{[^}]+\}',
    r'\.justify-end\s*\{[^}]+\}',
    r'\.justify-start\s*\{[^}]+\}',
    r'\.gap-20\s*\{[^}]+\}',
    r'\.h-100\s*\{[^}]+\}',
    r'\.text-right\s*\{[^}]+\}',
    r'\.text-left\s*\{[^}]+\}',
    r'\.mr-auto\s*\{[^}]+\}',
    r'\.h-32\s*\{[^}]+\}',
    r'\.px-8\s*\{[^}]+\}',
    r'\.pulse-dot-cyan\s*\{[^}]+\}',
    r'\.pulse-dot-amber\s*\{[^}]+\}',
    r'\.pulse-dot-rose\s*\{[^}]+\}',
    r'\.px-10\s*\{[^}]+\}',
    r'\.px-18\s*\{[^}]+\}',
    r'\.px-6\s*\{[^}]+\}',
    r'\.py-7\s*\{[^}]+\}',
    r'\.py-8\s*\{[^}]+\}',
    r'\.py-9\s*\{[^}]+\}',
    r'\.d-inline-block\s*\{[^}]+\}',
    r'\.pointer-events-auto\s*\{[^}]+\}',
    r'\.rounded-md\s*\{[^}]+\}',
]

for pat in dead_foundation_classes:
    foundation_text = re.sub(pat, '', foundation_text)

# Also remove duplicate lines in foundation.css
foundation_text = re.sub(r'\.m-0\s*\{\s*margin:\s*0\s*!important;\s*\}\s*', '', foundation_text, count=1) # remove one duplicate
foundation_text = re.sub(r'\.border-r\s*\{[^}]+\}', '', foundation_text)
foundation_text = re.sub(r'\.mb-8\s*\{[^}]+\}', '', foundation_text)

with open('web/css/foundation.css', 'w', encoding='utf-8') as f:
    f.write(foundation_text)

print("foundation.css cleaned!")

# 2. Clean components.css
with open('web/css/components.css', 'r', encoding='utf-8') as f:
    components_text = f.read()

# Dead rules to remove
dead_component_patterns = [
    r'\.card-header-clean\s*\{[^}]+\}',
    r'\.badge-lg\s*\{[^}]+\}',
    r'/\*\s*Success / Emerald Button\s*\*/\s*\.btn-success,\s*\.btn-emerald\s*\{[^}]+\}',
    r'\.btn-success:hover,\s*\.btn-emerald:hover\s*\{[^}]+\}',
    r'\.btn-emerald\s*\{[^}]+\}',
    r'\.btn-emerald:hover\s*\{[^}]+\}',
    r'\.btn-outline-purple\s*\{[^}]+\}',
    r'\.btn-outline-purple:hover\s*\{[^}]+\}',
    r'\.btn-outline-rose\s*\{[^}]+\}',
    r'\.btn-outline-rose:hover\s*\{[^}]+\}',
    r'\.dropzone-subtitle\s*\{[^}]+\}',
    r'\.modal-card,\s*\.modal-box\s*\{[^}]+\}',
    r'\.modal-header\s*\{[^}]+\}',
    r'\.modal-title\s*\{[^}]+\}',
    r'\.modal-body\s*\{[^}]+\}',
    r'\.modal-footer\s*\{[^}]+\}',
    r'\.map-status-hud\s*\{[^}]+\}',
    r'\.alert-cyan-banner\s*\{[^}]+\}',
    r'\.divider-h-glass\s*\{[^}]+\}',
    r'\.switch-slider:before\s*\{[^}]+\}',
    r'\.switch-slider\s*\{[^}]+\}',
]

for pat in dead_component_patterns:
    components_text = re.sub(pat, '', components_text)

# Deduplicate repeating selectors in components.css
# Check for duplicate bento cards, alert amber banner, etc.
# The second block was around lines 1461+ or within components
# Let's clean identical duplicate blocks
duplicate_exact_blocks = [
    r'\.kpi-card\.border-emerald\s*\{[^}]+\}\s*(?=\.kpi-card\.border-emerald)',
    r'\.kpi-card\.border-amber\s*\{[^}]+\}\s*(?=\.kpi-card\.border-amber)',
]

for pat in duplicate_exact_blocks:
    components_text = re.sub(pat, '', components_text)

with open('web/css/components.css', 'w', encoding='utf-8') as f:
    f.write(components_text)

print("components.css cleaned!")
