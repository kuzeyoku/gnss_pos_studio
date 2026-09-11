import re

with open('web/css/layout.css', 'r', encoding='utf-8') as f:
    desktop_css = f.read()

with open('web/css/components.css', 'r', encoding='utf-8') as f:
    desktop_css += "\n" + f.read()

with open('web/css/responsive-theme.css', 'r', encoding='utf-8') as f:
    resp_css = f.read()

# Parse desktop declarations: selector -> {prop: val}
desktop_rules = {}
for match in re.finditer(r'([^{]+)\{([^}]+)\}', desktop_css):
    sel_group = match.group(1).strip()
    body = match.group(2).strip()
    props = {}
    for item in body.split(';'):
        if ':' in item:
            k, v = item.split(':', 1)
            props[k.strip().lower()] = v.strip().replace('!important', '').strip()
    for s in sel_group.split(','):
        s_clean = s.strip()
        if s_clean not in desktop_rules:
            desktop_rules[s_clean] = {}
        desktop_rules[s_clean].update(props)

# Parse responsive rules
redundant_count = 0
total_resp_props = 0
redundant_details = []

for match in re.finditer(r'([^{]+)\{([^}]+)\}', resp_css):
    sel_group = match.group(1).strip()
    if '@media' in sel_group:
        continue
    body = match.group(2).strip()
    for item in body.split(';'):
        if ':' in item:
            total_resp_props += 1
            k, v = item.split(':', 1)
            k_clean = k.strip().lower()
            v_clean = v.strip().replace('!important', '').strip()
            
            # Check if any selector in sel_group already has this identical prop and val on desktop
            for s in sel_group.split(','):
                s_clean = s.strip()
                if s_clean in desktop_rules:
                    if desktop_rules[s_clean].get(k_clean) == v_clean:
                        redundant_count += 1
                        redundant_details.append((s_clean, k_clean, v_clean))
                        break

print(f"Total responsive properties: {total_resp_props}")
print(f"Identical redundant properties (already defined on desktop): {redundant_count}")
print("\nSample redundant properties:")
for s, k, v in redundant_details[:20]:
    print(f"  {s} -> {k}: {v}")
