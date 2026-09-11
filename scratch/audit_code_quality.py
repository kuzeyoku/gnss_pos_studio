import glob
import re

# 1. Get all classes and IDs used in HTML & JS
all_html_js_content = ""
for f in glob.glob('web/**/*.html', recursive=True) + glob.glob('web/js/**/*.js', recursive=True):
    with open(f, 'r', encoding='utf-8', errors='ignore') as file:
        all_html_js_content += file.read() + "\n"

# 2. Inspect each CSS file
for filename in ['foundation.css', 'layout.css', 'components.css', 'responsive-theme.css']:
    with open(f'web/css/{filename}', 'r', encoding='utf-8') as file:
        css = file.read()

    blocks = re.findall(r'([^{]+)\{([^}]+)\}', css)
    
    dead_selectors = []
    important_count = css.count('!important')
    
    for sel_group, body in blocks:
        sel_clean = sel_group.strip()
        if sel_clean.startswith('@') or 'keyframes' in sel_clean:
            continue
        for sel in sel_clean.split(','):
            s = sel.strip()
            # extract primary class or id
            m = re.search(r'[\.#]([a-zA-Z0-9_-]+)', s)
            if m:
                target = m.group(1)
                # check if target exists in HTML/JS
                if target not in all_html_js_content and not target.startswith('leaflet') and not target.startswith('fa'):
                    dead_selectors.append(s)

    print(f"=== {filename} ===")
    print(f"  Total rule blocks: {len(blocks)}")
    print(f"  '!important' count: {important_count}")
    print(f"  Potential dead/unreferenced selectors: {len(dead_selectors)}")
    if dead_selectors:
        print("  Sample dead selectors:")
        for ds in dead_selectors[:10]:
            print(f"    - {ds}")
