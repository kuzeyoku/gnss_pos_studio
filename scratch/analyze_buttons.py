import glob
import re

print("=== BUTTONS WITH AD-HOC UTILITIES ===")
for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    btns = re.finditer(r'<button\b([^>]*)>', content, re.IGNORECASE)
    for m in btns:
        attrs = m.group(1)
        cls = re.search(r'class=["\']([^"\']+)["\']', attrs)
        cls_val = cls.group(1) if cls else ''
        id_m = re.search(r'id=["\']([^"\']+)["\']', attrs)
        id_val = id_m.group(1) if id_m else ''
        if any(x in cls_val for x in ['py-', 'px-', 'h-32', 'font-bold']):
            print(f"{filepath} [#{id_val}]: class='{cls_val}'")
