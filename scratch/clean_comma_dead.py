with open('web/css/components.css', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('.badge-sm, .text-3xs', '.text-3xs')
text = text.replace('.badge-xs, .text-2xs', '.text-2xs')
text = text.replace('.glass-panel,\n', '')
text = text.replace('.card-interactive:hover,\n', '')
text = text.replace('.card-interactive,\n', '')
text = text.replace('.form-control,\n', '')
text = text.replace('.form-control:hover,\n', '')
text = text.replace('.form-control:focus,\n', '')

with open('web/css/components.css', 'w', encoding='utf-8') as f:
    f.write(text)

print("Remaining 5 comma-separated dead selectors cleaned!")
