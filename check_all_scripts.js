const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
const scripts = content.split('<script>');
let currentLine = 1;
for (let i = 1; i < scripts.length; i++) {
    const scriptWithEnd = scripts[i].split('</script>')[0];
    const scriptStartLine = currentLine + scripts[i-1].split('\n').length;
    console.log('Checking script starting near line', scriptStartLine);
    try {
        let code = scriptWithEnd;
        if (code.includes('&quot;') || code.includes('&lt;')) {
            code = code.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }
        // Replace placeholders to avoid syntax error
        const fixed = code.replace(/%%NOME_SUGESTOES%%/g, '[]').replace(/%%OBS_SERVICOS%%/g, '[]').replace(/%%OBS_MATERIAIS%%/g, '[]');
        new Function(fixed);
        console.log('Valid!');
    } catch (e) {
        console.log('Invalid:', e.message);
        // console.log(scriptWithEnd.substring(0, 100));
    }
    currentLine += scripts[i-1].split('\n').length;
}
