
import sys

with open('/home/engine/project/app.html', 'r') as f:
    lines = f.readlines()

# 1. Fix Syntax Error: Remove stray } on line 3809 (0-indexed 3808)
if lines[3808].strip() == '}':
    print("Removing stray } at line 3809")
    del lines[3808]

# 2. Fix Login Loop & prompt: 'select_account'
for i in range(len(lines)):
    if "error_callback: (err) => {" in lines[i]:
        print(f"Updating error_callback at line {i+1}")
        lines.insert(i+2, """          const now = Date.now();
          const lastRedirect = parseInt(sessionStorage.getItem('pp-last-auth-redirect') || '0');
          if (now - lastRedirect < 5000) {
            console.error('[PP-AUTH] Loop de redirecionamento detectado. Abortando.');
            self._setStatus('err', 'Erro de autenticação (Loop)');
            return;
          }
""")
        break

for i in range(len(lines)):
    if "self._authViaRedirect();" in lines[i] and i > 4000: # Make sure it's inside error_callback
        print(f"Adding redirect marker at line {i+1}")
        lines.insert(i, "            sessionStorage.setItem('pp-last-auth-redirect', now.toString());\n")
        break

for i in range(len(lines)):
    if "signIn() {" in lines[i]:
        for j in range(i, i+10):
            if "prompt: ''" in lines[j]:
                print(f"Updating signIn prompt at line {j+1}")
                lines[j] = lines[j].replace("prompt: ''", "prompt: 'select_account'")
                break
        break

# 3. Add tsEdit to saveEditClient
for i in range(len(lines)):
    if "function saveEditClient() {" in lines[i]:
        for j in range(i, i+10):
            if "cpf:" in lines[j]:
                print(f"Adding tsEdit to saveEditClient at line {j+1}")
                lines[j] = lines[j].rstrip().rstrip(';') + " , tsEdit: Date.now()\n"
                break
        break

# 4. Proactive Sync: Add 'focus' triggered sync
for i in range(len(lines)):
    if "window.addEventListener('pagehide'" in lines[i]:
        print(f"Adding focus listener before line {i+1}")
        lines.insert(i, """window.addEventListener('focus', () => {
  if (GDrive._sessionLoaded && !GDrive.accessToken && GDrive._gisReady) {
    const savedEmail = localStorage.getItem('pp-gdrive-email');
    if (savedEmail) GDrive.tokenClient.requestAccessToken({ prompt: '', login_hint: savedEmail });
  }
  GDrive.scheduleSync?.();
});
""")
        break

# 5. Silent PDF Generation
start_idx = -1
end_idx = -1
for i in range(len(lines)):
    if "async function generateAndProcessPDF(withPhotos) {" in lines[i]:
        start_idx = i
    if start_idx != -1 and lines[i].strip() == "}" and (i - start_idx) > 10 and (i - start_idx) < 50:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    print(f"Replacing generateAndProcessPDF from line {start_idx+1} to {end_idx+1}")
    new_func = """async function generateAndProcessPDF(withPhotos) {
  try {
    toast('<svg class="ico" aria-hidden="true"><use href="#ico-loader"/></svg> Gerando PDF...');
    const orc = collectOrc();
    const { blob, fileName } = await _generatePDFBlob(orc, withPhotos);
    const file = new File([blob], fileName, { type: 'application/pdf' });
    
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ 
        files: [file], 
        title: 'Orçamento - ' + (orc.nome||'PintorPlus'), 
        text: 'Segue o orçamento solicitado.' 
      }).catch(err => { if(err.name !== 'AbortError') console.error('Erro share:', err); });
    } else {
      _downloadBlob(blob, fileName);
    }

    if (GDrive.accessToken) {
      (async () => {
        try {
          const folderId = await GDrive.getOrCreateFolder('Orçamentos');
          if (folderId) await GDrive.uploadFile(file, folderId);
        } catch (e) { console.error('Erro upload PDF automático:', e); }
      })();
    }
    homeTab('orcamentos');
  } catch (e) { 
    console.error('Erro PDF:', e); 
    toast('<svg class="ico" aria-hidden=\"true\"><use href=\"#ico-alert\"/></svg> Erro ao gerar PDF.'); 
  }
}
"""
    lines[start_idx:end_idx+1] = [new_func]

# 6. Legacy PDF Fix: Normalize orc.pgto in genPDFHtml
for i in range(len(lines)):
    if "const pgtoArr = Array.isArray(orc.pgto) ? orc.pgto" in lines[i]:
        print(f"Normalizing orc.pgto at line {i+1}")
        lines[i] = lines[i].replace("const pgtoArr = Array.isArray(orc.pgto) ? orc.pgto : (typeof orc.pgto === \"string\" ? [orc.pgto] : []);", 
                                    "const rawP = orc.pgto; const pgtoArr = Array.isArray(rawP) ? rawP : (typeof rawP === 'string' ? [rawP] : []);")

with open('/home/engine/project/app.html', 'w') as f:
    f.writelines(lines)
