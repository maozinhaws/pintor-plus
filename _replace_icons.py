import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('index.html', encoding='utf-8') as f:
    content = f.read()

# -- 1. Protect Flash data-srcdoc content
PLACEHOLDER = '\x00FLASH_SRCDOC\x00'
start = content.find('data-srcdoc="')
val_start = start + len('data-srcdoc="')
val_end = val_start
while val_end < len(content):
    if content[val_end] == '"':
        after = content[val_end+1:val_end+3]
        if after.startswith('>') or after.startswith('\n') or after.startswith(' '):
            break
    val_end += 1
FLASH = content[val_start:val_end]
content = content[:val_start] + PLACEHOLDER + content[val_end:]

# -- 2. CSS .ico class
ICO_CSS = '.ico{display:inline-block;width:1em;height:1em;vertical-align:-0.125em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none;flex-shrink:0;overflow:visible;}'

# -- 3. SVG symbol definitions
SVG_DEFS = (
'<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n'
'<symbol id="ico-home" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></symbol>\n'
'<symbol id="ico-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></symbol>\n'
'<symbol id="ico-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></symbol>\n'
'<symbol id="ico-menu" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></symbol>\n'
'<symbol id="ico-x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></symbol>\n'
'<symbol id="ico-check" viewBox="0 0 24 24"><polyline points="5 12 10 17 20 7"/></symbol>\n'
'<symbol id="ico-check-circle" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></symbol>\n'
'<symbol id="ico-x-circle" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></symbol>\n'
'<symbol id="ico-alert" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></symbol>\n'
'<symbol id="ico-cloud" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></symbol>\n'
'<symbol id="ico-save" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></symbol>\n'
'<symbol id="ico-trash" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></symbol>\n'
'<symbol id="ico-calendar" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></symbol>\n'
'<symbol id="ico-bell" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></symbol>\n'
'<symbol id="ico-camera" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></symbol>\n'
'<symbol id="ico-edit" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></symbol>\n'
'<symbol id="ico-clipboard" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></symbol>\n'
'<symbol id="ico-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></symbol>\n'
'<symbol id="ico-smartphone" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></symbol>\n'
'<symbol id="ico-link" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></symbol>\n'
'<symbol id="ico-refresh" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></symbol>\n'
'<symbol id="ico-pin" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></symbol>\n'
'<symbol id="ico-zap" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>\n'
'<symbol id="ico-ruler" viewBox="0 0 24 24"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4z"/><line x1="7.5" y1="10.5" x2="14" y2="4"/><line x1="10.5" y1="13.5" x2="17" y2="7"/></symbol>\n'
'<symbol id="ico-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></symbol>\n'
'<symbol id="ico-lock" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></symbol>\n'
'<symbol id="ico-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>\n'
'<symbol id="ico-banknote" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></symbol>\n'
'<symbol id="ico-mail" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></symbol>\n'
'<symbol id="ico-newspaper" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5"/><rect x="10" y="6" width="8" height="4"/></symbol>\n'
'<symbol id="ico-wifi-off" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></symbol>\n'
'<symbol id="ico-ban" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></symbol>\n'
'<symbol id="ico-message" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol>\n'
'<symbol id="ico-building" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></symbol>\n'
'<symbol id="ico-truck" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></symbol>\n'
'<symbol id="ico-hard-hat" viewBox="0 0 24 24"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a8 8 0 0 1 16 0v3"/></symbol>\n'
'<symbol id="ico-users" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>\n'
'<symbol id="ico-printer" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></symbol>\n'
'<symbol id="ico-image" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></symbol>\n'
'<symbol id="ico-send" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></symbol>\n'
'<symbol id="ico-loader" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></symbol>\n'
'<symbol id="ico-file" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></symbol>\n'
'<symbol id="ico-book" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></symbol>\n'
'<symbol id="ico-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></symbol>\n'
'</svg>'
)

# -- 4. JS helper + updated toast()
ICO_HELPER = 'function _ico(n){return \'<svg class="ico" aria-hidden="true"><use href="#ico-\'+n+\'"/></svg>\';}'
OLD_TOAST = "function toast(msg){ const el=document.getElementById('toast');if(!el)return; el.textContent=msg; el.classList.add('on'); clearTimeout(_tt); _tt=setTimeout(()=>el.classList.remove('on'), 2600); }"
NEW_TOAST = ICO_HELPER + "\nfunction toast(msg){ const el=document.getElementById('toast');if(!el)return; el.innerHTML=msg; el.classList.add('on'); clearTimeout(_tt); _tt=setTimeout(()=>el.classList.remove('on'), 2600); }"

# -- 5. Apply structural changes
content = content.replace('<body>', '<body>\n' + SVG_DEFS + '\n', 1)
content = content.replace('#toast {', ICO_CSS + '\n#toast {', 1)
content = content.replace(OLD_TOAST, NEW_TOAST, 1)

# -- 6. Emoji replacements
def ico(name):
    return f'<svg class="ico" aria-hidden="true"><use href="#ico-{name}"/></svg>'

REPLACEMENTS = [
    # Emoji sequences first (with variation selector \uFE0F)
    ('\u2600\uFE0F', ico('sun')),   ('\u2600', ico('sun')),
    ('\U0001F319', ico('moon')),
    ('\u2705', ico('check-circle')),
    ('\u274C', ico('x-circle')),
    ('\u26A0\uFE0F', ico('alert')), ('\u26A0', ico('alert')),
    ('\u2601\uFE0F', ico('cloud')), ('\u2601', ico('cloud')),
    ('\U0001F5D1\uFE0F', ico('trash')), ('\U0001F5D1', ico('trash')),
    ('\u270F\uFE0F', ico('edit')),  ('\u270F', ico('edit')),
    ('\u2699\uFE0F', ico('settings')), ('\u2699', ico('settings')),
    ('\U0001F6E1\uFE0F', ico('shield')), ('\U0001F6E1', ico('shield')),
    ('\U0001F3D7\uFE0F', ico('hard-hat')), ('\U0001F3D7', ico('hard-hat')),
    ('\U0001F5A8\uFE0F', ico('printer')), ('\U0001F5A8', ico('printer')),
    ('\U0001F5BC\uFE0F', ico('image')),  ('\U0001F5BC', ico('image')),
    ('\u2709\uFE0F', ico('mail')),  ('\u2709', ico('mail')),
    ('\U0001F4F5', ico('wifi-off')),
    ('\U0001F4BE', ico('save')),
    ('\U0001F4C5', ico('calendar')),
    ('\U0001F514', ico('bell')),
    ('\U0001F4F7', ico('camera')), ('\U0001F4F8', ico('camera')),
    ('\U0001F4CB', ico('clipboard')),
    ('\U0001F4F1', ico('smartphone')),
    ('\U0001F4F2', ico('send')),
    ('\U0001F517', ico('link')),
    ('\U0001F504', ico('refresh')),
    ('\U0001F4CD', ico('pin')),
    ('\u26A1', ico('zap')),
    ('\U0001F4D0', ico('ruler')),
    ('\U0001F6AA', ico('logout')),
    ('\U0001F512', ico('lock')),
    ('\U0001F4B0', ico('banknote')),
    ('\U0001F4E7', ico('mail')),
    ('\U0001F4F0', ico('newspaper')),
    ('\U0001F6AB', ico('ban')),
    ('\U0001F4AC', ico('message')),
    ('\U0001F3E2', ico('building')),
    ('\U0001F69A', ico('truck')),
    ('\U0001F465', ico('users')),
    ('\u231B', ico('loader')),
    ('\U0001F4C4', ico('file')),
    ('\U0001F4D6', ico('book')),
    ('\u2753', ico('help')),
    ('\u2630', ico('menu')),
    ('\u2715', ico('x')),
    ('\u2713', ico('check')),
    ('\U0001F3E0', ico('home')),
    ('\U0001F44B', ''),  # wave — remove
]

for emoji_char, replacement in REPLACEMENTS:
    content = content.replace(emoji_char, replacement)

# -- 7. Restore Flash srcdoc
content = content.replace(PLACEHOLDER, FLASH)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# -- 8. Verify
with open('index.html', encoding='utf-8') as f:
    final = f.read()

srcdoc_start2 = final.find('data-srcdoc="') + len('data-srcdoc="')
srcdoc_end2 = srcdoc_start2
while srcdoc_end2 < len(final):
    if final[srcdoc_end2] == '"':
        after = final[srcdoc_end2+1:srcdoc_end2+3]
        if after.startswith('>') or after.startswith('\n') or after.startswith(' '):
            break
    srcdoc_end2 += 1
outside = final[:srcdoc_start2] + final[srcdoc_end2:]

emoji_pat = re.compile(r'[\U0001F300-\U0001F9FF\u2600-\u26FF\u2700-\u27BF\u231A-\u231B\u23E9-\u23F3\u25AA-\u25FE]+')
remaining = emoji_pat.findall(outside)
from collections import Counter
counts = Counter(remaining)
if counts:
    print('Emojis restantes fora do srcdoc:')
    for e, n in sorted(counts.items(), key=lambda x: -x[1]):
        print(f'  {repr(e)}  {n}x')
else:
    print('OK - nenhum emoji restante fora do Flash iframe')

print(f'Tamanho final: {len(final)} chars')
print(f'Simbolos SVG inseridos: {final.count("id=\"ico-")}')
print(f'Usos de <use href: {final.count("<use href")}')
