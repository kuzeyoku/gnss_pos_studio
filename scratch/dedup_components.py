import re

with open('web/css/components.css', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove broken syntax remnant in Section 10
text = re.sub(r'\.switch-glass\s*input:checked\s*\+\s*\n\s*\.switch-glass\s*input:checked\s*\+\s*\n', '', text)

# 2. Remove duplicate alert-amber-banner block in Section 10
text = re.sub(r'\.alert-amber-banner,\s*\n\s*\.alert-amber-banner\s*\{[^}]+\}\s*', '', text)

# 3. Remove early duplicate Pafta block (lines 770-802)
early_pafta_block = r'/\*\s*Floating Pafta & Intersect Widgets\s*\*/\s*\.floating-pafta-widget,\s*#cardActivePafta,\s*\.floating-intersect-widget,\s*#cardIntersectingPaftas\s*\{[^}]+\}\s*\.floating-pafta-widget,\s*#cardActivePafta\s*\{[^}]+\}\s*\.floating-intersect-widget,\s*#cardIntersectingPaftas\s*\{[^}]+\}\s*\.pafta-toolbar\s*\{[^}]+\}\s*\.pafta-toolbar-title\s*\{[^}]+\}\s*\.pafta-search-field\s*\{[^}]+\}\s*\.pafta-search-icon\s*\{[^}]+\}\s*\.pafta-search-input\s*\{[^}]+\}\s*'
text = re.sub(early_pafta_block, '', text)

# 4. Remove duplicate Bento card rules in Section 13 (keep .home-bento-grid)
bento_dup_rules = r'\.bento-card\s*\{[^}]+\}\s*\.bento-card:hover\s*\{[^}]+\}\s*(?=\.flight-summary-wrap)'
text = re.sub(bento_dup_rules, '', text)

bento_dup_rules_2 = r'\.bento-title\s*\{[^}]+\}\s*\.bento-desc\s*\{[^}]+\}\s*\.bento-features\s*\{[^}]+\}\s*\.bento-features\s*span\s*\{[^}]+\}\s*\.bento-features\s*i\s*\{[^}]+\}\s*\.bento-footer\s*\{[^}]+\}\s*\.bento-action-link\s*\{[^}]+\}\s*\.bento-action-link:hover\s*\{[^}]+\}\s*'
text = re.sub(bento_dup_rules_2, '', text)

# 5. Deduplicate .hero-pill-dot
text = re.sub(r'\.hero-pill-dot\s*\{[^}]+\}\s*(?=\.hero-pill-dot)', '', text)

# 6. Deduplicate .subtabs-bar in Section 14 (Line 946)
text = re.sub(r'\.subtabs-bar\s*\{\s*display:\s*flex;\s*gap:\s*8px;\s*margin-bottom:\s*12px;\s*border-bottom:\s*1px\s*solid\s*var\(--border-glass\);\s*padding-bottom:\s*8px;\s*flex-wrap:\s*wrap;\s*align-items:\s*center;\s*\}\s*', '', text)

# 7. Deduplicate .table-scroll-520 in Section 14
text = re.sub(r'\.table-scroll-520\s*\{\s*max-height:\s*520px;\s*min-height:\s*220px;\s*overflow-y:\s*auto;\s*\}\s*(?=\.config-panel)', '', text)

with open('web/css/components.css', 'w', encoding='utf-8') as f:
    f.write(text)

print("Duplicates cleaned from components.css!")
