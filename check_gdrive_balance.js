
const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
const lines = content.split('\n');
let balance = 0;
let inGDrive = false;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('const GDrive = {')) {
        inGDrive = true;
        console.log(`GDrive starts at line ${i+1}`);
    }
    if (inGDrive) {
        for (let j = 0; j < line.length; j++) {
            if (line[j] === '{') balance++;
            else if (line[j] === '}') balance--;
        }
        if (balance === 0) {
            console.log(`GDrive ends at line ${i+1}`);
            inGDrive = false;
        }
    }
}
