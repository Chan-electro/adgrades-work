import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const packages = await prisma.createdPackage.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(packages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, description, price, services } = body;

        const newPackage = await prisma.createdPackage.create({
            data: {
                name,
                description,
                price,
                services: JSON.stringify(services) // Ensure it's stored as string
            }
        });

        return NextResponse.json(newPackage);
    } catch (error) {
        console.error('Error creating package:', error);
        return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
    }
}
