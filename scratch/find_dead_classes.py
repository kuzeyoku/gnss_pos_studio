import glob
import re

source_text = ''
for ext in ('*.html', '*.js'):
    for p in glob.glob('web/**/' + ext, recursive=True):
        if 'bundle' not in p and 'componentCache' not in p:
            with open(p, encoding='utf-8', errors='ignore') as f:
                source_text += '\n' + f.read()

def check_classes(file_path):
    content = open(file_path, encoding='utf-8').read()
    selectors = re.findall(r'\.([a-zA-Z0-9_\-\\\/]+)(?=[^;{]*\{)', content)
    
    truly_unused = []
    for raw_cls in set(selectors):
        # unescape class name for html/js search
        clean_cls = raw_cls.replace('\\', '')
        # check if it is a number or percentage or duration
        if re.match(r'^\d', clean_cls):
            continue
        # check if it exists in source_text as a class or in string
        if clean_cls not in source_text:
            truly_unused.append(clean_cls)
    return sorted(truly_unused)

for f in ['web/css/foundation.css', 'web/css/layout.css', 'web/css/components.css', 'web/css/responsive-theme.css']:
    unused = check_classes(f)
    print(f'=== {f}: {len(unused)} unreferenced classes ===')
    print(unused)
