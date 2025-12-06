import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const webhookUrl = process.env.N8N_WEBHOOK_PACKAGE;
    const body = await request.json();

    if (!webhookUrl) {
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return NextResponse.json(
            { status: 'placeholder', message: 'N8N_WEBHOOK_PACKAGE not set. Placeholder response.' },
            { status: 202 }
        );
    }

    try {
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to call n8n workflow' }, { status: 500 });
    }
}
