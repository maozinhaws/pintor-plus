
const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
let match;
let i = 0;
while ((match = scriptRegex.exec(content)) !== null) {
    const scriptContent = match[1];
    const filename = `test_script_${i}.js`;
    // If it's the one with placeholders, we need to replace them or it will fail
    let sanitizedContent = scriptContent
        .replace(/%%NOME_SUGESTOES%%/g, '[]')
        .replace(/%%OBS_SERVICOS%%/g, '[]')
        .replace(/%%OBS_MATERIAIS%%/g, '[]');
    
    // Also if it's the one with &amp;&amp; we should unescape it for the check
    // because it's inside an attribute (srcdoc)
    sanitizedContent = sanitizedContent
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

    fs.writeFileSync(filename, sanitizedContent);
    console.log(`Checking ${filename}...`);
    try {
        require('child_process').execSync(`node -c ${filename}`);
        console.log(`${filename} is OK`);
    } catch (e) {
        console.error(`${filename} has errors:`);
        console.error(e.stdout.toString());
        console.error(e.stderr.toString());
    }
    i++;
}
