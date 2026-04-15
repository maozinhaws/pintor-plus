import sys
import subprocess

with open('/home/engine/project/app.html', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '<script>'
end_marker = '</script>'

# Find the script that starts at line 2431
lines = content.split('\n')
script_content = ""
in_script = False
start_line = 0

for i, line in enumerate(lines):
    if not in_script and '<script>' in line and i + 1 >= 2430:
        in_script = True
        start_line = i + 1
        script_content = line[line.find('<script>') + 8:] + "\n"
    elif in_script:
        if '</script>' in line:
            # Check if it's an escaped <\/script>
            if '<\/script>' in line:
                script_content += line + "\n"
            else:
                script_content += line[:line.find('</script>')]
                break
        else:
            script_content += line + "\n"

with open('/home/engine/project/extracted_script.js', 'w', encoding='utf-8') as f:
    f.write(script_content)

print(f"Extracted script starting at line {start_line}")
result = subprocess.run(['node', '--check', '/home/engine/project/extracted_script.js'], capture_output=True, text=True)
if result.returncode != 0:
    print("Syntax Error:")
    print(result.stderr)
else:
    print("Syntax OK")
