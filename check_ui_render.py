filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- activeEffects ---")
for i, l in enumerate(lines):
    if 'Render Card Effects Overlay' in l:
        for j in range(max(0, i-2), i+15):
             print(j+1, lines[j].rstrip())
        break

print("\n--- UX Pointers (Deck) ---")
for i, l in enumerate(lines):
    if '{run.hand.length === 0 || ' in l:
        for j in range(max(0, i-2), i+8):
             print(j+1, lines[j].rstrip())
        break

print("\n--- UX Pointers (Discard) ---")
for i, l in enumerate(lines):
    if '{run.hand.length >= meta.maxHand' in l:
        for j in range(max(0, i-2), i+8):
             print(j+1, lines[j].rstrip())
        break

print("\n--- Event Node Rendering ---")
for i, l in enumerate(lines):
    if '!isCombatNode && !!run.activeEvent' in l:
        for j in range(max(0, i-5), i+20):
             print(j+1, lines[j].rstrip())
        break
