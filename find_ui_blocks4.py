filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'const renderGacha' in l:
        print("--- GACHA ---")
        for j in range(i, i+90):
            print(j+1, lines[j].rstrip())
        break

for i, l in enumerate(lines):
    if 'Object.entries(SKILL_TREE_DICT).map' in l or 'Object.values(SKILL_TREE_DICT).map' in l:
        print("--- SKILLS ---")
        for j in range(i, i+40):
            print(j+1, lines[j].rstrip())
        break
