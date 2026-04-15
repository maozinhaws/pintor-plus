import sys

file_path = '/home/engine/project/app.html'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
stack = []

for i, line in enumerate(lines):
    line_num = i + 1
    if line_num < 2431: continue
    if line_num > 6753: break
    
    for col, char in enumerate(line):
        if char == '{':
            balance += 1
            stack.append(('{', line_num, col))
        elif char == '}':
            balance -= 1
            if stack: stack.pop()
            else: print(f"Extra closing brace at {line_num}:{col}")

print(f"Final balance: {balance}")
if stack:
    print("Unclosed braces:")
    for s in stack:
        print(f"  {s[0]} at line {s[1]}, col {s[2]}")
