filepath = r'd:\Projects\GeminiIdleTCG\codex-idle\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def grep_print(word, start_offset=0, end_offset=20):
    for i, l in enumerate(lines):
        if word in l:
            print(f"--- {word} ---")
            for j in range(max(0, i-start_offset), min(len(lines), i+end_offset)):
                print(j+1, lines[j].rstrip())
            break

grep_print('Object.entries(SKILL_TREE)')
grep_print('pulledCards', 5, 25)
