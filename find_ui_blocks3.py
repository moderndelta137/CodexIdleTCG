filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def grep_all(word, context=15):
    for i, l in enumerate(lines):
        if word in l:
            if i < 600: continue # Skip top half
            print(f"--- MATCH {i} ---")
            for j in range(max(0, i-5), min(len(lines), i+context)):
                print(j+1, lines[j].rstrip())
            return

grep_all('pulledCards')
grep_all('SKILL_')
