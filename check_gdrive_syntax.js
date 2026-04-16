
const fs = require('fs');
const content = fs.readFileSync('/home/engine/project/app.html', 'utf8');
const start = content.indexOf('const GDrive = {');
// Find the matching closing brace for GDrive
let balance = 0;
let end = -1;
for (let i = start; i < content.length; i++) {
    if (content[i] === '{') balance++;
    else if (content[i] === '}') balance--;
    if (balance === 0) {
        end = i + 1;
        break;
    }
}
const gdriveCode = content.substring(start, end);
fs.writeFileSync('gdrive_test.js', gdriveCode);
try {
    require('child_process').execSync('node -c gdrive_test.js');
    console.log('GDrive is OK');
} catch (e) {
    console.error('GDrive has errors:');
    console.error(e.stderr.toString());
}
