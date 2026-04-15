const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
let balance = 0;
const lines = content.split('\n');
let lastZeroBalanceLine = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') balance++;
        else if (char === '}') balance--;
    }
    if (balance === 0) {
        lastZeroBalanceLine = i + 1;
    }
}
console.log('Final balance:', balance);
console.log('Last line with zero balance:', lastZeroBalanceLine);
