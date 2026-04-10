filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'Pointer' in l:
        print(i+1, l.rstrip())
