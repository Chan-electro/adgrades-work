
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, content, status } = body;

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
        }

        const agreement = await prisma.agreement.create({
            data: {
                clientId,
                content: typeof content === 'string' ? content : JSON.stringify(content),
                status: status || 'Draft',
            },
        });

        return NextResponse.json(agreement);
    } catch (error) {
        console.error('Error creating agreement:', error);
        return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    try {
        const agreements = await prisma.agreement.findMany({
            where: clientId ? { clientId } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { client: true },
        });

        return NextResponse.json(agreements);
    } catch (error) {
        console.error('Error fetching agreements:', error);
        return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 });
    }
}
