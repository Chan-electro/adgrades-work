import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma instance is exported from here

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');

        const where = query
            ? {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                    { contactPerson: { contains: query } },
                ],
            }
            : {};

        const clients = await (prisma as any).client.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, industry, website, address, contactPerson, email, phone } = body;

        if (!name) {
            return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
        }

        const client = await (prisma as any).client.create({
            data: {
                name,
                industry,
                website,
                address,
                contactPerson,
                email,
                phone,
            },
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}
