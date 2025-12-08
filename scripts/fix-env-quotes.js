const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let content = fs.readFileSync(envPath, 'utf8');

// Remove quotes from USER*_HASH values
content = content.replace(/USER(\d)_HASH="([^"]+)"/g, 'USER$1_HASH=$2');

fs.writeFileSync(envPath, content);
console.log('Removed quotes from USER*_HASH values in .env');

// Show the result
const lines = content.split(/\r?\n/).filter(l => l.startsWith('USER1'));
console.log('Updated values:');
lines.forEach(l => console.log(l));
