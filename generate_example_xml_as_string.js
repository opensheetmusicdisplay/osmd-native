const fs = require('fs');
const filePath = 'Beethoven_AnDieFerneGeliebte.xml';
const js = fs.readFileSync(filePath, 'utf-8');
const output = 'export const beethoven_geliebte = ' + JSON.stringify(js) + ';';
fs.writeFileSync('./src/assets/beethoven_geliebte.ts', output);
