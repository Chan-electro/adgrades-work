import bcrypt from 'bcrypt';

// Password Verification
// Note: USERS array is constructed at runtime to ensure env variables are read fresh
export async function verifyUser(id: string, password: string): Promise<boolean> {
    const USERS = [
        { id: process.env.USER1_ID, hash: process.env.USER1_HASH },
        { id: process.env.USER2_ID, hash: process.env.USER2_HASH },
        { id: process.env.USER3_ID, hash: process.env.USER3_HASH },
    ];

    const user = USERS.find((u) => u.id === id);
    if (!user || !user.hash) {
        return false;
    }

    return await bcrypt.compare(password, user.hash);
}
