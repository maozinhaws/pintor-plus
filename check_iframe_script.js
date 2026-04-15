const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
const match = content.match(/<script>([\s\S]*?)<\/script>/i); // This might find the first one
// Actually I want the one starting near 1668
const scripts = content.split('<script>');
// Line 1668 is in the second script tag? No, grep said 1668.
// Let's find it by line number.
let currentLine = 1;
for (let i = 0; i < scripts.length; i++) {
    const scriptWithEnd = scripts[i].split('</script>')[0];
    if (currentLine <= 1668 && currentLine + scripts[i].split('\n').length > 1668) {
        console.log('Checking script starting near line', currentLine);
        try {
            // Unescape HTML entities because it's inside data-srcdoc
            const unescaped = scriptWithEnd.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            // Replace placeholders to avoid syntax error
            const fixed = unescaped.replace(/%%NOME_SUGESTOES%%/g, '[]').replace(/%%OBS_SERVICOS%%/g, '[]').replace(/%%OBS_MATERIAIS%%/g, '[]');
            new Function(fixed);
            console.log('Valid!');
        } catch (e) {
            console.log('Invalid:', e.message);
            console.log(scriptWithEnd.substring(0, 100));
        }
    }
    currentLine += scripts[i].split('\n').length;
}
