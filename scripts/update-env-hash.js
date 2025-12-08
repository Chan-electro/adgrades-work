const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// Read the current .env file
let content = fs.readFileSync(envPath, 'utf8');

// New hash for password: #AdGrades@3009#Chandan
const newHash = '$2b$10$A7Y52WNhyO5QJOdr9bIWB9QO1NFW6O9Xa7N3qk2mjMyO';

// Replace USER1_HASH (handles both quoted and unquoted formats)
content = content.replace(/USER1_HASH=.*$/m, `USER1_HASH="${newHash}"`);

// Write back
fs.writeFileSync(envPath, content);

console.log('✅ Updated USER1_HASH successfully!');
console.log('New hash:', newHash);
console.log('\nPlease restart your dev server (Ctrl+C, then npm run dev)');
