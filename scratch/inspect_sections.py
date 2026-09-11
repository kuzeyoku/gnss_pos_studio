with open('web/css/components.css', 'r', encoding='utf-8') as f:
    text = f.read()

import re
sections = re.split(r'/\* ==========================================================================\s*\n\s*(\d+\.|\*|CANONICAL)', text)
print(f"Total parts: {len(sections)}")
for i in range(1, len(sections), 2):
    header = sections[i]
    body = sections[i+1] if i+1 < len(sections) else ""
    first_lines = [l.strip() for l in body.split('\n') if l.strip() and not l.strip().startswith('/*')][:3]
    lines_count = len(body.split('\n'))
    print(f"[{header}] lines: {lines_count} | sample: {first_lines}")
