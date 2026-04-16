
const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
let match;
let i = 0;
while ((match = scriptRegex.exec(content)) !== null) {
    const scriptContent = match[1];
    const startIndex = match.index;
    const lineNum = content.substring(0, startIndex).split('\n').length;
    let balance = 0;
    console.log(`Checking script starting at line ${lineNum}...`);
    for (let j = 0; j < scriptContent.length; j++) {
        if (scriptContent[j] === '{') balance++;
        else if (scriptContent[j] === '}') balance--;
        if (balance < 0) {
            console.error(`Script ${i} has negative balance at char ${j}`);
            // Show surrounding context
            console.error(scriptContent.substring(Math.max(0, j-20), Math.min(scriptContent.length, j+20)));
        }
    }
    console.log(`Script ${i} final balance: ${balance}`);
    i++;
}
