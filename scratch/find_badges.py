import glob
import re

for p in sorted(glob.glob('web/**/*.html', recursive=True)):
    content = open(p, encoding='utf-8').read()
    matches = re.findall(r'class=[\'"][^\'"]*(?:badge|pill|chip)[^\'"]*[\'"]', content)
    if matches:
        print(f'=== {p} ===')
        for m in set(matches):
            print(f'  {m}')
