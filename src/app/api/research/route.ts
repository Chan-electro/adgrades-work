import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, title, content } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const researchDoc = await prisma.researchDoc.create({
            data: {
                clientId,
                title,
                content,
            },
        });

        return NextResponse.json(researchDoc, { status: 201 });
    } catch (error) {
        console.error('Error creating research doc:', error);
        return NextResponse.json({ error: 'Failed to create research doc' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
        }

        const docs = await prisma.researchDoc.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(docs);
    } catch (error) {
        console.error('Error fetching research docs:', error);
        return NextResponse.json({ error: 'Failed to fetch research docs' }, { status: 500 });
    }
}
