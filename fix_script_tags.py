import sys

file_path = '/home/engine/project/app.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace premature script termination
# The issue is that browsers might see </script> even if escaped with a backslash
# and terminate the current script tag.
# We replace it with '\x3C/script>' which is safer.

content = content.replace('<\/script>', r'\x3C/script>')
content = content.replace('</script>', r'\x3C/script>') # This might be dangerous if not careful
# Wait, I only want to replace it where it's INSIDE a script tag.
# But since I know it's only at two places inside strings, I'll be specific.

# Revert my dangerous change
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<script>window.onload = () => setTimeout(() => window.print(), 500);<\/script>', 
                          '<script>window.onload = () => setTimeout(() => window.print(), 500);\\x3C/script>')

content = content.replace('.replace(/<script[\\s\\S]*?<\\/script>/gi, \'\')',
                          '.replace(/<script[\\s\\S]*?<\\/script>/gi, \'\')') # Already safe?

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
