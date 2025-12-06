import bcrypt from 'bcrypt';

const USERS = [
    { id: process.env.USER1_ID, hash: process.env.USER1_HASH },
    { id: process.env.USER2_ID, hash: process.env.USER2_HASH },
    { id: process.env.USER3_ID, hash: process.env.USER3_HASH },
];

// Password Verification
export async function verifyUser(id: string, password: string): Promise<boolean> {
    // In dev, if no hash is set, we might want to allow a default or warn.
    // The requirements say: "If any USER*_HASH is missing in dev, generate a secure random placeholder hash at boot only for dev and print a console warning"
    // But for simple verification logic:

    const user = USERS.find((u) => u.id === id);
    if (!user || !user.hash) return false;

    return await bcrypt.compare(password, user.hash);
}
