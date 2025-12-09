
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { invoiceId, amount, type, method, transactionId, description, personName, date } = body;

        if (!amount || !type || !method) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create transaction record
        const transaction = await prisma.transaction.create({
            data: {
                invoiceId: invoiceId || null,
                amount: parseFloat(amount),
                type, // INCOME or EXPENSE
                method,
                transactionId: transactionId || null,
                description: description || null,
                personName: personName || null,
                date: date ? new Date(date) : new Date(),
            }
        });

        // If linked to an invoice and it's an INCOME, update invoice status
        if (invoiceId && type === 'INCOME') {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'paid' }
            });
        }

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error('Transaction error:', error);
        return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, amount, type, method, transactionId, description, personName, date } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
        }

        // Check if already edited
        const existing = await prisma.transaction.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }
        if (existing.isEdited) {
            return NextResponse.json({ error: 'Transaction can only be edited once' }, { status: 403 });
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                amount: parseFloat(amount),
                type,
                method,
                transactionId: transactionId || null,
                description: description || null,
                personName: personName || null,
                date: date ? new Date(date) : existing.date,
                isEdited: true // Mark as edited
            }
        });

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { date: 'desc' },
            include: { invoice: true }
        });
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
