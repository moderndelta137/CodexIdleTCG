filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def print_context(query, size=15):
    for i, l in enumerate(lines):
        if query in l:
            print(f"--- {query} ---")
            for j in range(max(0, i-5), min(len(lines), i+size)):
                print(j+1, lines[j].rstrip())
            return

print_context('upgradeAnimId ===')
print_context('Object.entries(SKILL_TREE)')
print_context('pulledCards.map')
print_context('btnBase =')
