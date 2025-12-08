const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse env vars
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        envVars[match[1].trim()] = value;
    }
});

console.log('=== DEBUG AUTH ===\n');
console.log('USER1_ID:', envVars.USER1_ID);
console.log('USER1_HASH:', envVars.USER1_HASH);
console.log('USER1_HASH length:', envVars.USER1_HASH?.length);
console.log('');

// Test password
const password = '#AdGrades@3009#Chandan';
console.log('Testing password:', password);

if (envVars.USER1_HASH) {
    bcrypt.compare(password, envVars.USER1_HASH).then(result => {
        console.log('Password match:', result);

        if (!result) {
            console.log('\n--- Generating fresh hash ---');
            bcrypt.hash(password, 10).then(newHash => {
                console.log('Fresh hash:', newHash);
                console.log('\nUpdating .env file...');

                // Update the env file
                let newContent = envContent.replace(
                    /USER1_HASH=.*/,
                    `USER1_HASH="${newHash}"`
                );
                fs.writeFileSync(envPath, newContent);
                console.log('Done! Restart the dev server.');
            });
        }
    });
} else {
    console.log('ERROR: USER1_HASH not found in .env');
}
