import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [
            clientCount,
            invoiceCount,
            activeAgreementCount, // Mocking active agreements logic for now if status field doesn't exist on all
            outstandingInvoicesCount,
            recentClients,
            recentInvoices
        ] = await Promise.all([
            prisma.client.count(),
            prisma.invoice.count(),
            prisma.agreement.count({ where: { status: 'Signed' } }),
            prisma.invoice.count({ where: { status: { not: 'paid' } } }),
            prisma.client.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
            prisma.invoice.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { client: true } })
        ]);

        // Combine recent items for activity feed
        const activities = [
            ...recentClients.map(c => ({
                id: `client-${c.id}`,
                text: `New client "${c.name}" added`,
                time: new Date(c.createdAt),
                type: 'info'
            })),
            ...recentInvoices.map(i => ({
                id: `invoice-${i.id}`,
                text: `Invoice #${i.invoiceNumber} generated for ${i.client?.name || 'Client'}`,
                time: new Date(i.createdAt),
                type: 'success'
            }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

        // Format relative time
        const formattedActivities = activities.map(act => {
            const diff = Date.now() - act.time.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            let timeStr = 'Just now';
            if (days > 0) timeStr = `${days}d ago`;
            else if (hours > 0) timeStr = `${hours}h ago`;

            return { ...act, time: timeStr };
        });

        return NextResponse.json({
            stats: {
                totalClients: clientCount,
                activeAgreements: activeAgreementCount,
                outstandingInvoices: outstandingInvoicesCount
            },
            activities: formattedActivities
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
