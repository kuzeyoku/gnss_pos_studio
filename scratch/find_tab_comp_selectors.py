with open('scratch/tab_selectors.txt', 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f if l.strip()]

print("=== BUTTON / INPUT / BADGE / CARD SELECTORS IN TAB SECTIONS ===")
for l in lines:
    if any(k in l.lower() for k in ['btn', 'button', 'input', 'select', 'badge', 'chip', 'pill', 'card', 'panel', 'textarea']):
        print(" ", l)
