import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get the latest invoice number
        const latestInvoice = await prisma.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { invoiceNumber: true },
        });

        let nextSequence = '0001';
        const currentYear = new Date().getFullYear().toString().slice(-2);
        const prefix = `AG-${currentYear}`;

        if (latestInvoice && latestInvoice.invoiceNumber) {
            const invoiceNumber = latestInvoice.invoiceNumber;

            // Try to parse the invoice number format: AG-YY####
            const match = invoiceNumber.match(/^AG-(\d{2})(\d{4})$/);

            if (match) {
                const invoiceYear = match[1];
                const sequenceNumber = parseInt(match[2], 10);

                if (invoiceYear === currentYear) {
                    // Same year, increment sequence
                    nextSequence = (sequenceNumber + 1).toString().padStart(4, '0');
                }
                // Different year, reset to 0001
            } else {
                // Try alternative formats
                // Format: AG-YYMM#### or just extract any trailing numbers
                const numberMatch = invoiceNumber.match(/(\d{4})$/);
                if (numberMatch) {
                    const sequenceNumber = parseInt(numberMatch[1], 10);
                    nextSequence = (sequenceNumber + 1).toString().padStart(4, '0');
                }
            }
        }

        const nextInvoiceNumber = `${prefix}${nextSequence}`;

        return NextResponse.json({
            nextNumber: nextInvoiceNumber,
            sequence: nextSequence,
            prefix: prefix,
        });
    } catch (error) {
        console.error('Error generating next invoice number:', error);
        return NextResponse.json({ error: 'Failed to generate invoice number' }, { status: 500 });
    }
}
