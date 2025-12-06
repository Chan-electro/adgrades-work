import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path: pathParts } = await params;
        const filePath = path.join(process.cwd(), 'storage', ...pathParts);

        if (!existsSync(filePath)) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        // Security: Ensure we're only serving from storage directory
        const resolvedPath = path.resolve(filePath);
        const storageDir = path.resolve(process.cwd(), 'storage');
        if (!resolvedPath.startsWith(storageDir)) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        const fileBuffer = await readFile(filePath);

        // Ensure filename ends with .pdf
        let filename = pathParts[pathParts.length - 1];
        if (!filename.toLowerCase().endsWith('.pdf')) {
            filename += '.pdf';
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error serving document:', error);
        return NextResponse.json(
            { error: 'Failed to serve document' },
            { status: 500 }
        );
    }
}
