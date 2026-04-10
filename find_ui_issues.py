filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'view === \'skills\'' in l:
        print("--- Skills rendering ---")
        for j in range(max(0, i-5), min(len(lines), i+30)):
            print(j+1, lines[j].rstrip())
        break

for i, l in enumerate(lines):
    if 'upgradeAnimId === cardId' in l or 'setUpgradeAnimId' in l:
        print("--- Upgrade Anim ---")
        for j in range(max(0, i-5), min(len(lines), i+15)):
            print(j+1, lines[j].rstrip())
        break

for i, l in enumerate(lines):
    if 'flippedCards' in l or 'pulledCards.map' in l:
        print("--- Pulled Cards ---")
        for j in range(max(0, i-10), min(len(lines), i+40)):
            print(j+1, lines[j].rstrip())
        break
