const fs = require('fs');
const filePath = './assets/AbideWithMe.mxl';
const str = fs.readFileSync(filePath, 'base64');
const output = 'export const abide = ' + JSON.stringify(str) + ';';
fs.writeFileSync('./assets/abide.ts', output);
