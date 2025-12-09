
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id } = await params;
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { client: true }
        });

        if (!invoice) {
            return new NextResponse("Invoice not found", { status: 404 });
        }

        return NextResponse.json(invoice);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id: invoiceId } = await params;
        const body = await req.json();
        const { quantity, price, discount, taxRate, notes, items, amount, dueDate, clientName, clientAddress, invoiceNumber } = body;

        // Ensure we don't accidentally wipe out required fields if not provided
        // But typically body will contain full invoice data for editor

        // Handle items stringification if needed, but assuming body.items is array, we might store as string or handled by frontend? 
        // Schema says `items` is String? (JSON).

        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                // clientName, clientAddress etc might be changeable
                clientName,
                clientAddress,
                dueDate: new Date(dueDate),
                amount,
                items: typeof items === 'string' ? items : JSON.stringify(items),
                taxRate,
                discount,
                notes,
                invoiceNumber
            }
        });

        return NextResponse.json(updatedInvoice);
    } catch (error) {
        console.error("Invoice update error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
