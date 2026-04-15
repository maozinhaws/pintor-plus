const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
let balance = 0;
let inString = false;
let stringChar = '';
let inTemplateLiteral = false;
let escaped = false;
const lines = content.split('\n');
let lastZeroLine = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (escaped) {
        escaped = false;
        continue;
    }
    if (char === '\\') {
        escaped = true;
        continue;
    }
    if (inTemplateLiteral) {
        if (char === '`') inTemplateLiteral = false;
        continue;
    }
    if (inString) {
        if (char === stringChar) inString = false;
        continue;
    }
    if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
        continue;
    }
    if (char === '`') {
        inTemplateLiteral = true;
        continue;
    }
    if (char === '{') balance++;
    else if (char === '}') balance--;
    
    if (char === '\n') {
        if (balance === 0) lastZeroLine = content.substring(0, i).split('\n').length;
    }
}
console.log('Final balance:', balance);
console.log('Last balanced line:', lastZeroLine);
