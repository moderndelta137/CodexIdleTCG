filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "(!run.activeEvent || isCombatNode)" in content:
    print("[OK] activeEffects is wrapped.")
else:
    print("[FAIL] activeEffects is not wrapped.")
