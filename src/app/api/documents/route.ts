import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

// Storage directory relative to project root
const STORAGE_DIR = path.join(process.cwd(), 'storage');

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // "invoice" or "agreement"
        const fileName = formData.get('fileName') as string;
        const invoiceId = formData.get('invoiceId') as string | null;
        const agreementId = formData.get('agreementId') as string | null;
        const clientId = formData.get('clientId') as string | null;

        if (!file || !type || !fileName) {
            return NextResponse.json(
                { error: 'File, type, and fileName are required' },
                { status: 400 }
            );
        }

        // Create storage directories if they don't exist
        const typeDir = path.join(STORAGE_DIR, type === 'invoice' ? 'invoices' : 'agreements');
        if (!existsSync(typeDir)) {
            await mkdir(typeDir, { recursive: true });
        }

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const safeFileName = `${fileName.replace('.pdf', '')}_${timestamp}.pdf`;
        const filePath = path.join(typeDir, safeFileName);
        const relativePath = `storage/${type === 'invoice' ? 'invoices' : 'agreements'}/${safeFileName}`;

        await writeFile(filePath, buffer);

        // Save record to database
        const document = await (prisma as any).document.create({
            data: {
                type,
                fileName: safeFileName,
                filePath: relativePath,
                invoiceId: invoiceId || null,
                agreementId: agreementId || null,
                clientId: clientId || null,
            },
        });

        return NextResponse.json({
            success: true,
            document,
            message: `${type === 'invoice' ? 'Invoice' : 'Agreement'} PDF saved successfully`,
        });
    } catch (error) {
        console.error('Error saving document:', error);
        return NextResponse.json(
            { error: 'Failed to save document' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const clientId = searchParams.get('clientId');

        const where: any = {};
        if (type) where.type = type;
        if (clientId) where.clientId = clientId;

        const documents = await (prisma as any).document.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
