import re

replacements = [
    # cadastreTab.html
    ("class='btn btn-primary w-full h-32 text-xs font-bold d-inline-flex items-center justify-center gap-6'", "class='btn btn-primary w-full'"),
    ('class="btn btn-primary w-full h-32 text-xs font-bold d-inline-flex items-center justify-center gap-6"', 'class="btn btn-primary w-full"'),
    ("class='btn btn-secondary btn-sm text-xs py-4 px-10 text-cyan border-cyan font-bold'", "class='btn btn-outline-cyan btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-4 px-10 text-cyan border-cyan font-bold"', 'class="btn btn-outline-cyan btn-sm"'),
    ("class='btn btn-primary btn-sm text-xs py-4 px-10 font-bold'", "class='btn btn-primary btn-sm'"),
    ('class="btn btn-primary btn-sm text-xs py-4 px-10 font-bold"', 'class="btn btn-primary btn-sm"'),

    # flightTab.html
    ("class='btn btn-secondary btn-sm py-6 px-10 text-sm text-nowrap'", "class='btn btn-secondary btn-sm'"),
    ('class="btn btn-secondary btn-sm py-6 px-10 text-sm text-nowrap"', 'class="btn btn-secondary btn-sm"'),
    ("class='btn btn-secondary btn-sm flex-1 text-xs py-6 px-10'", "class='btn btn-secondary btn-sm flex-1'"),
    ('class="btn btn-secondary btn-sm flex-1 text-xs py-6 px-10"', 'class="btn btn-secondary btn-sm flex-1"'),
    ("class='btn btn-secondary btn-sm flex-1 text-xs py-6 px-10 border-cyan text-cyan'", "class='btn btn-outline-cyan btn-sm flex-1'"),
    ('class="btn btn-secondary btn-sm flex-1 text-xs py-6 px-10 border-cyan text-cyan"', 'class="btn btn-outline-cyan btn-sm flex-1"'),
    ("class='btn btn-secondary btn-sm text-xs py-2 px-8 text-emerald border-emerald'", "class='btn btn-outline-emerald btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-2 px-8 text-emerald border-emerald"', 'class="btn btn-outline-emerald btn-sm"'),
    ("class='btn btn-secondary btn-sm text-xs py-2 px-8 text-cyan border-cyan'", "class='btn btn-outline-cyan btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-2 px-8 text-cyan border-cyan"', 'class="btn btn-outline-cyan btn-sm"'),

    # geodesyTab.html
    ("class='btn btn-secondary btn-sm text-xs py-2 px-6'", "class='btn btn-secondary btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-2 px-6"', 'class="btn btn-secondary btn-sm"'),
    ("class='btn btn-primary btn-sm py-4 px-10 text-xs'", "class='btn btn-primary btn-sm'"),
    ('class="btn btn-primary btn-sm py-4 px-10 text-xs"', 'class="btn btn-primary btn-sm"'),
    ("class='btn btn-primary flex-1 py-8 px-12 text-xs font-bold'", "class='btn btn-primary flex-1'"),
    ('class="btn btn-primary flex-1 py-8 px-12 text-xs font-bold"', 'class="btn btn-primary flex-1"'),
    ("class='btn btn-secondary py-8 px-8 text-xs'", "class='btn btn-secondary btn-sm'"),
    ('class="btn btn-secondary py-8 px-8 text-xs"', 'class="btn btn-secondary btn-sm"'),
    ("class='btn btn-secondary btn-sm text-emerald py-8 px-8 text-xs'", "class='btn btn-outline-emerald btn-sm'"),
    ('class="btn btn-secondary btn-sm text-emerald py-8 px-8 text-xs"', 'class="btn btn-outline-emerald btn-sm"'),
    ("class='btn btn-primary py-9 px-14 text-sm font-bold w-100'", "class='btn btn-primary btn-lg w-full'"),
    ('class="btn btn-primary py-9 px-14 text-sm font-bold w-100"', 'class="btn btn-primary btn-lg w-full"'),
    ("class='btn btn-primary btn-sm text-xs py-3 px-8'", "class='btn btn-primary btn-sm'"),
    ('class="btn btn-primary btn-sm text-xs py-3 px-8"', 'class="btn btn-primary btn-sm"'),
    ("class='btn btn-secondary btn-sm text-xs py-3 px-8'", "class='btn btn-secondary btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-3 px-8"', 'class="btn btn-secondary btn-sm"'),
    ("class='btn btn-primary w-full py-8 px-12 text-sm font-bold'", "class='btn btn-primary w-full'"),
    ('class="btn btn-primary w-full py-8 px-12 text-sm font-bold"', 'class="btn btn-primary w-full"'),
    ("class='btn btn-primary w-full py-10 px-14 text-sm font-bold'", "class='btn btn-primary btn-lg w-full'"),
    ('class="btn btn-primary w-full py-10 px-14 text-sm font-bold"', 'class="btn btn-primary btn-lg w-full"'),

    # mapTab.html
    ('class="btn btn-primary m-0 cursor-pointer d-inline-flex items-center gap-6 py-8 px-14 text-sm"', 'class="btn btn-primary m-0 cursor-pointer"'),

    # tg20Tab.html
    ("class='btn btn-primary text-xs py-8 px-18 font-bold'", "class='btn btn-primary'"),
    ('class="btn btn-primary text-xs py-8 px-18 font-bold"', 'class="btn btn-primary"'),
    ("class='btn btn-secondary text-xs py-8 px-12 text-cyan border-cyan'", "class='btn btn-outline-cyan'"),
    ('class="btn btn-secondary text-xs py-8 px-12 text-cyan border-cyan"', 'class="btn btn-outline-cyan"'),
    ("class='btn btn-secondary btn-sm text-xs py-4 px-10'", "class='btn btn-secondary btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-4 px-10"', 'class="btn btn-secondary btn-sm"'),
    ("class='btn btn-primary py-7 px-18 font-bold text-xs'", "class='btn btn-primary'"),
    ('class="btn btn-primary py-7 px-18 font-bold text-xs"', 'class="btn btn-primary"'),
    ("class='btn btn-secondary btn-sm text-xs py-4 px-12'", "class='btn btn-secondary btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-4 px-12"', 'class="btn btn-secondary btn-sm"'),
    ("class='btn btn-primary btn-sm text-xs py-4 px-12 font-bold'", "class='btn btn-primary btn-sm'"),
    ('class="btn btn-primary btn-sm text-xs py-4 px-12 font-bold"', 'class="btn btn-primary btn-sm"'),
    ("class='btn btn-secondary btn-sm text-xs py-4 px-10 text-amber border-amber font-bold'", "class='btn btn-outline-amber btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-4 px-10 text-amber border-amber font-bold"', 'class="btn btn-outline-amber btn-sm"'),

    # toolsTab.html
    ("class='btn btn-primary flex-1 py-9 px-14 text-sm font-bold'", "class='btn btn-primary flex-1'"),
    ('class="btn btn-primary flex-1 py-9 px-14 text-sm font-bold"', 'class="btn btn-primary flex-1"'),
    ("class='btn btn-secondary py-9 px-12 text-xs'", "class='btn btn-secondary btn-sm'"),
    ('class="btn btn-secondary py-9 px-12 text-xs"', 'class="btn btn-secondary btn-sm"'),
    ("class='btn btn-secondary btn-sm text-xs py-2 px-8'", "class='btn btn-secondary btn-sm'"),
    ('class="btn btn-secondary btn-sm text-xs py-2 px-8"', 'class="btn btn-secondary btn-sm"'),
    ("class='btn btn-primary py-9 px-14 text-sm font-bold w-100'", "class='btn btn-primary btn-lg w-full'"),
    ('class="btn btn-primary py-9 px-14 text-sm font-bold w-100"', 'class="btn btn-primary btn-lg w-full"'),
    ("class='btn btn-primary py-8 px-12 text-xs font-bold'", "class='btn btn-primary w-full'"),
    ('class="btn btn-primary py-8 px-12 text-xs font-bold"', 'class="btn btn-primary w-full"'),
]

import glob

changed_count = 0
for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        orig = f.read()
    new_content = orig
    for old, new in replacements:
        new_content = new_content.replace(old, new)
    if new_content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        changed_count += 1
        print(f"Updated: {filepath}")

print(f"Total files updated: {changed_count}")
