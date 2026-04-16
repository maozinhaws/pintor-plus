
const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/g;
let match;
let i = 0;
while ((match = scriptRegex.exec(content)) !== null) {
    if (i === 5) {
        const scriptContent = match[1];
        const lines = scriptContent.split('\n');
        let balance = 0;
        for (let j = 0; j < lines.length; j++) {
            const line = lines[j];
            for (let k = 0; k < line.length; k++) {
                if (line[k] === '{') balance++;
                else if (line[k] === '}') balance--;
            }
            if (j + 2431 > 5835 && j + 2431 < 5845) {
                console.log(`Line ${j + 2431}: balance ${balance} | ${line}`);
            }
        }
        console.log(`Final balance: ${balance}`);
    }
    i++;
}
