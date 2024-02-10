const fs = require('fs');
const filePath = 'opensheetmusicdisplay.min.js';
const js = fs.readFileSync(filePath, 'utf-8');
const output = 'export const osmd_min_str = ' + JSON.stringify(js) + ';';
fs.writeFileSync('./src/assets/osmd_min.ts', output);
