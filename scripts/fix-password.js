const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const password = '#AdGrades@3009#Chandan';

async function fix() {
    // Generate fresh hash
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated new hash:', hash);

    // Read current .env
    let content = fs.readFileSync(envPath, 'utf8');

    // Replace USER1_HASH line
    content = content.replace(/USER1_HASH=.*$/m, `USER1_HASH="${hash}"`);

    // Write back
    fs.writeFileSync(envPath, content);
    console.log('Updated .env file!');

    // Verify
    const match = await bcrypt.compare(password, hash);
    console.log('Verification test:', match ? 'PASS ✅' : 'FAIL ❌');

    console.log('\n>>> Restart the dev server now! <<<');
}

fix();
