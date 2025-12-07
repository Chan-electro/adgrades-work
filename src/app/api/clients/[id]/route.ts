import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const client = await prisma.client.findUnique({
            where: { id },
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Check if client exists
        const client = await prisma.client.findUnique({
            where: { id },
        });

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Delete all related data in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete related documents
            await tx.document.deleteMany({
                where: { clientId: id },
            });

            // Delete related research docs
            await tx.researchDoc.deleteMany({
                where: { clientId: id },
            });

            // Delete related agreements
            await tx.agreement.deleteMany({
                where: { clientId: id },
            });

            // Delete payments related to invoices of this client
            const invoices = await tx.invoice.findMany({
                where: { clientId: id },
                select: { id: true },
            });
            const invoiceIds = invoices.map(inv => inv.id);

            if (invoiceIds.length > 0) {
                await tx.payment.deleteMany({
                    where: { invoiceId: { in: invoiceIds } },
                });
            }

            // Delete related invoices
            await tx.invoice.deleteMany({
                where: { clientId: id },
            });

            // Finally delete the client
            await tx.client.delete({
                where: { id },
            });
        });

        return NextResponse.json({ success: true, message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }
}

