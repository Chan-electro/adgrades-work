import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { invoiceId, amount, type, transactionId } = body;

        if (!amount || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                invoiceId: invoiceId || null,
                amount: parseFloat(amount),
                type,
                transactionId: transactionId || null,
            }
        });

        // If linked to an invoice, update invoice status
        if (invoiceId) {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'paid' }
            });
        }

        return NextResponse.json({ success: true, payment });
    } catch (error) {
        console.error('Payment error:', error);
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const payments = await prisma.payment.findMany({
            orderBy: { date: 'desc' },
            include: { invoice: true }
        });
        return NextResponse.json(payments);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}
