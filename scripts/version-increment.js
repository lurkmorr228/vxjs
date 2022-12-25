const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), { encoding: 'utf8' }));
const [major, minor, patch] = pkg.version.split('.');
pkg.version = `${major}.${minor}.${+patch + 1}`;
fs.writeFileSync(path.join(process.cwd(), 'package.json'), JSON.stringify(pkg, null, 2));
