const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('=== FULL DIAGNOSTIC ===\n');

// Find USER1 lines
const user1IdLine = envContent.split(/\r?\n/).find(l => l.startsWith('USER1_ID='));
const user1HashLine = envContent.split(/\r?\n/).find(l => l.startsWith('USER1_HASH='));

console.log('USER1_ID line:', user1IdLine);
console.log('USER1_HASH line:', user1HashLine);
console.log('');

// Extract values
const userId = user1IdLine?.split('=')[1]?.trim();
let hash = user1HashLine?.split('=')[1]?.trim();

// Remove quotes if present
if (hash?.startsWith('"') && hash?.endsWith('"')) {
    hash = hash.slice(1, -1);
}

console.log('Parsed USER1_ID:', userId);
console.log('Parsed USER1_HASH:', hash);
console.log('Hash length:', hash?.length);
console.log('');

// Check if hash is valid bcrypt format
const validBcrypt = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash);
console.log('Valid bcrypt format:', validBcrypt);
console.log('');

// Test password
const password = '#AdGrades@3009#Chandan';
console.log('Testing password:', password);

bcrypt.compare(password, hash).then(result => {
    console.log('Password match:', result);

    if (!result) {
        console.log('\n=== FIXING ===');
        bcrypt.hash(password, 10).then(newHash => {
            console.log('New hash:', newHash);
            console.log('New hash length:', newHash.length);

            // Update env file
            const newContent = envContent.replace(
                /USER1_HASH=.*/,
                `USER1_HASH="${newHash}"`
            );
            fs.writeFileSync(envPath, newContent);
            console.log('Updated .env file!');

            // Verify the new hash
            bcrypt.compare(password, newHash).then(verify => {
                console.log('Verify new hash:', verify);
                console.log('\n>>> RESTART THE DEV SERVER NOW <<<');
            });
        });
    }
}).catch(err => {
    console.log('Bcrypt error:', err.message);
    console.log('Hash might be invalid/corrupted');
});
