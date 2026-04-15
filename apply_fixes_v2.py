import sys

file_path = '/home/engine/project/app.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix PDF Rendering logic
old_pdf_logic = """  // Aguarda imagens carregarem para evitar PDF em branco
  const images = wrapper.querySelectorAll('img');
  const imgPromises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
  });
  await Promise.all(imgPromises);
  // Pequeno delay adicional para garantir renderização de estilos
  await new Promise(r => setTimeout(r, 100));"""

new_pdf_logic = """  // Aguarda imagens e fontes carregarem para evitar PDF em branco
  const images = wrapper.querySelectorAll('img');
  const imgPromises = Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
  });
  if (document.fonts) imgPromises.push(document.fonts.ready);
  await Promise.all(imgPromises);

  // Delay adicional para garantir renderização completa (especialmente em mobile)
  await new Promise(r => setTimeout(r, 450));"""

if old_pdf_logic in content:
    content = content.replace(old_pdf_logic, new_pdf_logic)
    print("Fixed PDF Rendering logic")
else:
    print("Could not find old PDF Rendering logic")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
