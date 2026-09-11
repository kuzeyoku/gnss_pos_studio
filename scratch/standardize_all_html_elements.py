import glob

replacements = [
    # cadastreTab.html
    ('class="form-input text-xs h-32 px-8 py-4"', 'class="form-input font-mono"'),
    ("class='form-input text-xs h-32 px-8 py-4'", "class='form-input font-mono'"),
    ('class="form-input form-select text-sm h-32"', 'class="form-select"'),
    ("class='form-input form-select text-sm h-32'", "class='form-select'"),

    # converterTab.html
    ('class="form-control form-control-xs text-xs w-190"', 'class="form-input form-input-sm w-190"'),
    ("class='form-control form-control-xs text-xs w-190'", "class='form-input form-input-sm w-190'"),

    # flightTab.html
    ('class="text-xs py-2 px-8 rounded-sm bg-cyan-15 text-cyan font-bold border-cyan"', 'class="badge badge-cyan"'),
    ('class="text-xs py-2 px-8 rounded-sm bg-indigo-20 text-indigo font-bold border-indigo"', 'class="badge badge-purple"'),
    ('class="text-xs py-2 px-8 rounded-sm bg-emerald-20 text-emerald font-bold border-emerald"', 'class="badge badge-emerald"'),

    # geodesyTab.html
    ('class="form-select w-auto py-2 px-8 text-xs"', 'class="form-select form-select-sm w-auto"'),
    ("class='form-select w-auto py-2 px-8 text-xs'", "class='form-select form-select-sm w-auto'"),
    ('class="btn btn-secondary btn-sm m-0 cursor-pointer text-xs py-2 px-8 text-cyan"', 'class="btn btn-secondary btn-sm m-0 cursor-pointer text-cyan"'),

    # rinexTab.html
    ('class="badge text-sm px-12 py-4 font-extrabold"', 'class="badge badge-cyan text-sm font-bold"'),

    # tg20Tab.html
    ('class="btn btn-secondary btn-sm m-0 cursor-pointer text-xs py-4 px-10"', 'class="btn btn-secondary btn-sm m-0 cursor-pointer"'),

    # toolsTab.html
    ('class="form-select form-select-sm w-auto py-2 px-8"', 'class="form-select form-select-sm w-auto"'),
    ('class="btn btn-secondary btn-sm m-0 cursor-pointer text-xs py-2 px-8 text-cyan"', 'class="btn btn-secondary btn-sm m-0 cursor-pointer text-cyan"'),
    ('class="form-select form-select-sm py-1 px-6"', 'class="form-select form-select-sm"'),
]

for filepath in glob.glob('web/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        orig = f.read()
    content = orig
    for old, new in replacements:
        content = content.replace(old, new)
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Standardized elements in: {filepath}")

print("HTML standardization complete.")
