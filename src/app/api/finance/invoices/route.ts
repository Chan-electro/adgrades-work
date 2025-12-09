import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_INVOICES } from '@/lib/mock-data';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    try {
        const invoices = await prisma.invoice.findMany({
            where: clientId ? { clientId } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { transactions: true, client: true }
        });
        return NextResponse.json(invoices);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        // Body is empty, proceed to seed check
    }

    if (body && body.invoiceNumber) {
        try {
            const data: any = {
                invoiceNumber: body.invoiceNumber,
                amount: parseFloat(body.amount),
                currency: body.currency || 'INR',
                status: body.status || 'draft',
                dueDate: new Date(body.dueDate),
                clientId: body.clientId || null,
                clientName: body.clientName,
                clientAddress: body.clientAddress,
                items: body.items ? JSON.stringify(body.items) : null,
                taxRate: parseFloat(body.taxRate || '0'),
                discount: parseFloat(body.discount || '0'),
                notes: body.notes,
            };

            const invoice = await prisma.invoice.create({ data });
            return NextResponse.json(invoice);
        } catch (error) {
            console.error('Failed to create invoice:', error);
            return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
        }
    }

    // Seed logic
    try {
        const count = await prisma.invoice.count();
        if (count > 0) {
            return NextResponse.json({ message: 'Invoices already seeded' });
        }

        for (const inv of MOCK_INVOICES) {
            await prisma.invoice.create({
                data: {
                    clientId: inv.clientId,
                    amount: inv.amount,
                    currency: inv.currency,
                    status: inv.status,
                    invoiceNumber: inv.invoiceNumber,
                    dueDate: new Date(inv.dueDate),
                    createdAt: new Date(inv.createdAt),
                }
            });
        }
        return NextResponse.json({ success: true, message: 'Invoices seeded' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed invoices' }, { status: 500 });
    }
}
