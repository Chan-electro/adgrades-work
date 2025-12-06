import { NextRequest, NextResponse } from 'next/server';
import { login, checkRateLimit } from '@/lib/auth';
import { verifyUser } from '@/lib/auth-node';

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    try {
        const { userId, password } = await request.json();

        if (!userId || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const isValid = await verifyUser(userId, password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        await login(userId);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
