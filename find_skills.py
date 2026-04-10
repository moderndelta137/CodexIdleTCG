filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'SKILL_TREE_DICT' in l:
        if i > 1500:
            print("--- MATCH AT", i)
            for j in range(max(0, i-5), min(len(lines), i+25)):
                print(j+1, lines[j].rstrip())
            break
