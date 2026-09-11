import glob
import re

for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for m in re.finditer(r'<[a-z0-9]+\b[^>]*class=["\']([^"\']*(?:h-32|px-8|py-4|py-2|py-1|form-control)[^"\']*)["\'][^>]*>', content, re.IGNORECASE):
        print(f"{filepath}: {m.group(0)[:90]}")
