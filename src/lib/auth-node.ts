import bcrypt from 'bcrypt';

// Helper to strip quotes from env values (Windows/dotenv can include them)
function cleanEnvValue(value: string | undefined): string | undefined {
    if (!value) return value;
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    return value;
}

// Password Verification
// Note: USERS array is constructed at runtime to ensure env variables are read fresh
export async function verifyUser(id: string, password: string): Promise<boolean> {
    const USERS = [
        { id: cleanEnvValue(process.env.USER1_ID), hash: cleanEnvValue(process.env.USER1_HASH) },
        { id: cleanEnvValue(process.env.USER2_ID), hash: cleanEnvValue(process.env.USER2_HASH) },
        { id: cleanEnvValue(process.env.USER3_ID), hash: cleanEnvValue(process.env.USER3_HASH) },
    ];

    // DEBUG: Log what we're checking
    console.log('=== AUTH DEBUG ===');
    console.log('Looking for user:', id);
    console.log('Raw USER1_ID:', process.env.USER1_ID);
    console.log('Raw USER1_HASH:', process.env.USER1_HASH);
    console.log('Cleaned users:', USERS.map(u => ({ id: u.id, hashLen: u.hash?.length })));

    const user = USERS.find((u) => u.id === id);
    if (!user || !user.hash) {
        console.log('User not found or no hash');
        return false;
    }

    console.log('Found user:', user.id);
    console.log('Hash from env (cleaned):', user.hash);
    console.log('Hash length:', user.hash.length);
    console.log('Hash starts with:', user.hash.substring(0, 10));

    try {
        const result = await bcrypt.compare(password, user.hash);
        console.log('Password match result:', result);
        console.log('=== END DEBUG ===');
        return result;
    } catch (error) {
        console.log('Bcrypt error:', error);
        console.log('=== END DEBUG (error) ===');
        return false;
    }
}

