filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if 'levelBanner' in content:
    print("[SUCCESS] levelBanner was found in App.jsx.")
else:
    print("[FAIL] levelBanner is missing from App.jsx.")

if 'showOptions' in content:
    print("[SUCCESS] showOptions was found in App.jsx.")
else:
    print("[FAIL] showOptions is missing from App.jsx.")

if 'Pointer size={48} fill="currentColor"' in content:
    print("[SUCCESS] New Pointer layout was found in App.jsx.")
else:
    print("[FAIL] New Pointer layout is missing from App.jsx.")
