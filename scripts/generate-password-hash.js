#!/usr/bin/env node
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function generateHash() {
    rl.question('Enter password to hash: ', async (password) => {
        try {
            const hash = await bcrypt.hash(password, 10);
            console.log('\n=================================');
            console.log('Bcrypt Hash:');
            console.log(hash);
            console.log('=================================');
            console.log('\nCopy this hash to your .env file for USER*_HASH');
        } catch (error) {
            console.error('Error generating hash:', error);
        } finally {
            rl.close();
        }
    });
}

generateHash();
